'use client';
/**
 * Building blocks for GuardrailsAnim (Lesson 33): the boom-barrier gate that Cora
 * guards, the email envelope Max drafts, the "Human approval" card, job cards,
 * speech bubbles, the allowed switch, and the layered-safety picture.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot, { TEAM, BotMood } from '@/components/animations/characters/AgentBot';

export const ACCENT = '#22d3ee';
export const GREEN = '#4ade80';
export const RED = '#f87171';
export const AMBER = '#fbbf24';
export const INK = '#1c1c44';

/** The student at the keyboard: the human in "human-in-the-loop". */
export function Person({ size = 84, label = 'You', active = false, dimmed = false }: { size?: number; label?: string; active?: boolean; dimmed?: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={{ opacity: dimmed ? 0.35 : 1, y: active ? [0, -5, 0] : 0 }}
      transition={active ? { y: { repeat: Infinity, duration: 0.9 }, opacity: { duration: 0.3 } } : { duration: 0.3 }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.55,
          background: 'rgba(255,255,255,0.08)',
          border: `3px solid ${active ? AMBER : 'rgba(255,255,255,0.35)'}`,
          boxShadow: active ? `0 0 18px ${AMBER}66` : 'none',
        }}
      >
        🧑‍🎓
      </div>
      <div className="text-[13px] font-semibold text-white mt-1">{label}</div>
    </motion.div>
  );
}

export function Cora({ size = 100, mood = 'happy', active = false, dimmed = false }: { size?: number; mood?: BotMood; active?: boolean; dimmed?: boolean }) {
  return <AgentBot {...TEAM.critic} role={undefined} size={size} mood={mood} active={active} dimmed={dimmed} />;
}

export function Max({ size = 100, mood = 'happy', active = false, dimmed = false }: { size?: number; mood?: BotMood; active?: boolean; dimmed?: boolean }) {
  return <AgentBot {...TEAM.boss} role={undefined} size={size} mood={mood} active={active} dimmed={dimmed} />;
}

export type BarrierState = 'closed' | 'checking' | 'open' | 'blocked';

/** A striped boom barrier. The arm swings up to let things through. */
export function Barrier({ state, scale = 1 }: { state: BarrierState; scale?: number }) {
  const lamp = state === 'open' ? GREEN : state === 'blocked' ? RED : state === 'checking' ? AMBER : '#64748b';
  return (
    <div className="relative" style={{ width: 170 * scale, height: 104 * scale }}>
      <div className="absolute rounded-sm" style={{ right: 12 * scale, top: 24 * scale, width: 14 * scale, height: 80 * scale, background: '#64748b' }} />
      <motion.div
        className="absolute rounded-full"
        style={{ right: 10 * scale, top: 2 * scale, width: 18 * scale, height: 18 * scale }}
        animate={{ backgroundColor: lamp, boxShadow: `0 0 14px ${lamp}` }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          right: 19 * scale,
          top: 32 * scale,
          width: 150 * scale,
          height: 14 * scale,
          transformOrigin: 'right center',
          background: `repeating-linear-gradient(90deg, ${state === 'open' ? GREEN : RED} 0 ${18 * scale}px, #f8fafc ${18 * scale}px ${36 * scale}px)`,
        }}
        initial={false}
        animate={{ rotate: state === 'open' ? 90 : 0, x: state === 'blocked' ? [0, -4, 4, -3, 0] : 0 }}
        transition={{ rotate: { type: 'spring', stiffness: 110, damping: 14 }, x: { duration: 0.5 } }}
      />
    </div>
  );
}

/** A big SAFE / UNSAFE sign Cora holds up. */
export function VerdictSign({ verdict }: { verdict: 'SAFE' | 'UNSAFE' }) {
  const c = verdict === 'SAFE' ? GREEN : RED;
  return (
    <motion.div
      key={verdict}
      initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: -4 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      className="px-3 py-1 rounded-lg text-[22px] font-black tracking-widest"
      style={{ color: c, border: `3px solid ${c}`, background: `${c}1f` }}
    >
      {verdict}
    </motion.div>
  );
}

/** Small mono code chip, e.g. is_safe(request). */
export function CodeChip({ children, color = ACCENT, big = false }: { children: ReactNode; color?: string; big?: boolean }) {
  return (
    <div
      className={`font-mono rounded-lg px-3 py-1 whitespace-nowrap ${big ? 'text-[18px]' : 'text-[14px]'}`}
      style={{ color, background: `${color}14`, border: `1.5px solid ${color}88` }}
    >
      {children}
    </div>
  );
}

export type ItemPos = 'wait' | 'near' | 'passed' | 'blocked';

/**
 * Gate scene: the item (request or reply) waits on the left, Cora guards the
 * barrier in the middle, the destination waits on the right. When the gate
 * opens, the item travels over to the destination.
 */
export function GateScene({
  item,
  itemPos,
  coraMood,
  coraActive,
  sign,
  note,
  top,
  barrier,
  dest,
  label,
}: {
  item: ReactNode;
  itemPos: ItemPos;
  coraMood: BotMood;
  coraActive: boolean;
  sign?: 'SAFE' | 'UNSAFE';
  note?: ReactNode;
  top?: ReactNode;
  barrier: BarrierState;
  dest: ReactNode;
  label: string;
}) {
  const pos = {
    wait: { left: '0%', bottom: 44, scale: 1 },
    near: { left: '4%', bottom: 44, scale: 1 },
    blocked: { left: '0%', bottom: 44, scale: 1 },
    passed: { left: '66%', bottom: 176, scale: 0.9 },
  }[itemPos];
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="h-[44px] flex items-center justify-center">{top}</div>
      <div className="relative w-full" style={{ height: 350 }}>
        {/* road */}
        <div className="absolute left-0 right-0 border-t-2 border-dashed border-white/15" style={{ bottom: 30 }} />

        {/* Cora + the barrier */}
        <div className="absolute flex flex-col items-center" style={{ left: '34%', width: '32%', bottom: 30 }}>
          <div className="h-[48px] flex items-end justify-center">{sign ? <VerdictSign verdict={sign} /> : note}</div>
          <Cora size={96} mood={coraMood} active={coraActive} />
          <Barrier state={barrier} />
        </div>
        <div className="absolute text-[13px] text-white/45 font-semibold" style={{ left: '34%', width: '32%', bottom: 4, textAlign: 'center' }}>
          🚧 {label}
        </div>

        {/* destination */}
        <div className="absolute flex justify-center" style={{ right: '2%', width: '26%', bottom: 34 }}>
          {dest}
        </div>

        {/* the item travelling through */}
        <motion.div
          className="absolute z-20"
          style={{ width: '31%' }}
          initial={false}
          animate={{ ...pos, x: itemPos === 'blocked' ? [0, -8, 8, -6, 0] : 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {item}
          {itemPos === 'blocked' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-4 -right-3 text-[30px]"
            >
              ⛔
            </motion.div>
          )}
          {itemPos === 'passed' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-3 text-[26px]">
              ✅
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/** A paper slip with text on it (the request, or a tool result note). */
export function Slip({ title, text, tone = 'paper', size = 17 }: { title: string; text: string; tone?: 'paper' | 'yellow' | 'green' | 'amber' | 'red'; size?: number }) {
  const bg = { paper: '#f8fafc', yellow: '#fef3c7', green: '#dcfce7', amber: '#fde68a', red: '#fee2e2' }[tone];
  return (
    <div className="rounded-md px-3.5 py-2.5 shadow-xl" style={{ background: bg, color: INK }}>
      <div className="text-[13px] font-bold text-slate-500 mb-1">{title}</div>
      <div className="leading-snug font-medium" style={{ fontSize: size }}>{text}</div>
    </div>
  );
}

/** A speech bubble (white), pointing left or right. */
export function Bubble({ children, from = 'left', size = 18, border }: { children: ReactNode; from?: 'left' | 'right'; size?: number; border?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`rounded-2xl px-4 py-3 leading-snug font-medium shadow-lg bg-white ${from === 'left' ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
      style={{ color: INK, fontSize: size, border: border ? `3px solid ${border}` : undefined }}
    >
      {children}
    </motion.div>
  );
}

/** A job card (system prompt) shown big, with one phrase highlighted. */
export function JobCard({ who, text, color, highlight }: { who: string; text: string; color: string; highlight?: string }) {
  let body: ReactNode = text;
  if (highlight && text.includes(highlight)) {
    const [a, b] = text.split(highlight);
    body = (
      <>
        {a}
        <b className="px-1 rounded" style={{ background: `${AMBER}33`, color: AMBER }}>{highlight}</b>
        {b}
      </>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-xl p-4 border-2 max-w-[440px]"
      style={{ borderColor: color, background: `${color}12` }}
    >
      <div className="text-[14px] font-semibold mb-1.5" style={{ color }}>📋 {who}&apos;s job card</div>
      <div className="text-[18px] leading-snug text-white/90">{body}</div>
    </motion.div>
  );
}

/** A rubber stamp (PRETEND, RISKY, NOT SENT) that thumps down onto a card. */
export function Stamp({ text, color, className = '' }: { text: string; color: string; className?: string }) {
  return (
    <motion.div
      key={text}
      initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
      animate={{ scale: 1, opacity: 1, rotate: -12 }}
      transition={{ type: 'spring', damping: 12, stiffness: 180 }}
      className={`pointer-events-none px-2.5 py-0.5 rounded-lg text-[20px] font-black tracking-widest whitespace-nowrap ${className}`}
      style={{ color, border: `4px solid ${color}`, background: 'rgba(255,255,255,0.92)' }}
    >
      {text}
    </motion.div>
  );
}

/** The email Max drafted, as a big envelope. */
export function Envelope({
  to,
  message,
  width = 440,
  title = '✉️ Email',
  stamp,
  dim = false,
}: {
  to: string;
  message: string;
  width?: number;
  title?: string;
  stamp?: { text: string; color: string };
  dim?: boolean;
}) {
  return (
    <div className="relative" style={{ width }}>
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: '#f8fafc', color: INK, opacity: dim ? 0.55 : 1 }}>
        {/* envelope flap */}
        <svg viewBox="0 0 100 14" preserveAspectRatio="none" className="block w-full" style={{ height: 34 }} aria-hidden>
          <path d="M0 0 L50 13 L100 0" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
        </svg>
        <div className="px-5 pb-4 -mt-1">
          <div className="text-[13px] font-bold text-slate-500">{title}</div>
          <div className="text-[16px] mt-1">
            <span className="text-slate-500">To:</span> <b>{to}</b>
          </div>
          <div className="text-[19px] leading-snug mt-1.5 font-medium">&ldquo;{message}&rdquo;</div>
        </div>
      </div>
      {stamp && <Stamp text={stamp.text} color={stamp.color} className="absolute -top-4 -right-4" />}
    </div>
  );
}

/** The order slip (tool call) Max hands over. */
export function OrderSlip({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`rounded-md shadow-lg ${small ? 'px-2.5 py-1.5' : 'px-4 py-3'}`}
      style={{ background: '#fef3c7', color: INK }}
    >
      <div className={`font-semibold ${small ? 'text-[13px]' : 'text-[14px]'} text-slate-600`}>📝 tool call</div>
      <div className={`font-mono font-bold ${small ? 'text-[14px]' : 'text-[20px]'}`}>send_email</div>
      {!small && <div className="font-mono text-[15px] text-slate-600">(to, body)</div>}
    </div>
  );
}

/** The "allowed" on/off switch. */
export function AllowedSwitch({ on }: { on: boolean }) {
  const c = on ? GREEN : RED;
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[22px] text-white/90">allowed</span>
      <motion.div
        className="relative rounded-full"
        style={{ width: 96, height: 48 }}
        initial={false}
        animate={{ backgroundColor: `${c}44` }}
      >
        <motion.div
          className="absolute top-1 rounded-full"
          style={{ width: 40, height: 40 }}
          initial={false}
          animate={{ left: on ? 52 : 4, backgroundColor: c }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        />
      </motion.div>
      <span className="font-mono text-[24px] font-bold" style={{ color: c }}>
        {on ? 'True' : 'False'}
      </span>
    </div>
  );
}

/** The Human approval card: a person, what Max wants to do, Allow / Deny. */
export function ApprovalCard({ to, message, choice }: { to: string; message: string; choice: 'y' | 'n' | null }) {
  const btn = (kind: 'y' | 'n') => {
    const picked = choice === kind;
    const other = choice !== null && !picked;
    const c = kind === 'y' ? GREEN : RED;
    return (
      <motion.div
        initial={false}
        animate={{ scale: picked ? 1.08 : 1, opacity: other ? 0.3 : 1 }}
        className="flex-1 rounded-xl py-2.5 text-center text-[18px] font-bold"
        style={{
          color: picked ? INK : c,
          background: picked ? c : `${c}18`,
          border: `2px solid ${c}`,
          boxShadow: picked ? `0 0 20px ${c}88` : 'none',
        }}
      >
        {kind === 'y' ? '✅ Allow (y)' : '✋ Deny (n)'}
      </motion.div>
    );
  };
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-[520px] max-w-full rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: '#141438', border: `2px solid ${AMBER}`, boxShadow: `0 0 30px ${AMBER}22` }}
    >
      <div className="flex items-center gap-4">
        <Person size={72} label="You" active={choice === null} />
        <div>
          <div className="text-[22px] font-bold" style={{ color: AMBER }}>Human approval</div>
          <div className="text-[16px] text-white/75">
            Max wants to <span className="font-mono text-white">send_email</span>
          </div>
        </div>
      </div>
      <div className="rounded-lg px-4 py-3 bg-white/5 border border-white/10">
        <div className="text-[15px] text-white/60">
          To: <b className="text-white">{to}</b>
        </div>
        <div className="text-[18px] leading-snug text-white mt-1">&ldquo;{message}&rdquo;</div>
      </div>
      <div className="flex gap-4">
        {btn('y')}
        {btn('n')}
      </div>
      {choice === null ? (
        <motion.div
          className="text-center text-[15px] text-white/70"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          ⏳ waiting for you…
        </motion.div>
      ) : (
        <div className="text-center text-[15px] text-white/80">
          you typed <span className="font-mono font-bold text-white">{choice}</span>
        </div>
      )}
    </motion.div>
  );
}

/** Layers of safety: each has holes, but together they stop the problem. */
export function Layers() {
  const layers = [
    { icon: '🧐', label: 'Checker', color: TEAM.critic.color, holes: [22, 64] },
    { icon: '🙋', label: 'Human OK', color: AMBER, holes: [44] },
    { icon: '🧰', label: 'Few tools', color: ACCENT, holes: [76] },
  ];
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-end gap-10" style={{ height: 300 }}>
        {/* the problem: slips through layer 1's hole (a dashed trail stays behind), stopped by layer 2 */}
        <motion.div
          className="absolute z-10 border-t-[3px] border-dashed"
          style={{ top: 96, left: -70, width: 238, borderColor: `${AMBER}aa`, transformOrigin: 'left center' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute z-10 text-[30px] leading-none"
          style={{ top: 80 }}
          initial={{ left: -80 }}
          animate={{ left: 122 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        >
          ⚠️
        </motion.div>
        <motion.div
          className="absolute z-10 text-[14px] font-bold whitespace-nowrap px-1.5 rounded"
          style={{ top: 44, left: 104, color: AMBER, background: '#0a0a1a' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          missed!
        </motion.div>
        <motion.div
          className="absolute z-10 text-[30px] leading-none"
          style={{ top: 80, left: 170 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          ✋
        </motion.div>
        <motion.div
          className="absolute z-10 text-[14px] font-bold whitespace-nowrap px-1.5 rounded"
          style={{ top: 86, left: 204, color: GREEN, background: '#0a0a1a' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          stopped!
        </motion.div>
        {layers.map((l) => (
          <div key={l.label} className="flex flex-col items-center gap-2">
            <div
              className="relative rounded-xl"
              style={{ width: 120, height: 250, background: `${l.color}2a`, border: `3px solid ${l.color}` }}
            >
              {l.holes.map((h) => (
                <div
                  key={h}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full bg-navy-900"
                  style={{ top: `${h}%`, width: 46, height: 46, border: `2px dashed ${l.color}88` }}
                />
              ))}
            </div>
            <div className="text-[16px] font-semibold" style={{ color: l.color }}>
              {l.icon} {l.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
