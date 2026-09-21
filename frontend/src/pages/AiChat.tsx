import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MapPin, Globe, Paperclip, Loader2, Cloud, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { processQuery, type ChatMessage } from '../services/aiService';
import { cn } from '../lib/utils';

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am WeatherGPT. Ask me anything about weather, forecasts, extreme alerts, and climate.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await processQuery(userMsg.content);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI service is temporarily unavailable.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput('Will it rain tomorrow?');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInput('Will it rain tomorrow?');
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full">
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-3xl font-bold">WeatherGPT AI</h2>
        <p className="text-muted-foreground">Ask anything about weather, forecasts, alerts and climate.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 p-4 rounded-xl border bg-background/50 backdrop-blur-sm shadow-sm mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4",
              msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border rounded-tl-sm shadow-sm"
            )}>
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {/* Dynamic Components */}
              {msg.component === 'WeatherCard' && msg.data && (
                <Card className="mt-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{msg.data.temp}°C</div>
                      <div className="text-sm text-white/80">{msg.data.condition} in {msg.data.location}</div>
                    </div>
                    <Cloud className="h-10 w-10 text-white/90" />
                  </CardContent>
                </Card>
              )}

              {msg.component === 'AlertCard' && (
                <Card className="mt-4 border-red-500/50 bg-red-50 dark:bg-red-900/20 shadow-md">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-red-700 dark:text-red-400">High Risk Alert</div>
                      <div className="text-sm text-red-800 dark:text-red-300 mt-1">Elevated risk levels detected. Please check the Alert Center for {msg.data?.location}.</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-card border shadow-sm shrink-0">
        <div className="flex gap-1 pb-1 px-2 hidden sm:flex">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MapPin className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Globe className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Paperclip className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 pl-2 sm:pl-0 pr-1">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask WeatherGPT anything..." 
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-base h-12 px-0"
          />
          <Button 
            type="button" 
            variant={isRecording ? "destructive" : "secondary"} 
            size="icon" 
            className={cn("rounded-full h-10 w-10 shrink-0 transition-all", isRecording && "animate-pulse")}
            onClick={handleVoice}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
