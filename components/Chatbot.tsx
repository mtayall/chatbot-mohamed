
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Message } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon } from './icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { role: 'model', text: 'مرحباً! أنا محمد، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the chat session when the component mounts
    chatSession.current = createChatSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !chatSession.current) return;
    
    const userMessage: Message = { role: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
        const responseText = await sendMessageToGemini(chatSession.current, userMessage.text);
        const modelMessage: Message = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError('فشل في الحصول على استجابة. الرجاء معاودة المحاولة في وقت لاحق.');
        console.error(errorMessage);
        // Optionally add an error message to chat
        setMessages(prev => [...prev, {role: 'model', text: 'عذراً، واجهتني مشكلة. هل يمكنك إعادة صياغة سؤالك؟'}]);
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center me-3">
          <BotIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">محمد</h2>
          <div className="flex items-center text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full me-2"></span>
            متصل الآن
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
               {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-white" />}
            </div>
            <div className={`p-3 rounded-lg max-w-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-es-none' : 'bg-gray-700 text-gray-200 rounded-ss-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-600">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
              <div className="p-3 rounded-lg bg-gray-700 text-gray-200 rounded-ss-none">
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            className="w-full bg-gray-700 text-white rounded-full py-2 ps-4 pe-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="absolute end-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
