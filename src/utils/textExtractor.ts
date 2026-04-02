import { Notice, requestUrl } from 'obsidian';

export class TextExtractor {
	static async extractFromUrl(url: string): Promise<string> {
		console.log('[TextExtractor] Starting extraction from URL:', url);
		
		// Validate URL format
		try {
			new URL(url);
			console.log('[TextExtractor] URL format is valid');
		} catch (error) {
			console.error('[TextExtractor] Invalid URL format:', error);
			throw new Error('Invalid URL format');
		}

		try {
			console.log('[TextExtractor] Fetching URL with requestUrl...');
			const response = await requestUrl({
				url: url,
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			});
			
			console.log('[TextExtractor] Response status:', response.status);
			
			if (response.status !== 200) {
				throw new Error(`HTTP ${response.status}`);
			}
			
			const contentType = response.headers['content-type'] || '';
			console.log('[TextExtractor] Content-Type:', contentType);
			
			if (!contentType.includes('text/html')) {
				console.warn('[TextExtractor] Content-Type is not HTML, but continuing...');
			}
			
			console.log('[TextExtractor] Fetching HTML content...');
			const html = response.text;
			console.log('[TextExtractor] HTML length:', html.length);
			
			console.log('[TextExtractor] Parsing HTML...');
			const text = this.parseHtml(html);
			console.log('[TextExtractor] Extracted text length:', text.length);
			
			if (!text || text.length < 100) {
				console.error('[TextExtractor] Extracted text too short:', text.length);
				throw new Error('Could not extract meaningful text from the page');
			}
			
			console.log('[TextExtractor] Successfully extracted text');
			return text;
		} catch (error) {
			console.error('[TextExtractor] Error during extraction:', error);
			throw new Error(`Failed to fetch article: ${error.message}`);
		}
	}

	static extractFromText(text: string): string {
		console.log('[TextExtractor] Extracting from direct text, length:', text.length);
		return text.trim();
	}

	private static parseHtml(html: string): string {
		console.log('[TextExtractor] Starting HTML parsing...');
		
		// Remove script, style, and other non-content tags
		let text = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
			.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
			.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
			.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
			.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

		console.log('[TextExtractor] After removing non-content tags, length:', text.length);

		// Try multiple strategies to extract main content
		let extractedText = '';
		let strategy = 'none';

		// Strategy 1: Look for article tag
		const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
		if (articleMatch) {
			extractedText = articleMatch[1];
			strategy = 'article tag';
		}

		// Strategy 2: Look for main tag
		if (!extractedText) {
			const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
			if (mainMatch) {
				extractedText = mainMatch[1];
				strategy = 'main tag';
			}
		}

		// Strategy 3: Look for common content class names
		if (!extractedText) {
			const patterns = [
				{ name: 'article class', regex: /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i },
				{ name: 'content class', regex: /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i },
				{ name: 'post class', regex: /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i },
				{ name: 'entry class', regex: /<div[^>]*class="[^"]*entry[^"]*"[^>]*>([\s\S]*?)<\/div>/i },
				{ name: 'text class', regex: /<div[^>]*class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/i },
				{ name: 'articleBody itemprop', regex: /<div[^>]*itemprop="articleBody"[^>]*>([\s\S]*?)<\/div>/i }
			];

			for (const pattern of patterns) {
				const match = text.match(pattern.regex);
				if (match && match[1].length > 200) {
					extractedText = match[1];
					strategy = pattern.name;
					break;
				}
			}
		}

		// Strategy 4: If nothing found, use body content
		if (!extractedText) {
			const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			if (bodyMatch) {
				extractedText = bodyMatch[1];
				strategy = 'body tag';
			} else {
				extractedText = text;
				strategy = 'full html';
			}
		}

		console.log('[TextExtractor] Used strategy:', strategy);
		console.log('[TextExtractor] Extracted content length before cleaning:', extractedText.length);

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

		console.log('[TextExtractor] Final cleaned text length:', extractedText.length);
		console.log('[TextExtractor] First 200 chars:', extractedText.substring(0, 200));

		return extractedText;
	}
}
