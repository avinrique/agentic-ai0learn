'use client';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useConceptStore } from '@/stores/conceptStore';
import AgentBot, { TEAM } from '@/components/animations/characters/AgentBot';
import {
  BLUE,
  CHECK_OUT,
  CMD,
  CYAN,
  FileRow,
  GOLD,
  GREEN,
  KeyArt,
  OS,
  OsToggle,
  PIP_OUT,
  PY_VERSION,
  RED,
  REQUIREMENTS,
  RUN_OUT,
  SafeBox,
  STATIONS,
  StationStrip,
  Terminal,
  TermLine,
  endTime,
  spring,
} from './SetupParts';
import SetupSimulator from './SetupSimulator';
import SpotTheLeak from './SpotTheLeak';

const SOLO = TEAM.solo;
const pop = { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } };

function Scene({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 py-4 ${className}`}
    >
      {children}
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
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[14px] ${className}`} style={{ color: '#e5e7eb', backgroundColor: `${color}1c`, border: `1px solid ${color}55` }}>
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
      return [
        { t: 'cmd', cmd: CMD.venv(os) },
        { t: 'idle' },
      ];
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
        ...(os === 'win' ? [{ t: 'out' as const, text: '        1 file(s) copied.' }] : []),
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
      <div className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ color: CYAN }}>Part 1 · From watching to doing</div>
      <h2 className="text-3xl font-bold text-white mb-6">Your own AI workshop</h2>
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <Bubble delay={0.9}>Let&apos;s set up your workshop!</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} role="your setup helper" size={120} mood="happy" active />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STATIONS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.25 + i * 0.12 }}
              className="relative w-[180px] rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3"
            >
              <div className="absolute top-2.5 right-3 w-5 h-5 rounded border-2 border-white/25" />
              <div className="text-[12px] font-bold text-white/40">STATION {i + 1}</div>
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2.5 text-[15px] text-white/75">
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
      <div className="flex gap-6 mt-4 text-[14px]">
        <span className="text-white/60"><span className="font-mono text-white/60">{os === 'mac' ? 'sam@MacBook ~ %' : 'C:\\Users\\sam>'}</span> = where you are</span>
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
        className="w-[18px] h-[18px] rounded-[3px] border-2 flex items-center justify-center text-[12px] font-bold"
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

function WindowsInstaller() {
  return (
    <div className="w-[640px] rounded-md overflow-hidden shadow-2xl border border-black/40 bg-white">
      <div className="h-8 px-3 flex items-center justify-between bg-[#f3f3f3] border-b border-black/10 text-[13px] text-[#1f2937]">
        <span>🐍 Python 3.13.7 (64-bit) Setup</span>
        <span className="text-black/50 tracking-[0.6em]">— ✕</span>
      </div>
      <div className="flex">
        <div className="w-[120px] bg-gradient-to-b from-[#306998] to-[#ffd43b] flex items-start justify-center pt-6 text-5xl">🐍</div>
        <div className="flex-1 p-5 text-[#1f2937]">
          <div className="text-[20px] font-semibold text-[#1e3a8a]">Install Python 3.13.7 (64-bit)</div>
          <div className="text-[13px] text-black/55 mt-1">Select Install Now to install Python with default settings.</div>
          <motion.div
            className="mt-4 rounded px-3 py-2"
            initial={{ backgroundColor: 'rgba(37,99,235,0)' }}
            animate={{ backgroundColor: ['rgba(37,99,235,0)', 'rgba(37,99,235,0.12)'] }}
            transition={{ delay: 2.4, duration: 0.3 }}
          >
            <div className="text-[17px] font-semibold text-[#1d4ed8]">➜ Install Now</div>
            <div className="text-[12px] text-black/50 pl-5">Includes IDLE, pip and documentation</div>
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
          <div className="text-[13px] text-black/55 mt-1">Python 3.13.7 for macOS</div>
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
        <Chip color={BLUE}>🌐 python.org</Chip>→<Chip color={BLUE}>Downloads</Chip>→<Chip color={BLUE}>Python 3.10 or newer</Chip>
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
  return (
    <Scene>
      <Terminal os={os} lines={termLines('pythonCheck', os)} width={760} fontSize={20} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: endTime(termLines('pythonCheck', os)) }} className="mt-5 flex gap-3">
        <Chip color={GREEN}>✓ any version 3.10 or newer is fine</Chip>
        {os === 'mac' && <Chip color={GOLD}>Mac: python3, not python (for now)</Chip>}
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

function KitScene() {
  return (
    <Scene>
      <div className="flex items-center gap-8">
        <motion.div {...pop} transition={spring} className="flex flex-col items-center gap-3">
          <div className="w-[120px] h-[140px] rounded-xl border-2 border-white/20 bg-white/[0.06] flex flex-col items-center justify-center">
            <div className="text-5xl">🗜️</div>
            <div className="text-[13px] text-white/60 mt-1">.zip</div>
          </div>
          <div className="font-mono text-[14px] text-white">ai-course-code.zip</div>
          <a
            href="/code/ai-course-code.zip"
            download
            className="px-4 py-1.5 rounded-lg font-semibold text-[15px] text-navy-900 hover:brightness-110"
            style={{ backgroundColor: CYAN }}
          >
            ⬇ Download the kit
          </a>
        </motion.div>
        <div className="flex flex-col items-center">
          <Arrow delay={0.4} />
          <div className="text-[13px] text-white/50">unzip</div>
        </div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.6 }} className="rounded-xl border-2 p-4 w-[520px]" style={{ borderColor: `${CYAN}60`, backgroundColor: `${CYAN}08` }}>
          <div className="flex items-center gap-2 text-[18px] font-bold text-white mb-2 font-mono">📂 ai-course/</div>
          <div className="pl-3 border-l-2 border-white/10 space-y-0.5">
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
        <Chip>1 · type <span className="font-mono text-white">cd</span> and a space</Chip>→
        <Chip>2 · drag the ai-course folder into the window</Chip>→
        <Chip>3 · press <Key>Enter</Key></Chip>
      </div>
      <Terminal os={os} lines={termLines('openFolder', os)} width={860} fontSize={19} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: endTime(termLines('openFolder', os)) + 0.2 }} className="mt-4 text-[15px]" style={{ color: GREEN }}>
        📍 You&apos;re in the kit folder
      </motion.div>
    </Scene>
  );
}

function VenvScene({ os }: { os: OS }) {
  const lines = termLines('venv', os);
  const t = endTime(lines);
  return (
    <Scene>
      <div className="flex items-center gap-8">
        <Terminal os={os} lines={lines} width={600} fontSize={19} />
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.3 }} className="rounded-xl border border-white/12 bg-white/[0.03] p-4 w-[330px]">
          <div className="font-mono text-[16px] font-bold text-white mb-2">📂 ai-course/</div>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: t, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 mb-1" style={{ backgroundColor: `${GREEN}18`, outline: `2px solid ${GREEN}90` }}>
              <span className="text-4xl">🧰</span>
              <div>
                <div className="font-mono text-[18px] text-white font-bold">.venv/</div>
                <div className="text-[13px]" style={{ color: GREEN }}>new: your private toolbox</div>
              </div>
            </div>
          </motion.div>
          <div className="opacity-45 pl-1">
            <FileRow icon="📁" name="part1/ … part4/" />
            <FileRow icon="🐍" name="run.py" />
            <FileRow icon="📄" name="requirements.txt" />
          </div>
        </motion.div>
      </div>
    </Scene>
  );
}

function ActivateScene({ os }: { os: OS }) {
  const lines = termLines('activate', os);
  const t = endTime(lines);
  return (
    <Scene>
      <Terminal os={os} lines={lines} width={820} fontSize={20} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: t + 0.2 }} className="mt-5 flex items-center gap-3">
        <span className="px-3 py-1.5 rounded-lg font-mono text-[18px] font-bold" style={{ color: '#a5f3fc', backgroundColor: 'rgba(34,211,238,0.2)' }}>(.venv)</span>
        <span className="text-[17px] text-white">= 🧰 toolbox ON</span>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 0.6 }} className="mt-5 flex gap-3">
        <Chip color={GOLD}>🔁 New terminal? Activate again.</Chip>
        {os === 'win' && <Chip color="#94a3b8">PowerShell says scripts are disabled? Use Command Prompt.</Chip>}
      </motion.div>
    </Scene>
  );
}

function PipScene({ os }: { os: OS }) {
  const lines = termLines('pip', os);
  return (
    <Scene>
      <div className="flex items-center gap-6">
        <motion.div initial={{ opacity: 0, rotate: -4, y: 10 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={spring} className="w-[200px] rounded-md bg-[#fffdf7] text-[#1f2937] shadow-lg">
          <div className="px-3 pt-2 pb-1 border-b border-black/10 font-mono text-[13px] font-bold text-black/60">requirements.txt</div>
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
          <div className="px-3 pb-2 text-[12px] text-black/50">🛒 the shopping list</div>
        </motion.div>
        <Terminal os={os} lines={lines} width={820} fontSize={15} />
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 text-[15px] text-white/70">
        📲 <span className="font-mono text-white">pip</span> = Python&apos;s app store · it fills the toolbox that is switched on
      </motion.div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="mt-4 text-[14px] text-white/65">
        👪 Under 18? A parent or teacher creates the account and the key.
      </motion.div>
    </Scene>
  );
}

function CreditScene() {
  return (
    <Scene>
      <div className="flex items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="w-[300px] rounded-2xl border border-white/12 bg-white/[0.03] p-5 text-center opacity-80">
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.0 }} className="mt-10 w-[700px]">
        <div className="flex justify-between text-[15px] text-white/80 mb-2">
          <span>① Add a little credit <span className="text-white/50">(e.g. $5)</span></span>
          <span style={{ color: '#fca5a5' }}>② Set a budget limit</span>
        </div>
        <div className="relative h-7 rounded-full bg-white/[0.06] border border-white/12">
          <motion.div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ backgroundColor: `${GREEN}90` }} initial={{ width: '0%' }} animate={{ width: '9%' }} transition={{ delay: 1.5, duration: 0.8 }} />
          <div className="absolute top-[-6px] bottom-[-6px] border-l-[3px] border-dashed" style={{ left: '80%', borderColor: RED }} />
          <div className="absolute top-8 text-[13px]" style={{ left: '80%', transform: 'translateX(-50%)', color: '#fca5a5' }}>
            🛑 stop here
          </div>
          <div className="absolute top-8 left-0 text-[13px] text-white/55">spent so far</div>
        </div>
      </motion.div>
    </Scene>
  );
}

function CostMeter() {
  // needle angle: -90 = far left (0), +90 = far right (budget limit)
  const R = 150;
  const arc = (from: number, to: number) => {
    const p = (a: number) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `${180 + R * Math.cos(rad)} ${180 + R * Math.sin(rad)}`;
    };
    return `M ${p(from)} A ${R} ${R} 0 0 1 ${p(to)}`;
  };
  return (
    <svg viewBox="0 0 360 215" width={420} height={251} aria-hidden>
      <path d={arc(-90, 30)} stroke={GREEN} strokeWidth="22" fill="none" opacity="0.75" />
      <path d={arc(30, 62)} stroke={GOLD} strokeWidth="22" fill="none" opacity="0.75" />
      <path d={arc(62, 90)} stroke={RED} strokeWidth="22" fill="none" opacity="0.85" />
      <text x="16" y="208" fontSize="15" fill="rgba(255,255,255,0.6)">0¢</text>
      <text x="300" y="208" fontSize="14" fill="#fca5a5">limit</text>
      <motion.g initial={{ rotate: -90 }} animate={{ rotate: -68 }} transition={{ delay: 0.8, type: 'spring', stiffness: 60, damping: 10 }} style={{ originX: '180px', originY: '180px' }}>
        <line x1="180" y1="180" x2="180" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <circle cx="180" cy="180" r="11" fill="white" />
      <text x="180" y="125" textAnchor="middle" fontSize="24" fontWeight="700" fill="white">a few cents</text>
      <text x="180" y="148" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.6)">each lesson&apos;s program, a few runs</text>
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
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[14px] text-white/75 text-center max-w-[760px]">
        Example: the poem program, one run ≈ 20 tokens in + 40 out ≈ <span className="font-bold text-white">$0.00003</span>
        <div className="text-[13px] text-white/45 mt-0.5">example prices: $0.15 per 1M tokens in, $0.60 per 1M out · illustrative, check openai.com/api/pricing</div>
      </motion.div>
    </Scene>
  );
}

function EnvFileScene({ os }: { os: OS }) {
  const lines = termLines('envFile', os);
  const t = endTime(lines);
  return (
    <Scene>
      <div className="flex items-center gap-8">
        <Terminal os={os} lines={lines} width={560} fontSize={17} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: t }}>
          <SafeBox width={440}>
            <div className="w-full">
              <div className="text-[12px] text-white/45 mb-1">{os === 'mac' ? '.env — TextEdit' : '.env — Notepad'}</div>
              <div className="font-mono text-[17px] whitespace-nowrap">
                <span className="text-white">OPENAI_API_KEY=</span>
                <motion.span
                  className="inline-block align-bottom overflow-hidden whitespace-pre font-bold"
                  style={{ color: GOLD }}
                  initial={{ width: 0 }}
                  animate={{ width: '17ch' }}
                  transition={{ delay: t + 0.8, duration: 0.25 }}
                >
                  sk-proj-4fQx…9aZ
                </motion.span>
              </div>
            </div>
          </SafeBox>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 1.3 }} className="mt-5 flex items-center gap-2 text-[14px] text-white/70">
            <span className="font-mono text-white px-1.5 py-0.5 rounded bg-white/10">.gitignore</span> already says <span className="font-mono text-white">.env</span> → never uploaded
          </motion.div>
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
      className="relative w-[210px] h-[132px] rounded-md bg-[#fffdf7] text-[#1f2937] shadow-lg p-3"
    >
      <div className="text-[12px] font-bold uppercase tracking-wide text-black/45">{title}</div>
      <div className="mt-2 text-[13px]">{children}</div>
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
          <div className="text-[15px] font-semibold" style={{ color: GREEN }}>✓ In the locked box</div>
          <SafeBox width={280}>
            <KeyArt size={220} tag="sk-proj-…" />
          </SafeBox>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-[15px] font-semibold" style={{ color: '#fca5a5' }}>✗ On a postcard: anyone can read it</div>
          <div className="flex gap-6 pt-3">
            <Postcard title="📄 in your code" rot={-4} delay={0.3}>
              <div className="font-mono text-[12px] bg-black/5 rounded px-1.5 py-1">OpenAI(api_key=<br />&quot;sk-proj-4fQx…&quot;)</div>
            </Postcard>
            <Postcard title="🌍 on GitHub" rot={3} delay={0.5}>
              public project: bots search for keys all day
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
          <Bubble delay={t + 0.2}>All green!</Bubble>
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
        <Terminal os={os} lines={lines} width={820} fontSize={18} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: t }} className="flex flex-col items-center gap-2 w-[150px]">
          <Bubble delay={t + 0.2} color="#bbf7d0">🎉 It works!</Bubble>
          <AgentBot color={SOLO.color} badge={SOLO.badge} name={SOLO.name} size={100} mood="proud" active />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 0.6 }} className="mt-6 flex items-center gap-3 text-[14px] text-white/65">
        On every code lesson look for
        <span className="px-3 py-1 rounded-lg border text-[14px] font-semibold text-white" style={{ borderColor: `${GREEN}80`, backgroundColor: `${GREEN}18` }}>💻 Run it yourself</span>
      </motion.div>
    </Scene>
  );
}

function ErrorsScene({ os }: { os: OS }) {
  const cards = [
    {
      err: "ModuleNotFoundError: No module named 'openai'",
      means: "The toolbox is off, or its tools aren't installed.",
      fix: 'Activate .venv, then pip install -r requirements.txt',
    },
    {
      err: 'AuthenticationError: Error code: 401',
      means: 'OpenAI does not accept your key (typo or deleted key).',
      fix: 'Check .env: OPENAI_API_KEY=sk-… (no key at all says “api_key … must be set”)',
    },
    {
      err: "RateLimitError: 429 … 'insufficient_quota'",
      means: 'Your credit has run out. Trying again won’t help.',
      fix: 'Add credit on the billing page (and check your limit).',
    },
    os === 'mac'
      ? { err: 'zsh: command not found: python', means: "Your computer can't find Python by that name.", fix: 'Type python3, or activate .venv first (then python works).' }
      : { err: "'python' is not recognized as an internal or external command", means: "Your computer can't find Python.", fix: 'Reinstall Python with “Add python.exe to PATH” ticked, then open a new terminal.' },
  ];
  return (
    <Scene>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.err} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 + i * 0.15 }} className="w-[520px] rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="px-4 py-2.5 font-mono text-[15px] font-semibold" style={{ backgroundColor: 'rgba(248,113,113,0.12)', color: '#fca5a5' }}>
              {c.err}
            </div>
            <div className="px-4 py-2.5 space-y-1.5 text-[15px]">
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
    { icon: '🚪', title: 'Go to the folder', cmd: os === 'mac' ? 'cd Downloads/ai-course' : 'cd Downloads\\ai-course' },
    { icon: '💡', title: 'Switch on the toolbox', cmd: CMD.activate(os) },
    { icon: '▶️', title: 'Run a lesson', cmd: 'python run.py part1/basic_api.py' },
  ];
  return (
    <Scene>
      <div className="text-[14px] font-semibold uppercase tracking-wider text-white/50 mb-4">Every new terminal</div>
      <div className="flex items-stretch gap-3">
        {steps.map((s, i) => (
          <div key={s.title} className="flex items-center gap-3">
            {i > 0 && <Arrow delay={0.3 + i * 0.3} size="text-2xl" />}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 + i * 0.3 }} className="w-[320px] rounded-2xl border-2 px-4 py-4 flex flex-col items-center gap-2" style={{ borderColor: `${CYAN}55`, backgroundColor: `${CYAN}0c` }}>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-bold" style={{ color: CYAN, border: `1px solid ${CYAN}80` }}>{i + 1}</span>
                <span className="text-[17px] font-bold text-white">{s.title}</span>
              </div>
              <div className="text-4xl">{s.icon}</div>
              <div className="w-full rounded-lg bg-black/50 border border-white/10 px-2 py-1.5 font-mono text-[14px] text-white text-center whitespace-nowrap">{s.cmd}</div>
            </motion.div>
          </div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-8 text-[15px] text-white/65">
        Setup (Python, kit, pip install, key) happens only once. ✓
      </motion.div>
    </Scene>
  );
}

function TakeawaysScene() {
  const items = [
    { text: 'Python + the code kit + a toolbox (.venv with pip) let your computer run every lesson.', color: GREEN },
    { text: 'Your API key lives in .env only. Never in code, chats, screenshots or GitHub.', color: GOLD },
    { text: 'You pay per token (in and out). gpt-4o-mini is cheap, and a budget limit keeps you safe.', color: CYAN },
  ];
  return (
    <Scene>
      <h2 className="text-2xl font-bold text-white mb-5">What you learned</h2>
      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-3 w-[680px]">
          {items.map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.15 }} className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-white/[0.02]" style={{ borderColor: `${it.color}40` }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border" style={{ color: it.color, borderColor: `${it.color}60`, backgroundColor: `${it.color}15` }}>{i + 1}</span>
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
  terminal: { station: { current: 0, done: 0 }, os: true },
  python: { station: { current: 0, done: 0 }, os: true },
  pythonCheck: { station: { current: 0, done: 0, flip: true }, os: true },
  kit: { station: { current: 1, done: 1 } },
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
      scene = <KitScene />;
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

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-900/40 flex flex-col">
      {showBar && (
        <div className="shrink-0 h-12 px-5 flex items-center justify-between border-b border-white/5">
          <div key={`${trigger}-${os}`}>
            {meta.station && <StationStrip current={meta.station.current} done={meta.station.done} flipAt={meta.station.flip ? flipTime(trigger, os) : undefined} />}
          </div>
          {meta.os && <OsToggle os={os} setOs={setOs} />}
        </div>
      )}
      <div key={`${trigger}-${os}`} className="relative flex-1 min-h-0">
        {scene}
      </div>
    </div>
  );
}
