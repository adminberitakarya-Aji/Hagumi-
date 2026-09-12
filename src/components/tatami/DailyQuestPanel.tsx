/**
 * src/components/tatami/DailyQuestPanel.tsx
 * P4 (Revisi 6): panel ringkas "Misi Harian" + streak 🔥 — tampil untuk semua
 * tahap pet, reward auto-claim (tanpa tombol klaim), reset per tanggal lokal.
 * Komponen murni presentasional; logika di useDailyQuest/dailyQuest.ts.
 */
interface DailyQuestPanelProps {
  streakCount: number;
  feedDone: boolean;
  gameDone: boolean;
}

function QuestChip({ label, icon, done }: { label: string; icon: string; done: boolean }) {
  return (
    <span
      aria-label={`Misi harian ${label}: ${done ? 'selesai' : 'belum dilakukan hari ini'}`}
      title={`Misi harian ${label}: ${done ? 'selesai' : 'belum dilakukan hari ini'}`}
      className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold whitespace-nowrap ${
        done
          ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
          : 'bg-stone-900/70 border-stone-700 text-stone-300'
      }`}
    >
      <span aria-hidden="true">{done ? '✅' : icon}</span> {label}
    </span>
  );
}

export function DailyQuestPanel({ streakCount, feedDone, gameDone }: DailyQuestPanelProps) {
  const allDone = feedDone && gameDone;
  return (
    <div
      className="mt-1 w-full max-w-sm pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // klik panel tidak memicu riak tatami
    >
      <div
        role="status"
        aria-label={`Misi Harian — streak ${streakCount} hari${allDone ? ', semua quest hari ini tuntas' : ''}`}
        className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl bg-[#201813]/90 backdrop-blur-md border border-amber-600/50 shadow-md"
      >
        <span
          className="text-[10px] font-bold text-amber-300 flex items-center gap-1 flex-shrink-0"
          title={`Streak: ${streakCount} hari berturut-turut menuntaskan minimal 1 misi. Bonus +50 Ryo tiap kelipatan 7!`}
        >
          <span aria-hidden="true">📜</span> Harian
          {streakCount > 0 && (
            <span className="text-orange-300" aria-label={`Streak ${streakCount} hari`}>
              🔥{streakCount}
            </span>
          )}
        </span>
        {allDone ? (
          <span className="text-[9px] font-bold text-emerald-300 whitespace-nowrap">
            Tuntas — kembali besok! 🌙
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <QuestChip label="Makan" icon="🍙" done={feedDone} />
            <QuestChip label="Mini-game" icon="🎏" done={gameDone} />
          </div>
        )}
      </div>
    </div>
  );
}
