/**
 * Intermediate Math — Bab 2: Bilangan Rasional, the chapter's closing sequence
 * (Sept 2026), read by scripts/setup-math-chapter.ts:
 *
 *   Sesi → Classic quiz (repeat) → practices → 2 try-outs (standar + pengayaan) → 1 exam
 *
 * Practices: Latihan Penguasaan (Bab 2 only), Latihan Terpadu (Bab 2 using Bab 1)
 * and the fraction↔percent Drill.
 *
 * Targhib's rule (2026-09-19): the earlier chapters come in *integrated*, never
 * as a pool of old questions. Latihan Terpadu and the Try Out Pengayaan are
 * written so each item is a Bab 2 problem that needs a Bab 1 skill (sign rules,
 * KPK/FPB, faktorisasi prima, pangkat, sisa bagi); the Ujian carries a few of
 * them. Latihan Penguasaan, the Drill and the Try Out Standar stay Bab 2 only.
 * Tags like [KPK + Sesi 9] name the two skills a Terpadu item joins.
 *
 * Every answer here was recomputed in Python (fractions.Fraction) before being
 * written down. Prompts are plain text (Unicode maths).
 */
import type { ChapterContent } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";
const DEC = "Untuk desimal gunakan titik, misalnya 0.25.";
const FRAC = "Tulis sebagai pecahan a/b, misalnya 3/4 atau -5/2. Pecahan campuran ditulis sebagai pecahan biasa.";
const RP = "Tulis angkanya tanpa titik ribuan, misalnya 42000.";

export const BAB2_CHAPTER: ChapterContent = {
  chapterTitle: "Bab 2: Bilangan Rasional",
  archiveOnPublish: ["Try Out — Bab 2: Bilangan Rasional", "Fractions Check", "Fractions Challenge"],
  quizzes: [
    // ─────────────────────────── Practice 1: Mastery ───────────────────────────
    {
      title: "Latihan Penguasaan — Bab 2: Bilangan Rasional",
      style: "MASTERY",
      questions: [
        {
          type: "MULTIPLE_CHOICE", points: 1,
          prompt: "[Sesi 7] Bentuk desimal dari 5/8 adalah…",
          options: ["0,58", "0,625", "0,85", "1,6"],
          answer: "B",
          explanation: "5 : 8 = 0,625. Cara lain: 5/8 = 625/1000, karena 8 × 125 = 1000.",
        },
        {
          type: "MULTI_SELECT", points: 1,
          prompt: "[Sesi 7] Pilih SEMUA bilangan rasional.",
          options: ["−4", "1,333… (angka 3 berulang)", "π", "√16"],
          answer: ["A", "B", "D"],
          explanation: "−4 = −4/1. Desimal berulang 1,333… = 4/3. √16 = 4. Hanya π yang desimalnya tidak berhenti dan tidak berulang.",
        },
        {
          type: "FRACTION", points: 1,
          prompt: `[Sesi 7] Tulis 0,35 sebagai pecahan. ${FRAC}`,
          answer: "7/20",
          explanation: "0,35 = 35/100. FPB(35, 100) = 5, jadi bentuk paling sederhananya 7/20.",
        },
        {
          type: "MULTIPLE_CHOICE", points: 1,
          prompt: "[Sesi 8] Tanda yang tepat untuk mengisi  4/5 … 7/9  adalah…",
          options: ["<", ">", "="],
          answer: "B",
          explanation: "Samakan penyebut menjadi 45: 4/5 = 36/45 dan 7/9 = 35/45. Jadi 4/5 > 7/9.",
        },
        {
          type: "MULTIPLE_CHOICE", points: 1,
          prompt: "[Sesi 8] Urutan −0,4, −1/2, dan −3/8 dari yang TERBESAR adalah…",
          options: ["−3/8; −0,4; −1/2", "−1/2; −0,4; −3/8", "−0,4; −3/8; −1/2", "−3/8; −1/2; −0,4"],
          answer: "A",
          explanation: "−3/8 = −0,375, lalu −0,4, lalu −1/2 = −0,5. Bilangan negatif yang lebih dekat ke nol lebih besar.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: "[Sesi 8] Pecahan 7/n kurang dari ½. Berapakah bilangan bulat n terkecil yang memenuhi?",
          answer: 15,
          explanation: "7/n < ½ berarti 7 kurang dari setengah n, jadi n > 14. Bilangan bulat terkecilnya 15. Cek: 7/14 tepat ½, belum kurang.",
        },
        {
          type: "FRACTION", points: 1,
          prompt: `[Sesi 9] Hitung: 5/6 + 3/4. ${FRAC}`,
          answer: "19/12",
          explanation: "KPK(6, 4) = 12. 10/12 + 9/12 = 19/12 (= 1 7/12).",
        },
        {
          type: "FRACTION", points: 1,
          prompt: `[Sesi 9] Hitung: −2/3 − 1/4. ${FRAC}`,
          answer: "-11/12",
          explanation: "−8/12 − 3/12 = −11/12. Mengurangkan bilangan positif dari bilangan negatif membuatnya makin jauh dari nol.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: `[Sesi 9] Hitung: 12 − 4,65. ${DEC}`,
          answer: 7.35,
          explanation: "Tulis 12 sebagai 12,00 lalu sejajarkan koma: 12,00 − 4,65 = 7,35.",
        },
        {
          type: "FRACTION", points: 1,
          prompt: `[Sesi 10] Hitung: 4/9 × 3/8. ${FRAC}`,
          answer: "1/6",
          explanation: "Sederhanakan silang: 4 dengan 8 menjadi 1 dan 2, 3 dengan 9 menjadi 1 dan 3. Hasilnya 1/(3 × 2) = 1/6.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: "[Sesi 10] Hitung: 2½ : 5/6",
          answer: 3,
          explanation: "5/2 × 6/5 = 30/10 = 3.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: `[Sesi 10] Hitung: 0,25 × 3,2. ${DEC}`,
          answer: 0.8,
          explanation: "25 × 32 = 800, dengan 2 + 1 = 3 angka di belakang koma: 0,800 = 0,8. Atau: 0,25 = ¼, dan ¼ × 3,2 = 0,8.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: "[Sesi 11] Berapa 30% dari 250?",
          answer: 75,
          explanation: "10% dari 250 = 25, jadi 30% = 3 × 25 = 75.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: "[Sesi 11] Sebuah barang didiskon 10%, lalu didiskon lagi 10% dari harga barunya. Berapa persen diskon totalnya? Tulis angkanya saja.",
          answer: 19,
          explanation: "0,9 × 0,9 = 0,81. Pembeli membayar 81%, jadi diskon totalnya 19%, bukan 20%.",
        },
        {
          type: "NUMERIC", points: 1,
          prompt: `[Sesi 11] Bulatkan 12,345 ke satu angka desimal. ${DEC}`,
          answer: 12.3,
          explanation: "Lihat angka desimal kedua: 4, kurang dari 5, jadi dibulatkan ke bawah menjadi 12,3.",
        },
      ],
    },

    // ─────────────────────────── Practice 2: Terpadu ───────────────────────────
    {
      title: "Latihan Terpadu — Bab 2: Bilangan Rasional",
      style: "MASTERY",
      questions: [
        { type: "FRACTION", points: 1, prompt: `[KPK + Sesi 9] Hitung: 5/12 + 7/18. Petunjuk: penyebut persekutuan terkecilnya adalah KPK(12, 18). ${FRAC}`, answer: "29/36", explanation: "12 = 2² × 3 dan 18 = 2 × 3², jadi KPK = 2² × 3² = 36. 5/12 = 15/36 dan 7/18 = 14/36. Jumlahnya 29/36." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[FPB + Sesi 7] Pecahan 84/126 disederhanakan sekali jalan dengan membagi pembilang dan penyebut dengan FPB(84, 126). Hasilnya…", options: ["2/3", "4/6", "12/18", "3/4"], answer: "A", explanation: "84 = 2² × 3 × 7 dan 126 = 2 × 3² × 7, jadi FPB = 2 × 3 × 7 = 42. 84 : 42 = 2 dan 126 : 42 = 3." },
        { type: "NUMERIC", points: 1, prompt: `[Aturan tanda + Sesi 10] Hitung: (−3/4) × (−8) × (−1/6). ${NEG}`, answer: -1, explanation: "Tiga faktor negatif (ganjil), jadi hasilnya negatif. 3/4 × 8 × 1/6 = 24/24 = 1. Hasilnya −1." },
        { type: "FRACTION", points: 1, prompt: `[Pangkat + Sesi 10] Hitung: (−2/3)³. ${FRAC}`, answer: "-8/27", explanation: "(−2/3) × (−2/3) × (−2/3): pembilang 2³ = 8, penyebut 3³ = 27, dan pangkat ganjil membuat tandanya negatif." },
        { type: "FRACTION", points: 1, prompt: `[Pangkat + Sesi 9] Hitung: (1/2)² + (1/3)². ${FRAC}`, answer: "13/36", explanation: "(1/2)² = 1/4 dan (1/3)² = 1/9. KPK(4, 9) = 36: 9/36 + 4/36 = 13/36." },
        { type: "MULTI_SELECT", points: 1, prompt: "[Faktorisasi prima + Sesi 7] Tanpa membagi, pilih SEMUA pecahan yang desimalnya terbatas. Faktorkan penyebutnya.", options: ["7/80", "5/48", "11/125", "13/60"], answer: ["A", "C"], explanation: "80 = 2⁴ × 5 dan 125 = 5³ hanya memuat 2 dan 5 → terbatas. 48 = 2⁴ × 3 dan 60 = 2² × 3 × 5 memuat 3 → berulang (pecahannya sudah paling sederhana)." },
        { type: "NUMERIC", points: 1, prompt: `[Bilangan bulat + Sesi 9] Suhu sebuah ruang pendingin −4,5 °C. Suhunya naik 7¼ derajat, lalu turun 5,5 derajat. Berapa suhu akhirnya (°C)? ${NEG} ${DEC}`, answer: -2.75, explanation: "−4,5 + 7,25 = 2,75, lalu 2,75 − 5,5 = −2,75 °C." },
        { type: "NUMERIC", points: 1, prompt: `[Urutan operasi + Sesi 10] Hitung: −2 + 3 × (−1/2)² − 1/4 : (−1/8). ${DEC}`, answer: 0.75, explanation: "Pangkat dulu: (−1/2)² = 1/4. Lalu kali dan bagi: 3 × 1/4 = 3/4 dan 1/4 : (−1/8) = −2. Terakhir: −2 + 3/4 − (−2) = 3/4 = 0,75." },
        { type: "NUMERIC", points: 1, prompt: "[KPK + Sesi 10] Bus A berangkat dari terminal setiap 1¼ jam dan bus B setiap 1⅔ jam. Keduanya baru saja berangkat bersamaan. Setelah berapa jam keduanya berangkat bersamaan lagi?", answer: 5, explanation: "Ubah ke menit: 1¼ jam = 75 menit dan 1⅔ jam = 100 menit. KPK(75, 100) = 300 menit = 5 jam." },
        { type: "NUMERIC", points: 1, prompt: `[FPB + Sesi 10] Pita merah 2,4 m dan pita biru 3,6 m dipotong menjadi potongan yang sama panjang, sepanjang mungkin, tanpa sisa. Berapa meter panjang setiap potongan? ${DEC}`, answer: 1.2, explanation: "Ubah ke cm supaya bulat: FPB(240, 360) = 120 cm = 1,2 m. Pita merah jadi 2 potong, pita biru 3 potong." },
        { type: "NUMERIC", points: 1, prompt: "[Sisa bagi + Sesi 7] Bentuk desimal 5/7 adalah 0,714285714285… (angka 714285 berulang). Berapakah angka ke-50 di belakang koma?", answer: 1, explanation: "Polanya 6 angka. 50 = 6 × 8 + 2, jadi angka ke-50 sama dengan angka ke-2 dalam pola 714285, yaitu 1." },
        { type: "NUMERIC", points: 1, prompt: "[Sifat distributif + Sesi 10] Hitung dengan cara cepat: 3/7 × 45 + 3/7 × (−38)", answer: 3, explanation: "Sifat distributif dari Bab 1: 3/7 × (45 + (−38)) = 3/7 × 7 = 3." },
      ],
    },

    // ─────────────────────────── Practice 3: Drill ───────────────────────────
    {
      title: "Drill Kilat — Pecahan & Persen",
      style: "DRILL",
      settings: { drillSkill: "fraction-percent", drillSeconds: 60, drillTarget: 10 },
      questions: [],
    },

    // ─────────────────────────── Try-out standar ───────────────────────────
    {
      title: "Try Out Standar — Bab 2: Bilangan Rasional",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bilangan berikut yang BUKAN bilangan rasional adalah…", options: ["−3/4", "0,121212…", "√7", "5"], answer: "C", explanation: "√7 = 2,6457… tidak berhenti dan tidak berulang. 0,1212… berulang, jadi rasional (= 4/33)." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pecahan yang senilai dengan 12/20 adalah…", options: ["3/4", "3/5", "6/5", "2/3"], answer: "B", explanation: "Bagi pembilang dan penyebut dengan FPB-nya, 4: 12/20 = 3/5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bentuk persen dari 0,045 adalah…", options: ["45%", "4,5%", "0,45%", "450%"], answer: "B", explanation: "Desimal ke persen: kali 100. 0,045 × 100 = 4,5, jadi 4,5%." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "−3⅖ jika ditulis sebagai pecahan biasa adalah…", options: ["−17/5", "−13/5", "−15/2", "17/5"], answer: "A", explanation: "3⅖ = (3 × 5 + 2)/5 = 17/5. Tanda minusnya berlaku untuk seluruh bilangan: −17/5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pecahan yang bentuk desimalnya BERULANG adalah…", options: ["3/8", "7/25", "5/12", "9/20"], answer: "C", explanation: "Penyebut 12 = 2² × 3 memuat faktor 3, jadi desimalnya berulang (0,41666…). Penyebut lain hanya memuat faktor 2 dan 5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pecahan yang terletak di antara 0,6 dan 0,7 adalah…", options: ["3/5", "5/8", "7/10", "5/7"], answer: "B", explanation: "5/8 = 0,625. 3/5 = 0,6 dan 7/10 = 0,7 tepat di batas, 5/7 ≈ 0,714 melewati 0,7." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Urutan bilangan 2/5, 0,35, 3/8, dan 42% dari yang TERKECIL adalah…", options: ["0,35; 3/8; 2/5; 42%", "3/8; 0,35; 2/5; 42%", "0,35; 2/5; 3/8; 42%", "42%; 2/5; 3/8; 0,35"], answer: "A", explanation: "Dalam desimal: 0,35 < 0,375 (3/8) < 0,4 (2/5) < 0,42 (42%)." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pernyataan yang benar adalah…", options: ["−1/3 < −1/2", "−0,6 > −0,59", "−5/4 < −1,2", "−2/5 < −0,5"], answer: "C", explanation: "−5/4 = −1,25, lebih jauh dari nol daripada −1,2, jadi lebih kecil. Tiga pernyataan lainnya terbalik." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 2/3 + 1/6 adalah…", options: ["3/9", "5/6", "1/2", "3/6"], answer: "B", explanation: "2/3 = 4/6, lalu 4/6 + 1/6 = 5/6. Menjumlahkan pembilang dan penyebut (3/9) adalah kesalahan yang sering terjadi." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 2¼ − 1⅔ adalah…", options: ["7/12", "1 7/12", "5/12", "1/12"], answer: "A", explanation: "9/4 − 5/3 = 27/12 − 20/12 = 7/12. Taksiran: 2,25 − 1,67 ≈ 0,6, cocok." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −3/4 + 5/6 − (−1/3) adalah…", options: ["5/12", "−5/12", "1/12", "−1/12"], answer: "A", explanation: "Penyebut 12: −9/12 + 10/12 + 4/12 = 5/12. Mengurangi bilangan negatif sama dengan menambah." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 5/8 × 4/15 adalah…", options: ["1/6", "9/23", "1/5", "3/10"], answer: "A", explanation: "Sederhanakan silang: 5 dengan 15 menjadi 1 dan 3, 4 dengan 8 menjadi 1 dan 2. Hasilnya 1/(2 × 3) = 1/6." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 3/5 : 9/10 adalah…", options: ["27/50", "2/3", "3/2", "1/3"], answer: "B", explanation: "3/5 × 10/9 = 30/45 = 2/3. 27/50 muncul jika pembaginya tidak dibalik." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 1,5 × 0,4 + 2,4 : 0,6 adalah…", options: ["4,6", "0,64", "2,4", "6"], answer: "A", explanation: "Kali dan bagi lebih dulu: 1,5 × 0,4 = 0,6 dan 2,4 : 0,6 = 4. Lalu 0,6 + 4 = 4,6." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Tanpa menghitung, manakah yang hasilnya KURANG dari 36?", options: ["36 : 0,8", "36 × 1,25", "36 × 0,8", "36 : 3/4"], answer: "C", explanation: "Mengalikan dengan bilangan antara 0 dan 1 memperkecil. Membagi dengan bilangan antara 0 dan 1 justru memperbesar." },
        { type: "NUMERIC", points: 5.5, prompt: `Ubah 7/16 ke bentuk desimal. ${DEC}`, answer: 0.4375, explanation: "16 = 2⁴, jadi desimalnya terbatas. 7/16 = 4375/10000 = 0,4375 (kali 625 atas dan bawah)." },
        { type: "FRACTION", points: 5.5, prompt: `Ubah 0,777… (angka 7 berulang) menjadi pecahan. ${FRAC}`, answer: "7/9", explanation: "x = 0,777…, maka 10x = 7,777… Kurangkan: 9x = 7, jadi x = 7/9." },
        { type: "NUMERIC", points: 5.5, prompt: "Ada berapa bilangan bulat n sehingga n/10 terletak di antara 1/4 dan 4/5 (batasnya tidak termasuk)?", answer: 5, explanation: "1/4 = 2,5/10 dan 4/5 = 8/10. Nilai n yang memenuhi 2,5 < n < 8 adalah 3, 4, 5, 6, 7. Ada 5." },
        { type: "FRACTION", points: 5.5, prompt: `Hitung: 1⅚ + 2¾. ${FRAC}`, answer: "55/12", explanation: "11/6 + 11/4 = 22/12 + 33/12 = 55/12 (= 4 7/12)." },
        { type: "NUMERIC", points: 5.5, prompt: `Hitung: 7,2 − 3,85 + 0,6. ${DEC}`, answer: 3.95, explanation: "7,20 − 3,85 = 3,35, lalu 3,35 + 0,60 = 3,95." },
        { type: "NUMERIC", points: 5.5, prompt: `Hitung: −2/5 × 15/4 : (−3/2). ${NEG}`, answer: 1, explanation: "Dari kiri: −2/5 × 15/4 = −30/20 = −3/2. Lalu −3/2 : (−3/2) = 1." },
        { type: "NUMERIC", points: 5.5, prompt: `Ibu membeli 3½ kg tepung. Untuk kue dipakai 1¾ kg, dan untuk roti 0,8 kg. Berapa kg tepung yang tersisa? ${DEC}`, answer: 0.95, explanation: "Dalam desimal: 3,5 − 1,75 − 0,8 = 0,95 kg." },
        { type: "NUMERIC", points: 5.5, prompt: "Tali sepanjang 6¾ m dipotong-potong, masing-masing ¾ m. Berapa potong yang diperoleh?", answer: 9, explanation: "27/4 : 3/4 = 27/4 × 4/3 = 9 potong." },
        { type: "NUMERIC", points: 5.5, prompt: "Di kelas yang berisi 32 siswa, 3/8 siswa ikut Pramuka dan 1/4 siswa ikut PMR. Sisanya tidak ikut ekskul. Berapa siswa yang tidak ikut ekskul?", answer: 12, explanation: "Bagian yang tidak ikut: 1 − 3/8 − 2/8 = 3/8. 3/8 × 32 = 12 siswa." },
        { type: "NUMERIC", points: 5.5, prompt: "Sebuah taman berbentuk persegi panjang berukuran 2⅖ m × 1¼ m. Berapa m² luasnya?", answer: 3, explanation: "12/5 × 5/4 = 60/20 = 3 m²." },
      ],
    },

    // ─────────────────────────── Try-out pengayaan ───────────────────────────
    {
      title: "Try Out Pengayaan — Bab 2: Bilangan Rasional",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari (−1/2)³ × (−4)² adalah…", options: ["−2", "2", "−8", "8"], answer: "A", explanation: "(−1/2)³ = −1/8 (pangkat ganjil, negatif) dan (−4)² = 16 (pangkat genap, positif). −1/8 × 16 = −2." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil dari −3 − (−1¼) × 4 + 2/3 : (−1/6) adalah…", options: ["−2", "−10", "6", "−4"], answer: "A", explanation: "Kali dan bagi dulu: (−1¼) × 4 = −5 dan 2/3 : (−1/6) = 2/3 × (−6) = −4. Lalu −3 − (−5) + (−4) = −3 + 5 − 4 = −2." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Untuk menjumlahkan 7/24 + 5/36 + 1/16, penyebut persekutuan terkecilnya adalah…", options: ["144", "72", "288", "576"], answer: "A", explanation: "24 = 2³ × 3, 36 = 2² × 3², 16 = 2⁴. KPK = 2⁴ × 3² = 144." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Bilangan bulat n TERBESAR yang membuat 3/7 × n menjadi bilangan bulat negatif adalah…", options: ["−7", "−3", "7", "−21"], answer: "A", explanation: "3/7 × n bulat hanya jika n kelipatan 7 (3 dan 7 tidak punya faktor persekutuan). Supaya negatif, n harus negatif: −7, −14, … Yang terbesar −7, dengan hasil −3." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Harga sebuah barang turun 20%, lalu naik 20%, lalu turun 20% lagi. Harga akhirnya adalah … dari harga awal.", options: ["76,8%", "80%", "84%", "96%"], answer: "A", explanation: "Kalikan faktornya: 0,8 × 1,2 × 0,8 = 0,768 = 76,8%." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Manakah yang nilainya paling dekat dengan 0?", options: ["(−1/2)³", "(1/3)²", "−0,2 × 0,5", "1/5 − 1/4"], answer: "D", explanation: "(−1/2)³ = −0,125; (1/3)² ≈ 0,111; −0,2 × 0,5 = −0,1; 1/5 − 1/4 = −1/20 = −0,05. Jarak ke nol terkecil −0,05." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran kode Python berikut?\n\nfrom fractions import Fraction\nprint(Fraction(-3, 4) ** 2 - Fraction(1, 2))", options: ["1/16", "-1/16", "17/16", "0.0625"], answer: "A", explanation: "(−3/4)² = 9/16 (pangkat genap, positif). 9/16 − 8/16 = 1/16. Fraction mencetak pecahan, bukan desimal." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Rata-rata dari −1/2, 3/4, dan −5/6 adalah…", options: ["−7/36", "−7/12", "7/36", "−1/4"], answer: "A", explanation: "Jumlahnya dengan penyebut 12: −6/12 + 9/12 − 10/12 = −7/12. Dibagi 3: −7/36." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Nilai dari (−2/3)² − (−2/3) × 3/4 adalah…", options: ["17/18", "−1/18", "1/18", "−17/18"], answer: "A", explanation: "(−2/3)² = 4/9 dan (−2/3) × 3/4 = −1/2. 4/9 − (−1/2) = 8/18 + 9/18 = 17/18." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil 1 − 1/2 + 1/3 − 1/4 + 1/5 − 1/6 dibulatkan ke dua angka desimal adalah…", options: ["0,62", "0,61", "0,60", "0,63"], answer: "A", explanation: "KPK(2, 3, 4, 5, 6) = 60: (60 − 30 + 20 − 15 + 12 − 10)/60 = 37/60 = 0,6166… Angka ketiga 6, jadi dibulatkan ke atas: 0,62." },
        { type: "NUMERIC", points: 6, prompt: `Sebuah jaket seharga Rp240.000 didiskon 25%, lalu dikenai pajak 10% dari harga setelah diskon. Berapa harga yang dibayar, dalam rupiah? ${RP}`, answer: 198000, explanation: "Kalikan faktornya: 240.000 × 0,75 × 1,1 = 198.000." },
        { type: "FRACTION", points: 6, prompt: `Hitung: (3/4 − 5/6)² : (−1/24). ${FRAC}`, answer: "-1/6", explanation: "Kurung dulu: 3/4 − 5/6 = 9/12 − 10/12 = −1/12. Pangkat: (−1/12)² = 1/144. Bagi: 1/144 × (−24) = −24/144 = −1/6." },
        { type: "NUMERIC", points: 6, prompt: `Suhu awal sebuah freezer −3,5 °C. Suhunya turun 1¼ derajat setiap jam selama 4 jam, lalu naik 2,5 derajat. Berapa suhu akhirnya (°C)? ${NEG}`, answer: -6, explanation: "Turun 4 × 1¼ = 5 derajat. −3,5 − 5 + 2,5 = −6 °C." },
        { type: "NUMERIC", points: 6, prompt: "Sebuah drum air terisi 3/4 bagian. Setelah 18 liter dipakai, drum tinggal terisi 3/10 bagian. Berapa liter kapasitas drum?", answer: 40, explanation: "Yang terpakai 3/4 − 3/10 = 15/20 − 6/20 = 9/20 bagian = 18 liter. Kapasitas = 18 : 9/20 = 18 × 20/9 = 40 liter." },
        { type: "FRACTION", points: 6, prompt: `Sederhanakan (2⁴ × 3²) / (2² × 3³ × 5) menjadi pecahan paling sederhana. ${FRAC}`, answer: "4/15", explanation: "Coret faktor prima yang sama: 2⁴/2² = 2² = 4 di atas, 3²/3³ menyisakan 3 di bawah, dan 5 tetap di bawah. Hasilnya 4/(3 × 5) = 4/15." },
        { type: "NUMERIC", points: 6, prompt: "Ada berapa bilangan bulat n yang memenuhi −5/2 < n/3 < 7/4?", answer: 13, explanation: "Kalikan semuanya dengan 3: −7,5 < n < 5,25. Bilangan bulatnya −7, −6, …, 5, yaitu 7 + 1 + 5 = 13 bilangan." },
        { type: "NUMERIC", points: 6, prompt: "Tiga tongkat panjangnya 1,2 m, 1,8 m, dan 2,4 m. Semuanya dipotong menjadi potongan yang sama panjang, sepanjang mungkin, tanpa sisa. Berapa potong yang diperoleh seluruhnya?", answer: 9, explanation: "Dalam dm: FPB(12, 18, 24) = 6 dm = 0,6 m. Banyak potongan 12/6 + 18/6 + 24/6 = 2 + 3 + 4 = 9." },
        { type: "NUMERIC", points: 6, prompt: `Apa keluaran kode Python  print(-7 // 2 + 7 / 2) ? ${NEG} ${DEC}`, answer: -0.5, explanation: "-7 // 2 membulatkan −3,5 ke bawah menjadi −4 (Bab 1). 7 / 2 = 3.5. −4 + 3.5 = −0.5." },
        { type: "NUMERIC", points: 6, prompt: `Harga sebuah sepeda Rp2.000.000 naik 10% setiap tahun, dihitung dari harga tahun sebelumnya. Berapa harganya setelah 3 tahun, dalam rupiah? ${RP}`, answer: 2662000, explanation: "Kalikan faktor 1,1 tiga kali: 2.000.000 × 1,1³ = 2.000.000 × 1,331 = 2.662.000. Pangkat dari Bab 1 muncul lagi di sini." },
        { type: "NUMERIC", points: 6, prompt: "Hitung: (1 + 1/2) × (1 + 1/3) × (1 + 1/4) × … × (1 + 1/99)", answer: 50, explanation: "Setiap faktor bernilai (k + 1)/k: 3/2 × 4/3 × 5/4 × … × 100/99. Semua saling mencoret kecuali 100/2 = 50." },
      ],
    },

    // ─────────────────────────── Exam ───────────────────────────
    {
      title: "Ujian — Bab 2: Bilangan Rasional",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari (−1/2)² − 3 × (−1/4) adalah…", options: ["1", "−1/2", "1/2", "−1"], answer: "A", explanation: "Pangkat dulu: (−1/2)² = 1/4. Lalu 3 × (−1/4) = −3/4. 1/4 − (−3/4) = 1/4 + 3/4 = 1." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pecahan yang bentuk desimalnya TERBATAS adalah…", options: ["2/15", "7/12", "11/40", "5/6"], answer: "C", explanation: "40 = 2³ × 5 hanya memuat faktor 2 dan 5, jadi 11/40 = 0,275. Penyebut lain memuat faktor 3." },
        { type: "MULTI_SELECT", points: 3, prompt: "Pilih SEMUA yang nilainya sama dengan 1,25.", options: ["5/4", "125%", "12/5", "1¼"], answer: ["A", "B", "D"], explanation: "5/4 = 1¼ = 1,25 = 125%. 12/5 = 2,4." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Urutan bilangan −0,25, −1/3, −2/9, dan 0 dari yang TERBESAR adalah…", options: ["0; −2/9; −0,25; −1/3", "0; −1/3; −0,25; −2/9", "−1/3; −0,25; −2/9; 0", "0; −0,25; −2/9; −1/3"], answer: "A", explanation: "−2/9 ≈ −0,222, −0,25, −1/3 ≈ −0,333. Yang lebih dekat ke nol lebih besar." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 1½ + 2/3 − 5/6 adalah…", options: ["4/3", "1", "7/6", "5/3"], answer: "A", explanation: "Penyebut 6: 9/6 + 4/6 − 5/6 = 8/6 = 4/3." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −2/3 × (−9/10) adalah…", options: ["3/5", "−3/5", "20/27", "−20/27"], answer: "A", explanation: "Negatif kali negatif hasilnya positif. 2/3 × 9/10 = 18/30 = 3/5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 5 : 2/3 adalah…", options: ["7½", "3⅓", "10/3", "2/15"], answer: "A", explanation: "5 × 3/2 = 15/2 = 7½. Masuk akal: berapa banyak 2/3 yang muat dalam 5? Lebih dari 5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Untuk menghitung 5/18 + 7/24, penyebut persekutuan terkecilnya adalah…", options: ["72", "144", "432", "36"], answer: "A", explanation: "18 = 2 × 3² dan 24 = 2³ × 3. KPK = 2³ × 3² = 72. Mengalikan kedua penyebut (432) juga bisa, tetapi angkanya jauh lebih besar." },
        { type: "FRACTION", points: 4, prompt: `Hitung: 3/8 + 5/12. ${FRAC}`, answer: "19/24", explanation: "KPK(8, 12) = 24. 9/24 + 10/24 = 19/24." },
        { type: "NUMERIC", points: 4, prompt: `Hitung: −2¼ + 3 × (−5/6). ${NEG} ${DEC}`, answer: -4.75, explanation: "Kali dulu: 3 × (−5/6) = −5/2 = −2,5. Lalu −2,25 + (−2,5) = −4,75." },
        { type: "NUMERIC", points: 4, prompt: `Hitung: 2,5 − 3¾. ${NEG} ${DEC}`, answer: -1.25, explanation: "3¾ = 3,75. 2,5 − 3,75 = −1,25." },
        { type: "FRACTION", points: 4, prompt: `Hitung: (−5/6) : (−10/9). ${FRAC}`, answer: "3/4", explanation: "−5/6 × (−9/10) = 45/60 = 3/4. Negatif dibagi negatif hasilnya positif." },
        { type: "NUMERIC", points: 4, prompt: `Tiga lampu hias berkedip setiap ½ detik, ¾ detik, dan 1⅛ detik. Ketiganya baru saja berkedip bersamaan. Setelah berapa detik ketiganya berkedip bersamaan lagi? ${DEC}`, answer: 4.5, explanation: "Dalam satuan 1/8 detik: 4, 6, dan 9. KPK(4, 6, 9) = 36, yaitu 36/8 = 4,5 detik." },
        { type: "NUMERIC", points: 4, prompt: `Pecahan 3/8 sama dengan berapa persen? Tulis angkanya saja. ${DEC}`, answer: 37.5, explanation: "3/8 = 0,375 = 37,5%." },
        {
          type: "STEPS", points: 8,
          prompt: "Hitung 2⅓ − 3½ + 1¾ langkah demi langkah. Tulis pecahan sebagai a/b.",
          steps: [
            { prompt: "2⅓ sebagai pecahan biasa = …", answer: "7/3" },
            { prompt: "KPK dari penyebut 3, 2, dan 4 = …", answer: "12" },
            { prompt: "Hasil akhir, sebagai pecahan a/b = …", answer: "7/12" },
          ],
          explanation: "7/3 − 7/2 + 7/4 = 28/12 − 42/12 + 21/12 = 7/12.",
        },
        {
          type: "STEPS", points: 8,
          prompt: "Ubah 0,454545… (angka 45 berulang) menjadi pecahan. Misalkan x = 0,4545… Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Banyak angka yang berulang = …", answer: "2" },
            { prompt: "100x − x = 99x = …", answer: "45" },
            { prompt: "x sebagai pecahan paling sederhana, a/b = …", answer: "5/11" },
          ],
          explanation: "Karena dua angka berulang, kalikan 100: 100x = 45,4545… Kurangkan x: 99x = 45. x = 45/99 = 5/11.",
        },
        {
          type: "MULTI_PART", points: 10,
          prompt: "Pak Budi punya lahan seluas 2400 m². 3/8 bagian ditanami jagung, 1/4 bagian ditanami cabai, dan sisanya dijadikan kolam ikan.",
          parts: [
            { prompt: "Luas lahan jagung (m²) = …", marks: 4, answer: "900" },
            { prompt: "Luas lahan cabai (m²) = …", marks: 3, answer: "600" },
            { prompt: "Kolam ikan sebagai pecahan dari seluruh lahan, a/b = …", marks: 3, answer: "3/8" },
          ],
          explanation: "3/8 × 2400 = 900 m² dan 1/4 × 2400 = 600 m². Kolam: 1 − 3/8 − 2/8 = 3/8 bagian (900 m²).",
        },
        {
          type: "MULTI_PART", points: 10,
          prompt: "Kakak membeli 1,5 kg apel seharga 28 ribu rupiah per kg dan 2,25 kg jeruk seharga 16 ribu rupiah per kg. Ia membayar dengan uang 100 ribu rupiah. Jawab dalam ribu rupiah.",
          parts: [
            { prompt: "Harga apel = …", marks: 3, answer: "42" },
            { prompt: "Harga jeruk = …", marks: 4, answer: "36" },
            { prompt: "Uang kembalian = …", marks: 3, answer: "22" },
          ],
          explanation: "1,5 × 28 = 42 dan 2,25 × 16 = 36. Kembalian 100 − 42 − 36 = 22 ribu rupiah.",
        },
        {
          type: "FIND_MISTAKE", points: 8,
          prompt: "Dimas menghitung 2/3 + 3/4. Di baris mana ia pertama kali salah?",
          lines: ["2/3 + 3/4", "= (2 + 3)/(3 + 4)", "= 5/7"],
          wrongIndex: 1,
          correction: "",
          explanation: "Pembilang dan penyebut tidak boleh dijumlahkan begitu saja. Samakan penyebut dulu: 8/12 + 9/12 = 17/12. Taksiran juga menangkapnya: 2/3 + 3/4 jelas lebih dari 1, sedangkan 5/7 kurang dari 1.",
        },
        {
          type: "FIND_MISTAKE", points: 8,
          prompt: "Lina menghitung 3/4 : 1/2. Di baris mana ia pertama kali salah?",
          lines: ["3/4 : 1/2", "= 4/3 × 1/2", "= 4/6", "= 2/3"],
          wrongIndex: 1,
          correction: "",
          explanation: "Yang dibalik adalah pembagi (1/2), bukan bilangan yang dibagi: 3/4 × 2/1 = 6/4 = 3/2. Cek: membagi dengan 1/2 seharusnya memperbesar.",
        },
      ],
    },
  ],
};
