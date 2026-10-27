/**
 * Kompetisi Matematika Kelas 7 — one practice set (MASTERY) per item of the
 * semifinal syllabus ("kisi-kisi"), in the syllabus order. Read by
 * scripts/setup-komp7.ts. Every answer is recomputed in scripts/check-komp7.py.
 *
 * MASTERY is practice: one mark an item, checked instantly, so no WORKED
 * questions here — those live in the Final simulations.
 */
import type { ChapterContent } from "./math-types";

const FRAC = "Tulis pecahan sebagai a/b, misalnya 3/4.";
const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -5.";

const practice = (chapterTitle: string, questions: ChapterContent["quizzes"][number]["questions"]): ChapterContent => ({
  chapterTitle,
  archiveOnPublish: [],
  quizzes: [{ title: `Latihan — ${chapterTitle}`, style: "MASTERY", questions }],
});

export const KOMP7_OPERASI_HITUNG = practice("Operasi Hitung Bilangan", [
  { type: "NUMERIC", points: 1, prompt: "Hitung $2026 \\times 99 + 2026$.", answer: 202600, explanation: "Faktorkan: $2026 \\times (99 + 1) = 2026 \\times 100 = 202\\,600$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung $(-3)^2 - (-2)^3$.", answer: 17, explanation: "$(-3)^2 = 9$ dan $(-2)^3 = -8$, jadi $9 - (-8) = 17$." },
  { type: "NUMERIC", points: 1, prompt: `Hitung $1 - 2 + 3 - 4 + \\cdots + 99 - 100$. ${NEG}`, answer: -50, explanation: "Ada 50 pasangan $(1-2), (3-4), \\ldots, (99-100)$, masing-masing $-1$. Jumlahnya $-50$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung $12{,}5 \\times 0{,}8 \\times 25 \\times 4$.", answer: 1000, explanation: "Kelompokkan: $(12{,}5 \\times 0{,}8) \\times (25 \\times 4) = 10 \\times 100 = 1000$." },
  { type: "FRACTION", points: 1, prompt: `Hitung $\\dfrac12 + \\dfrac16 + \\dfrac1{12} + \\dfrac1{20} + \\dfrac1{30}$. ${FRAC}`, answer: "5/6", explanation: "Setiap suku $\\frac{1}{n(n+1)} = \\frac1n - \\frac1{n+1}$, jadi jumlahnya $1 - \\frac16 = \\frac56$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung $2^{10} - 2^9 - 2^8$.", answer: 256, explanation: "Faktorkan $2^8$: $2^8(4 - 2 - 1) = 2^8 = 256$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung $999 \\times 999 + 1999$.", answer: 1000000, explanation: "$999^2 + 2\\cdot999 + 1 = (999 + 1)^2 = 1\\,000\\,000$." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Bilangan manakah yang paling besar?",
    options: ["$2^{30}$", "$3^{20}$", "$5^{12}$", "$10^{9}$"],
    answer: "B",
    explanation: "Samakan pangkat 10: $2^{30} = (2^3)^{10} = 8^{10}$ dan $3^{20} = 9^{10}$, jadi $3^{20} > 2^{30}$. Lalu $5^{12} \\approx 2{,}4 \\times 10^8 < 10^9 < 9^{10} \\approx 3{,}5 \\times 10^9$.",
  },
  { type: "FRACTION", points: 1, prompt: `Hitung $\\left(1 - \\dfrac12\\right)\\left(1 - \\dfrac13\\right)\\left(1 - \\dfrac14\\right)\\cdots\\left(1 - \\dfrac1{2026}\\right)$. ${FRAC}`, answer: "1/2026", explanation: "$\\frac12\\cdot\\frac23\\cdot\\frac34\\cdots\\frac{2025}{2026}$: setiap pembilang meniadakan penyebut sebelumnya, tersisa $\\frac1{2026}$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung $0{,}25 \\times 48 + \\dfrac34 \\times 48$.", answer: 48, explanation: "$0{,}25 = \\frac14$, jadi $\\left(\\frac14 + \\frac34\\right) \\times 48 = 48$." },
]);

export const KOMP7_ALPHAMETICS = practice("Alphametics / Cryptarithm", [
  { type: "NUMERIC", points: 1, prompt: "Pada penjumlahan $\\overline{AB} + \\overline{BA} = 121$, $A$ dan $B$ angka. Berapa $A + B$?", answer: 11, explanation: "$\\overline{AB} + \\overline{BA} = 11A + 11B = 11(A + B) = 121$, jadi $A + B = 11$ — walaupun $A$ dan $B$ sendiri punya beberapa kemungkinan." },
  { type: "NUMERIC", points: 1, prompt: "Pada pengurangan $\\overline{ABC} - \\overline{CBA} = 495$, huruf berbeda mewakili angka berbeda. Berapa $A - C$?", answer: 5, explanation: "$\\overline{ABC} - \\overline{CBA} = 99A - 99C = 99(A - C)$, dan $495 = 99 \\times 5$." },
  { type: "NUMERIC", points: 1, prompt: "Pada perkalian $\\overline{AB} \\times 9 = \\overline{A0B}$, berapa bilangan $\\overline{AB}$?", answer: 45, explanation: "$9(10A + B) = 100A + B$ memberi $8B = 10A$, jadi $4B = 5A$: $A = 4$, $B = 5$. Periksa: $45 \\times 9 = 405$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\overline{ABC} + \\overline{ABC} + \\overline{ABC} = \\overline{BBB}$, huruf berbeda mewakili angka berbeda. Berapa $\\overline{ABC}$?", answer: 148, explanation: "$3\\cdot\\overline{ABC} = 111B$, jadi $\\overline{ABC} = 37B$ dan angka puluhannya harus $B$. Hanya $B = 4$ cocok: $37 \\times 4 = 148$, dan $148 \\times 3 = 444$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\overline{AA} + \\overline{BB} + \\overline{CC} = \\overline{ABC}$, huruf berbeda mewakili angka berbeda. Berapa $\\overline{ABC}$?", answer: 198, explanation: "$11(A + B + C) = 100A + 10B + C$. Jumlah tiga bilangan dua angka kurang dari 300, dan $A \\ne 0$, jadi $A = 1$. Mencoba $B$ memberi $B = 9$, $C = 8$: $11 + 99 + 88 = 198$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\overline{TO} + \\overline{GO} = \\overline{OUT}$, huruf berbeda mewakili angka berbeda. Berapa $\\overline{OUT}$?", answer: 102, explanation: "Jumlah dua bilangan dua angka kurang dari 200, jadi $O = 1$. Satuan: $O + O = T$, jadi $T = 2$. Puluhan: $T + G = 10 + U$, jadi $G = 8 + U$; $U \\ne 1$ (sudah dipakai $O$), jadi $U = 0$ dan $G = 8$: $21 + 81 = 102$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\overline{HE} \\times \\overline{HE} = \\overline{SHE}$, huruf berbeda mewakili angka berbeda. Berapa $\\overline{SHE}$?", answer: 625, explanation: "Kuadratnya berakhir dengan $\\overline{HE}$ sendiri dan masih tiga angka, jadi $\\overline{HE} \\le 31$. Hanya $25^2 = 625$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\overline{ABCD} \\times 4 = \\overline{DCBA}$, huruf berbeda mewakili angka berbeda. Berapa $\\overline{ABCD}$?", answer: 2178, explanation: "Hasilnya empat angka, jadi $A \\le 2$; dan $\\overline{DCBA}$ genap, jadi $A = 2$. Maka $D = 8$ (karena $4D$ berakhir 2 dan $D \\ge 8$). Sisanya memberi $B = 1$, $C = 7$: $2178 \\times 4 = 8712$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\text{SEND} + \\text{MORE} = \\text{MONEY}$, huruf berbeda mewakili angka berbeda dan huruf pertama tidak nol. Berapa bilangan MONEY?", answer: 10652, explanation: "$M = 1$ (simpanan terbesar), lalu $S = 9$ dan $O = 0$. Sisanya memberi $9567 + 1085 = 10\\,652$." },
  { type: "NUMERIC", points: 1, prompt: "Pada $\\text{ODD} + \\text{ODD} = \\text{EVEN}$, huruf berbeda mewakili angka berbeda dan huruf pertama tidak nol. Ada berapa kemungkinan bilangan EVEN?", answer: 2, explanation: "$E = 1$ (hasilnya empat angka), lalu $2D$ berakhir $N$ dan simpanan membuat $D = 5$, $N = 0$. Untuk $O$ ada dua pilihan: $655 + 655 = 1310$ dan $855 + 855 = 1710$. Jadi ada 2." },
]);

export const KOMP7_PERTIDAKSAMAAN = practice("Pertidaksamaan (Bilangan Rasional)", [
  { type: "NUMERIC", points: 1, prompt: "Berapa bilangan bulat terbesar $x$ yang memenuhi $3x - 5 < 2x + 4$?", answer: 8, explanation: "$x < 9$, jadi bilangan bulat terbesarnya 8 (bukan 9, karena tandanya tegas)." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa bilangan bulat $x$ yang memenuhi $-2 < 2x + 1 \\le 9$?", answer: 6, explanation: "$-3 < 2x \\le 8$, jadi $-1{,}5 < x \\le 4$: $x = -1, 0, 1, 2, 3, 4$." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Pecahan manakah yang paling kecil?",
    options: ["$\\dfrac35$", "$\\dfrac58$", "$\\dfrac7{12}$", "$\\dfrac23$"],
    answer: "C",
    explanation: "Dalam desimal: $0{,}6$; $0{,}625$; $0{,}58\\ldots$; $0{,}66\\ldots$. Atau samakan penyebut 120: $72, 75, 70, 80$.",
  },
  { type: "NUMERIC", points: 1, prompt: "Berapa bilangan bulat terkecil $x$ yang memenuhi $\\dfrac{x - 1}{2} - \\dfrac{x + 2}{3} \\ge 1$?", answer: 13, explanation: "Kalikan 6: $3x - 3 - 2x - 4 \\ge 6$, jadi $x \\ge 13$." },
  { type: "NUMERIC", points: 1, prompt: "Sebuah pecahan berpenyebut 7 terletak di antara $\\dfrac13$ dan $\\dfrac12$. Berapa pembilangnya?", answer: 3, explanation: "$\\frac13 < \\frac n7 < \\frac12$ berarti $\\frac73 < n < \\frac72$, yaitu $2{,}33 < n < 3{,}5$: $n = 3$." },
  { type: "NUMERIC", points: 1, prompt: `Berapa bilangan bulat terbesar $x$ yang memenuhi $-2x + 3 > 11$? ${NEG}`, answer: -5, explanation: "$-2x > 8$. Membagi dengan bilangan negatif membalik tanda: $x < -4$, jadi terbesarnya $-5$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa bilangan asli $n$ sehingga $\\dfrac14 < \\dfrac{n}{30} < \\dfrac25$?", answer: 4, explanation: "$7{,}5 < n < 12$, jadi $n = 8, 9, 10, 11$." },
  { type: "NUMERIC", points: 1, prompt: "Berapa jumlah semua bilangan bulat $x$ yang memenuhi $5 \\le 3x - 1 < 20$?", answer: 20, explanation: "$6 \\le 3x < 21$, jadi $2 \\le x < 7$: $2 + 3 + 4 + 5 + 6 = 20$." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Jika $a < b < 0$, pernyataan manakah yang pasti benar?",
    options: ["$a^2 > b^2$", "$\\dfrac ab < 1$", "$-a < -b$", "$a + b > 0$"],
    answer: "A",
    explanation: "Coba $a = -2$, $b = -1$: $a^2 = 4 > 1$; $\\frac ab = 2$; $-a = 2 > 1 = -b$; $a + b = -3$. Hanya A yang benar — dan itu berlaku umum karena $|a| > |b|$.",
  },
  { type: "NUMERIC", points: 1, prompt: "Harga satu tiket Rp15.000 dan ongkos parkir Rp10.000. Dengan uang Rp100.000, paling banyak berapa tiket yang bisa dibeli (sekaligus membayar parkir)?", answer: 6, explanation: "$15\\,000n + 10\\,000 \\le 100\\,000$, jadi $n \\le 6$." },
]);

export const KOMP7_PASANGAN_BULAT = practice("Pasangan Bilangan Bulat", [
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $x + y = 10$?", answer: 9, explanation: "$x = 1, 2, \\ldots, 9$ dan $y = 10 - x$. (Pasangan $(3,7)$ dan $(7,3)$ dihitung berbeda.)" },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $xy = 24$?", answer: 8, explanation: "Setiap faktor $x$ dari 24 memberi satu pasangan. 24 punya 8 faktor: 1, 2, 3, 4, 6, 8, 12, 24." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $2x + 3y = 20$?", answer: 3, explanation: "$3y$ harus genap, jadi $y$ genap: $y = 2, 4, 6$ dengan $x = 7, 4, 1$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan bulat $(x, y)$ — boleh negatif — dengan $xy = 12$?", answer: 12, explanation: "6 pasangan positif ($12$ punya 6 faktor) dan 6 pasangan yang keduanya negatif." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $x^2 - y^2 = 15$?", answer: 2, explanation: "$(x - y)(x + y) = 15$: $1\\cdot15$ memberi $(8, 7)$ dan $3\\cdot5$ memberi $(4, 1)$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $x + y = xy$?", answer: 1, explanation: "$xy - x - y + 1 = 1$, jadi $(x - 1)(y - 1) = 1$: hanya $(2, 2)$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(x, y)$ dengan $\\dfrac1x + \\dfrac1y = \\dfrac12$?", answer: 3, explanation: "Kalikan $2xy$: $2y + 2x = xy$, jadi $(x - 2)(y - 2) = 4$: $(3, 6)$, $(4, 4)$, $(6, 3)$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan asli $(a, b)$ dengan $a < b$ dan $a + b = 12$?", answer: 5, explanation: "$a = 1, 2, 3, 4, 5$ (untuk $a = 6$, $b = 6$ tidak memenuhi $a < b$)." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan bulat $(x, y)$ dengan $x^2 + y^2 = 25$?", answer: 12, explanation: "$(0, \\pm5)$, $(\\pm5, 0)$, $(\\pm3, \\pm4)$, $(\\pm4, \\pm3)$: $2 + 2 + 4 + 4 = 12$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa pasangan bilangan bulat tak negatif $(x, y)$ dengan $3x + 5y = 50$?", answer: 4, explanation: "$50 - 5y$ harus kelipatan 3, jadi $y = 1, 4, 7, 10$ dengan $x = 15, 10, 5, 0$." },
]);

export const KOMP7_PEMECAHAN_MASALAH = practice("Pemecahan Masalah (Aplikasi)", [
  { type: "NUMERIC", points: 1, prompt: "Umur ayah sekarang tiga kali umur anaknya. Dua belas tahun lagi, umur ayah dua kali umur anaknya. Berapa umur anak sekarang?", answer: 12, explanation: "Misalkan umur anak $a$: $3a + 12 = 2(a + 12)$, jadi $a = 12$." },
  { type: "NUMERIC", points: 1, prompt: "Andi menyelesaikan sebuah pekerjaan dalam 6 hari, Budi dalam 3 hari. Jika bekerja bersama, berapa hari pekerjaan itu selesai?", answer: 2, explanation: "Per hari: $\\frac16 + \\frac13 = \\frac12$ pekerjaan, jadi 2 hari." },
  { type: "NUMERIC", points: 1, prompt: "Di sebuah kandang ada ayam dan kambing dengan 20 kepala dan 56 kaki. Berapa ekor kambing?", answer: 8, explanation: "Kalau semua ayam: 40 kaki. Kelebihan $56 - 40 = 16$ kaki, setiap kambing menambah 2, jadi 8 kambing." },
  { type: "NUMERIC", points: 1, prompt: "Sepuluh orang saling berjabat tangan tepat sekali. Berapa banyak jabat tangan?", answer: 45, explanation: "$\\frac{10 \\times 9}{2} = 45$." },
  { type: "NUMERIC", points: 1, prompt: "Berapa banyak angka yang ditulis untuk memberi nomor halaman 1 sampai 120?", answer: 252, explanation: "1–9: 9 angka; 10–99: $90 \\times 2 = 180$; 100–120: $21 \\times 3 = 63$. Totalnya 252." },
  { type: "NUMERIC", points: 1, prompt: "Jumlah tiga bilangan genap berurutan adalah 78. Berapa bilangan terbesar?", answer: 28, explanation: "Bilangan tengahnya $78 : 3 = 26$, jadi ketiganya 24, 26, 28." },
  { type: "NUMERIC", points: 1, prompt: "Rata-rata lima bilangan adalah 12. Setelah satu bilangan ditambahkan, rata-ratanya menjadi 13. Berapa bilangan yang ditambahkan?", answer: 18, explanation: "Jumlah semula 60, jumlah baru $6 \\times 13 = 78$. Selisihnya 18." },
  { type: "NUMERIC", points: 1, prompt: "Berapa derajat sudut terkecil antara jarum jam dan jarum menit pada pukul 03.30?", answer: 75, explanation: "Jarum menit di $180^\\circ$. Jarum jam bergerak $0{,}5^\\circ$ per menit: $90 + 15 = 105^\\circ$. Selisihnya $75^\\circ$." },
  { type: "NUMERIC", points: 1, prompt: "Barisan $2, 6, 12, 20, 30, \\ldots$ Berapa suku ke-10?", answer: 110, explanation: "Suku ke-$n$ adalah $n(n + 1)$, jadi $10 \\times 11 = 110$." },
  { type: "NUMERIC", points: 1, prompt: "Pipa A mengisi bak dalam 4 jam, pipa B mengosongkannya dalam 6 jam. Jika keduanya dibuka bersamaan pada bak kosong, berapa jam bak itu penuh?", answer: 12, explanation: "Per jam: $\\frac14 - \\frac16 = \\frac1{12}$ bak, jadi 12 jam." },
]);

export const KOMP7_ARITMATIKA_SOSIAL = practice("Aritmatika Sosial", [
  { type: "NUMERIC", points: 1, prompt: "Harga sebuah tas Rp200.000 dan mendapat diskon 15%. Berapa rupiah harga yang dibayar?", answer: 170000, explanation: "$200\\,000 \\times 85\\% = 170\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Barang dibeli seharga Rp80.000 dan dijual Rp100.000. Berapa persen keuntungannya?", answer: 25, explanation: "Untung $20\\,000$ dari harga beli $80\\,000$: $\\frac{20\\,000}{80\\,000} = 25\\%$." },
  { type: "NUMERIC", points: 1, prompt: "Sebuah barang mendapat diskon 20%, lalu diskon tambahan 10% dari harga setelah diskon pertama. Berapa persen diskon totalnya?", answer: 28, explanation: "Yang dibayar $0{,}8 \\times 0{,}9 = 0{,}72$ dari harga awal, jadi diskon totalnya 28% — bukan 30%." },
  { type: "NUMERIC", points: 1, prompt: "Uang Rp2.000.000 ditabung dengan bunga tunggal 6% per tahun. Berapa rupiah bunganya setelah 8 bulan?", answer: 80000, explanation: "$2\\,000\\,000 \\times 6\\% \\times \\frac{8}{12} = 80\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Sebuah barang dijual Rp54.000 dengan rugi 10%. Berapa rupiah harga belinya?", answer: 60000, explanation: "Harga jual $= 90\\%$ harga beli, jadi harga beli $= 54\\,000 : 0{,}9 = 60\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Sekarung beras mempunyai bruto 50 kg dan tara 2%. Berapa kg netonya?", answer: 49, explanation: "Tara $2\\% \\times 50 = 1$ kg, neto $50 - 1 = 49$ kg." },
  { type: "NUMERIC", points: 1, prompt: "Harga sebuah barang setelah ditambah pajak 10% adalah Rp110.000. Berapa rupiah harga sebelum pajak?", answer: 100000, explanation: "$110\\,000 : 1{,}1 = 100\\,000$ — bukan $110\\,000 - 11\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Toko memberi promo “beli 3 gratis 1” untuk roti seharga Rp12.000. Berapa rupiah yang dibayar untuk mendapat 12 roti?", answer: 108000, explanation: "Setiap 4 roti hanya bayar 3. Dua belas roti = 3 kelompok, bayar $9 \\times 12\\,000 = 108\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Harga barang Rp100.000 dinaikkan 20%, lalu diturunkan 20%. Berapa rupiah harga akhirnya?", answer: 96000, explanation: "$100\\,000 \\times 1{,}2 \\times 0{,}8 = 96\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Uang Rp1.000.000 ditabung dengan bunga tunggal 5% per tahun. Setelah berapa bulan tabungannya menjadi Rp1.100.000?", answer: 24, explanation: "Bunga per tahun $1\\,000\\,000 \\times 5\\% = 50\\,000$. Bunga Rp100.000 butuh 2 tahun, yaitu 24 bulan." },
]);

export const KOMP7_KETERBAGIAN = practice("Keterbagian Bilangan Bulat", [
  { type: "NUMERIC", points: 1, prompt: "Angka $A$ membuat $\\overline{47A2}$ habis dibagi 9. Berapa $A$?", answer: 5, explanation: "$4 + 7 + A + 2 = 13 + A$ harus kelipatan 9, jadi $A = 5$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa bilangan dari 1 sampai 200 yang habis dibagi 3 atau 5?", answer: 93, explanation: "$66 + 40 - 13 = 93$ (kelipatan 15 dihitung sekali)." },
  { type: "NUMERIC", points: 1, prompt: "Berapa sisa 2026 jika dibagi 7?", answer: 3, explanation: "$7 \\times 289 = 2023$, jadi sisanya 3." },
  { type: "NUMERIC", points: 1, prompt: "Berapa bilangan empat angka terkecil yang habis dibagi 2, 3, 4, 5, dan 6?", answer: 1020, explanation: "KPK-nya 60. Kelipatan 60 terkecil yang empat angka: $60 \\times 17 = 1020$." },
  { type: "NUMERIC", points: 1, prompt: "Berapa angka satuan dari $7^{2026}$?", answer: 9, explanation: "Angka satuan $7^n$ berulang $7, 9, 3, 1$. $2026 = 4 \\times 506 + 2$, jadi angka satuannya 9." },
  { type: "NUMERIC", points: 1, prompt: "Berapa banyak faktor positif dari 72?", answer: 12, explanation: "$72 = 2^3 \\times 3^2$, jadi $(3 + 1)(2 + 1) = 12$." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Bilangan empat angka berbentuk $\\overline{abab}$ (misalnya 3737) selalu habis dibagi…",
    options: ["101", "11", "37", "9"],
    answer: "A",
    explanation: "$\\overline{abab} = \\overline{ab} \\times 101$.",
  },
  { type: "NUMERIC", points: 1, prompt: "Berapa bilangan $n$ terbesar sehingga $2^n$ membagi $20! = 1 \\times 2 \\times \\cdots \\times 20$?", answer: 18, explanation: "$\\lfloor 20/2 \\rfloor + \\lfloor 20/4 \\rfloor + \\lfloor 20/8 \\rfloor + \\lfloor 20/16 \\rfloor = 10 + 5 + 2 + 1 = 18$." },
  { type: "NUMERIC", points: 1, prompt: "Berapa sisa $3^{100}$ jika dibagi 4?", answer: 1, explanation: "$3 = 4 - 1$, jadi $3^{100}$ bersisa $(-1)^{100} = 1$." },
  { type: "NUMERIC", points: 1, prompt: "Ada berapa bilangan tiga angka yang habis dibagi 7?", answer: 128, explanation: "Dari $105 = 7 \\times 15$ sampai $994 = 7 \\times 142$: $142 - 15 + 1 = 128$." },
]);

export const KOMP7_RASIO = practice("Rasio dan Perbandingan", [
  { type: "NUMERIC", points: 1, prompt: "Diketahui $A : B = 2 : 3$ dan $B : C = 4 : 5$. Jika $C = 45$, berapa $A$?", answer: 24, explanation: "Samakan $B$: $A : B : C = 8 : 12 : 15$. $C = 45$ berarti satu bagian 3, jadi $A = 24$." },
  { type: "NUMERIC", points: 1, prompt: "Pada peta berskala $1 : 200\\,000$, jarak dua kota 3,5 cm. Berapa km jarak sebenarnya?", answer: 7, explanation: "$3{,}5 \\times 200\\,000 = 700\\,000$ cm $= 7$ km." },
  { type: "NUMERIC", points: 1, prompt: "Enam pekerja menyelesaikan sebuah pekerjaan dalam 10 hari. Berapa hari jika dikerjakan 15 pekerja?", answer: 4, explanation: "Perbandingan berbalik nilai: $6 \\times 10 = 15 \\times h$, jadi $h = 4$." },
  { type: "NUMERIC", points: 1, prompt: "Uang Rp240.000 dibagi untuk Ani dan Budi dengan perbandingan $3 : 5$. Berapa rupiah bagian Budi?", answer: 150000, explanation: "$\\frac58 \\times 240\\,000 = 150\\,000$." },
  { type: "NUMERIC", points: 1, prompt: "Resep 12 kue membutuhkan 3 butir telur. Berapa butir telur untuk 40 kue?", answer: 10, explanation: "Perbandingan senilai: $\\frac{3}{12} \\times 40 = 10$." },
  { type: "NUMERIC", points: 1, prompt: "Mobil menghabiskan 8 liter bensin untuk 100 km. Berapa liter untuk 250 km?", answer: 20, explanation: "$\\frac{8}{100} \\times 250 = 20$." },
  { type: "NUMERIC", points: 1, prompt: "Umur kakak dan adik berbanding $4 : 3$, dan jumlahnya 49 tahun. Berapa umur kakak?", answer: 28, explanation: "Satu bagian $49 : 7 = 7$, jadi kakak $4 \\times 7 = 28$." },
  { type: "NUMERIC", points: 1, prompt: "Jika $x : y = 3 : 2$, berapa nilai $\\dfrac{2x + y}{x - y}$?", answer: 8, explanation: "Ambil $x = 3k$, $y = 2k$: $\\frac{6k + 2k}{3k - 2k} = 8$." },
  { type: "NUMERIC", points: 1, prompt: "Persediaan makanan cukup untuk 12 orang selama 15 hari. Setelah 5 hari, datang 8 orang lagi. Sisa makanan cukup untuk berapa hari lagi?", answer: 6, explanation: "Sisa makanan cukup untuk $12 \\times 10 = 120$ orang-hari, dibagi 20 orang: 6 hari." },
  { type: "NUMERIC", points: 1, prompt: "Larutan garam 30 liter berkadar 20%. Berapa liter air harus ditambahkan agar kadarnya menjadi 12%?", answer: 20, explanation: "Garamnya tetap 6 liter. Agar 12%, total harus $6 : 0{,}12 = 50$ liter, jadi tambah 20 liter air." },
]);

export const KOMP7_LUAS_BERIRISAN = practice("Luas Bangun Datar yang Beririsan", [
  { type: "NUMERIC", points: 1, prompt: "Persegi bersisi 10 cm dan persegi bersisi 6 cm saling tumpang tindih, dengan daerah irisan berupa persegi bersisi 2 cm. Berapa cm² luas daerah yang tertutup oleh kedua persegi?", answer: 132, explanation: "$100 + 36 - 4 = 132$: irisan terhitung dua kali, jadi dikurangi sekali." },
  { type: "NUMERIC", points: 1, prompt: "Persegi panjang $8 \\times 5$ cm dan persegi bersisi 5 cm beririsan pada daerah $5 \\times 3$ cm. Berapa cm² luas gabungannya?", answer: 50, explanation: "$40 + 25 - 15 = 50$." },
  { type: "NUMERIC", points: 1, prompt: "Dua persegi kongruen bersisi 8 cm. Salah satu titik sudut persegi kedua tepat di pusat persegi pertama (sisi-sisinya boleh miring). Berapa cm² luas irisannya?", answer: 16, explanation: "Irisannya selalu seperempat persegi, apa pun kemiringannya: $\\frac14 \\times 64 = 16$. (Putar irisan itu: ia kongruen dengan seperempat persegi yang dibentuk dua garis tengah.)" },
  { type: "NUMERIC", points: 1, prompt: "Dua persegi panjang $10 \\times 4$ cm disusun bersilangan membentuk tanda tambah, dengan irisan persegi $4 \\times 4$ cm di tengah. Berapa cm² luas tanda tambah itu?", answer: 64, explanation: "$40 + 40 - 16 = 64$." },
  { type: "NUMERIC", points: 1, prompt: "Lingkaran berjari-jari 7 cm berada tepat di dalam persegi bersisi 14 cm (menyinggung keempat sisi). Dengan $\\pi = \\frac{22}{7}$, berapa cm² luas daerah di dalam persegi tetapi di luar lingkaran?", answer: 42, explanation: "$196 - \\frac{22}{7} \\times 49 = 196 - 154 = 42$." },
  { type: "NUMERIC", points: 1, prompt: "Dua persegi kongruen bersisi 6 cm tumpang tindih sehingga luas gabungannya 60 cm². Berapa cm² luas irisannya?", answer: 12, explanation: "$36 + 36 - \\text{irisan} = 60$, jadi irisannya 12." },
  { type: "NUMERIC", points: 1, prompt: "Persegi bersisi 10 cm dan persegi bersisi 8 cm saling tumpang tindih. Berapa cm² selisih luas bagian persegi besar yang tidak tertutup dan bagian persegi kecil yang tidak tertutup?", answer: 36, explanation: "Kedua bagian sama-sama kehilangan irisan yang sama, jadi selisihnya $100 - 64 = 36$ — luas irisan tidak perlu diketahui." },
  { type: "NUMERIC", points: 1, prompt: "Dalam persegi bersisi 14 cm digambar seperempat lingkaran berjari-jari 14 cm yang berpusat di salah satu titik sudut. Dengan $\\pi = \\frac{22}{7}$, berapa cm² luas daerah persegi di luar seperempat lingkaran?", answer: 42, explanation: "$196 - \\frac14 \\times \\frac{22}{7} \\times 196 = 196 - 154 = 42$." },
  { type: "NUMERIC", points: 1, prompt: "Persegi panjang $12 \\times 6$ cm dan segitiga beralas 12 cm (sisi panjang persegi panjang) dengan puncak pada sisi panjang yang lain. Berapa cm² luas bagian persegi panjang di luar segitiga?", answer: 36, explanation: "Luas segitiga $\\frac12 \\times 12 \\times 6 = 36$, setengah persegi panjang. Sisanya $72 - 36 = 36$." },
  { type: "NUMERIC", points: 1, prompt: "Dua lingkaran berjari-jari 7 cm dan 14 cm tumpang tindih dengan luas irisan 44 cm². Dengan $\\pi = \\frac{22}{7}$, berapa cm² luas daerah yang tertutup oleh kedua lingkaran?", answer: 726, explanation: "$154 + 616 - 44 = 726$." },
]);

export const KOMP7_JARAK_KECEPATAN = practice("Jarak, Kecepatan, dan Waktu", [
  { type: "NUMERIC", points: 1, prompt: "Mobil melaju 60 km/jam selama 2,5 jam. Berapa km jarak yang ditempuh?", answer: 150, explanation: "$60 \\times 2{,}5 = 150$." },
  { type: "NUMERIC", points: 1, prompt: "Seseorang pergi ke kota dengan kecepatan 60 km/jam dan pulang melalui jalan yang sama dengan 40 km/jam. Berapa km/jam kecepatan rata-ratanya untuk seluruh perjalanan?", answer: 48, explanation: "Misalkan jaraknya 120 km: pergi 2 jam, pulang 3 jam. Rata-rata $240 : 5 = 48$ — bukan 50." },
  { type: "NUMERIC", points: 1, prompt: "Dua mobil berangkat bersamaan dari dua kota yang berjarak 300 km dan saling mendekat dengan kecepatan 70 km/jam dan 80 km/jam. Setelah berapa jam mereka bertemu?", answer: 2, explanation: "Jarak berkurang $70 + 80 = 150$ km per jam: $300 : 150 = 2$ jam." },
  { type: "NUMERIC", points: 1, prompt: "A berangkat pukul 08.00 dengan kecepatan 40 km/jam. B menyusul dari tempat yang sama pukul 09.00 dengan 60 km/jam. Berapa jam setelah B berangkat, B menyusul A?", answer: 2, explanation: "Saat B berangkat, A sudah 40 km di depan. Selisih kecepatan 20 km/jam, jadi $40 : 20 = 2$ jam." },
  { type: "NUMERIC", points: 1, prompt: "Kereta sepanjang 200 m melaju 72 km/jam. Berapa detik yang dibutuhkan untuk melewati sebuah tiang?", answer: 10, explanation: "$72$ km/jam $= 20$ m/detik. Kereta harus menempuh panjangnya sendiri: $200 : 20 = 10$ detik." },
  { type: "NUMERIC", points: 1, prompt: "Kereta sepanjang 150 m melaju 20 m/detik melewati jembatan sepanjang 250 m. Berapa detik dari ujung depan masuk jembatan sampai ujung belakang keluar?", answer: 20, explanation: "Jarak yang ditempuh $150 + 250 = 400$ m: $400 : 20 = 20$ detik." },
  { type: "NUMERIC", points: 1, prompt: "Perahu berkecepatan 12 km/jam di air tenang, dan arus sungai 3 km/jam. Berapa jam untuk menempuh 45 km searah arus?", answer: 3, explanation: "Searah arus: $12 + 3 = 15$ km/jam. $45 : 15 = 3$ jam." },
  { type: "NUMERIC", points: 1, prompt: "Doni menempuh 10 km dalam 1,5 jam, sebagian berlari 10 km/jam dan sisanya berjalan 5 km/jam. Berapa km ia berlari?", answer: 5, explanation: "$\\frac{x}{10} + \\frac{10 - x}{5} = 1{,}5$ memberi $x = 5$." },
  { type: "NUMERIC", points: 1, prompt: "Ubah 90 km/jam menjadi meter per detik.", answer: 25, explanation: "$90 \\times \\frac{1000}{3600} = 25$ m/detik." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Bus berangkat pukul 06.45 menempuh 180 km dengan kecepatan rata-rata 60 km/jam dan beristirahat 15 menit di jalan. Pukul berapa bus tiba?",
    options: ["10.00", "09.45", "09.30", "10.15"],
    answer: "A",
    explanation: "Waktu tempuh 3 jam, ditambah istirahat 15 menit: $06.45 + 3.15 = 10.00$.",
  },
]);

export const KOMP7_LUAS_ARSIRAN = practice("Luas Arsiran Segiempat", [
  { type: "NUMERIC", points: 1, prompt: "Pada persegi $ABCD$ bersisi 12 cm, $M$ titik tengah $BC$. Berapa cm² luas segitiga $AMD$?", answer: 72, explanation: "Alas $AD = 12$ dan tingginya jarak $M$ ke $AD$, yaitu 12. Luasnya $\\frac12 \\times 12 \\times 12 = 72$ — setengah persegi." },
  { type: "NUMERIC", points: 1, prompt: "Pada persegi panjang $ABCD$ dengan $AB = 10$ cm dan $BC = 6$ cm, titik $P$ terletak di mana saja pada sisi $CD$. Berapa cm² luas segitiga $ABP$?", answer: 30, explanation: "Alas $AB = 10$, tinggi selalu 6: luasnya 30, di mana pun $P$." },
  { type: "NUMERIC", points: 1, prompt: "Titik-titik tengah keempat sisi persegi bersisi 8 cm dihubungkan membentuk persegi kecil. Berapa cm² luas persegi kecil itu?", answer: 32, explanation: "Empat segitiga pojok masing-masing $\\frac12 \\times 4 \\times 4 = 8$. Persegi kecil $64 - 32 = 32$ — setengah persegi besar." },
  { type: "NUMERIC", points: 1, prompt: "Jajargenjang beralas 12 cm dan bertinggi 7 cm dipotong salah satu diagonalnya. Berapa cm² luas salah satu segitiga yang terbentuk?", answer: 42, explanation: "Diagonal membagi jajargenjang menjadi dua segitiga kongruen: $\\frac12 \\times 84 = 42$." },
  { type: "NUMERIC", points: 1, prompt: "Trapesium mempunyai sisi sejajar 10 cm dan 6 cm serta tinggi 4 cm. Berapa cm² luasnya?", answer: 32, explanation: "$\\frac12 \\times (10 + 6) \\times 4 = 32$." },
  { type: "NUMERIC", points: 1, prompt: "Belah ketupat mempunyai diagonal 12 cm dan 16 cm. Berapa cm² luasnya?", answer: 96, explanation: "$\\frac12 \\times 12 \\times 16 = 96$." },
  { type: "NUMERIC", points: 1, prompt: "Persegi panjang $ABCD$ dengan $AB = 12$ cm dan $BC = 8$ cm. $M$ titik tengah $BC$ dan $N$ titik tengah $CD$. Berapa cm² luas segitiga $AMN$?", answer: 36, explanation: "Kurangkan tiga segitiga dari persegi panjang: $96 - 24 - 12 - 24 = 36$." },
  { type: "NUMERIC", points: 1, prompt: "Persegi $ABCD$ bersisi 10 cm, dan $E$ pada $AB$ dengan $AE = 4$ cm. Berapa cm² luas segiempat $AECD$?", answer: 70, explanation: "$AECD$ trapesium dengan sisi sejajar $AE = 4$ dan $DC = 10$, tinggi 10: $\\frac12 \\times 14 \\times 10 = 70$." },
  { type: "NUMERIC", points: 1, prompt: "Persegi bersisi 12 cm dibagi oleh kedua diagonal dan kedua garis tengahnya menjadi 8 segitiga sama besar. Empat segitiga yang berselang-seling diarsir. Berapa cm² luas arsirannya?", answer: 72, explanation: "Delapan segitiga sama luas, setengahnya diarsir: $\\frac12 \\times 144 = 72$." },
  { type: "NUMERIC", points: 1, prompt: "Persegi panjang berukuran $16 \\times 10$ cm. Sebuah jajargenjang di dalamnya punya titik sudut pada keempat sisi, sehingga di setiap pojok tersisa segitiga siku-siku dengan sisi siku-siku: $12$ dan $4$, $6$ dan $4$, $12$ dan $4$, $6$ dan $4$. Berapa cm² luas jajargenjang itu?", answer: 88, explanation: "$160 - (24 + 12 + 24 + 12) = 88$." },
]);

export const KOMP7_ALJABAR = practice("Operasi Hitung Bentuk Aljabar", [
  { type: "NUMERIC", points: 1, prompt: "Sederhanakan $3(2x - 5) - 2(x - 4)$, lalu hitung nilainya untuk $x = 5$.", answer: 13, explanation: "$6x - 15 - 2x + 8 = 4x - 7$. Untuk $x = 5$: $13$." },
  { type: "NUMERIC", points: 1, prompt: `Berapa koefisien $x$ pada hasil $(2x + 3)(x - 4)$? ${NEG}`, answer: -5, explanation: "$2x^2 - 8x + 3x - 12 = 2x^2 - 5x - 12$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung nilai $(x + 3)^2 - (x - 3)^2$ untuk $x = 7$.", answer: 84, explanation: "Selisih kuadrat: $(x + 3)^2 - (x - 3)^2 = 12x = 84$." },
  { type: "NUMERIC", points: 1, prompt: "Jika $x + y = 8$ dan $xy = 15$, berapa $x^2 + y^2$?", answer: 34, explanation: "$x^2 + y^2 = (x + y)^2 - 2xy = 64 - 30 = 34$." },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Bentuk faktor dari $x^2 - 5x + 6$ adalah…",
    options: ["$(x - 2)(x - 3)$", "$(x + 2)(x + 3)$", "$(x - 1)(x - 6)$", "$(x + 1)(x - 6)$"],
    answer: "A",
    explanation: "Cari dua bilangan yang hasil kalinya 6 dan jumlahnya $-5$: $-2$ dan $-3$.",
  },
  {
    type: "MULTIPLE_CHOICE",
    points: 1,
    prompt: "Bentuk sederhana dari $\\dfrac{6x^2y}{3xy}$ adalah…",
    options: ["$2x$", "$2xy$", "$3x$", "$2x^2$"],
    answer: "A",
    explanation: "$\\frac63 = 2$, $\\frac{x^2}{x} = x$, $\\frac yy = 1$.",
  },
  { type: "NUMERIC", points: 1, prompt: "Hitung $102^2$ dengan memakai $(a + b)^2$.", answer: 10404, explanation: "$(100 + 2)^2 = 10\\,000 + 400 + 4 = 10\\,404$." },
  { type: "NUMERIC", points: 1, prompt: "Jika $a - b = 3$ dan $a^2 - b^2 = 33$, berapa $a + b$?", answer: 11, explanation: "$a^2 - b^2 = (a - b)(a + b)$, jadi $a + b = 33 : 3 = 11$." },
  { type: "NUMERIC", points: 1, prompt: "Hitung nilai $2x^2 - 3x + 1$ untuk $x = -2$.", answer: 15, explanation: "$2 \\times 4 - 3 \\times (-2) + 1 = 8 + 6 + 1 = 15$." },
  { type: "NUMERIC", points: 1, prompt: "Jika $x + \\dfrac1x = 4$, berapa $x^2 + \\dfrac1{x^2}$?", answer: 14, explanation: "Kuadratkan: $x^2 + 2 + \\frac1{x^2} = 16$, jadi $14$." },
]);

/** Syllabus order. */
export const KOMP7_LATIHAN: ChapterContent[] = [
  KOMP7_OPERASI_HITUNG,
  KOMP7_ALPHAMETICS,
  KOMP7_PERTIDAKSAMAAN,
  KOMP7_PASANGAN_BULAT,
  KOMP7_PEMECAHAN_MASALAH,
  KOMP7_ARITMATIKA_SOSIAL,
  KOMP7_KETERBAGIAN,
  KOMP7_RASIO,
  KOMP7_LUAS_BERIRISAN,
  KOMP7_JARAK_KECEPATAN,
  KOMP7_LUAS_ARSIRAN,
  KOMP7_ALJABAR,
];
