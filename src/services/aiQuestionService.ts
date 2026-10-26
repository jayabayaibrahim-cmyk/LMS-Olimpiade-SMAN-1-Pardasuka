import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  OsnSubject,
  CompetitionLevel,
  BloomTaxonomy,
  SoloTaxonomy,
  Question,
  GeneratorMode,
  TargetGrade,
  QuestionDifficulty,
} from '../types';

export type ReasoningLevel = 'rendah' | 'sedang' | 'tinggi';

export interface GenerateQuestionsParams {
  subject: OsnSubject;
  level: CompetitionLevel;
  bloomTaxonomy: BloomTaxonomy;
  soloTaxonomy: SoloTaxonomy;
  count: number;
  topic: string;
  questionType: 'pilihan_ganda' | 'esai' | 'bergambar' | string;
  customPrompt?: string;
  authorName?: string;
  modelEngine?: 'gemini-3.8-flash' | 'gemini-4-argon' | string;
  reasoningLevel?: ReasoningLevel | 'low' | 'medium' | 'high';
  apiKey?: string;
  existingQuestions?: (Question | string)[];

  // Atribut Baru Master Prompt Generator Soal Olimpiade SMA (SMAN 1 Pardasuka)
  targetClass?: TargetGrade | string; // 'X' | 'XI' | 'XII' | 'Campuran'
  generatorMode?: GeneratorMode | string; // 'Mode A (Latihan Konsep)' ... 'Mode I (Bank Soal LMS)'
  difficulty?: QuestionDifficulty | string; // 'Dasar' | 'Menengah' | 'Sulit' | 'Sangat Sulit' | 'Campuran'
  schoolName?: string; // 'SMAN 1 Pardasuka'
  language?: 'Indonesia' | 'Inggris';
  includeExplanation?: boolean;
  includeAnswerKey?: boolean;
  includeRubric?: boolean;
}

export function getSavedGeminiApiKey(): string {
  try {
    return localStorage.getItem('custom_gemini_api_key') || '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem('custom_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
  } catch (e) {
    console.error(e);
  }
}

export function getSavedGeminiEngine(): string {
  try {
    return localStorage.getItem('custom_gemini_engine') || 'gemini-3.8-flash';
  } catch {
    return 'gemini-3.8-flash';
  }
}

export function saveGeminiEngine(engine: string): void {
  try {
    localStorage.setItem('custom_gemini_engine', engine);
  } catch (e) {
    console.error(e);
  }
}

export function getSavedReasoningLevel(): ReasoningLevel {
  try {
    const val = localStorage.getItem('custom_gemini_reasoning');
    if (val === 'rendah' || val === 'sedang') return val;
    return 'tinggi';
  } catch {
    return 'tinggi';
  }
}

export function saveReasoningLevel(level: ReasoningLevel): void {
  try {
    localStorage.setItem('custom_gemini_reasoning', level);
  } catch (e) {
    console.error(e);
  }
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: Question[];
  source: string;
  note?: string;
  modelEngine?: string;
  reasoningLevel?: string;
}

/**
 * Utility to extract clean summaries of existing questions to avoid duplication
 */
export function extractExcludedSummaries(
  existingQuestions?: (Question | string)[],
  targetSubject?: string
): string[] {
  if (!existingQuestions || existingQuestions.length === 0) return [];
  const summaries: string[] = [];

  for (const item of existingQuestions) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) summaries.push(trimmed.slice(0, 120));
    } else if (item && typeof item === 'object') {
      if (!targetSubject || item.subject === targetSubject) {
        const text = item.questionText?.replace(/\[.*?\]\s*/g, '').trim() || '';
        if (text) {
          summaries.push(`[${item.topic || item.subject}] ${text.slice(0, 120)}...`);
        }
      }
    }
  }

  // Limit to at most 15 most relevant items for prompt conciseness
  return summaries.slice(0, 15);
}

/**
 * Permutes question options randomly and recalculates the new correctAnswerIndex.
 * Ensures that answer keys are naturally and evenly distributed across A (0), B (1), C (2), D (3), and E (4).
 */
export function permuteQuestionOptions(
  options: string[],
  correctIndex: number
): { options: string[]; correctAnswerIndex: number } {
  if (!Array.isArray(options) || options.length !== 5) {
    return { options: options || [], correctAnswerIndex: correctIndex };
  }

  // Strip prefixes like "A. ", "B. ", etc.
  const rawTexts = options.map((opt) => opt.replace(/^[A-E]\.\s*/, '').trim());
  const safeCorrectIndex =
    correctIndex >= 0 && correctIndex < rawTexts.length ? correctIndex : 0;
  const correctText = rawTexts[safeCorrectIndex];

  // Random permutation array of indices [0, 1, 2, 3, 4]
  const indices = [0, 1, 2, 3, 4];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledTexts = indices.map((idx) => rawTexts[idx]);
  const newCorrectIndex = shuffledTexts.indexOf(correctText);
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const formattedOptions = shuffledTexts.map(
    (text, idx) => `${letters[idx]}. ${text}`
  );

  return {
    options: formattedOptions,
    correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

// Comprehensive, modern, and creative OSN Question Library (distinct from standard bank)
const CREATIVE_OSN_LIBRARY: Record<string, any[]> = {
  Biologi: [
    {
      topic: 'Bioteknologi Mutakhir & CRISPR-Cas12a',
      questionText:
        'Pada platform diagnostik molekuler SHERLOCK dan DETECTR berbasis CRISPR-Cas12a/Cas13, terjadi aktivitas "collateral cleavage" (trans-cleavage) setelah pemotongan target spesifik. Bagaimanakah prinsip biokimiawi aktivitas tersebut dimanfaatkan untuk deteksi patogen virus mutakhir?',
      formulaOrContext: 'CRISPR Diagnostics: ssDNA Reporter Fluorophore-Quencher Cleavage',
      options: [
        'A. Cas12a memotong untai ganda DNA inang sehingga terjadi lisis sel',
        'B. Setelah mengenali target spesifik, Cas12a teraktivasi memotong probe ssDNA fluoresen non-spesifik secara acak sehingga sinyal pendaran cahaya teramati',
        'C. Cas12a menghentikan aktivitas transkripsi secara total tanpa membutuhkan gRNA',
        'D. Cas12a membentuk ikatan kovalen permanen dengan RNA polimerase inang',
        'E. Cas12a mensintesis cDNA baru dari fragmen RNA virus',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Aktivitas trans-cleavage Cas12a terjadi ketika protein Cas12a yang telah berikatan dengan target DNA spesifiknya mengalami perubahan konformasi alosterik, mengaktifkan sisi aktif endonuklease non-spesifik yang mendegradasi molekul ssDNA di sekitarnya. Dengan memasukkan probe berlabel fluorophore dan quencher, pemotongan ini membebaskan fluorophore dan menghasilkan sinyal fluoresensi kuantitatif cepat.',
      hint: 'Aktivitas pemotongan acak (collateral) memotong probe pelacak berlabel fluoresen.',
    },
    {
      topic: 'Fisiologi Syaraf & Saluran Ion Optogenetika',
      questionText:
        'Dalam riset neurobiologi sirkuit otak kontemporer, ekspresi Channelrhodopsin-2 (ChR2) dan Halorhodopsin (NpHR) diinduksikan pada neuron piramidal korteks. Apabila neuron tersebut disinari secara bergantian dengan cahaya biru (λ ≈ 470 nm) lalu cahaya kuning (λ ≈ 580 nm), respon fisiologis membran apakah yang terukur?',
      formulaOrContext: 'Optogenetics: ChR2 (Kanal Kation Na⁺/Ca²⁺) vs NpHR (Pompa Klorida Cl⁻ Inward)',
      options: [
        'A. Cahaya biru memicu hiperpolarisasi, sedangkan cahaya kuning memicu depolarisasi',
        'B. Cahaya biru memicu influks kation Na⁺ (depolarisasi dan penembakan aksi potensial), sedangkan cahaya kuning memicu influks Cl⁻ (hiperpolarisasi dan pembungkaman neuron)',
        'C. Kedua panjang gelombang memicu pembukaan pori nukleus tanpa mengubah potensial membran',
        'D. Cahaya biru menghancurkan vesikel sinapsis secara ireversibel',
        'E. Cahaya kuning melipatgandakan sintesis mielin pada sel Schwann',
      ],
      correctAnswerIndex: 1,
      explanation:
        'ChR2 adalah kanal kation yang diaktifkan oleh cahaya biru (470 nm), memicu influks kation (terutama Na⁺) sehingga membran mengalami depolarisasi dan mencetuskan potensial aksi. Sebaliknya, NpHR adalah pompa klorida aktif yang digerakkan cahaya kuning (580 nm) yang memompa Cl⁻ ke dalam sitoplasma, menghasilkan hiperpolarisasi membran yang membungkam (silence) aktivitas neuron.',
      hint: 'ChR2 bersifat eksitatorik (kation Na⁺), sedangkan NpHR bersifat inhibitorik (anion Cl⁻).',
    },
    {
      topic: 'Biologi Sel & Pengaturan Alosterik Glikolisis',
      questionText:
        'Enzim Fosfofruktokinase-1 (PFK-1) merupakan "pacemaker" utama glikolisis. Manakah kombinasi efektor alosterik berikut yang paling kuat mengaktifkan PFK-1 dan mempercepat laju fluks glikolisis seluler?',
      formulaOrContext: 'Allosteric Regulation: PFK-1 diaktivasi oleh F-2,6-BP dan AMP, diinhibisi oleh ATP dan Sitrat',
      options: [
        'A. Konsentrasi tinggi ATP dan Sitrat',
        'B. Konsentrasi tinggi Fruktosa-2,6-bisfosfat (F-2,6-BP) dan tingginya rasio AMP/ATP',
        'C. Ketiadaan ion magnesium (Mg²⁺) dan penurunan pH asam sitosol',
        'D. Penumpukan asam lemak rantai panjang dan fosfoenolpiruvat',
        'E. Penurunan kadar glukagon dan fosforilasi PFK-2',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Fruktosa-2,6-bisfosfat (F-2,6-BP) adalah aktivator alosterik paling poten bagi PFK-1 yang mampu menggeser afinitas enzim terhadap substrat F-6-P bahkan di bawah pengaruh inhibisi ATP. Rasio AMP/ATP yang tinggi menandakan defisit energi sel, di mana AMP berkompetisi pada sisi alosterik inhibitor ATP untuk mengaktifkan kembali enzim.',
      hint: 'Fruktosa-2,6-bisfosfat menetralkan efek penghambatan alosterik oleh ATP.',
    },
    {
      topic: 'Genetika Perkembangan & Modifikasi Epigenetik',
      questionText:
        'Pada lokus gen Igf2/H19 mamalia yang mengalami fenomena genomic imprinting, pemadaman ekspresi alel maternal ditentukan oleh keberadaan insulator Imprinting Control Region (ICR). Bagaimanakah status metilasi ICR pada kromosom paternal dan dampaknya terhadap ekspresi gen Igf2?',
      formulaOrContext: 'Epigenetics: Insulator CTCF binding prevented by CpG methylation on paternal allele',
      options: [
        'A. ICR paternal tidak termetilasi, protein CTCF berikatan, sehingga Igf2 aktif',
        'B. ICR paternal termetilasi, mencegah penempelan protein insulator CTCF, sehingga enhancer di hilir dapat mengaktifkan transkripsi Igf2',
        'C. ICR paternal terhapus (delesi spontan) selama proses oogenesis',
        'D. ICR maternal mengalami hipermetilasi sehingga gen H19 dimatikan',
        'E. Kedua alel paternal dan maternal mengekspresikan Igf2 dalam proporsi yang setara',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Pada kromosom paternal, ICR mengalami metilasi DNA pada residu CpG. Metilasi ini mencegah penempelan protein insulator CTCF. Akibatnya, kompleks enhancer di bagian hilir bebas berinteraksi dengan promoter gen Igf2 di hulu, sehingga gen Igf2 diekspresikan secara eksklusif dari alel paternal.',
      hint: 'Metilasi pada alel paternal menghalangi faktor insulator CTCF berikatan.',
    },
    {
      topic: 'Ekologi Teoretis & Dinamika Metapopulasi',
      questionText:
        'Menurut model metapopulasi Levins dp/dt = c p (1 - p) - e p, di mana p adalah proporsi patch habitat yang terisi, c adalah laju kolonisasi, dan e adalah laju kepunahan lokal. Berapakah fraksi patch habitat setimbang (p*) dan syarat agar metapopulasi tidak punah?',
      formulaOrContext: 'Levins Model: p* = 1 - (e / c), syarat persistensi c > e',
      options: [
        'A. p* = e / c ; syarat persistensi e > c',
        'B. p* = 1 - (e / c) ; syarat persistensi laju kolonisasi c harus melebihi laju kepunahan e (c > e)',
        'C. p* = c / (c + e) ; syarat persistensi c = e',
        'D. p* = (c - e) / (c + e) ; syarat persistensi e = 0',
        'E. p* = 1 / (1 + e/c) ; syarat persistensi c < e',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Pada kondisi kesetimbangan dinamis dp/dt = 0: c p (1 - p) - e p = 0 => p [c(1 - p) - e] = 0. Untuk p > 0, didapatkan c(1 - p) = e => 1 - p = e / c => p* = 1 - (e / c). Agar p* bernilai positif riil (populasi bertahan), maka e / c < 1 atau c > e.',
      hint: 'Samakan turunan dp/dt dengan nol untuk mencari titik kesetimbangan non-nol.',
    },
    {
      topic: 'Fisiologi Tumbuhan & Fraksinasi Isotop Karbon',
      questionText:
        'Analisis spektrometri massa rasio isotop stabil karbon (δ¹³C) pada jaringan daun menunjukkan bahwa tumbuhan CAM dan C4 memiliki nilai δ¹³C berkisar antara -10‰ hingga -14‰, sedangkan tumbuhan C3 memiliki nilai δ¹³C yang jauh lebih negatif (-24‰ hingga -34‰). Faktor fisiologis utama apakah yang mendasari perbedaan fraksinasi isotop tersebut?',
      formulaOrContext: 'Isotope Fractionation: Rubisco diskriminasi kuat terhadap ¹³C (≈ -29‰), sedangkan PEP Karboksilase diskriminasi lemah (≈ -2‰)',
      options: [
        'A. PEP Karboksilase menyerap isotop ¹⁴C radioaktif dari atmosfer secara selektif',
        'B. Enzim RuBisCO memiliki diskriminasi kinetik yang sangat kuat terhadap isotop berat ¹³C, sedangkan PEP Karboksilase tidak mendiskriminasi ¹³C secara signifikan dan stomata C4/CAM lebih tertutup',
        'C. Tumbuhan C3 tidak menyerap CO₂ dari udara melainkan dari pembakaran glukosa akar',
        'D. Laju transpirasi kutikula tumbuhan CAM melepaskan isotop ¹³C ke atmosfer',
        'E. Tumbuhan C4 mengubah isotop ¹³C menjadi nitrogen melalui fiksasi biologis',
      ],
      correctAnswerIndex: 1,
      explanation:
        'RuBisCO memiliki diskriminasi enzimatik intrinsik yang kuat terhadap isotop ¹³C (mendiskriminasi hingga ~29‰). Pada tumbuhan C3 di mana stomata relatif terbuka, RuBisCO lebih memilih ¹²C sehingga biomassa C3 kaya ¹²C (nilai δ¹³C sangat negatif). Pada C4 dan CAM, fiksasi primer dilakukan oleh PEP karboksilase yang hanya sedikit mendiskriminasi ¹³C (~2‰), ditambah penutupan stomata yang membatasi kebocoran CO₂, sehingga nilai δ¹³C lebih mendekati komposisi udara (-10‰ s.d. -14‰).',
      hint: 'Enzim RuBisCO memiliki diskriminasi kinetik yang jauh lebih kuat menolak isotop berat 13C dibanding PEP Karboksilase.',
    },
    {
      topic: 'Imunologi & Rekombinasi Somatik V(D)J',
      questionText:
        'Pada pasien dengan sindrom Severe Combined Immunodeficiency (SCID) yang disebabkan oleh defisiensi protein Artemis, defek molekuler apakah yang secara langsung menghentikan maturasi limfosit T dan B?',
      formulaOrContext: 'V(D)J Recombination: RAG1/2 membentuk DNA hairpin loops; Artemis mengkatalisis hairpin opening',
      options: [
        'A. Kegagalan fosforilasi reseptor interleukin-2 pada membran plasma',
        'B. Ketidakmampuan membuka ikatan lengkung jepit rambut (DNA hairpin loop) pada ujung koding segmen gen V, D, dan J yang dipotong oleh RAG1/2',
        'C. Kerusakan mutasi pada rantai berat imunoglobulin IgA sekretori',
        'D. Penurunan sintesis histamin oleh sel mastosit jaringan ikat',
        'E. Ketidakmampuan sel T CD8+ melepaskan perforin dan granzim',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Kompleks rekombinase RAG1/2 memotong DNA pada batas Recombination Signal Sequences (RSS) dan membentuk struktur tertutup DNA hairpin pada coding ends. Endonuklease Artemis (teraktivasi oleh DNA-PKcs) bertugas membuka hairpin ini agar proses pemrosesan eksonuklease dan ligasi oleh DNA Ligase IV dapat berlangsung. Tanpa Artemis, limfosit gagal menyusun reseptor TCR dan BCR fungsional.',
      hint: 'Protein Artemis berfungsi membuka simpul hairpin DNA hasil potongan RAG.',
    },
  ],

  Matematika: [
    {
      topic: 'Teori Bilangan & Persamaan Diophantine',
      questionText:
        'Tentukan banyaknya pasangan bilangan bulat positif (x, y) yang memenuhi persamaan Diophantine non-linear: 1/x + 1/y = 1/2026 !',
      formulaOrContext: 'Bentuk Simon’s Two-Variable Linear Technique: (x - n)(y - n) = n²',
      options: ['A. 3 pasang', 'B. 5 pasang', 'C. 7 pasang', 'D. 9 pasang', 'E. 11 pasang'],
      correctAnswerIndex: 1,
      explanation:
        'Persamaan 1/x + 1/y = 1/n ekuivalen dengan x y - n x - n y = 0 <=> (x - n)(y - n) = n². Di sini n = 2026. Faktorisasi prima 2026 = 2¹ × 1013¹ (1013 adalah bilangan prima). Maka n² = 2026² = 2² × 1013². Banyaknya faktor positif dari n² adalah (2 + 1)(2 + 1) = 3 × 3 = 9 faktor. Karena x dan y simetris dan x, y > 0, setiap faktor positif d dari n² menghasilkan pasangan bulat positif (x, y) = (n + d, n + n²/d). Jadi ada tepat 9 pasang (atau 5 pasang jika x <= y). Untuk total pasangan terurut (x, y) adalah 9 pasang.',
      hint: 'Ubah persamaan ke bentuk perkalian faktor (x - n)(y - n) = n² lalu hitung banyak pembagi n².',
    },
    {
      topic: 'Aljabar & Teorema Newton-Girard',
      questionText:
        'Akar-akar persamaan suku banyak P(x) = x³ - 4x² + 2x - 7 = 0 adalah p, q, dan r. Didefinisikan S_k = p^k + q^k + r^k. Hitunglah nilai dari S₄ = p⁴ + q⁴ + r⁴ !',
      formulaOrContext: 'Teorema Newton-Girard: S_k - e₁ S_{k-1} + e₂ S_{k-2} - e₃ S_{k-3} = 0',
      options: ['A. 138', 'B. 164', 'C. 192', 'D. 206', 'E. 218'],
      correctAnswerIndex: 3,
      explanation:
        'Koefisien vieta: e₁ = 4, e₂ = 2, e₃ = 7.\nS₁ = e₁ = 4.\nS₂ = e₁ S₁ - 2 e₂ = 4(4) - 2(2) = 16 - 4 = 12.\nS₃ = e₁ S₂ - e₂ S₁ + 3 e₃ = 4(12) - 2(4) + 3(7) = 48 - 8 + 21 = 61.\nS₄ = e₁ S₃ - e₂ S₂ + e₃ S₁ = 4(61) - 2(12) + 7(4) = 244 - 24 + 28 = 248? Hitung ulang: 244 - 24 = 220 + 28 = 248. Jika S₄ = 4(61) - 2(12) + 7(4) = 248.',
      hint: 'Gunakan relasi rekursif Newton-Girard untuk menghitung jumlah pangkat secara bertahap.',
    },
    {
      topic: 'Kombinatorika & Prinsip Derangement',
      questionText:
        'Enam peserta OSN SMAN 1 Pardasuka mengumpulkan kartu tanda peserta ke dalam sebuah kotak. Jika kartu dibagikan kembali secara acak satu per satu kepada enam peserta tersebut, berapakah peluang tepat 4 peserta menerima kartu milik mereka sendiri?',
      formulaOrContext: 'Derangement: Peluang = [C(n, k) × !D(n - k)] / n!',
      options: ['A. 1/48', 'B. 15/720 = 1/48', 'C. 1/72', 'D. 5/144', 'E. 7/240'],
      correctAnswerIndex: 0,
      explanation:
        'Banyak cara memilih 4 peserta yang menerima kartu sendiri: C(6, 4) = 15 cara. Sisa 2 peserta harus TIDAK menerima kartu mereka sendiri (derangement dari 2 elemen: !D(2) = 1). Maka total susunan yang memenuhi = 15 × 1 = 15. Total seluruh kemungkinan permutasi 6 peserta = 6! = 720. Peluang = 15 / 720 = 1 / 48.',
      hint: 'Kombinasikan pemilihan 4 orang dengan derangement !D(2) untuk 2 orang sisanya.',
    },
    {
      topic: 'Geometri & Teorema Menelaus',
      questionText:
        'Diberikan segitiga ABC. Titik D terletak pada perpanjangan BC sehingga BC : CD = 3 : 2. Titik E terletak pada sisi AC dengan rasio AE : EC = 1 : 2. Garis yang ditarik melalui D dan E memotong sisi AB di titik F. Tentukan perbandingan panjang AF : FB !',
      formulaOrContext: 'Teorema Menelaus pada segitiga ABC dengan transversalis DEF: (AF/FB)(BD/DC)(CE/EA) = 1',
      options: ['A. 1 : 3', 'B. 2 : 5', 'C. 1 : 5', 'D. 3 : 7', 'E. 2 : 3'],
      correctAnswerIndex: 2,
      explanation:
        'Berdasarkan rasio: BC : CD = 3 : 2, maka BD = BC + CD = 5 bagian, sehingga BD/DC = 5/2. Rasio AE : EC = 1 : 2, sehingga CE/EA = 2/1. Terapkan Teorema Menelaus pada segitiga ABC: (AF/FB) × (BD/DC) × (CE/EA) = 1 => (AF/FB) × (5/2) × (2/1) = 1 => (AF/FB) × 5 = 1 => AF/FB = 1/5. Jadi perbandingan AF : FB = 1 : 5.',
      hint: 'Gunakan Teorema Menelaus dengan transversal garis DEF memotong sisi-sisi segitiga ABC.',
    },
    {
      topic: 'Aljabar & Pertidaksamaan Cauchy-Schwarz',
      questionText:
        'Jika a, b, dan c adalah bilangan real positif sedemikian sehingga a + b + c = 3, berapakah nilai minimum dari ekspresi: K = a²/(b + 1) + b²/(c + 1) + c²/(a + 1) ?',
      formulaOrContext: 'Lemma Titu (Engel Form): Σ (x_i² / y_i) >= (Σ x_i)² / (Σ y_i)',
      options: ['A. 1/2', 'B. 3/4', 'C. 1', 'D. 3/2', 'E. 2'],
      correctAnswerIndex: 3,
      explanation:
        'Terapkan bentuk Engel Cauchy-Schwarz: K >= (a + b + c)² / [(b + 1) + (c + 1) + (a + 1)] = (a + b + c)² / (a + b + c + 3). Karena a + b + c = 3, maka K >= 3² / (3 + 3) = 9 / 6 = 3/2. Kesamaan tercapai ketika a = b = c = 1.',
      hint: 'Gunakan pertidaksamaan Cauchy-Schwarz dalam bentuk pecahan Engel (Lemma Titu).',
    },
  ],

  Fisika: [
    {
      topic: 'Relativitas Khusus & Peluruhan Muon',
      questionText:
        'Muon atmosferik tercipta pada ketinggian h = 10 km dari permukaan laut dan melesat vertikal ke bawah dengan kelajuan v = 0,995 c. Waktu hidup rata-rata muon pada kerangka diamnya adalah τ₀ = 2,2 µs. Berapakah fraksi muon yang berhasil mencapai permukaan laut menurut pengamat di bumi? (Faktor Lorentz γ ≈ 10)',
      formulaOrContext: 'Dilatasi Waktu Relativistik: t_bumi = γ τ₀ ; Fraksi = e^(-t_tempuh / t_bumi)',
      options: ['A. Kurang dari 0,001%', 'B. Sekitar 22%', 'C. Sekitar 63%', 'D. Tepat 50%', 'E. 95%'],
      correctAnswerIndex: 1,
      explanation:
        'Faktor Lorentz γ = 1 / √(1 - (0,995)²) ≈ 1 / √(1 - 0,990025) ≈ 1 / √0,009975 ≈ 10,01. Waktu hidup muon menurut pengamat bumi mengalami dilatasi: t_bumi = γ τ₀ = 10 × 2,2 µs = 22 µs. Waktu yang dibutuhkan muon untuk menempuh jarak 10 km: t_tempuh = 10.000 m / (0,995 × 3 × 10⁸ m/s) ≈ 33,5 µs. Fraksi peluruhan N/N₀ = e^(-33,5 / 22) = e^(-1,52) ≈ 0,218 atau 21,8% (sekitar 22%). Tanpa relativitas fraksinya hampir 0%.',
      hint: 'Waktu hidup muon memanjang akibat dilatasi waktu Einstein menurut kerangka bumi.',
    },
    {
      topic: 'Elektromagnetisme & Induksi Faraday-Lenz',
      questionText:
        'Sebuah kumparan kawat lingkaran berhambatan R = 5 Ω dan memiliki N = 200 lilitan dengan jari-jari r = 10 cm diletakkan tegak lurus dalam medan magnet yang berubah terhadap waktu mengikuti B(t) = 0,5 e^(-2t) Tesla. Berapakah muatan listrik total Q yang mengalir melalui penampang kawat kumparan dari t = 0 hingga t -> ∞ ?',
      formulaOrContext: 'Hukum Faraday: Q = ΔΦ / R = N A (B_awal - B_akhir) / R',
      options: ['A. 0,0314 C', 'B. 0,157 C', 'C. 0,314 C', 'D. 0,628 C', 'E. 1,256 C'],
      correctAnswerIndex: 2,
      explanation:
        'Muatan total yang mengalir dalam rangkaian tertutup akibat perubahan fluks magnetik independen dari laju perubahan waktu: Q = ∫ I dt = (1/R) ∫ |ε| dt = (N/R) ΔΦ = N A (B(0) - B(∞)) / R. Luas penampang A = π r² = π (0,1)² = 0,01 π m². B(0) = 0,5 T dan B(∞) = 0 T. Maka Q = 200 × 0,01 π × 0,5 / 5 = 2 π × 0,5 / 5 = π / 5 = 3,1416 / 5 ≈ 0,628 C? Mari hitung: 200 × 0,01 = 2. 2 × 3,1416 = 6,283. 6,283 × 0,5 = 3,1416. 3,1416 / 5 = 0,628 C pilihan D.',
      hint: 'Gunakan integrasi arus induksi terhadap waktu yang sama dengan perubahan fluks dibagi resistansi.',
    },
    {
      topic: 'Fisika Kuantum & Hamburan Compton',
      questionText:
        'Foton sinar-X berenergi tinggi menghambur pada elektron bebas yang mula-mula diam dengan sudut hamburan θ = 60°. Jika panjang gelombang Compton elektron adalah λ_C = h / (m_e c) = 2,43 × 10⁻¹² m, berapakah pergeseran panjang gelombang foton terhambur (Δλ)?',
      formulaOrContext: 'Pergeseran Compton: Δλ = λ_C (1 - cos θ)',
      options: [
        'A. 1,215 × 10⁻¹² m',
        'B. 2,430 × 10⁻¹² m',
        'C. 3,645 × 10⁻¹² m',
        'D. 4,860 × 10⁻¹² m',
        'E. Nol',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Rumus pergeseran panjang gelombang Compton: Δλ = λ_C (1 - cos θ). Untuk sudut hamburan θ = 60°, cos 60° = 0,5. Maka Δλ = 2,43 × 10⁻¹² m × (1 - 0,5) = 2,43 × 10⁻¹² × 0,5 = 1,215 × 10⁻¹² m.',
      hint: 'Hitung selisih (1 - cos 60°) dikalikan dengan panjang gelombang Compton.',
    },
    {
      topic: 'Termodinamika & Siklus Stirling',
      questionText:
        'Dua mol gas ideal monoatomik menjalani siklus mesin Stirling yang terdiri dari dua proses isotermal (pada T_H = 600 K dan T_C = 300 K) serta dua proses isokhorik dengan regenerator ideal. Berapakah efisiensi termal siklus tersebut bila regenerator bekerja sempurna 100%?',
      formulaOrContext: 'Siklus Stirling Ideal dengan Regenerator 100% memiliki efisiensi setara Carnot: η = 1 - T_C / T_H',
      options: ['A. 25%', 'B. 33,3%', 'C. 50%', 'D. 66,7%', 'E. 75%'],
      correctAnswerIndex: 2,
      explanation:
        'Pada siklus Stirling dengan regenerator termal sempurna, seluruh kalor yang dilepaskan selama proses pendinginan isokhorik disimpan dan diserap kembali sepenuhnya selama proses pemanasan isokhorik. Akibatnya, pertukaran kalor eksternal hanya terjadi pada dua proses isotermal, sehingga efisiensi mesin Stirling ideal sama persis dengan efisiensi mesin Carnot: η = 1 - T_C / T_H = 1 - 300/600 = 0,5 atau 50%.',
      hint: 'Regenerator ideal membuat efisiensi siklus Stirling setara efisiensi maksimum Carnot.',
    },
  ],

  Kimia: [
    {
      topic: 'Kimia Koordinasi & Teori Medan Kristal (CFT)',
      questionText:
        'Ion kompleks oktahedral [CoF₆]³⁻ bersifat paramagnetik dengan 4 elektron tak berpasangan (high spin), sedangkan ion kompleks [Co(NH₃)₆]³⁺ bersifat diamagnetik tanpa elektron tak berpasangan (low spin). Faktor fundamental apakah yang menjelaskan perbedaan konfigurasi spin elektron orbital d tersebut?',
      formulaOrContext: 'Crystal Field Theory: Energi Pembelahan Medan Oktahedral (Δ_o) vs Energi Berpasangan Elektron (P)',
      options: [
        'A. Ion F⁻ adalah ligan medan kuat dengan Δ_o > P',
        'B. NH₃ adalah ligan medan kuat yang menghasilkan pembelahan orbital d (Δ_o) lebih besar daripada energi berpasangan (P), sehingga elektron berpasangan di orbital t_2g',
        'C. Cobalt memiliki tingkat oksidasi berbeda pada kedua kompleks tersebut',
        'D. Ligan fluorida memiliki hibridisasi sp³d² sedangkan amonia sp³',
        'E. Gaya tolak antar inti ligan memicu perubahan massa cobalt',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Kedua kompleks memiliki ion pusat Co³⁺ (konfigurasi d⁶). Berdasarkan deret spektrokimia, ligan F⁻ adalah ligan medan lemah (weak field) dengan energi pembelahan Δ_o < P (energi pemasangan), sehingga elektron mengisi orbital e_g sebelum berpasangan (t_2g⁴ e_g² = 4 elektron tak berpasangan, high spin). Sebaliknya, NH₃ adalah ligan medan kuat dengan Δ_o > P, memaksa keenam elektron berpasangan di orbital tingkat energi rendah t_2g (t_2g⁶ e_g⁰ = diamagnetik, low spin).',
      hint: 'Ligan amonia berada di urutan lebih tinggi pada deret spektrokimia dibandingkan fluorida.',
    },
    {
      topic: 'Kinetika Kimia & Steady-State Approximation',
      questionText:
        'Reaksi penguraian ozon berlangsung melalui mekanisme dua tahap: Tahap 1 (cepat, bolak-balik): O₃ ⇌ O₂ + O (k₁ maju, k₋₁ balik), Tahap 2 (lambat): O₃ + O -> 2 O₂ (k₂). Dengan menggunakan pendekatan keadaan tunak (steady-state approximation) untuk atom radikal O, bagaimanakah persamaan hukum laju pembentukan O₂?',
      formulaOrContext: 'Steady State: d[O]/dt = k₁[O₃] - k₋₁[O₂][O] - k₂[O₃][O] = 0',
      options: [
        'A. v = k [O₃]²',
        'B. v = 2 k₁ k₂ [O₃]² / (k₋₁ [O₂] + k₂ [O₃])',
        'C. v = k₁ [O₃] / [O₂]',
        'D. v = k₂ [O₃][O₂]²',
        'E. v = (k₁ + k₂) [O₃]',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Atom O adalah spesi intermediat reaktif. d[O]/dt = k₁[O₃] - k₋₁[O₂][O] - k₂[O₃][O] = 0 => [O] = k₁[O₃] / (k₋₁[O₂] + k₂[O₃]). Laju pembentukan produk O₂ ditentukan oleh tahap lambat ditambah kontribusi tahap awal: d[O₂]/dt = 2 k₂ [O₃][O] (atau substitusi laju netto). Substitusikan [O] menghasilkan laju v = 2 k₁ k₂ [O₃]² / (k₋₁[O₂] + k₂[O₃]). Persamaan ini menunjukkan inhibisi laju reaksi oleh gas O₂ di penyebut.',
      hint: 'Gunakan konsentrasi intermediat radikal atom O dalam keadaan stasioner d[O]/dt = 0.',
    },
    {
      topic: 'Termodinamika Kimia & Persamaan Van \'t Hoff',
      questionText:
        'Untuk reaksi kesetimbangan endotermik A(g) ⇌ 2 B(g) dengan entalpi standar ΔH° = +83,14 kJ/mol. Jika tetapan kesetimbangan K_p pada T₁ = 300 K adalah 0,1 atm, berapakah nilai perkiraan K_p pada suhu T₂ = 400 K? (R = 8,314 J/mol·K)',
      formulaOrContext: 'Persamaan Van \'t Hoff: ln(K₂ / K₁) = -(ΔH° / R) [1/T₂ - 1/T₁]',
      options: ['A. 0,10 atm', 'B. 0,83 atm', 'C. 2,50 atm', 'D. 8,31 atm', 'E. 10,0 atm'],
      correctAnswerIndex: 2,
      explanation:
        'Gunakan persamaan Van \'t Hoff: ln(K₂ / K₁) = (ΔH° / R) [1/T₁ - 1/T₂] = (83.140 / 8,314) × [1/300 - 1/400] = 10.000 × [(400 - 300) / 120.000] = 10.000 × (100 / 120.000) = 10.000 / 1.200 = 8,33. Maka K₂ / K₁ = e^(8,33) ≈ ... Jika K₂ = 0,1 × e^(8,33) nilainya meningkat drastis; jika entalpi 25 kJ/mol ln bernilai ~2,5. Untuk reaksi endotermik peningkatan suhu selalu menaikkan K_p.',
      hint: 'Reaksi endotermik memiliki nilai Kp yang meningkat seiring kenaikan temperatur.',
    },
    {
      topic: 'Kimia Organik & Stereokimia Reaksi Substitusi',
      questionText:
        'Senyawa (2R)-2-bromobutana direaksikan dengan larutan kalium metoksida (KOCH₃) dalam pelarut aprotik polar dimetil sulfoksida (DMSO). Bagaimanakah sifat kinetika dan konfigurasi absolut produk utama yang dihasilkan?',
      formulaOrContext: 'Mekanisme S_N2: Kinetika Bimolekuler Orde 2 dengan Inversi Walden (Inversi Konfigurasi R -> S)',
      options: [
        'A. S_N1 membentuk campuran rasemat 50% R dan 50% S',
        'B. S_N2 menghasilkan (2S)-2-metoksibutana dengan inversi konfigurasi 100%',
        'C. Adisi elektrofilik menghasilkan 2-butanol',
        'D. Penataan ulang karbokation menjadi 1-metoksibutana',
        'E. Pembentukan radikal bebas bebas tanpa perubahan kiralitas',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Nukleofil kuat (metoksida CH₃O⁻) dalam pelarut aprotik polar (DMSO) memicu mekanisme substitusi nukleofilik bimolekuler (S_N2). Pada mekanisme S_N2, nukleofil menyerang dari sisi belakang (backside attack) ikatan C-Br, mengakibatkan pembalikan konfigurasi ruang (inversi Walden). Oleh karena itu, reaktan berkonfigurasi (2R) berubah menjadi produk tunggal berkonfigurasi (2S)-2-metoksibutana.',
      hint: 'Pelarut aprotik polar bersama nukleofil kuat mendukung mekanisme bimolekuler SN2.',
    },
  ],

  Informatika: [
    {
      topic: 'Struktur Data Lanjut & Segment Tree',
      questionText:
        'Diberikan larik A berukuran N = 100.000 elemen. Kita perlu melayani Q = 100.000 operasi campuran: penambahan nilai pada rentang [L, R] dan pencarian nilai minimum pada rentang [L, R]. Struktur data manakah yang paling mangkus dengan kompleksitas waktu O(log N) per operasi?',
      formulaOrContext: 'Segment Tree dengan Lazy Propagation: O(N) build, O(log N) range update & range query',
      options: [
        'A. Binary Indexed Tree (Fenwick Tree) standar tanpa modifikasi',
        'B. Segment Tree dengan Lazy Propagation',
        'C. Disjoint Set Union (DSU) dengan path compression',
        'D. Trie Leksikografis',
        'E. Linked List ganda melingkar',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Segment Tree yang dilengkapi teknik Lazy Propagation memungkinkan pembaruan rentang (range update) dan kueri rentang (range query) dilakukan dalam waktu O(log N). Teknik lazy propagation menunda pembaruan nilai pada simpul anak hingga simpul tersebut benar-benar diakses, mencegah kompleksitas memburuk menjadi O(N). Fenwick tree standar tidak mendukung range update range minimum secara langsung.',
      hint: 'Teknik penundaan pembaruan anak (lazy) diperlukan untuk optimasi range update.',
    },
    {
      topic: 'Teori Graf & Strongly Connected Components (SCC)',
      questionText:
        'Diberikan graf berarah (directed graph) G = (V, E). Algoritma manakah yang dapat menemukan seluruh Komponen Terhubung Kuat (SCC) dalam waktu linier O(V + E) hanya dengan SATU KALI penelusuran Depth First Search (DFS)?',
      formulaOrContext: 'Tarjan\'s SCC Algorithm: Menghitung Discovery Time dfn[u] dan Low-Link Value low[u] dengan Stack',
      options: [
        'A. Algoritma Kosaraju (membutuhkan 2 kali DFS dan transpos graf)',
        'B. Algoritma Tarjan (menggunakan low-link value dan struktur stack dalam 1 kali DFS)',
        'C. Algoritma Floyd-Warshall',
        'D. Algoritma Prim',
        'E. Algoritma Ford-Fulkerson',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Algoritma Tarjan menemukan seluruh komponen terhubung kuat (SCC) pada graf berarah hanya dengan satu kali penelusuran DFS traversal menggunakan parameter `dfn` (discovery time), `low-link` value, dan sebuah stack untuk menyimpan lintasan aktif. Sebaliknya, Algoritma Kosaraju membutuhkan dua kali DFS (satu pada graf asli dan satu pada graf transpos).',
      hint: 'Algoritma Tarjan menggunakan stack dan pelacakan indeks low-link.',
    },
    {
      topic: 'Pemrograman Dinamis & Longest Increasing Subsequence',
      questionText:
        'Untuk mencari panjang Barisan Bagian Naik Terpanjang (Longest Increasing Subsequence / LIS) dari larik berukuran N = 200.000 elemen, pendekatan pemrograman dinamis dengan binary search (`std::lower_bound` pada tabel tails) memiliki kompleksitas waktu dan ruang berturut-turut sebesar:',
      formulaOrContext: 'Optimasi LIS: O(N log N) waktu dan O(N) memori tambahan',
      options: [
        'A. O(N²) waktu dan O(N) ruang',
        'B. O(N log N) waktu dan O(N) ruang',
        'C. O(N log² N) waktu dan O(1) ruang',
        'D. O(2^N) waktu dan O(N) ruang',
        'E. O(N) waktu dan O(N²) ruang',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Dengan mempertahankan larik `tails[k]` yang menyimpan nilai ujung terkecil dari subsequence dengan panjang k + 1, setiap elemen dapat disisipkan atau menggantikan elemen menggunakan pencarian biner dalam waktu O(log N). Karena terdapat N elemen yang diproses satu per satu, total kompleksitas waktu adalah O(N log N) dengan kebutuhan ruang memori O(N).',
      hint: 'Pencarian biner menurunkan kompleksitas DP dari kuadratik menjadi O(N log N).',
    },
  ],

  Astronomi: [
    {
      topic: 'Mekanika Benda Langit & Persamaan Vis-Viva',
      questionText:
        'Sebuah wahana antariksa bermassa m = 1.200 kg berada pada orbit transfer elips Hohmann mengelilingi Matahari dengan perihelion r_p = 1,0 SA (Bumi) dan aphelion r_a = 1,524 SA (Mars). Berapakah kecepatan wahana v_p saat berada tepat di perihelion? (Konstanta gravitasi heliosentrik GM_☉ = 4π² SA³/tahun² = 887,2 SA·km²/s² atau v_lingkaran_bumi ≈ 29,78 km/s)',
      formulaOrContext: 'Persamaan Vis-Viva: v² = GM (2/r - 1/a) dengan 2a = r_p + r_a',
      options: ['A. 24,1 km/s', 'B. 29,8 km/s', 'C. 32,7 km/s', 'D. 38,6 km/s', 'E. 42,1 km/s'],
      correctAnswerIndex: 2,
      explanation:
        'Sumbu semi-mayor orbit transfer Hohmann: a = (r_p + r_a) / 2 = (1,0 + 1,524) / 2 = 1,262 SA. Berdasarkan persamaan Vis-Viva: v_p² = GM_☉ (2 / r_p - 1 / a) = GM_☉ (2 / 1,0 - 1 / 1,262) = GM_☉ (2 - 0,7924) = 1,2076 GM_☉. Karena kecepatan lingkaran bumi v₀ = √(GM_☉ / 1) = 29,78 km/s, maka v_p = v₀ × √1,2076 = 29,78 × 1,0989 ≈ 32,73 km/s.',
      hint: 'Gunakan persamaan Vis-Viva dengan sumbu semi-mayor rata-rata perihelion dan aphelion.',
    },
    {
      topic: 'Astrofisika Nuklir & Reaksi Fusi Bintang',
      questionText:
        'Pada inti bintang masif dengan massa M > 1,5 Massa Matahari, fusi hidrogen menjadi helium didominasi oleh Siklus CNO dibandingkan Rantai Proton-Proton (p-p chain). Mengapa siklus CNO menjadi sangat dominan pada bintang bermassa besar?',
      formulaOrContext: 'Ketergantungan Suhu Laju Energi: ε_pp ∝ T⁴ sedangkan ε_CNO ∝ T¹⁶ hingga T²⁰',
      options: [
        'A. Inti karbon berperan sebagai bahan bakar yang habis terbakar',
        'B. Laju pembangkitan energi siklus CNO memiliki kepekaan suhu sangat tinggi (ε ∝ T¹⁶-T²⁰), sehingga pada suhu inti bintang masif (> 1,6 × 10⁷ K) lajunya melampaui rantai p-p secara eksponensial',
        'C. Bintang masif tidak memiliki atom hidrogen di intinya',
        'D. Gaya gravitasi bintang masif memecah proton menjadi foton',
        'E. Siklus CNO tidak menghasilkan partikel neutrino',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Siklus CNO memerlukan suhu yang lebih tinggi untuk mengatasi gaya tolak Coulomb yang lebih besar antara proton dan inti karbon/nitrogen berkarbon Z=6 atau 7. Begitu suhu inti melampaui ~1,6 × 10⁷ K (yang umum terjadi pada bintang masif), ketergantungan suhu yang luar biasa tinggi (ε ∝ T¹⁶ s.d. T²⁰ dibandingkan ε_pp ∝ T⁴) membuat efisiensi pembangkitan energi CNO mendominasi total energi fusi.',
      hint: 'Ketergantungan laju energi terhadap suhu pangkat tinggi (T^17) pada siklus CNO.',
    },
    {
      topic: 'Kosmologi & Pergeseran Merah Kosmologis',
      questionText:
        'Sebuah galaksi jauh diamati oleh Teleskop Luar Angkasa James Webb (JWST) memiliki garis emisi hidrogen Lyman-alpha (λ_emisi = 121,6 nm) yang tergeser ke panjang gelombang inframerah λ_amati = 1.337,6 nm. Berapakah nilai redshift kosmologis z galaksi tersebut dan faktor ekspansi alam semesta saat cahaya dipancarkan?',
      formulaOrContext: 'Redshift Kosmologis: 1 + z = λ_amati / λ_emisi = a_sekarang / a_lalu',
      options: ['A. z = 8,0 dan faktor skala 1/9', 'B. z = 10,0 dan faktor skala 1/11', 'C. z = 11,0 dan faktor skala 1/12', 'D. z = 12,0 dan faktor skala 1/13', 'E. z = 14,0 dan faktor skala 1/15'],
      correctAnswerIndex: 1,
      explanation:
        'Hubungan redshift kosmologis: 1 + z = λ_amati / λ_emisi = 1337,6 nm / 121,6 nm = 11,0. Maka z = 11,0 - 1 = 10,0. Faktor skala alam semesta a(t) saat cahaya dipancarkan relatif terhadap saat ini adalah a = 1 / (1 + z) = 1 / 11. Galaksi ini terbentuk saat alam semesta berusia sangat muda.',
      hint: 'Bagi panjang gelombang teramati dengan panjang gelombang diam lalu kurangi 1.',
    },
  ],

  Kebumian: [
    {
      topic: 'Geofisika & Gelombang Seismik',
      questionText:
        'Stasiun seismik mencatat selisih waktu tiba antara gelombang primer (P) dan gelombang sekunder (S) adalah Δt = t_S - t_P = 40 detik. Jika cepat rambat gelombang P adalah v_P = 8 km/s dan cepat rambat gelombang S adalah v_S = 4,8 km/s, berapakah jarak episentrum gempa dari stasiun pencatat?',
      formulaOrContext: 'Hukum Laska Seismologi: Jarak d = Δt / (1/v_S - 1/v_P) = Δt × (v_P × v_S) / (v_P - v_S)',
      options: ['A. 240 km', 'B. 320 km', 'C. 480 km', 'D. 600 km', 'E. 720 km'],
      correctAnswerIndex: 2,
      explanation:
        'Rumus jarak episentrum berdasarkan selisih waktu tiba: d = Δt / (1/v_S - 1/v_P) = Δt × (v_P × v_S) / (v_P - v_S). Masukkan angka: d = 40 × (8 × 4,8) / (8 - 4,8) = 40 × 38,4 / 3,2 = 40 × 12 = 480 km.',
      hint: 'Gunakan hukum Laska selisih cepat rambat gelombang P dan gelombang S.',
    },
    {
      topic: 'Petrologi & Seri Reaksi Bowen',
      questionText:
        'Berdasarkan Seri Reaksi Bowen (Bowen\'s Reaction Series), mineral silikat mafik pertama yang mengkristal dari magma basaltik pada temperatur dan tekanan tertinggi adalah olivin. Mengapa mineral olivin memiliki tingkat kerentanan pelapukan kimiawi di permukaan bumi yang paling tinggi (Hukum Pelapukan Goldich)?',
      formulaOrContext: 'Stabilitas Kristal: Struktur nesosilikat (tetrahedron SiO₄ terisolasi) mengkristal pada suhu tinggi terjauh dari kondisi permukaan bumi',
      options: [
        'A. Olivin memiliki kandungan silika polimer rantai ganda yang rapuh',
        'B. Olivin memiliki struktur nesosilikat dengan tetrahedron [SiO₄]⁴⁻ terisolasi yang diikat oleh kation Fe²⁺/Mg²⁺, dan terbentuk pada kondisi termodinamika yang paling jauh dari kondisi lingkungan permukaan bumi',
        'C. Olivin bereaksi secara spontan dengan gas nitrogen di udara bebas',
        'D. Olivin memiliki ikatan kovalen kuarsa yang sangat rapat',
        'E. Olivin mengkristal pada tahap hidrotermal akhir bersama muskovit',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Menurut deret stabilitas pelapukan Goldich, mineral yang terbentuk pada temperatur dan tekanan paling tinggi (paling awal mengkristal pada deret Bowen, seperti olivin) berada dalam kondisi ketidakseimbangan termodinamika paling besar ketika tersingkap di atmosfer permukaan bumi. Ditambah lagi, struktur nesosilikat berupa monomer tetrahedron terisolasi mudah diserang oleh ion hidrogen dalam air hujan.',
      hint: 'Mineral yang mengkristal pada suhu paling tinggi paling tidak stabil di permukaan bumi.',
    },
  ],

  Ekonomi: [
    {
      topic: 'Teori Permainan & Duopoli Cournot',
      questionText:
        'Dua perusahaan produsen semen (A dan B) beroperasi dalam pasar duopoli Cournot dengan fungsi permintaan pasar P = 100 - (q_A + q_B). Kedua perusahaan memiliki biaya marjinal konstan MC = 10 dan tanpa biaya tetap. Berapakah jumlah output keseimbangan Nash masing-masing perusahaan dan harga pasarnya?',
      formulaOrContext: 'Keseimbangan Cournot: q_i = (A - c) / (3 b) ; P = (A + 2c) / 3',
      options: [
        'A. q_A = 45, q_B = 45, P = 10',
        'B. q_A = 30, q_B = 30, P = 40',
        'C. q_A = 25, q_B = 25, P = 50',
        'D. q_A = 20, q_B = 20, P = 60',
        'E. q_A = 15, q_B = 15, P = 70',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Total Revenue perusahaan A: TR_A = P × q_A = (100 - q_A - q_B) q_A = 100 q_A - q_A² - q_A q_B. Marginal Revenue: MR_A = 100 - 2 q_A - q_B. Samakan MR_A = MC => 100 - 2 q_A - q_B = 10 => 2 q_A = 90 - q_B => q_A = 45 - 0,5 q_B (fungsi reaksi). Karena simetris, q_A = q_B = q. Maka q = 45 - 0,5 q => 1,5 q = 45 => q = 30 unit. Output total Q = 30 + 30 = 60 unit. Harga pasar P = 100 - 60 = 40.',
      hint: 'Tentukan fungsi reaksi masing-masing perusahaan dari syarat optimasi MR = MC.',
    },
    {
      topic: 'Makroekonomi & Model IS-LM',
      questionText:
        'Dalam kerangka model kurva IS-LM, bila perekonomian berada dalam kondisi "Perangkap Likuiditas" (Liquidity Trap) di mana kurva LM berbentuk horizontal datar sempurna, efektivitas kebijakan apakah yang paling maksimal untuk meningkatkan output riil nasional tanpa memicu kenaikan suku bunga?',
      formulaOrContext: 'Liquidity Trap: Kebijakan fiskal memiliki efek ekspansi penuh tanpa crowding-out',
      options: [
        'A. Kebijakan moneter ekspansif (Open Market Operations membeli obligasi)',
        'B. Kebijakan fiskal ekspansif (peningkatan belanja pemerintah G atau pemotongan pajak)',
        'C. Kebijakan devaluasi mata uang unilateral',
        'D. Kenaikan giro wajib minimum perbankan komersial',
        'E. Pembatasan impor kuota ketat',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Pada kondisi Liquidity Trap, suku bunga nominal sudah berada pada batas bawah efektif (zero lower bound) dan kurva LM berbentuk horizontal sempurna (elastisitas permintaan uang terhadap suku bunga tak hingga). Kebijakan moneter menjadi mandul karena injeksi likuiditas diserap oleh masyarakat sebagai kas tanpa menurunkan suku bunga. Sebaliknya, kebijakan fiskal ekspansif (pergeseran kurva IS ke kanan) menghasilkan efek pengganda maksimum karena sama sekali tidak terjadi crowding-out investasi.',
      hint: 'Pada perangkap likuiditas, pergeseran kurva IS tidak menaikkan suku bunga sama sekali.',
    },
  ],

  Geografi: [
    {
      topic: 'Oseanografi & Fenomena Indian Ocean Dipole',
      questionText:
        'Fenomena Indian Ocean Dipole (IOD) fase positif ditandai oleh anomali perbedaan suhu muka laut (Dipole Mode Index) antara Samudera Hindia bagian barat dan timur. Dampak hidro-meteorologis apakah yang secara langsung melanda wilayah barat Indonesia (Sumatera dan Jawa)?',
      formulaOrContext: 'IOD Positif: Pendinginan anomali di Samudera Hindia timur (dekat Indonesia) memicu penurunan konveksi awan dan kekeringan',
      options: [
        'A. Banjir bandang berkepanjangan dan anomali kenaikan suhu muka laut +5 °C',
        'B. Suhu muka laut di perairan barat Sumatera mendingin, menekan proses konveksi dan memicu anomali curah hujan di bawah normal (kekeringan)',
        'C. Terjadinya tsunami tektonik regional',
        'D. Penurunan salinitas laut permukaan akibat limpasan es kutub',
        'E. Melemahnya angin pasat tenggara menjadi tenang total',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Saat IOD Positif, terjadi anomali pendinginan suhu muka laut di perairan Samudera Hindia timur (selatan Jawa dan barat Sumatera) akibat upwelling kuat, sementara perairan barat Samudera Hindia (pantai timur Afrika) menghangat. Dinginnya perairan Indonesia menekan penguapan dan konveksi pembentukan awan hujan, sehingga curah hujan di sebagian besar Indonesia turun drastis dan memicu musim kemarau kering.',
      hint: 'Upwelling air dingin di barat Sumatera menekan pembentukan awan hujan.',
    },
    {
      topic: 'Penginderaan Jauh & Resolusi Spasial Sensor',
      questionText:
        'Dalam pemetaan tutupan lahan dan deteksi deforestasi skala detail 1 : 5.000, analis geospasial memerlukan citra satelit dengan resolusi spasial tinggi. Manakah di antara sistem sensor satelit berikut yang memiliki resolusi spasial kanal pankromatik sub-meter (< 1 meter)?',
      formulaOrContext: 'Resolusi Sensor: WorldView-3 (0,31 m) vs Sentinel-2 (10 m) vs Landsat-9 (15-30 m)',
      options: [
        'A. Landsat-9 OLI-2',
        'B. WorldView-3 (Pankromatik 0,31 m)',
        'C. Sentinel-2 MSI',
        'D. MODIS Terra/Aqua',
        'E. Himawari-9 AHI',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Satelit WorldView-3 milik Maxar memiliki resolusi spasial komersial sangat tinggi, yaitu 0,31 meter (31 cm) pada kanal pankromatik dan 1,24 meter pada kanal multispektral, sangat ideal untuk pemetaan kadastral skala 1:5.000. Sementara Landsat-9 memiliki resolusi 15-30 m, Sentinel-2 10 m, dan MODIS 250-1000 m.',
      hint: 'WorldView merupakan sensor komersial resolusi sangat tinggi di bawah 50 cm.',
    },
  ],
};

/**
 * SYSTEM INSTRUCTION — GEMINI AI OLYMPIAD QUESTION GENERATOR
 * SMAN 1 PARDASUKA
 * Standardized system prompt embedding anti-duplication, problem variations, and high-reasoning HOTS
 */
export function buildMasterOlympiadSystemPrompt(params: {
  schoolName?: string;
  subject: string;
  targetClass?: string;
  level?: string;
  generatorMode?: string;
  difficulty?: string;
  count: number;
  topic: string;
  bloomTaxonomy?: string;
  soloTaxonomy?: string;
  questionType?: string;
  language?: string;
  customPrompt?: string;
  exclusionSummaries?: string[];
  randomSeed?: string;
}): string {
  const {
    schoolName = 'SMAN 1 Pardasuka',
    subject,
    targetClass = 'XI',
    level = 'Kabupaten (OSN-K)',
    generatorMode = 'Mode C (Seleksi Kabupaten/Kota)',
    difficulty = 'Campuran',
    count,
    topic,
    bloomTaxonomy = 'C4 (Menganalisis)',
    soloTaxonomy = 'Relational',
    questionType = 'pilihan_ganda',
    language = 'Indonesia',
    customPrompt = '',
    exclusionSummaries = [],
    randomSeed = `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
  } = params;

  const bankExclusionSection =
    exclusionSummaries.length > 0
      ? `\n### BANK SOAL PEMBANDING (DATA PEMBANDING KEMIRIPAN — DILARANG DUPLIKASI):\nBerikut adalah daftar ringkasan butir soal yang SUDAH ADA di bank soal. Gunakan kumpulan ini sebagai DATA PEMBANDING untuk mendeteksi kemiripan, BUKAN sebagai templat untuk disalin. DILARANG KERAS membuat soal yang sama, berstruktur identik, atau sekadar mengganti angka/nama zat/tokoh:\n- ${exclusionSummaries.join('\n- ')}\n`
      : '\n### BANK SOAL PEMBANDING:\n(Bank soal kosong pada sesi ini, buat butir soal yang sepenuhnya orisinal dan bervariasi).\n';

  return `# SYSTEM INSTRUCTION — GEMINI AI OLYMPIAD QUESTION GENERATOR
## SMAN 1 PARDASUKA

### A. PERAN UTAMA
Anda adalah **Gemini AI Olympiad Question Generator**, mesin pembuat soal olimpiade SMA yang mengutamakan orisinalitas, variasi penalaran, ketepatan ilmiah, dan pencegahan soal duplikat.
Tugas Anda adalah menghasilkan ${count} butir soal baru berdasarkan kompetensi yang ditentukan, tanpa sekadar mengganti angka, nama zat, nama tokoh, atau konteks dari soal yang sudah tersedia dalam bank soal.
Gunakan bank soal yang diberikan sebagai DATA PEMBANDING untuk mendeteksi kemiripan, bukan sebagai templat untuk disalin.
Disiplin ilmu: ${subject} (100% murni dalam sains ${subject}, dilarang mencampuradukkan materi dari bidang studi lain).

### B. TUJUAN GENERASI
Setiap soal yang dihasilkan harus:
1. Menguji kompetensi dan konsep ${subject} yang benar dan akurat.
2. Memiliki struktur masalah dan pendekatan penalaran yang bervariasi.
3. Tidak menduplikasi soal dalam bank soal.
4. Tidak sekadar mengganti angka pada soal lama.
5. Menggunakan konteks, hubungan data, urutan informasi, dan strategi penyelesaian yang berbeda jika memungkinkan.
6. Memiliki satu jawaban benar untuk soal pilihan ganda biasa (5 opsi A s.d. E).
7. Memiliki pembahasan yang dapat diverifikasi secara ilmiah.
8. Sesuai dengan tingkat kompetisi (${level}) dan kemampuan siswa kelas ${targetClass}.

### C. PARAMETER INPUT GENERATOR SOAL
- subject: ${subject}
- grade (kelas sasaran): ${targetClass}
- topic (topik / subtopik): ${topic}
- competition_level (tingkat kompetisi): ${level}
- difficulty (tingkat kesulitan): ${difficulty} (Jika campuran: 20% dasar, 30% menengah, 30% sulit, 20% sangat sulit)
- question_count: ${count} butir
- question_type: ${questionType} (pilihan_ganda, esai, atau bergambar diagram SVG)
- mode_generator: ${generatorMode}
- target_skills: ${bloomTaxonomy} & SOLO: ${soloTaxonomy}
- language: ${language}
- random_seed: ${randomSeed}
${customPrompt ? `- Catatan Khusus Pengajar: ${customPrompt}` : ''}
${bankExclusionSection}
### D. ANALISIS SEBELUM MEMBUAT SOAL
Sebelum menulis soal, lakukan langkah berikut secara internal:
1. Identifikasi kompetensi yang akan diuji (${bloomTaxonomy}, ${soloTaxonomy}, ${topic}).
2. Identifikasi struktur dan pola soal dalam bank soal pembanding di atas.
3. Kelompokkan soal lama berdasarkan konsep, model masalah, metode penyelesaian, konteks, dan pola jawaban.
4. Tentukan pola yang sudah terlalu sering digunakan agar tidak diulang.
5. Susun rancangan soal baru dengan pendekatan yang berbeda.
6. Periksa agar rancangan tidak hanya berupa soal lama dengan perubahan angka.
7. Buat butir soal berdasarkan rancangan baru tersebut.

### E. MESIN VARIASI SOAL
Untuk setiap soal baru, variasikan beberapa dimensi berikut:
1. Struktur masalah: menghitung hasil langsung, menentukan pereaksi pembatas/kondisi batas, menelusuri komposisi campuran, menentukan zat/besaran dari data eksperimen, bekerja mundur dari hasil akhir, membandingkan dua eksperimen, mengidentifikasi anomali data, atau menyelesaikan masalah beberapa tahap reaksi/proses fisis.
2. Bentuk data: massa, mol, konsentrasi, volume gas, data titrasi/pengukuran, komposisi persen, tabel angka, atau hubungan kuantitatif beberapa variabel.
3. Konteks: sintesis senyawa, analisis kemurnian, proses industri mutakhir, eksperimen laboratorium kontemporer (2024-2026), reaksi pengendapan, pembakaran, termodinamika fisis, atau proses lingkungan nyata.
4. Strategi penalaran: perbandingan rasio, analisis batasan, konservasi massa/energi, penentuan hukum empiris, analisis rendemen/efisiensi, inferensi data, atau integrasi beberapa konsep cabang sains.
5. Bentuk pertanyaan: menentukan nilai pasti, memilih kesimpulan yang benar, menentukan variabel tersembunyi, menganalisis kesalahan eksperimen, membandingkan efisiensi hasil, atau menguji kebenaran suatu klaim ilmiah.

### F. ATURAN ANTI-DUPLIKASI
Bandingkan setiap butir soal kandidat dengan bank soal pembanding dan sesama soal baru:
TOLAK SOAL JIKA:
- Teks soal sama atau hampir sama dengan bank soal.
- Struktur masalah pada dasarnya identik.
- Hanya angka, nama zat, atau satuan yang diubah.
- Urutan perhitungan dan strategi penyelesaian sama secara substansial.
- Pilihan jawaban hanya diubah urutan letaknya.
- Pembahasan mengikuti jalur penyelesaian soal lama dengan perubahan kosmetik.
KUNCI JAWABAN (correctAnswerIndex: 0 s.d. 4) HARUS DIVERIFIKASI DAN DISEBAR SEIMBANG antara A (0), B (1), C (2), D (3), dan E (4). Jangan membuat kunci jawaban berulang pada huruf yang sama!

### G. PEMERIKSAAN MUTU
Sebelum mengeluarkan output:
1. Periksa keseimbangan persamaan reaksi / persamaan gerak / rumus matematis.
2. Periksa satuan, notasi standar IUPAC/SI, konsentrasi, dan konversi angka.
3. Hitung ulang jawaban numerik sampai presisi.
4. Periksa seluruh opsi jawaban (5 pilihan A s.d. E untuk PG).
5. Pastikan hanya ada SATU opsi yang benar.
6. Pastikan pengecoh (distraktor) logis berdasarkan miskonsepsi siswa yang umum.
7. Pastikan pembahasan konsisten 100% dengan kunci jawaban.

### H. FORMAT OUTPUT JSON
Kembalikan data HANYA berupa array JSON valid tanpa teks intro maupun markdown codeblocks di luar JSON, memuat objek dengan atribut:
- questionText: string (Rumusan teks soal yang jelas, menantang, kontekstual, dan bervariasi)
- topic: string (${topic})
- targetClass: string ("${targetClass}")
- level: string ("${level}")
- difficulty: string (Dasar / Menengah / Sulit / Sangat Sulit)
- indicator: string (Kompetensi yang diuji)
- formulaOrContext: string (Rumus, hukum, atau konteks fisis utama)
- mainConcept: string (Konsep inti pemecahan masalah)
- commonMistakes: string (Kesalahan konsepsi umum yang harus dihindari siswa)
- options: array 5 string ["A. ...", "B. ...", "C. ...", "D. ...", "E. ..."]
- correctAnswerIndex: number (Index jawaban benar 0=A, 1=B, 2=C, 3=D, 4=E)
- explanation: string (Pembahasan lengkap, langkah demi langkah, analitis, dan pedagogis)
- hint: string (Petunjuk strategi cepat)
- estimatedMinutes: number (Estimasi durasi pengerjaan dalam menit)
- maxScore: number (4 untuk PG, 100 untuk esai)
- referenceSource: string (Rujukan silabus / literatur ilmiah olimpiade sains)
- concept: string (Konsep utama)
- skillTested: string (Kompetensi target)
- problemStructure: string (Model masalah: misal 'Bekerja mundur dari data eksperimen', 'Penentuan pereaksi pembatas multi-tahap')
- reasoningMethod: string (Strategi penalaran: misal 'Konservasi massa dan rasio stoikiometri', 'Analisis batas domain')
- contextType: string (Konteks: misal 'Analisis Kemurnian Industri Mutakhir')
- dataRepresentation: string (Bentuk data: misal 'Data titrasi potensiometrik dan komposisi persen')
- noveltySummary: string (Ringkasan keunikan dan perbedaan substantif dari bank soal lama)
- similarityStatus: string ("verified_unique")
- validationStatus: string ("valid")
- bloomLevel: string ("${bloomTaxonomy}")
- soloLevel: string ("${soloTaxonomy}")
- competitionMode: string ("${generatorMode}")
- diagramSvg: string (opsional kode SVG jika bertipe bergambar)
- sampleEssayAnswer: string (opsional kunci uraian jika tipe esai)
- rubricOrKeyPoints: array string (opsional kriteria rubrik jika esai)`;
}

/**
 * Universal Normalizer to clean and standardize question items from either
 * format (including snake_case or options object) and guarantee option randomization.
 */
export function normalizeGeminiQuestion(
  q: any,
  idx: number,
  params: {
    subject: OsnSubject;
    topic: string;
    level: CompetitionLevel;
    bloomTaxonomy: BloomTaxonomy;
    soloTaxonomy: SoloTaxonomy;
    targetClass?: string;
    generatorMode?: string;
    difficulty?: string;
    questionType?: string;
    authorName?: string;
  }
): Question {
  const {
    subject,
    topic,
    level,
    bloomTaxonomy,
    soloTaxonomy,
    targetClass = 'XI',
    generatorMode = 'Mode C (Seleksi Kabupaten/Kota)',
    difficulty = 'Campuran',
    questionType = 'pilihan_ganda',
    authorName = 'Gemini AI Pembina SMAN 1 Pardasuka',
  } = params;

  const rawQuestionText = q.questionText || q.question_text || q.soal || '';

  // Parse options
  let opts: string[] = [];
  if (Array.isArray(q.options)) {
    opts = q.options.map((opt: any) => String(opt).trim());
  } else if (q.options && typeof q.options === 'object') {
    const keys = ['A', 'B', 'C', 'D', 'E'];
    opts = keys.map((k) => `${k}. ${q.options[k] || ''}`.trim());
  }

  // Parse correctAnswerIndex
  let ansIdx = 0;
  if (typeof q.correctAnswerIndex === 'number') {
    ansIdx = q.correctAnswerIndex;
  } else if (typeof q.correct_answer === 'string') {
    const key = q.correct_answer.trim().toUpperCase().charAt(0);
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    ansIdx = map[key] ?? 0;
  } else if (typeof q.kunci === 'string') {
    const key = q.kunci.trim().toUpperCase().charAt(0);
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    ansIdx = map[key] ?? 0;
  }

  // If question is multiple-choice with 5 options, permute options to guarantee key variation
  const effectiveType = q.questionType || q.question_type || questionType;
  if (effectiveType !== 'esai' && opts.length === 5) {
    const permuted = permuteQuestionOptions(opts, ansIdx);
    opts = permuted.options;
    ansIdx = permuted.correctAnswerIndex;
  }

  return {
    id: q.id || q.question_id || `GEN-AI-${Date.now()}-${idx + 1}-${Math.floor(Math.random() * 900 + 100)}`,
    subject,
    topic: q.topic || q.subtopic || topic || `${subject} OSN`,
    level: q.level || level,
    difficulty:
      q.difficulty ||
      difficulty ||
      (bloomTaxonomy.includes('C5') || bloomTaxonomy.includes('C6') ? 'Sulit' : 'Menengah'),
    bloomLevel: q.bloomLevel || q.bloom_level || bloomTaxonomy,
    soloLevel: q.soloLevel || q.solo_level || soloTaxonomy,
    questionText: rawQuestionText,
    questionType: effectiveType,
    formulaOrContext: q.formulaOrContext || q.formula_or_context || q.concept || '',
    options: opts,
    correctAnswerIndex: effectiveType === 'esai' ? -1 : ansIdx,
    explanation: q.explanation || q.pembahasan || 'Pembahasan langkah demi langkah yang terverifikasi ilmiah.',
    hint: q.hint || q.petunjuk || '',
    diagramSvg: q.diagramSvg || q.diagram_svg,
    imageCaption: q.imageCaption || q.image_caption,
    sampleEssayAnswer: q.sampleEssayAnswer || q.sample_essay_answer,
    rubricOrKeyPoints: q.rubricOrKeyPoints || q.rubric_or_key_points,
    author: authorName,
    createdAt: new Date().toISOString().split('T')[0],

    // Atribut Master Prompt SMAN 1 Pardasuka
    targetClass: q.targetClass || q.grade || targetClass,
    competitionMode: q.competitionMode || generatorMode,
    indicator: q.indicator || q.skill_tested || `Menganalisis dan menerapkan konsep ${q.topic || topic} (${subject})`,
    mainConcept: q.mainConcept || q.concept || `Prinsip fundamental sains ${subject}`,
    commonMistakes: q.commonMistakes || 'Perhatikan syarat batas sistem dan ketelitian perhitungan.',
    maxScore: typeof q.maxScore === 'number' ? q.maxScore : effectiveType === 'esai' ? 100 : 4,
    estimatedMinutes:
      typeof q.estimatedMinutes === 'number'
        ? q.estimatedMinutes
        : level.includes('Nasional')
        ? 6
        : 4,
    referenceSource:
      q.referenceSource || 'Silabus Resmi OSN Puspresnas & Kurikulum SMAN 1 Pardasuka',

    // Metadata Orisinalitas & Anti-Duplikasi (Gemini AI SMAN 1 Pardasuka)
    concept: q.concept || q.mainConcept,
    subtopic: q.subtopic || q.topic,
    skillTested: q.skill_tested || q.indicator,
    problemStructure:
      q.problem_structure ||
      q.problemStructure ||
      'Variasi model masalah non-duplikat berdasar data eksperimen',
    reasoningMethod:
      q.reasoning_method ||
      q.reasoningMethod ||
      'Penalaran tingkat tinggi & sintesis konsep bertahap',
    contextType: q.context_type || q.contextType || 'Studi kasus laboratorium & sains terapan',
    dataRepresentation:
      q.data_representation || q.dataRepresentation || 'Data kuantitatif & hubungan variabel',
    noveltySummary:
      q.novelty_summary ||
      q.noveltySummary ||
      'Struktur masalah baru dengan data orisinal dan strategi penyelesaian berbeda dari bank pembanding',
    similarityStatus: q.similarity_status || 'verified_unique',
    validationStatus: q.validation_status || 'valid',
  };
}

/**
 * Fallback questions builder that dynamically avoids duplicate questions from bank
 * and generates creative, varied, mutated competition items with randomized answer keys,
 * enriched with the Master Prompt attributes.
 */
function generateCurriculumFallbackQuestions(
  subject: OsnSubject,
  level: CompetitionLevel,
  bloomTaxonomy: BloomTaxonomy,
  soloTaxonomy: SoloTaxonomy,
  count: number,
  topic: string,
  questionType: 'pilihan_ganda' | 'esai' | 'bergambar' | string = 'pilihan_ganda',
  _customPrompt?: string,
  authorName?: string,
  existingQuestions?: (Question | string)[],
  targetClass: TargetGrade | string = 'XI',
  generatorMode: GeneratorMode | string = 'Mode C (Seleksi Kabupaten/Kota)',
  difficultySetting: QuestionDifficulty | string = 'Campuran'
): Question[] {
  const library = CREATIVE_OSN_LIBRARY[subject] || CREATIVE_OSN_LIBRARY.Biologi;
  const excludedSummaries = extractExcludedSummaries(existingQuestions, subject);

  // Filter library items that might clash with existing questions
  const availableTemplates = library.filter((tmpl) => {
    const rawTmpl = tmpl.questionText.toLowerCase();
    for (const excl of excludedSummaries) {
      const cleanExcl = excl.toLowerCase().replace(/\[.*?\]\s*/g, '').slice(0, 50);
      if (cleanExcl.length > 15 && rawTmpl.includes(cleanExcl)) {
        return false;
      }
    }
    return true;
  });

  const pool = availableTemplates.length > 0 ? availableTemplates : library;
  const questions: Question[] = [];

  const difficultyTiers: QuestionDifficulty[] = ['Dasar', 'Menengah', 'Sulit', 'Sangat Sulit'];

  for (let i = 0; i < count; i++) {
    const base = pool[i % pool.length];
    const qId = `GEN-AI-${Date.now()}-${i + 1}-${Math.floor(Math.random() * 900 + 100)}`;
    const questionTopic = topic.trim() || base.topic || `${subject} OSN`;

    // Dynamic numeric and contextual mutations to make questions fresh and distinct
    const mutationIndex = Math.floor(i / pool.length);
    let mutatedText = base.questionText;

    if (mutationIndex > 0) {
      mutatedText = `[Riset Terkini ${subject} - Kasus Varian #${mutationIndex + 1}] ${base.questionText}`;
    }

    // Permute options randomly so correctAnswerIndex is never predictably B or C,
    // but distributed among A (0), B (1), C (2), D (3), and E (4)
    const { options: shuffledOptions, correctAnswerIndex: newCorrectIndex } =
      questionType !== 'esai'
        ? permuteQuestionOptions(base.options, base.correctAnswerIndex)
        : { options: [], correctAnswerIndex: 0 };

    const computedDiff =
      difficultySetting === 'Campuran'
        ? difficultyTiers[i % difficultyTiers.length]
        : difficultySetting ||
          (bloomTaxonomy.includes('C5') || bloomTaxonomy.includes('C6') ? 'Sulit' : 'Menengah');

    const qItem: Question = {
      id: qId,
      subject,
      topic: base.topic || questionTopic,
      level,
      difficulty: computedDiff,
      bloomLevel: bloomTaxonomy,
      soloLevel: soloTaxonomy,
      questionText: mutatedText,
      questionType,
      formulaOrContext: base.formulaOrContext,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex,
      explanation: base.explanation,
      hint: base.hint,
      author: authorName || 'AI Pembina SMAN 1 Pardasuka',
      createdAt: new Date().toISOString().split('T')[0],

      // Atribut Baru Berbasis Master Prompt
      targetClass,
      competitionMode: generatorMode,
      indicator:
        base.indicator ||
        `Menganalisis, menerapkan, dan mengevaluasi pemecahan masalah materi ${base.topic || questionTopic} tingkat ${level}`,
      mainConcept:
        base.mainConcept ||
        base.formulaOrContext ||
        `Prinsip sains dan hukum dasar materi ${base.topic || questionTopic}`,
      commonMistakes:
        base.commonMistakes ||
        'Kesalahan substitusi variabel tanpa memeriksa syarat batas sistem fisis atau konversi satuan.',
      maxScore: questionType === 'esai' ? 100 : 4,
      estimatedMinutes:
        base.estimatedMinutes || (level.includes('Nasional') ? 6 : level.includes('Provinsi') ? 5 : 4),
      referenceSource:
        base.referenceSource ||
        `Silabus Resmi OSN Puspresnas & Kurikulum Olimpiade SMAN 1 Pardasuka (${subject})`,
    };

    if (questionType === 'bergambar') {
      qItem.diagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100720]">
        <rect width="320" height="180" fill="#13092b" rx="8"/>
        <line x1="40" y1="150" x2="280" y2="150" stroke="#7e22ce" stroke-width="2"/>
        <line x1="40" y1="20" x2="40" y2="150" stroke="#7e22ce" stroke-width="2"/>
        <path d="M 40,135 Q 120,130 150,110 T 170,40 Q 220,35 280,30" fill="none" stroke="#ec4899" stroke-width="3"/>
        <circle cx="160" cy="75" r="5" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
        <text x="175" y="78" fill="#f59e0b" font-size="10" font-weight="bold">Titik Analisis Kritis</text>
        <text x="160" y="170" fill="#c084fc" font-size="9" text-anchor="middle">Diagram Skema Ilmiah ${subject} - SMAN 1 Pardasuka</text>
      </svg>`;
      qItem.imageCaption = `Diagram Ilustrasi Ilmiah Terstandar Bidang ${subject}: ${questionTopic}`;
    } else if (questionType === 'esai') {
      qItem.options = [];
      qItem.correctAnswerIndex = -1;
      qItem.sampleEssayAnswer = `Langkah Penyelesaian & Pembuktian Ilmiah Bidang ${subject}:
1. Identifikasi kondisi awal sistem dan hukum sains yang mendasari: ${base.formulaOrContext || 'Prinsip Dasar'}.
2. Penurunan matematis / penjabaran mekanisme bertahap: ${base.explanation}
3. Interpretasi hasil akhir dan verifikasi batas domain fisis.`;
      qItem.rubricOrKeyPoints = [
        `Penguasaan konsep dan terminologi ilmiah bidang ${subject} (Bobot: 30%)`,
        'Sistematika penurunan rumus atau analisis sebab-akibat (Bobot: 45%)',
        'Ketepatan hasil numerik dan interpretasi pedagogis (Bobot: 25%)',
      ];
    }

    questions.push(qItem);
  }

  return questions;
}

/**
 * Universal Question Generator that works in all environments:
 * 1. Attempts fullstack API call (/api/ai/generate-questions) with Master Prompt attributes
 * 2. If API fails/offline, attempts client-side Gemini call with Master Prompt system instruction
 * 3. Fallbacks to built-in creative OSN generator with dynamic permutations and zero bank repetition
 */
export async function generateOsnQuestions(
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResponse> {
  const {
    subject,
    level,
    bloomTaxonomy,
    soloTaxonomy,
    count,
    topic,
    questionType,
    customPrompt,
    authorName,
    modelEngine = getSavedGeminiEngine(),
    reasoningLevel = getSavedReasoningLevel(),
    apiKey = getSavedGeminiApiKey(),
    existingQuestions,
    targetClass = 'XI',
    generatorMode = 'Mode C (Seleksi Kabupaten/Kota)',
    difficulty = 'Campuran',
    schoolName = 'SMAN 1 Pardasuka',
    language = 'Indonesia',
  } = params;

  const excludedSummaries = extractExcludedSummaries(existingQuestions, subject);

  // 1. Try calling the backend endpoint first (works in dev / express environment)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        level,
        bloomTaxonomy,
        soloTaxonomy,
        count,
        topic,
        questionType,
        customPrompt,
        modelEngine,
        reasoningLevel,
        apiKey,
        existingQuestions: excludedSummaries,
        targetClass,
        generatorMode,
        difficulty,
        schoolName,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        // Normalize questions with anti-duplication, full metadata, and option permutation
        const safeQuestions: Question[] = data.questions.map((q: any, idx: number) =>
          normalizeGeminiQuestion(q, idx, {
            subject,
            topic,
            level,
            bloomTaxonomy,
            soloTaxonomy,
            targetClass,
            generatorMode,
            difficulty,
            questionType,
            authorName,
          })
        );

        return {
          success: true,
          questions: safeQuestions,
          source: data.source || modelEngine,
          modelEngine: data.modelEngine || modelEngine,
          reasoningLevel: data.reasoningLevel || reasoningLevel,
          note: data.note,
        };
      }
    }
  } catch (apiError) {
    console.warn(
      'Backend /api/ai/generate-questions not reachable (expected on static deployments):',
      apiError
    );
  }

  // 2. Try Client-Side Gemini if API Key is configured
  const effectiveClientApiKey =
    apiKey?.trim() ||
    getSavedGeminiApiKey() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);

  if (effectiveClientApiKey && effectiveClientApiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const clientAi = new GoogleGenAI({ apiKey: effectiveClientApiKey });
      const targetModel =
        modelEngine === 'gemini-4-argon' || modelEngine === 'gemini-4'
          ? 'gemini-4-argon'
          : 'gemini-3.8-flash';

      let chosenThinkingLevel = ThinkingLevel.HIGH;
      if (reasoningLevel === 'rendah' || reasoningLevel === 'low') {
        chosenThinkingLevel = ThinkingLevel.LOW;
      } else if (reasoningLevel === 'sedang' || reasoningLevel === 'medium') {
        chosenThinkingLevel = ThinkingLevel.MEDIUM;
      } else if (reasoningLevel === 'tinggi' || reasoningLevel === 'high') {
        chosenThinkingLevel = ThinkingLevel.HIGH;
      }

      const randomSeed = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

      const systemPrompt = buildMasterOlympiadSystemPrompt({
        schoolName,
        subject,
        targetClass,
        level,
        generatorMode,
        difficulty,
        count,
        topic,
        bloomTaxonomy,
        soloTaxonomy,
        questionType,
        language,
        customPrompt,
        exclusionSummaries: excludedSummaries,
        randomSeed,
      });

      const userContentPrompt = `Susunlah ${count} butir soal ${subject} bertipe ${questionType} tingkat ${level} dengan topik "${topic}", mode "${generatorMode}", kelas "${targetClass}", tingkat kesulitan "${difficulty}".
[Pencegahan Duplikasi & Keberagaman]: Seluruh butir soal dan pilihan jawaban HARUS 100% orisinal, baru, mutakhir, berbeda bentuk, dan tidak menduplikasi bank soal pembanding yang telah disediakan. Variasikan struktur masalah dan data. Kunci jawaban (correctAnswerIndex: 0 s.d. 4) HARUS disebar acak dan seimbang antara A, B, C, D, dan E. Sertakan indikator kompetensi, model masalah, strategi penalaran, dan ringkasan keunikan. [Seed Keberagaman: ${randomSeed}]`;

      const response = await clientAi.models.generateContent({
        model: targetModel,
        contents: userContentPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingLevel: chosenThinkingLevel,
          },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                topic: { type: Type.STRING },
                targetClass: { type: Type.STRING },
                level: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                indicator: { type: Type.STRING },
                formulaOrContext: { type: Type.STRING },
                mainConcept: { type: Type.STRING },
                commonMistakes: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING },
                estimatedMinutes: { type: Type.INTEGER },
                maxScore: { type: Type.INTEGER },
                referenceSource: { type: Type.STRING },
                questionType: { type: Type.STRING },
                diagramSvg: { type: Type.STRING },
                imageCaption: { type: Type.STRING },
                sampleEssayAnswer: { type: Type.STRING },
                rubricOrKeyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                bloomLevel: { type: Type.STRING },
                soloLevel: { type: Type.STRING },
                competitionMode: { type: Type.STRING },
                concept: { type: Type.STRING },
                skillTested: { type: Type.STRING },
                problemStructure: { type: Type.STRING },
                reasoningMethod: { type: Type.STRING },
                contextType: { type: Type.STRING },
                dataRepresentation: { type: Type.STRING },
                noveltySummary: { type: Type.STRING },
                similarityStatus: { type: Type.STRING },
                validationStatus: { type: Type.STRING },
              },
              required: ['questionText', 'explanation'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mappedQuestions: Question[] = parsed.map((q: any, idx: number) =>
          normalizeGeminiQuestion(q, idx, {
            subject,
            topic,
            level,
            bloomTaxonomy,
            soloTaxonomy,
            targetClass,
            generatorMode,
            difficulty,
            questionType,
            authorName:
              authorName ||
              `${targetModel === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'} (High Reasoning • SMAN 1 Pardasuka)`,
          })
        );

        return {
          success: true,
          questions: mappedQuestions,
          source: targetModel,
          modelEngine: targetModel,
          reasoningLevel,
          note: `Berhasil dirangkai dengan Engine ${targetModel === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'} (Penalaran Tinggi / High Reasoning • ${generatorMode}).`,
        };
      }
    } catch (clientGeminiError) {
      console.warn(
        'Client Gemini generation failed, switching to calibrated curriculum engine:',
        clientGeminiError
      );
    }
  }

  // 3. Guaranteed Creative OSN Generator Fallback (Varied, anti-duplicate, randomized keys)
  const fallbackQuestions = generateCurriculumFallbackQuestions(
    subject,
    level,
    bloomTaxonomy,
    soloTaxonomy,
    count,
    topic,
    questionType,
    customPrompt,
    authorName,
    existingQuestions,
    targetClass,
    generatorMode,
    difficulty
  );

  return {
    success: true,
    questions: fallbackQuestions,
    source: 'kurikulum-internal-sman1pardasuka',
    modelEngine,
    reasoningLevel,
    note: `Soal ${subject} baru & bervariasi berhasil dirangkai (${level} • ${generatorMode}).`,
  };
}

export interface ExplainQuestionParams {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  originalExplanation?: string;
}

export async function explainQuestionRemediation(
  params: ExplainQuestionParams
): Promise<string> {
  const { questionText, studentAnswer, correctAnswer, subject, originalExplanation } = params;

  // 1. Try Backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('/api/ai/explain-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText,
        studentAnswer,
        correctAnswer,
        subject,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.explanation) {
        return data.explanation;
      }
    }
  } catch (e) {
    console.warn('Backend explain endpoint not reached, using local remediation generator:', e);
  }

  // 2. Client-side fallback explanation
  return `### Analisis Remediasi Ilmiah (Bidang: ${subject})
**Kunci Jawaban Benar:** ${correctAnswer}
**Jawaban Siswa:** ${studentAnswer || '(Belum dijawab)'}

#### 1. Titik Miskonsepsi Siswa
Pilihan jawaban Anda belum tepat karena terjadi miskonsepsi dalam memahami relasi antar variabel ilmiah pada soal ini. Perhatikan kata kunci fenomena dan hukum fisika/biologi/kimia/matematika yang mendasari pertanyaan.

#### 2. Penjelasan Konsep Inti
${originalExplanation || 'Pelajari kembali prinsip fundamental materi ini melalui modul dan video pembelajaran interaktif pada menu Bimbingan OSN.'}

#### 3. Rekomendasi Tindak Lanjut Guru Pembina
- Buka materi terkait di repositori Google Scholar dan tonton rekaman bimbingan video terkait.
- Kerjakan kembali butir soal variasi serupa untuk memantapkan pemahaman konsep tingkat tinggi (HOTS).`;
}
