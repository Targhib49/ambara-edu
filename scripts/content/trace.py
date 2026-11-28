"""
Records a code_tracer visualization's steps by running the program for real.

    echo '{"code": "...", "stdin": "...", "notes": {"3": "..."}}' | python3 scripts/content/trace.py

Prints {"steps": [...], "output": "...", "error": null | "..."} as JSON. Each
step is the moment before a line runs: its line number, the variables right
then (name, repr) in the order they were created, and everything printed so
far. An if / elif / while line gets a note saying what its condition is at that
moment ("nilai >= 75 → True"); `notes` (by line number) replaces that note or
adds one to any other line. The last step has line 0: the program has finished.

input() reads `stdin` line by line and echoes what it read, the way a terminal
shows what was typed.
"""

import builtins
import io
import json
import re
import sys
import types

MAX_STEPS = 400
FILE = "<main>"
CONDITION = re.compile(r"^(if|elif|while)\s+(.+?):\s*(#.*)?$")


def main():
    spec = json.load(sys.stdin)
    code = spec["code"]
    stdin_lines = spec.get("stdin", "").splitlines()
    notes = {int(k): v for k, v in spec.get("notes", {}).items()}
    lines = code.split("\n")

    out = io.StringIO()
    steps = []
    order = []  # variable names in creation order

    def fake_input(prompt=""):
        out.write(str(prompt))
        if not stdin_lines:
            raise EOFError("EOF when reading a line")
        value = stdin_lines.pop(0)
        out.write(value + "\n")
        return value

    def show(value):
        if isinstance(value, types.FunctionType):
            return f"fungsi {value.__name__}()"
        return repr(value)

    def snapshot(frame):
        module = frame
        while module.f_back is not None and module.f_back.f_code.co_filename == FILE:
            module = module.f_back
        found = []
        for name, value in module.f_globals.items():
            if name.startswith("__") or isinstance(value, types.ModuleType):
                continue
            found.append((name, show(value)))
        if frame is not module:
            fn = frame.f_code.co_name
            for name, value in frame.f_locals.items():
                found.append((f"{fn} › {name}", show(value)))
        for name, _ in found:
            if name not in order:
                order.append(name)
        values = dict(found)
        return [[name, values[name]] for name in order if name in values]

    def auto_note(frame, lineno):
        text = lines[lineno - 1].strip()
        match = CONDITION.match(text)
        if not match or "input(" in match.group(2):
            return ""
        keyword, expr = match.group(1), match.group(2)
        try:
            value = bool(eval(expr, frame.f_globals, frame.f_locals))
        except Exception:
            return ""
        if keyword == "while":
            then = "isi loop dijalankan" if value else "loop selesai"
        elif value:
            then = "blok di bawahnya dijalankan"
        else:
            then = "blok di bawahnya dilewati"
        return f"Cek: {expr} → {value} — {then}."

    class TooLong(Exception):
        pass

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILE:
            return None
        if event == "line":
            if len(steps) >= MAX_STEPS:
                raise TooLong()
            lineno = frame.f_lineno
            note = notes.get(lineno) or auto_note(frame, lineno)
            steps.append({"line": lineno, "vars": snapshot(frame), "output": out.getvalue(), "note": note})
        return tracer

    env = {"__name__": "__main__", "__builtins__": builtins}
    compiled = compile(code, FILE, "exec")
    real_stdout, real_input = sys.stdout, builtins.input
    sys.stdout, builtins.input = out, fake_input
    error = None
    last_frame_vars = []
    try:
        sys.settrace(tracer)
        exec(compiled, env)
    except TooLong:
        error = f"more than {MAX_STEPS} steps"
    except Exception as e:  # the program's own error ends the trace
        error = f"{type(e).__name__}: {e}"
    finally:
        sys.settrace(None)
        sys.stdout, builtins.input = real_stdout, real_input

    # `else:` never gets a line event of its own, so say it on the first line of its block.
    def header_of(lineno):
        indent = len(lines[lineno - 1]) - len(lines[lineno - 1].lstrip())
        for i in range(lineno - 2, -1, -1):
            text = lines[i]
            if text.strip() and len(text) - len(text.lstrip()) < indent:
                return text.strip()
        return ""

    for before, step in zip(steps, steps[1:]):
        if step["note"] or not step["line"]:
            continue
        if header_of(step["line"]).startswith("else") and CONDITION.match(lines[before["line"] - 1].strip()):
            step["note"] = "Semua syarat di atasnya False, jadi blok else yang dijalankan."

    # A for line also has no note of its own (its next value isn't known yet), so
    # say on the following step which value the loop took, or that it finished.
    FOR = re.compile(r"^for\s+([A-Za-z_]\w*)\s+in\s+(.+?):\s*(#.*)?$")

    def indent_of(lineno):
        return len(lines[lineno - 1]) - len(lines[lineno - 1].lstrip())

    for before, step in zip(steps, steps[1:]):
        if step["note"] or not before["line"]:
            continue
        match = FOR.match(lines[before["line"] - 1].strip())
        if not match:
            # Back at a for line from its body: the next pass is about to start.
            if step["line"] and step["line"] < before["line"] and FOR.match(lines[step["line"] - 1].strip()):
                step["note"] = "Kembali ke baris for untuk mengambil nilai berikutnya."
            continue
        name = match.group(1)
        inside = step["line"] and step["line"] > before["line"] and indent_of(step["line"]) > indent_of(before["line"])
        if inside:
            value = next((v for n, v in step["vars"] if n == name), None)
            if value is not None:
                step["note"] = f"Putaran baru: {name} = {value}."
        else:
            step["note"] = f"Tidak ada nilai lagi di {match.group(2)} — loop for di baris {before['line']} selesai."

    final_vars = []
    for name in order:
        if name in env and "›" not in name:
            final_vars.append([name, show(env[name])])
    last_frame_vars = final_vars
    steps.append({"line": 0, "vars": last_frame_vars, "output": out.getvalue(), "note": f"Program berhenti karena error — {error}" if error else ""})
    json.dump({"steps": steps, "output": out.getvalue(), "error": error}, sys.stdout, ensure_ascii=False)


main()
