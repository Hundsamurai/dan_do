import { Notice } from 'obsidian';

export class TextExtractor {
	static async extractFromUrl(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch URL: ${response.statusText}`);
			}
			
			const html = await response.text();
			
			// Basic HTML to text conversion
			const text = html
				.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
				.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			
			return text;
		} catch (error) {
			new Notice(`Error extracting text from URL: ${error.message}`);
			throw error;
		}
	}

	static extractFromText(text: string): string {
		return text.trim();
	}
}
