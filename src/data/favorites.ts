import { site } from './site';

export const favoriteCategories = [
  { id: 'anime', label: 'Anime', icon: 'bi-play-circle' },
  { id: 'manga', label: 'Manga/LN', icon: 'bi-book' },
  { id: 'characters', label: 'Characters', icon: 'bi-person' },
  { id: 'games', label: 'Games', icon: 'bi-controller' }
] as const;

export type FavoriteCategory = (typeof favoriteCategories)[number]['id'];

export const favoritesEndpoint = (category: FavoriteCategory) => `${site.apiBase}/site/favorites?category=${encodeURIComponent(category)}`;
