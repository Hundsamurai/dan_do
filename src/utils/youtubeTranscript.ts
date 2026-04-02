import { Notice } from 'obsidian';

interface TranscriptItem {
	text: string;
	start: number;
	duration: number;
}

export class YouTubeTranscript {
	private static readonly YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

	static extractVideoId(url: string): string | null {
		const match = url.match(this.YOUTUBE_REGEX);
		return match ? match[1] : null;
	}

	static isYouTubeUrl(url: string): boolean {
		return this.YOUTUBE_REGEX.test(url);
	}

	static async fetchTranscript(videoId: string, lang: string = 'en'): Promise<string> {
		try {
			// Fetch video page to get transcript data
			const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
			
			if (!videoPageResponse.ok) {
				throw new Error('Failed to fetch video page');
			}

			const videoPageHtml = await videoPageResponse.text();

			// Extract captions URL from page
			const captionsMatch = videoPageHtml.match(/"captions":\s*({[^}]+})/);
			if (!captionsMatch) {
				throw new Error('No captions available for this video');
			}

			// Try to find transcript in the page data
			const transcriptMatch = videoPageHtml.match(/"captionTracks":\s*(\[[^\]]+\])/);
			if (!transcriptMatch) {
				throw new Error('Could not find transcript data');
			}

			let captionTracks;
			try {
				captionTracks = JSON.parse(transcriptMatch[1]);
			} catch {
				throw new Error('Failed to parse caption tracks');
			}

			// Find the right language track (prefer exact match, fallback to first available)
			let captionTrack = captionTracks.find((track: any) => 
				track.languageCode === lang || track.languageCode?.startsWith(lang)
			);

			if (!captionTrack && captionTracks.length > 0) {
				captionTrack = captionTracks[0]; // Use first available
			}

			if (!captionTrack || !captionTrack.baseUrl) {
				throw new Error('No suitable caption track found');
			}

			// Fetch the actual transcript
			const transcriptResponse = await fetch(captionTrack.baseUrl);
			if (!transcriptResponse.ok) {
				throw new Error('Failed to fetch transcript');
			}

			const transcriptXml = await transcriptResponse.text();
			const transcript = this.parseTranscriptXml(transcriptXml);

			return transcript;
		} catch (error) {
			throw new Error(`YouTube transcript error: ${error.message}`);
		}
	}

	private static parseTranscriptXml(xml: string): string {
		// Extract text elements from XML
		const textMatches = xml.matchAll(/<text[^>]*start="([^"]*)"[^>]*>(.*?)<\/text>/g);
		
		const lines: string[] = [];
		for (const match of textMatches) {
			const text = match[2]
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/\n/g, ' ')
				.trim();
			
			if (text) {
				lines.push(text);
			}
		}

		return lines.join(' ');
	}

	static async getTranscriptFromUrl(url: string): Promise<string> {
		const videoId = this.extractVideoId(url);
		
		if (!videoId) {
			throw new Error('Invalid YouTube URL');
		}

		// Try multiple languages
		const languages = ['en', 'ru', 'auto'];
		
		for (const lang of languages) {
			try {
				return await this.fetchTranscript(videoId, lang);
			} catch (error) {
				// Try next language
				continue;
			}
		}

		throw new Error('Could not fetch transcript in any language');
	}
}
