import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CHATBOT_OPEN_EVENT } from '../utils/chatbotEvents.js';

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

export function ChatbotLauncher({ theme = 'green' }) {
  const [Chatbot, setChatbot] = useState(null);
  const [autoOpenDetail, setAutoOpenDetail] = useState(null);
  const loadingRef = useRef(false);

  const gradientClass = theme !== 'pink'
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
    : 'bg-gradient-to-r from-pink-500 to-red-500';

  const loadChatbot = useCallback(async (openDetail = null) => {
    if (Chatbot || loadingRef.current) {
      if (openDetail) setAutoOpenDetail(openDetail);
      return;
    }
    loadingRef.current = true;
    try {
      const mod = await import('./Chatbot.jsx');
      setAutoOpenDetail(openDetail);
      setChatbot(() => mod.default);
    } finally {
      loadingRef.current = false;
    }
  }, [Chatbot]);

  useEffect(() => {
    const onOpen = (event) => loadChatbot(event.detail || {});
    window.addEventListener(CHATBOT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, onOpen);
  }, [loadChatbot]);

  if (Chatbot) {
    return <Chatbot theme={theme} autoOpenDetail={autoOpenDetail} />;
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] pointer-events-none">
      <button
        type="button"
        onClick={() => {
          try { sessionStorage.setItem('garden_used_ai', '1'); } catch {}
          loadChatbot({});
        }}
        className={`absolute bottom-safe-fab right-4 sm:bottom-0 sm:right-0 p-4 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 shadow-emerald-500/20 pointer-events-auto ${gradientClass}`}
        aria-label="Open chat"
      >
        <BotIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
