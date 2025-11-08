import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import { Conversation, Message, FAQ, BotSettings, HotelLink, BotVoice, Language, TravelPackage } from '../types';
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
        available_fonts: [], hotel_links: [], travel_packages: [], welcome_title: '', welcome_message: '',
        logo_url: 'http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp',
    });
    
    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const [settingsData, faqsData, hotelLinksData, travelPackagesData] = await Promise.all([
                    apiService.fetchBotSettings(),
                    apiService.fetchFAQs(),
                    apiService.fetchHotelLinks(),
                    apiService.fetchTravelPackages()
                ]);

                const combinedSettings = { ...settingsData, hotel_links: hotelLinksData, travel_packages: travelPackagesData };

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
                
                const travelPackagesList = (combinedSettings.travel_packages && combinedSettings.travel_packages.length > 0)
                    ? `${t('travelPackageListHeader')}\n${JSON.stringify(combinedSettings.travel_packages, null, 2)}`
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
                    travelPackagesList
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
            
            const title = response.text.trim().replace(/"/g, '');
            
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
            
            const history = conversation.messages.map(msg => {
                const parts: Part[] = [];
                if (msg.imageUrl) {
                    const inlineDataPart = dataUrlToInlineData(msg.imageUrl);
                    if (inlineDataPart) parts.push(inlineDataPart);
                }
                if (msg.text) parts.push({ text: msg.text });
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

            const config: any = {};
            if (callbacks.isMapEnabled && callbacks.userLocation) {
                config.tools = [{ googleMaps: {} }];
                config.toolConfig = {
                    retrievalConfig: {
                        latLng: {
                            latitude: callbacks.userLocation.lat,
                            longitude: callbacks.userLocation.lng
                        }
                    }
                }
            }

            const stream = await ai.models.generateContentStream({
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
                fullText += chunk.text;
                finalResponse = chunk;
                updateBotMessage(botMessage.id, { text: fullText });
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

            const imagePromptRegex = /\[GENERATE_IMAGE:\s*(.*?)\]/s;
            const imagePromptMatch = botResponseText.match(imagePromptRegex);

            if (imagePromptMatch && imagePromptMatch[1]) {
                const imagePrompt = imagePromptMatch[1].trim();
                const generatingText = botResponseText.replace(imagePromptRegex, t('generatingImage')).trim();
                updateBotMessage(botMessage.id, { text: generatingText });

                let finalBotText = botResponseText.replace(imagePromptRegex, '').trim();
                let imageUrl: string | undefined = undefined;

                try {
                    const imageResponse = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001',
                        prompt: imagePrompt,
                        config: { numberOfImages: 1 }
                    });
                    
                    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                         const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                         imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    }
                    if (!imageUrl) finalBotText = `${finalBotText}\n\n${t('imageGenerationError')}`.trim();
                } catch (imageError) {
                    console.error("Image generation error:", imageError);
                    finalBotText = `${finalBotText}\n\n${t('imageGenerationError')}`.trim();
                }
                
                updateBotMessage(botMessage.id, { text: finalBotText, imageUrl });
                if (callbacks.isBotVoiceEnabled && finalBotText) {
                    updateBotMessage(botMessage.id, { isSpeaking: true });
                    await callbacks.queueAndPlayTTS(finalBotText, botMessage.id);
                }
            } else {
                if (callbacks.isBotVoiceEnabled && botResponseText) {
                    updateBotMessage(botMessage.id, { isSpeaking: true });
                    await callbacks.queueAndPlayTTS(botResponseText, botMessage.id);
                }
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

    return {
        isAppReady, conversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleStopGenerating,
        updateBotMessage, t, handleFeedback
    };
};