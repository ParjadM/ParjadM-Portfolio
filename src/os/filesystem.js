export const GUEST_PATH = ['C:', 'Users', 'Guest'];

export function createDefaultFileSystem() {
  return {
    name: 'C:',
    type: 'drive',
    children: [
      {
        name: 'Users',
        type: 'folder',
        children: [
          {
            name: 'Guest',
            type: 'folder',
            children: [
              {
                name: 'Documents',
                type: 'folder',
                children: [
                  { name: 'Welcome.txt', type: 'file', content: 'Welcome to Parjad WebOS! Feel free to explore.\nType "help" in Terminal or run "gui" from CLI.' },
                  { name: 'Secret.txt', type: 'file', content: 'You found the secret file. 42 is the answer.\nTry: ping parjadm.ca' },
                ],
              },
              {
                name: 'Pictures',
                type: 'folder',
                children: [],
              },
              {
                name: 'Projects',
                type: 'folder',
                children: [
                  { name: 'list_projects.sh', type: 'executable', action: 'fetch_projects' },
                ],
              },
              { name: 'about.txt', type: 'file', content: '> Parjad Minooei | Software Engineer\n> I am a Software Engineering student at McMaster University.\n> My background blends an Advanced Diploma in Computer Programming with a degree in Psychology.' },
              { name: 'skills.md', type: 'file', content: '# Skills\n- [Frontend] JavaScript, React, HTML/CSS, Tailwind\n- [Backend] Node.js, Python, SQL, MongoDB\n- [Tools & CS] Git, Algorithms' },
              { name: 'contact.json', type: 'file', content: '{\n  "github": "https://github.com/ParjadM",\n  "linkedin": "https://linkedin.com/in/parjadminooei"\n}' },
            ],
          },
        ],
      },
      {
        name: 'Recycle Bin',
        type: 'folder',
        children: [],
      },
    ],
  };
}

export function getNodeByPath(fs, pathArr, fsRoot = fs) {
  if (!pathArr?.length) return null;
  let current = fsRoot;
  for (let i = 1; i < pathArr.length; i++) {
    if (!current?.children) return null;
    const next = current.children.find(c => c.name === pathArr[i]);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function formatPathStr(pathArr) {
  const str = pathArr.join('/');
  if (str.startsWith('C:/Users/Guest')) {
    return str.replace('C:/Users/Guest', '~').replace('C:/Users/Guest/', '~/') || '~';
  }
  return str;
}

export function resolvePath(pathStr, currentPath) {
  if (!pathStr || pathStr === '.') return [...currentPath];
  if (pathStr === '~') return [...GUEST_PATH];
  if (pathStr === '/') return ['C:'];

  let target = [...currentPath];
  let rest = pathStr;

  if (rest.startsWith('~/')) {
    target = [...GUEST_PATH];
    rest = rest.slice(2);
  } else if (rest.startsWith('~')) {
    return [...GUEST_PATH];
  } else if (rest.startsWith('/')) {
    target = ['C:'];
    rest = rest.slice(1);
  } else if (rest.startsWith('C:/')) {
    target = ['C:'];
    rest = rest.slice(3);
  }

  const parts = rest.split('/').filter(Boolean);
  for (const part of parts) {
    if (part === '..') {
      if (target.length > 1) target.pop();
    } else if (part !== '.') {
      target.push(part);
    }
  }
  return target;
}

export function loadFileSystem() {
  try {
    const saved = localStorage.getItem('os_file_system');
    if (saved) return JSON.parse(saved);
  } catch {}
  return createDefaultFileSystem();
}

export function saveFileSystem(fs) {
  try { localStorage.setItem('os_file_system', JSON.stringify(fs)); } catch {}
}
