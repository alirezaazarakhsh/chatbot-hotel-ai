// Fix: Use relative path for local module import
import { HotelLink, FAQ, BotVoice, BotSettings } from '../types';

export const apiService = {
    fetchBotSettings: async (): Promise<Partial<BotSettings>> => {
        try {
            const response = await fetch(`/api/v1/chatbot/settings/`);
            if (!response.ok) {
                console.error(`Failed to fetch bot settings. Status: ${response.status}.`);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching bot settings:', error, 'The app will use default settings.');
            return {};
        }
    },
    fetchHotelLinks: async (): Promise<HotelLink[]> => {
        try {
            const response = await fetch(`/api/v1/hotel/hotels/chatbot/`);
            if (!response.ok) {
                console.error(`Failed to fetch hotel links. Status: ${response.status}.`);
                return [];
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                return data;
            }
            console.error('Hotel links API did not return an array:', data);
            return [];
        } catch (error) {
            console.error('Error fetching hotel links:', error);
            return [];
        }
    },
    fetchFAQs: async (): Promise<FAQ[]> => {
        try {
            const response = await fetch(`/api/v1/chatbot/faqs/`);
            if (!response.ok) {
                console.error(`Failed to fetch FAQs. Status: ${response.status}.`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return [];
        }
    },
    generateTTS: async (text: string, voice: BotVoice): Promise<{ audio_data: string }> => {
        const response = await fetch(`/api/v1/chatbot/tts/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_name: voice })
        });
        if (!response.ok) throw new Error('Failed to generate TTS');
        return await response.json();
    }
};