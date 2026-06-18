const KEY = 'parjadm_os_achievements';

const DEFINITIONS = [
  { id: 'first_boot', label: 'First Boot', desc: 'Boot ParjadOS for the first time' },
  { id: 'used_cli', label: 'Terminal Native', desc: 'Use the CLI or OS terminal' },
  { id: 'used_gui', label: 'GUI Mode', desc: 'Boot the graphical interface' },
  { id: 'created_file', label: 'File Creator', desc: 'Create a file or folder' },
  { id: 'ping_easter', label: 'Hidden Network', desc: 'Ping parjadm.ca' },
  { id: 'both_modes', label: 'Dual Mode', desc: 'Use both CLI and GUI in one session' },
];

export function getAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    return DEFINITIONS.map(d => ({ ...d, unlocked: saved.includes(d.id) }));
  } catch {
    return DEFINITIONS.map(d => ({ ...d, unlocked: false }));
  }
}

export function unlockAchievement(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (saved.includes(id)) return false;
    saved.push(id);
    localStorage.setItem(KEY, JSON.stringify(saved));
    const def = DEFINITIONS.find(d => d.id === id);
    return def;
  } catch {
    return false;
  }
}

export { DEFINITIONS };
