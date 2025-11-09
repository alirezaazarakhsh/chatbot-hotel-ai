import React from 'react';
import { Icons } from './Icons';
import { translations } from '../i18n/translations';

export const LocationPermissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    t: (key: keyof typeof translations.en) => string;
}> = ({ isOpen, onClose, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-black dark:text-white">{t('locationModalTitle')}</h2>
                    <button onClick={onClose} className="p-1.5 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"><Icons.Close /></button>
                </div>
                <div className="p-6 text-center">
                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                        <Icons.MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                     </div>
                    <p className="text-neutral-700 dark:text-neutral-300">
                        {t('locationModalBody')}
                    </p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 text-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-lg bg-[#F30F26] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                        {t('locationModalClose')}
                    </button>
                </div>
            </div>
        </div>
    );
};
