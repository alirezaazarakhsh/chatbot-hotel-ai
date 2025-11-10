export interface HotelLink { name: string; url: string; }
export interface GroundingChunk {
    web?: { uri?: string; title?: string; };
    maps?: { uri?: string; title?: string; };
}
export interface Message {
    id: string; sender: 'user' | 'bot'; text: string; audioUrl?: string;
    imageUrl?: string; isSpeaking?: boolean; timestamp?: string; isCancelled?: boolean;
    feedback?: 'like' | 'dislike' | null; groundingChunks?: GroundingChunk[];
    toolCall?: { name: string; args: any; thinking: boolean; result?: any; };
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

// Types for Gemini API Proxy Service
export interface Part {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
    functionCall?: {
        name: string;
        args: any;
    };
    functionResponse?: {
        name: string;
        response: any;
    };
    groundingMetadata?: {
        groundingChunks?: GroundingChunk[];
    }
}

export interface Content {
    role: 'user' | 'model' | 'tool';
    parts: Part[];
}

export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: {
        type: 'OBJECT';
        properties: {
            [key: string]: {
                type: 'STRING' | 'NUMBER' | 'BOOLEAN';
                description: string;
            };
        };
        required: string[];
    };
}

export interface Tool {
    functionDeclarations: FunctionDeclaration[];
}
