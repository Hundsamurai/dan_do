import { App, Modal } from 'obsidian';

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

		contentEl.createEl('h2', {text: this.title});
		
		const contentDiv = contentEl.createDiv({cls: 'reading-coach-result'});
		contentDiv.createEl('pre', {text: this.content});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
