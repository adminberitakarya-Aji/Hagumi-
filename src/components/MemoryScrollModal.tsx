import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Scroll,
  Sparkles,
  Calendar,
  Lock,
  Plus,
  Trash2,
  Share2,
  Heart,
} from 'lucide-react';
import { MemoryScrollEntry, CustomDiaryNote, PetData } from '../types/game';
import { MEMORY_SCROLL_ENTRIES } from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';

interface MemoryScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onAddDiaryNote: (text: string, emoji: string) => void;
  onDeleteDiaryNote: (noteId: string) => void;
}

export const MemoryScrollModal: React.FC<MemoryScrollModalProps> = ({
  isOpen,
  onClose,
  pet,
  onAddDiaryNote,
  onDeleteDiaryNote,
}) => {
  const [activeTab, setActiveTab] = useState<'ukiyo' | 'diary'>('ukiyo');
  const [selectedMemory, setSelectedMemory] = useState<MemoryScrollEntry | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');

  if (!isOpen) return null;

  const unlockedIds = pet.unlockedMemories || ['mem_birth', 'mem_fuji_view'];

  // Check conditions to auto-detect unlocked milestones
  const allMemories = MEMORY_SCROLL_ENTRIES.map((mem) => {
    let isUnlocked = unlockedIds.includes(mem.id);
    if (mem.id === 'mem_birth') isUnlocked = true;
    if (mem.id === 'mem_fuji_view') isUnlocked = true;
    if (mem.id === 'mem_tea_zen' && (pet.sanctuaryDecor?.accent === 'chabudai' || pet.level >= 2)) isUnlocked = true;
    if (mem.id === 'mem_bath' && (pet.stats.cleanliness >= 80 || pet.level >= 2)) isUnlocked = true;
    if (mem.id === 'mem_first_evolution' && pet.tailCount >= 2) isUnlocked = true;
    if (mem.id === 'mem_shrine_prayer' && pet.careScore >= 20) isUnlocked = true;
    if (mem.id === 'mem_matsuri_master' && pet.totalMiniGamesWon >= 5) isUnlocked = true;
    if (mem.id === 'mem_hanabi' && (pet.hanabiLaunches && pet.hanabiLaunches > 0)) isUnlocked = true;
    if (mem.id === 'mem_nine_tails' && pet.tailCount >= 9) isUnlocked = true;

    return {
      ...mem,
      unlocked: isUnlocked,
    };
  });

  const unlockedCount = allMemories.filter((m) => m.unlocked).length;

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    soundEngine.playChime();
    onAddDiaryNote(noteInput.trim(), selectedEmoji);
    setNoteInput('');
  };

  // Render SVG illustration for Ukiyo-e style woodblock artwork
  const renderUkiyoArt = (artId: string) => {
    switch (artId) {
      case 'birth':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#2d1c10" />
            <circle cx="100" cy="50" r="32" fill="#fef08a" opacity="0.25" />
            <ellipse cx="100" cy="85" rx="24" ry="32" fill="#faf5ef" stroke="#d97706" strokeWidth="2.5" />
            {/* Crack lines */}
            <path d="M96,65 L102,75 L95,85 L104,95" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            {/* Sacred Shimenawa Rope around Egg */}
            <path d="M78,85 Q100,96 122,85" stroke="#dc2626" strokeWidth="2.5" fill="none" />
            <polygon points="90,88 88,96 93,92" fill="#fff" />
            <polygon points="108,88 106,96 111,92" fill="#fff" />
            {/* Soft baby fox ears popping out */}
            <polygon points="85,62 92,50 97,64" fill="#ea580c" />
            <polygon points="115,62 108,50 103,64" fill="#ea580c" />
            {/* Moonlight sparkles */}
            <circle cx="65" cy="40" r="1.5" fill="#fde047" />
            <circle cx="135" cy="35" r="2" fill="#fde047" />
          </svg>
        );

      case 'fuji_view':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#1e293b" />
            <circle cx="140" cy="40" r="22" fill="#f59e0b" opacity="0.8" />
            {/* Mount Fuji */}
            <path d="M30,140 Q80,125 95,55 Q100,45 105,55 Q120,125 170,140 Z" fill="#334155" />
            {/* Snow Cap */}
            <path d="M88,70 Q95,55 100,45 Q105,55 112,70 L108,78 L103,72 L97,80 Z" fill="#ffffff" />
            {/* Torii Gate */}
            <g transform="translate(60, 100) scale(0.4)" fill="#dc2626">
              <rect x="0" y="0" width="50" height="6" />
              <rect x="5" y="6" width="6" height="35" />
              <rect x="39" y="6" width="6" height="35" />
            </g>
            {/* Sakura Branch */}
            <path d="M0,0 Q60,20 80,50" stroke="#78350f" strokeWidth="3" fill="none" />
            <circle cx="70" cy="40" r="4" fill="#fda4af" />
            <circle cx="50" cy="25" r="3.5" fill="#fda4af" />
          </svg>
        );

      case 'tea_zen':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#292524" />
            {/* Tatami base */}
            <rect y="100" width="200" height="40" fill="#1c1917" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#78716c" strokeWidth="2" />
            {/* Low Wooden Table */}
            <rect x="40" y="90" width="120" height="12" rx="2" fill="#78350f" />
            <rect x="50" y="102" width="8" height="18" fill="#451a03" />
            <rect x="142" y="102" width="8" height="18" fill="#451a03" />
            {/* Matcha Bowl */}
            <ellipse cx="80" cy="85" rx="14" ry="10" fill="#15803d" />
            <ellipse cx="80" cy="83" rx="11" ry="6" fill="#22c55e" />
            {/* Steam lines */}
            <path d="M78,74 Q82,66 77,58" stroke="#a7f3d0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Wagashi sweets */}
            <ellipse cx="120" cy="86" rx="8" ry="5" fill="#f472b6" />
            <ellipse cx="132" cy="88" rx="6" ry="4" fill="#fed7aa" />
          </svg>
        );

      case 'bath':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#1c1917" />
            {/* Hinoki Wooden Tub */}
            <ellipse cx="100" cy="95" rx="55" ry="32" fill="#78350f" />
            <ellipse cx="100" cy="90" rx="50" ry="26" fill="#0284c7" opacity="0.85" />
            <ellipse cx="100" cy="88" rx="44" ry="20" fill="#38bdf8" opacity="0.6" />
            {/* Fox swimming happy head */}
            <circle cx="100" cy="74" r="14" fill="#ea580c" />
            <polygon points="90,66 94,54 99,65" fill="#ea580c" />
            <polygon points="110,66 106,54 101,65" fill="#ea580c" />
            {/* Bubbles and towel on head */}
            <rect x="94" y="60" width="12" height="5" rx="2" fill="#f8fafc" />
            <circle cx="82" cy="85" r="4" fill="#e0f2fe" opacity="0.8" />
            <circle cx="118" cy="82" r="5" fill="#e0f2fe" opacity="0.8" />
          </svg>
        );

      case 'first_evolution':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#1e1b4b" />
            {/* Spiritual burst circle */}
            <circle cx="100" cy="70" r="45" fill="#818cf8" opacity="0.25" />
            <circle cx="100" cy="70" r="30" fill="#c084fc" opacity="0.35" />
            {/* Kitsune silhouette */}
            <path d="M85,90 Q95,60 100,50 Q105,60 115,90 Z" fill="#ffffff" />
            <polygon points="92,50 96,38 100,48" fill="#ffffff" />
            <polygon points="108,50 104,38 100,48" fill="#ffffff" />
            {/* Two flowing glowing tails */}
            <path d="M90,88 Q65,80 60,60 Q70,75 88,85" fill="#f59e0b" />
            <path d="M110,88 Q135,80 140,60 Q130,75 112,85" fill="#f59e0b" />
            {/* Kitsunebi Fireballs */}
            <circle cx="55" cy="50" r="5" fill="#38bdf8" />
            <circle cx="145" cy="50" r="5" fill="#38bdf8" />
          </svg>
        );

      case 'shrine_prayer':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#450a0a" />
            {/* Inari Shrine Altar */}
            <rect x="60" y="50" width="80" height="60" rx="3" fill="#7f1d1d" />
            <rect x="50" y="44" width="100" height="8" rx="2" fill="#991b1b" />
            {/* Golden Suzu Bell and braided red/white rope */}
            <path d="M100,0 L100,45" stroke="#ef4444" strokeWidth="6" strokeDasharray="3,3" />
            <circle cx="100" cy="46" r="10" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
            {/* Omikuji Golden Box */}
            <rect x="85" y="80" width="30" height="40" fill="#d97706" />
            <text x="100" y="105" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">大吉</text>
          </svg>
        );

      case 'matsuri_master':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#18181b" />
            {/* Taiko Drum */}
            <ellipse cx="100" cy="70" rx="38" ry="48" fill="#7f1d1d" />
            <ellipse cx="94" cy="70" rx="30" ry="44" fill="#fafaf9" stroke="#78716c" strokeWidth="2" />
            {/* Drum studs */}
            <circle cx="68" cy="45" r="2.5" fill="#eab308" />
            <circle cx="66" cy="70" r="2.5" fill="#eab308" />
            <circle cx="68" cy="95" r="2.5" fill="#eab308" />
            {/* Crossed Bachi drumsticks */}
            <line x1="80" y1="35" x2="135" y2="105" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
            <line x1="135" y1="35" x2="80" y2="105" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
            {/* Festival lanterns */}
            <rect x="20" y="20" width="18" height="26" rx="6" fill="#dc2626" />
            <rect x="162" y="20" width="18" height="26" rx="6" fill="#dc2626" />
          </svg>
        );

      case 'hanabi':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#030712" />
            {/* Silhouetted Mount Fuji */}
            <path d="M40,140 Q85,130 95,85 Q100,80 105,85 Q115,130 160,140 Z" fill="#111827" />
            {/* Burst fireworks rays */}
            <g transform="translate(100, 48)">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x2 = Math.cos(rad) * 36;
                const y2 = Math.sin(rad) * 36;
                const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#c084fc'];
                return (
                  <line
                    key={`ray-${i}`}
                    x1="0"
                    y1="0"
                    x2={x2}
                    y2={y2}
                    stroke={colors[i % colors.length]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4,2"
                  />
                );
              })}
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
          </svg>
        );

      case 'nine_tails':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 140" fill="none">
            <rect width="200" height="140" fill="#171010" />
            {/* Golden radiance halo */}
            <circle cx="100" cy="70" r="50" fill="#f59e0b" opacity="0.3" />
            {/* 9 radiating tails fan */}
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = -70 + i * 17.5;
              const rad = (angle * Math.PI) / 180;
              const x2 = 100 + Math.sin(rad) * 60;
              const y2 = 80 - Math.cos(rad) * 45;
              return (
                <path
                  key={`tail-fan-${i}`}
                  d={`M100,90 Q${(100 + x2) / 2 + (i % 2 === 0 ? 10 : -10)},${(90 + y2) / 2} ${x2},${y2}`}
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
            {/* White kitsune avatar */}
            <path d="M90,95 Q98,65 100,55 Q102,65 110,95 Z" fill="#fffbeb" />
            <polygon points="94,55 97,42 101,53" fill="#fffbeb" />
            <polygon points="106,55 103,42 99,53" fill="#fffbeb" />
            <circle cx="100" cy="40" r="6" fill="#ef4444" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-500">
            <Scroll className="w-8 h-8" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-[#1c1815] border-2 border-amber-800/80 rounded-2xl shadow-2xl text-stone-200 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-b border-amber-700/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-amber-200 tracking-wide flex items-center gap-1.5">
                Buku Harian Roh (絵巻物日誌)
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80">
                Koleksi Lukisan Ukiyo-e Momen Suci & Catatan Kenangan
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('ukiyo');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-t border-x ${
              activeTab === 'ukiyo'
                ? 'bg-[#261f1a] text-amber-300 border-amber-700/60 border-b-0'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Album Ukiyo-e ({unlockedCount}/{allMemories.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('diary');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-t border-x ${
              activeTab === 'diary'
                ? 'bg-[#261f1a] text-amber-300 border-amber-700/60 border-b-0'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catatan Pengasuh ({pet.customDiaryNotes?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: ALBUM UKIYO-E */}
        {activeTab === 'ukiyo' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {allMemories.map((mem) => {
                const isSelected = selectedMemory?.id === mem.id;
                return (
                  <div
                    key={mem.id}
                    onClick={() => {
                      if (mem.unlocked) {
                        soundEngine.playChime();
                        setSelectedMemory(mem);
                      } else {
                        soundEngine.playMiss();
                      }
                    }}
                    className={`relative rounded-xl border flex flex-col overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                        : mem.unlocked
                        ? 'border-amber-900/60 hover:border-amber-600 bg-stone-900/80 hover:bg-stone-900'
                        : 'border-stone-800/80 bg-stone-950/80 opacity-60'
                    }`}
                  >
                    {/* Art Box */}
                    <div className="relative w-full h-24 sm:h-28 overflow-hidden bg-stone-950 flex items-center justify-center">
                      {mem.unlocked ? (
                        renderUkiyoArt(mem.ukiyoArt)
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-stone-600">
                          <Lock className="w-6 h-6 text-stone-600" />
                          <span className="text-[10px] font-bold">Terkunci</span>
                        </div>
                      )}

                      {/* Hanko Seal Mark */}
                      {mem.unlocked && (
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded bg-red-700/90 border border-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow">
                          {pet.hankoSignature || '福'}
                        </div>
                      )}
                    </div>

                    {/* Meta Bar */}
                    <div className="p-2 flex flex-col justify-between flex-1 bg-gradient-to-b from-stone-900/90 to-stone-950">
                      <div>
                        <div className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                          {mem.japaneseTitle}
                        </div>
                        <div className="text-xs font-bold text-stone-200 line-clamp-1">
                          {mem.title}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                        <span>{mem.category === 'milestone' ? '⭐ Milestone' : mem.category === 'spiritual' ? '⛩️ Kuil' : '🍵 Harian'}</span>
                        {mem.unlocked ? (
                          <span className="text-emerald-400 font-semibold">Tercatat</span>
                        ) : (
                          <span className="text-stone-500">Kunci</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED MEMORY DETAIL PARCHMENT VIEW */}
            {selectedMemory && (
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-[#2a1d13] to-[#1f160e] border border-amber-700/80 shadow-inner flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-28 h-24 rounded-lg overflow-hidden border border-amber-600/70 shadow-md shrink-0">
                  {renderUkiyoArt(selectedMemory.ukiyoArt)}
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-amber-200">
                      {selectedMemory.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 text-[10px] border border-amber-600/40">
                      {selectedMemory.japaneseTitle}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {selectedMemory.description}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Berkah Roh: {selectedMemory.blessingText || 'Harmoni Batin'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATATAN HARIAN PENGASUH */}
        {activeTab === 'diary' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 flex flex-col">
            {/* Input New Note Box */}
            <form onSubmit={handleCreateNote} className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Tulis Catatan Harian Baru
                </span>
                <div className="flex gap-1">
                  {['🦊', '🌸', '🍵', '🌙', '🍡', '⛩️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-transform ${
                        selectedEmoji === emoji ? 'bg-amber-700/80 scale-110 shadow' : 'bg-stone-800 hover:bg-stone-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Misal: Kitsune hari ini sangat manja setelah makan bento salmon..."
                  maxLength={120}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!noteInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-40 text-white font-bold text-xs shadow cursor-pointer transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>

            {/* List of Custom Diary Notes */}
            <div className="flex-1 space-y-2">
              {pet.customDiaryNotes && pet.customDiaryNotes.length > 0 ? (
                pet.customDiaryNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-stone-900 to-stone-900/60 border border-stone-800 flex items-start justify-between gap-2 group hover:border-stone-700 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl p-1 rounded-lg bg-stone-800/80 shrink-0">
                        {note.moodEmoji || '🦊'}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs text-stone-200 font-medium leading-relaxed">
                          {note.text}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          <span>{note.date}</span>
                          <span className="text-amber-500 font-bold">• Pengasuh {pet.name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onDeleteDiaryNote(note.id);
                      }}
                      title="Hapus Catatan"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-500 hover:text-red-400 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-stone-500 text-xs flex flex-col items-center gap-1.5">
                  <Scroll className="w-8 h-8 text-stone-600" />
                  <p>Belum ada catatan harian pribadi.</p>
                  <p className="text-[11px] text-stone-600">
                    Tulis kenangan pertamamu merawat {pet.name} di atas!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Kitsune Bond Level: {pet.level} • {pet.tailCount} Ekor Roh</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
