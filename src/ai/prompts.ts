import { PromptsEN } from './prompts/en';
import { PromptsRU } from './prompts/ru';

export type Language = 'en' | 'ru';

export class Prompts {
	static depthCheck(sourceText: string, userNotes: string, language: Language = 'en'): string {
		return language === 'ru' 
			? PromptsRU.depthCheck(sourceText, userNotes)
			: PromptsEN.depthCheck(sourceText, userNotes);
	}

	static connectionFinder(sourceText: string, userNotes: string, vaultNotes: string[], language: Language = 'en'): string {
		return language === 'ru'
			? PromptsRU.connectionFinder(sourceText, userNotes, vaultNotes)
			: PromptsEN.connectionFinder(sourceText, userNotes, vaultNotes);
	}
}
