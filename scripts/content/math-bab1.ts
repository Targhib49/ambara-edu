/**
 * Intermediate Math — Bab 1: Bilangan Bulat, book-style remake (Sept 2026).
 * Consumed by scripts/setup-math-bab1.ts. Each Sesi = intro markdown → inline
 * PDF (built from `Mid Math/Buku/<dir>`) → self-check markdown, plus a
 * lesson-linked "Latihan Mandiri" quiz. Quiz items are new — they never repeat
 * the practice questions printed (with answers) in the PDFs.
 *
 * Quiz prompts render as plain text, so maths uses Unicode (−, ², ×), not LaTeX.
 */

type Letter = "A" | "B" | "C" | "D";
export type QuestionSpec =
  | { type: "MULTIPLE_CHOICE"; prompt: string; points: number; options: string[]; answer: Letter; explanation: string }
  | { type: "MULTI_SELECT"; prompt: string; points: number; options: string[]; answer: Letter[]; explanation: string }
  | { type: "NUMERIC"; prompt: string; points: number; answer: number; explanation: string }
  | { type: "CODE"; prompt: string; points: number; tests: { input: string; expectedOutput: string }[]; explanation: string };

export type BlockSpec =
  | { type: "MARKDOWN"; markdown: string }
  | { type: "PDF"; dir: string; fileName: string }
  | { type: "CODE_EDITOR"; starterCode: string };

export type SesiSpec = { title: string; blocks: BlockSpec[]; quiz: { title: string; questions: QuestionSpec[] } };

const NEG_FORMAT = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";

const closing = (items: string[], quizNote: string) =>
  [
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
  ].join("\n");

export const CHAPTER_TITLE = "Bab 1: Bilangan Bulat";

export const SESI: SesiSpec[] = [
  // ───────────────────────────── Sesi 1 ─────────────────────────────
  {
    title: "Sesi 1 — Memahami Bilangan Bulat",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## Memahami Bilangan Bulat",
          "",
          "Di SD kamu memakai bilangan untuk **menghitung**. Sekarang kita memakai bilangan untuk **mengukur dari titik acuan**, misalnya suhu di bawah nol, lantai basement, atau utang.",
          "",
          "**Cara belajar sesi ini**",
          "1. Kerjakan kotak *Coba Tebak Dulu* di halaman pertama **sebelum** membaca lebih jauh.",
          "2. Baca Bagian 1–4. Setiap kali ada *Cek Cepat*, berhenti dan kerjakan dulu.",
          "3. Kerjakan Latihan, lalu cocokkan dengan kunci jawaban di halaman terakhir.",
          "",
          "> 📘 Selaras dengan Buku Siswa Matematika Kelas VII, Bab 1 Subbab A (hal. 5–11). PDF ini ±10 halaman.",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-sesi1", fileName: "Bab1-Sesi1-Memahami-Bilangan-Bulat.pdf" },
      {
        type: "MARKDOWN",
        markdown: closing(
          [
            "mengubah kalimat sehari-hari menjadi bilangan bulat positif atau negatif,",
            "menggambar garis bilangan dengan jarak yang benar,",
            "menjelaskan **kenapa** −18 < −5,",
            "mengurutkan campuran bilangan negatif, nol, dan positif.",
          ],
          `Lanjut ke **Sesi 1 — Latihan Mandiri** (9 soal). ${NEG_FORMAT} 💪`
        ),
      },
    ],
    quiz: {
      title: "Sesi 1 — Latihan Mandiri",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Bilangan bulat yang tepat untuk \"penyelam berada 25 m di bawah permukaan laut\" adalah…",
          options: ["25", "−25", "0", "−2,5"],
          answer: "B",
          explanation: "\"Di bawah\" permukaan laut (titik acuan 0) berarti arah negatif, dengan jarak 25.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Manakah pernyataan yang benar?",
          options: ["−9 > −4", "0 < −3", "−4 > −9", "−1 < −10"],
          answer: "C",
          explanation: "−4 lebih dekat ke nol daripada −9, jadi −4 terletak lebih ke kanan dan lebih besar.",
        },
        {
          type: "MULTI_SELECT",
          points: 1,
          prompt: "[Dasar] Pilih SEMUA bilangan cacah.",
          options: ["−3", "0", "7", "−7"],
          answer: ["B", "C"],
          explanation: "Bilangan cacah adalah 0, 1, 2, 3, … Bilangan negatif bukan bilangan cacah.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Bilangan 0 adalah…",
          options: ["bilangan bulat positif", "bilangan bulat negatif", "bukan bilangan bulat", "bilangan bulat yang tidak positif dan tidak negatif"],
          answer: "D",
          explanation: "0 adalah bilangan bulat (juga bilangan cacah) dan menjadi batas antara bilangan positif dan negatif.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: `[Menengah] Bilangan 5, −12, 0, −3, 8 diurutkan dari yang terkecil. Bilangan pada urutan KEDUA adalah… ${NEG_FORMAT}`,
          answer: -3,
          explanation: "Urutannya −12, −3, 0, 5, 8. Negatif diurutkan dari jarak ke nol yang terbesar.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Ada berapa bilangan bulat yang lebih besar dari −4 dan lebih kecil dari 3?",
          answer: 6,
          explanation: "−3, −2, −1, 0, 1, 2. Jumlahnya 6. −4 dan 3 tidak termasuk.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 2,
          prompt: "[Menengah] Pada suatu pagi, suhu di empat kota adalah: Kota P 27 °C, Kota Q −8 °C, Kota R −3 °C, Kota S −12 °C. Kota mana yang paling dingin?",
          options: ["Kota P", "Kota Q", "Kota R", "Kota S"],
          answer: "D",
          explanation: "Paling dingin = bilangan terkecil = paling kiri pada garis bilangan, yaitu −12.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: `[Tantangan] Sebuah bilangan bulat berjarak 6 satuan dari nol dan terletak di sebelah kiri −2 pada garis bilangan. Bilangan berapakah itu? ${NEG_FORMAT}`,
          answer: -6,
          explanation: "Jarak 6 dari nol berarti 6 atau −6. Yang terletak di kiri −2 hanya −6.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 3,
          prompt: "[Tantangan] a dan b adalah bilangan bulat negatif dengan a < b. Pernyataan yang PASTI benar adalah…",
          options: [
            "Jarak a ke nol lebih besar daripada jarak b ke nol",
            "Jarak a ke nol lebih kecil daripada jarak b ke nol",
            "Jarak a dan b ke nol sama",
            "a lebih dekat ke nol daripada b",
          ],
          answer: "A",
          explanation: "Untuk dua bilangan negatif, yang lebih kecil terletak lebih jauh ke kiri, jadi lebih jauh dari nol.",
        },
      ],
    },
  },

  // ───────────────────────────── Sesi 2 ─────────────────────────────
  {
    title: "Sesi 2 — Penjumlahan & Pengurangan Bilangan Bulat",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## Penjumlahan & Pengurangan Bilangan Bulat",
          "",
          "Sesi ini memakai dua alat: **garis bilangan sebagai langkah** dan **keping** (🔵 = +1, 🔴 = −1). Satu keping biru dan satu keping merah saling menghapus menjadi *pasangan nol*.",
          "",
          "Dengan dua alat itu, kamu tidak perlu menghafal \"min ketemu min\". Kamu akan melihat sendiri kenapa **5 − (−3) = 8**.",
          "",
          "> 💡 Siapkan kertas coretan. Menggambar keping sendiri jauh lebih membantu daripada hanya membaca.",
          "",
          "> 📘 Selaras dengan Buku Siswa Matematika Kelas VII, Bab 1 Subbab B.1 (hal. 12–16).",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-sesi2", fileName: "Bab1-Sesi2-Penjumlahan-Pengurangan.pdf" },
      {
        type: "MARKDOWN",
        markdown: closing(
          [
            "menjelaskan pasangan nol dan lawan: a + (−a) = 0,",
            "menjumlahkan dua bilangan bertanda sama dan bertanda berbeda,",
            "mengubah pengurangan menjadi \"tambah lawannya\",",
            "mengecek jawaban dengan estimasi atau konteks (suhu, utang, kedalaman).",
          ],
          `Lanjut ke **Sesi 2 — Latihan Mandiri** (9 soal). ${NEG_FORMAT} 💪`
        ),
      },
    ],
    quiz: {
      title: "Sesi 2 — Latihan Mandiri",
      questions: [
        { type: "NUMERIC", points: 1, prompt: `[Dasar] Hitung: −8 + 3. ${NEG_FORMAT}`, answer: -5, explanation: "Tanda berbeda: 8 − 3 = 5, ikut tanda −8. Hasilnya −5." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: −6 + (−9)", answer: -15, explanation: "Tanda sama: jumlahkan jaraknya (6 + 9 = 15), tanda tetap negatif." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: 4 − 11", answer: -7, explanation: "4 − 11 = 4 + (−11). Tanda berbeda: 11 − 4 = 7, ikut tanda −11." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: 7 − (−5)", answer: 12, explanation: "Mengurangi −5 berarti menambah lawannya: 7 + 5 = 12." },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Suhu mula-mula −4 °C. Suhu naik 10 derajat, lalu turun 9 derajat. Berapa suhu akhirnya (dalam °C)?",
          answer: -3,
          explanation: "−4 + 10 + (−9) = 6 + (−9) = −3.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Suhu siang hari 6 °C dan suhu malam hari −11 °C. Berapa derajat selisih kedua suhu itu?",
          answer: 17,
          explanation: "6 − (−11) = 6 + 11 = 17. Pada garis bilangan, dari −11 ke 6 ada 17 langkah.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 2,
          prompt: "[Menengah] Manakah pernyataan yang BENAR untuk semua bilangan bulat?",
          options: ["5 − 8 = 8 − 5", "(−3) + 7 = 7 + (−3)", "(10 − 4) − 3 = 10 − (4 − 3)", "−4 + (−6) = 10"],
          answer: "B",
          explanation: "Penjumlahan bersifat komutatif. Pengurangan tidak komutatif dan tidak asosiatif, dan −4 + (−6) = −10.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: `[Tantangan] Isi kotaknya: □ − (−12) = −5. Berapa nilai □? ${NEG_FORMAT}`,
          answer: -17,
          explanation: "□ + 12 = −5, jadi □ = −5 − 12 = −17. Cek: −17 − (−12) = −17 + 12 = −5.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: "[Tantangan] Kapal selam berada di −130 m. Kapal naik 45 m, turun 60 m, lalu naik 25 m. Berapa meter lagi kapal harus naik untuk sampai tepat di permukaan laut?",
          answer: 120,
          explanation: "Posisi: −130 + 45 + (−60) + 25 = −120. Dari −120 ke 0 perlu naik 120 m.",
        },
      ],
    },
  },

  // ───────────────────────────── Sesi 3 ─────────────────────────────
  {
    title: "Sesi 3 — Perkalian & Pembagian Bilangan Bulat",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## Perkalian & Pembagian Bilangan Bulat",
          "",
          "Kenapa negatif dikali negatif hasilnya **positif**? Sesi ini memberi tiga penjelasan: pola, lawan dari lawan, dan tandon air yang bocor. Pilih yang paling meyakinkan buatmu.",
          "",
          "Setelah itu kita bahas pembagian (termasuk kenapa **pembagian dengan nol tidak terdefinisi**) dan urutan operasi.",
          "",
          "> ⚠️ Aturan \"tanda sama → positif\" **hanya** berlaku untuk × dan :. Jangan dibawa ke penjumlahan!",
          "",
          "> 📘 Selaras dengan Buku Siswa Matematika Kelas VII, Bab 1 Subbab B.2 (hal. 16–21).",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-sesi3", fileName: "Bab1-Sesi3-Perkalian-Pembagian.pdf" },
      {
        type: "MARKDOWN",
        markdown: closing(
          [
            "menjelaskan kenapa (−3) × (−4) = 12 dengan salah satu dari tiga cara,",
            "menentukan tanda hasil kali banyak bilangan dengan menghitung faktor negatif,",
            "mengecek pembagian dengan perkalian, dan tahu kenapa 5 : 0 tidak terdefinisi,",
            "mengerjakan operasi campuran dengan urutan yang benar.",
          ],
          `Lanjut ke **Sesi 3 — Latihan Mandiri** (9 soal). ${NEG_FORMAT} 💪`
        ),
      },
    ],
    quiz: {
      title: "Sesi 3 — Latihan Mandiri",
      questions: [
        { type: "NUMERIC", points: 1, prompt: `[Dasar] Hitung: (−7) × 8. ${NEG_FORMAT}`, answer: -56, explanation: "Tanda berbeda → negatif. 7 × 8 = 56." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: (−63) : (−9)", answer: 7, explanation: "Tanda sama → positif. 63 : 9 = 7. Cek: (−9) × 7 = −63." },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Tanpa menghitung, tanda hasil dari (−2) × (−3) × (−4) × (−5) × (−1) adalah…",
          options: ["positif", "negatif", "nol", "tidak dapat ditentukan"],
          answer: "B",
          explanation: "Ada 5 faktor negatif (ganjil), jadi hasilnya negatif (−120).",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] 12 : 0 = …",
          options: ["0", "12", "tidak terdefinisi", "1"],
          answer: "C",
          explanation: "Tidak ada bilangan yang jika dikali 0 hasilnya 12. Yang bernilai 0 adalah 0 : 12.",
        },
        { type: "NUMERIC", points: 2, prompt: "[Menengah] Hitung: −10 + 4 × (−3)", answer: -22, explanation: "Kali dulu: 4 × (−3) = −12. Lalu −10 + (−12) = −22." },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Suhu sebuah ruang pendingin mula-mula 5 °C, lalu turun 4 derajat setiap jam selama 6 jam. Berapa suhunya sekarang (dalam °C)?",
          answer: -19,
          explanation: "5 + 6 × (−4) = 5 + (−24) = −19.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Pada sebuah tes berisi 25 soal, jawaban benar bernilai +3, salah −1, dan tidak dijawab 0. Doni menjawab 16 soal dengan benar dan 6 soal salah. Berapa nilai Doni?",
          answer: 42,
          explanation: "16 × 3 + 6 × (−1) + 3 × 0 = 48 − 6 = 42.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: `[Tantangan] Dua bilangan bulat mempunyai hasil kali −18 dan jumlah 3. Berapakah bilangan yang LEBIH KECIL? ${NEG_FORMAT}`,
          answer: -3,
          explanation: "6 × (−3) = −18 dan 6 + (−3) = 3. Yang lebih kecil adalah −3.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: "[Tantangan] Hitung: (−48) : (−6) × (−2) − (−20) : 4",
          answer: -11,
          explanation: "Kali dan bagi dari kiri: (−48) : (−6) = 8, lalu 8 × (−2) = −16. Lalu (−20) : 4 = −5. Terakhir −16 − (−5) = −11.",
        },
      ],
    },
  },

  // ───────────────────────────── Sesi 4 ─────────────────────────────
  {
    title: "Sesi 4 — Faktor, Bilangan Prima & Faktorisasi Prima",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## Faktor, Bilangan Prima & Faktorisasi Prima",
          "",
          "24 cokelat bisa ditata rapi dengan beberapa cara, tetapi 23 cokelat hanya bisa dijejer satu baris panjang. Kenapa? Jawabannya adalah **bilangan prima**, \"batu bata\" pembentuk semua bilangan.",
          "",
          "Di sesi ini kamu akan mencari faktor dengan cepat (termasuk faktor negatif), mengenali bilangan prima, dan memecah bilangan menjadi faktorisasi prima. Faktorisasi prima akan sangat dibutuhkan di Sesi 5.",
          "",
          "> 📘 Selaras dengan Buku Siswa Matematika Kelas VII, Bab 1 Subbab C.1 (hal. 22–25).",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-sesi4", fileName: "Bab1-Sesi4-Faktor-Bilangan-Prima.pdf" },
      {
        type: "MARKDOWN",
        markdown: closing(
          [
            "mendaftar semua faktor sebuah bilangan dengan strategi berpasangan,",
            "memakai ciri habis dibagi 2, 3, 5, 9, dan 10,",
            "menjelaskan kenapa 1 bukan bilangan prima,",
            "membuat pohon faktor dan menuliskan faktorisasi prima dalam bentuk pangkat.",
          ],
          "Lanjut ke **Sesi 4 — Latihan Mandiri** (9 soal). Untuk soal isian, tulis bilangannya saja (tanpa titik ribuan). 💪"
        ),
      },
    ],
    quiz: {
      title: "Sesi 4 — Latihan Mandiri",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Ada berapa banyak faktor positif dari 30?", answer: 8, explanation: "1, 2, 3, 5, 6, 10, 15, 30. Jumlahnya 8." },
        {
          type: "MULTI_SELECT",
          points: 1,
          prompt: "[Dasar] Pilih SEMUA bilangan prima.",
          options: ["21", "23", "27", "31"],
          answer: ["B", "D"],
          explanation: "21 = 3 × 7 dan 27 = 3 × 9 adalah komposit. 23 dan 31 hanya punya faktor 1 dan dirinya sendiri.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Faktorisasi prima dari 72 adalah…",
          options: ["2³ × 3²", "2² × 3³", "8 × 9", "2 × 36"],
          answer: "A",
          explanation: "72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3². Pilihan C dan D bukan faktorisasi prima karena 8, 9, dan 36 bukan bilangan prima.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Bilangan 1 adalah…",
          options: ["bilangan prima", "bilangan komposit", "bukan bilangan prima dan bukan bilangan komposit", "satu-satunya bilangan prima ganjil"],
          answer: "C",
          explanation: "Bilangan prima harus punya tepat dua faktor, sedangkan 1 hanya punya satu faktor.",
        },
        {
          type: "MULTI_SELECT",
          points: 2,
          prompt: "[Menengah] Tanpa membagi, pilih SEMUA bilangan yang habis dibagi 3.",
          options: ["4.512", "2.021", "7.305", "1.000"],
          answer: ["A", "C"],
          explanation: "Jumlah angka: 4+5+1+2 = 12 ✓, 2+0+2+1 = 5 ✗, 7+3+0+5 = 15 ✓, 1+0+0+0 = 1 ✗.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Ada berapa pasangan faktor bilangan bulat dari 20, termasuk pasangan negatif? (Urutan tidak diperhatikan: (2, 10) dan (10, 2) dihitung satu.)",
          answer: 6,
          explanation: "(1, 20), (2, 10), (4, 5), (−1, −20), (−2, −10), (−4, −5).",
        },
        { type: "NUMERIC", points: 2, prompt: "[Menengah] Sebuah bilangan mempunyai faktorisasi prima 2² × 3 × 11. Bilangan berapakah itu?", answer: 132, explanation: "4 × 3 × 11 = 132." },
        {
          type: "NUMERIC",
          points: 3,
          prompt: "[Tantangan] Berapakah bilangan terbesar yang kurang dari 100 dan mempunyai TEPAT TIGA faktor positif?",
          answer: 49,
          explanation: "Bilangan dengan tepat tiga faktor adalah kuadrat bilangan prima: 4, 9, 25, 49, 121, … Yang terbesar di bawah 100 adalah 49 = 7² (faktornya 1, 7, 49).",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 3,
          prompt: "[Tantangan] 56 siswa dibagi ke dalam beberapa kelompok yang sama besar. Setiap kelompok berisi paling sedikit 5 dan paling banyak 10 siswa. Ada berapa macam ukuran kelompok yang mungkin?",
          options: ["1", "2", "3", "4"],
          answer: "B",
          explanation: "Faktor 56: 1, 2, 4, 7, 8, 14, 28, 56. Yang berada di antara 5 dan 10 hanya 7 dan 8.",
        },
      ],
    },
  },

  // ───────────────────────────── Sesi 5 ─────────────────────────────
  {
    title: "Sesi 5 — FPB & KPK",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## FPB & KPK",
          "",
          "Dua soal dengan bilangan yang mirip bisa menanyakan hal yang sangat berbeda:",
          "",
          "- *Membagi rata sebanyak mungkin* → mencari bilangan yang **membagi** → **FPB**",
          "- *Kapan terjadi bersamaan lagi* → mencari bilangan yang **dibagi** → **KPK**",
          "",
          "Kesulitan terbesar biasanya bukan menghitung, tetapi **memilih** FPB atau KPK. Perhatikan tabel panduan di Bagian 4 PDF.",
          "",
          "> 📘 Selaras dengan Buku Siswa Matematika Kelas VII, Bab 1 Subbab C (FPB dan KPK, hal. 26–30).",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-sesi5", fileName: "Bab1-Sesi5-FPB-KPK.pdf" },
      {
        type: "MARKDOWN",
        markdown: closing(
          [
            "menentukan FPB dan KPK dengan mendaftar,",
            "menentukan FPB dan KPK dengan faktorisasi prima (pangkat terkecil vs terbesar),",
            "memilih FPB atau KPK dari kalimat soal cerita,",
            "mengecek jawaban: FPB ≤ bilangan terkecil, KPK ≥ bilangan terbesar.",
          ],
          "Lanjut ke **Sesi 5 — Latihan Mandiri** (9 soal). Tulis jawaban isian sebagai bilangan saja. 💪"
        ),
      },
    ],
    quiz: {
      title: "Sesi 5 — Latihan Mandiri",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Tentukan FPB dari 36 dan 48.", answer: 12, explanation: "36 = 2² × 3², 48 = 2⁴ × 3. FPB = 2² × 3 = 12." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Tentukan KPK dari 9 dan 12.", answer: 36, explanation: "9 = 3², 12 = 2² × 3. KPK = 2² × 3² = 36." },
        {
          type: "NUMERIC",
          points: 1,
          prompt: "[Dasar] Tentukan FPB dari 2⁴ × 3 × 5² dan 2² × 3² × 5.",
          answer: 60,
          explanation: "Ambil prima yang sama dengan pangkat terkecil: 2² × 3 × 5 = 60.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "[Dasar] Jika p dan q adalah dua bilangan prima yang berbeda, maka KPK(p, q) adalah…",
          options: ["1", "p + q", "p × q", "bilangan yang lebih besar di antara p dan q"],
          answer: "C",
          explanation: "Dua prima berbeda tidak punya faktor prima yang sama, jadi KPK-nya adalah hasil kali keduanya.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] 54 kue cokelat dan 72 kue keju dimasukkan ke dalam kotak sebanyak mungkin dengan isi setiap kotak sama. Berapa kotak yang diperlukan?",
          answer: 18,
          explanation: "FPB(54, 72) = 18. Setiap kotak berisi 3 kue cokelat dan 4 kue keju.",
        },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Lampu A menyala setiap 8 detik, lampu B setiap 12 detik, dan lampu C setiap 18 detik. Ketiganya baru saja menyala bersamaan. Setelah berapa detik ketiganya menyala bersamaan lagi?",
          answer: 72,
          explanation: "8 = 2³, 12 = 2² × 3, 18 = 2 × 3². KPK = 2³ × 3² = 72.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 2,
          prompt: "[Menengah] Masalah mana yang diselesaikan dengan KPK?",
          options: [
            "Memotong dua pita menjadi potongan sama panjang yang sepanjang mungkin",
            "Membagi apel dan jeruk ke parsel sebanyak mungkin dengan isi sama",
            "Menentukan kapan dua bus tiba di halte bersamaan lagi",
            "Mencari ukuran ubin persegi terbesar untuk sebuah lantai",
          ],
          answer: "C",
          explanation: "Kejadian berulang yang bertemu lagi → KPK. Ketiga pilihan lain adalah membagi atau memotong → FPB.",
        },
        {
          type: "NUMERIC",
          points: 3,
          prompt: "[Tantangan] FPB dua bilangan adalah 8 dan KPK-nya 120. Salah satu bilangannya 24. Berapa bilangan yang lain?",
          answer: 40,
          explanation: "FPB × KPK = a × b, jadi 8 × 120 = 24 × b, sehingga b = 40. Cek: FPB(24, 40) = 8, KPK(24, 40) = 120.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 3,
          prompt: "[Tantangan] Hari ini hari Selasa. Rina les musik setiap 4 hari dan berenang setiap 10 hari, dan hari ini ia melakukan keduanya. Pada hari apa ia pertama kali melakukan keduanya lagi?",
          options: ["Minggu", "Senin", "Selasa", "Rabu"],
          answer: "B",
          explanation: "KPK(4, 10) = 20 hari. 20 = 2 × 7 + 6, jadi dari Selasa maju 6 hari: Senin.",
        },
      ],
    },
  },

  // ─────────────────────────── Pengayaan ───────────────────────────
  {
    title: "Sesi 6 — Pengayaan: Perpangkatan, Sisa Pembagian & Python",
    blocks: [
      {
        type: "MARKDOWN",
        markdown: [
          "## Pengayaan: Perpangkatan, Sisa Pembagian & Python",
          "",
          "Sesi ini **pengayaan**: materinya tidak ada di subbab resmi Buku Siswa Bab 1, tetapi menghubungkan semua yang sudah kamu pelajari (perkalian, faktor, FPB/KPK) dengan **perpangkatan**, **sisa pembagian**, dan **Python**.",
          "",
          "Baca PDF-nya dulu, lalu jalankan kode di editor di bawah PDF. Ubah angkanya dan tebak hasilnya sebelum menekan *Run*!",
        ].join("\n"),
      },
      { type: "PDF", dir: "bab1-pengayaan", fileName: "Bab1-Pengayaan-Pangkat-Python.pdf" },
      {
        type: "MARKDOWN",
        markdown: [
          "## Coba Sendiri: Pangkat, Sisa, dan Hari",
          "",
          "Jalankan kode ini. Lalu ubah `100` menjadi `365`. Tahun depan, tanggal yang sama jatuh pada hari apa?",
        ].join("\n"),
      },
      {
        type: "CODE_EDITOR",
        starterCode: [
          "print(2 ** 10)        # 1024 lapis kertas",
          "print((-3) ** 2)      # 9",
          "print(-3 ** 2)        # -9, sama seperti di matematika!",
          "",
          "print(23 // 4, 23 % 4)   # hasil bagi dan sisa",
          "",
          'hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]',
          "print(hari[100 % 7])     # hari ke-100 setelah Senin",
          "",
        ].join("\n"),
      },
      {
        type: "MARKDOWN",
        markdown: [
          "## Coba Sendiri: FPB & KPK dengan Python",
          "",
          "Ganti nilai `a` dan `b` dengan soal-soal dari Sesi 5, lalu cocokkan dengan jawabanmu.",
        ].join("\n"),
      },
      {
        type: "CODE_EDITOR",
        starterCode: [
          "import math",
          "",
          "a, b = 24, 36",
          "fpb = math.gcd(a, b)     # gcd = FPB",
          "kpk = a * b // fpb       # FPB x KPK = a x b",
          "print('FPB =', fpb)",
          "print('KPK =', kpk)",
          "",
          "# Tantangan: cek genap atau ganjil dengan sisa pembagian",
          "n = 84",
          "print(n % 2 == 0)",
          "",
        ].join("\n"),
      },
      {
        type: "MARKDOWN",
        markdown: [
          "---",
          "",
          "Lanjut ke **Sesi 6 — Latihan Mandiri** (10 soal, termasuk 1 soal kode). Setelah itu, uji seluruh Bab 1 dengan **Try Out — Bab 1**. 🎉",
        ].join("\n"),
      },
    ],
    quiz: {
      title: "Sesi 6 — Latihan Mandiri",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: (−3)⁴", answer: 81, explanation: "Empat faktor negatif (genap) → positif. 3⁴ = 81." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: −2⁶ (perhatikan: tanpa kurung). Tulis bilangan negatif dengan tanda minus, misalnya -7.", answer: -64, explanation: "Tanpa kurung, basisnya 2: −(2⁶) = −64." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Berapa sisa pembagian 100 oleh 7?", answer: 2, explanation: "100 = 7 × 14 + 2." },
        { type: "NUMERIC", points: 1, prompt: "[Dasar] Hitung: 7⁰ + 0⁵", answer: 1, explanation: "7⁰ = 1 dan 0⁵ = 0. Jumlahnya 1." },
        {
          type: "NUMERIC",
          points: 2,
          prompt: "[Menengah] Apa keluaran dari kode Python berikut?  print(47 // 5 + 47 % 5)",
          answer: 11,
          explanation: "47 // 5 = 9 dan 47 % 5 = 2. Jumlahnya 11.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 2,
          prompt: "[Menengah] Hari ini hari Jumat. Hari apakah 30 hari lagi?",
          options: ["Sabtu", "Minggu", "Senin", "Jumat"],
          answer: "B",
          explanation: "30 = 7 × 4 + 2. Empat minggu kembali ke Jumat, lalu maju 2 hari: Minggu.",
        },
        { type: "NUMERIC", points: 2, prompt: "[Menengah] Hitung: 2 × 3² − (−2)³", answer: 26, explanation: "Pangkat dulu: 3² = 9 dan (−2)³ = −8. Lalu 18 − (−8) = 26." },
        {
          type: "NUMERIC",
          points: 3,
          prompt: "[Tantangan] Berapakah angka satuan (angka terakhir) dari 3²¹?",
          answer: 3,
          explanation: "Angka satuan 3¹, 3², 3³, 3⁴ adalah 3, 9, 7, 1, berulang setiap 4. 21 = 4 × 5 + 1, jadi sama dengan 3¹: angka satuannya 3.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 3,
          prompt: "[Tantangan] Dalam Python, apa hasil dari  -7 // 2 ?",
          options: ["-3", "-4", "-3.5", "3"],
          answer: "B",
          explanation: "// membulatkan ke bawah pada garis bilangan. −3,5 dibulatkan ke bawah menjadi −4. Cek: −7 = 2 × (−4) + 1.",
        },
        {
          type: "CODE",
          points: 4,
          prompt:
            "[Tantangan] Tulis program yang membaca satu bilangan bulat n (boleh negatif) dari input, lalu mencetak \"genap\" jika n genap atau \"ganjil\" jika n ganjil. Gunakan operator sisa pembagian %.\n\nContoh: input 84 → keluaran genap",
          tests: [
            { input: "84", expectedOutput: "genap" },
            { input: "7", expectedOutput: "ganjil" },
            { input: "-3", expectedOutput: "ganjil" },
            { input: "0", expectedOutput: "genap" },
          ],
          explanation: "n = int(input())\nif n % 2 == 0:\n    print(\"genap\")\nelse:\n    print(\"ganjil\")\n\nDi Python, -3 % 2 menghasilkan 1, jadi bilangan negatif ganjil tetap terdeteksi dengan benar.",
        },
      ],
    },
  },
];
