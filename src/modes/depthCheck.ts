import { Notice } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';
import { translations } from '../i18n/translations';

export class DepthCheckMode {
	constructor(private plugin: ReadingCoachPlugin) {}

	async execute(sourceText: string, userNotes: string): Promise<void> {
		const t = translations[this.plugin.settings.language];
		
		if (!this.plugin.settings.depthCheckEnabled) {
			new Notice(t.modeDisabled);
			return;
		}

		new Notice(t.analyzingDepth);

		const provider = new AIProvider(this.plugin.settings);
		const prompt = Prompts.depthCheck(sourceText, userNotes, this.plugin.settings.language);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Show result in modal
		new ResultModal(this.plugin.app, t.depthCheckTitle, response.content).open();
	}
}
