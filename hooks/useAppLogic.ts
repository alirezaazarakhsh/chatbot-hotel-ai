import { useState, useEffect, useRef, useCallback } from 'react';
import type { Part } from '@google/genai';
import { Conversation, Message, FAQ, BotSettings, BotVoice, Language, GroundingChunk } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../api/apiService';
import { translations } from '../i18n/translations';
import { geminiService } from '../api/geminiService';

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
                    botPersona, combinedSettings.system_instruction || '', languageRule, locationServicesInstruction,
                    voiceCapabilityInstruction, imageGenerationInstruction, hotelLinkInstruction,
                    hotelLinksList, travelPackageInstruction,
                ].filter(Boolean).join('\n\n');
                
                setBotSettings(prev => ({ ...prev, ...combinedSettings, system_instruction: systemInstruction }));
                setFaqs(faqsData);

                if (conversations.length === 0) {
                    const newId = `chat_${Date.now()}`;
                    setConversations([{ id: newId, title: t('newConversationTitle'), messages: [], lastUpdated: Date.now() }]);
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
        setConversations(prev => [...prev, { id: newId, title: t('newConversationTitle'), messages: [], lastUpdated: Date.now() }]);
        setActiveChatId(newId);
    }, [setConversations, setActiveChatId, t]);
    
    const handleDeleteConversation = useCallback((id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        const newConversations = conversations.filter(c => c.id !== id);
        if (activeChatId === id) {
            const latestConversation = [...newConversations].sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
            setActiveChatId(latestConversation ? latestConversation.id : null);
            if (!latestConversation) startNewChat();
        }
        setConversations(newConversations);
    }, [activeChatId, conversations, setActiveChatId, setConversations, startNewChat, t]);
    
    const handleClearChat = useCallback((id: string) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [] } : c));
    }, [setConversations]);
    
    const handleStopGenerating = useCallback(() => {
        if (abortController.current) abortController.current.abort();
    }, []);

    const generateConversationTitle = useCallback(async (chatId: string, messages: Message[]) => {
        try {
            const conversationText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            const prompt = `${t('generateTitlePrompt')}\n\n---\n${conversationText}\n---`;
            const responseText = await geminiService.generateContent('gemini-2.5-flash', { contents: [{ parts: [{ text: prompt }] }] });
            const title = responseText.trim().replace(/"/g, '');
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
            isBotVoiceEnabled: boolean; botVoice: BotVoice; faqs: FAQ[]; initAudioContext: () => void;
            queueAndPlayTTS: (text: string, messageId: string) => Promise<void>; isMapEnabled: boolean;
            userLocation: { lat: number, lng: number } | null;
        }
    ) => {
        if (isLoading || (!input.text?.trim() && !input.image && !input.audio)) return;
        callbacks.initAudioContext();
        abortController.current = new AbortController();
        setIsLoading(true);

        const conversation = conversations.find(c => c.id === activeChatId);
        if (!conversation) { setIsLoading(false); return; }
        
        const userMessage: Message = {
            id: `msg_${Date.now()}_user`, sender: 'user', text: input.audio ? t('voiceMessagePlaceholder') : input.text || '',
            imageUrl: input.image?.dataUrl, audioUrl: input.audio?.dataUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const botMessage: Message = {
            id: `msg_${Date.now()}_bot`, sender: 'bot', text: '', isSpeaking: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => prev.map(c => c.id === activeChatId ? { ...conversation, messages: [...conversation.messages, userMessage, botMessage], lastUpdated: Date.now() } : c));

        try {
            const generateImageTool = {
                functionDeclarations: [{
                    name: 'generate_image',
                    description: 'Generates an image based on a user description. Only use this when the user explicitly asks to create, draw, or generate an image.',
                    parameters: { type: 'OBJECT', properties: { prompt: { type: 'STRING', description: 'A detailed, creative, and descriptive prompt for the image to be generated. This must be in English.' } }, required: ['prompt'] }
                }]
            };

            const history = conversation.messages.flatMap(msg => {
                const userParts: Part[] = [];
                if (msg.sender === 'user') {
                    if (msg.imageUrl) { const p = dataUrlToInlineData(msg.imageUrl); if (p) userParts.push(p); }
                    if (msg.text) userParts.push({ text: msg.text });
                    return userParts.length > 0 ? [{ role: 'user', parts: userParts }] : [];
                }
                const modelTurns: any[] = [];
                if (msg.toolCall && !msg.toolCall.thinking && msg.toolCall.result) {
                    modelTurns.push({ role: 'model', parts: [{ functionCall: { name: msg.toolCall.name, args: msg.toolCall.args } }] });
                    modelTurns.push({ role: 'tool', parts: [{ functionResponse: { name: msg.toolCall.name, response: msg.toolCall.result } }] });
                }
                if (msg.text) modelTurns.push({ role: 'model', parts: [{ text: msg.text }] });
                return modelTurns;
            });

            const userParts: Part[] = [];
            if (input.image) userParts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.base64 } });
            if (input.audio) {
                userParts.push({ inlineData: { mimeType: input.audio.mimeType, data: input.audio.base64 } });
                userParts.push({ text: t('transcribeAndRespond') });
            }
            if (input.text && !input.audio) userParts.push({ text: input.text });

            const contents = [...history, { role: 'user', parts: userParts }];
            
            const generationConfig: any = {};
            const tools: any[] = [generateImageTool];
            if (callbacks.isMapEnabled && callbacks.userLocation) {
                tools.unshift({ googleMaps: {} });
                generationConfig.toolConfig = {
                    gmpConfig: {
                        latLng: {
                            latitude: callbacks.userLocation.lat,
                            longitude: callbacks.userLocation.lng
                        }
                    }
                };
            }

            let stream = geminiService.generateContentStream('gemini-2.5-flash', {
                contents, tools, systemInstruction: { parts: [{ text: botSettings.system_instruction }] },
            }, abortController.current.signal);

            let fullText = '';
            let finalGroundingChunks: GroundingChunk[] = [];
            
            for await (const chunk of stream) {
                const candidate = chunk.candidates?.[0];
                if (!candidate) continue;

                if (candidate.groundingMetadata?.groundingChunks) {
                    finalGroundingChunks = candidate.groundingMetadata.groundingChunks;
                }

                const part = candidate.content?.parts?.[0];
                if (!part) continue;

                if (part.functionCall) {
                    const { name, args } = part.functionCall;
                    updateBotMessage(botMessage.id, { toolCall: { name, args, thinking: true } });

                    let functionResponseResult: any;
                    if (name === 'generate_image') {
                        try {
                            const imageUrl = await geminiService.generateImage(String(args.prompt), abortController.current.signal);
                            functionResponseResult = { content: 'Image generated successfully.', imageUrl };
                            updateBotMessage(botMessage.id, { imageUrl });
                        } catch (e) {
                            console.error("Image generation tool error", e);
                            functionResponseResult = { content: 'An error occurred during image generation.' };
                        }
                    } else {
                        functionResponseResult = { content: 'Unknown function' };
                    }
                    
                    updateBotMessage(botMessage.id, { toolCall: { name, args, result: functionResponseResult, thinking: false } });
                    
                    const newContents = [...contents, { role: 'model', parts: [part] }, { role: 'tool', parts: [{ functionResponse: { name, response: functionResponseResult } }] }];
                    stream = geminiService.generateContentStream('gemini-2.5-flash', {
                        contents: newContents, tools, systemInstruction: { parts: [{ text: botSettings.system_instruction }] },
                    }, abortController.current.signal);

                } else if (part.text) {
                    fullText += part.text;
                    updateBotMessage(botMessage.id, { text: fullText });
                }
            }

            if (abortController.current?.signal.aborted) {
                updateBotMessage(botMessage.id, { isCancelled: true, text: fullText + `\n\n(${t('responseStopped')})` });
                return;
            }
            
            updateBotMessage(botMessage.id, { text: fullText, groundingChunks: finalGroundingChunks });
            
            if (conversation.messages.length === 0 && activeChatId) {
                generateConversationTitle(activeChatId, [userMessage, { ...botMessage, text: fullText }]);
            }
            
            if (callbacks.isBotVoiceEnabled && fullText) {
                updateBotMessage(botMessage.id, { isSpeaking: true });
                await callbacks.queueAndPlayTTS(fullText, botMessage.id);
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
        setConversations(prev => prev.map(c => c.id === activeChatId ? {
            ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m)
        } : c));
    }, [activeChatId, setConversations]);

    return {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleClearChat, handleStopGenerating,
        updateBotMessage, t, handleFeedback
    };
};
