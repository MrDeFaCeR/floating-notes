import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Star,
  CheckSquare,
  FileText,
  Pin,
  ExternalLink,
  Tag,
  Trash2,
  Calendar,
} from 'lucide-react';
import { NoteColor, StickyNote } from '../types/note';
import { formatPersianRelativeDate, toPersianDigits } from '../utils/date';
import { sounds } from '../utils/sound';

interface SearchAndFilterModalProps {
  isOpen: boolean;
  notes: StickyNote[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onClose: () => void;
  onJumpToNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const COLOR_NAME_MAP: Record<NoteColor, { label: string; bg: string; dot: string }> = {
  yellow: { label: 'زرد', bg: 'bg-amber-100 dark:bg-amber-950/60', dot: 'bg-amber-400' },
  mint: { label: 'سبز', bg: 'bg-emerald-100 dark:bg-emerald-950/60', dot: 'bg-emerald-400' },
  sky: { label: 'آبی', bg: 'bg-sky-100 dark:bg-sky-950/60', dot: 'bg-sky-400' },
  lavender: { label: 'بنفش', bg: 'bg-purple-100 dark:bg-purple-950/60', dot: 'bg-purple-400' },
  peach: { label: 'نارنجی', bg: 'bg-orange-100 dark:bg-orange-950/60', dot: 'bg-orange-400' },
  slate: { label: 'تیره', bg: 'bg-slate-800 dark:bg-slate-900', dot: 'bg-slate-500' },
};

export const SearchAndFilterModal: React.FC<SearchAndFilterModalProps> = ({
  isOpen,
  notes,
  searchQuery,
  onSearchQueryChange,
  onClose,
  onJumpToNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [selectedColor, setSelectedColor] = useState<NoteColor | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'checklist' | 'text'>('all');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes.filter((note) => {
      // Keyword search
      if (q) {
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const tagMatch = note.tags.some((t) => t.toLowerCase().includes(q));
        const checkMatch = note.checklist.some((c) => c.text.toLowerCase().includes(q));
        if (!titleMatch && !contentMatch && !tagMatch && !checkMatch) {
          return false;
        }
      }

      // Color filter
      if (selectedColor !== 'all' && note.color !== selectedColor) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !note.tags.includes(selectedTag)) {
        return false;
      }

      // Starred filter
      if (onlyStarred && !note.isFavorite) {
        return false;
      }

      // Type filter
      if (filterType === 'checklist' && !note.isChecklist) return false;
      if (filterType === 'text' && note.isChecklist) return false;

      return true;
    });
  }, [notes, searchQuery, selectedColor, selectedTag, onlyStarred, filterType]);

  if (!isOpen) return null;

  // Helper to highlight matching text
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim() || !text) return text;
    const q = searchQuery.trim();
    const regex = new RegExp(`(${q})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-300 dark:bg-amber-500/50 text-slate-900 dark:text-amber-100 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                جستجو در یادداشت‌های سنجاقک
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پیدا کردن سریع نوت‌ها بر اساس کلمات کلیدی، عناوین، برچسب‌ها و چک‌لیست
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

        {/* Search Input Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex items-center">
            <Search className="absolute right-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="جستجوی عنوان، متن یا چک‌لیست..."
              className="w-full pl-10 pr-11 py-3 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange('')}
                className="absolute left-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Badges and Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-xs">
            {/* Type selector */}
            <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setFilterType('checklist')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'checklist'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                چک‌لیست
              </button>
              <button
                onClick={() => setFilterType('text')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'text'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                متن
              </button>
            </div>

            {/* Starred filter button */}
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
                onlyStarred
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-medium'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
              نشان‌شده‌ها
            </button>

            {/* Color chips */}
            <div className="flex items-center gap-1.5 mr-auto">
              {(['all', 'yellow', 'mint', 'sky', 'lavender', 'peach', 'slate'] as const).map((c) => (
                <button
                  key={c}
                  title={c === 'all' ? 'همه رنگ‌ها' : COLOR_NAME_MAP[c].label}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    c === 'all'
                      ? 'bg-gradient-to-tr from-sky-400 via-amber-400 to-rose-400 flex items-center justify-center text-[9px] font-bold text-white'
                      : COLOR_NAME_MAP[c].dot
                  } ${
                    selectedColor === c
                      ? 'border-slate-900 dark:border-white scale-110 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {c === 'all' && '✦'}
                </button>
              ))}
            </div>
          </div>

          {/* Tags list if available */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3" /> برچسب:
              </span>
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 ${
                  selectedTag === 'all'
                    ? 'bg-sky-500 text-white font-medium'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                همه برچسب‌ها
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 ${
                    selectedTag === t
                      ? 'bg-sky-500 text-white font-medium'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Counter Banner */}
        <div className="px-5 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>
            {filteredNotes.length === 0
              ? 'هیچ یادداشتی یافت نشد'
              : `${toPersianDigits(filteredNotes.length)} یادداشت پیدا شد`}
          </span>
          {searchQuery && (
            <span className="text-sky-600 dark:text-sky-400 font-medium">
              عبارت جستجو: «{searchQuery}»
            </span>
          )}
        </div>

        {/* Notes Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                نتیجه‌ای برای جستجوی شما یافت نشد
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                کلمات کلیدی دیگری را جستجو کنید یا فیلترهای رنگ و دسته‌بندی را تغییر دهید.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const colorInfo = COLOR_NAME_MAP[note.color] || COLOR_NAME_MAP.yellow;
              const pendingChecklist = note.isChecklist
                ? note.checklist.filter((c) => !c.done).length
                : 0;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    sounds.playPop();
                    onJumpToNote(note.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg group relative ${colorInfo.bg} border-slate-200 dark:border-slate-800`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-1">
                        {note.isChecklist ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                        )}
                        <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                          {note.title ? highlightMatch(note.title) : 'یادداشت بدون عنوان'}
                        </h3>
                        {note.isFavorite && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                        )}
                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        )}
                      </div>

                      {/* Content Preview */}
                      {note.isChecklist ? (
                        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 my-2">
                          {note.checklist.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 truncate">
                              <span
                                className={`w-3.5 h-3.5 rounded text-[9px] flex items-center justify-center border ${
                                  item.done
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-400'
                                }`}
                              >
                                {item.done ? '✓' : ''}
                              </span>
                              <span className={item.done ? 'line-through opacity-50' : ''}>
                                {highlightMatch(item.text)}
                              </span>
                            </div>
                          ))}
                          {note.checklist.length > 3 && (
                            <span className="text-[11px] text-slate-400 block pt-0.5">
                              + {toPersianDigits(note.checklist.length - 3)} مورد دیگر...
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 my-2 leading-relaxed">
                          {highlightMatch(note.content || 'یادداشت متنی خالی')}
                        </p>
                      )}

                      {/* Footer: Tags, Date, State */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-black/5 dark:border-white/5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 opacity-70" />
                          {formatPersianRelativeDate(note.updatedAt)}
                        </span>

                        {note.isChecklist && (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {toPersianDigits(note.checklist.length - pendingChecklist)} از{' '}
                            {toPersianDigits(note.checklist.length)} انجام شده
                          </span>
                        )}

                        {note.isMinimized && (
                          <span className="text-purple-600 dark:text-purple-400">
                            🫧 در حالت حباب
                          </span>
                        )}

                        {/* Tags */}
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]"
                          >
                            #{highlightMatch(tag)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick jump CTA */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        title="نمایش نوت در صفحه شناور"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playPop();
                          onJumpToNote(note.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        مشاهده
                      </button>

                      <button
                        title="حذف این نوت"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playTrash();
                          onDeleteNote(note.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
