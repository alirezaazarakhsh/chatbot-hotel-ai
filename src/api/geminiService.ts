
// FIX: Import types from the official SDK to resolve module export errors.
import { Content, Part, Tool } from '@google/genai';

interface GenerationConfig {
    tools?: Tool[];
    toolConfig?: any;
    systemInstruction?: string;
}

const dataUrlToInlineData = (dataUrl: string): Part | null => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    return { inlineData: { mimeType: match[1], data: match[2] } };
}

const generateContent = async (model: string, contents: Content[], config: GenerationConfig) => {
    const url = `/gemini-api/v1beta/models/${model}:generateContent?alt=json`;
    const body = JSON.stringify({ contents, ...config });
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    });
    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} - ${await response.text()}`);
    }
    return response.json();
};

const generateContentStream = async function* (model: string, contents: Content[], config: GenerationConfig, signal: AbortSignal) {
    const url = `/gemini-api/v1beta/models/${model}:streamGenerateContent?alt=sse`;
    const body = JSON.stringify({ contents, ...config });
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error(`Gemini API Error: ${response.status} - ${await response.text()}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.substring(6);
                try {
                    yield JSON.parse(jsonStr);
                } catch (e) {
                    console.error("Failed to parse SSE JSON:", jsonStr);
                }
            }
        }
    }
};


const generateImages = async (prompt: string) => {
    const url = `/gemini-api/v1beta/models/imagen-4.0-generate-001:generateImages`;
    const body = JSON.stringify({ prompt, config: { numberOfImages: 1 } });
     const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    });
    if (!response.ok) {
        throw new Error(`Image Generation API Error: ${response.status} - ${await response.text()}`);
    }
    return response.json();
};


export const geminiService = {
    generateContent,
    generateContentStream,
    generateImages,
    dataUrlToInlineData
};
