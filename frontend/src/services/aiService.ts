export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: 'WeatherCard' | 'AlertCard' | 'MapCard';
  data?: any;
}

export const processQuery = async (query: string): Promise<ChatMessage> => {
  const lowerQuery = query.toLowerCase();
  
  try {
    // We use Pollinations AI, a free public LLM wrapper, to act as the AI Backend.
    // It requires no API key, making it perfect for a live hackathon prototype.
    const response = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "You are WeatherGPT, an advanced AI for weather forecasting, disaster alerts, and climate information, developed for the Smart India Hackathon (Ministry of Earth Sciences). You provide concise, professional, and helpful responses to users regarding weather conditions, crop advice, and extreme alerts. Keep responses under 4 sentences." 
          },
          { role: "user", content: query }
        ],
        model: "openai"
      })
    });

    const data = await response.json();
    let reply = data.choices[0].message.content;

    // We can also trigger dynamic UI components based on keywords in the AI's response or user's prompt
    let component: ChatMessage['component'];
    let componentData: any;

    if (lowerQuery.includes('rain') || lowerQuery.includes('weather') || lowerQuery.includes('tomorrow')) {
      component = 'WeatherCard';
      componentData = { temp: 28, condition: 'High Rain Probability', location: 'Darbhanga' };
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
