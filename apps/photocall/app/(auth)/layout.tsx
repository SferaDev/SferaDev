import { Camera } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			{/* Left side - Branding */}
			<div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
				<Link href="/" className="flex items-center gap-2">
					<Camera className="h-8 w-8" />
					<span className="text-xl font-bold">Photocall</span>
				</Link>
				<div className="space-y-4">
					<blockquote className="text-lg">
						&ldquo;Photocall transformed our wedding reception. Our guests loved capturing moments
						and the instant sharing feature was a hit!&rdquo;
					</blockquote>
					<p className="text-sm opacity-80">— Sarah & John, Wedding 2024</p>
				</div>
				<p className="text-sm opacity-60">Create memorable photo experiences for any event</p>
			</div>

			{/* Right side - Auth form */}
			<div className="flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-6">
					<div className="lg:hidden flex justify-center mb-8">
						<Link href="/" className="flex items-center gap-2">
							<Camera className="h-8 w-8" />
							<span className="text-xl font-bold">Photocall</span>
						</Link>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
