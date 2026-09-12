export function formatNumber(value: unknown): string {
  const num = Number(value || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function timeAgo(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','must','shall','can','and','but','or','nor','for','yet','so','to','of','in','on','at','by','with','from','up','down','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','each','few','more','most','other','some','such','no','not','only','own','same','than','too','very','just','i','me','my','myself','we','our','ours','you','your','he','him','his','she','her','it','its','they','them','their','this','that','these','those','what','which','who','whom']);

export function similarSearchQuery(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word)).slice(0, 4).join(' ');
}

export const discoveryKeywords: Record<string, string> = {
  trending: '', comedy: 'funny comedy memes', gaming: 'gaming gameplay', music: 'music song', sports: 'sports highlights', education: 'tutorial learn education', tech: 'technology tech gadgets', food: 'cooking recipe food', fitness: 'workout fitness gym', diy: 'diy crafts howto'
};
