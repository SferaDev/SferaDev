// @ts-nocheck

import * as z from "zod";

export const listArchivedFilesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listArchivedFilesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listArchivedFilesQueryFromSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query start date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `to` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2021-03-11T05:41:36Z"] });

export const listArchivedFilesQueryToSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query end date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `from` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2021-03-18T05:41:36Z"] });

export const listArchivedFilesQueryQueryDateTypeSchema = z
	.enum(["meeting_start_time", "archive_complete_time"])
	.optional()
	.default("meeting_start_time")
	.describe(
		"The type of query date.\n* `meeting_start_time` \n* `archive_complete_time` \n\n This value defaults to `meeting_start_time`.",
	)
	.meta({ examples: ["meeting_start_time"] });

export const listArchivedFilesQueryGroupIdSchema = z
	.string()
	.optional()
	.describe("Deprecated. Please use 'group_ids' for querying.")
	.meta({ examples: ["pvFIYKSDTum9iCDOOtQL4w"] });

export const listArchivedFilesQueryGroupIdsSchema = z
	.string()
	.optional()
	.describe(
		"The group IDs. To get a group ID, use the [List groups](/docs/api/rest/reference/scim-api/methods/#operation/groupSCIM2List) API.\n(The maximum number of supported groups for filtering is 7.)",
	)
	.meta({ examples: ["CVCF1k8ZR3e52ChmEzlNxA,lwQiDh2kS0WaawetgMjtfw"] });

export const listArchivedFilesStatus200Schema = z.object({
	from: z.iso
		.datetime()
		.optional()
		.describe("The queried start date.")
		.meta({ examples: ["2021-03-12T02:12:27Z"] }),
	meetings: z
		.array(
			z.object({
				account_name: z
					.string()
					.describe("The user's account name.")
					.meta({ examples: ["account_01"] }),
				archive_files: z
					.array(
						z.object({
							download_url: z
								.string()
								.describe(
									"The URL to download the the archive file. \n\n **OAuth apps** \n\n If a user has authorized and installed your OAuth app that contains recording scopes, use the user's [OAuth access token](/docs/integrations/oauth/) to download the file. For example, `https://{{base-domain}}/rec/archive/download/xxx--header 'Authorization: Bearer {{OAuth-access-token}}'` \n\n **Note:** This field does **not** return for [Zoom on-premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). Instead, this API will return the `file_path` field.",
								)
								.meta({
									examples: ["https://example.com/recording/download/Qg75t7xZBtEbAkjdlgbfdngBBBB"],
								}),
							file_extension: z
								.string()
								.describe("The archived file's extension.")
								.meta({ examples: ["JSON"] }),
							file_path: z
								.string()
								.optional()
								.describe(
									"The file path to the on-premise account archive file. \n\n **Note:** The API only returns this field for [Zoom on-premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). It does **not** return the `download_url` field.",
								)
								.meta({ examples: ["/9090876528/path01/demo.mp4"] }),
							file_size: z
								.int()
								.describe("The archived file's size, in bytes.")
								.meta({ examples: [165743] }),
							file_type: z
								.enum([
									"MP4",
									"M4A",
									"CHAT",
									"CC",
									"CHAT_MESSAGE",
									"TRANSCRIPT",
									"SUB_GROUP_MEMBER_LOG",
									"AIC_COVERSATION",
								])
								.describe(
									"The archive file's type. \n* `MP4` - Video file. \n* `M4A` - Audio-only file. \n* `CHAT` - A TXT file containing in-meeting chat messages. \n* `CC` - A file containing the closed captions of the recording, in VTT file format. \n*  `CHAT_MESSAGE` - A JSON file encoded in base64 format containing chat messages. The file also includes waiting room chats, deleted messages, meeting emojis and non-verbal feedback. \n*  `TRANSCRIPT` - A JSON file include audio transcript wording. \n* `SUB_GROUP_MEMBER_LOG` - A json file containing records of members entering and leaving the subgroup. \n* `AIC_COVERSATION` - A json file include internal user archive aic content.",
								)
								.meta({ examples: ["CHAT"] }),
							id: z
								.string()
								.describe("The archive file's unique ID.")
								.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] }),
							individual: z
								.boolean()
								.describe(
									"Whether the archive file is an individual recording file. \n* `true` - An individual recording file. \n * `false` - An entire meeting file.",
								)
								.meta({ examples: [true] }),
							participant_email: z
								.email()
								.optional()
								.describe(
									"The individual recording file's participant email address. This value is returned when the `individual` value is `true`. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](/docs/api/using-zoom-apis/#email-address-display-rules) for details.",
								)
								.meta({ examples: ["jchill@example.com"] }),
							participant_join_time: z.iso
								.datetime()
								.describe(
									"The join time for the generated recording file. If this value is returned when the individual value is `true`, it is the recording file's participant join time. When the individual value is `false`, it returns the join time for the archiving gateway.",
								)
								.meta({ examples: ["2021-03-12T02:07:27Z"] }),
							participant_leave_time: z.iso
								.datetime()
								.describe(
									"The leave time for the generated recording file. If this value is returned when the individual value is `true`, it is the recording file's participant leave time. When the individual value is `false`, it returns the leave time for the archiving gateway.",
								)
								.meta({ examples: ["2021-03-12T02:12:27Z"] }),
							recording_type: z
								.enum([
									"shared_screen_with_speaker_view",
									"audio_only",
									"chat_file",
									"closed_caption",
									"chat_message",
									"audio_transcript",
									"aic_conversation",
								])
								.describe(
									"The archive file's recording type. \n* `shared_screen_with_speaker_view` \n* `audio_only` \n* `chat_file` \n* `closed_caption` \n* `chat_message` \n* `audio_transcript` \n* `aic_conversation` \n\n For more information, read our [Managing and sharing cloud recordings](https://support.zoom.us/hc/en-us/articles/205347605-Managing-and-sharing-cloud-recordings#h_9898497b-e736-4980-a749-d55608f10773) documentation.",
								)
								.meta({ examples: ["chat_message"] }),
							status: z
								.enum(["completed", "processing", "failed"])
								.describe(
									"The archived file's processing status. \n* `completed` - The processing of the file is complete. \n* `processing` - The file is processing. \n* `failed` - The processing of the file failed.",
								)
								.meta({ examples: ["completed"] }),
							encryption_fingerprint: z
								.string()
								.describe(
									"The archived file's encryption fingerprint, using the SHA256 hash algorithm.",
								)
								.meta({
									examples: ["abf85f0fe6a4db3cdd8c37e505e1dd18a34d9696170a14b5bc6395677472cf43"],
								}),
							number_of_messages: z
								.int()
								.optional()
								.describe(
									"The number of `TXT` or `JSON` file messages. This field returns only when the `file_extension` is `JSON` or `TXT`.",
								)
								.meta({ examples: [150] }),
							storage_location: z
								.enum(["US", "AU", "BR", "CA", "EU", "IN", "JP", "SG", "CH"])
								.optional()
								.describe(
									"The region where the file is stored. This field returns only `Enable Distributed Compliance Archiving` op feature is enabled.",
								)
								.meta({ examples: ["US"] }),
							auto_delete: z
								.boolean()
								.optional()
								.describe(
									'Whether to auto delete the archived file.\n\n**Prerequisites:** \n\nEnable the "Tag Archiving Files for Deletion" feature in OP. Contact [Zoom Support](https://support.zoom.us/hc/en-us/articles/201362003) to open.',
								)
								.meta({ examples: [false] }),
						}),
					)
					.describe("Information about the archive files."),
				complete_time: z
					.union([z.iso.datetime(), z.enum([""])])
					.describe("The meeting or webinar's archive completion time.")
					.meta({ examples: ["2021-03-12T02:57:27Z"] }),
				duration: z
					.int()
					.describe("The meeting or webinar's scheduled duration.")
					.meta({ examples: [1] }),
				duration_in_second: z
					.int()
					.describe("The meeting or webinar's duration, in seconds.")
					.meta({ examples: [1800] }),
				host_id: z
					.string()
					.describe("The ID of the user set as the host of the archived meeting or webinar.")
					.meta({ examples: ["Dhjdfgdkg8w"] }),
				id: z.coerce
					.bigint()
					.describe("The meeting or webinar ID, either `meetingId` or `webinarId`.")
					.meta({ examples: [553068284] }),
				is_breakout_room: z
					.boolean()
					.describe(
						"Whether the room is a [breakout room](https://support.zoom.us/hc/en-us/articles/115005769646-Participating-in-breakout-rooms).",
					)
					.meta({ examples: [false] }),
				meeting_type: z
					.enum(["internal", "external"])
					.describe(
						"Whether the meeting or webinar is internal or external. \n* `internal` - An internal meeting or webinar. \n* `external` - An external meeting or webinar. \n\n The `id`, `host_id`, and `topic` PII (Personal Identifiable Information) values in this response are removed when this value is `external`.",
					)
					.meta({ examples: ["internal"] }),
				parent_meeting_id: z
					.string()
					.optional()
					.describe(
						"The parent meeting's universally unique ID (UUID). Each meeting or webinar instance generates a UUID. If the `is_breakout_room` value is `true`, the API returns this value.",
					)
					.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] }),
				recording_count: z
					.int()
					.describe("The number of archived files returned in the API call response.")
					.meta({ examples: [2] }),
				start_time: z.iso
					.datetime()
					.describe("The meeting or webinar's start time.")
					.meta({ examples: ["2021-04-26T05:23:18Z"] }),
				timezone: z
					.string()
					.describe(
						"The meeting or webinar's [timezone](/docs/api/references/abbreviations/#timezones).",
					)
					.meta({ examples: ["Asia/Shanghai"] }),
				topic: z
					.string()
					.describe("The meeting or webinar topic.")
					.meta({ examples: ["My Personal Meeting Room"] }),
				total_size: z
					.int()
					.describe("The total size of the archive file, in bytes.")
					.meta({ examples: [364463] }),
				type: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
						z.literal(8),
						z.literal(9),
						z.literal(100),
					])
					.describe(
						"The type of archived meeting or webinar. \n\n Meeting recordings use these archive types. \n* `1` - Instant meeting. \n* `2` - Scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A meeting created via PMI (Personal Meeting ID). \n* `7` - A [Personal Audio Conference](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference) (PAC). \n* `8` - Recurring meeting with a fixed time. \n\n Webinar recordings use these archive types. \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time. \n* `9` - A recurring webinar with a fixed time. \n\n If the recording is **not** from a meeting or webinar: \n\n* `100` - A [breakout room](https://support.zoom.us/hc/en-us/articles/115005769646-Participating-in-breakout-rooms).",
					)
					.meta({ examples: [1] }),
				uuid: z
					.string()
					.describe(
						"The recorded meeting or webinar instance's universally unique identifier (UUID). Each meeting or webinar instance generates a UUID.",
					)
					.meta({ examples: ["yO3dfhh3t467UkQ=="] }),
				status: z
					.enum(["completed", "processing"])
					.describe(
						"The archive's processing status. \n* `completed` - The archive's processing is complete. \n* `processing` - The archive is processing.",
					)
					.meta({ examples: ["completed"] }),
				group_id: z
					.string()
					.optional()
					.describe(
						"Primary group IDs of participants who belong to your account. Each group ID is separated by a comma.",
					)
					.meta({ examples: ["pvFIYKSDTum9iCDOOtQL4w,_FsqLyI0RlO6LVPeUVWi8g"] }),
				physical_files: z
					.array(
						z.object({
							file_id: z
								.string()
								.optional()
								.describe("The physical file's unique ID.")
								.meta({ examples: ["pvKocCqVSMygaOcKus5Afw"] }),
							file_name: z
								.string()
								.optional()
								.describe("The physical file's name.")
								.meta({ examples: ["Screenshot 2025-02-12 at 10.42.27 AM.png"] }),
							file_size: z
								.int()
								.optional()
								.describe("The physical file's size, in bytes.")
								.meta({ examples: [540680] }),
							download_url: z
								.string()
								.optional()
								.describe(
									"The URL to download the the archive file. \n\n **OAuth apps** \n\n If a user has authorized and installed your OAuth app that contains recording scopes, use the user's [OAuth access token](/docs/integrations/oauth/) to download the file. \n\n Example: \n\n `https://{{base-domain}}/rec/archive/attached/download/xxx--header 'Authorization: Bearer {{OAuth-access-token}}'` ",
								)
								.meta({
									examples: [
										"https://example.com/rec/archive/attached/download/HBAXbHc15BXbnq0JoDu6tc5MWlww9MAo9JJq2d14VAWkpcT5FEA.AK5calud4EJB7bMq",
									],
								}),
						}),
					)
					.optional()
					.describe("Information about the physical files."),
			}),
		)
		.optional()
		.describe("Information about the meeting or webinar."),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.\n\n **Note:** if you use `next_page_token` as a parameter, your other request parameters should be changeless to make sure that the large result set is what you want. For example, if your `to` parameter is for a future time, Zoom resets this value to the current time and returns this value in the response body, along with the `next_page_token` value. Use these same `to` and `next_page_token` values in requests for the remaining results set; otherwise you will get an invalid token error.",
		)
		.meta({ examples: ["At6eWnFZ1FB3arCXnRxqHLXKhbDW18yz2i2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [20] }),
	to: z.iso
		.datetime()
		.optional()
		.describe("The queried end date.")
		.meta({ examples: ["2021-03-12T02:12:27Z"] }),
	total_records: z
		.int()
		.optional()
		.describe("The total number of returned meeting records.")
		.meta({ examples: [20] }),
});

export const listArchivedFilesStatus400Schema = z.unknown();

export const listArchivedFilesStatus429Schema = z.unknown();

export const listArchivedFilesResponseSchema = listArchivedFilesStatus200Schema;

export const listArchivedFilesErrorSchema = z.union([
	listArchivedFilesStatus400Schema,
	listArchivedFilesStatus429Schema,
]);

export const listArchiveFileDownloadAuditQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listArchiveFileDownloadAuditQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listArchiveFileDownloadAuditQueryFromSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query start date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `to` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2026-06-17T00:00:00Z"] });

export const listArchiveFileDownloadAuditQueryToSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query end date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `from` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2026-06-23T23:59:59Z"] });

export const listArchiveFileDownloadAuditStatus200Schema = z.object({
	from: z.iso
		.datetime()
		.optional()
		.describe("The queried start date.")
		.meta({ examples: ["2026-06-17T00:00:00Z"] }),
	meetings: z
		.array(
			z.object({
				meeting_uuid: z
					.string()
					.describe(
						"The meeting or webinar instance's universally unique identifier (UUID). Each meeting or webinar instance generates a UUID. If the UUID is unavailable, this field returns the meeting ID.",
					)
					.meta({ examples: ["yO3dfhh3t467UkQ=="] }),
				files: z
					.array(
						z.object({
							file_id: z
								.string()
								.describe("The archived file's unique ID.")
								.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] }),
							sources: z
								.array(
									z.object({
										source_ip: z
											.string()
											.describe("The IP address from which the archived file was downloaded.")
											.meta({ examples: ["10.0.0.1"] }),
										download_timestamps: z
											.array(z.iso.datetime())
											.describe("The timestamps of downloads from this source IP address.")
											.meta({ examples: [{}] }),
										total_download_count: z
											.int()
											.describe("The total number of downloads from this source IP address.")
											.meta({ examples: [2] }),
										first_download_time: z.iso
											.datetime()
											.optional()
											.describe("The first download time from this source IP address.")
											.meta({ examples: ["2026-06-17T01:02:03Z"] }),
										last_download_time: z.iso
											.datetime()
											.optional()
											.describe("The most recent download time from this source IP address.")
											.meta({ examples: ["2026-06-17T03:04:05Z"] }),
									}),
								)
								.describe("Download audit information grouped by source IP address."),
						}),
					)
					.describe("Download audit information grouped by archived file."),
			}),
		)
		.optional()
		.describe("Download audit information grouped by meeting or webinar."),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.\n\n**Note:** If you use `next_page_token` as a parameter, your other request parameters should remain unchanged to ensure the result set is consistent.",
		)
		.meta({ examples: ["At6eWnFZ1FB3arCXnRxqHLXKhbDW18yz2i2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [30] }),
	to: z.iso
		.datetime()
		.optional()
		.describe("The queried end date.")
		.meta({ examples: ["2026-06-23T23:59:59Z"] }),
});

export const listArchiveFileDownloadAuditStatus400Schema = z.unknown();

export const listArchiveFileDownloadAuditStatus401Schema = z.unknown();

export const listArchiveFileDownloadAuditStatus429Schema = z.unknown();

export const listArchiveFileDownloadAuditResponseSchema =
	listArchiveFileDownloadAuditStatus200Schema;

export const listArchiveFileDownloadAuditErrorSchema = z.union([
	listArchiveFileDownloadAuditStatus400Schema,
	listArchiveFileDownloadAuditStatus401Schema,
	listArchiveFileDownloadAuditStatus429Schema,
]);

export const getArchivedFileStatisticsQueryFromSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query start date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `to` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2021-03-11T05:41:36Z"] });

export const getArchivedFileStatisticsQueryToSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The query end date, in `yyyy-MM-dd'T'HH:mm:ssZ` format. This value and the `from` query parameter value cannot exceed seven days.",
	)
	.meta({ examples: ["2021-03-18T05:41:36Z"] });

export const getArchivedFileStatisticsStatus200Schema = z.object({
	from: z.iso
		.datetime()
		.optional()
		.describe("The queried start date.")
		.meta({ examples: ["2021-03-18T05:41:36Z"] }),
	to: z.iso
		.datetime()
		.optional()
		.describe("The queried end date.")
		.meta({ examples: ["2021-03-18T05:41:36Z"] }),
	total_records: z
		.int()
		.optional()
		.describe("The total number of returned meeting records.")
		.meta({ examples: [20] }),
	statistic_by_file_extension: z
		.object({
			mp4_file_count: z
				.int()
				.optional()
				.describe("The number of mp4 files.")
				.meta({ examples: [1] }),
			m4a_file_count: z
				.int()
				.optional()
				.describe("The number of m4a files.")
				.meta({ examples: [1] }),
			txt_file_count: z
				.int()
				.optional()
				.describe("The number of txt files.")
				.meta({ examples: [1] }),
			json_file_count: z
				.int()
				.optional()
				.describe("The number of json files.")
				.meta({ examples: [1] }),
			vtt_file_count: z
				.int()
				.optional()
				.describe("The number of vtt files.")
				.meta({ examples: [1] }),
		})
		.optional()
		.describe("Statistics about archive files, by file extension."),
	statistic_by_file_status: z
		.object({
			processing_file_count: z
				.int()
				.optional()
				.describe("The number of processing files.")
				.meta({ examples: [1] }),
			completed_file_count: z
				.int()
				.optional()
				.describe("The number of completed files.")
				.meta({ examples: [1] }),
			failed_file_count: z
				.int()
				.optional()
				.describe("The number of failed files.")
				.meta({ examples: [1] }),
		})
		.optional()
		.describe("Statistics about archive files, by file status."),
});

export const getArchivedFileStatisticsStatus400Schema = z.unknown();

export const getArchivedFileStatisticsStatus429Schema = z.unknown();

export const getArchivedFileStatisticsResponseSchema = getArchivedFileStatisticsStatus200Schema;

export const getArchivedFileStatisticsErrorSchema = z.union([
	getArchivedFileStatisticsStatus400Schema,
	getArchivedFileStatisticsStatus429Schema,
]);

export const updateArchivedFilePathFileIdSchema = z
	.string()
	.describe("Archived file ID.")
	.meta({ examples: ["a5983951-044e-473f-9acd-5c398c0a8cce"] });

export const updateArchivedFileStatus204Schema = z.unknown();

export const updateArchivedFileStatus400Schema = z.unknown();

export const updateArchivedFileStatus404Schema = z.unknown();

export const updateArchivedFileStatus429Schema = z.unknown();

export const updateArchivedFileResponseSchema = updateArchivedFileStatus204Schema;

export const updateArchivedFileErrorSchema = z.union([
	updateArchivedFileStatus400Schema,
	updateArchivedFileStatus404Schema,
	updateArchivedFileStatus429Schema,
]);

export const updateArchivedFileBodySchema = z
	.object({
		auto_delete: z
			.boolean()
			.describe("Whether to auto-delete the archived file.")
			.meta({ examples: [true] }),
	})
	.optional();

export const meetingLocalArchivingArchiveTokenPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingLocalArchivingArchiveTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the archive token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The archive token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the meeting's local archive token.");

export const meetingLocalArchivingArchiveTokenStatus400Schema = z.unknown();

export const meetingLocalArchivingArchiveTokenStatus404Schema = z.unknown();

export const meetingLocalArchivingArchiveTokenStatus429Schema = z.unknown();

export const meetingLocalArchivingArchiveTokenResponseSchema =
	meetingLocalArchivingArchiveTokenStatus200Schema;

export const meetingLocalArchivingArchiveTokenErrorSchema = z.union([
	meetingLocalArchivingArchiveTokenStatus400Schema,
	meetingLocalArchivingArchiveTokenStatus404Schema,
	meetingLocalArchivingArchiveTokenStatus429Schema,
]);

export const getArchivedFilesPathMeetingUUIDSchema = z
	.string()
	.describe(
		"The meeting's universally unique identifier (UUID). Each meeting instance generates a UUID. After a meeting ends, a new UUID is generated for the next meeting instance.\n\nIf the meeting UUID begins with a `/` character or contains a `//` character, you **must** [double encode](/docs/api/using-zoom-apis/#meeting-id-and-uuid) the meeting UUID when using the meeting UUID for other API calls.",
	)
	.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] });

export const getArchivedFilesStatus200Schema = z.object({
	account_name: z
		.string()
		.describe("The user's account name.")
		.meta({ examples: ["account_01"] }),
	archive_files: z
		.array(
			z.object({
				download_url: z
					.string()
					.describe(
						"The URL to download the the archive file. \n\n **OAuth apps** \n\n If a user has authorized and installed your OAuth app that contains recording scopes, use the user's [OAuth access token](/docs/integrations/oauth/) to download the file. For example: \n\n `https://{{base-domain}}/rec/archive/download/xxx--header 'Authorization: Bearer {{OAuth-access-token}}'` \n\n **Note:** This field does **not** return for [Zoom On-Premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). Instead, this API will return the `file_path` field.",
					)
					.meta({
						examples: ["https://example.com/recording/download/Qg75t7xZBtEbAkjdlgbfdngBBBB"],
					}),
				file_extension: z
					.string()
					.describe("The archived file's extension.")
					.meta({ examples: ["JSON"] }),
				file_path: z
					.string()
					.optional()
					.describe(
						"The file path to the on-premise account archive file. \n\n **Note:** The API only returns this field for [Zoom On-Premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). It does **not** return the `download_url` field.",
					)
					.meta({ examples: ["/9090876528/path01/demo.mp4"] }),
				file_size: z
					.int()
					.describe("The archived file's size, in bytes.")
					.meta({ examples: [165743] }),
				file_type: z
					.enum([
						"MP4",
						"M4A",
						"CHAT",
						"CC",
						"CHAT_MESSAGE",
						"TRANSCRIPT",
						"SUB_GROUP_MEMBER_LOG",
						"AIC_COVERSATION",
					])
					.describe(
						"The archive file's type. \n* `MP4` - Video file. \n* `M4A` - Audio-only file. \n* `CHAT` - A TXT file containing in-meeting chat messages. \n* `CC` - A file containing the closed captions of the recording, in VTT file format. \n* `CHAT_MESSAGE` - A JSON file encoded in base64 format containing chat messages. The file also includes waiting room chats, deleted messages, meeting emojis and non-verbal feedback.  \n*  `TRANSCRIPT` - A JSON file include audio transcript wording. \n* `SUB_GROUP_MEMBER_LOG` - A JSON file containing records of members entering and leaving the subgroup. \n* `AIC_COVERSATION` - A json file include internal user archive aic content.",
					)
					.meta({ examples: ["CHAT"] }),
				id: z
					.string()
					.describe("The archive file's unique ID.")
					.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] }),
				individual: z
					.boolean()
					.describe(
						"Whether the archive file is an individual recording file. \n* `true` - An individual recording file. \n * `false` - An entire meeting file.",
					)
					.meta({ examples: [true] }),
				participant_email: z
					.email()
					.optional()
					.describe(
						"The individual recording file's participant email address. This value is returned when the `individual` value is `true`. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](/docs/api/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				participant_join_time: z.iso
					.datetime()
					.describe(
						"The join time for the generated recording file. If this value is returned when the individual value is true, then it is the recording file's participant join time. When the individual value is false, it returns the join time for the archiving gateway.",
					)
					.meta({ examples: ["2021-03-12T02:07:27Z"] }),
				participant_leave_time: z.iso
					.datetime()
					.describe(
						"The leave time for the generated recording file. If this value is returned when the individual value is true, then it is the recording file's participant leave time. When the individual value is false, it returns the leave time for the archiving gateway.",
					)
					.meta({ examples: ["2021-03-12T02:12:27Z"] }),
				recording_type: z
					.enum([
						"shared_screen_with_speaker_view",
						"audio_only",
						"chat_file",
						"closed_caption",
						"chat_message",
						"audio_transcript",
						"aic_conversation",
					])
					.describe(
						"The archive file's recording type. \n* `shared_screen_with_speaker_view` \n* `audio_only` \n* `chat_file` \n* `closed_caption` \n* `chat_message` \n* `audio_transcript` \n* `aic_conversation` \n\n For more information, read our [Managing and sharing cloud recordings](https://support.zoom.us/hc/en-us/articles/205347605-Managing-and-sharing-cloud-recordings#h_9898497b-e736-4980-a749-d55608f10773) documentation.",
					)
					.meta({ examples: ["chat_message"] }),
				status: z
					.enum(["completed", "processing", "failed"])
					.describe(
						"The archived file's processing status. \n* `completed` - The processing of the file is complete. \n* `processing` - The file is processing. \n* `failed` - The processing of the file failed.",
					)
					.meta({ examples: ["completed"] }),
				encryption_fingerprint: z
					.string()
					.describe("The archived file's encryption fingerprint, using the SHA256 hash algorithm.")
					.meta({ examples: ["abf85f0fe6a4db3cdd8c37e505e1dd18a34d9696170a14b5bc6395677472cf43"] }),
				number_of_messages: z
					.int()
					.optional()
					.describe(
						"The number of `TXT` or `JSON` file messages. This field returns only when the `file_extension` is `JSON` or `TXT`",
					)
					.meta({ examples: [150] }),
				storage_location: z
					.enum(["US", "AU", "BR", "CA", "EU", "IN", "JP", "SG", "CH"])
					.optional()
					.describe(
						"The region where the file is stored. This field returns only `Enable Distributed Compliance Archiving` op feature is enabled.",
					)
					.meta({ examples: ["US"] }),
				auto_delete: z
					.boolean()
					.optional()
					.describe(
						'Whether to auto delete the archived file.\n\n **Prerequisites:** \n\n* The "Tag Archiving Files for Deletion" feature must be enabled in OP. Contact [Zoom Support](https://support.zoom.us/hc/en-us/articles/201362003) to open.\n',
					)
					.meta({ examples: [false] }),
			}),
		)
		.describe("Information about the archive files."),
	complete_time: z
		.union([z.iso.datetime(), z.enum([""])])
		.describe("The meeting or webinar's archive completion time.")
		.meta({ examples: ["2021-03-12T02:57:27Z"] }),
	duration: z
		.int()
		.describe("The meeting or webinar's scheduled duration.")
		.meta({ examples: [1] }),
	duration_in_second: z
		.int()
		.describe("The meeting or webinar's duration, in seconds.")
		.meta({ examples: [1800] }),
	host_id: z
		.string()
		.describe("The host's user ID for the archived meeting or webinar.")
		.meta({ examples: ["Dhjdfgdkg8w"] }),
	id: z.coerce
		.bigint()
		.describe("The meeting or webinar ID, either `meetingId` or `webinarId`.")
		.meta({ examples: [553068284] }),
	is_breakout_room: z
		.boolean()
		.describe(
			"Whether the room is a [breakout room](https://support.zoom.us/hc/en-us/articles/115005769646-Participating-in-breakout-rooms).",
		)
		.meta({ examples: [false] }),
	meeting_type: z
		.enum(["internal", "external"])
		.describe(
			"Whether the meeting or webinar is internal or external. \n* `internal` - An internal meeting or webinar. \n* `external` - An external meeting or webinar. \n\n The `id`, `host_id`, and `topic` PII (Personal Identifiable Information) values in this response are removed when this value is `external`.",
		)
		.meta({ examples: ["internal"] }),
	parent_meeting_id: z
		.string()
		.optional()
		.describe(
			"The parent meeting's universally unique ID (UUID). Each meeting or webinar instance generates a UUID. If the `is_breakout_room` value is `true`, the API returns this value.",
		)
		.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] }),
	recording_count: z
		.int()
		.describe("The number of archived files returned in the API call response.")
		.meta({ examples: [2] }),
	start_time: z.iso
		.datetime()
		.describe("The meeting or webinar's start time.")
		.meta({ examples: ["2021-04-26T05:23:18Z"] }),
	timezone: z
		.string()
		.describe("The meeting or webinar's [timezone](/docs/api/references/abbreviations/#timezones).")
		.meta({ examples: ["Asia/Shanghai"] }),
	topic: z
		.string()
		.describe("The meeting or webinar topic.")
		.meta({ examples: ["My Personal Meeting Room"] }),
	total_size: z
		.int()
		.describe("The total size of the archive file, in bytes.")
		.meta({ examples: [364463] }),
	type: z
		.union([
			z.literal(1),
			z.literal(2),
			z.literal(3),
			z.literal(4),
			z.literal(5),
			z.literal(6),
			z.literal(7),
			z.literal(8),
			z.literal(9),
			z.literal(100),
		])
		.describe(
			"The type of archived meeting or webinar. \n\n If the recording is of a meeting: \n* `1` - Instant meeting. \n* `2` - Scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A meeting created via PMI (Personal Meeting ID). \n* `7` - A [Personal Audio Conference](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference) (PAC). \n* `8` - Recurring meeting with a fixed time. \n\n If the recording is of a webinar: \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time. \n* `9` - A recurring webinar with a fixed time. \n\n If the recording is **not** from a meeting or webinar: \n\n* `100` - A [breakout room](https://support.zoom.us/hc/en-us/articles/115005769646-Participating-in-breakout-rooms).",
		)
		.meta({ examples: [1] }),
	uuid: z
		.string()
		.describe(
			"The universally unique identifier (UUID) of the recorded meeting or webinar instance. Each meeting or webinar instance generates a UUID.",
		)
		.meta({ examples: ["yO3dfhh3t467UkQ=="] }),
	status: z
		.enum(["completed", "processing"])
		.describe(
			"The archive's processing status. \n* `completed` - The archive's processing is complete. \n* `processing` - The archive is processing.",
		)
		.meta({ examples: ["completed"] }),
	group_id: z
		.string()
		.optional()
		.describe(
			"Primary group IDs of participants who belong to your account. Each group ID is separated by a comma.",
		)
		.meta({ examples: ["pvFIYKSDTum9iCDOOtQL4w,_FsqLyI0RlO6LVPeUVWi8g"] }),
	physical_files: z
		.array(
			z.object({
				file_id: z
					.string()
					.optional()
					.describe("The physical file's unique ID.")
					.meta({ examples: ["pvKocCqVSMygaOcKus5Afw"] }),
				file_name: z
					.string()
					.optional()
					.describe("The physical file's name.")
					.meta({ examples: ["Screenshot 2025-02-12 at 10.42.27 AM.png"] }),
				file_size: z
					.int()
					.optional()
					.describe("The physical file's size, in bytes.")
					.meta({ examples: [540680] }),
				download_url: z
					.string()
					.optional()
					.describe(
						"The URL to download the the archive file. \n\n **OAuth apps** \n\n If a user has authorized and installed your OAuth app that contains recording scopes, use the user's [OAuth access token](/docs/integrations/oauth/) to download the file. For example: \n\n `https://{{base-domain}}/rec/archive/attached/download/xxx--header 'Authorization: Bearer {{OAuth-access-token}}'` ",
					)
					.meta({
						examples: [
							"https://local.zoom.us/rec/archive/attached/download/HBAXbHc15BXbnq0JoDu6tc5MWlww9MAo9JJq2d14VAWkpcT5FEA.AK5calud4EJB7bMq",
						],
					}),
			}),
		)
		.optional()
		.describe("Information about the physical files."),
});

export const getArchivedFilesStatus404Schema = z.unknown();

export const getArchivedFilesStatus429Schema = z.unknown();

export const getArchivedFilesResponseSchema = getArchivedFilesStatus200Schema;

export const getArchivedFilesErrorSchema = z.union([
	getArchivedFilesStatus404Schema,
	getArchivedFilesStatus429Schema,
]);

export const deleteArchivedFilesPathMeetingUUIDSchema = z
	.string()
	.describe(
		"The meeting's universally unique identifier (UUID). Each meeting instance generates a UUID. For example, after a meeting ends, a new UUID is generated for the next meeting instance.\n\nIf the meeting UUID begins with a `/` character or contains a `//` character, you **must** double-encode the meeting UUID when using the meeting UUID for other API calls.",
	)
	.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] });

export const deleteArchivedFilesStatus204Schema = z.unknown();

export const deleteArchivedFilesStatus400Schema = z.unknown();

export const deleteArchivedFilesStatus404Schema = z.unknown();

export const deleteArchivedFilesStatus429Schema = z.unknown();

export const deleteArchivedFilesResponseSchema = deleteArchivedFilesStatus204Schema;

export const deleteArchivedFilesErrorSchema = z.union([
	deleteArchivedFilesStatus400Schema,
	deleteArchivedFilesStatus404Schema,
	deleteArchivedFilesStatus429Schema,
]);

export const recordingGetPathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or UUID. If providing the meeting ID instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar's ID or UUID. If providing the webinar ID instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//` (example: `/ajXp112QmuoKj4854875==`), **[double encode](/docs/api/using-zoom-apis/#meeting-id-and-uuid) the UUID** before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingGetQueryIncludeFieldsSchema = z
	.string()
	.optional()
	.describe(
		"Include fields in the response. Currently, only accepts `download_access_token` to get this token field and value for downloading the meeting's recordings. The `download_access_token` requires **View the recording content** enabled for the role authorizing the account. Use the format `include_fields=download_access_token`.",
	)
	.meta({ examples: ["download_access_token"] });

export const recordingGetQueryTtlSchema = z
	.int()
	.min(0)
	.max(604800)
	.optional()
	.describe(
		"The `download_access_token` Time to Live (TTL) value. This parameter is only valid if the `include_fields` query parameter contains the value `download_access_token`.",
	)
	.meta({ examples: [1] });

export const recordingGetStatus200Schema = z
	.object({
		account_id: z
			.string()
			.optional()
			.describe("The user account's unique identifier.")
			.meta({ examples: ["Cx3wERazSgup7ZWRHQM8-w"] }),
		duration: z
			.int()
			.optional()
			.describe("The duration of the meeting's recording.")
			.meta({ examples: [20] }),
		host_id: z
			.string()
			.optional()
			.describe("The ID of the user set as the host of the meeting.")
			.meta({ examples: ["_0ctZtY0REqWalTmwvrdIw"] }),
		id: z
			.int()
			.optional()
			.describe("The meeting ID, also known as the meeting number.")
			.meta({ examples: [6840331990] }),
		recording_count: z
			.int()
			.optional()
			.describe(
				"The number of recording files returned in the response of this API call. This includes the `recording_files` and  `participant_audio_files` files.",
			)
			.meta({ examples: [22] }),
		start_time: z.iso
			.datetime()
			.optional()
			.describe("The time when the meeting started.")
			.meta({ examples: ["2021-03-18T05:41:36Z"] }),
		topic: z
			.string()
			.optional()
			.describe("The meeting topic.")
			.meta({ examples: ["My Personal Meeting"] }),
		total_size: z.coerce
			.bigint()
			.optional()
			.describe(
				"The recording's total file size. This includes the `recording_files` and `participant_audio_files` files.",
			)
			.meta({ examples: [22] }),
		type: z
			.union([
				z.literal("1"),
				z.literal("2"),
				z.literal("3"),
				z.literal("4"),
				z.literal("5"),
				z.literal("6"),
				z.literal("7"),
				z.literal("8"),
				z.literal("9"),
				z.literal("99"),
			])
			.optional()
			.describe(
				"The recording's associated type of meeting or webinar. \n\nIf the recording is of a meeting: \n* `1` - Instant meeting. \n* `2` - Scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A meeting created via PMI (Personal Meeting ID). \n* `7` - A [Personal Audio Conference](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060449) (PAC). \n* `8` - Recurring meeting with a fixed time. \n\nIf the recording is of a webinar: \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time \n* `9` - A recurring webinar with a fixed time.\n\nIf the recording is **not** from a meeting or webinar: \n\n* `99` - A recording uploaded via the [**Recordings**](https://zoom.us/recording) interface on the Zoom Web Portal.",
			)
			.meta({ examples: ["1"] }),
		uuid: z
			.string()
			.optional()
			.describe("The unique meeting identifier. Each instance of the meeting has its own UUID.")
			.meta({ examples: ["BOKXuumlTAGXuqwr3bLyuQ=="] }),
		recording_play_passcode: z
			.string()
			.optional()
			.describe(
				"The cloud recording's passcode to be used in the URL. Directly splice this recording's passcode in `play_url` or `share_url` with `?pwd=` to access and play. Example: 'https://zoom.us/rec/share/**************?pwd=yNYIS408EJygs7rE5vVsJwXIz4-VW7MH'.",
			)
			.meta({ examples: ["yNYIS408EJygs7rE5vVsJwXIz4-VW7MH"] }),
		auto_delete: z
			.boolean()
			.optional()
			.describe(
				"Auto-delete status of a meeting's [cloud recording](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062627).  \n\nPrerequisite: To get the auto-delete status, the host of the recording must have the recording setting **Delete cloud recordings after a specified number of days** enabled. ",
			)
			.meta({ examples: [true] }),
		auto_delete_date: z
			.string()
			.optional()
			.describe(
				"The date when the recording will be auto-deleted when `auto_delete` is true. Otherwise, no date will be returned.",
			)
			.meta({ examples: ["2028-07-12"] }),
		service_name: z
			.string()
			.optional()
			.describe("The Zoom node service's name.")
			.meta({ examples: ["recording_1"] }),
		rc_zone: z
			.string()
			.optional()
			.describe(
				"Recording zone used in the Zoom Node Platform. Only RC recordings will return this data.",
			)
			.meta({ examples: ["zone-1202"] }),
		instance_id: z
			.string()
			.optional()
			.describe(
				"The unique ID for the hybrid recorder or recording connector. Only RC and HRC recording will return this data.",
			)
			.meta({ examples: ["01fe6a07d0462b39717fa009f32541ab803e6690a4169d82a66f9a8a4da84225 "] }),
		zone_instance_id: z
			.string()
			.optional()
			.describe("Only RC and HRC recording will return this data.")
			.meta({ examples: ["9783d74dc8c606490f0a819033ea6841ea267839166f8bcbed1b33502167c457"] }),
		rc_meeting_zone_name: z
			.string()
			.optional()
			.describe("Meeting zone name. Only RC recording will return this data.")
			.meta({ examples: ["Meeting zone name"] }),
		external_storage_addr: z
			.string()
			.optional()
			.describe("NFS address.")
			.meta({ examples: ["192.163.1.2 "] }),
	})
	.extend({
		recording_files: z
			.array(
				z.object({
					deleted_time: z
						.string()
						.optional()
						.describe(
							"The time when the recording was deleted. Returned in the response only for the trash query.",
						)
						.meta({ examples: ["2021-03-18T05:41:36Z"] }),
					download_url: z
						.string()
						.optional()
						.describe(
							"The URL to download the recording. \n\nIf a user has authorized and installed your OAuth app that contains recording scopes, use the `download_access_token` or the user's [OAuth access token](/docs/integrations/oauth/) to download the file. Set the `access_token` as a Bearer token in the Authorization header. For example: \n\n`curl -H 'Authorization: Bearer <ACCESS_TOKEN>' https://{{base-domain}}/rec/archive/download/xyz`.\n\n**Note:** This field does **not** return for Zoom on-premise accounts. Instead, this API returns the `file_path` field. The URL may be a redirect. In that case, use `curl --location` to follow redirects or use another tool, like Postman.",
						)
						.meta({ examples: ["https://example.com/rec/download/Qg75t7xZBtEbAkjdlgbfdngBBBB"] }),
					file_path: z
						.string()
						.optional()
						.describe(
							"The file path to the on-premise account recording. \n\n**Note:** This API only returns this field for Zoom On-Premise accounts. It does **not** return the `download_url` field.",
						)
						.meta({ examples: ["/9090876528/path01/demo.mp4"] }),
					file_size: z
						.number()
						.optional()
						.describe("The recording file size.")
						.meta({ examples: [7220] }),
					file_type: z
						.enum([
							"MP4",
							"M4A",
							"CHAT",
							"TRANSCRIPT",
							"CSV",
							"TB",
							"CC",
							"CHAT_MESSAGE",
							"SUMMARY",
						])
						.optional()
						.describe(
							"The recording file type. \n \n`MP4` - Video file of the recording.  \n `M4A` - Audio-only file of the recording.  \n `TIMELINE` - Timestamp file of the recording in JSON file format. To get a timeline file, the **Add a timestamp to the recording** setting must be enabled in the [recording settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062627#h_3f14c3a4-d16b-4a3c-bbe5-ef7d24500048). The time will display in the host's timezone, set on their Zoom profile.\n  \n  `TRANSCRIPT` - Transcription file of the recording in VTT format.  \n  `CHAT` - A TXT file containing in-meeting chat messages that were sent during the meeting.  \n `CC` - File containing closed captions of the recording in VTT file format.  \n `CSV` - File containing polling data in csv format.\n\n  \n \n\nA recording file object with file type of either `CC` or `TIMELINE` **does not have** these properties.  \n \n\t`id`, `status`, `file_size`, `recording_type`, and `play_url`.  \n `SUMMARY` - Summary file of the recording in JSON file format.",
						)
						.meta({ examples: ["MP4"] }),
					file_extension: z
						.enum(["MP4", "M4A", "TXT", "VTT", "CSV", "JSON", "JPG"])
						.optional()
						.describe("The file extension type of the recording file.")
						.meta({ examples: ["M4A"] }),
					id: z
						.string()
						.optional()
						.describe("The recording file ID. It's included in the response of the general query.")
						.meta({ examples: ["72576a1f-4e66-4a77-87c4-f13f9808bd76"] }),
					meeting_id: z
						.string()
						.optional()
						.describe("The meeting ID. ")
						.meta({ examples: ["L0AGOEPVR9m5WSOOs/d+FQ=="] }),
					play_url: z
						.string()
						.optional()
						.describe("The URL that can play a recording file.")
						.meta({ examples: ["https://example.com/rec/play/Qg75t7xZBtEbAkjdlgbfdngBBBB"] }),
					recording_end: z
						.string()
						.optional()
						.describe("The recording end time. The response is in the general query.")
						.meta({ examples: ["2021-03-18T05:41:36Z"] }),
					recording_start: z
						.string()
						.optional()
						.describe("The recording start time.")
						.meta({ examples: ["2021-03-18T05:41:36Z"] }),
					recording_type: z
						.enum([
							"shared_screen_with_speaker_view(CC)",
							"shared_screen_with_speaker_view",
							"shared_screen_with_gallery_view",
							"active_speaker",
							"gallery_view",
							"shared_screen",
							"audio_only",
							"audio_transcript",
							"chat_file",
							"poll",
							"host_video",
							"closed_caption",
							"timeline",
							"thumbnail",
							"audio_interpretation",
							"summary",
							"summary_next_steps",
							"summary_smart_chapters",
							"sign_interpretation",
							"production_studio",
						])
						.optional()
						.describe("The recording type.")
						.meta({ examples: ["shared_screen_with_speaker_view"] }),
					status: z
						.enum(["completed"])
						.optional()
						.describe("The recording status.")
						.meta({ examples: ["completed"] }),
				}),
			)
			.optional()
			.describe("List of recording files."),
	})
	.extend({
		download_access_token: z
			.string()
			.optional()
			.describe(
				"The JWT token to download the meeting's recording. This response only returns if the `download_access_token` is included in the `include_fields` query parameter.",
			)
			.meta({
				examples: [
					"abJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczovL2V2ZW50Lnpvb20udXMiLCJhY2NvdW50SWQiOiJNdDZzdjR1MFRBeVBrd2dzTDJseGlBIiwiYXVkIjoiaHR0cHM6Ly9vYXV0aC56b29tLnVzIiwibWlkIjoieFp3SEc0c3BRU2VuekdZWG16dnpiUT09IiwiZXhwIjoxNjI2MTM5NTA3LCJ1c2VySWQiOiJEWUhyZHBqclMzdWFPZjdkUGtrZzh3In0.a6KetiC6BlkDhf1dP4KBGUE1bb2brMeraoD45yhFx0eSSSTFdkHQnsKmlJQ-hdo9Zy-4vQw3rOxlyoHv583JyZ",
				],
			}),
		password: z
			.string()
			.optional()
			.describe(
				"The cloud recording's password.\nInclude fields in the response. The password field requires the user role of the authorized account to enable the `View Recording Content` permission.",
			)
			.meta({ examples: ["981651"] }),
		recording_play_passcode: z
			.string()
			.optional()
			.describe(
				"The cloud recording's passcode to be used in the URL. Directly splice this recording's passcode in `play_url` or `share_url` with `?pwd=` to access and play. Example: 'https://zoom.us/rec/share/**************?pwd=yNYIS408EJygs7rE5vVsJwXIz4-VW7MH'.",
			)
			.meta({ examples: ["yNYIS408EJygs7rE5vVsJwXIz4-VW7MH"] }),
	})
	.extend({
		participant_audio_files: z
			.array(
				z.object({
					download_url: z
						.string()
						.optional()
						.describe(
							"The URL to download the recording. If a user has authorized and installed your OAuth app that contains recording scopes, use the user's [OAuth access token](/docs/integrations/oauth/) to download the file, and set the `access_token` as a Bearer token in the Authorization header.\n\n`curl -H 'Authorization: Bearer <ACCESS_TOKEN>' https://{{base-domain}}/rec/archive/download/xyz` \n\n**Note:** This field does **not** return for Zoom On-Premise accounts. Instead, this API will return the `file_path` field.",
						)
						.meta({ examples: ["https://example.com/rec/download/Qg75t7xZBtEbAkjdlgbfdngBBBB"] }),
					file_name: z
						.string()
						.optional()
						.describe("The recording file's name.")
						.meta({ examples: ["test.json"] }),
					file_path: z
						.string()
						.optional()
						.describe(
							"The file path to the on-premise account recording. \n\n**Note:** This API only returns this field for Zoom on-premise accounts. It does **not** return the `download_url` field.",
						)
						.meta({ examples: ["/9090876528/path01/demo.mp4"] }),
					file_size: z
						.number()
						.optional()
						.describe("The recording file's size, in bytes.")
						.meta({ examples: [65536] }),
					file_type: z
						.string()
						.optional()
						.describe(
							"The recording file's format. \n\n* `MP4` - Video file.\n* `M4A` - Audio-only file.\n* `TIMELINE` - Timestamp file of the recording, in JSON file format. To get a timeline file, the **Add a timestamp to the recording** setting **must** be enabled in the [recording settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062627#h_3f14c3a4-d16b-4a3c-bbe5-ef7d24500048). The time will display in the host's timezone.\n* `TRANSCRIPT` - A transcript of the recording, in VTT format.\n* `CHAT` - A text file containing chat messages sent during the meeting.\n* `CC` - A file containing the closed captions of the recording, in VTT file format.\n* `CSV` - A file containing polling data, in CSV format.\n\nA recording file object with file the `CC` or `TIMELINE` value **does not** have the `id`, `status`, `file_size`, `recording_type`, and `play_url` properties.",
						)
						.meta({ examples: ["M4A"] }),
					id: z
						.string()
						.optional()
						.describe(
							"The recording file's unique ID. This is included in the general query response.",
						)
						.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] }),
					play_url: z
						.string()
						.optional()
						.describe("The URL where the recording file can be opened and played.")
						.meta({ examples: ["https://example.com/rec/play/Qg75t7xZBtEbAkjdlgbfdngBBBB"] }),
					recording_end: z.iso
						.datetime()
						.optional()
						.describe(
							"The recording file's end time. This is included in the general query response.",
						)
						.meta({ examples: ["2021-06-30T22:14:57Z"] }),
					recording_start: z.iso
						.datetime()
						.optional()
						.describe("The recording file's start time.")
						.meta({ examples: ["2021-06-30T22:14:57Z"] }),
					status: z
						.enum(["completed"])
						.optional()
						.describe("The recording file's status.")
						.meta({ examples: ["completed"] }),
				}),
			)
			.optional()
			.describe(
				"A list of recording files. The API only returns this response when the **Record a separate audio file of each participant** setting is enabled.",
			),
	});

export const recordingGetStatus400Schema = z.unknown();

export const recordingGetStatus404Schema = z.unknown();

export const recordingGetStatus429Schema = z.unknown();

export const recordingGetResponseSchema = recordingGetStatus200Schema;

export const recordingGetErrorSchema = z.union([
	recordingGetStatus400Schema,
	recordingGetStatus404Schema,
	recordingGetStatus429Schema,
]);

export const recordingDeletePathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingDeleteQueryActionSchema = z
	.enum(["trash", "delete"])
	.optional()
	.default("trash")
	.describe(
		"The recording delete actions.  \n `trash` - Move recording to trash.  \n `delete` - Delete recording permanently.",
	)
	.meta({ examples: ["delete"] });

export const recordingDeleteStatus204Schema = z.unknown();

export const recordingDeleteStatus400Schema = z.unknown();

export const recordingDeleteStatus404Schema = z.unknown();

export const recordingDeleteStatus429Schema = z.unknown();

export const recordingDeleteResponseSchema = recordingDeleteStatus204Schema;

export const recordingDeleteErrorSchema = z.union([
	recordingDeleteStatus400Schema,
	recordingDeleteStatus404Schema,
	recordingDeleteStatus429Schema,
]);

export const analyticsDetailsPathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const analyticsDetailsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const analyticsDetailsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const analyticsDetailsQueryFromSchema = z.iso
	.date()
	.optional()
	.describe(
		"The start date for the monthly range to query. The maximum range can be a month. If you do not provide this value, this defaults to the current date.",
	)
	.meta({ examples: ["2020-06-30"] });

export const analyticsDetailsQueryToSchema = z.iso
	.date()
	.optional()
	.describe("The end date for the monthly range to query. The maximum range can be a month.")
	.meta({ examples: ["2020-07-30"] });

export const analyticsDetailsQueryTypeSchema = z
	.enum(["by_view", "by_download"])
	.optional()
	.describe(
		"The type of analytics details: \n* `by_view` &mdash; by_view. \n* `by_download` &mdash; by_download.",
	)
	.meta({ examples: ["by_view"] });

export const analyticsDetailsStatus200Schema = z.object({
	from: z.iso
		.date()
		.optional()
		.describe("The queried start date")
		.meta({ examples: ["2020-07-30"] }),
	to: z.iso
		.date()
		.optional()
		.describe("The queried end date.")
		.meta({ examples: ["2020-07-30"] }),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
		)
		.meta({ examples: ["R4aF9Oj0fVM2hhezJTEmSKaBSkfesDwGy42"] }),
	page_size: z
		.int()
		.max(300)
		.optional()
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [30] }),
	total_records: z
		.int()
		.optional()
		.describe("The total number of all the records available across pages.")
		.meta({ examples: [5] }),
	analytics_details: z
		.array(
			z.object({
				date_time: z.iso
					.datetime()
					.optional()
					.describe("Explicit time to watch or download the recording.")
					.meta({ examples: ["2021-07-04T22:14:57Z"] }),
				name: z
					.string()
					.optional()
					.describe("The user's name who watched or downloaded.")
					.meta({ examples: ["2"] }),
				email: z
					.string()
					.optional()
					.describe("The user's email who downloaded this Meeting Recording.")
					.meta({ examples: ["2"] }),
				duration: z
					.int()
					.optional()
					.describe(
						"When the query type is `by_view`, this field indicates the viewing time, unit: seconds",
					)
					.meta({ examples: [60] }),
			}),
		)
		.optional()
		.describe("Analytics Detail."),
});

export const analyticsDetailsStatus400Schema = z.unknown();

export const analyticsDetailsStatus404Schema = z.unknown();

export const analyticsDetailsStatus429Schema = z.unknown();

export const analyticsDetailsResponseSchema = analyticsDetailsStatus200Schema;

export const analyticsDetailsErrorSchema = z.union([
	analyticsDetailsStatus400Schema,
	analyticsDetailsStatus404Schema,
	analyticsDetailsStatus429Schema,
]);

export const analyticsSummaryPathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const analyticsSummaryQueryFromSchema = z.iso
	.date()
	.optional()
	.describe(
		"The start date for the monthly range to query. The maximum range can be a month. If you do not provide this value, this defaults to the current date.",
	)
	.meta({ examples: ["2020-06-30"] });

export const analyticsSummaryQueryToSchema = z.iso
	.date()
	.optional()
	.describe("The end date for the monthly range to query. The maximum range can be a month.")
	.meta({ examples: ["2020-07-30"] });

export const analyticsSummaryStatus200Schema = z.object({
	from: z.iso
		.date()
		.optional()
		.describe("The queried start date")
		.meta({ examples: ["2020-07-30"] }),
	to: z.iso
		.date()
		.optional()
		.describe("The queried end date.")
		.meta({ examples: ["2020-07-30"] }),
	analytics_summary: z
		.array(
			z.object({
				date: z
					.string()
					.optional()
					.describe("Date of viewing or downloading the recording.")
					.meta({ examples: ["2022-07-06"] }),
				views_total_count: z
					.int()
					.optional()
					.describe("The number of people who have watched this Meeting Recording.")
					.meta({ examples: [2] }),
				downloads_total_count: z
					.int()
					.optional()
					.describe("The number of people who downloaded this Meeting Recording.")
					.meta({ examples: [2] }),
			}),
		)
		.optional()
		.describe("Analytics Summary."),
});

export const analyticsSummaryStatus400Schema = z.unknown();

export const analyticsSummaryStatus404Schema = z.unknown();

export const analyticsSummaryStatus429Schema = z.unknown();

export const analyticsSummaryResponseSchema = analyticsSummaryStatus200Schema;

export const analyticsSummaryErrorSchema = z.union([
	analyticsSummaryStatus400Schema,
	analyticsSummaryStatus404Schema,
	analyticsSummaryStatus429Schema,
]);

export const meetingRecordingRegistrantsPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRecordingRegistrantsQueryStatusSchema = z
	.enum(["pending", "approved", "denied"])
	.optional()
	.default("approved")
	.describe(
		"Query by the registrant's status. \n* `pending` - The registration is pending. \n* `approved` - The registrant is approved. \n* `denied` - The registration is denied.",
	)
	.meta({ examples: ["pending"] });

export const meetingRecordingRegistrantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const meetingRecordingRegistrantsQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
	)
	.meta({ examples: [1] });

export const meetingRecordingRegistrantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const meetingRecordingRegistrantsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		registrants: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("The registrant's ID.")
							.meta({ examples: ["3Z7sEm0TQQieLav3c3OD_g"] }),
					})
					.extend({
						address: z
							.string()
							.optional()
							.describe("The registrant's address.")
							.meta({ examples: ["1800 Amphibious Blvd."] }),
						city: z
							.string()
							.optional()
							.describe("The registrant's city.")
							.meta({ examples: ["Mountain View"] }),
						comments: z
							.string()
							.optional()
							.describe("The registrant's questions and comments.")
							.meta({ examples: ["Looking forward to the discussion."] }),
						country: z
							.string()
							.optional()
							.describe(
								"The registrant's two-letter [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
							)
							.meta({ examples: ["US"] }),
						custom_questions: z
							.array(
								z.object({
									title: z
										.string()
										.optional()
										.describe("The custom question's title.")
										.meta({ examples: ["What do you hope to learn from this?"] }),
									value: z
										.string()
										.max(128)
										.optional()
										.describe(
											"The custom question's response value. This has a limit of 128 characters.",
										)
										.meta({
											examples: [
												"Look forward to learning how you come up with new recipes and what other services you offer.",
											],
										}),
								}),
							)
							.optional()
							.describe("Information about custom questions."),
						email: z
							.email()
							.max(128)
							.describe(
								"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						first_name: z
							.string()
							.max(64)
							.describe("The registrant's first name.")
							.meta({ examples: ["Jill"] }),
						industry: z
							.string()
							.optional()
							.describe("The registrant's industry.")
							.meta({ examples: ["Food"] }),
						job_title: z
							.string()
							.optional()
							.describe("The registrant's job title.")
							.meta({ examples: ["Chef"] }),
						last_name: z
							.string()
							.max(64)
							.optional()
							.describe("The registrant's last name.")
							.meta({ examples: ["Chill"] }),
						no_of_employees: z
							.enum([
								"",
								"1-20",
								"21-50",
								"51-100",
								"101-250",
								"251-500",
								"501-1,000",
								"1,001-5,000",
								"5,001-10,000",
								"More than 10,000",
							])
							.optional()
							.describe(
								"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
							)
							.meta({ examples: ["1-20"] }),
						org: z
							.string()
							.optional()
							.describe("The registrant's organization.")
							.meta({ examples: ["Cooking Org"] }),
						phone: z
							.string()
							.optional()
							.describe("The registrant's phone number.")
							.meta({ examples: ["5550100"] }),
						purchasing_time_frame: z
							.enum([
								"",
								"Within a month",
								"1-3 months",
								"4-6 months",
								"More than 6 months",
								"No timeframe",
							])
							.optional()
							.describe(
								"The registrant's purchasing time frame. \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
							)
							.meta({ examples: ["1-3 months"] }),
						role_in_purchase_process: z
							.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
							.optional()
							.describe(
								"The registrant's role in the purchase process. \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
							)
							.meta({ examples: ["Influencer"] }),
						state: z
							.string()
							.optional()
							.describe("The registrant's state or province.")
							.meta({ examples: ["CA"] }),
						status: z
							.enum(["approved", "denied", "pending"])
							.optional()
							.describe(
								"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
							)
							.meta({ examples: ["approved"] }),
						zip: z
							.string()
							.optional()
							.describe("The registrant's ZIP or postal code.")
							.meta({ examples: ["94045"] }),
					}),
			)
			.optional()
			.describe("Information about the cloud recording registrants."),
	})
	.describe("Information about the meeting cloud recording registrant.");

export const meetingRecordingRegistrantsStatus404Schema = z.unknown();

export const meetingRecordingRegistrantsStatus429Schema = z.unknown();

export const meetingRecordingRegistrantsResponseSchema = meetingRecordingRegistrantsStatus200Schema;

export const meetingRecordingRegistrantsErrorSchema = z.union([
	meetingRecordingRegistrantsStatus404Schema,
	meetingRecordingRegistrantsStatus429Schema,
]);

export const meetingRecordingRegistrantCreatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRecordingRegistrantCreateStatus201Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in &quot;**long**&quot; format(represented as int64 data type in JSON), also known as the meeting number.",
		)
		.meta({ examples: [6840331980] }),
	registrant_id: z
		.string()
		.optional()
		.describe("Registrant ID")
		.meta({ examples: ["3Z7sEm0TQQieLav3c3OD_g"] }),
	share_url: z
		.string()
		.optional()
		.describe(
			"Share URL for the on-demand recording. This includes the &ldquo;tk&rdquo; token for the registrant. This is similar to the token that Zoom returns in the URL response to join a registered meeting, for example: `url?tk=xxxx`. Except while the meeting registration token can be used to join the meeting, this token can only be used to watch the recording.",
		)
		.meta({ examples: ["https://example.com/rec/share/Qg75t7xZBtEbAkjdlgbfdngBBBB"] }),
	topic: z
		.string()
		.optional()
		.describe("Meeting Topic")
		.meta({ examples: ["My Personal Meeting Room"] }),
});

export const meetingRecordingRegistrantCreateStatus404Schema = z.unknown();

export const meetingRecordingRegistrantCreateStatus429Schema = z.unknown();

export const meetingRecordingRegistrantCreateResponseSchema =
	meetingRecordingRegistrantCreateStatus201Schema;

export const meetingRecordingRegistrantCreateErrorSchema = z.union([
	meetingRecordingRegistrantCreateStatus404Schema,
	meetingRecordingRegistrantCreateStatus429Schema,
]);

export const meetingRecordingRegistrantCreateBodySchema = z
	.object({
		address: z
			.string()
			.optional()
			.describe("The registrant's address.")
			.meta({ examples: ["1800 Amphibious Blvd."] }),
		city: z
			.string()
			.optional()
			.describe("The registrant's city.")
			.meta({ examples: ["Mountain View"] }),
		comments: z
			.string()
			.optional()
			.describe("The registrant's questions and comments.")
			.meta({ examples: ["Looking forward to the discussion."] }),
		country: z
			.string()
			.optional()
			.describe(
				"The registrant's two-letter [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
			)
			.meta({ examples: ["US"] }),
		custom_questions: z
			.array(
				z.object({
					title: z
						.string()
						.optional()
						.describe("The title of the custom question.")
						.meta({ examples: ["What do you hope to learn from this?"] }),
					value: z
						.string()
						.max(128)
						.optional()
						.describe("The custom question's response value. This has a limit of 128 characters.")
						.meta({
							examples: [
								"Look forward to learning how you come up with new recipes and what other services you offer.",
							],
						}),
				}),
			)
			.optional()
			.describe("Information about custom questions."),
		email: z
			.email()
			.max(128)
			.describe(
				"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
			)
			.meta({ examples: ["jchill@example.com"] }),
		first_name: z
			.string()
			.max(64)
			.describe("The registrant's first name.")
			.meta({ examples: ["Jill"] }),
		industry: z
			.string()
			.optional()
			.describe("The registrant's industry.")
			.meta({ examples: ["Food"] }),
		job_title: z
			.string()
			.optional()
			.describe("The registrant's job title.")
			.meta({ examples: ["Chef"] }),
		last_name: z
			.string()
			.max(64)
			.optional()
			.describe("The registrant's last name.")
			.meta({ examples: ["Chill"] }),
		no_of_employees: z
			.enum([
				"",
				"1-20",
				"21-50",
				"51-100",
				"101-250",
				"251-500",
				"501-1,000",
				"1,001-5,000",
				"5,001-10,000",
				"More than 10,000",
			])
			.optional()
			.describe(
				"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
			)
			.meta({ examples: ["1-20"] }),
		org: z
			.string()
			.optional()
			.describe("The registrant's organization.")
			.meta({ examples: ["Cooking Org"] }),
		phone: z
			.string()
			.optional()
			.describe("The registrant's phone number.")
			.meta({ examples: ["5550100"] }),
		purchasing_time_frame: z
			.enum([
				"",
				"Within a month",
				"1-3 months",
				"4-6 months",
				"More than 6 months",
				"No timeframe",
			])
			.optional()
			.describe(
				"The registrant's purchasing time frame. \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
			)
			.meta({ examples: ["1-3 months"] }),
		role_in_purchase_process: z
			.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
			.optional()
			.describe(
				"The registrant's role in the purchase process. \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
			)
			.meta({ examples: ["Influencer"] }),
		state: z
			.string()
			.optional()
			.describe("The registrant's state or province.")
			.meta({ examples: ["CA"] }),
		status: z
			.enum(["approved", "denied", "pending"])
			.optional()
			.describe(
				"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
			)
			.meta({ examples: ["approved"] }),
		zip: z
			.string()
			.optional()
			.describe("The registrant's ZIP or postal code.")
			.meta({ examples: ["94045"] }),
	})
	.optional()
	.describe("Registrant.");

export const recordingRegistrantsQuestionsGetPathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingRegistrantsQuestionsGetStatus200Schema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe("Answer choices for the question. Cannot be used with short answer type."),
					required: z
						.boolean()
						.optional()
						.describe("Whether registrants are required to answer custom questions or not.")
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("The question's title.")
						.meta({ examples: ["What's your name?"] }),
					type: z
						.union([z.literal("short"), z.literal("single"), z.literal("multiple")])
						.optional()
						.describe("The type of registration question and answers.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of registrant custom questions."),
		questions: z
			.array(
				z.object({
					field_name: z
						.union([
							z.literal("last_name"),
							z.literal("address"),
							z.literal("city"),
							z.literal("country"),
							z.literal("zip"),
							z.literal("state"),
							z.literal("phone"),
							z.literal("industry"),
							z.literal("org"),
							z.literal("job_title"),
							z.literal("purchasing_time_frame"),
							z.literal("role_in_purchase_process"),
							z.literal("no_of_employees"),
							z.literal("comments"),
						])
						.optional()
						.describe("Field name.")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe("Whether the field is required to be answered by the registrant or not.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of registrant questions."),
	})
	.describe("Recording tegistrant questions");

export const recordingRegistrantsQuestionsGetStatus404Schema = z.unknown();

export const recordingRegistrantsQuestionsGetStatus429Schema = z.unknown();

export const recordingRegistrantsQuestionsGetResponseSchema =
	recordingRegistrantsQuestionsGetStatus200Schema;

export const recordingRegistrantsQuestionsGetErrorSchema = z.union([
	recordingRegistrantsQuestionsGetStatus404Schema,
	recordingRegistrantsQuestionsGetStatus429Schema,
]);

export const recordingRegistrantQuestionUpdatePathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID,the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. \n\nLearn more about [enabling cloud recordings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063923) and [managing cloud recording settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065362).",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingRegistrantQuestionUpdateStatus204Schema = z.unknown();

export const recordingRegistrantQuestionUpdateStatus404Schema = z.unknown();

export const recordingRegistrantQuestionUpdateStatus429Schema = z.unknown();

export const recordingRegistrantQuestionUpdateResponseSchema =
	recordingRegistrantQuestionUpdateStatus204Schema;

export const recordingRegistrantQuestionUpdateErrorSchema = z.union([
	recordingRegistrantQuestionUpdateStatus404Schema,
	recordingRegistrantQuestionUpdateStatus429Schema,
]);

export const recordingRegistrantQuestionUpdateBodySchema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe("Answer choices for the question. Cannot be used with short answer type."),
					required: z
						.boolean()
						.optional()
						.describe("Whether registrants are required to answer custom questions or not.")
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("The question's title.")
						.meta({ examples: ["What's your name?"] }),
					type: z
						.union([z.literal("short"), z.literal("single"), z.literal("multiple")])
						.optional()
						.describe("The type of registration question and answers.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of registrant custom questions."),
		questions: z
			.array(
				z.object({
					field_name: z
						.union([
							z.literal("last_name"),
							z.literal("address"),
							z.literal("city"),
							z.literal("country"),
							z.literal("zip"),
							z.literal("state"),
							z.literal("phone"),
							z.literal("industry"),
							z.literal("org"),
							z.literal("job_title"),
							z.literal("purchasing_time_frame"),
							z.literal("role_in_purchase_process"),
							z.literal("no_of_employees"),
							z.literal("comments"),
						])
						.optional()
						.describe("Field name.")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe("Whether the field is required to be answered by the registrant or not.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of registrant questions."),
	})
	.optional()
	.describe("Recording registrant questions.");

export const meetingRecordingRegistrantStatusPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRecordingRegistrantStatusStatus204Schema = z.unknown();

export const meetingRecordingRegistrantStatusStatus404Schema = z.unknown();

export const meetingRecordingRegistrantStatusStatus429Schema = z.unknown();

export const meetingRecordingRegistrantStatusResponseSchema =
	meetingRecordingRegistrantStatusStatus204Schema;

export const meetingRecordingRegistrantStatusErrorSchema = z.union([
	meetingRecordingRegistrantStatusStatus404Schema,
	meetingRecordingRegistrantStatusStatus429Schema,
]);

export const meetingRecordingRegistrantStatusBodySchema = z
	.object({
		action: z.union([z.literal("approve"), z.literal("deny")]).meta({ examples: ["approve"] }),
		registrants: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.meta({ examples: ["3Z7sEm0TQQieLav3c3OD_g"] }),
				}),
			)
			.optional()
			.describe("List of registrants."),
	})
	.optional()
	.describe("Registrant status.");

export const recordingSettingUpdatePathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting ID lets you get cloud recording of a meeting or webinar.\n* Meeting - Provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response is for the latest meeting instance. \n\n* Webinar - Provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response is for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//` (example: `/ajXp112QmuoKj4854875==`), you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingSettingUpdateStatus200Schema = z.object({
	approval_type: z
		.union([z.literal(0), z.literal(1), z.literal(2)])
		.optional()
		.describe(
			"The registration approval type.  \n \n`0` - Automatically approve the registration when a user registers.  \n \n`1` - Manually approve or deny the registration of a user.  \n \n`2` - No registration required to view the recording.",
		)
		.meta({ examples: [0] }),
	authentication_domains: z
		.string()
		.optional()
		.describe("The domains for authentication.")
		.meta({ examples: ["example.com"] }),
	authentication_option: z
		.string()
		.optional()
		.describe("The options for authentication.")
		.meta({ examples: ["auth_option"] }),
	authentication_name: z
		.string()
		.optional()
		.describe("The name for authentication.")
		.meta({ examples: ["auth display name"] }),
	on_demand: z
		.boolean()
		.optional()
		.describe("This field determines whether registration is required to view the recording.")
		.meta({ examples: [false] }),
	password: z
		.string()
		.min(8)
		.max(10)
		.optional()
		.describe(
			"This field enables passcode protection for the recording by setting a passcode. The passcode must have a minimum of **eight** characters with a mix of numbers, letters and special characters.  \n   \n \n**Note:** If the account owner or the admin has set minimum passcode strength requirements for recordings through Account Settings, the passcode value provided here must meet those requirements.   \n   \n If the requirements are enabled, you can view those requirements by calling either the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API or the [**Get account settings**](/api-reference/zoom-api/ma#operation/accountSettings) API.",
		)
		.meta({ examples: ["975238724"] }),
	recording_authentication: z
		.boolean()
		.optional()
		.describe("Only allow authenticated users to view.")
		.meta({ examples: [true] }),
	send_email_to_host: z
		.boolean()
		.optional()
		.describe(
			"Enable sending an email to the host when someone registers to view the recording. This applies for On-demand recordings only.",
		)
		.meta({ examples: [false] }),
	share_recording: z
		.union([z.literal("publicly"), z.literal("internally"), z.literal("none")])
		.optional()
		.describe("Determine how the meeting recording is shared.")
		.meta({ examples: ["publicly"] }),
	show_social_share_buttons: z
		.boolean()
		.optional()
		.describe(
			"Show social share buttons on the registration page. This applies for On-demand recordings only.",
		)
		.meta({ examples: [true] }),
	topic: z
		.string()
		.optional()
		.describe("The recording's name.")
		.meta({ examples: ["My Personal Meeting Room"] }),
	viewer_download: z
		.boolean()
		.optional()
		.describe("Determine whether a viewer can download the recording file or not.")
		.meta({ examples: [true] }),
	auto_delete: z
		.boolean()
		.optional()
		.describe(
			'Auto-delete status of a meeting\'s [cloud recording](https://support.zoom.us/hc/en-us/articles/203741855-Cloud-Recording).  \n\nPrerequisite: To get the auto-delete status, the host of the recording must have the recording setting "Delete cloud recordings after a specified number of days" enabled. ',
		)
		.meta({ examples: [true] }),
	auto_delete_date: z
		.string()
		.optional()
		.describe(
			"The date when the recording will be auto-deleted when `auto_delete` is `true`. Otherwise, no date is returned.",
		)
		.meta({ examples: ["2028-07-12"] }),
});

export const recordingSettingUpdateStatus404Schema = z.unknown();

export const recordingSettingUpdateStatus429Schema = z.unknown();

export const recordingSettingUpdateResponseSchema = recordingSettingUpdateStatus200Schema;

export const recordingSettingUpdateErrorSchema = z.union([
	recordingSettingUpdateStatus404Schema,
	recordingSettingUpdateStatus429Schema,
]);

export const recordingSettingsUpdatePathMeetingIdSchema = z
	.string()
	.describe(
		"To get cloud recordings of a meeting, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response is for the latest meeting instance. \n\nTo get cloud recordings of a webinar, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response is for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//` (example: &quot;/ajXp112QmuoKj4854875==&quot;), you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingSettingsUpdateStatus204Schema = z.unknown();

export const recordingSettingsUpdateStatus404Schema = z.unknown();

export const recordingSettingsUpdateStatus429Schema = z.unknown();

export const recordingSettingsUpdateResponseSchema = recordingSettingsUpdateStatus204Schema;

export const recordingSettingsUpdateErrorSchema = z.union([
	recordingSettingsUpdateStatus404Schema,
	recordingSettingsUpdateStatus429Schema,
]);

export const recordingSettingsUpdateBodySchema = z
	.object({
		approval_type: z
			.union([z.literal(0), z.literal(1), z.literal(2)])
			.optional()
			.describe(
				"The approval type for the registration.  \n \n`0`- Automatically approve the registration when a user registers.  \n \n`1` - Manually approve or deny the registration of a user.  \n \n`2` - No registration required to view the recording.",
			)
			.meta({ examples: [0] }),
		authentication_domains: z
			.string()
			.optional()
			.describe("The authentication domains.")
			.meta({ examples: ["test.com"] }),
		authentication_option: z
			.string()
			.optional()
			.describe("The authentication options.")
			.meta({ examples: ["auth_option"] }),
		on_demand: z
			.boolean()
			.optional()
			.describe("Determine whether the registration is required to view the recording.")
			.meta({ examples: [false] }),
		password: z
			.string()
			.min(8)
			.max(10)
			.optional()
			.describe(
				"Enable passcode protection for the recording by setting a passcode. \n\nThe passcode must have a minimum of **eight** characters with a mix of numbers, letters and special characters.  \n   \n \n**Note:** If the account owner or the admin has set minimum passcode strength requirements for recordings through Account Settings, the passcode value provided here must meet those requirements.   \n   \n If the requirements are enabled, you can view those requirements by calling either the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API or the [**Get account settings**](/api-reference/zoom-api/ma#operation/accountSettings) API.",
			)
			.meta({ examples: ["975238724"] }),
		recording_authentication: z
			.boolean()
			.optional()
			.describe("Indicate that only authenticated users can view.")
			.meta({ examples: [true] }),
		send_email_to_host: z
			.boolean()
			.optional()
			.describe(
				"Send an email to host when someone registers to view the recording. This setting applies for On-demand recordings only.",
			)
			.meta({ examples: [false] }),
		share_recording: z
			.union([z.literal("publicly"), z.literal("internally"), z.literal("none")])
			.optional()
			.describe("Determine how the meeting recording is shared.")
			.meta({ examples: ["publicly"] }),
		show_social_share_buttons: z
			.boolean()
			.optional()
			.describe(
				"Show social share buttons on registration page. This setting applies for On-demand recordings only.",
			)
			.meta({ examples: [true] }),
		topic: z
			.string()
			.optional()
			.describe("The name of the recording.")
			.meta({ examples: ["My Personal Meeting Room"] }),
		viewer_download: z
			.boolean()
			.optional()
			.describe("Determine whether a viewer can download the recording file or not.")
			.meta({ examples: [true] }),
		auto_delete: z
			.boolean()
			.optional()
			.describe(
				'Update the auto-delete status of a meeting\'s [cloud recording](https://support.zoom.us/hc/en-us/articles/203741855-Cloud-Recording).  \n\nPrerequisite: To update the auto-delete status, the host of the recording must have the recording setting "Delete cloud recordings after a specified number of days" enabled.',
			)
			.meta({ examples: [false] }),
	})
	.optional();

export const recordingDeleteOnePathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingDeleteOnePathRecordingIdSchema = z
	.string()
	.describe("The recording ID.")
	.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] });

export const recordingDeleteOneQueryActionSchema = z
	.enum(["trash", "delete"])
	.optional()
	.default("trash")
	.describe(
		"The recording delete actions. \n `trash` - Move recording to trash.  \n `delete` - Delete recording permanently.",
	)
	.meta({ examples: ["delete"] });

export const recordingDeleteOneStatus204Schema = z.unknown();

export const recordingDeleteOneStatus400Schema = z.unknown();

export const recordingDeleteOneStatus404Schema = z.unknown();

export const recordingDeleteOneStatus429Schema = z.unknown();

export const recordingDeleteOneResponseSchema = recordingDeleteOneStatus204Schema;

export const recordingDeleteOneErrorSchema = z.union([
	recordingDeleteOneStatus400Schema,
	recordingDeleteOneStatus404Schema,
	recordingDeleteOneStatus429Schema,
]);

export const recordingStatusUpdateOnePathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's cloud recordings, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's cloud recordings, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const recordingStatusUpdateOnePathRecordingIdSchema = z
	.string()
	.describe("The recording ID.")
	.meta({ examples: ["a2f19f96-9294-4f51-8134-6f0eea108eb2"] });

export const recordingStatusUpdateOneStatus204Schema = z.unknown();

export const recordingStatusUpdateOneStatus400Schema = z.unknown();

export const recordingStatusUpdateOneStatus404Schema = z.unknown();

export const recordingStatusUpdateOneStatus429Schema = z.unknown();

export const recordingStatusUpdateOneResponseSchema = recordingStatusUpdateOneStatus204Schema;

export const recordingStatusUpdateOneErrorSchema = z.union([
	recordingStatusUpdateOneStatus400Schema,
	recordingStatusUpdateOneStatus404Schema,
	recordingStatusUpdateOneStatus429Schema,
]);

export const recordingStatusUpdateOneBodySchema = z
	.object({
		action: z
			.literal("recover")
			.optional()
			.meta({ examples: ["recover"] }),
	})
	.optional();

export const getMeetingTranscriptPathMeetingIdSchema = z
	.string()
	.describe(
		"To get a meeting's transcript, provide the meeting ID or meeting UUID. If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo get a webinar's transcript, provide the webinar ID or the webinar UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const getMeetingTranscriptStatus200Schema = z.object({
	meeting_id: z
		.string()
		.optional()
		.describe("The meeting ID")
		.meta({ examples: ["uaFkQyFCSwya8iNYtkAw3A=="] }),
	account_id: z
		.string()
		.optional()
		.describe("The user account's unique identifier.")
		.meta({ examples: ["Cx3wERazSgup7ZWRHQM8-w"] }),
	meeting_topic: z
		.string()
		.optional()
		.describe("The meeting topic.")
		.meta({ examples: ["My Personal Meeting"] }),
	host_id: z
		.string()
		.optional()
		.describe("ID of the user set as the host of the meeting.")
		.meta({ examples: ["_0ctZtY0REqWalTmwvrdIw"] }),
	transcript_created_time: z
		.string()
		.optional()
		.describe("The date and time that the meeting's transcript was created.")
		.meta({ examples: ["2025-06-27T13:48:24Z"] }),
	can_download: z
		.boolean()
		.optional()
		.describe(
			"Whether the meeting transcript is available for download.\n`true`: The transcript is ready and `download_url` will be returned.\n`false`: The transcript cannot be downloaded. and the `download_restriction_reason` field will be returned instead with the explanation.\n\nOnly when `can_download` is `true`, the transcript file can be accessed.",
		)
		.meta({ examples: [true] }),
	auto_delete: z
		.boolean()
		.optional()
		.describe(
			"Auto-delete status of a meeting's transcript\n\nPrerequisite: To get the auto-delete status, the host of the recording must have the recording setting **Delete cloud recordings after a specified number of days** enabled. ",
		)
		.meta({ examples: [true] }),
	auto_delete_date: z
		.string()
		.optional()
		.describe(
			"The date when the recording will be auto-deleted when `auto_delete` is true. Otherwise, no date will be returned.",
		)
		.meta({ examples: ["2052-11-07"] }),
	download_url: z
		.string()
		.nullish()
		.describe(
			"The URL to download the transcript. \n\nThis field is only present when `can_download` is `true`. If present, `download_restriction_reason` will not be included.\"\n\n\nIf a user has authorized and installed your OAuth app that contains recording scopes, use  the user's [OAuth access token](https://developers.zoom.us/docs/integrations/oauth/) to download the file. Set the `access_token` as a Bearer token in the Authorization header. For example: \n\n`curl -H 'Authorization: Bearer <ACCESS_TOKEN>' https://{{base-domain}}/rec/archive/download/xyz`.",
		)
		.meta({
			examples: [
				"https://example.com/rec/meeting/transcript/download/YDztop0PYLrAQat616a1q1H86RM4jf1Bf3p42a4Ap1jV3bWAJAE.jjixtQU52SEwrsuJ",
			],
		}),
	download_restriction_reason: z
		.enum(["DELETED_OR_TRASHED", "UNSUPPORTED", "NO_TRANSCRIPT_DATA", "NOT_READY"])
		.nullish()
		.describe(
			'If `can_download` is false, this field provides the reason why the transcript cannot be downloaded.\n\nThis field is only present when `can_download` is `false`. If present, `download_url` will not be included."\n\n| Value                | Description                                                                                  |\n| -------------------- | -------------------------------------------------------------------------------------------- |\n| `DELETED_OR_TRASHED` | The transcript has been deleted or moved to trash and is no longer available.                |\n| `UNSUPPORTED`        | The transcript format is not supported for download. |\n| `NO_TRANSCRIPT_DATA` | No transcript data exists for the meeting.                                                   |\n| `NOT_READY`          | The transcript is still being processed and not yet ready for download.                      |\n',
		)
		.meta({ examples: ["NOT_READY"] }),
});

export const getMeetingTranscriptStatus403Schema = z.unknown();

export const getMeetingTranscriptStatus404Schema = z.unknown();

export const getMeetingTranscriptStatus429Schema = z.unknown();

export const getMeetingTranscriptResponseSchema = getMeetingTranscriptStatus200Schema;

export const getMeetingTranscriptErrorSchema = z.union([
	getMeetingTranscriptStatus403Schema,
	getMeetingTranscriptStatus404Schema,
	getMeetingTranscriptStatus429Schema,
]);

export const deleteMeetingTranscriptPathMeetingIdSchema = z
	.string()
	.describe(
		"To delete a meeting's transcript, provide the meeting ID or meeting's unique universal identifier (UUID). If the meeting ID is provided instead of UUID, the response will be for the latest meeting instance. \n\nTo delete a webinar's transcript, provide the webinar ID or the webinar's UUID. If the webinar ID is provided instead of UUID, the response will be for the latest webinar instance. \n\nIf a UUID starts with `/` or contains `//`, like `/ajXp112QmuoKj4854875==`, you must **double encode** the UUID before making an API request. ",
	)
	.meta({ examples: ["atsXxhSEQWit9t+U02HXNQ=="] });

export const deleteMeetingTranscriptStatus204Schema = z.unknown();

export const deleteMeetingTranscriptStatus400Schema = z.unknown();

export const deleteMeetingTranscriptStatus403Schema = z.unknown();

export const deleteMeetingTranscriptStatus404Schema = z.unknown();

export const deleteMeetingTranscriptStatus429Schema = z.unknown();

export const deleteMeetingTranscriptResponseSchema = deleteMeetingTranscriptStatus204Schema;

export const deleteMeetingTranscriptErrorSchema = z.union([
	deleteMeetingTranscriptStatus400Schema,
	deleteMeetingTranscriptStatus403Schema,
	deleteMeetingTranscriptStatus404Schema,
	deleteMeetingTranscriptStatus429Schema,
]);

export const recordingStatusUpdatePathMeetingUUIDSchema = z
	.string()
	.describe(
		"The meeting's universally unique identifier (UUID). Each meeting instance generates a UUID. For example, after a meeting ends, a new UUID is generated for the next meeting instance.\n\nIf the meeting UUID begins with a `/` character or contains a `//` character, you **must** double-encode the meeting UUID when using the meeting UUID for other API calls.",
	)
	.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] });

export const recordingStatusUpdateStatus200Schema = z.unknown();

export const recordingStatusUpdateStatus400Schema = z.unknown();

export const recordingStatusUpdateStatus404Schema = z.unknown();

export const recordingStatusUpdateStatus429Schema = z.unknown();

export const recordingStatusUpdateResponseSchema = recordingStatusUpdateStatus200Schema;

export const recordingStatusUpdateErrorSchema = z.union([
	recordingStatusUpdateStatus400Schema,
	recordingStatusUpdateStatus404Schema,
	recordingStatusUpdateStatus429Schema,
]);

export const recordingStatusUpdateBodySchema = z
	.object({
		action: z
			.literal("recover")
			.optional()
			.meta({ examples: ["recover"] }),
	})
	.optional();

export const recordingsListPathUserIdSchema = z
	.string()
	.describe("The user's ID or email address. For user-level apps, pass the `me` value.");

export const recordingsListQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const recordingsListQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"The next page token paginates through a large set of results. A next page token returns whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const recordingsListQueryMcSchema = z
	.string()
	.optional()
	.default("false")
	.describe(
		"The query metadata of the recording if using an on-premise meeting connector for the meeting.",
	)
	.meta({ examples: ["false"] });

export const recordingsListQueryTrashSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe(
		"The query trash.\n* `true` - List recordings from trash.  \n* `false` - Do not list recordings from the trash.  \n\nThe default value is `false`. If you set it to `true`, you can use the `trash_type` property to indicate the type of Cloud recording that you need to retrieve. ",
	)
	.meta({ examples: [false] });

export const recordingsListQueryFromSchema = z.iso
	.date()
	.optional()
	.describe(
		"The start date in 'yyyy-mm-dd' UTC format for the date range where you would like to retrieve recordings. The maximum range can be a month. If no value is provided for this field, the default will be current date. \n\nFor example, if you make the API request on June 30, 2020, without providing the `from` and `to` parameters, by default the value of 'from' field will be `2020-06-30` and the value of the 'to' field will be `2020-07-01`. \n\n**Note**: The `trash` files cannot be filtered by date range and thus, the `from` and `to` fields should not be used for trash files.",
	)
	.meta({ examples: ["2020-06-30"] });

export const recordingsListQueryToSchema = z.iso
	.date()
	.optional()
	.describe("The end date in 'yyyy-mm-dd' 'yyyy-mm-dd' UTC format. ")
	.meta({ examples: ["2020-06-30"] });

export const recordingsListQueryTrashTypeSchema = z
	.string()
	.optional()
	.default("meeting_recordings")
	.describe(
		"The type of cloud recording to retrieve from the trash. \n \n *   `meeting_recordings`: List all meeting recordings from the trash.  \n *  `recording_file`: List all individual recording files from the trash. ",
	)
	.meta({ examples: ["meeting_recordings"] });

export const recordingsListQueryMeetingIdSchema = z
	.int()
	.optional()
	.describe("The meeting ID.")
	.meta({ examples: [6840331990] });

export const recordingsListStatus200Schema = z
	.object({
		from: z.iso
			.date()
			.optional()
			.describe("The start date.")
			.meta({ examples: ["2022-01-01"] }),
		to: z.iso
			.date()
			.optional()
			.describe("The end date.")
			.meta({ examples: ["2022-04-01"] }),
	})
	.extend({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token paginates through a large set of results. A next page token returns whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned within a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages.")
			.meta({ examples: [1] }),
	})
	.extend({
		meetings: z
			.array(
				z
					.object({
						account_id: z
							.string()
							.optional()
							.describe("Unique Identifier of the user account.")
							.meta({ examples: ["Cx3wERazSgup7ZWRHQM8-w"] }),
						duration: z
							.int()
							.optional()
							.describe("Meeting duration.")
							.meta({ examples: [20] }),
						host_id: z
							.string()
							.optional()
							.describe("ID of the user set as host of meeting.")
							.meta({ examples: ["_0ctZtY0REqWalTmwvrdIw"] }),
						id: z
							.int()
							.optional()
							.describe("Meeting ID - also known as the meeting number.")
							.meta({ examples: [6840331990] }),
						recording_count: z
							.int()
							.optional()
							.describe(
								"Number of recording files returned in the response of this API call. This includes the `recording_files` and  `participant_audio_files` files.",
							)
							.meta({ examples: [22] }),
						start_time: z.iso
							.datetime()
							.optional()
							.describe("The time when the meeting started.")
							.meta({ examples: ["2021-03-18T05:41:36Z"] }),
						topic: z
							.string()
							.optional()
							.describe("Meeting topic.")
							.meta({ examples: ["My Personal Meeting"] }),
						total_size: z.coerce
							.bigint()
							.optional()
							.describe(
								"The total file size of the recording. This includes the `recording_files` and `participant_audio_files` files.",
							)
							.meta({ examples: [22] }),
						type: z
							.union([
								z.literal("1"),
								z.literal("2"),
								z.literal("3"),
								z.literal("4"),
								z.literal("5"),
								z.literal("6"),
								z.literal("7"),
								z.literal("8"),
								z.literal("9"),
								z.literal("99"),
							])
							.optional()
							.describe(
								"The recording's associated type of meeting or webinar: \n\nIf the recording is of a meeting: \n* `1` - Instant meeting. \n* `2` - Scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A meeting created viaPersonal Meeting ID (PMI). \n* `7` - A [Personal Audio Conference](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference) (PAC). \n* `8` - Recurring meeting with a fixed time. \n\nIf the recording is of a webinar: \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time \n* `9` - A recurring webinar with a fixed time.\n\nIf the recording is **not** from a meeting or webinar: \n\n* `99` - A recording uploaded via the [**Recordings**](https://zoom.us/recording) interface on the Zoom Web Portal.",
							)
							.meta({ examples: ["1"] }),
						uuid: z
							.string()
							.optional()
							.describe(
								"Unique Meeting Identifier. Each instance of the meeting will have its own UUID.",
							)
							.meta({ examples: ["BOKXuumlTAGXuqwr3bLyuQ=="] }),
						recording_play_passcode: z
							.string()
							.optional()
							.describe(
								"The cloud recording's passcode to be used in the URL. \nInclude fields in the response. The password field requires the user role of the authorized account to enable the **View Recording Content** permission to be returned.\nThis recording's passcode can be directly spliced in `play_url` or `share_url` with `?pwd=` to access and play. For example, 'https://zoom.us/rec/share/**************?pwd=yNYIS408EJygs7rE5vVsJwXIz4-VW7MH'. If you want to use this field, please contact Zoom support.",
							)
							.meta({ examples: ["yNYIS408EJygs7rE5vVsJwXIz4-VW7MH"] }),
						auto_delete: z
							.boolean()
							.optional()
							.describe(
								"Auto-delete status of a meeting's [cloud recording](https://support.zoom.us/hc/en-us/articles/203741855-Cloud-Recording).  \n\nPrerequisite: To get the auto-delete status, the host of the recording must have the recording setting **Delete cloud recordings after a specified number of days** enabled. ",
							)
							.meta({ examples: [true] }),
						auto_delete_date: z
							.string()
							.optional()
							.describe(
								"The date when the recording will be auto-deleted when `auto_delete` is `true`. Otherwise, no date will be returned.",
							)
							.meta({ examples: ["2028-07-12"] }),
					})
					.extend({
						recording_files: z
							.array(
								z.object({
									deleted_time: z
										.string()
										.optional()
										.describe(
											"The time when recording was deleted. Returned in the response only for trash query.",
										)
										.meta({ examples: ["2021-03-18T05:41:36Z"] }),
									download_url: z
										.string()
										.optional()
										.describe(
											"The URL to download the recording. If a user has authorized and installed your OAuth app that contains recording scopes, use the `download_access_token` or the user's [OAuth access token](https://developers.zoom.us/docs/integrations/oauth/) to download the file. Set the token as a Bearer token in the Authorization header. \n\n`curl -H 'Authorization: Bearer <ACCESS_TOKEN>' https://{{base-domain}}/rec/archive/download/xyz`. \n\n**Note:** This field does **not** return for [Zoom On-Premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). Instead, this API will return the `file_path` field. The URL may be a redirect. In that case, use `curl --location` to follow redirects or use another tool, like Postman.",
										)
										.meta({
											examples: ["https://example.com/rec/download/Qg75t7xZBtEbAkjdlgbfdngBBBB"],
										}),
									file_path: z
										.string()
										.optional()
										.describe(
											"The file path to the On-Premise account recording. \n\n**Note:** This API only returns this field for [Zoom On-Premise accounts](https://support.zoom.us/hc/en-us/articles/360034064852-Zoom-On-Premise-Deployment). It does **not** return the `download_url` field.",
										)
										.meta({ examples: ["/9090876528/path01/demo.mp4"] }),
									file_size: z
										.number()
										.optional()
										.describe("The recording file size.")
										.meta({ examples: [7220] }),
									file_type: z
										.enum([
											"MP4",
											"M4A",
											"CHAT",
											"TRANSCRIPT",
											"CSV",
											"TB",
											"CC",
											"CHAT_MESSAGE",
											"SUMMARY",
										])
										.optional()
										.describe(
											"The recording file type.  \n \n`MP4` - Video file of the recording.  \n `M4A` Audio-only file of the recording.  \n `TIMELINE` - Timestamp file of the recording in JSON file format. To get a timeline file, the **Add a timestamp to the recording** setting must be enabled in the [recording settings](https://support.zoom.us/hc/en-us/articles/203741855-Cloud-recording#h_3f14c3a4-d16b-4a3c-bbe5-ef7d24500048). The time will display in the host's timezone, set on their Zoom profile.\n  \n  `TRANSCRIPT` - Transcription file of the recording in VTT format.  \n  `CHAT` - A TXT file containing in-meeting chat messages that were sent during the meeting.  \n `CC` - File containing closed captions of the recording in VTT file format.  \n `CSV` - File containing polling data in CSV format.\n\n  \n \n\nA recording file object with file type of either `CC` or `TIMELINE` **does not have** the following properties:  \n \n\t`id`, `status`, `file_size`, `recording_type`, and `play_url`.  \n `SUMMARY` - Summary file of the recording in JSON file format.",
										)
										.meta({ examples: ["MP4"] }),
									file_extension: z
										.enum(["MP4", "M4A", "TXT", "VTT", "CSV", "JSON", "JPG"])
										.optional()
										.describe("The file extension type of the recording file.")
										.meta({ examples: ["M4A"] }),
									id: z
										.string()
										.optional()
										.describe("The recording file ID. Included in the response of general query.")
										.meta({ examples: ["72576a1f-4e66-4a77-87c4-f13f9808bd76"] }),
									meeting_id: z
										.string()
										.optional()
										.describe("The meeting ID. ")
										.meta({ examples: ["L0AGOEPVR9m5WSOOs/d+FQ=="] }),
									play_url: z
										.string()
										.optional()
										.describe("The URL to play a recording file.")
										.meta({
											examples: ["https://example.com/rec/play/Qg75t7xZBtEbAkjdlgbfdngBBBB"],
										}),
									recording_end: z
										.string()
										.optional()
										.describe("The recording end time. Response in general query.")
										.meta({ examples: ["2021-03-18T05:41:36Z"] }),
									recording_start: z
										.string()
										.optional()
										.describe("The recording start time.")
										.meta({ examples: ["2021-03-18T05:41:36Z"] }),
									recording_type: z
										.enum([
											"shared_screen_with_speaker_view(CC)",
											"shared_screen_with_speaker_view",
											"shared_screen_with_gallery_view",
											"active_speaker",
											"gallery_view",
											"shared_screen",
											"audio_only",
											"audio_transcript",
											"chat_file",
											"poll",
											"host_video",
											"closed_caption",
											"timeline",
											"thumbnail",
											"audio_interpretation",
											"summary",
											"summary_next_steps",
											"summary_smart_chapters",
											"sign_interpretation",
											"production_studio",
										])
										.optional()
										.describe(
											"The recording type.  \n `shared_screen_with_speaker_view(CC)`  \n `shared_screen_with_speaker_view`  \n `shared_screen_with_gallery_view`  \n `active_speaker`  \n `gallery_view`  \n `shared_screen`  \n `audio_only`  \n `audio_transcript`  \n `chat_file`  \n `poll`  \n `timeline`  \n `closed_caption`  \n `audio_interpretation`  \n `summary`  \n `summary_next_steps`  \n `summary_smart_chapters`  \n `sign_interpretation`  \n `production_studio`",
										)
										.meta({ examples: ["shared_screen_with_speaker_view"] }),
									status: z
										.enum(["completed"])
										.optional()
										.describe("The recording status.")
										.meta({ examples: ["completed"] }),
								}),
							)
							.optional()
							.describe("List of recording file."),
					}),
			)
			.optional()
			.describe("List of recordings."),
	});

export const recordingsListStatus401Schema = z.unknown();

export const recordingsListStatus404Schema = z.unknown();

export const recordingsListStatus429Schema = z.unknown();

export const recordingsListResponseSchema = recordingsListStatus200Schema;

export const recordingsListErrorSchema = z.union([
	recordingsListStatus401Schema,
	recordingsListStatus404Schema,
	recordingsListStatus429Schema,
]);

export const listDevicesQuerySearchTextSchema = z
	.string()
	.optional()
	.describe("Filter devices by name or serial number.")
	.meta({ examples: ["poly"] });

export const listDevicesQueryPlatformOsSchema = z
	.enum(["win", "mac", "ipad", "iphone", "android", "linux"])
	.optional()
	.describe("Filter devices by platform operating system.")
	.meta({ examples: ["win"] });

export const listDevicesQueryIsEnrolledInZdmSchema = z
	.boolean()
	.optional()
	.default(true)
	.describe("Filter devices by enrollment of ZDM (Zoom Device Management).")
	.meta({ examples: [true] });

export const listDevicesQueryDeviceTypeSchema = z
	.union([
		z.literal(-1),
		z.literal(0),
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5),
		z.literal(6),
		z.literal(7),
		z.literal(8),
		z.literal(9),
	])
	.optional()
	.default(-1)
	.describe(
		"Filter devices by device type.  \n `-1` — All Zoom Room devices (0,1,2,3,4,6).  \n `0` — Zoom Rooms computer.  \n `1` — Zoom Rooms controller.  \n `2` — Zoom Rooms scheduling display.  \n `3` — Zoom Rooms control system.  \n `4` — Zoom Rooms whiteboard.  \n `5` — Zoom Phone appliance.  \n `6` — Zoom Rooms computer with controller.  \n `7` — Workspace devices.  \n `8` — Zoom clients.  \n `9` — Zoom VDI clients.",
	)
	.meta({ examples: [0] });

export const listDevicesQueryDeviceVendorSchema = z
	.string()
	.optional()
	.describe("Filter devices by vendor.")
	.meta({ examples: ["poly"] });

export const listDevicesQueryDeviceModelSchema = z
	.string()
	.optional()
	.describe("Filter devices by model.")
	.meta({ examples: ["ep5"] });

export const listDevicesQueryDeviceStatusSchema = z
	.union([z.literal(-1), z.literal(0), z.literal(1)])
	.optional()
	.default(-1)
	.describe(
		"Filter devices by status.   \n  Device Status:  \n `0` - offline.  \n `1` - online.  \n `-1` - unlink",
	)
	.meta({ examples: [0] });

export const listDevicesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listDevicesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listDevicesStatus200Schema = z.object({
	next_page_token: z
		.string()
		.optional()
		.describe(
			"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
		)
		.meta({ examples: ["At6eWnFZ1FB3arCXnRxqHLXKhbDW18yz2i2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [20] }),
	devices: z
		.array(
			z.object({
				device_id: z
					.string()
					.optional()
					.describe("Unique identifier of the device.")
					.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] }),
				device_name: z
					.string()
					.optional()
					.describe("The name of the device.")
					.meta({ examples: ["My device"] }),
				mac_address: z
					.string()
					.optional()
					.describe("The mac address of the device.")
					.meta({ examples: ["01-23-45-67-89-AB"] }),
				serial_number: z
					.string()
					.optional()
					.describe("The device's serial number.")
					.meta({ examples: ["6NRN2A0"] }),
				vendor: z
					.string()
					.optional()
					.describe("The device's manufacturer.")
					.meta({ examples: ["Poly"] }),
				model: z
					.string()
					.optional()
					.describe("The device's model.")
					.meta({ examples: ["StudioX30"] }),
				platform_os: z
					.string()
					.optional()
					.describe("The device's platform.")
					.meta({ examples: ["Epos expandvision5 1.2.22315.04"] }),
				app_version: z
					.string()
					.optional()
					.describe("App version of Zoom Rooms.")
					.meta({ examples: ["5.13.0.5762"] }),
				tag: z
					.string()
					.optional()
					.describe("The name of the tag.")
					.meta({ examples: ["personal rooms"] }),
				enrolled_in_zdm: z
					.boolean()
					.optional()
					.describe("Whether the device enrolled in ZDM (Zoom Device Management).")
					.meta({ examples: [true] }),
				connected_to_zdm: z
					.boolean()
					.optional()
					.describe("Whether the device connected to ZDM (Zoom Device Management).")
					.meta({ examples: [true] }),
				room_id: z
					.string()
					.optional()
					.describe("id of the Zoom Room.")
					.meta({ examples: ["72afdc13-a289-40c3-b358-50c8b8de"] }),
				room_name: z
					.string()
					.optional()
					.describe("Name of the Zoom Room.")
					.meta({ examples: ["My Personal Meeting Room"] }),
				device_type: z
					.union([
						z.literal(0),
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
					])
					.optional()
					.describe(
						"Filter devices by device type.  \n  Device Type:  \n `-1` - All Zoom Room device(0,1,2,3,4,6).  \n `0` - Zoom Rooms Computer.  \n `1` - Zoom Rooms Controller.  \n `2` - Zoom Rooms Scheduling Display.  \n `3` - Zoom Rooms Control System.  \n `4` -  Zoom Rooms Whiteboard.  \n `5` - Zoom Phone Appliance.  \n `6` - Zoom Rooms Computer (with Controller).",
					)
					.meta({ examples: [0] }),
				skd_version: z
					.string()
					.optional()
					.describe("The version of the SDK.")
					.meta({ examples: ["2.0.11"] }),
				device_status: z
					.union([z.literal(-1), z.literal(0), z.literal(1)])
					.optional()
					.describe(
						"Filter devices by status.   \n  Device Status:  \n `0` - offline.  \n `1` - online.  \n `-1` - unlink",
					)
					.meta({ examples: [0] }),
				last_online: z
					.string()
					.optional()
					.describe("The time when device was online last time.")
					.meta({ examples: ["2022-10-27T10:23:15Z"] }),
				user_email: z
					.string()
					.optional()
					.describe("The owner of the phone device")
					.meta({ examples: ["test-user@ya.us"] }),
			}),
		)
		.optional(),
});

export const listDevicesStatus400Schema = z.unknown();

export const listDevicesStatus429Schema = z.unknown();

export const listDevicesResponseSchema = listDevicesStatus200Schema;

export const listDevicesErrorSchema = z.union([
	listDevicesStatus400Schema,
	listDevicesStatus429Schema,
]);

export const addDeviceStatus202Schema = z.unknown();

export const addDeviceStatus400Schema = z.unknown();

export const addDeviceStatus429Schema = z.unknown();

export const addDeviceResponseSchema = addDeviceStatus202Schema;

export const addDeviceErrorSchema = z.union([addDeviceStatus400Schema, addDeviceStatus429Schema]);

export const addDeviceBodySchema = z
	.object({
		device_name: z
			.string()
			.describe("The device's name.")
			.meta({ examples: ["My device"] }),
		mac_address: z
			.string()
			.describe("The device's mac address.")
			.meta({ examples: ["01-23-45-67-89-AB"] }),
		serial_number: z
			.string()
			.describe("The device's serial number.")
			.meta({ examples: ["6NRN2A0"] }),
		vendor: z
			.string()
			.describe("The device's manufacturer.")
			.meta({ examples: ["Poly"] }),
		model: z
			.string()
			.describe("The device's model.")
			.meta({ examples: ["StudioX30"] }),
		room_id: z
			.string()
			.optional()
			.describe("The Zoom Room's ID. Only for Zoom Room devices.")
			.meta({ examples: ["72afdc13-a289-40c3-b358-50c8b8de"] }),
		user_email: z
			.string()
			.optional()
			.describe("User email for assigning the Zoom Phone device. Only for Zoom Phone devices.")
			.meta({ examples: ["test-user@ya.us"] }),
		device_type: z
			.union([z.literal(0), z.literal(1), z.literal(5)])
			.describe(
				"Device type.  \n `0` - Zoom Rooms computer.  \n `1` - Zoom Rooms controller.  \n `5` - Zoom Phone appliance.",
			)
			.meta({ examples: [0] }),
		tag: z
			.string()
			.optional()
			.describe("The name of the tag.")
			.meta({ examples: ["personal rooms"] }),
		zdm_group_id: z
			.string()
			.optional()
			.describe("The ZDM group ID.")
			.meta({ examples: ["ff49588c-92c4-4406-99e6-1942d8a61a7b"] }),
		extension_number: z
			.string()
			.optional()
			.describe("The extension number.")
			.meta({ examples: ["802"] }),
	})
	.optional();

export const getzdmgroupinfoQueryPageSizeSchema = z
	.int()
	.optional()
	.describe(
		"The total number of records returned from a single API call.\nDefault - 30.\nMax -100.",
	)
	.meta({ examples: [30] });

export const getzdmgroupinfoQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period token is 15 minutes.",
	)
	.meta({ examples: ["BJLYC6PABbAHdjwSkGVQeeR6B1juwHqj3G2"] });

export const getzdmgroupinfoStatus200Schema = z.object({
	groups: z
		.array(
			z.object({
				zdm_group_id: z
					.string()
					.optional()
					.describe("The ZDM group's unique ID.")
					.meta({ examples: ["ff49588c-92c4-4406-99e6-1942d8a61a7b"] }),
				name: z
					.string()
					.optional()
					.describe("The ZDM group's name.")
					.meta({ examples: ["HeFei-group"] }),
				description: z
					.string()
					.optional()
					.describe("The ZDM group's describe.")
					.meta({ examples: ["Group in Hefei region"] }),
			}),
		)
		.max(50)
		.optional()
		.describe("All ZDM group information under current account."),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through a large set of results. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["RaO87FrnwXvFQta5aV8sU5C3c9O8s9Nraq2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The total number of records returned from a single API call.")
		.meta({ examples: [30] }),
});

export const getzdmgroupinfoStatus400Schema = z.unknown();

export const getzdmgroupinfoStatus403Schema = z.unknown();

export const getzdmgroupinfoStatus429Schema = z.unknown();

export const getzdmgroupinfoResponseSchema = getzdmgroupinfoStatus200Schema;

export const getzdmgroupinfoErrorSchema = z.union([
	getzdmgroupinfoStatus400Schema,
	getzdmgroupinfoStatus403Schema,
	getzdmgroupinfoStatus429Schema,
]);

export const assigndevicetoauserCommonareaStatus204Schema = z.unknown();

export const assigndevicetoauserCommonareaStatus400Schema = z.unknown();

export const assigndevicetoauserCommonareaStatus429Schema = z.unknown();

export const assigndevicetoauserCommonareaResponseSchema =
	assigndevicetoauserCommonareaStatus204Schema;

export const assigndevicetoauserCommonareaErrorSchema = z.union([
	assigndevicetoauserCommonareaStatus400Schema,
	assigndevicetoauserCommonareaStatus429Schema,
]);

export const assigndevicetoauserCommonareaBodySchema = z
	.object({
		extension_number: z
			.string()
			.optional()
			.describe("The extension number.")
			.meta({ examples: ["802"] }),
		mac_address: z
			.string()
			.describe("The device's mac address.")
			.meta({ examples: ["64167ffc0ed7"] }),
		vendor: z
			.string()
			.describe("The device's manufacturer.")
			.meta({ examples: ["poly"] }),
	})
	.optional();

export const getZpaDeviceListProfileSettingOfaUserQueryUserIdSchema = z
	.string()
	.optional()
	.describe(
		"The user's ID or email address. For user-level apps, pass `me` as the value for `user_id`.",
	)
	.meta({ examples: ["DYHrdpjrS3uaOf7dPkkg8w"] });

export const getZpaDeviceListProfileSettingOfaUserStatus200Schema = z.object({
	language: z
		.string()
		.optional()
		.describe("The user's language.")
		.meta({ examples: ["English"] }),
	timezone: z
		.string()
		.optional()
		.describe("The user's timezone.")
		.meta({ examples: [" (GMT+6:00) Astana, Dhaka"] }),
	device_infos: z
		.array(
			z.object({
				device_id: z
					.string()
					.optional()
					.describe("The device ID.")
					.meta({ examples: ["yealink-249AD8E00476"] }),
				device_type: z
					.string()
					.optional()
					.describe("The device type.")
					.meta({ examples: ["Zoom Phone Appliance"] }),
				vendor: z
					.string()
					.optional()
					.describe("The device's manufacturer.")
					.meta({ examples: ["Yealink"] }),
				model: z
					.string()
					.optional()
					.describe("The device's model name.")
					.meta({ examples: ["MP56"] }),
				status: z
					.enum(["online", "offline"])
					.optional()
					.describe("The device's status, either `online` or `offline`."),
				policy: z
					.object({
						hot_desking: z
							.object({
								status: z
									.enum(["online", "offline"])
									.optional()
									.describe("The device's status, either `online` or `offline`.")
									.meta({ examples: ["online"] }),
							})
							.optional(),
						call_control: z
							.object({
								status: z
									.enum(["unsupported", "on", "off"])
									.optional()
									.describe(
										"This field lets the call control feature to the current device. Configure the desk phone devices to enable call control, which lets users perform desk phone's call control actions from the Zoom desktop client, including making and accepting calls. \n* `unsupported` \n* `on` \n* `off`",
									)
									.meta({ examples: ["off"] }),
							})
							.optional(),
					})
					.optional()
					.describe("The device policy."),
			}),
		)
		.min(0)
		.max(50)
		.optional()
		.describe("The ZPA information."),
});

export const getZpaDeviceListProfileSettingOfaUserStatus400Schema = z.unknown();

export const getZpaDeviceListProfileSettingOfaUserStatus401Schema = z.unknown();

export const getZpaDeviceListProfileSettingOfaUserStatus403Schema = z.unknown();

export const getZpaDeviceListProfileSettingOfaUserStatus429Schema = z.unknown();

export const getZpaDeviceListProfileSettingOfaUserResponseSchema =
	getZpaDeviceListProfileSettingOfaUserStatus200Schema;

export const getZpaDeviceListProfileSettingOfaUserErrorSchema = z.union([
	getZpaDeviceListProfileSettingOfaUserStatus400Schema,
	getZpaDeviceListProfileSettingOfaUserStatus401Schema,
	getZpaDeviceListProfileSettingOfaUserStatus403Schema,
	getZpaDeviceListProfileSettingOfaUserStatus429Schema,
]);

export const upgradeZpasAppStatus202Schema = z.unknown();

export const upgradeZpasAppStatus400Schema = z.unknown();

export const upgradeZpasAppStatus429Schema = z.unknown();

export const upgradeZpasAppResponseSchema = upgradeZpasAppStatus202Schema;

export const upgradeZpasAppErrorSchema = z.union([
	upgradeZpasAppStatus400Schema,
	upgradeZpasAppStatus429Schema,
]);

export const upgradeZpasAppBodySchema = z
	.object({
		zdm_group_id: z
			.string()
			.describe("The ZDM group ID.")
			.meta({ examples: ["ff49588c-92c4-4406-99e6-1942d8a61a7b"] }),
		data: z.union([
			z
				.object({
					firmware_versions: z
						.array(
							z.object({
								vendor: z
									.string()
									.optional()
									.describe("The device's manufacturer.")
									.meta({ examples: ["AudioCodes"] }),
								version: z
									.string()
									.optional()
									.describe("The firmware version.")
									.meta({ examples: ["1.19.552"] }),
								model: z
									.string()
									.optional()
									.describe("The device's model name. Maximum of 64 characters.")
									.meta({ examples: ["C470HD"] }),
							}),
						)
						.optional(),
					upgrade_type: z
						.enum(["UPGRADE_FIRMWARE"])
						.default("UPGRADE_FIRMWARE")
						.describe("Upgrade firmware.")
						.meta({ examples: ["UPGRADE_FIRMWARE"] }),
				})
				.strict(),
			z
				.object({
					app_version: z
						.string()
						.optional()
						.describe(
							"The app version to be upgraded. If upgrade type is `0`, this field won't work. If upgrade type is `1`, this field will work.",
						)
						.meta({ examples: ["5.16.5.3920"] }),
					upgrade_type: z
						.enum(["UPGRADE_APP"])
						.describe("Upgrade app.")
						.meta({ examples: ["UPGRADE_APP"] }),
				})
				.strict(),
		]),
	})
	.optional();

export const deleteZpaDeviceByVendorAndMacAddressPathVendorSchema = z
	.string()
	.describe("The device's manufacturer.")
	.meta({ examples: ["Poly"] });

export const deleteZpaDeviceByVendorAndMacAddressPathMacAddressSchema = z
	.string()
	.describe("The device's mac address.")
	.meta({ examples: ["64167ffc0ed7"] });

export const deleteZpaDeviceByVendorAndMacAddressStatus204Schema = z.unknown();

export const deleteZpaDeviceByVendorAndMacAddressStatus400Schema = z.unknown();

export const deleteZpaDeviceByVendorAndMacAddressStatus404Schema = z.unknown();

export const deleteZpaDeviceByVendorAndMacAddressStatus429Schema = z.unknown();

export const deleteZpaDeviceByVendorAndMacAddressResponseSchema =
	deleteZpaDeviceByVendorAndMacAddressStatus204Schema;

export const deleteZpaDeviceByVendorAndMacAddressErrorSchema = z.union([
	deleteZpaDeviceByVendorAndMacAddressStatus400Schema,
	deleteZpaDeviceByVendorAndMacAddressStatus404Schema,
	deleteZpaDeviceByVendorAndMacAddressStatus429Schema,
]);

export const getZpaVersioninfoPathZdmGroupIdSchema = z
	.string()
	.describe("The Zoom Device Management (ZDM) group ID.")
	.meta({ examples: ["ff49588c-92c4-4406-99e6-1942d8a61a7b"] });

export const getZpaVersioninfoStatus200Schema = z
	.object({
		firmware_versions: z
			.array(
				z.object({
					vendor: z
						.string()
						.optional()
						.describe("The device's manufacturer.")
						.meta({ examples: ["AudioCodes"] }),
					model: z
						.string()
						.optional()
						.describe("The device's model name.")
						.meta({ examples: ["C470HD"] }),
					version: z
						.string()
						.optional()
						.describe("The package version.")
						.meta({ examples: ["1.19.552"] }),
					warn_info: z
						.string()
						.optional()
						.describe("The prompt information for this version.")
						.meta({
							examples: [
								"You are about to perform an Android operating system upgrade. The change is permanent and cannot be reversed.",
							],
						}),
				}),
			)
			.max(3)
			.optional()
			.describe("List of firmware that can be upgraded."),
		app_versions: z
			.array(z.string())
			.max(3)
			.optional()
			.describe("List of app versions that can be upgraded."),
	})
	.describe("Information about the version list.");

export const getZpaVersioninfoStatus400Schema = z.unknown();

export const getZpaVersioninfoStatus404Schema = z.unknown();

export const getZpaVersioninfoStatus429Schema = z.unknown();

export const getZpaVersioninfoResponseSchema = getZpaVersioninfoStatus200Schema;

export const getZpaVersioninfoErrorSchema = z.union([
	getZpaVersioninfoStatus400Schema,
	getZpaVersioninfoStatus404Schema,
	getZpaVersioninfoStatus429Schema,
]);

export const getDevicePathDeviceIdSchema = z
	.string()
	.describe("The device's unique identifier.")
	.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] });

export const getDeviceStatus200Schema = z
	.object({
		device_id: z
			.string()
			.optional()
			.describe("The device's unique identifier.")
			.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] }),
		device_name: z
			.string()
			.optional()
			.describe("The name of the device.")
			.meta({ examples: ["My device"] }),
		mac_address: z
			.string()
			.optional()
			.describe("The device's MAC address.")
			.meta({ examples: ["01-23-45-67-89-AB"] }),
		serial_number: z
			.string()
			.optional()
			.describe("The device's serial number.")
			.meta({ examples: ["6NRN2A0"] }),
		vendor: z
			.string()
			.optional()
			.describe("The device's manufacturer.")
			.meta({ examples: ["Poly"] }),
		model: z
			.string()
			.optional()
			.describe("The device's model.")
			.meta({ examples: ["StudioX30"] }),
		platform_os: z
			.string()
			.optional()
			.describe("The device's platform.")
			.meta({ examples: ["Epos expandvision5 1.2.22315.04"] }),
		app_version: z
			.string()
			.optional()
			.describe("App version of Zoom Rooms.")
			.meta({ examples: ["5.13.0.5762"] }),
		tag: z
			.string()
			.optional()
			.describe("The tag's name.")
			.meta({ examples: ["personal rooms"] }),
		enrolled_in_zdm: z
			.boolean()
			.optional()
			.describe("Whether the device is enrolled in ZDM (Zoom Device Management).")
			.meta({ examples: [true] }),
		connected_to_zdm: z
			.boolean()
			.optional()
			.describe("Whether the device is connected to ZDM (Zoom Device Management).")
			.meta({ examples: [true] }),
		room_id: z
			.string()
			.optional()
			.describe("The Zoom Room's ID.")
			.meta({ examples: ["72afdc13-a289-40c3-b358-50c8b8de"] }),
		room_name: z
			.string()
			.optional()
			.describe("The Zoom Room's name.")
			.meta({ examples: ["My Personal Meeting Room"] }),
		device_type: z
			.union([
				z.literal(0),
				z.literal(1),
				z.literal(2),
				z.literal(3),
				z.literal(4),
				z.literal(5),
				z.literal(6),
			])
			.optional()
			.describe(
				"Filter devices by device type.  \nDevice Type:  \n `-1` - All Zoom Room device(0,1,2,3,4,6).  \n `0` - Zoom Rooms Computer.  \n `1` - Zoom Rooms Controller.  \n `2` - Zoom Rooms Scheduling Display.  \n `3` - Zoom Rooms Control System.  \n `4` - Zoom Rooms Whiteboard.  \n `5` - Zoom Phone Appliance.  \n `6` - Zoom Rooms Computer (with Controller).",
			)
			.meta({ examples: [0] }),
		sdk_version: z
			.string()
			.optional()
			.describe("The SDK version.")
			.meta({ examples: ["2.0.11"] }),
		device_status: z
			.union([z.literal(-1), z.literal(0), z.literal(1)])
			.optional()
			.describe(
				"Filter devices by status.  \n Device Status:  \n `0` - offline.  \n `1` - online.  \n `-1` - unlink",
			)
			.meta({ examples: [0] }),
		last_online: z
			.string()
			.optional()
			.describe("The time when the device was last online.")
			.meta({ examples: ["2022-10-27T10:23:15Z"] }),
		user_email: z
			.string()
			.optional()
			.describe("The phone device's owner.")
			.meta({ examples: ["test-user@ya.us"] }),
	})
	.describe("Information about the device.");

export const getDeviceStatus400Schema = z.unknown();

export const getDeviceStatus404Schema = z.unknown();

export const getDeviceStatus429Schema = z.unknown();

export const getDeviceResponseSchema = getDeviceStatus200Schema;

export const getDeviceErrorSchema = z.union([
	getDeviceStatus400Schema,
	getDeviceStatus404Schema,
	getDeviceStatus429Schema,
]);

export const deleteDevicePathDeviceIdSchema = z
	.string()
	.describe("Unique identifier of the device.")
	.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] });

export const deleteDeviceStatus204Schema = z.unknown();

export const deleteDeviceStatus400Schema = z.unknown();

export const deleteDeviceStatus404Schema = z.unknown();

export const deleteDeviceStatus429Schema = z.unknown();

export const deleteDeviceResponseSchema = deleteDeviceStatus204Schema;

export const deleteDeviceErrorSchema = z.union([
	deleteDeviceStatus400Schema,
	deleteDeviceStatus404Schema,
	deleteDeviceStatus429Schema,
]);

export const updateDevicePathDeviceIdSchema = z
	.string()
	.describe("Unique identifier of the device.")
	.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] });

export const updateDeviceStatus204Schema = z.unknown();

export const updateDeviceStatus400Schema = z.unknown();

export const updateDeviceStatus404Schema = z.unknown();

export const updateDeviceStatus429Schema = z.unknown();

export const updateDeviceResponseSchema = updateDeviceStatus204Schema;

export const updateDeviceErrorSchema = z.union([
	updateDeviceStatus400Schema,
	updateDeviceStatus404Schema,
	updateDeviceStatus429Schema,
]);

export const updateDeviceBodySchema = z
	.object({
		device_name: z
			.string()
			.describe("The name of the device.")
			.meta({ examples: ["My device"] }),
		tag: z
			.string()
			.optional()
			.describe("The name of the tag.")
			.meta({ examples: ["personal rooms"] }),
		room_id: z
			.string()
			.optional()
			.describe("id of the Zoom Room.")
			.meta({ examples: ["72afdc13-a289-40c3-b358-50c8b8de"] }),
		device_type: z
			.union([z.literal(0), z.literal(1), z.literal(3)])
			.optional()
			.describe(
				"Device Type:  \n `0` - Zoom Rooms Computer.  \n `1` - Zoom Rooms Controller.  \n `2` - Zoom Rooms Scheduling Display.",
			)
			.meta({ examples: [1] }),
	})
	.optional();

export const assginGroupPathDeviceIdSchema = z
	.string()
	.describe("The device ID.")
	.meta({ examples: ["12as-asdas-sas-12asd-as01"] });

export const assginGroupQueryGroupIdSchema = z
	.string()
	.describe("The group's ID.")
	.meta({ examples: ["12as-asdas-sas-12asd-as01"] });

export const assginGroupStatus204Schema = z.unknown();

export const assginGroupStatus400Schema = z.unknown();

export const assginGroupStatus401Schema = z.unknown();

export const assginGroupStatus404Schema = z.unknown();

export const assginGroupStatus429Schema = z.unknown();

export const assginGroupResponseSchema = assginGroupStatus204Schema;

export const assginGroupErrorSchema = z.union([
	assginGroupStatus400Schema,
	assginGroupStatus401Schema,
	assginGroupStatus404Schema,
	assginGroupStatus429Schema,
]);

export const changeDeviceAssociationPathDeviceIdSchema = z
	.string()
	.describe("The device's unique identifier.")
	.meta({ examples: ["F1C6E9DF-429E-4FA1-85DA-AC95464F3D18"] });

export const changeDeviceAssociationStatus204Schema = z.unknown();

export const changeDeviceAssociationStatus400Schema = z.unknown();

export const changeDeviceAssociationStatus404Schema = z.unknown();

export const changeDeviceAssociationStatus429Schema = z.unknown();

export const changeDeviceAssociationResponseSchema = changeDeviceAssociationStatus204Schema;

export const changeDeviceAssociationErrorSchema = z.union([
	changeDeviceAssociationStatus400Schema,
	changeDeviceAssociationStatus404Schema,
	changeDeviceAssociationStatus429Schema,
]);

export const changeDeviceAssociationBodySchema = z
	.object({
		room_id: z
			.string()
			.optional()
			.describe(
				"The Zoom Room ID of the device being associated to. The `room_id` is required. It can be ` ` or the specific room ID. If it is ` ` , it means release from the room. If the room ID is a specific value, assign that room to the device .",
			)
			.meta({ examples: ["qMOLddnySIGGVycz8aX_JQ"] }),
		app_type: z
			.enum(["ZR", "ZRC", "ZRP", "ZRW"])
			.optional()
			.default("ZR")
			.describe(
				"Specify one of these values for this field.\n\n`ZR` - Zoom Room computer.  \n \n`ZRC` - Zoom Room controller.  \n \n`ZRP` - Scheduling display.  \n \n`ZRW` - Companion whiteboard.",
			)
			.meta({ examples: ["ZR"] }),
	})
	.optional();

export const deviceListQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const deviceListQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
	)
	.meta({ examples: [1] });

export const deviceListQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const deviceListStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		devices: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("Device ID.")
							.meta({ examples: ["abceHewahkrehwiK"] }),
					})
					.extend({
						encryption: z
							.union([z.literal("auto"), z.literal("yes"), z.literal("no")])
							.describe("Device encryption:  \n `auto` - auto.  \n `yes` - yes.  \n `no` - no.")
							.meta({ examples: ["auto"] }),
						ip: z
							.string()
							.describe("Device IP.")
							.meta({ examples: ["127.0.0.1"] }),
						name: z
							.string()
							.max(64)
							.describe("Device name.")
							.meta({ examples: ["api_test_20190508"] }),
						protocol: z
							.union([z.literal("H.323"), z.literal("SIP")])
							.describe("Device protocol:  \n `H.323` - H.323.  \n `SIP` - SIP.")
							.meta({ examples: ["H.323"] }),
					}),
			)
			.optional()
			.describe("List of H.323/SIP Device objects."),
	})
	.describe("List of H.323/SIP Devices.");

export const deviceListStatus400Schema = z.unknown();

export const deviceListStatus401Schema = z.unknown();

export const deviceListStatus403Schema = z.unknown();

export const deviceListStatus429Schema = z.unknown();

export const deviceListResponseSchema = deviceListStatus200Schema;

export const deviceListErrorSchema = z.union([
	deviceListStatus400Schema,
	deviceListStatus401Schema,
	deviceListStatus403Schema,
	deviceListStatus429Schema,
]);

export const deviceCreateStatus201Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("Device ID.")
			.meta({ examples: ["abceHewahkrehwiK"] }),
	})
	.extend({
		encryption: z
			.union([z.literal("auto"), z.literal("yes"), z.literal("no")])
			.describe("Device encryption:  \n `auto` - auto.  \n `yes` - yes.  \n `no` - no.")
			.meta({ examples: ["auto"] }),
		ip: z
			.string()
			.describe("Device IP.")
			.meta({ examples: ["127.0.0.1"] }),
		name: z
			.string()
			.max(64)
			.describe("Device name.")
			.meta({ examples: ["api_test_20190508"] }),
		protocol: z
			.union([z.literal("H.323"), z.literal("SIP")])
			.describe("Device protocol:  \n `H.323` - H.323.  \n `SIP` - SIP.")
			.meta({ examples: ["H.323"] }),
	});

export const deviceCreateStatus400Schema = z.unknown();

export const deviceCreateStatus401Schema = z.unknown();

export const deviceCreateStatus403Schema = z.unknown();

export const deviceCreateStatus404Schema = z.unknown();

export const deviceCreateStatus429Schema = z.unknown();

export const deviceCreateResponseSchema = deviceCreateStatus201Schema;

export const deviceCreateErrorSchema = z.union([
	deviceCreateStatus400Schema,
	deviceCreateStatus401Schema,
	deviceCreateStatus403Schema,
	deviceCreateStatus404Schema,
	deviceCreateStatus429Schema,
]);

export const deviceCreateBodySchema = z
	.object({
		encryption: z
			.union([z.literal("auto"), z.literal("yes"), z.literal("no")])
			.describe("Device encryption:  \n `auto` - auto.  \n `yes` - yes.  \n `no` - no.")
			.meta({ examples: ["auto"] }),
		ip: z
			.string()
			.describe("Device IP.")
			.meta({ examples: ["127.0.0.1"] }),
		name: z
			.string()
			.max(64)
			.describe("Device name.")
			.meta({ examples: ["api_test_20190508"] }),
		protocol: z
			.union([z.literal("H.323"), z.literal("SIP")])
			.describe("Device protocol:  \n `H.323` - H.323.  \n `SIP` - SIP.")
			.meta({ examples: ["H.323"] }),
	})
	.optional()
	.describe("H.323/SIP device.");

export const deviceDeletePathDeviceIdSchema = z
	.string()
	.describe("The device ID.")
	.meta({ examples: ["abceHewahkrehwiK"] });

export const deviceDeleteStatus200Schema = z.unknown();

export const deviceDeleteStatus400Schema = z.unknown();

export const deviceDeleteStatus401Schema = z.unknown();

export const deviceDeleteStatus403Schema = z.unknown();

export const deviceDeleteStatus404Schema = z.unknown();

export const deviceDeleteStatus429Schema = z.unknown();

export const deviceDeleteResponseSchema = deviceDeleteStatus200Schema;

export const deviceDeleteErrorSchema = z.union([
	deviceDeleteStatus400Schema,
	deviceDeleteStatus401Schema,
	deviceDeleteStatus403Schema,
	deviceDeleteStatus404Schema,
	deviceDeleteStatus429Schema,
]);

export const deviceUpdatePathDeviceIdSchema = z
	.string()
	.describe("The device ID.")
	.meta({ examples: ["abceHewahkrehwiK"] });

export const deviceUpdateStatus204Schema = z.unknown();

export const deviceUpdateStatus400Schema = z.unknown();

export const deviceUpdateStatus401Schema = z.unknown();

export const deviceUpdateStatus403Schema = z.unknown();

export const deviceUpdateStatus404Schema = z.unknown();

export const deviceUpdateStatus429Schema = z.unknown();

export const deviceUpdateResponseSchema = deviceUpdateStatus204Schema;

export const deviceUpdateErrorSchema = z.union([
	deviceUpdateStatus400Schema,
	deviceUpdateStatus401Schema,
	deviceUpdateStatus403Schema,
	deviceUpdateStatus404Schema,
	deviceUpdateStatus429Schema,
]);

export const deviceUpdateBodySchema = z
	.object({
		encryption: z
			.union([z.literal("auto"), z.literal("yes"), z.literal("no")])
			.describe("Device encryption:  \n `auto` - auto.  \n `yes` - yes.  \n `no` - no.")
			.meta({ examples: ["auto"] }),
		ip: z
			.string()
			.describe("Device IP.")
			.meta({ examples: ["127.0.0.1"] }),
		name: z
			.string()
			.max(64)
			.describe("Device name.")
			.meta({ examples: ["api_test_20190508"] }),
		protocol: z
			.union([z.literal("H.323"), z.literal("SIP")])
			.describe("Device protocol.  \n `H.323` - H.323.  \n `SIP` - SIP.")
			.meta({ examples: ["H.323"] }),
	})
	.optional()
	.describe("The H.323/SIP device object.");

export const meetingAppAddPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingAppAddStatus201Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in **long** format(represented as int64 data type in JSON), also known as the meeting number.",
		)
		.meta({ examples: [92674392836] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe(
			"For scheduled meetings only. Meeting start date-time in UTC/GMT, such as `2020-03-31T12:02:00Z`.",
		)
		.meta({ examples: ["2022-03-25T07:29:29Z"] }),
	app_id: z
		.string()
		.optional()
		.describe("The app's ID.")
		.meta({ examples: ["fdgsfh2ey82fuh"] }),
});

export const meetingAppAddStatus400Schema = z.unknown();

export const meetingAppAddStatus404Schema = z.unknown();

export const meetingAppAddStatus429Schema = z.unknown();

export const meetingAppAddResponseSchema = meetingAppAddStatus201Schema;

export const meetingAppAddErrorSchema = z.union([
	meetingAppAddStatus400Schema,
	meetingAppAddStatus404Schema,
	meetingAppAddStatus429Schema,
]);

export const meetingAppDeletePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingAppDeleteStatus204Schema = z.unknown();

export const meetingAppDeleteStatus400Schema = z.unknown();

export const meetingAppDeleteStatus404Schema = z.unknown();

export const meetingAppDeleteStatus429Schema = z.unknown();

export const meetingAppDeleteResponseSchema = meetingAppDeleteStatus204Schema;

export const meetingAppDeleteErrorSchema = z.union([
	meetingAppDeleteStatus400Schema,
	meetingAppDeleteStatus404Schema,
	meetingAppDeleteStatus429Schema,
]);

export const deleteMeetingChatMessageByIdPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long-format integer and **not** an integer. Meeting IDs can be more than 10 digits.",
	)
	.meta({ examples: [85746065] });

export const deleteMeetingChatMessageByIdPathMessageIdSchema = z
	.string()
	.describe("The live meeting chat message's unique identifier (UUID), in base64-encoded format.")
	.meta({ examples: ["MS17MDQ5NjE4QjYtRjk4Ny00REEwLUFBQUItMTg3QTY0RjU2MzhFfQ=="] });

export const deleteMeetingChatMessageByIdQueryFileIdsSchema = z
	.string()
	.optional()
	.describe(
		"The live webinar chat file's universally unique identifier, in base64-encoded format. Separate multiple values with commas.",
	)
	.meta({
		examples: [
			"MS17RDk0QTY3QUQtQkFGQy04QTJFLTI2RUEtNkYxQjRBRTU1MTk5fQ==,MS17NDQ0OEU5MjMtM0JFOS1CMDA1LTQ0NDAtQjdGOTU0Rjk5MTkyfQ==",
		],
	});

export const deleteMeetingChatMessageByIdStatus204Schema = z.unknown();

export const deleteMeetingChatMessageByIdStatus400Schema = z.unknown();

export const deleteMeetingChatMessageByIdStatus404Schema = z.unknown();

export const deleteMeetingChatMessageByIdStatus429Schema = z.unknown();

export const deleteMeetingChatMessageByIdResponseSchema =
	deleteMeetingChatMessageByIdStatus204Schema;

export const deleteMeetingChatMessageByIdErrorSchema = z.union([
	deleteMeetingChatMessageByIdStatus400Schema,
	deleteMeetingChatMessageByIdStatus404Schema,
	deleteMeetingChatMessageByIdStatus429Schema,
]);

export const updateMeetingChatMessageByIdPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long-format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const updateMeetingChatMessageByIdPathMessageIdSchema = z
	.string()
	.describe("The live meeting chat message's unique identifier (UUID), in base64-encoded format.")
	.meta({ examples: ["MS17MDQ5NjE4QjYtRjk4Ny00REEwLUFBQUItMTg3QTY0RjU2MzhFfQ=="] });

export const updateMeetingChatMessageByIdStatus204Schema = z.unknown();

export const updateMeetingChatMessageByIdStatus400Schema = z.unknown();

export const updateMeetingChatMessageByIdStatus404Schema = z.unknown();

export const updateMeetingChatMessageByIdStatus429Schema = z.unknown();

export const updateMeetingChatMessageByIdResponseSchema =
	updateMeetingChatMessageByIdStatus204Schema;

export const updateMeetingChatMessageByIdErrorSchema = z.union([
	updateMeetingChatMessageByIdStatus400Schema,
	updateMeetingChatMessageByIdStatus404Schema,
	updateMeetingChatMessageByIdStatus429Schema,
]);

export const updateMeetingChatMessageByIdBodySchema = z
	.object({
		message_content: z
			.string()
			.describe("The content of the chat message.")
			.meta({ examples: ["This is a test message"] }),
	})
	.optional();

export const inMeetingControlPathMeetingIdSchema = z
	.string()
	.describe("The live meeting's ID.")
	.meta({ examples: ["93398114182"] });

export const inMeetingControlStatus202Schema = z.unknown();

export const inMeetingControlStatus400Schema = z.unknown();

export const inMeetingControlStatus403Schema = z.unknown();

export const inMeetingControlStatus404Schema = z.unknown();

export const inMeetingControlStatus429Schema = z.unknown();

export const inMeetingControlResponseSchema = inMeetingControlStatus202Schema;

export const inMeetingControlErrorSchema = z.union([
	inMeetingControlStatus400Schema,
	inMeetingControlStatus403Schema,
	inMeetingControlStatus404Schema,
	inMeetingControlStatus429Schema,
]);

export const inMeetingControlBodySchema = z
	.object({
		method: z
			.enum([
				"recording.start",
				"recording.stop",
				"recording.pause",
				"recording.resume",
				"participant.invite",
				"participant.invite.callout",
				"participant.invite.room_system_callout",
				"waiting_room.update",
				"ai_companion.start",
				"ai_companion.stop",
				"ai_companion.disable",
				"participant.remove",
			])
			.optional()
			.describe(
				"The method that you would like to control. The value of this field can be one of the following:\n\n* `recording.start` - Start the recording.\n* `recording.stop` - Stop the recording.\n* `recording.pause` - Pause the recording.\n* `recording.resume` - Resume a paused recording.\n* `participant.invite` - Invite a participant to the meeting.\n* `participant.invite.callout` - Invite a participant to the meeting through [call out (phone)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062038).\n* `participant.invite.room_system_callout` - Invite a participant to the meeting through [call out (room system)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065721).\n* `waiting_room.update` - Update the waiting room with a custom message.\n* `ai_companion.start` - Start the AI Companion.\n* `ai_companion.stop` - Stop the AI Companion.\n* `ai_companion.disable` - Disable the AI Companion.\n\nContact [Developer Support](https://developers.zoom.us/support/) to enable the following moderation features:\n\n* `participant.remove` - Remove a participant from the meeting.\n",
			)
			.meta({ examples: ["recording.start"] }),
		params: z
			.object({
				contacts: z
					.array(
						z.object({
							email: z
								.string()
								.optional()
								.describe(
									"The user's email address. Use this value if you do not have the user's ID. \n\nIf you pass the `id` value, the API ignores this query parameter.",
								)
								.meta({ examples: ["jchill@example.com"] }),
							id: z
								.string()
								.optional()
								.describe("The user's ID.")
								.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
						}),
					)
					.optional()
					.describe(
						"The user's email address or the user ID, up to a maximum of 10 contacts. The account must be a part of the meeting host's account.",
					),
				invitee_name: z
					.string()
					.optional()
					.describe(
						"The user's name to display in the meeting. Use this field if you pass the `participant.invite.callout` value for the `method` field.",
					)
					.meta({ examples: ["Jill Chill"] }),
				phone_number: z
					.string()
					.optional()
					.describe(
						"The user's phone number. Use this field if you pass the `participant.invite.callout` value for the `method` field. As a best practice, ensure this includes a country code and area code.\r\n\r\nIf you are dialing a phone number that includes an extension, type a hyphen '-' after the phone number and enter the extension. For example, 6032331333-156 dials the extension 156.",
					)
					.meta({ examples: ["5550100"] }),
				invite_options: z
					.object({
						require_greeting: z
							.boolean()
							.optional()
							.default(true)
							.describe(
								"Whether to require a greeting before being connected. Use this field if you pass the `participant.invite.callout` value for the `method` field.",
							)
							.meta({ examples: [true] }),
						require_pressing_one: z
							.boolean()
							.optional()
							.default(true)
							.describe(
								"Whether to require pressing 1 before being connected. Use this field if you pass the `participant.invite.callout` value for the `method` field.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe("Information about the `participant.invite.callout` settings."),
				call_type: z
					.string()
					.optional()
					.describe(
						"The type of call out. Use a value of `h323` or `sip`. Use this field if you pass the `participant.invite.room_system_callout` value for the `method` field.",
					)
					.meta({ examples: ["h323"] }),
				device_ip: z
					.string()
					.optional()
					.describe(
						"The user's device IP address or URI. Use this field if you pass the `participant.invite.room_system_callout` value for the `method` field.",
					)
					.meta({ examples: ["10.100.111.237"] }),
				h323_headers: z
					.object({
						from_display_name: z
							.string()
							.max(64)
							.optional()
							.describe("Custom name that will be used within the h323 Header.")
							.meta({ examples: ["display name"] }),
						to_display_name: z
							.string()
							.max(64)
							.optional()
							.describe("Custom remote name that will be used within the meeting.")
							.meta({ examples: ["display name"] }),
					})
					.optional()
					.describe(
						"Enable customers to leverage services that require customization of the FROM header to identify the caller. Use this field if you pass the `participant.invite.room_system_callout` value for the `method` field and the `h323` value for the `call_type` field.",
					),
				sip_headers: z
					.object({
						from_display_name: z
							.string()
							.max(64)
							.optional()
							.describe("Custom name that will be used within the SIP Header.")
							.meta({ examples: ["display name"] }),
						to_display_name: z
							.string()
							.max(64)
							.optional()
							.describe("Custom remote name that will be used within the meeting.")
							.meta({ examples: ["display name"] }),
						from_uri: z
							.string()
							.max(256)
							.optional()
							.describe(
								"Custom URI that will be used within the SIP Header. The URI must start with 'sip:' or 'sips:' as a valid URI based on parameters defined by the platform.",
							)
							.meta({ examples: ["sip:username@domain.company.org"] }),
						additional_headers: z
							.array(
								z.object({
									key: z
										.string()
										.max(32)
										.optional()
										.describe("Additional custom SIP header's key.")
										.meta({ examples: ["X-Header1"] }),
									value: z
										.string()
										.max(256)
										.optional()
										.describe("Additional custom SIP header's value.")
										.meta({ examples: ["X-body1"] }),
								}),
							)
							.optional()
							.describe(
								"Ability to add 1 to 10 custom headers, each of which has a maximum length of 256 bytes to comply with SIP standards.  Custom headers would leverage header names starting with 'X-' per SIP guidelines.",
							),
					})
					.optional()
					.describe(
						"Enable customers to leverage services that require customization of the FROM header to identify the caller. Use this field if you pass the `participant.invite.room_system_callout` value for the `method` field and the `sip` value for the `call_type` field.",
					),
				participant_uuid: z
					.string()
					.optional()
					.describe(
						"The participant's UUID. This value is assigned to a participant upon joining a meeting and is only valid for the duration of the meeting. Use this field if you pass the `participant.remove` value for the `method` field.",
					)
					.meta({ examples: ["D444CD06-2ABB-2FCC-019B-39E41D8DADF7"] }),
				waiting_room_title: z
					.string()
					.optional()
					.describe(
						"The title displayed in the waiting room. Use this field if you pass the `waiting_room.update` value for the `method` field.",
					)
					.meta({ examples: ["waiting room title"] }),
				waiting_room_description: z
					.string()
					.optional()
					.describe(
						"The description shown in the waiting room. Use this field if you pass the `waiting_room.update` value for the `method` field.",
					)
					.meta({ examples: ["waiting room description"] }),
				ai_companion_mode: z
					.enum(["questions", "summary", "all"])
					.optional()
					.default("all")
					.describe(
						"Which AI Companion mode to start or stop. Use this field if you pass the `ai_companion.start` or `ai_companion.stop` value for the `method` field.\n* `questions` — The AI Companion for answering questions.\n* `summary` — The AI Companion for generating meeting summaries.\n* `all` — Both modes.\n\nIf this field is not provided, `all` is used by default.",
					)
					.meta({ examples: ["questions"] }),
				retain_meeting_transcript: z
					.boolean()
					.optional()
					.describe(
						"Whether to retain the meeting transcript when starting or stopping the AI Companion meeting summary.\n\nThis field applies only when both of these conditions are met:\n\n* The `method` is `ai_companion.start` or `ai_companion.stop`.\n* The `ai_companion_mode` is `summary` or `all`.\n\n**Note:** This field only takes effect when the account-level setting **Allow users to retain transcripts generated by meeting summary for use by other AI Companion services** is enabled. If this account-level setting is disabled, this field has no effect.\n\nIf this field is not provided, the behavior follows the user-level setting **Start meeting transcript**.",
					)
					.meta({ examples: [true] }),
				delete_meeting_assets: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to delete all meeting assets - such as transcripts and summaries - when stopping the AI Companion. Use this field only if you pass the `ai_companion.stop` value for the `method` field **and** the `ai_companion_mode` field is set to `all`.",
					)
					.meta({ examples: [false] }),
			})
			.optional()
			.describe("The in-meeting parameters."),
	})
	.optional();

export const meetingLocalRecordingJoinTokenPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingLocalRecordingJoinTokenQueryBypassWaitingRoomSchema = z
	.boolean()
	.optional()
	.describe("Whether to bypass the waiting room.")
	.meta({ examples: [true] });

export const meetingLocalRecordingJoinTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the join token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The join token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the meeting's local recorder join token.");

export const meetingLocalRecordingJoinTokenStatus400Schema = z.unknown();

export const meetingLocalRecordingJoinTokenStatus404Schema = z.unknown();

export const meetingLocalRecordingJoinTokenStatus429Schema = z.unknown();

export const meetingLocalRecordingJoinTokenResponseSchema =
	meetingLocalRecordingJoinTokenStatus200Schema;

export const meetingLocalRecordingJoinTokenErrorSchema = z.union([
	meetingLocalRecordingJoinTokenStatus400Schema,
	meetingLocalRecordingJoinTokenStatus404Schema,
	meetingLocalRecordingJoinTokenStatus429Schema,
]);

export const meetingTokenPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingTokenQueryTypeSchema = z
	.enum(["closed_caption_token"])
	.optional()
	.default("closed_caption_token")
	.describe(
		"The meeting token type. \n* `closed_caption_token` - The third-party closed caption API token. \n\nThis defaults to `closed_caption_token`.",
	)
	.meta({ examples: ["closed_caption_token"] });

export const meetingTokenStatus200Schema = z
	.object({
		token: z
			.string()
			.optional()
			.describe("The generated meeting token.")
			.meta({
				examples: [
					"https://example.com/closedcaption?id=200610693&ns=GZHkEA==&expire=86400&spparams=id%2Cns%2Cexpire&signature=nYtXJqRKCW",
				],
			}),
	})
	.describe("Information about the meeting token.");

export const meetingTokenStatus400Schema = z.unknown();

export const meetingTokenStatus404Schema = z.unknown();

export const meetingTokenStatus429Schema = z.unknown();

export const meetingTokenResponseSchema = meetingTokenStatus200Schema;

export const meetingTokenErrorSchema = z.union([
	meetingTokenStatus400Schema,
	meetingTokenStatus404Schema,
	meetingTokenStatus429Schema,
]);

export const addBatchRegistrantsPathMeetingIdSchema = z
	.string()
	.describe("Unique identifier of the meeting (Meeting Number).")
	.meta({ examples: ["91498058927"] });

export const addBatchRegistrantsStatus201Schema = z.object({
	registrants: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe("Email address of the registrant.")
					.meta({ examples: ["jchill@example.com"] }),
				join_url: z
					.string()
					.optional()
					.describe("Unique URL using which registrant can join the meeting.")
					.meta({ examples: ["https://example.com/j/11111"] }),
				registrant_id: z
					.string()
					.optional()
					.describe("Unique identifier of the registrant.")
					.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
				participant_pin_code: z.coerce
					.bigint()
					.optional()
					.describe(
						"The participant PIN code is used to authenticate audio participants before they join the meeting.",
					)
					.meta({ examples: [380303] }),
			}),
		)
		.optional(),
});

export const addBatchRegistrantsStatus400Schema = z.unknown();

export const addBatchRegistrantsStatus404Schema = z.unknown();

export const addBatchRegistrantsStatus429Schema = z.unknown();

export const addBatchRegistrantsResponseSchema = addBatchRegistrantsStatus201Schema;

export const addBatchRegistrantsErrorSchema = z.union([
	addBatchRegistrantsStatus400Schema,
	addBatchRegistrantsStatus404Schema,
	addBatchRegistrantsStatus429Schema,
]);

export const addBatchRegistrantsBodySchema = z
	.object({
		auto_approve: z
			.boolean()
			.optional()
			.describe(
				"If a meeting was scheduled with approval_type `1` (manual approval), but you would like to automatically approve the registrants that are added via this API, you can set the value of this field to `true`. \n\nYou **cannot** use this field to change approval setting for a meeting  that was originally scheduled with approval_type `0` (automatic approval).",
			)
			.meta({ examples: [true] }),
		registrants_confirmation_email: z
			.boolean()
			.optional()
			.describe("Send confirmation Email to Registrants")
			.meta({ examples: [true] }),
		registrants: z
			.array(
				z.object({
					email: z
						.email()
						.describe("Email address of the registrant.")
						.meta({ examples: ["jchill@example.com"] }),
					first_name: z
						.string()
						.describe("First name of the registrant.")
						.meta({ examples: ["Jill"] }),
					last_name: z
						.string()
						.optional()
						.describe("Last name of the registrant.")
						.meta({ examples: ["Chill"] }),
				}),
			)
			.optional(),
	})
	.optional();

export const meetingInvitationPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer, not a simple integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingInvitationStatus200Schema = z
	.object({
		invitation: z
			.string()
			.optional()
			.describe("Meeting invitation.")
			.meta({
				examples: [
					"Jill Chill is inviting you to a scheduled Zoom meeting.\r\n\r\nTopic: My Meeting\r\nTime: Mar 25, 2022 03:32 PM America, Los_Angeles\r\n\r\nJoin Zoom Meeting\r\nhttps://zoom.us/j/55544443210?pwd=8pEkRweVXPV3Ob2KJYgFTRlDtl1gSn.1\r\n\r\nMeeting ID: 555 4444 3210\r\nPasscode: 123456\r\nOne tap mobile\r\n+5678901234,,55544443210#,,,,*123456# US (gg)\r\n\r\nDial by your location\r\n+1 15550100 US (gg)\r\nMeeting ID: 555 4444 3210\r\nPasscode: 123456\r\nFind your local number: https://zoom.us/u/ab12cdef34jh\r\n\r\nJoin by SIP\r\n5550100@zoomcrc.com\r\n\r\nJoin by H.323\r\n192.0.2.1 (US West)\r\nMeeting ID: 555 4444 3210\r\nPasscode: 123456\r\n\r\n",
				],
			}),
		sip_links: z.array(z.string()).optional().describe("A list of SIP phone addresses."),
	})
	.describe("Meeting invitation details.");

export const meetingInvitationStatus400Schema = z.unknown();

export const meetingInvitationStatus404Schema = z.unknown();

export const meetingInvitationStatus429Schema = z.unknown();

export const meetingInvitationResponseSchema = meetingInvitationStatus200Schema;

export const meetingInvitationErrorSchema = z.union([
	meetingInvitationStatus400Schema,
	meetingInvitationStatus404Schema,
	meetingInvitationStatus429Schema,
]);

export const meetingInviteLinksCreatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingInviteLinksCreateStatus201Schema = z
	.object({
		attendees: z
			.array(
				z.object({
					join_url: z
						.string()
						.optional()
						.describe("The URL to join the meeting.")
						.meta({ examples: ["https://example.com/j/11111"] }),
					name: z
						.string()
						.optional()
						.describe("The user's display name.")
						.meta({ examples: ["Jill Chill"] }),
				}),
			)
			.min(1)
			.max(500)
			.optional()
			.describe("The attendee list."),
	})
	.describe("Invite links response.");

export const meetingInviteLinksCreateStatus400Schema = z.unknown();

export const meetingInviteLinksCreateStatus404Schema = z.unknown();

export const meetingInviteLinksCreateStatus429Schema = z.unknown();

export const meetingInviteLinksCreateResponseSchema = meetingInviteLinksCreateStatus201Schema;

export const meetingInviteLinksCreateErrorSchema = z.union([
	meetingInviteLinksCreateStatus400Schema,
	meetingInviteLinksCreateStatus404Schema,
	meetingInviteLinksCreateStatus429Schema,
]);

export const meetingInviteLinksCreateBodySchema = z
	.object({
		attendees: z
			.array(
				z.object({
					name: z
						.string()
						.max(64)
						.describe("User display name.")
						.meta({ examples: ["Jill Chill"] }),
					disable_video: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to disable participant video when joining the meeting. If not provided or set to `false`, the participant video will follow the meeting's default settings.",
						)
						.meta({ examples: [false] }),
					disable_audio: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to disable participant audio when joining the meeting. If not provided or set to `false`, the participant audio will follow the meeting's default settings.",
						)
						.meta({ examples: [false] }),
				}),
			)
			.min(1)
			.max(500)
			.optional()
			.describe("The attendees list."),
		ttl: z.coerce
			.bigint()
			.optional()
			.default(BigInt(7200))
			.describe("The invite link's expiration time, in seconds. \n\nThis value defaults to `7200`.")
			.meta({ examples: [1000] }),
	})
	.optional()
	.describe("Invite links.");

export const meetingRegistrantsPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long format integer, not an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantsQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const meetingRegistrantsQueryStatusSchema = z
	.enum(["pending", "approved", "denied"])
	.optional()
	.default("approved")
	.describe(
		"Query by the registrant's status. \n* `pending` - The registration is pending. \n* `approved` - The registrant is approved. \n* `denied` - The registration is denied.",
	)
	.meta({ examples: ["pending"] });

export const meetingRegistrantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const meetingRegistrantsQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
	)
	.meta({ examples: [1] });

export const meetingRegistrantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const meetingRegistrantsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		registrants: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("Registrant ID.")
							.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
					})
					.extend({
						address: z
							.string()
							.optional()
							.describe("The registrant's address.")
							.meta({ examples: ["1800 Amphibious Blvd."] }),
						city: z
							.string()
							.optional()
							.describe("The registrant's city.")
							.meta({ examples: ["Mountain View"] }),
						comments: z
							.string()
							.optional()
							.describe("The registrant's questions and comments.")
							.meta({ examples: ["Looking forward to the discussion."] }),
						country: z
							.string()
							.optional()
							.describe(
								"The registrant's two-letter [country code](/docs/api/rest/other-references/abbreviation-lists/#countries).",
							)
							.meta({ examples: ["US"] }),
						custom_questions: z
							.array(
								z.object({
									title: z
										.string()
										.optional()
										.describe("The title of the custom question.")
										.meta({ examples: ["What do you hope to learn from this?"] }),
									value: z
										.string()
										.max(128)
										.optional()
										.describe(
											"The custom question's response value. This has a limit of 128 characters.",
										)
										.meta({
											examples: [
												"Look forward to learning how you come up with new recipes and what other services you offer.",
											],
										}),
								}),
							)
							.optional()
							.describe("Information about custom questions."),
						email: z
							.email()
							.max(128)
							.describe(
								"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						first_name: z
							.string()
							.max(64)
							.describe("The registrant's first name.")
							.meta({ examples: ["Jill"] }),
						industry: z
							.string()
							.optional()
							.describe("The registrant's industry.")
							.meta({ examples: ["Food"] }),
						job_title: z
							.string()
							.optional()
							.describe("The registrant's job title.")
							.meta({ examples: ["Chef"] }),
						last_name: z
							.string()
							.max(64)
							.optional()
							.describe("The registrant's last name.")
							.meta({ examples: ["Chill"] }),
						no_of_employees: z
							.enum([
								"",
								"1-20",
								"21-50",
								"51-100",
								"101-250",
								"251-500",
								"501-1,000",
								"1,001-5,000",
								"5,001-10,000",
								"More than 10,000",
							])
							.optional()
							.describe(
								"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
							)
							.meta({ examples: ["1-20"] }),
						org: z
							.string()
							.optional()
							.describe("The registrant's organization.")
							.meta({ examples: ["Cooking Org"] }),
						phone: z
							.string()
							.optional()
							.describe("The registrant's phone number.")
							.meta({ examples: ["5550100"] }),
						purchasing_time_frame: z
							.enum([
								"",
								"Within a month",
								"1-3 months",
								"4-6 months",
								"More than 6 months",
								"No timeframe",
							])
							.optional()
							.describe(
								"The registrant's purchasing time frame. \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
							)
							.meta({ examples: ["1-3 months"] }),
						role_in_purchase_process: z
							.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
							.optional()
							.describe(
								"The registrant's role in the purchase process. \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
							)
							.meta({ examples: ["Influencer"] }),
						state: z
							.string()
							.optional()
							.describe("The registrant's state or province.")
							.meta({ examples: ["CA"] }),
						status: z
							.enum(["approved", "denied", "pending"])
							.optional()
							.describe(
								"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
							)
							.meta({ examples: ["approved"] }),
						zip: z
							.string()
							.optional()
							.describe("The registrant's ZIP or postal code.")
							.meta({ examples: ["94045"] }),
					})
					.extend({
						create_time: z.iso
							.datetime()
							.optional()
							.describe("The time when the registrant registered.")
							.meta({ examples: ["2022-03-22T05:59:09Z"] }),
						join_url: z
							.string()
							.optional()
							.describe(
								"The URL that an approved registrant can use to join the meeting or webinar.",
							)
							.meta({ examples: ["https://example.com/j/11111"] }),
						status: z
							.string()
							.optional()
							.describe(
								"The status of the registrant's registration.   \n  `approved` - User has been successfully approved for the webinar.  \n  `pending` - The registration is still pending.  \n  `denied` - User has been denied from joining the webinar.",
							)
							.meta({ examples: ["approved"] }),
						participant_pin_code: z.coerce
							.bigint()
							.optional()
							.describe(
								"The participant PIN code is used to authenticate audio participants before they join the meeting.",
							)
							.meta({ examples: [380303] }),
					}),
			)
			.optional()
			.describe("List of registrant objects."),
	})
	.describe("List of users.");

export const meetingRegistrantsStatus400Schema = z.unknown();

export const meetingRegistrantsStatus404Schema = z.unknown();

export const meetingRegistrantsStatus429Schema = z.unknown();

export const meetingRegistrantsResponseSchema = meetingRegistrantsStatus200Schema;

export const meetingRegistrantsErrorSchema = z.union([
	meetingRegistrantsStatus400Schema,
	meetingRegistrantsStatus404Schema,
	meetingRegistrantsStatus429Schema,
]);

export const meetingRegistrantCreatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantCreateQueryOccurrenceIdsSchema = z
	.string()
	.optional()
	.describe(
		"A comma-separated list of meeting occurrence IDs. You can get this value with the [Get a meeting](/docs/api-reference/zoom-api/methods#operation/meeting) API.",
	)
	.meta({ examples: ["1648194360000,1648367160000"] });

export const meetingRegistrantCreateStatus201Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe("The meeting ID.")
		.meta({ examples: [85746065] }),
	join_url: z
		.string()
		.optional()
		.describe(
			"The URL the registrant can use to join the meeting. \n\nThe API will not return this field if the meeting was [created](/docs/api-reference/zoom-api/methods#operation/meetingCreate) with the `approval_type` field value of `1` (manual approval).",
		)
		.meta({ examples: ["https://example.com/j/11111"] }),
	registrant_id: z
		.string()
		.optional()
		.describe("The registrant's ID.")
		.meta({ examples: ["fdgsfh2ey82fuh"] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start time.")
		.meta({ examples: ["2021-07-13T21:44:51Z"] }),
	topic: z
		.string()
		.max(200)
		.optional()
		.describe("The meeting's topic.")
		.meta({ examples: ["My Meeting"] }),
	occurrences: z
		.array(
			z.object({
				duration: z
					.int()
					.optional()
					.describe("Duration.")
					.meta({ examples: [60] }),
				occurrence_id: z
					.string()
					.optional()
					.describe(
						"Occurrence ID: Unique Identifier that identifies an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences.",
					)
					.meta({ examples: ["1648194360000"] }),
				start_time: z.iso
					.datetime()
					.optional()
					.describe("Start time.")
					.meta({ examples: ["2022-03-25T07:46:00Z"] }),
				status: z
					.string()
					.optional()
					.describe("Occurrence status.")
					.meta({ examples: ["available"] }),
			}),
		)
		.optional()
		.describe("Array of occurrence objects."),
	participant_pin_code: z.coerce
		.bigint()
		.optional()
		.describe(
			"The participant PIN code is used to authenticate audio participants before they join the meeting.",
		)
		.meta({ examples: [380303] }),
});

export const meetingRegistrantCreateStatus400Schema = z.unknown();

export const meetingRegistrantCreateStatus404Schema = z.unknown();

export const meetingRegistrantCreateStatus429Schema = z.unknown();

export const meetingRegistrantCreateResponseSchema = meetingRegistrantCreateStatus201Schema;

export const meetingRegistrantCreateErrorSchema = z.union([
	meetingRegistrantCreateStatus400Schema,
	meetingRegistrantCreateStatus404Schema,
	meetingRegistrantCreateStatus429Schema,
]);

export const meetingRegistrantCreateBodySchema = z
	.object({
		first_name: z
			.string()
			.max(64)
			.describe("The registrant's first name.")
			.meta({ examples: ["Jill"] }),
		last_name: z
			.string()
			.max(64)
			.optional()
			.describe("The registrant's last name.")
			.meta({ examples: ["Chill"] }),
		email: z
			.email()
			.max(128)
			.describe("The registrant's email address.")
			.meta({ examples: ["jchill@example.com"] }),
		address: z
			.string()
			.optional()
			.describe("The registrant's address.")
			.meta({ examples: ["1800 Amphibious Blvd."] }),
		city: z
			.string()
			.optional()
			.describe("The registrant's city.")
			.meta({ examples: ["Mountain View"] }),
		state: z
			.string()
			.optional()
			.describe("The registrant's state or province.")
			.meta({ examples: ["CA"] }),
		zip: z
			.string()
			.optional()
			.describe("The registrant's ZIP or postal code.")
			.meta({ examples: ["94045"] }),
		country: z
			.string()
			.optional()
			.describe(
				"The registrant's two-letter [country code](https://marketplace.zoom.us/docs/api-reference/other-references/abbreviation-lists#countries).",
			)
			.meta({ examples: ["US"] }),
		phone: z
			.string()
			.optional()
			.describe("The registrant's phone number.")
			.meta({ examples: ["5550100"] }),
		comments: z
			.string()
			.optional()
			.describe("The registrant's questions and comments.")
			.meta({ examples: ["Looking forward to the discussion."] }),
		custom_questions: z
			.array(
				z.object({
					title: z
						.string()
						.optional()
						.describe("The title of the custom question.")
						.meta({ examples: ["What do you hope to learn from this?"] }),
					value: z
						.string()
						.max(128)
						.optional()
						.describe("The custom question's response value. This has a limit of 128 characters.")
						.meta({
							examples: [
								"Look forward to learning how you come up with new recipes and what other services you offer.",
							],
						}),
				}),
			)
			.optional()
			.describe("Information about custom questions."),
		industry: z
			.string()
			.optional()
			.describe("The registrant's industry.")
			.meta({ examples: ["Food"] }),
		job_title: z
			.string()
			.optional()
			.describe("The registrant's job title.")
			.meta({ examples: ["Chef"] }),
		no_of_employees: z
			.enum([
				"",
				"1-20",
				"21-50",
				"51-100",
				"101-500",
				"500-1,000",
				"1,001-5,000",
				"5,001-10,000",
				"More than 10,000",
			])
			.optional()
			.describe(
				"The registrant's number of employees: \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-500` \n* `500-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
			)
			.meta({ examples: ["1-20"] }),
		org: z
			.string()
			.optional()
			.describe("The registrant's organization.")
			.meta({ examples: ["Cooking Org"] }),
		purchasing_time_frame: z
			.enum([
				"",
				"Within a month",
				"1-3 months",
				"4-6 months",
				"More than 6 months",
				"No timeframe",
			])
			.optional()
			.describe(
				"The registrant's purchasing time frame: \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
			)
			.meta({ examples: ["1-3 months"] }),
		role_in_purchase_process: z
			.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
			.optional()
			.describe(
				"The registrant's role in the purchase process: \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
			)
			.meta({ examples: ["Influencer"] }),
	})
	.extend({
		language: z
			.enum([
				"en-US",
				"de-DE",
				"es-ES",
				"fr-FR",
				"jp-JP",
				"pt-PT",
				"ru-RU",
				"zh-CN",
				"zh-TW",
				"ko-KO",
				"it-IT",
				"vi-VN",
				"pl-PL",
				"Tr-TR",
			])
			.optional()
			.describe(
				"The registrant's language preference for confirmation emails: \n* `en-US` &mdash; English (US) \n* `de-DE` &mdash; German (Germany) \n* `es-ES` &mdash; Spanish (Spain) \n* `fr-FR` &mdash; French (France) \n* `jp-JP` &mdash; Japanese \n* `pt-PT` &mdash; Portuguese (Portugal) \n* `ru-RU` &mdash; Russian \n* `zh-CN` &mdash; Chinese (PRC) \n* `zh-TW` &mdash; Chinese (Taiwan) \n* `ko-KO` &mdash; Korean \n* `it-IT` &mdash; Italian (Italy) \n* `vi-VN` &mdash; Vietnamese \n* `pl-PL` &mdash; Polish \n* `Tr-TR` &mdash; Turkish",
			)
			.meta({ examples: ["en-US"] }),
	})
	.extend({
		auto_approve: z
			.boolean()
			.optional()
			.describe(
				"If a meeting was scheduled with the `approval_type` field value of `1` (manual approval) but you want to automatically approve meeting registrants, set the value of this field to `true`. \n\n**Note:** You cannot use this field to change approval setting for a meeting originally scheduled with the `approval_type` field value of `0` (automatic approval).",
			)
			.meta({ examples: [true] }),
	})
	.optional()
	.describe("Information about the meeting registrant.");

export const meetingRegistrantsQuestionsGetPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long format integer, not a simple integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantsQuestionsGetStatus200Schema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe(
							"Answer choices for the question. Can not be used for `short` question type as this type of question requires registrants to type out the answer.",
						),
					required: z
						.boolean()
						.optional()
						.describe(
							"Whether or not the custom question is required to be answered by participants or not.",
						)
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("Title of the custom question.")
						.meta({ examples: ["How are you?"] }),
					type: z
						.union([z.literal("short"), z.literal("single")])
						.optional()
						.describe("Type of the question being asked.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of custom questions for registrants."),
		questions: z
			.array(
				z.object({
					field_name: z
						.enum([
							"last_name",
							"address",
							"city",
							"country",
							"zip",
							"state",
							"phone",
							"industry",
							"org",
							"job_title",
							"purchasing_time_frame",
							"role_in_purchase_process",
							"no_of_employees",
							"comments",
						])
						.optional()
						.describe("Field name of the question.")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe(
							"Whether or not the displayed fields are required to be filled out by registrants.",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of registrant questions."),
	})
	.describe("Meeting registrant questions.");

export const meetingRegistrantsQuestionsGetStatus400Schema = z.unknown();

export const meetingRegistrantsQuestionsGetStatus404Schema = z.unknown();

export const meetingRegistrantsQuestionsGetStatus429Schema = z.unknown();

export const meetingRegistrantsQuestionsGetResponseSchema =
	meetingRegistrantsQuestionsGetStatus200Schema;

export const meetingRegistrantsQuestionsGetErrorSchema = z.union([
	meetingRegistrantsQuestionsGetStatus400Schema,
	meetingRegistrantsQuestionsGetStatus404Schema,
	meetingRegistrantsQuestionsGetStatus429Schema,
]);

export const meetingRegistrantQuestionUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantQuestionUpdateStatus204Schema = z.unknown();

export const meetingRegistrantQuestionUpdateStatus400Schema = z.unknown();

export const meetingRegistrantQuestionUpdateStatus404Schema = z.unknown();

export const meetingRegistrantQuestionUpdateStatus429Schema = z.unknown();

export const meetingRegistrantQuestionUpdateResponseSchema =
	meetingRegistrantQuestionUpdateStatus204Schema;

export const meetingRegistrantQuestionUpdateErrorSchema = z.union([
	meetingRegistrantQuestionUpdateStatus400Schema,
	meetingRegistrantQuestionUpdateStatus404Schema,
	meetingRegistrantQuestionUpdateStatus429Schema,
]);

export const meetingRegistrantQuestionUpdateBodySchema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe(
							"Answer choices for the question. Can not be used for `short` question type as this type of question requires registrants to type out the answer.",
						),
					required: z
						.boolean()
						.optional()
						.describe(
							"Indicates whether or not the custom question is required to be answered by participants or not.",
						)
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("Title of the custom question.")
						.meta({ examples: ["How are you?"] }),
					type: z
						.union([z.literal("short"), z.literal("single")])
						.optional()
						.describe("The type of question being asked.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of Registrant Custom Questions"),
		questions: z
			.array(
				z.object({
					field_name: z
						.enum([
							"last_name",
							"address",
							"city",
							"country",
							"zip",
							"state",
							"phone",
							"industry",
							"org",
							"job_title",
							"purchasing_time_frame",
							"role_in_purchase_process",
							"no_of_employees",
							"comments",
						])
						.optional()
						.describe("The question's field name.")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe(
							"Indicates whether or not the displayed fields are required to be filled out by registrants.",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of registrant questions."),
	})
	.optional()
	.describe("Meeting Registrant Questions");

export const meetingRegistrantStatusPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a `long` format integer, not as a simple integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantStatusQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const meetingRegistrantStatusStatus204Schema = z.unknown();

export const meetingRegistrantStatusStatus400Schema = z.unknown();

export const meetingRegistrantStatusStatus404Schema = z.unknown();

export const meetingRegistrantStatusStatus429Schema = z.unknown();

export const meetingRegistrantStatusResponseSchema = meetingRegistrantStatusStatus204Schema;

export const meetingRegistrantStatusErrorSchema = z.union([
	meetingRegistrantStatusStatus400Schema,
	meetingRegistrantStatusStatus404Schema,
	meetingRegistrantStatusStatus429Schema,
]);

export const meetingRegistrantStatusBodySchema = z
	.object({
		action: z
			.union([z.literal("approve"), z.literal("cancel"), z.literal("deny")])
			.describe(
				"Registrant status. \n `approve` - Approve registrant.  \n `cancel` - Cancel previously approved registrant's registration.  \n `deny` - Deny registrant.",
			)
			.meta({ examples: ["approve"] }),
		registrants: z
			.array(
				z.object({
					email: z
						.string()
						.optional()
						.meta({ examples: ["jchill@example.com"] }),
					id: z
						.string()
						.optional()
						.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
				}),
			)
			.optional()
			.describe("List of registrants."),
	})
	.optional();

export const meetingRegistrantGetPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRegistrantGetPathRegistrantIdSchema = z
	.string()
	.describe("The registrant ID.")
	.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] });

export const meetingRegistrantGetStatus200Schema = z
	.object({
		id: z
			.string()
			.optional()
			.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
	})
	.extend({
		address: z
			.string()
			.optional()
			.describe("The registrant's address.")
			.meta({ examples: ["1800 Amphibious Blvd."] }),
		city: z
			.string()
			.optional()
			.describe("The registrant's city.")
			.meta({ examples: ["Mountain View"] }),
		comments: z
			.string()
			.optional()
			.describe("The registrant's questions and comments.")
			.meta({ examples: ["Looking forward to the discussion."] }),
		country: z
			.string()
			.optional()
			.describe(
				"The registrant's two-letter [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
			)
			.meta({ examples: ["US"] }),
		custom_questions: z
			.array(
				z.object({
					title: z
						.string()
						.optional()
						.describe("The title of the custom question.")
						.meta({ examples: ["What do you hope to learn from this?"] }),
					value: z
						.string()
						.max(128)
						.optional()
						.describe("The custom question's response value. This has a limit of 128 characters.")
						.meta({
							examples: [
								"Look forward to learning how you come up with new recipes and what other services you offer.",
							],
						}),
				}),
			)
			.optional()
			.describe("Information about custom questions."),
		email: z
			.email()
			.max(128)
			.describe(
				"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
			)
			.meta({ examples: ["jchill@example.com"] }),
		first_name: z
			.string()
			.max(64)
			.describe("The registrant's first name.")
			.meta({ examples: ["Jill"] }),
		industry: z
			.string()
			.optional()
			.describe("The registrant's industry.")
			.meta({ examples: ["Food"] }),
		job_title: z
			.string()
			.optional()
			.describe("The registrant's job title.")
			.meta({ examples: ["Chef"] }),
		last_name: z
			.string()
			.max(64)
			.optional()
			.describe("The registrant's last name.")
			.meta({ examples: ["Chill"] }),
		no_of_employees: z
			.enum([
				"",
				"1-20",
				"21-50",
				"51-100",
				"101-250",
				"251-500",
				"501-1,000",
				"1,001-5,000",
				"5,001-10,000",
				"More than 10,000",
			])
			.optional()
			.describe(
				"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
			)
			.meta({ examples: ["1-20"] }),
		org: z
			.string()
			.optional()
			.describe("The registrant's organization.")
			.meta({ examples: ["Cooking Org"] }),
		phone: z
			.string()
			.optional()
			.describe("The registrant's phone number.")
			.meta({ examples: ["5550100"] }),
		purchasing_time_frame: z
			.enum([
				"",
				"Within a month",
				"1-3 months",
				"4-6 months",
				"More than 6 months",
				"No timeframe",
			])
			.optional()
			.describe(
				"The registrant's purchasing time frame. \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
			)
			.meta({ examples: ["1-3 months"] }),
		role_in_purchase_process: z
			.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
			.optional()
			.describe(
				"The registrant's role in the purchase process. \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
			)
			.meta({ examples: ["Influencer"] }),
		state: z
			.string()
			.optional()
			.describe("The registrant's state or province.")
			.meta({ examples: ["CA"] }),
		status: z
			.enum(["approved", "denied", "pending"])
			.optional()
			.describe(
				"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
			)
			.meta({ examples: ["approved"] }),
		zip: z
			.string()
			.optional()
			.describe("The registrant's ZIP or postal code.")
			.meta({ examples: ["94045"] }),
	})
	.extend({
		create_time: z.iso
			.datetime()
			.optional()
			.describe("The registrant's registration date and time.")
			.meta({ examples: ["2022-03-22T05:58:44Z"] }),
		join_url: z
			.url()
			.optional()
			.describe("The URL with which the approved registrant can join the meeting.")
			.meta({ examples: ["https://example.com/j/11111"] }),
		status: z
			.enum(["approved", "pending", "denied"])
			.optional()
			.describe(
				"The registrant's registration status.\n* `approved` - The registrant is approved to join the meeting. \n* `pending` - The registrant's registration is pending.\n* `denied` - The registrant was declined to join the meeting.",
			)
			.meta({ examples: ["approved"] }),
		participant_pin_code: z.coerce
			.bigint()
			.optional()
			.describe(
				"The participant PIN code is used to authenticate audio participants before they join the meeting.",
			)
			.meta({ examples: [380303] }),
	});

export const meetingRegistrantGetStatus400Schema = z.unknown();

export const meetingRegistrantGetStatus404Schema = z.unknown();

export const meetingRegistrantGetStatus429Schema = z.unknown();

export const meetingRegistrantGetResponseSchema = meetingRegistrantGetStatus200Schema;

export const meetingRegistrantGetErrorSchema = z.union([
	meetingRegistrantGetStatus400Schema,
	meetingRegistrantGetStatus404Schema,
	meetingRegistrantGetStatus429Schema,
]);

export const meetingregistrantdeletePathMeetingIdSchema = z
	.int()
	.describe("The meeting ID.")
	.meta({ examples: [91498058927] });

export const meetingregistrantdeletePathRegistrantIdSchema = z
	.string()
	.describe("The meeting registrant ID.")
	.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] });

export const meetingregistrantdeleteQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting occurrence ID.")
	.meta({ examples: ["approved"] });

export const meetingregistrantdeleteStatus204Schema = z.unknown();

export const meetingregistrantdeleteStatus400Schema = z.unknown();

export const meetingregistrantdeleteStatus404Schema = z.unknown();

export const meetingregistrantdeleteStatus429Schema = z.unknown();

export const meetingregistrantdeleteResponseSchema = meetingregistrantdeleteStatus204Schema;

export const meetingregistrantdeleteErrorSchema = z.union([
	meetingregistrantdeleteStatus400Schema,
	meetingregistrantdeleteStatus404Schema,
	meetingregistrantdeleteStatus429Schema,
]);

export const meetingLiveStreamingJoinTokenPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingLiveStreamingJoinTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the join token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The join token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the meeting's join token.");

export const meetingLiveStreamingJoinTokenStatus400Schema = z.unknown();

export const meetingLiveStreamingJoinTokenStatus404Schema = z.unknown();

export const meetingLiveStreamingJoinTokenStatus429Schema = z.unknown();

export const meetingLiveStreamingJoinTokenResponseSchema =
	meetingLiveStreamingJoinTokenStatus200Schema;

export const meetingLiveStreamingJoinTokenErrorSchema = z.union([
	meetingLiveStreamingJoinTokenStatus400Schema,
	meetingLiveStreamingJoinTokenStatus404Schema,
	meetingLiveStreamingJoinTokenStatus429Schema,
]);

export const getMeetingLiveStreamDetailsPathMeetingIdSchema = z
	.string()
	.describe("Unique identifier of the meeting.")
	.meta({ examples: ["93398114182"] });

export const getMeetingLiveStreamDetailsStatus200Schema = z.object({
	page_url: z
		.string()
		.optional()
		.describe(
			"Live streaming page URL. This is the URL using which anyone can view the livestream of the meeting.",
		)
		.meta({ examples: ["https://example.com/livestream/123"] }),
	stream_key: z
		.string()
		.optional()
		.describe("Stream Key.")
		.meta({ examples: ["contact-ic@example.com"] }),
	stream_url: z
		.string()
		.optional()
		.describe("Stream URL.")
		.meta({ examples: ["https://example.com/livestream"] }),
	resolution: z
		.string()
		.optional()
		.describe("The number of pixels in each dimension that the video camera can display.")
		.meta({ examples: ["720p"] }),
});

export const getMeetingLiveStreamDetailsStatus400Schema = z.unknown();

export const getMeetingLiveStreamDetailsStatus404Schema = z.unknown();

export const getMeetingLiveStreamDetailsStatus429Schema = z.unknown();

export const getMeetingLiveStreamDetailsResponseSchema = getMeetingLiveStreamDetailsStatus200Schema;

export const getMeetingLiveStreamDetailsErrorSchema = z.union([
	getMeetingLiveStreamDetailsStatus400Schema,
	getMeetingLiveStreamDetailsStatus404Schema,
	getMeetingLiveStreamDetailsStatus429Schema,
]);

export const meetingLiveStreamUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingLiveStreamUpdateStatus204Schema = z.unknown();

export const meetingLiveStreamUpdateStatus400Schema = z.unknown();

export const meetingLiveStreamUpdateStatus404Schema = z.unknown();

export const meetingLiveStreamUpdateStatus429Schema = z.unknown();

export const meetingLiveStreamUpdateResponseSchema = meetingLiveStreamUpdateStatus204Schema;

export const meetingLiveStreamUpdateErrorSchema = z.union([
	meetingLiveStreamUpdateStatus400Schema,
	meetingLiveStreamUpdateStatus404Schema,
	meetingLiveStreamUpdateStatus429Schema,
]);

export const meetingLiveStreamUpdateBodySchema = z
	.object({
		page_url: z
			.url()
			.max(1024)
			.describe("The live stream page URL.")
			.meta({ examples: ["https://example.com/livestream/123"] }),
		stream_key: z
			.string()
			.max(512)
			.describe("Stream name and key.")
			.meta({ examples: ["contact-it@example.com"] }),
		stream_url: z
			.string()
			.max(1024)
			.describe("Streaming URL.")
			.meta({ examples: ["https://example.com/livestream"] }),
		resolution: z
			.string()
			.optional()
			.describe(
				"The number of pixels in each dimension that the video camera can display, required when a user enables 1080p. Use a value of `720p` or `1080p`",
			)
			.meta({ examples: ["720p"] }),
	})
	.optional()
	.describe("Meeting");

export const meetingLiveStreamStatusUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingLiveStreamStatusUpdateStatus204Schema = z.unknown();

export const meetingLiveStreamStatusUpdateStatus400Schema = z.unknown();

export const meetingLiveStreamStatusUpdateStatus404Schema = z.unknown();

export const meetingLiveStreamStatusUpdateStatus429Schema = z.unknown();

export const meetingLiveStreamStatusUpdateResponseSchema =
	meetingLiveStreamStatusUpdateStatus204Schema;

export const meetingLiveStreamStatusUpdateErrorSchema = z.union([
	meetingLiveStreamStatusUpdateStatus400Schema,
	meetingLiveStreamStatusUpdateStatus404Schema,
	meetingLiveStreamStatusUpdateStatus429Schema,
]);

export const meetingLiveStreamStatusUpdateBodySchema = z
	.object({
		action: z
			.enum(["start", "stop", "mode"])
			.optional()
			.describe(
				"The meeting's livestream status.\n* `start` - Start a livestream.\n* `stop` - Stop an ongoing livestream.\n* `mode` - Control a livestream view at runtime.",
			)
			.meta({ examples: ["start"] }),
		settings: z
			.object({
				active_speaker_name: z
					.boolean()
					.optional()
					.describe(
						"Whether to display the name of the active speaker during a meeting's livestream. Use this field if you pass the `start` value for the `action` field.",
					)
					.meta({ examples: [true] }),
				display_name: z
					.string()
					.min(1)
					.max(50)
					.optional()
					.describe(
						"The display name of the meeting's livestream. Use this field if you pass the `start` value for the `action` field.",
					)
					.meta({ examples: ["Jill Chill"] }),
				layout: z
					.enum(["follow_host", "gallery_view", "speaker_view"])
					.optional()
					.default("follow_host")
					.describe(
						"The layout of the meeting's livestream. Use this field if you pass the `start` or `mode` value for the `action` field.\r\n* `follow_host` - Follow host view.\r\n* `gallery_view` - Gallery view.\r\n* `speaker_view` - Speaker view.",
					)
					.meta({ examples: ["follow_host"] }),
				close_caption: z
					.enum(["burnt-in", "embedded", "off"])
					.optional()
					.default("burnt-in")
					.describe(
						"The livestream's closed caption type for this session. Use this field if you pass the `start` or `mode` value for the `action` field.\r\n* `burnt-in` - Burnt in captions.\r\n* `embedded` - Embedded captions.\r\n* `off` - Turn off captions.",
					)
					.meta({ examples: ["burnt-in"] }),
			})
			.optional()
			.describe("The meeting's livestreaming settings."),
	})
	.optional()
	.describe("Meeting");

export const meetingRTMSStatusUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID.\n\nWhen storing this value in your database, store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingRTMSStatusUpdateStatus204Schema = z.unknown();

export const meetingRTMSStatusUpdateStatus400Schema = z.unknown();

export const meetingRTMSStatusUpdateStatus403Schema = z.unknown();

export const meetingRTMSStatusUpdateStatus404Schema = z.unknown();

export const meetingRTMSStatusUpdateStatus429Schema = z.unknown();

export const meetingRTMSStatusUpdateResponseSchema = meetingRTMSStatusUpdateStatus204Schema;

export const meetingRTMSStatusUpdateErrorSchema = z.union([
	meetingRTMSStatusUpdateStatus400Schema,
	meetingRTMSStatusUpdateStatus403Schema,
	meetingRTMSStatusUpdateStatus404Schema,
	meetingRTMSStatusUpdateStatus429Schema,
]);

export const meetingRTMSStatusUpdateBodySchema = z
	.object({
		action: z
			.enum(["start", "stop", "pause", "resume"])
			.optional()
			.describe(
				"The participant's RTMS app status.\n* `start` - Start an RTMS app.\n* `stop` - Stop an ongoing RTMS app.\n* `pause` - Pause an ongoing RTMS app.\n* `resume` - Resume a paused RTMS app.",
			)
			.meta({ examples: ["start"] }),
		settings: z
			.object({
				participant_user_id: z
					.string()
					.optional()
					.describe(
						"The participant's user ID. This field is optional. If not provided, the user ID will be automatically obtained from the authentication token. This value matches the `id` field in the [**Get a user**](/docs/api/users/#tag/users/GET/users/{userId}) API response. Use this field if you pass the `start`, `stop`, `pause` or `resume` value for the `action` field.",
					)
					.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
				client_id: z
					.string()
					.describe(
						"The unique identifier of the authorized app, configured in the Account Settings under **Allow apps to access meeting content**. This app must have host approval to access in-meeting content. Use this field if you pass the `start`, `stop`, `pause` or `resume` value for the `action` field.",
					)
					.meta({ examples: ["a_Zu0X_FVBUycmEi9ms5hg"] }),
			})
			.optional()
			.describe("The participant's RTMS app settings."),
	})
	.optional()
	.describe("Meeting");

export const meetingPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long format integer and **not** an integer. Meeting IDs can be more than 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe(
		"Meeting occurrence ID. Provide this field to view meeting details of a particular occurrence of the [recurring meeting](https://support.zoom.us/hc/en-us/articles/214973206-Scheduling-Recurring-Meetings).",
	)
	.meta({ examples: ["1648194360000"] });

export const meetingQueryShowPreviousOccurrencesSchema = z
	.boolean()
	.optional()
	.describe(
		"Set this field's value to `true` to view meeting details of all previous occurrences of a [recurring meeting](https://support.zoom.us/hc/en-us/articles/214973206-Scheduling-Recurring-Meetings). ",
	)
	.meta({ examples: [true] });

export const meetingStatus200Schema = z
	.object({
		assistant_id: z
			.string()
			.optional()
			.describe("The ID of the user who scheduled this meeting on behalf of the host.")
			.meta({ examples: ["kFFvsJc-Q1OSxaJQLvaa_A"] }),
		host_email: z
			.email()
			.optional()
			.describe("The meeting host's email address.")
			.meta({ examples: ["jchill@example.com"] }),
		host_id: z
			.string()
			.optional()
			.describe("The ID of the user who is set as the meeting host.")
			.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
		id: z.coerce
			.bigint()
			.optional()
			.describe(
				"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in **long** format, represented as int64 data type in JSON, also known as the meeting number.",
			)
			.meta({ examples: [97763643886] }),
		uuid: z
			.string()
			.optional()
			.describe(
				"Unique meeting ID. Each meeting instance generates its own meeting UUID - after a meeting ends, a new UUID is generated for the next instance of the meeting. Retrieve a list of UUIDs from past meeting instances using the [**List past meeting instances**](/docs/api/rest/reference/zoom-api/methods#operation/pastMeetings) API. [Double encode](/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.\n",
			)
			.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
		registration_url: z
			.string()
			.optional()
			.describe(
				"The URL that registrants can use to register for a meeting. This field is only returned for meetings that have enabled registration.",
			)
			.meta({
				examples: ["https://example.com/meeting/register/7ksAkRCoEpt1Jm0wa-E6lICLur9e7Lde5oW6"],
			}),
		agenda: z
			.string()
			.max(2000)
			.optional()
			.describe("The meeting description.")
			.meta({ examples: ["My Meeting"] }),
		created_at: z.iso
			.datetime()
			.optional()
			.describe("The creation time. ")
			.meta({ examples: ["2022-03-25T07:29:29Z"] }),
		duration: z
			.int()
			.optional()
			.describe("The meeting duration.")
			.meta({ examples: [60] }),
		encrypted_password: z
			.string()
			.optional()
			.describe("Encrypted passcode for third party endpoints (H323/SIP).")
			.meta({ examples: ["8pEkRweVXPV3Ob2KJYgFTRlDtl1gSn.1"] }),
		pstn_password: z
			.string()
			.optional()
			.describe(
				"Password for participants to join the meeting via [PSTN](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference).",
			)
			.meta({ examples: ["123456"] }),
		h323_password: z
			.string()
			.optional()
			.describe("H.323/SIP room system passcode.")
			.meta({ examples: ["123456"] }),
		join_url: z
			.string()
			.optional()
			.describe(
				"The URL for participants to join the meeting. This URL should only be shared with users invited to the meeting.",
			)
			.meta({ examples: ["https://example.com/j/11111"] }),
		chat_join_url: z
			.string()
			.optional()
			.describe("The URL to join the chat.")
			.meta({ examples: ["https://example.com/launch/jc/11111"] }),
		occurrences: z
			.array(
				z.object({
					duration: z
						.int()
						.optional()
						.describe("Duration.")
						.meta({ examples: [60] }),
					occurrence_id: z
						.string()
						.optional()
						.describe(
							"Occurrence ID. The unique identifier for an occurrence of a recurring meeting. [Recurring meetings](https://support.zoom.us/hc/en-us/articles/214973206-Scheduling-Recurring-Meetings) can have a maximum of 50 occurrences.",
						)
						.meta({ examples: ["1648194360000"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time.")
						.meta({ examples: ["2022-03-25T07:46:00Z"] }),
					status: z
						.enum(["available", "deleted"])
						.optional()
						.describe(
							"Occurrence status. \n `available` - Available occurrence.  \n `deleted` -  Deleted occurrence.",
						)
						.meta({ examples: ["available"] }),
				}),
			)
			.optional()
			.describe("Array of occurrence objects."),
		password: z
			.string()
			.optional()
			.describe("Meeting passcode.")
			.meta({ examples: ["123456"] }),
		pmi: z
			.string()
			.optional()
			.describe(
				"[Personal meeting ID (PMI)](/docs/api/rest/using-zoom-apis/#understanding-personal-meeting-id-pmi). Only used for scheduled meetings and recurring meetings with no fixed time.",
			)
			.meta({ examples: ["97891943927"] }),
		pre_schedule: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether the prescheduled meeting was created via the [GSuite app](https://support.zoom.us/hc/en-us/articles/360020187492-Zoom-for-GSuite-add-on). This **only** supports the meeting `type` value of `2` (scheduled meetings) and `3` (recurring meetings with no fixed time). \n* `true` - A GSuite prescheduled meeting. \n* `false` - A regular meeting.",
			)
			.meta({ examples: [false] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select the final date when the meeting will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. (Cannot be used with `end_times`.)",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"Select how many times the meeting should recur before it is canceled. If `end_times` is set to 0, it means there is no end time. The maximum number of recurrences is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.default(1)
					.describe(
						"Use this field only if you're scheduling a recurring meeting of type `3` to state the day in a month when the meeting should recur. The value range is from 1 to 31.\n\nFor example, for a meeting to recur on 23rd of each month, provide `23` as this field's value and `1` as the `repeat_interval` field's value. Instead, to have the meeting to recur every three months on 23rd of the month, change the `repeat_interval` field's value to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field only if you're scheduling a recurring meeting of type `3` to state the week of the month when the meeting should recur. If you use this field, **you must also use the `monthly_week_day` field to state the day of the week when the meeting should recur.**   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state a specific day in a week when the monthly meeting should recur. To use this field, you must also use the `monthly_week` field. \n\n  \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the meeting should recur. For instance, to schedule a meeting that recurs every two months, you must set this field's value as `2` and the `type` parameter's value as `3`. \n\nFor a daily meeting, the maximum interval you can set is `99` days. For a weekly meeting the maximum interval that you can set is  of `50` weeks. For a monthly meeting, there is a maximum of `10` months.\n\n",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe("Recurring meeting types. \n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.")
					.meta({ examples: [1] }),
				weekly_days: z
					.enum(["1", "2", "3", "4", "5", "6", "7"])
					.optional()
					.default("1")
					.describe(
						"This field is required if you're scheduling a recurring meeting of type `2` to state which days of the week the meeting should repeat.   \n    \n  The value for this field could be a number between `1` to `7` in string format. For instance, if the meeting should recur on Sunday, provide `1` as this field's value.  \n   \n  **Note** To have the meeting occur on multiple days of a week, provide comma separated values for this field. For instance, if the meeting should recur on Sundays and Tuesdays provide `1,3` as this field's value.\n\n\n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a meeting with type `8`, a recurring meeting with a fixed time. ",
			),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add additional meeting [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe(
						"Allow attendees to join the meeting from multiple devices. This setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe(
						"A semicolon-separated list of the meeting's alternative hosts' email addresses or IDs.",
					)
					.meta({ examples: ["jchill@example.com;thill@example.com"] }),
				alternative_hosts_email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Flag to determine whether to send email notifications to alternative hosts, default value is true.",
					)
					.meta({ examples: [true] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				alternative_host_manage_meeting_summary: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting summaries.")
					.meta({ examples: [true] }),
				alternative_host_manage_cloud_recording: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting cloud recordings.")
					.meta({ examples: [false] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"Enable registration and set approval for the registration. Note that this feature requires the host to be of **Licensed** user type. **Registration cannot be enabled for a basic user.**   \n   \n \n\n`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				approved_or_denied_countries_or_regions: z
					.object({
						approved_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries/regions from where participants can join this meeting. ",
							),
						denied_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries or regions from where participants can not join this meeting. ",
							),
						enable: z
							.boolean()
							.optional()
							.describe(
								"`true` - Setting enabled to either allow users or block users from specific regions to join your meetings.   \n \n\n`false` - Setting disabled.",
							)
							.meta({ examples: [true] }),
						method: z
							.enum(["approve", "deny"])
							.optional()
							.describe(
								"Specify whether to allow users from specific regions to join this meeting; or block users from specific regions from joining this meeting.   \n   \n \n`approve`: Allow users from specific regions/countries to join this meeting. If this setting is selected, the approved regions/countries must be included in the `approved_list`.  \n   \n \n`deny`: Block users from specific regions/countries from joining this meeting. If this setting is selected, the approved regions/countries must be included in the `denied_list`",
							)
							.meta({ examples: ["approve"] }),
					})
					.optional()
					.describe(
						"Approve or block users from specific regions/countries from joining this meeting. \n",
					),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe(
						"Determine how participants can join the audio portion of the meeting.  \n `both` - Both Telephony and VoIP.  \n `telephony` - Telephony only.  \n `voip` - VoIP only.  \n `thirdParty` - Third party audio conference.",
					)
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference information.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [Sign Into Zoom with Specified Domains](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_exception: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The participant's email address.")
								.meta({ examples: ["jchill@example.com"] }),
							name: z
								.string()
								.optional()
								.describe("The participant's name.")
								.meta({ examples: ["Jill Chill"] }),
							join_url: z
								.string()
								.optional()
								.describe("URL for participants to join the meeting")
								.meta({ examples: ["https://example.com/s/11111"] }),
						}),
					)
					.optional()
					.describe(
						"The participants added here will receive unique meeting invite links and bypass authentication.",
					),
				authentication_name: z
					.string()
					.optional()
					.describe(
						"Authentication name set in the [authentication profile](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f).",
					)
					.meta({ examples: ["Sign in to Zoom"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Meeting authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.enum(["local", "cloud", "none"])
					.optional()
					.default("none")
					.describe(
						"Automatic recording settings. \n\n* `local` - Record the meeting locally. \n* `cloud` - Record the meeting to the cloud. \n* `none` - Auto-recording disabled.\n\nDefault is `none`.",
					)
					.meta({ examples: ["cloud"] }),
				host_pause_stop_recording: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host to pause or stop automatic cloud recording for this meeting. Only supported for cloud recording.",
					)
					.meta({ examples: [false] }),
				auto_add_recording_to_video_management: z
					.object({
						enable: z
							.boolean()
							.default(false)
							.describe("Whether to automatically add the meeting recording to video management.")
							.meta({ examples: [true] }),
						channels: z
							.array(
								z.object({
									channel_id: z
										.string()
										.describe("The unique ID of a video management channel.")
										.meta({ examples: ["Uyh5qeykTDiA66YQEYmFPg"] }),
									name: z
										.string()
										.optional()
										.describe("The name of the video management channel.")
										.meta({ examples: ["Team Weekly Meetings"] }),
								}),
							)
							.min(1)
							.max(5)
							.optional()
							.describe(
								"List of video management channels where the meeting recording will be added.",
							),
					})
					.optional()
					.describe(
						"Automatically add meeting recordings to a video channel in video management. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					),
				breakout_room: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Set this field's value to `true` if you would like to enable the [breakout room pre-assign](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4) option.",
							)
							.meta({ examples: [true] }),
						rooms: z
							.array(
								z.object({
									name: z
										.string()
										.optional()
										.describe("The breakout room's name.")
										.meta({ examples: ["room1"] }),
									participants: z
										.array(z.string())
										.optional()
										.describe(
											"Email addresses of the participants who are to be assigned to the breakout room.",
										),
								}),
							)
							.optional()
							.describe("Create room or rooms."),
					})
					.optional()
					.describe(
						"Setting to [pre-assign breakout rooms](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4).",
					),
				calendar_type: z
					.union([z.literal(1), z.literal(2)])
					.optional()
					.describe(
						"Indicates the type of calendar integration used to schedule the meeting. \n* `1` - [Zoom Outlook add-in](https://support.zoom.us/hc/en-us/articles/360031592971-Getting-started-with-Outlook-plugin-and-add-in) \n* `2` - [Zoom for Google Workspace add-on](https://support.zoom.us/hc/en-us/articles/360020187492-Using-the-Zoom-for-Google-Workspace-add-on)\n\nWorks with the `private_meeting` field to determine whether to share details of meetings or not.",
					)
					.meta({ examples: [1] }),
				close_registration: z
					.boolean()
					.optional()
					.default(false)
					.describe("Close registration after event date.")
					.meta({ examples: [false] }),
				cn_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host meeting in China.")
					.meta({ examples: [false] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration.")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration.")
					.meta({ examples: ["Jill Chill"] }),
				custom_keys: z
					.array(
						z.object({
							key: z
								.string()
								.max(64)
								.optional()
								.describe("Custom key associated with the user.")
								.meta({ examples: ["key1"] }),
							value: z
								.string()
								.max(256)
								.optional()
								.describe("Value of the custom key associated with the user.")
								.meta({ examples: ["value1"] }),
						}),
					)
					.max(10)
					.optional()
					.describe("Custom keys and values assigned to the meeting."),
				email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Whether to send email notifications to [alternative hosts](https://support.zoom.us/hc/en-us/articles/208220166) and [users with scheduling privileges](https://support.zoom.us/hc/en-us/articles/201362803-Scheduling-privilege). This value defaults to `true`.",
					)
					.meta({ examples: [true] }),
				encryption_type: z
					.enum(["enhanced_encryption", "e2ee"])
					.optional()
					.describe(
						"Choose between enhanced encryption and [end-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871) when starting or a meeting. When using end-to-end encryption, several features (e.g. cloud recording, phone/SIP/H.323 dial-in) will be **automatically disabled**. \n \n`enhanced_encryption` - Enhanced encryption. Encryption is stored in the cloud if you enable this option.   \n \n\n`e2ee` - [End-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871). The encryption key is stored in your local device and can not be obtained by anyone else. Enabling this setting also **disables** the join before host, cloud recording, streaming, live transcription, breakout rooms, polling, 1:1 private chat, and meeting reactions features.",
					)
					.meta({ examples: ["enhanced_encryption"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: ["example.com"] }),
				focus_mode: z
					.boolean()
					.optional()
					.describe(
						"Whether the [**Focus Mode** feature](https://support.zoom.us/hc/en-us/articles/360061113751-Using-focus-mode) is enabled when the meeting starts.",
					)
					.meta({ examples: [true] }),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries."),
				global_dial_in_numbers: z
					.array(
						z.object({
							city: z
								.string()
								.optional()
								.describe("City of the number, if any. For example, Chicago.")
								.meta({ examples: ["New York"] }),
							country: z
								.string()
								.optional()
								.describe("Country code, such as BR.")
								.meta({ examples: ["US"] }),
							country_name: z
								.string()
								.optional()
								.describe("Full name of country, such as Brazil.")
								.meta({ examples: ["US"] }),
							number: z
								.string()
								.optional()
								.describe("Phone number, such as +1 2332357613.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.enum(["toll", "tollfree"])
								.optional()
								.describe("Type of number. ")
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("Global Dial-in Countries and Regions"),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when the host joins the meeting.")
					.meta({ examples: [true] }),
				in_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host meeting in India.")
					.meta({ examples: [false] }),
				jbh_time: z
					.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)])
					.optional()
					.describe(
						"If the value of `join_before_host` field is set to true, this field can be used to indicate time limits when a participant may join a meeting before a host.\n\n*  `0` - Allow participant to join anytime.\n*  `5` - Allow participant to join 5 minutes before meeting start time.\n * `10` - Allow participant to join 10 minutes before meeting start time.\n * `15` - Allow participant to join 15 minutes before meeting start time.",
					)
					.meta({ examples: [0] }),
				join_before_host: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to join the meeting before the host starts the meeting. Only used for scheduled or recurring meetings.",
					)
					.meta({ examples: [true] }),
				question_and_answer: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for the meeting.\n\n* `false` - Disable Q&amp;A for the meeting.",
							)
							.meta({ examples: [true] }),
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Don't allow participants to submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists.\n\n* `false` - Don't allow anonymous questions. Not supported for simulive meetings.",
							)
							.meta({ examples: [true] }),
						question_visibility: z
							.enum(["answered", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view only answered questions, or view all questions.\n\n* `answered` - Attendees can only view answered questions.\n\n* `all` - Attendees can view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can't answer questions or leave a comment in the question thread.",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can select the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can't select the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.",
					),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the meeting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details.\n\n**Note:** This feature is only available for certain Meeting add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the meeting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/rest/reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's sign language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("`true` - Only authenticated users can join meetings.")
					.meta({ examples: [true] }),
				mute_upon_entry: z
					.boolean()
					.optional()
					.default(false)
					.describe("Mute participants upon entry.")
					.meta({ examples: [false] }),
				participant_video: z
					.boolean()
					.optional()
					.describe("Start video when participants join the meeting.")
					.meta({ examples: [false] }),
				private_meeting: z
					.boolean()
					.optional()
					.describe("Whether the meeting is set as private.")
					.meta({ examples: [false] }),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants an email confirmation.\n* `true` - Send a confirmation email.\n* `false` - Do not send a confirmation email.",
					)
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants email notifications about their registration approval, cancellation, or rejection.\n\n* `true` - Send an email notification.\n* `false` - Do not send an email notification.\n\n Set this value to `true` to also use the `registrants_confirmation_email` parameter.",
					)
					.meta({ examples: [true] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration type. Used for recurring meeting with fixed time only. \n `1` Attendees register once and can attend any of the occurrences.  \n `2` Attendees need to register for each occurrence to attend.  \n `3` Attendees register once and can choose one or more occurrences to attend.",
					)
					.meta({ examples: [1] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe(
						"Show social share buttons on the meeting registration page.\nThis setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the meeting's join information on the registration confirmation page. This setting is only applied to meetings with registration enabled.",
					)
					.meta({ examples: [true] }),
				use_pmi: z
					.boolean()
					.optional()
					.describe(
						"Whether to use a [Personal Meeting ID (PMI)](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi) for the meeting. This field is only used for scheduled meetings(`2`) and recurring meetings with no fixed time(`3`).",
					)
					.meta({ examples: [false] }),
				waiting_room: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable waiting room")
					.meta({ examples: [false] }),
				waiting_room_options: z
					.object({
						mode: z
							.enum(["follow_setting", "custom"])
							.describe(
								"This field specifies the waiting room behavior for this meeting.\r\n* `follow_setting` - Use the Zoom web portal setting.\r\n* `custom` - Specify which participants should go into the waiting room.",
							)
							.meta({ examples: ["follow_setting"] }),
						who_goes_to_waiting_room: z
							.enum([
								"everyone",
								"users_not_in_account",
								"users_not_in_account_or_whitelisted_domains",
								"users_not_on_invite",
								"users_not_in_org",
							])
							.optional()
							.describe(
								"Which participants should be placed into the waiting room. Required if `mode` is set to `custom`.\r\n* `everyone` - Everyone.\r\n* `users_not_in_account` - Users not in your account.\r\n* `users_not_in_account_or_whitelisted_domains` - Users who are not in your account and not part of your whitelisted domains.\r\n* `users_not_on_invite` - Users not on the meeting invite.\r\n* `users_not_in_org` - Users not in your organization.",
							)
							.meta({ examples: ["everyone"] }),
					})
					.optional()
					.describe("Configuration settings for the meeting's waiting room."),
				watermark: z
					.boolean()
					.optional()
					.default(false)
					.describe("Add a watermark when viewing a shared screen.")
					.meta({ examples: [false] }),
				host_save_video_order: z
					.boolean()
					.optional()
					.describe("Whether the **Allow host to save video order** feature is enabled.")
					.meta({ examples: [true] }),
				internal_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as an internal meeting.")
					.meta({ examples: [false] }),
				meeting_invitees: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The invitee's email address.")
								.meta({ examples: ["jchill@example.com"] }),
							internal_user: z
								.boolean()
								.optional()
								.default(false)
								.describe("Whether the meeting invitee is an internal user.")
								.meta({ examples: [false] }),
						}),
					)
					.optional()
					.describe("A list of the meeting's invitees."),
				continuous_meeting_chat: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Enable continuous meeting chat** setting.")
							.meta({ examples: [true] }),
						auto_add_invited_external_users: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Automatically add invited external users** setting.",
							)
							.meta({ examples: [true] }),
						auto_add_meeting_participants: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Automatically add meeting participants** setting.")
							.meta({ examples: [true] }),
						channel_id: z
							.string()
							.optional()
							.describe("The channel's ID.")
							.meta({ examples: ["cabc1234567defghijkl01234"] }),
					})
					.optional()
					.describe(
						"Information about the **Enable continuous meeting chat** feature. This setting only applies to scheduled and recurring meetings, types `2`, `3`, or `8`. It is **not supported** for type `1` instant meetings or type `10` screen share only meetings.",
					),
				participant_focused_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as a participant focused meeting.")
					.meta({ examples: [false] }),
				push_change_to_calendar: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to push meeting changes to the calendar. \n\n To enable this feature, configure the **Configure Calendar and Contacts Service** in the user's profile page of the Zoom web portal and enable the **Automatically sync Zoom calendar events information bi-directionally between Zoom and integrated calendars.** setting in the **Settings** page of the Zoom web portal.\n* `true` - Push meeting changes to the calendar.\n* `false` - Do not push meeting changes to the calendar.",
					)
					.meta({ examples: [false] }),
				resources: z
					.array(
						z.object({
							resource_type: z
								.enum(["whiteboard"])
								.optional()
								.describe("The resource type.")
								.meta({ examples: ["whiteboard"] }),
							resource_id: z
								.string()
								.optional()
								.describe("The resource ID.")
								.meta({ examples: ["X4Hy02w3QUOdskKofgb9Jg"] }),
							permission_level: z
								.enum(["editor", "commenter", "viewer"])
								.optional()
								.default("editor")
								.describe(
									"The permission levels for users to access the whiteboard. \n* `editor` - Users with link access can edit the board. \n* `commenter` - Users with link access can comment on the board. \n* `viewer` - Users with link access can view the board.",
								)
								.meta({ examples: ["editor"] }),
						}),
					)
					.optional()
					.describe("The meeting's resources."),
				auto_start_meeting_summary: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to automatically start a meeting summary.")
					.meta({ examples: [false] }),
				who_will_receive_summary: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Defines who will receive a summary after this meeting. This field is applicable only when `auto_start_meeting_summary` is set to `true`.\r\n* `1` - Only meeting host.\r\n* `2` - Only meeting host, co-hosts, and alternative hosts.\r\n* `3` - Only meeting host and meeting invitees in our organization.\r\n* `4` - All meeting invitees including those outside of our organization.",
					)
					.meta({ examples: [1] }),
				auto_start_ai_companion_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to automatically start AI Companion questions.")
					.meta({ examples: [false] }),
				who_can_ask_questions: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
					.optional()
					.describe(
						"Defines who can ask questions about this meeting's transcript. This field is applicable only when `auto_start_ai_companion_questions` is set to `true`.\r\n* `1` - All participants and invitees.\r\n* `2` - All participants only from when they join.\r\n* `3` - Only meeting host.\r\n* `4` - Participants and invitees in our organization.\r\n* `5` - Participants in our organization only from when they join.",
					)
					.meta({ examples: [1] }),
				summary_template_id: z
					.string()
					.optional()
					.describe(
						"The summary template ID used to generate a meeting summary based on a predefined template. To get available summary templates, use the **Get user summary templates** API. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.com/hc/en).",
					)
					.meta({ examples: ["1e1356ad"] }),
				device_testing: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable the device testing.")
					.meta({ examples: [false] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				disable_participant_video: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to disable the participant video during meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe(
						"Whether to include authenticated guest's email addresses in meetings' attendee reports.",
					)
					.meta({ examples: [true] }),
				auto_start_deepfake_detection: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start deepfake risk detection. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				prevent_screen_capture: z
					.boolean()
					.optional()
					.describe(
						"Whether to prevent participants from capturing Zoom meeting windows, which may include shared meeting content and chat messages. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
			})
			.optional()
			.describe("Meeting settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe(
				"Meeting start time in GMT or UTC. Start time will not be returned if the meeting is an **instant** meeting. \n",
			)
			.meta({ examples: ["2022-03-25T07:29:29Z"] }),
		start_url: z
			.string()
			.optional()
			.describe(
				"The `start_url` of a meeting is a URL that a host or an alternative host can start the meeting. \n\nThe expiration time for the `start_url` field listed in the response of the [**Create a meeting**](/docs/api/rest/reference/zoom-api/methods#operation/meetingCreate) API is two hours for all regular users. \n\t\nFor users created using the `custCreate` option via the [**Create users**](/docs/api/rest/reference/zoom-api/methods#operation/userCreate) API, the expiration time of the `start_url` field is 90 days.\n\t\nFor security reasons, to retrieve the updated value for the `start_url` field programmatically after the expiry time, you must call the [**Get a meeting](/docs/api/rest/reference/zoom-api/methods#operation/meeting) API and refer to the value of the `start_url` field in the response.  \n This URL should only be used by the host of the meeting and **should not be shared with anyone other than the host** of the meeting as anyone with this URL will be able to login to the Zoom Client as the host of the meeting.",
			)
			.meta({ examples: ["https://example.com/s/12345678901?zak=example_zak_token"] }),
		status: z
			.enum(["waiting", "started"])
			.optional()
			.describe(
				"The meeting status.\n* `waiting` - The meeting has not started.\n* `started` - The meeting is currently in progress.",
			)
			.meta({ examples: ["waiting"] }),
		sensitivity_label_id: z
			.string()
			.optional()
			.describe(
				"The sensitivity label ID used to apply a sensitivity label to the meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["WAzVaIjFR1Cxd767i9jksw"] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The account admin meeting template ID used to schedule a meeting using a [meeting template](https://support.zoom.us/hc/en-us/articles/360036559151-Meeting-templates). For a list of account admin-provided meeting templates, use the [**List meeting templates**](/docs/api-reference/zoom-api/methods#operation/listMeetingTemplates) API. \n* At this time, this field **only** accepts account admin meeting template IDs. \n* To enable the account admin meeting templates feature, [contact Zoom support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["Dv4YdINdTk+Z5RToadh5ug=="] }),
		timezone: z
			.string()
			.optional()
			.describe("The timezone to format the meeting start time.")
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.optional()
			.describe("Meeting topic.")
			.meta({ examples: ["My Meeting"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("The tracking field's label.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("The tracking field's value.")
						.meta({ examples: ["value1"] }),
					visible: z
						.boolean()
						.optional()
						.describe(
							"Indicates whether the [tracking field](https://support.zoom.us/hc/en-us/articles/115000293426-Scheduling-Tracking-Fields) is visible in the meeting scheduling options in the Zoom Web Portal or not.\n\n`true`: Tracking field is visible.   \n \n\n`false`: Tracking field is not visible to the users when they look at the meeting details in the Zoom Web Portal but the field was used while scheduling this meeting via API. An invisible tracking field can be used by users while scheduling meetings via API only. ",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(8), z.literal(10)])
			.optional()
			.default(2)
			.describe(
				"The type of meeting. \n* `1` - An instant meeting. \n* `2` - A scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A PMI Meeting. \n* `8` - A recurring meeting with fixed time. \n* `10` - A screen share only meeting.",
			)
			.meta({ examples: [2] }),
		dynamic_host_key: z
			.string()
			.optional()
			.describe("The meeting dynamic host key.")
			.meta({ examples: ["123456"] }),
		creation_source: z
			.enum(["other", "open_api", "web_portal"])
			.optional()
			.describe(
				"The platform used when creating the meeting.\n* `other` - Created through another platform.\n* `open_api` - Created through Open API.\n* `web_portal` - Created through the web portal.",
			)
			.meta({ examples: ["open_api"] }),
	})
	.describe("Meeting object.");

export const meetingStatus400Schema = z.unknown();

export const meetingStatus404Schema = z.unknown();

export const meetingStatus429Schema = z.unknown();

export const meetingResponseSchema = meetingStatus200Schema;

export const meetingErrorSchema = z.union([
	meetingStatus400Schema,
	meetingStatus404Schema,
	meetingStatus429Schema,
]);

export const meetingDeletePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingDeleteQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const meetingDeleteQueryScheduleForReminderSchema = z
	.boolean()
	.optional()
	.describe(
		"`true`: Notify host and alternative host about the meeting cancellation via email.\n`false`: Do not send any email notification.",
	)
	.meta({ examples: [true] });

export const meetingDeleteQueryCancelMeetingReminderSchema = z
	.boolean()
	.optional()
	.describe(
		"`true`: Notify registrants about the meeting cancellation via email. \n\n`false`: Do not send any email notification to meeting registrants. \n\nThe default value of this field is `false`.",
	)
	.meta({ examples: [true] });

export const meetingDeleteStatus204Schema = z.unknown();

export const meetingDeleteStatus400Schema = z.unknown();

export const meetingDeleteStatus404Schema = z.unknown();

export const meetingDeleteStatus429Schema = z.unknown();

export const meetingDeleteResponseSchema = meetingDeleteStatus204Schema;

export const meetingDeleteErrorSchema = z.union([
	meetingDeleteStatus400Schema,
	meetingDeleteStatus404Schema,
	meetingDeleteStatus429Schema,
]);

export const meetingUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long format integer and **not** an integer. Meeting IDs can be greater than 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingUpdateQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe(
		"Meeting occurrence ID. Support change of agenda, `start_time`, duration, or settings {`host_video`, `participant_video`, `join_before_host`, `mute_upon_entry`, `waiting_room`, `watermark`, `auto_recording`}.",
	)
	.meta({ examples: ["1648194360000"] });

export const meetingUpdateStatus204Schema = z.unknown();

export const meetingUpdateStatus400Schema = z.unknown();

export const meetingUpdateStatus401Schema = z.unknown();

export const meetingUpdateStatus404Schema = z.unknown();

export const meetingUpdateStatus429Schema = z.unknown();

export const meetingUpdateResponseSchema = meetingUpdateStatus204Schema;

export const meetingUpdateErrorSchema = z.union([
	meetingUpdateStatus400Schema,
	meetingUpdateStatus401Schema,
	meetingUpdateStatus404Schema,
	meetingUpdateStatus429Schema,
]);

export const meetingUpdateBodySchema = z
	.object({
		agenda: z
			.string()
			.max(2000)
			.optional()
			.describe("Meeting description.")
			.meta({ examples: ["My Meeting"] }),
		duration: z
			.int()
			.min(1)
			.max(1440)
			.optional()
			.describe(
				"The meeting's scheduled duration, in minutes. This field is used for type `2` scheduled meetings and type `8` recurring meetings with a fixed time. The value must be between 1 and 1440 minutes, which equates to 24 hours.",
			)
			.meta({ examples: [60] }),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"The passcode required to join the meeting. By default, a passcode can **only** have a maximum length of 10 characters and only contain alphanumeric characters and the `@`, `-`, `_`, and `*` characters.\n\n**Note**\n* If the account owner or administrator has configured [minimum passcode requirement settings](https://support.zoom.us/hc/en-us/articles/360033559832-Meeting-and-webinar-passwords#h_a427384b-e383-4f80-864d-794bf0a37604), the passcode **must** meet those requirements. \n* If passcode requirements are enabled, use the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API or the [**Get account settings**](/docs/api/accounts/#tag/accounts/GET/accounts/{accountId}/settings) API to get the requirements.\n* If the **Require a passcode when scheduling new meetings** account setting is enabled and locked, a passcode will be automatically generated if one is not provided.",
			)
			.meta({ examples: ["123456"] }),
		pre_schedule: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether to create a prescheduled meeting through the [GSuite app](https://support.zoom.us/hc/en-us/articles/360020187492-Zoom-for-GSuite-add-on). This **only** supports the meeting `type` value of `2` - scheduled meetings- and `3` - recurring meetings with no fixed time. \n* `true` - Create a prescheduled meeting. \n* `false` - Create a regular meeting.",
			)
			.meta({ examples: [false] }),
		schedule_for: z
			.string()
			.optional()
			.describe("The email address or `userId` of the user to schedule a meeting for.")
			.meta({ examples: ["jchill@example.com"] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select the final date when the meeting recurs before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"Select how many times the meeting should recur before it is canceled. If `end_times` is set to 0, it means there is no end time. The maximum number of recurrences is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.default(1)
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state the day in a month when the meeting should recur. The value range is from 1 to 31.\n\nFor instance, if the meeting should recur on 23rd of each month, provide `23` as this field's value and `1` as the `repeat_interval` field's value. If the meeting should recur every three months on 23rd of the month, change the `repeat_interval` field's value to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state the week of the month when the meeting should recur. If you use this field, you must also use the `monthly_week_day` field to state the day of the week when the meeting should recur.   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field only if you're scheduling a recurring meeting of type `3` to state a specific day in a week when a monthly meeting should recur. To use this field, you must also use the `monthly_week` field. \n\n  \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the meeting should recur. For instance, to schedule a meeting that recurs every two months, set this field's value as `2` and the `type` parameter's value to `3`. \n\nFor a daily meeting, the maximum interval is `99` days. For a weekly meeting, the maximum interval is `50` weeks. For a monthly meeting, the maximum value is `10` months.\n\n",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe(
						"Recurrence meeting types. \n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.",
					)
					.meta({ examples: [1] }),
				weekly_days: z
					.enum(["1", "2", "3", "4", "5", "6", "7"])
					.optional()
					.default("1")
					.describe(
						"This field is required if you're scheduling a recurring meeting of type `2`, to state which days of the week the meeting should repeat.   \n\nThiw field's value could be a number between `1` to `7` in string format. For instance, if the meeting should recur on Sunday, provide `1` as this field's value.  \n   \n  **Note** If you would like the meeting to occur on multiple days of a week, you should provide comma separated values for this field. For instance, if the meeting should recur on Sundays and Tuesdays provide `1,3` as this field's value.\n\n   \n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a meeting with type `8`, a recurring meeting with fixed time. ",
			),
		settings: z
			.object({
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe(
						"Allow attendees to join the meeting from multiple devices. This setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe(
						"A semicolon-separated list of the meeting's alternative hosts' email addresses or IDs.",
					)
					.meta({ examples: ["jchill@example.com;thill@example.com"] }),
				alternative_hosts_email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Flag to determine whether to send email notifications to alternative hosts, default value is true.",
					)
					.meta({ examples: [true] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				alternative_host_manage_meeting_summary: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting summaries.")
					.meta({ examples: [true] }),
				alternative_host_manage_cloud_recording: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting cloud recordings.")
					.meta({ examples: [false] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"Enable registration and set approval for the registration. Note that this feature requires the host to be of **Licensed** user type. **Registration cannot be enabled for a basic user.**   \n   \n \n\n`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				approved_or_denied_countries_or_regions: z
					.object({
						approved_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries or regions from where participants can join this meeting. ",
							),
						denied_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries or regions from where participants can not join this meeting. ",
							),
						enable: z
							.boolean()
							.optional()
							.describe(
								"`true` - Setting enabled to either allow users or block users from specific regions to join your meetings.\n \n\n`false` - Setting disabled.",
							)
							.meta({ examples: [true] }),
						method: z
							.enum(["approve", "deny"])
							.optional()
							.describe(
								"Specify whether to allow users from specific regions to join this meeting, or block users from specific regions from joining this meeting.\n\n \n`approve` - Allow users from specific regions or countries to join this meeting. If this setting is selected, include the approved regions or countries in the `approved_list`.  \n\n\n`deny` - Block users from specific regions or countries from joining this meeting. If this setting is selected, include the approved regions orcountries in the `denied_list`",
							)
							.meta({ examples: ["approve"] }),
					})
					.optional()
					.describe(
						"Approve or block users from specific regions or countries from joining this meeting. \n",
					),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe(
						"Determine how participants can join the audio portion of the meeting.  \n `both` - Both Telephony and VoIP.  \n `telephony` - Telephony only.  \n `voip` - VoIP only.  \n `thirdParty` - Third party audio conference.",
					)
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference info.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [Sign Into Zoom with Specified Domains](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_exception: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The participant's email address.")
								.meta({ examples: ["jchill@example.com"] }),
							name: z
								.string()
								.optional()
								.describe("The participant's name.")
								.meta({ examples: ["Jill Chill"] }),
							join_url: z
								.string()
								.optional()
								.describe("URL for participants to join the meeting")
								.meta({ examples: ["https://example.com/s/11111"] }),
						}),
					)
					.optional()
					.describe(
						"The participants added here will receive unique meeting invite links and bypass authentication.",
					),
				authentication_name: z
					.string()
					.optional()
					.describe(
						"Authentication name set in the [authentication profile](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f).",
					)
					.meta({ examples: ["Sign in to Zoom"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Meeting authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.enum(["local", "cloud", "none"])
					.optional()
					.default("none")
					.describe(
						"The automatic recording settings. \n* `local` - Record the meeting locally. \n* `cloud` - Record the meeting to the cloud. \n* `none` - Auto-recording disabled.\n\nThis value defaults to `none`.",
					)
					.meta({ examples: ["cloud"] }),
				host_pause_stop_recording: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host to pause or stop automatic cloud recording for this meeting. Only supported for cloud recording.",
					)
					.meta({ examples: [false] }),
				auto_add_recording_to_video_management: z
					.object({
						enable: z
							.boolean()
							.default(false)
							.describe("Whether to automatically add the meeting recording to video management.")
							.meta({ examples: [true] }),
						channels: z
							.array(
								z.object({
									channel_id: z
										.string()
										.describe("The unique ID of a video management channel.")
										.meta({ examples: ["Uyh5qeykTDiA66YQEYmFPg"] }),
									name: z
										.string()
										.optional()
										.describe("The video management channel's name.")
										.meta({ examples: ["Team Weekly Meetings"] }),
								}),
							)
							.min(1)
							.max(5)
							.optional()
							.describe(
								"List of video management channels where the meeting recording will be added.",
							),
					})
					.optional()
					.describe(
						"Automatically add meeting recordings to a video channel in video management. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					),
				breakout_room: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Set this field's value to `true` to enable the [breakout room pre-assign](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4) option.",
							)
							.meta({ examples: [true] }),
						rooms: z
							.array(
								z.object({
									name: z
										.string()
										.optional()
										.describe("The breakout room's name.")
										.meta({ examples: ["room1"] }),
									participants: z
										.array(z.string())
										.optional()
										.describe(
											"Email addresses of the participants who are to be assigned to the breakout room.",
										),
								}),
							)
							.optional()
							.describe("Create room(s)."),
					})
					.optional()
					.describe(
						"Setting to [pre-assign breakout rooms](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4).",
					),
				calendar_type: z
					.union([z.literal(1), z.literal(2)])
					.optional()
					.describe(
						"The type of calendar integration used to schedule the meeting. \n* `1` - [Zoom Outlook add-in](https://support.zoom.us/hc/en-us/articles/360031592971-Getting-started-with-Outlook-plugin-and-add-in) \n* `2` - [Zoom for Google Workspace add-on](https://support.zoom.us/hc/en-us/articles/360020187492-Using-the-Zoom-for-Google-Workspace-add-on)\n\nWorks with the `private_meeting` field to determine whether to share details of meetings.",
					)
					.meta({ examples: [1] }),
				close_registration: z
					.boolean()
					.optional()
					.default(false)
					.describe("Close registration after the event date.")
					.meta({ examples: [false] }),
				cn_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host the meeting in China.")
					.meta({ examples: [false] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration.")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration.")
					.meta({ examples: ["Jill Chill"] }),
				custom_keys: z
					.array(
						z.object({
							key: z
								.string()
								.max(64)
								.optional()
								.describe("Custom key associated with the user.")
								.meta({ examples: ["key1"] }),
							value: z
								.string()
								.max(256)
								.optional()
								.describe("Value of the custom key associated with the user.")
								.meta({ examples: ["value1"] }),
						}),
					)
					.max(10)
					.optional()
					.describe("Custom keys and values assigned to the meeting."),
				email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Whether to send email notifications to [alternative hosts](https://support.zoom.us/hc/en-us/articles/208220166) and [users with scheduling privileges](https://support.zoom.us/hc/en-us/articles/201362803-Scheduling-privilege). This value defaults to `true`.",
					)
					.meta({ examples: [true] }),
				encryption_type: z
					.enum(["enhanced_encryption", "e2ee"])
					.optional()
					.describe(
						"Choose between enhanced encryption and [end-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871) when starting or a meeting. When using end-to-end encryption, several features such cloud recording and phone/SIP/H.323 dial-in, will be **automatically disabled**.   \n\n`enhanced_encryption` - Enhanced encryption. Encryption is stored in the cloud if you enable this option.   \n \n\n`e2ee` - [End-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871). The encryption key is stored in your local device and can not be obtained by anyone else. Enabling this setting also **disables** the features join before host, cloud recording, streaming, live transcription, breakout rooms, polling, 1:1 private chat, and meeting reactions.",
					)
					.meta({ examples: ["enhanced_encryption"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`. and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: ["example.com"] }),
				focus_mode: z
					.boolean()
					.optional()
					.describe(
						"Whether the [**Focus Mode** feature](https://support.zoom.us/hc/en-us/articles/360061113751-Using-focus-mode) is enabled when the meeting starts.",
					)
					.meta({ examples: [true] }),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries"),
				global_dial_in_numbers: z
					.array(
						z.object({
							city: z
								.string()
								.optional()
								.describe("City of the number, if any, such as Chicago.")
								.meta({ examples: ["New York"] }),
							country: z
								.string()
								.optional()
								.describe("Country code, such as BR.")
								.meta({ examples: ["US"] }),
							country_name: z
								.string()
								.optional()
								.describe("Full name of country, such as Brazil.")
								.meta({ examples: ["US"] }),
							number: z
								.string()
								.optional()
								.describe("Phone number, such as +1 2332357613.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.enum(["toll", "tollfree"])
								.optional()
								.describe("Type of number. ")
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("Global dial-in countries or regions"),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when the host joins the meeting.")
					.meta({ examples: [true] }),
				in_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host meeting in India.")
					.meta({ examples: [false] }),
				jbh_time: z
					.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)])
					.optional()
					.describe(
						"If the value of `join_before_host` field is set to true, use this field to indicate time limits for a participant to join a meeting before a host.\n\n*  `0` - Allow participant to join anytime.\n*  `5` - Allow participant to join 5 minutes before meeting start time.\n * `10` - Allow participant to join 10 minutes before meeting start time.\n * `15` - Allow participant to join 15 minutes before meeting start time.",
					)
					.meta({ examples: [0] }),
				join_before_host: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to join the meeting before the host starts the meeting. Only used for scheduled or recurring meetings.",
					)
					.meta({ examples: [true] }),
				question_and_answer: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.\n\n* `false` - Disable Q&amp;A for meeting.",
							)
							.meta({ examples: [true] }),
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true`: Allow participants to submit questions.\n\n* `false`: Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists..\n\n* `false` - Do not allow anonymous questions.(Not supported for simulive meeting.)",
							)
							.meta({ examples: [true] }),
						question_visibility: z
							.enum(["answered", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view answered questions only or view all questions.\n\n* `answered` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can not click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.",
					),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the meeting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details.\n\n**Note:** This feature is only available for certain Meeting add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the meeting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's sign language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("`true`- Only authenticated users can join meetings.")
					.meta({ examples: [true] }),
				meeting_invitees: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The invitee's email address.")
								.meta({ examples: ["jchil@example.com"] }),
						}),
					)
					.optional()
					.describe("A list of the meeting's invitees."),
				mute_upon_entry: z
					.boolean()
					.optional()
					.default(false)
					.describe("Mute participants upon entry.")
					.meta({ examples: [false] }),
				participant_video: z
					.boolean()
					.optional()
					.describe("Start video when participants join the meeting.")
					.meta({ examples: [false] }),
				private_meeting: z
					.boolean()
					.optional()
					.describe("Whether the meeting is set as private.")
					.meta({ examples: [false] }),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants an email confirmation.\n* `true` - Send a confirmation email.\n* `false` - Do not send a confirmation email.",
					)
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants email notifications about their registration approval, cancellation, or rejection.\n\n* `true` - Send an email notification.\n* `false` - Do not send an email notification.\n\n Set this value to `true` to also use the `registrants_confirmation_email` parameter.",
					)
					.meta({ examples: [true] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration type. Used for recurring meeting with fixed time only.\n `1` - Attendees register once and can attend any of the occurrences.  \n `2` - Attendees need to register for each occurrence to attend.  \n `3` - Attendees register once and can choose one or more occurrences to attend.",
					)
					.meta({ examples: [1] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe(
						"Show social share buttons on the meeting registration page.\nThis setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				use_pmi: z
					.boolean()
					.optional()
					.describe(
						"Whether to use a [Personal Meeting ID (PMI)](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi) for the meeting. This field is only used for scheduled meetings(`2`) and recurring meetings with no fixed time(`3`).",
					)
					.meta({ examples: [false] }),
				waiting_room: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable waiting room.")
					.meta({ examples: [false] }),
				waiting_room_options: z
					.object({
						mode: z
							.enum(["follow_setting", "custom"])
							.describe(
								"The waiting room behavior for this meeting.\r\n* `follow_setting` - Use the Zoom web portal setting.\r\n* `custom` - Specify which participants should go into the waiting room.",
							)
							.meta({ examples: ["follow_setting"] }),
						who_goes_to_waiting_room: z
							.enum([
								"everyone",
								"users_not_in_account",
								"users_not_in_account_or_whitelisted_domains",
								"users_not_on_invite",
								"users_not_in_org",
							])
							.optional()
							.describe(
								"Which participants should be placed into the waiting room. Required if `mode` is set to `custom`.\r\n* `everyone` - Everyone.\r\n* `users_not_in_account` - Users not in your account.\r\n* `users_not_in_account_or_whitelisted_domains` - Users who are not in your account and not part of your whitelisted domains.\r\n* `users_not_on_invite` - Users not on the meeting invite.\r\n* `users_not_in_org` - Users not in your organization.",
							)
							.meta({ examples: ["everyone"] }),
					})
					.optional()
					.describe("Configuration settings for the meeting's waiting room."),
				watermark: z
					.boolean()
					.optional()
					.default(false)
					.describe("Add a watermark when viewing a shared screen.")
					.meta({ examples: [false] }),
				host_save_video_order: z
					.boolean()
					.optional()
					.describe("Whether the **Allow host to save video order** feature is enabled.")
					.meta({ examples: [true] }),
				internal_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as an internal meeting.")
					.meta({ examples: [false] }),
				continuous_meeting_chat: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Enable continuous meeting chat** setting.")
							.meta({ examples: [true] }),
						auto_add_invited_external_users: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Automatically add invited external users** setting.",
							)
							.meta({ examples: [true] }),
						auto_add_meeting_participants: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Automatically add meeting participants** setting.")
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"Information about the **Enable continuous meeting chat** feature. This setting only applies to scheduled and recurring meetings, type `2`, `3`, and `8`. It is **not supported** for type `1` instant meetings or type `10` screen share only meetings.",
					),
				participant_focused_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as a participant focused meeting.")
					.meta({ examples: [false] }),
				push_change_to_calendar: z
					.boolean()
					.optional()
					.describe(
						"Whether to push meeting changes to the calendar. \n\n To enable this feature, configure the **Configure Calendar and Contacts Service** in the user's profile page of the Zoom web portal and enable the **Automatically sync Zoom calendar events information bi-directionally between Zoom and integrated calendars.** setting in the **Settings** page of the Zoom web portal.\n* `true` - Push meeting changes to the calendar.\n* `false` - Do not push meeting changes to the calendar.",
					)
					.meta({ examples: [false] }),
				resources: z
					.array(
						z.object({
							resource_type: z
								.enum(["whiteboard"])
								.optional()
								.describe("The resource type.")
								.meta({ examples: ["whiteboard"] }),
							resource_id: z
								.string()
								.optional()
								.describe("The resource ID.")
								.meta({ examples: ["X4Hy02w3QUOdskKofgb9Jg"] }),
							permission_level: z
								.enum(["editor", "commenter", "viewer"])
								.optional()
								.default("editor")
								.describe(
									"The permission levels for users to access the whiteboard. \n* `editor` - Users with link access can edit the board. \n* `commenter` - Users with link access can comment on the board. \n* `viewer` - Users with link access can view the board.",
								)
								.meta({ examples: ["editor"] }),
						}),
					)
					.optional()
					.describe("The meeting's resources."),
				auto_start_meeting_summary: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to automatically start meeting summary.")
					.meta({ examples: [false] }),
				who_will_receive_summary: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Defines who will receive a summary after this meeting. This field is applicable only when `auto_start_meeting_summary` is set to `true`.\r\n* `1` - Only meeting host.\r\n* `2` - Only meeting host, co-hosts, and alternative hosts.\r\n* `3` - Only meeting host and meeting invitees in our organization.\r\n* `4` - All meeting invitees including those outside of our organization.",
					)
					.meta({ examples: [1] }),
				auto_start_ai_companion_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to automatically start AI Companion questions.")
					.meta({ examples: [false] }),
				who_can_ask_questions: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
					.optional()
					.describe(
						"Defines who can ask questions about this meeting's transcript. This field is applicable only when `auto_start_ai_companion_questions` is set to `true`.\r\n* `1` - All participants and invitees.\r\n* `2` - All participants only from when they join.\r\n* `3` - Only meeting host.\r\n* `4` - Participants and invitees in our organization.\r\n* `5` - Participants in our organization only from when they join.",
					)
					.meta({ examples: [1] }),
				summary_template_id: z
					.string()
					.optional()
					.describe(
						"The summary template ID used to generate a meeting summary based on a predefined template. To get available summary templates, use the **Get user summary templates** API. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.com/hc/en).",
					)
					.meta({ examples: ["1e1356ad"] }),
				device_testing: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable the device testing.")
					.meta({ examples: [false] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				disable_participant_video: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to disable the participant video during a meeting. To enable this feature for your account, [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe(
						"Whether to include authenticated guest's email addresses in meetings' attendee reports.",
					)
					.meta({ examples: [true] }),
				auto_start_deepfake_detection: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start deepfake risk detection. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				prevent_screen_capture: z
					.boolean()
					.optional()
					.describe(
						"Whether to prevent participants from capturing Zoom meeting windows, which may include shared meeting content and chat messages. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
			})
			.optional()
			.describe("Meeting settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe(
				"Meeting start time. When using a format like `yyyy-MM-dd'T'HH:mm:ss'Z'`, always use GMT time. When using a format like `yyyy-MM-dd'T'HH:mm:ss`, use local time and specify the time zone. Only used for scheduled meetings and recurring meetings with a fixed time.",
			)
			.meta({ examples: ["2022-03-25T07:29:29Z"] }),
		sensitivity_label_id: z
			.string()
			.optional()
			.describe(
				"The sensitivity label ID used to apply a sensitivity label to the meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["WAzVaIjFR1Cxd767i9jksw"] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"Unique identifier of the meeting template. \n\n[Schedule the meeting from a meeting template](https://support.zoom.us/hc/en-us/articles/360036559151-Meeting-templates#h_86f06cff-0852-4998-81c5-c83663c176fb). Retrieve this field's value by calling the [List meeting templates](/docs/api/meetings/#tag/templates/get/users/{userId}/meeting_templates) API.",
			)
			.meta({ examples: ["5Cj3ceXoStO6TGOVvIOVPA=="] }),
		timezone: z
			.string()
			.optional()
			.describe(
				"The timezone to assign to the `start_time` value. Only use this field for scheduled or recurring meetings with a fixed time.\n\nFor a list of supported timezones and their formats, see our [timezone list](/docs/api/references/abbreviations/#timezones).",
			)
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.max(200)
			.optional()
			.describe("Meeting topic.")
			.meta({ examples: ["My Meeting"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("Tracking fields type.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("Tracking fields value.")
						.meta({ examples: ["value1"] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8), z.literal(10)])
			.optional()
			.default(2)
			.describe(
				"The type of meeting. \n* `1` - An instant meeting. \n* `2` - A scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `8` - A recurring meeting with fixed time. \n* `10` - A screen share only meeting.",
			)
			.meta({ examples: [2] }),
	})
	.optional()
	.describe("Meeting");

export const getSipDialingWithPasscodePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const getSipDialingWithPasscodeStatus200Schema = z
	.object({
		sip_dialing: z
			.string()
			.optional()
			.describe("The meeting's encoded SIP URI.")
			.meta({ examples: ["9678722567.xxxx....30qonrvgy@zoomcrc.com"] }),
		paid_crc_plan_participant: z
			.boolean()
			.optional()
			.describe("Whether the API caller has a CRC (Conference Room Connector) plan.")
			.meta({ examples: [true] }),
		participant_identifier_code: z
			.string()
			.optional()
			.describe(
				"This value identifies the meeting participant. It is automatically embedded in the SIP URI if the API caller has a CRC (Conference Room Connector) plan.",
			)
			.meta({ examples: ["30qonrvgy"] }),
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe("The number of seconds the encoded SIP URI is valid before it expires.")
			.meta({ examples: [7200] }),
	})
	.describe("Information about the meeting's encoded SIP URI.");

export const getSipDialingWithPasscodeStatus400Schema = z.unknown();

export const getSipDialingWithPasscodeStatus404Schema = z.unknown();

export const getSipDialingWithPasscodeStatus429Schema = z.unknown();

export const getSipDialingWithPasscodeResponseSchema = getSipDialingWithPasscodeStatus200Schema;

export const getSipDialingWithPasscodeErrorSchema = z.union([
	getSipDialingWithPasscodeStatus400Schema,
	getSipDialingWithPasscodeStatus404Schema,
	getSipDialingWithPasscodeStatus429Schema,
]);

export const getSipDialingWithPasscodeBodySchema = z
	.object({
		passcode: z
			.string()
			.optional()
			.describe(
				"If customers desire that a passcode be embedded in the SIP URI dial string, they must supply the passcode. Zoom will not validate the passcode.",
			)
			.meta({ examples: ["xxxx"] }),
	})
	.optional();

export const meetingStatusPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a `long` format integer and not an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingStatusStatus204Schema = z.unknown();

export const meetingStatusStatus400Schema = z.unknown();

export const meetingStatusStatus404Schema = z.unknown();

export const meetingStatusStatus429Schema = z.unknown();

export const meetingStatusResponseSchema = meetingStatusStatus204Schema;

export const meetingStatusErrorSchema = z.union([
	meetingStatusStatus400Schema,
	meetingStatusStatus404Schema,
	meetingStatusStatus429Schema,
]);

export const meetingStatusBodySchema = z
	.object({
		action: z
			.enum(["end", "recover"])
			.optional()
			.describe(
				"`end` - End a meeting.  \n \n`recover` - [Recover](https://support.zoom.us/hc/en-us/articles/360038297111-Recover-a-deleted-meeting) a deleted meeting.\n",
			)
			.meta({ examples: ["recover"] }),
	})
	.optional();

export const pastMeetingDetailsPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) the meeting UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const pastMeetingDetailsStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID).",
		)
		.meta({ examples: [5638296721] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"The meeting's UUID. You must [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) this value if the meeting UUID begins with a `/` character or contains the `//` character.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
	duration: z
		.int()
		.optional()
		.describe("The meeting's duration, in minutes.")
		.meta({ examples: [60] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start date and time.")
		.meta({ examples: ["2021-07-13T21:44:51Z"] }),
	end_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's end date and time.")
		.meta({ examples: ["2021-07-13T23:00:51Z"] }),
	host_id: z
		.string()
		.optional()
		.describe("The host's ID.")
		.meta({ examples: ["x1yCzABCDEfg23HiJKl4mN"] }),
	dept: z
		.string()
		.optional()
		.describe("The meeting host's department.")
		.meta({ examples: ["Developers"] }),
	participants_count: z
		.int()
		.optional()
		.describe("The number of meeting participants.")
		.meta({ examples: [2] }),
	source: z
		.string()
		.optional()
		.describe(
			"Whether the meeting was created directly through Zoom or via an API request: \n* If the meeting was created via an OAuth app, this field returns the OAuth app's name. \n* If the meeting was created via JWT or the Zoom Web Portal, this returns the `Zoom` value.",
		)
		.meta({ examples: ["Zoom"] }),
	topic: z
		.string()
		.optional()
		.describe("The meeting's topic.")
		.meta({ examples: ["My Meeting"] }),
	total_minutes: z
		.int()
		.optional()
		.describe("The total number of minutes attended by the meeting's host and participants.")
		.meta({ examples: [55] }),
	type: z
		.union([
			z.literal(0),
			z.literal(1),
			z.literal(2),
			z.literal(3),
			z.literal(4),
			z.literal(7),
			z.literal(8),
		])
		.optional()
		.describe(
			"The meeting type. \n* `0` - A prescheduled meeting. \n* `1` - An instant meeting. \n* `2` - A scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A [personal meeting room](https://support.zoom.us/hc/en-us/articles/201362843). \n* `7` - A [PAC (personal audio conference)](https://support.zoom.us/hc/en-us/articles/205172455-Hosting-a-Personal-Audio-Conference-PAC-meeting) meeting. \n* `8` - A recurring meeting with a fixed time.",
		)
		.meta({ examples: [1] }),
	user_email: z
		.email()
		.optional()
		.describe("The user's email address.")
		.meta({ examples: ["jchill@example.com"] }),
	user_name: z
		.string()
		.optional()
		.describe("The user's display name.")
		.meta({ examples: ["Jill Chill"] }),
	has_meeting_summary: z
		.boolean()
		.optional()
		.describe("Whether the summary feature was used in the meeting.")
		.meta({ examples: [false] }),
});

export const pastMeetingDetailsStatus400Schema = z.unknown();

export const pastMeetingDetailsStatus404Schema = z.unknown();

export const pastMeetingDetailsStatus429Schema = z.unknown();

export const pastMeetingDetailsResponseSchema = pastMeetingDetailsStatus200Schema;

export const pastMeetingDetailsErrorSchema = z.union([
	pastMeetingDetailsStatus400Schema,
	pastMeetingDetailsStatus404Schema,
	pastMeetingDetailsStatus429Schema,
]);

export const pastMeetingsPathMeetingIdSchema = z.coerce
	.bigint()
	.describe("The past meeting's ID.")
	.meta({ examples: [93398114182] });

export const pastMeetingsQueryFromSchema = z.iso
	.date()
	.optional()
	.describe(
		"Start date in UTC, in yyyy-MM-dd format. This parameter only takes effect when used together with to. For best performance, we recommend querying within a one-month range.",
	)
	.meta({ examples: ["2026-04-02"] });

export const pastMeetingsQueryToSchema = z.iso
	.date()
	.optional()
	.describe(
		"End date in UTC, in yyyy-MM-dd format. This parameter only takes effect when used together with from.",
	)
	.meta({ examples: ["2026-04-02"] });

export const pastMeetingsStatus200Schema = z
	.object({
		meetings: z
			.array(
				z.object({
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time")
						.meta({ examples: ["2022-03-26T05:37:59Z"] }),
					uuid: z
						.string()
						.optional()
						.describe(
							"Meeting UUID. Unique meeting ID. Each meeting instance will generate its own Meeting UUID (i.e., after a meeting ends, a new UUID will be generated for the next instance of the meeting). [Double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a '/'or contains '//' in it.\n\n",
						)
						.meta({ examples: ["Vg8IdgluR5WDeWIkpJlElQ=="] }),
				}),
			)
			.optional()
			.describe("List of ended meeting instances."),
	})
	.describe("List of Meetings");

export const pastMeetingsStatus401Schema = z.unknown();

export const pastMeetingsStatus404Schema = z.unknown();

export const pastMeetingsStatus429Schema = z.unknown();

export const pastMeetingsResponseSchema = pastMeetingsStatus200Schema;

export const pastMeetingsErrorSchema = z.union([
	pastMeetingsStatus401Schema,
	pastMeetingsStatus404Schema,
	pastMeetingsStatus429Schema,
]);

export const pastMeetingParticipantsPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const pastMeetingParticipantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const pastMeetingParticipantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const pastMeetingParticipantsStatus200Schema = z.object({
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
		)
		.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
	page_count: z
		.int()
		.optional()
		.describe("The number of pages returned for the request made.")
		.meta({ examples: [1] }),
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [30] }),
	total_records: z
		.int()
		.optional()
		.describe("The total number of records available across all pages.")
		.meta({ examples: [1] }),
	participants: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe(
						"The participant's universally unique identifier (UUID). This is the same as the user ID if the participant joins the meeting by logging into Zoom. If the participant joins the meeting without logging in, this field returns an empty value.",
					)
					.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
				name: z
					.string()
					.optional()
					.describe("The participant's display name.")
					.meta({ examples: ["Jill Chill"] }),
				user_id: z
					.string()
					.optional()
					.describe(
						"The participant's ID. This is a unique ID assigned to the participant joining a meeting and is valid for that meeting only.",
					)
					.meta({ examples: ["27423744"] }),
				registrant_id: z
					.string()
					.optional()
					.describe(
						"The participant's unique registrant ID. This field only returns if you pass the `registrant_id` value for the `include_fields` query parameter.\n\nThis field does not return if the `type` query parameter is the `live` value.",
					)
					.meta({ examples: ["_f08HhPJS82MIVLuuFaJPg"] }),
				user_email: z
					.string()
					.optional()
					.describe(
						"The participant's email address. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				join_time: z.iso
					.datetime()
					.optional()
					.describe("The participant's join time.")
					.meta({ examples: ["2022-03-23T06:58:09Z"] }),
				leave_time: z.iso
					.datetime()
					.optional()
					.describe("The participant's leave time.")
					.meta({ examples: ["2022-03-23T07:02:28Z"] }),
				duration: z
					.int()
					.optional()
					.describe(
						"The participant's duration in the meeting, in seconds, calculated by subtracting the `leave_time` from the `join_time` for the `user_id`. If the participant leaves and rejoins the same meeting, they are assigned a different `user_id`, and Zoom displays their new duration in a separate object. Because of this, the duration may not reflect the total time the user was in the meeting.",
					)
					.meta({ examples: [259] }),
				failover: z
					.boolean()
					.optional()
					.describe("Whether a failover occurred during the meeting.")
					.meta({ examples: [false] }),
				status: z
					.enum(["in_meeting", "in_waiting_room"])
					.optional()
					.describe(
						"The participant's status.\n* `in_meeting` — In a meeting.\n* `in_waiting_room` — In a waiting room.",
					)
					.meta({ examples: ["in_meeting"] }),
				internal_user: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether the meeting participant is an internal user.")
					.meta({ examples: [false] }),
			}),
		)
		.optional()
		.describe("An array of meeting participant objects."),
});

export const pastMeetingParticipantsStatus400Schema = z.unknown();

export const pastMeetingParticipantsStatus404Schema = z.unknown();

export const pastMeetingParticipantsStatus429Schema = z.unknown();

export const pastMeetingParticipantsResponseSchema = pastMeetingParticipantsStatus200Schema;

export const pastMeetingParticipantsErrorSchema = z.union([
	pastMeetingParticipantsStatus400Schema,
	pastMeetingParticipantsStatus404Schema,
	pastMeetingParticipantsStatus429Schema,
]);

export const listPastMeetingQAPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	);

export const listPastMeetingQAStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in **long** format, represented as int64 data type in JSON, also known as the meeting number.",
		)
		.meta({ examples: [95204914252] }),
	questions: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe(
						"The user's email address. If the user is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"The user's name. If `anonymous` option is enabled for the Q&amp;A, the participant's information is be kept anonymous and the value of `name` field is `Anonymous Attendee`.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe(
									"An answer submitted for the question. The value is 'live answered' if this is a live answer.",
								)
								.meta({ examples: ["Good"] }),
							question: z
								.string()
								.optional()
								.describe("A question asked during the Q&amp;A.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start time.")
		.meta({ examples: ["2022-03-26T06:44:14Z"] }),
	uuid: z
		.string()
		.optional()
		.describe("Meeting UUID.")
		.meta({ examples: ["Bznyg8KZTdCVbQxvS/oZ7w=="] }),
});

export const listPastMeetingQAStatus401Schema = z.unknown();

export const listPastMeetingQAStatus404Schema = z.unknown();

export const listPastMeetingQAStatus429Schema = z.unknown();

export const listPastMeetingQAResponseSchema = listPastMeetingQAStatus200Schema;

export const listPastMeetingQAErrorSchema = z.union([
	listPastMeetingQAStatus401Schema,
	listPastMeetingQAStatus404Schema,
	listPastMeetingQAStatus429Schema,
]);

export const meetingsPathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const meetingsQueryTypeSchema = z
	.enum(["scheduled", "live", "upcoming", "upcoming_meetings", "previous_meetings"])
	.optional()
	.default("scheduled")
	.describe(
		"The meeting type. \n* `scheduled` - All valid previous (unexpired) meetings, live meetings, and upcoming scheduled meetings. \n* `live` - All the ongoing meetings. \n* `upcoming` - All upcoming meetings, including live meetings. \n* `upcoming_meetings` - All upcoming meetings, including live meetings. \n* `previous_meetings` - All valid previous meetings whose scheduled end time has already passed.",
	)
	.meta({ examples: ["scheduled"] });

export const meetingsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const meetingsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const meetingsQueryPageNumberSchema = z
	.int()
	.optional()
	.describe("The page number of the current page in the returned records.")
	.meta({ examples: [1] });

export const meetingsQueryFromSchema = z.iso
	.date()
	.optional()
	.describe("The start date.")
	.meta({ examples: ["2023-01-01"] });

export const meetingsQueryToSchema = z.iso
	.date()
	.optional()
	.describe("The end date.")
	.meta({ examples: ["2023-01-16"] });

export const meetingsQueryTimezoneSchema = z
	.string()
	.optional()
	.describe(
		"The timezone to assign to the `from` and `to` value. For a list of supported timezones and their formats, see our [timezone list](/docs/api/references/abbreviations/#timezones).",
	)
	.meta({ examples: ["America/Los_Angeles"] });

export const meetingsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe("The page number of the current results.")
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [1] }),
	})
	.extend({
		meetings: z
			.array(
				z.object({
					agenda: z
						.string()
						.optional()
						.describe(
							"Meeting description. The length of agenda gets truncated to 250 characters when you list all of a user's meetings. To view a meeting's complete agenda, or to retrieve details for a single meeting, use the [**Get a meeting**](/docs/api-reference/zoom-api/methods#operation/meeting) API.",
						)
						.meta({ examples: ["My Meeting"] }),
					created_at: z.iso
						.datetime()
						.optional()
						.describe("Time of creation.")
						.meta({ examples: ["2022-03-23T05:31:16Z"] }),
					duration: z
						.int()
						.optional()
						.describe("Meeting duration.")
						.meta({ examples: [60] }),
					host_id: z
						.string()
						.optional()
						.describe("ID of the user who is set as the meeting's host.")
						.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
					id: z.coerce
						.bigint()
						.optional()
						.describe("Meeting ID - also known as the meeting number in long (int64) format.")
						.meta({ examples: [97763643886] }),
					join_url: z
						.string()
						.optional()
						.describe("URL using which participants can join a meeting.")
						.meta({ examples: ["https://example.com/j/11111"] }),
					pmi: z
						.string()
						.optional()
						.describe(
							"[Personal meeting ID](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi). This field is only returned if PMI was used to schedule the meeting.",
						)
						.meta({ examples: ["97891943927"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Meeting start time.")
						.meta({ examples: ["2022-03-23T06:00:00Z"] }),
					timezone: z
						.string()
						.optional()
						.describe("Timezone to format the meeting start time.")
						.meta({ examples: ["America/Los_Angeles"] }),
					topic: z
						.string()
						.optional()
						.describe("Meeting topic.")
						.meta({ examples: ["My Meeting"] }),
					type: z
						.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8)])
						.optional()
						.describe(
							"Meeting types.\n `1` - Instant meeting.\n `2` - Scheduled meeting.\n `3` - Recurring meeting with no fixed time.\n `8` - Recurring meeting with fixed time.",
						)
						.meta({ examples: [2] }),
					uuid: z
						.string()
						.optional()
						.describe(
							"Unique Meeting ID. Each meeting instance will generate its own Meeting UUID.",
						)
						.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
				}),
			)
			.optional()
			.describe("List of meeting objects."),
	});

export const meetingsStatus400Schema = z.unknown();

export const meetingsStatus403Schema = z.unknown();

export const meetingsStatus404Schema = z.unknown();

export const meetingsStatus429Schema = z.unknown();

export const meetingsResponseSchema = meetingsStatus200Schema;

export const meetingsErrorSchema = z.union([
	meetingsStatus400Schema,
	meetingsStatus403Schema,
	meetingsStatus404Schema,
	meetingsStatus429Schema,
]);

export const meetingCreatePathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const meetingCreateStatus201Schema = z
	.object({
		assistant_id: z
			.string()
			.optional()
			.describe("The ID of the user who scheduled this meeting on behalf of the host.")
			.meta({ examples: ["kFFvsJc-Q1OSxaJQLvaa_A"] }),
		host_email: z
			.email()
			.optional()
			.describe("The meeting host's email address.")
			.meta({ examples: ["jchill@example.com"] }),
		host_id: z
			.string()
			.optional()
			.describe("The ID of the user who is set as the meeting host.")
			.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
		id: z.coerce
			.bigint()
			.optional()
			.describe(
				"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in **long** format(represented as int64 data type in JSON), also known as the meeting number.",
			)
			.meta({ examples: [92674392836] }),
		uuid: z
			.string()
			.optional()
			.describe(
				"Unique meeting ID. Each meeting instance generates its own meeting UUID - after a meeting ends, a new UUID is generated for the next instance of the meeting. Retrieve a list of UUIDs from past meeting instances using the [**List past meeting instances**](/docs/api/rest/reference/zoom-api/methods#operation/pastMeetings) API. [Double encode](/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.",
			)
			.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
		registration_url: z
			.string()
			.optional()
			.describe(
				"The URL that registrants can use to register for a meeting. This field is only returned for meetings that have enabled registration.",
			)
			.meta({
				examples: ["https://example.com/meeting/register/7ksAkRCoEpt1Jm0wa-E6lICLur9e7Lde5oW6"],
			}),
		agenda: z
			.string()
			.optional()
			.describe("Agenda")
			.meta({ examples: ["My Meeting"] }),
		created_at: z.iso
			.datetime()
			.optional()
			.describe("The date and time when this meeting was created.")
			.meta({ examples: ["2022-03-25T07:29:29Z"] }),
		duration: z
			.int()
			.optional()
			.describe("The meeting duration.")
			.meta({ examples: [60] }),
		encrypted_password: z
			.string()
			.optional()
			.describe("Encrypted passcode for third party endpoints (H323/SIP).")
			.meta({ examples: ["8pEkRweVXPV3Ob2KJYgFTRlDtl1gSn.1"] }),
		pstn_password: z
			.string()
			.optional()
			.describe(
				"Passcode for participants to join the meeting via [PSTN](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference).",
			)
			.meta({ examples: ["123456"] }),
		h323_password: z
			.string()
			.optional()
			.describe("H.323/SIP room system passcode")
			.meta({ examples: ["123456"] }),
		join_url: z
			.string()
			.optional()
			.describe(
				"URL for participants to join the meeting. This URL should only be shared with users that you would like to invite for the meeting.",
			)
			.meta({ examples: ["https://example.com/j/11111"] }),
		chat_join_url: z
			.string()
			.optional()
			.describe("The URL to join the chat.")
			.meta({ examples: ["https://example.com/launch/jc/11111"] }),
		occurrences: z
			.array(
				z.object({
					duration: z
						.int()
						.optional()
						.describe("Duration.")
						.meta({ examples: [60] }),
					occurrence_id: z
						.string()
						.optional()
						.describe(
							"Occurrence ID. The unique identifier for an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences.",
						)
						.meta({ examples: ["1648194360000"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time.")
						.meta({ examples: ["2022-03-25T07:46:00Z"] }),
					status: z
						.enum(["available", "deleted"])
						.optional()
						.describe(
							"Occurrence status. \n `available` - Available occurrence.  \n `deleted` -  Deleted occurrence.",
						)
						.meta({ examples: ["available"] }),
				}),
			)
			.optional()
			.describe("Array of occurrence objects."),
		password: z
			.string()
			.optional()
			.describe(
				"The meeting passcode. By default, it can be up to 10 characters in length and may contain alphanumeric characters as well as special characters such as !, @, #, etc.",
			)
			.meta({ examples: ["123456"] }),
		pmi: z
			.string()
			.optional()
			.describe(
				"[Personal meeting ID (PMI)](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi). Only used for scheduled meetings and recurring meetings with no fixed time.",
			)
			.meta({ examples: ["97891943927"] }),
		pre_schedule: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether the prescheduled meeting was created via the [GSuite app](https://support.zoom.us/hc/en-us/articles/360020187492-Zoom-for-GSuite-add-on). This only supports the meeting `type` value of `2` (scheduled meetings) and `3` (recurring meetings with no fixed time). \n* `true` - A GSuite prescheduled meeting. \n* `false` - A regular meeting.",
			)
			.meta({ examples: [false] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select the final date when the meeting will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"Select how many times the meeting should recur before it is canceled. If `end_times` is set to 0, it means there is no end time. The maximum number of recurring is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.default(1)
					.describe(
						"Use this field only if you're scheduling a recurring meeting of type `3` to state the day in a month when the meeting should recur. The value range is from 1 to 31.\n\nFor instance, if you would like the meeting to recur on 23rd of each month, provide `23` as this field's value and `1` as the `repeat_interval` field's value. Instead, to have the meeting recur every three months on 23rd of the month, change the value of the `repeat_interval` field to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state the week of the month when the meeting should recur. If you use this field, you must also use the `monthly_week_day` field to state the day of the week when the meeting should recur.   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state a specific day in a week when the monthly meeting should recur. To use this field, you must also use the `monthly_week` field. \n\n  \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval for the meeting to recur. For instance, to schedule a meeting that recurs every two months, set this field's value to `2` and the value of the `type` parameter as `3`. \n\nFor a daily meeting, the maximum interval you can set is `99` days. For a weekly meeting the maximum interval that you can set is  of `50` weeks. For a monthly meeting, there is a maximum of `10` months.\n\n",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe("Recurrence meeting types.\n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.")
					.meta({ examples: [1] }),
				weekly_days: z
					.enum(["1", "2", "3", "4", "5", "6", "7"])
					.optional()
					.default("1")
					.describe(
						"This field is required **if you're scheduling a recurring meeting of type** `2` to state the days of the week when the meeting should repeat.\n \n  This field's value could be a number between `1` to `7` in string format. For instance, if the meeting should recur on Sunday, provide `1` as this field's value.  \n   \n  **Note:** If you would like the meeting to occur on multiple days of a week, provide comma separated values for this field. For instance, if the meeting should recur on Sundays and Tuesdays, provide `1,3` as this field's value.\n\n   \n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a meeting with type `8`, a recurring meeting with fixed time. ",
			),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add additional meeting [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe(
						"Allow attendees to join the meeting from multiple devices. This setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe(
						"A semicolon-separated list of the meeting's alternative hosts' email addresses or IDs.",
					)
					.meta({ examples: ["jchill@example.com;thill@example.com"] }),
				alternative_hosts_email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Flag to determine whether to send email notifications to alternative hosts, default value is true.",
					)
					.meta({ examples: [true] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				alternative_host_manage_meeting_summary: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting summaries.")
					.meta({ examples: [true] }),
				alternative_host_manage_cloud_recording: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting cloud recordings.")
					.meta({ examples: [false] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"Enable registration and set approval for the registration. Note that this feature requires the host to be of **Licensed** user type. **Registration cannot be enabled for a basic user.**   \n   \n \n\n`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				approved_or_denied_countries_or_regions: z
					.object({
						approved_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries or regions from where participants can join this meeting. ",
							),
						denied_list: z
							.array(z.string())
							.optional()
							.describe(
								"List of countries or regions from where participants can not join this meeting. ",
							),
						enable: z
							.boolean()
							.optional()
							.describe(
								"`true` - Setting enabled to either allow users or block users from specific regions to join your meetings.   \n \n\n`false` - Setting disabled.",
							)
							.meta({ examples: [true] }),
						method: z
							.enum(["approve", "deny"])
							.optional()
							.describe(
								"Specify whether to allow users from specific regions to join this meeting; or block users from specific regions from joining this meeting.   \n   \n \n`approve`: Allow users from specific regions/countries to join this meeting. If this setting is selected, the approved regions/countries must be included in the `approved_list`.  \n   \n \n`deny`: Block users from specific regions/countries from joining this meeting. If this setting is selected, the approved regions/countries must be included in the `denied_list`",
							)
							.meta({ examples: ["approve"] }),
					})
					.optional()
					.describe(
						"Approve or block users from specific regions or countries from joining this meeting. \n",
					),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe(
						"Determine how participants can join the audio portion of the meeting.  \n `both` - Both Telephony and VoIP.  \n `telephony` - Telephony only.  \n `voip` - VoIP only.  \n `thirdParty` - Third party audio conference.",
					)
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference info.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [Sign Into Zoom with Specified Domains](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_exception: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The participant's email address.")
								.meta({ examples: ["jchill@example.com"] }),
							name: z
								.string()
								.optional()
								.describe("The participant's name.")
								.meta({ examples: ["Jill Chill"] }),
							join_url: z
								.string()
								.optional()
								.describe("URL for participants to join the meeting.")
								.meta({ examples: ["https://example.com/s/11111"] }),
						}),
					)
					.optional()
					.describe(
						"The participants added here will receive unique meeting invite links and bypass authentication.",
					),
				authentication_name: z
					.string()
					.optional()
					.describe(
						"Authentication name set in the [authentication profile](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f).",
					)
					.meta({ examples: ["Sign in to Zoom"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Meeting authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.enum(["local", "cloud", "none"])
					.optional()
					.default("none")
					.describe(
						"The automatic recording settings. \n* `local` - Record the meeting locally. \n* `cloud` - Record the meeting to the cloud. \n* `none` - Auto-recording disabled.\n\nThis value defaults to `none`.",
					)
					.meta({ examples: ["cloud"] }),
				host_pause_stop_recording: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host to pause or stop automatic cloud recording for this meeting. Only supported for cloud recording.",
					)
					.meta({ examples: [false] }),
				auto_add_recording_to_video_management: z
					.object({
						enable: z
							.boolean()
							.default(false)
							.describe("Whether to automatically add the meeting recording to video management.")
							.meta({ examples: [true] }),
						channels: z
							.array(
								z.object({
									channel_id: z
										.string()
										.describe("The unique ID of a video management channel.")
										.meta({ examples: ["Uyh5qeykTDiA66YQEYmFPg"] }),
									name: z
										.string()
										.optional()
										.describe("The name of the video management channel.")
										.meta({ examples: ["Team Weekly Meetings"] }),
								}),
							)
							.min(1)
							.max(5)
							.optional()
							.describe(
								"List of video management channels where the meeting recording will be added.",
							),
					})
					.optional()
					.describe(
						"Automatically add meeting recordings to a video channel in Video Management. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					),
				breakout_room: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Set this field's value to `true` to enable the [breakout room pre-assign](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4) option.",
							)
							.meta({ examples: [true] }),
						rooms: z
							.array(
								z.object({
									name: z
										.string()
										.optional()
										.describe("The breakout room's name.")
										.meta({ examples: ["room1"] }),
									participants: z
										.array(z.string())
										.optional()
										.describe(
											"Email addresses of the participants who are to be assigned to the breakout room.",
										),
								}),
							)
							.optional()
							.describe("Create a room or rooms."),
					})
					.optional()
					.describe(
						"Setting to [pre-assign breakout rooms](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms#h_36f71353-4190-48a2-b999-ca129861c1f4).",
					),
				calendar_type: z
					.union([z.literal(1), z.literal(2)])
					.optional()
					.describe(
						"The type of calendar integration used to schedule the meeting. \n* `1` - [Zoom Outlook add-in](https://support.zoom.us/hc/en-us/articles/360031592971-Getting-started-with-Outlook-plugin-and-add-in) \n* `2` - [Zoom for Google Workspace add-on](https://support.zoom.us/hc/en-us/articles/360020187492-Using-the-Zoom-for-Google-Workspace-add-on)\n\nWorks with the `private_meeting` field to determine whether to share details of meetings or not.",
					)
					.meta({ examples: [1] }),
				close_registration: z
					.boolean()
					.optional()
					.default(false)
					.describe("Close registration after event date.")
					.meta({ examples: [false] }),
				cn_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host meeting in China.")
					.meta({ examples: [false] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration")
					.meta({ examples: ["Jill Chill"] }),
				custom_keys: z
					.array(
						z.object({
							key: z
								.string()
								.max(64)
								.optional()
								.describe("Custom key associated with the user.")
								.meta({ examples: ["key1"] }),
							value: z
								.string()
								.max(256)
								.optional()
								.describe("Value of the custom key associated with the user.")
								.meta({ examples: ["value1"] }),
						}),
					)
					.max(10)
					.optional()
					.describe("Custom keys and values assigned to the meeting."),
				email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Whether to send email notifications to [alternative hosts](https://support.zoom.us/hc/en-us/articles/208220166) and [users with scheduling privileges](https://support.zoom.us/hc/en-us/articles/201362803-Scheduling-privilege). This value defaults to `true`.",
					)
					.meta({ examples: [true] }),
				encryption_type: z
					.enum(["enhanced_encryption", "e2ee"])
					.optional()
					.describe(
						"Choose between enhanced encryption and [end-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871) when starting or a meeting. When using end-to-end encryption, several features (e.g. cloud recording, phone/SIP/H.323 dial-in) will be **automatically disabled**.\n \n`enhanced_encryption` - Enhanced encryption. Encryption is stored in the cloud if you enable this option.   \n \n\n`e2ee` - [End-to-end encryption](https://support.zoom.us/hc/en-us/articles/360048660871). The encryption key is stored in your local device and can not be obtained by anyone else. Enabling this setting also **disables** the join before host, cloud recording, streaming, live transcription, breakout rooms, polling, 1:1 private chat, and meeting reactions features.",
					)
					.meta({ examples: ["enhanced_encryption"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**    \n   \n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the meeting.",
					)
					.meta({ examples: ["example.com"] }),
				focus_mode: z
					.boolean()
					.optional()
					.describe(
						"Whether the [**Focus Mode** feature](https://support.zoom.us/hc/en-us/articles/360061113751-Using-focus-mode) is enabled when the meeting starts.",
					)
					.meta({ examples: [true] }),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries."),
				global_dial_in_numbers: z
					.array(
						z.object({
							city: z
								.string()
								.optional()
								.describe("City of the number, such as Chicago.")
								.meta({ examples: ["New York"] }),
							country: z
								.string()
								.optional()
								.describe("The country code, such as BR.")
								.meta({ examples: ["US"] }),
							country_name: z
								.string()
								.optional()
								.describe("Full name of country, such as Brazil.")
								.meta({ examples: ["US"] }),
							number: z
								.string()
								.optional()
								.describe("A phone number, such as +1 2332357613.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.enum(["toll", "tollfree"])
								.optional()
								.describe("Type of number.")
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("Global dial-in countries or regions."),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when the host joins the meeting.")
					.meta({ examples: [true] }),
				in_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Host meeting in India.")
					.meta({ examples: [false] }),
				jbh_time: z
					.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)])
					.optional()
					.describe(
						"If the value of `join_before_host` field is set to `true`, use this field to indicate time limits when a participant may join a meeting before a host.\n\n*  `0` - Allow participant to join anytime.\n*  `5`- Allow participant to join 5 minutes before meeting start time.\n * `10` - Allow participant to join 10 minutes before meeting start time.\n* `15` - Allow the participant to join 15 minutes before the meeting's start time.",
					)
					.meta({ examples: [0] }),
				join_before_host: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to join the meeting before the host starts the meeting. Only used for scheduled or recurring meetings.",
					)
					.meta({ examples: [true] }),
				question_and_answer: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.\n\n* `false` - Disable Q&amp;A for meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true`: Allow participants to submit questions.\n\n* `false`: Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists..\n\n* `false` - Do not allow anonymous questions.(Not supported for simulive meeting.)",
							)
							.meta({ examples: [true] }),
						question_visibility: z
							.enum(["answered", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view answered questions only or view all questions.\n\n* `answered` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can not click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.",
					),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details.\n\n**Note:** This feature is only available for certain Meeting add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's sign language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("`true` - Only authenticated users can join meetings.")
					.meta({ examples: [true] }),
				mute_upon_entry: z
					.boolean()
					.optional()
					.default(false)
					.describe("Mute participants upon entry.")
					.meta({ examples: [false] }),
				participant_video: z
					.boolean()
					.optional()
					.describe("Start video when participants join the meeting.")
					.meta({ examples: [false] }),
				private_meeting: z
					.boolean()
					.optional()
					.describe("Whether the meeting is set as private.")
					.meta({ examples: [false] }),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants an email confirmation.\n* `true` - Send a confirmation email.\n* `false` - Do not send a confirmation email.",
					)
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants email notifications about their registration approval, cancellation, or rejection.\n\n* `true` - Send an email notification.\n* `false` - Do not send an email notification.\n\n Set this value to `true` to also use the `registrants_confirmation_email` parameter.",
					)
					.meta({ examples: [true] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration type. Used for recurring meeting with fixed time only. \n `1` - Attendees register once and can attend any of the occurrences.  \n `2` - Attendees need to register for each occurrence to attend.  \n `3` - Attendees register once and can choose one or more occurrences to attend.",
					)
					.meta({ examples: [1] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe(
						"Show social share buttons on the meeting registration page.\nThis setting only works for meetings that require [registration](https://support.zoom.us/hc/en-us/articles/211579443-Setting-up-registration-for-a-meeting).",
					)
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the meeting's join information on the registration confirmation page. This setting is only applied to meetings with registration enabled.",
					)
					.meta({ examples: [true] }),
				use_pmi: z
					.boolean()
					.optional()
					.describe(
						"Whether to use a [Personal Meeting ID (PMI)](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi) for the meeting. This field is only used for scheduled meetings(`2`) and recurring meetings with no fixed time(`3`). If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				waiting_room: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable the waiting room.")
					.meta({ examples: [false] }),
				waiting_room_options: z
					.object({
						mode: z
							.enum(["follow_setting", "custom"])
							.describe(
								"The waiting room behavior for this meeting.\r\n* `follow_setting` - Use the Zoom web portal setting.\r\n* `custom` - Specify which participants should go into the waiting room.",
							)
							.meta({ examples: ["follow_setting"] }),
						who_goes_to_waiting_room: z
							.enum([
								"everyone",
								"users_not_in_account",
								"users_not_in_account_or_whitelisted_domains",
								"users_not_on_invite",
								"users_not_in_org",
							])
							.optional()
							.describe(
								"Which participants should be placed into the waiting room. Required if `mode` is set to `custom`.\r\n* `everyone` - Everyone.\r\n* `users_not_in_account` - Users not in your account.\r\n* `users_not_in_account_or_whitelisted_domains` - Users who are not in your account and not part of your whitelisted domains.\r\n* `users_not_on_invite` - Users not on the meeting invite.\r\n* `users_not_in_org` - Users not in your organization.",
							)
							.meta({ examples: ["everyone"] }),
					})
					.optional()
					.describe("Configuration settings for the meeting's waiting room."),
				watermark: z
					.boolean()
					.optional()
					.describe(
						"Whether to add a watermark when viewing a shared screen. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				host_save_video_order: z
					.boolean()
					.optional()
					.describe("Whether the **Allow host to save video order** feature is enabled.")
					.meta({ examples: [true] }),
				internal_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as an internal meeting.")
					.meta({ examples: [false] }),
				meeting_invitees: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The invitee's email address.")
								.meta({ examples: ["jchill@example.com"] }),
						}),
					)
					.optional()
					.describe("A list of the meeting's invitees."),
				continuous_meeting_chat: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Enable continuous meeting chat** setting. The default value is based on user settings. When the **Enable continuous meeting chat** setting is enabled, the default value is true. When the setting is disabled, the default value is false.",
							)
							.meta({ examples: [true] }),
						auto_add_invited_external_users: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Automatically add invited external users** setting.",
							)
							.meta({ examples: [true] }),
						auto_add_meeting_participants: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Automatically add meeting participants** setting.")
							.meta({ examples: [true] }),
						channel_id: z
							.string()
							.optional()
							.describe("The channel's ID.")
							.meta({ examples: ["cabc1234567defghijkl01234"] }),
					})
					.optional()
					.describe(
						"Information about the **Enable continuous meeting chat** feature. This setting only applies to scheduled and recurring meetings (type `2`, `3`, and `8`). It is **not supported** for type `1` instant meetings or type `10` screen share only meetings.",
					),
				participant_focused_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as a participant focused meeting.")
					.meta({ examples: [false] }),
				push_change_to_calendar: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to push meeting changes to the calendar. \n\n To enable this feature, configure the **Configure Calendar and Contacts Service** in the user's profile page of the Zoom web portal and enable the **Automatically sync Zoom calendar events information bi-directionally between Zoom and integrated calendars.** setting in the **Settings** page of the Zoom web portal.\n* `true` - Push meeting changes to the calendar.\n* `false` - Do not push meeting changes to the calendar.",
					)
					.meta({ examples: [false] }),
				resources: z
					.array(
						z.object({
							resource_type: z
								.enum(["whiteboard"])
								.optional()
								.describe("The resource type.")
								.meta({ examples: ["whiteboard"] }),
							resource_id: z
								.string()
								.optional()
								.describe("The resource ID.")
								.meta({ examples: ["X4Hy02w3QUOdskKofgb9Jg"] }),
							permission_level: z
								.enum(["editor", "commenter", "viewer"])
								.optional()
								.default("editor")
								.describe(
									"The permission levels for users to access the whiteboard. \n* `editor` - Users with link access can edit the board. \n* `commenter` - Users with link access can comment on the board. \n* `viewer` - Users with link access can view the board.",
								)
								.meta({ examples: ["editor"] }),
						}),
					)
					.optional()
					.describe("The meeting's resources."),
				auto_start_meeting_summary: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start a meeting summary. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				who_will_receive_summary: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Defines who will receive a summary after this meeting. This field is applicable only when `auto_start_meeting_summary` is set to `true`.\r\n* `1` - Only meeting host.\r\n* `2` - Only meeting host, co-hosts, and alternative hosts.\r\n* `3` - Only meeting host and meeting invitees in our organization.\r\n* `4` - All meeting invitees including those outside of our organization. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [1] }),
				auto_start_ai_companion_questions: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start AI Companion questions. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				who_can_ask_questions: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
					.optional()
					.describe(
						"Defines who can ask questions about this meeting's transcript. This field is applicable only when `auto_start_ai_companion_questions` is set to `true`.\r\n* `1` - All participants and invitees.\r\n* `2` - All participants only from when they join.\r\n* `3` - Only meeting host.\r\n* `4` - Participants and invitees in our organization.\r\n* `5` - Participants in our organization only from when they join. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [1] }),
				summary_template_id: z
					.string()
					.optional()
					.describe(
						"The summary template ID used to generate a meeting summary based on a predefined template. To get available summary templates, use the **Get user summary templates** API. If not provided, the default value will be based on the user's setting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.com/hc/en).",
					)
					.meta({ examples: ["1e1356ad"] }),
				device_testing: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable the device testing.")
					.meta({ examples: [false] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. If not provided, the default value will be based on the user's setting. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				disable_participant_video: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to disable the participant video during meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe(
						"Whether to include authenticated guest's email addresses in meetings' attendee reports.",
					)
					.meta({ examples: [true] }),
				auto_start_deepfake_detection: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start deepfake risk detection. If not provided, the default value will be based on the user's setting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				prevent_screen_capture: z
					.boolean()
					.optional()
					.describe(
						"Whether to prevent participants from capturing Zoom meeting windows, which may include shared meeting content and chat messages. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
			})
			.optional()
			.describe("Meeting settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe("Meeting start date-time in UTC/GMT, such as `2020-03-31T12:02:00Z`.")
			.meta({ examples: ["2022-03-25T07:29:29Z"] }),
		start_url: z
			.string()
			.optional()
			.describe(
				"URL to start the meeting. This URL should only be used by the host of the meeting and **should not be shared with anyone other than the host** of the meeting, since anyone with this URL will be able to log in to the Zoom Client as the host of the meeting.",
			)
			.meta({ examples: ["https://example.com/s/12345678901?zak=example_zak_token"] }),
		status: z
			.enum(["waiting", "started"])
			.optional()
			.describe(
				"The meeting status.\n* `waiting` - The meeting has not started.\n* `started` - The meeting is currently in progress.",
			)
			.meta({ examples: ["waiting"] }),
		sensitivity_label_id: z
			.string()
			.optional()
			.describe(
				"The sensitivity label ID used to apply a sensitivity label to the meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["WAzVaIjFR1Cxd767i9jksw"] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The account admin meeting template ID used to schedule a meeting using a [meeting template](https://support.zoom.us/hc/en-us/articles/360036559151-Meeting-templates). For a list of account admin-provided meeting templates, use the [**List meeting templates**](/docs/api-reference/zoom-api/methods#operation/listMeetingTemplates) API. \n* At this time, this field **only** accepts account admin meeting template IDs. \n* To enable the account admin meeting templates feature, [contact Zoom support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["Dv4YdINdTk+Z5RToadh5ug=="] }),
		timezone: z
			.string()
			.optional()
			.describe("Timezone to format `start_time`.")
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.max(200)
			.optional()
			.describe("Meeting topic.")
			.meta({ examples: ["My Meeting"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("The tracking field's label.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("The tracking field's value.")
						.meta({ examples: ["value1"] }),
					visible: z
						.boolean()
						.optional()
						.describe(
							"Indicates whether the [tracking field](https://support.zoom.us/hc/en-us/articles/115000293426-Scheduling-Tracking-Fields) is visible in the meeting scheduling options in the Zoom Web Portal or not.\n\n`true`: Tracking field is visible.   \n \n\n`false`: Tracking field is not visible to the users in the meeting options in the Zoom Web Portal but the field was used while scheduling this meeting via API. An invisible tracking field can be used by users while scheduling meetings via API only. ",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8), z.literal(10)])
			.optional()
			.default(2)
			.describe(
				"The meeting type.\n* `1` - An instant meeting. \n* `2` - A scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `8` - A recurring meeting with fixed time. \n* `10` - A screen share only meeting.",
			)
			.meta({ examples: [2] }),
		dynamic_host_key: z
			.string()
			.optional()
			.describe("The meeting dynamic host key.")
			.meta({ examples: ["123456"] }),
		creation_source: z
			.enum(["other", "open_api", "web_portal"])
			.optional()
			.describe(
				"The platform through which the meeting was created.\n* `other` - Created through another platform.\n* `open_api` - Created through Open API.\n* `web_portal` - Created through the web portal.",
			)
			.meta({ examples: ["open_api"] }),
	})
	.describe("Meeting object.");

export const meetingCreateStatus400Schema = z.unknown();

export const meetingCreateStatus404Schema = z.unknown();

export const meetingCreateStatus429Schema = z.unknown();

export const meetingCreateResponseSchema = meetingCreateStatus201Schema;

export const meetingCreateErrorSchema = z.union([
	meetingCreateStatus400Schema,
	meetingCreateStatus404Schema,
	meetingCreateStatus429Schema,
]);

export const meetingCreateBodySchema = z
	.object({
		agenda: z
			.string()
			.max(2000)
			.optional()
			.describe("The meeting's agenda. This value has a maximum length of 2,000 characters.")
			.meta({ examples: ["My Meeting"] }),
		default_password: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether to automatically generate a passcode for the meeting when no passcode is provided and the user's **Require a passcode when scheduling new meetings** setting is enabled. Defaults to `true`. When set to `false`, meetings will only have a passcode if one is explicitly provided.",
			)
			.meta({ examples: [true] }),
		duration: z
			.int()
			.min(1)
			.max(1440)
			.optional()
			.default(60)
			.describe(
				"The meeting's scheduled duration, in minutes. This field is used for `2` scheduled meetings and `8` recurring meetings with a fixed time. The value must be between 1 and 1440 minutes, which is equivalent to 24 hours.",
			)
			.meta({ examples: [60] }),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"The meeting passcode. By default, it can be up to 10 characters in length and may contain alphanumeric characters as well as special characters such as !, @, #, etc.\n\n**Note**:\n- If the account owner or administrator has configured [Passcode Requirement](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063160#h_a427384b-e383-4f80-864d-794bf0a37604), the passcode **must** meet those requirements. You can retrieve the requirements using the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API or the [**Get account settings**](/docs/api/accounts/#tag/accounts/GET/accounts/{accountId}/settings) API.\n- If the **Require a passcode when scheduling new meetings** user setting is enabled and `default_password` is not explicitly set to `false`, a passcode will be automatically generated when one is not provided.\n- If the **Require a passcode when scheduling new meetings** setting is enabled and [locked](https://support.zoom.us/hc/en-us/articles/115005269866-Using-Tiered-Settings#locked) for the user, a passcode will be automatically generated when one is not provided.",
			)
			.meta({ examples: ["123456"] }),
		pre_schedule: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether to create a prescheduled meeting via the [GSuite app](https://support.zoom.us/hc/en-us/articles/360020187492-Zoom-for-GSuite-add-on). This **only** supports the meeting `type` value of `2` scheduled meetings and `3` recurring meetings with no fixed time. \n* `true` - Create a prescheduled meeting. \n* `false` - Create a regular meeting.",
			)
			.meta({ examples: [false] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"This field selects the final date when the meeting will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"This field selects how many times the meeting should recur before it is canceled. If `end_times` is set to 0, it means there is no end time. The maximum number of recurring is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.default(1)
					.describe(
						"This field is **only** for scheduling a **recurring meeting of type `3`**. It states the day in a month when the meeting should recur. The value range is from `1` to `31`.\n\nFor the meeting to recur on 23rd of each month, provide `23` as this field's value and `1` as the `repeat_interval` field's value. To have the meeting recur every three months on 23rd of the month, change the `repeat_interval` field value to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"This field is **only if** for scheduling a **recurring meeting of type `3`**.  It states the week of the month when the meeting should recur. If you use this field, you must also use the `monthly_week_day` field to state the day of the week when the meeting should recur.   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"This field is **only if** for scheduling a **recurring meeting of type `3`**. It states a specific day in a week when the monthly meeting should recur. To use this field, you must also use the `monthly_week` field. \n\n  \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"This field defines the interval when the meeting should recur. For instance, to schedule a meeting that recurs every two months, set this field's value as `2` and the value of the `type` parameter as `3`. \n\nFor a daily meeting, the maximum number of recurrences is `99` days. For a weekly meeting, the maximum is `50` weeks. For a monthly meeting, the maximum is `10` months.\n\n",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe(
						"The recurrence meeting types.\n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.",
					)
					.meta({ examples: [1] }),
				weekly_days: z
					.enum(["1", "2", "3", "4", "5", "6", "7"])
					.optional()
					.default("1")
					.describe(
						"This field is **required** if you're scheduling a recurring meeting of type `2`. It states the days of the week when the meeting should repeat. \n\nThis field's value could be a number between `1` to `7` in string format. For instance, if the meeting should recur on Sunday, provide `1` as this field's value.  \n\n**Note:** To set the meeting to occur on multiple days of a week, provide comma separated values for this field. For instance, if the meeting should recur on Sundays and Tuesdays, provide `1,3` as this field's value.\n\n   \n `1` - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"The recurrence object. Use this object only for a meeting with type `8`, a recurring meeting with a fixed time. ",
			),
		schedule_for: z
			.string()
			.optional()
			.describe("The email address or user ID of the user to schedule a meeting for.")
			.meta({ examples: ["jchill@example.com"] }),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"This field adds additional meeting [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow attendees to join a meeting from multiple devices. This setting is only applied to meetings with registration enabled.",
					)
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe(
						"A semicolon-separated list of the meeting's alternative hosts' email addresses or IDs.",
					)
					.meta({ examples: ["jchill@example.com;thill@example.com"] }),
				alternative_hosts_email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Whether to send email notifications to alternative hosts. This value defaults to `true`.",
					)
					.meta({ examples: [true] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"Enable meeting registration approval.\n* `0` - Automatically approve registration.\n* `1` - Manually approve registration.\n* `2` - No registration required.\n\nThis value defaults to `2`.",
					)
					.meta({ examples: [2] }),
				approved_or_denied_countries_or_regions: z
					.object({
						approved_list: z
							.array(z.string())
							.optional()
							.describe("The list of approved countries or regions."),
						denied_list: z
							.array(z.string())
							.optional()
							.describe("The list of blocked countries or regions."),
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the [**Approve or block entry for users from specific countries/regions**](https://support.zoom.us/hc/en-us/articles/360060086231-Approve-or-block-entry-for-users-from-specific-countries-regions) setting.",
							)
							.meta({ examples: [true] }),
						method: z
							.enum(["approve", "deny"])
							.optional()
							.describe(
								"Whether to allow or block users from specific countries or regions.\n* `approve` - Allow users from specific countries or regions to join the meeting. If you select this setting, include the approved countries or regions in the `approved_list` field. \n* `deny` - Block users from specific countries or regions from joining the meeting. If you select this setting, include the blocked countries or regions in the `denied_list` field.",
							)
							.meta({ examples: ["approve"] }),
					})
					.optional()
					.describe(
						"The list of approved or blocked users from specific countries or regions who can join the meeting.",
					),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe(
						"How participants join the audio portion of the meeting.\n* `both` - Both telephony and VoIP. \n* `telephony` - Telephony only. \n* `voip` - VoIP only. \n* `thirdParty` - Third party audio conference.",
					)
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference information.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"The meeting's authenticated domains. Only Zoom users whose email address contains an authenticated domain can join the meeting. Comma-separate multiple domains or use a wildcard for listing domains.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_exception: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The participant's email address.")
								.meta({ examples: ["jchill@example.com"] }),
							name: z
								.string()
								.optional()
								.describe("The participant's name.")
								.meta({ examples: ["Jill Chill"] }),
						}),
					)
					.optional()
					.describe(
						"A list of participants who can bypass meeting authentication. These participants will receive a unique meeting invite.",
					),
				authentication_option: z
					.string()
					.optional()
					.describe(
						"If the `meeting_authentication` value is `true`, the type of authentication required for users to join a meeting.\n\nTo get this value, use the `authentication_options` array's `id` value in the [**Get user settings**](/docs/api-reference/zoom-api/methods#operation/userSettings) API response.",
					)
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.enum(["local", "cloud", "none"])
					.optional()
					.default("none")
					.describe(
						"The automatic recording settings. \n* `local` - Record the meeting locally. \n* `cloud` - Record the meeting to the cloud. \n* `none` - Auto-recording disabled.\n\nThis value defaults to `none`.",
					)
					.meta({ examples: ["cloud"] }),
				host_pause_stop_recording: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host to pause or stop automatic cloud recording for this meeting. Only supported for cloud recording.",
					)
					.meta({ examples: [false] }),
				auto_add_recording_to_video_management: z
					.object({
						enable: z
							.boolean()
							.default(false)
							.describe("Whether to automatically add the meeting recording to video management.")
							.meta({ examples: [true] }),
						channels: z
							.array(
								z.object({
									channel_id: z
										.string()
										.describe("The unique ID of a video management channel.")
										.meta({ examples: ["Uyh5qeykTDiA66YQEYmFPg"] }),
									name: z
										.string()
										.optional()
										.describe("The name of the video management channel.")
										.meta({ examples: ["Team Weekly Meetings"] }),
								}),
							)
							.min(1)
							.max(5)
							.optional()
							.describe(
								"List of video management channels where the meeting recording will be added.",
							),
					})
					.optional()
					.describe(
						"Automatically add meeting recordings to a video channel in video management. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					),
				breakout_room: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the [**Breakout Room pre-assign**](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms) option.",
							)
							.meta({ examples: [true] }),
						rooms: z
							.array(
								z.object({
									name: z
										.string()
										.optional()
										.describe("The breakout room's name.")
										.meta({ examples: ["room1"] }),
									participants: z
										.array(z.string())
										.optional()
										.describe(
											"The email addresses of the participants to assign to the breakout room.",
										),
								}),
							)
							.optional()
							.describe("Information about the breakout rooms."),
					})
					.optional()
					.describe(
						"The [pre-assigned breakout rooms](https://support.zoom.us/hc/en-us/articles/360032752671-Pre-assigning-participants-to-breakout-rooms) settings.",
					),
				calendar_type: z
					.union([z.literal(1), z.literal(2)])
					.optional()
					.describe(
						"The type of calendar integration used to schedule the meeting.\n* `1` - [Zoom Outlook add-in](https://support.zoom.us/hc/en-us/articles/360031592971-Getting-started-with-Outlook-plugin-and-add-in) \n* `2` - [Zoom for Google Workspace add-on](https://support.zoom.us/hc/en-us/articles/360020187492-Using-the-Zoom-for-Google-Workspace-add-on)\n\nWorks with the `private_meeting` field to determine whether to share details of meetings or not.",
					)
					.meta({ examples: [1] }),
				close_registration: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to close registration after the event date. This value defaults to `false`.",
					)
					.meta({ examples: [false] }),
				cn_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to host the meeting in China (CN). This value defaults to `false`.")
					.meta({ examples: [false] }),
				contact_email: z
					.string()
					.optional()
					.describe("The contact email address for meeting registration.")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("The contact name for meeting registration.")
					.meta({ examples: ["Jill Chill"] }),
				email_notification: z
					.boolean()
					.optional()
					.default(true)
					.describe(
						"Whether to send email notifications to [alternative hosts](https://support.zoom.us/hc/en-us/articles/208220166) and [users with scheduling privileges](https://support.zoom.us/hc/en-us/articles/201362803-Scheduling-privilege). This value defaults to `true`.",
					)
					.meta({ examples: [true] }),
				encryption_type: z
					.enum(["enhanced_encryption", "e2ee"])
					.optional()
					.describe(
						"The type of [end-to-end (E2EE) encryption](https://support.zoom.us/hc/en-us/articles/360048660871) to use for the meeting. \n* `enhanced_encryption` - Enhanced encryption. Encryption is stored in the cloud when you enable this option. \n* `e2ee` - End-to-end encryption. The encryption key is stored on your local device and **cannot** be obtained by anyone else. When you use E2EE encryption, [certain features](https://support.zoom.us/hc/en-us/articles/360048660871), such as cloud recording or phone and SIP/H.323 dial-in, are **disabled**.",
					)
					.meta({ examples: ["enhanced_encryption"] }),
				focus_mode: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Focus Mode** feature](https://support.zoom.us/hc/en-us/articles/360061113751-Using-focus-mode) when the meeting starts.",
					)
					.meta({ examples: [true] }),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("A list of available global dial-in countries."),
				host_video: z
					.boolean()
					.optional()
					.describe("Whether to start meetings with the host video on.")
					.meta({ examples: [true] }),
				in_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to host the meeting in India (IN). This value defaults to `false`.")
					.meta({ examples: [false] }),
				jbh_time: z
					.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)])
					.optional()
					.describe(
						"If the value of the `join_before_host` field is `true`, this field indicates the time limits when a participant can join a meeting before the meeting's host.\n\n* `0` - Allow the participant to join the meeting at anytime.\n* `5` - Allow the participant to join 5 minutes before the meeting's start time.\n* `10` - Allow the participant to join 10 minutes before the meeting's start time.\n* `15` - Allow the participant to join 15 minutes before the meeting's start time.",
					)
					.meta({ examples: [0] }),
				join_before_host: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether participants can join the meeting before its host. This field is only used for scheduled meetings (`2`) or recurring meetings (`3` and `8`). This value defaults to `false`.\n\nIf the [**Waiting Room** feature](https://support.zoom.us/hc/en-us/articles/115000332726-Waiting-Room) is enabled, this setting is **disabled**.",
					)
					.meta({ examples: [false] }),
				question_and_answer: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.\n\n* `false` - Disable Q&amp;A for meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Don't allow participants to submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists.\n\n* `false` - Do not allow anonymous questions. Not supported for simulive meeting.",
							)
							.meta({ examples: [true] }),
						question_visibility: z
							.enum(["answered", "all"])
							.optional()
							.describe(
								"Indicate whether you want to allow attendees to be able to view only answered questions or all questions.\n\n* `answered` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can select the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can't select the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065237) for meeting.",
					),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details.\n\n**Note:** This feature is only available for certain Meeting add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the meeting. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the meeting's sign language interpreters."),
					})
					.optional()
					.describe(
						"The meeting's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the meeting.",
					),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe(
						"If true, only [authenticated](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) users can join the meeting.",
					)
					.meta({ examples: [true] }),
				meeting_invitees: z
					.array(
						z.object({
							email: z
								.email()
								.optional()
								.describe("The invitee's email address.")
								.meta({ examples: ["jchill@example.com"] }),
						}),
					)
					.optional()
					.describe("A list of the meeting's invitees."),
				mute_upon_entry: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to mute participants upon entry.")
					.meta({ examples: [false] }),
				participant_video: z
					.boolean()
					.optional()
					.describe("Whether to start meetings with the participant video on.")
					.meta({ examples: [false] }),
				private_meeting: z
					.boolean()
					.optional()
					.describe("Whether to set the meeting as private.")
					.meta({ examples: [false] }),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants an email confirmation. \n* `true` - Send a confirmation email. \n* `false` - Do not send a confirmation email.",
					)
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Whether to send registrants email notifications about their registration approval, cancellation, or rejection.\n\n* `true` - Send an email notification.\n* `false` - Do not send an email notification.\n\n Set this value to `true` to also use the `registrants_confirmation_email` parameter.",
					)
					.meta({ examples: [true] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"The meeting's registration type. \n* `1` - Attendees register once and can attend any meeting occurrence. \n* `2` - Attendees must register for each meeting occurrence. \n* `3` - Attendees register once and can select one or more meeting occurrences to attend.\n\nThis field is only for recurring meetings with fixed times (`8`). This value defaults to `1`.",
					)
					.meta({ examples: [1] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe(
						"Whether to include social media sharing buttons on the meeting's registration page. This setting is only applied to meetings with registration enabled.",
					)
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the meeting's join information on the registration confirmation page. This setting is only applied to meetings with registration enabled.",
					)
					.meta({ examples: [true] }),
				use_pmi: z
					.boolean()
					.optional()
					.describe(
						"Whether to use a [Personal Meeting ID (PMI)](/docs/api/using-zoom-apis/#understanding-personal-meeting-id-pmi) for the meeting. This field is only used for scheduled meetings(`2`) and recurring meetings with no fixed time(`3`). If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				waiting_room: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Waiting Room** feature](https://support.zoom.us/hc/en-us/articles/115000332726-Waiting-Room). If this value is `true`, this **disables** the `join_before_host` setting.",
					)
					.meta({ examples: [false] }),
				waiting_room_options: z
					.object({
						mode: z
							.enum(["follow_setting", "custom"])
							.describe(
								"The waiting room behavior for this meeting.\r\n* `follow_setting` - Use the Zoom web portal setting.\r\n* `custom` - Specify which participants should go into the waiting room.",
							)
							.meta({ examples: ["follow_setting"] }),
						who_goes_to_waiting_room: z
							.enum([
								"everyone",
								"users_not_in_account",
								"users_not_in_account_or_whitelisted_domains",
								"users_not_on_invite",
								"users_not_in_org",
							])
							.optional()
							.describe(
								"Which participants should be placed into the waiting room. Required if `mode` is set to `custom`.\r\n* `everyone` - Everyone.\r\n* `users_not_in_account` - Users not in your account.\r\n* `users_not_in_account_or_whitelisted_domains` - Users who are not in your account and not part of your whitelisted domains.\r\n* `users_not_on_invite` - Users not on the meeting invite.\r\n* `users_not_in_org` - Users not in your organization.",
							)
							.meta({ examples: ["everyone"] }),
					})
					.optional()
					.describe("Configuration settings for the meeting's waiting room."),
				watermark: z
					.boolean()
					.optional()
					.describe(
						"Whether to add a watermark when viewing a shared screen. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				host_save_video_order: z
					.boolean()
					.optional()
					.describe("Whether the **Allow host to save video order** feature is enabled.")
					.meta({ examples: [true] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				alternative_host_manage_meeting_summary: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting summaries.")
					.meta({ examples: [true] }),
				alternative_host_manage_cloud_recording: z
					.boolean()
					.optional()
					.describe("Whether to allow an alternative host to manage meeting cloud recordings.")
					.meta({ examples: [false] }),
				internal_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as an internal meeting.")
					.meta({ examples: [false] }),
				continuous_meeting_chat: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Enable continuous meeting chat** setting. The default value is based on user settings. When the **Enable continuous meeting chat** setting is enabled, the default value is true. When the setting is disabled, the default value is false.",
							)
							.meta({ examples: [true] }),
						auto_add_invited_external_users: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable the **Automatically add invited external users** setting.",
							)
							.meta({ examples: [true] }),
						auto_add_meeting_participants: z
							.boolean()
							.optional()
							.describe("Whether to enable the **Automatically add meeting participants** setting.")
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"Information about the **Enable continuous meeting chat** feature. This setting only applies to scheduled and recurring meetings, types `2`, `3`, and `8`. It is **not supported** for type `1` instant meetings or type `10` screen share only meetings.",
					),
				participant_focused_meeting: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to set the meeting as a participant focused meeting.")
					.meta({ examples: [false] }),
				push_change_to_calendar: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to push meeting changes to the calendar. \n\n To enable this feature, configure the **Configure Calendar and Contacts Service** in the user's profile page of the Zoom web portal and enable the **Automatically sync Zoom calendar events information bi-directionally between Zoom and integrated calendars.** setting in the **Settings** page of the Zoom web portal.\n* `true` - Push meeting changes to the calendar.\n* `false` - Do not push meeting changes to the calendar.",
					)
					.meta({ examples: [false] }),
				resources: z
					.array(
						z.object({
							resource_type: z
								.enum(["whiteboard"])
								.optional()
								.describe("The resource type.")
								.meta({ examples: ["whiteboard"] }),
							resource_id: z
								.string()
								.optional()
								.describe("The resource ID.")
								.meta({ examples: ["X4Hy02w3QUOdskKofgb9Jg"] }),
							permission_level: z
								.enum(["editor", "commenter", "viewer"])
								.optional()
								.default("editor")
								.describe(
									"The permission levels for users to access the whiteboard. \n* `editor` - Users with link access can edit the board. \n* `commenter` - Users with link access can comment on the board. \n* `viewer` - Users with link access can view the board.",
								)
								.meta({ examples: ["editor"] }),
						}),
					)
					.optional()
					.describe("The meeting's resources."),
				auto_start_meeting_summary: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start a meeting summary. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				who_will_receive_summary: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Defines who will receive a summary after this meeting. This field is applicable only when `auto_start_meeting_summary` is set to `true`.\n\n* `1` - Only meeting host.\n\n* `2` - Only meeting host, co-hosts, and alternative hosts.\n\n* `3` - Only meeting host and meeting invitees in our organization.\n\n* `4` - All meeting invitees including those outside of our organization. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [1] }),
				auto_start_ai_companion_questions: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start AI Companion questions. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
				who_can_ask_questions: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
					.optional()
					.describe(
						"Defines who can ask questions about this meeting's transcript. This field is applicable only when `auto_start_ai_companion_questions` is set to `true`.\n\n* `1` - All participants and invitees.\n\n* `2` - All participants only from when they join.\n\n* `3` - Only meeting host.\n\n* `4` - Participants and invitees in our organization.\n\n* `5` - Participants in our organization only from when they join. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [1] }),
				summary_template_id: z
					.string()
					.optional()
					.describe(
						"The summary template ID used to generate a meeting summary based on a predefined template. To get available summary templates, use the **Get user summary templates** API. If not provided, the default value will be based on the user's setting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.com/hc/en).",
					)
					.meta({ examples: ["1e1356ad"] }),
				device_testing: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable the device testing.")
					.meta({ examples: [false] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. If not provided, the default value will be based on the user's setting. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				disable_participant_video: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to disable the participant video during meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe(
						"Whether to include authenticated guest's email addresses in meetings' attendee reports.",
					)
					.meta({ examples: [true] }),
				auto_start_deepfake_detection: z
					.boolean()
					.optional()
					.describe(
						"Whether to automatically start deepfake risk detection. If not provided, the default value will be based on the user's setting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
					)
					.meta({ examples: [false] }),
				prevent_screen_capture: z
					.boolean()
					.optional()
					.describe(
						"Whether to prevent participants from capturing Zoom meeting windows, which may include shared meeting content and chat messages. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [false] }),
			})
			.optional()
			.describe("Information about the meeting's settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe(
				"The meeting's start time. This field is only used for scheduled or recurring meetings with a fixed time. This supports local time and GMT formats. \n* To set a meeting's start time in GMT, use the `yyyy-MM-ddTHH:mm:ssZ` date-time format, such as `2020-03-31T12:02:00Z`. \n* To set a meeting's start time using a specific timezone, use the `yyyy-MM-ddTHH:mm:ss` date-time format and specify the [timezone ID](/docs/api/references/abbreviations/#timezones) in the `timezone` field. If you do not specify a timezone, the `timezone` value defaults to your Zoom account's timezone. You can also use `UTC` for the `timezone` value.\n\n**Note:** If `start_time` is not specified or is set to a past value, it defaults to the current time.",
			)
			.meta({ examples: ["2022-03-25T07:32:55Z"] }),
		sensitivity_label_id: z
			.string()
			.optional()
			.describe(
				"The sensitivity label ID used to apply a sensitivity label to the meeting. To enable this feature for your account, please [contact Zoom Support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["WAzVaIjFR1Cxd767i9jksw"] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The account admin meeting template ID used to schedule a meeting using a [meeting template](https://support.zoom.us/hc/en-us/articles/360036559151-Meeting-templates). For a list of account admin-provided meeting templates, use the [**List meeting templates**](/docs/api-reference/zoom-api/methods#operation/listMeetingTemplates) API. \n* At this time, this field **only** accepts account admin meeting template IDs. \n* To enable the account admin meeting templates feature, [contact Zoom support](https://support.zoom.us/hc/en-us).",
			)
			.meta({ examples: ["Dv4YdINdTk+Z5RToadh5ug=="] }),
		timezone: z
			.string()
			.optional()
			.describe(
				"The timezone to assign to the `start_time` value. This field is only used for scheduled or recurring meetings with a fixed time.\n\nFor a list of supported timezones and their formats, see our [timezone list](/docs/api/references/abbreviations/#timezones).",
			)
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.max(200)
			.optional()
			.describe("The meeting's topic.")
			.meta({ examples: ["My Meeting"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.describe("The tracking field's label.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("The tracking field's value.")
						.meta({ examples: ["value1"] }),
				}),
			)
			.optional()
			.describe("Information about the meeting's tracking fields."),
		type: z
			.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8), z.literal(10)])
			.optional()
			.default(2)
			.describe(
				"The type of meeting.\n* `1` - An instant meeting. \n* `2` - A scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `8` - A recurring meeting with fixed time. \n* `10` - A screen share only meeting.",
			)
			.meta({ examples: [2] }),
	})
	.optional()
	.describe("The meeting object.");

export const listUpcomingMeetingPathUserIdSchema = z
	.string()
	.describe(
		"The user's user ID or email address. For user-level apps, pass [the `me` value](/docs/api/rest/using-zoom-apis/#the-me-keyword).",
	)
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const listUpcomingMeetingStatus200Schema = z.object({
	total_records: z
		.int()
		.optional()
		.describe("The total number of all records available across all pages.")
		.meta({ examples: [1] }),
	meetings: z
		.array(
			z.object({
				id: z.coerce
					.bigint()
					.optional()
					.describe(
						"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-) - a unique identifier of the meeting in **long** format, represented as int64 data type in JSON. Also known as the meeting number.",
					)
					.meta({ examples: [97763643886] }),
				topic: z
					.string()
					.optional()
					.describe("The meeting topic.")
					.meta({ examples: ["My Meeting"] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8)])
					.optional()
					.describe(
						"Meeting types.\n`1` - Instant meeting.\n`2` - Scheduled meeting.\n`3` - Recurring meeting with no fixed time.\n`8` - Recurring meeting with a fixed time.",
					)
					.meta({ examples: [2] }),
				start_time: z.iso
					.datetime()
					.optional()
					.describe("The meeting's start time.")
					.meta({ examples: ["2022-03-23T06:00:00Z"] }),
				duration: z
					.int()
					.optional()
					.describe("Meeting duration.")
					.meta({ examples: [60] }),
				timezone: z
					.string()
					.optional()
					.describe("The timezone to format the meeting start time.")
					.meta({ examples: ["America/Los_Angeles"] }),
				created_at: z.iso
					.datetime()
					.optional()
					.describe("The meeting creation time.")
					.meta({ examples: ["2022-03-23T05:31:16Z"] }),
				join_url: z
					.string()
					.optional()
					.describe("The URL that participants can use to join a meeting.")
					.meta({ examples: ["https://example.com/j/11111"] }),
				passcode: z
					.string()
					.optional()
					.describe(
						"The meeting passcode. This passcode may only contain characters `[a-z A-Z 0-9 @ - _ * !]`.",
					)
					.meta({ examples: ["123456"] }),
				use_pmi: z
					.boolean()
					.optional()
					.describe(
						"Use a [personal meeting ID (PMI)](/docs/api/rest/using-zoom-apis/#understanding-personal-meeting-id-pmi). Only used for scheduled meetings and recurring meetings with no fixed time.",
					)
					.meta({ examples: [false] }),
				is_host: z
					.boolean()
					.optional()
					.describe("Whether the current user is the host of the meeting.")
					.meta({ examples: [true] }),
				is_all_day: z
					.boolean()
					.optional()
					.describe("Whether the meeting is scheduled as an all-day event.")
					.meta({ examples: [false] }),
			}),
		)
		.optional()
		.describe("List of upcoming meeting objects."),
});

export const listUpcomingMeetingStatus404Schema = z.unknown();

export const listUpcomingMeetingStatus429Schema = z.unknown();

export const listUpcomingMeetingResponseSchema = listUpcomingMeetingStatus200Schema;

export const listUpcomingMeetingErrorSchema = z.union([
	listUpcomingMeetingStatus404Schema,
	listUpcomingMeetingStatus429Schema,
]);

export const userPACsPathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.");

export const userPACsStatus200Schema = z.object({
	pac_accounts: z
		.array(
			z.object({
				conference_id: z.coerce
					.bigint()
					.optional()
					.describe("The conference ID.")
					.meta({ examples: [111111] }),
				dedicated_dial_in_number: z
					.array(
						z.object({
							country: z
								.string()
								.optional()
								.describe("The dial-in country code.")
								.meta({ examples: ["USA"] }),
							number: z
								.string()
								.max(16)
								.optional()
								.describe("The dial-in number.")
								.meta({ examples: ["5550110"] }),
						}),
					)
					.optional()
					.describe("Information about the account's dedicated dial-in numbers."),
				global_dial_in_numbers: z
					.array(
						z.object({
							country: z
								.string()
								.optional()
								.describe("The global dial-in country code.")
								.meta({ examples: ["USA"] }),
							number: z
								.string()
								.max(16)
								.optional()
								.describe("The global dial-in number.")
								.meta({ examples: ["5550100"] }),
						}),
					)
					.optional()
					.describe("Information about the account's global dial-in numbers."),
				listen_only_password: z
					.string()
					.max(6)
					.optional()
					.describe("The listen-only password, up to six characters in length.")
					.meta({ examples: ["3c2b1a"] }),
				participant_password: z
					.string()
					.max(6)
					.optional()
					.describe("The participant password, up to six characters in length.")
					.meta({ examples: ["a1b2c3"] }),
			}),
		)
		.optional()
		.describe("Information about the PAC accounts."),
});

export const userPACsStatus400Schema = z.unknown();

export const userPACsStatus404Schema = z.unknown();

export const userPACsStatus429Schema = z.unknown();

export const userPACsResponseSchema = userPACsStatus200Schema;

export const userPACsErrorSchema = z.union([
	userPACsStatus400Schema,
	userPACsStatus404Schema,
	userPACsStatus429Schema,
]);

export const createBatchPollsPathMeetingIdSchema = z.string().meta({ examples: ["93398114182"] });

export const createBatchPollsStatus201Schema = z.object({
	polls: z
		.array(
			z.object({
				anonymous: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow meeting participants to answer poll questions anonymously: \n* `true` &mdash; Anonymous polls enabled. \n* `false` &mdash; Participants cannot answer poll questions anonymously.",
					)
					.meta({ examples: [true] }),
				id: z
					.string()
					.optional()
					.describe("Meeting Poll ID")
					.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
				poll_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.describe(
						"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account.",
					)
					.meta({ examples: [2] }),
				questions: z
					.array(
						z.object({
							answer_max_character: z
								.int()
								.optional()
								.describe(
									"The allowed maximum number of characters. This field only returns for `short_answer` and `long_answer` polls.",
								)
								.meta({ examples: [200] }),
							answer_min_character: z
								.int()
								.optional()
								.describe(
									"The allowed minimum number of characters. This field only returns for `short_answer` and `long_answer` polls.",
								)
								.meta({ examples: [1] }),
							answer_required: z
								.boolean()
								.optional()
								.describe(
									"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question.",
								)
								.meta({ examples: [false] }),
							answers: z
								.array(z.string())
								.optional()
								.describe("The poll question's available answers."),
							case_sensitive: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether the correct answer is case sensitive. This field only returns for `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive.",
								)
								.meta({ examples: [false] }),
							name: z
								.string()
								.optional()
								.describe(
									"The poll question's title. For `fill_in_the_blank` polls, this field is the poll's question.",
								)
								.meta({ examples: ["How useful was this meeting?"] }),
							prompts: z
								.array(
									z.object({
										prompt_question: z
											.string()
											.optional()
											.describe("The question prompt's title.")
											.meta({ examples: ["How are you?"] }),
										prompt_right_answers: z
											.array(z.string())
											.optional()
											.describe("The question prompt's correct answers."),
									}),
								)
								.optional()
								.describe(
									"The information about the prompt questions. This object only returns for `matching` and `rank_order` polls.",
								),
							rating_max_label: z
								.string()
								.optional()
								.describe(
									"The high score label for the `rating_max_value` field. This field only returns for `rating_scale` polls.",
								)
								.meta({ examples: ["Extremely Likely"] }),
							rating_max_value: z
								.int()
								.max(10)
								.optional()
								.describe(
									"The rating scale's maximum value. This field only returns for `rating_scale` polls.",
								)
								.meta({ examples: [4] }),
							rating_min_label: z
								.string()
								.optional()
								.describe(
									"The low score label for the `rating_min_value` field. This field only returns for `rating_scale` polls.",
								)
								.meta({ examples: ["Not likely"] }),
							rating_min_value: z
								.int()
								.optional()
								.describe(
									"The rating scale's minimum value. This field only returns for `rating_scale` polls.",
								)
								.meta({ examples: [0] }),
							right_answers: z
								.array(z.string())
								.optional()
								.describe("The poll question's correct answer(s)."),
							show_as_dropdown: z
								.boolean()
								.optional()
								.describe(
									"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box.",
								)
								.meta({ examples: [false] }),
							type: z
								.union([
									z.literal("single"),
									z.literal("multiple"),
									z.literal("matching"),
									z.literal("rank_order"),
									z.literal("short_answer"),
									z.literal("long_answer"),
									z.literal("fill_in_the_blank"),
									z.literal("rating_scale"),
								])
								.optional()
								.describe(
									"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
								)
								.meta({ examples: ["single"] }),
						}),
					)
					.optional()
					.describe("The information about the poll's questions."),
				status: z
					.union([
						z.literal("notstart"),
						z.literal("started"),
						z.literal("ended"),
						z.literal("sharing"),
					])
					.optional()
					.describe(
						"The status of the meeting poll:  \n `notstart` - Poll not started  \n `started` - Poll started  \n `ended` - Poll ended  \n `sharing` - Sharing poll results",
					)
					.meta({ examples: ["notstart"] }),
				title: z
					.string()
					.optional()
					.describe("The title for the poll.")
					.meta({ examples: ["Learn something new"] }),
			}),
		)
		.optional(),
});

export const createBatchPollsStatus400Schema = z.unknown();

export const createBatchPollsStatus404Schema = z.unknown();

export const createBatchPollsStatus429Schema = z.unknown();

export const createBatchPollsResponseSchema = createBatchPollsStatus201Schema;

export const createBatchPollsErrorSchema = z.union([
	createBatchPollsStatus400Schema,
	createBatchPollsStatus404Schema,
	createBatchPollsStatus429Schema,
]);

export const createBatchPollsBodySchema = z
	.object({
		polls: z
			.array(
				z.object({
					anonymous: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to allow meeting participants to answer poll questions anonymously: \n* `true` &mdash; Anonymous polls enabled. \n* `false` &mdash; Participants cannot answer poll questions anonymously. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					poll_type: z
						.union([z.literal(1), z.literal(2), z.literal(3)])
						.optional()
						.default(1)
						.describe(
							"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
						)
						.meta({ examples: [2] }),
					questions: z
						.array(
							z.object({
								answer_max_character: z
									.int()
									.optional()
									.describe(
										"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
									)
									.meta({ examples: [200] }),
								answer_min_character: z
									.int()
									.min(1)
									.optional()
									.describe(
										"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
									)
									.meta({ examples: [1] }),
								answer_required: z
									.boolean()
									.optional()
									.default(false)
									.describe(
										"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
									)
									.meta({ examples: [false] }),
								answers: z
									.array(z.string())
									.min(2)
									.optional()
									.describe(
										"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
									),
								case_sensitive: z
									.boolean()
									.optional()
									.default(false)
									.describe(
										"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
									)
									.meta({ examples: [false] }),
								name: z
									.string()
									.max(1024)
									.optional()
									.describe(
										"The poll question's title, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
									)
									.meta({ examples: ["How useful was this meeting?"] }),
								prompts: z
									.array(
										z.object({
											prompt_question: z
												.string()
												.optional()
												.describe("The question prompt's title.")
												.meta({ examples: ["How are you?"] }),
											prompt_right_answers: z
												.array(z.string())
												.optional()
												.describe(
													"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
												),
										}),
									)
									.optional()
									.describe(
										"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
									),
								rating_max_label: z
									.string()
									.optional()
									.describe(
										"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
									)
									.meta({ examples: ["Extremely Likely"] }),
								rating_max_value: z
									.int()
									.max(10)
									.optional()
									.describe(
										"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
									)
									.meta({ examples: [4] }),
								rating_min_label: z
									.string()
									.optional()
									.describe(
										"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
									)
									.meta({ examples: ["Not likely"] }),
								rating_min_value: z
									.int()
									.min(1)
									.optional()
									.describe(
										"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
									)
									.meta({ examples: [1] }),
								right_answers: z
									.array(z.string())
									.min(1)
									.optional()
									.describe(
										"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
									),
								show_as_dropdown: z
									.boolean()
									.optional()
									.default(false)
									.describe(
										"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
									)
									.meta({ examples: [false] }),
								type: z
									.union([
										z.literal("single"),
										z.literal("multiple"),
										z.literal("matching"),
										z.literal("rank_order"),
										z.literal("short_answer"),
										z.literal("long_answer"),
										z.literal("fill_in_the_blank"),
										z.literal("rating_scale"),
									])
									.optional()
									.describe(
										"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
									)
									.meta({ examples: ["single"] }),
							}),
						)
						.optional()
						.describe("The information about the poll's questions."),
					title: z
						.string()
						.max(64)
						.optional()
						.describe("The poll's title, up to 64 characters.")
						.meta({ examples: ["Learn something new"] }),
				}),
			)
			.min(1)
			.max(25)
			.optional()
			.describe("The information about the meeting's polls."),
	})
	.optional()
	.describe("The batch meeting poll object");

export const meetingPollsPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingPollsQueryAnonymousSchema = z
	.boolean()
	.optional()
	.describe(
		"Whether to query for polls with the **Anonymous** option enabled: \n* `true` &mdash; Query for polls with the **Anonymous** option enabled. \n* `false` &mdash; Do not query for polls with the **Anonymous** option enabled.",
	)
	.meta({ examples: [true] });

export const meetingPollsStatus200Schema = z
	.object({
		polls: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("The poll ID.")
							.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
						status: z
							.enum(["notstart", "started", "ended", "sharing", "deactivated"])
							.optional()
							.describe(
								"The meeting poll's status.\n`notstart` - Poll not started\n`started` - Poll started\n`ended` - Poll ended\n`sharing` - Sharing poll results\n`deactivated` - Poll deactivated",
							)
							.meta({ examples: ["notstart"] }),
					})
					.extend({
						anonymous: z
							.boolean()
							.optional()
							.default(false)
							.describe(
								"Whether meeting participants can answer poll questions anonymously. \n\nThis value defaults to `false`.",
							)
							.meta({ examples: [true] }),
						poll_type: z
							.union([z.literal(1), z.literal(2), z.literal(3)])
							.optional()
							.describe(
								"The type of poll. \n* `1` - Poll. \n* `2` - Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` - Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
							)
							.meta({ examples: [2] }),
						questions: z
							.array(
								z.object({
									answer_max_character: z
										.int()
										.optional()
										.describe(
											"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
										)
										.meta({ examples: [200] }),
									answer_min_character: z
										.int()
										.min(1)
										.optional()
										.describe(
											"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
										)
										.meta({ examples: [1] }),
									answer_required: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									answers: z
										.array(z.string())
										.min(2)
										.optional()
										.describe(
											"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
										),
									case_sensitive: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									name: z
										.string()
										.max(1024)
										.optional()
										.describe(
											"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
										)
										.meta({ examples: ["How useful was this meeting?"] }),
									prompts: z
										.array(
											z.object({
												prompt_question: z
													.string()
													.optional()
													.describe("The question prompt's title.")
													.meta({ examples: ["How are you?"] }),
												prompt_right_answers: z
													.array(z.string())
													.optional()
													.describe(
														"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
													),
											}),
										)
										.optional()
										.describe(
											"Information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
										),
									rating_max_label: z
										.string()
										.optional()
										.describe(
											"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: ["Extremely Likely"] }),
									rating_max_value: z
										.int()
										.max(10)
										.optional()
										.describe(
											"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: [4] }),
									rating_min_label: z
										.string()
										.optional()
										.describe(
											"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: ["Not likely"] }),
									rating_min_value: z
										.int()
										.min(0)
										.optional()
										.describe(
											"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: [0] }),
									right_answers: z
										.array(z.string())
										.min(1)
										.optional()
										.describe(
											"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
										),
									show_as_dropdown: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									type: z
										.union([
											z.literal("single"),
											z.literal("multiple"),
											z.literal("matching"),
											z.literal("rank_order"),
											z.literal("short_answer"),
											z.literal("long_answer"),
											z.literal("fill_in_the_blank"),
											z.literal("rating_scale"),
										])
										.optional()
										.describe(
											"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
										)
										.meta({ examples: ["single"] }),
								}),
							)
							.optional()
							.describe("Information about the poll's questions."),
						title: z
							.string()
							.max(64)
							.optional()
							.describe("The poll's title, up to 64 characters.")
							.meta({ examples: ["Learn something new"] }),
					}),
			)
			.optional()
			.describe("An array of polls."),
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages")
			.meta({ examples: [1] }),
	})
	.describe("Poll List");

export const meetingPollsStatus400Schema = z.unknown();

export const meetingPollsStatus404Schema = z.unknown();

export const meetingPollsStatus429Schema = z.unknown();

export const meetingPollsResponseSchema = meetingPollsStatus200Schema;

export const meetingPollsErrorSchema = z.union([
	meetingPollsStatus400Schema,
	meetingPollsStatus404Schema,
	meetingPollsStatus429Schema,
]);

export const meetingPollCreatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingPollCreateStatus201Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("The meeting poll ID")
			.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
		status: z
			.union([
				z.literal("notstart"),
				z.literal("started"),
				z.literal("ended"),
				z.literal("sharing"),
			])
			.optional()
			.describe(
				"The status of the meeting poll:  \n `notstart` - Poll not started  \n `started` - Poll started  \n `ended` - Poll ended  \n `sharing` - Sharing poll results",
			)
			.meta({ examples: ["notstart"] }),
	})
	.extend({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	});

export const meetingPollCreateStatus400Schema = z.unknown();

export const meetingPollCreateStatus404Schema = z.unknown();

export const meetingPollCreateStatus429Schema = z.unknown();

export const meetingPollCreateResponseSchema = meetingPollCreateStatus201Schema;

export const meetingPollCreateErrorSchema = z.union([
	meetingPollCreateStatus400Schema,
	meetingPollCreateStatus404Schema,
	meetingPollCreateStatus429Schema,
]);

export const meetingPollCreateBodySchema = z
	.object({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	})
	.optional()
	.describe("The meeting poll object.");

export const meetingPollGetPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a `long` format integer, not a simple integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingPollGetPathPollIdSchema = z
	.string()
	.describe("The poll ID.")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const meetingPollGetStatus200Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("The meeting poll ID.")
			.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
		status: z
			.enum(["notstart", "started", "ended", "sharing", "deactivated"])
			.optional()
			.describe(
				"The meeting poll's status.\n`notstart` - Poll not started\n`started` - Poll started\n`ended` - Poll ended\n`sharing` - Sharing poll results\n`deactivated` - Poll deactivated",
			)
			.meta({ examples: ["notstart"] }),
	})
	.extend({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The poll's type. \n* `1` - Poll. \n* `2` - Advanced poll. This feature must be enabled in your Zoom account. \n* `3` - Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls. \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a one-character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is required if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order. \n* `short_answer` - Short answer. \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank. \n* `rating_scale` - Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("Information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	});

export const meetingPollGetStatus400Schema = z.unknown();

export const meetingPollGetStatus404Schema = z.unknown();

export const meetingPollGetStatus429Schema = z.unknown();

export const meetingPollGetResponseSchema = meetingPollGetStatus200Schema;

export const meetingPollGetErrorSchema = z.union([
	meetingPollGetStatus400Schema,
	meetingPollGetStatus404Schema,
	meetingPollGetStatus429Schema,
]);

export const meetingPollUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingPollUpdatePathPollIdSchema = z
	.string()
	.describe("The poll ID.")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const meetingPollUpdateStatus204Schema = z.unknown();

export const meetingPollUpdateStatus400Schema = z.unknown();

export const meetingPollUpdateStatus404Schema = z.unknown();

export const meetingPollUpdateStatus429Schema = z.unknown();

export const meetingPollUpdateResponseSchema = meetingPollUpdateStatus204Schema;

export const meetingPollUpdateErrorSchema = z.union([
	meetingPollUpdateStatus400Schema,
	meetingPollUpdateStatus404Schema,
	meetingPollUpdateStatus429Schema,
]);

export const meetingPollUpdateBodySchema = z
	.object({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll. \n* `1` - Poll. \n* `2` - Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` - Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls. \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a one character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` - The answer is case-sensitive. \n* `false` - The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You must provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order. \n* `short_answer` - Short answer. \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank. \n* `rating_scale` - Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	})
	.optional()
	.describe("The meeting poll.");

export const meetingPollDeletePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingPollDeletePathPollIdSchema = z
	.string()
	.describe("The poll ID")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const meetingPollDeleteStatus204Schema = z.unknown();

export const meetingPollDeleteStatus400Schema = z.unknown();

export const meetingPollDeleteStatus404Schema = z.unknown();

export const meetingPollDeleteStatus429Schema = z.unknown();

export const meetingPollDeleteResponseSchema = meetingPollDeleteStatus204Schema;

export const meetingPollDeleteErrorSchema = z.union([
	meetingPollDeleteStatus400Schema,
	meetingPollDeleteStatus404Schema,
	meetingPollDeleteStatus429Schema,
]);

export const listPastMeetingPollsPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	);

export const listPastMeetingPollsStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in **long** format(represented as int64 data type in JSON), also known as the meeting number.",
		)
		.meta({ examples: [93398114182] }),
	questions: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe(
						"Email address of the user who submitted answers to the poll. If the user is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"Name of the user who submitted answers to the poll. If `anonymous` option is enabled for a poll, the participant's polling information will be kept anonymous and the value of `name` field will be `Anonymous Attendee`.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe("Answer submitted by the user.")
								.meta({ examples: ["Good"] }),
							date_time: z.iso
								.datetime()
								.optional()
								.describe("Date and time at which the answer to the poll was submitted.")
								.meta({ examples: ["2022-03-26T05:37:59Z"] }),
							polling_id: z
								.string()
								.optional()
								.describe("Unique identifier of the poll.")
								.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
							question: z
								.string()
								.optional()
								.describe("Question asked during the poll.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The start time of the meeting.")
		.meta({ examples: ["2022-03-26T05:37:59Z"] }),
	uuid: z
		.string()
		.optional()
		.describe("Meeting UUID.")
		.meta({ examples: ["Vg8IdgluR5WDeWIkpJlElQ=="] }),
});

export const listPastMeetingPollsStatus400Schema = z.unknown();

export const listPastMeetingPollsStatus429Schema = z.unknown();

export const listPastMeetingPollsResponseSchema = listPastMeetingPollsStatus200Schema;

export const listPastMeetingPollsErrorSchema = z.union([
	listPastMeetingPollsStatus400Schema,
	listPastMeetingPollsStatus429Schema,
]);

export const reportSignInSignOutActivitiesQueryFromSchema = z.iso
	.date()
	.optional()
	.describe(
		"Start date for which you would like to view the activity logs report. Using the `from` and `to` parameters, specify a monthly date range for the report as the API only provides one month worth of data in one request. The specified date range should fall within the last six months.",
	)
	.meta({ examples: ["2019-09-01"] });

export const reportSignInSignOutActivitiesQueryToSchema = z.iso
	.date()
	.optional()
	.describe("End date up to which you would like to view the activity logs report.")
	.meta({ examples: ["2019-09-20"] });

export const reportSignInSignOutActivitiesQueryPageSizeSchema = z
	.int()
	.optional()
	.describe("The number of records to be returned within a single API call")
	.meta({ examples: [30] });

export const reportSignInSignOutActivitiesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe("Next page token is used to paginate through large result sets")
	.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] });

export const reportSignInSignOutActivitiesStatus200Schema = z
	.object({
		activity_logs: z
			.array(
				z.object({
					client_type: z
						.string()
						.optional()
						.describe("The client interface type using which the activity was performed.")
						.meta({ examples: ["Browser"] }),
					email: z
						.email()
						.optional()
						.describe("Email address of the user used for the activity.")
						.meta({ examples: ["jchill@example.com"] }),
					ip_address: z
						.string()
						.optional()
						.describe("The IP address of the user's device.")
						.meta({ examples: ["192.0.2.1"] }),
					time: z.iso
						.datetime()
						.optional()
						.describe("Time during which the activity occurred.")
						.meta({ examples: ["2019-09-15T19:13:41Z"] }),
					type: z
						.enum(["Sign in", "Sign out"])
						.optional()
						.describe(
							"The type of activity. \n* `Sign in` &mdash; Sign in activity by user. \n* `Sign out` &mdash; Sign out activity by user.",
						)
						.meta({ examples: ["Sign out"] }),
					version: z
						.string()
						.optional()
						.describe("Zoom client version of the user.")
						.meta({ examples: ["5.9.1.2581"] }),
				}),
			)
			.optional()
			.describe("Array of activity logs."),
		from: z
			.string()
			.optional()
			.describe("Start date from which you want the activity logs report to be generated.")
			.meta({ examples: ["2019-09-01T00:00:00Z"] }),
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
		page_size: z
			.int()
			.optional()
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		to: z
			.string()
			.optional()
			.describe("End date until which you want the activity logs report to be generated")
			.meta({ examples: ["2019-09-20T00:00:00Z"] }),
	})
	.describe("Report object");

export const reportSignInSignOutActivitiesStatus400Schema = z.unknown();

export const reportSignInSignOutActivitiesStatus429Schema = z.unknown();

export const reportSignInSignOutActivitiesResponseSchema =
	reportSignInSignOutActivitiesStatus200Schema;

export const reportSignInSignOutActivitiesErrorSchema = z.union([
	reportSignInSignOutActivitiesStatus400Schema,
	reportSignInSignOutActivitiesStatus429Schema,
]);

export const getBillingReportStatus200Schema = z.object({
	billing_reports: z
		.array(
			z.object({
				end_date: z.iso
					.date()
					.optional()
					.describe("End date of the billing period.")
					.meta({ examples: ["2022-03-25"] }),
				id: z
					.string()
					.optional()
					.describe(
						"Unique Identifier of the report. Use this ID to retrieve billing invoice via the &quot;Get Billing Invoices API&quot;. \n\nYou can also use this ID to export a CSV file of the billing report from this URL: `https://zoom.us/account/report/billing/export?id={id}`.",
					)
					.meta({ examples: ["indfhgfhfho"] }),
				start_date: z.iso
					.date()
					.optional()
					.describe("Start date of the billing period.")
					.meta({ examples: ["2022-03-25"] }),
				tax_amount: z
					.string()
					.optional()
					.describe("Total tax amount for this billing period.")
					.meta({ examples: ["456"] }),
				total_amount: z
					.string()
					.optional()
					.describe("Total billing amount for this billing period.")
					.meta({ examples: ["456"] }),
				type: z
					.union([z.literal(0), z.literal(1)])
					.optional()
					.describe(
						"Type of the billing report. The value should be either of the following:  \n \n`0` - Detailed Billing Reports\n`1` - Custom Billing Reports",
					)
					.meta({ examples: [1] }),
			}),
		)
		.optional(),
	currency: z
		.string()
		.optional()
		.describe("Currency of the billed amount.")
		.meta({ examples: ["USD"] }),
});

export const getBillingReportStatus400Schema = z.unknown();

export const getBillingReportStatus429Schema = z.unknown();

export const getBillingReportResponseSchema = getBillingReportStatus200Schema;

export const getBillingReportErrorSchema = z.union([
	getBillingReportStatus400Schema,
	getBillingReportStatus429Schema,
]);

export const getBillingInvoicesReportsQueryBillingIdSchema = z
	.string()
	.describe(
		"The billing report's unique identifier. Retrieve this ID from the response of **Get Billing Reports** API request. \n\n",
	)
	.meta({ examples: ["indfhgfhfho"] });

export const getBillingInvoicesReportsStatus200Schema = z.object({
	currency: z
		.string()
		.optional()
		.describe("Currency of the billed amount in the invoice.")
		.meta({ examples: ["USD"] }),
	invoices: z
		.array(
			z.object({
				end_date: z.iso
					.date()
					.optional()
					.describe("End date of the invoice period.")
					.meta({ examples: ["2022-03-25"] }),
				invoice_charge_name: z
					.string()
					.optional()
					.describe("Name of the invoice.")
					.meta({ examples: ["Audio Conferencing Options"] }),
				invoice_number: z
					.string()
					.optional()
					.describe("Invoice number ")
					.meta({ examples: ["3"] }),
				quantity: z
					.int()
					.optional()
					.describe("Number of licenses bought.")
					.meta({ examples: [45] }),
				start_date: z.iso
					.date()
					.optional()
					.describe("Start date of the invoice period.")
					.meta({ examples: ["2022-03-25"] }),
				tax_amount: z
					.string()
					.optional()
					.describe("Tax amount in the invoice.")
					.meta({ examples: ["34"] }),
				total_amount: z
					.string()
					.optional()
					.describe("Total billed amount in the invoice.")
					.meta({ examples: ["45"] }),
			}),
		)
		.optional(),
});

export const getBillingInvoicesReportsStatus400Schema = z.unknown();

export const getBillingInvoicesReportsStatus404Schema = z.unknown();

export const getBillingInvoicesReportsStatus429Schema = z.unknown();

export const getBillingInvoicesReportsResponseSchema = getBillingInvoicesReportsStatus200Schema;

export const getBillingInvoicesReportsErrorSchema = z.union([
	getBillingInvoicesReportsStatus400Schema,
	getBillingInvoicesReportsStatus404Schema,
	getBillingInvoicesReportsStatus429Schema,
]);

export const reportCloudRecordingQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' format. The date range defined by the &quot;from&quot; and &quot;to&quot; parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportCloudRecordingQueryToSchema = z.iso
	.date()
	.describe("End date.")
	.meta({ examples: ["2022-01-28"] });

export const reportCloudRecordingQueryGroupIdSchema = z
	.string()
	.optional()
	.describe(
		"The group ID. To get a group ID, use the [**List groups**](/api-reference/zoom-api/methods#operation/groups) API. \n\n **Note:** The API response will only contain users who are members of the queried group ID.",
	)
	.meta({ examples: ["TaVA8QKik_1233"] });

export const reportCloudRecordingStatus200Schema = z
	.object({
		from: z.iso
			.date()
			.optional()
			.describe("Start date for this report")
			.meta({ examples: ["2021-12-01"] }),
		to: z.iso
			.date()
			.optional()
			.describe("End date for this report")
			.meta({ examples: ["2021-12-30"] }),
	})
	.extend({
		cloud_recording_storage: z
			.array(
				z.object({
					date: z.iso
						.date()
						.optional()
						.describe("Date of the usage")
						.meta({ examples: ["2021-12-05"] }),
					free_usage: z
						.string()
						.optional()
						.describe("Free storage")
						.meta({ examples: ["Unlimited"] }),
					plan_usage: z
						.string()
						.optional()
						.describe("Paid storage")
						.meta({ examples: ["3 TB"] }),
					usage: z
						.string()
						.optional()
						.describe("Storage used on the date")
						.meta({ examples: ["3 MB"] }),
				}),
			)
			.optional()
			.describe("Array of cloud usage objects"),
	});

export const reportCloudRecordingStatus400Schema = z.unknown();

export const reportCloudRecordingStatus429Schema = z.unknown();

export const reportCloudRecordingResponseSchema = reportCloudRecordingStatus200Schema;

export const reportCloudRecordingErrorSchema = z.union([
	reportCloudRecordingStatus400Schema,
	reportCloudRecordingStatus429Schema,
]);

export const reportDailyQueryYearSchema = z
	.int()
	.optional()
	.describe("Year for this report")
	.meta({ examples: [2022] });

export const reportDailyQueryMonthSchema = z
	.int()
	.optional()
	.describe("Month for this report")
	.meta({ examples: [3] });

export const reportDailyQueryGroupIdSchema = z
	.string()
	.optional()
	.describe(
		"The group ID. To get a group ID, use the [**List groups**](/docs/api/users/#tag/groups/GET/groups) API. \n\n **Note:** The API response will only contain users who are members of the queried group ID.",
	)
	.meta({ examples: ["TaVA8QKik_1233"] });

export const reportDailyStatus200Schema = z.object({
	dates: z
		.array(
			z.object({
				date: z.iso
					.date()
					.optional()
					.describe("Date for this object.")
					.meta({ examples: ["2022-03-01"] }),
				meeting_minutes: z
					.int()
					.optional()
					.describe("Number of meeting minutes on this date.")
					.meta({ examples: [34] }),
				meetings: z
					.int()
					.optional()
					.describe("Number of meetings on this date.")
					.meta({ examples: [2] }),
				new_users: z
					.int()
					.optional()
					.describe("Number of new users on this date.")
					.meta({ examples: [3] }),
				participants: z
					.int()
					.optional()
					.describe("Number of participants on this date.")
					.meta({ examples: [4] }),
			}),
		)
		.optional()
		.describe("Array of date objects."),
	month: z
		.int()
		.optional()
		.describe("Month for this report.")
		.meta({ examples: [3] }),
	year: z
		.int()
		.optional()
		.describe("Year for this report.")
		.meta({ examples: [2022] }),
});

export const reportDailyStatus400Schema = z.unknown();

export const reportDailyStatus429Schema = z.unknown();

export const reportDailyResponseSchema = reportDailyStatus200Schema;

export const reportDailyErrorSchema = z.union([
	reportDailyStatus400Schema,
	reportDailyStatus429Schema,
]);

export const getdisclaimerreportQueryFromSchema = z
	.string()
	.describe(
		"The start date in `yyyy-MM-dd` format. The date range defined by the `from` and `to` parameters should only be one month, as the report includes only one month's worth of data at once. It is the date range in which the disclaimer was generated.",
	)
	.meta({ examples: ["2026-01-15"] });

export const getdisclaimerreportQueryToSchema = z
	.string()
	.describe("The end date in `yyyy-MM-dd` format.")
	.meta({ examples: ["2026-01-16"] });

export const getdisclaimerreportQuerySearchValueSchema = z
	.string()
	.optional()
	.describe("The user email or meeting number")
	.meta({ examples: ["jchill@example.com"] });

export const getdisclaimerreportQueryDisclaimerTypeSchema = z
	.enum([
		"login",
		"joinMeeting",
		"recording",
		"remoteControl",
		"meetingConnector",
		"archive",
		"summary",
		"query",
		"AICompanion",
		"caption",
		"joinSDKMeeting",
		"NDI",
		"joinWebinar",
		"internalMMRGuestJoin",
		"liveStream",
		"phoneACR",
		"viewBOActivity",
		"webinarBO",
		"unmuteAudio",
		"joinOnZoom",
		"GDPR",
		"chinaMeeting",
		"zappJoin",
		"softUpdateReminder",
		"all",
	])
	.optional()
	.describe("The disclaimer type.")
	.meta({ examples: ["AICompanion"] });

export const getdisclaimerreportQueryGroupIdSchema = z
	.string()
	.optional()
	.describe("The user's group ID.")
	.meta({ examples: ["TaVA8QKik_1233"] });

export const getdisclaimerreportQueryPageSizeSchema = z
	.int()
	.optional()
	.describe("The number of records returned in a single API call.")
	.meta({ examples: [30] });

export const getdisclaimerreportQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const getdisclaimerreportStatus200Schema = z.object({
	disclaimer_records: z
		.array(
			z.object({
				disclaimer_status: z
					.enum(["Agree", "Cancel", "Passive Agree", "Decline Attend"])
					.optional()
					.describe("The disclaimer status.")
					.meta({ examples: ["Agree"] }),
				time: z
					.string()
					.optional()
					.describe("The disclaimer's generated time.")
					.meta({ examples: ["2026-01-15T10:17:35Z"] }),
				disclaimer_type: z
					.string()
					.optional()
					.describe("The disclaimer type.")
					.meta({ examples: ["AI Companion"] }),
				user_email: z
					.string()
					.optional()
					.describe(
						"The disclaimer's user email.\n\nThere are several special cases where user email display will be handled specially.\n- The client type is *gw.pstn*. The user email will be empty.\n- The user is guest. That is the `is_guest` is *true*. The user email will be empty.\n-  The meeting is Zoom Event. That is the `is_zoom_event` is *true*. The user email will be masked.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				meeting_number: z.coerce
					.bigint()
					.optional()
					.describe("The disclaimer's meeting number.")
					.meta({ examples: [93201235621] }),
				meeting_id: z
					.string()
					.optional()
					.describe("The disclaimer's meeting ID.")
					.meta({ examples: ["gm8s9L+PTEC+FG3sFbd1Cw=="] }),
				client_type: z
					.string()
					.optional()
					.describe("User login client types. When the user is a guest, the client type is empty.")
					.meta({ examples: ["iphone"] }),
				is_zoom_event: z
					.boolean()
					.optional()
					.describe("Whether the meeting is a Zoom Event.")
					.meta({ examples: [false] }),
				is_guest: z
					.boolean()
					.optional()
					.describe("Whether the user is a guest.")
					.meta({ examples: [true] }),
				group_ids: z.array(z.string()).min(0).max(20).optional().describe("The user's group IDs."),
				display_name: z
					.string()
					.optional()
					.describe("The disclaimer's user name.")
					.meta({ examples: ["Jill Chill"] }),
			}),
		)
		.min(1)
		.max(300)
		.optional()
		.describe("Array of disclaimer records."),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned in a single API call.")
		.meta({ examples: [30] }),
});

export const getdisclaimerreportStatus400Schema = z.unknown();

export const getdisclaimerreportStatus401Schema = z.unknown();

export const getdisclaimerreportStatus403Schema = z.unknown();

export const getdisclaimerreportStatus429Schema = z.unknown();

export const getdisclaimerreportResponseSchema = getdisclaimerreportStatus200Schema;

export const getdisclaimerreportErrorSchema = z.union([
	getdisclaimerreportStatus400Schema,
	getdisclaimerreportStatus401Schema,
	getdisclaimerreportStatus403Schema,
	getdisclaimerreportStatus429Schema,
]);

export const gethistorymeetingandwebinarlistQueryFromSchema = z
	.string()
	.describe(
		"The start date in `yyyy-mm-dd` format. The date range defined by the `from` and `to` parameters should only be one month, as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2024-12-23"] });

export const gethistorymeetingandwebinarlistQueryToSchema = z
	.string()
	.describe("The end date in `yyyy-mm-dd` format.")
	.meta({ examples: ["2024-12-24"] });

export const gethistorymeetingandwebinarlistQueryDateTypeSchema = z
	.enum(["start_time", "end_time"])
	.optional()
	.describe(
		"The type of date to query.\n* `start_time` - Query by meeting's start time. \n* `end_time` - Query by meeting's end time. \n\nThis value defaults to `start_time`.",
	)
	.meta({ examples: ["end_time"] });

export const gethistorymeetingandwebinarlistQueryMeetingTypeSchema = z
	.enum(["meeting", "webinar", "all"])
	.optional()
	.describe(
		"The meeting type to query. \n- `all` - rerturn meetings and webinars \n- `meeting` - only return meetings \n- `webinar` - only return webinars",
	)
	.meta({ examples: ["meeting"] });

export const gethistorymeetingandwebinarlistQueryReportTypeSchema = z
	.enum(["all", "poll", "survey", "qa", "resource", "reaction"])
	.optional()
	.describe(
		"Query meetings that have this type of report.\n- `all` - all meetings\n- `poll` - meetings with poll data \n- `survey` - meetings with survey data \n- `qa` - meetings with Q&A data \n- `resource` - meetings with resource link data \n- `reaction` - meetings with reaction data",
	)
	.meta({ examples: ["poll"] });

export const gethistorymeetingandwebinarlistQuerySearchKeySchema = z
	.string()
	.optional()
	.describe("The keywords of meeting topic or meeting ID.")
	.meta({ examples: ["my meeting"] });

export const gethistorymeetingandwebinarlistQueryPageSizeSchema = z
	.int()
	.optional()
	.describe("The number of records to be returned within a single API call.")
	.meta({ examples: [30] });

export const gethistorymeetingandwebinarlistQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const gethistorymeetingandwebinarlistQueryGroupIdSchema = z
	.string()
	.optional()
	.describe(
		"The group ID. To get a group ID, use the [**List groups**](/docs/api/rest/reference/user/methods/#operation/groups) API. \n\n **Note:** The API response will only contain users who are members of the queried group ID.",
	)
	.meta({ examples: ["TaVA8QKik_1233"] });

export const gethistorymeetingandwebinarlistQueryMeetingFeatureSchema = z
	.enum([
		"screen_sharing",
		"video_on",
		"remote_control",
		"closed_caption",
		"language_interpretation",
		"telephone_usage",
		"in_meeting_chat",
		"poll",
		"join_by_room",
		"waiting_room",
		"live_transcription",
		"reaction",
		"zoom_apps",
		"annotation",
		"raise_hand",
		"virtual_background",
		"whiteboard",
		"immersive_scene",
		"avatar",
		"switch_to_mobile",
		"file_sharing",
		"meeting_summary",
		"meeting_questions",
		"record_to_computer",
		"record_to_cloud",
		"live_translation",
		"registration",
		"smart_recording",
		"multi_speaker",
		"meeting_wallpaper",
		"gen_ai_virtual_background",
		"multi_share",
		"document_collaboration",
		"portrait_lighting",
		"personalized_audio_isolation",
		"color_themes",
	])
	.optional()
	.describe(
		"The meeting features to query and return history meetings that use one or more of these features. To provide multiple values, separate them with commas, like `meeting_summary,meeting_questions`",
	)
	.meta({ examples: ["meeting_summary"] });

export const gethistorymeetingandwebinarlistStatus200Schema = z.object({
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned with a single API call.")
		.meta({ examples: [30] }),
	history_meetings: z
		.array(
			z.object({
				meeting_uuid: z
					.string()
					.optional()
					.describe(
						"The meeting unique universal identifier (UUID). Double encode your UUID when using it for API calls if the UUID begins with a '/'or contains '//' in it.",
					)
					.meta({ examples: ["gm8s9L+PTEC+FG3sFbd1Cw=="] }),
				meeting_id: z.coerce
					.bigint()
					.optional()
					.describe(
						"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in &quot;**long**&quot; format(represented as int64 data type in JSON), also known as the meeting number.",
					)
					.meta({ examples: [93201235621] }),
				type: z
					.enum(["Meeting", "Webinar"])
					.optional()
					.describe("The meeting type, either Meeting or Webinar.")
					.meta({ examples: ["Meeting"] }),
				host_display_name: z
					.string()
					.optional()
					.describe("The host's display name.")
					.meta({ examples: ["Jill Chill"] }),
				host_email: z
					.string()
					.optional()
					.describe("The host's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				start_time: z
					.string()
					.optional()
					.describe("The meeting's start date and time.")
					.meta({ examples: ["2024-12-23T07:09:03Z"] }),
				end_time: z
					.string()
					.optional()
					.describe("The meeting's end date and time.")
					.meta({ examples: ["2024-12-23T08:09:03Z"] }),
				topic: z
					.string()
					.optional()
					.describe("The meeting's topic.")
					.meta({ examples: ["My Meeting"] }),
				participants: z
					.int()
					.optional()
					.describe("The number of meeting participants.")
					.meta({ examples: [5] }),
				duration: z
					.int()
					.optional()
					.describe("The meeting's duration, in minutes.")
					.meta({ examples: [60] }),
				total_participant_minutes: z
					.int()
					.optional()
					.describe("The total duration of all participants, in minutes.")
					.meta({ examples: [83] }),
				department: z
					.string()
					.optional()
					.describe("The host's department.")
					.meta({ examples: ["Developers"] }),
				group: z
					.array(z.string())
					.max(200)
					.optional()
					.describe("The host's groups")
					.meta({ examples: ["group_01"] }),
				source: z
					.string()
					.optional()
					.describe(
						"Whether the meeting was created directly through Zoom or via an API request: \n* If the meeting was created via an OAuth app, this field returns the OAuth app's name. \n* If the meeting was created via JWT or the Zoom Web Portal, this returns the `Zoom` value.",
					)
					.meta({ examples: ["Zoom"] }),
				unique_viewers: z
					.int()
					.optional()
					.describe(
						"This value shows how many people viewed the webinar on their computer. It does not include panelists or attendees who only listened by phone. Viewers who joined the meeting multiple times or from multiple devices are counted only once.",
					)
					.meta({ examples: [4] }),
				max_concurrent_views: z
					.int()
					.optional()
					.describe(
						"The maximum number of online viewers at the same time during the webinar, excluding panelists.",
					)
					.meta({ examples: [3] }),
				create_time: z
					.string()
					.optional()
					.describe("The meeting's create date and time.")
					.meta({ examples: ["2024-12-23T06:09:03Z"] }),
				custom_fields: z
					.array(
						z.object({
							key: z
								.string()
								.optional()
								.describe("The custom attribute's name.")
								.meta({ examples: ["attribute 1"] }),
							value: z
								.string()
								.optional()
								.describe("The custom attribute's value.")
								.meta({ examples: ["test"] }),
						}),
					)
					.max(5)
					.optional()
					.describe("The custom attributes that the host is assigned"),
				tracking_fields: z
					.array(
						z.object({
							field: z
								.string()
								.optional()
								.describe("The label of the tracking field.")
								.meta({ examples: ["Meeting purpose."] }),
							value: z
								.string()
								.optional()
								.describe("The value of the tracking field.")
								.meta({ examples: ["Support"] }),
						}),
					)
					.max(10)
					.optional()
					.describe("The tracking fields and values assigned to the meeting."),
				feature_used: z
					.object({
						screen_sharing: z
							.boolean()
							.optional()
							.describe("Whether the screen was shared in the meeting.")
							.meta({ examples: [true] }),
						video_on: z
							.boolean()
							.optional()
							.describe("Whether the video was on in the meeting.")
							.meta({ examples: [true] }),
						remote_control: z
							.boolean()
							.optional()
							.describe("Whether to use remote control in the meeting.")
							.meta({ examples: [true] }),
						closed_caption: z
							.boolean()
							.optional()
							.describe("Whether closed caption was enabled in the meeting.")
							.meta({ examples: [false] }),
						breakout_room: z
							.boolean()
							.optional()
							.describe("Whether breakout room was enabled in the meeting.")
							.meta({ examples: [false] }),
						language_interpretation: z
							.boolean()
							.optional()
							.describe("Whether language translation was used in the meeting.")
							.meta({ examples: [false] }),
						telephone_usage: z
							.boolean()
							.optional()
							.describe("Whether anyone has joined the meeting by telephone.")
							.meta({ examples: [true] }),
						in_meeting_chat: z
							.boolean()
							.optional()
							.describe("Whether anyone in the meeting has sent a message in the meeting chat.")
							.meta({ examples: [false] }),
						poll: z
							.boolean()
							.optional()
							.describe("Whether the meeting has poll data.")
							.meta({ examples: [true] }),
						join_by_room: z
							.boolean()
							.optional()
							.describe("Whether anyone has joined the meeting by Zoom Room.")
							.meta({ examples: [false] }),
						waiting_room: z
							.boolean()
							.optional()
							.describe("Whether to open the waiting room for the meeting.")
							.meta({ examples: [false] }),
						live_transcription: z
							.boolean()
							.optional()
							.describe("Whether live transcription was turned on.")
							.meta({ examples: [false] }),
						reaction: z
							.boolean()
							.optional()
							.describe("Whether anyone sent an emoticon.")
							.meta({ examples: [true] }),
						zoom_apps: z
							.boolean()
							.optional()
							.describe("Whether the Zoom app was used in the meeting.")
							.meta({ examples: [false] }),
						annotation: z
							.boolean()
							.optional()
							.describe("Whether annotation was used in the meeting.")
							.meta({ examples: [false] }),
						raise_hand: z
							.boolean()
							.optional()
							.describe("Whether anyone has raised hand in the meeting.")
							.meta({ examples: [true] }),
						virtual_background: z
							.boolean()
							.optional()
							.describe("Whether anyone used a virtual background in the meeting.")
							.meta({ examples: [true] }),
						whiteboard: z
							.boolean()
							.optional()
							.describe("Whether a whiteboard was used in the meeting.")
							.meta({ examples: [true] }),
						immersive_scene: z
							.boolean()
							.optional()
							.describe("Whether immersive scene was enabled in then meeting.")
							.meta({ examples: [false] }),
						avatar: z
							.boolean()
							.optional()
							.describe("Whether anyone used an avatar in the meeting.")
							.meta({ examples: [true] }),
						switch_to_mobile: z
							.boolean()
							.optional()
							.describe("Whether anyone switched the meeting to their mobile phone.")
							.meta({ examples: [false] }),
						file_sharing: z
							.boolean()
							.optional()
							.describe("Whether anyone sent files in the meeting chat.")
							.meta({ examples: [true] }),
						meeting_summary: z
							.boolean()
							.optional()
							.describe("Whether the meeting summary was enabled.")
							.meta({ examples: [false] }),
						meeting_questions: z
							.boolean()
							.optional()
							.describe("Whether the meeting questions was enabled.")
							.meta({ examples: [false] }),
						record_to_computer: z
							.boolean()
							.optional()
							.describe("Whether to record the meeting to the local computer.")
							.meta({ examples: [true] }),
						record_to_cloud: z
							.boolean()
							.optional()
							.describe("Whether to record the meeting to the cloud.")
							.meta({ examples: [true] }),
						live_translation: z
							.boolean()
							.optional()
							.describe("Whether live translation was used in the meeting.")
							.meta({ examples: [false] }),
						registration: z
							.boolean()
							.optional()
							.describe("Whether registration was enabled for the meeting.")
							.meta({ examples: [false] }),
						smart_recording: z
							.boolean()
							.optional()
							.describe("Whether smart recording was enabled for the meeting.")
							.meta({ examples: [true] }),
						multi_speaker: z
							.boolean()
							.optional()
							.describe("Whether anyone used the multi-speaker view in the meeting.")
							.meta({ examples: [false] }),
						meeting_wallpaper: z
							.boolean()
							.optional()
							.describe("Whether host set wallpaper in the meeting.")
							.meta({ examples: [true] }),
						gen_ai_virtual_background: z
							.boolean()
							.optional()
							.describe("Whether anyone used the GenAI virtual background in the meeting.")
							.meta({ examples: [true] }),
						multi_share: z
							.boolean()
							.optional()
							.describe("Whether multi-share was used in the meeting")
							.meta({ examples: [true] }),
						document_collaboration: z
							.boolean()
							.optional()
							.describe("Whether anyone shared the document in the meeting.")
							.meta({ examples: [false] }),
						portrait_lighting: z
							.boolean()
							.optional()
							.describe("Whether anyone used portrait lighting in the meeting.")
							.meta({ examples: [false] }),
						personalized_audio_isolation: z
							.boolean()
							.optional()
							.describe("Whether anyone used personalized audio isolation in the meeting.")
							.meta({ examples: [true] }),
						color_themes: z
							.boolean()
							.optional()
							.describe("Whether anyone used color themes in the meeting.")
							.meta({ examples: [false] }),
					})
					.optional()
					.describe("Features used in the meeting."),
			}),
		)
		.max(300)
		.optional()
		.describe("Array of history meetings."),
});

export const gethistorymeetingandwebinarlistStatus400Schema = z.unknown();

export const gethistorymeetingandwebinarlistStatus401Schema = z.unknown();

export const gethistorymeetingandwebinarlistStatus403Schema = z.unknown();

export const gethistorymeetingandwebinarlistStatus429Schema = z.unknown();

export const gethistorymeetingandwebinarlistResponseSchema =
	gethistorymeetingandwebinarlistStatus200Schema;

export const gethistorymeetingandwebinarlistErrorSchema = z.union([
	gethistorymeetingandwebinarlistStatus400Schema,
	gethistorymeetingandwebinarlistStatus401Schema,
	gethistorymeetingandwebinarlistStatus403Schema,
	gethistorymeetingandwebinarlistStatus429Schema,
]);

export const reportMeetingactivitylogsQueryFromSchema = z.iso
	.date()
	.describe(
		"The start date in 'yyyy-MM-dd'format. The date range defined by the `from` and `to` parameters should only be one month, as the report includes only one month's worth of data at once.",
	)
	.meta({ examples: ["2024-03-01"] });

export const reportMeetingactivitylogsQueryToSchema = z.iso
	.date()
	.describe("The end date 'yyyy-MM-dd' format.")
	.meta({ examples: ["2024-03-04"] });

export const reportMeetingactivitylogsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records to be returned within a single API call.")
	.meta({ examples: [30] });

export const reportMeetingactivitylogsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] });

export const reportMeetingactivitylogsQueryMeetingNumberSchema = z
	.string()
	.optional()
	.describe("The meeting's number.")
	.meta({ examples: ["4221901192"] });

export const reportMeetingactivitylogsQuerySearchKeySchema = z
	.string()
	.optional()
	.describe("An operator's name or email.")
	.meta({ examples: ["Eileen"] });

export const reportMeetingactivitylogsQueryActivityTypeSchema = z
	.enum([
		"All Activities",
		"Meeting Created",
		"Meeting Started",
		"User Join",
		"User Left",
		"Remote Control",
		"In-Meeting Chat",
		"Meeting Ended",
	])
	.default("All Activities")
	.describe(
		"Activity type. \n-1 - All activities. \n0 - Meeting created. \n1 - Meeting started. \n2 - User joined. \n3 - User left. \n4 - Remote control. \n5 - In-meeting chat. \n9 - Meeting ended.",
	)
	.meta({ examples: ["All Activities"] });

export const reportMeetingactivitylogsStatus200Schema = z
	.object({
		meeting_activity_logs: z
			.array(
				z.object({
					meeting_number: z
						.string()
						.describe("The meeting number.")
						.meta({ examples: ["982 610 0285"] }),
					activity_time: z
						.string()
						.describe("The operator's activity time.")
						.meta({ examples: ["2024-03-21 07:09:03:216"] }),
					operator: z
						.string()
						.describe("The operator's display name.")
						.meta({ examples: ["Jill Chill"] }),
					operator_email: z
						.string()
						.describe("The operator's email.")
						.meta({ examples: ["jillchill@example.com"] }),
					activity_category: z
						.string()
						.describe(
							"The operator's activity category. \n-1 - All Activities. \n0 - Meeting created. \n1 - Meeting started. \n2 - User joined. \n3 - User left. \n4 - Remote control. \n5 - In-meeting chat. \n9 - Meeting ended.",
						)
						.meta({ examples: ["Meeting Started"] }),
					activity_detail: z
						.string()
						.describe("The operator's activity detail.")
						.meta({ examples: ["Meeting Started"] }),
				}),
			)
			.max(300)
			.optional()
			.describe("Array of meeting activity logs."),
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["z5qFlq5cvH7C46k7PT7BQmpnW6izoOUWWt3"] }),
		page_size: z
			.number()
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
	})
	.describe("Report object");

export const reportMeetingactivitylogsStatus400Schema = z.unknown();

export const reportMeetingactivitylogsStatus403Schema = z.unknown();

export const reportMeetingactivitylogsStatus404Schema = z.unknown();

export const reportMeetingactivitylogsStatus429Schema = z.unknown();

export const reportMeetingactivitylogsResponseSchema = reportMeetingactivitylogsStatus200Schema;

export const reportMeetingactivitylogsErrorSchema = z.union([
	reportMeetingactivitylogsStatus400Schema,
	reportMeetingactivitylogsStatus403Schema,
	reportMeetingactivitylogsStatus404Schema,
	reportMeetingactivitylogsStatus429Schema,
]);

export const reportMeetingDetailsPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API returns a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) the meeting UUID before making an API request.",
	);

export const reportMeetingDetailsStatus200Schema = z.object({
	custom_keys: z
		.array(
			z.object({
				key: z
					.string()
					.max(64)
					.optional()
					.describe("Custom key associated with the user.")
					.meta({ examples: ["Host Nation"] }),
				value: z
					.string()
					.max(256)
					.optional()
					.describe("Value of the custom key associated with the user.")
					.meta({ examples: ["US"] }),
			}),
		)
		.max(10)
		.optional()
		.describe("Custom keys and values assigned to the meeting."),
	dept: z
		.string()
		.optional()
		.describe("Department of the host.")
		.meta({ examples: ["HR"] }),
	duration: z
		.int()
		.optional()
		.describe("Meeting duration.")
		.meta({ examples: [2] }),
	end_time: z.iso
		.datetime()
		.optional()
		.describe("Meeting end time.")
		.meta({ examples: ["2022-03-15T07:42:22Z"] }),
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in &quot;**long**&quot; format(represented as int64 data type in JSON), also known as the meeting number.",
		)
		.meta({ examples: [3927350525] }),
	participants_count: z
		.int()
		.optional()
		.describe("Number of meeting participants.")
		.meta({ examples: [2] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("Meeting start time.")
		.meta({ examples: ["2022-03-15T07:40:46Z"] }),
	topic: z
		.string()
		.optional()
		.describe("Meeting topic.")
		.meta({ examples: ["My Meeting"] }),
	total_minutes: z
		.int()
		.optional()
		.describe(
			"Number of meeting minutes. This represents the total amount of meeting minutes attended by each participant including the host, for meetings hosted by the user. For instance if there were one host(named A) and one participant(named B) in a meeting, the value of total_minutes would be calculated as below:\n\n**total_minutes** = Total Meeting Attendance Minutes of A + Total Meeting Attendance Minutes of B",
		)
		.meta({ examples: [3] }),
	tracking_fields: z
		.array(
			z.object({
				field: z
					.string()
					.optional()
					.describe("Tracking fields type.")
					.meta({ examples: ["Host Nation"] }),
				value: z
					.string()
					.optional()
					.describe("Tracking fields value.")
					.meta({ examples: ["US"] }),
			}),
		)
		.optional()
		.describe("Tracking fields."),
	type: z
		.int()
		.optional()
		.describe("Meeting type.")
		.meta({ examples: [2] }),
	user_email: z
		.string()
		.optional()
		.describe("User email.")
		.meta({ examples: ["jchill@example.com"] }),
	user_name: z
		.string()
		.optional()
		.describe("User display name.")
		.meta({ examples: ["Jill Chill"] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"Meeting UUID. Each meeting instance will generate its own UUID(i.e., after a meeting ends, a new UUID will be generated for the next instance of the meeting). [Double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a '/' or contains '//' in it.",
		)
		.meta({ examples: ["iOTQZPmhTUq5a232ETb9eg=="] }),
});

export const reportMeetingDetailsStatus400Schema = z.unknown();

export const reportMeetingDetailsStatus404Schema = z.unknown();

export const reportMeetingDetailsStatus429Schema = z.unknown();

export const reportMeetingDetailsResponseSchema = reportMeetingDetailsStatus200Schema;

export const reportMeetingDetailsErrorSchema = z.union([
	reportMeetingDetailsStatus400Schema,
	reportMeetingDetailsStatus404Schema,
	reportMeetingDetailsStatus429Schema,
]);

export const reportMeetingParticipantsPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	)
	.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] });

export const reportMeetingParticipantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportMeetingParticipantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const reportMeetingParticipantsQueryIncludeFieldsSchema = z
	.enum(["registrant_id"])
	.optional()
	.describe(
		"Provide `registrant_id` as the value for this field if you would like to see the registrant ID attribute in the response of this API call. A registrant ID is a unique identifier of a [meeting registrant](/docs/api-reference/zoom-api/methods#operation/meetingRegistrants).",
	)
	.meta({ examples: ["registrant_id"] });

export const reportMeetingParticipantsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned within a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages.")
			.meta({ examples: [1] }),
	})
	.extend({
		participants: z
			.array(
				z.object({
					customer_key: z
						.string()
						.max(35)
						.optional()
						.describe(
							"The participant's SDK identifier. This value can be alphanumeric, up to a maximum length of 35 characters.",
						)
						.meta({ examples: ["349589LkJyeW"] }),
					duration: z
						.int()
						.optional()
						.describe(
							"Participant duration, in seconds, calculated by subtracting the `leave_time` from the `join_time` for the `user_id`. If the participant leaves and rejoins the same meeting, they are assigned a different `user_id` and Zoom displays their new duration in a separate object. Because of this, the duration may not reflect the total time the user was in the meeting.",
						)
						.meta({ examples: [259] }),
					failover: z
						.boolean()
						.optional()
						.describe("Indicates if failover happened during the meeting.")
						.meta({ examples: [false] }),
					id: z
						.string()
						.optional()
						.describe(
							"The participant's universally unique ID (UUID). \n* If the participant joins the meeting by logging into Zoom, this value is the `id` value in the [**Get a user**](/docs/api-reference/zoom-api/methods#operation/user) API response. \n* If the participant joins the meeting **without** logging into Zoom, this returns an empty string value. \n\n**Note:** Use the `participant_user_id` value instead of this value. We will remove this response in a future release.",
						)
						.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
					join_time: z.iso
						.datetime()
						.optional()
						.describe("Participant join time.")
						.meta({ examples: ["2022-03-23T06:58:09Z"] }),
					leave_time: z.iso
						.datetime()
						.optional()
						.describe("Participant leave time.")
						.meta({ examples: ["2022-03-23T07:02:28Z"] }),
					name: z
						.string()
						.optional()
						.describe(
							"Participant display name.\n\nThis returns an empty string value if the account calling the API is a BAA account.",
						)
						.meta({ examples: ["example"] }),
					registrant_id: z
						.string()
						.optional()
						.describe(
							"Unique identifier of the registrant. This field is only returned if you entered &quot;registrant_id&quot; as the value of `include_fields` query parameter.",
						)
						.meta({ examples: ["abcdefghij0-klmnopq23456"] }),
					status: z
						.enum(["in_meeting", "in_waiting_room"])
						.optional()
						.describe(
							"The participant's status. \n* `in_meeting` - In a meeting. \n* `in_waiting_room` - In a waiting room.",
						)
						.meta({ examples: ["in_meeting"] }),
					user_email: z
						.string()
						.optional()
						.describe(
							"Participant email.\n\nIf the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](/docs/api-reference/using-zoom-apis#email-address) for details. This returns an empty string value if the account calling the API is a BAA account.",
						)
						.meta({ examples: ["jchill@example.com"] }),
					user_id: z
						.string()
						.optional()
						.describe(
							"Participant ID. This is a unique ID assigned to the participant joining a meeting and is valid for that meeting only.",
						)
						.meta({ examples: ["27423744"] }),
					bo_mtg_id: z
						.string()
						.optional()
						.describe(
							"The [breakout room](https://support.zoom.us/hc/en-us/articles/206476313-Managing-breakout-rooms) ID. Each breakout room is assigned a unique ID.",
						)
						.meta({ examples: ["27423744"] }),
					participant_user_id: z
						.string()
						.optional()
						.describe(
							"The participant's universally unique ID (UUID). \n* If the participant joins the meeting by logging into Zoom, this value is the `id` value in the [**Get a user**](/docs/api-reference/zoom-api/methods#operation/user) API response. \n* If the participant joins the meeting **without** logging into Zoom, this returns an empty string value.",
						)
						.meta({ examples: ["DYHrdpjrS3uaOf7dPkkg8w"] }),
				}),
			)
			.optional()
			.describe("Array of meeting participant objects."),
	});

export const reportMeetingParticipantsStatus400Schema = z.unknown();

export const reportMeetingParticipantsStatus404Schema = z.unknown();

export const reportMeetingParticipantsStatus429Schema = z.unknown();

export const reportMeetingParticipantsResponseSchema = reportMeetingParticipantsStatus200Schema;

export const reportMeetingParticipantsErrorSchema = z.union([
	reportMeetingParticipantsStatus400Schema,
	reportMeetingParticipantsStatus404Schema,
	reportMeetingParticipantsStatus429Schema,
]);

export const reportMeetingPollsPathMeetingIdSchema = z
	.union([z.int(), z.string()])
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) the meeting UUID before making an API request.",
	);

export const reportMeetingPollsStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID).",
		)
		.meta({ examples: [123456] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"The meeting's universally unique identifier (UUID). Each meeting instance generates a meeting UUID.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start time.")
		.meta({ examples: ["2022-02-01T12:34:12.66Z"] }),
	questions: z
		.array(
			z.object({
				email: z
					.email()
					.optional()
					.describe("The participant's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"The participant's display name. If the **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill Chill"] }),
				first_name: z
					.string()
					.optional()
					.describe(
						"The participant's first name. If the **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `first_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill"] }),
				last_name: z
					.string()
					.optional()
					.describe(
						"The participant's last name. If the **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `last_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe("The user's given answer.")
								.meta({ examples: ["I am wonderful."] }),
							date_time: z
								.string()
								.optional()
								.describe("The date and time at which the user answered the poll question.")
								.meta({ examples: ["2022-02-01T12:37:12.660Z"] }),
							polling_id: z
								.string()
								.optional()
								.describe("The poll's ID.")
								.meta({ examples: ["798fGJEWrA"] }),
							question: z
								.string()
								.optional()
								.describe("The poll question.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional()
					.describe("Information about the user's questions and answers."),
			}),
		)
		.optional()
		.describe("Information about the meeting questions."),
});

export const reportMeetingPollsStatus400Schema = z.unknown();

export const reportMeetingPollsStatus404Schema = z.unknown();

export const reportMeetingPollsStatus429Schema = z.unknown();

export const reportMeetingPollsResponseSchema = reportMeetingPollsStatus200Schema;

export const reportMeetingPollsErrorSchema = z.union([
	reportMeetingPollsStatus400Schema,
	reportMeetingPollsStatus404Schema,
	reportMeetingPollsStatus429Schema,
]);

export const reportMeetingQAPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	);

export const reportMeetingQAStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"The meeting ID in `long` format, represented as int64 data type in JSON. Also known as the meeting number.",
		)
		.meta({ examples: [245603123123] }),
	questions: z
		.array(
			z.object({
				user_id: z
					.string()
					.optional()
					.describe(
						"The user ID of the user who asked the question. This value returns blank for external users.",
					)
					.meta({ examples: ["hyROrs0TRCSvwmadI7L13w"] }),
				email: z
					.string()
					.optional()
					.describe(
						"Participant's email. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchilll@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"Participant's display name.  \n  \n\nIf the anonymous [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Getting-Started-with-Question-Answer) option is enabled and if a participant submits the Q&amp;A without providing their name, the value of the `name` field is &quot;Anonymous Attendee&quot;.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe(
									"The given answer. If this is a live answer, the value is 'live answered'.\n**Note:** All answers will be returned together and separated by semicolons. For more detailed answer information, please see the \"answer_details\" field.",
								)
								.meta({ examples: ["fine"] }),
							question: z
								.string()
								.optional()
								.describe("Asked question.")
								.meta({ examples: ["how are you"] }),
							question_id: z
								.string()
								.optional()
								.describe("Question UUID.")
								.meta({ examples: ["zxU4wOwnlxs"] }),
							create_time: z
								.string()
								.optional()
								.describe("Question create time.")
								.meta({ examples: ["2022-03-15T07:48:00Z"] }),
							question_status: z
								.enum(["default", "open", "dismissed", "answered", "deleted"])
								.optional()
								.describe("Question status.\nIf not supported, the value will be `default`.")
								.meta({ examples: ["open"] }),
							answer_details: z
								.array(
									z.object({
										user_id: z
											.string()
											.optional()
											.describe(
												"The user ID of the user who answered the question. This value returns blank for external users.",
											)
											.meta({ examples: ["Cn_5wJ9mRNGyYOmpjVufBQ"] }),
										name: z
											.string()
											.optional()
											.describe("User display name, including the host or participant.")
											.meta({ examples: ["Paul"] }),
										email: z
											.string()
											.optional()
											.describe(
												"Participant's email. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
											)
											.meta({ examples: ["paul@example.com"] }),
										content: z
											.string()
											.max(1024)
											.optional()
											.describe("The answer from host or the comment from participant.")
											.meta({ examples: ["fine"] }),
										create_time: z
											.string()
											.optional()
											.describe("Content submit time.")
											.meta({ examples: ["2022-03-15T07:50:00Z"] }),
										type: z
											.enum([
												"default",
												"host_answered_publicly",
												"host_answered_privately",
												"participant_commented",
												"host_answered",
											])
											.optional()
											.default("default")
											.describe("Type of answer.")
											.meta({ examples: ["default"] }),
									}),
								)
								.optional()
								.describe("Array of answers from the user."),
						}),
					)
					.optional()
					.describe("Array of questions from user."),
			}),
		)
		.optional()
		.describe("Array of meeting question objects."),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("Meeting start time.")
		.meta({ examples: ["2022-03-15T07:40:46Z"] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"The meeting UUID. Each meeting instance will generate its own UUID - for example, after a meeting ends, a new UUID will be generated for the next instance of the meeting. Double-encode your UUID when using it for API calls if the UUID begins with a '/' or contains '//'.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
});

export const reportMeetingQAStatus400Schema = z.unknown();

export const reportMeetingQAStatus404Schema = z.unknown();

export const reportMeetingQAStatus429Schema = z.unknown();

export const reportMeetingQAResponseSchema = reportMeetingQAStatus200Schema;

export const reportMeetingQAErrorSchema = z.union([
	reportMeetingQAStatus400Schema,
	reportMeetingQAStatus404Schema,
	reportMeetingQAStatus429Schema,
]);

export const reportMeetingSurveyPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's ID or universally unique ID (UUID). \n* If you provide a meeting ID, the API will return a response for the latest meeting instance. \n* If you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	);

export const reportMeetingSurveyStatus200Schema = z.object({
	meeting_id: z.coerce
		.bigint()
		.optional()
		.describe("The meeting ID.")
		.meta({ examples: [123456] }),
	meeting_uuid: z
		.string()
		.optional()
		.describe(
			"The meeting's universally unique identifier (UUID). Each meeting instance generates a meeting UUID.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start time.")
		.meta({ examples: ["2022-02-01T12:34:12.66Z"] }),
	survey_id: z
		.string()
		.optional()
		.describe("The survey's ID")
		.meta({ examples: ["8SFHRTGHAAAiAAAAAiAiAiiAii=="] }),
	survey_name: z
		.string()
		.optional()
		.describe("The name of survey")
		.meta({ examples: ["Survey of this meeting"] }),
	survey_answers: z
		.array(
			z.object({
				email: z
					.email()
					.optional()
					.describe("The participant's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"The participant's display name. **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill Chill"] }),
				first_name: z
					.string()
					.optional()
					.describe(
						"The participant's first name. If the **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `first_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill"] }),
				last_name: z
					.string()
					.optional()
					.describe(
						"The participant's last name. If the **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `last_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Chill"] }),
				answer_details: z
					.array(
						z.object({
							question: z
								.string()
								.optional()
								.describe("The survey question.")
								.meta({ examples: ["How are you?"] }),
							question_id: z
								.string()
								.optional()
								.describe("The question's ID")
								.meta({ examples: ["798fGJEWrA"] }),
							answer: z
								.string()
								.optional()
								.describe("The user's given answer.")
								.meta({ examples: ["I am wonderful."] }),
							date_time: z
								.string()
								.optional()
								.describe("The date and time at which the user answered the survey question.")
								.meta({ examples: ["2022-02-01T12:37:12.660Z"] }),
						}),
					)
					.optional()
					.describe("Information about the user's questions and answers."),
			}),
		)
		.optional()
		.describe("Information about the survey questions and answers."),
});

export const reportMeetingSurveyStatus400Schema = z.unknown();

export const reportMeetingSurveyStatus404Schema = z.unknown();

export const reportMeetingSurveyStatus429Schema = z.unknown();

export const reportMeetingSurveyResponseSchema = reportMeetingSurveyStatus200Schema;

export const reportMeetingSurveyErrorSchema = z.union([
	reportMeetingSurveyStatus400Schema,
	reportMeetingSurveyStatus404Schema,
	reportMeetingSurveyStatus429Schema,
]);

export const reportOperationLogsQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' or 'yyyy-MM-dd HH:mm' format. The date range defined by the `from` and `to` parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportOperationLogsQueryToSchema = z.iso
	.date()
	.describe("End date in 'yyyy-mm-dd' or 'yyyy-MM-dd HH:mm' format.")
	.meta({ examples: ["2022-01-28"] });

export const reportOperationLogsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportOperationLogsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const reportOperationLogsQueryCategoryTypeSchema = z
	.enum([
		"all",
		"user",
		"user_settings",
		"account",
		"billing",
		"im",
		"recording",
		"phone_contacts",
		"webinar",
		"sub_account",
		"role",
		"zoom_rooms",
	])
	.optional()
	.describe(
		"**Optional**  \n \nFilter your response by a category type to see reports for a specific category.\nThe value for this field can be one of the following:  \n  `all`  \n `user`  \n `user_settings`  \n `account`  \n `billing`  \n `im`  \n `recording`  \n `phone_contacts`  \n `webinar`  \n `sub_account`  \n `role`  \n `zoom_rooms`",
	)
	.meta({ examples: ["user"] });

export const reportOperationLogsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of the available result list exceeds the page size. The expiration period is 15 minutes.",
			)
			.meta({ examples: ["uBTK3NzNksdkuCUAQaFVFd86kyOr59zg4U2"] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The amount of records returns within a single API call. ")
			.meta({ examples: [30] }),
	})
	.extend({
		operation_logs: z
			.array(
				z.object({
					action: z
						.string()
						.optional()
						.describe("Action")
						.meta({ examples: ["delete"] }),
					category_type: z
						.string()
						.optional()
						.describe("Category type")
						.meta({ examples: ["user"] }),
					operation_detail: z
						.string()
						.optional()
						.describe("Operation detail")
						.meta({ examples: ["delete user - user2@example.com"] }),
					operator: z
						.string()
						.optional()
						.describe("The user who performed the operation.")
						.meta({ examples: ["admin@example.com"] }),
					time: z.iso
						.datetime()
						.optional()
						.describe("The time at which the operation was performed.")
						.meta({ examples: ["2022-01-25T17:52:16Z"] }),
				}),
			)
			.optional()
			.describe("Array of operation log objects"),
	});

export const reportOperationLogsStatus400Schema = z.unknown();

export const reportOperationLogsStatus429Schema = z.unknown();

export const reportOperationLogsResponseSchema = reportOperationLogsStatus200Schema;

export const reportOperationLogsErrorSchema = z.union([
	reportOperationLogsStatus400Schema,
	reportOperationLogsStatus429Schema,
]);

export const getremotesupportreportQueryFromSchema = z
	.string()
	.describe(
		"The start date in `yyyy-MM-dd` format. The date range defined by the `from` and `to` parameters should only be one month, as the report includes only one month's worth of data at once. It is the date range for remote support to start.",
	)
	.meta({ examples: ["2025-09-15"] });

export const getremotesupportreportQueryToSchema = z
	.string()
	.describe("The end date in `yyyy-MM-dd` format.")
	.meta({ examples: ["2025-09-16"] });

export const getremotesupportreportQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const getremotesupportreportQueryPageSizeSchema = z
	.string()
	.optional()
	.describe("The number of records to be returned within a single API call.")
	.meta({ examples: ["30"] });

export const getremotesupportreportStatus200Schema = z.object({
	remote_support_logs: z
		.array(
			z.object({
				meeting_start_time: z
					.string()
					.optional()
					.describe("The meeting's start time.")
					.meta({ examples: ["2025-09-15T13:20:12Z"] }),
				meeting_uuid: z
					.string()
					.optional()
					.describe(
						"The meeting's unique universal identifier (UUID). Double encode your UUID when using it for API calls if the UUID begins with a '/'or contains '//' in it.",
					)
					.meta({ examples: ["gm8s9L+PTEC+FG3sFbd1Cw=="] }),
				meeting_number: z
					.int()
					.optional()
					.describe("The meeting number.")
					.meta({ examples: [93201235621] }),
				topic: z
					.string()
					.optional()
					.describe("The meeting's topic.")
					.meta({ examples: ["My Meeting"] }),
				meeting_host_id: z
					.string()
					.optional()
					.describe("The meeting's host id.")
					.meta({ examples: ["FyOCGDLEShWSihPcupWHtA"] }),
				supporter_name: z
					.string()
					.optional()
					.describe("The supporter's user name.")
					.meta({ examples: ["Jill Chill"] }),
				supporter_email: z
					.string()
					.optional()
					.describe("The supporter's user email.")
					.meta({ examples: ["jchill@example.com"] }),
				supportee_name: z
					.string()
					.optional()
					.describe("The supportee's user name.")
					.meta({ examples: ["Tom"] }),
				supportee_email: z
					.string()
					.optional()
					.describe("The supportee's user email.")
					.meta({ examples: ["tom@example.com"] }),
				request_time: z
					.string()
					.optional()
					.describe("The time to request remote support.")
					.meta({ examples: ["2025-09-15T13:21:29Z"] }),
				wait_time: z
					.string()
					.optional()
					.describe(
						"The waiting time for remote support from request to start, formatted in `hh:mm:ss`.",
					)
					.meta({ examples: ["01:28"] }),
				start_time: z
					.string()
					.optional()
					.describe("Remote support start time.")
					.meta({ examples: ["2025-09-15T13:22:57Z"] }),
				end_time: z
					.string()
					.optional()
					.describe("Remote support end time")
					.meta({ examples: ["2025-09-15T13:42:34Z"] }),
				duration: z
					.string()
					.optional()
					.describe("The duration of remote support, formatted in `hh:mm:ss`.")
					.meta({ examples: ["19:37"] }),
			}),
		)
		.optional()
		.describe("Array of remote support logs."),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
	page_size: z
		.int()
		.optional()
		.describe("The number of records returned with a single API call.")
		.meta({ examples: [30] }),
});

export const getremotesupportreportStatus400Schema = z.unknown();

export const getremotesupportreportStatus401Schema = z.unknown();

export const getremotesupportreportStatus429Schema = z.unknown();

export const getremotesupportreportResponseSchema = getremotesupportreportStatus200Schema;

export const getremotesupportreportErrorSchema = z.union([
	getremotesupportreportStatus400Schema,
	getremotesupportreportStatus401Schema,
	getremotesupportreportStatus429Schema,
]);

export const reportTelephoneQueryTypeSchema = z
	.enum(["1", "2", "3"])
	.optional()
	.default("1")
	.describe(
		"Audio types:  \n `1` - Toll-free Call-in &amp; Call-out.  \n `2` - Toll   \n \n`3` - SIP Connected Audio",
	)
	.meta({ examples: ["3"] });

export const reportTelephoneQueryQueryDateTypeSchema = z
	.enum(["start_time", "end_time", "meeting_start_time", "meeting_end_time"])
	.optional()
	.default("start_time")
	.describe(
		"The type of date to query. \n* `start_time` &mdash; Query by call start time. \n* `end_time` &mdash; Query by call end time. \n* `meeting_start_time` &mdash; Query by meeting start time. \n* `meeting_end_time` &mdash; Query by meeting end time. \n\nThis value defaults to `start_time`.",
	)
	.meta({ examples: ["start_time"] });

export const reportTelephoneQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' format. The date range defined by the &quot;from&quot; and &quot;to&quot; parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportTelephoneQueryToSchema = z.iso
	.date()
	.describe("End date.")
	.meta({ examples: ["2022-01-28"] });

export const reportTelephoneQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportTelephoneQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"The page number of the current page in the returned records. This field is **not** available if the `query_date_type` parameter is the `meeting_start_time` or `meeting_end_time` value. \n\nThis field is deprecated. Use the `next_page_token` query parameter for pagination.",
	)
	.meta({ examples: [1] });

export const reportTelephoneQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] });

export const reportTelephoneStatus200Schema = z
	.object({
		from: z.iso
			.date()
			.optional()
			.describe("Start date for this report.")
			.meta({ examples: ["2019-06-20"] }),
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgk"] }),
		page_count: z
			.int()
			.optional()
			.describe(
				"The number of pages returned for the request made. This field does **not** return if the `query_date_type` parameter is the `meeting_start_time` or `meeting_end_time` value.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.optional()
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		to: z.iso
			.date()
			.optional()
			.describe("End date for this report.")
			.meta({ examples: ["2019-07-20"] }),
		total_records: z
			.int()
			.optional()
			.describe(
				"The total number of all the records available across pages. This field does **not** return if the `query_date_type` parameter is the `meeting_start_time` or `meeting_end_time` value.",
			)
			.meta({ examples: [1] }),
	})
	.extend({
		telephony_usage: z
			.array(
				z.object({
					call_in_number: z
						.string()
						.optional()
						.describe("Caller's call-in number.")
						.meta({ examples: ["ZoomGW"] }),
					country_name: z
						.string()
						.optional()
						.describe("Country name.")
						.meta({ examples: ["US"] }),
					dept: z
						.string()
						.optional()
						.describe("User department.")
						.meta({ examples: ["HR"] }),
					duration: z
						.int()
						.optional()
						.describe("Call leg duration")
						.meta({ examples: [2] }),
					end_time: z.iso
						.datetime()
						.optional()
						.describe("Call leg end time")
						.meta({ examples: ["2022-03-15T07:42:22Z"] }),
					host_email: z
						.string()
						.optional()
						.describe("User email.")
						.meta({ examples: ["jchill@example.com"] }),
					host_id: z
						.string()
						.optional()
						.describe("The user ID of the meeting host.")
						.meta({ examples: ["_Rn_hal7ToG5p0AWwIIsjQ"] }),
					host_name: z
						.string()
						.optional()
						.describe("User display name.")
						.meta({ examples: ["Jill Chill"] }),
					meeting_id: z.coerce
						.bigint()
						.optional()
						.describe(
							"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in &quot;**long**&quot; format(represented as int64 data type in JSON), also known as the meeting number.",
						)
						.meta({ examples: [94908911701] }),
					meeting_type: z
						.string()
						.optional()
						.describe("Meeting type.")
						.meta({ examples: ["Meeting"] }),
					phone_number: z
						.string()
						.optional()
						.describe("Toll-free telephone number. ")
						.meta({ examples: ["+1 8243"] }),
					rate: z
						.number()
						.optional()
						.describe("Calling rate for the telephone call.")
						.meta({ examples: [0.03] }),
					signaled_number: z
						.string()
						.optional()
						.describe("The number that is signaled to Zoom. ")
						.meta({ examples: ["+1 8243"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Call leg start time")
						.meta({ examples: ["2022-03-15T07:40:46Z"] }),
					total: z
						.number()
						.optional()
						.describe("Total cost (USD) for Call Out. Calculated as plan rate by duration.")
						.meta({ examples: [0.03] }),
					type: z
						.enum([
							"toll-free",
							"call-out",
							"call-in",
							"US toll-number",
							"global toll-number",
							"premium",
							"premium call-in",
							"Toll",
						])
						.optional()
						.describe("Call type.")
						.meta({ examples: ["call-out"] }),
					uuid: z
						.string()
						.optional()
						.describe("Meeting UUID.")
						.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
				}),
			)
			.max(300)
			.optional()
			.describe("Array of telephony objects."),
	});

export const reportTelephoneStatus400Schema = z.unknown();

export const reportTelephoneStatus401Schema = z.unknown();

export const reportTelephoneStatus403Schema = z.unknown();

export const reportTelephoneStatus429Schema = z.unknown();

export const reportTelephoneResponseSchema = reportTelephoneStatus200Schema;

export const reportTelephoneErrorSchema = z.union([
	reportTelephoneStatus400Schema,
	reportTelephoneStatus401Schema,
	reportTelephoneStatus403Schema,
	reportTelephoneStatus429Schema,
]);

export const reportUpcomingEventsQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' format. The date range defined by the &quot;from&quot; and &quot;to&quot; parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportUpcomingEventsQueryToSchema = z.iso
	.date()
	.describe("End date.")
	.meta({ examples: ["2022-01-28"] });

export const reportUpcomingEventsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportUpcomingEventsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const reportUpcomingEventsQueryTypeSchema = z
	.enum(["meeting", "webinar", "all"])
	.optional()
	.default("all")
	.describe(
		"The type of event to query. \n* `meeting` &mdash; A meeting event. \n* `webinar` &mdash; A webinar event. \n* `all` &mdash; Both meeting and webinar events.\n\nThis value defaults to `all`.",
	)
	.meta({ examples: ["meeting"] });

export const reportUpcomingEventsQueryGroupIdSchema = z
	.string()
	.optional()
	.describe(
		"The group ID. To get a group ID, use the [**List groups**](/api-reference/zoom-api/methods#operation/groups) API. \n\n **Note:** The API response will only contain meetings where the host is a member of the queried group ID.",
	)
	.meta({ examples: ["TaVA8QKik_1233"] });

export const reportUpcomingEventsStatus200Schema = z.object({
	from: z.iso
		.date()
		.optional()
		.describe("The report's start date. This value must be within the past six months.")
		.meta({ examples: ["2022-03-01"] }),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"The next page token is used to paginate through large result sets. A next page token returns when the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
		)
		.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The number of records returned in a single API call.")
		.meta({ examples: [30] }),
	to: z.iso
		.date()
		.optional()
		.describe(
			"The report's end date. This value must be within the past six months and cannot exceed a month from the `from` value.",
		)
		.meta({ examples: ["2022-03-25"] }),
	upcoming_events: z
		.array(
			z.object({
				dept: z
					.string()
					.optional()
					.describe("The event host's department.")
					.meta({ examples: ["HR"] }),
				host_id: z
					.string()
					.optional()
					.describe("The event host's ID.")
					.meta({ examples: ["Or4-ZeV_SHCOfWRC71O1Fg"] }),
				host_name: z
					.string()
					.optional()
					.describe("The event host's name.")
					.meta({ examples: ["chi chi"] }),
				id: z
					.string()
					.optional()
					.describe("The event's unique ID.")
					.meta({ examples: ["vawMH9zAQLytjCnQiQXSUg=="] }),
				start_time: z
					.string()
					.optional()
					.describe("The event's start time.")
					.meta({ examples: ["2022-03-15T07:40:46Z"] }),
				topic: z
					.string()
					.optional()
					.describe("The event's topic.")
					.meta({ examples: ["My Meeting"] }),
			}),
		)
		.optional()
		.describe("Information about the upcoming event."),
});

export const reportUpcomingEventsStatus400Schema = z.unknown();

export const reportUpcomingEventsStatus429Schema = z.unknown();

export const reportUpcomingEventsResponseSchema = reportUpcomingEventsStatus200Schema;

export const reportUpcomingEventsErrorSchema = z.union([
	reportUpcomingEventsStatus400Schema,
	reportUpcomingEventsStatus429Schema,
]);

export const reportUsersQueryTypeSchema = z
	.enum(["active", "inactive"])
	.optional()
	.describe(
		"Active or inactive hosts.  \n `active` - Active hosts.   \n `inactive` - Inactive hosts.",
	)
	.meta({ examples: ["active"] });

export const reportUsersQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' format. The date range defined by the `from` and `to` parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportUsersQueryToSchema = z.iso
	.date()
	.describe("End date.")
	.meta({ examples: ["2022-01-28"] });

export const reportUsersQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportUsersQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe("The page number of the current page in the returned records.")
	.meta({ examples: [1] });

export const reportUsersQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
	)
	.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] });

export const reportUsersQueryGroupIdSchema = z
	.string()
	.optional()
	.describe(
		"The group ID. To get a group ID, use the [**List groups**](/docs/api/rest/reference/user/methods/#operation/groups) API. \n\n **Note:** The API response will only contain users who are members of the queried group ID.",
	)
	.meta({ examples: ["TaVA8QKik_1233"] });

export const reportUsersStatus200Schema = z
	.object({
		from: z.iso
			.date()
			.optional()
			.describe("Start date for this report.")
			.meta({ examples: ["2022-03-01"] }),
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["b43YBRLJFg3V4vsSpxvGdKIGtNbxn9h9If2"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [30] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe("The page number of the current results.")
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		to: z.iso
			.date()
			.optional()
			.describe("End date for this report.")
			.meta({ examples: ["2022-03-25"] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [850] }),
	})
	.extend({
		total_meeting_minutes: z
			.int()
			.optional()
			.describe("Number of meeting minutes for this range.")
			.meta({ examples: [345] }),
		total_meetings: z
			.int()
			.optional()
			.describe("Number of meetings for this range.")
			.meta({ examples: [34] }),
		total_participants: z
			.int()
			.optional()
			.describe("Number of participants for this range.")
			.meta({ examples: [56] }),
		users: z
			.array(
				z.object({
					custom_attributes: z
						.array(
							z.object({
								key: z
									.string()
									.optional()
									.describe("Identifier for the custom attribute.")
									.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
								name: z
									.string()
									.optional()
									.describe("Name of the custom attribute.")
									.meta({ examples: ["age"] }),
								value: z
									.string()
									.optional()
									.describe("Value of the custom attribute.")
									.meta({ examples: ["18"] }),
							}),
						)
						.optional()
						.describe("Custom attributes that have been assigned to the user."),
					dept: z
						.string()
						.optional()
						.describe("User department.")
						.meta({ examples: ["HR"] }),
					email: z
						.string()
						.optional()
						.describe("User email.")
						.meta({ examples: ["jchill@example.com"] }),
					id: z
						.string()
						.optional()
						.describe("User ID.")
						.meta({ examples: ["2pyjK5VNQHadb2BY6Z4GbA"] }),
					meeting_minutes: z
						.int()
						.optional()
						.describe("Number of meeting minutes for user.")
						.meta({ examples: [342] }),
					meetings: z
						.int()
						.optional()
						.describe("Number of meetings for user.")
						.meta({ examples: [45] }),
					participants: z
						.int()
						.optional()
						.describe("Number of participants in meetings for user.")
						.meta({ examples: [56] }),
					type: z
						.int()
						.optional()
						.describe("User type.")
						.meta({ examples: [1] }),
					user_name: z
						.string()
						.optional()
						.describe("User display name.")
						.meta({ examples: ["Jill Chill"] }),
				}),
			)
			.optional()
			.describe("Array of user objects."),
	});

export const reportUsersStatus400Schema = z.unknown();

export const reportUsersStatus429Schema = z.unknown();

export const reportUsersResponseSchema = reportUsersStatus200Schema;

export const reportUsersErrorSchema = z.union([
	reportUsersStatus400Schema,
	reportUsersStatus429Schema,
]);

export const reportMeetingsPathUserIdSchema = z
	.string()
	.describe("The user ID or email address of the user. For user-level apps, pass the `me` value.")
	.meta({ examples: ["--7IvCwkQWqn67wBsjsWiQ"] });

export const reportMeetingsQueryFromSchema = z.iso
	.date()
	.describe(
		"Start date in 'yyyy-mm-dd' format. The date range defined by the &quot;from&quot; and &quot;to&quot; parameters should only be one month as the report includes only one month worth of data at once.",
	)
	.meta({ examples: ["2022-01-01"] });

export const reportMeetingsQueryToSchema = z.iso
	.date()
	.describe("End date.")
	.meta({ examples: ["2022-01-28"] });

export const reportMeetingsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportMeetingsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const reportMeetingsQueryTypeSchema = z
	.enum(["past", "pastOne", "pastJoined"])
	.optional()
	.default("past")
	.describe(
		"The meeting type to query for: \n* `past` - All past meetings. \n* `pastOne` - A single past user meeting. \n* `pastJoined` - All past meetings the account's users hosted or joined.",
	)
	.meta({ examples: ["past"] });

export const reportMeetingsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated.** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		from: z.iso
			.date()
			.optional()
			.describe("The report's start date.")
			.meta({ examples: ["2020-07-14"] }),
		meetings: z
			.array(
				z.object({
					custom_keys: z
						.array(
							z.object({
								key: z
									.string()
									.max(64)
									.optional()
									.describe("The custom key name.")
									.meta({ examples: ["Host Nation"] }),
								value: z
									.string()
									.max(256)
									.optional()
									.describe("The custom key's value.")
									.meta({ examples: ["US"] }),
							}),
						)
						.max(10)
						.optional()
						.describe(
							"Information about the meeting's assigned custom keys and values. This returns a maximum of 10 items.",
						),
					duration: z
						.int()
						.optional()
						.describe("The meeting's duration.")
						.meta({ examples: [6] }),
					end_time: z.iso
						.datetime()
						.optional()
						.describe("The meeting's end date and time.")
						.meta({ examples: ["2020-07-15T23:30:19Z"] }),
					id: z
						.int()
						.optional()
						.describe(
							"The [meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID).",
						)
						.meta({ examples: [12345] }),
					participants_count: z
						.int()
						.optional()
						.describe("The number of meeting participants.")
						.meta({ examples: [2] }),
					session_key: z
						.string()
						.optional()
						.describe("The Video SDK custom session ID.")
						.meta({ examples: ["ABC36jaBI145"] }),
					source: z
						.string()
						.optional()
						.describe(
							"Whether the meeting was created directly through Zoom or via an API request: \n* If the meeting was created via an OAuth app, this field returns the OAuth app's name. \n* If the meeting was created via JWT or the Zoom Web Portal, this returns the `Zoom` value.",
						)
						.meta({ examples: ["Zoom"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("The meeting's start date and time.")
						.meta({ examples: ["2019-07-15T23:24:52Z"] }),
					topic: z
						.string()
						.optional()
						.describe("The meeting's topic.")
						.meta({ examples: ["My Meeting"] }),
					total_minutes: z
						.int()
						.optional()
						.describe("The sum of meeting minutes from all meeting participants in the meeting.")
						.meta({ examples: [11] }),
					type: z
						.union([
							z.literal(1),
							z.literal(2),
							z.literal(3),
							z.literal(4),
							z.literal(5),
							z.literal(6),
							z.literal(7),
							z.literal(8),
							z.literal(9),
						])
						.optional()
						.describe(
							"The type of meeting or webinar. \n\nmeeting: \n* `1` - Instant meeting. \n* `2` - Scheduled meeting. \n* `3` - A recurring meeting with no fixed time. \n* `4` - A meeting created via PMI (Personal Meeting ID). \n* `7` - A [Personal Audio Conference](https://support.zoom.us/hc/en-us/articles/204517069-Getting-Started-with-Personal-Audio-Conference) (PAC). \n* `8` - Recurring meeting with a fixed time. \n\nwebinar: \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time \n* `9` - A recurring webinar with a fixed time. ",
						)
						.meta({ examples: [2] }),
					user_email: z
						.email()
						.optional()
						.describe("The user's email address.")
						.meta({ examples: ["jchill@example.com"] }),
					user_name: z
						.string()
						.optional()
						.describe("The user's display name.")
						.meta({ examples: ["Jill Chill"] }),
					uuid: z
						.string()
						.optional()
						.describe(
							"The meeting's universally unique identifier (UUID). Each meeting instance generates a meeting UUID.",
						)
						.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
					schedule_time: z
						.string()
						.optional()
						.describe("The meeting's scheduled date and time.")
						.meta({ examples: ["12/22/2021 16:20"] }),
					join_waiting_room_time: z
						.string()
						.optional()
						.describe("The date and time at which the attendee joined the waiting room.")
						.meta({ examples: ["02/11/2022 16:15"] }),
					join_time: z
						.string()
						.optional()
						.describe("The date and time at which the attendee joined the meeting.")
						.meta({ examples: ["12/22/2021 16:20"] }),
					leave_time: z
						.string()
						.optional()
						.describe("The date and time at which the attendee left the meeting.")
						.meta({ examples: ["12/22/2021 17:13"] }),
					host_organization: z
						.string()
						.optional()
						.describe("Host Account Name of Hosting Organization.")
						.meta({ examples: ["org"] }),
					host_name: z
						.string()
						.optional()
						.describe("Host's name.")
						.meta({ examples: ["Jill"] }),
					has_screen_share: z
						.boolean()
						.optional()
						.describe(
							"Whether or not the screenshare feature was used by this user in the meeting. This is meeting feature for attendee level.",
						)
						.meta({ examples: [false] }),
					has_recording: z
						.boolean()
						.optional()
						.describe(
							"Whether or not the recording feature was enabled by this user in the meeting. This is meeting feature for attendee level.",
						)
						.meta({ examples: [false] }),
					has_chat: z
						.boolean()
						.optional()
						.describe(
							"Whether or not the chat feature was used by this user in the meeting. This is meeting feature for attendee level.",
						)
						.meta({ examples: [false] }),
					meeting_encryption_status: z
						.union([z.literal(1), z.literal(2)])
						.optional()
						.describe(
							"The meeting's encryption status. \n* `1` - E2E encryption. \n* `2` - Enhanced encryption.",
						)
						.meta({ examples: [1] }),
					participants_count_my_account: z
						.int()
						.optional()
						.describe("The number of meeting participants from my account.")
						.meta({ examples: [2] }),
				}),
			)
			.optional()
			.describe("Information about the meeting."),
		next_page_token: z
			.string()
			.optional()
			.describe(
				"The next page token is used to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. The expiration period for this token is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgk"] }),
		to: z.iso
			.date()
			.optional()
			.describe("The report's end date.")
			.meta({ examples: ["2020-08-14"] }),
	});

export const reportMeetingsStatus400Schema = z.unknown();

export const reportMeetingsStatus404Schema = z.unknown();

export const reportMeetingsStatus429Schema = z.unknown();

export const reportMeetingsResponseSchema = reportMeetingsStatus200Schema;

export const reportMeetingsErrorSchema = z.union([
	reportMeetingsStatus400Schema,
	reportMeetingsStatus404Schema,
	reportMeetingsStatus429Schema,
]);

export const reportWebinarDetailsPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API will return a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const reportWebinarDetailsStatus200Schema = z.object({
	custom_keys: z
		.array(
			z.object({
				key: z
					.string()
					.max(64)
					.optional()
					.describe("Custom key associated with the user.")
					.meta({ examples: ["Host Nation"] }),
				value: z
					.string()
					.max(256)
					.optional()
					.describe("Value of the custom key associated with the user.")
					.meta({ examples: ["US"] }),
			}),
		)
		.max(10)
		.optional()
		.describe("Custom keys and values assigned to the meeting."),
	dept: z
		.string()
		.optional()
		.describe("Department of the host.")
		.meta({ examples: ["HR"] }),
	duration: z
		.int()
		.optional()
		.describe("Meeting duration.")
		.meta({ examples: [2] }),
	end_time: z.iso
		.datetime()
		.optional()
		.describe("Meeting end time.")
		.meta({ examples: ["2022-03-15T07:42:22Z"] }),
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-): Unique identifier of the meeting in &quot;**long**&quot; format(represented as int64 data type in JSON), also known as the meeting number.",
		)
		.meta({ examples: [345678902224] }),
	participants_count: z
		.int()
		.optional()
		.describe("Number of meeting participants.")
		.meta({ examples: [4] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("Meeting start time.")
		.meta({ examples: ["2022-03-15T07:40:46Z"] }),
	topic: z
		.string()
		.optional()
		.describe("Meeting topic.")
		.meta({ examples: ["My Meeting"] }),
	total_minutes: z
		.int()
		.optional()
		.describe(
			"Number of Webinar minutes. This represents the total amount of Webinar minutes attended by each participant including the host, for a Webinar hosted by the user. For instance if there were one host(named A) and one participant(named B) in a Webinar, the value of total_minutes would be calculated as below:\n\n**total_minutes** = Total Webinar Attendance Minutes of A + Total Webinar Attendance Minutes of B",
		)
		.meta({ examples: [3] }),
	tracking_fields: z
		.array(
			z.object({
				field: z
					.string()
					.optional()
					.describe("Tracking fields type.")
					.meta({ examples: ["Host Nation"] }),
				value: z
					.string()
					.optional()
					.describe("Tracking fields value.")
					.meta({ examples: ["US"] }),
			}),
		)
		.optional()
		.describe("Tracking fields."),
	type: z
		.int()
		.optional()
		.describe("Meeting type.")
		.meta({ examples: [4] }),
	user_email: z
		.string()
		.optional()
		.describe("User email.")
		.meta({ examples: ["jchill@example.com"] }),
	user_name: z
		.string()
		.optional()
		.describe("User display name.")
		.meta({ examples: ["Jill Chill"] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"Webinar UUID. Each webinar instance will generate its own UUID(i.e., after a meeting ends, a new UUID will be generated when the next instance of the webinar starts). [double encode](https://marketplace.zoom.us/docs/api-reference/using-zoom-apis/#meeting-id-and-uuid) the UUID when using it for API calls if the UUID begins with a '/' or contains '//' in it.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
});

export const reportWebinarDetailsStatus400Schema = z.unknown();

export const reportWebinarDetailsStatus404Schema = z.unknown();

export const reportWebinarDetailsStatus429Schema = z.unknown();

export const reportWebinarDetailsResponseSchema = reportWebinarDetailsStatus200Schema;

export const reportWebinarDetailsErrorSchema = z.union([
	reportWebinarDetailsStatus400Schema,
	reportWebinarDetailsStatus404Schema,
	reportWebinarDetailsStatus429Schema,
]);

export const reportWebinarParticipantsPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API will return a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const reportWebinarParticipantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const reportWebinarParticipantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const reportWebinarParticipantsQueryIncludeFieldsSchema = z
	.enum(["registrant_id"])
	.optional()
	.describe(
		"The additional query parameters to include. \n* `registrant_id` - Include the registrant's ID in the API response. The registrant ID is the webinar participant's unique ID.",
	)
	.meta({ examples: ["registrant_id"] });

export const reportWebinarParticipantsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned within a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages.")
			.meta({ examples: [1] }),
	})
	.extend({
		participants: z
			.array(
				z.object({
					customer_key: z
						.string()
						.max(35)
						.optional()
						.describe(
							"The participant's SDK identifier. This value can be alphanumeric, up to a maximum length of 35 characters.",
						)
						.meta({ examples: ["349589LkJyeW"] }),
					duration: z
						.int()
						.optional()
						.describe(
							"Participant duration, in seconds, calculated by subtracting the `leave_time` from the `join_time` for the `user_id`. If the participant leaves and rejoins the same meeting, they will be assigned a different `user_id` and Zoom displays their new duration in a separate object. Note that because of this, the duration may not reflect the total time the user was in the meeting.",
						)
						.meta({ examples: [20] }),
					failover: z
						.boolean()
						.optional()
						.describe("Whether failover occurred during the webinar.")
						.meta({ examples: [false] }),
					id: z
						.string()
						.optional()
						.describe(
							"The participant's universally unique ID (UUID). \n* If the participant joins the meeting by logging into Zoom, this value is the `id` value in the [**Get a user**](/docs/api-reference/zoom-api/methods#operation/user) API response. \n* If the participant joins the meeting **without** logging into Zoom, this returns an empty string value. \n\n**Note:** Use the `participant_user_id` value instead of this value. We will remove this response in a future release.",
						)
						.meta({ examples: ["ABCDEF123456"] }),
					join_time: z.iso
						.datetime()
						.optional()
						.describe("The participant's join time.")
						.meta({ examples: ["2019-02-01T12:34:12.66Z"] }),
					leave_time: z.iso
						.datetime()
						.optional()
						.describe("The participant's leave time.")
						.meta({ examples: ["2019-02-01T12:54:12.66Z"] }),
					name: z
						.string()
						.optional()
						.describe(
							"The participant's display name. This returns an empty string value if the account calling the API is a BAA account.",
						)
						.meta({ examples: ["jchill"] }),
					registrant_id: z
						.string()
						.optional()
						.describe(
							"The registrant's ID. This field only returns if you provide the `registrant_id` value for the `include_fields` query parameter.",
						)
						.meta({ examples: ["123456FEDCBA"] }),
					status: z
						.enum(["in_meeting", "in_waiting_room"])
						.optional()
						.describe(
							"The participant's status. \n* `in_meeting` - In a meeting. \n* `in_waiting_room` - In a waiting room.",
						)
						.meta({ examples: ["in_meeting"] }),
					user_email: z
						.string()
						.regex(
							/(^\s*$|^[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$)/,
						)
						.optional()
						.describe(
							"The participant's email address. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](/docs/api-reference/using-zoom-apis#email-address) for details. This returns an empty string value if the account calling the API is a BAA account.",
						)
						.meta({ examples: ["jchill@example.com"] }),
					user_id: z
						.string()
						.optional()
						.describe(
							"The participant's ID. This ID is assigned to the participant upon joining the webinar and is only valid for that webinar.",
						)
						.meta({ examples: ["ABCDEF123456"] }),
					participant_user_id: z
						.string()
						.optional()
						.describe(
							"The participant's universally unique ID (UUID). \n* If the participant joins the meeting by logging into Zoom, this value is the `id` value in the [**Get a user**](/docs/api-reference/zoom-api/methods#operation/user) API response. \n* If the participant joins the meeting **without** logging into Zoom, this returns an empty string value.",
						)
						.meta({ examples: ["DYHrdpjrS3uaOf7dPkkg8w"] }),
					bo_mtg_id: z
						.string()
						.optional()
						.describe(
							"The [breakout room](https://support.zoom.us/hc/en-us/articles/206476313-Managing-breakout-rooms) ID. Each breakout room is assigned a unique ID.",
						)
						.meta({ examples: ["Dkgwu8nm/ExG1vM+GhLRhA=="] }),
				}),
			)
			.optional()
			.describe("Information about the webinar participant."),
	});

export const reportWebinarParticipantsStatus400Schema = z.unknown();

export const reportWebinarParticipantsStatus404Schema = z.unknown();

export const reportWebinarParticipantsStatus429Schema = z.unknown();

export const reportWebinarParticipantsResponseSchema = reportWebinarParticipantsStatus200Schema;

export const reportWebinarParticipantsErrorSchema = z.union([
	reportWebinarParticipantsStatus400Schema,
	reportWebinarParticipantsStatus404Schema,
	reportWebinarParticipantsStatus429Schema,
]);

export const reportWebinarPollsPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API will return a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const reportWebinarPollsStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe("The webinar ID.")
		.meta({ examples: [123456] }),
	questions: z
		.array(
			z.object({
				email: z
					.email()
					.optional()
					.describe("The participant's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"The participant's display name. **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill Chill"] }),
				first_name: z
					.string()
					.optional()
					.describe(
						"The participant's first name. If the **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `first_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill"] }),
				last_name: z
					.string()
					.optional()
					.describe(
						"The participant's last name. If the **Allow participants to answer questions anonymously** setting is enabled for a [poll](https://support.zoom.us/hc/en-us/articles/213756303-Polling-for-Meet), the participant's polling information is kept anonymous and the `last_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe("The user's given answer.")
								.meta({ examples: ["I am wonderful."] }),
							date_time: z
								.string()
								.optional()
								.describe("The date and time at which the user answered the poll question.")
								.meta({ examples: ["2022-02-01T12:37:12.660Z"] }),
							polling_id: z
								.string()
								.optional()
								.describe("The poll's ID.")
								.meta({ examples: ["798fGJEWrA"] }),
							question: z
								.string()
								.optional()
								.describe("The poll question.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional()
					.describe("Information about the user's questions and answers."),
			}),
		)
		.optional()
		.describe("Information about the webinar questions."),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The webinar's start time.")
		.meta({ examples: ["2022-02-01T12:34:12.66Z"] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"The webinar's universally unique identifier (UUID). Each webinar instance generates a webinar UUID.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
});

export const reportWebinarPollsStatus400Schema = z.unknown();

export const reportWebinarPollsStatus404Schema = z.unknown();

export const reportWebinarPollsStatus429Schema = z.unknown();

export const reportWebinarPollsResponseSchema = reportWebinarPollsStatus200Schema;

export const reportWebinarPollsErrorSchema = z.union([
	reportWebinarPollsStatus400Schema,
	reportWebinarPollsStatus404Schema,
	reportWebinarPollsStatus429Schema,
]);

export const reportWebinarQAPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API will return a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const reportWebinarQAStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"Webinar ID in `long` format, represented as int64 data type in JSON. Also known as the webinar number.",
		)
		.meta({ examples: [245603123123] }),
	questions: z
		.array(
			z.object({
				user_id: z
					.string()
					.optional()
					.describe(
						"The user ID of the user who asked the question. This value returns blank for external users.",
					)
					.meta({ examples: ["hyROrs0TRCSvwmadI7L13w"] }),
				email: z
					.string()
					.optional()
					.describe(
						"Participant's email. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchilll@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"Participant's display name.  \n  \n\nIf anonymous [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Getting-Started-with-Question-Answer) option is enabled and if a participant submits the Q&amp;A without providing their name, the value of the `name` field will be &quot;Anonymous Attendee&quot;.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe(
									"The given answer. If this is a live answer, the value is 'live answered'.\n**Note:** All answers will be returned together and separated by semicolons. For more detailed answer information, please see the \"answer_details\" field.",
								)
								.meta({ examples: ["fine"] }),
							question: z
								.string()
								.optional()
								.describe("Asked question.")
								.meta({ examples: ["how are you"] }),
							question_id: z
								.string()
								.optional()
								.describe("Question UUID.")
								.meta({ examples: ["zxU4wOwnlxs"] }),
							create_time: z
								.string()
								.optional()
								.describe("Question creation time.")
								.meta({ examples: ["2022-03-15T07:48:00Z"] }),
							question_status: z
								.enum(["default", "open", "dismissed", "answered", "deleted"])
								.optional()
								.describe("Question status.\nIf not supported, the value will be `default`.")
								.meta({ examples: ["open"] }),
							answer_details: z
								.array(
									z.object({
										user_id: z
											.string()
											.optional()
											.describe(
												"The user ID of the user who answered the question. This value returns blank for external users.",
											)
											.meta({ examples: ["Cn_5wJ9mRNGyYOmpjVufBQ"] }),
										name: z
											.string()
											.optional()
											.describe("User display name, including the host or participant. ")
											.meta({ examples: ["Paul"] }),
										email: z
											.string()
											.optional()
											.describe(
												"Participant's email. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
											)
											.meta({ examples: ["paul@example.com"] }),
										content: z
											.string()
											.max(1024)
											.optional()
											.describe("The answer from the host or the comment from a participant.")
											.meta({ examples: ["fine"] }),
										create_time: z
											.string()
											.optional()
											.describe("Content submission time.")
											.meta({ examples: ["2022-03-15T07:50:00Z"] }),
										type: z
											.enum([
												"default",
												"host_answered_publicly",
												"host_answered_privately",
												"participant_commented",
												"host_answered",
											])
											.optional()
											.default("default")
											.describe("Type of answer.")
											.meta({ examples: ["default"] }),
									}),
								)
								.optional()
								.describe("Array of answers from user."),
						}),
					)
					.optional()
					.describe("Array of questions from the user."),
			}),
		)
		.optional()
		.describe("Array of webinar question objects."),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("Webinar start time.")
		.meta({ examples: ["2022-03-15T07:40:46Z"] }),
	uuid: z
		.string()
		.optional()
		.describe(
			"Webinar UUID. Each webinar instance will generate its own UUID - after a webinar ends, a new UUID will be generated for the next instance of the webinar. Double-encode your UUID when using it for API calls if the UUID begins with a '/' or contains '//' in it.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
});

export const reportWebinarQAStatus400Schema = z.unknown();

export const reportWebinarQAStatus404Schema = z.unknown();

export const reportWebinarQAStatus429Schema = z.unknown();

export const reportWebinarQAResponseSchema = reportWebinarQAStatus200Schema;

export const reportWebinarQAErrorSchema = z.union([
	reportWebinarQAStatus400Schema,
	reportWebinarQAStatus404Schema,
	reportWebinarQAStatus429Schema,
]);

export const reportWebinarSurveyPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API returns a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const reportWebinarSurveyStatus200Schema = z.object({
	webinar_id: z.coerce
		.bigint()
		.optional()
		.describe("The webinar ID.")
		.meta({ examples: [123456] }),
	webinar_uuid: z
		.string()
		.optional()
		.describe(
			"The webinar's universally unique identifier (UUID). Each webinar instance generates a webinar UUID.",
		)
		.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The webinar's start time.")
		.meta({ examples: ["2022-02-01T12:34:12.66Z"] }),
	survey_id: z
		.string()
		.optional()
		.describe("The survey's ID")
		.meta({ examples: ["8SFHRTGHAAAiAAAAAiAiAiiAii=="] }),
	survey_name: z
		.string()
		.optional()
		.describe("The name of survey")
		.meta({ examples: ["Survey of this meeting"] }),
	survey_answers: z
		.array(
			z.object({
				email: z
					.email()
					.optional()
					.describe("The participant's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"The participant's display name. **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill Chill"] }),
				first_name: z
					.string()
					.optional()
					.describe(
						"The participant's first name. If the **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `first_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Jill"] }),
				last_name: z
					.string()
					.optional()
					.describe(
						"The participant's last name. If the **Allow participants to answer questions anonymously** setting is enabled for a [survey](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057559), the participant's survey information is kept anonymous and the `last_name` field will return the &quot;Anonymous Attendee&quot; value.",
					)
					.meta({ examples: ["Chill"] }),
				answer_details: z
					.array(
						z.object({
							question: z
								.string()
								.optional()
								.describe("The survey question.")
								.meta({ examples: ["How are you?"] }),
							question_id: z
								.string()
								.optional()
								.describe("The question's ID")
								.meta({ examples: ["798fGJEWrA"] }),
							answer: z
								.string()
								.optional()
								.describe("The user's given answer.")
								.meta({ examples: ["I am wonderful."] }),
							date_time: z
								.string()
								.optional()
								.describe("The date and time at which the user answered the survey question.")
								.meta({ examples: ["2022-02-01T12:37:12.660Z"] }),
						}),
					)
					.optional()
					.describe("Information about the user's questions and answers."),
			}),
		)
		.optional()
		.describe("Information about the survey questions and answers."),
});

export const reportWebinarSurveyStatus400Schema = z.unknown();

export const reportWebinarSurveyStatus404Schema = z.unknown();

export const reportWebinarSurveyStatus429Schema = z.unknown();

export const reportWebinarSurveyResponseSchema = reportWebinarSurveyStatus200Schema;

export const reportWebinarSurveyErrorSchema = z.union([
	reportWebinarSurveyStatus400Schema,
	reportWebinarSurveyStatus404Schema,
	reportWebinarSurveyStatus429Schema,
]);

export const listSIPPhonePhonesQuerySearchKeySchema = z
	.string()
	.optional()
	.describe(
		"A user's user name or email address. If this parameter is provided, only the SIP phone system integration enabled for that specific user will be returned. Otherwise, all SIP phones on an account will be returned.",
	)
	.meta({ examples: ["jchill@example.com"] });

export const listSIPPhonePhonesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listSIPPhonePhonesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token will be returned whenever the set of available results exceeds the current page size. This tokan's expiration period is 15 minutes.",
	)
	.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] });

export const listSIPPhonePhonesStatus200Schema = z.object({
	next_page_token: z
		.string()
		.optional()
		.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The number of records returned within a single API call.")
		.meta({ examples: [30] }),
	phones: z
		.array(
			z.object({
				authorization_name: z
					.string()
					.optional()
					.describe("The authorization name of the user that is registered for SIP phone.")
					.meta({ examples: ["testname"] }),
				domain: z
					.string()
					.optional()
					.describe("The name or IP address of your provider's SIP domain.")
					.meta({ examples: ["example.com"] }),
				phone_id: z
					.string()
					.optional()
					.describe("The SIP phone ID.")
					.meta({ examples: ["123456"] }),
				password: z
					.string()
					.optional()
					.describe("The password generated for the user in the SIP account.\n")
					.meta({ examples: ["apassword1"] }),
				registration_expire_time: z
					.int()
					.optional()
					.describe(
						"The number of minutes after which the SIP registration of the Zoom client user will expire, and the client will auto register to the SIP server. ",
					)
					.meta({ examples: [60] }),
				user_email: z
					.email()
					.optional()
					.describe(
						"The email address of the user to associate with the SIP Phone. Can add `.pc`, `.mobile`, `.pad` at the end of the email (for example, `user@example.com.pc`) to add accounts for different platforms for the same user.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				user_name: z
					.string()
					.optional()
					.describe("The phone number associated with the user in the SIP account. ")
					.meta({ examples: ["Jill Chill"] }),
				voice_mail: z
					.string()
					.optional()
					.describe("The number to dial for checking voicemail.")
					.meta({ examples: ["4000"] }),
				display_number: z
					.string()
					.max(64)
					.optional()
					.describe(
						"The displayed phone number associated with the user can be either in extension format or E.164 format. You can specify the displayed number when the dialable number differs from the SIP username.",
					)
					.meta({ examples: ["5551110105"] }),
				server: z
					.object({
						proxy_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						register_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						transport_protocol: z
							.enum(["UDP", "TCP", "TLS", "AUTO"])
							.optional()
							.describe(
								"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
							)
							.meta({ examples: ["UDP"] }),
					})
					.optional()
					.describe(
						"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
					),
				server_2: z
					.object({
						proxy_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						register_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						transport_protocol: z
							.enum(["UDP", "TCP", "TLS", "AUTO"])
							.optional()
							.describe(
								"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
							)
							.meta({ examples: ["UDP"] }),
					})
					.optional()
					.describe(
						"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
					),
				server_3: z
					.object({
						proxy_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						register_server: z
							.string()
							.optional()
							.describe(
								"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
							)
							.meta({ examples: ["192.0.2.2"] }),
						transport_protocol: z
							.enum(["UDP", "TCP", "TLS", "AUTO"])
							.optional()
							.describe(
								"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
							)
							.meta({ examples: ["UDP"] }),
					})
					.optional()
					.describe(
						"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
					),
			}),
		)
		.max(300)
		.optional()
		.describe("SIP phones object."),
});

export const listSIPPhonePhonesStatus400Schema = z.unknown();

export const listSIPPhonePhonesStatus401Schema = z.unknown();

export const listSIPPhonePhonesStatus403Schema = z.unknown();

export const listSIPPhonePhonesStatus429Schema = z.unknown();

export const listSIPPhonePhonesResponseSchema = listSIPPhonePhonesStatus200Schema;

export const listSIPPhonePhonesErrorSchema = z.union([
	listSIPPhonePhonesStatus400Schema,
	listSIPPhonePhonesStatus401Schema,
	listSIPPhonePhonesStatus403Schema,
	listSIPPhonePhonesStatus429Schema,
]);

export const enableSIPPhonePhonesStatus201Schema = z.object({
	phone_id: z
		.string()
		.optional()
		.describe("The SIP phone ID.")
		.meta({ examples: ["123456"] }),
	authorization_name: z
		.string()
		.max(64)
		.optional()
		.describe("The authorization name of the user that is registered for SIP phone.")
		.meta({ examples: ["testname"] }),
	domain: z
		.string()
		.max(64)
		.optional()
		.describe("The name or IP address of your provider's SIP domain (example: CDC.WEB). ")
		.meta({ examples: ["example.com"] }),
	password: z
		.string()
		.optional()
		.describe("The password generated for the user in the SIP account.")
		.meta({ examples: ["123456"] }),
	registration_expire_time: z
		.int()
		.min(1)
		.max(127)
		.optional()
		.default(60)
		.describe(
			"The number of minutes after which the SIP registration of the Zoom client user will expire, and the client will auto register to the SIP server.",
		)
		.meta({ examples: [60] }),
	user_email: z
		.email()
		.max(64)
		.optional()
		.describe(
			"The email address of the user to associate with the SIP Phone. Can add `.pc`, `.mobile`, `.pad` at the end of the email (for example, `user@example.com.mac`) to add accounts for different platforms for the same user.",
		)
		.meta({ examples: ["jchill@example.com"] }),
	user_name: z
		.string()
		.max(64)
		.optional()
		.describe("The phone number associated with the user in the SIP account.")
		.meta({ examples: ["Jill Chill"] }),
	voice_mail: z
		.string()
		.max(255)
		.optional()
		.describe("The number to dial for checking voicemail.")
		.meta({ examples: ["4000"] }),
	display_number: z
		.string()
		.max(64)
		.optional()
		.describe(
			"The displayed phone number associated with the user can be either in extension format or E.164 format. You can specify the displayed number when the dialable number differs from the SIP username.",
		)
		.meta({ examples: ["5551110105"] }),
	server: z
		.object({
			proxy_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			register_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			transport_protocol: z
				.enum(["UDP", "TCP", "TLS", "AUTO"])
				.optional()
				.describe(
					"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
				)
				.meta({ examples: ["UDP"] }),
		})
		.optional()
		.describe(
			"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
		),
	server_2: z
		.object({
			proxy_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			register_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			transport_protocol: z
				.enum(["UDP", "TCP", "TLS", "AUTO"])
				.optional()
				.describe(
					"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
				)
				.meta({ examples: ["UDP"] }),
		})
		.optional()
		.describe(
			"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
		),
	server_3: z
		.object({
			proxy_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			register_server: z
				.string()
				.optional()
				.describe(
					"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
				)
				.meta({ examples: ["192.0.2.2"] }),
			transport_protocol: z
				.enum(["UDP", "TCP", "TLS", "AUTO"])
				.optional()
				.describe(
					"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
				)
				.meta({ examples: ["UDP"] }),
		})
		.optional()
		.describe(
			"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
		),
});

export const enableSIPPhonePhonesStatus400Schema = z.unknown();

export const enableSIPPhonePhonesStatus401Schema = z.unknown();

export const enableSIPPhonePhonesStatus403Schema = z.unknown();

export const enableSIPPhonePhonesStatus404Schema = z.unknown();

export const enableSIPPhonePhonesStatus429Schema = z.unknown();

export const enableSIPPhonePhonesResponseSchema = enableSIPPhonePhonesStatus201Schema;

export const enableSIPPhonePhonesErrorSchema = z.union([
	enableSIPPhonePhonesStatus400Schema,
	enableSIPPhonePhonesStatus401Schema,
	enableSIPPhonePhonesStatus403Schema,
	enableSIPPhonePhonesStatus404Schema,
	enableSIPPhonePhonesStatus429Schema,
]);

export const enableSIPPhonePhonesBodySchema = z
	.object({
		authorization_name: z
			.string()
			.max(64)
			.describe("The authorization name of the user that is registered for SIP phone.")
			.meta({ examples: ["testname"] }),
		domain: z
			.string()
			.max(64)
			.describe("The name or IP address of your provider's SIP domain, such as example.com. ")
			.meta({ examples: ["example.com"] }),
		password: z
			.string()
			.describe("The password generated for the user in the SIP account.")
			.meta({ examples: ["123456"] }),
		registration_expire_time: z
			.int()
			.min(1)
			.max(127)
			.optional()
			.default(60)
			.describe(
				"The number of minutes after which the SIP registration of the Zoom client user expires, and the client will auto register to the SIP server.",
			)
			.meta({ examples: [60] }),
		user_email: z
			.email()
			.max(64)
			.describe(
				"The email address of the user to associate with the SIP Phone. Can add `.pc`, `.mobile`, `.pad` at the end of the email, such as `user@example.com.pc`, to add accounts for different platforms for the same user.",
			)
			.meta({ examples: ["jchill@example.com"] }),
		user_name: z
			.string()
			.max(64)
			.describe("The phone number associated with the user in the SIP account.")
			.meta({ examples: ["Jill Chill"] }),
		voice_mail: z
			.string()
			.max(255)
			.optional()
			.describe("The number to dial for checking voicemail.")
			.meta({ examples: ["4000"] }),
		display_number: z
			.string()
			.max(64)
			.optional()
			.describe(
				"The displayed phone number associated with the user can be either in extension format or E.164 format. You can specify the displayed number when the dialable number differs from the SIP username.",
			)
			.meta({ examples: ["5551110105"] }),
		server: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
		server_2: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.optional()
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
		server_3: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.optional()
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
	})
	.optional();

export const deleteSIPPhonePhonesPathPhoneIdSchema = z
	.string()
	.describe("The SIP phone ID. It can be retrieved from the **List SIP phones** API.")
	.meta({ examples: ["123456"] });

export const deleteSIPPhonePhonesStatus204Schema = z.unknown();

export const deleteSIPPhonePhonesStatus401Schema = z.unknown();

export const deleteSIPPhonePhonesStatus403Schema = z.unknown();

export const deleteSIPPhonePhonesStatus404Schema = z.unknown();

export const deleteSIPPhonePhonesStatus429Schema = z.unknown();

export const deleteSIPPhonePhonesResponseSchema = deleteSIPPhonePhonesStatus204Schema;

export const deleteSIPPhonePhonesErrorSchema = z.union([
	deleteSIPPhonePhonesStatus401Schema,
	deleteSIPPhonePhonesStatus403Schema,
	deleteSIPPhonePhonesStatus404Schema,
	deleteSIPPhonePhonesStatus429Schema,
]);

export const updateSIPPhonePhonesPathPhoneIdSchema = z
	.string()
	.describe("The SIP phone ID. Retrieve this with the **List SIP phones** API.")
	.meta({ examples: ["123456"] });

export const updateSIPPhonePhonesStatus204Schema = z.unknown();

export const updateSIPPhonePhonesStatus400Schema = z.unknown();

export const updateSIPPhonePhonesStatus401Schema = z.unknown();

export const updateSIPPhonePhonesStatus403Schema = z.unknown();

export const updateSIPPhonePhonesStatus404Schema = z.unknown();

export const updateSIPPhonePhonesStatus429Schema = z.unknown();

export const updateSIPPhonePhonesResponseSchema = updateSIPPhonePhonesStatus204Schema;

export const updateSIPPhonePhonesErrorSchema = z.union([
	updateSIPPhonePhonesStatus400Schema,
	updateSIPPhonePhonesStatus401Schema,
	updateSIPPhonePhonesStatus403Schema,
	updateSIPPhonePhonesStatus404Schema,
	updateSIPPhonePhonesStatus429Schema,
]);

export const updateSIPPhonePhonesBodySchema = z
	.object({
		authorization_name: z
			.string()
			.max(64)
			.optional()
			.describe("The authorization name of the user that is registered for SIP phone.")
			.meta({ examples: ["testname"] }),
		domain: z
			.string()
			.max(64)
			.optional()
			.describe("The name or IP address of your provider's SIP domain, such as example.com. ")
			.meta({ examples: ["example.com"] }),
		password: z
			.string()
			.optional()
			.describe("The password generated for the user in the SIP account.")
			.meta({ examples: ["123456"] }),
		registration_expire_time: z
			.int()
			.min(1)
			.max(127)
			.optional()
			.default(60)
			.describe(
				"The number of minutes after which the SIP registration of the Zoom client user will expire, and the client will auto register to the SIP server.",
			)
			.meta({ examples: [60] }),
		user_name: z
			.string()
			.max(64)
			.optional()
			.describe("The phone number associated with the user in the SIP account.")
			.meta({ examples: ["Jill Chill"] }),
		voice_mail: z
			.string()
			.max(255)
			.optional()
			.describe("The number to dial for checking voicemail.")
			.meta({ examples: ["4000"] }),
		display_number: z
			.string()
			.max(64)
			.optional()
			.describe(
				"The displayed phone number associated with the user can be either in extension format or E.164 format. You can specify the displayed number when the dialable number differs from the SIP username.",
			)
			.meta({ examples: ["5551110105"] }),
		server: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.optional()
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
		server_2: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.optional()
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
		server_3: z
			.object({
				proxy_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the proxy server for SIP requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address. If you are not using a proxy server, this value can be the same as the Register Server.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				register_server: z
					.string()
					.optional()
					.describe(
						"The IP address of the server that accepts REGISTER requests. Note that if you are using the UDP transport protocol, the default port is 5060. If you are using UDP with a different port number, that port number must be included with the IP address.",
					)
					.meta({ examples: ["192.0.2.2"] }),
				transport_protocol: z
					.enum(["UDP", "TCP", "TLS", "AUTO"])
					.optional()
					.describe(
						"Protocols supported by the SIP provider.  \n  The value must be either `UDP`, `TCP`, `TLS`, `AUTO`.",
					)
					.meta({ examples: ["UDP"] }),
			})
			.optional()
			.describe(
				"Defined a set of basic components of SIP network architecture, including proxy_server, register_server and transport_protocol.",
			),
	})
	.optional();

export const listmeetingsummariesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listmeetingsummariesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through a large set of results. The next page token returns whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listmeetingsummariesQueryFromSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The start date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format. The time field used for filtering is specified by `time_filter_field`.",
	)
	.meta({ examples: ["2023-10-19T07:00:00Z"] });

export const listmeetingsummariesQueryToSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The end date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format. The time field used for filtering is specified by `time_filter_field`.",
	)
	.meta({ examples: ["2023-10-20T07:00:00Z"] });

export const listmeetingsummariesQueryTimeFilterFieldSchema = z
	.enum(["summary_start_time", "summary_created_time"])
	.optional()
	.default("summary_start_time")
	.describe("Which summary time field to use to filter results by the `from` and `to` parameters.")
	.meta({ examples: ["summary_created_time"] });

export const listmeetingsummariesStatus200Schema = z.object({
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The number of records returned with a single API call.")
		.meta({ examples: [30] }),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through a large set of results. The next page token returns whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
	from: z.iso
		.datetime()
		.optional()
		.describe(
			"The start date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format, used to retrieve the meeting summaries' creation date range.",
		)
		.meta({ examples: ["2023-10-19T07:00:00Z"] }),
	to: z.iso
		.datetime()
		.optional()
		.describe(
			"The end date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format, used to retrieve the meeting summaries' creation date range.",
		)
		.meta({ examples: ["2023-10-20T07:00:00Z"] }),
	summaries: z
		.array(
			z.object({
				meeting_host_id: z
					.string()
					.optional()
					.describe("The ID of the user who is set as the meeting host.")
					.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
				meeting_host_email: z
					.email()
					.optional()
					.describe("The meeting host's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				meeting_uuid: z
					.string()
					.optional()
					.describe(
						"Unique meeting ID. Each meeting instance generates its own meeting UUID. After a meeting ends, a new UUID is generated for the next instance of the meeting. Retrieve a list of UUIDs from past meeting instances using the [**List past meeting instances**](/docs/api-reference/zoom-api/methods#operation/pastMeetings) API. [Double encode](/docs/api/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.\n",
					)
					.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
				meeting_id: z.coerce
					.bigint()
					.optional()
					.describe(
						"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-) - the meeting's unique identifier in **long** format, represented as int64 data type in JSON, also known as the meeting number.",
					)
					.meta({ examples: [97763643886] }),
				meeting_topic: z
					.string()
					.optional()
					.describe("Meeting topic.")
					.meta({ examples: ["My Meeting"] }),
				meeting_start_time: z.iso
					.datetime()
					.optional()
					.describe("The meeting's start date and time.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				meeting_end_time: z.iso
					.datetime()
					.optional()
					.describe("The meeting's end date and time.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
				summary_start_time: z.iso
					.datetime()
					.optional()
					.describe("The summary's start date and time.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				summary_end_time: z.iso
					.datetime()
					.optional()
					.describe("The summary's end date and time.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
				summary_created_time: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the meeting summary was created.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				summary_last_modified_time: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the meeting summary was last modified.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
			}),
		)
		.optional()
		.describe("List of meeting summary objects."),
});

export const listmeetingsummariesStatus400Schema = z.unknown();

export const listmeetingsummariesStatus403Schema = z.unknown();

export const listmeetingsummariesStatus429Schema = z.unknown();

export const listmeetingsummariesResponseSchema = listmeetingsummariesStatus200Schema;

export const listmeetingsummariesErrorSchema = z.union([
	listmeetingsummariesStatus400Schema,
	listmeetingsummariesStatus403Schema,
	listmeetingsummariesStatus429Schema,
]);

export const getameetingsummaryPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's universally unique ID (UUID). When you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	)
	.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] });

export const getameetingsummaryStatus200Schema = z.object({
	meeting_host_id: z
		.string()
		.optional()
		.describe("The ID of the user who is set as the meeting host.")
		.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
	meeting_host_email: z
		.email()
		.optional()
		.describe("The meeting host's email address.")
		.meta({ examples: ["jchill@example.com"] }),
	meeting_uuid: z
		.string()
		.optional()
		.describe(
			"The unique meeting ID. \n\nEach meeting instance generates its own meeting UUID. After a meeting ends, a new UUID is generated for the next instance of the meeting.\n\n Use the [**List past meeting instances**](/docs/api-reference/zoom-api/methods#operation/pastMeetings) API to retrieve a list of UUIDs from past meeting instances. [Double encode](/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.\n",
		)
		.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
	meeting_id: z.coerce
		.bigint()
		.optional()
		.describe(
			"[The meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-) \nThe meeting's unique identifier in **long** format, represented as int64 data type in JSON. Also known as the meeting number.",
		)
		.meta({ examples: [97763643886] }),
	meeting_topic: z
		.string()
		.optional()
		.describe("The meeting topic.")
		.meta({ examples: ["My Meeting"] }),
	meeting_start_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's start date and time.")
		.meta({ examples: ["2019-07-15T23:24:52Z"] }),
	meeting_end_time: z.iso
		.datetime()
		.optional()
		.describe("The meeting's end date and time.")
		.meta({ examples: ["2020-07-15T23:30:19Z"] }),
	summary_start_time: z.iso
		.datetime()
		.optional()
		.describe("The summary's start date and time.")
		.meta({ examples: ["2019-07-15T23:24:52Z"] }),
	summary_end_time: z.iso
		.datetime()
		.optional()
		.describe("The summary's end date and time.")
		.meta({ examples: ["2020-07-15T23:30:19Z"] }),
	summary_created_time: z.iso
		.datetime()
		.optional()
		.describe("The date and time when the meeting summary was created.")
		.meta({ examples: ["2019-07-15T23:24:52Z"] }),
	summary_last_modified_time: z.iso
		.datetime()
		.optional()
		.describe("The date and time when the meeting summary was last modified.")
		.meta({ examples: ["2020-07-15T23:30:19Z"] }),
	summary_last_modified_user_id: z
		.string()
		.optional()
		.describe("The user ID of the user who last modified the meeting summary.")
		.meta({ examples: ["Lfi0BlBQTM-bbktE9BRUvA"] }),
	summary_last_modified_user_email: z
		.string()
		.optional()
		.describe("The user email of the user who last modified the meeting summary.")
		.meta({ examples: ["user@example.com"] }),
	summary_title: z
		.string()
		.optional()
		.describe("The summary title.")
		.meta({ examples: ["Meeting summary for my meeting"] }),
	summary_overview: z
		.string()
		.optional()
		.describe("The summary overview.")
		.meta({ examples: ["Meeting overview"] }),
	summary_details: z
		.array(
			z.object({
				label: z
					.string()
					.optional()
					.describe("The summary label.")
					.meta({ examples: ["Meeting overview"] }),
				summary: z
					.string()
					.optional()
					.describe("The summary content.")
					.meta({ examples: ["Meeting overview"] }),
			}),
		)
		.optional()
		.describe("The summary content details."),
	next_steps: z.array(z.string()).optional().describe("The next steps."),
	edited_summary: z
		.object({
			summary_overview: z
				.string()
				.optional()
				.describe("The user edited summary overview.")
				.meta({ examples: ["Meeting overview"] }),
			summary_details: z
				.string()
				.optional()
				.describe("The user edited summary details.")
				.meta({ examples: ["Meeting overview"] }),
			next_steps: z.array(z.string()).optional().describe("The user edited next steps."),
		})
		.optional()
		.describe("The edited summary content."),
	summary_content: z
		.string()
		.optional()
		.describe(
			"The complete meeting summary in Markdown format. This unified field is used for all summaries. For compatibility, the legacy fields `summary_overview`, `summary_details`, `next_steps`, and `edited_summary` are still returned, but are deprecated and will not be supported in the future.",
		)
		.meta({
			examples: [
				"## Key takeaways\n- Mobile app performance issues are affecting user retention.\n- New onboarding flow received positive feedback from beta testers.\n- Need to prioritize accessibility improvements.\n- Customer support response time has improved by 25%.\n\n## Discussed topics\n### Mobile App Performance\nDiscussion of recent performance metrics and user complaints\n- **Details**\n    - Sarah (Product): Reports of app crashes increased 15% this month\n    - Mike (Engineering): Memory optimization needed in latest release\n    - Tom (QA): Identified memory leak in photo upload feature\n- **Conclusion**\n    - Implement performance monitoring tools\n    - Prioritize memory optimization in next sprint\n\n### Onboarding Flow\nReview of beta testing results for new user onboarding\n- **Details**\n    - Rachel (UX): 90% completion rate in beta testing\n    - David (Product): Positive feedback on simplified registration\n- **Conclusion**\n    - Ready for full rollout next month\n    - Need to monitor analytics post-launch\n\n### Accessibility Compliance\nDiscussion of current accessibility status and needed improvements\n- **Details**\n    - Lisa (Design): Screen reader compatibility issues identified\n    - John (Engineering): WCAG compliance at 80%\n- **Conclusion**\n    - Create accessibility improvement roadmap\n    - Schedule external audit\n\n## Challenges\n* Resource constraints for performance optimization\n* Integration testing environment stability issues\n* Lack of accessibility expertise in the team\n\n## Action items\n- **Sarah**\n  - Prepare performance monitoring implementation plan\n  - Schedule follow-up meeting with engineering team\n- **Mike**\n  - Investigate memory leak fix\n  - Document performance optimization guidelines\n- **Lisa**\n  - Create accessibility improvement proposal\n  - Research accessibility testing tools\n- **Rachel**\n  - Prepare onboarding analytics dashboard\n  - Document beta testing findings",
			],
		}),
	summary_doc_url: z
		.url()
		.optional()
		.describe("The URL to view the full summary document in Zoom Docs.")
		.meta({ examples: ["https://docs.zoom.us/doc/1aBcDeFgHiJkLmNoPqRsTu"] }),
});

export const getameetingsummaryStatus400Schema = z.unknown();

export const getameetingsummaryStatus403Schema = z.unknown();

export const getameetingsummaryStatus404Schema = z.unknown();

export const getameetingsummaryStatus429Schema = z.unknown();

export const getameetingsummaryResponseSchema = getameetingsummaryStatus200Schema;

export const getameetingsummaryErrorSchema = z.union([
	getameetingsummaryStatus400Schema,
	getameetingsummaryStatus403Schema,
	getameetingsummaryStatus404Schema,
	getameetingsummaryStatus429Schema,
]);

export const deletemeetingorwebinarsummaryPathMeetingIdSchema = z
	.string()
	.describe(
		"The meeting's universally unique ID (UUID). When you provide a meeting UUID that begins with a `/` character or contains the `//` characters, you **must** double-encode the meeting UUID before making an API request.",
	)
	.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] });

export const deletemeetingorwebinarsummaryStatus204Schema = z.unknown();

export const deletemeetingorwebinarsummaryStatus400Schema = z.unknown();

export const deletemeetingorwebinarsummaryStatus403Schema = z.unknown();

export const deletemeetingorwebinarsummaryStatus404Schema = z.unknown();

export const deletemeetingorwebinarsummaryStatus429Schema = z.unknown();

export const deletemeetingorwebinarsummaryResponseSchema =
	deletemeetingorwebinarsummaryStatus204Schema;

export const deletemeetingorwebinarsummaryErrorSchema = z.union([
	deletemeetingorwebinarsummaryStatus400Schema,
	deletemeetingorwebinarsummaryStatus403Schema,
	deletemeetingorwebinarsummaryStatus404Schema,
	deletemeetingorwebinarsummaryStatus429Schema,
]);

export const listUserMeetingSummariesPathUserIdSchema = z
	.string()
	.describe(
		"The user's user ID or email address. For user-level apps, pass [the `me` value](/docs/api/rest/using-zoom-apis/#the-me-keyword).",
	)
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const listUserMeetingSummariesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listUserMeetingSummariesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through a large set of results. The next page token returns whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listUserMeetingSummariesQueryFromSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The start date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format. The time field used for filtering is specified by `time_filter_field`.",
	)
	.meta({ examples: ["2023-10-19T07:00:00Z"] });

export const listUserMeetingSummariesQueryToSchema = z.iso
	.datetime()
	.optional()
	.describe(
		"The end date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format. The time field used for filtering is specified by `time_filter_field`.",
	)
	.meta({ examples: ["2023-10-20T07:00:00Z"] });

export const listUserMeetingSummariesQueryTimeFilterFieldSchema = z
	.enum(["summary_start_time", "summary_created_time"])
	.optional()
	.default("summary_start_time")
	.describe("Which summary time field to use to filter results by the `from` and `to` parameters.")
	.meta({ examples: ["summary_created_time"] });

export const listUserMeetingSummariesStatus200Schema = z.object({
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The number of records returned with a single API call.")
		.meta({ examples: [30] }),
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through a large set of results. The next page token returns whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
	from: z.iso
		.datetime()
		.optional()
		.describe(
			"The start date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format, used to retrieve the meeting summaries' creation date range.",
		)
		.meta({ examples: ["2023-10-19T07:00:00Z"] }),
	to: z.iso
		.datetime()
		.optional()
		.describe(
			"The end date, in `yyyy-MM-dd'T'HH:mm:ss'Z'` UTC format, used to retrieve the meeting summaries' creation date range.",
		)
		.meta({ examples: ["2023-10-20T07:00:00Z"] }),
	summaries: z
		.array(
			z.object({
				meeting_host_id: z
					.string()
					.optional()
					.describe("The ID of the user who is set as the meeting host.")
					.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
				meeting_host_email: z
					.email()
					.optional()
					.describe("The meeting host's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				meeting_uuid: z
					.string()
					.optional()
					.describe(
						"Unique meeting ID. Each meeting instance generates its own meeting UUID. After a meeting ends, a new UUID is generated for the next instance of the meeting. Retrieve a list of UUIDs from past meeting instances using the [**List past meeting instances**](/docs/api-reference/zoom-api/methods#operation/pastMeetings) API. [Double encode](/docs/api/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.",
					)
					.meta({ examples: ["aDYlohsHRtCd4ii1uC2+hA=="] }),
				meeting_id: z.coerce
					.bigint()
					.optional()
					.describe(
						"[Meeting ID](https://support.zoom.us/hc/en-us/articles/201362373-What-is-a-Meeting-ID-) - the meeting's unique identifier in **long** format, represented as int64 data type in JSON, also known as the meeting number.",
					)
					.meta({ examples: [97763643886] }),
				meeting_topic: z
					.string()
					.optional()
					.describe("The meeting topic.")
					.meta({ examples: ["My Meeting"] }),
				meeting_start_time: z.iso
					.datetime()
					.optional()
					.describe("The meeting's start date and time.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				meeting_end_time: z.iso
					.datetime()
					.optional()
					.describe("The meeting's end date and time.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
				summary_start_time: z.iso
					.datetime()
					.optional()
					.describe("The summary's start date and time.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				summary_end_time: z.iso
					.datetime()
					.optional()
					.describe("The summary's end date and time.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
				summary_created_time: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the meeting summary was created.")
					.meta({ examples: ["2019-07-15T23:24:52Z"] }),
				summary_last_modified_time: z.iso
					.datetime()
					.optional()
					.describe("The date and time when the meeting summary was last modified.")
					.meta({ examples: ["2020-07-15T23:30:19Z"] }),
			}),
		)
		.optional()
		.describe("List of meeting summary objects."),
});

export const listUserMeetingSummariesStatus400Schema = z.unknown();

export const listUserMeetingSummariesStatus403Schema = z.unknown();

export const listUserMeetingSummariesStatus404Schema = z.unknown();

export const listUserMeetingSummariesStatus429Schema = z.unknown();

export const listUserMeetingSummariesResponseSchema = listUserMeetingSummariesStatus200Schema;

export const listUserMeetingSummariesErrorSchema = z.union([
	listUserMeetingSummariesStatus400Schema,
	listUserMeetingSummariesStatus403Schema,
	listUserMeetingSummariesStatus404Schema,
	listUserMeetingSummariesStatus429Schema,
]);

export const meetingSurveyGetPathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long-format integer and **not** a simple integer. Meeting IDs can be more than 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingSurveyGetStatus200Schema = z
	.object({
		custom_survey: z
			.object({
				title: z
					.string()
					.max(64)
					.optional()
					.describe("The survey's title, up to 64 characters.")
					.meta({ examples: ["Learn something new"] }),
				anonymous: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to anonymously answer survey questions. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				numbered_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the number in the question name. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				show_question_type: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the question type in the question name. \n\n This value defaults to `false`.",
					)
					.meta({ examples: [false] }),
				feedback: z
					.string()
					.max(320)
					.optional()
					.describe(
						"The survey's feedback, up to 320 characters. \n\n This value defaults to `Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.`.",
					)
					.meta({
						examples: [
							"Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.",
						],
					}),
				questions: z
					.array(
						z.object({
							name: z
								.string()
								.optional()
								.describe("The survey question, up to 420 characters.")
								.meta({ examples: ["How useful was this meeting?"] }),
							type: z
								.union([
									z.literal("single"),
									z.literal("multiple"),
									z.literal("matching"),
									z.literal("rank_order"),
									z.literal("short_answer"),
									z.literal("long_answer"),
									z.literal("fill_in_the_blank"),
									z.literal("rating_scale"),
								])
								.optional()
								.describe(
									"The survey's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order \n* `short_answer` - Short answer \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank \n* `rating_scale` - Rating scale.",
								)
								.meta({ examples: ["single"] }),
							answer_required: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							show_as_dropdown: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							answers: z
								.array(z.string().max(200))
								.min(2)
								.optional()
								.describe(
									"The survey question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` questions, you can only provide a maximum of 50 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
								),
							prompts: z
								.array(
									z.object({
										prompt_question: z
											.string()
											.max(200)
											.optional()
											.describe("The question prompt's title.")
											.meta({ examples: ["How are you?"] }),
									}),
								)
								.min(2)
								.max(10)
								.optional()
								.describe(
									"Information about the prompt questions. This field only applies to `matching` and `rank_order` questions. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
								),
							answer_min_character: z
								.int()
								.min(1)
								.optional()
								.describe(
									"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` questions. You must provide at least a **one** character minimum value.",
								)
								.meta({ examples: [1] }),
							answer_max_character: z
								.int()
								.optional()
								.describe(
									"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` questions. \n* For `short_answer` question, a maximum of 500 characters. \n* For `long_answer` question, a maximum of 2,000 characters.",
								)
								.meta({ examples: [200] }),
							rating_min_value: z
								.int()
								.min(0)
								.optional()
								.describe(
									"The rating scale's minimum value. This value cannot be less than zero. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [1] }),
							rating_max_value: z
								.int()
								.max(10)
								.optional()
								.describe(
									"The rating scale's maximum value, up to a maximum value of 10. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [4] }),
							rating_min_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The low score label used for the `rating_min_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Not likely"] }),
							rating_max_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The high score label used for the `rating_max_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Extremely Likely"] }),
						}),
					)
					.min(1)
					.max(100)
					.optional()
					.describe("Information about the meeting survey's questions."),
			})
			.optional()
			.describe("Information about the customized meeting survey."),
		show_in_the_browser: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether the **Show in the browser when the meeting ends** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `true`.",
			)
			.meta({ examples: [true] }),
		third_party_survey: z
			.string()
			.max(64)
			.optional()
			.describe("The link to the third party meeting survey.")
			.meta({ examples: ["https://example.com"] }),
	})
	.describe("Information about the meeting survey.");

export const meetingSurveyGetStatus400Schema = z.unknown();

export const meetingSurveyGetStatus404Schema = z.unknown();

export const meetingSurveyGetStatus429Schema = z.unknown();

export const meetingSurveyGetResponseSchema = meetingSurveyGetStatus200Schema;

export const meetingSurveyGetErrorSchema = z.union([
	meetingSurveyGetStatus400Schema,
	meetingSurveyGetStatus404Schema,
	meetingSurveyGetStatus429Schema,
]);

export const meetingSurveyDeletePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, you must store it as a long format integer and **not** an integer. Meeting IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingSurveyDeleteStatus204Schema = z.unknown();

export const meetingSurveyDeleteStatus400Schema = z.unknown();

export const meetingSurveyDeleteStatus404Schema = z.unknown();

export const meetingSurveyDeleteStatus429Schema = z.unknown();

export const meetingSurveyDeleteResponseSchema = meetingSurveyDeleteStatus204Schema;

export const meetingSurveyDeleteErrorSchema = z.union([
	meetingSurveyDeleteStatus400Schema,
	meetingSurveyDeleteStatus404Schema,
	meetingSurveyDeleteStatus429Schema,
]);

export const meetingSurveyUpdatePathMeetingIdSchema = z.coerce
	.bigint()
	.describe(
		"The meeting's ID. \n\n When storing this value in your database, store it as a long-format integer and **not** a simple integer. Meeting IDs can be over 10 digits.",
	)
	.meta({ examples: [85746065] });

export const meetingSurveyUpdateStatus204Schema = z.unknown();

export const meetingSurveyUpdateStatus400Schema = z.unknown();

export const meetingSurveyUpdateStatus404Schema = z.unknown();

export const meetingSurveyUpdateStatus429Schema = z.unknown();

export const meetingSurveyUpdateResponseSchema = meetingSurveyUpdateStatus204Schema;

export const meetingSurveyUpdateErrorSchema = z.union([
	meetingSurveyUpdateStatus400Schema,
	meetingSurveyUpdateStatus404Schema,
	meetingSurveyUpdateStatus429Schema,
]);

export const meetingSurveyUpdateBodySchema = z
	.object({
		custom_survey: z
			.object({
				title: z
					.string()
					.max(64)
					.optional()
					.describe("The survey's title, up to 64 characters.")
					.meta({ examples: ["Learn something new"] }),
				anonymous: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to anonymously answer survey questions. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				numbered_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the number in the question name. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				show_question_type: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the question type in the question name. \n\n This value defaults to `false`.",
					)
					.meta({ examples: [false] }),
				feedback: z
					.string()
					.max(320)
					.optional()
					.describe(
						"The survey's feedback, up to 320 characters. \n\n This value defaults to `Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.`.",
					)
					.meta({
						examples: [
							"Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.",
						],
					}),
				questions: z
					.array(
						z.object({
							name: z
								.string()
								.optional()
								.describe("The survey question, up to 420 characters.")
								.meta({ examples: ["How useful was this meeting?"] }),
							type: z
								.union([
									z.literal("single"),
									z.literal("multiple"),
									z.literal("matching"),
									z.literal("rank_order"),
									z.literal("short_answer"),
									z.literal("long_answer"),
									z.literal("fill_in_the_blank"),
									z.literal("rating_scale"),
								])
								.optional()
								.describe(
									"The survey's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order \n* `short_answer` - Short answer \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank \n* `rating_scale` - Rating scale.",
								)
								.meta({ examples: ["single"] }),
							answer_required: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							show_as_dropdown: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							answers: z
								.array(z.string().max(200))
								.min(2)
								.optional()
								.describe(
									"The survey question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` questions, you can only provide a maximum of 50 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
								),
							prompts: z
								.array(
									z.object({
										prompt_question: z
											.string()
											.max(200)
											.optional()
											.describe("The question prompt's title.")
											.meta({ examples: ["How are you?"] }),
									}),
								)
								.min(2)
								.max(10)
								.optional()
								.describe(
									"Information about the prompt questions. This field only applies to `matching` and `rank_order` questions. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
								),
							answer_min_character: z
								.int()
								.min(1)
								.optional()
								.describe(
									"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` questions. You must provide at least a **one** character minimum value.",
								)
								.meta({ examples: [1] }),
							answer_max_character: z
								.int()
								.optional()
								.describe(
									"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` questions. \n* For `short_answer` question, a maximum of 500 characters. \n* For `long_answer` question, a maximum of 2,000 characters.",
								)
								.meta({ examples: [200] }),
							rating_min_value: z
								.int()
								.min(0)
								.optional()
								.describe(
									"The rating scale's minimum value. This value cannot be less than zero. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [1] }),
							rating_max_value: z
								.int()
								.max(10)
								.optional()
								.describe(
									"The rating scale's maximum value, up to a maximum value of 10. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [4] }),
							rating_min_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The low score label used for the `rating_min_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Not likely"] }),
							rating_max_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The high score label used for the `rating_max_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Extremely Likely"] }),
						}),
					)
					.min(1)
					.max(100)
					.optional()
					.describe("Information about the meeting survey's questions."),
			})
			.optional()
			.describe("Information about the customized meeting survey."),
		show_in_the_browser: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether the **Show in the browser when the meeting ends** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `true`.",
			)
			.meta({ examples: [true] }),
		third_party_survey: z
			.string()
			.max(64)
			.optional()
			.describe("The link to the third party meeting survey.")
			.meta({ examples: ["https://example.com"] }),
	})
	.optional()
	.describe("Information about the meeting survey.");

export const tspStatus200Schema = z.object({
	dial_in_number_unrestricted: z
		.boolean()
		.optional()
		.describe(
			"Control restriction on account users adding a TSP number outside of account's dial in numbers.",
		)
		.meta({ examples: [false] }),
	dial_in_numbers: z
		.array(
			z.object({
				code: z
					.string()
					.optional()
					.describe("Country code.")
					.meta({ examples: ["1"] }),
				number: z
					.string()
					.max(16)
					.optional()
					.describe("Dial-in number. Length is less than 16.")
					.meta({ examples: ["+1 1000200200"] }),
				type: z
					.string()
					.optional()
					.describe("Dial-in number type.")
					.meta({ examples: ["toll"] }),
			}),
		)
		.optional()
		.describe("List of dial in numbers."),
	enable: z
		.boolean()
		.optional()
		.describe("Enable Telephony Service Provider for account users.")
		.meta({ examples: [true] }),
	master_account_setting_extended: z
		.boolean()
		.optional()
		.describe(
			"For master account, extend its TSP setting to all sub accounts. For sub account, extend TSP setting from master account.",
		)
		.meta({ examples: [true] }),
	modify_credential_forbidden: z
		.boolean()
		.optional()
		.describe("Control restriction on account users being able to modify their TSP credentials.")
		.meta({ examples: [true] }),
	tsp_bridge: z
		.enum(["US_TSP_TB", "EU_TSP_TB"])
		.optional()
		.describe("Telephony bridge zone")
		.meta({ examples: ["US_TSP_TB"] }),
	tsp_enabled: z
		.boolean()
		.optional()
		.describe(
			"Enable TSP feature for account. This has to be enabled to use any other tsp settings/features.",
		)
		.meta({ examples: [true] }),
	tsp_provider: z
		.string()
		.optional()
		.describe("Telephony service provider.")
		.meta({ examples: ["someprovidername"] }),
});

export const tspStatus429Schema = z.unknown();

export const tspResponseSchema = tspStatus200Schema;

export const tspErrorSchema = tspStatus429Schema;

export const tspUpdateStatus204Schema = z.unknown();

export const tspUpdateStatus400Schema = z.unknown();

export const tspUpdateStatus429Schema = z.unknown();

export const tspUpdateResponseSchema = tspUpdateStatus204Schema;

export const tspUpdateErrorSchema = z.union([tspUpdateStatus400Schema, tspUpdateStatus429Schema]);

export const tspUpdateBodySchema = z
	.object({
		dial_in_number_unrestricted: z
			.boolean()
			.optional()
			.describe(
				"Control restriction on account users adding a TSP number outside of account's dial in numbers.",
			)
			.meta({ examples: [true] }),
		enable: z
			.boolean()
			.optional()
			.describe("Enable 3rd party audio conferencing for account users")
			.meta({ examples: [true] }),
		master_account_setting_extended: z
			.boolean()
			.optional()
			.describe(
				"For master account, extend its TSP setting to all sub accounts. For sub account, extend TSP setting from master account.",
			)
			.meta({ examples: [true] }),
		modify_credential_forbidden: z
			.boolean()
			.optional()
			.describe("Control restriction on account users being able to modify their TSP credentials.")
			.meta({ examples: [true] }),
		tsp_bridge: z
			.enum(["US_TSP_TB", "EU_TSP_TB"])
			.optional()
			.describe("Telephony bridge")
			.meta({ examples: ["US_TSP_TB"] }),
		tsp_enabled: z
			.boolean()
			.optional()
			.describe(
				"Enable TSP feature for account. This has to be enabled to use any other tsp settings/features.",
			)
			.meta({ examples: [true] }),
		tsp_provider: z
			.string()
			.optional()
			.describe("3rd party audio conferencing provider")
			.meta({ examples: ["someprovidername"] }),
	})
	.optional()
	.describe("TSP Account");

export const userTSPsPathUserIdSchema = z
	.string()
	.describe("The user ID or email address of the user. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const userTSPsStatus200Schema = z.object({
	tsp_accounts: z
		.array(
			z.object({
				conference_code: z
					.string()
					.min(1)
					.max(16)
					.describe("Conference code: numeric value, length is less than 16.")
					.meta({ examples: ["0125"] }),
				dial_in_numbers: z
					.array(
						z.object({
							code: z
								.string()
								.max(6)
								.optional()
								.describe("Country code.")
								.meta({ examples: ["1"] }),
							country_label: z
								.string()
								.max(10)
								.optional()
								.describe("Country label, if passed, will display in place of code.")
								.meta({ examples: ["America"] }),
							number: z
								.string()
								.min(1)
								.max(16)
								.optional()
								.describe("Dial-in number. Length is less than 16.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.union([z.literal("toll"), z.literal("tollfree"), z.literal("media_link")])
								.optional()
								.describe(
									"Dial-in number types. \n `toll` - Toll number.  \n `tollfree` - Toll free number.  \n \n`media_link` - Media link.",
								)
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("List of dial in numbers."),
				id: z
					.enum(["1", "2"])
					.optional()
					.describe("The TSP account's ID.")
					.meta({ examples: ["1"] }),
				leader_pin: z
					.string()
					.min(1)
					.max(16)
					.describe("Leader PIN. Mumeric value, length is less than 16.")
					.meta({ examples: ["11189898"] }),
				tsp_bridge: z
					.enum(["US_TSP_TB", "EU_TSP_TB"])
					.optional()
					.describe("Telephony bridge\n")
					.meta({ examples: ["US_TSP_TB"] }),
			}),
		)
		.optional()
		.describe("List of the user's TSP accounts."),
});

export const userTSPsStatus400Schema = z.unknown();

export const userTSPsStatus404Schema = z.unknown();

export const userTSPsStatus429Schema = z.unknown();

export const userTSPsResponseSchema = userTSPsStatus200Schema;

export const userTSPsErrorSchema = z.union([
	userTSPsStatus400Schema,
	userTSPsStatus404Schema,
	userTSPsStatus429Schema,
]);

export const userTSPCreatePathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const userTSPCreateStatus201Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("The ID of the TSP account.")
			.meta({ examples: ["1"] }),
	})
	.extend({
		conference_code: z
			.string()
			.min(1)
			.max(16)
			.describe("Conference code: numeric value, length is less than 16.")
			.meta({ examples: ["0125"] }),
		dial_in_numbers: z
			.array(
				z.object({
					code: z
						.string()
						.max(6)
						.optional()
						.describe("Country code.")
						.meta({ examples: ["1"] }),
					country_label: z
						.string()
						.max(10)
						.optional()
						.describe("Country Label, if passed, will display in place of code.")
						.meta({ examples: ["America"] }),
					number: z
						.string()
						.min(1)
						.max(16)
						.optional()
						.describe("Dial-in number: length is less than 16.")
						.meta({ examples: ["+1 1000200200"] }),
					type: z
						.union([z.literal("toll"), z.literal("tollfree"), z.literal("media_link")])
						.optional()
						.describe(
							"Dial-in number types:  \n `toll` - Toll number.  \n `tollfree` -Toll free number.  \n \n`media_link` - Media link.",
						)
						.meta({ examples: ["toll"] }),
				}),
			)
			.optional()
			.describe("List of dial in numbers."),
		leader_pin: z
			.string()
			.min(1)
			.max(16)
			.describe("Leader PIN: numeric value, length is less than 16.")
			.meta({ examples: ["US_TSP_TB"] }),
		tsp_bridge: z
			.enum(["US_TSP_TB", "EU_TSP_TB"])
			.optional()
			.describe("Telephony bridge")
			.meta({ examples: ["US_TSP_TB"] }),
	});

export const userTSPCreateStatus400Schema = z.unknown();

export const userTSPCreateStatus404Schema = z.unknown();

export const userTSPCreateStatus429Schema = z.unknown();

export const userTSPCreateResponseSchema = userTSPCreateStatus201Schema;

export const userTSPCreateErrorSchema = z.union([
	userTSPCreateStatus400Schema,
	userTSPCreateStatus404Schema,
	userTSPCreateStatus429Schema,
]);

export const userTSPCreateBodySchema = z
	.object({
		conference_code: z
			.string()
			.min(1)
			.max(16)
			.describe("Conference code. A numeric value, with a length less than 16.")
			.meta({ examples: ["0125"] }),
		dial_in_numbers: z
			.array(
				z.object({
					code: z
						.string()
						.max(6)
						.optional()
						.describe("Country code.")
						.meta({ examples: ["1"] }),
					country_label: z
						.string()
						.max(10)
						.optional()
						.describe("Country Label, if passed, will display in place of code.")
						.meta({ examples: ["America"] }),
					number: z
						.string()
						.min(1)
						.max(16)
						.optional()
						.describe("Dial-in number: length is less than 16.")
						.meta({ examples: ["+1 1000200200"] }),
					type: z
						.union([z.literal("toll"), z.literal("tollfree"), z.literal("media_link")])
						.optional()
						.describe(
							"Dial-in number types:  \n `toll` - Toll number.  \n `tollfree` -Toll free number.  \n \n`media_link` - Media link.",
						)
						.meta({ examples: ["toll"] }),
				}),
			)
			.optional()
			.describe("List of dial in numbers."),
		leader_pin: z
			.string()
			.min(1)
			.max(16)
			.describe("Leader PIN: numeric value, length is less than 16.")
			.meta({ examples: ["US_TSP_TB"] }),
		tsp_bridge: z
			.enum(["US_TSP_TB", "EU_TSP_TB"])
			.optional()
			.describe("Telephony bridge")
			.meta({ examples: ["US_TSP_TB"] }),
	})
	.optional()
	.describe("List of TSP accounts.");

export const tspUrlUpdatePathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address.")
	.meta({ examples: ["6dfgdfgdg444447b0egga"] });

export const tspUrlUpdateStatus204Schema = z.unknown();

export const tspUrlUpdateStatus400Schema = z.unknown();

export const tspUrlUpdateStatus404Schema = z.unknown();

export const tspUrlUpdateStatus429Schema = z.unknown();

export const tspUrlUpdateResponseSchema = tspUrlUpdateStatus204Schema;

export const tspUrlUpdateErrorSchema = z.union([
	tspUrlUpdateStatus400Schema,
	tspUrlUpdateStatus404Schema,
	tspUrlUpdateStatus429Schema,
]);

export const tspUrlUpdateBodySchema = z
	.object({
		audio_url: z
			.string()
			.max(512)
			.optional()
			.describe(
				"The global dial-in URL for a TSP enabled account. The URL must be valid, with a maximum length of 512 characters.",
			)
			.meta({ examples: ["https://example.com"] }),
	})
	.optional()
	.describe("The user's global dial-in URL.");

export const userTSPPathUserIdSchema = z
	.string()
	.describe("The user ID or email address of the user. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const userTSPPathTspIdSchema = z
	.enum(["1", "2"])
	.describe("TSP account ID.")
	.meta({ examples: ["1"] });

export const userTSPStatus200Schema = z
	.object({
		conference_code: z
			.string()
			.min(1)
			.max(16)
			.describe("Conference code: numeric value, length is less than 16.")
			.meta({ examples: ["0125"] }),
		dial_in_numbers: z
			.array(
				z.object({
					code: z
						.string()
						.max(6)
						.optional()
						.describe("Country code.")
						.meta({ examples: ["1"] }),
					country_label: z
						.string()
						.max(10)
						.optional()
						.describe("Country Label, if passed, will display in place of code.")
						.meta({ examples: ["America"] }),
					number: z
						.string()
						.min(1)
						.max(16)
						.optional()
						.describe("Dial-in number: length is less than 16.")
						.meta({ examples: ["+1 1000200200"] }),
					type: z
						.union([z.literal("toll"), z.literal("tollfree"), z.literal("media_link")])
						.optional()
						.describe(
							"Dial-in number types:  \n `toll` - Toll number.  \n `tollfree` -Toll free number.   \n  `media_link` - Media link phone number. This is used for PSTN integration instead of a paid bridge number.",
						)
						.meta({ examples: ["toll"] }),
				}),
			)
			.optional()
			.describe("List of dial in numbers."),
		id: z
			.string()
			.optional()
			.describe("The TSP account's ID.")
			.meta({ examples: ["1"] }),
		leader_pin: z
			.string()
			.min(1)
			.max(16)
			.describe("Leader PIN. A numeric value, with a length of less than 16.")
			.meta({ examples: ["11189898"] }),
		tsp_bridge: z
			.enum(["US_TSP_TB", "EU_TSP_TB"])
			.optional()
			.describe("Telephony bridge")
			.meta({ examples: ["US_TSP_TB"] }),
	})
	.describe("TSP account of the user.");

export const userTSPStatus400Schema = z.unknown();

export const userTSPStatus404Schema = z.unknown();

export const userTSPStatus429Schema = z.unknown();

export const userTSPResponseSchema = userTSPStatus200Schema;

export const userTSPErrorSchema = z.union([
	userTSPStatus400Schema,
	userTSPStatus404Schema,
	userTSPStatus429Schema,
]);

export const userTSPDeletePathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const userTSPDeletePathTspIdSchema = z
	.enum(["1", "2"])
	.describe("TSP account ID.")
	.meta({ examples: ["1"] });

export const userTSPDeleteStatus204Schema = z.unknown();

export const userTSPDeleteStatus400Schema = z.unknown();

export const userTSPDeleteStatus404Schema = z.unknown();

export const userTSPDeleteStatus429Schema = z.unknown();

export const userTSPDeleteResponseSchema = userTSPDeleteStatus204Schema;

export const userTSPDeleteErrorSchema = z.union([
	userTSPDeleteStatus400Schema,
	userTSPDeleteStatus404Schema,
	userTSPDeleteStatus429Schema,
]);

export const userTSPUpdatePathUserIdSchema = z
	.string()
	.describe("The user ID or email address of the user. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const userTSPUpdatePathTspIdSchema = z
	.enum(["1", "2"])
	.describe("TSP account ID.")
	.meta({ examples: ["1"] });

export const userTSPUpdateStatus204Schema = z.unknown();

export const userTSPUpdateStatus400Schema = z.unknown();

export const userTSPUpdateStatus404Schema = z.unknown();

export const userTSPUpdateStatus429Schema = z.unknown();

export const userTSPUpdateResponseSchema = userTSPUpdateStatus204Schema;

export const userTSPUpdateErrorSchema = z.union([
	userTSPUpdateStatus400Schema,
	userTSPUpdateStatus404Schema,
	userTSPUpdateStatus429Schema,
]);

export const userTSPUpdateBodySchema = z
	.object({
		conference_code: z
			.string()
			.min(1)
			.max(16)
			.describe("Conference code. Numeric value. Length is less than 16.")
			.meta({ examples: ["0125"] }),
		dial_in_numbers: z
			.array(
				z.object({
					code: z
						.string()
						.max(6)
						.optional()
						.describe("Country code.")
						.meta({ examples: ["1"] }),
					country_label: z
						.string()
						.max(10)
						.optional()
						.describe("Country label, if passed, will display in place of code.")
						.meta({ examples: ["America"] }),
					number: z
						.string()
						.min(1)
						.max(16)
						.optional()
						.describe("Dial-in number. Length is less than 16.")
						.meta({ examples: ["+1 1000200200"] }),
					type: z
						.union([z.literal("toll"), z.literal("tollfree"), z.literal("media_link")])
						.optional()
						.describe(
							"Dial-in number types.\n `toll` - Toll number.  \n `tollfree` -Toll free number.  \n `media_link` - Media Link Phone Number. It is used for PSTN integration instead of paid bridge number.",
						)
						.meta({ examples: ["toll"] }),
				}),
			)
			.optional()
			.describe("List of dial in numbers."),
		leader_pin: z
			.string()
			.min(1)
			.max(16)
			.describe("Leader PIN. Numeric value. Length is less than 16.")
			.meta({ examples: ["11189898"] }),
		tsp_bridge: z
			.enum(["US_TSP_TB", "EU_TSP_TB"])
			.optional()
			.describe("Telephony bridge.")
			.meta({ examples: ["US_TSP_TB"] }),
	})
	.optional()
	.describe("TSP account.");

export const listMeetingTemplatesPathUserIdSchema = z
	.string()
	.describe(
		"The user ID retrievable from the [List users](/api-reference/zoom-api/methods#operation/users) API.",
	)
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const listMeetingTemplatesStatus200Schema = z.object({
	templates: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe("The template ID.")
					.meta({ examples: ["AdxbhxCzKgSiWAw"] }),
				name: z
					.string()
					.optional()
					.describe("The template name.")
					.meta({ examples: ["My meeting template"] }),
				type: z
					.int()
					.optional()
					.describe(
						"The template type:   \n \n`1`: Meeting template   \n \n`2`: Admin meeting template",
					)
					.meta({ examples: [1] }),
			}),
		)
		.optional(),
	total_records: z
		.int()
		.optional()
		.describe("Total records found for this request.")
		.meta({ examples: [1] }),
});

export const listMeetingTemplatesStatus400Schema = z.unknown();

export const listMeetingTemplatesStatus404Schema = z.unknown();

export const listMeetingTemplatesStatus429Schema = z.unknown();

export const listMeetingTemplatesResponseSchema = listMeetingTemplatesStatus200Schema;

export const listMeetingTemplatesErrorSchema = z.union([
	listMeetingTemplatesStatus400Schema,
	listMeetingTemplatesStatus404Schema,
	listMeetingTemplatesStatus429Schema,
]);

export const meetingTemplateCreatePathUserIdSchema = z
	.string()
	.describe(
		"The user ID retrievable from the [List users](/docs/api/rest/reference/user/methods/#operation/users) API.",
	)
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const meetingTemplateCreateStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("The template ID.")
		.meta({ examples: ["AdxbhxCzKgSiWAw"] }),
	name: z
		.string()
		.optional()
		.describe("The template name.")
		.meta({ examples: ["My Meeting Template"] }),
});

export const meetingTemplateCreateStatus400Schema = z.unknown();

export const meetingTemplateCreateStatus404Schema = z.unknown();

export const meetingTemplateCreateStatus429Schema = z.unknown();

export const meetingTemplateCreateResponseSchema = meetingTemplateCreateStatus201Schema;

export const meetingTemplateCreateErrorSchema = z.union([
	meetingTemplateCreateStatus400Schema,
	meetingTemplateCreateStatus404Schema,
	meetingTemplateCreateStatus429Schema,
]);

export const meetingTemplateCreateBodySchema = z
	.object({
		meeting_id: z.coerce
			.bigint()
			.optional()
			.describe("The meeting ID - the meeting number in long (int64) format.")
			.meta({ examples: [96172769962] }),
		name: z
			.string()
			.optional()
			.describe("The template name.")
			.meta({ examples: ["My Meeting Template"] }),
		save_recurrence: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If the field is set to `true`, the recurrence meeting template will be saved as the scheduled meeting.",
			)
			.meta({ examples: [false] }),
		overwrite: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Overwrite an existing meeting template if the template is created from same existing meeting.",
			)
			.meta({ examples: [false] }),
	})
	.optional();

export const trackingfieldListStatus200Schema = z
	.object({
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages.")
			.meta({ examples: [1] }),
		tracking_fields: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("Tracking field's ID.")
						.meta({ examples: ["a32CJji-weJ92"] }),
					field: z
						.string()
						.optional()
						.describe("Label or name for the tracking field.")
						.meta({ examples: ["field1"] }),
					recommended_values: z
						.array(z.string())
						.optional()
						.describe("Array of recommended values"),
					required: z
						.boolean()
						.optional()
						.describe("Tracking field required.")
						.meta({ examples: [false] }),
					visible: z
						.boolean()
						.optional()
						.describe("Tracking field visible.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of tracking fields."),
	})
	.describe("Tracking field list.");

export const trackingfieldListStatus429Schema = z.unknown();

export const trackingfieldListResponseSchema = trackingfieldListStatus200Schema;

export const trackingfieldListErrorSchema = trackingfieldListStatus429Schema;

export const trackingfieldCreateStatus201Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("Tracking Field ID")
			.meta({ examples: ["a32CJji-weJ92"] }),
	})
	.extend({
		field: z
			.string()
			.optional()
			.describe("Label/ Name for the tracking field.")
			.meta({ examples: ["field1"] }),
		recommended_values: z.array(z.string()).optional().describe("Array of recommended values"),
		required: z
			.boolean()
			.optional()
			.describe("Tracking Field Required")
			.meta({ examples: [false] }),
		visible: z
			.boolean()
			.optional()
			.describe("Tracking Field Visible")
			.meta({ examples: [true] }),
	});

export const trackingfieldCreateStatus429Schema = z.unknown();

export const trackingfieldCreateResponseSchema = trackingfieldCreateStatus201Schema;

export const trackingfieldCreateErrorSchema = trackingfieldCreateStatus429Schema;

export const trackingfieldCreateBodySchema = z
	.object({
		field: z
			.string()
			.optional()
			.describe("Label/ Name for the tracking field.")
			.meta({ examples: ["field1"] }),
		recommended_values: z.array(z.string()).optional().describe("Array of recommended values"),
		required: z
			.boolean()
			.optional()
			.describe("Tracking Field Required")
			.meta({ examples: [false] }),
		visible: z
			.boolean()
			.optional()
			.describe("Tracking Field Visible")
			.meta({ examples: [true] }),
	})
	.optional()
	.describe("Tracking Field");

export const trackingfieldGetPathFieldIdSchema = z
	.string()
	.describe("The tracking field ID.")
	.meta({ examples: ["a32CJji-weJ92"] });

export const trackingfieldGetStatus200Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("Tracking field ID.")
			.meta({ examples: ["a32CJji-weJ92"] }),
		field: z
			.string()
			.optional()
			.describe("Label or name for the tracking field.")
			.meta({ examples: ["field1"] }),
		recommended_values: z.array(z.string()).optional().describe("Array of recommended values."),
		required: z
			.boolean()
			.optional()
			.describe("Tracking field required.")
			.meta({ examples: [false] }),
		visible: z
			.boolean()
			.optional()
			.describe("Tracking field visible.")
			.meta({ examples: [true] }),
	})
	.describe("Tracking field");

export const trackingfieldGetStatus404Schema = z.unknown();

export const trackingfieldGetStatus429Schema = z.unknown();

export const trackingfieldGetResponseSchema = trackingfieldGetStatus200Schema;

export const trackingfieldGetErrorSchema = z.union([
	trackingfieldGetStatus404Schema,
	trackingfieldGetStatus429Schema,
]);

export const trackingfieldDeletePathFieldIdSchema = z
	.string()
	.describe("The tracking field ID.")
	.meta({ examples: ["a32CJji-weJ92"] });

export const trackingfieldDeleteStatus204Schema = z.unknown();

export const trackingfieldDeleteStatus404Schema = z.unknown();

export const trackingfieldDeleteStatus429Schema = z.unknown();

export const trackingfieldDeleteResponseSchema = trackingfieldDeleteStatus204Schema;

export const trackingfieldDeleteErrorSchema = z.union([
	trackingfieldDeleteStatus404Schema,
	trackingfieldDeleteStatus429Schema,
]);

export const trackingfieldUpdatePathFieldIdSchema = z
	.string()
	.describe("The tracking field ID.")
	.meta({ examples: ["a32CJji-weJ92"] });

export const trackingfieldUpdateStatus204Schema = z.unknown();

export const trackingfieldUpdateStatus400Schema = z.unknown();

export const trackingfieldUpdateStatus404Schema = z.unknown();

export const trackingfieldUpdateStatus429Schema = z.unknown();

export const trackingfieldUpdateResponseSchema = trackingfieldUpdateStatus204Schema;

export const trackingfieldUpdateErrorSchema = z.union([
	trackingfieldUpdateStatus400Schema,
	trackingfieldUpdateStatus404Schema,
	trackingfieldUpdateStatus429Schema,
]);

export const trackingfieldUpdateBodySchema = z
	.object({
		field: z
			.string()
			.optional()
			.describe("Label or name for the tracking field.")
			.meta({ examples: ["field1"] }),
		recommended_values: z.array(z.string()).optional().describe("Array of recommended values."),
		required: z
			.boolean()
			.optional()
			.describe("Tracking field required.")
			.meta({ examples: [false] }),
		visible: z
			.boolean()
			.optional()
			.describe("Tracking field visible.")
			.meta({ examples: [true] }),
	})
	.optional()
	.describe("Tracking field");

export const deleteWebinarChatMessageByIdPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const deleteWebinarChatMessageByIdPathMessageIdSchema = z
	.string()
	.describe("The live webinar chat message's unique identifier (UUID), in base64-encoded format.")
	.meta({ examples: ["MS17MDQ5NjE4QjYtRjk4Ny00REEwLUFBQUItMTg3QTY0RjU2MzhFfQ=="] });

export const deleteWebinarChatMessageByIdQueryFileIdsSchema = z
	.string()
	.optional()
	.describe(
		"The live webinar chat file's universally unique identifier (UUID), in base64-encoded format. Separate multiple values with commas.",
	)
	.meta({
		examples: [
			"MS17RDk0QTY3QUQtQkFGQy04QTJFLTI2RUEtNkYxQjRBRTU1MTk5fQ==,MS17NDQ0OEU5MjMtM0JFOS1CMDA1LTQ0NDAtQjdGOTU0Rjk5MTkyfQ==",
		],
	});

export const deleteWebinarChatMessageByIdStatus204Schema = z.unknown();

export const deleteWebinarChatMessageByIdStatus400Schema = z.unknown();

export const deleteWebinarChatMessageByIdStatus404Schema = z.unknown();

export const deleteWebinarChatMessageByIdStatus429Schema = z.unknown();

export const deleteWebinarChatMessageByIdResponseSchema =
	deleteWebinarChatMessageByIdStatus204Schema;

export const deleteWebinarChatMessageByIdErrorSchema = z.union([
	deleteWebinarChatMessageByIdStatus400Schema,
	deleteWebinarChatMessageByIdStatus404Schema,
	deleteWebinarChatMessageByIdStatus429Schema,
]);

export const webinarAbsenteesPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API will return a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const webinarAbsenteesQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const webinarAbsenteesQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const webinarAbsenteesQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const webinarAbsenteesStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated.** This field is deprecated. We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		registrants: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("Registrant ID.")
							.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
					})
					.extend({
						address: z
							.string()
							.optional()
							.describe("The registrant's address.")
							.meta({ examples: ["1800 Amphibious Blvd."] }),
						city: z
							.string()
							.optional()
							.describe("The registrant's city.")
							.meta({ examples: ["Mountain View"] }),
						comments: z
							.string()
							.optional()
							.describe("The registrant's questions and comments.")
							.meta({ examples: ["Looking forward to the discussion."] }),
						country: z
							.string()
							.optional()
							.describe(
								"The registrant's two-letter ISO [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
							)
							.meta({ examples: ["US"] }),
						custom_questions: z
							.array(
								z.object({
									title: z
										.string()
										.optional()
										.describe("The title of the custom question.")
										.meta({ examples: ["What do you hope to learn from this?"] }),
									value: z
										.string()
										.max(128)
										.optional()
										.describe(
											"The custom question's response value. This has a limit of 128 characters.",
										)
										.meta({
											examples: [
												"Look forward to learning how you come up with new recipes and what other services you offer.",
											],
										}),
								}),
							)
							.optional()
							.describe("Information about custom questions."),
						email: z
							.email()
							.max(128)
							.describe(
								"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						first_name: z
							.string()
							.max(64)
							.describe("The registrant's first name.")
							.meta({ examples: ["Jill"] }),
						industry: z
							.string()
							.optional()
							.describe("The registrant's industry.")
							.meta({ examples: ["Food"] }),
						job_title: z
							.string()
							.optional()
							.describe("The registrant's job title.")
							.meta({ examples: ["Chef"] }),
						last_name: z
							.string()
							.max(64)
							.optional()
							.describe("The registrant's last name.")
							.meta({ examples: ["Chill"] }),
						no_of_employees: z
							.enum([
								"",
								"1-20",
								"21-50",
								"51-100",
								"101-250",
								"251-500",
								"501-1,000",
								"1,001-5,000",
								"5,001-10,000",
								"More than 10,000",
							])
							.optional()
							.describe(
								"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
							)
							.meta({ examples: ["1-20"] }),
						org: z
							.string()
							.optional()
							.describe("The registrant's organization.")
							.meta({ examples: ["Cooking Org"] }),
						phone: z
							.string()
							.optional()
							.describe("The registrant's phone number.")
							.meta({ examples: ["5550100"] }),
						purchasing_time_frame: z
							.enum([
								"",
								"Within a month",
								"1-3 months",
								"4-6 months",
								"More than 6 months",
								"No timeframe",
							])
							.optional()
							.describe(
								"The registrant's purchasing time frame. \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
							)
							.meta({ examples: ["1-3 months"] }),
						role_in_purchase_process: z
							.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
							.optional()
							.describe(
								"The registrant's role in the purchase process. \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
							)
							.meta({ examples: ["Influencer"] }),
						state: z
							.string()
							.optional()
							.describe("The registrant's state or province.")
							.meta({ examples: ["CA"] }),
						status: z
							.enum(["approved", "denied", "pending"])
							.optional()
							.describe(
								"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
							)
							.meta({ examples: ["approved"] }),
						zip: z
							.string()
							.optional()
							.describe("The registrant's ZIP or postal code.")
							.meta({ examples: ["94045"] }),
					})
					.extend({
						create_time: z.iso
							.datetime()
							.optional()
							.describe("The time when the registrant registered.")
							.meta({ examples: ["2022-03-22T05:59:09Z"] }),
						join_url: z
							.string()
							.optional()
							.describe(
								"The URL that an approved registrant can use to join the meeting or webinar.",
							)
							.meta({ examples: ["https://example.com/j/11111"] }),
						status: z
							.string()
							.optional()
							.describe(
								"The status of the registrant's registration.\n  `approved` - User has been successfully approved for the webinar.  \n  `pending` -  The registration is still pending.  \n  `denied` - User has been denied from joining the webinar.",
							)
							.meta({ examples: ["approved"] }),
					}),
			)
			.optional()
			.describe("List of registrant objects."),
	})
	.describe("List of users.");

export const webinarAbsenteesStatus400Schema = z.unknown();

export const webinarAbsenteesStatus404Schema = z.unknown();

export const webinarAbsenteesStatus429Schema = z.unknown();

export const webinarAbsenteesResponseSchema = webinarAbsenteesStatus200Schema;

export const webinarAbsenteesErrorSchema = z.union([
	webinarAbsenteesStatus400Schema,
	webinarAbsenteesStatus404Schema,
	webinarAbsenteesStatus429Schema,
]);

export const pastWebinarsPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const pastWebinarsStatus200Schema = z
	.object({
		webinars: z
			.array(
				z.object({
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time.")
						.meta({ examples: ["2022-03-26T06:44:14Z"] }),
					uuid: z
						.string()
						.optional()
						.describe("Webinar UUID.")
						.meta({ examples: ["Bznyg8KZTdCVbQxvS/oZ7w=="] }),
				}),
			)
			.optional()
			.describe("List of ended webinar instances."),
	})
	.describe("List of webinars.");

export const pastWebinarsStatus400Schema = z.unknown();

export const pastWebinarsStatus404Schema = z.unknown();

export const pastWebinarsStatus429Schema = z.unknown();

export const pastWebinarsResponseSchema = pastWebinarsStatus200Schema;

export const pastWebinarsErrorSchema = z.union([
	pastWebinarsStatus400Schema,
	pastWebinarsStatus404Schema,
	pastWebinarsStatus429Schema,
]);

export const listWebinarParticipantsPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API returns a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const listWebinarParticipantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const listWebinarParticipantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const listWebinarParticipantsStatus200Schema = z.object({
	next_page_token: z
		.string()
		.optional()
		.describe(
			"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
		)
		.meta({ examples: ["Tva2CuIdTgsv8wAnhyAdU3m06Y2HuLQtlh3"] }),
	page_count: z
		.int()
		.optional()
		.describe("The number of pages returned for this request.")
		.meta({ examples: [1] }),
	page_size: z
		.int()
		.max(300)
		.optional()
		.default(30)
		.describe("The total number of records returned from a single API call.")
		.meta({ examples: [30] }),
	participants: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe("The participant's unique identifier.")
					.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
				name: z
					.string()
					.optional()
					.describe("The participant's name.")
					.meta({ examples: ["Jill Chill"] }),
				user_id: z
					.string()
					.optional()
					.describe(
						"The participant's ID. This ID is assigned to the participant upon joining the webinar and is only valid for that webinar.",
					)
					.meta({ examples: ["ABCDEF123456"] }),
				registrant_id: z
					.string()
					.optional()
					.describe(
						"The participant's unique registrant ID. This field only returns if you pass the `registrant_id` value for the `include_fields` query parameter. \n\nThis field does not return if the `type` query parameter is the `live` value.",
					)
					.meta({ examples: ["_f08HhPJS82MIVLuuFaJPg"] }),
				user_email: z
					.email()
					.optional()
					.describe(
						"Email address of the participant. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				join_time: z.iso
					.datetime()
					.optional()
					.describe("The participant's join time.")
					.meta({ examples: ["2019-02-01T12:34:12.66Z"] }),
				leave_time: z.iso
					.datetime()
					.optional()
					.describe("The participant's leave time.")
					.meta({ examples: ["2019-02-01T12:54:12.66Z"] }),
				duration: z
					.int()
					.optional()
					.describe(
						"Participant duration, in seconds, calculated by subtracting the `leave_time` from the `join_time` for the `user_id`. If the participant leaves and rejoins the same meeting, they will be assigned a different `user_id` and Zoom displays their new duration in a separate object. Note that because of this, the duration may not reflect the total time the user was in the meeting.",
					)
					.meta({ examples: [20] }),
				failover: z
					.boolean()
					.optional()
					.describe("Whether failover occurred during the webinar.")
					.meta({ examples: [false] }),
				status: z
					.enum(["in_meeting", "in_waiting_room"])
					.optional()
					.describe(
						"The participant's status. \n* `in_meeting` - In a meeting. \n* `in_waiting_room` - In a waiting room.",
					)
					.meta({ examples: ["in_meeting"] }),
				internal_user: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether the webinar participant is an internal user.")
					.meta({ examples: [false] }),
			}),
		)
		.optional()
		.describe("Array of webinar participant objects."),
	total_records: z
		.int()
		.optional()
		.describe("The total number of records available across all pages.")
		.meta({ examples: [1] }),
});

export const listWebinarParticipantsStatus400Schema = z.unknown();

export const listWebinarParticipantsStatus404Schema = z.unknown();

export const listWebinarParticipantsStatus429Schema = z.unknown();

export const listWebinarParticipantsResponseSchema = listWebinarParticipantsStatus200Schema;

export const listWebinarParticipantsErrorSchema = z.union([
	listWebinarParticipantsStatus400Schema,
	listWebinarParticipantsStatus404Schema,
	listWebinarParticipantsStatus429Schema,
]);

export const listPastWebinarPollResultsPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API returns a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const listPastWebinarPollResultsStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"Webinar ID in **long** format, represented as int64 data type in JSON, also known as the webinar number.",
		)
		.meta({ examples: [95204914252] }),
	questions: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe(
						"Email address of the user who submitted answers to the poll. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"Name of the user who submitted answers to the poll. If the `anonymous` option is enabled for a poll, the participant's polling information will be kept anonymous and the value of `name` field will be `Anonymous Attendee`.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe("Answer submitted by the user.")
								.meta({ examples: ["Good"] }),
							date_time: z.iso
								.datetime()
								.optional()
								.describe("Date and time when the answer to the poll was submitted.")
								.meta({ examples: ["2022-03-26T05:37:59Z"] }),
							polling_id: z
								.string()
								.optional()
								.describe("Unique identifier of the poll.")
								.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
							question: z
								.string()
								.optional()
								.describe("Question asked during the poll.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The webinar's start time.")
		.meta({ examples: ["2022-03-26T05:37:59Z"] }),
	uuid: z
		.string()
		.optional()
		.describe("Webinar UUID.")
		.meta({ examples: ["Bznyg8KZTdCVbQxvS/oZ7w=="] }),
});

export const listPastWebinarPollResultsStatus400Schema = z.unknown();

export const listPastWebinarPollResultsStatus404Schema = z.unknown();

export const listPastWebinarPollResultsStatus429Schema = z.unknown();

export const listPastWebinarPollResultsResponseSchema = listPastWebinarPollResultsStatus200Schema;

export const listPastWebinarPollResultsErrorSchema = z.union([
	listPastWebinarPollResultsStatus400Schema,
	listPastWebinarPollResultsStatus404Schema,
	listPastWebinarPollResultsStatus429Schema,
]);

export const listPastWebinarQAPathWebinarIdSchema = z
	.string()
	.describe(
		"The webinar's ID or universally unique ID (UUID). \n* If you provide a webinar ID, the API returns a response for the latest webinar instance. \n* If you provide a webinar UUID that begins with a `/` character or contains the `//` characters, you **must** [double encode](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#meeting-id-and-uuid) the webinar UUID before making an API request.",
	)
	.meta({ examples: ["ABCDE12345"] });

export const listPastWebinarQAStatus200Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe(
			"Webinar ID in **long** format, represented as int64 data type in JSON, also known as the webinar number.",
		)
		.meta({ examples: [95204914252] }),
	questions: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe(
						"Email address of the user. If the participant is **not** part of the host's account, this returns an empty string value, with some exceptions. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				name: z
					.string()
					.optional()
					.describe(
						"Name of the user. If `anonymous` option is enabled for the Q&amp;A, the participant's information will be kept anonymous and the value of `name` field will be `Anonymous Attendee`.",
					)
					.meta({ examples: ["Jill Chill"] }),
				question_details: z
					.array(
						z.object({
							answer: z
								.string()
								.optional()
								.describe(
									"Answer submitted for the question. The value will be 'live answered' if this is a live answer.",
								)
								.meta({ examples: ["Good"] }),
							question: z
								.string()
								.optional()
								.describe("Question asked during the Q&amp;A.")
								.meta({ examples: ["How are you?"] }),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The webinar's start time.")
		.meta({ examples: ["2022-03-26T06:44:14Z"] }),
	uuid: z
		.string()
		.optional()
		.describe("Webinar UUID.")
		.meta({ examples: ["Bznyg8KZTdCVbQxvS/oZ7w=="] }),
});

export const listPastWebinarQAStatus400Schema = z.unknown();

export const listPastWebinarQAStatus404Schema = z.unknown();

export const listPastWebinarQAStatus429Schema = z.unknown();

export const listPastWebinarQAResponseSchema = listPastWebinarQAStatus200Schema;

export const listPastWebinarQAErrorSchema = z.union([
	listPastWebinarQAStatus400Schema,
	listPastWebinarQAStatus404Schema,
	listPastWebinarQAStatus429Schema,
]);

export const listWebinarTemplatesPathUserIdSchema = z
	.string()
	.describe(
		"The user's ID. To get a user's ID, use the [**List users**](/docs/api-reference/zoom-api/ma#operation/users) API. For user-level apps, pass the `me` value instead of the user ID value.",
	)
	.meta({ examples: ["abcD3ojfdbjfg"] });

export const listWebinarTemplatesStatus200Schema = z.object({
	templates: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe("The webinar template's ID.")
					.meta({ examples: ["ull6574eur"] }),
				name: z
					.string()
					.optional()
					.describe("The webinar template's name.")
					.meta({ examples: ["Weekly Meeting Template"] }),
				type: z
					.int()
					.optional()
					.describe(
						"The webinar template type.  `1`: Webinar template    `2`: Admin webinar template",
					)
					.meta({ examples: [1] }),
			}),
		)
		.optional()
		.describe("Information about the webinar templates."),
	total_records: z
		.int()
		.optional()
		.describe("The total number of records returned.")
		.meta({ examples: [1] }),
});

export const listWebinarTemplatesStatus400Schema = z.unknown();

export const listWebinarTemplatesStatus404Schema = z.unknown();

export const listWebinarTemplatesStatus429Schema = z.unknown();

export const listWebinarTemplatesResponseSchema = listWebinarTemplatesStatus200Schema;

export const listWebinarTemplatesErrorSchema = z.union([
	listWebinarTemplatesStatus400Schema,
	listWebinarTemplatesStatus404Schema,
	listWebinarTemplatesStatus429Schema,
]);

export const webinarTemplateCreatePathUserIdSchema = z
	.string()
	.describe(
		"The user ID retrievable from the [List users](/api-reference/zoom-api/methods#operation/users) API.",
	)
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const webinarTemplateCreateStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("The webinar template's ID.")
		.meta({ examples: ["ull6574eur"] }),
	name: z
		.string()
		.optional()
		.describe("The webinar template's name.")
		.meta({ examples: ["Weekly Meeting Template"] }),
});

export const webinarTemplateCreateStatus400Schema = z.unknown();

export const webinarTemplateCreateStatus404Schema = z.unknown();

export const webinarTemplateCreateStatus429Schema = z.unknown();

export const webinarTemplateCreateResponseSchema = webinarTemplateCreateStatus201Schema;

export const webinarTemplateCreateErrorSchema = z.union([
	webinarTemplateCreateStatus400Schema,
	webinarTemplateCreateStatus404Schema,
	webinarTemplateCreateStatus429Schema,
]);

export const webinarTemplateCreateBodySchema = z
	.object({
		webinar_id: z.coerce
			.bigint()
			.optional()
			.describe("The webinar ID in long (int64) format.")
			.meta({ examples: [96172769962] }),
		name: z
			.string()
			.optional()
			.describe("The webinar template's name.")
			.meta({ examples: ["Weekly Meeting Template"] }),
		save_recurrence: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"If the field is set to true, the recurrence webinar template will be saved as the scheduled webinar.",
			)
			.meta({ examples: [false] }),
		overwrite: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Overwrite an existing webinar template if the template is created from same existing webinar.",
			)
			.meta({ examples: [false] }),
	})
	.optional();

export const webinarsPathUserIdSchema = z
	.string()
	.describe("The user's user ID or email address. For user-level apps, pass the `me` value.");

export const webinarsQueryTypeSchema = z
	.enum(["scheduled", "upcoming"])
	.optional()
	.default("scheduled")
	.describe(
		"The type of webinar. \n* `scheduled` - All valid previous (unexpired) webinars, live webinars, and upcoming scheduled webinars. \n* `upcoming` - All upcoming webinars, including live webinars.",
	)
	.meta({ examples: ["scheduled"] });

export const webinarsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const webinarsQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"**Deprecated** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
	)
	.meta({ examples: [1] });

export const webinarsQueryIncludeEventsWebinarSchema = z
	.boolean()
	.optional()
	.describe("Include Zoom events webinar in searches. The default is `true`.")
	.meta({ examples: [true] });

export const webinarsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated** We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		webinars: z
			.array(
				z.object({
					agenda: z
						.string()
						.optional()
						.describe(
							"Webinar description. The agenda length gets truncated to 250 characters when you list all webinars for a user. To view the complete agenda, retrieve details for a single webinar, use the [**Get a webinar**](/docs/api-reference/zoom-api/methods#operation/webinar) API.",
						)
						.meta({ examples: ["Learn more about Zoom APIs"] }),
					created_at: z.iso
						.datetime()
						.optional()
						.describe("The webinar's creation time.")
						.meta({ examples: ["2021-07-01T22:00:00Z"] }),
					duration: z
						.int()
						.optional()
						.describe("The webinar's duration, in minutes.")
						.meta({ examples: [60] }),
					host_id: z
						.string()
						.optional()
						.describe("The host's ID.")
						.meta({ examples: ["x1yCzABCDEfg23HiJKl4mN"] }),
					id: z.coerce
						.bigint()
						.optional()
						.describe("The webinar ID.")
						.meta({ examples: [1234567890] }),
					join_url: z
						.string()
						.optional()
						.describe("The URL to join the webinar.")
						.meta({ examples: ["https://example.com/j/11111"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("The webinar's start time.")
						.meta({ examples: ["2021-07-13T21:00:00Z"] }),
					timezone: z
						.string()
						.optional()
						.describe(
							"The webinar's [timezone](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#timezones).",
						)
						.meta({ examples: ["America/Los_Angeles"] }),
					topic: z
						.string()
						.optional()
						.describe("The webinar's topic.")
						.meta({ examples: ["My Webinar"] }),
					type: z
						.union([z.literal(5), z.literal(6), z.literal(9)])
						.optional()
						.default(5)
						.describe(
							"The webinar type. \n* `5` - A webinar. \n* `6` - A recurring webinar without a fixed time. \n* `9` - A recurring webinar with a fixed time.",
						)
						.meta({ examples: [9] }),
					uuid: z
						.string()
						.optional()
						.describe(
							"The webinar's universally unique identifier (UUID). Each webinar instance generates a webinar UUID.",
						)
						.meta({ examples: ["4444AAAiAAAAAiAiAiiAii=="] }),
					is_simulive: z
						.boolean()
						.optional()
						.describe("Whether the webinar is `simulive`.")
						.meta({ examples: [true] }),
					is_events_webinar: z
						.boolean()
						.optional()
						.describe("The webinar is created from zoom events")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("List of webinar objects."),
	})
	.describe("List of webinars.");

export const webinarsStatus400Schema = z.unknown();

export const webinarsStatus404Schema = z.unknown();

export const webinarsStatus429Schema = z.unknown();

export const webinarsResponseSchema = webinarsStatus200Schema;

export const webinarsErrorSchema = z.union([
	webinarsStatus400Schema,
	webinarsStatus404Schema,
	webinarsStatus429Schema,
]);

export const webinarCreatePathUserIdSchema = z
	.string()
	.describe("The user ID or email address of the user. For user-level apps, pass the `me` value.")
	.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] });

export const webinarCreateStatus201Schema = z
	.object({
		host_email: z
			.email()
			.optional()
			.describe("Email address of the meeting host.")
			.meta({ examples: ["jchill@example.com"] }),
		host_id: z
			.string()
			.optional()
			.describe("ID of the user set as host of the webinar.")
			.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
		id: z.coerce
			.bigint()
			.optional()
			.describe(
				"Webinar ID in **long** format, represented as int64 data type in JSON. Also known as the webinar number.",
			)
			.meta({ examples: [95204914252] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The webinar template's unique identifier. Use this field only if you would like to [schedule the webinar using an existing template](https://support.zoom.us/hc/en-us/articles/115001079746-Webinar-Templates#schedule). The value of this field can be retrieved from [**List webinar templates**](/docs/api/rest/reference/zoom-api/methods#operation/listWebinarTemplates) API.\nYou must provide the user ID of the host instead of the email address in the `userId` path parameter in order to use a template for scheduling a Webinar.",
			)
			.meta({ examples: ["ull6574eur"] }),
		uuid: z
			.string()
			.optional()
			.describe(
				"A webinar's unique identifier. Each webinar instance will generate its own UUID. Ror example, after a webinar ends, a new UUID is generated for the next instance of the webinar. Once a webinar ends, the value of the UUID for the same webinar will be different from when it was scheduled.",
			)
			.meta({ examples: ["Bznyg8KZTdCVbQxvS/oZ7w=="] }),
		agenda: z
			.string()
			.optional()
			.describe("The webinar's agenda.")
			.meta({ examples: ["My Webinar"] }),
		created_at: z.iso
			.datetime()
			.optional()
			.describe("Creation time.")
			.meta({ examples: ["2022-03-26T07:18:32Z"] }),
		duration: z
			.int()
			.optional()
			.describe("The webinar's duration.")
			.meta({ examples: [60] }),
		registration_url: z
			.string()
			.optional()
			.describe(
				"The URL that registrants can use to register for a webinar. This field is only returned for webinars that have enabled registration.",
			)
			.meta({
				examples: ["https://example.com/webinar/register/7ksAkRCoEpt1Jm0wa-E6lICLur9e7Lde5oW6"],
			}),
		join_url: z
			.string()
			.optional()
			.describe(
				"URL to join the webinar. Only share this URL with the users who should be invited to the webinar.",
			)
			.meta({ examples: ["https://example.com/j/11111"] }),
		occurrences: z
			.array(
				z.object({
					duration: z
						.int()
						.optional()
						.describe("Duration.")
						.meta({ examples: [60] }),
					occurrence_id: z
						.string()
						.optional()
						.describe(
							"Occurrence ID: a unique identifier that identifies an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences.",
						)
						.meta({ examples: ["1648194360000"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time.")
						.meta({ examples: ["2022-03-25T07:46:00Z"] }),
					status: z
						.enum(["available", "deleted"])
						.optional()
						.describe(
							"Occurrence status. \n `available` - Available occurrence.  \n `deleted` -  Deleted occurrence.",
						)
						.meta({ examples: ["available"] }),
				}),
			)
			.optional()
			.describe("Array of occurrence objects."),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"The webinar passcode. By default, it can be up to 10 characters in length and may contain alphanumeric characters as well as special characters such as !, @, #, etc.",
			)
			.meta({ examples: ["123456"] }),
		encrypted_passcode: z
			.string()
			.optional()
			.describe("Encrypted passcode for third party endpoints (H323/SIP).")
			.meta({ examples: ["8pEkRweVXPV3Ob2KJYgFTRlDtl1gSn.1"] }),
		h323_passcode: z
			.string()
			.optional()
			.describe("H.323/SIP room system passcode.")
			.meta({ examples: ["123456"] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"A date when the webinar will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Can't be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"How many times the webinar will recur before it is canceled. The maximum number of recurring is 60. Can't be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state which day in a month the webinar should recur. The value range is from 1 to 31.\n\nFor instance, if you would like the webinar to recur on 23rd of each month, provide `23` as the value of this field and `1` as the value of the `repeat_interval` field. Instead, if you would like the webinar to recur once every three months, on 23rd of the month, change the value of the `repeat_interval` field to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state the week of the month when the webinar should recur. If you use this field, **you must also use the `monthly_week_day` field to state the day of the week when the webinar should recur.**   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state a specific day in a week when the monthly webinar should recur. To use this field, you must also use the `monthly_week` field.   \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the webinar should recur. For instance, if you would like to schedule a Webinar that recurs every two months, you must set the value of this field as `2` and the value of the `type` parameter as `3`. \n\nFor a daily webinar, the maximum interval you can set is `90` days. For a weekly webinar, the maximum interval that you can set is `12` weeks. For a monthly webinar, the maximum interval that you can set is `3` months.",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe(
						"Recurrence webinar types. \n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.",
					)
					.meta({ examples: [1] }),
				weekly_days: z
					.string()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `2` to state which day(s) of the week the webinar should repeat.   \n  The value for this field could be a number between `1` to `7` in string format. For instance, if the Webinar should recur on Sunday, provide `1` as the value of this field.\n\n**Note:** If you would like the webinar to occur on multiple days of a week, you should provide comma separated values for this field. For instance, if the webinar should recur on Sundays and Tuesdays, provide `1,3` as the value of this field.\n\n  \n `1` - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.\n\n",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a webinar of type `9` i.e., a recurring webinar with fixed time. ",
			),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add additional webinar [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe("Allow attendees to join from multiple devices.")
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe("Alternative host emails or IDs. Multiple values separated by comma.")
					.meta({ examples: ["jchill@example.com"] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				attendees_and_panelists_reminder_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send reminder email to attendees and panelists.\n\n* `false` - Do not send reminder email to attendees and panelists.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 hour before webinar.  \n `2` - Send 1 day before webinar.  \n `3` - Send 1 hour and 1 day before webinar.  \n `4` - Send 1 week before webinar.  \n `5` - Send 1 hour and 1 week before webinar.  \n `6` - Send 1 day and 1 week before webinar.  \n `7` - Send 1 hour, 1 day and 1 week before webinar.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send reminder email to attendees and panelists."),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe("Determine how participants can join the audio portion of the webinar.")
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference info.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [**Sign Into Zoom with Specified Domains**](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_name: z
					.string()
					.optional()
					.describe(
						"Authentication name set in the [authentication profile](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f).",
					)
					.meta({ examples: ["Sign in to Zoom"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Webinar authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.union([z.literal("local"), z.literal("cloud"), z.literal("none")])
					.optional()
					.default("none")
					.describe(
						"Automatic recording. \n `local` - Record on local.  \n `cloud` -  Record on cloud.  \n `none` - Disabled.",
					)
					.meta({ examples: ["cloud"] }),
				close_registration: z
					.boolean()
					.optional()
					.describe("Close registration after event date.")
					.meta({ examples: [true] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration")
					.meta({ examples: ["Jill Chill"] }),
				email_language: z
					.string()
					.optional()
					.describe(
						"Set the email language.\n`en-US`,`de-DE`,`es-ES`,`fr-FR`,`jp-JP`,`pt-PT`,`ru-RU`,`zh-CN`, `zh-TW`, `ko-KO`, `it-IT`, `vi-VN`.",
					)
					.meta({ examples: ["en-US"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.**\n\n As an alternative, use the `meeting_authentication`, `authentication_option` and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**\n\n As an alternative, use the `meeting_authentication`, `authentication_option` and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: ["example.com"] }),
				follow_up_absentees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to absentees.\n\n* `false` - Do not send follow-up email to absentees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 days after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to absentees."),
				follow_up_attendees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to attendees.\n\n* `false` - Do not send follow-up email to attendees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 day after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to attendees."),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries"),
				global_dial_in_numbers: z
					.array(
						z.object({
							city: z
								.string()
								.optional()
								.describe("City of the number.")
								.meta({ examples: ["New York"] }),
							country: z
								.string()
								.optional()
								.describe("The country code.")
								.meta({ examples: ["US"] }),
							country_name: z
								.string()
								.optional()
								.describe("Full name of country.")
								.meta({ examples: ["US"] }),
							number: z
								.string()
								.optional()
								.describe("Dial-in phone number.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.enum(["toll", "tollfree", "premium"])
								.optional()
								.describe("Dial-in number type.")
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("A list of available dial-in numbers for different countries or regions."),
				hd_video: z
					.boolean()
					.optional()
					.default(false)
					.describe("Default to HD video.")
					.meta({ examples: [false] }),
				hd_video_for_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether HD video for attendees is enabled.")
					.meta({ examples: [false] }),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when host joins webinar.")
					.meta({ examples: [true] }),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** This feature is only available for certain Webinar add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar. This is not supported for simulive webinars.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/rest/reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's sign language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar.",
					),
				panelist_authentication: z
					.boolean()
					.optional()
					.describe(
						"Require panelists to authenticate to join. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("Only authenticated users can join Webinar.")
					.meta({ examples: [true] }),
				add_watermark: z
					.boolean()
					.optional()
					.describe(
						"Add watermark that identifies the viewing participant. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				add_audio_watermark: z
					.boolean()
					.optional()
					.describe(
						"Add audio watermark that identifies the participants. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				on_demand: z
					.boolean()
					.optional()
					.default(false)
					.describe("Make the webinar on demand.")
					.meta({ examples: [false] }),
				panelists_invitation_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send invitation email to panelists. If `false`, do not send invitation email to panelists.",
					)
					.meta({ examples: [true] }),
				panelists_video: z
					.boolean()
					.optional()
					.describe("Start video when panelists join the webinar.")
					.meta({ examples: [true] }),
				post_webinar_survey: z
					.boolean()
					.optional()
					.describe(
						"Zoom will open a survey page in attendees' browsers after leaving the webinar.",
					)
					.meta({ examples: [true] }),
				practice_session: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable practice session.")
					.meta({ examples: [false] }),
				question_and_answer: z
					.object({
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists.\n\n* `false` - Do not allow anonymous questions.",
							)
							.meta({ examples: [true] }),
						answer_questions: z
							.enum(["only", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view only answered questions, or view all questions.\n\n* `only` - Attendees are able to view answered questions only.\n\n* `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can not click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
						allow_auto_reply: z
							.boolean()
							.optional()
							.describe(
								"If simulive webinar, \n\n* `true` - allow auto-reply to attendees. \n\n* `false` - don't allow auto-reply to the attendees.",
							)
							.meta({ examples: [true] }),
						auto_reply_text: z
							.string()
							.optional()
							.describe(
								"If `allow_auto_reply` = true, the text to be included in the automatic response. ",
							)
							.meta({
								examples: ["Thank you for your question. We will get back to you shortly."],
							}),
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true`: Enable [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.\n\n* `false`: Disable Q&amp;A for webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.",
					),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe("Send confirmation email to registrants.")
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send email notifications to registrants about approval, cancellation, denial of the registration. The value of this field must be set to true in order to use the `registrants_confirmation_email` field.",
					)
					.meta({ examples: [true] }),
				registrants_restrict_number: z
					.int()
					.min(0)
					.max(20000)
					.optional()
					.default(0)
					.describe(
						"Restrict number of registrants for a webinar. By default, it is set to `0`. A `0` value means that the restriction option is disabled. Provide a number higher than 0 to restrict the webinar registrants by the that number.",
					)
					.meta({ examples: [100] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration types. Only used for recurring webinars with a fixed time.  \n `1` - Attendees register once and can attend any of the webinar sessions.  \n `2` - Attendees need to register for each session in order to attend.  \n `3` - Attendees register once and can choose one or more sessions to attend.",
					)
					.meta({ examples: [1] }),
				send_1080p_video_to_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Always send 1080p video to attendees.")
					.meta({ examples: [false] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe("Show social share buttons on the registration page.")
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the webinar's join information on the registration confirmation page. This setting is only applied to webinars with registration enabled.",
					)
					.meta({ examples: [true] }),
				survey_url: z
					.string()
					.optional()
					.describe("Survey url for post webinar survey.")
					.meta({ examples: ["https://example.com"] }),
				enable_session_branding: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Webinar Session Branding** setting is enabled. This setting lets hosts visually customize a webinar by setting a session background. This also lets hosts use [Webinar Session Branding](https://support.zoom.us/hc/en-us/articles/4836268732045-Using-Webinar-Session-Branding) to set the Virtual Background for and apply name tags to hosts, alternative hosts, panelists, interpreters, and speakers.",
					)
					.meta({ examples: [true] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. Not supported for simulive webinar. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and cohosts to fully control the mute state of participants. Not supported for simulive webinar. If not provided, the default value will be based on the user's setting. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe("Whether to include guest's email addresses in attendee reports for webinars.")
					.meta({ examples: [true] }),
			})
			.optional()
			.describe("Webinar settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe("Webinar start time in GMT/UTC.")
			.meta({ examples: ["2022-03-26T07:18:32Z"] }),
		start_url: z
			.string()
			.optional()
			.describe(
				"  \n The `start_url` of a webinar is a URL using which a host or an alternative host can start the webinar. This URL should only be used by the host of the meeting and should not be shared with anyone other than the host of the webinar. \n\nThe expiration time for the `start_url` field listed in the response of the [**Create a webinar**](/docs/api/rest/reference/zoom-api/methods#operation/webinarCreate) API is two hours for all regular users. \n\t\nFor users created using the `custCreate` option via the [**Create users**](/docs/api/rest/reference/zoom-api/methods#operation/userCreate) API, the expiration time of the `start_url` field is 90 days.\n\t\nFor security reasons, to retrieve the latest value for the `start_url` field programmatically after expiry, call the [**Get a webinar**](/docs/api/rest/reference/zoom-api/methods#operation/webinar) API and refer to the value of the `start_url` field in the response.  \n   \n   \n ",
			)
			.meta({ examples: ["https://example.com/s/11111"] }),
		timezone: z
			.string()
			.optional()
			.describe("Time zone to format `start_time`.")
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.max(200)
			.optional()
			.describe("The webinar's topic.")
			.meta({ examples: ["My Webinar"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("Tracking fields type.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("Tracking fields value.")
						.meta({ examples: ["value1"] }),
					visible: z
						.boolean()
						.optional()
						.describe(
							"Whether the [tracking field](https://support.zoom.us/hc/en-us/articles/115000293426-Scheduling-Tracking-Fields) is visible in the webinar scheduling options in the Zoom Web Portal or not.\n\n* `true` - Tracking field is visible.\n* `false` - Tracking field is not visible to the users in the webinar options in the Zoom Web Portal but the field was used while scheduling this webinar via API. An invisible tracking field can be used by users while scheduling webinars via API only. ",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(5), z.literal(6), z.literal(9)])
			.optional()
			.default(5)
			.describe(
				"Webinar types.  \n `5` - Webinar.  \n `6` - Recurring webinar with no fixed time.  \n `9` - Recurring webinar with a fixed time.",
			)
			.meta({ examples: [5] }),
		is_simulive: z
			.boolean()
			.optional()
			.describe("Whether the webinar is `simulive`.")
			.meta({ examples: [true] }),
		record_file_id: z
			.string()
			.optional()
			.describe("The previously recorded file's ID for `simulive`.")
			.meta({ examples: ["f09340e1-cdc3-4eae-9a74-98f9777ed908"] }),
		transition_to_live: z
			.boolean()
			.optional()
			.describe(
				"Whether to transition a simulive webinar to live. The host must be present at the time of transition.",
			)
			.meta({ examples: [false] }),
		simulive_delay_start: z
			.object({
				enable: z
					.boolean()
					.optional()
					.describe("Whether simulive need delay playback.")
					.meta({ examples: [true] }),
				time: z
					.int()
					.optional()
					.describe("The time for delayed playback.")
					.meta({ examples: [10] }),
				timeunit: z
					.string()
					.optional()
					.describe("The time unit for delayed playback.")
					.meta({ examples: ["second or minute"] }),
			})
			.optional()
			.describe('{"enable":false,"time":0,"timeunit":"second"}'),
		creation_source: z
			.enum(["other", "open_api", "web_portal"])
			.optional()
			.describe(
				"The platform through which the meeting was created.\n* `other` - Created through another platform.\n* `open_api` - Created through Open API.\n* `web_portal` - Created through the web portal.",
			)
			.meta({ examples: ["open_api"] }),
	})
	.describe("Webinar object.");

export const webinarCreateStatus400Schema = z.unknown();

export const webinarCreateStatus404Schema = z.unknown();

export const webinarCreateStatus429Schema = z.unknown();

export const webinarCreateResponseSchema = webinarCreateStatus201Schema;

export const webinarCreateErrorSchema = z.union([
	webinarCreateStatus400Schema,
	webinarCreateStatus404Schema,
	webinarCreateStatus429Schema,
]);

export const webinarCreateBodySchema = z
	.object({
		agenda: z
			.string()
			.optional()
			.describe("Webinar description.")
			.meta({ examples: ["My Webinar"] }),
		duration: z
			.int()
			.optional()
			.describe("Webinar duration, in minutes. Used for scheduled webinars only.")
			.meta({ examples: [60] }),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"The webinar passcode. By default, it can be up to 10 characters in length and may contain alphanumeric characters as well as special characters like !, @, #, and others.\n\n**Note**\n- If the account owner or administrator has configured [Passcode Requirement](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063160#h_a427384b-e383-4f80-864d-794bf0a37604), the passcode **must** meet those requirements. You can retrieve the requirements using the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API or the [**Get account settings**](/docs/api/accounts/#tag/accounts/GET/accounts/{accountId}/settings) API.\n- If the **Passcode** user setting is enabled and `default_passcode` is not explicitly set to `false`, a passcode will be automatically generated when one is not provided.\n- If the **Passcode** setting is enabled and [locked](https://support.zoom.us/hc/en-us/articles/115005269866-Using-Tiered-Settings#locked) for the user, a passcode will be automatically generated when one is not provided.",
			)
			.meta({ examples: ["123456"] }),
		default_passcode: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Determines whether to automatically generate a passcode for the webinar when no passcode is provided and the user's **Passcode** setting is enabled. Defaults to `true`. When set to `false`, webinars will only have a passcode if one is explicitly provided.",
			)
			.meta({ examples: [true] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select a date when the webinar will recur before it is canceled. Should be in UTC time, such as `2017-11-25T12:00:00Z`. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"Select how many times the webinar will recur before it is canceled. The maximum number of recurring is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type `3`** to state which day in a month the webinar should recur. The value range is from 1 to 31.\n\nFor instance, if you would like the webinar to recur on 23rd of each month, provide `23` as the value of this field and `1` as the value of the `repeat_interval` field. Instead, if you would like the webinar to recur once every three months, on 23rd of the month, change the value of the `repeat_interval` field to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type `3`** to state the week of the month when the webinar should recur. If you use this field, **you must also use the `monthly_week_day` field to state the day of the week when the webinar should recur.**   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type `3`** to state a specific day in a week when the monthly webinar should recur. To use this field, you must also use the `monthly_week` field.   \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the webinar should recur. For instance, to schedule a webinar that recurs every two months, you must set the value of this field as `2` and the value of the `type` parameter as `3`. \n\nFor a daily webinar, the maximum interval you can set is `90` days. For a weekly webinar, the maximum interval that you can set is `12` weeks. For a monthly webinar, the maximum interval that you can set is `3` months.",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe("Recurrence webinar types.\n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.")
					.meta({ examples: [1] }),
				weekly_days: z
					.string()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `2` to state which day(s) of the week the webinar should repeat.\nThe value for this field could be a number between `1` to `7` in string format. For instance, if the webinar should recur on Sunday, provide `1` as the value of this field.    \n   \n  **Note:** If you would like the webinar to occur on multiple days of a week, you should provide comma separated values for this field. For instance, if the webinar should recur on Sundays and Tuesdays, provide `1,3` as the value of this field.\n\n  \n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.\n\n",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a webinar of type `9`, a recurring webinar with fixed time. ",
			),
		schedule_for: z
			.string()
			.optional()
			.describe("The email address or user ID of the user to schedule a webinar for.")
			.meta({ examples: ["jchill@example.com"] }),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add additional webinar [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe("Allow attendees to join from multiple devices.")
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe("Alternative host emails or IDs. Multiple values separated by comma.")
					.meta({ examples: ["jchill@example.com;thill@example.com"] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"The default value is `2`. To enable registration required, set the approval type to `0` or `1`.  Values include:  \n \n\n`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				attendees_and_panelists_reminder_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` -  Send reminder email to attendees and panelists.\n\n* `false` - Do not send reminder email to attendees and panelists.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 hour before webinar.  \n `2` - Send 1 day before webinar.  \n `3` - Send 1 hour and 1 day before webinar.  \n `4` - Send 1 week before webinar.  \n `5` - Send 1 hour and 1 week before webinar.  \n `6` - Send 1 day and 1 week before webinar.  \n `7` - Send 1 hour, 1 day and 1 week before webinar.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send reminder email to attendees and panelists."),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe(
						"Determine how participants can join the audio portion of the meeting.(Not supported for simulive webinar.)",
					)
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference information.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"Meeting authentication domains. This option allows you to specify the rule so that Zoom users whose email address contains a certain domain can join the webinar. You can either provide multiple comma-separated domains, use a wildcard for listing domains, or use both methods.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_option: z
					.string()
					.optional()
					.describe(
						"Specify the authentication type for users to join a webinar with `meeting_authentication` setting set to `true`. The value of this field can be retrieved from the `id` field within `authentication_options` array in the response of [**Get user settings**](/docs/api/rest/reference/zoom-api/methods#operation/userSettings) API.",
					)
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.union([z.literal("local"), z.literal("cloud"), z.literal("none")])
					.optional()
					.default("none")
					.describe(
						"Automatic recording. Not supported for simulive webinar.   \n `local` - Record on local.  \n `cloud` -  Record on cloud.  \n `none` - Disabled.",
					)
					.meta({ examples: ["cloud"] }),
				close_registration: z
					.boolean()
					.optional()
					.describe("Close registration after event date.")
					.meta({ examples: [true] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration")
					.meta({ examples: ["Jill Chill"] }),
				email_language: z
					.string()
					.optional()
					.describe(
						"Set the email language.\n`en-US`,`de-DE`,`es-ES`,`fr-FR`,`id-ID`,`jp-JP`,`nl-NL`,`pl-PL`,`pt-PT`,`ru-RU`,`tr-TR`,`zh-CN`, `zh-TW`, `ko-KO`, `it-IT`, `vi-VN`.",
					)
					.meta({ examples: ["en-US"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed-in users can join this meeting. \n\n**This field is deprecated and will not be supported in future.**   \n   \n  Instead of this field, use the `meeting_authentication`, `authentication_option`, or `authentication_domains` fields to establish the authentication mechanism for this Webinar. ",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed-in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in future.**   \n \n  Instead of this field, use the `authentication_domains` field for this webinar. ",
					)
					.meta({ examples: ["example.com"] }),
				follow_up_absentees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to absentees.\n\n* `false` - Do not send follow-up email to absentees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 days after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to absentees."),
				follow_up_attendees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true`: Send follow-up email to attendees.\n\n* `false`: Do not send follow-up email to attendees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 day after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to attendees."),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries"),
				hd_video: z
					.boolean()
					.optional()
					.default(false)
					.describe("Default to HD video. Not supported for simulive webinar.")
					.meta({ examples: [false] }),
				hd_video_for_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether HD video for attendees is enabled. This value defaults to `false`. Not supported for simulive webinar.",
					)
					.meta({ examples: [false] }),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when host joins webinar. Not supported for simulive webinar.")
					.meta({ examples: [true] }),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** This feature is only available for certain Webinar add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar. This is not supported for simulive webinars.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/rest/reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's sign language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar.",
					),
				panelist_authentication: z
					.boolean()
					.optional()
					.describe(
						"Require panelists to authenticate to join. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe(
						"Only [authenticated](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) users can join meeting if the value of this field is set to `true`.",
					)
					.meta({ examples: [true] }),
				add_watermark: z
					.boolean()
					.optional()
					.describe(
						"Add watermark that identifies the viewing participant. Not supported for simulive webinar. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				add_audio_watermark: z
					.boolean()
					.optional()
					.describe(
						"Add audio watermark that identifies the participants. Not supported for simulive webinar. If not provided, the default value will be based on the user's setting.",
					)
					.meta({ examples: [true] }),
				on_demand: z
					.boolean()
					.optional()
					.default(false)
					.describe("Make the webinar on-demand. Not supported for simulive webinar.")
					.meta({ examples: [false] }),
				panelists_invitation_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send invitation email to panelists. If `false`, do not send invitation email to panelists.",
					)
					.meta({ examples: [true] }),
				panelists_video: z
					.boolean()
					.optional()
					.describe("Start video when panelists join webinar. Not supported for simulive webinar.")
					.meta({ examples: [true] }),
				post_webinar_survey: z
					.boolean()
					.optional()
					.describe("Zoom will open a survey page in attendees' browsers after leaving the webinar")
					.meta({ examples: [true] }),
				practice_session: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable practice session.")
					.meta({ examples: [false] }),
				question_and_answer: z
					.object({
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists..\n\n* `false` - Do not allow anonymous questions.(Not supported for simulive webinar.)",
							)
							.meta({ examples: [true] }),
						answer_questions: z
							.enum(["only", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view answered questions only or view all questions.\n\n* `only` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can not click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
						allow_auto_reply: z
							.boolean()
							.optional()
							.describe(
								"If simulive webinar, \n\n* `true` - allow auto-reply to attendees. \n\n* `false` - don't allow auto-reply to the attendees.",
							)
							.meta({ examples: [true] }),
						auto_reply_text: z
							.string()
							.optional()
							.describe(
								"If `allow_auto_reply` = true, the text to be included in the automatic response. ",
							)
							.meta({
								examples: ["Thank you for your question. We will get back to you shortly."],
							}),
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.\n\n* `false` - Disable Q&amp;A for webinar. If not provided, the default value will be based on the user's setting.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.",
					),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe("Send confirmation email to registrants.")
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send email notifications to registrants about approval, cancellation, denial of the registration. The value of this field must be set to true in order to use the `registrants_confirmation_email` field.",
					)
					.meta({ examples: [true] }),
				registrants_restrict_number: z
					.int()
					.min(0)
					.max(20000)
					.optional()
					.default(0)
					.describe(
						"Restrict number of registrants for a webinar. By default, it is set to `0`. A `0` value means that the restriction option is disabled. Provide a number higher than 0 to restrict the webinar registrants by the that number.",
					)
					.meta({ examples: [100] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration types. Only used for recurring webinars with a fixed time.  \n `1` - Attendees register once and can attend any of the webinar sessions.  \n `2` - Attendees need to register for each session in order to attend.  \n `3` - Attendees register once and can choose one or more sessions to attend.",
					)
					.meta({ examples: [1] }),
				send_1080p_video_to_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to always send 1080p video to attendees. This value defaults to `false`.(Not supported for simulive webinar.)",
					)
					.meta({ examples: [false] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe("Show social share buttons on the registration page.")
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the webinar's join information on the registration confirmation page. This setting is only applied to webinars with registration enabled.",
					)
					.meta({ examples: [true] }),
				survey_url: z
					.string()
					.optional()
					.describe("Survey URL for post webinar survey.")
					.meta({ examples: ["https://example.com"] }),
				enable_session_branding: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Webinar Session Branding** setting is enabled. This setting lets hosts visually customize a webinar by setting a session background. This also lets hosts set Virtual Background and apply name tags to hosts, alternative hosts, panelists, interpreters, and speakers.",
					)
					.meta({ examples: [true] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. Not supported for simulive webinar. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and cohosts to fully control the mute state of participants. Not supported for simulive webinar. If not provided, the default value will be based on the user's setting. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe("Whether to include guest's email addresses in webinars' attendee reports.")
					.meta({ examples: [true] }),
			})
			.optional()
			.describe("Create webinar settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe(
				"Webinar start time. We support two formats for `start_time` - local time and GMT.  \n  \n\nTo set time as GMT the format should be `yyyy-MM-dd`T`HH:mm:ssZ`.\n\nTo set time using a specific timezone, use `yyyy-MM-dd`T`HH:mm:ss` format and specify the timezone [ID](/docs/api/references/abbreviations/#timezones) in the `timezone` field OR leave it blank and the timezone set on your Zoom account will be used. You can also set the time as UTC as the timezone field.\n\nThe `start_time` should only be used for scheduled and / or recurring webinars with fixed time.",
			)
			.meta({ examples: ["2022-03-26T06:44:14Z"] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The webinar template ID to schedule a webinar using a [webinar template](https://support.zoom.us/hc/en-us/articles/115001079746-Webinar-Templates) or a [admin webinar template](https://support.zoom.us/hc/en-us/articles/8137753618957-Configuring-admin-webinar-templates). For a list of webinar templates, use the [**List webinar templates**](/docs/api/rest/reference/zoom-api/methods#operation/listWebinarTemplates) API.",
			)
			.meta({ examples: ["5Cj3ceXoStO6TGOVvIOVPA=="] }),
		timezone: z
			.string()
			.optional()
			.describe(
				"The timezone to assign to the `start_time` value. This field is only used for scheduled or recurring webinars with a fixed time.\n\nFor a list of supported timezones and their formats, see our [timezone list](/docs/api/references/abbreviations/#timezones).",
			)
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.optional()
			.describe("The webinar's topic.")
			.meta({ examples: ["My Webinar"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.describe("Tracking fields type.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("Tracking fields value.")
						.meta({ examples: ["value1"] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(5), z.literal(6), z.literal(9)])
			.optional()
			.default(5)
			.describe(
				"Webinar types.\n `5` - Webinar.  \n `6` - Recurring webinar with no fixed time.  \n `9` - Recurring webinar with a fixed time.",
			)
			.meta({ examples: [5] }),
		is_simulive: z
			.boolean()
			.optional()
			.describe("Whether to set the webinar to simulive.")
			.meta({ examples: [true] }),
		record_file_id: z
			.string()
			.optional()
			.describe("The previously recorded file's ID for `simulive`.")
			.meta({ examples: ["f09340e1-cdc3-4eae-9a74-98f9777ed908"] }),
		transition_to_live: z
			.boolean()
			.optional()
			.describe(
				"Whether to transition a simulive webinar to live. The host must be present at the time of transition.",
			)
			.meta({ examples: [false] }),
		simulive_delay_start: z
			.object({
				enable: z
					.boolean()
					.optional()
					.describe("Whether simulive need delay playback.")
					.meta({ examples: [true] }),
				time: z
					.int()
					.optional()
					.describe(
						"The time for delayed playback\nIf the time unit is seconds, then the maximum value is 60 and the minimum value is 1.\nIf the time unit is minutes, then the maximum value is 10 and the minimum value is 1.",
					)
					.meta({ examples: [10] }),
				timeunit: z
					.enum(["second", "minute"])
					.optional()
					.default("second")
					.describe(
						"The time unit for delayed playback\n`second` - The time unit for delayed playback is seconds.\n`minute` - The time unit for delayed playback is minutes.",
					)
					.meta({ examples: ["second"] }),
			})
			.optional()
			.describe('{"enable":false,"time":0,"timeunit":"second"}'),
	})
	.optional()
	.describe("Webinar object.");

export const webinarPathWebinarIdSchema = z
	.string()
	.describe("The webinar's ID or universally unique ID (UUID).")
	.meta({ examples: ["95204914252"] });

export const webinarQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe(
		"Unique identifier for an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences. When you create a recurring Webinar using [**Create a webinar**](/docs/api-reference/zoom-api/methods#operation/webinarCreate) API, you can retrieve the Occurrence ID from the response of the API call.",
	)
	.meta({ examples: ["1648538280000"] });

export const webinarQueryShowPreviousOccurrencesSchema = z
	.boolean()
	.optional()
	.describe(
		"Set the value of this field to `true` to view webinar details of all previous occurrences of a recurring webinar.",
	)
	.meta({ examples: [true] });

export const webinarStatus200Schema = z
	.object({
		host_email: z
			.email()
			.optional()
			.describe("The meeting host's email address.")
			.meta({ examples: ["jchill@example.com"] }),
		host_id: z
			.string()
			.optional()
			.describe("ID of the user set as host of webinar.")
			.meta({ examples: ["30R7kT7bTIKSNUFEuH_Qlg"] }),
		id: z.coerce
			.bigint()
			.optional()
			.describe(
				"The webinar ID in **long** format, represented as int64 data type in JSON, also known as the webinar number.",
			)
			.meta({ examples: [97871060099] }),
		template_id: z
			.string()
			.optional()
			.describe(
				"The webinar template's unique identifier. Use this field only if you would like to [schedule the webinar using an existing template](https://support.zoom.us/hc/en-us/articles/115001079746-Webinar-Templates#schedule). The value of this field can be retrieved from [**List webinar templates**](/docs/api/rest/reference/zoom-api/methods#operation/listWebinarTemplates) API.\nYou must provide the user ID of the host instead of the email address in the `userId` path parameter in order to use a template for scheduling a webinar.",
			)
			.meta({ examples: ["ull6574eur"] }),
		uuid: z
			.string()
			.optional()
			.describe(
				"Unique webinar ID. Each webinar instance generates its own webinar UUID. After a webinar ends, a new UUID is generated for the next instance of the webinar. Retrieve a list of UUIDs from past webinar instances using the [**List past webinar instances**](/docs/api-reference/zoom-api/methods#operation/pastWebinars) API. [Double encode](/docs/api/using-zoom-apis/#meeting-id-and-uuid) your UUID when using it for API calls if the UUID begins with a `/` or contains `//` in it.\n\n",
			)
			.meta({ examples: ["m3WqMkvuRXyYqH+eKWhk9w=="] }),
		agenda: z
			.string()
			.optional()
			.describe("Webinar agenda.")
			.meta({ examples: ["My webinar"] }),
		created_at: z.iso
			.datetime()
			.optional()
			.describe("Create time.")
			.meta({ examples: ["2022-03-26T07:18:32Z"] }),
		duration: z
			.int()
			.optional()
			.describe("Webinar duration.")
			.meta({ examples: [60] }),
		registration_url: z
			.string()
			.optional()
			.describe(
				"The URL that registrants can use to register for a webinar. This field is only returned for webinars that have enabled registration.",
			)
			.meta({
				examples: ["https://example.com/webinar/register/7ksAkRCoEpt1Jm0wa-E6lICLur9e7Lde5oW6"],
			}),
		join_url: z
			.string()
			.optional()
			.describe(
				"URL to join the webinar. Only share this URL with the users who should be invited to the webinar.",
			)
			.meta({ examples: ["https://example.com/j/11111"] }),
		occurrences: z
			.array(
				z.object({
					duration: z
						.int()
						.optional()
						.describe("Duration.")
						.meta({ examples: [60] }),
					occurrence_id: z
						.string()
						.optional()
						.describe(
							"The occurrence ID, a unique identifier that identifies an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences.",
						)
						.meta({ examples: ["1648194360000"] }),
					start_time: z.iso
						.datetime()
						.optional()
						.describe("Start time.")
						.meta({ examples: ["2022-03-25T07:46:00Z"] }),
					status: z
						.enum(["available", "deleted"])
						.optional()
						.describe(
							"Occurrence status. \n `available` - Available occurrence.  \n `deleted` -  Deleted occurrence.",
						)
						.meta({ examples: ["available"] }),
				}),
			)
			.optional()
			.describe("Array of occurrence objects."),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"Webinar passcode. Passcode may only contain the characters [a-z A-Z 0-9 @ - _ * !]. Maximum of 10 characters.\n\nIf **Webinar Passcode** setting has been **enabled** **and** [locked](https://support.zoom.us/hc/en-us/articles/115005269866-Using-Tiered-Settings#locked) for the user, the passcode field will be autogenerated for the Webinar in the response even if it is not provided in the API request. \n\n **Note:** If the account owner or the admin has configured [minimum passcode requirement settings](https://support.zoom.us/hc/en-us/articles/360033559832-Meeting-and-webinar-passwords#h_a427384b-e383-4f80-864d-794bf0a37604), the passcode value provided here must meet those requirements. \n\n If the requirements are enabled, you can view those requirements by calling the [**Get account settings**](/docs/api/rest/reference/account/methods/#operation/accountSettings) API.",
			)
			.meta({ examples: ["123456"] }),
		encrypted_passcode: z
			.string()
			.optional()
			.describe("Encrypted passcode for third party endpoints (H323/SIP).")
			.meta({ examples: ["8pEkRweVXPV3Ob2KJYgFTRlDtl1gSn.1"] }),
		h323_passcode: z
			.string()
			.optional()
			.describe("H.323/SIP room system passcode.")
			.meta({ examples: ["123456"] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select a date when the webinar will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"How many times the webinar will recur before it is canceled. The maximum number of recurring is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state which day in a month, the webinar should recur. The value range is from 1 to 31.\n\nFor instance, if you would like the webinar to recur on 23rd of each month, provide `23` as the value of this field and `1` as the value of the `repeat_interval` field. Instead, if you would like the webinar to recur once every three months, on 23rd of the month, change the value of the `repeat_interval` field to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state the week of the month when the webinar should recur. If you use this field, **you must also use the `monthly_week_day` field to state the day of the week when the webinar should recur.**   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `3` to state a specific day in a week when the monthly webinar should recur. To use this field, you must also use the `monthly_week` field.   \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the webinar should recur. For instance, to schedule a webinar that recurs every two months, you must set the value of this field as `2` and the value of the `type` parameter as `3`. \n\nFor a daily webinar, the maximum interval you can set is `90` days. For a weekly webinar, the maximum interval that you can set is `12` weeks. For a monthly webinar, the maximum interval that you can set is `3` months.",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe(
						"Recurrence webinar types.  \n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.",
					)
					.meta({ examples: [1] }),
				weekly_days: z
					.string()
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring webinar of type** `2` to state which days of the week the webinar should repeat.   \n  The value for this field could be a number between `1` to `7` in string format. For instance, if the Webinar should recur on Sunday, provide `1` as the value of this field.    \n   \n  **Note:** If you would like the webinar to occur on multiple days of a week, you should provide comma separated values for this field. For instance, if the Webinar should recur on Sundays and Tuesdays provide `1,3` as the value of this field.\n\n  \n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.\n\n",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a webinar of type `9` - a recurring webinar with fixed time. ",
			),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add more webinar [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe("Allow attendees to join from multiple devices.")
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe("Alternative host emails or IDs. Multiple values separated by comma.")
					.meta({ examples: ["jchill@example.com"] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				attendees_and_panelists_reminder_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send reminder email to attendees and panelists.\n\n* `false` - Do not send reminder email to attendees and panelists.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 hour before webinar.  \n `2` - Send 1 day before webinar.  \n `3` - Send 1 hour and 1 day before webinar.  \n `4` - Send 1 week before webinar.  \n `5` - Send 1 hour and 1 week before webinar.  \n `6` - Send 1 day and 1 week before webinar.  \n `7` - Send 1 hour, 1 day and 1 week before webinar.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send reminder email to attendees and panelists."),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe("Determine how participants can join the audio portion of the webinar.")
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference info.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [**Sign Into Zoom with Specified Domains**](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_name: z
					.string()
					.optional()
					.describe(
						"Authentication name set in the [authentication profile](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f).",
					)
					.meta({ examples: ["Sign in to Zoom"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Webinar authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.union([z.literal("local"), z.literal("cloud"), z.literal("none")])
					.optional()
					.default("none")
					.describe(
						"Automatic recording. \n `local` - Record on local.  \n `cloud` -  Record on cloud.  \n `none` - Disabled.",
					)
					.meta({ examples: ["cloud"] }),
				close_registration: z
					.boolean()
					.optional()
					.describe("Close registration after event date.")
					.meta({ examples: [true] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration.")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration.")
					.meta({ examples: ["Jill Chill"] }),
				email_language: z
					.string()
					.optional()
					.describe(
						"Set the email language.\n`en-US`, `de-DE`, `es-ES`, `fr-FR`, `jp-JP`, `pt-PT`, `ru-RU`,`zh-CN`, `zh-TW`, `ko-KO`, `it-IT`, or `vi-VN`.",
					)
					.meta({ examples: ["en-US"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.**    \n\n As an alternative, use the `meeting_authentication`, `authentication_option` and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**    \n\n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: ["example.com"] }),
				follow_up_absentees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to absentees.\n\n* `false` - Do not send follow-up email to absentees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 days after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to absentees."),
				follow_up_attendees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to attendees.\n\n* `false` - Do not send follow-up email to attendees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 day after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to attendees."),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries."),
				global_dial_in_numbers: z
					.array(
						z.object({
							city: z
								.string()
								.optional()
								.describe("The number's city.")
								.meta({ examples: ["New York"] }),
							country: z
								.string()
								.optional()
								.describe("The country code.")
								.meta({ examples: ["US"] }),
							country_name: z
								.string()
								.optional()
								.describe("Full name of country.")
								.meta({ examples: ["US"] }),
							number: z
								.string()
								.optional()
								.describe("Dial-in phone number.")
								.meta({ examples: ["+1 1000200200"] }),
							type: z
								.enum(["toll", "tollfree", "premium"])
								.optional()
								.describe("Dial-in number type.")
								.meta({ examples: ["toll"] }),
						}),
					)
					.optional()
					.describe("A list of available dial-in numbers for different countries or regions."),
				hd_video: z
					.boolean()
					.optional()
					.default(false)
					.describe("Default to HD video.")
					.meta({ examples: [false] }),
				hd_video_for_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether HD video for attendees is enabled.")
					.meta({ examples: [false] }),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when the host joins the webinar.")
					.meta({ examples: [true] }),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the webinar.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** This feature is only available for certain Webinar add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar. This is not supported for simulive webinars.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the webinar.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's sign language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar.",
					),
				panelist_authentication: z
					.boolean()
					.optional()
					.describe("Require panelists to authenticate to join.")
					.meta({ examples: [true] }),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("Only authenticated users can join the webinar.")
					.meta({ examples: [true] }),
				add_watermark: z
					.boolean()
					.optional()
					.describe("Add watermark that identifies the viewing participant.")
					.meta({ examples: [true] }),
				add_audio_watermark: z
					.boolean()
					.optional()
					.describe("Add audio watermark that identifies the participants.")
					.meta({ examples: [true] }),
				on_demand: z
					.boolean()
					.optional()
					.default(false)
					.describe("Make the webinar on-demand.")
					.meta({ examples: [false] }),
				panelists_invitation_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send invitation email to panelists. If `false`, do not send invitation email to panelists.",
					)
					.meta({ examples: [true] }),
				panelists_video: z
					.boolean()
					.optional()
					.describe("Start video when panelists join webinar.")
					.meta({ examples: [true] }),
				post_webinar_survey: z
					.boolean()
					.optional()
					.describe(
						"Zoom will open a survey page in attendees' browsers after leaving the webinar.",
					)
					.meta({ examples: [true] }),
				practice_session: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable practice session.")
					.meta({ examples: [false] }),
				question_and_answer: z
					.object({
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists.\n\n* `false` - Do not allow anonymous questions.",
							)
							.meta({ examples: [true] }),
						answer_questions: z
							.enum(["only", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view answered questions only or view all questions.\n\n* `only` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can not answer questions or leave a comment in the question thread",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can not click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
						allow_auto_reply: z
							.boolean()
							.optional()
							.describe(
								"If simulive webinar, \n\n* `true` - allow auto-reply to attendees. \n\n* `false` - don't allow auto-reply to the attendees.",
							)
							.meta({ examples: [true] }),
						auto_reply_text: z
							.string()
							.optional()
							.describe(
								"If `allow_auto_reply` = true, the text to be included in the automatic response. ",
							)
							.meta({
								examples: ["Thank you for your question. We will get back to you shortly."],
							}),
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.\n\n* `false` - Disable Q&amp;A for webinar.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.",
					),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe("Send confirmation email to registrants")
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send email notifications to registrants about approval, cancellation, denial of the registration. The value of this field must be set to true in order to use the `registrants_confirmation_email` field.",
					)
					.meta({ examples: [true] }),
				registrants_restrict_number: z
					.int()
					.min(0)
					.max(20000)
					.optional()
					.default(0)
					.describe(
						"Restrict number of registrants for a webinar. By default, it is set to `0`. A `0` value means that the restriction option is disabled. Provide a number higher than 0 to restrict the webinar registrants by the that number.",
					)
					.meta({ examples: [100] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration types. Only used for recurring webinars with a fixed time.  \n `1` - Attendees register once and can attend any of the webinar sessions.  \n `2` - Attendees need to register for each session in order to attend.  \n `3` - Attendees register once and can choose one or more sessions to attend.",
					)
					.meta({ examples: [1] }),
				send_1080p_video_to_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Always send 1080p video to attendees.")
					.meta({ examples: [false] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe("Show social share buttons on the registration page.")
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the webinar's join information on the registration confirmation page. This setting is only applied to webinars with registration enabled.",
					)
					.meta({ examples: [true] }),
				survey_url: z
					.string()
					.optional()
					.describe("Survey URL for post webinar survey.")
					.meta({ examples: ["https://example.com"] }),
				enable_session_branding: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Webinar Session Branding** setting is enabled. This setting lets hosts visually customize a webinar by setting a session background. This also lets hosts use [webinar session branding](https://support.zoom.us/hc/en-us/articles/4836268732045-Using-Webinar-Session-Branding) to set the Virtual Background for and apply name tags to hosts, alternative hosts, panelists, interpreters, and speakers.",
					)
					.meta({ examples: [true] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. Not supported for simulive webinar. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. Not supported for simulive webinar. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe("Whether to include guest's email addresses in webinars' attendee reports.")
					.meta({ examples: [true] }),
			})
			.optional()
			.describe("Webinar settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe("Webinar start time in GMT/UTC.")
			.meta({ examples: ["2022-03-26T07:18:32Z"] }),
		start_url: z
			.string()
			.optional()
			.describe(
				"The `start_url` of a webinar is a URL using which a host or an alternative host can start the webinar. This URL should only be used by the host of the meeting and should not be shared with anyone other than the host of the webinar. \n\nThe expiration time for the `start_url` field listed in the response of the [**Create a webinar**](/docs/api-reference/zoom-api/methods#operation/webinarCreate) API is two hours for all regular users. \n\t\nFor users created using the `custCreate` option via the [**Create users**](/docs/api-reference/zoom-api/methods#operation/userCreate) API, the expiration time of the `start_url` field is 90 days.\n\t\nFor security reasons, to retrieve the latest value for the `start_url` field programmatically (after expiry), you must call the [**Get a webinar**](/docs/api-reference/zoom-api/methods#operation/webinar) API and refer to the value of the `start_url` field in the response.\n\n\n ",
			)
			.meta({ examples: ["https://example.com/s/11111"] }),
		timezone: z
			.string()
			.optional()
			.describe("Time zone to format `start_time`.")
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.max(200)
			.optional()
			.describe("Webinar topic.")
			.meta({ examples: ["My Webinar"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("Tracking fields type.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("Tracking fields value.")
						.meta({ examples: ["value1"] }),
					visible: z
						.boolean()
						.optional()
						.describe(
							"Whether the [tracking field](https://support.zoom.us/hc/en-us/articles/115000293426-Scheduling-Tracking-Fields) is visible in the webinar scheduling options in the Zoom Web Portal or not.\n\n* `true` - Tracking field is visible.\n* `false` - Tracking field is not visible to the users in the webinar options in the Zoom Web Portal but the field was used while scheduling this webinar via API. An invisible tracking field can be used by users while scheduling webinars via API only. ",
						)
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(5), z.literal(6), z.literal(9)])
			.optional()
			.default(5)
			.describe(
				"Webinar types. \n `5` - Webinar.  \n `6` - Recurring webinar with no fixed time.  \n `9` - Recurring webinar with a fixed time.",
			)
			.meta({ examples: [5] }),
		is_simulive: z
			.boolean()
			.optional()
			.describe("Whether the webinar is `simulive`.")
			.meta({ examples: [true] }),
		record_file_id: z
			.string()
			.optional()
			.describe("The previously recorded file's ID for `simulive`.")
			.meta({ examples: ["f09340e1-cdc3-4eae-9a74-98f9777ed908"] }),
		transition_to_live: z
			.boolean()
			.optional()
			.describe(
				"Whether to transition a simulive webinar to live. The host must be present at the time of transition.",
			)
			.meta({ examples: [false] }),
		simulive_delay_start: z
			.object({
				enable: z
					.boolean()
					.optional()
					.describe("Whether simulive needs to delay playback.")
					.meta({ examples: [true] }),
				time: z
					.int()
					.optional()
					.describe(
						"The time for delayed playback.\nIf the time unit is seconds, then the maximum value is 60 and the minimum value is 1.\nIf the time unit is minutes, then the maximum value is 10 and the minimum value is 1.",
					)
					.meta({ examples: [10] }),
				timeunit: z
					.enum(["second", "minute"])
					.optional()
					.default("second")
					.describe(
						"The time unit for delayed playback.\n`second` - The time unit for delayed playback is seconds.\n`minute` - The time unit for delayed playback is minutes.",
					)
					.meta({ examples: ["second"] }),
			})
			.optional()
			.describe('{"enable":false,"time":0,"timeunit":"second"}'),
		creation_source: z
			.enum(["other", "open_api", "web_portal"])
			.optional()
			.describe(
				"The platform used when creating the meeting.\n* `other` - Created through another platform.\n* `open_api` - Created through Open API.\n* `web_portal` - Created through the web portal.",
			)
			.meta({ examples: ["open_api"] }),
	})
	.describe("Webinar object.");

export const webinarStatus400Schema = z.unknown();

export const webinarStatus404Schema = z.unknown();

export const webinarStatus429Schema = z.unknown();

export const webinarResponseSchema = webinarStatus200Schema;

export const webinarErrorSchema = z.union([
	webinarStatus400Schema,
	webinarStatus404Schema,
	webinarStatus429Schema,
]);

export const webinarDeletePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarDeleteQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const webinarDeleteQueryCancelWebinarReminderSchema = z
	.boolean()
	.optional()
	.describe(
		"`true` - Notify panelists and registrants about the webinar cancellation via email. \n\n`false` - Do not send any email notification to webinar registrants and panelists. \n\nThe default value of this field is `false`.",
	)
	.meta({ examples: [true] });

export const webinarDeleteStatus204Schema = z.unknown();

export const webinarDeleteStatus400Schema = z.unknown();

export const webinarDeleteStatus404Schema = z.unknown();

export const webinarDeleteStatus429Schema = z.unknown();

export const webinarDeleteResponseSchema = webinarDeleteStatus204Schema;

export const webinarDeleteErrorSchema = z.union([
	webinarDeleteStatus400Schema,
	webinarDeleteStatus404Schema,
	webinarDeleteStatus429Schema,
]);

export const webinarUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarUpdateQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe(
		"Webinar occurrence ID. Support change of agenda, start time, duration, and settings `host_video`, `panelist_video`, `hd_video, watermark`, `auto_recording`.",
	)
	.meta({ examples: ["1648538280000"] });

export const webinarUpdateStatus204Schema = z.unknown();

export const webinarUpdateStatus400Schema = z.unknown();

export const webinarUpdateStatus404Schema = z.unknown();

export const webinarUpdateStatus429Schema = z.unknown();

export const webinarUpdateResponseSchema = webinarUpdateStatus204Schema;

export const webinarUpdateErrorSchema = z.union([
	webinarUpdateStatus400Schema,
	webinarUpdateStatus404Schema,
	webinarUpdateStatus429Schema,
]);

export const webinarUpdateBodySchema = z
	.object({
		agenda: z
			.string()
			.optional()
			.describe("Webinar description.")
			.meta({ examples: ["My Webinar"] }),
		duration: z
			.int()
			.optional()
			.describe("Webinar duration, in minutes. Used for scheduled webinar only.")
			.meta({ examples: [60] }),
		password: z
			.string()
			.max(10)
			.optional()
			.describe(
				"Webinar passcode. Passcode may only contain the characters [a-z A-Z 0-9 @ - _ * !]. Maximum of 10 characters.\n\nIf **Webinar Passcode** setting has been **enabled** **and** [locked](https://support.zoom.us/hc/en-us/articles/115005269866-Using-Tiered-Settings#locked) for the user, the passcode field will be autogenerated for the Webinar in the response even if it is not provided in the API request. \n\n **Note:** If the account owner or the admin has configured [minimum passcode requirement settings](https://support.zoom.us/hc/en-us/articles/360033559832-Meeting-and-webinar-passwords#h_a427384b-e383-4f80-864d-794bf0a37604), the passcode value provided here must meet those requirements. \n\n If the requirements are enabled, you can view those requirements by calling the [**Get account settings**](/docs/api/rest/reference/account/methods/#operation/accountSettings) API.",
			)
			.meta({ examples: ["123456"] }),
		schedule_for: z
			.string()
			.optional()
			.describe("The user's email address or `userId` to schedule a webinar for.")
			.meta({ examples: ["jchill@example.com"] }),
		recurrence: z
			.object({
				end_date_time: z.iso
					.datetime()
					.optional()
					.describe(
						"Select the final date when the meeting will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. Cannot be used with `end_times`.",
					)
					.meta({ examples: ["2022-04-02T15:59:00Z"] }),
				end_times: z
					.int()
					.max(60)
					.optional()
					.default(1)
					.describe(
						"Select how many times the webinar will recur before it is canceled. The maximum number of recurring is 60. Cannot be used with `end_date_time`.",
					)
					.meta({ examples: [7] }),
				monthly_day: z
					.int()
					.optional()
					.default(1)
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state which day in a month, the meeting should recur. The value range is from 1 to 31.\n\nIf you would like the meeting to recur on 23rd of each month, provide `23` as the value of this field and `1` as the value of the `repeat_interval` field. If you would like the meeting to recur every three months, on 23rd of the month, change the value of the `repeat_interval` field to `3`.",
					)
					.meta({ examples: [1] }),
				monthly_week: z
					.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state the week of the month when the meeting should recur. If you use this field, **you must also use the `monthly_week_day` field to state the day of the week when the meeting should recur.**   \n `-1` - Last week of the month.  \n `1` - First week of the month.  \n `2` - Second week of the month.  \n `3` - Third week of the month.  \n `4` - Fourth week of the month.",
					)
					.meta({ examples: [1] }),
				monthly_week_day: z
					.union([
						z.literal(1),
						z.literal(2),
						z.literal(3),
						z.literal(4),
						z.literal(5),
						z.literal(6),
						z.literal(7),
					])
					.optional()
					.describe(
						"Use this field **only if you're scheduling a recurring meeting of type** `3` to state a specific day in a week when the monthly meeting should recur. To use this field, you must also use the `monthly_week` field. \n\n  \n `1` - Sunday.  \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` - Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: [1] }),
				repeat_interval: z
					.int()
					.optional()
					.describe(
						"Define the interval when the meeting should recur. If you would like to schedule a meeting that recurs every two months, set the value of this field as `2` and the value of the `type` parameter as `3`. \n\nFor a daily meeting, the maximum interval you can set is `90` days. For a weekly meeting the maximum interval that you can set is  of `12` weeks. For a monthly meeting, there is a maximum of `3` months.\n\n",
					)
					.meta({ examples: [1] }),
				type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.describe(
						"Recurrence meeting types. \n `1` - Daily.  \n `2` - Weekly.  \n `3` - Monthly.",
					)
					.meta({ examples: [1] }),
				weekly_days: z
					.enum(["1", "2", "3", "4", "5", "6", "7"])
					.optional()
					.default("1")
					.describe(
						"This field is required **if you're scheduling a recurring meeting of type** `2` to state which day(s) of the week the meeting should repeat.   \n    \n  The value for this field could be a number between `1` to `7` in string format. For instance, if the meeting should recur on Sunday, provide `1` as the value of this field.  \n   \n  **Note:** If you would like the meeting to occur on multiple days of a week, you should provide comma separated values for this field. For instance, if the meeting should recur on Sundays and Tuesdays provide `1,3` as the value of this field.\n\n   \n `1`  - Sunday.   \n `2` - Monday.  \n `3` - Tuesday.  \n `4` -  Wednesday.  \n `5` -  Thursday.  \n `6` - Friday.  \n `7` - Saturday.",
					)
					.meta({ examples: ["1"] }),
			})
			.optional()
			.describe(
				"Recurrence object. Use this object only for a meeting with type `8`, a recurring meeting with fixed time. ",
			),
		settings: z
			.object({
				additional_data_center_regions: z
					.array(z.string())
					.optional()
					.describe(
						"Add more webinar [data center regions](https://support.zoom.us/hc/en-us/articles/360042411451-Selecting-data-center-regions-for-hosted-meetings-and-webinars). Provide this value as an array of [country codes](/docs/api/references/abbreviations/#countries) for the countries available as data center regions in the [**Account Profile**](https://zoom.us/account/setting) interface but have been opted out of in the [user settings](https://zoom.us/profile).\n\nFor example, the data center regions selected in your [**Account Profile**](https://zoom.us/account) are `Europe`, `Hong Kong SAR`, `Australia`, `India`, `Japan`, `China`, `United States`, and `Canada`. However, in the [**My Profile**](https://zoom.us/profile) settings, you did **not** select `India` and `Japan` for meeting and webinar traffic routing.\n\nTo include `India` and `Japan` as additional data centers, use the `[IN, TY]` value for this field.",
					),
				allow_multiple_devices: z
					.boolean()
					.optional()
					.describe("Allow attendees to join from multiple devices.")
					.meta({ examples: [true] }),
				alternative_hosts: z
					.string()
					.optional()
					.describe("Alternative host emails or IDs. Separate multiple values by commas.")
					.meta({ examples: ["jchill@example.com"] }),
				alternative_host_update_polls: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Allow alternative hosts to add or edit polls** feature is enabled. This requires Zoom version 5.8.0 or higher.",
					)
					.meta({ examples: [true] }),
				approval_type: z
					.union([z.literal(0), z.literal(1), z.literal(2)])
					.optional()
					.default(2)
					.describe(
						"`0` - Automatically approve.  \n `1` - Manually approve.  \n `2` - No registration required.",
					)
					.meta({ examples: [0] }),
				attendees_and_panelists_reminder_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send reminder email to attendees and panelists.\n\n* `false` - Do not send reminder email to attendees and panelists.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 hour before webinar.  \n `2` - Send 1 day before webinar.  \n `3` - Send 1 hour and 1 day before webinar.  \n `4` - Send 1 week before webinar.  \n `5` - Send 1 hour and 1 week before webinar.  \n `6` - Send 1 day and 1 week before webinar.  \n `7` - Send 1 hour, 1 day and 1 week before webinar.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send reminder email to attendees and panelists."),
				audio: z
					.union([
						z.literal("both"),
						z.literal("telephony"),
						z.literal("voip"),
						z.literal("thirdParty"),
					])
					.optional()
					.default("both")
					.describe("Determine how participants can join the audio portion of the webinar.")
					.meta({ examples: ["telephony"] }),
				audio_conference_info: z
					.string()
					.max(2048)
					.optional()
					.describe("Third party audio conference info.")
					.meta({ examples: ["test"] }),
				authentication_domains: z
					.string()
					.optional()
					.describe(
						"If user has configured [**Sign Into Zoom with Specified Domains**](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars#h_5c0df2e1-cfd2-469f-bb4a-c77d7c0cca6f) option, this will list the domains that are authenticated.",
					)
					.meta({ examples: ["example.com"] }),
				authentication_option: z
					.string()
					.optional()
					.describe("Webinar authentication option ID.")
					.meta({ examples: ["signIn_D8cJuqWVQ623CI4Q8yQK0Q"] }),
				auto_recording: z
					.union([z.literal("local"), z.literal("cloud"), z.literal("none")])
					.optional()
					.default("none")
					.describe(
						"Automatic recording. \n `local` - Record on local.  \n `cloud` -  Record on cloud.  \n `none` - Disabled.",
					)
					.meta({ examples: ["cloud"] }),
				close_registration: z
					.boolean()
					.optional()
					.describe("Close registration after event date.")
					.meta({ examples: [true] }),
				contact_email: z
					.string()
					.optional()
					.describe("Contact email for registration")
					.meta({ examples: ["jchill@example.com"] }),
				contact_name: z
					.string()
					.optional()
					.describe("Contact name for registration")
					.meta({ examples: ["Jill Chill"] }),
				email_language: z
					.string()
					.optional()
					.describe(
						"Set the email language to one of the following.\n`en-US`,`de-DE`,`es-ES`,`fr-FR`,`jp-JP`,`pt-PT`,`ru-RU`,`zh-CN`, `zh-TW`, `ko-KO`, `it-IT`, `vi-VN`.",
					)
					.meta({ examples: ["en-US"] }),
				enforce_login: z
					.boolean()
					.optional()
					.describe(
						"Only signed in users can join this meeting.\n\n**This field is deprecated and will not be supported in the future.** \n\n As an alternative, use the ``meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: [true] }),
				enforce_login_domains: z
					.string()
					.optional()
					.describe(
						"Only signed in users with specified domains can join meetings.\n\n**This field is deprecated and will not be supported in the future.**\n\n As an alternative, use the `meeting_authentication`, `authentication_option`, and `authentication_domains` fields to understand the [authentication configurations](https://support.zoom.us/hc/en-us/articles/360037117472-Authentication-Profiles-for-Meetings-and-Webinars) set for the webinar.",
					)
					.meta({ examples: ["example.com"] }),
				follow_up_absentees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to absentees.\n\n* `false` - Do not send follow-up email to absentees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 days after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to absentees."),
				follow_up_attendees_email_notification: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Send follow-up email to attendees.\n\n* `false` - Do not send follow-up email to attendees.",
							)
							.meta({ examples: [true] }),
						type: z
							.union([
								z.literal(0),
								z.literal(1),
								z.literal(2),
								z.literal(3),
								z.literal(4),
								z.literal(5),
								z.literal(6),
								z.literal(7),
							])
							.optional()
							.describe(
								"`0` - No plan.  \n `1` - Send 1 day after the scheduled end date.  \n `2` - Send 2 days after the scheduled end date.  \n `3` - Send 3 days after the scheduled end date.  \n `4` - Send 4 days after the scheduled end date.  \n `5` - Send 5 days after the scheduled end date.  \n `6` - Send 6 days after the scheduled end date.  \n `7` - Send 7 days after the scheduled end date.",
							)
							.meta({ examples: [0] }),
					})
					.optional()
					.describe("Send follow-up email to attendees."),
				global_dial_in_countries: z
					.array(z.string())
					.optional()
					.describe("List of global dial-in countries"),
				hd_video: z
					.boolean()
					.optional()
					.default(false)
					.describe("Default to HD video.")
					.meta({ examples: [false] }),
				hd_video_for_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether HD video for attendees is enabled.")
					.meta({ examples: [false] }),
				host_video: z
					.boolean()
					.optional()
					.describe("Start video when host joins the webinar.")
					.meta({ examples: [true] }),
				language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [language interpretation](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768) for the webinar.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two country IDs.\n\nOnly system-supported languages are allowed: `US` (English), `CN` (Chinese), `JP` (Japanese), `DE` (German), `FR` (French), `RU` (Russian), `PT` (Portuguese), `ES` (Spanish), and `KR` (Korean).\n\nFor example, to set an interpreter translating from English to Chinese, use `US,CN`.",
										)
										.meta({ examples: ["US,FR"] }),
									interpreter_languages: z
										.string()
										.optional()
										.describe(
											"A comma-separated list of the interpreter's languages. The string must contain exactly two languages.\n\nTo get this value, use the `language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/docs/api/users/#tag/users/GET/users/{userId}/settings) API response.\n\n**languages**: System-supported languages include `English`, `Chinese`, `Japanese`, `German`, `French`, `Russian`, `Portuguese`, `Spanish`, and `Korean`.\n\n**custom_languages**: User-defined languages added by the user.\n\nFor example, an interpreter translating between English and French should use `English,French`.",
										)
										.meta({ examples: ["English,French"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [language interpretation settings](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064768). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** This feature is only available for certain Webinar add-on, Education, and Business and higher plans. If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar. This is not supported for simulive webinars.",
					),
				sign_language_interpretation: z
					.object({
						enable: z
							.boolean()
							.optional()
							.describe(
								"Whether to enable [sign language interpretation](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar) for the webinar.",
							)
							.meta({ examples: [true] }),
						interpreters: z
							.array(
								z.object({
									email: z
										.email()
										.optional()
										.describe("The interpreter's email address.")
										.meta({ examples: ["interpreter@example.com"] }),
									sign_language: z
										.string()
										.optional()
										.describe(
											"The interpreter's sign language. \n\n To get this value, use the `sign_language_interpretation` object's `languages` and `custom_languages` values in the [**Get user settings**](/api-reference/zoom-api/methods#operation/userSettings) API response.",
										)
										.meta({ examples: ["American"] }),
								}),
							)
							.optional()
							.describe("Information about the webinar's sign language interpreters."),
					})
					.optional()
					.describe(
						"The webinar's [sign language interpretation settings](https://support.zoom.us/hc/en-us/articles/9644962487309-Using-sign-language-interpretation-in-a-meeting-or-webinar). Make sure to add the language in the web portal in order to use it in the API. See link for details. \n\n**Note:** If this feature is not enabled on the host's account, this setting will **not** be applied to the webinar.",
					),
				panelist_authentication: z
					.boolean()
					.optional()
					.describe("Require panelists to authenticate to join.")
					.meta({ examples: [true] }),
				meeting_authentication: z
					.boolean()
					.optional()
					.describe("Only authenticated users can join the webinar.")
					.meta({ examples: [true] }),
				add_watermark: z
					.boolean()
					.optional()
					.describe("Add watermark that identifies the viewing participant.")
					.meta({ examples: [true] }),
				add_audio_watermark: z
					.boolean()
					.optional()
					.describe("Add audio watermark that identifies the participants.")
					.meta({ examples: [true] }),
				notify_registrants: z
					.boolean()
					.optional()
					.describe("Send notification email to registrants when the host updates a webinar.")
					.meta({ examples: [true] }),
				on_demand: z
					.boolean()
					.optional()
					.default(false)
					.describe("Make the webinar on-demand.")
					.meta({ examples: [false] }),
				panelists_invitation_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send invitation email to panelists. If `false`, do not send invitation email to panelists.",
					)
					.meta({ examples: [true] }),
				panelists_video: z
					.boolean()
					.optional()
					.describe("Start video when panelists join the webinar.")
					.meta({ examples: [true] }),
				post_webinar_survey: z
					.boolean()
					.optional()
					.describe(
						"Zoom will open a survey page in attendees' browsers after leaving the webinar.",
					)
					.meta({ examples: [true] }),
				practice_session: z
					.boolean()
					.optional()
					.default(false)
					.describe("Enable practice session.")
					.meta({ examples: [false] }),
				question_and_answer: z
					.object({
						allow_submit_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to submit questions.\n\n* `false` - Do not allow submit questions.",
							)
							.meta({ examples: [true] }),
						allow_anonymous_questions: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Allow participants to send questions without providing their name to the host, co-host, and panelists..\n\n* `false` - Do not allow anonymous questions.",
							)
							.meta({ examples: [true] }),
						answer_questions: z
							.enum(["only", "all"])
							.optional()
							.describe(
								"Indicate whether you want attendees to be able to view answered questions only or view all questions.\n\n* `only` - Attendees are able to view answered questions only.\n\n*  `all` - Attendees are able to view all questions submitted in the Q&amp;A.",
							)
							.meta({ examples: ["all"] }),
						attendees_can_comment: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can answer questions or leave a comment in the question thread.\n\n* `false` - Attendees can't answer questions or leave a comment in the question thread.",
							)
							.meta({ examples: [true] }),
						attendees_can_upvote: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Attendees can click the thumbs up button to bring popular questions to the top of the Q&amp;A window.\n\n* `false` - Attendees can't click the thumbs up button on questions.",
							)
							.meta({ examples: [true] }),
						allow_auto_reply: z
							.boolean()
							.optional()
							.describe(
								"If simulive webinar, \n\n* `true` - allow auto-reply to attendees. \n\n* `false` - don't allow auto-reply to the attendees.",
							)
							.meta({ examples: [true] }),
						auto_reply_text: z
							.string()
							.optional()
							.describe(
								"If `allow_auto_reply` = true, the text to be included in the automatic response. ",
							)
							.meta({
								examples: ["Thank you for your question. We will get back to you shortly."],
							}),
						enable: z
							.boolean()
							.optional()
							.describe(
								"* `true` - Enable [Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.\n\n* `false` - Disable Q&amp;A for webinar.",
							)
							.meta({ examples: [true] }),
					})
					.optional()
					.describe(
						"[Q&amp;A](https://support.zoom.us/hc/en-us/articles/203686015-Using-Q-A-as-the-webinar-host#:~:text=Overview,and%20upvote%20each%20other's%20questions.) for webinar.",
					),
				registrants_confirmation_email: z
					.boolean()
					.optional()
					.describe("Send confirmation email to registrants")
					.meta({ examples: [true] }),
				registrants_email_notification: z
					.boolean()
					.optional()
					.describe(
						"Send email notifications to registrants about approval, cancellation, denial of the registration. The value of this field must be set to true in order to use the `registrants_confirmation_email` field.",
					)
					.meta({ examples: [true] }),
				registrants_restrict_number: z
					.int()
					.min(0)
					.max(20000)
					.optional()
					.default(0)
					.describe(
						"Restrict number of registrants for a webinar. By default, it is set to `0`. A `0` value means that the restriction option is disabled. Provide a number higher than 0 to restrict the webinar registrants by the that number.",
					)
					.meta({ examples: [100] }),
				registration_type: z
					.union([z.literal(1), z.literal(2), z.literal(3)])
					.optional()
					.default(1)
					.describe(
						"Registration types. Only used for recurring webinars with a fixed time.  \n `1` - Attendees register once and can attend any of the webinar sessions.  \n `2` - Attendees need to register for each session in order to attend.  \n `3` - Attendees register once and can choose one or more sessions to attend.",
					)
					.meta({ examples: [1] }),
				send_1080p_video_to_attendees: z
					.boolean()
					.optional()
					.default(false)
					.describe("Always send 1080p video to attendees.")
					.meta({ examples: [false] }),
				show_share_button: z
					.boolean()
					.optional()
					.describe("Show social share buttons on the registration page.")
					.meta({ examples: [true] }),
				show_join_info: z
					.boolean()
					.optional()
					.describe(
						"Whether to show the webinar's join information on the registration confirmation page. This setting is only applied to webinars with registration enabled.",
					)
					.meta({ examples: [true] }),
				survey_url: z
					.string()
					.optional()
					.describe("Survey url for post webinar survey")
					.meta({ examples: ["https://example.com"] }),
				enable_session_branding: z
					.boolean()
					.optional()
					.describe(
						"Whether the **Webinar Session Branding** setting is enabled. This setting lets hosts visually customize a webinar by setting a session background. This also lets hosts use [Webinar Session Branding](https://support.zoom.us/hc/en-us/articles/4836268732045-Using-Webinar-Session-Branding) to set the virtual background for and apply name tags to hosts, alternative hosts, panelists, interpreters, and speakers.",
					)
					.meta({ examples: [true] }),
				request_permission_to_unmute_participants: z
					.boolean()
					.optional()
					.describe(
						"Whether to enable the [**Request permission to unmute participants**](https://support.zoom.us/hc/en-us/articles/203435537-Muting-and-unmuting-participants-in-a-meeting) setting. Not supported for simulive webinar. This option cannot be used together with `allow_host_control_participant_mute_state`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [true] }),
				allow_host_control_participant_mute_state: z
					.boolean()
					.optional()
					.describe(
						"Whether to allow the host and co-hosts to fully control the mute state of participants. Not supported for simulive webinar. This option cannot be used together with `request_permission_to_unmute_participants`, only one of the two can be enabled at a time.",
					)
					.meta({ examples: [false] }),
				email_in_attendee_report: z
					.boolean()
					.optional()
					.describe("Whether to include guest's email addresses in webinars' attendee reports.")
					.meta({ examples: [true] }),
			})
			.optional()
			.describe("Webinar settings."),
		start_time: z.iso
			.datetime()
			.optional()
			.describe(
				"Webinar start time, in the format `yyyy-MM-dd'T'HH:mm:ss'Z'`. Should be in GMT time. In the format `yyyy-MM-dd'T'HH:mm:ss`. This should be in local time and the timezone should be specified. Only used for scheduled webinars and recurring webinars with a fixed time.",
			)
			.meta({ examples: ["2022-03-26T07:18:32Z"] }),
		timezone: z
			.string()
			.optional()
			.describe(
				"The timezone to assign to the `start_time` value. This field is only used for scheduled or recurring webinars with a fixed time.\n\nFor a list of supported timezones and their formats, see our [timezone list](/docs/api/references/abbreviations/#timezones).",
			)
			.meta({ examples: ["America/Los_Angeles"] }),
		topic: z
			.string()
			.optional()
			.describe("The webinar topic.")
			.meta({ examples: ["My webinar"] }),
		tracking_fields: z
			.array(
				z.object({
					field: z
						.string()
						.optional()
						.describe("Tracking fields type.")
						.meta({ examples: ["field1"] }),
					value: z
						.string()
						.optional()
						.describe("Tracking fields value.")
						.meta({ examples: ["value1"] }),
				}),
			)
			.optional()
			.describe("Tracking fields."),
		type: z
			.union([z.literal(5), z.literal(6), z.literal(9)])
			.optional()
			.default(5)
			.describe(
				"Webinar types. \n `5` - webinar.  \n `6` - Recurring webinar with no fixed time.  \n `9` - Recurring webinar with a fixed time.",
			)
			.meta({ examples: [5] }),
		is_simulive: z
			.boolean()
			.optional()
			.describe("Whether to set the webinar to simulive.")
			.meta({ examples: [true] }),
		record_file_id: z
			.string()
			.optional()
			.describe("The previously recorded file's ID for `simulive`.")
			.meta({ examples: ["f09340e1-cdc3-4eae-9a74-98f9777ed908"] }),
		transition_to_live: z
			.boolean()
			.optional()
			.describe(
				"Whether to transition a simulive webinar to live. The host must be present at the time of transition.",
			)
			.meta({ examples: [false] }),
		simulive_delay_start: z
			.object({
				enable: z
					.boolean()
					.optional()
					.describe("Whether simulive need delay playback.")
					.meta({ examples: [true] }),
				time: z
					.int()
					.optional()
					.describe(
						"The time for delayed playback.\nIf the time unit is seconds, then the maximum value is 60 and the minimum value is 1.\nIf the time unit is minutes, then the maximum value is 10 and the minimum value is 1.",
					)
					.meta({ examples: [10] }),
				timeunit: z
					.enum(["second", "minute"])
					.optional()
					.default("second")
					.describe(
						"The time unit for delayed playback.\n`second` - The time unit for delayed playback is seconds.\n`minute` - The time unit for delayed playback is minutes.",
					)
					.meta({ examples: ["second"] }),
			})
			.optional()
			.describe('{"enable":false,"time":0,"timeunit":"second"}'),
	})
	.optional()
	.describe("Webinar.");

export const addBatchWebinarRegistrantsPathWebinarIdSchema = z
	.string()
	.describe("The webinar's unique identifier.")
	.meta({ examples: ["97871060099"] });

export const addBatchWebinarRegistrantsStatus201Schema = z.object({
	registrants: z
		.array(
			z.object({
				email: z
					.string()
					.optional()
					.describe("The registrant's email address.")
					.meta({ examples: ["jchill@example.com"] }),
				join_url: z
					.string()
					.optional()
					.describe("Unique URL using which registrant can join the webinar.")
					.meta({ examples: ["https://example.com/j/11111"] }),
				registrant_id: z
					.string()
					.optional()
					.describe("The registrant's unique identifier.")
					.meta({ examples: ["-rOym-zdTHOdbT3A7u7u5g"] }),
			}),
		)
		.optional(),
});

export const addBatchWebinarRegistrantsStatus400Schema = z.unknown();

export const addBatchWebinarRegistrantsStatus404Schema = z.unknown();

export const addBatchWebinarRegistrantsStatus429Schema = z.unknown();

export const addBatchWebinarRegistrantsResponseSchema = addBatchWebinarRegistrantsStatus201Schema;

export const addBatchWebinarRegistrantsErrorSchema = z.union([
	addBatchWebinarRegistrantsStatus400Schema,
	addBatchWebinarRegistrantsStatus404Schema,
	addBatchWebinarRegistrantsStatus429Schema,
]);

export const addBatchWebinarRegistrantsBodySchema = z
	.object({
		auto_approve: z
			.boolean()
			.optional()
			.describe(
				"If a meeting was scheduled with approval_type `1` (manual approval), but you want to automatically approve registrants added via this API, set the value of this field to `true`. \n\nYou **cannot** use this field to change approval setting for a meeting that was originally scheduled with approval_type `0` (automatic approval).",
			)
			.meta({ examples: [true] }),
		registrants: z
			.array(
				z.object({
					email: z
						.email()
						.describe("The registrant's email address.")
						.meta({ examples: ["jchill@example.com"] }),
					first_name: z
						.string()
						.describe("The registrant's first name.")
						.meta({ examples: ["Jill"] }),
					last_name: z
						.string()
						.optional()
						.describe("The registrant's last name.")
						.meta({ examples: ["Chill"] }),
				}),
			)
			.optional(),
	})
	.optional();

export const getWebinarBrandingPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const getWebinarBrandingStatus200Schema = z
	.object({
		wallpaper: z
			.object({
				id: z
					.string()
					.optional()
					.describe("The wallpaper's file ID.")
					.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ"] }),
			})
			.optional()
			.describe("Information about the webinar's [wallpaper] file."),
		virtual_backgrounds: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The virtual background's file ID.")
						.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ"] }),
					name: z
						.string()
						.optional()
						.describe("The virtual background's file name.")
						.meta({ examples: ["beach.jpg"] }),
					is_default: z
						.boolean()
						.optional()
						.describe("Whether the file is the default virtual background file.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe(
				"Information about the webinar's [virtual background](https://support.zoom.us/hc/en-us/articles/210707503-Virtual-Background) files.",
			),
		name_tags: z
			.array(
				z.object({
					id: z
						.string()
						.optional()
						.describe("The name tag's ID.")
						.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ"] }),
					name: z
						.string()
						.optional()
						.describe("The name tag's name.")
						.meta({ examples: ["name"] }),
					text_color: z
						.string()
						.optional()
						.describe("The name tag's text color.")
						.meta({ examples: ["0e72ed"] }),
					accent_color: z
						.string()
						.optional()
						.describe("The name tag's accent color.")
						.meta({ examples: ["0e72ed"] }),
					background_color: z
						.string()
						.optional()
						.describe("The name tag's background color.")
						.meta({ examples: ["0e72ed"] }),
					is_default: z
						.boolean()
						.optional()
						.describe("Whether the file is the default name tag or not.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Information about the webinar's name tag."),
	})
	.describe("Information about the webinar's sessions branding.");

export const getWebinarBrandingStatus400Schema = z.unknown();

export const getWebinarBrandingStatus404Schema = z.unknown();

export const getWebinarBrandingStatus429Schema = z.unknown();

export const getWebinarBrandingResponseSchema = getWebinarBrandingStatus200Schema;

export const getWebinarBrandingErrorSchema = z.union([
	getWebinarBrandingStatus400Schema,
	getWebinarBrandingStatus404Schema,
	getWebinarBrandingStatus429Schema,
]);

export const createWebinarBrandingNameTagPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const createWebinarBrandingNameTagStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("The name tag's ID.")
		.meta({ examples: ["J0sFXN2PSOCGrqTqLRwgAQ"] }),
	name: z
		.string()
		.optional()
		.describe("The name tag's name.")
		.meta({ examples: ["name"] }),
	text_color: z
		.string()
		.optional()
		.describe("The name tag's text color.")
		.meta({ examples: ["0e72ed"] }),
	accent_color: z
		.string()
		.optional()
		.describe("The name tag's accent color.")
		.meta({ examples: ["0e72ed"] }),
	background_color: z
		.string()
		.optional()
		.describe("The name tag's background_color color.")
		.meta({ examples: ["0e72ed"] }),
	is_default: z
		.boolean()
		.optional()
		.describe("Whether the name tag is the default name tag or not.")
		.meta({ examples: [true] }),
});

export const createWebinarBrandingNameTagStatus400Schema = z.unknown();

export const createWebinarBrandingNameTagStatus404Schema = z.unknown();

export const createWebinarBrandingNameTagStatus429Schema = z.unknown();

export const createWebinarBrandingNameTagResponseSchema =
	createWebinarBrandingNameTagStatus201Schema;

export const createWebinarBrandingNameTagErrorSchema = z.union([
	createWebinarBrandingNameTagStatus400Schema,
	createWebinarBrandingNameTagStatus404Schema,
	createWebinarBrandingNameTagStatus429Schema,
]);

export const createWebinarBrandingNameTagBodySchema = z
	.object({
		name: z
			.string()
			.describe(
				"The name tag's name.\n\n**Note:** This value cannot exceed more than 50 characters.",
			)
			.meta({ examples: ["name"] }),
		text_color: z
			.string()
			.describe("The name tag's text color.")
			.meta({ examples: ["0e72ed"] }),
		accent_color: z
			.string()
			.describe("The name tag's accent color.")
			.meta({ examples: ["0e72ed"] }),
		background_color: z
			.string()
			.describe("The name tag's background color.")
			.meta({ examples: ["0e72ed"] }),
		is_default: z
			.boolean()
			.optional()
			.default(false)
			.describe("Whether set the name tag as the default name tag or not.")
			.meta({ examples: [true] }),
		set_default_for_all_panelists: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether to set the name tag as the new default for all panelists or not. This includes panelists not currently assigned a default name tag.",
			)
			.meta({ examples: [true] }),
	})
	.optional()
	.describe("Name tag information");

export const deleteWebinarBrandingNameTagPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const deleteWebinarBrandingNameTagQueryNameTagIdsSchema = z
	.string()
	.optional()
	.describe("A comma-separated list of the name tag IDs to delete.")
	.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ,AsfE0cx2TFSfqqKbE0BUZg"] });

export const deleteWebinarBrandingNameTagStatus204Schema = z.unknown();

export const deleteWebinarBrandingNameTagStatus400Schema = z.unknown();

export const deleteWebinarBrandingNameTagStatus404Schema = z.unknown();

export const deleteWebinarBrandingNameTagStatus429Schema = z.unknown();

export const deleteWebinarBrandingNameTagResponseSchema =
	deleteWebinarBrandingNameTagStatus204Schema;

export const deleteWebinarBrandingNameTagErrorSchema = z.union([
	deleteWebinarBrandingNameTagStatus400Schema,
	deleteWebinarBrandingNameTagStatus404Schema,
	deleteWebinarBrandingNameTagStatus429Schema,
]);

export const updateWebinarBrandingNameTagPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const updateWebinarBrandingNameTagPathNameTagIdSchema = z
	.string()
	.describe("The name tag's ID.")
	.meta({ examples: ["J0sFXN2PSOCGrqTqLRwgAQ"] });

export const updateWebinarBrandingNameTagStatus204Schema = z.unknown();

export const updateWebinarBrandingNameTagStatus400Schema = z.unknown();

export const updateWebinarBrandingNameTagStatus404Schema = z.unknown();

export const updateWebinarBrandingNameTagStatus429Schema = z.unknown();

export const updateWebinarBrandingNameTagResponseSchema =
	updateWebinarBrandingNameTagStatus204Schema;

export const updateWebinarBrandingNameTagErrorSchema = z.union([
	updateWebinarBrandingNameTagStatus400Schema,
	updateWebinarBrandingNameTagStatus404Schema,
	updateWebinarBrandingNameTagStatus429Schema,
]);

export const updateWebinarBrandingNameTagBodySchema = z
	.object({
		name: z
			.string()
			.optional()
			.describe(
				"The name tag's name.\n\n**Note:** This value cannot exceed more than 50 characters.",
			)
			.meta({ examples: ["name"] }),
		text_color: z
			.string()
			.optional()
			.describe("The name tag's text color.")
			.meta({ examples: ["0e72ed"] }),
		accent_color: z
			.string()
			.optional()
			.describe("The name tag's accent color.")
			.meta({ examples: ["0e72ed"] }),
		background_color: z
			.string()
			.optional()
			.describe("The name tag's background color.")
			.meta({ examples: ["0e72ed"] }),
		is_default: z
			.boolean()
			.optional()
			.default(false)
			.describe("Whether set the name tag as the default name tag or not.")
			.meta({ examples: [true] }),
		set_default_for_all_panelists: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether to set the name tag as the new default for all panelists or not, including panelists not currently assigned a default name tag.",
			)
			.meta({ examples: [true] }),
	})
	.optional()
	.describe("Name tag information.");

export const uploadWebinarBrandingVBPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const uploadWebinarBrandingVBStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("The virtual background file's ID.")
		.meta({ examples: ["J0sFXN2PSOCGrqTqLRwgAQ"] }),
	name: z
		.string()
		.optional()
		.describe("The virtual background file's name.")
		.meta({ examples: ["beach.jpg"] }),
	is_default: z
		.boolean()
		.optional()
		.describe("Whether the file is the default virtual background file.")
		.meta({ examples: [true] }),
	size: z
		.int()
		.optional()
		.describe("The virtual background file's size, in bytes.")
		.meta({ examples: [524288] }),
	type: z
		.enum(["image"])
		.optional()
		.describe("The virtual background file's file type. \n* `image` - An image file.")
		.meta({ examples: ["image"] }),
});

export const uploadWebinarBrandingVBStatus400Schema = z.unknown();

export const uploadWebinarBrandingVBStatus404Schema = z.unknown();

export const uploadWebinarBrandingVBStatus429Schema = z.unknown();

export const uploadWebinarBrandingVBResponseSchema = uploadWebinarBrandingVBStatus201Schema;

export const uploadWebinarBrandingVBErrorSchema = z.union([
	uploadWebinarBrandingVBStatus400Schema,
	uploadWebinarBrandingVBStatus404Schema,
	uploadWebinarBrandingVBStatus429Schema,
]);

export const deleteWebinarBrandingVBPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const deleteWebinarBrandingVBQueryIdsSchema = z
	.string()
	.optional()
	.describe("A comma-separated list of the virtual background file IDs to delete.")
	.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ,AsfE0cx2TFSfqqKbE0BUZg"] });

export const deleteWebinarBrandingVBStatus204Schema = z.unknown();

export const deleteWebinarBrandingVBStatus400Schema = z.unknown();

export const deleteWebinarBrandingVBStatus404Schema = z.unknown();

export const deleteWebinarBrandingVBStatus429Schema = z.unknown();

export const deleteWebinarBrandingVBResponseSchema = deleteWebinarBrandingVBStatus204Schema;

export const deleteWebinarBrandingVBErrorSchema = z.union([
	deleteWebinarBrandingVBStatus400Schema,
	deleteWebinarBrandingVBStatus404Schema,
	deleteWebinarBrandingVBStatus429Schema,
]);

export const setWebinarBrandingVBPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const setWebinarBrandingVBQueryIdSchema = z
	.string()
	.optional()
	.describe("The virtual background file ID to update.")
	.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ"] });

export const setWebinarBrandingVBQuerySetDefaultForAllPanelistsSchema = z
	.boolean()
	.optional()
	.describe(
		"Whether to set the virtual background file as the new default for all panelists. This includes panelists not currently assigned a default virtual background.",
	)
	.meta({ examples: [true] });

export const setWebinarBrandingVBStatus204Schema = z.unknown();

export const setWebinarBrandingVBStatus400Schema = z.unknown();

export const setWebinarBrandingVBStatus404Schema = z.unknown();

export const setWebinarBrandingVBStatus429Schema = z.unknown();

export const setWebinarBrandingVBResponseSchema = setWebinarBrandingVBStatus204Schema;

export const setWebinarBrandingVBErrorSchema = z.union([
	setWebinarBrandingVBStatus400Schema,
	setWebinarBrandingVBStatus404Schema,
	setWebinarBrandingVBStatus429Schema,
]);

export const uploadWebinarBrandingWallpaperPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const uploadWebinarBrandingWallpaperStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("The wallpaper file's ID.")
		.meta({ examples: ["zazQjwDuQkS3Q2EprNd7jQ"] }),
	name: z
		.string()
		.optional()
		.describe("The wallpaper file's name.")
		.meta({ examples: ["logo.jpg"] }),
	size: z
		.int()
		.optional()
		.describe("The wallpaper file's size, in bytes.")
		.meta({ examples: [262144] }),
	type: z
		.enum(["image"])
		.optional()
		.describe("The wallpaper file's file type. \n* `image` - An image file.")
		.meta({ examples: ["image"] }),
});

export const uploadWebinarBrandingWallpaperStatus400Schema = z.unknown();

export const uploadWebinarBrandingWallpaperStatus404Schema = z.unknown();

export const uploadWebinarBrandingWallpaperStatus429Schema = z.unknown();

export const uploadWebinarBrandingWallpaperResponseSchema =
	uploadWebinarBrandingWallpaperStatus201Schema;

export const uploadWebinarBrandingWallpaperErrorSchema = z.union([
	uploadWebinarBrandingWallpaperStatus400Schema,
	uploadWebinarBrandingWallpaperStatus404Schema,
	uploadWebinarBrandingWallpaperStatus429Schema,
]);

export const deleteWebinarBrandingWallpaperPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const deleteWebinarBrandingWallpaperStatus204Schema = z.unknown();

export const deleteWebinarBrandingWallpaperStatus400Schema = z.unknown();

export const deleteWebinarBrandingWallpaperStatus404Schema = z.unknown();

export const deleteWebinarBrandingWallpaperStatus429Schema = z.unknown();

export const deleteWebinarBrandingWallpaperResponseSchema =
	deleteWebinarBrandingWallpaperStatus204Schema;

export const deleteWebinarBrandingWallpaperErrorSchema = z.union([
	deleteWebinarBrandingWallpaperStatus400Schema,
	deleteWebinarBrandingWallpaperStatus404Schema,
	deleteWebinarBrandingWallpaperStatus429Schema,
]);

export const webinarInviteLinksCreatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarInviteLinksCreateStatus201Schema = z
	.object({
		attendees: z
			.array(
				z.object({
					join_url: z
						.string()
						.optional()
						.describe("The URL to join the meeting.")
						.meta({ examples: ["https://example.com/j/11111"] }),
					name: z
						.string()
						.optional()
						.describe("The user's display name.")
						.meta({ examples: ["Jill Chill"] }),
				}),
			)
			.min(1)
			.max(500)
			.optional()
			.describe("The attendee list."),
	})
	.describe("Invite links response.");

export const webinarInviteLinksCreateStatus400Schema = z.unknown();

export const webinarInviteLinksCreateStatus404Schema = z.unknown();

export const webinarInviteLinksCreateStatus429Schema = z.unknown();

export const webinarInviteLinksCreateResponseSchema = webinarInviteLinksCreateStatus201Schema;

export const webinarInviteLinksCreateErrorSchema = z.union([
	webinarInviteLinksCreateStatus400Schema,
	webinarInviteLinksCreateStatus404Schema,
	webinarInviteLinksCreateStatus429Schema,
]);

export const webinarInviteLinksCreateBodySchema = z
	.object({
		attendees: z
			.array(
				z.object({
					name: z
						.string()
						.max(64)
						.describe("User display name.")
						.meta({ examples: ["Jill Chill"] }),
					disable_video: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to disable participant video when joining the meeting. If not provided or set to `false`, the participant video will follow the meeting's default settings.",
						)
						.meta({ examples: [false] }),
					disable_audio: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to disable participant audio when joining the meeting. If not provided or set to `false`, the participant audio will follow the meeting's default settings.",
						)
						.meta({ examples: [false] }),
				}),
			)
			.min(1)
			.max(500)
			.optional()
			.describe("The attendees list."),
		ttl: z.coerce
			.bigint()
			.optional()
			.default(BigInt(7200))
			.describe("The invite link's expiration time, in seconds. \n\nThis value defaults to `7200`.")
			.meta({ examples: [1000] }),
	})
	.optional()
	.describe("Webinar invite link object.");

export const webinarLiveStreamingJoinTokenPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarLiveStreamingJoinTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the join token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The join token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the webinar's join token.");

export const webinarLiveStreamingJoinTokenStatus400Schema = z.unknown();

export const webinarLiveStreamingJoinTokenStatus404Schema = z.unknown();

export const webinarLiveStreamingJoinTokenStatus429Schema = z.unknown();

export const webinarLiveStreamingJoinTokenResponseSchema =
	webinarLiveStreamingJoinTokenStatus200Schema;

export const webinarLiveStreamingJoinTokenErrorSchema = z.union([
	webinarLiveStreamingJoinTokenStatus400Schema,
	webinarLiveStreamingJoinTokenStatus404Schema,
	webinarLiveStreamingJoinTokenStatus429Schema,
]);

export const webinarLocalArchivingArchiveTokenPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarLocalArchivingArchiveTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the archive token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The archive token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the webinar's local archive token.");

export const webinarLocalArchivingArchiveTokenStatus400Schema = z.unknown();

export const webinarLocalArchivingArchiveTokenStatus404Schema = z.unknown();

export const webinarLocalArchivingArchiveTokenStatus429Schema = z.unknown();

export const webinarLocalArchivingArchiveTokenResponseSchema =
	webinarLocalArchivingArchiveTokenStatus200Schema;

export const webinarLocalArchivingArchiveTokenErrorSchema = z.union([
	webinarLocalArchivingArchiveTokenStatus400Schema,
	webinarLocalArchivingArchiveTokenStatus404Schema,
	webinarLocalArchivingArchiveTokenStatus429Schema,
]);

export const webinarLocalRecordingJoinTokenPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarLocalRecordingJoinTokenStatus200Schema = z
	.object({
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe(
				"The number of seconds the join token is valid for before it expires. This value always returns `120`.",
			)
			.meta({ examples: [120] }),
		token: z
			.string()
			.optional()
			.describe("The join token.")
			.meta({ examples: ["2njt50mj"] }),
	})
	.describe("Information about the webinar's local recorder join token.");

export const webinarLocalRecordingJoinTokenStatus400Schema = z.unknown();

export const webinarLocalRecordingJoinTokenStatus404Schema = z.unknown();

export const webinarLocalRecordingJoinTokenStatus429Schema = z.unknown();

export const webinarLocalRecordingJoinTokenResponseSchema =
	webinarLocalRecordingJoinTokenStatus200Schema;

export const webinarLocalRecordingJoinTokenErrorSchema = z.union([
	webinarLocalRecordingJoinTokenStatus400Schema,
	webinarLocalRecordingJoinTokenStatus404Schema,
	webinarLocalRecordingJoinTokenStatus429Schema,
]);

export const getWebinarLiveStreamDetailsPathWebinarIdSchema = z
	.string()
	.describe("The webinar's unique ID.")
	.meta({ examples: ["95204914252"] });

export const getWebinarLiveStreamDetailsStatus200Schema = z.object({
	page_url: z
		.string()
		.optional()
		.describe(
			"Live streaming page URL. This is the URL using which anyone can view the live stream of the webinar.",
		)
		.meta({ examples: ["https://example.com/livestream/123"] }),
	stream_key: z
		.string()
		.optional()
		.describe("Stream key.")
		.meta({ examples: ["contact-it@example.com"] }),
	stream_url: z
		.string()
		.optional()
		.describe("Stream URL.")
		.meta({ examples: ["https://example.com/livestream"] }),
	resolution: z
		.string()
		.optional()
		.describe("The number of pixels in each dimension that the video camera can display.")
		.meta({ examples: ["720p"] }),
});

export const getWebinarLiveStreamDetailsStatus400Schema = z.unknown();

export const getWebinarLiveStreamDetailsStatus404Schema = z.unknown();

export const getWebinarLiveStreamDetailsStatus429Schema = z.unknown();

export const getWebinarLiveStreamDetailsResponseSchema = getWebinarLiveStreamDetailsStatus200Schema;

export const getWebinarLiveStreamDetailsErrorSchema = z.union([
	getWebinarLiveStreamDetailsStatus400Schema,
	getWebinarLiveStreamDetailsStatus404Schema,
	getWebinarLiveStreamDetailsStatus429Schema,
]);

export const webinarLiveStreamUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarLiveStreamUpdateStatus204Schema = z.unknown();

export const webinarLiveStreamUpdateStatus400Schema = z.unknown();

export const webinarLiveStreamUpdateStatus404Schema = z.unknown();

export const webinarLiveStreamUpdateStatus429Schema = z.unknown();

export const webinarLiveStreamUpdateResponseSchema = webinarLiveStreamUpdateStatus204Schema;

export const webinarLiveStreamUpdateErrorSchema = z.union([
	webinarLiveStreamUpdateStatus400Schema,
	webinarLiveStreamUpdateStatus404Schema,
	webinarLiveStreamUpdateStatus429Schema,
]);

export const webinarLiveStreamUpdateBodySchema = z
	.object({
		page_url: z
			.url()
			.max(1024)
			.describe("The webinar live stream page's URL.")
			.meta({ examples: ["https://example.com/livestream/123"] }),
		stream_key: z
			.string()
			.max(512)
			.describe("The webinar live stream name and key.")
			.meta({ examples: ["contact-it@example.com"] }),
		stream_url: z
			.string()
			.max(1024)
			.describe("The webinar live stream URL.")
			.meta({ examples: ["https://example.com/livestream"] }),
		resolution: z
			.string()
			.optional()
			.describe(
				"The number of pixels in each dimension that the video camera can display, required when a user enables 1080p. Use a value of `720p` or `1080p`",
			)
			.meta({ examples: ["720p"] }),
	})
	.optional()
	.describe("Webinar");

export const webinarLiveStreamStatusUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarLiveStreamStatusUpdateStatus204Schema = z.unknown();

export const webinarLiveStreamStatusUpdateStatus400Schema = z.unknown();

export const webinarLiveStreamStatusUpdateStatus404Schema = z.unknown();

export const webinarLiveStreamStatusUpdateStatus429Schema = z.unknown();

export const webinarLiveStreamStatusUpdateResponseSchema =
	webinarLiveStreamStatusUpdateStatus204Schema;

export const webinarLiveStreamStatusUpdateErrorSchema = z.union([
	webinarLiveStreamStatusUpdateStatus400Schema,
	webinarLiveStreamStatusUpdateStatus404Schema,
	webinarLiveStreamStatusUpdateStatus429Schema,
]);

export const webinarLiveStreamStatusUpdateBodySchema = z
	.object({
		action: z
			.enum(["start", "stop"])
			.optional()
			.describe(
				"Update the live stream's status.\n* `start` - Start a webinar live stream.\n* `stop` - Stop an ongoing webinar live stream.",
			)
			.meta({ examples: ["start"] }),
		settings: z
			.object({
				active_speaker_name: z
					.boolean()
					.optional()
					.describe("Display the name of the active speaker during a live stream.")
					.meta({ examples: [true] }),
				display_name: z
					.string()
					.min(1)
					.max(50)
					.optional()
					.describe("Display the live stream's name.")
					.meta({ examples: ["Jill Chill"] }),
				close_caption: z
					.enum(["burnt-in", "embedded", "off"])
					.optional()
					.default("burnt-in")
					.describe(
						"The livestream's closed caption type for this session.\r\n* `burnt-in` - Burnt in captions.\r\n* `embedded` - Embedded captions.\r\n* `off` - Turn off captions.",
					)
					.meta({ examples: ["burnt-in"] }),
			})
			.optional()
			.describe(
				"Update the live stream session's settings. **Only** settings for a stopped live stream can be updated.",
			),
	})
	.optional()
	.describe("Webinar");

export const webinarPanelistsPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPanelistsStatus200Schema = z
	.object({
		panelists: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("Panelist's ID.")
							.meta({ examples: ["Tg2b6GhcQKKbV7nSCbDKug"] }),
					})
					.extend({
						email: z
							.email()
							.optional()
							.describe(
								"Panelist's email. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						name: z
							.string()
							.optional()
							.describe(
								"The panelist's full name.\n\n**Note** This value cannot exceed more than 12 Chinese characters.",
							)
							.meta({ examples: ["Jill Chill"] }),
					})
					.extend({
						join_url: z
							.string()
							.optional()
							.describe("Join URL.")
							.meta({ examples: ["https://example.com/j/11111"] }),
					})
					.extend({
						virtual_background_id: z
							.string()
							.optional()
							.describe("The virtual background's ID.")
							.meta({ examples: ["xHhPyb8ERMCmiC5njPjFdQ"] }),
						name_tag_id: z
							.string()
							.optional()
							.describe("The name tag ID to bind.")
							.meta({ examples: ["xHhPyb8ERMCmiC5njPjFdQ"] }),
						name_tag_name: z
							.string()
							.optional()
							.describe("The panelist's name to display in the name tag.")
							.meta({ examples: ["name"] }),
						name_tag_pronouns: z
							.string()
							.optional()
							.describe("The pronouns to display in the name tag.")
							.meta({ examples: ["pronouns"] }),
						name_tag_description: z
							.string()
							.optional()
							.describe("The description for the name tag, such as the person's title.")
							.meta({ examples: ["description"] }),
					}),
			)
			.optional()
			.describe("List of panelist objects."),
		total_records: z
			.int()
			.optional()
			.describe("Total records.")
			.meta({ examples: [1] }),
	})
	.describe("Webinar panelist.");

export const webinarPanelistsStatus400Schema = z.unknown();

export const webinarPanelistsStatus404Schema = z.unknown();

export const webinarPanelistsStatus429Schema = z.unknown();

export const webinarPanelistsResponseSchema = webinarPanelistsStatus200Schema;

export const webinarPanelistsErrorSchema = z.union([
	webinarPanelistsStatus400Schema,
	webinarPanelistsStatus404Schema,
	webinarPanelistsStatus429Schema,
]);

export const webinarPanelistCreatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPanelistCreateStatus201Schema = z.object({
	id: z
		.string()
		.optional()
		.describe("Webinar ID.")
		.meta({ examples: ["95204914252"] }),
	updated_at: z.iso
		.datetime()
		.optional()
		.describe("The time when the panelist was added.")
		.meta({ examples: ["2022-03-26T07:30:16Z"] }),
});

export const webinarPanelistCreateStatus400Schema = z.unknown();

export const webinarPanelistCreateStatus404Schema = z.unknown();

export const webinarPanelistCreateStatus429Schema = z.unknown();

export const webinarPanelistCreateResponseSchema = webinarPanelistCreateStatus201Schema;

export const webinarPanelistCreateErrorSchema = z.union([
	webinarPanelistCreateStatus400Schema,
	webinarPanelistCreateStatus404Schema,
	webinarPanelistCreateStatus429Schema,
]);

export const webinarPanelistCreateBodySchema = z
	.object({
		panelists: z
			.array(
				z
					.object({
						email: z
							.email()
							.optional()
							.describe(
								"Panelist's email. See the [email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						name: z
							.string()
							.optional()
							.describe(
								"The panelist's full name.\n\n**Note:** This value cannot exceed more than 12 Chinese characters.",
							)
							.meta({ examples: ["Jill Chill"] }),
					})
					.extend({
						virtual_background_id: z
							.string()
							.optional()
							.describe("The virtual background ID to bind.")
							.meta({ examples: ["xHhPyb8ERMCmiC5njPjFdQ"] }),
						name_tag_id: z
							.string()
							.optional()
							.describe("The name tag ID to bind.")
							.meta({ examples: ["xHhPyb8ERMCmiC5njPjFdQ"] }),
						name_tag_name: z
							.string()
							.optional()
							.describe("The panelist's name to display in the name tag.")
							.meta({ examples: ["xHhPyb8ERMCmiC5njPjFdQ"] }),
						name_tag_pronouns: z
							.string()
							.optional()
							.describe("The pronouns to display in the name tag.")
							.meta({ examples: ["pronouns"] }),
						name_tag_description: z
							.string()
							.optional()
							.describe("The description for the name tag, such the person's title.")
							.meta({ examples: ["description"] }),
					}),
			)
			.optional()
			.describe("List of panelist objects."),
	})
	.optional()
	.describe("Webinar panelist.");

export const webinarPanelistsDeletePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPanelistsDeleteStatus204Schema = z.unknown();

export const webinarPanelistsDeleteStatus400Schema = z.unknown();

export const webinarPanelistsDeleteStatus404Schema = z.unknown();

export const webinarPanelistsDeleteStatus429Schema = z.unknown();

export const webinarPanelistsDeleteResponseSchema = webinarPanelistsDeleteStatus204Schema;

export const webinarPanelistsDeleteErrorSchema = z.union([
	webinarPanelistsDeleteStatus400Schema,
	webinarPanelistsDeleteStatus404Schema,
	webinarPanelistsDeleteStatus429Schema,
]);

export const webinarPanelistDeletePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPanelistDeletePathPanelistIdSchema = z
	.string()
	.describe("The panelist's ID or email.")
	.meta({ examples: ["Tg2b6GhcQKKbV7nSCbDKug"] });

export const webinarPanelistDeleteStatus204Schema = z.unknown();

export const webinarPanelistDeleteStatus400Schema = z.unknown();

export const webinarPanelistDeleteStatus404Schema = z.unknown();

export const webinarPanelistDeleteStatus429Schema = z.unknown();

export const webinarPanelistDeleteResponseSchema = webinarPanelistDeleteStatus204Schema;

export const webinarPanelistDeleteErrorSchema = z.union([
	webinarPanelistDeleteStatus400Schema,
	webinarPanelistDeleteStatus404Schema,
	webinarPanelistDeleteStatus429Schema,
]);

export const webinarPollsPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPollsQueryAnonymousSchema = z
	.boolean()
	.optional()
	.describe(
		"Whether to query for polls with the **Anonymous** option enabled: \n* `true` &mdash; Query for polls with the **Anonymous** option enabled. \n* `false` &mdash; Do not query for polls with the **Anonymous** option enabled.",
	)
	.meta({ examples: [true] });

export const webinarPollsStatus200Schema = z
	.object({
		polls: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("The poll ID.")
							.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
						status: z
							.enum(["notstart", "started", "ended", "sharing", "deactivated"])
							.optional()
							.describe(
								"The status of the webinar poll:\n`notstart` - Poll not started\n`started` - Poll started\n`ended` - Poll ended\n`sharing` - Sharing poll results\n`deactivated` - Poll deactivated",
							)
							.meta({ examples: ["notstart"] }),
					})
					.extend({
						anonymous: z
							.boolean()
							.optional()
							.default(false)
							.describe(
								"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
							)
							.meta({ examples: [true] }),
						poll_type: z
							.union([z.literal(1), z.literal(2), z.literal(3)])
							.optional()
							.describe(
								"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
							)
							.meta({ examples: [2] }),
						questions: z
							.array(
								z.object({
									answer_max_character: z
										.int()
										.optional()
										.describe(
											"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
										)
										.meta({ examples: [200] }),
									answer_min_character: z
										.int()
										.min(1)
										.optional()
										.describe(
											"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
										)
										.meta({ examples: [1] }),
									answer_required: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									answers: z
										.array(z.string())
										.min(2)
										.optional()
										.describe(
											"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
										),
									case_sensitive: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									name: z
										.string()
										.max(1024)
										.optional()
										.describe(
											"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
										)
										.meta({ examples: ["How useful was this meeting?"] }),
									prompts: z
										.array(
											z.object({
												prompt_question: z
													.string()
													.optional()
													.describe("The question prompt's title.")
													.meta({ examples: ["How are you?"] }),
												prompt_right_answers: z
													.array(z.string())
													.optional()
													.describe(
														"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
													),
											}),
										)
										.optional()
										.describe(
											"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
										),
									rating_max_label: z
										.string()
										.optional()
										.describe(
											"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: ["Extremely Likely"] }),
									rating_max_value: z
										.int()
										.max(10)
										.optional()
										.describe(
											"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: [4] }),
									rating_min_label: z
										.string()
										.optional()
										.describe(
											"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: ["Not likely"] }),
									rating_min_value: z
										.int()
										.min(0)
										.optional()
										.describe(
											"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
										)
										.meta({ examples: [0] }),
									right_answers: z
										.array(z.string())
										.min(1)
										.optional()
										.describe(
											"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
										),
									show_as_dropdown: z
										.boolean()
										.optional()
										.default(false)
										.describe(
											"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
										)
										.meta({ examples: [false] }),
									type: z
										.union([
											z.literal("single"),
											z.literal("multiple"),
											z.literal("matching"),
											z.literal("rank_order"),
											z.literal("short_answer"),
											z.literal("long_answer"),
											z.literal("fill_in_the_blank"),
											z.literal("rating_scale"),
										])
										.optional()
										.describe(
											"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
										)
										.meta({ examples: ["single"] }),
								}),
							)
							.optional()
							.describe("The information about the poll's questions."),
						title: z
							.string()
							.max(64)
							.optional()
							.describe("The poll's title, up to 64 characters.")
							.meta({ examples: ["Learn something new"] }),
					}),
			)
			.optional()
			.describe("An array of polls."),
		total_records: z
			.int()
			.optional()
			.describe("The number of all records available across pages.")
			.meta({ examples: [1] }),
	})
	.describe("The poll List.");

export const webinarPollsStatus400Schema = z.unknown();

export const webinarPollsStatus404Schema = z.unknown();

export const webinarPollsStatus429Schema = z.unknown();

export const webinarPollsResponseSchema = webinarPollsStatus200Schema;

export const webinarPollsErrorSchema = z.union([
	webinarPollsStatus400Schema,
	webinarPollsStatus404Schema,
	webinarPollsStatus429Schema,
]);

export const webinarPollCreatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPollCreateStatus201Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("The webinar poll ID.")
			.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
		status: z
			.union([
				z.literal("notstart"),
				z.literal("started"),
				z.literal("ended"),
				z.literal("sharing"),
			])
			.optional()
			.describe(
				"The status of the webinar poll:  \n `notstart` - Poll not started  \n `started` - Poll started  \n `ended` - Poll ended  \n `sharing` - Sharing poll results",
			)
			.meta({ examples: ["notstart"] }),
	})
	.extend({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll. \n* `1` - Poll. \n* `2` - Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` - Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls. \n* `true` - The answer is case-sensitive. \n* `false` - The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order. \n* `short_answer` - Short answer. \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank. \n* `rating_scale` - Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	});

export const webinarPollCreateStatus400Schema = z.unknown();

export const webinarPollCreateStatus404Schema = z.unknown();

export const webinarPollCreateStatus429Schema = z.unknown();

export const webinarPollCreateResponseSchema = webinarPollCreateStatus201Schema;

export const webinarPollCreateErrorSchema = z.union([
	webinarPollCreateStatus400Schema,
	webinarPollCreateStatus404Schema,
	webinarPollCreateStatus429Schema,
]);

export const webinarPollCreateBodySchema = z
	.object({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll. \n* `1` - Poll. \n* `2` - Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` - Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls. \n* `true` - The answer is case-sensitive. \n* `false` - The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order. \n* `short_answer` - Short answer. \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank. \n* `rating_scale` - Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	})
	.optional()
	.describe("The Webinar poll object.");

export const webinarPollGetPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPollGetPathPollIdSchema = z
	.string()
	.describe("The poll ID.")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const webinarPollGetStatus200Schema = z
	.object({
		id: z
			.string()
			.optional()
			.describe("The webinar poll ID.")
			.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] }),
		status: z
			.enum(["notstart", "started", "ended", "sharing", "deactivated"])
			.optional()
			.describe(
				"The status of the webinar poll:\n`notstart` - Poll not started\n`started` - Poll started\n`ended` - Poll ended\n`sharing` - Sharing poll results\n`deactivated` - Poll deactivated",
			)
			.meta({ examples: ["notstart"] }),
	})
	.extend({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	});

export const webinarPollGetStatus400Schema = z.unknown();

export const webinarPollGetStatus404Schema = z.unknown();

export const webinarPollGetStatus429Schema = z.unknown();

export const webinarPollGetResponseSchema = webinarPollGetStatus200Schema;

export const webinarPollGetErrorSchema = z.union([
	webinarPollGetStatus400Schema,
	webinarPollGetStatus404Schema,
	webinarPollGetStatus429Schema,
]);

export const webinarPollUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPollUpdatePathPollIdSchema = z
	.string()
	.describe("The poll ID.")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const webinarPollUpdateStatus204Schema = z.unknown();

export const webinarPollUpdateStatus400Schema = z.unknown();

export const webinarPollUpdateStatus404Schema = z.unknown();

export const webinarPollUpdateStatus429Schema = z.unknown();

export const webinarPollUpdateResponseSchema = webinarPollUpdateStatus204Schema;

export const webinarPollUpdateErrorSchema = z.union([
	webinarPollUpdateStatus400Schema,
	webinarPollUpdateStatus404Schema,
	webinarPollUpdateStatus429Schema,
]);

export const webinarPollUpdateBodySchema = z
	.object({
		anonymous: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether meeting participants answer poll questions anonymously. \n\nThis value defaults to `false`.",
			)
			.meta({ examples: [true] }),
		poll_type: z
			.union([z.literal(1), z.literal(2), z.literal(3)])
			.optional()
			.describe(
				"The type of poll: \n* `1` &mdash; Poll. \n* `2` &mdash; Advanced Poll. This feature must be enabled in your Zoom account. \n* `3` &mdash; Quiz. This feature must be enabled in your Zoom account. \n\n This value defaults to `1`.",
			)
			.meta({ examples: [2] }),
		questions: z
			.array(
				z.object({
					answer_max_character: z
						.int()
						.optional()
						.describe(
							"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` polls: \n* For `short_answer` polls, a maximum of 500 characters. \n* For `long_answer` polls, a maximum of 2,000 characters.",
						)
						.meta({ examples: [200] }),
					answer_min_character: z
						.int()
						.min(1)
						.optional()
						.describe(
							"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` polls. You must provide at least a **one** character minimum value.",
						)
						.meta({ examples: [1] }),
					answer_required: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether participants must answer the question: \n* `true` &mdash; The participant must answer the question. \n* `false` &mdash; The participant does not need to answer the question. \n\n**Note:** \n* When the poll's `type` value is `1` (Poll), this value defaults to `true`. \n* When the poll's `type` value is the `2` (Advanced Poll) or `3` (Quiz) values, this value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					answers: z
						.array(z.string())
						.min(2)
						.optional()
						.describe(
							"The poll question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` polls, you can only provide a maximum of 10 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
						),
					case_sensitive: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether the correct answer is case sensitive. This field only applies to `fill_in_the_blank` polls: \n* `true` &mdash; The answer is case-sensitive. \n* `false` &mdash; The answer is not case-sensitive. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					name: z
						.string()
						.max(1024)
						.optional()
						.describe(
							"The poll question, up to 1024 characters. \n\nFor `fill_in_the_blank` polls, this field is the poll's question. For each value that the user must fill in, ensure that there are the same number of `right_answers` values.",
						)
						.meta({ examples: ["How useful was this meeting?"] }),
					prompts: z
						.array(
							z.object({
								prompt_question: z
									.string()
									.optional()
									.describe("The question prompt's title.")
									.meta({ examples: ["How are you?"] }),
								prompt_right_answers: z
									.array(z.string())
									.optional()
									.describe(
										"The question prompt's correct answers: \n* For `matching` polls, you must provide a minimum of two correct answers, up to a maximum of 10 correct answers. \n* For `rank_order` polls, you can only provide one correct answer.",
									),
							}),
						)
						.optional()
						.describe(
							"The information about the prompt questions. This field only applies to `matching` and `rank_order` polls. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
						),
					rating_max_label: z
						.string()
						.optional()
						.describe(
							"The high score label for the `rating_max_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Extremely Likely"] }),
					rating_max_value: z
						.int()
						.max(10)
						.optional()
						.describe(
							"The rating scale's maximum value, up to a maximum value of 10. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [4] }),
					rating_min_label: z
						.string()
						.optional()
						.describe(
							"The low score label for the `rating_min_value` field. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: ["Not likely"] }),
					rating_min_value: z
						.int()
						.min(0)
						.optional()
						.describe(
							"The rating scale's minimum value. This value cannot be less than zero. \n\nThis field only applies to the `rating_scale` poll.",
						)
						.meta({ examples: [0] }),
					right_answers: z
						.array(z.string())
						.min(1)
						.optional()
						.describe(
							"The poll question's correct answer(s). This field is **required** if the poll's `type` value is `3` (Quiz). \n\n For `single` and `matching` polls, this field only accepts one answer.",
						),
					show_as_dropdown: z
						.boolean()
						.optional()
						.default(false)
						.describe(
							"Whether to display the radio selection as a drop-down box: \n* `true` &mdash; Show as a drop-down box. \n* `false` &mdash; Do not show as a drop-down box. \n\nThis value defaults to `false`.",
						)
						.meta({ examples: [false] }),
					type: z
						.union([
							z.literal("single"),
							z.literal("multiple"),
							z.literal("matching"),
							z.literal("rank_order"),
							z.literal("short_answer"),
							z.literal("long_answer"),
							z.literal("fill_in_the_blank"),
							z.literal("rating_scale"),
						])
						.optional()
						.describe(
							"The poll's question and answer type: \n* `single` &mdash; Single choice. \n* `multiple` &mdash; Multiple choice. \n* `matching` &mdash; Matching. \n* `rank_order` &mdash; Rank order. \n* `short_answer` &mdash; Short answer. \n* `long_answer` &mdash; Long answer. \n* `fill_in_the_blank` &mdash; Fill in the blank. \n* `rating_scale` &mdash; Rating scale.",
						)
						.meta({ examples: ["single"] }),
				}),
			)
			.optional()
			.describe("The information about the poll's questions."),
		title: z
			.string()
			.max(64)
			.optional()
			.describe("The poll's title, up to 64 characters.")
			.meta({ examples: ["Learn something new"] }),
	})
	.optional()
	.describe("The webinar poll.");

export const webinarPollDeletePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarPollDeletePathPollIdSchema = z
	.string()
	.describe("The poll ID")
	.meta({ examples: ["QalIoKWLTJehBJ8e1xRrbQ"] });

export const webinarPollDeleteStatus204Schema = z.unknown();

export const webinarPollDeleteStatus400Schema = z.unknown();

export const webinarPollDeleteStatus404Schema = z.unknown();

export const webinarPollDeleteStatus429Schema = z.unknown();

export const webinarPollDeleteResponseSchema = webinarPollDeleteStatus204Schema;

export const webinarPollDeleteErrorSchema = z.union([
	webinarPollDeleteStatus400Schema,
	webinarPollDeleteStatus404Schema,
	webinarPollDeleteStatus429Schema,
]);

export const webinarRegistrantsPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantsQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const webinarRegistrantsQueryStatusSchema = z
	.enum(["pending", "approved", "denied"])
	.optional()
	.default("approved")
	.describe(
		"Query by the registrant's status. \n* `pending` - The registration is pending. \n* `approved` - The registrant is approved. \n* `denied` - The registration is denied.",
	)
	.meta({ examples: ["pending"] });

export const webinarRegistrantsQueryTrackingSourceIdSchema = z
	.string()
	.optional()
	.describe(
		"The tracking source ID for the registrants. Useful if you share the webinar registration page in multiple locations. See [Creating source tracking links for webinar registration](https://support.zoom.us/hc/en-us/articles/360000315683-Creating-source-tracking-links-for-webinar-registration) for details.",
	)
	.meta({ examples: ["5516482804110"] });

export const webinarRegistrantsQueryPageSizeSchema = z
	.int()
	.max(300)
	.optional()
	.default(30)
	.describe("The number of records returned within a single API call.")
	.meta({ examples: [30] });

export const webinarRegistrantsQueryPageNumberSchema = z
	.int()
	.optional()
	.default(1)
	.describe(
		"**Deprecated** This field will be deprecated. We will no longer support this field in a future release. Instead, use the `next_page_token` for pagination.",
	)
	.meta({ examples: [1] });

export const webinarRegistrantsQueryNextPageTokenSchema = z
	.string()
	.optional()
	.describe(
		"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
	)
	.meta({ examples: ["IAfJX3jsOLW7w3dokmFl84zOa0MAVGyMEB2"] });

export const webinarRegistrantsStatus200Schema = z
	.object({
		next_page_token: z
			.string()
			.optional()
			.describe(
				"Use the next page token to paginate through large result sets. A next page token is returned whenever the set of available results exceeds the current page size. This token's expiration period is 15 minutes.",
			)
			.meta({ examples: ["w7587w4eiyfsudgf"] }),
		page_count: z
			.int()
			.optional()
			.describe("The number of pages returned for the request made.")
			.meta({ examples: [1] }),
		page_number: z
			.int()
			.optional()
			.default(1)
			.describe(
				"**Deprecated** This field will be deprecated. We will no longer support this field in a future release. Instead, use `next_page_token` for pagination.",
			)
			.meta({ examples: [1] }),
		page_size: z
			.int()
			.max(300)
			.optional()
			.default(30)
			.describe("The number of records returned with a single API call.")
			.meta({ examples: [30] }),
		total_records: z
			.int()
			.optional()
			.describe("The total number of all the records available across pages.")
			.meta({ examples: [20] }),
	})
	.extend({
		registrants: z
			.array(
				z
					.object({
						id: z
							.string()
							.optional()
							.describe("Registrant ID.")
							.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
					})
					.extend({
						address: z
							.string()
							.optional()
							.describe("The registrant's address.")
							.meta({ examples: ["1800 Amphibious Blvd."] }),
						city: z
							.string()
							.optional()
							.describe("The registrant's city.")
							.meta({ examples: ["Mountain View"] }),
						comments: z
							.string()
							.optional()
							.describe("The registrant's questions and comments.")
							.meta({ examples: ["Looking forward to the discussion."] }),
						country: z
							.string()
							.optional()
							.describe(
								"The registrant's two-letter ISO [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
							)
							.meta({ examples: ["US"] }),
						custom_questions: z
							.array(
								z.object({
									title: z
										.string()
										.optional()
										.describe("The title of the custom question.")
										.meta({ examples: ["What do you hope to learn from this?"] }),
									value: z
										.string()
										.max(128)
										.optional()
										.describe(
											"The custom question's response value. This has a limit of 128 characters.",
										)
										.meta({
											examples: [
												"Look forward to learning how you come up with new recipes and what other services you offer.",
											],
										}),
								}),
							)
							.optional()
							.describe("Information about custom questions."),
						email: z
							.email()
							.max(128)
							.describe(
								"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
							)
							.meta({ examples: ["jchill@example.com"] }),
						first_name: z
							.string()
							.max(64)
							.describe("The registrant's first name.")
							.meta({ examples: ["Jill"] }),
						industry: z
							.string()
							.optional()
							.describe("The registrant's industry.")
							.meta({ examples: ["Food"] }),
						job_title: z
							.string()
							.optional()
							.describe("The registrant's job title.")
							.meta({ examples: ["Chef"] }),
						last_name: z
							.string()
							.max(64)
							.optional()
							.describe("The registrant's last name.")
							.meta({ examples: ["Chill"] }),
						no_of_employees: z
							.enum([
								"",
								"1-20",
								"21-50",
								"51-100",
								"101-250",
								"251-500",
								"501-1,000",
								"1,001-5,000",
								"5,001-10,000",
								"More than 10,000",
							])
							.optional()
							.describe(
								"The registrant's number of employees. \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
							)
							.meta({ examples: ["1-20"] }),
						org: z
							.string()
							.optional()
							.describe("The registrant's organization.")
							.meta({ examples: ["Cooking Org"] }),
						phone: z
							.string()
							.optional()
							.describe("The registrant's phone number.")
							.meta({ examples: ["5550100"] }),
						purchasing_time_frame: z
							.enum([
								"",
								"Within a month",
								"1-3 months",
								"4-6 months",
								"More than 6 months",
								"No timeframe",
							])
							.optional()
							.describe(
								"The registrant's purchasing time frame. \n* `Within a month.` \n* `1-3 months.` \n* `4-6 months.` \n* `More than 6 months.` \n* `No timeframe.`",
							)
							.meta({ examples: ["1-3 months"] }),
						role_in_purchase_process: z
							.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
							.optional()
							.describe(
								"The registrant's role in the purchase process. \n* `Decision maker` \n* `Evaluator/Recommender.` \n* `Influencer.` \n* `Not involved.`",
							)
							.meta({ examples: ["Influencer"] }),
						state: z
							.string()
							.optional()
							.describe("The registrant's state or province.")
							.meta({ examples: ["CA"] }),
						status: z
							.enum(["approved", "denied", "pending"])
							.optional()
							.describe(
								"The registrant's status. \n* `approved` - Registrant is approved. \n* `denied` - Registrant is denied. \n* `pending` - Registrant is waiting for approval.",
							)
							.meta({ examples: ["approved"] }),
						zip: z
							.string()
							.optional()
							.describe("The registrant's ZIP or postal code.")
							.meta({ examples: ["94045"] }),
					})
					.extend({
						create_time: z.iso
							.datetime()
							.optional()
							.describe("The time when the registrant registered.")
							.meta({ examples: ["2022-03-22T05:59:09Z"] }),
						join_url: z
							.string()
							.optional()
							.describe(
								"The URL that an approved registrant can use to join the meeting or webinar.",
							)
							.meta({ examples: ["https://example.com/j/11111"] }),
						status: z
							.string()
							.optional()
							.describe(
								"The status of the registrant's registration.   \n  `approved` - User has been successfully approved for the webinar.  \n  `pending` -  The registration is still pending.  \n  `denied` - User has been denied from joining the webinar.",
							)
							.meta({ examples: ["approved"] }),
					}),
			)
			.optional()
			.describe("List of registrant objects."),
	})
	.describe("List of users.");

export const webinarRegistrantsStatus400Schema = z.unknown();

export const webinarRegistrantsStatus404Schema = z.unknown();

export const webinarRegistrantsStatus429Schema = z.unknown();

export const webinarRegistrantsResponseSchema = webinarRegistrantsStatus200Schema;

export const webinarRegistrantsErrorSchema = z.union([
	webinarRegistrantsStatus400Schema,
	webinarRegistrantsStatus404Schema,
	webinarRegistrantsStatus429Schema,
]);

export const webinarRegistrantCreatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantCreateQueryOccurrenceIdsSchema = z
	.string()
	.optional()
	.describe(
		"A comma-separated list of webinar occurrence IDs. Get this value with the [Get a webinar](/docs/api/rest/reference/zoom-api/methods/#operation/webinar) API. Make sure the `registration_type` is 3 if updating multiple occurrences with this API.",
	)
	.meta({ examples: ["1648538280000"] });

export const webinarRegistrantCreateStatus201Schema = z.object({
	id: z.coerce
		.bigint()
		.optional()
		.describe("The webinar's ID.")
		.meta({ examples: [92674392836] }),
	join_url: z
		.string()
		.optional()
		.describe("The URL the registrant can use to join the webinar.")
		.meta({ examples: ["https://example.com/j/22222"] }),
	registrant_id: z
		.string()
		.optional()
		.describe("The registrant's ID.")
		.meta({ examples: ["fdgsfh2ey82fuh"] }),
	start_time: z.iso
		.datetime()
		.optional()
		.describe("The webinar's start time.")
		.meta({ examples: ["2021-07-13T21:44:51Z"] }),
	topic: z
		.string()
		.max(200)
		.optional()
		.describe("The webinar's topic.")
		.meta({ examples: ["My Webinar"] }),
	occurrences: z
		.array(
			z.object({
				duration: z
					.int()
					.optional()
					.describe("Duration.")
					.meta({ examples: [60] }),
				occurrence_id: z
					.string()
					.optional()
					.describe(
						"Occurrence ID: Unique identifier that identifies an occurrence of a recurring webinar. [Recurring webinars](https://support.zoom.us/hc/en-us/articles/216354763-How-to-Schedule-A-Recurring-Webinar) can have a maximum of 50 occurrences.",
					)
					.meta({ examples: ["1648194360000"] }),
				start_time: z.iso
					.datetime()
					.optional()
					.describe("Start time.")
					.meta({ examples: ["2022-03-25T07:46:00Z"] }),
				status: z
					.string()
					.optional()
					.describe("Occurrence status.")
					.meta({ examples: ["available"] }),
			}),
		)
		.optional()
		.describe("Array of occurrence objects."),
});

export const webinarRegistrantCreateStatus400Schema = z.unknown();

export const webinarRegistrantCreateStatus404Schema = z.unknown();

export const webinarRegistrantCreateStatus429Schema = z.unknown();

export const webinarRegistrantCreateResponseSchema = webinarRegistrantCreateStatus201Schema;

export const webinarRegistrantCreateErrorSchema = z.union([
	webinarRegistrantCreateStatus400Schema,
	webinarRegistrantCreateStatus404Schema,
	webinarRegistrantCreateStatus429Schema,
]);

export const webinarRegistrantCreateBodySchema = z
	.object({
		first_name: z
			.string()
			.max(64)
			.describe("The registrant's first name.")
			.meta({ examples: ["Jill"] }),
		last_name: z
			.string()
			.max(64)
			.optional()
			.describe("The registrant's last name.")
			.meta({ examples: ["Chill"] }),
		email: z
			.email()
			.max(128)
			.describe("The registrant's email address.")
			.meta({ examples: ["jchill@example.com"] }),
		address: z
			.string()
			.optional()
			.describe("The registrant's address.")
			.meta({ examples: ["1800 Amphibious Blvd."] }),
		city: z
			.string()
			.optional()
			.describe("The registrant's city.")
			.meta({ examples: ["Mountain View"] }),
		state: z
			.string()
			.optional()
			.describe("The registrant's state or province.")
			.meta({ examples: ["CA"] }),
		zip: z
			.string()
			.optional()
			.describe("The registrant's ZIP or postal code.")
			.meta({ examples: ["94045"] }),
		country: z
			.string()
			.optional()
			.describe(
				"The registrant's two-letter [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
			)
			.meta({ examples: ["US"] }),
		phone: z
			.string()
			.optional()
			.describe("The registrant's phone number.")
			.meta({ examples: ["5550100"] }),
		comments: z
			.string()
			.optional()
			.describe("The registrant's questions and comments.")
			.meta({ examples: ["Looking forward to the discussion."] }),
		custom_questions: z
			.array(
				z.object({
					title: z
						.string()
						.optional()
						.describe("The custom question's title.")
						.meta({ examples: ["What do you hope to learn from this?"] }),
					value: z
						.string()
						.max(128)
						.optional()
						.describe("The custom question's response value. This has a limit of 128 characters.")
						.meta({
							examples: [
								"Look forward to learning how you come up with new recipes and what other services you offer.",
							],
						}),
				}),
			)
			.optional()
			.describe("Information about custom questions."),
		industry: z
			.string()
			.optional()
			.describe("The registrant's industry.")
			.meta({ examples: ["Food"] }),
		job_title: z
			.string()
			.optional()
			.describe("The registrant's job title.")
			.meta({ examples: ["Chef"] }),
		no_of_employees: z
			.enum([
				"",
				"1-20",
				"21-50",
				"51-100",
				"101-500",
				"500-1,000",
				"1,001-5,000",
				"5,001-10,000",
				"More than 10,000",
			])
			.optional()
			.describe(
				"The registrant's number of employees: \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-500` \n* `500-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
			)
			.meta({ examples: ["1-20"] }),
		org: z
			.string()
			.optional()
			.describe("The registrant's organization.")
			.meta({ examples: ["Cooking Org"] }),
		purchasing_time_frame: z
			.enum([
				"",
				"Within a month",
				"1-3 months",
				"4-6 months",
				"More than 6 months",
				"No timeframe",
			])
			.optional()
			.describe(
				"The registrant's purchasing time frame: \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
			)
			.meta({ examples: ["1-3 months"] }),
		role_in_purchase_process: z
			.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
			.optional()
			.describe(
				"The registrant's role in the purchase process: \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
			)
			.meta({ examples: ["Influencer"] }),
		language: z
			.enum([
				"en-US",
				"de-DE",
				"es-ES",
				"fr-FR",
				"jp-JP",
				"pt-PT",
				"ru-RU",
				"zh-CN",
				"zh-TW",
				"ko-KO",
				"it-IT",
				"vi-VN",
				"pl-PL",
				"Tr-TR",
			])
			.optional()
			.describe(
				"Specifies the registrant's preferred language for the confirmation email sent upon successful registration.\n\n**Note** This field is only effective if the webinar's 'Select Email Language' setting is set to 'Same as recipients' default language' in the Zoom web portal. If a fixed language is selected, this value will be ignored.\n\n**Supported values**\n\n* `en-US` - English (US)\n* `de-DE` - German (Germany)\n* `es-ES` - Spanish (Spain)\n* `fr-FR` - French (France)\n* `jp-JP` - Japanese\n* `pt-PT` - Portuguese (Portugal)\n* `ru-RU` - Russian\n* `zh-CN` - Chinese (PRC)\n* `zh-TW` - Chinese (Taiwan)\n* `ko-KO` - Korean\n* `it-IT` - Italian (Italy)\n* `vi-VN` - Vietnamese\n* `pl-PL` - Polish\n* `Tr-TR` - Turkish",
			)
			.meta({ examples: ["en-US"] }),
		source_id: z
			.string()
			.optional()
			.describe("The tracking source's unique identifier.")
			.meta({ examples: ["4816766181770"] }),
	})
	.optional()
	.describe("Information about the webinar registrant.");

export const webinarRegistrantsQuestionsGetPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantsQuestionsGetStatus200Schema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe("An array of answer choices. Can't be used for short answer type."),
					required: z
						.boolean()
						.optional()
						.describe(
							"State whether or not the custom question is required to be answered by a registrant.",
						)
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("Custom question.")
						.meta({ examples: ["How are you?"] }),
					type: z
						.union([
							z.literal("short"),
							z.literal("single_radio"),
							z.literal("single_dropdown"),
							z.literal("multiple"),
						])
						.optional()
						.describe("The question-answer type.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of Registrant Custom Questions."),
		questions: z
			.array(
				z.object({
					field_name: z
						.union([
							z.literal("last_name"),
							z.literal("address"),
							z.literal("city"),
							z.literal("country"),
							z.literal("zip"),
							z.literal("state"),
							z.literal("phone"),
							z.literal("industry"),
							z.literal("org"),
							z.literal("job_title"),
							z.literal("purchasing_time_frame"),
							z.literal("role_in_purchase_process"),
							z.literal("no_of_employees"),
							z.literal("comments"),
						])
						.optional()
						.describe("Field name")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe("State whether the selected fields are required or optional.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe(
				"Array of registration fields whose values should be provided by registrants during registration.",
			),
	})
	.describe("Webinar Registrant Questions");

export const webinarRegistrantsQuestionsGetStatus400Schema = z.unknown();

export const webinarRegistrantsQuestionsGetStatus404Schema = z.unknown();

export const webinarRegistrantsQuestionsGetStatus429Schema = z.unknown();

export const webinarRegistrantsQuestionsGetResponseSchema =
	webinarRegistrantsQuestionsGetStatus200Schema;

export const webinarRegistrantsQuestionsGetErrorSchema = z.union([
	webinarRegistrantsQuestionsGetStatus400Schema,
	webinarRegistrantsQuestionsGetStatus404Schema,
	webinarRegistrantsQuestionsGetStatus429Schema,
]);

export const webinarRegistrantQuestionUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantQuestionUpdateStatus204Schema = z.unknown();

export const webinarRegistrantQuestionUpdateStatus400Schema = z.unknown();

export const webinarRegistrantQuestionUpdateStatus404Schema = z.unknown();

export const webinarRegistrantQuestionUpdateStatus429Schema = z.unknown();

export const webinarRegistrantQuestionUpdateResponseSchema =
	webinarRegistrantQuestionUpdateStatus204Schema;

export const webinarRegistrantQuestionUpdateErrorSchema = z.union([
	webinarRegistrantQuestionUpdateStatus400Schema,
	webinarRegistrantQuestionUpdateStatus404Schema,
	webinarRegistrantQuestionUpdateStatus429Schema,
]);

export const webinarRegistrantQuestionUpdateBodySchema = z
	.object({
		custom_questions: z
			.array(
				z.object({
					answers: z
						.array(z.string())
						.optional()
						.describe("An array of answer choices. Can't be used for short answer type."),
					required: z
						.boolean()
						.optional()
						.describe(
							"State whether or not a registrant is required to answer the custom question.",
						)
						.meta({ examples: [true] }),
					title: z
						.string()
						.optional()
						.describe("Custom question.")
						.meta({ examples: ["How are you?"] }),
					type: z
						.union([
							z.literal("short"),
							z.literal("single_radio"),
							z.literal("single_dropdown"),
							z.literal("multiple"),
						])
						.optional()
						.describe("The question-answer type.")
						.meta({ examples: ["short"] }),
				}),
			)
			.optional()
			.describe("Array of custom questions for registrants."),
		questions: z
			.array(
				z.object({
					field_name: z
						.union([
							z.literal("last_name"),
							z.literal("address"),
							z.literal("city"),
							z.literal("country"),
							z.literal("zip"),
							z.literal("state"),
							z.literal("phone"),
							z.literal("industry"),
							z.literal("org"),
							z.literal("job_title"),
							z.literal("purchasing_time_frame"),
							z.literal("role_in_purchase_process"),
							z.literal("no_of_employees"),
							z.literal("comments"),
						])
						.optional()
						.describe("Field name")
						.meta({ examples: ["last_name"] }),
					required: z
						.boolean()
						.optional()
						.describe("State whether the selected fields are required or optional.")
						.meta({ examples: [true] }),
				}),
			)
			.optional()
			.describe("Array of registration fields whose values should be provided by registrants."),
	})
	.optional()
	.describe("Webinar registrant questions");

export const webinarRegistrantStatusPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantStatusQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const webinarRegistrantStatusStatus204Schema = z.unknown();

export const webinarRegistrantStatusStatus400Schema = z.unknown();

export const webinarRegistrantStatusStatus404Schema = z.unknown();

export const webinarRegistrantStatusStatus429Schema = z.unknown();

export const webinarRegistrantStatusResponseSchema = webinarRegistrantStatusStatus204Schema;

export const webinarRegistrantStatusErrorSchema = z.union([
	webinarRegistrantStatusStatus400Schema,
	webinarRegistrantStatusStatus404Schema,
	webinarRegistrantStatusStatus429Schema,
]);

export const webinarRegistrantStatusBodySchema = z
	.object({
		action: z
			.union([z.literal("approve"), z.literal("deny"), z.literal("cancel")])
			.describe(
				"The registration action to perform. \n* `approve` - Approve the registrant. \n* `deny` - Reject the registrant. \n* `cancel` - Cancel the registrant's approval.",
			)
			.meta({ examples: ["approve"] }),
		registrants: z
			.array(
				z.object({
					email: z
						.email()
						.optional()
						.describe("The registrant's email address.")
						.meta({ examples: ["jchill@example.com"] }),
					id: z
						.string()
						.optional()
						.describe("The registrant's ID.")
						.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] }),
				}),
			)
			.optional()
			.describe("The registrant information."),
	})
	.optional();

export const webinarRegistrantGetPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarRegistrantGetPathRegistrantIdSchema = z
	.string()
	.describe("The registrant ID.")
	.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] });

export const webinarRegistrantGetQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The meeting or webinar occurrence ID.")
	.meta({ examples: ["1648194360000"] });

export const webinarRegistrantGetStatus200Schema = z
	.object({
		id: z
			.string()
			.optional()
			.meta({ examples: ["95204914252"] }),
	})
	.and(
		z
			.object({
				address: z
					.string()
					.optional()
					.describe("The registrant's address.")
					.meta({ examples: ["1800 Amphibious Blvd."] }),
				city: z
					.string()
					.optional()
					.describe("The registrant's city.")
					.meta({ examples: ["Mountain View"] }),
				comments: z
					.string()
					.optional()
					.describe("The registrant's questions and comments.")
					.meta({ examples: ["Looking forward to the discussion."] }),
				country: z
					.string()
					.optional()
					.describe(
						"The registrant's two-letter ISO [country code](https://developers.zoom.us/docs/api/rest/other-references/abbreviation-lists/#countries).",
					)
					.meta({ examples: ["US"] }),
				custom_questions: z
					.array(
						z.object({
							title: z
								.string()
								.optional()
								.describe("The title of the custom question.")
								.meta({ examples: ["What do you hope to learn from this?"] }),
							value: z
								.string()
								.max(128)
								.optional()
								.describe(
									"The custom question's response value. This has a limit of 128 characters.",
								)
								.meta({
									examples: [
										"Look forward to learning how you come up with new recipes and what other services you offer.",
									],
								}),
						}),
					)
					.optional()
					.describe("Information about custom questions."),
				email: z
					.email()
					.max(128)
					.describe(
						"The registrant's email address. See [Email address display rules](https://developers.zoom.us/docs/api/rest/using-zoom-apis/#email-address-display-rules) for return value details.",
					)
					.meta({ examples: ["jchill@example.com"] }),
				first_name: z
					.string()
					.max(64)
					.describe("The registrant's first name.")
					.meta({ examples: ["Jill"] }),
				industry: z
					.string()
					.optional()
					.describe("The registrant's industry.")
					.meta({ examples: ["Food"] }),
				job_title: z
					.string()
					.optional()
					.describe("The registrant's job title.")
					.meta({ examples: ["Chef"] }),
				last_name: z
					.string()
					.max(64)
					.optional()
					.describe("The registrant's last name.")
					.meta({ examples: ["Chill"] }),
				no_of_employees: z
					.enum([
						"",
						"1-20",
						"21-50",
						"51-100",
						"101-250",
						"251-500",
						"501-1,000",
						"1,001-5,000",
						"5,001-10,000",
						"More than 10,000",
					])
					.optional()
					.describe(
						"The registrant's number of employees: \n* `1-20` \n* `21-50` \n* `51-100` \n* `101-250` \n* `251-500` \n* `501-1,000` \n* `1,001-5,000` \n* `5,001-10,000` \n* `More than 10,000`",
					)
					.meta({ examples: ["1-20"] }),
				org: z
					.string()
					.optional()
					.describe("The registrant's organization.")
					.meta({ examples: ["Cooking Org"] }),
				phone: z
					.string()
					.optional()
					.describe("The registrant's phone number.")
					.meta({ examples: ["5550100"] }),
				purchasing_time_frame: z
					.enum([
						"",
						"Within a month",
						"1-3 months",
						"4-6 months",
						"More than 6 months",
						"No timeframe",
					])
					.optional()
					.describe(
						"The registrant's purchasing time frame: \n* `Within a month` \n* `1-3 months` \n* `4-6 months` \n* `More than 6 months` \n* `No timeframe`",
					)
					.meta({ examples: ["1-3 months"] }),
				role_in_purchase_process: z
					.enum(["", "Decision Maker", "Evaluator/Recommender", "Influencer", "Not involved"])
					.optional()
					.describe(
						"The registrant's role in the purchase process: \n* `Decision Maker` \n* `Evaluator/Recommender` \n* `Influencer` \n* `Not involved`",
					)
					.meta({ examples: ["Influencer"] }),
				state: z
					.string()
					.optional()
					.describe("The registrant's state or province.")
					.meta({ examples: ["CA"] }),
				status: z
					.enum(["approved", "denied", "pending"])
					.optional()
					.describe(
						"The registrant's status: \n* `approved` &mdash; Registrant is approved. \n* `denied` &mdash; Registrant is denied. \n* `pending` &mdash; Registrant is waiting for approval.",
					)
					.meta({ examples: ["approved"] }),
				zip: z
					.string()
					.optional()
					.describe("The registrant's ZIP or postal code.")
					.meta({ examples: ["94045"] }),
			})
			.extend({
				language: z
					.enum([
						"en-US",
						"de-DE",
						"es-ES",
						"fr-FR",
						"jp-JP",
						"pt-PT",
						"ru-RU",
						"zh-CN",
						"zh-TW",
						"ko-KO",
						"it-IT",
						"vi-VN",
						"pl-PL",
						"Tr-TR",
					])
					.optional()
					.describe(
						"The registrant's language preference for confirmation emails: \n* `en-US` &mdash; English (US) \n* `de-DE` &mdash; German (Germany) \n* `es-ES` &mdash; Spanish (Spain) \n* `fr-FR` &mdash; French (France) \n* `jp-JP` &mdash; Japanese \n* `pt-PT` &mdash; Portuguese (Portugal) \n* `ru-RU` &mdash; Russian \n* `zh-CN` &mdash; Chinese (PRC) \n* `zh-TW` &mdash; Chinese (Taiwan) \n* `ko-KO` &mdash; Korean \n* `it-IT` &mdash; Italian (Italy) \n* `vi-VN` &mdash; Vietnamese \n* `pl-PL` &mdash; Polish \n* `Tr-TR` &mdash; Turkish",
					)
					.meta({ examples: ["en-US"] }),
			}),
	)
	.and(
		z.object({
			create_time: z.iso
				.datetime()
				.optional()
				.meta({ examples: ["2022-03-26T06:44:14Z"] }),
			join_url: z
				.string()
				.optional()
				.meta({ examples: ["https://example.com/j/11111"] }),
			status: z
				.string()
				.optional()
				.meta({ examples: ["approved"] }),
		}),
	);

export const webinarRegistrantGetStatus400Schema = z.unknown();

export const webinarRegistrantGetStatus404Schema = z.unknown();

export const webinarRegistrantGetStatus429Schema = z.unknown();

export const webinarRegistrantGetResponseSchema = webinarRegistrantGetStatus200Schema;

export const webinarRegistrantGetErrorSchema = z.union([
	webinarRegistrantGetStatus400Schema,
	webinarRegistrantGetStatus404Schema,
	webinarRegistrantGetStatus429Schema,
]);

export const deleteWebinarRegistrantPathWebinarIdSchema = z
	.int()
	.describe("The webinar ID.")
	.meta({ examples: [95204914252] });

export const deleteWebinarRegistrantPathRegistrantIdSchema = z
	.string()
	.describe("The registrant ID.")
	.meta({ examples: ["9tboDiHUQAeOnbmudzWa5g"] });

export const deleteWebinarRegistrantQueryOccurrenceIdSchema = z
	.string()
	.optional()
	.describe("The webinar occurrence ID.")
	.meta({ examples: ["1648538280000"] });

export const deleteWebinarRegistrantStatus204Schema = z.unknown();

export const deleteWebinarRegistrantStatus400Schema = z.unknown();

export const deleteWebinarRegistrantStatus404Schema = z.unknown();

export const deleteWebinarRegistrantStatus429Schema = z.unknown();

export const deleteWebinarRegistrantResponseSchema = deleteWebinarRegistrantStatus204Schema;

export const deleteWebinarRegistrantErrorSchema = z.union([
	deleteWebinarRegistrantStatus400Schema,
	deleteWebinarRegistrantStatus404Schema,
	deleteWebinarRegistrantStatus429Schema,
]);

export const getWebinarSipDialingWithPasscodePathWebinarIdSchema = z.coerce
	.bigint()
	.describe(
		"The webinar's ID. \n\n When storing this value in your database, store it as a long format integer and **not** an integer. Webinar IDs can exceed 10 digits.",
	)
	.meta({ examples: [85746065] });

export const getWebinarSipDialingWithPasscodeStatus201Schema = z
	.object({
		sip_dialing: z
			.string()
			.optional()
			.describe("The webinar's encoded SIP URI.")
			.meta({ examples: ["9678722567.xxxx....30qonrvgy@zoomcrc.com"] }),
		paid_crc_plan_participant: z
			.boolean()
			.optional()
			.describe("Whether the API caller has a Conference Room Connector (CRC) plan.")
			.meta({ examples: [true] }),
		participant_identifier_code: z
			.string()
			.optional()
			.describe(
				"This value identifies the webinar participant. It is automatically embedded in the SIP URI if the API caller has a CRC plan.",
			)
			.meta({ examples: ["30qonrvgy"] }),
		expire_in: z.coerce
			.bigint()
			.optional()
			.describe("The number of seconds the encoded SIP URI is valid before it expires.")
			.meta({ examples: [7200] }),
	})
	.describe("Information about the webinar's encoded SIP URI.");

export const getWebinarSipDialingWithPasscodeStatus400Schema = z.unknown();

export const getWebinarSipDialingWithPasscodeStatus429Schema = z.unknown();

export const getWebinarSipDialingWithPasscodeResponseSchema =
	getWebinarSipDialingWithPasscodeStatus201Schema;

export const getWebinarSipDialingWithPasscodeErrorSchema = z.union([
	getWebinarSipDialingWithPasscodeStatus400Schema,
	getWebinarSipDialingWithPasscodeStatus429Schema,
]);

export const getWebinarSipDialingWithPasscodeBodySchema = z
	.object({
		passcode: z
			.string()
			.optional()
			.describe(
				"If customers want a passcode to be embedded in the SIP URI dial string, they must supply the passcode. Zoom will not validate the passcode.",
			)
			.meta({ examples: ["xxxx"] }),
	})
	.optional();

export const webinarStatusPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarStatusStatus200Schema = z.unknown();

export const webinarStatusStatus400Schema = z.unknown();

export const webinarStatusStatus404Schema = z.unknown();

export const webinarStatusStatus429Schema = z.unknown();

export const webinarStatusResponseSchema = webinarStatusStatus200Schema;

export const webinarStatusErrorSchema = z.union([
	webinarStatusStatus400Schema,
	webinarStatusStatus404Schema,
	webinarStatusStatus429Schema,
]);

export const webinarStatusBodySchema = z
	.object({
		action: z
			.literal("end")
			.optional()
			.meta({ examples: ["end"] }),
	})
	.optional();

export const webinarSurveyGetPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarSurveyGetStatus200Schema = z
	.object({
		custom_survey: z
			.object({
				title: z
					.string()
					.max(64)
					.optional()
					.describe("The survey's title, up to 64 characters.")
					.meta({ examples: ["Learn something new"] }),
				anonymous: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to anonymously answer survey questions. \n* `true` - Anonymous survey enabled. \n* `false` - Participants cannot answer survey questions anonymously. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				numbered_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the number in the question name. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				show_question_type: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the question type in the question name. \n\n This value defaults to `false`.",
					)
					.meta({ examples: [false] }),
				feedback: z
					.string()
					.max(320)
					.optional()
					.describe(
						"The survey's feedback, up to 320 characters. \n\n This value defaults to `Thank you so much for taking the time to complete the survey, your feedback really makes a difference.`.",
					)
					.meta({
						examples: [
							"Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.",
						],
					}),
				questions: z
					.array(
						z.object({
							name: z
								.string()
								.optional()
								.describe("The survey question, up to 420 characters.")
								.meta({ examples: ["How useful was this webinar?"] }),
							type: z
								.union([
									z.literal("single"),
									z.literal("multiple"),
									z.literal("matching"),
									z.literal("rank_order"),
									z.literal("short_answer"),
									z.literal("long_answer"),
									z.literal("fill_in_the_blank"),
									z.literal("rating_scale"),
								])
								.optional()
								.describe(
									"The survey's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order \n* `short_answer` - Short answer \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank \n* `rating_scale` - Rating scale.",
								)
								.meta({ examples: ["single"] }),
							answer_required: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							show_as_dropdown: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							answers: z
								.array(z.string().max(200))
								.min(2)
								.optional()
								.describe(
									"The survey question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` questions, you can only provide a maximum of 50 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
								),
							prompts: z
								.array(
									z.object({
										prompt_question: z
											.string()
											.max(200)
											.optional()
											.describe("The question prompt's title.")
											.meta({ examples: ["How are you?"] }),
									}),
								)
								.min(2)
								.max(10)
								.optional()
								.describe(
									"Information about the prompt questions. This field only applies to `matching` and `rank_order` questions. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
								),
							answer_min_character: z
								.int()
								.min(1)
								.optional()
								.describe(
									"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` questions. You must provide at least a **one** character minimum value.",
								)
								.meta({ examples: [1] }),
							answer_max_character: z
								.int()
								.optional()
								.describe(
									"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` questions. \n* For `short_answer` question, a maximum of 500 characters. \n* For `long_answer` question, a maximum of 2,000 characters.",
								)
								.meta({ examples: [200] }),
							rating_min_value: z
								.int()
								.min(0)
								.optional()
								.describe(
									"The rating scale's minimum value. This value cannot be less than zero. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [1] }),
							rating_max_value: z
								.int()
								.max(10)
								.optional()
								.describe(
									"The rating scale's maximum value, up to a maximum value of 10. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [4] }),
							rating_min_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The low score label used for the `rating_min_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Not likely"] }),
							rating_max_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The high score label used for the `rating_max_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Extremely Likely"] }),
						}),
					)
					.min(1)
					.max(100)
					.optional()
					.describe("Information about the webinar survey's questions."),
			})
			.optional()
			.describe("Information about the customized webinar survey."),
		show_in_the_browser: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether the **Show in the browser when the webinar ends** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `true`.",
			)
			.meta({ examples: [true] }),
		show_in_the_follow_up_email: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether the **Show the link on the follow-up email** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `false`.",
			)
			.meta({ examples: [false] }),
		third_party_survey: z
			.string()
			.max(64)
			.optional()
			.describe("The link to the third party webinar survey.")
			.meta({ examples: ["https://example.com"] }),
	})
	.describe("Information about the webinar survey.");

export const webinarSurveyGetStatus400Schema = z.unknown();

export const webinarSurveyGetStatus404Schema = z.unknown();

export const webinarSurveyGetStatus429Schema = z.unknown();

export const webinarSurveyGetResponseSchema = webinarSurveyGetStatus200Schema;

export const webinarSurveyGetErrorSchema = z.union([
	webinarSurveyGetStatus400Schema,
	webinarSurveyGetStatus404Schema,
	webinarSurveyGetStatus429Schema,
]);

export const webinarSurveyDeletePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarSurveyDeleteStatus204Schema = z.unknown();

export const webinarSurveyDeleteStatus400Schema = z.unknown();

export const webinarSurveyDeleteStatus404Schema = z.unknown();

export const webinarSurveyDeleteStatus429Schema = z.unknown();

export const webinarSurveyDeleteResponseSchema = webinarSurveyDeleteStatus204Schema;

export const webinarSurveyDeleteErrorSchema = z.union([
	webinarSurveyDeleteStatus400Schema,
	webinarSurveyDeleteStatus404Schema,
	webinarSurveyDeleteStatus429Schema,
]);

export const webinarSurveyUpdatePathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarSurveyUpdateStatus204Schema = z.unknown();

export const webinarSurveyUpdateStatus400Schema = z.unknown();

export const webinarSurveyUpdateStatus404Schema = z.unknown();

export const webinarSurveyUpdateStatus429Schema = z.unknown();

export const webinarSurveyUpdateResponseSchema = webinarSurveyUpdateStatus204Schema;

export const webinarSurveyUpdateErrorSchema = z.union([
	webinarSurveyUpdateStatus400Schema,
	webinarSurveyUpdateStatus404Schema,
	webinarSurveyUpdateStatus429Schema,
]);

export const webinarSurveyUpdateBodySchema = z
	.object({
		custom_survey: z
			.object({
				title: z
					.string()
					.max(64)
					.optional()
					.describe("The survey's title, up to 64 characters.")
					.meta({ examples: ["Learn something new"] }),
				anonymous: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Allow participants to anonymously answer survey questions. \n* `true` - Anonymous survey enabled. \n* `false` - Participants cannot answer survey questions anonymously. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				numbered_questions: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the number in the question name. \n\n This value defaults to `true`.",
					)
					.meta({ examples: [false] }),
				show_question_type: z
					.boolean()
					.optional()
					.default(false)
					.describe(
						"Whether to display the question type in the question name. \n\n This value defaults to `false`.",
					)
					.meta({ examples: [false] }),
				feedback: z
					.string()
					.max(320)
					.optional()
					.describe(
						"The survey's feedback, up to 320 characters. \n\n This value defaults to `Thank you so much for taking the time to complete the survey, your feedback really makes a difference.`.",
					)
					.meta({
						examples: [
							"Thank you so much for taking the time to complete the survey. Your feedback really makes a difference.",
						],
					}),
				questions: z
					.array(
						z.object({
							name: z
								.string()
								.optional()
								.describe("The survey question, up to 420 characters.")
								.meta({ examples: ["How useful was this webinar?"] }),
							type: z
								.union([
									z.literal("single"),
									z.literal("multiple"),
									z.literal("matching"),
									z.literal("rank_order"),
									z.literal("short_answer"),
									z.literal("long_answer"),
									z.literal("fill_in_the_blank"),
									z.literal("rating_scale"),
								])
								.optional()
								.describe(
									"The survey's question and answer type. \n* `single` - Single choice. \n* `multiple` - Multiple choice. \n* `matching` - Matching. \n* `rank_order` - Rank order \n* `short_answer` - Short answer \n* `long_answer` - Long answer. \n* `fill_in_the_blank` - Fill in the blank \n* `rating_scale` - Rating scale.",
								)
								.meta({ examples: ["single"] }),
							answer_required: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether participants must answer the question. \n* `true` - The participant must answer the question. \n* `false` - The participant does not need to answer the question. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							show_as_dropdown: z
								.boolean()
								.optional()
								.default(false)
								.describe(
									"Whether to display the radio selection as a drop-down box. \n* `true` - Show as a drop-down box. \n* `false` - Do not show as a drop-down box. \n\n This value defaults to `false`.",
								)
								.meta({ examples: [false] }),
							answers: z
								.array(z.string().max(200))
								.min(2)
								.optional()
								.describe(
									"The survey question's available answers. This field requires a **minimum** of two answers. \n\n* For `single` and `multiple` questions, you can only provide a maximum of 50 answers. \n* For `matching` polls, you can only provide a maximum of 16 answers. \n* For `rank_order` polls, you can only provide a maximum of seven answers.",
								),
							prompts: z
								.array(
									z.object({
										prompt_question: z
											.string()
											.max(200)
											.optional()
											.describe("The question prompt's title.")
											.meta({ examples: ["How are you?"] }),
									}),
								)
								.min(2)
								.max(10)
								.optional()
								.describe(
									"Information about the prompt questions. This field only applies to `matching` and `rank_order` questions. You **must** provide a minimum of two prompts, up to a maximum of 10 prompts.",
								),
							answer_min_character: z
								.int()
								.min(1)
								.optional()
								.describe(
									"The allowed minimum number of characters. This field only applies to `short_answer` and `long_answer` questions. You must provide at least a **one** character minimum value.",
								)
								.meta({ examples: [1] }),
							answer_max_character: z
								.int()
								.optional()
								.describe(
									"The allowed maximum number of characters. This field only applies to `short_answer` and `long_answer` questions. \n* For `short_answer` question, a maximum of 500 characters. \n* For `long_answer` question, a maximum of 2,000 characters.",
								)
								.meta({ examples: [200] }),
							rating_min_value: z
								.int()
								.min(0)
								.optional()
								.describe(
									"The rating scale's minimum value. This value can't be less than zero. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [1] }),
							rating_max_value: z
								.int()
								.max(10)
								.optional()
								.describe(
									"The rating scale's maximum value, up to a maximum value of 10. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: [4] }),
							rating_min_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The low score label used for the `rating_min_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Not likely"] }),
							rating_max_label: z
								.string()
								.max(50)
								.optional()
								.describe(
									"The high score label used for the `rating_max_value` field, up to 50 characters. \n\n This field only applies to the `rating_scale` survey.",
								)
								.meta({ examples: ["Extremely Likely"] }),
						}),
					)
					.min(1)
					.max(100)
					.optional()
					.describe("Information about the webinar survey's questions."),
			})
			.optional()
			.describe("Information about the customized webinar survey."),
		show_in_the_browser: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether the **Show in the browser when the webinar ends** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `true`.",
			)
			.meta({ examples: [true] }),
		show_in_the_follow_up_email: z
			.boolean()
			.optional()
			.default(false)
			.describe(
				"Whether the **Show the link on the follow-up email** option is enabled. \n* `true` - Enabled. \n* `false` - Disabled. \n\n This value defaults to `false`.",
			)
			.meta({ examples: [false] }),
		third_party_survey: z
			.string()
			.max(64)
			.optional()
			.describe("The link to the third party webinar survey.")
			.meta({ examples: ["https://example.com"] }),
	})
	.optional()
	.describe("Information about the webinar survey.");

export const webinarTokenPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const webinarTokenQueryTypeSchema = z
	.enum(["closed_caption_token"])
	.optional()
	.default("closed_caption_token")
	.describe(
		"The webinar token type: \n* `closed_caption_token` &mdash; The third-party closed caption API token. \n\nThis defaults to `closed_caption_token`.",
	)
	.meta({ examples: ["closed_caption_token"] });

export const webinarTokenStatus200Schema = z
	.object({
		token: z
			.string()
			.optional()
			.describe("The generated webinar token.")
			.meta({
				examples: [
					"https://example.com/closedcaption?id=200610693&ns=GZHkEA==&expire=86400&spparams=id%2Cns%2Cexpire&signature=nYtXJqRKCW",
				],
			}),
	})
	.describe("Information about the webinar token.");

export const webinarTokenStatus400Schema = z.unknown();

export const webinarTokenStatus404Schema = z.unknown();

export const webinarTokenStatus429Schema = z.unknown();

export const webinarTokenResponseSchema = webinarTokenStatus200Schema;

export const webinarTokenErrorSchema = z.union([
	webinarTokenStatus400Schema,
	webinarTokenStatus404Schema,
	webinarTokenStatus429Schema,
]);

export const getTrackingSourcesPathWebinarIdSchema = z.coerce
	.bigint()
	.describe("The webinar's ID.")
	.meta({ examples: [99289110036] });

export const getTrackingSourcesStatus200Schema = z.object({
	total_records: z
		.int()
		.optional()
		.describe("The total number of registration records for this Webinar.")
		.meta({ examples: [1] }),
	tracking_sources: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe("Unique Identifier of the tracking source.")
					.meta({ examples: ["5516482804110"] }),
				registration_count: z
					.int()
					.optional()
					.describe("Number of registrations made from this source.")
					.meta({ examples: [1] }),
				source_name: z
					.string()
					.optional()
					.describe("Name of the source (platform) where the registration URL was shared.")
					.meta({ examples: ["https://example.com"] }),
				tracking_url: z
					.string()
					.optional()
					.describe("Tracking URL. The URL that was shared for the registration.")
					.meta({
						examples: [
							"https://example.com/webinar/register/5516482804110/WN_juM2BGyLQMyQ_ZrqiGRhLg",
						],
					}),
				visitor_count: z
					.int()
					.optional()
					.describe("Number of visitors who visited the registration page from this source.")
					.meta({ examples: [1] }),
			}),
		)
		.optional()
		.describe("Tracking Sources object."),
});

export const getTrackingSourcesStatus400Schema = z.unknown();

export const getTrackingSourcesStatus404Schema = z.unknown();

export const getTrackingSourcesStatus429Schema = z.unknown();

export const getTrackingSourcesResponseSchema = getTrackingSourcesStatus200Schema;

export const getTrackingSourcesErrorSchema = z.union([
	getTrackingSourcesStatus400Schema,
	getTrackingSourcesStatus404Schema,
	getTrackingSourcesStatus429Schema,
]);
