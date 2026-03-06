'use client';
import { motion } from 'framer-motion';
import { useConceptStore } from '@/stores/conceptStore';

const spring = { type: 'spring' as const, damping: 25, stiffness: 120 };
const smooth = { duration: 0.6, ease: 'easeInOut' as const };

const roleColors: Record<string, string> = {
  system: '#a78bfa',
  user: '#4a9eff',
  assistant: '#4ade80',
};

interface Msg {
  role: string;
  content: string;
}

const conversationMessages: Msg[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is Python?' },
  { role: 'assistant', content: 'Python is a programming language...' },
  { role: 'user', content: 'What about JavaScript?' },
  { role: 'assistant', content: 'JavaScript is a web scripting language...' },
  { role: 'user', content: 'Which is better for beginners?' },
];

function MsgBubble({
  msg,
  dimmed = false,
  resent = false,
  resentDelay = 0.3,
  scale = 1,
  highlight = false,
  fading = false,
  isNew = false,
}: {
  msg: Msg;
  dimmed?: boolean;
  resent?: boolean;
  resentDelay?: number;
  scale?: number;
  highlight?: boolean;
  fading?: boolean;
  isNew?: boolean;
}) {
  const color = roleColors[msg.role] || '#fff';
  return (
    <motion.div
      layout
      className="flex items-start gap-2 px-3 py-2 rounded-lg border relative"
      style={{
        borderColor: isNew ? `${color}80` : highlight ? `${color}80` : `${color}40`,
        backgroundColor: isNew ? `${color}15` : highlight ? `${color}15` : `${color}08`,
      }}
      animate={{
        opacity: fading ? 0.15 : dimmed ? 0.35 : 1,
        scale,
        boxShadow: isNew
          ? `0 0 16px ${color}40`
          : highlight
            ? `0 0 12px ${color}30`
            : '0 0 0px transparent',
      }}
      transition={spring}
    >
      <span
        className="text-xs font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
        style={{ color, backgroundColor: `${color}20` }}
      >
        {msg.role}
      </span>
      <span className="text-sm text-white/70 flex-1">{msg.content}</span>
      {isNew && (
        <motion.span
          className="text-sm px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green font-bold shrink-0"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          NEW ←
        </motion.span>
      )}
      {resent && (
        <motion.span
          className="text-sm px-1.5 py-0.5 rounded bg-accent-gold/20 text-accent-gold font-bold shrink-0"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: resentDelay }}
        >
          RE-SENT
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ContextMemoryAnim() {
  const { currentStep } = useConceptStore();
  const s = currentStep;

  // Cost bar chart animation
  const costBars = [
    { call: 1, tokens: 85, cost: '' },
    { call: 2, tokens: 127, cost: '' },
    { call: 3, tokens: 384, cost: '' },
    { call: 5, tokens: 1200, cost: '$0.004' },
    { call: 10, tokens: 4800, cost: '$0.014' },
    { call: 20, tokens: 12000, cost: '$0.036' },
  ];

  // Step 3 messages: system + user
  const step3Msgs = conversationMessages.slice(0, 2);
  // Step 4 messages: system + user + assistant (new)
  const step4Msgs = conversationMessages.slice(0, 3);
  // Step 5 messages: system + user + assistant + new user
  const step5Msgs = conversationMessages.slice(0, 4);

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* ===== ACT 1: THE BRIDGE (Steps 0-2) ===== */}

      {/* Step 0: Chat UI → Question mark split screen */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 0 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-8 w-full max-w-2xl px-6">
          {/* Chat UI side */}
          <motion.div
            className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4"
            animate={{ opacity: s === 0 ? 1 : 0, x: s === 0 ? 0 : -20 }}
            transition={spring}
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs text-accent-blue/60">You:</span>
                <span className="text-xs text-white/60">My name is Alex</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-accent-green/60">AI:</span>
                <span className="text-xs text-white/60">Nice to meet you, Alex!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-accent-blue/60">You:</span>
                <span className="text-xs text-white/60">What&apos;s my name?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-accent-green/60">AI:</span>
                <span className="text-xs text-white/60">Your name is Alex!</span>
              </div>
            </div>
            <p className="text-sm text-white/30 mt-3 text-center">
              It FEELS like it remembers...
            </p>
          </motion.div>

          {/* Question mark */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            animate={{
              opacity: s === 0 ? 1 : 0,
              scale: s === 0 ? 1 : 0.8,
            }}
            transition={spring}
          >
            <motion.span
              className="text-7xl text-accent-purple"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ?
            </motion.span>
            <p className="text-sm text-white/40 mt-4">How does it work?</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 1: Messages Array reveal */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 1 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-md w-full px-6">
          <motion.p
            className="text-xs text-white/30 font-mono mb-2"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            messages = [
          </motion.p>
          <div className="space-y-2 pl-3">
            {conversationMessages.slice(0, 4).map((msg, i) => (
              <motion.div
                key={`arr-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: s === 1 ? 1 : 0,
                  x: s === 1 ? 0 : -20,
                }}
                transition={{ ...spring, delay: 0.2 + i * 0.15 }}
              >
                <MsgBubble msg={msg} />
              </motion.div>
            ))}
          </div>
          <motion.p
            className="text-xs text-white/30 font-mono mt-2"
            animate={{ opacity: s === 1 ? 1 : 0 }}
            transition={{ ...spring, delay: 0.8 }}
          >
            ]
          </motion.p>
        </div>
      </motion.div>

      {/* Step 2: Three Roles Cards */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: s === 2 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex gap-5 px-6">
          {[
            {
              role: 'System',
              color: '#a78bfa',
              job: 'Instructs',
              example: '"You are a helpful coding assistant."',
            },
            {
              role: 'User',
              color: '#4a9eff',
              job: 'Asks',
              example: '"How do I sort a list in Python?"',
            },
            {
              role: 'Assistant',
              color: '#4ade80',
              job: 'Answers',
              example: '"Use the sorted() function..."',
            },
          ].map((card, i) => (
            <motion.div
              key={card.role}
              className="rounded-xl border-2 p-5 w-48 text-center"
              style={{
                borderColor: `${card.color}40`,
                backgroundColor: `${card.color}08`,
              }}
              animate={{
                opacity: s === 2 ? 1 : 0,
                y: s === 2 ? 0 : 20,
              }}
              transition={{ ...spring, delay: i * 0.15 }}
            >
              <p
                className="text-lg font-bold mb-1"
                style={{ color: card.color }}
              >
                {card.role}
              </p>
              <p className="text-sm text-white/50 mb-3">{card.job}</p>
              <p className="text-xs text-white/40 italic">{card.example}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== ACT 2: THE ILLUSION (Steps 3-6) ===== */}

      {/* Step 3: "Your First API Call" — clean two-column layout */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 3 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-6 w-full max-w-2xl">
          {/* Left: Messages array */}
          <motion.div
            className="flex-1"
            animate={{ opacity: s === 3 ? 1 : 0, x: s === 3 ? 0 : -20 }}
            transition={spring}
          >
            <p className="text-xs text-white/40 mb-2 font-mono">API Call #1</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm text-white/30 mb-2 font-mono">messages = [</p>
              <div className="space-y-1.5 pl-2">
                {step3Msgs.map((msg, i) => (
                  <motion.div
                    key={`s3-${i}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: s === 3 ? 1 : 0, x: s === 3 ? 0 : -15 }}
                    transition={{ ...spring, delay: 0.2 + i * 0.15 }}
                  >
                    <MsgBubble msg={msg} />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-white/30 mt-2 font-mono">]</p>
            </div>
          </motion.div>

          {/* Center: Dashed animated arrow */}
          <motion.svg
            className="shrink-0"
            width="80"
            height="30"
            viewBox="0 0 80 30"
            animate={{ opacity: s === 3 ? 0.6 : 0 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <motion.line
              x1="0" y1="15" x2="60" y2="15"
              stroke="#4a9eff"
              strokeWidth={2}
              strokeDasharray="8 4"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <polygon points="65,10 75,15 65,20" fill="#4a9eff" opacity={0.5} />
          </motion.svg>

          {/* Right: LLM brain + response */}
          <motion.div
            className="flex flex-col items-center gap-4"
            animate={{ opacity: s === 3 ? 1 : 0, x: s === 3 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <motion.div
              className="w-24 h-24 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center"
              animate={{
                boxShadow: s === 3
                  ? '0 0 20px rgba(74,158,255,0.2)'
                  : '0 0 0px transparent',
              }}
              transition={spring}
            >
              <span className="text-4xl">🧠</span>
            </motion.div>
            <p className="text-xs text-white/30">LLM</p>

            {/* Response bubble slides in */}
            <motion.div
              className="px-3 py-2 rounded-lg border max-w-[200px]"
              style={{ borderColor: '#4ade8040', backgroundColor: '#4ade8008' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: s === 3 ? 1 : 0, y: s === 3 ? 0 : 10 }}
              transition={{ ...spring, delay: 0.8 }}
            >
              <span className="text-xs text-accent-green">
                &quot;Python is a programming language...&quot;
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom-left: Token counter */}
        <motion.div
          className="absolute bottom-8 left-8"
          animate={{ opacity: s === 3 ? 1 : 0 }}
          transition={{ ...spring, delay: 1 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Tokens:</span>
            <span className="text-sm font-bold font-mono text-accent-gold">~85</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Step 4: "The Response Comes Back" — messages array is the star */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 4 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-6 w-full max-w-2xl">
          {/* Center-left: Messages array with new assistant message */}
          <motion.div
            className="flex-1"
            animate={{ opacity: s === 4 ? 1 : 0, x: s === 4 ? 0 : -20 }}
            transition={spring}
          >
            <p className="text-xs text-white/40 mb-2 font-mono">Your messages array now:</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm text-white/30 mb-2 font-mono">messages = [</p>
              <div className="space-y-1.5 pl-2 max-h-[55%] overflow-y-auto">
                {step4Msgs.map((msg, i) => (
                  <motion.div
                    key={`s4-${i}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: s === 4 ? 1 : 0, x: s === 4 ? 0 : -15 }}
                    transition={{ ...spring, delay: 0.1 + i * 0.12 }}
                  >
                    <MsgBubble
                      msg={msg}
                      isNew={i === 2}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-white/30 mt-2 font-mono">]</p>
            </div>

            {/* Annotation arrow */}
            <motion.p
              className="text-sm text-white/40 mt-2 text-center italic"
              animate={{ opacity: s === 4 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.6 }}
            >
              ↑ You append the response to YOUR array
            </motion.p>
          </motion.div>

          {/* Dashed arrow FROM LLM back to array */}
          <motion.svg
            className="shrink-0"
            width="80"
            height="30"
            viewBox="0 0 80 30"
            animate={{ opacity: s === 4 ? 0.5 : 0 }}
            transition={{ ...spring, delay: 0.4 }}
          >
            <motion.line
              x1="75" y1="15" x2="15" y2="15"
              stroke="#4ade80"
              strokeWidth={2}
              strokeDasharray="8 4"
              animate={{ strokeDashoffset: [0, 24] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <polygon points="10,10 0,15 10,20" fill="#4ade80" opacity={0.5} />
          </motion.svg>

          {/* Right: LLM brain with red X */}
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ opacity: s === 4 ? 1 : 0, x: s === 4 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <motion.div
              className="w-24 h-24 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center relative"
              animate={{
                boxShadow: '0 0 10px rgba(74,158,255,0.1)',
              }}
              transition={spring}
            >
              <span className="text-4xl">🧠</span>
              <motion.span
                className="absolute -top-2 -right-2 text-3xl text-red-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: s === 4 ? 1 : 0, scale: s === 4 ? 1 : 0 }}
                transition={{ ...spring, delay: 0.5 }}
              >
                ✕
              </motion.span>
            </motion.div>
            <p className="text-xs text-white/30">LLM</p>
            <motion.p
              className="text-sm text-red-400/80 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: s === 4 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.6 }}
            >
              No memory!
            </motion.p>
            <motion.p
              className="text-sm text-white/30 max-w-[140px] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: s === 4 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.8 }}
            >
              Already forgot everything about Call #1
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom-left: Token counter */}
        <motion.div
          className="absolute bottom-8 left-8"
          animate={{ opacity: s === 4 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Tokens:</span>
            <span className="text-sm font-bold font-mono text-accent-gold">~127</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Step 5: "The Second Call — The Trick" — the aha moment */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 5 ? 1 : 0 }}
        transition={spring}
      >
        <div className="flex items-center gap-6 w-full max-w-2xl">
          {/* Left: Messages array with amber re-send highlight */}
          <motion.div
            className="flex-1"
            animate={{ opacity: s === 5 ? 1 : 0, x: s === 5 ? 0 : -20 }}
            transition={spring}
          >
            <p className="text-xs text-white/40 mb-2 font-mono">API Call #2</p>
            <div
              className="rounded-xl border p-3"
              style={{
                borderColor: 'rgba(251,191,36,0.25)',
                backgroundColor: 'rgba(251,191,36,0.03)',
              }}
            >
              <p className="text-sm text-white/30 mb-2 font-mono">messages = [</p>
              <div className="space-y-1.5 pl-2 max-h-[55%] overflow-y-auto">
                {step5Msgs.map((msg, i) => {
                  const isLast = i === step5Msgs.length - 1;
                  return (
                    <motion.div
                      key={`s5-${i}`}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: s === 5 ? 1 : 0, x: s === 5 ? 0 : -15 }}
                      transition={{ ...spring, delay: 0.1 + i * 0.12 }}
                    >
                      <MsgBubble
                        msg={msg}
                        resent={!isLast}
                        resentDelay={0.4 + i * 0.2}
                        highlight={isLast}
                        isNew={isLast}
                      />
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-sm text-white/30 mt-2 font-mono">]</p>
            </div>

            <motion.p
              className="text-sm text-accent-gold mt-2 text-center"
              animate={{ opacity: s === 5 ? 1 : 0 }}
              transition={{ ...spring, delay: 1.2 }}
            >
              Every previous message re-sent
            </motion.p>
          </motion.div>

          {/* Center: Thick pulsing arrow */}
          <motion.svg
            className="shrink-0"
            width="80"
            height="30"
            viewBox="0 0 80 30"
            animate={{ opacity: s === 5 ? 0.7 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <motion.line
              x1="0" y1="15" x2="60" y2="15"
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="8 4"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <polygon points="65,8 78,15 65,22" fill="#fbbf24" opacity={0.6} />
          </motion.svg>

          {/* Right: LLM brain — sees it fresh */}
          <motion.div
            className="flex flex-col items-center gap-2 shrink-0"
            animate={{ opacity: s === 5 ? 1 : 0, x: s === 5 ? 0 : 20 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <motion.div
              className="w-24 h-24 rounded-2xl border-2 border-accent-blue/30 bg-accent-blue/5 flex items-center justify-center"
              animate={{
                boxShadow: s === 5
                  ? '0 0 20px rgba(74,158,255,0.2)'
                  : '0 0 0px transparent',
              }}
              transition={spring}
            >
              <span className="text-4xl">🧠</span>
            </motion.div>
            <p className="text-xs text-white/30">LLM</p>
            <motion.p
              className="text-sm text-white/50 max-w-[150px] text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: s === 5 ? 1 : 0 }}
              transition={{ ...spring, delay: 0.7 }}
            >
              Sees it all fresh — zero memory of Call #1
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom-left: Token counter with jump */}
        <motion.div
          className="absolute bottom-8 left-8"
          animate={{ opacity: s === 5 ? 1 : 0 }}
          transition={{ ...spring, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Tokens:</span>
            <motion.span
              className="text-sm font-bold font-mono text-accent-gold"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={spring}
            >
              ~384
            </motion.span>
            <motion.span
              className="text-xs text-accent-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: s === 5 ? 1 : 0 }}
              transition={{ ...spring, delay: 1 }}
            >
              ↑ jumped!
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* Step 6: Growing Cost bar chart + real-world cost */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 6 ? 1 : 0 }}
        transition={spring}
      >
        <p className="text-white/40 text-base font-medium mb-4">
          Token cost per API call
        </p>
        <div className="flex items-end gap-3 h-36 max-w-lg w-full justify-center">
          {costBars.map((bar, i) => {
            const maxTokens = 12000;
            const heightPct = (bar.tokens / maxTokens) * 100;
            const colorStop =
              i <= 1
                ? '#4a9eff'
                : i <= 3
                  ? '#fbbf24'
                  : '#ef4444';
            return (
              <motion.div
                key={bar.call}
                className="flex flex-col items-center gap-1"
                animate={{
                  opacity: s === 6 ? 1 : 0,
                  y: s === 6 ? 0 : 20,
                }}
                transition={{ ...smooth, delay: i * 0.12 }}
              >
                {bar.cost && (
                  <span className="text-xs text-white/40">{bar.cost}</span>
                )}
                <motion.div
                  className="w-10 rounded-t-md"
                  style={{ backgroundColor: colorStop }}
                  animate={{
                    height: s === 6 ? `${Math.max(heightPct * 1.6, 8)}px` : '0px',
                  }}
                  transition={{ ...smooth, delay: 0.3 + i * 0.12 }}
                />
                <span className="text-sm text-white/50">
                  Call {bar.call}
                </span>
                <span className="text-xs text-white/30 font-mono">
                  {bar.tokens.toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Real-world cost example */}
        <motion.div
          className="mt-4 max-w-md w-full rounded-xl border border-accent-gold/30 bg-accent-gold/5 px-4 py-3"
          animate={{ opacity: s === 6 ? 1 : 0, y: s === 6 ? 0 : 10 }}
          transition={{ ...spring, delay: 1.2 }}
        >
          <p className="text-xs text-white/50 text-center mb-2">Real-world example: GPT-4 customer support bot</p>
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-sm font-mono text-accent-blue">20 msgs/chat</p>
              <p className="text-sm text-white/30">~$0.36/chat</p>
            </div>
            <span className="text-white/20">×</span>
            <div>
              <p className="text-sm font-mono text-accent-gold">1,000 chats/day</p>
              <p className="text-sm text-white/30">$360/day</p>
            </div>
            <span className="text-white/20">=</span>
            <motion.div
              animate={{ scale: s === 6 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}
            >
              <p className="text-lg font-bold font-mono text-red-400">$10,800</p>
              <p className="text-sm text-red-400/60">/month</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ===== ACT 3: THE LIMIT (Steps 7-9) ===== */}

      {/* Step 7: Hitting the Wall — real model context windows */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 7 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-xl w-full">
          <motion.p
            className="text-sm text-white/50 mb-4 text-center"
            animate={{ opacity: s === 7 ? 1 : 0 }}
            transition={spring}
          >
            Every model has a <span className="text-red-400 font-semibold">maximum context window</span>
          </motion.p>

          {/* Real model comparison */}
          <div className="space-y-2 mb-5">
            {[
              { name: 'GPT-3.5', tokens: '4K', pct: 3, color: '#10a37f', pages: '~6 pages' },
              { name: 'GPT-4', tokens: '8K', pct: 6, color: '#10a37f', pages: '~12 pages' },
              { name: 'Claude 3', tokens: '200K', pct: 100, color: '#d97706', pages: '~300 pages (a novel!)' },
              { name: 'GPT-4 Turbo', tokens: '128K', pct: 64, color: '#10a37f', pages: '~200 pages' },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                className="flex items-center gap-3"
                animate={{ opacity: s === 7 ? 1 : 0, x: s === 7 ? 0 : -15 }}
                transition={{ ...spring, delay: 0.2 + i * 0.15 }}
              >
                <span className="text-xs text-white/50 w-24 text-right font-mono">{model.name}</span>
                <div className="flex-1 h-5 bg-navy-900 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: model.color }}
                    animate={{ width: s === 7 ? `${model.pct}%` : '0%' }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 + i * 0.15 }}
                  />
                </div>
                <span className="text-xs text-white/40 w-16">{model.tokens}</span>
                <span className="text-sm text-white/25 w-32">{model.pages}</span>
              </motion.div>
            ))}
          </div>

          {/* What happens when full */}
          <motion.div
            className="flex items-center justify-center gap-3"
            animate={{ opacity: s === 7 ? 1 : 0, scale: s === 7 ? 1 : 0.9 }}
            transition={{ ...spring, delay: 1.5 }}
          >
            <span className="px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-bold">
              CONTEXT FULL?
            </span>
            <span className="text-xs text-white/30">→ API returns an error. Your app crashes.</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 8: Drop Old Messages */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 8 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-md w-full">
          <p className="text-sm text-white/40 mb-3 text-center">Strategy 1: <span className="text-white/60 font-semibold">Drop Old Messages</span></p>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            {/* System prompt stays */}
            <motion.div
              className="px-3 py-2 rounded-lg border border-accent-purple/40 bg-accent-purple/10 mb-2"
              animate={{ opacity: 1 }}
              transition={spring}
            >
              <span className="text-xs text-accent-purple font-bold">SYSTEM</span>
              <span className="text-xs text-white/50 ml-2">&quot;You are a travel assistant&quot; — Always kept ✓</span>
            </motion.div>

            {/* Real conversation messages fading */}
            {[
              { role: 'User', text: 'Plan a trip to Japan', color: '#4a9eff' },
              { role: 'Asst', text: 'I recommend Tokyo for 3 days...', color: '#4ade80' },
              { role: 'User', text: 'What about food?', color: '#4a9eff' },
              { role: 'Asst', text: 'Try ramen in Shibuya, sushi in Tsukiji...', color: '#4ade80' },
              { role: 'User', text: 'Hotel recommendations?', color: '#4a9eff' },
              { role: 'Asst', text: 'Shinjuku has great options...', color: '#4ade80' },
              { role: 'User', text: 'What about Kyoto?', color: '#4a9eff' },
              { role: 'Asst', text: 'Kyoto has temples and gardens...', color: '#4ade80' },
            ].map((msg, i) => (
              <motion.div
                key={i}
                className="px-2 py-1 rounded mb-1 text-xs border relative overflow-hidden"
                style={{
                  color: `${msg.color}80`,
                  borderColor: i < 6 ? '#ffffff08' : `${msg.color}20`,
                }}
                animate={{
                  opacity: s === 8 ? (i < 6 ? 0.1 : 0.8) : 0.5,
                  height: s === 8 && i < 6 ? '0px' : 'auto',
                  marginBottom: s === 8 && i < 6 ? '0px' : '4px',
                  paddingTop: s === 8 && i < 6 ? '0px' : '4px',
                  paddingBottom: s === 8 && i < 6 ? '0px' : '4px',
                }}
                transition={{ ...smooth, delay: 0.5 + i * 0.08 }}
              >
                <span className="font-bold">{msg.role}:</span> {msg.text}
                {s === 8 && i < 6 && (
                  <motion.span
                    className="absolute right-1 top-0.5 text-xs text-red-400/60"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                  >
                    dropped
                  </motion.span>
                )}
              </motion.div>
            ))}

            {/* New message */}
            <motion.div
              className="px-2 py-1 rounded text-xs text-accent-blue border border-accent-blue/20 font-semibold"
              animate={{ opacity: s === 8 ? 1 : 0 }}
              transition={{ ...spring, delay: 1.5 }}
            >
              User: Best day trips from Kyoto?
            </motion.div>
          </div>

          {/* Progress bar drops */}
          <div className="mt-3">
            <div className="h-3 bg-navy-900 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full rounded-full bg-accent-green"
                animate={{ width: s === 8 ? '35%' : '95%' }}
                transition={{ ...smooth, delay: 1.2 }}
              />
            </div>
            <motion.p
              className="text-sm text-accent-green text-center mt-1"
              animate={{ opacity: s === 8 ? 1 : 0 }}
              transition={{ ...spring, delay: 1.5 }}
            >
              Dropped 6 messages — room freed up!
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Step 9: Summarize strategy */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        animate={{ opacity: s === 9 ? 1 : 0 }}
        transition={spring}
      >
        <div className="max-w-lg w-full">
          <p className="text-sm text-white/40 mb-4 text-center">Strategy 2: Summarize</p>

          <div className="flex items-center gap-4">
            {/* Before */}
            <motion.div
              className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3"
              animate={{
                opacity: s === 9 ? 1 : 0,
                x: s === 9 ? 0 : -20,
              }}
              transition={spring}
            >
              <p className="text-sm text-white/30 mb-2">Before (8 messages)</p>
              <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-3 rounded bg-white/10"
                    animate={{
                      opacity: s === 9 ? (i < 6 ? 0.3 : 0.6) : 0,
                      scaleX: s === 9 ? 0.7 : 1,
                    }}
                    transition={{ ...smooth, delay: 0.5 + i * 0.05 }}
                  />
                ))}
              </div>
              <p className="text-sm text-accent-gold mt-2 text-right">2,400 tokens</p>
            </motion.div>

            {/* Arrow with sparkle */}
            <motion.div
              className="flex flex-col items-center"
              animate={{
                opacity: s === 9 ? 1 : 0,
                scale: s === 9 ? 1 : 0.5,
              }}
              transition={{ ...spring, delay: 0.8 }}
            >
              <span className="text-lg">✨</span>
              <span className="text-white/30 text-lg">→</span>
            </motion.div>

            {/* After */}
            <motion.div
              className="flex-1 rounded-xl border border-accent-purple/30 bg-accent-purple/5 p-3"
              animate={{
                opacity: s === 9 ? 1 : 0,
                x: s === 9 ? 0 : 20,
              }}
              transition={{ ...spring, delay: 1 }}
            >
              <p className="text-sm text-white/30 mb-2">After (3 messages)</p>
              <motion.div
                className="px-2 py-2 rounded border border-accent-purple/30 bg-accent-purple/10 mb-1"
                animate={{
                  opacity: s === 9 ? 1 : 0,
                }}
                transition={{ ...spring, delay: 1.3 }}
              >
                <span className="text-sm text-accent-purple font-bold">SUMMARY:</span>
                <p className="text-xs text-white/50 mt-1 leading-relaxed italic">
                  &quot;User is planning a Japan trip. Discussed Tokyo (3 days), food recs (ramen, sushi), hotels in Shinjuku, and Kyoto temples.&quot;
                </p>
              </motion.div>
              <div className="h-3 rounded bg-accent-blue/20 mb-1" />
              <div className="h-3 rounded bg-accent-green/20" />
              <p className="text-sm text-accent-green mt-2 text-right">380 tokens (saved 84%!)</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
