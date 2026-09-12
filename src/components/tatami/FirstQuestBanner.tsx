/**
 * src/components/tatami/FirstQuestBanner.tsx
 * P2 (Revisi 6): "Misi Pertama Pengasuh" — panduan 3 langkah garis lurus untuk
 * pemain baru pasca-penetasan (🍙 makan → 🛁 mandi → 🎏 mini-game). Progres &
 * aturan tampil dikelola useFirstQuest; komponen ini murni presentasional.
 * Bersifat memandu (non-blocking): modal lain tetap bisa dibuka kapan saja.
 */
import { PetData } from '../../types/game';
import { FIRST_QUEST_STEPS, FirstQuestStepId } from '../../hooks/useFirstQuest';

interface FirstQuestBannerProps {
  pet: PetData;
  activeStep: FirstQuestStepId;
  progress: Record<FirstQuestStepId, boolean>;
  onStepClick: (step: FirstQuestStepId) => void;
}

export function FirstQuestBanner({ pet, activeStep, progress, onStepClick }: FirstQuestBannerProps) {
  return (
    <div
      className="relative z-20 w-full max-w-md mx-auto px-2 mb-1 animate-in fade-in slide-in-from-top-1"
      onClick={(e) => e.stopPropagation()} // klik banner tidak memicu riak tatami
      role="region"
      aria-label="Misi Pertama Pengasuh — panduan tiga langkah"
    >
      <div className="px-2.5 py-1.5 rounded-xl bg-[#201813]/95 backdrop-blur-md border border-amber-500/80 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wide">
            ⛩️ Misi Pertama Pengasuh
          </span>
          <span className="text-[9px] text-stone-400 hidden sm:inline">ikuti urutannya, ya</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {FIRST_QUEST_STEPS.map((step) => {
            const done = progress[step.id];
            const isActive = step.id === activeStep;
            const stateLabel = done
              ? ' (selesai)'
              : isActive
              ? ' (langkah berikutnya — ketuk untuk mulai)'
              : ' (terkunci — selesaikan langkah sebelumnya)';
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isActive) onStepClick(step.id);
                }}
                disabled={!isActive}
                aria-label={`${step.label} untuk ${pet.name}${stateLabel}`}
                title={`${step.label}${stateLabel}`}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border transition-all min-h-[40px] ${
                  done
                    ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300 cursor-default'
                    : isActive
                    ? 'bg-amber-950/90 border-amber-500 text-amber-200 ring-2 ring-amber-400/60 cursor-pointer animate-pulse hover:brightness-110'
                    : 'bg-stone-900/70 border-stone-700/60 text-stone-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="text-base sm:text-lg leading-none" aria-hidden="true">
                  {done ? '✅' : step.icon}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 leading-tight text-center">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
