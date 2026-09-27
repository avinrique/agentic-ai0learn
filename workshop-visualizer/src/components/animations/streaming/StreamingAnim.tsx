'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import { STATUS_LINE, STREAM_EXAMPLES, doneLine } from '@/data/traces/streaming';
import {
  BLUE,
  Envelope,
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

// Laptop box height per step: bigger when the terminal or full_story is the focus.
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
  recap: 300,
};

/** Fades the top edge of the terminal when older lines scroll off it. */
const TOP_FADE = 'linear-gradient(to bottom, transparent 0, #000 30px)';

const GAP = 110; // ms between chunks in the fast-forward (slowed down so you can watch)
const DROP = 600; // ms for a tile to fall down the pipe
const TILE_H = 40;

/** Last `max` characters of a text on one line (new lines shown as ↵). */
function tail(text: string, max: number) {
  const flat = text.replace(/\n/g, '↵');
  return flat.length > max ? `…${flat.slice(flat.length - max + 1)}` : flat;
}

type PipeMode =
  | { kind: 'idle' }
  | { kind: 'send' }
  | { kind: 'drop'; piece: string | null }
  | { kind: 'rest'; piece: string }
  | { kind: 'exit'; piece: string }
  | { kind: 'flow'; pieces: string[] };

/** The stream: a tube from the server down to the laptop that chunk tiles travel through. */
function Pipe({ mode, open, focus, stepKey }: { mode: PipeMode; open: boolean; focus: boolean; stepKey: string }) {
  const [ref, h] = useHeight<HTMLDivElement>();
  // Single tiles are anchored to the bottom of the tube (y = 0 is "arrived"), so they stay put while the layout resizes.
  const bottomRow = 'absolute inset-x-0 bottom-2 flex justify-center';
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{
        borderColor: open ? (focus ? GREEN : 'rgba(74,222,128,0.4)') : 'rgba(255,255,255,0.12)',
        backgroundColor: open ? (focus ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.04)') : 'rgba(255,255,255,0.01)',
      }}
      transition={{ duration: 0.4, delay: mode.kind === 'send' ? 1.4 : 0 }}
      className="relative h-full w-[180px] shrink-0 border-x-2 overflow-hidden"
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
        <div className={bottomRow}>
          <Tile piece={mode.piece} big />
        </div>
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
            transition={{ delay: (i * GAP) / 1000, duration: DROP / 1000, ease: 'linear', times: [0, 0.12, 0.88, 1] }}
            className="absolute inset-x-0 flex justify-center"
          >
            <Tile piece={p} />
          </motion.div>
        ))}
      <div
        className="absolute bottom-0.5 right-1.5 text-[12px]"
        style={{ color: open ? `${GREEN}99` : 'rgba(255,255,255,0.15)' }}
      >
        ▼
      </div>
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

  // Fast-forward clocks (intro demo streams all pieces; the loop step streams the rest).
  const flowStart = trig === 'intro' ? 0 : 2;
  const flowPieces = pieces.slice(flowStart);
  const flowing = trig === 'intro' || trig === 'fast';
  const flowMax = (flowPieces.length - 1) * GAP + DROP + 60;
  const t = useClock(flowing, resetKey, flowMax);
  const flowWritten = Math.min(flowPieces.length, Math.floor(t / GAP) + 1);
  const flowArrived = t < DROP ? 0 : Math.min(flowPieces.length, Math.floor((t - DROP) / GAP) + 1);

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
  if (trig === 'intro') side = <Caption big="stream=True" small="the answer arrives in pieces" color={GREEN} />;
  else if (trig === 'import' || trig === 'client') side = <SetupCard showClient={trig === 'client'} />;
  else if (trig === 'request' || trig === 'stream-true')
    side = <RequestCard prompt={ex.prompt} showStream={trig === 'stream-true'} />;
  else if (trig === 'sent') side = <Caption big="stream" small="an open pipe, no text yet" color={GREEN} />;
  else if (trig === 'chunk1') side = <Caption big="chunk #1" small="arrives" color={PURPLE} />;
  else if (trig === 'piece1') side = <ChunkCard n={1} piece={pieces[0]} kind="first" />;
  else if (trig === 'check1') side = <CheckCard piece={pieces[0]} />;
  else if (trig === 'piece2') side = <ChunkCard n={2} piece={pieces[1]} kind="next" />;
  else if (trig === 'fast')
    side = (
      <div className="flex flex-col items-start gap-1">
        <span className="font-mono text-[28px] font-bold tabular-nums text-accent-purple">
          chunk #{Math.max(3, printed)}
          <span className="text-white/35"> / {n}</span>
        </span>
        <span className="text-[15px] text-white/55">loop runs again and again</span>
      </div>
    );
  else if (trig === 'last') side = <ChunkCard n={n + 1} piece={null} kind="last" />;
  else if (trig === 'recap') side = <RecapCard />;

  // ── Terminal ──────────────────────────────────────────────────────────────
  const showStatus = rank >= RANK.status || trig === 'intro';
  const newIdx = trig === 'print1' ? 0 : trig === 'print2' ? 1 : -1;
  const termFocus = ['intro', 'status', 'print1', 'print2', 'fast'].includes(trig);
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
        <motion.span
          key={`new-${resetKey}`}
          initial={{ backgroundColor: 'rgba(251,191,36,0)', color: '#ffffff' }}
          animate={{ backgroundColor: 'rgba(251,191,36,0.35)', color: '#ffffff' }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="rounded-sm"
        >
          {pieces[newIdx]}
        </motion.span>
      </>
    ) : (
      printedText
    );
  const streaming = (flowing && printed < n) || (rank >= RANK.chunk1 && rank < RANK.last);

  // ── full_story bar ────────────────────────────────────────────────────────
  const barFocus = ['init', 'add1', 'add2', 'done'].includes(trig);
  const newStored = trig === 'add1' ? pieces[0] : trig === 'add2' ? pieces[1] : '';
  const storedBefore = newStored ? storedText.slice(0, storedText.length - newStored.length) : storedText;
  const BAR_MAX = barFocus ? 44 : 60;

  const laptopH = LAPTOP_H[trig] ?? 240;
  // The server is "writing" while pieces are still coming; once the last text piece is out it is done.
  const writing = flowing ? flowWritten < flowPieces.length : rank >= RANK.chunk1 && rank < RANK.last;
  const serverDone = rank >= RANK.last || (flowing && !writing);
  const [termOuter, termInner, termSpills] = useSpillsOver<HTMLDivElement, HTMLDivElement>();

  return (
    <div className="h-full flex flex-col gap-3 px-5 py-4 overflow-hidden text-white">
      <StageTracker stages={STAGES} now={stageOf(rank)} allDone={trig === 'recap'} />

      {trig === 'compare' ? (
        <CompareView pieces={pieces} resetKey={resetKey} />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* OPENAI SERVER */}
          <motion.div
            animate={{
              opacity: rank >= RANK.request || trig === 'intro' ? 1 : 0.45,
              borderColor: writing && (trig === 'chunk1' || trig === 'fast' || trig === 'intro') ? GOLD : 'rgba(74,222,128,0.45)',
            }}
            className="shrink-0 h-[58px] rounded-2xl border-2 bg-accent-green/5 px-4 flex items-center gap-3"
          >
            <ServerIcon color={GREEN} />
            <span className="text-[16px] font-semibold text-accent-green">OpenAI</span>
            <span className="rounded-md bg-accent-blue/10 px-2 py-0.5 font-mono text-[13px] text-accent-blue/80">gpt-4o-mini</span>
            <div className="flex-1 min-w-0 font-mono text-[15px] whitespace-nowrap overflow-hidden">
              {written > 0 ? (
                <>
                  <span className="text-white/60">{tail(pieces.slice(0, written - 1).join(''), 40)}</span>
                  <span className="rounded-sm bg-accent-gold/40 text-white">{pieces[written - 1].replace(/\n/g, '↵')}</span>
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
            <span className="shrink-0 text-[13px] font-semibold" style={{ color: writing ? GOLD : serverDone ? GREEN : 'rgba(255,255,255,0.35)' }}>
              {writing ? 'writing…' : serverDone ? '✓ done' : 'waiting'}
            </span>
          </motion.div>

          {/* PIPE + FOCAL CARD */}
          <div className="flex-1 min-h-0 flex gap-8">
            <div className="ml-8 h-full">
              <Pipe mode={pipe} open={streamOpen} focus={pipeFocus} stepKey={resetKey} />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-start py-3 pr-2">{side}</div>
          </div>

          {/* YOUR LAPTOP: terminal + full_story */}
          <motion.div
            initial={false}
            animate={{ height: laptopH }}
            transition={spring}
            className="shrink-0 rounded-2xl border-2 border-accent-blue/40 bg-accent-blue/5 p-2.5 flex flex-col gap-2 overflow-hidden"
          >
            {/* Terminal */}
            <motion.div
              animate={{ boxShadow: termFocus ? `0 0 0 1px ${BLUE}88, 0 0 18px ${BLUE}33` : '0 0 0 0 rgba(0,0,0,0)' }}
              className="flex-1 min-h-0 rounded-xl bg-black/60 flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
                <LaptopIcon />
                <span className="text-[14px] font-semibold text-accent-blue">Your laptop</span>
                <span className="text-[13px] text-white/35">· terminal</span>
                {rank >= RANK.import && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <MiniChip color={PURPLE}>openai</MiniChip>
                    {rank >= RANK.client && (
                      <MiniChip color={BLUE}>
                        client <KeyIcon color={GOLD} />
                      </MiniChip>
                    )}
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
              <div
                ref={termOuter}
                className="flex-1 min-h-0 px-4 pb-3 font-mono text-[15px] leading-[1.5] overflow-hidden flex flex-col justify-end"
                style={termSpills ? { maskImage: TOP_FADE, WebkitMaskImage: TOP_FADE } : undefined}
              >
                <div ref={termInner}>
                  <div className="text-white/40">$ python run.py part1/streaming.py</div>
                  {showStatus && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-white/75">
                      {STATUS_LINE}
                    </motion.div>
                  )}
                  {(printed > 0 || streaming) && (
                    <div className="whitespace-pre-wrap text-accent-green">
                      {storyShown}
                      {streaming && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-white/60 animate-pulse" />}
                    </div>
                  )}
                  {rank >= RANK.done && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="whitespace-pre-wrap text-white/85">
                      {doneLine(full.length).replace(/^\n/, '')}
                    </motion.div>
                  )}
                  {rank >= RANK.done && <div className="text-white/40">$ ▌</div>}
                  {rank < RANK.status && trig !== 'intro' && <span className="inline-block h-4 w-2 bg-white/40 animate-pulse" />}
                </div>
              </div>
            </motion.div>

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
                <span className={`font-mono font-bold text-accent-gold ${barFocus ? 'text-[17px]' : 'text-[14px]'}`}>full_story</span>
                <div className="relative flex-1 min-w-0 h-[70%] rounded-lg bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${(storedText.length / Math.max(1, full.length)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-y-0 left-0 bg-accent-gold/15"
                  />
                  <div
                    className={`relative h-full flex items-center px-2 font-mono whitespace-pre overflow-hidden ${
                      barFocus ? 'text-[17px]' : 'text-[14px]'
                    }`}
                  >
                    {storedText.length === 0 ? (
                      <span className="text-white/40">&quot;&quot;</span>
                    ) : (
                      <>
                        <span className="text-white/85">{tail(storedBefore, BAR_MAX - newStored.length)}</span>
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
