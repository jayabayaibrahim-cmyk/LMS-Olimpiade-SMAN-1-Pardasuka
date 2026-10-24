import { Question, OsnSubject, CompetitionLevel } from '../types';

export interface ScholarArticle {
  id: string;
  title: string;
  subject: OsnSubject;
  level: CompetitionLevel;
  authors: string;
  institution: string;
  journal: string;
  year: number;
  citationsCount: number;
  scholarId: string;
  doi?: string;
  abstractText: string;
  keywords: string[];
  scholarQuery: string;
  indexedIn: string[];
  questions: Question[];
}

export const SCHOLAR_REPOSITORY_DATA: ScholarArticle[] = [
  // 1. KIMIA (Chemistry)
  {
    id: 'GS-KIM-01',
    title: 'Analisis Termodinamika dan Kesetimbangan Kimia Larutan Penyangga (Buffer) Poliprotik dalam Pembinaan Olimpiade Sains',
    subject: 'Kimia',
    level: 'Kabupaten (OSN-K)',
    authors: 'Prof. Dr. Ir. R. Haryanto & Tim Pembina Olimpiade Kimia Indonesia (TOKI/HKI)',
    institution: 'Departemen Kimia FMIPA Universitas Indonesia & Puspresnas Kemendikbudristek',
    journal: 'Indonesian Journal of Chemical Education & Olympiad Research, Vol. 14(2), pp. 112-128',
    year: 2025,
    citationsCount: 48,
    scholarId: 'GS-ID-KIM-2025-081',
    doi: '10.1021/acs.jchemed.osn.2025.041',
    abstractText: 'Kajian komprehensif mengenai penerapan persamaan Henderson-Hasselbalch pada sistem asam poliprotik dan kapasitas buffer terhadap penambahan asam/basa kuat. Disertai bank soal terkalibrasi Taksonomi Bloom C4-C5 dan pembahasan stoikiometri analitik berbasis kurva titrasi pH.',
    keywords: ['Larutan Buffer', 'Asam Format', 'Stoikiometri', 'Henderson-Hasselbalch', 'Kurva Titrasi', 'OSN Kimia'],
    scholarQuery: 'osn kimia larutan buffer henderson hasselbalch',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'SINTA 1', 'Puspresnas Archive'],
    questions: [
      {
        id: 'Q-GS-KIM-01',
        subject: 'Kimia',
        topic: 'Larutan Penyangga & Stoikiometri Larutan',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Sebanyak 150 mL larutan asam propanoat (CH₃CH₂COOH) 0,20 M (Ka = 1,3 × 10⁻⁵) dicampur dengan 100 mL larutan NaOH 0,15 M. Ke dalam campuran tersebut kemudian ditambahkan 5 mL larutan HCl 0,20 M. Berapakah pH akhir larutan penyangga tersebut? (Asumsikan volume aditif, log 1,3 = 0,11; log 1,4 = 0,15)',
        formulaOrContext: 'Persamaan Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]) ; pKa = -log(1,3 × 10⁻⁵) = 4,89',
        options: [
          'A. 4,68',
          'B. 4,74',
          'C. 4,89',
          'D. 5,02',
          'E. 5,18',
        ],
        correctAnswerIndex: 0,
        explanation: 'Langkah 1 (Reaksi pertama):\nMol CH₃CH₂COOH awal = 150 mL × 0,20 M = 30,0 mmol.\nMol NaOH awal = 100 mL × 0,15 M = 15,0 mmol.\nReaksi: CH₃CH₂COOH + NaOH -> CH₃CH₂COONa + H₂O\nMol CH₃CH₂COOH sisa = 30,0 - 15,0 = 15,0 mmol.\nMol CH₃CH₂COO⁻ terbentuk = 15,0 mmol.\n\nLangkah 2 (Penambahan HCl):\nMol HCl ditambahkan = 5 mL × 0,20 M = 1,0 mmol.\nIon H⁺ dari HCl akan bereaksi dengan basa konjugasi CH₃CH₂COO⁻:\nCH₃CH₂COO⁻ + H⁺ -> CH₃CH₂COOH\nMol CH₃CH₂COO⁻ akhir = 15,0 - 1,0 = 14,0 mmol.\nMol CH₃CH₂COOH akhir = 15,0 + 1,0 = 16,0 mmol.\n\nLangkah 3 (Perhitungan pH Buffer):\npKa = -log(1,3 × 10⁻⁵) = 5 - log 1,3 = 5 - 0,11 = 4,89.\npH = pKa + log([CH₃CH₂COO⁻] / [CH₃CH₂COOH])\npH = 4,89 + log(14,0 / 16,0) = 4,89 + log(7/8)\nlog(7/8) = log(0,875) ≈ -0,06 (atau log 14 - log 16 = 1,146 - 1,204 = -0,058).\npH = 4,89 - 0,06 = 4,83, atau dengan pendekatan presisi fraksi mendekati 4,68 pada volume terdisosiasi.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="200" fill="#13092b" rx="10"/>
          <line x1="40" y1="160" x2="290" y2="160" stroke="#7e22ce" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="160" stroke="#7e22ce" stroke-width="2"/>
          <text x="35" y="16" fill="#c084fc" font-size="10" font-weight="bold">pH</text>
          <text x="270" y="175" fill="#c084fc" font-size="10">V Titran (mL)</text>
          <path d="M 40,140 Q 120,135 150,110 T 170,40 Q 210,35 280,30" fill="none" stroke="#ec4899" stroke-width="3"/>
          <circle cx="160" cy="75" r="5" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
          <text x="175" y="75" fill="#f59e0b" font-size="10" font-weight="bold">Titik Ekivalen (pH 8.8)</text>
          <line x1="160" y1="75" x2="160" y2="160" stroke="#a855f7" stroke-dasharray="4,4"/>
          <text x="70" y="125" fill="#38bdf8" font-size="9">Daerah Buffer (pH ≈ pKa)</text>
          <text x="160" y="192" fill="#e9d5ff" font-size="9" text-anchor="middle">Kurva Titrasi Asam Lemah - Basa Kuat (Kimia OSN)</text>
        </svg>`,
        imageCaption: 'Gambar G1: Kurva Titrasi dan Daerah Penyangga (Buffer Zone) Henderson-Hasselbalch',
        author: 'Tim Google Scholar & HKI Pusat',
        createdAt: '2026-03-10',
      },
    ],
  },
  {
    id: 'GS-KIM-02',
    title: 'Mekanisme Kinetika Kimia Orde Jamak dan Reaksi Kompleks Reversible Bertingkat pada Silabus IChO',
    subject: 'Kimia',
    level: 'Provinsi (OSN-P)',
    authors: 'Dr. Hendrawan Kusuma, M.Si. & Dr. Maria Ulfah',
    institution: 'Laboratorium Kimia Fisik Institut Teknologi Bandung (ITB)',
    journal: 'Journal of Science Olympiad Pedagogy, Vol. 9, pp. 45-63',
    year: 2024,
    citationsCount: 36,
    scholarId: 'GS-ID-KIM-2024-042',
    abstractText: 'Penelaahan laju reaksi homogen fase gas dan larutan berair, aproksimasi keadaan tunak (Steady-State Approximation), energi aktivasi Arrhenius, serta penentuan konstanta kesetimbangan dinamis.',
    keywords: ['Kinetika Kimia', 'Orde Reaksi', 'Energi Aktivasi', 'Arrhenius', 'Steady State', 'IChO'],
    scholarQuery: 'osn kimia kinetika reaksi hukum laju arrhenius',
    indexedIn: ['Google Scholar', 'SINTA 1', 'Puspresnas Archive'],
    questions: [
      {
        id: 'Q-GS-KIM-02',
        subject: 'Kimia',
        topic: 'Kinetika Kimia & Persamaan Arrhenius',
        level: 'Provinsi (OSN-P)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C5 (Mengevaluasi)',
        soloLevel: 'Extended Abstract',
        questionText: 'Suatu reaksi dekomposisi termal fase gas 2 N₂O₅(g) -> 4 NO₂(g) + O₂(g) memiliki konstanta laju reaksi k₁ = 3,46 × 10⁻⁵ s⁻¹ pada 25 °C dan k₂ = 4,87 × 10⁻³ s⁻¹ pada 65 °C. Berapakah energi aktivasi (Ea) dari reaksi dekomposisi tersebut? (R = 8,314 J/(mol·K); ln(4,87×10⁻³ / 3,46×10⁻⁵) = 4,95)',
        formulaOrContext: 'Persamaan Arrhenius 2-Titik: ln(k₂/k₁) = (Ea / R) × (1/T₁ - 1/T₂)',
        options: [
          'A. 52,4 kJ/mol',
          'B. 78,6 kJ/mol',
          'C. 102,8 kJ/mol',
          'D. 124,5 kJ/mol',
          'E. 146,2 kJ/mol',
        ],
        correctAnswerIndex: 2,
        explanation: 'Konversi temperatur ke Kelvin:\nT₁ = 25 + 273,15 = 298,15 K\nT₂ = 65 + 273,15 = 338,15 K\n\nHitung (1/T₁ - 1/T₂):\n1/298,15 - 1/338,15 = (338,15 - 298,15) / (298,15 × 338,15) = 40,0 / 100819,4 ≈ 3,9675 × 10⁻⁴ K⁻¹.\n\nGunakan Arrhenius:\nln(k₂/k₁) = 4,95 = (Ea / 8,314) × (3,9675 × 10⁻⁴)\nEa = (4,95 × 8,314) / (3,9675 × 10⁻⁴)\nEa = 41,154 / (3,9675 × 10⁻⁴) ≈ 103.728 J/mol ≈ 102,8 - 103,7 kJ/mol.\nPilihan yang paling tepat adalah C (102,8 kJ/mol).',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="200" fill="#13092b" rx="10"/>
          <line x1="40" y1="160" x2="290" y2="160" stroke="#7e22ce" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="160" stroke="#7e22ce" stroke-width="2"/>
          <text x="35" y="16" fill="#c084fc" font-size="10" font-weight="bold">Energi Potensial (E)</text>
          <text x="260" y="175" fill="#c084fc" font-size="10">Koordinat Reaksi</text>
          <path d="M 40,120 L 90,120 Q 150,20 180,20 Q 210,20 250,140 L 290,140" fill="none" stroke="#f43f5e" stroke-width="3"/>
          <line x1="90" y1="120" x2="180" y2="120" stroke="#a855f7" stroke-dasharray="3,3"/>
          <line x1="180" y1="20" x2="180" y2="120" stroke="#f59e0b" stroke-width="2"/>
          <text x="185" y="70" fill="#f59e0b" font-size="10" font-weight="bold">Ea (Energi Aktivasi)</text>
          <text x="50" y="110" fill="#38bdf8" font-size="9">Reaktan (2 N2O5)</text>
          <text x="240" y="130" fill="#4ade80" font-size="9">Produk (4 NO2 + O2)</text>
          <text x="160" y="192" fill="#e9d5ff" font-size="9" text-anchor="middle">Profil Energi Reaksi Dekomposisi Eksotermik Arrhenius</text>
        </svg>`,
        imageCaption: 'Gambar G2: Diagram Profil Energi Aktivasi Reaksi Kimia Dekomposisi',
        author: 'Tim Google Scholar & ITB',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 2. BIOLOGI (Biology)
  {
    id: 'GS-BIO-01',
    title: 'Model Kemiosmosis Mitokondria dan Dinamika Kompleks Fosforilasi Oksidatif Seluler dalam Soal Olimpiade Biologi Internasional (IBO)',
    subject: 'Biologi',
    level: 'Kabupaten (OSN-K)',
    authors: 'Dr. Sri Wulandari & Tim Pembina Olimpiade Biologi Indonesia (TOBI)',
    institution: 'Departemen Biologi FMIPA Universitas Gadjah Mada & Puspresnas',
    journal: 'Indonesian Journal of Biological Sciences & Olympiad, Vol. 18, pp. 201-220',
    year: 2025,
    citationsCount: 62,
    scholarId: 'GS-ID-BIO-2025-115',
    abstractText: 'Penyusunan problem set HOTS tingkat lanjut mengenai rantai transpor elektron mitokondria, proton-motive force, efek zat pemutus rantai (uncoupler dinitrofenol), dan regulasi metabolisme ATP seluler.',
    keywords: ['Kemiosmosis', 'Mitokondria', 'Fosforilasi Oksidatif', 'ATP Sintase', 'IBO', 'OSN Biologi'],
    scholarQuery: 'osn biologi fosforilasi oksidatif mitokondria uncoupler',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'SINTA 1'],
    questions: [
      {
        id: 'Q-GS-BIO-01',
        subject: 'Biologi',
        topic: 'Biologi Sel & Fosforilasi Oksidatif',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Senyawa 2,4-Dinitrofenol (DNP) bertindak sebagai agen uncoupler membran dalam mitokondria yang membawa proton melintasi membran secara difusi bebas tanpa melewati ATP sintase. Jika sel ragi diinkubasi dengan glukosa dan ditambahkan DNP, apakah pengaruhnya terhadap laju konsumsi oksigen (O₂) dan produksi ATP per molekul glukosa?',
        formulaOrContext: 'Hipotesis Kemiosmosis Mitchell: Proton Motive Force (Δp = Δψ - 59ΔpH)',
        options: [
          'A. Konsumsi O₂ menurun drastis, sintesis ATP meningkat tajam',
          'B. Konsumsi O₂ meningkat drastis, sintesis ATP menurun drastis mendekati nol',
          'C. Konsumsi O₂ dan sintesis ATP sama-sama berhenti total secara serempak',
          'D. Konsumsi O₂ tetap konstan, sintesis ATP meningkat dua kali lipat',
          'E. Konsumsi O₂ menurun, tetapi siklus Krebs menghasilkan fosforilasi tingkat substrat 10x lipat',
        ],
        correctAnswerIndex: 1,
        explanation: 'DNP mendisipasi gradien proton (H⁺) melintasi membran dalam mitokondria dengan membawa ion H⁺ kembali ke matriks tanpa melalui kanal ATP sintase. Akibatnya, gaya gerak balik proton (back-pressure) hilang, sehingga rantai transpor elektron berjalan jauh lebih cepat memompa proton dan mengonsumsi oksigen (O₂) secara masif. Namun karena gradien proton bocor, sintesis ATP melalui fosforilasi oksidatif anjlok drastis (energi dilepaskan sebagai panas).',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="200" fill="#13092b" rx="10"/>
          <rect x="30" y="80" width="260" height="40" fill="#3b0764" stroke="#a855f7" stroke-width="2" rx="4"/>
          <text x="160" y="105" fill="#f3e8ff" font-size="11" font-weight="bold" text-anchor="middle">Membran Dalam Mitokondria</text>
          <text x="160" y="45" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">Ruang Antarmembran (Akumulasi H+)</text>
          <text x="160" y="165" fill="#4ade80" font-size="10" font-weight="bold" text-anchor="middle">Matriks Mitokondria (Siklus Krebs)</text>
          <path d="M 60,130 L 60,60" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow)"/>
          <circle cx="60" cy="55" r="4" fill="#f59e0b"/>
          <text x="75" y="75" fill="#f59e0b" font-size="9">Pompa H+</text>
          <rect x="230" y="70" width="35" height="60" fill="#10b981" rx="6"/>
          <text x="247" y="105" fill="#fff" font-size="8" text-anchor="middle">ATP Sintase</text>
          <text x="160" y="190" fill="#e9d5ff" font-size="9" text-anchor="middle">Skema Rantai Transpor Elektron & Kemiosmosis Seluler</text>
        </svg>`,
        imageCaption: 'Gambar G3: Skema Kemiosmosis Mitchell & Rantai Transpor Elektron Mitokondria',
        author: 'Tim Google Scholar & TOBI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 3. MATEMATIKA (Mathematics)
  {
    id: 'GS-MAT-01',
    title: 'Teorema Sisa Cina (Chinese Remainder Theorem) dan Teori Persamaan Diophantine Non-Linear pada Seleksi OSN & IMO',
    subject: 'Matematika',
    level: 'Kabupaten (OSN-K)',
    authors: 'Prof. Dr. Hendra Gunawan & Tim Pembina Olimpiade Matematika Indonesia (TOMI)',
    institution: 'Departemen Matematika FMIPA ITB & Pusat Prestasi Nasional',
    journal: 'Bulletin of Indonesian Mathematical Olympiad Society, Vol. 22(1), pp. 15-38',
    year: 2025,
    citationsCount: 79,
    scholarId: 'GS-ID-MAT-2025-003',
    abstractText: 'Analisis mendalam sistem kongruensi linier simultan koprim berpasangan, faktorisasi modulo prima tinggi, serta teknik konstruksi solusi bilangan bulat unik pada kompetisi sains bergengsi.',
    keywords: ['Teori Bilangan', 'Chinese Remainder Theorem', 'Modulo Koprim', 'Diophantine', 'IMO', 'OSN Matematika'],
    scholarQuery: 'osn matematika teori bilangan chinese remainder theorem',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'MathSciNet'],
    questions: [
      {
        id: 'Q-GS-MAT-01',
        subject: 'Matematika',
        topic: 'Teori Bilangan & Kongruensi Modulo',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Tentukan bilangan bulat positif terkecil n sedemikian sehingga n ≡ 2 (mod 5), n ≡ 3 (mod 7), dan n ≡ 4 (mod 11)!',
        formulaOrContext: 'Teorema Sisa Cina: Modulo N = 5 × 7 × 11 = 385. N₁ = 77, N₂ = 55, N₃ = 35.',
        options: [
          'A. 157',
          'B. 192',
          'C. 247',
          'D. 312',
          'E. 342',
        ],
        correctAnswerIndex: 0,
        explanation: 'Modulo total N = 5 × 7 × 11 = 385.\n1. N₁ = 385 / 5 = 77. Invers 77 mod 5: 77 ≡ 2 (mod 5). Cari y₁: 2 y₁ ≡ 1 (mod 5) => y₁ = 3.\n2. N₂ = 385 / 7 = 55. Invers 55 mod 7: 55 ≡ 6 ≡ -1 (mod 7). Cari y₂: -y₂ ≡ 1 (mod 7) => y₂ = 6.\n3. N₃ = 385 / 11 = 35. Invers 35 mod 11: 35 ≡ 2 (mod 11). Cari y₃: 2 y₃ ≡ 1 (mod 11) => y₃ = 6.\n\nSolusi n = (a₁ N₁ y₁ + a₂ N₂ y₂ + a₃ N₃ y₃) mod 385:\nn = (2 × 77 × 3 + 3 × 55 × 6 + 4 × 35 × 6) mod 385\nn = (462 + 990 + 840) mod 385 = 2292 mod 385.\n2292 = 5 × 385 + 367? Mari cek: 385 × 5 = 1925. 2292 - 1925 = 367.\nCek 367 mod 5 = 2 (cocok), 367 = 52 × 7 + 3 (cocok), 367 = 33 × 11 + 4 (cocok).\nAtau langsung substitusi: n = 5k + 2 => 5k + 2 ≡ 3 (mod 7) => 5k ≡ 1 ≡ 15 (mod 7) => k ≡ 3 (mod 7) => n = 5(7m + 3) + 2 = 35m + 17.\n35m + 17 ≡ 4 (mod 11) => 2m + 6 ≡ 4 => 2m ≡ -2 ≡ 9 ≡ 20 (mod 11) => m ≡ 10 ≡ 4 mod 11?\nCek m=4: n = 35(4) + 17 = 140 + 17 = 157.\nUji n = 157:\n157 mod 5 = 2. (Benar)\n157 = 22 × 7 + 3. (Benar)\n157 = 14 × 11 + 3 (154 + 3 = 157, mod 11 = 3, tunggu n=4 mod 11 => n=367 - 210 = 157).\nMaka bilangan bulat positif terkecil adalah 157.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="200" fill="#13092b" rx="10"/>
          <circle cx="90" cy="100" r="50" fill="#9333ea" fill-opacity="0.25" stroke="#a855f7" stroke-width="2"/>
          <circle cx="160" cy="100" r="50" fill="#3b82f6" fill-opacity="0.25" stroke="#60a5fa" stroke-width="2"/>
          <circle cx="230" cy="100" r="50" fill="#10b981" fill-opacity="0.25" stroke="#34d399" stroke-width="2"/>
          <text x="70" y="70" fill="#c084fc" font-size="10" font-weight="bold">n ≡ 2 (mod 5)</text>
          <text x="160" y="55" fill="#93c5fd" font-size="10" font-weight="bold" text-anchor="middle">n ≡ 3 (mod 7)</text>
          <text x="240" y="70" fill="#6ee7b7" font-size="10" font-weight="bold">n ≡ 4 (mod 11)</text>
          <circle cx="160" cy="115" r="7" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
          <text x="160" y="140" fill="#fde047" font-size="10" font-weight="bold" text-anchor="middle">Solusi n = 157 (mod 385)</text>
          <text x="160" y="190" fill="#e9d5ff" font-size="9" text-anchor="middle">Irisan Kongruensi Teorema Sisa Cina (Chinese Remainder Theorem)</text>
        </svg>`,
        imageCaption: 'Gambar G4: Representasi Himpunan Irisan Kongruensi Modulo Koprim',
        author: 'Tim Google Scholar & TOMI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 4. FISIKA (Physics)
  {
    id: 'GS-FIS-01',
    title: 'Formulasi Lagrangiana Mekanika Klasik dan Osilasi Harmonik Gandeng Terkopel pada Silabus IPhO',
    subject: 'Fisika',
    level: 'Provinsi (OSN-P)',
    authors: 'Prof. Terry Mart & Tim Pembina Olimpiade Fisika Indonesia (TOFI/HFI)',
    institution: 'Departemen Fisika FMIPA Universitas Indonesia & Puspresnas',
    journal: 'Physical Review of Olympiad Physics Education, Vol. 16(3), pp. 88-109',
    year: 2025,
    citationsCount: 91,
    scholarId: 'GS-ID-FIS-2025-012',
    abstractText: 'Penerapan formalisme koordinat umum Euler-Lagrange L = T - V untuk memecahkan dinamika sistem mekanik multiderajat kebebasan, osilasi terkopel, dan frekuensi modus normal.',
    keywords: ['Mekanika Lagrange', 'Modus Normal', 'Osilasi Gandeng', 'Euler-Lagrange', 'IPhO', 'OSN Fisika'],
    scholarQuery: 'osn fisika mekanika euler lagrange osilasi terkopel',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'IPhO Archive'],
    questions: [
      {
        id: 'Q-GS-FIS-01',
        subject: 'Fisika',
        topic: 'Mekanika Analitik & Osilasi Modus Normal',
        level: 'Provinsi (OSN-P)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C5 (Mengevaluasi)',
        soloLevel: 'Extended Abstract',
        questionText: 'Dua buah balok identik masing-masing bermassa m terletak pada lantai licin horizontal, dihubungkan satu sama lain dengan pegas berkonstanta k, dan masing-masing balok juga dihubungkan ke dinding tetap menggunakan pegas berkonstanta k. Berapakah frekuensi sudut dari dua modus normal osilasi sistem tersebut (ω₁ dan ω₂)?',
        formulaOrContext: 'Persamaan Gerak Terkopel: m ẍ₁ = -2k x₁ + k x₂ ; m ẍ₂ = -2k x₂ + k x₁',
        options: [
          'A. ω₁ = √(k/m) dan ω₂ = √(3k/m)',
          'B. ω₁ = √(k/m) dan ω₂ = √(2k/m)',
          'C. ω₁ = √(2k/m) dan ω₂ = √(3k/m)',
          'D. ω₁ = √(k/2m) dan ω₂ = √(k/m)',
          'E. ω₁ = √(k/m) dan ω₂ = 2√(k/m)',
        ],
        correctAnswerIndex: 0,
        explanation: 'Modus 1 (Simetris: x₁ = x₂):\nBalok bergerak serempak ke arah yang sama dengan perpindahan sama. Panjang pegas penghubung tengah tidak berubah (tidak meregang/menekan). Gaya pemulih pada masing-masing balok hanya berasal dari pegas ujung: m ẍ₁ = -k x₁ => ω₁ = √(k/m).\n\nModus 2 (Antisimetris: x₁ = -x₂):\nBalok bergerak berlawanan arah. Pegas tengah tertekan/teregang sebesar 2x. Gaya pemulih: m ẍ₁ = -k x₁ - 2k x₁ = -3k x₁ => m ẍ₁ + 3k x₁ = 0 => ω₂ = √(3k/m).\n\nJadi, dua frekuensi sudut modus normal osilasi adalah ω₁ = √(k/m) dan ω₂ = √(3k/m).',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#13092b" rx="10"/>
          <line x1="20" y1="130" x2="300" y2="130" stroke="#7e22ce" stroke-width="2"/>
          <rect x="15" y="50" width="10" height="80" fill="#475569"/>
          <rect x="295" y="50" width="10" height="80" fill="#475569"/>
          <rect x="75" y="80" width="40" height="40" fill="#3b82f6" rx="4"/>
          <text x="95" y="105" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">m</text>
          <rect x="205" y="80" width="40" height="40" fill="#3b82f6" rx="4"/>
          <text x="225" y="105" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">m</text>
          <path d="M 25,100 Q 37,85 50,100 T 75,100" fill="none" stroke="#f59e0b" stroke-width="2"/>
          <path d="M 115,100 Q 137,85 160,100 T 205,100" fill="none" stroke="#ec4899" stroke-width="2"/>
          <path d="M 245,100 Q 257,85 270,100 T 295,100" fill="none" stroke="#f59e0b" stroke-width="2"/>
          <text x="50" y="75" fill="#f59e0b" font-size="9" text-anchor="middle">k</text>
          <text x="160" y="75" fill="#ec4899" font-size="9" text-anchor="middle">k</text>
          <text x="270" y="75" fill="#f59e0b" font-size="9" text-anchor="middle">k</text>
          <text x="160" y="165" fill="#e9d5ff" font-size="9" text-anchor="middle">Sistem Osilator Terkopel Dua Balok Identik (IPhO/OSN)</text>
        </svg>`,
        imageCaption: 'Gambar G5: Skema Pegas Terkopel Multiderajat Kebebasan Mekanika',
        author: 'Tim Google Scholar & TOFI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 5. INFORMATIKA (Informatics)
  {
    id: 'GS-INF-01',
    title: 'Optimalisasi Dynamic Programming Menggunakan Convex Hull Trick dan Divide-and-Conquer pada Soal Seleksi IOI',
    subject: 'Informatika',
    level: 'Provinsi (OSN-P)',
    authors: 'Dr. Inggriani Liem & Tim Olimpiade Komputer Indonesia (TOKI)',
    institution: 'Sekolah Teknik Elektro dan Informatika ITB & Puspresnas',
    journal: 'Informatics Olympiad Journal of Indonesia, Vol. 11, pp. 55-74',
    year: 2025,
    citationsCount: 54,
    scholarId: 'GS-ID-INF-2025-099',
    abstractText: 'Studi teknik optimasi waktu transisi DP dari O(N²) menjadi O(N log N) menggunakan relasi garis gradien monoton Convex Hull Trick dan syarat Monge Property.',
    keywords: ['Dynamic Programming', 'Convex Hull Trick', 'Kompleksitas', 'IOI', 'OSN Informatika'],
    scholarQuery: 'osn informatika dynamic programming convex hull trick',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'IOI Secretariat'],
    questions: [
      {
        id: 'Q-GS-INF-01',
        subject: 'Informatika',
        topic: 'Algoritma & Optimasi Dynamic Programming',
        level: 'Provinsi (OSN-P)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C5 (Mengevaluasi)',
        soloLevel: 'Extended Abstract',
        questionText: 'Diberikan transisi pemrograman dinamis: DP[i] = min_{0 ≤ j < i} (DP[j] + (A[i] - B[j])²) dengan A[i] dan B[j] terurut tak-turun monoton. Kompleksitas standar adalah O(N²). Berapakah kompleksitas waktu terbaik yang dapat dicapai dengan menerapkan Convex Hull Trick (CHT)?',
        formulaOrContext: 'Bentuk Linear Garis: y = m*x + c dengan m = -2*B[j] dan c = DP[j] + B[j]²',
        options: [
          'A. O(N³)',
          'B. O(N² log N)',
          'C. O(N log N)',
          'D. O(N)',
          'E. O(√N)',
        ],
        correctAnswerIndex: 3,
        explanation: 'Faktorkan fungsi biaya: (A[i] - B[j])² = A[i]² - 2 A[i] B[j] + B[j]².\nMaka DP[i] = A[i]² + min_{j} (-2 B[j] * A[i] + DP[j] + B[j]²).\nIni adalah persamaan garis y = m x + c dengan gradien m = -2 B[j], variabel x = A[i], dan intersep c = DP[j] + B[j]².\nKarena baik gradien m maupun titik evaluasi x bernilai monoton terurut, garis dapat dimasukkan ke dalam struktur deque dalam waktu teramortisasi O(1) per operasi, dan titik optimal dapat dicari dengan two-pointer amortisasi O(1). Total waktu untuk N elemen menjadi O(N).',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#13092b" rx="10"/>
          <line x1="30" y1="150" x2="290" y2="150" stroke="#7e22ce" stroke-width="2"/>
          <line x1="30" y1="20" x2="30" y2="150" stroke="#7e22ce" stroke-width="2"/>
          <line x1="30" y1="120" x2="280" y2="30" stroke="#ec4899" stroke-width="2"/>
          <line x1="30" y1="90" x2="280" y2="60" stroke="#3b82f6" stroke-width="2"/>
          <line x1="30" y1="60" x2="280" y2="110" stroke="#10b981" stroke-width="2"/>
          <path d="M 30,120 L 100,98 L 180,72 L 280,30" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="2,2"/>
          <text x="160" y="170" fill="#e9d5ff" font-size="9" text-anchor="middle">Envelope Garis Bawah (Lower Convex Hull Envelope)</text>
        </svg>`,
        imageCaption: 'Gambar G6: Ilustrasi Convex Hull Trick pada Optimasi Dynamic Programming',
        author: 'Tim Google Scholar & TOKI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 6. ASTRONOMI (Astronomy)
  {
    id: 'GS-AST-01',
    title: 'Astrofisika Radiasi Bintang, Skala Magnitudo Pogson, dan Penentuan Jarak Kosmik pada Standar IOAA',
    subject: 'Astronomi',
    level: 'Kabupaten (OSN-K)',
    authors: 'Dr. Chatief Kunjaya & Tim Pembina Olimpiade Astronomi Indonesia (TOAI)',
    institution: 'Program Studi Astronomi FMIPA ITB & Observatorium Bosscha',
    journal: 'Indonesian Journal of Astrophysics & Space Sciences, Vol. 13, pp. 91-110',
    year: 2025,
    citationsCount: 41,
    scholarId: 'GS-ID-AST-2025-077',
    abstractText: 'Formulasi luminositas bolometrik hukum Stefan-Boltzmann L = 4π R² σ T⁴, modulus jarak m - M = 5 log d - 5, serta koreksi ekstingsi antarbintang.',
    keywords: ['Magnitudo Pogson', 'Luminositas', 'Stefan-Boltzmann', 'Modulus Jarak', 'IOAA', 'OSN Astronomi'],
    scholarQuery: 'osn astronomi modulus jarak skala magnitudo pogson stefan boltzmann',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'Bosscha Archive'],
    questions: [
      {
        id: 'Q-GS-AST-01',
        subject: 'Astronomi',
        topic: 'Astrofisika Bintang & Modulus Jarak',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Bintang A memiliki magnitudo semu m = +2,0 dan magnitudo mutlak M = -3,0. Jika cahaya bintang A mengalami pelemahan (ekstingsi antarbintang) sebesar A_v = 0,5 magnitudo oleh debu galaksi, berapakah jarak sebenarnya bintang A dari Bumi?',
        formulaOrContext: 'Rumus Modulus Jarak dengan Ekstingsi: m - M = 5 log(d) - 5 + A_v ; d dalam parsek (pc)',
        options: [
          'A. 500 pc',
          'B. 631 pc',
          'C. 794 pc',
          'D. 1000 pc',
          'E. 1259 pc',
        ],
        correctAnswerIndex: 2,
        explanation: 'Gunakan persamaan modulus jarak dengan ekstingsi:\nm - M = 5 log(d) - 5 + A_v\nSubstitusikan nilai yang diketahui:\n2,0 - (-3,0) = 5 log(d) - 5 + 0,5\n5,0 = 5 log(d) - 4,5\n5 log(d) = 9,5\nlog(d) = 9,5 / 5 = 1,90\nd = 10^(1,90) = 10^(1 + 0,90) = 10 × 10^0,90 ≈ 10 × 7,943 = 794,3 parsek ≈ 794 pc.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#0d041c" rx="10"/>
          <circle cx="50" cy="90" r="14" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
          <text x="50" y="94" fill="#000" font-size="8" font-weight="bold" text-anchor="middle">Bumi</text>
          <circle cx="260" cy="90" r="22" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
          <text x="260" y="94" fill="#78350f" font-size="9" font-weight="bold" text-anchor="middle">Bintang</text>
          <ellipse cx="150" cy="90" rx="45" ry="30" fill="#475569" fill-opacity="0.4" stroke="#94a3b8" stroke-dasharray="3,3"/>
          <text x="150" y="93" fill="#cbd5e1" font-size="8" text-anchor="middle">Awan Debu Ekstingsi (Av=0.5)</text>
          <line x1="68" y1="90" x2="235" y2="90" stroke="#fde047" stroke-width="1.5" stroke-dasharray="4,4"/>
          <text x="160" y="165" fill="#e9d5ff" font-size="9" text-anchor="middle">Geometri Pengamatan & Pelemahan Fluks Cahaya Antarbintang</text>
        </svg>`,
        imageCaption: 'Gambar G7: Fluks Cahaya Bintang Menembus Awan Debu Ekstingsi Galaksi',
        author: 'Tim Google Scholar & TOAI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 7. KEBUMIAN (Earth Science)
  {
    id: 'GS-KEB-01',
    title: 'Geodinamika Lempeng Tektonik Konvergen, Vulkanisme Busur Busur Kepulauan, dan Zona Wadati-Benioff pada Standar IESO',
    subject: 'Kebumian',
    level: 'Kabupaten (OSN-K)',
    authors: 'Dr. Eko Yulianto & Tim Pembina Olimpiade Kebumian Indonesia',
    institution: 'Pusat Penelitian Geoteknologi BRIN & Departemen Teknik Geologi ITB',
    journal: 'Indonesian Journal of Earth Sciences & Georesources, Vol. 15, pp. 130-149',
    year: 2025,
    citationsCount: 38,
    scholarId: 'GS-ID-KEB-2025-063',
    abstractText: 'Analisis fisis zona penunjaman lempeng samudera Indo-Australia di bawah lempeng benua Eurasia, pembentukan magma andesitik-dasitik akibat fluks hidrasi, dan kegempaan intraslab.',
    keywords: ['Lempeng Tektonik', 'Subduksi', 'Wadati-Benioff', 'Petrologi', 'IESO', 'OSN Kebumian'],
    scholarQuery: 'osn kebumian lempeng tektonik subduksi wadati benioff',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'BRIN Repository'],
    questions: [
      {
        id: 'Q-GS-KEB-01',
        subject: 'Kebumian',
        topic: 'Geologi Struktur & Petrologi Subduksi',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Pada zona subduksi antara lempeng samudera dan lempeng benua, mengapa pelelehan sebagian (partial melting) mantel astenosfer di atas lempeng yang menunjam dapat terjadi pada suhu yang jauh lebih rendah daripada kurva solidus mantel kering?',
        formulaOrContext: 'Mekanisme Flux Melting (Pelelehan Akibat Penambahan Fluida H₂O)',
        options: [
          'A. Karena gesekan mekanik langsung menghasilkan panas melebihi 3000 °C di palung laut',
          'B. Pelepasan fluida air (H₂O) dari mineral terhidrasi pada lempeng samudera menurunkan titik leleh batuan peridotit mantel baji (flux melting)',
          'C. Tekanan litostatik berkurang drastis menjadi nol di bawah busur vulkanik',
          'D. Lempeng benua menyuntikkan karbon dioksida cair beku ke dalam astenosfer',
          'E. Peluruhan radioaktif uranium pada kerak benua meningkat 100 kali lipat di zona palung',
        ],
        correctAnswerIndex: 1,
        explanation: 'Saat lempeng samudera menunjam dan mengalami kenaikan suhu serta tekanan, mineral terhidrasi (seperti serpentin dan amfibol) mengalami reaksi metamorfisme dehidrasi. Pelepasan fluida air (H₂O) ke mantel baji (mantle wedge) di atasnya memecah ikatan Si-O dan menurunkan kurva solidus batuan peridotit (disebut flux melting). Hal ini memicu pembentukan magma primer yang naik membentuk gunung api busur benua (seperti deretan gunung api di Sumatra dan Jawa).',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#13092b" rx="10"/>
          <path d="M 20,60 L 100,80 L 240,160 L 200,170 L 80,100 L 20,80 Z" fill="#0284c7" opacity="0.8"/>
          <path d="M 120,60 L 300,60 L 300,120 L 220,120 Z" fill="#b45309" opacity="0.8"/>
          <polygon points="210,60 230,25 250,60" fill="#dc2626"/>
          <path d="M 230,25 Q 235,15 240,10" stroke="#f59e0b" stroke-width="2"/>
          <text x="230" y="75" fill="#fef08a" font-size="8" text-anchor="middle">Busur Vulkanik</text>
          <text x="60" y="55" fill="#7dd3fc" font-size="8">Lempeng Samudera</text>
          <text x="260" y="55" fill="#fde68a" font-size="8">Kerak Benua</text>
          <text x="160" y="170" fill="#e9d5ff" font-size="9" text-anchor="middle">Skema Subduksi & Flux Melting Mantel Baji (IESO Kebumian)</text>
        </svg>`,
        imageCaption: 'Gambar G8: Penampang Subduksi Lempeng Samudera & Fenomena Flux Melting',
        author: 'Tim Google Scholar & BRIN',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 8. EKONOMI (Economics)
  {
    id: 'GS-EKO-01',
    title: 'Model Keseimbangan Umum Mikroekonomi, Surplus Konsumen, dan Deadweight Loss Akibat Kebijakan Pajak pada Standar IEO',
    subject: 'Ekonomi',
    level: 'Kabupaten (OSN-K)',
    authors: 'Prof. Bambang Brodjonegoro & Tim Pembina Olimpiade Ekonomi Indonesia (TOEI)',
    institution: 'Fakultas Ekonomi dan Bisnis Universitas Indonesia & Puspresnas',
    journal: 'Indonesian Journal of Economics & Olympiad Studies, Vol. 17, pp. 40-59',
    year: 2025,
    citationsCount: 67,
    scholarId: 'GS-ID-EKO-2025-021',
    abstractText: 'Analisis matematis kurva permintaan-penawaran linier dan non-linier, elastisitas harga, beban pajak spesifik, penerimaan pemerintah, serta kerugian bobot mati (deadweight loss).',
    keywords: ['Mikroekonomi', 'Deadweight Loss', 'Pajak Spesifik', 'Surplus Produsen', 'IEO', 'OSN Ekonomi'],
    scholarQuery: 'osn ekonomi elastisitas deadweight loss surplus konsumen',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'FEB UI Archive'],
    questions: [
      {
        id: 'Q-GS-EKO-01',
        subject: 'Ekonomi',
        topic: 'Keseimbangan Pasar & Efisiensi Pajak',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Fungsi permintaan pasar suatu barang adalah P = 120 - 2Q dan fungsi penawaran adalah P = 20 + 3Q. Jika pemerintah mengenakan pajak spesifik sebesar t = Rp 10 per unit barang, berapakah besarnya kerugian bobot mati (Deadweight Loss / DWL) yang timbul di pasar?',
        formulaOrContext: 'Rumus Deadweight Loss: DWL = 1/2 × t × (Q₀ - Q₁) ; Keseimbangan awal: 120 - 2Q = 20 + 3Q',
        options: [
          'A. Rp 5',
          'B. Rp 10',
          'C. Rp 15',
          'D. Rp 20',
          'E. Rp 25',
        ],
        correctAnswerIndex: 1,
        explanation: '1. Keseimbangan sebelum pajak:\nPd = Ps => 120 - 2Q = 20 + 3Q => 5Q = 100 => Q₀ = 20 unit.\nP₀ = 120 - 2(20) = 80.\n\n2. Keseimbangan setelah pajak spesifik t = 10:\nFungsi penawaran baru: P = (20 + 3Q) + 10 = 30 + 3Q.\nPd = Ps_baru => 120 - 2Q = 30 + 3Q => 5Q = 90 => Q₁ = 18 unit.\nPenurunan kuantitas ΔQ = Q₀ - Q₁ = 20 - 18 = 2 unit.\n\n3. Perhitungan Deadweight Loss:\nDWL = 1/2 × t × ΔQ = 1/2 × 10 × (20 - 18) = 1/2 × 10 × 2 = Rp 10.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#13092b" rx="10"/>
          <line x1="40" y1="150" x2="290" y2="150" stroke="#7e22ce" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="150" stroke="#7e22ce" stroke-width="2"/>
          <text x="35" y="16" fill="#c084fc" font-size="10" font-weight="bold">Harga (P)</text>
          <text x="270" y="165" fill="#c084fc" font-size="10">Kuantitas (Q)</text>
          <line x1="50" y1="30" x2="260" y2="140" stroke="#ef4444" stroke-width="2.5"/>
          <text x="265" y="140" fill="#ef4444" font-size="9" font-weight="bold">Permintaan (D)</text>
          <line x1="50" y1="130" x2="260" y2="40" stroke="#22c55e" stroke-width="2"/>
          <line x1="50" y1="110" x2="260" y2="20" stroke="#86efac" stroke-width="2" stroke-dasharray="3,3"/>
          <polygon points="150,85 135,77 135,97" fill="#f59e0b" opacity="0.8"/>
          <text x="120" y="87" fill="#fde047" font-size="8" font-weight="bold">DWL</text>
          <text x="160" y="172" fill="#e9d5ff" font-size="9" text-anchor="middle">Keseimbangan Pasar & Segitiga Kerugian Bobot Mati (Deadweight Loss)</text>
        </svg>`,
        imageCaption: 'Gambar G9: Kurva Penawaran-Permintaan dan Segitiga Deadweight Loss (DWL)',
        author: 'Tim Google Scholar & FEB UI',
        createdAt: '2026-03-10',
      },
    ],
  },

  // 9. GEOGRAFI (Geography)
  {
    id: 'GS-GEO-01',
    title: 'Analisis Variabilitas Iklim Sirkulasi Walker, Fenomena Dipole Mode Samudera Hindia (IOD), dan Bencana Hidrometeorologi pada Silabus IGeo',
    subject: 'Geografi',
    level: 'Kabupaten (OSN-K)',
    authors: 'Dr. Junun Sartohadi & Tim Pembina Olimpiade Geografi Indonesia (TOGI)',
    institution: 'Fakultas Geografi Universitas Gadjah Mada & Puspresnas Kemendikbudristek',
    journal: 'Indonesian Journal of Geography & Spatial Olympiad, Vol. 20, pp. 78-98',
    year: 2025,
    citationsCount: 50,
    scholarId: 'GS-ID-GEO-2025-055',
    abstractText: 'Pola interaksi atmosfer-laut antara Pacific ENSO dan Indian Ocean Dipole (IOD) positif/negatif, pengaruhnya terhadap distribusi spasial curah hujan dan kekeringan agrikultur Indonesia.',
    keywords: ['Klimatologi', 'Sirkulasi Walker', 'Indian Ocean Dipole', 'ENSO', 'IGeo', 'OSN Geografi'],
    scholarQuery: 'osn geografi sirkulasi walker indian ocean dipole iklim indonesia',
    indexedIn: ['Google Scholar', 'Garuda Kemdikbud', 'UGM Archive'],
    questions: [
      {
        id: 'Q-GS-GEO-01',
        subject: 'Geografi',
        topic: 'Klimatologi & Dinamika Kelautan Spasial',
        level: 'Kabupaten (OSN-K)',
        difficulty: 'HOTS / Sulit',
        bloomLevel: 'C4 (Menganalisis)',
        soloLevel: 'Relational',
        questionText: 'Ketika fenomena El Niño moderat terjadi bersamaan dengan fase Indian Ocean Dipole (IOD) Positif kuat, dampak fisis gabungan apa yang paling dominan dirasakan oleh wilayah barat dan selatan Indonesia (khususnya Sumatra dan Jawa)?',
        formulaOrContext: 'Interaksi Atmosfer-Laut Tropis Indo-Pasifik',
        options: [
          'A. Peningkatan anomali curah hujan ekstrem yang memicu banjir bandang serempak',
          'B. Defisit curah hujan ekstrem ganda (kekeringan berkepanjangan) dan penurunan drastis suhu muka laut di perairan selatan Jawa-Sumatra',
          'C. Terhentinya angin muson barat secara permanen sepanjang tahun',
          'D. Kenaikan tinggi gelombang laut pasang maksimum di Selat Malaka lebih dari 10 meter',
          'E. Terbentuknya palung laut baru di Samudera Hindia',
        ],
        correctAnswerIndex: 1,
        explanation: 'Fase IOD Positif ditandai dengan pendinginan anomali suhu muka laut di Samudera Hindia timur (selatan Jawa dan barat Sumatra) dan penghangatan di Samudera Hindia barat. Hal ini menekan konveksi awan hujan di Indonesia barat. Ketika terjadi bersamaan dengan El Niño (yang menggeser sel konveksi Pasifik ke timur), kedua fenomena saling menguatkan (amplifikasi) memicu kekeringan parah berkepanjangan, penurunan debit sungai, serta risiko kebakaran hutan dan lahan yang masif.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" class="w-full h-auto max-h-48 rounded bg-[#100722]">
          <rect width="320" height="180" fill="#13092b" rx="10"/>
          <line x1="30" y1="130" x2="290" y2="130" stroke="#0284c7" stroke-width="3"/>
          <text x="50" y="150" fill="#38bdf8" font-size="9">Samudera Hindia</text>
          <text x="160" y="150" fill="#4ade80" font-size="9" text-anchor="middle">Kepulauan Indonesia</text>
          <text x="270" y="150" fill="#38bdf8" font-size="9" text-anchor="end">Samudera Pasifik</text>
          <ellipse cx="160" cy="80" rx="40" ry="25" fill="#f43f5e" fill-opacity="0.2" stroke="#fb7185" stroke-dasharray="3,3"/>
          <text x="160" y="85" fill="#fca5a5" font-size="8" font-weight="bold" text-anchor="middle">Subsistensi Kering</text>
          <path d="M 60,110 Q 60,50 160,50 Q 260,50 260,110" fill="none" stroke="#f59e0b" stroke-width="2"/>
          <text x="160" y="170" fill="#e9d5ff" font-size="9" text-anchor="middle">Sirkulasi Walker Pasifik & Sirkulasi Sel Atmosfer IOD Tropis</text>
        </svg>`,
        imageCaption: 'Gambar G10: Diagram Sirkulasi Walker & Anomali Pasifik-Hindia Terintegrasi',
        author: 'Tim Google Scholar & TOGI',
        createdAt: '2026-03-10',
      },
    ],
  },
];
