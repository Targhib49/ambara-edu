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
  ],
};
