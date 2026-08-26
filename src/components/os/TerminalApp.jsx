import React, { useRef } from 'react';
import { useTerminalEngine } from '../../os/useTerminalEngine.js';
import { getAccent } from '../../utils/themeTokens.js';

export const TerminalApp = ({ theme, osState }) => {
    const { fileSystem, setFileSystem, openApp } = osState || {};
    const inputRef = useRef(null);
    const {
        history, input, setInput, handleCommand, handleKeyDown, formatPrompt, bottomRef,
    } = useTerminalEngine({
        mode: 'os',
        fileSystem,
        setFileSystem,
        openApp,
        promptHost: 'parjadm-os',
    });

    const accent = getAccent(theme).text;

    return (
        <div
            className="flex flex-col h-full w-full bg-black/90 font-mono text-gray-300 p-2 text-sm overflow-hidden"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 px-2 pb-4">
                <div className="space-y-1">
                    {history.map((entry, idx) => (
                        <div key={idx} className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'user' ? `${accent} font-bold` : 'text-gray-300'}`}>
                            <span className="whitespace-pre-wrap">{entry.text}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                <form onSubmit={handleCommand} className="mt-2 flex items-center flex-wrap">
                    <span className={`mr-2 font-bold ${accent} whitespace-nowrap`}>{formatPrompt()}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-emerald-500 min-w-[200px]"
                        autoFocus
                        spellCheck="false"
                        autoComplete="off"
                    />
                </form>
            </div>
        </div>
    );
};
