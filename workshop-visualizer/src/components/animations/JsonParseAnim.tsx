'use client';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTracerStore } from '@/stores/tracerStore';
import { JSON_RANK, reachedRank } from './ApiCallFlow';

// ─────────────────────────────────────────────────────────────────────────────
// JsonParseAnim: the JSON side of the story (used by JSON Output + Challenge).
// Prompts with the requested keys highlighted → "without vs with response_format"
// side by side → JSON text typed out with keys lit up → it's still a str →
// (challenge) json.loads() → dict → pretty cards.
// Works for raw_json of the shape {"<any list key>": [ {...}, ... ]}.
// ─────────────────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, damping: 22, stiffness: 140 };
const KEY_COLORS = ['#22d3ee', '#f472b6', '#fbbf24', '#4ade80', '#a78bfa'];
const difficultyColors: Record<string, string> = { easy: '#4ade80', medium: '#fbbf24', hard: '#ef4444' };

type Item = Record<string, unknown>;

function unquote(s?: string) {
  return (s ?? '').replace(/^("""|")|("""|")$/g, '');
}

function useTicker(total: number, active: boolean, ms: number, resetKey: string) {
  const [state, setState] = useState({ key: '', n: 0 });
  useEffect(() => {
    if (!active) return;
    let i = 0;
    setState({ key: resetKey, n: 0 });
    const id = setInterval(() => {
      i += 1;
      setState({ key: resetKey, n: i });
      if (i >= total) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [resetKey, active, total, ms]);
  if (!active) return total;
  return state.key === resetKey ? Math.min(state.n, total) : 0;
}

// Colour JSON text: keys (asked-for keys get their own colour), strings, numbers, punctuation.
function JsonText({ text, keyColor, glowKeys }: { text: string; keyColor: (k: string) => string | undefined; glowKeys: boolean }) {
  const parts = text.match(/"(?:[^"\\]|\\.)*"?|-?\d+(?:\.\d+)?|\s+|[^"\s\d-]+|./g) ?? [];
  let afterIdx = 0;
  return (
    <>
      {parts.map((p, i) => {
        afterIdx += p.length;
        const rest = text.slice(afterIdx);
        const isString = p.startsWith('"');
        const isKey = isString && /^\s*:/.test(rest);
        if (isKey) {
          const name = p.replace(/^"|"$/g, '');
          const c = keyColor(name);
          return (
            <span
              key={i}
              className="font-bold rounded-sm"
              style={{
                color: c ?? '#a78bfa',
                backgroundColor: c && glowKeys ? `${c}26` : undefined,
                fontStyle: c ? undefined : 'italic',
              }}
            >
              {p}
            </span>
          );
        }
        if (isString) return <span key={i} className="text-white/85">{p}</span>;
        if (/^-?\d/.test(p)) return <span key={i} className="text-accent-cyan">{p}</span>;
        // Punctuation: allow a line break right after it, so long JSON wraps between items, not mid-word.
        return (
          <span key={i} className="text-white/40">
            {p}
            <wbr />
          </span>
        );
      })}
    </>
  );
}

function Card({ on, color, children, className = '' }: { on: boolean; color: string; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, boxShadow: on ? `0 0 0 1px ${color}, 0 0 16px ${color}44` : '0 0 0 0px rgba(0,0,0,0)' }}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function JsonParseAnim() {
  const { currentStep, steps, activeVariantId } = useTracerStore();
  const step = steps[currentStep];
  const cur = step?.animationTrigger ?? '';
  const at = (t: string) => cur === t;
  const reached = useMemo(() => reachedRank(steps, currentStep), [steps, currentStep]);
  const resetKey = `${activeVariantId}-${currentStep}`;

  const vars = step?.variables ?? [];
  const finalVars = steps[steps.length - 1]?.variables ?? [];
  const get = (n: string) => vars.find((v) => v.name === n)?.value;
  const getFinal = (n: string) => get(n) ?? finalVars.find((v) => v.name === n)?.value;

  // The reply (looked up in the last step before it arrives, to preview shapes).
  const rawJson = getFinal('raw_json') ?? '{}';
  const { listKey, items, allKeys } = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k])) ?? Object.keys(parsed)[0] ?? 'items';
      const list: Item[] = Array.isArray(parsed[key]) ? parsed[key] : [parsed];
      const keys = new Set<string>([...Object.keys(parsed)]);
      list.forEach((it) => Object.keys(it ?? {}).forEach((k) => keys.add(k)));
      return { listKey: key, items: list, allKeys: keys };
    } catch {
      return { listKey: 'items', items: [] as Item[], allKeys: new Set<string>() };
    }
  }, [rawJson]);

  const systemPrompt = unquote(get('system_prompt'));
  const userPrompt = unquote(get('user_prompt'));
  const userPromptFinal = unquote(getFinal('user_prompt'));

  // Keys the prompt asked for: quoted words in the user prompt that really are keys in the reply.
  const askedKeys = useMemo(() => {
    const found: string[] = [];
    const re = /['"]([A-Za-z_][A-Za-z0-9_]{0,30})['"]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(userPromptFinal))) {
      if ((allKeys.size === 0 || allKeys.has(m[1])) && !found.includes(m[1])) found.push(m[1]);
    }
    return found;
  }, [userPromptFinal, allKeys]);
  const keyColor = (k: string) => {
    const i = askedKeys.indexOf(k);
    return i >= 0 ? KEY_COLORS[i % KEY_COLORS.length] : undefined;
  };

  // A chatty free-text version of the same answer (what you'd get without JSON mode).
  const freeText = useMemo(() => {
    const lines = items.slice(0, 5).map((it, i) => `${i + 1}. ${Object.values(it).map(String).join(' – ')}`);
    return `Sure! Here are the ${listKey} you asked for:\n${lines.join('\n')}\nHope this helps! Let me know if you need more.`;
  }, [items, listKey]);

  const typed = useTicker(rawJson.length, at('apiProcessing'), 18, resetKey);
  const jsonShown = rawJson.slice(0, typed);

  // The "What is JSON?" card: the example the explanation names (e.g. {"difficulty": "easy"}), so the
  // picture and the words always match; otherwise the first asked-for key/value of this example's reply.
  const introExample = useMemo(() => {
    const text = steps.find((s) => s.animationTrigger === 'jsonIntro')?.explanation ?? '';
    const m = text.match(/\{\s*"([A-Za-z_]\w*)"\s*:\s*("[^"]*"|-?\d+(?:\.\d+)?)\s*\}/);
    return m ? { k: m[1], v: m[2] } : null;
  }, [steps]);
  const sample = useMemo(() => {
    if (introExample) return introExample;
    const first = items[0] ?? {};
    // Shortest asked-for value reads best as a tiny example: {"difficulty": "easy"}.
    const cands = askedKeys.filter((a) => a in first);
    const k =
      cands.sort((a, b) => JSON.stringify(first[a]).length - JSON.stringify(first[b]).length)[0] ??
      Object.keys(first)[0] ??
      'difficulty';
    const v = first[k] ?? 'easy';
    return { k, v: JSON.stringify(v) };
  }, [items, askedKeys, introExample]);

  // Render the user prompt with asked-for keys highlighted.
  const highlightPrompt = (text: string) => {
    if (askedKeys.length === 0) return text;
    const re = new RegExp(`(['"](?:${askedKeys.join('|')})['"])`, 'g');
    return text.split(re).map((part, i) => {
      const name = part.replace(/^['"]|['"]$/g, '');
      const c = /^['"].+['"]$/.test(part) && askedKeys.includes(name) ? keyColor(name) : undefined;
      return c ? (
        <motion.span
          key={i}
          animate={{ backgroundColor: at('highlightKeys') ? `${c}40` : `${c}20` }}
          className="font-mono font-bold rounded px-0.5"
          style={{ color: c }}
        >
          {part}
        </motion.span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  const parsesJson = steps.some((s) => s.animationTrigger === 'jsonParse');
  const arrived = reached >= JSON_RANK.apiCallComplete;
  const printed = reached >= JSON_RANK.extractContent;
  const phase =
    reached < JSON_RANK.addSystemMsg
      ? 'intro'
      : reached < JSON_RANK.startRequest
        ? 'prompts'
        : reached < JSON_RANK.buildMessages
          ? 'packing'
          : reached < JSON_RANK.apiCall
            ? 'compare'
            : reached < JSON_RANK.jsonParse || !parsesJson
              ? 'reply'
              : reached === JSON_RANK.jsonParse
                ? 'dict'
                : 'cards';

  // What print() has written so far (for the small terminal on the two early print steps).
  const printsSoFar = steps
    .slice(0, currentStep + 1)
    .map((s, i) => ({ text: s.output ?? '', hot: i === currentStep }))
    .filter((o) => o.text);
  const terminal = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="shrink-0 self-center w-full max-w-[520px] rounded-xl bg-black/60 px-4 py-2.5 font-mono text-[15px] leading-relaxed"
    >
      <div className="font-sans text-[13px] text-white/40 mb-1">Terminal</div>
      {printsSoFar.map((o, i) => (
        <div key={i} className={`whitespace-pre-wrap ${o.hot ? 'text-white' : 'text-white/40'}`}>
          {o.text}
        </div>
      ))}
    </motion.div>
  );

  const keyChips = (big: boolean) =>
    askedKeys.map((k, i) => (
      <motion.span
        key={k}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: at('highlightKeys') ? i * 0.15 : 0 }}
        className={`font-mono font-bold rounded-full ${big ? 'text-[15px] px-3 py-1' : 'text-[13px] px-2 py-0.5'}`}
        style={{ color: keyColor(k), backgroundColor: `${keyColor(k)}1a` }}
      >
        {k}
      </motion.span>
    ));

  // The JSON reply box (typed out while the model writes).
  const jsonBox = (big: boolean) => (
    <div
      className={`rounded-xl bg-black/40 px-4 py-3 font-mono leading-relaxed break-words overflow-hidden ${
        big ? 'text-[16px] max-h-full' : 'flex-1 min-h-0 text-[14px]'
      }`}
    >
      {reached >= JSON_RANK.apiProcessing ? (
        <>
          {printed && <span className="text-accent-gold">&quot;</span>}
          <JsonText text={jsonShown} keyColor={keyColor} glowKeys={arrived} />
          {printed && <span className="text-accent-gold">&quot;</span>}
          {at('apiProcessing') && typed < rawJson.length && (
            <span className="inline-block w-2 h-4 bg-accent-gold/80 ml-0.5 animate-pulse align-middle" />
          )}
        </>
      ) : askedKeys.length > 0 ? (
        // Not written yet: the shape the reply will have (asked-for keys in their colours).
        <span className="text-white/35 whitespace-pre-wrap">
          {'{\n  '}
          <span className="text-accent-purple/70">&quot;{listKey}&quot;</span>
          {': [\n    {'}
          {askedKeys.map((k, i) => (
            <span key={k}>
              <span style={{ color: keyColor(k) }}>&quot;{k}&quot;</span>
              {': …'}
              {i < askedKeys.length - 1 ? ', ' : ''}
            </span>
          ))}
          {'},\n    …\n  ]\n}'}
        </span>
      ) : (
        <span className="text-white/30">
          {'{ '}
          <span className="text-accent-purple/60">&quot;{listKey}&quot;</span>
          {': [ … ] }'}
        </span>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-3 px-5 py-4 overflow-hidden text-white">
      {/* What is JSON? (before the prompts exist) */}
      {phase === 'intro' && at('printStart') && <div className="flex-1 min-h-0 flex flex-col justify-center">{terminal}</div>}
      {phase === 'intro' && !at('printStart') && (
        <motion.div
          animate={{ opacity: at('jsonIntro') ? 1 : 0.5 }}
          className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4"
        >
          <div className="text-[15px] font-semibold text-white/70">What is JSON?</div>
          <div className="font-mono text-[26px]">
            <span className="text-white/40">{'{'}</span>
            <span className="font-bold" style={{ color: keyColor(sample.k) ?? '#a78bfa' }}>
              &quot;{sample.k}&quot;
            </span>
            <span className="text-white/40">: </span>
            <span className="text-white/90">{sample.v}</span>
            <span className="text-white/40">{'}'}</span>
          </div>
          {reached >= JSON_RANK.jsonIntro && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-10 text-[15px]">
              <span style={{ color: keyColor(sample.k) ?? '#a78bfa' }}>↑ key</span>
              <span className="text-white/70">↑ value</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* The two prompts, big while they are being written */}
      {phase === 'prompts' && (
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">
          <motion.div
            animate={{ opacity: at('addSystemMsg') ? 1 : 0.55 }}
            className="rounded-2xl bg-accent-purple/10 px-4 py-3"
          >
            <div className="text-[13px] font-mono font-semibold text-accent-purple mb-1">system_prompt</div>
            <div className="text-[15px] text-white/85 leading-snug">
              {systemPrompt.split(/(valid JSON)/).map((p, i) =>
                p === 'valid JSON' ? (
                  <span key={i} className="text-accent-gold font-semibold">
                    {p}
                  </span>
                ) : (
                  <span key={i}>{p}</span>
                ),
              )}
            </div>
          </motion.div>
          {reached >= JSON_RANK.addUserMsg && (
            <Card on={at('addUserMsg')} color="#4a9eff" className="rounded-2xl bg-accent-blue/10 px-4 py-3">
              <div className="text-[13px] font-mono font-semibold text-accent-blue mb-1">user_prompt</div>
              <div className="text-[16px] text-white/85 leading-snug whitespace-pre-line">{highlightPrompt(userPrompt)}</div>
            </Card>
          )}
          {reached >= JSON_RANK.highlightKeys && askedKeys.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-center pt-1">{keyChips(true)}</div>
          )}
        </div>
      )}

      {/* While the request is packed (top panel is the focus): prompts shrink to chips */}
      {phase === 'packing' && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 opacity-60">
          <div className="flex items-center gap-2 text-[14px]">
            <span className="px-3 py-1 rounded-lg bg-accent-purple/15 text-accent-purple font-mono">✓ system_prompt</span>
            <span className="px-3 py-1 rounded-lg bg-accent-blue/15 text-accent-blue font-mono">✓ user_prompt</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">{keyChips(false)}</div>
        </div>
      )}

      {/* Without vs with response_format */}
      {phase === 'compare' && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {at('whyBoth') && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 flex justify-center gap-3 text-[14px]">
              <span className="px-3 py-1 rounded-lg bg-accent-blue/15 text-accent-blue">prompt = WHAT data</span>
              <span className="px-3 py-1 rounded-lg bg-accent-gold/15 text-accent-gold">JSON mode = valid FORMAT</span>
            </motion.div>
          )}
          <div className="flex-1 min-h-0 flex gap-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: at('whyBoth') ? 0.45 : 1, x: 0 }}
              transition={spring}
              className="flex-1 min-w-0 rounded-2xl bg-accent-red/[0.07] px-4 py-3 flex flex-col gap-2 overflow-hidden"
            >
              <div className="text-[14px] font-semibold text-accent-red shrink-0">✗ without</div>
              <div className="text-[14px] text-white/70 whitespace-pre-line leading-snug overflow-hidden">{freeText}</div>
            </motion.div>
            <Card on={at('buildMessages')} color="#fbbf24" className="flex-1 min-w-0 rounded-2xl bg-accent-gold/[0.07] px-4 py-3 flex flex-col gap-2 overflow-hidden">
              <div className="text-[14px] font-semibold text-accent-gold shrink-0">✓ with JSON mode</div>
              {jsonBox(false)}
            </Card>
          </div>
        </div>
      )}

      {/* The reply: JSON text */}
      {phase === 'reply' && (
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-accent-gold mr-1">{printed ? 'raw_json' : 'the reply'}</span>
            {keyChips(false)}
            {reached >= JSON_RANK.isString && (
              <Card
                on={at('isString')}
                color="#f472b6"
                className="ml-auto rounded-lg px-2.5 py-1 bg-accent-pink/10 text-[14px] font-mono text-accent-pink"
              >
                type: str
              </Card>
            )}
          </div>
          {at('printHeading') ? (
            <>
              <div className="min-h-0 flex flex-col opacity-50">{jsonBox(false)}</div>
              {terminal}
            </>
          ) : (
            jsonBox(true)
          )}
        </div>
      )}

      {/* Challenge: json.loads() → dict */}
      {phase === 'dict' && (
        <Card on color="#4ade80" className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2 shrink-0 text-[14px]">
            <span className="font-mono text-accent-pink bg-accent-pink/10 px-2 py-0.5 rounded">str</span>
            <span className="font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">json.loads()</span>
            <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-green-400">
              →
            </motion.span>
            <span className="text-white/60">dict</span>
          </div>
          <div className="font-mono text-[14px] text-white/70 bg-black/30 rounded-xl p-3 overflow-hidden flex-1">
            <div className="text-white/40">{'{'}</div>
            <div className="pl-4 text-accent-purple">&quot;{listKey}&quot;: [</div>
            {items.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.15 }}
                className="pl-8 truncate"
              >
                <JsonText text={JSON.stringify(q).replace(/":/g, '": ').replace(/,"/g, ', "')} keyColor={keyColor} glowKeys />
                {i < items.length - 1 ? ',' : ''}
              </motion.div>
            ))}
            <div className="pl-4 text-accent-purple">]</div>
            <div className="text-white/40">{'}'}</div>
          </div>
        </Card>
      )}

      {/* Challenge: pretty result */}
      {phase === 'cards' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {items.map((q, i) => {
            const entries = Object.entries(q);
            const [, title] = entries[0] ?? ['', ''];
            const rest = entries.slice(1);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...spring, delay: i * 0.2 }}
                className="bg-navy-700/50 rounded-xl px-4 py-2 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] text-white/90 font-medium truncate">{String(title)}</div>
                  {rest
                    .filter(([, v]) => String(v).length > 20)
                    .map(([k, v]) => (
                      <div key={k} className="text-[13px] text-white/60 truncate">
                        {String(v)}
                      </div>
                    ))}
                </div>
                <div className="flex gap-1.5 items-center shrink-0">
                  {rest
                    .filter(([, v]) => String(v).length <= 20)
                    .map(([k, v]) => {
                      const c = difficultyColors[String(v)] ?? keyColor(k) ?? '#fbbf24';
                      return (
                        <span key={k} className="text-[13px] px-2 py-0.5 rounded-full font-bold" style={{ color: c, backgroundColor: `${c}15` }}>
                          {String(v)}
                        </span>
                      );
                    })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
