import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Pin } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FloatingTriggerButtonProps {
  isVisible: boolean;
  containerBounds?: { width: number; height: number };
  onNewNote: () => void;
  onDismiss: () => void;
}

const STORAGE_TRIGGER_POS_KEY = 'sanjaaghak_trigger_pos_v1';

export const FloatingTriggerButton: React.FC<FloatingTriggerButtonProps> = ({
  isVisible,
  containerBounds,
  onNewNote,
  onDismiss,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRIGGER_POS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return { x: 24, y: 140 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isInDismissZone, setIsInDismissZone] = useState(false);
  const dragMovedRef = useRef(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Save pos changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRIGGER_POS_KEY, JSON.stringify(pos));
    } catch {
      // Ignore
    }
  }, [pos]);

  // When icon becomes visible again, make sure it is not stuck at the bottom dismiss zone
  useEffect(() => {
    if (isVisible) {
      setPos((prev) => {
        const screenH = containerBounds?.height || window.innerHeight;
        if (prev.y > screenH - 160) {
          return { x: prev.x || 24, y: 140 };
        }
        return prev;
      });
    }
  }, [isVisible, containerBounds?.height]);

  if (!isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragMovedRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragMovedRef.current = true;
    }

    const screenW = containerBounds?.width || window.innerWidth;
    const screenH = containerBounds?.height || window.innerHeight;

    let newX = dragRef.current.initialX + deltaX;
    let newY = dragRef.current.initialY + deltaY;

    // Boundaries
    newX = Math.max(10, Math.min(newX, screenW - 58));
    newY = Math.max(30, Math.min(newY, screenH - 58));

    setPos({ x: Math.round(newX), y: Math.round(newY) });

    // Check if dragging near the bottom center dismiss zone
    const centerX = screenW / 2;
    const distFromBottom = screenH - e.clientY;
    const distFromCenterX = Math.abs(e.clientX - centerX);

    if (distFromBottom < 120 && distFromCenterX < 90) {
      setIsInDismissZone(true);
    } else {
      setIsInDismissZone(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }

    const screenW = containerBounds?.width || window.innerWidth;
    const screenH = containerBounds?.height || window.innerHeight;
    const centerX = screenW / 2;
    const distFromBottom = screenH - e.clientY;
    const distFromCenterX = Math.abs(e.clientX - centerX);

    // If dropped in bottom dismiss zone -> dismiss the icon!
    if (distFromBottom < 120 && distFromCenterX < 90) {
      sounds.playTrash();
      setIsInDismissZone(false);
      onDismiss();
      return;
    }

    setIsInDismissZone(false);

    // If merely clicked without significant drag -> open new note
    if (!dragMovedRef.current) {
      sounds.playPop();
      onNewNote();
    } else {
      // Optional subtle snap to edge (left or right)
      const targetX = pos.x < screenW / 2 ? 14 : screenW - 62;
      setPos({ x: targetX, y: pos.y });
    }
  };

  return (
    <>
      {/* Bottom Dismiss Zone Target (Visible while dragging) */}
      {isDragging && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] flex flex-col items-center pointer-events-none transition-all duration-200 animate-fade-in">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-2xl ${
              isInDismissZone
                ? 'bg-rose-600 border-rose-300 text-white scale-125 shadow-rose-600/50 ring-8 ring-rose-500/20'
                : 'bg-slate-900/90 border-slate-600 text-slate-300 scale-100 backdrop-blur-md'
            }`}
          >
            <X className={`w-7 h-7 stroke-[2.5] ${isInDismissZone ? 'animate-bounce' : ''}`} />
          </div>
          <span
            className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-colors ${
              isInDismissZone
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900/80 text-slate-300 border border-slate-700'
            }`}
          >
            {isInDismissZone ? 'رها کنید تا حذف شود' : 'بکشید به اینجا برای حذف'}
          </span>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          zIndex: 9998,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`absolute top-0 left-0 transition-transform select-none ${
          isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-110 active:scale-95'
        }`}
      >
        <div
          title="افزودن نوت جدید (بکشید به هر جای صفحه یا به پایین صفحه برای حذف)"
          className={`relative w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all ${
            isInDismissZone
              ? 'bg-rose-500 text-white ring-4 ring-rose-300 scale-90'
              : 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 ring-4 ring-amber-300/60 shadow-amber-500/30'
          }`}
        >
          {/* Pulsing halo */}
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20 pointer-events-none" />

          {/* Icon */}
          <Plus className="w-6 h-6 stroke-[3]" />

          {/* Mini pin badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] shadow border border-white">
            <Pin className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>
    </>
  );
};
