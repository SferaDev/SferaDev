/**
 * Auth strategies for forwarding credentials to the upstream API.
 * This is separate from MCP OAuth (which governs access TO the MCP server).
 */

export type ApiKeyLocation = "header" | "query";

export interface ApiKeyAuth {
	type: "apiKey";
	name: string;
	location: ApiKeyLocation;
	value: string;
}

export interface BearerTokenAuth {
	type: "bearer";
	token: string;
}

export interface PassthroughAuth {
	type: "passthrough";
}

export interface NoAuth {
	type: "none";
}

export type UpstreamAuth = ApiKeyAuth | BearerTokenAuth | PassthroughAuth | NoAuth;

/**
 * Build request headers/params for the upstream API based on the auth strategy.
 */
export function buildAuthHeaders(
	auth: UpstreamAuth,
	incomingAuthorization?: string,
): Record<string, string> {
	switch (auth.type) {
		case "apiKey":
			if (auth.location === "header") {
				return { [auth.name]: auth.value };
			}
			return {};
		case "bearer":
			return { Authorization: `Bearer ${auth.token}` };
		case "passthrough":
			return incomingAuthorization ? { Authorization: incomingAuthorization } : {};
		case "none":
			return {};
	}
}

export function buildAuthQueryParams(auth: UpstreamAuth): Record<string, string> {
	if (auth.type === "apiKey" && auth.location === "query") {
		return { [auth.name]: auth.value };
	}
	return {};
}
