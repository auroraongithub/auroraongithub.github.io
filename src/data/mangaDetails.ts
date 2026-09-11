export interface MangaDetails {
  tags: string[];
  status: string;
  rating: string;
  bookmarks: string;
  description: string;
}

export const mangaDetails: Record<string, MangaDetails> = {
  mabarai: {
    tags: ['Romance', 'Comedy', 'School Life'],
    status: 'Completed',
    rating: '8.18',
    bookmarks: '12.5k',
    description: 'A romcom where Mabarai-san (a vampire hunter) relentlessly teases the MC (a vampire).'
  },
  blacksmith: {
    tags: ['Fantasy', 'Slice of Life', 'Work Life'],
    status: 'Ongoing',
    rating: '7.93',
    bookmarks: '9.4k',
    description: 'A talented blacksmith finds happiness after being picked up by the daughter of a neighboring country.'
  },
  contract: {
    tags: ['Romance', 'Drama', 'Isekai'],
    status: 'Ongoing',
    rating: '8.02',
    bookmarks: '21.3k',
    description: 'A contract marriage built on a lie spirals into complicated feelings and hidden agendas.'
  },
  kobayashi: {
    tags: ['Fantasy', 'Romance', 'Comedy'],
    status: 'Completed',
    rating: '8.35',
    bookmarks: '32.0k',
    description: 'Two students give “live commentary” to a game world, changing the fate of a misunderstood villainess.'
  },
  forcedgf: {
    tags: ['Romance', 'Comedy', 'School Life'],
    status: 'Ongoing',
    rating: '7.76',
    bookmarks: '6.8k',
    description: 'A loner boy’s life turns upside down when a “forced” girlfriend temporarily barges into his life.'
  },
  deathgame: {
    tags: ['Action', 'Thriller', 'Survival'],
    status: 'Ongoing',
    rating: '7.68',
    bookmarks: '4.1k',
    description: 'A returned stupidly overpowered hero is dragged into a modern death game.'
  },
  finalmessage: {
    tags: ['Drama', 'One-shot'],
    status: 'Completed',
    rating: '7.90',
    bookmarks: '1.2k',
    description: 'They say that a spirit sometimes appears on a certain crossing in town. One day, a high school boy named Sahara gets into an accident on that very crossing, causing his and his friends’ lives to change forever.'
  },
  shigure: {
    tags: ['Comedy', 'School Life'],
    status: 'Ongoing',
    rating: '7.81',
    bookmarks: '3.3k',
    description: 'Two loner seatmates trying their best to “shine”.'
  },
  '80k': {
    tags: ['Fantasy', 'Isekai', 'Adventure'],
    status: 'Ongoing',
    rating: '7.85',
    bookmarks: '29.6k',
    description: 'A resourceful girl exploits two worlds to build a retirement fund.'
  },
  mmo: {
    tags: ['Fantasy', 'Adventure', 'Game'],
    status: 'Ongoing',
    rating: '7.70',
    bookmarks: '1.8k',
    description: 'A retired top dollmaker with a broken hand learns about a VRMMO and proceeds to play doll pokemon using dolls with egos.'
  }
};
