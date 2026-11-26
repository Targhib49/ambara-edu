"""Rewrite raw Tailwind palette classes (zinc, blue, amber, red, green) to the
design tokens in src/app/globals.css, for moving a screen onto the tokens.
Usage: python3 scripts/tokenize-classes.py [--dry] <file>...
Prints how many classes each file had replaced and any palette class it left
(no token matches it — map those by hand). Review the diff afterwards."""
import re, sys
MAP = {
  # (utility, colour) -> token
  ("bg","white"):"surface", ("bg","zinc-50"):"surface-muted", ("bg","zinc-100"):"surface-sunken",
  ("border","zinc-100"):"line-soft", ("divide","zinc-100"):"line-soft",
  ("border","zinc-200"):"line", ("divide","zinc-200"):"line", ("border","zinc-300"):"line-strong",
  ("text","zinc-900"):"ink", ("text","zinc-800"):"ink", ("text","zinc-700"):"ink-soft",
  ("text","zinc-600"):"ink-muted", ("text","zinc-500"):"ink-subtle", ("text","zinc-400"):"ink-faint",
  ("placeholder","zinc-400"):"ink-faint",
  ("bg","blue-600"):"brand", ("bg","blue-500"):"brand-hover", ("text","blue-700"):"brand-ink", ("text","blue-600"):"brand-ink",
  ("bg","blue-50"):"brand-soft", ("border","blue-200"):"brand-line", ("border","blue-600"):"brand",
  ("border","blue-500"):"focus", ("ring","blue-500"):"focus", ("border","blue-400"):"focus",
  ("text","amber-700"):"warning-ink", ("text","amber-800"):"warning-ink", ("text","amber-900"):"warning-ink",
  ("bg","amber-100"):"warning-soft", ("bg","amber-50"):"warning-wash", ("border","amber-200"):"warning-line",
  ("text","red-700"):"danger-ink", ("text","red-600"):"danger", ("bg","red-50"):"danger-wash", ("bg","red-100"):"danger-soft", ("border","red-200"):"danger-line",
  ("text","green-700"):"success-ink", ("text","green-800"):"success-ink", ("text","green-600"):"success-ink",
  ("bg","green-100"):"success-soft", ("bg","green-50"):"success-wash", ("border","green-200"):"success-line",
}
pat = re.compile(r'(?<![\w-])((?:[a-z-]+:)*)(bg|text|border|divide|ring|placeholder)-(white|(?:zinc|blue|amber|red|green)-\d+)(/\d+)?(?![\w-])')
dry = sys.argv[1] == "--dry"
files = sys.argv[2:] if dry else sys.argv[1:]
for f in files:
    s = open(f).read(); n = 0
    def sub(m):
        global n
        tok = MAP.get((m.group(2), m.group(3)))
        if not tok: return m.group(0)
        n += 1
        return f"{m.group(1)}{m.group(2)}-{tok}{m.group(4) or ''}"
    out = pat.sub(sub, s)
    left = sorted(set(m.group(0) for m in pat.finditer(out) if not m.group(0).split(':')[-1].startswith(('bg-surface','text-ink'))))
    left = [l for l in left if re.search(r'(white|zinc|blue|amber|red|green)-?\d*', l.split('-',1)[1])]
    print(f"{f}: {n} replaced; left: {left}")
    if not dry: open(f,'w').write(out)
