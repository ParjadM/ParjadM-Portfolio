import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO.jsx';
import { getCurrentLocale } from '../utils/chatbotEvents.js';

const BotIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const UserIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MockInterviewPage = ({ theme }) => {
  const { t } = useTranslation();
  const [roleSelected, setRoleSelected] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debrief, setDebrief] = useState(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefError, setDebriefError] = useState('');
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollInputIntoView = () => {
    requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => scrollInputIntoView();
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const gradientClass = theme !== 'pink' 
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
    : 'bg-gradient-to-r from-pink-500 to-red-500';

  useEffect(() => {
    if (roleSelected && messages.length === 0) {
      setMessages([{ role: 'model', parts: [{ text: t('interview.greeting') }] }]);
    }
  }, [roleSelected, messages.length, t]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMessage].slice(-6);

      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: payloadMessages,
          isRecruiter,
          locale: getCurrentLocale(),
        })
      });
      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
      } else {
        const errorMsg = `Connection Error: ${data.error || "Please try again later."}`;
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: errorMsg }] }]);
      }
    } catch (error) {
      const errorMsg = t('interview.networkError');
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: errorMsg }] }]);
    } finally {
      setLoading(false);
    }
  };

  const userTurns = messages.filter((m) => m.role === 'user').length;

  const handleDebrief = async () => {
    if (debriefLoading || userTurns < 3) return;
    setDebriefLoading(true);
    setDebriefError('');
    try {
      const res = await fetch('/api/ai/interview/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, locale: getCurrentLocale() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Debrief failed');
      setDebrief(data);
    } catch (err) {
      setDebriefError(err.message || 'Could not generate debrief');
    } finally {
      setDebriefLoading(false);
    }
  };

  if (!roleSelected) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <SEO title="Mock Interview — Parjad Minooei" description="Chat with an AI trained on Parjad's resume and experience." />
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
            <BotIcon className={`w-8 h-8 ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">AI Mock Interview</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Welcome! I am an AI trained specifically on Parjad&apos;s resume and experiences. 
            Before we begin the interview, are you a recruiter or hiring manager?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setIsRecruiter(true); setRoleSelected(true); }}
              className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${gradientClass}`}
            >
              Yes, I am
            </button>
            <button
              onClick={() => { setIsRecruiter(false); setRoleSelected(true); }}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/5 transition-transform hover:scale-105 active:scale-95"
            >
              No, just testing
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
            {isRecruiter ? 'Recruiters get 25 prompts' : 'Standard limit is 15 prompts'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col pt-20 lg:pt-24 px-4 pb-4 md:px-8 max-w-5xl mx-auto w-full">
      <SEO title="Mock Interview — Parjad Minooei" description="Chat with an AI trained on Parjad's resume and experience." />
      <div className="flex-1 bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b border-white/10 bg-black/20`}>
          <div className="flex items-center gap-3 text-white">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gradientClass}`}>
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold tracking-wide">AI Parjad</h2>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Interview Mode Active
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDebrief}
            disabled={debriefLoading || userTurns < 3}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-gray-200 hover:bg-white/10 disabled:opacity-40 transition-colors"
            title={userTurns < 3 ? 'Ask at least 3 questions first' : 'Generate interview debrief'}
          >
            {debriefLoading ? 'Generating...' : 'End & Debrief'}
          </button>
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-white/10 text-white' : gradientClass + ' text-white'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm border border-white/5' : 'bg-black/40 text-gray-200 border border-white/10 rounded-tl-sm'}`}>
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-row gap-3 max-w-[80%]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${gradientClass} text-white`}>
                  <BotIcon className="w-5 h-5" />
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 rounded-tl-sm flex gap-2 items-center">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {debriefError && (
          <div className="px-6 pb-2 text-red-300 text-sm">{debriefError}</div>
        )}

        {debrief && (
          <div className="mx-6 mb-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-sm text-gray-300 space-y-3 max-h-48 overflow-y-auto">
            <p className="text-white font-semibold">Interview Debrief</p>
            {debrief.overallSummary && <p>{debrief.overallSummary}</p>}
            {debrief.strengths?.length > 0 && (
              <div>
                <span className="text-emerald-300 font-medium">Strengths: </span>
                {debrief.strengths.join(' · ')}
              </div>
            )}
            {debrief.areasToImprove?.length > 0 && (
              <div>
                <span className="text-amber-300 font-medium">Improve: </span>
                {debrief.areasToImprove.join(' · ')}
              </div>
            )}
            {debrief.followUpQuestions?.length > 0 && (
              <div>
                <span className="text-white font-medium">Follow-ups: </span>
                {debrief.followUpQuestions.join(' · ')}
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 md:p-6 pb-safe-or-3 border-t border-white/10 bg-black/30">
          <form onSubmit={handleSend} className="relative flex items-center mobile-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={scrollInputIntoView}
              placeholder={t('interview.placeholder')}
              autoComplete="off"
              enterKeyHint="send"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`absolute right-2 p-2.5 rounded-full ${gradientClass} text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
