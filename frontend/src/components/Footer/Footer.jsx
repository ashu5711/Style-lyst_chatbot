import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const COLUMNS = [
  {
    title: 'My Account',
    links: [
      'Track My Order',
      'Pay Bill & Manage Account',
      'My JCP.com Account',
      'Apply for JCP Credit Card',
      'Credit Card Benefits',
      'JCPenney Rewards',
    ],
  },
  {
    title: 'Customer Service',
    links: [
      'Contact Us',
      'Return Policy',
      'Shipping Information',
      'Rebates',
      'Gift Cards',
      'Sephora FAQs',
      'Servicio Al Cliente',
    ],
  },
  {
    title: 'Stores',
    links: [
      'Weekly Ad',
      'JCP Salon',
      'Sephora',
      'Portraits',
      'Optical',
      'Kids Zone',
      'Curbside Pickup',
    ],
  },
  {
    title: 'About Us',
    links: [
      'Careers',
      'Company Info',
      'Community',
      'Media',
      'Investors',
      'Style by JCPenney',
      'Site Map',
    ],
  },
];

const SOCIAL = [
  { name: 'Twitter / X', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { name: 'Instagram', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )},
  { name: 'Facebook', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )},
  { name: 'Pinterest', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  )},
  { name: 'YouTube', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#111" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )},
  { name: 'TikTok', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.79a8.18 8.18 0 0 0 4.78 1.52V6.88a4.85 4.85 0 0 1-1.01-.19z" />
    </svg>
  )},
];

const JCPLogoFooter = () => (
  <svg width="90" height="29" viewBox="0 0 129 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#jcp-footer-logo-clip)">
      <path fill="#C00" d="M0 0h129.28v42H0z" />
      <path d="M21.356 24.75c0 2.636-1.387 5.298-5.733 5.298-3.614 0-5.651-2.012-5.651-5.651v-1.199h2.58v.814c0 2.251.599 3.86 3.122 3.86 2.358 0 3.096-1.356 3.096-3.507V10.186h2.58V24.75h.006zM37.244 16.027c-.542-2.744-2.743-4.132-5.43-4.132-4.617 0-6.572 3.804-6.572 7.853 0 4.428 1.955 8.124 6.597 8.124 3.4 0 5.355-2.39 5.595-5.595h2.58c-.493 4.838-3.501 7.77-8.396 7.77-6.03 0-8.962-4.452-8.962-10.104 0-5.65 3.204-10.21 9.183-10.21 4.05 0 7.392 2.169 7.985 6.3h-2.58v-.006zM41.123 10.186h8.503c3.86 0 5.947 2.145 5.947 5.733 0 3.59-2.094 5.759-5.947 5.734h-5.923v7.934h-2.58v-19.4zm2.58 9.29h5.052c2.908.026 4.239-1.248 4.239-3.556 0-2.309-1.331-3.558-4.239-3.558h-5.052v7.121-.006zM67.746 25.128c-.624 3.097-2.85 4.781-6.004 4.781-4.485 0-6.604-3.097-6.736-7.392 0-4.207 2.769-7.304 6.603-7.304 4.97 0 6.49 4.649 6.358 8.042H57.453c-.082 2.447 1.305 4.617 4.37 4.617 1.905 0 3.236-.927 3.64-2.744h2.283zm-2.226-3.91c-.107-2.202-1.766-3.968-4.05-3.968-2.415 0-3.86 1.823-4.017 3.968h8.067zM69.001 15.535h2.176v2.226h.057c.978-1.734 2.555-2.554 4.56-2.554 3.696 0 4.838 2.119 4.838 5.134v9.24h-2.309V20.07c0-1.71-1.084-2.826-2.85-2.826-2.8 0-4.157 1.873-4.157 4.396v7.935h-2.308V15.529l-.007.006zM82.152 15.535h2.17v2.226h.056c.978-1.734 2.555-2.554 4.56-2.554 3.697 0 4.838 2.119 4.838 5.134v9.24h-2.308V20.07c0-1.71-1.085-2.826-2.851-2.826-2.8 0-4.157 1.873-4.157 4.396v7.935h-2.308V15.529v.006zM107.577 25.128c-.625 3.097-2.851 4.781-6.005 4.781-4.484 0-6.604-3.097-6.736-7.392 0-4.207 2.769-7.304 6.597-7.304 4.97 0 6.49 4.649 6.358 8.042H97.277c-.082 2.447 1.305 4.617 4.377 4.617 1.899 0 3.229-.927 3.639-2.744h2.284zm-2.227-3.91c-.107-2.202-1.766-3.968-4.049-3.968-2.422 0-3.86 1.823-4.024 3.968h8.073z" fill="#fff" />
      <path d="M114.023 31.454c-1.06 2.744-2.012 3.747-4.075 3.747-.542 0-1.085-.057-1.602-.246v-2.12c.435.133.896.322 1.362.322.953 0 1.464-.46 1.899-1.274l.952-2.39-5.569-13.964h2.611l4.1 11.491h.057l3.935-11.492h2.448l-6.112 15.92-.006.006z" fill="#fff" />
    </g>
    <defs>
      <clipPath id="jcp-footer-logo-clip">
        <path fill="#fff" d="M0 0h129v42H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="jcp-footer">

      {/* ── Email signup banner ── */}
      <div className="jcp-signup-bar">
        <div className="jcp-signup-inner">
          <div className="jcp-signup-text">
            <strong>Be the first to know about the latest deals and more!</strong>
          </div>
          <div className="jcp-signup-form">
            <input
              type="email"
              placeholder="Phone Number or Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="jcp-signup-input"
            />
            <button className="jcp-signup-btn">Sign Up</button>
          </div>
        </div>
      </div>

      {/* ── Main footer columns ── */}
      <div className="jcp-footer-main">
        <div className="jcp-footer-inner">

          {/* Brand + social */}
          <div className="jcp-footer-brand">
            <Link to="/" className="jcp-footer-logo-link" aria-label="JCPenney Home">
              <JCPLogoFooter />
            </Link>
            <p className="jcp-footer-tagline">Get Your Penney's Worth</p>
            <div className="jcp-social-row">
              {SOCIAL.map(s => (
                <a key={s.name} href="#" className="jcp-social-btn" aria-label={s.name} title={s.name}>
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="jcp-app-badges">
              <a href="#" className="jcp-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </a>
              <a href="#" className="jcp-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3.18 23.76c.3.17.65.19.96.07L13.64 12 4.14.17c-.31-.12-.66-.1-.96.07C2.6.57 2.25 1.13 2.25 1.75v20.5c0 .62.35 1.18.93 1.51zM16.47 9.26L5.64 3.02l8.42 8.98-7.22 4.15 9.62-6.89zM20.38 10.73l-2.44-1.39-2.6 2.66 2.6 2.66 2.47-1.41c.7-.4 1.13-1.1 1.13-1.91-.01-.8-.45-1.5-1.16-1.61zM5.64 20.98l10.83-6.24-2.43-2.6-8.4 8.84z"/></svg>
                Google Play
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title} className="jcp-footer-col">
              <h4 className="jcp-footer-col-title">{col.title}</h4>
              <ul className="jcp-footer-links">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="jcp-footer-link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="jcp-footer-bottom">
        <div className="jcp-footer-bottom-inner">
          <p className="jcp-copyright">© 2026 Penney IP LLC. All Rights Reserved.</p>
          <div className="jcp-legal-links">
            <a href="#">Privacy Policy</a>
            <span>·</span>
            <a href="#">Your Privacy Choices</a>
            <span>·</span>
            <a href="#">Terms &amp; Conditions</a>
            <span>·</span>
            <a href="#">Accessibility Statement</a>
            <span>·</span>
            <a href="#">Ad Choices</a>
            <span>·</span>
            <Link to="/style-lyst">Sty-Lyst AI</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
