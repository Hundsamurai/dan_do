import { App, Modal, Setting, TextAreaComponent, Notice, ButtonComponent } from 'obsidian';
import { TextExtractor } from '../utils/textExtractor';
import { YouTubeTranscript } from '../utils/youtubeTranscript';

export class SourceInputModal extends Modal {
	private urlInput: string = '';
	private textInput: string = '';
	private onSubmit: (sourceText: string) => void;
	private isProcessing: boolean = false;
	private textAreaComponent: TextAreaComponent | null = null;

	constructor(app: App, onSubmit: (sourceText: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Source Material'});
		contentEl.createEl('p', {
			text: 'Enter a URL (article or YouTube video) or paste the source text directly.',
			cls: 'setting-item-description'
		});

		// URL input
		new Setting(contentEl)
			.setName('URL')
			.setDesc('Article URL or YouTube video link')
			.addText(text => {
				text
					.setPlaceholder('https://example.com/article or https://youtube.com/watch?v=...')
					.setValue(this.urlInput)
					.onChange((value) => {
						this.urlInput = value;
					});
				text.inputEl.style.width = '100%';
			})
			.addButton(btn => btn
				.setButtonText('Parse URL')
				.onClick(async () => {
					await this.handleUrlParse();
				}));

		// OR divider
		const divider = contentEl.createEl('div', {
			text: '— OR —',
			cls: 'reading-coach-divider'
		});
		divider.style.textAlign = 'center';
		divider.style.margin = '1em 0';

		// Direct text input
		new Setting(contentEl)
			.setName('Source Text')
			.setDesc('Paste the source text directly (or parsed from URL above)')
			.addTextArea(text => {
				this.textAreaComponent = text;
				text
					.setPlaceholder('Paste source text here...')
					.setValue(this.textInput)
					.onChange((value) => {
						this.textInput = value;
					});
				text.inputEl.rows = 12;
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
				.setDisabled(this.isProcessing)
				.onClick(async () => {
					await this.handleSubmit();
				}));
	}

	private async handleUrlParse() {
		if (!this.urlInput.trim()) {
			new Notice('Please enter a URL');
			return;
		}

		const url = this.urlInput.trim();
		this.isProcessing = true;

		try {
			// Check if it's a YouTube URL
			if (YouTubeTranscript.isYouTubeUrl(url)) {
				new Notice('Fetching YouTube transcript...');
				const transcript = await YouTubeTranscript.getTranscriptFromUrl(url);
				
				this.textInput = transcript;
				if (this.textAreaComponent) {
					this.textAreaComponent.setValue(transcript);
				}
				
				new Notice(`✓ Extracted ${transcript.length} characters from YouTube video`);
			} else {
				// Regular article URL
				new Notice('Fetching article from URL...');
				const sourceText = await TextExtractor.extractFromUrl(url);
				
				this.textInput = sourceText;
				if (this.textAreaComponent) {
					this.textAreaComponent.setValue(sourceText);
				}
				
				new Notice(`✓ Extracted ${sourceText.length} characters from article`);
			}
		} catch (error) {
			new Notice(`Error: ${error.message}`);
		} finally {
			this.isProcessing = false;
		}
	}

	private async handleSubmit() {
		if (this.isProcessing) {
			return;
		}

		// Check if text is provided
		if (this.textInput.trim()) {
			const sourceText = TextExtractor.extractFromText(this.textInput.trim());
			
			if (sourceText.length < 50) {
				new Notice('Source text is too short. Please provide more content.');
				return;
			}

			this.close();
			this.onSubmit(sourceText);
		} else {
			new Notice('Please provide source text or parse a URL first');
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
