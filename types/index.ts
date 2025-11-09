export interface HotelLink { name: string; url: string; }
// Fix: Made uri and title optional to match the type from @google/genai, resolving assignment errors.
export interface GroundingChunk {
    web?: { uri?: string; title?: string; };
    maps?: { uri?: string; title?: string; };
}
export interface Message {
    id: string; sender: 'user' | 'bot'; text: string; audioUrl?: string;
    imageUrl?: string; isSpeaking?: boolean; timestamp?: string; isCancelled?: boolean;
    feedback?: 'like' | 'dislike' | null; groundingChunks?: GroundingChunk[];
    toolCall?: { name: string; args: any; thinking: boolean; };
}
export interface Conversation { id: string; title: string; messages: Message[]; lastUpdated: number; }
export interface FAQ { id: number; question: string; answer: string; }
export interface BotSettings {
  system_instruction: string; default_voice: string; is_bot_voice_enabled: boolean;
  available_fonts: Array<{name: string, family: string}>; hotel_links: HotelLink[];
  welcome_title: string; welcome_message: string; logo_url: string;
}
export type BotVoice = 'Kore' | 'Puck';
export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';