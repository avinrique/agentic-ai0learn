'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useFullscreen() {
  const { isFullscreen, setFullscreen } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current ?? document.documentElement;
    try {
      await el.requestFullscreen();
      setFullscreen(true);
    } catch {
      // Fallback: just set state without browser fullscreen
      setFullscreen(true);
    }
  }, [setFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    setFullscreen(false);
  }, [setFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Sync state when user exits fullscreen with Escape
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setFullscreen]);

  // Keyboard shortcut: F key toggles fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

  return { isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen, containerRef };
}
