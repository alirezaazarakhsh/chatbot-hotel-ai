// --- Local API Types ---
export interface HotelLink { name: string; url: string; }
export interface FAQ { id: number; question: string; answer: string; }
export interface BotSettings {
  system_instruction: string; default_voice: string; is_bot_voice_enabled: boolean;
  available_fonts: Array<{name: string, family: string}>; hotel_links: HotelLink[];
  welcome_title: string; welcome_message: string; logo_url: string;
}

// --- App State Types ---
export interface Message {
    id: string; sender: 'user' | 'bot'; text: string; audioUrl?: string;
    imageUrl?: string; isSpeaking?: boolean; timestamp?: string; isCancelled?: boolean;
    feedback?: 'like' | 'dislike' | null; groundingChunks?: GroundingChunk[];
    toolCall?: { name: string; args: any; thinking: boolean; result?: any; };
}
export interface Conversation { id: string; title: string; messages: Message[]; lastUpdated: number; }
export type BotVoice = 'Kore' | 'Puck';
export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

// --- Gemini API Types (replicated for proxy service) ---
export interface Part {
    text?: string;
    inlineData?: { mimeType: string; data: string; };
    functionCall?: FunctionCall;
    functionResponse?: { name: string; response: any; };
}
export interface Content {
    role: 'user' | 'model' | 'tool';
    parts: Part[];
}
export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
}
export interface Schema {
    type: Type;
    properties?: { [key: string]: Schema };
    required?: string[];
}
export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: Schema;
}
export interface Tool {
    functionDeclarations?: FunctionDeclaration[];
    googleMaps?: {};
}
export interface FunctionCall {
    name: string;
    args: { [key: string]: any };
}
export interface GroundingChunk {
    web?: { uri?: string; title?: string; };
    maps?: { uri?: string; title?: string; };
}