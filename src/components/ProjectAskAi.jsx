import React from 'react';
import { openChatbot, buildProjectPageContext } from '../utils/chatbotEvents.js';

export function ProjectAskAi({ project, theme = 'green' }) {
  const accent = theme === 'pink'
    ? 'text-pink-300 hover:text-pink-200 border-pink-500/30 hover:bg-pink-500/10'
    : 'text-emerald-300 hover:text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/10';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openChatbot({
      message: `Tell me about the ${project.title} project — what it does and what tech it uses.`,
      pageContext: buildProjectPageContext(project),
      autoSend: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${accent}`}
      aria-label={`Ask AI about ${project.title}`}
    >
      Ask AI
    </button>
  );
}
