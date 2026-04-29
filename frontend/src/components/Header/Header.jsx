import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sparkles, X, MapPin } from 'lucide-react';
import './Header.css';

const NAV_CATEGORIES = [
  { label: 'Holiday' },
  { label: 'Home & Lifestyle' },
  { label: 'Women' },
  { label: 'Men' },
  { label: 'Young Adult' },
  { label: 'Baby & Kids' },
  { label: 'Toys & Games' },
  { label: 'Shoes & Accessories' },
  { label: 'Jewelry' },
  { label: 'Beauty & Salon' },
  { label: 'Clearance', highlight: true },
];

const JCPLogo = () => (
  <svg width="107" height="35" viewBox="0 0 129 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#jcp-logo-clip)">
      <path fill="#C00" d="M0 0h129.28v42H0z" />
      <path d="M21.356 24.75c0 2.636-1.387 5.298-5.733 5.298-3.614 0-5.651-2.012-5.651-5.651v-1.199h2.58v.814c0 2.251.599 3.86 3.122 3.86 2.358 0 3.096-1.356 3.096-3.507V10.186h2.58V24.75h.006zM37.244 16.027c-.542-2.744-2.743-4.132-5.43-4.132-4.617 0-6.572 3.804-6.572 7.853 0 4.428 1.955 8.124 6.597 8.124 3.4 0 5.355-2.39 5.595-5.595h2.58c-.493 4.838-3.501 7.77-8.396 7.77-6.03 0-8.962-4.452-8.962-10.104 0-5.65 3.204-10.21 9.183-10.21 4.05 0 7.392 2.169 7.985 6.3h-2.58v-.006zM41.123 10.186h8.503c3.86 0 5.947 2.145 5.947 5.733 0 3.59-2.094 5.759-5.947 5.734h-5.923v7.934h-2.58v-19.4zm2.58 9.29h5.052c2.908.026 4.239-1.248 4.239-3.556 0-2.309-1.331-3.558-4.239-3.558h-5.052v7.121-.006zM67.746 25.128c-.624 3.097-2.85 4.781-6.004 4.781-4.485 0-6.604-3.097-6.736-7.392 0-4.207 2.769-7.304 6.603-7.304 4.97 0 6.49 4.649 6.358 8.042H57.453c-.082 2.447 1.305 4.617 4.37 4.617 1.905 0 3.236-.927 3.64-2.744h2.283zm-2.226-3.91c-.107-2.202-1.766-3.968-4.05-3.968-2.415 0-3.86 1.823-4.017 3.968h8.067zM69.001 15.535h2.176v2.226h.057c.978-1.734 2.555-2.554 4.56-2.554 3.696 0 4.838 2.119 4.838 5.134v9.24h-2.309V20.07c0-1.71-1.084-2.826-2.85-2.826-2.8 0-4.157 1.873-4.157 4.396v7.935h-2.308V15.529l-.007.006zM82.152 15.535h2.17v2.226h.056c.978-1.734 2.555-2.554 4.56-2.554 3.697 0 4.838 2.119 4.838 5.134v9.24h-2.308V20.07c0-1.71-1.085-2.826-2.851-2.826-2.8 0-4.157 1.873-4.157 4.396v7.935h-2.308V15.529v.006zM107.577 25.128c-.625 3.097-2.851 4.781-6.005 4.781-4.484 0-6.604-3.097-6.736-7.392 0-4.207 2.769-7.304 6.597-7.304 4.97 0 6.49 4.649 6.358 8.042H97.277c-.082 2.447 1.305 4.617 4.377 4.617 1.899 0 3.229-.927 3.639-2.744h2.284zm-2.227-3.91c-.107-2.202-1.766-3.968-4.049-3.968-2.422 0-3.86 1.823-4.024 3.968h8.073z" fill="#fff" />
      <path d="M114.023 31.454c-1.06 2.744-2.012 3.747-4.075 3.747-.542 0-1.085-.057-1.602-.246v-2.12c.435.133.896.322 1.362.322.953 0 1.464-.46 1.899-1.274l.952-2.39-5.569-13.964h2.611l4.1 11.491h.057l3.935-11.492h2.448l-6.112 15.92-.006.006z" fill="#fff" />
    </g>
    <defs>
      <clipPath id="jcp-logo-clip">
        <path fill="#fff" d="M0 0h129v42H0z" />
      </clipPath>
    </defs>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M14.477 14.483a5.344 5.344 0 01-7.55 0 5.33 5.33 0 010-7.542 5.344 5.344 0 017.55 0 5.33 5.33 0 010 7.542zm5.663 4.4l-3.775-3.771-.041-.039a7.105 7.105 0 00-.588-9.391 7.125 7.125 0 00-10.068.002 7.107 7.107 0 00-.587 9.354 7.125 7.125 0 009.987 1.291l.038.04 3.774 3.771a.89.89 0 101.26-1.257z" fill="#202020" />
  </svg>
);

const AccountIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 36c8.837 0 16-7.163 16-16S28.837 4 20 4 4 11.163 4 20s7.163 16 16 16zm7-9c1.035.48 2 1 2 2s-4 4-9 4-9-3-9-4c0-.988 1.005-1.497 1.966-1.983L13 27l3.232-1.745c.38-.192.601-.538.601-.898v-.339c-1.798-1.26-2.929-3.614-2.929-6.208 0-3.919 2.57-7.144 5.81-7.144 3.24 0 5.81 3.225 5.81 7.144 0 2.512-1.061 4.804-2.768 6.092v.491c0 .376.234.727.64.915L27 27z" fill="#202020" />
    <path d="M36.8 8a4.8 4.8 0 11-9.6 0 4.8 4.8 0 019.6 0z" fill="#E71324" />
    <path fillRule="evenodd" clipRule="evenodd" d="M40 8a8 8 0 11-16 0 8 8 0 0116 0zm-8 4.8a4.8 4.8 0 100-9.6 4.8 4.8 0 000 9.6z" fill="#fff" />
  </svg>
);

const CartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="#202020">
    <path d="M30.077 23.989l1.932-10.956a1 1 0 011.158-.811l.142.025a1 1 0 01.81 1.158l-2.097 11.9v.01a1 1 0 01-1 1h-17.07a1 1 0 01-1-1v-.006l-2.5-14.165H7a1 1 0 01-1-1V10a1 1 0 011-1h4.432a1 1 0 011 1v.017l2.463 13.972h15.182zM16.58 33a2.512 2.512 0 110-5.025 2.512 2.512 0 010 5.025zm11.166 0a2.512 2.512 0 110-5.025 2.512 2.512 0 010 5.025z" fillRule="evenodd" />
  </svg>
);

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isOnStyleLyst = location.pathname === '/style-lyst';

  const onStyleAlystClick = () => {
    if (isOnStyleLyst) {
      window.dispatchEvent(new CustomEvent('open-chatbot'));
    } else {
      navigate('/style-lyst');
    }
  };

  return (
    <div className="jcp-header-root">

      {/* ── Top black promo bar ── */}
      <AnimatePresence>
        {!promoDismissed && (
          <motion.div
            className="jcp-promo-bar"
            initial={{ height: 38, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="jcp-promo-text">
              Free Shipping on orders $49+ &nbsp;|&nbsp; Extra 25% off with code <strong>STYLE25</strong> &nbsp;|&nbsp; Earn Rewards on every purchase
            </span>
            <button className="jcp-promo-close" onClick={() => setPromoDismissed(true)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main header bar ── */}
      <header className="jcp-main-header">
        <div className="jcp-main-inner">

          {/* Hamburger */}
          <button className="jcp-hamburger" aria-label="Menu">
            <Menu size={22} color="#202020" />
          </button>

          {/* JCPenney SVG Logo */}
          <Link to="/" className="jcp-logo-link" aria-label="JCPenney Home">
            <JCPLogo />
          </Link>

          {/* Search bar */}
          <div className="jcp-search">
            <button className="jcp-search-icon-btn" aria-label="Search">
              <SearchIcon />
            </button>
            <input
              type="search"
              placeholder="What can we help you find?"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="jcp-search-input"
            />
          </div>

          {/* Right: Find Store + Account + Cart + Sty-Lyst */}
          <div className="jcp-right">

            <button className="jcp-icon-btn">
              <MapPin size={20} color="#202020" />
              <span>Find a Store</span>
            </button>

            <button className="jcp-icon-btn">
              <AccountIcon />
              <div className="jcp-account-label">
                <span className="jcp-account-top">My Account</span>
                <span className="jcp-account-sub">Sign In</span>
              </div>
            </button>

            <button className="jcp-icon-btn jcp-cart-btn">
              <div className="jcp-cart-wrap">
                <CartIcon />
                <span className="jcp-cart-badge">2</span>
              </div>
            </button>

            {/* Sty-Lyst pill */}
            <div
              className="jcp-stylealyst-wrap"
              onMouseEnter={() => isOnStyleLyst && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <motion.button
                className={`jcp-stylealyst-btn ${isOnStyleLyst ? 'jcp-stylealyst-btn--active' : ''}`}
                onClick={onStyleAlystClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Sparkles size={15} />
                <span>{isOnStyleLyst ? 'Open Chat' : 'Sty-Lyst'}</span>
                {isOnStyleLyst && <span className="jcp-live-dot" />}
              </motion.button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    className="jcp-tooltip"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                  >
                    Click to open the AI stylist chat
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </header>

      {/* ── Category navigation bar ── */}
      <nav className="jcp-cat-nav">
        <ul className="jcp-cat-list">
          {NAV_CATEGORIES.map(cat => (
            <li key={cat.label} className={`jcp-cat-item ${cat.highlight ? 'jcp-cat-item--sale' : ''}`}>
              <button className="jcp-cat-btn">{cat.label}</button>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
}
