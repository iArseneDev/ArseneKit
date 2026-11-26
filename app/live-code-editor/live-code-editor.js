'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const EVENT_NAME = 'arsenekit-theme-change';

const STARTER = {
  html: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My First Page</title>\n</head>\n<body>\n  <main class="card">\n    <p class="eyebrow">YOUR FIRST PROJECT</p>\n    <h1>Hello, web.</h1>\n    <p>Edit the HTML, CSS, or JavaScript and see your changes here.</p>\n    <button id="hello-button">Try the button</button>\n  </main>\n</body>\n</html>',
  css: 'body {\n  min-height: 100vh;\n  margin: 0;\n  display: grid;\n  place-items: center;\n  background: #f1f5ed;\n  color: #1c291f;\n  font: 16px system-ui, sans-serif;\n}\n\n.card {\n  max-width: 440px;\n  padding: 40px;\n  border: 1px solid #dbe5d4;\n  border-radius: 20px;\n  background: white;\n  box-shadow: 0 18px 55px #27391b12;\n}\n\n.eyebrow {\n  color: #668544;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: .12em;\n}\n\nh1 { margin: 12px 0; font-size: 42px; letter-spacing: -.05em; }\np { line-height: 1.7; }\nbutton { padding: 11px 16px; border: 0; border-radius: 8px; background: #b9f36e; color: #24351f; font: inherit; font-weight: 700; cursor: pointer; }',
  javascript: "const button = document.querySelector('#hello-button');\n\nbutton.addEventListener('click', () => {\n  button.textContent = 'You made it work!';\n});",
};

const TABS = [
  { id: 'html', label: 'HTML', extension: html },
  { id: 'css', label: 'CSS', extension: css },
  { id: 'javascript', label: 'JavaScript', extension: javascript },
];

function createPreviewDocument(source) {
  let documentText = source.html.trim();
  const styleText = source.css.trim();
  const scriptText = source.javascript.trim().replace(/<\/script/gi, '<\\/script');

  if (!/<html[\s>]/i.test(documentText)) {
    documentText = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>' +
      documentText + '</body></html>';
  }

  const styleTag = styleText ? '<style>\n' + styleText + '\n</style>' : '';
  if (styleTag) {
    if (/<\/head>/i.test(documentText)) {
      documentText = documentText.replace(/<\/head>/i, styleTag + '</head>');
    } else if (/<html[\s>]/i.test(documentText)) {
      documentText = documentText.replace(/<html([^>]*)>/i, '<html$1><head>' + styleTag + '</head>');
    }
  }

  const scriptTag = scriptText ? '<script>\n' + scriptText + '\n</script>' : '';
  if (scriptTag) {
    if (/<\/body>/i.test(documentText)) {
      documentText = documentText.replace(/<\/body>/i, scriptTag + '</body>');
    } else if (/<\/html>/i.test(documentText)) {
      documentText = documentText.replace(/<\/html>/i, scriptTag + '</html>');
    } else {
      documentText += scriptTag;
    }
  }

  return documentText;
}

export default function LiveCodeEditor() {
  const hostRef = useRef(null);
  const previewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('html');
  const [snippets, setSnippets] = useState(STARTER);
  const [revision, setRevision] = useState(0);
  const [theme, setTheme] = useState('light');
  const [feedback, setFeedback] = useState('');
  const [previewState, setPreviewState] = useState('Ready');

  useEffect(() => {
    const readTheme = (event) => setTheme(event.detail || document.documentElement.dataset.theme || 'light');
    readTheme({});
    window.addEventListener(EVENT_NAME, readTheme);
    return () => window.removeEventListener(EVENT_NAME, readTheme);
  }, []);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const active = TABS.find((tab) => tab.id === activeTab);
    const extensions = [
      basicSetup,
      active.extension(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const text = update.state.doc.toString();
          setSnippets((current) => ({ ...current, [activeTab]: text }));
          setPreviewState('Editing');
        }
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '13px' },
        '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' },
      }),
    ];
    if (theme === 'dark') extensions.push(oneDark);

    const view = new EditorView({
      state: EditorState.create({ doc: snippets[activeTab], extensions }),
      parent: hostRef.current,
    });

    return () => view.destroy();
  }, [activeTab, revision, theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.srcdoc = createPreviewDocument(snippets);
        setPreviewState('Preview updated');
      }
    }, 320);
    return () => window.clearTimeout(timer);
  }, [snippets]);

  async function copyCurrentCode() {
    try {
      await navigator.clipboard.writeText(snippets[activeTab]);
      setFeedback(TABS.find((tab) => tab.id === activeTab).label + ' copied');
    } catch {
      setFeedback('Clipboard access is unavailable in this browser');
    }
    window.setTimeout(() => setFeedback(''), 2400);
  }

  function resetCode() {
    setSnippets({ ...STARTER });
    setRevision((current) => current + 1);
    setFeedback('Starter project restored');
    window.setTimeout(() => setFeedback(''), 2400);
  }

  function downloadProject() {
    const blob = new Blob([createPreviewDocument(snippets)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arsenekit-project.html';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function runNow() {
    if (previewRef.current) {
      previewRef.current.srcdoc = createPreviewDocument(snippets);
      setPreviewState('Preview updated');
    }
  }

  const lineCount = snippets[activeTab].split('\n').length;

  return (
    <div className="editor-page">
      <div className="breadcrumb"><a href="/">ArseneKit</a><span>/</span><span>Live Code Editor</span></div>
      <div className="editor-page-heading">
        <div>
          <p className="eyebrow section-eyebrow">DEVELOPMENT TOOL · FREE</p>
          <h1>Advanced Live Code Editor</h1>
          <p>Build a web page with syntax-highlighted HTML, CSS, and JavaScript. Your code runs in a private preview on this page.</p>
        </div>
        <a className="editor-maker-link" href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">
          Built by <strong>iArseneDev</strong> <span aria-hidden="true">↗</span>
        </a>
      </div>

      <section className="ide-shell" aria-label="Live code editor">
        <div className="ide-toolbar">
          <div className="ide-file-label"><span className="ide-live-dot" /> Untitled project</div>
          <div className="ide-actions">
            <button className="ide-button ide-button-quiet" type="button" onClick={copyCurrentCode}>Copy {TABS.find((tab) => tab.id === activeTab).label}</button>
            <button className="ide-button ide-button-quiet" type="button" onClick={resetCode}>Reset</button>
            <button className="ide-button ide-button-primary" type="button" onClick={runNow}><span aria-hidden="true">▶</span> Run preview</button>
            <button className="ide-button ide-button-download" type="button" onClick={downloadProject}>Download HTML <span aria-hidden="true">↓</span></button>
          </div>
        </div>

        <div className="ide-workspace">
          <div className="ide-code-pane">
            <div className="ide-pane-heading">
              <div className="language-tabs" role="tablist" aria-label="Code language">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={'language-tab' + (activeTab === tab.id ? ' is-active' : '')}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className={'language-dot language-dot-' + tab.id} aria-hidden="true" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="syntax-badge">SYNTAX HIGHLIGHTING</span>
            </div>
            <div className="code-host" ref={hostRef} aria-label={TABS.find((tab) => tab.id === activeTab).label + ' code editor'} />
            <div className="ide-statusbar">
              <span>{TABS.find((tab) => tab.id === activeTab).label}</span>
              <span>{lineCount} lines</span>
              <span className="ide-status-message" aria-live="polite">{feedback || previewState}</span>
            </div>
          </div>

          <div className="ide-preview-pane">
            <div className="ide-preview-heading">
              <div><span className="preview-status-dot" /><strong>Live preview</strong></div>
              <span className="preview-device-label">SANDBOXED</span>
            </div>
            <iframe
              ref={previewRef}
              className="preview-frame"
              title="Live code preview"
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
            />
            <div className="preview-footnote">Your preview runs in an isolated browser frame.</div>
          </div>
        </div>
      </section>

      <section className="editor-info">
        <h2>A code playground for quick experiments</h2>
        <p>Edit the three code panels, then run your page or download it as a standalone HTML file. CodeMirror provides syntax highlighting, line numbers, bracket matching, and editor shortcuts. The preview is sandboxed in your browser.</p>
      </section>
      <p className="tool-credit">A free developer tool by <a href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">iArseneDev ↗</a></p>
    </div>
  );
}
