export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

export interface ChangelogEntry {
  version: string;
  date: { en: string; fa: string; };
  changes: { en: string[]; fa: string[]; };
}

export const translations = {
    en: {
        newChat: 'New Chat', chatHistory: 'Chat History', settings: 'Settings', faq: 'FAQ',
        newConversationTitle: 'New Chat', welcomeMessageTitle: 'Safarnameh24 AI Chatbot',
        welcomeMessageBody: 'Welcome! Ask me about hotels, restaurants, tourist attractions, and more to plan your trip.',
        messagePlaceholder: 'Write your message...', stopGenerating: 'Stop Generating', sendMessage: 'Send Message',
        recordMessage: 'Record Message', designedBy: 'Design & Develop by', confirmDelete: 'Are you sure you want to delete this conversation?',
        settingsTitle: 'Settings', voiceResponse: 'Assistant Voice Response', showMap: 'Show Map',
        assistantVoice: 'Assistant Voice', male: 'Male', female: 'Female', appFont: 'App Font',
        faqTitle: 'Frequently Asked Questions', noFaqs: 'No frequently asked questions found.',
        errorOccurred: 'An unexpected error occurred.', errorMessage: 'An error occurred: ',
        responseStopped: 'Response stopped.', micAccessDenied: 'Microphone access denied.', language: 'Language',
        persian: 'فارسی', english: 'English', copied: 'Copied!', copy: 'Copy', sendImage: 'Send Image',
        imagePreview: 'Image Preview', removeImage: 'Remove image', theme: 'Theme', light: 'Light', dark: 'Dark',
        chatbotTitle: 'Safarnameh24 AI Chatbot', searchChats: 'Search chats...',
        likeResponse: 'Like response', dislikeResponse: 'Dislike response', updates: "Updates",
        sources: 'Sources',
        voiceMessagePlaceholder: '🎤 Voice message',
        transcribeAndRespond: 'Please transcribe the following audio and respond to the user\'s query based on the transcription.',
        voiceMessageTitle: 'Voice Message',
        examplePromptsTitle: 'Try these examples',
        examplePrompt1Title: 'Find a hotel',
        examplePrompt1: 'Find a luxury hotel in Tehran',
        examplePrompt2Title: 'Explore nearby',
        examplePrompt2: 'What are some good restaurants near me?',
        examplePrompt3Title: 'Plan a trip',
        examplePrompt3: 'I want a 5-day tour package to Kish Island',
        examplePrompt4Title: 'Create an image',
        examplePrompt4: 'Create an image of a futuristic hotel in the desert',
        botPersona: 'You are an AI assistant for Safarnameh24, a travel services company that provides hotel booking and other travel services on its website, safarnameh24.com. Your name is "Safarnameh Smart Assistant". You are an expert in travel and tourism in Iran and around the world. Be very friendly, helpful, and empathetic. Provide detailed and comprehensive answers. Your main goal is to encourage users to use and book services through the safarnameh24.com website.',
        languageRule: 'IMPORTANT: You must respond ONLY in English. Do not use any other language.',
        locationServicesInstruction: "IMPORTANT RULE for location questions: If a user asks a location-based question (e.g., 'restaurants near me') and you do not have access to their location (because the googleMaps tool is not provided in the request), you MUST NOT answer the question. Instead, you MUST politely inform the user that you need location access to answer and guide them to enable location services in their browser settings and then try again. Do not say you are an AI that cannot access location.",
        voiceCapabilityInstruction: "You are a voice-enabled assistant. When asked about your voice, explain that you are an AI that can speak using the device's text-to-speech technology, which gives you a voice to interact with users.",
        imageGenerationInstruction: 'When asked to create an image, you MUST respond with ONLY the following special format, and no other text or explanation: [GENERATE_IMAGE: A detailed description of the image to create]',
        generatingImage: 'Creating your image, please wait a moment...',
        imageGenerationError: 'Sorry, there was an error creating the image. Please try another prompt.',
        hotelLinkInstruction: `RULE for providing hotel information:
1.  You have an official list of Safarnameh24 partner hotels in a JSON array. When a user asks for a hotel, FIRST check this list for an exact match by 'name'.
2.  If a match is found in the JSON list, you MUST provide only the 'url' from that object. Do not add extra text or format it.
3.  If the hotel is NOT in the JSON list, you should then use your other tools (like Google Maps) to provide general, helpful information about the hotel. In this case, state clearly that a direct booking link is not available on Safarnameh24 for this hotel.
4.  Do not guess or create URLs. Prioritize the official JSON list for booking links.`,
        hotelLinkListHeader: 'Here is the official list of hotels as a JSON array. You MUST use this data to find the hotel URL:',
        travelPackageInstruction: `RULE for providing travel package information:
1.  You have an official list of Safarnameh24 travel packages in a JSON array. When a user asks about tours, trips, or travel packages, you MUST check this list.
2.  If a user's query matches a destination or package name, present the details from the list: name, destination, duration, price, and the booking 'url'.
3.  Encourage the user to book the package through the provided official link. Do not provide links from other websites.`,
        travelPackageListHeader: 'Here is the official list of travel packages. You MUST use this data to answer questions about tours:',
    },
    fa: {
        newChat: 'گفتگوی جدید', chatHistory: 'تاریخچه گفتگو', settings: 'تنظیمات', faq: 'سوالات متداول',
        newConversationTitle: 'گفتگوی جدید', welcomeMessageTitle: 'چت بات هوشمند سفرنامه ۲۴',
        welcomeMessageBody: 'به چت بات هوشمند سفرنامه ۲۴ خوش آمدید. می‌توانید در مورد هتل‌ها، رستوران‌ها، شهرها، روستاها و جاذبه‌های گردشگری از من بپرسید و برای سفر خود مشورت بگیرید.',
        messagePlaceholder: 'پیام خود را اینجا بنویسید...', stopGenerating: 'توقف پاسخ', sendMessage: 'ارسال پیام',
        recordMessage: 'ضبط پیام', designedBy: 'طراحی و توسعه توسط', confirmDelete: 'آیا از حذف این گفتگو مطمئن هستید؟',
        settingsTitle: 'تنظیمات', voiceResponse: 'پاسخ صوتی دستیار', showMap: 'نمایش نقشه',
        assistantVoice: 'صدای دستیار', male: 'آقا', female: 'خانم', appFont: 'فونت برنامه',
        faqTitle: 'سوالات متداول', noFaqs: 'هیچ سوال متداولی یافت نشد.',
        errorOccurred: 'یک خطای غیرمنتظره رخ داد.', errorMessage: 'متاسفانه مشکلی پیش آمده: ',
        responseStopped: 'پاسخ متوقف شد.', micAccessDenied: 'امکان دسترسی به میکروفون وجود ندارد.', language: 'زبان',
        persian: 'فارسی', english: 'English', copied: 'کپی شد!', copy: 'کپی', sendImage: 'ارسال عکس',
        imagePreview: 'پیش‌نمایش عکس', removeImage: 'حذف عکس', theme: 'حالت نمایش', light: 'روشن', dark: 'تاریک',
        chatbotTitle: 'چت بات هوشمند سفرنامه ۲۴', searchChats: 'جستجوی گفتگوها...',
        likeResponse: 'پسندیدم', dislikeResponse: 'نپسندیدم', updates: 'بروزرسانی‌ها',
        sources: 'منابع',
        voiceMessagePlaceholder: '🎤 پیام صوتی',
        transcribeAndRespond: 'لطفا صدای زیر را به متن تبدیل کرده و بر اساس آن به درخواست کاربر پاسخ دهید.',
        voiceMessageTitle: 'پیام صوتی',
        examplePromptsTitle: 'این نمونه‌ها را امتحان کنید',
        examplePrompt1Title: 'یک هتل پیدا کنید',
        examplePrompt1: 'یک هتل لوکس در تهران پیدا کن',
        examplePrompt2Title: 'اطراف را کاوش کنید',
        examplePrompt2: 'رستوران‌های خوب نزدیک من کدامند؟',
        examplePrompt3Title: 'یک سفر را برنامه‌ریزی کنید',
        examplePrompt3: 'یک تور ۵ روزه به جزیره کیش می‌خواهم',
        examplePrompt4Title: 'یک تصویر بسازید',
        examplePrompt4: 'یک تصویر از هتل آینده‌نگرانه در کویر بساز',
        botPersona: 'شما یک دستیار هوش مصنوعی برای «سفرنامه ۲۴» هستید، یک شرکت خدمات مسافرتی که امکان رزرو هتل و سایر خدمات سفر را در وب‌سایت safarnameh24.com فراهم می‌کند. نام شما «دستیار هوشمند سفرنامه» است. شما در زمینه سفر و گردشگری در ایران و سراسر جهان متخصص هستید. بسیار دوستانه، مفید و همدل باشید. پاسخ‌های دقیق و جامع ارائه دهید. هدف اصلی شما تشویق کاربران برای استفاده و رزرو خدمات از طریق وب‌سایت safarnameh24.com است.',
        languageRule: 'مهم: شما باید فقط به زبان فارسی پاسخ دهید. از هیچ زبان دیگری استفاده نکنید.',
        locationServicesInstruction: 'قانون مهم برای سوالات مکانی: اگر کاربر سوالی مبتنی بر مکان پرسید (مانند «رستوران‌های نزدیک من») و شما به موقعیت مکانی او دسترسی نداشتید (چون ابزار googleMaps در درخواست ارائه نشده است)، شما نباید به سوال پاسخ دهید. در عوض، باید مودبانه به کاربر اطلاع دهید که برای پاسخ به این سوال به دسترسی موقعیت مکانی نیاز دارید و او را راهنمایی کنید تا خدمات موقعیت مکانی را در تنظیمات مرورگر خود فعال کرده و دوباره تلاش کند. نگویید که شما یک هوش مصنوعی هستید و به موقعیت مکانی دسترسی ندارید.',
        voiceCapabilityInstruction: 'شما یک دستیار صوتی هستید. وقتی در مورد صدای شما سوال پرسیده می‌شود، توضیح دهید که شما یک هوش مصنوعی هستید که با استفاده از فناوری تبدیل متن به گفتار دستگاه صحبت می‌کنید و این به شما صدا می‌دهد تا با کاربران تعامل داشته باشید.',
        imageGenerationInstruction: 'اگر کاربر از شما خواست تصویری ایجاد کنید، باید از فرمت زیر در پاسخ خود استفاده کنید و هیچ چیز دیگری در پاسخ خود قرار ندهید: [GENERATE_IMAGE: توضیحات دقیق در مورد تصویری که باید ایجاد شود]',
        generatingImage: 'در حال ساخت تصویر شما...',
        imageGenerationError: 'متاسفانه در ساخت تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
        hotelLinkInstruction: `قانون ارائه اطلاعات هتل:
۱. شما یک لیست رسمی از هتل‌های همکار سفرنامه ۲۴ در قالب آرایه JSON در اختیار دارید. وقتی کاربر نام هتلی را می‌پرسد، ابتدا این لیست را برای یافتن نام دقیق هتل بررسی کنید.
۲. اگر نام هتل در لیست JSON پیدا شد، شما باید فقط مقدار 'url' از همان آبجکت را ارائه دهید. هیچ متن اضافه‌ای ننویسید یا آن را قالب‌بندی نکنید.
۳. اگر هتل در لیست JSON نبود، در آن صورت باید از ابزارهای دیگر خود (مانند نقشه گوگل) برای ارائه اطلاعات کلی و مفید در مورد آن هتل استفاده کنید. در این حالت، به وضوح بیان کنید که لینک رزرو مستقیم برای این هتل در سفرنامه ۲۴ موجود نیست.
۴. از حدس زدن یا ساختن URL خودداری کنید. اولویت همیشه با لیست رسمی JSON برای لینک‌های رزرو است.`,
        hotelLinkListHeader: 'این لیست رسمی هتل‌ها در قالب یک آرایه JSON است. شما باید از این داده‌ها برای یافتن لینک هتل استفاده کنید:',
        travelPackageInstruction: `قانون ارائه اطلاعات تورهای مسافرتی:
۱. شما یک لیست رسمی از تورهای مسافرتی سفرنامه ۲۴ در قالب آرایه JSON در اختیار دارید. وقتی کاربر در مورد تور، سفر یا پکیج‌های مسافرتی سوال می‌پرسد، باید این لیست را بررسی کنید.
۲. اگر درخواست کاربر با مقصد یا نام پکیجی مطابقت داشت، جزئیات را از لیست ارائه دهید: نام، مقصد، مدت زمان، قیمت و لینک رزرو 'url'.
۳. کاربر را تشویق کنید تا تور را از طریق لینک رسمی ارائه شده رزرو کند. از ارائه لینک از وب‌سایت‌های دیگر خودداری کنید.`,
        travelPackageListHeader: 'این لیست رسمی تورهای مسافرتی است. شما باید از این داده‌ها برای پاسخ به سوالات در مورد تورها استفاده کنید:',
    }
};

export const changelog: ChangelogEntry[] = [
    {
        version: '1.3.0',
        date: { en: 'August 1, 2024', fa: '۱۱ مرداد ۱۴۰۳' },
        changes: {
            en: [
                'Implemented real-time streaming responses for a faster, more interactive chat experience.',
                'Added clickable "Example Prompts" to the welcome screen to showcase bot capabilities.',
                'Removed simulated typing animation in favor of true live text.'
            ],
            fa: [
                'پیاده‌سازی پاسخ‌های زنده و لحظه‌ای (Streaming) برای تجربه‌ی گفتگوی سریع‌تر و تعاملی‌تر.',
                'اضافه شدن «نمونه سوالات» قابل کلیک به صفحه خوش‌آمدگویی برای نمایش قابلیت‌های ربات.',
                'حذف انیمیشن تایپ شبیه‌سازی شده و جایگزینی آن با متن زنده واقعی.'
            ]
        }
    },
    {
        version: '1.2.0',
        date: { en: 'July 31, 2024', fa: '۱۰ مرداد ۱۴۰۳' },
        changes: {
            en: [
                'Major AI Upgrade: Now with image understanding and Google Maps integration for smarter, location-aware answers.',
                'Added Travel Packages: Ask about tours to get details on destinations, prices, and direct booking links.',
                'Enhanced Update Alerts: The "Updates" button now features a pulsing bell icon to notify you of new features.'
            ],
            fa: [
                'ارتقاء بزرگ هوش مصنوعی: اکنون با قابلیت درک تصویر و ادغام با نقشه گوگل برای پاسخ‌های هوشمندتر و مبتنی بر مکان.',
                'اضافه شدن تورهای مسافرتی: در مورد تورها سوال کنید تا جزئیات مقصد، قیمت و لینک مستقیم رزرو را دریافت کنید.',
                'بهبود اعلان‌های بروزرسانی: دکمه «بروزرسانی‌ها» اکنون دارای آیکون زنگوله چشمک‌زن برای اطلاع‌رسانی است.'
            ]
        }
    },
    {
        version: '1.1.0',
        date: { en: 'July 28, 2024', fa: '۷ مرداد ۱۴۰۳' },
        changes: {
            en: [
                'Added a "What\'s New" section to keep you updated on the latest features.',
                'Message bubbles are now fully rounded for a cleaner, more modern look.',
                'Implemented a notification system for new updates.'
            ],
            fa: [
                'بخش «چه خبر؟» برای اطلاع‌رسانی در مورد آخرین ویژگی‌ها اضافه شد.',
                'کادر پیام‌ها برای ظاهری تمیزتر و مدرن‌تر، اکنون کاملاً گِرد هستند.',
                'سیستم اعلان برای به‌روزرسانی‌های جدید پیاده‌سازی شد.'
            ]
        }
    },
    {
        version: '1.0.0',
        date: { en: 'July 25, 2024', fa: '۴ مرداد ۱۴۰۳' },
        changes: {
            en: [
                'Initial release of the Safarnameh24 AI Chatbot.',
                'Core features include chat history, voice input, and settings customization.'
            ],
            fa: [
                'نسخه اولیه چت بات هوشمند سفرنامه ۲۴ منتشر شد.',
                'ویژگی‌های اصلی شامل تاریخچه گفتگو، ورودی صوتی و تنظیمات شخصی‌سازی است.'
            ]
        }
    }
];