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
  Key,
  Eye,
  EyeOff,
  Cpu,
  Zap,
  X,
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
} from '../types';
import { exportQuestionsToCsv, exportQuestionsToJson } from '../services/gasExport';
import { GoogleScholarRepositoryView } from './GoogleScholarRepositoryView';
import {
  generateOsnQuestions,
  getSavedGeminiApiKey,
  saveGeminiApiKey,
  getSavedGeminiEngine,
  saveGeminiEngine,
  getSavedReasoningLevel,
  saveReasoningLevel,
  ReasoningLevel,
} from '../services/aiQuestionService';

interface AiQuestionGeneratorProps {
  questions: Question[];
  onAddQuestion: (newQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  selectedSubjectDefault?: OsnSubject;
  bimbinganSchedules?: BimbinganSchedule[];
  onAddQuestionsToSchedule?: (scheduleId: string, questions: Question[]) => void;
  currentUser?: UserProfile;
}

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
  const [bloomTaxonomy, setBloomTaxonomy] = useState<BloomTaxonomy>('C4 (Menganalisis)');
  const [soloTaxonomy, setSoloTaxonomy] = useState<SoloTaxonomy>('Relational');
  const [topic, setTopic] = useState(
    DEFAULT_TOPICS_PER_SUBJECT[selectedSubjectDefault] || 'Aljabar, Teori Bilangan & Polinomial'
  );
  const [count, setCount] = useState<number>(2);
  const [questionType, setQuestionType] = useState<'pilihan_ganda' | 'esai' | 'bergambar'>('pilihan_ganda');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedList, setGeneratedList] = useState<Question[]>([]);
  const [generatorNotice, setGeneratorNotice] = useState<string | null>(null);

  // Engine, Reasoning Level, & Custom API Key states
  const [modelEngine, setModelEngine] = useState<string>(() => getSavedGeminiEngine());
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel>(() => getSavedReasoningLevel());
  const [customApiKey, setCustomApiKey] = useState<string>(() => getSavedGeminiApiKey());
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

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
        customPrompt,
        authorName: currentUser?.name || 'AI Pembina SMAN 1 Pardasuka',
        modelEngine,
        reasoningLevel,
        apiKey: customApiKey,
      });

      if (result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        setGeneratedList(result.questions);

        if (targetBimbinganId && onAddQuestionsToSchedule) {
          onAddQuestionsToSchedule(targetBimbinganId, result.questions);
          setGeneratorNotice(
            `Soal berhasil dirangkai menggunakan Engine ${modelEngine === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'} (Penalaran: ${reasoningLevel.toUpperCase()}) dan dikaitkan khusus ke Jadwal Bimbingan!`
          );
        } else {
          setGeneratorNotice(
            result.note || `Soal berhasil dirangkai dengan Engine ${modelEngine === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'} (Penalaran: ${reasoningLevel.toUpperCase()}) sesuai Taksonomi Bloom & SOLO.`
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'generate'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generator AI</span>
              </button>
              <button
                onClick={() => setActiveSubTab('bank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'bank'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bank Soal ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('scholar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'scholar'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Scholar Bank Soal</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveSubTab('analysis')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    effectiveSubTab === 'analysis'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Analisis Soal</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveSubTab('bank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'bank'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daftar Soal Terjadwal ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('scholar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'scholar'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Scholar Bank Soal</span>
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-300">
                AI Engine
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

              {/* Panel Engine AI Gemini, Penalaran & API Key */}
              <div className="p-3.5 rounded-xl bg-[#130926] border border-purple-700/60 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Engine AI & Penalaran (Reasoning)</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      modelEngine === 'gemini-4-argon'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-purple-950 text-purple-300 border-purple-700/60'
                    }`}
                  >
                    {modelEngine === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'}
                  </span>
                </div>

                {/* Engine Selector Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModelEngine('gemini-3.8-flash');
                      saveGeminiEngine('gemini-3.8-flash');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      modelEngine === 'gemini-3.8-flash'
                        ? 'bg-purple-600/90 border-purple-400 text-white shadow-md'
                        : 'bg-[#0f071d] border-purple-900/60 text-purple-300 hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Gemini 3.8 Flash</span>
                      {modelEngine === 'gemini-3.8-flash' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[10px] opacity-80">Standar & Cepat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModelEngine('gemini-4-argon');
                      saveGeminiEngine('gemini-4-argon');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      modelEngine === 'gemini-4-argon'
                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 border-cyan-300 text-white shadow-lg'
                        : 'bg-[#0f071d] border-purple-900/60 text-purple-300 hover:border-cyan-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <span>Gemini 4 Argon</span>
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      </span>
                      {modelEngine === 'gemini-4-argon' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[10px] opacity-80">Penalaran HOTS Mendalam</span>
                  </button>
                </div>

                {/* Tingkat Penalaran (Reasoning Level: Rendah, Sedang, Tinggi) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-purple-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Tingkat Penalaran (Reasoning):</span>
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold uppercase">
                      {reasoningLevel === 'rendah' ? 'Rendah' : reasoningLevel === 'tinggi' ? 'Tinggi' : 'Sedang'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['rendah', 'sedang', 'tinggi'] as ReasoningLevel[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => {
                          setReasoningLevel(r);
                          saveReasoningLevel(r);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-center border transition-all cursor-pointer capitalize ${
                          reasoningLevel === r
                            ? 'bg-gradient-to-r from-amber-600 to-purple-600 border-amber-400 text-white shadow'
                            : 'bg-[#100720] border-purple-900/60 text-purple-300 hover:border-purple-700'
                        }`}
                      >
                        {r === 'rendah' ? 'Rendah' : r === 'sedang' ? 'Sedang' : 'Tinggi'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-purple-300/70 leading-tight">
                    {reasoningLevel === 'rendah' && '• Rendah: Minim latensi, penyusunan soal lebih kilat.'}
                    {reasoningLevel === 'sedang' && '• Sedang (Seimbang): Kedalaman penalaran optimal untuk olimpiade sains.'}
                    {reasoningLevel === 'tinggi' && '• Tinggi (Maksimal): Penalaran analisis bertahap untuk soal HOTS dan dekomposisi mendalam.'}
                  </p>
                </div>

                {/* API Key Input Field */}
                <div className="pt-2 border-t border-purple-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-purple-200 flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-400" />
                      <span>Gemini API Key:</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        customApiKey
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                          : 'bg-purple-950 text-purple-300 border-purple-800/60'
                      }`}
                    >
                      {customApiKey ? 'Kunci Kustom Aktif' : 'Default Server Key'}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomApiKey(val);
                        saveGeminiApiKey(val);
                      }}
                      placeholder="Default server, atau masukkan AIzaSy..."
                      className="w-full bg-[#100720] border border-purple-700/60 rounded-xl pl-3 pr-16 py-1.5 text-white text-[11px] font-mono focus:ring-1 focus:ring-purple-400 focus:outline-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 text-purple-400 hover:text-white transition-colors cursor-pointer"
                        title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {customApiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomApiKey('');
                            saveGeminiApiKey('');
                          }}
                          className="p-1 text-purple-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Hapus Kunci Kustom"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-300/60 block">
                    {customApiKey
                      ? 'Menggunakan API Key kustom Anda (tersimpan aman di peramban).'
                      : 'Menggunakan API Key otomatis dari server (process.env.GEMINI_API_KEY).'}
                  </span>
                </div>
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

              {/* Tingkat Kompetisi */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Tingkat Kompetisi:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Kabupaten (OSN-K)', 'Provinsi (OSN-P)', 'Nasional (OSN-N)'] as CompetitionLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold text-center border transition-all cursor-pointer ${
                        level === lvl
                          ? 'bg-purple-600 border-purple-400 text-white shadow'
                          : 'bg-[#120924] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      {lvl.split(' ')[1] || lvl}
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
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" /> Hasil Penyusunan Butir Soal AI
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      modelEngine === 'gemini-4-argon'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-purple-950 text-purple-300 border-purple-700/60'
                    }`}
                  >
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>{modelEngine === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'}</span>
                    <span className="text-amber-400 font-semibold capitalize">• Penalaran: {reasoningLevel}</span>
                  </span>
                </div>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700/60">
                      Soal #{idx + 1} • {q.subject}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      {q.bloomLevel}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/50">
                      SOLO: {q.soloLevel}
                    </span>
                    <span className="text-[11px] font-medium text-amber-400">{q.level}</span>
                  </div>

                  <button
                    onClick={() => handleSaveToBank(q)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan
                  </button>
                </div>

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

                {/* Scientific Explanation Dropdown */}
                <div className="pt-3 border-t border-purple-900/40 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-purple-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pembahasan & Solusi Ilmiah:</span>
                  </div>
                  <p className="text-purple-200/80 leading-relaxed bg-[#120924]/40 p-2.5 rounded-lg border border-purple-900/30">
                    {q.explanation}
                  </p>
                  {q.hint && (
                    <div className="mt-1 text-[11px] text-amber-300 font-medium">
                      💡 <strong>Trik Cepat / Hint:</strong> {q.hint}
                    </div>
                  )}
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
          <div className="bg-[#180e2f]/80 border border-purple-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan teks soal, rumus, atau submateri..."
                className="w-full bg-[#120924] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Subject Filter */}
            {isAdmin ? (
              <select
                aria-label="Filter Berdasarkan Bidang OSN"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none cursor-pointer"
              >
                <option value="All">Semua Bidang OSN ({questions.length})</option>
                {OSN_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s} ({questions.filter((q) => q.subject === s).length})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#120924] border border-cyan-700/60 rounded-xl text-xs text-cyan-200 font-bold whitespace-nowrap">
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
              className="bg-[#120924] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Taksonomi Bloom</option>
              <option value="C1">C1 (Mengingat)</option>
              <option value="C2">C2 (Memahami)</option>
              <option value="C3">C3 (Mengaplikasikan)</option>
              <option value="C4">C4 (Menganalisis)</option>
              <option value="C5">C5 (Mengevaluasi)</option>
              <option value="C6">C6 (Menciptakan/HOTS)</option>
            </select>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportQuestionsToCsv(filteredQuestions)}
                title="Unduh format spreadsheet CSV"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportQuestionsToJson(filteredQuestions)}
                title="Unduh format JSON"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950 border border-purple-700/60 hover:bg-purple-900 text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700/60">
                      {q.id} • {q.subject}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                      {q.bloomLevel}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/50">
                      SOLO: {q.soloLevel}
                    </span>
                    <span className="text-[11px] font-medium text-amber-400">
                      Topik: {q.topic}
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
                  {q.options.map((opt, oIdx) => {
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

                <div className="pt-2 text-xs text-purple-300/80 bg-[#120924]/40 p-2.5 rounded-lg border border-purple-900/30">
                  <span className="font-bold text-amber-400 mr-1">Pembahasan:</span>
                  {q.explanation}
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
