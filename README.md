# Deep Analysis Notes — Depth Optimizer: Reading Coach

AI-powered reading comprehension assistant for Obsidian that analyzes your notes against source texts and provides interactive understanding maps.

## Features

- 🤖 Multiple AI provider support:
  - OpenAI (GPT-3.5/GPT-4)
  - Local Ollama (llama2, mistral, etc.)
  - DeepSeek
  - OpenRouter
- 📝 Analyze your notes against source texts (URL or direct text)
- 🗺️ Interactive understanding maps
- 🎯 Comprehension insights and feedback

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings → Community Plugins
2. Search for "Reading Coach"
3. Click Install, then Enable

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/reading-coach/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Development

```bash
# Install dependencies
npm install

# Start development build (watches for changes)
npm run dev

# Create production build
npm run build
```

## Configuration

1. Open Settings → Reading Coach
2. Select your preferred AI provider
3. Configure API keys and models as needed

### Supported Models

- **OpenAI**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Ollama**: llama2, mistral, and other locally installed models
- **DeepSeek**: deepseek-chat and other DeepSeek models
- **OpenRouter**: Access to various AI models through OpenRouter

## Requirements

- Obsidian v1.4.0 or higher
- For Ollama: Local Ollama installation running on your machine
- For cloud providers: Valid API keys

## License

MIT

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.
