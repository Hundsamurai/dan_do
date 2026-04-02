import { Notice } from 'obsidian';

interface TranscriptItem {
	text: string;
	start: number;
	duration: number;
}

export class YouTubeTranscript {
	private static readonly YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

	static extractVideoId(url: string): string | null {
		console.log('[YouTubeTranscript] Extracting video ID from:', url);
		const match = url.match(this.YOUTUBE_REGEX);
		const videoId = match ? match[1] : null;
		console.log('[YouTubeTranscript] Extracted video ID:', videoId);
		return videoId;
	}

	static isYouTubeUrl(url: string): boolean {
		const isYT = this.YOUTUBE_REGEX.test(url);
		console.log('[YouTubeTranscript] Is YouTube URL:', isYT, 'for', url);
		return isYT;
	}

	static async fetchTranscript(videoId: string, lang: string = 'en'): Promise<string> {
		console.log('[YouTubeTranscript] Fetching transcript for video:', videoId, 'language:', lang);
		
		try {
			// Fetch video page to get transcript data
			console.log('[YouTubeTranscript] Fetching video page...');
			const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
			
			console.log('[YouTubeTranscript] Video page response status:', videoPageResponse.status);
			
			if (!videoPageResponse.ok) {
				throw new Error('Failed to fetch video page');
			}

			const videoPageHtml = await videoPageResponse.text();
			console.log('[YouTubeTranscript] Video page HTML length:', videoPageHtml.length);

			// Extract captions URL from page
			console.log('[YouTubeTranscript] Looking for captions data...');
			const captionsMatch = videoPageHtml.match(/"captions":\s*({[^}]+})/);
			if (!captionsMatch) {
				console.error('[YouTubeTranscript] No captions found in page');
				throw new Error('No captions available for this video');
			}
			console.log('[YouTubeTranscript] Found captions data');

			// Try to find transcript in the page data
			console.log('[YouTubeTranscript] Looking for captionTracks...');
			const transcriptMatch = videoPageHtml.match(/"captionTracks":\s*(\[[^\]]+\])/);
			if (!transcriptMatch) {
				console.error('[YouTubeTranscript] Could not find captionTracks');
				throw new Error('Could not find transcript data');
			}
			console.log('[YouTubeTranscript] Found captionTracks:', transcriptMatch[1].substring(0, 200));

			let captionTracks;
			try {
				captionTracks = JSON.parse(transcriptMatch[1]);
				console.log('[YouTubeTranscript] Parsed caption tracks, count:', captionTracks.length);
				console.log('[YouTubeTranscript] Available languages:', captionTracks.map((t: any) => t.languageCode).join(', '));
			} catch (error) {
				console.error('[YouTubeTranscript] Failed to parse caption tracks:', error);
				throw new Error('Failed to parse caption tracks');
			}

			// Find the right language track (prefer exact match, fallback to first available)
			let captionTrack = captionTracks.find((track: any) => 
				track.languageCode === lang || track.languageCode?.startsWith(lang)
			);

			if (!captionTrack && captionTracks.length > 0) {
				captionTrack = captionTracks[0]; // Use first available
				console.log('[YouTubeTranscript] Using first available track:', captionTrack.languageCode);
			}

			if (!captionTrack || !captionTrack.baseUrl) {
				console.error('[YouTubeTranscript] No suitable caption track found');
				throw new Error('No suitable caption track found');
			}

			console.log('[YouTubeTranscript] Selected caption track:', captionTrack.languageCode);
			console.log('[YouTubeTranscript] Caption URL:', captionTrack.baseUrl.substring(0, 100));

			// Fetch the actual transcript
			console.log('[YouTubeTranscript] Fetching transcript XML...');
			const transcriptResponse = await fetch(captionTrack.baseUrl);
			console.log('[YouTubeTranscript] Transcript response status:', transcriptResponse.status);
			
			if (!transcriptResponse.ok) {
				throw new Error('Failed to fetch transcript');
			}

			const transcriptXml = await transcriptResponse.text();
			console.log('[YouTubeTranscript] Transcript XML length:', transcriptXml.length);
			console.log('[YouTubeTranscript] First 500 chars of XML:', transcriptXml.substring(0, 500));
			
			console.log('[YouTubeTranscript] Parsing transcript XML...');
			const transcript = this.parseTranscriptXml(transcriptXml);
			console.log('[YouTubeTranscript] Final transcript length:', transcript.length);

			return transcript;
		} catch (error) {
			console.error('[YouTubeTranscript] Error during fetch:', error);
			throw new Error(`YouTube transcript error: ${error.message}`);
		}
	}

	private static parseTranscriptXml(xml: string): string {
		console.log('[YouTubeTranscript] Parsing XML transcript...');
		
		// Extract text elements from XML
		const textMatches = xml.matchAll(/<text[^>]*start="([^"]*)"[^>]*>(.*?)<\/text>/g);
		
		const lines: string[] = [];
		let count = 0;
		
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
				count++;
			}
		}

		console.log('[YouTubeTranscript] Parsed', count, 'text segments');
		const result = lines.join(' ');
		console.log('[YouTubeTranscript] Combined transcript length:', result.length);
		
		return result;
	}

	static async getTranscriptFromUrl(url: string): Promise<string> {
		console.log('[YouTubeTranscript] Getting transcript from URL:', url);
		
		const videoId = this.extractVideoId(url);
		
		if (!videoId) {
			console.error('[YouTubeTranscript] Could not extract video ID');
			throw new Error('Invalid YouTube URL');
		}

		// Try multiple languages
		const languages = ['en', 'ru', 'auto'];
		console.log('[YouTubeTranscript] Will try languages:', languages.join(', '));
		
		for (const lang of languages) {
			try {
				console.log('[YouTubeTranscript] Attempting language:', lang);
				const result = await this.fetchTranscript(videoId, lang);
				console.log('[YouTubeTranscript] Success with language:', lang);
				return result;
			} catch (error) {
				console.log('[YouTubeTranscript] Failed with language:', lang, 'Error:', error.message);
				// Try next language
				continue;
			}
		}

		console.error('[YouTubeTranscript] All language attempts failed');
		throw new Error('Could not fetch transcript in any language');
	}
}
