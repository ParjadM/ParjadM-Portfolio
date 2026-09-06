import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugifyHeading } from '../../utils/extractHeadings.js';

function makeHeadingRenderer(level, slugCounts) {
  const Tag = `h${level}`;
  const baseClass = level === 2
    ? 'text-2xl font-semibold text-white mt-7 mb-3 scroll-mt-28'
    : 'text-xl font-semibold text-white mt-6 mb-3 scroll-mt-28';
  const Heading = ({ children, ...props }) => {
    const text = String(children ?? '').replace(/\[.*?\]\(.*?\)/g, '$1');
    let id = slugifyHeading(text);
    const n = (slugCounts.get(id) || 0) + 1;
    slugCounts.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    return <Tag id={id} className={baseClass} {...props}>{children}</Tag>;
  };
  Heading.displayName = `MarkdownH${level}`;
  return Heading;
}

export const MarkdownContent = ({ content, className = '', withHeadingIds = false }) => {
  const slugCounts = new Map();

  const components = {
    h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
    h2: withHeadingIds
      ? makeHeadingRenderer(2, slugCounts)
      : ({ ...props }) => <h2 className="text-2xl font-semibold text-white mt-7 mb-3" {...props} />,
    h3: withHeadingIds
      ? makeHeadingRenderer(3, slugCounts)
      : ({ ...props }) => <h3 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
    p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
    ul: ({ ...props }) => <ul className="mb-4 list-disc pl-6 space-y-2" {...props} />,
    ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-6 space-y-2" {...props} />,
    a: ({ ...props }) => <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />,
    pre: ({ children, ...props }) => (
      <pre className="markdown-pre mb-4 rounded-lg border border-white/10 bg-black/50" {...props}>{children}</pre>
    ),
    code: ({ children, className, ...props }) =>
      <code className={`markdown-code ${className || ''}`} {...props}>{children}</code>,
    table: ({ children }) => <div className="markdown-table"><table>{children}</table></div>,
    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-400 mb-4" {...props} />
  };

  return (
    <div className={`reading-content text-gray-300 leading-7 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};
