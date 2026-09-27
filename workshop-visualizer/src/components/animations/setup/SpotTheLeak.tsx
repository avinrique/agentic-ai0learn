'use client';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import { CYAN, GOLD, GREEN, RED, spring } from './SetupParts';

// "Spot the leak": five little scenes, the student marks each one Safe or Leak.

type Verdict = 'safe' | 'leak';

interface LeakScene {
  id: string;
  title: string;
  answer: Verdict;
  why: string;
  art: ReactNode;
}

const KEY = 'sk-proj-4fQx…';

function CodeWin({ name, children, width = 330 }: { name: string; children: ReactNode; width?: number }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/15 bg-[#0d1117] shadow-lg" style={{ width }}>
      <div className="px-3 py-1 text-[12px] text-white/55 bg-white/[0.06] font-mono">{name}</div>
      <div className="px-3 py-2 font-mono text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

function GitHubBox({ files, width = 230 }: { files: ReactNode[]; width?: number }) {
  return (
    <div className="rounded-lg border-2 border-white/20 bg-white/[0.04] p-3" style={{ width }}>
      <div className="text-[14px] font-bold text-white mb-1">🌍 GitHub</div>
      <div className="text-[12px] text-white/50 mb-2">public: anyone can look</div>
      <div className="space-y-0.5 font-mono text-[14px] text-white/85">{files}</div>
    </div>
  );
}

function Push() {
  return (
    <div className="flex flex-col items-center text-white/60">
      <div className="text-3xl" style={{ color: CYAN }}>➜</div>
      <div className="font-mono text-[12px]">git push</div>
    </div>
  );
}

function Phone({ header, children }: { header: string; children: ReactNode }) {
  return (
    <div className="w-[300px] rounded-[26px] border-[5px] border-slate-600 bg-[#0b141a] overflow-hidden shadow-xl">
      <div className="px-3 py-2 text-[14px] font-semibold text-white bg-[#1f2c34]">{header}</div>
      <div className="p-3 space-y-2 min-h-[190px]">{children}</div>
    </div>
  );
}

function Msg({ from, me, children }: { from?: string; me?: boolean; children: ReactNode }) {
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[230px] rounded-lg px-2.5 py-1.5 text-[13px] text-white" style={{ backgroundColor: me ? '#005c4b' : '#1f2c34' }}>
        {from && <div className="text-[11px] font-semibold" style={{ color: '#fdba74' }}>{from}</div>}
        {children}
      </div>
    </div>
  );
}

const SCENES: LeakScene[] = [
  {
    id: 'github',
    title: 'Sam pastes the key into his code, then pushes the project to GitHub.',
    answer: 'leak',
    why: 'Bots search public GitHub projects for keys all day. Keep the key in .env: client = OpenAI() finds it by itself, so it never needs to be in your code.',
    art: (
      <div className="flex items-center gap-5">
        <CodeWin name="part1/basic_api.py">
          <div className="text-white/85">from openai import OpenAI</div>
          <div className="text-white/85">
            client = OpenAI(api_key=<span className="rounded px-0.5" style={{ backgroundColor: `${RED}40`, color: '#fecaca' }}>&quot;{KEY}&quot;</span>)
          </div>
        </CodeWin>
        <Push />
        <GitHubBox files={['📁 part1/', '🐍 run.py', '📄 README.md']} />
      </div>
    ),
  },
  {
    id: 'gitignore',
    title: 'Mia keeps her key in .env. Her .gitignore lists .env. She pushes the project to GitHub.',
    answer: 'safe',
    why: '.gitignore tells Git to skip .env, so the key never leaves her computer. Everything that reaches GitHub has no key in it.',
    art: (
      <div className="flex items-center gap-5">
        <div className="rounded-lg border-2 border-white/15 bg-white/[0.03] p-3 w-[260px]">
          <div className="text-[14px] font-bold text-white mb-2">💻 Mia&apos;s computer</div>
          <div className="space-y-0.5 font-mono text-[14px] text-white/85">
            <div>
              🔒 .env <span className="text-[12px] text-white/45 font-sans">(the key)</span>
            </div>
            <div>
              📄 .gitignore <span className="text-[12px] text-white/45 font-sans">says: .env</span>
            </div>
            <div>📁 part1/</div>
            <div>🐍 run.py</div>
          </div>
        </div>
        <Push />
        <GitHubBox files={['📄 .gitignore', '📁 part1/', '🐍 run.py', <span key="no" className="text-white/35 line-through">🔒 .env</span>]} />
      </div>
    ),
  },
  {
    id: 'screenshot',
    title: 'Zoe is proud her setup works. She posts a screenshot of her .env file in the class group chat.',
    answer: 'leak',
    why: 'Everyone in the chat can read the key in the picture and use it. Share screenshots of the output only, and never show .env.',
    art: (
      <Phone header="👥 Class 7B">
        <Msg from="Zoe">
          <div className="rounded bg-[#0d1117] border border-white/10 px-2 py-1.5 font-mono text-[12px] mb-1">
            <div className="text-white/45">.env</div>
            <div className="text-white">
              OPENAI_API_KEY=<span style={{ color: GOLD }}>sk-proj-9Tb2…</span>
            </div>
          </div>
          my setup works!! 🎉
        </Msg>
        <Msg from="Ben">nice 👀</Msg>
      </Phone>
    ),
  },
  {
    id: 'check',
    title: 'Leo keeps his key in .env and runs check_setup.py to test his setup.',
    answer: 'safe',
    why: "The key stays in .env on Leo's computer. The program reads it from there and sends it only to OpenAI. That's exactly how it should work.",
    art: (
      <CodeWin name="Terminal" width={560}>
        <div>
          <span style={{ color: CYAN }}>(.venv)</span> <span className="text-white/55">…ai-course %</span> <span className="text-white font-semibold">python check_setup.py</span>
        </div>
        <div style={{ color: '#86efac' }}>✓ openai is installed</div>
        <div style={{ color: '#86efac' }}>✓ Found OPENAI_API_KEY in .env</div>
        <div style={{ color: '#86efac' }}>✓ OpenAI answered: &quot;Hello!&quot;</div>
      </CodeWin>
    ),
  },
  {
    id: 'friend',
    title: 'A friend asks to borrow your key “just to test”. You send it.',
    answer: 'leak',
    why: "Your friend (and anyone they pass it to) can spend your credit, and you can't tell who did. Everyone should have their own key, made with a parent or teacher if needed.",
    art: (
      <Phone header="💬 Alex">
        <Msg from="Alex">can u send me ur API key? just to test 🙏</Msg>
        <Msg me>
          ok: <span className="font-mono" style={{ color: GOLD }}>{KEY}</span>
        </Msg>
        <Msg from="Alex">thx!! gonna share it with my cousin too</Msg>
      </Phone>
    ),
  },
];

export default function SpotTheLeak() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Verdict>>({});
  const scene = SCENES[idx];
  const picked = answers[scene.id];
  const right = picked === scene.answer;
  const answeredCount = Object.keys(answers).length;
  const score = SCENES.filter((sc) => answers[sc.id] === sc.answer).length;
  const allDone = answeredCount === SCENES.length;

  const choose = (v: Verdict) => {
    if (picked) return;
    setAnswers((a) => ({ ...a, [scene.id]: v }));
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center px-6 py-4 text-white">
      {/* header */}
      <div className="w-full max-w-[980px] flex items-center justify-between mb-3">
        <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CYAN }}>🧪 Try it yourself · Spot the leak</div>
        <div className="flex items-center gap-2">
          {SCENES.map((sc, i) => {
            const a = answers[sc.id];
            const ok = a === sc.answer;
            return (
              <button
                key={sc.id}
                onClick={() => setIdx(i)}
                aria-label={`Scene ${i + 1}`}
                className="w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center"
                style={{
                  borderColor: i === idx ? CYAN : a ? (ok ? `${GREEN}90` : `${RED}90`) : 'rgba(255,255,255,0.2)',
                  backgroundColor: a ? (ok ? `${GREEN}25` : `${RED}25`) : 'transparent',
                  color: a ? (ok ? '#bbf7d0' : '#fecaca') : 'rgba(255,255,255,0.7)',
                }}
              >
                {a ? (ok ? '✓' : '✗') : i + 1}
              </button>
            );
          })}
          <span className="ml-2 text-[14px] text-white/60">
            Score <span className="font-bold text-white">{score}</span>/{SCENES.length}
          </span>
        </div>
      </div>

      {/* the scene */}
      <motion.div key={scene.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="w-full max-w-[980px] flex-1 min-h-0 flex flex-col items-center">
        <div className="text-[18px] font-semibold text-center mb-4 max-w-[820px]">
          <span className="text-white/45 mr-2">Scene {idx + 1}.</span>
          {scene.title}
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">{scene.art}</div>

        {!picked ? (
          <div className="flex gap-4 mt-4">
            <button onClick={() => choose('safe')} className="w-[200px] py-2.5 rounded-xl border-2 text-[17px] font-bold hover:brightness-125" style={{ borderColor: `${GREEN}90`, backgroundColor: `${GREEN}18`, color: '#bbf7d0' }}>
              🔒 Safe
            </button>
            <button onClick={() => choose('leak')} className="w-[200px] py-2.5 rounded-xl border-2 text-[17px] font-bold hover:brightness-125" style={{ borderColor: `${RED}90`, backgroundColor: `${RED}18`, color: '#fecaca' }}>
              🚨 Leak
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-4 w-full max-w-[860px] rounded-xl border-2 px-4 py-2.5 flex items-center gap-4" style={{ borderColor: right ? `${GREEN}80` : `${RED}80`, backgroundColor: right ? `${GREEN}10` : `${RED}10` }}>
            <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} size={50} mood={right ? 'proud' : 'confused'} />
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold" style={{ color: right ? '#bbf7d0' : '#fecaca' }}>
                {right ? 'Right! ' : 'Not quite. '}
                {scene.answer === 'leak' ? '🚨 This is a leak.' : '🔒 This is safe.'}
              </div>
              <div className="text-[14px] text-white/80 mt-0.5">{scene.why}</div>
            </div>
            {idx < SCENES.length - 1 && (
              <button onClick={() => setIdx(idx + 1)} className="shrink-0 px-4 py-2 rounded-lg font-semibold text-[15px] text-navy-900" style={{ backgroundColor: CYAN }}>
                Next scene →
              </button>
            )}
          </motion.div>
        )}
        {allDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-[15px] text-white/80">
            {score === SCENES.length ? '🏆 5/5! ' : `You spotted ${score}/${SCENES.length}. `}The rule: the key lives in .env, and only your program reads it.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
