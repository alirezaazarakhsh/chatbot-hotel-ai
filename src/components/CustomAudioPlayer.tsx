import React, { useState, useEffect, useRef } from 'react';
// FIX: Changed path alias to relative path to resolve module loading error.
import { Icons } from './Icons';

export const CustomAudioPlayer: React.FC<{ audioUrl: string; timestamp: string; sender: 'user' | 'bot' }> = ({ audioUrl, timestamp, sender }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const waveformBars = useRef<number[]>(Array.from({ length: 40 }, () => Math.floor(Math.random() * 80) + 20)).current;

    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        const setAudioData = () => { setDuration(audio.duration); setCurrentTime(audio.currentTime); setIsReady(true); };
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', onEnded);
        return () => { audio.removeEventListener('loadeddata', setAudioData); audio.removeEventListener('timeupdate', setAudioTime); audio.removeEventListener('ended', onEnded); audio.pause(); };
    }, [audioUrl]);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current && isReady) { isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }
    };
    const formatTime = (time: number) => {
        if (!isFinite(time) || time < 0) return '00:00';
        const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isUser = sender === 'user';
    const playButtonBg = isUser ? 'bg-white/30' : 'bg-neutral-400/50 dark:bg-white/30';
    const textColor = isUser ? 'text-white/80' : 'text-neutral-600 dark:text-white/70';

    return (
        <div className="flex items-center gap-3 w-full max-w-[250px] sm:max-w-xs">
            <button onClick={togglePlayPause} disabled={!isReady} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 focus:outline-none transition-colors ${playButtonBg}`}>
                {isPlaying ? <Icons.AudioPause /> : <Icons.AudioPlay />}
            </button>
            <div className="flex flex-col flex-grow w-full">
                <div className="flex items-center h-8 gap-px">
                    {waveformBars.map((height, i) => <div key={i} className="w-0.5 rounded-full" style={{ height: `${height}%`, backgroundColor: isPlaying && (currentTime / (duration || 1)) * 100 >= ((i + 1) / waveformBars.length) * 100 ? (isUser ? '#FFFFFF' : 'rgb(38 38 38 / 1)') : (isUser ? 'rgba(255, 255, 255, 0.5)' : 'rgb(38 38 38 / 0.4)') }} />)}
                </div>
                <div className={`flex justify-between items-center text-xs mt-1 ${textColor}`}>
                    <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
                    <span>{timestamp}</span>
                </div>
            </div>
        </div>
    );
};