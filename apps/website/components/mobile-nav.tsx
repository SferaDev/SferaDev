"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavigationItem } from "@/lib/navigation";

interface MobileNavProps {
	items: readonly NavigationItem[];
}

/**
 * Navigation for viewports too narrow for the inline links, which are hidden
 * below `sm`. A disclosure rather than a modal dialog: the panel sits under the
 * header and never traps focus, so it needs no scroll lock and no focus trap.
 */
export function MobileNav({ items }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	const containerRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	// A link to the current page does not remount the header, so close on navigation.
	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!open) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		const onPointerDown = (event: PointerEvent) => {
			if (!(event.target instanceof Node)) return;
			if (!containerRef.current?.contains(event.target)) setOpen(false);
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="sm:hidden">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				aria-label={open ? "Close menu" : "Open menu"}
				onClick={() => setOpen((wasOpen) => !wasOpen)}
				className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
			>
				{open ? (
					<X className="size-5" aria-hidden="true" />
				) : (
					<Menu className="size-5" aria-hidden="true" />
				)}
			</button>

			<div
				id={panelId}
				hidden={!open}
				className="absolute inset-x-0 top-16 border-border border-b bg-background/95 backdrop-blur-xl"
			>
				<nav
					aria-label="Main"
					className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-3 font-medium text-sm"
				>
					{items.map(({ href, label, prefetch }) => (
						<Link
							key={href}
							href={href}
							prefetch={prefetch}
							onClick={() => setOpen(false)}
							className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							{label}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
