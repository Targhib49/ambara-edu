/**
 * Intermediate Math — Bab 2: Bilangan Rasional, book-style remake (Sept 2026).
 * Consumed by scripts/setup-math-bab.ts. Same shape as Bab 1: each Sesi =
 * intro markdown → inline PDF (built from `Mid Math/Buku/<dir>`) → self-check
 * markdown, plus a lesson-linked "Latihan Mandiri" quiz whose items never
 * repeat the practice questions printed (with answers) in the PDFs.
 *
 * Quiz prompts render as plain text, so maths uses Unicode (−, ×, ½), not LaTeX.
 * Every answer was recomputed in Python (fractions.Fraction) before being written down.
 */
import type { BabContent, Block } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";
const DEC = "Untuk desimal gunakan titik, misalnya 0.25.";
const FRAC = "Tulis sebagai pecahan a/b, misalnya 3/4 atau -5/2. Pecahan campuran ditulis sebagai pecahan biasa (1½ ditulis 3/2).";

const intro = (title: string, lines: string[], book: string): Block => ({
  type: "MARKDOWN",
  markdown: [
    `## ${title}`,
    "",
    ...lines,
    "",
    "**Cara belajar sesi ini**",
    "1. Kerjakan kotak *Coba Tebak Dulu* di halaman pertama **sebelum** membaca lebih jauh.",
    "2. Baca setiap bagian. Setiap kali ada *Cek Cepat*, berhenti dan kerjakan dulu.",
    "3. Kerjakan Latihan, lalu cocokkan dengan kunci jawaban di halaman terakhir.",
    "",
    `> 📘 ${book}`,
  ].join("\n"),
});

const closing = (items: string[], quizNote: string): Block => ({
  type: "MARKDOWN",
  markdown: [
    "## Cek Diri",
    "Sebelum lanjut, jujurlah pada dirimu sendiri. Apakah kamu sudah bisa…",
    "",
    ...items.map((i) => `- [ ] ${i}`),
    "",
    "Ada yang belum? Buka lagi bagian PDF yang sesuai dan coba ulang soal latihannya. Kunci jawaban ada di halaman terakhir PDF.",
    "",
    "---",
    "",
    quizNote,
  ].join("\n"),
});

const FORMAT_NOTE = "Jawaban pecahan ditulis **a/b** (misalnya `-5/2`), desimal memakai **titik** (misalnya `0.25`).";

export const BAB2: BabContent = {
  chapterTitle: "Bab 2: Bilangan Rasional",
  pdfPrefix: "Bab2-",
  sesi: [
    // ───────────────────────────── Sesi 7 ─────────────────────────────
    {
      title: "Sesi 7 — Mengenal Bilangan Rasional",
      blocks: [
        intro(
          "Mengenal Bilangan Rasional",
          [
            "Di Bab 1 kita hanya punya bilangan bulat. Tetapi tinggi kecambah, uang saku, dan nilai ulangan sering jatuh **di antara** dua bilangan bulat.",
            "",
            "Sesi ini memperkenalkan **bilangan rasional**: bilangan yang bisa ditulis sebagai pecahan a/b. Kamu akan melihat bahwa ½, 0,5, dan 50% hanyalah tiga nama untuk bilangan yang sama.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 2 Subbab A (hal. 40–47). PDF ini 8 halaman."
        ),
        { type: "PDF", dir: "bab2-sesi7", fileName: "Bab2-Sesi7-Mengenal-Bilangan-Rasional.pdf" },
        closing(
          [
            "menjelaskan kenapa −8, 0,6, dan 2⅓ semuanya bilangan rasional,",
            "menyederhanakan pecahan dengan FPB,",
            "mengubah pecahan ke desimal dan persen, dan sebaliknya,",
            "menebak desimal terbatas atau berulang hanya dari penyebutnya,",
            "membedakan bilangan rasional dan irasional.",
          ],
          `Lanjut ke **Sesi 7 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 7 — Latihan Mandiri",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Manakah yang BUKAN bilangan rasional?",
            options: ["−7", "0,25", "√2", "⅔"],
            answer: "C",
            explanation: "−7 = −7/1, 0,25 = 1/4, dan ⅔ sudah berbentuk pecahan. √2 = 1,41421356… tidak berhenti dan tidak berulang, jadi irasional.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Bentuk paling sederhana dari 18/24 adalah…",
            options: ["9/12", "6/8", "3/4", "2/3"],
            answer: "C",
            explanation: "FPB(18, 24) = 6. 18 : 6 = 3 dan 24 : 6 = 4, jadi 3/4. 9/12 dan 6/8 senilai, tetapi masih bisa disederhanakan.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `[Dasar] Ubah 3/8 ke bentuk desimal. ${DEC}`,
            answer: 0.375,
            explanation: "3 : 8 = 0,375. Cara lain: 3/8 = 375/1000 karena 8 × 125 = 1000.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "[Dasar] Pecahan 7/20 sama dengan berapa persen? Tulis angkanya saja.",
            answer: 35,
            explanation: "Persen berarti per seratus. 7/20 = 35/100 (kali 5 atas dan bawah) = 35%.",
          },
          {
            type: "MULTI_SELECT",
            points: 2,
            prompt: "[Menengah] Pilih SEMUA pecahan yang bentuk desimalnya TERBATAS (berhenti).",
            options: ["7/40", "5/12", "9/75", "11/30"],
            answer: ["A", "C"],
            explanation: "Sederhanakan dulu, lalu lihat penyebutnya. 40 = 2³ × 5 → terbatas (0,175). 9/75 = 3/25 dan 25 = 5² → terbatas (0,12). 12 dan 30 memuat faktor 3 → berulang.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `[Menengah] Tulis −2⅗ sebagai pecahan biasa. ${FRAC}`,
            answer: "-13/5",
            explanation: "−2⅗ = −(2 + ⅗) = −(10/5 + 3/5) = −13/5. Tanda minus berlaku untuk seluruh bilangan, bukan hanya untuk angka 2.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "[Menengah] Bilangan rasional yang terletak di antara 1/4 dan 1/3 adalah…",
            options: ["2/7", "1/5", "3/8", "2/5"],
            answer: "A",
            explanation: "1/4 = 0,25 dan 1/3 ≈ 0,333. 2/7 ≈ 0,286 ada di antaranya. 1/5 = 0,2 terlalu kecil, 3/8 = 0,375 dan 2/5 = 0,4 terlalu besar.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `[Tantangan] Ubah 0,181818… (angka 18 berulang terus) menjadi pecahan. ${FRAC}`,
            answer: "2/11",
            explanation: "Misalkan x = 0,1818… Karena yang berulang dua angka, kalikan 100: 100x = 18,1818… Kurangkan: 99x = 18, jadi x = 18/99 = 2/11.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "[Tantangan] Ada berapa pecahan yang senilai dengan 3/5 dan penyebutnya lebih besar dari 20 tetapi lebih kecil dari 50?",
            answer: 5,
            explanation: "Pecahan senilai 3/5 punya penyebut kelipatan 5: 15/25, 18/30, 21/35, 24/40, 27/45. Ada 5 (20 dan 50 tidak termasuk).",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 8 ─────────────────────────────
    {
      title: "Sesi 8 — Membandingkan, Mengurutkan & Menaksir Bilangan Rasional",
      blocks: [
        intro(
          "Membandingkan, Mengurutkan & Menaksir",
          [
            "Mana yang lebih besar, 5/6 atau 7/9? Bagaimana dengan 65% dan 2/3? Pertanyaan seperti ini muncul setiap kali kita membaca hasil survei atau membandingkan harga.",
            "",
            "Sesi ini memberimu **kotak alat**: menaksir dengan patokan 0, ½, dan 1, menyamakan penyebut, membandingkan desimal, dan mengurutkan bilangan negatif.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 2 Subbab B (hal. 48–53). PDF ini 7 halaman."
        ),
        { type: "PDF", dir: "bab2-sesi8", fileName: "Bab2-Sesi8-Membandingkan-Mengurutkan.pdf" },
        closing(
          [
            "menaksir apakah sebuah pecahan lebih dari atau kurang dari ½,",
            "membandingkan dua pecahan dengan menyamakan penyebut,",
            "membandingkan campuran pecahan, desimal, dan persen,",
            "mengurutkan bilangan rasional negatif dengan benar,",
            "membedakan \"bagian\" (pecahan) dan \"banyaknya\" (jumlah orang).",
          ],
          `Lanjut ke **Sesi 8 — Latihan Mandiri** (9 soal). 💪`
        ),
      ],
      quiz: {
        title: "Sesi 8 — Latihan Mandiri",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Pecahan manakah yang LEBIH DARI ½?",
            options: ["4/9", "7/15", "6/11", "5/12"],
            answer: "C",
            explanation: "Bandingkan pembilang dengan setengah penyebut. 6 lebih dari 11 : 2 = 5,5, jadi 6/11 > ½. Pecahan lainnya pembilangnya kurang dari setengah penyebut.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Pernyataan yang benar adalah…",
            options: ["3/7 > 3/5", "0,45 > 0,5", "−2/3 < −1/2", "5/8 < 0,6"],
            answer: "C",
            explanation: "−2/3 ≈ −0,67 lebih jauh dari nol daripada −1/2 = −0,5, jadi lebih kecil. 3/7 < 3/5 (pembilang sama, penyebut lebih besar), 0,45 < 0,50, dan 5/8 = 0,625 > 0,6.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Bilangan yang paling besar adalah…",
            options: ["0,7", "2/3", "72%", "5/7"],
            answer: "C",
            explanation: "Ubah semua ke desimal: 0,7; 2/3 ≈ 0,667; 72% = 0,72; 5/7 ≈ 0,714. Yang terbesar 0,72.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Tanda yang tepat untuk mengisi  −3/4 … −0,8  adalah…",
            options: ["<", ">", "="],
            answer: "B",
            explanation: "−3/4 = −0,75. Pada garis bilangan −0,75 lebih dekat ke nol daripada −0,8, jadi −3/4 > −0,8.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "[Menengah] Urutan bilangan 3/5, 0,55, 4/7, dan 58% dari yang TERKECIL adalah…",
            options: ["0,55; 4/7; 58%; 3/5", "0,55; 58%; 4/7; 3/5", "4/7; 0,55; 3/5; 58%", "3/5; 58%; 4/7; 0,55"],
            answer: "A",
            explanation: "Dalam desimal: 3/5 = 0,6; 0,55; 4/7 ≈ 0,571; 58% = 0,58. Urutannya 0,55 < 0,571 < 0,58 < 0,6.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "[Menengah] Pecahan x/12 terletak di antara 1/3 dan 3/4 (batasnya tidak termasuk). Ada berapa bilangan bulat x yang memenuhi?",
            answer: 4,
            explanation: "Samakan penyebutnya menjadi 12: 1/3 = 4/12 dan 3/4 = 9/12. Nilai x yang memenuhi 4 < x < 9 adalah 5, 6, 7, 8. Ada 4.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "[Menengah] Empat teman membaca novel yang sama. Andi sudah membaca 2/3 buku, Budi 65%, Citra 0,7 bagian, dan Dedi 5/8 buku. Siapa yang bacaannya paling SEDIKIT?",
            options: ["Andi", "Budi", "Citra", "Dedi"],
            answer: "D",
            explanation: "Andi ≈ 0,667, Budi = 0,65, Citra = 0,7, Dedi = 0,625. Yang terkecil 0,625, yaitu Dedi.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "[Tantangan] Berapakah bilangan bulat n terkecil sehingga n/9 lebih besar dari 5/6?",
            answer: 8,
            explanation: "Samakan penyebutnya menjadi 18: n/9 = 2n/18 dan 5/6 = 15/18. Perlu 2n > 15, jadi n > 7,5. Bilangan bulat terkecilnya 8 (8/9 ≈ 0,889 > 0,833).",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 3,
            prompt: "[Tantangan] Pecahan manakah yang paling DEKAT dengan ½?",
            options: ["5/9", "4/7", "7/15", "6/13"],
            answer: "C",
            explanation: "Hitung jaraknya ke ½: 5/9 − ½ = 1/18, 4/7 − ½ = 1/14, ½ − 7/15 = 1/30, ½ − 6/13 = 1/26. Jarak terkecil 1/30, yaitu 7/15.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 9 ─────────────────────────────
    {
      title: "Sesi 9 — Penjumlahan & Pengurangan Bilangan Rasional",
      blocks: [
        intro(
          "Penjumlahan & Pengurangan Bilangan Rasional",
          [
            "Menjumlahkan ⅓ dan ¼ tidak sama dengan menjumlahkan pembilang dan penyebutnya: hasilnya **bukan** 2/7. Sesi ini menjelaskan kenapa, lalu melatih cara yang benar.",
            "",
            "Kebiasaan penting sesi ini: **taksir dulu** sebelum menghitung, supaya kesalahan besar langsung ketahuan.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 2 Subbab C.1 (hal. 54–62). PDF ini 7 halaman."
        ),
        { type: "PDF", dir: "bab2-sesi9", fileName: "Bab2-Sesi9-Penjumlahan-Pengurangan.pdf" },
        closing(
          [
            "menaksir hasil penjumlahan pecahan sebelum menghitung,",
            "menjumlahkan dan mengurangkan pecahan berpenyebut beda dengan KPK,",
            "mengurangkan pecahan campuran, termasuk yang perlu \"meminjam\",",
            "memakai aturan tanda Bab 1 untuk pecahan negatif,",
            "menjumlahkan desimal dengan menyejajarkan koma.",
          ],
          `Lanjut ke **Sesi 9 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 9 — Latihan Mandiri",
        questions: [
          {
            type: "FRACTION",
            points: 1,
            prompt: `[Dasar] Hitung: 2/9 + 5/9. ${FRAC}`,
            answer: "7/9",
            explanation: "Penyebutnya sudah sama, jadi jumlahkan pembilangnya saja: 2 + 5 = 7. Hasilnya 7/9.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `[Dasar] Hitung: 3/4 − 1/6. ${FRAC}`,
            answer: "7/12",
            explanation: "KPK(4, 6) = 12. 3/4 = 9/12 dan 1/6 = 2/12. 9/12 − 2/12 = 7/12.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `[Dasar] Hitung: 6,3 − 2,75. ${DEC}`,
            answer: 3.55,
            explanation: "Sejajarkan koma dan tulis 6,3 sebagai 6,30. 6,30 − 2,75 = 3,55.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `[Dasar] Hitung: −1/2 + 1/5. ${FRAC}`,
            answer: "-3/10",
            explanation: "−1/2 = −5/10 dan 1/5 = 2/10. −5/10 + 2/10 = −3/10. Tanda berbeda: kurangkan, lalu pakai tanda bilangan yang lebih jauh dari nol.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `[Menengah] Hitung: 3⅓ − 1¾. ${FRAC}`,
            answer: "19/12",
            explanation: "Ubah ke pecahan biasa: 10/3 − 7/4 = 40/12 − 21/12 = 19/12 (= 1 7/12). Taksiran: 3,3 − 1,8 ≈ 1,5, cocok.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "[Menengah] Taksiran terbaik untuk 4⅞ + 2⅒ adalah…",
            options: ["sekitar 5", "sekitar 6", "sekitar 7", "sekitar 8"],
            answer: "C",
            explanation: "4⅞ hampir 5 dan 2⅒ hampir 2. Taksirannya 5 + 2 = 7. Hasil tepatnya 6,975.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `[Menengah] Sebuah botol berisi 1,5 liter air. Dina minum 0,35 liter, lalu ¾ liter lagi. Berapa liter air yang tersisa? ${DEC}`,
            answer: 0.4,
            explanation: "¾ liter = 0,75 liter. 1,5 − 0,35 − 0,75 = 0,4 liter.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `[Tantangan] Isi kotaknya:  □ − 2/3 = −5/6. ${FRAC}`,
            answer: "-1/6",
            explanation: "Kebalikan dari mengurangi 2/3 adalah menambah 2/3: □ = −5/6 + 2/3 = −5/6 + 4/6 = −1/6. Cek: −1/6 − 4/6 = −5/6.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "[Tantangan] Senin Pak Ahmad mengecat 2/5 bagian dinding, dan Selasa 3/10 bagian lagi. Lalu hujan merusak cat seluas 1/4 bagian dinding sehingga bagian itu harus dicat ulang. Berapa persen dinding yang catnya masih bagus? Tulis angkanya saja.",
            answer: 45,
            explanation: "KPK(5, 10, 4) = 20. 2/5 + 3/10 − 1/4 = 8/20 + 6/20 − 5/20 = 9/20 = 45/100 = 45%.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 10 ─────────────────────────────
    {
      title: "Sesi 10 — Perkalian & Pembagian Bilangan Rasional",
      blocks: [
        intro(
          "Perkalian & Pembagian Bilangan Rasional",
          [
            "Mengalikan dengan ½ membuat bilangan **lebih kecil**, dan membagi dengan ½ membuatnya **lebih besar**. Terdengar aneh? Setelah sesi ini tidak lagi.",
            "",
            "Kamu akan melihat perkalian pecahan sebagai luas persegi panjang, dan pembagian sebagai pertanyaan \"berapa banyak yang muat?\".",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 2 Subbab C.2 (hal. 62–73). PDF ini 8 halaman."
        ),
        { type: "PDF", dir: "bab2-sesi10", fileName: "Bab2-Sesi10-Perkalian-Pembagian.pdf" },
        closing(
          [
            "mengalikan pecahan dan menyederhanakan silang sebelum mengalikan,",
            "membagi pecahan dengan mengalikan kebalikan pembaginya,",
            "mengalikan dan membagi pecahan campuran dan bilangan negatif,",
            "mengalikan dan membagi desimal dengan menggeser koma,",
            "menebak apakah hasilnya akan lebih besar atau lebih kecil sebelum menghitung.",
          ],
          `Lanjut ke **Sesi 10 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 10 — Latihan Mandiri",
        questions: [
          {
            type: "FRACTION",
            points: 1,
            prompt: `[Dasar] Hitung: 2/5 × 15/8. ${FRAC}`,
            answer: "3/4",
            explanation: "Sederhanakan silang: 2 dengan 8 menjadi 1 dan 4, 15 dengan 5 menjadi 3 dan 1. Hasilnya (1 × 3)/(1 × 4) = 3/4.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `[Dasar] Hitung: 3/7 : 9/14. ${FRAC}`,
            answer: "2/3",
            explanation: "Kalikan dengan kebalikan pembagi: 3/7 × 14/9 = 42/63 = 2/3.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `[Dasar] Hitung: 1,2 × 0,05. ${DEC}`,
            answer: 0.06,
            explanation: "12 × 5 = 60. Banyak angka di belakang koma 1 + 2 = 3, jadi 0,060 = 0,06.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Kebalikan dari −2½ adalah…",
            options: ["−2/5", "2/5", "5/2", "−5/2"],
            answer: "A",
            explanation: "−2½ = −5/2. Kebalikannya −2/5, karena −5/2 × (−2/5) = 1. Tandanya tidak berubah.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "[Menengah] Hitung: 4,8 : 0,06",
            answer: 80,
            explanation: "Geser koma dua langkah pada keduanya supaya pembaginya bulat: 480 : 6 = 80.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `[Menengah] Hitung: −1¼ × 2⅖. ${NEG}`,
            answer: -3,
            explanation: "−5/4 × 12/5 = −60/20 = −3. Positif kali negatif menghasilkan negatif.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "[Menengah] Sebotol sirup berisi 2¼ liter dituang ke gelas-gelas kecil, masing-masing 3/8 liter. Berapa gelas yang terisi penuh?",
            answer: 6,
            explanation: "\"Berapa yang muat\" berarti bagi: 9/4 : 3/8 = 9/4 × 8/3 = 72/12 = 6 gelas.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 3,
            prompt: "[Tantangan] Manakah yang hasilnya PALING BESAR?",
            options: ["75 × 0,98", "75 : 0,98", "75 × 1,02", "75 : 1,02"],
            answer: "B",
            explanation: "Kali 0,98 dan bagi 1,02 memperkecil, jadi pilihannya tinggal dua. 75 × 1,02 = 76,5, sedangkan 75 : 0,98 ≈ 76,53. Membagi dengan 0,98 sedikit lebih besar daripada mengalikan dengan 1,02.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: `[Tantangan] Sebuah pita dipakai 5/6 bagiannya untuk hiasan. Sisanya 1,2 m. Berapa meter panjang pita mula-mula? ${DEC}`,
            answer: 7.2,
            explanation: "Sisa = 1 − 5/6 = 1/6 bagian = 1,2 m. Jadi seluruh pita 1,2 : 1/6 = 1,2 × 6 = 7,2 m.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 11 ─────────────────────────────
    {
      title: "Sesi 11 — Pengayaan: Persen, Pembulatan & Python",
      blocks: [
        {
          type: "MARKDOWN",
          markdown: [
            "## Pengayaan: Persen, Pembulatan & Python",
            "",
            "Sesi ini **pengayaan**: memakai semua operasi bilangan rasional untuk hal yang kamu temui setiap hari, yaitu **diskon, kenaikan harga, tabungan, dan pembulatan**, lalu melihat bagaimana **Python** menyimpan bilangan desimal.",
            "",
            "Baca PDF-nya dulu, lalu jalankan kode di editor di bawah PDF. Tebak hasilnya sebelum menekan *Run*!",
            "",
            "> 📘 Perluasan Buku Siswa Matematika Kelas VII, Bab 2. PDF ini 7 halaman.",
          ].join("\n"),
        },
        { type: "PDF", dir: "bab2-pengayaan", fileName: "Bab2-Pengayaan-Persen-Python.pdf" },
        {
          type: "MARKDOWN",
          markdown: [
            "## Coba Sendiri: Promo Mana yang Paling Murah?",
            "",
            "Ini soal stimulus di PDF, dihitung oleh Python. Ubah `harga` dan persen diskonnya. Pada harga berapa Toko C mulai kalah murah dari Toko A?",
          ].join("\n"),
        },
        {
          type: "CODE_EDITOR",
          starterCode: [
            "harga = 160000",
            "",
            "toko_a = harga * (1 - 25/100)",
            "toko_b = harga * (1 - 15/100) * (1 - 10/100)   # kalikan faktornya!",
            "toko_c = harga - 20000 if harga >= 100000 else harga",
            "",
            "print('Toko A:', round(toko_a))",
            "print('Toko B:', round(toko_b))",
            "print('Toko C:', round(toko_c))",
            "",
          ].join("\n"),
        },
        {
          type: "MARKDOWN",
          markdown: [
            "## Coba Sendiri: Float atau Fraction?",
            "",
            "Baris pertama hasilnya aneh. Kenapa? Lalu lihat bagaimana `Fraction` menghitung pecahan dengan persis, seperti di Sesi 9 dan 10.",
          ].join("\n"),
        },
        {
          type: "CODE_EDITOR",
          starterCode: [
            "print(0.1 + 0.2)              # bukan 0.3 persis!",
            "print(round(0.1 + 0.2, 2))",
            "print(round(2.5), round(3.5))  # pembulatan ke genap",
            "",
            "from fractions import Fraction",
            "a = Fraction(1, 3)",
            "b = Fraction(1, 4)",
            "print(a + b)                  # 7/12",
            "print(Fraction(3, 4) / Fraction(3, 8))",
            "print(float(Fraction(7, 8)))",
            "",
          ].join("\n"),
        },
        {
          type: "MARKDOWN",
          markdown: [
            "---",
            "",
            "Lanjut ke **Sesi 11 — Latihan Mandiri** (10 soal, termasuk 1 soal kode). Untuk jawaban rupiah, tulis angkanya tanpa titik ribuan, misalnya `42000`.",
            "",
            "Setelah itu, uji seluruh Bab 2 dengan **Latihan Penguasaan**, **Drill Kilat**, dua **Try Out**, dan **Ujian — Bab 2**. 🎉",
          ].join("\n"),
        },
      ],
      quiz: {
        title: "Sesi 11 — Latihan Mandiri",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "[Dasar] Berapa 12% dari Rp350.000? Tulis angkanya tanpa titik ribuan, misalnya 42000.",
            answer: 42000,
            explanation: "12/100 × 350.000 = 0,12 × 350.000 = 42.000. Trik: 10% = 35.000 dan 2% = 7.000, jumlahnya 42.000.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `[Dasar] Bulatkan 3,4567 ke dua angka desimal. ${DEC}`,
            answer: 3.46,
            explanation: "Angka desimal ketiga adalah 6 (5 atau lebih), jadi angka kedua naik: 3,45 → 3,46.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "[Dasar] Harga sebuah tas Rp80.000 naik 15%. Berapa harga barunya dalam rupiah? Tulis tanpa titik ribuan, misalnya 42000.",
            answer: 92000,
            explanation: "Naik 15% berarti dikali 1,15. 80.000 × 1,15 = 92.000.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "[Dasar] Diskon 40% berarti harga awal dikalikan dengan…",
            options: ["0,4", "0,6", "1,4", "40"],
            answer: "B",
            explanation: "Pembeli membayar 100% − 40% = 60% dari harga awal, yaitu dikali 0,6.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "[Menengah] Sebuah barang didiskon 20%, lalu mendapat diskon tambahan 25% dari harga setelah diskon pertama. Berapa persen diskon totalnya? Tulis angkanya saja.",
            answer: 40,
            explanation: "Kalikan faktornya: 0,8 × 0,75 = 0,6. Pembeli membayar 60%, jadi diskon totalnya 40%, bukan 45%.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "[Menengah] Harga paket data naik dari Rp50.000 menjadi Rp56.000. Berapa persen kenaikannya? Tulis angkanya saja.",
            answer: 12,
            explanation: "Kenaikan 6.000 dibagi harga LAMA: 6.000/50.000 × 100% = 12%.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "[Menengah] Apa keluaran kode Python  print(round(4.5)) ?",
            options: ["4", "5", "4.5", "5.0"],
            answer: "A",
            explanation: "round() di Python membulatkan angka yang tepat di tengah ke bilangan GENAP terdekat. 4,5 ada di tengah 4 dan 5, dan 4 genap. round() tanpa angka desimal menghasilkan bilangan bulat, jadi bukan 5.0.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "[Tantangan] Setelah naik 25%, harga sebuah sepatu menjadi Rp60.000. Berapa harga sebelum naik, dalam rupiah? Tulis tanpa titik ribuan.",
            answer: 48000,
            explanation: "Harga lama × 1,25 = 60.000, jadi harga lama = 60.000 : 1,25 = 48.000. Bukan 60.000 − 25% × 60.000 = 45.000, karena 25% dihitung dari harga lama.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "[Tantangan] Rina menabung Rp1.000.000 dengan bunga 6% per tahun. Bunga tidak ikut dibungakan. Berapa total tabungannya setelah 8 bulan, dalam rupiah? Tulis tanpa titik ribuan.",
            answer: 1040000,
            explanation: "Bunga setahun 6% × 1.000.000 = 60.000. Untuk 8 bulan: 8/12 × 60.000 = 40.000. Totalnya 1.040.000.",
          },
          {
            type: "CODE",
            points: 4,
            prompt:
              "[Tantangan] Tulis program yang membaca dua bilangan bulat dari input, masing-masing di barisnya sendiri: harga (dalam rupiah) lalu persen diskon. Cetak harga setelah diskon sebagai bilangan bulat, tanpa \".0\".\n\nContoh: input 160000 lalu 25 → keluaran 120000",
            tests: [
              { input: "160000\n25", expectedOutput: "120000" },
              { input: "250000\n30", expectedOutput: "175000" },
              { input: "99000\n10", expectedOutput: "89100" },
              { input: "45000\n0", expectedOutput: "45000" },
            ],
            explanation:
              "harga = int(input())\ndiskon = int(input())\nprint(harga * (100 - diskon) // 100)\n\nMengalikan dengan (100 − diskon) lalu membagi 100 dengan // menjaga semuanya bilangan bulat. Cara lain: print(round(harga * (1 - diskon / 100))).",
          },
        ],
      },
    },
  ],
};
