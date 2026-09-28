/**
 * Persiapan Olimpiade Matematika (MS²C) — Bab: Aljabar.
 * Read by scripts/setup-olim.ts, alongside olim-teori-bilangan.ts.
 *
 * Sessions follow Targhib's syllabus order: identities, inequalities,
 * sequences, polynomials, functions. Identities come first because every
 * later session leans on them — Vieta questions are identity questions in
 * disguise, and so is the AM–GM proof.
 *
 * Every numeric answer was recomputed in Python (fractions.Fraction where a
 * fraction was involved) before being written down.
 */
import type { BabContent } from "./math-types";

const FRAC = "Tulis pecahan sebagai a/b, misalnya 21/4.";

export const OLIM_ALJABAR: BabContent = {
  chapterTitle: "Aljabar",
  pdfPrefix: "OlimAlj-",
  sesi: [
    // ───────────────────────────── Sesi 1 ─────────────────────────────
    {
      title: "Sesi 1: Identitas Dasar Aljabar",
      blocks: [{ type: "PDF", dir: "olim-alj-sesi1", fileName: "OlimAlj-Sesi1-Identitas-Dasar-Aljabar.pdf" }],
      quiz: {
        title: "Latihan — Sesi 1: Identitas Dasar Aljabar",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Hitung $1002^2 - 998^2$.",
            answer: 8000,
            explanation: "Selisih kuadrat: $(1002-998)(1002+998) = 4\\cdot2000 = 8000$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Jika $x + \\dfrac1x = 5$, berapa $x^2 + \\dfrac1{x^2}$?",
            answer: 23,
            explanation: "$\\left(x+\\frac1x\\right)^2 = x^2 + 2 + \\frac1{x^2}$, jadi $x^2+\\frac1{x^2} = 25 - 2 = 23$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Jika $x + \\dfrac1x = 5$, berapa $x^3 + \\dfrac1{x^3}$?",
            answer: 110,
            explanation: "$x^3+\\frac1{x^3} = t^3 - 3t$ dengan $t = 5$: $125 - 15 = 110$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Jika $x - \\dfrac1x = 3$, berapa $x^2 + \\dfrac1{x^2}$?",
            answer: 11,
            explanation: "$\\left(x-\\frac1x\\right)^2 = x^2 - 2 + \\frac1{x^2}$, jadi $x^2+\\frac1{x^2} = 9 + 2 = 11$. Perhatikan tandanya berubah menjadi $+2$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Diketahui $a + b = 7$ dan $ab = 10$. Berapa $a^2 + b^2$?",
            answer: 29,
            explanation: "$a^2+b^2 = (a+b)^2 - 2ab = 49 - 20 = 29$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $a + b = 7$ dan $ab = 10$. Berapa $a^3 + b^3$?",
            answer: 133,
            explanation: "$a^3+b^3 = (a+b)^3 - 3ab(a+b) = 343 - 3\\cdot10\\cdot7 = 133$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $a+b+c = 6$ dan $ab+bc+ca = 11$. Berapa $a^2+b^2+c^2$?",
            answer: 14,
            explanation: "$(a+b+c)^2 = a^2+b^2+c^2+2(ab+bc+ca)$, jadi $a^2+b^2+c^2 = 36 - 22 = 14$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Hitung $101 \\times 99$ dengan identitas.",
            answer: 9999,
            explanation: "$(100+1)(100-1) = 100^2 - 1 = 9999$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Jika $a + b + c = 0$, maka $a^3+b^3+c^3$ sama dengan…",
            options: ["$3abc$", "$0$", "$abc$", "$-3abc$"],
            answer: "A",
            explanation: "Dari identitas $a^3+b^3+c^3-3abc = (a+b+c)(\\ldots)$, ruas kanan nol, jadi $a^3+b^3+c^3 = 3abc$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Bentuk faktorisasi dari $xy + 2x + 3y + 6$ adalah…",
            options: ["$(x+3)(y+2)$", "$(x+2)(y+3)$", "$(x+1)(y+6)$", "$(xy+6)(x+y)$"],
            answer: "A",
            explanation: "Kelompokkan: $x(y+2) + 3(y+2) = (x+3)(y+2)$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Diketahui $x + \\dfrac1x = 4$. Tentukan nilai $x^3 + \\dfrac1{x^3}$ tanpa mencari $x$ terlebih dahulu. Tulis prosesnya, lalu tulis hasilnya di kotak jawaban akhir.",
            answer: "52",
            answerMarks: 1,
            rubric: [
              { point: "Mengkuadratkan untuk mendapat $x^2 + \\frac1{x^2} = 14$ (atau memakai identitas kubik langsung)", marks: 2 },
              { point: "Memakai $\\left(x+\\frac1x\\right)^3 = x^3 + \\frac1{x^3} + 3\\left(x+\\frac1x\\right)$ dengan benar", marks: 1 },
              { point: "Menyelesaikan aritmetikanya sampai selesai", marks: 1 },
            ],
            solution:
              "Misalkan $t = x + \\dfrac1x = 4$.\n\nPangkatkan tiga:\n\n$$t^3 = \\left(x+\\frac1x\\right)^3 = x^3 + 3x + \\frac3x + \\frac1{x^3} = x^3 + \\frac1{x^3} + 3\\left(x + \\frac1x\\right).$$\n\nJadi $x^3 + \\dfrac1{x^3} = t^3 - 3t = 64 - 12 = \\mathbf{52}$.\n\n(Cara lain: $x^2+\\frac1{x^2} = 16-2 = 14$, lalu $\\left(x+\\frac1x\\right)\\left(x^2 - 1 + \\frac1{x^2}\\right) = 4\\cdot13 = 52$.)",
            explanation: "Kedua cara sama sahihnya. Yang dinilai: menjabarkan pangkat tiga dengan benar, termasuk suku $3\\left(x+\\frac1x\\right)$ yang sering hilang.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt: "Buktikan bahwa $(a+b+c)^2 = a^2+b^2+c^2+2(ab+bc+ca)$ untuk semua bilangan real $a, b, c$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menjabarkan $(a+b+c)(a+b+c)$ suku demi suku", marks: 3 },
              { point: "Mengelompokkan sukunya dan menyimpulkan bentuk akhirnya", marks: 2 },
            ],
            solution:
              "Tulis sebagai perkalian dua faktor lalu jabarkan:\n\n$$(a+b+c)(a+b+c) = a^2 + ab + ac + ba + b^2 + bc + ca + cb + c^2.$$\n\nKelompokkan suku sejenis. Suku kuadrat: $a^2 + b^2 + c^2$. Suku silang: $ab$ dan $ba$ memberi $2ab$, $bc$ dan $cb$ memberi $2bc$, $ac$ dan $ca$ memberi $2ca$.\n\nJadi $(a+b+c)^2 = a^2+b^2+c^2+2(ab+bc+ca)$. $\\blacksquare$",
            explanation: "Kuncinya menuliskan kesembilan sukunya, bukan langsung menulis hasilnya. Setiap pasangan silang muncul dua kali — dari situlah faktor 2 berasal.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 2 ─────────────────────────────
    {
      title: "Sesi 2: Ketaksamaan Aljabar",
      blocks: [{ type: "PDF", dir: "olim-alj-sesi2", fileName: "OlimAlj-Sesi2-Ketaksamaan-Aljabar.pdf" }],
      quiz: {
        title: "Latihan — Sesi 2: Ketaksamaan Aljabar",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Untuk $x > 0$, berapa nilai terkecil dari $x + \\dfrac{4}{x}$?",
            answer: 4,
            explanation: "AM–GM: $x + \\frac4x \\ge 2\\sqrt{4} = 4$, tercapai saat $x = 2$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Pada nilai $x$ berapa $x + \\dfrac{4}{x}$ mencapai nilai terkecilnya (untuk $x>0$)?",
            answer: 2,
            explanation: "Tanda sama dengan AM–GM berlaku saat $x = \\frac4x$, yaitu $x^2 = 4$ dan $x = 2$ (positif).",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Untuk $x > 0$, berapa nilai terkecil dari $2x + \\dfrac{18}{x}$?",
            answer: 12,
            explanation: "AM–GM: $2x + \\frac{18}x \\ge 2\\sqrt{2\\cdot18} = 2\\cdot6 = 12$, tercapai saat $2x = \\frac{18}x$, yaitu $x = 3$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dua bilangan positif jumlahnya 20. Berapa hasil kali terbesar yang mungkin?",
            answer: 100,
            explanation: "AM–GM: hasil kali terbesar saat keduanya sama, yaitu $10\\cdot10 = 100$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $a, b, c > 0$ dan $abc = 8$. Berapa nilai terkecil dari $a+b+c$?",
            answer: 6,
            explanation: "AM–GM tiga bilangan: $\\frac{a+b+c}{3} \\ge \\sqrt[3]{8} = 2$, jadi $a+b+c \\ge 6$, tercapai saat $a=b=c=2$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Ketaksamaan AM–GM $\\frac{a+b}{2} \\ge \\sqrt{ab}$ berlaku untuk…",
            options: ["$a, b \\ge 0$", "semua bilangan real", "semua bilangan bulat", "hanya $a, b > 1$"],
            answer: "A",
            explanation: "Untuk bilangan negatif ketaksamaannya bisa terbalik: $a=-1$, $b=-4$ memberi rata-rata $-2{,}5$ tetapi $\\sqrt{ab} = 2$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Hampir semua bukti ketaksamaan tingkat SMP berawal dari…",
            options: ["$(a-b)^2 \\ge 0$", "$a > b$ atau $b > a$", "$a^2 = b^2 \\Rightarrow a = b$", "pembagian kedua ruas"],
            answer: "A",
            explanation: "Dari $(a-b)^2\\ge0$ langsung lahir $a^2+b^2 \\ge 2ab$, yang menurunkan sebagian besar ketaksamaan dasar.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Untuk $x > 0$, berapa nilai terkecil dari $x^2 + \\dfrac{16}{x^2}$?",
            answer: 8,
            explanation: "AM–GM pada $x^2$ dan $\\frac{16}{x^2}$: $\\ge 2\\sqrt{16} = 8$, tercapai saat $x^2 = 4$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 3,
            prompt: "Untuk $x \\ge 3$, nilai terkecil $x + \\dfrac4x$ adalah…",
            options: ["$\\frac{13}{3}$", "4", "$\\frac{7}{2}$", "5"],
            answer: "A",
            explanation: "AM–GM memberi batas 4 di $x=2$, tetapi $x=2$ tidak diizinkan. Untuk $x \\ge 3$ fungsinya naik, jadi minimumnya di $x=3$: $3+\\frac43 = \\frac{13}3$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Kapan tanda sama dengan pada $a^2+b^2+c^2 \\ge ab+bc+ca$ tercapai?",
            options: ["Saat $a = b = c$", "Saat $a+b+c=0$", "Saat $abc = 1$", "Tidak pernah"],
            answer: "A",
            explanation: "Buktinya menjumlahkan $(a-b)^2, (b-c)^2, (c-a)^2 \\ge 0$; semuanya nol tepat saat ketiganya sama.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt: "Buktikan bahwa $a^2 + b^2 + c^2 \\ge ab + bc + ca$ untuk semua bilangan real $a, b, c$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memulai dari kuadrat yang tak negatif, misalnya $(a-b)^2 \\ge 0$", marks: 2 },
              { point: "Menuliskan ketiga versinya dan menjumlahkannya", marks: 2 },
              { point: "Membagi 2 dan menyimpulkan, serta menyebut kapan tanda sama dengan berlaku", marks: 2 },
            ],
            solution:
              "Karena kuadrat tidak pernah negatif:\n\n$$(a-b)^2 \\ge 0, \\qquad (b-c)^2 \\ge 0, \\qquad (c-a)^2 \\ge 0.$$\n\nJabarkan masing-masing: $a^2+b^2 \\ge 2ab$, $b^2+c^2 \\ge 2bc$, $c^2+a^2 \\ge 2ca$.\n\nJumlahkan ketiganya:\n\n$$2(a^2+b^2+c^2) \\ge 2(ab+bc+ca).$$\n\nBagi 2: $a^2+b^2+c^2 \\ge ab+bc+ca$. Tanda sama dengan berlaku tepat saat ketiga kuadratnya nol, yaitu $a = b = c$. $\\blacksquare$",
            explanation: "Menyebut syarat kesamaan adalah bagian dari jawaban, bukan tambahan.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Untuk $x > 0$, tentukan nilai terkecil dari $3x + \\dfrac{27}{x}$ beserta nilai $x$ saat tercapai. Tulis prosesnya, lalu tulis nilai terkecilnya di kotak jawaban akhir.",
            answer: "18",
            answerMarks: 1,
            rubric: [
              { point: "Memeriksa bahwa kedua suku positif sehingga AM–GM boleh dipakai", marks: 1 },
              { point: "Menerapkan AM–GM dengan hasil kali konstan $3x \\cdot \\frac{27}{x} = 81$", marks: 2 },
              { point: "Menentukan titik tercapainya, yaitu $x = 3$, dan memeriksanya", marks: 1 },
            ],
            solution:
              "Untuk $x>0$, kedua suku $3x$ dan $\\dfrac{27}{x}$ positif, jadi AM–GM berlaku. Hasil kalinya konstan:\n\n$$3x \\cdot \\frac{27}{x} = 81.$$\n\nMaka\n\n$$3x + \\frac{27}{x} \\ge 2\\sqrt{81} = 18.$$\n\nTanda sama dengan berlaku saat $3x = \\dfrac{27}{x}$, yaitu $3x^2 = 27$, $x^2 = 9$, dan karena $x>0$ diperoleh $x = 3$.\n\nPeriksa: $3(3) + \\frac{27}{3} = 9 + 9 = 18$. \u2713 Nilai terkecilnya $\\mathbf{18}$ pada $x = 3$.",
            explanation: "Kunci AM–GM untuk soal minimum: pastikan hasil kali kedua suku konstan. Kalau tidak konstan, pecah dulu sukunya sampai konstan.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 3 ─────────────────────────────
    {
      title: "Sesi 3: Baris & Deret",
      blocks: [{ type: "PDF", dir: "olim-alj-sesi3", fileName: "OlimAlj-Sesi3-Baris-dan-Deret.pdf" }],
      quiz: {
        title: "Latihan — Sesi 3: Baris & Deret",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa $1 + 2 + 3 + \\cdots + 100$?",
            answer: 5050,
            explanation: "$S = \\frac{100}{2}(1+100) = 50\\cdot101 = 5050$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Barisan aritmetika $7, 11, 15, \\ldots$ — berapa suku ke-20?",
            answer: 83,
            explanation: "$U_{20} = 7 + 19\\cdot4 = 83$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa jumlah 20 suku pertama barisan $7, 11, 15, \\ldots$?",
            answer: 900,
            explanation: "$S_{20} = \\frac{20}{2}(7 + 83) = 10\\cdot90 = 900$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Barisan geometri $3, 6, 12, \\ldots$ — berapa suku ke-8?",
            answer: 384,
            explanation: "$U_8 = 3\\cdot2^7 = 384$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa jumlah 8 suku pertama barisan $3, 6, 12, \\ldots$?",
            answer: 765,
            explanation: "$S_8 = \\frac{3(2^8-1)}{2-1} = 3\\cdot255 = 765$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa jumlah deret geometri tak hingga $6 + 2 + \\frac23 + \\cdots$?",
            answer: 9,
            explanation: "$a = 6$, $r = \\frac13$, jadi $S_\\infty = \\frac{6}{1 - 1/3} = 9$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Ubah $0{,}\\overline{27}$ (yaitu $0{,}272727\\ldots$) menjadi pecahan paling sederhana. ${FRAC}`,
            answer: "3/11",
            explanation: "Deret geometri $a = \\frac{27}{100}$, $r = \\frac1{100}$: $S = \\frac{27/100}{99/100} = \\frac{27}{99} = \\frac{3}{11}$.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `Berapa $\\dfrac{1}{1\\cdot2} + \\dfrac{1}{2\\cdot3} + \\cdots + \\dfrac{1}{49\\cdot50}$? ${FRAC}`,
            answer: "49/50",
            explanation: "Teleskopik: $\\sum \\left(\\frac1n - \\frac1{n+1}\\right) = 1 - \\frac{1}{50} = \\frac{49}{50}$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Bilangan segitiga ke-20 adalah $T_{20} = \\frac{20\\cdot21}{2}$. Berapa nilainya?",
            answer: 210,
            explanation: "$\\frac{20\\cdot21}{2} = 210$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Barisan $2, 5, 10, 17, 26, \\ldots$ paling tepat digambarkan sebagai…",
            options: ["$U_n = n^2 + 1$", "aritmetika dengan beda 3", "geometri dengan rasio 2", "$U_n = 2n + 1$"],
            answer: "A",
            explanation: "Selisihnya $3,5,7,9$ — naik tetap 2, jadi barisannya kuadratik. Memang $U_n = n^2+1$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Deret geometri tak hingga punya jumlah berhingga tepat ketika…",
            options: ["$|r| < 1$", "$r > 0$", "$r < 1$", "$a < 1$"],
            answer: "A",
            explanation: "Untuk $|r| \\ge 1$ sukunya tidak mengecil menuju nol, sehingga jumlahnya tidak ada.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Hitunglah $\\dfrac{1}{1\\cdot2} + \\dfrac{1}{2\\cdot3} + \\dfrac{1}{3\\cdot4} + \\cdots + \\dfrac{1}{99\\cdot100}$. Tulis prosesnya, lalu tulis hasilnya sebagai pecahan a/b di kotak jawaban akhir.",
            answer: "99/100",
            answerMarks: 1,
            rubric: [
              { point: "Memecah suku umum menjadi $\\frac1n - \\frac1{n+1}$", marks: 2 },
              { point: "Menuliskan beberapa suku dan menunjukkan sukunya saling meniadakan", marks: 2 },
              { point: "Menyimpulkan hanya suku pertama dan terakhir yang tersisa", marks: 1 },
            ],
            solution:
              "Pecah suku umumnya:\n\n$$\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}.$$\n\nMaka jumlahnya menjadi\n\n$$\\left(\\frac11 - \\frac12\\right) + \\left(\\frac12 - \\frac13\\right) + \\cdots + \\left(\\frac1{99} - \\frac1{100}\\right).$$\n\nSetiap $-\\frac1k$ bertemu $+\\frac1k$ pada suku berikutnya, sehingga semua suku tengah hilang. Yang tersisa hanya\n\n$$1 - \\frac{1}{100} = \\frac{99}{100}.$$",
            explanation: "Ini pola teleskopik. Yang dinilai bukan hasilnya saja, melainkan menunjukkan mengapa suku tengahnya lenyap.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Suku ke-4 sebuah barisan aritmetika adalah 17 dan suku ke-9 adalah 37. Tentukan jumlah 10 suku pertamanya. Tulis prosesnya, lalu tulis jumlahnya di kotak jawaban akhir.",
            answer: "230",
            answerMarks: 1,
            rubric: [
              { point: "Menyusun dua persamaan dari $U_4$ dan $U_9$", marks: 2 },
              { point: "Menemukan beda $b = 4$ dan suku pertama $a = 5$", marks: 1 },
              { point: "Memakai rumus $S_n$ dengan benar", marks: 1 },
            ],
            solution:
              "$U_4 = a + 3b = 17$ dan $U_9 = a + 8b = 37$.\n\nKurangkan: $5b = 20$, jadi $b = 4$. Substitusi: $a + 12 = 17$, jadi $a = 5$.\n\nMaka $U_{10} = 5 + 9\\cdot4 = 41$ dan\n\n$$S_{10} = \\frac{10}{2}(5 + 41) = 5 \\cdot 46 = \\mathbf{230}.$$",
            explanation: "Dua suku yang diketahui selalu cukup untuk menentukan $a$ dan $b$: kurangkan persamaannya supaya $a$ hilang.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 4 ─────────────────────────────
    {
      title: "Sesi 4: Persamaan Polinomial serta Akar-akarnya",
      blocks: [{ type: "PDF", dir: "olim-alj-sesi4", fileName: "OlimAlj-Sesi4-Persamaan-Polinomial.pdf" }],
      quiz: {
        title: "Latihan — Sesi 4: Persamaan Polinomial",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Akar-akar $x^2 - 7x + 10 = 0$ adalah $\\alpha$ dan $\\beta$. Berapa $\\alpha^2 + \\beta^2$?",
            answer: 29,
            explanation: "$\\alpha+\\beta = 7$, $\\alpha\\beta = 10$, jadi $\\alpha^2+\\beta^2 = 49 - 20 = 29$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Persamaan $x^2 + kx + 9 = 0$ punya akar kembar dengan $k$ positif. Berapa $k$?",
            answer: 6,
            explanation: "$D = k^2 - 36 = 0$ memberi $k = \\pm6$; yang positif adalah 6.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Akar-akar $2x^2 - 5x + 1 = 0$ adalah $\\alpha$ dan $\\beta$. Berapa $\\dfrac1\\alpha + \\dfrac1\\beta$?",
            answer: 5,
            explanation: "$\\frac1\\alpha+\\frac1\\beta = \\frac{\\alpha+\\beta}{\\alpha\\beta} = \\frac{5/2}{1/2} = 5$.",
          },
          {
            type: "FRACTION",
            points: 3,
            prompt: `Akar-akar $2x^2 - 5x + 1 = 0$ adalah $\\alpha$ dan $\\beta$. Berapa $\\alpha^2+\\beta^2$? ${FRAC}`,
            answer: "21/4",
            explanation: "$s = \\frac52$, $p = \\frac12$: $s^2 - 2p = \\frac{25}{4} - 1 = \\frac{21}{4}$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Persamaan $x^2 - 6x + m = 0$ tidak punya akar real ketika…",
            options: ["$m > 9$", "$m < 9$", "$m = 9$", "$m > 0$"],
            answer: "A",
            explanation: "$D = 36 - 4m < 0$ memberi $m > 9$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Jika $\\alpha+\\beta = 7$ dan $\\alpha\\beta = 10$, persamaan kuadrat yang akar-akarnya $\\alpha+1$ dan $\\beta+1$ adalah $x^2 - Sx + P = 0$. Berapa $P$?",
            answer: 18,
            explanation: "$P = (\\alpha+1)(\\beta+1) = \\alpha\\beta + (\\alpha+\\beta) + 1 = 10 + 7 + 1 = 18$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa akar terbesar dari $x^3 - 6x^2 + 11x - 6 = 0$?",
            answer: 3,
            explanation: "Akar rasionalnya membagi 6; ternyata akarnya 1, 2, dan 3.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Akar-akar $3x^2 - 4x - 5 = 0$ adalah $\\alpha$ dan $\\beta$. Berapa $\\alpha\\beta$? ${FRAC}`,
            answer: "-5/3",
            explanation: "$\\alpha\\beta = \\frac ca = \\frac{-5}{3}$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Untuk $ax^3+bx^2+cx+d = 0$ dengan akar $\\alpha,\\beta,\\gamma$, hasil kali $\\alpha\\beta\\gamma$ sama dengan…",
            options: ["$-\\frac da$", "$\\frac da$", "$-\\frac ba$", "$\\frac ca$"],
            answer: "A",
            explanation: "Hubungan Vieta untuk pangkat tiga: jumlah $=-\\frac ba$, jumlah perkalian dua-dua $=\\frac ca$, hasil kali $=-\\frac da$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Menurut teorema akar rasional, akar rasional $\\frac pq$ dari polinomial berkoefisien bulat memenuhi…",
            options: [
              "$p$ membagi suku tetap dan $q$ membagi koefisien utama",
              "$p$ membagi koefisien utama dan $q$ membagi suku tetap",
              "$p$ dan $q$ keduanya membagi suku tetap",
              "$p+q$ membagi suku tetap",
            ],
            answer: "A",
            explanation: "Karena itu, untuk polinomial monik (koefisien utama 1), akar rasionalnya pasti bilangan bulat pembagi suku tetap.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Akar-akar $x^2 - 5x + 3 = 0$ adalah $\\alpha$ dan $\\beta$. Tentukan $\\alpha^3 + \\beta^3$ tanpa mencari akarnya. Tulis prosesnya, lalu tulis hasilnya di kotak jawaban akhir.",
            answer: "80",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut $\\alpha+\\beta = 5$ dan $\\alpha\\beta = 3$ dari hubungan Vieta", marks: 2 },
              { point: "Memakai identitas $\\alpha^3+\\beta^3 = s^3 - 3ps$", marks: 2 },
              { point: "Menyelesaikan aritmetikanya dengan benar", marks: 1 },
            ],
            solution:
              "Dari hubungan Vieta: $s = \\alpha+\\beta = 5$ dan $p = \\alpha\\beta = 3$.\n\nIdentitas kubik:\n\n$$\\alpha^3 + \\beta^3 = (\\alpha+\\beta)^3 - 3\\alpha\\beta(\\alpha+\\beta) = s^3 - 3ps.$$\n\nSubstitusi: $125 - 3\\cdot3\\cdot5 = 125 - 45 = \\mathbf{80}$.",
            explanation: "Perhatikan bahwa akar persamaan ini tidak bulat, sehingga mencari akarnya lebih dulu justru memperlambat dan menimbulkan pembulatan.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Tentukan semua nilai $m$ agar persamaan $x^2 - (m+1)x + 4 = 0$ mempunyai akar kembar. Tulis prosesnya, lalu tulis nilai $m$ yang positif di kotak jawaban akhir.",
            answer: "3",
            answerMarks: 1,
            rubric: [
              { point: "Memakai syarat akar kembar $D = 0$", marks: 2 },
              { point: "Menyusun dan menyelesaikan $(m+1)^2 = 16$", marks: 1 },
              { point: "Menyebut kedua nilai $m$, yaitu $3$ dan $-5$", marks: 1 },
            ],
            solution:
              "Akar kembar berarti diskriminannya nol:\n\n$$D = (m+1)^2 - 4\\cdot1\\cdot4 = 0 \\quad\\Longrightarrow\\quad (m+1)^2 = 16.$$\n\nMaka $m + 1 = 4$ atau $m + 1 = -4$, sehingga $m = 3$ atau $m = -5$.\n\nKeduanya sah; yang positif adalah $m = \\mathbf{3}$. (Periksa $m=3$: $x^2-4x+4 = (x-2)^2$, akar kembar $x=2$.)",
            explanation: "Kesalahan tersering: hanya menulis akar positif dari 16 dan melupakan $m = -5$. Skema penilaian memberi nilai untuk menyebut keduanya.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 5 ─────────────────────────────
    {
      title: "Sesi 5: Persamaan & Sifat-sifat Fungsi",
      blocks: [{ type: "PDF", dir: "olim-alj-sesi5", fileName: "OlimAlj-Sesi5-Persamaan-dan-Sifat-Fungsi.pdf" }],
      quiz: {
        title: "Latihan — Sesi 5: Persamaan & Sifat Fungsi",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Jika $f(x) = 2x + 3$, berapa $f(f(1))$?",
            answer: 13,
            explanation: "$f(1) = 5$, lalu $f(5) = 13$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Jika $g(x) = x^2 - 3x$, berapa $g(a+1)$ saat $a = 5$?",
            answer: 18,
            explanation: "$g(6) = 36 - 18 = 18$. (Bentuk umumnya $g(a+1) = a^2 - a - 2$.)",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Jika $f(x) = 2x+3$ dan $g(x) = x^2$, maka $(f\\circ g)(x)$ adalah…",
            options: ["$2x^2+3$", "$(2x+3)^2$", "$2x^2+9$", "$4x^2+9$"],
            answer: "A",
            explanation: "$(f\\circ g)(x) = f(g(x)) = f(x^2) = 2x^2+3$. Urutannya penting: $(g\\circ f)(x) = (2x+3)^2$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Jika $f(x) = x - 4$ dan $(f\\circ g)(x) = 3x + 1$, maka $g(x)$ adalah…",
            options: ["$3x+5$", "$3x-3$", "$3x-5$", "$\\frac{3x+1}{4}$"],
            answer: "A",
            explanation: "$f(g(x)) = g(x) - 4 = 3x+1$, jadi $g(x) = 3x+5$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $f(x) = \\dfrac{2x+1}{x-3}$. Berapa $f(4)$?",
            answer: 9,
            explanation: "$f(4) = \\frac{9}{1} = 9$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $f(x) = \\dfrac{2x+1}{x-3}$. Berapa $f^{-1}(9)$?",
            answer: 4,
            explanation: "Karena $f(4) = 9$, maka $f^{-1}(9) = 4$. (Inversnya $f^{-1}(x) = \\frac{3x+1}{x-2}$.)",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Manakah fungsi ganjil?",
            options: ["$f(x) = x^3$", "$f(x) = x^2$", "$f(x) = x^2 + x$", "$f(x) = |x|$"],
            answer: "A",
            explanation: "$(-x)^3 = -x^3$, jadi $f(-x) = -f(x)$. Yang lain tidak memenuhi.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Jika $f$ fungsi ganjil yang terdefinisi di $x=0$, maka…",
            options: ["$f(0) = 0$", "$f(0) = 1$", "$f(0)$ bisa berapa saja", "$f$ tidak terdefinisi di 0"],
            answer: "A",
            explanation: "Dari $f(-0) = -f(0)$ diperoleh $f(0) = -f(0)$, sehingga $2f(0) = 0$ dan $f(0)=0$.",
          },
          {
            type: "NUMERIC",
            points: 3,
            prompt:
              "Fungsi $f$ memenuhi $f(x) + 2f\\!\\left(\\dfrac1x\\right) = 3x$ untuk setiap $x \\neq 0$. Berapa $f(2)$?",
            answer: -1,
            explanation: "Substitusi $x \\to \\frac1x$ lalu eliminasi memberi $f(x) = \\frac2x - x$, sehingga $f(2) = 1 - 2 = -1$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 2,
            prompt: "Notasi $f^{-1}$ berarti…",
            options: ["fungsi invers dari $f$", "$\\frac{1}{f(x)}$", "$f$ dipangkatkan $-1$", "turunan $f$"],
            answer: "A",
            explanation: "Untuk $f(x) = 2x$: $f^{-1}(x) = \\frac x2$, sedangkan $\\frac1{f(x)} = \\frac1{2x}$ — dua hal berbeda.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Fungsi $f$ memenuhi $f(x) + 2f\\!\\left(\\dfrac1x\\right) = 3x$ untuk setiap $x \\neq 0$. Tentukan rumus $f(x)$. Tulis prosesnya, lalu tulis $f(1)$ di kotak jawaban akhir.",
            answer: "1",
            answerMarks: 1,
            rubric: [
              { point: "Mengganti $x$ dengan $\\frac1x$ untuk mendapat persamaan kedua", marks: 2 },
              { point: "Mengeliminasi $f\\left(\\frac1x\\right)$ dari kedua persamaan", marks: 2 },
              { point: "Menyimpulkan $f(x) = \\frac2x - x$ dan memeriksanya", marks: 1 },
            ],
            solution:
              "Persamaan yang diberikan:\n\n$$f(x) + 2f\\!\\left(\\tfrac1x\\right) = 3x. \\quad (i)$$\n\nGanti $x$ dengan $\\dfrac1x$:\n\n$$f\\!\\left(\\tfrac1x\\right) + 2f(x) = \\frac3x. \\quad (ii)$$\n\nKalikan (ii) dengan 2, lalu kurangi (i):\n\n$$\\bigl(2f(\\tfrac1x) + 4f(x)\\bigr) - \\bigl(f(x) + 2f(\\tfrac1x)\\bigr) = \\frac6x - 3x \\;\\Longrightarrow\\; 3f(x) = \\frac6x - 3x.$$\n\nJadi $f(x) = \\dfrac2x - x$, sehingga $f(1) = 2 - 1 = \\mathbf{1}$.\n\nPeriksa di $x=1$: $f(1) + 2f(1) = 3 = 3\\cdot1$. \u2713",
            explanation: "Teknik baku persamaan fungsional: buat persamaan kedua lewat substitusi, lalu perlakukan $f(x)$ dan $f(1/x)$ sebagai dua peubah biasa.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Diketahui $f(x) = \\dfrac{3x - 1}{x + 2}$ untuk $x \\neq -2$. Tentukan rumus $f^{-1}(x)$. Tulis prosesnya, lalu tulis nilai $f^{-1}(2)$ di kotak jawaban akhir.",
            answer: "5",
            answerMarks: 1,
            rubric: [
              { point: "Menulis $y = f(x)$ lalu mengalikan silang", marks: 1 },
              { point: "Mengumpulkan suku ber-$x$ di satu ruas dan memfaktorkannya", marks: 2 },
              { point: "Menuliskan inversnya serta syarat penyebutnya tidak nol", marks: 1 },
            ],
            solution:
              "Tulis $y = \\dfrac{3x-1}{x+2}$ lalu kalikan silang:\n\n$$y(x+2) = 3x - 1 \\;\\Longrightarrow\\; xy + 2y = 3x - 1.$$\n\nKumpulkan suku ber-$x$:\n\n$$xy - 3x = -1 - 2y \\;\\Longrightarrow\\; x(y-3) = -(1 + 2y) \\;\\Longrightarrow\\; x = \\frac{-(2y+1)}{y-3} = \\frac{2y+1}{3-y}.$$\n\nJadi $f^{-1}(x) = \\dfrac{2x+1}{3-x}$, terdefinisi untuk $x \\neq 3$.\n\nMaka $f^{-1}(2) = \\dfrac{5}{1} = \\mathbf{5}$. Periksa: $f(5) = \\dfrac{14}{7} = 2$. \u2713",
            explanation: "Langkah yang paling sering salah: mengumpulkan suku ber-$x$ dan memfaktorkannya. Memeriksa hasil dengan satu nilai, seperti di atas, menangkap kesalahan tanda.",
          },
        ],
      },
    },
  ],
};
