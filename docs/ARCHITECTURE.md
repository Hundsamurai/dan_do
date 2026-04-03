# Reading Coach Plugin - Architecture Documentation

## Overview

Reading Coach is an Obsidian plugin that helps users analyze their reading comprehension by comparing their notes against source materials (articles or YouTube videos). The plugin uses AI to provide depth analysis and find connections between notes.

## Core Concept

1. User reads an article or watches a YouTube video
2. User takes notes in Obsidian
3. Plugin analyzes notes against the source material using AI
4. Plugin provides feedback on comprehension depth and suggests connections

## Project Structure

```
reading-coach/
├── main.ts                          # Plugin entry point
├── manifest.json                    # Plugin metadata
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── esbuild.config.mjs              # Build configuration
├── styles.css                       # Plugin styles
├── docs/
│   └── ARCHITECTURE.md             # This file
└── src/
    ├── settings.ts                  # Plugin settings & UI
    ├── modes/                       # Analysis modes
    │   ├── depthCheck.ts           # Depth analysis mode
    │   └── connectionFinder.ts     # Connection finding mode
    ├── ai/                          # AI integration
    │   ├── provider.ts             # AI provider abstraction
    │   └── prompts/                # Prompt templates
    │       ├── en.ts               # English prompts
    │       └── ru.ts               # Russian prompts
    ├── views/                       # UI components
    │   ├── sourceInputModal.ts     # Source material input dialog
    │   └── resultModal.ts          # Analysis results display
    └── utils/                       # Utility functions
        ├── textExtractor.ts        # HTML article parser
        ├── youtubeTranscript.ts    # YouTube subtitle fetcher
        ├── vaultScanner.ts         # Obsidian vault scanner
        └── languageDetector.ts     # Language detection
```

## Architecture Components

### 1. Entry Point (`main.ts`)

**Purpose**: Plugin initialization and command registration

**Key Functions**:
- `onload()`: Initialize plugin, register commands, load settings
- `runDepthCheck()`: Execute depth analysis workflow
- `runConnectionFinder()`: Execute connection finding workflow

**Commands Registered**:
- `Reading Coach: Depth Check` - Analyze comprehension depth
- `Reading Coach: Connection Finder` - Find connections with vault notes

### 2. Settings (`src/settings.ts`)

**Purpose**: Plugin configuration and settings UI

**Settings Structure**:
```typescript
{
  promptLanguage: 'en' | 'ru' | 'auto',  // Prompt language
  customPrompts: {                        // User-editable prompts
    depthCheckEN: string,
    depthCheckRU: string,
    connectionFinderEN: string,
    connectionFinderRU: string
  },
  aiProvider: 'openai' | 'ollama' | 'deepseek' | 'openrouter',
  // Provider-specific settings (API keys, models, etc.)
  temperature: number,                    // AI temperature (0-1)
  depthCheckEnabled: boolean,
  connectionFinderEnabled: boolean
}
```

**UI Components**:
- Language selector with auto-detect
- AI provider configuration (API keys, models)
- Custom prompt editors with preview
- Mode toggles

### 3. Analysis Modes

#### Depth Check (`src/modes/depthCheck.ts`)

**Purpose**: Analyze how deeply the user understood the source material

**Workflow**:
1. Check if mode is enabled
2. Detect language from source + notes
3. Select appropriate prompt (custom or default)
4. Call AI provider
5. Display results in modal

**Output**: Structured analysis with:
- Comprehension level (surface/moderate/deep)
- Key concepts captured vs missed
- Areas needing exploration
- Improvement suggestions

#### Connection Finder (`src/modes/connectionFinder.ts`)

**Purpose**: Find connections between current notes and existing vault notes

**Workflow**:
1. Check if mode is enabled
2. Scan vault for all note titles
3. Detect language from source + notes
4. Select appropriate prompt
5. Call AI provider with vault context
6. Display connection map

**Output**: Connection map with:
- Related notes in vault
- Knowledge gaps
- Suggested new connections
- Conceptual bridges

### 4. AI Integration (`src/ai/`)

#### Provider (`src/ai/provider.ts`)

**Purpose**: Abstract AI provider interface

**Supported Providers**:
- **OpenAI**: GPT-3.5/GPT-4 via API
- **Ollama**: Local models (llama2, mistral, etc.)
- **DeepSeek**: DeepSeek API
- **OpenRouter**: Multi-model API gateway

**Key Method**:
```typescript
async generate(prompt: string): Promise<AIResponse>
```

**Response Format**:
```typescript
{
  content: string,  // AI response
  error?: string    // Error message if failed
}
```

#### Prompts (`src/ai/prompts/`)

**Purpose**: Prompt templates for each mode and language

**Features**:
- Separate files for English and Russian
- Support for custom user prompts
- Placeholder replacement: `{sourceText}`, `{userNotes}`, `{vaultNotes}`
- Language-adaptive responses (AI responds in content language)

### 5. Views (UI Components)

#### Source Input Modal (`src/views/sourceInputModal.ts`)

**Purpose**: Collect source material from user

**Features**:
- URL input field (articles or YouTube)
- "Parse URL" button - fetches and displays text
- Editable text area - allows manual editing
- Auto-detection of URL type (article vs YouTube)

**Workflow**:
1. User enters URL or pastes text
2. Click "Parse URL" → text appears in textarea
3. User can edit text if needed
4. Click "Analyze" → passes text to analysis mode

#### Result Modal (`src/views/resultModal.ts`)

**Purpose**: Display AI analysis results

**Features**:
- Markdown rendering with full formatting
- Styled headers, lists, quotes, code blocks
- Scrollable content area
- Close button

### 6. Utilities

#### Text Extractor (`src/utils/textExtractor.ts`)

**Purpose**: Extract text content from HTML articles

**Key Features**:
- Uses Obsidian's `requestUrl` (bypasses CORS)
- Multiple extraction strategies:
  1. `<article>` tag
  2. `<main>` tag
  3. Common content classes (article, content, post, entry)
  4. `itemprop="articleBody"`
  5. Fallback to `<body>`
- Removes scripts, styles, navigation, headers, footers
- HTML entity decoding
- Extensive logging for debugging

**Method**:
```typescript
static async extractFromUrl(url: string): Promise<string>
```

#### YouTube Transcript (`src/utils/youtubeTranscript.ts`)

**Purpose**: Fetch subtitles from YouTube videos

**Key Features**:
- Extracts video ID from various URL formats
- Uses Obsidian's `requestUrl` (bypasses CORS)
- Fetches caption tracks from YouTube page
- Tries multiple languages (en, ru, auto)
- Parses XML subtitle format
- Extensive logging for debugging

**Method**:
```typescript
static async getTranscriptFromUrl(url: string): Promise<string>
```

**Supported URL Formats**:
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`

#### Vault Scanner (`src/utils/vaultScanner.ts`)

**Purpose**: Scan Obsidian vault for existing notes

**Methods**:
- `getAllNoteTitles()`: Get all note titles (for Connection Finder)
- `getAllNotes()`: Get all note files
- `getNoteContent(file)`: Read specific note content

#### Language Detector (`src/utils/languageDetector.ts`)

**Purpose**: Auto-detect language from text content

**Algorithm**:
- Count Cyrillic characters (Russian)
- Count Latin characters (English)
- Compare counts to determine language
- Analyze both source and notes
- Prefer source language if different

**Method**:
```typescript
static detectFromBoth(sourceText: string, userNotes: string): 'en' | 'ru'
```

## Data Flow

### Depth Check Flow

```
User opens note with their notes
    ↓
User runs "Depth Check" command
    ↓
SourceInputModal opens
    ↓
User enters URL or text → Parse URL
    ↓
TextExtractor/YouTubeTranscript fetches content
    ↓
Text appears in modal textarea (editable)
    ↓
User clicks "Analyze"
    ↓
DepthCheckMode.execute(sourceText, userNotes)
    ↓
Language detection (auto or manual)
    ↓
Prompt selection (custom or default)
    ↓
AIProvider.generate(prompt)
    ↓
ResultModal displays analysis
```

### Connection Finder Flow

```
User opens note with their notes
    ↓
User runs "Connection Finder" command
    ↓
SourceInputModal opens
    ↓
User enters URL or text → Parse URL
    ↓
TextExtractor/YouTubeTranscript fetches content
    ↓
Text appears in modal textarea (editable)
    ↓
User clicks "Analyze"
    ↓
ConnectionFinderMode.execute(sourceText, userNotes)
    ↓
VaultScanner.getAllNoteTitles()
    ↓
Language detection (auto or manual)
    ↓
Prompt selection (custom or default)
    ↓
AIProvider.generate(prompt + vaultNotes)
    ↓
ResultModal displays connection map
```

## Key Technical Decisions

### 1. CORS Handling

**Problem**: Browser fetch() blocked by CORS when accessing external URLs

**Solution**: Use Obsidian's `requestUrl()` API which bypasses CORS restrictions

**Implementation**:
```typescript
const response = await requestUrl({
  url: targetUrl,
  method: 'GET',
  headers: { 'User-Agent': '...' }
});
const html = response.text;
```

### 2. Language Detection

**Problem**: Users work with content in different languages

**Solution**: Auto-detect language by counting Cyrillic vs Latin characters

**Benefits**:
- No manual language selection needed
- AI responds in appropriate language
- Works for mixed-language content

### 3. Editable Source Text

**Problem**: Parsed text might be imperfect or need adjustments

**Solution**: Show parsed text in editable textarea before analysis

**Benefits**:
- User can fix parsing errors
- User can add/remove content
- More control over analysis input

### 4. Custom Prompts

**Problem**: Users may want different analysis styles

**Solution**: Allow custom prompt editing with placeholders

**Benefits**:
- Flexible analysis approach
- Domain-specific customization
- Fallback to defaults if empty

## Error Handling

### Logging Strategy

All major operations log to console with prefixes:
- `[TextExtractor]` - Article parsing
- `[YouTubeTranscript]` - YouTube subtitle fetching
- `[SourceInputModal]` - UI interactions
- `[DepthCheckMode]` / `[ConnectionFinderMode]` - Analysis execution

### Error Display

- User-friendly notices via `new Notice(message)`
- Detailed errors in console for debugging
- Graceful fallbacks (e.g., try multiple languages)

## Extension Points

### Adding New AI Providers

1. Add provider option to `ReadingCoachSettings` interface
2. Add configuration fields in `settings.ts`
3. Add case in `AIProvider.generate()` method
4. Implement provider-specific API call

### Adding New Analysis Modes

1. Create new file in `src/modes/`
2. Implement `execute(sourceText, userNotes)` method
3. Add prompts in `src/ai/prompts/en.ts` and `ru.ts`
4. Register command in `main.ts`
5. Add enable/disable toggle in settings

### Adding New Languages

1. Add language option to `promptLanguage` type
2. Create `src/ai/prompts/{lang}.ts`
3. Update `LanguageDetector` with character patterns
4. Update `Prompts` class to handle new language

## Performance Considerations

- **Lazy Loading**: Modes initialized once, reused
- **Caching**: Vault scan results could be cached (not implemented)
- **Streaming**: AI responses not streamed (could be added)
- **Debouncing**: Text input not debounced (could be added)

## Security Considerations

- **API Keys**: Stored in plugin settings (Obsidian handles encryption)
- **User-Agent**: Set to avoid bot detection
- **Input Validation**: URL format validated before fetching
- **Content Sanitization**: HTML stripped before display

## Future Improvements

1. **Caching**: Cache parsed articles and transcripts
2. **Batch Processing**: Analyze multiple notes at once
3. **Progress Indicators**: Show progress for long operations
4. **Export Results**: Save analysis to note
5. **History**: Track previous analyses
6. **Templates**: Pre-defined prompt templates
7. **Streaming**: Stream AI responses for faster feedback
8. **Offline Mode**: Work without internet (local AI only)

## Testing Strategy

### Manual Testing Checklist

- [ ] Parse article URL (various sites)
- [ ] Parse YouTube URL (various formats)
- [ ] Direct text input
- [ ] Depth Check with OpenAI
- [ ] Depth Check with Ollama
- [ ] Connection Finder
- [ ] Custom prompts
- [ ] Language auto-detection
- [ ] Settings persistence
- [ ] Error handling

### Common Issues

1. **CORS errors**: Ensure using `requestUrl` not `fetch`
2. **Empty results**: Check HTML parsing strategy
3. **No YouTube subtitles**: Video may not have captions
4. **AI errors**: Check API key and model availability

## Maintenance Notes

### When Updating Dependencies

1. Test with latest Obsidian API version
2. Check esbuild compatibility
3. Verify TypeScript compilation
4. Test in both desktop and mobile (if supported)

### When Modifying Prompts

1. Test with both languages
2. Verify placeholder replacement
3. Check AI response quality
4. Update default prompt preview

### When Adding Features

1. Update this architecture document
2. Add logging for debugging
3. Update README.md
4. Consider backward compatibility
