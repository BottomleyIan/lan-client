type IconDefinition = {
  readonly glyph: string;
  readonly label: string;
};

const icons = {
  album: { glyph: '\udb80\udc25', label: 'Album' }, // 󰀥
  artist: { glyph: '\uedc5', label: 'Artist' }, // 
  check: { glyph: '\udb80\udd2c', label: 'Check' }, // 󰄬
  chevronDown: { glyph: '\udb80\udd40', label: 'Chevron Down' }, // 󰅀
  chevron: { glyph: '\udb80\udd43', label: 'Chevron Up' }, // 󰅃
  chevronLeft: { glyph: '\udb80\udd41', label: 'Chevron Left' }, // 󰅁
  chevronRight: { glyph: '\udb80\udd42', label: 'Chevron ' }, // 󰅂
  files: { glyph: '\udb80\ude56', label: 'Files' }, // 󰉖
  imageAdd: { glyph: '\udb82\udc7c', label: 'Add Image' }, // 󰡼
  next: { glyph: '\udb83\udf27', label: 'Next' }, //nf-md-skip_next_outline 󰼧
  notes: { glyph: '\udb80\udfeb', label: 'Notes' }, // 󰏫
  notesAdd: { glyph: '\udb83\uddeb', label: 'Notes' }, // 󰷫
  pause: { glyph: '\udb80\udfe4', label: 'Pause' }, //nf-md-pause 󰏤
  play: { glyph: '\udb83\udf1b', label: 'Play' }, //nf-md-play_outline 󰼛
  playlist: { glyph: '\udb83\udcb8', label: 'Playlist' }, //󰲸
  previous: { glyph: '\udb83\udf28', label: 'Previous' }, //nf-md-skip_previous_outline 󰼨

  refresh: { glyph: '\udb81\udc50', label: 'Refresh' }, //nf-md-refresh 󰑐
  settings: { glyph: '\udb81\udc93', label: 'Settings' }, //nf-md-cog 󰒓
  shuffle: { glyph: '\udb81\udc9f', label: 'Shuffle' }, //nf-md-shuffle 󰒟
  tasklist: { glyph: '\uf0ae', label: 'Tasklist' }, // 
  trash: { glyph: '\udb80\uddb4', label: 'Delete' }, //nf-md-delete 󰆴
  sortAsc: { glyph: '\uf15d', label: 'Sort Asc' }, // 
  sortDesc: { glyph: '\uf15e', label: 'Sort Desc' }, //
  stop: { glyph: '\udb81\udcdb', label: 'Stop' }, //nf-md-stop 󰓛
  star: { glyph: '\udb81\udcce', label: 'Star' }, //󰓎
  taskMinus: { glyph: '\udb84\udf6a', label: 'Task Minus' }, //󱍪
  taskPlus: { glyph: '\udb84\udf6d', label: 'Task Plus' }, //󱍭
  taskRemove: { glyph: '\udb84\udf6f', label: 'Task' }, //󱍯
  taskTodo: { glyph: '\udb84\udf6b', label: 'Task Todo' }, //󱍫
  taskDone: { glyph: '\udb84\udf68', label: 'Task Done' }, //󱍨
  taskAlert: { glyph: '\udb84\udf66', label: 'Task Alert' }, //󱍦
  starOutline: { glyph: '\udb81\udcd2', label: 'Star Outline' }, //󰓒
  calendar: { glyph: '\udb80\udced', label: 'Calendar' }, // 󰃭
  volumeDown: { glyph: '\udb80\udf74', label: 'Volume down' }, //nf-md-minus 󰍴
  volumeUp: { glyph: '\udb81\udc15', label: 'Volume up' }, //nf-md-plus 󰐕
  volumeMute: { glyph: '\udb81\udf5f', label: 'Volume muted' }, // 󱅟
  volumeLow: { glyph: '\udb81\udf5f', label: 'Low volume' }, // 󱅟
  volumeMedium: { glyph: '\udb81\udd80', label: 'Medium volume' }, // 󱆀
  volumeHigh: { glyph: '\udb81\udd7e', label: 'High volume' }, // 󱅾
  x: { glyph: '\udb80\udd56', label: 'X' }, // 󰅖
} satisfies Record<string, IconDefinition>;

type IconName = keyof typeof icons;

export { type IconDefinition, type IconName, icons };
