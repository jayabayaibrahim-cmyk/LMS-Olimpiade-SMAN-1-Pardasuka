import React from 'react';
import {
  Sparkles,
  Trophy,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  BookOpen,
  Calendar,
  AlertCircle,
  Award,
  GraduationCap,
  Youtube,
} from 'lucide-react';
import { UserProfile, OsnSubject, ExamPacket, BimbinganSchedule } from '../types';
import { INITIAL_LEADERBOARD } from '../data/mockData';

interface DashboardViewProps {
  currentUser: UserProfile;
  totalQuestions: number;
  exams: ExamPacket[];
  bimbinganSchedules?: BimbinganSchedule[];
  setActiveTab: (tab: string) => void;
  onSelectSubjectForGenerator: (subject: OsnSubject) => void;
  onStartExam: (exam: ExamPacket) => void;
}

const OSN_SUBJECT_CARDS: { subject: OsnSubject; icon: string; color: string; desc: string }[] = [
  { subject: 'Matematika', icon: '∑', color: 'from-amber-500/20 to-purple-600/20 border-amber-500/30 text-amber-300', desc: 'Aljabar, Geometri, Teori Bilangan, Kombinatorika' },
  { subject: 'Fisika', icon: '⚡', color: 'from-blue-500/20 to-purple-600/20 border-blue-500/30 text-blue-300', desc: 'Mekanika Klasik, Termodinamika, Listrik & Magnet' },
  { subject: 'Biologi', icon: '🧬', color: 'from-emerald-500/20 to-purple-600/20 border-emerald-500/30 text-emerald-300', desc: 'Biologi Sel, Genetika Mendel, Anatomi & Fisiologi' },
  { subject: 'Kimia', icon: '⚗️', color: 'from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-300', desc: 'Stoikiometri, Ikatan Kimia, Termokimia, Organik' },
  { subject: 'Informatika', icon: '💻', color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-300', desc: 'Algoritma, Pemrograman C++, Teori Graf & DP' },
  { subject: 'Astronomi', icon: '🔭', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30 text-violet-300', desc: 'Mekanika Benda Langit, Astrofisika, Tata Surya' },
  { subject: 'Kebumian', icon: '🌍', color: 'from-teal-500/20 to-purple-600/20 border-teal-500/30 text-teal-300', desc: 'Geologi, Meteorologi, Oseanografi, Astronomi Dasar' },
  { subject: 'Ekonomi', icon: '📈', color: 'from-yellow-500/20 to-purple-600/20 border-yellow-500/30 text-yellow-300', desc: 'Mikro, Makro, Akuntansi, Pasar Modal' },
  { subject: 'Geografi', icon: '🗺️', color: 'from-orange-500/20 to-purple-600/20 border-orange-500/30 text-orange-300', desc: 'Geomorfologi, Klimatologi, Penginderaan Jauh & SIG' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  totalQuestions,
  exams,
  setActiveTab,
  onSelectSubjectForGenerator,
  onStartExam,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const userSelectedSubject = currentUser.subject || 'Matematika';
  const displayedExams = isAdmin
    ? exams
    : exams.filter((e) => e.subject === userSelectedSubject);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#20103e] via-[#170c2d] to-[#0d0617] border border-purple-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-600/50 text-xs font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Portal Resmi Olimpiade Sains SMAN 1 Pardasuka</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Selamat Datang,{' '}
              <span className="bg-gradient-to-r from-amber-300 via-purple-200 to-white bg-clip-text text-transparent">
                {currentUser.name}
              </span>
            </h1>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              Ekosistem terintegrasi pembelajaran, generator soal berbasis Taksonomi Bloom & SOLO,
              simulasi Computer-Based Test (CBT) standar OSN, serta keamanan login 1-perangkat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveTab('bimbingan')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300" />
              <span className="sm:hidden">Jadwal</span>
              <span className="hidden sm:inline">Jadwal Bimbingan</span>
            </button>
            <button
              onClick={() => setActiveTab('cbt')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span>Ujian CBT</span>
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="sm:hidden">{currentUser.role === 'student' ? 'Soal' : 'Bank Soal'}</span>
              <span className="hidden sm:inline">{currentUser.role === 'student' ? 'Soal Bimbingan' : 'Bank Soal AI'}</span>
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="sm:hidden">Scholar</span>
              <span className="hidden sm:inline">Google Scholar</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              <span className="sm:hidden">Media</span>
              <span className="hidden sm:inline">Media Belajar</span>
            </button>
          </div>
        </div>

        {/* System Health Indicators (Hanya Tampil di Akun Admin) */}
        {currentUser.role === 'admin' && (
          <div className="mt-6 pt-6 border-t border-purple-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-purple-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>1-Device Policy:</strong> Aktif & Terikat ({currentUser.deviceToken.substring(0, 10)}...)
              </span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <Brain className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>AI Model:</strong> Gemini 3.8 Flash (Bloom C1-C6 & SOLO)
              </span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Export Engine:</strong> Google Apps Script Webhook Ready
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300/80">Bank Soal Terkalibrasi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-300" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalQuestions}</span>
            <span className="text-xs text-purple-400">Butir Soal</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-300/60">Terstruktur Bloom C1-C6 & SOLO</p>
        </div>

        <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300/80">Paket Ujian CBT</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {displayedExams.length}
            </span>
            <span className="text-xs text-emerald-400">
              {isAdmin ? 'Paket Aktif (Semua)' : `Paket (${userSelectedSubject})`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-purple-300/60">Standar Skor OSN (+4, -1, 0)</p>
        </div>

        <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300/80">Peserta Bimbingan OSN</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">48</span>
            <span className="text-xs text-amber-400">Siswa Terdaftar</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-300/60">9 Bidang Sains Tersebar</p>
        </div>

        <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300/80">Integritas Keamanan</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs text-blue-400">1-Device Lock</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-300/60">Anti multi-login & tab switch</p>
        </div>
      </div>

      {/* 9 Bidang Olimpiade Sains Nasional SMAN 1 Pardasuka */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              9 Bidang Olimpiade Sains Nasional (OSN)
            </h2>
            <p className="text-xs text-purple-300/70">
              Pilih bidang olimpiade untuk membuka silabus, bank soal AI, atau modul materi
            </p>
          </div>
          <button
            onClick={() => setActiveTab('modules')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            Buka Semua Silabus <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OSN_SUBJECT_CARDS.map((item) => (
            <div
              key={item.subject}
              className={`rounded-xl bg-gradient-to-br ${item.color} bg-[#180e2f]/60 p-4 border transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-200 border border-purple-700/50">
                    <span className="hidden sm:inline">OSN SMAN 1 PARDASUKA</span>
                    <span className="sm:hidden">OSN SMAN 1 PDS</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.subject}</h3>
                <p className="text-xs text-purple-200/80 mt-1 line-clamp-2">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectSubjectForGenerator(item.subject);
                    setActiveTab('generator');
                  }}
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-700/50 text-[11px] font-semibold text-purple-200 transition-colors cursor-pointer"
                >
                  {currentUser.role === 'student' ? 'Bank Soal' : 'Buat Soal AI'}
                </button>
                <button
                  onClick={() => {
                    onSelectSubjectForGenerator(item.subject);
                    setActiveTab('modules');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-purple-900/40 hover:bg-purple-900/80 text-[11px] font-medium text-amber-300 transition-colors cursor-pointer"
                >
                  Silabus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Row: Paket Ujian Tersedia & Leaderboard Prestasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Jadwal & Paket Ujian CBT {isAdmin ? 'Tersedia' : `Bidang ${userSelectedSubject}`}
            </h2>
            <button
              onClick={() => setActiveTab('cbt')}
              className="text-xs text-purple-300 hover:text-white cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {displayedExams.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#180e2f]/50 border border-purple-800/40 text-center text-xs text-purple-300/70">
                Belum ada paket ujian CBT untuk bidang {userSelectedSubject}.
              </div>
            ) : (
              displayedExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-[#180e2f]/80 border border-purple-800/40 hover:border-purple-600/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/50">
                        {exam.subject}
                      </span>
                      <span className="text-xs font-medium text-amber-400">
                        {exam.level}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{exam.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-purple-300/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} Menit
                      </span>
                      <span>{exam.questions.length} Butir Soal</span>
                      <span className="text-emerald-400 font-semibold">
                        {exam.penaltyMode ? 'Skor OSN (+4, -1, 0)' : 'Standar 100'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartExam(exam)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950 cursor-pointer"
                  >
                    Mulai Ujian
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaderboard Prestasi SMAN 1 Pardasuka */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Top Skor Tryout SMAN 1 Pardasuka
          </h2>

          <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-xl p-4 divide-y divide-purple-900/40">
            {INITIAL_LEADERBOARD.map((item) => (
              <div key={item.nisn} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.rank === 1
                        ? 'bg-amber-400 text-slate-900'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-purple-950 text-purple-300'
                    }`}
                  >
                    {item.rank}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-none">{item.name}</h4>
                    <p className="text-[10px] text-purple-300/70 truncate">
                      {item.class} • <span className="text-amber-300 font-semibold">{item.subject}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-amber-300">{item.score}</span>
                  <p className="text-[10px] text-purple-300/60">{item.medal}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-300/80 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Nilai diperbarui otomatis dari hasil ujian CBT yang disinkronisasi ke Google Sheets sekolah.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
