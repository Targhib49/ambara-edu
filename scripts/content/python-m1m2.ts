/**
 * Basic Python — Modul 1 & 2, book-style remake (Sept 2026).
 * Consumed by scripts/setup-python-m1m2.ts. Each lesson keeps its existing
 * CODE_EDITOR exercises and VISUALIZATION blocks (same rows, so playground links
 * keep working); its MARKDOWN and CODE_SNIPPET teaching moves into the PDF built
 * from `Python/Buku/<dir>`. Quizzes are not touched.
 *
 * New lesson layout: intro → PDF → (caption + visualization)* → exercise intro → editors → Cek Diri.
 */

export type PythonLessonSpec = {
  /** Exact current lesson title in the database — the lesson is matched by it. */
  title: string;
  dir: string;
  fileName: string;
  intro: string;
  /** Caption placed above each kept visualization, keyed by viz component name. */
  vizCaptions?: Record<string, string>;
  exercises: string;
  cekDiri: string[];
  next: string;
};

export const CHAPTERS = ["Modul 1: Dasar-Dasar Python", "Modul 2: Struktur Data & Fungsi"];

const book = (pages: string) =>
  `> 📘 Baca PDF di bawah (${pages} halaman). Ketik ulang contohnya di editor latihan, kerjakan **Latihan** di kertas, lalu cocokkan dengan **Kunci Jawaban** di halaman terakhir.`;

export const LESSONS: PythonLessonSpec[] = [
  // ───────────────────────────── Modul 1 ─────────────────────────────
  {
    title: "Pengenalan Python & Menjalankan Kode",
    dir: "m1-p1",
    fileName: "Python-M1-P1-Pengenalan-Python.pdf",
    intro: [
      "## Pengenalan Python & Menjalankan Kode",
      "",
      "Program adalah daftar instruksi yang dijalankan komputer **dari atas ke bawah, persis seperti yang ditulis**. Di pelajaran ini kamu menulis program pertamamu dengan `print()`, membedakan teks dari perhitungan, dan belajar membaca pesan error.",
      "",
      "Sebelum membaca, kerjakan dulu kotak **Coba Tebak Dulu** di halaman pertama.",
      "",
      book("±10"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nSekarang giliranmu. Jalankan setiap kotak kode, kerjakan TODO-nya, lalu jalankan lagi. Kalau muncul error, pakai **tiga langkah membaca error** dari Bagian 5 PDF.",
    cekDiri: [
      "menulis `print()` untuk teks dan untuk hasil perhitungan,",
      "menjelaskan kenapa `print(\"3\" + \"4\")` mencetak `34`,",
      "memakai `#` untuk komentar,",
      "menemukan baris yang salah dari pesan error.",
    ],
    next: "Lanjut ke kuis **Pengenalan Python & Menjalankan Kode — Latihan Kode**. 💪",
  },
  {
    title: "Variabel & Tipe Data",
    dir: "m1-p2",
    fileName: "Python-M1-P2-Variabel-Tipe-Data.pdf",
    intro: [
      "## Variabel & Tipe Data",
      "",
      "Di matematika `s = s + 5` mustahil, tetapi di Python baris itu masuk akal. Pelajaran ini menjelaskan kenapa, memperkenalkan **tabel jejak** untuk menelusuri program di kepala, dan empat tipe data dasar Python.",
      "",
      book("±9"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nKerjakan ketiga latihan di bawah. Untuk Latihan 3, buat dulu **tabel jejaknya** di kertas sebelum menulis kode.",
    cekDiri: [
      "menjelaskan arti `=` di Python (hitung kanan, simpan ke kiri),",
      "membuat tabel jejak untuk program 4–5 baris,",
      "menyebut tipe dari `13`, `1.5`, `\"13\"`, dan `True`,",
      "memperbaiki `TypeError` karena menjumlahkan teks dengan angka.",
    ],
    next: "Lanjut ke kuis **Variabel & Tipe Data — Latihan Kode**. 💪",
  },
  {
    title: "Input & Output",
    dir: "m1-p3",
    fileName: "Python-M1-P3-Input-Output.pdf",
    intro: [
      "## Input & Output",
      "",
      "Program yang berguna menerima **masukan** dan memberi **keluaran**. Kamu akan belajar merapikan tampilan dengan `sep`, `end`, dan **f-string**, lalu meminta masukan dengan `input()`, termasuk satu jebakan yang dialami hampir semua pemula.",
      "",
      book("±10"),
      "",
      "> ⚠️ Editor latihan di halaman ini belum bisa menerima ketikan, jadi `input()` di sini langsung error. Di latihan, nilai masukannya diisi langsung di variabel. Di kuis **Latihan Kode**, masukannya disediakan otomatis, jadi di sana kamu **wajib** memakai `input()`.",
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nAnggap variabel di baris-baris awal setiap latihan adalah jawaban yang diketik pengguna.",
    cekDiri: [
      "memakai `sep` dan `end` di `print()`,",
      "menulis f-string dan membatasi desimal dengan `:.2f`,",
      "menjelaskan kenapa `input()` selalu menghasilkan teks,",
      "menulis `int(input(...))` dengan urutan yang benar.",
    ],
    next: "Lanjut ke kuis **Input & Output — Latihan Kode**. Di sana, baca masukan dengan `input()`. 💪",
  },
  {
    title: "Operator",
    dir: "m1-p4",
    fileName: "Python-M1-P4-Operator.pdf",
    intro: [
      "## Operator",
      "",
      "47 telur dikemas 10 per kotak: berapa kotak penuh, berapa sisa? Python menjawab masing-masing dengan **satu operator**. Pelajaran ini membahas `//`, `%`, `**`, urutan pengerjaan, `+=`, perbandingan, dan operator logika `and`/`or`/`not`.",
      "",
      book("±9"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nLatihan 3 memakai trik `// 10` dan `% 10` dari Bagian 1 PDF.",
    cekDiri: [
      "menghitung `//` dan `%` tanpa kalkulator,",
      "menentukan urutan pengerjaan sebuah ekspresi,",
      "membedakan `=` dan `==`,",
      "menentukan hasil `and` dan `or` untuk dua syarat.",
    ],
    next: "Lanjut ke kuis **Operator — Latihan Kode**. 💪",
  },
  {
    title: "Percabangan (if / elif / else)",
    dir: "m1-p5",
    fileName: "Python-M1-P5-Percabangan.pdf",
    intro: [
      "## Percabangan (if / elif / else)",
      "",
      "Program Pak Guru memberi nilai **C** untuk nilai 95, padahal setiap syaratnya benar. Pelajaran ini membahas cara Python membaca `if`, `elif`, dan `else`, kenapa **urutan syarat** sangat penting, dan peran indentasi.",
      "",
      book("±10"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nSetelah setiap latihan jalan, **ubah angkanya** untuk menguji setiap cabang, bukan hanya satu.",
    cekDiri: [
      "menulis `if`/`else` dengan titik dua dan indentasi yang benar,",
      "mengurutkan `elif` dari syarat paling ketat ke paling longgar,",
      "memilih antara `and` dan percabangan bersarang,",
      "menjelaskan kenapa `\"\"` dan `0` dianggap `False`.",
    ],
    next: "Lanjut ke kuis **Percabangan (if / elif / else) — Latihan Kode**. 💪",
  },
  {
    title: "Perulangan (for / while)",
    dir: "m1-p6",
    fileName: "Python-M1-P6-Perulangan.pdf",
    intro: [
      "## Perulangan (for / while)",
      "",
      "Mencetak tabel perkalian sampai 100 tanpa menulis 100 baris `print()`. Pelajaran terakhir Modul 1 membahas `for` dengan `range()`, **pola akumulator**, `while`, serta `break` dan `continue`.",
      "",
      book("±9"),
    ].join("\n"),
    vizCaptions: {
      loop_stepper:
        "## Visualisasi: Pola Akumulator\n\nIni perulangan dari Bagian 2 PDF (`total += angka` untuk angka 1 sampai 5). Tekan tombol langkah dan perhatikan penampungnya bertambah setiap putaran, lalu berhenti **sebelum** angka akhir, sama seperti `range()`.",
    },
    exercises: "## Latihan di Editor\n\nIngat tiga tempat pola akumulator: siapkan **sebelum** perulangan, ubah **di dalam**, pakai **sesudah**.",
    cekDiri: [
      "menuliskan angka yang dihasilkan `range(a, b, langkah)`,",
      "memakai pola akumulator untuk menjumlah dan menghitung,",
      "memilih `for` atau `while` untuk sebuah soal,",
      "menjelaskan apa yang membuat sebuah `while` berhenti.",
    ],
    next: "Lanjut ke kuis **Perulangan (for / while) — Latihan Kode**, lalu uji seluruh Modul 1 dengan **Modul 1 — Latihan Mandiri**. 🎉",
  },

  // ───────────────────────────── Modul 2 ─────────────────────────────
  {
    title: "List",
    dir: "m2-p1",
    fileName: "Python-M2-P1-List.pdf",
    intro: [
      "## List",
      "",
      "Satu variabel untuk nilai ulangan seluruh kelas. Pelajaran ini membahas index (yang dimulai dari **0**), slicing, method list, pola **menyaring**, dan satu jebakan saat menyalin list.",
      "",
      book("±10"),
    ].join("\n"),
    vizCaptions: {
      structure_ops:
        "## Visualisasi: List sebagai Tumpukan (Stack)\n\n`.append()` menaruh elemen di ujung list, dan `.pop()` mengambil dari ujung yang sama, seperti tumpukan piring. Tekan **push** dan **pop** untuk melihat bahwa yang terakhir masuk selalu keluar duluan.",
      sorting_visualizer:
        "## Visualisasi: Di Balik `.sort()`\n\nSatu baris `.sort()` menyembunyikan banyak perbandingan. Visualisasi ini memperagakan *bubble sort*: dua elemen bertetangga dibandingkan dan ditukar jika urutannya terbalik, berulang sampai rapi. Kamu tidak perlu menulisnya sendiri, tetapi ini cara komputer bekerja di dalamnya.",
    },
    exercises: "## Latihan di Editor\n\nUntuk Latihan 2 bagian 4 dan Latihan 3, pakai pola **menyaring** dari Bagian 4 PDF: mulai dari list kosong, lalu `append` di dalam perulangan.",
    cekDiri: [
      "mengambil elemen dengan index positif dan negatif,",
      "menjelaskan beda `.sort()` dan `sorted()`,",
      "membuat list baru dengan pola menyaring,",
      "menjelaskan kenapa `b = a` bukan salinan.",
    ],
    next: "Lanjut ke kuis **List — Latihan Kode**. 💪",
  },
  {
    title: "Fungsi",
    dir: "m2-p2",
    fileName: "Python-M2-P2-Fungsi.pdf",
    intro: [
      "## Fungsi",
      "",
      "Tulis sekali, pakai berkali-kali. Pelajaran ini membahas `def`, parameter, nilai bawaan, variabel lokal, dan pembeda terpenting dalam pelajaran ini: **`return` atau `print()`**.",
      "",
      book("±10"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nSetiap fungsi yang kamu tulis sebaiknya **`return`**, lalu hasilnya dicetak di luar fungsi. Uji setiap fungsi dengan data kecil yang jawabannya sudah kamu tahu.",
    cekDiri: [
      "membuat fungsi dengan `def` dan memanggilnya,",
      "menjelaskan urutan jalannya program yang memanggil fungsi,",
      "membedakan `return` dan `print()`,",
      "memakai parameter dengan nilai bawaan.",
    ],
    next: "Lanjut ke kuis **Fungsi — Latihan Kode**. 💪",
  },
  {
    title: "Dictionary",
    dir: "m2-p3",
    fileName: "Python-M2-P3-Dictionary.pdf",
    intro: [
      "## Dictionary",
      "",
      "Data yang diambil lewat **nama**, bukan nomor. Pelajaran ini membahas pasangan key–value, cara menghindari `KeyError`, menelusuri dengan `.items()`, dan pola **menghitung frekuensi** yang sangat berguna.",
      "",
      book("±9"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nLatihan 3 memakai pola frekuensi dari Bagian 5 PDF: `hitung[x] = hitung.get(x, 0) + 1`.",
    cekDiri: [
      "menambah, mengubah, dan menghapus pasangan di dictionary,",
      "menjelaskan kenapa `85 in nilai` bisa `False`,",
      "menelusuri dengan `for k, v in d.items():`,",
      "menghitung frekuensi dengan `.get(x, 0) + 1`.",
    ],
    next: "Lanjut ke kuis **Dictionary — Latihan Kode**. 💪",
  },
  {
    title: "Manipulasi String",
    dir: "m2-p4",
    fileName: "Python-M2-P4-Manipulasi-String.pdf",
    intro: [
      "## Manipulasi String",
      "",
      "Kenapa `nama.strip()` seolah tidak berbuat apa-apa? Pelajaran ini membahas string sebagai urutan karakter, sifatnya yang **tidak bisa diubah**, method yang sering dipakai, serta pasangan `split()` dan `join()`.",
      "",
      book("±9"),
    ].join("\n"),
    exercises: "## Latihan di Editor\n\nIngat: method string menghasilkan string **baru**. Jangan lupa menyimpan hasilnya, misalnya `teks = teks.strip()`.",
    cekDiri: [
      "mengambil bagian string dengan index dan slicing,",
      "menjelaskan kenapa hasil method harus ditugaskan kembali,",
      "merapikan masukan sebelum membandingkan,",
      "memecah dan menggabungkan teks dengan `split()` dan `join()`.",
    ],
    next: "Lanjut ke kuis **Manipulasi String — Latihan Kode**. 💪",
  },
  {
    title: "Proyek Mini: Penghitung Nilai Rata-Rata Kelas",
    dir: "m2-p5",
    fileName: "Python-M2-P5-Proyek-Mini.pdf",
    intro: [
      "## Proyek Mini: Penghitung Nilai Rata-Rata Kelas",
      "",
      "Saatnya menggabungkan semuanya. PDF di bawah membangun sebuah program contoh, **Rekap Tabungan Kelas**, langkah demi langkah: data → fungsi → mengolah → laporan. Setelah itu kamu membangun proyekmu sendiri di editor dengan cara yang sama.",
      "",
      book("±9"),
    ].join("\n"),
    exercises: [
      "## Proyekmu",
      "",
      "Kerjakan TODO di editor pertama (**proyek utama**) **satu per satu**, dan jalankan setiap selesai satu. Tabel di Bagian 7 PDF memetakan setiap TODO ke langkah contohnya. Macet? Buka **Daftar Periksa** di Bagian 6.",
      "",
      "Setelah proyek utama selesai, lanjutkan ke dua latihan tambahan: laporan yang rapi dan statistik lengkap kelas.",
    ].join("\n"),
    cekDiri: [
      "memecah masalah menjadi langkah data → fungsi → mengolah → laporan,",
      "menguji fungsi dengan data kecil yang jawabannya sudah kamu tahu,",
      "menjalankan program setiap selesai satu langkah,",
      "memakai lagi pola akumulator, menyaring, dan mencari terbesar.",
    ],
    next: "Lanjut ke kuis **Proyek Mini — Latihan Kode**, lalu uji seluruh Modul 2 dengan **Modul 2 — Latihan Mandiri**. 🎉",
  },
];
