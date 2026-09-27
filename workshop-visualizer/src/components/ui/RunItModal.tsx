'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useIsPresent } from 'framer-motion';
import type { RunInfo } from '@/data/runInfo';
import { KIT_FOLDER, KIT_ZIP_URL, kitFileUrl } from '@/lib/kitUrls';

const spring = { type: 'spring' as const, damping: 22, stiffness: 220 };
const fastExit = { duration: 0.15 };
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// The "Run it yourself" box: how to run this lesson's program on your own computer.
// Styled like the Quick check quiz (src/components/ui/LessonQuiz.tsx).
export default function RunItModal({ info, onClose }: { info: RunInfo; onClose: () => void }) {
  const command = `python run.py ${info.fileName}`;
  const folder = `${KIT_FOLDER}/${info.fileName.split('/').slice(0, -1).join('/')}/`;
  const [copied, setCopied] = useState(false);
  const commandRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // False while the closing animation plays: the box is on its way out and must not
  // catch keys or clicks meant for the page any more.
  const isPresent = useIsPresent();
  const shortened = info.runnableCode !== undefined && info.runnableCode !== info.shownCode;

  // While open: Esc closes, Tab stays inside the box, and no key reaches the step
  // navigation behind it (arrows, space, F).
  useEffect(() => {
    if (!isPresent) return;
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapTab(e, dialogRef.current);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isPresent, onClose]);

  // Move keyboard focus into the box, so Tab starts at its buttons (not the page behind it).
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // No clipboard access (e.g. not https): select the text so Ctrl+C / Cmd+C works.
      const el = commandRef.current;
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: fastExit }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.96, transition: fastExit }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-2xl max-h-full flex flex-col rounded-2xl border border-white/10 bg-navy-800 shadow-2xl overflow-hidden outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Run it yourself"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[16px] font-semibold text-accent-green whitespace-nowrap">💻 Run it yourself</span>
            <span className="font-mono text-[14px] text-white/45 truncate">{info.fileName}</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <Section n={1} title="Get the course code">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={KIT_ZIP_URL}
                download
                className="px-4 py-2 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green/30 text-[15px] font-semibold transition-colors"
              >
                ⬇ Download zip
              </a>
              <Link href="/part1/setup" onClick={onClose} className="text-[14px] text-white/60 hover:text-white">
                First time? Do the <span className="text-accent-blue">Get Set Up</span> lesson →
              </Link>
            </div>
          </Section>

          <Section n={2} title={`Run this in the ${KIT_FOLDER} folder`}>
            <div className="flex items-stretch rounded-lg border border-white/10 bg-black/30 overflow-hidden">
              <code ref={commandRef} className="flex-1 px-4 py-2.5 font-mono text-[15px] text-white select-all">
                {command}
              </code>
              <button
                onClick={copy}
                className="px-4 text-[14px] font-semibold border-l border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-1.5 text-[14px] text-white/45">
              On a Mac you may need <code className="font-mono text-white/65">python3</code> instead of{' '}
              <code className="font-mono text-white/65">python</code>.
            </div>
            {info.needsInput && (
              <Note icon="⌨️">This program waits for you to type. Type in the terminal and press Enter.</Note>
            )}
          </Section>

          <Section n={3} title="What you'll see">
            <p className="text-[15px] leading-relaxed text-white/80">{info.expect}</p>
          </Section>

          <Section
            n={4}
            title="Try this"
            hint={info.needsInput ? 'type it in, or change the code and run again' : 'change the code, save, run again'}
          >
            <ul className="space-y-1.5">
              {info.tryThis.map((idea) => (
                <li key={idea} className="flex gap-2 text-[15px] leading-relaxed text-white/80">
                  <span className="text-accent-green">•</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer: what's different about the download, plus a fresh copy of this one file */}
        <div className="px-6 py-3 border-t border-white/10 text-[14px] text-white/45 space-y-1">
          {shortened && (
            <div>
              📋 The download has the full tools list that the lesson shortened to{' '}
              <code className="font-mono text-white/65">...</code> to fit on screen.
            </div>
          )}
          <div>
            Already have the zip?{' '}
            <a href={kitFileUrl(info.fileName)} download className="text-white/65 underline underline-offset-2 hover:text-white">
              Download just this file
            </a>{' '}
            for a fresh copy (it goes in <code className="font-mono">{folder}</code>).
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Keep Tab / Shift+Tab cycling through the box's own buttons and links. */
function trapTab(e: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return;
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const inside = active instanceof Node && dialog.contains(active) && active !== dialog;
  if (e.shiftKey && (!inside || active === first)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (!inside || active === last)) {
    e.preventDefault();
    first.focus();
  }
}

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex gap-3">
      <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full border border-accent-green/50 text-accent-green text-[14px] font-bold flex items-center justify-center">
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-semibold text-white mb-2">
          {title}
          {hint && <span className="ml-2 text-[14px] font-normal text-white/45">({hint})</span>}
        </h3>
        {children}
      </div>
    </section>
  );
}

function Note({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="mt-2 flex gap-2 px-3 py-2 rounded-lg bg-accent-gold/10 text-[14px] text-amber-100">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}
