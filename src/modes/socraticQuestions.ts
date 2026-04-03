import { Notice, Modal, Setting } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';
import { SocraticInteractiveModal } from '../views/socraticInteractiveModal';
import { LanguageDetector } from '../utils/languageDetector';

export class SocraticQuestionsMode {
	constructor(private plugin: ReadingCoachPlugin) {}

	async execute(sourceText: string, userNotes: string): Promise<void> {
		if (!this.plugin.settings.socraticQuestionsEnabled) {
			new Notice('Socratic Questions mode is disabled in settings');
			return;
		}

		// Ask user which mode they want
		new SocraticModeSelectionModal(
			this.plugin.app,
			async (interactive: boolean) => {
				if (interactive) {
					await this.executeInteractive(sourceText, userNotes);
				} else {
					await this.executeStatic(sourceText, userNotes);
				}
			}
		).open();
	}

	private async executeStatic(sourceText: string, userNotes: string): Promise<void> {
		new Notice('Generating provocative questions...');

		// Auto-detect language from content
		const detectedLang = LanguageDetector.detectFromBoth(sourceText, userNotes);
		const lang = this.plugin.settings.promptLanguage === 'auto' 
			? detectedLang 
			: this.plugin.settings.promptLanguage;

		const provider = new AIProvider(this.plugin.settings);
		const customPrompt = lang === 'ru' 
			? this.plugin.settings.customPrompts.socraticQuestionsRU 
			: this.plugin.settings.customPrompts.socraticQuestionsEN;
		
		const prompt = Prompts.socraticQuestions(sourceText, userNotes, lang, customPrompt);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Show result in modal
		new ResultModal(this.plugin.app, 'Socratic Questions', response.content).open();
	}

	private async executeInteractive(sourceText: string, userNotes: string): Promise<void> {
		new Notice('Generating questions for interactive mode...');

		// Auto-detect language from content
		const detectedLang = LanguageDetector.detectFromBoth(sourceText, userNotes);
		const lang = this.plugin.settings.promptLanguage === 'auto' 
			? detectedLang 
			: this.plugin.settings.promptLanguage;

		const provider = new AIProvider(this.plugin.settings);
		const customPrompt = lang === 'ru' 
			? this.plugin.settings.customPrompts.socraticQuestionsRU 
			: this.plugin.settings.customPrompts.socraticQuestionsEN;
		
		const prompt = Prompts.socraticQuestions(sourceText, userNotes, lang, customPrompt);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Parse questions from response
		const questions = this.parseQuestions(response.content);

		if (questions.length === 0) {
			new Notice('Failed to parse questions. Please try again.');
			return;
		}

		// Open interactive modal
		new SocraticInteractiveModal(
			this.plugin.app,
			questions,
			sourceText,
			userNotes,
			this.plugin.settings
		).open();
	}

	private parseQuestions(content: string): string[] {
		// Try to extract numbered questions
		const lines = content.split('\n');
		const questions: string[] = [];
		let currentQuestion = '';

		for (const line of lines) {
			const trimmed = line.trim();
			
			// Check if line starts with a number (1., 2., etc.)
			if (/^\d+[\.\)]\s+/.test(trimmed)) {
				if (currentQuestion) {
					questions.push(currentQuestion.trim());
				}
				currentQuestion = trimmed.replace(/^\d+[\.\)]\s+/, '');
			} else if (currentQuestion && trimmed) {
				// Continue current question
				currentQuestion += ' ' + trimmed;
			}
		}

		// Add last question
		if (currentQuestion) {
			questions.push(currentQuestion.trim());
		}

		return questions;
	}
}

class SocraticModeSelectionModal extends Modal {
	constructor(
		app: any,
		private onSelect: (interactive: boolean) => void
	) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Select Socratic Questions Mode'});

		contentEl.createEl('p', {
			text: 'Choose how you want to receive the questions:',
			cls: 'setting-item-description'
		});

		// Static mode button
		const staticBtn = contentEl.createDiv({cls: 'socratic-mode-option'});
		staticBtn.createEl('h3', {text: '📄 Static Mode'});
		staticBtn.createEl('p', {text: 'View all questions at once without interaction'});
		const staticButton = staticBtn.createEl('button', {
			text: 'Use Static Mode',
			cls: 'mod-cta'
		});
		staticButton.addEventListener('click', () => {
			this.close();
			this.onSelect(false);
		});

		// Interactive mode button
		const interactiveBtn = contentEl.createDiv({cls: 'socratic-mode-option'});
		interactiveBtn.createEl('h3', {text: '💬 Interactive Mode'});
		interactiveBtn.createEl('p', {text: 'Answer questions one by one and receive AI evaluation with scores'});
		const interactiveButton = interactiveBtn.createEl('button', {
			text: 'Use Interactive Mode',
			cls: 'mod-cta'
		});
		interactiveButton.addEventListener('click', () => {
			this.close();
			this.onSelect(true);
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
