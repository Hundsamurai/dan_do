import { App, Modal, MarkdownRenderer } from 'obsidian';

export class ResultModal extends Modal {
	constructor(
		app: App,
		private title: string,
		private content: string
	) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.addClass('reading-coach-modal');

		// Header
		const header = contentEl.createDiv({cls: 'reading-coach-modal-header'});
		header.createEl('h2', {text: this.title});

		// Content container with markdown rendering
		const contentDiv = contentEl.createDiv({cls: 'reading-coach-modal-content'});
		
		// Render markdown content
		MarkdownRenderer.renderMarkdown(
			this.content,
			contentDiv,
			'',
			null as any
		);

		// Close button
		const footer = contentEl.createDiv({cls: 'reading-coach-modal-footer'});
		const closeBtn = footer.createEl('button', {text: 'Close', cls: 'mod-cta'});
		closeBtn.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
