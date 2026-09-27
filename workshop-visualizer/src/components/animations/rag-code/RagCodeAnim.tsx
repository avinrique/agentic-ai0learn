'use client';
/**
 * RagCodeAnim — Lesson 23 (Code: RAG with Embeddings).
 *
 * One scene per step, all derived from the current tracer step: handbook cards
 * turn into number strips, the question pin lands on a 2D meaning map, score
 * bars get ranked and cut to the top 2, the top cards slide into the prompt,
 * and the AI answers from them (or says it doesn't know).
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentBot from '@/components/animations/characters/AgentBot';
import { useTracerScene } from '@/components/animations/part4/useTracerScene';
import { RAG_DOCS, TAKE_OUT_QUESTION, TAKE_OUT_NUMS, storyFor, rankedIdx } from '@/data/traces/rag-code';
import {
  ACCENT, BLUE, GREEN, GOLD, RED,
  NumberStrip, DocChip, MeaningMap, ScoreBars, SimilarityArrows, WorkedExample,
} from './RagCodeParts';

// Scene order (animation triggers in the trace, in step order).
const ORDER = [
  'intro', 'keyword', 'setup', 'docs', 'def-embed', 'one-embedding', 'similar-nums', 'def-sim', 'sim-dot', 'sim-len',
  'embed-docs', 'question', 'embed-q', 'map', 'scores', 'rank', 'print', 'top2',
  'context', 'rule', 'augment', 'messages', 'generate', 'answer', 'recap',
];
const at = (t: string) => ORDER.indexOf(t);
// The score-bar steps share one scene, so the bars can slide into ranked order.
const BARS = ['scores', 'rank', 'print', 'top2'];

const STAGES = [
  { icon: '🔍', label: 'Retrieve', color: BLUE, from: 'embed-docs', to: 'top2', sub: 'find matching facts' },
  { icon: '➕', label: 'Augment', color: ACCENT, from: 'context', to: 'messages', sub: 'add them to the prompt' },
  { icon: '✨', label: 'Generate', color: GREEN, from: 'generate', to: 'answer', sub: 'answer from them' },
];

const SYSTEM_TEXT = "Answer using ONLY the context. If the answer isn't there, say you don't know.";

function Paper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-slate-50 text-slate-800 shadow-lg ${className}`}>{children}</div>;
}

function Tag({ children, color = GOLD }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap"
      style={{ color, background: `${color}18`, border: `1px solid ${color}66` }}
    >
      {children}
    </span>
  );
}

/** Highlight one word inside a sentence. */
function Mark({ text, word, color }: { text: string; word: string; color: string }) {
  const i = text.indexOf(word);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <b className="rounded px-1" style={{ background: `${color}33`, color: '#0f172a', boxShadow: `inset 0 -3px 0 ${color}` }}>
        {word}
      </b>
      {text.slice(i + word.length)}
    </>
  );
}

const pop = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.35 } };

export default function RagCodeAnim() {
  const { steps, trig, v } = useTracerScene();
  if (steps.length === 0) return null;

  const idx = at(trig);
  const story = storyFor(v('question'));
  const ranked = rankedIdx(story);
  const top2 = ranked.slice(0, 2);
  const calls = idx >= at('generate') ? 3 : idx >= at('embed-q') ? 2 : idx >= at('embed-docs') ? 1 : 0;

  // Finished stages collapse into small chips along the bottom.
  const done: string[] = [];
  if (idx > at('embed-docs')) done.push('✓ 5 docs → numbers');
  if (idx > at('embed-q')) done.push('✓ question → numbers');
  if (idx > at('top2')) done.push(`✓ top 2: ${top2.map((i) => RAG_DOCS[i].icon).join(' ')}`);
  if (idx > at('messages')) done.push('✓ prompt packed');
  const showDone = done.length > 0 && trig !== 'recap';

  let scene: ReactNode = null;
  switch (trig) {
    case 'intro':
      scene = (
        <div className="flex flex-col items-center gap-7">
          <div className="text-[20px] font-bold text-white/90">RAG, in real code</div>
          <div className="flex items-center gap-3">
            {STAGES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                {i > 0 && <span className="text-[24px] text-white/35">→</span>}
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.25 }}
                  className="w-[190px] rounded-2xl border-2 px-4 py-4 flex flex-col items-center gap-1.5"
                  style={{ borderColor: s.color, background: `${s.color}12` }}
                >
                  <span className="text-[30px]">{s.icon}</span>
                  <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.label}</span>
                  <span className="text-[14px] text-white/65 text-center">{s.sub}</span>
                </motion.div>
              </div>
            ))}
          </div>
          <Tag color={GREEN}>🧭 search by meaning, not exact words</Tag>
        </div>
      );
      break;

    case 'keyword':
      scene = (
        <div className="flex flex-col items-center gap-6 w-full max-w-[640px]">
          <div className="rounded-2xl rounded-bl-sm px-4 py-2 text-[17px] font-semibold" style={{ background: '#0b1b33', border: `2px solid ${BLUE}`, color: '#cfe4ff' }}>
            🙋 {TAKE_OUT_QUESTION}
          </div>
          <motion.div {...pop} className="flex items-center gap-5 font-mono text-[28px] font-bold">
            <span style={{ color: BLUE }}>&quot;take out&quot;</span>
            <span style={{ color: RED }}>≠</span>
            <span style={{ color: GOLD }}>&quot;borrow&quot;</span>
          </motion.div>
          <Paper className="px-4 py-3 text-[17px]">
            📖 <Mark text={RAG_DOCS[1].text} word="borrow" color={GOLD} />
          </Paper>
          <div className="flex items-center gap-2 text-[15px]">
            <span className="font-mono text-white/60">🔍 lookup(&quot;take out&quot;)</span>
            <span className="text-white/40">→</span>
            <span className="font-semibold" style={{ color: RED }}>✗ &quot;Sorry, I don&apos;t know that.&quot;</span>
          </div>
        </div>
      );
      break;

    case 'setup':
      scene = (
        <motion.div {...pop} className="flex flex-col items-center gap-2 rounded-2xl border-2 px-8 py-6" style={{ borderColor: `${ACCENT}88`, background: `${ACCENT}10` }}>
          <span className="text-[34px]">📞</span>
          <span className="font-mono text-[20px] text-white">client = OpenAI()</span>
          <span className="text-[15px] text-white/60">our phone line to OpenAI</span>
        </motion.div>
      );
      break;

    case 'docs':
      scene = (
        <div className="flex flex-col gap-2.5 w-full max-w-[600px]">
          <div className="text-[14px] font-semibold text-white/60">📘 School handbook · made up</div>
          {RAG_DOCS.map((d, i) => (
            <motion.div key={d.key} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}>
              <Paper className="px-4 py-2.5 text-[17px]">
                <span className="mr-2">{d.icon}</span>
                {d.text}
              </Paper>
            </motion.div>
          ))}
        </div>
      );
      break;

    case 'def-embed':
      scene = (
        <div className="flex items-center gap-5">
          <div className="flex flex-col gap-1.5 opacity-80">
            {[0, 1, 2].map((i) => (
              <Paper key={i} className="px-2.5 py-1 text-[13px]">{RAG_DOCS[i].icon} {RAG_DOCS[i].short}</Paper>
            ))}
            <span className="text-[13px] text-white/50 text-center">texts</span>
          </div>
          <span className="text-[26px] text-white/40">→</span>
          <motion.div
            {...pop}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 px-6 py-5"
            style={{ borderColor: GOLD, background: `${GOLD}12`, boxShadow: `0 0 24px ${GOLD}33` }}
          >
            <span className="text-[34px]">📐</span>
            <span className="text-[19px] font-bold" style={{ color: GOLD }}>embedding model</span>
            <span className="font-mono text-[14px] text-white/70">text-embedding-3-small</span>
          </motion.div>
          <span className="text-[26px] text-white/40">→</span>
          <div className="flex flex-col gap-1.5 opacity-80">
            {[0, 1, 2].map((i) => (
              <span key={i} className="font-mono text-[13px] rounded px-2 py-1" style={{ color: GOLD, background: `${GOLD}14` }}>
                [{RAG_DOCS[i].nums[0].toFixed(3)}, …]
              </span>
            ))}
            <span className="text-[13px] text-white/50 text-center">numbers</span>
          </div>
        </div>
      );
      break;

    case 'one-embedding':
      scene = (
        <div className="flex flex-col items-center gap-4">
          <Paper className="px-4 py-2.5 text-[17px]">📖 {RAG_DOCS[1].text}</Paper>
          <div className="font-mono text-[14px] text-white/50">⬇ embed()</div>
          <NumberStrip nums={RAG_DOCS[1].nums} size={26} delay={0.2} />
          <div className="flex items-center gap-2">
            <Tag>…1,536 numbers</Tag>
            <Tag color={GREEN}>📍 meaning coordinates</Tag>
          </div>
          <div className="text-[13px] text-white/40">illustrative numbers</div>
        </div>
      );
      break;

    case 'similar-nums': {
      const rows = [
        { icon: '🙋', text: TAKE_OUT_QUESTION, nums: TAKE_OUT_NUMS, near: true },
        { icon: RAG_DOCS[1].icon, text: RAG_DOCS[1].text, nums: RAG_DOCS[1].nums, near: true },
        { icon: RAG_DOCS[3].icon, text: RAG_DOCS[3].text, nums: RAG_DOCS[3].nums, near: false },
      ];
      scene = (
        <div className="flex flex-col gap-3 w-full max-w-[740px]">
          <div className="rounded-2xl border-2 p-3 flex flex-col gap-2.5" style={{ borderColor: GREEN, background: `${GREEN}0d` }}>
            {rows.slice(0, 2).map((r) => (
              <div key={r.text} className="flex items-center gap-3">
                <span className="flex-1 text-[16px] text-white/90">{r.icon} {r.text}</span>
                <NumberStrip nums={r.nums} size={16} color={GREEN} />
              </div>
            ))}
            <div className="text-[14px] font-semibold text-center" style={{ color: GREEN }}>similar meaning → similar numbers</div>
          </div>
          <div className="flex items-center gap-3 px-3 opacity-60">
            <span className="flex-1 text-[16px] text-white/80">{rows[2].icon} {rows[2].text}</span>
            <NumberStrip nums={rows[2].nums} size={16} color="#94a3b8" />
          </div>
          <div className="text-[13px] text-white/40 text-center">illustrative numbers</div>
        </div>
      );
      break;
    }

    case 'def-sim':
      scene = <SimilarityArrows />;
      break;

    case 'sim-dot':
      scene = <WorkedExample part="dot" />;
      break;

    case 'sim-len':
      scene = <WorkedExample part="length" />;
      break;

    case 'embed-docs':
      scene = (
        <div className="flex flex-col gap-2.5 w-full max-w-[640px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[15px] text-white/70">embed(documents)</span>
            <Tag>📞 API call 1</Tag>
          </div>
          {RAG_DOCS.map((d, i) => (
            <div key={d.key} className="flex items-center gap-3">
              <div className="w-[170px]"><DocChip i={i} /></div>
              <span className="text-white/35 text-[18px]">→</span>
              <NumberStrip nums={d.nums} size={17} delay={0.25 + i * 0.15} />
            </div>
          ))}
          <div className="text-[13px] text-white/45 pl-1">each list: 1,536 numbers · illustrative</div>
        </div>
      );
      break;

    case 'question':
      scene = (
        <motion.div
          {...pop}
          className="rounded-2xl rounded-bl-sm px-6 py-4 text-[24px] font-semibold"
          style={{ background: '#0b1b33', border: `2px solid ${BLUE}`, color: '#e2efff', boxShadow: `0 0 26px ${BLUE}44` }}
        >
          🙋 {story.question}
        </motion.div>
      );
      break;

    case 'embed-q':
      scene = (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl px-4 py-2 text-[17px] font-semibold" style={{ background: '#0b1b33', border: `1.5px solid ${BLUE}`, color: '#cfe4ff' }}>
            🙋 {story.question}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] text-white/50">⬇ embed([question])[0]</span>
            <Tag>📞 API call 2</Tag>
          </div>
          <NumberStrip nums={story.qNums} size={26} color={BLUE} delay={0.2} />
          <Tag color={BLUE}>…1,536 numbers</Tag>
        </div>
      );
      break;

    case 'map':
      scene = <MeaningMap story={story} />;
      break;

    case 'scores':
      scene = <ScoreBars story={story} mode="scores" />;
      break;

    case 'rank':
    case 'print':
      scene = <ScoreBars story={story} mode="rank" />;
      break;

    case 'top2':
      scene = <ScoreBars story={story} mode="top2" />;
      break;

    case 'context':
      scene = (
        <div className="flex flex-col items-center gap-3 w-full max-w-[620px]">
          <Paper className="w-full px-5 py-4">
            <div className="text-[14px] font-bold text-slate-500 mb-2">📄 context</div>
            {top2.map((i, n) => (
              <motion.div
                key={i}
                initial={{ x: n === 0 ? -50 : 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + n * 0.3 }}
                className="text-[17px] leading-relaxed"
              >
                {RAG_DOCS[i].icon} {RAG_DOCS[i].text}
                {n === 0 && <span className="ml-1.5 font-mono text-[14px] text-violet-500">\n</span>}
              </motion.div>
            ))}
          </Paper>
          <div className="font-mono text-[14px] text-white/50">&quot;\n&quot;.join(top_docs)</div>
        </div>
      );
      break;

    case 'rule':
      scene = (
        <motion.div {...pop} className="w-full max-w-[620px] rounded-2xl border-2 px-6 py-5" style={{ borderColor: ACCENT, background: `${ACCENT}12` }}>
          <div className="text-[14px] font-semibold mb-2" style={{ color: ACCENT }}>📋 system_prompt: the rule</div>
          <div className="text-[21px] leading-snug text-white/95">
            Answer using <b className="px-1 rounded" style={{ background: `${GOLD}33`, color: GOLD }}>ONLY</b> the context.
            <br />
            If the answer isn&apos;t there, say you <b className="px-1 rounded" style={{ background: `${GREEN}33`, color: GREEN }}>don&apos;t know</b>.
          </div>
        </motion.div>
      );
      break;

    case 'augment':
      scene = (
        <div className="flex flex-col gap-3 w-full max-w-[640px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[15px] text-white/70">user_message</span>
            <span className="ml-auto text-[13px] rounded-full px-2.5 py-0.5 bg-white/5 text-white/45">📋 rule ✓</span>
          </div>
          <Paper className="px-5 py-4 flex flex-col gap-2">
            <div className="text-[14px] font-bold text-slate-500">Context:</div>
            {top2.map((i, n) => (
              <motion.div
                key={i}
                initial={{ x: -140, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 120, delay: 0.2 + n * 0.35 }}
                className="rounded-md px-3 py-2 text-[16px]"
                style={{ background: story.found ? '#dcfce7' : '#fef3c7', borderLeft: `4px solid ${story.found ? '#16a34a' : '#d97706'}` }}
              >
                {RAG_DOCS[i].icon} {RAG_DOCS[i].text}
              </motion.div>
            ))}
            <div className="mt-2 text-[14px] font-bold text-slate-500">Question:</div>
            <div className="text-[18px] font-semibold text-blue-700">{story.question}</div>
          </Paper>
        </div>
      );
      break;

    case 'messages':
      scene = (
        <div className="flex flex-col gap-4 w-full max-w-[640px]">
          <div className="font-mono text-[15px] text-white/70">messages</div>
          {[
            { role: 'system', color: ACCENT, body: <span>{SYSTEM_TEXT}</span> },
            {
              role: 'user',
              color: BLUE,
              body: (
                <span>
                  Context: {top2.map((i) => RAG_DOCS[i].icon).join(' ')} … <br />
                  Question: {story.question}
                </span>
              ),
            },
          ].map((m, n) => (
            <motion.div
              key={m.role}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: n * 0.25 }}
              className="flex items-start gap-3"
            >
              <span className="w-[76px] shrink-0 text-center rounded-md py-1 font-mono text-[15px] font-bold" style={{ color: m.color, background: `${m.color}1f`, border: `1.5px solid ${m.color}` }}>
                {m.role}
              </span>
              <div className="flex-1 rounded-xl px-4 py-2.5 text-[16px] leading-snug text-white/90" style={{ border: `1.5px solid ${m.color}66`, background: `${m.color}0d` }}>
                {m.body}
              </div>
            </motion.div>
          ))}
        </div>
      );
      break;

    case 'generate':
      scene = (
        <div className="flex items-center gap-8">
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-1.5"
          >
            <Paper className="px-4 py-3 text-[15px] w-[200px]">
              <div className="font-bold text-slate-500 text-[13px] mb-1">📨 messages</div>
              <div>📋 rule</div>
              <div>{top2.map((i) => RAG_DOCS[i].icon).join(' ')} context</div>
              <div>❓ question</div>
            </Paper>
          </motion.div>
          <motion.span className="text-[30px] text-white/40" animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
            →
          </motion.span>
          <div className="flex flex-col items-center gap-2">
            <AgentBot color={GREEN} badge="🧠" name="gpt-4o-mini" size={130} mood="thinking" active />
            <Tag>📞 API call 3</Tag>
          </div>
        </div>
      );
      break;

    case 'answer':
    case 'recap':
      scene =
        trig === 'answer' ? (
          <div className="flex items-center gap-6 w-full max-w-[720px]">
            <AgentBot color={GREEN} badge="🧠" name="gpt-4o-mini" size={120} mood={story.found ? 'proud' : 'confused'} />
            <div className="flex-1 flex flex-col gap-3">
              <motion.div
                {...pop}
                className="rounded-2xl rounded-bl-sm px-5 py-4 text-[21px] font-semibold leading-snug"
                style={{
                  background: story.found ? `${GREEN}18` : `${GOLD}14`,
                  border: `2px solid ${story.found ? GREEN : GOLD}`,
                  color: '#f8fafc',
                }}
              >
                {story.answer}
              </motion.div>
              <div>
                {story.found ? (
                  <Tag color={GREEN}>✓ from the handbook: {RAG_DOCS[ranked[0]].icon} {RAG_DOCS[ranked[0]].short}</Tag>
                ) : (
                  <Tag color={GOLD}>🛑 not in the context → no guessing</Tag>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-[18px] leading-snug text-white/90 max-w-[640px]">
            <div className="text-[15px] font-semibold" style={{ color: ACCENT }}>What you learned</div>
            <div>1️⃣ <b style={{ color: GOLD }}>Embeddings</b> turn text into numbers. Similar meanings get similar numbers.</div>
            <div>2️⃣ <span className="font-mono" style={{ color: BLUE }}>similarity()</span> ranks the documents; we keep the top 2.</div>
            <div>3️⃣ The prompt says: answer <b style={{ color: GREEN }}>only</b> from the context, or say &quot;I don&apos;t know&quot;.</div>
          </div>
        );
      break;
  }

  const stageState = (i: number) => {
    const s = STAGES[i];
    if (trig === 'recap' || idx > at(s.to)) return 'done';
    if (idx >= at(s.from)) return 'active';
    return 'todo';
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden text-white">
      {/* Header: title + R/A/G progress + API calls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-[16px] font-bold mr-auto" style={{ color: ACCENT }}>🔎 RAG with embeddings</div>
        {trig !== 'intro' &&
          STAGES.map((s, i) => {
            const st = stageState(i);
            return (
              <span
                key={s.label}
                className="rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap"
                style={{
                  color: st === 'todo' ? 'rgba(255,255,255,0.35)' : st === 'done' ? GREEN : s.color,
                  border: `1.5px solid ${st === 'active' ? s.color : 'rgba(255,255,255,0.12)'}`,
                  background: st === 'active' ? `${s.color}22` : 'transparent',
                }}
              >
                {st === 'done' ? '✓' : s.icon} {s.label}
              </span>
            );
          })}
        {calls > 0 && (
          <span className="ml-1 rounded-full px-2.5 py-0.5 text-[13px] font-mono text-white/60 bg-white/5 whitespace-nowrap">
            📞 {calls}/3 calls
          </span>
        )}
      </div>

      {/* The one thing this step is about */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <motion.div
          key={`${BARS.includes(trig) ? 'bars' : trig}-${story.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex items-center justify-center"
        >
          {scene}
        </motion.div>
      </div>

      {/* Finished stages */}
      {showDone && (
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
          {done.map((d) => (
            <span key={d} className="text-[13px] px-2.5 py-1 rounded-full bg-white/5 text-white/55">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
