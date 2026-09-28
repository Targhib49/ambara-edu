/**
 * Persiapan Olimpiade Matematika (MS²C) — Bab: Geometri.
 * Read by scripts/setup-olim.ts.
 *
 * The order is not Targhib's syllabus order: congruence and similarity come
 * before circles, because every circle proof leans on an isosceles triangle
 * made of two radii, and trigonometry comes after the triangle centres so
 * that "two sides and the angle between them" already means something.
 * Solids close the chapter — they are plane problems in disguise, and the
 * last session says so out loud.
 *
 * Every length, area and angle here was recomputed in Python before it was
 * written down.
 */
import type { BabContent } from "./math-types";

const FRAC = "Tulis pecahan sebagai a/b, misalnya 3/10.";
const DEG = "Tulis jawabannya dalam derajat, tanpa satuan.";

export const OLIM_GEOMETRI: BabContent = {
  chapterTitle: "Geometri",
  pdfPrefix: "OlimGeo-",
  sesi: [
    // ───────────────────────────── Sesi 1 ─────────────────────────────
    {
      title: "Sesi 1: Angle Chasing",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi1", fileName: "OlimGeo-Sesi1-Angle-Chasing.pdf" }],
      quiz: {
        title: "Latihan — Sesi 1: Angle Chasing",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Berapa besar satu sudut dalam segi sepuluh beraturan? ${DEG}`,
            answer: 144,
            explanation: "Sudut luarnya $\\frac{360^\\circ}{10} = 36^\\circ$, jadi sudut dalamnya $180^\\circ - 36^\\circ = 144^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Berapa besar satu sudut luar segi lima belas beraturan? ${DEG}`,
            answer: 24,
            explanation: "$\\frac{360^\\circ}{15} = 24^\\circ$ — jumlah sudut luar selalu $360^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Berapa jumlah sudut dalam segi tujuh? ${DEG}`,
            answer: 900,
            explanation: "$(7-2)\\cdot180^\\circ = 900^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Sebuah segi-$n$ beraturan mempunyai sudut luar $20^\\circ$. Berapa $n$?",
            answer: 18,
            explanation: "$n = \\frac{360^\\circ}{20^\\circ} = 18$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Pada segitiga $ABC$, sudut luar di $B$ besarnya $118^\\circ$ dan $\\angle A = 43^\\circ$. Berapa $\\angle C$? ${DEG}`,
            answer: 75,
            explanation: "Sudut luar sama dengan jumlah dua sudut jauh: $\\angle C = 118^\\circ - 43^\\circ = 75^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Segitiga sama kaki mempunyai sudut puncak $36^\\circ$. Berapa besar satu sudut alasnya? ${DEG}`,
            answer: 72,
            explanation: "$\\frac{180^\\circ - 36^\\circ}{2} = 72^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Segitiga sama kaki mempunyai sudut alas $65^\\circ$. Berapa sudut puncaknya? ${DEG}`,
            answer: 50,
            explanation: "$180^\\circ - 2\\cdot65^\\circ = 50^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Sudut-sudut sebuah segitiga berbanding $3 : 4 : 5$. Berapa besar sudut terbesarnya? ${DEG}`,
            answer: 75,
            explanation: "$12x = 180^\\circ$ memberi $x = 15^\\circ$, jadi sudutnya $45^\\circ$, $60^\\circ$, $75^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sudut-sudut sebuah segitiga adalah $(2x+5)^\\circ$, $(3x-15)^\\circ$, dan $(x+10)^\\circ$. Berapa nilai $x$?",
            answer: 30,
            explanation: "$6x + 0 = 180$, jadi $x = 30$; sudutnya $65^\\circ$, $75^\\circ$, $40^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Dua garis sejajar dipotong sebuah garis. Sepasang sudut dalam sepihak besarnya $3x$ dan $2x$. Berapa besar sudut yang lebih besar? ${DEG}`,
            answer: 108,
            explanation: "Sudut dalam sepihak berjumlah $180^\\circ$: $5x = 180^\\circ$, $x = 36^\\circ$, jadi $3x = 108^\\circ$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Sebuah segi-$n$ beraturan mempunyai sudut dalam $156^\\circ$. Nilai $n$ adalah…",
            options: ["15", "12", "18", "20"],
            answer: "A",
            explanation: "Sudut luarnya $180^\\circ - 156^\\circ = 24^\\circ$, jadi $n = \\frac{360}{24} = 15$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Sudut luar sebuah segitiga selalu sama dengan…",
            options: [
              "jumlah dua sudut dalam yang tidak bersisian dengannya",
              "selisih dua sudut dalam yang lain",
              "sudut dalam di sebelahnya",
              "setengah jumlah seluruh sudut dalamnya",
            ],
            answer: "A",
            explanation: "Sebab sudut luar itu pelurus dari sudut dalam di titik yang sama, dan ketiga sudut dalam berjumlah $180^\\circ$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Segitiga $ABC$ sama kaki dengan $AB = AC$ dan $\\angle BAC = 40^\\circ$. Titik $D$ terletak pada $AC$ sehingga $BD = BC$. Tentukan $\\angle ABD$. Tulis prosesnya, lalu tulis besar sudutnya (dalam derajat, tanpa satuan) di kotak jawaban akhir.",
            answer: "30",
            answerMarks: 1,
            rubric: [
              { point: "Menghitung sudut alas segitiga $ABC$: $\\angle ABC = \\angle ACB = 70^\\circ$", marks: 2 },
              { point: "Memakai $BD = BC$ untuk menyimpulkan $\\angle BDC = \\angle BCD = 70^\\circ$", marks: 1 },
              { point: "Mendapat $\\angle DBC = 40^\\circ$, lalu mengurangkannya dari $\\angle ABC$", marks: 1 },
            ],
            solution:
              "**Segitiga $ABC$.** $AB = AC$ dan $\\angle A = 40^\\circ$, jadi\n\n$$\\angle ABC = \\angle ACB = \\frac{180^\\circ - 40^\\circ}{2} = 70^\\circ.$$\n\n**Segitiga $BDC$.** Karena $BD = BC$, sudut-sudut yang menghadap kedua sisi itu sama besar: $\\angle BDC = \\angle BCD = 70^\\circ$ (sudut $\\angle BCD$ adalah $\\angle ACB$, sebab $D$ pada $AC$).\n\nJadi $\\angle DBC = 180^\\circ - 70^\\circ - 70^\\circ = 40^\\circ$.\n\n**Selisihnya.** $D$ di dalam sudut $ABC$, sehingga\n\n$$\\angle ABD = \\angle ABC - \\angle DBC = 70^\\circ - 40^\\circ = \\mathbf{30^\\circ}.$$",
            explanation: "Dua segitiga sama kaki berturut-turut, dan yang menghubungkannya satu sudut yang dipakai bersama. Inilah bentuk paling sering dari angle chasing.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Jelaskan mengapa jumlah sudut dalam segi-$n$ adalah $(n-2)\\cdot180^\\circ$. (Soal pembuktian — jelaskan, tidak ada jawaban akhir.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memilih satu titik sudut dan menarik diagonal ke titik sudut lainnya", marks: 2 },
              { point: "Menyebut bahwa terbentuk tepat $n-2$ segitiga", marks: 2 },
              { point: "Menyimpulkan jumlahnya $ (n-2)\\cdot180^\\circ$ dan menyebut tidak ada sudut yang terhitung ganda", marks: 2 },
            ],
            solution:
              "Ambil satu titik sudut, sebut $A_1$, lalu tarik diagonal dari $A_1$ ke setiap titik sudut yang tidak bertetangga dengannya.\n\nKedua tetangga $A_1$ tidak dihubungkan, sehingga ada $n-3$ diagonal, dan diagonal-diagonal itu membelah segi-$n$ menjadi $n-2$ segitiga.\n\nJumlah sudut setiap segitiga $180^\\circ$, jadi seluruhnya $(n-2)\\cdot180^\\circ$.\n\nYang masih perlu diperiksa: apakah jumlah itu benar-benar jumlah sudut segi-$n$, tidak lebih dan tidak kurang. Setiap sudut segitiga terletak di salah satu titik sudut segi-$n$, dan di setiap titik sudut, sudut-sudut segitiga yang bertemu di situ tepat menyusun sudut segi-$n$ tanpa bertumpuk. Jadi tidak ada yang terhitung dua kali dan tidak ada yang terlewat:\n\n$$S_n = (n-2)\\cdot180^\\circ. \\qquad \\blacksquare$$\n\nUji cepat: $n=3$ memberi $180^\\circ$, $n=4$ memberi $360^\\circ$.",
            explanation: "Yang dinilai bukan rumusnya, melainkan bagian terakhir: menunjukkan tidak ada sudut yang terhitung ganda. Itulah yang membedakan bukti dari gambar yang meyakinkan.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 2 ─────────────────────────────
    {
      title: "Sesi 2: Kesebangunan & Kekongruenan",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi2", fileName: "OlimGeo-Sesi2-Kesebangunan-dan-Kekongruenan.pdf" }],
      quiz: {
        title: "Latihan — Sesi 2: Kesebangunan & Kekongruenan",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Dua segitiga sebangun dengan perbandingan sisi $2 : 5$. Jika luas yang kecil $12\\ \\mathrm{cm}^2$, berapa luas yang besar (dalam $\\mathrm{cm}^2$)?",
            answer: 75,
            explanation: "Luas berbanding $k^2$: $12\\cdot\\left(\\frac52\\right)^2 = 12\\cdot\\frac{25}{4} = 75$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Pada segitiga $CAB$, titik $D$ pada $CA$ dan $E$ pada $CB$ dengan $DE \\parallel AB$. Diketahui $CD = 6$, $DA = 4$, dan $AB = 15$. Berapa panjang $DE$?",
            answer: 9,
            explanation: "$\\triangle CDE \\sim \\triangle CAB$ dengan $\\frac{CD}{CA} = \\frac{6}{10}$, jadi $DE = \\frac35\\cdot15 = 9$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Garis tinggi dari sudut siku-siku membagi sisi miring menjadi $4$ dan $9$. Berapa panjang garis tinggi itu?",
            answer: 6,
            explanation: "$h^2 = p\\,q = 4\\cdot9 = 36$, jadi $h = 6$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Pada segitiga siku-siku dengan sisi miring $25$, proyeksi salah satu sisi tegak pada sisi miring panjangnya $9$. Berapa panjang sisi tegak itu?",
            answer: 15,
            explanation: "$a^2 = c\\,p = 25\\cdot9 = 225$, jadi $a = 15$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Seseorang bertinggi $1{,}5$ m berbayang $2$ m. Pada saat yang sama sebuah pohon berbayang $12$ m. Berapa tinggi pohon itu (dalam meter)?",
            answer: 9,
            explanation: "Sebangun: $\\frac{t}{12} = \\frac{1{,}5}{2}$, jadi $t = 9$ m.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Dua bangun ruang sebangun dengan perbandingan panjang $1 : 3$. Jika volume yang kecil $4\\ \\mathrm{cm}^3$, berapa volume yang besar (dalam $\\mathrm{cm}^3$)?",
            answer: 108,
            explanation: "Volume berbanding $k^3$: $4\\cdot27 = 108$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Diketahui $\\triangle ABC \\sim \\triangle DEF$ dengan $AB = 8$ dan $DE = 12$. Jika keliling $\\triangle ABC$ adalah $20$, berapa keliling $\\triangle DEF$?",
            answer: 30,
            explanation: "Keliling berbanding $k = \\frac{12}{8} = \\frac32$: $20\\cdot\\frac32 = 30$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sebuah maket berskala $1 : 50$. Bangunan aslinya tinggi $30$ m. Berapa tinggi maketnya dalam sentimeter?",
            answer: 60,
            explanation: "$30$ m $= 3000$ cm, dan $3000 : 50 = 60$ cm.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dua segitiga sebangun mempunyai luas $9$ dan $25$. Sebuah sisi pada segitiga kecil panjangnya $6$. Berapa panjang sisi yang bersesuaian pada segitiga besar?",
            answer: 10,
            explanation: "Perbandingan luas $k^2 = \\frac{25}{9}$, jadi $k = \\frac53$ dan sisinya $6\\cdot\\frac53 = 10$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Data berikut yang **tidak** menjamin dua segitiga kongruen adalah…",
            options: ["dua sisi dan sudut di luar keduanya", "ketiga sisi", "dua sudut dan sisi di antaranya", "dua sisi dan sudut di antaranya"],
            answer: "A",
            explanation: "Itulah “SSA”: dua segitiga berbeda bisa memenuhi data yang sama.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Dua segitiga yang ketiga sudutnya bersesuaian sama besar pasti…",
            options: ["sebangun, belum tentu kongruen", "kongruen", "sama luas", "sama kaki"],
            answer: "A",
            explanation: "Sudut menentukan bentuk, bukan ukuran.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Pada segitiga $ABC$, titik $D$ pada $AB$ dan titik $E$ pada $AC$ dengan $DE \\parallel BC$. Diketahui $AD = 4$, $DB = 8$, dan $DE = 6$. Tentukan panjang $BC$. Tulis prosesnya, lalu tulis panjangnya di kotak jawaban akhir.",
            answer: "18",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut $DE \\parallel BC$ memberi sudut sehadap sama, sehingga $\\triangle ADE \\sim \\triangle ABC$ (AA)", marks: 2 },
              { point: "Menghitung faktor skalanya dari $\\frac{AD}{AB} = \\frac{4}{12}$, bukan dari $\\frac{AD}{DB}$", marks: 2 },
              { point: "Menyusun perbandingan $\\frac{DE}{BC} = \\frac{AD}{AB}$ dan menyelesaikannya", marks: 1 },
            ],
            solution:
              "**Sebangun.** $DE \\parallel BC$, jadi $\\angle ADE = \\angle ABC$ dan $\\angle AED = \\angle ACB$ (sudut sehadap). Dengan AA, $\\triangle ADE \\sim \\triangle ABC$.\n\n**Faktor skala.** Yang bersesuaian dengan $AD$ adalah $AB$, bukan $DB$:\n\n$$AB = AD + DB = 4 + 8 = 12, \\qquad \\frac{AD}{AB} = \\frac{4}{12} = \\frac13.$$\n\n**Perbandingan.**\n\n$$\\frac{DE}{BC} = \\frac13 \;\\Longrightarrow\; BC = 3\\cdot6 = \\mathbf{18}.$$",
            explanation: "Kesalahan yang paling sering: memakai $\\frac{AD}{DB} = \\frac12$ dan menjawab 12. Faktor skala selalu dibaca dari sisi penuh terhadap sisi penuh.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Pada segitiga siku-siku $ABC$ dengan sudut siku-siku di $C$, garis tinggi dari $C$ memotong sisi miring $AB$ di $D$. Buktikan bahwa $CD^2 = AD \\cdot BD$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menyebut kedua segitiga kecil sebangun dengan segitiga aslinya, dengan alasan AA", marks: 2 },
              { point: "Menyimpulkan $\\triangle ACD \\sim \\triangle CBD$ dan menuliskan pasangan sisinya dengan urutan yang benar", marks: 2 },
              { point: "Menyusun perbandingan menjadi $CD^2 = AD\\cdot BD$", marks: 2 },
            ],
            solution:
              "Tulis $\\angle A = \\alpha$. Maka $\\angle B = 90^\\circ - \\alpha$.\n\n**Segitiga $ACD$.** Siku-siku di $D$ dengan $\\angle A = \\alpha$, jadi $\\angle ACD = 90^\\circ - \\alpha$.\n\n**Segitiga $CBD$.** Siku-siku di $D$ dengan $\\angle B = 90^\\circ - \\alpha$, jadi $\\angle BCD = \\alpha$.\n\nKeduanya punya sudut $\\alpha$ dan $90^\\circ-\\alpha$ serta sudut siku-siku, sehingga\n\n$$\\triangle ACD \\sim \\triangle CBD$$\n\ndengan pasangan: $AD \\leftrightarrow CD$ dan $CD \\leftrightarrow BD$ (sisi di hadapan sudut yang bersesuaian).\n\nMaka\n\n$$\\frac{AD}{CD} = \\frac{CD}{BD} \;\\Longrightarrow\; CD^2 = AD\\cdot BD. \\qquad \\blacksquare$$",
            explanation: "Urutan huruf pada $\\triangle ACD \\sim \\triangle CBD$ itulah yang menentukan perbandingannya. Tulis urutannya dulu, baru susun pecahannya.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 3 ─────────────────────────────
    {
      title: "Sesi 3: Segitiga — Garis Istimewa & Rumus Heron",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi3", fileName: "OlimGeo-Sesi3-Segitiga-Garis-Istimewa-dan-Heron.pdf" }],
      quiz: {
        title: "Latihan — Sesi 3: Segitiga — Garis Istimewa & Rumus Heron",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa luas segitiga dengan sisi $13$, $14$, dan $15$?",
            answer: 84,
            explanation: "$s = 21$ dan $L = \\sqrt{21\\cdot8\\cdot7\\cdot6} = \\sqrt{7056} = 84$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa jari-jari lingkaran dalam segitiga bersisi $13$, $14$, $15$?",
            answer: 4,
            explanation: "$r = \\frac Ls = \\frac{84}{21} = 4$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa jari-jari lingkaran dalam segitiga bersisi $5$, $12$, $13$?",
            answer: 2,
            explanation: "Segitiga siku-siku: $L = \\frac{5\\cdot12}{2} = 30$ dan $s = 15$, jadi $r = 2$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Garis berat dari $A$ panjangnya $24$ cm. Berapa jarak titik $A$ ke titik berat segitiga itu?",
            answer: 16,
            explanation: "Titik berat membagi $2:1$ dari titik sudut: $\\frac23\\cdot24 = 16$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Dua sisi sebuah segitiga adalah $5$ dan $9$. Ada berapa kemungkinan panjang sisi ketiga yang berupa bilangan bulat?",
            answer: 9,
            explanation: "$4 < x < 14$, jadi $x \\in \\{5, 6, \\ldots, 13\\}$ — ada 9.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa luas segitiga dengan sisi $9$, $10$, dan $17$?",
            answer: 36,
            explanation: "$s = 18$ dan $L = \\sqrt{18\\cdot9\\cdot8\\cdot1} = \\sqrt{1296} = 36$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa jari-jari lingkaran dalam segitiga bersisi $6$, $8$, $10$?",
            answer: 2,
            explanation: "$L = 24$, $s = 12$, jadi $r = 2$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sebuah segitiga berluas $84$ dan salah satu sisinya $14$. Berapa panjang garis tinggi ke sisi itu?",
            answer: 12,
            explanation: "$84 = \\frac12\\cdot14\\cdot t$ memberi $t = 12$.",
          },
          {
            type: "FRACTION",
            points: 2,
            prompt: `Berapa jari-jari lingkaran luar segitiga bersisi $13$, $14$, $15$? ${FRAC}`,
            answer: "65/8",
            explanation: "$R = \\frac{abc}{4L} = \\frac{13\\cdot14\\cdot15}{4\\cdot84} = \\frac{2730}{336} = \\frac{65}{8}$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Luas segitiga sama sisi bersisi $6$ adalah…",
            options: ["$9\\sqrt3$", "$18\\sqrt3$", "$6\\sqrt3$", "$36\\sqrt3$"],
            answer: "A",
            explanation: "$\\frac{s^2\\sqrt3}{4} = \\frac{36\\sqrt3}{4} = 9\\sqrt3$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Pusat lingkaran luar sebuah segitiga adalah titik potong…",
            options: ["ketiga garis sumbu sisinya", "ketiga garis baginya", "ketiga garis tingginya", "ketiga garis beratnya"],
            answer: "A",
            explanation: "Garis sumbu memuat semua titik yang berjarak sama dari kedua ujung sisi, jadi titik potongnya berjarak sama dari ketiga titik sudut.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Sebuah segitiga mempunyai sisi $7$, $15$, dan $20$. Tentukan luasnya dan jari-jari lingkaran dalamnya. Tulis prosesnya, lalu tulis **luasnya** di kotak jawaban akhir.",
            answer: "42",
            answerMarks: 1,
            rubric: [
              { point: "Menghitung $s = 21$ dan ketiga selisihnya: $14$, $6$, $1$", marks: 2 },
              { point: "Menghitung $L = \\sqrt{21\\cdot14\\cdot6\\cdot1} = 42$", marks: 2 },
              { point: "Memakai $L = rs$ untuk mendapat $r = 2$", marks: 1 },
            ],
            solution:
              "**Setengah keliling.**\n\n$$s = \\frac{7+15+20}{2} = 21.$$\n\n**Heron.** $s-a = 14$, $s-b = 6$, $s-c = 1$, jadi\n\n$$L = \\sqrt{21\\cdot14\\cdot6\\cdot1} = \\sqrt{1764} = \\mathbf{42}.$$\n\n**Lingkaran dalam.** Dari $L = rs$,\n\n$$r = \\frac{L}{s} = \\frac{42}{21} = 2.$$\n\nPeriksa dulu bahwa segitiganya ada: $7 + 15 = 22 > 20$. ✓",
            explanation: "Perhatikan $s-c = 1$: pada segitiga yang hampir “pipih”, satu faktor Heron menjadi sangat kecil. Itu sinyal bahwa perhitungannya masuk akal, bukan bahwa ada yang salah.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Buktikan bahwa luas segitiga sama dengan $r\\,s$, dengan $r$ jari-jari lingkaran dalam dan $s$ setengah kelilingnya. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menghubungkan pusat lingkaran dalam ke ketiga titik sudut, membelah segitiga menjadi tiga segitiga", marks: 2 },
              { point: "Menyebut tinggi ketiga segitiga itu sama dengan $r$, karena jari-jari tegak lurus sisi di titik singgungnya", marks: 2 },
              { point: "Menjumlahkan ketiga luas dan menyederhanakannya menjadi $rs$", marks: 2 },
            ],
            solution:
              "Misalkan $I$ pusat lingkaran dalam segitiga $ABC$ dengan sisi $a$, $b$, $c$.\n\n**Membelah.** Tarik $IA$, $IB$, $IC$. Ketiganya membelah $\\triangle ABC$ menjadi $\\triangle IBC$, $\\triangle ICA$, dan $\\triangle IAB$, yang tidak bertumpuk dan memenuhi seluruh segitiga.\n\n**Tinggi setiap bagian.** Lingkaran dalam menyinggung ketiga sisi, dan jari-jari ke titik singgung tegak lurus sisi itu. Jadi jarak $I$ ke setiap sisi adalah $r$ — itulah tinggi masing-masing bagian, dengan sisi segitiga sebagai alasnya.\n\n**Menjumlahkan.**\n\n$$L = \\tfrac12 a r + \\tfrac12 b r + \\tfrac12 c r = \\tfrac12 r (a+b+c) = r\\cdot\\frac{a+b+c}{2} = r s. \\qquad \\blacksquare$$",
            explanation: "Rumus ini dipakai dua arah: mencari $r$ dari luas (yang paling sering), dan mencari luas ketika $r$ diketahui.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 4 ─────────────────────────────
    {
      title: "Sesi 4: Lingkaran",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi4", fileName: "OlimGeo-Sesi4-Lingkaran.pdf" }],
      quiz: {
        title: "Latihan — Sesi 4: Lingkaran",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Sudut pusat menghadap sebuah busur besarnya $100^\\circ$. Berapa besar sudut keliling yang menghadap busur yang sama? ${DEG}`,
            answer: 50,
            explanation: "Sudut keliling separuh sudut pusat: $50^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Sudut keliling menghadap sebuah busur besarnya $35^\\circ$. Berapa besar sudut pusat yang menghadap busur yang sama? ${DEG}`,
            answer: 70,
            explanation: "Sudut pusat dua kali sudut keliling: $70^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Pada segi empat tali busur $PQRS$, $\\angle P = 105^\\circ$. Berapa besar $\\angle R$? ${DEG}`,
            answer: 75,
            explanation: "Sudut berhadapan berjumlah $180^\\circ$: $180^\\circ - 105^\\circ = 75^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Lingkaran berjari-jari $9$ dan jarak pusat ke titik $P$ di luar lingkaran adalah $15$. Berapa panjang garis singgung dari $P$?",
            answer: 12,
            explanation: "$\\sqrt{15^2 - 9^2} = \\sqrt{144} = 12$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Panjang garis singgung dari titik $P$ adalah $8$ dan jari-jari lingkarannya $6$. Berapa jarak $P$ ke pusat lingkaran?",
            answer: 10,
            explanation: "$\\sqrt{6^2+8^2} = 10$ — jari-jari tegak lurus garis singgung.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: `Sudut keliling yang menghadap diameter besarnya berapa derajat? ${DEG}`,
            answer: 90,
            explanation: "Sudut pusatnya $180^\\circ$, jadi sudut kelilingnya $90^\\circ$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Luas juring dengan sudut pusat $45^\\circ$ pada lingkaran berjari-jari $8$ dapat ditulis $k\\pi$. Berapa nilai $k$?",
            answer: 8,
            explanation: "$\\frac{45}{360}\\cdot\\pi\\cdot64 = 8\\pi$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Panjang busur dengan sudut pusat $120^\\circ$ pada lingkaran berjari-jari $9$ dapat ditulis $k\\pi$. Berapa nilai $k$?",
            answer: 6,
            explanation: "$\\frac{120}{360}\\cdot2\\pi\\cdot9 = 6\\pi$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sebuah tali busur berjarak $6$ dari pusat lingkaran yang berjari-jari $10$. Berapa panjang tali busur itu?",
            answer: 16,
            explanation: "Setengahnya $\\sqrt{100-36} = 8$, jadi talinya $16$ — garis dari pusat ke tengah tali busur tegak lurus tali itu.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Pada segi empat tali busur, dua sudut yang berhadapan berbanding $2 : 3$. Berapa besar sudut yang lebih besar? ${DEG}`,
            answer: 108,
            explanation: "Keduanya berjumlah $180^\\circ$: $\\frac35\\cdot180^\\circ = 108^\\circ$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Garis singgung sebuah lingkaran selalu…",
            options: [
              "tegak lurus jari-jari di titik singgungnya",
              "sejajar jari-jari di titik singgungnya",
              "melalui pusat lingkaran",
              "sama panjang dengan jari-jarinya",
            ],
            answer: "A",
            explanation: "Sifat inilah yang menyambungkan soal garis singgung dengan teorema Pythagoras.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Dari titik $P$ di luar lingkaran berpusat $O$ dan berjari-jari $8$, ditarik dua garis singgung yang menyentuh lingkaran di $A$ dan $B$. Diketahui $PA = 15$. Tentukan luas segi empat $OAPB$. Tulis prosesnya, lalu tulis luasnya di kotak jawaban akhir.",
            answer: "120",
            answerMarks: 1,
            rubric: [
              { point: "Menyebut $OA \\perp PA$, sehingga $\\triangle OAP$ siku-siku di $A$", marks: 2 },
              { point: "Menyebut $PA = PB$ dan $OA = OB$, sehingga kedua segitiga kongruen", marks: 1 },
              { point: "Menghitung luas satu segitiga lalu menggandakannya", marks: 1 },
            ],
            solution:
              "**Siku-siku.** Jari-jari tegak lurus garis singgung di titik singgungnya, jadi $\\angle OAP = \\angle OBP = 90^\\circ$.\n\n**Dua segitiga kongruen.** $OA = OB = 8$ (jari-jari), $PA = PB = 15$ (dua garis singgung dari satu titik), dan $OP$ dipakai bersama — jadi $\\triangle OAP \\cong \\triangle OBP$ (SSS).\n\n**Luasnya.** Segi empat $OAPB$ tersusun dari kedua segitiga siku-siku itu:\n\n$$[OAPB] = 2\\cdot\\tfrac12\\cdot OA \\cdot PA = 2\\cdot\\tfrac12\\cdot8\\cdot15 = \\mathbf{120}.$$\n\n(Sebagai pelengkap, $OP = \\sqrt{8^2+15^2} = 17$ — tidak diperlukan di sini, tetapi bagus untuk memeriksa gambar.)",
            explanation: "Perhatikan bahwa $OP$ tidak perlu dihitung. Mengenali kaki mana yang sudah diketahui menghemat satu langkah penuh.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Buktikan bahwa sudut keliling yang menghadap diameter besarnya $90^\\circ$. (Soal pembuktian — gunakan segitiga sama kaki yang dibentuk jari-jari.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Menarik jari-jari ke titik sudutnya dan menyebut ketiga jari-jari sama panjang", marks: 2 },
              { point: "Memakai sifat segitiga sama kaki untuk menandai kedua pasang sudut yang sama", marks: 2 },
              { point: "Menyusun jumlah sudut segitiga menjadi $2\\alpha + 2\\beta = 180^\\circ$ lalu menyimpulkan", marks: 2 },
            ],
            solution:
              "Misalkan $AB$ diameter lingkaran berpusat $O$, dan $C$ titik lain pada lingkaran.\n\n**Jari-jari.** Tarik $OC$. Maka $OA = OB = OC = r$.\n\n**Dua segitiga sama kaki.** Pada $\\triangle OAC$, $OA = OC$, jadi $\\angle OAC = \\angle OCA$; sebut keduanya $\\alpha$. Pada $\\triangle OBC$, $OB = OC$, jadi $\\angle OBC = \\angle OCB$; sebut keduanya $\\beta$.\n\n**Jumlah sudut $\\triangle ABC$.**\n\n$$\\alpha + \\beta + \\underbrace{(\\alpha + \\beta)}_{\\angle ACB} = 180^\\circ \;\\Longrightarrow\; 2(\\alpha+\\beta) = 180^\\circ \;\\Longrightarrow\; \\alpha + \\beta = 90^\\circ.$$\n\nKarena $\\angle ACB = \\alpha + \\beta$, maka $\\angle ACB = 90^\\circ$. $\\blacksquare$",
            explanation: "Pola ini — tarik jari-jari, dapatkan segitiga sama kaki — juga membuktikan hubungan sudut pusat dan sudut keliling yang umum. Hafalkan langkah pertamanya, bukan hasilnya.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 5 ─────────────────────────────
    {
      title: "Sesi 5: Fungsi Trigonometri & Identitasnya",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi5", fileName: "OlimGeo-Sesi5-Fungsi-Trigonometri-dan-Identitasnya.pdf" }],
      quiz: {
        title: "Latihan — Sesi 5: Fungsi Trigonometri & Identitasnya",
        questions: [
          {
            type: "FRACTION",
            points: 1,
            prompt: `Diketahui $\\sin\\theta = \\frac35$ dengan $\\theta$ lancip. Berapa $\\cos\\theta$? ${FRAC}`,
            answer: "4/5",
            explanation: "$\\cos^2\\theta = 1 - \\frac9{25} = \\frac{16}{25}$, dan $\\theta$ lancip, jadi $\\cos\\theta = \\frac45$.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `Diketahui $\\tan\\theta = \\frac{5}{12}$ dengan $\\theta$ lancip. Berapa $\\sin\\theta$? ${FRAC}`,
            answer: "5/13",
            explanation: "Segitiga $5$–$12$–$13$, jadi $\\sin\\theta = \\frac{5}{13}$.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `Diketahui $\\sin\\theta = \\frac{8}{17}$ dengan $\\theta$ lancip. Berapa $\\tan\\theta$? ${FRAC}`,
            answer: "8/15",
            explanation: "Sisi sampingnya $\\sqrt{17^2-8^2} = 15$, jadi $\\tan\\theta = \\frac{8}{15}$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa luas segitiga dengan dua sisi $6$ dan $8$ yang mengapit sudut $30^\\circ$?",
            answer: 12,
            explanation: "$\\frac12\\cdot6\\cdot8\\cdot\\sin30^\\circ = 24\\cdot\\frac12 = 12$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Hitung $\\sin 30^\\circ + \\cos 60^\\circ$.",
            answer: 1,
            explanation: "$\\frac12 + \\frac12 = 1$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Dua sisi sebuah segitiga adalah $5$ dan $7$ dengan sudut apit $120^\\circ$. Berapa nilai $c^2$ untuk sisi ketiganya?",
            answer: 109,
            explanation: "$c^2 = 25+49-2\\cdot5\\cdot7\\cdot(-\\frac12) = 74+35 = 109$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: `Sebuah segitiga bersisi $3$, $5$, dan $7$. Berapa besar sudut terbesarnya? ${DEG}`,
            answer: 120,
            explanation: "$\\cos C = \\frac{9+25-49}{2\\cdot15} = -\\frac12$, jadi $C = 120^\\circ$ — sudut terbesar menghadap sisi terpanjang.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Dua sisi sebuah segitiga sama-sama $10$ dan mengapit sudut $60^\\circ$. Berapa panjang sisi ketiganya?",
            answer: 10,
            explanation: "$c^2 = 100+100-2\\cdot100\\cdot\\frac12 = 100$, jadi $c = 10$ — segitiganya sama sisi.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Pada segitiga $ABC$, $a = 10$ dan $\\angle A = 30^\\circ$. Berapa jari-jari lingkaran luarnya?",
            answer: 10,
            explanation: "$\\frac{a}{\\sin A} = 2R$ memberi $2R = \\frac{10}{1/2} = 20$, jadi $R = 10$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Pada segitiga $ABC$, $a = 10$, $\\angle A = 30^\\circ$, dan $\\angle B = 45^\\circ$. Panjang $b$ adalah…",
            options: ["$10\\sqrt2$", "$5\\sqrt2$", "$10\\sqrt3$", "$20$"],
            answer: "A",
            explanation: "Aturan sinus: $b = \\frac{10\\sin45^\\circ}{\\sin30^\\circ} = \\frac{10\\cdot\\frac{\\sqrt2}{2}}{\\frac12} = 10\\sqrt2$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Nilai $\\tan 60^\\circ$ adalah…",
            options: ["$\\sqrt3$", "$\\frac{\\sqrt3}{3}$", "$\\frac{\\sqrt3}{2}$", "$1$"],
            answer: "A",
            explanation: "Dari setengah segitiga sama sisi bersisi $1, \\sqrt3, 2$: $\\tan60^\\circ = \\frac{\\sqrt3}{1}$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Dua sisi sebuah segitiga adalah $8$ dan $5$, dan sudut yang diapitnya $60^\\circ$. Tentukan panjang sisi ketiganya dan luas segitiga itu. Tulis prosesnya, lalu tulis **panjang sisi ketiganya** di kotak jawaban akhir.",
            answer: "7",
            answerMarks: 1,
            rubric: [
              { point: "Memilih aturan kosinus karena yang diketahui sisi–sudut–sisi", marks: 2 },
              { point: "Menghitung $c^2 = 64 + 25 - 40 = 49$ dengan $\\cos 60^\\circ = \\frac12$", marks: 1 },
              { point: "Menghitung luas dengan $\\frac12 ab\\sin C = 10\\sqrt3$", marks: 1 },
            ],
            solution:
              "**Sisi ketiga — aturan kosinus.** Yang diketahui dua sisi dan sudut apitnya, jadi\n\n$$c^2 = 8^2 + 5^2 - 2\\cdot8\\cdot5\\cos60^\\circ = 64 + 25 - 80\\cdot\\tfrac12 = 89 - 40 = 49,$$\n\nsehingga $c = \\mathbf{7}$.\n\n**Luas — sinus.**\n\n$$L = \\tfrac12\\cdot8\\cdot5\\cdot\\sin60^\\circ = 20\\cdot\\frac{\\sqrt3}{2} = 10\\sqrt3 \\approx 17{,}3.$$\n\nPeriksa dengan Heron: $s = 10$, dan $\\sqrt{10\\cdot2\\cdot5\\cdot3} = \\sqrt{300} = 10\\sqrt3$. ✓",
            explanation: "Segitiga $5$–$7$–$8$ dengan sudut $60^\\circ$ adalah salah satu favorit penyusun soal, sebagaimana $13$–$14$–$15$. Kenali angkanya.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Buktikan bahwa luas segitiga sama dengan $\\frac12 ab\\sin C$, dengan $C$ sudut yang diapit sisi $a$ dan $b$. (Soal pembuktian.)",
            answer: "",
            answerMarks: 0,
            rubric: [
              { point: "Memulai dari $L = \\frac12 \\times$ alas $\\times$ tinggi dengan alas $b$", marks: 2 },
              { point: "Menyatakan tingginya sebagai $a\\sin C$ dari segitiga siku-siku yang dibentuk garis tinggi", marks: 2 },
              { point: "Menyebut bahwa rumusnya tetap berlaku untuk $C$ tumpul", marks: 2 },
            ],
            solution:
              "Ambil sisi $b$ sebagai alas, dan tarik garis tinggi $t$ dari titik sudut di ujung sisi $a$ ke garis yang memuat $b$.\n\n**Tingginya.** Garis tinggi itu membentuk segitiga siku-siku dengan $a$ sebagai sisi miring dan $C$ sebagai salah satu sudutnya, jadi\n\n$$t = a\\sin C.$$\n\n**Luasnya.**\n\n$$L = \\tfrac12\\,b\\,t = \\tfrac12\\,ab\\sin C.$$\n\n**Sudut tumpul.** Kalau $C$ tumpul, kaki garis tinggi jatuh di luar sisi $b$, dan sudut pada segitiga siku-siku itu menjadi $180^\\circ - C$. Namun $\\sin(180^\\circ - C) = \\sin C$, sehingga $t = a\\sin C$ tetap, dan rumusnya tidak berubah. $\\blacksquare$",
            explanation: "Bagian sudut tumpul itulah yang dinilai paling berat: rumus yang dibuktikan hanya untuk gambar lancip belum dibuktikan seluruhnya.",
          },
        ],
      },
    },

    // ───────────────────────────── Sesi 6 ─────────────────────────────
    {
      title: "Sesi 6: Bangun Datar & Bangun Ruang",
      blocks: [{ type: "PDF", dir: "olim-geo-sesi6", fileName: "OlimGeo-Sesi6-Bangun-Datar-dan-Bangun-Ruang.pdf" }],
      quiz: {
        title: "Latihan — Sesi 6: Bangun Datar & Bangun Ruang",
        questions: [
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa luas trapesium dengan sisi sejajar $8$ dan $12$ serta tinggi $5$?",
            answer: 50,
            explanation: "$\\frac{(8+12)\\cdot5}{2} = 50$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa luas layang-layang dengan diagonal $10$ dan $14$?",
            answer: 70,
            explanation: "$\\frac{10\\cdot14}{2} = 70$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Luas permukaan sebuah kubus $150\\ \\mathrm{cm}^2$. Berapa volumenya (dalam $\\mathrm{cm}^3$)?",
            answer: 125,
            explanation: "$6s^2 = 150$ memberi $s = 5$, jadi $V = 125$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa panjang diagonal ruang balok berukuran $3 \\times 4 \\times 12$?",
            answer: 13,
            explanation: "$\\sqrt{9+16+144} = \\sqrt{169} = 13$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Diagonal ruang kubus bersisi $8$ dapat ditulis $k\\sqrt3$. Berapa nilai $k$?",
            answer: 8,
            explanation: "Diagonal ruang kubus $= s\\sqrt3 = 8\\sqrt3$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Sebuah kerucut berjari-jari $6$ dengan garis pelukis $10$. Berapa tingginya?",
            answer: 8,
            explanation: "$\\sqrt{10^2-6^2} = \\sqrt{64} = 8$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Volume kerucut berjari-jari $6$ dan bertinggi $8$ dapat ditulis $k\\pi$. Berapa nilai $k$?",
            answer: 96,
            explanation: "$\\frac13\\pi\\cdot36\\cdot8 = 96\\pi$.",
          },
          {
            type: "NUMERIC",
            points: 1,
            prompt: "Berapa volume tabung berjari-jari $7$ dan bertinggi $10$? (Pakai $\\pi = \\frac{22}{7}$.)",
            answer: 1540,
            explanation: "$\\frac{22}{7}\\cdot49\\cdot10 = 1540$.",
          },
          {
            type: "FRACTION",
            points: 1,
            prompt: `Sebuah bola pas di dalam sebuah tabung. Berapa perbandingan volume bola terhadap volume tabung? ${FRAC}`,
            answer: "2/3",
            explanation: "$\\frac{\\frac43\\pi r^3}{\\pi r^2\\cdot2r} = \\frac23$ — tidak bergantung pada $r$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Sebuah lingkaran menyinggung keempat sisi persegi bersisi $14$ cm. Berapa luas daerah di dalam persegi tetapi di luar lingkaran (dalam $\\mathrm{cm}^2$, pakai $\\pi = \\frac{22}{7}$)?",
            answer: 42,
            explanation: "$196 - \\frac{22}{7}\\cdot49 = 196 - 154 = 42$.",
          },
          {
            type: "NUMERIC",
            points: 2,
            prompt: "Berapa volume limas dengan alas persegi bersisi $12$ dan tinggi $8$?",
            answer: 384,
            explanation: "$\\frac13\\cdot144\\cdot8 = 384$.",
          },
          {
            type: "MULTIPLE_CHOICE",
            points: 1,
            prompt: "Luas permukaan bola berjari-jari $r$ adalah…",
            options: ["$4\\pi r^2$", "$\\frac43\\pi r^2$", "$2\\pi r^2$", "$\\pi r^2$"],
            answer: "A",
            explanation: "Persis empat kali luas lingkaran besarnya — volumenya yang memakai $\\frac43$.",
          },
          {
            type: "WORKED",
            points: 5,
            prompt:
              "Sebuah limas mempunyai alas persegi bersisi $12$ cm, dan tinggi sisi tegaknya (jarak dari puncak ke titik tengah sebuah rusuk alas) $10$ cm. Tentukan tinggi limas dan volumenya. Tulis prosesnya, lalu tulis **volumenya** di kotak jawaban akhir.",
            answer: "384",
            answerMarks: 1,
            rubric: [
              { point: "Menggambar penampang lewat puncak dan dua titik tengah rusuk alas yang berhadapan", marks: 2 },
              { point: "Memakai Pythagoras dengan kaki $6$ (separuh sisi alas) untuk mendapat tinggi $8$", marks: 1 },
              { point: "Menghitung $V = \\frac13\\cdot144\\cdot8 = 384$", marks: 1 },
            ],
            solution:
              "**Penampangnya.** Potong limas dengan bidang lewat puncak dan dua titik tengah rusuk alas yang berhadapan. Yang muncul segitiga sama kaki: alasnya $12$ (sisi persegi), kedua kakinya tinggi sisi tegak, yaitu $10$.\n\n**Tinggi limas.** Tinggi limas adalah garis tinggi segitiga itu, dan kakinya separuh alas, yaitu $6$:\n\n$$t = \\sqrt{10^2 - 6^2} = \\sqrt{64} = 8\\ \\text{cm}.$$\n\n**Volumenya.**\n\n$$V = \\tfrac13 \\cdot 12^2 \\cdot 8 = \\tfrac13\\cdot144\\cdot8 = \\mathbf{384}\\ \\mathrm{cm}^3.$$",
            explanation: "Perhatikan kakinya $6$, bukan $6\\sqrt2$. Yang diketahui tinggi **sisi tegak**, bukan **rusuk tegak** — kalau yang diketahui rusuk tegak, penampangnya lewat diagonal alas dan kakinya menjadi separuh diagonal.",
          },
          {
            type: "WORKED",
            points: 6,
            prompt:
              "Pada setiap sisi sebuah persegi bersisi $14$ cm dibuat setengah lingkaran ke arah luar dengan sisi persegi sebagai diameternya. Tentukan luas seluruh bangun yang terbentuk. Tulis prosesnya (pakai $\\pi = \\frac{22}{7}$), lalu tulis luasnya di kotak jawaban akhir.",
            answer: "504",
            answerMarks: 1,
            rubric: [
              { point: "Memisahkan bangun menjadi persegi ditambah empat setengah lingkaran yang tidak bertumpuk", marks: 2 },
              { point: "Menyebut jari-jari setiap setengah lingkaran $7$, yaitu separuh diameter $14$", marks: 2 },
              { point: "Menjumlahkan: $196 + 4\\cdot77 = 504$", marks: 1 },
            ],
            solution:
              "**Memisahkan.** Keempat setengah lingkaran dibuat ke arah luar, jadi tidak ada yang bertumpuk dengan persegi maupun satu sama lain. Luas totalnya adalah jumlah kelimanya.\n\n**Persegi.** $14^2 = 196\\ \\mathrm{cm}^2$.\n\n**Satu setengah lingkaran.** Diameternya $14$, jadi jari-jarinya $r = 7$:\n\n$$\\tfrac12\\pi r^2 = \\tfrac12\\cdot\\frac{22}{7}\\cdot49 = 77\\ \\mathrm{cm}^2.$$\n\n**Seluruhnya.**\n\n$$196 + 4\\cdot77 = 196 + 308 = \\mathbf{504}\\ \\mathrm{cm}^2.$$",
            explanation: "Kesalahan tersering: memakai $r = 14$. Yang diberikan sisi persegi, dan sisi itu **diameter**, bukan jari-jari.",
          },
        ],
      },
    },
  ],
};
