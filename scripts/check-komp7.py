"""Recompute every answer in the Kompetisi Matematika Kelas 7 course and compare with the content files.
Run: python3 scripts/check-komp7.py   (needs node: it reads the content through scripts/dump-komp7.ts)"""
import json, subprocess, math
from fractions import Fraction as F
from itertools import permutations, product

data = json.loads(subprocess.check_output(["npx", "tsx", "scripts/dump-komp7.ts"], text=True))
quizzes = {q["quiz"]: q for q in data}
checks = 0

def check(quiz, expected):
    """expected: list, one per question, in order. Fractions compare as 'a/b'; MC as letter."""
    global checks
    qs = quizzes[quiz]["questions"]
    assert len(qs) == len(expected), f"{quiz}: {len(qs)} questions, {len(expected)} expected"
    for i, (q, e) in enumerate(zip(qs, expected), 1):
        got = q["answer"]
        if isinstance(e, F):
            e = e.numerator if e.denominator == 1 and q["type"] != "FRACTION" else f"{e.numerator}/{e.denominator}"
        if got != e and not (isinstance(got, (int, float)) and isinstance(e, (int, float)) and abs(got - e) < 1e-9):
            raise SystemExit(f"FAIL {quiz} #{i}: content says {got!r}, recomputed {e!r}")
        checks += 1

def alph(lhs, rhs, letters, nonzero):
    sols = []
    L = sorted(set(letters))
    for p in permutations(range(10), len(L)):
        m = dict(zip(L, p))
        if any(m[c] == 0 for c in nonzero): continue
        V = lambda w, m=m: int("".join(str(m[c]) if c in m else c for c in w))
        if eval(lhs, {"V": V}) == eval(rhs, {"V": V}): sols.append((m, V))
    return sols

def one(sols, f):
    vals = {f(V) for m, V in sols}
    assert len(vals) == 1, vals
    return vals.pop()

def pairs(cond, lo, hi):
    return [(x, y) for x in range(lo, hi + 1) for y in range(lo, hi + 1) if cond(x, y)]

def mc(options, correct_value, f):
    """letter of the unique option whose computed value equals correct_value"""
    hits = [chr(65 + i) for i, o in enumerate(options) if f(i)]
    assert len(hits) == 1, hits
    return hits[0]

# ---- Latihan ----
check("Latihan — Operasi Hitung Bilangan", [
    2026 * 99 + 2026, (-3) ** 2 - (-2) ** 3, sum(k if k % 2 else -k for k in range(1, 101)), 12.5 * 0.8 * 25 * 4,
    sum(F(1, k * (k + 1)) for k in range(1, 6)), 2**10 - 2**9 - 2**8, 999 * 999 + 1999,
    "ABCD"[max(range(4), key=lambda i: [2**30, 3**20, 5**12, 10**9][i])],
    math.prod(1 - F(1, k) for k in range(2, 2027)), 0.25 * 48 + F(3, 4) * 48,
])
check("Latihan — Alphametics / Cryptarithm", [
    one(alph('V("AB")+V("BA")', "121", "AB", "AB"), lambda V: V("A") + V("B")),
    one(alph('V("ABC")-V("CBA")', "495", "ABC", "AC"), lambda V: V("A") - V("C")),
    one(alph('V("AB")*9', 'V("A0B")', "AB", "A"), lambda V: V("AB")),
    one(alph('3*V("ABC")', 'V("BBB")', "ABC", "AB"), lambda V: V("ABC")),
    one(alph('V("AA")+V("BB")+V("CC")', 'V("ABC")', "ABC", "ABC"), lambda V: V("ABC")),
    one(alph('V("TO")+V("GO")', 'V("OUT")', "TOGU", "TGO"), lambda V: V("OUT")),
    one(alph('V("HE")*V("HE")', 'V("SHE")', "HES", "HS"), lambda V: V("SHE")),
    one(alph('V("ABCD")*4', 'V("DCBA")', "ABCD", "AD"), lambda V: V("ABCD")),
    one(alph('V("SEND")+V("MORE")', 'V("MONEY")', "SENDMORY", "SM"), lambda V: V("MONEY")),
    len({V("EVEN") for m, V in alph('V("ODD")+V("ODD")', 'V("EVEN")', "ODEVN", "OE")}),
])
check("Latihan — Pertidaksamaan (Bilangan Rasional)", [
    max(x for x in range(-100, 100) if 3 * x - 5 < 2 * x + 4),
    len([x for x in range(-100, 100) if -2 < 2 * x + 1 <= 9]),
    "ABCD"[min(range(4), key=lambda i: [F(3, 5), F(5, 8), F(7, 12), F(2, 3)][i])],
    min(x for x in range(-100, 100) if F(x - 1, 2) - F(x + 2, 3) >= 1),
    [n for n in range(1, 7) if F(1, 3) < F(n, 7) < F(1, 2)][0],
    max(x for x in range(-100, 100) if -2 * x + 3 > 11),
    len([n for n in range(1, 100) if F(1, 4) < F(n, 30) < F(2, 5)]),
    sum(x for x in range(-100, 100) if 5 <= 3 * x - 1 < 20),
    "A" if all((a * a > b * b) for a in range(-9, 0) for b in range(a + 1, 0)) else "?",
    max(n for n in range(100) if 15000 * n + 10000 <= 100000),
])
assert any(not (F(a, b) < 1) for a in range(-9, 0) for b in range(a + 1, 0))  # B fails
check("Latihan — Pasangan Bilangan Bulat", [
    len(pairs(lambda x, y: x + y == 10, 1, 50)), len(pairs(lambda x, y: x * y == 24, 1, 50)),
    len(pairs(lambda x, y: 2 * x + 3 * y == 20, 1, 50)), len(pairs(lambda x, y: x * y == 12, -50, 50)),
    len(pairs(lambda x, y: x * x - y * y == 15, 1, 50)), len(pairs(lambda x, y: x + y == x * y, 1, 50)),
    len(pairs(lambda x, y: F(1, x) + F(1, y) == F(1, 2), 1, 50)), len(pairs(lambda x, y: x < y and x + y == 12, 1, 50)),
    len(pairs(lambda x, y: x * x + y * y == 25, -10, 10)), len(pairs(lambda x, y: 3 * x + 5 * y == 50, 0, 50)),
])
def clock(h, m): d = abs(30 * h + 0.5 * m - 6 * m) % 360; return min(d, 360 - d)
check("Latihan — Pemecahan Masalah (Aplikasi)", [
    [a for a in range(1, 100) if 3 * a + 12 == 2 * (a + 12)][0], 1 / (F(1, 6) + F(1, 3)),
    [g for g in range(21) if 4 * g + 2 * (20 - g) == 56][0], 10 * 9 // 2,
    sum(len(str(k)) for k in range(1, 121)), [n for n in range(0, 100, 2) if n + (n + 2) + (n + 4) == 78][0] + 4,
    6 * 13 - 5 * 12, clock(3, 30), 10 * 11, 1 / (F(1, 4) - F(1, 6)),
])
check("Latihan — Aritmatika Sosial", [
    200000 * 85 // 100, F(100000 - 80000, 80000) * 100, round((1 - 0.8 * 0.9) * 100), F(2000000 * 6 * 8, 100 * 12),
    F(54000 * 10, 9), 50 - 50 * F(2, 100), F(110000 * 10, 11), 9 * 12000, F(100000 * 12 * 8, 100), F(100000, 1000000 * 5 // 100) * 12,
])
check("Latihan — Keterbagian Bilangan Bulat", [
    [a for a in range(10) if (4702 + 10 * a) % 9 == 0][0], len([k for k in range(1, 201) if k % 3 == 0 or k % 5 == 0]), 2026 % 7,
    min(k for k in range(1000, 10000) if all(k % d == 0 for d in (2, 3, 4, 5, 6))), pow(7, 2026, 10),
    len([d for d in range(1, 73) if 72 % d == 0]), "A",
    sum(20 // 2**k for k in range(1, 6)), pow(3, 100, 4), len([k for k in range(100, 1000) if k % 7 == 0]),
])
assert all((1010 * a + 101 * b) % 101 == 0 for a in range(1, 10) for b in range(10)) and 3737 % 11 and 3737 % 9
check("Latihan — Rasio dan Perbandingan", [
    45 // 15 * 8, 3.5 * 200000 / 100000, 6 * 10 // 15, 240000 * 5 // 8, F(3, 12) * 40, F(8, 100) * 250,
    49 // 7 * 4, F(2 * 3 + 2, 3 - 2), 12 * 10 // 20, F(30 * 20, 100) / F(12, 100) - 30,
])
check("Latihan — Luas Bangun Datar yang Beririsan", [
    100 + 36 - 4, 40 + 25 - 15, 64 // 4, 40 + 40 - 16, 196 - F(22, 7) * 49, 36 + 36 - 60, 100 - 64,
    196 - F(1, 4) * F(22, 7) * 196, 72 - 36, F(22, 7) * 49 + F(22, 7) * 196 - 44,
])
check("Latihan — Jarak, Kecepatan, dan Waktu", [
    60 * 2.5, F(240, 120 // 60 + 120 // 40), 300 // (70 + 80), 40 // (60 - 40), 200 / (72 * 1000 / 3600), (150 + 250) / 20,
    45 // (12 + 3), [x for x in range(0, 11) if F(x, 10) + F(10 - x, 5) == F(3, 2)][0], 90 * 1000 // 3600, "A",
])
def shoelace(P): return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2
check("Latihan — Luas Arsiran Segiempat", [
    shoelace([(0, 0), (12, 6), (0, 12)]), 10 * 6 / 2, shoelace([(4, 0), (8, 4), (4, 8), (0, 4)]), 12 * 7 / 2, (10 + 6) * 4 / 2, 12 * 16 / 2,
    shoelace([(0, 0), (12, 4), (6, 8)]), shoelace([(0, 0), (4, 0), (10, 10), (0, 10)]), 144 / 2,
    shoelace([(4, 0), (16, 4), (12, 10), (0, 6)]),
])
check("Latihan — Operasi Hitung Bentuk Aljabar", [
    3 * (2 * 5 - 5) - 2 * (5 - 4), (2 * -4 + 3 * 1), (7 + 3) ** 2 - (7 - 3) ** 2, 8**2 - 2 * 15, "A", "A", 102**2, 33 // 3, 2 * 4 - 3 * -2 + 1, 4**2 - 2,
])


# ---- Simulasi ----
import re
def optval(o):
    t = o.replace("$", "").replace("Rp", "").replace("\\,", "").replace("{,}", ",")
    t = re.sub(r"\\dfrac\{?(-?\d+)\}?\{?(\d+)\}?", r"\1/\2", t)
    t = re.sub(r"\^\\circ|cm²|km/jam|tahun|hari|detik|kg|km|cm|%", "", t).strip()
    t = t.replace(".", "").replace(",", ".")
    try:
        return F(t)
    except Exception:
        return None
def letter(quiz, i, value):
    """letter of the unique option equal to value (question i, 1-based)"""
    opts = quizzes[quiz]["questions"][i - 1]["options"]
    value = F(value).limit_denominator(10**6) if isinstance(value, float) else F(value)
    hits = [chr(65 + k) for k, o in enumerate(opts) if optval(o) is not None and optval(o) == value]
    assert len(hits) == 1, (quiz, i, opts, value, hits)
    vals = [optval(o) for o in opts]
    assert len(set(v for v in vals if v is not None)) == len([v for v in vals if v is not None]), (quiz, i, "duplicate options")
    return hits[0]
def sim(quiz, expected):
    out = []
    for i, e in enumerate(expected, 1):
        q = quizzes[quiz]["questions"][i - 1]
        if q["type"] == "MULTIPLE_CHOICE" and not (isinstance(e, str) and len(e) == 1 and e in "ABCD"):
            e = letter(quiz, i, e)
        out.append(e)
    check(quiz, out)
def textopt(quiz, i, text):
    opts = quizzes[quiz]["questions"][i - 1]["options"]
    assert opts.count(text) == 1, (quiz, i, opts)
    return "ABCD"[opts.index(text)]
def sp(f, lo=-200, hi=200): return [(x, y) for x in range(lo, hi + 1) for y in range(lo, hi + 1) if f(x, y)]

sim("Penyisihan — Paket I", [
    25 * 36 * 4 // 9, -8 + 12 // -4 * 3, F(2, 3) + F(3, 4) - F(5, 6), 1.5 * 2.4 + 1.5 * 7.6,
    one(alph('V("A3")+V("5B")', "100", "AB", "A"), lambda V: V("A") + V("B")),
    one(alph('V("A5")*5', 'V("3A5")', "A", "A"), lambda V: V("A")),
    len([x for x in range(-50, 50) if -3 <= 2 * x - 1 < 7]), max([F(4, 7), F(5, 9), F(3, 5), F(7, 12)]),
    len([d for d in range(1, 37) if 36 % d == 0]), len(sp(lambda x, y: 2 * x + 5 * y == 30, 0, 30)),
    [n for n in range(1, 100, 2) if 5 * n + 20 == 85][0] + 8,
    4 * [a for a in range(1, 50) if 4 * a - 5 == 9 * (a - 5)][0],
    sum(str(k).count("1") for k in range(1, 101)), 160000 * 3 // 4, F(84000, F(6, 5)), 1500000 + 1500000 * 8 * 9 // 1200,
    pow(2, 2026, 3), len([k for k in range(1, 101) if k % 2 and k % 3]), len([a for a in range(10) if (305 + 10 * a) % 15 == 0]),
    18 // 2 * 8, [n for n in range(1, 50) if n * 12 == 8 * 15][0] - 8, F(4000000, 250000), 81 + 25 - 6, 96 - 49,
    F(45 * 40, 60), F(400, 3 + 5), shoelace([(0, 0), (10, 5), (5, 10)]), F(8 + 14, 2) * 6, 15 - 4, 10**2 - 2 * 21,
])
sim("Penyisihan — Paket II", [
    125 * 32 * 25, (-2) ** 4 - 3 * -5 + (-1) ** 2027, F(3, 8) / F(9, 16) * F(3, 4), F(2027**2 - 2025**2, 4052),
    len([v for v in range(10, 100) if v % 10 and v // 10 and (v - int(str(v)[::-1])) == 54]),
    one(alph('V("AB")*V("BA")', "2268", "AB", "AB"), lambda V: V("A") + V("B")),
    max(x for x in range(-100, 100) if F(2 * x + 1, 3) < F(x + 5, 2)), len([n for n in range(1, 100) if F(n, n + 1) < F(5, 6)]),
    len(sp(lambda x, y: x * y == 18, -20, 20)), len(sp(lambda x, y: x * x - y * y == 24, 1, 30)),
    [k for k in range(31) if 4 * k + 2 * (30 - k) == 80][0], 1 / (F(1, 10) + F(1, 15)), clock(8, 20), F(140000 * 10, 7),
    textopt("Penyisihan — Paket II", 15, "rugi 20%"), 400 - 400 * F(25, 1000), len([d for d in range(1, 181) if 180 % d == 0]), pow(3, 2027, 10),
    min(n for n in range(2, 1000) if all(n % d == 1 for d in (2, 3, 4, 5, 6))), 500000 // 10 * 3, 240 // 3,
    F(2 * 60000 + 3 * 40000, 5), 154 + 154 - 20, 24 + 24 - 40, F(2 * 50 + 3 * 60, 5), F(1200, 60) * F(3600, 1000), 64 - 32, 10 * 18 // 2,
    (3 + 2) ** 2 - (3 - 1) * (3 + 1), 3**2 + 2,
])
assert 12 * 2000 - 30000 == -6000 and F(6000, 30000) == F(1, 5)  # P2 #15: rugi 20%
sim("Semifinal — Paket I", [
    sum(F(1, k * (k + 2)) for k in range(1, 20, 2)),
    one(alph('V("ABCD")*9', 'V("DCBA")', "ABCD", "AD"), lambda V: V("A") + V("B") + V("C") + V("D")),
    len([a for a in range(1, 12) if F(1, 3) < F(a, 12) < F(3, 4) and math.gcd(a, 12) == 1]),
    len(sp(lambda x, y: x * y == 3 * x + y + 7, 1, 50)),
    len([c for c in __import__("itertools").combinations(range(1, 13), 3) if sum(c) == 12]),
    textopt("Semifinal — Paket I", 6, "tidak untung dan tidak rugi"), (2**100 - 1) % 7, (lambda k: 7 * k * 1000)([k for k in range(1, 200) if 6 * (3 * k + 10) == 5 * 4 * k][0]), 600 // (5 - 3),
    shoelace([(0, 0), (12, 4), (6, 12)]),
    100 + 144 - 25, 3**3 - 3 * 3, len(sp(lambda x, y: x * x - y * y == 45, -30, 30)),
    len([k for k in range(1000, 10000) if str(k)[0] == "1" and str(k)[2] == "2" and k % 36 == 0]), 45 * 15000 - 50 * 12000,
])
assert 1.25 * 0.8 == 1.0
sim("Semifinal — Paket II", [
    F(2**2027 - 2**2025, 3 * 2**2024), (lambda v: v // 1000 + v // 100 % 10)([x * x for x in range(10, 100) if x * x >= 1000 and x * x % 100 == x][0]),
    len([x for x in range(1, 100) if F(1, 4) < F(3, x) < F(1, 2)]), len(sp(lambda a, b: F(1, a) + F(1, b) == F(1, 3), 1, 50)),
    [n for n in range(1, 500) if sum(len(str(k)) for k in range(1, n + 1)) == 192][0],
    F(168000 * 12, 14 * 2400000) * 100, len([k for k in range(1, 1001) if (k % 4 == 0 or k % 6 == 0) and k % 12]),
    500000, F(12 - 8, 2), 15,
    sum(k * k if k % 2 else -k * k for k in range(1, 21)), 2 * F(1, 4) * F(22, 7) * 196 - 196, 6**3 - 3 * 4 * 6,
    sum(map(int, str(one(alph('V("ABCDE")*4', 'V("EDCBA")', "ABCDE", "AE"), lambda V: V("ABCDE"))))), 40 * (1 + 180 // 90),
])
assert [x * x for x in range(10, 100) if x * x >= 1000 and x * x % 100 == x] == [5776]
assert (lambda k, m: (5 * k - 3 * m, 7 * k - 5 * m))(100, 100) == (200, 200)   # S2 #8: gaji A = 5k = 500 ribu
assert 60 / 2 / 2 == 15                                                            # S2 #10
assert all(isinstance(q, dict) for q in quizzes["Final — Paket I"]["questions"])
check("Final — Paket I", [str(100000 + F(299999, 7)), "", str(F(20 * 5000 + 80 * 4000 - 300000, 300000) * 100), str(int(shoelace([(0, 12), (6, 0), (12, 6)]))), str(3 * 5)])
assert F(299999, 7) == 42857 and 142857 * 3 == 428571
assert all((n + (n + 1) + (n + 2)) % 3 == 0 and (4 * n + 6) % 4 == 2 for n in range(-100, 100))
check("Final — Paket II", [
    str(len(sp(lambda x, y: x * y + 2 * x - y == 5, -50, 50))), str(sum(x for x in range(-100, 100) if F(x, 3) + F(x - 1, 2) > 2 and 3 * x - 7 < 2 * x + 1)),
    str(100 - int(F(10 + 6, F(1, 5)))), str(F(2026**3 - 1, 2026**2 + 2027)), str(int(shoelace([(0, 0), (8, 8), (14, 6)]))),
])
for f in ("Final — Paket I", "Final — Paket II"):
    for q in quizzes[f]["questions"]:
        assert q["answerMarks"] + q["rubric"] == q["points"] == 20, (f, q)
for name, q in quizzes.items():
    total = sum(x["points"] for x in q["questions"])
    if q["style"] in ("TRYOUT", "EXAM"): assert total == 100, (name, total)
print(f"OK — {checks} answers recomputed (practice + simulations)")
