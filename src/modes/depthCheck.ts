import { Notice } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';

export class DepthCheckMode {
	constructor(private plugin: ReadingCoachPlugin) {}

	async execute(sourceText: string, userNotes: string): Promise<void> {
		if (!this.plugin.settings.depthCheckEnabled) {
			new Notice('Depth Check mode is disabled in settings');
			return;
		}

		new Notice('Analyzing depth of understanding...');

		const provider = new AIProvider(this.plugin.settings);
		const lang = this.plugin.settings.promptLanguage;
		const customPrompt = lang === 'ru' 
			? this.plugin.settings.customPrompts.depthCheckRU 
			: this.plugin.settings.customPrompts.depthCheckEN;
		
		const prompt = Prompts.depthCheck(sourceText, userNotes, lang, customPrompt);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Show result in modal
		new ResultModal(this.plugin.app, 'Depth Check Analysis', response.content).open();
	}
}
