import React, { useState } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  Minimize2,
  Maximize2,
  Settings,
  Sparkles,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NoteColor, ViewMode } from '../types/note';
import { sounds } from '../utils/sound';

interface FloatingControlDockProps {
  noteCount: number;
  bubbleCount: number;
  viewMode: ViewMode;
  soundEnabled: boolean;
  showFloatingTrigger: boolean;
  onNewNote: (color?: NoteColor) => void;
  onOpenSearch: () => void;
  onToggleMinimizeAll: () => void;
  onAutoArrange: () => void;
  onToggleViewMode: () => void;
  onToggleSound: () => void;
  onToggleFloatingTrigger: () => void;
  onOpenSettings: () => void;
}

export const FloatingControlDock: React.FC<FloatingControlDockProps> = ({
  noteCount,
  bubbleCount,
  viewMode,
  soundEnabled,
  showFloatingTrigger,
  onNewNote,
  onOpenSearch,
  onToggleMinimizeAll,
  onAutoArrange,
  onToggleViewMode,
  onToggleSound,
  onToggleFloatingTrigger,
  onOpenSettings,
}) => {
  const [showColorFlyout, setShowColorFlyout] = useState(false);

  const colors: Array<{ color: NoteColor; bg: string; title: string }> = [
    { color: 'yellow', bg: 'bg-amber-400', title: 'زرد' },
    { color: 'mint', bg: 'bg-emerald-400', title: 'سبز' },
    { color: 'sky', bg: 'bg-sky-400', title: 'آبی' },
    { color: 'lavender', bg: 'bg-purple-400', title: 'بنفش' },
    { color: 'peach', bg: 'bg-orange-400', title: 'نارنجی' },
    { color: 'slate', bg: 'bg-slate-700', title: 'تیره' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9000] select-none">
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-full shadow-2xl text-white">
        {/* New Note Button with flyout */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playPop();
              onNewNote();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowColorFlyout(!showColorFlyout);
            }}
            title="ایجاد یادداشت جدید (کلیک راست برای انتخاب رنگ)"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-sky-500/30 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-bold">نوت جدید</span>
          </button>

          {/* Quick Color Picker Flyout */}
          {showColorFlyout && (
            <div className="absolute bottom-12 right-0 p-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex gap-2 animate-fade-in">
              {colors.map((c) => (
                <button
                  key={c.color}
                  title={c.title}
                  onClick={() => {
                    sounds.playPop();
                    onNewNote(c.color);
                    setShowColorFlyout(false);
                  }}
                  className={`w-6 h-6 rounded-full ${c.bg} hover:scale-125 transition-transform`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onOpenSearch();
          }}
          title="جستجو در بین تمام یادداشت‌ها"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs font-medium"
        >
          <Search className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">جستجو</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />

        {/* Minimize All to Bubbles or Restore */}
        <button
          onClick={() => {
            sounds.playBubble();
            onToggleMinimizeAll();
          }}
          title={
            bubbleCount > 0
              ? 'بازگردانی تمام یادداشت‌ها از حالت حباب'
              : 'کوچک‌کردن تمام نوت‌ها به حباب شناور'
          }
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-xs"
        >
          <span className="text-sm">🫧</span>
          <span className="hidden md:inline">
            {bubbleCount > 0 ? 'بازکردن حباب‌ها' : 'حالت حباب'}
          </span>
        </button>

        {/* Auto Arrange on Screen */}
        <button
          onClick={() => {
            sounds.playPop();
            onAutoArrange();
          }}
          title="چیدمان خودکار و مرتب‌سازی نوت‌ها در صفحه"
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Toggle Phone Simulator vs Full Screen Mode */}
        <button
          onClick={() => {
            sounds.playPop();
            onToggleViewMode();
          }}
          title={
            viewMode === 'android-phone'
              ? 'نمایش در حالت تمام‌صفحه دسکتاپ'
              : 'نمایش در حالت شبیه‌ساز گوشی اندروید'
          }
          className="p-2 rounded-full text-slate-300 hover:text-sky-400 hover:bg-slate-800/80 transition-colors"
        >
          {viewMode === 'android-phone' ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'غیرفعال کردن صدا' : 'فعال کردن صدا'}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Floating Quick Icon Toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            onToggleFloatingTrigger();
          }}
          title={
            showFloatingTrigger
              ? 'مخفی کردن آیکون شناور سنجاقک روی صفحه'
              : 'نمایش آیکون شناور سنجاقک روی صفحه'
          }
          className={`p-2 rounded-full transition-colors ${
            showFloatingTrigger
              ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/80'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <span className="text-xs">📌</span>
        </button>

        {/* Settings modal */}
        <button
          onClick={() => {
            sounds.playPop();
            onOpenSettings();
          }}
          title="تنظیمات، تصاویر پس‌زمینه و پشتیبان‌گیری"
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
