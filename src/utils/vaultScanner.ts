import { App, TFile } from 'obsidian';

export class VaultScanner {
	constructor(private app: App) {}

	async getAllNoteTitles(): Promise<string[]> {
		const files = this.app.vault.getMarkdownFiles();
		return files.map(file => file.basename);
	}

	async getAllNotes(): Promise<TFile[]> {
		return this.app.vault.getMarkdownFiles();
	}

	async getNoteContent(file: TFile): Promise<string> {
		return await this.app.vault.read(file);
	}
}
