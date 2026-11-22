"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PAGE_H,
  PAGE_W,
  mergeDocs,
  newId,
  roundPoint,
  type BoardDoc,
  type BoardEvent,
  type BoardMessage,
  type Point,
  type PresenceState,
  type Stroke,
  type Tool,
} from "@/lib/board/doc";
import { NO_PRESSURE, StrokeCache, drawBackground, drawStroke, hitsStroke } from "./strokes";
import { useT } from "@/lib/i18n/client";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, PlusIcon } from "@/components/ui/icons";

type Me = { id: string; name: string; role: "TUTOR" | "STUDENT" };
type ActiveTool = Tool | "eraser";
/** Undo/redo step: remove these strokes, re-add copies of those. Applying one returns its inverse. */
type HistoryEntry = { remove: string[]; add: Stroke[] };
type SaveState = "saved" | "unsaved" | "saving" | "error";
type Connection = "connecting" | "live" | "offline";

const COLORS = ["#18181b", "#2563eb", "#dc2626", "#16a34a", "#ea580c", "#9333ea", "#facc15"];
const SIZES: Record<Tool, number[]> = { pen: [3, 6, 12], highlighter: [18, 30, 48] };
const ERASER_RADIUS = 14;
/** How often an in-progress stroke's new points go out: smooth enough to watch, few enough messages. */
const POINT_FLUSH_MS = 50;
const CURSOR_THROTTLE_MS = 100;
const SAVE_DEBOUNCE_MS = 2000;
const CURSOR_STALE_MS = 5000;

export function LiveBoard({
  sessionId,
  me,
  initialDoc,
  title,
  subtitle,
  backHref,
}: {
  sessionId: string;
  me: Me;
  initialDoc: BoardDoc;
  title: string;
  subtitle: string;
  backHref: string;
}) {
  const t = useT();
  const myColor = me.role === "TUTOR" ? "#dc2626" : "#2563eb";

  // The document lives in a ref: strokes change dozens of times a second and
  // React state would re-render the whole toolbar for each point.
  const docRef = useRef<BoardDoc>(structuredClone(initialDoc));
  const cacheRef = useRef(new StrokeCache());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const liveRef = useRef(false);
  const dirtyRef = useRef(true);
  const viewRef = useRef({ scale: 1, dpr: 1 });

  const [pageId, setPageIdState] = useState(initialDoc.pages[0]);
  const pageRef = useRef(pageId);
  const [pages, setPages] = useState(initialDoc.pages);
  const [tool, setTool] = useState<ActiveTool>("pen");
  const [color, setColor] = useState(myColor);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [connection, setConnection] = useState<Connection>("connecting");
  const [others, setOthers] = useState<PresenceState[]>([]);
  // Students follow the tutor's page until they turn a page themselves.
  const [following, setFollowing] = useState(me.role === "STUDENT");
  const followingRef = useRef(following);
  const tutorPageRef = useRef<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const undoRef = useRef<HistoryEntry[]>([]);
  const redoRef = useRef<HistoryEntry[]>([]);
  const cursorsRef = useRef(new Map<string, { page: string; x: number; y: number; at: number }>());
  const othersRef = useRef<PresenceState[]>([]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  // --- sending -------------------------------------------------------------

  const send = useCallback(
    (event: BoardEvent) => {
      const channel = channelRef.current;
      // Before the channel is joined, send() would fall back to an HTTP call per
      // message; drop instead — the save and the sync on join carry the work.
      if (!channel || !liveRef.current) return;
      const message: BoardMessage = { ...event, from: me.id };
      void channel.send({ type: "broadcast", event: "b", payload: message });
    },
    [me.id]
  );

  // --- saving --------------------------------------------------------------

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef<Promise<void> | null>(null);
  const unsavedRef = useRef(false);

  const saveNow = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    // One save at a time; a change made mid-save is picked up by the next one.
    while (savingRef.current) await savingRef.current;
    unsavedRef.current = false;
    setSaveState("saving");
    const run = (async () => {
      try {
        const res = await fetch(`/api/board/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docRef.current),
        });
        if (!res.ok) throw new Error(String(res.status));
        setSaveState(unsavedRef.current ? "unsaved" : "saved");
      } catch {
        unsavedRef.current = true;
        setSaveState("error");
      }
    })();
    savingRef.current = run;
    await run;
    savingRef.current = null;
  }, [sessionId]);

  const saveSoon = useCallback(() => {
    unsavedRef.current = true;
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveNow(), SAVE_DEBOUNCE_MS);
  }, [saveNow]);

  const reloadAndMerge = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/${sessionId}`, { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { doc: BoardDoc | null };
      if (!body.doc) return;
      docRef.current = mergeDocs(docRef.current, body.doc);
      setPages([...docRef.current.pages]);
      markDirty();
    } catch {
      // Offline: the next sync on reconnect tries again.
    }
  }, [sessionId, markDirty]);

  // --- doc mutations -------------------------------------------------------

  const removeStrokes = useCallback((ids: string[]) => {
    const doc = docRef.current;
    const removed: Stroke[] = [];
    for (const id of ids) {
      const s = doc.strokes[id];
      if (s) removed.push(s);
      delete doc.strokes[id];
      if (!doc.deleted.includes(id)) doc.deleted.push(id);
      cacheRef.current.forget(id);
    }
    dirtyRef.current = true;
    return removed;
  }, []);

  const addStrokes = useCallback((strokes: Stroke[]) => {
    const doc = docRef.current;
    for (const s of strokes) {
      if (doc.deleted.includes(s.id)) continue;
      doc.strokes[s.id] = s;
    }
    dirtyRef.current = true;
  }, []);

  const applyHistory = useCallback(
    (entry: HistoryEntry): HistoryEntry => {
      const removed = removeStrokes(entry.remove);
      // Re-added strokes get new ids: the old ones are tombstoned for good, which
      // is what keeps every merge a plain union.
      const copies = entry.add.map((s) => ({ ...s, id: newId(), points: s.points.slice() }));
      addStrokes(copies);
      if (entry.remove.length) send({ type: "erase", ids: entry.remove });
      if (copies.length) send({ type: "add-strokes", strokes: copies });
      saveSoon();
      return { remove: copies.map((s) => s.id), add: removed };
    },
    [removeStrokes, addStrokes, send, saveSoon]
  );

  const pushHistory = useCallback((entry: HistoryEntry) => {
    undoRef.current.push(entry);
    if (undoRef.current.length > 200) undoRef.current.shift();
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const entry = undoRef.current.pop();
    if (!entry) return;
    redoRef.current.push(applyHistory(entry));
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(true);
  }, [applyHistory]);

  const redo = useCallback(() => {
    const entry = redoRef.current.pop();
    if (!entry) return;
    undoRef.current.push(applyHistory(entry));
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
  }, [applyHistory]);

  // --- pages ---------------------------------------------------------------

  const goToPage = useCallback(
    (id: string, opts: { broadcast: boolean }) => {
      pageRef.current = id;
      setPageIdState(id);
      dirtyRef.current = true;
      if (opts.broadcast && me.role === "TUTOR") send({ type: "page-go", id });
    },
    [me.role, send]
  );

  const userTurnsPage = useCallback(
    (id: string) => {
      if (me.role === "STUDENT" && followingRef.current) {
        followingRef.current = false;
        setFollowing(false);
      }
      goToPage(id, { broadcast: true });
    },
    [me.role, goToPage]
  );

  const addPage = useCallback(() => {
    const doc = docRef.current;
    const id = newId();
    const at = doc.pages.indexOf(pageRef.current);
    doc.pages.splice(at + 1, 0, id);
    setPages([...doc.pages]);
    send({ type: "page-add", id, after: pageRef.current });
    saveSoon();
    userTurnsPage(id);
  }, [send, saveSoon, userTurnsPage]);

  const follow = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    const target = tutorPageRef.current;
    if (target && docRef.current.pages.includes(target)) goToPage(target, { broadcast: false });
  }, [goToPage]);

  const clearPage = useCallback(() => {
    const ids = Object.values(docRef.current.strokes)
      .filter((s) => s.page === pageRef.current)
      .map((s) => s.id);
    setConfirmClear(false);
    if (ids.length === 0) return;
    const removed = removeStrokes(ids);
    send({ type: "erase", ids });
    pushHistory({ remove: [], add: removed });
    saveSoon();
  }, [removeStrokes, send, pushHistory, saveSoon]);

  // --- incoming ------------------------------------------------------------

  const handleMessage = useCallback(
    (msg: BoardMessage) => {
      const doc = docRef.current;
      switch (msg.type) {
        case "stroke-begin":
          addStrokes([msg.stroke]);
          break;
        case "stroke-points": {
          const s = doc.strokes[msg.id];
          if (s) {
            s.points.push(...msg.points);
            dirtyRef.current = true;
          }
          break;
        }
        case "add-strokes":
          addStrokes(msg.strokes);
          break;
        case "erase":
          removeStrokes(msg.ids);
          break;
        case "page-add":
          if (!doc.pages.includes(msg.id)) {
            const at = msg.after ? doc.pages.indexOf(msg.after) : -1;
            if (at === -1) doc.pages.push(msg.id);
            else doc.pages.splice(at + 1, 0, msg.id);
            setPages([...doc.pages]);
          }
          break;
        case "page-go":
          tutorPageRef.current = msg.id;
          if (!doc.pages.includes(msg.id)) doc.pages.push(msg.id);
          setPages([...doc.pages]);
          if (followingRef.current) goToPage(msg.id, { broadcast: false });
          break;
        case "cursor":
          cursorsRef.current.set(msg.from, { page: msg.page, x: msg.x, y: msg.y, at: Date.now() });
          dirtyRef.current = true;
          break;
        case "cursor-leave":
          cursorsRef.current.delete(msg.from);
          dirtyRef.current = true;
          break;
        case "sync-request":
          // Someone (re)joined: put our work where they can read it, take theirs.
          void (async () => {
            await saveNow();
            await reloadAndMerge();
            send({ type: "saved" });
            if (me.role === "TUTOR") send({ type: "page-go", id: pageRef.current });
          })();
          break;
        case "saved":
          void reloadAndMerge();
          break;
      }
    },
    [addStrokes, removeStrokes, goToPage, saveNow, reloadAndMerge, send, me.role]
  );

  // --- channel -------------------------------------------------------------

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    void (async () => {
      // Private channel: Realtime checks the board policy against this token.
      await supabase.realtime.setAuth();
      if (cancelled) return;
      channel = supabase.channel(`board:${sessionId}`, {
        config: { private: true, broadcast: { self: false }, presence: { key: me.id } },
      });
      channelRef.current = channel;
      channel
        .on("broadcast", { event: "b" }, ({ payload }) => handleMessage(payload as BoardMessage))
        .on("presence", { event: "sync" }, () => {
          const state = channel!.presenceState<PresenceState>();
          const list = Object.values(state)
            .map((entries) => entries[0])
            .filter((p): p is PresenceState & { presence_ref: string } => !!p && p.userId !== me.id);
          othersRef.current = list;
          setOthers(list);
          // Drop the cursors of anyone who left.
          for (const id of cursorsRef.current.keys()) {
            if (!list.some((p) => p.userId === id)) cursorsRef.current.delete(id);
          }
          dirtyRef.current = true;
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            liveRef.current = true;
            setConnection("live");
            await channel!.track({ userId: me.id, name: me.name, role: me.role, color: myColor } satisfies PresenceState);
            // Catch up on anything drawn while we were away, and share ours.
            await saveNow();
            send({ type: "sync-request" });
            if (me.role === "TUTOR") send({ type: "page-go", id: pageRef.current });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            liveRef.current = false;
            setConnection(status === "CLOSED" && cancelled ? "connecting" : "offline");
          }
        });
    })();

    return () => {
      cancelled = true;
      liveRef.current = false;
      if (channel) void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, me.id, me.name, me.role, myColor, handleMessage, saveNow, send]);

  // Save on the way out. keepalive lets the request outlive the page.
  useEffect(() => {
    const flush = () => {
      if (!unsavedRef.current) return;
      void fetch(`/api/board/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docRef.current),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [sessionId]);

  // --- layout & rendering ----------------------------------------------------

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const fit = () => {
      const pad = 16;
      const availW = Math.max(100, wrap.clientWidth - pad * 2);
      const availH = Math.max(100, wrap.clientHeight - pad * 2);
      const scale = Math.min(availW / PAGE_W, availH / PAGE_H);
      setCanvasSize({ w: Math.floor(PAGE_W * scale), h: Math.floor(PAGE_H * scale) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.w * dpr);
    canvas.height = Math.round(canvasSize.h * dpr);
    viewRef.current = { scale: canvasSize.w / PAGE_W, dpr };
    dirtyRef.current = true;
  }, [canvasSize]);

  useEffect(() => {
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const canvas = canvasRef.current;
      const now = Date.now();
      // Let stale cursors fade out even when nothing else changes.
      for (const [id, c] of cursorsRef.current) {
        if (now - c.at > CURSOR_STALE_MS) {
          cursorsRef.current.delete(id);
          dirtyRef.current = true;
        }
      }
      if (!canvas || !dirtyRef.current) return;
      dirtyRef.current = false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { scale, dpr } = viewRef.current;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      drawBackground(ctx);
      const page = pageRef.current;
      for (const s of Object.values(docRef.current.strokes)) {
        if (s.page === page) drawStroke(ctx, cacheRef.current, s);
      }
      for (const [id, c] of cursorsRef.current) {
        if (c.page !== page) continue;
        const who = othersRef.current.find((p) => p.userId === id);
        if (!who) continue;
        ctx.fillStyle = who.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "600 20px system-ui, sans-serif";
        const label = who.name.split(" ")[0];
        const w = ctx.measureText(label).width;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(c.x + 12, c.y + 8, w + 14, 28);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, c.x + 19, c.y + 29);
      }
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- input -----------------------------------------------------------------

  const drawingRef = useRef<{ pointerId: number; stroke: Stroke | null; pending: Point[]; erased: Stroke[]; erasing: boolean } | null>(null);
  const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const penSeenRef = useRef(false);
  const lastCursorAt = useRef(0);

  const toPage = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * PAGE_W, y: ((e.clientY - rect.top) / rect.height) * PAGE_H };
  };

  const flushPoints = useCallback(() => {
    const d = drawingRef.current;
    if (!d || !d.stroke || d.pending.length === 0) return;
    send({ type: "stroke-points", id: d.stroke.id, points: d.pending });
    d.pending = [];
  }, [send]);

  const eraseAt = (x: number, y: number) => {
    const d = drawingRef.current;
    if (!d) return;
    const hit = Object.values(docRef.current.strokes).filter(
      (s) => s.page === pageRef.current && hitsStroke(s, x, y, ERASER_RADIUS)
    );
    if (hit.length === 0) return;
    const ids = hit.map((s) => s.id);
    d.erased.push(...removeStrokes(ids));
    send({ type: "erase", ids });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "pen") penSeenRef.current = true;
    // Palm rejection: once a pen has been used, fingers don't draw.
    if (e.pointerType === "touch" && penSeenRef.current) return;
    if (drawingRef.current) return;
    if (e.button !== 0 && e.button !== 5) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toPage(e);
    // The pen's eraser end (or its barrel button) erases whatever tool is picked.
    const erasing = tool === "eraser" || e.button === 5 || (e.buttons & 32) !== 0;
    if (erasing) {
      drawingRef.current = { pointerId: e.pointerId, stroke: null, pending: [], erased: [], erasing: true };
      eraseAt(x, y);
      return;
    }
    const activeTool: Tool = tool === "highlighter" ? "highlighter" : "pen";
    const pressure = e.pointerType === "pen" ? e.pressure || NO_PRESSURE : NO_PRESSURE;
    const stroke: Stroke = {
      id: newId(),
      page: pageRef.current,
      author: me.id,
      tool: activeTool,
      color,
      size: SIZES[activeTool][sizeIdx],
      points: [roundPoint(x, y, pressure)],
    };
    addStrokes([stroke]);
    send({ type: "stroke-begin", stroke: { ...stroke, points: stroke.points.slice() } });
    drawingRef.current = { pointerId: e.pointerId, stroke, pending: [], erased: [], erasing: false };
    if (flushTimer.current) clearInterval(flushTimer.current);
    flushTimer.current = setInterval(flushPoints, POINT_FLUSH_MS);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drawingRef.current;
    if (!d || d.pointerId !== e.pointerId) {
      // Not drawing: share where we're pointing, so "this one here" makes sense.
      if (e.pointerType === "touch") return;
      const now = Date.now();
      if (now - lastCursorAt.current < CURSOR_THROTTLE_MS) return;
      lastCursorAt.current = now;
      const { x, y } = toPage(e);
      send({ type: "cursor", page: pageRef.current, x: Math.round(x), y: Math.round(y) });
      return;
    }
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const { x, y } = toPage(ev);
      if (d.erasing) {
        eraseAt(x, y);
        continue;
      }
      const pressure = ev.pointerType === "pen" ? ev.pressure || NO_PRESSURE : NO_PRESSURE;
      const point = roundPoint(x, y, pressure);
      d.stroke!.points.push(point);
      d.pending.push(point);
    }
    markDirty();
  };

  const endStroke = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drawingRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (flushTimer.current) {
      clearInterval(flushTimer.current);
      flushTimer.current = null;
    }
    flushPoints();
    drawingRef.current = null;
    if (d.erasing) {
      if (d.erased.length) {
        pushHistory({ remove: [], add: d.erased });
        saveSoon();
      }
      return;
    }
    pushHistory({ remove: [d.stroke!.id], add: [] });
    saveSoon();
  };

  const onPointerLeave = () => {
    if (!drawingRef.current) send({ type: "cursor-leave" });
  };

  // Keyboard: undo/redo and tool letters.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (!mod && !e.altKey) {
        if (e.key === "p") setTool("pen");
        else if (e.key === "h") setTool("highlighter");
        else if (e.key === "e") setTool("eraser");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const download = () => {
    const out = document.createElement("canvas");
    out.width = PAGE_W;
    out.height = PAGE_H;
    const ctx = out.getContext("2d")!;
    drawBackground(ctx);
    for (const s of Object.values(docRef.current.strokes)) {
      if (s.page === pageRef.current) drawStroke(ctx, cacheRef.current, s);
    }
    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `board-page-${docRef.current.pages.indexOf(pageRef.current) + 1}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  };

  // --- view ------------------------------------------------------------------

  const pageIndex = Math.max(0, pages.indexOf(pageId));
  const toolSizes = tool === "highlighter" ? SIZES.highlighter : SIZES.pen;
  const tutorHere = others.some((p) => p.role === "TUTOR");

  return (
    <div className="flex h-dvh w-full flex-col bg-zinc-100">
      <header className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 border-b border-zinc-200 bg-white px-3 py-1.5">
        <Link
          href={backHref}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          aria-label={t("board.back")}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900">{title}</p>
          <p className="truncate text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge connection={connection} saveState={saveState} />
          <div className="flex -space-x-1.5">
            {[{ userId: me.id, name: me.name, role: me.role, color: myColor }, ...others].map((p) => (
              <span
                key={p.userId}
                title={p.userId === me.id ? t("board.you") : p.name}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-white ${badgeColorForKey(p.name)}`}
              >
                {initialsFor(p.name)}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            style={{ width: canvasSize.w, height: canvasSize.h, touchAction: "none" }}
            className={`rounded-sm bg-white shadow-md ring-1 ring-zinc-200 ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onPointerLeave={onPointerLeave}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        {others.length === 0 && connection === "live" && (
          <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200">
            {me.role === "TUTOR" ? t("board.waitingStudent") : t("board.waitingTutor")}
          </p>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
          <ToolButton active={tool === "pen"} label={t("board.pen")} onClick={() => setTool("pen")}>
            <PenIcon />
          </ToolButton>
          <ToolButton active={tool === "highlighter"} label={t("board.highlighter")} onClick={() => setTool("highlighter")}>
            <HighlighterIcon />
          </ToolButton>
          <ToolButton active={tool === "eraser"} label={t("board.eraser")} onClick={() => setTool("eraser")}>
            <EraserIcon />
          </ToolButton>
        </div>

        <div className={`flex items-center gap-1 ${tool === "eraser" ? "opacity-40" : ""}`}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("pen");
              }}
              className={`h-7 w-7 rounded-full ring-offset-2 transition ${color === c && tool !== "eraser" ? "ring-2 ring-zinc-900" : "ring-1 ring-zinc-200"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className={`flex items-center gap-0.5 rounded-lg bg-zinc-100 p-1 ${tool === "eraser" ? "opacity-40" : ""}`}>
          {toolSizes.map((size, i) => (
            <button
              key={size}
              type="button"
              aria-label={t("board.size", { n: i + 1 })}
              onClick={() => {
                setSizeIdx(i);
                if (tool === "eraser") setTool("pen");
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-md ${sizeIdx === i && tool !== "eraser" ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
            >
              <span className="rounded-full bg-zinc-800" style={{ width: 4 + i * 4, height: 4 + i * 4 }} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ToolButton label={t("board.undo")} disabled={!canUndo} onClick={undo}>
            <UndoIcon />
          </ToolButton>
          <ToolButton label={t("board.redo")} disabled={!canRedo} onClick={redo}>
            <UndoIcon flip />
          </ToolButton>
          {confirmClear ? (
            <span className="flex items-center gap-1">
              <button type="button" onClick={clearPage} className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500">
                {t("board.clearConfirm")}
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="rounded-md px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100">
                {t("action.cancel")}
              </button>
            </span>
          ) : (
            <ToolButton label={t("board.clear")} onClick={() => setConfirmClear(true)}>
              <TrashIcon />
            </ToolButton>
          )}
          <ToolButton label={t("board.download")} onClick={download}>
            <DownloadIcon className="h-5 w-5" />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
          <ToolButton label={t("board.prevPage")} disabled={pageIndex === 0} onClick={() => userTurnsPage(pages[pageIndex - 1])}>
            <ChevronLeftIcon className="h-5 w-5" />
          </ToolButton>
          <span className="min-w-12 text-center text-xs font-medium tabular-nums text-zinc-700">
            {pageIndex + 1} / {pages.length}
          </span>
          <ToolButton
            label={t("board.nextPage")}
            disabled={pageIndex >= pages.length - 1}
            onClick={() => userTurnsPage(pages[pageIndex + 1])}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </ToolButton>
          <ToolButton label={t("board.addPage")} onClick={addPage}>
            <PlusIcon className="h-5 w-5" />
          </ToolButton>
        </div>

        {me.role === "STUDENT" && tutorHere && !following && (
          <button
            type="button"
            onClick={follow}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            {t("board.followTutor")}
          </button>
        )}
      </footer>
    </div>
  );
}

function ConnectionBadge({ connection, saveState }: { connection: Connection; saveState: SaveState }) {
  const t = useT();
  const [dot, label] =
    connection === "offline"
      ? ["bg-red-500", t("board.offline")]
      : connection === "connecting"
        ? ["bg-amber-400", t("board.connecting")]
        : saveState === "error"
          ? ["bg-red-500", t("board.saveFailed")]
          : saveState === "saved"
            ? ["bg-emerald-500", t("board.saved")]
            : ["bg-emerald-500", t("board.saving")];
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function ToolButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 disabled:opacity-30 ${
        active ? "bg-white text-blue-600 shadow-sm" : "hover:bg-zinc-200/70"
      }`}
    >
      {children}
    </button>
  );
}

const iconCls = "h-5 w-5 fill-none stroke-current";

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1.2-4.6L16.5 4.1a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8 4 20Z" />
      <path d="M14.5 6.1l3.4 3.4" />
    </svg>
  );
}

function HighlighterIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14l-3 3v3h3l3-3" />
      <path d="M9 14l7.5-7.5a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L12 17l-3-3Z" />
      <path d="M3 21h7" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 20H20" />
      <path d="M4.6 15.4l9.9-9.9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8.2l-3.6-3.6Z" />
      <path d="M9.5 10.5l5 5" />
    </svg>
  );
}

function UndoIcon({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconCls}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
