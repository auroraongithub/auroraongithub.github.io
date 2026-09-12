export type AdminNavKey =
  | 'blogs'
  | 'stories'
  | 'add-post'
  | 'status'
  | 'now'
  | 'changelog'
  | 'resources'
  | 'favorites'
  | 'portfolio'
  | 'settings'
  | 'youtube-research'
  | 'youtube-transcripts';

export const adminNavigation = [
  {
    label: 'Content',
    items: [
      { key: 'blogs', label: 'Blogs', href: '/admin/blogs/' },
      { key: 'stories', label: 'Stories', href: '/admin/stories/' },
      { key: 'add-post', label: 'Add Post', href: '/admin/add-post/' }
    ]
  },
  {
    label: 'Site',
    items: [
      { key: 'status', label: 'Status Strip', href: '/admin/status/' },
      { key: 'now', label: 'Now Page', href: '/admin/now/' },
      { key: 'changelog', label: 'Changelog', href: '/admin/changelog/' },
      { key: 'resources', label: 'Resources', href: '/admin/resources/' },
      { key: 'favorites', label: 'Favorites', href: '/admin/favorites/' },
      { key: 'portfolio', label: 'Portfolio', href: '/admin/portfolio/' },
      { key: 'settings', label: 'Settings', href: '/admin/settings/' }
    ]
  },
  {
    label: 'YouTube CMS',
    items: [
      { key: 'youtube-research', label: 'Research', href: '/admin/youtube-research/', icon: 'bi-youtube' },
      { key: 'youtube-transcripts', label: 'Transcripts', href: '/admin/youtube-transcripts/', icon: 'bi-card-text' }
    ]
  }
] as const;
