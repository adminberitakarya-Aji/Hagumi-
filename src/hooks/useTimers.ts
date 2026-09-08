/**
 * src/hooks/useTimers.ts
 * Domain countdown: satu hook useCountdown generik yang dipakai untuk
 * countdown tidur 15 menit maupun countdown perjalanan Odekake.
 */
import { useEffect, useState } from 'react';

/** Format countdown m:ss (mis. "14:05"). */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Countdown per detik menuju `target` timestamp (ms sejak epoch).
 * - `target` null → countdown berhenti di 0.
 * - Re-init otomatis saat target berubah (mis. tidur dimulai/dibatalkan).
 */
export function useCountdown(target: number | null): number {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (target) {
      return Math.max(0, Math.ceil((target - Date.now()) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    if (!target) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return remainingSeconds;
}