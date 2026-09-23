export function generateHealthId(year = new Date().getFullYear()): string {
  const suffix = Math.floor(10000 + Math.random() * 90000).toString();
  return `KVS-${year}-${suffix}`;
}

export function generateQrToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function darken(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function lighten(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Abhi abhi';
  if (minutes < 60) return `${minutes} minute pehle`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ghante pehle`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kal';
  return `${days} din pehle`;
}

export function mealRelationLabel(relation: string): string {
  switch (relation) {
    case 'before':
      return 'Khaane se pehle';
    case 'after':
      return 'Khaane ke baad';
    case 'with':
      return 'Khaane ke saath';
    default:
      return 'Kabhi bhi';
  }
}

export function timingLabel(timing: string): string {
  switch (timing) {
    case 'morning':
      return 'Subah';
    case 'afternoon':
      return 'Dopahar';
    case 'evening':
      return 'Shaam';
    case 'night':
      return 'Raat';
    default:
      return timing;
  }
}

export function compareVersions(current: string, minimum: string): number {
  const a = current.split('.').map(Number);
  const b = minimum.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}
