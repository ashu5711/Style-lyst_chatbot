import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Search, ChevronRight, ArrowRight, Check } from 'lucide-react';
import Header from '../Header/Header';
import './StyleLyst.css';

const PDP_URL = '/p/ana-womens-crew-neck-sleeveless-vest/ppr5008658749?pTmplType=regular';

const features = [
  {
    id: 'styleseek',
    icon: <Camera size={28} />,
    gradient: 'linear-gradient(135deg, #209dd7, #1a7eb3)',
    label: 'Sty-Seek',
    tagline: 'Visual Inspiration Search',
    description:
      'Upload any outfit photo — from Instagram, Pinterest, or a magazine. Sty-Seek detects every garment in the image, places interactive hotspots on each one, and searches 16,000+ catalog items to find the closest visual matches.',
    steps: ['Upload any outfit photo you love', 'AI detects each garment and places hotspots', 'Click a hotspot to find similar items in our catalog'],
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=700&q=80',
    imageAlt: 'Fashion inspiration browsing',
    cta: 'Try Sty-Seek',
    ctaLink: '/styleseek',
  },
  {
    id: 'complyst',
    icon: <Sparkles size={28} />,
    gradient: 'linear-gradient(135deg, #753991, #5a2d6e)',
    label: 'Comp-Lyst',
    tagline: 'Complete the Look',
    description:
      'Describe an occasion or upload a photo of something you already own. Comp-Lyst builds a full 4-piece outfit around the vest — top, bottom, shoes, and accessory — and shows you real catalog images for every piece.',
    steps: ['Describe your occasion or upload a photo', 'AI curates a coordinated 4-piece outfit', 'Browse real catalog images and shop the look'],
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80',
    imageAlt: 'Curated outfit flat lay',
    cta: 'Try Comp-Lyst',
    ctaLink: PDP_URL + '&openChat=complyst',
  },
  {
    id: 'productqa',
    icon: <Search size={28} />,
    gradient: 'linear-gradient(135deg, #ecad0a, #d49a08)',
    label: 'Ask Me Anything',
    tagline: 'Instant Product Expertise',
    description:
      'Get accurate answers about sizing, fabric, care instructions, return policy, and what real customers are saying — all grounded in the product spec sheet and 60 verified customer reviews. No guessing, no hallucinations.',
    steps: ['Ask any question about the product', 'AI searches product specs and 60 customer reviews', 'Get a concise, grounded answer in seconds'],
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80',
    imageAlt: 'Product fabric detail',
    cta: 'Ask a Question',
    ctaLink: PDP_URL + '&openChat=productqa',
  },
];

const howItWorks = [
  { step: '01', title: 'Open the Chatbot', body: 'Click the Sty-Lyst button floating on any page.' },
  { step: '02', title: 'Pick Your Feature', body: 'Choose Comp-Lyst, Sty-Seek, or Ask Me Anything from the menu.' },
  { step: '03', title: 'Get Styled', body: 'Type your request or upload a photo. AI responds in seconds with recommendations backed by real catalog data.' },
];

export default function StyleLyst() {
  const navigate = useNavigate();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sl-page">
      <Header />

      {/* ── Hero ── */}
      <section className="sl-hero">
        <div className="sl-hero-bg" />
        <div className="sl-hero-content">
          <motion.div
            className="sl-hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sl-hero-badge">
              <Sparkles size={14} />
              <span>Powered by Claude Sonnet on AWS Bedrock</span>
            </div>
            <h1 className="sl-hero-title">
              Meet <span className="sl-gradient-text">Sty-Lyst</span>
            </h1>
            <p className="sl-hero-subtitle">
              Your AI-powered personal boutique stylist, built right into JCPenney.
              Complete outfits, discover looks, and get instant product answers — all in one chat.
            </p>
            <div className="sl-hero-actions">
              <motion.button
                className="sl-btn-primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/?openChat=menu')}
              >
                <Sparkles size={18} />
                Try Sty-Lyst
              </motion.button>
              <motion.button
                className="sl-btn-ghost"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                See Features <ChevronRight size={16} />
              </motion.button>
            </div>
            <div className="sl-hero-stats">
              <div className="sl-stat"><strong>16,000+</strong><span>Catalog Items</span></div>
              <div className="sl-stat-divider" />
              <div className="sl-stat"><strong>3</strong><span>AI Features</span></div>
              <div className="sl-stat-divider" />
              <div className="sl-stat"><strong>60</strong><span>Verified Reviews</span></div>
            </div>
          </motion.div>

          {/* Chatbot preview mockup */}
          <motion.div
            className="sl-hero-mockup"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="sl-mockup-window">
              <div className="sl-mockup-header">
                <Sparkles size={14} className="sl-mockup-icon" />
                <span>Sty-Lyst</span>
              </div>
              <div className="sl-mockup-body">
                <div className="sl-mockup-tile" style={{ borderLeft: '3px solid #209dd7' }}>
                  <Camera size={16} style={{ color: '#209dd7' }} />
                  <div>
                    <strong>Sty-Seek</strong>
                    <p>Find similar items from a photo</p>
                  </div>
                </div>
                <div className="sl-mockup-tile" style={{ borderLeft: '3px solid #753991' }}>
                  <Sparkles size={16} style={{ color: '#753991' }} />
                  <div>
                    <strong>Comp-Lyst</strong>
                    <p>Complete your look with AI</p>
                  </div>
                </div>
                <div className="sl-mockup-tile" style={{ borderLeft: '3px solid #ecad0a' }}>
                  <Search size={16} style={{ color: '#ecad0a' }} />
                  <div>
                    <strong>Ask Me Anything</strong>
                    <p>Sizing, fabric, reviews & more</p>
                  </div>
                </div>
              </div>
              <div className="sl-mockup-footer">
                <div className="sl-mockup-input">Ask for styling advice…</div>
              </div>
            </div>
            <div className="sl-mockup-glow" />
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="sl-features" id="features">
        <div className="sl-section-header">
          <h2>Three Ways to Style Smarter</h2>
          <p>Every feature is powered by Claude Sonnet and grounded in real JCPenney catalog data.</p>
        </div>

        <div className="sl-features-list">
          {features.map((f, idx) => (
            <motion.div
              key={f.id}
              className={`sl-feature-card ${idx % 2 === 1 ? 'sl-feature-card--reverse' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              {/* Image */}
              <div className="sl-feature-img-wrap">
                <img src={f.image} alt={f.imageAlt} className="sl-feature-img" />
                <div className="sl-feature-img-overlay" style={{ background: `${f.gradient.replace('135deg', '180deg')}, transparent` }} />
                <div className="sl-feature-img-badge" style={{ background: f.gradient }}>
                  {f.icon}
                  <span>{f.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="sl-feature-content">
                <div className="sl-feature-tag" style={{ background: f.gradient }}>
                  {f.icon} {f.tagline}
                </div>
                <h3 className="sl-feature-title">{f.label}</h3>
                <p className="sl-feature-desc">{f.description}</p>

                <ul className="sl-feature-steps">
                  {f.steps.map((step, i) => (
                    <li key={i}>
                      <div className="sl-step-num" style={{ background: f.gradient }}>{i + 1}</div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  className="sl-feature-cta"
                  style={{ background: f.gradient }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(f.ctaLink)}
                >
                  {f.cta} <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="sl-how">
        <div className="sl-section-header">
          <h2>How It Works</h2>
          <p>Three steps from curiosity to a complete, shoppable look.</p>
        </div>
        <div className="sl-how-steps">
          {howItWorks.map((item, idx) => (
            <motion.div
              key={idx}
              className="sl-how-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
            >
              <div className="sl-how-step-num">{item.step}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack callout ── */}
      <section className="sl-tech">
        <div className="sl-tech-inner">
          <div className="sl-tech-text">
            <h3>Enterprise AI, built for retail</h3>
            <p>
              Sty-Lyst runs on <strong>Claude Sonnet 4.6</strong> via AWS Bedrock — no API keys in the browser, no third-party data exposure.
              Visual search is powered by <strong>OpenAI CLIP</strong> with a private ChromaDB index of 16,000+ catalog images hosted on S3.
            </p>
            <ul className="sl-tech-list">
              {['AWS Bedrock (Claude Sonnet 4.6)', 'CLIP cross-modal visual embeddings', 'ChromaDB vector store — 16k images', 'Grounded Q&A from product data + reviews'].map(t => (
                <li key={t}><Check size={15} />{t}</li>
              ))}
            </ul>
          </div>
          <div className="sl-tech-visual">
            <div className="sl-tech-badge">
              <Sparkles size={32} className="sl-tech-sparkle" />
              <span className="sl-tech-label">Claude Sonnet 4.6</span>
              <span className="sl-tech-sub">via AWS Bedrock</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="sl-bottom-cta">
        <motion.div
          className="sl-cta-box"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={40} className="sl-cta-icon" />
          <h2>Ready to find your look?</h2>
          <p>Start with the a.n.a Crew Neck Sleeveless Vest and build your perfect outfit in under a minute.</p>
          <motion.button
            className="sl-btn-primary sl-btn-large"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/?openChat=menu')}
          >
            <Sparkles size={20} />
            Try Sty-Lyst Now
          </motion.button>
          <p className="sl-cta-hint">No account needed · Works instantly · Powered by AWS Bedrock</p>
        </motion.div>
      </section>

      {/* ── Sticky Try Me bar (appears after scrolling past hero) ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            className="sl-sticky-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <span className="sl-sticky-text">
              <Sparkles size={16} /> Sty-Lyst — your AI stylist is ready
            </span>
            <motion.button
              className="sl-sticky-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/?openChat=menu')}
            >
              Try Me <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
