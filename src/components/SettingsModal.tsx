
import React, { useState, useEffect, useRef } from 'react';
import { BotVoice, Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import { AVAILABLE_FONTS } from '../constants';
import { Icons } from './Icons';
import { ToggleSwitch } from './ToggleSwitch';

export const SettingsModal: React.FC<{
    isOpen: boolean; onClose: () => void; isBotVoiceEnabled: boolean; setIsBotVoiceEnabled: (e: boolean) => void;
    botVoice: BotVoice; setBotVoice: (v: BotVoice) => void; appFont: string; setAppFont: (f: string) => void;
    isMapEnabled: boolean; setIsMapEnabled: (e: boolean) => void; language: Language; setLanguage: (l: Language) => void;
    theme: Theme; setTheme: (t: Theme) => void; t: (key: keyof typeof translations.en) => string;
}> = ({ isOpen, onClose, isBotVoiceEnabled, setIsBotVoiceEnabled, botVoice, setBotVoice, appFont, setAppFont, isMapEnabled, setIsMapEnabled, language, setLanguage, theme, setTheme, t }) => {
    const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsFontDropdownOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;
    
    const translatedFonts = AVAILABLE_FONTS.map(font => ({
      ...font,
      name: language === 'fa' ? font.name : font.name_en,
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1C] border dark:border-neutral-700 rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-black dark:text-white">{t('settingsTitle')}</h2>
                    <button onClick={onClose} className="p-1.5 text-neutral-500 dark:text-neutral-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"><Icons.Close /></button>
                </div>
                <div className="p-6 space-y-6 text-black dark:text-white max-h-[calc(100vh-10rem)] overflow-y-auto">
                    <div className="flex items-center justify-between"><label className="font-medium text-neutral-700 dark:text-neutral-300">{t('voiceResponse')}</label><ToggleSwitch enabled={isBotVoiceEnabled} onChange={setIsBotVoiceEnabled} /></div>
                    <div className="border-t dark:border-neutral-800"></div>
                    <div className="flex items-center justify-between"><label className="font-medium text-neutral-700 dark:text-neutral-300">{t('showMap')}</label><ToggleSwitch enabled={isMapEnabled} onChange={setIsMapEnabled} /></div>
                    <div className="border-t dark:border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-3">{t('assistantVoice')}</label>
                        <div className="flex gap-3" role="radiogroup">
                            <button role="radio" aria-checked={botVoice === 'Puck'} onClick={() => setBotVoice('Puck')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${botVoice === 'Puck' ? 'bg-neutral-600 dark:bg-neutral-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('male')}</button>
                            <button role="radio" aria-checked={botVoice === 'Kore'} onClick={() => setBotVoice('Kore')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${botVoice === 'Kore' ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('female')}</button>
                        </div>
                    </div>
                    <div className="border-t dark:border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-3">{t('appFont')}</label>
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsFontDropdownOpen(prev => !prev)} className="w-full flex justify-between items-center p-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F30F26]">
                                <span>{translatedFonts.find(f => f.family === appFont)?.name || appFont}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            {isFontDropdownOpen && (
                                <div className="absolute z-10 top-full mt-2 w-full bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden"><ul className="py-1">
                                    {translatedFonts.map(font => (<li key={font.family}><button onClick={() => { setAppFont(font.family); setIsFontDropdownOpen(false); }} className={`w-full text-start px-4 py-2 text-sm transition-colors ${appFont === font.family ? 'bg-[#F30F26] text-white' : 'text-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                        <div className="flex justify-between items-center"><span>{font.name}</span>{appFont === font.family && <Icons.Check className="h-5 w-5 text-white" />}</div>
                                    </button></li>))}
                                </ul></div>
                            )}
                        </div>
                    </div>
                    <div className="border-t dark:border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-3">{t('language')}</label>
                        <div className="flex gap-3" role="radiogroup">
                            <button role="radio" aria-checked={language === 'en'} onClick={() => setLanguage('en')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${language === 'en' ? 'bg-neutral-600 dark:bg-neutral-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('english')}</button>
                            <button role="radio" aria-checked={language === 'fa'} onClick={() => setLanguage('fa')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${language === 'fa' ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('persian')}</button>
                        </div>
                    </div>
                     <div className="border-t dark:border-neutral-800"></div>
                    <div>
                        <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-3">{t('theme')}</label>
                        <div className="flex gap-3" role="radiogroup">
                            <button role="radio" aria-checked={theme === 'light'} onClick={() => setTheme('light')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-neutral-600 dark:bg-neutral-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('light')}</button>
                            <button role="radio" aria-checked={theme === 'dark'} onClick={() => setTheme('dark')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${theme === 'dark' ? 'bg-[#F30F26] text-white' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400'}`}>{t('dark')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};