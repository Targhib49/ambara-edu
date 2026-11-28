/**
 * Basic Python, step-by-step unit 1: "Percabangan" (if) as six small lessons,
 * each teaching one idea. Block kinds and the lesson shape are described in
 * python-stepwise.ts; scripts/setup-python-stepwise.ts --unit if builds it.
 */
import { GUIDED_TAIL, INPUT_NOTE, md, py, type LessonSource, type Unit } from "./python-stepwise";

const CHAPTER_TITLE = "Percabangan: Langkah demi Langkah";

// ───────────────────────────────────────────────────────────── Lesson 1

const L1: LessonSource = {
  title: "1. Membandingkan Nilai: True dan False",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Program yang pintar bisa **mengambil keputusan**: lulus atau remedial, boleh masuk atau tidak, diskon atau harga normal. Semua keputusan itu dimulai dari satu hal kecil: **membandingkan dua nilai**.",
      "",
      "Di pelajaran ini kamu belum menulis `if`. Kamu belajar bahan bakunya dulu: pertanyaan yang jawabannya hanya **benar** atau **salah**.",
      "",
      "**Yang akan kamu pelajari:**",
      "- enam operator perbandingan: `==`, `!=`, `<`, `>`, `<=`, `>=`",
      "- tipe data baru, `bool`, yang isinya hanya `True` atau `False`",
      "- beda `=` (menyimpan) dan `==` (membandingkan)"
    ),
    md(
      "## Pertanyaan ya/tidak untuk Python",
      "",
      "Kalau kamu menulis `5 > 3`, Python tidak menampilkan angka. Ia **menjawab pertanyaan** \"apakah 5 lebih besar dari 3?\" dengan `True` (benar) atau `False` (salah)."
    ),
    { kind: "example", code: py(`
print(5 > 3)
print(5 < 3)
`) },
    md(
      "Ini enam operator perbandingan yang bisa kamu pakai:",
      "",
      "| Operator | Artinya | Contoh | Hasil |",
      "|---|---|---|---|",
      "| `==` | sama dengan | `7 == 7` | `True` |",
      "| `!=` | tidak sama dengan | `7 != 7` | `False` |",
      "| `<` | lebih kecil dari | `3 < 8` | `True` |",
      "| `>` | lebih besar dari | `3 > 8` | `False` |",
      "| `<=` | lebih kecil **atau sama dengan** | `8 <= 8` | `True` |",
      "| `>=` | lebih besar **atau sama dengan** | `7 >= 8` | `False` |",
      "",
      "Perhatikan `<=` dan `>=`: tandanya ditulis **berdempetan**, dan `<` atau `>` selalu di depan `=`."
    ),
    md(
      "### Membandingkan isi variabel",
      "",
      "Yang dibandingkan biasanya isi variabel, bukan angka yang ditulis langsung. Python mengambil isi variabelnya dulu, baru membandingkan."
    ),
    { kind: "example", code: py(`
nilai = 80
kkm = 75
print(nilai >= kkm)
print(nilai == 100)
print(nilai != kkm)
`) },
    md(
      "### `True` dan `False` adalah nilai juga",
      "",
      "Hasil perbandingan bisa **disimpan di variabel**, sama seperti angka atau teks. Tipe datanya bernama `bool` (dari *boolean*). Perhatikan huruf besarnya: `True` dan `False`, bukan `true` atau `false`."
    ),
    { kind: "example", code: py(`
lulus = 80 >= 75
print(lulus)
print(type(lulus))
`) },
    md(
      "### Teks juga bisa dibandingkan",
      "",
      "`==` dan `!=` juga bekerja untuk teks. Hati-hati: huruf besar dan kecil dianggap **berbeda**."
    ),
    { kind: "example", code: py(`
hari = "Sabtu"
print(hari == "Sabtu")
print(hari == "sabtu")
print(hari != "Minggu")
`) },
    md(
      "### `=` dan `==` itu berbeda",
      "",
      "Ini sumber kesalahan nomor satu pemula:",
      "",
      "- `x = 5` artinya **simpan** 5 ke dalam `x`. Ini perintah.",
      "- `x == 5` artinya **apakah** `x` sama dengan 5? Ini pertanyaan, jawabannya `True` atau `False`.",
      "",
      "Cara mengingatnya: satu `=` menaruh, dua `==` menanyakan."
    ),
    {
      kind: "trace",
      title: "Tebak dulu, lalu telusuri",
      code: py(`
x = 5
y = 8
print(x > y)
print(x + 3 == y)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["True\nFalse", "False\nTrue", "False\nFalse", "True\nTrue"],
        explanation: "5 tidak lebih besar dari 8, jadi baris 3 mencetak False. Di baris 4, Python menghitung x + 3 dulu (hasilnya 8), baru membandingkan 8 == 8, jadi True.",
      },
      notes: {
        3: "Python bertanya: apakah 5 > 8? Jawabannya False.",
        4: "Python menghitung x + 3 = 8 dulu, lalu bertanya: apakah 8 == 8? Jawabannya True.",
      },
    },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Detektor perbandingan",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
a = 7
b = 10

# Tulis kodemu di bawah ini, satu langkah demi satu langkah.
`) + "\n",
      steps: [
        {
          title: "Apakah a lebih kecil dari b?",
          instructions: "Tambahkan satu baris yang mencetak hasil perbandingan **`a < b`**.\n\n```python\nprint(a < b)\n```",
          codeChecks: [{ pattern: "print\\(\\s*a\\s*<\\s*b\\s*\\)", message: "Cetak hasil perbandingan a < b dengan print(a < b)." }],
          hints: ["Tulis persis `print(a < b)` di bawah komentar."],
          solution: py(`
a = 7
b = 10

print(a < b)
`),
        },
        {
          title: "Apakah a sama dengan b?",
          instructions: "Di baris berikutnya, cetak hasil **`a == b`**. Ingat: dua tanda sama dengan.",
          codeChecks: [{ pattern: "print\\(\\s*a\\s*==\\s*b\\s*\\)", message: "Cetak a == b (dua tanda =)." }],
          hints: ["`print(a = b)` itu salah: satu `=` artinya menyimpan, bukan membandingkan.", "Tulis `print(a == b)`."],
          solution: py(`
a = 7
b = 10

print(a < b)
print(a == b)
`),
        },
        {
          title: "Apakah a tidak sama dengan b?",
          instructions: "Tambahkan baris yang mencetak **`a != b`**.",
          codeChecks: [{ pattern: "print\\(\\s*a\\s*!=\\s*b\\s*\\)", message: "Cetak a != b." }],
          hints: ["Tanda \"tidak sama dengan\" ditulis `!=`, tanda seru lalu sama dengan, tanpa spasi di antaranya."],
          solution: py(`
a = 7
b = 10

print(a < b)
print(a == b)
print(a != b)
`),
        },
        {
          title: "Simpan jawabannya di variabel",
          instructions: [
            "Hasil perbandingan bisa disimpan. Tambahkan dua baris ini di bawah:",
            "",
            "```python",
            "sama = a == b",
            "print(type(sama))",
            "```",
            "",
            "Baris pertama menyimpan jawaban `a == b` ke variabel `sama`. Baris kedua menunjukkan tipe datanya.",
          ].join("\n"),
          codeChecks: [
            { pattern: "sama\\s*=\\s*a\\s*==\\s*b", message: "Simpan hasil a == b ke variabel sama." },
            { pattern: "print\\(\\s*type\\(\\s*sama\\s*\\)\\s*\\)", message: "Cetak type(sama)." },
          ],
          solution: py(`
a = 7
b = 10

print(a < b)
print(a == b)
print(a != b)
sama = a == b
print(type(sama))
`),
        },
        {
          title: "Bandingkan angka dari input",
          instructions: [
            "Sekarang angkanya dibaca dari input. Ubah dua baris pertama menjadi:",
            "",
            "```python",
            "a = int(input())",
            "b = int(input())",
            "```",
            "",
            "Input langkah ini adalah 12 lalu 12. Perhatikan bagaimana semua jawabannya berubah tanpa kamu mengubah perbandingannya.",
          ].join("\n"),
          stdin: "12\n12\n",
          codeChecks: [{ pattern: "a\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca a dengan int(input())." }],
          hints: ["`int(...)` mengubah teks dari `input()` menjadi angka, supaya bisa dibandingkan sebagai angka."],
          solution: py(`
a = int(input())
b = int(input())

print(a < b)
print(a == b)
print(a != b)
sama = a == b
print(type(sama))
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Memakai `=` padahal maksudnya membandingkan",
      code: py(`
x = 5
print(x = 5)
`),
      explain: "Di dalam `print(...)`, `x = 5` dibaca Python sebagai \"argumen bernama x\", bukan pertanyaan. Untuk bertanya \"apakah x sama dengan 5?\" pakai dua tanda sama dengan.",
      fix: py(`
x = 5
print(x == 5)
`),
    },
    {
      kind: "mistake",
      title: "Membandingkan teks dengan angka",
      code: py(`
umur = "13"
print(umur > 12)
`),
      explain: "`\"13\"` dengan tanda kutip adalah **teks**, bukan angka. Python tidak bisa menentukan apakah sebuah teks lebih besar dari angka. Ini sering terjadi pada hasil `input()`, yang selalu berupa teks. Ubah dulu menjadi angka dengan `int(...)`.",
      fix: py(`
umur = int("13")
print(umur > 12)
`),
    },
    {
      kind: "mistake",
      title: "Menulis `true` dengan huruf kecil",
      code: py(`
ikut = true
print(ikut)
`),
      explain: "Python membedakan huruf besar dan kecil. Nilai benar ditulis `True` dan salah ditulis `False`, dengan huruf besar di depan. `true` dianggap nama variabel yang belum pernah dibuat.",
      fix: py(`
ikut = True
print(ikut)
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Uang jajan cukup?",
      task: "Rina punya uang `uang` dan ingin membeli buku seharga `harga`. Lengkapi programnya supaya mencetak **apakah uangnya cukup** (`True` atau `False`), lalu **apakah harganya tepat 25000**.",
      starterCode: py(`
uang = 20000
harga = 25000

# Cetak: apakah uang cukup untuk membeli buku?

# Cetak: apakah harganya tepat 25000?
`) + "\n",
      solution: py(`
uang = 20000
harga = 25000
print(uang >= harga)
print(harga == 25000)
`),
    },
    {
      kind: "try",
      title: "Nama yang sama?",
      task: "Cetak apakah `nama1` sama dengan `nama2`, lalu apakah `nama1` sama dengan `\"budi\"` (huruf kecil semua). Tebak dulu jawabannya sebelum menjalankan.",
      starterCode: py(`
nama1 = "Budi"
nama2 = "Budi"

# Tulis dua perbandingan di sini
`) + "\n",
      solution: py(`
nama1 = "Budi"
nama2 = "Budi"
print(nama1 == nama2)
print(nama1 == "budi")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- Perbandingan adalah **pertanyaan** yang jawabannya `True` atau `False`.",
      "- Operatornya: `==` `!=` `<` `>` `<=` `>=`.",
      "- `True` dan `False` bertipe `bool`, dan bisa disimpan di variabel.",
      "- **Satu `=` menyimpan, dua `==` membandingkan.**",
      "- Teks dari `input()` harus diubah dengan `int()` sebelum dibandingkan sebagai angka.",
      "",
      "Berikutnya: memakai jawaban `True`/`False` ini untuk memutuskan baris mana yang dijalankan, dengan `if`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 2

const L2: LessonSource = {
  title: "2. if: Jalankan Hanya Kalau Benar",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Sampai sekarang, programmu menjalankan **semua** baris dari atas ke bawah. Tapi bayangkan aplikasi termometer: pesan \"Kamu demam\" seharusnya muncul **hanya kalau** suhunya tinggi.",
      "",
      "`if` membuat sebagian kode **hanya dijalankan kalau sebuah syarat bernilai `True`**.",
      "",
      "**Yang akan kamu pelajari:**",
      "- cara menulis `if`: syarat, titik dua, dan indentasi",
      "- apa itu **blok** kode",
      "- kode mana yang selalu jalan, dan mana yang hanya kadang-kadang"
    ),
    md(
      "## Bentuk `if`",
      "",
      "```python",
      "if syarat:",
      "    kode yang dijalankan kalau syarat True",
      "```",
      "",
      "Tiga hal yang wajib ada:",
      "",
      "1. kata **`if`**, lalu syaratnya (sebuah perbandingan, seperti di pelajaran 1),",
      "2. **titik dua `:`** di akhir baris,",
      "3. baris di bawahnya **menjorok ke dalam** (indentasi), biasanya 4 spasi. Di editor, tekan Tab.",
      "",
      "Baris-baris yang menjorok itu disebut **blok** milik `if`. Blok ini dijalankan kalau syaratnya `True`, dan **dilewati** kalau `False`."
    ),
    { kind: "example", lead: "Suhunya 38, jadi syaratnya True:", code: py(`
suhu = 38
if suhu > 37.5:
    print("Kamu demam")
`) },
    { kind: "example", lead: "Ganti suhunya menjadi 36. Syaratnya False, jadi tidak ada yang dicetak sama sekali:", code: py(`
suhu = 36
if suhu > 37.5:
    print("Kamu demam")
`) },
    md(
      "### Di dalam blok, di luar blok",
      "",
      "Indentasi menentukan baris mana yang **ikut** `if`. Baris yang kembali rata kiri sudah **di luar** `if`, jadi selalu dijalankan."
    ),
    { kind: "example", code: py(`
suhu = 36
if suhu > 37.5:
    print("Kamu demam")
    print("Istirahat dan minum air")
print("Pemeriksaan selesai")
`) },
    md(
      "Dua baris yang menjorok adalah satu blok: keduanya dilewati karena 36 tidak lebih dari 37.5. Baris terakhir rata kiri, jadi tetap dijalankan."
    ),
    {
      kind: "trace",
      title: "Uang cukup atau tidak?",
      code: py(`
uang = 15000
harga = 20000
if uang >= harga:
    print("Beli!")
    uang = uang - harga
print("Sisa uang:", uang)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["Beli!\nSisa uang: -5000", "Sisa uang: 15000", "Beli!\nSisa uang: 15000", "Beli!"],
        explanation: "15000 >= 20000 bernilai False, jadi kedua baris di dalam blok (baris 4 dan 5) dilewati. Uangnya tidak berkurang. Baris 6 ada di luar if, jadi selalu dijalankan.",
      },
    },
    md(
      "### Beberapa `if` terpisah",
      "",
      "Kamu boleh menulis beberapa `if` berurutan. Masing-masing diperiksa **sendiri-sendiri**: satu `if` tidak memengaruhi `if` yang lain."
    ),
    { kind: "example", code: py(`
nilai = 100
if nilai >= 75:
    print("Lulus")
if nilai == 100:
    print("Sempurna!")
`) },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Termometer pintar",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
suhu = 38

# Tulis kodemu di bawah ini.
`) + "\n",
      steps: [
        {
          title: "Pesan demam",
          instructions: [
            "Tulis `if` yang mencetak `Kamu demam` **kalau `suhu` lebih dari 37.5**.",
            "",
            "```python",
            "if suhu > 37.5:",
            "    print(\"Kamu demam\")",
            "```",
            "",
            "Jangan lupa titik dua di akhir baris `if`, dan 4 spasi di depan `print`.",
          ].join("\n"),
          codeChecks: [{ pattern: "^if\\s+suhu\\s*>\\s*37\\.5\\s*:", message: "Tulis if suhu > 37.5: (dengan titik dua)." }],
          hints: ["Kalau muncul `SyntaxError: expected ':'`, titik duanya belum ada.", "Kalau muncul `IndentationError`, baris `print` belum menjorok ke dalam."],
          solution: py(`
suhu = 38

if suhu > 37.5:
    print("Kamu demam")
`),
        },
        {
          title: "Baris yang selalu jalan",
          instructions: "Di paling bawah, **rata kiri** (tanpa spasi di depan), tambahkan `print(\"Pemeriksaan selesai\")`. Baris ini harus selalu dicetak, demam atau tidak.",
          codeChecks: [{ pattern: "^print\\(\\s*\"Pemeriksaan selesai\"\\s*\\)", message: "Tulis print(\"Pemeriksaan selesai\") rata kiri, di luar if." }],
          hints: ["Kalau baris ini menjorok, ia ikut masuk ke blok `if` dan tidak lagi selalu jalan."],
          solution: py(`
suhu = 38

if suhu > 37.5:
    print("Kamu demam")
print("Pemeriksaan selesai")
`),
        },
        {
          title: "Dua baris di dalam blok",
          instructions: "Tambahkan saran `Istirahat dan minum air` **di dalam blok `if`**, tepat di bawah `print(\"Kamu demam\")`. Artinya baris itu juga menjorok 4 spasi.",
          codeChecks: [{ pattern: "^\\s+print\\(\\s*\"Istirahat dan minum air\"\\s*\\)", message: "Baris saran harus menjorok, di dalam blok if." }],
          solution: py(`
suhu = 38

if suhu > 37.5:
    print("Kamu demam")
    print("Istirahat dan minum air")
print("Pemeriksaan selesai")
`),
        },
        {
          title: "Suhu dari input",
          instructions: [
            "Ganti baris pertama supaya suhu dibaca dari input. Suhu bisa berkoma, jadi pakai `float`, bukan `int`:",
            "",
            "```python",
            "suhu = float(input())",
            "```",
            "",
            "Input langkah ini 36.5. Karena tidak demam, hanya satu baris yang tercetak.",
          ].join("\n"),
          stdin: "36.5\n",
          codeChecks: [{ pattern: "suhu\\s*=\\s*float\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca suhu dengan float(input())." }],
          hints: ["`int(\"36.5\")` akan error karena ada komanya. `float` bisa membaca angka berkoma."],
          solution: py(`
suhu = float(input())

if suhu > 37.5:
    print("Kamu demam")
    print("Istirahat dan minum air")
print("Pemeriksaan selesai")
`),
        },
        {
          title: "Satu if lagi: suhu terlalu rendah",
          instructions: [
            "Suhu di bawah 35 juga berbahaya. **Sebelum** baris `Pemeriksaan selesai`, tambahkan `if` kedua yang mencetak `Suhu terlalu rendah` kalau `suhu < 35`.",
            "",
            "Input langkah ini 34.2.",
          ].join("\n"),
          stdin: "34.2\n",
          codeChecks: [{ pattern: "^if\\s+suhu\\s*<\\s*35\\s*:", message: "Tambahkan if suhu < 35: sebagai if kedua, rata kiri." }],
          hints: ["`if` kedua ini rata kiri, sejajar dengan `if` pertama, bukan di dalamnya."],
          solution: py(`
suhu = float(input())

if suhu > 37.5:
    print("Kamu demam")
    print("Istirahat dan minum air")
if suhu < 35:
    print("Suhu terlalu rendah")
print("Pemeriksaan selesai")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Lupa titik dua",
      code: py(`
suhu = 38
if suhu > 37.5
    print("Kamu demam")
`),
      explain: "Setiap baris `if` harus diakhiri titik dua `:`. Pesan errornya menunjuk baris `if` itu.",
      fix: py(`
suhu = 38
if suhu > 37.5:
    print("Kamu demam")
`),
    },
    {
      kind: "mistake",
      title: "Lupa indentasi",
      code: py(`
suhu = 38
if suhu > 37.5:
print("Kamu demam")
`),
      explain: "Setelah titik dua, Python menunggu blok yang menjorok. Kalau baris berikutnya rata kiri, blok `if`-nya kosong, dan itu tidak boleh.",
      fix: py(`
suhu = 38
if suhu > 37.5:
    print("Kamu demam")
`),
    },
    {
      kind: "mistake",
      title: "Memakai `=` di dalam syarat",
      code: py(`
nilai = 100
if nilai = 100:
    print("Sempurna!")
`),
      explain: "Syarat harus berupa pertanyaan. `nilai = 100` adalah perintah menyimpan, jadi Python menolaknya. Python bahkan menebak maksudmu: `==`.",
      fix: py(`
nilai = 100
if nilai == 100:
    print("Sempurna!")
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Bonus poin",
      task: "Kalau `skor` lebih dari 90, cetak `Dapat bonus!` lalu tambahkan 10 ke `skor` (dua baris di dalam blok). Setelah itu, **di luar** `if`, cetak `Skor akhir:` dan nilai `skor`.",
      starterCode: py(`
skor = 95

# Tulis if-nya di sini
`) + "\n",
      solution: py(`
skor = 95
if skor > 90:
    print("Dapat bonus!")
    skor = skor + 10
print("Skor akhir:", skor)
`),
    },
    {
      kind: "try",
      title: "Peringatan baterai",
      task: "Cetak `Baterai lemah` kalau `baterai` kurang dari 20, dan cetak `Baterai penuh` kalau `baterai` sama dengan 100. Gunakan **dua `if` terpisah**. Coba ubah nilai `baterai` menjadi 15 dan 100 untuk menguji keduanya.",
      starterCode: py(`
baterai = 15

# Tulis dua if di sini
`) + "\n",
      solution: py(`
baterai = 15
if baterai < 20:
    print("Baterai lemah")
if baterai == 100:
    print("Baterai penuh")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `if syarat:` menjalankan bloknya **hanya kalau** syaratnya `True`.",
      "- Wajib: titik dua di akhir baris `if`, dan blok yang menjorok 4 spasi.",
      "- Baris yang kembali rata kiri ada di luar `if` dan **selalu** dijalankan.",
      "- Beberapa `if` berurutan diperiksa sendiri-sendiri.",
      "",
      "Berikutnya: bagaimana kalau kita juga ingin melakukan sesuatu saat syaratnya **False**? Itu tugas `else`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 3

const L3: LessonSource = {
  title: "3. if–else: Dua Jalan",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Dengan `if` saja, program hanya bisa berkata \"lakukan ini kalau benar\". Tapi banyak keputusan punya **dua jalan**: lulus **atau** remedial, genap **atau** ganjil, boleh **atau** tidak boleh.",
      "",
      "`else` artinya **\"kalau tidak\"**: blok yang dijalankan saat syarat `if` bernilai `False`.",
      "",
      "**Yang akan kamu pelajari:**",
      "- menulis `if` dan `else` berpasangan",
      "- kenapa **tepat satu** dari dua blok yang dijalankan",
      "- memeriksa bilangan genap dengan operator `%`"
    ),
    md(
      "## Bentuk `if`–`else`",
      "",
      "```python",
      "if syarat:",
      "    dijalankan kalau syarat True",
      "else:",
      "    dijalankan kalau syarat False",
      "```",
      "",
      "- `else` **tidak punya syarat**. Ia otomatis mengambil semua kasus yang tidak lolos `if`.",
      "- `else:` ditulis **sejajar** dengan `if` (rata kiri yang sama) dan juga diakhiri titik dua.",
      "- Python menjalankan **tepat satu** blok: blok `if` atau blok `else`. Tidak pernah keduanya, dan tidak pernah tidak sama sekali."
    ),
    { kind: "example", code: py(`
nilai = 68
if nilai >= 75:
    print("Lulus")
else:
    print("Remedial")
print("Nilai kamu:", nilai)
`) },
    md(
      "### Genap atau ganjil?",
      "",
      "Operator `%` memberi **sisa pembagian**. Bilangan genap habis dibagi 2, jadi sisanya 0. Maka `angka % 2 == 0` adalah pertanyaan \"apakah angka genap?\""
    ),
    { kind: "example", code: py(`
print(10 % 2)
print(7 % 2)
angka = 7
if angka % 2 == 0:
    print(angka, "genap")
else:
    print(angka, "ganjil")
`) },
    {
      kind: "trace",
      title: "Pagi atau siang?",
      code: py(`
jam = 14
if jam < 12:
    print("Selamat pagi")
else:
    print("Selamat siang")
print("Sekarang jam", jam)
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["Selamat pagi\nSekarang jam 14", "Selamat siang\nSekarang jam 14", "Selamat pagi\nSelamat siang\nSekarang jam 14", "Sekarang jam 14"],
        explanation: "14 < 12 bernilai False, jadi blok if dilewati dan blok else yang dijalankan. Tepat satu dari keduanya. Baris terakhir di luar if–else, jadi selalu jalan.",
      },
    },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Genap–ganjil dan wahana",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
angka = 8

# Tulis kodemu di bawah ini.
`) + "\n",
      steps: [
        {
          title: "Kalau genap",
          instructions: [
            "Tulis `if` yang mencetak angkanya diikuti kata `genap` kalau `angka` genap:",
            "",
            "```python",
            "if angka % 2 == 0:",
            "    print(angka, \"genap\")",
            "```",
          ].join("\n"),
          codeChecks: [{ pattern: "if\\s+angka\\s*%\\s*2\\s*==\\s*0\\s*:", message: "Periksa genap dengan if angka % 2 == 0:" }],
          solution: py(`
angka = 8

if angka % 2 == 0:
    print(angka, "genap")
`),
        },
        {
          title: "Kalau tidak: ganjil",
          instructions: "Tambahkan `else:` (sejajar dengan `if`) yang mencetak angkanya diikuti kata `ganjil`. Lalu ubah baris pertama menjadi `angka = 7` untuk mengujinya.",
          codeChecks: [{ pattern: "^else\\s*:", message: "Tambahkan else: rata kiri, sejajar dengan if." }],
          hints: ["`else` tidak diberi syarat. Tulis `else:` saja.", "Baris di bawah `else:` menjorok 4 spasi, sama seperti di bawah `if`."],
          solution: py(`
angka = 7

if angka % 2 == 0:
    print(angka, "genap")
else:
    print(angka, "ganjil")
`),
        },
        {
          title: "Angka dari input",
          instructions: "Ganti baris pertama menjadi `angka = int(input())`. Input langkah ini 15.",
          stdin: "15\n",
          codeChecks: [{ pattern: "angka\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca angka dengan int(input())." }],
          solution: py(`
angka = int(input())

if angka % 2 == 0:
    print(angka, "genap")
else:
    print(angka, "ganjil")
`),
        },
        {
          title: "Pemisah yang selalu jalan",
          instructions: "Di bawah `if`–`else`, rata kiri, cetak garis pemisah `---`. Baris ini harus tercetak apa pun angkanya. Input langkah ini 4.",
          stdin: "4\n",
          codeChecks: [{ pattern: "^print\\(\\s*\"---\"\\s*\\)", message: "Cetak \"---\" rata kiri, di luar if–else." }],
          solution: py(`
angka = int(input())

if angka % 2 == 0:
    print(angka, "genap")
else:
    print(angka, "ganjil")
print("---")
`),
        },
        {
          title: "Keputusan kedua: boleh naik wahana?",
          instructions: [
            "Di paling bawah, baca tinggi badan dan putuskan:",
            "",
            "```python",
            "tinggi = int(input())",
            "```",
            "",
            "Lalu tulis `if`–`else`: kalau `tinggi` **minimal 120**, cetak `Boleh naik`. Kalau tidak, cetak `Belum boleh naik`.",
            "",
            "Input langkah ini 4 (untuk angka) lalu 110 (untuk tinggi).",
          ].join("\n"),
          stdin: "4\n110\n",
          codeChecks: [
            { pattern: "tinggi\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca tinggi dengan int(input())." },
            { pattern: "if\\s+tinggi\\s*>=\\s*120\\s*:", message: "\"Minimal 120\" artinya tinggi >= 120." },
          ],
          hints: ["\"Minimal 120\" berarti 120 juga boleh, jadi pakai `>=`, bukan `>`."],
          solution: py(`
angka = int(input())

if angka % 2 == 0:
    print(angka, "genap")
else:
    print(angka, "ganjil")
print("---")
tinggi = int(input())
if tinggi >= 120:
    print("Boleh naik")
else:
    print("Belum boleh naik")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Memberi syarat pada `else`",
      code: py(`
nilai = 60
if nilai >= 75:
    print("Lulus")
else nilai < 75:
    print("Remedial")
`),
      explain: "`else` tidak pernah punya syarat: ia sudah otomatis berarti \"semua yang tidak lolos if\". Kalau kamu memang butuh syarat kedua, itu tugas `elif` (pelajaran berikutnya).",
      fix: py(`
nilai = 60
if nilai >= 75:
    print("Lulus")
else:
    print("Remedial")
`),
    },
    {
      kind: "mistake",
      title: "`else` tidak sejajar dengan `if`",
      code: py(`
nilai = 60
if nilai >= 75:
    print("Lulus")
    else:
    print("Remedial")
`),
      explain: "`else` harus rata kiri yang sama dengan `if` pasangannya. Kalau menjorok, Python mengira `else` ada di dalam blok `if`, dan di sana ia tidak punya pasangan.",
      fix: py(`
nilai = 60
if nilai >= 75:
    print("Lulus")
else:
    print("Remedial")
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Ongkos kirim",
      task: "Kalau `belanja` minimal 100000, cetak `Gratis ongkir`. Kalau tidak, cetak `Ongkir 15000`. Setelah itu, di luar if–else, cetak `Terima kasih sudah belanja`.",
      starterCode: py(`
belanja = 85000

# Tulis if-else di sini
`) + "\n",
      solution: py(`
belanja = 85000
if belanja >= 100000:
    print("Gratis ongkir")
else:
    print("Ongkir 15000")
print("Terima kasih sudah belanja")
`),
    },
    {
      kind: "try",
      title: "Kelipatan 5",
      task: "Cetak `kelipatan 5` kalau `n` habis dibagi 5, dan `bukan kelipatan 5` kalau tidak. Petunjuk: pakai `%` seperti pada genap–ganjil.",
      starterCode: py(`
n = 35

# Tulis if-else di sini
`) + "\n",
      solution: py(`
n = 35
if n % 5 == 0:
    print("kelipatan 5")
else:
    print("bukan kelipatan 5")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `else:` berarti \"kalau tidak\", dijalankan saat syarat `if` bernilai `False`.",
      "- `else` **tanpa syarat**, sejajar dengan `if`, diakhiri titik dua.",
      "- Dari `if` dan `else`, **tepat satu** blok yang dijalankan.",
      "- `angka % 2 == 0` memeriksa bilangan genap.",
      "",
      "Berikutnya: kalau jalannya lebih dari dua, misalnya nilai A, B, C, D, E, kita butuh `elif`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 4

const L4: LessonSource = {
  title: "4. elif: Banyak Pilihan, Urutan Penting",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Nilai rapor bukan hanya lulus atau tidak. Ada **A, B, C, D, E**. Itu lima jalan, padahal `if`–`else` hanya dua.",
      "",
      "`elif` (singkatan *else if*) artinya **\"kalau yang sebelumnya tidak, coba syarat ini\"**. Kamu boleh menulis `elif` sebanyak yang kamu perlu.",
      "",
      "**Yang akan kamu pelajari:**",
      "- rantai `if` → `elif` → ... → `else`",
      "- Python berhenti di syarat **pertama** yang `True`",
      "- kenapa **urutan syarat** bisa membuat program salah"
    ),
    md(
      "## Bentuk rantai `elif`",
      "",
      "```python",
      "if syarat1:",
      "    ...",
      "elif syarat2:",
      "    ...",
      "elif syarat3:",
      "    ...",
      "else:",
      "    ...",
      "```",
      "",
      "Cara Python membacanya:",
      "",
      "1. Periksa `syarat1`. Kalau `True`, jalankan bloknya, lalu **lompat keluar dari seluruh rantai**.",
      "2. Kalau `False`, periksa `syarat2`. Begitu seterusnya ke bawah.",
      "3. Kalau tidak ada satu pun yang `True`, jalankan `else` (kalau ada).",
      "",
      "Jadi dari satu rantai, **paling banyak satu** blok yang dijalankan: blok dari syarat pertama yang `True`."
    ),
    { kind: "example", code: py(`
nilai = 83
if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
else:
    print("D")
`) },
    md(
      "Nilai 83 juga memenuhi `nilai >= 70`, tapi `C` tidak dicetak. Kenapa? Python sudah berhenti di `nilai >= 80` yang `True` duluan. Inilah yang membuat syarat `elif` bisa ditulis singkat: saat sampai di `elif nilai >= 80`, kita **sudah tahu** nilainya di bawah 90."
    ),
    md(
      "### Urutan itu penting",
      "",
      "Karena Python berhenti di syarat pertama yang `True`, urutan yang salah bisa membuat program menjawab salah **tanpa error apa pun**. Tebak dulu, lalu telusuri:"
    ),
    {
      kind: "trace",
      title: "Nilai 95 dapat huruf apa?",
      code: py(`
nilai = 95
if nilai >= 60:
    print("D")
elif nilai >= 90:
    print("A")
else:
    print("E")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["A", "D", "D\nA", "E"],
        explanation: "95 >= 60 sudah True di baris 2, jadi Python mencetak D dan berhenti. Syarat nilai >= 90 tidak pernah diperiksa. Programnya tidak error, tapi jawabannya salah.",
      },
    },
    md(
      "**Aturan praktis:** kalau syarat-syaratnya berupa batas angka dengan `>=`, mulailah dari **batas tertinggi** ke yang terendah. Kalau memakai `<`, mulailah dari yang terendah."
    ),
    md(
      "### `elif` atau beberapa `if`?",
      "",
      "Beberapa `if` terpisah diperiksa **semuanya**. Rantai `elif` berhenti di yang pertama. Bandingkan:"
    ),
    { kind: "example", lead: "Dengan `if` terpisah, nilai 95 mencetak tiga baris:", code: py(`
nilai = 95
if nilai >= 90:
    print("A")
if nilai >= 80:
    print("B")
if nilai >= 70:
    print("C")
`) },
    { kind: "example", lead: "Dengan `elif`, hanya satu:", code: py(`
nilai = 95
if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
`) },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Nilai jadi huruf",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
nilai = 85

# Tulis kodemu di bawah ini.
`) + "\n",
      steps: [
        {
          title: "Dua pilihan pertama: A dan B",
          instructions: [
            "Tulis `if` untuk A (minimal 90), lalu `elif` untuk B (minimal 80):",
            "",
            "```python",
            "if nilai >= 90:",
            "    print(\"A\")",
            "elif nilai >= 80:",
            "    print(\"B\")",
            "```",
          ].join("\n"),
          codeChecks: [{ pattern: "^elif\\s+nilai\\s*>=\\s*80\\s*:", message: "Tambahkan elif nilai >= 80: di bawah blok if." }],
          solution: py(`
nilai = 85

if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
`),
        },
        {
          title: "Lengkapi sampai E",
          instructions: [
            "Tambahkan tiga cabang lagi, berurutan:",
            "",
            "- `elif` minimal 70 → `C`",
            "- `elif` minimal 60 → `D`",
            "- `else` → `E`",
            "",
            "Lalu ubah baris pertama menjadi `nilai = 63` untuk mengujinya.",
          ].join("\n"),
          codeChecks: [
            { pattern: "elif\\s+nilai\\s*>=\\s*70\\s*:", message: "Tambahkan elif nilai >= 70: untuk C." },
            { pattern: "elif\\s+nilai\\s*>=\\s*60\\s*:", message: "Tambahkan elif nilai >= 60: untuk D." },
            { pattern: "^else\\s*:", message: "Akhiri rantai dengan else: untuk E." },
          ],
          hints: ["Semua `elif` dan `else` ditulis rata kiri, sejajar dengan `if`.", "`else` ada di paling akhir dan tanpa syarat."],
          solution: py(`
nilai = 63

if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
elif nilai >= 60:
    print("D")
else:
    print("E")
`),
        },
        {
          title: "Nilai dari input",
          instructions: "Ganti baris pertama menjadi `nilai = int(input())`. Input langkah ini tepat 90, nilai di batas. Pastikan hasilnya `A`.",
          stdin: "90\n",
          codeChecks: [{ pattern: "nilai\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca nilai dengan int(input())." }],
          solution: py(`
nilai = int(input())

if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
elif nilai >= 60:
    print("D")
else:
    print("E")
`),
        },
        {
          title: "Tolak nilai di atas 100",
          instructions: [
            "Kalau ada yang mengetik 105, programmu sekarang mencetak `A`. Padahal nilai maksimal 100!",
            "",
            "Tambahkan pemeriksaan **paling atas**: `if nilai > 100:` yang mencetak `Nilai tidak valid`. Lalu `if nilai >= 90:` yang lama **diubah menjadi `elif`**, karena sekarang ia bukan syarat pertama lagi.",
            "",
            "Input langkah ini 105.",
          ].join("\n"),
          stdin: "105\n",
          codeChecks: [
            { pattern: "^if\\s+nilai\\s*>\\s*100\\s*:", message: "Rantai harus dimulai dengan if nilai > 100:" },
            { pattern: "^elif\\s+nilai\\s*>=\\s*90\\s*:", message: "Ubah if nilai >= 90: menjadi elif nilai >= 90:" },
          ],
          hints: ["Kenapa harus paling atas? Karena 105 juga lolos `nilai >= 90`. Siapa yang diperiksa duluan, dialah yang menang.", "Satu rantai hanya punya satu `if`, di paling atas. Sisanya `elif`."],
          solution: py(`
nilai = int(input())

if nilai > 100:
    print("Nilai tidak valid")
elif nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
elif nilai >= 60:
    print("D")
else:
    print("E")
`),
        },
        {
          title: "Tolak nilai negatif",
          instructions: [
            "Nilai -5 sekarang masuk ke `else` dan mendapat `E`. Tambahkan `elif nilai < 0:` yang juga mencetak `Nilai tidak valid`, **tepat di bawah** cabang `nilai > 100`.",
            "",
            "Input langkah ini -5.",
          ].join("\n"),
          stdin: "-5\n",
          codeChecks: [{ pattern: "^elif\\s+nilai\\s*<\\s*0\\s*:", message: "Tambahkan elif nilai < 0: sebagai cabang kedua." }],
          hints: ["Kalau kamu menaruhnya di paling bawah (sebelum `else`), apakah masih berhasil? Coba pikirkan: -5 lolos syarat mana saja di atasnya?"],
          solution: py(`
nilai = int(input())

if nilai > 100:
    print("Nilai tidak valid")
elif nilai < 0:
    print("Nilai tidak valid")
elif nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
elif nilai >= 60:
    print("D")
else:
    print("E")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Urutan terbalik: tidak ada error, tapi jawabannya salah",
      code: py(`
nilai = 92
if nilai >= 70:
    print("C")
elif nilai >= 80:
    print("B")
elif nilai >= 90:
    print("A")
`),
      explain: "Nilai 92 seharusnya A, tapi yang tercetak C, karena `nilai >= 70` diperiksa duluan dan sudah `True`. Kesalahan seperti ini paling berbahaya karena Python tidak memberi peringatan apa pun. Urutkan dari batas tertinggi.",
      fix: py(`
nilai = 92
if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
elif nilai >= 70:
    print("C")
`),
    },
    {
      kind: "mistake",
      title: "`elif` setelah `else`",
      code: py(`
nilai = 75
if nilai >= 90:
    print("A")
else:
    print("Bukan A")
elif nilai >= 80:
    print("B")
`),
      explain: "`else` selalu menjadi **penutup** rantai. Setelah `else`, tidak boleh ada `elif` lagi.",
      fix: py(`
nilai = 75
if nilai >= 90:
    print("A")
elif nilai >= 80:
    print("B")
else:
    print("Di bawah B")
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Kategori umur",
      task: "Cetak kategori untuk `umur`: di bawah 6 → `Balita`, di bawah 13 → `Anak`, di bawah 18 → `Remaja`, selain itu → `Dewasa`. Karena memakai `<`, mulailah dari batas **terendah**.",
      starterCode: py(`
umur = 14

# Tulis rantai if-elif-else di sini
`) + "\n",
      solution: py(`
umur = 14
if umur < 6:
    print("Balita")
elif umur < 13:
    print("Anak")
elif umur < 18:
    print("Remaja")
else:
    print("Dewasa")
`),
    },
    {
      kind: "try",
      title: "Indeks cuaca",
      task: "Cetak saran berdasarkan `suhu`: 35 ke atas → `Sangat panas, minum banyak air`, 28 ke atas → `Panas`, 20 ke atas → `Sejuk`, selain itu → `Dingin, pakai jaket`.",
      starterCode: py(`
suhu = 30

# Tulis rantai if-elif-else di sini
`) + "\n",
      solution: py(`
suhu = 30
if suhu >= 35:
    print("Sangat panas, minum banyak air")
elif suhu >= 28:
    print("Panas")
elif suhu >= 20:
    print("Sejuk")
else:
    print("Dingin, pakai jaket")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `elif` menambah pilihan: \"kalau yang sebelumnya tidak, coba syarat ini\".",
      "- Rantai selalu dimulai satu `if`, boleh banyak `elif`, dan paling banyak satu `else` di akhir.",
      "- Python berhenti di syarat **pertama** yang `True`. Paling banyak satu blok yang dijalankan.",
      "- **Urutan penting.** Dengan `>=`, mulai dari batas tertinggi. Urutan yang salah tidak memunculkan error, hanya jawaban yang salah.",
      "",
      "Berikutnya: bagaimana kalau satu syarat butuh dua hal sekaligus, misalnya umur di antara 13 dan 17? Itu tugas `and`, `or` dan `not`."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 5

const L5: LessonSource = {
  title: "5. and, or, not: Menggabungkan Syarat",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Kadang satu perbandingan tidak cukup:",
      "",
      "- Remaja adalah umur **minimal 13 dan maksimal 17**. Itu dua syarat yang harus benar **bersamaan**.",
      "- Diskon diberikan untuk pelajar **atau** pemegang kartu member. Cukup **salah satu**.",
      "- Pesan \"daftar member, yuk\" muncul kalau **tidak** punya kartu.",
      "",
      "**Yang akan kamu pelajari:**",
      "- `and`: semua syarat harus `True`",
      "- `or`: cukup satu syarat yang `True`",
      "- `not`: membalik `True` menjadi `False` dan sebaliknya"
    ),
    md(
      "## `and`: dua-duanya harus benar",
      "",
      "| A | B | A `and` B |",
      "|---|---|---|",
      "| True | True | **True** |",
      "| True | False | False |",
      "| False | True | False |",
      "| False | False | False |",
      "",
      "`and` hanya `True` kalau **semua** bagiannya `True`."
    ),
    { kind: "example", code: py(`
umur = 15
print(umur >= 13 and umur <= 17)
umur = 20
print(umur >= 13 and umur <= 17)
`) },
    md(
      "Python juga membolehkan bentuk singkat yang mirip matematika: `13 <= umur <= 17` artinya sama persis dengan `umur >= 13 and umur <= 17`."
    ),
    md(
      "## `or`: cukup salah satu",
      "",
      "| A | B | A `or` B |",
      "|---|---|---|",
      "| True | True | True |",
      "| True | False | True |",
      "| False | True | True |",
      "| False | False | **False** |",
      "",
      "`or` hanya `False` kalau **semua** bagiannya `False`."
    ),
    { kind: "example", code: py(`
hari = "Minggu"
if hari == "Sabtu" or hari == "Minggu":
    print("Akhir pekan!")
`) },
    md(
      "## `not`: membalik jawaban",
      "",
      "`not True` adalah `False`, dan `not False` adalah `True`. Ini paling enak dipakai dengan variabel `bool`, karena kodenya terbaca seperti kalimat biasa."
    ),
    { kind: "example", code: py(`
sudah_bayar = False
if not sudah_bayar:
    print("Silakan bayar dulu")
`) },
    {
      kind: "trace",
      title: "Berangkat atau tunggu?",
      code: py(`
hujan = True
punya_payung = False
if hujan and not punya_payung:
    print("Tunggu hujan reda")
else:
    print("Berangkat!")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["Berangkat!", "Tunggu hujan reda", "Tunggu hujan reda\nBerangkat!", "(tidak ada output)"],
        explanation: "not punya_payung adalah not False, yaitu True. hujan juga True. True and True adalah True, jadi blok if yang dijalankan.",
      },
      notes: { 3: "hujan → True, not punya_payung → not False → True. Cek: True and True → True — blok di bawahnya dijalankan." },
    },
    md("## Latihan terpandu"),
    {
      kind: "guided",
      title: "Kasir bioskop mini",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
umur = 15
punya_kartu = True

# Tulis kodemu di bawah ini.
`) + "\n",
      steps: [
        {
          title: "Remaja: and",
          instructions: "Tulis `if` yang mencetak `Remaja` kalau `umur` **minimal 13 dan maksimal 17**. Pakai `and` untuk menggabungkan dua perbandingan.",
          codeChecks: [{ pattern: "if\\s+umur\\s*>=\\s*13\\s+and\\s+umur\\s*<=\\s*17\\s*:", message: "Gabungkan umur >= 13 and umur <= 17." }],
          hints: ["Tiap sisi `and` harus perbandingan lengkap: `umur >= 13 and umur <= 17`, bukan `umur >= 13 and <= 17`."],
          solution: py(`
umur = 15
punya_kartu = True

if umur >= 13 and umur <= 17:
    print("Remaja")
`),
        },
        {
          title: "Diskon: or",
          instructions: "Tambahkan `if` kedua (terpisah) yang mencetak `Dapat diskon` kalau `umur` di bawah 18 **atau** `punya_kartu` bernilai `True`.",
          codeChecks: [{ pattern: "if\\s+umur\\s*<\\s*18\\s+or\\s+punya_kartu", message: "Tulis if umur < 18 or punya_kartu:" }],
          hints: ["`punya_kartu` sudah berisi `True` atau `False`, jadi tidak perlu ditulis `punya_kartu == True`. Cukup `punya_kartu`."],
          solution: py(`
umur = 15
punya_kartu = True

if umur >= 13 and umur <= 17:
    print("Remaja")
if umur < 18 or punya_kartu:
    print("Dapat diskon")
`),
        },
        {
          title: "Ajak daftar member: not",
          instructions: [
            "Tambahkan `if` ketiga: kalau **tidak** punya kartu, cetak `Daftar kartu member, yuk!`. Pakai `not`.",
            "",
            "Lalu uji dengan mengubah dua baris pertama menjadi `umur = 20` dan `punya_kartu = False`.",
          ].join("\n"),
          codeChecks: [{ pattern: "if\\s+not\\s+punya_kartu\\s*:", message: "Tulis if not punya_kartu:" }],
          solution: py(`
umur = 20
punya_kartu = False

if umur >= 13 and umur <= 17:
    print("Remaja")
if umur < 18 or punya_kartu:
    print("Dapat diskon")
if not punya_kartu:
    print("Daftar kartu member, yuk!")
`),
        },
        {
          title: "Dari input",
          instructions: [
            "Sekarang baca keduanya dari input. Umur berupa angka. Untuk kartu, pengguna mengetik `ya` atau `tidak`, dan perbandingan `== \"ya\"` mengubahnya menjadi `True` atau `False`:",
            "",
            "```python",
            "umur = int(input())",
            "punya_kartu = input() == \"ya\"",
            "```",
            "",
            "Input langkah ini 16 lalu `ya`.",
          ].join("\n"),
          stdin: "16\nya\n",
          codeChecks: [{ pattern: "punya_kartu\\s*=\\s*input\\(\\s*\\)\\s*==\\s*\"ya\"", message: "Tulis punya_kartu = input() == \"ya\"" }],
          hints: ["`input() == \"ya\"` adalah perbandingan, jadi hasilnya `True` kalau yang diketik `ya`, dan `False` untuk yang lain."],
          solution: py(`
umur = int(input())
punya_kartu = input() == "ya"

if umur >= 13 and umur <= 17:
    print("Remaja")
if umur < 18 or punya_kartu:
    print("Dapat diskon")
if not punya_kartu:
    print("Daftar kartu member, yuk!")
`),
        },
        {
          title: "Jam buka",
          instructions: [
            "Bioskop buka dari jam 9 sampai sebelum jam 21. Di paling bawah, baca `jam = int(input())`, lalu tulis `if`–`else`: kalau `jam` minimal 9 **dan** kurang dari 21, cetak `Bioskop buka`, kalau tidak, `Bioskop tutup`.",
            "",
            "Input langkah ini 16, `tidak`, lalu 22.",
          ].join("\n"),
          stdin: "16\ntidak\n22\n",
          codeChecks: [{ pattern: "jam\\s*>=\\s*9\\s+and\\s+jam\\s*<\\s*21|9\\s*<=\\s*jam\\s*<\\s*21", message: "Syarat buka: jam >= 9 and jam < 21." }],
          solution: py(`
umur = int(input())
punya_kartu = input() == "ya"

if umur >= 13 and umur <= 17:
    print("Remaja")
if umur < 18 or punya_kartu:
    print("Dapat diskon")
if not punya_kartu:
    print("Daftar kartu member, yuk!")
jam = int(input())
if jam >= 9 and jam < 21:
    print("Bioskop buka")
else:
    print("Bioskop tutup")
`),
        },
      ],
    },
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Sisi kedua `and` tidak lengkap",
      code: py(`
umur = 15
if umur >= 13 and <= 17:
    print("Remaja")
`),
      explain: "Dalam bahasa sehari-hari kita bilang \"minimal 13 dan maksimal 17\", tapi Python butuh **perbandingan lengkap** di kedua sisi `and`. Ulangi nama variabelnya, atau pakai bentuk singkat `13 <= umur <= 17`.",
      fix: py(`
umur = 15
if umur >= 13 and umur <= 17:
    print("Remaja")
`),
    },
    {
      kind: "mistake",
      title: "`or` dengan sisi yang tidak lengkap: tidak error, tapi selalu True",
      code: py(`
hari = "Senin"
if hari == "Sabtu" or "Minggu":
    print("Akhir pekan!")
`),
      explain: "Hari Senin malah dianggap akhir pekan! Python membacanya sebagai `(hari == \"Sabtu\") or (\"Minggu\")`. Teks yang tidak kosong seperti `\"Minggu\"` dianggap `True`, jadi syaratnya **selalu** benar. Tulis perbandingan lengkap di kedua sisi.",
      fix: py(`
hari = "Senin"
if hari == "Sabtu" or hari == "Minggu":
    print("Akhir pekan!")
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Boleh ikut lomba?",
      task: "Siswa boleh ikut lomba kalau `kelas` antara 7 dan 9 (termasuk 7 dan 9) **dan** `nilai` minimal 80. Cetak `Boleh ikut` atau `Belum boleh ikut`.",
      starterCode: py(`
kelas = 8
nilai = 85

# Tulis if-else dengan and di sini
`) + "\n",
      solution: py(`
kelas = 8
nilai = 85
if kelas >= 7 and kelas <= 9 and nilai >= 80:
    print("Boleh ikut")
else:
    print("Belum boleh ikut")
`),
    },
    {
      kind: "try",
      title: "Hari libur",
      task: "Cetak `Libur` kalau `hari` adalah `\"Sabtu\"` atau `\"Minggu\"`, **atau** `tanggal_merah` bernilai `True`. Selain itu cetak `Masuk sekolah`.",
      starterCode: py(`
hari = "Rabu"
tanggal_merah = True

# Tulis if-else dengan or di sini
`) + "\n",
      solution: py(`
hari = "Rabu"
tanggal_merah = True
if hari == "Sabtu" or hari == "Minggu" or tanggal_merah:
    print("Libur")
else:
    print("Masuk sekolah")
`),
    },
    md(
      "## Ringkasan",
      "",
      "- `and` → `True` hanya kalau **semua** syarat `True`.",
      "- `or` → `True` kalau **minimal satu** syarat `True`.",
      "- `not` → membalik `True`/`False`.",
      "- Tulis **perbandingan lengkap** di setiap sisi: `hari == \"Sabtu\" or hari == \"Minggu\"`.",
      "- Bentuk singkat rentang: `13 <= umur <= 17`.",
      "",
      "Berikutnya: menaruh `if` di dalam `if` untuk keputusan bertingkat, dan menggabungkan semuanya dalam satu program."
    ),
  ],
};

// ───────────────────────────────────────────────────────────── Lesson 6

const L6: LessonSource = {
  title: "6. if Bersarang dan Studi Kasus: Tiket Bioskop",
  blocks: [
    md(
      "## Kenapa perlu?",
      "",
      "Beberapa keputusan bertingkat: **pertama** tentukan satu hal, **baru setelah itu** tentukan hal berikutnya. Contohnya: boleh naik motor? Pertama, apakah sudah cukup umur? Kalau sudah, **baru** periksa: pakai helm atau belum?",
      "",
      "Untuk itu, kita menaruh `if` **di dalam** blok `if` lain. Ini disebut **if bersarang** (*nested if*).",
      "",
      "**Yang akan kamu pelajari:**",
      "- menulis `if` di dalam `if`, dan membaca indentasinya",
      "- kapan memakai `if` bersarang, kapan cukup `and`",
      "- menyusun satu program utuh dari semua yang sudah dipelajari"
    ),
    md(
      "## Indentasi bertingkat",
      "",
      "Blok di dalam blok menjorok **dua kali** (8 spasi). Setiap tingkat indentasi menunjukkan baris itu milik `if` yang mana.",
      "",
      "```python",
      "if syarat_luar:",
      "    if syarat_dalam:",
      "        dijalankan kalau DUA-DUANYA True",
      "    else:",
      "        dijalankan kalau luar True, dalam False",
      "else:",
      "    dijalankan kalau luar False (syarat dalam tidak pernah diperiksa)",
      "```"
    ),
    {
      kind: "trace",
      title: "Boleh naik motor?",
      code: py(`
umur = 18
pakai_helm = False
if umur >= 17:
    if pakai_helm:
        print("Boleh berangkat")
    else:
        print("Pakai helm dulu!")
else:
    print("Belum cukup umur")
print("Hati-hati di jalan")
`),
      predict: {
        question: "Apa yang dicetak program ini?",
        options: ["Boleh berangkat\nHati-hati di jalan", "Pakai helm dulu!\nHati-hati di jalan", "Belum cukup umur\nHati-hati di jalan", "Pakai helm dulu!"],
        explanation: "18 >= 17 True, jadi Python masuk ke blok luar. Di dalamnya, pakai_helm False, jadi else bagian dalam yang dijalankan. Baris terakhir rata kiri, selalu jalan.",
      },
    },
    md(
      "### Bersarang atau `and`?",
      "",
      "Kalau hanya ada **satu** hasil yang menarik, `and` biasanya lebih rapi:"
    ),
    { kind: "example", code: py(`
umur = 18
pakai_helm = True
if umur >= 17 and pakai_helm:
    print("Boleh berangkat")
`) },
    md(
      "Tapi kalau setiap kemungkinan butuh **pesan yang berbeda** (belum cukup umur? lupa helm?), `if` bersarang membuat tiap kasus jelas terpisah. Pilih yang paling mudah dibaca."
    ),
    md(
      "## Studi kasus: harga tiket bioskop",
      "",
      "Aturan bioskop *Layar Kita*:",
      "",
      "| Siapa | Hari biasa | Sabtu–Minggu |",
      "|---|---|---|",
      "| Anak (di bawah 12) | 30000 | 30000 |",
      "| Lainnya | 50000 | 60000 |",
      "",
      "Member mendapat potongan 10000. Umur di luar 0–120 ditolak.",
      "",
      "Perhatikan: untuk anak, harinya **tidak penting**. Hari baru perlu diperiksa **setelah** kita tahu dia bukan anak. Itulah tanda yang tepat untuk `if` bersarang. Bangun programnya langkah demi langkah:"
    ),
    {
      kind: "guided",
      title: "Mesin tiket Layar Kita",
      intro: GUIDED_TAIL + "\n\n" + INPUT_NOTE,
      starterCode: py(`
umur = 10
hari = "Sabtu"

# Tulis kodemu di bawah ini.
`) + "\n",
      steps: [
        {
          title: "Anak atau bukan",
          instructions: [
            "Tentukan `harga`: kalau `umur` di bawah 12, `harga = 30000`. Kalau tidak, `harga = 50000`. Lalu, di luar if–else, cetak hasilnya:",
            "",
            "```python",
            "print(\"Harga tiket:\", harga)",
            "```",
          ].join("\n"),
          codeChecks: [
            { pattern: "if\\s+umur\\s*<\\s*12\\s*:", message: "Mulai dengan if umur < 12:" },
            { pattern: "^print\\(\\s*\"Harga tiket:\"\\s*,\\s*harga\\s*\\)", message: "Cetak print(\"Harga tiket:\", harga) rata kiri, setelah if–else." },
          ],
          hints: ["Di dalam blok, simpan harganya ke variabel (`harga = 30000`), jangan langsung dicetak. Pencetakannya cukup sekali di bawah."],
          solution: py(`
umur = 10
hari = "Sabtu"

if umur < 12:
    harga = 30000
else:
    harga = 50000
print("Harga tiket:", harga)
`),
        },
        {
          title: "Akhir pekan lebih mahal: if di dalam else",
          instructions: [
            "Untuk yang bukan anak, harganya tergantung hari. Ganti isi blok `else` dengan `if`–`else` di dalamnya:",
            "",
            "```python",
            "else:",
            "    if hari == \"Sabtu\" or hari == \"Minggu\":",
            "        harga = 60000",
            "    else:",
            "        harga = 50000",
            "```",
            "",
            "Lalu ubah `umur = 10` menjadi `umur = 20` untuk mengujinya (harinya tetap Sabtu).",
          ].join("\n"),
          codeChecks: [
            { pattern: "^\\s+if\\s+hari\\s*==\\s*\"Sabtu\"\\s+or\\s+hari\\s*==\\s*\"Minggu\"\\s*:", message: "Di dalam else, tulis if hari == \"Sabtu\" or hari == \"Minggu\":" },
            { pattern: "^\\s{8}harga\\s*=\\s*60000", message: "harga = 60000 ada di tingkat kedua, menjorok 8 spasi." },
          ],
          hints: ["Hitung spasinya: `if hari ...` menjorok 4 spasi (ia di dalam `else` luar), dan `harga = 60000` menjorok 8 spasi.", "Kedua sisi `or` harus lengkap: `hari == \"Sabtu\" or hari == \"Minggu\"`."],
          solution: py(`
umur = 20
hari = "Sabtu"

if umur < 12:
    harga = 30000
else:
    if hari == "Sabtu" or hari == "Minggu":
        harga = 60000
    else:
        harga = 50000
print("Harga tiket:", harga)
`),
        },
        {
          title: "Pembeli mengetik datanya",
          instructions: "Ganti dua baris pertama menjadi `umur = int(input())` dan `hari = input()`. Input langkah ini 25 lalu `Selasa`.",
          stdin: "25\nSelasa\n",
          codeChecks: [
            { pattern: "umur\\s*=\\s*int\\(\\s*input\\(\\s*\\)\\s*\\)", message: "Baca umur dengan int(input())." },
            { pattern: "hari\\s*=\\s*input\\(\\s*\\)", message: "Baca hari dengan input() (tanpa int, karena hari berupa teks)." },
          ],
          solution: py(`
umur = int(input())
hari = input()

if umur < 12:
    harga = 30000
else:
    if hari == "Sabtu" or hari == "Minggu":
        harga = 60000
    else:
        harga = 50000
print("Harga tiket:", harga)
`),
        },
        {
          title: "Potongan member",
          instructions: [
            "Baca satu input lagi, tepat di bawah `hari = input()`:",
            "",
            "```python",
            "member = input() == \"ya\"",
            "```",
            "",
            "Lalu **setelah** if–else harga dan **sebelum** `print`, tambahkan `if member:` yang mengurangi harga 10000 (`harga = harga - 10000`).",
            "",
            "Input langkah ini 25, `Minggu`, `ya`.",
          ].join("\n"),
          stdin: "25\nMinggu\nya\n",
          codeChecks: [
            { pattern: "member\\s*=\\s*input\\(\\s*\\)\\s*==\\s*\"ya\"", message: "Baca member = input() == \"ya\"" },
            { pattern: "^if\\s+member\\s*:", message: "Tambahkan if member: rata kiri, setelah if–else harga." },
            { pattern: "harga\\s*=\\s*harga\\s*-\\s*10000|harga\\s*-=\\s*10000", message: "Kurangi harga dengan 10000." },
          ],
          hints: ["Potongan dihitung **setelah** harga dasarnya diketahui. Makanya `if member:` ditaruh di bawah if–else harga.", "`if member:` rata kiri, karena potongan berlaku untuk semua orang, anak maupun dewasa."],
          solution: py(`
umur = int(input())
hari = input()
member = input() == "ya"

if umur < 12:
    harga = 30000
else:
    if hari == "Sabtu" or hari == "Minggu":
        harga = 60000
    else:
        harga = 50000
if member:
    harga = harga - 10000
print("Harga tiket:", harga)
`),
        },
        {
          title: "Tolak umur yang tidak masuk akal",
          instructions: [
            "Kalau umurnya di bawah 0 atau di atas 120, mesin harus mencetak `Umur tidak valid` **dan tidak mencetak harga**.",
            "",
            "Bungkus seluruh perhitungan harga dengan `if`–`else` baru. Tepat setelah tiga baris `input`, tulis:",
            "",
            "```python",
            "if umur < 0 or umur > 120:",
            "    print(\"Umur tidak valid\")",
            "else:",
            "```",
            "",
            "Lalu **geser semua baris di bawahnya 4 spasi ke kanan**, supaya masuk ke blok `else` ini. (Pilih semua barisnya, lalu tekan Tab.)",
            "",
            "Input langkah ini -3, `Senin`, `tidak`.",
          ].join("\n"),
          stdin: "-3\nSenin\ntidak\n",
          codeChecks: [
            { pattern: "^if\\s+umur\\s*<\\s*0\\s+or\\s+umur\\s*>\\s*120\\s*:", message: "Tulis if umur < 0 or umur > 120: rata kiri, setelah baris input." },
            { pattern: "^\\s{4}print\\(\\s*\"Harga tiket:\"", message: "print(\"Harga tiket:\", harga) sekarang ada di dalam else, menjorok 4 spasi." },
          ],
          hints: [
            "Kalau `print(\"Harga tiket:\", harga)` masih rata kiri, ia akan tetap jalan untuk umur -3, padahal `harga` belum pernah dibuat. Hasilnya `NameError`.",
            "Setelah digeser, `if umur < 12:` menjorok 4 spasi, `harga = 30000` menjorok 8 spasi, dan `harga = 60000` menjorok 12 spasi.",
          ],
          solution: py(`
umur = int(input())
hari = input()
member = input() == "ya"

if umur < 0 or umur > 120:
    print("Umur tidak valid")
else:
    if umur < 12:
        harga = 30000
    else:
        if hari == "Sabtu" or hari == "Minggu":
            harga = 60000
        else:
            harga = 50000
    if member:
        harga = harga - 10000
    print("Harga tiket:", harga)
`),
        },
      ],
    },
    md(
      "Selamat, kamu baru saja menulis program yang memakai **semua** yang ada di bab ini: perbandingan, `if`, `else`, `or`, `if` bersarang, dan `input()`. Coba jalankan dengan input lain (misalnya `8`, `Minggu`, `ya`) dan tebak dulu hasilnya sebelum menekan Jalankan."
    ),
    md("## ⚠️ Kesalahan yang sering terjadi"),
    {
      kind: "mistake",
      title: "Variabel yang hanya dibuat di satu cabang",
      code: py(`
umur = 25
if umur < 12:
    harga = 30000
print("Harga tiket:", harga)
`),
      explain: "`harga` hanya dibuat kalau `umur < 12`. Untuk umur 25, baris itu dilewati, jadi saat `print` dijalankan variabel `harga` belum ada. Pastikan **setiap** jalan yang sampai ke `print` sudah membuat variabelnya, misalnya dengan `else`.",
      fix: py(`
umur = 25
if umur < 12:
    harga = 30000
else:
    harga = 50000
print("Harga tiket:", harga)
`),
    },
    {
      kind: "mistake",
      title: "`else` menempel ke `if` yang salah",
      code: py(`
umur = 10
pakai_helm = True
if umur >= 17:
    if pakai_helm:
        print("Boleh berangkat")
else:
    print("Pakai helm dulu!")
`),
      explain: "Maksudnya \"pakai helm dulu\" untuk yang lupa helm, tapi `else` ini rata kiri, jadi ia pasangan `if umur >= 17`. Akibatnya anak 10 tahun malah disuruh pakai helm. Di Python, indentasi menentukan `else` itu milik `if` yang mana.",
      fix: py(`
umur = 10
pakai_helm = True
if umur >= 17:
    if pakai_helm:
        print("Boleh berangkat")
    else:
        print("Pakai helm dulu!")
else:
    print("Belum cukup umur")
`),
    },
    md("## Coba sendiri"),
    {
      kind: "try",
      title: "Paket internet",
      task: [
        "Tentukan harga paket:",
        "",
        "- kalau `pelajar` bernilai `True`: kuota di atas 10 GB → `40000`, selain itu → `25000`",
        "- kalau bukan pelajar: kuota di atas 10 GB → `60000`, selain itu → `35000`",
        "",
        "Simpan di variabel `harga`, lalu cetak `Harga paket:` dan harganya. Pakai `if` bersarang.",
      ].join("\n"),
      starterCode: py(`
pelajar = True
kuota = 15

# Tulis if bersarang di sini
`) + "\n",
      solution: py(`
pelajar = True
kuota = 15
if pelajar:
    if kuota > 10:
        harga = 40000
    else:
        harga = 25000
else:
    if kuota > 10:
        harga = 60000
    else:
        harga = 35000
print("Harga paket:", harga)
`),
    },
    {
      kind: "try",
      title: "Tantangan: tahun kabisat",
      task: [
        "Sebuah tahun adalah **kabisat** kalau habis dibagi 4, **kecuali** tahun yang habis dibagi 100. Tapi tahun yang habis dibagi 400 tetap kabisat.",
        "",
        "Contoh: 2024 kabisat, 1900 bukan, 2000 kabisat. Cetak `kabisat` atau `bukan kabisat`. Uji dengan ketiga tahun itu.",
      ].join("\n"),
      starterCode: py(`
tahun = 1900

# Tulis kodenya di sini
`) + "\n",
      solution: py(`
tahun = 1900
if tahun % 400 == 0:
    print("kabisat")
elif tahun % 100 == 0:
    print("bukan kabisat")
elif tahun % 4 == 0:
    print("kabisat")
else:
    print("bukan kabisat")
`),
    },
    md(
      "## Ringkasan bab Percabangan",
      "",
      "| Alat | Dipakai untuk |",
      "|---|---|",
      "| `==` `!=` `<` `>` `<=` `>=` | membuat pertanyaan `True`/`False` |",
      "| `if` | menjalankan blok hanya kalau benar |",
      "| `if`–`else` | dua jalan, tepat satu dijalankan |",
      "| `if`–`elif`–`else` | banyak jalan, yang pertama `True` menang, **urutan penting** |",
      "| `and` `or` `not` | menggabungkan atau membalik syarat |",
      "| `if` bersarang | keputusan bertingkat, indentasi menentukan pasangan |",
      "",
      "Kalau programmu menjawab salah tanpa error, lacak barisnya satu per satu seperti di visualisasi \"Telusuri kodenya\": syarat mana yang `True`, dan blok mana yang dijalankan?"
    ),
  ],
};

export const PYTHON_IF: Unit = { chapterTitle: CHAPTER_TITLE, lessons: [L1, L2, L3, L4, L5, L6] };
