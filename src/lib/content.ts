import type { CollectionEntry } from 'astro:content';

export function entrySlug(id: string) {
  return id.split('/').filter(Boolean).pop()?.replace(/\.(md|mdx)$/i, '') || id;
}

export function sortByDate<T extends CollectionEntry<'blogs'> | CollectionEntry<'stories'>>(entries: T[]) {
  return [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
