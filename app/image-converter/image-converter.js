'use client';

import { useEffect, useRef, useState } from 'react';

const formats = [
  { mime: 'image/webp', label: 'WebP', extension: 'webp' },
  { mime: 'image/jpeg', label: 'JPG', extension: 'jpg' },
  { mime: 'image/png', label: 'PNG', extension: 'png' },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function safeBaseName(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'image';
}

export default function ImageConverter() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(85);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1920);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result]);

  function chooseFile(nextFile) {
    setError('');
    setResult(null);
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setError('Choose an image file to continue.');
      return;
    }
    setFile(nextFile);
  }

  function clearFile() {
    setFile(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function convertImage() {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);

    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      setBusy(false);
      setError('This image could not be opened by your browser. Try a PNG, JPG, or WebP image.');
    };
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      try {
        const limitW = Math.max(1, Number(maxWidth) || image.naturalWidth);
        const limitH = Math.max(1, Number(maxHeight) || image.naturalHeight);
        const scale = Math.min(1, limitW / image.naturalWidth, limitH / image.naturalHeight);
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          setBusy(false);
          setError('Your browser could not start the image converter.');
          return;
        }
        if (format === 'image/jpeg') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          setBusy(false);
          if (!blob || blob.type !== format) {
            setError('This browser could not create that format. Try PNG or JPG.');
            return;
          }
          const selectedFormat = formats.find((item) => item.mime === format);
          setResult({ blob, url: URL.createObjectURL(blob), width, height, selectedFormat });
        }, format, Number(quality) / 100);
      } catch {
        setBusy(false);
        setError('The image could not be converted. Try another image or a smaller file.');
      }
    };
    image.src = sourceUrl;
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="converter-page">
      <div className="breadcrumb"><a href="/">ArseneKit</a><span>/</span><span>Image Converter</span></div>
      <div className="converter-heading">
        <div>
          <p className="eyebrow section-eyebrow">IMAGE TOOL · FREE</p>
          <h1>Image Converter</h1>
          <p className="converter-intro">Change image formats and resize to the dimensions you need. Your image is processed on your device.</p>
        </div>
        <span className="privacy-chip"><span /> Stays on your device</span>
      </div>

      <div className="converter-layout">
        <section className="workspace-panel" aria-label="Image upload and preview">
          {!file ? (
            <div
              className={`drop-zone${dragging ? ' is-dragging' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                className="visually-hidden"
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              <span className="upload-icon" aria-hidden="true">↑</span>
              <h2>Drop an image here</h2>
              <p>or choose a file from your device</p>
              <label className="button button-dark" htmlFor="image-file">Choose image</label>
              <span className="upload-hint">PNG, JPG, WebP, GIF and other browser-supported images</span>
            </div>
          ) : (
            <div className="image-preview-wrap">
              <div className="preview-toolbar">
                <span>PREVIEW</span>
                <button className="text-button" type="button" onClick={clearFile}>Remove image</button>
              </div>
              <div className="image-preview">
                {previewUrl && <img src={previewUrl} alt={`Preview of ${file.name}`} />}
              </div>
              <div className="file-details">
                <span className="file-type-icon" aria-hidden="true">IMG</span>
                <div className="file-name-wrap"><strong>{file.name}</strong><span>{formatBytes(file.size)}</span></div>
                {result && <span className="done-tag">READY</span>}
              </div>
              {result && (
                <div className="result-details">
                  <span>Output</span><strong>{result.width} × {result.height} px</strong>
                  <span>New size</span><strong>{formatBytes(result.blob.size)}</strong>
                </div>
              )}
            </div>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        <aside className="settings-panel" aria-label="Conversion settings">
          <div className="settings-heading"><span className="settings-step">01</span><h2>Export settings</h2></div>
          <label className="field-label" htmlFor="format">Output format</label>
          <select id="format" value={format} onChange={(event) => { setFormat(event.target.value); setResult(null); }}>
            {formats.map((item) => <option key={item.mime} value={item.mime}>{item.label}</option>)}
          </select>

          <div className="field-label-row"><label className="field-label" htmlFor="width">Maximum dimensions</label><span>px</span></div>
          <div className="dimension-fields">
            <label><span className="visually-hidden">Maximum width</span><input id="width" type="number" min="1" max="12000" value={maxWidth} onChange={(event) => { setMaxWidth(event.target.value); setResult(null); }} /><span>W</span></label>
            <span className="dimension-times">×</span>
            <label><span className="visually-hidden">Maximum height</span><input id="height" type="number" min="1" max="12000" value={maxHeight} onChange={(event) => { setMaxHeight(event.target.value); setResult(null); }} /><span>H</span></label>
          </div>
          <p className="field-help">Images keep their aspect ratio and are only reduced to fit these limits.</p>

          {format !== 'image/png' && (
            <div className="quality-setting">
              <div className="field-label-row"><label className="field-label" htmlFor="quality">Quality</label><strong>{quality}%</strong></div>
              <input id="quality" type="range" min="40" max="100" value={quality} onChange={(event) => { setQuality(event.target.value); setResult(null); }} />
              <div className="range-labels"><span>Smaller file</span><span>Higher quality</span></div>
            </div>
          )}

          {!result ? (
            <button className="button button-primary convert-button" type="button" onClick={convertImage} disabled={!file || busy}>
              {busy ? 'Converting…' : 'Convert image'} <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <a className="button button-primary convert-button" href={result.url} download={`${safeBaseName(file.name)}.${result.selectedFormat.extension}`}>
              Download {result.selectedFormat.label} <span aria-hidden="true">↓</span>
            </a>
          )}
          <p className="privacy-note"><span aria-hidden="true">◈</span> Conversion happens locally in your browser. Images are not uploaded.</p>
        </aside>
      </div>

      <section className="converter-info">
        <h2>Convert an image in your browser</h2>
        <p>Choose an image, select PNG, JPG, or WebP, and set a maximum size if you want to resize it. The converter uses your browser’s canvas, so your image stays on your device.</p>
      </section>
      <p className="tool-credit">A free image tool by <a href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">iArseneDev ↗</a></p>
    </div>
  );
}
