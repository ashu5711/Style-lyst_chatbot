import React, { useState } from 'react';
import { ChevronRight, Star, StarHalf, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import Header from './Header/Header';
import { pdpData } from '../data/pdpData';
import { reviews } from '../data/reviews';
import './MockPDP.css';

const MockPDP = () => {
  const [mainImage, setMainImage] = useState(pdpData.images[0].url);
  const [selectedColor, setSelectedColor] = useState(pdpData.colorSequences[0].color);
  const [selectedSize, setSelectedSize] = useState(pdpData.sizes[2].abbr);
  const [visibleReviews, setVisibleReviews] = useState(5);

  const renderStars = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} fill="#ecad0a" color="#ecad0a" size={size} />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} fill="#ecad0a" color="#ecad0a" size={size} />);
      } else {
        stars.push(<Star key={i} color="#ecad0a" size={size} />);
      }
    }
    return stars;
  };

  return (
    <div className="mock-pdp">
      <Header />

      {/* Sale banner strip */}
      <div className="pdp-sale-strip">
        <span>🔥 Sale ends soon — Extra 25% off with code <strong>STYLE25</strong></span>
      </div>

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
            <div className="stars">{renderStars(pdpData.valuation.rating)}</div>
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
                  style={{ backgroundColor: colorItem.code, border: colorItem.border || '1px solid transparent' }}
                  onClick={() => setSelectedColor(colorItem.color)}
                  title={colorItem.color}
                />
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

      {/* Reviews Section */}
      <section className="pdp-reviews-section">
        <div className="pdp-reviews-inner">
          <div className="pdp-reviews-header">
            <h2>Customer Reviews</h2>
            <div className="pdp-reviews-summary">
              <div className="pdp-reviews-rating-big">
                <span className="pdp-rating-number">{pdpData.valuation.rating}</span>
                <div>
                  <div className="pdp-rating-stars">{renderStars(pdpData.valuation.rating, 18)}</div>
                  <span className="pdp-rating-count">{reviews.length} Reviews</span>
                </div>
              </div>
              <div className="pdp-reviews-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = Math.round((count / reviews.length) * 100);
                  return (
                    <div key={star} className="pdp-bar-row">
                      <span className="pdp-bar-label">{star}</span>
                      <Star size={12} fill="#ecad0a" color="#ecad0a" />
                      <div className="pdp-bar-track">
                        <div className="pdp-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pdp-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pdp-reviews-list">
            {reviews.slice(0, visibleReviews).map(review => {
              const fitLabel = { 1: 'Runs Small', 2: 'Slightly Small', 3: 'True to Size', 4: 'Slightly Large', 5: 'Runs Large' }[review.fit];
              return (
                <div key={review.id} className="pdp-review-card">
                  <div className="pdp-review-top">
                    <div className="pdp-review-stars">{renderStars(review.rating, 14)}</div>
                    <span className="pdp-review-date">{review.date}</span>
                  </div>
                  <h4 className="pdp-review-title">{review.title}</h4>
                  <p className="pdp-review-body">{review.body}</p>
                  <div className="pdp-review-meta">
                    <span className="pdp-review-author">{review.nickname}</span>
                    <span className="pdp-review-location">{review.location}</span>
                    {review.age && <span className="pdp-review-age">{review.age}</span>}
                  </div>
                  <div className="pdp-review-tags">
                    <span className="pdp-review-tag">Fit: {fitLabel}</span>
                    <span className="pdp-review-tag">Value: {review.value}/5</span>
                    <span className="pdp-review-tag">Quality: {review.quality}/5</span>
                    {review.recommend && <span className="pdp-review-tag pdp-review-tag--rec">Recommends</span>}
                  </div>
                  <div className="pdp-review-helpful">
                    <span>Helpful?</span>
                    <button className="pdp-helpful-btn"><ThumbsUp size={13} /> {review.helpfulYes}</button>
                    <button className="pdp-helpful-btn"><ThumbsDown size={13} /> {review.helpfulNo}</button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleReviews < reviews.length && (
            <button className="pdp-reviews-more" onClick={() => setVisibleReviews(prev => prev + 10)}>
              Show More Reviews <ChevronDown size={16} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default MockPDP;
