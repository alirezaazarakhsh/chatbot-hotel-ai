
import { API_BASE_URL } from '../constants';
import { HotelLink, FAQ, BotVoice, BotSettings } from '../types';

export const apiService = {
    fetchBotSettings: async (): Promise<Partial<BotSettings>> => {
        try {
            // Use the consistent API_BASE_URL for chatbot settings.
            const settingsResponse = await fetch(`${API_BASE_URL}/settings/`);
            let settings: Partial<BotSettings> = {};
            if (settingsResponse.ok) {
                settings = await settingsResponse.json();
            } else {
                console.error(`Failed to fetch bot settings. Status: ${settingsResponse.status}.`);
            }

            // Fetch hotel links from the specific hotel API endpoint.
            const hotelLinksResponse = await fetch(`/api/v1/hotel/hotels/chatbot/`);
            let hotelLinks: HotelLink[] = [];
            if (hotelLinksResponse.ok) {
                hotelLinks = await hotelLinksResponse.json();
            } else {
                console.error(`Failed to fetch hotel links. Status: ${hotelLinksResponse.status}.`);
            }
            
            return { ...settings, hotel_links: hotelLinks };
        } catch (error) {
            console.error('Error fetching initial bot data:', error, 'The app will use default settings.');
            return { hotel_links: [] }; // Return default structure on catastrophic failure
        }
    },
    fetchFAQs: async (): Promise<FAQ[]> => {
        try {
            // Use the consistent API_BASE_URL for FAQs.
            const response = await fetch(`${API_BASE_URL}/faqs/`);
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
    sendChatMessage: async (payload: any, signal: AbortSignal): Promise<string> => {
        // This URL is correct and remains unchanged.
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
        // This URL is correct and remains unchanged.
        const response = await fetch(`${API_BASE_URL}/tts/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_name: voice })
        });
        if (!response.ok) throw new Error('Failed to generate TTS');
        return await response.json();
    }
};