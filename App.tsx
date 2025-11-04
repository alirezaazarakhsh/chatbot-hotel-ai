
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";

// --- SVG Icons ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

const AttentionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);


// --- Types ---
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface Hotel {
    name: string;
    link: string;
}

interface FetchError {
  message: string;
}

// --- Helper Component for Rendering Links ---
const RenderMessageWithLinks = ({ message }: { message: Message }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.text.split(urlRegex);

  const linkClass = "text-[#F30F26] hover:underline";

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};


// --- Gemini Tool Definition ---
const searchHotelTool: FunctionDeclaration = {
  name: 'searchHotelOnSafarnameh',
  description: 'نام هتل یا شهر را برای جستجو در سایت safarnameh24.com دریافت می‌کند. همیشه برای پیدا کردن هتل از این ابزار استفاده کن.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'نام کامل هتل یا شهر برای جستجو. مثال: "هتل اسپیناس پالاس تهران" یا "شیراز"',
      },
    },
    required: ['query'],
  },
};

// --- Main App Component ---
const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hotelList, setHotelList] = useState<Hotel[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fetchError, setFetchError] = useState<FetchError | null>(null);
  const [isFetchingHotels, setIsFetchingHotels] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const genAIChatInstance = useRef<Chat | null>(null);
  
  // --- Effects ---
  const fetchHotels = useCallback(async () => {
    setIsFetchingHotels(true);
    setFetchError(null);
    try {
        const response = await fetch('https://cps.safarnameh24.com/api/v1/hotel/hotels/chatbot/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            setHotelList(data);
        } else {
            console.error("API response is not in the expected array format.", data);
            throw new Error("API response is not in the expected format.");
        }
    } catch (error) {
        console.error("Failed to fetch hotel list:", error);
        setFetchError({
            message: "خطا در برقراری ارتباط با سرور هتل‌ها. لطفا اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید."
        });
    } finally {
        setIsFetchingHotels(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }

    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    const savedActiveId = localStorage.getItem('activeConversationId');
    if (savedActiveId) {
      setActiveConversationId(savedActiveId);
    }
  }, [fetchHotels]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
    localStorage.setItem('activeConversationId', activeConversationId || '');
  }, [conversations, activeConversationId]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations, activeConversationId, isLoading, isTyping]);

  // --- Handlers ---
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "گفتگوی جدید",
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    genAIChatInstance.current = null;
  };
  
  const handleSelectConversation = (id: string) => {
    genAIChatInstance.current = null;
    setActiveConversationId(id);
  };

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading || isTyping) return;

    const initialUserInput = userInput;
    setUserInput('');

    let conversationIdToUpdate = activeConversationId;
    let isFirstMessageInHistory = false;

    // Create or update conversation with user message
    if (!conversationIdToUpdate) {
        isFirstMessageInHistory = true;
        const newId = Date.now().toString();
        const newConversation: Conversation = {
            id: newId,
            title: "گفتگوی جدید",
            messages: [{ sender: 'user', text: initialUserInput }],
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newId);
        conversationIdToUpdate = newId;
    } else {
        const currentConv = conversations.find(c => c.id === conversationIdToUpdate);
        isFirstMessageInHistory = currentConv ? currentConv.messages.length === 0 : false;
        setConversations(prev =>
            prev.map(conv => 
                conv.id === conversationIdToUpdate 
                ? { ...conv, messages: [...conv.messages, { sender: 'user', text: initialUserInput }] }
                : conv
            )
        );
    }
    const finalConversationId = conversationIdToUpdate;

    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        if (!genAIChatInstance.current) {
             const currentConv = conversations.find(c => c.id === finalConversationId);
             const history = currentConv?.messages
                .filter(msg => msg.text) 
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })) ?? [];
            
            if (history.length > 0 && history[history.length - 1].role === 'user') {
                history.pop();
            }

            genAIChatInstance.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    tools: [{ functionDeclarations: [searchHotelTool] }],
                    systemInstruction: "شما یک دستیار هوش مصنوعی به نام 'سفرنامه ۲۴' هستید. تخصص شما فقط و فقط در زمینه هتل‌ها است. شما می‌توانید با استفاده از ابزار جستجو، لینک مستقیم هتل‌ها را از سایت safarnameh24.com پیدا کنید. همیشه برای پیدا کردن لینک هتل از ابزار خود استفاده کنید. وقتی لینک را پیدا کردید، آن را در یک جمله کامل و دوستانه به کاربر ارائه دهید. اگر در پاسخ ابزار، مقدار url برابر با 'NOT_FOUND' بود، به کاربر اطلاع بده که هتلی با آن نام در سایت پیدا نشده است و از او بخواه که نام دیگری را امتحان کند. اگر سوالی خارج از این حوزه پرسیده شد، با احترام به کاربر بگویید که فقط می‌توانید در مورد هتل‌ها کمک کنید. لحن شما باید دوستانه و خودمونی باشد. در ابتدای هر مکالمه جدید، خودتان را معرفی کرده و به سایت safarnameh24.com اشاره کنید.",
                },
            });
        }

        const stream = await genAIChatInstance.current.sendMessageStream({ message: initialUserInput });

        setIsLoading(false);
        setIsTyping(true);
        
        let botResponseText = '';
        let collectedFunctionCalls: any[] = [];
        
        // Add an empty bot message placeholder to stream into
        setConversations(prev =>
            prev.map(conv => 
                conv.id === finalConversationId 
                ? { ...conv, messages: [...conv.messages, { sender: 'bot', text: '' }] }
                : conv
            )
        );

        for await (const chunk of stream) {
            if (chunk.text) {
                botResponseText += chunk.text;
                setConversations(prev => prev.map(conv => {
                    if (conv.id === finalConversationId) {
                        const newMessages = [...conv.messages];
                        newMessages[newMessages.length - 1].text = botResponseText;
                        return { ...conv, messages: newMessages };
                    }
                    return conv;
                }));
            }
            if (chunk.functionCalls) {
                collectedFunctionCalls = [...collectedFunctionCalls, ...chunk.functionCalls];
            }
        }

        // --- Handle Function Call if detected ---
        if (collectedFunctionCalls.length > 0) {
            const call = collectedFunctionCalls[0];
            const query = call.args.query;

            // Search in the fetched hotel list
            const foundHotel = hotelList.find(hotel => 
                hotel.name.toLowerCase().includes(query.toLowerCase())
            );

            const searchResultUrl = foundHotel ? foundHotel.link : 'NOT_FOUND';

            const functionResponsePayload = {
                functionResponse: {
                    name: 'searchHotelOnSafarnameh',
                    response: { url: searchResultUrl, query: query },
                },
            };
            
            // Optionally update UI to show "Searching..."
            setConversations(prev => prev.map(conv => {
                if (conv.id === finalConversationId) {
                    const newMessages = [...conv.messages];
                    if (newMessages[newMessages.length - 1].text.trim() === '') {
                        newMessages[newMessages.length - 1].text = `در حال جستجو برای «${query}»...`;
                    }
                    return { ...conv, messages: newMessages };
                }
                return conv;
            }));

            // Send the function result back to the model
            const finalStream = await genAIChatInstance.current.sendMessageStream({ message: [functionResponsePayload] });
            
            let finalBotText = '';
            for await (const chunk of finalStream) {
                finalBotText += chunk.text;
                setConversations(prev => prev.map(conv => {
                    if (conv.id === finalConversationId) {
                        const newMessages = [...conv.messages];
                        newMessages[newMessages.length - 1].text = finalBotText;
                        return { ...conv, messages: newMessages };
                    }
                    return conv;
                }));
            }
            botResponseText = finalBotText; // for title generation
        }
        
        // --- Generate Title for New Chats ---
        if (isFirstMessageInHistory && botResponseText) {
            const titlePrompt = `برای این گفتگو یک عنوان کوتاه و مناسب در حد ۳ تا ۵ کلمه به زبان فارسی بساز:\n\nکاربر: ${initialUserInput}\n\nربات: ${botResponseText}`;
            const titleResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: titlePrompt
            });
            const newTitle = titleResponse.text.trim().replace(/"/g, '');
            setConversations(prev =>
                prev.map(conv => (conv.id === finalConversationId ? { ...conv, title: newTitle } : conv))
            );
        }

    } catch (error) {
        console.error("Error sending message:", error);
        let errorText = "متاسفانه مشکلی پیش آمده. لطفا دوباره تلاش کنید.";

        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                errorText = "خطا: کلید API معتبر نیست. لطفا از معتبر بودن کلید خود اطمینان حاصل کنید.";
            } else if (error.message.includes('fetch')) {
                errorText = "خطا در اتصال به اینترنت. لطفا شبکه خود را بررسی کنید.";
            } else {
                 errorText = `خطای غیرمنتظره: ${error.message}`;
            }
        }
        
        const errorMessage = { sender: 'bot' as const, text: errorText };
        setConversations(prev => prev.map(conv => {
            if (conv.id === finalConversationId) {
                const newMessages = [...conv.messages];
                 // Replace placeholder or add new message
                if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === 'bot' && newMessages[newMessages.length - 1].text === '') {
                    newMessages[newMessages.length - 1] = errorMessage;
                } else {
                    newMessages.push(errorMessage);
                }
                return { ...conv, messages: newMessages };
            }
            return conv;
        }));
    } finally {
        setIsLoading(false);
        setIsTyping(false);
    }
  }, [userInput, isLoading, isTyping, activeConversationId, conversations, hotelList]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-200 font-['Vazirmatn']" dir="rtl">
      {/* --- Sidebar --- */}
      <div className={`flex flex-col bg-gray-100 dark:bg-neutral-950 p-4 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 hidden'}`}>
        <button onClick={handleNewChat} className="flex items-center justify-center w-full px-4 py-3 mb-4 text-lg font-semibold rounded-lg bg-[#F30F26] text-white hover:bg-[#D90D22] transition-colors">
          <PlusIcon />
          گفتگوی جدید
        </button>
        <div className="flex-grow overflow-y-auto pr-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-neutral-500 mb-2">تاریخچه گفتگو</h2>
          {conversations.map(convo => (
            <button key={convo.id} onClick={() => handleSelectConversation(convo.id)} className={`w-full text-right p-3 my-1 rounded-lg truncate ${activeConversationId === convo.id ? 'bg-gray-300 dark:bg-neutral-800' : 'hover:bg-gray-200 dark:hover:bg-neutral-700'}`}>
              {convo.title}
            </button>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-300 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm">تم</span>
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800">
                    {theme === 'light' ? <MoonIcon/> : <SunIcon/>}
                </button>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-neutral-400">
                <p>Design & Develop by <a href="https://sevintm.com" target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">SevinTeam</a></p>
            </div>
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col">
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
          {!activeConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-4xl font-semibold text-gray-800 dark:text-neutral-100">چت بات هوشمند سفرنامه ۲۴</h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-neutral-400">
                  سلام! من دستیار هوشمند شما برای پیدا کردن و رزرو بهترین هتل‌ها هستم.
                  <br />
                  می‌توانید هر سوالی در مورد هتل‌ها از من بپرسید. برای اطلاعات بیشتر، به
                  <a href="https://safarnameh24.com" target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline mx-1">
                  safarnameh24.com
                  </a>
                  مراجعه کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeConversation.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[#F30F26] text-white rounded-br-none' : 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-neutral-200 rounded-bl-none'}`}>
                     <RenderMessageWithLinks message={msg} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xl p-4 rounded-2xl bg-gray-200 dark:bg-neutral-800">
                    <div className="flex items-center justify-center space-x-1 animate-pulse">
                         <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                         <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                         <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Input Form --- */}
        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
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
              placeholder={
                isFetchingHotels
                  ? "در حال بارگذاری لیست هتل‌ها..."
                  : fetchError
                  ? "خطا در اتصال به سرور."
                  : "در مورد هتل‌ها از من بپرسید..."
              }
              className="w-full py-4 pr-4 pl-12 bg-gray-100 dark:bg-neutral-800 rounded-lg focus:ring-2 focus:ring-[#F30F26] focus:outline-none resize-none text-gray-900 dark:text-neutral-200"
              rows={1}
              disabled={isFetchingHotels || isLoading || isTyping || !!fetchError}
            />
            <button onClick={handleSendMessage} disabled={isFetchingHotels || isLoading || isTyping || !userInput.trim() || !!fetchError} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#F30F26] text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#D90D22] transition-colors">
              <SendIcon />
            </button>
          </div>
           {fetchError && (
              <div className="text-center mt-2 p-4 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-300 dark:border-red-700 text-red-900 dark:text-red-100">
                  <div className="flex items-center justify-center mb-2">
                      <AttentionIcon />
                      <h3 className="font-bold text-lg text-red-800 dark:text-white">خطا در اتصال</h3>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200">{fetchError.message}</p>
                   <button 
                      onClick={fetchHotels} 
                      className="mt-4 px-4 py-2 text-sm font-semibold bg-[#F30F26] text-white rounded-lg hover:bg-[#D90D22] transition-colors disabled:bg-gray-500"
                      disabled={isFetchingHotels}
                    >
                     {isFetchingHotels ? 'در حال تلاش...' : 'تلاش مجدد'}
                   </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;
