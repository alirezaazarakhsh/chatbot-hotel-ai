import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- CONSTANTS ---
const API_BASE_URL = '/api/v1/chatbot';
const DEFAULT_FONT = 'Yekan Bakh';
const AVAILABLE_FONTS = [
    { name: 'یکان بخ', family: 'Yekan Bakh' },
    { name: 'وزیرمتن', family: 'Vazirmatn' },
    { name: 'صمیم', family: 'Samim' },
    { name: 'بی نازنین', family: 'B Nazanin' },
];

// --- TYPES ---
interface HotelLink { name: string; url: string; }
interface Message { id: string; sender: 'user' | 'bot'; text: string; audioUrl?: string; imageUrl?: string; isSpeaking?: boolean; timestamp?: string; }
interface Conversation { id: string; title: string; messages: Message[]; lastUpdated: number; }
interface FAQ { id: number; question: string; answer: string; }
interface BotSettings {
  system_instruction: string; default_voice: string; is_bot_voice_enabled: boolean;
  available_fonts: Array<{name: string, family: string}>; hotel_links: HotelLink[];
  welcome_title: string; welcome_message: string; logo_url: string;
}
type BotVoice = 'Kore' | 'Puck';

// --- API & UTILS ---
const apiService = {
    fetchBotSettings: async (): Promise<Partial<BotSettings>> => {
        const settingsResponse = await fetch(`${API_BASE_URL}/settings/`);
        if (!settingsResponse.ok) throw new Error('Failed to fetch bot settings');
        const settings = await settingsResponse.json();
        const hotelLinksResponse = await fetch(`/api/v1/hotel/hotels/chatbot/`);
        if (!hotelLinksResponse.ok) throw new Error('Failed to fetch hotel links');
        const hotelLinks: HotelLink[] = await hotelLinksResponse.json();
        return { ...settings, hotel_links: hotelLinks };
    },
    fetchFAQs: async (): Promise<FAQ[]> => {
        const response = await fetch(`${API_BASE_URL}/faqs/`);
        if (!response.ok) throw new Error('Failed to fetch FAQs');
        return await response.json();
    },
    sendChatMessage: async (payload: any, signal: AbortSignal) => {
        const response = await fetch(`${API_BASE_URL}/message/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), signal
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message');
        }
        return (await response.json()).response;
    },
    generateTTS: async (text: string, voice: BotVoice) => {
        const response = await fetch(`${API_BASE_URL}/tts/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_name: voice })
        });
        if (!response.ok) throw new Error('Failed to generate TTS');
        return await response.json();
    }
};

const audioUtils = {
    decode: (base64: string): Uint8Array => {
        const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return bytes;
    },
    decodeAudioData: async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
        const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i] / 32768.0; }
        return buffer;
    }
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
        catch (error) { console.error(error); return initialValue; }
    });
    useEffect(() => {
        try { window.localStorage.setItem(key, JSON.stringify(storedValue)); }
        catch (error) { console.error(error); }
    }, [key, storedValue]);
    return [storedValue, setStoredValue];
};

// --- ICONS ---
const Icons = {
    SendArrow: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>),
    Plus: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>),
    Sun: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>),
    Moon: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>),
    Trash: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
    Menu: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>),
    Mic: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>),
    Stop: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" /></svg>),
    StopGenerating: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>),
    Settings: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    Close: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
    Copy: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
    Check: ({ className = 'text-green-500' }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>),
    Speaking: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 8 2.75Zm-2.28 3.45a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm4.56 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm-2.28 4.3a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/></svg>),
    AudioPlay: () => (<svg className="w-5 h-5 text-white ms-0.5" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>),
    AudioPause: () => (<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/></svg>),
    FAQ: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    Paperclip: () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>),
};

// --- UI COMPONENTS ---
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-800">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-[#F30F26]"></div>
            <img src="http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp" alt="S24 Logo" className="absolute w-16 h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-7 rounded-full w-12 transition-all duration-300 ease-in-out focus:outline-none ${enabled ? 'bg-[#F30F26]' : 'bg-neutral-300 dark:bg-neutral-600'}`} type="button" role="switch" aria-checked={enabled}>
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${enabled ? 'start-6' : 'start-1'}`} />
    </button>
);

const CustomAudioPlayer: React.FC<{ audioUrl: string; timestamp: string; sender: 'user' | 'bot' }> = ({ audioUrl, timestamp, sender }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const waveformBars = useRef<number[]>(Array.from({ length: 40 }, () => Math.floor(Math.random() * 80) + 20)).current;

    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        const setAudioData = () => { setDuration(audio.duration); setCurrentTime(audio.currentTime); setIsReady(true); };
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);
        return () => { audio.removeEventListener('loadeddata', setAudioData); audio.removeEventListener('timeupdate', setAudioTime); audio.removeEventListener('ended', onEnded); audio.pause(); };
    }, [audioUrl]);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current && isReady) { isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }
    };
    const formatTime = (time: number) => {
        if (!isFinite(time) || time < 0) return '00:00';
        const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isUser = sender === 'user';
    const playButtonBg = isUser ? 'bg-white/30' : 'bg-neutral-400/50 dark:bg-white/30';
    const textColor = isUser ? 'text-white/80' : 'text-neutral-600 dark:text-white/70';

    return (
        <div className="flex items-center gap-3 w-full max-w-[250px] sm:max-w-xs">
            <button onClick={togglePlayPause} disabled={!isReady} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 focus:outline-none transition-colors ${playButtonBg}`}>
                {isPlaying ? <Icons.AudioPause /> : <Icons.AudioPlay />}
            </button>
            <div className="flex flex-col flex-grow w-full">
                <div className="flex items-center h-8 gap-px">
                    {waveformBars.map((height, i) => <div key={i} className="w-0.5 rounded-full" style={{ height: `${height}%`, backgroundColor: isPlaying && (currentTime / (duration || 1)) * 100 >= ((i + 1) / waveformBars.length) * 100 ? (isUser ? '#FFFFFF' : 'rgb(38 38 38 / 1)') : (isUser ? 'rgba(255, 255, 255, 0.5)' : 'rgb(38 38 38 / 0.4)') }} />)}
                </div>
                <div className={`flex justify-between items-center text-xs mt-1 ${textColor}`}>
                    <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
                    <span>{timestamp}</span>
                </div>
            </div>
        </div>
    );
};

const MapPreview: React.FC<{ location: string }> = ({ location }) => (
    <a href={`https://www.openstreetmap.org/?mlat=${location.split(',')[0]}&mlon=${location.split(',')[1]}#map=15/${location.split(',')[0]}/${location.split(',')[1]}`} target="_blank" rel="noopener noreferrer" className="mt-2 block border dark:border-neutral-700 rounded-lg overflow-hidden hover:border-red-500 transition-colors">
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800/50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 me-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            <p className="font-semibold truncate">{location}</p>
        </div>
        <div className="p-2 text-center bg-neutral-200 dark:bg-neutral-700/50 text-sm font-medium text-red-600 dark:text-red-400">مشاهده روی نقشه</div>
    </a>
);

const FAQModal: React.FC<{ isOpen: boolean; onClose: () => void; faqs: FAQ[]; }> = ({ isOpen, onClose, faqs }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[calc(100vh-2rem)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-black dark:text-white">سوالات متداول</h2>
                    <button onClick={onClose} className="p-1.5 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"><Icons.Close /></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900/50">
                            <h3 className="font-semibold text-lg text-[#F30F26] mb-2">{faq.question}</h3>
                            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                    ))}
                    {faqs.length === 0 && <p className="text-center py-8 text-neutral-500">هیچ سوال متداولی یافت نشد.</p>}
                </div>
            </div>
        </div>
    );
};

const SettingsModal: React.FC<{
    isOpen: boolean; onClose: () => void; isBotVoiceEnabled: boolean; setIsBotVoiceEnabled: (e: boolean) => void;
    botVoice: BotVoice; setBotVoice: (v: BotVoice) => void; appFont: string; setAppFont: (f: string) => void;
    isMapEnabled: boolean; setIsMapEnabled: (e: boolean) => void;
}> = ({ isOpen, onClose, isBotVoiceEnabled, setIsBotVoiceEnabled, botVoice, setBotVoice, appFont, setAppFont, isMapEnabled, setIsMapEnabled }) => {
    const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsFontDropdownOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1C1C1C] border border-neutral-700 rounded-xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white">تنظیمات</h2>
                    <button onClick={onClose} className="p-1.5 text-neutral-400 rounded-full hover:bg-neutral-700"><Icons.Close /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between"><label className="font-medium text-neutral-300">پاسخ صوتی دستیار</label><ToggleSwitch enabled={isBotVoiceEnabled} onChange={setIsBotVoiceEnabled} /></div>
                    <div className="border-t border-neutral-800"></div>
                    <div className="flex items-center justify-between"><label className="font-medium text-neutral-300">نمایش نقشه</label><ToggleSwitch enabled={isMapEnabled} onChange={setIsMapEnabled} /></div>
                    <div className="border-t border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-300 mb-3">صدای دستیار</label>
                        <div className="flex gap-3" role="radiogroup">
                            <button role="radio" aria-checked={botVoice === 'Puck'} onClick={() => setBotVoice('Puck')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${botVoice === 'Puck' ? 'bg-neutral-700 text-white' : 'bg-neutral-800 hover:bg-neutral-700/50 text-neutral-400'}`}>آقا</button>
                            <button role="radio" aria-checked={botVoice === 'Kore'} onClick={() => setBotVoice('Kore')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${botVoice === 'Kore' ? 'bg-[#F30F26] text-white' : 'bg-neutral-800 hover:bg-neutral-700/50 text-neutral-400'}`}>خانم</button>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-300 mb-3">فونت برنامه</label>
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsFontDropdownOpen(prev => !prev)} className="w-full flex justify-between items-center p-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F30F26]">
                                <span>{AVAILABLE_FONTS.find(f => f.family === appFont)?.name || appFont}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            {isFontDropdownOpen && (
                                <div className="absolute z-10 top-full mt-2 w-full bg-[#2a2a2a] border border-neutral-700 rounded-lg shadow-lg overflow-hidden"><ul className="py-1">
                                    {AVAILABLE_FONTS.map(font => (<li key={font.family}><button onClick={() => { setAppFont(font.family); setIsFontDropdownOpen(false); }} className={`w-full text-right px-4 py-2 text-sm transition-colors ${appFont === font.family ? 'bg-[#F30F26] text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>
                                        <div className="flex justify-between items-center"><span>{font.name}</span>{appFont === font.family && <Icons.Check className="h-5 w-5 text-white" />}</div>
                                    </button></li>))}
                                </ul></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageRenderer: React.FC<{ message: Message; isLoading: boolean; isLastMessage: boolean; isMapEnabled: boolean; onCopy: (text: string, id: string) => void; copiedMessageId: string | null }> = ({ message, isLoading, isLastMessage, isMapEnabled, onCopy, copiedMessageId }) => {
    const { id, text, audioUrl, sender, isSpeaking, timestamp, imageUrl } = message;
    const [displayedText, setDisplayedText] = useState('');
    const [location, setLocation] = useState<string | null>(null);

    const isBotGenerating = sender === 'bot' && isLastMessage && isLoading;

    useEffect(() => {
        if (sender === 'bot' && text) {
            const locationMatch = text.match(/\(مکان:\s*([^)]+)\)/);
            setLocation(locationMatch ? locationMatch[1].trim() : null);
        }
    }, [text, sender]);

    useEffect(() => {
        if (isBotGenerating) {
            const timer = setTimeout(() => { setDisplayedText(text.slice(0, displayedText.length + 1)); }, 10);
            return () => clearTimeout(timer);
        } else {
            setDisplayedText(text);
        }
    }, [isBotGenerating, text, displayedText]);

    const parseTextToComponents = (inputText: string): React.ReactNode[] => {
        const cleanText = inputText.replace(/\(مکان:\s*([^)]+)\)/g, '').trim();
        const regex = /https?:\/\/[^\s.,;!?()]+/g; let lastIndex = 0; const components: React.ReactNode[] = []; let match;
        while ((match = regex.exec(cleanText)) !== null) {
            if (match.index > lastIndex) components.push(cleanText.substring(lastIndex, match.index));
            components.push(<a key={match.index} href={match[0]} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">{match[0]}</a>);
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < cleanText.length) components.push(cleanText.substring(lastIndex));
        return components;
    };
    
    return (
        <div className="group relative">
             {imageUrl && <img src={imageUrl} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto" />}
             {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} timestamp={timestamp || ''} sender={sender}/>}
             {isSpeaking && <div className="flex items-center space-x-2 rtl:space-x-reverse"><Icons.Speaking /></div>}
             {text && (<div><p className="whitespace-pre-wrap">{parseTextToComponents(displayedText)}</p>{isMapEnabled && location && <MapPreview location={location} />}</div>)}
             {sender === 'bot' && text && !isSpeaking && (<div className="absolute top-1 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onCopy(text, id)} className="p-1.5 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-500">{copiedMessageId === id ? <Icons.Check /> : <Icons.Copy />}</button>
             </div>)}
        </div>
    );
};

// --- CORE LOGIC HOOK ---
const useAppLogic = () => {
    const [isAppReady, setIsAppReady] = useState(false);
    const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [botSettings, setBotSettings] = useState<BotSettings>({
        system_instruction: '', default_voice: 'Kore', is_bot_voice_enabled: true,
        available_fonts: [], hotel_links: [], welcome_title: 'چت بات هوشمند سفرنامه ۲۴',
        welcome_message: 'به چت بات هوشمند سفرنامه ۲۴ خوش آمدید. می‌توانید در مورد هتل‌ها، رستوران‌ها، شهرها، روستاها و جاذبه‌های گردشگری از من بپرسید و برای سفر خود مشورت بگیرید.',
        logo_url: 'http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp'
    });
    const abortControllerRef = useRef<AbortController | null>(null);

    const startNewChat = useCallback(() => {
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = { id: newId, title: 'گفتگوی جدید', messages: [], lastUpdated: Date.now() };
        setConversations(prev => [...prev, newConversation]);
        setActiveChatId(newId);
    }, [setConversations]);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const settings = await apiService.fetchBotSettings();
                setBotSettings(prev => ({...prev, ...settings}));
                const faqsData = await apiService.fetchFAQs(); setFaqs(faqsData);
                if (conversations.length === 0) startNewChat();
                else setActiveChatId(conversations.reduce((a, b) => a.lastUpdated > b.lastUpdated ? a : b).id);
            } catch (error) { console.error("Initialization failed:", error); if (conversations.length === 0) startNewChat();
            } finally { setIsAppReady(true); }
        };
        initializeApp();
    }, []);

    const updateBotMessage = useCallback((botMessageId: string, updates: Partial<Message>) => {
        if (!activeChatId) return;
        setConversations(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, messages: c.messages.map(m => m.id === botMessageId ? { ...m, ...updates } : m) }));
    }, [activeChatId, setConversations]);
    
    const handleSendMessage = useCallback(async (
        messageData: { text?: string; audio?: { data: string; mimeType: string; url: string; }; image?: { dataUrl: string; base64: string; mimeType: string; }; },
        { isBotVoiceEnabled, botVoice, hotelLinks, initAudioContext, queueAndPlayTTS }:
        { isBotVoiceEnabled: boolean; botVoice: BotVoice; hotelLinks: HotelLink[]; initAudioContext: () => void; queueAndPlayTTS: (text: string, messageId: string) => Promise<void> }
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
            const conversationHistory = [...currentConvo.messages, userMessage].map(msg => ({ sender: msg.sender, text: msg.text }));
            const hotelContext = hotelLinks.length > 0 ? `\n\nلیست هتل‌های معتبر و لینک دقیق آن‌ها:\n` + hotelLinks.map(h => `- ${h.name}: ${h.url}`).join('\n') : '';
            
            let messageWithContext = text;
            if(image) messageWithContext += "\n\n[دستورالعمل برای شما: این یک عکس است. اگر یک مکان توریستی، هتل یا شهر مرتبط با سفر است، آن را شناسایی و توضیح دهید. در غیر این صورت، بگویید که عکس به موضوع سفر مرتبط نیست.]";
            if (isFirstMessage) messageWithContext += `[دستورالعمل: شما یک متخصص سفر برای ایران، شامل شهرها، روستاها، جاذبه‌های گردشگری، هتل‌ها و رستوران‌ها هستید. وقتی به مکان خاصی اشاره می‌کنید، نام و شهر را در انتهای پاسخ به این شکل اضافه کنید: (مکان: نام مکان، شهر). از لیست هتل‌ها دقیق استفاده کنید. لینک‌ها را به صورت URL خام و بدون قالب‌بندی markdown ارائه بده.${hotelContext}]`;

            const payload = {
                message: messageWithContext, conversation_history: conversationHistory,
                ...(audio && { audio_data: audio.data, mime_type: audio.mimeType }),
                ...(image && { image_data: image.base64, image_mime_type: image.mimeType }),
            };

            const botResponse = await apiService.sendChatMessage(payload, abortControllerRef.current.signal);
            updateBotMessage(botMessage.id, { text: botResponse });
            if (isBotVoiceEnabled && botResponse) await queueAndPlayTTS(botResponse, botMessage.id);
            else updateBotMessage(botMessage.id, { isSpeaking: false });
            
            setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, lastUpdated: Date.now() } : c));
            if (isFirstMessage && botResponse) {
                 const titleResponse = await apiService.sendChatMessage({ message: `بر اساس این گفتگو، یک عنوان بسیار کوتاه (2 تا 4 کلمه) ایجاد کن: کاربر: "${userMessage.text || "عکس"}" - ربات: "${botResponse}"` }, new AbortController().signal);
                 if (titleResponse) setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, title: titleResponse.replace(/["*]/g, '').trim() } : c));
            }
        } catch (error) {
            if ((error as Error).name === 'AbortError') updateBotMessage(botMessage.id, { text: "پاسخ متوقف شد.", isSpeaking: false });
            else { const errorMessage = error instanceof Error ? error.message : "یک خطای غیرمنتظره رخ داد."; updateBotMessage(botMessage.id, { text: `متاسفانه مشکلی پیش آمده: ${errorMessage}`, isSpeaking: false }); }
        } finally { setIsLoading(false); }
    }, [conversations, activeChatId, isLoading, setConversations]);

    const handleStopGenerating = () => {
        abortControllerRef.current?.abort();
    };
    
    const handleDeleteConversation = useCallback((id: string) => {
        if (!window.confirm("آیا از حذف این گفتگو مطمئن هستید؟")) return;
        setConversations(prev => {
            const remaining = prev.filter(c => c.id !== id);
            if (remaining.length === 0) {
                const newId = `chat_${Date.now()}`;
                setActiveChatId(newId);
                return [{ id: newId, title: 'گفتگوی جدید', messages: [], lastUpdated: Date.now() }];
            }
            if (activeChatId === id) setActiveChatId(remaining.reduce((a, b) => a.lastUpdated > b.lastUpdated ? a : b).id);
            return remaining;
        });
    }, [activeChatId, setConversations]);

    return {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading,
        faqs, botSettings, startNewChat, handleSendMessage, handleDeleteConversation,
        handleStopGenerating, updateBotMessage,
    };
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const {
        isAppReady, conversations, setConversations, activeChatId, setActiveChatId, isLoading, faqs,
        botSettings, startNewChat, handleSendMessage, handleDeleteConversation, handleStopGenerating,
        updateBotMessage
    } = useAppLogic();
    
    const [userInput, setUserInput] = useState('');
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isRecording, setIsRecording] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [isBotVoiceEnabled, setIsBotVoiceEnabled] = useLocalStorage('isBotVoiceEnabled', true);
    const [botVoice, setBotVoice] = useLocalStorage<BotVoice>('botVoice', 'Kore');
    const [appFont, setAppFont] = useLocalStorage('appFont', DEFAULT_FONT);
    const [isMapEnabled, setIsMapEnabled] = useLocalStorage('isMapEnabled', true);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [imageToSend, setImageToSend] = useState<{ dataUrl: string; base64: string; mimeType: string; } | null>(null);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
    useEffect(() => { document.documentElement.style.setProperty('--app-font', `"${appFont}"`); }, [appFont]);
    useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversations, activeChatId, isLoading]);
    
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try { const AudioContext = window.AudioContext || (window as any).webkitAudioContext; audioContextRef.current = new AudioContext({ sampleRate: 24000 }); }
            catch (e) { console.error("Web Audio API not supported.", e); }
        }
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }, []);

    const queueAndPlayTTS = useCallback(async (text: string, messageId: string) => {
        const ctx = audioContextRef.current;
        if (!isBotVoiceEnabled || !text.trim() || !ctx) { updateBotMessage(messageId, { isSpeaking: false }); return; }
        try {
            const ttsResponse = await apiService.generateTTS(text, botVoice);
            if (!ttsResponse?.audio_data) throw new Error("No audio data in response");
            const audioBytes = audioUtils.decode(ttsResponse.audio_data);
            const audioBuffer = await audioUtils.decodeAudioData(audioBytes, ctx);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { audioSourcesRef.current.delete(source); if (audioSourcesRef.current.size === 0) nextStartTimeRef.current = 0; updateBotMessage(messageId, { isSpeaking: false }); };
            const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            audioSourcesRef.current.add(source);
        } catch (error) { console.error("TTS error:", error); updateBotMessage(messageId, { isSpeaking: false }); }
    }, [isBotVoiceEnabled, botVoice, updateBotMessage]);
    
    const onSendMessage = () => {
        handleSendMessage(
            { text: userInput, image: imageToSend },
            { isBotVoiceEnabled, botVoice, hotelLinks: botSettings.hotel_links, initAudioContext, queueAndPlayTTS }
        );
        setUserInput('');
        setImageToSend(null);
    };

    const handleMicClick = useCallback(async () => {
        initAudioContext();
        if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); return; }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) };
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const [meta, base64] = (reader.result as string).split(',');
                    if (base64) handleSendMessage({ audio: { data: base64, mimeType: 'audio/webm', url: reader.result as string } }, { isBotVoiceEnabled, botVoice, hotelLinks: botSettings.hotel_links, initAudioContext, queueAndPlayTTS });
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setIsRecording(true);
        } catch (err) { console.error("Mic error:", err); alert("امکان دسترسی به میکروفون وجود ندارد."); }
    }, [isRecording, handleSendMessage, isBotVoiceEnabled, botVoice, botSettings.hotel_links, initAudioContext, queueAndPlayTTS]);

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

    if (!isAppReady) return <LoadingSpinner />;
    
    const activeConversation = conversations.find(c => c.id === activeChatId);

    return (
        <div className="h-screen bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden" style={{ fontFamily: appFont }}>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" />}
            <aside className={`flex flex-col bg-neutral-100 dark:bg-neutral-900 transition-transform duration-300 ease-in-out fixed inset-y-0 right-0 z-30 w-72 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex-grow flex flex-col min-h-0">
                    <button onClick={startNewChat} className="flex items-center justify-center w-full px-4 py-2 mb-4 bg-[#F30F26] text-white rounded-lg hover:bg-red-700 transition-colors"><Icons.Plus />گفتگوی جدید</button>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">تاریخچه گفتگو</h2>
                        {conversations.slice().reverse().map(c => (
                            <div key={c.id} className="relative group">
                                <button onClick={() => { setActiveChatId(c.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full text-right p-2 my-1 rounded-md truncate ${activeChatId === c.id ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>{c.title}</button>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteConversation(c.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-500 hover:text-red-500"><Icons.Trash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                     <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="flex items-center justify-center flex-1 p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.Moon/><span className="mr-2">تاریک</span></button>
                        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center flex-1 p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.Settings /><span className="mr-2">تنظیمات</span></button>
                     </div>
                     <button onClick={() => setIsFAQOpen(true)} className="flex items-center justify-center w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.FAQ /><span className="mr-2">سوالات متداول</span></button>
                </div>
            </aside>

            <main className={`h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-72' : ''}`}>
                <header className="flex items-center justify-between p-2 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="w-10 h-10 lg:hidden"></div>
                    <h1 className="text-lg font-semibold truncate mx-4 text-center flex-1">{activeConversation?.title || 'گفتگوی جدید'}</h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.Menu /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                     {activeConversation && activeConversation.messages.length > 0 ? (
                        <div className="space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-2xl p-3 sm:p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#F30F26] text-white rounded-br-none' : 'bg-neutral-200 dark:bg-neutral-700 rounded-bl-none'}`}>
                                       <MessageRenderer message={msg} isLoading={isLoading} isLastMessage={index === activeConversation.messages.length - 1} isMapEnabled={isMapEnabled} onCopy={handleCopy} copiedMessageId={copiedMessageId} />
                                    </div>
                                </div>
                            ))}
                            <div ref={endOfMessagesRef} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-4">
                            <img src={botSettings.logo_url} alt="Safarnameh24 Logo" className="w-40 h-auto mb-4" />
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-200">{botSettings.welcome_title}</h1>
                            <p className="mt-4 max-w-md">{botSettings.welcome_message}</p>
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                    {imageToSend && (<div className="relative mb-2 w-20 h-20"><img src={imageToSend.dataUrl} alt="Preview" className="w-full h-full object-cover rounded-lg"/><button onClick={() => setImageToSend(null)} className="absolute -top-2 -right-2 bg-neutral-800 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center" aria-label="Remove image"><Icons.Close /></button></div>)}
                    <div className="relative">
                         <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }} placeholder="پیام خود را اینجا بنویسید..." className="w-full py-3 pr-12 pl-12 sm:py-4 sm:pr-14 sm:pl-14 text-base sm:text-lg bg-neutral-100 dark:bg-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F30F26] resize-none" rows={1} disabled={isLoading} />
                         <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2"><button onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!imageToSend} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50" title="ارسال عکس"><Icons.Paperclip /></button></div>
                         <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex items-center">
                            {isLoading ? (<button onClick={handleStopGenerating} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700" title="توقف"><Icons.StopGenerating /></button>)
                             : isRecording ? (<button onClick={handleMicClick} className="p-2 rounded-full bg-red-600 text-white animate-pulse"><Icons.Stop /></button>)
                             : userInput.trim() || imageToSend ? (<button onClick={onSendMessage} disabled={isLoading} className="p-2 rounded-full bg-[#F30F26] text-white disabled:bg-neutral-400"><Icons.SendArrow /></button>)
                             : (<button onClick={handleMicClick} disabled={isLoading} className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"><Icons.Mic /></button>)}
                        </div>
                    </div>
                     <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">Design & Develop by <a href="https://sevintm.com" target="_blank" rel="noopener noreferrer" className="hover:underline">SevinTeam</a></p>
                </footer>
            </main>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isBotVoiceEnabled={isBotVoiceEnabled} setIsBotVoiceEnabled={setIsBotVoiceEnabled} botVoice={botVoice} setBotVoice={setBotVoice} appFont={appFont} setAppFont={setAppFont} isMapEnabled={isMapEnabled} setIsMapEnabled={setIsMapEnabled} />
            <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} faqs={faqs} />
        </div>
    );
};

export default App;