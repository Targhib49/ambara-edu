/**
 * Basic Python, step-by-step unit 2: "Perulangan" (loops) as eight small
 * lessons, each teaching one idea. Builds on the Percabangan unit: from
 * lesson 4 on, loops and if work together. Block kinds and the lesson shape
 * are described in python-stepwise.ts; scripts/setup-python-stepwise.ts
 * --unit loop builds it.
 */
import { GUIDED_TAIL, INPUT_NOTE, md, once, py, type LessonSource, type Unit } from "./python-stepwise";

const CHAPTER_TITLE = "Perulangan: Langkah demi Langkah";
const START = "# Tulis kodemu di bawah ini.\n";
const intro = GUIDED_TAIL + "\n\n" + INPUT_NOTE;

// ───────────────────────────────────────────────────────────── Lesson 1

const L1: LessonSource = {
  title: "1. for dan range(): Mengulang Sebanyak n Kali",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Bayangkan kamu disuruh mencetak `Semangat!` 100 kali. Menulis `print` 100 kali? Melelahkan, dan kalau jumlahnya berubah menjadi 50, kamu harus menghapus 50 baris.",
      "",
      "**Loop** (perulangan) menyuruh Python **mengulang** sebuah blok kode. Kamu menulis kodenya sekali, Python yang mengulanginya.",
      "",
      "**Yang akan kamu pelajari:**",
      "- menulis `for ... in range(n):` untuk mengulang `n` kali",
      "- variabel loop: angka yang berubah di setiap putaran",
      "- `range(n)` dimulai dari **0** dan berhenti **sebelum** `n`"
    ),
    md(
      "## Bentuk `for`",
      "",
      "```python",
      "for i in range(3):",
      "    kode yang diulang",
      "```",
      "",
      "Mirip `if`: baris `for` diakhiri **titik dua**, dan blok yang diulang **menjorok** 4 spasi. Setiap kali blok selesai dijalankan disebut satu **putaran**."
    ),
    { kind: "example", code: py(`
for i in range(3):
    print("Semangat!")
`) },
    md(
      "### Variabel loop",
      "",
      "`i` disebut **variabel loop**. Di setiap putaran, Python mengisinya dengan angka berikutnya dari `range`. Coba cetak `i`:"
    ),
    { kind: "example", code: py(`
for i in range(5):
    print("Putaran ke", i)
`) },
    md(
      "Perhatikan dua hal penting tentang `range(5)`:",
      "",
      "- dimulai dari **0**, bukan 1,",
      "- berhenti **sebelum** 5, jadi angka 5 sendiri tidak ikut.",
      "",
      "Jumlah putarannya tetap 5 (0, 1, 2, 3, 4). Kalau kamu ingin nomor yang dimulai dari 1, cukup cetak `i + 1`.",
      "",
      "Nama `i` boleh diganti apa saja yang jelas, misalnya `nomor` atau `hari`."
    ),
    { kind: "example", code: py(`
for nomor in range(3):
    print("Soal nomor", nomor + 1)
`) },
    md(
      "### Di dalam dan di luar loop",
      "",
      "Sama seperti `if`: baris yang menjorok ikut diulang, baris yang kembali rata kiri dijalankan **sekali**, setelah loop selesai."
    ),
    {
      kind: "trace",
      title: "Berapa kali Selesai dicetak?",
      code: py(`
for i in range(3):
    print("Putaran", i)
print("Selesai")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: [
          "Putaran 1\nPutaran 2\nPutaran 3\nSelesai",
          "Putaran 0\nPutaran 1\nPutaran 2\nSelesai",
          "Putaran 0\nSelesai\nPutaran 1\nSelesai\nPutaran 2\nSelesai",
          "Putaran 0\nPutaran 1\nPutaran 2\nPutaran 3\nSelesai",
        ],
        explanation: "range(3) memberi 0, 1, 2: tiga putaran, dimulai dari 0. Baris print(\"Selesai\") rata kiri, jadi di luar loop dan hanya dijalankan sekali, setelah semua putaran.",
      },
    },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Mesin pengulang",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Ulangi tiga kali",
          instructions: [
            "Cetak `Semangat!` tiga kali dengan loop, **bukan** dengan menulis `print` tiga kali:",
            "",
            "```python",
            "for i in range(3):",
            "    print(\"Semangat!\")",
            "```",
          ].join("\n"),
          codeChecks: [
            { pattern: "for\\s+i\\s+in\\s+range\\(\\s*3\\s*\\)\\s*:", message: "Tulis for i in range(3): (dengan titik dua)." },
            once("Semangat", "Tulis print(\"Semangat!\") sekali saja, di dalam loop. Loop yang mengulanginya."),
          ],
          hints: ["Baris `print` harus menjorok 4 spasi supaya ikut diulang."],
          solution: py(`
for i in range(3):
    print("Semangat!")
`),
        },
        {
          title: "Tampilkan nomor putaran",
          instructions: "Ubah `print`-nya supaya mencetak nilai `i` lalu kata `Semangat!`, misalnya `0 Semangat!`. Petunjuk: `print(i, \"Semangat!\")`.",
          codeChecks: [{ pattern: "print\\(\\s*i\\s*,", message: "Cetak i lebih dulu: print(i, \"Semangat!\")." }],
          solution: py(`
for i in range(3):
    print(i, "Semangat!")
`),
        },
        {
          title: "Mulai dari 1",
          instructions: "Orang biasa menghitung mulai dari 1, bukan 0. Ubah supaya yang tercetak `1 Semangat!`, `2 Semangat!`, `3 Semangat!`. **Jangan ubah `range(3)`**, cukup ubah yang dicetak.",
          codeChecks: [
            { pattern: "print\\(\\s*i\\s*\\+\\s*1\\s*,", message: "Cetak i + 1, bukan i." },
            { pattern: "range\\(\\s*3\\s*\\)", message: "Biarkan range(3) seperti semula." },
          ],
          solution: py(`
for i in range(3):
    print(i + 1, "Semangat!")
`),
        },
        {
          title: "Berapa kali? Dari input",
          instructions: [
            "Sekarang jumlah ulangannya dibaca dari input. Di **paling atas**, tambahkan:",
            "",
            "```python",
            "n = int(input())",
            "```",
            "",
            "Lalu ganti `range(3)` menjadi `range(n)`. Input langkah ini 4.",
          ].join("\n"),
          stdin: "4\n",
          codeChecks: [
            { pattern: "n\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca n dengan int(input())." },
            { pattern: "range\\(\\s*n\\s*\\)", message: "Pakai range(n)." },
          ],
          hints: ["`range` butuh angka, jadi hasil `input()` harus diubah dengan `int(...)` dulu."],
          solution: py(`
n = int(input())
for i in range(n):
    print(i + 1, "Semangat!")
`),
        },
        {
          title: "Penutup, sekali saja",
          instructions: "Setelah loop, **rata kiri**, cetak `Selesai,` lalu `n`, lalu `kali`. Gunakan `print(\"Selesai,\", n, \"kali\")`. Baris ini harus tercetak sekali, bukan di setiap putaran. Input langkah ini 2.",
          stdin: "2\n",
          codeChecks: [{ pattern: "^print\\(\\s*\"Selesai,\"\\s*,\\s*n\\s*,\\s*\"kali\"\\s*\\)", message: "Tulis print(\"Selesai,\", n, \"kali\") rata kiri, setelah loop." }],
          solution: py(`
n = int(input())
for i in range(n):
    print(i + 1, "Semangat!")
print("Selesai,", n, "kali")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Lupa titik dua di baris `for`",
      code: py(`
for i in range(3)
    print("Halo")
`),
      explain: "Sama seperti `if`, baris `for` wajib diakhiri titik dua.",
      fix: py(`
for i in range(3):
    print("Halo")
`),
    },
    {
      kind: "mistake",
      title: "`range` diberi teks",
      code: py(`
n = "3"
for i in range(n):
    print("Halo")
`),
      explain: "`range` hanya mau angka bulat. Ini sering terjadi kalau `n` berasal dari `input()` yang lupa diubah dengan `int()`.",
      fix: py(`
n = int("3")
for i in range(n):
    print("Halo")
`),
    },
    {
      kind: "mistake",
      title: "Mengira `range(5)` sampai 5",
      code: py(`
for i in range(5):
    print(i)
`),
      explain: "Banyak pemula mengira ini mencetak 1 sampai 5. Kenyataannya 0 sampai 4: `range(n)` dimulai dari 0 dan berhenti **sebelum** `n`. Untuk mencetak 1 sampai 5, cetak `i + 1` (atau, di pelajaran berikutnya, pakai `range(1, 6)`).",
      fix: py(`
for i in range(5):
    print(i + 1)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Garis pembatas",
      task: "Cetak `==========` (sepuluh tanda sama dengan) sebanyak `baris` kali dengan loop. Setelah loop, cetak `Selesai`.",
      starterCode: py(`
baris = 4

# Tulis loop di sini
`) + "\n",
      solution: py(`
baris = 4
for i in range(baris):
    print("==========")
print("Selesai")
`),
    },
    {
      kind: "try",
      title: "Absen kelas",
      task: "Cetak `Siswa nomor 1 hadir` sampai `Siswa nomor 5 hadir` dengan satu loop `range(5)`.",
      starterCode: py(`
# Tulis loop di sini
`) + "\n",
      solution: py(`
for i in range(5):
    print("Siswa nomor", i + 1, "hadir")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `for i in range(n):` mengulang bloknya **n kali**.",
      "- Variabel loop (`i`) berisi 0, 1, 2, … sampai **n − 1**.",
      "- Baris menjorok ikut diulang. Baris rata kiri setelahnya dijalankan sekali, setelah loop selesai.",
      "- Untuk nomor yang dimulai dari 1, cetak `i + 1`.",
      "",
      "Berikutnya: `range` bisa dimulai dari angka lain, dan melompat 2, 5, atau bahkan mundur."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 2

const L2: LessonSource = {
  title: "2. range() Lengkap: Mulai, Berhenti, Langkah",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "`range(n)` selalu mulai dari 0 dan naik satu-satu. Tapi kadang kamu butuh hitungan lain: tahun 2020 sampai 2025, bilangan genap saja, atau hitung mundur roket 5, 4, 3, 2, 1.",
      "",
      "**Yang akan kamu pelajari:**",
      "- `range(mulai, berhenti)`",
      "- `range(mulai, berhenti, langkah)`, termasuk langkah negatif untuk hitung mundur",
      "- aturan emas: angka **berhenti tidak pernah ikut**"
    ),
    md(
      "## Tiga bentuk `range`",
      "",
      "| Bentuk | Artinya | Contoh | Angkanya |",
      "|---|---|---|---|",
      "| `range(berhenti)` | 0 sampai sebelum berhenti | `range(4)` | 0 1 2 3 |",
      "| `range(mulai, berhenti)` | mulai sampai sebelum berhenti | `range(2, 6)` | 2 3 4 5 |",
      "| `range(mulai, berhenti, langkah)` | melompat sebesar langkah | `range(1, 10, 3)` | 1 4 7 |",
      "",
      "Di **semua** bentuk, angka *berhenti* tidak ikut. Untuk menghitung 1 sampai 10, tulis `range(1, 11)`."
    ),
    { kind: "example", lead: "Mulai dari angka lain:", code: py(`
for tahun in range(2021, 2025):
    print(tahun)
`) },
    { kind: "example", lead: "Melompat 2, untuk bilangan genap:", code: py(`
for n in range(0, 11, 2):
    print(n)
`) },
    md(
      "### Hitung mundur",
      "",
      "Dengan langkah **negatif**, `range` menghitung turun. Karena angka berhenti tidak ikut, hitung mundur 5 sampai 1 ditulis `range(5, 0, -1)`, berhenti *sebelum* 0."
    ),
    { kind: "example", code: py(`
for i in range(5, 0, -1):
    print(i)
print("Meluncur!")
`) },
    {
      kind: "trace",
      title: "Melompat tiga-tiga",
      code: py(`
for i in range(2, 10, 3):
    print(i)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["2\n5\n8", "2\n5\n8\n11", "3\n6\n9", "2\n3\n4\n5\n6\n7\n8\n9"],
        explanation: "Mulai dari 2, lalu melompat 3: 2, 5, 8. Berikutnya 11, tapi itu sudah melewati 10 (angka berhenti), jadi loop selesai.",
      },
    },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Roket dan tabel kelipatan",
      intro,
      starterCode: START,
      steps: [
        {
          title: "1 sampai 5",
          instructions: "Cetak angka 1 sampai 5, satu per baris, dengan `for i in range(1, 6):`. Ingat: angka berhenti tidak ikut, makanya 6.",
          codeChecks: [{ pattern: "range\\(\\s*1\\s*,\\s*6\\s*\\)", message: "Pakai range(1, 6)." }],
          solution: py(`
for i in range(1, 6):
    print(i)
`),
        },
        {
          title: "Genap saja",
          instructions: "Ubah `range`-nya supaya mencetak bilangan genap **2 sampai 10**: 2, 4, 6, 8, 10. Pakai bentuk tiga angka: mulai, berhenti, langkah.",
          codeChecks: [{ pattern: "range\\(\\s*2\\s*,\\s*1[12]\\s*,\\s*2\\s*\\)", message: "Pakai range(2, 11, 2): mulai 2, langkah 2." }],
          hints: ["Kalau berhentinya 10, apakah angka 10 ikut? Ingat aturan emasnya."],
          solution: py(`
for i in range(2, 11, 2):
    print(i)
`),
        },
        {
          title: "Hitung mundur",
          instructions: "Ganti loop-nya menjadi hitung mundur **5 sampai 1** (`range(5, 0, -1)`), lalu setelah loop, rata kiri, cetak `Meluncur!`.",
          codeChecks: [
            { pattern: "range\\(\\s*5\\s*,\\s*0\\s*,\\s*-1\\s*\\)", message: "Pakai range(5, 0, -1)." },
            { pattern: "^print\\(\\s*\"Meluncur!\"\\s*\\)", message: "Cetak \"Meluncur!\" rata kiri, setelah loop." },
          ],
          hints: ["Tanpa `-1`, `range(5, 0)` tidak menghasilkan angka apa pun, karena tidak bisa naik dari 5 ke 0."],
          solution: py(`
for i in range(5, 0, -1):
    print(i)
print("Meluncur!")
`),
        },
        {
          title: "Mulai dari input",
          instructions: "Di paling atas, baca `mulai = int(input())`, lalu hitung mundur dari `mulai` sampai 1: `range(mulai, 0, -1)`. Input langkah ini 3.",
          stdin: "3\n",
          codeChecks: [{ pattern: "range\\(\\s*mulai\\s*,\\s*0\\s*,\\s*-1\\s*\\)", message: "Pakai range(mulai, 0, -1)." }],
          solution: py(`
mulai = int(input())
for i in range(mulai, 0, -1):
    print(i)
print("Meluncur!")
`),
        },
        {
          title: "Bonus: lima kelipatan pertama",
          instructions: [
            "Di **paling bawah**, baca satu angka lagi `k = int(input())`, lalu cetak lima kelipatan pertamanya dengan **langkah `k`**:",
            "",
            "```python",
            "for i in range(k, k * 5 + 1, k):",
            "    print(i)",
            "```",
            "",
            "Kenapa berhentinya `k * 5 + 1`? Supaya kelipatan kelima (`k * 5`) masih ikut. Input langkah ini 3 lalu 4.",
          ].join("\n"),
          stdin: "3\n4\n",
          codeChecks: [{ pattern: "range\\(\\s*k\\s*,\\s*k\\s*\\*\\s*5\\s*\\+\\s*1\\s*,\\s*k\\s*\\)", message: "Pakai range(k, k * 5 + 1, k)." }],
          solution: py(`
mulai = int(input())
for i in range(mulai, 0, -1):
    print(i)
print("Meluncur!")
k = int(input())
for i in range(k, k * 5 + 1, k):
    print(i)
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Hitung mundur tanpa langkah negatif",
      code: py(`
for i in range(5, 0):
    print(i)
print("Meluncur!")
`),
      explain: "Tanpa langkah, `range` selalu naik satu-satu. Naik dari 5 tidak akan pernah sampai ke 0, jadi loop-nya tidak berjalan sama sekali, tanpa error apa pun. Hitung mundur butuh langkah `-1`.",
      fix: py(`
for i in range(5, 0, -1):
    print(i)
print("Meluncur!")
`),
    },
    {
      kind: "mistake",
      title: "Langkah nol",
      code: py(`
for i in range(1, 10, 0):
    print(i)
`),
      explain: "Melompat sebesar 0 artinya tidak pernah maju, jadi Python menolaknya.",
      fix: py(`
for i in range(1, 10, 1):
    print(i)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Kelipatan 5",
      task: "Cetak semua kelipatan 5 dari 5 sampai 50 (5, 10, …, 50) dengan **satu** `range` tiga angka.",
      starterCode: py(`
# Tulis loop di sini
`) + "\n",
      solution: py(`
for n in range(5, 51, 5):
    print(n)
`),
    },
    {
      kind: "try",
      title: "Bilangan ganjil mundur",
      task: "Cetak bilangan ganjil dari 15 turun sampai 1: 15, 13, 11, …, 1.",
      starterCode: py(`
# Tulis loop di sini
`) + "\n",
      solution: py(`
for n in range(15, 0, -2):
    print(n)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `range(mulai, berhenti)` dan `range(mulai, berhenti, langkah)`.",
      "- Angka **berhenti tidak pernah ikut**: untuk 1–10, tulis `range(1, 11)`.",
      "- Langkah negatif menghitung mundur: `range(5, 0, -1)` → 5 4 3 2 1.",
      "- Langkah 0 tidak boleh.",
      "",
      "Berikutnya: memakai loop untuk **menjumlah** dan **menghitung**, pola yang akan kamu pakai di hampir setiap program."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 3

const L3: LessonSource = {
  title: "3. Pola Akumulator: Menjumlah dan Menghitung",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Berapa total tabunganmu setelah seminggu? Berapa jumlah 1 + 2 + … + 100? Pertanyaan seperti ini dijawab dengan pola yang sama: siapkan variabel **penampung**, lalu di setiap putaran **tambahkan** sesuatu ke dalamnya.",
      "",
      "Variabel penampung itu disebut **akumulator**.",
      "",
      "**Yang akan kamu pelajari:**",
      "- tiga langkah pola akumulator: siapkan, tambahkan, cetak",
      "- akumulator untuk **menjumlah** (total) dan **menghitung** (berapa kali)",
      "- kenapa penampung harus disiapkan **sebelum** loop"
    ),
    md(
      "## Tiga langkah",
      "",
      "```python",
      "total = 0                  # 1. siapkan, SEBELUM loop",
      "for i in range(1, 6):",
      "    total = total + i      # 2. tambahkan, DI DALAM loop",
      "print(total)               # 3. cetak, SETELAH loop",
      "```",
      "",
      "Baris `total = total + i` artinya: ambil isi `total` sekarang, tambah `i`, lalu simpan hasilnya kembali ke `total`. Python juga punya singkatannya: `total += i`."
    ),
    { kind: "example", code: py(`
total = 0
for i in range(1, 6):
    total = total + i
print(total)
`) },
    {
      kind: "trace",
      title: "Lacak isi total",
      code: py(`
total = 0
for i in range(1, 4):
    total = total + i
print(total)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["6", "3", "1\n3\n6", "0"],
        explanation: "total berubah 0 → 1 → 3 → 6. print ada di luar loop, jadi hanya hasil akhirnya yang dicetak, sekali.",
      },
    },
    md(
      "### Menghitung: akumulator yang bertambah 1",
      "",
      "Kalau yang ditambahkan selalu 1, akumulatornya **menghitung berapa kali** sesuatu terjadi. Biasanya dinamai `jumlah`, `banyak`, atau `hitung`."
    ),
    { kind: "example", code: py(`
banyak = 0
for i in range(10, 31, 5):
    banyak = banyak + 1
print("Ada", banyak, "angka")
`) },
    md(
      "### Melihat prosesnya",
      "",
      "Kalau `print` ditaruh **di dalam** loop, kamu melihat isi akumulator di setiap putaran. Ini cara yang bagus untuk mencari kesalahan."
    ),
    { kind: "example", code: py(`
total = 0
for hari in range(1, 4):
    total = total + 5000
    print("Hari", hari, "tabungan", total)
`) },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Kalkulator tabungan",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Tabungan seminggu",
          instructions: [
            "Setiap hari kamu menabung 5000. Hitung tabungan setelah 7 hari dengan pola akumulator:",
            "",
            "```python",
            "total = 0",
            "for hari in range(1, 8):",
            "    total = total + 5000",
            "print(\"Tabungan:\", total)",
            "```",
          ].join("\n"),
          codeChecks: [
            { pattern: "^total\\s*=\\s*0", message: "Siapkan total = 0 sebelum loop, rata kiri." },
            { pattern: "total\\s*=\\s*total\\s*\\+|total\\s*\\+=", message: "Di dalam loop, tambahkan ke total: total = total + 5000." },
          ],
          solution: py(`
total = 0
for hari in range(1, 8):
    total = total + 5000
print("Tabungan:", total)
`),
        },
        {
          title: "Lihat setiap hari",
          instructions: "Di dalam loop, **setelah** menambah, cetak `print(\"Hari\", hari, \"total\", total)`. Hasil akhirnya tetap dicetak sekali setelah loop.",
          codeChecks: [{ pattern: "^\\s+print\\(\\s*\"Hari\"\\s*,\\s*hari\\s*,\\s*\"total\"\\s*,\\s*total\\s*\\)", message: "Cetak print(\"Hari\", hari, \"total\", total) di dalam loop (menjorok)." }],
          solution: py(`
total = 0
for hari in range(1, 8):
    total = total + 5000
    print("Hari", hari, "total", total)
print("Tabungan:", total)
`),
        },
        {
          title: "Uang harian dari input",
          instructions: "Di paling atas, baca `harian = int(input())`, lalu tambahkan `harian` (bukan 5000) di setiap putaran. Input langkah ini 2000.",
          stdin: "2000\n",
          codeChecks: [{ pattern: "total\\s*=\\s*total\\s*\\+\\s*harian|total\\s*\\+=\\s*harian", message: "Tambahkan harian ke total." }],
          solution: py(`
harian = int(input())
total = 0
for hari in range(1, 8):
    total = total + harian
    print("Hari", hari, "total", total)
print("Tabungan:", total)
`),
        },
        {
          title: "Berapa hari? Dari input",
          instructions: "Tepat di bawah `harian`, baca `n = int(input())` untuk banyak hari, lalu ubah loop-nya menjadi `range(1, n + 1)` supaya hari 1 sampai n semuanya ikut. Input langkah ini 2000 lalu 3.",
          stdin: "2000\n3\n",
          codeChecks: [{ pattern: "range\\(\\s*1\\s*,\\s*n\\s*\\+\\s*1\\s*\\)", message: "Pakai range(1, n + 1)." }],
          hints: ["Dengan `range(1, n)`, hari ke-n tidak ikut. Tambah 1 pada angka berhentinya."],
          solution: py(`
harian = int(input())
n = int(input())
total = 0
for hari in range(1, n + 1):
    total = total + harian
    print("Hari", hari, "total", total)
print("Tabungan:", total)
`),
        },
        {
          title: "Akumulator kedua: menghitung hari",
          instructions: [
            "Hitung **berapa hari** tabungannya sudah **lebih dari 5000**. Itu akumulator kedua yang bertambah 1:",
            "",
            "- sebelum loop: `hari_lebih = 0`",
            "- di dalam loop, setelah menambah total: `if total > 5000:` lalu `hari_lebih = hari_lebih + 1`",
            "- di paling bawah: `print(\"Hari di atas 5000:\", hari_lebih)`",
            "",
            "Input langkah ini 2000 lalu 4.",
          ].join("\n"),
          stdin: "2000\n4\n",
          codeChecks: [
            { pattern: "^hari_lebih\\s*=\\s*0", message: "Siapkan hari_lebih = 0 sebelum loop, rata kiri." },
            { pattern: "hari_lebih\\s*=\\s*hari_lebih\\s*\\+\\s*1|hari_lebih\\s*\\+=\\s*1", message: "Tambah 1 ke hari_lebih di dalam if." },
          ],
          hints: ["`if` ini ada **di dalam** loop, jadi menjorok 4 spasi, dan baris penambahnya menjorok 8 spasi."],
          solution: py(`
harian = int(input())
n = int(input())
total = 0
hari_lebih = 0
for hari in range(1, n + 1):
    total = total + harian
    print("Hari", hari, "total", total)
    if total > 5000:
        hari_lebih = hari_lebih + 1
print("Tabungan:", total)
print("Hari di atas 5000:", hari_lebih)
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Menyiapkan akumulator di dalam loop",
      code: py(`
for i in range(1, 6):
    total = 0
    total = total + i
print(total)
`),
      explain: "Jumlah 1 sampai 5 seharusnya 15, tapi yang tercetak 5. Karena `total = 0` ada di dalam loop, isinya **direset** ke 0 di setiap putaran, jadi yang tersisa hanya angka terakhir. Siapkan akumulator **sebelum** loop.",
      fix: py(`
total = 0
for i in range(1, 6):
    total = total + i
print(total)
`),
    },
    {
      kind: "mistake",
      title: "Lupa menyiapkan akumulator",
      code: py(`
for i in range(1, 6):
    total = total + i
print(total)
`),
      explain: "Di putaran pertama, `total + i` membutuhkan isi `total`, padahal `total` belum pernah dibuat.",
      fix: py(`
total = 0
for i in range(1, 6):
    total = total + i
print(total)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Jumlah 1 sampai 100",
      task: "Hitung 1 + 2 + 3 + … + 100 dengan pola akumulator, lalu cetak hasilnya. (Konon, matematikawan Gauss menghitungnya di kepala waktu masih SD!)",
      starterCode: py(`
# Tulis pola akumulator di sini
`) + "\n",
      solution: py(`
total = 0
for i in range(1, 101):
    total = total + i
print(total)
`),
    },
    {
      kind: "try",
      title: "Faktorial",
      task: "Faktorial 5 (ditulis 5!) adalah 1 × 2 × 3 × 4 × 5. Hitung `n!` untuk `n = 5`. Petunjuk: akumulator perkalian dimulai dari **1**, bukan 0. Kenapa?",
      starterCode: py(`
n = 5

# Tulis pola akumulator di sini
`) + "\n",
      solution: py(`
n = 5
hasil = 1
for i in range(1, n + 1):
    hasil = hasil * i
print(hasil)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- Pola akumulator: **siapkan** sebelum loop → **tambahkan** di dalam loop → **cetak** setelah loop.",
      "- `total = total + i` (atau `total += i`) menambah ke isi yang sudah ada.",
      "- Akumulator yang bertambah 1 **menghitung** berapa kali.",
      "- Akumulator perkalian dimulai dari 1.",
      "- Akumulator di dalam loop = direset setiap putaran. Hampir selalu salah.",
      "",
      "Berikutnya: menggabungkan loop dengan `if` untuk **menyaring** dan **mencari**."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 4

const L4: LessonSource = {
  title: "4. Loop + if: Menyaring dan Mencari",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Sekarang kamu bisa mengulang (loop) dan memutuskan (`if`). Digabung, keduanya bisa menjawab pertanyaan seperti:",
      "",
      "- Berapa siswa yang lulus? (**menghitung** yang memenuhi syarat)",
      "- Bilangan mana yang genap? (**menyaring**)",
      "- Siapa nilai tertinggi? (**mencari**)",
      "",
      "**Yang akan kamu pelajari:**",
      "- `if` di dalam loop: diperiksa ulang di setiap putaran",
      "- menghitung hanya yang memenuhi syarat",
      "- mencari nilai terbesar dengan variabel \"juara sementara\"",
      "- membaca banyak input dengan loop"
    ),
    md(
      "## `if` di dalam loop",
      "",
      "Kalau `if` ditaruh di dalam loop, syaratnya **diperiksa ulang di setiap putaran**, dengan nilai variabel loop yang baru."
    ),
    { kind: "example", lead: "Menyaring: cetak hanya yang genap.", code: py(`
for n in range(1, 11):
    if n % 2 == 0:
        print(n)
`) },
    {
      kind: "trace",
      title: "Berapa kelipatan 3?",
      code: py(`
banyak = 0
for n in range(1, 7):
    if n % 3 == 0:
        banyak = banyak + 1
print(banyak)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["2", "3", "6", "1"],
        explanation: "Dari 1 sampai 6, hanya 3 dan 6 yang habis dibagi 3. banyak hanya bertambah di dua putaran itu.",
      },
    },
    md(
      "### Mencari yang terbesar",
      "",
      "Caranya seperti lomba: simpan **juara sementara**. Di setiap putaran, bandingkan peserta baru dengan juara. Kalau lebih besar, dia menjadi juara yang baru."
    ),
    { kind: "example", code: py(`
tertinggi = 0
for nilai in [70, 95, 88, 60]:
    if nilai > tertinggi:
        tertinggi = nilai
print("Tertinggi:", tertinggi)
`) },
    md(
      "`[70, 95, 88, 60]` adalah **list**, kumpulan nilai. `for` bisa mengambil isinya satu per satu, sama seperti dari `range`. List akan kamu pelajari lebih dalam nanti. Di latihan ini, nilainya dibaca dari input satu per satu."
    ),
    md(
      "### Membaca banyak input",
      "",
      "Loop juga bisa membaca input berulang kali. Polanya: baca dulu **berapa banyak**, lalu loop sebanyak itu, dan baca satu nilai di setiap putaran.",
      "",
      "```python",
      "n = int(input())          # berapa siswa?",
      "for i in range(n):",
      "    nilai = int(input())  # nilai siswa ke-(i+1)",
      "```"
    ),
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Pengolah nilai kelas",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Baca semua nilai",
          instructions: [
            "Baca banyak siswa, lalu baca dan cetak nilai mereka satu per satu:",
            "",
            "```python",
            "n = int(input())",
            "for i in range(n):",
            "    nilai = int(input())",
            "    print(nilai)",
            "```",
            "",
            "Input langkah ini: 3, lalu 80, 65, 90.",
          ].join("\n"),
          stdin: "3\n80\n65\n90\n",
          codeChecks: [
            { pattern: "for\\s+\\w+\\s+in\\s+range\\(\\s*n\\s*\\)", message: "Loop sebanyak n: for i in range(n):" },
            { pattern: "^\\s+nilai\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca nilai di dalam loop (menjorok)." },
          ],
          hints: ["`nilai = int(input())` harus di **dalam** loop. Kalau di luar, hanya satu nilai yang terbaca."],
          solution: py(`
n = int(input())
for i in range(n):
    nilai = int(input())
    print(nilai)
`),
        },
        {
          title: "Lulus atau remedial",
          instructions: "Ganti `print(nilai)` dengan `if`–`else` di dalam loop: kalau nilai minimal 75, cetak `print(nilai, \"lulus\")`, kalau tidak, `print(nilai, \"remedial\")`.",
          stdin: "3\n80\n65\n90\n",
          codeChecks: [{ pattern: "^\\s+if\\s+nilai\\s*>=\\s*75\\s*:", message: "Di dalam loop, tulis if nilai >= 75:" }],
          solution: py(`
n = int(input())
for i in range(n):
    nilai = int(input())
    if nilai >= 75:
        print(nilai, "lulus")
    else:
        print(nilai, "remedial")
`),
        },
        {
          title: "Hitung yang lulus",
          instructions: "Tambahkan akumulator `jumlah_lulus = 0` **sebelum** loop, tambah 1 di dalam blok `if` (yang lulus), lalu setelah loop cetak `print(\"Lulus:\", jumlah_lulus)`.",
          stdin: "3\n80\n65\n90\n",
          codeChecks: [
            { pattern: "^jumlah_lulus\\s*=\\s*0", message: "Siapkan jumlah_lulus = 0 sebelum loop." },
            { pattern: "^\\s{8}jumlah_lulus\\s*=\\s*jumlah_lulus\\s*\\+\\s*1|^\\s{8}jumlah_lulus\\s*\\+=\\s*1", message: "Tambah 1 ke jumlah_lulus di dalam blok if (menjorok 8 spasi)." },
          ],
          solution: py(`
n = int(input())
jumlah_lulus = 0
for i in range(n):
    nilai = int(input())
    if nilai >= 75:
        print(nilai, "lulus")
        jumlah_lulus = jumlah_lulus + 1
    else:
        print(nilai, "remedial")
print("Lulus:", jumlah_lulus)
`),
        },
        {
          title: "Nilai tertinggi",
          instructions: [
            "Cari juara: sebelum loop `tertinggi = 0`. Di dalam loop (setelah membaca nilai, sejajar dengan `if` yang sudah ada), tambahkan:",
            "",
            "```python",
            "    if nilai > tertinggi:",
            "        tertinggi = nilai",
            "```",
            "",
            "Setelah loop, cetak `print(\"Tertinggi:\", tertinggi)` di bawah baris Lulus. Input langkah ini: 4, lalu 70, 95, 88, 60.",
          ].join("\n"),
          stdin: "4\n70\n95\n88\n60\n",
          codeChecks: [
            { pattern: "^tertinggi\\s*=\\s*0", message: "Siapkan tertinggi = 0 sebelum loop." },
            { pattern: "if\\s+nilai\\s*>\\s*tertinggi\\s*:", message: "Bandingkan: if nilai > tertinggi:" },
          ],
          hints: ["Ini `if` kedua yang terpisah, bukan `elif`. Setiap nilai harus dibandingkan dengan juara, lulus maupun remedial."],
          solution: py(`
n = int(input())
jumlah_lulus = 0
tertinggi = 0
for i in range(n):
    nilai = int(input())
    if nilai >= 75:
        print(nilai, "lulus")
        jumlah_lulus = jumlah_lulus + 1
    else:
        print(nilai, "remedial")
    if nilai > tertinggi:
        tertinggi = nilai
print("Lulus:", jumlah_lulus)
print("Tertinggi:", tertinggi)
`),
        },
        {
          title: "Rata-rata kelas",
          instructions: "Satu akumulator lagi: `total = 0` sebelum loop, `total = total + nilai` di dalam loop. Di paling bawah, cetak `print(\"Rata-rata:\", total / n)`. Input langkah ini sama: 4, lalu 70, 95, 88, 60.",
          stdin: "4\n70\n95\n88\n60\n",
          codeChecks: [
            { pattern: "total\\s*=\\s*total\\s*\\+\\s*nilai|total\\s*\\+=\\s*nilai", message: "Tambahkan nilai ke total di dalam loop." },
            { pattern: "total\\s*/\\s*n", message: "Rata-rata adalah total / n." },
          ],
          solution: py(`
n = int(input())
jumlah_lulus = 0
tertinggi = 0
total = 0
for i in range(n):
    nilai = int(input())
    total = total + nilai
    if nilai >= 75:
        print(nilai, "lulus")
        jumlah_lulus = jumlah_lulus + 1
    else:
        print(nilai, "remedial")
    if nilai > tertinggi:
        tertinggi = nilai
print("Lulus:", jumlah_lulus)
print("Tertinggi:", tertinggi)
print("Rata-rata:", total / n)
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Lupa `int()` saat membaca angka di loop",
      code: py(`
tertinggi = 0
for i in range(2):
    nilai = input()
    if nilai > tertinggi:
        tertinggi = nilai
print(tertinggi)
`),
      stdin: "70\n95\n",
      explain: "Hasil `input()` selalu teks. Teks `\"70\"` tidak bisa dibandingkan dengan angka 0.",
      fix: py(`
tertinggi = 0
for i in range(2):
    nilai = int(input())
    if nilai > tertinggi:
        tertinggi = nilai
print(tertinggi)
`),
    },
    {
      kind: "mistake",
      title: "Juara sementara direset di setiap putaran",
      code: py(`
for nilai in [70, 95, 88, 60]:
    tertinggi = 0
    if nilai > tertinggi:
        tertinggi = nilai
print("Tertinggi:", tertinggi)
`),
      explain: "Yang tercetak 60, padahal tertinggi 95. `tertinggi = 0` di dalam loop menghapus juara di setiap putaran, jadi pemenangnya selalu peserta terakhir. Sama seperti akumulator: siapkan **sebelum** loop.",
      fix: py(`
tertinggi = 0
for nilai in [70, 95, 88, 60]:
    if nilai > tertinggi:
        tertinggi = nilai
print("Tertinggi:", tertinggi)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "FizzBuzz mini",
      task: "Untuk angka 1 sampai 15: cetak `Fizz` kalau habis dibagi 3, `Buzz` kalau habis dibagi 5, `FizzBuzz` kalau habis dibagi keduanya, dan angkanya sendiri kalau tidak. Petunjuk: periksa \"keduanya\" lebih dulu. Ingat pelajaran urutan `elif`!",
      starterCode: py(`
# Tulis loop + if-elif-else di sini
`) + "\n",
      solution: py(`
for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`),
    },
    {
      kind: "try",
      title: "Pembagi",
      task: "Cetak semua pembagi dari `angka` (bilangan yang membagi habis `angka`), lalu cetak berapa banyak pembaginya.",
      starterCode: py(`
angka = 12

# Tulis loop di sini
`) + "\n",
      solution: py(`
angka = 12
banyak = 0
for d in range(1, angka + 1):
    if angka % d == 0:
        print(d)
        banyak = banyak + 1
print("Banyak pembagi:", banyak)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `if` di dalam loop diperiksa ulang di **setiap putaran**.",
      "- **Menyaring:** cetak hanya yang memenuhi syarat.",
      "- **Menghitung:** akumulator yang bertambah 1 di dalam `if`.",
      "- **Mencari terbesar:** juara sementara, disiapkan sebelum loop, diganti kalau ada yang lebih besar.",
      "- Banyak input: baca `n` dulu, lalu baca satu nilai di setiap putaran.",
      "",
      "Berikutnya: `for` tidak hanya bisa mengambil angka. Ia juga bisa mengambil **huruf demi huruf** dari teks."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 5

const L5: LessonSource = {
  title: "5. for pada Teks: Huruf demi Huruf",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Berapa huruf vokal dalam namamu? Apakah \"katak\" dibaca sama dari depan dan belakang? Untuk menjawabnya, program harus memeriksa teks **huruf demi huruf**.",
      "",
      "**Yang akan kamu pelajari:**",
      "- `for huruf in teks:` mengambil satu karakter di setiap putaran",
      "- operator `in` untuk bertanya \"apakah huruf ini salah satu dari …?\"",
      "- membangun teks baru dengan akumulator teks"
    ),
    md(
      "## `for` mengambil isi teks",
      "",
      "`for` bisa mengambil isi teks satu karakter per putaran. Spasi dan tanda baca juga dihitung sebagai karakter."
    ),
    { kind: "example", code: py(`
for huruf in "Halo!":
    print(huruf)
`) },
    md(
      "### Operator `in`",
      "",
      "`\"a\" in \"aiueo\"` bertanya: **apakah `\"a\"` ada di dalam `\"aiueo\"`?** Jawabannya `True` atau `False`, jadi bisa langsung dipakai di `if`."
    ),
    { kind: "example", code: py(`
print("a" in "aiueo")
print("k" in "aiueo")
print("Budi" in "Halo Budi!")
`) },
    {
      kind: "trace",
      title: "Huruf demi huruf",
      code: py(`
kata = "aku"
for h in kata:
    print(h + "!")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["a!\nk!\nu!", "aku!", "a\nk\nu\n!", "aku!\naku!\naku!"],
        explanation: "Di setiap putaran, h berisi satu huruf: \"a\", lalu \"k\", lalu \"u\". Setiap huruf diberi tanda seru dan dicetak di barisnya sendiri.",
      },
    },
    md(
      "### Akumulator teks",
      "",
      "Akumulator tidak harus angka. Teks juga bisa ditampung: mulai dari teks kosong `\"\"`, lalu di setiap putaran **sambung** huruf baru. Kalau huruf baru ditaruh di **depan**, hasilnya terbalik:"
    ),
    { kind: "example", code: py(`
kata = "makan"
terbalik = ""
for huruf in kata:
    terbalik = huruf + terbalik
print(terbalik)
`) },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Detektif kata",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Pecah jadi huruf",
          instructions: "Baca sebuah kata dengan `kata = input()`, lalu cetak hurufnya satu per baris dengan `for huruf in kata:`. Input langkah ini `halo`.",
          stdin: "halo\n",
          codeChecks: [{ pattern: "for\\s+huruf\\s+in\\s+kata\\s*:", message: "Tulis for huruf in kata:" }],
          solution: py(`
kata = input()
for huruf in kata:
    print(huruf)
`),
        },
        {
          title: "Hitung vokal",
          instructions: [
            "Sekarang **jangan cetak hurufnya lagi**. Hitung vokalnya saja:",
            "",
            "- sebelum loop: `vokal = 0`",
            "- di dalam loop: `if huruf in \"aiueo\":` lalu `vokal = vokal + 1`",
            "- setelah loop: `print(\"Vokal:\", vokal)`",
            "",
            "Input langkah ini `belajar`.",
          ].join("\n"),
          stdin: "belajar\n",
          codeChecks: [{ pattern: "if\\s+huruf\\s+in\\s+\"aiueo\"\\s*:", message: "Periksa dengan if huruf in \"aiueo\":" }],
          solution: py(`
kata = input()
vokal = 0
for huruf in kata:
    if huruf in "aiueo":
        vokal = vokal + 1
print("Vokal:", vokal)
`),
        },
        {
          title: "Konsonan juga",
          instructions: "Tambahkan `konsonan = 0` sebelum loop, dan `else:` pada `if` vokal yang menambah `konsonan`. Setelah loop, di bawah baris Vokal, cetak `print(\"Konsonan:\", konsonan)`. Input langkah ini `belajar`.",
          stdin: "belajar\n",
          codeChecks: [{ pattern: "konsonan\\s*=\\s*konsonan\\s*\\+\\s*1|konsonan\\s*\\+=\\s*1", message: "Tambah 1 ke konsonan di dalam else." }],
          solution: py(`
kata = input()
vokal = 0
konsonan = 0
for huruf in kata:
    if huruf in "aiueo":
        vokal = vokal + 1
    else:
        konsonan = konsonan + 1
print("Vokal:", vokal)
print("Konsonan:", konsonan)
`),
        },
        {
          title: "Balik katanya",
          instructions: "Tambahkan akumulator teks: `terbalik = \"\"` sebelum loop, dan `terbalik = huruf + terbalik` di dalam loop (di luar if–else, sejajar dengannya). Di paling bawah, cetak `print(\"Terbalik:\", terbalik)`. Input langkah ini `makan`.",
          stdin: "makan\n",
          codeChecks: [
            { pattern: "^terbalik\\s*=\\s*\"\"", message: "Siapkan terbalik = \"\" sebelum loop." },
            { pattern: "terbalik\\s*=\\s*huruf\\s*\\+\\s*terbalik", message: "Sambung di depan: terbalik = huruf + terbalik." },
          ],
          hints: ["`terbalik + huruf` hanya menyalin katanya. Huruf baru harus ditaruh di **depan**."],
          solution: py(`
kata = input()
vokal = 0
konsonan = 0
terbalik = ""
for huruf in kata:
    if huruf in "aiueo":
        vokal = vokal + 1
    else:
        konsonan = konsonan + 1
    terbalik = huruf + terbalik
print("Vokal:", vokal)
print("Konsonan:", konsonan)
print("Terbalik:", terbalik)
`),
        },
        {
          title: "Palindrom?",
          instructions: "Kata **palindrom** dibaca sama dari depan dan belakang, seperti `katak`. Di paling bawah, tulis `if`–`else`: kalau `kata == terbalik`, cetak `Palindrom!`, kalau tidak, `Bukan palindrom`. Input langkah ini `katak`.",
          stdin: "katak\n",
          codeChecks: [{ pattern: "if\\s+kata\\s*==\\s*terbalik\\s*:|if\\s+terbalik\\s*==\\s*kata\\s*:", message: "Bandingkan kata == terbalik." }],
          solution: py(`
kata = input()
vokal = 0
konsonan = 0
terbalik = ""
for huruf in kata:
    if huruf in "aiueo":
        vokal = vokal + 1
    else:
        konsonan = konsonan + 1
    terbalik = huruf + terbalik
print("Vokal:", vokal)
print("Konsonan:", konsonan)
print("Terbalik:", terbalik)
if kata == terbalik:
    print("Palindrom!")
else:
    print("Bukan palindrom")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Loop pada angka",
      code: py(`
for angka in 2024:
    print(angka)
`),
      explain: "`for` bisa mengambil isi teks (atau `range`, atau list), tapi tidak dari sebuah angka. Kalau kamu ingin digit-digitnya, jadikan teks dulu dengan `str(...)`.",
      fix: py(`
for angka in str(2024):
    print(angka)
`),
    },
    {
      kind: "mistake",
      title: "Huruf besar tidak dihitung",
      code: py(`
vokal = 0
for huruf in "Andi":
    if huruf in "aiueo":
        vokal = vokal + 1
print(vokal)
`),
      explain: "`Andi` punya dua vokal (A dan i), tapi yang terhitung hanya 1, karena `\"A\"` (besar) tidak ada di `\"aiueo\"` (kecil). Ubah dulu katanya menjadi huruf kecil dengan `.lower()`.",
      fix: py(`
vokal = 0
for huruf in "Andi".lower():
    if huruf in "aiueo":
        vokal = vokal + 1
print(vokal)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Hitung huruf a",
      task: "Hitung berapa kali huruf `a` muncul dalam `kalimat`, lalu cetak jumlahnya.",
      starterCode: py(`
kalimat = "saya suka makan pisang"

# Tulis loop di sini
`) + "\n",
      solution: py(`
kalimat = "saya suka makan pisang"
jumlah = 0
for huruf in kalimat:
    if huruf == "a":
        jumlah = jumlah + 1
print(jumlah)
`),
    },
    {
      kind: "try",
      title: "Sandi bintang",
      task: "Buat versi rahasia `nama`: setiap vokal diganti `*`, huruf lain tetap. Cetak hasilnya. Petunjuk: akumulator teks yang menyambung di **belakang** (`hasil = hasil + ...`).",
      starterCode: py(`
nama = "rahasia"

# Tulis loop di sini
`) + "\n",
      solution: py(`
nama = "rahasia"
hasil = ""
for huruf in nama:
    if huruf in "aiueo":
        hasil = hasil + "*"
    else:
        hasil = hasil + huruf
print(hasil)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `for huruf in teks:` mengambil satu karakter di setiap putaran, termasuk spasi.",
      "- `x in teks` bertanya \"apakah x ada di dalam teks?\" (`True`/`False`).",
      "- Akumulator teks dimulai dari `\"\"`. Sambung di belakang untuk menyalin, di depan untuk membalik.",
      "- Huruf besar dan kecil berbeda. `.lower()` menyamakannya.",
      "",
      "Berikutnya: loop yang tidak tahu berapa kali harus berulang. Itu tugas `while`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 6

const L6: LessonSource = {
  title: "6. while: Mengulang Selama Syarat Benar",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "`for` cocok kalau kamu tahu berapa kali harus mengulang. Tapi bagaimana dengan:",
      "",
      "- terus menabung **sampai** uangnya cukup untuk membeli sepeda?",
      "- terus bertanya **sampai** tebakannya benar?",
      "",
      "Kamu tidak tahu berapa kali sebelumnya. `while` mengulang **selama** sebuah syarat masih `True`.",
      "",
      "**Yang akan kamu pelajari:**",
      "- bentuk `while syarat:`",
      "- tiga bagian loop `while`: siapkan, periksa, ubah",
      "- bahaya loop yang tidak pernah berhenti"
    ),
    md(
      "## Bentuk `while`",
      "",
      "```python",
      "while syarat:",
      "    kode yang diulang",
      "```",
      "",
      "Seperti `if` yang berulang: Python memeriksa syaratnya. Kalau `True`, bloknya dijalankan, lalu Python **kembali memeriksa syaratnya**. Begitu terus sampai syaratnya `False`.",
      "",
      "Loop `while` yang sehat punya tiga bagian:",
      "",
      "1. **siapkan** variabelnya sebelum loop,",
      "2. **periksa** syaratnya di baris `while`,",
      "3. **ubah** variabelnya di dalam loop, supaya suatu saat syaratnya menjadi `False`."
    ),
    { kind: "example", code: py(`
i = 1              # 1. siapkan
while i <= 3:      # 2. periksa
    print(i)
    i = i + 1      # 3. ubah
print("Selesai")
`) },
    {
      kind: "trace",
      title: "Berapa hari menabung?",
      code: py(`
uang = 10000
hari = 0
while uang < 25000:
    uang = uang + 5000
    hari = hari + 1
print(hari, "hari")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["3 hari", "2 hari", "4 hari", "5 hari"],
        explanation: "uang naik 10000 → 15000 → 20000 → 25000. Setelah putaran ketiga, 25000 < 25000 bernilai False, jadi loop berhenti: 3 hari.",
      },
    },
    md(
      "### Hati-hati: loop yang tidak pernah berhenti",
      "",
      "Kalau bagian 3 (**ubah**) terlupa, syaratnya akan `True` selamanya dan programmu tidak pernah selesai. Ini disebut **infinite loop**:",
      "",
      "```python",
      "i = 1",
      "while i <= 3:",
      "    print(i)",
      "    # lupa i = i + 1, jadi i selalu 1, dan 1 <= 3 selalu True",
      "```",
      "",
      "Kalau ini terjadi di editor AmbaraEdu, programnya dihentikan otomatis setelah 30 detik. Periksa lagi: apakah variabel di syarat benar-benar berubah di dalam loop?"
    ),
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Permainan tebak angka",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Hitung 1 sampai 5 dengan while",
          instructions: "Tulis loop `while` dengan tiga bagiannya: `i = 1` sebelum loop, `while i <= 5:`, dan di dalam loop `print(i)` lalu `i = i + 1`.",
          codeChecks: [
            { pattern: "while\\s+i\\s*<=\\s*5\\s*:", message: "Tulis while i <= 5:" },
            { pattern: "i\\s*=\\s*i\\s*\\+\\s*1|i\\s*\\+=\\s*1", message: "Jangan lupa mengubah i di dalam loop: i = i + 1." },
          ],
          hints: ["Kalau programnya berjalan lama lalu dihentikan, kamu lupa `i = i + 1`, atau baris itu tidak menjorok."],
          solution: py(`
i = 1
while i <= 5:
    print(i)
    i = i + 1
`),
        },
        {
          title: "Mundur dua-dua",
          instructions: "Ubah ketiga bagiannya supaya mencetak 10, 8, 6, 4, 2: mulai dari `i = 10`, ulangi `while i > 0:`, dan kurangi 2 di setiap putaran.",
          codeChecks: [
            { pattern: "while\\s+i\\s*>\\s*0\\s*:", message: "Tulis while i > 0:" },
            { pattern: "i\\s*=\\s*i\\s*-\\s*2|i\\s*-=\\s*2", message: "Kurangi 2: i = i - 2." },
          ],
          solution: py(`
i = 10
while i > 0:
    print(i)
    i = i - 2
`),
        },
        {
          title: "Program baru: tebak angka",
          instructions: [
            "Hapus semua kodemu, lalu tulis permainan tebak angka. Komputer menyimpan angka rahasia 7, dan pemain terus menebak **selama** tebakannya salah:",
            "",
            "```python",
            "rahasia = 7",
            "tebakan = int(input())",
            "while tebakan != rahasia:",
            "    print(\"Salah, coba lagi\")",
            "    tebakan = int(input())",
            "print(\"Benar!\")",
            "```",
            "",
            "Bagian **ubah**-nya adalah membaca tebakan baru di dalam loop. Input langkah ini: 3, 9, 7.",
          ].join("\n"),
          stdin: "3\n9\n7\n",
          codeChecks: [
            { pattern: "while\\s+tebakan\\s*!=\\s*rahasia\\s*:", message: "Tulis while tebakan != rahasia:" },
            { pattern: "^\\s+tebakan\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca tebakan baru di dalam loop (menjorok)." },
          ],
          solution: py(`
rahasia = 7
tebakan = int(input())
while tebakan != rahasia:
    print("Salah, coba lagi")
    tebakan = int(input())
print("Benar!")
`),
        },
        {
          title: "Hitung percobaan",
          instructions: "Tambahkan `percobaan = 1` sebelum loop (tebakan pertama sudah satu percobaan), tambah 1 setiap kali membaca tebakan baru di dalam loop, dan ganti pesan terakhir menjadi `print(\"Benar! Kamu menebak dalam\", percobaan, \"kali\")`. Input langkah ini: 5, 7.",
          stdin: "5\n7\n",
          codeChecks: [{ pattern: "percobaan\\s*=\\s*percobaan\\s*\\+\\s*1|percobaan\\s*\\+=\\s*1", message: "Tambah 1 ke percobaan di dalam loop." }],
          solution: py(`
rahasia = 7
percobaan = 1
tebakan = int(input())
while tebakan != rahasia:
    print("Salah, coba lagi")
    tebakan = int(input())
    percobaan = percobaan + 1
print("Benar! Kamu menebak dalam", percobaan, "kali")
`),
        },
        {
          title: "Beri petunjuk",
          instructions: "Ganti `print(\"Salah, coba lagi\")` dengan `if`–`else`: kalau `tebakan < rahasia` cetak `Terlalu kecil`, kalau tidak, `Terlalu besar`. Input langkah ini: 3, 9, 7.",
          stdin: "3\n9\n7\n",
          codeChecks: [{ pattern: "if\\s+tebakan\\s*<\\s*rahasia\\s*:", message: "Di dalam loop, tulis if tebakan < rahasia:" }],
          solution: py(`
rahasia = 7
percobaan = 1
tebakan = int(input())
while tebakan != rahasia:
    if tebakan < rahasia:
        print("Terlalu kecil")
    else:
        print("Terlalu besar")
    tebakan = int(input())
    percobaan = percobaan + 1
print("Benar! Kamu menebak dalam", percobaan, "kali")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Syarat yang sudah False sejak awal",
      code: py(`
i = 10
while i < 5:
    print(i)
    i = i + 1
print("Selesai")
`),
      explain: "Loop `while` memeriksa syaratnya **sebelum** putaran pertama. 10 < 5 sudah `False`, jadi bloknya tidak dijalankan sekali pun, tanpa error apa pun. Periksa nilai awal variabelnya.",
      fix: py(`
i = 1
while i < 5:
    print(i)
    i = i + 1
print("Selesai")
`),
    },
    md(
      "### Mengubah variabel di luar loop",
      "",
      "```python",
      "hitung = 3",
      "while hitung > 0:",
      "    print(hitung)",
      "hitung = hitung - 1",
      "```",
      "",
      "Baris terakhir tidak menjorok, jadi berada **di luar** loop dan tidak pernah dijalankan selama loop berputar. `hitung` selalu 3, `3 > 0` selalu `True`, dan programnya mencetak 3 tanpa henti. (Contoh ini sengaja tidak dijalankan di sini. Di editor AmbaraEdu, program seperti ini dihentikan setelah 30 detik.)",
      "",
      "**Perbaikannya:** baris pengubahnya harus menjorok, di dalam loop.",
      "",
      "```python",
      "hitung = 3",
      "while hitung > 0:",
      "    print(hitung)",
      "    hitung = hitung - 1",
      "```"
    ),
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Kelipatan dua",
      task: "Mulai dari `n = 1`, kalikan 2 terus **selama** `n` kurang dari 1000, dan cetak `n` di setiap putaran (1, 2, 4, 8, …). Berapa angka terakhir yang tercetak?",
      starterCode: py(`
n = 1

# Tulis loop while di sini
`) + "\n",
      solution: py(`
n = 1
while n < 1000:
    print(n)
    n = n * 2
`),
    },
    {
      kind: "try",
      title: "Jumlah digit",
      task: "Hitung jumlah digit `angka` (2024 → 2 + 0 + 2 + 4 = 8) dengan `while`. Petunjuk: `angka % 10` memberi digit terakhir, dan `angka // 10` membuang digit terakhir. Ulangi selama `angka > 0`.",
      starterCode: py(`
angka = 2024

# Tulis loop while di sini
`) + "\n",
      solution: py(`
angka = 2024
total = 0
while angka > 0:
    total = total + angka % 10
    angka = angka // 10
print(total)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `while syarat:` mengulang **selama** syaratnya `True`, diperiksa sebelum setiap putaran.",
      "- Tiga bagian: **siapkan** sebelum loop, **periksa** di baris while, **ubah** di dalam loop.",
      "- Lupa mengubah = infinite loop.",
      "- Pakai `for` kalau tahu berapa kali, `while` kalau mengulang sampai sesuatu terjadi.",
      "",
      "Berikutnya: keluar dari loop di tengah jalan dengan `break`, dan melewati satu putaran dengan `continue`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 7

const L7: LessonSource = {
  title: "7. break dan continue: Keluar atau Lewati",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Kadang di tengah loop kamu sudah tahu jawabannya, jadi tidak perlu melanjutkan: misalnya sudah menemukan yang dicari. Kadang juga ada satu putaran yang ingin kamu **lewati**, misalnya input kosong.",
      "",
      "**Yang akan kamu pelajari:**",
      "- `break`: keluar dari loop **sekarang juga**",
      "- `continue`: lewati sisa putaran ini, **langsung ke putaran berikutnya**",
      "- pola `while True` + `break` untuk program yang terus berjalan sampai disuruh berhenti"
    ),
    md(
      "## `break`: keluar sekarang",
      "",
      "Begitu Python menjalankan `break`, loop langsung berhenti, dan program lanjut ke baris **setelah** loop. Biasanya `break` ada di dalam `if`."
    ),
    { kind: "example", lead: "Cari bilangan pertama di atas 20 yang habis dibagi 7:", code: py(`
for n in range(21, 100):
    if n % 7 == 0:
        print("Ketemu:", n)
        break
print("Pencarian selesai")
`) },
    md(
      "## `continue`: lewati putaran ini",
      "",
      "`continue` melompati sisa blok untuk putaran ini saja. Loop-nya **tidak** berhenti: lanjut ke putaran berikutnya."
    ),
    { kind: "example", lead: "Cetak 1 sampai 6, kecuali 4:", code: py(`
for n in range(1, 7):
    if n == 4:
        continue
    print(n)
`) },
    {
      kind: "trace",
      title: "Lewati dan keluar",
      code: py(`
for i in range(1, 6):
    if i == 3:
        continue
    if i == 5:
        break
    print(i)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["1\n2\n4", "1\n2\n4\n5", "1\n2", "1\n2\n3\n4"],
        explanation: "Saat i = 3, continue melewati print. Saat i = 5, break menghentikan loop sebelum print. Jadi yang tercetak hanya 1, 2, dan 4.",
      },
    },
    md(
      "### Pola `while True`",
      "",
      "`while True:` artinya \"ulangi selamanya\", karena syaratnya selalu benar. Satu-satunya jalan keluar adalah `break`. Pola ini cocok untuk program yang terus melayani sampai pengguna mengetik perintah berhenti:",
      "",
      "```python",
      "while True:",
      "    perintah = input()",
      "    if perintah == \"selesai\":",
      "        break",
      "    ...",
      "```"
    ),
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Kasir kantin",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Terima pesanan sampai selesai",
          instructions: [
            "Kasir menerima pesanan satu per satu sampai mengetik `selesai`:",
            "",
            "```python",
            "while True:",
            "    pesanan = input()",
            "    if pesanan == \"selesai\":",
            "        break",
            "    print(\"Pesanan:\", pesanan)",
            "print(\"Kantin tutup\")",
            "```",
            "",
            "Input langkah ini: `nasi`, `teh`, `selesai`.",
          ].join("\n"),
          stdin: "nasi\nteh\nselesai\n",
          codeChecks: [
            { pattern: "while\\s+True\\s*:", message: "Tulis while True:" },
            { pattern: "^\\s+break\\b", message: "Keluar dengan break saat pesanan == \"selesai\"." },
          ],
          hints: ["Tanpa `break`, `while True` tidak akan pernah berhenti."],
          solution: py(`
while True:
    pesanan = input()
    if pesanan == "selesai":
        break
    print("Pesanan:", pesanan)
print("Kantin tutup")
`),
        },
        {
          title: "Lewati input kosong",
          instructions: "Kadang kasir tidak sengaja menekan Enter tanpa mengetik apa pun. Tepat setelah membaca pesanan, tambahkan: kalau `pesanan == \"\"`, `continue`. Input langkah ini: `nasi`, (kosong), `teh`, `selesai`.",
          stdin: "nasi\n\nteh\nselesai\n",
          codeChecks: [{ pattern: "^\\s+continue\\b", message: "Lewati input kosong dengan continue." }],
          solution: py(`
while True:
    pesanan = input()
    if pesanan == "":
        continue
    if pesanan == "selesai":
        break
    print("Pesanan:", pesanan)
print("Kantin tutup")
`),
        },
        {
          title: "Hitung pesanan",
          instructions: "Tambahkan `jumlah = 0` sebelum loop dan `jumlah = jumlah + 1` tepat setelah mencetak pesanan. Setelah loop, **sebelum** `Kantin tutup`, cetak `print(\"Total pesanan:\", jumlah)`. Input langkah ini: `nasi`, `teh`, `selesai`.",
          stdin: "nasi\nteh\nselesai\n",
          codeChecks: [
            { pattern: "^jumlah\\s*=\\s*0", message: "Siapkan jumlah = 0 sebelum loop." },
            { pattern: "^print\\(\\s*\"Total pesanan:\"\\s*,\\s*jumlah\\s*\\)", message: "Cetak print(\"Total pesanan:\", jumlah) setelah loop." },
          ],
          solution: py(`
jumlah = 0
while True:
    pesanan = input()
    if pesanan == "":
        continue
    if pesanan == "selesai":
        break
    print("Pesanan:", pesanan)
    jumlah = jumlah + 1
print("Total pesanan:", jumlah)
print("Kantin tutup")
`),
        },
        {
          title: "Menu yang habis",
          instructions: "Es sedang habis. Sebelum mencetak pesanan, tambahkan: kalau `pesanan == \"es\"`, cetak `Maaf, es habis` lalu `continue` (jadi tidak dihitung). Input langkah ini: `nasi`, `es`, `teh`, `selesai`.",
          stdin: "nasi\nes\nteh\nselesai\n",
          codeChecks: [{ pattern: "if\\s+pesanan\\s*==\\s*\"es\"\\s*:", message: "Periksa if pesanan == \"es\":" }],
          hints: ["Urutannya: baca → lewati yang kosong → berhenti kalau selesai → tolak es → cetak dan hitung."],
          solution: py(`
jumlah = 0
while True:
    pesanan = input()
    if pesanan == "":
        continue
    if pesanan == "selesai":
        break
    if pesanan == "es":
        print("Maaf, es habis")
        continue
    print("Pesanan:", pesanan)
    jumlah = jumlah + 1
print("Total pesanan:", jumlah)
print("Kantin tutup")
`),
        },
        {
          title: "Maksimal tiga pesanan",
          instructions: "Dapur hanya sanggup 3 pesanan. Tepat setelah `jumlah = jumlah + 1`, tambahkan: kalau `jumlah == 3`, cetak `Pesanan penuh` lalu `break`. Input langkah ini: `a`, `b`, `c`, `d`, `selesai`.",
          stdin: "a\nb\nc\nd\nselesai\n",
          codeChecks: [{ pattern: "if\\s+jumlah\\s*==\\s*3\\s*:", message: "Periksa if jumlah == 3:" }],
          solution: py(`
jumlah = 0
while True:
    pesanan = input()
    if pesanan == "":
        continue
    if pesanan == "selesai":
        break
    if pesanan == "es":
        print("Maaf, es habis")
        continue
    print("Pesanan:", pesanan)
    jumlah = jumlah + 1
    if jumlah == 3:
        print("Pesanan penuh")
        break
print("Total pesanan:", jumlah)
print("Kantin tutup")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "`break` di luar loop",
      code: py(`
nilai = 80
if nilai > 75:
    print("Lulus")
    break
`),
      explain: "`break` hanya bisa menghentikan **loop**. Di dalam `if` yang tidak berada di dalam loop, tidak ada yang bisa dihentikan.",
      fix: py(`
nilai = 80
if nilai > 75:
    print("Lulus")
`),
    },
    {
      kind: "mistake",
      title: "Tertukar `break` dan `continue`",
      code: py(`
for n in range(1, 7):
    if n == 4:
        break
    print(n)
`),
      explain: "Maksudnya \"cetak 1 sampai 6, kecuali 4\", tapi yang tercetak hanya 1, 2, 3. `break` menghentikan **seluruh** loop. Untuk melewati satu putaran saja, pakai `continue`.",
      fix: py(`
for n in range(1, 7):
    if n == 4:
        continue
    print(n)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Bilangan prima",
      task: "Periksa apakah `n` bilangan prima: coba bagi `n` dengan 2 sampai `n - 1`. Begitu ada yang membagi habis, cetak `bukan prima` dan `break`. Petunjuk: simpan `prima = True` sebelum loop, dan ubah menjadi `False` saat menemukan pembagi. Setelah loop, cetak `prima` kalau masih `True`.",
      starterCode: py(`
n = 29

# Tulis loop di sini
`) + "\n",
      solution: py(`
n = 29
prima = True
for d in range(2, n):
    if n % d == 0:
        prima = False
        print("bukan prima")
        break
if prima:
    print("prima")
`),
    },
    {
      kind: "try",
      title: "Lewati kelipatan 3",
      task: "Jumlahkan angka 1 sampai 20, **kecuali** kelipatan 3. Gunakan `continue`.",
      starterCode: py(`
total = 0

# Tulis loop di sini
`) + "\n",
      solution: py(`
total = 0
for n in range(1, 21):
    if n % 3 == 0:
        continue
    total = total + n
print(total)
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `break` keluar dari loop **sekarang**. Program lanjut ke baris setelah loop.",
      "- `continue` melewati sisa putaran ini dan lanjut ke putaran berikutnya.",
      "- `while True:` + `break` = ulangi terus sampai ada perintah berhenti.",
      "- Keduanya hanya boleh dipakai di dalam loop.",
      "",
      "Berikutnya: loop di dalam loop, untuk pola bintang dan tabel."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 8

const L8: LessonSource = {
  title: "8. Loop Bersarang: Pola dan Tabel",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Tabel perkalian punya **baris** dan **kolom**. Pola bintang punya baris, dan setiap baris berisi beberapa bintang. Untuk membuatnya, kita butuh loop **di dalam** loop: loop luar untuk baris, loop dalam untuk isi setiap baris.",
      "",
      "**Yang akan kamu pelajari:**",
      "- `print(..., end=\"\")` untuk mencetak tanpa pindah baris",
      "- loop bersarang: loop dalam berjalan penuh di **setiap** putaran loop luar",
      "- membuat pola segitiga dan tabel perkalian"
    ),
    md(
      "## Mencetak tanpa pindah baris",
      "",
      "Biasanya setiap `print` berakhir dengan pindah baris. Dengan `end=\"\"`, `print` **tidak** pindah baris, jadi yang berikutnya tercetak di sebelahnya. `print()` kosong hanya pindah baris."
    ),
    { kind: "example", code: py(`
for i in range(5):
    print("*", end="")
print()
print("baris baru")
`) },
    md(
      "## Loop di dalam loop",
      "",
      "Untuk **setiap** putaran loop luar, loop dalam berjalan **dari awal sampai habis**. Kalau loop luar 3 putaran dan loop dalam 4 putaran, isi loop dalam dijalankan 3 × 4 = 12 kali."
    ),
    {
      kind: "trace",
      title: "Pasangan i dan j",
      code: py(`
for i in range(1, 3):
    for j in range(1, 3):
        print(i, j)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["1 1\n1 2\n2 1\n2 2", "1 1\n2 2", "1 1\n2 1\n1 2\n2 2", "1 2\n2 1"],
        explanation: "Saat i = 1, loop dalam berjalan penuh (j = 1, lalu j = 2). Baru setelah itu i menjadi 2, dan loop dalam berjalan penuh lagi dari awal.",
      },
    },
    { kind: "example", lead: "Persegi bintang: 3 baris, masing-masing 5 bintang.", code: py(`
for baris in range(3):
    for kolom in range(5):
        print("*", end="")
    print()
`) },
    md(
      "Perhatikan letak `print()` kosong: menjorok **4 spasi**, jadi ia milik loop **luar**. Ia dijalankan sekali di akhir setiap baris, setelah loop dalam selesai mencetak bintang-bintangnya."
    ),
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Pola bintang dan tabel perkalian",
      intro,
      starterCode: START,
      steps: [
        {
          title: "Satu baris bintang",
          instructions: "Cetak 5 bintang **dalam satu baris** dengan `for i in range(5):` dan `print(\"*\", end=\"\")`. Setelah loop, `print()` untuk pindah baris.",
          codeChecks: [{ pattern: "print\\(\\s*\"\\*\"\\s*,\\s*end\\s*=\\s*\"\"\\s*\\)", message: "Cetak dengan print(\"*\", end=\"\")." }],
          hints: ["Tanpa `end=\"\"`, setiap bintang tercetak di barisnya sendiri."],
          solution: py(`
for i in range(5):
    print("*", end="")
print()
`),
        },
        {
          title: "Tiga baris: loop luar",
          instructions: [
            "Bungkus semuanya dengan loop luar `for baris in range(3):`. Seluruh kode lama digeser 4 spasi ke kanan:",
            "",
            "```python",
            "for baris in range(3):",
            "    for i in range(5):",
            "        print(\"*\", end=\"\")",
            "    print()",
            "```",
          ].join("\n"),
          codeChecks: [
            { pattern: "^for\\s+baris\\s+in\\s+range\\(\\s*3\\s*\\)\\s*:", message: "Mulai dengan loop luar for baris in range(3):" },
            { pattern: "^\\s{4}for\\s+i\\s+in\\s+range\\(", message: "Loop dalam menjorok 4 spasi, di dalam loop luar." },
          ],
          hints: ["`print()` kosong menjorok 4 spasi (milik loop luar), bukan 8 (milik loop dalam)."],
          solution: py(`
for baris in range(3):
    for i in range(5):
        print("*", end="")
    print()
`),
        },
        {
          title: "Segitiga",
          instructions: "Buat segitiga: baris pertama 1 bintang, kedua 2, ketiga 3. Caranya, banyak putaran loop dalam bergantung pada loop luar: ganti `range(5)` menjadi `range(baris + 1)`.",
          codeChecks: [{ pattern: "range\\(\\s*baris\\s*\\+\\s*1\\s*\\)", message: "Loop dalam: range(baris + 1)." }],
          hints: ["`baris` berisi 0, 1, 2. Kenapa harus ditambah 1?"],
          solution: py(`
for baris in range(3):
    for i in range(baris + 1):
        print("*", end="")
    print()
`),
        },
        {
          title: "Tinggi dari input",
          instructions: "Di paling atas, baca `tinggi = int(input())`, lalu loop luar menjadi `range(tinggi)`. Input langkah ini 4.",
          stdin: "4\n",
          codeChecks: [{ pattern: "for\\s+baris\\s+in\\s+range\\(\\s*tinggi\\s*\\)", message: "Loop luar: range(tinggi)." }],
          solution: py(`
tinggi = int(input())
for baris in range(tinggi):
    for i in range(baris + 1):
        print("*", end="")
    print()
`),
        },
        {
          title: "Tabel perkalian",
          instructions: [
            "Di paling bawah, baca `n = int(input())`, lalu cetak tabel perkalian n × n:",
            "",
            "```python",
            "for i in range(1, n + 1):",
            "    for j in range(1, n + 1):",
            "        print(i * j, end=\" \")",
            "    print()",
            "```",
            "",
            "`end=\" \"` memberi spasi di antara angka. Input langkah ini 4 (tinggi segitiga) lalu 3 (ukuran tabel).",
          ].join("\n"),
          stdin: "4\n3\n",
          codeChecks: [{ pattern: "print\\(\\s*i\\s*\\*\\s*j\\s*,\\s*end\\s*=\\s*\" \"\\s*\\)", message: "Cetak print(i * j, end=\" \")." }],
          solution: py(`
tinggi = int(input())
for baris in range(tinggi):
    for i in range(baris + 1):
        print("*", end="")
    print()
n = int(input())
for i in range(1, n + 1):
    for j in range(1, n + 1):
        print(i * j, end=" ")
    print()
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "`print()` ikut masuk ke loop dalam",
      code: py(`
for baris in range(2):
    for kolom in range(3):
        print("*", end="")
        print()
`),
      explain: "Maksudnya 2 baris berisi 3 bintang, tapi setiap bintang malah di barisnya sendiri. `print()` menjorok 8 spasi, jadi ikut loop dalam dan pindah baris setelah **setiap** bintang. Ia seharusnya menjorok 4 spasi: sekali per baris.",
      fix: py(`
for baris in range(2):
    for kolom in range(3):
        print("*", end="")
    print()
`),
    },
    {
      kind: "mistake",
      title: "Lupa `print()` di akhir baris",
      code: py(`
for baris in range(2):
    for kolom in range(3):
        print("*", end="")
`),
      explain: "Semua bintang menempel dalam satu baris panjang, karena tidak ada yang pernah pindah baris. Setiap baris harus diakhiri `print()` di loop luar.",
      fix: py(`
for baris in range(2):
    for kolom in range(3):
        print("*", end="")
    print()
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Segitiga terbalik",
      task: "Cetak segitiga terbalik setinggi `t`: baris pertama `t` bintang, lalu berkurang satu-satu sampai 1 bintang. Petunjuk: loop luar bisa menghitung mundur!",
      starterCode: py(`
t = 4

# Tulis loop bersarang di sini
`) + "\n",
      solution: py(`
t = 4
for baris in range(t, 0, -1):
    for i in range(baris):
        print("*", end="")
    print()
`),
    },
    {
      kind: "try",
      title: "Papan catur",
      task: "Cetak papan 4 × 4 dari `#` dan `.` yang berselang-seling, dimulai dengan `#` di pojok kiri atas. Petunjuk: kotak di baris `b` dan kolom `k` berisi `#` kalau `(b + k) % 2 == 0`.",
      starterCode: py(`
# Tulis loop bersarang di sini
`) + "\n",
      solution: py(`
for b in range(4):
    for k in range(4):
        if (b + k) % 2 == 0:
            print("#", end="")
        else:
            print(".", end="")
    print()
`),
    },
    md(
      "## Ringkasan bab Perulangan",
      "",
      "| Alat | Dipakai untuk |",
      "|---|---|",
      "| `for i in range(n)` | mengulang n kali (0 sampai n − 1) |",
      "| `range(mulai, berhenti, langkah)` | hitungan lain, termasuk mundur; *berhenti* tidak ikut |",
      "| akumulator | menjumlah, menghitung, membangun teks: siapkan **sebelum** loop |",
      "| loop + `if` | menyaring, menghitung yang memenuhi syarat, mencari terbesar |",
      "| `for huruf in teks` | memeriksa teks huruf demi huruf |",
      "| `while syarat` | mengulang sampai sesuatu terjadi: siapkan, periksa, **ubah** |",
      "| `break` / `continue` | keluar dari loop / lewati satu putaran |",
      "| loop bersarang | baris × kolom: loop dalam berjalan penuh di setiap putaran luar |",
      "",
      "Kalau loop-mu memberi hasil aneh, telusuri seperti di visualisasi: putaran ke berapa sekarang, dan berapa isi setiap variabel?"
    ),
  ],
};

export const PYTHON_LOOP: Unit = { chapterTitle: CHAPTER_TITLE, lessons: [L1, L2, L3, L4, L5, L6, L7, L8] };
