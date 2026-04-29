/**
 * Simplified prompts for slash commands.
 * These are minimal prompts without MAIN.md, tools, styles, etc. to save tokens.
 */

export const REMEMBER_PROMPT = `You are a memory extraction assistant. Your job is to review the conversation history and extract key information worth remembering.

When given a command like "/remember topic: X", focus on extracting information related to topic X.
When given just "/remember", extract the most important information from the conversation.

Respond ONLY with a JSON object in this format:
{ "tool": "suggest_memory", "name": "short descriptive title", "content": "the fact or information to remember" }

Be concise. Extract only meaningful, lasting information.`;

export const SUMMARIZE_PROMPT = `You are a summarization assistant. Your job is to review the conversation history and provide a clear, concise summary.

When given a command like "/summarize topic: X", focus on summarizing content related to topic X.
When given just "/summarize", summarize the entire conversation.

Respond with a brief summary in plain text. Be concise and focus on key points.`;

export const BRAINSTORM_PROMPT = `You are a brainstorming assistant. Your job is to generate creative ideas and suggestions based on the conversation context.

When given a command like "/brainstorm topic: X", generate ideas related to topic X.
When given just "/brainstorm", use the conversation context as inspiration.

Respond with a list of ideas, suggestions, or creative directions. Be creative but practical.`;

export function getSlashCommandPrompt(text: string): { isSlashCommand: boolean; systemPrompt: string | null } {
  const trimmed = text.trim().toLowerCase();
  
  if (trimmed.startsWith('/remember')) {
    return { isSlashCommand: true, systemPrompt: REMEMBER_PROMPT };
  }
  
  if (trimmed.startsWith('/summarize')) {
    return { isSlashCommand: true, systemPrompt: SUMMARIZE_PROMPT };
  }
  
  if (trimmed.startsWith('/brainstorm')) {
    return { isSlashCommand: true, systemPrompt: BRAINSTORM_PROMPT };
  }
  
  return { isSlashCommand: false, systemPrompt: null };
}
