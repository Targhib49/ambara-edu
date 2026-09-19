/**
 * Intermediate Math — Bab 3: Rasio, book-style remake (Sept 2026).
 * Consumed by scripts/setup-math-bab.ts. Same shape as Bab 1–2: each Sesi =
 * intro markdown → inline PDF (built from `Mid Math/Buku/<dir>`) → self-check
 * markdown, plus a lesson-linked "Latihan Mandiri" quiz whose items never
 * repeat the practice questions printed (with answers) in the PDFs.
 *
 * Ratio answers are asked as multiple choice or as a missing number, never
 * typed as "a:b": a mistyped ratio would land in the tutor's review queue.
 * Every answer was recomputed in Python (fractions.Fraction) before being written down.
 */
import type { BabContent, Block } from "./math-types";

const DEC = "Untuk desimal gunakan titik, misalnya 0.25.";
const RP = "Tulis angkanya tanpa titik ribuan, misalnya 42000.";

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

const FORMAT_NOTE = "Desimal memakai **titik** (misalnya `0.25`), rupiah ditulis tanpa titik ribuan (misalnya `42000`).";

export const BAB3: BabContent = {
  chapterTitle: "Bab 3: Rasio",
  pdfPrefix: "Bab3-",
  sesi: [
    // ───────────────────────────── Sesi 12 ─────────────────────────────
    {
      title: "Sesi 12 — Mengenal Rasio",
      blocks: [
        intro(
          "Mengenal Rasio",
          [
            "\"Tomat lebih banyak 3 pot\" dan \"untuk setiap 2 pot cabai ada 3 pot tomat\" adalah dua cara membandingkan. Yang kedua disebut **rasio**, dan ia membandingkan dengan **perkalian**.",
            "",
            "Sesi ini membahas cara menulis, membaca, dan menyederhanakan rasio, termasuk rasio desimal, pecahan, satuan berbeda, dan rasio tiga besaran.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 3 Subbab A (hal. 87–98). PDF ini 8 halaman."
        ),
        { type: "PDF", dir: "bab3-sesi12", fileName: "Bab3-Sesi12-Mengenal-Rasio.pdf" },
        closing(
          [
            "menulis rasio a : b dan menjelaskan artinya, termasuk urutannya,",
            "mengubah rasio bagian : bagian menjadi pecahan dari keseluruhan,",
            "menyederhanakan rasio desimal, pecahan, dan satuan berbeda,",
            "membagi sebuah jumlah dengan rasio dua atau tiga besaran,",
            "menjelaskan beda perbandingan selisih dan perbandingan rasio.",
          ],
          `Lanjut ke **Sesi 12 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 12 — Latihan Mandiri",
        questions: [
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Di sebuah kelas ada 15 siswa laki-laki dan 20 siswa perempuan. Rasio laki-laki : perempuan dalam bentuk paling sederhana adalah…", options: ["3 : 4", "4 : 3", "15 : 35", "3 : 7"], answer: "A", explanation: "15 : 20, bagi dengan FPB(15, 20) = 5, menjadi 3 : 4. Urutannya mengikuti kalimat: laki-laki dulu." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Rasio kucing : kelinci di sebuah toko hewan 2 : 5. Bagian hewan yang kucing adalah…", options: ["2/7", "2/5", "5/7", "2/3"], answer: "A", explanation: "Rasio 2 : 5 berarti 2 + 5 = 7 bagian seluruhnya. Kucing 2 dari 7 bagian, yaitu 2/7. 2/5 adalah perbandingan kucing dengan kelinci, bukan dengan seluruh hewan." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Bentuk paling sederhana dari rasio 1,2 : 0,8 adalah…", options: ["3 : 2", "12 : 8", "2 : 3", "6 : 4"], answer: "A", explanation: "Kali 10 supaya bulat: 12 : 8. Bagi FPB 4: 3 : 2. 12 : 8 dan 6 : 4 senilai, tetapi belum paling sederhana." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Bentuk paling sederhana dari rasio 40 cm : 2 m adalah…", options: ["1 : 5", "20 : 1", "40 : 2", "1 : 50"], answer: "A", explanation: "Samakan satuan dulu: 2 m = 200 cm. 40 : 200 = 1 : 5." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] Uang Rp84.000 dibagi untuk Ayu dan Beni dengan rasio 3 : 4. Berapa rupiah bagian Beni? ${RP}`, answer: 48000, explanation: "3 + 4 = 7 bagian. Satu bagian = 84.000 : 7 = 12.000. Beni 4 bagian = 48.000." },
          { type: "NUMERIC", points: 2, prompt: "[Menengah] Rasio tepung : gula : mentega dalam sebuah resep 6 : 3 : 2. Jika tepungnya 480 gram, berapa gram menteganya?", answer: 160, explanation: "Satu bagian = 480 : 6 = 80 gram. Mentega 2 bagian = 160 gram." },
          { type: "MULTIPLE_CHOICE", points: 2, prompt: "[Menengah] Bentuk paling sederhana dari rasio ¾ : 1⅕ adalah…", options: ["5 : 8", "8 : 5", "3 : 5", "15 : 24"], answer: "A", explanation: "1⅕ = 6/5. Kalikan KPK(4, 5) = 20: 15 : 24. Bagi FPB 3: 5 : 8." },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Rasio kelereng Aji : Bara = 2 : 3. Setelah Aji memberikan 5 kelereng kepada Bara, rasionya menjadi 1 : 4. Berapa kelereng Aji mula-mula?", answer: 10, explanation: "Coba kelipatan 2 : 3. Untuk 10 : 15, setelah Aji memberi 5: 5 : 20 = 1 : 4. Cocok, jadi Aji mula-mula 10 kelereng. Perhatikan: jumlah kelereng tetap 25, hanya pembagiannya yang berubah." },
          { type: "MULTIPLE_CHOICE", points: 3, prompt: "[Tantangan] Rasio Ali : Bima = 3 : 4 dan Bima : Cita = 6 : 5. Rasio Ali : Bima : Cita adalah…", options: ["9 : 12 : 10", "3 : 4 : 5", "9 : 10 : 12", "3 : 10 : 5"], answer: "A", explanation: "Samakan angka Bima menjadi KPK(4, 6) = 12: 3 : 4 = 9 : 12 dan 6 : 5 = 12 : 10. Jadi 9 : 12 : 10." },
        ],
      },
    },

    // ───────────────────────────── Sesi 13 ─────────────────────────────
    {
      title: "Sesi 13 — Rasio Ekuivalen & Proporsi",
      blocks: [
        intro(
          "Rasio Ekuivalen & Proporsi",
          [
            "Jika 4 bungkus mi cukup untuk 6 orang, berapa bungkus untuk 15 orang? Jawaban \"13, karena tambah 9\" terdengar masuk akal, tetapi salah.",
            "",
            "Sesi ini membahas **rasio ekuivalen**, cara adil membandingkan dua campuran, dan **proporsi**: tiga cara mencari nilai yang hilang. Kamu juga belajar mengenali situasi yang *tidak* proporsional.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 3 Subbab A–B (hal. 91–94, 99–106). PDF ini 8 halaman."
        ),
        { type: "PDF", dir: "bab3-sesi13", fileName: "Bab3-Sesi13-Rasio-Ekuivalen-Proporsi.pdf" },
        closing(
          [
            "mengecek apakah dua rasio ekuivalen,",
            "membandingkan dua campuran dengan cara yang adil,",
            "mencari nilai yang hilang dengan faktor antar-rasio, faktor dalam-rasio, atau nilai satuan,",
            "menulis proporsi dengan urutan besaran yang benar,",
            "menguji apakah sebuah situasi proporsional.",
          ],
          `Lanjut ke **Sesi 13 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 13 — Latihan Mandiri",
        questions: [
          { type: "MULTI_SELECT", points: 1, prompt: "[Dasar] Pilih SEMUA rasio yang ekuivalen dengan 6 : 8.", options: ["3 : 4", "9 : 12", "12 : 14", "15 : 20"], answer: ["A", "B", "D"], explanation: "6 : 8 = 3 : 4. 9 : 12 dan 15 : 20 juga menjadi 3 : 4. 12 : 14 = 6 : 7, karena menambah 6 ke setiap bagian bukan mengalikan." },
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Isi kotaknya:  4 : 7 = □ : 42", answer: 24, explanation: "7 menjadi 42 berarti dikali 6. Maka 4 × 6 = 24." },
          { type: "NUMERIC", points: 1, prompt: `[Dasar] Harga 5 buku tulis Rp17.500. Berapa rupiah harga 8 buku tulis? ${RP}`, answer: 28000, explanation: "Nilai satuan: 1 buku = 17.500 : 5 = 3.500. 8 buku = 8 × 3.500 = 28.000." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Pasangan besaran mana yang TIDAK proporsional?", options: ["banyak kg beras dan harganya", "panjang sisi persegi dan kelilingnya", "ongkos taksi (ada tarif awal) dan jarak tempuh", "banyak tiket dan harga totalnya"], answer: "C", explanation: "Taksi dengan tarif awal: 0 km pun sudah membayar, jadi jarak dua kali tidak membuat ongkos dua kali. Tiga pasangan lain rasionya tetap." },
          { type: "MULTIPLE_CHOICE", points: 2, prompt: "[Menengah] Tiga campuran jus: P memakai 3 gelas jus untuk 5 gelas air, Q memakai 4 gelas jus untuk 7 gelas air, dan R memakai 5 gelas jus untuk 8 gelas air. Campuran mana yang paling pekat jusnya?", options: ["P", "Q", "R", "Ketiganya sama pekat"], answer: "C", explanation: "Bandingkan bagian jus: P = 3/8 = 0,375; Q = 4/11 ≈ 0,364; R = 5/13 ≈ 0,385. R paling besar." },
          { type: "NUMERIC", points: 2, prompt: "[Menengah] Sebuah mesin mengemas 450 botol dalam 6 menit. Dengan kecepatan yang sama, berapa botol yang dikemas dalam 20 menit?", answer: 1500, explanation: "Nilai satuan: 450 : 6 = 75 botol per menit. 20 menit: 75 × 20 = 1.500 botol." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] 2,4 kg daging cukup untuk 15 porsi rendang. Berapa kg daging untuk 40 porsi? ${DEC}`, answer: 6.4, explanation: "kg : porsi = 2,4 : 15 = □ : 40. Perkalian silang: 15 × □ = 2,4 × 40 = 96, jadi □ = 6,4 kg." },
          { type: "NUMERIC", points: 3, prompt: `[Tantangan] Resep nasi: 3 gelas beras untuk 5 gelas air. Nina keliru menuang 12 gelas air ke dalam 6 gelas beras. Berapa gelas beras yang harus ditambahkan supaya rasionya kembali benar (airnya tidak dikurangi)? ${DEC}`, answer: 1.2, explanation: "12 gelas air butuh beras 12 × 3/5 = 7,2 gelas. Sudah ada 6 gelas, jadi tambah 1,2 gelas." },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Dua bilangan berbanding 5 : 8, dan selisih keduanya 27. Berapa jumlah kedua bilangan itu?", answer: 117, explanation: "Selisih 8 − 5 = 3 bagian = 27, jadi satu bagian 9. Bilangannya 45 dan 72, jumlahnya 117 (13 bagian)." },
        ],
      },
    },

    // ───────────────────────────── Sesi 14 ─────────────────────────────
    {
      title: "Sesi 14 — Skala & Faktor Skala",
      blocks: [
        intro(
          "Skala & Faktor Skala",
          [
            "Peta, denah rumah, maket, dan foto yang diperbesar semuanya memakai rasio yang sama untuk setiap panjang. Itulah **skala**.",
            "",
            "Sesi ini membahas faktor skala, tiga jenis soal peta dan denah, cara memilih skala yang cocok, dan kenapa **luas** tidak mengikuti skala panjang.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 3 Subbab B (hal. 99–111). PDF ini 8 halaman."
        ),
        { type: "PDF", dir: "bab3-sesi14", fileName: "Bab3-Sesi14-Skala-Faktor-Skala.pdf" },
        closing(
          [
            "menentukan faktor skala dan memeriksa apakah dua gambar proporsional,",
            "mengubah km, m, dan cm dengan tangga satuan,",
            "menghitung jarak sebenarnya, jarak pada peta, dan skala,",
            "menjelaskan kenapa peta 1 : 10.000 lebih rinci daripada 1 : 1.000.000,",
            "menghitung luas sebenarnya dari denah (faktor k²).",
          ],
          `Lanjut ke **Sesi 14 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 14 — Latihan Mandiri",
        questions: [
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Peta berskala 1 : 500.000. Jarak dua kota di peta 6 cm. Berapa km jarak sebenarnya?", answer: 30, explanation: "6 × 500.000 = 3.000.000 cm. 1 km = 100.000 cm, jadi 30 km." },
          { type: "NUMERIC", points: 1, prompt: `[Dasar] Denah berskala 1 : 100. Panjang kamar sebenarnya 4,5 m. Berapa cm panjangnya pada denah? ${DEC}`, answer: 4.5, explanation: "4,5 m = 450 cm. 450 : 100 = 4,5 cm." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Jarak sebenarnya 12 km digambar 4 cm pada peta. Skala peta itu adalah…", options: ["1 : 300.000", "1 : 3.000", "1 : 30.000", "1 : 3"], answer: "A", explanation: "12 km = 1.200.000 cm. 4 : 1.200.000 = 1 : 300.000. Satuannya harus disamakan dulu." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Peta dengan skala manakah yang paling RINCI?", options: ["1 : 5.000", "1 : 50.000", "1 : 500.000", "1 : 5.000.000"], answer: "A", explanation: "Penyebut skala makin kecil berarti gambarnya makin besar dan rinci. 1 : 5.000 paling rinci." },
          { type: "NUMERIC", points: 2, prompt: "[Menengah] Foto berukuran 10 cm × 15 cm diperbesar secara proporsional sehingga sisi 15 cm menjadi 36 cm. Berapa cm sisi yang lain?", answer: 24, explanation: "Faktor skala k = 36 : 15 = 2,4. Sisi lain: 10 × 2,4 = 24 cm." },
          { type: "NUMERIC", points: 2, prompt: "[Menengah] Model kapal dibuat dengan skala 1 : 250. Panjang kapal sebenarnya 85 m. Berapa cm panjang modelnya?", answer: 34, explanation: "85 m = 8.500 cm. 8.500 : 250 = 34 cm." },
          { type: "NUMERIC", points: 2, prompt: "[Menengah] Jarak kota A ke kota B 60 km. Berapa cm jarak itu pada peta berskala 1 : 1.200.000?", answer: 5, explanation: "60 km = 6.000.000 cm. 6.000.000 : 1.200.000 = 5 cm." },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Pada denah berskala 1 : 200, sebuah kebun berbentuk persegi panjang 5 cm × 3 cm. Berapa m² luas kebun sebenarnya?", answer: 60, explanation: "Ubah panjangnya dulu: 5 × 200 = 1.000 cm = 10 m dan 3 × 200 = 600 cm = 6 m. Luas 10 × 6 = 60 m². (Luas di denah 15 cm² dikali 200² = 40.000, hasilnya juga 600.000 cm² = 60 m².)" },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Peta berskala 1 : 400.000 difotokopi dengan pengecilan 50%. Pada fotokopi, jarak dua desa 3 cm. Berapa km jarak sebenarnya?", answer: 24, explanation: "Setelah dikecilkan 50%, 3 cm di fotokopi sama dengan 6 cm di peta asli. 6 × 400.000 = 2.400.000 cm = 24 km. (Skala fotokopinya 1 : 800.000.)" },
        ],
      },
    },

    // ───────────────────────────── Sesi 15 ─────────────────────────────
    {
      title: "Sesi 15 — Laju Perubahan Satuan",
      blocks: [
        intro(
          "Laju Perubahan Satuan",
          [
            "Deterjen 800 g Rp22.000 atau 1,8 kg Rp46.800: mana yang lebih hemat? Membandingkan rupiah dengan gram berarti membandingkan dua besaran dengan **satuan berbeda**. Rasio seperti itu disebut **laju**.",
            "",
            "Sesi ini membahas laju satuan (\"per satu\"), belanja hemat, kecepatan, dan jebakan kecepatan rata-rata.",
          ],
          "Selaras dengan Buku Siswa Matematika Kelas VII, Bab 3 Subbab C (hal. 112–117). PDF ini 7 halaman."
        ),
        { type: "PDF", dir: "bab3-sesi15", fileName: "Bab3-Sesi15-Laju-Perubahan-Satuan.pdf" },
        closing(
          [
            "membedakan rasio (satuan sama) dan laju (satuan berbeda),",
            "menghitung laju satuan dan memakainya untuk soal proporsi,",
            "memilih kemasan yang paling hemat dengan harga per satuan,",
            "menghitung jarak, kecepatan, dan waktu, serta mengubah km/jam ke m/detik,",
            "menghitung kecepatan rata-rata dari jarak total dan waktu total.",
          ],
          `Lanjut ke **Sesi 15 — Latihan Mandiri** (9 soal). ${FORMAT_NOTE} 💪`
        ),
      ],
      quiz: {
        title: "Sesi 15 — Latihan Mandiri",
        questions: [
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Sebuah mobil menempuh 180 km dalam 2,5 jam. Berapa km/jam kecepatan rata-ratanya?", answer: 72, explanation: "Kecepatan = jarak : waktu = 180 : 2,5 = 72 km/jam." },
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Ubah 54 km/jam menjadi m/detik.", answer: 15, explanation: "Bagi dengan 3,6: 54 : 3,6 = 15 m/detik. (54.000 m dalam 3.600 detik.)" },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Kemasan gula mana yang paling hemat?", options: ["1 kg seharga Rp17.000", "2 kg seharga Rp33.000", "500 g seharga Rp8.800", "5 kg seharga Rp84.000"], answer: "B", explanation: "Harga per kg: Rp17.000; Rp16.500; Rp17.600; Rp16.800. Termurah per kg adalah kemasan 2 kg." },
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Sebuah keran mengalirkan 12 liter air setiap menit. Berapa menit untuk mengisi 300 liter?", answer: 25, explanation: "Waktu = 300 : 12 = 25 menit." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] Seorang pelari menempuh 100 m dalam 12,5 detik. Berapa m/detik kecepatannya? ${DEC}`, answer: 8, explanation: "100 : 12,5 = 8 m/detik." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] Sebuah motor dapat menempuh 42 km dengan 1 liter bensin. Harga bensin Rp10.000 per liter. Berapa rupiah biaya bensin untuk menempuh 294 km? ${RP}`, answer: 70000, explanation: "Bensin: 294 : 42 = 7 liter. Biaya: 7 × 10.000 = 70.000." },
          { type: "MULTIPLE_CHOICE", points: 2, prompt: "[Menengah] Kota P berpenduduk 540.000 orang dengan luas 45 km². Kota Q berpenduduk 420.000 orang dengan luas 30 km². Kota R berpenduduk 300.000 orang dengan luas 20 km². Kota mana yang paling padat?", options: ["P", "Q", "R", "P dan Q sama padat"], answer: "C", explanation: "Kepadatan: P 12.000, Q 14.000, R 15.000 orang/km². R paling padat walaupun penduduknya paling sedikit." },
          { type: "NUMERIC", points: 3, prompt: `[Tantangan] Pukul 07.00 Budi bersepeda dari rumah ke sekolah yang berjarak 5 km dengan kecepatan 15 km/jam. Pukul 07.10 adiknya berangkat dari rumah yang sama naik motor dengan kecepatan 40 km/jam. Berapa menit adiknya tiba lebih dulu daripada Budi? ${DEC}`, answer: 2.5, explanation: "Budi: 5 : 15 = 1/3 jam = 20 menit, tiba 07.20. Adik: 5 : 40 = 1/8 jam = 7,5 menit, tiba 07.17,5. Adik lebih dulu 2,5 menit." },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Dewi pergi ke kota berjarak 30 km dengan kecepatan 60 km/jam, lalu pulang lewat jalan yang sama dengan kecepatan 40 km/jam. Berapa km/jam kecepatan rata-ratanya untuk seluruh perjalanan?", answer: 48, explanation: "Pergi 30 : 60 = 0,5 jam, pulang 30 : 40 = 0,75 jam. Jarak total 60 km, waktu total 1,25 jam. Rata-rata 60 : 1,25 = 48 km/jam, bukan 50." },
        ],
      },
    },

    // ───────────────────────────── Sesi 16 ─────────────────────────────
    {
      title: "Sesi 16 — Pengayaan: Berbalik Nilai, Grafik, Kurs & Python",
      blocks: [
        {
          type: "MARKDOWN",
          markdown: [
            "## Pengayaan: Berbalik Nilai, Grafik, Kurs & Python",
            "",
            "Sesi ini **pengayaan**. Makin banyak tukang, makin *sedikit* harinya: hubungan seperti itu disebut **perbandingan berbalik nilai**, dan proporsi biasa tidak berlaku di sana. Kamu juga melihat grafik kedua jenis perbandingan, menghitung **kurs mata uang** dan **bagi hasil**, lalu memakai **Python** untuk membandingkan banyak data sekaligus.",
            "",
            "Baca PDF-nya dulu, lalu jalankan kode di editor di bawah PDF. Tebak hasilnya sebelum menekan *Run*!",
            "",
            "> 📘 Perluasan Buku Siswa Matematika Kelas VII, Bab 3. PDF ini 7 halaman.",
          ].join("\n"),
        },
        { type: "PDF", dir: "bab3-pengayaan", fileName: "Bab3-Pengayaan-Berbalik-Nilai-Python.pdf" },
        {
          type: "MARKDOWN",
          markdown: [
            "## Coba Sendiri: Senilai atau Berbalik Nilai?",
            "",
            "Kode ini mencetak hasil bagi dan hasil kali setiap pasangan. Yang **tetap** menunjukkan jenis perbandingannya. Ganti isi `hari` dengan `[16, 24, 32, 48]` (harga total untuk 2, 3, 4, 6 buku). Kolom mana yang sekarang tetap?",
          ].join("\n"),
        },
        {
          type: "CODE_EDITOR",
          starterCode: [
            "tukang = [2, 3, 4, 6]",
            "hari = [60, 40, 30, 20]",
            "",
            "for i in range(4):",
            "    t, h = tukang[i], hari[i]",
            "    print(t, h, 'bagi:', h / t, 'kali:', t * h)",
            "",
          ].join("\n"),
        },
        {
          type: "MARKDOWN",
          markdown: [
            "## Coba Sendiri: Membagi Keuntungan dengan Rasio",
            "",
            "Dua teman membuka usaha dengan modal berbeda. Kode ini membagi keuntungan sesuai rasio modal. Ubah modal dan keuntungannya, lalu cek hasilnya dengan cara Sesi 12.",
          ].join("\n"),
        },
        {
          type: "CODE_EDITOR",
          starterCode: [
            "import math",
            "",
            "modal_a = 2000000",
            "modal_b = 3000000",
            "untung = 1500000",
            "",
            "fpb = math.gcd(modal_a, modal_b)",
            "a, b = modal_a // fpb, modal_b // fpb",
            "print('rasio modal', a, ':', b)",
            "",
            "satu_bagian = untung // (a + b)",
            "print('bagian A:', a * satu_bagian)",
            "print('bagian B:', b * satu_bagian)",
            "",
          ].join("\n"),
        },
        {
          type: "MARKDOWN",
          markdown: [
            "---",
            "",
            `Lanjut ke **Sesi 16 — Latihan Mandiri** (10 soal, termasuk 1 soal kode). ${FORMAT_NOTE}`,
            "",
            "Setelah itu, uji seluruh Bab 3 dengan **Latihan Penguasaan**, **Latihan Terpadu**, **Drill Kilat**, dua **Try Out**, dan **Ujian — Bab 3**. Semester 1 ditutup dengan **Persiapan UAS** dan **Ujian Akhir Semester** yang menggabungkan Bab 1–3. 🎉",
          ].join("\n"),
        },
      ],
      quiz: {
        title: "Sesi 16 — Latihan Mandiri",
        questions: [
          { type: "NUMERIC", points: 1, prompt: "[Dasar] Delapan pekerja menyelesaikan sebuah pekerjaan dalam 15 hari. Berapa hari jika pekerjanya 10 orang?", answer: 12, explanation: "Berbalik nilai: hasil kali tetap. 8 × 15 = 120 hari-orang. 120 : 10 = 12 hari." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Pasangan besaran mana yang BERBALIK NILAI?", options: ["banyak pensil dan harga totalnya", "kecepatan dan waktu tempuh untuk jarak yang sama", "jarak tempuh dan bensin yang dipakai", "sisi persegi dan kelilingnya"], answer: "B", explanation: "Kecepatan dua kali membuat waktu menjadi setengahnya, karena hasil kalinya (jarak) tetap. Tiga pasangan lain senilai." },
          { type: "NUMERIC", points: 1, prompt: `[Dasar] Misalkan kurs 1 USD = Rp15.500. Berapa rupiah untuk 120 USD? ${RP}`, answer: 1860000, explanation: "120 × 15.500 = 1.860.000." },
          { type: "MULTIPLE_CHOICE", points: 1, prompt: "[Dasar] Grafik manakah yang menunjukkan perbandingan senilai?", options: ["garis lurus yang melalui titik (0, 0)", "garis lurus yang memotong sumbu tegak di atas 0", "kurva turun yang tidak menyentuh sumbu", "garis mendatar"], answer: "A", explanation: "Senilai berarti 0 berpasangan dengan 0 dan rasionya tetap, jadi grafiknya garis lurus lewat titik asal. Garis yang memotong di atas 0 punya biaya awal, dan kurva turun adalah berbalik nilai." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] Persediaan air untuk 25 pendaki cukup untuk 6 hari. Jika 5 pendaki turun lebih dulu, persediaan itu cukup untuk berapa hari bagi yang tersisa? ${DEC}`, answer: 7.5, explanation: "25 × 6 = 150 porsi-hari. Tersisa 20 pendaki: 150 : 20 = 7,5 hari." },
          { type: "NUMERIC", points: 2, prompt: `[Menengah] Dodi dan Eko membuka usaha dengan modal Rp6.000.000 dan Rp4.000.000. Keuntungan Rp2.500.000 dibagi sesuai rasio modal. Berapa rupiah bagian Dodi? ${RP}`, answer: 1500000, explanation: "Rasio modal 6 : 4 = 3 : 2. Dodi 3/5 × 2.500.000 = 1.500.000." },
          { type: "MULTIPLE_CHOICE", points: 2, prompt: "[Menengah] Apa keluaran baris terakhir dari kode Python berikut?\n\nfor a in [1, 2, 4]:\n    print(a * (12 / a))", options: ["12.0", "48.0", "3.0", "12"], answer: "A", explanation: "a × (12 / a) selalu 12, apa pun a-nya: berbalik nilai. Karena ada pembagian /, hasilnya float, jadi yang tercetak 12.0." },
          { type: "NUMERIC", points: 3, prompt: "[Tantangan] Jalan desa dapat diselesaikan 15 orang dalam 24 hari. Setelah 8 hari bekerja, datang 5 orang lagi membantu. Berapa hari lagi jalan itu selesai?", answer: 12, explanation: "Seluruh pekerjaan 15 × 24 = 360 hari-orang. Dalam 8 hari terpakai 120, sisa 240. Sekarang 20 orang: 240 : 20 = 12 hari lagi." },
          { type: "NUMERIC", points: 3, prompt: `[Tantangan] Sebuah money changer memakai kurs jual Rp16.300/USD dan kurs beli Rp15.900/USD. Rina membeli 150 USD, lalu karena batal berlibur ia langsung menjual semuanya kembali. Berapa rupiah kerugiannya? ${RP}`, answer: 60000, explanation: "Rina membayar 150 × 16.300 = 2.445.000 dan menerima 150 × 15.900 = 2.385.000. Rugi 60.000, yaitu 150 × selisih kurs 400." },
          {
            type: "CODE",
            points: 4,
            prompt:
              "[Tantangan] Tulis program yang membaca tiga bilangan bulat dari input, masing-masing di barisnya sendiri: a, b, dan total. Bagi total dengan rasio a : b, lalu cetak kedua bagiannya di satu baris, dipisah spasi. Total selalu habis dibagi a + b.\n\nContoh: input 3, 7, 150000 → keluaran 45000 105000",
            tests: [
              { input: "3\n7\n150000", expectedOutput: "45000 105000" },
              { input: "2\n3\n1500000", expectedOutput: "600000 900000" },
              { input: "4\n7\n132000", expectedOutput: "48000 84000" },
              { input: "1\n1\n50", expectedOutput: "25 25" },
            ],
            explanation:
              "a = int(input())\nb = int(input())\ntotal = int(input())\nsatu = total // (a + b)\nprint(a * satu, b * satu)\n\nSatu bagian = total dibagi (a + b), persis seperti Sesi 12. Memakai // menjaga hasilnya bilangan bulat.",
          },
        ],
      },
    },
  ],
};
