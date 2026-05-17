"use server";

export async function sendInvitationEmail(data: {
	email: string;
	organizationName: string;
	inviterName?: string;
	token: string;
	role: string;
}) {
	const resendApiKey = process.env.RESEND_API_KEY;
	if (!resendApiKey) {
		console.warn("RESEND_API_KEY not set, skipping email");
		return;
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
	const acceptUrl = `${siteUrl}/invite/${data.token}`;

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: "Photocall <noreply@photocall.app>",
			to: [data.email],
			subject: `You've been invited to ${data.organizationName} on Photocall`,
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
					<h2>You've been invited!</h2>
					<p>${data.inviterName ? `${data.inviterName} has` : "Someone has"} invited you to join <strong>${data.organizationName}</strong> on Photocall as a ${data.role}.</p>
					<p>Click the button below to accept the invitation:</p>
					<a href="${acceptUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
					<p style="color: #666; font-size: 14px; margin-top: 24px;">This invitation expires in 7 days.</p>
					<p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
				</div>
			`,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		console.error("Failed to send invitation email:", error);
	}
}
