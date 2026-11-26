import './globals.css';
import ThemeToggle from './components/theme-toggle';

export const metadata = {
  title: {
    default: 'ArseneKit — Useful Online Tools',
    template: '%s | ArseneKit',
  },
  description:
    'A growing collection of practical, free tools made by iArseneDev. Simple to use and designed to keep your files on your device.',
  authors: [{ name: 'iArseneDev', url: 'https://github.com/iArseneDev' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="wordmark" href="/" aria-label="ArseneKit home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span>Arsene<span className="wordmark-accent">Kit</span></span>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <a href="/">All tools</a>
            <a href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <ThemeToggle />
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <a className="footer-brand" href="/">ArseneKit</a>
          <span>Useful little tools, made with care.</span>
          <a href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">
            Built by iArseneDev ↗
          </a>
        </footer>
      </body>
    </html>
  );
}
