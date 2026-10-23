import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pin,
  PinOff,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  CheckSquare,
  AlignLeft,
  Plus,
  X,
  Palette,
  Star,
  Lock,
  Unlock,
  Move,
  Sliders,
  Check,
} from 'lucide-react';
import { ChecklistItem, NoteColor, StickyNote } from '../types/note';
import { formatPersianRelativeDate, toPersianDigits } from '../utils/date';
import { sounds } from '../utils/sound';

interface FloatingNoteItemProps {
  note: StickyNote;
  isActive: boolean;
  searchQuery?: string;
  containerBounds?: { width: number; height: number };
  onUpdate: (updatedNote: StickyNote) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onDuplicate: (note: StickyNote) => void;
}

const COLOR_MAP: Record<NoteColor, {
  bg: string;
  header: string;
  text: string;
  border: string;
  accent: string;
  inputBg: string;
  name: string;
}> = {
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-950/85',
    header: 'bg-amber-200/80 dark:bg-amber-900/60',
    text: 'text-amber-950 dark:text-amber-100',
    border: 'border-amber-300 dark:border-amber-700/60',
    accent: 'text-amber-700 dark:text-amber-300',
    inputBg: 'bg-amber-50/60 dark:bg-amber-900/30',
    name: 'زرد پست‌ایت',
  },
  mint: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/85',
    header: 'bg-emerald-200/80 dark:bg-emerald-900/60',
    text: 'text-emerald-950 dark:text-emerald-100',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    accent: 'text-emerald-700 dark:text-emerald-300',
    inputBg: 'bg-emerald-50/60 dark:bg-emerald-900/30',
    name: 'سبز نعنایی',
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-950/85',
    header: 'bg-sky-200/80 dark:bg-sky-900/60',
    text: 'text-sky-950 dark:text-sky-100',
    border: 'border-sky-300 dark:border-sky-700/60',
    accent: 'text-sky-700 dark:text-sky-300',
    inputBg: 'bg-sky-50/60 dark:bg-sky-900/30',
    name: 'آبی آسمانی',
  },
  lavender: {
    bg: 'bg-purple-100 dark:bg-purple-950/85',
    header: 'bg-purple-200/80 dark:bg-purple-900/60',
    text: 'text-purple-950 dark:text-purple-100',
    border: 'border-purple-300 dark:border-purple-700/60',
    accent: 'text-purple-700 dark:text-purple-300',
    inputBg: 'bg-purple-50/60 dark:bg-purple-900/30',
    name: 'بنفش یاسی',
  },
  peach: {
    bg: 'bg-orange-100 dark:bg-orange-950/85',
    header: 'bg-orange-200/80 dark:bg-orange-900/60',
    text: 'text-orange-950 dark:text-orange-100',
    border: 'border-orange-300 dark:border-orange-700/60',
    accent: 'text-orange-700 dark:text-orange-300',
    inputBg: 'bg-orange-50/60 dark:bg-orange-900/30',
    name: 'هلویی نارنجی',
  },
  slate: {
    bg: 'bg-slate-800 dark:bg-slate-900/90',
    header: 'bg-slate-700/80 dark:bg-slate-800/80',
    text: 'text-slate-100 dark:text-slate-100',
    border: 'border-slate-600 dark:border-slate-700',
    accent: 'text-slate-300 dark:text-slate-300',
    inputBg: 'bg-slate-700/50 dark:bg-slate-800/50',
    name: 'مشکی تیره',
  },
};

const COLOR_KEYS: NoteColor[] = ['yellow', 'mint', 'sky', 'lavender', 'peach', 'slate'];

export const FloatingNoteItem: React.FC<FloatingNoteItemProps> = ({
  note,
  isActive,
  searchQuery,
  containerBounds,
  onUpdate,
  onDelete,
  onFocus,
  onDuplicate,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    initialW: number;
    initialH: number;
    direction: string;
  }>({ startX: 0, startY: 0, initialW: 0, initialH: 0, direction: '' });

  const noteElementRef = useRef<HTMLDivElement>(null);

  const styleTheme = COLOR_MAP[note.color] || COLOR_MAP.yellow;

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag from header or grab handle and if not pinned
    if (note.isPinned) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, .no-drag')) {
      return;
    }

    onFocus(note.id);
    setIsDragging(true);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: note.x,
      initialY: note.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    let newX = dragRef.current.initialX + deltaX;
    let newY = dragRef.current.initialY + deltaY;

    // Boundary constraints
    const minX = 0;
    const minY = 32;
    const maxX = containerBounds ? Math.max(100, containerBounds.width - 60) : window.innerWidth - 60;
    const maxY = containerBounds ? Math.max(100, containerBounds.height - 60) : window.innerHeight - 60;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    onUpdate({
      ...note,
      x: Math.round(newX),
      y: Math.round(newY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Resize handler
  const startResize = (e: React.PointerEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus(note.id);
    setIsResizing(direction);

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialW: note.width,
      initialH: note.height,
      direction,
    };

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;

    let newW = resizeRef.current.initialW;
    let newH = resizeRef.current.initialH;

    if (resizeRef.current.direction.includes('e')) {
      newW = Math.max(240, Math.min(600, resizeRef.current.initialW + deltaX));
    } else if (resizeRef.current.direction.includes('w')) {
      newW = Math.max(240, Math.min(600, resizeRef.current.initialW - deltaX));
    }

    if (resizeRef.current.direction.includes('s')) {
      newH = Math.max(180, Math.min(700, resizeRef.current.initialH + deltaY));
    }

    onUpdate({
      ...note,
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(null);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Checklist actions
  const toggleChecklistItem = (itemId: string) => {
    sounds.playCheck();
    const updated = note.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdate({ ...note, checklist: updated, updatedAt: Date.now() });
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    sounds.playPop();
    const newItem: ChecklistItem = {
      id: 'chk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      text: newChecklistText.trim(),
      done: false,
    };
    onUpdate({
      ...note,
      checklist: [...note.checklist, newItem],
      updatedAt: Date.now(),
    });
    setNewChecklistText('');
  };

  const removeChecklistItem = (itemId: string) => {
    const updated = note.checklist.filter((item) => item.id !== itemId);
    onUpdate({ ...note, checklist: updated, updatedAt: Date.now() });
  };

  // Tag actions
  const addTag = () => {
    if (!newTagText.trim()) return;
    if (note.tags.includes(newTagText.trim())) {
      setNewTagText('');
      setShowAddTag(false);
      return;
    }
    onUpdate({
      ...note,
      tags: [...note.tags, newTagText.trim()],
      updatedAt: Date.now(),
    });
    setNewTagText('');
    setShowAddTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      ...note,
      tags: note.tags.filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    });
  };

  // Highlight search matching text
  const isMatch = searchQuery && searchQuery.trim().length > 0 && (
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.checklist.some((c) => c.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
    note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      ref={noteElementRef}
      onClick={() => onFocus(note.id)}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
        width: `${note.width}px`,
        height: note.isCollapsed ? 'auto' : `${note.height}px`,
        zIndex: note.zIndex,
        opacity: note.opacity,
      }}
      className={`absolute top-0 left-0 flex flex-col rounded-2xl border shadow-xl transition-shadow backdrop-blur-sm select-none ${
        styleTheme.bg
      } ${styleTheme.border} ${
        isActive ? 'ring-2 ring-sky-500/80 shadow-2xl scale-[1.005]' : 'shadow-md'
      } ${isMatch ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''}`}
    >
      {/* Top Header / Drag Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex items-center justify-between px-3 py-2 border-b rounded-t-2xl cursor-grab active:cursor-grabbing transition-colors ${
          styleTheme.header
        } ${styleTheme.border}`}
      >
        {/* Left side header buttons: Color, Opacity, Favorite */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Favorite button */}
          <button
            title={note.isFavorite ? 'حذف از نشان‌شده‌ها' : 'نشان کردن یادداشت'}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPop();
              onUpdate({ ...note, isFavorite: !note.isFavorite });
            }}
            className={`p-1 rounded-lg transition-transform hover:scale-110 active:scale-95 ${
              note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>

          {/* Color palette selector */}
          <div className="relative">
            <button
              title="تغییر رنگ نوت"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowOpacitySlider(false);
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex gap-1.5"
              >
                {COLOR_KEYS.map((c) => (
                  <button
                    key={c}
                    title={COLOR_MAP[c].name}
                    onClick={() => {
                      sounds.playPop();
                      onUpdate({ ...note, color: c });
                      setShowColorPicker(false);
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${
                      c === 'yellow'
                        ? 'bg-amber-300'
                        : c === 'mint'
                        ? 'bg-emerald-300'
                        : c === 'sky'
                        ? 'bg-sky-300'
                        : c === 'lavender'
                        ? 'bg-purple-300'
                        : c === 'peach'
                        ? 'bg-orange-300'
                        : 'bg-slate-700'
                    } ${note.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Opacity slider toggle */}
          <div className="relative">
            <button
              title="شفافیت نوت"
              onClick={(e) => {
                e.stopPropagation();
                setShowOpacitySlider(!showOpacitySlider);
                setShowColorPicker(false);
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {showOpacitySlider && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-50 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 min-w-[140px]"
              >
                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  <span>شفافیت نوت</span>
                  <span>{toPersianDigits(Math.round(note.opacity * 100))}%</span>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="1.0"
                  step="0.05"
                  value={note.opacity}
                  onChange={(e) =>
                    onUpdate({ ...note, opacity: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            )}
          </div>

          {/* Toggle Checklist / Plain text */}
          <button
            title={note.isChecklist ? 'تبدیل به متن ساده' : 'تبدیل به چک‌لیست'}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPop();
              onUpdate({ ...note, isChecklist: !note.isChecklist });
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {note.isChecklist ? (
              <AlignLeft className="w-3.5 h-3.5" />
            ) : (
              <CheckSquare className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Center Drag Handle Indicator */}
        <div className="flex items-center gap-1 text-xs opacity-60">
          <Move className="w-3 h-3 text-slate-600 dark:text-slate-300" />
          <span className="text-[10px] hidden sm:inline text-slate-600 dark:text-slate-300">شناور</span>
        </div>

        {/* Right side controls: Pin, Minimize to Bubble, Collapse, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Pin note */}
          <button
            title={note.isPinned ? 'آزاد کردن موقعیت' : 'قفل کردن موقعیت'}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPop();
              onUpdate({ ...note, isPinned: !note.isPinned });
            }}
            className={`p-1 rounded-lg transition-colors ${
              note.isPinned
                ? 'text-sky-600 dark:text-sky-400 bg-sky-200/50 dark:bg-sky-900/50'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {note.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5 opacity-60" />}
          </button>

          {/* Minimize to Bubble (Chat-Head) */}
          <button
            title="کوچک کردن به حباب شناور"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playBubble();
              onUpdate({
                ...note,
                isMinimized: true,
                bubblePosition: { x: Math.min(note.x, 30), y: note.y },
              });
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <span className="text-xs">🫧</span>
          </button>

          {/* Collapse / Shade up */}
          <button
            title={note.isCollapsed ? 'باز کردن' : 'جمع کردن نوت'}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ ...note, isCollapsed: !note.isCollapsed });
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {note.isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Delete note */}
          <button
            title="حذف یادداشت"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playTrash();
              onDelete(note.id);
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Body (Hidden when collapsed) */}
      {!note.isCollapsed && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden text-sm">
          {/* Note Title Input */}
          <div className="mb-2">
            <input
              type="text"
              value={note.title}
              placeholder="عنوان یادداشت..."
              onChange={(e) =>
                onUpdate({
                  ...note,
                  title: e.target.value,
                  updatedAt: Date.now(),
                })
              }
              className={`w-full bg-transparent font-bold text-base focus:outline-none placeholder-slate-400/70 border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 transition-colors ${styleTheme.text}`}
            />
          </div>

          {/* Note Content: Plain Text or Checklist */}
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
            {note.isChecklist ? (
              <div className="space-y-1.5">
                {note.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 group/item hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        item.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-400 dark:border-slate-500 hover:border-emerald-500'
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const updated = note.checklist.map((c) =>
                          c.id === item.id ? { ...c, text: e.target.value } : c
                        );
                        onUpdate({ ...note, checklist: updated, updatedAt: Date.now() });
                      }}
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${
                        item.done
                          ? 'line-through opacity-50 text-slate-500 dark:text-slate-400'
                          : styleTheme.text
                      }`}
                    />
                    <button
                      onClick={() => removeChecklistItem(item.id)}
                      className="opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add new checklist item */}
                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-300/40 dark:border-slate-700/40">
                  <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={newChecklistText}
                    placeholder="مورد جدید به لیست اضافه کنید..."
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    className={`flex-1 bg-transparent text-xs focus:outline-none placeholder-slate-400/80 ${styleTheme.text}`}
                  />
                  {newChecklistText.trim() && (
                    <button
                      onClick={addChecklistItem}
                      className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      ثبت
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                value={note.content}
                placeholder="متن یادداشت شناور خود را اینجا بنویسید..."
                onChange={(e) =>
                  onUpdate({
                    ...note,
                    content: e.target.value,
                    updatedAt: Date.now(),
                  })
                }
                className={`w-full h-full min-h-[90px] resize-none bg-transparent leading-relaxed focus:outline-none placeholder-slate-400/70 ${styleTheme.text}`}
              />
            )}
          </div>

          {/* Tags & Metadata Footer */}
          <div className="pt-2 mt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            {/* Tags area */}
            <div className="flex flex-wrap items-center gap-1 max-w-[70%]">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}

              {showAddTag ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagText}
                    placeholder="برچسب..."
                    autoFocus
                    onChange={(e) => setNewTagText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTag();
                      if (e.key === 'Escape') setShowAddTag(false);
                    }}
                    className="w-16 px-1 py-0.5 text-[10px] rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <button onClick={addTag} className="text-emerald-500">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTag(true)}
                  className="px-1 text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  + برچسب
                </button>
              )}
            </div>

            {/* Relative updated timestamp */}
            <div className="text-[10px] opacity-75 shrink-0">
              {formatPersianRelativeDate(note.updatedAt)}
            </div>
          </div>

          {/* Resizer Handles */}
          {/* Bottom-Right Handle */}
          <div
            onPointerDown={(e) => startResize(e, 'se')}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeUp}
            title="تغییر اندازه نوت"
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-slate-400/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="2" r="1" />
              <circle cx="6" cy="6" r="1" />
            </svg>
          </div>

          {/* Bottom-Left Handle */}
          <div
            onPointerDown={(e) => startResize(e, 'sw')}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeUp}
            title="تغییر اندازه نوت"
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize flex items-end justify-start p-0.5 text-slate-400/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <circle cx="6" cy="6" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="2" cy="2" r="1" />
            </svg>
          </div>

          {/* Bottom Edge Drag Resizer */}
          <div
            onPointerDown={(e) => startResize(e, 's')}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeUp}
            title="تغییر ارتفاع نوت"
            className="absolute bottom-0 inset-x-6 h-2 cursor-s-resize hover:bg-black/10 dark:hover:bg-white/10 rounded-b transition-colors"
          />
        </div>
      )}
    </div>
  );
};
