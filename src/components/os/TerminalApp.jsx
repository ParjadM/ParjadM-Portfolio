import React, { useState, useRef, useEffect } from 'react';
import { apiCache } from '../../utils/useFetchWithCache.js';

export const TerminalApp = ({ theme, osState }) => {
    const { fileSystem, setFileSystem } = osState || {};
    const [history, setHistory] = useState([
        { type: 'system', text: 'ParjadOS Terminal v2.0', animated: false },
        { type: 'system', text: 'Type "help" for a list of available commands.', animated: false }
    ]);
    const [input, setInput] = useState('');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Path represents the array of folder names from root
    // "~" represents ['C:', 'Users', 'Guest']
    const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);
    
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const pushToHistory = (type, text) => {
        setHistory(prev => [...prev, { type, text }]);
    };

    // Helper: Get node by path array
    const getNodeByPath = (pathArr, fs = fileSystem) => {
        let current = fs;
        for (let i = 1; i < pathArr.length; i++) { // Skip 'C:'
            if (!current.children) return null;
            const next = current.children.find(c => c.name === pathArr[i]);
            if (!next) return null;
            current = next;
        }
        return current;
    };

    // Helper: Convert string path to path array
    const resolvePath = (pathStr) => {
        if (!pathStr || pathStr === '.') return currentPath;
        if (pathStr === '~') return ['C:', 'Users', 'Guest'];
        if (pathStr === '/') return ['C:'];
        
        let target = [...currentPath];
        if (pathStr.startsWith('~/')) {
            target = ['C:', 'Users', 'Guest'];
            pathStr = pathStr.substring(2);
        } else if (pathStr.startsWith('/')) {
            target = ['C:'];
            pathStr = pathStr.substring(1);
        } else if (pathStr.startsWith('C:/')) {
            target = ['C:'];
            pathStr = pathStr.substring(3);
        }

        const parts = pathStr.split('/').filter(Boolean);
        for (const part of parts) {
            if (part === '..') {
                if (target.length > 1) target.pop();
            } else if (part !== '.') {
                target.push(part);
            }
        }
        return target;
    };

    const formatPathStr = (pathArr) => {
        const str = pathArr.join('/');
        if (str.startsWith('C:/Users/Guest')) {
            return str.replace('C:/Users/Guest', '~');
        }
        return str;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const newIdx = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIdx);
                setInput(cmdHistory[cmdHistory.length - 1 - newIdx] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIdx = historyIndex - 1;
                setHistoryIndex(newIdx);
                setInput(cmdHistory[cmdHistory.length - 1 - newIdx] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    const handleCommand = async (e) => {
        e.preventDefault();
        const rawCmd = input.trim();
        if (!rawCmd) return;

        const cmdParts = rawCmd.split(' ').filter(Boolean);
        const cmd = cmdParts[0].toLowerCase();
        const args = cmdParts.slice(1);

        const promptStr = `guest@parjadm-os:${formatPathStr(currentPath)}$`;
        pushToHistory('user', `${promptStr} ${rawCmd}`);
        setCmdHistory(prev => [...prev, rawCmd]);
        setHistoryIndex(-1);
        setInput('');

        switch(cmd) {
            case 'help':
                pushToHistory('system', 'Available commands:\n  ls         - List directory contents\n  cd         - Change directory\n  pwd        - Print working directory\n  cat        - Read a text file\n  mkdir      - Create a new directory\n  touch      - Create a new empty file\n  rm         - Remove a file or directory\n  clear      - Clear terminal');
                break;
            case 'clear':
                setHistory([{ type: 'system', text: 'Terminal cleared.', animated: false }]);
                break;
            case 'pwd':
                pushToHistory('system', formatPathStr(currentPath));
                break;
            case 'ls': {
                const dirPath = args[0] ? resolvePath(args[0]) : currentPath;
                const node = getNodeByPath(dirPath);
                if (node && node.children) {
                    const files = node.children.map(c => c.type === 'folder' ? `${c.name}/` : c.name).join('   ');
                    pushToHistory('system', files || '(empty)');
                } else if (node) {
                    pushToHistory('system', node.name);
                } else {
                    pushToHistory('error', `ls: cannot access '${args[0]}': No such file or directory`);
                }
                break;
            }
            case 'cd': {
                if (!args[0]) {
                    setCurrentPath(['C:', 'Users', 'Guest']);
                    break;
                }
                const targetPath = resolvePath(args[0]);
                const node = getNodeByPath(targetPath);
                if (node && (node.type === 'folder' || node.type === 'drive')) {
                    setCurrentPath(targetPath);
                } else if (node) {
                    pushToHistory('error', `cd: ${args[0]}: Not a directory`);
                } else {
                    pushToHistory('error', `cd: ${args[0]}: No such file or directory`);
                }
                break;
            }
            case 'cat': {
                if (!args[0]) {
                    pushToHistory('error', 'cat: missing file operand');
                    break;
                }
                const targetPath = resolvePath(args[0]);
                const node = getNodeByPath(targetPath);
                if (!node) {
                    pushToHistory('error', `cat: ${args[0]}: No such file or directory`);
                } else if (node.type === 'folder' || node.type === 'drive') {
                    pushToHistory('error', `cat: ${args[0]}: Is a directory`);
                } else if (node.type === 'image') {
                    pushToHistory('error', `cat: ${args[0]}: Cannot read binary image file`);
                } else {
                    pushToHistory('system', node.content || '');
                }
                break;
            }
            case 'mkdir': {
                if (!args[0]) {
                    pushToHistory('error', 'mkdir: missing operand');
                    break;
                }
                const newPath = resolvePath(args[0]);
                const parentPath = newPath.slice(0, -1);
                const newName = newPath[newPath.length - 1];
                const parentNode = getNodeByPath(parentPath);
                
                if (!parentNode || !parentNode.children) {
                    pushToHistory('error', `mkdir: cannot create directory '${args[0]}': No such file or directory`);
                    break;
                }
                if (parentNode.children.find(c => c.name === newName)) {
                    pushToHistory('error', `mkdir: cannot create directory '${args[0]}': File exists`);
                    break;
                }

                setFileSystem(prev => {
                    const newFs = JSON.parse(JSON.stringify(prev));
                    const parent = getNodeByPath(parentPath, newFs);
                    if (parent && parent.children) {
                        parent.children.push({ name: newName, type: 'folder', children: [] });
                    }
                    return newFs;
                });
                break;
            }
            case 'touch': {
                if (!args[0]) {
                    pushToHistory('error', 'touch: missing file operand');
                    break;
                }
                const newPath = resolvePath(args[0]);
                const parentPath = newPath.slice(0, -1);
                const newName = newPath[newPath.length - 1];
                const parentNode = getNodeByPath(parentPath);
                
                if (!parentNode || !parentNode.children) {
                    pushToHistory('error', `touch: cannot touch '${args[0]}': No such file or directory`);
                    break;
                }
                if (!parentNode.children.find(c => c.name === newName)) {
                    setFileSystem(prev => {
                        const newFs = JSON.parse(JSON.stringify(prev));
                        const parent = getNodeByPath(parentPath, newFs);
                        if (parent && parent.children) {
                            parent.children.push({ name: newName, type: 'file', content: '' });
                        }
                        return newFs;
                    });
                }
                break;
            }
            case 'rm': {
                if (!args[0]) {
                    pushToHistory('error', 'rm: missing operand');
                    break;
                }
                const targetPath = resolvePath(args[0]);
                const parentPath = targetPath.slice(0, -1);
                const targetName = targetPath[targetPath.length - 1];
                const parentNode = getNodeByPath(parentPath);
                
                if (!parentNode || !parentNode.children || !parentNode.children.find(c => c.name === targetName)) {
                    pushToHistory('error', `rm: cannot remove '${args[0]}': No such file or directory`);
                    break;
                }
                
                setFileSystem(prev => {
                    const newFs = JSON.parse(JSON.stringify(prev));
                    const parent = getNodeByPath(parentPath, newFs);
                    if (parent && parent.children) {
                        parent.children = parent.children.filter(c => c.name !== targetName);
                    }
                    return newFs;
                });
                break;
            }
            default:
                pushToHistory('error', `bash: ${cmd}: command not found`);
        }
    };

    return (
        <div 
            className="flex flex-col h-full w-full bg-black/90 font-mono text-gray-300 p-2 text-sm overflow-hidden" 
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 px-2 pb-4">
                <div className="space-y-1">
                    {history.map((entry, idx) => (
                        <div key={idx} className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'user' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                            <span className="whitespace-pre-wrap">{entry.text}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                
                <form onSubmit={handleCommand} className="mt-2 flex items-center flex-wrap">
                    <span className="mr-2 font-bold text-emerald-400 whitespace-nowrap">
                        guest@parjadm-os:{formatPathStr(currentPath)}$
                    </span>
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
