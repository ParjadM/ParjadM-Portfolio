export const APP_IDS = {
  browser: 'browser',
  filesystem: 'filesystem',
  youtube: 'youtube',
  assistant: 'assistant',
  camera: 'camera',
  settings: 'settings',
  portfolio: 'portfolio',
  calculator: 'calculator',
  weather: 'weather',
  music: 'music',
  snake: 'snake',
  terminal: 'terminal',
  notepad: 'notepad',
  news: 'news',
  stats: 'stats',
  projects: 'projects',
  blog: 'blog',
  taskmanager: 'taskmanager',
  github: 'github',
};

export const APP_ALIASES = {
  calc: 'calculator',
  calculator: 'calculator',
  terminal: 'terminal',
  cmd: 'terminal',
  notepad: 'notepad',
  notes: 'notepad',
  browser: 'browser',
  explorer: 'filesystem',
  files: 'filesystem',
  filesystem: 'filesystem',
  settings: 'settings',
  camera: 'camera',
  weather: 'weather',
  music: 'music',
  snake: 'snake',
  youtube: 'youtube',
  assistant: 'assistant',
  ai: 'assistant',
  portfolio: 'portfolio',
  home: 'portfolio',
  news: 'news',
  'tech-news': 'news',
  stats: 'stats',
  projects: 'projects',
  blog: 'blog',
  taskmanager: 'taskmanager',
  tasks: 'taskmanager',
};

export const APP_META = [
  { id: 'browser', title: 'Web Browser', aliases: ['browser'] },
  { id: 'filesystem', title: 'File Explorer', aliases: ['explorer', 'files'] },
  { id: 'youtube', title: 'YouTube', aliases: ['youtube'] },
  { id: 'assistant', title: 'AI Assistant', aliases: ['assistant', 'ai'] },
  { id: 'camera', title: 'Camera', aliases: ['camera'] },
  { id: 'settings', title: 'Settings', aliases: ['settings'] },
  { id: 'portfolio', title: 'Portfolio Home', aliases: ['portfolio', 'home'] },
  { id: 'calculator', title: 'Calculator', aliases: ['calculator', 'calc'] },
  { id: 'weather', title: 'Weather', aliases: ['weather'] },
  { id: 'music', title: 'Media Player', aliases: ['music'] },
  { id: 'snake', title: 'Snake Game', aliases: ['snake'] },
  { id: 'terminal', title: 'Command Prompt', aliases: ['terminal', 'cmd'] },
  { id: 'notepad', title: 'Notepad', aliases: ['notepad', 'notes'] },
  { id: 'news', title: 'Tech Hub', aliases: ['news', 'tech-news'] },
  { id: 'stats', title: 'Stats & ClickUp', aliases: ['stats'] },
  { id: 'projects', title: 'Projects', aliases: ['projects'] },
  { id: 'blog', title: 'Blog', aliases: ['blog'] },
  { id: 'taskmanager', title: 'Task Manager', aliases: ['taskmanager', 'tasks'] },
  { id: 'github', title: 'GitHub', aliases: ['github'], external: 'https://github.com/ParjadM' },
];

export function resolveAppId(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  return APP_ALIASES[key] || APP_META.find(a => a.id === key)?.id || null;
}

export function listAppsHelp() {
  return APP_META.filter(a => !a.external).map(a => `  ${a.id.padEnd(14)} - ${a.title}`).join('\n');
}
