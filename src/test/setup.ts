/**
 * src/test/setup.ts
 * Setup global Vitest + jsdom (Revisi 6, prioritas P3):
 * - RTL cleanup antar test (tanpa globals: pembersihan manual di afterEach)
 * - reset mock & localStorage (progres Misi Pertama dsb. tidak bocor antar test)
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  // Guard: test tertentu sengaja me-stub/menghapus localStorage (mis.
  // petAffectionCooldown menguji jalur "localStorage tak tersedia").
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});
