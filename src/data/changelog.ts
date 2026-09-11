import { site } from './site';

export interface ChangelogEntry {
  id: string;
  title?: string;
  body: string;
  date?: string;
  pinned?: boolean;
}

export const changelogEndpoint = (limit = 50) => `${site.apiBase}/site/changelog?limit=${limit}`;
