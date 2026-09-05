import { useEffect } from 'react';

export function useKeyboard({
  onNewTask,
  onSearchFocus,
  onViewChange,
  onToggleTheme,
  onToggleHelp,
  onToggleCommandPalette,
  onEscape
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Check if user is typing in an input, textarea, or contentEditable
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Escape always works
      if (e.key === 'Escape') {
        if (onEscape) onEscape();
        if (isInput) target.blur();
        return;
      }

      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggleCommandPalette) onToggleCommandPalette();
        return;
      }

      // If user is currently typing in an input field, do not trigger single-key hotkeys
      if (isInput) return;

      // Single-key hotkeys
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (onNewTask) onNewTask();
      } else if (e.key === '/') {
        e.preventDefault();
        if (onSearchFocus) onSearchFocus();
      } else if (e.key === '1') {
        e.preventDefault();
        if (onViewChange) onViewChange('list');
      } else if (e.key === '2') {
        e.preventDefault();
        if (onViewChange) onViewChange('kanban');
      } else if (e.key === '3') {
        e.preventDefault();
        if (onViewChange) onViewChange('analytics');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (onToggleTheme) onToggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        if (onToggleHelp) onToggleHelp();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onSearchFocus, onViewChange, onToggleTheme, onToggleHelp, onToggleCommandPalette, onEscape]);
}
