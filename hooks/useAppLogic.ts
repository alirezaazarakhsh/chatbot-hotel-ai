
import { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, FAQ, BotSettings, HotelLink, BotVoice, Language } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../api/apiService';
import { translations } from '../i18n/translations';

export const useAppLogic = (language: Language) => {
    const t = useCallback((key: keyof typeof translations.en) => translations[language][key] || key, [language]);
    const [isAppReady, setIsAppReady] = useState(false);
    const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations_v2', []);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [botSettings, setBotSettings] = useState<BotSettings>({
        system_instruction: '', default_voice: 'Kore', is_bot_voice_enabled: true,
        available_fonts: [], hotel_links: [], welcome_title: '', welcome_message: '',
        logo_url: 'http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp'
    });
    const abortControllerRef = useRef<AbortController | null>(null);

    const startNewChat = useCallback(() => {
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = { id: newId, title: t('newConversationTitle'), messages: [], lastUpdated: Date.now() };
        setConversations(prev => [...prev, newConversation]);
        setActiveChatId(newId);
    }, [setConversations, t]);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const settings = await apiService.fetchBotSettings();
                setBotSettings(prev => ({...prev, ...settings}));
                const faqsData = await apiService.fetchFAQs(); 
                
                // Translate FAQs if language is English
                const translatedFaqs = language === 'en' ? await Promise.all(faqsData.map(async (faq) => {
                     const titlePrompt = `Translate the following FAQ to English. Respond with JSON in this exact format {"q": "...", "a": "..."}. Do not add any other text.\n\nQuestion: "${faq.question}"\nAnswer: "${faq.answer}"`;
                     try {
                        const translationResponse = await apiService.sendChatMessage({ message: titlePrompt, system_instruction: "You are a JSON translation service." }, new AbortController().signal);
                        const parsed = JSON.parse(translationResponse.replace(/```json\n?|\n?```/g, ''));
                        return { ...faq, question: parsed.q, answer: parsed.a };
                     } catch (e) {
                         return faq; // Fallback to original
                     }
                })) : faqsData;
                
                setFaqs(translatedFaqs);
                
                if (conversations.length === 0) startNewChat();
                else setActiveChatId(conversations.reduce((a, b) => a.lastUpdated > b.lastUpdated ? a : b).id);
            } catch (error) { 
                console.error("Initialization failed:", error); 
                if (conversations.length === 0) startNewChat();
                else if(activeChatId === null) setActiveChatId(conversations[0]?.id || null);
            } finally { setIsAppReady(true); }
        };
        initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]); // Re-initialize if language changes to get translated FAQs

    const updateBotMessage = useCallback((botMessageId: string, updates: Partial<Message> | ((prevMessage: Message) => Partial<Message>)) => {
        if (!activeChatId) return;
        setConversations(prev => prev.map(c => {
            if (c.id !== activeChatId) return c;
            const newMessages = c.messages.map(m => {
                if (m.id !== botMessageId) return m;
                const newUpdates = typeof updates === 'function' ? updates(m) : updates;
                return { ...m, ...newUpdates };
            });
            return { ...c, messages: newMessages };
        }));
    }, [activeChatId, setConversations]);
    
    const handleSendMessage = useCallback(async (
        messageData: { text?: string; audio?: { data: string; mimeType: string; url: string; }; image?: { dataUrl: string; base64: string; mimeType: string; }; },
        { isBotVoiceEnabled, botVoice, hotelLinks, faqs: currentFaqs, initAudioContext, queueAndPlayTTS }:
        { isBotVoiceEnabled: boolean; botVoice: BotVoice; hotelLinks: HotelLink[]; faqs: FAQ[]; initAudioContext: () => void; queueAndPlayTTS: (text: string, messageId: string) => Promise<void> }
    ) => {
        const { text = '', audio, image } = messageData;
        if (isBotVoiceEnabled) initAudioContext();
        if ((!text.trim() && !audio && !image) || isLoading || !activeChatId) return;
        
        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        
        const currentConvo = conversations.find(c => c.id === activeChatId);
        if (!currentConvo) { setIsLoading(false); return; }

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const userMessage: Message = { id: `msg_${Date.now()}`, sender: 'user', text, audioUrl: audio?.url, imageUrl: image?.dataUrl, timestamp };
        const botMessage: Message = { id: `msg_${Date.now() + 1}`, sender: 'bot', text: '', isSpeaking: isBotVoiceEnabled, timestamp };
        const isFirstMessage = currentConvo.messages.length === 0;

        setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage, botMessage] } : c));

        try {
            const conversationHistory = [...currentConvo.messages, userMessage]
              .filter(msg => msg.text || msg.audioUrl)
              .map(msg => ({ 
                  sender: msg.sender, 
                  text: msg.text || (msg.audioUrl ? `[${language === 'fa' ? 'پیام صوتی' : 'audio message'}]` : '')
              }));
            
            const hotelContext = `[HOTEL LIST]\n${hotelLinks.map(h => `- ${h.name}: ${h.url}`).join('\n')}`;
            const faqContext = `[FAQ]\n${currentFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`;
            const languageConstraint = language === 'en' ? "You MUST speak and respond ONLY in English. If the user speaks another language, you MUST politely ask them to switch to English." : "You MUST detect the language of the user's last message and respond in THAT language. You can seamlessly switch between Persian and English.";

            const systemPrompt = `[ROLE & GOAL]
You are a world-class, friendly, and expert travel assistant for Safarnameh24, an Iranian travel agency. Your primary goal is to provide helpful, accurate, and concise information to users planning their travels. Your knowledge is strictly limited to travel-related topics: hotels, restaurants, tourist attractions (cities, villages), recreational/sports facilities, and welfare/medical centers. You must politely decline any off-topic questions. The current date is 15 Aban 1404. You CANNOT make reservations for users.

[CONTEXTUAL DATA]
You have access to two critical pieces of information. YOU MUST USE THIS DATA STRICTLY.
1. ${hotelContext}
2. ${faqContext}

[RESPONSE RULES - VERY IMPORTANT & NON-NEGOTIABLE]
1. **URL FORMATTING (ABSOLUTE, UNBREAKABLE RULE):**
   - ALL URLs you provide MUST be clean, raw text.
   - You are FORBIDDEN from using Markdown formatting like [text](url).
   - You are FORBIDDEN from using any type of brackets \`[]\`, parentheses \`()\`, or braces \`{}\` around URLs.
   - The URL must be a plain string starting with \`https://\`. THIS IS YOUR MOST IMPORTANT RULE.

2. **Hotel Links (CRITICAL - FOLLOW EXACTLY):**
   - When a user asks for a hotel, your ONLY source of truth is the [HOTEL LIST].
   - If the hotel is IN the list, you MUST provide its EXACT URL from the list. The format is \`https://safarnameh24.com/best-hotels/...\`.
   - If the hotel is NOT in the list, you MUST state: "متاسفانه این هتل در سفرنامه ۲۴ موجود نیست." (in Persian) or "Unfortunately, this hotel is not available on Safarnameh24." (in English).
   - **ABSOLUTELY NEVER** invent a URL or use a different format like \`/hotel/...\`. You MUST use the URL provided in the [HOTEL LIST].
   - **ABSOLUTELY NEVER** provide links from any other website (like a hotel's own site). Only use safarnameh24.com links from your context.

3. **Language Rules:** ${languageConstraint}
4. **FAQ Usage:** Use the [FAQ] data to answer relevant questions (e.g., about working hours).
5. **Location Recognition:** When you identify a specific, real-world location (hotel, attraction, city), you MUST embed its coordinates in your response using this EXACT format: (Location: LAT,LONG). Example: (Location: 35.7601,51.4118).
6. **Voice Input:** If a user sends a voice message, understand their transcribed request and respond accordingly.
7. **Image Analysis:** If the user's message includes an image, analyze it. If it's a travel-related location (landmark, hotel, city), describe it. If it's not travel-related, state that it's not relevant to travel planning.
8. **Persona:** Be polite, helpful, and professional. Keep answers concise.`;

            const payload = {
                message: text,
                system_instruction: systemPrompt,
                conversation_history: conversationHistory,
                ...(audio && { audio_data: audio.data, mime_type: audio.mimeType }),
                ...(image && { image_data: image.base64, image_mime_type: image.mimeType }),
            };

            const botResponse = await apiService.sendChatMessage(payload, abortControllerRef.current.signal);
            updateBotMessage(botMessage.id, { text: botResponse });
            if (isBotVoiceEnabled && botResponse) await queueAndPlayTTS(botResponse, botMessage.id);
            else updateBotMessage(botMessage.id, { isSpeaking: false });
            
            setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, lastUpdated: Date.now() } : c));
            if (isFirstMessage && botResponse) {
                 const titlePrompt = language === 'fa' ? `بر اساس این گفتگو، یک عنوان بسیار کوتاه (2 تا 4 کلمه) ایجاد کن: کاربر: "${userMessage.text || "عکس"}" - ربات: "${botResponse}"` : `Based on this conversation, create a very short title (2-4 words): User: "${userMessage.text || "photo"}" - Bot: "${botResponse}"`;
                 const titleResponse = await apiService.sendChatMessage({ message: titlePrompt, system_instruction: "You are a title generator. Be concise." }, new AbortController().signal);
                 if (titleResponse) setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, title: titleResponse.replace(/["*]/g, '').trim() } : c));
            }
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                updateBotMessage(botMessage.id, (prev) => ({ text: prev.text || t('responseStopped'), isSpeaking: false, isCancelled: true }));
            } else { 
                const errorMessage = error instanceof Error ? error.message : t('errorOccurred'); 
                updateBotMessage(botMessage.id, { text: `${t('errorMessage')}${errorMessage}`, isSpeaking: false }); 
            }
        } finally { setIsLoading(false); }
    }, [conversations, activeChatId, isLoading, setConversations, language, t]);

    const handleStopGenerating = () => {
        abortControllerRef.current?.abort();
    };
    
    const handleDeleteConversation = useCallback((id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;
        setConversations(prev => {
            const remaining = prev.filter(c => c.id !== id);
            if (remaining.length === 0) {
                const newId = `chat_${Date.now()}`;
                setActiveChatId(newId);
                return [{ id: newId, title: t('newConversationTitle'), messages: [], lastUpdated: Date.now() }];
            }
            if (activeChatId === id) setActiveChatId(remaining.reduce((a, b) => a.lastUpdated > b.lastUpdated ? a : b).id);
            return remaining;
        });
    }, [activeChatId, setConversations, t]);

    return {
        isAppReady, conversations, activeChatId, setActiveChatId, isLoading,
        faqs, botSettings, startNewChat, handleSendMessage, handleDeleteConversation,
        handleStopGenerating, updateBotMessage, t
    };
};