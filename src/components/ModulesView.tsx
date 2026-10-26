import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Atom,
  Binary,
  Compass,
  FileText,
  Plus,
  X,
  Image as ImageIcon,
  PenTool,
  CheckSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Printer,
} from 'lucide-react';
import {
  OsnModule,
  OsnSubject,
  Question,
  UserProfile,
  BloomTaxonomy,
  SoloTaxonomy,
  CompetitionLevel,
} from '../types';
import { printOsnModulePdf } from '../services/pdfPrintService';
import { generateOsnQuestions } from '../services/aiQuestionService';

interface ModulesViewProps {
  modules: OsnModule[];
  onAddModule: (newModule: OsnModule) => void;
  onAddQuestionsToModule: (moduleId: string, newQuestions: Question[]) => void;
  currentUser: UserProfile;
  onSelectSubjectForGenerator: (subject: OsnSubject) => void;
  setActiveTab: (tab: string) => void;
  activeSubject?: OsnSubject;
}

const OSN_SUBJECT_LIST: { subject: OsnSubject; icon: string; title: string }[] = [
  { subject: 'Matematika', icon: '∑', title: 'Aljabar, Teori Bilangan, Geometri, Kombinatorika' },
  { subject: 'Fisika', icon: '⚡', title: 'Mekanika Klasik, Termodinamika, Listrik & Magnet' },
  { subject: 'Biologi', icon: '🧬', title: 'Biologi Sel Molekuler, Genetika, Ekologi & Fisiologi' },
  { subject: 'Kimia', icon: '⚗️', title: 'Stoikiometri, Kesetimbangan, Termokimia & Kimia Organik' },
  { subject: 'Informatika', icon: '💻', title: 'Algoritma, Pemrograman C++, Teori Graf & Dynamic Programming' },
  { subject: 'Astronomi', icon: '🔭', title: 'Mekanika Benda Langit, Hukum Kepler, Astrofisika' },
  { subject: 'Kebumian', icon: '🌍', title: 'Geologi Struktur, Meteorologi, Oseanografi' },
  { subject: 'Ekonomi', icon: '📈', title: 'Mikroekonomi, Makroekonomi, Akuntansi Keuangan' },
  { subject: 'Geografi', icon: '🗺️', title: 'Klimatologi, Geomorfologi, Penginderaan Jauh & SIG' },
];

const BLOOM_LEVELS: BloomTaxonomy[] = [
  'C1 (Mengingat)',
  'C2 (Memahami)',
  'C3 (Mengaplikasikan)',
  'C4 (Menganalisis)',
  'C5 (Mengevaluasi)',
  'C6 (Menciptakan/HOTS)',
];

const SOLO_LEVELS: SoloTaxonomy[] = [
  'Unistructural',
  'Multistructural',
  'Relational',
  'Extended Abstract',
];

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onAddModule,
  onAddQuestionsToModule,
  currentUser,
  onSelectSubjectForGenerator,
  setActiveTab,
  activeSubject,
}) => {
  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';
  const userEnrolledSubject: OsnSubject | undefined = currentUser.subject;

  // Initial subject: For students, strictly their assigned subject.
  // For teachers/admins, sync with activeSubject or userEnrolledSubject or fallback to Matematika.
  const initialSub: OsnSubject = (isStudent && userEnrolledSubject)
    ? userEnrolledSubject
    : (activeSubject || userEnrolledSubject || 'Matematika');

  const [selectedSubject, setSelectedSubject] = useState<OsnSubject>(initialSub);

  React.useEffect(() => {
    if (isStudent && userEnrolledSubject) {
      setSelectedSubject(userEnrolledSubject);
    } else if (activeSubject) {
      setSelectedSubject(activeSubject);
    }
  }, [isStudent, userEnrolledSubject, activeSubject]);

  // Modal "+ Tambah Modul / Silabus Pembinaan Baru"
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModSubject, setNewModSubject] = useState<OsnSubject>('Matematika');
  const [newModTitle, setNewModTitle] = useState('');
  const [newModSubtopics, setNewModSubtopics] = useState('');
  const [newModSummary, setNewModSummary] = useState('');
  const [newModFormulaName, setNewModFormulaName] = useState('');
  const [newModFormulaCode, setNewModFormulaCode] = useState('');
  const [newModFormulaExp, setNewModFormulaExp] = useState('');
  const [newModTips, setNewModTips] = useState('');
  const [newModTier, setNewModTier] = useState('Tingkat Menengah - Mahir');

  // Modal / Box Generator Soal Modul
  const [showQuestionGenBox, setShowQuestionGenBox] = useState(false);
  const [genCount, setGenCount] = useState<number>(3);
  const [genType, setGenType] = useState<'pilihan_ganda' | 'esai' | 'bergambar'>('pilihan_ganda');
  const [genBloom, setGenBloom] = useState<BloomTaxonomy>('C4 (Menganalisis)');
  const [genSolo, setGenSolo] = useState<SoloTaxonomy>('Relational');
  const [genLevel, setGenLevel] = useState<CompetitionLevel>('Kabupaten (OSN-K)');
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessNotice, setGenSuccessNotice] = useState<string | null>(null);

  // Question filter in active module
  const [questionFilterType, setQuestionFilterType] = useState<string>('all');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string, boolean>>({});

  // Find module for selected subject (or fallback)
  const activeModule = modules.find((m) => m.subject === selectedSubject) || {
    id: `MOD-${selectedSubject}`,
    subject: selectedSubject,
    title: `Silabus & Bimbingan Intensif OSN: ${selectedSubject} SMAN 1 Pardasuka`,
    subtopics: [
      'Konsep Dasar & Pemahaman Konsep Inti',
      'Model Analisis & Dekomposisi Soal Olimpiade (HOTS)',
      'Trik Eliminasi Opsi & Pembuktian Cepat',
      'Latihan Soal Standar BPTI / Puspresnas',
    ],
    keyFormulas: [
      {
        name: 'Prinsip Fundamental ' + selectedSubject,
        formula: 'Rumus Inti Terapan Kurikulum Puspresnas',
        explanation: 'Digunakan sebagai pondasi penalaran terstruktur dalam kompetisi sains.',
      },
    ],
    summary: `Materi ${selectedSubject} dirancang untuk mengasah kemampuan pemecahan masalah tingkat lanjut (HOTS) sesuai kurikulum Puspresnas Kemendikbudristek.`,
    tips: [
      'Kuasai konsep dasar sebelum mencoba variasi soal ekstrem.',
      'Sering berlatih soal-soal OSN-K dan OSN-P tahun-tahun sebelumnya.',
      'Diskusikan pemikiran dan alternatif solusi bersama guru pembina.',
    ],
    difficultyTier: 'Tingkat Menengah - Mahir',
    moduleQuestions: [],
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle || !newModSummary) return;

    const subtopicsArr = newModSubtopics
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tipsArr = newModTips
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const newModule: OsnModule = {
      id: `MOD-${Date.now()}`,
      subject: newModSubject,
      title: newModTitle,
      subtopics: subtopicsArr.length > 0 ? subtopicsArr : ['Topik Dasar', 'Topik Lanjutan'],
      summary: newModSummary,
      keyFormulas: newModFormulaName
        ? [
            {
              name: newModFormulaName,
              formula: newModFormulaCode || 'E = mc²',
              explanation: newModFormulaExp || 'Penjelasan formula',
            },
          ]
        : [],
      tips: tipsArr.length > 0 ? tipsArr : ['Kuasai konsep dasar secara cermat.'],
      difficultyTier: newModTier,
      mentorName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      moduleQuestions: [],
    };

    onAddModule(newModule);
    setSelectedSubject(newModSubject);
    setShowAddModuleModal(false);

    // Reset form
    setNewModTitle('');
    setNewModSubtopics('');
    setNewModSummary('');
    setNewModFormulaName('');
    setNewModFormulaCode('');
    setNewModFormulaExp('');
    setNewModTips('');
  };

  const handleGenerateQuestionsForModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenSuccessNotice(null);

    const chosenTopic = genTopic.trim() || activeModule.subtopics[0] || activeModule.title;

    try {
      const result = await generateOsnQuestions({
        subject: activeModule.subject,
        level: genLevel,
        bloomTaxonomy: genBloom,
        soloTaxonomy: genSolo,
        count: genCount,
        topic: chosenTopic,
        questionType: genType,
        customPrompt: `Soal teragenda khusus modul materi OSN: "${activeModule.title}". Format soal: ${genType}. Sertakan kunci dan pembahasan mendalam.`,
        authorName: `Modul OSN (${currentUser.name})`,
      });

      if (result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        onAddQuestionsToModule(activeModule.id, result.questions);
        setGenSuccessNotice(
          `Berhasil menyusun & mengagendakan ${result.questions.length} butir soal ${genType.toUpperCase()} ke dalam modul ini!`
        );
        setShowQuestionGenBox(false);
        setTimeout(() => setGenSuccessNotice(null), 4000);
      } else {
        setGenSuccessNotice('Gagal merangkai soal modul. Silakan coba kembali.');
      }
    } catch (err) {
      console.error(err);
      setGenSuccessNotice('Terjadi kendala saat merangkai soal modul.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionExpanded = (id: string) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const moduleQuestionsList = activeModule.moduleQuestions || [];
  const filteredQuestions = moduleQuestionsList.filter((q) => {
    if (questionFilterType === 'all') return true;
    return q.questionType === questionFilterType;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Modul & Silabus Pembinaan 9 Bidang OSN
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Silabus resmi Puspresnas/BPTI, rumus kunci, serta kumpulan soal teragenda (Pilihan Ganda, Esai, dan Bergambar) SMAN 1 Pardasuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Button: Cetak Modul PDF */}
          <button
            onClick={() => printOsnModulePdf(activeModule)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/70 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span className="sm:hidden">Cetak PDF</span>
            <span className="hidden sm:inline">Cetak Modul & Silabus (PDF)</span>
          </button>
          {/* Button: + Tambah Modul / Silabus Pembinaan (Khusus Guru / Admin) */}
          {!isStudent && (
            <button
              onClick={() => {
                setNewModSubject(selectedSubject);
                setShowAddModuleModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">+ Modul</span>
              <span className="hidden sm:inline">+ Tambah Modul / Silabus Baru</span>
            </button>
          )}
        </div>
      </div>

      {genSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{genSuccessNotice}</span>
        </div>
      )}

      {/* 9 Subjects Horizontal Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-purple-300">
          <span className="font-semibold text-[11px] text-purple-300/80 uppercase tracking-wider">
            Pilih Mata Pelajaran Bimbingan OSN:
          </span>
          <span className="text-[11px] text-purple-400">
            {isStudent && userEnrolledSubject
              ? `Khusus Akun Siswa: ${userEnrolledSubject}`
              : `Mata Pelajaran Aktif: ${selectedSubject}`}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {OSN_SUBJECT_LIST.map((item) => {
            const isActive = selectedSubject === item.subject;
            const isStudentLockedOut = isStudent && !!userEnrolledSubject && userEnrolledSubject !== item.subject;

            return (
              <button
                key={item.subject}
                disabled={isStudentLockedOut}
                onClick={() => {
                  if (isStudentLockedOut) return;
                  setSelectedSubject(item.subject);
                  if (onSelectSubjectForGenerator) {
                    onSelectSubjectForGenerator(item.subject);
                  }
                  setShowQuestionGenBox(false);
                }}
                title={
                  isStudentLockedOut
                    ? `Mata pelajaran ${item.subject} tidak aktif (Akun Anda terdaftar khusus bidang ${userEnrolledSubject})`
                    : isActive
                    ? `Mata pelajaran aktif: ${item.subject}`
                    : `Aktifkan mata pelajaran: ${item.subject}`
                }
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950 cursor-default'
                    : isStudentLockedOut
                    ? 'bg-[#120824]/40 text-purple-400/40 border-purple-950/60 cursor-not-allowed opacity-50'
                    : 'bg-[#180e2f]/80 text-purple-300 border-purple-800/40 hover:bg-[#201242] hover:text-white cursor-pointer'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.subject}</span>
                {isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">
                    Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Content Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Silabus, Formula Cards & Questions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-200 border border-purple-700/60">
                  Bidang: {activeModule.subject}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Mata Pelajaran Aktif
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-400">{activeModule.difficultyTier}</span>
            </div>

            <h2 className="text-xl font-bold text-white">{activeModule.title}</h2>
            <p className="text-xs text-purple-200/80 leading-relaxed bg-[#120924]/60 p-3.5 rounded-xl border border-purple-900/40">
              {activeModule.summary}
            </p>

            {/* Subtopics Checklist */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Cakupan Materi & Silabus Puspresnas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeModule.subtopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#120924]/80 border border-purple-900/40 flex items-center gap-2 text-purple-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulas & Theorems */}
            {activeModule.keyFormulas.length > 0 && (
              <div className="space-y-3 pt-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Rumus Kunci & Teorema Emas Olimpiade
                </h3>
                <div className="space-y-3">
                  {activeModule.keyFormulas.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3.5 rounded-xl bg-purple-950/70 border border-purple-700/60 space-y-1.5 shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{f.name}</span>
                        <span className="text-[10px] text-purple-300 font-mono">Rumus Penting</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#100720] border border-purple-900/80 font-mono text-xs text-emerald-300">
                        {f.formula}
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-normal">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Soal Generate yang Diagendakan dalam Modul */}
          <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Bank Soal & Latihan Teragendakan dalam Modul ({moduleQuestionsList.length})
                  </h3>
                </div>
                <p className="text-xs text-purple-300/80">
                  Koleksi soal terintegrasi modul: Pilihan Ganda, Esai Analitis, dan Soal Bergambar / Diagram Ilmiah.
                </p>
              </div>

              {!isStudent && (
                <button
                  onClick={() => setShowQuestionGenBox(!showQuestionGenBox)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-bold shadow cursor-pointer transition-all self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Rangkai Soal Modul Baru</span>
                </button>
              )}
            </div>

            {/* Inline Generator Panel for Module (Khusus Guru / Admin) */}
            {!isStudent && showQuestionGenBox && (
              <form
                onSubmit={handleGenerateQuestionsForModule}
                className="p-5 rounded-2xl bg-[#140a2a] border border-purple-600/80 space-y-4 animate-fadeIn text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Penyusun Soal Modul: {activeModule.subject}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuestionGenBox(false)}
                    className="text-purple-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Type Selection (PG, Esai, Bergambar) */}
                <div>
                  <label className="block font-semibold text-purple-200 mb-1.5">
                    Pilih Format Tipe Soal Modul:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGenType('pilihan_ganda')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                        genType === 'pilihan_ganda'
                          ? 'bg-purple-600 border-purple-400 text-white font-bold shadow'
                          : 'bg-[#120722] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 text-purple-300" />
                      <span className="text-[11px]">Pilihan Ganda (PG)</span>
                      <span className="text-[9px] opacity-75">5 Opsi A-E</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGenType('esai')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                        genType === 'esai'
                          ? 'bg-purple-600 border-purple-400 text-white font-bold shadow'
                          : 'bg-[#120722] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <PenTool className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px]">Soal Esai / Uraian</span>
                      <span className="text-[9px] opacity-75">Rubrik & HOTS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGenType('bergambar')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                        genType === 'bergambar'
                          ? 'bg-purple-600 border-purple-400 text-white font-bold shadow'
                          : 'bg-[#120722] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px]">Soal Bergambar</span>
                      <span className="text-[9px] opacity-75">Diagram SVG Sains</span>
                    </button>
                  </div>
                </div>

                {/* Parameters: Count, Bloom, SOLO, Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Jumlah Butir Soal:</label>
                    <select
                      aria-label="Pilih Jumlah Soal"
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full bg-[#110720] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value={1}>1 Butir Soal</option>
                      <option value={2}>2 Butir Soal</option>
                      <option value={3}>3 Butir Soal</option>
                      <option value={5}>5 Butir Soal</option>
                      <option value={10}>10 Butir Soal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Taksonomi Bloom:</label>
                    <select
                      aria-label="Pilih Taksonomi Bloom"
                      value={genBloom}
                      onChange={(e) => setGenBloom(e.target.value as BloomTaxonomy)}
                      className="w-full bg-[#110720] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      {BLOOM_LEVELS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Taksonomi SOLO:</label>
                    <select
                      aria-label="Pilih Taksonomi SOLO"
                      value={genSolo}
                      onChange={(e) => setGenSolo(e.target.value as SoloTaxonomy)}
                      className="w-full bg-[#110720] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      {SOLO_LEVELS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Topik Spesifik Modul:</label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder={`Contoh: ${activeModule.subtopics[0] || 'Materi Inti Modul'}`}
                    className="w-full bg-[#110720] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionGenBox(false)}
                    className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI Merangkai Soal Modul...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Rangkai & Agendakan ke Modul</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Filter Question Types for Display */}
            {moduleQuestionsList.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                <button
                  onClick={() => setQuestionFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    questionFilterType === 'all'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-[#120822] text-purple-300 border-purple-900/60 hover:bg-[#1b0d36]'
                  }`}
                >
                  Semua ({moduleQuestionsList.length})
                </button>
                <button
                  onClick={() => setQuestionFilterType('pilihan_ganda')}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    questionFilterType === 'pilihan_ganda'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-[#120822] text-purple-300 border-purple-900/60 hover:bg-[#1b0d36]'
                  }`}
                >
                  Pilihan Ganda ({moduleQuestionsList.filter((q) => q.questionType === 'pilihan_ganda').length})
                </button>
                <button
                  onClick={() => setQuestionFilterType('esai')}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    questionFilterType === 'esai'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-[#120822] text-purple-300 border-purple-900/60 hover:bg-[#1b0d36]'
                  }`}
                >
                  Soal Esai ({moduleQuestionsList.filter((q) => q.questionType === 'esai').length})
                </button>
                <button
                  onClick={() => setQuestionFilterType('bergambar')}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    questionFilterType === 'bergambar'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-[#120822] text-purple-300 border-purple-900/60 hover:bg-[#1b0d36]'
                  }`}
                >
                  Soal Bergambar ({moduleQuestionsList.filter((q) => q.questionType === 'bergambar').length})
                </button>
              </div>
            )}

            {/* List of Module Questions */}
            {filteredQuestions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#120822]/70 border border-purple-900/50 text-center text-xs text-purple-300/70 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400/80 mx-auto" />
                <p className="font-semibold text-white">Belum Ada Soal Teragendakan untuk Kategori Ini</p>
                <p className="text-[11px] text-purple-400">
                  {isStudent
                    ? 'Belum ada butir soal yang diagendakan oleh guru pembina untuk kategori ini. Silakan pelajari silabus & rumus kunci.'
                    : 'Gunakan tombol + Rangkai Soal Modul Baru di atas untuk menyusun soal PG, Esai, atau Bergambar.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q, qIdx) => {
                  const isExpanded = expandedQuestionIds[q.id] || false;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-[#130926] border border-purple-800/50 space-y-3.5 text-xs transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700">
                            #{qIdx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              q.questionType === 'esai'
                                ? 'bg-amber-950 text-amber-300 border border-amber-600'
                                : q.questionType === 'bergambar'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                : 'bg-purple-950 text-purple-300 border border-purple-700'
                            }`}
                          >
                            {q.questionType === 'esai'
                              ? 'Esai Analitis'
                              : q.questionType === 'bergambar'
                              ? 'Soal Bergambar (SVG)'
                              : 'Pilihan Ganda'}
                          </span>
                          <span className="text-indigo-300 font-semibold">{q.bloomLevel}</span>
                          <span className="text-pink-300 font-semibold">SOLO: {q.soloLevel}</span>
                        </div>

                        <button
                          onClick={() => toggleQuestionExpanded(q.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Tutup Solusi' : 'Buka Kunci & Solusi'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Question Text */}
                      <p className="text-white font-medium leading-relaxed text-sm">
                        {q.questionText}
                      </p>

                      {/* Diagram SVG for Bergambar Question */}
                      {q.diagramSvg && (
                        <div className="p-3 rounded-xl bg-[#0e051a] border border-purple-800/80 space-y-2">
                          <div
                            dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                            className="flex justify-center overflow-x-auto"
                          />
                          {q.imageCaption && (
                            <p className="text-[10px] text-center italic text-purple-300">
                              {q.imageCaption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Formula / Context */}
                      {q.formulaOrContext && (
                        <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-800/40 font-mono text-[11px] text-amber-300">
                          {q.formulaOrContext}
                        </div>
                      )}

                      {/* Options for PG / Bergambar */}
                      {q.questionType !== 'esai' && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctAnswerIndex === oIdx && isExpanded;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                                    : 'bg-[#180e2f]/70 border-purple-900/40 text-purple-200'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                                    ✓ Kunci Benar
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Expanded Solution / Essay Rubric */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-purple-900/50 space-y-3 animate-fadeIn">
                          {/* If Essay: Show sample essay answer and rubric */}
                          {q.questionType === 'esai' && (
                            <div className="space-y-2">
                              {q.sampleEssayAnswer && (
                                <div className="p-3 rounded-xl bg-[#180e2f] border border-purple-700/60 space-y-1">
                                  <strong className="text-amber-400 block text-xs">
                                    Contoh Jawaban Esai Ideal:
                                  </strong>
                                  <p className="text-purple-200 leading-relaxed whitespace-pre-line text-[11px]">
                                    {q.sampleEssayAnswer}
                                  </p>
                                </div>
                              )}

                              {q.rubricOrKeyPoints && q.rubricOrKeyPoints.length > 0 && (
                                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 space-y-1">
                                  <strong className="text-emerald-400 block text-xs">
                                    Rubrik Penilaian Esai (Kriteria Penilaian Skor):
                                  </strong>
                                  <ul className="list-disc list-inside text-purple-300 text-[11px] space-y-1">
                                    {q.rubricOrKeyPoints.map((rubric, rIdx) => (
                                      <li key={rIdx}>{rubric}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Scientific Explanation */}
                          <div className="p-3 rounded-xl bg-[#100720] border border-purple-900 text-purple-200/90 leading-relaxed text-[11px]">
                            <strong className="text-amber-400 block mb-0.5">
                              Pembahasan Ilmiah Langkah demi Langkah:
                            </strong>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tips & Quick Action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tips Juara OSN */}
          <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tips & Strategi Pengerjaan Soal OSN
            </h3>
            <div className="space-y-2.5 text-xs">
              {activeModule.tips.map((tip, tIdx) => (
                <div
                  key={tIdx}
                  className="p-3 rounded-xl bg-[#120924]/80 border border-purple-900/40 flex items-start gap-2.5 text-purple-200/90 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-700 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {tIdx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule Navigation Box */}
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-950/60 border border-purple-700/50 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white">Integrasi Bimbingan & CBT</h3>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              Modul ini terhubung langsung dengan jadwal bimbingan sekolah dan kurikulum simulasi ujian CBT.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setActiveTab('bimbingan')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Buka Jadwal Bimbingan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('cbt')}
                className="w-full py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Katalog Ujian CBT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: + Tambah Modul / Silabus Pembinaan Baru */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180d30] border border-purple-600 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Tambah Modul / Silabus Pembinaan Baru</h3>
              </div>
              <button onClick={() => setShowAddModuleModal(false)} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Bidang OSN:</label>
                  <select
                    aria-label="Pilih Bidang Modul"
                    value={newModSubject}
                    onChange={(e) => setNewModSubject(e.target.value as OsnSubject)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {OSN_SUBJECT_LIST.map((s) => (
                      <option key={s.subject} value={s.subject}>{s.subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Tingkat Kesulitan:</label>
                  <select
                    aria-label="Pilih Tingkat Kesulitan Modul"
                    value={newModTier}
                    onChange={(e) => setNewModTier(e.target.value)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Tingkat Dasar - Menengah">Tingkat Dasar - Menengah</option>
                    <option value="Tingkat Menengah - Mahir">Tingkat Menengah - Mahir</option>
                    <option value="Tingkat Mahir - Pelatnas">Tingkat Mahir - Pelatnas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Judul Modul / Silabus:</label>
                <input
                  type="text"
                  required
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  placeholder="Contoh: Modul Bimbingan Geometri Analitik & Titik Kuasa"
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Cakupan Subtopik Silabus (Satu per baris):
                </label>
                <textarea
                  rows={3}
                  value={newModSubtopics}
                  onChange={(e) => setNewModSubtopics(e.target.value)}
                  placeholder="Titik Kuasa & Garis Kuasa&#10;Teori Segiempat Siklis&#10;Teorema Ceva & Menelaus"
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Rangkuman Pembinaan:</label>
                <textarea
                  rows={2}
                  required
                  value={newModSummary}
                  onChange={(e) => setNewModSummary(e.target.value)}
                  placeholder="Penjelasan ringkas konsep dan fokus pembinaan sains..."
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              {/* Formula */}
              <div className="p-3 rounded-xl bg-[#120822] border border-purple-900/60 space-y-2">
                <span className="font-semibold text-amber-300 block">Rumus Kunci Pertama (Opsional):</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newModFormulaName}
                    onChange={(e) => setNewModFormulaName(e.target.value)}
                    placeholder="Nama Rumus (misal: Teorema Ceva)"
                    className="w-full bg-[#180e2f] border border-purple-800 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    value={newModFormulaCode}
                    onChange={(e) => setNewModFormulaCode(e.target.value)}
                    placeholder="Formula (misal: AF/FB * BD/DC * CE/EA = 1)"
                    className="w-full bg-[#180e2f] border border-purple-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  value={newModFormulaExp}
                  onChange={(e) => setNewModFormulaExp(e.target.value)}
                  placeholder="Penjelasan pemakaian rumus"
                  className="w-full bg-[#180e2f] border border-purple-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Tips Trik OSN (Satu per baris):
                </label>
                <textarea
                  rows={2}
                  value={newModTips}
                  onChange={(e) => setNewModTips(e.target.value)}
                  placeholder="Gambarkan segitiga dengan proporsi tepat&#10;Cari titik konkruensi"
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Simpan Modul Pembinaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
