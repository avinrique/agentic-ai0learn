'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// A simple, illustrative word-splitter. Real tokenizers (BPE etc.) learn their
// pieces from data and differ in the details, but the idea is the same:
// words, leading spaces, punctuation, and long words cut into sub-pieces.
// ---------------------------------------------------------------------------

const PIECE_COLORS = ['#4a9eff', '#a78bfa', '#4ade80', '#fbbf24', '#f472b6', '#22d3ee', '#f87171'];

const PREFIXES = ['under', 'over', 'pre', 'dis', 're', 'un'];
const SUFFIXES = ['ization', 'ation', 'tion', 'sion', 'ness', 'ment', 'able', 'ible', 'ing', 'ful', 'less', 'ous', 'est', 'ly', 'ed', 'er', 's'];

function splitLongWord(word: string): string[] {
  if (word.length <= 8) return [word];
  const lower = word.toLowerCase();
  const pieces: string[] = [];
  let start = 0;
  let end = word.length;
  const pre = PREFIXES.find((p) => lower.startsWith(p) && word.length - p.length >= 4);
  if (pre) { pieces.push(word.slice(0, pre.length)); start = pre.length; }
  const suf = SUFFIXES.find((sx) => lower.endsWith(sx) && end - start - sx.length >= 3);
  let tail = '';
  if (suf) { tail = word.slice(end - suf.length); end -= suf.length; }
  // Cut whatever is left in the middle into chunks of at most 6 letters.
  let mid = word.slice(start, end);
  while (mid.length > 6) {
    pieces.push(mid.slice(0, 5));
    mid = mid.slice(5);
  }
  if (mid) pieces.push(mid);
  if (tail) pieces.push(tail);
  return pieces;
}

export function tokenize(text: string): string[] {
  const out: string[] = [];
  const re = / ?[A-Za-z]+| ?\d{1,3}| ?[^\sA-Za-z\d]|\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const lead = raw.startsWith(' ') && raw.trim() ? ' ' : '';
    const body = lead ? raw.slice(1) : raw;
    if (/^[A-Za-z]+$/.test(body)) {
      const parts = splitLongWord(body);
      parts.forEach((p, i) => out.push(i === 0 ? lead + p : p));
    } else {
      out.push(raw);
    }
  }
  return out;
}

// Deterministic fake ID so the same piece always gets the same number.
function pieceId(piece: string): number {
  let h = 2166136261;
  for (let i = 0; i < piece.length; i++) {
    h ^= piece.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 50000 + 100;
}

function showPiece(p: string) {
  return p.replace(/ /g, '·').replace(/\n/g, '↵').replace(/\t/g, '⇥');
}

// ---------------------------------------------------------------------------
// Illustrative next-token probabilities (hand-written, not from a real model).
// ---------------------------------------------------------------------------

interface Choice { t: string; p: number; next?: Choice[] }
interface Example { prompt: string; choices: Choice[] }

const EXAMPLES: Example[] = [
  {
    prompt: 'The capital of France is',
    choices: [
      { t: ' Paris', p: 88, next: [
        { t: '.', p: 52, next: [
          { t: ' It', p: 45, next: [{ t: ' is', p: 70 }, { t: ' has', p: 15 }, { t: ' was', p: 10 }] },
          { t: ' Paris', p: 25, next: [{ t: ' is', p: 80 }, { t: ' has', p: 12 }] },
          { t: ' The', p: 18 },
        ] },
        { t: ',', p: 25, next: [
          { t: ' a', p: 35, next: [{ t: ' city', p: 60 }, { t: ' beautiful', p: 25 }] },
          { t: ' which', p: 30, next: [{ t: ' is', p: 75 }, { t: ' has', p: 15 }] },
          { t: ' known', p: 20, next: [{ t: ' for', p: 85 }, { t: ' as', p: 12 }] },
        ] },
        { t: ' and', p: 12, next: [{ t: ' its', p: 40 }, { t: ' the', p: 35 }, { t: ' it', p: 15 }] },
        { t: '!', p: 5 },
      ] },
      { t: ' a', p: 4, next: [{ t: ' city', p: 55 }, { t: ' beautiful', p: 25 }, { t: ' large', p: 12 }] },
      { t: ' the', p: 3, next: [{ t: ' city', p: 70 }, { t: ' largest', p: 20 }] },
      { t: ' located', p: 2, next: [{ t: ' in', p: 80 }, { t: ' on', p: 15 }] },
      { t: ' Lyon', p: 1 },
    ],
  },
  {
    prompt: 'Once upon a',
    choices: [
      { t: ' time', p: 94, next: [
        { t: ',', p: 70, next: [
          { t: ' there', p: 72, next: [
            { t: ' was', p: 58, next: [{ t: ' a', p: 70 }, { t: ' an', p: 18 }, { t: ' once', p: 6 }] },
            { t: ' lived', p: 38, next: [{ t: ' a', p: 80 }, { t: ' an', p: 15 }] },
          ] },
          { t: ' in', p: 20, next: [{ t: ' a', p: 85 }, { t: ' the', p: 12 }] },
          { t: ' a', p: 6, next: [{ t: ' young', p: 40 }, { t: ' little', p: 35 }] },
        ] },
        { t: ' there', p: 15, next: [{ t: ' was', p: 60 }, { t: ' lived', p: 35 }] },
        { t: ' in', p: 12, next: [{ t: ' a', p: 80 }, { t: ' the', p: 15 }] },
      ] },
      { t: ' midnight', p: 2, next: [{ t: ' dreary', p: 60 }, { t: ',', p: 25 }] },
      { t: ' dream', p: 1 },
      { t: ' hill', p: 1 },
      { t: ' star', p: 1 },
    ],
  },
  {
    prompt: 'I love to eat',
    choices: [
      { t: ' pizza', p: 30, next: [
        { t: '.', p: 40 },
        { t: ' and', p: 35, next: [
          { t: ' pasta', p: 45, next: [{ t: '.', p: 55 }, { t: ',', p: 30 }] },
          { t: ' ice', p: 30, next: [{ t: ' cream', p: 95 }] },
          { t: ' burgers', p: 20, next: [{ t: '.', p: 60 }, { t: ',', p: 25 }] },
        ] },
        { t: ' with', p: 18, next: [{ t: ' my', p: 55 }, { t: ' extra', p: 25 }, { t: ' friends', p: 15 }] },
      ] },
      { t: ' healthy', p: 14, next: [{ t: ' food', p: 55 }, { t: ',', p: 20 }, { t: ' meals', p: 15 }] },
      { t: ' chocolate', p: 12, next: [{ t: '.', p: 40 }, { t: ' cake', p: 30 }, { t: ' and', p: 20 }] },
      { t: ' sushi', p: 10, next: [{ t: '.', p: 45 }, { t: ' and', p: 35 }] },
      { t: ' out', p: 8, next: [{ t: ' at', p: 45 }, { t: ' with', p: 30 }, { t: '.', p: 15 }] },
    ],
  },
  {
    prompt: 'def add(a, b):',
    choices: [
      { t: '\n    return', p: 82, next: [
        { t: ' a', p: 95, next: [
          { t: ' +', p: 97, next: [{ t: ' b', p: 98 }] },
          { t: '+', p: 2, next: [{ t: 'b', p: 98 }] },
        ] },
        { t: ' (', p: 3, next: [{ t: 'a', p: 95 }] },
      ] },
      { t: '\n    """', p: 12, next: [{ t: 'Add', p: 60 }, { t: 'Return', p: 30 }] },
      { t: '\n    #', p: 3, next: [{ t: ' Add', p: 60 }, { t: ' Return', p: 25 }] },
      { t: '\n    result', p: 2, next: [{ t: ' =', p: 97 }] },
      { t: ' pass', p: 1 },
    ],
  },
];

const BAR_COLORS = ['#4ade80', '#4a9eff', '#a78bfa', '#fbbf24', '#f472b6'];

/** Walk the example tree along `text`. Returns the options for the next token, or null. */
function findChoices(text: string): { ex: number; choices: Choice[] | undefined } | null {
  for (let ex = 0; ex < EXAMPLES.length; ex++) {
    const { prompt } = EXAMPLES[ex];
    if (!text.startsWith(prompt)) continue;
    let rest = text.slice(prompt.length);
    let choices: Choice[] | undefined = EXAMPLES[ex].choices;
    let ok = true;
    while (rest.length > 0) {
      const hit: Choice | undefined = choices?.find((c) => rest.startsWith(c.t));
      if (!hit) { ok = false; break; }
      rest = rest.slice(hit.t.length);
      choices = hit.next;
    }
    if (ok) return { ex, choices };
  }
  return null;
}

export default function LLMTokenPlayground() {
  const [text, setText] = useState(EXAMPLES[0].prompt);
  const [history, setHistory] = useState<string[]>([]);

  const pieces = useMemo(() => tokenize(text), [text]);
  const found = useMemo(() => findChoices(text), [text]);
  const activeEx = found?.ex ?? -1;
  const choices = found?.choices;
  const promptLen = activeEx >= 0 ? EXAMPLES[activeEx].prompt.length : text.length;

  const pick = (c: Choice) => {
    setHistory((h) => [...h, text]);
    setText(text + c.t);
  };
  const undo = () => {
    if (!history.length) return;
    setText(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };
  const loadExample = (i: number) => {
    setText(EXAMPLES[i].prompt);
    setHistory([]);
  };

  // Which character positions were added by the "model" (for highlighting).
  let charPos = 0;

  return (
    <div className="h-full w-full flex flex-col gap-3 px-6 py-4 overflow-hidden">
      <div className="flex items-baseline justify-between gap-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">
          Try it: <span className="text-accent-purple">tokenizer</span> + <span className="text-accent-green">next word</span>
        </h3>
        <span className="text-xs text-white/40">Simple word-splitter and illustrative numbers. Real models differ.</span>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <span className="text-xs text-white/40 mr-1">Examples:</span>
        {EXAMPLES.map((ex, i) => (
          <motion.button
            key={ex.prompt}
            onClick={() => loadExample(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 rounded-full border text-sm font-mono transition-colors ${
              activeEx === i && history.length === 0 && text === ex.prompt
                ? 'border-accent-blue bg-accent-blue/20 text-accent-blue'
                : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {ex.prompt}
          </motion.button>
        ))}
      </div>

      {/* Text box */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => { setText(e.target.value); setHistory([]); }}
          onKeyDown={(e) => e.stopPropagation()}
          spellCheck={false}
          placeholder="Type anything…"
          className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/15 focus:border-accent-blue/60 outline-none text-white font-mono text-base resize-none leading-snug"
        />
        <button
          onClick={undo}
          disabled={!history.length}
          className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30"
        >
          ↶ Undo
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
        {/* Tokens */}
        <div className="flex flex-col min-h-0 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-accent-purple">1. Split into tokens</p>
            <motion.span
              key={pieces.length}
              initial={{ scale: 1.4, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#a78bfa' }}
              className="text-sm font-mono font-bold"
            >
              {pieces.length} token{pieces.length === 1 ? '' : 's'}
            </motion.span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5 content-start">
              <AnimatePresence initial={false}>
                {pieces.map((p, i) => {
                  const start = charPos;
                  charPos += p.length;
                  const generated = activeEx >= 0 && start >= promptLen;
                  const color = PIECE_COLORS[i % PIECE_COLORS.length];
                  return (
                    <motion.div
                      key={`${i}-${p}`}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                      className="flex flex-col items-center"
                    >
                      <span
                        className="px-2 py-1 rounded-md border font-mono text-sm font-bold whitespace-pre"
                        style={{
                          color,
                          borderColor: generated ? '#4ade80' : `${color}60`,
                          backgroundColor: `${color}14`,
                          boxShadow: generated ? '0 0 8px rgba(74,222,128,0.4)' : undefined,
                        }}
                      >
                        {showPiece(p)}
                      </span>
                      <span className="text-[11px] font-mono text-white/35 mt-0.5">{pieceId(p)}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-2">
            <span className="font-mono text-white/60">·</span> = a space, which is part of the token.
            Long words get cut into pieces. The numbers are made-up IDs.
          </p>
        </div>

        {/* Next-token chart */}
        <div className="flex flex-col min-h-0 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-sm font-bold text-accent-green mb-1">2. Chances for the next token</p>
          {choices && choices.length > 0 ? (
            <>
              <p className="text-xs text-white/45 mb-2">Click a bar to add that token and see the next guess.</p>
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {choices.map((c, i) => (
                    <motion.button
                      key={`${text}|${c.t}`}
                      onClick={() => pick(c)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 text-left group"
                    >
                      <span className="w-24 text-right text-sm font-mono font-bold text-white/80 whitespace-pre truncate">
                        {showPiece(c.t)}
                      </span>
                      <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden border border-transparent group-hover:border-white/20">
                        <motion.div
                          className="h-full rounded-full flex items-center px-2"
                          style={{ backgroundColor: `${BAR_COLORS[i % BAR_COLORS.length]}35` }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${Math.max(c.p, 4)}%` }}
                          transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                        >
                          <span className="text-xs font-bold" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>
                            {c.p}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Illustrative numbers. A real model scores its whole vocabulary (tens of thousands of tokens); only the top few are shown.
              </p>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-4">
              {activeEx >= 0 ? (
                <>
                  <p className="text-sm text-white/60">End of the prepared path.</p>
                  <p className="text-xs text-white/40">A real model would keep predicting, one token at a time, until it decides to stop.</p>
                  <button onClick={undo} className="mt-1 px-3 py-1 rounded-full border border-accent-green/40 text-accent-green text-sm hover:bg-accent-green/10">
                    ↶ Go back a token
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-white/60">No prepared guesses for this text.</p>
                  <p className="text-xs text-white/40">
                    The tokenizer on the left works on anything you type. For the next-word chart, click one of the example chips.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
