'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  BLUE,
  Envelope,
  GOLD,
  GREEN,
  KeyIcon,
  Layer,
  Path,
  PURPLE,
  RED,
  Tile,
  spring,
  useClock,
} from './StreamParts';

// ─────────────────────────────────────────────────────────────────────────────
// The big "focal" cards for StreamingAnim: one per step at most, shown to the
// right of the pipe (or, for the timer comparison, across the whole panel).
// ─────────────────────────────────────────────────────────────────────────────

function Pop({ children, k }: { children: ReactNode; k: string }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
      {children}
    </motion.div>
  );
}

/** Setup: the library and the client (same as last lesson). */
export function SetupCard({ showClient }: { showClient: boolean }) {
  const item = (on: boolean, color: string, body: ReactNode, label: string) => (
    <motion.div
      animate={{ opacity: on ? 1 : 0.4, scale: on ? 1 : 0.9 }}
      transition={spring}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="rounded-xl border-2 px-5 py-3 flex items-center gap-2.5 font-mono text-[20px] font-bold"
        style={{ borderColor: on ? color : 'rgba(255,255,255,0.15)', background: `${color}14`, color }}
      >
        {body}
      </div>
      <span className="text-[14px] text-white/55">{label}</span>
    </motion.div>
  );
  return (
    <div className="flex items-start justify-center gap-8">
      {item(!showClient, PURPLE, <>📦 openai</>, 'library')}
      {showClient &&
        item(
          true,
          BLUE,
          <>
            📞 client
            <span className="ml-2 flex items-center gap-1.5 rounded-md bg-accent-gold/10 px-2 py-0.5 text-[14px] font-normal text-white/70">
              <KeyIcon color={GOLD} /> sk-••••
            </span>
          </>,
          'phone line to OpenAI',
        )}
    </div>
  );
}

/** The request envelope; the stream row appears (and switches on) on the stream=True step. */
export function RequestCard({ prompt, showStream }: { prompt: string; showStream: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="w-full max-w-[520px] rounded-2xl border-2 border-accent-blue/50 bg-navy-900/70 px-4 py-3 flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <Envelope color={BLUE} size={26} />
        <span className="text-[16px] font-semibold text-white/85">request</span>
      </div>
      <motion.div animate={{ opacity: showStream ? 0.45 : 1 }} className="flex items-center gap-3">
        <span className="w-[84px] font-mono text-[14px] text-white/50">model</span>
        <span className="rounded-md bg-accent-blue/15 px-2 py-0.5 font-mono text-[15px] font-bold text-accent-blue">gpt-4o-mini</span>
      </motion.div>
      <motion.div animate={{ opacity: showStream ? 0.45 : 1 }} className="flex items-start gap-3">
        <span className="w-[84px] shrink-0 pt-1 font-mono text-[14px] text-white/50">messages</span>
        <div className="rounded-2xl rounded-bl-sm bg-accent-purple/10 border border-accent-purple/30 px-3 py-1.5 min-w-0">
          <span className="mr-2 rounded bg-accent-blue px-1.5 font-mono text-[13px] font-bold text-navy-900">user</span>
          <span className="text-[15px] leading-snug text-white/90">{prompt}</span>
        </div>
      </motion.div>
      {showStream && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, boxShadow: `0 0 0 2px ${GREEN}, 0 0 22px ${GREEN}55` }}
          transition={spring}
          className="flex items-center gap-3 rounded-xl bg-accent-green/10 px-3 py-2.5"
        >
          <span className="w-[72px] font-mono text-[18px] font-bold text-accent-green">stream</span>
          <motion.div
            initial={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            animate={{ backgroundColor: GREEN }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="relative h-7 w-[52px] rounded-full"
          >
            <motion.div
              initial={{ x: 3 }}
              animate={{ x: 27 }}
              transition={{ ...spring, delay: 0.5 }}
              className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow"
            />
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-mono text-[20px] font-bold text-accent-green"
          >
            True
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="ml-auto text-[14px] text-white/60"
          >
            send it in pieces
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}

/** The piece value, with a leading space picked out so students can see it. */
function PieceValue({ piece, showSpace }: { piece: string; showSpace: boolean }) {
  if (!(showSpace && piece.startsWith(' '))) return <Tile piece={piece} big />;
  return (
    <span className="relative inline-flex items-center rounded-lg border-2 border-accent-green bg-accent-green/15 px-3 py-2 font-mono text-[18px] leading-none text-emerald-100 whitespace-pre">
      &quot;
      <span className="relative inline-block w-[0.62em] self-stretch rounded-sm bg-accent-gold/45">
        <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap font-sans text-[13px] text-accent-gold">
          ↑ space
        </span>
      </span>
      {piece.slice(1).replace(/\n/g, '↵')}&quot;
    </span>
  );
}

/** One chunk object, opened up: chunk → choices[0] → delta → content. */
export function ChunkCard({
  n,
  piece,
  kind,
}: {
  n: number;
  piece: string | null;
  kind: 'first' | 'next' | 'last';
}) {
  const last = kind === 'last';
  return (
    <Pop k={`chunk-${n}-${kind}`}>
      <div className="w-[470px] max-w-full flex flex-col gap-2.5">
        {kind === 'first' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="w-[92px] text-[13px] text-white/40">last lesson</span>
              <Path segs={['response', '.choices[0]', '.message', '.content']} hot=".message" dim />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-[92px] text-[13px] text-accent-green">now</span>
              <Path segs={['chunk', '.choices[0]', '.delta', '.content']} hot=".delta" />
            </div>
          </div>
        )}
        <Layer name={`chunk #${n}`} lit color={PURPLE}>
          <Layer name="choices[0]" lit color={PURPLE} delay={0.15}>
            <Layer name="delta" lit color={GOLD} delay={0.3}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className={`flex items-center gap-3 ${kind === 'next' ? 'pb-5' : ''}`}
              >
                <span className="font-mono text-[15px] font-bold" style={{ color: last ? 'rgba(255,255,255,0.5)' : GREEN }}>
                  content
                </span>
                {piece === null ? <Tile piece={null} big /> : <PieceValue piece={piece} showSpace={kind === 'next'} />}
                {piece === null && <span className="text-[14px] text-white/50">no text</span>}
              </motion.div>
            </Layer>
            {last && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="font-mono text-[15px]"
              >
                <span className="text-white/55">finish_reason </span>
                <span className="text-accent-gold">&quot;stop&quot;</span>
              </motion.div>
            )}
          </Layer>
        </Layer>
        {last && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.9 }}
            className="flex items-center gap-3 self-start rounded-xl border-2 px-3 py-2"
            style={{ borderColor: RED, background: `${RED}14` }}
          >
            <span className="font-mono text-[17px] font-bold text-white/85">if piece:</span>
            <span className="text-[17px] font-bold" style={{ color: RED }}>
              ✗ skip
            </span>
          </motion.div>
        )}
      </div>
    </Pop>
  );
}

/** if piece: → the piece has text → go inside. */
export function CheckCard({ piece }: { piece: string }) {
  return (
    <Pop k={`check-${piece}`}>
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-accent-green/60 bg-accent-green/5 px-7 py-5">
        <span className="font-mono text-[22px] font-bold text-white/90">if piece:</span>
        <div className="flex items-center gap-3">
          <Tile piece={piece} big />
          <span className="text-[20px] text-white/40">→</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.4 }}
            className="text-[18px] font-bold text-accent-green"
          >
            ✓ has text
          </motion.span>
          <span className="text-[20px] text-white/40">→</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[18px] text-white/85"
          >
            go inside
          </motion.span>
        </div>
      </div>
    </Pop>
  );
}

/** A big short label next to the pipe, for steps where the pipe itself is the focus. */
export function Caption({ big, small, color, mono = true }: { big: string; small?: string; color: string; mono?: boolean }) {
  return (
    <Pop k={`cap-${big}`}>
      <div className="flex flex-col items-start gap-1">
        <span className={`${mono ? 'font-mono' : ''} text-[26px] font-bold leading-tight`} style={{ color }}>
          {big}
        </span>
        {small && <span className="text-[15px] text-white/55">{small}</span>}
      </div>
    </Pop>
  );
}

// ── Side-by-side: wait for everything vs stream ─────────────────────────────
const SIM_TOTAL = 3200; // illustrative: the whole answer takes 3.2 s to write
const SIM_FIRST = 400; // illustrative: the first piece arrives after 0.4 s

function CompareColumn({
  title,
  color,
  seconds,
  text,
  waiting,
  firstAt,
  good,
}: {
  title: ReactNode;
  color: string;
  seconds: number;
  text: string;
  waiting: boolean;
  firstAt: string | null;
  good: boolean;
}) {
  return (
    <div className="min-h-0 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold" style={{ color }}>
          {title}
        </span>
        <span className="font-mono text-[24px] font-bold tabular-nums text-white/85">⏱ {(seconds / 1000).toFixed(1)} s</span>
      </div>
      <div className="flex-1 min-h-0 rounded-xl bg-black/60 border border-white/10 px-4 py-3 overflow-hidden">
        {waiting ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-white/40">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-white/40"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[15px]">waiting…</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[15px] leading-relaxed text-accent-green whitespace-pre-wrap"
          >
            {text}
            {!good || text.length === 0 ? null : <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-white/60" />}
          </motion.div>
        )}
      </div>
      <div className="h-9 flex items-center">
        {firstAt && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg px-3 py-1.5 text-[16px] font-semibold"
            style={{ color: good ? GREEN : GOLD, background: good ? `${GREEN}18` : `${GOLD}18` }}
          >
            first words after {firstAt}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function CompareView({ pieces, resetKey }: { pieces: string[]; resetKey: string }) {
  const t = useClock(true, resetKey, SIM_TOTAL + 200);
  const sim = Math.min(t, SIM_TOTAL);
  const n = pieces.length;
  const per = (SIM_TOTAL - SIM_FIRST) / Math.max(1, n - 1);
  const streamed = sim < SIM_FIRST ? 0 : Math.min(n, 1 + Math.floor((sim - SIM_FIRST) / per));
  const finished = sim >= SIM_TOTAL;
  const full = pieces.join('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        <CompareColumn
          title="Wait for all"
          color="rgba(255,255,255,0.7)"
          seconds={sim}
          text={finished ? full : ''}
          waiting={!finished}
          firstAt={finished ? `${(SIM_TOTAL / 1000).toFixed(1)} s` : null}
          good={false}
        />
        <CompareColumn
          title={
            <>
              Stream <span className="font-mono text-[15px]">(stream=True)</span>
            </>
          }
          color={GREEN}
          seconds={sim}
          text={pieces.slice(0, streamed).join('')}
          waiting={streamed === 0}
          firstAt={streamed > 0 ? `${(SIM_FIRST / 1000).toFixed(1)} s` : null}
          good
        />
      </div>
      <div className="shrink-0 text-center text-[13px] text-white/45">
        illustrative times · both finish at {(SIM_TOTAL / 1000).toFixed(1)} s
      </div>
    </motion.div>
  );
}
