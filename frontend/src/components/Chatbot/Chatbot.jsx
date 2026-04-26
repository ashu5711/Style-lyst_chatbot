import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Send, Sparkles, Settings } from 'lucide-react';
import { sendChatRequest } from '../../services/mockApi';
import { sendToGemini } from '../../services/aiService';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'bot', text: 'Hi! I am Style-alyst, your personal boutique stylist. How can I complete your look today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachedImage, showSettings]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !attachedImage) return;
    
    const userText = inputValue;
    const userImage = attachedImage;
    
    // Add user message
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
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        // Real LLM flow
        const response = await sendToGemini(userText, userImage);
        setMessages(prev => [...prev, response]);
      } else {
        // Fallback Mock flow
        const response = await sendChatRequest(userText, userImage);
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'bot', 
        text: `Error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            className="chatbot-trigger-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <div className="contextual-prompt">
              <span>Need styling advice for this vest?</span>
            </div>
            <motion.button 
              className="chatbot-trigger-btn"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={24} />
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
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-title">
                <Sparkles size={18} className="title-icon" />
                <h3>Style-alyst</h3>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="close-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
                  <Settings size={18} />
                </button>
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Settings Overlay */}
            {showSettings ? (
              <div className="settings-overlay">
                <h3>API Settings</h3>
                <p>Enter your Google Gemini API Key to enable real AI connectivity.</p>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  placeholder="AIzaSy..." 
                  className="settings-input"
                />
                <button onClick={handleSaveSettings} className="save-settings-btn">Save Key</button>
              </div>
            ) : (
              <>
                {/* Message Area */}
                <div className="chatbot-messages">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                      <div className={`message-bubble ${msg.role}`}>
                        {msg.attachedImage && (
                          <img src={msg.attachedImage} alt="User upload" className="message-image" />
                        )}
                        {msg.text && <p className="message-text">{msg.text}</p>}
                        
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
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
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                    />
                    <button className="icon-btn attach-btn" onClick={() => fileInputRef.current.click()}>
                      <ImageIcon size={20} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Ask for styling advice or upload a photo..." 
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
