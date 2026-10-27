/**
 * Kompetisi Matematika Kelas 7 — the closing "Simulasi" chapter: two packages
 * (Paket I and II) of each round, in the competition's own format.
 *
 *   Penyisihan  30 pilihan ganda            TRYOUT, 100 poin (20 × 3 + 10 × 4)
 *   Semifinal   10 pilihan ganda + 5 isian  TRYOUT, 100 poin (10 × 5 + 5 × 10)
 *   Final       5 uraian                    EXAM,   100 poin (5 × 20), one attempt
 *
 * The competition only published the semifinal syllabus, so every round draws
 * on it. Time limits are our best guess until the official rules say otherwise.
 * Every answer is recomputed in scripts/check-komp7.py.
 */
import type { ChapterContent, Question } from "./math-types";

const NEG = "Tulis bilangan negatif dengan tanda minus, misalnya -5.";

type Opt = [string, string, string, string];
const pg = (points: number, prompt: string, options: Opt, answer: "A" | "B" | "C" | "D", explanation: string): Question => ({
  type: "MULTIPLE_CHOICE",
  points,
  prompt,
  options,
  answer,
  explanation,
});
const isian = (points: number, prompt: string, answer: number, explanation: string): Question => ({ type: "NUMERIC", points, prompt, answer, explanation });

// ------------------------------------------------------------------ Penyisihan

const PENYISIHAN_1: Question[] = [
  pg(3, "Hasil dari $25 \\times 36 \\times 4 : 9$ adalah…", ["360", "400", "900", "3600"], "B", "Kelompokkan: $(25 \\times 4) \\times (36 : 9) = 100 \\times 4 = 400$."),
  pg(3, "Hasil dari $-8 + 12 : (-4) \\times 3$ adalah…", ["$1$", "$-17$", "$-11$", "$-5$"], "B", "Kali dan bagi dulu, dari kiri: $12 : (-4) = -3$, lalu $-3 \\times 3 = -9$. Jadi $-8 - 9 = -17$."),
  pg(3, "Hasil dari $\\dfrac23 + \\dfrac34 - \\dfrac56$ adalah…", ["$\\dfrac5{12}$", "$\\dfrac12$", "$\\dfrac23$", "$\\dfrac7{12}$"], "D", "Penyebut 12: $\\frac{8 + 9 - 10}{12} = \\frac7{12}$."),
  pg(3, "Hasil dari $1{,}5 \\times 2{,}4 + 1{,}5 \\times 7{,}6$ adalah…", ["12", "15", "18", "150"], "B", "Faktorkan $1{,}5$: $1{,}5 \\times (2{,}4 + 7{,}6) = 1{,}5 \\times 10 = 15$."),
  pg(4, "Pada penjumlahan $\\overline{A3} + \\overline{5B} = 100$, $A$ dan $B$ angka. Nilai $A + B$ adalah…", ["9", "10", "12", "11"], "D", "Satuan: $3 + B = 10$, jadi $B = 7$ dengan simpanan 1. Puluhan: $A + 5 + 1 = 10$, jadi $A = 4$. $A + B = 11$."),
  pg(4, "Pada perkalian $\\overline{A5} \\times 5 = \\overline{3A5}$, nilai $A$ adalah…", ["7", "4", "5", "6"], "A", "$5(10A + 5) = 305 + 10A$ memberi $40A = 280$, jadi $A = 7$. Periksa: $75 \\times 5 = 375$."),
  pg(3, "Banyak bilangan bulat $x$ yang memenuhi $-3 \\le 2x - 1 < 7$ adalah…", ["4", "5", "6", "7"], "B", "$-2 \\le 2x < 8$, jadi $-1 \\le x < 4$: $-1, 0, 1, 2, 3$."),
  pg(3, "Pecahan yang paling besar adalah…", ["$\\dfrac35$", "$\\dfrac47$", "$\\dfrac59$", "$\\dfrac7{12}$"], "A", "Dalam desimal: $0{,}571$; $0{,}556$; $0{,}6$; $0{,}583$."),
  pg(3, "Banyak pasangan bilangan asli $(x, y)$ yang memenuhi $xy = 36$ adalah…", ["6", "9", "8", "10"], "B", "Satu pasangan untuk setiap faktor $x$ dari 36. $36 = 2^2 \\cdot 3^2$ punya $3 \\cdot 3 = 9$ faktor."),
  pg(3, "Banyak pasangan bilangan bulat tak negatif $(x, y)$ yang memenuhi $2x + 5y = 30$ adalah…", ["4", "3", "5", "6"], "A", "$5y$ harus genap, jadi $y = 0, 2, 4, 6$ dengan $x = 15, 10, 5, 0$."),
  pg(3, "Jumlah lima bilangan ganjil berurutan adalah 85. Bilangan terbesarnya adalah…", ["19", "23", "25", "21"], "D", "Bilangan tengahnya $85 : 5 = 17$, jadi kelimanya 13, 15, 17, 19, 21."),
  pg(4, "Umur ayah sekarang empat kali umur anaknya. Lima tahun yang lalu, umur ayah sembilan kali umur anaknya. Umur ayah sekarang adalah…", ["40 tahun", "36 tahun", "32 tahun", "28 tahun"], "C", "Misalkan umur anak $a$: $4a - 5 = 9(a - 5)$, jadi $5a = 40$, $a = 8$. Ayah $32$ tahun."),
  pg(4, "Banyak angka 1 yang ditulis ketika menuliskan bilangan 1 sampai 100 adalah…", ["20", "19", "21", "22"], "C", "Angka satuan 1: 10 kali (1, 11, …, 91). Angka puluhan 1: 10 kali (10–19). Ditambah satu dari 100. Totalnya 21."),
  pg(3, "Harga sebuah sepatu Rp160.000 mendapat diskon 25%. Harga yang harus dibayar adalah…", ["Rp125.000", "Rp135.000", "Rp120.000", "Rp40.000"], "C", "$160\\,000 \\times 75\\% = 120\\,000$."),
  pg(3, "Sebuah barang dijual Rp84.000 dengan untung 20%. Harga belinya adalah…", ["Rp64.000", "Rp67.200", "Rp72.000", "Rp70.000"], "D", "Harga jual $= 120\\%$ harga beli: $84\\,000 : 1{,}2 = 70\\,000$. (Rp67.200 adalah jebakan: $84\\,000 - 20\\% \\times 84\\,000$.)"),
  pg(4, "Uang Rp1.500.000 ditabung dengan bunga tunggal 8% per tahun. Setelah 9 bulan, besar tabungannya adalah…", ["Rp1.590.000", "Rp1.620.000", "Rp1.608.000", "Rp1.560.000"], "A", "Bunga $1\\,500\\,000 \\times 8\\% \\times \\frac9{12} = 90\\,000$."),
  pg(3, "Sisa pembagian $2^{2026}$ oleh 3 adalah…", ["0", "2", "tidak dapat ditentukan", "1"], "D", "$2 = 3 - 1$, jadi $2^{2026}$ bersisa $(-1)^{2026} = 1$."),
  pg(4, "Banyak bilangan dari 1 sampai 100 yang tidak habis dibagi 2 maupun 3 adalah…", ["34", "32", "33", "50"], "C", "Habis dibagi 2 atau 3: $50 + 33 - 16 = 67$. Sisanya $100 - 67 = 33$."),
  pg(3, "Banyak angka $a$ yang membuat bilangan $\\overline{3a5}$ habis dibagi 15 adalah…", ["3", "1", "2", "4"], "A", "Sudah habis dibagi 5. Habis dibagi 3 jika $3 + a + 5$ kelipatan 3: $a = 1, 4, 7$."),
  pg(3, "Perbandingan kelereng Andi dan Budi $5 : 3$, dan selisihnya 18. Jumlah kelereng mereka adalah…", ["48", "72", "54", "90"], "B", "Selisih 2 bagian $= 18$, jadi 1 bagian $= 9$. Jumlahnya $8 \\times 9 = 72$."),
  pg(4, "Sebuah pekerjaan selesai dalam 15 hari oleh 8 pekerja. Agar selesai dalam 12 hari, banyak pekerja tambahan yang diperlukan adalah…", ["1", "3", "2", "4"], "C", "Berbalik nilai: $8 \\times 15 = n \\times 12$, jadi $n = 10$. Tambahan 2 pekerja."),
  pg(3, "Jarak sebenarnya dua kota 40 km. Pada peta berskala $1 : 250\\,000$, jaraknya adalah…", ["10 cm", "160 cm", "1,6 cm", "16 cm"], "D", "$4\\,000\\,000 \\text{ cm} : 250\\,000 = 16$ cm."),
  pg(3, "Persegi bersisi 9 cm dan persegi bersisi 5 cm tumpang tindih dengan luas irisan 6 cm². Luas daerah yang tertutup kedua persegi adalah…", ["106 cm²", "94 cm²", "112 cm²", "100 cm²"], "D", "$81 + 25 - 6 = 100$."),
  pg(4, "Persegi panjang $12 \\times 8$ cm dan persegi bersisi 7 cm tumpang tindih. Selisih luas bagian persegi panjang yang tidak tertutup dan bagian persegi yang tidak tertutup adalah…", ["45 cm²", "47 cm²", "49 cm²", "96 cm²"], "B", "Keduanya kehilangan irisan yang sama, jadi selisihnya $96 - 49 = 47$."),
  pg(3, "Sebuah motor melaju 45 km/jam selama 40 menit. Jarak yang ditempuh adalah…", ["18 km", "25 km", "30 km", "45 km"], "C", "$45 \\times \\frac{40}{60} = 30$ km."),
  pg(3, "Dua pelari mulai dari titik yang sama pada lintasan melingkar 400 m dan berlari berlawanan arah dengan kecepatan 3 m/detik dan 5 m/detik. Mereka pertama kali bertemu setelah…", ["80 detik", "50 detik", "100 detik", "200 detik"], "B", "Berlawanan arah, jarak ditutup $3 + 5 = 8$ m/detik. Mereka bertemu saat bersama-sama menempuh 400 m: 50 detik."),
  pg(4, "Persegi $ABCD$ bersisi 10 cm. $M$ titik tengah $BC$ dan $N$ titik tengah $CD$. Luas segitiga $AMN$ adalah…", ["37,5 cm²", "40 cm²", "50 cm²", "25 cm²"], "A", "$100 - 25 - 12{,}5 - 25 = 37{,}5$."),
  pg(3, "Trapesium siku-siku mempunyai sisi sejajar 8 cm dan 14 cm serta tinggi 6 cm. Luasnya adalah…", ["66 cm²", "84 cm²", "48 cm²", "132 cm²"], "A", "$\\frac12 \\times 22 \\times 6 = 66$."),
  pg(3, "Koefisien $x$ pada hasil $(3x - 2)(2x + 5)$ adalah…", ["11", "19", "$-11$", "6"], "A", "$6x^2 + 15x - 4x - 10 = 6x^2 + 11x - 10$."),
  pg(4, "Jika $a + b = 10$ dan $ab = 21$, nilai $a^2 + b^2$ adalah…", ["79", "100", "58", "42"], "C", "$a^2 + b^2 = (a + b)^2 - 2ab = 100 - 42 = 58$."),
];

const PENYISIHAN_2: Question[] = [
  pg(3, "Hasil dari $125 \\times 32 \\times 25$ adalah…", ["10.000", "1.000.000", "80.000", "100.000"], "D", "$32 = 8 \\times 4$: $(125 \\times 8) \\times (4 \\times 25) = 1000 \\times 100 = 100\\,000$."),
  pg(3, "Hasil dari $(-2)^4 - 3 \\times (-5) + (-1)^{2027}$ adalah…", ["32", "0", "30", "2"], "C", "$16 + 15 - 1 = 30$."),
  pg(3, "Hasil dari $\\dfrac38 : \\dfrac9{16} \\times \\dfrac34$ adalah…", ["$\\dfrac29$", "$\\dfrac9{32}$", "$2$", "$\\dfrac12$"], "D", "Dari kiri: $\\frac38 \\times \\frac{16}9 = \\frac23$, lalu $\\frac23 \\times \\frac34 = \\frac12$."),
  pg(4, "Nilai dari $\\dfrac{2027^2 - 2025^2}{4052}$ adalah…", ["1", "2", "4052", "2026"], "B", "Selisih kuadrat: $(2027 - 2025)(2027 + 2025) = 2 \\times 4052$, jadi hasilnya 2."),
  pg(4, "Pada pengurangan $\\overline{AB} - \\overline{BA} = 54$, $A$ dan $B$ angka tidak nol. Banyak bilangan $\\overline{AB}$ yang mungkin adalah…", ["2", "4", "3", "6"], "C", "$9(A - B) = 54$, jadi $A - B = 6$: $71, 82, 93$. ($60$ tidak boleh karena $B \\ne 0$.)"),
  pg(4, "Pada perkalian $\\overline{AB} \\times \\overline{BA} = 2268$, $A$ dan $B$ angka. Nilai $A + B$ adalah…", ["9", "8", "10", "12"], "A", "$2268 = 36 \\times 63$, jadi $\\{A, B\\} = \\{3, 6\\}$ — kedua urutan memberi $A + B = 9$."),
  pg(3, "Bilangan bulat terbesar $x$ yang memenuhi $\\dfrac{2x + 1}{3} < \\dfrac{x + 5}{2}$ adalah…", ["11", "13", "14", "12"], "D", "Kalikan 6: $4x + 2 < 3x + 15$, jadi $x < 13$."),
  pg(4, "Banyak bilangan asli $n$ yang memenuhi $\\dfrac{n}{n + 1} < \\dfrac56$ adalah…", ["4", "3", "5", "6"], "A", "$6n < 5n + 5$, jadi $n < 5$: $n = 1, 2, 3, 4$."),
  pg(3, "Banyak pasangan bilangan bulat $(x, y)$ — boleh negatif — yang memenuhi $xy = 18$ adalah…", ["6", "9", "12", "18"], "C", "6 pasangan positif dan 6 pasangan negatif."),
  pg(4, "Banyak pasangan bilangan asli $(x, y)$ yang memenuhi $x^2 - y^2 = 24$ adalah…", ["1", "3", "4", "2"], "D", "$(x - y)(x + y) = 24$ dengan kedua faktor genap: $2 \\cdot 12$ memberi $(7, 5)$, $4 \\cdot 6$ memberi $(5, 1)$."),
  pg(3, "Di peternakan ada ayam dan kelinci dengan 30 kepala dan 80 kaki. Banyak kelinci adalah…", ["10", "15", "20", "12"], "A", "Kalau semuanya ayam: 60 kaki. Kelebihan 20 kaki, setiap kelinci menambah 2: 10 kelinci."),
  pg(3, "Andi menyelesaikan pekerjaan dalam 10 hari dan Budi dalam 15 hari. Jika bekerja bersama, pekerjaan selesai dalam…", ["5 hari", "12 hari", "6 hari", "25 hari"], "C", "$\\frac1{10} + \\frac1{15} = \\frac16$ pekerjaan per hari."),
  pg(4, "Besar sudut terkecil antara jarum jam dan jarum menit pada pukul 08.20 adalah…", ["$130^\\circ$", "$120^\\circ$", "$140^\\circ$", "$150^\\circ$"], "A", "Jarum menit $120^\\circ$. Jarum jam $240^\\circ + 20 \\times 0{,}5^\\circ = 250^\\circ$. Selisihnya $130^\\circ$."),
  pg(3, "Setelah mendapat diskon 30%, harga sebuah barang Rp140.000. Harga sebelum diskon adalah…", ["Rp200.000", "Rp182.000", "Rp210.000", "Rp170.000"], "A", "$140\\,000 : 0{,}7 = 200\\,000$."),
  pg(4, "Pedagang membeli satu lusin pensil seharga Rp30.000 dan menjualnya Rp2.000 per batang. Pedagang itu mengalami…", ["rugi 20%", "untung 20%", "rugi 25%", "untung 25%"], "A", "Hasil penjualan $12 \\times 2000 = 24\\,000$. Rugi $6000$ dari $30\\,000$, yaitu 20%."),
  pg(3, "Lima karung beras masing-masing berbruto 80 kg dengan tara 2,5%. Neto seluruhnya adalah…", ["380 kg", "390 kg", "395 kg", "400 kg"], "B", "Bruto $400$ kg, tara $10$ kg, neto $390$ kg."),
  pg(3, "Banyak faktor positif dari 180 adalah…", ["12", "18", "16", "24"], "B", "$180 = 2^2 \\cdot 3^2 \\cdot 5$: $3 \\cdot 3 \\cdot 2 = 18$."),
  pg(3, "Angka satuan dari $3^{2027}$ adalah…", ["1", "3", "9", "7"], "D", "Siklus $3, 9, 7, 1$. $2027 = 4 \\times 506 + 3$, jadi angka satuannya 7."),
  pg(4, "Bilangan asli terkecil lebih dari 1 yang bersisa 1 jika dibagi 2, 3, 4, 5, maupun 6 adalah…", ["31", "121", "59", "61"], "D", "$n - 1$ kelipatan KPK$(2,3,4,5,6) = 60$, jadi $n = 61$."),
  pg(3, "Uang Rp500.000 dibagi kepada A, B, C dengan perbandingan $2 : 3 : 5$. Selisih bagian C dan A adalah…", ["Rp100.000", "Rp250.000", "Rp150.000", "Rp300.000"], "C", "Satu bagian Rp50.000. Selisih 3 bagian: Rp150.000."),
  pg(3, "Perjalanan dengan kecepatan 60 km/jam memakan waktu 4 jam. Agar hanya 3 jam, kecepatannya harus…", ["70 km/jam", "80 km/jam", "75 km/jam", "90 km/jam"], "B", "Jaraknya 240 km. $240 : 3 = 80$."),
  pg(3, "Kopi 2 kg seharga Rp60.000/kg dicampur dengan kopi 3 kg seharga Rp40.000/kg. Harga campuran per kg adalah…", ["Rp50.000", "Rp48.000", "Rp45.000", "Rp52.000"], "B", "$\\frac{120\\,000 + 120\\,000}{5} = 48\\,000$."),
  pg(3, "Dua lingkaran berjari-jari 7 cm beririsan dengan luas irisan 20 cm². Dengan $\\pi = \\frac{22}{7}$, luas daerah yang tertutup kedua lingkaran adalah…", ["288 cm²", "308 cm²", "268 cm²", "328 cm²"], "A", "$154 + 154 - 20 = 288$."),
  pg(3, "Dua persegi panjang kongruen berukuran $6 \\times 4$ cm tumpang tindih sehingga luas gabungannya 40 cm². Luas irisannya adalah…", ["10 cm²", "8 cm²", "6 cm²", "12 cm²"], "B", "$24 + 24 - \\text{irisan} = 40$."),
  pg(3, "Sebuah mobil melaju 2 jam dengan kecepatan 50 km/jam, lalu 3 jam dengan 60 km/jam. Kecepatan rata-ratanya adalah…", ["55 km/jam", "57 km/jam", "56 km/jam", "58 km/jam"], "C", "Jarak total $100 + 180 = 280$ km dalam 5 jam: 56 km/jam."),
  pg(4, "Kereta sepanjang 300 m melewati terowongan sepanjang 900 m dalam 60 detik (dari ujung depan masuk sampai ujung belakang keluar). Kecepatan kereta adalah…", ["54 km/jam", "60 km/jam", "90 km/jam", "72 km/jam"], "D", "Jarak $1200$ m dalam 60 detik $= 20$ m/detik $= 72$ km/jam."),
  pg(3, "Persegi $ABCD$ bersisi 8 cm dan $E$ titik tengah $AB$. Luas daerah persegi di luar segitiga $ECD$ adalah…", ["16 cm²", "32 cm²", "24 cm²", "48 cm²"], "B", "Segitiga $ECD$ beralas 8 dan bertinggi 8: luasnya 32, setengah persegi. Sisanya juga 32."),
  pg(3, "Layang-layang mempunyai diagonal 10 cm dan 18 cm. Luasnya adalah…", ["90 cm²", "180 cm²", "45 cm²", "112 cm²"], "A", "$\\frac12 \\times 10 \\times 18 = 90$."),
  pg(3, "Nilai $(x + 2)^2 - (x - 1)(x + 1)$ untuk $x = 3$ adalah…", ["15", "17", "19", "21"], "B", "Sederhanakan: $x^2 + 4x + 4 - x^2 + 1 = 4x + 5 = 17$."),
  pg(4, "Jika $x - \\dfrac1x = 3$, nilai $x^2 + \\dfrac1{x^2}$ adalah…", ["7", "9", "11", "13"], "C", "Kuadratkan: $x^2 - 2 + \\frac1{x^2} = 9$, jadi $11$."),
];

// ------------------------------------------------------------------ Semifinal

const SEMIFINAL_1: Question[] = [
  pg(5, "Nilai $\\dfrac{1}{1\\cdot3} + \\dfrac{1}{3\\cdot5} + \\cdots + \\dfrac{1}{19\\cdot21}$ adalah…", ["$\\dfrac{20}{21}$", "$\\dfrac12$", "$\\dfrac{11}{21}$", "$\\dfrac{10}{21}$"], "D", "$\\frac{1}{n(n+2)} = \\frac12\\left(\\frac1n - \\frac1{n+2}\\right)$, jadi jumlahnya $\\frac12\\left(1 - \\frac1{21}\\right) = \\frac{10}{21}$."),
  pg(5, "Pada perkalian $\\overline{ABCD} \\times 9 = \\overline{DCBA}$, huruf berbeda mewakili angka berbeda. Nilai $A + B + C + D$ adalah…", ["18", "16", "17", "19"], "A", "Hasilnya empat angka, jadi $A = 1$ dan $D = 9$. Lalu $B = 0$, $C = 8$: $1089 \\times 9 = 9801$. Jumlahnya 18."),
  pg(5, "Banyak pecahan $\\dfrac{a}{12}$ dengan $a$ bilangan asli, yang terletak di antara $\\dfrac13$ dan $\\dfrac34$ dan tidak dapat disederhanakan, adalah…", ["3", "2", "4", "1"], "B", "$4 < a < 9$: $a = 5, 6, 7, 8$. Yang relatif prima dengan 12 hanya 5 dan 7."),
  pg(5, "Banyak pasangan bilangan asli $(x, y)$ yang memenuhi $xy = 3x + y + 7$ adalah…", ["4", "2", "3", "6"], "A", "$xy - 3x - y + 3 = 10$, jadi $(x - 1)(y - 3) = 10$. Karena $x - 1 \\ge 0$ dan hasil kalinya positif, kedua faktor positif: 4 pasangan faktor."),
  pg(5, "Banyak cara memilih tiga bilangan asli berbeda yang jumlahnya 12 (urutan tidak diperhatikan) adalah…", ["6", "7", "8", "10"], "B", "$\\{1,2,9\\}, \\{1,3,8\\}, \\{1,4,7\\}, \\{1,5,6\\}, \\{2,3,7\\}, \\{2,4,6\\}, \\{3,4,5\\}$."),
  pg(5, "Pedagang menaikkan harga barang 25% dari harga beli, lalu memberi diskon 20% dari harga yang sudah dinaikkan. Pedagang itu…", ["untung 5%", "rugi 5%", "tidak untung dan tidak rugi", "untung 0,5%"], "C", "$1{,}25 \\times 0{,}8 = 1$: harga jual sama dengan harga beli."),
  pg(5, "Sisa pembagian $1 + 2 + 2^2 + 2^3 + \\cdots + 2^{99}$ oleh 7 adalah…", ["0", "3", "1", "6"], "C", "Jumlahnya $2^{100} - 1$. Karena $2^3 \\equiv 1 \\pmod 7$ dan $100 = 3 \\times 33 + 1$, $2^{100}$ bersisa 2, jadi jumlahnya bersisa 1."),
  pg(5, "Perbandingan uang A dan B adalah $3 : 4$. Jika uang A ditambah Rp10.000, perbandingannya menjadi $5 : 6$. Jumlah uang A dan B semula adalah…", ["Rp210.000", "Rp140.000", "Rp175.000", "Rp245.000"], "A", "$A = 3k$, $B = 4k$ (ribuan): $6(3k + 10) = 5 \\cdot 4k$, jadi $k = 30$. Jumlahnya $7k = 210$ ribu."),
  pg(5, "Ali dan Budi mulai bersamaan dari titik yang sama dan berlari searah mengelilingi lintasan 600 m, dengan kecepatan 5 m/detik dan 3 m/detik. Ali pertama kali menyusul Budi setelah…", ["75 detik", "120 detik", "200 detik", "300 detik"], "D", "Searah, Ali harus unggul satu putaran penuh. Selisih kecepatan 2 m/detik: $600 : 2 = 300$ detik."),
  pg(5, "Persegi $ABCD$ bersisi 12 cm. Titik $E$ pada $BC$ dengan $BE = 4$ cm, dan $F$ pada $CD$ dengan $CF = 6$ cm. Luas segitiga $AEF$ adalah…", ["48 cm²", "60 cm²", "54 cm²", "72 cm²"], "B", "Kurangkan tiga segitiga: $144 - 24 - 24 - 36 = 60$."),
  isian(10, "Persegi bersisi 10 cm dan persegi bersisi 12 cm tumpang tindih sehingga salah satu titik sudut persegi bersisi 12 cm tepat di pusat persegi bersisi 10 cm. Berapa cm² luas daerah yang tertutup oleh kedua persegi?", 219, "Persegi bersisi 12 cukup besar untuk menutup seperempat persegi kecil di sekitar pusatnya, apa pun kemiringannya, jadi irisannya $\\frac14 \\times 100 = 25$. Gabungannya $100 + 144 - 25 = 219$."),
  isian(10, "Jika $x + \\dfrac1x = 3$, berapa nilai $x^3 + \\dfrac1{x^3}$?", 18, "$\\left(x + \\frac1x\\right)^3 = x^3 + \\frac1{x^3} + 3\\left(x + \\frac1x\\right)$, jadi $27 = x^3 + \\frac1{x^3} + 9$ dan hasilnya 18."),
  isian(10, "Ada berapa pasangan bilangan bulat $(x, y)$ — boleh negatif — yang memenuhi $x^2 - y^2 = 45$?", 12, "Pasangan positif: $(23, 22), (9, 6), (7, 2)$. Setiap pasangan memberi 4 pasangan bertanda $(\\pm x, \\pm y)$, jadi 12."),
  isian(10, "Ada berapa bilangan empat angka berbentuk $\\overline{1a2b}$ yang habis dibagi 36?", 3, "Habis dibagi 4: $\\overline{2b}$ kelipatan 4, jadi $b \\in \\{0, 4, 8\\}$. Habis dibagi 9: $3 + a + b \\in \\{9, 18\\}$. Didapat $1620$, $1224$, $1728$."),
  isian(10, "Pedagang membeli 50 kg jeruk seharga Rp12.000/kg. Sebanyak 10% jeruk busuk dan dibuang, sisanya dijual Rp15.000/kg. Berapa rupiah keuntungannya?", 75000, "Modal $600\\,000$. Terjual $45$ kg $\\times 15\\,000 = 675\\,000$. Untung $75\\,000$."),
];

const SEMIFINAL_2: Question[] = [
  pg(5, "Nilai $\\dfrac{2^{2027} - 2^{2025}}{3 \\cdot 2^{2024}}$ adalah…", ["1", "2", "4", "8"], "B", "Pembilang $2^{2025}(2^2 - 1) = 3 \\cdot 2^{2025}$, jadi hasilnya $2^{2025} : 2^{2024} = 2$."),
  pg(5, "Pada $\\overline{AB} \\times \\overline{AB} = \\overline{CDAB}$, huruf mewakili angka (tidak harus berbeda) dan $A, C \\ne 0$. Nilai $C + D$ adalah…", ["12", "10", "11", "13"], "A", "Kuadratnya berakhir dengan bilangan itu sendiri dan empat angka: hanya $76^2 = 5776$. Jadi $C + D = 5 + 7 = 12$."),
  pg(5, "Banyak bilangan asli $x$ yang memenuhi $\\dfrac14 < \\dfrac3x < \\dfrac12$ adalah…", ["5", "4", "6", "7"], "A", "$\\frac3x < \\frac12$ berarti $x > 6$; $\\frac3x > \\frac14$ berarti $x < 12$. Jadi $x = 7, \\ldots, 11$."),
  pg(5, "Banyak pasangan bilangan asli $(a, b)$ yang memenuhi $\\dfrac1a + \\dfrac1b = \\dfrac13$ adalah…", ["2", "4", "3", "5"], "C", "$(a - 3)(b - 3) = 9$: $(4, 12), (6, 6), (12, 4)$."),
  pg(5, "Untuk memberi nomor semua halaman sebuah buku (mulai dari 1) diperlukan 192 angka. Banyak halaman buku itu adalah…", ["96", "99", "101", "100"], "D", "Halaman 1–99 memakai $9 + 180 = 189$ angka. Tiga angka lagi untuk halaman 100."),
  pg(5, "Tabungan Rp2.400.000 menjadi Rp2.568.000 setelah 1 tahun 2 bulan dengan bunga tunggal. Suku bunga per tahunnya adalah…", ["5%", "6%", "7%", "8%"], "B", "Bunga $168\\,000$ dalam 14 bulan, yaitu $12\\,000$ per bulan atau $144\\,000$ per tahun: $\\frac{144\\,000}{2\\,400\\,000} = 6\\%$."),
  pg(5, "Banyak bilangan dari 1 sampai 1000 yang habis dibagi 4 atau 6 tetapi tidak habis dibagi 12 adalah…", ["333", "167", "250", "166"], "C", "Habis dibagi 4 atau 6: $250 + 166 - 83 = 333$. Buang kelipatan 12 (83): 250."),
  pg(5, "Gaji A dan B berbanding $5 : 7$ dan pengeluaran mereka berbanding $3 : 5$. Jika masing-masing menabung Rp200.000, gaji A adalah…", ["Rp400.000", "Rp600.000", "Rp700.000", "Rp500.000"], "D", "Gaji $5k, 7k$ dan pengeluaran $3m, 5m$ (ribuan): $5k - 3m = 7k - 5m = 200$. Dari persamaan pertama $m = k$, lalu $2k = 200$. Gaji A $= 500$ ribu."),
  pg(5, "Perahu menempuh 24 km searah arus dalam 2 jam dan kembali melawan arus dalam 3 jam. Kecepatan arus sungai adalah…", ["2 km/jam", "1 km/jam", "3 km/jam", "4 km/jam"], "A", "Searah arus 12 km/jam, melawan arus 8 km/jam. Arusnya $\\frac{12 - 8}{2} = 2$."),
  pg(5, "Jajargenjang $ABCD$ berluas 60 cm² dan $E$ titik tengah $CD$. Luas segitiga $ADE$ adalah…", ["10 cm²", "15 cm²", "20 cm²", "30 cm²"], "B", "Segitiga $ACD$ adalah setengah jajargenjang (30), dan $AE$ membaginya dua sama luas (alas $DE = EC$): 15."),
  isian(10, `Hitung $1^2 - 2^2 + 3^2 - 4^2 + \\cdots + 19^2 - 20^2$. ${NEG}`, -210, "Setiap pasangan $(2k - 1)^2 - (2k)^2 = -(4k - 1) = -[(2k - 1) + 2k]$. Jumlahnya $-(1 + 2 + \\cdots + 20) = -210$."),
  isian(10, "Pada persegi bersisi 14 cm digambar dua seperempat lingkaran berjari-jari 14 cm, berpusat di dua titik sudut yang berhadapan. Dengan $\\pi = \\frac{22}{7}$, berapa cm² luas daerah irisan kedua seperempat lingkaran?", 112, "Kedua seperempat lingkaran menutupi seluruh persegi, jadi irisannya $154 + 154 - 196 = 112$."),
  isian(10, "Jika $a + b = 6$ dan $ab = 4$, berapa nilai $a^3 + b^3$?", 144, "$a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 216 - 72 = 144$."),
  isian(10, "Pada perkalian $\\overline{ABCDE} \\times 4 = \\overline{EDCBA}$, huruf berbeda mewakili angka berbeda. Berapa $A + B + C + D + E$?", 27, "$A = 2$ (hasil lima angka dan genap), $E = 8$, lalu $21978 \\times 4 = 87912$. Jumlah angkanya 27."),
  isian(10, "Kota P dan Q berjarak 220 km. Andi berangkat dari P ke Q pukul 07.00 dengan kecepatan 40 km/jam. Budi berangkat dari Q ke P pukul 08.00 dengan kecepatan 50 km/jam. Berapa km jarak tempat mereka bertemu dari kota P?", 120, "Pukul 08.00 Andi sudah 40 km, sisa jarak 180 km ditutup $90$ km/jam dalam 2 jam. Andi berjalan 3 jam: $120$ km dari P."),
];

// ------------------------------------------------------------------ Final

const worked = (prompt: string, answer: string, answerMarks: number, rubric: { point: string; marks: number }[], solution: string, explanation: string): Question => ({
  type: "WORKED",
  points: 20,
  prompt,
  answer,
  answerMarks,
  rubric,
  solution,
  explanation,
});

const FINAL_1: Question[] = [
  worked(
    "Bilangan enam angka $\\overline{1ABCDE}$ jika dikalikan 3 menghasilkan $\\overline{ABCDE1}$. Tentukan bilangan $\\overline{1ABCDE}$ beserta alasannya, lalu tulis bilangan itu di kotak jawaban akhir.",
    "142857",
    4,
    [
      { point: "Memisalkan $x = \\overline{ABCDE}$ dan menulis $\\overline{1ABCDE} = 100\\,000 + x$ serta $\\overline{ABCDE1} = 10x + 1$", marks: 6 },
      { point: "Menyusun dan menyelesaikan $3(100\\,000 + x) = 10x + 1$ sampai $x = 42\\,857$", marks: 7 },
      { point: "Memeriksa hasil: $142\\,857 \\times 3 = 428\\,571$", marks: 3 },
    ],
    "Misalkan $x = \\overline{ABCDE}$. Maka $\\overline{1ABCDE} = 100\\,000 + x$ dan $\\overline{ABCDE1} = 10x + 1$.\n\n$$3(100\\,000 + x) = 10x + 1 \\;\\Longrightarrow\\; 300\\,000 + 3x = 10x + 1 \\;\\Longrightarrow\\; 7x = 299\\,999 \\;\\Longrightarrow\\; x = 42\\,857.$$\n\nJadi bilangannya $\\mathbf{142\\,857}$. Periksa: $142\\,857 \\times 3 = 428\\,571$ ✓",
    "Kuncinya memberi nama $x$ pada lima angka yang berpindah tempat, sehingga soal angka menjadi persamaan linear."
  ),
  worked(
    "Buktikan bahwa jumlah tiga bilangan bulat berurutan selalu habis dibagi 3, tetapi jumlah empat bilangan bulat berurutan tidak pernah habis dibagi 4. (Soal pembuktian.)",
    "",
    0,
    [
      { point: "Menulis tiga bilangan berurutan sebagai $n, n+1, n+2$ (atau $n-1, n, n+1$)", marks: 4 },
      { point: "Menunjukkan jumlahnya $3(n + 1)$, jadi habis dibagi 3", marks: 5 },
      { point: "Menulis jumlah empat bilangan berurutan sebagai $4n + 6$", marks: 5 },
      { point: "Menunjukkan $4n + 6 = 4(n + 1) + 2$ selalu bersisa 2 jika dibagi 4, lalu menyimpulkan", marks: 6 },
    ],
    "**Tiga bilangan.** Misalkan bilangannya $n$, $n + 1$, $n + 2$. Jumlahnya $3n + 3 = 3(n + 1)$, kelipatan 3. ∎\n\n**Empat bilangan.** Misalkan bilangannya $n$, $n + 1$, $n + 2$, $n + 3$. Jumlahnya\n\n$$4n + 6 = 4(n + 1) + 2.$$\n\nJadi jumlahnya selalu bersisa 2 jika dibagi 4, sehingga tidak pernah habis dibagi 4. ∎",
    "Contoh angka ($1 + 2 + 3 = 6$) hanya menunjukkan satu kasus; bukti harus memakai bilangan sembarang $n$."
  ),
  worked(
    "Pedagang membeli 100 buah mangga seharga Rp3.000 per buah. Sebanyak 20% mangga dijual Rp5.000 per buah dan sisanya Rp4.000 per buah. Tentukan besar keuntungannya dalam rupiah dan dalam persen, lalu tulis persentase keuntungannya (tanpa tanda %) di kotak jawaban akhir.",
    "40",
    4,
    [
      { point: "Menghitung modal $100 \\times 3000 = 300\\,000$", marks: 3 },
      { point: "Menghitung hasil penjualan $20 \\times 5000 + 80 \\times 4000 = 420\\,000$", marks: 6 },
      { point: "Menghitung untung $120\\,000$", marks: 3 },
      { point: "Menghitung persentase terhadap modal: $\\frac{120\\,000}{300\\,000} = 40\\%$", marks: 4 },
    ],
    "Modal: $100 \\times 3000 = 300\\,000$.\n\nPenjualan: 20 mangga $\\times 5000 = 100\\,000$ dan 80 mangga $\\times 4000 = 320\\,000$, totalnya $420\\,000$.\n\nUntung: $420\\,000 - 300\\,000 = 120\\,000$ rupiah, yaitu $\\frac{120\\,000}{300\\,000} \\times 100\\% = \\mathbf{40\\%}$ dari modal.",
    "Persentase untung selalu dihitung terhadap harga beli (modal), bukan terhadap harga jual."
  ),
  worked(
    "Persegi $ABCD$ bersisi 12 cm. $E$ titik tengah $AB$ dan $F$ titik tengah $BC$. Tentukan luas segitiga $DEF$ beserta langkahnya, lalu tulis luasnya (dalam cm²) di kotak jawaban akhir.",
    "54",
    4,
    [
      { point: "Menyadari bahwa luas $DEF$ = luas persegi dikurangi tiga segitiga siku-siku di sekelilingnya", marks: 4 },
      { point: "Menghitung luas $\\triangle AED = 36$, $\\triangle EBF = 18$, $\\triangle FCD = 36$", marks: 9 },
      { point: "Menyimpulkan $144 - 90 = 54$", marks: 3 },
    ],
    "Segitiga $DEF$ adalah persegi dikurangi tiga segitiga siku-siku:\n\n- $\\triangle AED$: siku-siku di $A$, sisi $AE = 6$ dan $AD = 12$, luas $36$.\n- $\\triangle EBF$: siku-siku di $B$, sisi $6$ dan $6$, luas $18$.\n- $\\triangle FCD$: siku-siku di $C$, sisi $FC = 6$ dan $CD = 12$, luas $36$.\n\nJadi luas $\\triangle DEF = 144 - (36 + 18 + 36) = \\mathbf{54}$ cm².",
    "Kalau segitiganya miring dan tingginya sulit dicari, kurangkan bagian-bagian siku-siku dari bangun yang utuh."
  ),
  worked(
    "Andi dan Budi berangkat bersamaan dari kota A menuju kota B yang berjarak 30 km. Andi bersepeda 15 km/jam dan Budi berjalan 5 km/jam. Begitu sampai di B, Andi langsung berbalik menuju A. Tentukan jarak tempat mereka bertemu dari kota A, lalu tulis jaraknya (dalam km) di kotak jawaban akhir.",
    "15",
    4,
    [
      { point: "Menghitung waktu Andi sampai di B (2 jam) dan posisi Budi saat itu (10 km dari A)", marks: 6 },
      { point: "Menghitung sisa jarak (20 km) dan kecepatan saling mendekat (20 km/jam), sehingga bertemu 1 jam kemudian", marks: 7 },
      { point: "Menentukan titik temu 15 km dari A dan memeriksanya dari sisi Andi", marks: 3 },
    ],
    "Andi sampai di B setelah $30 : 15 = 2$ jam. Saat itu Budi sudah $2 \\times 5 = 10$ km dari A, jadi jarak mereka $30 - 10 = 20$ km.\n\nSekarang mereka saling mendekat dengan kecepatan $15 + 5 = 20$ km/jam, sehingga bertemu $20 : 20 = 1$ jam kemudian. Budi telah berjalan $3 \\times 5 = \\mathbf{15}$ km dari A.\n\nPeriksa dari sisi Andi: dalam 3 jam ia menempuh $45$ km, yaitu 30 km ke B lalu 15 km kembali — berada 15 km dari A ✓",
    "Pecah perjalanan menjadi tahap-tahap; di setiap tahap kecepatan relatifnya tetap."
  ),
];

const FINAL_2: Question[] = [
  worked(
    "Tentukan semua pasangan bilangan bulat $(x, y)$ — boleh negatif — yang memenuhi $xy + 2x - y = 5$. Tuliskan prosesnya, lalu tulis banyaknya pasangan di kotak jawaban akhir.",
    "4",
    4,
    [
      { point: "Mengubah persamaan menjadi bentuk hasil kali $(x - 1)(y + 2) = 3$", marks: 6 },
      { point: "Mendaftar keempat pasangan faktor bulat dari 3, termasuk yang negatif", marks: 5 },
      { point: "Menuliskan keempat pasangan $(x, y)$ dengan benar", marks: 5 },
    ],
    "Kelompokkan: $xy + 2x - y - 2 = 5 - 2$, yaitu\n\n$$(x - 1)(y + 2) = 3.$$\n\nPasangan bilangan bulat yang hasil kalinya 3: $(1, 3), (3, 1), (-1, -3), (-3, -1)$. Maka:\n\n- $x - 1 = 1$, $y + 2 = 3$: $(2, 1)$\n- $x - 1 = 3$, $y + 2 = 1$: $(4, -1)$\n- $x - 1 = -1$, $y + 2 = -3$: $(0, -5)$\n- $x - 1 = -3$, $y + 2 = -1$: $(-2, -3)$\n\nAda $\\mathbf{4}$ pasangan.",
    "Trik kuncinya menambah atau mengurangi konstanta agar ruas kiri bisa difaktorkan; jangan lupa faktor negatif."
  ),
  worked(
    "Tentukan semua bilangan bulat $x$ yang memenuhi kedua pertidaksamaan $\\dfrac x3 + \\dfrac{x - 1}{2} > 2$ dan $3x - 7 < 2x + 1$. Tuliskan prosesnya, lalu tulis jumlah semua bilangan bulat itu di kotak jawaban akhir.",
    "22",
    4,
    [
      { point: "Menyelesaikan pertidaksamaan pertama sampai $x > 3$", marks: 6 },
      { point: "Menyelesaikan pertidaksamaan kedua sampai $x < 8$", marks: 3 },
      { point: "Menggabungkan menjadi $3 < x < 8$ dan mendaftar $4, 5, 6, 7$", marks: 5 },
      { point: "Menjumlahkan: $22$", marks: 2 },
    ],
    "Pertidaksamaan pertama, kalikan 6: $2x + 3(x - 1) > 12$, jadi $5x > 15$ dan $x > 3$.\n\nPertidaksamaan kedua: $x < 8$.\n\nKeduanya: $3 < x < 8$, yaitu $x = 4, 5, 6, 7$. Jumlahnya $\\mathbf{22}$.",
    "Kalikan dengan KPK penyebut lebih dulu agar tidak ada pecahan, dan perhatikan tanda tegas di kedua ujung."
  ),
  worked(
    "Bejana A berisi 40 liter larutan gula berkadar 25%, dan bejana B berisi 60 liter larutan gula berkadar 10%. Keduanya dicampur, lalu sebagian airnya diuapkan sampai kadar gulanya menjadi 20%. Berapa liter air yang harus diuapkan? Tulis prosesnya, lalu tulis jawabannya di kotak jawaban akhir.",
    "20",
    4,
    [
      { point: "Menghitung banyak gula: $10 + 6 = 16$ liter", marks: 5 },
      { point: "Menyadari bahwa banyak gula tetap saat air diuapkan", marks: 3 },
      { point: "Menghitung volume akhir $16 : 0{,}2 = 80$ liter", marks: 5 },
      { point: "Menyimpulkan $100 - 80 = 20$ liter", marks: 3 },
    ],
    "Gula di A: $25\\% \\times 40 = 10$ liter; di B: $10\\% \\times 60 = 6$ liter. Campuran: 100 liter dengan 16 liter gula.\n\nPenguapan hanya membuang air, jadi gulanya tetap 16 liter. Agar kadarnya 20%, volume akhir harus $16 : 0{,}2 = 80$ liter.\n\nAir yang diuapkan: $100 - 80 = \\mathbf{20}$ liter.",
    "Pada soal campuran, cari besaran yang tidak berubah (di sini banyak gula), lalu hitung yang lain darinya."
  ),
  worked(
    "Hitung nilai $\\dfrac{2026^3 - 1}{2026^2 + 2027}$ tanpa kalkulator. Tuliskan prosesnya, lalu tulis hasilnya di kotak jawaban akhir.",
    "2025",
    4,
    [
      { point: "Memisalkan $a = 2026$ dan menulis penyebut sebagai $a^2 + a + 1$", marks: 5 },
      { point: "Memfaktorkan $a^3 - 1 = (a - 1)(a^2 + a + 1)$", marks: 7 },
      { point: "Menyederhanakan menjadi $a - 1 = 2025$", marks: 4 },
    ],
    "Misalkan $a = 2026$. Penyebutnya $a^2 + (a + 1) = a^2 + a + 1$, dan\n\n$$a^3 - 1 = (a - 1)(a^2 + a + 1).$$\n\nMaka $\\dfrac{a^3 - 1}{a^2 + a + 1} = a - 1 = \\mathbf{2025}$.",
    "Bilangan besar yang berulang hampir selalu menyembunyikan identitas aljabar: ganti dengan huruf."
  ),
  worked(
    "Persegi $ABCD$ bersisi 8 cm dan persegi $CEFG$ bersisi 6 cm diletakkan berdampingan sehingga $B$, $C$, $E$ segaris (dengan $C$ di antara $B$ dan $E$) dan kedua persegi berada di sisi yang sama dari garis itu. Tentukan luas segitiga $BDF$, lalu tulis luasnya (dalam cm²) di kotak jawaban akhir.",
    "32",
    4,
    [
      { point: "Menempatkan titik-titik pada koordinat atau memecah daerah dengan benar", marks: 5 },
      { point: "Menghitung luas segitiga $BDF$ dengan rumus koordinat atau dengan menjumlah/mengurangkan bangun", marks: 8 },
      { point: "Memperoleh 32 cm² dan menyadari bahwa hasilnya setengah luas persegi besar", marks: 3 },
    ],
    "Letakkan $B = (0, 0)$, $C = (8, 0)$, $D = (8, 8)$, $E = (14, 0)$, $F = (14, 6)$.\n\nLuas segitiga dengan titik $B(0,0)$, $D(8,8)$, $F(14,6)$:\n\n$$\\frac12\\left|8\\cdot6 - 14\\cdot8\\right| = \\frac12\\,|48 - 112| = \\mathbf{32}.$$\n\n**Mengapa 32?** Diagonal $BD$ sejajar $CF$ (keduanya membentuk $45^\\circ$ dengan garis $BE$), jadi $F$ dan $C$ berjarak sama dari $BD$. Maka $[BDF] = [BDC] = \\frac12 \\times 64 = 32$ — berapa pun ukuran persegi kecilnya.",
    "Garis sejajar menjaga tinggi tetap; segitiga dengan alas sama dan puncak pada garis sejajar alas punya luas sama."
  ),
];

const SIM_CHAPTER = "Simulasi Kompetisi";

export const KOMP7_SIMULASI: ChapterContent = {
  chapterTitle: SIM_CHAPTER,
  archiveOnPublish: [],
  quizzes: [
    { title: "Penyisihan — Paket I", style: "TRYOUT", settings: { timeLimitMinutes: 90, maxAttempts: 2, randomizeQuestionOrder: false }, questions: PENYISIHAN_1 },
    { title: "Penyisihan — Paket II", style: "TRYOUT", settings: { timeLimitMinutes: 90, maxAttempts: 2, randomizeQuestionOrder: false }, questions: PENYISIHAN_2 },
    { title: "Semifinal — Paket I", style: "TRYOUT", settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: false }, questions: SEMIFINAL_1 },
    { title: "Semifinal — Paket II", style: "TRYOUT", settings: { timeLimitMinutes: 60, maxAttempts: 2, randomizeQuestionOrder: false }, questions: SEMIFINAL_2 },
    { title: "Final — Paket I", style: "EXAM", settings: { timeLimitMinutes: 90, maxAttempts: 1, randomizeQuestionOrder: false }, questions: FINAL_1 },
    { title: "Final — Paket II", style: "EXAM", settings: { timeLimitMinutes: 90, maxAttempts: 1, randomizeQuestionOrder: false }, questions: FINAL_2 },
  ],
};
