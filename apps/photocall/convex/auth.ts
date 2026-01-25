import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Password,
		GitHub,
		Google,
		Resend({
			from: process.env.AUTH_EMAIL_FROM ?? "noreply@example.com",
		}),
	],
});
