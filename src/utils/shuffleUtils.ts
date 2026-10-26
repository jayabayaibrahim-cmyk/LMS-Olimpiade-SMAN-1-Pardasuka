import { Question } from '../types';

/**
 * Deterministic pseudo-random number generator (LCG) based on seed string.
 * Generates an integer hash from the seed.
 */
function hashStringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

/**
 * Mengacak urutan butir soal secara unik dan deterministik berdasarkan identitas akun pengguna (userId)
 * dan ID paket ujian (examId).
 * 
 * Hasilnya:
 * - Setiap akun siswa (misal SISWA-001 vs SISWA-002 vs GURU-001) mendapatkan urutan butir soal yang BERBEDA.
 * - Nomor soal tidak berurutan antar akun peserta sehingga mencegah contek-mencontek.
 * - Sesi ujian tetap konsisten untuk akun tersebut jika dimuat ulang.
 */
export function shuffleQuestionsForAccount(
  questions: Question[],
  userId: string,
  examId: string
): Question[] {
  if (!questions || questions.length <= 1) {
    return questions ? [...questions] : [];
  }

  const seedKey = `${(userId || 'peserta').trim()}_${(examId || 'cbt').trim()}`;
  let seed = hashStringToSeed(seedKey);

  // Linear Congruential Generator
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Jika hasil acak secara kebetulan persis sama dengan urutan awal dan panjang > 1,
  // putar elemen pertama ke belakang agar dijamin tidak berurutan sama.
  const isAllIdentical = shuffled.every((q, idx) => q.id === questions[idx].id);
  if (isAllIdentical && shuffled.length > 1) {
    const first = shuffled.shift()!;
    shuffled.push(first);
  }

  return shuffled;
}

/**
 * Mengacak array secara acak instan (Fisher-Yates) saat Guru menekan tombol
 * "Acak Urutan Soal (Shuffle)" di formulir penyusunan CBT.
 */
export function shuffleQuestionsArray<T>(items: T[]): T[] {
  if (!items || items.length <= 1) {
    return items ? [...items] : [];
  }
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
