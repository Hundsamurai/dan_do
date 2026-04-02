import { Notice } from 'obsidian';

export class TextExtractor {
	static async extractFromUrl(url: string): Promise<string> {
		// Validate URL format
		try {
			new URL(url);
		} catch {
			throw new Error('Invalid URL format');
		}

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; ReadingCoach/1.0)'
				}
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('text/html')) {
				throw new Error('URL does not point to an HTML page');
			}
			
			const html = await response.text();
			const text = this.parseHtml(html);
			
			if (!text || text.length < 100) {
				throw new Error('Could not extract meaningful text from the page');
			}
			
			return text;
		} catch (error) {
			throw new Error(`Failed to fetch article: ${error.message}`);
		}
	}

	static extractFromText(text: string): string {
		return text.trim();
	}

	private static parseHtml(html: string): string {
		// Remove script and style tags
		let text = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

		// Try to extract main content (common article containers)
		const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
		const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
		const contentMatch = text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

		if (articleMatch) {
			text = articleMatch[1];
		} else if (mainMatch) {
			text = mainMatch[1];
		} else if (contentMatch) {
			text = contentMatch[1];
		}

		// Remove remaining HTML tags
		text = text
			.replace(/<[^>]+>/g, ' ')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\s+/g, ' ')
			.trim();

		return text;
	}
}

