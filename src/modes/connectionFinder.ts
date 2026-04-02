import { Notice } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';
import { VaultScanner } from '../utils/vaultScanner';
import { translations } from '../i18n/translations';

export class ConnectionFinderMode {
	constructor(private plugin: ReadingCoachPlugin) {}

	async execute(sourceText: string, userNotes: string): Promise<void> {
		const t = translations[this.plugin.settings.language];
		
		if (!this.plugin.settings.connectionFinderEnabled) {
			new Notice(t.modeDisabled);
			return;
		}

		new Notice(t.scanningVault);

		// Scan vault for existing notes
		const scanner = new VaultScanner(this.plugin.app);
		const vaultNotes = await scanner.getAllNoteTitles();

		const provider = new AIProvider(this.plugin.settings);
		const prompt = Prompts.connectionFinder(sourceText, userNotes, vaultNotes, this.plugin.settings.language);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Show result in modal
		new ResultModal(this.plugin.app, t.connectionFinderTitle, response.content).open();
	}
}
