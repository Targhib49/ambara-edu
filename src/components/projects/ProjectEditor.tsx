"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";

/**
 * One CodeMirror view for a multi-file project. Each file keeps its own
 * editor state — its text, cursor and undo history — and switching tabs swaps
 * the state in, the way an IDE does, rather than rebuilding the editor.
 *
 * The parent owns the file texts; this reports edits up and picks up texts
 * that change underneath it (a step adding a file, say).
 */
export function ProjectEditor({
  fileName,
  text,
  readOnly,
  onChange,
}: {
  fileName: string;
  text: string;
  readOnly: boolean;
  onChange: (fileName: string, text: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const statesRef = useRef(new Map<string, EditorState>());
  const onChangeRef = useRef(onChange);
  const currentFileRef = useRef(fileName);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Built per file. The update listener reads the file name from a ref, since
  // a state outlives the render that created it.
  const makeState = (name: string, doc: string, locked: boolean) =>
    EditorState.create({
      doc,
      extensions: [
        basicSetup,
        // Only Python gets highlighting; data files are plain text.
        ...(name.endsWith(".py") ? [python()] : []),
        EditorState.readOnly.of(locked),
        EditorView.editable.of(!locked),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(currentFileRef.current, update.state.doc.toString());
        }),
      ],
    });

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({ parent: hostRef.current, state: makeState(fileName, text, readOnly) });
    viewRef.current = view;
    const states = statesRef.current;
    return () => {
      view.destroy();
      states.clear();
    };
    // Created once; the effects below keep it in step with the props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching files: keep the outgoing file's state, bring in the next one's.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const previous = currentFileRef.current;
    if (previous !== fileName) {
      statesRef.current.set(previous, view.state);
      currentFileRef.current = fileName;
      const saved = statesRef.current.get(fileName);
      view.setState(saved && saved.doc.toString() === text ? saved : makeState(fileName, text, readOnly));
    } else if (view.state.doc.toString() !== text) {
      // The text changed from outside (not by typing here): replace it.
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName, text]);

  // Finishing the project locks every file.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    statesRef.current.clear();
    view.setState(makeState(currentFileRef.current, view.state.doc.toString(), readOnly));
  }, [readOnly]);

  return (
    <div
      ref={hostRef}
      className="h-full min-h-0 overflow-auto bg-white text-sm [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono"
    />
  );
}
