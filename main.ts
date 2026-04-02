import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';

interface ReadingCoachSettings {
	aiProvider: 'openai' | 'ollama' | 'deepseek' | 'openrouter';
	openaiApiKey: string;
	openaiModel: string;
	ollamaUrl: string;
	ollamaModel: string;
	deepseekApiKey: string;
	deepseekModel: string;
	openrouterApiKey: string;
	openrouterModel: string;
}

const DEFAULT_SETTINGS: ReadingCoachSettings = {
	aiProvider: 'openai',
	openaiApiKey: '',
	openaiModel: 'gpt-3.5-turbo',
	ollamaUrl: 'http://localhost:11434',
	ollamaModel: 'llama2',
	deepseekApiKey: '',
	deepseekModel: 'deepseek-chat',
	openrouterApiKey: '',
	openrouterModel: 'anthropic/claude-2'
}

export default class ReadingCoachPlugin extends Plugin {
	settings: ReadingCoachSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		this.addRibbonIcon('book-open', 'Reading Coach', () => {
			new Notice('Reading Coach activated!');
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
}

class ReadingCoachSettingTab extends PluginSettingTab {
	plugin: ReadingCoachPlugin;

	constructor(app: App, plugin: ReadingCoachPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Reading Coach Settings'});

		// AI Provider selection
		new Setting(containerEl)
			.setName('AI Provider')
			.setDesc('Choose your AI provider')
			.addDropdown(dropdown => dropdown
				.addOption('openai', 'OpenAI')
				.addOption('ollama', 'Ollama (Local)')
				.addOption('deepseek', 'DeepSeek')
				.addOption('openrouter', 'OpenRouter')
				.setValue(this.plugin.settings.aiProvider)
				.onChange(async (value: any) => {
					this.plugin.settings.aiProvider = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		// OpenAI settings
		if (this.plugin.settings.aiProvider === 'openai') {
			containerEl.createEl('h3', {text: 'OpenAI Configuration'});
			
			new Setting(containerEl)
				.setName('API Key')
				.setDesc('Enter your OpenAI API key')
				.addText(text => text
					.setPlaceholder('sk-...')
					.setValue(this.plugin.settings.openaiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openaiApiKey = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Model')
				.setDesc('OpenAI model to use')
				.addDropdown(dropdown => dropdown
					.addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
					.addOption('gpt-4', 'GPT-4')
					.addOption('gpt-4-turbo', 'GPT-4 Turbo')
					.setValue(this.plugin.settings.openaiModel)
					.onChange(async (value) => {
						this.plugin.settings.openaiModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// Ollama settings
		if (this.plugin.settings.aiProvider === 'ollama') {
			containerEl.createEl('h3', {text: 'Ollama Configuration'});
			
			new Setting(containerEl)
				.setName('Ollama URL')
				.setDesc('URL of your local Ollama instance')
				.addText(text => text
					.setPlaceholder('http://localhost:11434')
					.setValue(this.plugin.settings.ollamaUrl)
					.onChange(async (value) => {
						this.plugin.settings.ollamaUrl = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Model')
				.setDesc('Ollama model to use (e.g., llama2, mistral)')
				.addText(text => text
					.setPlaceholder('llama2')
					.setValue(this.plugin.settings.ollamaModel)
					.onChange(async (value) => {
						this.plugin.settings.ollamaModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// DeepSeek settings
		if (this.plugin.settings.aiProvider === 'deepseek') {
			containerEl.createEl('h3', {text: 'DeepSeek Configuration'});
			
			new Setting(containerEl)
				.setName('API Key')
				.setDesc('Enter your DeepSeek API key')
				.addText(text => text
					.setPlaceholder('sk-...')
					.setValue(this.plugin.settings.deepseekApiKey)
					.onChange(async (value) => {
						this.plugin.settings.deepseekApiKey = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Model')
				.setDesc('DeepSeek model to use')
				.addText(text => text
					.setPlaceholder('deepseek-chat')
					.setValue(this.plugin.settings.deepseekModel)
					.onChange(async (value) => {
						this.plugin.settings.deepseekModel = value;
						await this.plugin.saveSettings();
					}));
		}

		// OpenRouter settings
		if (this.plugin.settings.aiProvider === 'openrouter') {
			containerEl.createEl('h3', {text: 'OpenRouter Configuration'});
			
			new Setting(containerEl)
				.setName('API Key')
				.setDesc('Enter your OpenRouter API key')
				.addText(text => text
					.setPlaceholder('sk-or-...')
					.setValue(this.plugin.settings.openrouterApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openrouterApiKey = value;
						await this.plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName('Model')
				.setDesc('OpenRouter model to use')
				.addText(text => text
					.setPlaceholder('anthropic/claude-2')
					.setValue(this.plugin.settings.openrouterModel)
					.onChange(async (value) => {
						this.plugin.settings.openrouterModel = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}
