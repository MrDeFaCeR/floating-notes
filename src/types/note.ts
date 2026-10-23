export type NoteColor = 'yellow' | 'mint' | 'sky' | 'lavender' | 'peach' | 'slate';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  isChecklist: boolean;
  checklist: ChecklistItem[];
  color: NoteColor;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isPinned: boolean;
  isMinimized: boolean;
  isCollapsed: boolean;
  opacity: number; // 0.35 to 1.0
  fontSize: 'sm' | 'base' | 'lg';
  tags: string[];
  isFavorite: boolean;
  isLocked: boolean;
  pinCode?: string;
  bubblePosition?: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'fullscreen-overlay' | 'android-phone';

export type WallpaperTheme =
  | 'material-you'
  | 'deep-space'
  | 'sunset-gradient'
  | 'emerald-nature'
  | 'cyberpunk-neon'
  | 'minimal-dark';

export interface AppSettings {
  viewMode: ViewMode;
  wallpaper: WallpaperTheme;
  soundEnabled: boolean;
  snapToEdges: boolean;
  showStatusBar: boolean;
  defaultColor: NoteColor;
  defaultOpacity: number;
  showFloatingTrigger: boolean;
}
