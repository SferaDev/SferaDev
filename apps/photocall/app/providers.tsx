"use client";

import { type ReactNode, useState } from "react";
import { SWRConfig } from "swr";
import { createPersistentCache } from "@/lib/swr-cache";

export function Providers({ children }: { children: ReactNode }) {
	// Build the persistent cache once per client session.
	const [provider] = useState(() => {
		const cache = createPersistentCache();
		return () => cache;
	});

	return (
		<SWRConfig
			value={{
				revalidateOnFocus: false,
				dedupingInterval: 2000,
				keepPreviousData: true,
				provider,
			}}
		>
			{children}
		</SWRConfig>
	);
}
