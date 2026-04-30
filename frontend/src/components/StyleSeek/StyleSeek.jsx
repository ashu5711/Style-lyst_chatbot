import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, X, Camera } from 'lucide-react';
import { analyzeInspirationImage } from '../../services/aiService.aws';
import Header from '../Header/Header';
import './StyleSeek.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const StyleSeek = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identifiedItems, setIdentifiedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setImageSrc(base64);
        setIdentifiedItems([]);
        setSimilarProducts([]);
        await performAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async (base64) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeInspirationImage(base64);
      if (result && result.items && result.items.length > 0) {
        setIdentifiedItems(result.items);
        handleDotClick(result.items[0]);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image. Check that the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDotClick = async (item) => {
    setSelectedItemId(item.id);
    setIsSearching(true);
    setSimilarProducts([]);
    
    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.name, n_results: 8 })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSimilarProducts(data.results);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="matchmap-page">
      <Header />

      {!imageSrc ? (
        <div className="upload-container">
          <div className="upload-box">
            <Upload size={48} className="upload-icon" />
            <h2>Upload an Inspiration Photo</h2>
            <p>Upload a photo of an outfit you love, or take a photo with your camera.</p>
            <div className="upload-actions">
              <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} /> Upload Photo
              </button>
              <button className="upload-btn upload-btn--camera" onClick={() => cameraInputRef.current.click()}>
                <Camera size={18} /> Take Photo
              </button>
            </div>
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
          </div>
        </div>
      ) : (
        <div className="matchmap-workspace">
          <div className="inspiration-pane">
            <div className="image-wrapper">
              <img src={imageSrc} alt="Inspiration" className="inspiration-img" />
              
              {isAnalyzing && (
                <div className="analyzing-overlay">
                  <Loader2 className="spinner" size={48} />
                  <p>Detecting garments...</p>
                </div>
              )}

              {!isAnalyzing && identifiedItems.map((item) => (
                <div 
                  key={item.id}
                  className={`hotspot ${selectedItemId === item.id ? 'active' : ''}`}
                  style={{ top: `${item.y_percent}%`, left: `${item.x_percent}%` }}
                  onClick={() => handleDotClick(item)}
                  title={item.name}
                >
                  <div className="hotspot-inner"></div>
                </div>
              ))}
            </div>
            
            <button className="reset-btn" onClick={() => setImageSrc(null)}>
              <X size={16} /> Try another image
            </button>
          </div>

          <div className="results-pane">
            <div className="results-header">
              <h2>Similar Products</h2>
              {selectedItemId && (
                <p className="selected-item-name">
                  Matches for: <strong>{identifiedItems.find(i => i.id === selectedItemId)?.name}</strong>
                </p>
              )}
            </div>

            {isSearching ? (
              <div className="loading-results">
                <Loader2 className="spinner" size={32} />
                <p>Searching catalog...</p>
              </div>
            ) : (
              <div className="similar-products-grid">
                {similarProducts.map((prod, idx) => (
                  <div key={idx} className="similar-product-card">
                    <div className="img-container">
                      <img src={prod.imageUrl} alt={prod.description || prod.name || 'Product'} />
                    </div>
                    <div className="prod-details">
                      <span className="prod-brand">JCPenney</span>
                      <span className="prod-name">{prod.folder.replace('_', ' ')}</span>
                      <span className="prod-price">$24.99</span>
                    </div>
                  </div>
                ))}
                
                {!isSearching && similarProducts.length === 0 && selectedItemId && (
                  <div className="no-results">
                    <p>No similar items found in the database.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSeek;
