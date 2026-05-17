import { type ast, URLPath } from "@kubb/core";
import type { PluginClient } from "@kubb/plugin-client";
import type { ResolverTs } from "@kubb/plugin-ts";
import type { ResolverZod } from "@kubb/plugin-zod";
import { File, Function as JSXFunction } from "@kubb/renderer-jsx";
import type { KubbReactNode } from "@kubb/renderer-jsx/types";

type SchemaName = { name: string };

export type TypeSchemas = {
	response: SchemaName;
	request: SchemaName | undefined;
	errors: Array<SchemaName>;
};

export type ZodSchemas = {
	response: SchemaName;
	request: SchemaName | undefined;
};

export function resolveTypeSchemas(node: ast.OperationNode, tsResolver: ResolverTs): TypeSchemas {
	const responseName = tsResolver.resolveResponseName(node);
	const dataSchema = node.requestBody?.content?.[0]?.schema;

	const errorResponses = node.responses.filter((res) => {
		if (res.statusCode === "default") return false;
		const code = Number(res.statusCode);
		return Number.isFinite(code) && code >= 400;
	});

	return {
		response: { name: responseName },
		request: dataSchema ? { name: tsResolver.resolveDataName(node) } : undefined,
		errors: errorResponses.map((res) => ({
			name: tsResolver.resolveResponseStatusName(node, res.statusCode),
		})),
	};
}

export function resolveZodSchemas(node: ast.OperationNode, zodResolver: ResolverZod): ZodSchemas {
	const dataSchema = node.requestBody?.content?.[0]?.schema;
	return {
		response: { name: zodResolver.resolveResponseName(node) },
		request: dataSchema ? { name: zodResolver.resolveDataName(node) } : undefined,
	};
}

function getJSDocComments(node: ast.OperationNode): string[] {
	const comments: string[] = [];
	if (node.summary) comments.push(`@summary ${node.summary}`);
	if (node.description) comments.push(`@description ${node.description}`);
	if (node.deprecated) comments.push("@deprecated");
	comments.push(`@link ${node.path}`);
	return comments;
}

type PathParam = { name: string; original: string; type: string; optional: boolean };

function getPathParams(
	node: ast.OperationNode,
	paramsCasing: PluginClient["resolvedOptions"]["paramsCasing"],
): PathParam[] {
	const path = node.parameters.filter((p) => p.in === "path");
	return path.map((p) => ({
		name: paramsCasing === "camelcase" ? toCamelCase(p.name) : p.name,
		original: p.name,
		type: schemaTypeAnnotation(p.schema),
		optional: !p.required,
	}));
}

function getQueryParams(
	node: ast.OperationNode,
	paramsCasing: PluginClient["resolvedOptions"]["paramsCasing"],
): PathParam[] {
	const query = node.parameters.filter((p) => p.in === "query");
	return query.map((p) => ({
		name: paramsCasing === "camelcase" ? toCamelCase(p.name) : p.name,
		original: p.name,
		type: schemaTypeAnnotation(p.schema),
		optional: !p.required,
	}));
}

function getHeaderParams(
	node: ast.OperationNode,
	paramsCasing: PluginClient["resolvedOptions"]["paramsCasing"],
): PathParam[] {
	const headers = node.parameters.filter((p) => p.in === "header");
	return headers.map((p) => ({
		name: paramsCasing === "camelcase" ? toCamelCase(p.name) : p.name,
		original: p.name,
		type: schemaTypeAnnotation(p.schema),
		optional: !p.required,
	}));
}

function toCamelCase(name: string): string {
	return name.replace(/[-_\s]+(.)?/g, (_, ch?: string) => (ch ? ch.toUpperCase() : ""));
}

function schemaTypeAnnotation(schema: ast.SchemaNode | undefined): string {
	if (!schema) return "unknown";
	switch (schema.type) {
		case "string":
		case "date":
		case "datetime":
		case "uuid":
		case "email":
		case "url":
		case "ipv4":
		case "ipv6":
		case "time":
			return "string";
		case "number":
		case "integer":
			return "number";
		case "bigint":
			return "bigint";
		case "boolean":
			return "boolean";
		case "null":
			return "null";
		case "array": {
			const arr = schema as ast.ArraySchemaNode;
			const item = arr.items?.[0];
			return `Array<${schemaTypeAnnotation(item)}>`;
		}
		case "enum": {
			const en = schema as ast.EnumSchemaNode;
			const values: Array<string | number | boolean | null> = en.namedEnumValues
				? en.namedEnumValues.map((v) => v.value)
				: (en.enumValues ?? []);
			return (
				values.map((v) => (typeof v === "string" ? JSON.stringify(v) : String(v))).join(" | ") ||
				"string"
			);
		}
		default:
			return "unknown";
	}
}

function buildParamObjectType(params: PathParam[], allOptional: boolean): string {
	if (params.length === 0) return "Record<string, never>";
	const entries = params.map((p) => {
		const optional = allOptional || p.optional ? "?" : "";
		return `${JSON.stringify(p.name)}${optional}: ${p.type}`;
	});
	return `{ ${entries.join("; ")} }`;
}

type Props = {
	name: string;
	urlName: string;
	baseURL: string | undefined;
	paramsCasing: PluginClient["resolvedOptions"]["paramsCasing"];
	parser: PluginClient["resolvedOptions"]["parser"] | undefined;
	node: ast.OperationNode;
	typeSchemas: TypeSchemas;
	zodSchemas: ZodSchemas | undefined;
};

export function ClientOperation({
	name,
	urlName,
	baseURL,
	paramsCasing,
	parser,
	node,
	typeSchemas,
	zodSchemas,
}: Props): KubbReactNode {
	void URLPath;
	const pathParams = getPathParams(node, paramsCasing);
	const queryParams = getQueryParams(node, paramsCasing);
	const headerParams = getHeaderParams(node, paramsCasing);

	const requestBodyContent = node.requestBody?.content?.[0];
	const contentType = requestBodyContent?.contentType ?? "application/json";
	const isFormData = contentType === "multipart/form-data";
	const hasBody = Boolean(typeSchemas.request);

	const pathParamsType = buildParamObjectType(pathParams, false);
	const queryParamsType = buildParamObjectType(queryParams, true);
	const headerParamsType = buildParamObjectType(headerParams, true);
	const bodyType = typeSchemas.request?.name;

	const fields: string[] = [];
	if (pathParams.length > 0) {
		fields.push(`pathParams: ${pathParamsType}`);
	}
	if (hasBody && bodyType) {
		const required = node.requestBody?.required;
		fields.push(`body${required ? "" : "?"}: ${bodyType}`);
	}
	if (queryParams.length > 0) {
		fields.push(`queryParams?: ${queryParamsType}`);
	}
	if (headerParams.length > 0) {
		fields.push(`headers?: ${headerParamsType}`);
	}
	fields.push("config?: Partial<FetcherConfig> & { client?: typeof defaultClient }");

	const paramsSignature = `{ ${fields
		.map((f) => f.split(":")[0]!.replace(/\?$/, "").trim())
		.join(", ")} }: { ${fields.join("; ")} } = {} as any`;

	const errorType =
		typeSchemas.errors.length > 0
			? `ErrorWrapper<${typeSchemas.errors.map((e) => e.name).join(" | ")}>`
			: "ErrorWrapper<Error>";

	const generics = [
		typeSchemas.response.name,
		errorType,
		bodyType ?? "null",
		headerParams.length > 0 ? headerParamsType : "Record<string, string>",
		queryParams.length > 0 ? queryParamsType : "Record<string, string>",
		pathParams.length > 0 ? pathParamsType : "Record<string, string>",
	];

	const requiresPathParamChecks = pathParams
		.filter((p) => !p.optional)
		.map(
			(p) => `if (!pathParams.${p.name}) {
\t\tthrow new Error(\`Missing required path parameter: ${p.name}\`);
\t}`,
		)
		.join("\n\n");

	const headerEntries: string[] = [];
	if (contentType !== "application/json") {
		headerEntries.push(`'Content-Type': '${contentType}'`);
	}
	if (headerParams.length > 0) headerEntries.push("...headers");
	headerEntries.push("...requestConfig.headers");

	const formDataBlock =
		isFormData && bodyType
			? `\tconst formData = new FormData();
\tif (body) {
\t\tObject.keys(body).forEach((key) => {
\t\t\tconst value = (body as Record<string, unknown>)[key];
\t\t\tif (typeof key === "string" && (typeof value === "string" || (value as Blob) instanceof Blob)) {
\t\t\t\tformData.append(key, value as unknown as string);
\t\t\t}
\t\t});
\t}\n`
			: "";

	const bodyExpression = hasBody
		? parser === "zod" && zodSchemas?.request
			? `${zodSchemas.request.name}.parse(${isFormData ? "formData" : "body"})`
			: isFormData
				? "formData"
				: "body"
		: undefined;

	const urlTemplate = node.path.replace(/\{([^}]+)\}/g, (_, raw: string) => {
		const cased = paramsCasing === "camelcase" ? toCamelCase(raw) : raw;
		return `\${pathParams.${cased}}`;
	});

	const clientCallParts: string[] = [
		`method: ${JSON.stringify(node.method.toUpperCase())}`,
		`url: \`${urlTemplate}\``,
	];
	if (baseURL && !urlName) clientCallParts.push(`baseUrl: ${JSON.stringify(baseURL)}`);
	if (queryParams.length > 0) clientCallParts.push("queryParams");
	if (bodyExpression !== undefined) clientCallParts.push(`body: ${bodyExpression}`);
	clientCallParts.push("...requestConfig");
	clientCallParts.push(`headers: { ${headerEntries.join(", ")} }`);

	const callArgs = `{\n\t\t${clientCallParts.join(",\n\t\t")},\n\t}`;

	const responseReturn =
		parser === "zod" && zodSchemas
			? `return ${zodSchemas.response.name}.parse(data);`
			: "return data;";

	const body = `\tconst { client: request = defaultClient, ...requestConfig } = config ?? {};

${requiresPathParamChecks ? `\t${requiresPathParamChecks}\n` : ""}${formDataBlock}\tconst data = await request<${generics.join(", ")}>(${callArgs});

\t${responseReturn}`;

	return (
		<File.Source name={name} isExportable isIndexable>
			<JSXFunction
				name={name}
				async
				export
				params={paramsSignature}
				JSDoc={{ comments: getJSDocComments(node) }}
			>
				{body}
			</JSXFunction>
		</File.Source>
	);
}
