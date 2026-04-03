import { App, PluginSettingTab, Setting, TextAreaComponent, Modal } from 'obsidian';
import type ReadingCoachPlugin from '../main';
import { PromptsEN } from './ai/prompts/en';
import { PromptsRU } from './ai/prompts/ru';

export interface ReadingCoachSettings {
	// Prompt Language
	promptLanguage: 'en' | 'ru' | 'auto';
	
	// Custom Prompts
	customPrompts: {
		depthCheckEN: string;
		depthCheckRU: string;
		connectionFinderEN: string;
		connectionFinderRU: string;
		socraticQuestionsEN: string;
		socraticQuestionsRU: string;
	};
	
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
	socraticQuestionsEnabled: boolean;
	
	// AI Parameters
	temperature: number;
}

export const DEFAULT_SETTINGS: ReadingCoachSettings = {
	promptLanguage: 'auto',
	customPrompts: {
		depthCheckEN: '',
		depthCheckRU: '',
		connectionFinderEN: '',
		connectionFinderRU: '',
		socraticQuestionsEN: '',
		socraticQuestionsRU: ''
	},
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
	socraticQuestionsEnabled: true,
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

		// Prompt Language selection
		new Setting(containerEl)
			.setName('Prompt Language')
			.setDesc('Language for AI prompts (Auto detects from content)')
			.addDropdown(dropdown => dropdown
				.addOption('auto', 'Auto-detect')
				.addOption('en', 'English')
				.addOption('ru', 'Русский')
				.setValue(this.plugin.settings.promptLanguage)
				.onChange(async (value: any) => {
					this.plugin.settings.promptLanguage = value;
					await this.plugin.saveSettings();
				}));

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

		new Setting(containerEl)
			.setName('Socratic Questions')
			.setDesc('Generate provocative questions that challenge assumptions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.socraticQuestionsEnabled)
				.onChange(async (value) => {
					this.plugin.settings.socraticQuestionsEnabled = value;
					await this.plugin.saveSettings();
				}));

		// Custom Prompts
		containerEl.createEl('h3', {text: 'Custom Prompts'});
		containerEl.createEl('p', {
			text: 'Customize AI prompts for each mode. Leave empty to use defaults. Use {sourceText}, {userNotes}, and {vaultNotes} as placeholders.',
			cls: 'setting-item-description'
		});

		// Depth Check EN
		new Setting(containerEl)
			.setName('Depth Check Prompt (English)')
			.setDesc('Custom prompt for Depth Check mode in English')
			.addTextArea(text => {
				text
					.setPlaceholder('Leave empty for default prompt')
					.setValue(this.plugin.settings.customPrompts.depthCheckEN)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.depthCheckEN = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		// Show default button
		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default EN Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsEN.depthCheck('{sourceText}', '{userNotes}');
					new PromptPreviewModal(this.app, 'Default Depth Check Prompt (EN)', defaultPrompt).open();
				}));

		// Depth Check RU
		new Setting(containerEl)
			.setName('Depth Check Prompt (Russian)')
			.setDesc('Custom prompt for Depth Check mode in Russian')
			.addTextArea(text => {
				text
					.setPlaceholder('Оставьте пустым для промпта по умолчанию')
					.setValue(this.plugin.settings.customPrompts.depthCheckRU)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.depthCheckRU = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default RU Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsRU.depthCheck('{sourceText}', '{userNotes}');
					new PromptPreviewModal(this.app, 'Default Depth Check Prompt (RU)', defaultPrompt).open();
				}));

		// Connection Finder EN
		new Setting(containerEl)
			.setName('Connection Finder Prompt (English)')
			.setDesc('Custom prompt for Connection Finder mode in English')
			.addTextArea(text => {
				text
					.setPlaceholder('Leave empty for default prompt')
					.setValue(this.plugin.settings.customPrompts.connectionFinderEN)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.connectionFinderEN = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default EN Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsEN.connectionFinder('{sourceText}', '{userNotes}', ['{vaultNotes}']);
					new PromptPreviewModal(this.app, 'Default Connection Finder Prompt (EN)', defaultPrompt).open();
				}));

		// Connection Finder RU
		new Setting(containerEl)
			.setName('Connection Finder Prompt (Russian)')
			.setDesc('Custom prompt for Connection Finder mode in Russian')
			.addTextArea(text => {
				text
					.setPlaceholder('Оставьте пустым для промпта по умолчанию')
					.setValue(this.plugin.settings.customPrompts.connectionFinderRU)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.connectionFinderRU = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default RU Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsRU.connectionFinder('{sourceText}', '{userNotes}', ['{vaultNotes}']);
					new PromptPreviewModal(this.app, 'Default Connection Finder Prompt (RU)', defaultPrompt).open();
				}));

		// Socratic Questions EN
		new Setting(containerEl)
			.setName('Socratic Questions Prompt (English)')
			.setDesc('Custom prompt for Socratic Questions mode in English')
			.addTextArea(text => {
				text
					.setPlaceholder('Leave empty for default prompt')
					.setValue(this.plugin.settings.customPrompts.socraticQuestionsEN)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.socraticQuestionsEN = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default EN Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsEN.socraticQuestions('{sourceText}', '{userNotes}');
					new PromptPreviewModal(this.app, 'Default Socratic Questions Prompt (EN)', defaultPrompt).open();
				}));

		// Socratic Questions RU
		new Setting(containerEl)
			.setName('Socratic Questions Prompt (Russian)')
			.setDesc('Custom prompt for Socratic Questions mode in Russian')
			.addTextArea(text => {
				text
					.setPlaceholder('Оставьте пустым для промпта по умолчанию')
					.setValue(this.plugin.settings.customPrompts.socraticQuestionsRU)
					.onChange(async (value) => {
						this.plugin.settings.customPrompts.socraticQuestionsRU = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.cols = 50;
			});

		new Setting(containerEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Show Default RU Prompt')
				.onClick(() => {
					const defaultPrompt = PromptsRU.socraticQuestions('{sourceText}', '{userNotes}');
					new PromptPreviewModal(this.app, 'Default Socratic Questions Prompt (RU)', defaultPrompt).open();
				}));
	}
}

class PromptPreviewModal extends Modal {
	constructor(app: App, private title: string, private content: string) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: this.title});
		
		const pre = contentEl.createEl('pre', {
			text: this.content,
			cls: 'reading-coach-prompt-preview'
		});
		pre.style.whiteSpace = 'pre-wrap';
		pre.style.maxHeight = '400px';
		pre.style.overflow = 'auto';
		pre.style.padding = '1em';
		pre.style.backgroundColor = 'var(--background-secondary)';
		pre.style.borderRadius = '4px';
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
