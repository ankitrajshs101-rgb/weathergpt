export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: 'WeatherCard' | 'AlertCard' | 'MapCard';
  data?: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// aiService is the frontend bridge to the backend AI route.
//
// Flow:
// 1. AiChat sends user question, selected language, and current location.
// 2. Backend adds live weather context and asks the AI service.
// 3. This file returns a ChatMessage that the UI can render.

interface QueryLocation {
  name: string;
  lat: number;
  lon: number;
}

const weatherKeywords = [
  'weather', 'rain', 'tomorrow', 'mausam', 'barish', 'fog', 'heat', 'heat wave',
  'thunderstorm', 'storm', 'wind', 'humidity', 'temperature', 'cold', 'alert'
];

// Main function used by AiChat.tsx.
export const processQuery = async (
  query: string,
  language = navigator.language,
  location: QueryLocation = { name: 'Your Location', lat: 26.1542, lon: 85.8918 }
): Promise<ChatMessage> => {
  const lowerQuery = query.toLowerCase();
  
  try {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        language,
        location: location.name,
        lat: location.lat,
        lon: location.lon
      })
    });

    if (!response.ok) {
      throw new Error('AI backend request failed');
    }

    const data = await response.json();
    const reply = data.reply;
    const liveWeather = data.weather;

    // Show richer cards for weather/alert questions.
    let component: ChatMessage['component'];
    let componentData: any;

    if (weatherKeywords.some(keyword => lowerQuery.includes(keyword))) {
      component = 'WeatherCard';
      componentData = liveWeather || { temp: 28, condition: 'Weather Update', location: location.name };
    } else if (lowerQuery.includes('alert') || lowerQuery.includes('risk') || lowerQuery.includes('disaster')) {
      component = 'AlertCard';
      componentData = { location: location.name };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: reply,
      component,
      data: componentData
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I am currently experiencing connectivity issues with the AI backend. Please try again later."
    };
  }
};
