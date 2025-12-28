"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				type="button"
				className="p-2 rounded-md text-muted-foreground"
				aria-label="Toggle theme"
			>
				<Sun className="h-4 w-4" />
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className={cn(
				"p-2 rounded-md transition-colors",
				"text-muted-foreground hover:text-foreground hover:bg-accent",
			)}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
		>
			{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
