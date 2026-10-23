import { AppSettings, StickyNote } from '../types/note';

const NOTES_STORAGE_KEY = 'android_floating_sticky_notes_v1';
const SETTINGS_STORAGE_KEY = 'android_floating_notes_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  viewMode: 'android-phone',
  wallpaper: 'material-you',
  soundEnabled: true,
  snapToEdges: true,
  showStatusBar: true,
  defaultColor: 'yellow',
  defaultOpacity: 0.95,
  showFloatingTrigger: true,
};

export const INITIAL_SAMPLE_NOTES: StickyNote[] = [
  {
    id: 'note-sample-1',
    title: '🛒 چک‌لیست کارهای روزانه',
    content: '',
    isChecklist: true,
    checklist: [
      { id: 'c1', text: 'تست قابلیت حرکت شناور نوت‌ها', done: true },
      { id: 'c2', text: 'تبدیل نوت به حباب گرد (Chat-head)', done: true },
      { id: 'c3', text: 'تنظیم شفافیت نوت برای دیدن زیر صفحه', done: false },
      { id: 'c4', text: 'ذخیره‌سازی خودکار در حافظه گوشی', done: false },
    ],
    color: 'yellow',
    x: 48,
    y: 80,
    width: 290,
    height: 310,
    zIndex: 10,
    isPinned: false,
    isMinimized: false,
    isCollapsed: false,
    opacity: 0.95,
    fontSize: 'sm',
    tags: ['روزانه', 'مهم'],
    isFavorite: true,
    isLocked: false,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'note-sample-2',
    title: '📌 راهنمای نوت شناور اندروید',
    content: '• نوار بالای نوت را بگیرید و در کل صفحه آزادانه تکان دهید.\n• آیکون حباب (🫧) را بزنید تا مثل مسنجر اندروید به حباب لبه صفحه تبدیل شود.\n• با نوار اسلایدر پایین، میزان شفافیت (Opacity) را تغییر دهید تا صفحه زیر آن خوانا باشد.\n• گوشه پایین را بکشید تا اندازه نوت تغییر کند.',
    isChecklist: false,
    checklist: [],
    color: 'mint',
    x: 370,
    y: 110,
    width: 320,
    height: 290,
    zIndex: 12,
    isPinned: true,
    isMinimized: false,
    isCollapsed: false,
    opacity: 0.92,
    fontSize: 'sm',
    tags: ['راهنما', 'شناور'],
    isFavorite: false,
    isLocked: false,
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'note-sample-3',
    title: '💡 ایده‌های طراحی نسخه بعد',
    content: '۱. ویجت ساعت دیجیتال شناور\n۲. هماهنگی تم با رنگ تصویر پس‌زمینه (Material You)\n۳. یادآور صوتی و اشتراک‌گذاری در ایتا و تلگرام\n۴. دسته‌بندی رنگی نوت‌های اداری و شخصی',
    isChecklist: false,
    checklist: [],
    color: 'lavender',
    x: 120,
    y: 410,
    width: 300,
    height: 240,
    zIndex: 8,
    isPinned: false,
    isMinimized: false,
    isCollapsed: false,
    opacity: 0.96,
    fontSize: 'base',
    tags: ['ایده', 'پروژه'],
    isFavorite: true,
    isLocked: false,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'note-sample-4',
    title: '🫧 یادداشت حباب سریع',
    content: 'شماره تلفن واحد پشتیبانی: ۰۲۱-۸۸۲۲۳۳۴۴\nکد پیگیری بسته پستی: ۹۸۳۴۲۱',
    isChecklist: false,
    checklist: [],
    color: 'sky',
    x: 420,
    y: 430,
    width: 280,
    height: 220,
    zIndex: 14,
    isPinned: false,
    isMinimized: true, // starts minimized to showcase bubble feature!
    isCollapsed: false,
    opacity: 0.95,
    fontSize: 'sm',
    tags: ['فوری'],
    isFavorite: false,
    isLocked: false,
    bubblePosition: { x: 20, y: 180 },
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 4,
  },
];

export function loadNotes(): StickyNote[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      saveNotes(INITIAL_SAMPLE_NOTES);
      return INITIAL_SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_NOTES;
  } catch (e) {
    console.error('Failed to load notes from localStorage', e);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveNotes(notes: StickyNote[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
      // Always ensure the floating trigger icon is open and active when the app is launched!
      showFloatingTrigger: true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function exportBackup(notes: StickyNote[], settings: AppSettings): void {
  const data = {
    appName: 'سنجاقک (Sanjaaghak - Floating Notes)',
    version: '1.0',
    exportDate: new Date().toISOString(),
    notes,
    settings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sanjaaghak-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
