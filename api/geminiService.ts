import type { GenerateContentResponse } from '@google/genai';

interface GeminiStreamChunk {
    text: () => string;
    functionCalls: () => any[] | undefined;
    candidates: any[] | undefined;
}

function parseAndProcessChunk(chunk: any): GeminiStreamChunk {
    const candidates = chunk.candidates;
    const firstCandidate = candidates?.[0];
    
    const text = () => {
        if (!firstCandidate?.content?.parts) return "";
        return firstCandidate.content.parts.filter((p: any) => p.text).map((p: any) => p.text).join('');
    };

    const functionCalls = () => {
        if (!firstCandidate?.content?.parts) return undefined;
        const calls = firstCandidate.content.parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
        return calls.length > 0 ? calls : undefined;
    };

    return {
        text: text,
        functionCalls: functionCalls,
        candidates: candidates
    };
}


export const geminiService = {
    async generateContent(request: { model: string, contents: any[] }): Promise<{ text: () => string }> {
        const res = await fetch(`/gemini-api/v1beta/models/${request.model}:generateContent?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: request.contents })
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Gemini API Error: ${res.status} ${res.statusText} - ${errorText}`);
        }
        const data = await res.json();
        return {
            text: () => data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '',
        };
    },

    async *generateContentStream(request: { model: string, contents: any[], config: any, abortSignal: AbortSignal }): AsyncGenerator<GeminiStreamChunk> {
        const { model, contents, config, abortSignal } = request;
        const body = {
            contents,
            tools: config.tools,
            system_instruction: config.systemInstruction ? { parts: [{ text: config.systemInstruction }] } : undefined,
        };

        const res = await fetch(`/gemini-api/v1beta/models/${model}:streamGenerateContent?key=${process.env.API_KEY}&alt=sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: abortSignal,
        });

        if (!res.ok || !res.body) {
            const errorText = await res.text();
            throw new Error(`Gemini API Error: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring(6);
                        if (jsonStr) {
                           const parsedJson = JSON.parse(jsonStr);
                           yield parseAndProcessChunk(parsedJson);
                        }
                    } catch (e) {
                        console.error("Failed to parse SSE chunk:", line, e);
                    }
                }
            }
        }
    },
    
    async generateImages(request: { model: string, prompt: string, config: any }): Promise<{ generatedImages: { image: { imageBytes: string } }[] }> {
        const { model, prompt, config } = request;
        const res = await fetch(`/gemini-api/v1/models/${model}:generateImages?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, number_of_images: config.numberOfImages || 1 })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Image Generation API Error: ${res.status} ${res.statusText} - ${errorText}`);
        }
        return await res.json();
    }
};
