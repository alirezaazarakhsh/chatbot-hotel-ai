
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { translations } from '../i18n/translations';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { MapPreview } from './MapPreview';
import { Icons } from './Icons';

export const MessageRenderer: React.FC<{ message: Message; isLoading: boolean; isLastMessage: boolean; isMapEnabled: boolean; onCopy: (text: string, id: string) => void; copiedMessageId: string | null; t: (key: keyof typeof translations.en) => string; }> = ({ message, isLoading, isLastMessage, isMapEnabled, onCopy, copiedMessageId, t }) => {
    const { id, text, audioUrl, sender, isSpeaking, timestamp, imageUrl, isCancelled } = message;
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
        <div className="group relative">
             {imageUrl && <img src={imageUrl} alt={t('imagePreview')} className="rounded-lg mb-2 max-w-full h-auto" />}
             {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} timestamp={timestamp || ''} sender={sender}/>}
             {isSpeaking && <div className="flex items-center space-x-2 rtl:space-x-reverse"><Icons.Speaking /></div>}
             {text && (<div><p className="whitespace-pre-wrap">{parseTextToComponents(displayedText)}</p>{isMapEnabled && location && <MapPreview location={location} t={t} />}</div>)}
             {sender === 'bot' && text && !isSpeaking && !isLoading && (<div className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity ${document.documentElement.dir === 'rtl' ? '-left-8' : '-right-8'}`}>
                <button onClick={() => onCopy(text, id)} className="p-1.5 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-500">{copiedMessageId === id ? <Icons.Check /> : <Icons.Copy />}</button>
             </div>)}
        </div>
    );
};
