// @ts-nocheck

import * as z from "zod";

export const createDatabaseRequestSchema = z
	.object({
		region: z
			.string()
			.optional()
			.describe(
				"The region where the database should be created. Defaults to the site's functions region if not specified.",
			),
	})
	.describe("Request body for creating a database");

export const databaseResponseSchema = z
	.object({
		connection_string: z.string().optional().describe("The connection string for the database"),
	})
	.describe("Response containing the database connection string");

export const createDatabaseBranchRequestSchema = z
	.object({
		parent_branch_id: z
			.string()
			.optional()
			.describe(
				"The ID of the parent branch to create the new branch from. Defaults to the production branch if not specified.",
			),
		branch_id: z.string().describe("The branch identifier"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Arbitrary metadata to associate with the branch"),
	})
	.describe("Request body for creating a database branch");

export const databaseBranchResponseSchema = z
	.object({
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the database branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response containing the database branch connection string");

export const databaseBranchesResponseSchema = z
	.object({
		branches: z
			.array(
				z.object({
					branch_id: z.string().optional().describe("The branch identifier"),
					name: z.string().optional().describe("The branch name"),
					connection_string: z.string().optional().describe("The connection string for the branch"),
					state: z
						.enum(["init", "creating", "resetting", "ready", "archived"])
						.optional()
						.describe("The current state of the branch"),
					logical_size_bytes: z.coerce
						.bigint()
						.optional()
						.describe("The logical size of the branch in bytes"),
					created_at: z.string().optional().describe("When the branch was created"),
					updated_at: z.string().optional().describe("When the branch was last updated"),
					last_active_at: z.string().optional().describe("When the branch was last active"),
					compute: z
						.object({
							current_state: z
								.enum(["active", "idle"])
								.optional()
								.describe("The current state of the compute endpoint"),
							autoscaling_limit_min_cu: z
								.number()
								.optional()
								.describe("Minimum compute units for autoscaling"),
							autoscaling_limit_max_cu: z
								.number()
								.optional()
								.describe("Maximum compute units for autoscaling"),
							suspend_timeout_seconds: z.coerce
								.bigint()
								.optional()
								.describe("Seconds of inactivity before the compute endpoint is suspended"),
							last_active: z
								.string()
								.optional()
								.describe("When the compute endpoint was last active"),
						})
						.optional()
						.describe("Compute endpoint status for a branch"),
					metadata: z
						.object({})
						.catchall(z.unknown())
						.optional()
						.describe("Metadata associated with the branch"),
				}),
			)
			.optional()
			.describe("List of database branches"),
	})
	.describe("Response containing a list of database branches");

export const databaseBranchDetailSchema = z
	.object({
		branch_id: z.string().optional().describe("The branch identifier"),
		name: z.string().optional().describe("The branch name"),
		connection_string: z.string().optional().describe("The connection string for the branch"),
		state: z
			.enum(["init", "creating", "resetting", "ready", "archived"])
			.optional()
			.describe("The current state of the branch"),
		logical_size_bytes: z.coerce
			.bigint()
			.optional()
			.describe("The logical size of the branch in bytes"),
		created_at: z.string().optional().describe("When the branch was created"),
		updated_at: z.string().optional().describe("When the branch was last updated"),
		last_active_at: z.string().optional().describe("When the branch was last active"),
		compute: z
			.object({
				current_state: z
					.enum(["active", "idle"])
					.optional()
					.describe("The current state of the compute endpoint"),
				autoscaling_limit_min_cu: z
					.number()
					.optional()
					.describe("Minimum compute units for autoscaling"),
				autoscaling_limit_max_cu: z
					.number()
					.optional()
					.describe("Maximum compute units for autoscaling"),
				suspend_timeout_seconds: z.coerce
					.bigint()
					.optional()
					.describe("Seconds of inactivity before the compute endpoint is suspended"),
				last_active: z.string().optional().describe("When the compute endpoint was last active"),
			})
			.optional()
			.describe("Compute endpoint status for a branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Detailed information about a database branch");

export const databaseBranchComputeSchema = z
	.object({
		current_state: z
			.enum(["active", "idle"])
			.optional()
			.describe("The current state of the compute endpoint"),
		autoscaling_limit_min_cu: z
			.number()
			.optional()
			.describe("Minimum compute units for autoscaling"),
		autoscaling_limit_max_cu: z
			.number()
			.optional()
			.describe("Maximum compute units for autoscaling"),
		suspend_timeout_seconds: z.coerce
			.bigint()
			.optional()
			.describe("Seconds of inactivity before the compute endpoint is suspended"),
		last_active: z.string().optional().describe("When the compute endpoint was last active"),
	})
	.describe("Compute endpoint status for a branch");

export const createDatabaseSnapshotRequestSchema = z
	.object({
		branch_id: z
			.string()
			.optional()
			.describe('The ID of the branch to snapshot. Defaults to "production" if not specified.'),
		name: z.string().optional().describe("A name for the snapshot"),
		metadata: z
			.object({
				deploy: z
					.object({})
					.catchall(z.unknown())
					.optional()
					.describe("Deploy information associated with the snapshot"),
				source: z.string().optional().describe("The source that created the snapshot"),
			})
			.optional()
			.describe("Metadata associated with a snapshot"),
	})
	.describe("Request body for creating a database snapshot");

export const databaseSnapshotSchema = z
	.object({
		id: z.string().optional().describe("The unique identifier of the snapshot"),
		source_branch_id: z.string().optional().describe("The ID of the branch that was snapshotted"),
		manual: z.boolean().optional().describe("Whether this snapshot was manually created"),
		created_at: z.string().optional().describe("When the snapshot was created"),
		expires_at: z.string().optional().describe("When the snapshot expires"),
		timestamp: z.string().optional().describe("The point-in-time timestamp of the snapshot"),
		metadata: z
			.object({
				deploy: z
					.object({})
					.catchall(z.unknown())
					.optional()
					.describe("Deploy information associated with the snapshot"),
				source: z.string().optional().describe("The source that created the snapshot"),
			})
			.optional()
			.describe("Metadata associated with a snapshot"),
	})
	.describe("A point-in-time snapshot of a database branch");

export const databaseSnapshotMetadataSchema = z
	.object({
		deploy: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Deploy information associated with the snapshot"),
		source: z.string().optional().describe("The source that created the snapshot"),
	})
	.describe("Metadata associated with a snapshot");

export const databaseSnapshotsResponseSchema = z
	.object({
		snapshots: z
			.array(
				z.object({
					id: z.string().optional().describe("The unique identifier of the snapshot"),
					source_branch_id: z
						.string()
						.optional()
						.describe("The ID of the branch that was snapshotted"),
					manual: z.boolean().optional().describe("Whether this snapshot was manually created"),
					created_at: z.string().optional().describe("When the snapshot was created"),
					expires_at: z.string().optional().describe("When the snapshot expires"),
					timestamp: z.string().optional().describe("The point-in-time timestamp of the snapshot"),
					metadata: z
						.object({
							deploy: z
								.object({})
								.catchall(z.unknown())
								.optional()
								.describe("Deploy information associated with the snapshot"),
							source: z.string().optional().describe("The source that created the snapshot"),
						})
						.optional()
						.describe("Metadata associated with a snapshot"),
				}),
			)
			.optional()
			.describe("List of database snapshots"),
	})
	.describe("Response containing a list of database snapshots");

export const restoreDatabaseSnapshotRequestSchema = z
	.object({
		branch_id: z
			.string()
			.optional()
			.describe(
				'The ID of the branch to restore the snapshot to. Defaults to "production" if not specified.',
			),
	})
	.describe("Request body for restoring a database snapshot");

export const databaseComputeSettingsRequestSchema = z
	.object({
		min_cu: z
			.number()
			.nullish()
			.describe("Minimum compute units (0.25 to 16.0). Must be less than or equal to max_cu."),
		max_cu: z
			.number()
			.nullish()
			.describe(
				"Maximum compute units (0.25 to 16.0). Must be greater than or equal to min_cu. max_cu - min_cu must not exceed 8.0.",
			),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.nullish()
			.describe(
				"Seconds of inactivity before the compute endpoint is suspended. Use -1 for always on, or a non-negative value.",
			),
	})
	.describe(
		"Request body for setting compute settings. All fields are optional; only provided fields are updated.",
	);

export const databaseComputeSettingsSchema = z
	.object({
		min_cu: z.number().optional().describe("Minimum compute units"),
		max_cu: z.number().optional().describe("Maximum compute units"),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.optional()
			.describe("Seconds of inactivity before suspension"),
	})
	.describe("Compute settings for a database or branch");

export const runDatabaseMigrationsRequestSchema = z
	.object({
		dry_run: z
			.boolean()
			.optional()
			.describe("If true, validates migrations without applying them."),
	})
	.describe("Request body for running database migrations");

export const resetDatabaseBranchRequestSchema = z
	.object({
		source_branch_id: z
			.string()
			.optional()
			.describe(
				'The ID of the branch to re-fork the target branch from. Defaults to "production" if not specified.',
			),
	})
	.describe("Request body for resetting a database branch");

export const resetDatabaseBranchResponseSchema = z
	.object({
		reset: z
			.boolean()
			.optional()
			.describe(
				"Whether the branch was actually re-forked. False when the target was already in sync with the source and `force=true` was not set.",
			),
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the reset (or unchanged) branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response for a database branch reset");

export const listDatabaseMigrationsResponseSchema = z
	.object({
		migrations: z
			.array(
				z.object({
					version: z.coerce.bigint().optional().describe("The migration version number"),
					name: z.string().optional().describe("The migration name"),
					path: z
						.string()
						.optional()
						.describe("The path to the migration file in the deploy bundle"),
					applied: z
						.boolean()
						.optional()
						.describe("Whether this migration has been applied to the branch"),
				}),
			)
			.optional()
			.describe("List of migrations"),
	})
	.describe("Response containing the list of migrations for a branch");

export const databaseMigrationSchema = z
	.object({
		version: z.coerce.bigint().optional().describe("The migration version number"),
		name: z.string().optional().describe("The migration name"),
		path: z.string().optional().describe("The path to the migration file in the deploy bundle"),
		applied: z
			.boolean()
			.optional()
			.describe("Whether this migration has been applied to the branch"),
	})
	.describe("A migration available to a database branch");

export const databaseMigrationDetailSchema = z
	.object({
		version: z.coerce.bigint().optional().describe("The migration version number"),
		name: z.string().optional().describe("The migration name"),
		path: z.string().optional().describe("The path to the migration file in the deploy bundle"),
		content: z.string().optional().describe("The raw contents of the migration file"),
	})
	.describe("A migration with its file contents");

export const deployValidationsReportSchema = z.object({
	id: z.string().optional().describe("The id of the deploy validations report"),
	deploy_id: z.string().optional().describe("The id of the deploy"),
	secret_scan_result: z
		.object({
			scannedFilesCount: z.int().optional().describe("The number of files scanned"),
			secretsScanMatches: z
				.array(z.string())
				.optional()
				.describe("The list of secrets scan matches"),
		})
		.optional(),
});

export const deployValidationsReportSecretScanResultSchema = z.object({
	scannedFilesCount: z.int().optional().describe("The number of files scanned"),
	secretsScanMatches: z.array(z.string()).optional().describe("The list of secrets scan matches"),
});

export const splitTestSetupSchema = z.object({
	branch_tests: z.object({}).optional(),
});

export const splitTestsSchema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		name: z.string().optional(),
		path: z.string().optional(),
		branches: z.array(z.object({})).optional(),
		active: z.boolean().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		unpublished_at: z.string().optional(),
	}),
);

export const splitTestSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	branches: z.array(z.object({})).optional(),
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	unpublished_at: z.string().optional(),
});

export const serviceInstanceSchema = z.object({
	id: z.string().optional(),
	url: z.string().optional(),
	config: z.object({}).optional(),
	external_attributes: z.object({}).optional(),
	service_slug: z.string().optional(),
	service_path: z.string().optional(),
	service_name: z.string().optional(),
	env: z.object({}).optional(),
	snippets: z.array(z.object({})).optional(),
	auth_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const serviceSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	service_path: z.string().optional(),
	long_description: z.string().optional(),
	description: z.string().optional(),
	events: z.array(z.object({})).optional(),
	tags: z.array(z.string()).optional(),
	icon: z.string().optional(),
	manifest_url: z.string().optional(),
	environments: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const siteSchema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const siteSetupSchema = z
	.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	})
	.extend({
		repo: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
	});

export const repoInfoSchema = z.object({
	id: z.int().optional(),
	provider: z.string().optional(),
	deploy_key_id: z.string().optional(),
	repo_path: z.string().optional(),
	repo_branch: z.string().optional(),
	dir: z.string().optional(),
	functions_dir: z
		.string()
		.optional()
		.describe(
			"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
		),
	cmd: z
		.string()
		.optional()
		.describe(
			"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
		),
	allowed_branches: z.array(z.string()).optional(),
	public_repo: z.boolean().optional(),
	private_logs: z.boolean().optional(),
	repo_url: z.string().optional(),
	env: z.object({}).catchall(z.string()).optional(),
	installation_id: z.int().optional(),
	stop_builds: z
		.boolean()
		.optional()
		.describe(
			"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
		),
});

export const submissionSchema = z.object({
	id: z.string().optional(),
	number: z.int().optional(),
	email: z.string().optional(),
	name: z.string().optional(),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
	company: z.string().optional(),
	summary: z.string().optional(),
	body: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	site_url: z.string().optional(),
});

export const envVarSchema = z
	.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	})
	.describe("Environment variable model definition");

export const envVarValueSchema = z
	.object({
		id: z.string().optional().describe("The environment variable value's universally unique ID"),
		value: z.string().optional().describe("The environment variable's unencrypted value"),
		context: z
			.enum(["all", "dev", "dev-server", "branch-deploy", "deploy-preview", "production", "branch"])
			.optional()
			.describe(
				"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
			),
		context_parameter: z
			.string()
			.optional()
			.describe(
				"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
			),
	})
	.describe("Environment variable value model definition");

export const envVarUserSchema = z.object({
	id: z.string().optional().describe("The user's unique identifier"),
	full_name: z.string().optional().describe("The user's full name (first and last)"),
	email: z.string().optional().describe("The user's email address"),
	avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
});

export const formSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
	paths: z.array(z.string()).optional(),
	submission_count: z.int().optional(),
	fields: z.array(z.object({})).optional(),
	created_at: z.string().optional(),
});

export const hookTypeSchema = z.object({
	name: z.string().optional(),
	events: z.array(z.string()).optional(),
	fields: z.array(z.object({})).optional(),
});

export const hookSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const fileSchema = z.object({
	id: z.string().optional(),
	path: z.string().optional(),
	sha: z.string().optional(),
	mime_type: z.string().optional(),
	size: z.coerce.bigint().optional(),
});

export const functionSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	sha: z.string().optional(),
	region: z.string().optional(),
});

export const snippetSchema = z.object({
	id: z.int().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	general: z.string().optional(),
	general_position: z.string().optional(),
	goal: z.string().optional(),
	goal_position: z.string().optional(),
});

export const purgeSchema = z.object({
	site_id: z.string().optional(),
	site_slug: z.string().optional(),
	cache_tags: z.array(z.string()).optional(),
});

export const deploySchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const deployEnvironmentVariableSchema = z.object({
	key: z.string(),
	value: z.string(),
	is_secret: z.boolean(),
	scopes: z.array(z.enum(["builds", "functions", "runtime", "post-processing"])),
});

export const deployFilesSchema = z
	.object({
		files: z
			.object({})
			.optional()
			.describe("A hash mapping file paths to SHA1 digests of the file contents."),
		zip: z
			.instanceof(File)
			.optional()
			.describe(
				"A zip file containing the site files to deploy. Alternative to 'files'.\nTo use this field, set Content-Type to 'application/json' and include the zip content here.\nAlternatively, you can set Content-Type to 'application/zip' and send the zip as the raw request body (not as JSON).\n",
			),
		draft: z.boolean().optional(),
		async: z.boolean().optional(),
		functions: z.object({}).optional(),
		edge_functions: z
			.object({})
			.optional()
			.describe(
				"A hash mapping edge-function bundle formats to the code_sha of each bundle. The\nresponse's required_edge_functions lists which of these still need to be uploaded.\n",
			),
		function_schedules: z
			.array(
				z.object({
					name: z.string().optional(),
					cron: z.string().optional(),
				}),
			)
			.optional(),
		functions_config: z
			.object({})
			.catchall(
				z.object({
					display_name: z.string().optional(),
					generator: z.string().optional(),
					build_data: z.object({}).optional(),
					memory: z
						.int()
						.optional()
						.describe("The function's memory allocation in MB. Mutually exclusive with `vcpu`.\n"),
					routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
								methods: z
									.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]))
									.optional(),
								prefer_static: z.boolean().optional(),
							}),
						)
						.optional(),
					excluded_routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
							}),
						)
						.optional(),
					priority: z.int().optional(),
					region: z.string().optional(),
					traffic_rules: z
						.object({
							action: z
								.object({
									type: z.string().optional(),
									config: z
										.object({
											to: z.string().optional(),
											rate_limit_config: z
												.object({
													algorithm: z.enum(["sliding_window"]).optional(),
													window_size: z.int().optional(),
													window_limit: z.int().optional(),
												})
												.optional(),
											aggregate: z
												.object({
													keys: z
														.array(
															z.object({
																type: z.enum(["ip", "domain"]).optional(),
															}),
														)
														.optional(),
												})
												.optional(),
										})
										.optional(),
								})
								.optional(),
						})
						.optional(),
					vcpu: z
						.number()
						.optional()
						.describe("Number of vCPUs to provision for the function. Allowed range is\n0.5–2.\n"),
					event_subscriptions: z.array(z.string()).optional(),
				}),
			)
			.optional(),
		branch: z.string().optional(),
		framework: z.string().optional(),
		framework_version: z.string().optional(),
		environment: z
			.array(
				z.object({
					key: z.string(),
					value: z.string(),
					is_secret: z.boolean(),
					scopes: z.array(z.enum(["builds", "functions", "runtime", "post-processing"])),
				}),
			)
			.optional()
			.describe(
				"A list of deploy-specific environment variable data. Data specified this way applies only\nto this specific deploy and is merged into any existing environment variables set on the\naccount and site.\n\nDeploy-specific environment variable data takes precedence over account and site\nenvironment variable data: For example, a deploy-specific variable with the key `NODE_ENV`\nwill take priority over any existing site- and account-level environment variable data\nwith the key `NODE_ENV`.\n\nEnvironment variable data may be provided at one of two times:\n\n- When creating a new Deploy with deploy files (most common)\n- When finalizing an existing Deploy with deploy files\n\nOnce set, environment variables for a specific deploy cannot be modified. Subsequent\nattempts to modify environment variable data for a deploy will be ignored.\n",
			),
	})
	.describe(
		"Deploy files can be provided in two ways:\n1. As a JSON object using 'files' (a hash mapping file paths to SHA1 digests), OR\n2. As a zip file using one of these methods:\n   - Set Content-Type to 'application/zip' and send the zip file as the raw request body\n   - Include the zip file content in the 'zip' field of this JSON object with Content-Type 'application/json'\n",
	);

export const pluginParamsSchema = z.object({
	pinned_version: z.string().optional(),
});

export const pluginSchema = z.object({
	package: z.string().optional(),
	pinned_version: z.string().optional(),
});

export const buildStatusSchema = z.object({
	active: z.int().optional(),
	pending_concurrency: z.int().optional(),
	enqueued: z.int().optional(),
	build_count: z.int().optional(),
	minutes: z
		.object({
			current: z.int().optional(),
			current_average_sec: z.int().optional(),
			previous: z.int().optional(),
			period_start_date: z.string().optional(),
			period_end_date: z.string().optional(),
			last_updated_at: z.string().optional(),
			included_minutes: z.string().optional(),
			included_minutes_with_packs: z.string().optional(),
		})
		.optional(),
});

export const buildSchema = z.object({
	id: z.string().optional(),
	deploy_id: z.string().optional(),
	sha: z.string().optional(),
	done: z.boolean().optional(),
	error: z.string().optional(),
	created_at: z.string().optional(),
});

export const buildLogMsgSchema = z.object({
	message: z.string().optional(),
	error: z.boolean().optional(),
	section: z
		.enum(["initializing", "building", "deploying", "cleanup", "postprocessing"])
		.optional(),
});

export const pluginRunDataSchema = z.object({
	package: z.string().optional(),
	version: z.string().optional(),
	state: z.string().optional(),
	reporting_event: z.string().optional(),
	title: z.string().optional(),
	summary: z.string().optional(),
	text: z.string().optional(),
});

export const pluginRunSchema = z
	.object({
		package: z.string().optional(),
		version: z.string().optional(),
		state: z.string().optional(),
		reporting_event: z.string().optional(),
		title: z.string().optional(),
		summary: z.string().optional(),
		text: z.string().optional(),
	})
	.extend({
		deploy_id: z.string().optional(),
	});

export const metadataSchema = z.object({});

export const dnsZoneSetupSchema = z.object({
	account_slug: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
});

export const dnsZonesSchema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		errors: z.array(z.string()).optional(),
		supported_record_types: z.array(z.string()).optional(),
		user_id: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		records: z
			.array(
				z.object({
					id: z.string().optional(),
					hostname: z.string().optional(),
					type: z.string().optional(),
					value: z.string().optional(),
					ttl: z.coerce.bigint().optional(),
					priority: z.coerce.bigint().optional(),
					dns_zone_id: z.string().optional(),
					site_id: z.string().optional(),
					flag: z.int().optional(),
					tag: z.string().optional(),
					managed: z.boolean().optional(),
				}),
			)
			.optional(),
		dns_servers: z.array(z.string()).optional(),
		account_id: z.string().optional(),
		site_id: z.string().optional(),
		account_slug: z.string().optional(),
		account_name: z.string().optional(),
		domain: z.string().optional(),
		ipv6_enabled: z.boolean().optional(),
		dedicated: z.boolean().optional(),
	}),
);

export const dnsZoneSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	errors: z.array(z.string()).optional(),
	supported_record_types: z.array(z.string()).optional(),
	user_id: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	records: z
		.array(
			z.object({
				id: z.string().optional(),
				hostname: z.string().optional(),
				type: z.string().optional(),
				value: z.string().optional(),
				ttl: z.coerce.bigint().optional(),
				priority: z.coerce.bigint().optional(),
				dns_zone_id: z.string().optional(),
				site_id: z.string().optional(),
				flag: z.int().optional(),
				tag: z.string().optional(),
				managed: z.boolean().optional(),
			}),
		)
		.optional(),
	dns_servers: z.array(z.string()).optional(),
	account_id: z.string().optional(),
	site_id: z.string().optional(),
	account_slug: z.string().optional(),
	account_name: z.string().optional(),
	domain: z.string().optional(),
	ipv6_enabled: z.boolean().optional(),
	dedicated: z.boolean().optional(),
});

export const dnsRecordCreateSchema = z.object({
	type: z.string().optional(),
	hostname: z.string().optional(),
	value: z.string().optional(),
	ttl: z.coerce.bigint().optional(),
	priority: z.coerce.bigint().optional(),
	weight: z.coerce.bigint().optional(),
	port: z.coerce.bigint().optional(),
	flag: z.coerce.bigint().optional(),
	tag: z.string().optional(),
});

export const dnsRecordsSchema = z.array(
	z.object({
		id: z.string().optional(),
		hostname: z.string().optional(),
		type: z.string().optional(),
		value: z.string().optional(),
		ttl: z.coerce.bigint().optional(),
		priority: z.coerce.bigint().optional(),
		dns_zone_id: z.string().optional(),
		site_id: z.string().optional(),
		flag: z.int().optional(),
		tag: z.string().optional(),
		managed: z.boolean().optional(),
	}),
);

export const dnsRecordSchema = z.object({
	id: z.string().optional(),
	hostname: z.string().optional(),
	type: z.string().optional(),
	value: z.string().optional(),
	ttl: z.coerce.bigint().optional(),
	priority: z.coerce.bigint().optional(),
	dns_zone_id: z.string().optional(),
	site_id: z.string().optional(),
	flag: z.int().optional(),
	tag: z.string().optional(),
	managed: z.boolean().optional(),
});

export const sniCertificateSchema = z.object({
	state: z.string().optional(),
	domains: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	expires_at: z.string().optional(),
});

export const ticketSchema = z.object({
	id: z.string().optional(),
	client_id: z.string().optional(),
	authorized: z.boolean().optional(),
	created_at: z.string().optional(),
});

export const accessTokenSchema = z.object({
	id: z.string().optional(),
	access_token: z.string().optional(),
	user_id: z.string().optional(),
	user_email: z.string().optional(),
	created_at: z.string().optional(),
});

export const assetSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	creator_id: z.string().optional(),
	name: z.string().optional(),
	state: z.string().optional(),
	content_type: z.string().optional(),
	url: z.string().optional(),
	key: z.string().optional(),
	visibility: z.string().optional(),
	size: z.coerce.bigint().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const assetFormSchema = z.object({
	url: z.string().optional(),
	fields: z.object({}).catchall(z.string()).optional(),
});

export const assetSignatureSchema = z.object({
	form: z
		.object({
			url: z.string().optional(),
			fields: z.object({}).catchall(z.string()).optional(),
		})
		.optional(),
	asset: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			creator_id: z.string().optional(),
			name: z.string().optional(),
			state: z.string().optional(),
			content_type: z.string().optional(),
			url: z.string().optional(),
			key: z.string().optional(),
			visibility: z.string().optional(),
			size: z.coerce.bigint().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
		})
		.optional(),
});

export const assetPublicSignatureSchema = z.object({
	url: z.string().optional(),
});

export const deployKeySchema = z.object({
	id: z.string().optional(),
	public_key: z.string().optional(),
	created_at: z.string().optional(),
});

export const memberSchema = z.object({
	id: z.string().optional(),
	full_name: z.string().optional(),
	email: z.string().optional(),
	avatar: z.string().optional(),
	role: z.string().optional(),
});

export const paymentMethodSchema = z.object({
	id: z.string().optional(),
	method_name: z.string().optional(),
	type: z.string().optional(),
	state: z.string().optional(),
	data: z
		.object({
			card_type: z.string().optional(),
			last4: z.string().optional(),
			email: z.string().optional(),
		})
		.optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const accountTypeSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	capabilities: z.object({}).optional(),
	monthly_dollar_price: z.int().optional(),
	yearly_dollar_price: z.int().optional(),
	monthly_seats_addon_dollar_price: z.int().optional(),
	yearly_seats_addon_dollar_price: z.int().optional(),
});

export const accountSetupSchema = z.object({
	name: z.string(),
	type_id: z.string(),
	payment_method_id: z.string().optional(),
	period: z.enum(["monthly", "yearly"]).optional(),
	extra_seats_block: z.int().optional(),
});

export const accountUpdateSetupSchema = z.object({
	name: z.string().optional(),
	slug: z.string().optional(),
	type_id: z.string().optional(),
	extra_seats_block: z.int().optional(),
	billing_name: z.string().optional(),
	billing_email: z.string().optional(),
	billing_details: z.string().optional(),
});

export const accountAddMemberSetupSchema = z.object({
	role: z.enum(["Owner", "Developer", "Billing Admin", "Reviewer"]).optional(),
	email: z.string().optional(),
});

export const accountUpdateMemberSetupSchema = z.object({
	role: z.enum(["Owner", "Developer", "Billing Admin", "Reviewer"]).optional(),
	site_access: z.enum(["all", "none", "selected"]).optional(),
	site_ids: z.array(z.string()).optional(),
});

export const accountMembershipSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	type: z.string().optional(),
	capabilities: z
		.object({
			sites: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
			collaborators: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
		})
		.optional(),
	billing_name: z.string().optional(),
	billing_email: z.string().optional(),
	billing_details: z.string().optional(),
	billing_period: z.string().optional(),
	payment_method_id: z.string().optional(),
	type_name: z.string().optional(),
	type_id: z.string().optional(),
	owner_ids: z.array(z.string()).optional(),
	roles_allowed: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const auditLogSchema = z.object({
	id: z.string().optional(),
	account_id: z.string().optional(),
	payload: z
		.object({
			actor_id: z.string().optional(),
			actor_name: z.string().optional(),
			actor_email: z.string().optional(),
			action: z.string().optional(),
			timestamp: z.string().optional(),
			log_type: z.string().optional(),
		})
		.catchall(z.object({}))
		.optional(),
});

export const agentRunnerSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	parent_agent_runner_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	result_branch: z.string().optional(),
	pr_url: z.string().optional(),
	pr_branch: z.string().optional(),
	pr_state: z.string().optional(),
	pr_number: z.int().optional(),
	pr_is_being_created: z.boolean().optional(),
	pr_error: z.string().optional(),
	current_task: z.string().optional(),
	result_diff: z.string().optional(),
	sha: z.string().optional(),
	merge_commit_sha: z.string().optional(),
	merge_commit_error: z.string().optional(),
	merge_commit_is_being_created: z.boolean().optional(),
	base_deploy_id: z.string().optional(),
	attached_file_keys: z.array(z.string()).optional(),
	active_session_created_at: z.string().optional(),
	latest_session_deploy_id: z.string().optional(),
	latest_session_deploy_url: z.string().optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
});

export const agentRunnerSessionSchema = z.object({
	id: z.string().optional(),
	agent_runner_id: z.string().optional(),
	dev_server_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	prompt: z.string().optional(),
	agent_config: z
		.object({
			agent: z.string().optional(),
			model: z.string().optional(),
		})
		.optional(),
	result: z.string().optional(),
	result_diff: z.string().optional(),
	commit_sha: z.string().optional(),
	deploy_id: z.string().optional(),
	deploy_url: z.string().optional(),
	duration: z.int().optional(),
	steps: z
		.array(
			z.object({
				title: z.string().optional(),
				message: z.string().optional(),
			}),
		)
		.optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
	attached_file_keys: z.array(z.string()).optional(),
	result_zip_file_name: z.string().optional(),
	is_published: z.boolean().optional(),
});

export const agentRunnerSessionStepSchema = z.object({
	title: z.string().optional(),
	message: z.string().optional(),
});

export const agentRunnerSessionConfigSchema = z.object({
	agent: z.string().optional(),
	model: z.string().optional(),
});

export const agentRunnerUserSchema = z.object({
	id: z.string().optional(),
	full_name: z.string().optional(),
	email: z.string().optional(),
	avatar_url: z.string().optional(),
});

export const agentRunnerHookSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	prompt: z.string().optional(),
	agent: z.string().optional(),
	url: z.string().optional(),
	msg: z.string().optional(),
	created_at: z.string().optional(),
});

export const agentRunnerHookSetupSchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	prompt: z.string().optional(),
	agent: z.string().optional(),
});

export const agentRunnerHookCreatedSchema = z
	.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		prompt: z.string().optional(),
		agent: z.string().optional(),
		url: z.string().optional(),
		msg: z.string().optional(),
		created_at: z.string().optional(),
	})
	.extend({
		secret: z.string().optional(),
	});

export const accountUsageCapabilitySchema = z.object({
	included: z.int().optional(),
	used: z.int().optional(),
});

export const buildSetupSchema = z.object({
	image: z.string().optional(),
	clear_cache: z.boolean().optional(),
});

export const buildHookSetupSchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
});

export const buildHookSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
});

export const deployedBranchSchema = z.object({
	id: z.string().optional(),
	deploy_id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
});

export const userSchema = z.object({
	id: z.string().optional(),
	uid: z.string().optional(),
	full_name: z.string().optional(),
	avatar_url: z.string().optional(),
	email: z.string().optional(),
	affiliate_id: z.string().optional(),
	site_count: z.coerce.bigint().optional(),
	created_at: z.string().optional(),
	last_login: z.string().optional(),
	login_providers: z.array(z.string()).optional(),
	onboarding_progress: z
		.object({
			slides: z.string().optional(),
		})
		.optional(),
});

export const errorSchemaSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const errorResponseSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const functionScheduleSchema = z.object({
	name: z.string().optional(),
	cron: z.string().optional(),
});

export const functionConfigSchema = z.object({
	display_name: z.string().optional(),
	generator: z.string().optional(),
	build_data: z.object({}).optional(),
	memory: z
		.int()
		.optional()
		.describe("The function's memory allocation in MB. Mutually exclusive with `vcpu`.\n"),
	routes: z
		.array(
			z.object({
				pattern: z.string().optional(),
				literal: z.string().optional(),
				expression: z.string().optional(),
				methods: z.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])).optional(),
				prefer_static: z.boolean().optional(),
			}),
		)
		.optional(),
	excluded_routes: z
		.array(
			z.object({
				pattern: z.string().optional(),
				literal: z.string().optional(),
				expression: z.string().optional(),
			}),
		)
		.optional(),
	priority: z.int().optional(),
	region: z.string().optional(),
	traffic_rules: z
		.object({
			action: z
				.object({
					type: z.string().optional(),
					config: z
						.object({
							to: z.string().optional(),
							rate_limit_config: z
								.object({
									algorithm: z.enum(["sliding_window"]).optional(),
									window_size: z.int().optional(),
									window_limit: z.int().optional(),
								})
								.optional(),
							aggregate: z
								.object({
									keys: z
										.array(
											z.object({
												type: z.enum(["ip", "domain"]).optional(),
											}),
										)
										.optional(),
								})
								.optional(),
						})
						.optional(),
				})
				.optional(),
		})
		.optional(),
	vcpu: z
		.number()
		.optional()
		.describe("Number of vCPUs to provision for the function. Allowed range is\n0.5–2.\n"),
	event_subscriptions: z.array(z.string()).optional(),
});

export const functionRouteSchema = z.object({
	pattern: z.string().optional(),
	literal: z.string().optional(),
	expression: z.string().optional(),
	methods: z.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])).optional(),
	prefer_static: z.boolean().optional(),
});

export const excludedFunctionRouteSchema = z.object({
	pattern: z.string().optional(),
	literal: z.string().optional(),
	expression: z.string().optional(),
});

export const trafficRulesConfigSchema = z.object({
	action: z
		.object({
			type: z.string().optional(),
			config: z
				.object({
					to: z.string().optional(),
					rate_limit_config: z
						.object({
							algorithm: z.enum(["sliding_window"]).optional(),
							window_size: z.int().optional(),
							window_limit: z.int().optional(),
						})
						.optional(),
					aggregate: z
						.object({
							keys: z
								.array(
									z.object({
										type: z.enum(["ip", "domain"]).optional(),
									}),
								)
								.optional(),
						})
						.optional(),
				})
				.optional(),
		})
		.optional(),
});

export const trafficRulesRateLimitConfigSchema = z.object({
	algorithm: z.enum(["sliding_window"]).optional(),
	window_size: z.int().optional(),
	window_limit: z.int().optional(),
});

export const trafficRulesAggregateConfigSchema = z.object({
	keys: z
		.array(
			z.object({
				type: z.enum(["ip", "domain"]).optional(),
			}),
		)
		.optional(),
});

export const siteFunctionSchema = z.object({
	branch: z.string().optional(),
	created_at: z.string().optional(),
	functions: z.array(z.object({})).optional(),
	id: z.string().optional(),
	log_type: z.string().optional(),
	provider: z.string().optional(),
});

export const devServerSchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	starting_at: z.string().optional(),
	error_at: z.string().optional(),
	live_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
});

export const devServerHookSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const devServerHookSetupSchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const providerDefinitionSchema = z.object({
	token_env_var: z.string().optional(),
	url_env_var: z.string().optional(),
	models: z.array(z.string()).optional(),
});

export const aiGatewayTokenSchema = z.object({
	token: z.string().optional().describe("The AI Gateway authentication token"),
	url: z.string().optional().describe("AI gateway base url"),
	expires_at: z.coerce.bigint().optional().describe("Unix timestamp when the token expires"),
});

export const listSitesQueryNameSchema = z.string().optional();

export const listSitesQueryFilterSchema = z.enum(["all", "owner", "guest"]).optional();

export const listSitesQueryPageSchema = z.int().optional();

export const listSitesQueryPerPageSchema = z.int().optional();

export const listSitesStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	}),
);

export const listSitesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSitesResponseSchema = listSitesStatus200Schema;

export const listSitesErrorSchema = listSitesStatusDefaultSchema;

export const createSiteQueryConfigureDnsSchema = z.boolean().optional();

export const createSiteStatus201Schema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const createSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteResponseSchema = createSiteStatus201Schema;

export const createSiteErrorSchema = createSiteStatusDefaultSchema;

export const createSiteBodySchema = z
	.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	})
	.extend({
		repo: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
	});

export const getSitePathSiteIdSchema = z.string();

export const getSiteQueryFeatureFlagsSchema = z.string().optional();

export const getSiteStatus200Schema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const getSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteResponseSchema = getSiteStatus200Schema;

export const getSiteErrorSchema = getSiteStatusDefaultSchema;

export const updateSitePathSiteIdSchema = z.string();

export const updateSiteStatus200Schema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const updateSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteResponseSchema = updateSiteStatus200Schema;

export const updateSiteErrorSchema = updateSiteStatusDefaultSchema;

export const updateSiteBodySchema = z
	.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	})
	.extend({
		repo: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
	});

export const deleteSitePathSiteIdSchema = z.string();

export const deleteSiteStatus204Schema = z.unknown();

export const deleteSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteResponseSchema = deleteSiteStatus204Schema;

export const deleteSiteErrorSchema = deleteSiteStatusDefaultSchema;

export const provisionSiteTLSCertificatePathSiteIdSchema = z.string();

export const provisionSiteTLSCertificateQueryCertificateSchema = z
	.string()
	.optional()
	.describe("PEM-encoded certificate. Required when updating an existing certificate.");

export const provisionSiteTLSCertificateQueryKeySchema = z
	.string()
	.optional()
	.describe("PEM-encoded private key. Required when updating an existing certificate.");

export const provisionSiteTLSCertificateQueryCaCertificatesSchema = z
	.string()
	.optional()
	.describe("PEM-encoded CA certificate chain. Required when updating an existing certificate.");

export const provisionSiteTLSCertificateStatus200Schema = z.object({
	state: z.string().optional(),
	domains: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	expires_at: z.string().optional(),
});

export const provisionSiteTLSCertificateStatus422Schema = z.unknown();

export const provisionSiteTLSCertificateStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const provisionSiteTLSCertificateResponseSchema = provisionSiteTLSCertificateStatus200Schema;

export const provisionSiteTLSCertificateErrorSchema = z.union([
	provisionSiteTLSCertificateStatus422Schema,
	provisionSiteTLSCertificateStatusDefaultSchema,
]);

export const showSiteTLSCertificatePathSiteIdSchema = z.string();

export const showSiteTLSCertificateStatus200Schema = z.object({
	state: z.string().optional(),
	domains: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	expires_at: z.string().optional(),
});

export const showSiteTLSCertificateStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const showSiteTLSCertificateResponseSchema = showSiteTLSCertificateStatus200Schema;

export const showSiteTLSCertificateErrorSchema = showSiteTLSCertificateStatusDefaultSchema;

export const getAllCertificatesPathSiteIdSchema = z.string();

export const getAllCertificatesQueryDomainSchema = z.string();

export const getAllCertificatesStatus200Schema = z.array(
	z.object({
		state: z.string().optional(),
		domains: z.array(z.string()).optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		expires_at: z.string().optional(),
	}),
);

export const getAllCertificatesStatus404Schema = z.unknown();

export const getAllCertificatesStatus422Schema = z.unknown();

export const getAllCertificatesResponseSchema = getAllCertificatesStatus200Schema;

export const getAllCertificatesErrorSchema = z.union([
	getAllCertificatesStatus404Schema,
	getAllCertificatesStatus422Schema,
]);

export const getEnvVarsPathAccountIdSchema = z.string().describe("Scope response to account_id");

export const getEnvVarsQueryContextNameSchema = z
	.enum(["all", "dev", "dev-server", "branch-deploy", "deploy-preview", "production"])
	.optional()
	.describe("Filter by deploy context");

export const getEnvVarsQueryScopeSchema = z
	.enum(["builds", "functions", "runtime", "post-processing"])
	.optional()
	.describe("Filter by scope");

export const getEnvVarsQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If specified, only return environment variables set on this site");

export const getEnvVarsStatus200Schema = z.array(
	z.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	}),
);

export const getEnvVarsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getEnvVarsResponseSchema = getEnvVarsStatus200Schema;

export const getEnvVarsErrorSchema = getEnvVarsStatusDefaultSchema;

export const createEnvVarsPathAccountIdSchema = z.string().describe("Scope response to account_id");

export const createEnvVarsQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If provided, create an environment variable on the site level, not the account level");

export const createEnvVarsStatus201Schema = z.array(
	z.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	}),
);

export const createEnvVarsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createEnvVarsResponseSchema = createEnvVarsStatus201Schema;

export const createEnvVarsErrorSchema = createEnvVarsStatusDefaultSchema;

export const createEnvVarsBodySchema = z
	.array(
		z.object({
			key: z
				.string()
				.optional()
				.describe("The existing or new name of the key, if you wish to rename it (case-sensitive)"),
			scopes: z
				.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
				.optional()
				.describe("The scopes that this environment variable is set to (Pro plans and above)"),
			values: z
				.array(
					z.object({
						id: z
							.string()
							.optional()
							.describe("The environment variable value's universally unique ID"),
						value: z.string().optional().describe("The environment variable's unencrypted value"),
						context: z
							.enum([
								"all",
								"dev",
								"dev-server",
								"branch-deploy",
								"deploy-preview",
								"production",
								"branch",
							])
							.optional()
							.describe(
								"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
							),
						context_parameter: z
							.string()
							.optional()
							.describe(
								"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
							),
					}),
				)
				.optional(),
			is_secret: z
				.boolean()
				.optional()
				.describe(
					"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
				),
		}),
	)
	.optional();

export const getSiteEnvVarsQueryContextNameSchema = z
	.enum(["all", "dev", "dev-server", "branch-deploy", "deploy-preview", "production"])
	.optional()
	.describe("Filter by deploy context");

export const getSiteEnvVarsQueryScopeSchema = z
	.enum(["builds", "functions", "runtime", "post_processing"])
	.optional()
	.describe("Filter by scope");

export const getSiteEnvVarsPathSiteIdSchema = z.string().describe("Scope response to site_id");

export const getSiteEnvVarsStatus200Schema = z.array(
	z.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	}),
);

export const getSiteEnvVarsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteEnvVarsResponseSchema = getSiteEnvVarsStatus200Schema;

export const getSiteEnvVarsErrorSchema = getSiteEnvVarsStatusDefaultSchema;

export const getEnvVarPathAccountIdSchema = z.string().describe("Scope response to account_id");

export const getEnvVarPathKeySchema = z
	.string()
	.describe("The environment variable key (case-sensitive)");

export const getEnvVarQuerySiteIdSchema = z
	.string()
	.optional()
	.describe(
		"If provided, return the environment variable for a specific site (no merging is performed)",
	);

export const getEnvVarStatus200Schema = z
	.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	})
	.describe("Environment variable model definition");

export const getEnvVarStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getEnvVarResponseSchema = getEnvVarStatus200Schema;

export const getEnvVarErrorSchema = getEnvVarStatusDefaultSchema;

export const updateEnvVarPathAccountIdSchema = z.string().describe("Scope response to account_id");

export const updateEnvVarPathKeySchema = z
	.string()
	.describe("The existing environment variable key name (case-sensitive)");

export const updateEnvVarQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If provided, update an environment variable set on this site");

export const updateEnvVarStatus200Schema = z
	.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	})
	.describe("Environment variable model definition");

export const updateEnvVarStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateEnvVarResponseSchema = updateEnvVarStatus200Schema;

export const updateEnvVarErrorSchema = updateEnvVarStatusDefaultSchema;

export const updateEnvVarBodySchema = z
	.object({
		key: z
			.string()
			.optional()
			.describe("The existing or new name of the key, if you wish to rename it (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to (Pro plans and above)"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional(),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
	})
	.optional();

export const setEnvVarValuePathAccountIdSchema = z
	.string()
	.describe("Scope response to account_id");

export const setEnvVarValuePathKeySchema = z
	.string()
	.describe("The existing environment variable key name (case-sensitive)");

export const setEnvVarValueQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If provided, update an environment variable set on this site");

export const setEnvVarValueStatus201Schema = z
	.object({
		key: z
			.string()
			.optional()
			.describe("The environment variable key, like ALGOLIA_ID (case-sensitive)"),
		scopes: z
			.array(z.enum(["builds", "functions", "runtime", "post-processing"]))
			.optional()
			.describe("The scopes that this environment variable is set to"),
		values: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The environment variable value's universally unique ID"),
					value: z.string().optional().describe("The environment variable's unencrypted value"),
					context: z
						.enum([
							"all",
							"dev",
							"dev-server",
							"branch-deploy",
							"deploy-preview",
							"production",
							"branch",
						])
						.optional()
						.describe(
							"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`.",
						),
					context_parameter: z
						.string()
						.optional()
						.describe(
							"An additional parameter for custom branches. Currently, this is used for specifying a branch name when `context=branch`.",
						),
				}),
			)
			.optional()
			.describe("An array of Value objects containing values and metadata"),
		is_secret: z
			.boolean()
			.optional()
			.describe(
				"Secret values are only readable by code running on Netlify's systems. With secrets, only the local development context values are readable from the UI, API, and CLI. By default, environment variable values are not secret.",
			),
		updated_at: z.iso
			.datetime()
			.optional()
			.describe("The timestamp of when the value was last updated"),
		updated_by: z
			.object({
				id: z.string().optional().describe("The user's unique identifier"),
				full_name: z.string().optional().describe("The user's full name (first and last)"),
				email: z.string().optional().describe("The user's email address"),
				avatar_url: z.string().optional().describe("A URL pointing to the user's avatar"),
			})
			.optional(),
	})
	.describe("Environment variable model definition");

export const setEnvVarValueStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const setEnvVarValueResponseSchema = setEnvVarValueStatus201Schema;

export const setEnvVarValueErrorSchema = setEnvVarValueStatusDefaultSchema;

export const setEnvVarValueBodySchema = z
	.object({
		context: z
			.enum(["all", "dev", "dev-server", "branch-deploy", "deploy-preview", "production", "branch"])
			.optional()
			.describe(
				"The deploy context in which this value will be used. `dev` refers to local development when running `netlify dev`. `branch` must be provided with a value in `context_parameter`.",
			),
		context_parameter: z
			.string()
			.optional()
			.describe(
				"An additional parameter for custom branches. Currently, this is used for providing a branch name when `context=branch`.",
			),
		value: z.string().optional().describe("The environment variable's unencrypted value"),
	})
	.optional();

export const deleteEnvVarPathAccountIdSchema = z.string().describe("Scope response to account_id");

export const deleteEnvVarPathKeySchema = z
	.string()
	.describe("The environment variable key (case-sensitive)");

export const deleteEnvVarQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If provided, delete the environment variable from this site");

export const deleteEnvVarStatus204Schema = z.unknown();

export const deleteEnvVarStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteEnvVarResponseSchema = deleteEnvVarStatus204Schema;

export const deleteEnvVarErrorSchema = deleteEnvVarStatusDefaultSchema;

export const deleteEnvVarValuePathAccountIdSchema = z
	.string()
	.describe("Scope response to account_id");

export const deleteEnvVarValuePathIdSchema = z
	.string()
	.describe("The environment variable value's ID");

export const deleteEnvVarValuePathKeySchema = z
	.string()
	.describe("The environment variable key name (case-sensitive)");

export const deleteEnvVarValueQuerySiteIdSchema = z
	.string()
	.optional()
	.describe("If provided, delete the value from an environment variable on this site");

export const deleteEnvVarValueStatus204Schema = z.unknown();

export const deleteEnvVarValueStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteEnvVarValueResponseSchema = deleteEnvVarValueStatus204Schema;

export const deleteEnvVarValueErrorSchema = deleteEnvVarValueStatusDefaultSchema;

export const searchSiteFunctionsPathSiteIdSchema = z.string();

export const searchSiteFunctionsQueryFilterSchema = z.string().optional();

export const searchSiteFunctionsStatus200Schema = z.array(
	z.object({
		branch: z.string().optional(),
		created_at: z.string().optional(),
		functions: z.array(z.object({})).optional(),
		id: z.string().optional(),
		log_type: z.string().optional(),
		provider: z.string().optional(),
	}),
);

export const searchSiteFunctionsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const searchSiteFunctionsResponseSchema = searchSiteFunctionsStatus200Schema;

export const searchSiteFunctionsErrorSchema = searchSiteFunctionsStatusDefaultSchema;

export const listSiteFormsPathSiteIdSchema = z.string();

export const listSiteFormsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		name: z.string().optional(),
		paths: z.array(z.string()).optional(),
		submission_count: z.int().optional(),
		fields: z.array(z.object({})).optional(),
		created_at: z.string().optional(),
	}),
);

export const listSiteFormsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteFormsResponseSchema = listSiteFormsStatus200Schema;

export const listSiteFormsErrorSchema = listSiteFormsStatusDefaultSchema;

export const deleteSiteFormPathSiteIdSchema = z.string();

export const deleteSiteFormPathFormIdSchema = z.string();

export const deleteSiteFormStatus204Schema = z.unknown();

export const deleteSiteFormStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteFormResponseSchema = deleteSiteFormStatus204Schema;

export const deleteSiteFormErrorSchema = deleteSiteFormStatusDefaultSchema;

export const listSiteSubmissionsPathSiteIdSchema = z.string();

export const listSiteSubmissionsQueryPageSchema = z.int().optional();

export const listSiteSubmissionsQueryPerPageSchema = z.int().optional();

export const listSiteSubmissionsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		number: z.int().optional(),
		email: z.string().optional(),
		name: z.string().optional(),
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		company: z.string().optional(),
		summary: z.string().optional(),
		body: z.string().optional(),
		data: z.object({}).optional(),
		created_at: z.string().optional(),
		site_url: z.string().optional(),
	}),
);

export const listSiteSubmissionsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteSubmissionsResponseSchema = listSiteSubmissionsStatus200Schema;

export const listSiteSubmissionsErrorSchema = listSiteSubmissionsStatusDefaultSchema;

export const listSiteFilesPathSiteIdSchema = z.string();

export const listSiteFilesStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		path: z.string().optional(),
		sha: z.string().optional(),
		mime_type: z.string().optional(),
		size: z.coerce.bigint().optional(),
	}),
);

export const listSiteFilesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteFilesResponseSchema = listSiteFilesStatus200Schema;

export const listSiteFilesErrorSchema = listSiteFilesStatusDefaultSchema;

export const listSiteAssetsPathSiteIdSchema = z.string();

export const listSiteAssetsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		creator_id: z.string().optional(),
		name: z.string().optional(),
		state: z.string().optional(),
		content_type: z.string().optional(),
		url: z.string().optional(),
		key: z.string().optional(),
		visibility: z.string().optional(),
		size: z.coerce.bigint().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	}),
);

export const listSiteAssetsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteAssetsResponseSchema = listSiteAssetsStatus200Schema;

export const listSiteAssetsErrorSchema = listSiteAssetsStatusDefaultSchema;

export const createSiteAssetPathSiteIdSchema = z.string();

export const createSiteAssetQueryNameSchema = z.string();

export const createSiteAssetQuerySizeSchema = z.coerce.bigint();

export const createSiteAssetQueryContentTypeSchema = z.string();

export const createSiteAssetQueryVisibilitySchema = z.string().optional();

export const createSiteAssetStatus201Schema = z.object({
	form: z
		.object({
			url: z.string().optional(),
			fields: z.object({}).catchall(z.string()).optional(),
		})
		.optional(),
	asset: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			creator_id: z.string().optional(),
			name: z.string().optional(),
			state: z.string().optional(),
			content_type: z.string().optional(),
			url: z.string().optional(),
			key: z.string().optional(),
			visibility: z.string().optional(),
			size: z.coerce.bigint().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
		})
		.optional(),
});

export const createSiteAssetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteAssetResponseSchema = createSiteAssetStatus201Schema;

export const createSiteAssetErrorSchema = createSiteAssetStatusDefaultSchema;

export const getSiteAssetInfoPathSiteIdSchema = z.string();

export const getSiteAssetInfoPathAssetIdSchema = z.string();

export const getSiteAssetInfoStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	creator_id: z.string().optional(),
	name: z.string().optional(),
	state: z.string().optional(),
	content_type: z.string().optional(),
	url: z.string().optional(),
	key: z.string().optional(),
	visibility: z.string().optional(),
	size: z.coerce.bigint().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const getSiteAssetInfoStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteAssetInfoResponseSchema = getSiteAssetInfoStatus200Schema;

export const getSiteAssetInfoErrorSchema = getSiteAssetInfoStatusDefaultSchema;

export const updateSiteAssetPathSiteIdSchema = z.string();

export const updateSiteAssetPathAssetIdSchema = z.string();

export const updateSiteAssetQueryStateSchema = z.string();

export const updateSiteAssetStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	creator_id: z.string().optional(),
	name: z.string().optional(),
	state: z.string().optional(),
	content_type: z.string().optional(),
	url: z.string().optional(),
	key: z.string().optional(),
	visibility: z.string().optional(),
	size: z.coerce.bigint().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const updateSiteAssetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteAssetResponseSchema = updateSiteAssetStatus200Schema;

export const updateSiteAssetErrorSchema = updateSiteAssetStatusDefaultSchema;

export const deleteSiteAssetPathSiteIdSchema = z.string();

export const deleteSiteAssetPathAssetIdSchema = z.string();

export const deleteSiteAssetStatus204Schema = z.unknown();

export const deleteSiteAssetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteAssetResponseSchema = deleteSiteAssetStatus204Schema;

export const deleteSiteAssetErrorSchema = deleteSiteAssetStatusDefaultSchema;

export const getSiteAssetPublicSignaturePathSiteIdSchema = z.string();

export const getSiteAssetPublicSignaturePathAssetIdSchema = z.string();

export const getSiteAssetPublicSignatureStatus200Schema = z.object({
	url: z.string().optional(),
});

export const getSiteAssetPublicSignatureStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteAssetPublicSignatureResponseSchema = getSiteAssetPublicSignatureStatus200Schema;

export const getSiteAssetPublicSignatureErrorSchema =
	getSiteAssetPublicSignatureStatusDefaultSchema;

export const getSiteFileByPathNamePathSiteIdSchema = z.string();

export const getSiteFileByPathNamePathFilePathSchema = z.string();

export const getSiteFileByPathNameStatus200Schema = z.object({
	id: z.string().optional(),
	path: z.string().optional(),
	sha: z.string().optional(),
	mime_type: z.string().optional(),
	size: z.coerce.bigint().optional(),
});

export const getSiteFileByPathNameStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteFileByPathNameResponseSchema = getSiteFileByPathNameStatus200Schema;

export const getSiteFileByPathNameErrorSchema = getSiteFileByPathNameStatusDefaultSchema;

export const purgeCacheStatus202Schema = z.unknown();

export const purgeCacheStatus400Schema = z.unknown();

export const purgeCacheStatus404Schema = z.unknown();

export const purgeCacheResponseSchema = purgeCacheStatus202Schema;

export const purgeCacheErrorSchema = z.union([
	purgeCacheStatus400Schema,
	purgeCacheStatus404Schema,
]);

export const purgeCacheBodySchema = z.object({
	site_id: z.string().optional(),
	site_slug: z.string().optional(),
	cache_tags: z.array(z.string()).optional(),
});

export const listSiteSnippetsPathSiteIdSchema = z.string();

export const listSiteSnippetsStatus200Schema = z.array(
	z.object({
		id: z.int().optional(),
		site_id: z.string().optional(),
		title: z.string().optional(),
		general: z.string().optional(),
		general_position: z.string().optional(),
		goal: z.string().optional(),
		goal_position: z.string().optional(),
	}),
);

export const listSiteSnippetsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteSnippetsResponseSchema = listSiteSnippetsStatus200Schema;

export const listSiteSnippetsErrorSchema = listSiteSnippetsStatusDefaultSchema;

export const createSiteSnippetPathSiteIdSchema = z.string();

export const createSiteSnippetStatus201Schema = z.object({
	id: z.int().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	general: z.string().optional(),
	general_position: z.string().optional(),
	goal: z.string().optional(),
	goal_position: z.string().optional(),
});

export const createSiteSnippetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteSnippetResponseSchema = createSiteSnippetStatus201Schema;

export const createSiteSnippetErrorSchema = createSiteSnippetStatusDefaultSchema;

export const createSiteSnippetBodySchema = z.object({
	id: z.int().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	general: z.string().optional(),
	general_position: z.string().optional(),
	goal: z.string().optional(),
	goal_position: z.string().optional(),
});

export const getSiteSnippetPathSiteIdSchema = z.string();

export const getSiteSnippetPathSnippetIdSchema = z.string();

export const getSiteSnippetStatus200Schema = z.object({
	id: z.int().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	general: z.string().optional(),
	general_position: z.string().optional(),
	goal: z.string().optional(),
	goal_position: z.string().optional(),
});

export const getSiteSnippetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteSnippetResponseSchema = getSiteSnippetStatus200Schema;

export const getSiteSnippetErrorSchema = getSiteSnippetStatusDefaultSchema;

export const updateSiteSnippetPathSiteIdSchema = z.string();

export const updateSiteSnippetPathSnippetIdSchema = z.string();

export const updateSiteSnippetStatus204Schema = z.unknown();

export const updateSiteSnippetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteSnippetResponseSchema = updateSiteSnippetStatus204Schema;

export const updateSiteSnippetErrorSchema = updateSiteSnippetStatusDefaultSchema;

export const updateSiteSnippetBodySchema = z.object({
	id: z.int().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	general: z.string().optional(),
	general_position: z.string().optional(),
	goal: z.string().optional(),
	goal_position: z.string().optional(),
});

export const deleteSiteSnippetPathSiteIdSchema = z.string();

export const deleteSiteSnippetPathSnippetIdSchema = z.string();

export const deleteSiteSnippetStatus204Schema = z.unknown();

export const deleteSiteSnippetStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteSnippetResponseSchema = deleteSiteSnippetStatus204Schema;

export const deleteSiteSnippetErrorSchema = deleteSiteSnippetStatusDefaultSchema;

export const getSiteMetadataPathSiteIdSchema = z.string();

export const getSiteMetadataStatus200Schema = z.object({});

export const getSiteMetadataStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteMetadataResponseSchema = getSiteMetadataStatus200Schema;

export const getSiteMetadataErrorSchema = getSiteMetadataStatusDefaultSchema;

export const updateSiteMetadataPathSiteIdSchema = z.string();

export const updateSiteMetadataStatus204Schema = z.unknown();

export const updateSiteMetadataStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteMetadataResponseSchema = updateSiteMetadataStatus204Schema;

export const updateSiteMetadataErrorSchema = updateSiteMetadataStatusDefaultSchema;

export const updateSiteMetadataBodySchema = z.object({});

export const listSiteBuildHooksPathSiteIdSchema = z.string();

export const listSiteBuildHooksStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		url: z.string().optional(),
		site_id: z.string().optional(),
		created_at: z.string().optional(),
	}),
);

export const listSiteBuildHooksStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteBuildHooksResponseSchema = listSiteBuildHooksStatus200Schema;

export const listSiteBuildHooksErrorSchema = listSiteBuildHooksStatusDefaultSchema;

export const createSiteBuildHookPathSiteIdSchema = z.string();

export const createSiteBuildHookStatus201Schema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
});

export const createSiteBuildHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteBuildHookResponseSchema = createSiteBuildHookStatus201Schema;

export const createSiteBuildHookErrorSchema = createSiteBuildHookStatusDefaultSchema;

export const createSiteBuildHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
});

export const getSiteBuildHookPathSiteIdSchema = z.string();

export const getSiteBuildHookPathIdSchema = z.string();

export const getSiteBuildHookStatus200Schema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
});

export const getSiteBuildHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteBuildHookResponseSchema = getSiteBuildHookStatus200Schema;

export const getSiteBuildHookErrorSchema = getSiteBuildHookStatusDefaultSchema;

export const updateSiteBuildHookPathSiteIdSchema = z.string();

export const updateSiteBuildHookPathIdSchema = z.string();

export const updateSiteBuildHookStatus204Schema = z.unknown();

export const updateSiteBuildHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteBuildHookResponseSchema = updateSiteBuildHookStatus204Schema;

export const updateSiteBuildHookErrorSchema = updateSiteBuildHookStatusDefaultSchema;

export const updateSiteBuildHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
});

export const deleteSiteBuildHookPathSiteIdSchema = z.string();

export const deleteSiteBuildHookPathIdSchema = z.string();

export const deleteSiteBuildHookStatus204Schema = z.unknown();

export const deleteSiteBuildHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteBuildHookResponseSchema = deleteSiteBuildHookStatus204Schema;

export const deleteSiteBuildHookErrorSchema = deleteSiteBuildHookStatusDefaultSchema;

export const listSiteDeploysPathSiteIdSchema = z.string();

export const listSiteDeploysQueryDeployPreviewsSchema = z.boolean().optional();

export const listSiteDeploysQueryProductionSchema = z.boolean().optional();

export const listSiteDeploysQueryStateSchema = z
	.enum([
		"new",
		"pending_review",
		"accepted",
		"rejected",
		"enqueued",
		"building",
		"uploading",
		"uploaded",
		"preparing",
		"prepared",
		"processing",
		"processed",
		"ready",
		"error",
		"retrying",
	])
	.optional();

export const listSiteDeploysQueryBranchSchema = z.string().optional();

export const listSiteDeploysQueryLatestPublishedSchema = z.boolean().optional();

export const listSiteDeploysQueryPageSchema = z.int().optional();

export const listSiteDeploysQueryPerPageSchema = z.int().optional();

export const listSiteDeploysStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		user_id: z.string().optional(),
		build_id: z.string().optional(),
		state: z.string().optional(),
		name: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		deploy_url: z.string().optional(),
		deploy_ssl_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		review_id: z.number().optional(),
		draft: z.boolean().optional(),
		required: z.array(z.string()).optional(),
		required_functions: z.array(z.string()).optional(),
		required_edge_functions: z
			.array(z.string())
			.optional()
			.describe(
				"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
			),
		error_message: z.string().optional(),
		branch: z.string().optional(),
		commit_ref: z.string().optional(),
		commit_url: z.string().optional(),
		skipped: z.boolean().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		published_at: z.string().optional(),
		title: z.string().optional(),
		context: z.string().optional(),
		locked: z.boolean().optional(),
		review_url: z.string().optional(),
		framework: z.string().optional(),
		skew_protection_token: z.string().optional(),
		function_schedules: z
			.array(
				z.object({
					name: z.string().optional(),
					cron: z.string().optional(),
				}),
			)
			.optional(),
		functions_region: z
			.string()
			.optional()
			.describe("The functions region for this deploy as an airport code.\n"),
		functions_region_overrides: z
			.array(
				z.object({
					name: z.string().optional(),
					region: z.string().optional(),
				}),
			)
			.optional()
			.describe(
				"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
			),
	}),
);

export const listSiteDeploysStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDeploysResponseSchema = listSiteDeploysStatus200Schema;

export const listSiteDeploysErrorSchema = listSiteDeploysStatusDefaultSchema;

export const createSiteDeployPathSiteIdSchema = z.string();

export const createSiteDeployQueryDeployPreviewsSchema = z.boolean().optional();

export const createSiteDeployQueryProductionSchema = z.boolean().optional();

export const createSiteDeployQueryStateSchema = z
	.enum([
		"new",
		"pending_review",
		"accepted",
		"rejected",
		"enqueued",
		"building",
		"uploading",
		"uploaded",
		"preparing",
		"prepared",
		"processing",
		"processed",
		"ready",
		"error",
		"retrying",
	])
	.optional();

export const createSiteDeployQueryBranchSchema = z.string().optional();

export const createSiteDeployQueryLatestPublishedSchema = z.boolean().optional();

export const createSiteDeployQueryTitleSchema = z.string().optional();

export const createSiteDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const createSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDeployResponseSchema = createSiteDeployStatus200Schema;

export const createSiteDeployErrorSchema = createSiteDeployStatusDefaultSchema;

export const createSiteDeployBodySchema = z
	.object({
		files: z
			.object({})
			.optional()
			.describe("A hash mapping file paths to SHA1 digests of the file contents."),
		zip: z
			.instanceof(File)
			.optional()
			.describe(
				"A zip file containing the site files to deploy. Alternative to 'files'.\nTo use this field, set Content-Type to 'application/json' and include the zip content here.\nAlternatively, you can set Content-Type to 'application/zip' and send the zip as the raw request body (not as JSON).\n",
			),
		draft: z.boolean().optional(),
		async: z.boolean().optional(),
		functions: z.object({}).optional(),
		edge_functions: z
			.object({})
			.optional()
			.describe(
				"A hash mapping edge-function bundle formats to the code_sha of each bundle. The\nresponse's required_edge_functions lists which of these still need to be uploaded.\n",
			),
		function_schedules: z
			.array(
				z.object({
					name: z.string().optional(),
					cron: z.string().optional(),
				}),
			)
			.optional(),
		functions_config: z
			.object({})
			.catchall(
				z.object({
					display_name: z.string().optional(),
					generator: z.string().optional(),
					build_data: z.object({}).optional(),
					memory: z
						.int()
						.optional()
						.describe("The function's memory allocation in MB. Mutually exclusive with `vcpu`.\n"),
					routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
								methods: z
									.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]))
									.optional(),
								prefer_static: z.boolean().optional(),
							}),
						)
						.optional(),
					excluded_routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
							}),
						)
						.optional(),
					priority: z.int().optional(),
					region: z.string().optional(),
					traffic_rules: z
						.object({
							action: z
								.object({
									type: z.string().optional(),
									config: z
										.object({
											to: z.string().optional(),
											rate_limit_config: z
												.object({
													algorithm: z.enum(["sliding_window"]).optional(),
													window_size: z.int().optional(),
													window_limit: z.int().optional(),
												})
												.optional(),
											aggregate: z
												.object({
													keys: z
														.array(
															z.object({
																type: z.enum(["ip", "domain"]).optional(),
															}),
														)
														.optional(),
												})
												.optional(),
										})
										.optional(),
								})
								.optional(),
						})
						.optional(),
					vcpu: z
						.number()
						.optional()
						.describe("Number of vCPUs to provision for the function. Allowed range is\n0.5–2.\n"),
					event_subscriptions: z.array(z.string()).optional(),
				}),
			)
			.optional(),
		branch: z.string().optional(),
		framework: z.string().optional(),
		framework_version: z.string().optional(),
		environment: z
			.array(
				z.object({
					key: z.string(),
					value: z.string(),
					is_secret: z.boolean(),
					scopes: z.array(z.enum(["builds", "functions", "runtime", "post-processing"])),
				}),
			)
			.optional()
			.describe(
				"A list of deploy-specific environment variable data. Data specified this way applies only\nto this specific deploy and is merged into any existing environment variables set on the\naccount and site.\n\nDeploy-specific environment variable data takes precedence over account and site\nenvironment variable data: For example, a deploy-specific variable with the key `NODE_ENV`\nwill take priority over any existing site- and account-level environment variable data\nwith the key `NODE_ENV`.\n\nEnvironment variable data may be provided at one of two times:\n\n- When creating a new Deploy with deploy files (most common)\n- When finalizing an existing Deploy with deploy files\n\nOnce set, environment variables for a specific deploy cannot be modified. Subsequent\nattempts to modify environment variable data for a deploy will be ignored.\n",
			),
	})
	.describe(
		"Deploy files can be provided in two ways:\n1. As a JSON object using 'files' (a hash mapping file paths to SHA1 digests), OR\n2. As a zip file using one of these methods:\n   - Set Content-Type to 'application/zip' and send the zip file as the raw request body\n   - Include the zip file content in the 'zip' field of this JSON object with Content-Type 'application/json'\n",
	);

export const getSiteDeployPathSiteIdSchema = z.string();

export const getSiteDeployPathDeployIdSchema = z.string();

export const getSiteDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const getSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDeployResponseSchema = getSiteDeployStatus200Schema;

export const getSiteDeployErrorSchema = getSiteDeployStatusDefaultSchema;

export const updateSiteDeployPathSiteIdSchema = z.string();

export const updateSiteDeployPathDeployIdSchema = z.string();

export const updateSiteDeployQueryCommitRefSchema = z.string().optional();

export const updateSiteDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const updateSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteDeployResponseSchema = updateSiteDeployStatus200Schema;

export const updateSiteDeployErrorSchema = updateSiteDeployStatusDefaultSchema;

export const updateSiteDeployBodySchema = z
	.object({
		files: z
			.object({})
			.optional()
			.describe("A hash mapping file paths to SHA1 digests of the file contents."),
		zip: z
			.instanceof(File)
			.optional()
			.describe(
				"A zip file containing the site files to deploy. Alternative to 'files'.\nTo use this field, set Content-Type to 'application/json' and include the zip content here.\nAlternatively, you can set Content-Type to 'application/zip' and send the zip as the raw request body (not as JSON).\n",
			),
		draft: z.boolean().optional(),
		async: z.boolean().optional(),
		functions: z.object({}).optional(),
		edge_functions: z
			.object({})
			.optional()
			.describe(
				"A hash mapping edge-function bundle formats to the code_sha of each bundle. The\nresponse's required_edge_functions lists which of these still need to be uploaded.\n",
			),
		function_schedules: z
			.array(
				z.object({
					name: z.string().optional(),
					cron: z.string().optional(),
				}),
			)
			.optional(),
		functions_config: z
			.object({})
			.catchall(
				z.object({
					display_name: z.string().optional(),
					generator: z.string().optional(),
					build_data: z.object({}).optional(),
					memory: z
						.int()
						.optional()
						.describe("The function's memory allocation in MB. Mutually exclusive with `vcpu`.\n"),
					routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
								methods: z
									.array(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]))
									.optional(),
								prefer_static: z.boolean().optional(),
							}),
						)
						.optional(),
					excluded_routes: z
						.array(
							z.object({
								pattern: z.string().optional(),
								literal: z.string().optional(),
								expression: z.string().optional(),
							}),
						)
						.optional(),
					priority: z.int().optional(),
					region: z.string().optional(),
					traffic_rules: z
						.object({
							action: z
								.object({
									type: z.string().optional(),
									config: z
										.object({
											to: z.string().optional(),
											rate_limit_config: z
												.object({
													algorithm: z.enum(["sliding_window"]).optional(),
													window_size: z.int().optional(),
													window_limit: z.int().optional(),
												})
												.optional(),
											aggregate: z
												.object({
													keys: z
														.array(
															z.object({
																type: z.enum(["ip", "domain"]).optional(),
															}),
														)
														.optional(),
												})
												.optional(),
										})
										.optional(),
								})
								.optional(),
						})
						.optional(),
					vcpu: z
						.number()
						.optional()
						.describe("Number of vCPUs to provision for the function. Allowed range is\n0.5–2.\n"),
					event_subscriptions: z.array(z.string()).optional(),
				}),
			)
			.optional(),
		branch: z.string().optional(),
		framework: z.string().optional(),
		framework_version: z.string().optional(),
		environment: z
			.array(
				z.object({
					key: z.string(),
					value: z.string(),
					is_secret: z.boolean(),
					scopes: z.array(z.enum(["builds", "functions", "runtime", "post-processing"])),
				}),
			)
			.optional()
			.describe(
				"A list of deploy-specific environment variable data. Data specified this way applies only\nto this specific deploy and is merged into any existing environment variables set on the\naccount and site.\n\nDeploy-specific environment variable data takes precedence over account and site\nenvironment variable data: For example, a deploy-specific variable with the key `NODE_ENV`\nwill take priority over any existing site- and account-level environment variable data\nwith the key `NODE_ENV`.\n\nEnvironment variable data may be provided at one of two times:\n\n- When creating a new Deploy with deploy files (most common)\n- When finalizing an existing Deploy with deploy files\n\nOnce set, environment variables for a specific deploy cannot be modified. Subsequent\nattempts to modify environment variable data for a deploy will be ignored.\n",
			),
	})
	.describe(
		"Deploy files can be provided in two ways:\n1. As a JSON object using 'files' (a hash mapping file paths to SHA1 digests), OR\n2. As a zip file using one of these methods:\n   - Set Content-Type to 'application/zip' and send the zip file as the raw request body\n   - Include the zip file content in the 'zip' field of this JSON object with Content-Type 'application/json'\n",
	);

export const deleteSiteDeployPathDeployIdSchema = z.string();

export const deleteSiteDeployPathSiteIdSchema = z.string();

export const deleteSiteDeployStatus204Schema = z.unknown();

export const deleteSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDeployResponseSchema = deleteSiteDeployStatus204Schema;

export const deleteSiteDeployErrorSchema = deleteSiteDeployStatusDefaultSchema;

export const cancelSiteDeployPathDeployIdSchema = z.string();

export const cancelSiteDeployStatus201Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const cancelSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const cancelSiteDeployResponseSchema = cancelSiteDeployStatus201Schema;

export const cancelSiteDeployErrorSchema = cancelSiteDeployStatusDefaultSchema;

export const restoreSiteDeployPathSiteIdSchema = z.string();

export const restoreSiteDeployPathDeployIdSchema = z.string();

export const restoreSiteDeployStatus201Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const restoreSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const restoreSiteDeployResponseSchema = restoreSiteDeployStatus201Schema;

export const restoreSiteDeployErrorSchema = restoreSiteDeployStatusDefaultSchema;

export const listSiteBuildsPathSiteIdSchema = z.string();

export const listSiteBuildsQueryPageSchema = z.int().optional();

export const listSiteBuildsQueryPerPageSchema = z.int().optional();

export const listSiteBuildsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		deploy_id: z.string().optional(),
		sha: z.string().optional(),
		done: z.boolean().optional(),
		error: z.string().optional(),
		created_at: z.string().optional(),
	}),
);

export const listSiteBuildsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteBuildsResponseSchema = listSiteBuildsStatus200Schema;

export const listSiteBuildsErrorSchema = listSiteBuildsStatusDefaultSchema;

export const createSiteBuildPathSiteIdSchema = z.string();

export const createSiteBuildQueryBranchSchema = z
	.string()
	.optional()
	.describe(
		"If no branch is specified, it is treated as a production deploy If a branch IS specified and matches the main branch, it is also production If a branch is specified and doesn't match the main branch, it is a branch deploy",
	);

export const createSiteBuildQueryClearCacheSchema = z
	.boolean()
	.optional()
	.describe("Whether to clear the build cache before building");

export const createSiteBuildQueryImageSchema = z
	.string()
	.optional()
	.describe("The build image tag to use for the build");

export const createSiteBuildQueryTemplateIdSchema = z
	.string()
	.optional()
	.describe("The build template to use for the build");

export const createSiteBuildQueryTitleSchema = z
	.string()
	.optional()
	.describe("The title of the build");

export const createSiteBuildStatus200Schema = z.object({
	id: z.string().optional(),
	deploy_id: z.string().optional(),
	sha: z.string().optional(),
	done: z.boolean().optional(),
	error: z.string().optional(),
	created_at: z.string().optional(),
});

export const createSiteBuildStatus400Schema = z.unknown();

export const createSiteBuildStatus404Schema = z.unknown();

export const createSiteBuildStatus422Schema = z.unknown();

export const createSiteBuildStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteBuildResponseSchema = createSiteBuildStatus200Schema;

export const createSiteBuildErrorSchema = z.union([
	createSiteBuildStatus400Schema,
	createSiteBuildStatus404Schema,
	createSiteBuildStatus422Schema,
	createSiteBuildStatusDefaultSchema,
]);

export const listSiteDeployedBranchesPathSiteIdSchema = z.string();

export const listSiteDeployedBranchesStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		deploy_id: z.string().optional(),
		name: z.string().optional(),
		slug: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
	}),
);

export const listSiteDeployedBranchesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDeployedBranchesResponseSchema = listSiteDeployedBranchesStatus200Schema;

export const listSiteDeployedBranchesErrorSchema = listSiteDeployedBranchesStatusDefaultSchema;

export const unlinkSiteRepoPathSiteIdSchema = z.string();

export const unlinkSiteRepoStatus200Schema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const unlinkSiteRepoStatus404Schema = z.unknown();

export const unlinkSiteRepoResponseSchema = unlinkSiteRepoStatus200Schema;

export const unlinkSiteRepoErrorSchema = unlinkSiteRepoStatus404Schema;

export const enableSitePathSiteIdSchema = z.string();

export const enableSiteStatus204Schema = z.unknown();

export const enableSiteStatus422Schema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const enableSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const enableSiteResponseSchema = enableSiteStatus204Schema;

export const enableSiteErrorSchema = z.union([
	enableSiteStatus422Schema,
	enableSiteStatusDefaultSchema,
]);

export const disableSitePathSiteIdSchema = z.string();

export const disableSiteQueryReasonSchema = z.string().describe("Reason for disabling the site");

export const disableSiteStatus204Schema = z.unknown();

export const disableSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const disableSiteResponseSchema = disableSiteStatus204Schema;

export const disableSiteErrorSchema = disableSiteStatusDefaultSchema;

export const getSiteBuildPathBuildIdSchema = z.string();

export const getSiteBuildStatus200Schema = z.object({
	id: z.string().optional(),
	deploy_id: z.string().optional(),
	sha: z.string().optional(),
	done: z.boolean().optional(),
	error: z.string().optional(),
	created_at: z.string().optional(),
});

export const getSiteBuildStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteBuildResponseSchema = getSiteBuildStatus200Schema;

export const getSiteBuildErrorSchema = getSiteBuildStatusDefaultSchema;

export const updateSiteBuildLogPathBuildIdSchema = z.string();

export const updateSiteBuildLogStatus204Schema = z.unknown();

export const updateSiteBuildLogStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteBuildLogResponseSchema = updateSiteBuildLogStatus204Schema;

export const updateSiteBuildLogErrorSchema = updateSiteBuildLogStatusDefaultSchema;

export const updateSiteBuildLogBodySchema = z.object({
	message: z.string().optional(),
	error: z.boolean().optional(),
	section: z
		.enum(["initializing", "building", "deploying", "cleanup", "postprocessing"])
		.optional(),
});

export const notifyBuildStartPathBuildIdSchema = z.string();

export const notifyBuildStartQueryBuildbotVersionSchema = z.string().optional();

export const notifyBuildStartQueryBuildVersionSchema = z.string().optional();

export const notifyBuildStartQueryTaskIdSchema = z.string().optional();

export const notifyBuildStartStatus204Schema = z.unknown();

export const notifyBuildStartStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const notifyBuildStartResponseSchema = notifyBuildStartStatus204Schema;

export const notifyBuildStartErrorSchema = notifyBuildStartStatusDefaultSchema;

export const getAccountBuildStatusPathAccountIdSchema = z.string();

export const getAccountBuildStatusStatus200Schema = z.array(
	z.object({
		active: z.int().optional(),
		pending_concurrency: z.int().optional(),
		enqueued: z.int().optional(),
		build_count: z.int().optional(),
		minutes: z
			.object({
				current: z.int().optional(),
				current_average_sec: z.int().optional(),
				previous: z.int().optional(),
				period_start_date: z.string().optional(),
				period_end_date: z.string().optional(),
				last_updated_at: z.string().optional(),
				included_minutes: z.string().optional(),
				included_minutes_with_packs: z.string().optional(),
			})
			.optional(),
	}),
);

export const getAccountBuildStatusStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAccountBuildStatusResponseSchema = getAccountBuildStatusStatus200Schema;

export const getAccountBuildStatusErrorSchema = getAccountBuildStatusStatusDefaultSchema;

export const getDNSForSitePathSiteIdSchema = z.string();

export const getDNSForSiteStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		errors: z.array(z.string()).optional(),
		supported_record_types: z.array(z.string()).optional(),
		user_id: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		records: z
			.array(
				z.object({
					id: z.string().optional(),
					hostname: z.string().optional(),
					type: z.string().optional(),
					value: z.string().optional(),
					ttl: z.coerce.bigint().optional(),
					priority: z.coerce.bigint().optional(),
					dns_zone_id: z.string().optional(),
					site_id: z.string().optional(),
					flag: z.int().optional(),
					tag: z.string().optional(),
					managed: z.boolean().optional(),
				}),
			)
			.optional(),
		dns_servers: z.array(z.string()).optional(),
		account_id: z.string().optional(),
		site_id: z.string().optional(),
		account_slug: z.string().optional(),
		account_name: z.string().optional(),
		domain: z.string().optional(),
		ipv6_enabled: z.boolean().optional(),
		dedicated: z.boolean().optional(),
	}),
);

export const getDNSForSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDNSForSiteResponseSchema = getDNSForSiteStatus200Schema;

export const getDNSForSiteErrorSchema = getDNSForSiteStatusDefaultSchema;

export const configureDNSForSitePathSiteIdSchema = z.string();

export const configureDNSForSiteStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		errors: z.array(z.string()).optional(),
		supported_record_types: z.array(z.string()).optional(),
		user_id: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		records: z
			.array(
				z.object({
					id: z.string().optional(),
					hostname: z.string().optional(),
					type: z.string().optional(),
					value: z.string().optional(),
					ttl: z.coerce.bigint().optional(),
					priority: z.coerce.bigint().optional(),
					dns_zone_id: z.string().optional(),
					site_id: z.string().optional(),
					flag: z.int().optional(),
					tag: z.string().optional(),
					managed: z.boolean().optional(),
				}),
			)
			.optional(),
		dns_servers: z.array(z.string()).optional(),
		account_id: z.string().optional(),
		site_id: z.string().optional(),
		account_slug: z.string().optional(),
		account_name: z.string().optional(),
		domain: z.string().optional(),
		ipv6_enabled: z.boolean().optional(),
		dedicated: z.boolean().optional(),
	}),
);

export const configureDNSForSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const configureDNSForSiteResponseSchema = configureDNSForSiteStatus200Schema;

export const configureDNSForSiteErrorSchema = configureDNSForSiteStatusDefaultSchema;

export const rollbackSiteDeployPathSiteIdSchema = z.string();

export const rollbackSiteDeployStatus204Schema = z.unknown();

export const rollbackSiteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const rollbackSiteDeployResponseSchema = rollbackSiteDeployStatus204Schema;

export const rollbackSiteDeployErrorSchema = rollbackSiteDeployStatusDefaultSchema;

export const getDeployPathDeployIdSchema = z.string();

export const getDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const getDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDeployResponseSchema = getDeployStatus200Schema;

export const getDeployErrorSchema = getDeployStatusDefaultSchema;

export const deleteDeployPathDeployIdSchema = z.string();

export const deleteDeployStatus204Schema = z.unknown();

export const deleteDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteDeployResponseSchema = deleteDeployStatus204Schema;

export const deleteDeployErrorSchema = deleteDeployStatusDefaultSchema;

export const updateDeployValidationsPathDeployIdSchema = z
	.string()
	.describe("The ID of the deploy");

export const updateDeployValidationsStatus200Schema = z.object({
	id: z.string().optional().describe("The id of the deploy validations report"),
	deploy_id: z.string().optional().describe("The id of the deploy"),
	secret_scan_result: z
		.object({
			scannedFilesCount: z.int().optional().describe("The number of files scanned"),
			secretsScanMatches: z
				.array(z.string())
				.optional()
				.describe("The list of secrets scan matches"),
		})
		.optional(),
});

export const updateDeployValidationsResponseSchema = updateDeployValidationsStatus200Schema;

export const updateDeployValidationsBodySchema = z.object({
	secrets_scan: z.object({}).optional(),
});

export const lockDeployPathDeployIdSchema = z.string();

export const lockDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const lockDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const lockDeployResponseSchema = lockDeployStatus200Schema;

export const lockDeployErrorSchema = lockDeployStatusDefaultSchema;

export const unlockDeployPathDeployIdSchema = z.string();

export const unlockDeployStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	user_id: z.string().optional(),
	build_id: z.string().optional(),
	state: z.string().optional(),
	name: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	deploy_url: z.string().optional(),
	deploy_ssl_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	review_id: z.number().optional(),
	draft: z.boolean().optional(),
	required: z.array(z.string()).optional(),
	required_functions: z.array(z.string()).optional(),
	required_edge_functions: z
		.array(z.string())
		.optional()
		.describe(
			"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
		),
	error_message: z.string().optional(),
	branch: z.string().optional(),
	commit_ref: z.string().optional(),
	commit_url: z.string().optional(),
	skipped: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	published_at: z.string().optional(),
	title: z.string().optional(),
	context: z.string().optional(),
	locked: z.boolean().optional(),
	review_url: z.string().optional(),
	framework: z.string().optional(),
	skew_protection_token: z.string().optional(),
	function_schedules: z
		.array(
			z.object({
				name: z.string().optional(),
				cron: z.string().optional(),
			}),
		)
		.optional(),
	functions_region: z
		.string()
		.optional()
		.describe("The functions region for this deploy as an airport code.\n"),
	functions_region_overrides: z
		.array(
			z.object({
				name: z.string().optional(),
				region: z.string().optional(),
			}),
		)
		.optional()
		.describe(
			"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
		),
});

export const unlockDeployStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const unlockDeployResponseSchema = unlockDeployStatus200Schema;

export const unlockDeployErrorSchema = unlockDeployStatusDefaultSchema;

export const uploadDeployFilePathDeployIdSchema = z.string();

export const uploadDeployFilePathPathSchema = z.string();

export const uploadDeployFileQuerySizeSchema = z.int().optional();

export const uploadDeployFileStatus200Schema = z.object({
	id: z.string().optional(),
	path: z.string().optional(),
	sha: z.string().optional(),
	mime_type: z.string().optional(),
	size: z.coerce.bigint().optional(),
});

export const uploadDeployFileStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const uploadDeployFileResponseSchema = uploadDeployFileStatus200Schema;

export const uploadDeployFileErrorSchema = uploadDeployFileStatusDefaultSchema;

export const uploadDeployFunctionPathDeployIdSchema = z.string();

export const uploadDeployFunctionPathNameSchema = z.string();

export const uploadDeployFunctionQueryRuntimeSchema = z.string().optional();

export const uploadDeployFunctionQueryInvocationModeSchema = z.string().optional();

export const uploadDeployFunctionQueryTimeoutSchema = z.int().optional();

export const uploadDeployFunctionQuerySizeSchema = z.int().optional();

export const uploadDeployFunctionHeaderXNfRetryCountSchema = z.int().optional();

export const uploadDeployFunctionStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	sha: z.string().optional(),
	region: z.string().optional(),
});

export const uploadDeployFunctionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const uploadDeployFunctionResponseSchema = uploadDeployFunctionStatus200Schema;

export const uploadDeployFunctionErrorSchema = uploadDeployFunctionStatusDefaultSchema;

export const uploadDeployEdgeFunctionPathDeployIdSchema = z.string();

export const uploadDeployEdgeFunctionPathCodeShaSchema = z.string();

export const uploadDeployEdgeFunctionHeaderXNfRetryCountSchema = z.int().optional();

export const uploadDeployEdgeFunctionStatus200Schema = z.unknown();

export const uploadDeployEdgeFunctionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const uploadDeployEdgeFunctionResponseSchema = uploadDeployEdgeFunctionStatus200Schema;

export const uploadDeployEdgeFunctionErrorSchema = uploadDeployEdgeFunctionStatusDefaultSchema;

export const getLatestPluginRunsPathSiteIdSchema = z.string();

export const getLatestPluginRunsQueryPackagesSchema = z.array(z.string());

export const getLatestPluginRunsQueryStateSchema = z.string().optional();

export const getLatestPluginRunsStatus200Schema = z.array(
	z
		.object({
			package: z.string().optional(),
			version: z.string().optional(),
			state: z.string().optional(),
			reporting_event: z.string().optional(),
			title: z.string().optional(),
			summary: z.string().optional(),
			text: z.string().optional(),
		})
		.extend({
			deploy_id: z.string().optional(),
		}),
);

export const getLatestPluginRunsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getLatestPluginRunsResponseSchema = getLatestPluginRunsStatus200Schema;

export const getLatestPluginRunsErrorSchema = getLatestPluginRunsStatusDefaultSchema;

export const createPluginRunPathDeployIdSchema = z.string();

export const createPluginRunStatus201Schema = z
	.object({
		package: z.string().optional(),
		version: z.string().optional(),
		state: z.string().optional(),
		reporting_event: z.string().optional(),
		title: z.string().optional(),
		summary: z.string().optional(),
		text: z.string().optional(),
	})
	.extend({
		deploy_id: z.string().optional(),
	});

export const createPluginRunStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createPluginRunResponseSchema = createPluginRunStatus201Schema;

export const createPluginRunErrorSchema = createPluginRunStatusDefaultSchema;

export const createPluginRunBodySchema = z
	.object({
		package: z.string().optional(),
		version: z.string().optional(),
		state: z.string().optional(),
		reporting_event: z.string().optional(),
		title: z.string().optional(),
		summary: z.string().optional(),
		text: z.string().optional(),
	})
	.optional();

export const listFormSubmissionsPathFormIdSchema = z.string();

export const listFormSubmissionsQueryPageSchema = z.int().optional();

export const listFormSubmissionsQueryPerPageSchema = z.int().optional();

export const listFormSubmissionsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		number: z.int().optional(),
		email: z.string().optional(),
		name: z.string().optional(),
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		company: z.string().optional(),
		summary: z.string().optional(),
		body: z.string().optional(),
		data: z.object({}).optional(),
		created_at: z.string().optional(),
		site_url: z.string().optional(),
	}),
);

export const listFormSubmissionsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listFormSubmissionsResponseSchema = listFormSubmissionsStatus200Schema;

export const listFormSubmissionsErrorSchema = listFormSubmissionsStatusDefaultSchema;

export const listHooksBySiteIdQuerySiteIdSchema = z.string();

export const listHooksBySiteIdStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		type: z.string().optional(),
		event: z.string().optional(),
		data: z.object({}).optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		disabled: z.boolean().optional(),
	}),
);

export const listHooksBySiteIdStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listHooksBySiteIdResponseSchema = listHooksBySiteIdStatus200Schema;

export const listHooksBySiteIdErrorSchema = listHooksBySiteIdStatusDefaultSchema;

export const createHookBySiteIdQuerySiteIdSchema = z.string();

export const createHookBySiteIdStatus201Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const createHookBySiteIdStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createHookBySiteIdResponseSchema = createHookBySiteIdStatus201Schema;

export const createHookBySiteIdErrorSchema = createHookBySiteIdStatusDefaultSchema;

export const createHookBySiteIdBodySchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const getHookPathHookIdSchema = z.string();

export const getHookStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const getHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getHookResponseSchema = getHookStatus200Schema;

export const getHookErrorSchema = getHookStatusDefaultSchema;

export const updateHookPathHookIdSchema = z.string();

export const updateHookStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const updateHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateHookResponseSchema = updateHookStatus200Schema;

export const updateHookErrorSchema = updateHookStatusDefaultSchema;

export const updateHookBodySchema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const deleteHookPathHookIdSchema = z.string();

export const deleteHookStatus204Schema = z.unknown();

export const deleteHookResponseSchema = deleteHookStatus204Schema;

export const enableHookPathHookIdSchema = z.string();

export const enableHookStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	type: z.string().optional(),
	event: z.string().optional(),
	data: z.object({}).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	disabled: z.boolean().optional(),
});

export const enableHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const enableHookResponseSchema = enableHookStatus200Schema;

export const enableHookErrorSchema = enableHookStatusDefaultSchema;

export const listHookTypesStatus200Schema = z.array(
	z.object({
		name: z.string().optional(),
		events: z.array(z.string()).optional(),
		fields: z.array(z.object({})).optional(),
	}),
);

export const listHookTypesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listHookTypesResponseSchema = listHookTypesStatus200Schema;

export const listHookTypesErrorSchema = listHookTypesStatusDefaultSchema;

export const createTicketQueryClientIdSchema = z.string();

export const createTicketStatus201Schema = z.object({
	id: z.string().optional(),
	client_id: z.string().optional(),
	authorized: z.boolean().optional(),
	created_at: z.string().optional(),
});

export const createTicketStatus401Schema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createTicketStatus422Schema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createTicketStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createTicketResponseSchema = createTicketStatus201Schema;

export const createTicketErrorSchema = z.union([
	createTicketStatus401Schema,
	createTicketStatus422Schema,
	createTicketStatusDefaultSchema,
]);

export const createTicketBodySchema = z
	.object({
		message: z.string().optional(),
	})
	.optional();

export const showTicketPathTicketIdSchema = z.string();

export const showTicketStatus200Schema = z.object({
	id: z.string().optional(),
	client_id: z.string().optional(),
	authorized: z.boolean().optional(),
	created_at: z.string().optional(),
});

export const showTicketStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const showTicketResponseSchema = showTicketStatus200Schema;

export const showTicketErrorSchema = showTicketStatusDefaultSchema;

export const exchangeTicketPathTicketIdSchema = z.string();

export const exchangeTicketStatus201Schema = z.object({
	id: z.string().optional(),
	access_token: z.string().optional(),
	user_id: z.string().optional(),
	user_email: z.string().optional(),
	created_at: z.string().optional(),
});

export const exchangeTicketStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const exchangeTicketResponseSchema = exchangeTicketStatus201Schema;

export const exchangeTicketErrorSchema = exchangeTicketStatusDefaultSchema;

export const listDeployKeysStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		public_key: z.string().optional(),
		created_at: z.string().optional(),
	}),
);

export const listDeployKeysStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listDeployKeysResponseSchema = listDeployKeysStatus200Schema;

export const listDeployKeysErrorSchema = listDeployKeysStatusDefaultSchema;

export const createDeployKeyStatus201Schema = z.object({
	id: z.string().optional(),
	public_key: z.string().optional(),
	created_at: z.string().optional(),
});

export const createDeployKeyStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createDeployKeyResponseSchema = createDeployKeyStatus201Schema;

export const createDeployKeyErrorSchema = createDeployKeyStatusDefaultSchema;

export const getDeployKeyPathKeyIdSchema = z.string();

export const getDeployKeyStatus200Schema = z.object({
	id: z.string().optional(),
	public_key: z.string().optional(),
	created_at: z.string().optional(),
});

export const getDeployKeyStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDeployKeyResponseSchema = getDeployKeyStatus200Schema;

export const getDeployKeyErrorSchema = getDeployKeyStatusDefaultSchema;

export const deleteDeployKeyPathKeyIdSchema = z.string();

export const deleteDeployKeyStatus204Schema = z.unknown();

export const deleteDeployKeyStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteDeployKeyResponseSchema = deleteDeployKeyStatus204Schema;

export const deleteDeployKeyErrorSchema = deleteDeployKeyStatusDefaultSchema;

export const createSiteInTeamQueryConfigureDnsSchema = z.boolean().optional();

export const createSiteInTeamPathAccountSlugSchema = z.string();

export const createSiteInTeamStatus201Schema = z.object({
	id: z.string().optional(),
	state: z.string().optional(),
	plan: z.string().optional(),
	name: z.string().optional(),
	custom_domain: z.string().optional(),
	domain_aliases: z.array(z.string()).optional(),
	branch_deploy_custom_domain: z.string().optional(),
	deploy_preview_custom_domain: z.string().optional(),
	password: z.string().optional(),
	notification_email: z.string().optional(),
	url: z.string().optional(),
	ssl_url: z.string().optional(),
	admin_url: z.string().optional(),
	screenshot_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	user_id: z.string().optional(),
	session_id: z.string().optional(),
	ssl: z.boolean().optional(),
	force_ssl: z.boolean().optional(),
	managed_dns: z.boolean().optional(),
	deploy_url: z.string().optional(),
	published_deploy: z
		.object({
			id: z.string().optional(),
			site_id: z.string().optional(),
			user_id: z.string().optional(),
			build_id: z.string().optional(),
			state: z.string().optional(),
			name: z.string().optional(),
			url: z.string().optional(),
			ssl_url: z.string().optional(),
			admin_url: z.string().optional(),
			deploy_url: z.string().optional(),
			deploy_ssl_url: z.string().optional(),
			screenshot_url: z.string().optional(),
			review_id: z.number().optional(),
			draft: z.boolean().optional(),
			required: z.array(z.string()).optional(),
			required_functions: z.array(z.string()).optional(),
			required_edge_functions: z
				.array(z.string())
				.optional()
				.describe(
					"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
				),
			error_message: z.string().optional(),
			branch: z.string().optional(),
			commit_ref: z.string().optional(),
			commit_url: z.string().optional(),
			skipped: z.boolean().optional(),
			created_at: z.string().optional(),
			updated_at: z.string().optional(),
			published_at: z.string().optional(),
			title: z.string().optional(),
			context: z.string().optional(),
			locked: z.boolean().optional(),
			review_url: z.string().optional(),
			framework: z.string().optional(),
			skew_protection_token: z.string().optional(),
			function_schedules: z
				.array(
					z.object({
						name: z.string().optional(),
						cron: z.string().optional(),
					}),
				)
				.optional(),
			functions_region: z
				.string()
				.optional()
				.describe("The functions region for this deploy as an airport code.\n"),
			functions_region_overrides: z
				.array(
					z.object({
						name: z.string().optional(),
						region: z.string().optional(),
					}),
				)
				.optional()
				.describe(
					"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
				),
		})
		.optional(),
	account_id: z.string().optional(),
	account_name: z.string().optional(),
	account_slug: z.string().optional(),
	git_provider: z.string().optional(),
	deploy_hook: z.string().optional(),
	capabilities: z.object({}).catchall(z.object({})).optional(),
	processing_settings: z
		.object({
			html: z
				.object({
					pretty_urls: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	build_settings: z
		.object({
			id: z.int().optional(),
			provider: z.string().optional(),
			deploy_key_id: z.string().optional(),
			repo_path: z.string().optional(),
			repo_branch: z.string().optional(),
			dir: z.string().optional(),
			functions_dir: z
				.string()
				.optional()
				.describe(
					"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
				),
			cmd: z
				.string()
				.optional()
				.describe(
					"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
				),
			allowed_branches: z.array(z.string()).optional(),
			public_repo: z.boolean().optional(),
			private_logs: z.boolean().optional(),
			repo_url: z.string().optional(),
			env: z.object({}).catchall(z.string()).optional(),
			installation_id: z.int().optional(),
			stop_builds: z
				.boolean()
				.optional()
				.describe(
					"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
				),
		})
		.optional(),
	id_domain: z.string().optional(),
	default_hooks_data: z
		.object({
			access_token: z.string().optional(),
		})
		.optional(),
	build_image: z.string().optional(),
	prerender: z.string().optional(),
	functions_region: z.string().optional(),
	prevent_non_git_prod_deploys: z.boolean().optional().default(false),
});

export const createSiteInTeamStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteInTeamResponseSchema = createSiteInTeamStatus201Schema;

export const createSiteInTeamErrorSchema = createSiteInTeamStatusDefaultSchema;

export const createSiteInTeamBodySchema = z
	.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	})
	.extend({
		repo: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
	})
	.optional();

export const listSitesForAccountQueryNameSchema = z.string().optional();

export const listSitesForAccountPathAccountSlugSchema = z.string();

export const listSitesForAccountQueryPageSchema = z.int().optional();

export const listSitesForAccountQueryPerPageSchema = z.int().optional();

export const listSitesForAccountStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		state: z.string().optional(),
		plan: z.string().optional(),
		name: z.string().optional(),
		custom_domain: z.string().optional(),
		domain_aliases: z.array(z.string()).optional(),
		branch_deploy_custom_domain: z.string().optional(),
		deploy_preview_custom_domain: z.string().optional(),
		password: z.string().optional(),
		notification_email: z.string().optional(),
		url: z.string().optional(),
		ssl_url: z.string().optional(),
		admin_url: z.string().optional(),
		screenshot_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		user_id: z.string().optional(),
		session_id: z.string().optional(),
		ssl: z.boolean().optional(),
		force_ssl: z.boolean().optional(),
		managed_dns: z.boolean().optional(),
		deploy_url: z.string().optional(),
		published_deploy: z
			.object({
				id: z.string().optional(),
				site_id: z.string().optional(),
				user_id: z.string().optional(),
				build_id: z.string().optional(),
				state: z.string().optional(),
				name: z.string().optional(),
				url: z.string().optional(),
				ssl_url: z.string().optional(),
				admin_url: z.string().optional(),
				deploy_url: z.string().optional(),
				deploy_ssl_url: z.string().optional(),
				screenshot_url: z.string().optional(),
				review_id: z.number().optional(),
				draft: z.boolean().optional(),
				required: z.array(z.string()).optional(),
				required_functions: z.array(z.string()).optional(),
				required_edge_functions: z
					.array(z.string())
					.optional()
					.describe(
						"An array of code_shas for the edge-function bundles that need to be uploaded to\ncomplete the deploy.\n",
					),
				error_message: z.string().optional(),
				branch: z.string().optional(),
				commit_ref: z.string().optional(),
				commit_url: z.string().optional(),
				skipped: z.boolean().optional(),
				created_at: z.string().optional(),
				updated_at: z.string().optional(),
				published_at: z.string().optional(),
				title: z.string().optional(),
				context: z.string().optional(),
				locked: z.boolean().optional(),
				review_url: z.string().optional(),
				framework: z.string().optional(),
				skew_protection_token: z.string().optional(),
				function_schedules: z
					.array(
						z.object({
							name: z.string().optional(),
							cron: z.string().optional(),
						}),
					)
					.optional(),
				functions_region: z
					.string()
					.optional()
					.describe("The functions region for this deploy as an airport code.\n"),
				functions_region_overrides: z
					.array(
						z.object({
							name: z.string().optional(),
							region: z.string().optional(),
						}),
					)
					.optional()
					.describe(
						"Functions in the deploy that explicitly specify their own region\n(airport code).\n",
					),
			})
			.optional(),
		account_id: z.string().optional(),
		account_name: z.string().optional(),
		account_slug: z.string().optional(),
		git_provider: z.string().optional(),
		deploy_hook: z.string().optional(),
		capabilities: z.object({}).catchall(z.object({})).optional(),
		processing_settings: z
			.object({
				html: z
					.object({
						pretty_urls: z.boolean().optional(),
					})
					.optional(),
			})
			.optional(),
		build_settings: z
			.object({
				id: z.int().optional(),
				provider: z.string().optional(),
				deploy_key_id: z.string().optional(),
				repo_path: z.string().optional(),
				repo_branch: z.string().optional(),
				dir: z.string().optional(),
				functions_dir: z
					.string()
					.optional()
					.describe(
						"The directory where Netlify can find your compiled functions to deploy them. Defaults to netlify/functions if not set. You can also define and override this setting in your project’s netlify.toml file.",
					),
				cmd: z
					.string()
					.optional()
					.describe(
						"The build command to run. This is the command that Netlify runs to build your site. If a site has a netlify.toml file with a build command it will override this value.",
					),
				allowed_branches: z.array(z.string()).optional(),
				public_repo: z.boolean().optional(),
				private_logs: z.boolean().optional(),
				repo_url: z.string().optional(),
				env: z.object({}).catchall(z.string()).optional(),
				installation_id: z.int().optional(),
				stop_builds: z
					.boolean()
					.optional()
					.describe(
						"When true, Netlify will not build your project automatically. You can build locally via the CLI and then publish new deploys manually via the CLI or the API.",
					),
			})
			.optional(),
		id_domain: z.string().optional(),
		default_hooks_data: z
			.object({
				access_token: z.string().optional(),
			})
			.optional(),
		build_image: z.string().optional(),
		prerender: z.string().optional(),
		functions_region: z.string().optional(),
		prevent_non_git_prod_deploys: z.boolean().optional().default(false),
	}),
);

export const listSitesForAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSitesForAccountResponseSchema = listSitesForAccountStatus200Schema;

export const listSitesForAccountErrorSchema = listSitesForAccountStatusDefaultSchema;

export const listMembersForAccountPathAccountSlugSchema = z.string();

export const listMembersForAccountStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		full_name: z.string().optional(),
		email: z.string().optional(),
		avatar: z.string().optional(),
		role: z.string().optional(),
	}),
);

export const listMembersForAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listMembersForAccountResponseSchema = listMembersForAccountStatus200Schema;

export const listMembersForAccountErrorSchema = listMembersForAccountStatusDefaultSchema;

export const addMemberToAccountPathAccountSlugSchema = z.string();

export const addMemberToAccountStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		full_name: z.string().optional(),
		email: z.string().optional(),
		avatar: z.string().optional(),
		role: z.string().optional(),
	}),
);

export const addMemberToAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const addMemberToAccountResponseSchema = addMemberToAccountStatus200Schema;

export const addMemberToAccountErrorSchema = addMemberToAccountStatusDefaultSchema;

export const addMemberToAccountBodySchema = z.object({
	role: z.enum(["Owner", "Developer", "Billing Admin", "Reviewer"]).optional(),
	email: z.string().optional(),
});

export const getAccountMemberPathAccountSlugSchema = z.string();

export const getAccountMemberPathMemberIdSchema = z.string();

export const getAccountMemberStatus200Schema = z.object({
	id: z.string().optional(),
	full_name: z.string().optional(),
	email: z.string().optional(),
	avatar: z.string().optional(),
	role: z.string().optional(),
});

export const getAccountMemberStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAccountMemberResponseSchema = getAccountMemberStatus200Schema;

export const getAccountMemberErrorSchema = getAccountMemberStatusDefaultSchema;

export const updateAccountMemberPathAccountSlugSchema = z.string();

export const updateAccountMemberPathMemberIdSchema = z.string();

export const updateAccountMemberStatus200Schema = z.object({
	id: z.string().optional(),
	full_name: z.string().optional(),
	email: z.string().optional(),
	avatar: z.string().optional(),
	role: z.string().optional(),
});

export const updateAccountMemberStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateAccountMemberResponseSchema = updateAccountMemberStatus200Schema;

export const updateAccountMemberErrorSchema = updateAccountMemberStatusDefaultSchema;

export const updateAccountMemberBodySchema = z.object({
	role: z.enum(["Owner", "Developer", "Billing Admin", "Reviewer"]).optional(),
	site_access: z.enum(["all", "none", "selected"]).optional(),
	site_ids: z.array(z.string()).optional(),
});

export const removeAccountMemberPathAccountSlugSchema = z.string();

export const removeAccountMemberPathMemberIdSchema = z.string();

export const removeAccountMemberStatus204Schema = z.unknown();

export const removeAccountMemberStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const removeAccountMemberResponseSchema = removeAccountMemberStatus204Schema;

export const removeAccountMemberErrorSchema = removeAccountMemberStatusDefaultSchema;

export const listPaymentMethodsForUserStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		method_name: z.string().optional(),
		type: z.string().optional(),
		state: z.string().optional(),
		data: z
			.object({
				card_type: z.string().optional(),
				last4: z.string().optional(),
				email: z.string().optional(),
			})
			.optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	}),
);

export const listPaymentMethodsForUserStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listPaymentMethodsForUserResponseSchema = listPaymentMethodsForUserStatus200Schema;

export const listPaymentMethodsForUserErrorSchema = listPaymentMethodsForUserStatusDefaultSchema;

export const listAccountTypesForUserStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		description: z.string().optional(),
		capabilities: z.object({}).optional(),
		monthly_dollar_price: z.int().optional(),
		yearly_dollar_price: z.int().optional(),
		monthly_seats_addon_dollar_price: z.int().optional(),
		yearly_seats_addon_dollar_price: z.int().optional(),
	}),
);

export const listAccountTypesForUserStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listAccountTypesForUserResponseSchema = listAccountTypesForUserStatus200Schema;

export const listAccountTypesForUserErrorSchema = listAccountTypesForUserStatusDefaultSchema;

export const listAccountsForUserQueryMinimalSchema = z.boolean().optional();

export const listAccountsForUserStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		slug: z.string().optional(),
		type: z.string().optional(),
		capabilities: z
			.object({
				sites: z
					.object({
						included: z.int().optional(),
						used: z.int().optional(),
					})
					.optional(),
				collaborators: z
					.object({
						included: z.int().optional(),
						used: z.int().optional(),
					})
					.optional(),
			})
			.optional(),
		billing_name: z.string().optional(),
		billing_email: z.string().optional(),
		billing_details: z.string().optional(),
		billing_period: z.string().optional(),
		payment_method_id: z.string().optional(),
		type_name: z.string().optional(),
		type_id: z.string().optional(),
		owner_ids: z.array(z.string()).optional(),
		roles_allowed: z.array(z.string()).optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	}),
);

export const listAccountsForUserStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listAccountsForUserResponseSchema = listAccountsForUserStatus200Schema;

export const listAccountsForUserErrorSchema = listAccountsForUserStatusDefaultSchema;

export const createAccountStatus201Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	type: z.string().optional(),
	capabilities: z
		.object({
			sites: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
			collaborators: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
		})
		.optional(),
	billing_name: z.string().optional(),
	billing_email: z.string().optional(),
	billing_details: z.string().optional(),
	billing_period: z.string().optional(),
	payment_method_id: z.string().optional(),
	type_name: z.string().optional(),
	type_id: z.string().optional(),
	owner_ids: z.array(z.string()).optional(),
	roles_allowed: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const createAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createAccountResponseSchema = createAccountStatus201Schema;

export const createAccountErrorSchema = createAccountStatusDefaultSchema;

export const createAccountBodySchema = z.object({
	name: z.string(),
	type_id: z.string(),
	payment_method_id: z.string().optional(),
	period: z.enum(["monthly", "yearly"]).optional(),
	extra_seats_block: z.int().optional(),
});

export const getAccountPathAccountIdSchema = z.string();

export const getAccountStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	type: z.string().optional(),
	capabilities: z
		.object({
			sites: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
			collaborators: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
		})
		.optional(),
	billing_name: z.string().optional(),
	billing_email: z.string().optional(),
	billing_details: z.string().optional(),
	billing_period: z.string().optional(),
	payment_method_id: z.string().optional(),
	type_name: z.string().optional(),
	type_id: z.string().optional(),
	owner_ids: z.array(z.string()).optional(),
	roles_allowed: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const getAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAccountResponseSchema = getAccountStatus200Schema;

export const getAccountErrorSchema = getAccountStatusDefaultSchema;

export const updateAccountPathAccountIdSchema = z.string();

export const updateAccountStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	type: z.string().optional(),
	capabilities: z
		.object({
			sites: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
			collaborators: z
				.object({
					included: z.int().optional(),
					used: z.int().optional(),
				})
				.optional(),
		})
		.optional(),
	billing_name: z.string().optional(),
	billing_email: z.string().optional(),
	billing_details: z.string().optional(),
	billing_period: z.string().optional(),
	payment_method_id: z.string().optional(),
	type_name: z.string().optional(),
	type_id: z.string().optional(),
	owner_ids: z.array(z.string()).optional(),
	roles_allowed: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const updateAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateAccountResponseSchema = updateAccountStatus200Schema;

export const updateAccountErrorSchema = updateAccountStatusDefaultSchema;

export const updateAccountBodySchema = z
	.object({
		name: z.string().optional(),
		slug: z.string().optional(),
		type_id: z.string().optional(),
		extra_seats_block: z.int().optional(),
		billing_name: z.string().optional(),
		billing_email: z.string().optional(),
		billing_details: z.string().optional(),
	})
	.optional();

export const cancelAccountPathAccountIdSchema = z.string();

export const cancelAccountStatus204Schema = z.unknown();

export const cancelAccountStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const cancelAccountResponseSchema = cancelAccountStatus204Schema;

export const cancelAccountErrorSchema = cancelAccountStatusDefaultSchema;

export const listAccountAuditEventsPathAccountIdSchema = z.string();

export const listAccountAuditEventsQueryQuerySchema = z.string().optional();

export const listAccountAuditEventsQueryLogTypeSchema = z.string().optional();

export const listAccountAuditEventsQueryPageSchema = z.int().optional();

export const listAccountAuditEventsQueryPerPageSchema = z.int().optional();

export const listAccountAuditEventsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		account_id: z.string().optional(),
		payload: z
			.object({
				actor_id: z.string().optional(),
				actor_name: z.string().optional(),
				actor_email: z.string().optional(),
				action: z.string().optional(),
				timestamp: z.string().optional(),
				log_type: z.string().optional(),
			})
			.catchall(z.object({}))
			.optional(),
	}),
);

export const listAccountAuditEventsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listAccountAuditEventsResponseSchema = listAccountAuditEventsStatus200Schema;

export const listAccountAuditEventsErrorSchema = listAccountAuditEventsStatusDefaultSchema;

export const listAgentRunnersQueryAccountIdSchema = z.string();

export const listAgentRunnersQuerySiteIdSchema = z.string();

export const listAgentRunnersQueryPageSchema = z.int().optional();

export const listAgentRunnersQueryPerPageSchema = z.int().optional();

export const listAgentRunnersQueryStateSchema = z.enum(["live", "error"]).optional();

export const listAgentRunnersQueryTitleSchema = z.string().optional();

export const listAgentRunnersQueryBranchSchema = z.string().optional();

export const listAgentRunnersQueryResultBranchSchema = z.string().optional();

export const listAgentRunnersQueryFromSchema = z.int().optional();

export const listAgentRunnersQueryToSchema = z.int().optional();

export const listAgentRunnersStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		parent_agent_runner_id: z.string().optional(),
		state: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		done_at: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		result_branch: z.string().optional(),
		pr_url: z.string().optional(),
		pr_branch: z.string().optional(),
		pr_state: z.string().optional(),
		pr_number: z.int().optional(),
		pr_is_being_created: z.boolean().optional(),
		pr_error: z.string().optional(),
		current_task: z.string().optional(),
		result_diff: z.string().optional(),
		sha: z.string().optional(),
		merge_commit_sha: z.string().optional(),
		merge_commit_error: z.string().optional(),
		merge_commit_is_being_created: z.boolean().optional(),
		base_deploy_id: z.string().optional(),
		attached_file_keys: z.array(z.string()).optional(),
		active_session_created_at: z.string().optional(),
		latest_session_deploy_id: z.string().optional(),
		latest_session_deploy_url: z.string().optional(),
		user: z
			.object({
				id: z.string().optional(),
				full_name: z.string().optional(),
				email: z.string().optional(),
				avatar_url: z.string().optional(),
			})
			.optional(),
	}),
);

export const listAgentRunnersStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listAgentRunnersResponseSchema = listAgentRunnersStatus200Schema;

export const listAgentRunnersErrorSchema = listAgentRunnersStatusDefaultSchema;

export const createAgentRunnerQuerySiteIdSchema = z.string();

export const createAgentRunnerQueryDeployIdSchema = z.string().optional();

export const createAgentRunnerQueryBranchSchema = z.string().optional();

export const createAgentRunnerQueryPromptSchema = z.string().optional();

export const createAgentRunnerQueryAgentSchema = z.string().optional();

export const createAgentRunnerQueryModelSchema = z.string().optional();

export const createAgentRunnerQueryParentAgentRunnerIdSchema = z.string().optional();

export const createAgentRunnerQueryDevServerImageSchema = z.string().optional();

export const createAgentRunnerQueryFileKeysSchema = z.array(z.string()).optional();

export const createAgentRunnerStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	parent_agent_runner_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	result_branch: z.string().optional(),
	pr_url: z.string().optional(),
	pr_branch: z.string().optional(),
	pr_state: z.string().optional(),
	pr_number: z.int().optional(),
	pr_is_being_created: z.boolean().optional(),
	pr_error: z.string().optional(),
	current_task: z.string().optional(),
	result_diff: z.string().optional(),
	sha: z.string().optional(),
	merge_commit_sha: z.string().optional(),
	merge_commit_error: z.string().optional(),
	merge_commit_is_being_created: z.boolean().optional(),
	base_deploy_id: z.string().optional(),
	attached_file_keys: z.array(z.string()).optional(),
	active_session_created_at: z.string().optional(),
	latest_session_deploy_id: z.string().optional(),
	latest_session_deploy_url: z.string().optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
});

export const createAgentRunnerStatus404Schema = z.unknown();

export const createAgentRunnerStatus422Schema = z.unknown();

export const createAgentRunnerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createAgentRunnerResponseSchema = createAgentRunnerStatus200Schema;

export const createAgentRunnerErrorSchema = z.union([
	createAgentRunnerStatus404Schema,
	createAgentRunnerStatus422Schema,
	createAgentRunnerStatusDefaultSchema,
]);

export const createAgentRunnerUploadUrlQueryAccountIdSchema = z.string();

export const createAgentRunnerUploadUrlQueryFilenameSchema = z.string();

export const createAgentRunnerUploadUrlQueryContentTypeSchema = z.string();

export const createAgentRunnerUploadUrlStatus200Schema = z.unknown();

export const createAgentRunnerUploadUrlStatus400Schema = z.unknown();

export const createAgentRunnerUploadUrlStatus422Schema = z.unknown();

export const createAgentRunnerUploadUrlStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createAgentRunnerUploadUrlResponseSchema = createAgentRunnerUploadUrlStatus200Schema;

export const createAgentRunnerUploadUrlErrorSchema = z.union([
	createAgentRunnerUploadUrlStatus400Schema,
	createAgentRunnerUploadUrlStatus422Schema,
	createAgentRunnerUploadUrlStatusDefaultSchema,
]);

export const getAgentRunnerPathAgentRunnerIdSchema = z.string();

export const getAgentRunnerStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	parent_agent_runner_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	result_branch: z.string().optional(),
	pr_url: z.string().optional(),
	pr_branch: z.string().optional(),
	pr_state: z.string().optional(),
	pr_number: z.int().optional(),
	pr_is_being_created: z.boolean().optional(),
	pr_error: z.string().optional(),
	current_task: z.string().optional(),
	result_diff: z.string().optional(),
	sha: z.string().optional(),
	merge_commit_sha: z.string().optional(),
	merge_commit_error: z.string().optional(),
	merge_commit_is_being_created: z.boolean().optional(),
	base_deploy_id: z.string().optional(),
	attached_file_keys: z.array(z.string()).optional(),
	active_session_created_at: z.string().optional(),
	latest_session_deploy_id: z.string().optional(),
	latest_session_deploy_url: z.string().optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
});

export const getAgentRunnerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAgentRunnerResponseSchema = getAgentRunnerStatus200Schema;

export const getAgentRunnerErrorSchema = getAgentRunnerStatusDefaultSchema;

export const updateAgentRunnerPathAgentRunnerIdSchema = z.string();

export const updateAgentRunnerStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	parent_agent_runner_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	result_branch: z.string().optional(),
	pr_url: z.string().optional(),
	pr_branch: z.string().optional(),
	pr_state: z.string().optional(),
	pr_number: z.int().optional(),
	pr_is_being_created: z.boolean().optional(),
	pr_error: z.string().optional(),
	current_task: z.string().optional(),
	result_diff: z.string().optional(),
	sha: z.string().optional(),
	merge_commit_sha: z.string().optional(),
	merge_commit_error: z.string().optional(),
	merge_commit_is_being_created: z.boolean().optional(),
	base_deploy_id: z.string().optional(),
	attached_file_keys: z.array(z.string()).optional(),
	active_session_created_at: z.string().optional(),
	latest_session_deploy_id: z.string().optional(),
	latest_session_deploy_url: z.string().optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
});

export const updateAgentRunnerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateAgentRunnerResponseSchema = updateAgentRunnerStatus200Schema;

export const updateAgentRunnerErrorSchema = updateAgentRunnerStatusDefaultSchema;

export const deleteAgentRunnerPathAgentRunnerIdSchema = z.string();

export const deleteAgentRunnerStatus202Schema = z.unknown();

export const deleteAgentRunnerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteAgentRunnerResponseSchema = deleteAgentRunnerStatus202Schema;

export const deleteAgentRunnerErrorSchema = deleteAgentRunnerStatusDefaultSchema;

export const archiveAgentRunnerPathAgentRunnerIdSchema = z.string();

export const archiveAgentRunnerStatus202Schema = z.unknown();

export const archiveAgentRunnerStatus404Schema = z.unknown();

export const archiveAgentRunnerStatus422Schema = z.unknown();

export const archiveAgentRunnerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const archiveAgentRunnerResponseSchema = archiveAgentRunnerStatus202Schema;

export const archiveAgentRunnerErrorSchema = z.union([
	archiveAgentRunnerStatus404Schema,
	archiveAgentRunnerStatus422Schema,
	archiveAgentRunnerStatusDefaultSchema,
]);

export const agentRunnerPullRequestPathAgentRunnerIdSchema = z.string();

export const agentRunnerPullRequestStatus200Schema = z.unknown();

export const agentRunnerPullRequestStatus400Schema = z.unknown();

export const agentRunnerPullRequestStatus409Schema = z.unknown();

export const agentRunnerPullRequestStatus422Schema = z.unknown();

export const agentRunnerPullRequestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const agentRunnerPullRequestResponseSchema = agentRunnerPullRequestStatus200Schema;

export const agentRunnerPullRequestErrorSchema = z.union([
	agentRunnerPullRequestStatus400Schema,
	agentRunnerPullRequestStatus409Schema,
	agentRunnerPullRequestStatus422Schema,
	agentRunnerPullRequestStatusDefaultSchema,
]);

export const agentRunnerCommitToBranchPathAgentRunnerIdSchema = z.string();

export const agentRunnerCommitToBranchQueryTargetBranchSchema = z.string();

export const agentRunnerCommitToBranchStatus200Schema = z.unknown();

export const agentRunnerCommitToBranchStatus400Schema = z.unknown();

export const agentRunnerCommitToBranchStatus409Schema = z.unknown();

export const agentRunnerCommitToBranchStatus422Schema = z.unknown();

export const agentRunnerCommitToBranchStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const agentRunnerCommitToBranchResponseSchema = agentRunnerCommitToBranchStatus200Schema;

export const agentRunnerCommitToBranchErrorSchema = z.union([
	agentRunnerCommitToBranchStatus400Schema,
	agentRunnerCommitToBranchStatus409Schema,
	agentRunnerCommitToBranchStatus422Schema,
	agentRunnerCommitToBranchStatusDefaultSchema,
]);

export const listAgentRunnerSessionsPathAgentRunnerIdSchema = z.string();

export const listAgentRunnerSessionsQueryPageSchema = z.int().optional();

export const listAgentRunnerSessionsQueryPerPageSchema = z.int().optional();

export const listAgentRunnerSessionsQueryStateSchema = z.enum(["live", "error"]).optional();

export const listAgentRunnerSessionsQueryFromSchema = z.int().optional();

export const listAgentRunnerSessionsQueryToSchema = z.int().optional();

export const listAgentRunnerSessionsQueryOrderBySchema = z.enum(["asc", "desc"]).optional();

export const listAgentRunnerSessionsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		agent_runner_id: z.string().optional(),
		dev_server_id: z.string().optional(),
		state: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		done_at: z.string().optional(),
		title: z.string().optional(),
		prompt: z.string().optional(),
		agent_config: z
			.object({
				agent: z.string().optional(),
				model: z.string().optional(),
			})
			.optional(),
		result: z.string().optional(),
		result_diff: z.string().optional(),
		commit_sha: z.string().optional(),
		deploy_id: z.string().optional(),
		deploy_url: z.string().optional(),
		duration: z.int().optional(),
		steps: z
			.array(
				z.object({
					title: z.string().optional(),
					message: z.string().optional(),
				}),
			)
			.optional(),
		user: z
			.object({
				id: z.string().optional(),
				full_name: z.string().optional(),
				email: z.string().optional(),
				avatar_url: z.string().optional(),
			})
			.optional(),
		attached_file_keys: z.array(z.string()).optional(),
		result_zip_file_name: z.string().optional(),
		is_published: z.boolean().optional(),
	}),
);

export const listAgentRunnerSessionsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listAgentRunnerSessionsResponseSchema = listAgentRunnerSessionsStatus200Schema;

export const listAgentRunnerSessionsErrorSchema = listAgentRunnerSessionsStatusDefaultSchema;

export const createAgentRunnerSessionPathAgentRunnerIdSchema = z.string();

export const createAgentRunnerSessionQueryPromptSchema = z.string().optional();

export const createAgentRunnerSessionQueryAgentSchema = z.string().optional();

export const createAgentRunnerSessionQueryModelSchema = z.string().optional();

export const createAgentRunnerSessionQueryFileKeysSchema = z.array(z.string()).optional();

export const createAgentRunnerSessionStatus200Schema = z.object({
	id: z.string().optional(),
	agent_runner_id: z.string().optional(),
	dev_server_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	prompt: z.string().optional(),
	agent_config: z
		.object({
			agent: z.string().optional(),
			model: z.string().optional(),
		})
		.optional(),
	result: z.string().optional(),
	result_diff: z.string().optional(),
	commit_sha: z.string().optional(),
	deploy_id: z.string().optional(),
	deploy_url: z.string().optional(),
	duration: z.int().optional(),
	steps: z
		.array(
			z.object({
				title: z.string().optional(),
				message: z.string().optional(),
			}),
		)
		.optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
	attached_file_keys: z.array(z.string()).optional(),
	result_zip_file_name: z.string().optional(),
	is_published: z.boolean().optional(),
});

export const createAgentRunnerSessionStatus404Schema = z.unknown();

export const createAgentRunnerSessionStatus422Schema = z.unknown();

export const createAgentRunnerSessionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createAgentRunnerSessionResponseSchema = createAgentRunnerSessionStatus200Schema;

export const createAgentRunnerSessionErrorSchema = z.union([
	createAgentRunnerSessionStatus404Schema,
	createAgentRunnerSessionStatus422Schema,
	createAgentRunnerSessionStatusDefaultSchema,
]);

export const getAgentRunnerSessionPathAgentRunnerIdSchema = z.string();

export const getAgentRunnerSessionPathAgentRunnerSessionIdSchema = z.string();

export const getAgentRunnerSessionStatus200Schema = z.object({
	id: z.string().optional(),
	agent_runner_id: z.string().optional(),
	dev_server_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	prompt: z.string().optional(),
	agent_config: z
		.object({
			agent: z.string().optional(),
			model: z.string().optional(),
		})
		.optional(),
	result: z.string().optional(),
	result_diff: z.string().optional(),
	commit_sha: z.string().optional(),
	deploy_id: z.string().optional(),
	deploy_url: z.string().optional(),
	duration: z.int().optional(),
	steps: z
		.array(
			z.object({
				title: z.string().optional(),
				message: z.string().optional(),
			}),
		)
		.optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
	attached_file_keys: z.array(z.string()).optional(),
	result_zip_file_name: z.string().optional(),
	is_published: z.boolean().optional(),
});

export const getAgentRunnerSessionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAgentRunnerSessionResponseSchema = getAgentRunnerSessionStatus200Schema;

export const getAgentRunnerSessionErrorSchema = getAgentRunnerSessionStatusDefaultSchema;

export const updateAgentRunnerSessionPathAgentRunnerIdSchema = z.string();

export const updateAgentRunnerSessionPathAgentRunnerSessionIdSchema = z.string();

export const updateAgentRunnerSessionQueryIsPublishedSchema = z.boolean().optional();

export const updateAgentRunnerSessionStatus200Schema = z.object({
	id: z.string().optional(),
	agent_runner_id: z.string().optional(),
	dev_server_id: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
	prompt: z.string().optional(),
	agent_config: z
		.object({
			agent: z.string().optional(),
			model: z.string().optional(),
		})
		.optional(),
	result: z.string().optional(),
	result_diff: z.string().optional(),
	commit_sha: z.string().optional(),
	deploy_id: z.string().optional(),
	deploy_url: z.string().optional(),
	duration: z.int().optional(),
	steps: z
		.array(
			z.object({
				title: z.string().optional(),
				message: z.string().optional(),
			}),
		)
		.optional(),
	user: z
		.object({
			id: z.string().optional(),
			full_name: z.string().optional(),
			email: z.string().optional(),
			avatar_url: z.string().optional(),
		})
		.optional(),
	attached_file_keys: z.array(z.string()).optional(),
	result_zip_file_name: z.string().optional(),
	is_published: z.boolean().optional(),
});

export const updateAgentRunnerSessionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateAgentRunnerSessionResponseSchema = updateAgentRunnerSessionStatus200Schema;

export const updateAgentRunnerSessionErrorSchema = updateAgentRunnerSessionStatusDefaultSchema;

export const deleteAgentRunnerSessionPathAgentRunnerIdSchema = z.string();

export const deleteAgentRunnerSessionPathAgentRunnerSessionIdSchema = z.string();

export const deleteAgentRunnerSessionStatus202Schema = z.unknown();

export const deleteAgentRunnerSessionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteAgentRunnerSessionResponseSchema = deleteAgentRunnerSessionStatus202Schema;

export const deleteAgentRunnerSessionErrorSchema = deleteAgentRunnerSessionStatusDefaultSchema;

export const listFormSubmissionPathSubmissionIdSchema = z.string();

export const listFormSubmissionQueryQuerySchema = z.string().optional();

export const listFormSubmissionQueryPageSchema = z.int().optional();

export const listFormSubmissionQueryPerPageSchema = z.int().optional();

export const listFormSubmissionStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		number: z.int().optional(),
		email: z.string().optional(),
		name: z.string().optional(),
		first_name: z.string().optional(),
		last_name: z.string().optional(),
		company: z.string().optional(),
		summary: z.string().optional(),
		body: z.string().optional(),
		data: z.object({}).optional(),
		created_at: z.string().optional(),
		site_url: z.string().optional(),
	}),
);

export const listFormSubmissionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listFormSubmissionResponseSchema = listFormSubmissionStatus200Schema;

export const listFormSubmissionErrorSchema = listFormSubmissionStatusDefaultSchema;

export const deleteSubmissionPathSubmissionIdSchema = z.string();

export const deleteSubmissionStatus204Schema = z.unknown();

export const deleteSubmissionStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSubmissionResponseSchema = deleteSubmissionStatus204Schema;

export const deleteSubmissionErrorSchema = deleteSubmissionStatusDefaultSchema;

export const listServiceInstancesForSitePathSiteIdSchema = z.string();

export const listServiceInstancesForSiteStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		url: z.string().optional(),
		config: z.object({}).optional(),
		external_attributes: z.object({}).optional(),
		service_slug: z.string().optional(),
		service_path: z.string().optional(),
		service_name: z.string().optional(),
		env: z.object({}).optional(),
		snippets: z.array(z.object({})).optional(),
		auth_url: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	}),
);

export const listServiceInstancesForSiteStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listServiceInstancesForSiteResponseSchema = listServiceInstancesForSiteStatus200Schema;

export const listServiceInstancesForSiteErrorSchema =
	listServiceInstancesForSiteStatusDefaultSchema;

export const createServiceInstancePathSiteIdSchema = z.string();

export const createServiceInstancePathAddonSchema = z.string();

export const createServiceInstanceStatus201Schema = z.object({
	id: z.string().optional(),
	url: z.string().optional(),
	config: z.object({}).optional(),
	external_attributes: z.object({}).optional(),
	service_slug: z.string().optional(),
	service_path: z.string().optional(),
	service_name: z.string().optional(),
	env: z.object({}).optional(),
	snippets: z.array(z.object({})).optional(),
	auth_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const createServiceInstanceStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createServiceInstanceResponseSchema = createServiceInstanceStatus201Schema;

export const createServiceInstanceErrorSchema = createServiceInstanceStatusDefaultSchema;

export const createServiceInstanceBodySchema = z.object({});

export const showServiceInstancePathSiteIdSchema = z.string();

export const showServiceInstancePathAddonSchema = z.string();

export const showServiceInstancePathInstanceIdSchema = z.string();

export const showServiceInstanceStatus200Schema = z.object({
	id: z.string().optional(),
	url: z.string().optional(),
	config: z.object({}).optional(),
	external_attributes: z.object({}).optional(),
	service_slug: z.string().optional(),
	service_path: z.string().optional(),
	service_name: z.string().optional(),
	env: z.object({}).optional(),
	snippets: z.array(z.object({})).optional(),
	auth_url: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const showServiceInstanceStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const showServiceInstanceResponseSchema = showServiceInstanceStatus200Schema;

export const showServiceInstanceErrorSchema = showServiceInstanceStatusDefaultSchema;

export const updateServiceInstancePathSiteIdSchema = z.string();

export const updateServiceInstancePathAddonSchema = z.string();

export const updateServiceInstancePathInstanceIdSchema = z.string();

export const updateServiceInstanceStatus204Schema = z.unknown();

export const updateServiceInstanceStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateServiceInstanceResponseSchema = updateServiceInstanceStatus204Schema;

export const updateServiceInstanceErrorSchema = updateServiceInstanceStatusDefaultSchema;

export const updateServiceInstanceBodySchema = z.object({});

export const deleteServiceInstancePathSiteIdSchema = z.string();

export const deleteServiceInstancePathAddonSchema = z.string();

export const deleteServiceInstancePathInstanceIdSchema = z.string();

export const deleteServiceInstanceStatus204Schema = z.unknown();

export const deleteServiceInstanceStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteServiceInstanceResponseSchema = deleteServiceInstanceStatus204Schema;

export const deleteServiceInstanceErrorSchema = deleteServiceInstanceStatusDefaultSchema;

export const getServicesQuerySearchSchema = z.string().optional();

export const getServicesStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		slug: z.string().optional(),
		service_path: z.string().optional(),
		long_description: z.string().optional(),
		description: z.string().optional(),
		events: z.array(z.object({})).optional(),
		tags: z.array(z.string()).optional(),
		icon: z.string().optional(),
		manifest_url: z.string().optional(),
		environments: z.array(z.string()).optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	}),
);

export const getServicesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getServicesResponseSchema = getServicesStatus200Schema;

export const getServicesErrorSchema = getServicesStatusDefaultSchema;

export const showServicePathAddonNameSchema = z.string();

export const showServiceStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	slug: z.string().optional(),
	service_path: z.string().optional(),
	long_description: z.string().optional(),
	description: z.string().optional(),
	events: z.array(z.object({})).optional(),
	tags: z.array(z.string()).optional(),
	icon: z.string().optional(),
	manifest_url: z.string().optional(),
	environments: z.array(z.string()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const showServiceStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const showServiceResponseSchema = showServiceStatus200Schema;

export const showServiceErrorSchema = showServiceStatusDefaultSchema;

export const showServiceManifestPathAddonNameSchema = z.string();

export const showServiceManifestStatus201Schema = z.object({});

export const showServiceManifestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const showServiceManifestResponseSchema = showServiceManifestStatus201Schema;

export const showServiceManifestErrorSchema = showServiceManifestStatusDefaultSchema;

export const getCurrentUserStatus200Schema = z.object({
	id: z.string().optional(),
	uid: z.string().optional(),
	full_name: z.string().optional(),
	avatar_url: z.string().optional(),
	email: z.string().optional(),
	affiliate_id: z.string().optional(),
	site_count: z.coerce.bigint().optional(),
	created_at: z.string().optional(),
	last_login: z.string().optional(),
	login_providers: z.array(z.string()).optional(),
	onboarding_progress: z
		.object({
			slides: z.string().optional(),
		})
		.optional(),
});

export const getCurrentUserStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getCurrentUserResponseSchema = getCurrentUserStatus200Schema;

export const getCurrentUserErrorSchema = getCurrentUserStatusDefaultSchema;

export const createSplitTestPathSiteIdSchema = z.string();

export const createSplitTestStatus201Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	branches: z.array(z.object({})).optional(),
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	unpublished_at: z.string().optional(),
});

export const createSplitTestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSplitTestResponseSchema = createSplitTestStatus201Schema;

export const createSplitTestErrorSchema = createSplitTestStatusDefaultSchema;

export const createSplitTestBodySchema = z.object({
	branch_tests: z.object({}).optional(),
});

export const getSplitTestsPathSiteIdSchema = z.string();

export const getSplitTestsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		name: z.string().optional(),
		path: z.string().optional(),
		branches: z.array(z.object({})).optional(),
		active: z.boolean().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		unpublished_at: z.string().optional(),
	}),
);

export const getSplitTestsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSplitTestsResponseSchema = getSplitTestsStatus200Schema;

export const getSplitTestsErrorSchema = getSplitTestsStatusDefaultSchema;

export const updateSplitTestPathSiteIdSchema = z.string();

export const updateSplitTestPathSplitTestIdSchema = z.string();

export const updateSplitTestStatus201Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	branches: z.array(z.object({})).optional(),
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	unpublished_at: z.string().optional(),
});

export const updateSplitTestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSplitTestResponseSchema = updateSplitTestStatus201Schema;

export const updateSplitTestErrorSchema = updateSplitTestStatusDefaultSchema;

export const updateSplitTestBodySchema = z.object({
	branch_tests: z.object({}).optional(),
});

export const getSplitTestPathSiteIdSchema = z.string();

export const getSplitTestPathSplitTestIdSchema = z.string();

export const getSplitTestStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	branches: z.array(z.object({})).optional(),
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	unpublished_at: z.string().optional(),
});

export const getSplitTestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSplitTestResponseSchema = getSplitTestStatus200Schema;

export const getSplitTestErrorSchema = getSplitTestStatusDefaultSchema;

export const enableSplitTestPathSiteIdSchema = z.string();

export const enableSplitTestPathSplitTestIdSchema = z.string();

export const enableSplitTestStatus204Schema = z.unknown();

export const enableSplitTestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const enableSplitTestResponseSchema = enableSplitTestStatus204Schema;

export const enableSplitTestErrorSchema = enableSplitTestStatusDefaultSchema;

export const disableSplitTestPathSiteIdSchema = z.string();

export const disableSplitTestPathSplitTestIdSchema = z.string();

export const disableSplitTestStatus204Schema = z.unknown();

export const disableSplitTestStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const disableSplitTestResponseSchema = disableSplitTestStatus204Schema;

export const disableSplitTestErrorSchema = disableSplitTestStatusDefaultSchema;

export const createDnsZoneStatus201Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	errors: z.array(z.string()).optional(),
	supported_record_types: z.array(z.string()).optional(),
	user_id: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	records: z
		.array(
			z.object({
				id: z.string().optional(),
				hostname: z.string().optional(),
				type: z.string().optional(),
				value: z.string().optional(),
				ttl: z.coerce.bigint().optional(),
				priority: z.coerce.bigint().optional(),
				dns_zone_id: z.string().optional(),
				site_id: z.string().optional(),
				flag: z.int().optional(),
				tag: z.string().optional(),
				managed: z.boolean().optional(),
			}),
		)
		.optional(),
	dns_servers: z.array(z.string()).optional(),
	account_id: z.string().optional(),
	site_id: z.string().optional(),
	account_slug: z.string().optional(),
	account_name: z.string().optional(),
	domain: z.string().optional(),
	ipv6_enabled: z.boolean().optional(),
	dedicated: z.boolean().optional(),
});

export const createDnsZoneStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createDnsZoneResponseSchema = createDnsZoneStatus201Schema;

export const createDnsZoneErrorSchema = createDnsZoneStatusDefaultSchema;

export const createDnsZoneBodySchema = z.object({
	account_slug: z.string().optional(),
	site_id: z.string().optional(),
	name: z.string().optional(),
});

export const getDnsZonesQueryAccountSlugSchema = z.string().optional();

export const getDnsZonesStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		name: z.string().optional(),
		errors: z.array(z.string()).optional(),
		supported_record_types: z.array(z.string()).optional(),
		user_id: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		records: z
			.array(
				z.object({
					id: z.string().optional(),
					hostname: z.string().optional(),
					type: z.string().optional(),
					value: z.string().optional(),
					ttl: z.coerce.bigint().optional(),
					priority: z.coerce.bigint().optional(),
					dns_zone_id: z.string().optional(),
					site_id: z.string().optional(),
					flag: z.int().optional(),
					tag: z.string().optional(),
					managed: z.boolean().optional(),
				}),
			)
			.optional(),
		dns_servers: z.array(z.string()).optional(),
		account_id: z.string().optional(),
		site_id: z.string().optional(),
		account_slug: z.string().optional(),
		account_name: z.string().optional(),
		domain: z.string().optional(),
		ipv6_enabled: z.boolean().optional(),
		dedicated: z.boolean().optional(),
	}),
);

export const getDnsZonesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDnsZonesResponseSchema = getDnsZonesStatus200Schema;

export const getDnsZonesErrorSchema = getDnsZonesStatusDefaultSchema;

export const getDnsZonePathZoneIdSchema = z.string();

export const getDnsZoneStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	errors: z.array(z.string()).optional(),
	supported_record_types: z.array(z.string()).optional(),
	user_id: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	records: z
		.array(
			z.object({
				id: z.string().optional(),
				hostname: z.string().optional(),
				type: z.string().optional(),
				value: z.string().optional(),
				ttl: z.coerce.bigint().optional(),
				priority: z.coerce.bigint().optional(),
				dns_zone_id: z.string().optional(),
				site_id: z.string().optional(),
				flag: z.int().optional(),
				tag: z.string().optional(),
				managed: z.boolean().optional(),
			}),
		)
		.optional(),
	dns_servers: z.array(z.string()).optional(),
	account_id: z.string().optional(),
	site_id: z.string().optional(),
	account_slug: z.string().optional(),
	account_name: z.string().optional(),
	domain: z.string().optional(),
	ipv6_enabled: z.boolean().optional(),
	dedicated: z.boolean().optional(),
});

export const getDnsZoneStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDnsZoneResponseSchema = getDnsZoneStatus200Schema;

export const getDnsZoneErrorSchema = getDnsZoneStatusDefaultSchema;

export const deleteDnsZonePathZoneIdSchema = z.string();

export const deleteDnsZoneStatus204Schema = z.unknown();

export const deleteDnsZoneStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteDnsZoneResponseSchema = deleteDnsZoneStatus204Schema;

export const deleteDnsZoneErrorSchema = deleteDnsZoneStatusDefaultSchema;

export const transferDnsZonePathZoneIdSchema = z.string();

export const transferDnsZoneQueryAccountIdSchema = z
	.string()
	.describe("the account of the dns zone");

export const transferDnsZoneQueryTransferAccountIdSchema = z
	.string()
	.describe("the account you want to transfer the dns zone to");

export const transferDnsZoneQueryTransferUserIdSchema = z
	.string()
	.describe("the user you want to transfer the dns zone to");

export const transferDnsZoneStatus200Schema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	errors: z.array(z.string()).optional(),
	supported_record_types: z.array(z.string()).optional(),
	user_id: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	records: z
		.array(
			z.object({
				id: z.string().optional(),
				hostname: z.string().optional(),
				type: z.string().optional(),
				value: z.string().optional(),
				ttl: z.coerce.bigint().optional(),
				priority: z.coerce.bigint().optional(),
				dns_zone_id: z.string().optional(),
				site_id: z.string().optional(),
				flag: z.int().optional(),
				tag: z.string().optional(),
				managed: z.boolean().optional(),
			}),
		)
		.optional(),
	dns_servers: z.array(z.string()).optional(),
	account_id: z.string().optional(),
	site_id: z.string().optional(),
	account_slug: z.string().optional(),
	account_name: z.string().optional(),
	domain: z.string().optional(),
	ipv6_enabled: z.boolean().optional(),
	dedicated: z.boolean().optional(),
});

export const transferDnsZoneStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const transferDnsZoneResponseSchema = transferDnsZoneStatus200Schema;

export const transferDnsZoneErrorSchema = transferDnsZoneStatusDefaultSchema;

export const getDnsRecordsPathZoneIdSchema = z.string();

export const getDnsRecordsStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		hostname: z.string().optional(),
		type: z.string().optional(),
		value: z.string().optional(),
		ttl: z.coerce.bigint().optional(),
		priority: z.coerce.bigint().optional(),
		dns_zone_id: z.string().optional(),
		site_id: z.string().optional(),
		flag: z.int().optional(),
		tag: z.string().optional(),
		managed: z.boolean().optional(),
	}),
);

export const getDnsRecordsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getDnsRecordsResponseSchema = getDnsRecordsStatus200Schema;

export const getDnsRecordsErrorSchema = getDnsRecordsStatusDefaultSchema;

export const createDnsRecordPathZoneIdSchema = z.string();

export const createDnsRecordStatus201Schema = z.object({
	id: z.string().optional(),
	hostname: z.string().optional(),
	type: z.string().optional(),
	value: z.string().optional(),
	ttl: z.coerce.bigint().optional(),
	priority: z.coerce.bigint().optional(),
	dns_zone_id: z.string().optional(),
	site_id: z.string().optional(),
	flag: z.int().optional(),
	tag: z.string().optional(),
	managed: z.boolean().optional(),
});

export const createDnsRecordStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createDnsRecordResponseSchema = createDnsRecordStatus201Schema;

export const createDnsRecordErrorSchema = createDnsRecordStatusDefaultSchema;

export const createDnsRecordBodySchema = z.object({
	type: z.string().optional(),
	hostname: z.string().optional(),
	value: z.string().optional(),
	ttl: z.coerce.bigint().optional(),
	priority: z.coerce.bigint().optional(),
	weight: z.coerce.bigint().optional(),
	port: z.coerce.bigint().optional(),
	flag: z.coerce.bigint().optional(),
	tag: z.string().optional(),
});

export const getIndividualDnsRecordPathZoneIdSchema = z.string();

export const getIndividualDnsRecordPathDnsRecordIdSchema = z.string();

export const getIndividualDnsRecordStatus200Schema = z.object({
	id: z.string().optional(),
	hostname: z.string().optional(),
	type: z.string().optional(),
	value: z.string().optional(),
	ttl: z.coerce.bigint().optional(),
	priority: z.coerce.bigint().optional(),
	dns_zone_id: z.string().optional(),
	site_id: z.string().optional(),
	flag: z.int().optional(),
	tag: z.string().optional(),
	managed: z.boolean().optional(),
});

export const getIndividualDnsRecordStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getIndividualDnsRecordResponseSchema = getIndividualDnsRecordStatus200Schema;

export const getIndividualDnsRecordErrorSchema = getIndividualDnsRecordStatusDefaultSchema;

export const deleteDnsRecordPathZoneIdSchema = z.string();

export const deleteDnsRecordPathDnsRecordIdSchema = z.string();

export const deleteDnsRecordStatus204Schema = z.unknown();

export const deleteDnsRecordStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteDnsRecordResponseSchema = deleteDnsRecordStatus204Schema;

export const deleteDnsRecordErrorSchema = deleteDnsRecordStatusDefaultSchema;

export const listSiteDevServersPathSiteIdSchema = z.string();

export const listSiteDevServersQueryPageSchema = z.int().optional();

export const listSiteDevServersQueryPerPageSchema = z.int().optional();

export const listSiteDevServersStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		branch: z.string().optional(),
		url: z.string().optional(),
		state: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		starting_at: z.string().optional(),
		error_at: z.string().optional(),
		live_at: z.string().optional(),
		done_at: z.string().optional(),
		title: z.string().optional(),
	}),
);

export const listSiteDevServersStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDevServersResponseSchema = listSiteDevServersStatus200Schema;

export const listSiteDevServersErrorSchema = listSiteDevServersStatusDefaultSchema;

export const createSiteDevServerPathSiteIdSchema = z.string();

export const createSiteDevServerQueryBranchSchema = z.string().optional();

export const createSiteDevServerStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		branch: z.string().optional(),
		url: z.string().optional(),
		state: z.string().optional(),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
		starting_at: z.string().optional(),
		error_at: z.string().optional(),
		live_at: z.string().optional(),
		done_at: z.string().optional(),
		title: z.string().optional(),
	}),
);

export const createSiteDevServerStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDevServerResponseSchema = createSiteDevServerStatus200Schema;

export const createSiteDevServerErrorSchema = createSiteDevServerStatusDefaultSchema;

export const deleteSiteDevServersPathSiteIdSchema = z.string();

export const deleteSiteDevServersQueryBranchSchema = z.string().optional();

export const deleteSiteDevServersStatus202Schema = z.unknown();

export const deleteSiteDevServersStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDevServersResponseSchema = deleteSiteDevServersStatus202Schema;

export const deleteSiteDevServersErrorSchema = deleteSiteDevServersStatusDefaultSchema;

export const getSiteDevServerPathSiteIdSchema = z.string();

export const getSiteDevServerPathDevServerIdSchema = z.string();

export const getSiteDevServerStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	starting_at: z.string().optional(),
	error_at: z.string().optional(),
	live_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
});

export const getSiteDevServerResponseSchema = getSiteDevServerStatus200Schema;

export const markDevServerActivityPathSiteIdSchema = z.string();

export const markDevServerActivityPathDevServerIdSchema = z.string();

export const markDevServerActivityStatus200Schema = z.unknown();

export const markDevServerActivityResponseSchema = markDevServerActivityStatus200Schema;

export const updateDevServerStatePathSiteIdSchema = z.string();

export const updateDevServerStatePathDevServerIdSchema = z.string();

export const updateDevServerStateStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	state: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	starting_at: z.string().optional(),
	error_at: z.string().optional(),
	live_at: z.string().optional(),
	done_at: z.string().optional(),
	title: z.string().optional(),
});

export const updateDevServerStateStatus409Schema = z.unknown();

export const updateDevServerStateResponseSchema = updateDevServerStateStatus200Schema;

export const updateDevServerStateErrorSchema = updateDevServerStateStatus409Schema;

export const updateDevServerStateBodySchema = z.object({
	state: z.enum(["starting", "live", "error", "done"]),
	task_id: z.string().optional(),
	error: z.string().optional(),
});

export const listSiteDevServerHooksPathSiteIdSchema = z.string();

export const listSiteDevServerHooksStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		url: z.string().optional(),
		site_id: z.string().optional(),
		created_at: z.string().optional(),
		type: z.enum(["new_dev_server", "content_refresh"]).optional(),
	}),
);

export const listSiteDevServerHooksStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDevServerHooksResponseSchema = listSiteDevServerHooksStatus200Schema;

export const listSiteDevServerHooksErrorSchema = listSiteDevServerHooksStatusDefaultSchema;

export const createSiteDevServerHookPathSiteIdSchema = z.string();

export const createSiteDevServerHookStatus201Schema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const createSiteDevServerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDevServerHookResponseSchema = createSiteDevServerHookStatus201Schema;

export const createSiteDevServerHookErrorSchema = createSiteDevServerHookStatusDefaultSchema;

export const createSiteDevServerHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const getSiteDevServerHookPathSiteIdSchema = z.string();

export const getSiteDevServerHookPathIdSchema = z.string();

export const getSiteDevServerHookStatus200Schema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	url: z.string().optional(),
	site_id: z.string().optional(),
	created_at: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const getSiteDevServerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDevServerHookResponseSchema = getSiteDevServerHookStatus200Schema;

export const getSiteDevServerHookErrorSchema = getSiteDevServerHookStatusDefaultSchema;

export const updateSiteDevServerHookPathSiteIdSchema = z.string();

export const updateSiteDevServerHookPathIdSchema = z.string();

export const updateSiteDevServerHookStatus204Schema = z.unknown();

export const updateSiteDevServerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteDevServerHookResponseSchema = updateSiteDevServerHookStatus204Schema;

export const updateSiteDevServerHookErrorSchema = updateSiteDevServerHookStatusDefaultSchema;

export const updateSiteDevServerHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	type: z.enum(["new_dev_server", "content_refresh"]).optional(),
});

export const deleteSiteDevServerHookPathSiteIdSchema = z.string();

export const deleteSiteDevServerHookPathIdSchema = z.string();

export const deleteSiteDevServerHookStatus204Schema = z.unknown();

export const deleteSiteDevServerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDevServerHookResponseSchema = deleteSiteDevServerHookStatus204Schema;

export const deleteSiteDevServerHookErrorSchema = deleteSiteDevServerHookStatusDefaultSchema;

export const listSiteAgentRunnerHooksPathSiteIdSchema = z.string();

export const listSiteAgentRunnerHooksStatus200Schema = z.array(
	z.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		prompt: z.string().optional(),
		agent: z.string().optional(),
		url: z.string().optional(),
		msg: z.string().optional(),
		created_at: z.string().optional(),
	}),
);

export const listSiteAgentRunnerHooksStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteAgentRunnerHooksResponseSchema = listSiteAgentRunnerHooksStatus200Schema;

export const listSiteAgentRunnerHooksErrorSchema = listSiteAgentRunnerHooksStatusDefaultSchema;

export const createSiteAgentRunnerHookPathSiteIdSchema = z.string();

export const createSiteAgentRunnerHookStatus201Schema = z
	.object({
		id: z.string().optional(),
		site_id: z.string().optional(),
		title: z.string().optional(),
		branch: z.string().optional(),
		prompt: z.string().optional(),
		agent: z.string().optional(),
		url: z.string().optional(),
		msg: z.string().optional(),
		created_at: z.string().optional(),
	})
	.extend({
		secret: z.string().optional(),
	});

export const createSiteAgentRunnerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteAgentRunnerHookResponseSchema = createSiteAgentRunnerHookStatus201Schema;

export const createSiteAgentRunnerHookErrorSchema = createSiteAgentRunnerHookStatusDefaultSchema;

export const createSiteAgentRunnerHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	prompt: z.string().optional(),
	agent: z.string().optional(),
});

export const getSiteAgentRunnerHookPathSiteIdSchema = z.string();

export const getSiteAgentRunnerHookPathIdSchema = z.string();

export const getSiteAgentRunnerHookStatus200Schema = z.object({
	id: z.string().optional(),
	site_id: z.string().optional(),
	title: z.string().optional(),
	branch: z.string().optional(),
	prompt: z.string().optional(),
	agent: z.string().optional(),
	url: z.string().optional(),
	msg: z.string().optional(),
	created_at: z.string().optional(),
});

export const getSiteAgentRunnerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteAgentRunnerHookResponseSchema = getSiteAgentRunnerHookStatus200Schema;

export const getSiteAgentRunnerHookErrorSchema = getSiteAgentRunnerHookStatusDefaultSchema;

export const updateSiteAgentRunnerHookPathSiteIdSchema = z.string();

export const updateSiteAgentRunnerHookPathIdSchema = z.string();

export const updateSiteAgentRunnerHookStatus204Schema = z.unknown();

export const updateSiteAgentRunnerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updateSiteAgentRunnerHookResponseSchema = updateSiteAgentRunnerHookStatus204Schema;

export const updateSiteAgentRunnerHookErrorSchema = updateSiteAgentRunnerHookStatusDefaultSchema;

export const updateSiteAgentRunnerHookBodySchema = z.object({
	title: z.string().optional(),
	branch: z.string().optional(),
	prompt: z.string().optional(),
	agent: z.string().optional(),
});

export const deleteSiteAgentRunnerHookPathSiteIdSchema = z.string();

export const deleteSiteAgentRunnerHookPathIdSchema = z.string();

export const deleteSiteAgentRunnerHookStatus204Schema = z.unknown();

export const deleteSiteAgentRunnerHookStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteAgentRunnerHookResponseSchema = deleteSiteAgentRunnerHookStatus204Schema;

export const deleteSiteAgentRunnerHookErrorSchema = deleteSiteAgentRunnerHookStatusDefaultSchema;

export const getAIGatewayProvidersStatus200Schema = z.object({
	providers: z
		.object({})
		.catchall(
			z.object({
				token_env_var: z.string().optional(),
				url_env_var: z.string().optional(),
				models: z.array(z.string()).optional(),
			}),
		)
		.optional(),
});

export const getAIGatewayProvidersStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAIGatewayProvidersResponseSchema = getAIGatewayProvidersStatus200Schema;

export const getAIGatewayProvidersErrorSchema = getAIGatewayProvidersStatusDefaultSchema;

export const getAIGatewayTokenPathSiteIdSchema = z.string().describe("The site ID");

export const getAIGatewayTokenStatus200Schema = z.object({
	token: z.string().optional().describe("The AI Gateway authentication token"),
	url: z.string().optional().describe("AI gateway base url"),
	expires_at: z.coerce.bigint().optional().describe("Unix timestamp when the token expires"),
});

export const getAIGatewayTokenStatus404Schema = z.unknown();

export const getAIGatewayTokenStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAIGatewayTokenResponseSchema = getAIGatewayTokenStatus200Schema;

export const getAIGatewayTokenErrorSchema = z.union([
	getAIGatewayTokenStatus404Schema,
	getAIGatewayTokenStatusDefaultSchema,
]);

export const getAccountAIGatewayTokenPathAccountIdSchema = z.string().describe("The account ID");

export const getAccountAIGatewayTokenStatus200Schema = z.object({
	token: z.string().optional().describe("The AI Gateway authentication token"),
	url: z.string().optional().describe("AI gateway base url"),
	expires_at: z.coerce.bigint().optional().describe("Unix timestamp when the token expires"),
});

export const getAccountAIGatewayTokenStatus404Schema = z.unknown();

export const getAccountAIGatewayTokenStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getAccountAIGatewayTokenResponseSchema = getAccountAIGatewayTokenStatus200Schema;

export const getAccountAIGatewayTokenErrorSchema = z.union([
	getAccountAIGatewayTokenStatus404Schema,
	getAccountAIGatewayTokenStatusDefaultSchema,
]);

export const createSiteDatabasePathSiteIdSchema = z.string();

export const createSiteDatabaseStatus200Schema = z
	.object({
		connection_string: z.string().optional().describe("The connection string for the database"),
	})
	.describe("Response containing the database connection string");

export const createSiteDatabaseStatus201Schema = z
	.object({
		connection_string: z.string().optional().describe("The connection string for the database"),
	})
	.describe("Response containing the database connection string");

export const createSiteDatabaseStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDatabaseResponseSchema = z.union([
	createSiteDatabaseStatus200Schema,
	createSiteDatabaseStatus201Schema,
]);

export const createSiteDatabaseErrorSchema = createSiteDatabaseStatusDefaultSchema;

export const createSiteDatabaseBodySchema = z
	.object({
		region: z
			.string()
			.optional()
			.describe(
				"The region where the database should be created. Defaults to the site's functions region if not specified.",
			),
	})
	.optional()
	.describe("Request body for creating a database");

export const getSiteDatabasePathSiteIdSchema = z.string();

export const getSiteDatabaseQueryRoleSchema = z
	.enum(["netlifydb_owner", "netlifydb_readonly"])
	.optional()
	.describe(
		"The database role to use for the connection string. Defaults to netlifydb_owner if not specified.",
	);

export const getSiteDatabaseStatus200Schema = z
	.object({
		connection_string: z.string().optional().describe("The connection string for the database"),
	})
	.describe("Response containing the database connection string");

export const getSiteDatabaseStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDatabaseResponseSchema = getSiteDatabaseStatus200Schema;

export const getSiteDatabaseErrorSchema = getSiteDatabaseStatusDefaultSchema;

export const deleteSiteDatabasePathSiteIdSchema = z.string();

export const deleteSiteDatabaseStatus204Schema = z.unknown();

export const deleteSiteDatabaseStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDatabaseResponseSchema = deleteSiteDatabaseStatus204Schema;

export const deleteSiteDatabaseErrorSchema = deleteSiteDatabaseStatusDefaultSchema;

export const createSiteDatabaseBranchPathSiteIdSchema = z.string();

export const createSiteDatabaseBranchStatus200Schema = z
	.object({
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the database branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response containing the database branch connection string");

export const createSiteDatabaseBranchStatus201Schema = z
	.object({
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the database branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response containing the database branch connection string");

export const createSiteDatabaseBranchStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDatabaseBranchResponseSchema = z.union([
	createSiteDatabaseBranchStatus200Schema,
	createSiteDatabaseBranchStatus201Schema,
]);

export const createSiteDatabaseBranchErrorSchema = createSiteDatabaseBranchStatusDefaultSchema;

export const createSiteDatabaseBranchBodySchema = z
	.object({
		parent_branch_id: z
			.string()
			.optional()
			.describe(
				"The ID of the parent branch to create the new branch from. Defaults to the production branch if not specified.",
			),
		branch_id: z.string().describe("The branch identifier"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Arbitrary metadata to associate with the branch"),
	})
	.describe("Request body for creating a database branch");

export const listSiteDatabaseBranchesPathSiteIdSchema = z.string();

export const listSiteDatabaseBranchesStatus200Schema = z
	.object({
		branches: z
			.array(
				z.object({
					branch_id: z.string().optional().describe("The branch identifier"),
					name: z.string().optional().describe("The branch name"),
					connection_string: z.string().optional().describe("The connection string for the branch"),
					state: z
						.enum(["init", "creating", "resetting", "ready", "archived"])
						.optional()
						.describe("The current state of the branch"),
					logical_size_bytes: z.coerce
						.bigint()
						.optional()
						.describe("The logical size of the branch in bytes"),
					created_at: z.string().optional().describe("When the branch was created"),
					updated_at: z.string().optional().describe("When the branch was last updated"),
					last_active_at: z.string().optional().describe("When the branch was last active"),
					compute: z
						.object({
							current_state: z
								.enum(["active", "idle"])
								.optional()
								.describe("The current state of the compute endpoint"),
							autoscaling_limit_min_cu: z
								.number()
								.optional()
								.describe("Minimum compute units for autoscaling"),
							autoscaling_limit_max_cu: z
								.number()
								.optional()
								.describe("Maximum compute units for autoscaling"),
							suspend_timeout_seconds: z.coerce
								.bigint()
								.optional()
								.describe("Seconds of inactivity before the compute endpoint is suspended"),
							last_active: z
								.string()
								.optional()
								.describe("When the compute endpoint was last active"),
						})
						.optional()
						.describe("Compute endpoint status for a branch"),
					metadata: z
						.object({})
						.catchall(z.unknown())
						.optional()
						.describe("Metadata associated with the branch"),
				}),
			)
			.optional()
			.describe("List of database branches"),
	})
	.describe("Response containing a list of database branches");

export const listSiteDatabaseBranchesStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDatabaseBranchesResponseSchema = listSiteDatabaseBranchesStatus200Schema;

export const listSiteDatabaseBranchesErrorSchema = listSiteDatabaseBranchesStatusDefaultSchema;

export const getSiteDatabaseBranchPathSiteIdSchema = z.string();

export const getSiteDatabaseBranchPathBranchIdSchema = z.string().describe("The branch ID");

export const getSiteDatabaseBranchQueryRoleSchema = z
	.enum(["netlifydb_owner", "netlifydb_readonly"])
	.optional()
	.describe(
		"The database role to use for the connection string. Defaults to netlifydb_owner if not specified.",
	);

export const getSiteDatabaseBranchStatus200Schema = z
	.object({
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the database branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response containing the database branch connection string");

export const getSiteDatabaseBranchStatus404Schema = z.unknown();

export const getSiteDatabaseBranchStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDatabaseBranchResponseSchema = getSiteDatabaseBranchStatus200Schema;

export const getSiteDatabaseBranchErrorSchema = z.union([
	getSiteDatabaseBranchStatus404Schema,
	getSiteDatabaseBranchStatusDefaultSchema,
]);

export const deleteSiteDatabaseBranchPathSiteIdSchema = z.string();

export const deleteSiteDatabaseBranchPathBranchIdSchema = z.string().describe("The branch ID");

export const deleteSiteDatabaseBranchStatus204Schema = z.unknown();

export const deleteSiteDatabaseBranchStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDatabaseBranchResponseSchema = deleteSiteDatabaseBranchStatus204Schema;

export const deleteSiteDatabaseBranchErrorSchema = deleteSiteDatabaseBranchStatusDefaultSchema;

export const resetSiteDatabaseBranchPathSiteIdSchema = z.string();

export const resetSiteDatabaseBranchPathBranchIdSchema = z
	.string()
	.describe("The branch ID to reset");

export const resetSiteDatabaseBranchQueryForceSchema = z
	.boolean()
	.optional()
	.describe("If true, resets the branch even when it is already in sync with the source.");

export const resetSiteDatabaseBranchQueryRoleSchema = z
	.enum(["netlifydb_owner", "netlifydb_readonly"])
	.optional()
	.describe(
		"The database role to use for the returned connection string. Defaults to netlifydb_owner if not specified.",
	);

export const resetSiteDatabaseBranchStatus200Schema = z
	.object({
		reset: z
			.boolean()
			.optional()
			.describe(
				"Whether the branch was actually re-forked. False when the target was already in sync with the source and `force=true` was not set.",
			),
		connection_string: z
			.string()
			.optional()
			.describe("The connection string for the reset (or unchanged) branch"),
		metadata: z
			.object({})
			.catchall(z.unknown())
			.optional()
			.describe("Metadata associated with the branch"),
	})
	.describe("Response for a database branch reset");

export const resetSiteDatabaseBranchStatus400Schema = z.unknown();

export const resetSiteDatabaseBranchStatus404Schema = z.unknown();

export const resetSiteDatabaseBranchStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const resetSiteDatabaseBranchResponseSchema = resetSiteDatabaseBranchStatus200Schema;

export const resetSiteDatabaseBranchErrorSchema = z.union([
	resetSiteDatabaseBranchStatus400Schema,
	resetSiteDatabaseBranchStatus404Schema,
	resetSiteDatabaseBranchStatusDefaultSchema,
]);

export const resetSiteDatabaseBranchBodySchema = z
	.object({
		source_branch_id: z
			.string()
			.optional()
			.describe(
				'The ID of the branch to re-fork the target branch from. Defaults to "production" if not specified.',
			),
	})
	.optional()
	.describe("Request body for resetting a database branch");

export const setSiteDatabaseBranchComputeSettingsPathSiteIdSchema = z.string();

export const setSiteDatabaseBranchComputeSettingsPathBranchIdSchema = z
	.string()
	.describe("The branch ID");

export const setSiteDatabaseBranchComputeSettingsStatus200Schema = z
	.object({
		min_cu: z.number().optional().describe("Minimum compute units"),
		max_cu: z.number().optional().describe("Maximum compute units"),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.optional()
			.describe("Seconds of inactivity before suspension"),
	})
	.describe("Compute settings for a database or branch");

export const setSiteDatabaseBranchComputeSettingsStatus403Schema = z.unknown();

export const setSiteDatabaseBranchComputeSettingsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const setSiteDatabaseBranchComputeSettingsResponseSchema =
	setSiteDatabaseBranchComputeSettingsStatus200Schema;

export const setSiteDatabaseBranchComputeSettingsErrorSchema = z.union([
	setSiteDatabaseBranchComputeSettingsStatus403Schema,
	setSiteDatabaseBranchComputeSettingsStatusDefaultSchema,
]);

export const setSiteDatabaseBranchComputeSettingsBodySchema = z
	.object({
		min_cu: z
			.number()
			.nullish()
			.describe("Minimum compute units (0.25 to 16.0). Must be less than or equal to max_cu."),
		max_cu: z
			.number()
			.nullish()
			.describe(
				"Maximum compute units (0.25 to 16.0). Must be greater than or equal to min_cu. max_cu - min_cu must not exceed 8.0.",
			),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.nullish()
			.describe(
				"Seconds of inactivity before the compute endpoint is suspended. Use -1 for always on, or a non-negative value.",
			),
	})
	.describe(
		"Request body for setting compute settings. All fields are optional; only provided fields are updated.",
	);

export const setSiteDatabaseComputeSettingsPathSiteIdSchema = z.string();

export const setSiteDatabaseComputeSettingsStatus200Schema = z
	.object({
		min_cu: z.number().optional().describe("Minimum compute units"),
		max_cu: z.number().optional().describe("Maximum compute units"),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.optional()
			.describe("Seconds of inactivity before suspension"),
	})
	.describe("Compute settings for a database or branch");

export const setSiteDatabaseComputeSettingsStatus403Schema = z.unknown();

export const setSiteDatabaseComputeSettingsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const setSiteDatabaseComputeSettingsResponseSchema =
	setSiteDatabaseComputeSettingsStatus200Schema;

export const setSiteDatabaseComputeSettingsErrorSchema = z.union([
	setSiteDatabaseComputeSettingsStatus403Schema,
	setSiteDatabaseComputeSettingsStatusDefaultSchema,
]);

export const setSiteDatabaseComputeSettingsBodySchema = z
	.object({
		min_cu: z
			.number()
			.nullish()
			.describe("Minimum compute units (0.25 to 16.0). Must be less than or equal to max_cu."),
		max_cu: z
			.number()
			.nullish()
			.describe(
				"Maximum compute units (0.25 to 16.0). Must be greater than or equal to min_cu. max_cu - min_cu must not exceed 8.0.",
			),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.nullish()
			.describe(
				"Seconds of inactivity before the compute endpoint is suspended. Use -1 for always on, or a non-negative value.",
			),
	})
	.describe(
		"Request body for setting compute settings. All fields are optional; only provided fields are updated.",
	);

export const getSiteDatabaseComputeSettingsPathSiteIdSchema = z.string();

export const getSiteDatabaseComputeSettingsStatus200Schema = z
	.object({
		min_cu: z.number().optional().describe("Minimum compute units"),
		max_cu: z.number().optional().describe("Maximum compute units"),
		sleep_timeout_seconds: z.coerce
			.bigint()
			.optional()
			.describe("Seconds of inactivity before suspension"),
	})
	.describe("Compute settings for a database or branch");

export const getSiteDatabaseComputeSettingsStatus403Schema = z.unknown();

export const getSiteDatabaseComputeSettingsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDatabaseComputeSettingsResponseSchema =
	getSiteDatabaseComputeSettingsStatus200Schema;

export const getSiteDatabaseComputeSettingsErrorSchema = z.union([
	getSiteDatabaseComputeSettingsStatus403Schema,
	getSiteDatabaseComputeSettingsStatusDefaultSchema,
]);

export const clearSiteDatabaseComputeSettingsPathSiteIdSchema = z.string();

export const clearSiteDatabaseComputeSettingsStatus204Schema = z.unknown();

export const clearSiteDatabaseComputeSettingsStatus403Schema = z.unknown();

export const clearSiteDatabaseComputeSettingsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const clearSiteDatabaseComputeSettingsResponseSchema =
	clearSiteDatabaseComputeSettingsStatus204Schema;

export const clearSiteDatabaseComputeSettingsErrorSchema = z.union([
	clearSiteDatabaseComputeSettingsStatus403Schema,
	clearSiteDatabaseComputeSettingsStatusDefaultSchema,
]);

export const listSiteDatabaseMigrationsPathSiteIdSchema = z.string();

export const listSiteDatabaseMigrationsQueryBranchSchema = z
	.string()
	.optional()
	.describe('The branch ID to list migrations for. Defaults to "production" if not specified.');

export const listSiteDatabaseMigrationsStatus200Schema = z
	.object({
		migrations: z
			.array(
				z.object({
					version: z.coerce.bigint().optional().describe("The migration version number"),
					name: z.string().optional().describe("The migration name"),
					path: z
						.string()
						.optional()
						.describe("The path to the migration file in the deploy bundle"),
					applied: z
						.boolean()
						.optional()
						.describe("Whether this migration has been applied to the branch"),
				}),
			)
			.optional()
			.describe("List of migrations"),
	})
	.describe("Response containing the list of migrations for a branch");

export const listSiteDatabaseMigrationsStatus404Schema = z.unknown();

export const listSiteDatabaseMigrationsStatus423Schema = z.unknown();

export const listSiteDatabaseMigrationsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDatabaseMigrationsResponseSchema = listSiteDatabaseMigrationsStatus200Schema;

export const listSiteDatabaseMigrationsErrorSchema = z.union([
	listSiteDatabaseMigrationsStatus404Schema,
	listSiteDatabaseMigrationsStatus423Schema,
	listSiteDatabaseMigrationsStatusDefaultSchema,
]);

export const getSiteDatabaseMigrationPathSiteIdSchema = z.string();

export const getSiteDatabaseMigrationPathNameSchema = z.string().describe("The migration name");

export const getSiteDatabaseMigrationQueryBranchSchema = z
	.string()
	.optional()
	.describe(
		"The branch ID to look up the migration on. Defaults to the currently published deploy's branch.",
	);

export const getSiteDatabaseMigrationStatus200Schema = z
	.object({
		version: z.coerce.bigint().optional().describe("The migration version number"),
		name: z.string().optional().describe("The migration name"),
		path: z.string().optional().describe("The path to the migration file in the deploy bundle"),
		content: z.string().optional().describe("The raw contents of the migration file"),
	})
	.describe("A migration with its file contents");

export const getSiteDatabaseMigrationStatus404Schema = z.unknown();

export const getSiteDatabaseMigrationStatus423Schema = z.unknown();

export const getSiteDatabaseMigrationStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const getSiteDatabaseMigrationResponseSchema = getSiteDatabaseMigrationStatus200Schema;

export const getSiteDatabaseMigrationErrorSchema = z.union([
	getSiteDatabaseMigrationStatus404Schema,
	getSiteDatabaseMigrationStatus423Schema,
	getSiteDatabaseMigrationStatusDefaultSchema,
]);

export const runSiteDatabaseMigrationsPathSiteIdSchema = z.string();

export const runSiteDatabaseMigrationsPathDeployIdSchema = z
	.string()
	.describe("The deploy ID to run migrations for");

export const runSiteDatabaseMigrationsStatus200Schema = z.unknown();

export const runSiteDatabaseMigrationsStatus409Schema = z.unknown();

export const runSiteDatabaseMigrationsStatus422Schema = z.unknown();

export const runSiteDatabaseMigrationsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const runSiteDatabaseMigrationsResponseSchema = runSiteDatabaseMigrationsStatus200Schema;

export const runSiteDatabaseMigrationsErrorSchema = z.union([
	runSiteDatabaseMigrationsStatus409Schema,
	runSiteDatabaseMigrationsStatus422Schema,
	runSiteDatabaseMigrationsStatusDefaultSchema,
]);

export const runSiteDatabaseMigrationsBodySchema = z
	.object({
		dry_run: z
			.boolean()
			.optional()
			.describe("If true, validates migrations without applying them."),
	})
	.optional()
	.describe("Request body for running database migrations");

export const createSiteDatabaseSnapshotPathSiteIdSchema = z.string();

export const createSiteDatabaseSnapshotStatus201Schema = z
	.object({
		id: z.string().optional().describe("The unique identifier of the snapshot"),
		source_branch_id: z.string().optional().describe("The ID of the branch that was snapshotted"),
		manual: z.boolean().optional().describe("Whether this snapshot was manually created"),
		created_at: z.string().optional().describe("When the snapshot was created"),
		expires_at: z.string().optional().describe("When the snapshot expires"),
		timestamp: z.string().optional().describe("The point-in-time timestamp of the snapshot"),
		metadata: z
			.object({
				deploy: z
					.object({})
					.catchall(z.unknown())
					.optional()
					.describe("Deploy information associated with the snapshot"),
				source: z.string().optional().describe("The source that created the snapshot"),
			})
			.optional()
			.describe("Metadata associated with a snapshot"),
	})
	.describe("A point-in-time snapshot of a database branch");

export const createSiteDatabaseSnapshotStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const createSiteDatabaseSnapshotResponseSchema = createSiteDatabaseSnapshotStatus201Schema;

export const createSiteDatabaseSnapshotErrorSchema = createSiteDatabaseSnapshotStatusDefaultSchema;

export const createSiteDatabaseSnapshotBodySchema = z
	.object({
		branch_id: z
			.string()
			.optional()
			.describe('The ID of the branch to snapshot. Defaults to "production" if not specified.'),
		name: z.string().optional().describe("A name for the snapshot"),
		metadata: z
			.object({
				deploy: z
					.object({})
					.catchall(z.unknown())
					.optional()
					.describe("Deploy information associated with the snapshot"),
				source: z.string().optional().describe("The source that created the snapshot"),
			})
			.optional()
			.describe("Metadata associated with a snapshot"),
	})
	.optional()
	.describe("Request body for creating a database snapshot");

export const listSiteDatabaseSnapshotsPathSiteIdSchema = z.string();

export const listSiteDatabaseSnapshotsStatus200Schema = z
	.object({
		snapshots: z
			.array(
				z.object({
					id: z.string().optional().describe("The unique identifier of the snapshot"),
					source_branch_id: z
						.string()
						.optional()
						.describe("The ID of the branch that was snapshotted"),
					manual: z.boolean().optional().describe("Whether this snapshot was manually created"),
					created_at: z.string().optional().describe("When the snapshot was created"),
					expires_at: z.string().optional().describe("When the snapshot expires"),
					timestamp: z.string().optional().describe("The point-in-time timestamp of the snapshot"),
					metadata: z
						.object({
							deploy: z
								.object({})
								.catchall(z.unknown())
								.optional()
								.describe("Deploy information associated with the snapshot"),
							source: z.string().optional().describe("The source that created the snapshot"),
						})
						.optional()
						.describe("Metadata associated with a snapshot"),
				}),
			)
			.optional()
			.describe("List of database snapshots"),
	})
	.describe("Response containing a list of database snapshots");

export const listSiteDatabaseSnapshotsStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const listSiteDatabaseSnapshotsResponseSchema = listSiteDatabaseSnapshotsStatus200Schema;

export const listSiteDatabaseSnapshotsErrorSchema = listSiteDatabaseSnapshotsStatusDefaultSchema;

export const deleteSiteDatabaseSnapshotPathSiteIdSchema = z.string();

export const deleteSiteDatabaseSnapshotPathSnapshotIdSchema = z
	.string()
	.describe("The snapshot ID");

export const deleteSiteDatabaseSnapshotStatus204Schema = z.unknown();

export const deleteSiteDatabaseSnapshotStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const deleteSiteDatabaseSnapshotResponseSchema = deleteSiteDatabaseSnapshotStatus204Schema;

export const deleteSiteDatabaseSnapshotErrorSchema = deleteSiteDatabaseSnapshotStatusDefaultSchema;

export const restoreSiteDatabaseSnapshotPathSiteIdSchema = z.string();

export const restoreSiteDatabaseSnapshotPathSnapshotIdSchema = z
	.string()
	.describe("The snapshot ID to restore");

export const restoreSiteDatabaseSnapshotStatus200Schema = z.unknown();

export const restoreSiteDatabaseSnapshotStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const restoreSiteDatabaseSnapshotResponseSchema = restoreSiteDatabaseSnapshotStatus200Schema;

export const restoreSiteDatabaseSnapshotErrorSchema =
	restoreSiteDatabaseSnapshotStatusDefaultSchema;

export const restoreSiteDatabaseSnapshotBodySchema = z
	.object({
		branch_id: z
			.string()
			.optional()
			.describe(
				'The ID of the branch to restore the snapshot to. Defaults to "production" if not specified.',
			),
	})
	.optional()
	.describe("Request body for restoring a database snapshot");

export const updatePluginPathSiteIdSchema = z.string();

export const updatePluginPathPackageSchema = z.string();

export const updatePluginStatus200Schema = z.object({
	package: z.string().optional(),
	pinned_version: z.string().optional(),
});

export const updatePluginStatusDefaultSchema = z.object({
	code: z.coerce.bigint().optional(),
	message: z.string(),
});

export const updatePluginResponseSchema = updatePluginStatus200Schema;

export const updatePluginErrorSchema = updatePluginStatusDefaultSchema;

export const updatePluginBodySchema = z
	.object({
		pinned_version: z.string().optional(),
	})
	.optional();
