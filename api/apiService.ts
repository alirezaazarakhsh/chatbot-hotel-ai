
import { API_BASE_URL } from '../constants';
import { HotelLink, FAQ, BotVoice, BotSettings } from '../types';

export const apiService = {
    fetchBotSettings: async (): Promise<Partial<BotSettings>> => {
        let settings: Partial<BotSettings> = {};
        try {
            const settingsResponse = await fetch(`${API_BASE_URL}/settings/`);
            if (settingsResponse.ok) {
                settings = await settingsResponse.json();
            } else {
                console.error(`Failed to fetch bot settings. Status: ${settingsResponse.status}. The app will use default settings.`);
            }
        } catch (error) {
            console.error('Error fetching bot settings:', error, 'The app will use default settings.');
        }

        // This fetch correctly retrieves hotel links from the specified API endpoint.
        const hotelLinksResponse = await fetch(`/api/v1/hotel/hotels/chatbot/`);
        if (!hotelLinksResponse.ok) throw new Error('Failed to fetch hotel links');
        const hotelLinks: HotelLink[] = await hotelLinksResponse.json();
        return { ...settings, hotel_links: hotelLinks };
    },
    fetchFAQs: async (): Promise<FAQ[]> => {
        const response = await fetch(`${API_BASE_URL}/faqs/`);
        if (!response.ok) throw new Error('Failed to fetch FAQs');
        return await response.json();
    },
    sendChatMessage: async (payload: any, signal: AbortSignal): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/message/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), signal
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message');
        }
        const responseData = await response.json();
        return responseData.response;
    },
    generateTTS: async (text: string, voice: BotVoice): Promise<{ audio_data: string }> => {
        const response = await fetch(`${API_BASE_URL}/tts/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_name: voice })
        });
        if (!response.ok) throw new Error('Failed to generate TTS');
        return await response.json();
    }
};
