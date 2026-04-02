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
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
		// Remove script, style, and other non-content tags
		let text = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
			.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
			.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
			.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
			.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

		// Try multiple strategies to extract main content
		let extractedText = '';

		// Strategy 1: Look for article tag
		const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
		if (articleMatch) {
			extractedText = articleMatch[1];
		}

		// Strategy 2: Look for main tag
		if (!extractedText) {
			const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
			if (mainMatch) {
				extractedText = mainMatch[1];
			}
		}

		// Strategy 3: Look for common content class names
		if (!extractedText) {
			const patterns = [
				/<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
				/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
				/<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
				/<div[^>]*class="[^"]*entry[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
				/<div[^>]*class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
				/<div[^>]*itemprop="articleBody"[^>]*>([\s\S]*?)<\/div>/i
			];

			for (const pattern of patterns) {
				const match = text.match(pattern);
				if (match && match[1].length > 200) {
					extractedText = match[1];
					break;
				}
			}
		}

		// Strategy 4: If nothing found, use body content
		if (!extractedText) {
			const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			if (bodyMatch) {
				extractedText = bodyMatch[1];
			} else {
				extractedText = text;
			}
		}

		// Clean up HTML tags and entities
		extractedText = extractedText
			.replace(/<[^>]+>/g, ' ')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&mdash;/g, '—')
			.replace(/&ndash;/g, '–')
			.replace(/&hellip;/g, '…')
			.replace(/&#\d+;/g, '')
			.replace(/&[a-z]+;/gi, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		return extractedText;
	}
}


