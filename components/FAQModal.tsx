
import React from 'react';
import { FAQ } from '../types';
import { Icons } from './Icons';
import { translations } from '../i18n/translations';

export const FAQModal: React.FC<{ isOpen: boolean; onClose: () => void; faqs: FAQ[]; t: (key: keyof typeof translations.en) => string; }> = ({ isOpen, onClose, faqs, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[calc(100vh-2rem)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-black dark:text-white">{t('faqTitle')}</h2>
                    <button onClick={onClose} className="p-1.5 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"><Icons.Close /></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                    {faqs && faqs.length > 0 ? (
                        faqs.map((faq) => (
                            <div key={faq.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                <h3 className="font-semibold text-lg text-[#F30F26] mb-2">{faq.question}</h3>
                                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{faq.answer}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 text-neutral-500">{t('noFaqs')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
