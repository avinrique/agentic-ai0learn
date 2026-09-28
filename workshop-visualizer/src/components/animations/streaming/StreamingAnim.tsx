'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import { STATUS_LINE, STREAM_EXAMPLES, doneLine } from '@/data/traces/streaming';
import {
  BLUE,
  Envelope,
  FitBox,
  GOLD,
  GREEN,
  KeyIcon,
  LaptopIcon,
  PURPLE,
  ServerIcon,
  StageTracker,
  Tile,
  spring,
  useClock,
  useHeight,
  useSize,
  useSpillsOver,
} from './StreamParts';
import { Caption, CheckCard, ChunkCard, CompareView, RecapCard, RequestCard, SetupCard } from './StreamCards';

// ─────────────────────────────────────────────────────────────────────────────
// StreamingAnim — Lesson 11 (Streaming: The Typing Effect), the sequel to
// Basic API. OpenAI's server sits on top, a pipe (the stream) runs down to your
// laptop, and each chunk is a little tile that drops down the pipe, types out in
// the terminal, and is glued onto the full_story bar. One card at a time opens
// up the focal thing (the request, a chunk object, the if-check).
// Everything is derived from the current step (and variant), so jumps work.
// Sizes adapt to the panel: on short screens the laptop box gives way first and
// the focal card scales down to fit (FitBox), so nothing overlaps.
// ─────────────────────────────────────────────────────────────────────────────

const RANK: Record<string, number> = {
  intro: 0,
  import: 1,
  client: 2,
  status: 3,
  request: 4,
  'stream-true': 5,
  compare: 6,
  sent: 7,
  init: 8,
  chunk1: 9,
  piece1: 10,
  check1: 11,
  print1: 12,
  add1: 13,
  piece2: 14,
  print2: 15,
  add2: 16,
  fast: 17,
  last: 18,
  done: 19,
  recap: 20,
};

const STAGES = ['Set up', 'Ask with stream=True', 'Loop over chunks', 'Done'];
function stageOf(rank: number) {
  if (rank <= 0) return -1;
  if (rank <= 3) return 0;
  if (rank <= 7) return 1;
  if (rank <= 18) return 2;
  return 3;
}

// Laptop box height per step (its most): bigger when the terminal or full_story is the focus.
const LAPTOP_H: Record<string, number> = {
  intro: 250,
  import: 170,
  client: 170,
  status: 230,
  request: 170,
  'stream-true': 170,
  sent: 190,
  init: 250,
  chunk1: 220,
  piece1: 220,
  check1: 220,
  print1: 280,
  add1: 280,
  piece2: 220,
  print2: 280,
  add2: 280,
  fast: 330,
  last: 250,
  done: 370,
  recap: 72, // just the full_story bar: the terminal is hidden on the recap
};

// Height the middle row (pipe + focal card) needs per step. On short panels the laptop
// shrinks (down to a floor) to leave this much room; whatever still doesn't fit is scaled.
const MID_NEED: Record<string, number> = {
  intro: 190,
  import: 130,
  client: 130,
  status: 90,
  request: 200,
  'stream-true': 250,
  sent: 150,
  init: 90,
  chunk1: 150,
  piece1: 260,
  check1: 200,
  print1: 90,
  add1: 90,
  piece2: 225,
  print2: 90,
  add2: 90,
  fast: 190,
  last: 230,
  done: 80,
  recap: 170,
};

const GAP = 110; // ms between chunks in the fast-forward (slowed down so you can watch)
const DROP = 600; // ms for a tile to fall down a tall pipe
const TILE_SPACING = 40; // px between falling tiles, so short pipes don't pile them up
const TILE_H = 40;

/** Mono characters that fit in `px` pixels at a `font`-px size (JetBrains Mono is 0.6em wide). */
const fitChars = (px: number, font: number) => Math.max(8, Math.floor(px / (font * 0.61)));

const isGap = (c: string | undefined) => c === ' ' || c === '↵';

/** Last `max` characters of a text on one line (new lines shown as ↵), cut at a word boundary. */
function tail(text: string, max: number) {
  const flat = text.replace(/\n/g, '↵');
  if (flat.length <= max) return flat;
  const start = flat.length - max + 1;
  let i = start;
  if (!isGap(flat[start - 1])) {
    const b = flat.slice(start).search(/[ ↵]/);
    if (b >= 0 && b < 12) i = start + b;
  }
  while (i < flat.length && isGap(flat[i])) i++;
  return `…${flat.slice(i)}`;
}

type PipeMode =
  | { kind: 'idle' }
  | { kind: 'send' }
  | { kind: 'drop'; piece: string | null }
  | { kind: 'rest'; piece: string }
  | { kind: 'exit'; piece: string }
  | { kind: 'flow'; pieces: string[] };

const PIPE_CLOSED = { borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.01)' };

/** The stream: a tube from the server down to the laptop that chunk tiles travel through. */
function Pipe({
  mode,
  open,
  focus,
  stepKey,
  width,
  dropMs,
  dim,
}: {
  mode: PipeMode;
  open: boolean;
  focus: boolean;
  stepKey: string;
  width: number;
  dropMs: number;
  dim: boolean;
}) {
  const [ref, h] = useHeight<HTMLDivElement>();
  // Single tiles are anchored to the bottom of the tube (y = 0 is "arrived"), so they stay put while the layout resizes.
  const bottomRow = 'absolute inset-x-0 bottom-2 flex justify-center';
  return (
    <motion.div
      ref={ref}
      // On the "sent" step the pipe is remounted closed, then opens once the request has arrived.
      initial={mode.kind === 'send' ? PIPE_CLOSED : false}
      animate={
        open
          ? {
              borderColor: focus ? GREEN : 'rgba(74,222,128,0.4)',
              backgroundColor: focus ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.04)',
            }
          : PIPE_CLOSED
      }
      transition={{ duration: 0.4, delay: mode.kind === 'send' ? 1.4 : 0 }}
      style={{ width }}
      className="relative h-full shrink-0 border-x-2 overflow-hidden"
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-white/[0.07]" />

      {h > 0 && mode.kind === 'send' && (
        <motion.div
          key={`send-${stepKey}`}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -h, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className={bottomRow}
        >
          <Envelope color={BLUE} size={40} />
        </motion.div>
      )}
      {h > 0 && mode.kind === 'drop' && (
        <motion.div
          key={`drop-${stepKey}`}
          initial={{ y: -h }}
          animate={{ y: 0 }}
          transition={{ duration: 1.0, ease: [0.45, 0, 0.8, 0.4] }}
          className={bottomRow}
        >
          <Tile piece={mode.piece} big />
        </motion.div>
      )}
      {mode.kind === 'rest' && (
        <motion.div initial={false} animate={{ opacity: dim ? 0.45 : 1 }} className={bottomRow}>
          <Tile piece={mode.piece} big />
        </motion.div>
      )}
      {mode.kind === 'exit' && (
        <motion.div
          key={`exit-${stepKey}`}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: TILE_H + 16, opacity: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeIn' }}
          className={bottomRow}
        >
          <Tile piece={mode.piece} big />
        </motion.div>
      )}
      {mode.kind === 'flow' &&
        mode.pieces.map((p, i) => (
          <motion.div
            key={`flow-${stepKey}-${i}`}
            initial={{ top: '-16%', opacity: 0 }}
            animate={{ top: ['-16%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ delay: (i * GAP) / 1000, duration: dropMs / 1000, ease: 'linear', times: [0, 0.12, 0.88, 1] }}
            className="absolute inset-x-0 flex justify-center"
          >
            <Tile piece={p} />
          </motion.div>
        ))}
    </motion.div>
  );
}

/** Small chip in the laptop header (setup things, collapsed). */
function MiniChip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[13px]" style={{ color, background: `${color}14` }}>
      {children}
    </span>
  );
}

export default function StreamingAnim() {
  const { steps, currentStep, activeVariantId } = useTracerStore();
  const index = Math.min(currentStep, Math.max(0, steps.length - 1));
  const step = steps[index];
  const trig = step?.animationTrigger ?? 'intro';
  const rank = RANK[trig] ?? 0;
  const resetKey = `${activeVariantId}-${index}`;

  const ex = STREAM_EXAMPLES[activeVariantId] ?? STREAM_EXAMPLES.default;
  const pieces = ex.pieces;
  const n = pieces.length;
  const full = pieces.join('');

  // ── Layout: fit the panel ─────────────────────────────────────────────────
  const [bodyRef, body] = useSize<HTMLDivElement>();
  const narrow = body.w > 0 && body.w < 700;
  const serverH = body.h > 0 && body.h < 500 ? 48 : 58;
  const lapMax = LAPTOP_H[trig] ?? 240;
  // Floors: the terminal keeps at least two lines before full_story exists, and one line after.
  const lapMin = trig === 'recap' ? lapMax : rank < RANK.init ? 120 : 146;
  const laptopH =
    body.h > 0 ? Math.round(Math.min(lapMax, Math.max(lapMin, body.h - serverH - (MID_NEED[trig] ?? 150)))) : lapMax;
  const midH = body.h > 0 ? body.h - serverH - laptopH : 300;
  // Tiles fall slower in tall pipes and faster in short ones, so they never pile up.
  const dropMs = Math.round(Math.min(DROP, Math.max(300, (midH * 1.16 * GAP) / TILE_SPACING)));

  // Fast-forward clocks (intro demo streams all pieces; the loop step streams the rest).
  const flowStart = trig === 'intro' ? 0 : 2;
  const flowPieces = pieces.slice(flowStart);
  const flowing = trig === 'intro' || trig === 'fast';
  const flowMax = (flowPieces.length - 1) * GAP + dropMs + 60;
  const t = useClock(flowing, resetKey, flowMax);
  const flowWritten = Math.min(flowPieces.length, Math.floor(t / GAP) + 1);
  const flowArrived = t < dropMs ? 0 : Math.min(flowPieces.length, Math.floor((t - dropMs) / GAP) + 1);

  // How many pieces the server has written / the terminal shows / full_story holds.
  let written = 0;
  let printed = 0;
  let stored = 0;
  if (flowing) {
    written = flowStart + flowWritten;
    printed = flowStart + flowArrived;
    stored = trig === 'fast' ? printed : 0;
  } else if (rank >= RANK.last) {
    written = printed = stored = n;
  } else {
    written = rank >= RANK.piece2 ? 2 : rank >= RANK.chunk1 ? 1 : 0;
    printed = rank >= RANK.print2 ? 2 : rank >= RANK.print1 ? 1 : 0;
    stored = rank >= RANK.add2 ? 2 : rank >= RANK.add1 ? 1 : 0;
  }
  const printedText = pieces.slice(0, printed).join('');
  const storedText = pieces.slice(0, stored).join('');

  // ── Pipe mode and the card/caption next to it ─────────────────────────────
  const streamOpen = rank >= RANK.sent || trig === 'intro';
  let pipe: PipeMode = { kind: 'idle' };
  if (flowing) pipe = { kind: 'flow', pieces: flowPieces };
  else if (trig === 'sent') pipe = { kind: 'send' };
  else if (trig === 'chunk1') pipe = { kind: 'drop', piece: pieces[0] };
  else if (trig === 'piece1' || trig === 'check1') pipe = { kind: 'rest', piece: pieces[0] };
  else if (trig === 'print1') pipe = { kind: 'exit', piece: pieces[0] };
  else if (trig === 'piece2') pipe = { kind: 'drop', piece: pieces[1] };
  else if (trig === 'print2') pipe = { kind: 'exit', piece: pieces[1] };
  else if (trig === 'last') pipe = { kind: 'drop', piece: null };
  const pipeFocus = ['intro', 'sent', 'chunk1', 'fast'].includes(trig);

  let side: ReactNode = null;
  if (trig === 'intro') side = <Caption big="stream=True" color={GREEN} />;
  else if (trig === 'import' || trig === 'client') side = <SetupCard showClient={trig === 'client'} />;
  else if (trig === 'request' || trig === 'stream-true')
    side = <RequestCard prompt={ex.prompt} showStream={trig === 'stream-true'} />;
  else if (trig === 'sent') side = <Caption big="stream" color={GREEN} delay={1.4} />;
  else if (trig === 'chunk1') side = <Caption big="chunk" color={PURPLE} />;
  else if (trig === 'piece1') side = <ChunkCard piece={pieces[0]} kind="first" />;
  else if (trig === 'check1') side = <CheckCard piece={pieces[0]} />;
  else if (trig === 'piece2') side = <ChunkCard piece={pieces[1]} kind="next" />;
  else if (trig === 'fast')
    side = (
      <div className="flex flex-col items-start gap-1 whitespace-nowrap">
        <span className="font-mono text-[28px] font-bold tabular-nums text-accent-purple">
          {Math.max(3, printed)}
          <span className="text-white/35"> / {n}</span>
        </span>
        <span className="text-[14px] text-white/55">text chunks</span>
      </div>
    );
  else if (trig === 'last') side = <ChunkCard piece={null} kind="last" />;
  else if (trig === 'recap') side = <RecapCard />;
  // Tiles show a new line as ↵; say so once, on the steps where many tiles fly by.
  const newlineKey = flowing && pieces.some((p) => p.includes('\n'));

  // ── Terminal ──────────────────────────────────────────────────────────────
  const showStatus = rank >= RANK.status || trig === 'intro';
  const newIdx = trig === 'print1' ? 0 : trig === 'print2' ? 1 : -1;
  const termFocus = ['intro', 'status', 'print1', 'print2', 'fast'].includes(trig);
  // Only a few short lines while the first two pieces are walked through, so the text can be bigger.
  const termFont = rank >= RANK.status && rank <= RANK.add2 ? 17 : 15;
  const lineH = termFont * 1.5;
  const [termAreaRef, termArea] = useSize<HTMLDivElement>();
  // Clip to whole lines, so the top line is never sliced in half.
  const termWindowH = termArea.h > 0 ? Math.max(lineH, Math.floor((termArea.h + 0.5) / lineH) * lineH) : undefined;
  const [termOuter, termInner, termSpills] = useSpillsOver<HTMLDivElement, HTMLDivElement>();
  const topFade = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0, #000 ${lineH}px)`;
  const termTag =
    trig === 'print1' ? (
      <>
        <span className="font-mono">flush=True</span> ⚡ show now
      </>
    ) : trig === 'print2' ? (
      <>
        <span className="font-mono">end=&quot;&quot;</span> → same line
      </>
    ) : null;
  const storyShown =
    newIdx >= 0 ? (
      <>
        {pieces.slice(0, newIdx).join('')}
        {/* The new piece appears once its tile has left the pipe. */}
        <motion.span
          key={`new-${resetKey}`}
          initial={{ opacity: 0, backgroundColor: 'rgba(251,191,36,0)' }}
          animate={{ opacity: 1, backgroundColor: 'rgba(251,191,36,0.35)' }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="rounded-sm text-white"
        >
          {pieces[newIdx]}
        </motion.span>
      </>
    ) : (
      printedText
    );
  const streaming = (flowing && printed < n) || (rank >= RANK.chunk1 && rank < RANK.last);

  // ── Server bar ────────────────────────────────────────────────────────────
  // The server is "writing" from the moment it gets the request until the last text piece is out.
  const writing = flowing ? flowWritten < flowPieces.length : rank >= RANK.sent && rank < RANK.last;
  const serverDone = rank >= RANK.last || (flowing && !writing);
  const serverState = writing ? 'writing' : serverDone ? 'done' : 'waiting';
  // Only the first chunk's step picks out the server's newest piece; in the fast-forward the
  // tiles and the terminal lead, and once it's done the bar just says "✓ done".
  const serverHot = trig === 'chunk1';
  const [srvTextRef, srvText] = useSize<HTMLDivElement>();
  const srvChars = srvText.w > 0 ? fitChars(srvText.w, 15) : 40;
  const curPiece = written > 0 ? pieces[written - 1].replace(/\n/g, '↵') : '';
  const prevText = written > 1 ? tail(pieces.slice(0, written - 1).join(''), Math.max(6, srvChars - curPiece.length - 1)) : '';

  // ── full_story bar ────────────────────────────────────────────────────────
  const barFocus = ['init', 'add1', 'add2', 'done'].includes(trig);
  const barFont = barFocus ? 17 : 14;
  const newStored = trig === 'add1' ? pieces[0] : trig === 'add2' ? pieces[1] : '';
  const storedBefore = newStored ? storedText.slice(0, storedText.length - newStored.length) : storedText;
  const [barTextRef, barText] = useSize<HTMLDivElement>();
  const barChars = barText.w > 0 ? fitChars(barText.w, barFont) : 44;

  return (
    <div className="h-full flex flex-col gap-3 px-5 py-4 overflow-hidden text-white">
      <StageTracker stages={STAGES} now={stageOf(rank)} allDone={trig === 'recap'} />

      {trig === 'compare' ? (
        <CompareView pieces={pieces} resetKey={resetKey} />
      ) : (
        <div ref={bodyRef} className="flex-1 min-h-0 flex flex-col">
          {/* OPENAI SERVER */}
          <motion.div
            animate={{
              opacity: rank >= RANK.request || trig === 'intro' ? 1 : 0.45,
              borderColor: 'rgba(74,222,128,0.45)',
            }}
            style={{ height: serverH }}
            className="shrink-0 rounded-2xl border-2 bg-accent-green/5 px-4 flex items-center gap-3"
          >
            <ServerIcon color={GREEN} />
            <span className="text-[16px] font-semibold text-accent-green">OpenAI</span>
            {!narrow && (
              <span className="rounded-md bg-accent-blue/10 px-2 py-0.5 font-mono text-[13px] text-accent-blue/80">gpt-4o-mini</span>
            )}
            <div ref={srvTextRef} className="flex-1 min-w-0 font-mono text-[15px] whitespace-pre overflow-hidden">
              {written > 0 && !serverDone ? (
                <>
                  <span className="text-white/60">{prevText}</span>
                  <span className={serverHot ? 'rounded-sm bg-accent-gold/40 text-white' : 'text-white/60'}>{curPiece}</span>
                </>
              ) : trig === 'sent' ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="inline-flex items-center gap-2 font-sans text-[14px] text-white/70"
                >
                  <Envelope color={BLUE} size={22} /> request received
                </motion.span>
              ) : null}
            </div>
            <motion.span
              key={serverState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: trig === 'sent' ? 1.3 : 0 }}
              className="shrink-0 text-[13px] font-semibold"
              style={{ color: writing ? GOLD : serverDone ? GREEN : 'rgba(255,255,255,0.35)' }}
            >
              {writing ? 'writing…' : serverDone ? '✓ done' : 'waiting'}
            </motion.span>
          </motion.div>

          {/* PIPE + FOCAL CARD */}
          <div className={`flex-1 min-h-0 flex ${narrow ? 'gap-5' : 'gap-8'}`}>
            <div className={`${narrow ? 'ml-3' : 'ml-8'} h-full`}>
              <Pipe
                key={trig === 'sent' ? 'pipe-sent' : 'pipe'}
                mode={pipe}
                open={streamOpen}
                focus={pipeFocus}
                stepKey={resetKey}
                width={narrow ? 150 : 180}
                dropMs={dropMs}
                dim={trig === 'piece1' || trig === 'check1'}
              />
            </div>
            <div className="flex-1 min-w-0 h-full py-2 pr-2">
              {side && (
                <FitBox>
                  {side}
                  {newlineKey && (
                    <span className="mt-3 rounded-md bg-white/5 px-2 py-0.5 font-mono text-[13px] text-white/60">↵ = new line</span>
                  )}
                </FitBox>
              )}
            </div>
          </div>

          {/* YOUR LAPTOP: terminal + full_story */}
          <motion.div
            initial={false}
            animate={{ height: laptopH, opacity: trig === 'recap' ? 0.35 : 1 }}
            transition={spring}
            className="shrink-0 rounded-2xl border-2 border-accent-blue/40 bg-accent-blue/5 p-2.5 flex flex-col gap-2 overflow-hidden"
          >
            {/* Terminal (hidden on the recap, where the full_story bar alone sums up the result) */}
            {trig !== 'recap' && (
              <motion.div
                animate={{ boxShadow: termFocus ? `0 0 0 1px ${BLUE}88, 0 0 18px ${BLUE}33` : '0 0 0 0 rgba(0,0,0,0)' }}
                className="flex-1 min-h-0 rounded-xl bg-black/60 flex flex-col overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 whitespace-nowrap">
                  <LaptopIcon />
                  <span className="text-[14px] font-semibold text-accent-blue">Your laptop</span>
                  {!(narrow && termTag) && <span className="text-[13px] text-white/55">· terminal</span>}
                  {rank >= RANK.status && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <MiniChip color={PURPLE}>openai</MiniChip>
                      <MiniChip color={BLUE}>
                        client <KeyIcon color={GOLD} />
                      </MiniChip>
                    </div>
                  )}
                  {termTag && (
                    <motion.span
                      key={`tag-${resetKey}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: 0.5 }}
                      className="ml-auto rounded-md bg-accent-gold/15 px-2.5 py-1 text-[14px] font-semibold text-accent-gold"
                    >
                      {termTag}
                    </motion.span>
                  )}
                </div>
                <div ref={termAreaRef} className="flex-1 min-h-0 px-4 pb-2.5 flex flex-col justify-end overflow-hidden">
                  <div
                    ref={termOuter}
                    className="shrink-0 overflow-hidden flex flex-col justify-end font-mono"
                    style={{
                      height: termWindowH,
                      fontSize: termFont,
                      lineHeight: `${lineH}px`,
                      // Fade the top line when older lines are hidden above it (not when it's the only line).
                      ...(termSpills && (termWindowH ?? 0) >= 2 * lineH ? { maskImage: topFade, WebkitMaskImage: topFade } : {}),
                    }}
                  >
                    <div ref={termInner}>
                      <div className="text-white/40">$ python run.py part1/streaming.py</div>
                      {showStatus && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-white/75">
                          {STATUS_LINE}
                        </motion.div>
                      )}
                      {/* No cursor-only line before the first print, so a one-line terminal still shows the status line. */}
                      {printed > 0 && (
                        <div className="whitespace-pre-wrap text-accent-green">
                          {storyShown}
                          {streaming && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-white/60 animate-pulse" />}
                        </div>
                      )}
                      {rank >= RANK.done && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="whitespace-pre-wrap text-white/85">
                          {doneLine(full.length)}
                        </motion.div>
                      )}
                      {rank >= RANK.done && <div className="text-white/40">$ ▌</div>}
                      {rank < RANK.status && trig !== 'intro' && <span className="inline-block h-4 w-2 bg-white/40 animate-pulse" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* full_story */}
            {rank >= RANK.init && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: barFocus ? `0 0 0 2px ${GOLD}, 0 0 20px ${GOLD}44` : '0 0 0 1px rgba(251,191,36,0.25)',
                }}
                transition={spring}
                className="shrink-0 rounded-xl bg-navy-900/70 px-3 flex items-center gap-3"
                style={{ height: barFocus ? 58 : 44 }}
              >
                <span className="font-mono font-bold text-accent-gold" style={{ fontSize: barFont }}>
                  full_story
                </span>
                <div className="flex-1 min-w-0 h-[70%] rounded-lg bg-white/[0.04] overflow-hidden">
                  <div
                    ref={barTextRef}
                    className="h-full flex items-center px-2 font-mono whitespace-pre overflow-hidden"
                    style={{ fontSize: barFont }}
                  >
                    {storedText.length === 0 ? (
                      <span className="text-white/40">&quot;&quot;</span>
                    ) : (
                      <>
                        <span className="text-white/85">{tail(storedBefore, Math.max(6, barChars - newStored.length - 1))}</span>
                        {newStored && (
                          <motion.span
                            key={`add-${resetKey}`}
                            initial={{ y: -18, opacity: 0, backgroundColor: 'rgba(74,222,128,0.5)' }}
                            animate={{ y: 0, opacity: 1, backgroundColor: 'rgba(74,222,128,0.28)' }}
                            transition={{ ...spring, delay: 0.3 }}
                            className="rounded-sm text-white"
                          >
                            {newStored.replace(/\n/g, '↵')}
                          </motion.span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono tabular-nums ${trig === 'done' ? 'text-[17px] font-bold text-accent-gold' : 'text-[14px] text-white/55'}`}
                >
                  {trig === 'done' || trig === 'recap' ? `len = ${storedText.length}` : `${storedText.length} chars`}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
