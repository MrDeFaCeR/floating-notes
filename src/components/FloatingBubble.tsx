import React, { useRef, useState } from 'react';
import { CheckSquare, FileText, X } from 'lucide-react';
import { StickyNote } from '../types/note';
import { sounds } from '../utils/sound';
import { toPersianDigits } from '../utils/date';

interface FloatingBubbleProps {
  note: StickyNote;
  containerBounds?: { width: number; height: number };
  onExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
}

const COLOR_BUBBLE_MAP: Record<string, { bg: string; ring: string; text: string }> = {
  yellow: { bg: 'bg-amber-400', ring: 'ring-amber-300', text: 'text-amber-950' },
  mint: { bg: 'bg-emerald-400', ring: 'ring-emerald-300', text: 'text-emerald-950' },
  sky: { bg: 'bg-sky-400', ring: 'ring-sky-300', text: 'text-sky-950' },
  lavender: { bg: 'bg-purple-400', ring: 'ring-purple-300', text: 'text-purple-950' },
  peach: { bg: 'bg-orange-400', ring: 'ring-orange-300', text: 'text-orange-950' },
  slate: { bg: 'bg-slate-700', ring: 'ring-slate-500', text: 'text-white' },
};

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  note,
  containerBounds,
  onExpand,
  onDelete,
  onUpdatePosition,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragMovedRef = useRef(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const position = note.bubblePosition || { x: 16, y: note.y || 100 };
  const colorStyle = COLOR_BUBBLE_MAP[note.color] || COLOR_BUBBLE_MAP.yellow;

  const pendingChecklistCount = note.isChecklist
    ? note.checklist.filter((c) => !c.done).length
    : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragMovedRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragMovedRef.current = true;
    }

    let newX = dragRef.current.initialX + deltaX;
    let newY = dragRef.current.initialY + deltaY;

    // Boundaries
    const maxX = containerBounds ? containerBounds.width - 60 : window.innerWidth - 60;
    const maxY = containerBounds ? containerBounds.height - 60 : window.innerHeight - 60;

    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(30, Math.min(newY, maxY));

    onUpdatePosition(note.id, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }

      // If user merely tapped (didn't drag around), expand the note
      if (!dragMovedRef.current) {
        sounds.playBubble();
        onExpand(note.id);
      } else {
        // Snap to nearest edge (left or right) for authentic Android floating chat-head behavior
        const maxX = containerBounds ? containerBounds.width - 64 : window.innerWidth - 64;
        const targetX = position.x < maxX / 2 ? 14 : maxX;
        onUpdatePosition(note.id, { x: targetX, y: position.y });
      }
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex: 9999 + (note.zIndex || 1),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute top-0 left-0 transition-transform duration-75 select-none"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-all ring-4 ${
          colorStyle.bg
        } ${colorStyle.ring} ${colorStyle.text}`}
      >
        {/* Note Icon */}
        {note.isChecklist ? (
          <CheckSquare className="w-6 h-6 drop-shadow-sm" />
        ) : (
          <FileText className="w-6 h-6 drop-shadow-sm" />
        )}

        {/* Badge counter if checklist has pending items */}
        {note.isChecklist && pendingChecklistCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
            {toPersianDigits(pendingChecklistCount)}
          </span>
        )}

        {/* Pin indicator badge */}
        {note.isPinned && (
          <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] shadow">
            📌
          </span>
        )}

        {/* Tooltip & Delete hover controls */}
        {isHovered && !isDragging && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 text-white px-2.5 py-1.5 rounded-xl text-xs shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto animate-fade-in border border-slate-700">
            <span className="max-w-[140px] truncate font-medium">
              {note.title || 'یادداشت بدون عنوان'}
            </span>
            <button
              title="حذف یادداشت"
              onClick={(e) => {
                e.stopPropagation();
                sounds.playTrash();
                onDelete(note.id);
              }}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
