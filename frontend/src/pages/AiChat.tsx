import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MapPin, Globe, Paperclip, Loader2, Cloud, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { processQuery, type ChatMessage } from '../services/aiService';
import { cn } from '../lib/utils';
import { useUserLocation } from '../contexts/LocationContext';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const languageOptions = [
  { label: 'Auto', value: '' },
  { label: 'Hindi', value: 'hi-IN' },
  { label: 'English', value: 'en-IN' },
  { label: 'Bengali', value: 'bn-IN' },
  { label: 'Tamil', value: 'ta-IN' },
  { label: 'Telugu', value: 'te-IN' },
  { label: 'Marathi', value: 'mr-IN' },
  { label: 'Gujarati', value: 'gu-IN' },
  { label: 'Kannada', value: 'kn-IN' },
  { label: 'Malayalam', value: 'ml-IN' },
  { label: 'Punjabi', value: 'pa-IN' },
  { label: 'Urdu', value: 'ur-IN' },
];

// AiChat page flow:
// 1. User types or speaks a question.
// 2. sendQuery sends the question plus location/language to aiService.
// 3. The answer is added to messages and can be spoken aloud.
// 4. Weather/alert cards render when aiService marks a message with a component.
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
  const [language, setLanguage] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { location: userLocation, locating, refreshLocation } = useUserLocation();
  const selectedLanguage = language || navigator.language || 'en-IN';
  const voiceSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakMessage = (message: ChatMessage) => {
    if (!('speechSynthesis' in window) || message.role !== 'assistant') return;

    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const sendQuery = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: cleanQuery };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setVoiceError('');

    try {
      const response = await processQuery(userMsg.content, selectedLanguage, userLocation);
      setMessages(prev => [...prev, response]);
      setTimeout(() => speakMessage(response), 100);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI service is temporarily unavailable. Please make sure the backend is running.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendQuery(input);
  };

  const handleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';
    recognition.onstart = () => {
      setVoiceError('');
      setIsRecording(true);
    };
    recognition.onresult = event => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript || transcript);
    };
    recognition.onerror = event => {
      setVoiceError(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Could not understand the voice input.');
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      const spokenText = finalTranscript.trim();
      if (spokenText) {
        void sendQuery(spokenText);
      }
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full">
      <div className="text-center mb-6 shrink-0">
        <h2 className="text-3xl font-bold">WeatherGPT AI</h2>
        <p className="text-muted-foreground">Ask anything about weather, forecasts, alerts and climate.</p>
        <button type="button" onClick={refreshLocation} className="mt-2 text-sm text-primary hover:underline">
          {locating ? 'Detecting your location...' : `Using ${userLocation.name}`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 p-4 rounded-xl border bg-background/50 backdrop-blur-sm shadow-sm mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4",
              msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border rounded-tl-sm shadow-sm"
            )}>
              <div className="flex items-start gap-3">
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap flex-1">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => speakMessage(msg)}
                    aria-label={speakingId === msg.id ? 'Stop voice' : 'Read answer aloud'}
                  >
                    {speakingId === msg.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              
              {/* Dynamic Components */}
              {msg.component === 'WeatherCard' && msg.data && (
                <Card className="mt-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{msg.data.temp}°C</div>
                        <div className="text-sm text-white/80">{msg.data.condition} in {msg.data.location}</div>
                      </div>
                      <Cloud className="h-10 w-10 text-white/90" />
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-white/85 md:grid-cols-4">
                        <div className="rounded-md bg-white/15 p-2">Feels {msg.data.feelsLike ?? msg.data.temp}°C</div>
                        <div className="rounded-md bg-white/15 p-2">Rain {msg.data.rainProb ?? 0}%</div>
                        <div className="rounded-md bg-white/15 p-2">Humidity {msg.data.humidity ?? '--'}%</div>
                        <div className="rounded-md bg-white/15 p-2">Wind {msg.data.windSpeed ?? '--'} km/h</div>
                      </div>
                      <div className="mt-2 text-xs text-white/90">
                        Risk: {msg.data.riskLevel || 'Low'}{msg.data.hazards?.length ? ` - ${msg.data.hazards.join(', ')}` : ''}
                      </div>
                    </div>
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
          <select
            value={language}
            onChange={event => setLanguage(event.target.value)}
            className="hidden md:block h-10 rounded-md border bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Voice language"
          >
            {languageOptions.map(option => (
              <option key={option.value || 'auto'} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isRecording ? 'Listening...' : 'Ask WeatherGPT anything...'} 
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-base h-12 px-0"
          />
          <Button 
            type="button" 
            variant={isRecording ? "destructive" : "secondary"} 
            size="icon" 
            className={cn("rounded-full h-10 w-10 shrink-0 transition-all", isRecording && "animate-pulse")}
            onClick={handleVoice}
            disabled={loading}
            aria-label={isRecording ? 'Stop listening' : 'Start voice input'}
            title={voiceSupported ? 'Start voice input' : 'Voice input works in Chrome or Edge'}
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
      {(!voiceSupported || voiceError) && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {voiceError || 'Voice input is not supported in this browser. Please open the app in Chrome or Edge.'}
        </p>
      )}
    </div>
  );
}
