// Fix: Use relative path for local module import
import { Content, GroundingChunk, FunctionCall } from '../types';

const API_ENDPOINT = '/gemini-api/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';
const IMAGE_API_ENDPOINT = '/gemini-api/v1beta/models/imagen-4.0-generate-001:generateImages';
const TITLE_API_ENDPOINT = '/gemini-api/v1beta/models/gemini-2.5-flash:generateContent';

// This is a simplified stream parser for the Gemini API's SSE format.
async function* streamResponse(response: Response, signal: AbortSignal): AsyncGenerator<{ text?: string, functionCall?: FunctionCall, imageUrl?: string, groundingChunks?: GroundingChunk[] }> {
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done || signal.aborted) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const json = JSON.parse(line.substring(6));
                    const candidate = json.candidates?.[0];
                    if (!candidate) continue;

                    const contentPart = candidate.content?.parts?.[0];
                    const text = contentPart?.text || '';
                    const functionCall = contentPart?.functionCall;
                    const groundingChunks = candidate.groundingMetadata?.groundingChunks;
                    
                    yield { text, functionCall, groundingChunks };

                    if (functionCall?.name === 'generate_image') {
                        const imageUrl = await geminiService.generateImage(String(functionCall.args.prompt));
                        yield { imageUrl };
                    }
                } catch (e) {
                    console.error("Stream parsing error:", e, "Line:", line);
                }
            }
        }
    }
}

export const geminiService = {
    generateContent: async (prompt: string): Promise<string> => {
        const response = await fetch(TITLE_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API Error: ${response.status} - ${error.error?.message}`);
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },

    generateContentStream: (
        contents: Content[],
        systemInstruction: string,
        userLocation: { lat: number; lng: number } | null,
        signal: AbortSignal
    ) => {
        const body = {
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools: [{
                functionDeclarations: [{
                    name: 'generate_image',
                    description: 'Generates an image based on a user description.',
                    parameters: { type: 'OBJECT', properties: { prompt: { type: 'STRING' } } }
                }]
            }],
            // Fix: Use camelCase for toolConfig and its properties to match the Gemini REST API spec.
            toolConfig: userLocation ? {
                retrievalConfig: {
                    latLng: { latitude: userLocation.lat, longitude: userLocation.lng }
                }
            } : undefined
        };

        const responsePromise = fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal
        });

        return {
            async *[Symbol.asyncIterator]() {
                const response = await responsePromise;
                if (!response.ok) {
                     const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
                    throw new Error(`Gemini API Error: ${response.status} - ${error.error?.message}`);
                }
                yield* streamResponse(response, signal);
            }
        };
    },

    generateImage: async (prompt: string): Promise<string | undefined> => {
        try {
            const response = await fetch(IMAGE_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Fix: Use camelCase for numberOfImages to match the Imagen REST API spec.
                body: JSON.stringify({ prompt, numberOfImages: 1 }),
            });
            if (!response.ok) throw new Error('Image generation failed');
            const data = await response.json();
            // Fix: Use camelCase for generatedImages and imageBytes to match the Imagen REST API spec.
            const base64Image = data.generatedImages?.[0]?.image?.imageBytes;
            return base64Image ? `data:image/png;base64,${base64Image}` : undefined;
        } catch (error) {
            console.error("Image generation service error:", error);
            return undefined;
        }
    },
};
