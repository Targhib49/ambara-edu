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

/** A function check: a script beside the student's files that prints what their code gives. */
const check = (label: string, script: string, expectedOutput: string) => ({ label, script, expectedOutput, input: "" });

// ------------------------------------------------------------------ nilai.py, as each step leaves it

const NILAI_HEAD = py`
# Fungsi-fungsi penilaian. main.py memakainya dengan, misalnya:
#     from nilai import rata_rata, nilai_huruf, predikat

KKM = 75
`;

const RATA_TODO = py`


def rata_rata(daftar):
    # TODO: kembalikan rata-rata sebuah list angka. Kembalikan 0 kalau listnya kosong.
    pass
`;
const RATA_DONE = py`


def rata_rata(daftar):
    if len(daftar) == 0:
        return 0
    return sum(daftar) / len(daftar)
`;
const HURUF_TODO = py`


def nilai_huruf(angka):
    # TODO: >= 90 -> "A", >= 80 -> "B", >= 70 -> "C", selain itu "D"
    pass


def predikat(huruf):
    # TODO: "A" -> "Sangat Baik", "B" -> "Baik", "C" -> "Cukup", "D" -> "Perlu Bimbingan"
    pass
`;
const HURUF_DONE = py`


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
const STATUS_DONE = py`


def status(angka):
    if angka >= KKM:
        return "Tuntas"
    return "Remedial"
`;
const BOBOT_DONE = py`


def nilai_akhir_mapel(komponen):
    return komponen["tugas"] * 0.3 + komponen["uts"] * 0.3 + komponen["uas"] * 0.4
`;
const OLAH_DONE = py`


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

const NILAI_STUB = NILAI_HEAD + RATA_TODO + HURUF_TODO;
const NILAI_S3 = NILAI_HEAD + RATA_DONE + HURUF_TODO;
const NILAI_S4 = NILAI_HEAD + RATA_DONE + HURUF_DONE;
const NILAI_S5 = NILAI_S4 + STATUS_DONE;
const NILAI_S6 = NILAI_S5 + BOBOT_DONE;
const NILAI_S7 = NILAI_S6 + OLAH_DONE;

// ------------------------------------------------------------------ peringkat.py, rapor.py, statistik.py

const PERINGKAT_STUB = py`
# Peringkat kelas. main.py memakainya dengan:
#     from peringkat import urutkan_peringkat


def urutkan_peringkat(rata_siswa):
    # TODO: kembalikan list nama siswa, dari rata-rata tertinggi ke terendah.
    # Tulis sendiri algoritmanya: ambil yang tertinggi, berulang kali
    # (selection sort, seperti di pelajaran Tahap 4) — tanpa sorted() atau .sort().
    pass
`;
const PERINGKAT_S8 = py`
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
const PERINGKAT_S9 = PERINGKAT_S8 + py`


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
    pass
`;
const RAPOR_HEAD_ROWS = py`
# Mencetak rapor. main.py memakainya dengan:
#     from rapor import cetak_rapor

from nilai import nilai_huruf, status


def cetak_rapor(nama, nilai_akhir, rata_siswa, peringkat):
    print("=" * 44)
    print(f"RAPOR SISWA : {nama}")
    print("=" * 44)
    print("Mata Pelajaran      Nilai  Huruf  Keterangan")
    print("-" * 44)
    for mapel, n in nilai_akhir[nama].items():
        print(f"{mapel:<20}{n:>5.2f}  {nilai_huruf(n):<7}{status(n)}")
`;
const RAPOR_S10 = RAPOR_HEAD_ROWS;
const RAPOR_S11 = RAPOR_HEAD_ROWS + py`
    rata = rata_siswa[nama]
    print("-" * 44)
    print(f"{'Rata-rata':<20}{rata:>5.2f}  {nilai_huruf(rata)}")
    print(f"{'Peringkat':<20}{peringkat.index(nama) + 1:>5} dari {len(peringkat)}")
    print("=" * 44)
`;

const STATISTIK_STUB = py`
# Statistik kelas. main.py memakainya dengan:
#     from statistik import cetak_statistik

from nilai import KKM, rata_rata


def ambil_daftar_mapel(nilai_akhir):
    # TODO: kembalikan list semua mata pelajaran yang ada di data, tanpa kembar
    pass


def nilai_satu_mapel(nilai_akhir, mapel):
    # TODO: kembalikan list nilai satu mata pelajaran dari SEMUA siswa
    pass


def cetak_statistik(nilai_akhir):
    # TODO: cetak tabel statistik per mata pelajaran, persis seperti contoh di panduan
    pass
`;
const STAT_HELPERS = py`
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
`;
const STATISTIK_S12 = STAT_HELPERS + py`


def cetak_statistik(nilai_akhir):
    print("=" * 54)
    print("STATISTIK PER MATA PELAJARAN")
    print("=" * 54)
    print("Mapel            Rata  Tertinggi  Terendah")
    print("-" * 54)
    for mapel in ambil_daftar_mapel(nilai_akhir):
        nilai = nilai_satu_mapel(nilai_akhir, mapel)
        print(f"{mapel:<14}{rata_rata(nilai):>7.2f}{max(nilai):>11.2f}{min(nilai):>10.2f}")
    print("=" * 54)
`;
const STATISTIK_S13 = STAT_HELPERS + py`


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

const HEADER = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH
`;
const RINGKASAN = py`

print("Jumlah siswa:", len(data_nilai))
daftar_nama = []
for nama in data_nilai:
    daftar_nama.append(nama)
print("Daftar siswa:", ", ".join(daftar_nama))
print()
`;

const MAIN_START = py`
# PROYEK AKHIR — SISTEM RAPOR SEKOLAH
# Program ini kamu bangun sedikit demi sedikit, selama enam tahap.
# Ikuti panduan di sebelah kanan.

from data import data_nilai
`;

const MAIN_1 = HEADER + py`
from data import data_nilai

nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka}")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_2 = HEADER + py`
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

const MAIN_3 = HEADER + py`
from data import data_nilai
from nilai import rata_rata
` + RINGKASAN + py`
nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    for mapel, angka in data_nilai[nama].items():
        print(f"  {mapel}: {angka}")
    rata = round(rata_rata(list(data_nilai[nama].values())), 2)
    print(f"Rata-rata: {rata:.2f}")
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_4 = HEADER + py`
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

const MAIN_5 = HEADER + py`
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

const MAIN_6 = HEADER + py`
from data_lengkap import data_nilai
from nilai import rata_rata, nilai_huruf, predikat, status, nilai_akhir_mapel
` + RINGKASAN + py`
nama = input()
if nama in data_nilai:
    print(f"Nilai {nama}:")
    nilai_siswa = []
    for mapel, komponen in data_nilai[nama].items():
        akhir = round(nilai_akhir_mapel(komponen), 2)
        nilai_siswa.append(akhir)
        print(f"  {mapel}: {akhir:.2f} ({status(akhir)})")
    rata = round(rata_rata(nilai_siswa), 2)
    huruf = nilai_huruf(rata)
    print(f"Rata-rata: {rata:.2f} ({huruf}, {predikat(huruf)})")
else:
    print("Siswa tidak ditemukan")
`;

const OLAH = py`

nilai_akhir = hitung_nilai_akhir(data_nilai)
rata_siswa = hitung_rata_siswa(nilai_akhir)
`;

const MAIN_7 = HEADER + py`
from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa
` + OLAH + RINGKASAN + py`
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

const MAIN_8 = HEADER + py`
from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat
` + OLAH + py`peringkat = urutkan_peringkat(rata_siswa)
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

const MAIN_9 = HEADER + py`
from data_lengkap import data_nilai
from nilai import nilai_huruf, predikat, status, hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
` + OLAH + py`peringkat = urutkan_peringkat(rata_siswa)
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

const MAIN_10 = HEADER + py`
from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor
` + OLAH + py`peringkat = urutkan_peringkat(rata_siswa)
` + RINGKASAN + py`
perintah = input()
if perintah == "peringkat":
    cetak_peringkat(peringkat, rata_siswa)
elif perintah in nilai_akhir:
    cetak_rapor(perintah, nilai_akhir, rata_siswa, peringkat)
else:
    print("Siswa tidak ditemukan")
`;

const MAIN_12 = HEADER + py`
from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor
from statistik import cetak_statistik
` + OLAH + py`peringkat = urutkan_peringkat(rata_siswa)
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

const MAIN_14 = HEADER + py`
from data_lengkap import data_nilai
from nilai import hitung_nilai_akhir, hitung_rata_siswa
from peringkat import urutkan_peringkat, cetak_peringkat
from rapor import cetak_rapor
from statistik import cetak_statistik
` + OLAH + py`peringkat = urutkan_peringkat(rata_siswa)
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
const lines = (...parts: string[]) => parts.join("\n");

/** "Nilai <nama>:" with one line per subject, as Tahap 1–4 print it. */
const nilaiBlock = (nama: string, rows: string[], ...after: string[]) => lines(`Nilai ${nama}:`, ...rows.map((r) => `  ${r}`), ...after);

const RAPOR_HEAD = (nama: string) => lines(
  "============================================",
  `RAPOR SISWA : ${nama}`,
  "============================================",
  "Mata Pelajaran      Nilai  Huruf  Keterangan",
  "--------------------------------------------",
);
const raporRows = (rows: [string, string, string, string][]) =>
  rows.map(([mapel, n, huruf, ket]) => `${mapel.padEnd(20)}${n.padStart(5)}  ${huruf.padEnd(7)}${ket}`);
const raporFoot = (rata: string, huruf: string, rank: number) => lines(
  "--------------------------------------------",
  `${"Rata-rata".padEnd(20)}${rata.padStart(5)}  ${huruf}`,
  `${"Peringkat".padEnd(20)}${String(rank).padStart(5)} dari 5`,
  "============================================",
);

const DEWI_ROWS = raporRows([["Matematika", "87.70", "B", "Tuntas"], ["IPA", "92.30", "A", "Tuntas"], ["Bahasa", "81.40", "B", "Tuntas"]]);
const ANDI_ROWS = raporRows([["Matematika", "60.00", "D", "Remedial"], ["IPA", "66.80", "D", "Remedial"], ["Bahasa", "72.30", "C", "Remedial"]]);
const SARI_ROWS = raporRows([["Matematika", "96.30", "A", "Tuntas"], ["IPA", "90.00", "A", "Tuntas"], ["Bahasa", "87.90", "B", "Tuntas"]]);

const RAPOR_DEWI = lines(RAPOR_HEAD("Dewi"), ...DEWI_ROWS, raporFoot("87.13", "B", 2));
const RAPOR_ANDI = lines(RAPOR_HEAD("Andi"), ...ANDI_ROWS, raporFoot("66.37", "D", 5));
const RAPOR_SARI = lines(RAPOR_HEAD("Sari"), ...SARI_ROWS, raporFoot("91.40", "A", 1));

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
const STATISTIK_DASAR_OUT = out`
======================================================
STATISTIK PER MATA PELAJARAN
======================================================
Mapel            Rata  Tertinggi  Terendah
------------------------------------------------------
Matematika      78.66      96.30     60.00
IPA             81.02      92.30     66.80
Bahasa          82.26      87.90     72.30
======================================================
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

// Tahap 3+ per-student blocks, with weighted marks.
const DEWI_AKHIR = ["Matematika: 87.70 (Tuntas)", "IPA: 92.30 (Tuntas)", "Bahasa: 81.40 (Tuntas)"];
const BUDI_AKHIR = ["Matematika: 69.30 (Remedial)", "IPA: 70.70 (Remedial)", "Bahasa: 82.30 (Tuntas)"];
const ANDI_AKHIR = ["Matematika: 60.00 (Remedial)", "IPA: 66.80 (Remedial)", "Bahasa: 72.30 (Remedial)"];
const SARI_AKHIR = ["Matematika: 96.30 (Tuntas)", "IPA: 90.00 (Tuntas)", "Bahasa: 87.90 (Tuntas)"];
const RINA_AKHIR = ["Matematika: 80.00 (Tuntas)", "IPA: 85.30 (Tuntas)", "Bahasa: 87.40 (Tuntas)"];

// ------------------------------------------------------------------ the project

const TAHAP1 = "Tahap 1: Struktur Data Rapor";
const TAHAP2 = "Tahap 2: Rata-Rata & Nilai Huruf";
const TAHAP3 = "Tahap 3: Nilai Berbobot";
const TAHAP4 = "Tahap 4: Peringkat Kelas";
const TAHAP5 = "Tahap 5: Mencetak Rapor";
const TAHAP6 = "Tahap 6: Statistik & Program Lengkap";

const LESSON1 = "Tahap 1: Merancang Struktur Data Rapor";
const LESSON2 = "Tahap 2: Rata-Rata & Nilai Huruf";
const LESSON3 = "Tahap 3: Nilai Berbobot (Tugas, UTS, UAS)";
const LESSON4 = "Tahap 4: Peringkat Kelas";
const LESSON5 = "Tahap 5: Mencetak Rapor";
const LESSON6 = "Tahap 6: Statistik Kelas & Program Lengkap";

/** A function check on nilai_huruf, like the old lesson's boundary checks. */
const huruf = (angka: string, expected: string) =>
  check(`nilai_huruf(${angka})`, py`
from nilai import nilai_huruf
print(nilai_huruf(${angka}))
`, expected);

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
    // ================================================================ Tahap 1
    {
      stage: TAHAP1,
      lesson: LESSON1,
      title: "Lihat nilai seorang siswa",
      points: 2,
      instruction: `Selamat datang di Proyek Akhir! Selama enam tahap kamu akan membangun **satu program utuh**: sebuah Sistem Rapor Sekolah. Kodenya terus berlanjut dari langkah ke langkah, jadi yang kamu tulis sekarang akan kamu pakai sampai akhir.

Datanya sudah ada di \`data.py\` — dictionary bersarang \`data_nilai\`. Di \`main.py\`, program membaca **nama siswa** dengan \`input()\`, lalu:

- kalau namanya ada, cetak \`Nilai <nama>:\` lalu setiap mata pelajaran di baris sendiri, menjorok dua spasi: \`  Matematika: 88\`
- kalau tidak ada, cetak \`Siswa tidak ditemukan\`

> Tulis \`input()\` **tanpa teks di dalam kurungnya**. Teks seperti \`input("Nama: ")\` ikut tercetak dan membuat output-mu berbeda dari yang diharapkan.`,
      example: { input: "Dewi", expectedOutput: nilaiBlock("Dewi", ["Matematika: 88", "IPA: 92", "Bahasa: 81"]) },
      tests: [
        { input: "Andi", expectedOutput: nilaiBlock("Andi", ["Matematika: 60", "IPA: 67", "Bahasa: 72"]) },
        { input: "dewi", expectedOutput: "Siswa tidak ditemukan" },
        { input: "Joko", expectedOutput: "Siswa tidak ditemukan" },
      ],
      hints: [
        "Periksa dulu apakah namanya ada: if nama in data_nilai:",
        "data_nilai[nama] adalah dictionary mapel siswa itu. Telusuri dengan for mapel, angka in data_nilai[nama].items():",
      ],
      solution: { "main.py": MAIN_1 },
    },
    {
      stage: TAHAP1,
      lesson: LESSON1,
      title: "Ringkasan kelas",
      points: 2,
      instruction: `Sebelum membaca nama, program mencetak ringkasan kelas: jumlah siswa (pakai \`len()\`), daftar nama semua siswa dipisah koma, lalu satu baris kosong.

Kumpulkan namanya ke sebuah list dulu, lalu gabungkan dengan \`", ".join(...)\`. Jangan menulis nama-namanya satu per satu — ambil dari \`data_nilai\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", ["Matematika: 88", "IPA: 92", "Bahasa: 81"])) },
      tests: [
        { input: "Rina", expectedOutput: withSummary(nilaiBlock("Rina", ["Matematika: 80", "IPA: 85", "Bahasa: 87"])) },
        { input: "Joko", expectedOutput: withSummary("Siswa tidak ditemukan") },
      ],
      hints: [
        "for nama in data_nilai: menelusuri key-nya — nama-nama siswa.",
        "print() tanpa isi mencetak baris kosong.",
      ],
      solution: { "main.py": MAIN_2 },
    },
    // ================================================================ Tahap 2
    {
      stage: TAHAP2,
      lesson: LESSON2,
      title: "Rata-rata",
      points: 2,
      instruction: `Ada file baru, \`nilai.py\`, berisi fungsi-fungsi yang masih kosong. Mulai dari \`rata_rata(daftar)\`: kembalikan rata-rata sebuah list angka, dan **0 kalau listnya kosong** — supaya tidak \`ZeroDivisionError\`.

Pakai \`return\`, bukan \`print()\`. Lalu di \`main.py\`, \`from nilai import rata_rata\`, dan setelah daftar mata pelajaran cetak \`Rata-rata: 87.00\` — dibulatkan dengan \`round(..., 2)\`, ditampilkan dengan 2 desimal.

Fungsimu juga dicek langsung, termasuk dengan list kosong.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", ["Matematika: 88", "IPA: 92", "Bahasa: 81"], "Rata-rata: 87.00")) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(nilaiBlock("Andi", ["Matematika: 60", "IPA: 67", "Bahasa: 72"], "Rata-rata: 66.33")) },
        check("rata_rata([88, 92, 81])", py`
from nilai import rata_rata
print(f"{rata_rata([88, 92, 81]):.2f}")
`, "87.00"),
        check("rata_rata([]) — list kosong", py`
from nilai import rata_rata
print(f"{rata_rata([]):.2f}")
`, "0.00"),
        check("rata_rata([70])", py`
from nilai import rata_rata
print(f"{rata_rata([70]):.2f}")
`, "70.00"),
      ],
      hints: [
        "list(data_nilai[nama].values()) memberi angka-angkanya saja.",
        "sum(daftar) / len(daftar) — tapi periksa dulu if len(daftar) == 0: return 0",
      ],
      addFiles: { "nilai.py": NILAI_STUB },
      solution: { "main.py": MAIN_3, "nilai.py": NILAI_S3 },
    },
    {
      stage: TAHAP2,
      lesson: LESSON2,
      title: "Nilai huruf dan predikat",
      points: 3,
      instruction: `Lengkapi dua fungsi berikutnya di \`nilai.py\`:

| Fungsi | Mengembalikan |
|---|---|
| \`nilai_huruf(angka)\` | ≥ 90 A, ≥ 80 B, ≥ 70 C, selain itu D |
| \`predikat(huruf)\` | Sangat Baik / Baik / Cukup / Perlu Bimbingan |

Lalu baris rata-rata jadi \`Rata-rata: 87.00 (B, Baik)\`.

Fungsinya dicek tepat di **batas-batasnya** — 90, 89.9, 80, 70, 69.9 — seperti di pelajaran. Urutan \`elif\` yang terbalik akan ketahuan.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", ["Matematika: 88", "IPA: 92", "Bahasa: 81"], "Rata-rata: 87.00 (B, Baik)")) },
      tests: [
        { input: "Sari", expectedOutput: withSummary(nilaiBlock("Sari", ["Matematika: 96", "IPA: 90", "Bahasa: 88"], "Rata-rata: 91.33 (A, Sangat Baik)")) },
        huruf("95", "A"),
        huruf("90", "A"),
        huruf("89.9", "B"),
        huruf("80", "B"),
        huruf("79.99", "C"),
        huruf("70", "C"),
        huruf("69.9", "D"),
        check('predikat("A")', py`
from nilai import predikat
print(predikat("A"))
`, "Sangat Baik"),
        check('predikat("D")', py`
from nilai import predikat
print(predikat("D"))
`, "Perlu Bimbingan"),
      ],
      hints: [
        "Python berhenti di kondisi pertama yang benar — mulai dari syarat paling ketat: if angka >= 90",
        "Nilai tepat 90 itu A, jadi pakai >=, bukan >.",
      ],
      solution: { "main.py": MAIN_4, "nilai.py": NILAI_S4 },
    },
    {
      stage: TAHAP2,
      lesson: LESSON2,
      title: "Tuntas atau remedial",
      points: 2,
      instruction: `KKM kita **75**, dan sudah ada di \`nilai.py\`. Tambahkan fungsi \`status(angka)\` di sana: \`"Tuntas"\` kalau angkanya ≥ KKM, \`"Remedial"\` kalau di bawahnya.

Lalu tampilkan statusnya di setiap baris mata pelajaran: \`  Matematika: 88 (Tuntas)\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", ["Matematika: 88 (Tuntas)", "IPA: 92 (Tuntas)", "Bahasa: 81 (Tuntas)"], "Rata-rata: 87.00 (B, Baik)")) },
      tests: [
        { input: "Budi", expectedOutput: withSummary(nilaiBlock("Budi", ["Matematika: 69 (Remedial)", "IPA: 71 (Remedial)", "Bahasa: 82 (Tuntas)"], "Rata-rata: 74.00 (C, Cukup)")) },
        check("status(75) — tepat di KKM", py`
from nilai import status
print(status(75))
`, "Tuntas"),
        check("status(74.9)", py`
from nilai import status
print(status(74.9))
`, "Remedial"),
      ],
      hints: [
        "Bandingkan dengan KKM, bukan dengan angka 75 langsung — kalau KKM berubah, fungsimu ikut benar.",
        "if angka >= KKM: return \"Tuntas\"",
      ],
      solution: { "main.py": MAIN_5, "nilai.py": NILAI_S5 },
    },
    // ================================================================ Tahap 3
    {
      stage: TAHAP3,
      lesson: LESSON3,
      title: "Nilai akhir satu mapel",
      points: 3,
      instruction: `Sekolah sungguhan menghitung nilai dari tugas, UTS, dan UAS. Data lengkapnya ada di file baru \`data_lengkap.py\` — tingkatnya sekarang **tiga**: siswa → mapel → komponen.

Di \`nilai.py\`, tambahkan \`nilai_akhir_mapel(komponen)\` yang menerima satu dictionary \`{"tugas": …, "uts": …, "uas": …}\` dan mengembalikan \`tugas × 0,3 + UTS × 0,3 + UAS × 0,4\`.

Lalu \`main.py\` pindah ke data lengkap (\`from data_lengkap import data_nilai\`): tiap baris mapel menampilkan **nilai akhirnya** dengan 2 desimal, dan rata-ratanya dihitung dari nilai-nilai akhir itu.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", DEWI_AKHIR, "Rata-rata: 87.13 (B, Baik)")) },
      tests: [
        { input: "Budi", expectedOutput: withSummary(nilaiBlock("Budi", BUDI_AKHIR, "Rata-rata: 74.10 (C, Cukup)")) },
        check('nilai_akhir_mapel({"tugas": 90, "uts": 85, "uas": 88})', py`
from nilai import nilai_akhir_mapel
print(f"{nilai_akhir_mapel({'tugas': 90, 'uts': 85, 'uas': 88}):.2f}")
`, "87.70"),
        check("UAS berbobot 40%", py`
from nilai import nilai_akhir_mapel
print(f"{nilai_akhir_mapel({'tugas': 0, 'uts': 0, 'uas': 100}):.2f}")
`, "40.00"),
        check("tugas berbobot 30%", py`
from nilai import nilai_akhir_mapel
print(f"{nilai_akhir_mapel({'tugas': 100, 'uts': 0, 'uas': 0}):.2f}")
`, "30.00"),
      ],
      hints: [
        "Bobot 30% ditulis 0.3, bukan 30. Ketiga bobotnya harus berjumlah 1.",
        "Aksesnya: komponen[\"tugas\"] * 0.3 + komponen[\"uts\"] * 0.3 + komponen[\"uas\"] * 0.4",
      ],
      addFiles: { "data_lengkap.py": DATA_LENGKAP_PY },
      solution: { "main.py": MAIN_6, "nilai.py": NILAI_S6 },
    },
    {
      stage: TAHAP3,
      lesson: LESSON3,
      title: "Olah semua data sekaligus",
      points: 3,
      instruction: `Olah sekali, pakai berkali-kali. Tambahkan dua fungsi di \`nilai.py\`:

- \`hitung_nilai_akhir(data)\` → dictionary **baru** \`{nama: {mapel: nilai akhir}}\`, tiap nilai dibulatkan \`round(..., 2)\`
- \`hitung_rata_siswa(nilai_akhir)\` → \`{nama: rata-rata}\`, dibulatkan 2 desimal

Di \`main.py\`, hitung keduanya **sekali** di awal program, lalu pakai hasilnya. Output-nya tetap sama seperti langkah sebelumnya — yang berubah bentuk kodenya, dan fungsinya dicek langsung dengan data lain.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", DEWI_AKHIR, "Rata-rata: 87.13 (B, Baik)")) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(nilaiBlock("Andi", ANDI_AKHIR, "Rata-rata: 66.37 (D, Perlu Bimbingan)")) },
        check("hitung_nilai_akhir pada data lain (uji pembulatan)", py`
from nilai import hitung_nilai_akhir
print(hitung_nilai_akhir({"Budi": {"Matematika": {"tugas": 70, "uts": 65, "uas": 72}}}))
`, "{'Budi': {'Matematika': 69.3}}"),
        check("hitung_nilai_akhir({}) — data kosong", py`
from nilai import hitung_nilai_akhir
print(hitung_nilai_akhir({}))
`, "{}"),
        check("hitung_rata_siswa", py`
from nilai import hitung_rata_siswa
print(hitung_rata_siswa({"Tono": {"IPA": 80, "Bahasa": 91}}))
`, "{'Tono': 85.5}"),
      ],
      hints: [
        "Jangan lupa hasil[nama] = {} di dalam loop luar, sebelum mengisi hasil[nama][mapel].",
        "Tanpa round(..., 2), 69.3 bisa jadi 69.30000000000001 — itu perilaku desimal biner, bukan salahmu.",
      ],
      solution: { "main.py": MAIN_7, "nilai.py": NILAI_S7 },
    },
    // ================================================================ Tahap 4
    {
      stage: TAHAP4,
      lesson: LESSON4,
      title: "Urutkan peringkat",
      points: 3,
      instruction: `Siapa peringkat berapa? Lengkapi \`urutkan_peringkat(rata_siswa)\` di file baru \`peringkat.py\`: kembalikan list nama dari rata-rata **tertinggi ke terendah**.

Tulis sendiri algoritmanya — cari yang tertinggi di antara yang tersisa, pindahkan ke hasil, ulangi. **Tanpa \`sorted()\` atau \`.sort()\`** — ini juga dicek. Salin dictionary-nya dulu supaya data aslinya tidak ikut terhapus; itu pun dicek.

Di \`main.py\`, hitung peringkatnya sekali di awal, dan setelah baris rata-rata cetak \`Peringkat: 2 dari 5\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(nilaiBlock("Dewi", DEWI_AKHIR, "Rata-rata: 87.13 (B, Baik)", "Peringkat: 2 dari 5")) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(nilaiBlock("Andi", ANDI_AKHIR, "Rata-rata: 66.37 (D, Perlu Bimbingan)", "Peringkat: 5 dari 5")) },
        check("urutkan_peringkat pada data lain", py`
from peringkat import urutkan_peringkat
print(urutkan_peringkat({"A": 70, "B": 90, "C": 80, "D": 60}))
`, "['B', 'C', 'A', 'D']"),
        check("data aslinya tidak ikut berubah", py`
from peringkat import urutkan_peringkat
data = {"A": 70, "B": 90}
urutkan_peringkat(data)
print(data)
`, "{'A': 70, 'B': 90}"),
        check("tanpa sorted() atau .sort()", py`
import io, tokenize
with open("peringkat.py") as f:
    kata = [t.string for t in tokenize.generate_tokens(io.StringIO(f.read()).readline) if t.type == tokenize.NAME]
print("sorted" not in kata and "sort" not in kata)
`, "True"),
      ],
      hints: [
        "Langkah dalam loop: cari nama dengan nilai terbesar di sisa, urutan.append(nama itu), lalu del sisa[nama itu].",
        "Salin dulu: sisa = {} lalu for nama, nilai in rata_siswa.items(): sisa[nama] = nilai. Ulangi selama len(sisa) > 0.",
      ],
      addFiles: { "peringkat.py": PERINGKAT_STUB },
      solution: { "main.py": MAIN_8, "peringkat.py": PERINGKAT_S8 },
    },
    {
      stage: TAHAP4,
      lesson: LESSON4,
      title: "Tabel peringkat kelas",
      points: 2,
      instruction: `Sekarang input-nya bisa berupa **perintah**. Kalau yang diketik \`peringkat\`, program mencetak tabel peringkat seluruh kelas; kalau nama siswa, tetap seperti sebelumnya.

Tambahkan \`cetak_peringkat(peringkat, rata_siswa)\` di \`peringkat.py\`. Formatnya persis seperti contoh: garis \`=\` sepanjang 44, lalu satu baris per siswa — \`f"{i + 1}. {nama:<10}{rata:>6.2f}  {huruf}  {predikat(huruf)}"\`.`,
      example: { input: "peringkat", expectedOutput: withSummary(PERINGKAT_OUT) },
      tests: [
        { input: "Rina", expectedOutput: withSummary(nilaiBlock("Rina", RINA_AKHIR, "Rata-rata: 84.23 (B, Baik)", "Peringkat: 3 dari 5")) },
        { input: "Peringkat", expectedOutput: withSummary("Siswa tidak ditemukan") },
      ],
      hints: [
        "Periksa perintah \"peringkat\" lebih dulu, baru periksa apakah itu nama siswa.",
        "print(\"=\" * 44) mencetak garisnya; for i in range(len(peringkat)) memberi nomor urutnya.",
      ],
      solution: { "main.py": MAIN_9, "peringkat.py": PERINGKAT_S9 },
    },
    // ================================================================ Tahap 5
    {
      stage: TAHAP5,
      lesson: LESSON5,
      title: "Kepala rapor dan daftar nilai",
      points: 3,
      instruction: `Bagian yang dilihat orang tua: rapornya. Mulai \`cetak_rapor(nama, nilai_akhir, rata_siswa, peringkat)\` di file baru \`rapor.py\`, lalu kalau yang diketik nama siswa, \`main.py\` memanggilnya — menggantikan tampilan \`Nilai <nama>:\` yang lama.

Untuk langkah ini, cetak **kepalanya dan daftar nilainya** dulu. Semua kolomnya harus lurus: teks rata kiri, angka rata kanan.

| Kolom | Format |
|---|---|
| Mata pelajaran | \`{mapel:<20}\` |
| Nilai | \`{n:>5.2f}\` lalu dua spasi |
| Huruf | \`{huruf:<7}\` |
| Keterangan | \`Tuntas\` / \`Remedial\` |`,
      example: { input: "Dewi", expectedOutput: withSummary(lines(RAPOR_HEAD("Dewi"), ...DEWI_ROWS)) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(lines(RAPOR_HEAD("Andi"), ...ANDI_ROWS)) },
        { input: "peringkat", expectedOutput: withSummary(PERINGKAT_OUT) },
      ],
      hints: [
        "Lebar garisnya 44: 20 + 5 + 2 + 7 + 10.",
        "f\"{mapel:<20}{n:>5.2f}  {nilai_huruf(n):<7}{status(n)}\"",
      ],
      addFiles: { "rapor.py": RAPOR_STUB },
      solution: { "main.py": MAIN_10, "rapor.py": RAPOR_S10 },
    },
    {
      stage: TAHAP5,
      lesson: LESSON5,
      title: "Rata-rata dan peringkat di rapor",
      points: 2,
      instruction: `Lengkapi bagian bawah rapornya: garis tipis, baris rata-rata beserta nilai hurufnya, baris peringkat, lalu garis penutup.

Kolomnya tetap lurus dengan baris di atasnya — \`f"{'Rata-rata':<20}"\` meratakan teks biasa juga, dan baris peringkat: \`{'Peringkat':<20}{nomor:>5} dari {jumlah}\`.`,
      example: { input: "Dewi", expectedOutput: withSummary(RAPOR_DEWI) },
      tests: [
        { input: "Andi", expectedOutput: withSummary(RAPOR_ANDI) },
        { input: "Sari", expectedOutput: withSummary(RAPOR_SARI) },
      ],
      hints: [
        "rata = rata_siswa[nama]; nomor peringkatnya peringkat.index(nama) + 1.",
        "Urutannya: print(\"-\" * 44), baris rata-rata, baris peringkat, print(\"=\" * 44).",
      ],
      solution: { "rapor.py": RAPOR_S11 },
    },
    // ================================================================ Tahap 6
    {
      stage: TAHAP6,
      lesson: LESSON6,
      title: "Statistik per mata pelajaran",
      points: 3,
      instruction: `Balik sudut pandangnya: bukan per siswa, tapi per **mata pelajaran**. File baru \`statistik.py\` punya tiga fungsi kosong:

- \`ambil_daftar_mapel(nilai_akhir)\` → list semua mapel di data, tanpa kembar — jangan ditulis manual
- \`nilai_satu_mapel(nilai_akhir, mapel)\` → list nilai satu mapel dari **semua** siswa
- \`cetak_statistik(nilai_akhir)\` → tabelnya

Kalau yang diketik \`statistik\`, cetak tabel berisi rata-rata kelas, nilai tertinggi, dan nilai terendah tiap mapel, persis seperti contoh (garis \`=\` sepanjang 54). Kedua fungsi pembantunya juga dicek dengan data lain.`,
      example: { input: "statistik", expectedOutput: withSummary(STATISTIK_DASAR_OUT) },
      tests: [
        { input: "Dewi", expectedOutput: withSummary(RAPOR_DEWI) },
        check("ambil_daftar_mapel pada data lain", py`
from statistik import ambil_daftar_mapel
print(ambil_daftar_mapel({"A": {"Seni": 80, "Musik": 70}, "B": {"Seni": 90, "Musik": 60}}))
`, "['Seni', 'Musik']"),
        check("nilai_satu_mapel pada data lain", py`
from statistik import nilai_satu_mapel
print(nilai_satu_mapel({"A": {"Seni": 80}, "B": {"Seni": 90}, "C": {"Seni": 75}}, "Seni"))
`, "[80, 90, 75]"),
      ],
      hints: [
        "Setelah nilai satu mapel terkumpul jadi list, max(), min(), dan rata_rata() langsung bisa dipakai.",
        "f\"{mapel:<14}{rata:>7.2f}{max(nilai):>11.2f}{min(nilai):>10.2f}\"",
      ],
      addFiles: { "statistik.py": STATISTIK_STUB },
      solution: { "main.py": MAIN_12, "statistik.py": STATISTIK_S12 },
    },
    {
      stage: TAHAP6,
      lesson: LESSON6,
      title: "Ketuntasan dan mapel tersulit",
      points: 3,
      instruction: `Tambahkan kolom **Tuntas** ke tabelnya: berapa siswa yang mencapai KKM dan persentasenya, misalnya \`3/5 (60%)\`. Buat fungsi \`hitung_tuntas(daftar)\` untuk menghitungnya.

Di bawah tabel, sebutkan mata pelajaran dengan rata-rata **terendah** — yang paling perlu perhatian guru — persis seperti contoh.`,
      example: { input: "statistik", expectedOutput: withSummary(STATISTIK_OUT) },
      tests: [
        { input: "Joko", expectedOutput: withSummary("Siswa tidak ditemukan") },
        check("hitung_tuntas([75, 74.9, 90])", py`
from statistik import hitung_tuntas
print(hitung_tuntas([75, 74.9, 90]))
`, "2"),
        check("hitung_tuntas([]) — list kosong", py`
from statistik import hitung_tuntas
print(hitung_tuntas([]))
`, "0"),
      ],
      hints: [
        "Persentase tanpa desimal: {persen:.0f}% — bagi dulu, baru kali 100.",
        "Cari rata-rata terendah seperti mencari yang tertinggi: mulai dari rata_terendah = 101, lalu perbarui kalau ketemu yang lebih kecil.",
      ],
      solution: { "statistik.py": STATISTIK_S13 },
    },
    {
      stage: TAHAP6,
      lesson: LESSON6,
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
      hints: [
        "while True: dengan break saat perintahnya \"selesai\".",
        "Baca perintahnya di dalam loop: perintah = input() — satu baris setiap putaran.",
      ],
      solution: { "main.py": MAIN_14 },
    },
  ],
} satisfies ProjectDefinitionInput;

export default project;
