import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import type { UpstreamAuth } from "./auth";
import { extractOperations, getBaseUrl } from "./spec";
import { registerTools } from "./tools";

export type Transport = "stdio" | "http";

export interface McpServerOptions {
	/** OpenAPI spec document (already loaded) */
	spec: OpenAPIObject;
	/** Base URL to call upstream API (overrides server URL in spec) */
	baseUrl?: string;
	/** Transport mode */
	transport?: Transport;
	/** HTTP port (only relevant for http transport) */
	port?: number;
	/** Auth strategy for upstream API calls */
	upstreamAuth?: UpstreamAuth;
	/** Filter: only expose operations with these tags */
	tags?: string[];
	/** Explicitly include only these operationIds */
	includeOperations?: string[];
	/** Explicitly exclude these operationIds */
	excludeOperations?: string[];
	/**
	 * OAuth token verifier for protecting the MCP server itself.
	 * If provided, all HTTP requests must carry a valid Bearer token.
	 */
	oauthVerifier?: OAuthTokenVerifier;
	/**
	 * Required OAuth scopes for MCP server access.
	 */
	requiredScopes?: string[];
	/**
	 * OAuth issuer URL — used to build the .well-known discovery metadata.
	 */
	oauthIssuerUrl?: string;
}

export async function createMcpServer(options: McpServerOptions) {
	const {
		spec,
		baseUrl: overrideBaseUrl,
		transport = "stdio",
		port = 3000,
		upstreamAuth = { type: "none" },
		tags,
		includeOperations,
		excludeOperations,
		oauthVerifier,
		requiredScopes,
		oauthIssuerUrl,
	} = options;

	const info = spec.info;
	const baseUrl = overrideBaseUrl ?? getBaseUrl(spec);
	if (!baseUrl) {
		throw new Error(
			"No base URL found in spec and none provided. Pass --base-url or add a server URL to the spec.",
		);
	}

	const server = new McpServer({
		name: info?.title ?? "OpenAPI MCP Server",
		version: info?.version ?? "1.0.0",
	});

	const operations = extractOperations(spec);
	const registeredTools = registerTools({
		server,
		operations,
		baseUrl,
		auth: upstreamAuth,
		tags,
		includeOperations,
		excludeOperations,
	});

	if (transport === "stdio") {
		const stdioTransport = new StdioServerTransport();
		await server.connect(stdioTransport);
		return { server, registeredTools };
	}

	// Stateless streamable HTTP transport — one instance handles all requests
	const httpTransport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined, // stateless mode
	});
	await server.connect(httpTransport);

	const serverBaseUrl = `http://localhost:${port}`;
	const mcpPath = "/mcp";

	const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
		const url = req.url ?? "/";

		// Handle OAuth discovery endpoints when a verifier is configured
		if (oauthVerifier) {
			if (url === "/.well-known/oauth-protected-resource") {
				sendJson(res, 200, {
					resource: serverBaseUrl,
					authorization_servers: oauthIssuerUrl ? [oauthIssuerUrl] : [],
					bearer_methods_supported: ["header"],
				});
				return;
			}
		}

		// Health check
		if (url === "/health" && req.method === "GET") {
			sendJson(res, 200, { status: "ok", tools: registeredTools.length });
			return;
		}

		// MCP endpoint
		if (url === mcpPath || url.startsWith(`${mcpPath}?`) || url.startsWith(`${mcpPath}/`)) {
			// OAuth bearer token verification
			if (oauthVerifier) {
				const authResult = await verifyBearerToken(req, oauthVerifier, requiredScopes);
				if (!authResult.ok) {
					const wwwAuth = [
						'Bearer error="invalid_token"',
						oauthIssuerUrl
							? `, resource_metadata="${serverBaseUrl}/.well-known/oauth-protected-resource"`
							: "",
					].join("");
					res.writeHead(401, {
						"WWW-Authenticate": wwwAuth,
						"Content-Type": "application/json",
					});
					res.end(JSON.stringify({ error: authResult.error }));
					return;
				}
				// Attach auth info to the request for the transport
				(req as IncomingMessage & { auth?: AuthInfo }).auth = authResult.authInfo;
			}

			// Parse body for POST requests
			let parsedBody: unknown;
			if (req.method === "POST") {
				parsedBody = await readJsonBody(req);
			}

			await httpTransport.handleRequest(req, res, parsedBody);
			return;
		}

		// 404
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Not found" }));
	});

	await new Promise<void>((resolve) => {
		httpServer.listen(port, () => {
			console.error(`MCP server running on ${serverBaseUrl}${mcpPath}`);
			resolve();
		});
	});

	return { server, registeredTools };
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
	const body = JSON.stringify(data);
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(body),
	});
	res.end(body);
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		req.on("data", (chunk: Buffer) => chunks.push(chunk));
		req.on("end", () => {
			const raw = Buffer.concat(chunks).toString("utf-8");
			if (!raw) {
				resolve(undefined);
				return;
			}
			try {
				resolve(JSON.parse(raw));
			} catch {
				resolve(raw);
			}
		});
		req.on("error", reject);
	});
}

interface BearerVerifyResult {
	ok: true;
	authInfo: AuthInfo;
}
interface BearerVerifyError {
	ok: false;
	error: string;
}

async function verifyBearerToken(
	req: IncomingMessage,
	verifier: OAuthTokenVerifier,
	requiredScopes?: string[],
): Promise<BearerVerifyResult | BearerVerifyError> {
	const authHeader = req.headers.authorization ?? "";
	if (!authHeader.toLowerCase().startsWith("bearer ")) {
		return { ok: false, error: "Missing or invalid Authorization header" };
	}
	const token = authHeader.slice(7).trim();
	try {
		const authInfo = await verifier.verifyAccessToken(token);
		if (requiredScopes && requiredScopes.length > 0) {
			const missing = requiredScopes.filter((s) => !authInfo.scopes.includes(s));
			if (missing.length > 0) {
				return { ok: false, error: `Missing required scopes: ${missing.join(", ")}` };
			}
		}
		return { ok: true, authInfo };
	} catch (err) {
		return {
			ok: false,
			error: `Token verification failed: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

export type { McpServer };
