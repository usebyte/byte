# Prompt Assembly Order

When sending a request to the AI, prompts are assembled in this order:

## 1. MAIN.md (always)
Core system prompt that defines the AI assistant's fundamental behavior.

## 2. Agent (always, one per chat)
- `agents/DEFAULT.md` — or —
- `agents/{name}.md` for custom agent personas

## 3. MEMORY.md (conditional)
Included only if memories are enabled for the chat.

## 4. Tools (conditional, multiple)
One file per enabled tool, included only for tools active in this session:
- `tools/WEB_SEARCH.md`
- `tools/URL_FETCH.md`
- `tools/CODE_EXECUTION.md`
- `tools/FILE_READ.md`
- `tools/ASK_QUESTION.md`
- `tools/CONFIRM_ACTION.md`

## 5. Mode (conditional, one max)
Included only if that mode is active:
- `modes/CANVAS.md` — or —
- `modes/COUNCIL.md`

---

## Example Assembly

A chat with memory enabled, web search + code execution tools, and canvas mode would concatenate:

```
MAIN.md
+ agents/DEFAULT.md
+ MEMORY.md
+ tools/WEB_SEARCH.md
+ tools/CODE_EXECUTION.md
+ modes/CANVAS.md
```
