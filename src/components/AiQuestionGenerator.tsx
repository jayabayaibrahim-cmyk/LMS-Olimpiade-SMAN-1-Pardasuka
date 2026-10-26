import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Filter,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  Brain,
  HelpCircle,
  Lightbulb,
  Layers,
  FileSpreadsheet,
  Check,
  Search,
  ExternalLink,
  Save,
  GraduationCap,
  Calendar,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { QuestionAnalysisView } from './QuestionAnalysisView';
import {
  Question,
  OsnSubject,
  BloomTaxonomy,
  SoloTaxonomy,
  CompetitionLevel,
  BimbinganSchedule,
  UserProfile,
  GeneratorMode,
  TargetGrade,
  QuestionDifficulty,
} from '../types';
import { exportQuestionsToCsv, exportQuestionsToJson } from '../services/gasExport';
import { GoogleScholarRepositoryView } from './GoogleScholarRepositoryView';
import { generateOsnQuestions } from '../services/aiQuestionService';
import {
  getSubjectAbbr,
  getCompetitionLevelAbbr,
  getBloomAbbr,
  getSoloAbbr,
  getGeneratorModeAbbr,
} from '../utils/abbreviations';

interface AiQuestionGeneratorProps {
  questions: Question[];
  onAddQuestion: (newQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  selectedSubjectDefault?: OsnSubject;
  bimbinganSchedules?: BimbinganSchedule[];
  onAddQuestionsToSchedule?: (scheduleId: string, questions: Question[]) => void;
  currentUser?: UserProfile;
}

const GENERATOR_MODES: { mode: GeneratorMode; label: string; desc: string }[] = [
  { mode: 'Mode A (Latihan Konsep)', label: 'Mode A — Latihan Konsep', desc: 'Penguatan konsep dasar materi' },
  { mode: 'Mode B (Seleksi Sekolah)', label: 'Mode B — Seleksi Sekolah', desc: 'Penjaringan peserta olimpiade sekolah' },
  { mode: 'Mode C (Seleksi Kabupaten/Kota)', label: 'Mode C — Seleksi Kab/Kota', desc: 'Penalaran mendalam & analitis (OSN-K)' },
  { mode: 'Mode D (Seleksi Provinsi)', label: 'Mode D — Seleksi Provinsi', desc: 'Integrasi konsep lanjutan multi-cabang (OSN-P)' },
  { mode: 'Mode E (Persiapan Nasional)', label: 'Mode E — Persiapan Nasional', desc: 'Soal menantang & nonrutin (OSN-N)' },
  { mode: 'Mode F (Simulasi Olimpiade)', label: 'Mode F — Simulasi Olimpiade', desc: 'Simulasi ujian dengan batas waktu & skor' },
  { mode: 'Mode G (Pembahasan Mendalam)', label: 'Mode G — Pembahasan Mendalam', desc: 'Solusi alternatif & pedagogi mendalam' },
  { mode: 'Mode H (Remedial & Pengayaan)', label: 'Mode H — Remedial & Pengayaan', desc: 'Penyesuaian kelemahan & akselerasi siswa' },
  { mode: 'Mode I (Bank Soal LMS)', label: 'Mode I — Bank Soal LMS', desc: 'Format data terstruktur siap CBT/LMS' },
];

const TARGET_GRADES: { value: TargetGrade; label: string }[] = [
  { value: 'X', label: 'Kelas X' },
  { value: 'XI', label: 'Kelas XI (Rekomendasi)' },
  { value: 'XII', label: 'Kelas XII' },
  { value: 'Campuran', label: 'Campuran (X, XI, XII)' },
];

const DIFFICULTY_OPTIONS: { value: QuestionDifficulty; label: string; desc: string }[] = [
  { value: 'Campuran', label: 'Campuran (Standar Master Prompt)', desc: '20% Dasar, 30% Menengah, 30% Sulit, 20% Sangat Sulit' },
  { value: 'Dasar', label: 'Dasar (Fondasi Konsep)', desc: 'Penguasaan konsep dan rumus fundamental' },
  { value: 'Menengah', label: 'Menengah (Aplikasi Konsep)', desc: 'Penerapan konsep pada variasi kasus baru' },
  { value: 'Sulit', label: 'Sulit (HOTS & Analisis)', desc: 'Integrasi beberapa konsep & dekomposisi sistem' },
  { value: 'Sangat Sulit', label: 'Sangat Sulit (Nonrutin)', desc: 'Pemecahan masalah tingkat tinggi' },
];

const OSN_SUBJECTS: OsnSubject[] = [
  'Matematika',
  'Fisika',
  'Biologi',
  'Kimia',
  'Informatika',
  'Astronomi',
  'Kebumian',
  'Ekonomi',
  'Geografi',
];

const DEFAULT_TOPICS_PER_SUBJECT: Record<OsnSubject, string> = {
  Matematika: 'Aljabar, Teori Bilangan & Polinomial',
  Fisika: 'Mekanika Klasik & Dinamika Rotasi',
  Kimia: 'Stoikiometri, Larutan Buffer & Termokimia',
  Biologi: 'Biologi Sel, Molekuler & Genetika Mendel',
  Informatika: 'Algoritma, Pemrograman Dinamis & Teori Graf',
  Astronomi: 'Hukum Kepler & Mekanika Benda Langit',
  Kebumian: 'Geologi Struktur & Lempeng Tektonik',
  Ekonomi: 'Mikroekonomi, Teori Permintaan & Elastisitas',
  Geografi: 'Klimatologi & Dinamika Atmosfer',
};

const TOPIC_SUGGESTIONS_PER_SUBJECT: Record<OsnSubject, string[]> = {
  Kimia: [
    'Stoikiometri & Larutan Buffer',
    'Kinetika Reaksi & Hukum Laju',
    'Kesetimbangan Kimia Le Chatelier',
    'Termokimia & Hukum Hess',
    'Kimia Organik & Benzena',
    'Elektrokimia & Sel Volta',
  ],
  Biologi: [
    'Biologi Sel & Kemiosmosis',
    'Genetika Mendel & Pindah Silang',
    'Fotosintesis & Fisiologi Tumbuhan',
    'Sistem Sirkulasi & Saraf Hewan',
    'Ekologi & Dinamika Populasi',
  ],
  Fisika: [
    'Mekanika Gerak & Rotasi Benda Tegar',
    'Termodinamika & Siklus Mesin Carnot',
    'Elektromagnetisme & Rangkaian RLC',
    'Gelombang, Bunyi & Optik Geometri',
  ],
  Matematika: [
    'Aljabar Polinomial & Identitas Gauss',
    'Teori Bilangan & Kongruensi Modulo',
    'Geometri Analitik & Teorema Stewart',
    'Kombinatorika & Prinsip Sarang Burung',
  ],
  Informatika: [
    'Dynamic Programming & Kadane',
    'Teori Graf & Shortest Path',
    'Struktur Data Tree & Segment Tree',
    'Kompleksitas Algoritma & Greedy',
  ],
  Astronomi: [
    'Hukum Kepler & Orbit Elips',
    'Modulus Jarak & Magnitudo Bintang',
    'Tata Koordinat Bola Langit',
    'Astrofisika Radiasi Stefan-Boltzmann',
  ],
  Kebumian: [
    'Lempeng Tektonik & Subduksi Wadati-Benioff',
    'Petrologi & Siklus Batuan',
    'Meteorologi & Sirkulasi Atmosfer',
    'Oseanografi & Gelombang Pasang Surut',
  ],
  Ekonomi: [
    'Elastisitas Permintaan & Penawaran',
    'Keseimbangan Pasar & Deadweight Loss',
    'Pendapatan Nasional & Multiplier Efek',
    'Kebijakan Moneter & Kurva Phillips',
  ],
  Geografi: [
    'Klimatologi & Fenomena ENSO / El Niño',
    'Geomorfologi Karst & Fluvial',
    'Penginderaan Jauh & Citra Satelit SIG',
    'Demografi & Transisi Penduduk',
  ],
};

const BLOOM_LEVELS: { level: BloomTaxonomy; desc: string; badge: string }[] = [
  { level: 'C1 (Mengingat)', desc: 'Mengingat definisi, simbol, tetapan, rumus dasar', badge: 'bg-slate-800 text-slate-300 border-slate-600' },
  { level: 'C2 (Memahami)', desc: 'Memahami prinsip, menerjemahkan data grafik, klasifikasi konsep', badge: 'bg-blue-950 text-blue-300 border-blue-700' },
  { level: 'C3 (Mengaplikasikan)', desc: 'Menghitung bertahap, menerapkan rumus pada variasi kasus baru', badge: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
  { level: 'C4 (Menganalisis)', desc: 'Dekomposisi fenomena kompleks, relasi antar variabel olimpiade', badge: 'bg-purple-950 text-purple-300 border-purple-700' },
  { level: 'C5 (Mengevaluasi)', desc: 'Menilai hipotesis, menimbang metode paling efisien, optimasi', badge: 'bg-amber-950 text-amber-300 border-amber-700' },
  { level: 'C6 (Menciptakan/HOTS)', desc: 'Sintesis konsep lintas bab, membuat model pemecahan masalah orisinal', badge: 'bg-rose-950 text-rose-300 border-rose-700' },
];

const SOLO_LEVELS: { level: SoloTaxonomy; desc: string }[] = [
  { level: 'Unistructural', desc: 'Fokus pada satu aspek data/informasi tunggal' },
  { level: 'Multistructural', desc: 'Melibatkan beberapa aspek independen tanpa menghubungkan secara mendalam' },
  { level: 'Relational', desc: 'Mengintegrasikan hubungan sebab-akibat antar konsep membentuk struktur utuh' },
  { level: 'Extended Abstract', desc: 'Generalisasi konsep ke domain abstrak atau kasus ekstrem baru' },
];

export const AiQuestionGenerator: React.FC<AiQuestionGeneratorProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  selectedSubjectDefault = 'Matematika',
  bimbinganSchedules = [],
  onAddQuestionsToSchedule,
  currentUser,
}) => {
  const isStudent = currentUser?.role === 'student';
  const [activeSubTab, setActiveSubTab] = useState<'generate' | 'bank' | 'scholar' | 'analysis'>(
    isStudent ? 'bank' : 'generate'
  );

  // Generator form state
  const [subject, setSubject] = useState<OsnSubject>(selectedSubjectDefault);
  const [level, setLevel] = useState<CompetitionLevel>('Kabupaten (OSN-K)');
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>('Mode C (Seleksi Kabupaten/Kota)');
  const [targetClass, setTargetClass] = useState<TargetGrade>('XI');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Campuran');
  const [bloomTaxonomy, setBloomTaxonomy] = useState<BloomTaxonomy>('C4 (Menganalisis)');
  const [soloTaxonomy, setSoloTaxonomy] = useState<SoloTaxonomy>('Relational');
  const [topic, setTopic] = useState(
    DEFAULT_TOPICS_PER_SUBJECT[selectedSubjectDefault] || 'Aljabar, Teori Bilangan & Polinomial'
  );
  const [count, setCount] = useState<number>(2);
  const [questionType, setQuestionType] = useState<'pilihan_ganda' | 'esai' | 'bergambar' | string>('pilihan_ganda');
  const [reasoningLevel, setReasoningLevel] = useState<'standar' | 'sedang' | 'tinggi'>('tinggi');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedList, setGeneratedList] = useState<Question[]>([]);
  const [generatorNotice, setGeneratorNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSubjectDefault) {
      setSubject(selectedSubjectDefault);
      setTopic(
        DEFAULT_TOPICS_PER_SUBJECT[selectedSubjectDefault] || 'Aljabar, Teori Bilangan & Polinomial'
      );
    }
  }, [selectedSubjectDefault]);

  // Bank Soal Filter state
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterBloom, setFilterBloom] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Target Bimbingan Schedule Link
  const [targetBimbinganId, setTargetBimbinganId] = useState<string>(
    bimbinganSchedules && bimbinganSchedules.length > 0 ? bimbinganSchedules[0].id : ''
  );

  const isAdmin = currentUser?.role === 'admin';
  const userAssignedSubject: OsnSubject = currentUser?.subject || 'Matematika';

  useEffect(() => {
    if (!isAdmin && currentUser?.subject) {
      setSubject(currentUser.subject);
      setTopic(
        DEFAULT_TOPICS_PER_SUBJECT[currentUser.subject] || 'Aljabar, Teori Bilangan & Polinomial'
      );
    }
  }, [isAdmin, currentUser?.subject]);

  useEffect(() => {
    if (isStudent && activeSubTab === 'generate') {
      setActiveSubTab('bank');
    }
    if (!isAdmin && activeSubTab === 'analysis') {
      setActiveSubTab(isStudent ? 'bank' : 'generate');
    }
  }, [isStudent, isAdmin, activeSubTab]);

  const effectiveSubTab =
    isStudent && activeSubTab === 'generate'
      ? 'bank'
      : !isAdmin && activeSubTab === 'analysis'
      ? isStudent
        ? 'bank'
        : 'generate'
      : activeSubTab;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratorNotice(null);

    try {
      const result = await generateOsnQuestions({
        subject,
        level,
        bloomTaxonomy,
        soloTaxonomy,
        count,
        topic,
        questionType,
        reasoningLevel: reasoningLevel === 'tinggi' ? 'high' : reasoningLevel === 'standar' ? 'low' : 'medium',
        customPrompt,
        authorName: currentUser?.name || 'AI Pembina SMAN 1 Pardasuka',
        existingQuestions: questions,
        targetClass,
        generatorMode,
        difficulty,
        schoolName: 'SMAN 1 Pardasuka',
      });

      if (result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        setGeneratedList(result.questions);

        // Otomatis simpan seluruh butir soal hasil generate ke Bank Soal Sekolah
        result.questions.forEach((q) => onAddQuestion(q));

        if (targetBimbinganId && onAddQuestionsToSchedule) {
          onAddQuestionsToSchedule(targetBimbinganId, result.questions);
          setGeneratorNotice(
            `✓ Sukses merangkai ${result.questions.length} butir soal ${subject}! Soal otomatis tersimpan ke Bank Soal Sekolah & ditautkan ke Jadwal Bimbingan.`
          );
        } else {
          setGeneratorNotice(
            `✓ Sukses merangkai ${result.questions.length} butir soal ${subject}! Seluruh butir soal telah otomatis tersimpan ke Bank Soal & siap dipilih saat membuat Paket Ujian CBT.`
          );
        }
      } else {
        setGeneratorNotice('Gagal merangkai soal. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setGeneratorNotice('Terjadi kendala saat merangkai soal. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBank = (q: Question) => {
    onAddQuestion(q);
    setSavedSuccessId(q.id);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  const availableBimbinganSchedules = !isAdmin
    ? bimbinganSchedules.filter((b) => b.subject === userAssignedSubject)
    : bimbinganSchedules;

  const filteredQuestions = questions.filter((q) => {
    const matchSubject = !isAdmin
      ? q.subject === userAssignedSubject
      : filterSubject === 'All' || q.subject === filterSubject;
    const matchBloom = filterBloom === 'All' || q.bloomLevel.startsWith(filterBloom);
    const matchSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchBloom && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            {isStudent
              ? 'Bank Soal Pembinaan & Hasil Generate Terjadwal'
              : 'Generator Soal AI (Bloom & SOLO) & Bank Soal'}
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            {isStudent
              ? 'Koleksi butir soal, diagram skematis, dan kunci pembahasan ilmiah yang diagendakan oleh Guru Pembina SMAN 1 Pardasuka.'
              : 'Penyusunan butir soal olimpiade sains terkalibrasi Taksonomi Bloom (C1-C6) dan SOLO SMAN 1 Pardasuka.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-[#190d33] p-1 rounded-xl border border-purple-800/60 self-start sm:self-auto">
          {!isStudent ? (
            <>
              <button
                onClick={() => setActiveSubTab('generate')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  effectiveSubTab === 'generate'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="sm:hidden">Generator</span>
                <span className="hidden sm:inline">Generator AI</span>
              </button>
              <button
                onClick={() => setActiveSubTab('bank')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  effectiveSubTab === 'bank'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="sm:hidden">Bank ({questions.length})</span>
                <span className="hidden sm:inline">Bank Soal ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('scholar')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  effectiveSubTab === 'scholar'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="sm:hidden">Scholar</span>
                <span className="hidden sm:inline">Google Scholar</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveSubTab('analysis')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    effectiveSubTab === 'analysis'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="sm:hidden">Analisis</span>
                  <span className="hidden sm:inline">Analisis Soal</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveSubTab('bank')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  effectiveSubTab === 'bank'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="sm:hidden">Soal ({questions.length})</span>
                <span className="hidden sm:inline">Soal Terjadwal ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('scholar')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  effectiveSubTab === 'scholar'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="sm:hidden">Scholar</span>
                <span className="hidden sm:inline">Google Scholar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tab 1: GENERATOR AI (Khusus Guru / Admin) */}
      {!isStudent && effectiveSubTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Settings (Left Column) */}
          <div className="lg:col-span-5 bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Parameter Penyusunan Soal
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-amber-500/50 text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Gemini 3.8 Flash • Penalaran Sedang
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              {/* Note about Bimbingan vs CBT */}
              <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-200 text-[11px] space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Khusus Penyusunan Soal Bimbingan
                </span>
                <p className="text-purple-300/80 leading-normal">
                  Generator AI ini dikhususkan untuk merangkai bahan kajian & latihan pada Jadwal Bimbingan (Bukan untuk CBT). Soal Ujian CBT disusun oleh Guru saat menjadwalkan Ujian CBT.
                </p>
              </div>

              {/* Destination: Bimbingan Schedule */}
              {availableBimbinganSchedules && availableBimbinganSchedules.length > 0 && (
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">
                    Kaitkan ke Jadwal Bimbingan:
                  </label>
                  <select
                    aria-label="Pilih Jadwal Bimbingan Tujuan"
                    value={targetBimbinganId}
                    onChange={(e) => {
                      setTargetBimbinganId(e.target.value);
                      const matched = availableBimbinganSchedules.find((b) => b.id === e.target.value);
                      if (matched) {
                        setSubject(matched.subject);
                        setTopic(matched.topic);
                        setBloomTaxonomy(matched.targetBloom);
                        setSoloTaxonomy(matched.targetSolo);
                      }
                    }}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                  >
                    <option value="">Simpan ke Bank Soal Umum Saja</option>
                    {availableBimbinganSchedules.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.subject} - {b.title} ({b.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bidang OSN */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Bidang Olimpiade Sains:</label>
                {isAdmin ? (
                  <select
                    aria-label="Pilih Bidang Olimpiade Sains"
                    value={subject}
                    onChange={(e) => {
                      const newSub = e.target.value as OsnSubject;
                      setSubject(newSub);
                      setTopic(DEFAULT_TOPICS_PER_SUBJECT[newSub] || '');
                    }}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {OSN_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-[#120924] border border-cyan-700/60 rounded-xl px-3 py-2 text-cyan-200 text-xs font-bold flex items-center justify-between">
                    <span>{userAssignedSubject}</span>
                    <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-800">Terkunci Mapel Guru</span>
                  </div>
                )}
              </div>

              {/* Mode Generator OSN (Mode A - I Master Prompt) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-purple-200">Mode Generator OSN:</label>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                    Master Prompt A–I
                  </span>
                </div>
                <select
                  aria-label="Pilih Mode Generator OSN"
                  value={generatorMode}
                  onChange={(e) => setGeneratorMode(e.target.value as GeneratorMode)}
                  className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {GENERATOR_MODES.map((m) => (
                    <option key={m.mode} value={m.mode}>
                      {m.label} ({m.desc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Kelas Sasaran & Tingkat Kesulitan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Kelas Sasaran:</label>
                  <select
                    aria-label="Pilih Kelas Sasaran"
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value as TargetGrade)}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {TARGET_GRADES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Tingkat Kesulitan:</label>
                  <select
                    aria-label="Pilih Tingkat Kesulitan"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tingkat Kompetisi */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Tingkat Kompetisi:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Sekolah', 'Kabupaten (OSN-K)', 'Provinsi (OSN-P)', 'Nasional (OSN-N)'] as CompetitionLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-center border transition-all cursor-pointer truncate ${
                        level === lvl
                          ? 'bg-purple-600 border-purple-400 text-white shadow'
                          : 'bg-[#120924] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      {getCompetitionLevelAbbr(lvl)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Taksonomi Bloom (C1-C6) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-purple-200">Target Taksonomi Bloom:</label>
                  <span className="text-[10px] text-amber-400 font-medium">HOTS / Kognitif</span>
                </div>
                <select
                  aria-label="Pilih Target Taksonomi Bloom"
                  value={bloomTaxonomy}
                  onChange={(e) => setBloomTaxonomy(e.target.value as BloomTaxonomy)}
                  className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {BLOOM_LEVELS.map((b) => (
                    <option key={b.level} value={b.level}>
                      {b.level} - {b.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Taksonomi SOLO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-purple-200">Target Taksonomi SOLO:</label>
                  <span className="text-[10px] text-purple-400 font-medium">Struktur Hasil Belajar</span>
                </div>
                <select
                  aria-label="Pilih Target Taksonomi SOLO"
                  value={soloTaxonomy}
                  onChange={(e) => setSoloTaxonomy(e.target.value as SoloTaxonomy)}
                  className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {SOLO_LEVELS.map((s) => (
                    <option key={s.level} value={s.level}>
                      {s.level} ({s.desc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topik / Submateri */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-200">Topik / Submateri Spesifik:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`Materi ${subject}...`}
                  className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {TOPIC_SUGGESTIONS_PER_SUBJECT[subject] && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-purple-400/90 font-medium mr-1">Rekomendasi Topik {subject}:</span>
                    {TOPIC_SUGGESTIONS_PER_SUBJECT[subject].map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setTopic(sug)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                          topic === sug
                            ? 'bg-purple-600 text-white border-purple-400 font-bold shadow'
                            : 'bg-purple-950/70 hover:bg-purple-900 text-purple-300 border-purple-800/60'
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Jumlah Soal & Catatan Tambahan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Jumlah Butir Soal:</label>
                  <select
                    aria-label="Pilih Jumlah Butir Soal"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                  >
                    <option value={1}>1 Butir Soal</option>
                    <option value={2}>2 Butir Soal</option>
                    <option value={3}>3 Butir Soal</option>
                    <option value={5}>5 Butir Soal (Standar)</option>
                    <option value={8}>8 Butir Soal</option>
                    <option value={10}>10 Butir Soal (Banyak)</option>
                    <option value={15}>15 Butir Soal (Lengkap)</option>
                    <option value={20}>20 Butir Soal (Paket Akbar)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Tipe / Format Soal:</label>
                  <select
                    aria-label="Pilih Format Soal"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as 'pilihan_ganda' | 'esai' | 'bergambar')}
                    className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda (PG 5 Opsi)</option>
                    <option value="esai">Esai (Uraian & Rubrik)</option>
                    <option value="bergambar">Soal Bergambar (Diagram SVG)</option>
                  </select>
                </div>
              </div>

              {/* Mode Penalaran Gemini (Tinggi / High Reasoning Sesuai API Key) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-purple-200">Engine AI & Mode Penalaran:</label>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/50">
                    Gemini AI • Penalaran Tinggi (High)
                  </span>
                </div>
                <select
                  aria-label="Pilih Mode Penalaran Gemini"
                  value={reasoningLevel}
                  onChange={(e) => setReasoningLevel(e.target.value as 'standar' | 'sedang' | 'tinggi')}
                  className="w-full bg-[#120924] border border-amber-600/60 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="tinggi">🔬 Penalaran Tinggi (Gemini High Reasoning / ThinkingLevel.HIGH — Terintegrasi Sesuai API Key)</option>
                  <option value="sedang">🧠 Penalaran Sedang (Gemini Balanced Reasoning 2048)</option>
                  <option value="standar">⚡ Penalaran Cepat (Flash Standard Mode)</option>
                </select>
              </div>

              {/* Catatan Instruksi Khusus */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Instruksi Khusus (Opsional):</label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Misal: Buat soal studi kasus kontekstual, sertakan grafik fungsi atau jebakan konsep..."
                  className="w-full bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI Menyusun Soal Bloom & SOLO...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Soal AI Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Results Area (Right Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" /> Hasil Penyusunan Butir Soal AI
                </h3>
                <p className="text-xs text-purple-300/70">
                  Review butir soal, periksa pembahasan, lalu simpan ke Bank Soal Sekolah
                </p>
              </div>
              {generatedList.length > 0 && (
                <button
                  onClick={() => {
                    generatedList.forEach((q) => onAddQuestion(q));
                    setSavedSuccessId('all');
                    setTimeout(() => setSavedSuccessId(null), 3000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Semua ke Bank
                </button>
              )}
            </div>

            {generatorNotice && (
              <div className="bg-purple-950/70 border border-purple-700/60 rounded-xl p-3 text-xs text-purple-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{generatorNotice}</span>
              </div>
            )}

            {savedSuccessId && (
              <div className="bg-emerald-950/80 border border-emerald-600 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2 animate-bounce">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {savedSuccessId === 'all'
                    ? 'Semua soal berhasil disimpan ke Bank Soal SMAN 1 Pardasuka!'
                    : 'Butir soal berhasil ditambahkan ke Bank Soal!'}
                </span>
              </div>
            )}

            {/* If no questions generated yet */}
            {generatedList.length === 0 && !isLoading && (
              <div className="rounded-2xl border border-dashed border-purple-800/60 bg-[#140b28]/60 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center mx-auto text-amber-400">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Soal yang Di-generate</h4>
                <p className="text-xs text-purple-300/70 max-w-md mx-auto leading-relaxed">
                  Tentukan bidang OSN, taksonomi kognitif Bloom (C1-C6), dan tingkat SOLO di panel kiri,
                  lalu tekan tombol <strong>Generate Soal AI Sekarang</strong>.
                </p>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="bg-[#180e2f]/80 border border-purple-800/40 rounded-2xl p-5 space-y-3 animate-pulse"
                  >
                    <div className="h-4 bg-purple-900/50 rounded w-1/3" />
                    <div className="h-16 bg-purple-900/30 rounded w-full" />
                    <div className="space-y-2">
                      <div className="h-6 bg-purple-900/40 rounded w-2/3" />
                      <div className="h-6 bg-purple-900/40 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render Generated Questions */}
            {generatedList.map((q, idx) => (
              <div
                key={q.id}
                className="bg-[#180e2f]/90 border border-purple-800/50 hover:border-purple-600/60 rounded-2xl p-5 space-y-4 shadow-lg transition-all"
              >
                {/* Header Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700/60">
                      Soal #{idx + 1} • {q.subject}
                    </span>
                    {q.targetClass && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                        Kelas {q.targetClass}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/50">
                        {q.difficulty}
                      </span>
                    )}
                    {q.competitionMode && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
                        {getGeneratorModeAbbr(q.competitionMode)}
                      </span>
                    )}
                    <span className="font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      {getBloomAbbr(q.bloomLevel)}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/50">
                      SOLO: {getSoloAbbr(q.soloLevel)}
                    </span>
                    <span className="text-[11px] font-medium text-amber-400">
                      {getCompetitionLevelAbbr(q.level)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveToBank(q)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan
                  </button>
                </div>

                {/* Indikator Kompetensi jika ada */}
                {q.indicator && (
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/40 text-[11px] text-purple-200 flex items-start gap-1.5">
                    <span className="font-bold text-indigo-300 shrink-0">Indikator:</span>
                    <span className="leading-relaxed">{q.indicator}</span>
                  </div>
                )}

                {/* Question Body */}
                <div className="text-sm font-medium text-slate-100 leading-relaxed">
                  {q.questionText}
                </div>

                {/* Formula or Context Snippet if exists */}
                {q.formulaOrContext && (
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-700/50 font-mono text-xs text-amber-300">
                    <span className="text-purple-400 font-sans block text-[10px] uppercase font-bold mb-0.5">
                      Formula / Konteks Terkait:
                    </span>
                    {q.formulaOrContext}
                  </div>
                )}

                {/* Diagram / Gambar SVG jika ada */}
                {q.diagramSvg && (
                  <div className="p-3 rounded-xl bg-[#0e061a] border border-purple-800/60 space-y-2">
                    <div
                      className="w-full max-h-56 overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:max-h-52 [&>svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                    />
                    {q.imageCaption && (
                      <p className="text-[11px] text-center text-purple-300 font-medium italic">
                        {q.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* 5 Options (A, B, C, D, E) untuk PG & Bergambar */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl flex items-center justify-between border ${
                            isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-semibold'
                              : 'bg-[#120924]/60 border-purple-900/40 text-purple-200'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Kunci Jawaban
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rubrik & Kunci Jawaban jika tipe Esai */}
                {q.sampleEssayAnswer && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-2 text-xs">
                    <span className="font-bold text-amber-300 block">Kunci Solusi Jawaban Esai:</span>
                    <p className="text-purple-200/90 whitespace-pre-line leading-relaxed font-sans">
                      {q.sampleEssayAnswer}
                    </p>
                    {q.rubricOrKeyPoints && q.rubricOrKeyPoints.length > 0 && (
                      <div className="pt-2 border-t border-purple-900/50 space-y-1">
                        <span className="font-semibold text-purple-300 block text-[11px]">
                          Kriteria & Rubrik Penilaian:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-purple-200/80 space-y-0.5">
                          {q.rubricOrKeyPoints.map((rubric, rIdx) => (
                            <li key={rIdx}>{rubric}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Konsep atau Rumus Utama */}
                {q.mainConcept && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-xs text-emerald-200 space-y-0.5">
                    <span className="font-bold text-emerald-400 block text-[10px] uppercase">
                      Konsep atau Rumus Utama:
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300/90">{q.mainConcept}</span>
                  </div>
                )}

                {/* Kesalahan Umum yang Perlu Dihindari (Miskonsepsi) */}
                {q.commonMistakes && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 space-y-0.5">
                    <span className="font-bold text-amber-300 block text-[10px] uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Kesalahan Umum yang Perlu Dihindari (Miskonsepsi):
                    </span>
                    <span className="text-[11px] text-amber-200/90 leading-relaxed block">{q.commonMistakes}</span>
                  </div>
                )}

                {/* Metadata Orisinalitas & Variasi Penalaran (Anti-Duplikasi) */}
                {(q.noveltySummary || q.problemStructure || q.reasoningMethod) && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-700/40 text-xs text-cyan-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-cyan-300">
                      <span>Orisinalitas & Variasi Penalaran:</span>
                      <span className="text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                        {q.similarityStatus === 'verified_unique' ? '✓ Terverifikasi Unik' : '✓ Non-Duplikat'}
                      </span>
                    </div>
                    {q.noveltySummary && (
                      <p className="text-[11px] text-cyan-100/90 leading-relaxed font-sans">
                        {q.noveltySummary}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-cyan-300/80 font-mono">
                      {q.problemStructure && (
                        <span className="bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                          Model: {q.problemStructure}
                        </span>
                      )}
                      {q.reasoningMethod && (
                        <span className="bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                          Strategi: {q.reasoningMethod}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Scientific Explanation Dropdown */}
                <div className="pt-3 border-t border-purple-900/40 text-xs space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-purple-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pembahasan Langkah demi Langkah:</span>
                  </div>
                  <p className="text-purple-200/80 leading-relaxed bg-[#120924]/40 p-2.5 rounded-lg border border-purple-900/30 whitespace-pre-line">
                    {q.explanation}
                  </p>
                  {q.hint && (
                    <div className="mt-1 text-[11px] text-amber-300 font-medium">
                      💡 <strong>Trik Cepat / Hint:</strong> {q.hint}
                    </div>
                  )}

                  {/* Metadata Ringkas (Waktu, Skor, Referensi) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-purple-300/70">
                    {q.estimatedMinutes && (
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800/50">
                        ⏱️ Estimasi: {q.estimatedMinutes} Menit
                      </span>
                    )}
                    {q.maxScore && (
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800/50 text-amber-300">
                        ⭐ Skor Maks: {q.maxScore}
                      </span>
                    )}
                    {q.referenceSource && (
                      <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800/50 truncate max-w-full">
                        📚 Referensi: {q.referenceSource}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 2: BANK SOAL TERKALIBRASI */}
      {effectiveSubTab === 'bank' && (
        <div className="space-y-5">
          {/* Advisory banner for student */}
          {isStudent && (
            <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-700/60 flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center text-amber-300 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Akses Siswa: Bank Soal Terjadwal dari Guru Pembina
                </span>
                <p className="text-purple-300/80 mt-0.5">
                  Pembuatan dan generate soal dilakukan secara eksklusif oleh Guru Pembina saat menyusun agenda bimbingan. Di halaman ini, Anda dapat mempelajari seluruh materi soal olimpiade, diagram visual, serta pembahasan lengkap yang telah diagendakan.
                </p>
              </div>
            </div>
          )}

          {/* Controls Bar: Search, Filters, and Export Actions */}
          <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan teks soal, rumus, atau submateri..."
                className="w-full bg-[#120924] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Subject Filter */}
              {isAdmin ? (
                <select
                  aria-label="Filter Berdasarkan Bidang OSN"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-[#120924] border border-purple-700/60 rounded-xl px-2.5 sm:px-3 py-2 text-xs text-purple-200 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
                >
                  <option value="All">Semua Bidang ({questions.length})</option>
                  {OSN_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s} ({questions.filter((q) => q.subject === s).length})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-2 bg-[#120924] border border-cyan-700/60 rounded-xl text-xs text-cyan-200 font-bold whitespace-nowrap">
                  <span>Mapel: {userAssignedSubject}</span>
                  <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800">
                    {filteredQuestions.length} Soal
                  </span>
                </div>
              )}

              {/* Bloom Filter */}
              <select
                aria-label="Filter Berdasarkan Taksonomi Bloom"
                value={filterBloom}
                onChange={(e) => setFilterBloom(e.target.value)}
                className="bg-[#120924] border border-purple-700/60 rounded-xl px-2.5 sm:px-3 py-2 text-xs text-purple-200 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none truncate"
              >
                <option value="All">Semua Bloom</option>
                <option value="C1">C1 (Mengingat)</option>
                <option value="C2">C2 (Memahami)</option>
                <option value="C3">C3 (Mengaplikasikan)</option>
                <option value="C4">C4 (Menganalisis)</option>
                <option value="C5">C5 (Mengevaluasi)</option>
                <option value="C6">C6 (Menciptakan/HOTS)</option>
              </select>

              {/* Export Buttons */}
              <button
                onClick={() => exportQuestionsToCsv(filteredQuestions)}
                title="Unduh format spreadsheet CSV"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="sm:hidden">CSV</span>
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={() => exportQuestionsToJson(filteredQuestions)}
                title="Unduh format JSON"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Question List Count Summary */}
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>
              Menampilkan <strong>{filteredQuestions.length}</strong> dari total {questions.length} butir soal terstandar
            </span>
          </div>

          {/* Questions Grid */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-[#180e2f]/85 border border-purple-800/40 hover:border-purple-600/50 rounded-2xl p-5 space-y-3 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700/60">
                      {q.id} • {q.subject}
                    </span>
                    {q.targetClass && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                        Kelas {q.targetClass}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/50">
                        {q.difficulty}
                      </span>
                    )}
                    {q.competitionMode && (
                      <span className="font-semibold px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
                        {getGeneratorModeAbbr(q.competitionMode)}
                      </span>
                    )}
                    <span className="font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      {getBloomAbbr(q.bloomLevel)}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/50">
                      SOLO: {getSoloAbbr(q.soloLevel)}
                    </span>
                    <span className="text-[11px] font-medium text-amber-400">
                      {getCompetitionLevelAbbr(q.level)} • {q.topic}
                    </span>
                  </div>

                  {!isStudent && (
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      title="Hapus butir soal"
                      className="p-1.5 text-purple-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Indikator Kompetensi jika ada */}
                {q.indicator && (
                  <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/40 text-[11px] text-purple-200 flex items-start gap-1.5">
                    <span className="font-bold text-indigo-300 shrink-0">Indikator:</span>
                    <span className="leading-relaxed">{q.indicator}</span>
                  </div>
                )}

                <div className="text-sm font-medium text-white leading-relaxed">
                  {q.questionText}
                </div>

                {q.formulaOrContext && (
                  <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-800/40 font-mono text-xs text-amber-300">
                    {q.formulaOrContext}
                  </div>
                )}

                {/* Diagram SVG jika ada */}
                {q.diagramSvg && (
                  <div className="p-3 rounded-xl bg-[#0e061a] border border-purple-800/60 space-y-1">
                    <div
                      className="max-h-52 overflow-hidden flex items-center justify-center [&>svg]:max-h-48 [&>svg]:w-auto [&>svg]:max-w-full"
                      dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                    />
                    {q.imageCaption && (
                      <p className="text-[11px] text-purple-300/80 italic text-center">
                        {q.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Solusi Esai jika ada */}
                {q.sampleEssayAnswer && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1 text-xs">
                    <span className="font-bold text-amber-300 block">Kunci Solusi Esai:</span>
                    <p className="text-purple-200/90 whitespace-pre-line leading-relaxed">
                      {q.sampleEssayAnswer}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                  {q.options &&
                    q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl border truncate ${
                            isCorrect
                              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 font-bold'
                              : 'bg-[#120924]/60 border-purple-900/40 text-purple-200/80'
                          }`}
                          title={opt}
                        >
                          {opt}
                        </div>
                      );
                    })}
                </div>

                {/* Konsep atau Rumus Utama */}
                {q.mainConcept && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-xs text-emerald-200 space-y-0.5">
                    <span className="font-bold text-emerald-400 block text-[10px] uppercase">
                      Konsep atau Rumus Utama:
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300/90">{q.mainConcept}</span>
                  </div>
                )}

                {/* Kesalahan Umum yang Perlu Dihindari (Miskonsepsi) */}
                {q.commonMistakes && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 space-y-0.5">
                    <span className="font-bold text-amber-300 block text-[10px] uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Kesalahan Umum yang Perlu Dihindari:
                    </span>
                    <span className="text-[11px] text-amber-200/90 leading-relaxed block">{q.commonMistakes}</span>
                  </div>
                )}

                <div className="pt-2 text-xs text-purple-300/80 bg-[#120924]/40 p-2.5 rounded-lg border border-purple-900/30 space-y-1">
                  <div>
                    <span className="font-bold text-amber-400 mr-1">Pembahasan:</span>
                    <span className="whitespace-pre-line leading-relaxed">{q.explanation}</span>
                  </div>
                  {q.hint && (
                    <div className="text-[11px] text-amber-300 font-medium">
                      💡 <strong>Hint:</strong> {q.hint}
                    </div>
                  )}
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-purple-300/70">
                    {q.estimatedMinutes && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800/50">
                        ⏱️ {q.estimatedMinutes} Menit
                      </span>
                    )}
                    {q.maxScore && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800/50 text-amber-300">
                        ⭐ Skor: {q.maxScore}
                      </span>
                    )}
                    {q.referenceSource && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800/50 truncate max-w-full">
                        📚 {q.referenceSource}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: GOOGLE SCHOLAR BANK SOAL REPOSITORY (Dapat Diakses Guru & Siswa) */}
      {effectiveSubTab === 'scholar' && (
        <GoogleScholarRepositoryView
          currentUser={
            currentUser || {
              id: 'GUEST',
              name: 'Tamu SMAN 1 Pardasuka',
              role: 'student',
              nisnOrNip: '',
              deviceToken: '',
              deviceName: '',
              isDeviceLocked: false,
            }
          }
          onAddQuestionToBank={onAddQuestion}
          bimbinganSchedules={bimbinganSchedules}
          onAddQuestionsToSchedule={onAddQuestionsToSchedule}
        />
      )}

      {/* Sub-tab 4: ANALISIS BUTIR SOAL & DIAGNOSTIK KOGNITIF (Khusus Admin Sekolah) */}
      {effectiveSubTab === 'analysis' && isAdmin && (
        <QuestionAnalysisView
          questions={questions}
          exams={[]}
          examResults={[]}
          currentUser={
            currentUser || {
              id: 'TEACHER',
              name: 'Drs. Ahmad Subarjo, M.Pd.',
              role: 'teacher',
              nisnOrNip: '',
              deviceToken: '',
              deviceName: '',
              isDeviceLocked: false,
            }
          }
        />
      )}
    </div>
  );
};
