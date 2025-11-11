import { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Use relative paths for local module imports
import { Conversation, Message, FAQ, BotSettings, HotelLink, BotVoice, Language, Part, Tool, FunctionCall, Content } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../api/apiService';
import { geminiService } from '../api/geminiService';
import { translations } from '../i18n/translations';

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
    }, [t, setConversations, setActiveChatId]); 

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
            const conversationText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            const prompt = `${t('generateTitlePrompt')}\n\n---\n${conversationText}\n---`;
            
            const response = await geminiService.generateContent(prompt);
            const title = response.trim().replace(/"/g, '');
            
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
            // Fix: Refactored history creation from `flatMap` to `reduce` to prevent potential type inference issues.
            const history: Content[] = conversation.messages.reduce((acc: Content[], msg: Message) => {
                if (msg.sender === 'user') {
                    const userParts: Part[] = [];
                    if (msg.imageUrl) {
                        const inlineDataPart = dataUrlToInlineData(msg.imageUrl);
                        if (inlineDataPart) userParts.push(inlineDataPart);
                    }
                    if (msg.text) userParts.push({ text: msg.text });
                    if (userParts.length > 0) {
                        acc.push({ role: 'user', parts: userParts });
                    }
                } else { // sender === 'bot'
                    if (msg.toolCall && !msg.toolCall.thinking && msg.toolCall.result) {
                        acc.push({ role: 'model', parts: [{ functionCall: { name: msg.toolCall.name, args: msg.toolCall.args } }] });
                        acc.push({ role: 'tool', parts: [{ functionResponse: { name: msg.toolCall.name, response: msg.toolCall.result } }] });
                    }
                    if (msg.text) {
                        acc.push({ role: 'model', parts: [{ text: msg.text }] });
                    }
                }
                return acc;
            }, []);

            const userParts: Part[] = [];
            if (input.image) userParts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.base64 } });
            if (input.audio) {
                userParts.push({ inlineData: { mimeType: input.audio.mimeType, data: input.audio.base64 } });
                userParts.push({ text: t('transcribeAndRespond') });
            }
            if (input.text && !input.audio) userParts.push({ text: input.text });

            const contents = [...history, { role: 'user', parts: userParts }];
            
            let fullText = '';
            
            const stream = geminiService.generateContentStream(
                contents,
                botSettings.system_instruction,
                callbacks.userLocation,
                abortController.current.signal
            );

            for await (const chunk of stream) {
                if(chunk.text) fullText += chunk.text;
                
                if (chunk.functionCall) {
                    const functionCall = chunk.functionCall;
                    updateBotMessage(botMessage.id, { toolCall: { name: functionCall.name, args: functionCall.args, thinking: true } });
                    continue; 
                }

                if (chunk.imageUrl) {
                    updateBotMessage(botMessage.id, { imageUrl: chunk.imageUrl, toolCall: undefined });
                }

                updateBotMessage(botMessage.id, { text: fullText, groundingChunks: chunk.groundingChunks });
            }
            
            if (abortController.current?.signal.aborted) {
                updateBotMessage(botMessage.id, { isCancelled: true, text: fullText + `\n\n(${t('responseStopped')})` });
                return;
            }
            
            if (isNewChat && activeChatId) {
                generateConversationTitle(activeChatId, [userMessage, { ...botMessage, text: fullText }]);
            }
            
            if (callbacks.isBotVoiceEnabled && fullText) {
                updateBotMessage(botMessage.id, { isSpeaking: true });
                await callbacks.queueAndPlayTTS(fullText, botMessage.id);
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error(t('errorMessage'), error);
                updateBotMessage(botMessage.id, { text: `${t('errorMessage')}${error.message || 'Unknown error'}` });
            }
        } finally {
            setIsLoading(false);
            abortController.current = null;
        }
    }, [activeChatId, conversations, isLoading, botSettings.system_instruction, setConversations, updateBotMessage, t, generateConversationTitle]);

    const handleFeedback = useCallback((messageId: string, feedback: 'like' | 'dislike') => {
        setConversations(prev => prev.map(c => c.id === activeChatId ? {
            ...c,
            messages: c.messages.map(m => m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m)
        } : c));
    }, [activeChatId, setConversations]);

    return {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleClearChat, handleStopGenerating,
        updateBotMessage, t, handleFeedback
    };
};
