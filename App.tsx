import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

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


// --- Types ---
interface GroundingSource {
  uri: string;
  title: string;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: GroundingSource[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  chatInstance?: Chat;
  lastUpdated: number;
}

// --- Main App Component ---
const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const memoizedGenAI = useRef<GoogleGenAI | null>(null);
    
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

    // --- Local Storage and Theme Initialization ---
    useEffect(() => {
        // Theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }

        // Conversations
        try {
            const savedConversations = localStorage.getItem('conversations');
            if (savedConversations) {
                const parsedConvos: Conversation[] = JSON.parse(savedConversations);
                const weekInMs = 7 * 24 * 60 * 60 * 1000;
                const now = Date.now();
                const recentConvo = parsedConvos.find(c => (now - c.lastUpdated) < weekInMs);

                if (recentConvo) {
                    setConversations(parsedConvos);
                    setActiveChatId(recentConvo.id);
                } else {
                    startNewChat();
                }
            } else {
                startNewChat();
            }
        } catch (error) {
            console.error("Failed to load conversations from local storage:", error);
            localStorage.removeItem('conversations');
            startNewChat();
        }
    }, []);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
    }, [conversations]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, activeChatId, isLoading]);
    
    // --- System Instruction ---
    const systemInstruction = `شما یک دستیار هوشمند و متخصص هتل برای وب‌سایت "safarnameh24.com" هستید. وظیفه اصلی شما کمک به کاربران و هدایت آن‌ها به سایت سفرنامه ۲۴ است.

قوانین کاری شما:
1.  **پاسخگویی جامع:** به تمام سوالات کاربران در مورد هتل‌ها به طور کامل و با اطلاعات به‌روز پاسخ دهید.
2.  **اولویت با سفرنامه ۲۴:** همیشه و در هر شرایطی، از قابلیت جستجوی گوگل برای پیدا کردن و ارائه لینک مستقیم صفحه هتل مورد نظر در سایت safarnameh24.com استفاده کنید. این مهم‌ترین وظیفه شماست.
3.  **ارائه لینک مستقیم:** هرگاه کاربر در مورد یک هتل خاص سوال کرد، **باید** لینک صفحه آن هتل را در سایت safarnameh24.com پیدا کرده و ارائه دهید. اگر نتوانستید لینک دقیق را پیدا کنید، لینک صفحه اصلی (safarnameh24.com) را بدهید.
4.  **منبع اصلی:** همیشه safarnameh24.com را به عنوان منبع اصلی و پیشنهادی برای رزرو و کسب اطلاعات معرفی کنید.
5.  **صداقت:** اگر اطلاعاتی را پیدا نمی‌کنید، به صراحت بگویید اما کاربر را به بازدید از سایت safarnameh24.com برای اطلاعات بیشتر تشویق کنید.
6.  **تمرکز:** همیشه روی موضوعات مرتبط با هتل و سفر متمرکز بمانید.
`;


    // --- Core Chat Functions ---
    const getActiveConversation = () => conversations.find(c => c.id === activeChatId);

    const updateConversation = (id: string, updates: Partial<Conversation>) => {
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, ...updates, lastUpdated: Date.now() } : c)
        );
    };

    const startNewChat = () => {
        const newId = `chat_${Date.now()}`;
        const newConversation: Conversation = {
            id: newId,
            title: 'گفتگوی جدید',
            messages: [],
            lastUpdated: Date.now(),
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveChatId(newId);
    };
    
    const handleDeleteConversation = (id: string) => {
        if (window.confirm("آیا از حذف این گفتگو مطمئن هستید؟")) {
            const newConversations = conversations.filter(c => c.id !== id);
            setConversations(newConversations);
            if (activeChatId === id) {
                const newActiveId = newConversations.length > 0 ? newConversations[0].id : null;
                setActiveChatId(newActiveId);
                 if (newActiveId === null) {
                    startNewChat();
                }
            }
            if (newConversations.length === 0) {
                 localStorage.removeItem('conversations');
            }
        }
    };


    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading || !activeChatId || !apiKey) return;

        const ai = memoizedGenAI.current;
        if (!ai) return;

        const currentConvo = getActiveConversation();
        if (!currentConvo) return;
        
        setIsLoading(true);
        const userMessage: Message = { sender: 'user', text: userInput };
        const newMessages: Message[] = [...currentConvo.messages, userMessage];
        const botMessagePlaceholder: Message = { sender: 'bot', text: '', sources: [] };
        
        updateConversation(activeChatId, { messages: [...newMessages, botMessagePlaceholder] });
        
        const isFirstMessage = currentConvo.messages.length === 0;
        const currentInput = userInput;
        setUserInput('');
        
        try {
            let chat = currentConvo.chatInstance;
            if (!chat) {
                 chat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                        tools: [{ googleSearch: {} }],
                    },
                });
                updateConversation(activeChatId, { chatInstance: chat });
            }

            const result = await chat.sendMessageStream({ message: currentInput });

            let fullBotResponseText = '';
            let sources: GroundingSource[] = [];
            
            for await (const chunk of result) {
                if (chunk.text) {
                     for (const char of chunk.text) {
                        fullBotResponseText += char;
                         setConversations(prev => prev.map(c => {
                             if (c.id !== activeChatId) return c;
                             const updatedMessages = [...c.messages];
                             updatedMessages[updatedMessages.length - 1] = {
                                 ...updatedMessages[updatedMessages.length - 1],
                                 text: fullBotResponseText,
                             };
                             return { ...c, messages: updatedMessages };
                         }));
                         await new Promise(resolve => setTimeout(resolve, 20)); // Typing speed
                     }
                }
                
                const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks) {
                    const newSources = groundingChunks
                        .map((c: any) => c.web)
                        .filter(Boolean)
                        .map((web: any) => ({ uri: web.uri, title: web.title }))
                        .filter((source: GroundingSource) => 
                            !sources.some(existing => existing.uri === source.uri)
                        );
                    if (newSources.length > 0) {
                        sources.push(...newSources);
                        setConversations(prev => prev.map(c => {
                             if (c.id !== activeChatId) return c;
                             const updatedMessages = [...c.messages];
                             updatedMessages[updatedMessages.length - 1] = {
                                 ...updatedMessages[updatedMessages.length - 1],
                                 sources: [...sources],
                             };
                             return { ...c, messages: updatedMessages };
                         }));
                    }
                }
            }
            
            updateConversation(activeChatId, { lastUpdated: Date.now() });

            if (isFirstMessage && fullBotResponseText) {
                const titleGenChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "بر اساس اولین پیام کاربر و پاسخ ربات، یک عنوان بسیار کوتاه (2 تا 4 کلمه) برای این گفتگو ایجاد کن." }
                });
                const titleResponse = await titleGenChat.sendMessage({ message: `کاربر: ${userMessage.text}\nربات: ${fullBotResponseText}` });
                const newTitle = titleResponse.text.trim();
                if (newTitle) {
                    updateConversation(activeChatId, { title: newTitle });
                }
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
             setConversations(prev => prev.map(c => {
                if (c.id !== activeChatId) return c;
                const updatedMessages = [...c.messages];
                updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    text: userFriendlyError,
                };
                return { ...c, messages: updatedMessages };
            }));
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Render Functions ---
    const RenderMessageWithLinks: React.FC<{ message: Message }> = ({ message }) => {
        const { text, sources } = message;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
    
        return (
            <div>
                <p className="whitespace-pre-wrap">
                    {parts.map((part, index) => {
                        if (part.match(urlRegex)) {
                            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">{part}</a>;
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </p>
                {sources && sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-300 dark:border-neutral-600">
                        <h4 className="text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-400">منابع:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {sources.map((source, index) => (
                                <li key={index} className="text-xs">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline truncate">
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };
    
    if (apiKeyError) {
        return (
             <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-[Vazirmatn]">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-2xl max-w-md text-center border border-red-500/50">
                     <AttentionIcon />
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">خطای پیکربندی</h1>
                    <p className="text-lg">{apiKeyError}</p>
                </div>
            </div>
        );
    }
    
    const activeConversation = getActiveConversation();

    return (
        <div style={{ fontFamily: "'Vazirmatn', sans-serif" }} className="h-screen bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden">
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
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center justify-center w-full p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700">
                        {theme === 'light' ? <MoonIcon/> : <SunIcon/>}
                        <span className="ml-2">{theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}</span>
                    </button>
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
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#F30F26] text-white rounded-br-none' : 'bg-neutral-200 dark:bg-neutral-700 rounded-bl-none'}`}>
                                       <RenderMessageWithLinks message={msg} />
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
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !userInput.trim()}
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#F30F26] text-white disabled:bg-neutral-400 disabled:dark:bg-neutral-600 transition-colors"
                        >
                           <SendArrowIcon />
                        </button>
                    </div>
                     <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">
                        Design & Develop by <a href="https://sevintm.com" target="_blank" rel="noopener noreferrer" className="hover:underline">SevinTeam</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;