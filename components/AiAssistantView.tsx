
import React, { useState, useRef, useEffect } from 'react';
import { AiChatMessage, ParsedMeetingRequest } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { generateUniqueId } from '../utils/helpers';

interface AiAssistantViewProps {
  onProcessQuery: (query: string) => Promise<ParsedMeetingRequest>;
  onScheduleFromNLP: (parsedRequest: ParsedMeetingRequest) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ onProcessQuery, onScheduleFromNLP }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // Initial greeting message from AI
    setMessages([
      { 
        id: generateUniqueId(), 
        sender: 'ai', 
        text: "Hello! How can I help you schedule a meeting today? Try something like: 'Schedule a 30-min meeting with John (john@example.com) and Priya (priya@example.com) next Tuesday afternoon.'",
        timestamp: new Date() 
      }
    ]);
  }, []);


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AiChatMessage = {
      id: generateUniqueId(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    const loadingAiMessageId = generateUniqueId();
    const loadingAiMessage: AiChatMessage = {
        id: loadingAiMessageId,
        sender: 'ai',
        text: 'Thinking...',
        timestamp: new Date(),
        isLoading: true,
    };
    setMessages(prev => [...prev, loadingAiMessage]);

    try {
      const parsedRequest = await onProcessQuery(userMessage.text);
      let aiResponseText = '';
      
      if (parsedRequest.error) {
        aiResponseText = `I encountered an issue: ${parsedRequest.error}. Could you please rephrase or provide more details?`;
      } else {
        const { title, participants, durationMinutes, dateTimeInfo } = parsedRequest;
        aiResponseText = `Okay, I can help with that. I understood:\n`;
        if (title) aiResponseText += `- Title: ${title}\n`;
        if (participants && participants.length > 0) aiResponseText += `- Participants: ${participants.join(', ')}\n`;
        if (durationMinutes) aiResponseText += `- Duration: ${durationMinutes} minutes\n`;
        if (dateTimeInfo) aiResponseText += `- When: ${dateTimeInfo}\n`;
        aiResponseText += `\nWould you like me to open the scheduler with these details?`;
      }

      const aiResponseMessage: AiChatMessage = {
        id: generateUniqueId(), // New ID for the actual response
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => m.id !== loadingAiMessageId).concat(aiResponseMessage)); // Replace loading with actual

      // Offer to open scheduler if parsing was successful
      if (!parsedRequest.error) {
        const systemMessage: AiChatMessage = {
          id: generateUniqueId(),
          sender: 'system', // Special type for actionable button
          text: 'Open Scheduler', // This text will be the button label
          timestamp: new Date(),
        };
        // Add a small delay for readability
        setTimeout(() => setMessages(prev => [...prev, systemMessage]), 500);
      }

    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorResponseMessage: AiChatMessage = {
        id: generateUniqueId(),
        sender: 'ai',
        text: "Sorry, I couldn't process your request right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(m => m.id !== loadingAiMessageId).concat(errorResponseMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemAction = async (messageText: string) => {
     if (messageText === 'Open Scheduler') {
        const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
        if (lastUserMessage) {
            const parsedRequest = await onProcessQuery(lastUserMessage.text); // Re-process to get fresh data
            if (!parsedRequest.error) {
                onScheduleFromNLP(parsedRequest);
            } else {
                 setMessages(prev => [...prev, {id: generateUniqueId(), sender: 'ai', text: "Sorry, I couldn't retrieve the details to pre-fill the scheduler. Please try again.", timestamp: new Date()}]);
            }
        }
     }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white shadow-xl rounded-lg">
      <header className="p-4 border-b border-gray-200 flex items-center">
        <SparklesIcon className="h-6 w-6 text-[#004040] mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">AI Scheduling Assistant</h2>
      </header>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl px-4 py-3 rounded-xl shadow ${
                msg.sender === 'user'
                  ? 'bg-[#004040] text-white rounded-br-none'
                  : msg.sender === 'ai'
                  ? `bg-gray-200 text-gray-800 rounded-bl-none ${msg.isLoading ? 'italic animate-pulse' : ''}`
                  : 'bg-transparent p-0' // System messages are buttons
              }`}
            >
              {msg.sender === 'system' ? (
                <Button onClick={() => handleSystemAction(msg.text)} variant="secondary" size="sm" icon={CalendarDaysIcon}>
                  {msg.text}
                </Button>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              {msg.sender !== 'system' && <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-yellow-100 text-right' : 'text-gray-600'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type your meeting request..."
            disabled={isLoading}
            className="flex-grow"
            hideLabel
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} isLoading={isLoading} loadingText="" icon={PaperAirplaneIcon} variant="primary" className="px-3 py-3">
             <span className="sr-only">Send</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};