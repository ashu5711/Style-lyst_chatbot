import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Camera } from 'lucide-react';
import './MockHome.css';
import { pdpData } from '../data/pdpData'; // Using this just to grab the vest image for the "Recently Viewed" section

const MockHome = () => {
  const vestImage = pdpData.images[0].url;

  return (
    <div className="mock-home">
      {/* Header */}
      <header className="pdp-header">
        <div className="header-left">
          <Menu className="icon" />
          <Link to="/" className="logo-link">
            <div className="logo">JCPenney</div>
          </Link>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Search products..." />
          <div className="search-actions">
            <Search className="search-icon" />
          </div>
        </div>
        <div className="header-right">
          <Link to="/matchmap" className="header-item" style={{textDecoration: 'none', color: 'inherit'}}>
            <Camera className="icon" style={{marginRight: '5px'}} /> MatchMap
          </Link>
          <div className="header-item"><User className="icon" /> Sign In</div>
          <div className="header-item"><ShoppingCart className="icon" /> Cart</div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="secondary-nav">
        <ul>
          <li>Valentine's Day</li>
          <li>Women</li>
          <li>Men</li>
          <li>Kids</li>
          <li>Home</li>
          <li>Shoes</li>
          <li>Jewelry</li>
          <li>Sephora</li>
          <li className="clearance-tab">Clearance</li>
        </ul>
      </nav>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Spring Style Event</h1>
          <p>Up to 50% off select apparel & shoes for the family.</p>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </section>

      <main className="home-content">
        {/* Category Grid */}
        <section className="category-section">
          <h2>Shop by Category</h2>
          <div className="category-grid">
            <div className="category-card" style={{backgroundColor: '#f8d2cc'}}>
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" alt="Women" />
              <h3>Women's Apparel</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#cce5f8'}}>
              <img src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&q=80" alt="Men" />
              <h3>Men's Apparel</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#e6ccf8'}}>
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" alt="Home" />
              <h3>Home & Bedding</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#f8f4cc'}}>
              <img src="https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&q=80" alt="Shoes" />
              <h3>Shoes & Accessories</h3>
            </div>
          </div>
        </section>

        {/* Recently Viewed (Links to PDP) */}
        <section className="recently-viewed">
          <h2>Recently Viewed</h2>
          <div className="products-scroll">
            <Link to="/p/ana-womens-crew-neck-sleeveless-vest/ppr5008658749?pTmplType=regular" className="product-card">
              <div className="product-image-wrapper">
                <img src={vestImage} alt="a.n.a Womens Crew Neck Sleeveless Vest" />
              </div>
              <div className="product-info">
                <span className="brand-name">a.n.a</span>
                <span className="product-name">Womens Crew Neck Sleeveless Vest</span>
                <div className="price-row">
                  <span className="sale-price">$14.99</span>
                  <span className="original-price">$30.00</span>
                </div>
              </div>
            </Link>
            
            {/* Dummy cards */}
            <div className="product-card dummy">
              <div className="product-image-wrapper">
                <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80" alt="Short Sleeve Cardigan" />
              </div>
              <div className="product-info">
                <span className="brand-name">Liz Claiborne</span>
                <span className="product-name">Short Sleeve Cardigan</span>
                <div className="price-row">
                  <span className="sale-price">$24.99</span>
                </div>
              </div>
            </div>

            <div className="product-card dummy">
              <div className="product-image-wrapper">
                <img src="https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80" alt="Mid-Rise Denim Shorts" />
              </div>
              <div className="product-info">
                <span className="brand-name">St. John's Bay</span>
                <span className="product-name">Mid-Rise Denim Shorts</span>
                <div className="price-row">
                  <span className="sale-price">$19.99</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mock-footer">
        <p>© 2026 Penney IP LLC. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default MockHome;
