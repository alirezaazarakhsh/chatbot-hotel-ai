import React from 'react';

export const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-7 rounded-full w-12 transition-all duration-300 ease-in-out focus:outline-none ${enabled ? 'bg-[#F30F26]' : 'bg-neutral-300 dark:bg-neutral-600'}`} type="button" role="switch" aria-checked={enabled}>
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${enabled ? 'start-6' : 'start-1'}`} />
    </button>
);