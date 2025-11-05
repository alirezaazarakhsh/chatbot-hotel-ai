
import React, { useState, useEffect, useRef, useCallback } from 'react';

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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

const AudioPlayerPlayIcon = () => (
    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
    </svg>
);

const AudioPlayerPauseIcon = () => (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
    </svg>
);


const FAQIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface BotSettings {
  system_instruction: string;
  default_voice: string;
  is_bot_voice_enabled: boolean;
  available_fonts: Array<{name: string, family: string}>;
  hotel_links: HotelLink[];
}

type BotVoice = 'Kore' | 'Puck';

const API_BASE_URL = 'https://cps.safarnameh24.com/api/v1/chatbot';

// --- Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}


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

const FAQModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    faqs: FAQ[];
}> = ({ isOpen, onClose, faqs }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[calc(100vh-2rem)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">سوالات متداول</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="overflow-y-auto p-4">
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                                <h3 className="font-semibold text-lg text-[#F30F26] mb-2">{faq.question}</h3>
                                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{faq.answer}</p>
                            </div>
                        ))}
                        {faqs.length === 0 && (
                            <div className="text-center py-8 text-neutral-500">
                                هیچ سوال متداولی یافت نشد.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isBotVoiceEnabled: boolean;
    setIsBotVoiceEnabled: (enabled: boolean) => void;
    botVoice: BotVoice;
    setBotVoice: (voice: BotVoice) => void;
    appFont: string;
    setAppFont: (font: string) => void;
    availableFonts: Array<{name: string, family: string}>;
}> = ({ isOpen, onClose, isBotVoiceEnabled, setIsBotVoiceEnabled, botVoice, setBotVoice, appFont, setAppFont, availableFonts }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-40 flex items-center justify-center" onClick={onClose}>
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
                        <div className="flex gap-3" role="radiogroup">
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
                        </div>
                     </div>
                     <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
                     <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-2">فونت برنامه</label>
                        <div className="grid grid-cols-2 gap-3">
                           {(availableFonts || []).map(font => (
                                <button
                                    key={font.family}
                                    onClick={() => setAppFont(font.family)}
                                    className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                                        appFont === font.family ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                                    }`}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const WaveformBar: React.FC<{ height: number; isPlayed: boolean; sender: 'user' | 'bot'; key: number }> = ({ height, isPlayed, sender }) => {
    const isUser = sender === 'user';
    
    const playedColor = isUser ? '#FFFFFF' : 'rgb(38 38 38 / 1)'; // dark: '#FFFFFF'
    const unplayedColor = isUser ? 'rgba(255, 255, 255, 0.5)' : 'rgb(38 38 38 / 0.4)'; // dark: 'rgba(255, 255, 255, 0.5)'

    return (
        <div 
            className="w-0.5 rounded-full" 
            style={{ 
                height: `${height}%`,
                backgroundColor: isPlayed ? playedColor : unplayedColor
            }} 
        />
    )
};


const CustomAudioPlayer: React.FC<{ audioUrl: string; timestamp: string; sender: 'user' | 'bot' }> = ({ audioUrl, timestamp, sender }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const waveformBars = useRef<number[]>([]);

    if (waveformBars.current.length === 0) {
        waveformBars.current = Array.from({ length: 40 }, () => Math.floor(Math.random() * 80) + 20);
    }
    
    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            setIsReady(true);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0); // Reset on end
        };
        
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

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current || !isReady) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (!isFinite(time) || time < 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!waveformContainerRef.current || !audioRef.current || !isFinite(duration)) return;
        
        const rect = waveformContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const clickedPercent = Math.max(0, Math.min(1, x / width));
        
        audioRef.current.currentTime = clickedPercent * duration;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isUser = sender === 'user';
    
    const playButtonBg = isUser ? 'bg-white/30' : 'bg-neutral-400/50 dark:bg-white/30';
    const textColor = isUser ? 'text-white/80' : 'text-neutral-600 dark:text-white/70';

    return (
        <div className="flex items-center gap-3 w-full max-w-[250px] sm:max-w-xs">
            <button onClick={togglePlayPause} disabled={!isReady} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 focus:outline-none transition-colors ${playButtonBg}`}>
                {isPlaying ? <AudioPlayerPauseIcon /> : <AudioPlayerPlayIcon />}
            </button>
            <div className="flex flex-col flex-grow w-full">
                <div 
                    className="flex items-center h-8 gap-px cursor-pointer"
                    onClick={handleProgressClick}
                    ref={waveformContainerRef}
                >
                    {waveformBars.current.map((height, i) => {
                        const barProgress = ((i + 1) / waveformBars.current.length) * 100;
                        return <WaveformBar key={i} height={height} isPlayed={progress >= barProgress} sender={sender}/>;
                    })}
                </div>
                <div className={`flex justify-between items-center text-xs mt-1 ${textColor}`}>
                    <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
                    <span>{timestamp}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const [isAppReady, setIsAppReady] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isRecording, setIsRecording] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [botSettings, setBotSettings] = useState<BotSettings>({
        system_instruction: '',
        default_voice: 'Kore',
        is_bot_voice_enabled: true,
        available_fonts: [
            {name: 'وزیرمتن', family: 'Vazirmatn'},
            {name: 'صمیم', family: 'Samim'},
            {name: 'یکان بخ', family: 'Yekan Bakh'},
            {name: 'ایران سنس', family: 'IRANSans'},
        ],
        hotel_links: []
    });
    const [isBotVoiceEnabled, setIsBotVoiceEnabled] = useState(() => {
        const saved = localStorage.getItem('isBotVoiceEnabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [botVoice, setBotVoice] = useState<BotVoice>(() => {
        const saved = localStorage.getItem('botVoice');
        return saved === 'Puck' ? 'Puck' : 'Kore';
    });
    const [appFont, setAppFont] = useState<string>(() => {
        return localStorage.getItem('appFont') || 'Vazirmatn';
    });
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const shouldStopGenerating = useRef(false);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    // --- API Functions ---
    const fetchBotSettings = async () => {
        try {
            const settingsResponse = await fetch(`${API_BASE_URL}/settings/`);
            if (!settingsResponse.ok) throw new Error('Failed to fetch bot settings');
            const settings = await settingsResponse.json();

            const hotelLinksResponse = await fetch(`https://cps.safarnameh24.com/api/v1/hotel/hotels/chatbot/`);
            if (!hotelLinksResponse.ok) throw new Error('Failed to fetch hotel links');
            const hotelLinksData: HotelLink[] = await hotelLinksResponse.json();
            
            const hotelLinks = hotelLinksData.map((link) => {
                let finalUrl = link.url;
                if (finalUrl && !finalUrl.startsWith('http')) {
                    const path = finalUrl.startsWith('/') ? finalUrl : `/${finalUrl}`;
                    finalUrl = `https://safarnameh24.com${path}`;
                }
                return { ...link, url: finalUrl };
            });

            setBotSettings(prevSettings => ({
                ...prevSettings,
                ...settings,
                hotel_links: hotelLinks,
            }));
            
            return { ...botSettings, ...settings, hotel_links: hotelLinks };
        } catch (error) {
            console.error("Error fetching bot settings:", error);
            return null;
        }
    };

    const fetchFAQs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/faqs/`);
            if (!response.ok) throw new Error('Failed to fetch FAQs');
            const faqsData = await response.json();
            setFaqs(faqsData);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        }
    };

    const sendChatMessage = async (message: string, audioData?: string, mimeType?: string) => {
        const currentConvo = getActiveConversation();
        if (!currentConvo) return null;

        // The backend now manages the system instruction and context (FAQs, etc.).
        // We only need to send the clean conversation history.
        const conversationHistory = currentConvo.messages.map(msg => ({
            sender: msg.sender,
            text: msg.text
        }));
        
        const requestBody: any = {
            conversation_history: conversationHistory,
        };

        if (message) requestBody.message = message;
        if (audioData && mimeType) {
            requestBody.audio_data = audioData;
            requestBody.mime_type = mimeType;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/message/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error sending chat message:", error);
            throw error;
        }
    };

    const generateTTS = async (text: string) => {
        if (!isBotVoiceEnabled) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/tts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, voice_name: botVoice })
            });

            if (!response.ok) throw new Error('Failed to generate TTS');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error generating TTS:", error);
            return null;
        }
    };

    // --- App Initialization ---
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

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await fetchBotSettings();
                await fetchFAQs();

                // Theme
                const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
                if (savedTheme) {
                    setTheme(savedTheme);
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    setTheme('dark');
                }
                
                // Font
                const savedFont = localStorage.getItem('appFont');
                if (savedFont) {
                    setAppFont(savedFont);
                    document.documentElement.style.setProperty('--app-font', `"${savedFont}"`);
                } else {
                    document.documentElement.style.setProperty('--app-font', `"Vazirmatn"`);
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
                localStorage.removeItem('conversations');
                startNewChat();
            } finally {
                setIsAppReady(true);
            }
        };

        initializeApp();
    }, [startNewChat]);

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
        document.documentElement.style.setProperty('--app-font', `"${appFont}"`);
        localStorage.setItem('appFont', appFont);
    }, [appFont]);

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
    
    // --- Audio Handling ---
    const initAudioContext = useCallback(() => {
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            return;
        }
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }, []);

    const queueAndPlayTTS = useCallback(async (text: string) => {
        const ctx = audioContextRef.current;
        if (!isBotVoiceEnabled || !text.trim() || !ctx) return;
    
        try {
            const ttsResponse = await generateTTS(text);
            if (ttsResponse && ttsResponse.audio_data) {
                const audioBytes = decode(ttsResponse.audio_data);
                const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                });
    
                const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
        } catch (ttsError) {
            console.error("Text-to-Speech error:", ttsError);
        }
    }, [isBotVoiceEnabled, botVoice]);


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
                         handleSendMessage('', base64Audio, 'audio/webm', audioDataUrl);
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
        initAudioContext();
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // --- Conversation Management ---
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

        setConversations(prev => {
            const updatedConversations = prev.filter(c => c.id !== id);

            if (updatedConversations.length === 0) {
                const newId = `chat_${Date.now()}`;
                setActiveChatId(newId);
                return [{
                    id: newId,
                    title: 'گفتگوی جدید',
                    messages: [],
                    lastUpdated: Date.now(),
                }];
            }
            
            if (activeChatId === id) {
                const mostRecentConvo = updatedConversations.reduce((latest, current) =>
                    current.lastUpdated > latest.lastUpdated ? current : latest, updatedConversations[0]
                );
                setActiveChatId(mostRecentConvo.id);
            }

            return updatedConversations;
        });
    };

    const handleCopy = (text: string, messageId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const generateTitleForConversation = async (userText: string, botText: string) => {
        if (!activeChatId) return;
        try {
            // This is a simplified request for title generation and doesn't need full history
            const titleResponse = await sendChatMessage(
                `بر اساس اولین پیام کاربر و پاسخ ربات، یک عنوان بسیار کوتاه (2 تا 4 کلمه) برای این گفتگو ایجاد کن. پیام کاربر: ${userText} - پاسخ ربات: ${botText}`
            );
            if (titleResponse) {
                const newTitle = titleResponse.trim();
                if (newTitle) {
                    updateConversation(activeChatId, { title: newTitle });
                }
            }
        } catch(e) {
            console.error("Title generation failed", e);
        }
    };
    
    const handleSendMessage = async (
        textInput: string = userInput,
        audioData?: string,
        mimeType?: string,
        audioUrl?: string
    ) => {
        if (isBotVoiceEnabled) {
            initAudioContext();
        }
        if ((!textInput.trim() && !audioData) || isLoading || !activeChatId) return;
        
        setIsLoading(true);
        shouldStopGenerating.current = false;
        setUserInput('');

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const userMessage: Message = { 
            id: `msg_${Date.now()}`,
            sender: 'user', 
            text: textInput,
            audioUrl: audioUrl,
            timestamp,
        };
        const botMessage: Message = { 
            id: `msg_${Date.now() + 1}`,
            sender: 'bot', 
            text: '',
            isSpeaking: isBotVoiceEnabled,
            timestamp,
        };
        
        const currentConvo = getActiveConversation();
        const isFirstMessage = currentConvo?.messages.length === 0;
        
        if(currentConvo) {
            updateConversation(activeChatId, { messages: [...currentConvo.messages, userMessage, botMessage] });
        }
        
        try {
            const botResponse = await sendChatMessage(textInput, audioData, mimeType);
            
            if (shouldStopGenerating.current) {
                updateBotMessage(botMessage.id, { text: "پاسخ متوقف شد.", isSpeaking: false });
                return;
            }

            if (isBotVoiceEnabled && botResponse) {
                nextStartTimeRef.current = audioContextRef.current?.currentTime ?? 0;
                await queueAndPlayTTS(botResponse);
            }
            
            updateBotMessage(botMessage.id, { text: botResponse, isSpeaking: false });
            updateConversation(activeChatId, { lastUpdated: Date.now() });

            if (isFirstMessage && botResponse) {
                await generateTitleForConversation(userMessage.text, botResponse);
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
        const { id, text, audioUrl, sender, isSpeaking, timestamp } = message;
        const [displayedText, setDisplayedText] = useState('');

        const isBotGenerating = sender === 'bot' && isLastMessage && isLoading;

        useEffect(() => {
            if (isBotGenerating) {
                if (displayedText.length < text.length) {
                    const timeoutId = setTimeout(() => {
                        setDisplayedText(text.slice(0, displayedText.length + 1));
                    }, 30);
                    return () => clearTimeout(timeoutId);
                }
            } else {
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
                    <CustomAudioPlayer audioUrl={audioUrl} timestamp={timestamp || ''} sender={sender}/>
                )}
                 {isSpeaking ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <SpeakingIcon />
                         {textToDisplay && (
                            <p className="whitespace-pre-wrap">
                                {parseTextToComponents(textToDisplay).map((part, index) => (
                                    <React.Fragment key={index}>{part}</React.Fragment>
                                ))}
                            </p>
                         )}
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

    if (!isAppReady) {
        return <LoadingSpinner />;
    }
    
    const activeConversation = getActiveConversation();

    return (
        <div className="h-screen bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden" style={{ fontFamily: appFont }}>
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
                     <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center justify-center flex-1 p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                            {theme === 'light' ? <MoonIcon/> : <SunIcon/>}
                            <span className="mr-2">{theme === 'light' ? 'تاریک' : 'روشن'}</span>
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center flex-1 p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                            <SettingsIcon />
                            <span className="mr-2">تنظیمات</span>
                        </button>
                     </div>
                     <button onClick={() => setIsFAQOpen(true)} className="flex items-center justify-center w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                        <FAQIcon />
                        <span className="mr-2">سوالات متداول</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-72' : ''}`}>
                 {/* Header */}
                <div className="flex items-center justify-between p-2 sm:p-4 border-b border-neutral-200 dark:border-neutral-700">
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
                                        max-w-[85%] md:max-w-xl p-3 sm:p-4 rounded-2xl 
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
                appFont={appFont}
                setAppFont={setAppFont}
                availableFonts={botSettings.available_fonts}
            />
            <FAQModal 
                isOpen={isFAQOpen}
                onClose={() => setIsFAQOpen(false)}
                faqs={faqs}
            />
        </div>
    );
};

export default App;
