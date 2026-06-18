import { apiCache } from '../utils/useFetchWithCache.js';
import {
  formatPathStr, getNodeByPath, resolvePath, GUEST_PATH, saveFileSystem,
} from './filesystem.js';
import { resolveAppId, listAppsHelp, APP_META } from './apps.js';
import { launchApp, notify, setPendingLaunch } from './events.js';
import { unlockAchievement } from './achievements.js';
import { pushCommandHistory, pushRecentApp } from './session.js';

export const COMMAND_LIST = [
  'help', 'manual', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm',
  'clear', 'ping', 'about', 'skills', 'projects', 'contact', 'email', 'ai', 'news',
  'open', 'run', 'apps', 'gui', 'cli', 'home', 'exit', 'sudo', 'theme',
  'neofetch', 'fortune', 'cowsay',
];

export const HELP_TEXT = `Available commands:
  ls, cd, pwd, cat, mkdir, touch, rm  - Filesystem
  about, skills, contact, projects      - Portfolio info
  open <n|name>                       - Open project by number or name
  apps                                - List GUI applications
  open <app>                          - Launch app (calculator, notepad, blog…)
  email, ai, news                       - Interactive tools
  gui, startx                           - Boot graphical interface (/os)
  cli                                   - Fullscreen terminal (/cli)
  ping <host>                           - Network diagnostics
  neofetch, fortune, cowsay             - Fun extras
  clear                                 - Clear terminal`;

function mutateFs(setFileSystem, mutator) {
  setFileSystem(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    mutator(next);
    saveFileSystem(next);
    return next;
  });
}

async function fetchProjects(ctx) {
  const { fetchedProjects, setFetchedProjects, pushToHistory } = ctx;
  if (fetchedProjects?.length > 0) {
    const lines = fetchedProjects.map((p, i) => `> ${i + 1}. ${p.title} - ${(p.tags || []).join(', ')}`);
    lines.push('> Type "open <number>" or project name to launch.');
    pushToHistory('system', lines.join('\n'));
    return;
  }
  const cached = apiCache.get('/api/projects');
  if (cached?.projects?.length) {
    setFetchedProjects?.(cached.projects);
    const lines = cached.projects.map((p, i) => `> ${i + 1}. ${p.title} - ${(p.tags || []).join(', ')}`);
    lines.push('> Type "open <number>" or project name to launch.');
    pushToHistory('system', lines.join('\n'));
    return;
  }
  pushToHistory('system', '> Fetching projects...');
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (data.projects?.length) {
      apiCache.set('/api/projects', data);
      setFetchedProjects?.(data.projects);
      const lines = data.projects.map((p, i) => `> ${i + 1}. ${p.title} - ${(p.tags || []).join(', ')}`);
      lines.push('> Type "open <number>" or project name to launch.');
      pushToHistory('system', lines.join('\n'));
    } else {
      pushToHistory('system', '> No projects found.');
    }
  } catch {
    pushToHistory('error', '> Connection failed.');
  }
}

async function fetchNews(pushToHistory) {
  pushToHistory('system', '> Fetching top stories from Hacker News...');
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = await topRes.json();
    const stories = await Promise.all(
      topIds.slice(0, 5).map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
    );
    const lines = stories.map((s, i) => `> ${i + 1}. ${s.title}\n  Score: ${s.score} | by ${s.by}`);
    pushToHistory('system', lines.join('\n\n'));
  } catch {
    pushToHistory('error', '> Failed to fetch news.');
  }
}

function openProject(searchParam, ctx) {
  const { fetchedProjects, pushToHistory, navigate } = ctx;
  if (!fetchedProjects?.length) {
    pushToHistory('error', 'open: run "projects" first.');
    return;
  }
  const idx = parseInt(searchParam, 10);
  let target = !Number.isNaN(idx) && idx > 0 && idx <= fetchedProjects.length
    ? fetchedProjects[idx - 1]
    : fetchedProjects.find(p => p.title.toLowerCase().includes(searchParam.toLowerCase()));
  if (!target) {
    pushToHistory('error', 'open: project not found.');
    return;
  }
  pushToHistory('system', `> Opening ${target.title}...`);
  const url = target.liveUrl || target.githubUrl;
  if (!url) {
    pushToHistory('error', '> No URL available.');
    return;
  }
  if (url.startsWith('/') && navigate) navigate(url);
  else window.open(url, '_blank');
}

function openAppByName(name, ctx) {
  const appId = resolveAppId(name);
  if (!appId) {
    ctx.pushToHistory('error', `apps: unknown app "${name}". Type "apps" for list.`);
    return;
  }
  const meta = APP_META.find(a => a.id === appId);
  if (meta?.external) {
    window.open(meta.external, '_blank');
    ctx.pushToHistory('system', `> Opened ${meta.title} in browser.`);
    return;
  }
  ctx.pushToHistory('system', `> Launching ${meta?.title || appId}...`);
  if (ctx.mode === 'os' && ctx.openApp) {
    ctx.openApp(appId);
    pushRecentApp(appId);
    notify(`Opened ${meta?.title || appId}`);
  } else {
    setPendingLaunch(appId);
    ctx.navigate?.('/os');
  }
  unlockAchievement('used_gui');
}

export async function executeCommand(rawCmd, ctx) {
  const {
    pushToHistory, currentPath, setCurrentPath, fileSystem, setFileSystem,
    mode, navigate, openApp, emailState, setEmailState, aiState, setAiState,
    fetchedProjects, setFetchedProjects,
  } = ctx;

  const cmdParts = rawCmd.split(' ').filter(Boolean);
  const cmd = cmdParts[0].toLowerCase();
  const args = cmdParts.slice(1);
  pushCommandHistory(rawCmd);
  unlockAchievement('used_cli');

  switch (cmd) {
    case 'help':
    case 'manual':
      pushToHistory('system', HELP_TEXT);
      break;
    case 'apps':
      pushToHistory('system', 'Installed applications:\n' + listAppsHelp() + '\n\nUsage: open <app>  (e.g. open calculator)');
      break;
    case 'clear':
      pushToHistory('system', '__CLEAR__');
      break;
    case 'pwd':
      pushToHistory('system', formatPathStr(currentPath));
      break;
    case 'ls': {
      const dirPath = args[0] ? resolvePath(args[0], currentPath) : currentPath;
      const node = getNodeByPath(fileSystem, dirPath);
      if (node?.children) {
        pushToHistory('system', node.children.map(c => (c.type === 'folder' || c.type === 'drive' ? `${c.name}/` : c.name)).join('   ') || '(empty)');
      } else if (node) {
        pushToHistory('system', node.name);
      } else {
        pushToHistory('error', `ls: cannot access '${args[0]}': No such file or directory`);
      }
      break;
    }
    case 'cd': {
      if (!args[0]) { setCurrentPath([...GUEST_PATH]); break; }
      const targetPath = resolvePath(args[0], currentPath);
      const node = getNodeByPath(fileSystem, targetPath);
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
      if (!args[0]) { pushToHistory('error', 'cat: missing file operand'); break; }
      const targetPath = resolvePath(args[0], currentPath);
      const node = getNodeByPath(fileSystem, targetPath);
      if (!node) pushToHistory('error', `cat: ${args[0]}: No such file or directory`);
      else if (node.type === 'folder' || node.type === 'drive') pushToHistory('error', `cat: ${args[0]}: Is a directory`);
      else if (node.type === 'image') pushToHistory('error', `cat: ${args[0]}: Binary image file`);
      else if (node.type === 'executable' && node.action === 'fetch_projects') await fetchProjects(ctx);
      else pushToHistory('system', node.content || '', true);
      break;
    }
    case 'mkdir': {
      if (!args[0]) { pushToHistory('error', 'mkdir: missing operand'); break; }
      const newPath = resolvePath(args[0], currentPath);
      const parentPath = newPath.slice(0, -1);
      const newName = newPath[newPath.length - 1];
      const parentNode = getNodeByPath(fileSystem, parentPath);
      if (!parentNode?.children) { pushToHistory('error', `mkdir: cannot create '${args[0]}'`); break; }
      if (parentNode.children.find(c => c.name === newName)) { pushToHistory('error', `mkdir: '${args[0]}': File exists`); break; }
      mutateFs(setFileSystem, fs => {
        const parent = getNodeByPath(fs, parentPath);
        parent.children.push({ name: newName, type: 'folder', children: [] });
      });
      unlockAchievement('created_file');
      notify('Folder created');
      break;
    }
    case 'touch': {
      if (!args[0]) { pushToHistory('error', 'touch: missing file operand'); break; }
      const newPath = resolvePath(args[0], currentPath);
      const parentPath = newPath.slice(0, -1);
      const newName = newPath[newPath.length - 1];
      const parentNode = getNodeByPath(fileSystem, parentPath);
      if (!parentNode?.children) { pushToHistory('error', `touch: cannot touch '${args[0]}'`); break; }
      if (!parentNode.children.find(c => c.name === newName)) {
        mutateFs(setFileSystem, fs => {
          const parent = getNodeByPath(fs, parentPath);
          parent.children.push({ name: newName, type: 'file', content: '' });
        });
        unlockAchievement('created_file');
      }
      break;
    }
    case 'rm': {
      if (!args[0]) { pushToHistory('error', 'rm: missing operand'); break; }
      const targetPath = resolvePath(args[0], currentPath);
      const parentPath = targetPath.slice(0, -1);
      const targetName = targetPath[targetPath.length - 1];
      const parentNode = getNodeByPath(fileSystem, parentPath);
      const targetNode = getNodeByPath(fileSystem, targetPath);
      if (!parentNode?.children?.find(c => c.name === targetName)) {
        pushToHistory('error', `rm: cannot remove '${args[0]}'`);
        break;
      }
      mutateFs(setFileSystem, fs => {
        const parent = getNodeByPath(fs, parentPath);
        parent.children = parent.children.filter(c => c.name !== targetName);
        const bin = getNodeByPath(fs, ['C:', 'Recycle Bin']);
        if (bin?.children && targetNode) {
          bin.children.push({ ...targetNode, name: `${targetNode.name}.deleted` });
        }
      });
      notify('Moved to Recycle Bin');
      break;
    }
    case 'ping':
      if (!args[0]) pushToHistory('error', 'ping: missing host operand');
      else if (args[0].includes('parjadm.ca')) {
        pushToHistory('system', `Pinging ${args[0]} [216.198.79.1] with 32 bytes of data:`);
        setTimeout(() => pushToHistory('system', 'Reply from 216.198.79.1: bytes=32 time=4ms TTL=248'), 500);
        setTimeout(() => {
          pushToHistory('system', '\nACCESS GRANTED.\n\nWelcome to the hidden network, guest.');
          unlockAchievement('ping_easter');
        }, 1500);
      } else {
        pushToHistory('system', `Pinging ${args[0]}...\nReply: bytes=32 time=12ms TTL=64`);
      }
      break;
    case 'about':
      pushToHistory('system', getNodeByPath(fileSystem, [...GUEST_PATH, 'about.txt'])?.content || 'Not found', true);
      break;
    case 'skills':
      pushToHistory('system', getNodeByPath(fileSystem, [...GUEST_PATH, 'skills.md'])?.content || 'Not found', true);
      break;
    case 'contact':
      pushToHistory('system', getNodeByPath(fileSystem, [...GUEST_PATH, 'contact.json'])?.content || 'Not found', true);
      break;
    case 'projects':
      await fetchProjects(ctx);
      break;
    case 'email':
      setEmailState?.({ step: 1, name: '', email: '', message: '' });
      pushToHistory('system', 'Email wizard — enter your name:');
      break;
    case 'ai':
      setAiState?.({ active: true, messages: [] });
      pushToHistory('system', 'AI mode — type "exit" to leave.');
      break;
    case 'news':
      await fetchNews(pushToHistory);
      break;
    case 'open':
    case 'run': {
      if (!args[0]) { pushToHistory('error', `${cmd}: missing operand`); break; }
      const appId = resolveAppId(args[0]);
      if (appId && !/^\d+$/.test(args[0])) {
        openAppByName(args[0], ctx);
        break;
      }
      openProject(args.join(' '), ctx);
      break;
    }
    case 'gui':
    case 'startx':
      pushToHistory('system', '> Booting ParjadOS GUI...');
      unlockAchievement('used_gui');
      unlockAchievement('both_modes');
      setTimeout(() => navigate?.('/os'), 600);
      break;
    case 'cli':
      pushToHistory('system', '> Switching to fullscreen CLI...');
      setTimeout(() => navigate?.('/cli'), 400);
      break;
    case 'home':
      pushToHistory('system', '> Navigating to portfolio home...');
      setTimeout(() => navigate?.('/'), 400);
      break;
    case 'exit':
      if (mode === 'os') {
        pushToHistory('system', '> Returning to site...');
        setTimeout(() => navigate?.('/'), 400);
      } else {
        pushToHistory('system', '> Booting GUI...');
        setTimeout(() => navigate?.('/os'), 600);
      }
      break;
    case 'sudo':
      pushToHistory('error', 'Permission denied. This incident will be reported.');
      break;
    case 'theme':
      pushToHistory('system', 'Use Settings app in GUI, or "gui" to open desktop.');
      break;
    case 'neofetch':
      pushToHistory('system', `       parjadm@webos
OS: ParjadOS 2.0 Web
Shell: parjad-sh
Theme: emerald
Site: parjadm.ca
Packages: ${APP_META.length} apps`);
      break;
    case 'fortune':
      pushToHistory('system', 'Fortune: The best code is the code you do not have to write.');
      break;
    case 'cowsay':
      pushToHistory('system', ` ${'_'.repeat((args.join(' ') || 'moo').length + 2)}
< ${args.join(' ') || 'moo'} >
 ${'-'.repeat((args.join(' ') || 'moo').length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`);
      break;
    default:
      if (rawCmd.startsWith('./')) {
        const execName = rawCmd.slice(2);
        const dir = getNodeByPath(fileSystem, currentPath);
        const file = dir?.children?.find(c => c.name === execName);
        if (file?.type === 'executable' && file.action === 'fetch_projects') await fetchProjects(ctx);
        else pushToHistory('error', `bash: ${rawCmd}: command not found`);
      } else if (resolveAppId(cmd)) {
        openAppByName(cmd, ctx);
      } else if (fetchedProjects?.length) {
        openProject(rawCmd, ctx);
      } else {
        pushToHistory('error', `bash: ${cmd}: command not found`);
      }
  }
}

export { fetchProjects, openAppByName };
