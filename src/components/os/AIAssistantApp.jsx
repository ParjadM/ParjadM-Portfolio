import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { getAccent } from '../../utils/themeTokens.js';

export const AIAssistantApp = ({ theme }) => {
    const accentTokens = getAccent(theme);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi there! I'm Parjad's AI assistant. How can I help you today?" }] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        
        const newMessages = [
            ...messages,
            { role: 'user', parts: [{ text: userText }] }
        ];
        
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: newMessages.map(m => ({
                        role: m.role,
                        parts: m.parts
                    })),
                    pageContext: { type: 'page', pathname: '/os' },
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                setMessages(prev => [
                    ...prev,
                    { role: 'model', parts: [{ text: data.reply }] }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'model', parts: [{ text: `Error: ${data.error || 'Failed to connect'}` }] }
                ]);
            }
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: 'Sorry, I am currently offline or unable to reach the server.' }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getThemeColor = () => `${accentTokens.text} ${accentTokens.bgSoft}`;
    const getThemeIconColor = () => accentTokens.text;

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-gray-200">
            {/* Header */}
            <div className={`p-4 border-b border-white/5 flex items-center space-x-3 bg-gray-950`}>
                <div className={`p-2 rounded-lg ${getThemeColor()}`}>
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-white tracking-wide">Desktop Assistant</h2>
                    <p className="text-xs text-gray-400">Powered by Gemini</p>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={idx} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-700' : 'bg-gray-800 border border-white/10'}`}>
                                {isUser ? <User className="w-4 h-4 text-gray-300" /> : <Bot className={`w-4 h-4 ${getThemeIconColor()}`} />}
                            </div>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isUser ? 'bg-white/10 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.parts[0].text}</p>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
                            <Bot className={`w-4 h-4 ${getThemeIconColor()}`} />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-800 text-gray-200 rounded-tl-none border border-white/5 flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-400">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-950 border-t border-white/5">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none overflow-hidden"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={`absolute right-2 p-2 rounded-lg transition-colors ${!input.trim() || isLoading ? 'text-gray-600' : 'text-white hover:bg-white/10'}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
