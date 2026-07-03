export interface PromptGenerationRequest {
  characterLock: string;
  voiceLock: string;
  niche: string;
  parts: number;
  hookStyle: string;
  customTopic?: string;
}

export interface PromptGenerationResponse {
  niche: string;
  parts_count: number;
  dialogue: string[];
  prompts: string[];
}

export interface TopicIdea {
  title: string;
  reason: string;
}

export interface SavedPrompt {
  id: string;
  date: string;
  topic: string;
  result: PromptGenerationResponse;
}

export interface TopicIdeasResponse {
  topics: TopicIdea[];
}

export interface ContentPlanItem {
  day: number;
  content1: { topic: string; hook_angle: string; reason: string; };
  content2: { topic: string; hook_angle: string; reason: string; };
}

export interface ContentPlanResponse {
  plan: ContentPlanItem[];
}

export const NICHES = [
  "Finansial personal / mindset uang",
  "Karir & dunia kerja",
  "Relationship & psikologi sosial",
  "Parenting / pengasuhan",
  "Self-education / kritik sistem pendidikan",
  "Motivasi / self-improvement (umum)"
];

export const PARTS_OPTIONS = [1, 2, 3, 4];

export const HOOK_STYLES = [
  "Provokatif (Menantang opini umum/Anti-mainstream)",
  "Empati (Relatable/Validasi perasaan)",
  "Cerita Personal (Storytelling pengalaman pribadi)",
  "Pertanyaan Retoris (Memancing pikiran)"
];
