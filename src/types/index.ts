export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  rawContent?: string;  // Preserves original AI response before display transformation
  timestamp: number;
  status: 'sending' | 'sent' | 'streaming' | 'done' | 'error';
  pinned?: boolean;
  hidden?: boolean;
  webSearchSources?: { url: string; title: string }[];
  webSearchFetched?: { url: string; title: string }[];
  searchPhase?: 'searching' | 'fetching' | 'done';
}

export type ToolId = 
  | 'WEB_SEARCH' 
  | 'URL_FETCH' 
  | 'FILE_READ' 
  | 'ASK_QUESTION' 
  | 'CONFIRM_ACTION';

export type ModeId = 'CANVAS' | 'COUNCIL';

export type ResponseStyleId = 'normal' | 'concise' | 'explanatory' | 'learning';

export type SettingsSection = 'models' | 'tabs' | 'storage' | 'general' | 'database' | 'connections' | 'about';

export interface ChatConfig {
  agentId: string;           // Agent file name (without .md), e.g., 'DEFAULT'
  memoryEnabled: boolean;    // Whether to include memories
  enabledTools: ToolId[];    // Which tools are active for this chat
  mode: ModeId | null;       // Active mode (CANVAS, COUNCIL) or null
  responseStyle: ResponseStyleId; // How verbose/concise AI responses should be
  memories?: { name: string; content: string }[]; // User memories to include in context
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  modelId: string | null;
  createdAt: number;
  updatedAt: number;
  saved: boolean;
  config: ChatConfig;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  contextWindow: number;
  enabled: boolean;
  capabilities?: {
    webSearch: boolean;
  };
}

export type ThemeId =
  | 't-dark'
  | 't-light'
  | 't-warm'
  | 't-ocean'
  | 't-sage'
  | 't-rose'
  | 't-sand'
  | 't-slate'
  | 't-midnight';

export type LayoutMode = 'full' | 'icons' | 'none';

export type ActiveView = 'home' | 'chats' | 'settings' | 'chat' | 'new-chat' | 'projects' | 'council' | 'customize' | 'sparks' | 'agents';

export interface StreamHandle {
  abort: () => void;
  isAborted: boolean;
}

export type QuestionType = 'single_select' | 'multi_select' | 'slider' | 'text' | 'rank';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  show_if?: {
    questionId: string;
    value: string | string[];
  };
  min?: number;
  max?: number;
  label?: string;
  placeholder?: string;
}

export interface AskQuestionPayload {
  tool: 'ask_question';
  questions: Question[];
  // Optional comment from AI explaining why it's asking
  comment?: string;
}

export interface AskQuestionResult {
  tool: 'ask_question_result';
  answers: Record<string, string | string[] | number>;
}

export interface SuggestMemoryPayload {
  tool: 'suggest_memory';
  name: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
  chatIds: string[]; // Associated chat IDs
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  trigger: string;      // e.g., '/review-code'
  content: string;     // Full markdown content
  createdAt: number;
}
