/** Values substituted into text-layer token placeholders. */
export interface LayoutTokens {
	coupleNames?: string;
	date?: string;
	eventName?: string;
}

/**
 * Replace {coupleNames} {date} {eventName} tokens in a template string. Missing
 * tokens resolve to an empty string.
 */
export function resolveTokens(template: string, tokens: LayoutTokens): string {
	return template
		.replaceAll("{coupleNames}", tokens.coupleNames ?? "")
		.replaceAll("{date}", tokens.date ?? "")
		.replaceAll("{eventName}", tokens.eventName ?? "");
}
