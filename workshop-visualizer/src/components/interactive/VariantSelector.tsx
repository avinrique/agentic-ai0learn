'use client';
import { useTracerStore } from '@/stores/tracerStore';

export default function VariantSelector() {
  const { variants, activeVariantId, setActiveVariant } = useTracerStore();

  if (!variants || variants.length <= 1) return null;

  return (
    <div className="px-4 py-3 bg-navy-800/50 border-t border-white/10">
      <div className="text-xs text-white/30 uppercase tracking-wider mb-2">
        Try different inputs:
      </div>
      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVariant(v.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeVariantId === v.id
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            &quot;{v.label}&quot;
          </button>
        ))}
      </div>
    </div>
  );
}
