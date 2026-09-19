/**
 * Intermediate Math — Bab 1: Bilangan Bulat, the chapter's closing sequence
 * (Sept 2026). Targhib's structure for every bab:
 *
 *   Sesi → Classic quiz (repeat) → 2 practices → 2 try-outs (standar + pengayaan) → 1 exam
 *
 * The per-sesi Classic quizzes already exist (scripts/content/math-bab1.ts).
 * These five are chapter-level (no lesson) and are shown after the last sesi in
 * the order they're created, so scripts/setup-math-bab1-chapter.ts creates them
 * in this array's order.
 *
 * Practice for Bab 1 = MASTERY + DRILL. REVIEW draws from *earlier* babs, and
 * Bab 1 has none; from Bab 2 on it becomes an option.
 *
 * Every numeric answer here was recomputed in Python before being written down.
 * Prompts are plain text (Unicode maths); written answers follow
 * docs/question-authoring.md.
 */
import type { QuizStyle } from "../../src/generated/prisma/enums";

type Letter = "A" | "B" | "C" | "D";
export type ChapterQuestion =
  | { type: "MULTIPLE_CHOICE"; prompt: string; points: number; options: string[]; answer: Letter; explanation: string }
  | { type: "MULTI_SELECT"; prompt: string; points: number; options: string[]; answer: Letter[]; explanation: string }
  | { type: "NUMERIC"; prompt: string; points: number; answer: number; explanation: string }
  | { type: "STEPS"; prompt: string; points: number; steps: { prompt: string; answer: string }[]; explanation: string }
  | { type: "MULTI_PART"; prompt: string; points: number; parts: { prompt: string; marks: number; answer: string }[]; explanation: string }
  | { type: "FIND_MISTAKE"; prompt: string; points: number; lines: string[]; wrongIndex: number; correction: string; explanation: string };

export type ChapterQuiz = {
  title: string;
  style: QuizStyle;
  settings?: {
    timeLimitMinutes?: number;
    maxAttempts?: number;
    randomizeQuestionOrder?: boolean;
    drillSkill?: string;
    drillSeconds?: number;
    drillTarget?: number;
  };
  questions: ChapterQuestion[];
};

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";

export const CHAPTER_QUIZZES: ChapterQuiz[] = [
  // ─────────────────────────── Practice 1: Mastery ───────────────────────────
  {
    title: "Latihan Penguasaan — Bab 1: Bilangan Bulat",
    style: "MASTERY",
    questions: [
      {
        type: "MULTIPLE_CHOICE", points: 1,
        prompt: "[Sesi 1] Urutan bilangan −7, 3, 0, −12, 5 dari yang terkecil adalah…",
        options: ["−12, −7, 0, 3, 5", "−7, −12, 0, 3, 5", "0, −7, −12, 3, 5", "5, 3, 0, −7, −12"],
        answer: "A",
        explanation: "Di antara bilangan negatif, yang jaraknya ke nol paling jauh adalah yang terkecil: −12 lalu −7. Setelah itu 0, lalu bilangan positif.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: `[Sesi 1] Berapakah bilangan bulat terbesar yang lebih kecil dari −4? ${NEG}`,
        answer: -5,
        explanation: "Bilangan bulat yang lebih kecil dari −4 ada di kiri −4 pada garis bilangan: −5, −6, −7, … Yang paling dekat (terbesar) adalah −5.",
      },
      {
        type: "MULTI_SELECT", points: 1,
        prompt: "[Sesi 1] Pilih SEMUA pernyataan yang benar.",
        options: ["−3 > −8", "0 adalah bilangan asli", "Setiap bilangan cacah adalah bilangan bulat", "−1 lebih besar dari 0"],
        answer: ["A", "C"],
        explanation: "−3 lebih dekat ke nol, jadi lebih besar dari −8. Bilangan asli dimulai dari 1, jadi 0 bukan bilangan asli. Bilangan negatif selalu lebih kecil dari 0.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: `[Sesi 2] Hitung: −14 + 9. ${NEG}`,
        answer: -5,
        explanation: "Tanda berbeda: 14 − 9 = 5, lalu pakai tanda bilangan yang jaraknya lebih besar (−14). Hasilnya −5.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: "[Sesi 2] Hitung: 6 − (−13)",
        answer: 19,
        explanation: "Mengurangi −13 sama dengan menambah lawannya: 6 + 13 = 19.",
      },
      {
        type: "FIND_MISTAKE", points: 1,
        prompt: "[Sesi 2] Dimas menghitung −8 − (−3) + 5. Di baris mana ia pertama kali salah?",
        lines: ["−8 − (−3) + 5", "= −8 − 3 + 5", "= −11 + 5", "= −6"],
        wrongIndex: 1,
        correction: "",
        explanation: "Mengurangi −3 berarti menambah 3, jadi baris kedua seharusnya −8 + 3 + 5. Hasil yang benar adalah 0.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: `[Sesi 2] Suhu mula-mula −6 °C, lalu naik 11 derajat, lalu turun 8 derajat. Berapa suhu akhirnya (dalam °C)? ${NEG}`,
        answer: -3,
        explanation: "−6 + 11 + (−8) = 5 + (−8) = −3.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: "[Sesi 3] Hitung: (−9) × (−7)",
        answer: 63,
        explanation: "Tanda sama menghasilkan positif. 9 × 7 = 63.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: `[Sesi 3] Hitung: −72 : 8. ${NEG}`,
        answer: -9,
        explanation: "Tanda berbeda menghasilkan negatif. 72 : 8 = 9, jadi hasilnya −9. Cek: 8 × (−9) = −72.",
      },
      {
        type: "STEPS", points: 1,
        prompt: `[Sesi 3] Hitung −5 + 4 × (−3) − (−18) : 6 langkah demi langkah. ${NEG}`,
        steps: [
          { prompt: "4 × (−3) = …", answer: "-12" },
          { prompt: "(−18) : 6 = …", answer: "-3" },
          { prompt: "−5 + (−12) = …", answer: "-17" },
          { prompt: "Hasil akhir: −17 − (−3) = …", answer: "-14" },
        ],
        explanation: "Kali dan bagi dikerjakan lebih dulu, baru tambah dan kurang. Mengurangi −3 sama dengan menambah 3: −17 + 3 = −14.",
      },
      {
        type: "MULTI_SELECT", points: 1,
        prompt: "[Sesi 4] Pilih SEMUA bilangan prima.",
        options: ["39", "41", "49", "53"],
        answer: ["B", "D"],
        explanation: "39 = 3 × 13 dan 49 = 7 × 7 adalah bilangan komposit. 41 dan 53 hanya punya faktor 1 dan dirinya sendiri.",
      },
      {
        type: "MULTIPLE_CHOICE", points: 1,
        prompt: "[Sesi 4] Faktorisasi prima dari 90 adalah…",
        options: ["2² × 3 × 5", "9 × 10", "2 × 3² × 5", "3 × 30"],
        answer: "C",
        explanation: "90 = 2 × 45 = 2 × 3 × 15 = 2 × 3 × 3 × 5 = 2 × 3² × 5. Pilihan 9 × 10 dan 3 × 30 bukan faktorisasi prima karena 9, 10, dan 30 bukan prima.",
      },
      {
        type: "NUMERIC", points: 1,
        prompt: "[Sesi 4] Ada berapa banyak faktor positif dari 24?",
        answer: 8,
        explanation: "Pasangan faktornya: 1 × 24, 2 × 12, 3 × 8, 4 × 6. Jadi faktornya 1, 2, 3, 4, 6, 8, 12, 24 (8 buah).",
      },
      {
        type: "STEPS", points: 1,
        prompt: "[Sesi 5] Tentukan FPB dan KPK dari 42 dan 70 langkah demi langkah.",
        steps: [
          { prompt: "FPB(42, 70) = …", answer: "14" },
          { prompt: "42 : FPB = …", answer: "3" },
          { prompt: "70 : FPB = …", answer: "5" },
          { prompt: "KPK = FPB × 3 × 5 = …", answer: "210" },
        ],
        explanation: "42 = 2 × 3 × 7 dan 70 = 2 × 5 × 7, jadi FPB = 2 × 7 = 14. KPK = 14 × 3 × 5 = 210. Cek: FPB × KPK = 14 × 210 = 2940 = 42 × 70.",
      },
      {
        type: "MULTI_PART", points: 1,
        prompt: "[Sesi 5] Bus A lewat di halte setiap 12 menit dan bus B setiap 18 menit. Keduanya lewat bersamaan pukul 07.00.",
        parts: [
          { prompt: "Setelah berapa menit keduanya lewat bersamaan lagi?", marks: 1, answer: "36" },
          { prompt: "Berapa kali keduanya lewat bersamaan setelah pukul 07.00 sampai pukul 10.00 (pukul 10.00 ikut dihitung)?", marks: 1, answer: "5" },
        ],
        explanation: "KPK(12, 18) = 36 menit. Dari 07.00 sampai 10.00 ada 180 menit, dan 180 : 36 = 5: pukul 07.36, 08.12, 08.48, 09.24, dan 10.00.",
      },
    ],
  },

  // ─────────────────────────── Practice 2: Drill ───────────────────────────
  {
    title: "Drill Kilat — Operasi Bilangan Bulat",
    style: "DRILL",
    settings: { drillSkill: "integer-operations", drillSeconds: 60, drillTarget: 12 },
    questions: [],
  },

  // ─────────────────────────── Try-out standar ───────────────────────────
  {
    title: "Try Out Standar — Bab 1: Bilangan Bulat",
    style: "TRYOUT",
    settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
    questions: [
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Urutan bilangan −3, 8, −10, 0, 4 dari yang terbesar adalah…", options: ["8, 4, 0, −10, −3", "8, 4, 0, −3, −10", "−10, −3, 0, 4, 8", "8, 4, −3, −10, 0"], answer: "B", explanation: "Dari terbesar: bilangan positif (8, 4), lalu 0, lalu negatif dari yang paling dekat ke nol (−3, −10)." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pernyataan yang benar adalah…", options: ["−15 > −9", "0 < −2", "−4 < −1", "−20 > 1"], answer: "C", explanation: "−4 terletak di kiri −1 pada garis bilangan, jadi −4 < −1." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Banyaknya bilangan bulat yang lebih besar dari −3 dan lebih kecil dari 2 adalah…", options: ["3", "4", "5", "6"], answer: "B", explanation: "Bilangannya −2, −1, 0, 1. Batasnya (−3 dan 2) tidak ikut." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −17 + 25 − (−6) adalah…", options: ["2", "−2", "14", "48"], answer: "C", explanation: "−17 + 25 = 8, lalu 8 − (−6) = 8 + 6 = 14." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −9 − 14 + 20 adalah…", options: ["−3", "3", "−43", "25"], answer: "A", explanation: "−9 − 14 = −23, lalu −23 + 20 = −3." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari (−8) × 6 : (−4) adalah…", options: ["−12", "12", "−3", "3"], answer: "B", explanation: "Dari kiri: (−8) × 6 = −48, lalu −48 : (−4) = 12." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 36 : (−9) × (−5) adalah…", options: ["20", "−20", "4", "−4"], answer: "A", explanation: "Kali dan bagi dari kiri: 36 : (−9) = −4, lalu −4 × (−5) = 20." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −4 + 6 × (−3) − (−10) adalah…", options: ["4", "−32", "12", "−12"], answer: "D", explanation: "Kali dulu: 6 × (−3) = −18. Lalu −4 + (−18) + 10 = −12." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Kesamaan (−7) + 12 = 12 + (−7) menunjukkan sifat…", options: ["asosiatif penjumlahan", "komutatif penjumlahan", "komutatif perkalian", "tertutup perkalian"], answer: "B", explanation: "Menukar urutan dua bilangan yang dijumlahkan tanpa mengubah hasil adalah sifat komutatif penjumlahan." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pernyataan yang SALAH untuk semua bilangan bulat a dan b adalah…", options: ["a + b = b + a", "a − b = b − a", "a × b = b × a", "a × 0 = 0"], answer: "B", explanation: "Pengurangan tidak komutatif. Contoh: 3 − 8 = −5, tetapi 8 − 3 = 5." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Faktorisasi prima dari 120 adalah…", options: ["2² × 3 × 10", "2 × 3 × 4 × 5", "2³ × 3 × 5", "2³ × 15"], answer: "C", explanation: "120 = 2 × 2 × 2 × 3 × 5 = 2³ × 3 × 5. Pilihan lain memuat 10, 4, atau 15 yang bukan bilangan prima." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Di antara bilangan berikut, yang merupakan bilangan prima adalah…", options: ["51", "57", "59", "63"], answer: "C", explanation: "51 = 3 × 17, 57 = 3 × 19, 63 = 7 × 9. Hanya 59 yang tidak punya faktor selain 1 dan dirinya sendiri." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "FPB dari 48 dan 72 adalah…", options: ["12", "24", "144", "6"], answer: "B", explanation: "48 = 2⁴ × 3 dan 72 = 2³ × 3². FPB = 2³ × 3 = 24." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "KPK dari 15 dan 20 adalah…", options: ["5", "30", "60", "300"], answer: "C", explanation: "15 = 3 × 5 dan 20 = 2² × 5. KPK = 2² × 3 × 5 = 60." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pasangan bilangan berikut yang BUKAN pasangan faktor dari −12 adalah…", options: ["(3, −4)", "(−2, 6)", "(−3, −4)", "(1, −12)"], answer: "C", explanation: "(−3) × (−4) = 12, bukan −12. Pasangan faktor −12 harus berbeda tanda." },
      { type: "NUMERIC", points: 5.5, prompt: `Hitung: (−25) + 40 − (−15) − 60. ${NEG}`, answer: -30, explanation: "−25 + 40 = 15, lalu 15 + 15 = 30, lalu 30 − 60 = −30." },
      { type: "NUMERIC", points: 5.5, prompt: "Hitung: (−6) × (−8) − 56 : (−7)", answer: 56, explanation: "(−6) × (−8) = 48 dan 56 : (−7) = −8. Jadi 48 − (−8) = 56." },
      { type: "NUMERIC", points: 5.5, prompt: `Seorang penyelam berada 18 m di bawah permukaan laut. Ia naik 7 m, lalu turun 12 m. Tentukan posisi akhirnya dalam meter (di bawah permukaan laut ditulis negatif). ${NEG}`, answer: -23, explanation: "−18 + 7 + (−12) = −23, yaitu 23 m di bawah permukaan laut." },
      { type: "NUMERIC", points: 5.5, prompt: "Suhu siang hari 9 °C dan suhu malam hari −7 °C. Berapa derajat selisih kedua suhu itu?", answer: 16, explanation: "9 − (−7) = 9 + 7 = 16 derajat." },
      { type: "NUMERIC", points: 5.5, prompt: "Pada sebuah tes berisi 30 soal, jawaban benar bernilai +4, salah −2, dan tidak dijawab 0. Rina menjawab 21 soal dengan benar dan 6 soal salah. Berapa nilai Rina?", answer: 72, explanation: "21 × 4 + 6 × (−2) + 3 × 0 = 84 − 12 = 72." },
      { type: "NUMERIC", points: 5.5, prompt: "Ada berapa banyak faktor positif dari 36?", answer: 9, explanation: "1, 2, 3, 4, 6, 9, 12, 18, 36. Jumlahnya ganjil karena 6 × 6 hanya menyumbang satu faktor." },
      { type: "NUMERIC", points: 5.5, prompt: "Tentukan FPB dari 84 dan 126.", answer: 42, explanation: "84 = 2² × 3 × 7 dan 126 = 2 × 3² × 7. FPB = 2 × 3 × 7 = 42." },
      { type: "NUMERIC", points: 5.5, prompt: "72 permen dan 96 cokelat akan dibagikan sama rata kepada sebanyak mungkin anak, tanpa sisa. Berapa anak yang bisa menerima?", answer: 24, explanation: "Membagi rata sebanyak mungkin berarti FPB(72, 96) = 24. Setiap anak mendapat 3 permen dan 4 cokelat." },
      { type: "NUMERIC", points: 5.5, prompt: "Tiga lampu berkedip setiap 6, 8, dan 10 detik. Ketiganya baru saja berkedip bersamaan. Setelah berapa detik ketiganya berkedip bersamaan lagi?", answer: 120, explanation: "Kejadian berulang yang bertemu lagi berarti KPK(6, 8, 10) = 2³ × 3 × 5 = 120 detik." },
      { type: "NUMERIC", points: 5.5, prompt: `Saldo kas kelas mula-mula Rp40.000. Kelas membeli perlengkapan 3 kali, masing-masing Rp25.000, lalu 5 siswa membayar iuran masing-masing Rp12.000. Berapa saldo akhirnya, dalam RIBU rupiah? ${NEG}`, answer: 25, explanation: "Dalam ribu: 40 + 3 × (−25) + 5 × 12 = 40 − 75 + 60 = 25, yaitu Rp25.000." },
    ],
  },

  // ─────────────────────────── Try-out pengayaan ───────────────────────────
  {
    title: "Try Out Pengayaan — Bab 1: Bilangan Bulat",
    style: "TRYOUT",
    settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
    questions: [
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari (−2)⁵ adalah…", options: ["32", "−32", "−10", "10"], answer: "B", explanation: "Lima faktor negatif (ganjil) menghasilkan negatif. 2⁵ = 32, jadi (−2)⁵ = −32." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari −3⁴ (tanpa kurung) adalah…", options: ["−81", "81", "−12", "12"], answer: "A", explanation: "Tanpa kurung, basisnya 3: −(3⁴) = −81. Yang bernilai 81 adalah (−3)⁴." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari 5⁰ + 0⁵ + 1⁵ adalah…", options: ["0", "1", "2", "6"], answer: "C", explanation: "5⁰ = 1, 0⁵ = 0, dan 1⁵ = 1. Jumlahnya 2." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari (−1)²⁰²⁵ + (−1)²⁰²⁶ adalah…", options: ["−2", "0", "2", "1"], answer: "B", explanation: "Pangkat ganjil memberi −1 dan pangkat genap memberi 1. −1 + 1 = 0." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Bentuk 2³ × 2² sama dengan…", options: ["2⁵", "2⁶", "4⁵", "4⁶"], answer: "A", explanation: "2³ × 2² = (2 × 2 × 2) × (2 × 2), yaitu lima faktor 2, jadi 2⁵ = 32." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Angka satuan (angka terakhir) dari 7¹⁰⁰ adalah…", options: ["7", "9", "3", "1"], answer: "D", explanation: "Angka satuan 7¹, 7², 7³, 7⁴ adalah 7, 9, 3, 1, berulang setiap 4. 100 habis dibagi 4, jadi sama dengan 7⁴: angka satuannya 1." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hari ini hari Kamis. Hari apakah 45 hari lagi?", options: ["Sabtu", "Minggu", "Senin", "Rabu"], answer: "B", explanation: "45 = 7 × 6 + 3. Enam minggu penuh kembali ke Kamis, lalu maju 3 hari: Minggu." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil bagi dan sisa jika 125 dibagi 9 adalah…", options: ["13 sisa 7", "14 sisa 1", "13 sisa 8", "12 sisa 17"], answer: "C", explanation: "9 × 13 = 117 dan 125 − 117 = 8. Sisa harus lebih kecil dari 9, jadi \"12 sisa 17\" tidak mungkin." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran dari kode Python  print(-17 // 5, -17 % 5) ?", options: ["-3 -2", "-4 3", "-3 2", "-4 -3"], answer: "B", explanation: "Python membulatkan // ke bawah: −17 // 5 = −4, dan −17 = 5 × (−4) + 3, jadi sisanya 3." },
      { type: "MULTIPLE_CHOICE", points: 4, prompt: "Bilangan bulat n yang memenuhi n² = 49 adalah…", options: ["hanya 7", "hanya −7", "7 dan −7", "tidak ada"], answer: "C", explanation: "7 × 7 = 49 dan (−7) × (−7) = 49. Keduanya memenuhi." },
      { type: "NUMERIC", points: 6, prompt: "Hitung: 2 × 3² − (−2)³ + 4⁰", answer: 27, explanation: "Pangkat dulu: 3² = 9, (−2)³ = −8, 4⁰ = 1. Lalu 18 − (−8) + 1 = 27." },
      { type: "NUMERIC", points: 6, prompt: `Hitung: (−3)³ − (−2)⁴. ${NEG}`, answer: -43, explanation: "(−3)³ = −27 dan (−2)⁴ = 16. −27 − 16 = −43." },
      { type: "NUMERIC", points: 6, prompt: "Berapakah angka satuan dari 3²⁰²⁶?", answer: 9, explanation: "Angka satuan 3¹, 3², 3³, 3⁴ adalah 3, 9, 7, 1, berulang setiap 4. 2026 = 4 × 506 + 2, jadi sama dengan 3²: angka satuannya 9." },
      { type: "NUMERIC", points: 6, prompt: "Sekelompok bakteri membelah menjadi dua setiap 15 menit. Mula-mula ada 3 bakteri. Berapa banyak bakteri setelah 2 jam?", answer: 768, explanation: "2 jam = 120 menit = 8 kali membelah. 3 × 2⁸ = 3 × 256 = 768." },
      { type: "NUMERIC", points: 6, prompt: "Sebuah bilangan jika dibagi 7 menghasilkan hasil bagi 12 dan sisa 3. Bilangan berapakah itu?", answer: 87, explanation: "a = b × q + r = 7 × 12 + 3 = 87." },
      { type: "NUMERIC", points: 6, prompt: "Berapakah sisa pembagian 2¹⁰ oleh 7?", answer: 2, explanation: "2¹⁰ = 1024 = 7 × 146 + 2. Cara lain: sisa 2¹, 2², 2³ oleh 7 adalah 2, 4, 1, berulang setiap 3. 10 = 3 × 3 + 1, jadi sisanya sama dengan 2¹: 2." },
      { type: "NUMERIC", points: 6, prompt: "Berapakah bilangan bulat terbesar n yang memenuhi n² < 50?", answer: 7, explanation: "7² = 49 < 50, tetapi 8² = 64 > 50." },
      { type: "NUMERIC", points: 6, prompt: "Hitung KPK(12, 18, 30) − FPB(12, 18, 30).", answer: 174, explanation: "12 = 2² × 3, 18 = 2 × 3², 30 = 2 × 3 × 5. KPK = 2² × 3² × 5 = 180 dan FPB = 2 × 3 = 6. 180 − 6 = 174." },
      { type: "NUMERIC", points: 6, prompt: `Jumlah tiga bilangan bulat berurutan adalah −21. Berapakah bilangan yang terbesar? ${NEG}`, answer: -6, explanation: "Bilangan tengahnya −21 : 3 = −7, jadi ketiganya −8, −7, −6. Yang terbesar −6." },
      { type: "NUMERIC", points: 6, prompt: "Apa keluaran dari kode Python  print(2 ** 5 // 3 % 4) ?", answer: 2, explanation: "Pangkat dulu: 2 ** 5 = 32. Lalu // dan % dari kiri: 32 // 3 = 10, dan 10 % 4 = 2." },
    ],
  },

  // ─────────────────────────── Exam ───────────────────────────
  {
    title: "Ujian — Bab 1: Bilangan Bulat",
    style: "EXAM",
    settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: true },
    questions: [
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Suhu empat kota pada suatu pagi: P −14 °C, Q −4 °C, R 3 °C, S −9 °C. Urutan kota dari yang paling dingin adalah…", options: ["P, S, Q, R", "Q, S, P, R", "R, Q, S, P", "S, P, Q, R"], answer: "A", explanation: "Paling dingin = bilangan terkecil: −14 (P), −9 (S), −4 (Q), 3 (R)." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −(−7) + (−3) adalah…", options: ["4", "−4", "10", "−10"], answer: "A", explanation: "−(−7) adalah lawan dari −7, yaitu 7. Lalu 7 + (−3) = 4." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari (−5) × 4 × (−2) × (−1) adalah…", options: ["40", "−40", "−11", "11"], answer: "B", explanation: "Ada tiga faktor negatif (ganjil), jadi hasilnya negatif. 5 × 4 × 2 × 1 = 40, jadi −40." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari (−8) : 0 adalah…", options: ["0", "−8", "8", "tidak terdefinisi"], answer: "D", explanation: "Tidak ada bilangan yang jika dikali 0 menghasilkan −8, jadi pembagian dengan nol tidak terdefinisi." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Faktor dari 45 yang merupakan bilangan prima adalah…", options: ["1, 3, dan 5", "3 dan 5", "3, 5, dan 9", "5 saja"], answer: "B", explanation: "45 = 3² × 5. Faktor primanya 3 dan 5. Angka 1 dan 9 bukan bilangan prima." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "FPB dari 2³ × 3² × 5 dan 2² × 3³ × 7 adalah…", options: ["36", "180", "12", "7560"], answer: "A", explanation: "Ambil faktor prima yang sama dengan pangkat terkecil: 2² × 3² = 36." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Masalah berikut yang diselesaikan dengan KPK adalah…", options: ["membagi 30 buku dan 45 pensil ke sebanyak mungkin paket yang sama isinya", "memotong kain 120 cm dan 80 cm menjadi potongan sama panjang yang terpanjang", "menentukan kapan dua alarm yang berbunyi setiap 15 dan 20 menit berbunyi bersamaan lagi", "mencari ukuran ubin persegi terbesar untuk lantai 6 m × 4 m"], answer: "C", explanation: "Kejadian berulang yang bertemu lagi memakai KPK. Tiga pilihan lain adalah membagi atau memotong, yang memakai FPB." },
      { type: "MULTIPLE_CHOICE", points: 3, prompt: "Jika a dan b bilangan bulat negatif, pernyataan yang PASTI benar adalah…", options: ["a × b > 0", "a + b > 0", "a − b < 0", "a : b < 0"], answer: "A", explanation: "Negatif dikali negatif selalu positif. a + b selalu negatif, a − b bisa positif, nol, atau negatif, dan a : b tidak mungkin negatif." },
      { type: "NUMERIC", points: 4, prompt: "Hitung: (−36) : 4 − 5 × (−3)", answer: 6, explanation: "(−36) : 4 = −9 dan 5 × (−3) = −15. −9 − (−15) = −9 + 15 = 6." },
      { type: "NUMERIC", points: 4, prompt: `Hitung: −50 + 38 − (−27) + (−15). ${NEG}`, answer: 0, explanation: "−50 + 38 = −12, lalu −12 + 27 = 15, lalu 15 + (−15) = 0." },
      { type: "NUMERIC", points: 4, prompt: `Suhu freezer −20 °C. Saat listrik padam, suhunya naik 3 derajat setiap jam. Berapa suhunya setelah 5 jam (dalam °C)? ${NEG}`, answer: -5, explanation: "−20 + 5 × 3 = −20 + 15 = −5." },
      { type: "NUMERIC", points: 4, prompt: "Ada berapa banyak bilangan bulat x yang memenuhi −6 < x ≤ 4?", answer: 10, explanation: "x = −5, −4, −3, −2, −1, 0, 1, 2, 3, 4. −6 tidak ikut (tanda <), 4 ikut (tanda ≤)." },
      { type: "NUMERIC", points: 4, prompt: "Tentukan FPB dari 90 dan 150.", answer: 30, explanation: "90 = 2 × 3² × 5 dan 150 = 2 × 3 × 5². FPB = 2 × 3 × 5 = 30." },
      { type: "NUMERIC", points: 4, prompt: "Tentukan KPK dari 16, 24, dan 40.", answer: 240, explanation: "16 = 2⁴, 24 = 2³ × 3, 40 = 2³ × 5. KPK = 2⁴ × 3 × 5 = 240." },
      {
        type: "STEPS", points: 8,
        prompt: `Sebuah kapal selam berada di kedalaman 120 m di bawah permukaan laut (−120 m). Kapal naik 45 m, lalu turun dua kali, masing-masing 30 m. Kerjakan langkah demi langkah. ${NEG}`,
        steps: [
          { prompt: "Posisi setelah naik 45 m (m) = …", answer: "-75" },
          { prompt: "Perubahan posisi akibat turun dua kali 30 m, sebagai satu bilangan bulat = …", answer: "-60" },
          { prompt: "Posisi akhir (m) = …", answer: "-135" },
        ],
        explanation: "−120 + 45 = −75. Turun dua kali 30 m adalah 2 × (−30) = −60. −75 + (−60) = −135, yaitu 135 m di bawah permukaan laut.",
      },
      {
        type: "STEPS", points: 8,
        prompt: "Tentukan FPB dan KPK dari 36 dan 60 dengan faktorisasi prima. Kerjakan langkah demi langkah.",
        steps: [
          { prompt: "Pangkat bilangan 2 pada faktorisasi prima 36 = …", answer: "2" },
          { prompt: "Pangkat bilangan 3 pada faktorisasi prima 36 = …", answer: "2" },
          { prompt: "FPB(36, 60) = …", answer: "12" },
          { prompt: "KPK(36, 60) = …", answer: "180" },
        ],
        explanation: "36 = 2² × 3² dan 60 = 2² × 3 × 5. FPB = 2² × 3 = 12 (pangkat terkecil). KPK = 2² × 3² × 5 = 180 (semua prima, pangkat terbesar).",
      },
      {
        type: "MULTI_PART", points: 10,
        prompt: "Dalam lomba cerdas cermat berisi 25 soal, jawaban benar bernilai +5, salah −3, dan tidak dijawab −1. Tim A menjawab 16 soal dengan benar, 6 soal salah, dan 3 soal tidak dijawab. Tim B menjawab semua soal dan 18 di antaranya benar.",
        parts: [
          { prompt: "Skor tim A = …", marks: 4, answer: "59" },
          { prompt: "Skor tim B = …", marks: 3, answer: "69" },
          { prompt: "Selisih skor tim B dan tim A = …", marks: 3, answer: "10" },
        ],
        explanation: "Tim A: 16 × 5 + 6 × (−3) + 3 × (−1) = 80 − 18 − 3 = 59. Tim B: 18 benar dan 7 salah, 18 × 5 + 7 × (−3) = 90 − 21 = 69. Selisihnya 69 − 59 = 10.",
      },
      {
        type: "MULTI_PART", points: 10,
        prompt: `Kas koperasi sekolah mula-mula 80 ribu rupiah. Senin koperasi membeli stok 120 ribu, Selasa menerima hasil penjualan 65 ribu, dan Rabu membayar listrik 35 ribu. Jawab dalam ribu rupiah. ${NEG}`,
        parts: [
          { prompt: "Saldo setelah hari Senin = …", marks: 3, answer: "-40" },
          { prompt: "Saldo setelah hari Rabu = …", marks: 3, answer: "-10" },
          { prompt: "Koperasi ingin saldonya menjadi 50 ribu setelah hari Kamis. Berapa pemasukan yang dibutuhkan pada hari Kamis?", marks: 4, answer: "60" },
        ],
        explanation: "80 − 120 = −40. −40 + 65 − 35 = −10. Dari −10 ke 50 dibutuhkan 50 − (−10) = 60 ribu.",
      },
      {
        type: "FIND_MISTAKE", points: 8,
        prompt: "Sari menghitung (−6) × (−4) − 30 : (−5). Di baris mana ia pertama kali salah?",
        lines: ["(−6) × (−4) − 30 : (−5)", "= 24 − 30 : (−5)", "= −6 : (−5)", "= 6/5"],
        wrongIndex: 2,
        correction: "",
        explanation: "Pembagian harus dikerjakan sebelum pengurangan: 30 : (−5) = −6, jadi baris ketiga seharusnya 24 − (−6) = 30. Sari mengurangkan lebih dulu.",
      },
      {
        type: "FIND_MISTAKE", points: 8,
        prompt: "Budi mencari KPK dari 12 dan 18. Di baris mana ia pertama kali salah?",
        lines: ["12 = 2² × 3", "18 = 2 × 3²", "KPK = faktor prima yang sama, dengan pangkat terkecil", "KPK = 2 × 3 = 6"],
        wrongIndex: 2,
        correction: "",
        explanation: "Aturan pangkat terkecil untuk faktor yang sama adalah aturan FPB. KPK memakai semua faktor prima dengan pangkat terbesar: 2² × 3² = 36.",
      },
    ],
  },
];
