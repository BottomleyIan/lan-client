export type NotesNewFieldConfig = {
  label?: string;
  placeholder?: string;
  default?: string;
  type?: 'calendar' | 'multiple-tag' | 'single-tag' | 'number';
};

export type NotesNewTypeConfig = {
  tags?: string[];
  fields?: Record<string, NotesNewFieldConfig>;
};

export const NOTES_NEW_CONFIG: Record<string, NotesNewTypeConfig> = {
  'audio-book': {
    tags: ['book', 'audio-book'],
    fields: {
      author: { type: 'single-tag' },
      type: { default: 'book' },
      series: { type: 'single-tag' },
      genre: { type: 'single-tag' },
      rating: { type: 'single-tag' },
      narrator: { type: 'single-tag' },
      'finished-on': { type: 'calendar' },
    },
  },
  book: {
    tags: ['book'],
    fields: {
      author: { type: 'single-tag' },
      type: { default: 'book' },
      series: { type: 'single-tag' },
      genre: { type: 'single-tag' },
      rating: { type: 'single-tag' },
      'finished-on': { type: 'calendar' },
    },
  },
  spent: {
    tags: ['spent'],
    fields: {
      ammount: { type: 'number' },
      category: { type: 'single-tag' },
      on: { type: 'calendar' },
    },
  },
  balance: {
    tags: ['balance'],
    fields: {
      date: { type: 'calendar' },
      mortgage: { type: 'number' },
      metal: { type: 'number' },
      isa: { type: 'number' },
      shares: { type: 'number' },
      balance: { type: 'number' },
      notes: {},
    },
  },
  film: {
    tags: ['film'],
    fields: {
      title: {},
      director: { type: 'single-tag' },
      type: { default: 'film' },
      rating: { type: 'single-tag' },
      genre: { type: 'single-tag' },
      'watched-on': { type: 'calendar' },
      cast: { type: 'multiple-tag' },
      series: { type: 'single-tag' },
      year: { type: 'single-tag' },
    },
  },
};
