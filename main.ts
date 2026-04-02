import { App, Plugin, Notice, MarkdownView } from 'obsidian';
import { ReadingCoachSettings, DEFAULT_SETTINGS, ReadingCoachSettingTab } from './src/settings';
import { DepthCheckMode } from './src/modes/depthCheck';
import { ConnectionFinderMode } from './src/modes/connectionFinder';
import { SourceInputModal } from './src/views/sourceInputModal';

export default class ReadingCoachPlugin extends Plugin {
	settings: ReadingCoachSettings;
	depthCheckMode: DepthCheckMode;
	connectionFinderMode: ConnectionFinderMode;

	async onload() {
		await this.loadSettings();

		// Initialize modes
		this.depthCheckMode = new DepthCheckMode(this);
		this.connectionFinderMode = new ConnectionFinderMode(this);

		// Add ribbon icon
		this.addRibbonIcon('book-open', 'Reading Coach', () => {
			new Notice('Reading Coach: Use command palette to select a mode');
		});

		// Command: Depth Check
		this.addCommand({
			id: 'depth-check',
			name: 'Reading Coach: Depth Check',
			callback: async () => {
				await this.runDepthCheck();
			}
		});

		// Command: Connection Finder
		this.addCommand({
			id: 'connection-finder',
			name: 'Reading Coach: Connection Finder',
			callback: async () => {
				await this.runConnectionFinder();
			}
		});

		// Add settings tab
		this.addSettingTab(new ReadingCoachSettingTab(this.app, this));

		console.log('Reading Coach plugin loaded');
	}

	onunload() {
		console.log('Reading Coach plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async runDepthCheck() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('Please open a note first');
			return;
		}

		const userNotes = activeView.editor.getValue();
		if (!userNotes) {
			new Notice('Current note is empty');
			return;
		}

		// Prompt for source material
		new SourceInputModal(this.app, async (sourceText: string) => {
			await this.depthCheckMode.execute(sourceText, userNotes);
		}).open();
	}

	private async runConnectionFinder() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (!activeView) {
			new Notice('Please open a note first');
			return;
		}

		const userNotes = activeView.editor.getValue();
		if (!userNotes) {
			new Notice('Current note is empty');
			return;
		}

		// Prompt for source material
		new SourceInputModal(this.app, async (sourceText: string) => {
			await this.connectionFinderMode.execute(sourceText, userNotes);
		}).open();
	}
}
