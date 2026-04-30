import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, Image as ImageIcon, Send, Sparkles, ChevronLeft, Camera, Search, MessageCircle, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendToGemini } from '../../services/aiService.aws';
import { sendChatRequest } from '../../services/mockApi';
import './Chatbot.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const MODES = {
  MENU: null,
  COMPLYST: 'complyst',
  PRODUCTQA: 'productqa',
};

const PRODUCTQA_SUGGESTIONS = [
  'Does this vest run true to size?',
  'What do reviewers say about fabric quality?',
  'Is this good for work or just casual?',
];

const Chatbot = () => {
  const location = useLocation();
  const isPDP = location.pathname.startsWith('/p/');

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(MODES.MENU);

  const [showStickyBar, setShowStickyBar] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Show sticky bar after scrolling down
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [complystMessages, setComplystMessages] = useState([
    { id: 'c1', role: 'bot', text: 'Hi! I am Comp-Lyst, your personal boutique stylist. Tell me an occasion or upload a photo, and I\'ll complete your look!' }
  ]);
  const [productQAMessages, setProductQAMessages] = useState([
    { id: 'p1', role: 'bot', text: 'Ask me anything about the a.n.a Womens Crew Neck Sleeveless Vest -- sizing, fabric, reviews, care instructions, and more!' }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);

  const messages = activeMode === MODES.COMPLYST ? complystMessages : productQAMessages;
  const setMessages = activeMode === MODES.COMPLYST ? setComplystMessages : setProductQAMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [complystMessages, productQAMessages, isLoading, attachedImage]);

  // Allow the shared Header to open the chatbot via a custom event
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setActiveMode(MODES.MENU);
    };
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

  // Auto-open chatbot if ?openChat= query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openChat = params.get('openChat');
    if (openChat === 'complyst') {
      setIsOpen(true);
      setActiveMode(MODES.COMPLYST);
    } else if (openChat === 'productqa') {
      setIsOpen(true);
      setActiveMode(MODES.PRODUCTQA);
    } else if (openChat === 'menu') {
      setIsOpen(true);
      setActiveMode(MODES.MENU);
    }
  }, [location.search]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    setActiveMode(MODES.MENU);
    setInputValue('');
    setAttachedImage(null);
  };

  const handleTileClick = (mode) => {
    if (mode === 'styleseek') {
      window.location.href = '/styleseek';
      return;
    }
    if (mode === 'legacy') return;
    setActiveMode(mode);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !attachedImage) return;

    const userText = inputValue;
    const userImage = attachedImage;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      attachedImage: userImage
    }]);

    setInputValue('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      if (activeMode === MODES.PRODUCTQA) {
        const res = await fetch(`${API_BASE}/api/product-qa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: userText })
        });
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: data.id || Date.now().toString(),
          role: 'bot',
          text: data.text
        }]);
      } else {
        const response = await sendToGemini(userText, userImage);
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Error:', error);
      if (activeMode === MODES.COMPLYST) {
        try {
          const fallback = await sendChatRequest(userText, userImage);
          setMessages(prev => [...prev, fallback]);
        } catch (e2) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: `Error: ${error.message}` }]);
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: `Error: ${error.message}` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMenu = () => (
    <div className="menu-container">
      <div className="menu-welcome">
        <p>Welcome to Sty-Lyst. How can I help you today?</p>
      </div>
      <div className="menu-grid">
        <motion.div
          className="menu-tile"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTileClick('styleseek')}
        >
          <div className="tile-icon-wrapper" style={{ background: 'linear-gradient(135deg, #209dd7, #1a7eb3)' }}>
            <Camera size={22} />
          </div>
          <div className="tile-content">
            <h4>Sty-Seek</h4>
            <p>Upload an outfit photo and find similar items in our catalog</p>
          </div>
        </motion.div>

        {isPDP && (
          <motion.div
            className="menu-tile"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTileClick(MODES.COMPLYST)}
          >
            <div className="tile-icon-wrapper" style={{ background: 'linear-gradient(135deg, #753991, #5a2d6e)' }}>
              <Sparkles size={22} />
            </div>
            <div className="tile-content">
              <h4>Comp-Lyst</h4>
              <p>Complete your look with AI-curated outfit recommendations</p>
            </div>
          </motion.div>
        )}

        {isPDP && (
          <motion.div
            className="menu-tile"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTileClick(MODES.PRODUCTQA)}
          >
            <div className="tile-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ecad0a, #d49a08)' }}>
              <Search size={22} />
            </div>
            <div className="tile-content">
              <h4>Ask Me Anything</h4>
              <p>Questions about sizing, fabric, reviews, or care instructions</p>
            </div>
          </motion.div>
        )}

        <div className="menu-tile disabled">
          <div className="tile-icon-wrapper" style={{ background: 'linear-gradient(135deg, #888, #666)' }}>
            <MessageCircle size={22} />
          </div>
          <div className="tile-content">
            <h4>Legacy Chat</h4>
            <p>General assistant coming soon</p>
          </div>
          <div className="coming-soon-badge">Coming Soon</div>
        </div>
      </div>
    </div>
  );

  const handleSuggestionClick = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      attachedImage: null
    }]);
    setIsLoading(true);
    fetch(`${API_BASE}/api/product-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text })
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, {
          id: data.id || Date.now().toString(),
          role: 'bot',
          text: data.text
        }]);
      })
      .catch(err => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: `Error: ${err.message}` }]);
      })
      .finally(() => setIsLoading(false));
  };

  const renderChat = () => {
    const suggestions = PRODUCTQA_SUGGESTIONS;
    const showSuggestions = activeMode === MODES.PRODUCTQA && messages.length <= 1 && !isLoading;

    return (
      <>
      <div className="chatbot-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.role}`}>
            <div className={`message-bubble ${msg.role}`}>
              {msg.attachedImage && (
                <img src={msg.attachedImage} alt="User upload" className="message-image" />
              )}
              {msg.text && (
                <div className="message-text markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}

              {msg.outfitRecommendation && (
                <div className="outfit-recommendation-container">
                  <div className="outfit-header">
                    <Sparkles size={14} className="title-icon" />
                    <span>{msg.outfitRecommendation.occasion} Outfit</span>
                  </div>
                  <p className="stylist-reasoning">{msg.outfitRecommendation.stylistReasoning}</p>

                  <div className="outfit-carousel">
                    {Object.values(msg.outfitRecommendation.items).map((item, idx) => (
                      <div key={idx} className="outfit-item">
                        <div className="outfit-item-img-wrapper">
                          <img src={item.imageUrl} alt={item.name} />
                        </div>
                        <div className="outfit-item-details">
                          <span className="item-brand">{item.brand}</span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="outfit-total">
                    <span>Total Look</span>
                    <span>${msg.outfitRecommendation.totalPriceEstimate}</span>
                  </div>
                  <button className="shop-look-btn">Shop This Look</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-bubble bot skeleton-loader">
              <div className="skeleton-line full"></div>
              <div className="skeleton-line half"></div>
              <div className="skeleton-box"></div>
            </div>
          </div>
        )}
        {showSuggestions && (
          <div className="chat-suggestions">
            {suggestions.map((s, idx) => (
              <button key={idx} className="chat-suggestion-capsule" onClick={() => handleSuggestionClick(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-wrapper">
        {attachedImage && (
          <div className="image-preview-area">
            <div className="image-preview-container">
              <img src={attachedImage} alt="Preview" />
              <button className="remove-image-btn" onClick={() => setAttachedImage(null)}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <div className="chatbot-input-area">
          {activeMode === MODES.COMPLYST && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button className="icon-btn attach-btn" onClick={() => fileInputRef.current.click()} title="Upload photo">
                <ImageIcon size={20} />
              </button>
              <button className="icon-btn attach-btn" onClick={() => cameraInputRef.current.click()} title="Take photo">
                <Camera size={20} />
              </button>
            </>
          )}
          <input
            type="text"
            placeholder={activeMode === MODES.PRODUCTQA
              ? "Ask about sizing, fabric, reviews..."
              : "Ask for styling advice or upload a photo..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="icon-btn send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() && !attachedImage}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
    );
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {!isOpen && showStickyBar && (
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
              onClick={() => setIsOpen(true)}
            >
              Try Me
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                {activeMode !== MODES.MENU && (
                  <button className="back-btn" onClick={handleBack}>
                    <ChevronLeft size={20} />
                  </button>
                )}
                <Sparkles size={18} className="title-icon" />
                <h3>{activeMode === MODES.COMPLYST ? 'Comp-Lyst' : activeMode === MODES.PRODUCTQA ? 'Ask Me Anything' : 'Sty-Lyst'}</h3>
              </div>
              <button className="close-btn" onClick={() => { setIsOpen(false); setActiveMode(MODES.MENU); }}>
                <X size={20} />
              </button>
            </div>

            {activeMode === MODES.MENU ? renderMenu() : renderChat()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
