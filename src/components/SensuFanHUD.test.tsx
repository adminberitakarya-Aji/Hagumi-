/**
 * src/components/SensuFanHUD.test.tsx
 * P3 (Revisi 6): test Kipas Sensu — aria-expanded trigger, render item saat
 * terbuka, klik item memanggil handler & menutup, dan toggle buka/tutup.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SensuFanHUD, SensuItem } from './SensuFanHUD';

vi.mock('../utils/soundEngine', () => ({
  soundEngine: new Proxy({}, { get: () => vi.fn() }),
}));
vi.mock('../utils/hapticFeedback', () => ({
  hapticEngine: new Proxy({}, { get: () => vi.fn() }),
}));

function makeItems(): SensuItem[] {
  return [
    { id: 'bento', label: 'Makan', kanji: '食', sublabel: 'Bento', icon: '🍙', color: 'x', border: 'y', onClick: vi.fn() },
    { id: 'shrine', label: 'Kuil', kanji: '社', sublabel: 'Inari', icon: '⛩️', color: 'x', border: 'y', onClick: vi.fn() },
  ];
}

function renderHud(isOpen = false) {
  const items = makeItems();
  const onToggle = vi.fn();
  const onClose = vi.fn();
  const onToggleDockMode = vi.fn();
  render(
    <SensuFanHUD
      items={items}
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      isDockMode={false}
      onToggleDockMode={onToggleDockMode}
    />
  );
  return { items, onToggle, onClose, onToggleDockMode };
}

describe('SensuFanHUD', () => {
  beforeEach(() => {
    // jsdom default width 1024 — cukup untuk jalur distance desktop
  });

  it('tertutup: trigger aria-expanded=false, menu belum dirender', () => {
    renderHud(false);
    const trigger = screen.getByRole('button', { name: 'Buka Menu Kipas Sensu' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menu', { name: 'Menu Kipas Sensu' })).toBeNull();
  });

  it('terbuka: menu dirender, item berlabel, aria-expanded=true', () => {
    renderHud(true);
    expect(screen.getByRole('menu', { name: 'Menu Kipas Sensu' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Makan — Bento' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kuil — Inari' })).toBeTruthy();
    const trigger = screen.getByRole('button', { name: 'Tutup Kipas Sensu' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('klik item memanggil handler item lalu menutup kipas', () => {
    const { items, onClose } = renderHud(true);
    fireEvent.click(screen.getByRole('button', { name: 'Makan — Bento' }));
    expect(items[0].onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('klik trigger saat terbuka menutup (onClose), saat tertutup membuka (onToggle)', () => {
    const closed = renderHud(false);
    fireEvent.click(screen.getByRole('button', { name: 'Buka Menu Kipas Sensu' }));
    expect(closed.onToggle).toHaveBeenCalledTimes(1);

    const open = renderHud(true);
    fireEvent.click(screen.getByRole('button', { name: 'Tutup Kipas Sensu' }));
    expect(open.onClose).toHaveBeenCalledTimes(1);
  });

  it('tombol Dock Mode memanggil onToggleDockMode', () => {
    const { onToggleDockMode } = renderHud(false);
    fireEvent.click(screen.getByRole('button', { name: 'Beralih ke Bilah Dock Klasik' }));
    expect(onToggleDockMode).toHaveBeenCalledTimes(1);
  });
});
