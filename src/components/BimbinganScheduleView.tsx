import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  HelpCircle,
  Lightbulb,
  Printer,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BimbinganSchedule,
  UserProfile,
  OsnSubject,
  BloomTaxonomy,
  SoloTaxonomy,
  Question,
} from '../types';
import { printBimbinganSchedulePdf } from '../services/pdfPrintService';
import { generateOsnQuestions } from '../services/aiQuestionService';

interface BimbinganScheduleViewProps {
  schedules: BimbinganSchedule[];
  currentUser: UserProfile;
  onAddSchedule: (schedule: BimbinganSchedule) => void;
  onAddQuestionsToSchedule: (scheduleId: string, questions: Question[]) => void;
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

export const BimbinganScheduleView: React.FC<BimbinganScheduleViewProps> = ({
  schedules,
  currentUser,
  onAddSchedule,
  onAddQuestionsToSchedule,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    schedules[0]?.id || null
  );

  const isAdmin = currentUser.role === 'admin';
  const userSelectedSubject = currentUser.subject || 'Matematika';

  // Modal create schedule state (Guru only)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<OsnSubject>(userSelectedSubject);
  const [date, setDate] = useState('2026-03-25');
  const [timeStart, setTimeStart] = useState('14:00');
  const [timeEnd, setTimeEnd] = useState('16:00');
  const [location, setLocation] = useState('Lab Komputer 1 SMAN 1 Pardasuka');
  const [targetBloom, setTargetBloom] = useState<BloomTaxonomy>('C4 (Menganalisis)');
  const [targetSolo, setTargetSolo] = useState<SoloTaxonomy>('Relational');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (!isAdmin && currentUser.subject) {
      setSubject(currentUser.subject);
    }
  }, [isAdmin, currentUser.subject]);

  // AI Generator state for schedule
  const [generatingForScheduleId, setGeneratingForScheduleId] = useState<string | null>(null);
  const [genCount, setGenCount] = useState<number>(5);
  const [genQuestionType, setGenQuestionType] = useState<'pilihan_ganda' | 'esai' | 'bergambar'>('bergambar');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic) return;

    const newSchedule: BimbinganSchedule = {
      id: `BIMB-${Date.now()}`,
      title,
      subject,
      mentorName: currentUser.name,
      mentorId: currentUser.id,
      date,
      timeStart,
      timeEnd,
      location,
      targetBloom,
      targetSolo,
      topic,
      notes,
      status: 'Akan Datang',
      coachingQuestions: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddSchedule(newSchedule);
    setShowCreateModal(false);
    setExpandedScheduleId(newSchedule.id);
    // Reset form
    setTitle('');
    setTopic('');
    setNotes('');
  };

  const handleGenerateQuestionsForSchedule = async (schedule: BimbinganSchedule) => {
    setIsGenerating(true);
    setGenSuccessMsg(null);

    try {
      const result = await generateOsnQuestions({
        subject: schedule.subject,
        level: 'Kabupaten (OSN-K)',
        bloomTaxonomy: schedule.targetBloom,
        soloTaxonomy: schedule.targetSolo,
        count: genCount,
        topic: schedule.topic,
        questionType: genQuestionType,
        reasoningLevel: 'sedang',
        purpose: 'bimbingan',
        customPrompt: `Soal khusus bimbingan dan pembahasan intensif kelas bimbingan OSN SMAN 1 Pardasuka (Bukan untuk CBT). Format soal: ${genQuestionType}. ${
          genQuestionType === 'bergambar' ? 'Wajib sertakan diagram skema visual ilmiah (diagramSvg).' : ''
        } Catatan bimbingan: ${schedule.notes || ''}`,
        authorName: `AI Pembina (${schedule.mentorName})`,
      });

      if (result.success && Array.isArray(result.questions) && result.questions.length > 0) {
        onAddQuestionsToSchedule(schedule.id, result.questions);
        setGenSuccessMsg(
          `Berhasil menyusun ${result.questions.length} butir soal ${genQuestionType.toUpperCase()} khusus materi bimbingan ini!`
        );
        setTimeout(() => setGenSuccessMsg(null), 3500);
      } else {
        setGenSuccessMsg('Gagal menyusun soal bimbingan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      setGenSuccessMsg('Gagal menyusun soal bimbingan.');
    } finally {
      setIsGenerating(false);
      setGeneratingForScheduleId(null);
    }
  };

  const filteredSchedules = isAdmin
    ? schedules.filter((s) => filterSubject === 'All' || s.subject === filterSubject)
    : schedules.filter((s) => s.subject === userSelectedSubject);

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              Jadwal Bimbingan Olimpiade Sains SMAN 1 Pardasuka
            </h1>
            {isAdmin ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 font-mono">
                Semua Bidang (Admin Master)
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                Mapel Pilihan: {userSelectedSubject}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-purple-300/80">
            {isAdmin
              ? 'Jadwal pembinaan intensif tatap muka/lab yang dikelola oleh Guru Pembina beserta bank soal latihan khusus bimbingan.'
              : `Jadwal pembinaan intensif khusus bidang ${userSelectedSubject} beserta bank soal latihan materi bimbingan.`}
          </p>
        </div>

        {/* Action Button: Guru Pembina can add schedule */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isTeacher ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jadwal Bimbingan</span>
            </button>
          ) : (
            <div className="text-[11px] px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300">
              Role: <strong>Siswa Bimbingan ({userSelectedSubject})</strong>
            </div>
          )}
        </div>
      </div>

      {genSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{genSuccessMsg}</span>
        </div>
      )}

      {/* Filter by Subject */}
      {isAdmin ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilterSubject('All')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer whitespace-nowrap ${
              filterSubject === 'All'
                ? 'bg-purple-600 text-white border-purple-400 shadow'
                : 'bg-[#180e2f]/80 text-purple-300 border-purple-800/40 hover:bg-[#201242]'
            }`}
          >
            Semua Bidang ({schedules.length})
          </button>
          {OSN_SUBJECTS.map((sub) => {
            const count = schedules.filter((s) => s.subject === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setFilterSubject(sub)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  filterSubject === sub
                    ? 'bg-purple-600 text-white border-purple-400 shadow'
                    : 'bg-[#180e2f]/80 text-purple-300 border-purple-800/40 hover:bg-[#201242]'
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#180e2f]/90 border border-purple-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
              Fokus Bimbingan Mapel Terpilih:
            </span>
            <span className="font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-600/60 font-mono">
              {userSelectedSubject}
            </span>
          </div>
          <span className="text-[11px] text-purple-300/80 font-medium">
            Menampilkan {filteredSchedules.length} Agenda Bimbingan
          </span>
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-800/60 bg-[#140b28]/60 p-10 text-center space-y-2">
            <Calendar className="w-8 h-8 text-purple-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">
              Belum Ada Jadwal Bimbingan {isAdmin ? '' : `untuk Bidang ${userSelectedSubject}`}
            </h4>
            <p className="text-xs text-purple-300/70">
              {currentUser.role === 'teacher'
                ? `Anda dapat menambahkan jadwal pembinaan baru khusus ${userSelectedSubject} menggunakan tombol di atas.`
                : `Guru Pembina ${userSelectedSubject} belum mengagendakan bimbingan tatap muka baru.`}
            </p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => {
            const isExpanded = expandedScheduleId === schedule.id;
            const qCount = schedule.coachingQuestions.length;

            return (
              <div
                key={schedule.id}
                className="bg-[#180e2f]/90 border border-purple-800/50 hover:border-purple-600/60 rounded-2xl shadow-xl transition-all overflow-hidden"
              >
                {/* Header summary of the schedule */}
                <div
                  onClick={() => setExpandedScheduleId(isExpanded ? null : schedule.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#20113f]/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-700/60">
                        {schedule.subject}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                        {schedule.targetBloom}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/50">
                        SOLO: {schedule.targetSolo}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60">
                        {schedule.status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {schedule.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-purple-300/80 pt-1">
                      <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {schedule.date} ({schedule.timeStart} - {schedule.timeEnd} WIB)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {schedule.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        Pembina: {schedule.mentorName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/60 text-amber-300 block">
                        {qCount} Soal Bimbingan
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-purple-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-300" />
                    )}
                  </div>
                </div>

                {/* Expanded Content: Topic details & Coaching Questions (Not for CBT) */}
                {isExpanded && (
                  <div className="p-5 border-t border-purple-900/50 bg-[#140b28]/70 space-y-5">
                    {/* Topic and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#120822] border border-purple-900/60 space-y-1">
                        <span className="text-purple-400 font-bold block uppercase tracking-wider text-[10px]">
                          Fokus Topik Pembahasan:
                        </span>
                        <p className="text-white font-medium">{schedule.topic}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#120822] border border-purple-900/60 space-y-1">
                        <span className="text-purple-400 font-bold block uppercase tracking-wider text-[10px]">
                          Catatan / Instruksi Pembina:
                        </span>
                        <p className="text-purple-200/90 leading-relaxed">
                          {schedule.notes || 'Bawa perlengkapan alat tulis dan rumus ringkas olimpiade.'}
                        </p>
                      </div>
                    </div>

                    {/* Section: Soal Khusus Jadwal Bimbingan (Bukan CBT) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-purple-900/40">
                        <div>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-bold text-white">
                              Soal Latihan Khusus Jadwal Bimbingan Ini
                            </h4>
                          </div>
                          <p className="text-[11px] text-amber-400/90 font-medium">
                            * Soal ini dirancang khusus untuk pembedahan konsep saat bimbingan (Bukan untuk Ujian CBT).
                          </p>
                        </div>

                        {/* Trigger AI Generator & Print PDF for this specific schedule */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => printBimbinganSchedulePdf(schedule)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/70 text-purple-200 hover:text-white text-xs font-bold transition-all shadow cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-300" />
                            <span>Cetak Kegiatan & Soal (PDF)</span>
                          </button>
                          {isTeacher && (
                            <button
                              onClick={() =>
                                setGeneratingForScheduleId(
                                  generatingForScheduleId === schedule.id ? null : schedule.id
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>+ Generate Soal AI untuk Bimbingan Ini</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline AI Generator Box for this schedule (Guru only) */}
                      {isTeacher && generatingForScheduleId === schedule.id && (
                        <div className="p-4 rounded-xl bg-[#1b0d36] border border-purple-600 space-y-3 animate-fadeIn text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              Generate Soal Khusus Bimbingan: {schedule.title}
                            </span>
                            <button
                              onClick={() => setGeneratingForScheduleId(null)}
                              className="text-purple-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-purple-300 block mb-1">Bidang & Topik:</span>
                              <div className="p-2 rounded-lg bg-[#120822] text-white font-medium truncate">
                                {schedule.subject} • {schedule.topic}
                              </div>
                            </div>
                            <div>
                              <span className="text-purple-300 block mb-1">Target Taksonomi:</span>
                              <div className="p-2 rounded-lg bg-[#120822] text-indigo-300 font-medium truncate">
                                {schedule.targetBloom} / {schedule.targetSolo}
                              </div>
                            </div>
                            <div>
                              <span className="text-purple-300 block mb-1">Tipe / Format Soal:</span>
                              <select
                                aria-label="Tipe Soal Bimbingan"
                                value={genQuestionType}
                                onChange={(e) => setGenQuestionType(e.target.value as any)}
                                className="w-full p-2 rounded-lg bg-[#120822] text-white border border-purple-700 focus:outline-none"
                              >
                                <option value="bergambar">Soal Bergambar (Diagram SVG)</option>
                                <option value="pilihan_ganda">Pilihan Ganda (PG 5 Opsi)</option>
                                <option value="esai">Esai (Uraian & Rubrik)</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-purple-300 block mb-1">Jumlah Butir (Banyak):</span>
                              <select
                                aria-label="Jumlah Soal Bimbingan"
                                value={genCount}
                                onChange={(e) => setGenCount(Number(e.target.value))}
                                className="w-full p-2 rounded-lg bg-[#120822] text-white border border-purple-700 focus:outline-none font-bold"
                              >
                                <option value={3}>3 Butir Soal</option>
                                <option value={5}>5 Butir Soal (Standar)</option>
                                <option value={8}>8 Butir Soal</option>
                                <option value={10}>10 Butir Soal (Intensif)</option>
                                <option value={15}>15 Butir Soal (Latihan Penuh)</option>
                                <option value={20}>20 Butir Soal (Bank Soal Akbar)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => handleGenerateQuestionsForSchedule(schedule)}
                              disabled={isGenerating}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                  <span>AI Menyusun Soal Bimbingan...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Rangkai Soal Bimbingan Sekarang</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display questions attached to this schedule */}
                      {schedule.coachingQuestions.length === 0 ? (
                        <div className="p-6 rounded-xl bg-[#120822]/80 border border-purple-900/40 text-center text-xs text-purple-300/70 space-y-1">
                          <p>Belum ada soal latihan yang dirangkai untuk jadwal bimbingan ini.</p>
                          <p className="text-[11px] text-amber-400">
                            Klik tombol <strong>+ Generate Soal AI untuk Bimbingan Ini</strong> di atas untuk membuat bahan diskusi ilmiah.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {schedule.coachingQuestions.map((cq, qIdx) => (
                            <div
                              key={cq.id}
                              className="p-4 rounded-xl bg-[#120822] border border-purple-800/40 space-y-3 text-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-amber-300">
                                  Soal Diskusi #{qIdx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-semibold">
                                    {cq.bloomLevel}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/60 font-semibold">
                                    SOLO: {cq.soloLevel}
                                  </span>
                                </div>
                              </div>

                              <p className="text-white font-medium leading-relaxed">
                                {cq.questionText}
                              </p>

                              {cq.formulaOrContext && (
                                <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-800/40 font-mono text-[11px] text-amber-300">
                                  {cq.formulaOrContext}
                                </div>
                              )}

                              {/* Diagram / Gambar SVG jika ada */}
                              {cq.diagramSvg && (
                                <div className="p-3 rounded-xl bg-[#0e061a] border border-purple-800/60 space-y-1.5">
                                  <div
                                    className="w-full max-h-52 overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:max-h-48 [&>svg]:h-auto"
                                    dangerouslySetInnerHTML={{ __html: cq.diagramSvg }}
                                  />
                                  {cq.imageCaption && (
                                    <p className="text-[10px] text-center text-purple-300 font-medium italic">
                                      {cq.imageCaption}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Options */}
                              {cq.options && cq.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {cq.options.map((opt, oIdx) => {
                                    const isCorrect = cq.correctAnswerIndex === oIdx;
                                    return (
                                      <div
                                        key={oIdx}
                                        className={`p-2 rounded-lg border ${
                                          isCorrect
                                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                                            : 'bg-[#170c2d] border-purple-900/40 text-purple-300'
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        {isCorrect && (
                                          <span className="text-[10px] text-emerald-400 uppercase font-bold ml-2">
                                            ✓ Kunci Pembahasan
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Solusi Esai jika tipe esai */}
                              {cq.sampleEssayAnswer && (
                                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-[11px] text-purple-200 space-y-1">
                                  <strong className="text-amber-300 block">Kunci Jawaban Esai:</strong>
                                  <p className="whitespace-pre-line leading-relaxed">{cq.sampleEssayAnswer}</p>
                                </div>
                              )}

                              {/* Explanation */}
                              <div className="p-2.5 rounded-lg bg-[#180e2f] border border-purple-900/50 text-[11px] text-purple-200/90 leading-relaxed">
                                <strong className="text-amber-400 block mb-0.5">
                                  Pembedahan Jawaban & Pembahasan Ilmiah:
                                </strong>
                                {cq.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create Jadwal Bimbingan (Guru Pembina Only) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180d30] border border-purple-600 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Tambah Jadwal Bimbingan Baru</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Judul Bimbingan:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bimbingan Intensif Aljabar & Teori Bilangan OSN-K"
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Bidang OSN:</label>
                  {isAdmin ? (
                    <select
                      aria-label="Pilih Bidang OSN Bimbingan"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as OsnSubject)}
                      className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      {OSN_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#120822] border border-cyan-700/60 rounded-xl px-3 py-2 text-cyan-200 text-xs font-bold flex items-center justify-between">
                      <span>{userSelectedSubject}</span>
                      <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800">Terkunci Guru</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Tanggal Pertemuan:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    required
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    required
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Ruangan / Tempat:</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Lab Komputer 1 SMAN 1 Pardasuka / Ruang OSN"
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Target Bloom:</label>
                  <select
                    aria-label="Pilih Target Bloom Bimbingan"
                    value={targetBloom}
                    onChange={(e) => setTargetBloom(e.target.value as BloomTaxonomy)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {BLOOM_LEVELS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Target SOLO:</label>
                  <select
                    aria-label="Pilih Target SOLO Bimbingan"
                    value={targetSolo}
                    onChange={(e) => setTargetSolo(e.target.value as SoloTaxonomy)}
                    className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {SOLO_LEVELS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Topik / Submateri:</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Pembagian Polinomial, Teori Graf, Respirasi Seluler..."
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Catatan Tambahan untuk Siswa:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Harap bawa kalkulator saintifik atau rangkuman bab sebelumnya..."
                  className="w-full bg-[#120822] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Simpan Jadwal Bimbingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
