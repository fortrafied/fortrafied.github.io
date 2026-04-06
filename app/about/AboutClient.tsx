'use client';

export default function AboutClient() {
  return (
    <div className="about-layout">
      <div className="about-card">
        <div className="about-profile">
          <div className="about-avatar">LNM</div>
          <div>
            <h2 className="about-name">Lansing Nye-Madden</h2>
            <p className="about-title">CISSP &bull; Cybersecurity Professional</p>
            <p className="about-location">Farmington, Connecticut</p>
          </div>
        </div>

        <div className="about-section">
          <h3>About Me</h3>
          <p>
            I&apos;m a cybersecurity professional at Fortra with a focus on bringing
            clarity to complex security challenges. My work spans data loss
            prevention, incident response consulting, email security hardening,
            and infrastructure security &mdash; from Windows deployment automation
            and site-to-site VPN architecture to O365 migrations and server
            virtualization.
          </p>
          <p>
            I built Fortrafied as a comprehensive, privacy-first DLP testing and
            validation platform &mdash; a free resource for security teams to test
            their data protection controls across every exfiltration channel. All
            processing happens client-side; no data is ever sent to or stored on a
            server.
          </p>
        </div>

        <div className="about-section">
          <h3>Certifications</h3>
          <div className="about-certs">
            <span className="tag tag-blue">CISSP</span>
            <span className="tag tag-blue">CompTIA Security+</span>
            <span className="tag tag-blue">(ISC)&#178; CC</span>
          </div>
        </div>

        <div className="about-section">
          <h3>Publications</h3>
          <ul className="about-publications">
            <li>The Role of Uniforms in Digital Security (2025)</li>
            <li>Email Authentication Changes &mdash; April 1st, 2024</li>
          </ul>
        </div>

        <div className="about-section">
          <h3>Community</h3>
          <p>
            Outside of cybersecurity, I serve as a Lieutenant and EMT Instructor
            at Tunxis Hose Fire Department, where I&apos;ve volunteered since 2015.
            I&apos;m also active in the ISC2 Southern CT Chapter and ISACA Greater
            Hartford Chapter.
          </p>
        </div>
      </div>

      <div className="about-sidebar">
        <div className="about-card">
          <h3>Get in Touch</h3>
          <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
            Have questions about Fortrafied, DLP testing, or want to connect?
            Reach out via LinkedIn.
          </p>
          <a
            href="https://www.linkedin.com/in/lnyemadden/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Connect on LinkedIn
          </a>
        </div>

        <div className="about-card">
          <h3>About This Site</h3>
          <ul className="about-meta">
            <li>
              <span className="about-meta-label">Built with</span>
              <span>Next.js + React</span>
            </li>
            <li>
              <span className="about-meta-label">Hosted on</span>
              <span>GitHub Pages</span>
            </li>
            <li>
              <span className="about-meta-label">Data storage</span>
              <span>None &mdash; client-side only</span>
            </li>
            <li>
              <span className="about-meta-label">Source</span>
              <a
                href="https://github.com/fortrafied/fortrafied.github.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
