import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Award,
  Sparkles,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  Check,
  X,
  Lock,
  Printer,
  Calendar,
  BarChart3,
  Shuffle,
  Users,
  History,
  TrendingUp,
} from 'lucide-react';
import { ExamPacket, UserProfile, ExamResult, Question, OsnSubject, CompetitionLevel } from '../types';
import { printCbtResultPdf } from '../services/pdfPrintService';
import { QuestionAnalysisView } from './QuestionAnalysisView';
import { CbtExamRecapModal } from './CbtExamRecapModal';
import { shuffleQuestionsForAccount, shuffleQuestionsArray } from '../utils/shuffleUtils';
import { explainQuestionRemediation, generateOsnQuestions } from '../services/aiQuestionService';
import { saveMultipleQuestionsToFirestore, saveExamPacketToFirestore } from '../services/firebase';

interface CbtExamViewProps {
  exams: ExamPacket[];
  currentUser: UserProfile;
  onFinishExam: (result: ExamResult) => void;
  activeExamFromDashboard?: ExamPacket | null;
  onClearActiveExamFromDashboard?: () => void;
  onSendToGoogleSheets?: (result: ExamResult) => Promise<boolean>;
  onAddExamPacket?: (newExam: ExamPacket) => void;
  questionBank?: Question[];
  setActiveTab?: (tab: string) => void;
  examResults?: ExamResult[];
}

export const CbtExamView: React.FC<CbtExamViewProps> = ({
  exams,
  currentUser,
  onFinishExam,
  activeExamFromDashboard,
  onClearActiveExamFromDashboard,
  onSendToGoogleSheets,
  onAddExamPacket,
  questionBank = [],
  setActiveTab,
  examResults = [],
}) => {
  const [selectedExam, setSelectedExam] = useState<ExamPacket | null>(activeExamFromDashboard || null);
  const [isExamInProgress, setIsExamInProgress] = useState<boolean>(false);
  const [showExamAnalysisModal, setShowExamAnalysisModal] = useState<boolean>(false);
  const [selectedExamForAnalysis, setSelectedExamForAnalysis] = useState<ExamPacket | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedDoubtful, setMarkedDoubtful] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [tabSwitchViolations, setTabSwitchViolations] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);
  const [showRecapModal, setShowRecapModal] = useState<boolean>(false);
  const [selectedExamIdForRecap, setSelectedExamIdForRecap] = useState<string | null>(null);
  const [currentExamAttemptNumber, setCurrentExamAttemptNumber] = useState<number>(1);

  // Per-question 60 seconds minimum reading/solving timer
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(60);

  // Remediation AI state
  const [aiRemediationQuestion, setAiRemediationQuestion] = useState<Question | null>(null);
  const [aiRemediationText, setAiRemediationText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [syncedToGas, setSyncedToGas] = useState<boolean>(false);

  // Teacher CBT Schedule & Question Assembly state
  const userSelectedSubject: OsnSubject = currentUser.subject || 'Matematika';
  const visibleExams =
    currentUser.role === 'admin'
      ? exams
      : exams.filter((e) => e.subject === userSelectedSubject);
  const [showCreateCbtModal, setShowCreateCbtModal] = useState<boolean>(false);
  const [cbtTitle, setCbtTitle] = useState('');
  const [cbtSubject, setCbtSubject] = useState<OsnSubject>(userSelectedSubject);
  const [cbtLevel, setCbtLevel] = useState<CompetitionLevel>('Kabupaten (OSN-K)');
  const [cbtDuration, setCbtDuration] = useState<number>(60);
  const [cbtPenalty, setCbtPenalty] = useState<boolean>(true);
  const [cbtPassingScore, setCbtPassingScore] = useState<number>(60);
  const [cbtDate, setCbtDate] = useState('2026-03-30');
  const [cbtTimeStart, setCbtTimeStart] = useState('08:00');
  const [cbtTimeEnd, setCbtTimeEnd] = useState('09:30');
  const [cbtInstructions, setCbtInstructions] = useState('1. Kerjakan dengan jujur di bawah pengawasan proktor CBT.\n2. Waktu berjalan mundur otomatis. Dilarang berpindah tab browser.');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [cbtNewQuestions, setCbtNewQuestions] = useState<Question[]>([]);
  const [cbtShuffleOnAssemble, setCbtShuffleOnAssemble] = useState<boolean>(true);
  const [cbtPerAccountShuffle, setCbtPerAccountShuffle] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser.role !== 'admin' && currentUser.subject) {
      setCbtSubject(currentUser.subject);
    }
  }, [currentUser]);

  // Manual Question input state inside CBT modal
  const [manualQText, setManualQText] = useState('');
  const [manualQFormula, setManualQFormula] = useState('');
  const [manualQOptA, setManualQOptA] = useState('');
  const [manualQOptB, setManualQOptB] = useState('');
  const [manualQOptC, setManualQOptC] = useState('');
  const [manualQOptD, setManualQOptD] = useState('');
  const [manualQOptE, setManualQOptE] = useState('');
  const [manualQCorrectIdx, setManualQCorrectIdx] = useState(0);
  const [manualQExplanation, setManualQExplanation] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    if (activeExamFromDashboard) {
      handleStartExam(activeExamFromDashboard);
      if (onClearActiveExamFromDashboard) onClearActiveExamFromDashboard();
    }
  }, [activeExamFromDashboard, onClearActiveExamFromDashboard]);

  // Timer effect
  useEffect(() => {
    if (!isExamInProgress) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamInProgress]);

  // Per-question 60 seconds minimum timer effect (wajib 60 detik baru bisa mengerjakan soal selanjutnya atau sebelumnya)
  useEffect(() => {
    if (!isExamInProgress) return;
    setQuestionTimeRemaining(60);

    const qTimer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(qTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimer);
  }, [isExamInProgress, currentQuestionIndex]);

  // Anti-Cheat: Visibility & Focus detection
  useEffect(() => {
    if (!isExamInProgress) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchViolations((prev) => {
          const next = prev + 1;
          setShowViolationModal(true);
          return next;
        });
      }
    };

    const handleBlur = () => {
      setTabSwitchViolations((prev) => {
        const next = prev + 1;
        setShowViolationModal(true);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamInProgress]);

  const handleStartExam = (exam: ExamPacket) => {
    // Hitung frekuensi pengerjaan (pengerjaan ke berapa kali untuk akun siswa ini)
    const prevAttempts = (examResults || []).filter(
      (r) => r.examId === exam.id && r.studentId === currentUser.id
    ).length;
    const nextAttemptNumber = prevAttempts + 1;
    setCurrentExamAttemptNumber(nextAttemptNumber);

    // Pengacakan butir soal secara unik per akun (Beda Akun Beda Nomor Soal)
    const shouldShuffle = exam.shuffleQuestionsPerAccount !== false;
    const activeQuestions = shouldShuffle
      ? shuffleQuestionsForAccount(exam.questions, currentUser.id, exam.id)
      : [...exam.questions];

    setSelectedExam({
      ...exam,
      questions: activeQuestions,
    });
    setAnswers({});
    setMarkedDoubtful({});
    setCurrentQuestionIndex(0);
    setQuestionTimeRemaining(60);
    setTabSwitchViolations(0);
    setRemainingSeconds(exam.durationMinutes * 60);
    setIsExamInProgress(true);
    setLastExamResult(null);
    setSyncedToGas(false);
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  const handleToggleDoubtful = (qId: string) => {
    setMarkedDoubtful((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitExam = () => {
    if (!selectedExam) return;
    setIsExamInProgress(false);
    setShowSubmitConfirmModal(false);

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const bloomAnalysis: Record<string, { correct: number; total: number }> = {};
    const soloAnalysis: Record<string, { correct: number; total: number }> = {};

    selectedExam.questions.forEach((q) => {
      // Init taxonomy counters
      const bKey = q.bloomLevel.substring(0, 2);
      if (!bloomAnalysis[bKey]) bloomAnalysis[bKey] = { correct: 0, total: 0 };
      bloomAnalysis[bKey].total += 1;

      const sKey = q.soloLevel;
      if (!soloAnalysis[sKey]) soloAnalysis[sKey] = { correct: 0, total: 0 };
      soloAnalysis[sKey].total += 1;

      const userAns = answers[q.id];
      if (userAns === undefined) {
        unanswered += 1;
      } else if (userAns === q.correctAnswerIndex) {
        correct += 1;
        bloomAnalysis[bKey].correct += 1;
        soloAnalysis[sKey].correct += 1;
      } else {
        wrong += 1;
      }
    });

    const totalQ = selectedExam.questions.length;
    let finalScore = 0;
    let maxScore = 0;

    if (selectedExam.penaltyMode) {
      // OSN Standard: +4 Benar, -1 Salah, 0 Kosong
      finalScore = correct * 4 - wrong * 1;
      maxScore = totalQ * 4;
    } else {
      // Standard percentage: 100 scale
      finalScore = Math.round((correct / totalQ) * 100);
      maxScore = 100;
    }

    const percentage = Math.max(0, Math.round((correct / totalQ) * 100));

    let predicate: ExamResult['predicate'] = 'Perlu Bimbingan';
    if (percentage >= 85) predicate = 'Emas (Gold)';
    else if (percentage >= 70) predicate = 'Perak (Silver)';
    else if (percentage >= 55) predicate = 'Perunggu (Bronze)';
    else if (percentage >= selectedExam.passingScore) predicate = 'Lolos Passing Grade';

    const result: ExamResult = {
      id: `RES-${Date.now()}`,
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      subject: selectedExam.subject,
      studentId: currentUser.id,
      studentName: currentUser.name,
      nisn: currentUser.nisnOrNip,
      submittedAt: new Date().toISOString(),
      attemptNumber: currentExamAttemptNumber,
      totalQuestions: totalQ,
      answeredCount: totalQ - unanswered,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      score: finalScore,
      maxPossibleScore: maxScore,
      percentageScore: percentage,
      predicate,
      tabSwitchViolations,
      answers,
      markedDoubtful,
      bloomAnalysis,
      soloAnalysis,
    };

    setLastExamResult(result);
    onFinishExam(result);
  };

  const handleRequestAiRemediation = async (q: Question) => {
    setAiRemediationQuestion(q);
    setAiRemediationText(null);
    setIsAiLoading(true);

    try {
      const studentAnsIdx = answers[q.id];
      const studentAnsText =
        studentAnsIdx !== undefined && q.options[studentAnsIdx]
          ? q.options[studentAnsIdx]
          : 'Tidak dijawab (Kosong)';
      const correctAnsText =
        q.options && q.correctAnswerIndex >= 0 && q.options[q.correctAnswerIndex]
          ? q.options[q.correctAnswerIndex]
          : 'Kunci jawaban terlampir pada lembar pembahasan';

      const explanation = await explainQuestionRemediation({
        questionText: q.questionText,
        studentAnswer: studentAnsText,
        correctAnswer: correctAnsText,
        subject: q.subject,
        originalExplanation: q.explanation,
      });

      setAiRemediationText(explanation);
    } catch (e) {
      console.error(e);
      setAiRemediationText(
        q.explanation || 'Pembahasan ilmiah dapat dipelajari melalui buku panduan silabus OSN.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. ACTIVE CBT EXAM VIEW
  if (isExamInProgress && selectedExam) {
    const activeQ = selectedExam.questions[currentQuestionIndex];
    const isAnswered = answers[activeQ.id] !== undefined;
    const isDoubtful = markedDoubtful[activeQ.id] || false;

    return (
      <div className="space-y-4 pb-20 select-none">
        {/* Top Sticky CBT Bar */}
        <div className="bg-[#180e2f]/95 border border-purple-800/60 backdrop-blur rounded-2xl p-4 sticky top-20 z-30 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-950 text-purple-200 border border-purple-700/60">
              {selectedExam.subject} • {selectedExam.level}
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {selectedExam.title}
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 flex items-center gap-1 font-mono">
              <Shuffle className="w-3 h-3 text-cyan-400" />
              Soal Diacak Khusus: {currentUser.name}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/60 flex items-center gap-1 font-mono">
              <History className="w-3 h-3 text-blue-400" />
              Pengerjaan Ke-{currentExamAttemptNumber} Kali
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Timer with Pulsing Alert */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-extrabold ${
                remainingSeconds < 300
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-purple-950/80 border-purple-700/60 text-amber-300'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            {/* Anti Cheat Violation Counter Badge */}
            {tabSwitchViolations > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-600/60 text-rose-300 text-xs font-bold animate-bounce">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Tab Switch: {tabSwitchViolations}x</span>
              </div>
            )}

            {/* Finish Button */}
            <button
              disabled={questionTimeRemaining > 0}
              onClick={() => {
                if (questionTimeRemaining > 0) return;
                setShowSubmitConfirmModal(true);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
                questionTimeRemaining > 0
                  ? 'bg-emerald-950/50 border border-emerald-900/50 text-emerald-400/50 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
              }`}
              title={
                questionTimeRemaining > 0
                  ? `Wajib 60 detik di butir soal saat ini (${questionTimeRemaining}s tersisa)`
                  : 'Selesai dan kumpulkan ujian CBT'
              }
            >
              {questionTimeRemaining > 0 ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Selesai ({questionTimeRemaining}s)</span>
                </>
              ) : (
                <span>Selesai Ujian</span>
              )}
            </button>
          </div>
        </div>

        {/* Main Exam Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Display Panel (Left/Center Column) */}
          <div className="lg:col-span-8 bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-6 space-y-6 shadow-xl">
            {/* Question Header & Taxonomy Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {currentQuestionIndex + 1}
                </span>
                <span className="text-xs font-medium text-purple-300">
                  dari {selectedExam.questions.length} Butir Soal (Nomor Diacak)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 60s per-question timer badge */}
                {questionTimeRemaining > 0 ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tunggu {questionTimeRemaining} detik lagi</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>60d Terpenuhi • Navigasi Terbuka</span>
                  </div>
                )}

                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-semibold text-xs">
                  {activeQ.bloomLevel}
                </span>
                <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/60 font-semibold text-xs">
                  SOLO: {activeQ.soloLevel}
                </span>
              </div>
            </div>

            {/* 60s Question Timer Progress Bar */}
            <div className="space-y-1 bg-[#120723] p-2.5 rounded-xl border border-purple-900/40">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-300/90 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Wajib 60 Detik di Soal #{currentQuestionIndex + 1} sebelum lanjut/kembali:</span>
                </span>
                <span className={`font-mono font-bold ${questionTimeRemaining > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {questionTimeRemaining > 0 ? `${questionTimeRemaining} detik tersisa` : 'Siap pindah soal ✓'}
                </span>
              </div>
              <div className="w-full bg-[#1c0e35] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    questionTimeRemaining > 0
                      ? 'bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, ((60 - questionTimeRemaining) / 60) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base font-normal text-white leading-relaxed">
              {activeQ.questionText}
            </div>

            {/* Formula / Scientific Context if exists */}
            {activeQ.formulaOrContext && (
              <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-700/50 font-mono text-xs text-amber-300 leading-normal">
                <span className="text-purple-400 font-sans block text-[10px] uppercase font-bold mb-1">
                  Formula / Konteks Rujukan:
                </span>
                {activeQ.formulaOrContext}
              </div>
            )}

            {/* 5 Radio Options A, B, C, D, E */}
            <div className="space-y-2.5 pt-2">
              {activeQ.options.map((option, optIdx) => {
                const isSelected = answers[activeQ.id] === optIdx;
                const optionLetters = ['A', 'B', 'C', 'D', 'E'];

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(activeQ.id, optIdx)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-950'
                        : 'bg-[#120924]/70 border-purple-900/40 text-purple-200 hover:border-purple-700 hover:bg-[#120924]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-purple-500 border-white text-white'
                          : 'bg-purple-950/80 border-purple-700/60 text-purple-300'
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-normal">{option}</span>
                  </div>
                );
              })}
            </div>

            {/* Navigation & Doubtful Flag Buttons */}
            <div className="pt-6 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={currentQuestionIndex === 0 || questionTimeRemaining > 0}
                onClick={() => {
                  if (questionTimeRemaining > 0) return;
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  currentQuestionIndex === 0 || questionTimeRemaining > 0
                    ? 'bg-purple-950/40 border-purple-900/40 text-purple-400/50 cursor-not-allowed opacity-60'
                    : 'bg-purple-950 border-purple-800/60 hover:bg-purple-900 text-purple-200 cursor-pointer shadow-md'
                }`}
                title={
                  questionTimeRemaining > 0
                    ? `Wajib 60 detik di butir soal ini (${questionTimeRemaining}s tersisa)`
                    : 'Kembali ke Soal Sebelumnya'
                }
              >
                {questionTimeRemaining > 0 ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Soal Sebelumnya ({questionTimeRemaining}s)</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Soal Sebelumnya</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleToggleDoubtful(activeQ.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDoubtful
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-purple-950 border-purple-800/60 text-purple-300 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isDoubtful ? 'Tandai Ragu-Ragu (Aktif)' : 'Ragu-Ragu'}</span>
              </button>

              {currentQuestionIndex < selectedExam.questions.length - 1 ? (
                <button
                  disabled={questionTimeRemaining > 0}
                  onClick={() => {
                    if (questionTimeRemaining > 0) return;
                    setCurrentQuestionIndex((prev) =>
                      Math.min(selectedExam.questions.length - 1, prev + 1)
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    questionTimeRemaining > 0
                      ? 'bg-purple-900/40 border border-purple-800/40 text-purple-300/50 cursor-not-allowed opacity-60'
                      : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-purple-900/50 hover:scale-[1.02]'
                  }`}
                  title={
                    questionTimeRemaining > 0
                      ? `Wajib 60 detik di butir soal ini (${questionTimeRemaining}s tersisa)`
                      : 'Lanjut ke Soal Selanjutnya'
                  }
                >
                  {questionTimeRemaining > 0 ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Soal Selanjutnya ({questionTimeRemaining}s)</span>
                    </>
                  ) : (
                    <>
                      <span>Soal Selanjutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled={questionTimeRemaining > 0}
                  onClick={() => {
                    if (questionTimeRemaining > 0) return;
                    setShowSubmitConfirmModal(true);
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                    questionTimeRemaining > 0
                      ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400/50 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-900/50 hover:scale-[1.02]'
                  }`}
                  title={
                    questionTimeRemaining > 0
                      ? `Wajib 60 detik di butir soal ini (${questionTimeRemaining}s tersisa)`
                      : 'Kirim Jawaban dan Selesai Ujian'
                  }
                >
                  {questionTimeRemaining > 0 ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Selesai Ujian ({questionTimeRemaining}s)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selesai Ujian</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Grid (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Navigasi Nomor Soal
                </h3>
                <div className="flex items-center gap-1.5">
                  {questionTimeRemaining > 0 ? (
                    <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60 font-mono animate-pulse">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Kunci: {questionTimeRemaining}s
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Terbuka
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-cyan-300 flex items-center gap-1 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60 font-mono">
                    <Shuffle className="w-3 h-3 text-cyan-400" />
                    Diacak
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-purple-300/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-600" />
                  <span>Dijawab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500" />
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#120924] border border-purple-800" />
                  <span>Belum</span>
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {selectedExam.questions.map((q, idx) => {
                  const hasAnswer = answers[q.id] !== undefined;
                  const isDoubt = markedDoubtful[q.id];
                  const isCurrent = idx === currentQuestionIndex;
                  const isLocked = questionTimeRemaining > 0 && !isCurrent;

                  let bgClass = 'bg-[#120924] text-purple-300 border-purple-800/60';
                  if (isDoubt) {
                    bgClass = 'bg-amber-500 text-slate-900 border-amber-300 font-extrabold';
                  } else if (hasAnswer) {
                    bgClass = 'bg-purple-600 text-white border-purple-400 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) return;
                        setCurrentQuestionIndex(idx);
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center text-xs border transition-all ${bgClass} ${
                        isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#180e2f]' : ''
                      } ${
                        isLocked
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer hover:scale-105'
                      }`}
                      title={
                        isLocked
                          ? `Tunggu 60 detik di butir soal aktif (${questionTimeRemaining}s tersisa)`
                          : `Pindah ke Soal ${idx + 1}`
                      }
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="pt-3 border-t border-purple-900/40 text-xs space-y-1.5 text-purple-300/80">
                <div className="flex justify-between">
                  <span>Sudah Terjawab:</span>
                  <span className="font-bold text-purple-200">{Object.keys(answers).length} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Ragu-Ragu:</span>
                  <span className="font-bold text-amber-300">
                    {Object.values(markedDoubtful).filter(Boolean).length} Butir
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Soal:</span>
                  <span className="font-bold text-rose-300">
                    {selectedExam.questions.length - Object.keys(answers).length} Butir
                  </span>
                </div>
                <div className="pt-2 text-[10px] text-purple-400/90 flex items-center gap-1.5 border-t border-purple-900/30">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Aturan CBT: Wajib 60 detik per butir soal sebelum dapat berpindah soal.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Cheat Tab Switching Warning Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1f0f38] border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-shake">
              <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Peringatan Pelanggaran Tab Switch #{tabSwitchViolations}!
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                Sistem CBT SMAN 1 Pardasuka mendeteksi Anda meninggalkan jendela ujian (berpindah tab
                atau membuka aplikasi lain). Pelanggaran ini dicatat ke log proktor dan diekspor ke
                Google Spreadsheet.
              </p>
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-mono font-bold">
                Total Pelanggaran: {tabSwitchViolations} kali
              </div>
              <button
                onClick={() => setShowViolationModal(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-colors"
              >
                Saya Mengerti & Kembali Mengerjakan Ujian
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#190d33] border border-purple-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Konfirmasi Penyelesaian Ujian CBT
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Apakah Anda yakin ingin mengakhiri sesi ujian ini? Pastikan seluruh butir soal telah
                diperiksa dengan seksama.
              </p>

              <div className="bg-[#120924] p-3 rounded-xl border border-purple-900/60 text-xs space-y-1 text-purple-200">
                <div className="flex justify-between">
                  <span>Total Soal:</span>
                  <span className="font-bold text-white">{selectedExam.questions.length} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Sudah Dijawab:</span>
                  <span className="font-bold text-emerald-400">{Object.keys(answers).length} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Masih Ragu-Ragu:</span>
                  <span className="font-bold text-amber-400">
                    {Object.values(markedDoubtful).filter(Boolean).length} Butir
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-semibold cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Kirim Jawaban Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. EXAM RESULTS & DIAGNOSTIC VIEW
  if (lastExamResult && selectedExam) {
    return (
      <div className="space-y-6 pb-20">
        {/* Results Banner */}
        <div className="bg-gradient-to-br from-[#20103e] via-[#160c2d] to-[#0e0618] border border-purple-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-950 border border-purple-700/60 text-purple-300">
                HASIL RESMI CBT • SMAN 1 PARDASUKA
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                {lastExamResult.examTitle}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <p className="text-xs text-purple-300/80">
                  Peserta: {lastExamResult.studentName} ({lastExamResult.nisn}) • {lastExamResult.subject}
                </p>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700/60 font-mono">
                  Pengerjaan Ke-{lastExamResult.attemptNumber || 1} Kali
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedExamIdForRecap(lastExamResult.examId);
                  setShowRecapModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-600 border border-amber-500/60 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-200" />
                <span>Lihat Rekapan Hasil CBT</span>
              </button>
              <button
                onClick={() =>
                  printCbtResultPdf(
                    lastExamResult,
                    selectedExam?.questions || exams.find((e) => e.id === lastExamResult.examId)?.questions
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Hasil + Soal & Pembahasan (PDF)</span>
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={async () => {
                    if (onSendToGoogleSheets) {
                      const ok = await onSendToGoogleSheets(lastExamResult);
                      if (ok) setSyncedToGas(true);
                    }
                  }}
                  disabled={syncedToGas}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{syncedToGas ? 'Tersimpan di Google Sheets ✓' : 'Kirim ke Google Sheets (GAS)'}</span>
                </button>
              )}
              {currentUser.role !== 'student' && (
                <button
                  onClick={() => {
                    const matchedExam =
                      selectedExam || exams.find((e) => e.id === lastExamResult.examId) || null;
                    setSelectedExamForAnalysis(matchedExam);
                    setShowExamAnalysisModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-200 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Analisis Butir Soal CBT</span>
                </button>
              )}
              <button
                onClick={() => {
                  setLastExamResult(null);
                  setSelectedExam(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Daftar Ujian
              </button>
            </div>
          </div>

          {/* KPI Score Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="bg-[#180e2f] border border-blue-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-blue-300/80 font-semibold">Pengerjaan Ke-</span>
              <div className="text-3xl font-black text-cyan-300 mt-1">
                {lastExamResult.attemptNumber || 1}x
              </div>
              <span className="text-[10px] text-cyan-400">Percobaan Siswa</span>
            </div>

            <div className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-purple-300/70 font-semibold">Skor Akhir (OSN)</span>
              <div className="text-3xl font-black text-amber-300 mt-1">{lastExamResult.score}</div>
              <span className="text-[10px] text-purple-400">Maksimal: {lastExamResult.maxPossibleScore}</span>
            </div>

            <div className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-purple-300/70 font-semibold">Persentase</span>
              <div className="text-3xl font-black text-white mt-1">{lastExamResult.percentageScore}%</div>
              <span className="text-[10px] text-emerald-400">{lastExamResult.predicate}</span>
            </div>

            <div className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-purple-300/70 font-semibold">Jawaban Benar</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {lastExamResult.correctCount}
              </div>
              <span className="text-[10px] text-purple-400">+{lastExamResult.correctCount * 4} Poin</span>
            </div>

            <div className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-4 text-center">
              <span className="text-xs text-purple-300/70 font-semibold">Jawaban Salah</span>
              <div className="text-3xl font-black text-rose-400 mt-1">
                {lastExamResult.wrongCount}
              </div>
              <span className="text-[10px] text-rose-400">-{lastExamResult.wrongCount * 1} Poin (Penalti)</span>
            </div>

            <div className="bg-[#180e2f] border border-purple-800/40 rounded-xl p-4 text-center col-span-2 lg:col-span-1">
              <span className="text-xs text-purple-300/70 font-semibold">Tab Switch Pelanggaran</span>
              <div
                className={`text-3xl font-black mt-1 ${
                  lastExamResult.tabSwitchViolations > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {lastExamResult.tabSwitchViolations}x
              </div>
              <span className="text-[10px] text-purple-400">Integritas 1-Device</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Analysis: Taksonomi Bloom & Taksonomi SOLO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloom Analysis Card */}
          <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" /> Penguasaan Taksonomi Bloom (C1 - C6)
            </h3>
            <div className="space-y-2.5">
              {Object.entries(lastExamResult.bloomAnalysis).map(([key, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-purple-200">Kategori {key}</span>
                      <span className="text-purple-300">
                        {data.correct} / {data.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#120924] h-2 rounded-full overflow-hidden border border-purple-900/40">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SOLO Analysis Card */}
          <div className="bg-[#180e2f]/90 border border-purple-800/40 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" /> Struktur Hasil Belajar (Taksonomi SOLO)
            </h3>
            <div className="space-y-2.5">
              {Object.entries(lastExamResult.soloAnalysis).map(([key, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-purple-200">{key}</span>
                      <span className="text-purple-300">
                        {data.correct} / {data.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#120924] h-2 rounded-full overflow-hidden border border-purple-900/40">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Per Butir Soal & Remediasi AI */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Pembahasan Lengkap & Konsultasi Remediasi AI
          </h3>

          <div className="space-y-4">
            {selectedExam.questions.map((q, idx) => {
              const studentAns = lastExamResult.answers[q.id];
              const isCorrect = studentAns === q.correctAnswerIndex;
              const isUnanswered = studentAns === undefined;

              return (
                <div
                  key={q.id}
                  className={`bg-[#180e2f]/80 border rounded-2xl p-5 space-y-4 transition-all ${
                    isCorrect
                      ? 'border-emerald-700/60'
                      : isUnanswered
                      ? 'border-purple-800/40'
                      : 'border-rose-700/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-700">
                        Soal #{idx + 1}
                      </span>
                      <span className="font-semibold text-indigo-300">{q.bloomLevel}</span>
                      <span className="text-pink-300">SOLO: {q.soloLevel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Benar (+4)
                        </span>
                      )}
                      {!isCorrect && !isUnanswered && (
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 font-bold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Salah (-1)
                        </span>
                      )}
                      {isUnanswered && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          Tidak Dijawab (0)
                        </span>
                      )}

                      {!isCorrect && (
                        <button
                          onClick={() => handleRequestAiRemediation(q)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-colors shadow"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Tanya Guru AI</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white leading-relaxed">{q.questionText}</p>

                  {q.formulaOrContext && (
                    <div className="p-2.5 rounded-lg bg-purple-950/70 border border-purple-800/50 font-mono text-xs text-amber-300">
                      {q.formulaOrContext}
                    </div>
                  )}

                  {/* Options with marked student answer and correct answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isUserChoice = studentAns === oIdx;
                      const isRealAnswer = q.correctAnswerIndex === oIdx;

                      let borderStyle = 'border-purple-900/40 bg-[#120924]/60 text-purple-200';
                      if (isRealAnswer) {
                        borderStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                      } else if (isUserChoice && !isCorrect) {
                        borderStyle = 'border-rose-500 bg-rose-950/70 text-rose-200 line-through';
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${borderStyle}`}>
                          <span>{opt}</span>
                          {isRealAnswer && (
                            <span className="text-[10px] uppercase font-bold text-emerald-400">
                              Kunci Jawaban
                            </span>
                          )}
                          {isUserChoice && !isRealAnswer && (
                            <span className="text-[10px] uppercase font-bold text-rose-400">
                              Pilihan Anda
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-[#120924]/80 border border-purple-900/50 text-xs text-purple-200/90 leading-relaxed">
                    <strong className="text-amber-400 block mb-1">Pembahasan Resmi:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Remediation Drawer/Modal */}
        {aiRemediationQuestion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1b0d36] border border-purple-600 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Konsultasi Pedagogis AI Pembina</h4>
                </div>
                <button
                  onClick={() => setAiRemediationQuestion(null)}
                  className="text-purple-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-purple-200/80 line-clamp-2 italic">
                "{aiRemediationQuestion.questionText}"
              </div>

              {isAiLoading ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-purple-300">
                    Guru AI sedang menganalisis pola kesalahan dan menyusun tips percepatan...
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#120924] border border-purple-800 text-xs text-purple-200 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                  {aiRemediationText}
                </div>
              )}

              <button
                onClick={() => setAiRemediationQuestion(null)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Konsultasi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQText || !manualQOptA || !manualQOptB) return;
    const newQ: Question = {
      id: `CBT-MANUAL-${Date.now()}-${cbtNewQuestions.length}`,
      subject: cbtSubject,
      topic: 'Ujian CBT ' + cbtSubject,
      level: cbtLevel,
      difficulty: 'HOTS / Sulit',
      bloomLevel: 'C4 (Menganalisis)',
      soloLevel: 'Relational',
      questionText: manualQText,
      formulaOrContext: manualQFormula || undefined,
      options: [
        `A. ${manualQOptA}`,
        `B. ${manualQOptB}`,
        `C. ${manualQOptC || '-'}`,
        `D. ${manualQOptD || '-'}`,
        `E. ${manualQOptE || '-'}`,
      ],
      correctAnswerIndex: manualQCorrectIdx,
      explanation: manualQExplanation || 'Kunci pembahasan resmi CBT SMAN 1 Pardasuka.',
      author: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCbtNewQuestions((prev) => [...prev, newQ]);
    setManualQText('');
    setManualQFormula('');
    setManualQOptA('');
    setManualQOptB('');
    setManualQOptC('');
    setManualQOptD('');
    setManualQOptE('');
    setManualQExplanation('');
    setShowManualForm(false);
  };

  const [isGeneratingCbtAi, setIsGeneratingCbtAi] = useState(false);

  const handleGenerateCbtQuestionsAi = async () => {
    setIsGeneratingCbtAi(true);
    try {
      const res = await generateOsnQuestions({
        subject: cbtSubject,
        level: cbtLevel,
        bloomTaxonomy: 'C4 (Menganalisis)',
        soloTaxonomy: 'Relational',
        count: 5,
        purpose: 'cbt',
        reasoningLevel: 'sedang',
        topic: cbtTitle || 'Ujian CBT Terstandarisasi',
        questionType: 'pilihan_ganda',
      });

      if (res && res.questions && res.questions.length > 0) {
        setCbtNewQuestions((prev) => [...prev, ...res.questions]);
        saveMultipleQuestionsToFirestore(res.questions).catch((err) =>
          console.warn('Firebase CBT questions sync warning:', err)
        );
      }
    } catch (err) {
      console.error('Failed to generate CBT AI questions:', err);
      alert('Gagal menghasilkan soal CBT dengan AI. Silakan coba lagi.');
    } finally {
      setIsGeneratingCbtAi(false);
    }
  };

  const handleShuffleSelectedQuestions = () => {
    if (selectedBankQuestionIds.length > 1) {
      setSelectedBankQuestionIds((prev) => shuffleQuestionsArray(prev));
    }
    if (cbtNewQuestions.length > 1) {
      setCbtNewQuestions((prev) => shuffleQuestionsArray(prev));
    }
  };

  const handleSaveCbtExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbtTitle) return;

    const selectedBankQuestions = questionBank.filter((q) =>
      selectedBankQuestionIds.includes(q.id)
    );
    // Pertahankan urutan yang telah disusun atau diacak di selectedBankQuestionIds
    const orderedBankQuestions: Question[] = [];
    selectedBankQuestionIds.forEach((id) => {
      const found = selectedBankQuestions.find((q) => q.id === id);
      if (found) orderedBankQuestions.push(found);
    });

    let allAssembledQuestions = [...orderedBankQuestions, ...cbtNewQuestions];

    if (allAssembledQuestions.length === 0) {
      alert('Peringatan: Silakan pilih minimal 1 butir soal dari Bank Soal atau buat soal CBT manual/AI untuk jadwal ini.');
      return;
    }

    // Jika fitur acak urutan nomor soal saat menyusun aktif, acak urutan nomor soal agar tidak berurutan
    if (cbtShuffleOnAssemble && allAssembledQuestions.length > 1) {
      allAssembledQuestions = shuffleQuestionsArray(allAssembledQuestions);
    }

    const newExamPacket: ExamPacket = {
      id: `EXAM-CBT-${Date.now()}`,
      title: cbtTitle,
      subject: cbtSubject,
      level: cbtLevel,
      durationMinutes: cbtDuration,
      penaltyMode: cbtPenalty,
      passingScore: cbtPassingScore,
      instructions: cbtInstructions,
      scheduledDate: cbtDate,
      timeStart: cbtTimeStart,
      timeEnd: cbtTimeEnd,
      status: 'Akan Datang',
      shuffleQuestionsPerAccount: cbtPerAccountShuffle,
      questions: allAssembledQuestions,
    };

    if (onAddExamPacket) {
      onAddExamPacket(newExamPacket);
    }

    // Direct Firestore sync resilience for Firebase & Vercel
    saveExamPacketToFirestore(newExamPacket).catch((err) =>
      console.warn('Firebase CBT exam packet sync warning:', err)
    );
    saveMultipleQuestionsToFirestore(allAssembledQuestions).catch((err) =>
      console.warn('Firebase CBT questions sync warning:', err)
    );

    setShowCreateCbtModal(false);
    setCbtTitle('');
    setSelectedBankQuestionIds([]);
    setCbtNewQuestions([]);
  };

  // 2b. EXAM QUESTION ANALYSIS VIEW (Untuk Guru Pembina & Admin)
  if (showExamAnalysisModal) {
    const allQuestionsPool = Array.from(
      new Map(
        [...exams.flatMap((e) => e.questions), ...questionBank].map((q) => [q.id, q])
      ).values()
    );

    const questionsToAnalyze = selectedExamForAnalysis
      ? selectedExamForAnalysis.questions
      : currentUser.role === 'admin'
      ? allQuestionsPool
      : allQuestionsPool.filter((q) => q.subject === userSelectedSubject);

    return (
      <div className="space-y-5 pb-20">
        <div className="bg-[#1b0d36]/90 border border-purple-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                ANALISIS BUTIR SOAL UJIAN CBT
              </span>
              <span className="text-xs text-purple-300/80 font-medium">
                Akun Guru Pembina • SMAN 1 Pardasuka
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              {selectedExamForAnalysis
                ? `Analisis Paket: ${selectedExamForAnalysis.title}`
                : `Analisis Soal CBT ${currentUser.role === 'admin' ? 'Semua Bidang' : 'Bidang ' + userSelectedSubject}`}
            </h2>
            <p className="text-xs text-purple-200/80 mt-0.5">
              {selectedExamForAnalysis
                ? `Menganalisis ${selectedExamForAnalysis.questions.length} butir soal pada paket ${selectedExamForAnalysis.subject} (${selectedExamForAnalysis.level})`
                : `Menganalisis total ${questionsToAnalyze.length} butir soal terkalibrasi untuk ${currentUser.role === 'admin' ? 'seluruh bidang OSN' : 'bidang ' + userSelectedSubject}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedExamForAnalysis && (
              <button
                onClick={() => setSelectedExamForAnalysis(null)}
                className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900 border border-purple-700/60 text-xs font-semibold text-purple-200 cursor-pointer transition-all"
              >
                Lihat Semua Paket Soal {currentUser.role === 'admin' ? '' : userSelectedSubject}
              </button>
            )}
            <button
              onClick={() => {
                setShowExamAnalysisModal(false);
                setSelectedExamForAnalysis(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog CBT</span>
            </button>
          </div>
        </div>

        <QuestionAnalysisView
          questions={questionsToAnalyze}
          exams={visibleExams}
          examResults={examResults}
          currentUser={currentUser}
          onClose={() => {
            setShowExamAnalysisModal(false);
            setSelectedExamForAnalysis(null);
          }}
          setActiveTab={setActiveTab}
        />
      </div>
    );
  }

  // 3. EXAM PACKAGES CATALOG (Default state)
  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-emerald-400" />
              Katalog Ujian & Simulasi CBT Olimpiade Sains
            </h1>
            {currentUser.role !== 'admin' ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                Mapel Pilihan: {userSelectedSubject}
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 font-mono">
                Semua Bidang (Admin Master)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-purple-300/80">
            {currentUser.role !== 'admin'
              ? `Paket ujian CBT terkalibrasi khusus bidang ${userSelectedSubject} dengan proteksi 1-perangkat SMAN 1 Pardasuka.`
              : 'Ujian terstandarisasi dengan durasi countdown ketat, aturan minus OSN, dan proteksi 1-perangkat SMAN 1 Pardasuka.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setSelectedExamIdForRecap('all');
              setShowRecapModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/60 text-amber-300 text-xs font-bold shadow-md transition-all cursor-pointer hover:border-amber-400"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Rekapan Pengerjaan CBT ({examResults.length})</span>
          </button>

          {currentUser.role !== 'student' && (
            <>
              <button
                onClick={() => {
                  setSelectedExamForAnalysis(null);
                  setShowExamAnalysisModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-200 text-xs font-bold shadow-md transition-all cursor-pointer hover:border-cyan-400"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Analisis Butir Soal CBT</span>
              </button>
              <button
                onClick={() => setShowCreateCbtModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>+ Buat Jadwal CBT & Susun Soal CBT</span>
              </button>
            </>
          )}
        </div>
      </div>

      {visibleExams.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#180e2f]/80 border border-purple-800/40 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-white">
            Belum Ada Paket Ujian CBT untuk Bidang {userSelectedSubject}
          </h3>
          <p className="text-xs text-purple-300/80 max-w-md mx-auto">
            {currentUser.role === 'teacher'
              ? 'Anda dapat menyusun jadwal dan paket soal CBT baru khusus bidang ini menggunakan tombol di atas.'
              : 'Guru Pembina bidang ini belum mengagendakan simulasi CBT aktif. Silakan hubungi Guru Pembina OSN Anda.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-[#180e2f]/90 border border-purple-800/40 hover:border-purple-600/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-700/60">
                  {exam.subject}
                </span>
                <span className="text-xs font-semibold text-amber-400">{exam.level}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-tight">{exam.title}</h3>

              <div className="space-y-1.5 text-xs text-purple-300/80 pt-1">
                {(exam.scheduledDate || exam.timeStart) && (
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Jadwal: {exam.scheduledDate || 'Sesuai Jadwal'}
                      {exam.timeStart ? ` (${exam.timeStart} - ${exam.timeEnd || 'Selesai'} WIB)` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Durasi Pengerjaan: {exam.durationMinutes} Menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Jumlah Soal: {exam.questions.length} Butir</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Skor: {exam.penaltyMode ? 'OSN (+4 Benar, -1 Salah, 0 Kosong)' : 'Skala 100'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300/90 font-medium bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-800/40 w-fit">
                  <Shuffle className="w-3 h-3 text-cyan-400" />
                  <span>Beda Akun Beda Nomor Soal (Acak)</span>
                </div>

                {/* Info Jumlah Siswa Mengerjakan & Frekuensi Pengerjaan */}
                {(() => {
                  const examResultsList = (examResults || []).filter((r) => r.examId === exam.id);
                  const studentsCount = new Set(examResultsList.map((r) => r.studentId)).size;
                  const totalAttempts = examResultsList.length;
                  const myAttempts = examResultsList.filter((r) => r.studentId === currentUser.id);

                  return (
                    <div className="space-y-1.5 pt-1.5 border-t border-purple-900/40">
                      <div className="flex items-center justify-between text-xs bg-purple-950/60 p-2.5 rounded-xl border border-purple-800/40">
                        <div className="flex items-center gap-1.5 text-purple-200 font-semibold">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{studentsCount} Siswa Mengerjakan</span>
                        </div>
                        <span className="font-bold text-amber-300 font-mono text-[11px] bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/40">
                          {totalAttempts}x Pengerjaan
                        </span>
                      </div>

                      {myAttempts.length > 0 && (
                        <div className="flex items-center justify-between text-[11px] bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-800/40 text-blue-200">
                          <span className="flex items-center gap-1 font-medium">
                            <History className="w-3 h-3 text-blue-400" />
                            Pengerjaan Anda: {myAttempts.length}x
                          </span>
                          <span className="font-mono text-emerald-300 font-bold">
                            Skor Terakhir: {myAttempts[0].score}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <p className="text-[11px] text-purple-300/60 line-clamp-2 pt-1 border-t border-purple-900/30">
                {exam.instructions}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-purple-900/40 space-y-2">
              <button
                onClick={() => handleStartExam(exam)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Cpu className="w-4 h-4 text-emerald-300" />
                Mulai Ujian CBT Sekarang
              </button>

              <button
                onClick={() => {
                  setSelectedExamIdForRecap(exam.id);
                  setShowRecapModal(true);
                }}
                className="w-full py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Lihat Rekap ({((examResults || []).filter((r) => r.examId === exam.id)).length} Pengerjaan)
                </span>
              </button>

              {currentUser.role !== 'student' && (
                <button
                  onClick={() => {
                    setSelectedExamForAnalysis(exam);
                    setShowExamAnalysisModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 hover:border-cyan-400 text-cyan-200 font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Analisis Butir Soal CBT</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Buat Jadwal CBT & Susun Soal CBT oleh Guru */}
      {showCreateCbtModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180d30] border border-purple-600 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Buat Jadwal CBT & Susun Soal Ujian</h3>
                  <p className="text-[11px] text-purple-300/80">Disusun oleh Guru Pembina OSN SMAN 1 Pardasuka</p>
                </div>
              </div>
              <button onClick={() => setShowCreateCbtModal(false)} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCbtExam} className="space-y-4 text-xs">
              {/* Exam Info */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#120822] border border-purple-900/60">
                <h4 className="font-bold text-amber-300 text-xs">1. Identitas & Pengaturan Jadwal CBT</h4>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Judul Ujian CBT:</label>
                  <input
                    type="text"
                    required
                    value={cbtTitle}
                    onChange={(e) => setCbtTitle(e.target.value)}
                    placeholder="Contoh: Tryout Akbar OSN-K 2026 Seri B - Matematika"
                    className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Bidang OSN:</label>
                    {currentUser.role === 'admin' ? (
                      <select
                        aria-label="Pilih Bidang CBT"
                        value={cbtSubject}
                        onChange={(e) => setCbtSubject(e.target.value as OsnSubject)}
                        className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                      >
                        {['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Informatika', 'Astronomi', 'Kebumian', 'Ekonomi', 'Geografi'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full bg-[#140b27] border border-cyan-700/60 rounded-xl px-3 py-2 text-cyan-200 text-xs font-bold flex items-center justify-between">
                        <span>{userSelectedSubject}</span>
                        <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-800">Terkunci Guru</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Tingkat:</label>
                    <select
                      aria-label="Pilih Tingkat Kompetisi"
                      value={cbtLevel}
                      onChange={(e) => setCbtLevel(e.target.value as CompetitionLevel)}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="Kabupaten (OSN-K)">Kabupaten (OSN-K)</option>
                      <option value="Provinsi (OSN-P)">Provinsi (OSN-P)</option>
                      <option value="Nasional (OSN-N)">Nasional (OSN-N)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Durasi (Menit):</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={180}
                      value={cbtDuration}
                      onChange={(e) => setCbtDuration(Number(e.target.value))}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Tanggal Ujian CBT:</label>
                    <input
                      type="date"
                      required
                      value={cbtDate}
                      onChange={(e) => setCbtDate(e.target.value)}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Waktu Mulai Ujian:</label>
                    <input
                      type="time"
                      required
                      value={cbtTimeStart}
                      onChange={(e) => setCbtTimeStart(e.target.value)}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Waktu Selesai Ujian:</label>
                    <input
                      type="time"
                      required
                      value={cbtTimeEnd}
                      onChange={(e) => setCbtTimeEnd(e.target.value)}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Model Skor:</label>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          checked={cbtPenalty === true}
                          onChange={() => setCbtPenalty(true)}
                          className="accent-purple-500"
                        />
                        <span>Standar OSN (+4, -1, 0)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          checked={cbtPenalty === false}
                          onChange={() => setCbtPenalty(false)}
                          className="accent-purple-500"
                        />
                        <span>Skala 100</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">Passing Grade Skor:</label>
                    <input
                      type="number"
                      value={cbtPassingScore}
                      onChange={(e) => setCbtPassingScore(Number(e.target.value))}
                      className="w-full bg-[#180e2f] border border-purple-700/60 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Question Assembly Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#120822] border border-purple-900/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-amber-300 text-xs">
                    2. Susun Butir Soal CBT (Total: {selectedBankQuestionIds.length + cbtNewQuestions.length} Soal)
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isGeneratingCbtAi}
                      onClick={handleGenerateCbtQuestionsAi}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                      title="Generate 5 butir soal CBT standar OSN khusus dengan Gemini Flash 3.8 & Penalaran Sedang"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-cyan-200 ${isGeneratingCbtAi ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingCbtAi ? 'Menalar Soal CBT AI...' : '+ Generate Soal CBT AI'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleSelectedQuestions}
                      disabled={selectedBankQuestionIds.length + cbtNewQuestions.length <= 1}
                      title="Acak urutan nomor butir soal agar tidak berurutan"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
                    >
                      <Shuffle className="w-3 h-3 text-amber-400" />
                      Acak Nomor Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualForm(!showManualForm)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 border border-purple-500 text-white font-semibold text-[11px] cursor-pointer"
                    >
                      {showManualForm ? 'Tutup Form Soal Manual' : '+ Tulis Soal Baru Manual'}
                    </button>
                  </div>
                </div>

                {/* Shuffling Options & Status Notice for Guru */}
                <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-800/60 space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer text-purple-200">
                      <input
                        type="checkbox"
                        checked={cbtShuffleOnAssemble}
                        onChange={(e) => setCbtShuffleOnAssemble(e.target.checked)}
                        className="accent-purple-500 rounded cursor-pointer"
                      />
                      <span>Acak nomor soal saat dirilis (Nomor tidak berurutan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={cbtPerAccountShuffle}
                        onChange={(e) => setCbtPerAccountShuffle(e.target.checked)}
                        className="accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Beda Akun Beda Nomor Soal (Pengacakan Unik per Akun Siswa)
                      </span>
                    </label>
                  </div>
                  {selectedBankQuestionIds.length + cbtNewQuestions.length > 0 && (
                    <div className="pt-2 border-t border-purple-900/60 text-[10px] text-purple-300/80 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Shuffle className="w-3 h-3 text-emerald-400" />
                        Status Susunan Soal: {selectedBankQuestionIds.length + cbtNewQuestions.length} butir terpilih
                      </span>
                      <span className="text-cyan-300 font-mono">
                        {cbtShuffleOnAssemble ? '• Nomor diacak tidak berurutan' : '• Nomor berurutan'}
                        {cbtPerAccountShuffle ? ' • Tiap akun beda urutan' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subform: Write new manual question */}
                {showManualForm && (
                  <div className="p-3.5 rounded-xl bg-[#1a0e33] border border-purple-700 space-y-2.5 animate-fadeIn">
                    <span className="font-bold text-white block text-xs">Tambah Butir Soal Baru untuk Paket CBT:</span>
                    <div>
                      <label className="block text-purple-300 text-[11px] mb-1">Teks Soal:</label>
                      <textarea
                        rows={2}
                        value={manualQText}
                        onChange={(e) => setManualQText(e.target.value)}
                        placeholder="Tuliskan narasi soal olimpiade..."
                        className="w-full bg-[#110720] border border-purple-800 rounded-lg p-2 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 text-[11px] mb-1">Formula / Rumus Terkait (Opsional):</label>
                      <input
                        type="text"
                        value={manualQFormula}
                        onChange={(e) => setManualQFormula(e.target.value)}
                        placeholder="Contoh: ax² + bx + c = 0"
                        className="w-full bg-[#110720] border border-purple-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-purple-300 block mb-0.5">Opsi A:</label>
                        <input
                          type="text"
                          value={manualQOptA}
                          onChange={(e) => setManualQOptA(e.target.value)}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 block mb-0.5">Opsi B:</label>
                        <input
                          type="text"
                          value={manualQOptB}
                          onChange={(e) => setManualQOptB(e.target.value)}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 block mb-0.5">Opsi C:</label>
                        <input
                          type="text"
                          value={manualQOptC}
                          onChange={(e) => setManualQOptC(e.target.value)}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 block mb-0.5">Opsi D:</label>
                        <input
                          type="text"
                          value={manualQOptD}
                          onChange={(e) => setManualQOptD(e.target.value)}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-purple-300 block mb-0.5">Opsi E:</label>
                        <input
                          type="text"
                          value={manualQOptE}
                          onChange={(e) => setManualQOptE(e.target.value)}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-purple-300 block mb-0.5">Kunci Jawaban Benar:</label>
                        <select
                          aria-label="Pilih Kunci Jawaban Benar"
                          value={manualQCorrectIdx}
                          onChange={(e) => setManualQCorrectIdx(Number(e.target.value))}
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        >
                          <option value={0}>A</option>
                          <option value={1}>B</option>
                          <option value={2}>C</option>
                          <option value={3}>D</option>
                          <option value={4}>E</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-purple-300 block mb-0.5">Pembahasan Singkat:</label>
                        <input
                          type="text"
                          value={manualQExplanation}
                          onChange={(e) => setManualQExplanation(e.target.value)}
                          placeholder="Penjelasan ilmiah langkah pengerjaan"
                          className="w-full bg-[#110720] border border-purple-800 rounded p-1.5 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddManualQuestion}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        + Simpan Soal ke Paket CBT
                      </button>
                    </div>
                  </div>
                )}

                {/* List Soal Baru / AI yang Disusun */}
                {cbtNewQuestions.length > 0 && (
                  <div className="space-y-2 p-3 rounded-xl bg-purple-950/50 border border-purple-800/80">
                    <div className="flex items-center justify-between">
                      <span className="block font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Soal CBT Tergenerate AI / Manual ({cbtNewQuestions.length} Butir):
                      </span>
                      <button
                        type="button"
                        onClick={() => setCbtNewQuestions([])}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Bersihkan Semua
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {cbtNewQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-2 rounded-lg bg-[#140a28] border border-purple-800/70 flex items-start justify-between gap-2 text-[11px]"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-cyan-300">#{idx + 1} {q.id}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900 text-purple-200">{q.bloomLevel}</span>
                              <span className="text-[10px] text-amber-300 font-mono font-bold">Kunci: {String.fromCharCode(65 + q.correctAnswerIndex)}</span>
                            </div>
                            <p className="text-purple-100 line-clamp-1">{q.questionText}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCbtNewQuestions((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/50 cursor-pointer"
                            title="Hapus butir soal ini dari paket CBT"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Bank Checklist */}
                <div>
                  <span className="block font-semibold text-purple-200 mb-1.5">
                    Pilih Butir Soal dari Bank Soal ({cbtSubject}):
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {questionBank
                      .filter((q) => q.subject === cbtSubject)
                      .map((q) => {
                        const isChecked = selectedBankQuestionIds.includes(q.id);
                        return (
                          <div
                            key={q.id}
                            onClick={() => {
                              setSelectedBankQuestionIds((prev) =>
                                isChecked ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                              );
                            }}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-purple-950 border-purple-500 text-white'
                                : 'bg-[#180e2f] border-purple-900/60 text-purple-300 hover:border-purple-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 accent-purple-500"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[10px] text-amber-300">{q.id}</span>
                                <span className="text-[10px] text-indigo-300">{q.bloomLevel}</span>
                              </div>
                              <p className="text-[11px] line-clamp-2 leading-relaxed">{q.questionText}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCbtModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white border border-purple-800 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Simpan & Rilis Jadwal CBT Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rekapitulasi Pengerjaan & Hasil CBT */}
      <CbtExamRecapModal
        isOpen={showRecapModal}
        onClose={() => {
          setShowRecapModal(false);
          setSelectedExamIdForRecap(null);
        }}
        examResults={examResults}
        exams={exams}
        currentUser={currentUser}
        initialSelectedExamId={selectedExamIdForRecap}
      />
    </div>
  );
};
