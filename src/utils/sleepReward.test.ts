/**
 * Unit test reward bangun tidur (src/utils/sleepReward.ts):
 * bonus penyelesaian all-or-nothing, keputusan dihitung dari waktu nyata
 * (bukan bar visual), dan ketahanan terhadap kondisi sesi tidak valid.
 */

import { describe, it, expect } from 'vitest';
import {
  SLEEP_COMPLETION_ENERGY,
  SLEEP_COMPLETION_EXP,
  resolveSleepWakeReward,
} from './sleepReward';

const NOW = 1_700_000_000_000;
const SESSION_END = NOW + 15 * 60 * 1000; // sesi aktif 15 menit ke depan

describe('resolveSleepWakeReward — bangun awal (sesi masih aktif)', () => {
  it('bangun 1 detik setelah tidur → tanpa bonus (0 energi, 0 EXP)', () => {
    const r = resolveSleepWakeReward(NOW + 1_000, SESSION_END, 30);
    expect(r).toEqual({ completed: false, energyGain: 0, expGain: 0 });
  });

  it('bangun 14 menit 59 detik (1 detik sebelum habis) → tetap tanpa bonus', () => {
    const r = resolveSleepWakeReward(SESSION_END - 1_000, SESSION_END, 30);
    expect(r.completed).toBe(false);
    expect(r.energyGain).toBe(0);
    expect(r.expGain).toBe(0);
  });

  it('eksploit siklus cepat: berulang pun hasil selalu 0/0 (mati secara matematis)', () => {
    for (let i = 0; i < 10; i++) {
      const r = resolveSleepWakeReward(NOW + 5_000 * i, SESSION_END, 30 + i);
      expect(r.expGain).toBe(0);
      expect(r.energyGain).toBe(0);
    }
  });
});

describe('resolveSleepWakeReward — selesai tidur penuh → bonus penuh', () => {
  it('tepat pada batas sesi (now = sleepUntilTimestamp) → bonus penuh', () => {
    const r = resolveSleepWakeReward(SESSION_END, SESSION_END, 30);
    expect(r).toEqual({ completed: true, energyGain: SLEEP_COMPLETION_ENERGY, expGain: SLEEP_COMPLETION_EXP });
  });

  it('setelah sesi berlalu (offline / decay menyelesaikan) → bonus penuh', () => {
    const r = resolveSleepWakeReward(SESSION_END + 60_000, SESSION_END, 30);
    expect(r).toEqual({ completed: true, energyGain: SLEEP_COMPLETION_ENERGY, expGain: SLEEP_COMPLETION_EXP });
  });

  it('energi bonus di-clamp ke 100 (energi 90 → hanya +10)', () => {
    const r = resolveSleepWakeReward(SESSION_END, SESSION_END, 90);
    expect(r.completed).toBe(true);
    expect(r.energyGain).toBe(10);
    expect(r.expGain).toBe(SLEEP_COMPLETION_EXP);
  });

  it('energi sudah 100 → bonus energi 0, EXP bonus tetap diberikan', () => {
    const r = resolveSleepWakeReward(SESSION_END, SESSION_END, 100);
    expect(r.energyGain).toBe(0);
    expect(r.expGain).toBe(SLEEP_COMPLETION_EXP);
  });

  it('energi di luar rentang (150 / negatif) di-clamp dulu → bonus aman', () => {
    expect(resolveSleepWakeReward(SESSION_END, SESSION_END, 150).energyGain).toBe(0);
    expect(resolveSleepWakeReward(SESSION_END, SESSION_END, -20).energyGain).toBe(SLEEP_COMPLETION_ENERGY);
  });
});

describe('resolveSleepWakeReward — kondisi sesi tidak valid', () => {
  it('sleepUntilTimestamp undefined → diperlakukan selesai (tidak mengunci pemain)', () => {
    const r = resolveSleepWakeReward(NOW, undefined, 30);
    expect(r).toEqual({ completed: true, energyGain: SLEEP_COMPLETION_ENERGY, expGain: SLEEP_COMPLETION_EXP });
  });

  it('sleepUntilTimestamp 0 / negatif → diperlakukan selesai', () => {
    expect(resolveSleepWakeReward(NOW, 0, 30).completed).toBe(true);
    expect(resolveSleepWakeReward(NOW, -5, 30).completed).toBe(true);
  });

  it('sleepUntilTimestamp sudah lewat jauh (sisa 0) → bonus penuh', () => {
    const r = resolveSleepWakeReward(NOW, NOW - 24 * 60 * 60 * 1000, 30);
    expect(r.completed).toBe(true);
    expect(r.expGain).toBe(SLEEP_COMPLETION_EXP);
  });
});
