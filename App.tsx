

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

// --- SVG Icons ---
const PaperPlaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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

// FIX: Added the missing AttentionIcon component.
const AttentionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

// --- Types ---
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface Hotel {
    name: string;
    url: string;
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [hotelList, setHotelList] = useState<Hotel[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isFetchingHotels, setIsFetchingHotels] = useState(true);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const memoizedGenAI = useRef<GoogleGenAI | null>(null);
    
    // --- API Key Check ---
    useEffect(() => {
        // FIX: Per guidelines, API key must be from process.env.API_KEY.
        const key = process.env.API_KEY;
        if (!key) {
            // FIX: Updated error message to reflect the correct environment variable.
            setApiKeyError("کلید API تعریف نشده است. لطفاً فایل .env.local را ساخته و GEMINI_API_KEY را در آن تنظیم کنید.");
        } else {
            setApiKey(key);
            // FIX: Per guidelines, GoogleGenAI must be initialized with a named apiKey parameter.
            // Proxing API requests through a custom domain to bypass regional blocks.
            // A server must be set up at this address to forward requests to generativelanguage.googleapis.com.
            memoizedGenAI.current = new GoogleGenAI({ 
                apiKey: key,
                apiEndpoint: "https://gemini-proxy.safarnameh24.com"
            });
        }
    }, []);

    // --- Hotel List Fetching ---
    const fetchHotels = useCallback(async () => {
        setIsFetchingHotels(true);
        setFetchError(null);
        try {
            const response = await fetch("http://cps.safarnameh24.com/api/v1/hotel/hotels/chatbot/");
            if (!response.ok) {
                throw new Error(`خطای شبکه: ${response.statusText}`);
            }
            const data: Hotel[] = await response.json();
            setHotelList(data);
        } catch (error: any) {
            console.error("Failed to fetch hotel list:", error);
            setFetchError("مشکلی در دریافت لیست هتل‌ها پیش آمد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.");
        } finally {
            setIsFetchingHotels(false);
        }
    }, []);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

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
                    // Start fresh if all chats are older than a week
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
    }, [conversations, activeChatId]);
    
    // --- Tool Definition ---
    const searchHotelTool: FunctionDeclaration = {
        name: "searchHotelOnSafarnameh",
        description: "جستجوی هتل در لیست هتل‌های سایت سفرنامه 24 بر اساس نام هتل. این ابزار لیستی از هتل‌های منطبق با نام ورودی را برمی‌گرداند.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                hotelName: {
                    type: Type.STRING,
                    description: "نام هتل برای جستجو (مثلاً 'پارسیان آزادی', 'اسپیناس پالاس')."
                },
            },
            required: ["hotelName"],
        },
    };

    const systemInstruction = `شما یک دستیار هوشمند و متخصص هتل برای وب‌سایت "سفرنامه 24" هستید. وظیفه شما کمک به کاربران در مورد هر چیزی است که به هتل‌ها مربوط می‌شود. شما می‌توانید اطلاعاتی در مورد امکانات هتل‌ها بدهید، هتل‌ها را با هم مقایسه کنید، پیشنهاد بدهید و لینک صفحه رسمی هتل را در سایت safarnameh24.com پیدا کنید.

قوانین کاری شما:
1.  **پاسخگویی جامع:** به تمام سوالات کاربران در مورد هتل‌ها به طور کامل پاسخ دهید. خودتان را به ارسال لینک محدود نکنید.
2.  **استفاده از ابزار جستجو:** هرگاه کاربر در مورد یک هتل خاص سوال کرد یا لینک آن را خواست، از ابزار searchHotelOnSafarnameh استفاده کنید.
3.  **مدیریت نتایج جستجو:**
    - اگر ابزار **هیچ هتلی** پیدا نکرد، به کاربر اطلاع دهید که هتلی با این نام در سایت یافت نشد.
    - اگر ابزار **دقیقا یک هتل** پیدا کرد، در پاسخ خود حتما لینک آن را قرار دهید.
    - اگر ابزار **چندین هتل** پیدا کرد (مثلا کاربر "پارسیان" را جستجو کرد)، لیست نام هتل‌های پیدا شده را به کاربر **پیشنهاد دهید** و از او بپرسید منظورش کدام یک است. در این مرحله لینک ارسال نکنید.
    - فقط **بعد از اینکه کاربر گزینه مورد نظر خود را از لیست انتخاب کرد**، لینک آن هتل خاص را برایش ارسال کنید.
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
        updateConversation(activeChatId, { messages: newMessages });
        const isFirstMessage = currentConvo.messages.length === 0;
        setUserInput('');
        
        try {
            let chat = currentConvo.chatInstance;
            if (!chat) {
                 chat = ai.chats.create({
                    model: 'gemini-2.5-pro',
                    config: {
                        systemInstruction,
                        tools: [{ functionDeclarations: [searchHotelTool] }],
                    },
                    // history: currentConvo.messages.map(m => ({
                    //     role: m.sender === 'user' ? 'user' : 'model',
                    //     parts: [{ text: m.text }]
                    // }))
                });
                updateConversation(activeChatId, { chatInstance: chat });
            }

            const result = await chat.sendMessageStream({ message: userInput });

            let botResponseText = '';
            
            for await (const chunk of result) {
                const functionCalls = chunk.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                    const call = functionCalls[0];
                    if (call.name === 'searchHotelOnSafarnameh') {
                        // FIX: Cast `call.args.hotelName` to string to resolve 'toLowerCase' does not exist on type 'unknown' error.
                        const hotelName = (call.args.hotelName as string).toLowerCase();
                        
                        const foundHotels = hotelList.filter(hotel => 
                            hotel.name.toLowerCase().includes(hotelName)
                        );
                        
                        // FIX: The message for a function response must be an array of `Part` objects.
                        // The `FunctionResponsePart` type is `{ functionResponse: { name: string, response: object } }`.
                        const functionResponsePayload = [{
                            functionResponse: {
                                name: call.name,
                                response: { result: foundHotels }
                            }
                        }];
                        
                        const followUpResult = await chat.sendMessageStream({ message: functionResponsePayload });
                        
                        for await (const followUpChunk of followUpResult) {
                            botResponseText += followUpChunk.text;
                             updateConversation(activeChatId, {
                                messages: [...newMessages, { sender: 'bot', text: botResponseText }]
                            });
                        }
                    }
                } else {
                    botResponseText += chunk.text;
                    updateConversation(activeChatId, {
                       messages: [...newMessages, { sender: 'bot', text: botResponseText }]
                    });
                }
            }

            if (isFirstMessage && botResponseText) {
                const titleGenChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "بر اساس اولین پیام کاربر و پاسخ ربات، یک عنوان بسیار کوتاه (2 تا 4 کلمه) برای این گفتگو ایجاد کن." }
                });
                const titleResponse = await titleGenChat.sendMessage({ message: `کاربر: ${userMessage.text}\nربات: ${botResponseText}` });
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
            updateConversation(activeChatId, {
                messages: [...newMessages, { sender: 'bot', text: userFriendlyError }]
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Render Functions ---
    const RenderMessageWithLinks: React.FC<{ text: string }> = ({ text }) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
    
        return (
            <p className="whitespace-pre-wrap">
                {parts.map((part, index) => {
                    if (part.match(urlRegex)) {
                        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">{part}</a>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </p>
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
        <div style={{ fontFamily: "'Vazirmatn', sans-serif" }} className="flex h-screen bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            {/* Sidebar */}
            <div className={`flex flex-col bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
                <div className="p-4 flex-grow flex flex-col">
                    <button onClick={startNewChat} className="flex items-center justify-center w-full px-4 py-2 mb-4 bg-[#F30F26] text-white rounded-lg hover:bg-red-700 transition-colors">
                        <PlusIcon />
                        گفتگوی جدید
                    </button>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">تاریخچه گفتگو</h2>
                        {conversations.slice().reverse().map(convo => (
                            <div key={convo.id} className="relative group">
                                <button
                                    onClick={() => setActiveChatId(convo.id)}
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
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                     {activeConversation && activeConversation.messages.length > 0 ? (
                        <div className="space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#F30F26] text-white rounded-br-none' : 'bg-neutral-200 dark:bg-neutral-700 rounded-bl-none'}`}>
                                       <RenderMessageWithLinks text={msg.text} />
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xl p-4 rounded-2xl bg-neutral-200 dark:bg-neutral-700 rounded-bl-none">
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                             <img src="http://cps.safarnameh24.com/media/images/logo/full-red-gray_mej9jEE.webp" alt="Safarnameh24 Logo" className="w-40 h-auto mb-4" />
                            <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">چت بات هوشمند سفرنامه ۲۴</h1>
                            <p className="mt-4 max-w-md">به چت بات هوشمند سفرنامه ۲۴ خوش آمدید. اگر نیاز به مشاوره قبل از خرید یا انتخاب دارید، این چت بات نیاز شما را برطرف می‌کند. لطفا <a href="https://safarnameh24.com" target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">safarnameh24.com</a> را دنبال کنید.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="relative">
                        {fetchError && (
                            <div className="text-center text-red-500 mb-2 flex items-center justify-center">
                                <p>{fetchError}</p>
                                <button onClick={fetchHotels} className="mr-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">تلاش مجدد</button>
                            </div>
                        )}
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder={
                                isFetchingHotels ? "در حال بارگذاری لیست هتل‌ها..." : 
                                fetchError ? "امکان ارسال پیام وجود ندارد." : 
                                "پیام خود را اینجا بنویسید..."
                            }
                            className="w-full py-4 pr-4 pl-14 text-lg bg-neutral-100 dark:bg-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F30F26] resize-none"
                            rows={1}
                            disabled={isLoading || isFetchingHotels || !!fetchError}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !userInput.trim() || isFetchingHotels || !!fetchError}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#F30F26] text-white disabled:bg-neutral-400 disabled:dark:bg-neutral-600 transition-colors"
                        >
                           <PaperPlaneIcon />
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