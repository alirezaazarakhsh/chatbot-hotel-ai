
import React from 'react';
import { translations } from '@/i18n/translations';

export const MapPreview: React.FC<{ location: string; t: (key: keyof typeof translations.en) => string; }> = ({ location, t }) => (
    <a href={`https://www.openstreetmap.org/?mlat=${location.split(',')[0]}&mlon=${location.split(',')[1]}#map=15/${location.split(',')[0]}/${location.split(',')[1]}`} target="_blank" rel="noopener noreferrer" className="mt-2 block border dark:border-neutral-700 rounded-lg overflow-hidden hover:border-red-500 transition-colors">
        <div className="p-3 bg-neutral-100 dark:bg-neutral-800/50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 me-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            <p className="font-semibold truncate">{location}</p>
        </div>
        <div className="p-2 text-center bg-neutral-200 dark:bg-neutral-700/50 text-sm font-medium text-red-600 dark:text-red-400">{t('showMap')}</div>
    </a>
);
