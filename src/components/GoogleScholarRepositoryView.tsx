import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
  Download,
  CheckCircle2,
  BookmarkPlus,
  Atom,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Building,
  Quote,
  Share2,
} from 'lucide-react';
import { OsnSubject, Question, UserProfile, BimbinganSchedule } from '../types';
import {
  searchScholarArticles,
  buildGoogleScholarUrl,
} from '../services/googleScholarRepositoryService';
import { ScholarArticle } from '../data/scholarRepositoryData';

interface GoogleScholarRepositoryViewProps {
  currentUser: UserProfile;
  onAddQuestionToBank: (q: Question) => void;
  bimbinganSchedules?: BimbinganSchedule[];
  onAddQuestionsToSchedule?: (scheduleId: string, questions: Question[]) => void;
}

const OSN_SUBJECT_OPTIONS: { subject: string; label: string; icon: string }[] = [
  { subject: 'All', label: 'Semua Bidang (9 Mapel)', icon: '📚' },
  { subject: 'Kimia', label: 'Kimia', icon: '⚗️' },
  { subject: 'Biologi', label: 'Biologi', icon: '🧬' },
  { subject: 'Fisika', label: 'Fisika', icon: '⚡' },
  { subject: 'Matematika', label: 'Matematika', icon: '∑' },
  { subject: 'Informatika', label: 'Informatika', icon: '💻' },
  { subject: 'Astronomi', label: 'Astronomi', icon: '🔭' },
  { subject: 'Kebumian', label: 'Kebumian', icon: '🌍' },
  { subject: 'Ekonomi', label: 'Ekonomi', icon: '📈' },
  { subject: 'Geografi', label: 'Geografi', icon: '🗺️' },
];

export const GoogleScholarRepositoryView: React.FC<GoogleScholarRepositoryViewProps> = ({
  currentUser,
  onAddQuestionToBank,
  bimbinganSchedules = [],
  onAddQuestionsToSchedule,
}) => {
  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';
  const userFixedSubject = !isAdmin ? (currentUser.subject || 'Matematika') : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(userFixedSubject || 'All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('GS-KIM-01');
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  React.useEffect(() => {
    if (userFixedSubject) {
      setSelectedSubject(userFixedSubject);
    }
  }, [userFixedSubject]);

  const articles = searchScholarArticles({
    query: searchQuery,
    subject: selectedSubject,
    level: selectedLevel,
  });

  const handleImportQuestions = (article: ScholarArticle, targetScheduleId?: string) => {
    if (article.questions && article.questions.length > 0) {
      article.questions.forEach((q) => {
        onAddQuestionToBank({
          ...q,
          id: `SCHOLAR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          author: `${article.authors} (Google Scholar)`,
        });
      });

      if (targetScheduleId && onAddQuestionsToSchedule) {
        onAddQuestionsToSchedule(targetScheduleId, article.questions);
        setImportedNotice(
          `${article.questions.length} butir soal dari paper "${article.title.substring(0, 45)}..." berhasil diimpor ke Bank Soal & Jadwal Bimbingan!`
        );
      } else {
        setImportedNotice(
          `${article.questions.length} butir soal dari paper "${article.title.substring(0, 45)}..." berhasil diimpor ke Bank Soal SMAN 1 Pardasuka!`
        );
      }

      setTimeout(() => setImportedNotice(null), 4000);
    }
  };

  const handleOpenGoogleScholar = (query: string) => {
    const url = buildGoogleScholarUrl(query);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0e38] via-[#120826] to-[#0c0419] border border-purple-800/50 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-600/50 text-xs font-bold text-blue-200">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Google Scholar Research Bank Soal & Academic Repository</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Repositori Ilmiah Google Scholar{' '}
              <span className="bg-gradient-to-r from-blue-300 via-purple-200 to-amber-300 bg-clip-text text-transparent">
                Olimpiade Sains (OSN)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Koleksi bank soal tingkat lanjut yang dirujuk dari publikasi ilmiah, jurnal pendidikan sains terindeks
              Google Scholar & Garuda, serta tim pembina olimpiade nasional (TOKI, TOBI, TOFI, TOMI, TOAI, TOGI).
              {isStudent
                ? ' Siswa dapat mengkaji teori riset, membaca problem set, dan menelaah pembahasan ilmiah.'
                : ' Guru dapat langsung mengimpor butir soal ilmiah terverifikasi ke dalam Bank Soal dan Jadwal Bimbingan.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleOpenGoogleScholar(searchQuery || 'Olimpiade Sains Nasional Kimia Fisika Biologi')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Cari di Google Scholar Resmi</span>
            </button>
          </div>
        </div>

        {/* Notice Banner when imported */}
        {importedNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importedNotice}</span>
          </div>
        )}
      </div>

      {/* Filter & Live Search Toolbar */}
      <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari paper, materi, topik, rumus (contoh: Buffer, Stoikiometri, Lagrange, Diophantine)..."
              className="w-full bg-[#120924] border border-purple-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="md:col-span-4">
            {isAdmin ? (
              <select
                aria-label="Pilih Bidang Studi"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {OSN_SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.subject} value={opt.subject}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-[#120924] border border-cyan-700/60 rounded-xl px-3 py-2.5 text-xs text-cyan-200 font-bold flex items-center justify-between">
                <span>Bidang: {userFixedSubject}</span>
                <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-800">Terkunci Mapel</span>
              </div>
            )}
          </div>

          {/* Level Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Pilih Tingkat Kompetisi"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">Semua Tingkat</option>
              <option value="Kabupaten">OSN-K (Kabupaten)</option>
              <option value="Provinsi">OSN-P (Provinsi)</option>
              <option value="Nasional">OSN-N / Internasional</option>
            </select>
          </div>
        </div>

        {/* Quick Subject Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-purple-300 font-semibold shrink-0 mr-1">Rujukan Cepat:</span>
          {OSN_SUBJECT_OPTIONS.map((opt) => (
            <button
              key={opt.subject}
              onClick={() => setSelectedSubject(opt.subject)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium cursor-pointer ${
                selectedSubject === opt.subject
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40'
              }`}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Count & Result Header */}
      <div className="flex items-center justify-between text-xs text-purple-300 px-1">
        <span>
          Menampilkan <strong className="text-white">{articles.length}</strong> Arsip Publikasi & Bank Soal Terindeks
          Google Scholar
        </span>
        <span className="text-[11px] text-purple-400">
          Standar Silabus Pusat Prestasi Nasional (Puspresnas) & Olimpiade Internasional
        </span>
      </div>

      {/* Articles Listing */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="text-center py-12 bg-[#180e2f]/50 border border-purple-800/40 rounded-2xl p-6">
            <GraduationCap className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-white">Tidak Ada Publikasi yang Sesuai Kriteria</h3>
            <p className="text-xs text-purple-300/80 mt-1">
              Coba gunakan kata kunci pencarian yang lebih umum atau pilih "Semua Bidang".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedLevel('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          articles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            return (
              <div
                key={article.id}
                className="bg-[#180e2f]/90 border border-purple-800/50 rounded-2xl overflow-hidden shadow-lg hover:border-purple-600/60 transition-all"
              >
                {/* Article Header Card */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600/60">
                        {article.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
                        {article.level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-600/50">
                        {article.scholarId}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Quote className="w-3 h-3" /> {article.citationsCount} Sitasi Google Scholar
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {article.indexedIn.map((idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#110826] text-purple-300 border border-purple-800/60"
                        >
                          {idx}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title & Author Info */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white hover:text-purple-200 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-purple-300/90 mt-1 font-medium flex items-center gap-2">
                      <span>{article.authors}</span>
                      <span>•</span>
                      <span className="text-purple-400">{article.institution}</span>
                    </p>
                    <p className="text-[11px] text-purple-400/80 italic mt-0.5">
                      {article.journal} ({article.year})
                    </p>
                  </div>

                  {/* Abstract Text */}
                  <p className="text-xs text-slate-300/90 leading-relaxed bg-[#120826]/70 p-3.5 rounded-xl border border-purple-900/40">
                    <strong className="text-purple-300 block mb-1">Abstrak & Landasan Teori Ilmiah:</strong>
                    {article.abstractText}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-purple-400">Kata Kunci:</span>
                    {article.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/50 text-purple-200"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-900/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenGoogleScholar(article.scholarQuery)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-600/60 text-xs font-semibold transition-all cursor-pointer"
                        title="Buka pencarian publikasi di Google Scholar resmi"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span>Buka Sumber di Google Scholar</span>
                      </button>

                      {!isStudent && (
                        <button
                          onClick={() => handleImportQuestions(article)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-300" />
                          <span>+ Impor ke Bank Soal Sekolah ({article.questions.length} Soal)</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-bold transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {isExpanded ? 'Tutup Butir Soal' : `Lihat Butir Soal & Pembahasan (${article.questions.length})`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Questions & Scientific Discussions */}
                {isExpanded && (
                  <div className="bg-[#110722] border-t border-purple-900/60 p-5 sm:p-6 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Butir Soal Riset & Pembahasan Ilmiah Terstruktur ({article.subject})
                      </span>
                      <span className="text-[11px] text-purple-400">
                        Disusun oleh: {article.authors}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {article.questions.map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-5 space-y-4 shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-900/40">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-600/60 flex items-center justify-center text-xs font-bold text-amber-300">
                                {qIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-white">{q.topic}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-purple-300 font-semibold">
                                {q.bloomLevel}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-blue-300 font-semibold">
                                {q.soloLevel}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300 font-bold">
                                {q.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Question Text */}
                          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                            {q.questionText}
                          </p>

                          {/* Formula / Context */}
                          {q.formulaOrContext && (
                            <div className="p-2.5 rounded-lg bg-[#0e061c] border border-purple-900/60 text-[11px] text-amber-300/90 font-mono">
                              <strong>Landasan Rumus/Teorema:</strong> {q.formulaOrContext}
                            </div>
                          )}

                          {/* SVG Diagram if available */}
                          {q.diagramSvg && (
                            <div className="space-y-1.5 p-3 rounded-xl bg-[#0d051a] border border-purple-900/50">
                              <div
                                dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                                className="w-full flex justify-center"
                              />
                              {q.imageCaption && (
                                <p className="text-[10px] text-purple-300/70 text-center italic">
                                  {q.imageCaption}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Multiple Choice Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <p className="text-[11px] font-bold text-purple-300">Pilihan Jawaban:</p>
                              <div className="grid grid-cols-1 gap-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect = optIdx === q.correctAnswerIndex;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                                        isCorrect
                                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-bold'
                                          : 'bg-[#120826] border-purple-900/40 text-purple-200/80'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {isCorrect && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0 ml-2">
                                          KUNCI JAWABAN
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Detailed Scientific Explanation */}
                          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/60 space-y-2">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Pembahasan Ilmiah Langkah Demi Langkah ({article.subject}):
                            </span>
                            <div className="text-xs text-purple-100/90 whitespace-pre-line leading-relaxed font-sans">
                              {q.explanation}
                            </div>
                          </div>

                          {/* Single Import button for teachers */}
                          {!isStudent && (
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => {
                                  onAddQuestionToBank({
                                    ...q,
                                    id: `SCHOLAR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                    author: `${article.authors} (Google Scholar)`,
                                  });
                                  setImportedNotice(
                                    `Butir soal nomor ${qIdx + 1} (${q.topic}) berhasil diimpor ke Bank Soal SMAN 1 Pardasuka!`
                                  );
                                  setTimeout(() => setImportedNotice(null), 3000);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow cursor-pointer"
                              >
                                <BookmarkPlus className="w-3.5 h-3.5" />
                                <span>Impor Butir Ini ke Bank Soal</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
