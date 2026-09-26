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
        return <span key={i} className="text-white/40">{p}</span>;
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

  // First key/value of the reply, for the "What is JSON?" card.
  const sample = useMemo(() => {
    const first = items[0] ?? {};
    const k = askedKeys.find((a) => a in first) ?? Object.keys(first)[0] ?? 'difficulty';
    const v = first[k] ?? 'easy';
    return { k, v: JSON.stringify(v) };
  }, [items, askedKeys]);

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

  const showCompare = reached >= JSON_RANK.buildMessages && reached < JSON_RANK.jsonParse;
  const arrived = reached >= JSON_RANK.apiCallComplete;
  const printed = reached >= JSON_RANK.extractContent;

  return (
    <div className="h-full flex flex-col gap-2 p-3 overflow-hidden text-white">
      {/* What is JSON? (before the prompts exist) */}
      {reached < JSON_RANK.addSystemMsg && (
        <Card on={at('jsonIntro')} color="#a78bfa" className="flex-1 min-h-0 rounded-xl border border-white/10 bg-navy-900/50 p-3 flex flex-col items-center justify-center gap-3">
          <div className="text-sm font-bold text-white/85">What is JSON?</div>
          <div className="font-mono text-lg">
            <span className="text-white/40">{'{'}</span>
            <span className="font-bold" style={{ color: keyColor(sample.k) ?? '#a78bfa' }}>&quot;{sample.k}&quot;</span>
            <span className="text-white/40">: </span>
            <span className="text-white/85">{sample.v}</span>
            <span className="text-white/40">{'}'}</span>
          </div>
          {reached >= JSON_RANK.jsonIntro && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 text-xs">
              <span className="text-accent-purple">↑ key = the label</span>
              <span className="text-white/70">↑ value = the data</span>
            </motion.div>
          )}
          <div className="text-xs text-white/45 text-center max-w-md">
            Text made of keys and values. It looks just like a Python dictionary, and any program can read it.
          </div>
        </Card>
      )}

      {/* Prompts */}
      {reached >= JSON_RANK.addSystemMsg && (
        <div className="flex gap-2 shrink-0">
          <Card on={at('addSystemMsg')} color="#a78bfa" className="flex-1 min-w-0 rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-2 py-1.5">
            <div className="text-[11px] font-bold text-accent-purple uppercase tracking-wider">system_prompt (the rules)</div>
            <div className="text-xs text-white/75 line-clamp-2">
              {systemPrompt.split(/(valid JSON)/).map((p, i) =>
                p === 'valid JSON' ? (
                  <span key={i} className="text-accent-gold font-semibold">{p}</span>
                ) : (
                  <span key={i}>{p}</span>
                ),
              )}
            </div>
          </Card>
          {reached >= JSON_RANK.addUserMsg && (
            <Card on={at('addUserMsg')} color="#4a9eff" className="flex-[1.6] min-w-0 rounded-lg border border-accent-blue/30 bg-accent-blue/10 px-2 py-1.5">
              <div className="text-[11px] font-bold text-accent-blue uppercase tracking-wider">user_prompt (what we want)</div>
              <div className="text-xs text-white/75 line-clamp-2 whitespace-pre-line">{highlightPrompt(userPrompt)}</div>
            </Card>
          )}
        </div>
      )}

      {/* Keys asked for + why both */}
      {reached >= JSON_RANK.highlightKeys && askedKeys.length > 0 && (
        <Card on={at('highlightKeys') || at('whyBoth')} color="#22d3ee" className="shrink-0 flex items-center gap-1.5 flex-wrap rounded-lg px-2 py-1 bg-white/[0.03] border border-white/10">
          <span className="text-xs text-white/55">Keys we asked for:</span>
          {askedKeys.map((k, i) => (
            <motion.span
              key={k}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: at('highlightKeys') ? i * 0.15 : 0 }}
              className="font-mono text-xs font-bold rounded-full px-2 py-0.5 border"
              style={{ color: keyColor(k), borderColor: `${keyColor(k)}66`, backgroundColor: `${keyColor(k)}1a` }}
            >
              {k}
            </motion.span>
          ))}
          {reached >= JSON_RANK.whyBoth && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto text-xs text-white/60">
              <span className="text-accent-blue">prompt</span> = WHAT data ·{' '}
              <span className="text-accent-gold">JSON mode</span> = valid FORMAT
            </motion.span>
          )}
        </Card>
      )}

      {/* Waiting for the request to be packed (top panel) */}
      {reached >= JSON_RANK.addSystemMsg && reached < JSON_RANK.buildMessages && (
        <div className="flex-1 min-h-0 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-white/35 text-center px-4">
          {reached >= JSON_RANK.startRequest
            ? 'Packing both prompts into the request above… one more setting is coming.'
            : 'These two prompts will go into the request. The reply will appear here.'}
        </div>
      )}

      {/* Without vs with response_format */}
      {showCompare && (
        <div className="flex-1 min-h-0 flex gap-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: printed ? 0.45 : 1, x: 0 }}
            transition={spring}
            className="flex-1 min-w-0 rounded-xl border border-accent-red/30 bg-accent-red/5 p-2 flex flex-col gap-1 overflow-hidden"
          >
            <div className="text-xs font-bold text-accent-red shrink-0">✗ Without response_format</div>
            <div className="text-[11px] text-white/45 shrink-0">The AI may chat. Hard for a program to read.</div>
            <div className="text-xs text-white/70 whitespace-pre-line leading-snug overflow-hidden">{freeText}</div>
          </motion.div>

          <Card
            on={at('buildMessages') || at('apiProcessing') || at('extractContent') || at('summary')}
            color="#fbbf24"
            className="flex-[1.3] min-w-0 rounded-xl border border-accent-gold/40 bg-accent-gold/5 p-2 flex flex-col gap-1 overflow-hidden"
          >
            <div className="text-xs font-bold text-accent-gold shrink-0">
              ✓ With response_format=<span className="font-mono">{'{"type": "json_object"}'}</span>
            </div>
            <div className="text-[11px] text-white/45 shrink-0">
              {printed ? (
                <>
                  <span className="font-mono">response.choices[0].message.content</span> → printed to Output
                </>
              ) : arrived ? (
                'The reply: pure JSON text, keys and all.'
              ) : at('apiProcessing') ? (
                'The model is writing it now, piece by piece…'
              ) : (
                'Only valid JSON is allowed. The reply will appear here.'
              )}
            </div>
            <div className="flex-1 min-h-0 rounded-lg bg-black/40 border border-white/10 p-2 font-mono text-xs leading-relaxed break-all overflow-hidden">
              {reached >= JSON_RANK.apiProcessing ? (
                <>
                  {printed && <span className="text-accent-gold">&quot;</span>}
                  <JsonText text={jsonShown} keyColor={keyColor} glowKeys={arrived} />
                  {printed && <span className="text-accent-gold">&quot;</span>}
                  {at('apiProcessing') && typed < rawJson.length && (
                    <span className="inline-block w-1.5 h-3.5 bg-accent-gold/80 ml-0.5 animate-pulse align-middle" />
                  )}
                </>
              ) : (
                <span className="text-white/30">
                  {'{ '}
                  <span className="text-accent-purple/60">&quot;{listKey}&quot;</span>
                  {': [ … ] }'}
                </span>
              )}
            </div>
            {reached >= JSON_RANK.isString && (
              <Card on={at('isString')} color="#f472b6" className="shrink-0 flex items-center gap-2 flex-wrap rounded-md px-2 py-1 bg-accent-pink/10 border border-accent-pink/30 text-xs">
                <span className="font-mono text-accent-pink">type → str</span>
                <span className="text-white/60">still just text.</span>
                <span className="font-mono text-accent-green">json.loads()</span>
                <span className="text-white/60">→ dict (challenge lesson)</span>
              </Card>
            )}
          </Card>
        </div>
      )}

      {/* Challenge: json.loads() → dict */}
      {reached === JSON_RANK.jsonParse && (
        <Card on color="#4ade80" className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1 shrink-0">
            <span className="font-mono text-xs text-accent-pink bg-accent-pink/10 px-2 py-0.5 rounded">str</span>
            <span className="font-mono text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">json.loads()</span>
            <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-green-400 text-sm">
              →
            </motion.span>
            <span className="text-xs text-white/50">Python dict (type: dict)</span>
          </div>
          <div className="font-mono text-xs text-white/70 bg-black/30 rounded-xl p-2 border border-green-500/20 overflow-hidden flex-1">
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
      {reached >= JSON_RANK.printOutput && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1 shrink-0">
            <span className="font-mono text-xs text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">json.dumps(parsed_json, indent=2)</span>
            <span className="text-xs text-white/45">each item, one per card</span>
          </div>
          <div className="space-y-1.5 overflow-hidden flex-1">
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
                  className="bg-navy-700/50 border border-white/10 rounded-lg px-3 py-1.5 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/85 font-medium truncate">{String(title)}</div>
                    {rest
                      .filter(([, v]) => String(v).length > 20)
                      .map(([k, v]) => (
                        <div key={k} className="text-xs text-white/55 truncate">{String(v)}</div>
                      ))}
                  </div>
                  <div className="flex gap-1.5 items-center shrink-0">
                    {rest
                      .filter(([, v]) => String(v).length <= 20)
                      .map(([k, v]) => {
                        const c = difficultyColors[String(v)] ?? keyColor(k) ?? '#fbbf24';
                        return (
                          <span
                            key={k}
                            className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                            style={{ color: c, backgroundColor: `${c}15`, border: `1px solid ${c}30` }}
                          >
                            {String(v)}
                          </span>
                        );
                      })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
