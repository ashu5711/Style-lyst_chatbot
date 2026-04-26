import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronRight, Star, StarHalf } from 'lucide-react';
import { pdpData } from '../data/pdpData';
import './MockPDP.css';

const MockPDP = () => {
  const [mainImage, setMainImage] = useState(pdpData.images[0].url);
  const [selectedColor, setSelectedColor] = useState(pdpData.colorSequences[0].color);
  const [selectedSize, setSelectedSize] = useState(pdpData.sizes[2].abbr);

  // Helper to render stars based on rating (e.g., 4.75)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} fill="#ecad0a" color="#ecad0a" size={16} />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} fill="#ecad0a" color="#ecad0a" size={16} />);
      } else {
        stars.push(<Star key={i} color="#ecad0a" size={16} />);
      }
    }
    return stars;
  };

  return (
    <div className="mock-pdp">
      {/* Header */}
      <header className="pdp-header">
        <div className="header-left">
          <Menu className="icon" />
          <div className="logo">JCPenney</div>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Search products..." />
          <Search className="search-icon" />
        </div>
        <div className="header-right">
          <div className="header-item"><User className="icon" /> Sign In</div>
          <div className="header-item"><ShoppingCart className="icon" /> Cart</div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <span>Women</span> <ChevronRight className="chevron" /> 
        <span>Tops</span> <ChevronRight className="chevron" /> 
        <span>Sleeveless Tops</span>
      </nav>

      {/* Main Product Section */}
      <main className="product-container">
        
        {/* Left Column: Images + Accordions */}
        <div className="product-left-column">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="thumbnail-list">
              {pdpData.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img.url} 
                  alt={img.altText} 
                  className={`thumbnail ${mainImage === img.url ? 'active' : ''}`}
                  onClick={() => setMainImage(img.url)}
                />
              ))}
            </div>
            <div className="main-image-container">
              <img src={mainImage} alt={pdpData.name} className="main-image" />
            </div>
          </div>

          <div className="product-accordion horizontal-accordion">
            <div className="accordion-item">
              <h3 className="accordion-header">Product Details</h3>
              <div className="accordion-content">
                <p className="product-description-text">{pdpData.productDetails[0].value}</p>
                <ul className="details-list">
                  {pdpData.productDetails.slice(1).map((detail, idx) => (
                    <li key={idx}><strong>{detail.label}:</strong> {detail.value}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="accordion-item">
              <h3 className="accordion-header">Shipping & Returns</h3>
              <div className="accordion-content">
                <ul className="shipping-list">
                  {pdpData.shippingAndReturns.map((item, idx) => (
                    <li key={idx}>
                      <span className="shipping-label">{item.label}</span>
                      <p className="shipping-value">{item.value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="product-details">
          <h1 className="product-title">{pdpData.name}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(pdpData.valuation.rating)}
            </div>
            <span className="rating-text">({pdpData.valuation.reviews.count} Reviews)</span>
          </div>

          <div className="product-price">
            <span className="sale-price">$14.99</span>
            <span className="original-price">$30.00</span>
            <span className="discount-tag">50% OFF</span>
          </div>

          <p className="promotional-text">with code: STYLE25</p>

          <div className="product-color">
            <h3>Color: <span>{selectedColor}</span></h3>
            <div className="color-options">
              {pdpData.colorSequences.map((colorItem) => (
                <div 
                  key={colorItem.color}
                  className={`color-swatch ${selectedColor === colorItem.color ? 'active' : ''}`} 
                  style={{ 
                    backgroundColor: colorItem.code, 
                    border: colorItem.border || '1px solid transparent' 
                  }}
                  onClick={() => setSelectedColor(colorItem.color)}
                  title={colorItem.color}
                ></div>
              ))}
            </div>
          </div>

          <div className="product-size">
            <div className="size-header">
              <h3>Size:</h3>
              <a href="#" className="size-guide">{pdpData.brand.name} Misses & Petite Size Guide</a>
            </div>
            <div className="size-options">
              {pdpData.sizes.map(sizeItem => (
                <button 
                  key={sizeItem.abbr}
                  className={`size-btn ${selectedSize === sizeItem.abbr ? 'active' : ''}`}
                  onClick={() => setSelectedSize(sizeItem.abbr)}
                  title={sizeItem.size}
                >
                  {sizeItem.abbr}
                </button>
              ))}
            </div>
          </div>

          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </main>
    </div>
  );
};

export default MockPDP;
