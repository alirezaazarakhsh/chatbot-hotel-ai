

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Conversation, Message, FAQ, BotSettings, HotelLink, BotVoice, Language } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../api/apiService';
import { translations } from '../i18n/translations';

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
                const [settings, faqsData] = await Promise.all([
                    apiService.fetchBotSettings(),
                    apiService.fetchFAQs()
                ]);

                const botPersona = t('botPersona');
                const languageRule = t('languageRule');
                const imageGenerationInstruction = t('imageGenerationInstruction');
                const voiceCapabilityInstruction = t('voiceCapabilityInstruction');
                
                const systemInstruction = [
                    botPersona,
                    languageRule,
                    voiceCapabilityInstruction,
                    settings.system_instruction || '',
                    imageGenerationInstruction
                ].filter(Boolean).join('\n\n');
                
                setBotSettings(prev => ({ ...prev, ...settings, system_instruction: systemInstruction }));
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
            setIsLoading(false);
            setConversations(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    const lastMessage = c.messages[c.messages.length - 1];
                    if (lastMessage?.sender === 'bot') {
                        return {
                            ...c,
                            messages: [...c.messages.slice(0, -1), {
                                ...lastMessage,
                                isCancelled: true,
                                text: lastMessage.text ? lastMessage.text + `\n\n(${t('responseStopped')})` : t('responseStopped')
                            }]
                        };
                    }
                }
                return c;
            }));
        }
    }, [activeChatId, setConversations, t]);

    const handleSendMessage = useCallback(async (
        input: { text?: string; image?: { base64: string; mimeType: string }; audio?: { data: string; mimeType: string; url: string } },
        callbacks: {
            isBotVoiceEnabled: boolean; botVoice: BotVoice; hotelLinks: HotelLink[]; faqs: FAQ[];
            initAudioContext: () => void; queueAndPlayTTS: (text: string, messageId: string) => Promise<void>;
        }
    ) => {
        if (isLoading || (!input.text?.trim() && !input.image && !input.audio)) return;
        callbacks.initAudioContext();
        abortController.current = new AbortController();
        setIsLoading(true);

        const conversation = conversations.find(c => c.id === activeChatId);
        if (!conversation) { setIsLoading(false); return; }

        const userMessage: Message = {
            id: `msg_${Date.now()}_user`, sender: 'user', text: input.text || '',
            imageUrl: input.image ? `data:${input.image.mimeType};base64,${input.image.base64}` : undefined,
            audioUrl: input.audio?.url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const botMessage: Message = {
            id: `msg_${Date.now()}_bot`, sender: 'bot', text: '', isSpeaking: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedConversation: Conversation = { ...conversation, messages: [...conversation.messages, userMessage, botMessage], lastUpdated: Date.now() };
        if (conversation.messages.length === 0 && input.text) updatedConversation.title = input.text.substring(0, 35);
        setConversations(prev => prev.map(c => c.id === activeChatId ? updatedConversation : c));

        try {
            const history = conversation.messages.map(m => ({ role: m.sender, content: m.text }));
            const payload = {
                message: input.text || '', 
                audio_data: input.audio?.data, 
                image_data: input.image?.base64, 
                history,
                system_instruction: botSettings.system_instruction, 
                hotel_links: callbacks.hotelLinks,
                faqs: callbacks.faqs.map(f => ({ question: f.question, answer: f.answer })),
            };

            const botResponseText = await apiService.sendChatMessage(payload, abortController.current.signal);
            
            const imagePromptRegex = /\[GENERATE_IMAGE:\s*(.*?)\]/s;
            const imagePromptMatch = botResponseText.match(imagePromptRegex);

            if (imagePromptMatch && imagePromptMatch[1]) {
                const imagePrompt = imagePromptMatch[1].trim();
                const generatingText = botResponseText.replace(imagePromptRegex, t('generatingImage')).trim();
                updateBotMessage(botMessage.id, { text: generatingText });

                let finalBotText = botResponseText.replace(imagePromptRegex, '').trim();
                let imageUrl: string | undefined = undefined;

                try {
                    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key is not configured.");
                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: imagePrompt }] },
                        config: { responseModalities: [Modality.IMAGE] },
                    });
                    
                    let foundImage = false;
                    for (const part of response.candidates?.[0]?.content?.parts || []) {
                        if (part.inlineData) {
                            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                            foundImage = true;
                            break;
                        }
                    }
                    if (!foundImage) {
                        finalBotText = `${finalBotText}\n\n${t('imageGenerationError')}`.trim();
                    }
                } catch (imageError) {
                    console.error("Image generation error:", imageError);
                    finalBotText = `${finalBotText}\n\n${t('imageGenerationError')}`.trim();
                }
                
                updateBotMessage(botMessage.id, { text: finalBotText, isCancelled: false, imageUrl });
                if (callbacks.isBotVoiceEnabled && finalBotText) {
                    updateBotMessage(botMessage.id, { isSpeaking: true });
                    await callbacks.queueAndPlayTTS(finalBotText, botMessage.id);
                }
            } else {
                updateBotMessage(botMessage.id, { text: botResponseText, isCancelled: false });
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
    }, [activeChatId, conversations, isLoading, botSettings.system_instruction, setConversations, updateBotMessage, t]);

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