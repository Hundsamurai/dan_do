import { App, PluginSettingTab, Setting } from 'obsidian';
import type ReadingCoachPlugin from '../main';

export interface ReadingCoachSettings {
	// AI Provider
	aiProvider: 'openai' | 'ollama' | 'deepseek' | 'openrouter';
	
	// OpenAI
	openaiApiKey: string;
	openaiModel: string;
	
	// Ollama
	ollamaUrl: string;
	ollamaModel: string;
	
	// DeepSeek
	deepseekApiKey: string;
	deepseekModel: string;
	
	// OpenRouter
	openrouterApiKey: string;
	openrouterModel: string;
	
	// Modes
	depthCheckEnabled: boolean;
	connectionFinderEnabled: boolean;
	
	// AI Parameters
	temperature: number;
}

export const DEFAULT_SETTINGS: ReadingCoachSettings = {
	aiProvider: 'openai',
	openaiApiKey: '',
	openaiModel: 'gpt-3.5-turbo',
	ollamaUrl: 'http://localhost:11434',
	ollamaModel: 'llama2',
	deepseekApiKey: '',
	deepseekModel: 'deepseek-chat',
	openrouterApiKey: '',
	openrouterModel: 'anthropic/claude-2',
	depthCheckEnabled: true,
	connectionFinderEnabled: true,
	temperature: 0.7
}

export class ReadingCoachSettingTab extends PluginSettingTab {
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

		// AI Parameters
		containerEl.createEl('h3', {text: 'AI Parameters'});
		
		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Controls randomness (0.0 = focused, 1.0 = creative)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		// Modes
		containerEl.createEl('h3', {text: 'Enabled Modes'});
		
		new Setting(containerEl)
			.setName('Depth Check')
			.setDesc('Analyze understanding depth of your notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.depthCheckEnabled)
				.onChange(async (value) => {
					this.plugin.settings.depthCheckEnabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Connection Finder')
			.setDesc('Find connections between notes in your vault')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.connectionFinderEnabled)
				.onChange(async (value) => {
					this.plugin.settings.connectionFinderEnabled = value;
					await this.plugin.saveSettings();
				}));
	}
}
