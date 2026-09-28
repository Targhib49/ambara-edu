/**
 * Persiapan Olimpiade Matematika (MS²C) — Bab: Teori Bilangan.
 * Read by scripts/setup-olim.ts, which builds the course, its chapters and
 * this chapter's sessions (PDF lesson + problem set).
 *
 * Level: SMP/MTs, MS²C 2026 (Puspresnas; prelim online, final onsite at SMA
 * Wardaya). Sessions are taught in the order that builds — divisibility
 * before modulo, modulo before Diophantine — not the order the syllabus
 * lists them.
 *
 * Every numeric answer here was recomputed in Python before being written
 * down, the same rule the Kelas VII remake follows. WORKED problems carry a
 * marking scheme: the stated answer is checked automatically, the working is
 * marked by the tutor.
 */
import type { BabContent } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";

export const OLIM_TEORI_BILANGAN: BabContent = {
  chapterTitle: "Teori Bilangan",
  pdfPrefix: "OlimTB-",
  sesi: [
    // ───────────────────────────── Sesi 1 ─────────────────────────────
    {
      title: "Sesi 1: Dasar-dasar Keterbagian",
      blocks: [{ type: "PDF", dir: "olim-tb-sesi1", fileName: "OlimTB-Sesi1-Dasar-dasar-Keterbagian.pdf" }],
      quiz: {
        title: "Latihan — Sesi 1: Dasar-dasar Keterbagian",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Pernyataan mana yang benar?",
            options: ["$3 \\mid 6$", "$6 \\mid 3$", "$0 \\mid 5$", "$5 \\mid 0$ salah"],
            answer: "A",
            explanation: "$6 = 3 \\cdot 2$, jadi $3 \\mid 6$. Yang dibagi ditulis di kanan; $5 \\mid 0$ justru benar karena $0 = 5 \\cdot 0$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa sisa dari $-100$ dibagi 7? (Ingat: sisa selalu memenuhi $0 \\le r < 7$.)",
            answer: 5,
            explanation: "$-100 = (-15)\\cdot 7 + 5$, dan $0 \\le 5 < 7$. Jawaban $-2$ keliru karena sisa tidak boleh negatif.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Tentukan angka $a$ agar bilangan tiga angka $\\overline{2a5}$ habis dibagi 9.",
            answer: 2,
            explanation: "Jumlah angkanya $2 + a + 5 = 7 + a$ harus habis dibagi 9, jadi $a = 2$ ($7+2 = 9$). Tidak ada kemungkinan lain untuk $a \\le 9$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Bilangan empat angka berbentuk $\\overline{abab}$ (misalnya 7373) selalu habis dibagi bilangan prima dua angka. Bilangan prima apa itu?",
            answer: 101,
            explanation: "$\\overline{abab} = 100 \\cdot \\overline{ab} + \\overline{ab} = 101 \\cdot \\overline{ab}$, dan 101 adalah bilangan prima.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Ada berapa bilangan bulat dari 1 sampai 200 yang habis dibagi 6?",
            answer: 33,
            explanation: "$\\lfloor 200/6 \\rfloor = 33$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa bilangan bulat dari 1 sampai 200 yang habis dibagi 6 tetapi tidak habis dibagi 4?",
            answer: 17,
            explanation: "Habis dibagi 6: 33 bilangan. Habis dibagi 6 dan 4 berarti habis dibagi 12: $\\lfloor 200/12 \\rfloor = 16$. Jadi $33 - 16 = 17$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Tulis $2026 = q \\cdot 9 + r$ dengan $0 \\le r < 9$. Berapa nilai $q$? ${NEG}`,
            answer: 225,
            explanation: "$225 \\cdot 9 = 2025$, sisa 1. Jadi $q = 225$ dan $r = 1$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Diketahui $d \\mid a$ dan $d \\mid b$. Mana yang **pasti** benar?",
            options: ["$d \\mid (3a - 5b)$", "$d \\mid (a/b)$", "$d \\mid (a^b)$ saja", "$d \\mid (a + 1)$"],
            answer: "A",
            explanation: "Sifat kombinasi linear: $d \\mid a$ dan $d \\mid b$ memberi $d \\mid (ax + by)$ untuk setiap bilangan bulat $x, y$; ambil $x = 3$, $y = -5$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Mungkinkah jumlah 15 bilangan ganjil sama dengan 2026?",
            options: [
              "Tidak, karena jumlah 15 bilangan ganjil selalu ganjil",
              "Bisa, asal beberapa bilangannya negatif",
              "Bisa, asal bilangannya boleh sama",
              "Tidak, karena 2026 bukan kelipatan 15",
            ],
            answer: "A",
            explanation: "Jumlah sebanyak ganjil bilangan ganjil selalu ganjil, sedangkan 2026 genap. Paritas menutup semua kemungkinan sekaligus.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa bilangan tiga angka terbesar yang habis dibagi 11?",
            answer: 990,
            explanation: "$999 = 90\\cdot 11 + 9$, jadi kelipatan 11 terbesar di bawah 1000 adalah $90 \\cdot 11 = 990$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa bilangan bulat dari 1 sampai 500 yang habis dibagi 7 atau 11?",
            answer: 110,
            explanation:
              "Habis 7: $\\lfloor 500/7 \\rfloor = 71$. Habis 11: $\\lfloor 500/11 \\rfloor = 45$. Habis $77$: $\\lfloor 500/77 \\rfloor = 6$. Inklusi-eksklusi: $71 + 45 - 6 = 110$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Tentukan semua angka $a$ sehingga bilangan empat angka $\\overline{7a3a}$ habis dibagi 11. Tulis prosesnya, lalu tulis jawabannya di kotak jawaban akhir.",
            answer: "5",
            answerMarks: 1,
            rubric: [
              { point: "Menuliskan ciri habis dibagi 11 sebagai jumlah berselang-seling angkanya", marks: 2 },
              { point: "Menyusun bentuknya menjadi $2a - 10$ (atau setara)", marks: 1 },
              { point: "Memakai batas $0 \\le a \\le 9$ untuk menyimpulkan hanya $a = 5$ yang mungkin", marks: 1 },
            ],
            solution:
              "Untuk $\\overline{7a3a}$, jumlah berselang-seling dari belakang adalah $a - 3 + a - 7 = 2a - 10$.\n\nSyaratnya $11 \\mid (2a - 10)$. Karena $0 \\le a \\le 9$, nilai $2a - 10$ hanya berkisar dari $-10$ sampai $8$. Satu-satunya kelipatan 11 pada rentang itu adalah $0$, sehingga $2a - 10 = 0$ dan $a = 5$.\n\nPeriksa: $7535 = 11 \\cdot 685$. ✓",
            explanation: "Kunci langkahnya: pakai ciri 11, lalu batasi $a$ dengan rentang angka 0–9 — itu yang mempersempit ke satu jawaban.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Buktikan bahwa untuk **setiap** bilangan bulat $n$, hasil kali $n(n+1)(n+2)$ habis dibagi 6. (Soal pembuktian — tidak ada jawaban akhir yang diisi.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menunjukkan salah satu faktor pasti genap, sehingga hasil kalinya habis dibagi 2", marks: 2 },
              { point: "Menunjukkan salah satu faktor pasti habis dibagi 3 (memakai sisa 0, 1, 2)", marks: 2 },
              { point: "Menyimpulkan habis dibagi 6 dengan alasan $2$ dan $3$ tidak punya faktor bersama", marks: 2 },
            ],
            solution:
              "Di antara dua bilangan bulat berurutan pasti ada yang genap, jadi di antara $n$, $n+1$, $n+2$ pasti ada faktor genap. Karena itu $2 \\mid n(n+1)(n+2)$.\n\nUntuk 3: tulis sisa $n$ dibagi 3, yaitu $0$, $1$, atau $2$. Kalau sisanya 0 maka $3 \\mid n$; kalau 1 maka $3 \\mid n+2$; kalau 2 maka $3 \\mid n+1$. Ketiga kemungkinan itu menghabiskan semua kasus, jadi selalu ada faktor yang habis dibagi 3, sehingga $3 \\mid n(n+1)(n+2)$.\n\nKarena $2$ dan $3$ tidak punya faktor bersama selain 1, hasil kalinya habis dibagi $2 \\cdot 3 = 6$. $\\blacksquare$",
            explanation:
              "Pola pembuktian yang dipakai berulang kali: buktikan untuk tiap faktor prima, lalu gabungkan karena faktor-faktornya saling prima. Menyebut ketiga kasus sisa adalah bagian yang paling sering terlewat.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 2 ─────────────────────────────
    {
      title: "Sesi 2: FPB & KPK",
      blocks: [{ type: "PDF", dir: "olim-tb-sesi2", fileName: "OlimTB-Sesi2-FPB-dan-KPK.pdf" }],
      quiz: {
        title: "Latihan — Sesi 2: FPB & KPK",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Dengan algoritma Euclid, berapa $\\mathrm{FPB}(252, 198)$?",
            answer: 18,
            explanation: "$252 = 1\\cdot198 + 54$; $198 = 3\\cdot54 + 36$; $54 = 1\\cdot36 + 18$; $36 = 2\\cdot18 + 0$. Sisa tak nol terakhir: 18.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa $\\mathrm{FPB}(1274, 1547)$?",
            answer: 91,
            explanation: "$1547 = 1\\cdot1274 + 273$; $1274 = 4\\cdot273 + 182$; $273 = 1\\cdot182 + 91$; $182 = 2\\cdot91 + 0$. Jadi 91.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Hasil kali dua bilangan asli adalah 2160 dan FPB-nya 12. Berapa KPK-nya?",
            answer: 180,
            explanation: "$\\mathrm{FPB}\\cdot\\mathrm{KPK} = ab$, jadi $\\mathrm{KPK} = 2160 : 12 = 180$. Bilangannya sendiri tidak perlu diketahui.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa $\\mathrm{KPK}(84, 120)$?",
            answer: 840,
            explanation: "$\\mathrm{FPB}(84,120) = 12$, jadi $\\mathrm{KPK} = 84\\cdot120 : 12 = 840$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Langkah Euclid memakai kenyataan bahwa jika $a = qb + r$, maka…",
            options: [
              "$\\mathrm{FPB}(a,b) = \\mathrm{FPB}(b,r)$",
              "$\\mathrm{FPB}(a,b) = r$",
              "$\\mathrm{FPB}(a,b) = q$",
              "$\\mathrm{FPB}(a,b) = \\mathrm{FPB}(q,r)$",
            ],
            answer: "A",
            explanation: "Pembagi bersama $(a,b)$ dan pembagi bersama $(b,r)$ adalah himpunan yang sama, karena $r = a - qb$ dan $a = qb + r$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Mana pernyataan yang **salah**?",
            options: [
              "$\\mathrm{FPB}(a,b,c)\\cdot\\mathrm{KPK}(a,b,c) = abc$ untuk semua bilangan asli",
              "$\\mathrm{FPB}(a,b)\\cdot\\mathrm{KPK}(a,b) = ab$",
              "Jika $\\mathrm{FPB}(a,b)=1$, $a \\mid n$, dan $b \\mid n$, maka $ab \\mid n$",
              "Setiap pembagi bersama $a$ dan $b$ membagi $a - b$",
            ],
            answer: "A",
            explanation: "Untuk tiga bilangan rumus itu gagal: ambil $2, 4, 8$ — FPB 2, KPK 8, hasil kali $16 \\neq 64$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa bilangan asli $n \\le 100$ dengan $\\mathrm{FPB}(n, n+7) = 7$?",
            answer: 14,
            explanation: "FPB-nya membagi selisih 7, jadi bernilai 1 atau 7; bernilai 7 tepat saat $7 \\mid n$. Dari 1 sampai 100 ada $\\lfloor 100/7\\rfloor = 14$ kelipatan 7.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Bilangan 12 habis dibagi 4 dan habis dibagi 6, tetapi tidak habis dibagi 24. Mengapa ini tidak melanggar aturan?",
            options: [
              "Karena $\\mathrm{FPB}(4,6) = 2 \\neq 1$, jadi syarat relatif prima tidak dipenuhi",
              "Karena 24 bukan KPK dari 4 dan 6",
              "Karena 12 terlalu kecil",
              "Karena aturannya hanya berlaku untuk bilangan prima",
            ],
            answer: "A",
            explanation: "Aturan $a \\mid n$, $b \\mid n$ $\\Rightarrow ab \\mid n$ menuntut $\\mathrm{FPB}(a,b)=1$. Di sini FPB-nya 2, jadi yang berlaku hanyalah $\\mathrm{KPK}(4,6) = 12 \\mid 12$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Diketahui $53x + 14y = 1$ dengan $x$ dan $y$ bilangan bulat, dan $y = 19$. Berapa $x$? ${NEG}`,
            answer: -5,
            explanation: "$14\\cdot19 = 266$, jadi $53x = 1 - 266 = -265$ dan $x = -5$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa pasangan bilangan asli $(a,b)$ dengan $a \\le b$, $\\mathrm{FPB}(a,b) = 6$, dan $\\mathrm{KPK}(a,b) = 180$?",
            answer: 4,
            explanation: "$ab = 6\\cdot180 = 1080$. Pasangannya $(6,180)$, $(12,90)$, $(18,60)$, $(30,36)$ — empat pasangan.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt: "Carilah $\\mathrm{FPB}(1274, 1547)$ dengan algoritma Euclid. Tulis setiap langkah pembagiannya, lalu tulis hasilnya di kotak jawaban akhir.",
            answer: "91",
            answerMarks: 1,
            rubric: [
              { point: "Menuliskan langkah pembagian bersisa secara berurutan, bukan pohon faktor", marks: 2 },
              { point: "Setiap langkah memakai pasangan (pembagi, sisa) dari langkah sebelumnya", marks: 1 },
              { point: "Mengambil sisa tak nol terakhir sebagai FPB", marks: 1 },
            ],
            solution:
              "$1547 = 1 \\cdot 1274 + 273$\n\n$1274 = 4 \\cdot 273 + 182$\n\n$273 = 1 \\cdot 182 + 91$\n\n$182 = 2 \\cdot 91 + 0$\n\nSisa tak nol terakhir adalah $91$, jadi $\\mathrm{FPB}(1274,1547) = 91$. (Periksa: $1274 = 91\\cdot14$, $1547 = 91\\cdot17$.)",
            explanation: "Yang dinilai adalah langkah Euclid-nya. Menebak 91 lewat faktorisasi tetap memberi nilai jawaban akhir, tetapi bukan nilai prosesnya.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt: "Buktikan bahwa $\\mathrm{FPB}(2n+3,\\, n+1) = 1$ untuk setiap bilangan asli $n$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memisalkan $d$ sebagai pembagi bersama keduanya", marks: 1 },
              { point: "Membentuk kombinasi linear yang menghilangkan $n$, misalnya $(2n+3) - 2(n+1)$", marks: 3 },
              { point: "Menyimpulkan $d \\mid 1$, sehingga $d = 1$", marks: 2 },
            ],
            solution:
              "Misalkan $d = \\mathrm{FPB}(2n+3,\\, n+1)$. Maka $d \\mid (2n+3)$ dan $d \\mid (n+1)$.\n\nKarena $d$ membagi keduanya, $d$ juga membagi setiap kombinasi linearnya. Ambil\n\n$$(2n+3) - 2(n+1) = 2n + 3 - 2n - 2 = 1.$$\n\nJadi $d \\mid 1$, sehingga $d = 1$. $\\blacksquare$",
            explanation:
              "Pola yang selalu dipakai untuk FPB bentuk aljabar: cari kombinasi linear yang menghapus $n$. Kalau hasilnya konstanta $k$, maka FPB-nya membagi $k$.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 3 ─────────────────────────────
    {
      title: "Sesi 3: Bilangan Prima",
      blocks: [{ type: "PDF", dir: "olim-tb-sesi3", fileName: "OlimTB-Sesi3-Bilangan-Prima.pdf" }],
      quiz: {
        title: "Latihan — Sesi 3: Bilangan Prima",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak faktor positif dari 360?",
            answer: 24,
            explanation: "$360 = 2^3\\cdot3^2\\cdot5$, jadi $\\tau(360) = (3+1)(2+1)(1+1) = 24$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa jumlah semua faktor positif dari 72?",
            answer: 195,
            explanation: "$72 = 2^3\\cdot3^2$, jadi $\\sigma(72) = (1+2+4+8)(1+3+9) = 15\\cdot13 = 195$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak faktor positif dari $2^5 \\cdot 7^2$?",
            answer: 18,
            explanation: "$(5+1)(2+1) = 18$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dari faktor-faktor positif $2^5 \\cdot 7^2$, berapa banyak yang genap?",
            answer: 15,
            explanation: "Faktor ganjil berarti tidak memakai 2 sama sekali: ada $(2+1) = 3$ buah. Jadi yang genap $18 - 3 = 15$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Apakah 221 bilangan prima?",
            options: ["Bukan, $221 = 13\\cdot17$", "Ya", "Bukan, $221 = 3\\cdot 73$", "Bukan, $221 = 7\\cdot 31$"],
            answer: "A",
            explanation: "Cukup uji prima sampai $\\sqrt{221}\\approx 14{,}9$. Pada 13 ketemu: $221 = 13\\cdot17$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa faktor prima terkecil dari 391?",
            answer: 17,
            explanation: "391 tidak habis dibagi 2, 3, 5, 7, 11, 13; pada 17 ketemu: $391 = 17\\cdot23$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Mengapa 1 tidak dianggap bilangan prima?",
            options: [
              "Karena faktorisasi prima tidak lagi tunggal kalau 1 dianggap prima",
              "Karena 1 terlalu kecil",
              "Karena 1 bilangan ganjil",
              "Karena 1 tidak punya faktor",
            ],
            answer: "A",
            explanation: "Kalau 1 prima, maka $6 = 2\\cdot3 = 1\\cdot2\\cdot3 = 1\\cdot1\\cdot2\\cdot3$, dan Teorema Dasar Aritmetika runtuh.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa bilangan asli dari 1 sampai 100 yang banyak faktor positifnya **ganjil**?",
            answer: 10,
            explanation: "Banyak faktor ganjil hanya untuk kuadrat sempurna. Dari 1 sampai 100 ada 10 kuadrat: $1^2$ sampai $10^2$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa jumlah semua faktor positif dari 360?",
            answer: 1170,
            explanation: "$\\sigma(360) = (1+2+4+8)(1+3+9)(1+5) = 15\\cdot13\\cdot6 = 1170$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa banyak faktor positif dari 1024?",
            answer: 11,
            explanation: "$1024 = 2^{10}$, jadi $\\tau = 10 + 1 = 11$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Bukti Euclid membentuk $N = p_1p_2\\cdots p_k + 1$. Apa yang sebenarnya dibuktikan?",
            options: [
              "Bahwa $N$ punya faktor prima yang tidak ada di daftar",
              "Bahwa $N$ selalu bilangan prima",
              "Bahwa $N$ selalu komposit",
              "Bahwa $N$ habis dibagi $p_k$",
            ],
            answer: "A",
            explanation: "$N$ tidak selalu prima — misalnya $2\\cdot3\\cdot5\\cdot7\\cdot11\\cdot13+1 = 30031 = 59\\cdot509$. Yang pasti: faktor primanya di luar daftar.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Tentukan bilangan asli **terkecil** yang mempunyai tepat 15 faktor positif. Tulis prosesnya, lalu tulis bilangannya di kotak jawaban akhir.",
            answer: "144",
            answerMarks: 1,
            rubric: [
              { point: "Memakai $\\tau(n) = \\prod(\\alpha_i+1)$ dan memecah $15 = 15$ atau $3\\times5$", marks: 2 },
              { point: "Menyusun kandidat: $p^{14}$ dan $p^4q^2$", marks: 1 },
              { point: "Memberi pangkat terbesar pada prima terkecil dan membandingkan kandidatnya", marks: 1 },
            ],
            solution:
              "Banyak faktor $n = p_1^{\\alpha_1}\\cdots$ adalah $\\prod(\\alpha_i + 1) = 15$. Pemecahan 15 hanya $15$ atau $3\\times 5$.\n\n- $15 = 15$: bentuknya $p^{14}$, terkecil $2^{14} = 16384$.\n- $15 = 3\\times5$: bentuknya $p^4 q^2$, dan agar kecil, pangkat besar diberikan pada prima terkecil: $2^4\\cdot3^2 = 16\\cdot9 = 144$. (Kalau dibalik: $3^4\\cdot2^2 = 324$, lebih besar.)\n\nJadi bilangan terkecilnya adalah $\\mathbf{144}$.",
            explanation: "Aturan praktis: untuk membuat bilangan sekecil mungkin, pasangkan pangkat terbesar dengan prima terkecil.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt: "Buktikan bahwa banyaknya bilangan prima tak berhingga. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memulai dengan pengandaian bahwa prima hanya berhingga banyak", marks: 1 },
              { point: "Membentuk $N = p_1p_2\\cdots p_k + 1$", marks: 2 },
              { point: "Menunjukkan tidak ada $p_i$ yang membagi $N$ (sisanya selalu 1)", marks: 2 },
              { point: "Menyimpulkan kontradiksinya dengan benar", marks: 1 },
            ],
            solution:
              "Andaikan bilangan prima hanya ada berhingga banyak, yaitu $p_1, p_2, \\ldots, p_k$. Bentuk\n\n$$N = p_1 p_2 \\cdots p_k + 1.$$\n\nKarena $N > 1$, $N$ pasti punya faktor prima. Namun untuk setiap $i$, pembagian $N$ oleh $p_i$ bersisa 1, sebab $p_i$ membagi hasil kali $p_1\\cdots p_k$. Jadi tidak satu pun $p_i$ membagi $N$.\n\nBerarti faktor prima $N$ adalah prima yang tidak ada di daftar — bertentangan dengan pengandaian bahwa daftar itu memuat semua prima. Jadi banyaknya prima tak berhingga. $\\blacksquare$",
            explanation:
              "Kesalahan yang paling sering: menulis “jadi $N$ prima”. Yang benar hanya bahwa faktor prima $N$ berada di luar daftar.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 4 ─────────────────────────────
    {
      title: "Sesi 4: Kongruensi Modulo",
      blocks: [{ type: "PDF", dir: "olim-tb-sesi4", fileName: "OlimTB-Sesi4-Kongruensi-Modulo.pdf" }],
      quiz: {
        title: "Latihan — Sesi 4: Kongruensi Modulo",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa angka satuan dari $3^{2026}$?",
            answer: 9,
            explanation: "Siklus $3^n \\bmod 10$: $3, 9, 7, 1$ (panjang 4). $2026 = 4\\cdot506 + 2$, jadi sama dengan $3^2 = 9$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa angka satuan dari $7^{100}$?",
            answer: 1,
            explanation: "Siklus $7^n \\bmod 10$: $7, 9, 3, 1$. $100$ habis dibagi 4, jadi ambil suku terakhir siklus: 1.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa sisa $2^{100}$ dibagi 13?",
            answer: 3,
            explanation: "Fermat: $2^{12}\\equiv1 \\pmod{13}$. $100 = 12\\cdot8+4$, jadi $2^{100}\\equiv2^4 = 16 \\equiv 3 \\pmod{13}$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa sisa $5^{2026}$ dibagi 7?",
            answer: 2,
            explanation: "Fermat: $5^6 \\equiv 1 \\pmod 7$. $2026 = 6\\cdot337 + 4$, dan $5^4 = 625 = 89\\cdot7 + 2$, jadi sisanya 2.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Selesaikan $7x \\equiv 3 \\pmod{12}$. Tulis solusi terkecil yang tak negatif.",
            answer: 9,
            explanation: "$7\\cdot7 = 49 \\equiv 1$, jadi invers 7 adalah 7. Maka $x \\equiv 7\\cdot3 = 21 \\equiv 9 \\pmod{12}$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Hari ini Senin. Hari apa 100 hari lagi?",
            options: ["Rabu", "Selasa", "Kamis", "Jumat"],
            answer: "A",
            explanation: "$100 = 14\\cdot7 + 2$, jadi $100 \\equiv 2 \\pmod 7$: maju dua hari dari Senin, yaitu Rabu.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Operasi mana yang **tidak** boleh dilakukan bebas pada kongruensi?",
            options: ["Membagi kedua ruas", "Menjumlah kedua ruas", "Mengalikan kedua ruas", "Memangkatkan kedua ruas"],
            answer: "A",
            explanation: "Pembagian perlu invers, dan invers hanya ada kalau pembaginya relatif prima dengan modulusnya. $6\\equiv12\\pmod6$ tetapi $3\\not\\equiv6\\pmod6$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Berapa dua angka terakhir dari $7^{2026}$? (Tulis sebagai bilangan, misalnya 07.)",
            answer: 49,
            explanation: "Siklus $7^n \\bmod 100$: $7, 49, 43, 1$ (panjang 4). $2026 = 4\\cdot506+2$, jadi sama dengan $7^2 = 49$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa sisa $12^{2026}$ dibagi 11?",
            answer: 1,
            explanation: "$12 \\equiv 1 \\pmod{11}$, jadi $12^{2026}\\equiv 1^{2026} = 1$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa sisa 2026 dibagi 9?",
            answer: 1,
            explanation: "Jumlah angkanya $2+0+2+6 = 10$, dan $10 \\equiv 1 \\pmod 9$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt: "Tentukan sisa $3^{2026}$ dibagi 7. Tulis prosesnya, lalu tulis sisanya di kotak jawaban akhir.",
            answer: "4",
            answerMarks: 1,
            rubric: [
              { point: "Menemukan panjang siklus atau memakai Teorema Fermat ($3^6 \\equiv 1 \\pmod 7$)", marks: 2 },
              { point: "Membagi eksponen: $2026 = 6\\cdot337 + 4$", marks: 1 },
              { point: "Menghitung sisa pangkat kecilnya dengan benar", marks: 1 },
            ],
            solution:
              "7 prima dan $7 \\nmid 3$, jadi menurut Teorema Kecil Fermat $3^{6} \\equiv 1 \\pmod 7$.\n\nBagi eksponennya: $2026 = 6\\cdot337 + 4$. Maka\n\n$$3^{2026} = (3^{6})^{337}\\cdot 3^{4} \\equiv 1^{337}\\cdot 3^4 = 81 \\pmod 7.$$\n\nKarena $81 = 11\\cdot7 + 4$, sisanya adalah $\\mathbf{4}$.",
            explanation: "Dua jalan sama sahihnya: daftar siklus $3^n \\bmod 7$ (panjang 6), atau langsung pakai Fermat. Yang dinilai adalah alasan memangkas eksponennya.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt: "Buktikan bahwa $2^{3n} - 1$ habis dibagi 7 untuk setiap bilangan asli $n$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menulis $2^{3n}$ sebagai $8^n$", marks: 2 },
              { point: "Memakai $8 \\equiv 1 \\pmod 7$", marks: 2 },
              { point: "Menyimpulkan $8^n - 1 \\equiv 0 \\pmod 7$ untuk setiap $n$", marks: 2 },
            ],
            solution:
              "Tulis ulang pangkatnya: $2^{3n} = (2^3)^n = 8^n$.\n\nKarena $8 = 7 + 1$, kita punya $8 \\equiv 1 \\pmod 7$. Kongruensi boleh dipangkatkan, jadi\n\n$$8^n \\equiv 1^n = 1 \\pmod 7.$$\n\nDengan demikian $2^{3n} - 1 \\equiv 1 - 1 = 0 \\pmod 7$, artinya $7 \\mid (2^{3n}-1)$ untuk setiap bilangan asli $n$. $\\blacksquare$",
            explanation:
              "Pola yang sering muncul: kelompokkan pangkatnya sampai alasnya kongruen 1 modulo yang diminta. Setelah itu seluruh soal selesai dalam satu baris.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 5 ─────────────────────────────
    {
      title: "Sesi 5: Persamaan Diophantine",
      blocks: [{ type: "PDF", dir: "olim-tb-sesi5", fileName: "OlimTB-Sesi5-Persamaan-Diophantine.pdf" }],
      quiz: {
        title: "Latihan — Sesi 5: Persamaan Diophantine",
        questions: [
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Apakah $6x + 9y = 100$ punya solusi bilangan bulat?",
            options: [
              "Tidak, karena $\\mathrm{FPB}(6,9) = 3$ tidak membagi 100",
              "Ya, ada tak berhingga banyak",
              "Ya, tepat satu",
              "Tidak, karena 100 bilangan genap",
            ],
            answer: "A",
            explanation: "$ax+by=c$ punya solusi bulat tepat saat $\\mathrm{FPB}(a,b)\\mid c$. Di sini $3 \\nmid 100$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $3x + 7y = 52$?",
            answer: 3,
            explanation: "Solusinya $(1,7)$, $(8,4)$, $(15,1)$ — tiga pasangan.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $5x + 8y = 60$?",
            answer: 2,
            explanation: "Solusinya $(4,5)$ dan $(12,0)$ — dua pasangan.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $11x + 8y = 100$?",
            answer: 1,
            explanation: "Hanya $(4,7)$: $44 + 56 = 100$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $4x + 7y = 97$?",
            answer: 3,
            explanation: "Karena $4x$ genap dan 97 ganjil, $7y$ harus ganjil, jadi $y$ ganjil. Mencobanya: $y = 3 \\Rightarrow x = 19$, $y = 7 \\Rightarrow x = 12$, $y = 11 \\Rightarrow x = 5$. Jadi $(19,3)$, $(12,7)$, $(5,11)$ — tiga pasangan.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Jika $(x_0,y_0)$ satu solusi $ax+by=c$ dan $d = \\mathrm{FPB}(a,b)$, bentuk umum solusinya adalah…",
            options: [
              "$x = x_0 + (b/d)t$, $y = y_0 - (a/d)t$",
              "$x = x_0 + at$, $y = y_0 - bt$",
              "$x = x_0 + dt$, $y = y_0 - dt$",
              "$x = x_0 t$, $y = y_0 t$",
            ],
            answer: "A",
            explanation: "Menambah $x$ sebanyak $b/d$ dan mengurangi $y$ sebanyak $a/d$ membuat perubahan kedua suku saling meniadakan.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt: "Ada berapa pasangan bilangan **asli** $(x,y)$ yang memenuhi $xy + 2x + 3y = 18$?",
            answer: 3,
            explanation: "Tambah 6: $(x+3)(y+2) = 24$. Dengan $x,y\\ge1$: $(4,6), (6,4), (8,3)$ memberi $(x,y) = (1,4), (3,2), (5,1)$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Mengapa $x^2 = 4y + 3$ tidak punya solusi bilangan bulat?",
            options: [
              "Karena kuadrat bilangan bulat hanya bersisa 0 atau 1 modulo 4",
              "Karena ruas kanan selalu ganjil",
              "Karena $x$ harus genap",
              "Karena 3 bukan kuadrat sempurna",
            ],
            answer: "A",
            explanation: "$x$ genap memberi $x^2\\equiv0$, $x$ ganjil memberi $x^2\\equiv1 \\pmod 4$; sedangkan $4y+3\\equiv3$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa bilangan bulat tak negatif terkecil $x$ yang memenuhi $7x \\equiv 5 \\pmod{12}$?",
            answer: 11,
            explanation: "Invers 7 modulo 12 adalah 7, jadi $x \\equiv 7\\cdot5 = 35 \\equiv 11 \\pmod{12}$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Diketahui $7x + 12y = 5$ dan $y = 1$. Berapa nilai $x$? ${NEG}`,
            answer: -1,
            explanation: "$7x = 5 - 12 = -7$, jadi $x = -1$.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Tiket anak Rp3.000 dan tiket dewasa Rp7.000. Uang yang terkumpul tepat Rp52.000. Ada berapa kemungkinan banyaknya penonton anak dan dewasa? Tulis prosesnya, lalu tulis banyaknya kemungkinan di kotak jawaban akhir.",
            answer: "3",
            answerMarks: 1,
            rubric: [
              { point: "Memodelkan sebagai $3x + 7y = 52$ dengan $x, y \\ge 0$ bilangan bulat", marks: 2 },
              { point: "Menemukan satu solusi dan menuliskan keluarga solusinya", marks: 2 },
              { point: "Memakai syarat tak negatif untuk membatasi parameternya, lalu menghitung banyaknya", marks: 1 },
            ],
            solution:
              "Dalam ribuan rupiah: $3x + 7y = 52$ dengan $x \\ge 0$, $y \\ge 0$ bilangan bulat.\n\n$\\mathrm{FPB}(3,7) = 1$ membagi 52, jadi solusi ada. Coba $y = 1$: $3x = 45$, sehingga $x = 15$. Satu solusinya $(15, 1)$.\n\nKeluarga solusinya: $x = 15 + 7t$, $y = 1 - 3t$.\n\nSyarat $x \\ge 0$ memberi $t \\ge -15/7 \\approx -2{,}14$; syarat $y \\ge 0$ memberi $t \\le 1/3$. Jadi $t \\in \\{-2,-1,0\\}$, yaitu $(1,7)$, $(8,4)$, $(15,1)$.\n\nAda $\\mathbf{3}$ kemungkinan.",
            explanation: "Yang membedakan jawaban lengkap dari tebakan: menulis keluarga solusinya, lalu membatasi parameter $t$ — bukan berhenti di satu pasangan yang kebetulan cocok.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt: "Buktikan bahwa $15x + 25y = 1007$ tidak punya solusi bilangan bulat. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menghitung $\\mathrm{FPB}(15,25) = 5$", marks: 1 },
              { point: "Menunjukkan ruas kiri selalu habis dibagi 5", marks: 2 },
              { point: "Menunjukkan $5 \\nmid 1007$ dan menyimpulkan tidak ada solusi", marks: 2 },
            ],
            solution:
              "$\\mathrm{FPB}(15, 25) = 5$, dan $5 \\mid 15$ serta $5 \\mid 25$. Karena itu untuk setiap bilangan bulat $x, y$,\n\n$$5 \\mid (15x + 25y).$$\n\nSementara $1007 = 5 \\cdot 201 + 2$, sehingga $5 \\nmid 1007$.\n\nKalau ada solusi bulat, ruas kiri habis dibagi 5 tetapi ruas kanan tidak — mustahil. Jadi persamaan itu tidak punya solusi bilangan bulat. $\\blacksquare$",
            explanation: "Ini penerapan langsung syarat keterselesaian: $ax+by=c$ punya solusi tepat saat $\\mathrm{FPB}(a,b) \\mid c$.",
          },
        ],
      },
    },
  ],
};
