// @ts-nocheck

import * as z from "zod";

export const chatDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the chat."),
		object: z.enum(["chat"]).describe("Fixed value identifying this object as a chat."),
		shareable: z.boolean().describe("Indicates whether the chat can be shared via public link."),
		privacy: z
			.enum(["private", "public", "team", "team-edit", "unlisted"])
			.describe("Defines the visibility of the chat—private, team-only, or public."),
		name: z.string().optional().describe("An optional name assigned to the chat by the user."),
		title: z
			.string()
			.optional()
			.describe("Deprecated title field preserved for backward compatibility."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the chat was created."),
		updatedAt: z.string().optional().describe("The ISO timestamp of the last update to the chat."),
		favorite: z.boolean().describe("Indicates whether the chat is marked as a favorite."),
		authorId: z.string().describe("The ID of the user who created the chat."),
		projectId: z
			.string()
			.optional()
			.describe("Optional ID of the v0 project associated with this chat."),
		vercelProjectId: z
			.string()
			.optional()
			.describe("Optional ID of the linked Vercel project, if connected."),
		webUrl: z.string().describe("Web URL to view this chat in the browser."),
		apiUrl: z.string().describe("API URL to access this chat via the API."),
		latestVersion: z
			.object({
				id: z.string().describe("A unique identifier for the version."),
				object: z.enum(["version"]).describe("Fixed value identifying this object as a version."),
				status: z
					.enum(["completed", "failed", "pending"])
					.describe("The current status of the version generation process."),
				demoUrl: z
					.string()
					.optional()
					.describe("Optional URL for previewing the generated output."),
				screenshotUrl: z
					.string()
					.optional()
					.describe("URL to retrieve a screenshot of this version."),
				createdAt: z.iso
					.datetime()
					.describe("The date and time when the version was created, in ISO 8601 format."),
				updatedAt: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the version was last updated, in ISO 8601 format."),
				files: z
					.array(
						z
							.object({
								object: z.enum(["file"]).describe("Fixed value identifying this object as a file."),
								name: z.string().describe("The name of the file, including its extension."),
								content: z.string().describe("The full contents of the file as a raw string."),
								locked: z
									.boolean()
									.describe(
										"Whether the file is locked to prevent AI from overwriting it during new version generation.",
									),
							})
							.strict(),
					)
					.describe("A list of files that were generated or included in this version."),
			})
			.strict()
			.optional()
			.describe("Full details of the most recent generated version, if available."),
		url: z.string().describe("The canonical URL to access this chat."),
		messages: z
			.array(
				z
					.object({
						id: z.string().describe("A unique identifier for the message."),
						object: z
							.enum(["message"])
							.describe("Fixed value identifying this object as a message."),
						content: z.string().describe("The main text content of the message."),
						experimentalContent: z
							.array(
								z.union([
									z.tuple([z.enum([0]), z.array(z.string())]),
									z.tuple([
										z.enum([1]),
										z
											.object({
												toJSONSchema: z.string(),
												def: z.string(),
												type: z.string(),
												check: z.string(),
												with: z.string(),
												clone: z.string(),
												brand: z.string(),
												register: z.string(),
												parse: z.string(),
												safeParse: z.string(),
												parseAsync: z.string(),
												safeParseAsync: z.string(),
												spa: z.string(),
												encode: z.string(),
												decode: z.string(),
												encodeAsync: z.string(),
												decodeAsync: z.string(),
												safeEncode: z.string(),
												safeDecode: z.string(),
												safeEncodeAsync: z.string(),
												safeDecodeAsync: z.string(),
												refine: z.string(),
												superRefine: z.string(),
												overwrite: z.string(),
												optional: z.string(),
												exactOptional: z.string(),
												nullable: z.string(),
												nullish: z.string(),
												nonoptional: z.string(),
												array: z.string(),
												or: z.string(),
												and: z.string(),
												transform: z.string(),
												default: z.string(),
												prefault: z.string(),
												catch: z.string(),
												pipe: z.string(),
												readonly: z.string(),
												describe: z.string(),
												meta: z.string(),
												isOptional: z.string(),
												isNullable: z.string(),
												apply: z.string(),
												keyof: z.string(),
												catchall: z.string(),
												passthrough: z.string(),
												loose: z.string(),
												strict: z.string(),
												strip: z.string(),
												extend: z.string(),
												safeExtend: z.string(),
												merge: z.string(),
												pick: z.string(),
												omit: z.string(),
												partial: z.string(),
												required: z.string(),
											})
											.strict(),
									]),
								]),
							)
							.optional()
							.describe(
								"The parsed content of the message as an array structure containing AST nodes. This is an experimental field that may change.",
							),
						createdAt: z
							.string()
							.describe("The ISO timestamp representing when the message was created."),
						updatedAt: z.iso
							.datetime()
							.optional()
							.describe("The ISO timestamp representing when the message was last updated."),
						type: z
							.enum([
								"added-environment-variables",
								"added-integration",
								"answered-questions",
								"auto-fix-with-v0",
								"cloned-repo",
								"deleted-file",
								"design-mode",
								"edited-file",
								"fix-cve",
								"fix-with-v0",
								"forked-block",
								"forked-chat",
								"manual-commit",
								"message",
								"moved-file",
								"open-in-v0",
								"pull-changes",
								"refinement",
								"renamed-file",
								"replace-src",
								"reverted-block",
								"sync-git",
							])
							.describe(
								"Indicates the format or category of the message, such as plain text or code.",
							),
						role: z
							.enum(["assistant", "user"])
							.describe("Specifies whether the message was sent by the user or the assistant."),
						finishReason: z
							.enum(["content-filter", "error", "length", "other", "stop", "tool-calls"])
							.optional()
							.describe("The reason why the message generation finished."),
						apiUrl: z.string().describe("API URL to access this message via the API."),
						authorId: z.null().describe("The ID of the user who sent the message."),
						parentId: z.null().optional().describe("The ID of the parent message."),
						attachments: z
							.array(
								z
									.object({
										url: z.string().describe("The URL where the attachment file can be accessed."),
										name: z
											.string()
											.optional()
											.describe("The original filename of the attachment."),
										contentType: z
											.string()
											.optional()
											.describe(
												"The MIME type of the attachment file (e.g., image/png, application/pdf).",
											),
										size: z.number().describe("The size of the attachment file in bytes."),
										content: z
											.string()
											.optional()
											.describe("The base64-encoded content of the attachment file, if available."),
										type: z
											.enum(["figma", "screenshot", "zip"])
											.optional()
											.describe("Optional v0-specific attachment type for enhanced processing."),
									})
									.strict(),
							)
							.optional(),
					})
					.strict(),
			)
			.describe("All messages exchanged in the chat, including user and assistant entries."),
		files: z
			.array(
				z
					.object({
						lang: z
							.string()
							.describe("Programming language used in the file (e.g., JavaScript, Python)."),
						meta: z
							.object({})
							.catchall(z.string())
							.describe("A key-value map of metadata associated with the file (e.g., path, type)."),
						source: z
							.string()
							.describe(
								"The origin or identifier of the file source (e.g., path or upload label).",
							),
					})
					.strict(),
			)
			.optional()
			.describe("Optional array of files associated with the chat context."),
		demo: z
			.string()
			.optional()
			.describe("Deprecated demo URL used for previewing the chat result."),
		text: z.string().describe("The main user prompt or instruction that started the chat."),
		modelConfiguration: z
			.object({
				modelId: z
					.enum([
						"v0-auto",
						"v0-max",
						"v0-max-fast",
						"v0-mini",
						"v0-opus-4.7",
						"v0-opus-4.7-fast",
						"v0-pro",
					])
					.optional()
					.default("v0-pro")
					.describe("Model to use for the generation."),
				imageGenerations: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enables image generations to generate up to 5 images per version."),
				thinking: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enables thinking to generate a response in multiple steps."),
			})
			.strict()
			.optional()
			.describe("The configuration used to generate responses in this chat."),
		permissions: z
			.object({
				write: z.boolean().describe("If true, the user has write access to the chat."),
			})
			.strict(),
		metadata: z
			.object({})
			.catchall(z.string())
			.describe("Arbitrary key-value data associated with this chat."),
	})
	.strict()
	.describe(
		"Detailed representation of a chat, including its messages, files, versions, and model configuration.",
	);

export const chatSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the chat."),
		object: z.enum(["chat"]).describe("Fixed value identifying this object as a chat."),
		shareable: z.boolean().describe("Indicates whether the chat can be shared via public link."),
		privacy: z
			.enum(["private", "public", "team", "team-edit", "unlisted"])
			.describe("Defines the visibility of the chat—private, team-only, or public."),
		name: z.string().optional().describe("An optional name assigned to the chat by the user."),
		title: z
			.string()
			.optional()
			.describe("Deprecated title field preserved for backward compatibility."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the chat was created."),
		updatedAt: z.string().optional().describe("The ISO timestamp of the last update to the chat."),
		favorite: z.boolean().describe("Indicates whether the chat is marked as a favorite."),
		authorId: z.string().describe("The ID of the user who created the chat."),
		projectId: z
			.string()
			.optional()
			.describe("Optional ID of the v0 project associated with this chat."),
		vercelProjectId: z
			.string()
			.optional()
			.describe("Optional ID of the linked Vercel project, if connected."),
		webUrl: z.string().describe("Web URL to view this chat in the browser."),
		apiUrl: z.string().describe("API URL to access this chat via the API."),
		latestVersion: z
			.object({
				id: z.string().describe("A unique identifier for the version."),
				object: z.enum(["version"]).describe("Fixed value identifying this object as a version."),
				status: z
					.enum(["completed", "failed", "pending"])
					.describe("The current status of the version generation process."),
				demoUrl: z
					.string()
					.optional()
					.describe("Optional URL for previewing the generated output."),
				screenshotUrl: z
					.string()
					.optional()
					.describe("URL to retrieve a screenshot of this version."),
				createdAt: z.iso
					.datetime()
					.describe("The date and time when the version was created, in ISO 8601 format."),
				updatedAt: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the version was last updated, in ISO 8601 format."),
			})
			.strict()
			.optional()
			.describe("The most recent generated version of the chat, if available."),
	})
	.strict()
	.describe(
		"Summary of a chat, including metadata like privacy, author, latest version, and URLs.",
	);

export const deploymentDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the deployment."),
		object: z.enum(["deployment"]).describe("Fixed value identifying this object as a deployment."),
		inspectorUrl: z.string().describe("URL to the deployment inspector."),
		chatId: z.string().describe("The ID of the chat that this deployment is scoped to."),
		projectId: z
			.string()
			.optional()
			.describe("The ID of the project that this deployment is scoped to."),
		versionId: z.string().describe("The ID of the version that this deployment is scoped to."),
		apiUrl: z
			.url()
			.describe("The API endpoint URL for accessing this deployment programmatically."),
		webUrl: z.url().describe("The web URL where the deployment can be viewed or managed."),
	})
	.strict();

export const deploymentSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the deployment."),
		object: z.enum(["deployment"]).describe("Fixed value identifying this object as a deployment."),
		inspectorUrl: z.string().describe("URL to the deployment inspector."),
		chatId: z.string().describe("The ID of the chat that this deployment is scoped to."),
		projectId: z
			.string()
			.optional()
			.describe("The ID of the project that this deployment is scoped to."),
		versionId: z.string().describe("The ID of the version that this deployment is scoped to."),
		apiUrl: z
			.url()
			.describe("The API endpoint URL for accessing this deployment programmatically."),
		webUrl: z.url().describe("The web URL where the deployment can be viewed or managed."),
	})
	.strict();

export const environmentVariableDetailSchemaSchema = z
	.object({
		id: z.string().describe("A unique identifier for the environment variable."),
		object: z.enum(["environment_variable"]).describe("The object type."),
		key: z.string().describe("The name of the environment variable."),
		value: z.string().describe("The value of the environment variable."),
		decrypted: z.boolean().describe("Whether the value is decrypted or encrypted."),
		createdAt: z.number().describe("The timestamp when the environment variable was created."),
		updatedAt: z
			.number()
			.optional()
			.describe("The timestamp when the environment variable was last updated."),
	})
	.strict()
	.describe("Detailed information for an environment variable including its value.");

export const environmentVariableSummarySchemaSchema = z
	.object({
		id: z.string().describe("A unique identifier for the environment variable."),
		object: z.enum(["environment_variable"]).describe("The object type."),
		key: z.string().describe("The name of the environment variable."),
		value: z.string().describe("The value of the environment variable."),
		decrypted: z.boolean().describe("Whether the value is decrypted or encrypted."),
		createdAt: z.number().describe("The timestamp when the environment variable was created."),
		updatedAt: z
			.number()
			.optional()
			.describe("The timestamp when the environment variable was last updated."),
	})
	.strict()
	.describe("Summary information for an environment variable.");

export const environmentVariablesListSchemaSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						id: z.string().describe("A unique identifier for the environment variable."),
						object: z.enum(["environment_variable"]).describe("The object type."),
						key: z.string().describe("The name of the environment variable."),
						value: z.string().describe("The value of the environment variable."),
						decrypted: z.boolean().describe("Whether the value is decrypted or encrypted."),
						createdAt: z
							.number()
							.describe("The timestamp when the environment variable was created."),
						updatedAt: z
							.number()
							.optional()
							.describe("The timestamp when the environment variable was last updated."),
					})
					.strict(),
			)
			.describe("Array of environment variable details."),
	})
	.strict()
	.describe("List response containing environment variables.");

export const fileDetailSchema = z
	.object({
		object: z.enum(["file"]).describe("Fixed value identifying this object as a file."),
		name: z.string().describe("The name of the file, including its extension."),
		content: z.string().describe("The full contents of the file as a raw string."),
		locked: z
			.boolean()
			.describe(
				"Whether the file is locked to prevent AI from overwriting it during new version generation.",
			),
	})
	.strict()
	.describe("Detailed representation of a file, including its content and lock status.");

export const fileSummarySchema = z
	.object({
		object: z.enum(["file"]).describe("Fixed value identifying this object as a file."),
		name: z.string().describe("The name of the file, including its extension."),
	})
	.strict()
	.describe("Basic metadata about a file, such as its type and name.");

export const hookDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the webhook."),
		object: z.enum(["hook"]).describe("Fixed value identifying this object as a webhook."),
		name: z.string().describe("A user-defined name to label the webhook."),
		events: z
			.array(
				z.enum([
					"chat.created",
					"chat.deleted",
					"chat.updated",
					"message.created",
					"message.deleted",
					"message.finished",
					"message.updated",
				]),
			)
			.describe("List of event types this webhook is subscribed to."),
		chatId: z
			.string()
			.optional()
			.describe("Optional ID of the chat that this webhook is scoped to."),
		url: z.string().describe("Target URL that receives event payloads for this webhook."),
	})
	.strict()
	.describe("Full configuration details for a webhook, including its scope and subscription.");

export const hookEventDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the webhook event log entry."),
		object: z
			.enum(["hook_event"])
			.describe("Fixed value identifying this object as a webhook event."),
		event: z
			.enum([
				"chat.created",
				"chat.deleted",
				"chat.updated",
				"message.created",
				"message.deleted",
				"message.finished",
				"message.updated",
			])
			.describe("The type of event that triggered the webhook."),
		status: z
			.enum(["error", "pending", "success"])
			.optional()
			.default("pending")
			.describe("The delivery status of the webhook (e.g., delivered, failed)."),
		createdAt: z.iso.datetime().describe("Timestamp of when the webhook event was triggered."),
	})
	.strict()
	.describe("Detailed record of a webhook event, including its type, status, and timestamp.");

export const hookSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the webhook."),
		object: z.enum(["hook"]).describe("Fixed value identifying this object as a webhook."),
		name: z.string().describe("A user-defined name to label the webhook."),
	})
	.strict()
	.describe("Summary of a webhook, including its ID and display name.");

export const integrationConnectionDetailSchemaSchema = z
	.object({
		object: z.enum(["integration_connection"]).describe("The object type."),
		id: z
			.string()
			.describe(
				"The unique ID of the integration connection (format: {projectId}_{integrationId}).",
			),
		connected: z.boolean().describe("Whether the integration is connected to the project."),
		integration: z
			.object({
				id: z.string().describe("The ID of the integration."),
				object: z.enum(["integration"]).describe("The object type."),
				slug: z.string().describe("The slug of the integration."),
				name: z.string().describe("The name of the integration."),
			})
			.strict()
			.describe("Information about the connected integration."),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Additional metadata about the integration connection."),
	})
	.strict()
	.describe("Detailed information about an integration connection to a project.");

export const integrationConnectionListSchemaSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						object: z.enum(["integration_connection"]).describe("The object type."),
						id: z
							.string()
							.describe(
								"The unique ID of the integration connection (format: {projectId}_{integrationId}).",
							),
						connected: z.boolean().describe("Whether the integration is connected to the project."),
						integration: z
							.object({
								id: z.string().describe("The ID of the integration."),
								object: z.enum(["integration"]).describe("The object type."),
								slug: z.string().describe("The slug of the integration."),
								name: z.string().describe("The name of the integration."),
							})
							.strict()
							.describe("Information about the connected integration."),
					})
					.strict(),
			)
			.describe("Array of integration connection summaries."),
	})
	.strict()
	.describe("List response containing integration connections.");

export const integrationConnectionSummarySchemaSchema = z
	.object({
		object: z.enum(["integration_connection"]).describe("The object type."),
		id: z
			.string()
			.describe(
				"The unique ID of the integration connection (format: {projectId}_{integrationId}).",
			),
		connected: z.boolean().describe("Whether the integration is connected to the project."),
		integration: z
			.object({
				id: z.string().describe("The ID of the integration."),
				object: z.enum(["integration"]).describe("The object type."),
				slug: z.string().describe("The slug of the integration."),
				name: z.string().describe("The name of the integration."),
			})
			.strict()
			.describe("Information about the connected integration."),
	})
	.strict()
	.describe("Summary information about an integration connection to a project.");

export const integrationDetailSchemaSchema = z
	.object({
		id: z.string().describe("The ID of the integration."),
		object: z.enum(["integration"]).describe("The object type."),
		slug: z.string().describe("The slug of the integration."),
		name: z.string().describe("The name of the integration."),
		description: z.string().describe("A short description of the integration."),
		iconUrl: z.string().describe("URL to the integration icon."),
	})
	.strict()
	.describe("Detailed information about an integration.");

export const integrationListSchemaSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						id: z.string().describe("The ID of the integration."),
						object: z.enum(["integration"]).describe("The object type."),
						slug: z.string().describe("The slug of the integration."),
						name: z.string().describe("The name of the integration."),
						description: z.string().describe("A short description of the integration."),
						iconUrl: z.string().describe("URL to the integration icon."),
					})
					.strict(),
			)
			.describe("Array of integration details."),
	})
	.strict()
	.describe("List of available integrations.");

export const integrationSummarySchemaSchema = z
	.object({
		id: z.string().describe("The ID of the integration."),
		object: z.enum(["integration"]).describe("The object type."),
		slug: z.string().describe("The slug of the integration."),
		name: z.string().describe("The name of the integration."),
	})
	.strict()
	.describe("Basic information about an integration.");

export const messageDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the message."),
		object: z.enum(["message"]).describe("Fixed value identifying this object as a message."),
		content: z.string().describe("The main text content of the message."),
		experimentalContent: z
			.array(
				z.union([
					z.tuple([z.enum([0]), z.array(z.string())]),
					z.tuple([
						z.enum([1]),
						z
							.object({
								toJSONSchema: z.string(),
								def: z.string(),
								type: z.string(),
								check: z.string(),
								with: z.string(),
								clone: z.string(),
								brand: z.string(),
								register: z.string(),
								parse: z.string(),
								safeParse: z.string(),
								parseAsync: z.string(),
								safeParseAsync: z.string(),
								spa: z.string(),
								encode: z.string(),
								decode: z.string(),
								encodeAsync: z.string(),
								decodeAsync: z.string(),
								safeEncode: z.string(),
								safeDecode: z.string(),
								safeEncodeAsync: z.string(),
								safeDecodeAsync: z.string(),
								refine: z.string(),
								superRefine: z.string(),
								overwrite: z.string(),
								optional: z.string(),
								exactOptional: z.string(),
								nullable: z.string(),
								nullish: z.string(),
								nonoptional: z.string(),
								array: z.string(),
								or: z.string(),
								and: z.string(),
								transform: z.string(),
								default: z.string(),
								prefault: z.string(),
								catch: z.string(),
								pipe: z.string(),
								readonly: z.string(),
								describe: z.string(),
								meta: z.string(),
								isOptional: z.string(),
								isNullable: z.string(),
								apply: z.string(),
								keyof: z.string(),
								catchall: z.string(),
								passthrough: z.string(),
								loose: z.string(),
								strict: z.string(),
								strip: z.string(),
								extend: z.string(),
								safeExtend: z.string(),
								merge: z.string(),
								pick: z.string(),
								omit: z.string(),
								partial: z.string(),
								required: z.string(),
							})
							.strict(),
					]),
				]),
			)
			.optional()
			.describe(
				"The parsed content of the message as an array structure containing AST nodes. This is an experimental field that may change.",
			),
		createdAt: z.string().describe("The ISO timestamp representing when the message was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp representing when the message was last updated."),
		type: z
			.enum([
				"added-environment-variables",
				"added-integration",
				"answered-questions",
				"auto-fix-with-v0",
				"cloned-repo",
				"deleted-file",
				"design-mode",
				"edited-file",
				"fix-cve",
				"fix-with-v0",
				"forked-block",
				"forked-chat",
				"manual-commit",
				"message",
				"moved-file",
				"open-in-v0",
				"pull-changes",
				"refinement",
				"renamed-file",
				"replace-src",
				"reverted-block",
				"sync-git",
			])
			.describe("Indicates the format or category of the message, such as plain text or code."),
		role: z
			.enum(["assistant", "user"])
			.describe("Specifies whether the message was sent by the user or the assistant."),
		finishReason: z
			.enum(["content-filter", "error", "length", "other", "stop", "tool-calls"])
			.optional()
			.describe("The reason why the message generation finished."),
		apiUrl: z.string().describe("API URL to access this message via the API."),
		authorId: z.null().describe("The ID of the user who sent the message."),
		parentId: z.null().optional().describe("The ID of the parent message."),
		attachments: z
			.array(
				z
					.object({
						url: z.string().describe("The URL where the attachment file can be accessed."),
						name: z.string().optional().describe("The original filename of the attachment."),
						contentType: z
							.string()
							.optional()
							.describe("The MIME type of the attachment file (e.g., image/png, application/pdf)."),
						size: z.number().describe("The size of the attachment file in bytes."),
						content: z
							.string()
							.optional()
							.describe("The base64-encoded content of the attachment file, if available."),
						type: z
							.enum(["figma", "screenshot", "zip"])
							.optional()
							.describe("Optional v0-specific attachment type for enhanced processing."),
					})
					.strict(),
			)
			.optional(),
		chatId: z.string().describe("The ID of the chat to which this message belongs."),
	})
	.strict()
	.describe("Detailed message object extending MessageSummary with chat metadata.");

export const messageSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the message."),
		object: z.enum(["message"]).describe("Fixed value identifying this object as a message."),
		content: z.string().describe("The main text content of the message."),
		experimentalContent: z
			.array(
				z.union([
					z.tuple([z.enum([0]), z.array(z.string())]),
					z.tuple([
						z.enum([1]),
						z
							.object({
								toJSONSchema: z.string(),
								def: z.string(),
								type: z.string(),
								check: z.string(),
								with: z.string(),
								clone: z.string(),
								brand: z.string(),
								register: z.string(),
								parse: z.string(),
								safeParse: z.string(),
								parseAsync: z.string(),
								safeParseAsync: z.string(),
								spa: z.string(),
								encode: z.string(),
								decode: z.string(),
								encodeAsync: z.string(),
								decodeAsync: z.string(),
								safeEncode: z.string(),
								safeDecode: z.string(),
								safeEncodeAsync: z.string(),
								safeDecodeAsync: z.string(),
								refine: z.string(),
								superRefine: z.string(),
								overwrite: z.string(),
								optional: z.string(),
								exactOptional: z.string(),
								nullable: z.string(),
								nullish: z.string(),
								nonoptional: z.string(),
								array: z.string(),
								or: z.string(),
								and: z.string(),
								transform: z.string(),
								default: z.string(),
								prefault: z.string(),
								catch: z.string(),
								pipe: z.string(),
								readonly: z.string(),
								describe: z.string(),
								meta: z.string(),
								isOptional: z.string(),
								isNullable: z.string(),
								apply: z.string(),
								keyof: z.string(),
								catchall: z.string(),
								passthrough: z.string(),
								loose: z.string(),
								strict: z.string(),
								strip: z.string(),
								extend: z.string(),
								safeExtend: z.string(),
								merge: z.string(),
								pick: z.string(),
								omit: z.string(),
								partial: z.string(),
								required: z.string(),
							})
							.strict(),
					]),
				]),
			)
			.optional()
			.describe(
				"The parsed content of the message as an array structure containing AST nodes. This is an experimental field that may change.",
			),
		createdAt: z.string().describe("The ISO timestamp representing when the message was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp representing when the message was last updated."),
		type: z
			.enum([
				"added-environment-variables",
				"added-integration",
				"answered-questions",
				"auto-fix-with-v0",
				"cloned-repo",
				"deleted-file",
				"design-mode",
				"edited-file",
				"fix-cve",
				"fix-with-v0",
				"forked-block",
				"forked-chat",
				"manual-commit",
				"message",
				"moved-file",
				"open-in-v0",
				"pull-changes",
				"refinement",
				"renamed-file",
				"replace-src",
				"reverted-block",
				"sync-git",
			])
			.describe("Indicates the format or category of the message, such as plain text or code."),
		role: z
			.enum(["assistant", "user"])
			.describe("Specifies whether the message was sent by the user or the assistant."),
		finishReason: z
			.enum(["content-filter", "error", "length", "other", "stop", "tool-calls"])
			.optional()
			.describe("The reason why the message generation finished."),
		apiUrl: z.string().describe("API URL to access this message via the API."),
		authorId: z.null().describe("The ID of the user who sent the message."),
		parentId: z.null().optional().describe("The ID of the parent message."),
		attachments: z
			.array(
				z
					.object({
						url: z.string().describe("The URL where the attachment file can be accessed."),
						name: z.string().optional().describe("The original filename of the attachment."),
						contentType: z
							.string()
							.optional()
							.describe("The MIME type of the attachment file (e.g., image/png, application/pdf)."),
						size: z.number().describe("The size of the attachment file in bytes."),
						content: z
							.string()
							.optional()
							.describe("The base64-encoded content of the attachment file, if available."),
						type: z
							.enum(["figma", "screenshot", "zip"])
							.optional()
							.describe("Optional v0-specific attachment type for enhanced processing."),
					})
					.strict(),
			)
			.optional(),
	})
	.strict()
	.describe(
		"Summary of a single message within a chat, including role, content, type, timestamp, and API URL.",
	);

export const messageSummaryListSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						id: z.string().describe("A unique identifier for the message."),
						object: z
							.enum(["message"])
							.describe("Fixed value identifying this object as a message."),
						content: z.string().describe("The main text content of the message."),
						experimentalContent: z
							.array(
								z.union([
									z.tuple([z.enum([0]), z.array(z.string())]),
									z.tuple([
										z.enum([1]),
										z
											.object({
												toJSONSchema: z.string(),
												def: z.string(),
												type: z.string(),
												check: z.string(),
												with: z.string(),
												clone: z.string(),
												brand: z.string(),
												register: z.string(),
												parse: z.string(),
												safeParse: z.string(),
												parseAsync: z.string(),
												safeParseAsync: z.string(),
												spa: z.string(),
												encode: z.string(),
												decode: z.string(),
												encodeAsync: z.string(),
												decodeAsync: z.string(),
												safeEncode: z.string(),
												safeDecode: z.string(),
												safeEncodeAsync: z.string(),
												safeDecodeAsync: z.string(),
												refine: z.string(),
												superRefine: z.string(),
												overwrite: z.string(),
												optional: z.string(),
												exactOptional: z.string(),
												nullable: z.string(),
												nullish: z.string(),
												nonoptional: z.string(),
												array: z.string(),
												or: z.string(),
												and: z.string(),
												transform: z.string(),
												default: z.string(),
												prefault: z.string(),
												catch: z.string(),
												pipe: z.string(),
												readonly: z.string(),
												describe: z.string(),
												meta: z.string(),
												isOptional: z.string(),
												isNullable: z.string(),
												apply: z.string(),
												keyof: z.string(),
												catchall: z.string(),
												passthrough: z.string(),
												loose: z.string(),
												strict: z.string(),
												strip: z.string(),
												extend: z.string(),
												safeExtend: z.string(),
												merge: z.string(),
												pick: z.string(),
												omit: z.string(),
												partial: z.string(),
												required: z.string(),
											})
											.strict(),
									]),
								]),
							)
							.optional()
							.describe(
								"The parsed content of the message as an array structure containing AST nodes. This is an experimental field that may change.",
							),
						createdAt: z
							.string()
							.describe("The ISO timestamp representing when the message was created."),
						updatedAt: z.iso
							.datetime()
							.optional()
							.describe("The ISO timestamp representing when the message was last updated."),
						type: z
							.enum([
								"added-environment-variables",
								"added-integration",
								"answered-questions",
								"auto-fix-with-v0",
								"cloned-repo",
								"deleted-file",
								"design-mode",
								"edited-file",
								"fix-cve",
								"fix-with-v0",
								"forked-block",
								"forked-chat",
								"manual-commit",
								"message",
								"moved-file",
								"open-in-v0",
								"pull-changes",
								"refinement",
								"renamed-file",
								"replace-src",
								"reverted-block",
								"sync-git",
							])
							.describe(
								"Indicates the format or category of the message, such as plain text or code.",
							),
						role: z
							.enum(["assistant", "user"])
							.describe("Specifies whether the message was sent by the user or the assistant."),
						finishReason: z
							.enum(["content-filter", "error", "length", "other", "stop", "tool-calls"])
							.optional()
							.describe("The reason why the message generation finished."),
						apiUrl: z.string().describe("API URL to access this message via the API."),
						authorId: z.null().describe("The ID of the user who sent the message."),
						parentId: z.null().optional().describe("The ID of the parent message."),
						attachments: z
							.array(
								z
									.object({
										url: z.string().describe("The URL where the attachment file can be accessed."),
										name: z
											.string()
											.optional()
											.describe("The original filename of the attachment."),
										contentType: z
											.string()
											.optional()
											.describe(
												"The MIME type of the attachment file (e.g., image/png, application/pdf).",
											),
										size: z.number().describe("The size of the attachment file in bytes."),
										content: z
											.string()
											.optional()
											.describe("The base64-encoded content of the attachment file, if available."),
										type: z
											.enum(["figma", "screenshot", "zip"])
											.optional()
											.describe("Optional v0-specific attachment type for enhanced processing."),
									})
									.strict(),
							)
							.optional(),
					})
					.strict(),
			)
			.describe("Array of message summaries in this page of results."),
		pagination: z
			.object({
				hasMore: z
					.boolean()
					.describe("Indicates if there are more results available beyond this page."),
				nextCursor: z.string().optional().describe("Cursor for fetching the next page of results."),
				nextUrl: z.string().optional().describe("API URL for retrieving the next page of results."),
			})
			.strict()
			.describe("Pagination metadata for navigating through multiple pages of results."),
	})
	.strict()
	.describe("List response containing multiple message summaries with cursor-based pagination.");

export const notificationPreferenceSchemaSchema = z
	.object({
		liveActivity: z.boolean().describe("Whether the user wants to receive live activities."),
		pushNotifications: z
			.boolean()
			.describe("Whether the user wants to receive push notifications."),
	})
	.strict()
	.describe("User preference for notification delivery methods.");

export const productDetailSchemaSchema = z
	.object({
		object: z.enum(["product"]).describe("The object type."),
		id: z.string().describe("The unique ID of the product."),
		slug: z.string().describe("The URL-friendly slug of the product."),
		name: z.string().describe("The name of the product."),
		description: z.string().describe("A short description of the product."),
		iconUrl: z.string().describe("URL to the product icon."),
		v0Availability: z
			.enum(["in-review", "published"])
			.optional()
			.describe(
				"The product's availability in v0. 'in-review' products only appear for teams with the review view and should be rendered as such.",
			),
		iconBackgroundColor: z.string().optional().describe("Background color for the product icon."),
	})
	.strict()
	.describe("Detailed information about a marketplace or store product.");

export const productListSchemaSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						object: z.enum(["product"]).describe("The object type."),
						id: z.string().describe("The unique ID of the product."),
						slug: z.string().describe("The URL-friendly slug of the product."),
						name: z.string().describe("The name of the product."),
						description: z.string().describe("A short description of the product."),
						iconUrl: z.string().describe("URL to the product icon."),
						v0Availability: z
							.enum(["in-review", "published"])
							.optional()
							.describe(
								"The product's availability in v0. 'in-review' products only appear for teams with the review view and should be rendered as such.",
							),
					})
					.strict(),
			)
			.describe("Array of product summaries."),
	})
	.strict()
	.describe("List of available marketplace and store products.");

export const productSummarySchemaSchema = z
	.object({
		object: z.enum(["product"]).describe("The object type."),
		id: z.string().describe("The unique ID of the product."),
		slug: z.string().describe("The URL-friendly slug of the product."),
		name: z.string().describe("The name of the product."),
		description: z.string().describe("A short description of the product."),
		iconUrl: z.string().describe("URL to the product icon."),
		v0Availability: z
			.enum(["in-review", "published"])
			.optional()
			.describe(
				"The product's availability in v0. 'in-review' products only appear for teams with the review view and should be rendered as such.",
			),
	})
	.strict()
	.describe("Summary information about a marketplace or store product.");

export const projectDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the project."),
		object: z.enum(["project"]).describe("Fixed value identifying this object as a project."),
		name: z.string().describe("The name of the project as defined by the user."),
		privacy: z
			.enum(["private", "team"])
			.describe("The privacy setting for the project - either private or team."),
		vercelProjectId: z
			.string()
			.optional()
			.describe("Optional ID of the linked Vercel project, if connected."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the project was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp of the most recent update, if available."),
		apiUrl: z.url().describe("The API endpoint URL for accessing this project programmatically."),
		webUrl: z.url().describe("The web URL where the project can be viewed or managed."),
		description: z.string().optional().describe("The description of the project."),
		instructions: z.string().optional().describe("The instructions for the project."),
		chats: z
			.array(
				z
					.object({
						id: z.string().describe("A unique identifier for the chat."),
						object: z.enum(["chat"]).describe("Fixed value identifying this object as a chat."),
						shareable: z
							.boolean()
							.describe("Indicates whether the chat can be shared via public link."),
						privacy: z
							.enum(["private", "public", "team", "team-edit", "unlisted"])
							.describe("Defines the visibility of the chat—private, team-only, or public."),
						name: z
							.string()
							.optional()
							.describe("An optional name assigned to the chat by the user."),
						title: z
							.string()
							.optional()
							.describe("Deprecated title field preserved for backward compatibility."),
						createdAt: z.iso
							.datetime()
							.describe("The ISO timestamp representing when the chat was created."),
						updatedAt: z
							.string()
							.optional()
							.describe("The ISO timestamp of the last update to the chat."),
						favorite: z.boolean().describe("Indicates whether the chat is marked as a favorite."),
						authorId: z.string().describe("The ID of the user who created the chat."),
						projectId: z
							.string()
							.optional()
							.describe("Optional ID of the v0 project associated with this chat."),
						vercelProjectId: z
							.string()
							.optional()
							.describe("Optional ID of the linked Vercel project, if connected."),
						webUrl: z.string().describe("Web URL to view this chat in the browser."),
						apiUrl: z.string().describe("API URL to access this chat via the API."),
						latestVersion: z
							.object({
								id: z.string().describe("A unique identifier for the version."),
								object: z
									.enum(["version"])
									.describe("Fixed value identifying this object as a version."),
								status: z
									.enum(["completed", "failed", "pending"])
									.describe("The current status of the version generation process."),
								demoUrl: z
									.string()
									.optional()
									.describe("Optional URL for previewing the generated output."),
								screenshotUrl: z
									.string()
									.optional()
									.describe("URL to retrieve a screenshot of this version."),
								createdAt: z.iso
									.datetime()
									.describe("The date and time when the version was created, in ISO 8601 format."),
								updatedAt: z.iso
									.datetime()
									.optional()
									.describe(
										"The date and time when the version was last updated, in ISO 8601 format.",
									),
							})
							.strict()
							.optional()
							.describe("The most recent generated version of the chat, if available."),
					})
					.strict(),
			)
			.describe("List of all chats that are associated with this project."),
	})
	.strict()
	.describe("Full representation of a project, including its associated chats.");

export const projectSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the project."),
		object: z.enum(["project"]).describe("Fixed value identifying this object as a project."),
		name: z.string().describe("The name of the project as defined by the user."),
		privacy: z
			.enum(["private", "team"])
			.describe("The privacy setting for the project - either private or team."),
		vercelProjectId: z
			.string()
			.optional()
			.describe("Optional ID of the linked Vercel project, if connected."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the project was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp of the most recent update, if available."),
		apiUrl: z.url().describe("The API endpoint URL for accessing this project programmatically."),
		webUrl: z.url().describe("The web URL where the project can be viewed or managed."),
	})
	.strict()
	.describe("Summary of a project, including metadata, timestamps, and optional Vercel linkage.");

export const scopeSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the scope (e.g., user or team workspace)."),
		object: z.enum(["scope"]).describe("Fixed value identifying this object as a scope."),
		name: z.string().optional().describe("An optional human-readable name for the scope."),
	})
	.strict()
	.describe("Basic information about a workspace or identity context for projects and chats.");

export const searchResultItemSchema = z
	.object({
		id: z.string().describe("The unique ID of the item returned in the search result."),
		object: z
			.enum(["chat", "project"])
			.describe("Type of item returned, either 'chat' or 'project'."),
		name: z.string().describe("The display name of the item."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the item was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp of the last update to the item."),
		apiUrl: z.string().describe("API endpoint for accessing the item programmatically."),
		webUrl: z.string().describe("Web URL for viewing the item in the interface."),
	})
	.strict()
	.describe(
		"Generic result returned from a search query, representing either a chat or a project.",
	);

export const userDetailSchemaSchema = z
	.object({
		id: z.string().describe("A unique identifier for the user."),
		object: z.enum(["user"]).describe("Fixed value identifying this object as a user."),
		name: z.string().optional().describe("Optional full name of the user."),
		email: z.string().describe("The user's email address."),
		avatar: z.string().describe("URL to the user's avatar image."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the user was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp of the last update to the user."),
	})
	.strict();

export const userPreferencesPostResponseSchemaSchema = z
	.object({
		object: z.enum(["user_preferences"]).describe("Object type identifier."),
		preferences: z
			.union([
				z
					.object({
						notifications: z
							.object({
								liveActivity: z
									.boolean()
									.describe("Whether the user wants to receive live activities."),
								pushNotifications: z
									.boolean()
									.describe("Whether the user wants to receive push notifications."),
							})
							.strict()
							.describe("The user's preferred method for receiving notifications."),
					})
					.strict(),
				z.null(),
			])
			.describe("The updated preferences if successful, or null if failed."),
	})
	.strict()
	.describe("Response schema for updating user preferences.");

export const userPreferencesResponseSchemaSchema = z
	.object({
		object: z.enum(["user_preferences"]).describe("Object type identifier."),
		preferences: z
			.union([
				z
					.object({
						notifications: z
							.object({
								liveActivity: z
									.boolean()
									.describe("Whether the user wants to receive live activities."),
								pushNotifications: z
									.boolean()
									.describe("Whether the user wants to receive push notifications."),
							})
							.strict()
							.describe("The user's preferred method for receiving notifications."),
					})
					.strict(),
				z.null(),
			])
			.describe("The user's current preferences, or null if errored."),
	})
	.strict()
	.describe("Response schema for retrieving user preferences.");

export const userPreferencesSchemaSchema = z
	.object({
		notifications: z
			.object({
				liveActivity: z.boolean().describe("Whether the user wants to receive live activities."),
				pushNotifications: z
					.boolean()
					.describe("Whether the user wants to receive push notifications."),
			})
			.strict()
			.describe("The user's preferred method for receiving notifications."),
	})
	.strict()
	.describe("User preferences configuration including notification settings.");

export const userSummarySchemaSchema = z
	.object({
		id: z.string().describe("A unique identifier for the user."),
		object: z.enum(["user"]).describe("Fixed value identifying this object as a user."),
		name: z.string().optional().describe("Optional full name of the user."),
		email: z.string().describe("The user's email address."),
		avatar: z.string().describe("URL to the user's avatar image."),
		createdAt: z.iso
			.datetime()
			.describe("The ISO timestamp representing when the user was created."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The ISO timestamp of the last update to the user."),
	})
	.strict()
	.describe("Details of the authenticated user, including profile and contact information.");

export const vercelProjectDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the linked Vercel project."),
		object: z
			.enum(["vercel_project"])
			.describe("Fixed value identifying this object as a Vercel project."),
		name: z.string().describe("The name of the Vercel project."),
	})
	.strict();

export const vercelProjectSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the linked Vercel project."),
		object: z
			.enum(["vercel_project"])
			.describe("Fixed value identifying this object as a Vercel project."),
		name: z.string().describe("The name of the Vercel project."),
	})
	.strict()
	.describe("Basic metadata about a Vercel project connected to a v0 project.");

export const versionDetailSchema = z
	.object({
		id: z.string().describe("A unique identifier for the version."),
		object: z.enum(["version"]).describe("Fixed value identifying this object as a version."),
		status: z
			.enum(["completed", "failed", "pending"])
			.describe("The current status of the version generation process."),
		demoUrl: z.string().optional().describe("Optional URL for previewing the generated output."),
		screenshotUrl: z.string().optional().describe("URL to retrieve a screenshot of this version."),
		createdAt: z.iso
			.datetime()
			.describe("The date and time when the version was created, in ISO 8601 format."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The date and time when the version was last updated, in ISO 8601 format."),
		files: z
			.array(
				z
					.object({
						object: z.enum(["file"]).describe("Fixed value identifying this object as a file."),
						name: z.string().describe("The name of the file, including its extension."),
						content: z.string().describe("The full contents of the file as a raw string."),
						locked: z
							.boolean()
							.describe(
								"Whether the file is locked to prevent AI from overwriting it during new version generation.",
							),
					})
					.strict(),
			)
			.describe("A list of files that were generated or included in this version."),
	})
	.strict()
	.describe("Detailed version data including file contents.");

export const versionSummarySchema = z
	.object({
		id: z.string().describe("A unique identifier for the version."),
		object: z.enum(["version"]).describe("Fixed value identifying this object as a version."),
		status: z
			.enum(["completed", "failed", "pending"])
			.describe("The current status of the version generation process."),
		demoUrl: z.string().optional().describe("Optional URL for previewing the generated output."),
		screenshotUrl: z.string().optional().describe("URL to retrieve a screenshot of this version."),
		createdAt: z.iso
			.datetime()
			.describe("The date and time when the version was created, in ISO 8601 format."),
		updatedAt: z.iso
			.datetime()
			.optional()
			.describe("The date and time when the version was last updated, in ISO 8601 format."),
	})
	.strict()
	.describe(
		"Summary of a generated version of a chat, including its status and optional demo link.",
	);

export const versionSummaryListSchema = z
	.object({
		object: z.enum(["list"]).describe("Fixed value identifying this as a list response."),
		data: z
			.array(
				z
					.object({
						id: z.string().describe("A unique identifier for the version."),
						object: z
							.enum(["version"])
							.describe("Fixed value identifying this object as a version."),
						status: z
							.enum(["completed", "failed", "pending"])
							.describe("The current status of the version generation process."),
						demoUrl: z
							.string()
							.optional()
							.describe("Optional URL for previewing the generated output."),
						screenshotUrl: z
							.string()
							.optional()
							.describe("URL to retrieve a screenshot of this version."),
						createdAt: z.iso
							.datetime()
							.describe("The date and time when the version was created, in ISO 8601 format."),
						updatedAt: z.iso
							.datetime()
							.optional()
							.describe("The date and time when the version was last updated, in ISO 8601 format."),
					})
					.strict(),
			)
			.describe("Array of version summaries in this page of results."),
		pagination: z
			.object({
				hasMore: z
					.boolean()
					.describe("Indicates if there are more results available beyond this page."),
				nextCursor: z.string().optional().describe("Cursor for fetching the next page of results."),
				nextUrl: z.string().optional().describe("API URL for retrieving the next page of results."),
			})
			.strict()
			.describe("Pagination metadata for navigating through multiple pages of results."),
	})
	.strict()
	.describe("List response containing multiple version summaries with cursor-based pagination.");

export const unauthorizedErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["unauthorized_error"]),
			})
			.strict(),
	})
	.strict();

export const forbiddenErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["forbidden_error"]),
			})
			.strict(),
	})
	.strict();

export const notFoundErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["not_found_error"]),
			})
			.strict(),
	})
	.strict();

export const conflictErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["conflict_error"]),
			})
			.strict(),
	})
	.strict();

export const payloadTooLargeErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["payload_too_large_error"]),
			})
			.strict(),
	})
	.strict();

export const unprocessableEntityErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["unprocessable_entity_error"]),
			})
			.strict(),
	})
	.strict();

export const tooManyRequestsErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["too_many_requests_error"]),
			})
			.strict(),
	})
	.strict();

export const internalServerErrorSchema = z
	.object({
		error: z
			.object({
				message: z.string(),
				type: z.enum(["internal_server_error"]),
			})
			.strict(),
	})
	.strict();

export const chatsCreateStatus200Schema = z.unknown();

export const chatsCreateStatus401Schema = z.unknown();

export const chatsCreateStatus403Schema = z.unknown();

export const chatsCreateStatus404Schema = z.unknown();

export const chatsCreateStatus409Schema = z.unknown();

export const chatsCreateStatus413Schema = z.unknown();

export const chatsCreateStatus422Schema = z.unknown();

export const chatsCreateStatus429Schema = z.unknown();

export const chatsCreateStatus500Schema = z.unknown();

export const chatsCreateResponseSchema = z.union([
	chatsCreateStatus200Schema,
	chatsCreateStatus401Schema,
	chatsCreateStatus403Schema,
	chatsCreateStatus404Schema,
	chatsCreateStatus409Schema,
	chatsCreateStatus413Schema,
	chatsCreateStatus422Schema,
	chatsCreateStatus429Schema,
	chatsCreateStatus500Schema,
]);

export const chatsFindQueryLimitSchema = z
	.number()
	.max(60)
	.optional()
	.default(60)
	.describe(
		"Specifies the maximum number of chat records to return in a single response. Useful for paginating results when there are many chats.",
	);

export const chatsFindQueryOffsetSchema = z
	.number()
	.optional()
	.default(0)
	.describe(
		"Determines the starting point for pagination. Used in conjunction with limit to retrieve a specific page of chat results.",
	);

export const chatsFindQueryIsFavoriteSchema = z
	.enum(["true", "false"])
	.optional()
	.describe(
		'Filters chats by their "favorite" status. Accepts `"true"` or `"false"` (as strings, not booleans).\n\n- `"true"`: returns only chats marked as favorites.\n- `"false"`: returns only non-favorite chats.',
	);

export const chatsFindQueryVercelProjectIdSchema = z
	.string()
	.optional()
	.describe(
		"Filters chats by the linked Vercel project ID. Only returns chats associated with the specified Vercel project.",
	);

export const chatsFindQueryBranchSchema = z
	.string()
	.optional()
	.describe(
		"Filters chats by the Git branch name. Only returns chats that have an active Git connection with the specified branch as the head.",
	);

export const chatsFindStatus200Schema = z.unknown();

export const chatsFindStatus401Schema = z.unknown();

export const chatsFindStatus403Schema = z.unknown();

export const chatsFindStatus404Schema = z.unknown();

export const chatsFindStatus409Schema = z.unknown();

export const chatsFindStatus413Schema = z.unknown();

export const chatsFindStatus422Schema = z.unknown();

export const chatsFindStatus429Schema = z.unknown();

export const chatsFindStatus500Schema = z.unknown();

export const chatsFindResponseSchema = z.union([
	chatsFindStatus200Schema,
	chatsFindStatus401Schema,
	chatsFindStatus403Schema,
	chatsFindStatus404Schema,
	chatsFindStatus409Schema,
	chatsFindStatus413Schema,
	chatsFindStatus422Schema,
	chatsFindStatus429Schema,
	chatsFindStatus500Schema,
]);

export const chatsInitStatus200Schema = z.unknown();

export const chatsInitStatus401Schema = z.unknown();

export const chatsInitStatus403Schema = z.unknown();

export const chatsInitStatus404Schema = z.unknown();

export const chatsInitStatus409Schema = z.unknown();

export const chatsInitStatus413Schema = z.unknown();

export const chatsInitStatus422Schema = z.unknown();

export const chatsInitStatus429Schema = z.unknown();

export const chatsInitStatus500Schema = z.unknown();

export const chatsInitResponseSchema = z.union([
	chatsInitStatus200Schema,
	chatsInitStatus401Schema,
	chatsInitStatus403Schema,
	chatsInitStatus404Schema,
	chatsInitStatus409Schema,
	chatsInitStatus413Schema,
	chatsInitStatus422Schema,
	chatsInitStatus429Schema,
	chatsInitStatus500Schema,
]);

export const chatsDeletePathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat to delete. This must be passed as a path parameter in the URL.",
	);

export const chatsDeleteStatus200Schema = z.unknown();

export const chatsDeleteStatus401Schema = z.unknown();

export const chatsDeleteStatus403Schema = z.unknown();

export const chatsDeleteStatus404Schema = z.unknown();

export const chatsDeleteStatus409Schema = z.unknown();

export const chatsDeleteStatus413Schema = z.unknown();

export const chatsDeleteStatus422Schema = z.unknown();

export const chatsDeleteStatus429Schema = z.unknown();

export const chatsDeleteStatus500Schema = z.unknown();

export const chatsDeleteResponseSchema = z.union([
	chatsDeleteStatus200Schema,
	chatsDeleteStatus401Schema,
	chatsDeleteStatus403Schema,
	chatsDeleteStatus404Schema,
	chatsDeleteStatus409Schema,
	chatsDeleteStatus413Schema,
	chatsDeleteStatus422Schema,
	chatsDeleteStatus429Schema,
	chatsDeleteStatus500Schema,
]);

export const chatsGetByIdPathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat to retrieve. Must be provided as a path parameter.");

export const chatsGetByIdStatus200Schema = z.unknown();

export const chatsGetByIdStatus401Schema = z.unknown();

export const chatsGetByIdStatus403Schema = z.unknown();

export const chatsGetByIdStatus404Schema = z.unknown();

export const chatsGetByIdStatus409Schema = z.unknown();

export const chatsGetByIdStatus413Schema = z.unknown();

export const chatsGetByIdStatus422Schema = z.unknown();

export const chatsGetByIdStatus429Schema = z.unknown();

export const chatsGetByIdStatus500Schema = z.unknown();

export const chatsGetByIdResponseSchema = z.union([
	chatsGetByIdStatus200Schema,
	chatsGetByIdStatus401Schema,
	chatsGetByIdStatus403Schema,
	chatsGetByIdStatus404Schema,
	chatsGetByIdStatus409Schema,
	chatsGetByIdStatus413Schema,
	chatsGetByIdStatus422Schema,
	chatsGetByIdStatus429Schema,
	chatsGetByIdStatus500Schema,
]);

export const chatsUpdatePathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat to update. Provided as a path parameter.");

export const chatsUpdateStatus200Schema = z.unknown();

export const chatsUpdateStatus401Schema = z.unknown();

export const chatsUpdateStatus403Schema = z.unknown();

export const chatsUpdateStatus404Schema = z.unknown();

export const chatsUpdateStatus409Schema = z.unknown();

export const chatsUpdateStatus413Schema = z.unknown();

export const chatsUpdateStatus422Schema = z.unknown();

export const chatsUpdateStatus429Schema = z.unknown();

export const chatsUpdateStatus500Schema = z.unknown();

export const chatsUpdateResponseSchema = z.union([
	chatsUpdateStatus200Schema,
	chatsUpdateStatus401Schema,
	chatsUpdateStatus403Schema,
	chatsUpdateStatus404Schema,
	chatsUpdateStatus409Schema,
	chatsUpdateStatus413Schema,
	chatsUpdateStatus422Schema,
	chatsUpdateStatus429Schema,
	chatsUpdateStatus500Schema,
]);

export const chatsFavoritePathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat to update. Provided as a path parameter.");

export const chatsFavoriteStatus200Schema = z.unknown();

export const chatsFavoriteStatus401Schema = z.unknown();

export const chatsFavoriteStatus403Schema = z.unknown();

export const chatsFavoriteStatus404Schema = z.unknown();

export const chatsFavoriteStatus409Schema = z.unknown();

export const chatsFavoriteStatus413Schema = z.unknown();

export const chatsFavoriteStatus422Schema = z.unknown();

export const chatsFavoriteStatus429Schema = z.unknown();

export const chatsFavoriteStatus500Schema = z.unknown();

export const chatsFavoriteResponseSchema = z.union([
	chatsFavoriteStatus200Schema,
	chatsFavoriteStatus401Schema,
	chatsFavoriteStatus403Schema,
	chatsFavoriteStatus404Schema,
	chatsFavoriteStatus409Schema,
	chatsFavoriteStatus413Schema,
	chatsFavoriteStatus422Schema,
	chatsFavoriteStatus429Schema,
	chatsFavoriteStatus500Schema,
]);

export const chatsForkPathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat to fork. Provided as a path parameter.");

export const chatsForkStatus200Schema = z.unknown();

export const chatsForkStatus401Schema = z.unknown();

export const chatsForkStatus403Schema = z.unknown();

export const chatsForkStatus404Schema = z.unknown();

export const chatsForkStatus409Schema = z.unknown();

export const chatsForkStatus413Schema = z.unknown();

export const chatsForkStatus422Schema = z.unknown();

export const chatsForkStatus429Schema = z.unknown();

export const chatsForkStatus500Schema = z.unknown();

export const chatsForkResponseSchema = z.union([
	chatsForkStatus200Schema,
	chatsForkStatus401Schema,
	chatsForkStatus403Schema,
	chatsForkStatus404Schema,
	chatsForkStatus409Schema,
	chatsForkStatus413Schema,
	chatsForkStatus422Schema,
	chatsForkStatus429Schema,
	chatsForkStatus500Schema,
]);

export const projectsGetByChatIdPathChatIdSchema = z
	.string()
	.describe("The ID of the chat to retrieve the associated project for.");

export const projectsGetByChatIdStatus200Schema = z.unknown();

export const projectsGetByChatIdStatus401Schema = z.unknown();

export const projectsGetByChatIdStatus403Schema = z.unknown();

export const projectsGetByChatIdStatus404Schema = z.unknown();

export const projectsGetByChatIdStatus409Schema = z.unknown();

export const projectsGetByChatIdStatus413Schema = z.unknown();

export const projectsGetByChatIdStatus422Schema = z.unknown();

export const projectsGetByChatIdStatus429Schema = z.unknown();

export const projectsGetByChatIdStatus500Schema = z.unknown();

export const projectsGetByChatIdResponseSchema = z.union([
	projectsGetByChatIdStatus200Schema,
	projectsGetByChatIdStatus401Schema,
	projectsGetByChatIdStatus403Schema,
	projectsGetByChatIdStatus404Schema,
	projectsGetByChatIdStatus409Schema,
	projectsGetByChatIdStatus413Schema,
	projectsGetByChatIdStatus422Schema,
	projectsGetByChatIdStatus429Schema,
	projectsGetByChatIdStatus500Schema,
]);

export const chatsFindMessagesPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat to retrieve messages for. Provided as a path parameter.",
	);

export const chatsFindMessagesQueryLimitSchema = z
	.number()
	.min(1)
	.max(150)
	.optional()
	.default(20)
	.describe(
		"Specifies the maximum number of message records to return in a single response. Useful for paginating results when there are many messages.",
	);

export const chatsFindMessagesQueryCursorSchema = z
	.string()
	.optional()
	.describe("Base64 encoded cursor containing pagination data");

export const chatsFindMessagesStatus200Schema = z.unknown();

export const chatsFindMessagesStatus401Schema = z.unknown();

export const chatsFindMessagesStatus403Schema = z.unknown();

export const chatsFindMessagesStatus404Schema = z.unknown();

export const chatsFindMessagesStatus409Schema = z.unknown();

export const chatsFindMessagesStatus413Schema = z.unknown();

export const chatsFindMessagesStatus422Schema = z.unknown();

export const chatsFindMessagesStatus429Schema = z.unknown();

export const chatsFindMessagesStatus500Schema = z.unknown();

export const chatsFindMessagesResponseSchema = z.union([
	chatsFindMessagesStatus200Schema,
	chatsFindMessagesStatus401Schema,
	chatsFindMessagesStatus403Schema,
	chatsFindMessagesStatus404Schema,
	chatsFindMessagesStatus409Schema,
	chatsFindMessagesStatus413Schema,
	chatsFindMessagesStatus422Schema,
	chatsFindMessagesStatus429Schema,
	chatsFindMessagesStatus500Schema,
]);

export const chatsSendMessagePathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat to send the message to. Provided as a path parameter.",
	);

export const chatsSendMessageStatus200Schema = z.unknown();

export const chatsSendMessageStatus401Schema = z.unknown();

export const chatsSendMessageStatus403Schema = z.unknown();

export const chatsSendMessageStatus404Schema = z.unknown();

export const chatsSendMessageStatus409Schema = z.unknown();

export const chatsSendMessageStatus413Schema = z.unknown();

export const chatsSendMessageStatus422Schema = z.unknown();

export const chatsSendMessageStatus429Schema = z.unknown();

export const chatsSendMessageStatus500Schema = z.unknown();

export const chatsSendMessageResponseSchema = z.union([
	chatsSendMessageStatus200Schema,
	chatsSendMessageStatus401Schema,
	chatsSendMessageStatus403Schema,
	chatsSendMessageStatus404Schema,
	chatsSendMessageStatus409Schema,
	chatsSendMessageStatus413Schema,
	chatsSendMessageStatus422Schema,
	chatsSendMessageStatus429Schema,
	chatsSendMessageStatus500Schema,
]);

export const chatsGetMessagePathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the message. Provided as a path parameter.",
	);

export const chatsGetMessagePathMessageIdSchema = z
	.string()
	.describe("The unique identifier of the message to retrieve. Provided as a path parameter.");

export const chatsGetMessageStatus200Schema = z.unknown();

export const chatsGetMessageStatus401Schema = z.unknown();

export const chatsGetMessageStatus403Schema = z.unknown();

export const chatsGetMessageStatus404Schema = z.unknown();

export const chatsGetMessageStatus409Schema = z.unknown();

export const chatsGetMessageStatus413Schema = z.unknown();

export const chatsGetMessageStatus422Schema = z.unknown();

export const chatsGetMessageStatus429Schema = z.unknown();

export const chatsGetMessageStatus500Schema = z.unknown();

export const chatsGetMessageResponseSchema = z.union([
	chatsGetMessageStatus200Schema,
	chatsGetMessageStatus401Schema,
	chatsGetMessageStatus403Schema,
	chatsGetMessageStatus404Schema,
	chatsGetMessageStatus409Schema,
	chatsGetMessageStatus413Schema,
	chatsGetMessageStatus422Schema,
	chatsGetMessageStatus429Schema,
	chatsGetMessageStatus500Schema,
]);

export const chatsFindVersionsPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat to retrieve versions for. Provided as a path parameter.",
	);

export const chatsFindVersionsQueryLimitSchema = z
	.number()
	.min(1)
	.max(150)
	.optional()
	.default(20)
	.describe(
		"Specifies the maximum number of version records to return in a single response. Useful for paginating results when there are many versions.",
	);

export const chatsFindVersionsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Base64 encoded cursor containing pagination data");

export const chatsFindVersionsStatus200Schema = z.unknown();

export const chatsFindVersionsStatus401Schema = z.unknown();

export const chatsFindVersionsStatus403Schema = z.unknown();

export const chatsFindVersionsStatus404Schema = z.unknown();

export const chatsFindVersionsStatus409Schema = z.unknown();

export const chatsFindVersionsStatus413Schema = z.unknown();

export const chatsFindVersionsStatus422Schema = z.unknown();

export const chatsFindVersionsStatus429Schema = z.unknown();

export const chatsFindVersionsStatus500Schema = z.unknown();

export const chatsFindVersionsResponseSchema = z.union([
	chatsFindVersionsStatus200Schema,
	chatsFindVersionsStatus401Schema,
	chatsFindVersionsStatus403Schema,
	chatsFindVersionsStatus404Schema,
	chatsFindVersionsStatus409Schema,
	chatsFindVersionsStatus413Schema,
	chatsFindVersionsStatus422Schema,
	chatsFindVersionsStatus429Schema,
	chatsFindVersionsStatus500Schema,
]);

export const chatsGetVersionPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the version. Provided as a path parameter.",
	);

export const chatsGetVersionPathVersionIdSchema = z
	.string()
	.describe("The unique identifier of the version to retrieve. Provided as a path parameter.");

export const chatsGetVersionQueryIncludeDefaultFilesSchema = z
	.enum(["true", "false"])
	.optional()
	.describe(
		"When true, includes all default files (package.json, configuration files, etc.) that would be part of a ZIP download. When false or omitted, returns only the generated source files.",
	);

export const chatsGetVersionStatus200Schema = z.unknown();

export const chatsGetVersionStatus401Schema = z.unknown();

export const chatsGetVersionStatus403Schema = z.unknown();

export const chatsGetVersionStatus404Schema = z.unknown();

export const chatsGetVersionStatus409Schema = z.unknown();

export const chatsGetVersionStatus413Schema = z.unknown();

export const chatsGetVersionStatus422Schema = z.unknown();

export const chatsGetVersionStatus429Schema = z.unknown();

export const chatsGetVersionStatus500Schema = z.unknown();

export const chatsGetVersionResponseSchema = z.union([
	chatsGetVersionStatus200Schema,
	chatsGetVersionStatus401Schema,
	chatsGetVersionStatus403Schema,
	chatsGetVersionStatus404Schema,
	chatsGetVersionStatus409Schema,
	chatsGetVersionStatus413Schema,
	chatsGetVersionStatus422Schema,
	chatsGetVersionStatus429Schema,
	chatsGetVersionStatus500Schema,
]);

export const chatsUpdateVersionPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the version to update. Provided as a path parameter.",
	);

export const chatsUpdateVersionPathVersionIdSchema = z
	.string()
	.describe(
		"The unique identifier of the version (block) to update. Provided as a path parameter.",
	);

export const chatsUpdateVersionStatus200Schema = z.unknown();

export const chatsUpdateVersionStatus401Schema = z.unknown();

export const chatsUpdateVersionStatus403Schema = z.unknown();

export const chatsUpdateVersionStatus404Schema = z.unknown();

export const chatsUpdateVersionStatus409Schema = z.unknown();

export const chatsUpdateVersionStatus413Schema = z.unknown();

export const chatsUpdateVersionStatus422Schema = z.unknown();

export const chatsUpdateVersionStatus429Schema = z.unknown();

export const chatsUpdateVersionStatus500Schema = z.unknown();

export const chatsUpdateVersionResponseSchema = z.union([
	chatsUpdateVersionStatus200Schema,
	chatsUpdateVersionStatus401Schema,
	chatsUpdateVersionStatus403Schema,
	chatsUpdateVersionStatus404Schema,
	chatsUpdateVersionStatus409Schema,
	chatsUpdateVersionStatus413Schema,
	chatsUpdateVersionStatus422Schema,
	chatsUpdateVersionStatus429Schema,
	chatsUpdateVersionStatus500Schema,
]);

export const chatsDownloadVersionPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the version. Provided as a path parameter.",
	);

export const chatsDownloadVersionPathVersionIdSchema = z
	.string()
	.describe("The unique identifier of the version to download. Provided as a path parameter.");

export const chatsDownloadVersionQueryFormatSchema = z
	.enum(["zip", "tarball"])
	.optional()
	.default("zip")
	.describe(
		'The archive format for the download. Choose "zip" for broad compatibility or "tarball" for Unix/Linux systems.',
	);

export const chatsDownloadVersionQueryIncludeDefaultFilesSchema = z
	.enum(["true", "false"])
	.optional()
	.describe(
		"When true, includes all default files (package.json, configuration files, etc.) that would be part of a complete deployment. When false or omitted, returns only the generated source files.",
	);

export const chatsDownloadVersionStatus200Schema = z.unknown();

export const chatsDownloadVersionStatus401Schema = z.unknown();

export const chatsDownloadVersionStatus403Schema = z.unknown();

export const chatsDownloadVersionStatus404Schema = z.unknown();

export const chatsDownloadVersionStatus409Schema = z.unknown();

export const chatsDownloadVersionStatus413Schema = z.unknown();

export const chatsDownloadVersionStatus422Schema = z.unknown();

export const chatsDownloadVersionStatus429Schema = z.unknown();

export const chatsDownloadVersionStatus500Schema = z.unknown();

export const chatsDownloadVersionResponseSchema = z.union([
	chatsDownloadVersionStatus200Schema,
	chatsDownloadVersionStatus401Schema,
	chatsDownloadVersionStatus403Schema,
	chatsDownloadVersionStatus404Schema,
	chatsDownloadVersionStatus409Schema,
	chatsDownloadVersionStatus413Schema,
	chatsDownloadVersionStatus422Schema,
	chatsDownloadVersionStatus429Schema,
	chatsDownloadVersionStatus500Schema,
]);

export const chatsDeleteVersionFilesPathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat containing the version to delete files from.");

export const chatsDeleteVersionFilesPathVersionIdSchema = z
	.string()
	.describe("The unique identifier of the version (block) to delete files from.");

export const chatsDeleteVersionFilesStatus200Schema = z.unknown();

export const chatsDeleteVersionFilesStatus401Schema = z.unknown();

export const chatsDeleteVersionFilesStatus403Schema = z.unknown();

export const chatsDeleteVersionFilesStatus404Schema = z.unknown();

export const chatsDeleteVersionFilesStatus409Schema = z.unknown();

export const chatsDeleteVersionFilesStatus413Schema = z.unknown();

export const chatsDeleteVersionFilesStatus422Schema = z.unknown();

export const chatsDeleteVersionFilesStatus429Schema = z.unknown();

export const chatsDeleteVersionFilesStatus500Schema = z.unknown();

export const chatsDeleteVersionFilesResponseSchema = z.union([
	chatsDeleteVersionFilesStatus200Schema,
	chatsDeleteVersionFilesStatus401Schema,
	chatsDeleteVersionFilesStatus403Schema,
	chatsDeleteVersionFilesStatus404Schema,
	chatsDeleteVersionFilesStatus409Schema,
	chatsDeleteVersionFilesStatus413Schema,
	chatsDeleteVersionFilesStatus422Schema,
	chatsDeleteVersionFilesStatus429Schema,
	chatsDeleteVersionFilesStatus500Schema,
]);

export const chatsResumePathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the message to resume. Provided as a path parameter.",
	);

export const chatsResumePathMessageIdSchema = z
	.string()
	.describe("The identifier of the specific message to resume. Provided as a path parameter.");

export const chatsResumeStatus200Schema = z.unknown();

export const chatsResumeStatus401Schema = z.unknown();

export const chatsResumeStatus403Schema = z.unknown();

export const chatsResumeStatus404Schema = z.unknown();

export const chatsResumeStatus409Schema = z.unknown();

export const chatsResumeStatus413Schema = z.unknown();

export const chatsResumeStatus422Schema = z.unknown();

export const chatsResumeStatus429Schema = z.unknown();

export const chatsResumeStatus500Schema = z.unknown();

export const chatsResumeResponseSchema = z.union([
	chatsResumeStatus200Schema,
	chatsResumeStatus401Schema,
	chatsResumeStatus403Schema,
	chatsResumeStatus404Schema,
	chatsResumeStatus409Schema,
	chatsResumeStatus413Schema,
	chatsResumeStatus422Schema,
	chatsResumeStatus429Schema,
	chatsResumeStatus500Schema,
]);

export const chatsStopPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the message to stop. Provided as a path parameter.",
	);

export const chatsStopPathMessageIdSchema = z
	.string()
	.describe("The identifier of the specific message to stop. Provided as a path parameter.");

export const chatsStopStatus200Schema = z.unknown();

export const chatsStopStatus401Schema = z.unknown();

export const chatsStopStatus403Schema = z.unknown();

export const chatsStopStatus404Schema = z.unknown();

export const chatsStopStatus409Schema = z.unknown();

export const chatsStopStatus413Schema = z.unknown();

export const chatsStopStatus422Schema = z.unknown();

export const chatsStopStatus429Schema = z.unknown();

export const chatsStopStatus500Schema = z.unknown();

export const chatsStopResponseSchema = z.union([
	chatsStopStatus200Schema,
	chatsStopStatus401Schema,
	chatsStopStatus403Schema,
	chatsStopStatus404Schema,
	chatsStopStatus409Schema,
	chatsStopStatus413Schema,
	chatsStopStatus422Schema,
	chatsStopStatus429Schema,
	chatsStopStatus500Schema,
]);

export const chatsResolveTaskPathChatIdSchema = z
	.string()
	.describe(
		"The unique identifier of the chat containing the pending task. Provided as a path parameter.",
	);

export const chatsResolveTaskStatus200Schema = z.unknown();

export const chatsResolveTaskStatus401Schema = z.unknown();

export const chatsResolveTaskStatus403Schema = z.unknown();

export const chatsResolveTaskStatus404Schema = z.unknown();

export const chatsResolveTaskStatus409Schema = z.unknown();

export const chatsResolveTaskStatus413Schema = z.unknown();

export const chatsResolveTaskStatus422Schema = z.unknown();

export const chatsResolveTaskStatus429Schema = z.unknown();

export const chatsResolveTaskStatus500Schema = z.unknown();

export const chatsResolveTaskResponseSchema = z.union([
	chatsResolveTaskStatus200Schema,
	chatsResolveTaskStatus401Schema,
	chatsResolveTaskStatus403Schema,
	chatsResolveTaskStatus404Schema,
	chatsResolveTaskStatus409Schema,
	chatsResolveTaskStatus413Schema,
	chatsResolveTaskStatus422Schema,
	chatsResolveTaskStatus429Schema,
	chatsResolveTaskStatus500Schema,
]);

export const deploymentsFindQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("The ID of the project to find deployments for");

export const deploymentsFindQueryChatIdSchema = z
	.string()
	.describe("The ID of the chat to find deployments for");

export const deploymentsFindQueryVersionIdSchema = z
	.string()
	.describe("The ID of the version to find deployments for");

export const deploymentsFindStatus200Schema = z.unknown();

export const deploymentsFindStatus401Schema = z.unknown();

export const deploymentsFindStatus403Schema = z.unknown();

export const deploymentsFindStatus404Schema = z.unknown();

export const deploymentsFindStatus409Schema = z.unknown();

export const deploymentsFindStatus413Schema = z.unknown();

export const deploymentsFindStatus422Schema = z.unknown();

export const deploymentsFindStatus429Schema = z.unknown();

export const deploymentsFindStatus500Schema = z.unknown();

export const deploymentsFindResponseSchema = z.union([
	deploymentsFindStatus200Schema,
	deploymentsFindStatus401Schema,
	deploymentsFindStatus403Schema,
	deploymentsFindStatus404Schema,
	deploymentsFindStatus409Schema,
	deploymentsFindStatus413Schema,
	deploymentsFindStatus422Schema,
	deploymentsFindStatus429Schema,
	deploymentsFindStatus500Schema,
]);

export const deploymentsCreateStatus200Schema = z.unknown();

export const deploymentsCreateStatus401Schema = z.unknown();

export const deploymentsCreateStatus403Schema = z.unknown();

export const deploymentsCreateStatus404Schema = z.unknown();

export const deploymentsCreateStatus409Schema = z.unknown();

export const deploymentsCreateStatus413Schema = z.unknown();

export const deploymentsCreateStatus422Schema = z.unknown();

export const deploymentsCreateStatus429Schema = z.unknown();

export const deploymentsCreateStatus500Schema = z.unknown();

export const deploymentsCreateResponseSchema = z.union([
	deploymentsCreateStatus200Schema,
	deploymentsCreateStatus401Schema,
	deploymentsCreateStatus403Schema,
	deploymentsCreateStatus404Schema,
	deploymentsCreateStatus409Schema,
	deploymentsCreateStatus413Schema,
	deploymentsCreateStatus422Schema,
	deploymentsCreateStatus429Schema,
	deploymentsCreateStatus500Schema,
]);

export const deploymentsGetByIdPathDeploymentIdSchema = z
	.string()
	.describe('Path parameter "deploymentId"');

export const deploymentsGetByIdStatus200Schema = z.unknown();

export const deploymentsGetByIdStatus401Schema = z.unknown();

export const deploymentsGetByIdStatus403Schema = z.unknown();

export const deploymentsGetByIdStatus404Schema = z.unknown();

export const deploymentsGetByIdStatus409Schema = z.unknown();

export const deploymentsGetByIdStatus413Schema = z.unknown();

export const deploymentsGetByIdStatus422Schema = z.unknown();

export const deploymentsGetByIdStatus429Schema = z.unknown();

export const deploymentsGetByIdStatus500Schema = z.unknown();

export const deploymentsGetByIdResponseSchema = z.union([
	deploymentsGetByIdStatus200Schema,
	deploymentsGetByIdStatus401Schema,
	deploymentsGetByIdStatus403Schema,
	deploymentsGetByIdStatus404Schema,
	deploymentsGetByIdStatus409Schema,
	deploymentsGetByIdStatus413Schema,
	deploymentsGetByIdStatus422Schema,
	deploymentsGetByIdStatus429Schema,
	deploymentsGetByIdStatus500Schema,
]);

export const deploymentsDeletePathDeploymentIdSchema = z
	.string()
	.describe('Path parameter "deploymentId"');

export const deploymentsDeleteStatus200Schema = z.unknown();

export const deploymentsDeleteStatus401Schema = z.unknown();

export const deploymentsDeleteStatus403Schema = z.unknown();

export const deploymentsDeleteStatus404Schema = z.unknown();

export const deploymentsDeleteStatus409Schema = z.unknown();

export const deploymentsDeleteStatus413Schema = z.unknown();

export const deploymentsDeleteStatus422Schema = z.unknown();

export const deploymentsDeleteStatus429Schema = z.unknown();

export const deploymentsDeleteStatus500Schema = z.unknown();

export const deploymentsDeleteResponseSchema = z.union([
	deploymentsDeleteStatus200Schema,
	deploymentsDeleteStatus401Schema,
	deploymentsDeleteStatus403Schema,
	deploymentsDeleteStatus404Schema,
	deploymentsDeleteStatus409Schema,
	deploymentsDeleteStatus413Schema,
	deploymentsDeleteStatus422Schema,
	deploymentsDeleteStatus429Schema,
	deploymentsDeleteStatus500Schema,
]);

export const deploymentsFindLogsPathDeploymentIdSchema = z
	.string()
	.describe(
		"The unique identifier of the deployment to retrieve logs for. Provided as a path parameter.",
	);

export const deploymentsFindLogsQuerySinceSchema = z
	.number()
	.optional()
	.describe(
		"A UNIX timestamp (in seconds) used to filter logs. Returns only log entries generated after the specified time.",
	);

export const deploymentsFindLogsStatus200Schema = z.unknown();

export const deploymentsFindLogsStatus401Schema = z.unknown();

export const deploymentsFindLogsStatus403Schema = z.unknown();

export const deploymentsFindLogsStatus404Schema = z.unknown();

export const deploymentsFindLogsStatus409Schema = z.unknown();

export const deploymentsFindLogsStatus413Schema = z.unknown();

export const deploymentsFindLogsStatus422Schema = z.unknown();

export const deploymentsFindLogsStatus429Schema = z.unknown();

export const deploymentsFindLogsStatus500Schema = z.unknown();

export const deploymentsFindLogsResponseSchema = z.union([
	deploymentsFindLogsStatus200Schema,
	deploymentsFindLogsStatus401Schema,
	deploymentsFindLogsStatus403Schema,
	deploymentsFindLogsStatus404Schema,
	deploymentsFindLogsStatus409Schema,
	deploymentsFindLogsStatus413Schema,
	deploymentsFindLogsStatus422Schema,
	deploymentsFindLogsStatus429Schema,
	deploymentsFindLogsStatus500Schema,
]);

export const deploymentsFindErrorsPathDeploymentIdSchema = z
	.string()
	.describe(
		"The unique identifier of the deployment to inspect for errors. Provided as a path parameter.",
	);

export const deploymentsFindErrorsStatus200Schema = z.unknown();

export const deploymentsFindErrorsStatus401Schema = z.unknown();

export const deploymentsFindErrorsStatus403Schema = z.unknown();

export const deploymentsFindErrorsStatus404Schema = z.unknown();

export const deploymentsFindErrorsStatus409Schema = z.unknown();

export const deploymentsFindErrorsStatus413Schema = z.unknown();

export const deploymentsFindErrorsStatus422Schema = z.unknown();

export const deploymentsFindErrorsStatus429Schema = z.unknown();

export const deploymentsFindErrorsStatus500Schema = z.unknown();

export const deploymentsFindErrorsResponseSchema = z.union([
	deploymentsFindErrorsStatus200Schema,
	deploymentsFindErrorsStatus401Schema,
	deploymentsFindErrorsStatus403Schema,
	deploymentsFindErrorsStatus404Schema,
	deploymentsFindErrorsStatus409Schema,
	deploymentsFindErrorsStatus413Schema,
	deploymentsFindErrorsStatus422Schema,
	deploymentsFindErrorsStatus429Schema,
	deploymentsFindErrorsStatus500Schema,
]);

export const hooksFindStatus200Schema = z.unknown();

export const hooksFindStatus401Schema = z.unknown();

export const hooksFindStatus403Schema = z.unknown();

export const hooksFindStatus404Schema = z.unknown();

export const hooksFindStatus409Schema = z.unknown();

export const hooksFindStatus413Schema = z.unknown();

export const hooksFindStatus422Schema = z.unknown();

export const hooksFindStatus429Schema = z.unknown();

export const hooksFindStatus500Schema = z.unknown();

export const hooksFindResponseSchema = z.union([
	hooksFindStatus200Schema,
	hooksFindStatus401Schema,
	hooksFindStatus403Schema,
	hooksFindStatus404Schema,
	hooksFindStatus409Schema,
	hooksFindStatus413Schema,
	hooksFindStatus422Schema,
	hooksFindStatus429Schema,
	hooksFindStatus500Schema,
]);

export const hooksCreateStatus200Schema = z.unknown();

export const hooksCreateStatus401Schema = z.unknown();

export const hooksCreateStatus403Schema = z.unknown();

export const hooksCreateStatus404Schema = z.unknown();

export const hooksCreateStatus409Schema = z.unknown();

export const hooksCreateStatus413Schema = z.unknown();

export const hooksCreateStatus422Schema = z.unknown();

export const hooksCreateStatus429Schema = z.unknown();

export const hooksCreateStatus500Schema = z.unknown();

export const hooksCreateResponseSchema = z.union([
	hooksCreateStatus200Schema,
	hooksCreateStatus401Schema,
	hooksCreateStatus403Schema,
	hooksCreateStatus404Schema,
	hooksCreateStatus409Schema,
	hooksCreateStatus413Schema,
	hooksCreateStatus422Schema,
	hooksCreateStatus429Schema,
	hooksCreateStatus500Schema,
]);

export const hooksGetByIdPathHookIdSchema = z
	.string()
	.describe("The unique identifier of the hook to retrieve.");

export const hooksGetByIdStatus200Schema = z.unknown();

export const hooksGetByIdStatus401Schema = z.unknown();

export const hooksGetByIdStatus403Schema = z.unknown();

export const hooksGetByIdStatus404Schema = z.unknown();

export const hooksGetByIdStatus409Schema = z.unknown();

export const hooksGetByIdStatus413Schema = z.unknown();

export const hooksGetByIdStatus422Schema = z.unknown();

export const hooksGetByIdStatus429Schema = z.unknown();

export const hooksGetByIdStatus500Schema = z.unknown();

export const hooksGetByIdResponseSchema = z.union([
	hooksGetByIdStatus200Schema,
	hooksGetByIdStatus401Schema,
	hooksGetByIdStatus403Schema,
	hooksGetByIdStatus404Schema,
	hooksGetByIdStatus409Schema,
	hooksGetByIdStatus413Schema,
	hooksGetByIdStatus422Schema,
	hooksGetByIdStatus429Schema,
	hooksGetByIdStatus500Schema,
]);

export const hooksUpdatePathHookIdSchema = z
	.string()
	.describe("The ID of the webhook to update. Provided as a path parameter.");

export const hooksUpdateStatus200Schema = z.unknown();

export const hooksUpdateStatus401Schema = z.unknown();

export const hooksUpdateStatus403Schema = z.unknown();

export const hooksUpdateStatus404Schema = z.unknown();

export const hooksUpdateStatus409Schema = z.unknown();

export const hooksUpdateStatus413Schema = z.unknown();

export const hooksUpdateStatus422Schema = z.unknown();

export const hooksUpdateStatus429Schema = z.unknown();

export const hooksUpdateStatus500Schema = z.unknown();

export const hooksUpdateResponseSchema = z.union([
	hooksUpdateStatus200Schema,
	hooksUpdateStatus401Schema,
	hooksUpdateStatus403Schema,
	hooksUpdateStatus404Schema,
	hooksUpdateStatus409Schema,
	hooksUpdateStatus413Schema,
	hooksUpdateStatus422Schema,
	hooksUpdateStatus429Schema,
	hooksUpdateStatus500Schema,
]);

export const hooksDeletePathHookIdSchema = z
	.string()
	.describe("The ID of the webhook to delete. Provided as a path parameter.");

export const hooksDeleteStatus200Schema = z.unknown();

export const hooksDeleteStatus401Schema = z.unknown();

export const hooksDeleteStatus403Schema = z.unknown();

export const hooksDeleteStatus404Schema = z.unknown();

export const hooksDeleteStatus409Schema = z.unknown();

export const hooksDeleteStatus413Schema = z.unknown();

export const hooksDeleteStatus422Schema = z.unknown();

export const hooksDeleteStatus429Schema = z.unknown();

export const hooksDeleteStatus500Schema = z.unknown();

export const hooksDeleteResponseSchema = z.union([
	hooksDeleteStatus200Schema,
	hooksDeleteStatus401Schema,
	hooksDeleteStatus403Schema,
	hooksDeleteStatus404Schema,
	hooksDeleteStatus409Schema,
	hooksDeleteStatus413Schema,
	hooksDeleteStatus422Schema,
	hooksDeleteStatus429Schema,
	hooksDeleteStatus500Schema,
]);

export const integrationsVercelProjectsFindStatus200Schema = z.unknown();

export const integrationsVercelProjectsFindStatus401Schema = z.unknown();

export const integrationsVercelProjectsFindStatus403Schema = z.unknown();

export const integrationsVercelProjectsFindStatus404Schema = z.unknown();

export const integrationsVercelProjectsFindStatus409Schema = z.unknown();

export const integrationsVercelProjectsFindStatus413Schema = z.unknown();

export const integrationsVercelProjectsFindStatus422Schema = z.unknown();

export const integrationsVercelProjectsFindStatus429Schema = z.unknown();

export const integrationsVercelProjectsFindStatus500Schema = z.unknown();

export const integrationsVercelProjectsFindResponseSchema = z.union([
	integrationsVercelProjectsFindStatus200Schema,
	integrationsVercelProjectsFindStatus401Schema,
	integrationsVercelProjectsFindStatus403Schema,
	integrationsVercelProjectsFindStatus404Schema,
	integrationsVercelProjectsFindStatus409Schema,
	integrationsVercelProjectsFindStatus413Schema,
	integrationsVercelProjectsFindStatus422Schema,
	integrationsVercelProjectsFindStatus429Schema,
	integrationsVercelProjectsFindStatus500Schema,
]);

export const integrationsVercelProjectsCreateStatus200Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus401Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus403Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus404Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus409Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus413Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus422Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus429Schema = z.unknown();

export const integrationsVercelProjectsCreateStatus500Schema = z.unknown();

export const integrationsVercelProjectsCreateResponseSchema = z.union([
	integrationsVercelProjectsCreateStatus200Schema,
	integrationsVercelProjectsCreateStatus401Schema,
	integrationsVercelProjectsCreateStatus403Schema,
	integrationsVercelProjectsCreateStatus404Schema,
	integrationsVercelProjectsCreateStatus409Schema,
	integrationsVercelProjectsCreateStatus413Schema,
	integrationsVercelProjectsCreateStatus422Schema,
	integrationsVercelProjectsCreateStatus429Schema,
	integrationsVercelProjectsCreateStatus500Schema,
]);

export const projectsFindStatus200Schema = z.unknown();

export const projectsFindStatus401Schema = z.unknown();

export const projectsFindStatus403Schema = z.unknown();

export const projectsFindStatus404Schema = z.unknown();

export const projectsFindStatus409Schema = z.unknown();

export const projectsFindStatus413Schema = z.unknown();

export const projectsFindStatus422Schema = z.unknown();

export const projectsFindStatus429Schema = z.unknown();

export const projectsFindStatus500Schema = z.unknown();

export const projectsFindResponseSchema = z.union([
	projectsFindStatus200Schema,
	projectsFindStatus401Schema,
	projectsFindStatus403Schema,
	projectsFindStatus404Schema,
	projectsFindStatus409Schema,
	projectsFindStatus413Schema,
	projectsFindStatus422Schema,
	projectsFindStatus429Schema,
	projectsFindStatus500Schema,
]);

export const projectsCreateStatus200Schema = z.unknown();

export const projectsCreateStatus401Schema = z.unknown();

export const projectsCreateStatus403Schema = z.unknown();

export const projectsCreateStatus404Schema = z.unknown();

export const projectsCreateStatus409Schema = z.unknown();

export const projectsCreateStatus413Schema = z.unknown();

export const projectsCreateStatus422Schema = z.unknown();

export const projectsCreateStatus429Schema = z.unknown();

export const projectsCreateStatus500Schema = z.unknown();

export const projectsCreateResponseSchema = z.union([
	projectsCreateStatus200Schema,
	projectsCreateStatus401Schema,
	projectsCreateStatus403Schema,
	projectsCreateStatus404Schema,
	projectsCreateStatus409Schema,
	projectsCreateStatus413Schema,
	projectsCreateStatus422Schema,
	projectsCreateStatus429Schema,
	projectsCreateStatus500Schema,
]);

export const projectsGetByIdPathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project to retrieve.");

export const projectsGetByIdStatus200Schema = z.unknown();

export const projectsGetByIdStatus401Schema = z.unknown();

export const projectsGetByIdStatus403Schema = z.unknown();

export const projectsGetByIdStatus404Schema = z.unknown();

export const projectsGetByIdStatus409Schema = z.unknown();

export const projectsGetByIdStatus413Schema = z.unknown();

export const projectsGetByIdStatus422Schema = z.unknown();

export const projectsGetByIdStatus429Schema = z.unknown();

export const projectsGetByIdStatus500Schema = z.unknown();

export const projectsGetByIdResponseSchema = z.union([
	projectsGetByIdStatus200Schema,
	projectsGetByIdStatus401Schema,
	projectsGetByIdStatus403Schema,
	projectsGetByIdStatus404Schema,
	projectsGetByIdStatus409Schema,
	projectsGetByIdStatus413Schema,
	projectsGetByIdStatus422Schema,
	projectsGetByIdStatus429Schema,
	projectsGetByIdStatus500Schema,
]);

export const projectsUpdatePathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project to update. Provided as a path parameter.");

export const projectsUpdateStatus200Schema = z.unknown();

export const projectsUpdateStatus401Schema = z.unknown();

export const projectsUpdateStatus403Schema = z.unknown();

export const projectsUpdateStatus404Schema = z.unknown();

export const projectsUpdateStatus409Schema = z.unknown();

export const projectsUpdateStatus413Schema = z.unknown();

export const projectsUpdateStatus422Schema = z.unknown();

export const projectsUpdateStatus429Schema = z.unknown();

export const projectsUpdateStatus500Schema = z.unknown();

export const projectsUpdateResponseSchema = z.union([
	projectsUpdateStatus200Schema,
	projectsUpdateStatus401Schema,
	projectsUpdateStatus403Schema,
	projectsUpdateStatus404Schema,
	projectsUpdateStatus409Schema,
	projectsUpdateStatus413Schema,
	projectsUpdateStatus422Schema,
	projectsUpdateStatus429Schema,
	projectsUpdateStatus500Schema,
]);

export const projectsDeletePathProjectIdSchema = z
	.string()
	.describe(
		"The unique identifier of the project to delete. This must be passed as a path parameter in the URL.",
	);

export const projectsDeleteQueryDeleteAllChatsSchema = z
	.enum(["true", "false"])
	.optional()
	.default("false")
	.describe(
		"If true, deletes all the chats associated with the given project ID. Deleting is permanent. Defaults to false.",
	);

export const projectsDeleteStatus200Schema = z.unknown();

export const projectsDeleteStatus401Schema = z.unknown();

export const projectsDeleteStatus403Schema = z.unknown();

export const projectsDeleteStatus404Schema = z.unknown();

export const projectsDeleteStatus409Schema = z.unknown();

export const projectsDeleteStatus413Schema = z.unknown();

export const projectsDeleteStatus422Schema = z.unknown();

export const projectsDeleteStatus429Schema = z.unknown();

export const projectsDeleteStatus500Schema = z.unknown();

export const projectsDeleteResponseSchema = z.union([
	projectsDeleteStatus200Schema,
	projectsDeleteStatus401Schema,
	projectsDeleteStatus403Schema,
	projectsDeleteStatus404Schema,
	projectsDeleteStatus409Schema,
	projectsDeleteStatus413Schema,
	projectsDeleteStatus422Schema,
	projectsDeleteStatus429Schema,
	projectsDeleteStatus500Schema,
]);

export const projectsAssignPathProjectIdSchema = z
	.string()
	.describe("The ID of the project to assign.");

export const projectsAssignStatus200Schema = z.unknown();

export const projectsAssignStatus401Schema = z.unknown();

export const projectsAssignStatus403Schema = z.unknown();

export const projectsAssignStatus404Schema = z.unknown();

export const projectsAssignStatus409Schema = z.unknown();

export const projectsAssignStatus413Schema = z.unknown();

export const projectsAssignStatus422Schema = z.unknown();

export const projectsAssignStatus429Schema = z.unknown();

export const projectsAssignStatus500Schema = z.unknown();

export const projectsAssignResponseSchema = z.union([
	projectsAssignStatus200Schema,
	projectsAssignStatus401Schema,
	projectsAssignStatus403Schema,
	projectsAssignStatus404Schema,
	projectsAssignStatus409Schema,
	projectsAssignStatus413Schema,
	projectsAssignStatus422Schema,
	projectsAssignStatus429Schema,
	projectsAssignStatus500Schema,
]);

export const projectsFindEnvVarsPathProjectIdSchema = z
	.string()
	.describe(
		"The unique identifier of the project whose environment variables should be retrieved.",
	);

export const projectsFindEnvVarsQueryDecryptedSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("Whether to return decrypted values. Defaults to false (encrypted).");

export const projectsFindEnvVarsStatus200Schema = z.unknown();

export const projectsFindEnvVarsStatus401Schema = z.unknown();

export const projectsFindEnvVarsStatus403Schema = z.unknown();

export const projectsFindEnvVarsStatus404Schema = z.unknown();

export const projectsFindEnvVarsStatus409Schema = z.unknown();

export const projectsFindEnvVarsStatus413Schema = z.unknown();

export const projectsFindEnvVarsStatus422Schema = z.unknown();

export const projectsFindEnvVarsStatus429Schema = z.unknown();

export const projectsFindEnvVarsStatus500Schema = z.unknown();

export const projectsFindEnvVarsResponseSchema = z.union([
	projectsFindEnvVarsStatus200Schema,
	projectsFindEnvVarsStatus401Schema,
	projectsFindEnvVarsStatus403Schema,
	projectsFindEnvVarsStatus404Schema,
	projectsFindEnvVarsStatus409Schema,
	projectsFindEnvVarsStatus413Schema,
	projectsFindEnvVarsStatus422Schema,
	projectsFindEnvVarsStatus429Schema,
	projectsFindEnvVarsStatus500Schema,
]);

export const projectsCreateEnvVarsPathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project where environment variables should be created.");

export const projectsCreateEnvVarsQueryDecryptedSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("Whether to return decrypted values. Defaults to false (encrypted).");

export const projectsCreateEnvVarsStatus200Schema = z.unknown();

export const projectsCreateEnvVarsStatus401Schema = z.unknown();

export const projectsCreateEnvVarsStatus403Schema = z.unknown();

export const projectsCreateEnvVarsStatus404Schema = z.unknown();

export const projectsCreateEnvVarsStatus409Schema = z.unknown();

export const projectsCreateEnvVarsStatus413Schema = z.unknown();

export const projectsCreateEnvVarsStatus422Schema = z.unknown();

export const projectsCreateEnvVarsStatus429Schema = z.unknown();

export const projectsCreateEnvVarsStatus500Schema = z.unknown();

export const projectsCreateEnvVarsResponseSchema = z.union([
	projectsCreateEnvVarsStatus200Schema,
	projectsCreateEnvVarsStatus401Schema,
	projectsCreateEnvVarsStatus403Schema,
	projectsCreateEnvVarsStatus404Schema,
	projectsCreateEnvVarsStatus409Schema,
	projectsCreateEnvVarsStatus413Schema,
	projectsCreateEnvVarsStatus422Schema,
	projectsCreateEnvVarsStatus429Schema,
	projectsCreateEnvVarsStatus500Schema,
]);

export const projectsUpdateEnvVarsPathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project whose environment variables should be updated.");

export const projectsUpdateEnvVarsQueryDecryptedSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("Whether to return decrypted values. Defaults to false (encrypted).");

export const projectsUpdateEnvVarsStatus200Schema = z.unknown();

export const projectsUpdateEnvVarsStatus401Schema = z.unknown();

export const projectsUpdateEnvVarsStatus403Schema = z.unknown();

export const projectsUpdateEnvVarsStatus404Schema = z.unknown();

export const projectsUpdateEnvVarsStatus409Schema = z.unknown();

export const projectsUpdateEnvVarsStatus413Schema = z.unknown();

export const projectsUpdateEnvVarsStatus422Schema = z.unknown();

export const projectsUpdateEnvVarsStatus429Schema = z.unknown();

export const projectsUpdateEnvVarsStatus500Schema = z.unknown();

export const projectsUpdateEnvVarsResponseSchema = z.union([
	projectsUpdateEnvVarsStatus200Schema,
	projectsUpdateEnvVarsStatus401Schema,
	projectsUpdateEnvVarsStatus403Schema,
	projectsUpdateEnvVarsStatus404Schema,
	projectsUpdateEnvVarsStatus409Schema,
	projectsUpdateEnvVarsStatus413Schema,
	projectsUpdateEnvVarsStatus422Schema,
	projectsUpdateEnvVarsStatus429Schema,
	projectsUpdateEnvVarsStatus500Schema,
]);

export const projectsDeleteEnvVarsPathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project whose environment variables should be deleted.");

export const projectsDeleteEnvVarsStatus200Schema = z.unknown();

export const projectsDeleteEnvVarsStatus401Schema = z.unknown();

export const projectsDeleteEnvVarsStatus403Schema = z.unknown();

export const projectsDeleteEnvVarsStatus404Schema = z.unknown();

export const projectsDeleteEnvVarsStatus409Schema = z.unknown();

export const projectsDeleteEnvVarsStatus413Schema = z.unknown();

export const projectsDeleteEnvVarsStatus422Schema = z.unknown();

export const projectsDeleteEnvVarsStatus429Schema = z.unknown();

export const projectsDeleteEnvVarsStatus500Schema = z.unknown();

export const projectsDeleteEnvVarsResponseSchema = z.union([
	projectsDeleteEnvVarsStatus200Schema,
	projectsDeleteEnvVarsStatus401Schema,
	projectsDeleteEnvVarsStatus403Schema,
	projectsDeleteEnvVarsStatus404Schema,
	projectsDeleteEnvVarsStatus409Schema,
	projectsDeleteEnvVarsStatus413Schema,
	projectsDeleteEnvVarsStatus422Schema,
	projectsDeleteEnvVarsStatus429Schema,
	projectsDeleteEnvVarsStatus500Schema,
]);

export const projectsGetEnvVarPathProjectIdSchema = z
	.string()
	.describe("The unique identifier of the project that owns the environment variable.");

export const projectsGetEnvVarPathEnvironmentVariableIdSchema = z
	.string()
	.describe("The unique identifier of the environment variable to retrieve.");

export const projectsGetEnvVarQueryDecryptedSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("Whether to return decrypted values. Defaults to false (encrypted).");

export const projectsGetEnvVarStatus200Schema = z.unknown();

export const projectsGetEnvVarStatus401Schema = z.unknown();

export const projectsGetEnvVarStatus403Schema = z.unknown();

export const projectsGetEnvVarStatus404Schema = z.unknown();

export const projectsGetEnvVarStatus409Schema = z.unknown();

export const projectsGetEnvVarStatus413Schema = z.unknown();

export const projectsGetEnvVarStatus422Schema = z.unknown();

export const projectsGetEnvVarStatus429Schema = z.unknown();

export const projectsGetEnvVarStatus500Schema = z.unknown();

export const projectsGetEnvVarResponseSchema = z.union([
	projectsGetEnvVarStatus200Schema,
	projectsGetEnvVarStatus401Schema,
	projectsGetEnvVarStatus403Schema,
	projectsGetEnvVarStatus404Schema,
	projectsGetEnvVarStatus409Schema,
	projectsGetEnvVarStatus413Schema,
	projectsGetEnvVarStatus422Schema,
	projectsGetEnvVarStatus429Schema,
	projectsGetEnvVarStatus500Schema,
]);

export const rateLimitsFindQueryScopeSchema = z
	.string()
	.optional()
	.describe(
		"The context or namespace to check rate limits for (e.g., a project slug or feature area).",
	);

export const rateLimitsFindStatus200Schema = z.unknown();

export const rateLimitsFindStatus401Schema = z.unknown();

export const rateLimitsFindStatus403Schema = z.unknown();

export const rateLimitsFindStatus404Schema = z.unknown();

export const rateLimitsFindStatus409Schema = z.unknown();

export const rateLimitsFindStatus413Schema = z.unknown();

export const rateLimitsFindStatus422Schema = z.unknown();

export const rateLimitsFindStatus429Schema = z.unknown();

export const rateLimitsFindStatus500Schema = z.unknown();

export const rateLimitsFindResponseSchema = z.union([
	rateLimitsFindStatus200Schema,
	rateLimitsFindStatus401Schema,
	rateLimitsFindStatus403Schema,
	rateLimitsFindStatus404Schema,
	rateLimitsFindStatus409Schema,
	rateLimitsFindStatus413Schema,
	rateLimitsFindStatus422Schema,
	rateLimitsFindStatus429Schema,
	rateLimitsFindStatus500Schema,
]);

export const userGetStatus200Schema = z.unknown();

export const userGetStatus401Schema = z.unknown();

export const userGetStatus403Schema = z.unknown();

export const userGetStatus404Schema = z.unknown();

export const userGetStatus409Schema = z.unknown();

export const userGetStatus413Schema = z.unknown();

export const userGetStatus422Schema = z.unknown();

export const userGetStatus429Schema = z.unknown();

export const userGetStatus500Schema = z.unknown();

export const userGetResponseSchema = z.union([
	userGetStatus200Schema,
	userGetStatus401Schema,
	userGetStatus403Schema,
	userGetStatus404Schema,
	userGetStatus409Schema,
	userGetStatus413Schema,
	userGetStatus422Schema,
	userGetStatus429Schema,
	userGetStatus500Schema,
]);

export const userGetBillingQueryScopeSchema = z
	.string()
	.optional()
	.describe("Filters billing data by a specific scope, such as a project ID or slug.");

export const userGetBillingStatus200Schema = z.unknown();

export const userGetBillingStatus401Schema = z.unknown();

export const userGetBillingStatus403Schema = z.unknown();

export const userGetBillingStatus404Schema = z.unknown();

export const userGetBillingStatus409Schema = z.unknown();

export const userGetBillingStatus413Schema = z.unknown();

export const userGetBillingStatus422Schema = z.unknown();

export const userGetBillingStatus429Schema = z.unknown();

export const userGetBillingStatus500Schema = z.unknown();

export const userGetBillingResponseSchema = z.union([
	userGetBillingStatus200Schema,
	userGetBillingStatus401Schema,
	userGetBillingStatus403Schema,
	userGetBillingStatus404Schema,
	userGetBillingStatus409Schema,
	userGetBillingStatus413Schema,
	userGetBillingStatus422Schema,
	userGetBillingStatus429Schema,
	userGetBillingStatus500Schema,
]);

export const userGetPlanStatus200Schema = z.unknown();

export const userGetPlanStatus401Schema = z.unknown();

export const userGetPlanStatus403Schema = z.unknown();

export const userGetPlanStatus404Schema = z.unknown();

export const userGetPlanStatus409Schema = z.unknown();

export const userGetPlanStatus413Schema = z.unknown();

export const userGetPlanStatus422Schema = z.unknown();

export const userGetPlanStatus429Schema = z.unknown();

export const userGetPlanStatus500Schema = z.unknown();

export const userGetPlanResponseSchema = z.union([
	userGetPlanStatus200Schema,
	userGetPlanStatus401Schema,
	userGetPlanStatus403Schema,
	userGetPlanStatus404Schema,
	userGetPlanStatus409Schema,
	userGetPlanStatus413Schema,
	userGetPlanStatus422Schema,
	userGetPlanStatus429Schema,
	userGetPlanStatus500Schema,
]);

export const userGetScopesStatus200Schema = z.unknown();

export const userGetScopesStatus401Schema = z.unknown();

export const userGetScopesStatus403Schema = z.unknown();

export const userGetScopesStatus404Schema = z.unknown();

export const userGetScopesStatus409Schema = z.unknown();

export const userGetScopesStatus413Schema = z.unknown();

export const userGetScopesStatus422Schema = z.unknown();

export const userGetScopesStatus429Schema = z.unknown();

export const userGetScopesStatus500Schema = z.unknown();

export const userGetScopesResponseSchema = z.union([
	userGetScopesStatus200Schema,
	userGetScopesStatus401Schema,
	userGetScopesStatus403Schema,
	userGetScopesStatus404Schema,
	userGetScopesStatus409Schema,
	userGetScopesStatus413Schema,
	userGetScopesStatus422Schema,
	userGetScopesStatus429Schema,
	userGetScopesStatus500Schema,
]);

export const chatsRestorePathChatIdSchema = z
	.string()
	.describe("The unique identifier of the chat containing the version to restore.");

export const chatsRestorePathVersionIdSchema = z
	.string()
	.describe("The unique identifier of the version to restore.");

export const chatsRestoreStatus200Schema = z.unknown();

export const chatsRestoreStatus401Schema = z.unknown();

export const chatsRestoreStatus403Schema = z.unknown();

export const chatsRestoreStatus404Schema = z.unknown();

export const chatsRestoreStatus409Schema = z.unknown();

export const chatsRestoreStatus413Schema = z.unknown();

export const chatsRestoreStatus422Schema = z.unknown();

export const chatsRestoreStatus429Schema = z.unknown();

export const chatsRestoreStatus500Schema = z.unknown();

export const chatsRestoreResponseSchema = z.union([
	chatsRestoreStatus200Schema,
	chatsRestoreStatus401Schema,
	chatsRestoreStatus403Schema,
	chatsRestoreStatus404Schema,
	chatsRestoreStatus409Schema,
	chatsRestoreStatus413Schema,
	chatsRestoreStatus422Schema,
	chatsRestoreStatus429Schema,
	chatsRestoreStatus500Schema,
]);

export const reportsGetUsageQueryStartDateSchema = z.iso
	.datetime()
	.optional()
	.describe('Query parameter "startDate"');

export const reportsGetUsageQueryEndDateSchema = z.iso
	.datetime()
	.optional()
	.describe('Query parameter "endDate"');

export const reportsGetUsageQueryChatIdSchema = z
	.string()
	.optional()
	.describe('Query parameter "chatId"');

export const reportsGetUsageQueryMessageIdSchema = z
	.string()
	.optional()
	.describe('Query parameter "messageId"');

export const reportsGetUsageQueryUserIdSchema = z
	.string()
	.optional()
	.describe('Query parameter "userId"');

export const reportsGetUsageQueryLimitSchema = z
	.number()
	.min(1)
	.max(150)
	.optional()
	.default(20)
	.describe(
		"Bounds the raw billing transactions scanned per ledger group and page. A page can contain more events than this value (large teams are scanned in parallel ledger groups), and a filtered page (chatId, userId, or messageId) can contain fewer or zero events while more data remains. Events are sorted newest-first within a page but not across pages on large teams. Always paginate with `pagination.hasMore` and `pagination.nextCursor` rather than stopping on an empty page.",
	);

export const reportsGetUsageQueryCursorSchema = z
	.string()
	.optional()
	.describe("Base64 encoded cursor containing pagination data");

export const reportsGetUsageStatus200Schema = z.unknown();

export const reportsGetUsageStatus401Schema = z.unknown();

export const reportsGetUsageStatus403Schema = z.unknown();

export const reportsGetUsageStatus404Schema = z.unknown();

export const reportsGetUsageStatus409Schema = z.unknown();

export const reportsGetUsageStatus413Schema = z.unknown();

export const reportsGetUsageStatus422Schema = z.unknown();

export const reportsGetUsageStatus429Schema = z.unknown();

export const reportsGetUsageStatus500Schema = z.unknown();

export const reportsGetUsageResponseSchema = z.union([
	reportsGetUsageStatus200Schema,
	reportsGetUsageStatus401Schema,
	reportsGetUsageStatus403Schema,
	reportsGetUsageStatus404Schema,
	reportsGetUsageStatus409Schema,
	reportsGetUsageStatus413Schema,
	reportsGetUsageStatus422Schema,
	reportsGetUsageStatus429Schema,
	reportsGetUsageStatus500Schema,
]);

export const reportsGetAIUsageQueryStartSchema = z.iso
	.datetime()
	.optional()
	.describe("Inclusive start datetime filter.");

export const reportsGetAIUsageQueryEndSchema = z.iso
	.datetime()
	.optional()
	.describe("Exclusive end datetime filter.");

export const reportsGetAIUsageQueryCursorSchema = z
	.string()
	.optional()
	.describe("Opaque cursor returned by a previous request for forward pagination.");

export const reportsGetAIUsageQueryLimitSchema = z
	.int()
	.min(1)
	.max(5000)
	.optional()
	.default(1000)
	.describe("Maximum number of rows to return.");

export const reportsGetAIUsageStatus200Schema = z.unknown();

export const reportsGetAIUsageStatus401Schema = z.unknown();

export const reportsGetAIUsageStatus403Schema = z.unknown();

export const reportsGetAIUsageStatus404Schema = z.unknown();

export const reportsGetAIUsageStatus409Schema = z.unknown();

export const reportsGetAIUsageStatus413Schema = z.unknown();

export const reportsGetAIUsageStatus422Schema = z.unknown();

export const reportsGetAIUsageStatus429Schema = z.unknown();

export const reportsGetAIUsageStatus500Schema = z.unknown();

export const reportsGetAIUsageResponseSchema = z.union([
	reportsGetAIUsageStatus200Schema,
	reportsGetAIUsageStatus401Schema,
	reportsGetAIUsageStatus403Schema,
	reportsGetAIUsageStatus404Schema,
	reportsGetAIUsageStatus409Schema,
	reportsGetAIUsageStatus413Schema,
	reportsGetAIUsageStatus422Schema,
	reportsGetAIUsageStatus429Schema,
	reportsGetAIUsageStatus500Schema,
]);

export const reportsGetUserActivityQueryStartDateSchema = z.iso
	.datetime()
	.optional()
	.describe("Inclusive ISO timestamp lower bound for activity.");

export const reportsGetUserActivityQueryEndDateSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"Exclusive ISO timestamp upper bound for activity. Pass the end of the last day (e.g. 23:59:59.999) to include it.",
	);

export const reportsGetUserActivityStatus200Schema = z.unknown();

export const reportsGetUserActivityStatus401Schema = z.unknown();

export const reportsGetUserActivityStatus403Schema = z.unknown();

export const reportsGetUserActivityStatus404Schema = z.unknown();

export const reportsGetUserActivityStatus409Schema = z.unknown();

export const reportsGetUserActivityStatus413Schema = z.unknown();

export const reportsGetUserActivityStatus422Schema = z.unknown();

export const reportsGetUserActivityStatus429Schema = z.unknown();

export const reportsGetUserActivityStatus500Schema = z.unknown();

export const reportsGetUserActivityResponseSchema = z.union([
	reportsGetUserActivityStatus200Schema,
	reportsGetUserActivityStatus401Schema,
	reportsGetUserActivityStatus403Schema,
	reportsGetUserActivityStatus404Schema,
	reportsGetUserActivityStatus409Schema,
	reportsGetUserActivityStatus413Schema,
	reportsGetUserActivityStatus422Schema,
	reportsGetUserActivityStatus429Schema,
	reportsGetUserActivityStatus500Schema,
]);

export const mcpServersFindStatus200Schema = z.unknown();

export const mcpServersFindStatus401Schema = z.unknown();

export const mcpServersFindStatus403Schema = z.unknown();

export const mcpServersFindStatus404Schema = z.unknown();

export const mcpServersFindStatus409Schema = z.unknown();

export const mcpServersFindStatus413Schema = z.unknown();

export const mcpServersFindStatus422Schema = z.unknown();

export const mcpServersFindStatus429Schema = z.unknown();

export const mcpServersFindStatus500Schema = z.unknown();

export const mcpServersFindResponseSchema = z.union([
	mcpServersFindStatus200Schema,
	mcpServersFindStatus401Schema,
	mcpServersFindStatus403Schema,
	mcpServersFindStatus404Schema,
	mcpServersFindStatus409Schema,
	mcpServersFindStatus413Schema,
	mcpServersFindStatus422Schema,
	mcpServersFindStatus429Schema,
	mcpServersFindStatus500Schema,
]);

export const mcpServersCreateStatus200Schema = z.unknown();

export const mcpServersCreateStatus401Schema = z.unknown();

export const mcpServersCreateStatus403Schema = z.unknown();

export const mcpServersCreateStatus404Schema = z.unknown();

export const mcpServersCreateStatus409Schema = z.unknown();

export const mcpServersCreateStatus413Schema = z.unknown();

export const mcpServersCreateStatus422Schema = z.unknown();

export const mcpServersCreateStatus429Schema = z.unknown();

export const mcpServersCreateStatus500Schema = z.unknown();

export const mcpServersCreateResponseSchema = z.union([
	mcpServersCreateStatus200Schema,
	mcpServersCreateStatus401Schema,
	mcpServersCreateStatus403Schema,
	mcpServersCreateStatus404Schema,
	mcpServersCreateStatus409Schema,
	mcpServersCreateStatus413Schema,
	mcpServersCreateStatus422Schema,
	mcpServersCreateStatus429Schema,
	mcpServersCreateStatus500Schema,
]);

export const mcpServersGetByIdPathMcpServerIdSchema = z
	.string()
	.describe("The ID of the MCP server to retrieve.");

export const mcpServersGetByIdStatus200Schema = z.unknown();

export const mcpServersGetByIdStatus401Schema = z.unknown();

export const mcpServersGetByIdStatus403Schema = z.unknown();

export const mcpServersGetByIdStatus404Schema = z.unknown();

export const mcpServersGetByIdStatus409Schema = z.unknown();

export const mcpServersGetByIdStatus413Schema = z.unknown();

export const mcpServersGetByIdStatus422Schema = z.unknown();

export const mcpServersGetByIdStatus429Schema = z.unknown();

export const mcpServersGetByIdStatus500Schema = z.unknown();

export const mcpServersGetByIdResponseSchema = z.union([
	mcpServersGetByIdStatus200Schema,
	mcpServersGetByIdStatus401Schema,
	mcpServersGetByIdStatus403Schema,
	mcpServersGetByIdStatus404Schema,
	mcpServersGetByIdStatus409Schema,
	mcpServersGetByIdStatus413Schema,
	mcpServersGetByIdStatus422Schema,
	mcpServersGetByIdStatus429Schema,
	mcpServersGetByIdStatus500Schema,
]);

export const mcpServersUpdatePathMcpServerIdSchema = z
	.string()
	.describe("The ID of the MCP server to update.");

export const mcpServersUpdateStatus200Schema = z.unknown();

export const mcpServersUpdateStatus401Schema = z.unknown();

export const mcpServersUpdateStatus403Schema = z.unknown();

export const mcpServersUpdateStatus404Schema = z.unknown();

export const mcpServersUpdateStatus409Schema = z.unknown();

export const mcpServersUpdateStatus413Schema = z.unknown();

export const mcpServersUpdateStatus422Schema = z.unknown();

export const mcpServersUpdateStatus429Schema = z.unknown();

export const mcpServersUpdateStatus500Schema = z.unknown();

export const mcpServersUpdateResponseSchema = z.union([
	mcpServersUpdateStatus200Schema,
	mcpServersUpdateStatus401Schema,
	mcpServersUpdateStatus403Schema,
	mcpServersUpdateStatus404Schema,
	mcpServersUpdateStatus409Schema,
	mcpServersUpdateStatus413Schema,
	mcpServersUpdateStatus422Schema,
	mcpServersUpdateStatus429Schema,
	mcpServersUpdateStatus500Schema,
]);

export const mcpServersDeletePathMcpServerIdSchema = z
	.string()
	.describe("The ID of the MCP server to delete.");

export const mcpServersDeleteStatus200Schema = z.unknown();

export const mcpServersDeleteStatus401Schema = z.unknown();

export const mcpServersDeleteStatus403Schema = z.unknown();

export const mcpServersDeleteStatus404Schema = z.unknown();

export const mcpServersDeleteStatus409Schema = z.unknown();

export const mcpServersDeleteStatus413Schema = z.unknown();

export const mcpServersDeleteStatus422Schema = z.unknown();

export const mcpServersDeleteStatus429Schema = z.unknown();

export const mcpServersDeleteStatus500Schema = z.unknown();

export const mcpServersDeleteResponseSchema = z.union([
	mcpServersDeleteStatus200Schema,
	mcpServersDeleteStatus401Schema,
	mcpServersDeleteStatus403Schema,
	mcpServersDeleteStatus404Schema,
	mcpServersDeleteStatus409Schema,
	mcpServersDeleteStatus413Schema,
	mcpServersDeleteStatus422Schema,
	mcpServersDeleteStatus429Schema,
	mcpServersDeleteStatus500Schema,
]);

export const mcpServersCreateOAuthAuthorizationUrlPathMcpServerIdSchema = z
	.string()
	.describe("The ID of the OAuth MCP server to authorize.");

export const mcpServersCreateOAuthAuthorizationUrlStatus200Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus401Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus403Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus404Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus409Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus413Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus422Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus429Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlStatus500Schema = z.unknown();

export const mcpServersCreateOAuthAuthorizationUrlResponseSchema = z.union([
	mcpServersCreateOAuthAuthorizationUrlStatus200Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus401Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus403Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus404Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus409Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus413Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus422Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus429Schema,
	mcpServersCreateOAuthAuthorizationUrlStatus500Schema,
]);
