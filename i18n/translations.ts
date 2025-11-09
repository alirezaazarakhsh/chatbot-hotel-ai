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
        imageGenerationInstruction: 'To create an image, you MUST use the `generate_image` tool. Do not describe the image in text or refuse the request. You must call the tool with a descriptive prompt.',
        generatingImage: 'Generating image...',
        imageGenerationError: 'Sorry, there was an error creating the image. Please try another prompt.',
        hotelLinkInstruction: `RULE for providing hotel information:
1.  You have an official list of Safarnameh24 partner hotels in a JSON array. When a user asks for a hotel, FIRST check this list for an exact match by 'name'.
2.  If a match is found in the JSON list, you MUST provide only the 'url' from that object. Do not add extra text or format it.
3.  If the hotel is NOT in the JSON list, you should then use your other tools (like Google Maps) to provide general, helpful information about the hotel. In this case, state clearly that a direct booking link is not available on Safarnameh24 for this hotel.
4.  Do not guess or create URLs. Prioritize the official JSON list for booking links.`,
        hotelLinkListHeader: 'Here is the official list of hotels as a JSON array. You MUST use this data to find the hotel URL:',
        travelPackageInstruction: `RULE for Travel and Tour questions:
1. You are a general travel advisor. You DO NOT have a list of specific tour packages to sell.
2. When a user asks about tours or trips (e.g., "what tours do you have?", "I want a trip to Kish"), you should provide general, helpful advice.
3. This advice can include: suggestions for destinations, the best season to visit, recommended trip duration, and a list of essential items to pack.
4. You MUST NOT provide any booking links, prices, or mention any specific website (including safarnameh24.com) for booking tours. Your role is purely advisory for tours.`,
        travelPackageListHeader: '',
        noSearchResults: 'No results found',
        generateTitlePrompt: 'Generate a short, concise title (max 5 words) for the following conversation:',
        clearChat: 'Clear Chat',
        clearChatConfirm: 'Are you sure you want to clear all messages in this chat?',
        edit: 'Edit',
        cancel: 'Cancel',
        saveChanges: 'Save',
        enableMapsInSettings: "Please enable 'Show Map' in settings to use location-based features.",
        locationPermissionDenied: "Location access denied. Please enable location permissions for this site in your browser settings to use this feature.",
        locationError: "Unable to retrieve your location. Please check your device settings and try again.",
        locationModalTitle: 'Location Access Required',
        locationModalBody: "To find what's nearby, this app needs access to your location. Please enable location permissions for this site in your browser's settings and try again.",
        locationModalClose: 'OK',
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
        imageGenerationInstruction: 'برای ساخت تصویر، شما باید از ابزار `generate_image` استفاده کنید. تصویر را در متن توصیف نکنید یا درخواست را رد نکنید. شما باید ابزار را با یک پرامپت توصیفی فراخوانی کنید.',
        generatingImage: 'در حال ساخت تصویر...',
        imageGenerationError: 'متاسفانه در ساخت تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
        hotelLinkInstruction: `قانون ارائه اطلاعات هتل:
۱. شما یک لیست رسمی از هتل‌های همکار سفرنامه ۲۴ در قالب آرایه JSON در اختیار دارید. وقتی کاربر نام هتلی را می‌پرسد، ابتدا این لیست را برای یافتن نام دقیق هتل بررسی کنید.
۲. اگر نام هتل در لیست JSON پیدا شد، شما باید فقط مقدار 'url' از همان آبجکت را ارائه دهید. هیچ متن اضافه‌ای ننویسید یا آن را قالب‌بندی نکنید.
۳. اگر هتل در لیست JSON نبود، در آن صورت باید از ابزارهای دیگر خود (مانند نقشه گوگل) برای ارائه اطلاعات کلی و مفید در مورد آن هتل استفاده کنید. در این حالت، به وضوح بیان کنید که لینک رزرو مستقیم برای این هتل در سفرنامه ۲۴ موجود نیست.
۴. از حدس زدن یا ساختن URL خودداری کنید. اولویت همیشه با لیست رسمی JSON برای لینک‌های رزرو است.`,
        hotelLinkListHeader: 'این لیست رسمی هتل‌ها در قالب یک آرایه JSON است. شما باید از این داده‌ها برای یافتن لینک هتل استفاده کنید:',
        travelPackageInstruction: `قانون برای سوالات مربوط به سفر و تور:
۱. شما یک مشاور سفر عمومی هستید و لیست مشخصی از تورهای مسافرتی برای فروش ندارید.
۲. وقتی کاربر در مورد تور یا سفر سوال می‌پرسد (مثلاً «چه تورهایی دارید؟» یا «می‌خواهم به کیش سفر کنم»)، شما باید راهنمایی‌های کلی و مفید ارائه دهید.
۳. این راهنمایی‌ها می‌تواند شامل پیشنهاد مقصد، بهترین فصل برای سفر، مدت زمان پیشنهادی برای اقامت و لیستی از وسایل ضروری برای بسته‌بندی باشد.
۴. شما نباید هیچ لینک رزرو، قیمت یا نام وب‌سایت خاصی (از جمله safarnameh24.com) را برای رزرو تور ارائه دهید. نقش شما برای تورها صرفاً مشاوره‌ای است.`,
        travelPackageListHeader: '',
        noSearchResults: 'نتیجه‌ای یافت نشد',
        generateTitlePrompt: 'یک عنوان کوتاه و مختصر (حداکثر ۵ کلمه) برای گفتگوی زیر ایجاد کن:',
        clearChat: 'پاک کردن گفتگو',
        clearChatConfirm: 'آیا از پاک کردن تمام پیام‌های این گفتگو مطمئن هستید؟',
        edit: 'ویرایش',
        cancel: 'انصراف',
        saveChanges: 'ذخیره',
        enableMapsInSettings: "لطفاً برای استفاده از قابلیت‌های مبتنی بر مکان، گزینه «نمایش نقشه» را در تنظیمات فعال کنید.",
        locationPermissionDenied: "دسترسی به موقعیت مکانی رد شد. لطفاً برای استفاده از این قابلیت، دسترسی به موقعیت مکانی را در تنظیمات مرورگر خود برای این سایت فعال کنید.",
        locationError: "دریافت موقعیت مکانی شما ممکن نبود. لطفاً تنظیمات دستگاه خود را بررسی کرده و دوباره تلاش کنید.",
        locationModalTitle: 'نیاز به دسترسی به موقعیت مکانی',
        locationModalBody: 'برای یافتن مکان‌های نزدیک، این برنامه به موقعیت مکانی شما نیاز دارد. لطفاً دسترسی به موقعیت مکانی را برای این سایت در تنظیمات مرورگر خود فعال کرده و دوباره تلاش کنید.',
        locationModalClose: 'باشه',
    }
};

export const changelog: ChangelogEntry[] = [
    {
        version: '1.6.0',
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
        changes: {
            en: [
                'Upgraded image generation to use Function Calling for greater reliability.',
                'Added a "Clear Chat" feature to clear messages from the current conversation.',
                'Improved UI feedback when the AI is using tools (e.g., "Generating image...").'
            ],
            fa: [
                'قابلیت ساخت تصویر با استفاده از «فراخوانی تابع» برای پایداری بیشتر ارتقا یافت.',
                'ویژگی «پاک کردن گفتگو» برای حذف پیام‌های گفتگوی فعلی اضافه شد.',
                'بازخورد رابط کاربری هنگام استفاده هوش مصنوعی از ابزارها بهبود یافت (مثلاً «در حال ساخت تصویر...»).'
            ]
        }
    },
    {
        version: '1.5.0',
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
        changes: {
            en: [
                'Fixed the image generation feature using a more robust model.',
                'Changed tour logic to act as a general travel advisor instead of providing a fixed list.',
                'Added a stylish, custom scrollbar to all scrollable areas.',
                'Improved the display of generated images with a subtle border.'
            ],
            fa: [
                'قابلیت ساخت تصویر با استفاده از یک مدل قوی‌تر، اصلاح شد.',
                'منطق تورها تغییر کرد تا ربات به عنوان یک مشاور سفر عمومی عمل کند.',
                'یک اسکرول‌بار سفارشی و زیبا به تمام بخش‌های برنامه اضافه شد.',
                'نمایش تصاویر ساخته شده با یک کادر نازک بهبود یافت.'
            ]
        }
    },
     {
        version: '1.4.0',
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
        changes: {
            en: [
                'Added automatic conversation titling for easier chat history navigation.',
                'Upgraded image generation to a more powerful model for higher quality results.',
                'Improved chat history search with a clear button and a "no results" message.'
            ],
            fa: [
                'اضافه شدن قابلیت عنوان‌گذاری خودکار گفتگوها برای ناوبری آسان‌تر در تاریخچه.',
                'ارتقاء قابلیت ساخت تصویر به مدلی قدرتمندتر برای نتایج با کیفیت بالاتر.',
                'بهبود جستجوی تاریخچه گفتگو با دکمه پاک‌سازی و پیام «نتیجه‌ای یافت نشد».'
            ]
        }
    },
    {
        version: '1.3.0',
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
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
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
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
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
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
        date: { en: 'November 9, 2025', fa: '۱۸ آبان ۱۴۰۴' },
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
