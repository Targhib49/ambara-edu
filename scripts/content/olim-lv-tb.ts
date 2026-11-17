/**
 * Teori Bilangan — the three levels of the Junior Path module, each with its
 * quizzes. New problems in the module's patterns, never its own Contoh or
 * Latihan, and none of the MS²C graded items. Answers are recomputed in
 * scripts/check-olim-levels.py.
 */
import { BIG, drill, langkah, latihan, levelIntro, mc, mistake, ms, num, parts, review, steps, uji, worked, type LevelChapter } from "./olim-levels-types";

const L1 = "Teori Bilangan Level 1";
const L2 = "Teori Bilangan Level 2";
const L3 = "Teori Bilangan Level 3";

export const LV_TEORI_BILANGAN: LevelChapter = {
  chapterTitle: "Teori Bilangan",
  levels: [
    {
      title: "Level 1: Mengenal Pembagi",
      pdfDir: "olim-jp-tb-1",
      pdfName: "Teori-Bilangan-Level-1-Mengenal-Pembagi.pdf",
      intro: levelIntro(1, "keterbagian, ciri-ciri habis dibagi, bilangan prima dan faktorisasi prima, FPB dan KPK", true),
      quizzes: [
        langkah(L1, [
          steps(
            "Tentukan semua bilangan asli $n$ sehingga $(n + 4) \\mid (n + 22)$. Ikuti langkahnya.",
            [
              ["n + 4 juga membagi selisih (n + 22) − (n + 4). Berapa selisih itu?", "18"],
              ["Ada berapa faktor positif dari 18?", "6"],
              ["Karena n ≥ 1, maka n + 4 ≥ 5. Ada berapa faktor 18 yang ≥ 5?", "3"],
              ["Berapa jumlah semua nilai n yang memenuhi?", "21"],
            ],
            "Selisihnya $18$, jadi $n + 4$ faktor dari $18$ yang paling sedikit $5$: $6, 9, 18$. Maka $n = 2, 5, 14$ dan jumlahnya $21$. Cek: $24 \\div 6$, $27 \\div 9$, $36 \\div 18$ semuanya bulat."
          ),
          steps(
            "Bilangan empat digit $\\overline{5A6B}$ habis dibagi $36$. Tentukan semua kemungkinannya.",
            [
              ["36 = 4 × …, dengan kedua faktor saling prima. Isi titik-titiknya.", "9"],
              ["Supaya habis dibagi 4, dua digit terakhir 6B harus kelipatan 4. Ada berapa pilihan B?", "3"],
              ["Untuk setiap B, jumlah digit 5 + A + 6 + B harus kelipatan 9. Ada berapa bilangan yang memenuhi?", "3"],
              ["Berapa bilangan terbesar yang memenuhi?", "5868"],
            ],
            "$36 = 4 \\times 9$. Dua digit terakhir $60, 64, 68$ habis dibagi 4, jadi $B = 0, 4, 8$. Lalu $11 + A + B$ kelipatan 9: $B = 0$ memberi $A = 7$, $B = 4$ memberi $A = 3$, $B = 8$ memberi $A = 8$. Bilangannya $5760$, $5364$, $5868$."
          ),
          parts(
            `Tentukan FPB dan KPK dari $90$ dan $168$ lewat faktorisasi prima: $90 = 2 \\cdot 3^2 \\cdot 5$ dan $168 = 2^3 \\cdot 3 \\cdot 7$. ${BIG}`,
            [
              ["Pangkat 2 pada FPB", "1"],
              ["FPB(90, 168)", "6"],
              ["KPK(90, 168)", "2520", 2],
              ["Cek: FPB × KPK = 90 × 168 = …", "15120"],
            ],
            "FPB mengambil prima yang sama dengan pangkat terkecil: $2 \\cdot 3 = 6$. KPK mengambil semua prima dengan pangkat terbesar: $2^3 \\cdot 3^2 \\cdot 5 \\cdot 7 = 2520$. Cek: $6 \\times 2520 = 15\\,120 = 90 \\times 168$."
          ),
          steps(
            "Hitung $\\text{FPB}(1147, 851)$ dengan algoritma Euclid.",
            [
              ["Sisa 1147 dibagi 851", "296"],
              ["Sisa 851 dibagi 296", "259"],
              ["Sisa 296 dibagi 259", "37"],
              ["Sisa 259 dibagi 37", "0"],
              ["FPB(1147, 851)", "37"],
            ],
            "$1147 = 1 \\cdot 851 + 296$, $851 = 2 \\cdot 296 + 259$, $296 = 1 \\cdot 259 + 37$, $259 = 7 \\cdot 37 + 0$. Sisa terakhir yang bukan nol adalah $37$. Memang $1147 = 31 \\cdot 37$ dan $851 = 23 \\cdot 37$."
          ),
          mistake(
            "Rina memeriksa apakah 323 bilangan prima.",
            ["√323 ≈ 17,97, jadi cukup dicek prima sampai 17.", "323 tidak habis dibagi 2, 3, 5, 7, 11, dan 13.", "323 tidak habis dibagi 17.", "Jadi 323 bilangan prima."],
            2,
            "$323 = 17 \\times 19$. Pengecekannya benar sampai 13, tetapi 17 justru membagi 323, jadi 323 bukan prima."
          ),
          parts(
            "Lampu A berkedip setiap 12 detik, lampu B setiap 18 detik, dan lampu C setiap 30 detik. Ketiganya berkedip bersamaan tepat pukul 08.00.00.",
            [
              ["Setiap berapa detik ketiganya berkedip bersamaan?", "180"],
              ["Berapa kali ketiganya berkedip bersamaan sesudah 08.00.00 sampai 09.00.00 (09.00.00 ikut dihitung)?", "20"],
            ],
            "$\\text{KPK}(12, 18, 30) = 2^2 \\cdot 3^2 \\cdot 5 = 180$ detik. Satu jam $= 3600$ detik, dan $3600 \\div 180 = 20$."
          ),
        ]),
        latihan(L1, [
          num("Ada berapa bilangan asli $n$ sehingga $n \\mid (n + 48)$?", 10, "$n \\mid n$, jadi $n \\mid 48$. Faktor positif $48 = 2^4 \\cdot 3$ ada $5 \\cdot 2 = 10$."),
          num("Ada berapa bilangan asli $n$ sehingga $(n + 2) \\mid (n + 20)$?", 4, "$(n + 2) \\mid 18$ dan $n + 2 \\ge 3$: pilihannya $3, 6, 9, 18$, yaitu $n = 1, 4, 7, 16$."),
          num("Tentukan digit $a$ sehingga $\\overline{4a8a2}$ habis dibagi $11$.", 7, "Posisi ganjil $4 + 8 + 2 = 14$, posisi genap $2a$. $14 - 2a$ harus kelipatan 11, dan karena $a$ digit hanya $14 - 2a = 0$ yang mungkin. Cek: $47872 = 11 \\times 4352$."),
          mc("Bilangan manakah yang habis dibagi $24$?", ["$2196$", "$3652$", "$4380$", "$5328$"], "D", "$24 = 3 \\times 8$. $5328$: jumlah digit $18$ dan $328 = 8 \\times 41$. Yang lain gagal: $196$ tidak habis dibagi 8, jumlah digit $3652$ adalah 16, dan $380$ tidak habis dibagi 8."),
          num("Berapa faktor prima terbesar dari $2026$?", 1013, "$2026 = 2 \\times 1013$. Untuk $1013$ cukup dicek prima sampai $31$ (karena $32^2 > 1013$), dan tidak ada yang membagi. Jadi $1013$ prima."),
          num("Ada berapa bilangan prima di antara $80$ dan $100$?", 3, "$83$, $89$, dan $97$. Yang lain habis dibagi 2, 3, 5, atau 7 (misalnya $91 = 7 \\times 13$)."),
          num("Tentukan bilangan prima $p$ sehingga $2p + 1$ dan $4p + 1$ juga prima.", 3, "Lihat sisa $p$ dibagi 3. Jika sisanya 1, $2p + 1$ habis dibagi 3; jika sisanya 2, $4p + 1$ habis dibagi 3. Jadi $p = 3$, dan memang $7$ serta $13$ prima."),
          num("Dua bilangan asli $a < b$ memiliki FPB $8$ dan KPK $480$. Ada berapa pasangan $(a, b)$?", 4, "$a = 8m$, $b = 8n$ dengan $m, n$ saling prima dan $mn = 480 \\cdot 8 / 64 = 60$. Pasangan saling prima: $(1, 60), (3, 20), (4, 15), (5, 12)$. $(2, 30)$ dan $(6, 10)$ dibuang."),
          num("Hasil kali dua bilangan asli adalah $2160$ dan FPB-nya $12$. Berapa KPK-nya?", 180, "$\\text{FPB} \\times \\text{KPK} = a \\times b$, jadi $\\text{KPK} = 2160 \\div 12 = 180$."),
          num("Hitung $\\text{FPB}(1517, 1271)$.", 41, "Euclid: $1517 - 1271 = 246$, $1271 = 5 \\cdot 246 + 41$, $246 = 6 \\cdot 41$. Jadi FPB-nya $41$."),
        ]),
        drill(L1, "FPB & KPK", "gcd-lcm"),
        uji(L1, false, [
          num("Ada berapa bilangan asli $n$ sehingga $(n + 5) \\mid (n + 41)$?", 5, "$(n + 5) \\mid 36$ dengan $n + 5 \\ge 6$: $6, 9, 12, 18, 36$.", 20),
          num("Bilangan $\\overline{3A7B}$ habis dibagi $45$. Berapa bilangan terbesar yang mungkin?", 3870, "$45 = 5 \\times 9$, jadi $B = 0$ atau $5$. $B = 0$: $10 + A$ kelipatan 9, $A = 8$. $B = 5$: $15 + A$, $A = 3$. Bilangannya $3870$ dan $3375$.", 20),
          num("Hitung $\\text{FPB}(391, 299)$.", 23, "$391 - 299 = 92$, $299 = 3 \\cdot 92 + 23$, $92 = 4 \\cdot 23$. FPB-nya $23$.", 20),
          num("Dua bilangan asli $a < b$ memiliki FPB $9$ dan KPK $270$. Berapa nilai $a + b$ yang terkecil?", 99, "$a = 9m$, $b = 9n$, $mn = 30$, saling prima: $(1, 30), (2, 15), (3, 10), (5, 6)$. Jumlah terkecil dari $(5, 6)$: $45 + 54 = 99$.", 20),
          num("Tentukan bilangan prima $p$ sehingga $p + 4$ dan $p + 8$ juga prima.", 3, "Jika $p$ bersisa 1 dibagi 3, $p + 8$ habis dibagi 3; jika bersisa 2, $p + 4$ habis dibagi 3. Jadi $p = 3$: $7$ dan $11$ prima.", 20),
        ]),
      ],
    },
    {
      title: "Level 2: Bermain dengan Sisa",
      pdfDir: "olim-jp-tb-2",
      pdfName: "Teori-Bilangan-Level-2-Bermain-dengan-Sisa.pdf",
      intro: levelIntro(2, "banyak dan jumlah faktor, pembagian bersisa, aritmetika modular, digit terakhir, angka nol di akhir n!, persamaan Diophantine linear", true),
      quizzes: [
        langkah(L2, [
          steps(
            "Tentukan bilangan asli terkecil yang memiliki tepat $18$ faktor positif.",
            [
              ["18 = 9 × 2 memberi bentuk p⁸q. Calon terkecilnya?", "768"],
              ["18 = 6 × 3 memberi bentuk p⁵q². Calon terkecilnya?", "288"],
              ["18 = 3 × 3 × 2 memberi bentuk p²q²r. Calon terkecilnya?", "180"],
              ["Jawabannya", "180"],
            ],
            "Bentuk $p^{17}$ jelas terlalu besar. $2^8 \\cdot 3 = 768$, $2^5 \\cdot 3^2 = 288$, $2^2 \\cdot 3^2 \\cdot 5 = 180$. Yang terkecil $180$, dengan $(2+1)(2+1)(1+1) = 18$ faktor."
          ),
          steps(
            "Tentukan sisa $3^{2026}$ dibagi $7$.",
            [
              ["Pangkat 3 terkecil yang bersisa 1 jika dibagi 7", "6"],
              ["Sisa 2026 dibagi 6", "4"],
              ["Sisa 3⁴ = 81 dibagi 7", "4"],
            ],
            "$3, 2, 6, 4, 5, 1$ adalah sisa $3^1$ sampai $3^6$. Karena $2026 = 6 \\cdot 337 + 4$, $3^{2026} \\equiv 3^4 = 81 \\equiv 4 \\pmod 7$."
          ),
          parts(
            "Rumus $\\lfloor n/p \\rfloor + \\lfloor n/p^2 \\rfloor + \\cdots$ berlaku untuk prima apa saja.",
            [
              ["Banyak angka 0 di akhir 150!", "37"],
              ["Pangkat 2 tertinggi yang membagi 20!", "18"],
              ["Pangkat 3 tertinggi yang membagi 100!", "48"],
            ],
            "$150!$: $30 + 6 + 1 = 37$. $20!$ dengan $p = 2$: $10 + 5 + 2 + 1 = 18$. $100!$ dengan $p = 3$: $33 + 11 + 3 + 1 = 48$."
          ),
          steps(
            "Ada berapa pasangan bilangan asli $(x, y)$ yang memenuhi $5x + 8y = 200$?",
            [
              ["5x dan 200 kelipatan 5, jadi 8y juga. Maka y kelipatan …", "5"],
              ["x ≥ 1 berarti 8y ≤ 195. y terbesar yang mungkin?", "20"],
              ["Banyak pasangan", "4"],
            ],
            "$y = 5, 10, 15, 20$ dengan $x = 32, 24, 16, 8$. Setiap $y$ naik 5, $x$ turun 8."
          ),
          mistake(
            "Budi mencari angka satuan $8^{2024}$.",
            ["Pola angka satuan 8: 8, 4, 2, 6, panjangnya 4.", "2024 = 4 × 506, sisanya 0.", "Sisa 0 berarti ambil angka pertama pola, yaitu 8.", "Jadi angka satuan 8²⁰²⁴ adalah 8."],
            2,
            "Sisa 0 berarti pangkatnya kelipatan panjang pola, jadi ambil angka **terakhir** pola: $6$."
          ),
          parts(
            "Bilangan $n$ dibagi $7$ bersisa $5$.",
            [
              ["Sisa 4n + 3 dibagi 7", "2"],
              ["Sisa n² dibagi 7", "4"],
              ["Sisa n³ + 1 dibagi 7", "0"],
            ],
            "Ganti $n$ dengan $5$: $4 \\cdot 5 + 3 = 23 \\equiv 2$, $5^2 = 25 \\equiv 4$, $5^3 + 1 = 126 = 7 \\cdot 18$."
          ),
        ]),
        latihan(L2, [
          num("Ada berapa faktor positif dari $1200$?", 30, "$1200 = 2^4 \\cdot 3 \\cdot 5^2$, jadi $5 \\cdot 2 \\cdot 3 = 30$."),
          num("Berapa jumlah semua faktor positif dari $72$?", 195, "$72 = 2^3 \\cdot 3^2$: $(1 + 2 + 4 + 8)(1 + 3 + 9) = 15 \\cdot 13 = 195$."),
          num("Ada berapa faktor positif ganjil dari $720$?", 6, "$720 = 2^4 \\cdot 3^2 \\cdot 5$. Faktor ganjil adalah faktor $3^2 \\cdot 5 = 45$: $3 \\cdot 2 = 6$."),
          num("Tentukan sisa $2^{50}$ dibagi $7$.", 4, "$2^3 = 8 \\equiv 1$. $50 = 3 \\cdot 16 + 2$, jadi $2^{50} \\equiv 2^2 = 4$."),
          num("Tentukan dua digit terakhir dari $11^{37}$.", 71, "Pangkat 11 modulo 100: $11, 21, 31, 41, \\ldots$ — digit puluhannya naik satu setiap kali. Jadi $11^{37} \\equiv 1 + 10 \\cdot 37 = 371 \\equiv 71$."),
          num("Tentukan angka satuan dari $2^{2026} + 3^{2027}$.", 1, "$2026$ bersisa 2 dibagi 4, jadi $2^{2026}$ berakhiran 4. $2027$ bersisa 3, jadi $3^{2027}$ berakhiran 7. $4 + 7 = 11$."),
          num("Ada berapa angka nol di akhir $500!$?", 124, "$100 + 20 + 4 = 124$."),
          num("Ada berapa angka nol di akhir bilangan $\\dfrac{100!}{50!}$?", 12, "Faktor 5 di $100!$ ada 24, di $50!$ ada 12, sisa 12. Faktor 2 sisa jauh lebih banyak ($97 - 47 = 50$), jadi nolnya 12."),
          mc("Persamaan manakah yang **tidak** punya solusi bilangan bulat?", ["$6x + 10y = 14$", "$9x + 12y = 21$", "$8x + 12y = 18$", "$7x + 5y = 1$"], "C", "$\\text{FPB}(8, 12) = 4$ tidak membagi $18$. Untuk yang lain FPB-nya ($2$, $3$, $1$) membagi ruas kanan."),
          num("Ada berapa pasangan bilangan bulat tak negatif $(x, y)$ yang memenuhi $3x + 7y = 100$?", 5, "Modulo 3: $7y \\equiv 100$ berarti $y \\equiv 1$. Jadi $y = 1, 4, 7, 10, 13$ (karena $7y \\le 100$)."),
        ]),
        drill(L2, "Angka Satuan", "last-digit"),
        drill(L2, "Banyak Faktor", "divisor-count"),
        drill(L2, "Angka Nol di Akhir n!", "trailing-zeros"),
        uji(L2, false, [
          num("Tentukan bilangan asli terkecil yang memiliki tepat $16$ faktor positif.", 120, "$16 = 8 \\cdot 2 = 4 \\cdot 4 = 4 \\cdot 2 \\cdot 2 = 2 \\cdot 2 \\cdot 2 \\cdot 2$. Calonnya $2^7 \\cdot 3 = 384$, $2^3 \\cdot 3^3 = 216$, $2^3 \\cdot 3 \\cdot 5 = 120$, $2 \\cdot 3 \\cdot 5 \\cdot 7 = 210$.", 20),
          num("Tentukan sisa $5^{100}$ dibagi $13$.", 1, "$5^2 = 25 \\equiv -1$, jadi $5^4 \\equiv 1$. Karena $100$ kelipatan 4, sisanya 1.", 20),
          num("Tentukan angka satuan dari $1^{2026} + 2^{2026} + 3^{2026} + 4^{2026}$.", 0, "$2026$ bersisa 2 dibagi 4: angka satuannya $1, 4, 9, 6$, jumlahnya $20$.", 20),
          num("Ada berapa angka nol di akhir $1000!$?", 249, "$200 + 40 + 8 + 1 = 249$.", 20),
          num("Pensil Rp2.000 dan buku Rp7.000. Rina berbelanja tepat Rp60.000, masing-masing paling sedikit satu. Ada berapa cara?", 4, "$2x + 7y = 60$ dengan $x, y \\ge 1$: $y$ genap dan $7y \\le 58$, jadi $y = 2, 4, 6, 8$.", 20),
        ]),
      ],
    },
    {
      title: "Level 3: Dari Menghitung ke Membuktikan",
      pdfDir: "olim-jp-tb-3",
      pdfName: "Teori-Bilangan-Level-3-Dari-Menghitung-ke-Membuktikan.pdf",
      intro: levelIntro(3, "teorema Fermat kecil, bentuk aⁿ − bⁿ dan aⁿ + bⁿ, persamaan Diophantine non-linear, dan cara menulis bukti", true),
      quizzes: [
        langkah(L3, [
          steps(
            "Tentukan sisa $2^{2026}$ dibagi $17$ dengan teorema Fermat kecil.",
            [
              ["Menurut Fermat, 2ᵏ ≡ 1 (mod 17) untuk k = …", "16"],
              ["Sisa 2026 dibagi 16", "10"],
              ["Sisa 2¹⁰ = 1024 dibagi 17", "4"],
            ],
            "$2^{16} \\equiv 1 \\pmod{17}$ dan $2026 = 16 \\cdot 126 + 10$, jadi $2^{2026} \\equiv 2^{10} = 1024 = 17 \\cdot 60 + 4$."
          ),
          steps(
            "Tentukan semua pasangan bilangan asli $(x, y)$ dengan $xy = 4x + 5y$.",
            [
              ["xy − 4x − 5y = 0. Bilangan berapa yang ditambahkan ke kedua ruas agar menjadi (x − 5)(y − 4)?", "20"],
              ["Kedua faktor tidak bisa negatif. Ada berapa faktor positif dari 20?", "6"],
              ["Ada berapa pasangan (x, y)?", "6"],
              ["Nilai x terbesar", "25"],
            ],
            "$(x - 5)(y - 4) = 20$. Kalau keduanya negatif, $x - 5 \\ge -4$ memaksa $y - 4 \\le -5$, jadi $y$ negatif. Enam pasangan faktor positif memberi enam solusi; $x - 5 = 20$, $y - 4 = 1$ memberi $x = 25$."
          ),
          parts(
            "Gunakan $(a - b) \\mid (a^n - b^n)$ dan, untuk $n$ ganjil, $(a + b) \\mid (a^n + b^n)$.",
            [
              ["Sisa 9²⁰²⁶ − 2²⁰²⁶ dibagi 7", "0"],
              ["Sisa 9²⁰²⁶ + 2²⁰²⁶ dibagi 7", "4"],
              ["Sisa 4²⁰²⁷ + 3²⁰²⁷ dibagi 7", "0"],
            ],
            "$9 \\equiv 2 \\pmod 7$, jadi selisihnya habis dibagi 7, dan jumlahnya $\\equiv 2 \\cdot 2^{2026}$. Karena $2^3 \\equiv 1$ dan $2026 = 3 \\cdot 675 + 1$, $2^{2026} \\equiv 2$, sehingga jumlahnya $\\equiv 4$. Terakhir, $4 + 3 = 7$ dan $2027$ ganjil."
          ),
          steps(
            "Tunjukkan bahwa $x^2 + y^2 + z^2 = 2023$ tidak punya solusi bilangan bulat, dengan melihat sisa pembagian oleh $8$.",
            [
              ["Sisa kuadrat bilangan ganjil jika dibagi 8", "1"],
              ["Kuadrat bilangan bulat hanya bisa bersisa 0, 1, atau 4 jika dibagi 8. Ada berapa kemungkinan sisa itu?", "3"],
              ["Sisa 2023 dibagi 8", "7"],
              ["Sisa berapa (0–7) yang tidak pernah dihasilkan x² + y² + z² modulo 8?", "7"],
            ],
            "Jumlah tiga bilangan dari $\\{0, 1, 4\\}$ bisa bersisa $0$ sampai $6$, tetapi tidak pernah $7$. Karena $2023 = 8 \\cdot 252 + 7$, tidak ada solusi."
          ),
          mistake(
            "Dina membuktikan dengan induksi bahwa $5^n - 1$ habis dibagi $4$.",
            ["Untuk n = 1: 5 − 1 = 4, habis dibagi 4.", "Andaikan 4 ∣ 5ᵏ − 1.", "5ᵏ⁺¹ − 1 = 5 · 5ᵏ − 1 = 5(5ᵏ − 1) + 5.", "Suku pertama habis dibagi 4 dan suku kedua 4, jadi 4 ∣ 5ᵏ⁺¹ − 1."],
            2,
            "$5(5^k - 1) = 5^{k+1} - 5$, jadi yang ditambahkan seharusnya $4$, bukan $5$: $5^{k+1} - 1 = 5(5^k - 1) + 4$."
          ),
          mistake(
            "Andi mencari sisa $2^{100}$ dibagi $15$.",
            ["Menurut teorema Fermat kecil, 2¹⁴ ≡ 1 (mod 15).", "2⁴ = 16 ≡ 1 (mod 15).", "100 = 4 × 25, jadi 2¹⁰⁰ = (2⁴)²⁵ ≡ 1.", "Sisanya 1."],
            0,
            "Fermat hanya berlaku untuk modulus prima, dan $15$ bukan prima. Faktanya $2^{14} = 16384 \\equiv 4 \\pmod{15}$. Baris lainnya benar."
          ),
        ]),
        latihan(L3, [
          num("Tentukan sisa $3^{2026}$ dibagi $13$.", 3, "$3^3 = 27 \\equiv 1 \\pmod{13}$, dan $2026 = 3 \\cdot 675 + 1$."),
          num("Tentukan sisa $2^{2026}$ dibagi $11$.", 9, "Fermat: $2^{10} \\equiv 1$. $2026$ bersisa 6 dibagi 10, dan $2^6 = 64 = 5 \\cdot 11 + 9$."),
          num("Tentukan sisa $1^{12} + 2^{12} + 3^{12} + \\cdots + 12^{12}$ dibagi $13$.", 12, "Menurut Fermat setiap $a^{12} \\equiv 1 \\pmod{13}$ untuk $a = 1, \\ldots, 12$. Jumlah dua belas angka 1 adalah $12$."),
          num("Tentukan sisa $10^{2026} + 4^{2026}$ dibagi $7$.", 1, "$10 \\equiv 3$. $3^6 \\equiv 1$ dan $2026$ bersisa 4 dibagi 6: $3^4 = 81 \\equiv 4$. $4^3 = 64 \\equiv 1$ dan $2026$ bersisa 1 dibagi 3: $4$. Jumlahnya $8 \\equiv 1$."),
          num("Ada berapa pasangan bilangan asli $(x, y)$ yang memenuhi $\\dfrac1x + \\dfrac1y = \\dfrac16$?", 9, "Kalikan $6xy$: $xy = 6x + 6y$, jadi $(x - 6)(y - 6) = 36$. Faktor negatif membuat $x$ atau $y$ tidak positif, dan $36$ punya 9 faktor positif."),
          num("Ada berapa pasangan bilangan bulat tak negatif $(x, y)$ dengan $x^2 - y^2 = 45$?", 3, "$(x - y)(x + y) = 45$ dengan $x - y \\le x + y$: $1 \\cdot 45$, $3 \\cdot 15$, $5 \\cdot 9$, memberi $(23, 22)$, $(9, 6)$, $(7, 2)$."),
          mc("Bentuk manakah yang habis dibagi $7$ untuk **setiap** bilangan asli $n$?", ["$9^n - 1$", "$6^n + 1$", "$8^n - 1$", "$2^n + 5$"], "C", "$8 - 1 = 7$, jadi $7 \\mid 8^n - 1^n$. Yang lain gagal: $9 - 1 = 8$, $6^2 + 1 = 37$, $2^2 + 5 = 9$."),
          ms(
            "Bentuk mana saja yang habis dibagi $6$ untuk setiap bilangan bulat $n$?",
            ["$n^5 - n$", "$n^3 + 5n$", "$n^2 + n$", "$2n^3 + 3n^2 + n$"],
            ["A", "B", "D"],
            "$n^5 - n$ habis dibagi 2 dan 3 (Fermat untuk $p = 2, 3$). $n^3 + 5n = (n^3 - n) + 6n$. $2n^3 + 3n^2 + n = n(n + 1)(2n + 1)$, yaitu $6$ kali jumlah kuadrat $1^2 + \\cdots + n^2$. Tetapi $n^2 + n$ untuk $n = 1$ adalah $2$."
          ),
          num("Tentukan bilangan asli terbesar $n$ sehingga $(n + 10) \\mid (n^3 + 100)$.", 890, "Modulo $n + 10$: $n \\equiv -10$, jadi $n^3 + 100 \\equiv -1000 + 100 = -900$. Maka $(n + 10) \\mid 900$, dan terbesar $n + 10 = 900$."),
          num("Ada berapa tripel bilangan asli $x \\le y \\le z$ dengan $\\dfrac1x + \\dfrac1y + \\dfrac1z = 1$?", 3, "$\\frac1x$ terbesar, jadi $\\frac3x \\ge 1$ dan $x \\le 3$; $x = 1$ mustahil. $x = 2$: $\\frac1y + \\frac1z = \\frac12$ memberi $(4, 4)$ dan $(3, 6)$. $x = 3$: $(3, 3)$. Tripelnya $(2, 4, 4)$, $(2, 3, 6)$, $(3, 3, 3)$."),
        ]),
        drill(L3, "Sisa Perpangkatan", "power-remainder"),
        uji(L3, true, [
          num("Tentukan sisa $7^{2026}$ dibagi $13$.", 4, "Fermat: $7^{12} \\equiv 1$. $2026 = 12 \\cdot 168 + 10$, jadi cari $7^{10}$. $7^2 = 49 \\equiv 10$, $7^4 \\equiv 100 \\equiv 9$, $7^8 \\equiv 81 \\equiv 3$, $7^{10} = 7^8 \\cdot 7^2 \\equiv 30 \\equiv 4$.", 15),
          num("Ada berapa pasangan bilangan asli $(x, y)$ dengan $xy = 3x + 5y + 2$?", 2, "$(x - 5)(y - 3) = 17$. Faktor negatif tidak mungkin ($x - 5 \\ge -4$ dan $y - 3 \\ge -2$), jadi $1 \\cdot 17$ atau $17 \\cdot 1$: $(6, 20)$ dan $(22, 4)$.", 15),
          num("Tentukan sisa $1^{2026} + 2^{2026} + 3^{2026} + 4^{2026} + 5^{2026} + 6^{2026}$ dibagi $7$.", 0, "Fermat: $a^6 \\equiv 1$, dan $2026$ bersisa 4 dibagi 6, jadi jumlahnya $\\equiv 1^4 + 2^4 + \\cdots + 6^4 \\equiv 1 + 2 + 4 + 4 + 2 + 1 = 14 \\equiv 0$.", 15),
          num("Tentukan bilangan asli terbesar $n$ sehingga $(n + 5) \\mid (n^2 + 50)$.", 70, "$n \\equiv -5$ memberi $n^2 + 50 \\equiv 75$, jadi $(n + 5) \\mid 75$ dan terbesar $n + 5 = 75$.", 15),
          worked(
            "Buktikan bahwa $n^5 - 5n^3 + 4n$ habis dibagi $120$ untuk setiap bilangan bulat $n$.",
            "",
            0,
            [
              ["Memfaktorkan menjadi (n − 2)(n − 1)n(n + 1)(n + 2)", 8],
              ["Menjelaskan bahwa hasil kali lima bilangan bulat berurutan habis dibagi 8, 3, dan 5", 8],
              ["Menyimpulkan habis dibagi 120 karena 8, 3, 5 saling prima", 4],
            ],
            "Faktorkan: $n^5 - 5n^3 + 4n = n(n^4 - 5n^2 + 4) = n(n^2 - 1)(n^2 - 4) = (n - 2)(n - 1)n(n + 1)(n + 2)$.\n\nIni hasil kali lima bilangan bulat berurutan. Di antara lima bilangan berurutan ada kelipatan 5 dan kelipatan 3. Ada juga paling sedikit dua bilangan genap, dan dari dua bilangan genap berurutan salah satunya kelipatan 4, sehingga hasil kalinya habis dibagi $2 \\cdot 4 = 8$.\n\nKarena $8$, $3$, $5$ saling prima, hasil kalinya habis dibagi $8 \\cdot 3 \\cdot 5 = 120$. $\\blacksquare$"
          ),
          worked(
            "Tentukan semua bilangan prima $p$ sehingga $2^p + p^2$ juga prima. Buktikan bahwa tidak ada jawaban lain.",
            "3",
            4,
            [
              ["Mencoba p = 2 (gagal) dan p = 3 (berhasil, 17)", 4],
              ["Untuk prima p > 3: p² ≡ 1 (mod 3)", 4],
              ["Untuk p ganjil: 2ᵖ ≡ −1 ≡ 2 (mod 3)", 4],
              ["Menyimpulkan 2ᵖ + p² habis dibagi 3 dan lebih dari 3, jadi bukan prima", 4],
            ],
            "Coba: $p = 2$ memberi $4 + 4 = 8$, bukan prima. $p = 3$ memberi $8 + 9 = 17$, prima.\n\nAmbil prima $p > 3$. Maka $p$ tidak habis dibagi 3, sehingga $p^2 \\equiv 1 \\pmod 3$. Karena $p$ ganjil dan $2 \\equiv -1 \\pmod 3$, $2^p \\equiv (-1)^p = -1 \\pmod 3$. Jadi $2^p + p^2 \\equiv -1 + 1 = 0 \\pmod 3$, padahal $2^p + p^2 > 3$. Bilangan itu bukan prima.\n\nJadi satu-satunya jawaban $p = 3$. $\\blacksquare$"
          ),
        ]),
      ],
    },
  ],
  closing: [review("Teori Bilangan")],
};


