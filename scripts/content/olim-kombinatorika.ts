/**
 * Persiapan Olimpiade Matematika (MS²C) — Bab: Kombinatorika.
 * Read by scripts/setup-olim.ts.
 *
 * Order follows Targhib's syllabus, and it also builds: counting before
 * probability (a probability is a count over a count), sets before
 * stars & bars (whose upper-bound case is inclusion–exclusion again), and
 * pigeonhole wherever it lands — it needs nothing but nerve.
 *
 * Every count here was recomputed in Python (math.comb / brute force for the
 * bounded cases) before being written down.
 */
import type { BabContent } from "./math-types";

const FRAC = "Tulis pecahan sebagai a/b, misalnya 3/10.";

export const OLIM_KOMBINATORIKA: BabContent = {
  chapterTitle: "Kombinatorika",
  pdfPrefix: "OlimKom-",
  sesi: [
    // ───────────────────────────── Sesi 1 ─────────────────────────────
    {
      title: "Sesi 1: Permutasi & Kombinasi",
      blocks: [{ type: "PDF", dir: "olim-kom-sesi1", fileName: "OlimKom-Sesi1-Permutasi-dan-Kombinasi.pdf" }],
      quiz: {
        title: "Latihan — Sesi 1: Permutasi & Kombinasi",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Ada 5 baju dan 3 celana. Berapa pasangan baju–celana yang berbeda?",
            answer: 15,
            explanation: "Aturan perkalian: $5 \\times 3 = 15$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak cara memilih juara 1, 2, dan 3 dari 8 peserta?",
            answer: 336,
            explanation: "Urutan penting: $P(8,3) = 8\\cdot7\\cdot6 = 336$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak cara memilih 3 pengurus sederajat dari 8 orang?",
            answer: 56,
            explanation: "Urutan tidak penting: $\\binom83 = 56$, yaitu $336 : 3!$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa banyak susunan huruf berbeda dari kata MATEMATIKA?",
            answer: 151200,
            explanation: "10 huruf dengan A tiga kali, M dua kali, T dua kali: $\\frac{10!}{3!\\,2!\\,2!} = 151.200$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa banyak susunan huruf berbeda dari kata OLIMPIADE?",
            answer: 90720,
            explanation: "9 huruf dengan I dua kali: $\\frac{9!}{2!} = 181.440/2 = 90.720$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa nilai $\\binom{20}{18}$?",
            answer: 190,
            explanation: "$\\binom{20}{18} = \\binom{20}{2} = \\frac{20\\cdot19}{2} = 190$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa banyak cara menyusun 6 orang mengelilingi meja bundar?",
            answer: 120,
            explanation: "Permutasi siklis: $(6-1)! = 120$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Enam orang duduk mengelilingi meja bundar. Berapa banyak susunan jika dua orang tertentu harus berdampingan?",
            answer: 48,
            explanation: "Ikat keduanya jadi satu blok: $(5-1)!\\cdot2! = 24\\cdot2 = 48$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa banyak bilangan tiga angka dengan angka-angka berbeda yang dapat disusun dari angka 1 sampai 9?",
            answer: 504,
            explanation: "$9\\cdot8\\cdot7 = 504$ — urutan penting, dan angkanya tidak boleh berulang.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Sebuah tim terdiri atas 2 putra dan 3 putri. Dari 5 putra dan 6 putri, berapa banyak tim yang dapat dibentuk?",
            answer: 200,
            explanation: "$\\binom52 \\cdot \\binom63 = 10\\cdot20 = 200$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Kapan sebuah soal berhitung memakai kombinasi, bukan permutasi?",
            options: [
              "Ketika menukar urutan tidak mengubah hasilnya",
              "Ketika bendanya identik",
              "Ketika jumlah bendanya lebih dari 5",
              "Ketika soal memakai kata “dan”",
            ],
            answer: "A",
            explanation: "Ujinya satu kalimat: kalau saya tukar urutannya, apakah hasilnya berubah? Jika tidak, itu kombinasi.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Berapa banyak susunan huruf berbeda dari kata BUKU? Tulis prosesnya — jelaskan mengapa perlu dibagi — lalu tulis hasilnya di kotak jawaban akhir.",
            answer: "12",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut ada 4 huruf dengan U muncul dua kali", marks: 2 },
              { point: "Menjelaskan bahwa menukar dua U tidak menghasilkan kata baru, sehingga dibagi $2!$", marks: 1 },
              { point: "Menghitung $\\frac{4!}{2!}$ dengan benar", marks: 1 },
            ],
            solution:
              "Kata BUKU terdiri atas 4 huruf: B, U, K, U — huruf U muncul dua kali.\n\nKalau keempat huruf dianggap berbeda, ada $4! = 24$ susunan. Namun menukar posisi kedua huruf U menghasilkan susunan yang sama persis, sehingga setiap susunan terhitung $2! = 2$ kali.\n\n$$\\frac{4!}{2!} = \\frac{24}{2} = \\mathbf{12}.$$",
            explanation: "Yang dinilai adalah alasan pembaginya, bukan hasilnya. Alasan itu yang dipakai lagi pada kata dengan banyak huruf berulang.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Jelaskan mengapa banyaknya cara menyusun $n$ orang berbeda mengelilingi meja bundar adalah $(n-1)!$, bukan $n!$. (Soal pembuktian — jelaskan, tidak ada jawaban akhir.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menyebut bahwa menyusun dalam barisan memberi $n!$", marks: 2 },
              { point: "Menjelaskan bahwa memutar susunan melingkar tidak menghasilkan susunan baru", marks: 2 },
              { point: "Menunjukkan tiap susunan terhitung tepat $n$ kali, sehingga hasilnya $n!/n$", marks: 2 },
            ],
            solution:
              "Kalau $n$ orang disusun berbaris, banyaknya susunan adalah $n!$.\n\nPada meja bundar, yang menentukan hanyalah siapa duduk di sebelah siapa — bukan kursi mana yang ditempati. Memutar seluruh susunan satu kursi menghasilkan susunan yang **sama**.\n\nUntuk setiap susunan melingkar, ada tepat $n$ pemutaran yang berbeda sebagai barisan tetapi identik sebagai lingkaran. Jadi setiap susunan melingkar terhitung $n$ kali di antara $n!$ barisan tadi:\n\n$$\\frac{n!}{n} = (n-1)!. \\qquad \\blacksquare$$",
            explanation: "Pola “hitung berlebih lalu bagi” ini sama dengan yang dipakai pada huruf berulang dan pada kombinasi.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 2 ─────────────────────────────
    {
      title: "Sesi 2: Teori Peluang",
      blocks: [{ type: "PDF", dir: "olim-kom-sesi2", fileName: "OlimKom-Sesi2-Teori-Peluang.pdf" }],
      quiz: {
        title: "Latihan — Sesi 2: Teori Peluang",
        questions: [
          {
            type: "FRACTION",
            points: 1,
            prompt: `Dua dadu dilempar. Berapa peluang jumlah mata dadunya 7? ${FRAC}`,
            answer: "1/6",
            explanation: "Ada 6 pasangan dari 36: $\\frac{6}{36} = \\frac16$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Dua dadu dilempar. Berapa peluang jumlah mata dadunya 10? ${FRAC}`,
            answer: "1/12",
            explanation: "(4,6), (5,5), (6,4) — tiga dari 36.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Tiga koin dilempar. Berapa peluang muncul paling sedikit satu gambar? ${FRAC}`,
            answer: "7/8",
            explanation: "Komplemennya “tidak ada gambar” berpeluang $\\frac18$, jadi $1 - \\frac18 = \\frac78$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Dua dadu dilempar. Berapa peluang muncul paling sedikit satu angka 6? ${FRAC}`,
            answer: "11/36",
            explanation: "Komplemennya tidak ada 6: $\\frac{25}{36}$. Jadi $1 - \\frac{25}{36} = \\frac{11}{36}$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Kantong berisi 4 bola merah dan 6 biru. Dua bola diambil satu per satu dengan pengembalian. Berapa peluang keduanya merah? ${FRAC}`,
            answer: "4/25",
            explanation: "$\\frac4{10}\\cdot\\frac4{10} = \\frac{16}{100} = \\frac4{25}$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Kantong berisi 4 bola merah dan 6 biru. Dua bola diambil tanpa pengembalian. Berapa peluang keduanya merah? ${FRAC}`,
            answer: "2/15",
            explanation: "$\\frac4{10}\\cdot\\frac39 = \\frac{12}{90} = \\frac2{15}$.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `Dari kantong berisi 4 merah dan 6 biru diambil 3 bola sekaligus. Berapa peluang terambil tepat 2 merah dan 1 biru? ${FRAC}`,
            answer: "3/10",
            explanation: "$\\frac{\\binom42\\binom61}{\\binom{10}{3}} = \\frac{36}{120} = \\frac3{10}$.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `Sebuah dadu dilempar. Berapa peluang muncul mata dadu bilangan prima? ${FRAC}`,
            answer: "1/2",
            explanation: "Prima pada dadu: 2, 3, 5 — tiga dari enam.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `Dua dadu dilempar. Berapa peluang hasil kali mata dadunya genap? ${FRAC}`,
            answer: "3/4",
            explanation: "Hasil kali ganjil hanya jika keduanya ganjil: $\\frac{9}{36}$. Jadi $1 - \\frac14 = \\frac34$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Tiga koin dilempar. Berapa peluang muncul tepat dua gambar? ${FRAC}`,
            answer: "3/8",
            explanation: "GGA, GAG, AGG — tiga dari delapan hasil.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Dua kejadian disebut saling bebas jika…",
            options: [
              "$P(A \\text{ dan } B) = P(A)\\cdot P(B)$",
              "$P(A \\text{ atau } B) = P(A) + P(B)$",
              "keduanya tidak bisa terjadi bersamaan",
              "peluang keduanya sama",
            ],
            answer: "A",
            explanation: "Yang pilihan kedua adalah saling lepas — istilah yang berbeda dan sering tertukar.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Kantong berisi 5 bola merah dan 3 bola putih. Dua bola diambil sekaligus. Tentukan peluang keduanya berwarna sama. Tulis prosesnya, lalu tulis peluangnya sebagai pecahan a/b di kotak jawaban akhir.",
            answer: "13/28",
            answerMarks: 1,
            rubric: [
              { point: "Menghitung seluruh cara pengambilan, $\\binom82 = 28$", marks: 2 },
              { point: "Menghitung kedua kasus terpisah: dua merah dan dua putih", marks: 2 },
              { point: "Menjumlahkan kasus yang saling lepas, lalu menyederhanakan", marks: 1 },
            ],
            solution:
              "Seluruh cara mengambil 2 bola dari 8:\n\n$$\\binom82 = 28.$$\n\nDua merah: $\\binom52 = 10$. Dua putih: $\\binom32 = 3$.\n\nKedua kejadian itu saling lepas, jadi peluangnya dijumlahkan:\n\n$$P = \\frac{10 + 3}{28} = \\frac{\\mathbf{13}}{\\mathbf{28}}.$$",
            explanation: "Kunci penilaiannya: menyebut bahwa kedua kasus saling lepas sebelum menjumlahkan.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Jelaskan mengapa peluang munculnya jumlah 7 pada dua dadu lebih besar daripada jumlah 10, padahal keduanya sama-sama “satu jumlah tertentu”. Tulis prosesnya, lalu tulis banyaknya pasangan yang berjumlah 7 di kotak jawaban akhir.",
            answer: "6",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut ruang sampelnya 36 pasangan yang sama mungkin", marks: 2 },
              { point: "Mendaftar pasangan untuk kedua jumlah, memperlakukan (2,5) dan (5,2) sebagai berbeda", marks: 1 },
              { point: "Menyimpulkan bahwa jumlah bukan hasil yang sama mungkin", marks: 1 },
            ],
            solution:
              "Dua dadu yang dibedakan memberi $6\\times6 = 36$ pasangan yang sama mungkin.\n\nBerjumlah 7: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ — ada $\\mathbf{6}$.\n\nBerjumlah 10: $(4,6), (5,5), (6,4)$ — ada 3.\n\nJadi $P(7) = \\frac{6}{36} = \\frac16$ sedangkan $P(10) = \\frac{3}{36} = \\frac1{12}$.\n\nSebabnya: yang sama mungkin adalah **pasangan mata dadu**, bukan **jumlahnya**. Jumlah 7 dapat terjadi lewat lebih banyak pasangan, sehingga lebih sering muncul.",
            explanation: "Kesalahan klasiknya menganggap kesebelas kemungkinan jumlah (2 sampai 12) sama mungkin.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 3 ─────────────────────────────
    {
      title: "Sesi 3: Teori Himpunan",
      blocks: [{ type: "PDF", dir: "olim-kom-sesi3", fileName: "OlimKom-Sesi3-Teori-Himpunan.pdf" }],
      quiz: {
        title: "Latihan — Sesi 3: Teori Himpunan",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak himpunan bagian dari himpunan beranggota 5?",
            answer: 32,
            explanation: "$2^5 = 32$, termasuk himpunan kosong dan himpunan itu sendiri.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dari 40 siswa, 25 suka matematika, 20 suka fisika, dan 10 suka keduanya. Berapa siswa yang tidak suka keduanya?",
            answer: 5,
            explanation: "$|M\\cup F| = 25+20-10 = 35$, jadi $40 - 35 = 5$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dari 40 siswa tersebut, berapa yang hanya suka matematika?",
            answer: 15,
            explanation: "$25 - 10 = 15$ — kurangi irisannya.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak himpunan bagian beranggota tepat 2 dari himpunan beranggota 6?",
            answer: 15,
            explanation: "$\\binom62 = 15$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $|A| = 18$, $|B| = 12$, dan $|A \\cup B| = 25$. Berapa $|A \\cap B|$?",
            answer: 5,
            explanation: "$|A\\cap B| = 18 + 12 - 25 = 5$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dengan data soal sebelumnya, berapa banyak anggota yang berada di tepat satu himpunan saja?",
            answer: 20,
            explanation: "$|A\\cup B| - |A\\cap B| = 25 - 5 = 20$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa bilangan dari 1 sampai 100 yang habis dibagi 2, 3, atau 5?",
            answer: 74,
            explanation: "$50+33+20-16-10-6+3 = 74$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa bilangan dari 1 sampai 100 yang tidak habis dibagi 2, 3, maupun 5?",
            answer: 26,
            explanation: "$100 - 74 = 26$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa banyak himpunan bagian sejati (tidak termasuk himpunan itu sendiri) dari himpunan beranggota 5?",
            answer: 31,
            explanation: "$2^5 - 1 = 31$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Pernyataan mana yang benar untuk himpunan $A = \\{1,2,3\\}$?",
            options: ["$\\{3\\} \\subseteq A$", "$\\{3\\} \\in A$", "$3 \\subseteq A$", "$\\varnothing \\in A$"],
            answer: "A",
            explanation: "$3 \\in A$ (anggota) dan $\\{3\\} \\subseteq A$ (himpunan bagian). Himpunan kosong adalah himpunan bagian, bukan anggota.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Rumus inklusi–eksklusi tiga himpunan diakhiri dengan $+|A\\cap B\\cap C|$ karena…",
            options: [
              "irisan ketiganya sempat dikurangi tiga kali setelah ditambah tiga kali",
              "irisan ketiganya tidak pernah dihitung",
              "rumusnya harus simetris",
              "irisan ketiganya selalu kosong",
            ],
            answer: "A",
            explanation: "Ditambah 3 kali lewat $|A|,|B|,|C|$, dikurangi 3 kali lewat irisan berpasangan — jadi perlu ditambah sekali lagi.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Dari 100 siswa: 60 ikut klub musik, 45 ikut klub olahraga, dan 20 ikut keduanya. Tentukan berapa siswa yang tidak ikut klub apa pun, dan berapa yang ikut tepat satu klub. Tulis prosesnya, lalu tulis banyaknya siswa yang tidak ikut klub apa pun di kotak jawaban akhir.",
            answer: "15",
            answerMarks: 1,
            rubric: [
              { point: "Memakai inklusi–eksklusi untuk $|M \\cup O| = 85$", marks: 2 },
              { point: "Menghitung yang tidak ikut apa pun sebagai $100 - 85$", marks: 2 },
              { point: "Menghitung yang ikut tepat satu klub, yaitu $85 - 20 = 65$", marks: 1 },
            ],
            solution:
              "Gabungan kedua klub:\n\n$$|M \\cup O| = 60 + 45 - 20 = 85.$$\n\nTidak ikut klub apa pun: $100 - 85 = \\mathbf{15}$ siswa.\n\nIkut tepat satu klub: hanya musik $60-20 = 40$, hanya olahraga $45-20 = 25$, jadi $40 + 25 = 65$ siswa. (Atau langsung: $85 - 20 = 65$.)",
            explanation: "Dua pertanyaan dari satu diagram. Mengisi dari irisan ke luar membuat keduanya langsung terbaca.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Jelaskan mengapa himpunan dengan $n$ anggota mempunyai tepat $2^n$ himpunan bagian. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menyadari bahwa membentuk himpunan bagian berarti memutuskan tiap anggota ikut atau tidak", marks: 2 },
              { point: "Menyebut ada 2 pilihan untuk setiap anggota, dan pilihannya saling bebas", marks: 2 },
              { point: "Memakai aturan perkalian untuk mendapat $2^n$", marks: 1 },
            ],
            solution:
              "Membentuk sebuah himpunan bagian berarti memutuskan, untuk **setiap** anggota, apakah anggota itu ikut atau tidak.\n\nUntuk satu anggota ada 2 pilihan (ikut / tidak ikut), dan keputusan untuk satu anggota tidak memengaruhi anggota lain.\n\nMenurut aturan perkalian, seluruh keputusan itu memberi\n\n$$\\underbrace{2 \\times 2 \\times \\cdots \\times 2}_{n \\text{ faktor}} = 2^n$$\n\nhimpunan bagian. Termasuk di dalamnya himpunan kosong (semua “tidak ikut”) dan himpunan itu sendiri (semua “ikut”). $\\blacksquare$",
            explanation: "Ini aturan perkalian dari Sesi 1 yang muncul lagi — menyebut kedua kasus ekstrem menunjukkan rumusnya utuh.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 4 ─────────────────────────────
    {
      title: "Sesi 4: Pigeonhole Principle",
      blocks: [{ type: "PDF", dir: "olim-kom-sesi4", fileName: "OlimKom-Sesi4-Pigeonhole-Principle.pdf" }],
      quiz: {
        title: "Latihan — Sesi 4: Pigeonhole Principle",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Sebuah laci berisi kaus kaki hitam dan putih teracak. Paling sedikit berapa kaus kaki harus diambil agar dijamin ada sepasang sewarna?",
            answer: 3,
            explanation: "Dua warna (sarang), jadi 3 kaus kaki menjamin dua sewarna.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sebuah kotak berisi bola dengan 4 warna. Paling sedikit berapa bola harus diambil agar dijamin ada 5 bola sewarna?",
            answer: 17,
            explanation: "Kasus terburuk 4 bola tiap warna, yaitu 16 bola; satu bola lagi memaksa ada warna dengan 5.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Di kelas berisi 30 siswa, paling sedikit berapa siswa yang dijamin lahir pada bulan yang sama?",
            answer: 3,
            explanation: "$\\lceil 30/12 \\rceil = 3$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Paling sedikit berapa orang diperlukan agar dijamin ada dua orang yang lahir pada bulan yang sama?",
            answer: 13,
            explanation: "12 bulan sebagai sarang, jadi orang ke-13 memaksa ada bulan yang berulang.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Paling sedikit berapa orang diperlukan agar dijamin ada tiga orang yang lahir pada bulan yang sama?",
            answer: 25,
            explanation: "Kasus terburuk 2 orang tiap bulan, yaitu 24 orang; orang ke-25 memaksa sebuah bulan berisi 3.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Paling sedikit berapa bilangan bulat harus diambil agar dijamin ada dua di antaranya yang selisihnya habis dibagi 7?",
            answer: 8,
            explanation: "Sisa modulo 7 ada 7 macam; bilangan ke-8 memaksa dua bilangan bersisa sama.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Dari himpunan $\\{1,2,\\ldots,20\\}$, paling sedikit berapa bilangan harus dipilih agar dijamin ada dua yang berjumlah 21?",
            answer: 11,
            explanation: "Pasangan berjumlah 21 ada 10: $\\{1,20\\},\\ldots,\\{10,11\\}$. Bilangan ke-11 memaksa satu pasangan lengkap.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Bentuk umum prinsip sarang merpati menyatakan bahwa dengan $N$ benda di $n$ kotak, pasti ada kotak berisi paling sedikit…",
            options: [
              "$\\lceil N/n \\rceil$ benda",
              "$\\lfloor N/n \\rfloor$ benda",
              "$N - n$ benda",
              "2 benda, berapa pun $N$",
            ],
            answer: "A",
            explanation: "Pembulatan ke atas: dengan 30 siswa dan 12 bulan, $\\lceil2{,}5\\rceil = 3$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 3,
            prompt: "Lima titik diletakkan di dalam persegi bersisi 2. Sarang yang tepat untuk membuktikan ada dua titik berjarak $\\le \\sqrt2$ adalah…",
            options: [
              "empat petak berukuran $1\\times1$",
              "dua persegi panjang $1\\times2$",
              "lima daerah sama luas",
              "lingkaran berjari-jari 1",
            ],
            answer: "A",
            explanation: "Lima titik di empat petak memaksa satu petak berisi dua, dan diagonal petak $1\\times1$ adalah $\\sqrt2$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Bagian bukti pigeonhole yang paling sering terlupa adalah…",
            options: [
              "menjelaskan apa artinya dua benda berada di sarang yang sama",
              "menyebut banyaknya sarang",
              "menyebut banyaknya merpati",
              "menyebut nama prinsipnya",
            ],
            answer: "A",
            explanation: "“Ada dua bilangan bersisa sama” belum menjawab apa pun sampai ditambahkan “sehingga selisihnya habis dibagi 7”.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Buktikan bahwa di antara sembilan bilangan bulat sembarang, pasti ada dua bilangan yang selisihnya habis dibagi 8. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menyebut sarangnya: 8 kemungkinan sisa pembagian oleh 8", marks: 2 },
              { point: "Menyebut merpatinya: 9 bilangan yang diberikan", marks: 1 },
              { point: "Menyimpulkan ada dua bilangan dengan sisa sama", marks: 1 },
              { point: "Menjelaskan mengapa selisih dua bilangan bersisa sama habis dibagi 8", marks: 2 },
            ],
            solution:
              "**Sarang.** Setiap bilangan bulat bersisa $0, 1, 2, \\ldots, 7$ jika dibagi 8 — ada 8 kemungkinan.\n\n**Merpati.** Ada 9 bilangan yang diberikan.\n\nKarena $9 > 8$, menurut prinsip sarang merpati pasti ada dua bilangan, sebut $a$ dan $b$, yang bersisa sama saat dibagi 8.\n\n**Artinya.** Tulis $a = 8p + r$ dan $b = 8q + r$ dengan sisa $r$ yang sama. Maka\n\n$$a - b = 8p - 8q = 8(p-q),$$\n\nsehingga $8 \\mid (a-b)$. $\\blacksquare$",
            explanation: "Perhatikan keempat bagiannya. Bagian terakhir — menuliskan $a$ dan $b$ dalam bentuk $8k+r$ — adalah yang membuat buktinya lengkap.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Sebuah kotak berisi bola merah, biru, dan hijau. Tentukan paling sedikit berapa bola yang harus diambil agar dijamin terdapat 4 bola dengan warna sama. Tulis prosesnya, lalu tulis jawabannya di kotak jawaban akhir.",
            answer: "10",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut kasus terburuk: 3 bola untuk setiap warna", marks: 2 },
              { point: "Menghitung $3 \\times 3 = 9$ bola tanpa ada yang berjumlah 4", marks: 1 },
              { point: "Menambahkan satu bola lagi dan menjelaskan mengapa itu memaksa", marks: 1 },
            ],
            solution:
              "Bayangkan kasus paling sial: setiap warna terambil sebanyak-banyaknya tanpa mencapai 4, yaitu 3 bola per warna.\n\nDengan 3 warna, itu berarti $3 \\times 3 = 9$ bola — dan belum ada warna yang mencapai 4.\n\nBola ke-10 pasti berwarna salah satu dari ketiganya, sehingga warna itu menjadi 4. Jadi paling sedikit $\\mathbf{10}$ bola.\n\n(Bentuk umumnya: untuk menjamin $k$ bola sewarna dari $n$ warna, diperlukan $n(k-1) + 1$ bola.)",
            explanation: "Pola soal “dijamin”: bangun kasus terburuk dulu, lalu tambah satu. Menyebut rumus umumnya menunjukkan polanya dipahami.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 5 ─────────────────────────────
    {
      title: "Sesi 5: Stars & Bars",
      blocks: [{ type: "PDF", dir: "olim-kom-sesi5", fileName: "OlimKom-Sesi5-Stars-and-Bars.pdf" }],
      quiz: {
        title: "Latihan — Sesi 5: Stars & Bars",
        questions: [
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sepuluh permen identik dibagikan kepada 3 anak, dan seorang anak boleh tidak kebagian. Ada berapa cara?",
            answer: 66,
            explanation: "$\\binom{10+3-1}{3-1} = \\binom{12}{2} = 66$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sepuluh permen identik dibagikan kepada 3 anak, setiap anak mendapat paling sedikit satu. Ada berapa cara?",
            answer: 36,
            explanation: "Bagikan 1 dulu, sisa 7 bebas: $\\binom{9}{2} = 36$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa solusi bilangan bulat tak negatif dari $a+b+c+d = 7$?",
            answer: 120,
            explanation: "$\\binom{7+4-1}{4-1} = \\binom{10}{3} = 120$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa solusi bilangan bulat positif dari $a+b+c+d = 7$?",
            answer: 20,
            explanation: "$\\binom{7-1}{4-1} = \\binom63 = 20$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Delapan bola identik dimasukkan ke dalam 4 kotak berbeda. Ada berapa cara?",
            answer: 165,
            explanation: "$\\binom{8+4-1}{3} = \\binom{11}{3} = 165$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa solusi bilangan bulat dari $x+y+z = 20$ dengan $x \\ge 2$, $y \\ge 3$, dan $z \\ge 0$?",
            answer: 136,
            explanation: "Geser: $a+b+c = 15$, jadi $\\binom{17}{2} = 136$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Dua belas permen identik dibagikan kepada 5 anak, setiap anak paling sedikit satu. Ada berapa cara?",
            answer: 330,
            explanation: "$\\binom{12-1}{5-1} = \\binom{11}{4} = 330$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa solusi bilangan bulat dari $x_1+x_2+x_3 = 15$ dengan setiap $x_i \\ge 2$?",
            answer: 55,
            explanation: "Geser masing-masing 2: $y_1+y_2+y_3 = 9$, jadi $\\binom{11}{2} = 55$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Stars and bars dipakai ketika…",
            options: [
              "bendanya identik dan kotaknya berbeda",
              "bendanya berbeda dan kotaknya berbeda",
              "bendanya identik dan kotaknya identik",
              "urutan pengambilan diperhatikan",
            ],
            answer: "A",
            explanation: "Untuk benda yang berbeda, yang berlaku aturan perkalian ($k^n$), bukan sekat.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Banyaknya solusi bulat tak negatif $x_1+\\cdots+x_k = n$ adalah…",
            options: ["$\\binom{n+k-1}{k-1}$", "$\\binom{n+k-1}{k}$", "$\\binom{n-1}{k-1}$", "$k^n$"],
            answer: "A",
            explanation: "Yang dipilih posisi $k-1$ sekat di antara $n+k-1$ tempat.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Tentukan banyaknya solusi bilangan bulat dari $x + y + z = 10$ dengan $0 \\le x, y, z \\le 6$. Tulis prosesnya, lalu tulis banyaknya solusi di kotak jawaban akhir.",
            answer: "36",
            answerMarks: 1,
            rubric: [
              { point: "Menghitung solusi tanpa batas atas, yaitu $\\binom{12}{2} = 66$", marks: 2 },
              { point: "Menghitung pelanggaran satu peubah $\\ge 7$ dengan substitusi, $3 \\times \\binom52$", marks: 2 },
              { point: "Memeriksa bahwa dua peubah tidak mungkin melanggar bersamaan", marks: 1 },
            ],
            solution:
              "**Tanpa batas atas.** $\\binom{10+3-1}{2} = \\binom{12}{2} = 66$.\n\n**Pelanggaran.** Misalkan $x \\ge 7$. Tulis $x = x' + 7$ dengan $x' \\ge 0$, sehingga $x' + y + z = 3$, yang punya $\\binom{5}{2} = 10$ solusi. Hal yang sama berlaku untuk $y$ dan $z$, jadi $3 \\times 10 = 30$ pelanggaran.\n\n**Dua sekaligus?** Jika dua peubah sama-sama $\\ge 7$, jumlahnya sudah $\\ge 14 > 10$ — mustahil, jadi tidak ada yang terhitung dua kali.\n\n$$66 - 30 = \\mathbf{36}.$$",
            explanation:
              "Langkah ketiga wajib ditulis meski hasilnya nol: kalau batas atasnya lebih longgar, pelanggaran ganda bisa terjadi dan harus ditambahkan kembali.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Jelaskan mengapa banyaknya solusi bilangan bulat **positif** dari $x_1 + x_2 + \\cdots + x_k = n$ adalah $\\binom{n-1}{k-1}$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memakai substitusi $y_i = x_i - 1$ agar syaratnya menjadi tak negatif", marks: 2 },
              { point: "Menunjukkan persamaannya menjadi $y_1+\\cdots+y_k = n-k$", marks: 2 },
              { point: "Menerapkan rumus baku dan menyederhanakan menjadi $\\binom{n-1}{k-1}$", marks: 1 },
            ],
            solution:
              "Syarat $x_i \\ge 1$ diubah menjadi syarat tak negatif dengan substitusi $y_i = x_i - 1$, sehingga $y_i \\ge 0$.\n\nMenjumlahkan semuanya:\n\n$$y_1 + y_2 + \\cdots + y_k = (x_1 - 1) + \\cdots + (x_k - 1) = n - k.$$\n\nPersamaan baru itu berbentuk baku, jadi banyaknya solusi\n\n$$\\binom{(n-k) + k - 1}{k-1} = \\binom{n-1}{k-1}.$$\n\nSetiap solusi positif yang lama berkorespondensi tepat satu dengan solusi tak negatif yang baru, jadi banyaknya sama. $\\blacksquare$",
            explanation: "Secara gambar: bagikan dulu satu bintang ke tiap bagian, lalu sebar sisanya bebas.",
          },
        ],
      },
    },
  ],
};
