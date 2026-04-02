export const translations = {
	en: {
		// Settings
		settingsTitle: 'Reading Coach Settings',
		languageLabel: 'Language',
		languageDesc: 'Interface and prompt language',
		aiProviderLabel: 'AI Provider',
		aiProviderDesc: 'Choose your AI provider',
		apiKeyLabel: 'API Key',
		modelLabel: 'Model',
		temperatureLabel: 'Temperature',
		temperatureDesc: 'Controls randomness (0.0 = focused, 1.0 = creative)',
		modesTitle: 'Enabled Modes',
		depthCheckLabel: 'Depth Check',
		depthCheckDesc: 'Analyze understanding depth of your notes',
		connectionFinderLabel: 'Connection Finder',
		connectionFinderDesc: 'Find connections between notes in your vault',
		
		// Commands
		depthCheckCommand: 'Depth Check',
		connectionFinderCommand: 'Connection Finder',
		
		// Notices
		ribbonNotice: 'Reading Coach: Use command palette to select a mode',
		noActiveNote: 'Please open a note first',
		emptyNote: 'Current note is empty',
		analyzingDepth: 'Analyzing depth of understanding...',
		scanningVault: 'Scanning vault and finding connections...',
		modeDisabled: 'This mode is disabled in settings',
		
		// Modal titles
		depthCheckTitle: 'Depth Check Analysis',
		connectionFinderTitle: 'Connection Finder'
	},
	ru: {
		// Settings
		settingsTitle: 'Настройки Reading Coach',
		languageLabel: 'Язык',
		languageDesc: 'Язык интерфейса и промптов',
		aiProviderLabel: 'AI Провайдер',
		aiProviderDesc: 'Выберите AI провайдера',
		apiKeyLabel: 'API Ключ',
		modelLabel: 'Модель',
		temperatureLabel: 'Температура',
		temperatureDesc: 'Контролирует случайность (0.0 = точно, 1.0 = креативно)',
		modesTitle: 'Включенные режимы',
		depthCheckLabel: 'Проверка глубины',
		depthCheckDesc: 'Анализ глубины понимания ваших заметок',
		connectionFinderLabel: 'Поиск связей',
		connectionFinderDesc: 'Поиск связей между заметками в хранилище',
		
		// Commands
		depthCheckCommand: 'Проверка глубины',
		connectionFinderCommand: 'Поиск связей',
		
		// Notices
		ribbonNotice: 'Reading Coach: Используйте палитру команд для выбора режима',
		noActiveNote: 'Пожалуйста, откройте заметку',
		emptyNote: 'Текущая заметка пуста',
		analyzingDepth: 'Анализирую глубину понимания...',
		scanningVault: 'Сканирую хранилище и ищу связи...',
		modeDisabled: 'Этот режим отключен в настройках',
		
		// Modal titles
		depthCheckTitle: 'Анализ глубины понимания',
		connectionFinderTitle: 'Карта связей'
	}
};

export function t(key: string, language: 'en' | 'ru' = 'en'): string {
	const keys = key.split('.');
	let value: any = translations[language];
	
	for (const k of keys) {
		value = value?.[k];
	}
	
	return value || key;
}
