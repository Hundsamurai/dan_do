import { Notice } from 'obsidian';
import type { ReadingCoachSettings } from '../settings';

export interface AIResponse {
	content: string;
	error?: string;
}

export class AIProvider {
	constructor(private settings: ReadingCoachSettings) {}

	async generate(prompt: string): Promise<AIResponse> {
		try {
			switch (this.settings.aiProvider) {
				case 'openai':
					return await this.callOpenAI(prompt);
				case 'ollama':
					return await this.callOllama(prompt);
				case 'deepseek':
					return await this.callDeepSeek(prompt);
				case 'openrouter':
					return await this.callOpenRouter(prompt);
				default:
					return { content: '', error: 'Unknown AI provider' };
			}
		} catch (error) {
			return { content: '', error: error.message };
		}
	}

	private async callOpenAI(prompt: string): Promise<AIResponse> {
		if (!this.settings.openaiApiKey) {
			throw new Error('OpenAI API key not configured');
		}

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.openaiApiKey}`
			},
			body: JSON.stringify({
				model: this.settings.openaiModel,
				messages: [{ role: 'user', content: prompt }],
				temperature: this.settings.temperature
			})
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.statusText}`);
		}

		const data = await response.json();
		return { content: data.choices[0].message.content };
	}

	private async callOllama(prompt: string): Promise<AIResponse> {
		const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: this.settings.ollamaModel,
				prompt: prompt,
				stream: false,
				options: {
					temperature: this.settings.temperature
				}
			})
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.statusText}`);
		}

		const data = await response.json();
		return { content: data.response };
	}

	private async callDeepSeek(prompt: string): Promise<AIResponse> {
		if (!this.settings.deepseekApiKey) {
			throw new Error('DeepSeek API key not configured');
		}

		const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.deepseekApiKey}`
			},
			body: JSON.stringify({
				model: this.settings.deepseekModel,
				messages: [{ role: 'user', content: prompt }],
				temperature: this.settings.temperature
			})
		});

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.statusText}`);
		}

		const data = await response.json();
		return { content: data.choices[0].message.content };
	}

	private async callOpenRouter(prompt: string): Promise<AIResponse> {
		if (!this.settings.openrouterApiKey) {
			throw new Error('OpenRouter API key not configured');
		}

		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.settings.openrouterApiKey}`,
				'HTTP-Referer': 'https://github.com/yourusername/reading-coach',
				'X-Title': 'Reading Coach'
			},
			body: JSON.stringify({
				model: this.settings.openrouterModel,
				messages: [{ role: 'user', content: prompt }],
				temperature: this.settings.temperature
			})
		});

		if (!response.ok) {
			throw new Error(`OpenRouter API error: ${response.statusText}`);
		}

		const data = await response.json();
		return { content: data.choices[0].message.content };
	}
}
