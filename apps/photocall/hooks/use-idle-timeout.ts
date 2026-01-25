"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseIdleTimeoutOptions {
	timeout: number; // in seconds
	onIdle: () => void;
	enabled?: boolean;
}

export function useIdleTimeout({ timeout, onIdle, enabled = true }: UseIdleTimeoutOptions) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const resetTimer = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		if (enabled && timeout > 0) {
			timeoutRef.current = setTimeout(() => {
				onIdle();
			}, timeout * 1000);
		}
	}, [timeout, onIdle, enabled]);

	useEffect(() => {
		if (!enabled) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			return;
		}

		const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];

		const handleActivity = () => {
			resetTimer();
		};

		// Start the timer
		resetTimer();

		// Add event listeners
		events.forEach((event) => {
			document.addEventListener(event, handleActivity);
		});

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			events.forEach((event) => {
				document.removeEventListener(event, handleActivity);
			});
		};
	}, [enabled, resetTimer]);

	return { resetTimer };
}
