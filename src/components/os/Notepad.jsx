import React, { useState, useEffect } from 'react';
import { Save, Download, FileText } from 'lucide-react';

export const Notepad = ({ theme }) => {
    const [text, setText] = useState('');

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
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'notes.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-gray-200 font-mono">
            {/* Toolbar */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border-b border-white/10">
                <button 
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded hover:bg-white/10 transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save as .txt</span>
                </button>
                <div className="flex-1" />
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{text.length} chars</span>
                </div>
            </div>

            {/* Editor */}
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="Type your notes here..."
                className="flex-1 w-full bg-transparent p-4 resize-none outline-none text-sm leading-relaxed"
                spellCheck="false"
            />
        </div>
    );
};
