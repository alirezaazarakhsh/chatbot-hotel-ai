

import React, { useState, useEffect, useRef } from 'react';
import { Message, Language } from '../types';
import { translations } from '../i18n/translations';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { MapPreview } from './MapPreview';
import { Icons } from './Icons';

export const MessageRenderer: React.FC<{
    message: Message;
    isLoading: boolean;
    isLastMessage: boolean;
    isMapEnabled: boolean;
    onCopy: (text: string, id: string) => void;
    copiedMessageId: string | null;
    onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
    t: (key: keyof typeof translations.en) => string;
    language: Language;
}> = ({ message, isLoading, isLastMessage, isMapEnabled, onCopy, copiedMessageId, onFeedback, t, language }) => {
    const { id, text, audioUrl, sender, isSpeaking, timestamp, imageUrl, isCancelled, feedback, groundingChunks } = message;
    const [displayedText, setDisplayedText] = useState('');
    const [location, setLocation] = useState<string | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (sender === 'bot' && text) {
            const locationMatch = text.match(/\(مکان:\s*([^)]+)\)/) || text.match(/\(Location:\s*([^)]+)\)/);
            setLocation(locationMatch ? locationMatch[1].trim() : null);
        }
    }, [text, sender]);

    useEffect(() => {
        const isBotGenerating = sender === 'bot' && isLastMessage && isLoading;

        if (!isBotGenerating || isCancelled) {
            setDisplayedText(text);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        let currentText = '';
        let startTime: number | null = null;
        const typingSpeed = 50; // characters per second

        const animate = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const charsToShow = Math.floor(elapsedTime / (1000 / typingSpeed));
            
            if (currentText.length < text.length) {
                currentText = text.substring(0, charsToShow);
                setDisplayedText(currentText);
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                 setDisplayedText(text);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [text, sender, isLastMessage, isLoading, isCancelled]);

    if (isLoading && isLastMessage && sender === 'bot' && !text && !imageUrl && !audioUrl) {
        return (
            <div className="flex items-center gap-2.5 px-2">
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
        );
    }

    const parseTextToComponents = (inputText: string): React.ReactNode[] => {
        const cleanText = inputText.replace(/\(مکان:\s*([^)]+)\)/g, '').replace(/\(Location:\s*([^)]+)\)/g, '').trim();
        const regex = /https?:\/\/[^\s.,;!?()]+/g; let lastIndex = 0; const components: React.ReactNode[] = []; let match;
        while ((match = regex.exec(cleanText)) !== null) {
            if (match.index > lastIndex) components.push(cleanText.substring(lastIndex, match.index));
            components.push(<a key={match.index} href={match[0]} target="_blank" rel="noopener noreferrer" className="text-[#F30F26] hover:underline">{match[0]}</a>);
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < cleanText.length) components.push(cleanText.substring(lastIndex));
        return components;
    };
    
    return (
        <div className="group">
             {imageUrl && <img src={imageUrl} alt={t('imagePreview')} className="rounded-lg mb-2 max-w-full h-auto" />}
             {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} timestamp={timestamp || ''} sender={sender}/>}
             {isSpeaking && <div className="flex items-center space-x-2 rtl:space-x-reverse"><Icons.Speaking /></div>}
             {text && (<div><p className="whitespace-pre-wrap">{parseTextToComponents(displayedText)}</p>{isMapEnabled && location && <MapPreview location={location} t={t} />}</div>)}
             
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

             {sender === 'bot' && text && !isSpeaking && !isLoading && (
                <div className={`flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${language === 'fa' ? 'justify-end' : 'justify-start'}`}>
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
        </div>
    );
};