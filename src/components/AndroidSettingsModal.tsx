import React, { useRef } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Smartphone,
  Palette,
  Check,
  Sparkles,
} from 'lucide-react';
import { AppSettings, StickyNote, WallpaperTheme } from '../types/note';
import { sounds } from '../utils/sound';
import { exportBackup, INITIAL_SAMPLE_NOTES } from '../utils/storage';

interface AndroidSettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  notes: StickyNote[];
  onClose: () => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreBackup: (notes: StickyNote[], settings?: AppSettings) => void;
  onResetDefaults: () => void;
}

const WALLPAPERS: Array<{ id: WallpaperTheme; name: string; preview: string }> = [
  { id: 'material-you', name: 'متریال یو (اندروید ۱۵)', preview: 'from-slate-900 via-indigo-950 to-slate-900' },
  { id: 'deep-space', name: 'کیهان بنفش تیره', preview: 'from-slate-950 via-purple-950 to-slate-950' },
  { id: 'sunset-gradient', name: 'غروب آفتاب گرم', preview: 'from-rose-950 via-amber-950 to-slate-900' },
  { id: 'emerald-nature', name: 'طبیعت زمردی', preview: 'from-emerald-950 via-teal-950 to-slate-950' },
  { id: 'cyberpunk-neon', name: 'سایبرپانک نئون', preview: 'from-slate-950 via-fuchsia-950 to-blue-950' },
  { id: 'minimal-dark', name: 'تیره مینیمال (AMOLED)', preview: 'bg-slate-950' },
];

export const AndroidSettingsModal: React.FC<AndroidSettingsModalProps> = ({
  isOpen,
  settings,
  notes,
  onClose,
  onUpdateSettings,
  onRestoreBackup,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.notes)) {
          onRestoreBackup(parsed.notes, parsed.settings);
          sounds.playPop();
          alert('پشتیبان با موفقیت بازیابی شد.');
          onClose();
        } else if (Array.isArray(parsed)) {
          onRestoreBackup(parsed);
          sounds.playPop();
          alert('یادداشت‌ها با موفقیت بازیابی شدند.');
          onClose();
        } else {
          alert('فرمت فایل پشتیبان نامعتبر است.');
        }
      } catch {
        alert('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                تنظیمات سنجاقک (NoteFly)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                شخصی‌سازی تصویر پس‌زمینه، صداها، پشتیبان‌گیری و حافظه محلی یادداشت‌ها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm">
          {/* Wallpaper Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-500" />
              تصویر پس‌زمینه اندروید (Material You)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playPop();
                    onUpdateSettings({ ...settings, wallpaper: wp.id });
                  }}
                  className={`relative p-3 rounded-2xl text-right border transition-all overflow-hidden ${
                    settings.wallpaper === wp.id
                      ? 'border-sky-500 ring-2 ring-sky-500/30 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div
                    className={`h-12 w-full rounded-xl bg-gradient-to-br ${wp.preview} mb-2 shadow-inner flex items-center justify-center`}
                  >
                    {settings.wallpaper === wp.id && (
                      <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-800 dark:text-slate-200 block truncate">
                    {wp.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Haptic toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  جلوه‌های صوتی لمسی
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  صدای آرام هنگام حرکت، باز کردن حباب و ثبت چک‌لیست
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                sounds.enabled = next;
                if (next) sounds.playPop();
                onUpdateSettings({ ...settings, soundEnabled: next });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Floating Trigger Icon Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base">
                📌
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  آیکون شناور سنجاقک روی صفحه
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  آیکون گرد کوچک و شناور برای ایجاد سریع نوت با امکان کشیدن به هر جا یا حذف در پایین
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playPop();
                onUpdateSettings({ ...settings, showFloatingTrigger: !settings.showFloatingTrigger });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showFloatingTrigger ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.showFloatingTrigger ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Backup & Restore in LocalStorage */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              پشتیبان‌گیری و ذخیره‌سازی محلی نوت‌ها
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Export backup */}
              <button
                onClick={() => {
                  sounds.playPop();
                  exportBackup(notes, settings);
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors font-medium text-xs"
              >
                <Download className="w-4 h-4 text-sky-500" />
                دانلود فایل پشتیبان (JSON)
              </button>

              {/* Import backup */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors font-medium text-xs"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                بازیابی از فایل پشتیبان
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Store Info & Privacy Policy */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>🛡️</span>
                اطلاعات نسخه و حریم خصوصی (کافه بازار / مایکت / گوگل پلی)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                نسخه ۱.۰.۰ (آفلاین)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              این اپلیکیشن کاملاً آفلاین بوده و نیازمند هیچ مجوز حساسی نیست. اطلاعات یادداشت‌ها صرفاً در حافظه محلی ذخیره می‌شوند.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                ir.sanjaaghak.notes
              </span>
              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                مشاهده متن کامل حریم خصوصی ↗
              </a>
            </div>
          </div>

          {/* Reset to initial sample notes */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              بازنشانی یادداشت‌ها به نمونه‌های اولیه
            </span>
            <button
              onClick={() => {
                if (confirm('آیا مطمئن هستید که می‌خواهید یادداشت‌های نمونه را بازنشانی کنید؟')) {
                  sounds.playTrash();
                  onResetDefaults();
                  onClose();
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی نوت‌های پیش‌فرض
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
