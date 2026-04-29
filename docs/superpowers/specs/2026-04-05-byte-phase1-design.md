# Byte Phase 1 — Design Spec

> Web-first React + Vite implementation of Byte desktop AI chat app
> April 2026

## 1. Overview

Byte is a local-first, open source desktop AI chat application. Phase 1 builds the web version with the core chat loop, settings for API key management, and pixel-perfect UI matching the provided HTML mockup (`byte ui mockup.html`).

**In scope:** Home screen, Chat view, Settings (providers/keys/themes), Sidebar navigation, Model picker, Token counter.

**Out of scope (later phases):** Onboarding, Council, Sparks, Agents, Projects, Memory, Skills, Canvas mode, Voice input, Export, Search, Tauri wrapper.

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| State | Zustand (lightweight, no boilerplate) |
| Styling | CSS (extracted from mockup, split by component) |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-katex` |
| LaTeX | `rehype-katex` + `remark-math` for math equation rendering |
| Routing | None — view-based SPA (single URL, state-driven views) |
| Persistence | `localStorage` (migrates to SQLite in Tauri phase) |

### 2.2 Why Zustand over Context/Redux

- Minimal boilerplate, no providers needed
- Direct store access from any component
- Easy to persist to localStorage with middleware
- Scales well — can split into multiple stores later

### 2.3 Why No Router

Byte is a desktop app with a fixed shell. Views are state-driven (home, chat, settings, etc.), not URL-driven. A router adds complexity with no benefit for this use case.

## 3. File Structure

```
byte/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component, view router
│   ├── styles/
│   │   ├── tokens.css              # CSS custom properties (from mockup :root)
│   │   ├── themes.css              # Theme classes (t-dark, t-light, etc.)
│   │   ├── reset.css               # Reset + base styles
│   │   ├── components/
│   │   │   ├── sidebar.css
│   │   │   ├── topbar.css
│   │   │   ├── home.css
│   │   │   ├── chat.css
│   │   │   ├── settings.css
│   │   │   └── shared.css          # Buttons, toggles, chips, modals
│   ├── store/
│   │   └── useStore.ts             # Zustand store
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── lib/
│   │   ├── api.ts                  # Provider API calls (OpenAI, Anthropic, etc.)
│   │   └── markdown.ts             # Markdown rendering config
│   └── components/
│       ├── AppShell.tsx            # Sidebar + Topbar + View container
│       ├── sidebar/
│       │   ├── Sidebar.tsx
│       │   ├── SidebarHeader.tsx
│       │   ├── SidebarNav.tsx
│       │   ├── SidebarRecents.tsx
│       │   └── SidebarFooter.tsx
│       ├── topbar/
│       │   └── Topbar.tsx
│       ├── views/
│       │   ├── HomeView.tsx
│       │   ├── ChatView.tsx
│       │   ├── ChatsListView.tsx
│       │   └── SettingsView.tsx
│       └── shared/
│           ├── InputBox.tsx
│           ├── ModelPicker.tsx
│           ├── TokenBar.tsx
│           ├── MessageBubble.tsx
│           ├── CodeBlock.tsx
│           └── Modal.tsx
```

## 4. State Management

### 4.1 Store Shape

```typescript
interface AppState {
  // Theme
  theme: string; // 't-dark' | 't-light' | 't-warm' | etc.
  layoutMode: 'full' | 'icons' | 'none';
  fontFamily: string;
  headingFont: string;

  // Providers & Models
  providers: Provider[];
  enabledModelIds: string[]; // IDs of enabled models
  selectedModelId: string | null; // ID, not object — avoids stale refs on refresh

  // Chats
  chats: Chat[];
  activeChatId: string | null;
  activeView: 'home' | 'chats' | 'settings' | 'chat';

  // Settings
  disappearingMessages: boolean;
  disappearingInterval: number; // hours
}
```

### 4.2 Type Definitions

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'streaming' | 'done' | 'error';
  pinned?: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  modelId: string | null;
  createdAt: number;
  updatedAt: number;
  saved: boolean; // exempt from disappearing messages
}

interface Provider {
  id: string; // 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'custom'
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  providerId: string;
  contextWindow: number; // in tokens
  enabled: boolean;
}
```

### 4.3 Persistence

All state persisted to `localStorage` via Zustand's `persist` middleware. Keys prefixed with `byte_`.

## 5. Component Architecture

### 5.1 AppShell

The root layout component. Renders:
- `Sidebar` (left)
- `Topbar` (top of main area)
- Active `View` (home, chat, chats list, settings)

Conditional rendering based on `activeView` state.

### 5.2 Sidebar

Claude-inspired layout:
- **Header:** Byte logo + new chat button
- **Nav:** Chats, Settings (only views in Phase 1)
- **Recents:** Scrollable list of recent chats
- **Footer:** Settings button + avatar

Three layout modes via body class: `ly-icons`, `ly-none`, or default (full).

### 5.3 HomeView

- Static greeting ("Good evening") — no userName since onboarding is skipped
- Large input box (`.home-in-box`) with auto-resize textarea
- Suggestion pills (static for Phase 1): "Write code", "Explain a concept", "Help me debug", "Draft an email"
- Token bar below input
- Model chip in bottom-right

### 5.4 ChatView

- Message list (`.chat-msgs`) with scroll
- User messages as right-aligned bubbles
- AI messages as left-aligned text rows
- Code blocks with copy button
- Message actions on hover (copy, regenerate, like/dislike)
- In-chat input box at bottom
- Stop generation button while streaming

### 5.5 SettingsView

Two-column layout:
- **Left nav:** Providers & Models, Appearance, Behavior, Data, About
- **Right panel:** Active settings section

**Providers & Models panel:**
- Add provider (OpenAI, Anthropic, Google, Mistral, Groq, Custom)
- API key input with show/hide
- Fetch models via `GET {baseURL}/v1/models`
- Enable/disable models with toggle
- Set default model

**Appearance panel:**
- Theme swatches (9 built-in themes)
- Layout mode picker (Full / Icons / None)
- Font picker

### 5.6 ModelPicker

Modal overlay (`.mm-box`):
- Search input
- Models grouped by provider
- Context window info per model
- Checkmark on active model
- Dismiss: click outside, press Escape, or select a model

Triggered from model chip in input area. Keyboard shortcut: `Cmd+K`.

## 6. API Integration

### 6.1 Provider Abstraction

```typescript
interface Provider {
  id: string; // 'openai' | 'anthropic' | 'google' | etc.
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  providerId: string;
  contextWindow: number; // in tokens
  enabled: boolean;
}
```

### 6.2 Chat Completion

Unified interface that normalizes responses across providers:

```typescript
interface StreamHandle {
  abort: () => void;
  isAborted: boolean;
}

async function streamChat(
  provider: Provider,
  model: Model,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<StreamHandle>
```

- OpenAI: `POST /v1/chat/completions` with `stream: true`
- Anthropic: `POST /v1/messages` with `stream: true`
- Google: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent` with `alt=sse` — different request/response shape, requires separate adapter
- Custom: OpenAI-compatible endpoint

Retry with exponential backoff (max 3 attempts) applies only to connection failures **before** the stream starts. Mid-stream interruptions cannot be retried without re-sending the full conversation — instead show "Response interrupted" with regenerate button.

### 6.3 Model Fetching

```typescript
async function fetchModels(provider: Provider): Promise<Model[]>
```

Called when provider is added or models are refreshed.

## 7. Styling Approach

### 7.1 CSS Extraction Strategy

All CSS comes directly from the mockup (`byte ui mockup.html`). No new styles invented.

1. **tokens.css** — `:root` custom properties (colors, fonts, spacing, radii)
2. **themes.css** — Body class theme overrides (`.t-dark`, `.t-light`, etc.)
3. **reset.css** — Reset + base + responsive breakpoints
4. **components/*.css** — Each component's styles extracted from mockup

### 7.2 Theme System

Themes applied via body class. CSS custom properties cascade automatically.

```html
<body class="t-dark">   <!-- Dark theme -->
<body class="t-light">  <!-- Light theme -->
<body class="t-warm">   <!-- Warm theme -->
<!-- etc. -->
```

Layout modes also via body class:
```html
<body class="ly-icons">  <!-- Icon-only sidebar -->
<body class="ly-none">   <!-- No sidebar -->
```

### 7.3 Responsive Breakpoints

From mockup:
- Mobile: `< 600px` — sidebar as overlay, touch-friendly
- Tablet: `601–1024px` — narrower sidebar
- Desktop: `1025–1919px` — standard layout
- Large: `1920px+` — expanded proportions
- Ultra-wide: `2560px+` — further expanded

## 8. Data Flow

### 8.1 Sending a Message

```
User types → Clicks Send → 
  → Store adds user message to active chat
  → API call streamed to provider
  → Chunks appended to AI message in real-time
  → Token bar updated
  → On error, show error state
```

### 8.2 Theme Switching

```
User clicks theme swatch → 
  → Store updates `theme` field
  → Body class updated via useEffect
  → CSS custom properties cascade
  → Persisted to localStorage
```

### 8.3 Adding a Provider

```
User selects provider → Enters API key → 
  → Store adds provider
  → fetchModels() called
  → Models stored, user enables desired ones
  → Persisted to localStorage
```

## 9. Error Handling

- **API errors:** Display inline in chat as system message
- **Network errors:** Retry with exponential backoff (max 3 attempts) — only for connection failures before stream starts
- **Invalid API key:** Show error in Settings provider card
- **Model fetch failure:** Graceful degradation — show cached models or empty state
- **Streaming interruption:** Show "Response interrupted" with regenerate button
- **Missing API key at send time:** Show inline prompt in chat with "Add API Key" button that opens Settings → Providers

## 10. Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Send message | `Cmd+Enter` |
| New chat | `Cmd+N` |
| Open model picker | `Cmd+K` |
| Toggle sidebar | `Cmd+B` |
| Open settings | `Cmd+,` |
| Stop generation | `Escape` |
| Close modal | `Escape` (when modal is open — takes precedence over stop generation) |

Implemented via `useEffect` with `keydown` listener on `document`. Modal shortcuts take precedence — if a modal is open, `Escape` closes it instead of stopping generation.

## 11. Implementation Order

1. **Scaffold** — Vite + React + TypeScript + Zustand
2. **Styles** — Extract CSS from mockup into organized files
3. **Store** — Define Zustand store with persistence
4. **AppShell** — Sidebar + Topbar + view routing
5. **HomeView** — Greeting + input box + suggestion pills
6. **ChatView** — Message list + input + streaming
6.5. **Test streaming** — Verify real-time streaming works with OpenAI/Anthropic
7. **SettingsView** — Providers + API keys + themes
8. **ModelPicker** — Modal with search + grouped models
9. **Polish** — Keyboard shortcuts, animations, responsive fixes

## 12. Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "react-markdown": "^10.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-katex": "^7.0.0",
    "katex": "^0.16.0",
    "highlight.js": "^11.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

## 13. Success Criteria

- [ ] UI matches mockup pixel-perfectly (themes, layout, animations)
- [ ] User can add API key and start a chat
- [ ] Messages stream in real-time from at least OpenAI and Anthropic
- [ ] Theme switching works instantly
- [ ] Sidebar layout modes (Full/Icons/None) work
- [ ] All state persists across page reloads
- [ ] Keyboard shortcuts function
- [ ] Responsive on mobile, tablet, desktop
- [ ] No CSS in JS — all styles in `.css` files
- [ ] No single file exceeds 300 lines
