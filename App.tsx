
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Part, Modality } from "@google/genai";

// --- SVG Icons ---
const SendArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
    </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const AttentionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
    </svg>
);

const StopGeneratingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const SpeakingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 2.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 8 2.75Zm-2.28 3.45a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm4.56 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm-2.28 4.3a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75Z"/>
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
);


// --- New Loading Spinner Component ---
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-800">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-[#F30F26]"></div>
            <img src="http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp" alt="S24 Logo" className="absolute w-16 h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
    </div>
);


// --- Types ---
interface HotelLink {
    name: string;
    url: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  audioUrl?: string;
  isSpeaking?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  chatInstance?: Chat;
  lastUpdated: number;
}

type BotVoice = 'Kore' | 'Puck'; // Kore: Female-sounding, Puck: Male-sounding

// --- Helper Components ---
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-[#F30F26]' : 'bg-neutral-300 dark:bg-neutral-600'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);


const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isBotVoiceEnabled: boolean;
    setIsBotVoiceEnabled: (enabled: boolean) => void;
    botVoice: BotVoice;
    setBotVoice: (voice: BotVoice) => void;
}> = ({ isOpen, onClose, isBotVoiceEnabled, setIsBotVoiceEnabled, botVoice, setBotVoice }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">تنظیمات</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label htmlFor="bot-voice-toggle" className="font-medium text-neutral-700 dark:text-neutral-300">
                            پاسخ صوتی دستیار
                        </label>
                        <ToggleSwitch
                            enabled={isBotVoiceEnabled}
                            onChange={setIsBotVoiceEnabled}
                        />
                    </div>
                     <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
                     <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-2">صدای دستیار</label>
                        <div className="flex space-x-2" role="radiogroup">
                            <button
                                role="radio"
                                aria-checked={botVoice === 'Kore'}
                                onClick={() => setBotVoice('Kore')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                                    botVoice === 'Kore' ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                                }`}
                            >
                                خانم
                            </button>
                             <button
                                role="radio"
                                aria-checked={botVoice === 'Puck'}
                                onClick={() => setBotVoice('Puck')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                                    botVoice === 'Puck' ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                                }`}
                            >
                                آقا
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const CustomAudioPlayer: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            setIsReady(true);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);
        
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', onEnded);
            audio.pause();
            audioRef.current = null;
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (!audioRef.current || !isReady) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (!isFinite(time) || time < 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !audioRef.current || !isFinite(duration)) return;
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const clickedPercent = Math.max(0, Math.min(1, x / width));
        
        audioRef.current.currentTime = clickedPercent * duration;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center space-x-3 w-full max-w-xs text-white mb-2">
            <button onClick={togglePlayPause} disabled={!isReady} className="flex-shrink-0 disabled:opacity-50 focus:outline-none">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="flex-grow flex items-center space-x-2">
                 <div ref={progressBarRef} onClick={handleProgressClick} className="relative w-full h-1 bg-white/40 rounded-full cursor-pointer">
                    <div className="absolute h-1 bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                    <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2" style={{ left: `calc(${progress}% - 6px)` }}></div>
                </div>
                 <span className="text-xs font-mono w-14">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [isAppReady, setIsAppReady] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [hotelLinks, setHotelLinks] = useState<HotelLink[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isBotVoiceEnabled, setIsBotVoiceEnabled] = useState(() => {
        const saved = localStorage.getItem('isBotVoiceEnabled');
        return saved ? JSON.parse(saved) : true;
    });
     const [botVoice, setBotVoice] = useState<BotVoice>(() => {
        const saved = localStorage.getItem('botVoice');
        return saved === 'Puck' ? 'Puck' : 'Kore'; // Default to 'Kore' (female)
    });
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const memoizedGenAI = useRef<GoogleGenAI | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const shouldStopGenerating = useRef(false);
    const nextStartTimeRef = useRef(0);
    
    // --- API Key Check ---
    useEffect(() => {
        const key = process.env.API_KEY;
        if (!key) {
            setApiKeyError("کلید API تعریف نشده است. لطفاً فایل .env.local را ساخته و GEMINI_API_KEY را در آن تنظیم کنید.");
        } else {
            setApiKey(key);
            memoizedGenAI.current = new GoogleGenAI({ 
                apiKey: key
            });
        }
    }, []);

    const startNewChat = useCallback(() => {
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = {
            id: newId,
            title: 'گفتگوی جدید',
            messages: [],
            lastUpdated: Date.now(),
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveChatId(newId);
    }, []);

    // --- Data Fetching and Initialization ---
    useEffect(() => {
        if (!apiKey) return;

        const initializeApp = async () => {
            try {
                // Fetch Hotel Links
                const response = await fetch('https://cps.safarnameh24.com/api/v1/hotel/hotels/chatbot/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: HotelLink[] = await response.json();
                setHotelLinks(data);

                // Theme
                const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
                if (savedTheme) {
                    setTheme(savedTheme);
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    setTheme('dark');
                }

                // Conversations
                const savedConversations = localStorage.getItem('conversations');
                if (savedConversations) {
                    const parsedConvos: Conversation[] = JSON.parse(savedConversations);
                     if (parsedConvos.length > 0) {
                        const weekInMs = 7 * 24 * 60 * 60 * 1000;
                        const now = Date.now();
                        const recentConvo = parsedConvos.find(c => (now - c.lastUpdated) < weekInMs);

                        if (recentConvo) {
                            setConversations(parsedConvos);
                            setActiveChatId(recentConvo.id);
                        } else {
                            // If no recent conversations, start fresh with the old data as history
                            setConversations(parsedConvos);
                            startNewChat();
                        }
                    } else {
                        startNewChat();
                    }
                } else {
                    startNewChat();
                }
            } catch (error) {
                console.error("Failed during app initialization:", error);
                localStorage.removeItem('conversations'); // Clear potentially corrupt data
                startNewChat();
            } finally {
                setIsAppReady(true);
            }
        };

        initializeApp();
    }, [apiKey, startNewChat]);

    // --- Side Effects ---
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (!isAppReady) return; 

        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        } else {
            localStorage.removeItem('conversations');
        }
    }, [conversations, isAppReady]);

     useEffect(() => {
        localStorage.setItem('isBotVoiceEnabled', JSON.stringify(isBotVoiceEnabled));
    }, [isBotVoiceEnabled]);

     useEffect(() => {
        localStorage.setItem('botVoice', botVoice);
    }, [botVoice]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, activeChatId, isLoading]);
    
    // --- System Instruction ---
    const generateSystemInstruction = useCallback((hotels: HotelLink[]) => {
        const hotelListString = hotels.length > 0 
            ? hotels.map(h => `- ${h.name}: ${h.url}`).join('\n')
            : "لیست در حال حاضر خالی است.";

        return `شما یک دستیار هوشمند و متخصص هتل برای وب‌سایت "safarnameh24.com" هستید. وظیفه اصلی شما کمک به کاربران و هدایت آن‌ها به سایت سفرنامه ۲۴ است.

قوانین کاری شما:
1.  **پاسخگویی جامع:** به تمام سوالات کاربران در مورد هتل‌ها به طور کامل و با اطلاعات به‌روز پاسخ دهید.
2.  **استفاده از لیست اختصاصی:** شما به یک لیست دقیق از هتل‌ها و لینک‌هایشان در سایت safarnameh24.com دسترسی دارید. همیشه برای ارائه لینک، از این لیست استفاده کنید. این مهم‌ترین وظیفه شماست.
3.  **ارائه لینک مستقیم:** هرگاه کاربر در مورد یک هتل خاص که در لیست زیر وجود دارد سوال کرد، **باید** لینک دقیق آن را از لیست ارائه دهید.
4.  **جستجوی کمکی:** اگر هتل در لیست نبود، از جستجوی گوگل برای پیدا کردن اطلاعات و لینک احتمالی در safarnameh24.com استفاده کنید.
5.  **منبع اصلی:** همیشه safarnameh24.com را به عنوان منبع اصلی و پیشنهادی برای رزرو و کسب اطلاعات معرفی کنید.
6.  **صداقت:** اگر اطلاعاتی را پیدا نمی‌کنید، به صراحت بگویید اما کاربر را به بازدید از سایت safarnameh24.com برای اطلاعات بیشتر تشویق کنید.
7.  **تمرکز:** همیشه روی موضوعات مرتبط با هتل و سفر متمرکز بمانید.
8.  **عدم نمایش منابع:** هرگز لیست منابع یا "Sources" را در پاسخ خود نمایش نده.

**لیست هتل‌های شما:**
${hotelListString}
`;
    }, []);


    // --- Core Chat Functions ---
    const getActiveConversation = () => conversations.find(c => c.id === activeChatId);

    const updateConversation = (id: string, updates: Partial<Conversation>) => {
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, ...updates, lastUpdated: Date.now() } : c)
        );
    };

    const updateBotMessage = useCallback((botMessageId: string, updates: Partial<Message>) => {
        if (!activeChatId) return;
        setConversations(prev =>
            prev.map(c => {
                if (c.id !== activeChatId) return c;
                const updatedMessages = c.messages.map(m =>
                    m.id === botMessageId ? { ...m, ...updates } : m
                );
                return { ...c, messages: updatedMessages };
            })
        );
    }, [activeChatId]);
    
    const handleDeleteConversation = (id: string) => {
        if (!window.confirm("آیا از حذف این گفتگو مطمئن هستید؟")) return;
    
        const updatedConversations = conversations.filter(c => c.id !== id);
    
        if (updatedConversations.length > 0) {
            setConversations(updatedConversations);
            if (activeChatId === id) {
                const mostRecentConvo = updatedConversations.reduce((latest, current) =>
                    current.lastUpdated > latest.lastUpdated ? current : latest
                );
                setActiveChatId(mostRecentConvo.id);
            }
        } else {
            const newId = `chat_${Date.now()}`;
            const newConversation: Conversation = {
                id: newId,
                title: 'گفتگوی جدید',
                messages: [],
                lastUpdated: Date.now(),
            };
            setConversations([newConversation]);
            setActiveChatId(newId);
        }
    };

    const handleCopy = (text: string, messageId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };


    // --- Audio Handling ---
    const decode = (base64: string): Uint8Array => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const decodeAudioData = async (
        data: Uint8Array,
        ctx: AudioContext,
        sampleRate: number,
        numChannels: number
    ): Promise<AudioBuffer> => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result?.toString().split(',')[1];
                    const audioDataUrl = reader.result as string;
                    if (base64Audio && audioDataUrl) {
                         handleSendMessage('', { data: base64Audio, mimeType: 'audio/webm', url: audioDataUrl });
                    }
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("امکان دسترسی به میکروفون وجود ندارد. لطفا دسترسی لازم را بدهید.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
     const queueAndPlayTTS = useCallback(async (text: string) => {
        const ai = memoizedGenAI.current;
        if (!ai || !text.trim()) return;

        try {
            const ttsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: botVoice }
                        }
                    }
                },
            });

            const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (audioData) {
                if (!audioContextRef.current) {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
                }
                const ctx = audioContextRef.current;
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const audioBytes = decode(audioData);
                const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                const now = ctx.currentTime;
                const startTime = Math.max(now, nextStartTimeRef.current);
                source.start(startTime);
                
                nextStartTimeRef.current = startTime + audioBuffer.duration;
            }
        } catch (ttsError) {
            console.error("Text-to-Speech error for sentence:", text, ttsError);
        }
    }, [botVoice]);


    const generateTitleForConversation = async (userText: string, botText: string) => {
        const ai = memoizedGenAI.current;
        if (!ai || !activeChatId) return;
        try {
            const titleGenChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: "بر اساس اولین پیام کاربر و پاسخ ربات، یک عنوان بسیار کوتاه (2 تا 4 کلمه) برای این گفتگو ایجاد کن." }
            });
            const titleResponse = await titleGenChat.sendMessage({ message: `کاربر: ${userText}\nربات: ${botText}` });
            const newTitle = titleResponse.text.trim();
            if (newTitle) {
                updateConversation(activeChatId, { title: newTitle });
            }
        } catch(e) {
            console.error("Title generation failed", e);
        }
    };
    
    const handleSendMessage = async (
        textInput: string = userInput,
        audioInput?: { data: string; mimeType: string; url: string }
    ) => {
        if ((!textInput.trim() && !audioInput) || isLoading || !activeChatId || !apiKey) return;

        const ai = memoizedGenAI.current;
        const currentConvo = getActiveConversation();
        if (!ai || !currentConvo) return;
        
        setIsLoading(true);
        shouldStopGenerating.current = false;
        setUserInput('');

        const userMessage: Message = { 
            id: `msg_${Date.now()}`,
            sender: 'user', 
            text: textInput,
            audioUrl: audioInput?.url
        };
        const botMessage: Message = { 
            id: `msg_${Date.now() + 1}`,
            sender: 'bot', 
            text: '',
            isSpeaking: isBotVoiceEnabled,
        };
        
        const isFirstMessage = currentConvo.messages.length === 0;
        updateConversation(activeChatId, { messages: [...currentConvo.messages, userMessage, botMessage] });
        
        try {
            let chat = currentConvo.chatInstance;
            if (!chat) {
                 chat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: generateSystemInstruction(hotelLinks),
                        tools: [{ googleSearch: {} }],
                    },
                });
                updateConversation(activeChatId, { chatInstance: chat });
            }

            const messageParts: Part[] = [];
            if (textInput.trim()) messageParts.push({ text: textInput.trim() });
            if (audioInput) messageParts.push({ inlineData: { data: audioInput.data, mimeType: audioInput.mimeType } });

            const result = await chat.sendMessageStream({ message: messageParts });
            
            if (isBotVoiceEnabled) {
                nextStartTimeRef.current = audioContextRef.current?.currentTime ?? 0;
            }

            let fullBotResponseText = '';
            let sentenceBuffer = '';
            
            for await (const chunk of result) {
                if (shouldStopGenerating.current) break;
                
                const chunkText = chunk.text;
                if (chunkText) {
                    fullBotResponseText += chunkText;
                    updateBotMessage(botMessage.id, { text: fullBotResponseText });
                    
                    if (isBotVoiceEnabled) {
                        sentenceBuffer += chunkText;
                        const sentenceEndings = [...sentenceBuffer.matchAll(/[.!?।؟\n]/g)];
                        let lastCut = 0;
                        for (const match of sentenceEndings) {
                            const index = match.index;
                            if (index === undefined) continue;
                            
                            const sentence = sentenceBuffer.substring(lastCut, index + 1);
                            queueAndPlayTTS(sentence);
                            lastCut = index + 1;
                        }
                        sentenceBuffer = sentenceBuffer.substring(lastCut);
                    }
                }
            }
            
            if (isBotVoiceEnabled && sentenceBuffer.trim() && !shouldStopGenerating.current) {
                await queueAndPlayTTS(sentenceBuffer.trim());
            }
            
            updateBotMessage(botMessage.id, { isSpeaking: false });
            updateConversation(activeChatId, { lastUpdated: Date.now() });

            if (isFirstMessage && fullBotResponseText && !shouldStopGenerating.current) {
                await generateTitleForConversation(userMessage.text, fullBotResponseText);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error ? error.message : "یک خطای غیرمنتظره رخ داد.";
            let userFriendlyError = "متاسفانه مشکلی پیش آمده. لطفا دوباره تلاش کنید.";
            if (errorMessage.includes("API key not valid")) {
                userFriendlyError = "خطا: کلید API معتبر نیست. لطفا از معتبر بودن کلید خود اطمینان حاصل کنید.";
            } else if (errorMessage.includes("fetch")) {
                userFriendlyError = "خطا در اتصال به شبکه. لطفا اینترنت خود را بررسی کنید.";
            }
            updateBotMessage(botMessage.id, { text: userFriendlyError, isSpeaking: false });
        } finally {
            setIsLoading(false);
            shouldStopGenerating.current = false;
        }
    };
    
    // --- Render Functions ---
    const RenderMessageWithLinks: React.FC<{ message: Message; isLoading: boolean; isLastMessage: boolean; }> = ({ message, isLoading, isLastMessage }) => {
        const { id, text, audioUrl, sender, isSpeaking } = message;
        const [displayedText, setDisplayedText] = useState('');

        const isBotGenerating = sender === 'bot' && isLastMessage && isLoading;

        useEffect(() => {
            if (isBotGenerating) {
                if (displayedText.length < text.length) {
                    const timeoutId = setTimeout(() => {
                        setDisplayedText(text.slice(0, displayedText.length + 1));
                    }, 30); // Typing speed
                    return () => clearTimeout(timeoutId);
                }
            } else {
                // If not generating, or finished, show the full text
                if (displayedText !== text) {
                    setDisplayedText(text);
                }
            }
        }, [isBotGenerating, text, displayedText]);
    
        const parseTextToComponents = (inputText: string): React.ReactNode[] => {
            if (!inputText) return [];
            const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s.,;!?()]+)/g;
            const components: React.ReactNode[] = [];
            let lastIndex = 0;
            let match;
    
            while ((match = regex.exec(inputText)) !== null) {
                if (match.index > lastIndex) {
                    components.push(inputText.substring(lastIndex, match.index));
                }
    
                if (match[1]) {
                    const linkText = match[2];
                    const url = match[3];
                    components.push(
                        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">
                            {linkText}
                        </a>
                    );
                } 
                else if (match[0].startsWith('http')) {
                    const url = match[0];
                    components.push(
                        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">
                            {url}
                        </a>
                    );
                }
    
                lastIndex = regex.lastIndex;
            }
    
            if (lastIndex < inputText.length) {
                components.push(inputText.substring(lastIndex));
            }
    
            return components;
        };

        const textToDisplay = isBotGenerating ? displayedText : text;
    
        return (
            <div className="group relative">
                 {audioUrl && (
                    <CustomAudioPlayer audioUrl={audioUrl} />
                )}
                 {isSpeaking ? (
                    <div className="flex items-center space-x-2">
                        <SpeakingIcon />
                        <p className="whitespace-pre-wrap">
                            {parseTextToComponents(textToDisplay).map((part, index) => (
                                <React.Fragment key={index}>{part}</React.Fragment>
                            ))}
                        </p>
                    </div>
                 ) : textToDisplay ? (
                    <p className="whitespace-pre-wrap">
                        {parseTextToComponents(textToDisplay).map((part, index) => (
                            <React.Fragment key={index}>{part}</React.Fragment>
                        ))}
                    </p>
                 ) : null}

                 {sender === 'bot' && text && !isSpeaking && (
                    <div className="absolute top-1 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopy(text, id)} className="p-1.5 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-500">
                           {copiedMessageId === id ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                 )}
            </div>
        );
    };
    
    if (apiKeyError) {
        return (
             <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-2xl max-w-md text-center border border-red-500/50">
                     <AttentionIcon />
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">خطای پیکربندی</h1>
                    <p className="text-lg">{apiKeyError}</p>
                </div>
            </div>
        );
    }

    if (!isAppReady) {
        return <LoadingSpinner />;
    }
    
    const activeConversation = getActiveConversation();

    return (
        <div className="h-screen bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden">
             {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    aria-hidden="true"
                ></div>
            )}
            
            {/* Sidebar */}
             <div className={`
                flex flex-col bg-neutral-100 dark:bg-neutral-900 
                transition-transform duration-300 ease-in-out
                fixed inset-y-0 right-0 z-30
                w-72 
                transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-4 flex-grow flex flex-col min-h-0">
                    <button onClick={startNewChat} className="flex items-center justify-center w-full px-4 py-2 mb-4 bg-[#F30F26] text-white rounded-lg hover:bg-red-700 transition-colors">
                        <PlusIcon />
                        گفتگوی جدید
                    </button>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">تاریخچه گفتگو</h2>
                        {conversations.slice().reverse().map(convo => (
                            <div key={convo.id} className="relative group">
                                <button
                                    onClick={() => {
                                        setActiveChatId(convo.id);
                                        if (window.innerWidth < 1024) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`w-full text-right p-2 my-1 rounded-md truncate ${activeChatId === convo.id ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                                >
                                    {convo.title}
                                </button>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteConversation(convo.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-500 hover:text-red-500">
                                       <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                     <div className="flex items-center space-x-2">
                        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center justify-center w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                            {theme === 'light' ? <MoonIcon/> : <SunIcon/>}
                            <span className="mr-2">{theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}</span>
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                            <SettingsIcon />
                            <span className="mr-2">تنظیمات</span>
                        </button>
                     </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-72' : ''}`}>
                 {/* Header */}
                <div className="flex items-center justify-between p-2 sm:p-4 border-b border-neutral-200 dark:border-neutral-700">
                     {/* Spacer to balance the title */}
                    <div className="w-10 h-10"></div>
                    <h1 className="text-lg font-semibold truncate mx-4 text-center">
                        {activeConversation?.title || 'گفتگوی جدید'}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 lg:hidden">
                        <MenuIcon />
                    </button>
                     <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 hidden lg:block">
                        <MenuIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                     {activeConversation && activeConversation.messages.length > 0 ? (
                        <div className="space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] md:max-w-xl p-4 rounded-2xl 
                                        ${msg.sender === 'user' ? 'bg-[#F30F26] text-white rounded-br-none' : 'bg-neutral-200 dark:bg-neutral-700 rounded-bl-none'}
                                        ${(isLoading && msg.sender === 'bot' && !msg.text && !msg.isSpeaking) ? 'animate-pulse' : ''}
                                    `}>
                                       <RenderMessageWithLinks 
                                            message={msg}
                                            isLoading={isLoading}
                                            isLastMessage={index === activeConversation.messages.length - 1}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div ref={endOfMessagesRef} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-4">
                             <img src="http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp" alt="Safarnameh24 Logo" className="w-40 h-auto mb-4" />
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-200">چت بات هوشمند سفرنامه ۲۴</h1>
                            <p className="mt-4 max-w-md">به چت بات هوشمند سفرنامه ۲۴ خوش آمدید. اگر نیاز به مشاوره قبل از خرید یا انتخاب دارید، این چت بات نیاز شما را برطرف می‌کند. لطفا <a href="https://safarnameh24.com" target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">safarnameh24.com</a> را دنبال کنید.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="relative">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="پیام خود را اینجا بنویسید..."
                            className="w-full py-3 pr-10 pl-12 sm:py-4 sm:pr-12 sm:pl-14 text-base sm:text-lg bg-neutral-100 dark:bg-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F30F26] resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                         <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex items-center">
                            {isLoading ? (
                                 <button
                                    onClick={() => { shouldStopGenerating.current = true; }}
                                    className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                    title="توقف"
                                >
                                   <StopGeneratingIcon />
                                </button>
                            ) : isRecording ? (
                                <button
                                    onClick={handleMicClick}
                                    className="p-2 rounded-full bg-red-600 text-white animate-pulse"
                                >
                                   <StopIcon />
                                </button>
                            ) : userInput.trim() ? (
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={isLoading || !userInput.trim()}
                                    className="p-2 rounded-full bg-[#F30F26] text-white disabled:bg-neutral-400 disabled:dark:bg-neutral-600 transition-colors"
                                >
                                   <SendArrowIcon />
                                </button>
                            ) : (
                                <button
                                    onClick={handleMicClick}
                                    disabled={isLoading}
                                    className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                >
                                   <MicIcon />
                                </button>
                            )}
                        </div>
                    </div>
                     <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">
                        Design & Develop by <a href="https://sevintm.com" target="_blank" rel="noopener noreferrer" className="hover:underline">SevinTeam</a>
                    </p>
                </div>
            </div>
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                isBotVoiceEnabled={isBotVoiceEnabled}
                setIsBotVoiceEnabled={setIsBotVoiceEnabled}
                botVoice={botVoice}
                setBotVoice={setBotVoice}
            />
        </div>
    );
};

export default App;