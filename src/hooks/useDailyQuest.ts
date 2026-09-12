/**
 * src/hooks/useDailyQuest.ts
 * P4 (Revisi 6): quest harian & streak — `markQuestDone` dipanggil dari wrapper
 * aksi di TatamiRoom (makan & mini-game). Reward auto-claim (cozy, tanpa
 * friction): quest 1 +10 Ryo/+5 EXP, quest 2 +15 Ryo/+10 EXP; bonus +50 Ryo
 * tiap streak kelipatan 7. Logika murni di src/utils/dailyQuest.ts; state
 * tersimpan di save (schema v4, field opsional `dailyQuest`).
 */
import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { PetData } from '../types/game';
import { addPetExp } from '../data/gameConfig';
import {
  applyStreakOnCompletion,
  DAILY_FEED_REWARD,
  DAILY_GAME_REWARD,
  rollDailyState,
  STREAK_BONUS_COINS,
  toLocalDateKey,
} from '../utils/dailyQuest';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

export type DailyQuestStep = 'feed' | 'game';

interface UseDailyQuestOptions {
  pet: PetData;
  setPet: Dispatch<SetStateAction<PetData>>;
  showToast: (msg: string) => void;
}

export function useDailyQuest({ pet, setPet, showToast }: UseDailyQuestOptions) {
  // View state: roll ke hari berjalan untuk tampilan (persist terjadi saat
  // aksi berikutnya atau save berikutnya — tidak perlu effect tambahan).
  const view = useMemo(
    () => rollDailyState(pet.dailyQuest, toLocalDateKey(Date.now())),
    [pet.dailyQuest]
  );

  const markQuestDone = (step: DailyQuestStep) => {
    const today = toLocalDateKey(Date.now());
    const rolled = rollDailyState(pet.dailyQuest, today);
    const key = step === 'feed' ? 'feedDone' : 'gameDone';
    if (rolled[key]) return; // sudah dituntaskan hari ini — tidak dihitung ganda

    const streak = applyStreakOnCompletion(rolled, today);
    const reward = step === 'feed' ? DAILY_FEED_REWARD : DAILY_GAME_REWARD;

    // Toast & sfx DI LUAR updater (StrictMode dev bisa memanggil updater 2x).
    if (step === 'feed') {
      showToast(`📜 Misi Harian: ${pet.name} sudah diberi makan! (+${reward.coins} Ryo & +${reward.exp} EXP)`);
    } else {
      showToast(`📜 Misi Harian: festival diramaikan! (+${reward.coins} Ryo & +${reward.exp} EXP)`);
    }
    if (streak.bonusClaimed) {
      showToast(`🔥 Streak ${streak.streakCount} hari berturut-turut! Inari memberkati +${STREAK_BONUS_COINS} Ryo.`);
    }
    soundEngine.playCoin();
    hapticEngine.softTap();

    setPet((prev) => {
      const prevRolled = rollDailyState(prev.dailyQuest, today);
      if (prevRolled[key]) return prev; // guard ganda (aksi lain menyelesaikan lebih dulu)
      const streakNow = applyStreakOnCompletion(prevRolled, today);
      const expRes = addPetExp(prev.exp, prev.level, reward.exp);
      const bonusCoins = streakNow.bonusClaimed ? STREAK_BONUS_COINS : 0;
      return {
        ...prev,
        coins: prev.coins + reward.coins + bonusCoins,
        exp: expRes.newExp,
        level: expRes.newLevel,
        dailyQuest: {
          ...prevRolled,
          [key]: true,
          streakCount: streakNow.streakCount,
          lastStreakDate: streakNow.lastStreakDate,
          lastBonusStreak: streakNow.bonusClaimed ? streakNow.streakCount : prevRolled.lastBonusStreak,
        },
      };
    });
  };

  return {
    view,
    markQuestDone,
    isFeedDone: view.feedDone,
    isGameDone: view.gameDone,
    allDone: view.feedDone && view.gameDone,
  };
}
