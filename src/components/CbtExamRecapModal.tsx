import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Award,
  BarChart3,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExamResult, ExamPacket, UserProfile, OsnSubject } from '../types';
import { exportResultsToCsv } from '../services/gasExport';
import { printCbtRecapSummaryPdf, printCbtResultPdf } from '../services/pdfPrintService';

interface CbtExamRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  examResults: ExamResult[];
  exams: ExamPacket[];
  currentUser: UserProfile;
  initialSelectedExamId?: string | null;
}

export const CbtExamRecapModal: React.FC<CbtExamRecapModalProps> = ({
  isOpen,
  onClose,
  examResults,
  exams,
  currentUser,
  initialSelectedExamId,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'perSiswa' | 'perPaket'>('log');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>(initialSelectedExamId || 'all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync initial exam filter if changed
  React.useEffect(() => {
    if (initialSelectedExamId) {
      setSelectedExamFilter(initialSelectedExamId);
    }
  }, [initialSelectedExamId]);

  // Filtered Results for Log
  const filteredResults = useMemo(() => {
    return examResults.filter((res) => {
      // Role scoping: If student, show their own or if teacher only their subject unless admin
      if (currentUser.role === 'student' && res.studentId !== currentUser.id) {
        // Students can see all leaderboard/recap or toggle, but here allow viewing
      }
      if (selectedExamFilter !== 'all' && res.examId !== selectedExamFilter) {
        return false;
      }
      if (selectedSubjectFilter !== 'all' && res.subject !== selectedSubjectFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.studentName.toLowerCase().includes(q);
        const matchesNisn = res.nisn.toLowerCase().includes(q);
        const matchesExam = res.examTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesNisn && !matchesExam) return false;
      }
      return true;
    });
  }, [examResults, currentUser, selectedExamFilter, selectedSubjectFilter, searchQuery]);

  // Aggregate Metrics
  const uniqueStudentsCount = useMemo(() => {
    return new Set(filteredResults.map((r) => r.studentId)).size;
  }, [filteredResults]);

  const totalAttemptsCount = filteredResults.length;

  const averageScore = useMemo(() => {
    if (totalAttemptsCount === 0) return 0;
    const sum = filteredResults.reduce((acc, r) => acc + r.score, 0);
    return Math.round(sum / totalAttemptsCount);
  }, [filteredResults, totalAttemptsCount]);

  const highestScore = useMemo(() => {
    if (totalAttemptsCount === 0) return 0;
    return Math.max(...filteredResults.map((r) => r.score));
  }, [filteredResults, totalAttemptsCount]);

  const avgAttemptsPerStudent = useMemo(() => {
    if (uniqueStudentsCount === 0) return '0';
    return (totalAttemptsCount / uniqueStudentsCount).toFixed(1);
  }, [totalAttemptsCount, uniqueStudentsCount]);

  // Aggregation per Student
  const studentRecap = useMemo(() => {
    const map = new Map<
      string,
      {
        studentId: string;
        studentName: string;
        nisn: string;
        subject: OsnSubject;
        totalAttempts: number;
        highestScore: number;
        avgScore: number;
        scores: number[];
        results: ExamResult[];
      }
    >();

    examResults.forEach((res) => {
      if (selectedSubjectFilter !== 'all' && res.subject !== selectedSubjectFilter) return;
      if (selectedExamFilter !== 'all' && res.examId !== selectedExamFilter) return;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!res.studentName.toLowerCase().includes(q) && !res.nisn.toLowerCase().includes(q)) {
          return;
        }
      }

      const existing = map.get(res.studentId);
      if (!existing) {
        map.set(res.studentId, {
          studentId: res.studentId,
          studentName: res.studentName,
          nisn: res.nisn,
          subject: res.subject,
          totalAttempts: 1,
          highestScore: res.score,
          avgScore: res.score,
          scores: [res.score],
          results: [res],
        });
      } else {
        existing.totalAttempts += 1;
        existing.scores.push(res.score);
        existing.highestScore = Math.max(existing.highestScore, res.score);
        existing.avgScore = Math.round(
          existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length
        );
        existing.results.push(res);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalAttempts - a.totalAttempts);
  }, [examResults, selectedSubjectFilter, selectedExamFilter, searchQuery]);

  // Aggregation per Exam Package
  const examPackageRecap = useMemo(() => {
    return exams.map((exam) => {
      const resultsForExam = examResults.filter((r) => r.examId === exam.id);
      const uniqueStudents = new Set(resultsForExam.map((r) => r.studentId)).size;
      const totalAttempts = resultsForExam.length;
      const scores = resultsForExam.map((r) => r.score);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const max = scores.length > 0 ? Math.max(...scores) : 0;
      const min = scores.length > 0 ? Math.min(...scores) : 0;
      const passedCount = resultsForExam.filter(
        (r) => r.percentageScore >= exam.passingScore
      ).length;

      return {
        exam,
        uniqueStudents,
        totalAttempts,
        avgScore: avg,
        maxScore: max,
        minScore: min,
        passedCount,
        results: resultsForExam,
      };
    });
  }, [exams, examResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#150a28] border border-purple-600/70 rounded-3xl max-w-6xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-purple-900/50 bg-[#1a0c33] flex items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                REKAPITULASI RESMI CBT
              </span>
              <span className="text-xs text-purple-300/80">SMAN 1 Pardasuka • Kabupaten Pringsewu</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Rekapan Pengerjaan & Hasil Ujian CBT Olimpiade Sains
            </h2>
            <p className="text-xs text-purple-300/70 mt-0.5">
              Pelacakan jumlah siswa yang mengerjakan ujian CBT, rincian pengerjaan ke berapa kali (frekuensi percobaan), dan rekapitulasi nilai.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportResultsToCsv(filteredResults)}
              title="Unduh format spreadsheet CSV"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700/40 hover:bg-emerald-600 border border-emerald-500/60 text-white text-xs font-semibold cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={() => printCbtRecapSummaryPdf(filteredResults, 'Laporan Rekapitulasi CBT')}
              title="Cetak lembar rekapitulasi resmi PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700/40 hover:bg-purple-600 border border-purple-500/60 text-white text-xs font-semibold cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="px-6 py-4 bg-[#110722] border-b border-purple-950 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#1a0d33] border border-purple-800/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-purple-300/70 font-semibold block">Siswa Mengerjakan</span>
              <span className="text-xl font-black text-cyan-300">{uniqueStudentsCount} Siswa</span>
              <span className="text-[10px] text-purple-400 block font-mono">Peserta Terdaftar</span>
            </div>
          </div>

          <div className="bg-[#1a0d33] border border-purple-800/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
              <History className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-[11px] text-purple-300/70 font-semibold block">Total Frekuensi</span>
              <span className="text-xl font-black text-purple-200">{totalAttemptsCount}x Pengerjaan</span>
              <span className="text-[10px] text-purple-400 block font-mono">Kumulatif Percobaan</span>
            </div>
          </div>

          <div className="bg-[#1a0d33] border border-purple-800/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-300 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-purple-300/70 font-semibold block">Rata-rata Percobaan</span>
              <span className="text-xl font-black text-amber-300">{avgAttemptsPerStudent}x / Siswa</span>
              <span className="text-[10px] text-amber-400/80 block font-mono">Frekuensi Latihan</span>
            </div>
          </div>

          <div className="bg-[#1a0d33] border border-purple-800/40 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-purple-300/70 font-semibold block">Rata-rata Skor</span>
              <span className="text-xl font-black text-emerald-300">{averageScore}</span>
              <span className="text-[10px] text-emerald-400/80 block font-mono">Poin Standar OSN</span>
            </div>
          </div>

          <div className="bg-[#1a0d33] border border-purple-800/40 rounded-2xl p-3.5 flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-purple-300/70 font-semibold block">Skor Tertinggi</span>
              <span className="text-xl font-black text-pink-300">{highestScore}</span>
              <span className="text-[10px] text-pink-400/80 block font-mono">Rekor Simulasi</span>
            </div>
          </div>
        </div>

        {/* View Selection Tabs & Search / Filter Bar */}
        <div className="px-6 py-3 border-b border-purple-900/40 bg-[#160b2a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Subtabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-[#100720] border border-purple-900/60 self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'log'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="sm:hidden">Log ({filteredResults.length})</span>
              <span className="hidden sm:inline">Log Pengerjaan ({filteredResults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('perSiswa')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'perSiswa'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="sm:hidden">Siswa ({studentRecap.length})</span>
              <span className="hidden sm:inline">Rekapan per Siswa ({studentRecap.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('perPaket')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'perPaket'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="sm:hidden">Paket ({exams.length})</span>
              <span className="hidden sm:inline">Rekapan per Paket CBT ({exams.length})</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa / NISN..."
                className="w-full bg-[#100720] border border-purple-800/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              aria-label="Filter Paket Ujian"
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="bg-[#100720] border border-purple-800/60 rounded-xl px-2.5 py-1.5 text-xs text-purple-200 focus:outline-none max-w-[200px]"
            >
              <option value="all">Semua Paket CBT</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.subject}: {ex.title.length > 28 ? ex.title.slice(0, 28) + '...' : ex.title}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter Bidang Mapel"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-[#100720] border border-purple-800/60 rounded-xl px-2.5 py-1.5 text-xs text-purple-200 focus:outline-none"
            >
              <option value="all">Semua Mapel</option>
              {['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Informatika', 'Astronomi', 'Kebumian', 'Ekonomi', 'Geografi'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Log Setiap Pengerjaan (Detail Log with Attempt Number) */}
          {activeTab === 'log' && (
            <div className="space-y-3">
              {filteredResults.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#190d32]/60 border border-purple-900/40 text-purple-300">
                  <History className="w-10 h-10 text-purple-500 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">Belum Ada Rekaman Pengerjaan Ujian CBT</p>
                  <p className="text-xs text-purple-400/70 mt-1">
                    Silakan mulai dan selesaikan ujian CBT untuk melihat log pengerjaan di sini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-purple-800/40 shadow-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1a0e35] text-purple-200 border-b border-purple-800/60 font-semibold">
                        <th className="py-3 px-3.5 text-center w-12">No</th>
                        <th className="py-3 px-4">Nama Siswa & NISN</th>
                        <th className="py-3 px-4">Paket Ujian & Bidang</th>
                        <th className="py-3 px-3.5 text-center">Pengerjaan Ke-</th>
                        <th className="py-3 px-3.5 text-center">Skor (OSN)</th>
                        <th className="py-3 px-3.5 text-center">Akurasi</th>
                        <th className="py-3 px-4 text-center">Predikat</th>
                        <th className="py-3 px-4">Waktu Pengerjaan</th>
                        <th className="py-3 px-3.5 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/40 bg-[#130826]/70">
                      {filteredResults.map((result, idx) => {
                        const attemptNum = result.attemptNumber || 1;
                        return (
                          <tr
                            key={result.id}
                            className="hover:bg-purple-900/20 transition-colors"
                          >
                            <td className="py-3 px-3.5 text-center font-bold text-purple-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{result.studentName}</span>
                                {result.studentId === currentUser.id && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 border border-purple-700">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-purple-300/70 font-mono">
                                NISN: {result.nisn}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{result.examTitle}</div>
                              <span className="text-[11px] text-cyan-300 font-medium">
                                {result.subject}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${
                                  attemptNum === 1
                                    ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                                    : attemptNum === 2
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                }`}
                              >
                                <History className="w-3 h-3" />
                                Ke-{attemptNum} Kali
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <span className="text-sm font-black text-amber-300">{result.score}</span>
                              <span className="text-[10px] text-purple-400 block font-mono">
                                /{result.maxPossibleScore}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <span className="font-bold text-white">{result.percentageScore}%</span>
                              <span className="text-[10px] text-emerald-400 block">
                                {result.correctCount} Benar
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                  result.predicate.includes('Emas')
                                    ? 'bg-amber-950 text-amber-300 border-amber-600/60'
                                    : result.predicate.includes('Perak')
                                    ? 'bg-slate-800 text-slate-200 border-slate-500/60'
                                    : result.predicate.includes('Perunggu')
                                    ? 'bg-orange-950 text-orange-300 border-orange-600/60'
                                    : result.predicate.includes('Passing')
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                                    : 'bg-rose-950 text-rose-300 border-rose-600/60'
                                }`}
                              >
                                {result.predicate}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-purple-300/80">
                              <div className="flex items-center gap-1 font-mono text-[11px]">
                                <Calendar className="w-3 h-3 text-purple-400" />
                                {new Date(result.submittedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <span className="text-[10px] text-purple-400">
                                {new Date(result.submittedAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                WIB
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <button
                                onClick={() => {
                                  const exam = exams.find((e) => e.id === result.examId);
                                  printCbtResultPdf(result, exam?.questions);
                                }}
                                title="Cetak Lembar Nilai & Pembahasan Siswa (PDF)"
                                className="px-2.5 py-1.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 text-white font-semibold text-[11px] border border-purple-500/50 flex items-center gap-1 mx-auto cursor-pointer transition-all"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-300" />
                                <span>Cetak</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Rekapan per Siswa (Berapa Kali Setiap Siswa Mengerjakan) */}
          {activeTab === 'perSiswa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-300/80">
                  Daftar akumulasi seluruh siswa yang pernah mengikuti CBT, urut berdasarkan frekuensi pengerjaan (ke berapa kali ujian dikerjakan).
                </p>
                <span className="text-xs font-bold text-amber-300">
                  Total: {studentRecap.length} Siswa Terdata
                </span>
              </div>

              {studentRecap.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#190d32]/60 border border-purple-900/40 text-purple-300">
                  <Users className="w-10 h-10 text-purple-500 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">Tidak Ada Data Siswa yang Sesuai Filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentRecap.map((st) => (
                    <div
                      key={st.studentId}
                      className="bg-[#180e2f]/90 border border-purple-800/40 hover:border-purple-600/60 rounded-2xl p-4 space-y-3 shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            {st.studentName}
                            {st.studentId === currentUser.id && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 border border-purple-700">
                                Anda
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-purple-300/70 font-mono">
                            NISN: {st.nisn} • {st.subject}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-purple-950 text-amber-300 font-black text-xs border border-purple-700/60 shrink-0">
                          {st.totalAttempts}x Pengerjaan
                        </span>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#110722] border border-purple-900/50 text-xs">
                        <div>
                          <span className="text-[10px] text-purple-400 block">Skor Tertinggi</span>
                          <span className="font-extrabold text-amber-300 text-sm">
                            {st.highestScore} Poin
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-400 block">Rata-rata Skor</span>
                          <span className="font-extrabold text-emerald-300 text-sm">
                            {st.avgScore} Poin
                          </span>
                        </div>
                      </div>

                      {/* Riwayat Pengerjaan (Attempt list) */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-purple-300/90 block">
                          Riwayat Pengerjaan (Percobaan):
                        </span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {st.results.map((r, rIdx) => (
                            <div
                              key={r.id}
                              className="p-2 rounded-lg bg-[#140b27] border border-purple-900/40 flex items-center justify-between text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-cyan-300">
                                  Pengerjaan Ke-{r.attemptNumber || rIdx + 1}:
                                </span>{' '}
                                <span className="text-purple-200 font-semibold">{r.score} Poin</span>{' '}
                                <span className="text-purple-400">({r.percentageScore}%)</span>
                                <p className="text-[10px] text-purple-400 truncate max-w-[180px]">
                                  {r.examTitle}
                                </p>
                              </div>
                              <span className="text-[10px] text-purple-400 font-mono">
                                {new Date(r.submittedAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Rekapan per Paket Ujian CBT */}
          {activeTab === 'perPaket' && (
            <div className="space-y-4">
              <p className="text-xs text-purple-300/80">
                Statistik pengerjaan per paket soal CBT: jumlah siswa yang mengikuti dan total frekuensi pengerjaan tiap paket simulasi OSN.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examPackageRecap.map(({ exam, uniqueStudents, totalAttempts, avgScore, maxScore, minScore, passedCount }) => (
                  <div
                    key={exam.id}
                    className="bg-[#180e2f]/90 border border-purple-800/40 hover:border-purple-600/60 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-700/60">
                            {exam.subject}
                          </span>
                          <span className="text-xs font-semibold text-amber-400">{exam.level}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-base leading-snug">
                          {exam.title}
                        </h4>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-purple-950 text-emerald-300 font-black text-xs border border-purple-700/60 shrink-0">
                        {exam.questions.length} Butir Soal
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#110722] border border-purple-900/50 text-xs">
                      <div className="p-1 text-center">
                        <span className="text-[10px] text-purple-400 block">Siswa Mengikuti</span>
                        <span className="font-black text-cyan-300 text-base">{uniqueStudents} Siswa</span>
                      </div>
                      <div className="p-1 text-center">
                        <span className="text-[10px] text-purple-400 block">Total Pengerjaan</span>
                        <span className="font-black text-purple-200 text-base">{totalAttempts}x</span>
                      </div>
                      <div className="p-1 text-center">
                        <span className="text-[10px] text-purple-400 block">Rata-rata Skor</span>
                        <span className="font-black text-emerald-300 text-base">{avgScore}</span>
                      </div>
                      <div className="p-1 text-center">
                        <span className="text-[10px] text-purple-400 block">Skor Tertinggi</span>
                        <span className="font-black text-amber-300 text-base">{maxScore}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-purple-300/80 pt-1 border-t border-purple-900/40">
                      <span>Lolos Passing Grade ({exam.passingScore}%):</span>
                      <span className="font-bold text-white">
                        {passedCount} dari {totalAttempts} pengerjaan ({totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-purple-900/50 bg-[#160b2b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-purple-300/70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Data tersinkronisasi otomatis dengan penyimpanan Ruang Aplikasiku.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-white font-bold cursor-pointer transition-all self-end sm:self-auto"
          >
            Tutup Rekapan
          </button>
        </div>
      </div>
    </div>
  );
};
