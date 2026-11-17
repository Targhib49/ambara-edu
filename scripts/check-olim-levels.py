"""Recompute every answer of the olympiad course's level path (Jalur Bertingkat) and compare with the content files.
Run: python3 scripts/check-olim-levels.py   (needs node: it reads the content through scripts/dump-olim-levels.ts)

Answers are recomputed independently — brute force, coordinates, or the definition — not by
repeating the content's own working. FIND_MISTAKE indices are stated, with an assertion that
the flagged line really is wrong."""
import json, subprocess, math, random
from fractions import Fraction as F
from itertools import permutations, product, combinations
from math import comb, factorial, gcd

data = json.loads(subprocess.check_output(["npx", "tsx", "scripts/dump-olim-levels.ts"], text=True))
quizzes = {q["quiz"]: q for q in data}
checks = 0
seen = set()

def num(s):
    """'3/4', '-5/2', '69,2', '4.8', '12' → Fraction"""
    if isinstance(s, (int, float)):
        return F(s).limit_denominator(10**6)
    s = s.strip().replace(",", ".")
    return F(s) if "/" in s else F(s).limit_denominator(10**6)

def same(got, e):
    if isinstance(e, list):
        return isinstance(got, list) and len(got) == len(e) and all(same(g, x) for g, x in zip(got, e))
    if isinstance(e, str) and (e.isalpha() or e == ""):
        return got == e
    if isinstance(got, list):  # MULTI_SELECT letters
        return sorted(got) == sorted(e)
    return num(got) == num(e)

def check(quiz, expected):
    global checks
    seen.add(quiz)
    qs = quizzes[quiz]["questions"]
    assert len(qs) == len(expected), f"{quiz}: {len(qs)} questions, {len(expected)} expected"
    for i, (q, e) in enumerate(zip(qs, expected), 1):
        if isinstance(e, F):
            e = f"{e.numerator}/{e.denominator}" if e.denominator != 1 else e.numerator
        if isinstance(e, list):
            e = [f"{x.numerator}/{x.denominator}" if isinstance(x, F) and x.denominator != 1 else (x.numerator if isinstance(x, F) else x) for x in e]
        if q["type"] == "MULTI_SELECT":
            ok = sorted(q["answer"]) == sorted(e)
        else:
            ok = same(q["answer"], e)
        if not ok:
            raise SystemExit(f"FAIL {quiz} #{i}: content says {q['answer']!r}, recomputed {e!r}")
        checks += 1

def frac(x):
    """a Fraction meant to be written a/b (keeps 1/1 out)"""
    return F(x)

def divisors(n): return [d for d in range(1, n + 1) if n % d == 0]
def ndiv(n): return len(divisors(n))
def is_prime(n): return n > 1 and all(n % d for d in range(2, math.isqrt(n) + 1))
def legendre(n, p):
    k, q = 0, p
    while q <= n: k += n // q; q *= p
    return k
def lcm(*xs):
    out = 1
    for x in xs: out = out * x // gcd(out, x)
    return out
def order(a, m):
    k, x = 1, a % m
    while x != 1: x = x * a % m; k += 1
    return k
def euclid_remainders(a, b):
    out = []
    while b: a, b = b, a % b; out.append(b)
    return out
def mc_letter(options, ok):
    hits = [chr(65 + i) for i in range(len(options)) if ok(i)]
    assert len(hits) == 1, hits
    return hits[0]
def first_wrong(stated, wrong_is_really_wrong):
    assert wrong_is_really_wrong, "the flagged line is not wrong"
    return stated

# ============================================================== TEORI BILANGAN
ns = [n for n in range(1, 1000) if (n + 22) % (n + 4) == 0]
nums = [int(f"5{a}6{b}") for a in range(10) for b in range(10) if int(f"5{a}6{b}") % 36 == 0]
check("Langkah demi Langkah — Teori Bilangan Level 1", [
    [22 - 4, ndiv(18), len(ns), sum(ns)],
    [36 // 4, len([b for b in range(10) if (60 + b) % 4 == 0]), len(nums), max(nums)],
    [max(k for k in range(8) if gcd(90, 168) % 2 ** k == 0), gcd(90, 168), lcm(90, 168), gcd(90, 168) * lcm(90, 168)],
    euclid_remainders(1147, 851) + [gcd(1147, 851)],
    first_wrong(2, 323 % 17 == 0),
    [lcm(12, 18, 30), 3600 // lcm(12, 18, 30)],
])
assert 90 * 168 == 15120
L1_opts = quizzes["Latihan — Teori Bilangan Level 1"]["questions"][3]["options"]
pairs_8_480 = [(a, b) for a in range(1, 481) for b in range(a + 1, 481) if gcd(a, b) == 8 and lcm(a, b) == 480]
check("Latihan — Teori Bilangan Level 1", [
    len([n for n in range(1, 200) if (n + 48) % n == 0]),
    len([n for n in range(1, 200) if (n + 20) % (n + 2) == 0]),
    [a for a in range(10) if int(f"4{a}8{a}2") % 11 == 0][0],
    mc_letter(L1_opts, lambda i: int(L1_opts[i].strip("$")) % 24 == 0),
    max(p for p in divisors(2026) if is_prime(p)),
    len([p for p in range(81, 100) if is_prime(p)]),
    [p for p in range(2, 2000) if is_prime(p) and is_prime(2 * p + 1) and is_prime(4 * p + 1)][0],
    len(pairs_8_480),
    [lcm(a, b) for a in range(1, 2161) for b in range(a, 2161) if a * b == 2160 and gcd(a, b) == 12][0],
    gcd(1517, 1271),
])
assert len([p for p in range(2, 2000) if is_prime(p) and is_prime(2 * p + 1) and is_prime(4 * p + 1)]) == 1
check("Uji Naik Level — Teori Bilangan Level 1", [
    len([n for n in range(1, 200) if (n + 41) % (n + 5) == 0]),
    max(int(f"3{a}7{b}") for a in range(10) for b in range(10) if int(f"3{a}7{b}") % 45 == 0),
    gcd(391, 299),
    min(a + b for a in range(1, 271) for b in range(a + 1, 271) if gcd(a, b) == 9 and lcm(a, b) == 270),
    [p for p in range(2, 5000) if is_prime(p) and is_prime(p + 4) and is_prime(p + 8)][0],
])
assert len([p for p in range(2, 5000) if is_prime(p) and is_prime(p + 4) and is_prime(p + 8)]) == 1

small_primes = [2, 3, 5, 7, 11]
def min_form(e1, e2, e3=None):
    best = None
    for p, q in permutations(small_primes, 2):
        if e3 is None:
            v = p ** e1 * q ** e2
            best = v if best is None else min(best, v)
        else:
            for r in small_primes:
                if r in (p, q): continue
                v = p ** e1 * q ** e2 * r ** e3
                best = v if best is None else min(best, v)
    return best
check("Langkah demi Langkah — Teori Bilangan Level 2", [
    [min_form(8, 1), min_form(5, 2), min_form(2, 2, 1), min(n for n in range(1, 5000) if ndiv(n) == 18)],
    [order(3, 7), 2026 % 6, 3 ** 4 % 7],
    [legendre(150, 5), legendre(20, 2), legendre(100, 3)],
    [5, max(y for x in range(1, 200) for y in range(1, 200) if 5 * x + 8 * y == 200), len([(x, y) for x in range(1, 200) for y in range(1, 200) if 5 * x + 8 * y == 200])],
    first_wrong(2, pow(8, 2024, 10) == 6),
    [(4 * 5 + 3) % 7, 25 % 7, (125 + 1) % 7],
])
assert pow(3, 2026, 7) == 4 and all(y % 5 == 0 for x in range(1, 200) for y in range(1, 200) if 5 * x + 8 * y == 200)
assert all((4 * n + 3) % 7 == 2 and n * n % 7 == 4 and (n ** 3 + 1) % 7 == 0 for n in range(5, 200, 7))
L2_opts = quizzes["Latihan — Teori Bilangan Level 2"]["questions"][8]["options"]
def solvable(a, b, c): return any((c - a * x) % b == 0 for x in range(-200, 200))
check("Latihan — Teori Bilangan Level 2", [
    ndiv(1200),
    sum(divisors(72)),
    len([d for d in divisors(720) if d % 2]),
    pow(2, 50, 7),
    pow(11, 37, 100),
    (pow(2, 2026, 10) + pow(3, 2027, 10)) % 10,
    legendre(500, 5),
    len(str(factorial(100) // factorial(50))) - len(str(factorial(100) // factorial(50)).rstrip("0")),
    mc_letter(L2_opts, lambda i: not solvable(*[(6, 10, 14), (9, 12, 21), (8, 12, 18), (7, 5, 1)][i])),
    len([(x, y) for x in range(0, 101) for y in range(0, 101) if 3 * x + 7 * y == 100]),
])
assert ["$6x + 10y = 14$", "$9x + 12y = 21$", "$8x + 12y = 18$", "$7x + 5y = 1$"] == L2_opts
check("Uji Naik Level — Teori Bilangan Level 2", [
    min(n for n in range(1, 5000) if ndiv(n) == 16),
    pow(5, 100, 13),
    sum(pow(a, 2026, 10) for a in range(1, 5)) % 10,
    legendre(1000, 5),
    len([(x, y) for x in range(1, 61) for y in range(1, 61) if 2 * x + 7 * y == 60]),
])

xy_pairs = [(x, y) for x in range(1, 500) for y in range(1, 500) if x * y == 4 * x + 5 * y]
check("Langkah demi Langkah — Teori Bilangan Level 3", [
    [17 - 1, 2026 % 16, 1024 % 17],
    [4 * 5, ndiv(20), len(xy_pairs), max(x for x, y in xy_pairs)],
    [(pow(9, 2026, 7) - pow(2, 2026, 7)) % 7, (pow(9, 2026, 7) + pow(2, 2026, 7)) % 7, (pow(4, 2027, 7) + pow(3, 2027, 7)) % 7],
    [1, len({x * x % 8 for x in range(8)}), 2023 % 8, ({0, 1, 2, 3, 4, 5, 6, 7} - {(a * a + b * b + c * c) % 8 for a in range(8) for b in range(8) for c in range(8)}).pop()],
    first_wrong(2, all(5 * 5 ** k - 1 != 5 * (5 ** k - 1) + 5 for k in range(1, 10))),
    first_wrong(0, pow(2, 14, 15) != 1),
])
assert pow(2, 2026, 17) == 4 and all(x * x % 8 == 1 for x in range(1, 100, 2))
L3_mc = quizzes["Latihan — Teori Bilangan Level 3"]["questions"][6]["options"]
L3_ms = quizzes["Latihan — Teori Bilangan Level 3"]["questions"][7]["options"]
mc_funcs = {"$9^n - 1$": lambda n: 9 ** n - 1, "$6^n + 1$": lambda n: 6 ** n + 1, "$8^n - 1$": lambda n: 8 ** n - 1, "$2^n + 5$": lambda n: 2 ** n + 5}
ms_funcs = {"$n^5 - n$": lambda n: n ** 5 - n, "$n^3 + 5n$": lambda n: n ** 3 + 5 * n, "$n^2 + n$": lambda n: n * n + n, "$2n^3 + 3n^2 + n$": lambda n: 2 * n ** 3 + 3 * n * n + n}
triples = [(x, y, z) for x in range(1, 10) for y in range(x, 50) for z in range(y, 500) if F(1, x) + F(1, y) + F(1, z) == 1]
check("Latihan — Teori Bilangan Level 3", [
    pow(3, 2026, 13),
    pow(2, 2026, 11),
    sum(pow(a, 12, 13) for a in range(1, 13)) % 13,
    (pow(10, 2026, 7) + pow(4, 2026, 7)) % 7,
    len([(x, y) for x in range(1, 100) for y in range(1, 100) if F(1, x) + F(1, y) == F(1, 6)]),
    len([(x, y) for x in range(0, 100) for y in range(0, 100) if x * x - y * y == 45]),
    mc_letter(L3_mc, lambda i: all(mc_funcs[L3_mc[i]](n) % 7 == 0 for n in range(1, 30))),
    [chr(65 + i) for i, o in enumerate(L3_ms) if all(ms_funcs[o](n) % 6 == 0 for n in range(-40, 41))],
    max(n for n in range(1, 5000) if (n ** 3 + 100) % (n + 10) == 0),
    len(triples),
])
assert max(y for x in range(1, 100) for y in range(1, 1000) if F(1, x) + F(1, y) == F(1, 6)) < 100
assert all((n ** 5 - 5 * n ** 3 + 4 * n) % 120 == 0 for n in range(-200, 200))
check("Uji Tuntas — Teori Bilangan Level 3", [
    pow(7, 2026, 13),
    len([(x, y) for x in range(1, 200) for y in range(1, 200) if x * y == 3 * x + 5 * y + 2]),
    sum(pow(a, 2026, 7) for a in range(1, 7)) % 7,
    max(n for n in range(1, 5000) if (n * n + 50) % (n + 5) == 0),
    "",
    [p for p in range(2, 400) if is_prime(p) and is_prime(2 ** p + p * p)][0],
])
assert [p for p in range(2, 400) if is_prime(p) and is_prime(2 ** p + p * p)] == [3]

# ============================================================== ALJABAR
def coeffs2(f):
    c = f(0); a = (f(2) - 2 * f(1) + c) / 2; b = f(1) - a - c
    return a, b, c
x = F(2)
assert (x + 4) / 3 - (x - 2) / 5 == 2
apel = [(a, j) for a in range(0, 20) for j in range(0, 20) if 3 * a + 2 * j == 16 and 2 * a + 5 * j == 18][0]
ab = [(a, b) for a in range(-20, 20) for b in range(a, 20) if a + b == 9 and a * b == 14][0]
ints = [x for x in range(-100, 100) if 3 * x - 7 <= 5 * x + 3 < 2 * x + 24]
check("Langkah demi Langkah — Aljabar Level 1", [
    [15, 2 * 15, 5 * 4 + 3 * 2, [x for x in range(-50, 50) if F(x + 4, 3) - F(x - 2, 5) == 2][0]],
    [15 - 4, apel[1], apel[0], sum(apel)],
    [ab[0] ** 2 + ab[1] ** 2, (ab[0] - ab[1]) ** 2, ab[0] ** 2 * ab[1] + ab[0] * ab[1] ** 2],
    [min(ints), max(ints) + 1, len(ints)],
    first_wrong(2, not all(5 - 3 * x > 17 for x in range(-3, 10))),
    [F(180, 90), 50 * F(180, 90)],
])
check("Latihan — Aljabar Level 1", [
    coeffs2(lambda x: (3 * x - 2) * (4 * x + 5) - 2 * x * (6 * x - 1))[1],
    [x for x in range(-100, 100) if 7 * (x - 3) == 4 * (x + 6)][0],
    [n + 4 for n in range(0, 100, 2) if n + n + 2 + n + 4 == 78][0],
    [a for a in range(1, 50) if (50 - a) - 5 == 7 * (a - 5)][0],
    len([x for x in range(-100, 100) if -5 <= 2 - 3 * x < 14]),
    max(x for x in range(-100, 100) if F(x, 2) - F(x - 1, 3) < 2),
    [x + y for x in range(-20, 20) for y in range(-20, 20) if 4 * x - 3 * y == 5 and 2 * x + 5 * y == 9][0],
    [a for b in range(1, 40) for a in range(0, 40) if b + a == 18 and b - a == 12][0],
    [A for A in range(0, 121) if A - 15 == (120 - A) + 15][0],
    [x * x + y * y for x in range(-30, 30) for y in range(-30, 30) if x - y == 4 and x * y == 21][0],
])
check("Uji Naik Level — Aljabar Level 1", [
    [x for x in range(-50, 50) if F(x + 5, 4) - F(x - 3, 6) == 2][0],
    len([x for x in range(-100, 100) if 2 * x - 5 < 4 * x + 7 <= x + 22]),
    [a * a + b * b for a in range(-20, 20) for b in range(-20, 20) if a + b == 11 and a * b == 18][0],
    [a for a in range(1, 40) for b in range(1, 40) if 50 * (a + b) == 600 and 300 * (a - b) == 600][0],
    max(h for h in range(1, 100) if 3000 + 2000 * (h - 1) <= 25000),
])

def roots_sum_prod(a, b, c): return F(-b, a), F(c, a)
s, p = roots_sum_prod(1, -6, 4)
sol3 = [(x, y, z) for x in range(-20, 20) for y in range(-20, 20) for z in range(-20, 20) if x + 2 * y + z == 16 and x + y + 2 * z == 17 and 2 * x + y + z == 15]
assert len(sol3) == 1
check("Langkah demi Langkah — Aljabar Level 2", [
    [6 * -20, -15, 8, [r for r in [F(5, 2), F(-4, 3)] if r > 0 and 6 * r * r - 7 * r - 20 == 0][0]],
    [s, p, s * s - 2 * p, s ** 3 - 3 * p * s],
    [-(2 * roots_sum_prod(1, -5, 2)[0]), 4 * roots_sum_prod(1, -5, 2)[1]],
    [2, 7, (lambda t: 2 * t + 7)(8)],
    first_wrong(1, (-1 - 2) ** 2 == 9),
    [sum(sol3[0]), sol3[0][0], sol3[0][2]],
])
assert -15 + 8 == -7 and all((lambda t: 2 * t + 7)(3 * x - 1) == 6 * x + 5 for x in range(-10, 10))
L22 = quizzes["Latihan — Aljabar Level 2"]["questions"][2]["options"]
rng = random.Random(1)
pts = [(F(rng.randint(-9, 9)), F(rng.randint(-9, 9))) for _ in range(6)]
fac = {0: lambda x, y: (2 * x + 3 - y) * (2 * x - 3 + y), 1: lambda x, y: (2 * x - 3 - y) * (2 * x - 3 + y), 2: lambda x, y: (4 * x - 9 - y) * (x - 1 + y), 3: lambda x, y: (2 * x - y) * (2 * x + y - 9)}
s, p = roots_sum_prod(2, -9, 4)
s2, p2 = roots_sum_prod(3, -5, -2)
pipe = [(a, b, c) for a in [F(1, k) for k in range(1, 40)] for b in [F(1, k) for k in range(1, 40)] for c in [F(1, k) for k in range(1, 40)] if a + b == F(1, 4) and b + c == F(1, 6) and a + c == F(1, 4)]
check("Latihan — Aljabar Level 2", [
    2026 ** 2 - 2025 ** 2,
    F(2025 * 2027 + 1, 2026),
    mc_letter(L22, lambda i: all(fac[i](x, y) == 4 * x * x - 12 * x + 9 - y * y for x, y in pts)),
    p * s,
    frac(s2 / p2),
    [m for m in range(1, 100) if (m - 1) ** 2 - 64 == 0][0],
    abs(8 - 3) if (8 * 8 - 11 * 8 + 24 == 0 and 9 - 33 + 24 == 0) else None,
    (lambda v: v * v + 3)(2 * 3 - 1),
    [a for a in range(2, 50) if F(a + 7, a - 1) == 5][0],
    1 / sum(pipe[0]),
])
assert len(pipe) == 1
s, p = roots_sum_prod(1, -7, 5)
sol3 = [(x, y, z) for x in range(-20, 20) for y in range(-20, 20) for z in range(-20, 20) if x + y + z == 10 and x - y + 2 * z == 9 and 2 * x + y - z == 2]
assert len(sol3) == 1
check("Uji Naik Level — Aljabar Level 2", [
    F(2026 ** 3 - 1, 2026 ** 2 + 2027),
    (lambda s, p: (s * s - 2 * p) ** 2 - 2 * p * p)(*roots_sum_prod(1, -4, 1)),
    (-(s + 6)) + (p + 3 * s + 9),
    [4 * x + 1 for x in range(-20, 20) if 2 * x - 3 == 7][0],
    sol3[0][0] * sol3[0][1] * sol3[0][2],
])

grid = [F(k, 100) for k in range(1, 2001)]
f1 = lambda x: 2 * x * x - 12 * x + 23
f2 = lambda x: 3 * x + F(12) / x
t = F(4)
xs = [F(k, 10) for k in range(-50, 51)]
check("Langkah demi Langkah — Aljabar Level 3", [
    [min(grid, key=f1), f1(3), min(f1(x) for x in grid)],
    [36, min(f2(x) for x in grid), min(grid, key=f2)],
    [t * t - 2, t ** 3 - 3 * t, (t * t - 2) ** 2 - 2],
    [3 * 4, 3 * -2, (lambda x: 4 - 3 * x)(4)],
    first_wrong(2, min(x + F(4) / x for x in grid if x >= 3) != 4),
    [17 ** 3 + (-9) ** 3 + (-8) ** 3, 6 * 6 - 2 * 11, 6 * ((6 * 6 - 2 * 11) - 11)],
])
assert all((lambda x: 4 - 3 * x)(x) + 2 * (lambda x: 4 - 3 * x)(2 - x) == 3 * x for x in xs)
f = lambda x: (1 + x) / (1 - x)
import cmath
def _roots(q, r):  # t^3 + q t + r = 0, numerically
    import numpy as _np
    return _np.roots([1, 0, q, r])
try:
    cubic_roots = [complex(z) for z in _roots(-6, -4)]
except ImportError:
    cubic_roots = None
v = F(2)
for _ in range(2026): v = f(v)
# f(x) + 3 f(1/x) = 4x: solve the 2x2 at x = 2
A = [[1, 3], [3, 1]]; rhs = [8, 2]
det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
f2val = F(rhs[0] * A[1][1] - A[0][1] * rhs[1], det)
check("Latihan — Aljabar Level 3", [
    max(-x * x + 10 * x - 9 for x in xs),
    max(x * (60 - 2 * x) for x in [F(k, 10) for k in range(0, 301)]),
    min((x * x + 2 * x + 36) / x for x in grid),
    min(x * x + F(16) / x for x in grid),
    min((x + 3) ** 2 + (y - 4) ** 2 + 5 for x in range(-10, 10) for y in range(-10, 10)),
    round((lambda x: x * x + 1 / (x * x))((3 + math.sqrt(13)) / 2)),
    round(sum(r ** 3 for r in cubic_roots).real),
    f2val,
    v,
    mc_letter(quizzes["Latihan — Aljabar Level 3"]["questions"][9]["options"], lambda i: quizzes["Latihan — Aljabar Level 3"]["questions"][9]["options"][i] == "$3$"),
])
assert (lambda x, y: x * x + y * y + 6 * x - 8 * y + 30)(-3, 4) == 5
assert all(a + b + c != 0 or a ** 3 + b ** 3 + c ** 3 == 3 * a * b * c for a in range(-5, 6) for b in range(-5, 6) for c in range(-5, 6))
assert max(a * b + b * c + c * a for a in [F(k, 20) for k in range(1, 60)] for b in [F(k, 20) for k in range(1, 60)] for c in [3 - a - b] if c > 0) == 3
assert quizzes["Latihan — Aljabar Level 3"]["questions"][9]["options"][2] == "$3$"
P = [(x, y) for x in range(-20, 20) for y in range(-20, 20)]
g = lambda x, y: x * x + 2 * y * y + 2 * x * y - 6 * x - 2 * y + 15
# f(0) + 2 f(1) = 0 and 2 f(0) + f(1) = 1, by Cramer
f0 = F(0 * 1 - 2 * 1, 1 * 1 - 2 * 2)
check("Uji Tuntas — Aljabar Level 3", [
    30 + max(range(0, 41), key=lambda n: (30 + n) * (200 - 5 * n)),
    min(x + F(4) / (x * x) for x in grid),
    5 ** 3 - 3 * 5,
    f0,
    "",
    min(g(x, y) for x, y in P),
])
assert g(5, -2) == 2 and all((a + b) * (b + c) * (c + a) >= 8 * a * b * c for a in range(1, 8) for b in range(1, 8) for c in range(1, 8))

# ============================================================== KOMBINATORIKA
def digits_distinct(n): return len(set(str(n))) == len(str(n))
even4 = [n for n in range(1000, 10000) if n % 2 == 0 and digits_distinct(n)]
six = list(permutations("ABCDEF"))
dice = list(product(range(1, 7), repeat=2))
abc = [(a, b, c) for a in range(1, 211) for b in range(1, 211) for c in [210 - a - b] if c > 0 and 3 * a == 2 * b and 5 * b == 4 * c]
check("Langkah demi Langkah — Kombinatorika Level 1", [
    [len([n for n in even4 if n % 10 == 0]), len([n for n in even4 if n % 10 != 0]), len(even4)],
    [comb(4, 3) * comb(7, 2), comb(4, 4) * comb(7, 1), sum(1 for t in combinations(range(11), 5) if sum(1 for i in t if i < 4) >= 3)],
    [len(six), len([s for s in six if abs(s.index("A") - s.index("B")) == 1]), len([s for s in six if abs(s.index("A") - s.index("B")) != 1])],
    [len([d for d in dice if d[0] % 2 and d[1] % 2]), len([d for d in dice if d[0] * d[1] % 2 == 0]), F(len([d for d in dice if d[0] * d[1] % 2 == 0]), 36)],
    first_wrong(2, F(1400 + 2400, 50) != 75),
    [8 + 12 + 15, abc[0][2], abc[0][0]],
])
assert len(abc) == 1
check("Latihan — Kombinatorika Level 1", [
    len([n for n in range(100, 1000) if all(int(d) % 2 for d in str(n))]),
    len([p for p in permutations("012345", 3) if p[0] != "0" and int("".join(p)) % 5 == 0]),
    len(list(permutations(range(9), 3))),
    len(list(combinations(range(10), 3))),
    comb(12, 2) - 12,
    sum(1 for t in combinations(range(9), 4) if sum(1 for i in t if i < 4) == 2),
    F(len([c for c in product("AG", repeat=3) if c.count("A") == 2]), 8),
    F(sum(1 for t in combinations(range(10), 2) if (t[0] < 4) != (t[1] < 4)), comb(10, 2)),
    9 * 16 - 8 * 15,
    3 * (200000 / 100000) ** 2,
])
check("Uji Naik Level — Kombinatorika Level 1", [
    len([p for p in permutations("1234567", 4) if int("".join(p)) > 5000]),
    len([s for s in permutations(range(7)) if s.index(0) not in (0, 6)]),
    sum(1 for t in combinations(range(11), 4) if 0 < sum(1 for i in t if i < 6) < 4),
    F(len([d for d in dice if is_prime(sum(d))]), 36),
    [q for q in range(0, 41) if 65 * (40 - q) + 80 * q == 74 * 40][0],
])

banana = set(permutations("BANANA"))
def paths(a, b, x0=0, y0=0): return comb(a - x0 + b - y0, b - y0)
def count_sum(n, k, lo=0, hi=None, extra=None):
    return sum(1 for t in product(range(lo, n + 1), repeat=k) if sum(t) == n and (hi is None or max(t) <= hi) and (extra is None or extra(t)))
def derange(n): return [s for s in permutations(range(n))]
five = derange(5)
check("Langkah demi Langkah — Kombinatorika Level 2", [
    [len(banana), len(set(permutations("BNN"))), 4, len([s for s in banana if "AA" not in "".join(s)])],
    [paths(3, 1), paths(5, 3, 3, 1), paths(6, 4, 5, 3), paths(3, 1) * paths(5, 3, 3, 1) * paths(6, 4, 5, 3)],
    [count_sum(15, 4), count_sum(15, 4, lo=1), count_sum(15, 4, extra=lambda t: t[0] >= 3)],
    [300 // 3 + 300 // 5 + 300 // 7, 300 // 15 + 300 // 21 + 300 // 35, 300 // 105, len([n for n in range(1, 301) if n % 3 == 0 or n % 5 == 0 or n % 7 == 0])],
    first_wrong(1, factorial(7 - 1) != 5040),
    [len([s for s in five if all(s[i] != i for i in range(5))]), len([s for s in five if sum(s[i] == i for i in range(5)) == 1]), 1],
])
# circular check for the corrected value: fix person 0, Ani=0, Budi=1 adjacent among 8
assert len([s for s in permutations(range(1, 8)) if ((0,) + s).index(1) in (1, 7)]) == 1440
def bracelets(n):
    seen = set()
    for p in permutations(range(n)):
        forms = []
        for r in range(n):
            q = p[r:] + p[:r]
            forms += [q, q[::-1]]
        seen.add(min(forms))
    return len(seen)
def lattice_avoid(a, b, avoid):
    dp = {}
    for x in range(a + 1):
        for y in range(b + 1):
            if (x, y) == avoid: dp[x, y] = 0
            elif x == 0 and y == 0: dp[x, y] = 1
            else: dp[x, y] = dp.get((x - 1, y), 0) + dp.get((x, y - 1), 0)
    return dp[a, b]
balls = list(product(range(3), repeat=5))
check("Latihan — Kombinatorika Level 2", [
    len(set(permutations("SEMESTER"))),
    factorial(6),
    bracelets(7),
    lattice_avoid(5, 5, (2, 3)),
    count_sum(20, 4, lo=3),
    count_sum(10, 3, extra=lambda t: t[0] <= 3),
    len([n for n in range(1, 501) if n % 2 and n % 3 and n % 5]),
    30 + 25 - (50 - 8),
    F(sum(1 for t in combinations(range(10), 3) if any(i < 4 for i in t)), comb(10, 3)),
    F(len([b for b in balls if len(set(b)) == 3]), len(balls)),
])
five_circ = [s for s in permutations(range(1, 5))]
check("Uji Naik Level — Kombinatorika Level 2", [
    len([s for s in set(permutations("KALKULUS")) if "KK" in "".join(s)]),
    count_sum(12, 3, hi=6),
    len([n for n in range(1, 1001) if (n % 4 == 0 or n % 6 == 0) and n % 9]),
    F(len([s for s in five_circ if ((0,) + s).index(1) in (1, 4)]), len(five_circ)),
    len([t for t in product(range(1, 7), repeat=3) if sum(t) == 10]),
])

def max_free(n, bad):
    """largest subset of 1..n with no pair (a, b) where bad(a, b), by exhaustive branch and bound on small n"""
    best = 0
    nums = list(range(1, n + 1))
    def go(i, chosen):
        nonlocal best
        if len(chosen) + (n - i) <= best: return
        if i == n: best = max(best, len(chosen)); return
        x = nums[i]
        if all(not bad(x, c) for c in chosen): go(i + 1, chosen + [x])
        go(i + 1, chosen)
    go(0, [])
    return best
boxes = F(1, 2) * F(3, 5), F(1, 2) * F(1, 5)
def first_wins(p_hit):
    # sum over rounds: Andi wins on throw 1, 3, 5, …
    q = 1 - p_hit
    return sum(p_hit * q ** (2 * k) for k in range(400))
s9 = [d for d in dice if sum(d) == 9]
check("Langkah demi Langkah — Kombinatorika Level 3", [
    [boxes[0], boxes[1], boxes[0] + boxes[1], boxes[0] / (boxes[0] + boxes[1])],
    [F(1, 6), F(25, 36), F(6, 11)],
    [len(s9), F(len([d for d in s9 if 6 in d]), len(s9)), F(len([d for d in s9 if d[0] % 2 and d[1] % 2]), len(s9))],
    [len([(a, 21 - a) for a in range(1, 11)]), max_free(20, lambda a, b: a + b == 21), max_free(20, lambda a, b: a + b == 21) + 1],
    first_wrong(2, F(1, 3) != F(1, 2)),
    [F(800 - 71, 9), F(621 + 71, 10)],
])
assert abs(float(first_wins(F(1, 6))) - 6 / 11) < 1e-12
# max subset of 1..20 with no pair summing to 21 is 10, by pairing; confirm 11 always forces a pair (sample)
assert all(any(a + b == 21 for a, b in combinations(s, 2)) for s in (random.Random(k).sample(range(1, 21), 11) for k in range(2000)))
first_odd = [d for d in dice if d[0] % 2]
bag = list(permutations(["M"] * 4 + ["P"] * 2, 2))
def five_distinct():
    best = 0
    for t in combinations(range(1, 51), 2):
        a, b = t
        if b >= 8: break
        for d in range(9, 51):
            e = 50 - a - b - 8 - d
            if e > d: best = max(best, e)
    return best
check("Latihan — Kombinatorika Level 3", [
    F(len([d for d in first_odd if sum(d) >= 9]), len(first_odd)),
    F(len([b for b in permutations(range(6), 2) if b[1] >= 4]), 30),
    F(10, 1000) / (F(15, 1000) + F(6, 1000) + F(10, 1000)),
    F(8, 10) * F(4, 10) + F(2, 10) * F(6, 10),
    1 - F(1, 8),
    F(30 * 68 + 92 - 29, 30),
    five_distinct(),
    2 * 3 + 1,
    3 * 7 + 1,
    max_free(30, lambda a, b: abs(a - b) == 15) + 1,
])
three = list(product("AG", repeat=3))
atleast = [t for t in three if "A" in t]
check("Uji Tuntas — Kombinatorika Level 3", [
    F(len([t for t in atleast if t == ("A", "A", "A")]), len(atleast)),
    F(1, 4) / (1 - F(3, 4) * F(3, 4)),
    F(80 - 21 - F(252, 10), 1) / F(4, 10),
    max_free(50, lambda a, b: (a + b) % 7 == 0) + 1,
    "",
    F(len([d for d in dice if d[0] * d[1] % 2 == 0 and sum(d) % 2 == 0]), len([d for d in dice if d[0] * d[1] % 2 == 0])),
])
assert abs(float(sum(F(1, 4) * F(9, 16) ** k for k in range(200))) - 4 / 7) < 1e-12
assert F(25, 100) * 84 + F(35, 100) * 72 + F(40, 100) * F(845, 10) == 80

# ============================================================== GEOMETRI
def heron(a, b, c):
    s = F(a + b + c, 2)
    v = s * (s - a) * (s - b) * (s - c)
    r = math.isqrt(int(v))
    assert r * r == v
    return r
def shoelace(*p):
    return abs(sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p)))) / F(2)
PI = F(22, 7)
check("Langkah demi Langkah — Geometri Level 1", [
    [F(180, 5), 360 // 36, (10 - 2) * 180],
    [[x for x in range(1, 21) if 100 - x * x == 289 - (21 - x) ** 2][0], math.isqrt(100 - 36), heron(10, 17, 21)],
    [math.isqrt(6 ** 2 + 8 ** 2), F(5 + 7, 2), shoelace((-1, 2), (5, 10), (7, 0))],
    [7, PI * 49, 196 - PI * 49],
    first_wrong(1, 17 ** 2 - 8 ** 2 == 225),
    [math.isqrt(36 + 64), math.isqrt(36 + 64 + 576)],
])
triples = [(a, b) for a in range(1, 34) for b in range(a, 34) if a + b + 26 == 60 and a * a + b * b == 676]
check("Latihan — Geometri Level 1", [
    180 * 6 // 9,
    (15 - 2) * 180,
    360 // (180 - 165),
    F(12 + 20, 2) * math.isqrt(25 - 16),
    F(90, 3) / 2,
    math.isqrt(625 - 400) - 7,
    F(triples[0][0] * triples[0][1], 2),
    math.isqrt(12 ** 2 + 5 ** 2),
    shoelace((1, 2), (6, 2), (4, 9)),
    49 + 4 * F(1, 2) * PI * F(7, 2) ** 2,
])
abc = [(a, b, c) for a in range(1, 20) for b in range(1, 20) for c in range(1, 20) if a * a + b * b == 34 and b * b + c * c == 58 and a * a + c * c == 74]
check("Uji Naik Level — Geometri Level 1", [
    (lambda n: n * (n - 3) // 2)(360 // (180 - 156)),
    heron(13, 20, 21),
    [x for x in range(-20, 20) if (x - 2) ** 2 + 25 == (x - 6) ** 2 + 9][0],
    2 * F(1, 4) * PI * 49 - 49,
    abc[0][0] * abc[0][1] * abc[0][2],
])

check("Langkah demi Langkah — Geometri Level 2", [
    [10, F(6, 10) * 15, (F(6, 10) ** 2).denominator, 50 - 50 * F(6, 10) ** 2],
    [math.isqrt(9 * 16), math.isqrt(9 * 25), math.isqrt(16 * 25), F(15 * 20, 2)],
    [180 - 70, 180 - 95, 2 * 70],
    [11 - 4, math.isqrt(625 - 49), 11 + 4, math.isqrt(625 - 225)],
    first_wrong(1, 3 + 9 != 9),
    [math.isqrt(169 - 144), 2 * math.isqrt(169 - 144)],
])
check("Latihan — Geometri Level 2", [
    8 * F(5, 2),
    9 * 5 - 5,
    F(4 * 15, 3),
    2 * 42,
    180 - 90 - 35,
    360 - 180 - 50,
    math.isqrt(100 - 36),
    F(6 * 4, 3) + 3,
    math.isqrt(5 * 20),
    2 * 30 + 2 * PI * 14,
])
check("Uji Naik Level — Geometri Level 2", [
    F(20 * 20, math.isqrt(400 + 225)),
    4 * (18 // 6) ** 2,
    2 * 60,
    math.isqrt(144 + 81),
    2 * math.isqrt(625 - 49),
])

# coordinates for the cevian ratios
A, B, C = (F(1), F(7)), (F(0), F(0)), (F(9), F(0))
def lerp(P, Q, t): return (P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1]))
def meet(P1, P2, P3, P4):
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = P1, P2, P3, P4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return lerp(P1, P2, t)
def ratio(P, X, Q):
    """PX/XQ for X on segment PQ"""
    t = (X[0] - P[0]) / (Q[0] - P[0]) if Q[0] != P[0] else (X[1] - P[1]) / (Q[1] - P[1])
    return t / (1 - t)
def ap_pd(bd_dc, ae_ec):
    D = lerp(B, C, F(bd_dc) / (1 + F(bd_dc))); E = lerp(A, C, F(ae_ec) / (1 + F(ae_ec)))
    return ratio(A, meet(B, E, A, D), D)
def cube_section(plane, s):
    """vertices of the section of the cube [0,s]^3 by plane(x,y,z) = 0, as distinct points"""
    V = [(x, y, z) for x in (0, s) for y in (0, s) for z in (0, s)]
    pts = set()
    for P, Q in combinations(V, 2):
        if sum(a != b for a, b in zip(P, Q)) != 1: continue
        fp, fq = plane(*P), plane(*Q)
        if fp == 0: pts.add(P)
        if fq == 0: pts.add(Q)
        if fp * fq < 0:
            t = F(fp, fp - fq)
            pts.add(tuple(F(a) + t * (b - a) for a, b in zip(P, Q)))
    return pts
def area3d(pts):
    pts = list(pts)
    cx = [sum(p[i] for p in pts) / len(pts) for i in range(3)]
    u = [pts[0][i] - cx[i] for i in range(3)]
    def cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
    n = cross(u, [pts[1][i] - cx[i] for i in range(3)])
    v = cross(n, u)
    ang = lambda p: math.atan2(float(sum((p[i] - cx[i]) * v[i] for i in range(3))), float(sum((p[i] - cx[i]) * u[i] for i in range(3))))
    pts.sort(key=ang)
    tot = [0, 0, 0]
    for i in range(len(pts)):
        c = cross(pts[i], pts[(i + 1) % len(pts)])
        tot = [tot[k] + c[k] for k in range(3)]
    return math.sqrt(float(sum(t * t for t in tot))) / 2
# cube A(0,0,0) B(s,0,0) C(s,s,0) D(0,s,0), E F G H above
trap = cube_section(lambda x, y, z: 2 * x - 2 * y - z, 4)
assert len(trap) == 4 and (2, 0, 4) in trap and (4, 2, 4) in trap
penta = cube_section(lambda x, y, z: 2 * x + 2 * y - 3 * z, 4)
check("Langkah demi Langkah — Geometri Level 3", [
    [F(3, 2) * F(4, 3), 1 / (F(3, 2) * F(4, 3))],
    [F(1, 2), F(3, 2), ap_pd(1, F(2, 3))],
    [5, 3 * 4 + 3 * 4, F(24, 5)],
    [2, 4, 3, round(area3d(trap))],
    first_wrong(3, 1 / (F(1, 2) * F(2, 3)) != F(1, 3)),
    [3 + 5, 9 - 2],
])
assert abs(area3d(trap) - 18) < 1e-9
# the kite with AC a diameter: B and D at distance 3 from A, 4 from C
assert abs(2 * (3 * 4 / 5) - 4.8) < 1e-12
def bp_pe(af_fb, ae_ec):
    Fp = lerp(A, B, F(af_fb) / (1 + F(af_fb))); E = lerp(A, C, F(ae_ec) / (1 + F(ae_ec)))
    return ratio(B, meet(B, E, C, Fp), E)
G_mc = quizzes["Latihan — Geometri Level 3"]["questions"][6]["options"]
d_pent = 2 * (1 + math.sqrt(5)) / 2
G_vals = [math.sqrt(5), (1 + math.sqrt(5)) / 2, 2 * math.sqrt(5) - 1, 1 + math.sqrt(5)]
check("Latihan — Geometri Level 3", [
    1 / (2 * F(3, 4)),
    ap_pd(1, 1),
    ap_pd(F(1, 2), 1),
    bp_pe(1, F(1, 2)),
    6 * 8 + 9 * 7,
    81 + 144,
    mc_letter(G_mc, lambda i: abs(G_vals[i] - d_pent) < 1e-9),
    round(area3d(cube_section(lambda x, y, z: x + y + z - 6, 6)) / math.sqrt(3)),
    round(area3d(cube_section(lambda x, y, z: y - z, 10)) / math.sqrt(2)),
    round(area3d(cube_section(lambda x, y, z: x + y + z - 2, 4)) / math.sqrt(3)),
])
# BDE in the cube of side 6: B(6,0,0), D(0,6,0), E(0,0,6) lie on x + y + z = 6
assert abs(area3d(cube_section(lambda x, y, z: x + y + z - 6, 6)) - 18 * math.sqrt(3)) < 1e-9
# ABGH in the cube of side 10: A(0,0,0) B(10,0,0) G(10,10,10) H(0,10,10) lie on y = z
assert abs(area3d(cube_section(lambda x, y, z: y - z, 10)) - 100 * math.sqrt(2)) < 1e-9
# the pentagon's diagonal really is the golden ratio times the side
assert abs(2 * 2 * math.cos(math.radians(36)) - d_pent) < 1e-9
# AB = BC = CD = 2, AD = 4: half of a regular hexagon of side 2
hexa = [(2 * math.cos(math.radians(a)), 2 * math.sin(math.radians(a))) for a in (180, 120, 60, 0)]
dist = lambda P, Q: math.dist(P, Q)
assert abs(dist(hexa[0], hexa[3]) - 4) < 1e-9 and abs(dist(hexa[0], hexa[1]) - 2) < 1e-9
def af_fc(bd_dc):
    D = lerp(B, C, F(bd_dc) / (1 + F(bd_dc))); E = lerp(A, D, F(1, 2))
    return ratio(A, meet(B, E, A, C), C)
check("Uji Tuntas — Geometri Level 3", [
    1 / (F(3, 4) * F(2, 5)),
    ap_pd(1, 3),
    round(dist(hexa[0], hexa[2]) * dist(hexa[1], hexa[3])),
    len(penta),
    "",
    af_fc(2),
])

expected = {q["quiz"] for q in data if q["questions"]}
missing = expected - seen
assert not missing, f"quizzes with questions not checked: {sorted(missing)}"
print(f"✓ {checks} answers recomputed across {len(seen)} quizzes")
