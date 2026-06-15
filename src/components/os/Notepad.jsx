import React, { useState, useEffect } from 'react';
import { Download, FileText, LayoutTemplate } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Notepad = ({ theme }) => {
    const [text, setText] = useState('# Web OS Notes\n\nWelcome to the Markdown editor!\n\n- Write **Markdown** on the left.\n- See the *preview* on the right.\n- Support for [links](https://github.com) and `code`.');
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('os_notepad_content');
        if (saved) setText(saved);
    }, []);

    const handleChange = (e) => {
        setText(e.target.value);
        localStorage.setItem('os_notepad_content', e.target.value);
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([text], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'notes.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-gray-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-white/10">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${showPreview ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-gray-300'}`}
                    >
                        <LayoutTemplate className="w-4 h-4" />
                        <span className="hidden sm:inline">Toggle Preview</span>
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded hover:bg-white/10 text-gray-300 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Save .md</span>
                    </button>
                </div>
                <div className="text-xs text-gray-500 flex items-center space-x-1 font-mono">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{text.length} chars</span>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                <textarea
                    value={text}
                    onChange={handleChange}
                    placeholder="Type your markdown here..."
                    className={`h-full bg-transparent p-6 resize-none outline-none text-sm font-mono leading-relaxed text-gray-300 transition-all ${showPreview ? 'w-1/2 border-r border-white/10' : 'w-full'}`}
                    spellCheck="false"
                />
                
                {showPreview && (
                    <div className="w-1/2 h-full bg-gray-950/50 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {text || '*Nothing to preview...*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};
