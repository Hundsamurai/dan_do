import { Notice } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';
import { VaultScanner } from '../utils/vaultScanner';

export class ConnectionFinderMode {
	constructor(private plugin: ReadingCoachPlugin) {}

	async execute(sourceText: string, userNotes: string): Promise<void> {
		if (!this.plugin.settings.connectionFinderEnabled) {
			new Notice('Connection Finder mode is disabled in settings');
			return;
		}

		new Notice('Scanning vault and finding connections...');

		// Scan vault for existing notes
		const scanner = new VaultScanner(this.plugin.app);
		const vaultNotes = await scanner.getAllNoteTitles();

		const provider = new AIProvider(this.plugin.settings);
		const lang = this.plugin.settings.promptLanguage;
		const customPrompt = lang === 'ru' 
			? this.plugin.settings.customPrompts.connectionFinderRU 
			: this.plugin.settings.customPrompts.connectionFinderEN;
		
		const prompt = Prompts.connectionFinder(sourceText, userNotes, vaultNotes, lang, customPrompt);
		
		const response = await provider.generate(prompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			return;
		}

		// Show result in modal
		new ResultModal(this.plugin.app, 'Connection Finder', response.content).open();
	}
}
