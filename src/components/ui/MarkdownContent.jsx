import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownContent = ({ content, className = '' }) => (
  <div className={`text-gray-300 leading-7 ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
        h2: ({ ...props }) => <h2 className="text-2xl font-semibold text-white mt-7 mb-3" {...props} />,
        h3: ({ ...props }) => <h3 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
        p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
        ul: ({ ...props }) => <ul className="mb-4 list-disc pl-6 space-y-2" {...props} />,
        ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-6 space-y-2" {...props} />,
        a: ({ ...props }) => <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />,
        code: ({ inline, ...props }) => 
          inline ? 
          <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300" {...props} /> :
          <code className="block bg-black/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-300 mb-4 border border-white/10" {...props} />,
        blockquote: ({ ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-400 mb-4" {...props} />
      }}
    >
      {content || ''}
    </ReactMarkdown>
  </div>
);
