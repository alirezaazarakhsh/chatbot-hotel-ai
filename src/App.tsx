

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_FONT } from './constants';
import { Language, Theme, BotVoice } from './types';
import { apiService } from './api/apiService';
import { Icons } from './components/Icons';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SettingsModal } from './components/SettingsModal';
import { FAQModal, UpdateModal } from './components/FAQModal';
import { MessageRenderer } from './components/MessageRenderer';
import { changelog } from './i18n/translations';
import { audioUtils } from './utils/audioUtils';

const packageVersion = process.env.APP_VERSION;

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [language, setLanguage] = useLocalStorage<Language>('language', () => {
        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'fa' ? 'fa' : 'en';
    });
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');

    const {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleStopGenerating,
        updateBotMessage, t, handleFeedback, handleClearChat
    } = useAppLogic(language);
    
    const [userInput, setUserInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isRecording, setIsRecording] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [lastSeenVersion, setLastSeenVersion] = useLocalStorage('lastSeenVersion', '0.0.0');
    const [isBotVoiceEnabled, setIsBotVoiceEnabled] = useLocalStorage('isBotVoiceEnabled', true);
    const [botVoice, setBotVoice] = useLocalStorage<BotVoice>('botVoice', 'Kore');
    const [appFont, setAppFont] = useLocalStorage('appFont', DEFAULT_FONT);
    const [isMapEnabled, setIsMapEnabled] = useLocalStorage('isMapEnabled', true);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [imageToSend, setImageToSend] = useState<{ dataUrl: string; base64: string; mimeType: string; } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [messageToSendAfterEdit, setMessageToSendAfterEdit] = useState<{ text: string } | null>(null);
    const [promptForLocation, setPromptForLocation] = useState<string | null>(null);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const hasNewUpdate = packageVersion !== lastSeenVersion;
    const [showUpdatePulse, setShowUpdatePulse] = useState(hasNewUpdate);


    useEffect(() => { document.documentElement.style.setProperty('--app-font', `"${appFont}"`); }, [appFont]);
    useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversations, activeChatId, isLoading, userInput]);
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    }, [language]);
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
     useEffect(() => {
        if (isMapEnabled) {
            const geoOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            };
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error(`Geolocation error: ${error.code} - ${error.message}`);
                },
                geoOptions
            );
        }
    }, [isMapEnabled]);
    
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try { const AudioContext = window.AudioContext || (window as any).webkitAudioContext; audioContextRef.current = new AudioContext(); }
            catch (e) { console.error("Web Audio API not supported.", e); }
        }
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }, []);

    const queueAndPlayTTS = useCallback(async (text: string, messageId: string) => {
        const ctx = audioContextRef.current;
        if (!isBotVoiceEnabled || !text.trim() || !ctx) {
            updateBotMessage(messageId, { isSpeaking: false });
            return;
        }
        try {
            const { audio_data } = await apiService.generateTTS(text, botVoice);
            const decodedBytes = audioUtils.decode(audio_data);
            const audioBuffer = await ctx.decodeAudioData(decodedBytes.buffer);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    nextStartTimeRef.current = 0;
                }
                updateBotMessage(messageId, { isSpeaking: false });
            };
            
            const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            audioSourcesRef.current.add(source);
        } catch (error) {
            console.error("TTS error:", error);
            updateBotMessage(messageId, { isSpeaking: false });
        }
    }, [isBotVoiceEnabled, botVoice, updateBotMessage]);
    
    const onSendMessage = (text = userInput) => {
        if (!text.trim() && !imageToSend) return;
        handleSendMessage(
            { text, image: imageToSend },
            { isBotVoiceEnabled, botVoice, faqs, initAudioContext, queueAndPlayTTS, isMapEnabled, userLocation }
        );
        setUserInput('');
        setImageToSend(null);
    };

    const handleMicClick = useCallback(async () => {
        initAudioContext();
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result as string;
                    const base64 = dataUrl.split(',')[1];
                    handleSendMessage(
                        { audio: { base64, mimeType: 'audio/webm', dataUrl: URL.createObjectURL(audioBlob) } },
                        { isBotVoiceEnabled, botVoice, faqs, initAudioContext, queueAndPlayTTS, isMapEnabled, userLocation }
                    );
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setIsRecording(true);
        } catch (err) { console.error("Mic error:", err); alert(t('micAccessDenied')); }
    }, [isRecording, initAudioContext, t, handleSendMessage, isBotVoiceEnabled, botVoice, faqs, queueAndPlayTTS, isMapEnabled, userLocation]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string; const base64 = dataUrl.split(',')[1];
                setImageToSend({ dataUrl, base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };
    
    const handleCopy = (text: string, messageId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };
    
    const handleOpenUpdateModal = () => {
        setIsUpdateModalOpen(true);
        if (hasNewUpdate) {
            setLastSeenVersion(packageVersion);
            setShowUpdatePulse(false);
        }
    };

    const handleEditSubmit = (messageId: string, newText: string) => {
        setEditingMessageId(null);
        const conversation = conversations.find(c => c.id === activeChatId);
        if (!conversation) return;
        const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
        if (messageIndex < 0 || !newText.trim()) return;

        setConversations(prev => prev.map(c =>
            c.id === activeChatId
                ? { ...c, messages: c.messages.slice(0, messageIndex), lastUpdated: Date.now() }
                : c
        ));
        setMessageToSendAfterEdit({ text: newText });
    };

    useEffect(() => {
        if (messageToSendAfterEdit) {
            handleSendMessage(
                messageToSendAfterEdit,
                { isBotVoiceEnabled, botVoice, faqs, initAudioContext, queueAndPlayTTS, isMapEnabled, userLocation }
            );
            setMessageToSendAfterEdit(null);
        }
    }, [messageToSendAfterEdit, handleSendMessage, isBotVoiceEnabled, botVoice, faqs, initAudioContext, queueAndPlayTTS, isMapEnabled, userLocation]);

    useEffect(() => {
        if (promptForLocation && userLocation) {
            onSendMessage(promptForLocation);
            setPromptForLocation(null);
        }
    }, [promptForLocation, userLocation, onSendMessage]);

    const handleLocationPrompt = (prompt: string) => {
        if (!isMapEnabled) {
            alert(t('enableMapsInSettings'));
            setIsSettingsOpen(true);
            return;
        }

        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setPromptForLocation(prompt);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert(t('locationPermissionDenied'));
                } else {
                    alert(t('locationError'));
                }
            },
            geoOptions
        );
    };

    const examplePrompts = [
        { title: t('examplePrompt1Title'), prompt: t('examplePrompt1'), icon: <Icons.Hotel className="h-5 w-5" /> },
        { title: t('examplePrompt2Title'), prompt: t('examplePrompt2'), icon: <Icons.MapPin className="h-5 w-5" />, requiresLocation: true },
        { title: t('examplePrompt3Title'), prompt: t('examplePrompt3'), icon: <Icons.Plane className="h-5 w-5" /> },
        { title: t('examplePrompt4Title'), prompt: t('examplePrompt4'), icon: <Icons.ImageIcon className="h-5 w-5" /> },
    ];

    const handleExamplePromptClick = (prompt: string) => {
        onSendMessage(prompt);
    };

    if (!isAppReady) return <LoadingSpinner />;
    
    const activeConversation = conversations.find(c => c.id === activeChatId);
    
    const sidebarClass = language === 'fa' 
        ? `fixed inset-y-0 right-0 z-30 w-72 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        : `fixed inset-y-0 left-0 z-30 w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`;
        
    const mainClass = language === 'fa' 
        ? `h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-72' : ''}`
        : `h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : ''}`;

    const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const onClearChat = () => {
        if (activeChatId && window.confirm(t('clearChatConfirm'))) {
            handleClearChat(activeChatId);
        }
    };

    return (
        <div className="h-screen bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden" style={{ fontFamily: appFont }}>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" />}
            <aside className={`flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-transform duration-300 ease-in-out ${sidebarClass}`}>
                <div className="p-4 flex-grow flex flex-col min-h-0">
                    <button onClick={startNewChat} className="flex items-center justify-center w-full px-4 py-2 mb-2 bg-[#F30F26] text-white rounded-lg hover:bg-red-700 transition-colors"><Icons.Plus />{t('newChat')}</button>
                    <div className="relative mb-2">
                        <span className="absolute inset-y-0 flex items-center pointer-events-none text-neutral-400 start-3">
                            <Icons.Search />
                        </span>
                        <input
                            type="text"
                            placeholder={t('searchChats')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#F30F26] ps-9 pe-9"
                        />
                         {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className={`absolute inset-y-0 flex items-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 ${language === 'fa' ? 'left-3' : 'right-3'}`}>
                                <Icons.Close className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto pe-2">
                        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 my-2">{t('chatHistory')}</h2>
                        {filteredConversations.length > 0 ? (
                             filteredConversations.slice().reverse().map(c => (
                                <div key={c.id} className="relative group">
                                    <button onClick={() => { setActiveChatId(c.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full text-start p-2 my-1 rounded-md truncate ${activeChatId === c.id ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>{c.title}</button>
                                    <div className="absolute top-1/2 -translate-y-1/2 end-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteConversation(c.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-500 hover:text-red-500"><Icons.Trash /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 p-4">{t('noSearchResults')}</p>
                        )}
                    </div>
                </div>
                 <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div className="relative">
                       <button onClick={handleOpenUpdateModal} className="flex items-center justify-start w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                           <Icons.Bell />
                           <span className="ms-2">{t('updates')}</span>
                       </button>
                        {showUpdatePulse && (
                           <div className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full ${language === 'fa' ? 'right-2' : 'left-2'}`}>
                               <div className="absolute w-full h-full bg-red-500 rounded-full animate-pulse"></div>
                           </div>
                       )}
                    </div>
                    <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-start w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.Settings /><span className="ms-2">{t('settings')}</span></button>
                    <button onClick={() => setIsFAQOpen(true)} className="flex items-center justify-start w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.FAQ /><span className="ms-2">{t('faq')}</span></button>
                </div>
            </aside>

            <main className={mainClass}>
                <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center">
                        {activeConversation && activeConversation.messages.length > 0 && (
                            <button onClick={onClearChat} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500" title={t('clearChat')}>
                                <Icons.Trash className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold truncate">{t('chatbotTitle')}</h1>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                            <Icons.Menu />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                     {activeConversation && activeConversation.messages.length > 0 ? (
                        <div className="space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                                <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center">
                                            <img src={botSettings.logo_url} alt="Bot" className="w-6 h-6 object-contain p-0.5" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-2xl p-3 sm:p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#F30F26] text-white' : 'bg-white dark:bg-neutral-700'}`}>
                                       <MessageRenderer 
                                            message={msg} 
                                            isLoading={isLoading} 
                                            isLastMessage={index === activeConversation.messages.length - 1} 
                                            onCopy={handleCopy} 
                                            copiedMessageId={copiedMessageId} 
                                            onFeedback={handleFeedback} 
                                            t={t} 
                                            language={language}
                                            editingMessageId={editingMessageId}
                                            setEditingMessageId={setEditingMessageId}
                                            onEditSubmit={handleEditSubmit}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div ref={endOfMessagesRef} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                            <img src={botSettings.logo_url} alt="Safarnameh24 Logo" className="w-32 sm:w-40 h-auto mb-4" />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-200">{botSettings.welcome_title ? (language === 'fa' ? botSettings.welcome_title : 'Safarnameh24 Smart Chatbot') : t('welcomeMessageTitle')}</h1>
                            <p className="mt-4 max-w-md">{botSettings.welcome_message ? (language === 'fa' ? botSettings.welcome_message : 'Welcome! Ask me about hotels, restaurants, and attractions.') : t('welcomeMessageBody')}</p>
                        </div>
                    )}
                </div>
                
                {activeConversation && activeConversation.messages.length === 0 && (
                  <div className="px-4 md:px-6 pb-4 pt-2 bg-neutral-100 dark:bg-neutral-800">
                    <div className="w-full max-w-3xl mx-auto">
                        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3 text-center">{t('examplePromptsTitle')}</h2>
                        <div className="overflow-x-auto hide-scrollbar -mb-2 pb-2">
                            <div className="flex gap-3 px-1 whitespace-nowrap">
                                {examplePrompts.map((item, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => item.requiresLocation ? handleLocationPrompt(item.prompt) : handleExamplePromptClick(item.prompt)}
                                        className="inline-block p-3 bg-white dark:bg-neutral-700/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 w-48 text-start"
                                    >
                                        <div className="flex flex-col h-full">
                                            <div className="text-[#F30F26] mb-1.5">{item.icon}</div>
                                            <div className="whitespace-normal">
                                                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{item.title}</h3>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.prompt}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                <footer className="p-4 border-t bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    {imageToSend && (<div className="relative mb-2 w-20 h-20"><img src={imageToSend.dataUrl} alt={t('imagePreview')} className="w-full h-full object-cover rounded-lg"/><button onClick={() => setImageToSend(null)} className={`absolute -top-2 bg-neutral-800 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center ${language === 'fa' ? '-right-2' : '-left-2'}`} aria-label={t('removeImage')}><Icons.Close /></button></div>)}
                    <div className="relative">
                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }} placeholder={t('messagePlaceholder')} className={`w-full py-3 text-base bg-neutral-100 dark:bg-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F30F26] resize-none px-14`} rows={1} disabled={isLoading} />
                         <div className={`absolute inset-y-0 flex items-center ${language === 'fa' ? 'right-3' : 'left-3'}`}><button onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!imageToSend} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50" title={t('sendImage')}><Icons.Paperclip /></button></div>
                         <div className={`absolute inset-y-0 flex items-center gap-1 ${language === 'fa' ? 'left-3' : 'right-3'}`}>
                            {isLoading ? (<button onClick={handleStopGenerating} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700" title={t('stopGenerating')}><Icons.StopGenerating /></button>)
                             : (
                                <>
                                 {userInput.trim() || imageToSend ? (<button onClick={() => onSendMessage()} disabled={isLoading} className="p-2 rounded-full bg-[#F30F26] text-white disabled:bg-neutral-400" title={t('sendMessage')}><Icons.SendArrow /></button>)
                                 : isRecording ? (<button onClick={handleMicClick} className="p-2 rounded-full bg-red-600 text-white animate-pulse"><Icons.Stop /></button>)
                                 : (<button onClick={handleMicClick} disabled={isLoading} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700" title={t('recordMessage')}><Icons.Mic /></button>)}
                                </>
                             )}
                        </div>
                    </div>
                     <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">{t('designedBy')} <a href="https://sevintm.com" target="_blank" rel="noopener noreferrer" className="hover:underline">SevinTeam</a></p>
                </footer>
            </main>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isBotVoiceEnabled={isBotVoiceEnabled} setIsBotVoiceEnabled={setIsBotVoiceEnabled} botVoice={botVoice} setBotVoice={setBotVoice} appFont={appFont} setAppFont={setAppFont} isMapEnabled={isMapEnabled} setIsMapEnabled={setIsMapEnabled} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} t={t} />
            <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} faqs={faqs} t={t}/>
            <UpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} changelog={changelog} language={language} t={t} />
        </div>
    );
};

export default App;