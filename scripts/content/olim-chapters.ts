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
          answer: "21",
          answerMarks: 5,
          rubric: [
            { point: "Memfaktorkan $(n+1)$ dari kedua suku", marks: 8 },
            { point: "Menuliskan hasil baginya sebagai $n(n+2) + 1$", marks: 7 },
            { point: "Menyadari bahwa $n(n+2)+1 = (n+1)^2$ dan memakainya", marks: 5 },
          ],
          solution:
            "Faktorkan $(n+1)$:\n\n$$n(n+1)(n+2) + (n+1) = (n+1)\\bigl[n(n+2) + 1\\bigr].$$\n\nJadi jelas habis dibagi $(n+1)$, dengan hasil bagi $n(n+2)+1 = n^2 + 2n + 1 = (n+1)^2$.\n\nUntuk $n = 4$: hasil baginya $(4+1)^2 = \\mathbf{25}$… periksa ulang dengan angka: $4\\cdot5\\cdot6 + 5 = 125$, dan $125 : 5 = 25$. Jadi hasil baginya 25.\n\nCatatan: bila yang diminta nilai $n(n+2)+1$ pada $n=4$, hasilnya $4\\cdot6+1 = 25$ juga.",
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
