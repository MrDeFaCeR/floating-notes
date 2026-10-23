import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppSettings, NoteColor, StickyNote, ViewMode } from './types/note';
import {
  DEFAULT_SETTINGS,
  INITIAL_SAMPLE_NOTES,
  loadNotes,
  loadSettings,
  saveNotes,
  saveSettings,
} from './utils/storage';
import { sounds } from './utils/sound';
import { FloatingNoteItem } from './components/FloatingNoteItem';
import { FloatingBubble } from './components/FloatingBubble';
import { FloatingControlDock } from './components/FloatingControlDock';
import { SearchAndFilterModal } from './components/SearchAndFilterModal';
import { AndroidHomeScreen } from './components/AndroidHomeScreen';
import { AndroidSettingsModal } from './components/AndroidSettingsModal';
import { FloatingTriggerButton } from './components/FloatingTriggerButton';

export default function App() {
  const [notes, setNotes] = useState<StickyNote[]>(() => loadNotes());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [topZIndex, setTopZIndex] = useState(20);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [launchToast, setLaunchToast] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Persist notes whenever changed
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist settings whenever changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Bring note to front
  const focusNote = useCallback(
    (id: string) => {
      setActiveNoteId(id);
      setTopZIndex((prev) => {
        const nextZ = prev + 1;
        setNotes((currentNotes) =>
          currentNotes.map((n) => (n.id === id ? { ...n, zIndex: nextZ } : n))
        );
        return nextZ;
      });
    },
    []
  );

  // Create new note
  const handleCreateNote = (chosenColor?: NoteColor) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);

    // Stagger position
    const offsetX = 60 + ((notes.length * 35) % 300);
    const offsetY = 70 + ((notes.length * 35) % 250);

    const newNote: StickyNote = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: 'یادداشت جدید',
      content: '',
      isChecklist: false,
      checklist: [],
      color: chosenColor || settings.defaultColor || 'yellow',
      x: offsetX,
      y: offsetY,
      width: 290,
      height: 270,
      zIndex: nextZ,
      isPinned: false,
      isMinimized: false,
      isCollapsed: false,
      opacity: settings.defaultOpacity || 0.95,
      fontSize: 'sm',
      tags: [],
      isFavorite: false,
      isLocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  // Update existing note
  const handleUpdateNote = (updatedNote: StickyNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Duplicate note
  const handleDuplicateNote = (noteToDup: StickyNote) => {
    sounds.playPop();
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);

    const dup: StickyNote = {
      ...noteToDup,
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: noteToDup.title ? `${noteToDup.title} (کپی)` : 'کپی یادداشت',
      x: Math.min(noteToDup.x + 30, window.innerWidth - 320),
      y: Math.min(noteToDup.y + 30, window.innerHeight - 300),
      zIndex: nextZ,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [dup, ...prev]);
  };

  // Expand bubble back to full note
  const handleExpandBubble = (id: string) => {
    focusNote(id);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isMinimized: false } : n))
    );
  };

  // Update bubble position
  const handleUpdateBubblePosition = (id: string, pos: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bubblePosition: pos } : n))
    );
  };

  // Toggle minimize all notes to bubbles or restore
  const handleToggleMinimizeAll = () => {
    const hasExpanded = notes.some((n) => !n.isMinimized);
    setNotes((prev) =>
      prev.map((n, idx) => ({
        ...n,
        isMinimized: hasExpanded,
        bubblePosition: hasExpanded
          ? { x: 16, y: 70 + (idx % 8) * 65 }
          : n.bubblePosition,
      }))
    );
  };

  // Auto-arrange notes in a neat grid across the screen
  const handleAutoArrange = () => {
    const containerW = containerRef.current?.clientWidth || window.innerWidth;
    const paddingX = 40;
    const paddingY = 80;
    const cardWidth = 300;
    const cardHeight = 280;
    const gap = 20;

    const cols = Math.max(1, Math.floor((containerW - paddingX * 2) / (cardWidth + gap)));

    let visibleIndex = 0;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.isMinimized) return n;
        const col = visibleIndex % cols;
        const row = Math.floor(visibleIndex / cols);
        visibleIndex++;

        return {
          ...n,
          x: paddingX + col * (cardWidth + gap),
          y: paddingY + row * (cardHeight + gap),
          width: cardWidth,
          height: cardHeight,
          isCollapsed: false,
        };
      })
    );
  };

  // Jump to note from search results
  const handleJumpToNote = (id: string) => {
    focusNote(id);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isMinimized: false, isCollapsed: false } : n))
    );
  };

  // Toggle pin on a note
  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Restore backup
  const handleRestoreBackup = (restoredNotes: StickyNote[], restoredSettings?: AppSettings) => {
    setNotes(restoredNotes);
    if (restoredSettings) setSettings(restoredSettings);
  };

  // Reset to initial sample notes
  const handleResetDefaults = () => {
    setNotes(INITIAL_SAMPLE_NOTES);
    setSettings(DEFAULT_SETTINGS);
  };

  // Launch / Open App from Android Phone Screen
  const handleLaunchApp = () => {
    sounds.playPop();
    setSettings((prev) => ({ ...prev, showFloatingTrigger: true }));
    setShowUndoToast(false);
    setLaunchToast(true);
    setTimeout(() => setLaunchToast(false), 2500);
  };

  const bubbleNotes = notes.filter((n) => n.isMinimized);
  const openNotes = notes.filter((n) => !n.isMinimized);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none"
    >
      {/* Android Wallpaper & Interactive Home Screen Background */}
      <AndroidHomeScreen
        wallpaper={settings.wallpaper}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLaunchApp={handleLaunchApp}
        onNewNote={() => handleCreateNote()}
      />

      {/* Floating Quick Action Trigger Icon (Draggable & dismissable at bottom) */}
      <FloatingTriggerButton
        isVisible={settings.showFloatingTrigger}
        containerBounds={{
          width: containerRef.current?.clientWidth || window.innerWidth,
          height: containerRef.current?.clientHeight || window.innerHeight,
        }}
        onNewNote={() => handleCreateNote()}
        onDismiss={() => {
          setSettings((prev) => ({ ...prev, showFloatingTrigger: false }));
          setShowUndoToast(true);
        }}
      />

      {/* Floating Bubbles Layer (Chat-Heads) */}
      {bubbleNotes.map((note) => (
        <FloatingBubble
          key={note.id}
          note={note}
          containerBounds={{
            width: containerRef.current?.clientWidth || window.innerWidth,
            height: containerRef.current?.clientHeight || window.innerHeight,
          }}
          onExpand={handleExpandBubble}
          onDelete={handleDeleteNote}
          onUpdatePosition={handleUpdateBubblePosition}
        />
      ))}

      {/* Floating Sticky Notes Layer (Freely movable & resizable) */}
      {openNotes.map((note) => (
        <FloatingNoteItem
          key={note.id}
          note={note}
          isActive={activeNoteId === note.id}
          searchQuery={searchQuery}
          containerBounds={{
            width: containerRef.current?.clientWidth || window.innerWidth,
            height: containerRef.current?.clientHeight || window.innerHeight,
          }}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onFocus={focusNote}
          onDuplicate={handleDuplicateNote}
        />
      ))}

      {/* Bottom Floating Control Dock */}
      <FloatingControlDock
        noteCount={openNotes.length}
        bubbleCount={bubbleNotes.length}
        viewMode={settings.viewMode}
        soundEnabled={settings.soundEnabled}
        showFloatingTrigger={settings.showFloatingTrigger}
        onNewNote={handleCreateNote}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMinimizeAll={handleToggleMinimizeAll}
        onAutoArrange={handleAutoArrange}
        onToggleViewMode={() => {
          setSettings((prev) => ({
            ...prev,
            viewMode:
              prev.viewMode === 'android-phone'
                ? 'fullscreen-overlay'
                : 'android-phone',
          }));
        }}
        onToggleSound={() => {
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
        }}
        onToggleFloatingTrigger={() => {
          setSettings((prev) => ({
            ...prev,
            showFloatingTrigger: !prev.showFloatingTrigger,
          }));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Search & Filter Modal (With Persian keyword matching & highlights) */}
      <SearchAndFilterModal
        isOpen={isSearchOpen}
        notes={notes}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClose={() => setIsSearchOpen(false)}
        onJumpToNote={handleJumpToNote}
        onDeleteNote={handleDeleteNote}
        onTogglePin={handleTogglePin}
      />

      {/* Settings & Wallpaper Modal */}
      <AndroidSettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        notes={notes}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={setSettings}
        onRestoreBackup={handleRestoreBackup}
        onResetDefaults={handleResetDefaults}
      />

      {/* Toast when app launched from home screen and floating icon appears */}
      {launchToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[10002] px-4 py-2 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm shadow-2xl border border-amber-500/50 backdrop-blur-xl flex items-center gap-2.5 animate-fade-in ring-4 ring-amber-500/10">
          <span className="text-base">📌</span>
          <span className="font-medium text-amber-200">آیکون شناور سنجاقک روی صفحه ظاهر شد.</span>
        </div>
      )}

      {/* Android Material Toast when Floating Trigger Icon is Dismissed */}
      {showUndoToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10002] px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm shadow-2xl border border-slate-700/80 backdrop-blur-xl flex items-center gap-3 animate-fade-in">
          <span>آیکون شناور سنجاقک با کشیدن به پایین حذف شد.</span>
          <button
            onClick={() => {
              sounds.playPop();
              setSettings((prev) => ({ ...prev, showFloatingTrigger: true }));
              setShowUndoToast(false);
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 transition-colors"
          >
            بازگردانی
          </button>
          <button
            onClick={() => setShowUndoToast(false)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
