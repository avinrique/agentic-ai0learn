'use client';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import {
  BLUE,
  CMD,
  CYAN,
  FileRow,
  FitBox,
  GOLD,
  GREEN,
  KeyArt,
  OS,
  OsToggle,
  RED,
  SafeBox,
  STATIONS,
  StationStrip,
  Terminal,
  TermLine,
  endTime,
  spring,
} from './SetupParts';
import { CHECK_OUT, COPIED_WIN, PIP_OUT, PY_VERSION, REQUIREMENTS, RUN_OUT } from './realOutput';
import SetupSimulator from './SetupSimulator';
import SpotTheLeak from './SpotTheLeak';

const SOLO = TEAM.solo;
const pop = { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } };

/** A step's picture: centered, and shrunk to fit if the panel is small. */
function Scene({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 px-6 py-4">
      <FitBox>{children}</FitBox>
    </motion.div>
  );
}

function Bubble({ children, delay = 0.3, color = '#ffffff' }: { children: ReactNode; delay?: number; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="rounded-2xl px-3 py-1.5 text-[15px] font-medium text-[#0f172a] shadow whitespace-nowrap"
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return <span className="inline-block px-2 py-0.5 rounded-md border border-white/30 border-b-[3px] bg-white/10 text-white font-semibold text-[15px]">{children}</span>;
}

function Chip({ children, color = CYAN, className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[14px] whitespace-nowrap ${className}`} style={{ color: '#e5e7eb', backgroundColor: `${color}1c`, border: `1px solid ${color}55` }}>
      {children}
    </span>
  );
}

function Arrow({ delay = 0, color = CYAN, size = 'text-3xl' }: { delay?: number; color?: string; size?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay, duration: 0.4 }} className={size} style={{ color, originX: 0 }}>
      ➜
    </motion.div>
  );
}

// ---------- terminal scripts for each step ----------

function termLines(trigger: string, os: OS): TermLine[] {
  switch (trigger) {
    case 'terminal':
      return [
        { t: 'cmd', cmd: 'echo Hi, computer', where: 'home' },
        { t: 'out', text: 'Hi, computer' },
        { t: 'idle', where: 'home' },
      ];
    case 'pythonCheck':
      return [
        { t: 'cmd', cmd: CMD.version(os), where: 'home' },
        { t: 'out', text: PY_VERSION, tone: 'ok' },
        { t: 'idle', where: 'home' },
      ];
    case 'openFolder':
      return [
        { t: 'cmd', cmd: CMD.cd(os), where: 'home' },
        { t: 'idle', where: 'kit', hlFolder: true },
      ];
    case 'venv':
      return [{ t: 'cmd', cmd: CMD.venv(os) }, { t: 'idle' }];
    case 'activate':
      return [
        { t: 'cmd', cmd: CMD.activate(os) },
        { t: 'idle', venv: true, hlVenv: true },
      ];
    case 'pip':
      return [{ t: 'cmd', cmd: CMD.pip(), venv: true }, ...PIP_OUT, { t: 'idle', venv: true }];
    case 'envFile':
      return [
        { t: 'cmd', cmd: CMD.copyEnv(os), venv: true },
        ...(os === 'win' ? [COPIED_WIN] : []),
        { t: 'cmd', cmd: CMD.editEnv(os), venv: true },
        { t: 'idle', venv: true },
      ];
    case 'check':
      return [{ t: 'cmd', cmd: CMD.check(), venv: true }, ...CHECK_OUT, { t: 'idle', venv: true }];
    case 'firstRun':
      return [{ t: 'cmd', cmd: CMD.run(), venv: true }, ...RUN_OUT, { t: 'idle', venv: true }];
    default:
      return [];
  }
}

// ---------- scenes ----------

function IntroScene() {
  return (
    <Scene>
      <h2 className="text-3xl font-bold text-white mb-6">Your own AI workshop</h2>
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <Bubble delay={0.9}>Let&apos;s set up your workshop!</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={120} mood="happy" active />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STATIONS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.25 + i * 0.12 }}
              className="relative w-[180px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <div className="absolute top-2.5 right-3 w-5 h-5 rounded border-2 border-white/25" />
              <div className="text-[13px] font-bold text-white/40">STATION {i + 1}</div>
              <div className="text-3xl my-1">{s.icon}</div>
              <div className="text-[16px] font-bold text-white">{s.name}</div>
              <div className="text-[13px] text-white/55">{s.what}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

function Envelope({ label, color }: { label: string; color: string }) {
  return (
    <div className="px-2.5 py-1 rounded-md text-[13px] font-semibold shadow-lg whitespace-nowrap" style={{ backgroundColor: color, color: '#0f172a' }}>
      {label}
    </div>
  );
}

function BigPictureScene() {
  return (
    <Scene>
      <div className="flex items-center">
        {/* your computer */}
        <motion.div {...pop} transition={spring} className="flex flex-col items-center">
          <div className="w-[270px] rounded-t-xl border-[6px] border-b-0 border-slate-500 bg-[#0c0f1a] p-3">
            <div className="font-mono text-[13px] leading-relaxed">
              <div className="text-white/45"># basic_api.py</div>
              <div className="text-white/85">client = OpenAI()</div>
              <div className="text-white/85">response = client…</div>
              <div className="text-white/85">print(response…)</div>
            </div>
          </div>
          <div className="w-[320px] h-3 rounded-b-lg bg-slate-500" />
          <div className="mt-3 text-[17px] font-bold text-white">💻 Your computer</div>
          <div className="text-[14px] text-white/55">runs the program</div>
        </motion.div>

        {/* the internet */}
        <div className="relative w-[330px] h-[150px] mx-3">
          <div className="absolute left-0 right-0 top-[42px] border-t-2 border-dashed" style={{ borderColor: `${GOLD}70` }} />
          <div className="absolute left-0 right-0 top-[108px] border-t-2 border-dashed" style={{ borderColor: `${GREEN}70` }} />
          <div className="absolute right-0 top-[29px] text-xl" style={{ color: GOLD }}>▶</div>
          <div className="absolute left-0 top-[95px] text-xl" style={{ color: GREEN }}>◀</div>
          <div className="absolute inset-x-0 top-[62px] text-center text-[13px] text-white/45">🌐 the internet</div>
          <motion.div className="absolute top-[28px]" initial={{ left: 10, opacity: 0 }} animate={{ left: [10, 180, 180], opacity: [1, 1, 0] }} transition={{ duration: 2.2, times: [0, 0.85, 1], repeat: Infinity, repeatDelay: 1.6 }}>
            <Envelope label="✉️ question + 🔑 key" color="#fde68a" />
          </motion.div>
          <motion.div className="absolute top-[94px]" initial={{ left: 220, opacity: 0 }} animate={{ left: [220, 220, 40, 40], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.4, times: [0, 0.05, 0.9, 1], delay: 1.9, repeat: Infinity, repeatDelay: 1.4 }}>
            <Envelope label="✉️ answer" color="#bbf7d0" />
          </motion.div>
        </div>

        {/* OpenAI */}
        <motion.div {...pop} transition={{ ...spring, delay: 0.25 }} className="flex flex-col items-center">
          <div className="w-[250px] h-[150px] rounded-[40px] border-2 flex flex-col items-center justify-center" style={{ borderColor: `${BLUE}90`, backgroundColor: `${BLUE}14` }}>
            <div className="text-5xl">🧠</div>
            <div className="mt-1 font-mono text-[15px] text-white">gpt-4o-mini</div>
          </div>
          <div className="mt-3 text-[17px] font-bold text-white">☁️ OpenAI&apos;s computers</div>
          <div className="text-[14px] text-white/55">run the model</div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-10 flex items-center gap-2 text-[14px] text-white/60">
        Your computer needs:
        <Chip color={GREEN}>🐍 Python</Chip>
        <Chip color={GREEN}>📦 the code</Chip>
        <Chip color={GOLD}>🔑 a key</Chip>
      </motion.div>
    </Scene>
  );
}

function HowToOpen({ os }: { os: OS }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2.5 text-[15px] text-white/75 whitespace-nowrap">
      <span className="text-white/50 mr-1">Open it:</span>
      {os === 'mac' ? (
        <>
          <Key>⌘ Command</Key> + <Key>Space</Key> → type <span className="font-mono text-white">Terminal</span> → <Key>Enter</Key>
        </>
      ) : (
        <>
          <Key>⊞ Start</Key> → type <span className="font-mono text-white">cmd</span> → <Key>Enter</Key>
          <span className="text-white/50 ml-1">(Command Prompt)</span>
        </>
      )}
    </motion.div>
  );
}

function TerminalScene({ os }: { os: OS }) {
  return (
    <Scene>
      <Terminal os={os} lines={termLines('terminal', os)} width={760} fontSize={20} />
      <div className="flex gap-6 mt-4 text-[14px] whitespace-nowrap">
        <span className="text-white/60">
          <span className="font-mono text-white/60">{os === 'mac' ? 'sam@MacBook ~ %' : 'C:\\Users\\sam>'}</span> = where you are
        </span>
        <span className="text-white font-semibold">white = what you type</span>
        <span className="text-white/60">below = the reply</span>
      </div>
      <div className="mt-6">
        <HowToOpen os={os} />
      </div>
    </Scene>
  );
}

function Checkbox({ label, tick, delay }: { label: string; tick: boolean; delay: number }) {
  return (
    <div className="flex items-center gap-2 text-[14px] text-[#1f2937]">
      <motion.span
        className="w-[18px] h-[18px] rounded-[3px] border-2 flex items-center justify-center text-[13px] font-bold"
        initial={{ backgroundColor: '#ffffff', borderColor: '#6b7280', color: 'rgba(255,255,255,0)' }}
        animate={tick ? { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff' } : undefined}
        transition={{ delay, duration: 0.2 }}
      >
        ✓
      </motion.span>
      {label}
    </div>
  );
}

const PY_EXAMPLE = PY_VERSION.replace('Python ', ''); // e.g. 3.14.7, the same example everywhere

function WindowsInstaller() {
  return (
    <div className="w-[640px] rounded-md overflow-hidden shadow-2xl border border-black/40 bg-white">
      <div className="h-8 px-3 flex items-center justify-between bg-[#f3f3f3] border-b border-black/10 text-[13px] text-[#1f2937]">
        <span>🐍 Python {PY_EXAMPLE} (64-bit) Setup</span>
        <span className="text-black/50 tracking-[0.6em]">— ✕</span>
      </div>
      <div className="flex">
        <div className="w-[120px] bg-gradient-to-b from-[#306998] to-[#ffd43b] flex items-start justify-center pt-6 text-5xl">🐍</div>
        <div className="flex-1 p-5 text-[#1f2937]">
          <div className="text-[20px] font-semibold text-[#1e3a8a]">Install Python {PY_EXAMPLE} (64-bit)</div>
          <div className="text-[13px] text-black/55 mt-1">Select Install Now to install Python with default settings.</div>
          <motion.div
            className="mt-4 rounded px-3 py-2"
            initial={{ backgroundColor: 'rgba(37,99,235,0)' }}
            animate={{ backgroundColor: ['rgba(37,99,235,0)', 'rgba(37,99,235,0.12)'] }}
            transition={{ delay: 2.4, duration: 0.3 }}
          >
            <div className="text-[17px] font-semibold text-[#1d4ed8]">➜ Install Now</div>
            <div className="text-[13px] text-black/50 pl-5">Includes IDLE, pip and documentation</div>
          </motion.div>
          <div className="px-3 py-1 text-[15px] text-[#1d4ed8]">➜ Customize installation</div>
          <div className="mt-5 space-y-2 relative">
            <Checkbox label="Use admin privileges when installing py.exe" tick={false} delay={0} />
            <motion.div
              className="relative -mx-2 px-2 py-1 rounded-md"
              initial={{ boxShadow: '0 0 0 0px rgba(251,191,36,0)' }}
              animate={{ boxShadow: '0 0 0 3px rgba(251,191,36,0.95)' }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <Checkbox label="Add python.exe to PATH" tick delay={1.6} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacInstaller() {
  const steps = ['Introduction', 'Read Me', 'License', 'Destination Select', 'Installation Type', 'Installation', 'Summary'];
  return (
    <div className="w-[640px] rounded-xl overflow-hidden shadow-2xl border border-black/30 bg-[#ececec]">
      <div className="relative h-8 flex items-center px-3 bg-[#dedede]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="absolute inset-x-0 text-center text-[13px] text-black/60">Install Python</div>
      </div>
      <div className="flex p-4 gap-4 text-[#1f2937]">
        <div className="w-[170px] space-y-1.5 text-[14px]">
          {steps.map((s, i) => (
            <div key={s} className={i === 0 ? 'font-semibold' : 'text-black/45'}>
              {i === 0 ? '● ' : '○ '}
              {s}
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-md bg-white border border-black/10 p-4 flex flex-col">
          <div className="text-[18px] font-semibold">Welcome to the Python Installer</div>
          <div className="text-[13px] text-black/55 mt-1">Python {PY_EXAMPLE} for macOS</div>
          <div className="flex-1" />
          <div className="flex justify-end gap-2 mt-10">
            <span className="px-3 py-1 rounded-md bg-white border border-black/20 text-[14px]">Go Back</span>
            <motion.span
              className="px-3 py-1 rounded-md text-white text-[14px] font-semibold"
              style={{ backgroundColor: '#2563eb' }}
              initial={{ boxShadow: '0 0 0 0px rgba(251,191,36,0)' }}
              animate={{ boxShadow: '0 0 0 3px rgba(251,191,36,0.95)' }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              Continue
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PythonScene({ os }: { os: OS }) {
  return (
    <Scene>
      <div className="flex items-center gap-2 mb-5 text-[14px] text-white/70">
        <Chip color={BLUE}>🌐 python.org</Chip>→<Chip color={BLUE}>Downloads</Chip>→
        {/* python.org's big Windows button now gives the "install manager"; the link under it gives this installer */}
        {os === 'win' ? <Chip color={GOLD}>“Or get the standalone installer”</Chip> : <Chip color={BLUE}>the macOS installer</Chip>}
      </div>
      <div className="flex items-center gap-6">
        {os === 'win' ? <WindowsInstaller /> : <MacInstaller />}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 1.1 }} className="w-[210px] flex flex-col items-center gap-2">
          <Bubble color="#fde68a" delay={1.1}>{os === 'win' ? 'Tick this box first!' : 'Continue → Install'}</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={86} mood="happy" />
          {os === 'mac' && <div className="text-[13px] text-white/55 text-center">No PATH box on a Mac: just click through.</div>}
        </motion.div>
      </div>
    </Scene>
  );
}

function PythonCheckScene({ os }: { os: OS }) {
  const lines = termLines('pythonCheck', os);
  return (
    <Scene>
      <Terminal os={os} lines={lines} width={760} fontSize={20} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: endTime(lines) }} className="mt-5">
        <Chip color={GREEN}>✓ 3.10 or newer = ready</Chip>
      </motion.div>
    </Scene>
  );
}

const KIT_FILES: { icon: string; name: string; label: string; hl?: boolean }[] = [
  { icon: '📄', name: 'README.md', label: 'read me first' },
  { icon: '📄', name: 'requirements.txt', label: 'tool shopping list' },
  { icon: '📄', name: '.env.example', label: 'key template' },
  { icon: '📄', name: '.gitignore', label: '“don’t upload” list' },
  { icon: '🐍', name: 'run.py', label: 'runs a lesson', hl: true },
  { icon: '🐍', name: 'check_setup.py', label: 'checks your setup', hl: true },
  { icon: '📁', name: 'part1/ … part4/', label: 'every lesson program' },
];

function KitScene({ os }: { os: OS }) {
  return (
    <Scene>
      <div className="flex items-center gap-8">
        <motion.div {...pop} transition={spring} className="flex flex-col items-center gap-3">
          <div className="w-[120px] h-[140px] rounded-xl border-2 border-white/20 bg-white/[0.06] flex flex-col items-center justify-center">
            <div className="text-5xl">🗜️</div>
            <div className="text-[13px] text-white/60 mt-1">.zip</div>
          </div>
          <div className="font-mono text-[14px] text-white">ai-course-code.zip</div>
          <a href="/code/ai-course-code.zip" download className="px-4 py-1.5 rounded-lg font-semibold text-[15px] text-navy-900 hover:brightness-110" style={{ backgroundColor: CYAN }}>
            ⬇ Download the kit
          </a>
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <Arrow delay={0.4} />
          <div className="text-[14px] text-white/60 text-center whitespace-nowrap">{os === 'win' ? 'right-click →' : 'double-click'}</div>
          {os === 'win' && <div className="text-[14px] text-white/60 whitespace-nowrap">Extract All…</div>}
        </div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.6 }} className="rounded-xl border-2 p-4 w-[520px]" style={{ borderColor: `${CYAN}60`, backgroundColor: `${CYAN}08` }}>
          {os === 'win' && <div className="font-mono text-[15px] text-white/50 mb-1">📂 ai-course-code\</div>}
          <div className={`flex items-center gap-2 text-[18px] font-bold text-white mb-2 font-mono ${os === 'win' ? 'pl-5' : ''}`}>📂 ai-course{os === 'win' ? '\\' : '/'}</div>
          <div className={`pl-3 border-l-2 border-white/10 space-y-0.5 ${os === 'win' ? 'ml-5' : ''}`}>
            {KIT_FILES.map((f, i) => (
              <FileRow key={f.name} icon={f.icon} name={f.name} label={f.label} hl={f.hl} delay={0.9 + i * 0.12} />
            ))}
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}

function OpenFolderScene({ os }: { os: OS }) {
  return (
    <Scene>
      <div className="flex items-center gap-3 mb-6 text-[15px] text-white/80">
        <Chip>
          1 · type <span className="font-mono text-white">cd</span> and a space
        </Chip>
        →<Chip>2 · drag the ai-course folder into the window</Chip>→
        <Chip>
          3 · press <Key>Enter</Key>
        </Chip>
      </div>
      <Terminal os={os} lines={termLines('openFolder', os)} width={860} fontSize={19} />
    </Scene>
  );
}

function VenvScene({ os }: { os: OS }) {
  const lines = termLines('venv', os);
  const t = endTime(lines);
  const slash = os === 'win' ? '\\' : '/';
  return (
    <Scene>
      <Terminal os={os} lines={lines} width={860} fontSize={19} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 w-[420px]">
        <div className="font-mono text-[16px] font-bold text-white mb-2">📂 ai-course{slash}</div>
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: t, duration: 0.4 }} className="overflow-hidden">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 m-0.5 mb-1.5" style={{ backgroundColor: `${GREEN}18`, outline: `2px solid ${GREEN}90` }}>
            <span className="text-4xl">🧰</span>
            <div>
              <div className="font-mono text-[18px] text-white font-bold">.venv{slash}</div>
              <div className="text-[14px]" style={{ color: GREEN }}>new: your private toolbox</div>
            </div>
          </div>
        </motion.div>
        <div className="opacity-45 pl-1">
          <FileRow icon="📁" name={`part1${slash} … part4${slash}`} />
          <FileRow icon="🐍" name="run.py" />
        </div>
      </motion.div>
    </Scene>
  );
}

function ActivateScene({ os }: { os: OS }) {
  const lines = termLines('activate', os);
  const t = endTime(lines);
  return (
    <Scene>
      <Terminal os={os} lines={lines} width={900} fontSize={19} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: t + 0.2 }} className="mt-5 flex items-center gap-3">
        <span className="px-3 py-1.5 rounded-lg font-mono text-[18px] font-bold" style={{ color: '#a5f3fc', backgroundColor: 'rgba(34,211,238,0.2)' }}>
          (.venv)
        </span>
        <span className="text-[17px] text-white">= 🧰 toolbox ON</span>
      </motion.div>
      {os === 'win' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 0.6 }} className="mt-5">
          <Chip color="#94a3b8">PowerShell says scripts are disabled? Use Command Prompt.</Chip>
        </motion.div>
      )}
    </Scene>
  );
}

function PipScene({ os }: { os: OS }) {
  const lines = termLines('pip', os);
  return (
    <Scene>
      <div className="flex items-center gap-6">
        <motion.div initial={{ opacity: 0, rotate: -4, y: 10 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={spring} className="w-[200px] rounded-md bg-[#fffdf7] text-[#1f2937] shadow-lg">
          <div className="px-3 pt-2 pb-1 border-b border-black/10 font-mono text-[14px] font-bold text-black/60">🛒 requirements.txt</div>
          <div className="px-3 py-2 space-y-1">
            {REQUIREMENTS.map((r, i) => (
              <div key={r} className="flex items-center gap-2 font-mono text-[15px]">
                <motion.span initial={{ color: 'rgba(0,0,0,0.25)' }} animate={{ color: '#16a34a' }} transition={{ delay: 1.6 + i * 0.15 }}>
                  ✓
                </motion.span>
                {r}
              </div>
            ))}
          </div>
        </motion.div>
        <Terminal os={os} lines={lines} width={840} fontSize={15} />
      </div>
    </Scene>
  );
}

function ApiKeyScene() {
  return (
    <Scene>
      <div className="flex items-center gap-2 text-[15px] text-white/70">
        <Chip color={BLUE}>🌐 platform.openai.com</Chip>→<Chip color={BLUE}>API keys</Chip>→<Chip color={GOLD}>+ Create new secret key</Chip>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.7, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ ...spring, delay: 0.5 }} className="my-6">
        <KeyArt size={440} tag="sk-proj-4fQx…" glow />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="px-4 py-2 rounded-xl text-[16px] font-semibold" style={{ color: '#fde68a', backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}60` }}>
        ⚠️ Shown only once: copy it now
      </motion.div>
    </Scene>
  );
}

function CreditScene() {
  return (
    <Scene>
      <div className="flex items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="w-[300px] rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center opacity-80">
          <div className="text-4xl">💬</div>
          <div className="text-[18px] font-bold text-white mt-1">ChatGPT subscription</div>
          <div className="text-[14px] text-white/55">for the chat app</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.5 }} className="text-6xl font-bold" style={{ color: RED }}>
          ≠
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 }} className="w-[300px] rounded-2xl border-2 p-5 text-center" style={{ borderColor: `${GREEN}80`, backgroundColor: `${GREEN}10` }}>
          <div className="text-4xl">🐍</div>
          <div className="text-[18px] font-bold text-white mt-1">API credit</div>
          <div className="text-[14px] text-white/65">for your code · pay per use</div>
        </motion.div>
      </div>

      {/* prepaid credit: when it's used up, calls stop */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.0 }} className="mt-10 w-[720px]">
        <div className="flex items-center justify-between text-[15px] text-white/80 mb-2">
          <span>
            ① Add a little credit <span className="text-white/50">(e.g. $5)</span>
          </span>
          <span className="flex items-center gap-2">
            ② Auto-recharge
            <span className="px-2 py-0.5 rounded-full text-[13px] font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.3)' }}>
              OFF
            </span>
          </span>
        </div>
        <div className="relative h-8 rounded-lg border-2 overflow-hidden" style={{ borderColor: `${GREEN}70`, backgroundColor: `${GREEN}30` }}>
          {/* the part already spent */}
          <motion.div className="absolute left-0 top-0 bottom-0 bg-white/15" initial={{ width: '0%' }} animate={{ width: '6%' }} transition={{ delay: 1.5, duration: 0.8 }} />
          <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-white/85">$5 of credit</div>
        </div>
        <div className="relative h-6 mt-1.5 text-[14px]">
          <span className="absolute left-0 text-white/55">spent so far</span>
          <span className="absolute right-0 font-semibold" style={{ color: '#fca5a5' }}>
            credit runs out = calls stop 🛑
          </span>
        </div>
      </motion.div>
    </Scene>
  );
}

function CostMeter() {
  // needle angle: -90 = far left ($0), +90 = far right (all $5 used)
  const R = 150;
  const arc = (from: number, to: number) => {
    const p = (a: number) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `${180 + R * Math.cos(rad)} ${180 + R * Math.sin(rad)}`;
    };
    return `M ${p(from)} A ${R} ${R} 0 0 1 ${p(to)}`;
  };
  return (
    <svg viewBox="0 0 360 215" width={400} height={239} aria-hidden>
      <path d={arc(-90, 30)} stroke={GREEN} strokeWidth="22" fill="none" opacity="0.75" />
      <path d={arc(30, 62)} stroke={GOLD} strokeWidth="22" fill="none" opacity="0.75" />
      <path d={arc(62, 90)} stroke={RED} strokeWidth="22" fill="none" opacity="0.85" />
      <text x="12" y="208" fontSize="15" fill="rgba(255,255,255,0.65)">$0</text>
      <text x="348" y="208" fontSize="15" textAnchor="end" fill="rgba(255,255,255,0.65)">$5</text>
      {/* a few cents out of $5 barely moves the needle. Rotate around the hub: the bottom of the line's own box. */}
      <motion.g initial={{ rotate: -90 }} animate={{ rotate: -84 }} transition={{ delay: 0.8, type: 'spring', stiffness: 60, damping: 10 }} style={{ originX: 0.5, originY: 1 }}>
        <line x1="180" y1="180" x2="180" y2="56" stroke="white" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <circle cx="180" cy="180" r="11" fill="white" />
    </svg>
  );
}

function CostScene() {
  return (
    <Scene>
      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-3 w-[300px]">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="rounded-xl border px-4 py-3" style={{ borderColor: `${BLUE}60`, backgroundColor: `${BLUE}10` }}>
            <div className="text-[16px] font-bold text-white">⬆ Tokens in</div>
            <div className="text-[14px] text-white/65">your message · cheaper</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 }} className="rounded-xl border px-4 py-3" style={{ borderColor: `${GOLD}60`, backgroundColor: `${GOLD}10` }}>
            <div className="text-[16px] font-bold text-white">⬇ Tokens out</div>
            <div className="text-[14px] text-white/65">the AI&apos;s answer · pricier</div>
          </motion.div>
        </div>
        <motion.div {...pop} transition={{ ...spring, delay: 0.3 }} className="flex flex-col items-center">
          <div className="text-[13px] font-bold uppercase tracking-wider text-white/50 mb-1">🧾 Cost meter · gpt-4o-mini</div>
          <CostMeter />
          <div className="-mt-1 text-[26px] font-bold text-white">a few cents</div>
          <div className="text-[14px] text-white/60">the whole course: every program, a few runs</div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[14px] text-white/75 text-center">
        Example: the poem program, one run ≈ 20 tokens in + 40 out ≈ <span className="font-bold text-white">$0.00003</span>
        <div className="text-[13px] text-white/45 mt-0.5">illustrative, with example prices: $0.15 per 1M tokens in, $0.60 per 1M out · check openai.com/api/pricing</div>
      </motion.div>
    </Scene>
  );
}

// The first two lines of the kit's .env.example (shortened: they're comments, the key line is what matters)
const ENV_COMMENTS = ['# Copy this file to a new file called .env, then paste…', '# Keep .env secret: never share it, screenshot it or…'];

function EnvFileScene({ os }: { os: OS }) {
  const lines = termLines('envFile', os);
  const t = endTime(lines);
  return (
    <Scene>
      <Terminal os={os} lines={lines} width={900} fontSize={16} />
      <div className="mt-6 flex items-center gap-6">
        <SafeBox width={560}>
          <div className="w-full">
            <div className="text-[13px] text-white/50 mb-1">{os === 'mac' ? '📝 .env — TextEdit' : '📝 .env — Notepad'}</div>
            {ENV_COMMENTS.map((c) => (
              <div key={c} className="font-mono text-[13px] text-white/40 whitespace-nowrap">
                {c}
              </div>
            ))}
            <div className="font-mono text-[18px] whitespace-nowrap mt-0.5">
              <span className="text-white">OPENAI_API_KEY=</span>
              {/* the example key gets selected, then the real key is pasted over it */}
              <motion.span
                className="inline-block align-bottom overflow-hidden whitespace-pre rounded-sm text-white/70"
                initial={{ width: '16ch', backgroundColor: 'rgba(59,130,246,0)' }}
                animate={{ width: ['16ch', '16ch', '0ch'], backgroundColor: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.55)', 'rgba(59,130,246,0.55)'] }}
                transition={{ delay: t + 0.3, duration: 1.2, times: [0, 0.45, 1] }}
              >
                sk-your-key-here
              </motion.span>
              <motion.span
                className="inline-block align-bottom overflow-hidden whitespace-pre font-bold"
                style={{ color: GOLD }}
                initial={{ width: 0 }}
                animate={{ width: '17ch' }}
                transition={{ delay: t + 1.5, duration: 0.25 }}
              >
                sk-proj-4fQx…9aZ
              </motion.span>
            </div>
          </div>
        </SafeBox>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 2 }} className="w-[220px] text-[14px] text-white/70 leading-snug">
          <span className="font-mono text-white px-1.5 py-0.5 rounded bg-white/10">.gitignore</span> already lists <span className="font-mono text-white">.env</span>, so it&apos;s never uploaded.
        </motion.div>
      </div>
    </Scene>
  );
}

function Postcard({ title, rot, delay, children }: { title: string; rot: number; delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      transition={{ ...spring, delay }}
      className="relative w-[230px] h-[150px] rounded-md bg-[#fffdf7] text-[#1f2937] shadow-lg p-3"
    >
      <div className="text-[14px] font-bold text-black/55">{title}</div>
      <div className="mt-2 text-[14px] leading-snug">{children}</div>
      <motion.div
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.6, type: 'spring', stiffness: 300, damping: 15 }}
        className="absolute -right-3 -top-3 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow"
        style={{ backgroundColor: RED }}
      >
        ✗
      </motion.div>
    </motion.div>
  );
}

function PostcardScene() {
  return (
    <Scene>
      <div className="flex items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[15px] font-semibold" style={{ color: GREEN }}>
            ✓ In the locked box
          </div>
          <SafeBox width={300}>
            <KeyArt size={250} tag="sk-proj-…" />
          </SafeBox>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-[15px] font-semibold" style={{ color: '#fca5a5' }}>
            ✗ On a postcard: anyone can read it
          </div>
          <div className="flex gap-6 pt-3">
            <Postcard title="📄 in your code" rot={-4} delay={0.3}>
              <div className="font-mono text-[13px] bg-black/5 rounded px-1.5 py-1">
                OpenAI(api_key=
                <br />
                &quot;sk-proj-4fQx…&quot;)
              </div>
            </Postcard>
            <Postcard title="🌍 on GitHub" rot={3} delay={0.5}>
              a public code-sharing website: bots search it for keys all day
            </Postcard>
            <Postcard title="💬 chat or screenshot" rot={-2} delay={0.7}>
              “look, my setup works!” 📸 with the key in the picture
            </Postcard>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="mt-10 flex items-center gap-3 text-[15px] text-white/80">
        <Chip color={RED}>🚨 Leaked?</Chip>→<Chip color={RED}>🗑️ Delete it on the website</Chip>→<Chip color={GOLD}>🔑 Make a new one</Chip>
      </motion.div>
    </Scene>
  );
}

function CheckScene({ os }: { os: OS }) {
  const lines = termLines('check', os);
  const t = endTime(lines);
  return (
    <Scene>
      <div className="flex items-end gap-5">
        <Terminal os={os} lines={lines} width={880} fontSize={17} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: t }} className="flex flex-col items-center gap-2 w-[130px]">
          <Bubble delay={t + 0.2}>Ready!</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={90} mood="proud" />
        </motion.div>
      </div>
    </Scene>
  );
}

function FirstRunScene({ os }: { os: OS }) {
  const lines = termLines('firstRun', os);
  const t = endTime(lines);
  return (
    <Scene>
      <div className="flex items-end gap-6">
        <Terminal os={os} lines={lines} width={900} fontSize={16} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: t }} className="flex flex-col items-center gap-2 w-[150px]">
          <Bubble delay={t + 0.2} color="#bbf7d0">
            🎉 It works!
          </Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={100} mood="proud" active />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 0.6 }} className="mt-6 flex items-center gap-3 text-[14px] text-white/65">
        On every code lesson:
        <span className="px-3 py-1 rounded-lg border text-[14px] font-semibold text-white" style={{ borderColor: `${GREEN}80`, backgroundColor: `${GREEN}18` }}>
          💻 Run it yourself
        </span>
      </motion.div>
    </Scene>
  );
}

interface ErrCard {
  /** what the student sees (through run.py or check_setup.py) */
  err: string;
  /** the same problem when a file is run directly with python */
  direct?: string;
  means: string;
  fix: string;
}

function ErrorsScene({ os }: { os: OS }) {
  const cards: ErrCard[] = [
    {
      err: "The course libraries aren't installed yet, or your toolbox (.venv) isn't switched on.",
      direct: "ModuleNotFoundError: No module named 'openai'",
      means: 'The toolbox is off, or pip install never ran in it.',
      fix: `${CMD.activate(os)}, then pip install -r requirements.txt`,
    },
    {
      err: 'No API key found.',
      direct: 'OpenAIError: Missing credentials. Please pass an `api_key`…',
      means: 'There is no .env file, or no key in it.',
      fix: 'Copy .env.example to .env and put your key in it.',
    },
    {
      err: "AuthenticationError: OpenAI didn't accept your API key.",
      means: 'Error 401: the key has a typo, or it was deleted.',
      fix: 'Check the key in .env. Deleted? Make a new one.',
    },
    {
      err: 'RateLimitError: Your OpenAI account has no credit left (insufficient_quota).',
      means: 'Your credit has run out. Trying again won’t help.',
      fix: 'Add credit on the Billing page.',
    },
    os === 'mac'
      ? { err: 'zsh: command not found: python', means: 'Outside the toolbox, a Mac only knows python3.', fix: 'Type python3, or switch on the toolbox first.' }
      : {
          err: 'Python was not found; run without arguments to install from the Microsoft Store…',
          means: "Windows can't find the Python you installed.",
          fix: 'Try py instead. Or reinstall with “Add python.exe to PATH” ticked, then open a new terminal.',
        },
  ];
  return (
    <Scene>
      <div className="grid grid-cols-2 gap-3 w-[1090px]">
        {cards.map((c, i) => (
          <motion.div
            key={c.err}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 + i * 0.15 }}
            className={`rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden ${i === cards.length - 1 ? 'col-span-2 justify-self-center w-[540px]' : ''}`}
          >
            <div className="px-4 py-2 font-mono text-[14px] font-semibold leading-snug" style={{ backgroundColor: 'rgba(248,113,113,0.12)', color: '#fca5a5' }}>
              {c.err}
              {c.direct && <div className="mt-0.5 text-[13px] font-normal text-white/45">or, running a file directly: {c.direct}</div>}
            </div>
            <div className="px-4 py-2 space-y-1 text-[14px]">
              <div className="text-white/75">
                <span className="text-white/45">Means: </span>
                {c.means}
              </div>
              <div className="text-white">
                <span style={{ color: GREEN }}>Fix: </span>
                {c.fix}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

function RoutineScene({ os }: { os: OS }) {
  const steps = [
    { icon: '🚪', title: 'Go to the folder', cmd: os === 'mac' ? 'cd Downloads/ai-course' : 'cd Downloads\\ai-course-code\\ai-course' },
    { icon: '💡', title: 'Switch on the toolbox', cmd: CMD.activate(os) },
    { icon: '▶️', title: 'Run a lesson', cmd: CMD.run() },
  ];
  return (
    <Scene>
      <div className="text-[14px] font-semibold uppercase tracking-wider text-white/50 mb-4">Every new terminal</div>
      <div className="flex flex-col items-stretch gap-2 w-[760px]">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-col items-center gap-2">
            {i > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.3 }} className="text-2xl leading-none" style={{ color: CYAN }}>
                ↓
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.2 + i * 0.3 }}
              className="w-full rounded-2xl border-2 px-5 py-3 flex items-center gap-4"
              style={{ borderColor: `${CYAN}55`, backgroundColor: `${CYAN}0c` }}
            >
              <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[15px] font-bold" style={{ color: CYAN, border: `1px solid ${CYAN}80` }}>
                {i + 1}
              </span>
              <span className="text-3xl">{s.icon}</span>
              <span className="w-[210px] shrink-0 text-[17px] font-bold text-white">{s.title}</span>
              <span className="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 py-1.5 font-mono text-[16px] text-white whitespace-nowrap">{s.cmd}</span>
            </motion.div>
          </div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 text-[15px] text-white/65">
        Setup (Python, kit, pip install, key) happens only once. ✓
      </motion.div>
    </Scene>
  );
}

function TakeawaysScene() {
  const items = [
    { text: 'Python + the code kit + a toolbox (.venv with pip) let your computer run every lesson.', color: GREEN },
    { text: 'Your API key lives in .env only. Never in code, chats, screenshots or GitHub.', color: GOLD },
    { text: 'You pay per token (in and out). gpt-4o-mini is cheap, and prepaid credit with auto-recharge off caps your spending.', color: CYAN },
  ];
  return (
    <Scene>
      <h2 className="text-2xl font-bold text-white mb-5">What you learned</h2>
      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-3 w-[680px]">
          {items.map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.15 }} className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-white/[0.02]" style={{ borderColor: `${it.color}40` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border" style={{ color: it.color, borderColor: `${it.color}60`, backgroundColor: `${it.color}15` }}>
                {i + 1}
              </span>
              <span className="text-[16px] text-white/85">{it.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <Bubble delay={0.7}>Workshop ready!</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={110} mood="proud" />
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-7">
        <StationStrip current={-1} done={6} />
      </motion.div>
    </Scene>
  );
}

// ---------- which station each step is at ----------

interface Meta {
  station?: { current: number; done: number; flip?: boolean };
  os?: boolean; // show the Mac / Windows switch
}

const META: Record<string, Meta> = {
  terminal: { os: true },
  python: { station: { current: 0, done: 0 }, os: true },
  pythonCheck: { station: { current: 0, done: 0, flip: true }, os: true },
  kit: { station: { current: 1, done: 1 }, os: true },
  openFolder: { station: { current: 1, done: 1, flip: true }, os: true },
  venv: { station: { current: 2, done: 2 }, os: true },
  activate: { station: { current: 2, done: 2 }, os: true },
  pip: { station: { current: 2, done: 2, flip: true }, os: true },
  apiKey: { station: { current: 3, done: 3 } },
  credit: { station: { current: 3, done: 3 } },
  cost: { station: { current: 3, done: 3, flip: true } },
  envFile: { station: { current: 4, done: 4, flip: true }, os: true },
  postcard: { station: { current: 4, done: 5 } },
  check: { station: { current: 5, done: 5 }, os: true },
  firstRun: { station: { current: 5, done: 5, flip: true }, os: true },
  errors: { os: true },
  routine: { os: true },
};

function flipTime(trigger: string, os: OS) {
  const lines = termLines(trigger, os);
  if (lines.length) return endTime(lines);
  return 2.4; // scenes without a terminal
}

function detectOs(): OS {
  if (typeof navigator === 'undefined') return 'win';
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'win';
  if (/Macintosh|Mac OS X|X11|Linux/i.test(ua) && !/Android/i.test(ua)) return 'mac';
  return 'win';
}

// ---------- main ----------

export default function SetupAnim() {
  const trigger = useConceptStore((st) => st.steps[st.currentStep]?.animationTrigger) ?? 'intro';
  const [os, setOs] = useState<OS>('win');
  useEffect(() => setOs(detectOs()), []);

  let scene: ReactNode;
  switch (trigger) {
    case 'bigPicture':
      scene = <BigPictureScene />;
      break;
    case 'terminal':
      scene = <TerminalScene os={os} />;
      break;
    case 'python':
      scene = <PythonScene os={os} />;
      break;
    case 'pythonCheck':
      scene = <PythonCheckScene os={os} />;
      break;
    case 'kit':
      scene = <KitScene os={os} />;
      break;
    case 'openFolder':
      scene = <OpenFolderScene os={os} />;
      break;
    case 'venv':
      scene = <VenvScene os={os} />;
      break;
    case 'activate':
      scene = <ActivateScene os={os} />;
      break;
    case 'pip':
      scene = <PipScene os={os} />;
      break;
    case 'apiKey':
      scene = <ApiKeyScene />;
      break;
    case 'credit':
      scene = <CreditScene />;
      break;
    case 'cost':
      scene = <CostScene />;
      break;
    case 'envFile':
      scene = <EnvFileScene os={os} />;
      break;
    case 'postcard':
      scene = <PostcardScene />;
      break;
    case 'check':
      scene = <CheckScene os={os} />;
      break;
    case 'firstRun':
      scene = <FirstRunScene os={os} />;
      break;
    case 'errors':
      scene = <ErrorsScene os={os} />;
      break;
    case 'routine':
      scene = <RoutineScene os={os} />;
      break;
    case 'playground':
      scene = <SetupSimulator os={os} setOs={setOs} />;
      break;
    case 'playground2':
      scene = <SpotTheLeak />;
      break;
    case 'takeaways':
      scene = <TakeawaysScene />;
      break;
    default:
      scene = <IntroScene />;
  }

  const meta = META[trigger] ?? {};
  const showBar = !!meta.station || !!meta.os;
  // The simulator keeps its own progress for each computer type, so switching doesn't restart it.
  const sceneKey = trigger === 'playground' ? trigger : `${trigger}-${os}`;

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-900/40 flex flex-col">
      {showBar && (
        <div className="shrink-0 h-12 px-5 flex items-center justify-between gap-4 border-b border-white/5">
          <div key={`${trigger}-${os}`} className="min-w-0">
            {meta.station && <StationStrip current={meta.station.current} done={meta.station.done} flipAt={meta.station.flip ? flipTime(trigger, os) : undefined} />}
          </div>
          {meta.os && <OsToggle os={os} setOs={setOs} />}
        </div>
      )}
      <div key={sceneKey} className="relative flex-1 min-h-0">
        {scene}
      </div>
    </div>
  );
}
