/**
 * Kombinatorika, Statistika, dan Peluang — the three levels of the Junior Path
 * module, each with its quizzes. New problems in the module's patterns.
 * Answers are recomputed in scripts/check-olim-levels.py.
 */
import { BIG, FRAC, drill, frac, langkah, latihan, levelIntro, mistake, num, parts, review, steps, uji, worked, type LevelChapter } from "./olim-levels-types";

const L1 = "Kombinatorika Level 1";
const L2 = "Kombinatorika Level 2";
const L3 = "Kombinatorika Level 3";

export const LV_KOMBINATORIKA: LevelChapter = {
  chapterTitle: "Kombinatorika",
  levels: [
    {
      title: "Level 1: Menghitung dengan Rapi",
      pdfDir: "olim-jp-kom-1",
      pdfName: "Kombinatorika-Level-1-Menghitung-dengan-Rapi.pdf",
      intro: levelIntro(1, "aturan penjumlahan dan perkalian, faktorial dan permutasi, kombinasi, peluang, statistika dan perbandingan", true),
      quizzes: [
        langkah(L1, [
          steps(
            `Ada berapa bilangan genap empat digit yang semua digitnya berbeda? ${BIG}`,
            [
              ["Kasus angka satuan 0: banyak bilangannya", "504"],
              ["Kasus angka satuan 2, 4, 6, atau 8: banyak bilangannya", "1792"],
              ["Total", "2296"],
            ],
            "Satuan 0: ribuan 9 pilihan, ratusan 8, puluhan 7, jadi $504$. Satuan 2/4/6/8: satuan 4 pilihan, ribuan 8 (bukan 0, bukan satuan), ratusan 8, puluhan 7, jadi $4 \\cdot 8 \\cdot 8 \\cdot 7 = 1792$."
          ),
          steps(
            "Dari 7 siswa laki-laki dan 4 siswa perempuan dipilih tim 5 orang yang memuat paling sedikit 3 perempuan. Ada berapa cara?",
            [
              ["Tepat 3 perempuan", "84"],
              ["Tepat 4 perempuan", "7"],
              ["Total", "91"],
            ],
            "$C(4,3) \\cdot C(7,2) = 4 \\cdot 21 = 84$ dan $C(4,4) \\cdot C(7,1) = 7$."
          ),
          parts(
            "Enam orang, termasuk Ani dan Budi, berbaris.",
            [
              ["Banyak semua susunan", "720"],
              ["Ani dan Budi berdampingan", "240"],
              ["Ani dan Budi tidak berdampingan", "480"],
            ],
            "$6! = 720$. Ikat Ani–Budi menjadi satu blok: $5! \\cdot 2 = 240$. Sisanya $720 - 240 = 480$."
          ),
          steps(
            "Dua dadu dilempar. Berapa peluang hasil kali kedua mata dadu genap?",
            [
              ["Banyak pasangan dengan kedua mata dadu ganjil", "9"],
              ["Banyak pasangan dengan hasil kali genap", "27"],
              ["Peluangnya (tulis sebagai a/b)", "3/4"],
            ],
            "Hasil kali ganjil hanya jika kedua mata ganjil: $3 \\cdot 3 = 9$. Komplemennya $36 - 9 = 27$, dan $\\frac{27}{36} = \\frac34$."
          ),
          mistake(
            "Rata-rata nilai 20 siswa kelas A adalah 70 dan rata-rata 30 siswa kelas B adalah 80. Joko menghitung rata-rata gabungannya.",
            ["Total nilai kelas A: 20 × 70 = 1400.", "Total nilai kelas B: 30 × 80 = 2400.", "Rata-rata gabungan = (70 + 80) : 2 = 75."],
            2,
            "Rata-rata gabungan memakai total nilai: $\\frac{1400 + 2400}{50} = 76$, bukan rata-rata dari kedua rata-rata."
          ),
          parts(
            "Perbandingan kelereng A : B adalah 2 : 3 dan B : C adalah 4 : 5. Jumlah kelereng ketiganya 210.",
            [
              ["Banyak bagian seluruhnya pada A : B : C dengan bilangan bulat terkecil", "35"],
              ["Banyak kelereng C", "90"],
              ["Banyak kelereng A", "48"],
            ],
            "Samakan B menjadi 12: $A : B : C = 8 : 12 : 15$, total 35 bagian. Satu bagian $210 \\div 35 = 6$, jadi $C = 90$ dan $A = 48$."
          ),
        ]),
        latihan(L1, [
          num("Ada berapa bilangan tiga digit yang semua digitnya ganjil?", 125, "Setiap posisi punya 5 pilihan: $5^3$."),
          num("Dari angka 0, 1, 2, 3, 4, 5 disusun bilangan tiga digit dengan digit berbeda yang habis dibagi 5. Ada berapa?", 36, "Satuan 0: $5 \\cdot 4 = 20$. Satuan 5: ratusan 4 pilihan (bukan 0, bukan 5), puluhan 4: $16$."),
          num("Dari 9 orang dipilih ketua, wakil, dan sekretaris. Ada berapa cara?", 504, "$P(9, 3) = 9 \\cdot 8 \\cdot 7$."),
          num("Ada 10 titik dan tidak ada tiga yang segaris. Ada berapa segitiga yang titik sudutnya dari titik-titik itu?", 120, "$C(10, 3) = 120$."),
          num("Ada berapa diagonal pada segi-12?", 54, "$C(12, 2) - 12 = 66 - 12$."),
          num("Tim 4 orang dipilih dari 5 laki-laki dan 4 perempuan dengan tepat 2 perempuan. Ada berapa cara?", 60, "$C(4, 2) \\cdot C(5, 2) = 6 \\cdot 10$."),
          frac(`Tiga koin dilempar. Berapa peluang muncul tepat dua angka? ${FRAC}`, "3/8", "$C(3, 2) = 3$ dari 8 hasil."),
          frac(`Kantong berisi 4 kelereng merah dan 6 biru. Dua kelereng diambil sekaligus. Berapa peluang warnanya berbeda? ${FRAC}`, "8/15", "$\\frac{4 \\cdot 6}{C(10, 2)} = \\frac{24}{45}$."),
          num("Rata-rata 8 bilangan adalah 15. Setelah satu bilangan ditambahkan, rata-ratanya 16. Berapa bilangan itu?", 24, "$9 \\cdot 16 - 8 \\cdot 15 = 144 - 120$."),
          num("Peta berskala $1 : 200\\,000$. Sebuah danau di peta luasnya $3$ cm². Berapa km² luas sebenarnya?", 12, "1 cm mewakili 2 km, jadi 1 cm² mewakili 4 km²."),
        ]),
        drill(L1, "Faktorial, Permutasi, Kombinasi", "counting"),
        uji(L1, false, [
          num("Dari angka 1 sampai 7 disusun bilangan empat digit dengan digit berbeda yang lebih dari 5000. Ada berapa?", 360, "Ribuan 5, 6, atau 7: $3 \\cdot 6 \\cdot 5 \\cdot 4$.", 20),
          num("Tujuh orang, termasuk Ani, berbaris. Ada berapa susunan jika Ani tidak berdiri di ujung?", 3600, "Ani punya 5 posisi, sisanya $6!$: $5 \\cdot 720$.", 20),
          num("Panitia 4 orang dipilih dari 6 laki-laki dan 5 perempuan, dengan paling sedikit satu laki-laki dan satu perempuan. Ada berapa cara?", 310, "Komplemen: $C(11, 4) - C(6, 4) - C(5, 4) = 330 - 15 - 5$.", 20),
          frac(`Dua dadu dilempar. Berapa peluang jumlah mata dadunya bilangan prima? ${FRAC}`, "5/12", "Jumlah 2, 3, 5, 7, 11 muncul $1 + 2 + 4 + 6 + 2 = 15$ kali dari 36.", 20),
          num("Sebuah kelas berisi 40 siswa. Rata-rata putra 65, rata-rata putri 80, dan rata-rata kelas 74. Ada berapa siswa putri?", 24, "$65(40 - q) + 80q = 74 \\cdot 40$, jadi $15q = 360$.", 20),
        ]),
      ],
    },
    {
      title: "Level 2: Menghitung Tanpa Mendaftar",
      pdfDir: "olim-jp-kom-2",
      pdfName: "Kombinatorika-Level-2-Menghitung-Tanpa-Mendaftar.pdf",
      intro: levelIntro(2, "unsur yang sama dan susunan melingkar, lintasan pada petak, membagi benda ke dalam kotak, prinsip inklusi-eksklusi, peluang dengan kombinatorika", true),
      quizzes: [
        langkah(L2, [
          steps(
            "Ada berapa susunan huruf BANANA yang ketiga huruf A-nya tidak ada yang berdampingan?",
            [
              ["Banyak susunan semua huruf BANANA", "60"],
              ["Banyak susunan huruf B, N, N saja", "3"],
              ["Banyak celah (termasuk kedua ujung) untuk menaruh A di antara B, N, N", "4"],
              ["Banyak susunan dengan A tidak berdampingan", "12"],
            ],
            "$\\frac{6!}{3!\\,2!} = 60$. Susun B, N, N dulu ($3$ cara), lalu pilih 3 dari 4 celah untuk A: $3 \\cdot C(4, 3) = 12$."
          ),
          steps(
            "Ada berapa lintasan terpendek dari $(0, 0)$ ke $(6, 4)$ yang melewati $(3, 1)$ dan $(5, 3)$?",
            [
              ["Dari (0, 0) ke (3, 1)", "4"],
              ["Dari (3, 1) ke (5, 3)", "6"],
              ["Dari (5, 3) ke (6, 4)", "2"],
              ["Total", "48"],
            ],
            "$C(4, 1) \\cdot C(4, 2) \\cdot C(2, 1) = 4 \\cdot 6 \\cdot 2$."
          ),
          parts(
            "Hitung banyak solusi $a + b + c + d = 15$.",
            [
              ["a, b, c, d bilangan bulat tak negatif", "816"],
              ["a, b, c, d bilangan asli", "364"],
              ["a ≥ 3 dan b, c, d bilangan bulat tak negatif", "455"],
            ],
            "Stars and bars: $C(18, 3) = 816$. Bilangan asli: $C(14, 3) = 364$. Dengan $a = a' + 3$: $a' + b + c + d = 12$, $C(15, 3) = 455$."
          ),
          steps(
            "Ada berapa bilangan dari 1 sampai 300 yang habis dibagi 3, 5, atau 7?",
            [
              ["n(3) + n(5) + n(7)", "202"],
              ["n(15) + n(21) + n(35)", "42"],
              ["n(105)", "2"],
              ["Total", "162"],
            ],
            "$100 + 60 + 42 = 202$, $20 + 14 + 8 = 42$, $\\lfloor 300/105 \\rfloor = 2$. Inklusi-eksklusi: $202 - 42 + 2 = 162$."
          ),
          mistake(
            "Delapan orang duduk mengelilingi meja bundar, dengan Ani dan Budi bersebelahan. Edo menghitung banyak susunannya.",
            ["Ani dan Budi dijadikan satu blok, jadi ada 7 objek.", "Susunan melingkar 7 objek: 7! = 5040.", "Dikali 2 untuk urutan di dalam blok: 10080."],
            1,
            "Susunan melingkar $n$ objek adalah $(n - 1)!$, jadi $6! = 720$, dan jawabannya $1440$."
          ),
          parts(
            "Lima surat dimasukkan secara acak ke lima amplop yang sudah beralamat, satu surat per amplop.",
            [
              ["Banyak cara tidak ada surat yang masuk amplopnya sendiri", "44"],
              ["Banyak cara tepat satu surat yang benar", "45"],
              ["Banyak cara semua surat benar", "1"],
            ],
            "Inklusi-eksklusi: $5! - 5 \\cdot 4! + 10 \\cdot 3! - 10 \\cdot 2! + 5 \\cdot 1! - 1 = 44$. Tepat satu benar: pilih suratnya (5 cara), empat lainnya salah semua ($9$ cara), jadi $45$."
          ),
        ]),
        latihan(L2, [
          num(`Ada berapa susunan huruf kata SEMESTER? ${BIG}`, 3360, "8 huruf, E tiga kali, S dua kali: $\\frac{8!}{3!\\,2!}$."),
          num("Tujuh orang duduk mengelilingi meja bundar. Ada berapa susunan?", 720, "$(7 - 1)! = 720$."),
          num("Tujuh manik-manik berbeda warna dirangkai menjadi gelang. Ada berapa gelang berbeda?", 360, "Gelang bisa dibalik: $\\frac{6!}{2}$."),
          num("Ada berapa lintasan terpendek dari $(0, 0)$ ke $(5, 5)$ yang tidak melewati $(2, 3)$?", 152, "$C(10, 5) - C(5, 2) \\cdot C(5, 3) = 252 - 100$."),
          num("Dua puluh permen yang sama dibagikan kepada 4 anak, setiap anak paling sedikit 3 permen. Ada berapa cara?", 165, "Beri dulu 3 permen per anak, sisa 8 dibagi bebas: $C(11, 3)$."),
          num("Ada berapa solusi bilangan bulat tak negatif $x + y + z = 10$ dengan $x \\le 3$?", 38, "Semua solusi $C(12, 2) = 66$, dikurangi yang $x \\ge 4$: $C(8, 2) = 28$."),
          num("Ada berapa bilangan dari 1 sampai 500 yang tidak habis dibagi 2, 3, maupun 5?", 134, "Habis dibagi salah satunya: $250 + 166 + 100 - 83 - 50 - 33 + 16 = 366$."),
          num("Dari 50 siswa, 30 suka basket, 25 suka voli, dan 8 tidak suka keduanya. Ada berapa yang suka keduanya?", 13, "$50 - 8 = 30 + 25 - x$."),
          frac(`Panitia 3 orang dipilih acak dari 6 laki-laki dan 4 perempuan. Berapa peluang panitia memuat paling sedikit satu perempuan? ${FRAC}`, "5/6", "Komplemen: semua laki-laki $\\frac{C(6, 3)}{C(10, 3)} = \\frac{20}{120}$."),
          frac(`Lima bola berbeda dimasukkan secara acak ke 3 kotak berbeda. Berapa peluang tidak ada kotak yang kosong? ${FRAC}`, "50/81", "Inklusi-eksklusi: $3^5 - 3 \\cdot 2^5 + 3 \\cdot 1 = 150$ dari $243$."),
        ]),
        drill(L2, "Inklusi-Eksklusi", "inclusion-exclusion"),
        uji(L2, false, [
          num(`Ada berapa susunan huruf kata KALKULUS yang kedua huruf K-nya berdampingan? ${BIG}`, 1260, "Jadikan KK satu blok: 7 objek dengan L dan U masing-masing dua kali, $\\frac{7!}{2!\\,2!}$.", 20),
          num("Ada berapa solusi bilangan bulat tak negatif $a + b + c = 12$ dengan $a, b, c \\le 6$?", 28, "Semua $C(14, 2) = 91$. Satu variabel $\\ge 7$: $3 \\cdot C(7, 2) = 63$. Dua variabel $\\ge 7$ tidak mungkin.", 20),
          num("Ada berapa bilangan dari 1 sampai 1000 yang merupakan kelipatan 4 atau 6, tetapi bukan kelipatan 9?", 278, "Kelipatan 4 atau 6: $250 + 166 - 83 = 333$. Di antaranya kelipatan 9: kelipatan 36 atau 18, yaitu $55$.", 20),
          frac(`Lima orang, termasuk Ani dan Budi, duduk acak mengelilingi meja bundar. Berapa peluang Ani dan Budi bersebelahan? ${FRAC}`, "1/2", "Dudukkan Ani dulu. Dari 4 kursi tersisa, 2 bersebelahan dengan Ani.", 20),
          num("Tiga dadu dilempar. Ada berapa hasil yang jumlah matanya 10?", 27, "Solusi $a + b + c = 10$ dengan $1 \\le a, b, c \\le 6$: $C(9, 2) - 3 \\cdot C(3, 2) = 36 - 9$.", 20),
        ]),
      ],
    },
    {
      title: "Level 3: Dari Peluang ke Kepastian",
      pdfDir: "olim-jp-kom-3",
      pdfName: "Kombinatorika-Level-3-Dari-Peluang-ke-Kepastian.pdf",
      intro: levelIntro(3, "peluang bersyarat, kejadian saling bebas, rata-rata berbobot dan data yang menyimpang, prinsip sarang merpati", false),
      quizzes: [
        langkah(L3, [
          steps(
            "Kotak I berisi 3 bola merah dan 2 putih, kotak II berisi 1 merah dan 4 putih. Sebuah kotak dipilih acak, lalu satu bola diambil, dan ternyata merah. Berapa peluang bola itu dari kotak I? (Tulis setiap jawaban sebagai a/b.)",
            [
              ["P(kotak I dan merah)", "3/10"],
              ["P(kotak II dan merah)", "1/10"],
              ["P(merah)", "2/5"],
              ["P(kotak I | merah)", "3/4"],
            ],
            "$\\frac12 \\cdot \\frac35 = \\frac3{10}$ dan $\\frac12 \\cdot \\frac15 = \\frac1{10}$. Jadi $P(\\text{merah}) = \\frac4{10}$ dan peluang bersyaratnya $\\frac{3/10}{4/10} = \\frac34$."
          ),
          steps(
            "Andi dan Budi bergantian melempar dadu, dimulai Andi. Yang pertama mendapat mata 6 menang. Berapa peluang Andi menang? (Tulis setiap jawaban sebagai a/b.)",
            [
              ["Peluang Andi menang di lemparan pertama", "1/6"],
              ["Peluang dua lemparan pertama sama-sama bukan 6", "25/36"],
              ["Peluang Andi menang", "6/11"],
            ],
            "Jika dua lemparan pertama bukan 6, permainan mulai lagi dari awal: $p = \\frac16 + \\frac{25}{36}p$, jadi $\\frac{11}{36}p = \\frac16$ dan $p = \\frac6{11}$."
          ),
          parts(
            "Dua dadu dilempar, dan diketahui jumlah matanya 9. (Tulis peluang sebagai a/b, atau 0.)",
            [
              ["Banyak hasil dalam ruang sampel yang baru", "4"],
              ["Peluang salah satu dadu menunjukkan 6", "1/2"],
              ["Peluang kedua mata dadu ganjil", "0"],
            ],
            "Ruang sampelnya $(3, 6), (4, 5), (5, 4), (6, 3)$. Dua di antaranya memuat 6. Jumlah 9 ganjil, jadi satu mata ganjil dan satu genap: kedua ganjil mustahil."
          ),
          steps(
            "Paling sedikit berapa bilangan harus diambil dari $1, 2, \\ldots, 20$ agar pasti ada dua bilangan yang jumlahnya $21$?",
            [
              ["Ada berapa pasangan yang berjumlah 21 (1 + 20, 2 + 19, …)?", "10"],
              ["Paling banyak berapa bilangan bisa diambil tanpa ada pasangan berjumlah 21?", "10"],
              ["Jawabannya", "11"],
            ],
            "Sepuluh pasangan adalah 'kotak'. Satu bilangan dari setiap pasangan (misalnya $1$ sampai $10$) belum memuat pasangan; bilangan ke-11 pasti melengkapi salah satu pasangan."
          ),
          mistake(
            "Sebuah keluarga punya dua anak, dan diketahui paling sedikit satu laki-laki. Lina mencari peluang keduanya laki-laki.",
            ["Ruang sampel awal: LL, LP, PL, PP.", "Dengan syarat itu, tersisa LL, LP, PL.", "Anak yang lain laki-laki dengan peluang 1/2.", "Jadi peluangnya 1/2."],
            2,
            "Tidak ada 'anak yang lain' yang tertentu. Dari tiga hasil yang tersisa, hanya LL yang memenuhi, jadi peluangnya $\\frac13$."
          ),
          parts(
            "Kelas A berisi 10 siswa dengan rata-rata 80, kelas B berisi 9 siswa dengan rata-rata 69. Seorang siswa bernilai 71 pindah dari kelas A ke kelas B.",
            [
              ["Rata-rata baru kelas A", "81"],
              ["Rata-rata baru kelas B", "69,2"],
            ],
            "Kelas A: $\\frac{800 - 71}{9} = 81$. Kelas B: $\\frac{621 + 71}{10} = 69{,}2$. Rata-rata keduanya naik, padahal tidak ada nilai yang berubah."
          ),
        ]),
        latihan(L3, [
          frac(`Dua dadu dilempar, dan diketahui mata dadu pertama ganjil. Berapa peluang jumlahnya paling sedikit 9? ${FRAC}`, "2/9", "Ruang sampel 18 pasangan. Yang berjumlah $\\ge 9$: $(3, 6), (5, 4), (5, 5), (5, 6)$."),
          frac(`Kotak berisi 4 bola merah dan 2 putih. Dua bola diambil satu per satu tanpa pengembalian. Berapa peluang bola kedua putih? ${FRAC}`, "1/3", "$\\frac46 \\cdot \\frac25 + \\frac26 \\cdot \\frac15 = \\frac{10}{30}$ — sama dengan peluang bola pertama putih."),
          frac(`Mesin A membuat 50% barang dengan 3% cacat, mesin B 30% dengan 2% cacat, dan mesin C 20% dengan 5% cacat. Sebuah barang cacat diambil acak. Berapa peluang barang itu dibuat mesin C? ${FRAC}`, "10/31", "Cacat dari A, B, C: $0{,}015$, $0{,}006$, $0{,}010$. Jadi $\\frac{0{,}010}{0{,}031}$."),
          num("Peluang Andi lulus 0,8 dan peluang Budi lulus 0,6, saling bebas. Berapa peluang tepat satu dari mereka lulus? Tulis sebagai desimal.", 0.44, "$0{,}8 \\cdot 0{,}4 + 0{,}2 \\cdot 0{,}6 = 0{,}32 + 0{,}12$."),
          frac(`Sebuah koin dilempar sampai muncul angka. Berapa peluang paling banyak 3 lemparan diperlukan? ${FRAC}`, "7/8", "Komplemen: tiga lemparan pertama gambar semua, $\\frac18$."),
          num("Rata-rata nilai 30 siswa tercatat 68. Ternyata satu nilai 92 salah ditulis 29. Berapa rata-rata yang benar? Tulis sebagai desimal.", 70.1, "Total bertambah $63$, jadi rata-rata naik $\\frac{63}{30} = 2{,}1$."),
          num("Lima bilangan asli berbeda memiliki rata-rata 10 dan median 8. Berapa bilangan terbesar yang mungkin?", 30, "Jumlahnya 50. Supaya yang terbesar maksimal, buat yang lain sekecil mungkin: $1, 2, 8, 9$, sisanya $50 - 20 = 30$."),
          num("Laci berisi 6 kaus kaki merah, 8 biru, dan 10 hitam. Paling sedikit berapa yang harus diambil agar pasti mendapat 3 kaus kaki berwarna sama?", 7, "Paling sial dua dari setiap warna ($6$), lalu yang ketujuh pasti menjadi yang ketiga."),
          num("Paling sedikit berapa orang diperlukan agar pasti ada 4 orang yang lahir pada hari yang sama dalam seminggu?", 22, "$kn + 1$ dengan $k = 3$, $n = 7$."),
          num("Paling sedikit berapa bilangan harus diambil dari $1, 2, \\ldots, 30$ agar pasti ada dua bilangan yang selisihnya 15?", 16, "Pasangan $(1, 16), (2, 17), \\ldots, (15, 30)$ ada 15. Bilangan ke-16 pasti melengkapi salah satunya."),
        ]),
        uji(L3, true, [
          frac(`Tiga koin dilempar, dan diketahui muncul paling sedikit satu angka. Berapa peluang ketiganya angka? ${FRAC}`, "1/7", "Ruang sampel menyusut menjadi 7 hasil, dan hanya satu yang AAA.", 15),
          frac(`Andi dan Budi bergantian melempar dua koin sekaligus, dimulai Andi. Yang pertama mendapat dua angka menang. Berapa peluang Andi menang? ${FRAC}`, "4/7", "$p = \\frac14 + \\frac34 \\cdot \\frac34 \\cdot p$, jadi $\\frac7{16}p = \\frac14$.", 15),
          num("Nilai akhir dihitung dari tugas (25%), UTS (35%), dan UAS (40%). Nilai tugas Sari 84 dan UTS-nya 72. Berapa nilai UAS minimal agar nilai akhirnya paling sedikit 80? Boleh desimal.", 84.5, "$21 + 25{,}2 + 0{,}4u \\ge 80$, jadi $0{,}4u \\ge 33{,}8$.", 15),
          num("Paling sedikit berapa bilangan harus diambil dari $1, 2, \\ldots, 50$ agar pasti ada dua bilangan yang jumlahnya habis dibagi 7?", 24, "Kelompokkan menurut sisa modulo 7. Sisa 0 ada 7 bilangan, sisa 1 ada 8, sisa 2–6 masing-masing 7. Tanpa pasangan berjumlah kelipatan 7, paling banyak satu dari sisa 0, dan dari setiap pasangan sisa $\\{1, 6\\}, \\{2, 5\\}, \\{3, 4\\}$ hanya satu sisa: $1 + 8 + 7 + 7 = 23$.", 15),
          worked(
            "Buktikan bahwa di antara 5 titik dengan koordinat bilangan bulat pada bidang, pasti ada dua titik yang titik tengahnya juga berkoordinat bilangan bulat.",
            "",
            0,
            [
              ["Menyatakan syarat: titik tengah bulat jika kedua x sama paritas dan kedua y sama paritas", 6],
              ["Menyebut 4 kelompok paritas (genap/ganjil untuk x dan y) sebagai kotak", 6],
              ["Menerapkan prinsip sarang merpati: 5 titik di 4 kotak", 6],
              ["Menyimpulkan dengan jelas", 2],
            ],
            "Titik tengah $(x_1, y_1)$ dan $(x_2, y_2)$ adalah $\\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$. Koordinatnya bulat tepat ketika $x_1, x_2$ sama paritasnya **dan** $y_1, y_2$ sama paritasnya.\n\nSetiap titik bulat masuk salah satu dari 4 kelompok paritas: (genap, genap), (genap, ganjil), (ganjil, genap), (ganjil, ganjil).\n\nAda 5 titik dan 4 kelompok, jadi menurut prinsip sarang merpati dua titik berada di kelompok yang sama. Titik tengah keduanya berkoordinat bulat. $\\blacksquare$"
          ),
          worked(
            "Dua dadu dilempar, dan diketahui hasil kali kedua mata dadunya genap. Berapa peluang jumlah kedua mata dadunya juga genap? Tuliskan ruang sampel yang dipakai.",
            "1/3",
            4,
            [
              ["Menghitung ruang sampel baru: 36 − 9 = 27 hasil", 6],
              ["Menjelaskan bahwa jumlah genap dan hasil kali genap berarti kedua mata genap: 9 hasil", 6],
              ["Menghitung 9/27 = 1/3", 4],
            ],
            "Hasil kali ganjil hanya jika kedua mata ganjil ($9$ hasil), jadi hasil kali genap terjadi pada $27$ hasil.\n\nJumlah genap berarti kedua mata sama paritasnya. Karena hasil kalinya genap, keduanya tidak bisa ganjil, jadi keduanya genap: $3 \\cdot 3 = 9$ hasil.\n\nPeluangnya $\\frac9{27} = \\frac13$."
          ),
        ]),
      ],
    },
  ],
  closing: [review("Kombinatorika")],
};
