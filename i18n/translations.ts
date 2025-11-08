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
You are provided with an official list of hotels and their links. Your only job is to extract information from this list.
1. If a user asks for a hotel that is in your list, you MUST copy the exact, full URL from the list and provide it as the response. Example: https://www.safarnameh24.com/best-hotels/espinaspalace
2. If the hotel is NOT in your list, you MUST respond with only this exact sentence: "Unfortunately, the link for that hotel is not in my official list. Please search for it directly on safarnameh24.com."
3. Guessing, creating, or searching for any other link is a major violation of your rules and is absolutely forbidden.
4. Do not, under any circumstances, format the links with markdown, brackets, or parentheses. Provide the raw URL only.`,
        hotelLinkListHeader: 'Here is the official list of hotels and their links you MUST use:',
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
شما یک لیست رسمی از هتل‌ها و لینک‌هایشان در اختیار دارید. وظیفه شما فقط و فقط استخراج اطلاعات از این لیست است.
۱. اگر کاربر نام هتلی را پرسید که در لیست شما وجود دارد، شما **باید** و **حتماً** لینک دقیق و کامل آن را از لیست کپی کرده و به تنهایی در پاسخ قرار دهید. مثال: https://www.safarnameh24.com/best-hotels/espinaspalace
۲. اگر هتل در لیست شما نبود، شما **باید** فقط و فقط این جمله را پاسخ دهید: «متاسفانه لینک هتل مورد نظر شما در لیست رسمی من وجود ندارد. لطفا نام آن را مستقیماً در سایت safarnameh24.com جستجو کنید.»
۳. حدس زدن، ساختن، یا جستجوی هرگونه لینک دیگر یک **تخلف بزرگ** از قوانین شماست و مطلقاً ممنوع است.
۴. به هیچ وجه لینک‌ها را در قالب مارک‌داون یا با براکت و پرانتز نفرستید. فقط URL خام.`,
        hotelLinkListHeader: 'این لیست رسمی هتل‌ها و لینک‌های آن‌هاست که باید از آن استفاده کنید:',
    }
};