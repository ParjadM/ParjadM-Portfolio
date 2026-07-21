import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CHATBOT_OPEN_EVENT,
  PAGE_CONTEXT_EVENT,
  buildChatPayloadContext,
  getChatGreeting,
  getCurrentLocale,
} from '../utils/chatbotEvents.js';
import { sendChatStream, consumeAiChatStream } from '../utils/aiStream.js';
import { useTranslation } from 'react-i18next';
import { useSwipeDown } from '../utils/useSwipeDown.js';
import { useFocusTrap } from '../utils/useFocusTrap.js';


// ... (icons remain the same) ...

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

const MicIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const SpeakerIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SpeakerOffIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const Chatbot = ({ theme = 'green', autoOpenDetail = null }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(!!autoOpenDetail);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionPageContext, setSessionPageContext] = useState(null);
  const messagesContainerRef = useRef(null);
  const location = useLocation();
  const pendingSendRef = useRef(null);
  const handleSendRef = useRef(null);

  const refreshGreeting = useCallback((pathname, pageContext) => {
    const greeting = getChatGreeting(pathname, pageContext);
    setMessages([{ role: 'model', parts: [{ text: greeting }] }]);
  }, []);

  useEffect(() => {
    const onPageContext = (event) => {
      setSessionPageContext(event.detail || null);
    };
    window.addEventListener(PAGE_CONTEXT_EVENT, onPageContext);
    return () => window.removeEventListener(PAGE_CONTEXT_EVENT, onPageContext);
  }, []);

  const applyOpenDetail = useCallback((detail) => {
    const { message, pageContext, autoSend } = detail || {};
    if (pageContext) setSessionPageContext(pageContext);
    setIsOpen(true);
    if (message) {
      setInput(message);
      if (autoSend) pendingSendRef.current = message;
    } else {
      refreshGreeting(location.pathname, pageContext);
    }
  }, [location.pathname, refreshGreeting]);

  useEffect(() => {
    if (autoOpenDetail) applyOpenDetail(autoOpenDetail);
  }, [autoOpenDetail, applyOpenDetail]);

  useEffect(() => {
    const onOpen = (event) => applyOpenDetail(event.detail);
    window.addEventListener(CHATBOT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, onOpen);
  }, [applyOpenDetail]);

  useEffect(() => {
    const pageContext = buildChatPayloadContext(location, sessionPageContext);
    setMessages((prev) => {
      if (prev.length > 1) return prev;
      return [{ role: 'model', parts: [{ text: getChatGreeting(location.pathname, pageContext) }] }];
    });
  }, [location.pathname, sessionPageContext, i18n.language]);

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
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || window.matchMedia('(min-width: 640px)').matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const speechSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Robust Native Voice State
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  // Initialize native speech recognition on demand
  const startNativeListening = () => {
    setVoiceError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError(t('chatbot.voiceUnsupported'));
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          }
        }
        
        if (finalStr) {
          setInput(prev => prev + (prev ? ' ' : '') + finalStr);
        }
      };

      recognition.onerror = (event) => {
        console.error("Native Speech Error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone blocked');
          alert("Microphone access was denied. Please click the lock icon in your URL bar and allow microphone permissions.");
        } else if (event.error !== 'no-speech') {
          setVoiceError('Error: ' + event.error);
        }
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (err) {
      console.error("Speech start error:", err);
      setVoiceError('Failed to start');
      setListening(false);
    }
  };

  const toggleListening = (e) => {
    e.preventDefault();
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      startNativeListening();
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices.find(v => v.lang.includes('en'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        window.speechSynthesis?.cancel(); // Stop talking immediately if turned off
      }
      return newState;
    });
  };

  const handleSend = async (e, overrideText) => {
    e?.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }

    const userMessage = { role: 'user', parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMessage].slice(-6);
      const pageContext = buildChatPayloadContext(location, sessionPageContext);

      const response = await sendChatStream({
        messages: payloadMessages,
        pageContext,
        locale: getCurrentLocale(),
      });

      const placeholder = { role: 'model', parts: [{ text: '' }] };
      setMessages((prev) => [...prev, placeholder]);

      let gotToken = false;
      const { fullText } = await consumeAiChatStream(response, {
        onToken: (token) => {
          if (!gotToken) {
            gotToken = true;
            setLoading(false);
          }
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'model') {
              next[next.length - 1] = {
                ...last,
                parts: [{ text: (last.parts[0]?.text || '') + token }],
              };
            }
            return next;
          });
        },
      });

      if (!gotToken) setLoading(false);
      if (fullText) speakText(fullText);
    } catch (error) {
      const errorMsg = error.message?.includes('limit')
        ? error.message
        : 'Sorry, something went wrong with the network.';
      setMessages((prev) => {
        const withoutEmpty = prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'model' && !m.parts[0]?.text));
        return [...withoutEmpty, { role: 'model', parts: [{ text: errorMsg }] }];
      });
      speakText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  handleSendRef.current = handleSend;

  const chatSwipeHandlers = useSwipeDown(() => setIsOpen(false));
  const chatTrapRef = useFocusTrap(isOpen, () => setIsOpen(false));

  const gradientClass = theme !== 'pink' 
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
    : 'bg-gradient-to-r from-pink-500 to-red-500';

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatTrapRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('chatbot.title')}
          className="absolute inset-0 sm:inset-auto sm:bottom-0 sm:right-0 sm:mb-0 w-full h-full sm:w-96 sm:h-[32rem] bg-gray-900/95 backdrop-blur-xl sm:border border-white/10 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right pointer-events-auto">
          {/* Header (swipe down to close on touch) */}
          <div className={`p-4 pt-safe-or-4 flex items-center justify-between ${gradientClass}`} {...chatSwipeHandlers}>
            <div className="flex items-center gap-2 text-white">
              <BotIcon className="w-5 h-5" />
              <span className="font-semibold">{t('chatbot.title')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleVoice} 
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={voiceEnabled ? "Voice Output On" : "Voice Output Off"}
              >
                {voiceEnabled ? <SpeakerIcon className="w-4 h-4" /> : <SpeakerOffIcon className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 text-white hover:text-white/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-white' : gradientClass + ' text-white'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex flex-row gap-2 max-w-[80%]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${gradientClass} text-white`}>
                    <BotIcon className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex gap-1">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 pb-safe-or-3 border-t border-white/10 bg-black/20">
            {!speechSupported && (
              <p className="text-[11px] text-gray-500 mb-2 px-1">{t('chatbot.voiceUnavailable')}</p>
            )}
            {voiceError && (
              <p className="text-[11px] text-amber-300/90 mb-2 px-1">{voiceError}</p>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2 mobile-input">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all ${listening ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                  aria-label={listening ? 'Stop listening' : 'Start voice input'}
                  title={listening ? 'Stop listening' : 'Voice input'}
                >
                  <MicIcon className="w-4 h-4" />
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${gradientClass} text-white disabled:opacity-50 transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`absolute bottom-safe-fab right-4 sm:bottom-0 sm:right-0 p-4 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 shadow-emerald-500/20 pointer-events-auto ${gradientClass}`}
          aria-label={t('chatbot.openLabel')}
        >
          <BotIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
