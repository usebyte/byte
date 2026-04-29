# Memory Tools — Design Spec

## Context

Byte already has a memory system: memories are stored in `useStore.memories`, injected into AI prompts via `MEMORY.md`, and manually managed in CustomizeView. This spec adds three new capabilities:
1. **`/remember {query}`** — Slash command for AI to harvest memories from the current chat
2. **AI-initiated memory suggestions** — AI can propose memories during conversation with user confirmation
3. **Memories toggle in `+` menu** — Controls memory access per-chat (already exists, needs verification)

---

## Feature 1: `/remember {query}` Slash Command

### Trigger
User types `/remember {query}` in the input box, e.g.:
- `/remember key decisions made in this conversation`
- `/remember summarize my tech stack and project goals`
- `/remember what did we agree on about the API design`

### Flow
1. Input box detects `/remember` prefix at send time
2. User sends message → instead of normal chat, chat shows an **AI message** with streaming text: `"Creating memory..."`
3. AI processes the query against the current chat's messages, extracts relevant information, and returns a `tool_call` JSON:
   ```json
   { "tool": "create_memory", "name": "...", "content": "..." }
   ```
4. When ChatView detects `create_memory` in the streamed response, it:
   - Replaces the streaming "Creating memory..." message with a new `SuggestMemory` modal (same position as AskQuestion modal)
   - The modal pre-fills the `name` and `content` fields with the AI's proposal
   - User can edit name/content, then tap **Save** to add to memories, or **Cancel** to dismiss
5. The "Creating memory..." message is removed from the chat history after the modal is shown

### Slash Command Detection
- In `handleSend` (ChatView), check if `text.trim().toLowerCase().startsWith('/remember')`
- Extract the query string after `/remember` (trimmed)
- If query is empty, show a brief tooltip: "Usage: /remember what to remember"
- If query exists, trigger `createMemory` flow instead of normal send

### Implementation: `createMemory` Flow
New function in ChatView that:
1. Creates a placeholder streaming message: `"Creating memory..."`
2. Sends the chat messages + query to the AI with a system prompt instructing it to harvest memory
3. On `create_memory` tool detection, removes the placeholder and shows the SuggestMemory modal
4. On cancel/error, removes the placeholder

---

## Feature 2: AI-Initiated Memory Suggestions

### Trigger
During normal conversation, if the AI detects something worth remembering (e.g., user mentions a preference, makes a decision, shares a fact), it can output:
```json
{ "tool": "suggest_memory", "name": "User's API preference", "content": "The user prefers REST over GraphQL for their backend API." }
```

### Detection
Same streaming detection pattern as `ask_question`:
- In the streaming callback, check `accumulatedContent.includes('"tool":"suggest_memory"')`
- On match, stop streaming display and show the SuggestMemory modal with the parsed payload

### SuggestMemory Modal
Positioned same as AskQuestion (replaces input area). Props:
```ts
interface SuggestMemoryProps {
  initialName: string;
  initialContent: string;
  onSave: (name: string, content: string) => void;
  onDecline: () => void;
}
```

**UI:**
- Title: "Save Memory?" (or similar)
- Two text fields: **Name** (short label) and **Content** (longer body), both pre-filled and editable
- Three actions: **Edit & Save** (primary), **Save as-is** (secondary), **Decline** (ghost)
- Close on save or decline, removes placeholder message on cancel

### Placeholder Message
When `suggest_memory` is detected, a placeholder message `"Suggested memory..."` is shown in the chat. This gets removed when the modal appears or on cancel.

---

## Feature 3: Memories Toggle in `+` Menu

**Already implemented** — `memoryEnabled` on `chat.config`, toggle in PlusMenu. Needs verification that:
- Toggle state persists correctly per chat
- Memories are injected into prompts only when enabled
- Works from both home view and chat view

---

## Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| `SuggestMemory` | `src/components/shared/SuggestMemory.tsx` | Modal for confirming/editing AI-suggested or AI-harvested memories |
| `SuggestMemory.css` | `src/components/shared/SuggestMemory.css` | Styles matching AskQuestion modal |
| Slash command handler | `ChatView.tsx` | Detects `/remember`, triggers harvest flow |
| Memory suggestion detector | `ChatView.tsx` | Detects `suggest_memory` in streaming |
| Memory harvest prompt | `prompts/REMEMBER.md` | System prompt for `/remember` AI processing |

---

## Memory Object Shape

```ts
interface Memory {
  id: string;
  name: string;
  content: string;
  createdAt?: number;
}
```

Existing store supports `{ id, name, content }`. Add `createdAt` on save.

---

## Prompt: `/remember` Instruction

New system prompt file `prompts/REMEMBER.md`:
```
You are helping the user save important information from their conversation as a memory.

The user asked: "{query}"

Review the conversation above and extract the most important information related to this query. 
Return a JSON object with:
- "name": a short, descriptive title (max 10 words)
- "content": the key information to remember (1-3 sentences, be specific)

Only return the JSON. Do not add explanations.
```

---

## Prompt: AI Memory Suggestion Instruction

Add to `MAIN.md`:
```
If you detect something important about the user (preferences, facts, decisions, context) 
that would help personalize future conversations, you may output:
{ "tool": "suggest_memory", "name": "...", "content": "..." }

Do this sparingly — only suggest memories for genuinely important information the user 
would want you to remember across conversations.
```

---

## UX Notes

- The SuggestMemory modal uses the same overlay/positioning pattern as AskQuestion — see AskQuestion.css for reference
- Both `/remember` and AI-suggested memories use the same `SuggestMemory` modal component
- The `+` menu memories toggle is separate — it controls whether memories are INJECTED into prompts (memory context on/off), not whether memories can be SAVED
- Memories can always be saved, regardless of the toggle state
