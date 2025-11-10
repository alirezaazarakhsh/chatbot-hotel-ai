import { Content, Tool, FunctionDeclaration, Part } from '../types';

const API_BASE_URL = '/gemini-api/v1beta/models';

const generateImageTool: FunctionDeclaration = {
    name: 'generate_image',
    description: 'Generates an image based on a user description. Only use this when the user explicitly asks to create, draw, or generate an image.',
    parameters: {
        type: 'OBJECT',
        properties: {
            prompt: {
                type: 'STRING',
                description: 'A detailed, creative, and descriptive prompt for the image to be generated. This must be in English.'
            }
        },
        required: ['prompt']
    }
};
const tools: Tool[] = [{ functionDeclarations: [generateImageTool] }];

const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        (error as any).status = response.status;
        throw error;
    }
    return response;
};

async function* streamResponse(response: Response, abortSignal: AbortSignal): AsyncGenerator<Part | { groundingMetadata: any }> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader");

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        if (abortSignal.aborted) {
            reader.cancel();
            break;
        }
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n');
        buffer = parts.pop() || ''; 

        for (const part of parts) {
            if (part.startsWith('data: ')) {
                try {
                    const jsonString = part.substring(6);
                    const json = JSON.parse(jsonString);
                    const candidate = json.candidates?.[0];
                    if (candidate?.content?.parts) {
                        for (const contentPart of candidate.content.parts) {
                            yield contentPart as Part;
                        }
                    }
                    if(candidate?.groundingMetadata) {
                         yield { groundingMetadata: candidate.groundingMetadata };
                    }

                } catch (e) {
                    console.error("Failed to parse stream JSON:", e, "Part:", part);
                }
            }
        }
    }
}

export const geminiService = {
    generateContent: async (prompt: string): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/gemini-2.5-flash:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }).then(handleApiResponse);
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },

    generateContentStream: async function* (
        { contents, systemInstruction, abortSignal }:
        { contents: Content[]; systemInstruction: string; abortSignal: AbortSignal }
    ) {
        const body = {
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools
        };
        const response = await fetch(`${API_BASE_URL}/gemini-2.5-flash:streamGenerateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: abortSignal,
        }).then(handleApiResponse);

        yield* streamResponse(response, abortSignal);
    },
    
    generateImage: async (prompt: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/imagen-4.0-generate-001:generateImages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                 prompt,
                 "config": {
                    "numberOfImages": 1,
                 }
            }),
        }).then(handleApiResponse);

        return await response.json();
    }
};
