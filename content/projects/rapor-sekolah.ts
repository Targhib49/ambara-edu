/**
 * Basic Python › Modul 3: Proyek Akhir — Sistem Rapor Sekolah, as a guided
 * project. Same theme, students, subjects, weights (30/30/40), KKM 75 and
 * report layout as the six Tahap lessons; the program is split into modules
 * the way the old final program was split into BAGIAN 1–5.
 *
 *   npx tsx scripts/project.ts validate content/projects/rapor-sekolah.ts
 *
 * Format: docs/project-authoring.md.
 */
import type { ProjectDefinitionInput } from "../../src/lib/projects/definition";

/** Python source, kept verbatim (backslashes too); the leading newline is dropped. */
const py = (strings: TemplateStringsArray, ...values: unknown[]) => String.raw(strings, ...values).replace(/^\n/, "");
/** Program output as the student should see it. */
const out = (strings: TemplateStringsArray) => strings.raw.join("").replace(/^\n/, "").replace(/\s+$/, "");

// ------------------------------------------------------------------ the data

const DATA_PY = py`
# Data nilai lima siswa, satu angka per mata pelajaran.
# Jangan diubah — datanya dipakai sampai Tahap 6.

data_nilai = {
    "Dewi": {"Matematika": 88, "IPA": 92, "Bahasa": 81},
    "Budi": {"Matematika": 69, "IPA": 71, "Bahasa": 82},
    "Sari": {"Matematika": 96, "IPA": 90, "Bahasa": 88},
    "Andi": {"Matematika": 60, "IPA": 67, "Bahasa": 72},
    "Rina": {"Matematika": 80, "IPA": 85, "Bahasa": 87},
}
`;

const DATA_LENGKAP_PY = py`
# Data lengkap: setiap mata pelajaran punya nilai tugas, UTS, dan UAS.
# Tingkatnya sekarang tiga: siswa -> mata pelajaran -> komponen.

data_nilai = {
    "Dewi": {
        "Matematika": {"tugas": 90, "uts": 85, "uas": 88},
        "IPA": {"tugas": 95, "uts": 90, "uas": 92},
        "Bahasa": {"tugas": 80, "uts": 78, "uas": 85},
    },
    "Budi": {
        "Matematika": {"tugas": 70, "uts": 65, "uas": 72},
        "IPA": {"tugas": 75, "uts": 70, "uas": 68},
        "Bahasa": {"tugas": 85, "uts": 80, "uas": 82},
    },
    "Sari": {
        "Matematika": {"tugas": 95, "uts": 98, "uas": 96},
        "IPA": {"tugas": 92, "uts": 88, "uas": 90},
        "Bahasa": {"tugas": 88, "uts": 85, "uas": 90},
    },
    "Andi": {
        "Matematika": {"tugas": 65, "uts": 55, "uas": 60},
        "IPA": {"tugas": 70, "uts": 62, "uas": 68},
        "Bahasa": {"tugas": 75, "uts": 70, "uas": 72},
    },
    "Rina": {
        "Matematika": {"tugas": 82, "uts": 78, "uas": 80},
        "IPA": {"tugas": 85, "uts": 82, "uas": 88},
        "Bahasa": {"tugas": 90, "uts": 88, "uas": 85},
    },
}
`;

// ------------------------------------------------------------------ the modules, as each step leaves them

const NILAI_STUB = py`
# Fungsi-fungsi penilaian. main.py memakainya dengan:
#     from nilai import rata_rata, nilai_huruf, predikat

KKM = 75


def rata_rata(daftar):
    # TODO: kembalikan rata-rata sebuah list angka. Kembalikan 0 kalau listnya kosong.
    pass


def nilai_huruf(angka):
    # TODO: >= 90 -> "A", >= 80 -> "B", >= 70 -> "C", selain itu "D"
    pass


def predikat(huruf):
    # TODO: "A" -> "Sangat Baik", "B" -> "Baik", "C" -> "Cukup", "D" -> "Perlu Bimbingan"
    pass
`;

const NILAI_TAHAP2 = py`
# Fungsi-fungsi penilaian. main.py memakainya dengan:
#     from nilai import rata_rata, nilai_huruf, predikat

KKM = 75


def rata_rata(daftar):
    if len(daftar) == 0:
        return 0
    return sum(daftar) / len(daftar)


def nilai_huruf(angka):
    if angka >= 90:
        return "A"
    elif angka >= 80:
        return "B"
    elif angka >= 70:
        return "C"
    return "D"


def predikat(huruf):
    if huruf == "A":
        return "Sangat Baik"
    elif huruf == "B":
        return "Baik"
    elif huruf == "C":
        return "Cukup"
    return "Perlu Bimbingan"
`;

const NILAI_TUNTAS = NILAI_TAHAP2 + py`


def status(angka):
    if angka >= KKM:
        return "Tuntas"
    return "Remedial"
`;

const NILAI_BERBOBOT = NILAI_TUNTAS + py`


def nilai_akhir_mapel(komponen):
    return komponen["tugas"] * 0.3 + komponen["uts"] * 0.3 + komponen["uas"] * 0.4


def hitung_nilai_akhir(data):
    hasil = {}
    for nama, mapel_dict in data.items():
        hasil[nama] = {}
        for mapel, komponen in mapel_dict.items():
            hasil[nama][mapel] = round(nilai_akhir_mapel(komponen), 2)
    return hasil


def hitung_rata_siswa(nilai_akhir):
    hasil = {}
    for nama, mapel_dict in nilai_akhir.items():
        hasil[nama] = round(rata_rata(list(mapel_dict.values())), 2)
    return hasil
`;

const PERINGKAT_STUB = py`
# Peringkat kelas. main.py memakainya dengan:
#     from peringkat import urutkan_peringkat


def urutkan_peringkat(rata_siswa):
    # TODO: kembalikan list nama siswa, dari rata-rata tertinggi ke terendah.
    # Tulis sendiri algoritmanya — ambil yang tertinggi, berulang kali
    # (selection sort, seperti di pelajaran Tahap 4). Jangan pakai sorted() atau .sort().
    pass
`;

const PERINGKAT_URUT = py`
# Peringkat kelas. main.py memakainya dengan:
#     from peringkat import urutkan_peringkat


def urutkan_peringkat(rata_siswa):
    # salin dulu, supaya data aslinya tidak ikut terhapus
    sisa = {}
    for nama, nilai in rata_siswa.items():
        sisa[nama] = nilai

    urutan = []
    while len(sisa) > 0:
        nama_terbaik = ""
        nilai_terbaik = -1
        for nama, nilai in sisa.items():
            if nilai > nilai_terbaik:
                nilai_terbaik = nilai
                nama_terbaik = nama
        urutan.append(nama_terbaik)
        del sisa[nama_terbaik]
    return urutan
`;

const PERINGKAT_TABEL = PERINGKAT_URUT + py`


def cetak_peringkat(peringkat, rata_siswa):
    from nilai import nilai_huruf, predikat

    print("=" * 44)
    print("PERINGKAT KELAS")
    print("=" * 44)
    for i in range(len(peringkat)):
        nama = peringkat[i]
        rata = rata_siswa[nama]
        huruf = nilai_huruf(rata)
        print(f"{i + 1}. {nama:<10}{rata:>6.2f}  {huruf}  {predikat(huruf)}")
`;

const RAPOR_STUB = py`
# Mencetak rapor. main.py memakainya dengan:
#     from rapor import cetak_rapor

from nilai import nilai_huruf, status


def cetak_rapor(nama, nilai_akhir, rata_siswa, peringkat):
    # TODO: cetak rapor satu siswa, persis seperti contoh di panduan.
    # Kolomnya: mapel rata kiri lebar 20, nilai rata kanan lebar 5 dengan 2 desimal,
    # dua spasi, huruf rata kiri lebar 7, lalu keterangan Tuntas/Remedial.
    pass
`;

const RAPOR_PY = py`
# Mencetak rapor. main.py memakainya dengan:
#     from rapor import cetak_rapor

from nilai import nilai_huruf, status


def cetak_rapor(nama, nilai_akhir, rata_siswa, peringkat):
    rata = rata_siswa[nama]
    print("=" * 44)
    print(f"RAPOR SISWA : {nama}")
    print("=" * 44)
    print("Mata Pelajaran      Nilai  Huruf  Keterangan")
    print("-" * 44)
    for mapel, n in nilai_akhir[nama].items():
        print(f"{mapel:<20}{n:>5.2f}  {nilai_huruf(n):<7}{status(n)}")
    print("-" * 44)
    print(f"{'Rata-rata':<20}{rata:>5.2f}  {nilai_huruf(rata)}")
    print(f"{'Peringkat':<20}{peringkat.index(nama) + 1:>5} dari {len(peringkat)}")
    print("=" * 44)
`;

const STATISTIK_STUB = py`
# Statistik kelas. main.py memakainya dengan:
#     from statistik import cetak_statistik

from nilai import KKM, rata_rata


def cetak_statistik(nilai_akhir):
    # TODO: cetak tabel statistik per mata pelajaran, persis seperti contoh di panduan:
    # rata-rata, nilai tertinggi, nilai terendah, dan berapa siswa yang tuntas,
    # lalu mata pelajaran dengan rata-rata terendah.
    pass
`;

const STATISTIK_PY = py`
# Statistik kelas. main.py memakainya dengan:
#     from statistik import cetak_statistik

from nilai import KKM, rata_rata


def ambil_daftar_mapel(nilai_akhir):
    daftar = []
    for nama in nilai_akhir:
        for mapel in nilai_akhir[nama]:
            if mapel not in daftar:
                daftar.append(mapel)
    return daftar


def nilai_satu_mapel(nilai_akhir, mapel):
    hasil = []
    for nama in nilai_akhir:
        hasil.append(nilai_akhir[nama][mapel])
    return hasil


def hitung_tuntas(daftar):
    jumlah = 0
    for n in daftar:
        if n >= KKM:
            jumlah += 1
    return jumlah


def cetak_statistik(nilai_akhir):
    print("=" * 54)
    print("STATISTIK PER MATA PELAJARAN")
    print("=" * 54)
    print("Mapel            Rata  Tertinggi  Terendah  Tuntas")
    print("-" * 54)

    mapel_tersulit = ""
    rata_terendah = 101
    for mapel in ambil_daftar_mapel(nilai_akhir):
        nilai = nilai_satu_mapel(nilai_akhir, mapel)
        rata = rata_rata(nilai)
        tuntas = hitung_tuntas(nilai)
        persen = tuntas / len(nilai) * 100
        print(
            f"{mapel:<14}{rata:>7.2f}{max(nilai):>11.2f}{min(nilai):>10.2f}"
            f"  {tuntas}/{len(nilai)} ({persen:.0f}%)"
        )
        if rata < rata_terendah:
            rata_terendah = rata
            mapel_tersulit = mapel

    print("-" * 54)
    print(f"Paling perlu perhatian: {mapel_tersulit} (rata-rata {rata_terendah:.2f})")
    print("=" * 54)
`;

// ------------------------------------------------------------------ main.py, step by step

const MAIN_START = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH
# Program ini kamu bangun sedikit demi sedikit, selama enam tahap.
# Ikuti panduan di sebelah kanan.

from data import data_nilai
`;

const MAIN_1 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data import data_nilai

nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka}")
else:
    print("Siswa tidak ditemukan")
`;

const RINGKASAN = py`
print("Jumlah siswa:", len(data_nilai))
daftar_nama = []
for nama in data_nilai:
    daftar_nama.append(nama)
print("Daftar siswa:", ", ".join(daftar_nama))
print()
`;

const MAIN_2 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data import data_nilai

` + RINGKASAN + py`
nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka}")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_3 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data import data_nilai
from nilai import rata_rata, nilai_huruf, predikat

` + RINGKASAN + py`
nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka}")
    rata = round(rata_rata(list(data_nilai[nama].values())), 2)
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_4 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data import data_nilai
from nilai import rata_rata, nilai_huruf, predikat, status

` + RINGKASAN + py`
nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka} ({status(angka)})")
    rata = round(rata_rata(list(data_nilai[nama].values())), 2)
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_5 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)

` + RINGKASAN + py`
nama = input()
if nama in nilai_akhir:
    print(f"Nilai {nama}:")
    for mapel, angka in nilai_akhir[nama].items():
        print(f"  {mapel}: {angka:.2f} ({status(angka)})")
    rata = rata_siswa[nama]
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_6 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
peringkat = urutkan_peringkat(rata_siswa)

` + RINGKASAN + py`
nama = input()
if nama in nilai_akhir:
    print(f"Nilai {nama}:")
    for mapel, angka in nilai_akhir[nama].items():
        print(f"  {mapel}: {angka:.2f} ({status(angka)})")
    rata = rata_siswa[nama]
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
    print(f"Peringkat: {peringkat.index(nama) + 1} dari {len(peringkat)}")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_7 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
peringkat = urutkan_peringkat(rata_siswa)

` + RINGKASAN + py`
perintah = input()
if perintah == "peringkat":
    cetak_peringkat(peringkat, rata_siswa)
elif perintah in nilai_akhir:
    nama = perintah
    print(f"Nilai {nama}:")
    for mapel, angka in nilai_akhir[nama].items():
        print(f"  {mapel}: {angka:.2f} ({status(angka)})")
    rata = rata_siswa[nama]
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
    print(f"Peringkat: {peringkat.index(nama) + 1} dari {len(peringkat)}")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_8 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
peringkat = urutkan_peringkat(rata_siswa)

` + RINGKASAN + py`
perintah = input()
if perintah == "peringkat":
    cetak_peringkat(peringkat, rata_siswa)
elif perintah in nilai_akhir:
    cetak_rapor(perintah, nilai_akhir, rata_siswa, peringkat)
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_9 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor
from statistik import cetak_statistik

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
peringkat = urutkan_peringkat(rata_siswa)

` + RINGKASAN + py`
perintah = input()
if perintah == "peringkat":
    cetak_peringkat(peringkat, rata_siswa)
elif perintah == "statistik":
    cetak_statistik(nilai_akhir)
elif perintah in nilai_akhir:
    cetak_rapor(perintah, nilai_akhir, rata_siswa, peringkat)
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_10 = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH

from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor
from statistik import cetak_statistik

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
peringkat = urutkan_peringkat(rata_siswa)

` + RINGKASAN + py`
while True:
    perintah = input()
    if perintah == "selesai":
        print("Sampai jumpa!")
        break
    elif perintah == "peringkat":
        cetak_peringkat(peringkat, rata_siswa)
    elif perintah == "statistik":
        cetak_statistik(nilai_akhir)
    elif perintah in nilai_akhir:
        cetak_rapor(perintah, nilai_akhir, rata_siswa, peringkat)
    else:
        print("Siswa tidak ditemukan")
    print()
`;

// ------------------------------------------------------------------ expected outputs

const RINGKAS_OUT = out`
Jumlah siswa: 5
Daftar siswa: Dewi, Budi, Sari, Andi, Rina
`;
const withSummary = (body: string) => `${RINGKAS_OUT}\n\n${body}`;

const RAPOR_DEWI = out`
============================================
RAPOR SISWA : Dewi
============================================
Mata Pelajaran      Nilai  Huruf  Keterangan
--------------------------------------------
Matematika          87.70  B      Tuntas
IPA                 92.30  A      Tuntas
Bahasa              81.40  B      Tuntas
--------------------------------------------
Rata-rata           87.13  B
Peringkat               2 dari 5
============================================
`;
const RAPOR_ANDI = out`
============================================
RAPOR SISWA : Andi
============================================
Mata Pelajaran      Nilai  Huruf  Keterangan
--------------------------------------------
Matematika          60.00  D      Remedial
IPA                 66.80  D      Remedial
Bahasa              72.30  C      Remedial
--------------------------------------------
Rata-rata           66.37  D
Peringkat               5 dari 5
============================================
`;
const RAPOR_SARI = out`
============================================
RAPOR SISWA : Sari
============================================
Mata Pelajaran      Nilai  Huruf  Keterangan
--------------------------------------------
Matematika          96.30  A      Tuntas
IPA                 90.00  A      Tuntas
Bahasa              87.90  B      Tuntas
--------------------------------------------
Rata-rata           91.40  A
Peringkat               1 dari 5
============================================
`;
const PERINGKAT_OUT = out`
============================================
PERINGKAT KELAS
============================================
1. Sari       91.40  A  Sangat Baik
2. Dewi       87.13  B  Baik
3. Rina       84.23  B  Baik
4. Budi       74.10  C  Cukup
5. Andi       66.37  D  Perlu Bimbingan
`;
const STATISTIK_OUT = out`
======================================================
STATISTIK PER MATA PELAJARAN
======================================================
Mapel            Rata  Tertinggi  Terendah  Tuntas
------------------------------------------------------
Matematika      78.66      96.30     60.00  3/5 (60%)
IPA             81.02      92.30     66.80  3/5 (60%)
Bahasa          82.26      87.90     72.30  4/5 (80%)
------------------------------------------------------
Paling perlu perhatian: Matematika (rata-rata 78.66)
======================================================
`;

// ------------------------------------------------------------------ the project

const TAHAP1 = "Tahap 1: Struktur Data Rapor";
const TAHAP2 = "Tahap 2: Rata-Rata & Nilai Huruf";
const TAHAP3 = "Tahap 3: Nilai Berbobot";
const TAHAP4 = "Tahap 4: Peringkat Kelas";
const TAHAP5 = "Tahap 5: Mencetak Rapor";
const TAHAP6 = "Tahap 6: Statistik & Program Lengkap";

const project = {
  course: "Basic Python",
  chapter: "Modul 3: Proyek Akhir — Sistem Rapor Sekolah",
  title: "Proyek Akhir: Sistem Rapor Sekolah",
  replaces: [
    "Tahap 1: Merancang Struktur Data Rapor — Latihan Kode",
    "Tahap 2: Rata-Rata & Nilai Huruf — Latihan Kode",
    "Tahap 3: Nilai Berbobot (Tugas, UTS, UAS) — Latihan Kode",
    "Tahap 4: Peringkat Kelas — Latihan Kode",
    "Tahap 5: Mencetak Rapor — Latihan Kode",
    "Tahap 6: Statistik Kelas & Program Lengkap — Latihan Kode",
  ],
  files: { "main.py": MAIN_START, "data.py": DATA_PY },
  steps: [
    // ---------------------------------------------------------------- Tahap 1
    {
      stage: TAHAP1,
      title: "Lihat nilai seorang siswa",
      points: 2,
      instruction: `Selamat datang di Proyek Akhir! Selama enam tahap kamu akan membangun **satu program utuh**: sebuah Sistem Rapor Sekolah. Kodenya terus berlanjut dari langkah ke langkah, jadi yang kamu tulis sekarang akan kamu pakai sampai akhir.

Datanya sudah ada di \`data.py\` — dictionary bersarang \`data_nilai\` (lihat pelajaran **Tahap 1**). Di \`main.py\`, program membaca **nama siswa** dengan \`input()\`, lalu:

- kalau namanya ada, cetak \`Nilai <nama>:\` lalu setiap mata pelajaran di baris sendiri, menjorok dua spasi: \`  Matematika: 88\`
- kalau tidak ada, cetak \`Siswa tidak ditemukan\`

> Tulis \`input()\` **tanpa teks di dalam kurungnya**. Teks seperti \`input("Nama: ")\` ikut tercetak dan membuat output-mu berbeda dari yang diharapkan.`,
      example: { input: "Dewi", expectedOutput: out`
Nilai Dewi:
  Matematika: 88
  IPA: 92
  Bahasa: 81
` },
      tests: [
        { input: "Andi", expectedOutput: out`
Nilai Andi:
  Matematika: 60
  IPA: 67
  Bahasa: 72
` },
        { input: "dewi", expectedOutput: "Siswa tidak ditemukan" },
        { input: "Joko", expectedOutput: "Siswa tidak ditemukan" },
      ],
      hint: "Periksa dulu dengan  if nama in data_nilai:  lalu telusuri data_nilai[nama].items() dengan for mapel, angka in ...",
      solution: { "main.py": MAIN_1 },
    },
    {
      stage: TAHAP1,
      title: "Ringkasan kelas",
      points: 2,
      instruction: `Sebelum membaca nama, program mencetak ringkasan kelas: jumlah siswa (pakai \`len()\`), daftar nama semua siswa dipisah koma, lalu satu baris kosong.

Kumpulkan namanya ke sebuah list dulu, lalu gabungkan dengan \`", ".join(...)\`. Jangan menulis nama-namanya satu per satu — ambil dari \`data_nilai\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(out`
Nilai Dewi:
  Matematika: 88
  IPA: 92
  Bahasa: 81
`) },
      tests: [
        { input: "Rina", expectedOutput: withSummary(out`
Nilai Rina:
  Matematika: 80
  IPA: 85
  Bahasa: 87
`) },
        { input: "Joko", expectedOutput: withSummary("Siswa tidak ditemukan") },
      ],
      hint: "print() tanpa isi mencetak baris kosong.",
      solution: { "main.py": MAIN_2 },
    },
    // ---------------------------------------------------------------- Tahap 2
    {
      stage: TAHAP2,
      title: "Rata-rata dan nilai huruf",
      points: 3,
      instruction: `Ada file baru, \`nilai.py\`. Lengkapi ketiga fungsinya sesuai pelajaran **Tahap 2** — semuanya memakai \`return\`, bukan \`print()\`:

| Fungsi | Mengembalikan |
|---|---|
| \`rata_rata(daftar)\` | rata-rata list angka (0 kalau kosong) |
| \`nilai_huruf(angka)\` | ≥ 90 A, ≥ 80 B, ≥ 70 C, selain itu D |
| \`predikat(huruf)\` | Sangat Baik / Baik / Cukup / Perlu Bimbingan |

Lalu di \`main.py\`, pakai dengan \`from nilai import rata_rata, nilai_huruf, predikat\`, dan setelah daftar mata pelajaran siswa cetak rata-ratanya — dibulatkan dengan \`round(..., 2)\` dan ditampilkan dengan 2 desimal: \`Rata-rata: 87.00 (B, Baik)\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(out`
Nilai Dewi:
  Matematika: 88
  IPA: 92
  Bahasa: 81
Rata-rata: 87.00 (B, Baik)
`) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(out`
Nilai Andi:
  Matematika: 60
  IPA: 67
  Bahasa: 72
Rata-rata: 66.33 (D, Perlu Bimbingan)
`) },
        { input: "Sari", expectedOutput: withSummary(out`
Nilai Sari:
  Matematika: 96
  IPA: 90
  Bahasa: 88
Rata-rata: 91.33 (A, Sangat Baik)
`) },
      ],
      hint: "list(data_nilai[nama].values()) memberi angkanya saja. Urutkan elif dari syarat paling ketat: >= 90 dulu.",
      addFiles: { "nilai.py": NILAI_STUB },
      solution: { "main.py": MAIN_3, "nilai.py": NILAI_TAHAP2 },
    },
    {
      stage: TAHAP2,
      title: "Tuntas atau remedial",
      points: 2,
      instruction: `KKM kita **75**, dan sudah ada di \`nilai.py\`. Tambahkan fungsi \`status(angka)\` di sana yang mengembalikan \`"Tuntas"\` kalau angkanya ≥ KKM dan \`"Remedial"\` kalau di bawahnya.

Lalu tampilkan statusnya di setiap baris mata pelajaran: \`  Matematika: 88 (Tuntas)\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(out`
Nilai Dewi:
  Matematika: 88 (Tuntas)
  IPA: 92 (Tuntas)
  Bahasa: 81 (Tuntas)
Rata-rata: 87.00 (B, Baik)
`) },
      tests: [
        { input: "Budi", expectedOutput: withSummary(out`
Nilai Budi:
  Matematika: 69 (Remedial)
  IPA: 71 (Remedial)
  Bahasa: 82 (Tuntas)
Rata-rata: 74.00 (C, Cukup)
`) },
        { input: "Rina", expectedOutput: withSummary(out`
Nilai Rina:
  Matematika: 80 (Tuntas)
  IPA: 85 (Tuntas)
  Bahasa: 87 (Tuntas)
Rata-rata: 84.00 (B, Baik)
`) },
      ],
      hint: "Nilai tepat 75 itu Tuntas — pakai >=, bukan >.",
      solution: { "main.py": MAIN_4, "nilai.py": NILAI_TUNTAS },
    },
    // ---------------------------------------------------------------- Tahap 3
    {
      stage: TAHAP3,
      title: "Nilai akhir berbobot",
      points: 3,
      instruction: `Sekolah sungguhan menghitung nilai dari tugas, UTS, dan UAS. Data lengkapnya ada di file baru \`data_lengkap.py\` — tingkatnya sekarang **tiga**: siswa → mapel → komponen (pelajaran **Tahap 3**).

Di \`nilai.py\`, tambahkan:

- \`nilai_akhir_mapel(komponen)\` → \`tugas × 0,3 + UTS × 0,3 + UAS × 0,4\`
- \`hitung_nilai_akhir(data)\` → dictionary **baru** \`{nama: {mapel: nilai akhir}}\`, tiap nilai dibulatkan \`round(..., 2)\`
- \`hitung_rata_siswa(nilai_akhir)\` → \`{nama: rata-rata}\`, dibulatkan 2 desimal

Lalu \`main.py\` pindah ke data lengkap (\`from data_lengkap import data_nilai\`), menghitung nilai akhir sekali di awal, dan menampilkan nilai akhir dengan 2 desimal: \`  Matematika: 87.70 (Tuntas)\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(out`
Nilai Dewi:
  Matematika: 87.70 (Tuntas)
  IPA: 92.30 (Tuntas)
  Bahasa: 81.40 (Tuntas)
Rata-rata: 87.13 (B, Baik)
`) },
      tests: [
        { input: "Budi", expectedOutput: withSummary(out`
Nilai Budi:
  Matematika: 69.30 (Remedial)
  IPA: 70.70 (Remedial)
  Bahasa: 82.30 (Tuntas)
Rata-rata: 74.10 (C, Cukup)
`) },
        { input: "Andi", expectedOutput: withSummary(out`
Nilai Andi:
  Matematika: 60.00 (Remedial)
  IPA: 66.80 (Remedial)
  Bahasa: 72.30 (Remedial)
Rata-rata: 66.37 (D, Perlu Bimbingan)
`) },
      ],
      hint: "Jangan lupa hasil[nama] = {} sebelum mengisi hasil[nama][mapel]. Bobot 30% ditulis 0.3, bukan 30.",
      addFiles: { "data_lengkap.py": DATA_LENGKAP_PY },
      solution: { "main.py": MAIN_5, "nilai.py": NILAI_BERBOBOT },
    },
    // ---------------------------------------------------------------- Tahap 4
    {
      stage: TAHAP4,
      title: "Peringkat seorang siswa",
      points: 3,
      instruction: `Siapa peringkat berapa? Lengkapi \`urutkan_peringkat(rata_siswa)\` di file baru \`peringkat.py\`: kembalikan list nama dari rata-rata **tertinggi ke terendah**.

Tulis sendiri algoritmanya seperti di pelajaran **Tahap 4** — cari yang tertinggi di antara yang tersisa, pindahkan ke hasil, ulangi. **Jangan pakai \`sorted()\` atau \`.sort()\`**; tutor akan membaca kodenya. Salin dictionary-nya dulu supaya data aslinya tidak ikut terhapus.

Di \`main.py\`, hitung peringkatnya sekali di awal, dan setelah baris rata-rata cetak \`Peringkat: 2 dari 5\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(out`
Nilai Dewi:
  Matematika: 87.70 (Tuntas)
  IPA: 92.30 (Tuntas)
  Bahasa: 81.40 (Tuntas)
Rata-rata: 87.13 (B, Baik)
Peringkat: 2 dari 5
`) },
      tests: [
        { input: "Sari", expectedOutput: withSummary(out`
Nilai Sari:
  Matematika: 96.30 (Tuntas)
  IPA: 90.00 (Tuntas)
  Bahasa: 87.90 (Tuntas)
Rata-rata: 91.40 (A, Sangat Baik)
Peringkat: 1 dari 5
`) },
        { input: "Andi", expectedOutput: withSummary(out`
Nilai Andi:
  Matematika: 60.00 (Remedial)
  IPA: 66.80 (Remedial)
  Bahasa: 72.30 (Remedial)
Rata-rata: 66.37 (D, Perlu Bimbingan)
Peringkat: 5 dari 5
`) },
      ],
      hint: "urutan.index(nama) + 1 memberi nomor peringkatnya. del sisa[nama] membuang satu siswa dari dictionary salinan.",
      addFiles: { "peringkat.py": PERINGKAT_STUB },
      solution: { "main.py": MAIN_6, "peringkat.py": PERINGKAT_URUT },
    },
    {
      stage: TAHAP4,
      title: "Tabel peringkat kelas",
      points: 2,
      instruction: `Sekarang input-nya bisa berupa **perintah**. Kalau yang diketik \`peringkat\`, program mencetak tabel peringkat seluruh kelas; kalau nama siswa, tetap seperti sebelumnya.

Tambahkan fungsi \`cetak_peringkat(peringkat, rata_siswa)\` di \`peringkat.py\`. Formatnya persis seperti contoh: garis \`=\` sepanjang 44, lalu satu baris per siswa — \`f"{i + 1}. {nama:<10}{rata:>6.2f}  {huruf}  {predikat(huruf)}"\`.`,
      example: { input: "peringkat", expectedOutput: withSummary(PERINGKAT_OUT) },
      tests: [
        { input: "Rina", expectedOutput: withSummary(out`
Nilai Rina:
  Matematika: 80.00 (Tuntas)
  IPA: 85.30 (Tuntas)
  Bahasa: 87.40 (Tuntas)
Rata-rata: 84.23 (B, Baik)
Peringkat: 3 dari 5
`) },
        { input: "Peringkat", expectedOutput: withSummary("Siswa tidak ditemukan") },
      ],
      hint: "Periksa perintah \"peringkat\" lebih dulu, baru periksa apakah itu nama siswa. print(\"=\" * 44) mencetak garisnya.",
      solution: { "main.py": MAIN_7, "peringkat.py": PERINGKAT_TABEL },
    },
    // ---------------------------------------------------------------- Tahap 5
    {
      stage: TAHAP5,
      title: "Cetak rapor siswa",
      points: 4,
      instruction: `Bagian yang dilihat orang tua: rapornya. Lengkapi \`cetak_rapor(nama, nilai_akhir, rata_siswa, peringkat)\` di file baru \`rapor.py\`, lalu kalau yang diketik nama siswa, \`main.py\` mencetak **rapornya** — menggantikan tampilan \`Nilai <nama>:\` yang lama.

Semua kolomnya harus lurus (pelajaran **Tahap 5**): teks rata kiri, angka rata kanan.

| Kolom | Format |
|---|---|
| Mata pelajaran | \`{mapel:<20}\` |
| Nilai | \`{n:>5.2f}\` lalu dua spasi |
| Huruf | \`{huruf:<7}\` |
| Keterangan | \`Tuntas\` / \`Remedial\` |

Baris peringkat: \`{'Peringkat':<20}{nomor:>5} dari {jumlah}\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(RAPOR_DEWI) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(RAPOR_ANDI) },
        { input: "Sari", expectedOutput: withSummary(RAPOR_SARI) },
        { input: "peringkat", expectedOutput: withSummary(PERINGKAT_OUT) },
      ],
      hint: "Hitung lebar garisnya: 20 + 5 + 2 + 7 + 10 = 44. f\"{'Rata-rata':<20}\" meratakan teks biasa juga.",
      addFiles: { "rapor.py": RAPOR_STUB },
      solution: { "main.py": MAIN_8, "rapor.py": RAPOR_PY },
    },
    // ---------------------------------------------------------------- Tahap 6
    {
      stage: TAHAP6,
      title: "Statistik per mata pelajaran",
      points: 3,
      instruction: `Balik sudut pandangnya: bukan per siswa, tapi per **mata pelajaran** (pelajaran **Tahap 6**). Kalau yang diketik \`statistik\`, cetak tabel statistik dari \`cetak_statistik(nilai_akhir)\` di file baru \`statistik.py\`.

Untuk tiap mata pelajaran: rata-rata kelas, nilai tertinggi, nilai terendah, dan berapa siswa yang tuntas beserta persentasenya. Di akhir, sebutkan mata pelajaran dengan rata-rata **terendah** — yang paling perlu perhatian guru.

Ambil daftar mata pelajarannya dari data, jangan ditulis manual. Formatnya persis seperti contoh (garis \`=\` sepanjang 54).`,
      example: { input: "statistik", expectedOutput: withSummary(STATISTIK_OUT) },
      tests: [
        { input: "Dewi", expectedOutput: withSummary(RAPOR_DEWI) },
        { input: "Joko", expectedOutput: withSummary("Siswa tidak ditemukan") },
      ],
      hint: "Kumpulkan dulu semua nilai satu mapel ke sebuah list, baru pakai max(), min(), dan rata_rata(). Persentase tanpa desimal: {persen:.0f}%",
      addFiles: { "statistik.py": STATISTIK_STUB },
      solution: { "main.py": MAIN_9, "statistik.py": STATISTIK_PY },
    },
    {
      stage: TAHAP6,
      title: "Program lengkap",
      points: 3,
      instruction: `Langkah terakhir: jadikan programnya bisa menerima **beberapa perintah** berturut-turut, satu per baris, sampai diketik \`selesai\`.

- Setelah ringkasan kelas, baca perintah dalam sebuah perulangan.
- \`peringkat\`, \`statistik\`, dan nama siswa bekerja seperti sebelumnya; nama yang tidak ada tetap \`Siswa tidak ditemukan\`.
- Setelah setiap perintah, cetak satu baris kosong.
- \`selesai\` mencetak \`Sampai jumpa!\` lalu menghentikan program.

Selamat — setelah ini, Sistem Rapor Sekolahmu lengkap! 🎉`,
      example: {
        input: "peringkat\nDewi\nselesai",
        expectedOutput: withSummary(`${PERINGKAT_OUT}\n\n${RAPOR_DEWI}\n\nSampai jumpa!`),
      },
      tests: [
        { input: "statistik\nselesai", expectedOutput: withSummary(`${STATISTIK_OUT}\n\nSampai jumpa!`) },
        { input: "Joko\nSari\nselesai", expectedOutput: withSummary(`Siswa tidak ditemukan\n\n${RAPOR_SARI}\n\nSampai jumpa!`) },
      ],
      hint: "while True: ... dengan break saat perintahnya \"selesai\".",
      solution: { "main.py": MAIN_10 },
    },
  ],
} satisfies ProjectDefinitionInput;

export default project;
