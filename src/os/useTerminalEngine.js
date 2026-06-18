import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUEST_PATH } from './filesystem.js';
import { getTerminalPath, setTerminalPath } from './session.js';
import { executeCommand } from './commands.js';

export function useTerminalEngine({
  mode = 'os',
  fileSystem,
  setFileSystem,
  openApp,
  initialHistory,
  promptHost = 'parjadm-os',
}) {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [history, setHistory] = useState(initialHistory || [
    { type: 'system', text: 'ParjadOS Terminal v2.0 — type "help" for commands.', animated: false },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState(() => getTerminalPath() || [...GUEST_PATH]);
  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [emailState, setEmailState] = useState({ step: 0, name: '', email: '', message: '' });
  const [aiState, setAiState] = useState({ active: false, messages: [] });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    setTerminalPath(currentPath);
  }, [currentPath]);

  const pushToHistory = useCallback((type, text, animated = false) => {
    if (text === '__CLEAR__') {
      setHistory([{ type: 'system', text: 'Terminal cleared.', animated: false }]);
      return;
    }
    setHistory(prev => [...prev, { type, text, animated }]);
  }, []);

  const formatPrompt = () => {
    const pathStr = currentPath.join('/').replace('C:/Users/Guest', '~');
    if (emailState.step > 0) return '>';
    if (aiState.active) return 'ai>';
    return `guest@${promptHost}:${pathStr}$`;
  };

  const handleEmailWizard = async (val) => {
    pushToHistory('user', `${formatPrompt()} ${val}`);
    if (emailState.step === 1) {
      setEmailState({ ...emailState, step: 2, name: val });
      pushToHistory('system', 'Enter your email:');
    } else if (emailState.step === 2) {
      setEmailState({ ...emailState, step: 3, email: val });
      pushToHistory('system', 'Enter your message:');
    } else if (emailState.step === 3) {
      pushToHistory('system', 'Sending...');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: emailState.name,
            email: emailState.email,
            subject: 'ParjadOS Contact',
            message: val,
          }),
        });
        pushToHistory(res.ok ? 'system' : 'error', res.ok ? 'Message sent.' : 'Failed to send.');
      } catch {
        pushToHistory('error', 'Network error.');
      }
      setEmailState({ step: 0, name: '', email: '', message: '' });
    }
    setInput('');
  };

  const handleAiWizard = async (val) => {
    pushToHistory('user', `ai> ${val}`);
    if (val.toLowerCase() === 'exit' || val.toLowerCase() === 'quit') {
      setAiState({ active: false, messages: [] });
      pushToHistory('system', 'Exited AI mode.');
      setInput('');
      return;
    }
    pushToHistory('system', '> Thinking...');
    try {
      const userMsg = { role: 'user', parts: [{ text: val }] };
      const payload = [...aiState.messages, userMsg].slice(-6);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payload,
          pageContext: { type: 'page', pathname: mode === 'cli' ? '/cli' : '/os' },
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        pushToHistory('system', `[AI]: ${data.reply}`, true);
        setAiState(prev => ({
          active: true,
          messages: [...prev.messages, userMsg, { role: 'model', parts: [{ text: data.reply }] }],
        }));
      } else {
        pushToHistory('error', data.error || 'AI unavailable.');
      }
    } catch {
      pushToHistory('error', 'Network error.');
    }
    setInput('');
  };

  const handleCommand = async (e) => {
    e?.preventDefault?.();
    const rawCmd = input.trim();
    if (!rawCmd) return;

    if (emailState.step > 0) return handleEmailWizard(rawCmd);
    if (aiState.active) return handleAiWizard(rawCmd);

    pushToHistory('user', `${formatPrompt()} ${rawCmd}`);
    setCmdHistory(prev => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setInput('');

    await executeCommand(rawCmd, {
      mode,
      pushToHistory,
      currentPath,
      setCurrentPath,
      fileSystem,
      setFileSystem,
      navigate,
      openApp,
      emailState,
      setEmailState,
      aiState,
      setAiState,
      fetchedProjects,
      setFetchedProjects,
    });
  };

  const handleKeyDown = (e) => {
    if (emailState.step > 0 || aiState.active) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length) {
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

  return {
    history,
    input,
    setInput,
    handleCommand,
    handleKeyDown,
    formatPrompt,
    bottomRef,
    emailState,
    aiState,
  };
}
