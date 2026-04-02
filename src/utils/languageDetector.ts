export class LanguageDetector {
	private static readonly CYRILLIC_PATTERN = /[\u0400-\u04FF]/;
	private static readonly LATIN_PATTERN = /[a-zA-Z]/;

	static detect(text: string): 'en' | 'ru' {
		// Count cyrillic and latin characters
		const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) || []).length;
		const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

		// If more cyrillic than latin, it's Russian
		return cyrillicCount > latinCount ? 'ru' : 'en';
	}

	static detectFromBoth(sourceText: string, userNotes: string): 'en' | 'ru' {
		const sourceLang = this.detect(sourceText);
		const notesLang = this.detect(userNotes);

		// If both are the same language, use it
		if (sourceLang === notesLang) {
			return sourceLang;
		}

		// Otherwise, prefer the language of the source text
		return sourceLang;
	}
}
