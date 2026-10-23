import React from 'react';
import {
  Wifi,
  BatteryCharging,
  Phone,
  MessageCircle,
  Globe,
  Camera,
  Image as ImageIcon,
  Folder,
  Compass,
  Sparkles,
  Search,
} from 'lucide-react';
import { WallpaperTheme } from '../types/note';
import { getPersianCurrentDateString, toPersianDigits } from '../utils/date';
import { sounds } from '../utils/sound';

interface AndroidHomeScreenProps {
  wallpaper: WallpaperTheme;
  onOpenSearch: () => void;
  onLaunchApp: () => void;
  onNewNote: () => void;
}

const WALLPAPER_CLASSES: Record<WallpaperTheme, string> = {
  'material-you': 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900',
  'deep-space': 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950',
  'sunset-gradient': 'bg-gradient-to-br from-rose-950 via-amber-950 to-slate-900',
  'emerald-nature': 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
  'cyberpunk-neon': 'bg-gradient-to-tr from-slate-950 via-fuchsia-950 to-blue-950',
  'minimal-dark': 'bg-slate-950',
};

export const AndroidHomeScreen: React.FC<AndroidHomeScreenProps> = ({
  wallpaper,
  onOpenSearch,
  onLaunchApp,
  onNewNote,
}) => {
  const { time, date } = getPersianCurrentDateString();

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-500 pointer-events-none select-none ${
        WALLPAPER_CLASSES[wallpaper]
      }`}
    >
      {/* Decorative ambient background mesh */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Top Android Status Bar */}
      <header className="relative z-10 w-full px-6 py-2 flex items-center justify-between text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider">{time}</span>
          <span className="text-[10px] text-slate-400">IRANCELL 5G</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">98%</span>
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
        </div>
      </header>

      {/* Main Home Screen Body (Pointer events enabled for home screen widgets) */}
      <div className="relative w-full max-w-4xl mx-auto px-6 pt-10 pb-28 flex flex-col items-center justify-between h-[calc(100%-40px)] pointer-events-auto">
        {/* Large Android Clock & Weather Widget */}
        <div className="text-center space-y-1.5 my-4">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white/90 drop-shadow-md">
            {time}
          </h1>
          <p className="text-sm sm:text-base font-medium text-sky-200/80 drop-shadow">
            {date} · تهران ۲۱°C آفتابی
          </p>
        </div>

        {/* Android Search Widget */}
        <div
          onClick={() => {
            sounds.playPop();
            onOpenSearch();
          }}
          className="w-full max-w-md mx-auto my-6 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/15 text-white/90 flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 via-amber-300 to-rose-400 flex items-center justify-center text-[10px] font-black text-slate-900 shadow">
              G
            </div>
            <span className="text-xs sm:text-sm text-slate-200">
              جستجو در یادداشت‌های سنجاقک یا وب...
            </span>
          </div>
          <Search className="w-4 h-4 text-slate-300" />
        </div>

        {/* Simulated Android Home Screen App Grid */}
        <div className="w-full max-w-lg grid grid-cols-4 sm:grid-cols-4 gap-y-6 gap-x-4 my-auto">
          {/* App 1: Floating Notes (Interactive) */}
          <button
            onClick={() => {
              sounds.playPop();
              onLaunchApp();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-all ring-2 ring-amber-300/60">
              <span className="text-2xl">📌</span>
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
              سنجاقک
            </span>
          </button>

          {/* App 2: Search Notes (Interactive) */}
          <button
            onClick={() => {
              sounds.playPop();
              onOpenSearch();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-all ring-2 ring-sky-300/60">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
              جستجو
            </span>
          </button>

          {/* App 3: Phone */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">تلفن</span>
          </div>

          {/* App 4: Messages */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">پیام‌ها</span>
          </div>

          {/* App 5: Chrome Browser */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">کروم</span>
          </div>

          {/* App 6: Camera */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">دوربین</span>
          </div>

          {/* App 7: Gallery */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">گالری</span>
          </div>

          {/* App 8: Files */}
          <div className="flex flex-col items-center gap-1.5 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg">
              <Folder className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-300">فایل‌ها</span>
          </div>
        </div>
      </div>
    </div>
  );
};
