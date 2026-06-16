import { db, schema } from "@/lib/db";
import { BUILTIN_PRESETS } from "@/lib/layout/presets";

/**
 * Seed the built-in photobooth presets into the `presets` table. Idempotent:
 * existing rows (matched by id) are left untouched.
 */
async function seedPresets(): Promise<void> {
	for (const preset of BUILTIN_PRESETS) {
		const layout = { ...preset.layout, id: preset.id, version: 1 };

		await db
			.insert(schema.presets)
			.values({
				id: preset.id,
				name: preset.name,
				kind: preset.layout.kind,
				shotCount: preset.shotCount,
				layoutJson: JSON.stringify(layout),
			})
			.onConflictDoNothing();

		console.log(`Seeded preset: ${preset.id} (${preset.name})`);
	}

	console.log(`Done. ${BUILTIN_PRESETS.length} presets ensured.`);
}

seedPresets()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Failed to seed presets:", error);
		process.exit(1);
	});
