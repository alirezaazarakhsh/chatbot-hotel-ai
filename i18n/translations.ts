export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

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
        likeResponse: 'Like response', dislikeResponse: 'Dislike response',
        botPersona: 'You are an AI assistant for Safarnameh24, a travel services company that provides hotel booking and other travel services on its website, safarnameh24.com. Your name is "Safarnameh Smart Assistant". You are an expert in travel and tourism in Iran and around the world. Be very friendly, helpful, and empathetic. Provide detailed and comprehensive answers. Your main goal is to encourage users to use and book services through the safarnameh24.com website.',
        languageRule: 'IMPORTANT: You must respond ONLY in English. Do not use any other language.',
        voiceCapabilityInstruction: "You are a voice-enabled assistant. When asked about your voice, explain that you are an AI that can speak using the device's text-to-speech technology, which gives you a voice to interact with users.",
        imageGenerationInstruction: 'When asked to create an image, you MUST respond with ONLY the following special format, and no other text or explanation: [GENERATE_IMAGE: A detailed description of the image to create]',
        generatingImage: 'Creating your image, please wait a moment...',
        imageGenerationError: 'Sorry, there was an error creating the image. Please try another prompt.',
        hotelLinkInstruction: `ABSOLUTE and UNBREAKABLE RULE regarding hotel links:
You are provided with an official list of hotels as a JSON array. Your only job is to use this data.
1. When a user asks for a hotel, find the object in the provided JSON array where the 'name' property matches the user's request.
2. You MUST return only the value of the 'url' property from that matching object. Do not add any other text.
3. If you cannot find an exact match for the hotel name in the JSON array, you MUST respond with only this exact sentence: "Unfortunately, the link for that hotel is not in my official list. Please search for it directly on safarnameh24.com."
4. Guessing, creating, or modifying a URL is a major violation of your rules and is absolutely forbidden.
5. Do not format the URL as a markdown link. Provide the raw URL string only.`,
        hotelLinkListHeader: 'Here is the official list of hotels as a JSON array. You MUST use this data to find the hotel URL:',
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
        likeResponse: 'پسندیدم', dislikeResponse: 'نپسندیدم',
        botPersona: 'شما یک دستیار هوش مصنوعی برای «سفرنامه ۲۴» هستید، یک شرکت خدمات مسافرتی که امکان رزرو هتل و سایر خدمات سفر را در وب‌سایت safarnameh24.com فراهم می‌کند. نام شما «دستیار هوشمند سفرنامه» است. شما در زمینه سفر و گردشگری در ایران و سراسر جهان متخصص هستید. بسیار دوستانه، مفید و همدل باشید. پاسخ‌های دقیق و جامع ارائه دهید. هدف اصلی شما تشویق کاربران برای استفاده و رزرو خدمات از طریق وب‌سایت safarnameh24.com است.',
        languageRule: 'مهم: شما باید فقط به زبان فارسی پاسخ دهید. از هیچ زبان دیگری استفاده نکنید.',
        voiceCapabilityInstruction: 'شما یک دستیار صوتی هستید. وقتی در مورد صدای شما سوال پرسیده می‌شود، توضیح دهید که شما یک هوش مصنوعی هستید که با استفاده از فناوری تبدیل متن به گفتار دستگاه صحبت می‌کنید و این به شما صدا می‌دهد تا با کاربران تعامل داشته باشید.',
        imageGenerationInstruction: 'اگر کاربر از شما خواست تصویری ایجاد کنید، باید از فرمت زیر در پاسخ خود استفاده کنید و هیچ چیز دیگری در پاسخ خود قرار ندهید: [GENERATE_IMAGE: توضیحات دقیق در مورد تصویری که باید ایجاد شود]',
        generatingImage: 'در حال ساخت تصویر شما...',
        imageGenerationError: 'متاسفانه در ساخت تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
        hotelLinkInstruction: `قانون مطلق و غیرقابل تخطی در مورد لینک هتل‌ها:
یک لیست رسمی از هتل‌ها در قالب یک آرایه JSON به شما داده شده است. وظیفه شما فقط و فقط استفاده از این داده‌هاست.
۱. وقتی کاربر نام هتلی را می‌پرسد، شما باید در آرایه JSON ارائه شده، شیء مربوط به آن هتل را که مقدار کلید 'name' آن با درخواست کاربر مطابقت دارد، پیدا کنید.
۲. شما **باید** فقط و فقط مقدار کلید 'url' را از همان شیء پیدا شده برگردانید. هیچ متن دیگری اضافه نکنید.
۳. اگر نتوانستید نام هتل را به طور دقیق در آرایه JSON پیدا کنید، **باید** فقط و فقط این جمله را پاسخ دهید: «متاسفانه لینک هتل مورد نظر شما در لیست رسمی من وجود ندارد. لطفا نام آن را مستقیماً در سایت safarnameh24.com جستجو کنید.»
۴. حدس زدن، ساختن، یا تغییر دادن URL یک **تخلف بزرگ** از قوانین شماست و مطلقاً ممنوع است.
۵. لینک را در قالب مارک‌داون نفرستید. فقط رشته URL خام را برگردانید.`,
        hotelLinkListHeader: 'این لیست رسمی هتل‌ها در قالب یک آرایه JSON است. شما باید از این داده‌ها برای یافتن لینک هتل استفاده کنید:',
    }
};
