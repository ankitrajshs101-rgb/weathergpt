import { getMockCurrentWeather } from './weatherService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: 'WeatherCard' | 'AlertCard' | 'MapCard';
  data?: any;
}

export const processQuery = async (query: string): Promise<ChatMessage> => {
  const lowerQuery = query.toLowerCase();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (lowerQuery.includes('rain') && lowerQuery.includes('tomorrow')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Yes, there is a high probability (80%) of rain tomorrow. Expect stormy conditions.",
      component: 'WeatherCard',
      data: getMockCurrentWeather()
    };
  }

  if (lowerQuery.includes('irrigate') && lowerQuery.includes('wheat')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Rain is expected in the next 24 hours. Consider postponing irrigation and monitor official weather warnings. **AI-generated advisory — not a substitute for official agricultural guidance.**",
    };
  }
  
  if (lowerQuery.includes('districts') && lowerQuery.includes('risk')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Currently, Darbhanga and Patna are showing elevated risk levels due to Heavy Rain and Thunderstorms.",
      component: 'AlertCard',
      data: { location: 'Darbhanga' } 
    };
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: "Based on the available data, conditions are warm today with a possibility of afternoon rainfall. Ask me about specific locations or extreme weather alerts!"
  };
};
