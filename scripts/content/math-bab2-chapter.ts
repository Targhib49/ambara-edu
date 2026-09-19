/**
 * Intermediate Math — Bab 2: Bilangan Rasional, the chapter's closing sequence
 * (Sept 2026), read by scripts/setup-math-chapter.ts:
 *
 *   Sesi → Classic quiz (repeat) → 2 practices → 2 try-outs (standar + pengayaan) → 1 exam
 *
 * Practice = MASTERY over Sesi 7–11 + a fraction↔percent DRILL. The try-out
 * standar and the exam cover Sesi 7–10 (the Buku Siswa material); the try-out
 * pengayaan leans on Sesi 11 (persen, pembulatan, Python).
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

    // ─────────────────────────── Practice 2: Drill ───────────────────────────
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
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Sebuah barang didiskon 30%, lalu didiskon lagi 20% dari harga setelah diskon pertama. Diskon totalnya adalah…", options: ["50%", "44%", "56%", "40%"], answer: "B", explanation: "0,7 × 0,8 = 0,56. Pembeli membayar 56%, jadi diskon totalnya 44%." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Harga sebuah barang naik 20%, lalu turun 20%. Harga akhirnya…", options: ["sama dengan harga awal", "4% lebih rendah dari harga awal", "4% lebih tinggi dari harga awal", "20% lebih rendah dari harga awal"], answer: "B", explanation: "1,2 × 0,8 = 0,96. Harga akhir 96% dari harga awal, yaitu 4% lebih rendah. Turun 20% dihitung dari harga yang sudah naik." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran kode Python  print(0.1 * 3 == 0.3) ?", options: ["True", "False", "0.3", "Error"], answer: "B", explanation: "0.1 tidak bisa disimpan persis dalam float, sehingga 0.1 * 3 menghasilkan 0.30000000000000004, bukan 0.3." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran kode Python  print(round(0.125, 2)) ?", options: ["0.12", "0.13", "0.1", "0.125"], answer: "A", explanation: "0,125 tersimpan persis dan tepat di tengah 0,12 dan 0,13. Python membulatkan angka tengah ke angka akhir yang genap, jadi 0.12." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran kode Python berikut?\n\nfrom fractions import Fraction\nprint(Fraction(5, 6) - Fraction(1, 3))", options: ["1/2", "4/3", "0.5", "2/4"], answer: "A", explanation: "5/6 − 2/6 = 3/6. Fraction selalu menyederhanakan, jadi yang dicetak 1/2." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Hasil 7 : 3 dibulatkan ke dua angka desimal adalah…", options: ["2,33", "2,34", "2,3", "2,333"], answer: "A", explanation: "7 : 3 = 2,3333… Angka desimal ketiga 3 (kurang dari 5), jadi dibulatkan ke bawah: 2,33." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Tabungan Rp2.400.000 mendapat bunga 5% per tahun (bunga tidak ikut dibungakan). Besar bunga setiap bulannya adalah…", options: ["Rp10.000", "Rp12.000", "Rp120.000", "Rp100.000"], answer: "A", explanation: "Bunga setahun 5% × 2.400.000 = 120.000. Per bulan 120.000 : 12 = 10.000." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Setelah didiskon 35%, harga sebuah jaket menjadi Rp91.000. Harga jaket sebelum diskon adalah…", options: ["Rp140.000", "Rp122.850", "Rp126.000", "Rp135.000"], answer: "A", explanation: "Harga awal × 0,65 = 91.000, jadi harga awal = 91.000 : 0,65 = 140.000. Rp122.850 muncul jika 35% dihitung dari harga setelah diskon." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Bentuk desimal 1/7 adalah 0,142857142857… (angka 142857 berulang). Angka ke-20 di belakang koma adalah…", options: ["1", "4", "2", "8"], answer: "B", explanation: "Polanya berulang setiap 6 angka. 20 = 6 × 3 + 2, jadi angka ke-20 sama dengan angka ke-2, yaitu 4." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Jika x adalah bilangan dengan 0 < x < 1, manakah yang PASTI paling besar?", options: ["x", "x²", "1/x", "x/2"], answer: "C", explanation: "Untuk 0 < x < 1: x² dan x/2 lebih kecil dari x, sedangkan 1/x lebih besar dari 1. Contoh x = ½: x² = ¼, x/2 = ¼, 1/x = 2." },
        { type: "NUMERIC", points: 6, prompt: `Harga sebuah barang Rp240.000 naik 15%, lalu didiskon 10%. Berapa harga akhirnya dalam rupiah? ${RP}`, answer: 248400, explanation: "240.000 × 1,15 × 0,9 = 240.000 × 1,035 = 248.400." },
        { type: "NUMERIC", points: 6, prompt: "Pengunjung perpustakaan turun dari 1.250 orang menjadi 1.000 orang. Berapa persen penurunannya? Tulis angkanya saja.", answer: 20, explanation: "Penurunan 250 dibagi nilai LAMA: 250/1.250 × 100% = 20%." },
        { type: "FRACTION", points: 6, prompt: `Ubah 0,2333… (hanya angka 3 yang berulang) menjadi pecahan. ${FRAC}`, answer: "7/30", explanation: "x = 0,2333… 100x = 23,333… dan 10x = 2,333… Kurangkan: 90x = 21, jadi x = 21/90 = 7/30." },
        { type: "NUMERIC", points: 6, prompt: "Apa keluaran kode Python  print(7 / 4 * 2 - 0.5) ? Tulis nilainya.", answer: 3, explanation: "Dari kiri: 7 / 4 = 1.75, lalu 1.75 * 2 = 3.5, lalu 3.5 − 0.5 = 3.0." },
        { type: "NUMERIC", points: 6, prompt: `Hitung: (1 − 1/2) × (1 − 1/3) × (1 − 1/4) × … × (1 − 1/10). ${DEC}`, answer: 0.1, explanation: "Setiap faktor bernilai (k − 1)/k: 1/2 × 2/3 × 3/4 × … × 9/10. Pembilang dan penyebut saling mencoret, tersisa 1/10 = 0,1." },
        { type: "NUMERIC", points: 6, prompt: "Harga sebuah barang dinaikkan 25%. Agar kembali ke harga semula, harga baru harus diturunkan berapa persen? Tulis angkanya saja.", answer: 20, explanation: "Harga baru = 1,25 × harga awal. Supaya kembali, kalikan dengan 1/1,25 = 0,8, yaitu turun 20% (dari harga yang lebih besar)." },
        { type: "NUMERIC", points: 6, prompt: "Tabungan Rp3.000.000 menghasilkan bunga Rp135.000 dalam 9 bulan (bunga tidak ikut dibungakan). Berapa persen bunga per tahunnya? Tulis angkanya saja.", answer: 6, explanation: "Bunga per bulan 135.000 : 9 = 15.000, per tahun 180.000. 180.000/3.000.000 = 6%." },
        { type: "FRACTION", points: 6, prompt: `Hitung: 1/2 + 1/6 + 1/12 + 1/20 + 1/30. ${FRAC}`, answer: "5/6", explanation: "Setiap suku bisa ditulis sebagai selisih: 1/2 = 1 − 1/2, 1/6 = 1/2 − 1/3, dan seterusnya sampai 1/30 = 1/5 − 1/6. Hampir semua saling menghapus, tersisa 1 − 1/6 = 5/6." },
        { type: "NUMERIC", points: 6, prompt: "Apa keluaran kode Python  print(round(2.5) + round(3.5) + round(4.5)) ?", answer: 10, explanation: "Python membulatkan angka tengah ke bilangan genap: round(2.5) = 2, round(3.5) = 4, round(4.5) = 4. Jumlahnya 10." },
        { type: "NUMERIC", points: 6, prompt: "Sebuah toko memberi promo \"beli 3 gratis 1\" untuk kaos seharga Rp45.000. Jika membeli 4 kaos dengan promo ini, berapa persen diskon yang sebenarnya diterima? Tulis angkanya saja.", answer: 25, explanation: "Membayar 3 kaos untuk mendapat 4, jadi membayar 3/4 = 75% dari harga normal. Diskonnya 25%, berapa pun harga kaosnya." },
      ],
    },

    // ─────────────────────────── Exam ───────────────────────────
    {
      title: "Ujian — Bab 2: Bilangan Rasional",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bilangan berikut yang merupakan bilangan bulat negatif adalah…", options: ["−2/3", "−12/4", "−0,5", "−1,333…"], answer: "B", explanation: "−12/4 = −3, sebuah bilangan bulat. Tiga lainnya rasional tetapi bukan bilangan bulat." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pecahan yang bentuk desimalnya TERBATAS adalah…", options: ["2/15", "7/12", "11/40", "5/6"], answer: "C", explanation: "40 = 2³ × 5 hanya memuat faktor 2 dan 5, jadi 11/40 = 0,275. Penyebut lain memuat faktor 3." },
        { type: "MULTI_SELECT", points: 3, prompt: "Pilih SEMUA yang nilainya sama dengan 1,25.", options: ["5/4", "125%", "12/5", "1¼"], answer: ["A", "B", "D"], explanation: "5/4 = 1¼ = 1,25 = 125%. 12/5 = 2,4." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Urutan bilangan −0,25, −1/3, −2/9, dan 0 dari yang TERBESAR adalah…", options: ["0; −2/9; −0,25; −1/3", "0; −1/3; −0,25; −2/9", "−1/3; −0,25; −2/9; 0", "0; −0,25; −2/9; −1/3"], answer: "A", explanation: "−2/9 ≈ −0,222, −0,25, −1/3 ≈ −0,333. Yang lebih dekat ke nol lebih besar." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 1½ + 2/3 − 5/6 adalah…", options: ["4/3", "1", "7/6", "5/3"], answer: "A", explanation: "Penyebut 6: 9/6 + 4/6 − 5/6 = 8/6 = 4/3." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari −2/3 × (−9/10) adalah…", options: ["3/5", "−3/5", "20/27", "−20/27"], answer: "A", explanation: "Negatif kali negatif hasilnya positif. 2/3 × 9/10 = 18/30 = 3/5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Hasil dari 5 : 2/3 adalah…", options: ["7½", "3⅓", "10/3", "2/15"], answer: "A", explanation: "5 × 3/2 = 15/2 = 7½. Masuk akal: berapa banyak 2/3 yang muat dalam 5? Lebih dari 5." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Rina belajar 3/4 jam, Sari 0,8 jam, Tono 42 menit, dan Umi 5/6 jam. Siapa yang belajar paling lama?", options: ["Rina", "Sari", "Tono", "Umi"], answer: "D", explanation: "Ubah ke menit: Rina 45, Sari 48, Tono 42, Umi 50 menit." },
        { type: "FRACTION", points: 4, prompt: `Hitung: 3/8 + 5/12. ${FRAC}`, answer: "19/24", explanation: "KPK(8, 12) = 24. 9/24 + 10/24 = 19/24." },
        { type: "NUMERIC", points: 4, prompt: "Hitung: 8,4 : 0,12", answer: 70, explanation: "Geser koma dua langkah pada keduanya: 840 : 12 = 70." },
        { type: "NUMERIC", points: 4, prompt: `Hitung: 2,5 − 3¾. ${NEG} ${DEC}`, answer: -1.25, explanation: "3¾ = 3,75. 2,5 − 3,75 = −1,25." },
        { type: "FRACTION", points: 4, prompt: `Hitung: (−5/6) : (−10/9). ${FRAC}`, answer: "3/4", explanation: "−5/6 × (−9/10) = 45/60 = 3/4. Negatif dibagi negatif hasilnya positif." },
        { type: "NUMERIC", points: 4, prompt: "Sekarung beras 25 kg dibagi ke dalam kantong-kantong berisi 1¼ kg. Berapa kantong yang diperlukan?", answer: 20, explanation: "25 : 5/4 = 25 × 4/5 = 20 kantong." },
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
