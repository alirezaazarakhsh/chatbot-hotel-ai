// A custom service to interact with the Gemini API via a local proxy.
// This avoids direct calls from the client to Google's servers, solving filtering issues.

const API_BASE_PATH = '/gemini-api/v1beta/models/';

async function* streamJson(response: Response, signal: AbortSignal) {
    if (!response.body) throw new Error("Response has no body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const cleanup = () => reader.releaseLock();
    signal.addEventListener('abort', cleanup);

    try {
        while (!signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            
            // The response is a stream of JSON objects, not always perfectly split.
            // They are sent as an array `[ {}, {}, ... ]`. We process them as they arrive.
            let potentialJson = buffer.replace(/^\[\s*,?/, '').replace(/,\s*$/, '');
            let objects = potentialJson.split(/,(?=\{)/);

            let lastObjectIncomplete = !potentialJson.endsWith('}');
            
            if (lastObjectIncomplete) {
                 buffer = objects.pop() || '';
            } else {
                 buffer = '';
            }
           
            for (const objStr of objects) {
                if (objStr.trim()) {
                    try {
                        yield JSON.parse(objStr);
                    } catch (e) {
                        // This might be an incomplete JSON object, so we put it back in the buffer.
                        buffer = objStr + buffer;
                    }
                }
            }
        }
    } finally {
        signal.removeEventListener('abort', cleanup);
        if (!reader.closed) reader.cancel();
    }
}

async function makeApiRequest(url: string, body: object, signal?: AbortSignal) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response;
}

export const geminiService = {
    async * generateContentStream(model: string, params: object, signal: AbortSignal) {
        const url = `${API_BASE_PATH}${model}:streamGenerateContent`;
        const response = await makeApiRequest(url, params, signal);
        yield* streamJson(response, signal);
    },

    async generateContent(model: string, params: object): Promise<string> {
        const url = `${API_BASE_PATH}${model}:generateContent`;
        const response = await makeApiRequest(url, params);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },

    async generateImage(prompt: string, signal?: AbortSignal): Promise<string | null> {
        const url = `${API_BASE_PATH}imagen-4.0-generate-001:generateImages`;
        const body = { prompt, number_of_images: 1 };
        const response = await makeApiRequest(url, body, signal);
        const data = await response.json();
        const base64ImageBytes = data.generated_images?.[0]?.image?.image_bytes;
        return base64ImageBytes ? `data:image/png;base64,${base64ImageBytes}` : null;
    }
};