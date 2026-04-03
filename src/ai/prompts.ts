import { PromptsEN } from './prompts/en';
import { PromptsRU } from './prompts/ru';
import type { ReadingCoachSettings } from '../settings';

export type Language = 'en' | 'ru';

export class Prompts {
	static depthCheck(sourceText: string, userNotes: string, language: Language = 'en', customPrompt?: string): string {
		// Use custom prompt if provided
		if (customPrompt && customPrompt.trim()) {
			return customPrompt
				.replace(/{sourceText}/g, sourceText)
				.replace(/{userNotes}/g, userNotes);
		}
		
		// Otherwise use default
		return language === 'ru' 
			? PromptsRU.depthCheck(sourceText, userNotes)
			: PromptsEN.depthCheck(sourceText, userNotes);
	}

	static connectionFinder(sourceText: string, userNotes: string, vaultNotes: string[], language: Language = 'en', customPrompt?: string): string {
		// Use custom prompt if provided
		if (customPrompt && customPrompt.trim()) {
			return customPrompt
				.replace(/{sourceText}/g, sourceText)
				.replace(/{userNotes}/g, userNotes)
				.replace(/{vaultNotes}/g, vaultNotes.join('\n'));
		}
		
		// Otherwise use default
		return language === 'ru'
			? PromptsRU.connectionFinder(sourceText, userNotes, vaultNotes)
			: PromptsEN.connectionFinder(sourceText, userNotes, vaultNotes);
	}

	static socraticQuestions(sourceText: string, userNotes: string, language: Language = 'en', customPrompt?: string): string {
		// Use custom prompt if provided
		if (customPrompt && customPrompt.trim()) {
			return customPrompt
				.replace(/{sourceText}/g, sourceText)
				.replace(/{userNotes}/g, userNotes);
		}
		
		// Otherwise use default
		return language === 'ru'
			? PromptsRU.socraticQuestions(sourceText, userNotes)
			: PromptsEN.socraticQuestions(sourceText, userNotes);
	}
}
