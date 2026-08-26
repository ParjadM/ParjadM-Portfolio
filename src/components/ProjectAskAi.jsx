import React from 'react';
import { openChatbot, buildProjectPageContext } from '../utils/chatbotEvents.js';
import { getAccent } from '../utils/themeTokens.js';

export function ProjectAskAi({ project, theme = 'green' }) {
  const accentTokens = getAccent(theme);
  const accent = `${accentTokens.text300} ${accentTokens.btnIdle}`;

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
