/**
 * Persiapan Olimpiade Matematika (MS²C) — the closing sequence of each
 * chapter: three quizzes that sit on the chapter rather than on one session.
 *
 *   Latihan Penguasaan (MASTERY)  — practice, one mark an item, instant feedback
 *   Try Out Penyisihan (TRYOUT)   — 60 minutes, 100 points, prelim-shaped: quick and wide
 *   Simulasi Babak Final (EXAM)   — 60 minutes, 100 points, one attempt, mostly written out
 *
 * The split mirrors MS²C itself: a fast online preliminary, then an onsite
 * final where the working is what earns marks. Mastery holds no WORKED
 * questions — practice checks an answer on the spot and there is nothing to
 * check in a written solution.
 *
 * House rule from the Kelas VII chapters: a TRYOUT or EXAM totals exactly
 * 100 points. Every answer here was recomputed in Python.
 */
import type { ChapterContent } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -7.";
const FRAC = "Tulis pecahan sebagai a/b, misalnya 21/4.";
const DEG = "Tulis jawabannya dalam derajat, tanpa satuan.";

export const OLIM_TEORI_BILANGAN_CHAPTER: ChapterContent = {
  chapterTitle: "Teori Bilangan",
  archiveOnPublish: [],
  quizzes: [
    {
      title: "Latihan Penguasaan — Teori Bilangan",
      style: "MASTERY",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "Berapa sisa $-73$ dibagi 8?", answer: 7, explanation: "$-73 = (-10)\\cdot8 + 7$, dan $0 \\le 7 < 8$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa $\\mathrm{FPB}(96, 132)$?", answer: 12, explanation: "$132 = 1\\cdot96+36$; $96 = 2\\cdot36+24$; $36=1\\cdot24+12$; $24=2\\cdot12+0$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa $\\mathrm{KPK}(96, 132)$?", answer: 1056, explanation: "$\\frac{96\\cdot132}{12} = 1056$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak faktor positif dari 96?", answer: 12, explanation: "$96 = 2^5\\cdot3$, jadi $(5+1)(1+1) = 12$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa jumlah semua faktor positif dari 30?", answer: 72, explanation: "$30 = 2\\cdot3\\cdot5$: $(1+2)(1+3)(1+5) = 3\\cdot4\\cdot6 = 72$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa angka satuan dari $4^{2026}$?", answer: 6, explanation: "Siklus $4^n \\bmod 10$: $4, 6$. Eksponen genap memberi 6." },
        { type: "NUMERIC", points: 1, prompt: "Berapa sisa $2^{50}$ dibagi 7?", answer: 4, explanation: "$2^3 \\equiv 1 \\pmod 7$ dan $50 = 3\\cdot16+2$, jadi $\\equiv 2^2 = 4$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak bilangan dari 1 sampai 300 yang habis dibagi 12?", answer: 25, explanation: "$\\lfloor 300/12\\rfloor = 25$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa faktor prima terkecil dari 667?", answer: 23, explanation: "$667 = 23\\cdot29$; uji prima sampai $\\sqrt{667}\\approx25{,}8$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak angka nol di akhir bilangan $100!$?", answer: 24, explanation: "$\\lfloor100/5\\rfloor + \\lfloor100/25\\rfloor = 20+4 = 24$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Apakah $3x + 6y = 25$ punya solusi bilangan bulat?",
          options: ["Tidak, karena $3 \\nmid 25$", "Ya", "Hanya jika $x$ genap", "Hanya jika $y = 0$"],
          answer: "A",
          explanation: "$\\mathrm{FPB}(3,6) = 3$ dan $3 \\nmid 25$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Jumlah tiga bilangan bulat berurutan selalu habis dibagi…",
          options: ["3", "2", "6", "4"],
          answer: "A",
          explanation: "$n + (n+1) + (n+2) = 3(n+1)$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Angka $a$ berapa saja yang membuat $\\overline{51a3}$ habis dibagi 9?",
          options: ["0 atau 9", "hanya 0", "hanya 9", "3 atau 6"],
          answer: "A",
          explanation: "$5+1+a+3 = 9+a$ harus habis dibagi 9, jadi $a = 0$ atau $a = 9$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Banyaknya faktor positif suatu bilangan ganjil tepat ketika bilangan itu…",
          options: ["kuadrat sempurna", "bilangan prima", "bilangan ganjil", "kelipatan 4"],
          answer: "A",
          explanation: "Faktor berpasangan $d$ dengan $n/d$, dan pasangannya hanya tunggal saat $d = \\sqrt n$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Bilangan $\\overline{abcabc}$ selalu habis dibagi…",
          options: ["7, 11, dan 13", "3 dan 9", "2 dan 5", "17"],
          answer: "A",
          explanation: "$\\overline{abcabc} = 1001\\cdot\\overline{abc}$ dan $1001 = 7\\cdot11\\cdot13$.",
        },
        { type: "NUMERIC", points: 1, prompt: "Berapa sisa 2026 dibagi 7?", answer: 3, explanation: "$2026 = 289\\cdot7 + 3$." },
      ],
    },

    {
      title: "Try Out Penyisihan — Teori Bilangan",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "NUMERIC", points: 5, prompt: "Berapa dua angka terakhir dari $7^{2026}$?", answer: 49, explanation: "Siklus $7^n \\bmod 100$ panjang 4: $07, 49, 43, 01$. $2026 \\equiv 2 \\pmod 4$, jadi 49." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa bilangan asli $n \\le 200$ dengan $\\mathrm{FPB}(n, n+12) = 12$?", answer: 16, explanation: "FPB-nya membagi 12 dan bernilai 12 tepat saat $12 \\mid n$: ada $\\lfloor200/12\\rfloor = 16$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa banyak faktor positif dari 1260?", answer: 36, explanation: "$1260 = 2^2\\cdot3^2\\cdot5\\cdot7$: $(3)(3)(2)(2) = 36$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa bilangan asli terkecil yang mempunyai tepat 12 faktor positif?", answer: 60, explanation: "$60 = 2^2\\cdot3\\cdot5$ memberi $(3)(2)(2) = 12$; tidak ada yang lebih kecil." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $3x + 5y = 47$?", answer: 3, explanation: "$(14,1)$, $(9,4)$, $(4,7)$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa sisa $2^{2026}$ dibagi 9?", answer: 7, explanation: "$2^6 \\equiv 1 \\pmod 9$; $2026 = 6\\cdot337+4$, dan $2^4 = 16 \\equiv 7$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa bilangan dari 1 sampai 1000 yang habis dibagi 6 atau 10?", answer: 233, explanation: "$166 + 100 - 33 = 233$ (kelipatan 30 dihitung sekali)." },
        { type: "NUMERIC", points: 5, prompt: "Berapa jumlah semua faktor positif dari 100?", answer: 217, explanation: "$100 = 2^2\\cdot5^2$: $(1+2+4)(1+5+25) = 7\\cdot31 = 217$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa angka satuan dari $2^{2026} + 3^{2026}$?", answer: 3, explanation: "$2^{2026}$ berakhir 4, $3^{2026}$ berakhir 9; $4+9 = 13$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa $\\mathrm{KPK}(18, 24, 30)$?", answer: 360, explanation: "$2^3\\cdot3^2\\cdot5 = 360$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa sisa $5^{30}$ dibagi 11?", answer: 1, explanation: "Fermat: $5^{10}\\equiv1\\pmod{11}$, dan $30 = 3\\cdot10$." },
        { type: "NUMERIC", points: 5, prompt: "Bilangan $2^4\\cdot3^2\\cdot5$ punya berapa faktor genap?", answer: 24, explanation: "Semua faktor: $5\\cdot3\\cdot2 = 30$; yang ganjil $3\\cdot2 = 6$; genap $30-6 = 24$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa bilangan bulat tak negatif terkecil $x$ yang memenuhi $9x \\equiv 6 \\pmod{15}$?", answer: 4, explanation: "$\\mathrm{FPB}(9,15)=3$ membagi 6, jadi ada 3 solusi: $x \\equiv 4, 9, 14 \\pmod{15}$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa bilangan prima yang tidak lebih dari 50?", answer: 15, explanation: "2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $4x + 9y = 100$?", answer: 3, explanation: "$(25,0)$, $(16,4)$, $(7,8)$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Nilai $\\mathrm{FPB}(3n+4,\\, n+1)$ untuk setiap bilangan asli $n$ adalah…",
          options: ["selalu 1", "selalu 2", "1 atau 4", "bergantung paritas $n$"],
          answer: "A",
          explanation: "$(3n+4) - 3(n+1) = 1$, jadi pembagi bersamanya membagi 1.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Sisa kuadrat bilangan bulat jika dibagi 8 hanya mungkin…",
          options: ["0, 1, atau 4", "0 atau 1", "1, 2, atau 4", "0, 2, 4, atau 6"],
          answer: "A",
          explanation: "Periksa $x = 0..7$: kuadratnya bersisa 0, 1, 4, 1, 0, 1, 4, 1.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Bilangan bulat $n$ terkecil yang membuat $10^n + 3$ habis dibagi 13 adalah…",
          options: ["1", "2", "3", "7"],
          answer: "A",
          explanation: "$10 + 3 = 13$. (Berikutnya $n = 7$.)",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Jika $p$ prima dan $p \\nmid a$, maka menurut Teorema Kecil Fermat…",
          options: ["$a^{p-1}\\equiv1 \\pmod p$", "$a^p \\equiv a^{p-1}$", "$a^{p}\\equiv1 \\pmod p$", "$a^{p+1}\\equiv a$"],
          answer: "A",
          explanation: "Syarat $p \\nmid a$ tidak boleh dilupakan.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Mengapa $x^2 = 4y + 3$ tidak punya solusi bilangan bulat?",
          options: ["Kuadrat hanya bersisa 0 atau 1 modulo 4", "Karena 3 ganjil", "Karena $y$ harus genap", "Karena $x$ tidak bisa negatif"],
          answer: "A",
          explanation: "Ruas kanan bersisa 3 modulo 4 — mustahil untuk sebuah kuadrat.",
        },
      ],
    },

    {
      title: "Simulasi Babak Final — Teori Bilangan",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: false },
      questions: [
        { type: "NUMERIC", points: 10, prompt: "Berapa sisa $3^{100}$ dibagi 13?", answer: 3, explanation: "$3^3 = 27 \\equiv 1 \\pmod{13}$ dan $100 = 3\\cdot33+1$, jadi $\\equiv 3$." },
        { type: "NUMERIC", points: 10, prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x,y)$ dengan $7x + 11y = 100$?", answer: 1, explanation: "Hanya $(8,4)$: $56 + 44 = 100$." },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Buktikan bahwa hasil kali tiga bilangan bulat berurutan ditambah bilangan tengahnya, yaitu $n(n+1)(n+2) + (n+1)$, selalu habis dibagi $(n+1)$. Lalu tentukan hasil bagi tersebut dalam bentuk paling sederhana, dan tulis nilainya untuk $n = 4$ di kotak jawaban akhir.",
          answer: "25",
          answerMarks: 5,
          rubric: [
            { point: "Memfaktorkan $(n+1)$ dari kedua suku", marks: 8 },
            { point: "Menuliskan hasil baginya sebagai $n(n+2) + 1$", marks: 7 },
            { point: "Menyadari bahwa $n(n+2)+1 = (n+1)^2$ dan memakainya", marks: 5 },
          ],
          solution:
            "Faktorkan $(n+1)$:\n\n$$n(n+1)(n+2) + (n+1) = (n+1)\\bigl[n(n+2) + 1\\bigr].$$\n\nJadi jelas habis dibagi $(n+1)$, dengan hasil bagi $n(n+2)+1 = n^2 + 2n + 1 = (n+1)^2$.\n\nUntuk $n = 4$: hasil baginya $(4+1)^2 = \\mathbf{25}$. Cek dengan angka: $4\\cdot5\\cdot6 + 5 = 125$, dan $125 : 5 = 25$ ✓",
          explanation: "Inti soalnya memfaktorkan $(n+1)$, lalu mengenali bahwa sisanya kuadrat sempurna.",
        },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Tentukan semua bilangan asli $n \\le 100$ yang bersisa 2 jika dibagi 5 dan bersisa 3 jika dibagi 7. Tulis prosesnya, lalu tulis banyaknya bilangan seperti itu di kotak jawaban akhir.",
          answer: "3",
          answerMarks: 5,
          rubric: [
            { point: "Menuliskan kedua syarat sebagai kongruensi", marks: 5 },
            { point: "Menggabungkan keduanya menjadi satu kongruensi modulo 35", marks: 10 },
            { point: "Mendaftar semua nilai $\\le 100$ dan menghitungnya", marks: 5 },
          ],
          solution:
            "Syaratnya $n \\equiv 2 \\pmod 5$ dan $n \\equiv 3 \\pmod 7$.\n\nDari yang pertama, $n = 5k + 2$. Substitusi ke yang kedua:\n\n$$5k + 2 \\equiv 3 \\pmod 7 \\;\\Longrightarrow\\; 5k \\equiv 1 \\pmod 7.$$\n\nInvers 5 modulo 7 adalah 3 (karena $15 \\equiv 1$), jadi $k \\equiv 3 \\pmod 7$, yaitu $k = 7m + 3$.\n\nMaka $n = 5(7m+3) + 2 = 35m + 17$, artinya $n \\equiv 17 \\pmod{35}$.\n\nUntuk $n \\le 100$: $17, 52, 87$ — ada $\\mathbf{3}$ bilangan.",
          explanation: "Ini Teorema Sisa Cina dalam bentuk paling sederhana: ubah satu syarat menjadi bentuk $n = 5k+2$, lalu masukkan ke syarat kedua.",
        },
        {
          type: "WORKED",
          points: 30,
          prompt:
            "Buktikan bahwa untuk setiap bilangan asli $n$, bilangan $n^3 - n$ habis dibagi 6. Kemudian jelaskan mengapa hal itu berarti $n^3$ dan $n$ selalu bersisa sama jika dibagi 6. (Soal pembuktian.)",
          answer: "",
          answerMarks: 0,
          rubric: [
            { point: "Memfaktorkan $n^3 - n = (n-1)n(n+1)$", marks: 8 },
            { point: "Menunjukkan hasil kalinya habis dibagi 2", marks: 6 },
            { point: "Menunjukkan hasil kalinya habis dibagi 3 dengan meninjau sisa $n$", marks: 8 },
            { point: "Menyimpulkan keterbagian oleh 6 dan mengaitkannya dengan sisa $n^3$ dan $n$", marks: 8 },
          ],
          solution:
            "Faktorkan:\n\n$$n^3 - n = n(n^2-1) = (n-1)\\,n\\,(n+1),$$\n\nyaitu hasil kali tiga bilangan bulat berurutan.\n\n**Habis dibagi 2.** Di antara dua bilangan berurutan pasti ada yang genap, jadi pasti ada faktor genap.\n\n**Habis dibagi 3.** Sisa $n$ dibagi 3 hanya 0, 1, atau 2. Jika 0 maka $3 \\mid n$; jika 1 maka $3 \\mid n-1$; jika 2 maka $3 \\mid n+1$. Ketiganya menghabiskan semua kemungkinan.\n\nKarena $\\mathrm{FPB}(2,3) = 1$, hasil kalinya habis dibagi 6, sehingga $6 \\mid (n^3-n)$.\n\n**Akibatnya.** $6 \\mid (n^3 - n)$ berarti $n^3 \\equiv n \\pmod 6$, yaitu $n^3$ dan $n$ memberi sisa yang sama saat dibagi 6. $\\blacksquare$",
          explanation: "Bagian terakhir menguji apakah siswa melihat bahwa “habis dibagi 6” dan “kongruen modulo 6” adalah kalimat yang sama.",
        },
      ],
    },
  ],
};

export const OLIM_ALJABAR_CHAPTER: ChapterContent = {
  chapterTitle: "Aljabar",
  archiveOnPublish: [],
  quizzes: [
    {
      title: "Latihan Penguasaan — Aljabar",
      style: "MASTERY",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "Hitung $1003^2 - 997^2$.", answer: 12000, explanation: "$(1003-997)(1003+997) = 6\\cdot2000$." },
        { type: "NUMERIC", points: 1, prompt: "Hitung $99 \\times 101$.", answer: 9999, explanation: "$(100-1)(100+1) = 10000-1$." },
        { type: "NUMERIC", points: 1, prompt: "Jika $x + \\dfrac1x = 6$, berapa $x^2 + \\dfrac1{x^2}$?", answer: 34, explanation: "$6^2 - 2 = 34$." },
        { type: "NUMERIC", points: 1, prompt: "Jika $x + \\dfrac1x = 6$, berapa $x^3 + \\dfrac1{x^3}$?", answer: 198, explanation: "$6^3 - 3\\cdot6 = 216 - 18 = 198$." },
        { type: "NUMERIC", points: 1, prompt: "Jika $a+b = 9$ dan $ab = 20$, berapa $a^2+b^2$?", answer: 41, explanation: "$81 - 40 = 41$." },
        { type: "NUMERIC", points: 1, prompt: "Untuk $x>0$, berapa nilai terkecil $x + \\dfrac9x$?", answer: 6, explanation: "AM–GM: $2\\sqrt9 = 6$ di $x = 3$." },
        { type: "NUMERIC", points: 1, prompt: "Barisan $5, 9, 13, \\ldots$ — berapa suku ke-20?", answer: 81, explanation: "$5 + 19\\cdot4 = 81$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa jumlah 20 suku pertama barisan $5, 9, 13, \\ldots$?", answer: 860, explanation: "$\\frac{20}{2}(5+81) = 860$." },
        { type: "NUMERIC", points: 1, prompt: "Barisan geometri $2, 6, 18, \\ldots$ — berapa suku ke-7?", answer: 1458, explanation: "$2\\cdot3^6 = 1458$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa jumlah 7 suku pertama barisan $2, 6, 18, \\ldots$?", answer: 2186, explanation: "$\\frac{2(3^7-1)}{2} = 2186$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa jumlah akar-akar $x^2 - 9x + 20 = 0$?", answer: 9, explanation: "$-\\frac ba = 9$." },
        { type: "NUMERIC", points: 1, prompt: "Jika $f(x) = 3x - 2$, berapa $f(f(2))$?", answer: 10, explanation: "$f(2) = 4$, lalu $f(4) = 10$." },
        { type: "NUMERIC", points: 1, prompt: "Jika $a+b+c = 10$ dan $ab+bc+ca = 20$, berapa $a^2+b^2+c^2$?", answer: 60, explanation: "$100 - 40 = 60$." },
        { type: "NUMERIC", points: 1, prompt: "Bilangan segitiga ke-15 adalah…", answer: 120, explanation: "$\\frac{15\\cdot16}{2} = 120$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Deret geometri tak hingga $8 + 2 + \\frac12 + \\cdots$ jumlahnya…",
          options: ["$\\frac{32}{3}$", "$10$", "$16$", "tidak ada"],
          answer: "A",
          explanation: "$a = 8$, $r = \\frac14$: $\\frac{8}{3/4} = \\frac{32}{3}$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Jika $a + b + c = 0$, maka $a^3+b^3+c^3$ sama dengan…",
          options: ["$3abc$", "$0$", "$-abc$", "$abc$"],
          answer: "A",
          explanation: "Akibat langsung identitas $a^3+b^3+c^3-3abc = (a+b+c)(\\ldots)$.",
        },
      ],
    },

    {
      title: "Try Out Penyisihan — Aljabar",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "NUMERIC", points: 5, prompt: "Jika $x + \\dfrac1x = 7$, berapa $x^3 + \\dfrac1{x^3}$?", answer: 322, explanation: "$343 - 21 = 322$." },
        { type: "NUMERIC", points: 5, prompt: "Untuk $x>0$, berapa nilai terkecil dari $5x + \\dfrac{20}{x}$?", answer: 20, explanation: "AM–GM: $2\\sqrt{100} = 20$, di $x = 2$." },
        { type: "NUMERIC", points: 5, prompt: "Jika $a+b = 12$ dan $ab = 32$, berapa $a^2+b^2$?", answer: 80, explanation: "$144 - 64 = 80$." },
        { type: "NUMERIC", points: 5, prompt: "Jika $a+b = 12$ dan $ab = 32$, berapa $(a-b)^2$?", answer: 16, explanation: "$144 - 128 = 16$." },
        { type: "NUMERIC", points: 5, prompt: "Barisan aritmetika dengan $U_5 = 23$ dan $U_{12} = 58$. Berapa bedanya?", answer: 5, explanation: "$7b = 35$, jadi $b = 5$." },
        { type: "NUMERIC", points: 5, prompt: "Barisan aritmetika dengan $U_5 = 23$ dan $U_{12} = 58$. Berapa jumlah 15 suku pertamanya?", answer: 570, explanation: "$a = 3$, $b = 5$: $S_{15} = \\frac{15}{2}(6 + 70) = 570$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa jumlah 10 suku pertama barisan geometri dengan $a = 3$ dan $r = 2$?", answer: 3069, explanation: "$3(2^{10}-1) = 3\\cdot1023 = 3069$." },
        { type: "FRACTION", points: 5, prompt: `Ubah $0{,}\\overline{45}$ menjadi pecahan paling sederhana. ${FRAC}`, answer: "5/11", explanation: "$\\frac{45}{99} = \\frac{5}{11}$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa akar terbesar dari $2x^2 - 7x + 6 = 0$?", answer: 2, explanation: "Akarnya $2$ dan $\\frac32$." },
        { type: "FRACTION", points: 5, prompt: `Akar-akar $3x^2 - 6x + 2 = 0$ adalah $\\alpha,\\beta$. Berapa $\\alpha^2+\\beta^2$? ${FRAC}`, answer: "8/3", explanation: "$s = 2$, $p = \\frac23$: $4 - \\frac43 = \\frac83$." },
        { type: "NUMERIC", points: 5, prompt: "Jika $f(x) = 2x + 5$, berapa $f^{-1}(11)$?", answer: 3, explanation: "$2x+5 = 11$ memberi $x = 3$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa $1 + 2 + \\cdots + 50$?", answer: 1275, explanation: "$\\frac{50\\cdot51}{2} = 1275$." },
        { type: "NUMERIC", points: 5, prompt: "Untuk $x \\neq 0$, berapa nilai terkecil dari $x^2 + \\dfrac{25}{x^2}$?", answer: 10, explanation: "AM–GM: $2\\sqrt{25} = 10$." },
        { type: "NUMERIC", points: 5, prompt: "Jika $a,b,c>0$ dan $abc = 27$, berapa nilai terkecil $a+b+c$?", answer: 9, explanation: "AM–GM: $\\ge 3\\sqrt[3]{27} = 9$, saat $a=b=c=3$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa akar terkecil dari $x^3 - 7x + 6 = 0$?", answer: -3, explanation: `Akarnya $-3, 1, 2$. ${NEG}` },
        { type: "NUMERIC", points: 5, prompt: "Berapa jumlah deret tak hingga $12 + 4 + \\frac43 + \\cdots$?", answer: 18, explanation: "$a = 12$, $r = \\frac13$: $\\frac{12}{2/3} = 18$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa pasangan bilangan asli $(x,y)$ dengan $(x+2)(y+3) = 20$?", answer: 2, explanation: "$(x,y) = (2,2)$ dan $(3,1)$." },
        { type: "NUMERIC", points: 5, prompt: "Jika $a+b+c = 0$ dan $abc = 5$, berapa $a^3+b^3+c^3$?", answer: 15, explanation: "$a^3+b^3+c^3 = 3abc = 15$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Persamaan $x^2 - 7x + k = 0$ punya akar kembar ketika $k$ bernilai…",
          options: ["$\\frac{49}{4}$", "$7$", "$\\frac{7}{2}$", "$14$"],
          answer: "A",
          explanation: "$D = 49 - 4k = 0$ memberi $k = \\frac{49}{4}$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Untuk fungsi yang memenuhi $f(x) + 2f\\!\\left(\\frac1x\\right) = 3x$, nilai $f(3)$ adalah…",
          options: ["$-\\frac73$", "$\\frac73$", "$3$", "$-3$"],
          answer: "A",
          explanation: "$f(x) = \\frac2x - x$, jadi $f(3) = \\frac23 - 3 = -\\frac73$.",
        },
      ],
    },

    {
      title: "Simulasi Babak Final — Aljabar",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: false },
      questions: [
        { type: "NUMERIC", points: 10, prompt: "Jika $x + \\dfrac1x = 3$, berapa $x^4 + \\dfrac1{x^4}$?", answer: 47, explanation: "$x^2+\\frac1{x^2} = 7$, lalu $7^2 - 2 = 47$." },
        { type: "NUMERIC", points: 10, prompt: "Akar-akar $x^2 - 6x + 4 = 0$ adalah $\\alpha,\\beta$. Berapa $\\alpha^3+\\beta^3$?", answer: 144, explanation: "$s^3 - 3ps = 216 - 72 = 144$." },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Untuk $x > 0$, tentukan nilai terkecil dari $4x + \\dfrac{25}{x}$ beserta nilai $x$ saat tercapai. Tulis prosesnya, lalu tulis nilai terkecilnya di kotak jawaban akhir.",
          answer: "20",
          answerMarks: 5,
          rubric: [
            { point: "Memeriksa syarat AM–GM dan menyebut hasil kali kedua suku konstan", marks: 8 },
            { point: "Menerapkan AM–GM dengan benar sampai batas $2\\sqrt{100}$", marks: 7 },
            { point: "Menentukan dan memeriksa titik tercapainya, $x = \\frac52$", marks: 5 },
          ],
          solution:
            "Untuk $x>0$ kedua suku positif, dan hasil kalinya konstan:\n\n$$4x \\cdot \\frac{25}{x} = 100.$$\n\nAM–GM memberi\n\n$$4x + \\frac{25}{x} \\ge 2\\sqrt{100} = 20.$$\n\nTanda sama dengan berlaku saat $4x = \\dfrac{25}{x}$, yaitu $4x^2 = 25$ dan $x = \\dfrac52$ (ambil yang positif).\n\nPeriksa: $4\\left(\\frac52\\right) + \\frac{25}{5/2} = 10 + 10 = 20$. \u2713 Nilai terkecilnya $\\mathbf{20}$.",
          explanation: "Menyebut titik tercapainya adalah bagian dari jawaban; tanpa itu, batas bawah belum tentu dicapai.",
        },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Sebuah barisan aritmetika memenuhi $U_3 = 11$ dan $U_{10} = 46$. Tentukan jumlah 20 suku pertamanya. Tulis prosesnya, lalu tulis jumlahnya di kotak jawaban akhir.",
          answer: "970",
          answerMarks: 5,
          rubric: [
            { point: "Menyusun dua persamaan dari $U_3$ dan $U_{10}$", marks: 7 },
            { point: "Menyelesaikan untuk $b = 5$ dan $a = 1$", marks: 8 },
            { point: "Memakai rumus $S_{20}$ dan menghitungnya dengan benar", marks: 5 },
          ],
          solution:
            "$U_3 = a + 2b = 11$ dan $U_{10} = a + 9b = 46$.\n\nKurangkan: $7b = 35$, jadi $b = 5$. Substitusi: $a + 10 = 11$, jadi $a = 1$.\n\nSuku ke-20: $U_{20} = 1 + 19\\cdot5 = 96$.\n\n$$S_{20} = \\frac{20}{2}(1 + 96) = 10 \\cdot 97 = \\mathbf{970}.$$",
          explanation: "Mengurangkan kedua persamaan menghilangkan $a$ — langkah baku untuk dua suku yang diketahui.",
        },
        {
          type: "WORKED",
          points: 30,
          prompt:
            "Buktikan bahwa untuk semua bilangan real positif $a$ dan $b$ berlaku $\\dfrac{a}{b} + \\dfrac{b}{a} \\ge 2$, lalu jelaskan kapan tanda sama dengan berlaku. (Soal pembuktian.)",
          answer: "",
          answerMarks: 0,
          rubric: [
            { point: "Menyamakan penyebut menjadi $\\frac{a^2+b^2}{ab}$ atau memakai AM–GM langsung", marks: 8 },
            { point: "Memakai $a^2+b^2 \\ge 2ab$ (atau $(a-b)^2 \\ge 0$)", marks: 10 },
            { point: "Menjaga arah ketaksamaan saat membagi dengan $ab > 0$", marks: 7 },
            { point: "Menyebut tanda sama dengan berlaku tepat saat $a = b$", marks: 5 },
          ],
          solution:
            "Karena $a, b > 0$, maka $ab > 0$. Samakan penyebutnya:\n\n$$\\frac ab + \\frac ba = \\frac{a^2 + b^2}{ab}.$$\n\nDari $(a-b)^2 \\ge 0$ diperoleh $a^2 + b^2 \\ge 2ab$. Karena $ab > 0$, membagi kedua ruas dengan $ab$ tidak membalik tanda:\n\n$$\\frac{a^2+b^2}{ab} \\ge \\frac{2ab}{ab} = 2.$$\n\nJadi $\\dfrac ab + \\dfrac ba \\ge 2$. Tanda sama dengan berlaku tepat saat $(a-b)^2 = 0$, yaitu $a = b$. $\\blacksquare$",
          explanation:
            "Langkah yang dinilai paling berat adalah menyebut $ab>0$ sebelum membagi — tanpa syarat itu, arah ketaksamaannya tidak terjamin.",
        },
      ],
    },
  ],
};

export const OLIM_KOMBINATORIKA_CHAPTER: ChapterContent = {
  chapterTitle: "Kombinatorika",
  archiveOnPublish: [],
  quizzes: [
    {
      title: "Latihan Penguasaan — Kombinatorika",
      style: "MASTERY",
      questions: [
        { type: "NUMERIC", points: 1, prompt: "Berapa nilai $\\binom72$?", answer: 21, explanation: "$\\frac{7\\cdot6}{2} = 21$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa nilai $P(6,2)$?", answer: 30, explanation: "$6\\cdot5 = 30$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa nilai $\\binom97$?", answer: 36, explanation: "$\\binom97 = \\binom92 = 36$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak susunan huruf berbeda dari kata BALON?", answer: 120, explanation: "Semua hurufnya berbeda: $5! = 120$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak himpunan bagian dari himpunan beranggota 4?", answer: 16, explanation: "$2^4 = 16$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa banyak cara menyusun 5 orang mengelilingi meja bundar?", answer: 24, explanation: "$(5-1)! = 24$." },
        { type: "NUMERIC", points: 1, prompt: "Ada berapa bilangan dari 1 sampai 50 yang habis dibagi 3 atau 4?", answer: 24, explanation: "$16 + 12 - 4 = 24$." },
        { type: "NUMERIC", points: 1, prompt: "Laci berisi kaus kaki 3 warna. Paling sedikit berapa yang diambil agar dijamin ada sepasang sewarna?", answer: 4, explanation: "3 warna sebagai sarang, jadi kaus kaki ke-4 memaksa pasangan." },
        { type: "NUMERIC", points: 1, prompt: "Enam permen identik dibagikan kepada 3 anak (boleh ada yang tidak kebagian). Ada berapa cara?", answer: 28, explanation: "$\\binom{8}{2} = 28$." },
        { type: "NUMERIC", points: 1, prompt: "Lima buku berbeda dibagikan kepada 3 anak, tiap buku boleh ke siapa saja. Ada berapa cara?", answer: 243, explanation: "Buku berbeda: $3^5 = 243$ — aturan perkalian, bukan stars and bars." },
        { type: "NUMERIC", points: 1, prompt: "Sepuluh orang saling berjabat tangan sekali. Ada berapa jabat tangan?", answer: 45, explanation: "$\\binom{10}{2} = 45$." },
        { type: "FRACTION", points: 1, prompt: `Dua koin dilempar. Berapa peluang keduanya gambar? ${FRAC}`, answer: "1/4", explanation: "Satu dari empat hasil." },
        { type: "FRACTION", points: 1, prompt: `Sebuah dadu dilempar. Berapa peluang muncul mata dadu genap? ${FRAC}`, answer: "1/2", explanation: "Tiga dari enam." },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Banyaknya solusi bulat tak negatif $x_1+x_2+x_3 = n$ adalah…",
          options: ["$\\binom{n+2}{2}$", "$\\binom{n}{2}$", "$\\binom{n+2}{3}$", "$3^n$"],
          answer: "A",
          explanation: "$\\binom{n+k-1}{k-1}$ dengan $k = 3$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Peluang “paling sedikit satu” paling mudah dihitung dengan…",
          options: ["komplemen", "aturan penjumlahan", "permutasi", "mendaftar semua kasus"],
          answer: "A",
          explanation: "Komplemennya biasanya satu kasus saja.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Dengan $N$ benda di $n$ kotak, pasti ada kotak berisi paling sedikit…",
          options: ["$\\lceil N/n \\rceil$", "$\\lfloor N/n \\rfloor$", "$N-n$", "2"],
          answer: "A",
          explanation: "Bentuk umum prinsip sarang merpati.",
        },
      ],
    },

    {
      title: "Try Out Penyisihan — Kombinatorika",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "NUMERIC", points: 5, prompt: "Berapa nilai $\\binom{15}{13}$?", answer: 105, explanation: "$\\binom{15}{13} = \\binom{15}{2} = 105$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa banyak susunan huruf berbeda dari kata KOMBINATORIKA?", answer: 389188800, explanation: "13 huruf dengan K, O, I, A masing-masing dua kali: $\\frac{13!}{2!\\,2!\\,2!\\,2!} = 389.188.800$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa banyak bilangan empat angka berbeda yang dapat disusun dari angka 1, 2, 3, 4, 5?", answer: 120, explanation: "$P(5,4) = 5\\cdot4\\cdot3\\cdot2 = 120$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa bilangan dari 1 sampai 200 yang habis dibagi 4, 6, atau 9?", answer: 78, explanation: "Inklusi–eksklusi: $50+33+22-16-11-5+5 = 78$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa solusi bilangan bulat tak negatif dari $x+y+z+w = 12$?", answer: 455, explanation: "$\\binom{15}{3} = 455$." },
        { type: "NUMERIC", points: 5, prompt: "Ada berapa solusi bilangan bulat positif dari $x+y+z = 12$?", answer: 55, explanation: "$\\binom{11}{2} = 55$." },
        { type: "NUMERIC", points: 5, prompt: "Sembilan permen identik dibagikan kepada 4 anak, tiap anak paling sedikit satu. Ada berapa cara?", answer: 56, explanation: "$\\binom{8}{3} = 56$." },
        { type: "NUMERIC", points: 5, prompt: "Dari 5 putra dan 4 putri dipilih tim 3 orang dengan paling sedikit satu putri. Ada berapa cara?", answer: 74, explanation: "$\\binom93 - \\binom53 = 84 - 10 = 74$." },
        { type: "NUMERIC", points: 5, prompt: "Diketahui $|A| = 30$, $|B| = 25$, dan $|A\\cup B| = 45$. Berapa $|A\\cap B|$?", answer: 10, explanation: "$30+25-45 = 10$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa banyak himpunan bagian beranggota genap (termasuk himpunan kosong) dari himpunan beranggota 7?", answer: 64, explanation: "Separuh dari $2^7$, yaitu 64." },
        { type: "NUMERIC", points: 5, prompt: "Paling sedikit berapa kartu harus diambil dari satu set kartu (4 jenis) agar dijamin ada 3 kartu berjenis sama?", answer: 9, explanation: "Kasus terburuk 2 tiap jenis: 8 kartu; kartu ke-9 memaksa." },
        { type: "NUMERIC", points: 5, prompt: "Paling sedikit berapa bilangan bulat harus dipilih agar dijamin ada dua yang selisihnya habis dibagi 9?", answer: 10, explanation: "Sisa modulo 9 ada 9 macam." },
        { type: "NUMERIC", points: 5, prompt: "Tiga buku matematika dan tiga buku fisika disusun berjajar. Berapa banyak susunan jika ketiga buku matematika harus berdampingan?", answer: 144, explanation: "Blok matematika + 3 buku lain = 4 objek: $4!\\cdot3! = 24\\cdot6 = 144$." },
        { type: "FRACTION", points: 5, prompt: `Dua dadu dilempar. Berapa peluang jumlahnya paling sedikit 10? ${FRAC}`, answer: "1/6", explanation: "Jumlah 10, 11, 12: $3+2+1 = 6$ dari 36." },
        { type: "FRACTION", points: 5, prompt: `Tiga dadu dilempar. Berapa peluang ketiganya menunjukkan angka berbeda? ${FRAC}`, answer: "5/9", explanation: "$\\frac{6\\cdot5\\cdot4}{216} = \\frac{120}{216} = \\frac59$." },
        { type: "FRACTION", points: 5, prompt: `Tiga dadu dilempar. Berapa peluang muncul paling sedikit satu angka 6? ${FRAC}`, answer: "91/216", explanation: "$1 - \\left(\\frac56\\right)^3 = 1 - \\frac{125}{216}$." },
        { type: "FRACTION", points: 5, prompt: `Empat koin dilempar. Berapa peluang muncul tepat dua gambar? ${FRAC}`, answer: "3/8", explanation: "$\\frac{\\binom42}{16} = \\frac{6}{16} = \\frac38$." },
        { type: "FRACTION", points: 5, prompt: `Dua kartu diambil sekaligus dari 52 kartu. Berapa peluang keduanya berwarna sama? ${FRAC}`, answer: "25/51", explanation: "$\\frac{2\\binom{26}{2}}{\\binom{52}{2}} = \\frac{650}{1326} = \\frac{25}{51}$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Sepuluh bola identik dimasukkan ke 4 kotak berbeda sehingga tidak ada kotak yang kosong. Banyak caranya adalah…",
          options: ["$\\binom93$", "$\\binom{13}{3}$", "$\\binom{10}{4}$", "$4^{10}$"],
          answer: "A",
          explanation: "Bagikan 1 dulu ke tiap kotak: $\\binom{10-1}{4-1} = \\binom93 = 84$.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Lima titik di dalam persegi bersisi 2 dijamin memuat dua titik berjarak paling jauh…",
          options: ["$\\sqrt2$", "$1$", "$2$", "$\\sqrt5$"],
          answer: "A",
          explanation: "Bagi menjadi empat petak $1\\times1$; diagonal petaknya $\\sqrt2$.",
        },
      ],
    },

    {
      title: "Simulasi Babak Final — Kombinatorika",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: false },
      questions: [
        { type: "NUMERIC", points: 10, prompt: "Berapa nilai $\\binom{12}{3}$?", answer: 220, explanation: "$\\frac{12\\cdot11\\cdot10}{6} = 220$." },
        { type: "NUMERIC", points: 10, prompt: "Tujuh orang duduk mengelilingi meja bundar. Berapa banyak susunan jika dua orang tertentu tidak boleh berdampingan?", answer: 480, explanation: "Seluruhnya $6! = 720$; yang berdampingan $5!\\cdot2 = 240$; jadi $720-240 = 480$." },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Tentukan banyaknya solusi bilangan bulat dari $x + y + z = 12$ dengan $0 \\le x, y, z \\le 5$. Tulis prosesnya, lalu tulis banyaknya solusi di kotak jawaban akhir.",
          answer: "10",
          answerMarks: 5,
          rubric: [
            { point: "Menghitung solusi tanpa batas atas, $\\binom{14}{2} = 91$", marks: 6 },
            { point: "Menghitung pelanggaran satu peubah $\\ge 6$ dengan substitusi, $3\\times\\binom82 = 84$", marks: 7 },
            { point: "Menyadari dua peubah bisa melanggar bersamaan dan menambahkannya kembali, $3\\times\\binom22 = 3$", marks: 7 },
          ],
          solution:
            "**Tanpa batas.** $\\binom{12+2}{2} = \\binom{14}{2} = 91$.\n\n**Satu peubah melanggar.** Misalkan $x \\ge 6$; tulis $x = x'+6$, sehingga $x'+y+z = 6$ dengan $\\binom82 = 28$ solusi. Untuk tiga peubah: $3\\times28 = 84$.\n\n**Dua peubah melanggar.** Jika $x \\ge 6$ dan $y \\ge 6$, maka $x'+y'+z = 0$, yang punya $\\binom22 = 1$ solusi. Ada 3 pasangan peubah, jadi 3 kasus — dan kasus ini sempat dikurangi dua kali, sehingga harus ditambahkan kembali.\n\n$$91 - 84 + 3 = \\mathbf{10}.$$",
          explanation:
            "Berbeda dari contoh di sesi, di sini pelanggaran ganda **mungkin** terjadi. Melewatkannya memberi jawaban 7, bukan 10 — inilah inklusi–eksklusi yang sesungguhnya.",
        },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Sebuah kotak berisi bola dengan 5 warna berbeda. Tentukan paling sedikit berapa bola yang harus diambil agar dijamin terdapat 4 bola berwarna sama, dan jelaskan mengapa jumlah satu bola lebih sedikit belum menjamin. Tulis prosesnya, lalu tulis jawabannya di kotak jawaban akhir.",
          answer: "16",
          answerMarks: 5,
          rubric: [
            { point: "Menyebut kasus terburuk: 3 bola untuk setiap warna", marks: 7 },
            { point: "Menghitung $5\\times3 = 15$ bola tanpa ada warna yang mencapai 4", marks: 6 },
            { point: "Menjelaskan mengapa bola ke-16 pasti memaksa satu warna mencapai 4", marks: 7 },
          ],
          solution:
            "**Kasus terburuk.** Bola terambil seimbang: 3 bola untuk tiap warna, tanpa ada warna yang mencapai 4.\n\nDengan 5 warna, itu $5 \\times 3 = 15$ bola — jadi 15 bola **belum** menjamin apa pun, karena susunan itu benar-benar mungkin terjadi.\n\n**Satu bola lagi.** Bola ke-16 pasti berwarna salah satu dari kelima warna itu, dan warna mana pun yang muncul, warna tersebut menjadi $3+1 = 4$ bola.\n\nJadi paling sedikit $\\mathbf{16}$ bola. Bentuk umumnya: $n(k-1)+1$ untuk menjamin $k$ benda sewarna dari $n$ warna.",
          explanation: "Soal “dijamin” menuntut dua hal: sebuah contoh yang menunjukkan jumlah kurang satu masih gagal, dan alasan mengapa jumlah itu berhasil.",
        },
        {
          type: "WORKED",
          points: 30,
          prompt:
            "Buktikan bahwa di antara sembilan bilangan bulat sembarang, pasti ada dua bilangan yang selisihnya habis dibagi 8. Lalu jelaskan mengapa pernyataan itu gagal jika hanya ada delapan bilangan. (Soal pembuktian.)",
          answer: "",
          answerMarks: 0,
          rubric: [
            { point: "Menyebut sarangnya: delapan kemungkinan sisa pembagian oleh 8", marks: 8 },
            { point: "Menerapkan prinsip sarang merpati pada sembilan bilangan", marks: 7 },
            { point: "Menunjukkan selisih dua bilangan bersisa sama habis dibagi 8", marks: 8 },
            { point: "Memberi contoh delapan bilangan yang selisihnya tidak ada yang habis dibagi 8", marks: 7 },
          ],
          solution:
            "**Sarang.** Sisa pembagian oleh 8 hanya ada delapan: $0, 1, \\ldots, 7$.\n\n**Merpati.** Sembilan bilangan yang diberikan. Karena $9 > 8$, ada dua bilangan — sebut $a$ dan $b$ — dengan sisa sama.\n\n**Artinya.** Tulis $a = 8p + r$ dan $b = 8q + r$. Maka $a - b = 8(p - q)$, sehingga $8 \\mid (a-b)$. $\\blacksquare$\n\n**Mengapa delapan tidak cukup.** Ambil $1, 2, 3, 4, 5, 6, 7, 8$: sisanya berturut-turut $1,2,3,4,5,6,7,0$ — semuanya berbeda, jadi tidak ada dua bilangan yang bersisa sama, dan tidak ada selisih yang habis dibagi 8. Dengan delapan bilangan, sarangnya pas terisi satu-satu.",
          explanation:
            "Bagian terakhir yang membedakan pemahaman dari hafalan: prinsip ini ketat, dan satu benda lebih sedikit benar-benar membuatnya gagal.",
        },
      ],
    },
  ],
};

export const OLIM_GEOMETRI_CHAPTER: ChapterContent = {
  chapterTitle: "Geometri",
  archiveOnPublish: [],
  quizzes: [
    {
      title: "Latihan Penguasaan — Geometri",
      style: "MASTERY",
      questions: [
        { type: "NUMERIC", points: 1, prompt: `Berapa besar satu sudut dalam segi enam beraturan? ${DEG}`, answer: 120, explanation: "Sudut luarnya $\\frac{360^\\circ}{6} = 60^\\circ$, jadi sudut dalamnya $120^\\circ$." },
        { type: "NUMERIC", points: 1, prompt: `Berapa besar satu sudut luar segi dua puluh beraturan? ${DEG}`, answer: 18, explanation: "$\\frac{360^\\circ}{20} = 18^\\circ$." },
        { type: "NUMERIC", points: 1, prompt: `Berapa jumlah sudut dalam segi sepuluh? ${DEG}`, answer: 1440, explanation: "$(10-2)\\cdot180^\\circ = 1440^\\circ$." },
        { type: "NUMERIC", points: 1, prompt: `Segitiga sama kaki dengan sudut puncak $50^\\circ$. Berapa besar satu sudut alasnya? ${DEG}`, answer: 65, explanation: "$\\frac{180^\\circ-50^\\circ}{2} = 65^\\circ$." },
        { type: "NUMERIC", points: 1, prompt: "Dua segitiga sebangun dengan perbandingan sisi $3:4$. Jika luas yang kecil $27$, berapa luas yang besar?", answer: 48, explanation: "$27\\cdot\\frac{16}{9} = 48$ — luas berbanding $k^2$." },
        { type: "NUMERIC", points: 1, prompt: "Garis tinggi dari sudut siku-siku membagi sisi miring menjadi $9$ dan $16$. Berapa panjang garis tinggi itu?", answer: 12, explanation: "$h^2 = 9\\cdot16 = 144$, jadi $h = 12$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa luas segitiga bersisi $3$, $4$, $5$?", answer: 6, explanation: "Siku-siku: $\\frac{3\\cdot4}{2} = 6$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa jari-jari lingkaran dalam segitiga bersisi $3$, $4$, $5$?", answer: 1, explanation: "$r = \\frac Ls = \\frac{6}{6} = 1$." },
        { type: "NUMERIC", points: 1, prompt: `Sudut pusat menghadap sebuah busur besarnya $120^\\circ$. Berapa sudut keliling yang menghadap busur yang sama? ${DEG}`, answer: 60, explanation: "Separuh sudut pusat." },
        { type: "NUMERIC", points: 1, prompt: `Pada segi empat tali busur $ABCD$, $\\angle A = 88^\\circ$. Berapa besar $\\angle C$? ${DEG}`, answer: 92, explanation: "Sudut berhadapan berjumlah $180^\\circ$." },
        { type: "NUMERIC", points: 1, prompt: "Jari-jari sebuah lingkaran $5$ dan jarak pusat ke titik $P$ di luarnya $13$. Berapa panjang garis singgung dari $P$?", answer: 12, explanation: "$\\sqrt{169-25} = 12$." },
        { type: "FRACTION", points: 1, prompt: `Diketahui $\\sin\\theta = \\frac{5}{13}$ dengan $\\theta$ lancip. Berapa $\\cos\\theta$? ${FRAC}`, answer: "12/13", explanation: "Segitiga $5$–$12$–$13$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa luas segitiga dengan dua sisi $4$ dan $6$ yang mengapit sudut $30^\\circ$?", answer: 6, explanation: "$\\frac12\\cdot4\\cdot6\\cdot\\frac12 = 6$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa panjang diagonal ruang balok berukuran $6 \\times 8 \\times 24$?", answer: 26, explanation: "$\\sqrt{36+64+576} = \\sqrt{676} = 26$." },
        { type: "NUMERIC", points: 1, prompt: "Berapa luas trapesium dengan sisi sejajar $6$ dan $10$ serta tinggi $4$?", answer: 32, explanation: "$\\frac{(6+10)\\cdot4}{2} = 32$." },
        { type: "NUMERIC", points: 1, prompt: "Sebuah kerucut berjari-jari $9$ dengan garis pelukis $15$. Berapa tingginya?", answer: 12, explanation: "$\\sqrt{225-81} = 12$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Luas juring dengan sudut pusat $\\theta$ pada lingkaran berjari-jari $r$ adalah…",
          options: ["$\\frac{\\theta}{360^\\circ}\\pi r^2$", "$\\frac{\\theta}{360^\\circ}\\cdot2\\pi r$", "$\\frac{\\theta}{180^\\circ}\\pi r^2$", "$\\theta \\pi r^2$"],
          answer: "A",
          explanation: "Bagian sudut terhadap satu putaran penuh, dikalikan luas seluruh lingkaran.",
        },
        {
          type: "MULTIPLE_CHOICE",
          points: 1,
          prompt: "Data yang **tidak** menjamin dua segitiga kongruen adalah…",
          options: ["dua sisi dan sudut di luar keduanya", "ketiga sisi", "dua sudut dan sisi di antaranya", "dua sisi dan sudut di antaranya"],
          answer: "A",
          explanation: "“SSA” bisa dipenuhi dua segitiga yang berbeda.",
        },
      ],
    },

    {
      title: "Try Out Penyisihan — Geometri",
      style: "TRYOUT",
      settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: true },
      questions: [
        { type: "NUMERIC", points: 5, prompt: "Sebuah segi-$n$ beraturan mempunyai sudut dalam $162^\\circ$. Berapa $n$?", answer: 20, explanation: "Sudut luarnya $18^\\circ$, jadi $n = \\frac{360}{18} = 20$." },
        { type: "NUMERIC", points: 5, prompt: `Berapa jumlah seluruh sudut luar sebuah segi dua belas konveks? ${DEG}`, answer: 360, explanation: "Jumlah sudut luar segi banyak konveks selalu $360^\\circ$, berapa pun sisinya." },
        { type: "NUMERIC", points: 5, prompt: `Sudut-sudut sebuah segitiga berbanding $2 : 3 : 7$. Berapa besar sudut terbesarnya? ${DEG}`, answer: 105, explanation: "$12x = 180^\\circ$, $x = 15^\\circ$, jadi $7x = 105^\\circ$." },
        { type: "NUMERIC", points: 5, prompt: `Pada segitiga $ABC$, sudut luar di $C$ besarnya $130^\\circ$ dan $\\angle A = 55^\\circ$. Berapa $\\angle B$? ${DEG}`, answer: 75, explanation: "Sudut luar sama dengan jumlah dua sudut jauh: $130^\\circ - 55^\\circ = 75^\\circ$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa luas segitiga bersisi $10$, $17$, dan $21$?", answer: 84, explanation: "$s = 24$: $\\sqrt{24\\cdot14\\cdot7\\cdot3} = \\sqrt{7056} = 84$." },
        { type: "FRACTION", points: 5, prompt: `Berapa jari-jari lingkaran dalam segitiga bersisi $10$, $17$, $21$? ${FRAC}`, answer: "7/2", explanation: "$r = \\frac{84}{24} = \\frac72$." },
        { type: "FRACTION", points: 5, prompt: `Berapa jari-jari lingkaran luar segitiga bersisi $13$, $14$, $15$? ${FRAC}`, answer: "65/8", explanation: "$R = \\frac{abc}{4L} = \\frac{2730}{336} = \\frac{65}{8}$." },
        { type: "NUMERIC", points: 5, prompt: "Dua sisi sebuah segitiga adalah $6$ dan $9$. Ada berapa kemungkinan panjang sisi ketiga yang berupa bilangan bulat?", answer: 11, explanation: "$3 < x < 15$, jadi $x \\in \\{4, \\ldots, 14\\}$ — ada 11." },
        { type: "NUMERIC", points: 5, prompt: "Dua segitiga sebangun mempunyai luas berbanding $16 : 49$. Jika keliling yang kecil $24$, berapa keliling yang besar?", answer: 42, explanation: "$k = \\sqrt{\\frac{49}{16}} = \\frac74$, dan keliling berbanding $k$: $24\\cdot\\frac74 = 42$." },
        { type: "NUMERIC", points: 5, prompt: "Pada peta berskala $1 : 25.000$, dua kota berjarak $6$ cm. Berapa jarak sebenarnya dalam meter?", answer: 1500, explanation: "$6 \\times 25.000 = 150.000$ cm $= 1500$ m." },
        { type: "NUMERIC", points: 5, prompt: `Pada segi empat tali busur, dua sudut yang berhadapan berbanding $3 : 2$. Berapa besar sudut yang lebih besar? ${DEG}`, answer: 108, explanation: "Keduanya berjumlah $180^\\circ$: $\\frac35\\cdot180^\\circ = 108^\\circ$." },
        { type: "NUMERIC", points: 5, prompt: "Panjang garis singgung dari titik $P$ ke sebuah lingkaran berjari-jari $7$ adalah $24$. Berapa jarak $P$ ke pusat lingkaran?", answer: 25, explanation: "$\\sqrt{49+576} = \\sqrt{625} = 25$." },
        { type: "NUMERIC", points: 5, prompt: "Sebuah tali busur berjarak $8$ dari pusat lingkaran yang berjari-jari $17$. Berapa panjang tali busur itu?", answer: 30, explanation: "Setengahnya $\\sqrt{289-64} = 15$, jadi talinya $30$." },
        { type: "NUMERIC", points: 5, prompt: "Luas juring dengan sudut pusat $135^\\circ$ pada lingkaran berjari-jari $8$ dapat ditulis $k\\pi$. Berapa nilai $k$?", answer: 24, explanation: "$\\frac{135}{360}\\cdot64 = \\frac38\\cdot64 = 24$." },
        { type: "NUMERIC", points: 5, prompt: "Dua sisi sebuah segitiga adalah $7$ dan $8$ dengan sudut apit $120^\\circ$. Berapa panjang sisi ketiganya?", answer: 13, explanation: "$c^2 = 49+64+56 = 169$, jadi $c = 13$." },
        { type: "NUMERIC", points: 5, prompt: "Berapa luas segitiga dengan dua sisi $8$ dan $9$ yang mengapit sudut $150^\\circ$?", answer: 18, explanation: "$\\sin150^\\circ = \\frac12$: $\\frac12\\cdot8\\cdot9\\cdot\\frac12 = 18$." },
        { type: "NUMERIC", points: 5, prompt: "Diagonal ruang sebuah kubus panjangnya $12\\sqrt3$. Berapa volumenya?", answer: 1728, explanation: "$s\\sqrt3 = 12\\sqrt3$ memberi $s = 12$, jadi $V = 1728$." },
        { type: "NUMERIC", points: 5, prompt: "Luas permukaan kerucut berjari-jari $9$ dan bertinggi $12$ dapat ditulis $k\\pi$. Berapa nilai $k$?", answer: 216, explanation: "Garis pelukisnya $\\sqrt{81+144} = 15$, jadi $\\pi r(r+s) = \\pi\\cdot9\\cdot24 = 216\\pi$." },
        { type: "NUMERIC", points: 5, prompt: "Sebuah limas beralas persegi bersisi $8$ dengan tinggi sisi tegak $5$. Berapa volumenya?", answer: 64, explanation: "Tinggi limasnya $\\sqrt{25-16} = 3$, jadi $V = \\frac13\\cdot64\\cdot3 = 64$." },
        {
          type: "MULTIPLE_CHOICE",
          points: 5,
          prompt: "Sebuah bola pas di dalam sebuah kubus bersisi $2r$. Perbandingan volume bola terhadap volume kubus adalah…",
          options: ["$\\frac{\\pi}{6}$", "$\\frac23$", "$\\frac{\\pi}{3}$", "$\\frac{\\pi}{4}$"],
          answer: "A",
          explanation: "$\\frac{\\frac43\\pi r^3}{8r^3} = \\frac{\\pi}{6}$ — bandingkan dengan tabung, yang memberi $\\frac23$.",
        },
      ],
    },

    {
      title: "Simulasi Babak Final — Geometri",
      style: "EXAM",
      settings: { timeLimitMinutes: 60, maxAttempts: 1, randomizeQuestionOrder: false },
      questions: [
        { type: "NUMERIC", points: 10, prompt: "Berapa luas segitiga bersisi $9$, $10$, dan $17$?", answer: 36, explanation: "$s = 18$: $\\sqrt{18\\cdot9\\cdot8\\cdot1} = \\sqrt{1296} = 36$." },
        { type: "NUMERIC", points: 10, prompt: "Lingkaran berjari-jari $8$ dan jarak pusat ke titik $P$ di luarnya $17$. Berapa panjang garis singgung dari $P$?", answer: 15, explanation: "$\\sqrt{289-64} = \\sqrt{225} = 15$." },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Sebuah segitiga mempunyai sisi $13$, $14$, dan $15$. Tentukan luasnya, jari-jari lingkaran dalamnya, dan jari-jari lingkaran luarnya. Tulis prosesnya, lalu tulis **luasnya** di kotak jawaban akhir.",
          answer: "84",
          answerMarks: 5,
          rubric: [
            { point: "Menghitung $s = 21$ lalu memakai Heron untuk mendapat $L = 84$", marks: 7 },
            { point: "Memakai $L = rs$ untuk mendapat $r = 4$", marks: 6 },
            { point: "Memakai $L = \\frac{abc}{4R}$ untuk mendapat $R = \\frac{65}{8}$", marks: 7 },
          ],
          solution:
            "**Luas — Heron.**\n\n$$s = \\frac{13+14+15}{2} = 21, \\qquad L = \\sqrt{21\\cdot8\\cdot7\\cdot6} = \\sqrt{7056} = \\mathbf{84}.$$\n\n**Lingkaran dalam.** Dari $L = rs$:\n\n$$r = \\frac{84}{21} = 4.$$\n\n**Lingkaran luar.** Dari $L = \\dfrac{abc}{4R}$:\n\n$$R = \\frac{abc}{4L} = \\frac{13\\cdot14\\cdot15}{4\\cdot84} = \\frac{2730}{336} = \\frac{65}{8} = 8{,}125.$$\n\nPeriksa kewajarannya: $R > \\frac{15}{2} = 7{,}5$, sebab sisi terpanjang adalah tali busur lingkaran luar yang panjangnya tidak melebihi diameter. ✓",
          explanation:
            "Ketiga rumus luas dipakai sekaligus: satu untuk mendapatkan $L$, dua lainnya untuk membaca $r$ dan $R$ dari $L$. Bagian pemeriksaan $R > \\frac{15}{2}$ adalah kebiasaan yang membedakan jawaban yang diperiksa dari jawaban yang hanya dihitung.",
        },
        {
          type: "WORKED",
          points: 25,
          prompt:
            "Segi empat tali busur $ABCD$ mempunyai $AC$ sebagai diameter lingkarannya. Diketahui $\\angle BAC = 35^\\circ$ dan $\\angle CAD = 40^\\circ$. Tentukan $\\angle ABC$, $\\angle BCA$, $\\angle DCA$, dan $\\angle BCD$. Tulis prosesnya, lalu tulis besar $\\angle BCD$ (dalam derajat, tanpa satuan) di kotak jawaban akhir.",
          answer: "105",
          answerMarks: 5,
          rubric: [
            { point: "Menyebut $AC$ diameter, sehingga $\\angle ABC = \\angle ADC = 90^\\circ$", marks: 7 },
            { point: "Menghitung $\\angle BCA = 55^\\circ$ dan $\\angle DCA = 50^\\circ$ dari jumlah sudut kedua segitiga", marks: 7 },
            { point: "Menjumlahkan keduanya menjadi $\\angle BCD = 105^\\circ$, dan memeriksanya dengan $\\angle BAD + \\angle BCD = 180^\\circ$", marks: 6 },
          ],
          solution:
            "**Sudut pada diameter.** $B$ dan $D$ terletak pada lingkaran dan $AC$ diameter, jadi\n\n$$\\angle ABC = \\angle ADC = 90^\\circ.$$\n\n**Segitiga $ABC$.** Sudutnya $35^\\circ$, $90^\\circ$, dan $\\angle BCA$, jadi\n\n$$\\angle BCA = 180^\\circ - 90^\\circ - 35^\\circ = 55^\\circ.$$\n\n**Segitiga $ACD$.** Sudutnya $40^\\circ$, $90^\\circ$, dan $\\angle DCA$, jadi\n\n$$\\angle DCA = 180^\\circ - 90^\\circ - 40^\\circ = 50^\\circ.$$\n\n**Menggabungkan.** Karena $B$ dan $D$ berada pada sisi yang berlawanan terhadap $AC$, diagonal $AC$ terletak di dalam sudut $BCD$:\n\n$$\\angle BCD = \\angle BCA + \\angle DCA = 55^\\circ + 50^\\circ = \\mathbf{105^\\circ}.$$\n\n**Periksa.** $\\angle BAD = 35^\\circ + 40^\\circ = 75^\\circ$, dan $75^\\circ + 105^\\circ = 180^\\circ$ — sesuai sifat segi empat tali busur. ✓",
          explanation:
            "Diagonal $AC$ memecah soal menjadi dua segitiga siku-siku, masing-masing selesai dengan jumlah sudut. Pemeriksaan di akhir bukan hiasan: itu satu-satunya cara memastikan kedua bagian dijumlahkan, bukan dikurangkan.",
        },
        {
          type: "WORKED",
          points: 30,
          prompt:
            "Buktikan bahwa pada sebuah lingkaran, sudut pusat yang menghadap sebuah busur besarnya dua kali sudut keliling yang menghadap busur yang sama — untuk kasus ketika pusat lingkaran terletak di dalam sudut kelilingnya. Lalu jelaskan mengapa akibatnya semua sudut keliling yang menghadap busur yang sama besarnya sama. (Soal pembuktian.)",
          answer: "",
          answerMarks: 0,
          rubric: [
            { point: "Menarik jari-jari dari pusat ke titik sudut kelilingnya, sehingga terbentuk dua segitiga sama kaki", marks: 8 },
            { point: "Memakai sifat segitiga sama kaki dan sudut luar pada masing-masing bagian", marks: 8 },
            { point: "Menjumlahkan kedua bagian menjadi $\\angle AOB = 2\\angle ACB$", marks: 7 },
            { point: "Menyimpulkan bahwa sudut pusatnya tetap, sehingga semua sudut keliling pada busur itu sama besar", marks: 7 },
          ],
          solution:
            "Misalkan $O$ pusat lingkaran, $A$ dan $B$ ujung busurnya, dan $C$ titik pada busur yang lain, dengan $O$ di dalam $\\angle ACB$.\n\n**Membelah dengan satu jari-jari.** Tarik $CO$ dan perpanjang sampai memotong lingkaran di $D$. Garis $CD$ membelah $\\angle ACB$ menjadi $\\angle ACD$ dan $\\angle DCB$, serta membelah $\\angle AOB$ menjadi $\\angle AOD$ dan $\\angle DOB$.\n\n**Bagian pertama.** $OA = OC = r$, jadi $\\triangle OAC$ sama kaki dan $\\angle OAC = \\angle OCA = \\alpha$. Sudut $\\angle AOD$ adalah sudut luar $\\triangle OAC$ di $O$, sehingga\n\n$$\\angle AOD = \\alpha + \\alpha = 2\\alpha.$$\n\n**Bagian kedua.** Dengan cara yang sama, $OB = OC = r$ memberi $\\angle OBC = \\angle OCB = \\beta$ dan\n\n$$\\angle DOB = 2\\beta.$$\n\n**Menjumlahkan.**\n\n$$\\angle AOB = \\angle AOD + \\angle DOB = 2\\alpha + 2\\beta = 2(\\alpha+\\beta) = 2\\,\\angle ACB. \\qquad \\blacksquare$$\n\n**Akibatnya.** Sudut pusat $\\angle AOB$ ditentukan hanya oleh busur $AB$ — titik $C$ tidak muncul di dalamnya. Jadi untuk setiap pilihan $C$ pada busur yang sama,\n\n$$\\angle ACB = \\tfrac12\\angle AOB$$\n\nbernilai sama. Karena itulah semua sudut keliling yang menghadap busur yang sama besarnya sama, dan itulah alat angle chasing yang paling sering dipakai pada soal lingkaran.",
          explanation:
            "Kalimat “untuk kasus ketika pusat terletak di dalam sudutnya” sengaja disebut: masih ada dua kasus lain (pusat pada salah satu sisi, dan pusat di luar sudutnya), yang dikerjakan dengan bagian yang sama tetapi dikurangkan, bukan dijumlahkan. Menyadari adanya kasus lain sudah bernilai, walaupun di sini hanya satu yang diminta.",
        },
      ],
    },
  ],
};
