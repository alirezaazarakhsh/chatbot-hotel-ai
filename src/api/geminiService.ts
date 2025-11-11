import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Content, Tool } from '@google/genai';

// Initialize the Google Gemini AI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

export const geminiService = {
    /**
     * Generates a single, non-streamed text response. Used for generating conversation titles.
     */
    generateContent: async (prompt: string): Promise<string> => {
        try {
            const response = await ai.models.generateContent({
                model: textModel,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            return response.text;
        } catch (error: any) {
            console.error(`Gemini API Error (generateContent):`, error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    },

    /**
     * Generates a streamed response for chat messages.
     */
    generateContentStream: (
        contents: Content[],
        systemInstruction: string,
        tools: Tool[],
        toolConfig: any
    ): AsyncIterable<GenerateContentResponse> => {
        const config = {
            // Fix: systemInstruction should be a string.
            systemInstruction: systemInstruction,
            tools: tools.length > 0 ? tools : undefined,
            toolConfig: toolConfig,
        };

        return ai.models.generateContentStream({
            model: textModel,
            contents,
            config,
        });
    },

    /**
     * Generates an image using the Imagen model.
     */
    generateImage: async (prompt: string): Promise<string | undefined> => {
        try {
            const response = await ai.models.generateImages({
                model: imageModel,
                prompt,
                config: { numberOfImages: 1 },
            });
            
            const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
            return base64ImageBytes ? `data:image/png;base64,${base64ImageBytes}` : undefined;
        } catch (error) {
            console.error("Image generation service error:", error);
            return undefined;
        }
    },
};