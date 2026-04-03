import { App, Modal, MarkdownRenderer, Notice } from 'obsidian';
import { AIProvider } from '../ai/provider';
import type { ReadingCoachSettings } from '../settings';

interface Question {
	question: string;
	userAnswer: string;
	aiEvaluation: string;
	score: number; // 0-10
}

export class SocraticInteractiveModal extends Modal {
	private questions: string[] = [];
	private currentQuestionIndex: number = 0;
	private answeredQuestions: Question[] = [];
	private sourceText: string;
	private userNotes: string;
	private settings: ReadingCoachSettings;
	private isEvaluating: boolean = false;

	constructor(
		app: App,
		questions: string[],
		sourceText: string,
		userNotes: string,
		settings: ReadingCoachSettings
	) {
		super(app);
		this.questions = questions;
		this.sourceText = sourceText;
		this.userNotes = userNotes;
		this.settings = settings;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.addClass('reading-coach-modal');
		contentEl.addClass('socratic-interactive-modal');

		this.renderCurrentQuestion();
	}

	private renderCurrentQuestion() {
		const {contentEl} = this;
		contentEl.empty();

		// Header with progress
		const header = contentEl.createDiv({cls: 'reading-coach-modal-header'});
		header.createEl('h2', {text: 'Socratic Questions - Interactive Mode'});
		
		const progress = header.createDiv({cls: 'socratic-progress'});
		progress.createEl('span', {
			text: `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`
		});

		// Question display
		const questionContainer = contentEl.createDiv({cls: 'socratic-question-container'});
		const questionDiv = questionContainer.createDiv({cls: 'socratic-question'});
		
		MarkdownRenderer.renderMarkdown(
			`**Question ${this.currentQuestionIndex + 1}:**\n\n${this.questions[this.currentQuestionIndex]}`,
			questionDiv,
			'',
			null as any
		);

		// Answer input
		const answerContainer = contentEl.createDiv({cls: 'socratic-answer-container'});
		answerContainer.createEl('label', {text: 'Your Answer:', cls: 'socratic-label'});
		
		const textarea = answerContainer.createEl('textarea', {
			cls: 'socratic-answer-input',
			attr: {
				placeholder: 'Type your answer here... Be thoughtful and detailed.',
				rows: '8'
			}
		});

		// Buttons
		const footer = contentEl.createDiv({cls: 'reading-coach-modal-footer'});
		
		const submitBtn = footer.createEl('button', {
			text: 'Submit Answer',
			cls: 'mod-cta'
		});
		
		submitBtn.addEventListener('click', async () => {
			const answer = textarea.value.trim();
			if (!answer) {
				new Notice('Please provide an answer');
				return;
			}
			
			if (this.isEvaluating) {
				new Notice('Please wait, evaluating...');
				return;
			}

			await this.evaluateAnswer(answer);
		});

		const skipBtn = footer.createEl('button', {
			text: 'Skip Question',
			cls: 'mod-warning'
		});
		
		skipBtn.addEventListener('click', () => {
			this.answeredQuestions.push({
				question: this.questions[this.currentQuestionIndex],
				userAnswer: '',
				aiEvaluation: 'Skipped',
				score: 0
			});
			this.moveToNextQuestion();
		});

		const cancelBtn = footer.createEl('button', {text: 'Cancel'});
		cancelBtn.addEventListener('click', () => {
			this.close();
		});
	}

	private async evaluateAnswer(answer: string) {
		this.isEvaluating = true;
		new Notice('Evaluating your answer...');

		const provider = new AIProvider(this.settings);
		
		const evaluationPrompt = this.buildEvaluationPrompt(
			this.questions[this.currentQuestionIndex],
			answer
		);

		const response = await provider.generate(evaluationPrompt);

		if (response.error) {
			new Notice(`Error: ${response.error}`);
			this.isEvaluating = false;
			return;
		}

		// Parse score from response
		const score = this.extractScore(response.content);

		this.answeredQuestions.push({
			question: this.questions[this.currentQuestionIndex],
			userAnswer: answer,
			aiEvaluation: response.content,
			score: score
		});

		this.isEvaluating = false;
		this.showEvaluationResult(response.content, score);
	}

	private buildEvaluationPrompt(question: string, answer: string): string {
		const lang = this.settings.promptLanguage === 'ru' ? 'ru' : 'en';
		
		if (lang === 'ru') {
			return `Ты — тренер по сократовскому методу. Оцени ответ студента на провокационный вопрос.

ИСХОДНЫЙ МАТЕРИАЛ:
${this.sourceText}

ЗАМЕТКИ СТУДЕНТА:
${this.userNotes}

ВОПРОС:
${question}

ОТВЕТ СТУДЕНТА:
${answer}

Оцени ответ по следующим критериям:
1. Глубина мышления (насколько глубоко студент размышляет)
2. Критическое мышление (оспаривает ли предположения)
3. Связность аргументации
4. Открытость к неопределённости
5. Использование контекста из материала

Предоставь:
- Краткую оценку ответа (2-3 предложения)
- Что хорошо в ответе
- Что можно улучшить
- Оценку от 0 до 10 (где 10 - отличное критическое мышление)

ВАЖНО: В первой строке ответа укажи оценку в формате "SCORE: X/10"

Отвечай на русском языке.`;
		} else {
			return `You are a Socratic questioning coach. Evaluate the student's answer to a provocative question.

SOURCE MATERIAL:
${this.sourceText}

STUDENT'S NOTES:
${this.userNotes}

QUESTION:
${question}

STUDENT'S ANSWER:
${answer}

Evaluate the answer based on:
1. Depth of thinking (how deeply the student reflects)
2. Critical thinking (challenges assumptions)
3. Coherence of argumentation
4. Openness to uncertainty
5. Use of context from the material

Provide:
- Brief evaluation of the answer (2-3 sentences)
- What's good about the answer
- What could be improved
- Score from 0 to 10 (where 10 is excellent critical thinking)

IMPORTANT: In the first line of your response, include the score in format "SCORE: X/10"

Respond in English.`;
		}
	}

	private extractScore(evaluation: string): number {
		// Try to extract score from "SCORE: X/10" format
		const scoreMatch = evaluation.match(/SCORE:\s*(\d+)\/10/i);
		if (scoreMatch) {
			return parseInt(scoreMatch[1]);
		}
		
		// Fallback: try to find any number/10 pattern
		const fallbackMatch = evaluation.match(/(\d+)\/10/);
		if (fallbackMatch) {
			return parseInt(fallbackMatch[1]);
		}
		
		// Default to 5 if no score found
		return 5;
	}

	private showEvaluationResult(evaluation: string, score: number) {
		const {contentEl} = this;
		contentEl.empty();

		// Header
		const header = contentEl.createDiv({cls: 'reading-coach-modal-header'});
		header.createEl('h2', {text: 'Evaluation Result'});

		// Score display
		const scoreContainer = contentEl.createDiv({cls: 'socratic-score-container'});
		const scoreDiv = scoreContainer.createDiv({cls: 'socratic-score-display'});
		scoreDiv.createEl('div', {
			text: `${score}/10`,
			cls: `socratic-score ${this.getScoreClass(score)}`
		});

		// Evaluation content
		const evalContainer = contentEl.createDiv({cls: 'socratic-evaluation-content'});
		MarkdownRenderer.renderMarkdown(
			evaluation,
			evalContainer,
			'',
			null as any
		);

		// Buttons
		const footer = contentEl.createDiv({cls: 'reading-coach-modal-footer'});
		
		if (this.currentQuestionIndex < this.questions.length - 1) {
			const nextBtn = footer.createEl('button', {
				text: 'Next Question',
				cls: 'mod-cta'
			});
			nextBtn.addEventListener('click', () => {
				this.moveToNextQuestion();
			});
		} else {
			const finishBtn = footer.createEl('button', {
				text: 'View Final Results',
				cls: 'mod-cta'
			});
			finishBtn.addEventListener('click', () => {
				this.showFinalResults();
			});
		}

		const closeBtn = footer.createEl('button', {text: 'Close'});
		closeBtn.addEventListener('click', () => {
			this.close();
		});
	}

	private getScoreClass(score: number): string {
		if (score >= 8) return 'score-excellent';
		if (score >= 6) return 'score-good';
		if (score >= 4) return 'score-fair';
		return 'score-poor';
	}

	private moveToNextQuestion() {
		this.currentQuestionIndex++;
		if (this.currentQuestionIndex < this.questions.length) {
			this.renderCurrentQuestion();
		} else {
			this.showFinalResults();
		}
	}

	private showFinalResults() {
		const {contentEl} = this;
		contentEl.empty();

		// Header
		const header = contentEl.createDiv({cls: 'reading-coach-modal-header'});
		header.createEl('h2', {text: 'Final Results - Socratic Questions'});

		// Overall score
		const totalScore = this.answeredQuestions.reduce((sum, q) => sum + q.score, 0);
		const averageScore = this.answeredQuestions.length > 0 
			? (totalScore / this.answeredQuestions.length).toFixed(1)
			: '0';

		const summaryContainer = contentEl.createDiv({cls: 'socratic-summary-container'});
		
		const overallScore = summaryContainer.createDiv({cls: 'socratic-overall-score'});
		overallScore.createEl('h3', {text: 'Overall Understanding'});
		overallScore.createEl('div', {
			text: `${averageScore}/10`,
			cls: `socratic-score-large ${this.getScoreClass(parseFloat(averageScore))}`
		});

		const stats = summaryContainer.createDiv({cls: 'socratic-stats'});
		stats.createEl('p', {text: `Questions Answered: ${this.answeredQuestions.filter(q => q.userAnswer).length}/${this.questions.length}`});
		stats.createEl('p', {text: `Questions Skipped: ${this.answeredQuestions.filter(q => !q.userAnswer).length}`});

		// Detailed results
		const resultsContainer = contentEl.createDiv({cls: 'socratic-detailed-results'});
		resultsContainer.createEl('h3', {text: 'Detailed Results'});

		this.answeredQuestions.forEach((q, index) => {
			const questionBlock = resultsContainer.createDiv({cls: 'socratic-result-block'});
			
			questionBlock.createEl('h4', {text: `Question ${index + 1} - Score: ${q.score}/10`});
			
			const questionDiv = questionBlock.createDiv({cls: 'socratic-result-question'});
			MarkdownRenderer.renderMarkdown(q.question, questionDiv, '', null as any);
			
			if (q.userAnswer) {
				questionBlock.createEl('strong', {text: 'Your Answer:'});
				questionBlock.createEl('p', {text: q.userAnswer, cls: 'socratic-user-answer'});
				
				questionBlock.createEl('strong', {text: 'Evaluation:'});
				const evalDiv = questionBlock.createDiv({cls: 'socratic-result-evaluation'});
				MarkdownRenderer.renderMarkdown(q.aiEvaluation, evalDiv, '', null as any);
			} else {
				questionBlock.createEl('p', {text: 'Skipped', cls: 'socratic-skipped'});
			}
		});

		// Footer
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
