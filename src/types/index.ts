export type OsnSubject =
  | 'Matematika'
  | 'Fisika'
  | 'Biologi'
  | 'Kimia'
  | 'Astronomi'
  | 'Kebumian'
  | 'Informatika'
  | 'Ekonomi'
  | 'Geografi';

export type BloomTaxonomy =
  | 'C1 (Mengingat)'
  | 'C2 (Memahami)'
  | 'C3 (Mengaplikasikan)'
  | 'C4 (Menganalisis)'
  | 'C5 (Mengevaluasi)'
  | 'C6 (Menciptakan/HOTS)';

export type SoloTaxonomy =
  | 'Prestructural'
  | 'Unistructural'
  | 'Multistructural'
  | 'Relational'
  | 'Extended Abstract';

export type CompetitionLevel =
  | 'Kabupaten (OSN-K)'
  | 'Provinsi (OSN-P)'
  | 'Nasional (OSN-N)';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nisnOrNip: string;
  role: UserRole;
  subject?: OsnSubject;
  grade?: string;
  avatar?: string;
  deviceToken: string;
  deviceName: string;
  isDeviceLocked: boolean;
  password?: string;
  email?: string;
  whatsapp?: string;
  username?: string;
}

export interface BimbinganSchedule {
  id: string;
  title: string;
  subject: OsnSubject;
  mentorName: string;
  mentorId: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  location: string;
  targetBloom: BloomTaxonomy;
  targetSolo: SoloTaxonomy;
  topic: string;
  notes?: string;
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  coachingQuestions: Question[]; // Soal khusus materi bimbingan ini (bukan CBT)
  createdAt: string;
}

export interface Question {
  id: string;
  subject: OsnSubject;
  topic: string;
  questionText: string;
  formulaOrContext?: string;
  options: string[]; // 5 options: A, B, C, D, E (untuk PG & Bergambar)
  correctAnswerIndex: number; // 0 to 4
  explanation: string;
  bloomLevel: BloomTaxonomy;
  soloLevel: SoloTaxonomy;
  level: CompetitionLevel;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS / Sulit' | 'Olimpiade Master';
  estimatedMinutes?: number;
  hint?: string;
  author?: string;
  createdAt?: string;
  questionType?: 'pilihan_ganda' | 'esai' | 'bergambar';
  diagramSvg?: string; // Untuk soal bergambar / skema visual
  imageCaption?: string;
  rubricOrKeyPoints?: string[]; // Untuk soal esai
  sampleEssayAnswer?: string; // Kunci jawaban esai
}

export interface ExamPacket {
  id: string;
  title: string;
  subject: OsnSubject;
  level: CompetitionLevel;
  durationMinutes: number;
  instructions: string;
  passingScore: number;
  questions: Question[];
  penaltyMode: boolean; // OSN standard: +4 Benar, -1 Salah, 0 Kosong
  scheduledDate?: string;
  timeStart?: string; // HH:mm
  timeEnd?: string; // HH:mm
  status?: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  shuffleQuestionsPerAccount?: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  subject: OsnSubject;
  studentId: string;
  studentName: string;
  nisn: string;
  submittedAt: string;
  attemptNumber?: number; // Pengerjaan ke-berapa kali (frekuensi percobaan)
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  maxPossibleScore: number;
  percentageScore: number;
  predicate: 'Emas (Gold)' | 'Perak (Silver)' | 'Perunggu (Bronze)' | 'Lolos Passing Grade' | 'Perlu Bimbingan';
  tabSwitchViolations: number;
  answers: Record<string, number>;
  markedDoubtful: Record<string, boolean>;
  bloomAnalysis: Record<string, { correct: number; total: number }>;
  soloAnalysis: Record<string, { correct: number; total: number }>;
}

export interface DeviceSession {
  studentId: string;
  studentName: string;
  deviceToken: string;
  deviceName: string;
  ipAddress: string;
  loginTime: string;
  lastActiveTime: string;
  isLocked: boolean;
  lockReason?: string;
}

export interface OsnModule {
  id: string;
  subject: OsnSubject;
  title: string;
  subtopics: string[];
  keyFormulas: { name: string; formula: string; explanation: string }[];
  summary: string;
  tips: string[];
  difficultyTier: string;
  moduleQuestions?: Question[]; // Soal generate teragenda dalam modul ini
  mentorName?: string;
  createdAt?: string;
}

export interface LearningMedia {
  id: string;
  title: string;
  subject: OsnSubject;
  topic: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl?: string;
  channelOrCreator?: string;
  duration?: string;
  level: CompetitionLevel;
  description: string;
  keyPoints?: string[];
  addedBy?: string;
  aiEngine?: string;
  scholarUrl?: string;
  scholarTitle?: string;
  scholarAuthors?: string;
  sourceType?: 'youtube_manual' | 'gemini_ai' | 'google_scholar';
  createdAt: string;
}

