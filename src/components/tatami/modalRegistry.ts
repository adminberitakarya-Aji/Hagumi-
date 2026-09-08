/**
 * src/components/tatami/modalRegistry.ts
 * Registry modal Santuari: daftar ModalKind & label ramah pembaca layar.
 * Dipisahkan dari TatamiRoom.tsx agar bisa dipakai lintas komponen tanpa
 * menarik seluruh God component.
 */

/** Semua jenis modal yang bisa dibuka di TatamiRoom (satu aktif pada satu waktu). */
export type ModalKind =
  | 'bedroom'
  | 'bento'
  | 'bath'
  | 'shop'
  | 'shrine'
  | 'matsuri'
  | 'hanko'
  | 'wardrobe'
  | 'decor'
  | 'memoryScroll'
  | 'shrinePass'
  | 'hanabi'
  | 'haptic'
  | 'parallax'
  | 'sanctuaryMenu'
  | 'backupRestore'
  | 'sleepConfirm'
  | 'odekake'
  | 'zenGarden';

/** Label dialog yang ramah pembaca layar untuk setiap ModalKind. */
export const MODAL_LABELS: Record<ModalKind, string> = {
  bedroom: 'Kamar Peraduan Futon',
  bento: 'Meja Makan Bento',
  bath: 'Mandi Onsen',
  shop: 'Toko Serba Ada Tanuki',
  shrine: 'Kuil Inari',
  matsuri: 'Festival Matsuri',
  hanko: 'Album Cap Hanko',
  wardrobe: 'Lemari Busana Kitsune Tansu',
  decor: 'Dekorasi Santuari',
  memoryScroll: 'Buku Harian Roh',
  shrinePass: 'Paspor Ziarah Kuil',
  hanabi: 'Pembuat Kembang Api Hanabi',
  haptic: 'Pengaturan Getaran Haptic',
  parallax: 'Pengaturan Parallax 2.5D',
  sanctuaryMenu: 'Menu Fitur Santuari',
  backupRestore: 'Cadangan & Pemulihan Santuari',
  sleepConfirm: 'Konfirmasi Tidur 15 Menit',
  odekake: 'Petualangan Berkelana Odekake',
  zenGarden: 'Taman Zen & Kolam Koi Engawa',
};
