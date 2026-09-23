export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: 'WeatherCard' | 'AlertCard' | 'MapCard';
  data?: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const processQuery = async (query: string, language = navigator.language, locationName = 'Your Location'): Promise<ChatMessage> => {
  const lowerQuery = query.toLowerCase();
  
  try {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        language,
        location: locationName
      })
    });

    if (!response.ok) {
      throw new Error('AI backend request failed');
    }

    const data = await response.json();
    const reply = data.reply;

    // We can also trigger dynamic UI components based on keywords in the AI's response or user's prompt
    let component: ChatMessage['component'];
    let componentData: any;

    if (lowerQuery.includes('rain') || lowerQuery.includes('weather') || lowerQuery.includes('tomorrow')) {
      component = 'WeatherCard';
      componentData = { temp: 28, condition: 'High Rain Probability', location: locationName };
    } else if (lowerQuery.includes('alert') || lowerQuery.includes('risk') || lowerQuery.includes('disaster')) {
      component = 'AlertCard';
      componentData = { location: 'Bihar Region' };
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
