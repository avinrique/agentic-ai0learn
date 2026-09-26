'use client';
import { motion } from 'framer-motion';

export type BotMood = 'happy' | 'thinking' | 'working' | 'tired' | 'confused' | 'sleeping' | 'proud';

interface AgentBotProps {
  /** Body colour — each agent in a team gets its own. */
  color: string;
  /** Role badge on the chest, e.g. '🔍' for a researcher. */
  badge?: string;
  /** Name shown under the robot. */
  name?: string;
  /** Small caption under the name, e.g. its job. */
  role?: string;
  mood?: BotMood;
  /** Pixel width of the robot (height scales with it). */
  size?: number;
  /** Bounce + glow to show "this agent is working right now". */
  active?: boolean;
  /** Dim the robot when it's not part of the current step. */
  dimmed?: boolean;
}

// A friendly cartoon robot drawn in SVG. Every Part 4 animation uses it, so the
// same agent always looks the same from lesson to lesson.
export default function AgentBot({
  color,
  badge,
  name,
  role,
  mood = 'happy',
  size = 72,
  active = false,
  dimmed = false,
}: AgentBotProps) {
  const eyesClosed = mood === 'sleeping';
  const eyeY = mood === 'tired' ? 34 : 32;

  const mouth = {
    happy: 'M40 46 Q50 54 60 46',
    proud: 'M38 45 Q50 57 62 45',
    working: 'M42 48 L58 48',
    thinking: 'M44 49 Q50 46 56 49',
    tired: 'M40 51 Q50 45 60 51',
    confused: 'M40 49 Q45 45 50 49 Q55 53 60 49',
    sleeping: 'M45 49 Q50 52 55 49',
  }[mood];

  return (
    <motion.div
      className="flex flex-col items-center select-none"
      animate={{ opacity: dimmed ? 0.35 : 1, y: active ? [0, -6, 0] : 0 }}
      transition={active ? { y: { repeat: Infinity, duration: 0.9 }, opacity: { duration: 0.3 } } : { duration: 0.3 }}
      style={{ width: size }}
    >
      <svg viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden>
        {active && <circle cx="50" cy="55" r="48" fill={color} opacity="0.15" />}
        {/* antenna */}
        <line x1="50" y1="6" x2="50" y2="16" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="50"
          cy="6"
          r="4.5"
          fill={active ? '#fbbf24' : color}
          animate={active ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={active ? { repeat: Infinity, duration: 0.8 } : undefined}
        />
        {/* head */}
        <rect x="18" y="16" width="64" height="46" rx="16" fill="#1c1c44" stroke={color} strokeWidth="3.5" />
        {/* ears */}
        <rect x="11" y="30" width="7" height="16" rx="3" fill={color} />
        <rect x="82" y="30" width="7" height="16" rx="3" fill={color} />
        {/* eyes */}
        {eyesClosed ? (
          <>
            <path d="M31 33 Q36 37 41 33" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M59 33 Q64 37 69 33" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="36" cy={eyeY} r="6" fill="white" />
            <circle cx="64" cy={eyeY} r="6" fill="white" />
            <circle cx={mood === 'thinking' ? 38 : 36} cy={eyeY - (mood === 'thinking' ? 2 : 0)} r="3" fill="#0a0a1a" />
            <circle cx={mood === 'thinking' ? 66 : 64} cy={eyeY - (mood === 'thinking' ? 2 : 0)} r="3" fill="#0a0a1a" />
            {mood === 'tired' && (
              <>
                <line x1="29" y1="28" x2="43" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
                <line x1="57" y1="30" x2="71" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </>
        )}
        {/* mouth */}
        <path d={mouth} stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* cheeks */}
        {(mood === 'happy' || mood === 'proud') && (
          <>
            <circle cx="27" cy="46" r="3.5" fill="#f472b6" opacity="0.6" />
            <circle cx="73" cy="46" r="3.5" fill="#f472b6" opacity="0.6" />
          </>
        )}
        {/* body */}
        <rect x="26" y="66" width="48" height="36" rx="12" fill={color} />
        <rect x="32" y="72" width="36" height="24" rx="8" fill="#1c1c44" opacity="0.85" />
        {badge && (
          <text x="50" y="90" textAnchor="middle" fontSize="16">
            {badge}
          </text>
        )}
        {/* arms */}
        <rect x="14" y="70" width="10" height="24" rx="5" fill={color} />
        <rect x="76" y="70" width="10" height="24" rx="5" fill={color} />
        {mood === 'thinking' && (
          <text x="86" y="16" fontSize="16" fill="#fbbf24">?</text>
        )}
        {mood === 'confused' && (
          <text x="84" y="16" fontSize="16" fill="#f87171">?!</text>
        )}
        {mood === 'sleeping' && (
          <text x="82" y="16" fontSize="13" fill="#a78bfa">z z</text>
        )}
        {mood === 'tired' && (
          <path d="M84 22 Q87 28 84 31 Q81 28 84 22" fill="#4a9eff" />
        )}
      </svg>
      {name && (
        <div className="text-[13px] font-semibold text-white leading-tight mt-1 text-center whitespace-nowrap">{name}</div>
      )}
      {role && <div className="text-[11px] text-white/50 leading-tight text-center">{role}</div>}
    </motion.div>
  );
}

/** The standard cast, so every Part 4 lesson uses the same names, colours and badges. */
export const TEAM = {
  solo: { name: 'Solo Bot', color: '#94a3b8', badge: '🤖', role: 'does everything' },
  researcher: { name: 'Rita', color: '#4a9eff', badge: '🔍', role: 'Researcher' },
  writer: { name: 'Wally', color: '#4ade80', badge: '✍️', role: 'Writer' },
  critic: { name: 'Cora', color: '#f472b6', badge: '🧐', role: 'Critic' },
  boss: { name: 'Max', color: '#fbbf24', badge: '👑', role: 'Boss' },
  math: { name: 'Milo', color: '#a78bfa', badge: '🧮', role: 'Math whiz' },
  receptionist: { name: 'Rosa', color: '#22d3ee', badge: '🛎️', role: 'Receptionist' },
} as const;
