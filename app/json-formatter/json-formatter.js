'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

const THEME_EVENT = 'arsenekit-theme-change';
const NOOP = () => {};
const EXAMPLE = '{\n  "project": "ArseneKit",\n  "tools": ["image-converter", "live-code-editor", "json-formatter"],\n  "isFree": true,\n  "creator": {\n    "name": "iArseneDev",\n    "github": "https://github.com/iArseneDev"\n  }\n}';

function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, sortObjectKeys(value[key])]),
    );
  }
  return value;
}

function locateJsonError(error, source) {
  const message = error instanceof Error ? error.message : 'Invalid JSON';
  const lineColumn = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (lineColumn) {
    return { message, line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  }

  const positionMatch = message.match(/position\s+(\d+)/i);
  const position = /end of JSON input/i.test(message)
    ? source.length
    : positionMatch
      ? Number(positionMatch[1])
      : 0;
  const beforeError = source.slice(0, position);
  const line = beforeError.split('\n').length;
  const lastLineStart = beforeError.lastIndexOf('\n');
  const column = position - lastLineStart;
  return { message, line, column };
}

function JsonCodePane({ value, onChange, readOnly, theme, revision, label }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const extensions = [
      basicSetup,
      json(),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        'aria-label': label,
        'aria-readonly': readOnly ? 'true' : 'false',
      }),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
    } else {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange(update.state.doc.toString());
        }),
      );
    }

    if (theme === 'dark') extensions.push(oneDark);

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: hostRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [label, onChange, readOnly, revision, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!readOnly || !view || view.state.doc.toString() === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [readOnly, value]);

  return <div className="json-code-host" ref={hostRef} aria-label={label} />;
}

export default function JsonFormatter() {
  const fileInputRef = useRef(null);
  const [input, setInput] = useState(EXAMPLE);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [theme, setTheme] = useState('light');
  const [inputRevision, setInputRevision] = useState(0);
  const [validation, setValidation] = useState(null);
  const [notice, setNotice] = useState('');
  const [filename, setFilename] = useState('');

  useEffect(() => {
    const syncTheme = (event) => setTheme(event.detail || document.documentElement.dataset.theme || 'light');
    syncTheme({});
    window.addEventListener(THEME_EVENT, syncTheme);
    return () => window.removeEventListener(THEME_EVENT, syncTheme);
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setValidation(null);
      return;
    }
    try {
      JSON.parse(input);
      setValidation({ ok: true });
    } catch (error) {
      setValidation({ ok: false, ...locateJsonError(error, input) });
    }
  }, [input]);

  function setSource(value, name = '') {
    setInput(value);
    setOutput('');
    setFilename(name);
    setInputRevision((current) => current + 1);
    setNotice('');
  }

  function parseSource() {
    try {
      const value = JSON.parse(input);
      return { value: sortKeys ? sortObjectKeys(value) : value, error: null };
    } catch (error) {
      return { value: null, error: locateJsonError(error, input) };
    }
  }

  function formatJson() {
    if (!input.trim()) {
      setValidation({ ok: false, message: 'Paste or open JSON to format it.', line: 1, column: 1 });
      setOutput('');
      return;
    }
    const parsed = parseSource();
    if (parsed.error) {
      setValidation({ ok: false, ...parsed.error });
      setOutput('');
      setNotice('');
      return;
    }
    const spacing = indent === 'tab' ? '\t' : Number(indent);
    setOutput(JSON.stringify(parsed.value, null, spacing));
    setValidation({ ok: true });
    setNotice('JSON formatted');
  }

  function minifyJson() {
    if (!input.trim()) {
      setValidation({ ok: false, message: 'Paste or open JSON to minify it.', line: 1, column: 1 });
      setOutput('');
      return;
    }
    const parsed = parseSource();
    if (parsed.error) {
      setValidation({ ok: false, ...parsed.error });
      setOutput('');
      setNotice('');
      return;
    }
    setOutput(JSON.stringify(parsed.value));
    setValidation({ ok: true });
    setNotice('JSON minified');
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setNotice('Copied to clipboard');
    } catch {
      setNotice('Clipboard access is unavailable in this browser');
    }
  }

  function downloadOutput() {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (filename.replace(/\.json$/i, '') || 'formatted') + '.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('JSON downloaded');
  }

  async function openFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setNotice('Choose a JSON file smaller than 10 MB.');
      event.target.value = '';
      return;
    }
    try {
      const contents = await file.text();
      setSource(contents, file.name);
      setNotice('Loaded ' + file.name);
    } catch {
      setNotice('This file could not be read.');
    }
    event.target.value = '';
  }

  function loadExample() {
    setSource(EXAMPLE);
    setValidation({ ok: true });
    setNotice('Example loaded');
  }

  function clearAll() {
    setSource('');
    setValidation(null);
    setNotice('');
  }

  const inputLines = input ? input.split('\n').length : 0;
  const outputLines = output ? output.split('\n').length : 0;

  return (
    <div className="json-page">
      <div className="breadcrumb"><a href="/">ArseneKit</a><span>/</span><span>JSON Formatter</span></div>
      <div className="json-heading">
        <div>
          <p className="eyebrow section-eyebrow">DEVELOPMENT TOOL · FREE</p>
          <h1>JSON Formatter &amp; Validator</h1>
          <p>Make JSON easier to read, validate its syntax, or minify it for production. Your data stays in your browser.</p>
        </div>
        <span className="privacy-chip"><span /> Runs locally</span>
      </div>

      <div className="json-options">
        <label className="json-option-label" htmlFor="json-indent">Indent</label>
        <select id="json-indent" value={indent} onChange={(event) => setIndent(event.target.value)}>
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tabs</option>
        </select>
        <label className="json-sort-option">
          <input type="checkbox" checked={sortKeys} onChange={(event) => setSortKeys(event.target.checked)} />
          <span>Sort object keys</span>
        </label>
        <span className={'json-validation-pill' + (validation ? (validation.ok ? ' is-valid' : ' is-invalid') : '')}>
          <span aria-hidden="true">{validation ? (validation.ok ? '✓' : '!') : '•'}</span>
          {validation ? (validation.ok ? 'Valid JSON' : 'Invalid JSON') : 'Waiting for JSON'}
        </span>
      </div>

      <div className="json-actions">
        <div className="json-primary-actions">
          <button className="button button-primary" type="button" onClick={formatJson}>Format JSON <span aria-hidden="true">↗</span></button>
          <button className="button json-secondary-button" type="button" onClick={minifyJson}>Minify</button>
        </div>
        <div className="json-secondary-actions">
          <input ref={fileInputRef} className="visually-hidden" type="file" accept=".json,application/json,text/json" onChange={openFile} />
          <button className="json-text-button" type="button" onClick={() => fileInputRef.current?.click()}>Open file</button>
          <button className="json-text-button" type="button" onClick={loadExample}>Load example</button>
          <button className="json-text-button" type="button" onClick={clearAll}>Clear</button>
        </div>
      </div>

      <div className="json-workspace">
        <section className="json-panel">
          <div className="json-panel-header">
            <div><span className="json-panel-dot input-dot" /><h2>Input</h2><span className="json-panel-type">JSON</span></div>
            <span className="json-panel-meta">{inputLines} {inputLines === 1 ? 'line' : 'lines'}</span>
          </div>
          <JsonCodePane
            value={input}
            onChange={setInput}
            readOnly={false}
            theme={theme}
            revision={inputRevision}
            label="JSON input editor"
          />
          <div className={'json-message' + (validation && !validation.ok ? ' json-message-error' : '')} role="status" aria-live="polite">
            {validation && !validation.ok
              ? (validation.line ? 'Line ' + validation.line + ', column ' + validation.column + ': ' : '') + validation.message
              : (filename ? 'Loaded from ' + filename : 'Paste JSON here or open a .json file.')}
          </div>
        </section>

        <section className="json-panel">
          <div className="json-panel-header">
            <div><span className="json-panel-dot output-dot" /><h2>Output</h2><span className="json-panel-type">JSON</span></div>
            <div className="json-output-actions">
              <span className="json-panel-meta">{output ? outputLines + (outputLines === 1 ? ' line' : ' lines') : 'Ready'}</span>
              <button className="json-icon-button" type="button" onClick={copyOutput} disabled={!output} aria-label="Copy formatted JSON" title="Copy output">Copy</button>
              <button className="json-icon-button" type="button" onClick={downloadOutput} disabled={!output} aria-label="Download JSON" title="Download JSON">↓</button>
            </div>
          </div>
          <JsonCodePane
            value={output}
            onChange={NOOP}
            readOnly
            theme={theme}
            revision={0}
            label="Formatted JSON output"
          />
          <div className="json-message">{notice || (output ? 'Formatted output is ready.' : 'Your formatted JSON will appear here.')}</div>
        </section>
      </div>

      <section className="json-info">
        <h2>Format and validate JSON in your browser</h2>
        <p>Paste JSON or open a local .json file. Format it with your preferred indentation, sort object keys when needed, or minify it to remove whitespace. Syntax errors are reported with a line and column so you can find the problem quickly.</p>
        <p>Input is processed on this device and is not uploaded. For quick experiments with HTML, CSS, and JavaScript, try the <a href="/live-code-editor/">Live Code Editor</a>.</p>
      </section>
      <p className="tool-credit">A free developer tool by <a href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">iArseneDev ↗</a></p>
    </div>
  );
}
