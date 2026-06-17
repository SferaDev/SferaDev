/**
 * Cross-compile the print bridge into single-file executables for every target
 * platform with `bun build --compile`. Output goes to `dist/print-bridge-<target>`
 * (with `.exe` on Windows).
 *
 * Run all targets:        bun run build:bin
 * Run a subset:           bun run build:bin bun-darwin-arm64 bun-linux-x64
 *
 * Cross-compilation downloads the target's Bun runtime on first use, so the
 * non-host targets need network access.
 */

const ENTRYPOINT = "src/server.ts";
const OUTDIR = "dist";

/** Targets accepted by `bun build --compile --target=…`. */
const TARGETS = [
	"bun-darwin-arm64",
	"bun-darwin-x64",
	"bun-linux-x64",
	"bun-linux-arm64",
	"bun-windows-x64",
] as const;

type Target = (typeof TARGETS)[number];

function outfileFor(target: Target): string {
	const suffix = target.includes("windows") ? ".exe" : "";
	return `${OUTDIR}/print-bridge-${target}${suffix}`;
}

async function build(target: Target): Promise<boolean> {
	const outfile = outfileFor(target);
	console.log(`\n▶ Building ${target} → ${outfile}`);
	const proc = Bun.spawn(
		["bun", "build", "--compile", `--target=${target}`, ENTRYPOINT, "--outfile", outfile],
		{ stdout: "inherit", stderr: "inherit" },
	);
	const code = await proc.exited;
	if (code !== 0) {
		console.error(`✖ Failed to build ${target} (exit ${code})`);
		return false;
	}
	console.log(`✔ Built ${outfile}`);
	return true;
}

async function main(): Promise<void> {
	const requested = Bun.argv.slice(2);
	const selected: Target[] =
		requested.length > 0 ? TARGETS.filter((target) => requested.includes(target)) : [...TARGETS];

	if (selected.length === 0) {
		console.error(`No matching targets. Available: ${TARGETS.join(", ")}`);
		process.exit(1);
	}

	let allOk = true;
	for (const target of selected) {
		const ok = await build(target);
		allOk = allOk && ok;
	}

	if (!allOk) process.exit(1);
	console.log(`\nAll done. Binaries in ${OUTDIR}/`);
}

await main();

export {};
