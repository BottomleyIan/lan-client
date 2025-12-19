type IconDefinition = {
  readonly glyph: string;
  readonly label: string;
};

const icons = {
  album: { glyph: '\udb80\udc25', label: 'Album' }, // 󰀥
  artist: { glyph: '\uedc5', label: 'Artist' }, // 
  files: { glyph: '\udb80\ude56', label: 'Files' }, // 󰉖
  next: { glyph: '\udb83\udf27', label: 'Next' }, //nf-md-skip_next_outline 󰼧
  notes: { glyph: '\udb84\udde7', label: 'Notes' }, // 󱇧
  pause: { glyph: '\udb80\udfe4', label: 'Pause' }, //nf-md-pause 󰏤
  play: { glyph: '\udb83\udf1b', label: 'Play' }, //nf-md-play_outline 󰼛
  playlist: { glyph: '\udb83\udcb8', label: 'Playlist' }, //󰲸
  previous: { glyph: '\udb83\udf28', label: 'Previous' }, //nf-md-skip_previous_outline 󰼨
  refresh: { glyph: '\udb81\udc50', label: 'Refresh' }, //nf-md-refresh 󰑐
  settings: { glyph: '\udb81\udc93', label: 'Settings' }, //nf-md-cog 󰒓
  shuffle: { glyph: '\udb81\udc9f', label: 'Shuffle' }, //nf-md-shuffle 󰒟
  tasklist: { glyph: '\uf0ae', label: 'Tasklist' }, // 
  trash: { glyph: '\udb80\uddb4', label: 'Delete' }, //nf-md-delete 󰆴
  stop: { glyph: '\udb81\udcdb', label: 'Stop' }, //nf-md-stop 󰓛
  calendar: { glyph: '\udb80\udced', label: 'Calendar' }, // 󰃭
  volumeDown: { glyph: '\udb80\udf74', label: 'Volume down' }, //nf-md-minus 󰍴
  volumeUp: { glyph: '\udb81\udc15', label: 'Volume up' }, //nf-md-plus 󰐕
} satisfies Record<string, IconDefinition>;

type IconName = keyof typeof icons;

export { type IconDefinition, type IconName, icons };
