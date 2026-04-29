# Byte — Product Requirements Document
> Version 0.3 · Draft · April 2026

---

## 1. Overview

### What is Byte?
Byte is a local-first, open source desktop AI chat application. Users bring their own API keys and get access to powerful AI features — web search, code execution, file reading, Sparks, Council mode, and more — completely free, across every supported model. No subscriptions. No accounts. Your data stays on your machine.

### The Core Problem
To use "premium" AI features like web search or file uploads with GPT-4 or Claude, you currently need a paid subscription on top of your API costs. Byte eliminates that tax by handling the tool layer itself — if you're already paying per token, you get everything for free.

### Philosophy
- **Local-first** — all data stored on your device by default
- **Bring your own key** — you control your API access and costs
- **Open source** — community-extensible, community-themeable
- **Privacy first** — no accounts, no telemetry, no servers required

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Desktop App | Tauri (Rust + JS/TS) |
| Local Storage | SQLite |
| Code Execution | WebAssembly sandbox (in-app, no server) |
| Web Search | DuckDuckGo / Brave (free, no key needed) |
| URL Fetching | Jina.ai/reader (free, no key needed) |
| Sparks Runtime | `@babel/standalone` in sandboxed Tauri WebView |
| Optional Sync | User-provided Firebase or Supabase |
| Chat Rendering | Markdown |

---

## 3. Supported AI Providers (MVP)

Users add their own API keys per provider in Settings. They then select which models to enable, and those models become available in the model picker in any chat. Models are fetched dynamically via `GET {baseURL}/v1/models` — no hardcoded model names.

**Built-in providers:**
- OpenAI (GPT-4o, GPT-4, o1, o3, etc.)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus, etc.)
- Google (Gemini 1.5 Pro, Gemini Flash, etc.)
- xAI (Grok 3)
- Mistral
- Meta (Llama)
- Perplexity
- NVIDIA Nemotron
- Amazon Titan
- AI21 Jamba
- Fireworks AI
- Together AI
- Anyscale
- Replicate
- Hugging Face
- Inflection
- Any OpenAI-compatible API endpoint (custom/local models)

---

## 4. Onboarding Flow

First-launch onboarding is a 5-step wizard displayed over a grid-pattern background. Progress is tracked with dot indicators.

**Step 1 — Name**
- Byte greets the user: *"Hello, I'm Byte"*
- User enters their name (used throughout the app in greetings)
- Option to skip setup entirely and jump in

**Step 2 — Feel (Theme)**
- User picks from: Dark, Light, Warm, Ocean, Sage, Rose, Sand, Slate, Midnight
- Custom theme option available via `+` button
- Fine-tuning available later in Customize

**Step 3 — Text Style**
- User picks a UI/body font: Geist Mono, System UI, Instrument Serif
- User picks a heading/display font: Instrument Serif, Fraunces, Georgia, System
- Live preview of the chosen combination

**Step 4 — Feature Tabs**
- Enable/disable optional sidebar sections: Council, Sparks, Projects
- Configure **Disappearing Messages**: unsaved chats auto-delete after a chosen interval (24h, 48h, 72h, 1 week). Bookmarked chats are exempt.

**Step 5 — Connect API**
- Provider selection grid (OpenAI, Anthropic, Google, xAI, Mistral, Groq, custom)
- API key input with show/hide toggle
- Stored locally on device; never sent anywhere except the provider's endpoint
- Skip option — setup accessible later in Settings

---

## 5. App Shell & Layout

### 5.1 Sidebar

The sidebar follows a Claude-inspired icon + text layout with three display modes, switchable anytime from Customize or the quick-access panel:

- **Full** — icon + label for each nav item (default, `--sb-w: 236px`)
- **Icons** — icon-only rail (`54px` wide)
- **None** — sidebar hidden entirely

**Sidebar header** — Byte logo/wordmark on left, new chat button on right.

**Navigation items** (in order):
```
Chats
Projects
Council
Sparks
Agents
Customize
────────────────
[Starred chats]
[Pinned chats]
────────────────
Recents
────────────────
⚙ Settings
```

- Starred and Pinned sections only appear when populated
- Settings button at the footer, styled with a subtle border to differentiate it
- Recents list is scrollable; shows chat title and relative timestamp

### 5.2 Topbar

Slim bar at the top of the main content area:
- Left: hamburger/sidebar toggle button (`⌘B`)
- Right: current view badge (pill showing view name, e.g. "Chats")

### 5.3 Responsive Behavior

- **Mobile (< 600px)**: Sidebar slides in as an overlay with a backdrop blur; close button in sidebar header
- **Tablet (601–1024px)**: Sidebar at full width, main area adjusts
- **Desktop (1025–1919px)**: Standard two-column layout
- **Large (1920px+)**: Wider sidebar and max-width content columns
- **Ultra-wide (2560px+)**: Further expanded proportions

---

## 6. Views

### 6.1 Home (New Chat)

The entry point for starting a new conversation.

**Greeting** — time-aware greeting using the user's name (e.g., "Good evening, Arnav") in the display font at large size. Subheading: "What can Byte help with today?"

**Input box** — main text area with:
- Auto-resize (up to 200px)
- `+` button (opens Plus Menu for tools/attachments)
- Agent chip (opens agent picker dropdown)
- Model chip (opens model picker)
- Voice/Send morphing button: shows mic icon when empty, send arrow when text is present

**Token bar** — slim progress bar below the input showing context window usage for the selected model (e.g., "0 / 128K tokens used")

**Suggestion pills** — horizontally scrollable row of quick-start prompts below the input. Pills are user-customizable: default system pills (Write, Code, Research, etc.) plus user-created custom pills. Each pill opens a submenu with specific starter prompts. Pills can be added, edited, reordered, and disabled.

**Glow ring** — optional accent-colored glow around the input box (toggleable in Customize, with intensity control)

### 6.2 Chats List

Full-page list of all conversations.

- Header with Chats title, "New chat" button, and "Select" button
- Search bar (filters in real time)
- **Select mode** — bulk-select chats, then: Add to Project, Delete, Cancel
- Chat items show: title, model icon, relative timestamp, bookmark/pin state
- Right-click or swipe reveals: pin, star, rename, add to project, delete
- **Starred** and **Pinned** sections appear above the main list when populated

### 6.3 Chat View

The active conversation interface. The chat shell adapts to a **skin** matching the selected model (see Section 7.5).

**Message display:**
- Markdown rendering with syntax highlighting in code blocks
- AI avatar (circular, shows agent initial or custom avatar) + sender name + timestamp (all toggleable per Customize settings)
- User messages displayed as bubbles (right-aligned) with configurable style: Bubble, Flat, Outlined, Pill
- AI messages configurable: Plain text, Card, Left border accent

**Message actions** (appear on hover, always visible on mobile):
- Copy message
- Like / Dislike (local only)
- Regenerate response
- Quote (highlight AI text → click Quote → quoted in next message)
- Edit message (re-runs conversation from that point)
- Branch (fork from this message into a new thread)

**Code blocks:**
- Copy button per block
- Run button — executes via WebAssembly, output rendered inline as markdown

**Chat input area** (in-conversation):
- `+` button for attachments and tool access
- Agent chip + Model chip (same as Home, switchable mid-conversation)
- Voice/Send morphing button
- Token counter visible
- **Stop generation** button replaces Send while streaming

**In-chat toolbar** (topbar area):
- Chat title (editable)
- Canvas toggle button
- Memory toggle
- Export menu (Markdown / PDF)
- More options (rename, delete, branch, export)

**Context management:**
- Token counter showing current usage
- Context window progress bar
- **Compact** — AI summarizes the conversation and replaces it with a dense summary, freeing context
- **Pin messages** — mark messages to survive a compact operation
- **Delete messages** — remove individual messages manually

### 6.4 Projects View

- Grid of project cards; each card shows name, icon, chat count, last active time
- Click a project to drill in → project detail view: shared system prompt, list of chats in the project
- **Import** button for importing exported projects

**Project features:**
- Named folders grouping related chats
- Per-project system prompt / persistent context (applied to all chats inside)
- Project-level memory toggle
- Add chats to a project via bulk select from Chats view
- Export project

### 6.5 Council View

Watch multiple AI models discuss a topic in real time.

**Setup screen:**
- 2–4 model slots (click to open model picker for each)
- Council mode selector: Debate, Consensus, Devil's Advocate, Roast
- Topic/question input
- Start button

**Active council:**
- Each model shown as a distinct participant with name, label, and color
- Responses stream in real time, one after another
- **Inject message** — user can interject as moderator to redirect discussion
- **Summarize Council** — generates a final synthesis at the end

**Modes:**

| Mode | Description |
|---|---|
| **Debate** | Models are assigned positions and argue against each other |
| **Consensus** | Models discuss openly and try to reach a shared answer |
| **Devil's Advocate** | One model answers; the others specifically challenge it |
| **Roast** | One model answers; the others tear it apart |

### 6.6 Sparks View

Library of saved AI-generated interactive widgets (Sparks).

- Grid of saved Sparks with name, preview thumbnail, creation date
- Click to open/view a Spark
- Delete, rename, export options per Spark

**What is a Spark?**
A Spark is a live, interactive widget generated by the AI and rendered inline in the chat message flow. Sparks are built with JSX/React compiled via `@babel/standalone` and rendered in a sandboxed Tauri WebView using Blob URLs. When a user saves a Spark from chat, it appears in the Sparks library.

**Spark types:**
- Inline Sparks — rendered without a border, living directly in the message flow
- Library Sparks — saved to the Sparks sidebar for later access

### 6.7 Agents View

- List of all created agents as cards (name, avatar, description, enabled tools as pills)
- "New agent" button
- "Reset" button to restore Byte default agent

**Default Agent: Byte**
- Friendly, minimal, helpful
- Used in all chats unless changed

**Custom Agent Creator** (modal/dedicated view):
- Name
- Avatar (emoji or custom icon)
- Personality description
- System prompt (full editor)
- Tools toggle (web search, code execution, file reading, URL fetch)

Model and provider are never locked to an agent — always selected via the chat-level model picker.

**`@agentname` mention** in chat quickly switches to a different agent inline.

### 6.8 Customize View

A dedicated view (accessible from sidebar) for personalizing the Byte experience. Left subnav with sections:

**Skills** — Manage prompt bundles attached to agents. Browse community skills via "Browse Skills" (links to skills.sh registry). Select mode for bulk delete. Each skill shows: icon, name, description, prompt preview on expand.

**Memories** — View and manage all saved memories. Add manually, edit inline, delete, bulk-select and delete. "Facts Byte remembers. Never saved silently — always explicit."

**Appearance** — Full theme and visual customization:
- Theme picker (Dark, Light, + Custom)
- Custom theme builder (Background, Text, Accent color pickers)
- Import/export `.bytetheme` files
- Accent color: preset dots + custom hex input
- Custom color overrides for Background, Sidebar, Surface, Text
- Font picker (Geist Mono, Instrument Serif, Fraunces, System UI)
- Spacing sliders: Font size, Corner radius, Sidebar width, Density
- Layout mode: Sidebar / Icons / None
- Interface toggles: Compact topbar, Match system dark/light, Blur sidebar
- Input box: Glow ring toggle + intensity slider

**Chat** — Per-message visual customization with live preview:
- User bubble style: Bubble (rounded), Flat, Outlined, Pill
- AI message style: Plain text, Card, Left border accent
- Bubble corner radius slider
- Max message width: Narrow (580px), Default (720px), Wide (860px), Full width
- Avatars & labels: Show AI avatar, Show sender name, Show timestamps
- Message spacing / gap slider
- Chat skins: custom message shell per provider (Claude, ChatGPT, Gemini, Grok, Perplexity, etc.)

**Shortcuts** — Reference table of all keyboard shortcuts

**Quick Prompts** — Manage the suggestion pills on the Home screen. Add/edit/reorder custom pill groups and their associated prompts.

### 6.9 Settings View

Two-column layout (left nav, right content panels) with sections:

**Providers & Models**
- Add/remove API keys per provider
- Provider cards showing: icon, name, key status (redacted), edit/delete actions
- Per-provider model list with enable/disable toggle per model
- Context window info per model

**Default Model** — set the default model for new chats

**Default Agent** — set which agent to use by default

**Connections**
- Web Search (Brave / DuckDuckGo) — toggle
- Local Files — toggle
- Code Runner — toggle
- MCP Servers — manage button (opens MCP manager modal)

**Behavior**
- Disappearing messages (auto-delete after configurable interval)
- Memory injection default (on/off per new chat)
- Send shortcut (Cmd+Enter vs Enter)

**Data**
- Export all data (chats, agents, memories, settings)
- Import data
- Clear all chats
- Run database integrity check

**About**
- Byte version and build
- What is Byte? (brief description)
- Feature highlights
- People behind Byte (Arnav Saini, Karthik Pottabathini)
- Legal footer

---

## 7. Features

### 7.1 Chat Core

- Markdown rendering for all messages (code blocks, headers, bold, tables, etc.)
- Syntax highlighting in code blocks
- Stop generation — cancel a response mid-stream
- Regenerate response
- Edit your own message — re-runs conversation from that point
- Branch conversation — fork from any message into a new thread
- Like / dislike a message (local only)
- Quote AI text into next message
- Inline code execution via Run button
- Voice input — mic button in chat input, uses OS speech-to-text; morphs into send button when text is present

### 7.2 Model Picker

- Accessible directly in the chat input area (Home and Chat views)
- Searchable dropdown showing enabled models grouped by provider
- Each model shows: provider icon, name, context window size
- Active model shown with accent checkmark
- Switchable at any point mid-conversation
- Keyboard shortcut: `⌘K`

### 7.3 Agent + Model Chip Pattern

In the input area, two chips sit side by side:
- **Agent chip** — shows current agent icon + name, opens agent picker dropdown
- **Model chip** — shows current model name, opens model picker

These replace the old combined picker button and allow independent switching.

### 7.4 Plus Menu (`+` Button)

Opens a menu anchored to the `+` button in the input area, providing access to:
- Attach file (PDF, image, doc, txt)
- Web search
- URL fetch
- Code execution
- Ask Question widget
- Prompt Library

Replaces the ⌘ Command button pattern from v0.2.

### 7.5 Chat Skins

Byte can render the chat shell in the visual style of other AI interfaces. Selectable in Customize → Chat. Available skins (MVP):
- **Byte** (default) — clean, minimal
- **ChatGPT** — OpenAI style
- **Claude** — Anthropic style
- **Gemini** — Google style
- **Grok** — xAI style
- **Perplexity** — Perplexity style

Skin affects: message layout, input box design, typography, avatar treatment. Does not affect which model is used.

### 7.6 Memory System

**Customize → Memories**
- View all saved memories in a list
- Manually add a new memory
- Edit any memory inline (click to expand)
- Delete individual or bulk-delete selected

**Save Chat as Memory (In-Chat)**
1. Click memory button in chat
2. Full conversation sent to AI
3. AI generates a 2-sentence summary
4. User sees summary and can: edit, cancel, or save
5. Saved memory appears in Memory Library

**Memory Injection**
- Per-chat toggle ("Use Memories")
- Project-level toggle
- When enabled, all saved memories are prepended to system prompt

**Philosophy:** Memories are never saved silently — always explicit and user-controlled.

### 7.7 Skills Library

Community-published prompt/tool bundles called "Skills."

- Browse via "Browse Skills" button (links to open skills.sh registry)
- One-click add a skill to any agent
- Anyone can publish a skill (open source, Markdown-based)
- Installed skills listed in Customize → Skills as expandable rows
- Select mode for bulk delete
- Examples: "Code Reviewer", "Summarizer", "Translator", "Socratic Tutor"

### 7.8 Sparks (Interactive Widgets)

Sparks are AI-generated live, interactive widgets rendered inline in chat.

**Generation:**
- AI produces JSX/React code
- Byte compiles it via `@babel/standalone` in a sandboxed WebView using Blob URL (not srcdoc, required for scripts to execute)
- Widget renders inline in the message flow

**Types:**
- **Inline Sparks** — no box/border, lives directly in message flow
- **Library Sparks** — saved to Sparks sidebar; accessible from any conversation

**Saving:** User clicks "Save Spark" on any Spark widget → goes to Sparks library with a name prompt

**Use cases:** Data visualizations, calculators, interactive explainers, mini-games, form widgets, etc.

### 7.9 Tools

All tools are free and built-in. No additional API keys required. Tools are toggled per agent and accessible via the Plus Menu in chat.

| Tool | How it works |
|---|---|
| Web Search | Brave / DuckDuckGo — free, no key |
| URL Fetch | Jina.ai/reader — returns clean text from any URL |
| Code Execution | WebAssembly sandbox — runs locally, output rendered inline |
| File Reading | Drag in PDFs, images, docs — parsed and sent as context |
| Ask Question | Renders an interactive question widget inline in chat |
| MCP Servers | Model Context Protocol integrations (managed in Settings → Connections) |

#### Tool Payloads

Each tool is called by the AI via a structured JSON payload. The frontend reads the tool name and renders the appropriate UI. This JSON snippet pattern works universally across all models without native function calling.

---

**Web Search**
```json
{
  "tool": "web_search",
  "query": "Tauri vs Electron performance 2026"
}
```
Returns a list of results (title, URL, snippet). Results injected into context automatically.

---

**URL Fetch**
```json
{
  "tool": "url_fetch",
  "url": "https://example.com/article"
}
```
Fetches via Jina.ai/reader, returns clean plain text. Injected as a document block.

---

**Code Execution**
```json
{
  "tool": "code_execution",
  "language": "python",
  "code": "print([x**2 for x in range(10)])"
}
```
Runs in local WebAssembly sandbox. Output rendered inline as markdown.

---

**File Reading**
```json
{
  "tool": "file_read",
  "filename": "report.pdf",
  "type": "pdf"
}
```
Parsed locally; content injected into context. Supported: `pdf`, `image`, `txt`, `docx`.

---

**Ask Question**
```json
{
  "tool": "ask_question",
  "questions": [
    {
      "id": 1,
      "question": "What platform are you building for?",
      "type": "single_select",
      "options": ["Web", "Mobile", "Desktop"]
    },
    {
      "id": 2,
      "question": "Which browsers do you need to support?",
      "type": "multi_select",
      "options": ["Chrome", "Safari", "Firefox", "Edge"],
      "show_if": { "question_id": 1, "answer": "Web" }
    },
    {
      "id": 4,
      "question": "How would you rate your current setup?",
      "type": "slider",
      "min": 1,
      "max": 10,
      "label": "1 = terrible, 10 = perfect"
    },
    {
      "id": 5,
      "question": "Anything else we should know?",
      "type": "text",
      "placeholder": "Optional details..."
    }
  ]
}
```

**Question types:**

| Type | Description |
|---|---|
| `single_select` | Pick exactly one option |
| `multi_select` | Pick one or more options |
| `rank` | Drag to reorder a list |
| `slider` | Pick a value on a numeric scale |
| `text` | Open-ended short text input |

**`show_if` conditional logic:** Questions can reference prior answers. If condition not met, question is silently skipped. All conditions defined upfront by the AI — no runtime branching.

**UX flow:** Questions shown one at a time → conditional skips applied automatically → confirmation screen with all answers → user confirms → answers returned to AI as structured result → AI continues.

---

### 7.10 Canvas Mode

- AI writes into a live, editable document panel alongside the chat
- User can edit the canvas directly while continuing the conversation
- Ask the AI to revise, expand, or reformat sections
- Export canvas as Markdown or plain text

### 7.11 Token Management

- **Token counter** — visible in every chat, shows current token usage
- **Context window bar** — visual progress bar (based on selected model's max context)
- **Compact** — AI reads the full conversation and replaces it with a dense summary (like `/compact` in Claude Code), freeing window space
- **Delete messages** — manually remove individual messages
- **Pin messages** — mark messages to survive a compact operation

### 7.12 Prompt Library

- Save any prompt for reuse with a name
- Organize with tags
- Accessible via Plus Menu in chat
- **Quick Prompts** — customizable suggestion pills on the Home screen with dropdown submenus per category; add/edit/reorder from Customize → Quick Prompts

### 7.13 Disappearing Messages

- Unsaved chats auto-delete after a configurable interval (24h, 48h, 72h, 1 week)
- Keeps Byte lean without manual housekeeping
- Bookmarking / starring a chat exempts it from auto-deletion
- Configurable during onboarding and in Settings → Behavior

### 7.14 MCP Integration

- Manage MCP server connections in Settings → Connections
- Each server configured with name and URL
- MCP tools become available to agents once connected
- Complexity abstracted from the user — no manual tool config required

### 7.15 Search

- Global search across all chats and projects
- Real-time filtering in Chats list view
- Keyboard shortcut: `⌘F`

### 7.16 Export

- Export any chat as **Markdown** or **PDF**
- Export all data (chats, agents, memories, settings) as a bundle
- Import exported data bundle

---

## 8. Personalization & Themes

### Built-in Themes
Dark, Light, Warm, Ocean, Sage, Rose, Sand, Slate, Midnight

### Custom Themes
- Full custom theme: pick background, text, accent, surface colors
- Import/export `.bytetheme` files — shareable via GitHub or a future community hub
- Accent color: 8 preset options + custom hex input with live preview

### Chat Skins
Per-model visual styles for the chat shell (see Section 7.5).

### Typography
- UI font: Geist Mono, System UI, Instrument Serif
- Display/heading font: Instrument Serif, Fraunces, Georgia, System UI

### Layout & Spacing
- Font size: 11–18px
- Corner radius: 0–22px
- Sidebar width: 180–320px
- Density: compact to airy
- Sidebar layout: Full / Icons / None
- Compact topbar toggle
- Match system dark/light mode toggle
- Blur sidebar toggle

### Message Appearance
- User bubble style, AI message style, bubble corner radius
- Max message width
- Show/hide AI avatar, sender names, timestamps
- Message gap spacing

---

## 9. Sidebar Navigation Detail

```
[Byte logo]              [New chat ✎]
──────────────────────────────────────
  💬  Chats
  🖥  Projects
  👥  Council
  ⚡  Sparks
  ⊞   Agents
  ✦   Customize
──────────────────────────────────────
  ★  Starred           (if populated)
  📌  Pinned            (if populated)
──────────────────────────────────────
  Recents
    Chat title          just now
    Chat title          2h ago
    ...
──────────────────────────────────────
  ⚙  Settings
```

---

## 10. Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Send message | `Cmd+Enter` |
| New chat | `Cmd+N` |
| Open model picker | `Cmd+K` |
| Toggle sidebar | `Cmd+B` |
| Open settings | `Cmd+,` |
| Search chats | `Cmd+F` |
| Stop generation | `Escape` |

---

## 11. Storage & Sync

**Default (Local)**
- All conversations, agents, memories, settings, Sparks stored in SQLite on-device
- No accounts, no cloud, nothing leaves the machine

**Optional Sync (Post-MVP)**
- User provides their own Firebase or Supabase credentials
- Anonymous auth token generated — no email or login required
- Enables cross-device sync
- Enables chat sharing via shareable link (sync-only feature)

---

## 12. Design Tokens

```
Fonts:
  --font:    'Geist Mono', monospace     (UI + body)
  --font-d:  'Instrument Serif', serif   (display/headings)

Accent default: #6AB8F7 (configurable)

Corner radii:
  --r-sm:  6px
  --r:     9px
  --r-lg:  14px

Sidebar default width: 236px
Topbar height: 46px
Base font size: 13px
```

---

## 13. MVP Scope

**In scope for MVP:**
- Onboarding flow (5 steps: Name → Theme → Font → Features → API)
- Core chat with markdown, model picker, file attachments, Canvas mode
- BYOK for all listed providers; dynamic model fetching
- Built-in tools: web search, URL fetch, code execution, file reading, ask question
- Sidebar: Chats, Projects, Council, Sparks, Agents, Customize
- Custom agent creator + Skills library (basic)
- Memory system (save, view, edit, delete, toggle per chat)
- Sparks generation and library
- Token counter + Compact
- Council mode (4 modes: Debate, Consensus, Devil's Advocate, Roast)
- Chat skins (Byte, ChatGPT, Claude, Gemini, Grok, Perplexity)
- MCP server management (basic)
- Disappearing messages with configurable interval
- Home screen suggestion pills (customizable)
- Appearance: 9 themes + custom, accent colors, fonts, layout modes
- Chat appearance: bubble styles, avatars, spacing, message width
- Voice input
- Export as Markdown/PDF
- Global chat search
- Keyboard shortcuts
- Bulk chat management (select, add to project, delete)
- Starred and Pinned chats
- About screen

**Post-MVP / Future:**
- Sync (Firebase/Supabase)
- Shareable chat links
- Connector/OAuth marketplace
- Scheduled/recurring prompts
- Model chaining
- Comments on messages
- Cowork / real-time collaboration
- Community theme hub

---

*PRD v0.3 — Byte — April 2026. Living document, update as features evolve.*