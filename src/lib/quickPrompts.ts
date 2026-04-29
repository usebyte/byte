import { 
  Code, Pencil, Lightbulb, Globe, BarChart3, Calendar, Sparkles, AlignLeft, 
  LucideIcon, Type, MessageSquare, Search, Target, Zap, BookOpen, 
  FileText, PenTool, Command, Cpu, Database, Layers, Mail, Map, Music, 
  Image, Video, Mic, Calculator, Clock, Compass, Flag, Heart, Star, Sun, Moon
} from 'lucide-react'

export interface Prompt {
  id: string
  name: string      // Short display name (e.g., "Condense")
  prompt: string    // Full prompt text (e.g., "Condense these messages into a brief summary...")
  placeholders?: { key: string; label: string }[]  // e.g., [{ key: 'class', label: 'Class' }]
}

export interface QuickPromptCategory {
  id: string
  label: string     // Category name (e.g., "Summarize")
  icon: string      // Icon name from ICON_MAP
  prompts: Prompt[] // Array of prompts with name + text
  enabled: boolean
}

export const AVAILABLE_ICONS = [
  { name: 'Code', icon: Code },
  { name: 'Pencil', icon: Pencil },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Globe', icon: Globe },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'Calendar', icon: Calendar },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'AlignLeft', icon: AlignLeft },
  { name: 'Type', icon: Type },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Search', icon: Search },
  { name: 'Target', icon: Target },
  { name: 'Zap', icon: Zap },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'FileText', icon: FileText },
  { name: 'PenTool', icon: PenTool },
  { name: 'Command', icon: Command },
  { name: 'Cpu', icon: Cpu },
  { name: 'Database', icon: Database },
  { name: 'Layers', icon: Layers },
  { name: 'Mail', icon: Mail },
  { name: 'Map', icon: Map },
  { name: 'Music', icon: Music },
  { name: 'Image', icon: Image },
  { name: 'Video', icon: Video },
  { name: 'Mic', icon: Mic },
  { name: 'Calculator', icon: Calculator },
  { name: 'Clock', icon: Clock },
  { name: 'Compass', icon: Compass },
  { name: 'Flag', icon: Flag },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
] as const

export const ICON_MAP: Record<string, LucideIcon> = AVAILABLE_ICONS.reduce((acc, { name, icon }) => {
  acc[name] = icon
  return acc
}, {} as Record<string, LucideIcon>)

// Generate unique IDs for default prompts
const generateId = () => Math.random().toString(36).substring(2, 15)

export const DEFAULT_QUICK_PROMPTS: QuickPromptCategory[] = [
  {
    id: 'code',
    label: 'Code',
    icon: 'Code',
    prompts: [
      { id: generateId(), name: 'Write function', prompt: 'Write a function to' },
      { id: generateId(), name: 'Debug', prompt: 'Debug this code and explain the issue' },
      { id: generateId(), name: 'Explain', prompt: 'Explain how this code works step by step' },
      { id: generateId(), name: 'Convert', prompt: 'Convert this code to Python' },
      { id: generateId(), name: 'Optimize', prompt: 'Optimize this algorithm for better performance' },
      { 
        id: generateId(), 
        name: 'Create Note', 
        prompt: 'Create good guided notes for {{class}} for {{topic}}. Here is what we learned {{content}}.',
        placeholders: [
          { key: 'class', label: 'Class' },
          { key: 'topic', label: 'Topic' },
          { key: 'content', label: 'What you learned' },
        ]
      },
    ],
    enabled: true,
  },
  {
    id: 'write',
    label: 'Write',
    icon: 'Pencil',
    prompts: [
      { id: generateId(), name: 'Email', prompt: 'Write an email about' },
      { id: generateId(), name: 'Blog post', prompt: 'Draft a blog post on' },
      { id: generateId(), name: 'Summary', prompt: 'Create a summary of' },
      { id: generateId(), name: 'Documentation', prompt: 'Write documentation for' },
      { id: generateId(), name: 'Message', prompt: 'Compose a message to' },
    ],
    enabled: true,
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: 'Lightbulb',
    prompts: [
      { id: generateId(), name: 'Explain', prompt: 'Explain' },
      { id: generateId(), name: 'Teach me', prompt: 'Teach me about' },
      { id: generateId(), name: 'How does', prompt: 'How does' },
      { id: generateId(), name: 'What is', prompt: 'What is' },
      { id: generateId(), name: 'Why does', prompt: 'Why does' },
    ],
    enabled: true,
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'Globe',
    prompts: [
      { id: generateId(), name: 'AI trends', prompt: 'AI trends 2025' },
      { id: generateId(), name: 'Compare cloud', prompt: 'Compare cloud providers' },
      { id: generateId(), name: 'Market analysis', prompt: 'Market size analysis' },
      { id: generateId(), name: 'Tech comparison', prompt: 'Tech stack comparison' },
      { id: generateId(), name: 'Competitive', prompt: 'Competitive analysis' },
    ],
    enabled: true,
  },
  {
    id: 'analyze',
    label: 'Analyze',
    icon: 'BarChart3',
    prompts: [
      { id: generateId(), name: 'Analyze data', prompt: 'Analyze this data' },
      { id: generateId(), name: 'Find patterns', prompt: 'Find patterns in' },
      { id: generateId(), name: 'Key insights', prompt: 'What are the key insights' },
      { id: generateId(), name: 'Compare', prompt: 'Compare' },
      { id: generateId(), name: 'Summarize trends', prompt: 'Summarize the trends' },
    ],
    enabled: true,
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'Calendar',
    prompts: [
      { id: generateId(), name: 'Create plan', prompt: 'Create a plan for' },
      { id: generateId(), name: 'Break down', prompt: 'Break down this project' },
      { id: generateId(), name: 'Steps', prompt: 'What are the steps to' },
      { id: generateId(), name: 'Schedule', prompt: 'Schedule' },
      { id: generateId(), name: 'Strategy', prompt: 'Outline a strategy for' },
    ],
    enabled: true,
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    icon: 'Sparkles',
    prompts: [
      { id: generateId(), name: 'Generate ideas', prompt: 'Generate ideas for' },
      { id: generateId(), name: 'Creative ideas', prompt: 'What are some creative' },
      { id: generateId(), name: 'Brainstorm ways', prompt: 'Brainstorm ways to' },
      { id: generateId(), name: 'Solutions', prompt: 'List possible solutions for' },
      { id: generateId(), name: 'Alternatives', prompt: 'Think of alternatives to' },
    ],
    enabled: true,
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: 'AlignLeft',
    prompts: [
      { id: generateId(), name: 'Summarize', prompt: 'Summarize' },
      { id: generateId(), name: 'Key points', prompt: 'Give me the key points from' },
      { id: generateId(), name: 'TL;DR', prompt: 'TL;DR' },
      { id: generateId(), name: 'Condense', prompt: 'Condense this into a brief summary' },
      { id: generateId(), name: 'Main ideas', prompt: 'Extract the main ideas' },
    ],
    enabled: true,
  },
]
