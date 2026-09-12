/**
 * src/components/tatami/InariConsiderationCard.tsx
 * P2 (Revisi 6): layar "Pertimbangan Inari" — transparansi takdir evolusi.
 * Preview DETERMINISTIK (bukan undian): cabang dewasa ditentukan oleh kualitas
 * pengasuhan (Care Score & Disiplin) — sumber nilai dari REMAJA_EVOLUTION_BRANCHES
 * / STAGE_LEVEL_GOALS di gameConfig. Termasuk konsekuensi naratif wabi-sabi:
 * tak ada kematian di HAGUMI, namun perawatan membentuk wujud.
 */
import { useState } from 'react';
import { PetData } from '../../types/game';
import {
  REMAJA_EVOLUTION_BRANCHES,
  STAGE_LEVEL_GOALS,
} from '../../data/gameConfig';

const ADULT_FORM_LABELS: Record<string, string> = {
  zenko: 'Zenko (Rubah Putih Kebajikan)',
  tenko: 'Tenko (Rubah Surgawi 9 Ekor)',
  yako: 'Yako (Rubah Liar Cerdik)',
  nogitsune: 'Nogitsune (Rubah Rimba Pegunungan)',
  wakahitsune: 'Wakahitsune (Rubah Muda)',
  kogitsune: 'Kogitsune (Anak Rubah)',
  kitsunebi: 'Kitsunebi (Api Roh)',
};

/** Bar progres mini: label — bar — "nilai / target" */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-14 flex-shrink-0 text-[10px] font-bold text-stone-300">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 flex-shrink-0 text-right text-[10px] font-mono text-amber-300">
        {Math.round(value)}/{max}
      </span>
    </div>
  );
}

export function InariConsiderationCard({ pet }: { pet: PetData }) {
  const [isOpen, setIsOpen] = useState(false);

  const isRemaja = pet.stage === 'remaja';
  const isAdult = pet.stage === 'dewasa' || pet.stage === 'mistik';
  const stageGoal = pet.stage === 'bayi' || pet.stage === 'anak' ? STAGE_LEVEL_GOALS[pet.stage] : null;

  // Prediksi cabang dewasa berdasarkan kondisi kini (urutan sama dengan
  // determineNextEvolution: Tenko → Zenko → Yako → Nogitsune)
  const predicted = REMAJA_EVOLUTION_BRANCHES.find(
    (branch) =>
      pet.careScore >= branch.minCareScore &&
      (branch.minDiscipline === undefined || pet.stats.discipline >= branch.minDiscipline)
  );

  return (
    <div
      className="mt-1 w-full max-w-sm pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // klik kartu tidak memicu riak tatami
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="inari-consideration-panel"
        aria-label="Pertimbangan Inari — bagaimana perawatanmu menentukan takdir evolusi"
        title="Lihat Pertimbangan Inari: takdir evolusi & konsekuensi pengasuhan"
        className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold shadow-md transition-all cursor-pointer ${
          isOpen
            ? 'bg-amber-800 text-amber-100 border-amber-400'
            : 'bg-[#201813]/90 hover:bg-amber-900/80 border-amber-600/70 text-amber-300'
        }`}
      >
        <span aria-hidden="true">⛩️</span>
        <span>Pertimbangan Inari</span>
        <span aria-hidden="true" className="text-[9px]">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div
          id="inari-consideration-panel"
          role="region"
          aria-label="Pertimbangan Inari"
          className="mt-1 px-3 py-2.5 rounded-xl bg-[#201813]/95 backdrop-blur-md border border-amber-600/70 shadow-xl text-left"
        >
          <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
            Inari mengamati cara pengasuh merawat{' '}
            <span className="font-bold text-amber-200">{pet.name}</span>. Takdir evolusi tidak
            diundi — ia mengikuti kasih sayangmu.
          </p>

          {/* Tahap dewasa/mistik: takdir sudah terpilih */}
          {isAdult && (
            <div className="mt-1.5 p-2 rounded-lg bg-amber-950/60 border border-amber-600/50">
              <p className="text-[11px] font-bold text-amber-200">
                Takdir telah terpilih: {ADULT_FORM_LABELS[pet.form] ?? pet.form} • {pet.tailCount} ekor
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                Saat waktunya tiba, roh dapat menempuh generasi baru — silsilah abadi tercatat di
                Album Hanko.
              </p>
            </div>
          )}

          {/* Tahap bayi/anak: tujuan level berikutnya */}
          {stageGoal && (
            <div className="mt-1.5">
              <p className="text-[11px] font-bold text-amber-200">
                Menuju: {stageGoal.name} <span className="text-stone-400">{stageGoal.japanese}</span>
              </p>
              <div className="mt-1">
                <Bar label="Level" value={pet.level} max={stageGoal.minLevel} />
              </div>
            </div>
          )}

          {/* Tahap remaja: empat cabang dewasa + prediksi kondisi kini */}
          {isRemaja && (
            <div className="mt-2">
              <p className="text-[10px] font-bold text-stone-300 leading-snug">
                Saat dewasa (Level 10, usia ≥ 5 hari — kini Lv.{pet.level}, {pet.ageDays} hari),
                cabangmu ditentukan oleh kualitas pengasuhan:
              </p>
              <div className="mt-1 space-y-1">
                {REMAJA_EVOLUTION_BRANCHES.map((branch) => {
                  const isPredicted = predicted?.form === branch.form;
                  return (
                    <div
                      key={branch.form}
                      className={`p-1.5 rounded-lg border ${
                        isPredicted
                          ? 'bg-amber-950/60 border-amber-500/70'
                          : 'bg-stone-900/60 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-amber-200">
                          {branch.name} <span className="text-stone-400">{branch.japanese}</span>
                        </span>
                        {isPredicted && (
                          <span className="text-[8px] px-1 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold flex-shrink-0">
                            KONDISI KINI
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-stone-400 mt-0.5 leading-snug">{branch.description}</p>
                      <div className="mt-1 space-y-0.5">
                        {branch.minCareScore > 0 && (
                          <Bar label="Kasih" value={pet.careScore} max={branch.minCareScore} />
                        )}
                        {branch.minDiscipline !== undefined && (
                          <Bar label="Disiplin" value={pet.stats.discipline} max={branch.minDiscipline} />
                        )}
                        {branch.minCareScore === 0 && (
                          <p className="text-[9px] text-stone-500 italic">
                            Selalu terbuka (jika pengasuhan terlala)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Konsekuensi naratif (wabi-sabi) */}
          <p className="mt-2 pt-2 border-t border-stone-800 text-[9px] sm:text-[10px] italic text-stone-400 leading-snug">
            Di santuari ini tak ada kematian — hanya wujud yang mengikuti caramu merawat. Kasih yang
            konsisten memantulkan rubah suci bercahaya; pengasuhan yang terlala memantulkan
            Nogitsune yang lusuh namun tangguh. Wabi-sabi: wujudnya adalah jejak perjalananmu
            bersamanya.
          </p>
        </div>
      )}
    </div>
  );
}
