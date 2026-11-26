const tools = [
  {
    number: '01',
    category: 'IMAGE',
    title: 'Image Converter',
    description: 'Convert images to PNG, JPG, or WebP and resize them in a few clicks.',
    href: '/image-converter/',
    icon: '▧',
    status: 'Available now',
  },
  {
    number: '02',
    category: 'DEVELOPMENT',
    title: 'Live Code Editor',
    description: 'Write HTML, CSS, and JavaScript with a live preview.',
    href: '/live-code-editor/',
    icon: '</>',
    status: 'Available now',
  },
];

export default function HomePage() {
  return (
    <div className="home-shell">
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> THE TOOLBOX BY iARSENEDEV</div>
        <h1>Small tools.<br /><span>Big time-savers.</span></h1>
        <p className="hero-copy">
          Free, straightforward tools for everyday creative and developer work.
          More are being added one by one.
        </p>
        <a className="hero-link" href="#tools">Explore the tools <span aria-hidden="true">↓</span></a>
        <div className="hero-decoration" aria-hidden="true">
          <span className="decor-square decor-square-one" />
          <span className="decor-square decor-square-two" />
          <span className="decor-ring" />
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-eyebrow">THE COLLECTION</p>
            <h2>Pick a tool</h2>
          </div>
          <span className="tool-count">{String(tools.length).padStart(2, '0')} TOOLS</span>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <a className="tool-card" href={tool.href} key={tool.href}>
              <div className="tool-card-top">
                <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
                <span className="tool-number">{tool.number}</span>
              </div>
              <p className="tool-category">{tool.category}</p>
              <h3>{tool.title}</h3>
              <p className="tool-description">{tool.description}</p>
              <div className="tool-card-bottom">
                <span className="availability"><span />{tool.status}</span>
                <span className="arrow" aria-hidden="true">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="maker-note">
        <span className="maker-monogram" aria-hidden="true">iA</span>
        <div>
          <p className="eyebrow section-eyebrow">MADE BY A DEVELOPER</p>
          <h2>Built by iArseneDev</h2>
          <p>ArseneKit is an independent collection of useful web tools. Find the source and more projects on GitHub.</p>
        </div>
        <a className="maker-link" href="https://github.com/iArseneDev" target="_blank" rel="noreferrer">
          Visit GitHub <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  );
}
