# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Development mode (watch for changes)
npm run dev
```

## File Modification Guide

### Adding a New AI Provider

**Files to modify**:
1. `src/settings.ts` - Add provider to interface and UI
2. `src/ai/provider.ts` - Add provider case in `generate()` method

**Example**:
```typescript
// In settings.ts
aiProvider: 'openai' | 'ollama' | 'deepseek' | 'openrouter' | 'newprovider'

// In provider.ts
case 'newprovider':
  return await this.callNewProvider(prompt);
```

### Adding a New Analysis Mode

**Files to create**:
1. `src/modes/newMode.ts` - Mode implementation
2. Update `src/ai/prompts/en.ts` and `ru.ts` - Add prompts

**Files to modify**:
1. `main.ts` - Register command and initialize mode
2. `src/settings.ts` - Add enable/disable toggle

**Template**:
```typescript
// src/modes/newMode.ts
import { Notice } from 'obsidian';
import type ReadingCoachPlugin from '../../main';
import { AIProvider } from '../ai/provider';
import { Prompts } from '../ai/prompts';
import { ResultModal } from '../views/resultModal';

export class NewMode {
  constructor(private plugin: ReadingCoachPlugin) {}

  async execute(sourceText: string, userNotes: string): Promise<void> {
    if (!this.plugin.settings.newModeEnabled) {
      new Notice('New Mode is disabled in settings');
      return;
    }

    new Notice('Running new mode...');

    const provider = new AIProvider(this.plugin.settings);
    const prompt = Prompts.newMode(sourceText, userNotes);
    
    const response = await provider.generate(prompt);

    if (response.error) {
      new Notice(`Error: ${response.error}`);
      return;
    }

    new ResultModal(this.plugin.app, 'New Mode Results', response.content).open();
  }
}
```

### Modifying HTML Parser

**File**: `src/utils/textExtractor.ts`

**Common modifications**:
- Add new content extraction strategy
- Improve HTML cleaning
- Add support for specific website structure

**Example - Adding new strategy**:
```typescript
// In parseHtml() method, add before Strategy 4:

// Strategy 3.5: Look for specific site structure
if (!extractedText) {
  const siteMatch = text.match(/<div[^>]*id="main-content"[^>]*>([\s\S]*?)<\/div>/i);
  if (siteMatch && siteMatch[1].length > 200) {
    extractedText = siteMatch[1];
    strategy = 'site-specific main-content';
  }
}
```

### Modifying Prompts

**Files**: `src/ai/prompts/en.ts` and `src/ai/prompts/ru.ts`

**Available placeholders**:
- `{sourceText}` - Source material text
- `{userNotes}` - User's notes
- `{vaultNotes}` - List of vault note titles

**Example**:
```typescript
export const PromptsEN = {
  depthCheck: (sourceText: string, userNotes: string): string => {
    return `Your custom prompt here.
    
SOURCE: ${sourceText}
NOTES: ${userNotes}

Analyze and provide feedback.`;
  }
}
```

### Adding UI Components

**Location**: `src/views/`

**Base class**: Extend `Modal` from Obsidian API

**Template**:
```typescript
import { App, Modal } from 'obsidian';

export class CustomModal extends Modal {
  constructor(app: App, private data: any) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;
    contentEl.empty();
    
    contentEl.createEl('h2', {text: 'Title'});
    // Add your UI elements
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
```

## Debugging

### Enable Console Logging

All components log to console. Open Developer Tools:
- **Desktop**: Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
- **Mobile**: Not available

### Log Prefixes

- `[TextExtractor]` - Article parsing
- `[YouTubeTranscript]` - YouTube operations
- `[SourceInputModal]` - Input modal
- `[DepthCheckMode]` - Depth analysis
- `[ConnectionFinderMode]` - Connection finding

### Common Debug Scenarios

**Problem**: URL parsing fails
```
Check logs for:
[TextExtractor] Used strategy: ...
[TextExtractor] Final cleaned text length: ...
```

**Problem**: YouTube transcript fails
```
Check logs for:
[YouTubeTranscript] Available languages: ...
[YouTubeTranscript] Selected caption track: ...
```

**Problem**: AI not responding
```
Check:
1. API key in settings
2. Model name correct
3. Network connectivity
4. Console for error messages
```

## Build Process

### Development Build

```bash
npm run dev
```

- Watches for file changes
- Includes source maps
- Faster compilation

### Production Build

```bash
npm run build
```

- Minified output
- No source maps
- Optimized for size

### Output Files

- `main.js` - Compiled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles

## Testing

### Manual Testing Workflow

1. Build plugin: `npm run build`
2. Copy files to vault: `.obsidian/plugins/reading-coach/`
3. Reload Obsidian
4. Test functionality
5. Check console for errors

### Test Cases

**Article Parsing**:
- [ ] News sites (CNN, BBC, etc.)
- [ ] Blogs (Medium, Substack)
- [ ] Documentation sites
- [ ] Russian sites (ria.ru, interfax.ru)

**YouTube**:
- [ ] Standard video with English subs
- [ ] Video with Russian subs
- [ ] Video with auto-generated subs
- [ ] Video without subs (should fail gracefully)

**AI Providers**:
- [ ] OpenAI with valid key
- [ ] OpenAI with invalid key (error handling)
- [ ] Ollama with running instance
- [ ] Ollama without instance (error handling)

**Language Detection**:
- [ ] English source + English notes
- [ ] Russian source + Russian notes
- [ ] Mixed language content

## Code Style

### TypeScript

- Use `async/await` for asynchronous operations
- Add type annotations for function parameters
- Use interfaces for complex types
- Prefer `const` over `let`

### Logging

```typescript
// Good
console.log('[ComponentName] Action description:', data);

// Bad
console.log('doing something');
```

### Error Handling

```typescript
// Good
try {
  const result = await operation();
  console.log('[Component] Success:', result);
} catch (error) {
  console.error('[Component] Error:', error);
  throw new Error(`Descriptive message: ${error.message}`);
}

// Bad
try {
  await operation();
} catch (e) {
  console.log(e);
}
```

### Naming Conventions

- Classes: `PascalCase`
- Functions/Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `camelCase.ts`

## Common Patterns

### Modal Pattern

```typescript
new CustomModal(this.app, data).open();
```

### Settings Pattern

```typescript
this.plugin.settings.someValue = newValue;
await this.plugin.saveSettings();
```

### Notice Pattern

```typescript
new Notice('User-friendly message');
```

### AI Call Pattern

```typescript
const provider = new AIProvider(this.plugin.settings);
const response = await provider.generate(prompt);

if (response.error) {
  new Notice(`Error: ${response.error}`);
  return;
}

// Use response.content
```

## Troubleshooting

### Build Errors

**Error**: `Cannot find module 'obsidian'`
```bash
npm install
```

**Error**: TypeScript compilation errors
```bash
# Check tsconfig.json
# Verify all imports are correct
npm run build
```

### Runtime Errors

**Error**: `requestUrl is not defined`
- Ensure importing from 'obsidian': `import { requestUrl } from 'obsidian'`

**Error**: CORS errors
- Use `requestUrl` instead of `fetch`

**Error**: Modal not displaying
- Check `onOpen()` method implementation
- Verify modal is opened: `.open()`

## Performance Tips

1. **Avoid blocking operations**: Use `async/await`
2. **Minimize DOM operations**: Batch updates
3. **Cache when possible**: Store frequently accessed data
4. **Lazy load**: Initialize components only when needed

## Security Best Practices

1. **Never log API keys**: Mask sensitive data in logs
2. **Validate user input**: Check URLs before fetching
3. **Sanitize HTML**: Remove scripts before displaying
4. **Use HTTPS**: All external requests should use HTTPS

## Release Checklist

- [ ] Update version in `manifest.json`
- [ ] Update version in `package.json`
- [ ] Run `npm run build`
- [ ] Test all features
- [ ] Update `README.md` if needed
- [ ] Update `ARCHITECTURE.md` if needed
- [ ] Commit changes
- [ ] Create git tag
- [ ] Create GitHub release with `main.js`, `manifest.json`, `styles.css`
