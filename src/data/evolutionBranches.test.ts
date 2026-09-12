/**
 * src/data/evolutionBranches.test.ts
 * P3 (Revisi 6): guard sinkronisasi — REMAJA_EVOLUTION_BRANCHES & STAGE_LEVEL_GOALS
 * (dipakai layar "Pertimbangan Inari") WAJIB cerminan determineNextEvolution().
 * Mencegah preview deterministik menyesatkan pemain saat threshold diubah
 * hanya di satu sisi.
 */
import { describe, it, expect } from 'vitest';
import {
  determineNextEvolution,
  REMAJA_EVOLUTION_BRANCHES,
  STAGE_LEVEL_GOALS,
} from './gameConfig';

/** Replikasi logika prediksi layar Pertimbangan Inari (urutan katalog). */
function predictedForm(careScore: number, discipline: number): string {
  const branch = REMAJA_EVOLUTION_BRANCHES.find(
    (b) => careScore >= b.minCareScore && (b.minDiscipline === undefined || discipline >= b.minDiscipline)
  );
  return branch!.form;
}

const CASES: Array<[number, number]> = [
  [90, 0], // Tenko
  [85, 100], // Tenko (batas bawah care)
  [85, 0], // Tenko (care cukup, disiplin rendah — tidak dipersyaratkan)
  [84, 70], // Zenko (care 1 di bawah Tenko)
  [70, 70], // Zenko (batas bawah ganda)
  [75, 30], // Yako (care cukup, disiplin gagal)
  [50, 0], // Yako (batas bawah care)
  [49, 100], // Nogitsune (care 1 di bawah Yako)
  [0, 0], // Nogitsune
];

describe('Sinkronisasi katalog evolusi vs determineNextEvolution', () => {
  it.each(CASES)('care=%i, disiplin=%i — prediksi layar = hasil evolusi aktual', (care, disc) => {
    const target = determineNextEvolution('remaja', 10, 5, care, disc);
    expect(target).not.toBeNull();
    expect(target!.form).toBe(predictedForm(care, disc));
  });

  it('urutan & threshold katalog cabang tidak bergeser diam-diam', () => {
    expect(REMAJA_EVOLUTION_BRANCHES.map((b) => b.form)).toEqual(['tenko', 'zenko', 'yako', 'nogitsune']);
    expect(REMAJA_EVOLUTION_BRANCHES.map((b) => b.minCareScore)).toEqual([85, 70, 50, 0]);
    expect(REMAJA_EVOLUTION_BRANCHES[1].minDiscipline).toBe(70);
  });
});

describe('STAGE_LEVEL_GOALS cerminan threshold stage', () => {
  it('bayi → Kogitsune tepat di Level 3', () => {
    expect(determineNextEvolution('bayi', 2, 1, 0, 0)).toBeNull();
    const target = determineNextEvolution('bayi', 3, 1, 0, 0);
    expect(target!.name).toBe(STAGE_LEVEL_GOALS.bayi.name);
  });

  it('anak → Wakahitsune tepat di Level 6', () => {
    expect(determineNextEvolution('anak', 5, 2, 0, 0)).toBeNull();
    const target = determineNextEvolution('anak', 6, 3, 0, 0);
    expect(target!.name).toBe(STAGE_LEVEL_GOALS.anak.name);
  });
});
