'use client';
import { motion } from 'framer-motion';
import { Dispatch, ReactNode, SetStateAction, useRef } from 'react';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import { useConceptStore } from '@/stores/conceptStore';
import { CYAN, FitBox, GOLD, GREEN, RED, spring } from './SetupParts';
import { ALL_SET, TEST_REPLY } from './realOutput';

// "Spot the leak": six little scenes, the student marks each one Safe or Leak.

type Verdict = 'safe' | 'leak';

/** Which scene is open and what the student answered. SetupAnim keeps it, so it survives moving to another step and back. */
export interface LeakState {
  idx: number;
  answers: Record<string, Verdict>;
}
export const FRESH_LEAK: LeakState = { idx: 0, answers: {} };

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
      <div className="px-3 py-1 text-[13px] text-white/55 bg-white/[0.06] font-mono">{name}</div>
      <div className="px-3 py-2 font-mono text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

function GitHubBox({ files, width = 240 }: { files: ReactNode[]; width?: number }) {
  return (
    <div className="rounded-lg border-2 border-white/20 bg-white/[0.04] p-3" style={{ width }}>
      <div className="text-[15px] font-bold text-white">🌍 GitHub</div>
      <div className="text-[13px] text-white/55 mb-2">public website: anyone can look</div>
      <div className="space-y-0.5 font-mono text-[14px] text-white/85">
        {files.map((f, i) => (
          <div key={i}>{f}</div>
        ))}
      </div>
    </div>
  );
}

function Push() {
  return (
    <div className="flex flex-col items-center text-white/60">
      <div className="text-3xl" style={{ color: CYAN }}>
        ➜
      </div>
      <div className="text-[13px]">upload</div>
      <div className="font-mono text-[13px] text-white/45">git push</div>
    </div>
  );
}

function Phone({ header, children }: { header: string; children: ReactNode }) {
  return (
    <div className="w-[320px] rounded-[26px] border-[5px] border-slate-600 bg-[#0b141a] overflow-hidden shadow-xl">
      <div className="px-3 py-2 text-[14px] font-semibold text-white bg-[#1f2c34]">{header}</div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function Msg({ from, me, children }: { from?: string; me?: boolean; children: ReactNode }) {
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[280px] rounded-lg px-2.5 py-1.5 text-[14px] text-white" style={{ backgroundColor: me ? '#005c4b' : '#1f2c34' }}>
        {from && (
          <div className="text-[13px] font-semibold" style={{ color: '#fdba74' }}>
            {from}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

const SCENES: LeakScene[] = [
  {
    id: 'github',
    title: 'Sam pastes the key into his code, then uploads the project to GitHub.',
    answer: 'leak',
    why: 'Bots search public GitHub projects for keys all day. Keep the key in .env: run.py hands it to OpenAI(), so it never needs to be in your code.',
    art: (
      <div className="flex items-center gap-5">
        <CodeWin name="part1/basic_api.py" width={400}>
          <div className="text-white/85">from openai import OpenAI</div>
          <div className="text-white/85 whitespace-nowrap">
            client = OpenAI(api_key=
            <span className="rounded px-0.5" style={{ backgroundColor: `${RED}40`, color: '#fecaca' }}>
              &quot;{KEY}&quot;
            </span>
            )
          </div>
        </CodeWin>
        <Push />
        <GitHubBox files={['📁 part1/', '🐍 run.py', '📄 README.md']} />
      </div>
    ),
  },
  {
    id: 'gitignore',
    title: 'Mia keeps her key in .env. Her .gitignore lists .env. She uploads the project to GitHub with git push.',
    answer: 'safe',
    why: '.gitignore tells Git to skip .env, so the key stays on her computer. Everything that reaches GitHub has no key in it.',
    art: (
      <div className="flex items-center gap-5">
        <div className="rounded-lg border-2 border-white/15 bg-white/[0.03] p-3 w-[280px]">
          <div className="text-[15px] font-bold text-white mb-2">💻 Mia&apos;s computer</div>
          <div className="space-y-0.5 font-mono text-[14px] text-white/85">
            <div>
              🔒 .env <span className="text-[13px] text-white/45 font-sans">(the key)</span>
            </div>
            <div>
              📄 .gitignore <span className="text-[13px] text-white/45 font-sans">says: .env</span>
            </div>
            <div>📁 part1/</div>
            <div>🐍 run.py</div>
          </div>
        </div>
        <Push />
        <GitHubBox
          files={[
            '📄 .gitignore',
            '📁 part1/',
            '🐍 run.py',
            <span key="no" className="text-white/35">
              🔒 <span className="line-through">.env</span> <span className="font-sans text-[13px]">(skipped)</span>
            </span>,
          ]}
        />
      </div>
    ),
  },
  {
    id: 'zip',
    title: 'Ava zips her whole ai-course folder and emails it to her teacher to ask for help.',
    answer: 'leak',
    why: '.gitignore only works for Git. The zip still holds .env with the key, and emails get forwarded. Delete .env from the copy before you share a folder.',
    art: (
      <div className="w-[440px] rounded-lg overflow-hidden border border-white/15 bg-[#111827] shadow-lg">
        <div className="px-3 py-1.5 text-[14px] font-semibold text-white bg-white/[0.06]">✉️ New email</div>
        <div className="px-3 py-2 space-y-1 text-[14px]">
          <div className="text-white/60">
            To: <span className="text-white">Mr. Lee</span>
          </div>
          <div className="text-white/60">
            Subject: <span className="text-white">my setup is broken, can you help?</span>
          </div>
          <div className="mt-2 rounded-md border border-white/15 bg-black/30 px-3 py-2">
            <div className="text-[14px] font-semibold text-white">🗜️ ai-course.zip</div>
            <div className="mt-1 pl-3 border-l-2 border-white/10 space-y-0.5 font-mono text-[14px] text-white/80">
              <div>📁 part1/ … part4/</div>
              <div>🐍 run.py</div>
              <div>📄 .gitignore</div>
              <div>🔒 .env</div>
            </div>
          </div>
        </div>
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
          <div className="rounded bg-[#0d1117] border border-white/10 px-2 py-1.5 font-mono text-[13px] mb-1">
            <div className="text-white/45">.env</div>
            <div className="text-white whitespace-nowrap">
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
      <CodeWin name="Terminal" width={600}>
        <div>
          <span style={{ color: CYAN }}>(.venv)</span> <span className="text-white/55">…ai-course %</span> <span className="text-white font-semibold">python check_setup.py</span>
        </div>
        <div className="text-white/80">Checking your setup...</div>
        <div className="text-white/40">…</div>
        <div style={{ color: '#86efac' }}>✓ Found OPENAI_API_KEY in .env</div>
        <div className="text-white/40">…</div>
        <div style={{ color: '#86efac' }}>✓ OpenAI answered: {TEST_REPLY}</div>
        <div className="text-white/80">{ALL_SET}</div>
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

export default function SpotTheLeak({ state, setState }: { state: LeakState; setState: Dispatch<SetStateAction<LeakState>> }) {
  const { idx, answers } = state;
  const rootRef = useRef<HTMLDivElement>(null);
  const scene = SCENES[idx];
  const picked = answers[scene.id];
  const right = picked === scene.answer;
  const answeredCount = Object.keys(answers).length;
  const score = SCENES.filter((sc) => answers[sc.id] === sc.answer).length;
  const allDone = answeredCount === SCENES.length;
  // the next scene still waiting for an answer (after this one, wrapping around)
  const nextOpen = SCENES.map((_, k) => (idx + 1 + k) % SCENES.length).find((k) => !answers[SCENES[k].id]);

  // Playing the game pauses autoplay, so the lesson doesn't move on mid-game.
  const pauseAutoplay = () => useConceptStore.getState().setPlaying(false);
  // The button just pressed disappears, so move keyboard focus to the next one to press (keeps Space and Enter working).
  const focusNext = () => requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus());

  const goTo = (i: number) => {
    pauseAutoplay();
    setState((st) => ({ ...st, idx: i }));
  };
  const choose = (v: Verdict) => {
    pauseAutoplay();
    if (picked) return;
    setState((st) => ({ ...st, answers: { ...st.answers, [scene.id]: v } }));
    focusNext();
  };
  const next = (i: number) => {
    goTo(i);
    focusNext();
  };
  const again = () => {
    pauseAutoplay();
    setState(FRESH_LEAK);
    focusNext();
  };

  return (
    <div ref={rootRef} className="absolute inset-0 flex flex-col items-center px-6 py-4 text-white">
      {/* header */}
      <div className="shrink-0 w-full max-w-[980px] flex items-center justify-between">
        <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CYAN }}>
          🧪 Try it yourself · Spot the leak
        </div>
        <div className="flex items-center gap-2">
          {SCENES.map((sc, i) => {
            const a = answers[sc.id];
            const ok = a === sc.answer;
            return (
              <button
                key={sc.id}
                onClick={() => goTo(i)}
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

      {/* the scene: question, picture and answer stay together in the middle, and shrink together on small screens */}
      <div className="flex-1 min-h-0 w-full">
        <FitBox>
          <motion.div key={scene.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="w-[900px] flex flex-col items-center">
            <div className="text-[18px] font-semibold text-center max-w-[820px]">
              <span className="text-white/45 mr-2">Scene {idx + 1}.</span>
              {scene.title}
            </div>
            <div className="mt-5">{scene.art}</div>

            {!picked ? (
              <div className="flex gap-4 mt-6">
                <button data-autofocus onClick={() => choose('safe')} className="w-[200px] py-2.5 rounded-xl border-2 text-[17px] font-bold hover:brightness-125" style={{ borderColor: `${GREEN}90`, backgroundColor: `${GREEN}18`, color: '#bbf7d0' }}>
                  🔒 Safe
                </button>
                <button onClick={() => choose('leak')} className="w-[200px] py-2.5 rounded-xl border-2 text-[17px] font-bold hover:brightness-125" style={{ borderColor: `${RED}90`, backgroundColor: `${RED}18`, color: '#fecaca' }}>
                  🚨 Leak
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="mt-6 w-full rounded-xl border-2 px-4 py-2.5 flex items-center gap-4"
                style={{ borderColor: right ? `${GREEN}80` : `${RED}80`, backgroundColor: right ? `${GREEN}10` : `${RED}10` }}
              >
                <AgentBot color={TEAM.solo.color} badge={TEAM.solo.badge} size={50} mood={right ? 'proud' : 'confused'} />
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold" style={{ color: right ? '#bbf7d0' : '#fecaca' }}>
                    {right ? 'Right! ' : 'Not quite. '}
                    {scene.answer === 'leak' ? '🚨 This is a leak.' : '🔒 This is safe.'}
                  </div>
                  <div className="text-[14px] text-white/80 mt-0.5">{scene.why}</div>
                  {scene.answer === 'leak' && <div className="text-[14px] text-white/60 mt-1">Already leaked? Delete the key on the website and make a new one.</div>}
                </div>
                {nextOpen !== undefined ? (
                  <button data-autofocus onClick={() => next(nextOpen)} className="shrink-0 px-4 py-2 rounded-lg font-semibold text-[15px] text-navy-900" style={{ backgroundColor: CYAN }}>
                    {nextOpen === idx + 1 ? 'Next scene →' : `Scene ${nextOpen + 1} →`}
                  </button>
                ) : (
                  <button data-autofocus onClick={again} className="shrink-0 px-4 py-2 rounded-lg font-semibold text-[15px] bg-white/10 hover:bg-white/15 text-white">
                    ↺ Try again
                  </button>
                )}
              </motion.div>
            )}
            {allDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-[15px] text-white/80">
                {score === SCENES.length ? `🏆 ${score}/${SCENES.length}! ` : `You spotted ${score}/${SCENES.length}. `}The rule: the key lives in .env, and only your program reads it.
              </motion.div>
            )}
          </motion.div>
        </FitBox>
      </div>
    </div>
  );
}
