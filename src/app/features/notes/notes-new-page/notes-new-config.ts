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
    fields: {
      ammount: { type: 'number' },
      category: { type: 'single-tag' },
      on: { type: 'calendar' },
    },
  },
  film: {
    tags: ['film'],
    fields: {
      director: { type: 'single-tag' },
      type: { default: 'film' },
      rating: { type: 'single-tag' },
      genre: { type: 'single-tag' },
      'watched-on': { type: 'calendar' },
      cast: { type: 'single-tag' },
      series: { type: 'single-tag' },
      year: { type: 'single-tag' },
    },
  },
};
