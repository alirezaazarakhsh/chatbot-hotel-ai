
import { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Corrected the import by replacing 'FunctionCallPart' with 'FunctionCall' as it is not an exported member.
import { GoogleGenAI, GenerateContentResponse, Part, Tool, FunctionDeclaration, Type, FunctionCall } from '@google/genai';
import { Conversation, Message, FAQ, BotSettings, HotelLink, BotVoice, Language } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../api/apiService';
import { translations } from '../i18n/translations';

// Helper to convert data URL to a Gemini Part
const dataUrlToInlineData = (dataUrl: string): Part | null => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    return { inlineData: { mimeType: match[1], data: match[2] } };
}

export const useAppLogic = (language: Language) => {
    const t = useCallback((key: keyof typeof translations.en) => translations[language][key] || key, [language]);
    const [isAppReady, setIsAppReady] = useState(false);
    const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations_v2', []);
    const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('activeChatId_v2', null);
    const [isLoading, setIsLoading] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [botSettings, setBotSettings] = useState<BotSettings>({
        system_instruction: '', default_voice: 'Kore', is_bot_voice_enabled: true,
        available_fonts: [], hotel_links: [], welcome_title: '', welcome_message: '',
        logo_url: 'http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp',
    });
    
    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const [settingsData, faqsData, hotelLinksData] = await Promise.all([
                    apiService.fetchBotSettings(),
                    apiService.fetchFAQs(),
                    apiService.fetchHotelLinks(),
                ]);

                const combinedSettings = { ...settingsData, hotel_links: hotelLinksData };

                const botPersona = t('botPersona');
                const languageRule = t('languageRule');
                const locationServicesInstruction = t('locationServicesInstruction');
                const hotelLinkInstruction = t('hotelLinkInstruction');
                const travelPackageInstruction = t('travelPackageInstruction');
                const imageGenerationInstruction = t('imageGenerationInstruction');
                const voiceCapabilityInstruction = t('voiceCapabilityInstruction');
                
                const hotelLinksList = (combinedSettings.hotel_links && combinedSettings.hotel_links.length > 0)
                    ? `${t('hotelLinkListHeader')}\n${JSON.stringify(combinedSettings.hotel_links, null, 2)}`
                    : '';

                const systemInstruction = [
                    botPersona,
                    combinedSettings.system_instruction || '',
                    languageRule,
                    locationServicesInstruction,
                    voiceCapabilityInstruction,
                    imageGenerationInstruction,
                    hotelLinkInstruction,
                    hotelLinksList,
                    travelPackageInstruction,
                ].filter(Boolean).join('\n\n');
                
                setBotSettings(prev => ({ ...prev, ...combinedSettings, system_instruction: systemInstruction }));
                setFaqs(faqsData);

                if (conversations.length === 0) {
                    const newId = `chat_${Date.now()}`;
                    const newConversation = { id: newId, title: t('newConversationTitle'), messages: [], lastUpdated: Date.now() };
                    setConversations([newConversation]);
                    setActiveChatId(newId);
                } else if (!activeChatId || !conversations.find(c => c.id === activeChatId)) {
                    setActiveChatId(conversations.sort((a,b) => b.lastUpdated - a.lastUpdated)[0]?.id || null);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsAppReady(true);
            }
        };
        initializeApp();
    }, [t]); 

    const updateBotMessage = useCallback((messageId: string, updates: Partial<Message>) => {
        setConversations(prev => prev.map(c => c.id === activeChatId ? {
            ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, ...updates } : m)
        } : c));
    }, [activeChatId, setConversations]);
    
    const startNewChat = useCallback(() => {
        setIsLoading(false);
        if (abortController.current) { abortController.current.abort(); abortController.current = null; }
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = {
            id: newId,
            title: t('newConversationTitle'),
            messages: [],
            lastUpdated: Date.now()
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveChatId(newId);
    }, [setConversations, setActiveChatId, t]);
    
    const handleDeleteConversation = useCallback((id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        const newConversations = conversations.filter(c => c.id !== id);
        if (activeChatId === id) {
            const latestConversation = [...newConversations].sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
            if (latestConversation) {
                setActiveChatId(latestConversation.id);
            } else {
                startNewChat();
            }
        }
        setConversations(newConversations);
    }, [activeChatId, conversations, setActiveChatId, setConversations, startNewChat, t]);
    
    const handleClearChat = useCallback((id: string) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [] } : c));
    }, [setConversations]);
    
    const handleStopGenerating = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
        }
    }, []);

    const generateConversationTitle = useCallback(async (chatId: string, messages: Message[]) => {
        try {
            if (!process.env.API_KEY) return;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const conversationText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            const prompt = `${t('generateTitlePrompt')}\n\n---\n${conversationText}\n---`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            // FIX: Added nullish coalescing operator to handle cases where response.text might be undefined, preventing a type error.
            const title = (response.text ?? '').trim().replace(/"/g, '');
            
            if (title) {
                setConversations(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
            }
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [setConversations, t]);

    const handleSendMessage = useCallback(async (
        input: { text?: string; image?: { base64: string; mimeType: string; dataUrl: string; }, audio?: { base64: string; mimeType: string; dataUrl: string; } },
        callbacks: {
            isBotVoiceEnabled: boolean; botVoice: BotVoice; faqs: FAQ[];
            initAudioContext: () => void; queueAndPlayTTS: (text: string, messageId: string) => Promise<void>;
            isMapEnabled: boolean; userLocation: { lat: number, lng: number } | null;
        }
    ) => {
        if (isLoading || (!input.text?.trim() && !input.image && !input.audio)) return;
        callbacks.initAudioContext();
        abortController.current = new AbortController();
        setIsLoading(true);

        const conversation = conversations.find(c => c.id === activeChatId);
        if (!conversation) { setIsLoading(false); return; }
        
        const isNewChat = conversation.messages.length === 0;

        const userMessage: Message = {
            id: `msg_${Date.now()}_user`,
            sender: 'user',
            text: input.audio ? t('voiceMessagePlaceholder') : input.text || '',
            imageUrl: input.image?.dataUrl,
            audioUrl: input.audio?.dataUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const botMessage: Message = {
            id: `msg_${Date.now()}_bot`, sender: 'bot', text: '', isSpeaking: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedConversation: Conversation = { ...conversation, messages: [...conversation.messages, userMessage, botMessage], lastUpdated: Date.now() };
        setConversations(prev => prev.map(c => c.id === activeChatId ? updatedConversation : c));

        try {
            if (!process.env.API_KEY) throw new Error("API Key is not configured.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const generateImageTool: FunctionDeclaration = {
                name: 'generate_image',
                description: 'Generates an image based on a user description. Only use this when the user explicitly asks to create, draw, or generate an image.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        prompt: {
                            type: Type.STRING,
                            description: 'A detailed, creative, and descriptive prompt for the image to be generated. This must be in English.'
                        }
                    },
                    required: ['prompt']
                }
            };
            const baseTools: Tool[] = [{ functionDeclarations: [generateImageTool] }];
            
            const history = conversation.messages.map(msg => {
                const parts: Part[] = [];
                if (msg.imageUrl) {
                    const inlineDataPart = dataUrlToInlineData(msg.imageUrl);
                    if (inlineDataPart) parts.push(inlineDataPart);
                }
                if (msg.text) parts.push({ text: msg.text });
                 if (msg.toolCall && !msg.toolCall.thinking) {
                    parts.push({ functionResponse: { name: msg.toolCall.name, response: { content: msg.toolCall.args.result } } });
                }
                return { role: msg.sender === 'user' ? 'user' : 'model', parts };
            });

            const userParts: Part[] = [];
            if (input.image) {
                userParts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.base64 } });
            }
            if (input.audio) {
                userParts.push({ inlineData: { mimeType: input.audio.mimeType, data: input.audio.base64 } });
                userParts.push({ text: t('transcribeAndRespond') });
            }
            if (input.text && !input.audio) {
                userParts.push({ text: input.text });
            }

            const contents = [...history, { role: 'user', parts: userParts }];
            
            const config: any = {
                tools: [...baseTools]
            };

            if (callbacks.isMapEnabled) {
                config.tools.unshift({ googleMaps: {} });
                if (callbacks.userLocation) {
                    config.toolConfig = {
                        retrievalConfig: {
                            latLng: {
                                latitude: callbacks.userLocation.lat,
                                longitude: callbacks.userLocation.lng
                            }
                        }
                    };
                }
            }

            let stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    ...config,
                    systemInstruction: botSettings.system_instruction
                }
            });
            
            let fullText = '';
            let finalResponse: GenerateContentResponse | undefined;

            for await (const chunk of stream) {
                if (abortController.current?.signal.aborted) break;

                const functionCall = chunk.functionCalls?.[0];
                if (functionCall) {
                    updateBotMessage(botMessage.id, { toolCall: { name: functionCall.name, args: functionCall.args, thinking: true } });
                    
                    let functionResponse: Part;

                    if (functionCall.name === 'generate_image') {
                        try {
                             const imageResponse = await ai.models.generateImages({
                                model: 'imagen-4.0-generate-001',
                                // FIX: Explicitly convert the prompt argument to a string to prevent "Type 'unknown' is not assignable to type 'string'" error.
                                prompt: String(functionCall.args.prompt),
                                config: { numberOfImages: 1 }
                            });
                             const base64ImageBytes = imageResponse.generatedImages?.[0]?.image.imageBytes;
                             if(base64ImageBytes) {
                                 const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                                 functionResponse = { functionResponse: { name: 'generate_image', response: { content: 'Image generated successfully.', imageUrl } } };
                             } else {
                                 functionResponse = { functionResponse: { name: 'generate_image', response: { content: 'Failed to generate image.' } } };
                             }
                        } catch (e) {
                             console.error("Image generation tool error", e);
                             functionResponse = { functionResponse: { name: 'generate_image', response: { content: 'An error occurred during image generation.' } } };
                        }
                    } else {
                        // Handle other functions here if any
                        functionResponse = { functionResponse: { name: functionCall.name, response: { content: 'Unknown function' } } };
                    }
                    
                    // FIX: Wrapped the functionResponse Part in a Content object with role 'tool' to match the expected type for the 'contents' array.
                    const newContents = [...contents, { role: 'model', parts: [{ functionCall }] }, { role: 'tool', parts: [functionResponse] }];

                    // Send the function response back to the model
                    stream = await ai.models.generateContentStream({
                        model: 'gemini-2.5-flash',
                        contents: newContents,
                         config: {
                            ...config,
                            systemInstruction: botSettings.system_instruction
                        }
                    });
                     // FIX: Cast the 'response' object to access its properties safely, resolving 'unknown' type errors.
                    const toolResponsePayload = functionResponse.functionResponse.response as { content: string, imageUrl?: string };

                     // Update the message to indicate we're no longer "thinking"
                     updateBotMessage(botMessage.id, { toolCall: { name: functionCall.name, args: { result: toolResponsePayload.content }, thinking: false } });

                     // If the image was generated, attach it to the message immediately
                     if(toolResponsePayload.imageUrl){
                        updateBotMessage(botMessage.id, { imageUrl: toolResponsePayload.imageUrl });
                     }

                } else {
                    // FIX: Added nullish coalescing operator to safely handle streaming chunks that might not have a 'text' property.
                    fullText += chunk.text ?? '';
                    finalResponse = chunk;
                    updateBotMessage(botMessage.id, { text: fullText });
                }
            }

            if (abortController.current?.signal.aborted) {
                updateBotMessage(botMessage.id, { isCancelled: true, text: fullText + `\n\n(${t('responseStopped')})` });
                return;
            }

            const botResponseText = fullText;
            const groundingChunks = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            updateBotMessage(botMessage.id, { text: botResponseText, groundingChunks });
            
            if (isNewChat && activeChatId) {
                generateConversationTitle(activeChatId, [userMessage, { ...botMessage, text: botResponseText }]);
            }
            
            if (callbacks.isBotVoiceEnabled && botResponseText) {
                updateBotMessage(botMessage.id, { isSpeaking: true });
                await callbacks.queueAndPlayTTS(botResponseText, botMessage.id);
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error(t('errorMessage'), error);
                updateBotMessage(botMessage.id, { text: `${t('errorMessage')}${error.message}` });
            }
        } finally {
            setIsLoading(false);
            abortController.current = null;
        }
    }, [activeChatId, conversations, isLoading, botSettings.system_instruction, setConversations, updateBotMessage, t, generateConversationTitle]);

    const handleFeedback = useCallback((messageId: string, feedback: 'like' | 'dislike') => {
        setConversations(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: c.messages.map(m => {
                        if (m.id === messageId) {
                            const newFeedback = m.feedback === feedback ? null : feedback;
                            return { ...m, feedback: newFeedback };
                        }
                        return m;
                    })
                };
            }
            return c;
        }));
    }, [activeChatId, setConversations]);

    // FIX: Export `setConversations` to allow parent components to modify the conversations state.
    return {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleClearChat, handleStopGenerating,
        updateBotMessage, t, handleFeedback
    };
};
