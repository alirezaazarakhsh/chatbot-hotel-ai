
import React, { useState, useEffect } from 'react';
import { Message, Language } from '@/types';
import { translations } from '@/i18n/translations';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { MapPreview } from './MapPreview';
import { Icons } from './Icons';

export const MessageRenderer: React.FC<{
    message: Message;
    isLoading: boolean;
    isLastMessage: boolean;
    onCopy: (text: string, id: string) => void;
    copiedMessageId: string | null;
    onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
    t: (key: keyof typeof translations.en) => string;
    language: Language;
    editingMessageId: string | null;
    setEditingMessageId: (id: string | null) => void;
    onEditSubmit: (messageId: string, newText: string) => void;
}> = ({ message, isLoading, isLastMessage, onCopy, copiedMessageId, onFeedback, t, language, editingMessageId, setEditingMessageId, onEditSubmit }) => {
    const { id, text, audioUrl, sender, isSpeaking, timestamp, imageUrl, feedback, groundingChunks, toolCall } = message;
    const [location, setLocation] = useState<string | null>(null);
    const [editText, setEditText] = useState(text);

    const isEditing = editingMessageId === id;

    const handleSaveEdit = () => {
        onEditSubmit(id, editText);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditText(text); // Reset text on cancel
    };

    useEffect(() => {
        if (sender === 'bot' && text) {
            const locationMatch = text.match(/\(مکان:\s*([^)]+)\)/) || text.match(/\(Location:\s*([^)]+)\)/);
            setLocation(locationMatch ? locationMatch[1].trim() : null);
        } else {
            setLocation(null);
        }
    }, [text, sender]);

    if (isLoading && isLastMessage && sender === 'bot' && !text && !imageUrl && !audioUrl && !toolCall) {
        return (
            <div className="flex items-center gap-2.5 px-2">
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
        );
    }
    
    if (toolCall?.thinking) {
        let thinkingText = '';
        if (toolCall.name === 'generate_image') {
            thinkingText = t('generatingImage');
        }
        return (
             <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                <div role="status" className="w-5 h-5">
                     <svg aria-hidden="true" className="w-full h-full text-neutral-200 animate-spin dark:text-neutral-600 fill-[#F30F26]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
                 <p className="italic">{thinkingText}</p>
             </div>
        );
    }

    const parseTextToComponents = (inputText: string): React.ReactNode[] => {
        const cleanText = inputText.replace(/\(مکان:\s*([^)]+)\)/g, '').replace(/\(Location:\s*([^)]+)\)/g, '').trim();
        const regex = /\/?https?:\/\/[^\s.,;!?()]+/g; // Match URLs, optionally with a preceding slash
        let lastIndex = 0;
        const components: React.ReactNode[] = [];
        let match;

        while ((match = regex.exec(cleanText)) !== null) {
            if (match.index > lastIndex) {
                components.push(cleanText.substring(lastIndex, match.index));
            }
            const fullMatch = match[0];
            // Clean the URL for the href attribute by removing any leading slash.
            const href = fullMatch.startsWith('/') ? fullMatch.substring(1) : fullMatch;

            components.push(
                <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline break-all">
                    {fullMatch}
                </a>
            );
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanText.length) {
            components.push(cleanText.substring(lastIndex));
        }
        return components;
    };
    
    return (
        <div>
             {imageUrl && !isEditing && (
                <div className="mb-2 p-1 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 inline-block bg-neutral-100 dark:bg-neutral-800">
                    <img src={imageUrl} alt={t('imagePreview')} className="rounded-md max-w-full h-auto" />
                </div>
             )}
             {audioUrl && !isEditing && <CustomAudioPlayer audioUrl={audioUrl} timestamp={timestamp || ''} sender={sender}/>}
             {isSpeaking && <div className="flex items-center space-x-2 rtl:space-x-reverse"><Icons.Speaking /></div>}
             
             {isEditing ? (
                 <div className="w-full">
                     <textarea
                         value={editText}
                         onChange={(e) => setEditText(e.target.value)}
                         className="w-full p-2 border rounded-md bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#F30F26] resize-y text-neutral-900 dark:text-neutral-100"
                         rows={Math.min(10, Math.max(3, editText.split('\n').length))}
                         autoFocus
                     />
                     <div className={`flex gap-2 mt-2 ${language === 'fa' ? 'justify-start' : 'justify-end'}`}>
                         <button onClick={handleCancelEdit} className="px-3 py-1 rounded-md text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200">{t('cancel')}</button>
                         <button onClick={handleSaveEdit} className="px-3 py-1 rounded-md text-sm bg-[#F30F26] text-white hover:bg-red-700">{t('saveChanges')}</button>
                     </div>
                 </div>
             ) : (
                <>
                    {text && !audioUrl && (<div><p className="whitespace-pre-wrap">{parseTextToComponents(text)}</p>{location && <MapPreview location={location} t={t} />}</div>)}
                    {groundingChunks && groundingChunks.length > 0 && (
                         <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
                             <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">{t('sources')}</h4>
                             <ul className="text-xs space-y-1">
                                 {groundingChunks.map((chunk, index) => {
                                     const source = chunk.web || chunk.maps;
                                     if (!source || !source.uri) return null;
                                     return (
                                         <li key={index} className="flex items-start">
                                             <span className="me-2 text-neutral-400">&#8226;</span>
                                             <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline break-all">
                                                 {source.title || source.uri}
                                             </a>
                                         </li>
                                     );
                                 })}
                             </ul>
                         </div>
                     )}

                     {sender === 'bot' && text && !isSpeaking && !(isLastMessage && isLoading) && (
                        <div className={`flex items-center mt-2 transition-opacity ${language === 'fa' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-center gap-0.5 p-1 rounded-full bg-white dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700/60 shadow-sm">
                                <button onClick={() => onCopy(text, id)} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors" title={copiedMessageId === id ? t('copied') : t('copy')}>
                                    {copiedMessageId === id ? <Icons.Check /> : <Icons.Copy />}
                                </button>
                                <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700"></div>
                                <button
                                    onClick={() => onFeedback(id, 'like')}
                                    className={`p-1.5 rounded-full transition-colors ${feedback === 'like' ? 'text-green-500 bg-green-500/10' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-green-500'}`}
                                    aria-label={t('likeResponse')}
                                    title={t('likeResponse')}
                                >
                                    <Icons.ThumbsUp />
                                </button>
                                <button
                                    onClick={() => onFeedback(id, 'dislike')}
                                    className={`p-1.5 rounded-full transition-colors ${feedback === 'dislike' ? 'text-red-500 bg-red-500/10' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-red-500'}`}
                                    aria-label={t('dislikeResponse')}
                                    title={t('dislikeResponse')}
                                >
                                    <Icons.ThumbsDown />
                                </button>
                            </div>
                        </div>
                    )}
                    {sender === 'user' && text && !audioUrl && (
                        <div className={`flex items-center mt-2 transition-opacity ${language === 'fa' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-center gap-0.5 p-1 rounded-full bg-neutral-700/80 backdrop-blur-sm border border-neutral-600 shadow-sm">
                                <button onClick={() => { setEditingMessageId(id); setEditText(text); }} className="p-1.5 rounded-full hover:bg-neutral-600 text-neutral-300 transition-colors" title={t('edit')}>
                                    <Icons.Edit />
                                </button>
                                <div className="w-px h-4 bg-neutral-600"></div>
                                <button onClick={() => onCopy(text, id)} className="p-1.5 rounded-full hover:bg-neutral-600 text-neutral-300 transition-colors" title={copiedMessageId === id ? t('copied') : t('copy')}>
                                    {copiedMessageId === id ? <Icons.Check /> : <Icons.Copy />}
                                </button>
                            </div>
                        </div>
                    )}
                </>
             )}
        </div>
    );
};
