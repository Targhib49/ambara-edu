/**
 * Geometri Bidang dan Ruang — the three levels of the Junior Path module, each
 * with its quizzes. New problems in the module's patterns. Answers are
 * recomputed in scripts/check-olim-levels.py.
 */
import { BIG, FRAC, drill, frac, langkah, latihan, levelIntro, mc, mistake, num, parts, review, steps, uji, worked, type LevelChapter } from "./olim-levels-types";

const L1 = "Geometri Level 1";
const L2 = "Geometri Level 2";
const L3 = "Geometri Level 3";

export const LV_GEOMETRI: LevelChapter = {
  chapterTitle: "Geometri",
  levels: [
    {
      title: "Level 1: Mengukur Bangun",
      pdfDir: "olim-jp-geo-1",
      pdfName: "Geometri-Level-1-Mengukur-Bangun.pdf",
      intro: levelIntro(1, "sudut, garis sejajar, dan poligon, luas bangun datar, teorema Pythagoras, koordinat Kartesius", true),
      quizzes: [
        langkah(L1, [
          steps(
            `Setiap sudut dalam sebuah segi-$n$ beraturan besarnya 4 kali sudut luarnya. Tentukan $n$. ${BIG}`,
            [
              ["Sudut dalam + sudut luar = 180°. Besar sudut luar (derajat)?", "36"],
              ["n = …", "10"],
              ["Jumlah sudut dalam segi-n itu (derajat)", "1440"],
            ],
            "$5 \\times \\text{sudut luar} = 180^\\circ$, jadi sudut luarnya $36^\\circ$ dan $n = 360 \\div 36 = 10$. Jumlah sudut dalamnya $8 \\times 180^\\circ = 1440^\\circ$."
          ),
          steps(
            "Tentukan luas segitiga dengan sisi $10$, $17$, dan $21$. Tarik garis tinggi ke sisi $21$.",
            [
              ["Kaki garis tinggi membagi sisi 21 menjadi x (di sisi 10) dan 21 − x. x = …", "6"],
              ["Tinggi segitiga", "8"],
              ["Luas", "84"],
            ],
            "$100 - x^2 = 289 - (21 - x)^2$ memberi $42x = 252$, $x = 6$. Tinggi $\\sqrt{100 - 36} = 8$, luas $\\frac12 \\cdot 21 \\cdot 8 = 84$."
          ),
          parts(
            "Diketahui titik $A(-1, 2)$, $B(5, 10)$, dan $C(7, 0)$.",
            [
              ["Panjang AB", "10"],
              ["Koordinat x titik tengah BC", "6"],
              ["Luas segitiga ABC", "38", 2],
            ],
            "$AB = \\sqrt{36 + 64}$. Titik tengah $BC$ adalah $(6, 5)$. Luas $= \\frac12\\left|-1(10 - 0) + 5(0 - 2) + 7(2 - 10)\\right| = \\frac12 \\cdot 76$."
          ),
          steps(
            "Sebuah lingkaran digambar di dalam persegi bersisi 14 cm sehingga menyinggung keempat sisinya. Tentukan luas daerah di dalam persegi tetapi di luar lingkaran ($\\pi = \\frac{22}7$).",
            [
              ["Jari-jari lingkaran (cm)", "7"],
              ["Luas lingkaran (cm²)", "154"],
              ["Luas daerah yang dicari (cm²)", "42"],
            ],
            "$\\frac{22}7 \\cdot 49 = 154$, dan $196 - 154 = 42$."
          ),
          mistake(
            "Sebuah segitiga siku-siku memiliki sisi siku-siku 8 dan sisi miring 17. Dodi mencari sisi ketiganya.",
            ["Sisi miring berhadapan dengan sudut siku-siku.", "x² = 8² + 17²", "x = √353"],
            1,
            "17 adalah sisi miring, jadi $x^2 = 17^2 - 8^2 = 225$ dan $x = 15$."
          ),
          parts(
            "Sebuah balok berukuran $6 \\times 8 \\times 24$.",
            [
              ["Panjang diagonal alas 6 × 8", "10"],
              ["Panjang diagonal ruang", "26"],
            ],
            "$\\sqrt{36 + 64} = 10$, lalu $\\sqrt{10^2 + 24^2} = 26$ (tripel 10-24-26)."
          ),
        ]),
        latihan(L1, [
          num("Perbandingan besar sudut-sudut segitiga $1 : 2 : 6$. Berapa derajat sudut terbesarnya?", 120, "9 bagian $= 180^\\circ$, satu bagian $20^\\circ$."),
          num(`Berapa derajat jumlah sudut dalam segi-15? ${BIG}`, 2340, "$(15 - 2) \\times 180^\\circ$."),
          num("Setiap sudut dalam segi-$n$ beraturan $165^\\circ$. Tentukan $n$.", 24, "Sudut luar $15^\\circ$, dan $360 \\div 15 = 24$."),
          num("Trapesium sama kaki memiliki sisi sejajar 12 dan 20 serta kaki 5. Berapa luasnya?", 48, "Selisih alas $8$ terbagi dua, $4$ di setiap sisi, jadi tinggi $\\sqrt{25 - 16} = 3$. Luas $\\frac12 \\cdot 32 \\cdot 3$."),
          num("Luas segitiga $ABC$ adalah 90. $D$ pada $BC$ dengan $BD : DC = 1 : 2$, dan $E$ titik tengah $AD$. Berapa luas segitiga $BDE$?", 15, "Luas $ABD = \\frac13 \\cdot 90 = 30$, dan $E$ membagi $AD$ dua sama besar, jadi $BDE = 15$."),
          num("Tangga 25 m bersandar di dinding dengan kaki 7 m dari dinding. Ujung atasnya merosot 4 m. Berapa meter kaki tangga bergeser?", 8, "Mula-mula tinggi $24$. Setelah merosot $20$, jarak kaki $\\sqrt{625 - 400} = 15$. Bergeser $15 - 7$."),
          num("Segitiga siku-siku memiliki sisi miring 26 dan keliling 60. Berapa luasnya?", 120, "$a + b = 34$ dan $a^2 + b^2 = 676$, jadi $2ab = 1156 - 676 = 480$ dan luas $\\frac{ab}2 = 120$."),
          num("Tentukan jarak titik $(-3, 4)$ dan $(9, -1)$.", 13, "$\\sqrt{12^2 + 5^2}$."),
          num("Tentukan luas segitiga dengan titik sudut $(1, 2)$, $(6, 2)$, dan $(4, 9)$. Tulis sebagai desimal jika perlu.", 17.5, "Alas mendatar sepanjang 5, tinggi $9 - 2 = 7$: $\\frac12 \\cdot 5 \\cdot 7$."),
          num("Pada keempat sisi persegi bersisi 7 cm digambar setengah lingkaran menghadap ke luar. Berapa cm² luas seluruh bangun ($\\pi = \\frac{22}7$)?", 126, "$49 + 4 \\cdot \\frac12 \\cdot \\frac{22}7 \\cdot \\left(\\frac72\\right)^2 = 49 + 77$."),
        ]),
        drill(L1, "Tripel Pythagoras", "pythagoras"),
        drill(L1, "Sudut Segi-n", "polygon-angles"),
        uji(L1, false, [
          num("Setiap sudut dalam segi-$n$ beraturan $156^\\circ$. Berapa banyak diagonalnya?", 90, "Sudut luar $24^\\circ$, jadi $n = 15$ dan banyak diagonal $\\frac{15 \\cdot 12}2$.", 20),
          num("Tentukan luas segitiga dengan sisi $13$, $20$, dan $21$.", 126, "Tinggi ke sisi 21 membaginya menjadi $x$ dan $21 - x$: $169 - x^2 = 400 - (21 - x)^2$ memberi $x = 5$, tinggi $12$.", 20),
          num("Titik $P(x, 0)$ berjarak sama dari $A(2, 5)$ dan $B(6, 3)$. Tentukan $x$.", 2, "$(x - 2)^2 + 25 = (x - 6)^2 + 9$ memberi $8x = 16$.", 20),
          num("$ABCD$ persegi bersisi 7 cm. Dua busur seperempat lingkaran berjari-jari 7 cm digambar dengan pusat $A$ dan $C$. Berapa cm² luas daerah yang dibatasi kedua busur ($\\pi = \\frac{22}7$)?", 28, "Dua seperempat lingkaran dikurangi persegi: $2 \\cdot \\frac14 \\cdot \\frac{22}7 \\cdot 49 - 49 = 77 - 49$.", 20),
          num("Diagonal-diagonal sisi sebuah balok panjangnya $\\sqrt{34}$, $\\sqrt{58}$, dan $\\sqrt{74}$. Berapa volumenya?", 105, "$a^2 + b^2 = 34$, $b^2 + c^2 = 58$, $a^2 + c^2 = 74$. Jumlahnya $2(a^2 + b^2 + c^2) = 166$, jadi $a^2 = 25$, $b^2 = 9$, $c^2 = 49$, dan volumenya $5 \\cdot 3 \\cdot 7$.", 20),
        ]),
      ],
    },
    {
      title: "Level 2: Bentuk yang Serupa",
      pdfDir: "olim-jp-geo-2",
      pdfName: "Geometri-Level-2-Bentuk-yang-Serupa.pdf",
      intro: levelIntro(2, "kekongruenan, kesebangunan, sudut pada lingkaran, garis singgung persekutuan, kuasa titik", false),
      quizzes: [
        langkah(L2, [
          steps(
            "Pada segitiga $ABC$, $DE \\parallel BC$ dengan $D$ pada $AB$ dan $E$ pada $AC$. Diketahui $AD = 6$, $DB = 4$, dan $BC = 15$.",
            [
              ["AD : AB = 6 : …", "10"],
              ["Panjang DE", "9"],
              ["Luas ADE : luas ABC = 9 : …", "25"],
              ["Jika luas ABC 50, berapa luas trapesium DBCE?", "32"],
            ],
            "$\\triangle ADE \\sim \\triangle ABC$ dengan perbandingan $\\frac{6}{10} = \\frac35$, jadi $DE = 9$ dan perbandingan luas $\\frac9{25}$. Luas $ADE = 18$, trapesium $50 - 18 = 32$."
          ),
          steps(
            "Segitiga $ABC$ siku-siku di $C$, dan $CD$ garis tinggi ke sisi miring dengan $AD = 9$ dan $DB = 16$.",
            [
              ["CD", "12"],
              ["AC", "15"],
              ["BC", "20"],
              ["Luas ABC", "150"],
            ],
            "$CD^2 = AD \\cdot DB = 144$, $AC^2 = AD \\cdot AB = 9 \\cdot 25$, $BC^2 = DB \\cdot AB = 16 \\cdot 25$. Luas $\\frac12 \\cdot 15 \\cdot 20$."
          ),
          parts(
            "$ABCD$ segiempat tali busur pada lingkaran berpusat $O$, dengan $\\angle BAD = 70^\\circ$ dan $\\angle ABC = 95^\\circ$. Jawab dalam derajat.",
            [
              ["∠BCD", "110"],
              ["∠ADC", "85"],
              ["Sudut pusat BOD yang menghadap busur BCD", "140"],
            ],
            "Sudut berhadapan pada segiempat tali busur berjumlah $180^\\circ$. $\\angle BAD$ adalah sudut keliling yang menghadap busur $BCD$, jadi sudut pusatnya $2 \\cdot 70^\\circ$."
          ),
          steps(
            "Dua lingkaran berjari-jari 11 dan 4 dengan jarak pusat 25.",
            [
              ["R − r", "7"],
              ["Panjang garis singgung persekutuan luar", "24"],
              ["R + r", "15"],
              ["Panjang garis singgung persekutuan dalam", "20"],
            ],
            "$\\sqrt{25^2 - 7^2} = 24$ dan $\\sqrt{25^2 - 15^2} = 20$."
          ),
          mistake(
            "Dari titik $P$ di luar lingkaran ditarik garis potong yang memotong lingkaran di $A$ lalu $B$, dengan $PA = 3$ dan $AB = 9$, serta garis singgung $PT$. Wati mencari $PT$.",
            ["Kuasa titik: PT² = PA × PB.", "PB = AB = 9.", "PT² = 3 × 9 = 27."],
            1,
            "$PB$ diukur dari $P$: $PB = PA + AB = 12$. Jadi $PT^2 = 36$ dan $PT = 6$."
          ),
          parts(
            "Lingkaran berjari-jari 13 memiliki tali busur $AB$ sepanjang 24.",
            [
              ["Jarak pusat ke AB", "5"],
              ["Panjang tali busur lain yang berjarak 12 dari pusat", "10"],
            ],
            "Garis dari pusat tegak lurus tali busur membaginya dua: $\\sqrt{13^2 - 12^2} = 5$. Untuk jarak 12, setengah tali busurnya $\\sqrt{169 - 144} = 5$."
          ),
        ]),
        latihan(L2, [
          num("Pada segitiga $ABC$, $DE \\parallel BC$ dengan $AD : DB = 2 : 3$ dan $DE = 8$. Tentukan $BC$.", 20, "$AD : AB = 2 : 5$, jadi $BC = 8 \\cdot \\frac52$."),
          num("Pada segitiga $ABC$, $DE \\parallel BC$ dengan $AD : DB = 1 : 2$. Jika luas segitiga $ADE$ adalah 5, berapa luas trapesium $DBCE$?", 40, "$AD : AB = 1 : 3$, jadi luas $ABC = 9 \\cdot 5 = 45$."),
          num("Tiang setinggi 4 m berbayangan 3 m. Pada saat yang sama sebuah pohon berbayangan 15 m. Berapa meter tinggi pohon?", 20, "Segitiga sebangun: $\\frac{4}{3} = \\frac{t}{15}$."),
          num("Sudut keliling $ACB$ yang menghadap busur $AB$ besarnya $42^\\circ$. Berapa derajat sudut pusat $AOB$?", 84, "Sudut pusat dua kali sudut keliling."),
          num("$AB$ diameter lingkaran dan $C$ titik pada lingkaran dengan $\\angle CAB = 35^\\circ$. Berapa derajat $\\angle ABC$?", 55, "$\\angle ACB = 90^\\circ$ karena menghadap diameter."),
          num("$PA$ dan $PB$ garis singgung lingkaran berpusat $O$, dengan $\\angle APB = 50^\\circ$. Berapa derajat $\\angle AOB$?", 130, "Pada segiempat $PAOB$, sudut di $A$ dan $B$ siku-siku, jadi $\\angle AOB = 360^\\circ - 180^\\circ - 50^\\circ$."),
          num("Dua lingkaran berjari-jari 9 dan 3 dengan jarak pusat 10. Berapa panjang garis singgung persekutuan luarnya?", 8, "$\\sqrt{100 - 36}$."),
          num("Tali busur $AB$ dan $CD$ berpotongan di $P$ dengan $AP = 6$, $PB = 4$, dan $CP = 3$. Berapa panjang $CD$?", 11, "$6 \\cdot 4 = 3 \\cdot PD$, jadi $PD = 8$."),
          num("Dari titik $P$ di luar lingkaran, garis potong memotong lingkaran di $A$ dan $B$ dengan $PA = 5$ dan $PB = 20$. Berapa panjang garis singgung $PT$?", 10, "$PT^2 = 5 \\cdot 20$."),
          num("Sabuk kencang melilit dua roda berjari-jari 14 cm dengan jarak pusat 30 cm. Berapa cm panjang sabuk ($\\pi = \\frac{22}7$)?", 148, "Dua bagian lurus $2 \\cdot 30$, ditambah dua setengah lingkaran $2\\pi \\cdot 14 = 88$."),
        ]),
        uji(L2, false, [
          num("Segitiga $ABC$ siku-siku di $C$ dengan $AC = 20$ dan $BC = 15$. $CD$ garis tinggi ke $AB$. Tentukan $AD$.", 16, "$AB = 25$, dan $AD = \\frac{AC^2}{AB} = \\frac{400}{25}$.", 20),
          num("Trapesium $ABCD$ dengan $AB \\parallel CD$, $AB = 18$, dan $CD = 6$. Diagonalnya berpotongan di $O$. Jika luas segitiga $COD$ adalah 4, berapa luas segitiga $AOB$?", 36, "$\\triangle AOB \\sim \\triangle COD$ dengan perbandingan $3$, jadi luasnya $9 \\cdot 4$.", 20),
          num("Pada segiempat tali busur $ABCD$, $\\angle A = 2\\angle C$. Berapa derajat $\\angle A$?", 120, "$\\angle A + \\angle C = 180^\\circ$, jadi $3\\angle C = 180^\\circ$.", 20),
          num("Dua lingkaran berjari-jari 6 dan 3 memiliki garis singgung persekutuan dalam sepanjang 12. Berapa jarak kedua pusatnya?", 15, "$d^2 = 12^2 + (6 + 3)^2 = 225$.", 20),
          num("Lingkaran berjari-jari 25 dan titik $P$ di dalamnya berjarak 7 dari pusat. Berapa panjang tali busur terpendek yang melalui $P$?", 48, "Tali busur terpendek tegak lurus $OP$, setengahnya $\\sqrt{625 - 49} = 24$.", 20),
        ]),
      ],
    },
    {
      title: "Level 3: Garis Bertemu, Bidang Memotong",
      pdfDir: "olim-jp-geo-3",
      pdfName: "Geometri-Level-3-Garis-Bertemu-Bidang-Memotong.pdf",
      intro: levelIntro(3, "teorema Ceva, teorema Menelaus, teorema Ptolemy, irisan bidang pada kubus", false),
      quizzes: [
        langkah(L3, [
          steps(
            "Pada segitiga $ABC$, garis $AD$, $BE$, $CF$ bertemu di satu titik, dengan $AF : FB = 3 : 2$ dan $BD : DC = 4 : 3$. Tentukan $CE : EA$.",
            [
              ["(AF/FB) × (BD/DC) = …", "2"],
              ["CE/EA (tulis sebagai a/b)", "1/2"],
            ],
            "Ceva: $\\frac32 \\cdot \\frac43 \\cdot \\frac{CE}{EA} = 1$, jadi $\\frac{CE}{EA} = \\frac12$."
          ),
          steps(
            "Pada segitiga $ABC$, $D$ titik tengah $BC$ dan $E$ pada $AC$ dengan $AE : EC = 2 : 3$. Garis $BE$ memotong $AD$ di $P$. Pakai Menelaus pada segitiga $ADC$ dengan garis $BE$. (Tulis jawaban sebagai a/b.)",
            [
              ["DB/BC", "1/2"],
              ["CE/EA", "3/2"],
              ["AP/PD", "4/3"],
            ],
            "$\\frac{AP}{PD} \\cdot \\frac12 \\cdot \\frac32 = 1$, jadi $\\frac{AP}{PD} = \\frac43$."
          ),
          parts(
            "$ABCD$ segiempat tali busur dengan $AB = 3$, $BC = 4$, $CD = 4$, $DA = 3$, dan $AC$ diameter lingkaran.",
            [
              ["AC", "5"],
              ["AC × BD (pakai Ptolemy)", "24"],
              ["BD (tulis sebagai desimal)", "4,8"],
            ],
            "Sudut di $B$ menghadap diameter, jadi $AC = \\sqrt{9 + 16} = 5$. Ptolemy: $AC \\cdot BD = AB \\cdot CD + AD \\cdot BC = 12 + 12$."
          ),
          steps(
            "Kubus $ABCD.EFGH$ berusuk 4. Sebuah bidang melalui $A$, $C$, dan titik tengah $M$ dari rusuk $EF$. Bidang itu juga memotong rusuk $FG$ di titik tengahnya, $N$, sehingga irisannya trapesium $ACNM$.",
            [
              ["MN = k√2. k = …", "2"],
              ["AC = k√2. k = …", "4"],
              ["Tinggi trapesium = k√2. k = …", "3"],
              ["Luas irisan", "18"],
            ],
            "$MN$ menghubungkan titik tengah dua rusuk yang bertemu: $\\sqrt{2^2 + 2^2} = 2\\sqrt2$. $AC = 4\\sqrt2$. Kaki $AM = \\sqrt{2^2 + 4^2} = \\sqrt{20}$, dan selisih alas dibagi dua $\\sqrt2$, jadi tinggi $\\sqrt{20 - 2} = 3\\sqrt2$. Luas $\\frac{4\\sqrt2 + 2\\sqrt2}{2} \\cdot 3\\sqrt2 = 18$."
          ),
          mistake(
            "Pada segitiga $ABC$, $AD$, $BE$, $CF$ bertemu di satu titik dengan $AF/FB = 1/2$ dan $BD/DC = 2/3$. Gilang mencari $CE/EA$.",
            ["Ceva: (AF/FB)(BD/DC)(CE/EA) = 1.", "(1/2)(2/3)(CE/EA) = 1.", "(1/3)(CE/EA) = 1.", "CE/EA = 1/3."],
            3,
            "Dari $\\frac13 \\cdot \\frac{CE}{EA} = 1$, $\\frac{CE}{EA} = 3$."
          ),
          parts(
            "Segitiga sama sisi $ABC$ terletak di dalam lingkaran, dan $P$ titik pada busur $BC$ yang tidak memuat $A$. Ptolemy pada $ABPC$ memberi $PA = PB + PC$.",
            [
              ["Jika PB = 3 dan PC = 5, PA = …", "8"],
              ["Jika PB = 2 dan PA = 9, PC = …", "7"],
            ],
            "Langsung dari $PA = PB + PC$."
          ),
        ]),
        latihan(L3, [
          frac(`Pada segitiga $ABC$, $AD$, $BE$, $CF$ bertemu di satu titik dengan $\\dfrac{AF}{FB} = 2$ dan $\\dfrac{BD}{DC} = \\dfrac34$. Tentukan $\\dfrac{CE}{EA}$. ${FRAC}`, "2/3", "Ceva: $2 \\cdot \\frac34 \\cdot \\frac{CE}{EA} = 1$."),
          num("Garis berat $AD$ dan $BE$ segitiga $ABC$ berpotongan di $G$. Tentukan $\\dfrac{AG}{GD}$.", 2, "Menelaus pada $ADC$ dengan garis $BE$: $\\frac{AG}{GD} \\cdot \\frac{DB}{BC} \\cdot \\frac{CE}{EA} = \\frac{AG}{GD} \\cdot \\frac12 \\cdot 1 = 1$."),
          num("Pada segitiga $ABC$, $D$ pada $BC$ dengan $BD : DC = 1 : 2$, dan $E$ titik tengah $AC$. Garis $BE$ memotong $AD$ di $P$. Tentukan $\\dfrac{AP}{PD}$.", 3, "Menelaus pada $ADC$: $\\frac{AP}{PD} \\cdot \\frac{DB}{BC} \\cdot \\frac{CE}{EA} = \\frac{AP}{PD} \\cdot \\frac13 \\cdot 1 = 1$."),
          frac(`Pada segitiga $ABC$, $F$ titik tengah $AB$ dan $E$ pada $AC$ dengan $AE : EC = 1 : 2$. Garis $BE$ dan $CF$ berpotongan di $P$. Tentukan $\\dfrac{BP}{PE}$. ${FRAC}`, "3/2", "Menelaus pada $ABE$ dengan garis $CF$: $\\frac{AF}{FB} \\cdot \\frac{BP}{PE} \\cdot \\frac{EC}{CA} = 1 \\cdot \\frac{BP}{PE} \\cdot \\frac23 = 1$."),
          num("$ABCD$ segiempat tali busur dengan $AB = 6$, $BC = 7$, $CD = 8$, dan $DA = 9$. Tentukan $AC \\times BD$.", 111, "Ptolemy: $6 \\cdot 8 + 9 \\cdot 7 = 48 + 63$."),
          num("Persegi panjang $9 \\times 12$ terletak di dalam lingkaran. Tentukan hasil kali kedua diagonalnya.", 225, "Ptolemy (atau Pythagoras): $d^2 = 81 + 144$."),
          mc("Berapa panjang diagonal segi lima beraturan yang bersisi 2?", ["$\\sqrt5$", "$\\dfrac{1 + \\sqrt5}{2}$", "$2\\sqrt5 - 1$", "$1 + \\sqrt5$"], "D", "Ptolemy pada empat titik sudut berurutan: $d^2 = 2 \\cdot 2 + 2d$, jadi $d^2 - 2d - 4 = 0$ dan $d = 1 + \\sqrt5$ — dua kali bilangan emas."),
          num("Kubus $ABCD.EFGH$ berusuk 6. Luas irisan kubus dengan bidang melalui $B$, $D$, dan $E$ dapat ditulis $k\\sqrt3$. Tentukan $k$.", 18, "$BD$, $DE$, $EB$ diagonal sisi, jadi $BDE$ segitiga sama sisi bersisi $6\\sqrt2$: luas $\\frac{\\sqrt3}4 \\cdot 72 = 18\\sqrt3$."),
          num("Kubus $ABCD.EFGH$ berusuk 10. Luas irisan dengan bidang melalui $A$, $B$, $G$, dan $H$ dapat ditulis $k\\sqrt2$. Tentukan $k$.", 100, "$ABGH$ persegi panjang dengan $AB = 10$ dan $BG = 10\\sqrt2$."),
          num("Kubus $ABCD.EFGH$ berusuk 4. Luas irisan dengan bidang melalui titik tengah rusuk $AB$, $AD$, dan $AE$ dapat ditulis $k\\sqrt3$. Tentukan $k$.", 2, "Irisannya segitiga sama sisi bersisi $\\sqrt{2^2 + 2^2} = 2\\sqrt2$: luas $\\frac{\\sqrt3}4 \\cdot 8$."),
        ]),
        uji(L3, true, [
          frac(`Pada segitiga $ABC$, $AD$, $BE$, $CF$ bertemu di satu titik dengan $\\dfrac{AF}{FB} = \\dfrac34$ dan $\\dfrac{CE}{EA} = \\dfrac25$. Tentukan $\\dfrac{BD}{DC}$. ${FRAC}`, "10/3", "$\\frac34 \\cdot \\frac{BD}{DC} \\cdot \\frac25 = 1$, jadi $\\frac{BD}{DC} = \\frac{20}{6}$.", 15),
          num("Pada segitiga $ABC$, $D$ titik tengah $BC$ dan $E$ pada $AC$ dengan $AE : EC = 3 : 1$. Garis $BE$ memotong $AD$ di $P$. Tentukan $\\dfrac{AP}{PD}$.", 6, "Menelaus pada $ADC$: $\\frac{AP}{PD} \\cdot \\frac12 \\cdot \\frac13 = 1$.", 15),
          num("$ABCD$ segiempat tali busur dengan $AB = BC = CD = 2$ dan $AD = 4$. Tentukan $AC \\times BD$.", 12, "Ptolemy: $AB \\cdot CD + AD \\cdot BC = 4 + 8$. (Ini setengah segi enam beraturan, dengan $AC = BD = 2\\sqrt3$.)", 15),
          num("Kubus $ABCD.EFGH$ berusuk 4. Sebuah bidang melalui $A$ serta titik tengah rusuk $FG$ dan $GH$. Irisan bidang itu dengan kubus berbentuk segi berapa?", 5, "Dengan $A(0, 0, 0)$, bidangnya $2x + 2y - 3z = 0$. Bidang memotong sisi atas di kedua titik tengah, rusuk $BF$ dan $DH$ di ketinggian $\\frac83$, dan alas hanya di $A$: lima titik sudut.", 15),
          worked(
            "Buktikan dengan teorema Ceva bahwa ketiga garis bagi sudut dalam sebuah segitiga bertemu di satu titik.",
            "",
            0,
            [
              ["Menyatakan teorema garis bagi: BD/DC = AB/AC, dan dua lainnya", 8],
              ["Mengalikan ketiga perbandingan dan menunjukkan hasilnya 1", 8],
              ["Menyimpulkan dengan kebalikan teorema Ceva", 4],
            ],
            "Misalkan garis bagi dari $A$, $B$, $C$ memotong sisi di depannya di $D$, $E$, $F$. Menurut teorema garis bagi,\n$$\\frac{BD}{DC} = \\frac{AB}{AC}, \\quad \\frac{CE}{EA} = \\frac{BC}{BA}, \\quad \\frac{AF}{FB} = \\frac{CA}{CB}.$$\n\nKalikan:\n$$\\frac{AF}{FB} \\cdot \\frac{BD}{DC} \\cdot \\frac{CE}{EA} = \\frac{CA}{CB} \\cdot \\frac{AB}{AC} \\cdot \\frac{BC}{BA} = 1.$$\n\nTeorema Ceva berlaku dua arah (\"jika dan hanya jika\"), jadi $AD$, $BE$, $CF$ bertemu di satu titik. $\\blacksquare$"
          ),
          worked(
            "Pada segitiga $ABC$, $D$ pada $BC$ dengan $BD : DC = 2 : 1$, dan $E$ titik tengah $AD$. Garis $BE$ memotong $AC$ di $F$. Tentukan $\\dfrac{AF}{FC}$ (tulis sebagai a/b) dan jelaskan.",
            "2/3",
            4,
            [
              ["Memilih segitiga ADC dengan garis lurus B–E–F", 6],
              ["Menulis Menelaus dengan urutan yang benar: (AE/ED)(DB/BC)(CF/FA) = 1", 6],
              ["Menghitung DB/BC = 2/3 dan menyimpulkan AF/FC = 2/3", 4],
            ],
            "Garis $B$–$E$–$F$ memotong sisi $AD$ di $E$, sisi $CA$ di $F$, dan perpanjangan $DC$ di $B$. Menelaus pada segitiga $ADC$:\n$$\\frac{AE}{ED} \\cdot \\frac{DB}{BC} \\cdot \\frac{CF}{FA} = 1.$$\n\n$\\frac{AE}{ED} = 1$ dan $\\frac{DB}{BC} = \\frac23$, jadi $\\frac{CF}{FA} = \\frac32$ dan $\\frac{AF}{FC} = \\frac23$."
          ),
        ]),
      ],
    },
  ],
  closing: [review("Geometri")],
};
