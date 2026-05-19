#!/usr/bin/env node
/**
 * openapi-mcp CLI
 *
 * Usage:
 *   openapi-mcp --spec <path-or-url> [options]
 *
 * Options:
 *   --spec <path|url>           Path or URL to OpenAPI spec (required)
 *   --base-url <url>            Override the server base URL from the spec
 *   --transport <stdio|http>    Transport mode (default: stdio)
 *   --port <number>             HTTP port (default: 3000, http transport only)
 *
 *   Upstream API auth (how the MCP server authenticates to the upstream API):
 *   --auth-type <type>          none | apiKey | bearer | passthrough (default: none)
 *   --auth-apikey <value>       API key value (apiKey type)
 *   --auth-apikey-name <name>   API key header/query name (default: X-Api-Key)
 *   --auth-apikey-in <loc>      header | query (default: header)
 *   --auth-bearer <token>       Static bearer token (bearer type)
 *
 *   MCP server OAuth protection (clients must present a valid token):
 *   --oauth-issuer <url>        OAuth issuer URL for verifying incoming tokens
 *   --oauth-jwks-uri <url>      JWKS URI for token verification (if different from issuer)
 *   --oauth-scopes <s1,s2>      Required scopes (comma-separated)
 *
 *   Tool filtering:
 *   --tags <t1,t2>              Only expose operations with these tags (comma-separated)
 *   --include <op1,op2>         Only expose these operationIds (comma-separated)
 *   --exclude <op1,op2>         Exclude these operationIds (comma-separated)
 */

import { parseArgs } from "node:util";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { UpstreamAuth } from "./auth";
import type { Transport } from "./server";
import { createMcpServer } from "./server";
import { loadSpec } from "./spec";

async function main() {
	const { values: rawValues } = parseArgs({
		options: {
			spec: { type: "string" },
			"base-url": { type: "string" },
			transport: { type: "string" },
			port: { type: "string" },
			"auth-type": { type: "string" },
			"auth-apikey": { type: "string" },
			"auth-apikey-name": { type: "string" },
			"auth-apikey-in": { type: "string" },
			"auth-bearer": { type: "string" },
			"oauth-issuer": { type: "string" },
			"oauth-jwks-uri": { type: "string" },
			"oauth-scopes": { type: "string" },
			tags: { type: "string" },
			include: { type: "string" },
			exclude: { type: "string" },
			help: { type: "boolean", short: "h" },
		},
		allowPositionals: true,
		strict: false,
	});
	// Narrow string option values (strict:false widens to string|true)
	const values: Record<string, string | boolean | undefined> = rawValues as Record<
		string,
		string | boolean | undefined
	>;

	if (values.help) {
		printHelp();
		process.exit(0);
	}

	const specPath = values.spec as string | undefined;
	if (!specPath) {
		console.error("Error: --spec is required");
		printHelp();
		process.exit(1);
	}

	const transport = (values.transport ?? "stdio") as Transport;
	const port = values.port ? Number.parseInt(values.port as string, 10) : 3000;

	// Build upstream auth strategy
	const upstreamAuth = buildUpstreamAuth(values);

	// Build MCP OAuth verifier if configured
	const oauthVerifier = await buildOAuthVerifier(values);
	const oauthScopesRaw = values["oauth-scopes"] as string | undefined;
	const requiredScopes = oauthScopesRaw
		? oauthScopesRaw.split(",").map((s: string) => s.trim())
		: undefined;

	// Parse filter options
	const tagsRaw = values.tags as string | undefined;
	const tags = tagsRaw ? tagsRaw.split(",").map((t: string) => t.trim()) : undefined;
	const includeRaw = values.include as string | undefined;
	const includeOperations = includeRaw
		? includeRaw.split(",").map((o: string) => o.trim())
		: undefined;
	const excludeRaw = values.exclude as string | undefined;
	const excludeOperations = excludeRaw
		? excludeRaw.split(",").map((o: string) => o.trim())
		: undefined;

	if (transport !== "stdio") {
		console.error(`Loading spec from: ${specPath}`);
	}

	const spec = await loadSpec(specPath);

	const { registeredTools } = await createMcpServer({
		spec,
		baseUrl: values["base-url"] as string | undefined,
		transport,
		port,
		upstreamAuth,
		tags,
		includeOperations,
		excludeOperations,
		oauthVerifier,
		requiredScopes,
		oauthIssuerUrl: values["oauth-issuer"] as string | undefined,
	});

	if (transport !== "stdio") {
		console.error(`Registered ${registeredTools.length} tools from spec`);
	}
}

function buildUpstreamAuth(values: Record<string, string | boolean | undefined>): UpstreamAuth {
	const authType = (values["auth-type"] as string | undefined) ?? "none";

	switch (authType) {
		case "apiKey": {
			const value = values["auth-apikey"] as string | undefined;
			if (!value) {
				console.error("Error: --auth-apikey is required when --auth-type=apiKey");
				process.exit(1);
			}
			return {
				type: "apiKey",
				name: (values["auth-apikey-name"] as string | undefined) ?? "X-Api-Key",
				location: ((values["auth-apikey-in"] as string | undefined) ?? "header") as
					| "header"
					| "query",
				value,
			};
		}
		case "bearer": {
			const token = values["auth-bearer"] as string | undefined;
			if (!token) {
				console.error("Error: --auth-bearer is required when --auth-type=bearer");
				process.exit(1);
			}
			return { type: "bearer", token };
		}
		case "passthrough":
			return { type: "passthrough" };
		default:
			return { type: "none" };
	}
}

async function buildOAuthVerifier(
	values: Record<string, string | boolean | undefined>,
): Promise<OAuthTokenVerifier | undefined> {
	const issuerUrl = values["oauth-issuer"] as string | undefined;
	const jwksUri = values["oauth-jwks-uri"] as string | undefined;

	if (!issuerUrl) return undefined;

	// Dynamically load jose for JWT verification only when needed
	// This keeps the package lean for non-OAuth use cases
	try {
		const { createRemoteJWKSet, jwtVerify } = await import("jose");

		const jwksUrl = jwksUri ?? (await discoverJwksUri(issuerUrl));
		const jwks = createRemoteJWKSet(new URL(jwksUrl));

		const verifier: OAuthTokenVerifier = {
			verifyAccessToken: async (token: string): Promise<AuthInfo> => {
				const { payload } = await jwtVerify(token, jwks, {
					issuer: issuerUrl,
				});
				return {
					token,
					clientId: (payload.client_id as string) ?? payload.sub ?? "unknown",
					scopes: Array.isArray(payload.scope)
						? payload.scope
						: typeof payload.scope === "string"
							? payload.scope.split(" ")
							: [],
					expiresAt: payload.exp,
				};
			},
		};
		return verifier;
	} catch (error) {
		if (
			(error as { code?: string }).code === "MODULE_NOT_FOUND" ||
			(error as { code?: string }).code === "ERR_MODULE_NOT_FOUND"
		) {
			console.error(
				"Error: OAuth verification requires the `jose` package. Install it with:\n  npm install jose",
			);
			process.exit(1);
		}
		throw error;
	}
}

async function discoverJwksUri(issuerUrl: string): Promise<string> {
	const metaUrl = `${issuerUrl.replace(/\/$/, "")}/.well-known/openid-configuration`;
	try {
		const res = await fetch(metaUrl, { signal: AbortSignal.timeout(10_000) });
		if (res.ok) {
			const meta = (await res.json()) as Record<string, unknown>;
			if (typeof meta.jwks_uri === "string") return meta.jwks_uri;
		}
	} catch {
		// fall through
	}
	// Fallback: try oauth-authorization-server metadata
	const oauthMeta = `${issuerUrl.replace(/\/$/, "")}/.well-known/oauth-authorization-server`;
	const res = await fetch(oauthMeta, { signal: AbortSignal.timeout(10_000) });
	if (!res.ok) {
		throw new Error(
			`Cannot discover JWKS URI from ${issuerUrl}. Pass --oauth-jwks-uri explicitly.`,
		);
	}
	const meta = (await res.json()) as Record<string, unknown>;
	if (typeof meta.jwks_uri !== "string") {
		throw new Error(
			`No jwks_uri in OAuth metadata at ${oauthMeta}. Pass --oauth-jwks-uri explicitly.`,
		);
	}
	return meta.jwks_uri;
}

function printHelp() {
	console.error(`
openapi-mcp — Turn any OpenAPI spec into an MCP server

Usage:
  openapi-mcp --spec <path-or-url> [options]

Required:
  --spec <path|url>             Path or URL to an OpenAPI 3.x spec (JSON or YAML)

Transport:
  --transport <stdio|http>      Transport mode (default: stdio)
  --port <number>               HTTP port (default: 3000)

Base URL:
  --base-url <url>              Override the server base URL defined in the spec

Upstream API auth (credentials the MCP server uses when calling the API):
  --auth-type <type>            none | apiKey | bearer | passthrough (default: none)
  --auth-apikey <value>         API key value
  --auth-apikey-name <name>     Header or query param name (default: X-Api-Key)
  --auth-apikey-in <loc>        header | query (default: header)
  --auth-bearer <token>         Static bearer token

MCP server OAuth protection (require callers to present a token):
  --oauth-issuer <url>          OAuth issuer URL (enables token verification)
  --oauth-jwks-uri <url>        Override JWKS URI (auto-discovered from issuer by default)
  --oauth-scopes <s1,s2>        Comma-separated required scopes

Tool filtering:
  --tags <t1,t2>                Only expose operations with these tags
  --include <op1,op2>           Only expose these operationIds
  --exclude <op1,op2>           Exclude these operationIds

Examples:
  # Stdio transport (for Claude Desktop)
  openapi-mcp --spec ./openapi.yaml --auth-type apiKey --auth-apikey sk-123

  # HTTP transport with OAuth protection
  openapi-mcp --spec https://api.example.com/openapi.json \\
    --transport http --port 8080 \\
    --oauth-issuer https://auth.example.com \\
    --auth-type bearer --auth-bearer sk-upstream-token

  # Filter to specific tags only
  openapi-mcp --spec ./openapi.yaml --tags users,billing
`);
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : String(err));
	process.exit(1);
});
