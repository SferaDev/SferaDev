import type { ResolverTs } from "@kubb/plugin-ts";
import { File, Function as JSXFunction, type KubbReactNode } from "kubb/jsx";
import type { ast } from "kubb/kit";

type SchemaName = { name: string };

export type TypeSchemas = {
	response: SchemaName;
	request: SchemaName | undefined;
	errors: Array<SchemaName>;
};

export function resolveTypeSchemas(
	node: ast.HttpOperationNode,
	tsResolver: ResolverTs,
): TypeSchemas {
	const dataSchema = node.requestBody?.content?.[0]?.schema;

	const errorResponses = node.responses.filter((res) => {
		if (res.statusCode === "default") return false;
		const code = Number(res.statusCode);
		return Number.isFinite(code) && code >= 400;
	});

	return {
		response: { name: tsResolver.response.response(node) },
		request: dataSchema ? { name: tsResolver.response.body(node) } : undefined,
		errors: errorResponses.map((res) => ({
			name: tsResolver.response.status(node, res.statusCode),
		})),
	};
}

function getJSDocComments(node: ast.HttpOperationNode): string[] {
	const comments: string[] = [];
	if (node.summary) comments.push(`@summary ${node.summary}`);
	if (node.description) comments.push(`@description ${node.description}`);
	if (node.deprecated) comments.push("@deprecated");
	comments.push(`@link ${node.path}`);
	return comments;
}

type Param = { name: string; type: string; optional: boolean };

function paramsAt(node: ast.HttpOperationNode, where: "path" | "query" | "header"): Param[] {
	return node.parameters
		.filter((param) => param.in === where)
		.map((param) => ({
			name: param.name,
			type: schemaTypeAnnotation(param.schema),
			optional: !param.required,
		}));
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

function buildParamObjectType(params: Param[], allOptional: boolean): string {
	if (params.length === 0) return "Record<string, never>";
	const entries = params.map((p) => {
		const optional = allOptional || p.optional ? "?" : "";
		return `${JSON.stringify(p.name)}${optional}: ${p.type}`;
	});
	return `{ ${entries.join("; ")} }`;
}

type Props = {
	name: string;
	node: ast.HttpOperationNode;
	typeSchemas: TypeSchemas;
};

export function ClientOperation({ name, node, typeSchemas }: Props): KubbReactNode {
	const pathParams = paramsAt(node, "path");
	const queryParams = paramsAt(node, "query");
	const headerParams = paramsAt(node, "header");

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

	const bodyExpression = hasBody ? (isFormData ? "formData" : "body") : undefined;

	const urlTemplate = node.path.replace(
		/\{([^}]+)\}/g,
		(_, raw: string) => `\${pathParams.${raw}}`,
	);

	const clientCallParts: string[] = [
		`method: ${JSON.stringify(node.method.toUpperCase())}`,
		`url: \`${urlTemplate}\``,
	];
	if (queryParams.length > 0) clientCallParts.push("queryParams");
	if (bodyExpression !== undefined) clientCallParts.push(`body: ${bodyExpression}`);
	clientCallParts.push("...requestConfig");
	clientCallParts.push(`headers: { ${headerEntries.join(", ")} }`);

	const callArgs = `{\n\t\t${clientCallParts.join(",\n\t\t")},\n\t}`;

	const body = `\tconst { client: request = defaultClient, ...requestConfig } = config ?? {};

${requiresPathParamChecks ? `\t${requiresPathParamChecks}\n` : ""}${formDataBlock}\tconst data = await request<${generics.join(", ")}>(${callArgs});

\treturn data;`;

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
