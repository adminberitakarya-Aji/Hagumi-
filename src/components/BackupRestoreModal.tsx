import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { PetData } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';
import { parseAndMigratePetSave } from '../utils/petSaveSchema';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData | null;
  onRestore: (restoredPet: PetData) => void;
  showToast?: (message: string) => void;
}

// Encode PetData to UTF-8 safe Base64 string
export function encodePetDataToBase64(data: PetData): string {
  const jsonStr = JSON.stringify(data);
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decode Base64 string to PetData with UTF-8 support
export function decodeBase64ToPetData(encodedStr: string): PetData {
  const cleanStr = encodedStr.trim();
  let jsonStr = '';

  // Check if string is already raw JSON
  if (cleanStr.startsWith('{') && cleanStr.endsWith('}')) {
    jsonStr = cleanStr;
  } else {
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    jsonStr = new TextDecoder('utf-8').decode(bytes);
  }

  const result = parseAndMigratePetSave(jsonStr);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.pet;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  pet,
  onRestore,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [previewPet, setPreviewPet] = useState<PetData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate Base64 seal text
  const base64Code = pet ? encodePetDataToBase64(pet) : '';

  // Copy Base64 seal to clipboard
  const handleCopyCode = async () => {
    if (!base64Code) return;
    try {
      await navigator.clipboard.writeText(base64Code);
      setCopied(true);
      soundEngine.playClick();
      hapticEngine.tap();
      if (showToast) showToast('📜 Teks Segel Santuari berhasil disalin ke papan klip!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API restricted
      const textarea = document.createElement('textarea');
      textarea.value = base64Code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (showToast) showToast('📜 Teks Segel Santuari berhasil disalin!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download save data as .json file
  const handleDownloadJSON = () => {
    if (!pet) return;
    soundEngine.playClick();
    hapticEngine.tap();

    const jsonStr = JSON.stringify(pet, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `HAGUMI_Save_${pet.name}_Lvl${pet.level}_${pet.tailCount}Ekor_${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) showToast(`💾 Berkas cadangan ${filename} berhasil diunduh!`);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEngine.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setImportInput(content);
        validateText(content);
      } catch (err: any) {
        setValidationError(`Gagal membaca berkas: ${err.message}`);
        setPreviewPet(null);
      }
    };
    reader.onerror = () => {
      setValidationError('Terjadi kesalahan saat membaca berkas.');
      setPreviewPet(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Validate text input (Base64 or JSON)
  const validateText = (text: string) => {
    setValidationError(null);
    setPreviewPet(null);

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const sanitized = decodeBase64ToPetData(trimmed);
      setPreviewPet(sanitized);
      soundEngine.playShrineBell();
      hapticEngine.tap();
    } catch (err: any) {
      setValidationError(err.message || 'Data segel tidak dapat dipahami.');
      setPreviewPet(null);
    }
  };

  // Execute restore
  const handleConfirmRestore = () => {
    if (!previewPet) return;

    try {
      localStorage.setItem('HAGUMI_KITSUNE_SAVE_DATA', JSON.stringify(previewPet));
      onRestore(previewPet);
      soundEngine.playLevelUp();
      hapticEngine.trigger('evolution');
      if (showToast) {
        showToast(`⛩️ Segel Santuari Berhasil Dipulihkan! Selamat datang kembali, ${previewPet.name}!`);
      }
      onClose();
    } catch (e: any) {
      setValidationError(`Gagal menyimpan data ke peramban: ${e.message}`);
    }
  };

  const getElementBadge = (elem: string) => {
    switch (elem) {
      case 'fire':
        return { label: 'Api (Hinote)', color: 'bg-orange-950/80 border-orange-600 text-orange-300' };
      case 'water':
        return { label: 'Air (Mizu)', color: 'bg-blue-950/80 border-blue-600 text-blue-300' };
      case 'thunder':
        return { label: 'Petir (Ikazuchi)', color: 'bg-yellow-950/80 border-yellow-600 text-yellow-300' };
      case 'wind':
        return { label: 'Angin (Kaze)', color: 'bg-emerald-950/80 border-emerald-600 text-emerald-300' };
      case 'light':
        return { label: 'Cahaya (Hikari)', color: 'bg-amber-950/80 border-amber-400 text-amber-200' };
      case 'shadow':
        return { label: 'Bayangan (Kage)', color: 'bg-purple-950/80 border-purple-600 text-purple-300' };
      default:
        return { label: elem, color: 'bg-stone-900 border-stone-600 text-stone-300' };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click */}
        <div
          className="absolute inset-0"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] bg-[#1a120c] border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-['Zen_Maru_Gothic',sans-serif]"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#2c1a11] via-[#3a2014] to-[#25130b] border-b border-amber-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/90 border border-amber-500/80 flex items-center justify-center text-2xl shadow-inner">
                💾
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-wide flex items-center gap-2">
                  <span>Segel Cadangan Santuari</span>
                  <span className="text-xs text-amber-400/80 font-['Shippori_Mincho',serif]">
                    (御守護印)
                  </span>
                </h2>
                <p className="text-[11px] text-stone-300">
                  Amankan data Kitsune Anda, salin teks segel, atau pulihkan ke peramban lain
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-stone-900/80 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-amber-900/60 bg-[#140e09]">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('export');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-amber-900/40 text-amber-300 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Segel (Cadangkan)</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('import');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-amber-900/40 text-amber-300 border-b-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Pulihkan Segel (Restore)</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'export' ? (
              <div className="space-y-4">
                {/* Active Kitsune Snapshot Card */}
                {pet ? (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#261710] to-[#1a100a] border border-amber-700/60 flex items-center gap-3.5 shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/70 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                      🦊
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-amber-100 text-sm sm:text-base">
                          {pet.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getElementBadge(pet.element).color}`}>
                          {getElementBadge(pet.element).label}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-300 mt-0.5 flex items-center gap-2.5 flex-wrap">
                        <span>Level: <b className="text-amber-300">{pet.level}</b></span>
                        <span>•</span>
                        <span>Ekor: <b className="text-amber-300">{pet.tailCount}</b></span>
                        <span>•</span>
                        <span>Care Score: <b className="text-emerald-400">{pet.careScore}%</b></span>
                        <span>•</span>
                        <span>Koin: <b className="text-amber-300">{pet.coins} 🪙</b></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center text-xs text-stone-400">
                    Belum ada data roh Kitsune aktif.
                  </div>
                )}

                {/* Option 1: File Download */}
                <div className="p-3.5 rounded-2xl bg-[#21140d] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-amber-100">
                        Metode 1: Unduh Berkas Cadangan (.JSON)
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-600 text-emerald-300 font-bold">
                      Direkomendasikan
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Unduh file lengkap untuk disimpan di memori perangkat, laptop, atau Google Drive Anda.
                  </p>
                  <button
                    onClick={handleDownloadJSON}
                    disabled={!pet}
                    className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 text-stone-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Berkas Santuari (.JSON)</span>
                  </button>
                </div>

                {/* Option 2: Base64 Code */}
                <div className="p-3.5 rounded-2xl bg-[#21140d] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-amber-100">
                        Metode 2: Salin Teks Jimat Segel (Base64)
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-bold">
                      Instan
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Salin teks sandi ringkas ini untuk langsung ditempelkan pada santuari di peramban lain.
                  </p>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={base64Code}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-black/50 border border-amber-900/70 text-[10px] text-amber-200/90 font-mono resize-none focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleCopyCode}
                      disabled={!base64Code}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-amber-800/90 hover:bg-amber-700 text-amber-100 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Segel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Restore Instructions */}
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-stone-300 text-[11px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Unggah berkas <b>.JSON</b> cadangan atau tempelkan <b>Teks Jimat Segel</b> yang Anda miliki sebelumnya untuk memulihkan seluruh progres Kitsune Anda.
                  </span>
                </div>

                {/* Upload File Input */}
                <div className="p-3.5 rounded-2xl bg-[#21140d] border border-amber-700/50 space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Pilih Berkas Cadangan (.JSON)</span>
                  </span>
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-amber-800/70 hover:border-amber-500 rounded-xl bg-black/30 cursor-pointer transition-colors group">
                    <FileText className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-xs font-bold text-amber-200">Klik untuk memilih berkas .json</span>
                    <span className="text-[10px] text-stone-400">Berkas hasil unduhan cadangan santuari sebelumnya</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Paste Textarea */}
                <div className="p-3.5 rounded-2xl bg-[#21140d] border border-amber-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Atau Tempel Teks Jimat Segel</span>
                    </span>
                    {importInput && (
                      <button
                        onClick={() => {
                          setImportInput('');
                          setPreviewPet(null);
                          setValidationError(null);
                        }}
                        className="text-[10px] text-stone-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                  <textarea
                    value={importInput}
                    onChange={(e) => {
                      setImportInput(e.target.value);
                      validateText(e.target.value);
                    }}
                    placeholder="Tempelkan string Base64 atau kode JSON santuari di sini..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-amber-900/70 text-xs text-amber-100 font-mono resize-none focus:outline-none focus:border-amber-500 placeholder:text-stone-600"
                  />
                </div>

                {/* Error Banner */}
                {validationError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Validated Preview Card */}
                {previewPet && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1c2e1f] to-[#121f14] border-2 border-emerald-500/80 shadow-lg space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-200">
                          Pratinjau Data yang Ditemukan:
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
                        Valid 100%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center text-3xl flex-shrink-0">
                        🦊
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-base">
                            {previewPet.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getElementBadge(previewPet.element).color}`}>
                            {getElementBadge(previewPet.element).label}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-100/90 mt-0.5 flex items-center gap-2.5 flex-wrap">
                          <span>Level: <b>{previewPet.level}</b></span>
                          <span>•</span>
                          <span>Ekor: <b>{previewPet.tailCount}</b></span>
                          <span>•</span>
                          <span>Care Score: <b>{previewPet.careScore}%</b></span>
                          <span>•</span>
                          <span>Koin: <b>{previewPet.coins} 🪙</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Warning about overwriting */}
                    <div className="text-[10px] text-amber-300/90 bg-amber-950/50 p-2 rounded-lg border border-amber-800/60 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>
                        Memulihkan data ini akan menimpa data santuari yang sedang aktif di peramban saat ini.
                      </span>
                    </div>

                    {/* Confirm Restore Button */}
                    <button
                      onClick={handleConfirmRestore}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Pulihkan Roh Kitsune Sekarang</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#120b07] border-t border-amber-900/50 flex items-center justify-between text-[11px] text-stone-400 px-4">
            <span className="flex items-center gap-1.5">
              <span>⛩️</span>
              <span>Kuil Inari menjamin keamanan data spiritual Anda</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
