/**
 * Intermediate Math — Bab 3: Rasio, the chapter's closing sequence (Sept 2026),
 * read by scripts/setup-math-chapter.ts:
 *
 *   Sesi → Classic quiz (repeat) → practices → 2 try-outs (standar + pengayaan) → 1 exam
 *   → (end of semester 1) Persiapan UAS → Ujian Akhir Semester
 *
 * Practices: Latihan Penguasaan (Bab 3 only), Latihan Terpadu (Bab 3 problems
 * that need Bab 1–2 skills; tags like [Pecahan + Rasio] name what they join)
 * and the ratio Drill. The Try Out Standar is Bab 3 only; the Try Out
 * Pengayaan is built from integrated items; the Ujian is mostly Bab 3 with a
 * few integrated ones. Persiapan UAS is a timed mock of the Ujian Akhir
 * Semester: both are 40 soal / 90 menit and every item combines topics from
 * Bab 1–3 (Targhib: "high order thinking question that truly combine").
 *
 * Ratio answers are multiple choice or a missing number, never typed "a:b".
 * Every answer was recomputed in Python (fractions.Fraction) before being written down.
 */
import type { ChapterContent } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";
const DEC = "Untuk desimal gunakan titik, misalnya 0.25.";
const RP = "Tulis angkanya tanpa titik ribuan, misalnya 42000.";

export const BAB3_CHAPTER: ChapterContent = {
  chapterTitle: "Bab 3: Rasio",
  archiveOnPublish: ["Try Out — Bab 3: Perbandingan"],
  quizzes: [
    // ─────────────────────────── Practice 1: Mastery ───────────────────────────
    {
      title: "Latihan Penguasaan — Bab 3: Rasio",
      style: "MASTERY",
      questions: [
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 12] Bentuk paling sederhana dari rasio 45 : 60 adalah…", options: ["3 : 4", "4 : 3", "9 : 12", "15 : 20"], answer: "A", explanation: "FPB(45, 60) = 15. 45 : 15 = 3 dan 60 : 15 = 4." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 12] Rasio kelereng merah : putih = 3 : 5. Bagian kelereng merah dari seluruh kelereng adalah…", options: ["3/8", "3/5", "5/8", "5/3"], answer: "A", explanation: "3 + 5 = 8 bagian seluruhnya, merah 3 bagian: 3/8." },
        { type: "NUMERIC", points: 1, prompt: `[Sesi 12] Uang Rp72.000 dibagi dengan rasio 5 : 3. Berapa rupiah bagian yang lebih besar? ${RP}`, answer: 45000, explanation: "8 bagian, satu bagian 9.000. Bagian besar 5 × 9.000 = 45.000." },
        { type: "NUMERIC", points: 1, prompt: "[Sesi 13] Isi kotaknya:  3 : 8 = 15 : □", answer: 40, explanation: "3 menjadi 15 berarti dikali 5, jadi 8 × 5 = 40." },
        { type: "NUMERIC", points: 1, prompt: `[Sesi 13] Harga 4 pulpen Rp14.000. Berapa rupiah harga 10 pulpen? ${RP}`, answer: 35000, explanation: "1 pulpen Rp3.500. 10 pulpen Rp35.000." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 13] Minuman A dibuat dari sirup dan air dengan rasio 2 : 3, minuman B dengan rasio 3 : 5. Mana yang lebih manis?", options: ["A", "B", "sama manis"], answer: "A", explanation: "Bagian sirup: A = 2/5 = 0,4 dan B = 3/8 = 0,375. A lebih manis." },
        { type: "NUMERIC", points: 1, prompt: "[Sesi 14] Peta berskala 1 : 300.000. Jarak di peta 5 cm. Berapa km jarak sebenarnya?", answer: 15, explanation: "5 × 300.000 = 1.500.000 cm = 15 km." },
        { type: "NUMERIC", points: 1, prompt: `[Sesi 14] Denah berskala 1 : 50. Panjang meja sebenarnya 1,2 m. Berapa cm panjangnya pada denah? ${DEC}`, answer: 2.4, explanation: "1,2 m = 120 cm. 120 : 50 = 2,4 cm." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 14] Pada sebuah peta, 2 cm mewakili 5 km. Skala peta itu adalah…", options: ["1 : 250.000", "1 : 25.000", "2 : 5", "1 : 2.500.000"], answer: "A", explanation: "5 km = 500.000 cm. 2 : 500.000 = 1 : 250.000." },
        { type: "NUMERIC", points: 1, prompt: "[Sesi 15] Sebuah bus menempuh 240 km dalam 4 jam. Berapa km/jam kecepatan rata-ratanya?", answer: 60, explanation: "240 : 4 = 60 km/jam." },
        { type: "NUMERIC", points: 1, prompt: "[Sesi 15] Ubah 36 km/jam menjadi m/detik.", answer: 10, explanation: "36 : 3,6 = 10 m/detik." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 15] Kemasan sabun mana yang paling murah per batang?", options: ["3 batang Rp10.500", "5 batang Rp16.000", "1 batang Rp3.700"], answer: "B", explanation: "Per batang: Rp3.500, Rp3.200, Rp3.700. Kemasan 5 batang paling murah." },
        { type: "NUMERIC", points: 1, prompt: "[Sesi 16] Enam orang menyelesaikan sebuah pekerjaan dalam 10 hari. Berapa hari jika dikerjakan 4 orang?", answer: 15, explanation: "Berbalik nilai: 6 × 10 = 60 hari-orang. 60 : 4 = 15 hari." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Sesi 16] Jika hasil kali dua besaran selalu tetap, perbandingannya disebut…", options: ["berbalik nilai", "senilai", "bukan perbandingan"], answer: "A", explanation: "Senilai: hasil bagi tetap. Berbalik nilai: hasil kali tetap." },
        { type: "NUMERIC", points: 1, prompt: `[Sesi 16] Misalkan kurs 1 SGD = Rp12.000. Berapa rupiah untuk 25 SGD? ${RP}`, answer: 300000, explanation: "25 × 12.000 = 300.000." },
      ],
    },

    // ─────────────────────────── Practice 2: Terpadu ───────────────────────────
    {
      title: "Latihan Terpadu — Bab 3: Rasio",
      style: "MASTERY",
      questions: [
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Pecahan + Rasio] Bentuk paling sederhana dari rasio 2½ : 3¾ adalah…", options: ["2 : 3", "3 : 2", "5 : 3", "10 : 15"], answer: "A", explanation: "5/2 : 15/4. Kalikan KPK(2, 4) = 4: 10 : 15. Bagi FPB 5: 2 : 3." },
        { type: "NUMERIC", points: 1, prompt: "[FPB + Rasio] Rasio 84 : 126 : 210 disederhanakan menjadi a : b : c dengan membagi FPB ketiganya. Berapa a + b + c?", answer: 10, explanation: "84 = 2² × 3 × 7, 126 = 2 × 3² × 7, 210 = 2 × 3 × 5 × 7. FPB = 2 × 3 × 7 = 42. Rasionya 2 : 3 : 5, jumlahnya 10." },
        { type: "NUMERIC", points: 1, prompt: `[Bilangan negatif + Rasio] Suhu kota A turun dari 6 °C menjadi −4 °C, sedangkan suhu kota B turun dari 2 °C menjadi −2 °C. Rasio penurunan suhu A : B = k : 1. Berapa k? ${DEC}`, answer: 2.5, explanation: "Penurunan A: 6 − (−4) = 10 derajat. Penurunan B: 2 − (−2) = 4 derajat. 10 : 4 = 2,5 : 1." },
        { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Persen + Rasio] Di sebuah kelas, 40% siswanya laki-laki. Rasio siswa laki-laki : perempuan adalah…", options: ["2 : 3", "2 : 5", "3 : 2", "4 : 10"], answer: "A", explanation: "Perempuan 60%. 40 : 60 = 2 : 3. (2 : 5 adalah laki-laki terhadap seluruh kelas.)" },
        { type: "NUMERIC", points: 1, prompt: `[Desimal + Proporsi] 1,5 liter cat cukup untuk 12 m² dinding. Berapa liter cat untuk 30 m²? ${DEC}`, answer: 3.75, explanation: "Per m²: 1,5 : 12 = 0,125 liter. 30 × 0,125 = 3,75 liter." },
        { type: "NUMERIC", points: 1, prompt: "[Pecahan + Skala] Peta berskala 1 : 250.000. Jarak dua desa di peta 3⅕ cm. Berapa km jarak sebenarnya?", answer: 8, explanation: "3⅕ = 3,2 cm. 3,2 × 250.000 = 800.000 cm = 8 km." },
        { type: "NUMERIC", points: 1, prompt: "[KPK + Laju] Lampu A berkedip 15 kali per menit dan lampu B 20 kali per menit, keduanya teratur. Keduanya baru saja berkedip bersamaan. Setelah berapa detik mereka berkedip bersamaan lagi?", answer: 12, explanation: "A berkedip setiap 60 : 15 = 4 detik, B setiap 60 : 20 = 3 detik. KPK(4, 3) = 12 detik." },
        { type: "NUMERIC", points: 1, prompt: "[Pangkat + Skala] Pada denah berskala 1 : 100, luas sebuah kamar 15 cm². Berapa m² luas kamar sebenarnya?", answer: 15, explanation: "Luas dikali 100² = 10.000: 15 × 10.000 = 150.000 cm². 1 m² = 10.000 cm², jadi 15 m²." },
        { type: "NUMERIC", points: 1, prompt: "[Operasi pecahan + Laju] Ibu berjalan kaki selama ⅔ jam dengan kecepatan 4½ km/jam, lalu naik angkot selama ¾ jam dengan kecepatan 32 km/jam. Berapa km jarak totalnya?", answer: 27, explanation: "Jalan kaki: 2/3 × 9/2 = 3 km. Angkot: 3/4 × 32 = 24 km. Total 27 km." },
        { type: "NUMERIC", points: 1, prompt: `[Persen + Laju] Harga beras naik 10% menjadi Rp14.300 per kg. Berapa rupiah harga per kg sebelum naik? ${RP}`, answer: 13000, explanation: "Harga lama × 1,1 = 14.300, jadi harga lama = 14.300 : 1,1 = 13.000." },
        { type: "NUMERIC", points: 1, prompt: "[Pecahan + Berbalik nilai] Sebuah pekerjaan selesai dalam 12 hari oleh 12 orang. Supaya selesai dalam ⅔ dari waktu itu, berapa orang yang dibutuhkan?", answer: 18, explanation: "⅔ × 12 = 8 hari. Pekerjaan 12 × 12 = 144 hari-orang. 144 : 8 = 18 orang." },
        { type: "NUMERIC", points: 1, prompt: "[FPB & KPK + Rasio] Dua bilangan berbanding 3 : 5, dan FPB keduanya 12. Berapa KPK keduanya?", answer: 180, explanation: "Karena 3 dan 5 tidak punya faktor persekutuan, bilangannya 3 × 12 = 36 dan 5 × 12 = 60. KPK(36, 60) = 180." },
      ],
    },

    // ─────────────────────────── Practice 3: Drill ───────────────────────────
    {
      title: "Drill Kilat — Menyederhanakan Rasio",
      style: "DRILL",
      settings: { drillSkill: "ratio-simplify", drillSeconds: 60, drillTarget: 10 },
      questions: [],
    },

    // ─────────────────────────── Try-out standar ───────────────────────────
    {
      title: "Try Out Standar — Bab 3: Rasio",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bentuk paling sederhana dari rasio 36 : 48 adalah…", options: ["3 : 4", "4 : 3", "6 : 8", "9 : 12"], answer: "A", explanation: "FPB(36, 48) = 12, jadi 3 : 4." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bentuk paling sederhana dari rasio 250 g : 1,5 kg adalah…", options: ["1 : 6", "6 : 1", "1 : 60", "25 : 15"], answer: "A", explanation: "1,5 kg = 1.500 g. 250 : 1.500 = 1 : 6." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Rasio siswa laki-laki : perempuan 4 : 5. Bagian siswa yang perempuan adalah…", options: ["5/9", "4/9", "5/4", "4/5"], answer: "A", explanation: "Seluruhnya 9 bagian, perempuan 5 bagian: 5/9." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Rasio yang ekuivalen dengan 7 : 3 adalah…", options: ["21 : 9", "14 : 9", "10 : 6", "3 : 7"], answer: "A", explanation: "7 : 3 dikali 3 menjadi 21 : 9. 10 : 6 diperoleh dengan menambah 3, bukan mengalikan." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pohon A tumbuh dari 2 m menjadi 3 m, dan pohon B dari 5 m menjadi 6 m. Pernyataan yang benar adalah…", options: ["keduanya tumbuh 1 m, tetapi pertumbuhan A 50% dari tinggi awalnya dan B 20%", "keduanya tumbuh dengan rasio yang sama", "pertumbuhan B lebih besar jika dilihat dari rasionya", "keduanya tumbuh 50%"], answer: "A", explanation: "Selisihnya sama (1 m), tetapi rasionya berbeda: 3 : 2 = 1,5 kali untuk A dan 6 : 5 = 1,2 kali untuk B." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Campuran kopi : air manakah yang paling pekat kopinya?", options: ["2 : 7", "3 : 10", "1 : 3", "4 : 15"], answer: "C", explanation: "Bagian kopi: 2/9 ≈ 0,22; 3/13 ≈ 0,23; 1/4 = 0,25; 4/19 ≈ 0,21. Yang terbesar 1 : 3." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Nilai □ yang memenuhi 6 : □ = 9 : 15 adalah…", options: ["10", "12", "9", "8"], answer: "A", explanation: "9 : 15 = 3 : 5 = 6 : 10." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Pasangan besaran manakah yang proporsional (senilai)?", options: ["banyak liter bensin dan harganya", "umur dan tinggi badan", "biaya parkir (Rp3.000 jam pertama, Rp2.000 per jam berikutnya) dan lama parkir", "nilai ulangan dan lama belajar"], answer: "A", explanation: "Harga bensin sebanding dengan banyaknya liter. Biaya parkir punya tarif jam pertama yang berbeda, jadi tidak sebanding." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Peta berskala 1 : 2.500.000. Jarak dua kota di peta 4 cm. Jarak sebenarnya adalah…", options: ["100 km", "10 km", "1.000 km", "25 km"], answer: "A", explanation: "4 × 2.500.000 = 10.000.000 cm = 100 km." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Jarak sebenarnya 18 km. Pada peta berskala 1 : 300.000, jaraknya adalah…", options: ["6 cm", "60 cm", "0,6 cm", "54 cm"], answer: "A", explanation: "18 km = 1.800.000 cm. 1.800.000 : 300.000 = 6 cm." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Foto berukuran 4 cm × 6 cm diperbesar secara proporsional. Ukuran baru yang mungkin adalah…", options: ["10 cm × 15 cm", "8 cm × 10 cm", "6 cm × 8 cm", "12 cm × 16 cm"], answer: "A", explanation: "4 : 6 = 2 : 3, dan 10 : 15 = 2 : 3. Ukuran lain rasionya 4 : 5 atau 3 : 4." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Gambar sepanjang 15 cm diperkecil menjadi 6 cm. Faktor skalanya adalah…", options: ["0,4", "2,5", "9", "0,6"], answer: "A", explanation: "k = ukuran baru : ukuran lama = 6 : 15 = 0,4. Kurang dari 1 karena diperkecil." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Kecepatan 90 km/jam sama dengan…", options: ["25 m/detik", "324 m/detik", "1,5 m/detik", "90 m/detik"], answer: "A", explanation: "90 : 3,6 = 25 m/detik." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Kemasan beras manakah yang paling murah per kg?", options: ["2 kg seharga Rp27.000", "3 kg seharga Rp39.600", "5 kg seharga Rp67.500", "1 kg seharga Rp13.800"], answer: "B", explanation: "Per kg: Rp13.500; Rp13.200; Rp13.500; Rp13.800. Termurah kemasan 3 kg." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Kepadatan penduduk sebuah kota 6.000 orang/km² dan luasnya 25 km². Banyak penduduknya adalah…", options: ["150.000 orang", "240 orang", "31.000 orang", "15.000 orang"], answer: "A", explanation: "Penduduk = kepadatan × luas = 6.000 × 25 = 150.000." },
        { type: "NUMERIC", points: 5.5, prompt: `Uang Rp240.000 dibagi untuk tiga anak dengan rasio 3 : 5 : 7. Berapa rupiah bagian yang terkecil? ${RP}`, answer: 48000, explanation: "15 bagian, satu bagian 16.000. Terkecil 3 × 16.000 = 48.000." },
        { type: "NUMERIC", points: 5.5, prompt: "Rasio umur ayah : anak 9 : 2, dan jumlah umur mereka 55 tahun. Berapa tahun umur ayah?", answer: 45, explanation: "11 bagian = 55, satu bagian 5. Ayah 9 × 5 = 45 tahun." },
        { type: "NUMERIC", points: 5.5, prompt: "Diketahui 2⅔ : 4 = 2 : k. Berapa k?", answer: 3, explanation: "2⅔ = 8/3. 8/3 : 4 = 8 : 12 = 2 : 3, jadi k = 3." },
        { type: "NUMERIC", points: 5.5, prompt: `Harga 7 kg gula Rp119.000. Berapa rupiah harga 12 kg gula? ${RP}`, answer: 204000, explanation: "1 kg Rp17.000. 12 kg Rp204.000." },
        { type: "NUMERIC", points: 5.5, prompt: "Denah berskala 1 : 150. Lebar ruangan sebenarnya 7,5 m. Berapa cm lebarnya pada denah?", answer: 5, explanation: "7,5 m = 750 cm. 750 : 150 = 5 cm." },
        { type: "NUMERIC", points: 5.5, prompt: `Model mobil berskala 1 : 24 panjangnya 18,5 cm. Berapa meter panjang mobil sebenarnya? ${DEC}`, answer: 4.44, explanation: "18,5 × 24 = 444 cm = 4,44 m." },
        { type: "NUMERIC", points: 5.5, prompt: "Sebuah kereta menempuh 315 km dalam 3,5 jam. Berapa km/jam kecepatan rata-ratanya?", answer: 90, explanation: "315 : 3,5 = 90 km/jam." },
        { type: "NUMERIC", points: 5.5, prompt: "Pompa mengalirkan 18 liter air per menit untuk mengisi tandon 1.080 liter. Berapa menit tandon itu penuh?", answer: 60, explanation: "1.080 : 18 = 60 menit." },
        { type: "NUMERIC", points: 5.5, prompt: `Sebuah mobil menempuh 12 km dengan 1 liter bensin. Berapa liter bensin untuk perjalanan 330 km? ${DEC}`, answer: 27.5, explanation: "330 : 12 = 27,5 liter." },
        { type: "NUMERIC", points: 5.5, prompt: "Pak Anton pergi ke kota berjarak 90 km dengan kecepatan 45 km/jam, lalu pulang lewat jalan yang sama dengan kecepatan 90 km/jam. Berapa km/jam kecepatan rata-ratanya?", answer: 60, explanation: "Pergi 2 jam, pulang 1 jam. Jarak total 180 km dalam 3 jam: 60 km/jam, bukan (45 + 90) : 2 = 67,5." },
      ],
    },

    // ─────────────────────────── Try-out pengayaan ───────────────────────────
    {
      title: "Try Out Pengayaan — Bab 3: Rasio",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Bentuk paling sederhana dari rasio 0,3 : ⅖ : 1½ adalah…", options: ["3 : 4 : 15", "3 : 2 : 15", "3 : 4 : 5", "6 : 8 : 30"], answer: "A", explanation: "Tulis dalam persepuluhan: 3/10 : 4/10 : 15/10. Kalikan 10: 3 : 4 : 15, dan FPB-nya 1." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Dua bilangan bulat positif berbanding 4 : 7 dan hasil kalinya 252. Selisih kedua bilangan itu adalah…", options: ["9", "3", "33", "21"], answer: "A", explanation: "Bilangannya 4k dan 7k: 28k² = 252, jadi k² = 9 dan k = 3. Bilangannya 12 dan 21, selisihnya 9." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Suhu turun dari 5 °C menjadi −7 °C dalam 4 jam dengan teratur. Laju perubahan suhunya adalah…", options: ["−3 °C per jam", "3 °C per jam", "−0,5 °C per jam", "−12 °C per jam"], answer: "A", explanation: "Perubahan −7 − 5 = −12 derajat dalam 4 jam: −12 : 4 = −3 °C per jam (tanda negatif karena turun)." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Harga sebuah barang naik 25%. Rasio harga baru : harga lama adalah…", options: ["5 : 4", "4 : 5", "1 : 4", "25 : 100"], answer: "A", explanation: "Harga baru 125% dari harga lama: 125 : 100 = 5 : 4." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Peta berskala 1 : 50.000. Luas sebuah taman di peta 6 cm². Luas taman sebenarnya adalah…", options: ["1,5 km²", "300 m²", "3 km²", "15 km²"], answer: "A", explanation: "Luas dikali 50.000² = 2.500.000.000: 6 × 2,5 miliar = 15 miliar cm². 1 km² = 10 miliar cm², jadi 1,5 km²." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Keran A saja memenuhi sebuah bak dalam 6 jam, keran B saja dalam 3 jam. Jika keduanya dibuka bersama, bak penuh dalam…", options: ["2 jam", "4,5 jam", "9 jam", "1,5 jam"], answer: "A", explanation: "Laju: A mengisi 1/6 bak per jam, B 1/3 bak per jam. Bersama 1/6 + 1/3 = 1/2 bak per jam, jadi 2 jam." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Kecepatan cahaya sekitar 3 × 10⁵ km/detik dan jarak Matahari ke Bumi sekitar 1,5 × 10⁸ km. Waktu yang dibutuhkan cahaya Matahari untuk sampai ke Bumi sekitar…", options: ["500 detik", "50 detik", "5.000 detik", "4,5 × 10¹³ detik"], answer: "A", explanation: "Waktu = jarak : kecepatan = 1,5 × 10⁸ : (3 × 10⁵) = 0,5 × 10³ = 500 detik (sekitar 8⅓ menit)." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Diketahui a : b = 2 : 3 dan b : c = 4 : 5. Jika c = 45, maka a = …", options: ["24", "18", "30", "16"], answer: "A", explanation: "Samakan b menjadi 12: a : b : c = 8 : 12 : 15. c = 15 bagian = 45, satu bagian 3, jadi a = 24." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "Apa keluaran kode Python berikut?\n\nimport math\na, b = 36, 60\ng = math.gcd(a, b)\nprint(a // g, ':', b // g)", options: ["3 : 5", "12 : 12", "36 : 60", "5 : 3"], answer: "A", explanation: "math.gcd adalah FPB: FPB(36, 60) = 12. 36 // 12 = 3 dan 60 // 12 = 5, jadi tercetak 3 : 5, rasio paling sederhana." },
        { type: "MULTIPLE_CHOICE", points: 4, prompt: "x dan y berbalik nilai. Jika x naik 25%, maka y…", options: ["turun 20%", "turun 25%", "naik 25%", "naik 20%"], answer: "A", explanation: "x × y tetap. x menjadi 1,25x, maka y harus menjadi y : 1,25 = 0,8y, yaitu turun 20%." },
        { type: "NUMERIC", points: 6, prompt: `Uang Rp2.600.000 dibagi untuk A, B, dan C dengan rasio ½ : ⅓ : ¼. Berapa rupiah bagian A? ${RP}`, answer: 1200000, explanation: "Kalikan KPK(2, 3, 4) = 12: rasionya 6 : 4 : 3, total 13 bagian. Satu bagian 200.000, A = 6 × 200.000 = 1.200.000." },
        { type: "NUMERIC", points: 6, prompt: "Rasio umur ayah : anak sekarang 5 : 3. Delapan tahun lagi rasionya 3 : 2. Berapa tahun umur ayah sekarang?", answer: 40, explanation: "Coba kelipatan 5 : 3. Untuk 40 : 24, delapan tahun lagi 48 : 32 = 3 : 2. Cocok, jadi ayah 40 tahun." },
        { type: "NUMERIC", points: 6, prompt: "Peta berskala 1 : 200.000 digambar ulang dengan faktor skala 2,5 (diperbesar). Skala peta baru adalah 1 : n. Berapa n?", answer: 80000, explanation: "1 cm di peta baru = 1 : 2,5 = 0,4 cm di peta lama = 0,4 × 200.000 = 80.000 cm sebenarnya. Jadi 1 : 80.000." },
        { type: "NUMERIC", points: 6, prompt: "Kolam 1.200 liter diisi keran yang mengalirkan 15 liter per menit, tetapi kolam itu bocor 3 liter per menit. Berapa menit kolam itu penuh?", answer: 100, explanation: "Laju bersih 15 − 3 = 12 liter per menit. 1.200 : 12 = 100 menit." },
        { type: "NUMERIC", points: 6, prompt: `Setelah didiskon 20%, harga beras menjadi Rp11.200 per kg. Berapa rupiah harga 25 kg beras dengan harga normal? ${RP}`, answer: 350000, explanation: "Harga normal × 0,8 = 11.200, jadi harga normal Rp14.000 per kg. 25 kg: 350.000." },
        { type: "NUMERIC", points: 6, prompt: "Rasio 3/8 : 5/12 disederhanakan menjadi a : b dengan a dan b bilangan bulat. Berapa a + b?", answer: 19, explanation: "Kalikan KPK(8, 12) = 24: 9 : 10. Jadi a + b = 19." },
        { type: "NUMERIC", points: 6, prompt: "Sepuluh pekerja dapat menyelesaikan sebuah pekerjaan dalam 18 hari. Setelah 6 hari, 2 pekerja berhenti. Berapa hari seluruhnya pekerjaan itu selesai?", answer: 21, explanation: "Total 10 × 18 = 180 hari-orang. Dalam 6 hari terpakai 60, sisa 120. Dengan 8 pekerja: 15 hari lagi. Seluruhnya 6 + 15 = 21 hari." },
        { type: "NUMERIC", points: 6, prompt: "Pelari A berlari 8 m/detik dan pelari B 6 m/detik di lintasan melingkar 400 m. Mereka mulai bersamaan dari garis yang sama dan searah. Setelah berapa detik A pertama kali menyusul B?", answer: 200, explanation: "Setiap detik A menambah jarak 8 − 6 = 2 m dari B. Menyusul berarti unggul satu putaran (400 m): 400 : 2 = 200 detik." },
        { type: "NUMERIC", points: 6, prompt: `Sebuah mobil memakai 1 liter bensin untuk 14 km. Harga bensin Rp10.000 per liter lalu naik 30%. Berapa rupiah biaya bensin untuk 70 km setelah kenaikan? ${RP}`, answer: 65000, explanation: "Bensin 70 : 14 = 5 liter. Harga baru 10.000 × 1,3 = 13.000. Biaya 5 × 13.000 = 65.000." },
        { type: "NUMERIC", points: 6, prompt: "Apa keluaran kode Python berikut?\n\ntotal = 0\nfor n in [4, 6, 12]:\n    total = total + 24 // n\nprint(total)", answer: 12, explanation: "24 // 4 = 6, 24 // 6 = 4, 24 // 12 = 2. Jumlahnya 12. (n dan 24 // n berbalik nilai: hasil kalinya selalu 24.)" },
      ],
    },

    // ─────────────────────────── Exam ───────────────────────────
    {
      title: "Ujian — Bab 3: Rasio",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bentuk paling sederhana dari rasio 1,25 : 2 adalah…", options: ["5 : 8", "8 : 5", "125 : 2", "1 : 2"], answer: "A", explanation: "Kali 100: 125 : 200. Bagi FPB 25: 5 : 8." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Teh manis dibuat dengan 3 sendok gula untuk 2 gelas teh. Campuran manakah yang rasanya sama?", options: ["9 sendok gula untuk 6 gelas", "5 sendok gula untuk 4 gelas", "4 sendok gula untuk 3 gelas", "6 sendok gula untuk 5 gelas"], answer: "A", explanation: "3 : 2 dikali 3 menjadi 9 : 6. Pilihan lain menambahkan, bukan mengalikan." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Peta berskala 1 : 1.500.000. Jarak dua kota di peta 7 cm. Jarak sebenarnya adalah…", options: ["105 km", "10,5 km", "1.050 km", "21 km"], answer: "A", explanation: "7 × 1.500.000 = 10.500.000 cm = 105 km." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Manakah yang merupakan laju (perbandingan dua besaran dengan satuan berbeda)?", options: ["45 km per jam", "rasio laki-laki : perempuan 3 : 4", "skala 1 : 100", "perbandingan tinggi 2 : 3"], answer: "A", explanation: "km per jam membandingkan jarak dengan waktu. Tiga lainnya membandingkan besaran bersatuan sama." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Kemasan minyak goreng manakah yang paling hemat?", options: ["400 ml seharga Rp9.000", "1 L seharga Rp21.000", "250 ml seharga Rp6.000", "2 L seharga Rp43.000"], answer: "B", explanation: "Per liter: Rp22.500; Rp21.000; Rp24.000; Rp21.500. Termurah kemasan 1 L." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Bentuk paling sederhana dari rasio ⅔ : 0,75 adalah…", options: ["8 : 9", "9 : 8", "2 : 3", "4 : 3"], answer: "A", explanation: "0,75 = ¾. Kalikan KPK(3, 4) = 12: 8 : 9." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Suhu turun 18 derajat dalam 2¼ jam dengan teratur. Laju penurunannya adalah…", options: ["8 derajat per jam", "40,5 derajat per jam", "16 derajat per jam", "9 derajat per jam"], answer: "A", explanation: "18 : 2¼ = 18 : 9/4 = 18 × 4/9 = 8 derajat per jam." },
        { type: "MULTIPLE_CHOICE", points: 3, prompt: "Sembilan orang menyelesaikan sebuah pekerjaan dalam 8 hari. Jika dikerjakan 12 orang, pekerjaan itu selesai dalam…", options: ["6 hari", "10⅔ hari", "11 hari", "5 hari"], answer: "A", explanation: "Berbalik nilai: 9 × 8 = 72 hari-orang. 72 : 12 = 6 hari. (10⅔ muncul jika memakai proporsi senilai.)" },
        { type: "NUMERIC", points: 4, prompt: `Uang Rp360.000 dibagi dengan rasio 2 : 3 : 4. Berapa rupiah bagian yang terbesar? ${RP}`, answer: 160000, explanation: "9 bagian, satu bagian 40.000. Terbesar 4 × 40.000 = 160.000." },
        { type: "NUMERIC", points: 4, prompt: `Isi kotaknya:  5 : 12 = 17,5 : □. ${DEC}`, answer: 42, explanation: "5 menjadi 17,5 berarti dikali 3,5. 12 × 3,5 = 42." },
        { type: "NUMERIC", points: 4, prompt: `Denah berskala 1 : 80. Panjang ruangan pada denah 12,5 cm. Berapa meter panjang ruangan sebenarnya? ${DEC}`, answer: 10, explanation: "12,5 × 80 = 1.000 cm = 10 m." },
        { type: "NUMERIC", points: 4, prompt: `Ubah 24 m/detik menjadi km/jam. ${DEC}`, answer: 86.4, explanation: "Kali 3,6: 24 × 3,6 = 86,4 km/jam." },
        { type: "NUMERIC", points: 4, prompt: "Dua bilangan berbanding 2 : 7, dan KPK keduanya 70. Berapa jumlah kedua bilangan itu?", answer: 45, explanation: "Bilangannya 2k dan 7k dengan KPK 14k = 70, jadi k = 5. Bilangannya 10 dan 35, jumlahnya 45." },
        { type: "NUMERIC", points: 4, prompt: "Sebuah printer mencetak 45 halaman dalam 1½ menit. Berapa halaman yang dicetak dalam 8 menit?", answer: 240, explanation: "Laju 45 : 1,5 = 30 halaman per menit. 8 menit: 240 halaman." },
        {
          type: "STEPS", points: 8,
          prompt: "Peta berskala 1 : 400.000. Jarak kota A ke kota B pada peta 6,5 cm. Sebuah bus melaju dengan kecepatan rata-rata 52 km/jam. Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Jarak sebenarnya (km) = …", answer: "26" },
            { prompt: "Waktu tempuh (menit) = …", answer: "30" },
            { prompt: "Jika bus berangkat pukul 09.45, bus tiba pukul 10.… (isi menitnya)", answer: "15" },
          ],
          explanation: "6,5 × 400.000 = 2.600.000 cm = 26 km. Waktu 26 : 52 = 0,5 jam = 30 menit. 09.45 + 30 menit = 10.15.",
        },
        {
          type: "STEPS", points: 8,
          prompt: "Resep rendang untuk 4 porsi memakai 300 g daging dan 2 sendok makan cabai giling. Kamu ingin memasak 10 porsi. Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Faktor pengali dari 4 porsi ke 10 porsi = …", answer: "2.5" },
            { prompt: "Daging yang dibutuhkan (gram) = …", answer: "750" },
            { prompt: "Cabai giling yang dibutuhkan (sendok makan) = …", answer: "5" },
          ],
          explanation: "10 : 4 = 2,5. Daging 300 × 2,5 = 750 g. Cabai 2 × 2,5 = 5 sendok makan.",
        },
        {
          type: "MULTI_PART", points: 10,
          prompt: "Toko A menjual beras 5 kg seharga Rp68.000. Toko B menjual beras 3 kg seharga Rp42.000. Jawab harga dalam ribu rupiah.",
          parts: [
            { prompt: "Harga per kg di toko A (ribu rupiah) = …", marks: 3, answer: "13.6" },
            { prompt: "Harga per kg di toko B (ribu rupiah) = …", marks: 3, answer: "14" },
            { prompt: "Toko yang lebih murah per kg (tulis A atau B) = …", marks: 4, answer: "A" },
          ],
          explanation: "A: 68 : 5 = 13,6 ribu per kg. B: 42 : 3 = 14 ribu per kg. Toko A lebih murah per kg walaupun harga kemasannya lebih mahal.",
        },
        {
          type: "MULTI_PART", points: 10,
          prompt: "Kelas 7A berisi 32 siswa dengan rasio laki-laki : perempuan 3 : 5. Kelas 7B berisi 30 siswa dengan rasio laki-laki : perempuan 2 : 3.",
          parts: [
            { prompt: "Banyak siswa laki-laki di 7A = …", marks: 3, answer: "12" },
            { prompt: "Banyak siswa laki-laki di 7B = …", marks: 3, answer: "12" },
            { prompt: "Banyak siswa perempuan di kedua kelas = …", marks: 4, answer: "38" },
          ],
          explanation: "7A: 3/8 × 32 = 12 laki-laki, 20 perempuan. 7B: 2/5 × 30 = 12 laki-laki, 18 perempuan. Perempuan seluruhnya 38. Laki-lakinya sama banyak, tetapi rasio kelasnya berbeda.",
        },
        {
          type: "FIND_MISTAKE", points: 8,
          prompt: "3 kaleng cat cukup untuk 12 m² dinding. Rudi menghitung banyak kaleng untuk 20 m². Di baris mana ia pertama kali salah?",
          lines: ["kaleng : luas = 3 : 12", "20 m² = 12 m² + 8 m²", "kaleng = 3 + 8 = 11", "jawaban: 11 kaleng"],
          wrongIndex: 2,
          correction: "",
          explanation: "Luas dan kaleng berhubungan dengan perkalian, bukan penjumlahan. 1 kaleng untuk 4 m², jadi 20 m² butuh 5 kaleng.",
        },
        {
          type: "FIND_MISTAKE", points: 8,
          prompt: "Sinta menghitung jarak sebenarnya dari peta berskala 1 : 250.000 dengan jarak 8 cm. Di baris mana ia pertama kali salah?",
          lines: ["jarak sebenarnya = 8 × 250.000", "= 2.000.000", "= 2.000.000 km", "jawaban: 2.000.000 km"],
          wrongIndex: 2,
          correction: "",
          explanation: "Hasil kali masih dalam cm, karena jarak di peta dalam cm. 2.000.000 cm = 20 km.",
        },
      ],
    },

    // ─────────────────────────── Persiapan UAS ───────────────────────────
    {
      title: "Persiapan UAS — Semester 1 (Bab 1–3)",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 90, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Suhu di kaki gunung 22 °C dan di puncak −8 °C. Suhu turun teratur 6 °C setiap naik 1 km. Berapa km tinggi puncak di atas kaki gunung?", options: ["5 km", "2⅓ km", "1⅓ km", "30 km"], answer: "A", explanation: "Selisih suhu 22 − (−8) = 30 derajat. 30 : 6 = 5 km." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio uang Ani : Budi = 3 : 5. Setelah Budi memberi Ani Rp6.000, uang mereka sama banyak. Jumlah uang mereka adalah…", options: ["Rp48.000", "Rp24.000", "Rp12.000", "Rp96.000"], answer: "A", explanation: "Jumlahnya tetap 8 bagian. Supaya sama, masing-masing 4 bagian: Budi memberi 1 bagian = Rp6.000. Jumlah 8 × 6.000 = 48.000." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio FPB(18, 30) : KPK(18, 30) adalah…", options: ["1 : 15", "3 : 5", "1 : 5", "15 : 1"], answer: "A", explanation: "18 = 2 × 3², 30 = 2 × 3 × 5. FPB 6, KPK 90. 6 : 90 = 1 : 15." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Nilai dari (−⅔)² : (−½)³ adalah…", options: ["−32/9", "32/9", "−1/18", "−9/32"], answer: "A", explanation: "(−⅔)² = 4/9 (pangkat genap) dan (−½)³ = −1/8 (pangkat ganjil). 4/9 : (−1/8) = 4/9 × (−8) = −32/9." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pada peta berskala 1 : 300.000, dua kota berjarak 7,5 cm. Sebuah motor melaju 45 km/jam. Waktu tempuhnya adalah…", options: ["30 menit", "2 jam", "3 jam 20 menit", "20 menit"], answer: "A", explanation: "7,5 × 300.000 = 2.250.000 cm = 22,5 km. 22,5 : 45 = 0,5 jam = 30 menit." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Manakah yang nilainya paling besar?", options: ["0,8²", "0,8 : 0,8²", "0,8 × 1,2", "0,8 − 0,8²"], answer: "B", explanation: "0,64; 0,8 : 0,64 = 1,25; 0,96; 0,16. Membagi dengan bilangan kurang dari 1 memperbesar." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Bilangan bulat terkecil n yang membuat n/12 > 7/9 adalah…", options: ["10", "9", "11", "8"], answer: "A", explanation: "Samakan penyebut 36: 3n/36 > 28/36, jadi 3n > 28 dan n > 9⅓. Bilangan bulat terkecilnya 10." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Sebuah barang didiskon 20%, lalu didiskon lagi 15%. Rasio harga akhir : harga awal adalah…", options: ["17 : 25", "13 : 20", "7 : 10", "2 : 3"], answer: "A", explanation: "0,8 × 0,85 = 0,68 = 68/100 = 17 : 25. Bukan diskon 35% (13 : 20)." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio banyak faktor positif dari 72 terhadap banyak faktor positif dari 36 adalah…", options: ["4 : 3", "2 : 1", "3 : 2", "1 : 1"], answer: "A", explanation: "72 = 2³ × 3² punya (3+1)(2+1) = 12 faktor. 36 = 2² × 3² punya (2+1)(2+1) = 9 faktor. 12 : 9 = 4 : 3." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Tiga lampu berkedip setiap ⅔ detik, 1 detik, dan 1⅓ detik. Ketiganya baru saja berkedip bersamaan. Mereka berkedip bersamaan lagi setelah…", options: ["4 detik", "3 detik", "2⅔ detik", "8 detik"], answer: "A", explanation: "Dalam satuan ⅓ detik: 2, 3, dan 4. KPK(2, 3, 4) = 12, yaitu 12 × ⅓ = 4 detik." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio panjang sisi dua persegi 2 : 5. Rasio luasnya adalah…", options: ["4 : 25", "2 : 5", "4 : 10", "8 : 125"], answer: "A", explanation: "Luas memakai pangkat dua: 2² : 5² = 4 : 25." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rata-rata dari −2,5; ¾; dan 1,25 adalah…", options: ["−1/6", "−0,5", "1/6", "−1,5"], answer: "A", explanation: "Jumlahnya −2,5 + 0,75 + 1,25 = −0,5. Dibagi 3: −1/6." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Delapan orang direncanakan menyelesaikan pekerjaan dalam 15 hari. Setelah 5 hari, 2 orang sakit dan berhenti. Pekerjaan itu terlambat dari rencana selama…", options: ["3⅓ hari", "2 hari", "5 hari", "13⅓ hari"], answer: "A", explanation: "Total 8 × 15 = 120 hari-orang; 5 hari memakai 40, sisa 80. Enam orang: 80 : 6 = 13⅓ hari. Seluruhnya 18⅓ hari, terlambat 3⅓ hari." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Harga 3 kg jeruk Rp37.500 dan harga 2 kg apel Rp56.000. Rasio harga per kg jeruk : apel adalah…", options: ["25 : 56", "3 : 2", "56 : 25", "5 : 8"], answer: "A", explanation: "Per kg: jeruk 12.500, apel 28.000. 12.500 : 28.000 = 25 : 56 (bagi 500)." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pada denah berskala 1 : 200, sebuah kamar berukuran 2,5 cm × 2 cm. Lantainya akan dipasangi ubin 50 cm × 50 cm. Banyak ubin yang dibutuhkan adalah…", options: ["80", "20", "40", "200"], answer: "A", explanation: "Kamar sebenarnya 5 m × 4 m = 20 m². Satu ubin 0,25 m². 20 : 0,25 = 80 ubin." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pernyataan yang BENAR adalah…", options: ["−3/4 > −0,8", "(−2)³ > (−3)²", "1/3 = 0,33", "2⁵ < 5²"], answer: "A", explanation: "−0,75 lebih dekat ke nol daripada −0,8. (−2)³ = −8 < 9; 1/3 = 0,333…; 2⁵ = 32 > 25." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio kecepatan A : B = 4 : 3. Untuk jarak yang sama, rasio waktu tempuh A : B adalah…", options: ["3 : 4", "4 : 3", "1 : 1", "16 : 9"], answer: "A", explanation: "Untuk jarak tetap, kecepatan dan waktu berbalik nilai, jadi rasionya terbalik: 3 : 4." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Harga naik dari Rp40.000 menjadi Rp46.000. Jika kemudian harga turun dengan persentase yang sama dari Rp46.000, harganya menjadi…", options: ["Rp39.100", "Rp40.000", "Rp34.000", "Rp39.000"], answer: "A", explanation: "Kenaikan 6.000 : 40.000 = 15%. Turun 15% dari 46.000: 46.000 × 0,85 = 39.100, tidak kembali ke 40.000." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Bentuk paling sederhana dari (2⁴ × 3²) : (2² × 3³) adalah…", options: ["4/3", "3/4", "2/3", "12"], answer: "A", explanation: "2⁴/2² = 2² = 4 dan 3²/3³ = 1/3. Hasilnya 4/3." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Apa keluaran kode Python berikut?\n\nimport math\na, b = 45, 75\nprint(a * b // math.gcd(a, b))", options: ["225", "15", "3375", "5"], answer: "A", explanation: "FPB × KPK = a × b, jadi a × b : FPB = KPK. 45 × 75 = 3.375 dan FPB 15: 3.375 // 15 = 225." },
        { type: "NUMERIC", points: 3, prompt: `Hitung: (−3)² − 2 × (−1½) + 12 : (−¾). ${NEG}`, answer: -4, explanation: "Pangkat: 9. Kali dan bagi: 2 × (−1½) = −3 dan 12 : (−¾) = −16. Lalu 9 − (−3) + (−16) = −4." },
        { type: "NUMERIC", points: 3, prompt: `Uang Rp1.800.000 dibagi untuk tiga anak dengan rasio ⅓ : ¼ : ⅙. Berapa rupiah bagian yang terkecil? ${RP}`, answer: 400000, explanation: "Kalikan 12: 4 : 3 : 2, total 9 bagian. Satu bagian 200.000, terkecil 2 bagian = 400.000." },
        { type: "NUMERIC", points: 3, prompt: "Sebuah tangki terisi ⅗ bagian. Setelah dipakai 21 liter, tinggal ¼ bagian. Berapa liter isi tangki jika penuh?", answer: 60, explanation: "Terpakai ⅗ − ¼ = 12/20 − 5/20 = 7/20 bagian = 21 liter. Penuh: 21 : 7/20 = 60 liter." },
        { type: "NUMERIC", points: 3, prompt: "Jarak dua kota pada peta berskala 1 : 250.000 adalah 12 cm. Sebuah mobil melaju 40 km/jam. Berapa menit waktu tempuhnya?", answer: 45, explanation: "12 × 250.000 = 3.000.000 cm = 30 km. 30 : 40 = ¾ jam = 45 menit." },
        { type: "NUMERIC", points: 3, prompt: "FPB dua bilangan adalah 12 dan KPK-nya 180. Salah satu bilangan 36. Berapa bilangan yang lain?", answer: 60, explanation: "FPB × KPK = hasil kali kedua bilangan: 12 × 180 = 2.160. 2.160 : 36 = 60." },
        { type: "NUMERIC", points: 3, prompt: `Harga 1 kg daging Rp135.000 naik 20%, lalu turun 20%. Berapa rupiah harga 250 g daging sekarang? ${RP}`, answer: 32400, explanation: "135.000 × 1,2 × 0,8 = 129.600 per kg. 250 g = ¼ kg: 32.400." },
        { type: "NUMERIC", points: 3, prompt: "Rasio kelereng merah : biru : hijau = 2 : 3 : 5. Kelereng biru 4 butir lebih banyak daripada kelereng merah. Berapa banyak seluruh kelereng?", answer: 40, explanation: "Biru − merah = 1 bagian = 4. Seluruhnya 10 bagian = 40 kelereng." },
        { type: "NUMERIC", points: 3, prompt: "Ada berapa bilangan bulat n yang memenuhi −2½ ≤ n/2 < 3⅓?", answer: 12, explanation: "Kalikan 2: −5 ≤ n < 6⅔. Bilangan bulatnya −5 sampai 6: ada 12." },
        { type: "NUMERIC", points: 3, prompt: `Suhu freezer −18 °C. Saat listrik padam, suhunya naik 2,5 °C setiap 30 menit. Setelah berapa jam suhunya mencapai 0 °C? ${DEC}`, answer: 3.6, explanation: "Laju 5 °C per jam. Perlu naik 18 derajat: 18 : 5 = 3,6 jam." },
        { type: "NUMERIC", points: 3, prompt: "Maket rumah berskala 1 : 50. Luas lantai pada maket 360 cm². Berapa m² luas lantai sebenarnya?", answer: 90, explanation: "Luas dikali 50² = 2.500: 360 × 2.500 = 900.000 cm² = 90 m²." },
        { type: "NUMERIC", points: 3, prompt: `Air 3⅓ liter dituang ke gelas-gelas berisi ⅙ liter, lalu setiap gelas dijual Rp1.500. Berapa rupiah hasil penjualannya? ${RP}`, answer: 30000, explanation: "10/3 : 1/6 = 10/3 × 6 = 20 gelas. 20 × 1.500 = 30.000." },
        { type: "NUMERIC", points: 3, prompt: "Pelari A menempuh 400 m dalam 80 detik, dan pelari B menempuh 300 m dalam 50 detik. Berapa m/detik selisih kecepatan mereka?", answer: 1, explanation: "A: 400 : 80 = 5 m/detik. B: 300 : 50 = 6 m/detik. Selisih 1 m/detik." },
        { type: "NUMERIC", points: 3, prompt: "Rasio 2⁵ : 4³ : 8² disederhanakan menjadi 1 : a : b. Berapa a + b?", answer: 4, explanation: "2⁵ = 32, 4³ = 64, 8² = 64. 32 : 64 : 64 = 1 : 2 : 2. a + b = 4." },
        { type: "NUMERIC", points: 3, prompt: "Lima belas pekerja membangun jalan sepanjang 4,5 km dalam 12 hari. Dengan kecepatan kerja yang sama, berapa hari yang dibutuhkan 20 pekerja untuk membangun jalan 6 km?", answer: 12, explanation: "Seorang pekerja membangun 4,5 : (15 × 12) = 0,025 km per hari. 20 pekerja: 0,5 km per hari. 6 : 0,5 = 12 hari." },
        {
          type: "STEPS", points: 3,
          prompt: "Pak Budi membeli 2,5 kg bawang merah seharga Rp90.000, lalu menjual semuanya dalam kemasan ¼ kg seharga Rp10.800 per kemasan. Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Banyak kemasan = …", answer: "10" },
            { prompt: "Hasil penjualan (ribu rupiah) = …", answer: "108" },
            { prompt: "Keuntungan sebagai persen dari modal = …", answer: "20" },
          ],
          explanation: "2,5 : ¼ = 10 kemasan. 10 × 10.800 = 108.000. Untung 18.000 dari modal 90.000 = 20%.",
        },
        {
          type: "STEPS", points: 3,
          prompt: "Pada peta berskala 1 : 200.000, jarak rumah ke pantai 9 cm. Ayah mengemudi dengan kecepatan rata-rata 36 km/jam. Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Jarak sebenarnya (km) = …", answer: "18" },
            { prompt: "Waktu tempuh (menit) = …", answer: "30" },
            { prompt: "Kecepatan (km/jam) agar tiba 10 menit lebih cepat = …", answer: "54" },
          ],
          explanation: "9 × 200.000 = 1.800.000 cm = 18 km. 18 : 36 = ½ jam = 30 menit. Supaya 20 menit (⅓ jam): 18 : ⅓ = 54 km/jam.",
        },
        {
          type: "MULTI_PART", points: 3,
          prompt: "Kelas 7C berisi 40 siswa dengan rasio laki-laki : perempuan 3 : 5. Pada ulangan, ⅗ siswa laki-laki dan ⅘ siswa perempuan mencapai KKM.",
          parts: [
            { prompt: "Banyak siswa laki-laki = …", marks: 1, answer: "15" },
            { prompt: "Banyak siswa yang mencapai KKM = …", marks: 1, answer: "29" },
            { prompt: "Persen siswa yang mencapai KKM = …", marks: 1, answer: "72.5" },
          ],
          explanation: "Laki-laki 3/8 × 40 = 15, perempuan 25. Mencapai KKM: ⅗ × 15 = 9 dan ⅘ × 25 = 20, total 29. 29/40 = 72,5%.",
        },
        {
          type: "MULTI_PART", points: 3,
          prompt: "Deterjen dijual dalam tiga kemasan: 800 g seharga Rp20.800, 1,5 kg seharga Rp37.500, dan 3 kg seharga Rp72.000. Tulis rupiah tanpa titik ribuan.",
          parts: [
            { prompt: "Harga per 100 g kemasan 800 g = …", marks: 1, answer: "2600" },
            { prompt: "Harga per 100 g kemasan 3 kg = …", marks: 1, answer: "2400" },
            { prompt: "Berapa rupiah lebih hemat membeli 3 kg dalam kemasan 3 kg daripada dengan harga per 100 g kemasan 800 g?", marks: 1, answer: "6000" },
          ],
          explanation: "800 g: 20.800 : 8 = 2.600 per 100 g. 3 kg: 72.000 : 30 = 2.400 per 100 g. 3 kg dengan harga kemasan kecil: 30 × 2.600 = 78.000, jadi hemat 6.000.",
        },
        {
          type: "FIND_MISTAKE", points: 3,
          prompt: "Dina menyederhanakan rasio ⅔ : 4/9. Di baris mana ia pertama kali salah?",
          lines: ["⅔ : 4/9", "= ⅔ × 4/9", "= 8/27", "rasio = 8 : 27"],
          wrongIndex: 1,
          correction: "",
          explanation: "Membagi berarti mengalikan dengan kebalikan pembagi: ⅔ × 9/4 = 3/2, jadi rasionya 3 : 2. Cara lain: kalikan kedua bagian dengan 9, 6 : 4 = 3 : 2.",
        },
        {
          type: "FIND_MISTAKE", points: 3,
          prompt: "Eko pergi ke kota berjarak 60 km dengan kecepatan 60 km/jam, lalu pulang dengan kecepatan 30 km/jam. Ia menghitung kecepatan rata-ratanya. Di baris mana ia pertama kali salah?",
          lines: ["waktu pergi = 60 : 60 = 1 jam", "waktu pulang = 60 : 30 = 2 jam", "kecepatan rata-rata = (60 + 30) : 2", "= 45 km/jam"],
          wrongIndex: 2,
          correction: "",
          explanation: "Kecepatan rata-rata = jarak total : waktu total = 120 : 3 = 40 km/jam, bukan rata-rata dua kecepatan.",
        },
      ],
    },

    // ─────────────────────────── Ujian Akhir Semester ───────────────────────────
    {
      title: "Ujian Akhir Semester — Semester 1 (Bab 1–3)",
      style: "EXAM",
      settings: { timeLimitMinutes: 90, maxAttempts: 1, randomizeQuestionOrder: true },
      questions: [
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Suhu pagi hari −4 °C dan naik teratur 2¼ derajat setiap jam. Suhu 5 °C tercapai setelah…", options: ["4 jam", "2 jam", "3 jam", "9 jam"], answer: "A", explanation: "Perlu naik 5 − (−4) = 9 derajat. 9 : 2¼ = 9 × 4/9 = 4 jam." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio umur Arif : Bayu sekarang 4 : 7. Enam tahun lalu rasionya 1 : 2. Umur Bayu sekarang adalah…", options: ["42 tahun", "24 tahun", "21 tahun", "36 tahun"], answer: "A", explanation: "Coba kelipatan 4 : 7. Untuk 24 : 42, enam tahun lalu 18 : 36 = 1 : 2. Cocok, jadi Bayu 42 tahun." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio FPB(24, 36, 60) : KPK(24, 36, 60) adalah…", options: ["1 : 30", "1 : 12", "2 : 5", "1 : 360"], answer: "A", explanation: "24 = 2³ × 3, 36 = 2² × 3², 60 = 2² × 3 × 5. FPB 12, KPK 360. 12 : 360 = 1 : 30." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Nilai dari (−¾)² − (−½)³ : ¼ adalah…", options: ["17/16", "1/16", "−7/16", "11/16"], answer: "A", explanation: "(−¾)² = 9/16. (−½)³ = −1/8, dan −1/8 : ¼ = −1/2. Jadi 9/16 − (−1/2) = 9/16 + 8/16 = 17/16." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pada peta berskala 1 : 400.000, jarak rumah ke kebun raya 5,4 cm. Dita bersepeda dengan kecepatan 18 km/jam. Waktu tempuhnya adalah…", options: ["1 jam 12 menit", "1 jam 20 menit", "1,2 menit", "12 menit"], answer: "A", explanation: "5,4 × 400.000 = 2.160.000 cm = 21,6 km. 21,6 : 18 = 1,2 jam = 1 jam 12 menit (0,2 jam = 12 menit, bukan 20 menit)." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Manakah yang nilainya paling KECIL?", options: ["−0,5²", "(−0,5)²", "−0,5 : 0,25", "(−0,5)³"], answer: "C", explanation: "−0,5² = −0,25 (yang dipangkatkan hanya 0,5); (−0,5)² = 0,25; −0,5 : 0,25 = −2; (−0,5)³ = −0,125. Terkecil −2." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Bilangan bulat positif terbesar n yang membuat 3/n > 0,15 adalah…", options: ["19", "20", "21", "18"], answer: "A", explanation: "3/n > 0,15 berarti n < 3 : 0,15 = 20. Bilangan bulat terbesar di bawah 20 adalah 19 (3/20 tepat 0,15, belum lebih)." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Harga sebuah barang naik 10%, lalu naik 10% lagi dari harga barunya. Rasio harga akhir : harga awal adalah…", options: ["121 : 100", "120 : 100", "11 : 10", "6 : 5"], answer: "A", explanation: "1,1 × 1,1 = 1,21 = 121 : 100. Kenaikan totalnya 21%, bukan 20%." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio banyak faktor prima yang berbeda dari 360 terhadap banyak faktor positifnya adalah…", options: ["1 : 8", "3 : 8", "1 : 4", "1 : 24"], answer: "A", explanation: "360 = 2³ × 3² × 5: faktor prima berbeda 3 (2, 3, 5). Banyak faktor (3+1)(2+1)(1+1) = 24. 3 : 24 = 1 : 8." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Tiga bel berbunyi setiap ⅘ menit, 1⅕ menit, dan 2 menit. Ketiganya baru saja berbunyi bersamaan. Mereka berbunyi bersamaan lagi setelah…", options: ["12 menit", "2,4 menit", "24 menit", "6 menit"], answer: "A", explanation: "Dalam satuan ⅕ menit: 4, 6, dan 10. KPK(4, 6, 10) = 60, yaitu 60 × ⅕ = 12 menit." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio keliling dua persegi 3 : 4. Luas persegi yang kecil 36 cm². Luas persegi yang besar adalah…", options: ["64 cm²", "48 cm²", "27 cm²", "100 cm²"], answer: "A", explanation: "Keliling sebanding dengan sisi, jadi sisi 6 cm dan 8 cm. Luas besar 64 cm². (Rasio luas 3² : 4² = 9 : 16.)" },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rata-rata dari −1,2; ⅖; −⅗; dan 2 adalah…", options: ["0,15", "0,6", "−0,15", "1,05"], answer: "A", explanation: "Dalam desimal: −1,2 + 0,4 − 0,6 + 2 = 0,6. Dibagi 4: 0,15." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Sepuluh orang direncanakan menyelesaikan pekerjaan dalam 21 hari. Setelah 6 hari, datang 5 orang tambahan. Pekerjaan itu selesai lebih cepat dari rencana selama…", options: ["5 hari", "10 hari", "7 hari", "4 hari"], answer: "A", explanation: "Total 10 × 21 = 210 hari-orang; 6 hari memakai 60, sisa 150. Lima belas orang: 10 hari. Seluruhnya 16 hari, 5 hari lebih cepat." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Harga 2,5 kg anggur Rp105.000 dan 1,5 kg jeruk Rp27.000. Rasio harga per kg anggur : jeruk adalah…", options: ["7 : 3", "35 : 9", "3 : 7", "5 : 3"], answer: "A", explanation: "Per kg: anggur 42.000, jeruk 18.000. 42 : 18 = 7 : 3. (35 : 9 adalah rasio harga totalnya, bukan per kg.)" },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pada denah berskala 1 : 150, sebuah kolam berukuran 4 cm × 2 cm dengan kedalaman 1,5 m. Volume air saat kolam penuh adalah…", options: ["27.000 liter", "2.700 liter", "18.000 liter", "27 liter"], answer: "A", explanation: "Kolam sebenarnya 6 m × 3 m. Volume 6 × 3 × 1,5 = 27 m³ = 27.000 liter." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Pernyataan yang BENAR adalah…", options: ["−2/3 < −0,6", "(−1)¹⁰¹ > 0", "0,1 × 0,1 = 0,1", "3/0 = 0"], answer: "A", explanation: "−2/3 ≈ −0,667 lebih jauh dari nol daripada −0,6. (−1)¹⁰¹ = −1; 0,1 × 0,1 = 0,01; pembagian dengan nol tidak terdefinisi." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Rasio kecepatan A : B = 5 : 4. A membutuhkan 48 menit untuk menempuh sebuah jarak. B membutuhkan waktu…", options: ["60 menit", "38,4 menit", "48 menit", "64 menit"], answer: "A", explanation: "Jarak tetap, jadi waktu berbalik nilai dengan kecepatan: waktu A : B = 4 : 5. 48 : 4 × 5 = 60 menit." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Setelah didiskon 25% lalu dikenai pajak 10% dari harga setelah diskon, harga sebuah tas Rp66.000. Harga tas sebelum diskon adalah…", options: ["Rp80.000", "Rp75.000", "Rp89.100", "Rp72.000"], answer: "A", explanation: "Harga awal × 0,75 × 1,1 = 66.000, jadi harga awal = 66.000 : 0,825 = 80.000." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Bentuk paling sederhana dari (3² × 2⁴) : (2³ × 3) adalah…", options: ["6", "3/2", "12", "2/3"], answer: "A", explanation: "3²/3 = 3 dan 2⁴/2³ = 2. Hasilnya 3 × 2 = 6." },
        { type: "MULTIPLE_CHOICE", points: 2, prompt: "Apa keluaran kode Python berikut?\n\nfrom fractions import Fraction\nprint(Fraction(3, 4) / Fraction(9, 10))", options: ["5/6", "27/40", "6/5", "0.8333333333333334"], answer: "A", explanation: "3/4 : 9/10 = 3/4 × 10/9 = 30/36 = 5/6. Fraction mencetak pecahan paling sederhana, bukan desimal." },
        { type: "NUMERIC", points: 3, prompt: "Hitung: (−2)³ + 1½ × (−4) − 18 : (−¾)", answer: 10, explanation: "(−2)³ = −8. 1½ × (−4) = −6. 18 : (−¾) = −24. Jadi −8 + (−6) − (−24) = 10." },
        { type: "NUMERIC", points: 3, prompt: `Uang Rp1.950.000 dibagi dengan rasio ¼ : ⅓ : ½. Berapa rupiah bagian yang terbesar? ${RP}`, answer: 900000, explanation: "Kalikan 12: 3 : 4 : 6, total 13 bagian. Satu bagian 150.000, terbesar 6 bagian = 900.000." },
        { type: "NUMERIC", points: 3, prompt: "Sebuah tangki terisi ⅝ bagian. Setelah ditambah 18 liter, tangki terisi ⅞ bagian. Berapa liter isi tangki jika penuh?", answer: 72, explanation: "⅞ − ⅝ = ¼ bagian = 18 liter. Penuh: 18 × 4 = 72 liter." },
        { type: "NUMERIC", points: 3, prompt: "Jarak dua kota pada peta berskala 1 : 500.000 adalah 8,4 cm. Sebuah mobil melaju 56 km/jam. Berapa menit waktu tempuhnya?", answer: 45, explanation: "8,4 × 500.000 = 4.200.000 cm = 42 km. 42 : 56 = ¾ jam = 45 menit." },
        { type: "NUMERIC", points: 3, prompt: "FPB dua bilangan adalah 8 dan KPK-nya 240. Salah satu bilangan 40. Berapa bilangan yang lain?", answer: 48, explanation: "Hasil kali kedua bilangan = FPB × KPK = 8 × 240 = 1.920. 1.920 : 40 = 48." },
        { type: "NUMERIC", points: 3, prompt: `Harga kopi Rp160.000 per kg didiskon 15%. Berapa rupiah harga 350 g kopi setelah diskon? ${RP}`, answer: 47600, explanation: "160.000 × 0,85 = 136.000 per kg. 350 g = 0,35 kg: 136.000 × 0,35 = 47.600." },
        { type: "NUMERIC", points: 3, prompt: "Rasio A : B : C = 3 : 4 : 6 dan C − A = 15. Berapa A + B + C?", answer: 65, explanation: "C − A = 3 bagian = 15, jadi satu bagian 5. A + B + C = 13 bagian = 65." },
        { type: "NUMERIC", points: 3, prompt: "Ada berapa bilangan bulat n yang memenuhi −1¾ < n/4 ≤ 2,5?", answer: 17, explanation: "Kalikan 4: −7 < n ≤ 10. Bilangan bulatnya −6 sampai 10: ada 17." },
        { type: "NUMERIC", points: 3, prompt: "Kolam berisi 7,2 m³ diisi dari keran yang mengalirkan 24 liter per menit, tetapi kolam itu bocor 4 liter per menit. Berapa jam kolam itu penuh?", answer: 6, explanation: "7,2 m³ = 7.200 liter. Laju bersih 20 liter per menit. 7.200 : 20 = 360 menit = 6 jam." },
        { type: "NUMERIC", points: 3, prompt: "Sebuah foto diperbesar dengan faktor skala 2,5. Luas foto awal 96 cm². Berapa cm² luas foto setelah diperbesar?", answer: 600, explanation: "Luas dikali k² = 2,5² = 6,25. 96 × 6,25 = 600 cm²." },
        { type: "NUMERIC", points: 3, prompt: "Sirup 2¼ liter dicampur air dengan rasio sirup : air = 1 : 4. Campurannya dituang ke gelas-gelas berisi ¼ liter. Berapa gelas yang terisi?", answer: 45, explanation: "Air 4 × 2¼ = 9 liter, campuran 11¼ liter. 11¼ : ¼ = 45 gelas." },
        { type: "NUMERIC", points: 3, prompt: "Andi berlari 12 km/jam dan Budi bersepeda 20 km/jam. Mereka berangkat bersamaan dari tempat yang sama dengan arah berlawanan. Setelah berapa menit jarak mereka 8 km?", answer: 15, explanation: "Arah berlawanan: jarak bertambah 12 + 20 = 32 km setiap jam. 8 : 32 = ¼ jam = 15 menit." },
        { type: "NUMERIC", points: 3, prompt: "Rasio 3⁴ : 9² : 27 disederhanakan menjadi a : b : 1. Berapa a + b?", answer: 6, explanation: "3⁴ = 81, 9² = 81, 27. 81 : 81 : 27 = 3 : 3 : 1. a + b = 6." },
        { type: "NUMERIC", points: 3, prompt: "Dua belas mesin memproduksi 2.400 botol dalam 5 jam. Berapa jam yang dibutuhkan 9 mesin untuk memproduksi 3.600 botol?", answer: 10, explanation: "Satu mesin: 2.400 : (12 × 5) = 40 botol per jam. Sembilan mesin: 360 botol per jam. 3.600 : 360 = 10 jam." },
        {
          type: "STEPS", points: 3,
          prompt: "Bu Sari membeli 3 kg gula seharga Rp51.000, lalu mengemasnya per ¼ kg dan menjualnya Rp5.100 per bungkus. Kerjakan langkah demi langkah. Tulis rupiah tanpa titik ribuan.",
          steps: [
            { prompt: "Banyak bungkus = …", answer: "12" },
            { prompt: "Harga beli per bungkus (rupiah) = …", answer: "4250" },
            { prompt: "Keuntungan sebagai persen dari modal = …", answer: "20" },
          ],
          explanation: "3 : ¼ = 12 bungkus. Harga beli per bungkus 51.000 : 12 = 4.250. Untung per bungkus 850, dan 850 : 4.250 = 20%.",
        },
        {
          type: "STEPS", points: 3,
          prompt: "Pada peta berskala 1 : 300.000, jarak terminal ke kota tujuan 12 cm. Bus berangkat pukul 13.20 dengan kecepatan rata-rata 48 km/jam. Kerjakan langkah demi langkah.",
          steps: [
            { prompt: "Jarak sebenarnya (km) = …", answer: "36" },
            { prompt: "Waktu tempuh (menit) = …", answer: "45" },
            { prompt: "Jika bus berhenti 15 menit di perjalanan, bus tiba pukul 14.… (isi menitnya)", answer: "20" },
          ],
          explanation: "12 × 300.000 = 3.600.000 cm = 36 km. 36 : 48 = ¾ jam = 45 menit. 13.20 + 45 + 15 menit = 14.20.",
        },
        {
          type: "MULTI_PART", points: 3,
          prompt: "Di kelas 7D yang berisi 40 siswa, setiap siswa memilih satu olahraga: voli atau basket, dengan rasio voli : basket = 5 : 3. Lalu 4 siswa pindah dari voli ke basket.",
          parts: [
            { prompt: "Banyak siswa voli mula-mula = …", marks: 1, answer: "25" },
            { prompt: "Banyak siswa basket sekarang = …", marks: 1, answer: "19" },
            { prompt: "Persen siswa basket sekarang = …", marks: 1, answer: "47.5" },
          ],
          explanation: "Voli 5/8 × 40 = 25, basket 15. Setelah pindah: voli 21, basket 19. 19/40 = 47,5%.",
        },
        {
          type: "MULTI_PART", points: 3,
          prompt: "Minyak goreng dijual dalam tiga kemasan: 1 L seharga Rp19.800, 2 L seharga Rp38.000, dan 5 L seharga Rp92.500. Tulis rupiah tanpa titik ribuan.",
          parts: [
            { prompt: "Harga per liter kemasan 2 L = …", marks: 1, answer: "19000" },
            { prompt: "Harga per liter kemasan 5 L = …", marks: 1, answer: "18500" },
            { prompt: "Berapa rupiah lebih hemat membeli satu kemasan 5 L daripada lima kemasan 1 L?", marks: 1, answer: "6500" },
          ],
          explanation: "2 L: 38.000 : 2 = 19.000. 5 L: 92.500 : 5 = 18.500. Lima kemasan 1 L: 99.000, jadi hemat 99.000 − 92.500 = 6.500.",
        },
        {
          type: "FIND_MISTAKE", points: 3,
          prompt: "Tono menyederhanakan rasio 1,2 : ⅗. Di baris mana ia pertama kali salah?",
          lines: ["1,2 : ⅗", "= 1,2 : 0,6", "= 12 : 0,6 (dikali 10)", "= 20 : 1"],
          wrongIndex: 2,
          correction: "",
          explanation: "Kedua bagian rasio harus dikali bilangan yang sama: 12 : 6, lalu disederhanakan menjadi 2 : 1. Tono hanya mengalikan bagian pertama.",
        },
        {
          type: "FIND_MISTAKE", points: 3,
          prompt: "Lima pekerja menyelesaikan pagar dalam 12 hari. Lina menghitung waktu untuk 6 pekerja. Di baris mana ia pertama kali salah?",
          lines: ["5 pekerja → 12 hari", "6 pekerja → □ hari", "5 : 12 = 6 : □", "□ = 14,4 hari"],
          wrongIndex: 2,
          correction: "",
          explanation: "Pekerja dan hari berbalik nilai, jadi yang tetap hasil kalinya: 5 × 12 = 6 × □, sehingga □ = 10 hari. Lebih banyak pekerja tidak mungkin membuat pekerjaan lebih lama.",
        },
      ],
    },
  ],
};
