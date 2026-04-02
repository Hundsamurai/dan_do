import { App, Modal, Setting, TextAreaComponent, Notice } from 'obsidian';
import { TextExtractor } from '../utils/textExtractor';

export class SourceInputModal extends Modal {
	private urlInput: string = '';
	private textInput: string = '';
	private onSubmit: (sourceText: string) => void;

	constructor(app: App, onSubmit: (sourceText: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Source Material'});
		contentEl.createEl('p', {
			text: 'Enter a URL to an article or paste the source text directly.',
			cls: 'setting-item-description'
		});

		// URL input
		new Setting(contentEl)
			.setName('Article URL')
			.setDesc('Enter URL to fetch and parse article text')
			.addText(text => text
				.setPlaceholder('https://example.com/article')
				.setValue(this.urlInput)
				.onChange((value) => {
					this.urlInput = value;
				}));

		// OR divider
		contentEl.createEl('div', {
			text: '— OR —',
			cls: 'reading-coach-divider'
		}).style.textAlign = 'center';
		contentEl.style.margin = '1em 0';

		// Direct text input
		new Setting(contentEl)
			.setName('Source Text')
			.setDesc('Paste the source text directly')
			.addTextArea(text => {
				text
					.setPlaceholder('Paste source text here...')
					.setValue(this.textInput)
					.onChange((value) => {
						this.textInput = value;
					});
				text.inputEl.rows = 10;
				text.inputEl.style.width = '100%';
			});

		// Buttons
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}))
			.addButton(btn => btn
				.setButtonText('Analyze')
				.setCta()
				.onClick(async () => {
					await this.handleSubmit();
				}));
	}

	private async handleSubmit() {
		// Check if URL is provided
		if (this.urlInput.trim()) {
			new Notice('Fetching article from URL...');
			
			try {
				const sourceText = await TextExtractor.extractFromUrl(this.urlInput.trim());
				
				if (!sourceText || sourceText.length < 100) {
					new Notice('Failed to extract meaningful text from URL. Please check the URL or paste text directly.');
					return;
				}

				new Notice(`✓ Successfully extracted ${sourceText.length} characters`);
				this.close();
				this.onSubmit(sourceText);
			} catch (error) {
				new Notice(`Error fetching URL: ${error.message}`);
			}
		}
		// Check if direct text is provided
		else if (this.textInput.trim()) {
			const sourceText = TextExtractor.extractFromText(this.textInput.trim());
			
			if (sourceText.length < 50) {
				new Notice('Source text is too short. Please provide more content.');
				return;
			}

			this.close();
			this.onSubmit(sourceText);
		}
		// Nothing provided
		else {
			new Notice('Please provide either a URL or source text');
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
