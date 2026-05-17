import { Camera } from "lucide-react";

export default function KioskLoading() {
	return (
		<div
			className="flex min-h-screen items-center justify-center bg-black text-white"
			role="status"
			aria-label="Loading kiosk"
		>
			<div className="flex flex-col items-center gap-4">
				<Camera className="h-12 w-12 animate-pulse" aria-hidden="true" />
				<span className="text-sm text-white/70">Getting things ready…</span>
			</div>
		</div>
	);
}
