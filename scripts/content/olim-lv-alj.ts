/**
 * Aljabar — the three levels of the Junior Path module, each with its quizzes.
 * New problems in the module's patterns. Answers are recomputed in
 * scripts/check-olim-levels.py.
 */
import { BIG, FRAC, drill, frac, langkah, latihan, levelIntro, mc, mistake, num, parts, steps, uji, worked, type LevelChapter } from "./olim-levels-types";

const L1 = "Aljabar Level 1";
const L2 = "Aljabar Level 2";
const L3 = "Aljabar Level 3";

export const LV_ALJABAR: LevelChapter = {
  chapterTitle: "Aljabar",
  levels: [
    {
      title: "Level 1: Bahasa Simbol",
      pdfDir: "olim-jp-alj-1",
      pdfName: "Aljabar-Level-1-Bahasa-Simbol.pdf",
      intro: levelIntro(1, "bentuk aljabar, persamaan linear satu variabel, pertidaksamaan linear, sistem persamaan linear dua variabel", true),
      quizzes: [
        langkah(L1, [
          steps(
            "Selesaikan $\\dfrac{x + 4}{3} - \\dfrac{x - 2}{5} = 2$.",
            [
              ["KPK kedua penyebut", "15"],
              ["Setelah kedua ruas dikali 15: 5(x + 4) − 3(x − 2) = …", "30"],
              ["Buka kurung dan kumpulkan suku sejenis: 2x + … = 30", "26"],
              ["x = …", "2"],
            ],
            "$5x + 20 - 3x + 6 = 30$, jadi $2x + 26 = 30$ dan $x = 2$. Cek: $\\frac63 - \\frac05 = 2$."
          ),
          steps(
            "Harga 3 apel dan 2 jeruk Rp16.000, sedangkan 2 apel dan 5 jeruk Rp18.000. Bekerja dalam ribuan rupiah: $3a + 2j = 16$ dan $2a + 5j = 18$.",
            [
              ["Kalikan persamaan pertama dengan 2 dan kedua dengan 3, lalu kurangkan. Koefisien j yang tersisa?", "11"],
              ["Harga 1 jeruk (ribu rupiah)", "2"],
              ["Harga 1 apel (ribu rupiah)", "4"],
              ["Harga 1 apel dan 1 jeruk (ribu rupiah)", "6"],
            ],
            "$6a + 15j - (6a + 4j) = 54 - 32$, jadi $11j = 22$, $j = 2$, lalu $3a = 12$, $a = 4$."
          ),
          parts(
            "Diketahui $a + b = 9$ dan $ab = 14$. Hitung tanpa mencari $a$ dan $b$.",
            [
              ["a² + b²", "53"],
              ["(a − b)²", "25"],
              ["a²b + ab²", "126"],
            ],
            "$a^2 + b^2 = 81 - 28 = 53$. $(a - b)^2 = a^2 + b^2 - 2ab = 25$. $a^2 b + ab^2 = ab(a + b) = 126$. (Memang $a, b$ adalah $2$ dan $7$.)"
          ),
          steps(
            "Ada berapa bilangan bulat $x$ yang memenuhi $3x - 7 \\le 5x + 3 < 2x + 24$?",
            [
              ["Dari 3x − 7 ≤ 5x + 3: x ≥ … (bilangan negatif ditulis dengan tanda minus, misalnya -5)", "-5"],
              ["Dari 5x + 3 < 2x + 24: x < …", "7"],
              ["Banyak bilangan bulat x", "12"],
            ],
            "$-10 \\le 2x$ memberi $x \\ge -5$, dan $3x < 21$ memberi $x < 7$. Bilangan bulatnya $-5, -4, \\ldots, 6$."
          ),
          mistake(
            "Sari menyelesaikan $5 - 3x > 17$.",
            ["5 − 3x > 17", "−3x > 12", "x > −4"],
            2,
            "Membagi dengan bilangan negatif membalik tanda: $x < -4$."
          ),
          parts(
            "Kota A dan B berjarak 180 km. Mobil dari A melaju 50 km/jam dan mobil dari B 40 km/jam. Keduanya berangkat bersamaan dan saling menuju.",
            [
              ["Setelah berapa jam mereka berpapasan?", "2"],
              ["Berapa km dari A mereka berpapasan?", "100"],
            ],
            "Saling menuju, jaraknya berkurang $50 + 40 = 90$ km setiap jam: $180 \\div 90 = 2$ jam. Mobil dari A sudah menempuh $50 \\times 2 = 100$ km."
          ),
        ]),
        latihan(L1, [
          num("Tentukan koefisien $x$ pada $(3x - 2)(4x + 5) - 2x(6x - 1)$.", 9, "$12x^2 + 15x - 8x - 10 - 12x^2 + 2x = 9x - 10$."),
          num("Selesaikan $7(x - 3) = 4(x + 6)$.", 15, "$7x - 21 = 4x + 24$, jadi $3x = 45$."),
          num("Jumlah tiga bilangan genap berurutan adalah $78$. Berapa bilangan terbesar?", 28, "Bilangan tengahnya $78 \\div 3 = 26$, jadi ketiganya $24, 26, 28$."),
          num("Jumlah umur ayah dan anak sekarang 50 tahun. Lima tahun lalu umur ayah 7 kali umur anak. Berapa umur anak sekarang?", 10, "Misalkan umur anak $a$, ayah $50 - a$. $45 - a = 7(a - 5)$ memberi $8a = 80$."),
          num("Ada berapa bilangan bulat $x$ yang memenuhi $-5 \\le 2 - 3x < 14$?", 6, "$-7 \\le -3x < 12$. Bagi $-3$ dan balik tandanya: $-4 < x \\le \\frac73$, jadi $x = -3, \\ldots, 2$."),
          num("Tentukan bilangan bulat terbesar $x$ yang memenuhi $\\dfrac{x}{2} - \\dfrac{x - 1}{3} < 2$.", 9, "Kalikan 6: $3x - 2x + 2 < 12$, jadi $x < 10$."),
          num("Diketahui $4x - 3y = 5$ dan $2x + 5y = 9$. Berapa $x + y$?", 3, "Kalikan persamaan kedua dengan 2 dan kurangkan: $13y = 13$, $y = 1$, lalu $x = 2$."),
          num("Perahu menempuh 36 km searah arus dalam 2 jam dan kembali melawan arus dalam 3 jam. Berapa km/jam kecepatan arus?", 3, "$b + a = 18$ dan $b - a = 12$, jadi $2a = 6$."),
          num("Uang Ani dan Budi berjumlah Rp120.000. Jika Ani memberi Budi Rp15.000, uang mereka sama. Berapa uang Ani mula-mula? Jawab dalam ribuan rupiah.", 75, "$A + B = 120$ dan $A - 15 = B + 15$, jadi $A - B = 30$ dan $A = 75$."),
          num("Diketahui $x - y = 4$ dan $xy = 21$. Berapa $x^2 + y^2$?", 58, "$x^2 + y^2 = (x - y)^2 + 2xy = 16 + 42$."),
        ]),
        drill(L1, "Persamaan Linear", "linear-equation"),
        uji(L1, false, [
          num("Selesaikan $\\dfrac{x + 5}{4} - \\dfrac{x - 3}{6} = 2$.", 3, "Kalikan 12: $3(x + 5) - 2(x - 3) = 24$, jadi $x + 21 = 24$.", 20),
          num("Ada berapa bilangan bulat $x$ yang memenuhi $2x - 5 < 4x + 7 \\le x + 22$?", 11, "$-12 < 2x$ memberi $x > -6$, dan $3x \\le 15$ memberi $x \\le 5$: $x = -5, \\ldots, 5$.", 20),
          num("Diketahui $a + b = 11$ dan $ab = 18$. Tentukan $a^2 + b^2$.", 85, "$121 - 36 = 85$.", 20),
          num("Andi dan Budi berlari pada lintasan 600 m. Jika berlawanan arah, mereka berpapasan setiap 50 detik. Jika searah, Andi menyusul Budi setiap 300 detik. Berapa m/detik kecepatan Andi?", 7, "$50(a + b) = 600$ dan $300(a - b) = 600$: $a + b = 12$, $a - b = 2$.", 20),
          num("Tarif parkir Rp3.000 untuk jam pertama dan Rp2.000 untuk setiap jam berikutnya. Dengan Rp25.000, paling lama berapa jam bisa parkir?", 12, "$3000 + 2000(h - 1) \\le 25\\,000$ memberi $h - 1 \\le 11$.", 20),
        ]),
      ],
    },
    {
      title: "Level 2: Membongkar dan Menyusun",
      pdfDir: "olim-jp-alj-2",
      pdfName: "Aljabar-Level-2-Membongkar-dan-Menyusun.pdf",
      intro: levelIntro(2, "perkalian istimewa dan pemfaktoran, persamaan kuadrat, rumus Vieta, fungsi dan komposisi, sistem persamaan tiga variabel", true),
      quizzes: [
        langkah(L2, [
          steps(
            "Faktorkan $6x^2 - 7x - 20$ dengan memecah suku tengah.",
            [
              ["ac = … (bilangan negatif ditulis dengan tanda minus)", "-120"],
              ["Dua bilangan berjumlah −7 dan berhasil kali −120. Yang negatif?", "-15"],
              ["Yang positif?", "8"],
              ["Akar positif dari 6x² − 7x − 20 = 0 (tulis sebagai a/b)", "5/2"],
            ],
            "$6x^2 - 15x + 8x - 20 = 3x(2x - 5) + 4(2x - 5) = (3x + 4)(2x - 5)$. Akarnya $x = \\frac52$ dan $x = -\\frac43$."
          ),
          steps(
            "Akar-akar $x^2 - 6x + 4 = 0$ adalah $\\alpha$ dan $\\beta$. Tentukan $\\alpha^3 + \\beta^3$.",
            [
              ["α + β", "6"],
              ["αβ", "4"],
              ["α² + β²", "28"],
              ["α³ + β³", "144"],
            ],
            "$\\alpha^2 + \\beta^2 = 36 - 8 = 28$, dan $\\alpha^3 + \\beta^3 = (\\alpha + \\beta)^3 - 3\\alpha\\beta(\\alpha + \\beta) = 216 - 72 = 144$."
          ),
          parts(
            "Persamaan $x^2 + px + q = 0$ memiliki akar-akar yang masing-masing dua kali akar-akar $x^2 - 5x + 2 = 0$. (Bilangan negatif ditulis dengan tanda minus.)",
            [
              ["p", "-10"],
              ["q", "8"],
            ],
            "Akar lama berjumlah 5 dan berhasil kali 2. Akar baru berjumlah $10$ dan berhasil kali $4 \\cdot 2 = 8$, jadi persamaannya $x^2 - 10x + 8 = 0$."
          ),
          steps(
            "Diketahui $f(3x - 1) = 6x + 5$ untuk setiap $x$. Misalkan $t = 3x - 1$, sehingga $f(t) = at + b$.",
            [
              ["a", "2"],
              ["b", "7"],
              ["f(8)", "23"],
            ],
            "$x = \\frac{t + 1}{3}$, jadi $f(t) = 2(t + 1) + 5 = 2t + 7$. Cek lewat jalan lain: $3x - 1 = 8$ berarti $x = 3$, dan $6 \\cdot 3 + 5 = 23$."
          ),
          mistake(
            "Tono menyelesaikan $(x - 2)^2 = 9$.",
            ["(x − 2)² = 9", "x − 2 = 3", "x = 5", "Himpunan penyelesaiannya {5}."],
            1,
            "Akar kuadrat punya dua tanda: $x - 2 = 3$ **atau** $x - 2 = -3$. Penyelesaiannya $x = 5$ atau $x = -1$."
          ),
          parts(
            "Selesaikan $x + 2y + z = 16$, $x + y + 2z = 17$, dan $2x + y + z = 15$. Mulailah dengan menjumlahkan ketiganya.",
            [
              ["x + y + z", "12"],
              ["x", "3"],
              ["z", "5"],
            ],
            "Jumlahnya $4(x + y + z) = 48$. Kurangkan $x + y + z = 12$ dari tiap persamaan: $y = 4$, $z = 5$, $x = 3$."
          ),
        ]),
        latihan(L2, [
          num("Hitung $2026^2 - 2025^2$.", 4051, "$(2026 - 2025)(2026 + 2025) = 4051$."),
          num("Hitung $\\dfrac{2025 \\times 2027 + 1}{2026}$.", 2026, "$2025 \\times 2027 = 2026^2 - 1$, jadi pembilangnya $2026^2$."),
          mc("Faktorkan $4x^2 - 12x + 9 - y^2$.", ["$(2x + 3 - y)(2x - 3 + y)$", "$(2x - 3 - y)(2x - 3 + y)$", "$(4x - 9 - y)(x - 1 + y)$", "$(2x - y)(2x + y - 9)$"], "B", "$4x^2 - 12x + 9 = (2x - 3)^2$, jadi bentuknya selisih kuadrat $(2x - 3)^2 - y^2$."),
          num("Akar-akar $2x^2 - 9x + 4 = 0$ adalah $p$ dan $q$. Tentukan $p^2 q + pq^2$.", 9, "$p + q = \\frac92$ dan $pq = 2$, jadi $pq(p + q) = 9$."),
          frac(`Akar-akar $3x^2 - 5x - 2 = 0$ adalah $p$ dan $q$. Tentukan $\\dfrac1p + \\dfrac1q$. ${FRAC} Pecahan negatif ditulis dengan minus, misalnya -3/4.`, "-5/2", "$\\frac1p + \\frac1q = \\frac{p + q}{pq} = \\frac{5/3}{-2/3} = -\\frac52$."),
          num("Tentukan nilai $m > 0$ sehingga $x^2 + (m - 1)x + 16 = 0$ memiliki akar kembar.", 9, "$D = (m - 1)^2 - 64 = 0$, jadi $m - 1 = \\pm 8$: $m = 9$ atau $m = -7$."),
          num("Berapa selisih kedua akar $x^2 - 11x + 24 = 0$?", 5, "$(x - 3)(x - 8) = 0$, jadi akarnya 3 dan 8."),
          num("Diketahui $f(x) = 2x - 1$ dan $g(x) = x^2 + 3$. Tentukan $(g \\circ f)(3)$.", 28, "$f(3) = 5$, lalu $g(5) = 28$."),
          num("Diketahui $f(x) = \\dfrac{x + 7}{x - 1}$. Tentukan $f^{-1}(5)$.", 3, "Cari $a$ dengan $f(a) = 5$: $a + 7 = 5a - 5$, jadi $a = 3$."),
          num("Pipa A dan B bersama mengisi kolam dalam 4 jam, B dan C dalam 6 jam, A dan C dalam 4 jam. Berapa jam jika ketiganya dipakai bersama?", 3, "Laju: $a + b = \\frac14$, $b + c = \\frac16$, $a + c = \\frac14$. Jumlahnya $2(a + b + c) = \\frac{8}{12}$, jadi $a + b + c = \\frac13$."),
        ]),
        drill(L2, "Bentuk Simetris", "symmetric-sums"),
        uji(L2, false, [
          num("Hitung $\\dfrac{2026^3 - 1}{2026^2 + 2027}$.", 2025, "$2026^3 - 1 = (2026 - 1)(2026^2 + 2026 + 1)$, dan $2026^2 + 2026 + 1 = 2026^2 + 2027$.", 20),
          num("Akar-akar $x^2 - 4x + 1 = 0$ adalah $\\alpha$ dan $\\beta$. Tentukan $\\alpha^4 + \\beta^4$.", 194, "$\\alpha^2 + \\beta^2 = 16 - 2 = 14$, lalu $\\alpha^4 + \\beta^4 = 14^2 - 2 \\cdot 1^2 = 194$.", 20),
          num("Akar-akar $x^2 + px + q = 0$ masing-masing 3 lebih besar daripada akar-akar $x^2 - 7x + 5 = 0$. Tentukan $p + q$.", 22, "Jumlah akar baru $7 + 6 = 13$, jadi $p = -13$. Hasil kalinya $5 + 3 \\cdot 7 + 9 = 35$, jadi $q = 35$.", 20),
          num("Diketahui $f(2x - 3) = 4x + 1$ untuk setiap $x$. Tentukan $f(7)$.", 21, "$2x - 3 = 7$ berarti $x = 5$, jadi $f(7) = 21$.", 20),
          num("Diketahui $x + y + z = 10$, $x - y + 2z = 9$, dan $2x + y - z = 2$. Tentukan $xyz$.", 30, "Jumlahkan persamaan pertama dan ketiga: $3x + 2y = 12$. Jumlahkan persamaan kedua dengan dua kali persamaan ketiga: $5x + y = 13$. Dari keduanya $x = 2$ dan $y = 3$, lalu persamaan pertama memberi $z = 5$. Jadi $xyz = 30$.", 20),
        ]),
      ],
    },
    {
      title: "Level 3: Mencari yang Terbesar dan Terkecil",
      pdfDir: "olim-jp-alj-3",
      pdfName: "Aljabar-Level-3-Mencari-yang-Terbesar-dan-Terkecil.pdf",
      intro: levelIntro(3, "nilai ekstrem fungsi kuadrat, ketaksamaan AM-GM, identitas simetris, persamaan fungsional sederhana", false),
      quizzes: [
        langkah(L3, [
          steps(
            "Tentukan nilai minimum $2x^2 - 12x + 23$.",
            [
              ["Keluarkan faktor 2: 2(x² − 6x) + 23 = 2(x − …)² + c. Isi titik-titiknya.", "3"],
              ["c = …", "5"],
              ["Nilai minimumnya", "5"],
            ],
            "$2(x^2 - 6x + 9) - 18 + 23 = 2(x - 3)^2 + 5$. Kuadrat tidak negatif, jadi minimumnya $5$ saat $x = 3$."
          ),
          steps(
            "Untuk $x > 0$, tentukan nilai minimum $3x + \\dfrac{12}{x}$.",
            [
              ["Hasil kali kedua suku", "36"],
              ["Menurut AM-GM, 3x + 12/x ≥ 2√36 = …", "12"],
              ["Nilai x saat minimum tercapai", "2"],
            ],
            "Kesamaan AM-GM terjadi saat kedua suku sama: $3x = \\frac{12}{x}$, jadi $x^2 = 4$ dan $x = 2$. Cek: $6 + 6 = 12$."
          ),
          parts(
            "Diketahui $x + \\dfrac1x = 4$.",
            [
              ["x² + 1/x²", "14"],
              ["x³ + 1/x³", "52"],
              ["x⁴ + 1/x⁴", "194"],
            ],
            "$16 - 2 = 14$. $(x + \\frac1x)^3 - 3(x + \\frac1x) = 64 - 12 = 52$. $(x^2 + \\frac1{x^2})^2 - 2 = 196 - 2 = 194$."
          ),
          steps(
            "Fungsi $f$ memenuhi $f(x) + 2f(2 - x) = 3x$ untuk setiap $x$. Tentukan $f(4)$. (Bilangan negatif ditulis dengan tanda minus.)",
            [
              ["Masukkan x = 4: f(4) + 2f(−2) = …", "12"],
              ["Masukkan x = −2: f(−2) + 2f(4) = …", "-6"],
              ["f(4) = …", "-8"],
            ],
            "Dari persamaan kedua, $f(-2) = -6 - 2f(4)$. Masukkan ke yang pertama: $f(4) - 12 - 4f(4) = 12$, jadi $-3f(4) = 24$. (Umumnya $f(x) = 4 - 3x$.)"
          ),
          mistake(
            "Rudi mencari nilai minimum $x + \\dfrac4x$ untuk $x \\ge 3$.",
            ["Menurut AM-GM, x + 4/x ≥ 2√4 = 4.", "Kesamaan terjadi saat x = 4/x, yaitu x = 2.", "Jadi nilai minimum x + 4/x adalah 4."],
            2,
            "Batas 4 hanya tercapai di $x = 2$, padahal $x \\ge 3$. Untuk $x \\ge 3$ bentuk ini naik, jadi minimumnya di $x = 3$: $3 + \\frac43 = \\frac{13}3$."
          ),
          parts(
            `Gunakan $a^3 + b^3 + c^3 - 3abc = (a + b + c)(a^2 + b^2 + c^2 - ab - bc - ca)$. ${BIG}`,
            [
              ["a³ + b³ + c³ untuk a = 17, b = −9, c = −8", "3672", 2],
              ["a² + b² + c² jika a + b + c = 6 dan ab + bc + ca = 11", "14"],
              ["a³ + b³ + c³ − 3abc untuk soal sebelumnya", "18"],
            ],
            `$17 - 9 - 8 = 0$, jadi $a^3 + b^3 + c^3 = 3abc = 3 \\cdot 17 \\cdot 9 \\cdot 8 = 3672$. Lalu $36 - 22 = 14$, dan $6 \\cdot (14 - 11) = 18$.`
          ),
        ]),
        latihan(L3, [
          num("Tentukan nilai maksimum $-x^2 + 10x - 9$.", 16, "$-(x - 5)^2 + 16$."),
          num("Pagar 60 m dipakai untuk kandang persegi panjang yang satu sisinya menempel tembok. Berapa m² luas terbesarnya?", 450, "$L = x(60 - 2x) = -2(x - 15)^2 + 450$: ukurannya $15 \\times 30$."),
          num("Untuk $x > 0$, tentukan nilai minimum $\\dfrac{x^2 + 2x + 36}{x}$.", 14, "Bentuknya $x + \\frac{36}{x} + 2 \\ge 12 + 2$, tercapai di $x = 6$."),
          num("Untuk $x > 0$, tentukan nilai minimum $x^2 + \\dfrac{16}{x}$.", 12, "Pecah $\\frac{16}{x} = \\frac8x + \\frac8x$: AM-GM tiga suku memberi $\\ge 3\\sqrt[3]{64} = 12$, tercapai saat $x^2 = \\frac8x$, yaitu $x = 2$."),
          num("Tentukan nilai minimum $x^2 + y^2 + 6x - 8y + 30$ untuk $x, y$ real.", 5, "$(x + 3)^2 + (y - 4)^2 + 30 - 9 - 16$."),
          num("Diketahui $x - \\dfrac1x = 3$. Tentukan $x^2 + \\dfrac1{x^2}$.", 11, "$(x - \\frac1x)^2 + 2 = 9 + 2$."),
          num("Diketahui $a + b + c = 0$ dan $abc = 4$. Tentukan $a^3 + b^3 + c^3$.", 12, "Jika $a + b + c = 0$ maka $a^3 + b^3 + c^3 = 3abc$."),
          frac(`Fungsi $f$ memenuhi $f(x) + 3f\\left(\\dfrac1x\\right) = 4x$ untuk setiap $x \\ne 0$. Tentukan $f(2)$. ${FRAC} Pecahan negatif ditulis dengan minus, misalnya -3/4.`, "-1/4", "$x = 2$: $f(2) + 3f(\\frac12) = 8$. $x = \\frac12$: $f(\\frac12) + 3f(2) = 2$. Dari yang kedua $f(\\frac12) = 2 - 3f(2)$, jadi $f(2) + 6 - 9f(2) = 8$ dan $f(2) = -\\frac14$."),
          frac(`Diketahui $f(x) = \\dfrac{1 + x}{1 - x}$. Tentukan hasil $f(f(f(\\cdots f(2) \\cdots)))$ dengan $f$ diterapkan $2026$ kali. ${FRAC} Pecahan negatif ditulis dengan minus.`, "-1/2", "$f(2) = -3$, $f(-3) = -\\frac12$, $f(-\\frac12) = \\frac13$, $f(\\frac13) = 2$: berulang setiap 4 langkah. $2026$ bersisa 2 dibagi 4, jadi hasilnya sama dengan langkah kedua, $-\\frac12$."),
          mc("Untuk bilangan real positif $a, b, c$ dengan $a + b + c = 3$, berapa nilai maksimum $ab + bc + ca$?", ["$1$", "$\\dfrac32$", "$3$", "$9$"], "C", "$a^2 + b^2 + c^2 \\ge ab + bc + ca$, jadi $9 = (a + b + c)^2 \\ge 3(ab + bc + ca)$. Kesamaan saat $a = b = c = 1$."),
        ]),
        uji(L3, true, [
          num("Toko menjual 200 kotak per hari seharga Rp30.000. Setiap kenaikan harga Rp1.000, penjualan turun 5 kotak. Harga berapa (dalam ribu rupiah) yang memberi pendapatan terbesar?", 35, "Naik $n$ kali: $(30 + n)(200 - 5n) = 5(30 + n)(40 - n)$, bernilai nol di $n = -30$ dan $n = 40$, puncaknya di tengah, $n = 5$.", 15),
          num("Untuk $x > 0$, tentukan nilai minimum $x + \\dfrac{4}{x^2}$.", 3, "$\\frac x2 + \\frac x2 + \\frac4{x^2} \\ge 3\\sqrt[3]{1} = 3$, tercapai saat $\\frac x2 = \\frac4{x^2}$, yaitu $x = 2$.", 15),
          num("Diketahui $x + \\dfrac1x = 5$. Tentukan $x^3 + \\dfrac1{x^3}$.", 110, "$125 - 3 \\cdot 5 = 110$.", 15),
          frac(`Fungsi $f$ memenuhi $f(x) + 2f(1 - x) = x^2$ untuk setiap $x$. Tentukan $f(0)$. ${FRAC}`, "2/3", "$x = 0$: $f(0) + 2f(1) = 0$. $x = 1$: $f(1) + 2f(0) = 1$. Jadi $f(1) = 1 - 2f(0)$ dan $f(0) + 2 - 4f(0) = 0$.", 15),
          worked(
            "Buktikan bahwa $(a + b)(b + c)(c + a) \\ge 8abc$ untuk semua bilangan real positif $a$, $b$, $c$. Kapan kesamaan terjadi?",
            "",
            0,
            [
              ["Menerapkan AM-GM: a + b ≥ 2√(ab), dan dua lainnya", 8],
              ["Mengalikan ketiganya dengan alasan bahwa semua ruas positif", 6],
              ["Menyebutkan kesamaan saat a = b = c", 6],
            ],
            "Menurut AM-GM, $a + b \\ge 2\\sqrt{ab}$, $b + c \\ge 2\\sqrt{bc}$, dan $c + a \\ge 2\\sqrt{ca}$.\n\nSemua ruas positif, jadi ketaksamaan boleh dikalikan:\n$$(a + b)(b + c)(c + a) \\ge 8\\sqrt{ab \\cdot bc \\cdot ca} = 8abc.$$\n\nKesamaan AM-GM terjadi saat $a = b$, $b = c$, dan $c = a$, jadi kesamaan terjadi tepat ketika $a = b = c$. $\\blacksquare$"
          ),
          worked(
            "Tentukan nilai minimum $x^2 + 2y^2 + 2xy - 6x - 2y + 15$ untuk $x, y$ real, dan tentukan kapan nilai itu tercapai.",
            "2",
            4,
            [
              ["Mengelompokkan menjadi (x + y − 3)² ditambah sisa yang hanya memuat y", 6],
              ["Melengkapkan kuadrat sisanya: (y + 2)² + 2", 4],
              ["Menyebutkan kapan tercapai: y = −2 dan x = 5", 6],
            ],
            "$(x + y - 3)^2 = x^2 + y^2 + 9 + 2xy - 6x - 6y$. Sisanya: $y^2 + 4y + 6 = (y + 2)^2 + 2$. Jadi\n$$x^2 + 2y^2 + 2xy - 6x - 2y + 15 = (x + y - 3)^2 + (y + 2)^2 + 2 \\ge 2.$$\n\nNilai 2 tercapai saat $y + 2 = 0$ dan $x + y - 3 = 0$, yaitu $y = -2$, $x = 5$. Minimumnya $2$."
          ),
        ]),
      ],
    },
  ],
  closing: [],
};
