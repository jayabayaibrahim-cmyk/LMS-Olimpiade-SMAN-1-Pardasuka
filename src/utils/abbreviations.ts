import { OsnSubject, CompetitionLevel, BloomTaxonomy, SoloTaxonomy } from '../types';

/**
 * Singkatan Resmi Bidang Olimpiade Sains (OSN)
 * Berguna untuk label ringkas pada layar kecil (mobile/tablet), badge, dan tab.
 */
export const SUBJECT_ABBREVIATIONS: Record<string, string> = {
  Matematika: 'MAT',
  Fisika: 'FIS',
  Biologi: 'BIO',
  Kimia: 'KIM',
  Informatika: 'INF',
  Astronomi: 'AST',
  Kebumian: 'KEB',
  Ekonomi: 'EKO',
  Geografi: 'GEO',
};

/**
 * Mengambil singkatan 3 huruf bidang OSN (contoh: Informatika -> INF)
 */
export function getSubjectAbbr(subject: string): string {
  return SUBJECT_ABBREVIATIONS[subject] || subject.substring(0, 3).toUpperCase();
}

/**
 * Singkatan Tingkat Kompetisi OSN
 * 'Kabupaten (OSN-K)' -> 'OSN-K'
 */
export function getCompetitionLevelAbbr(level: string): string {
  if (level.includes('OSN-K')) return 'OSN-K';
  if (level.includes('OSN-P')) return 'OSN-P';
  if (level.includes('OSN-N')) return 'OSN-N';
  return level;
}

/**
 * Singkatan Taksonomi Bloom
 * 'C4 (Menganalisis)' -> 'C4 Analisis'
 * 'C6 (Menciptakan/HOTS)' -> 'C6 HOTS'
 */
export function getBloomAbbr(bloom: string): string {
  if (!bloom) return '';
  const match = bloom.match(/^(C[1-6])/);
  if (!match) return bloom;
  const code = match[1];
  switch (code) {
    case 'C1': return 'C1 Ingat';
    case 'C2': return 'C2 Paham';
    case 'C3': return 'C3 Aplikasi';
    case 'C4': return 'C4 Analisis';
    case 'C5': return 'C5 Evaluasi';
    case 'C6': return 'C6 HOTS';
    default: return bloom;
  }
}

/**
 * Singkatan Taksonomi SOLO
 * 'Extended Abstract' -> 'Ext. Abstract'
 * 'Multistructural' -> 'Multi-struct'
 */
export function getSoloAbbr(solo: string): string {
  if (!solo) return '';
  switch (solo) {
    case 'Unistructural': return 'Uni-struct';
    case 'Multistructural': return 'Multi-struct';
    case 'Relational': return 'Relational';
    case 'Extended Abstract': return 'Ext. Abstract';
    case 'Prestructural': return 'Pre-struct';
    default: return solo;
  }
}

/**
 * Singkatan Status / Peran
 */
export function getRoleAbbr(role: string): string {
  switch (role) {
    case 'admin': return 'Admin';
    case 'teacher': return 'Pembina';
    case 'student': return 'Siswa';
    default: return role;
  }
}

/**
 * Pemendek string jika melebihi panjang maksimum tertentu
 */
export function shortenText(text: string, maxLength: number = 32): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
