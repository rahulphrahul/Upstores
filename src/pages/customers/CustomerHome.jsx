import React, { useState } from 'react';
import Drawer from '../../components/Drawer';
import NotificationPanel from '../../components/NotificationPanel';
import './CustomerHome.css';
import { FALLBACK_IMAGE } from '../../config/config';

const CustomerHome = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const closeAll = () => {
    setIsDrawerOpen(false);
    setIsNotificationOpen(false);
  };

  // Banner data
  const banners = [
    {
      id: 1,
      title: "Earn From Anywhere",
      text: "Work from home or on your own terms\n& make your future better.",
      buttonText: "Start Now",
      gradient: "linear-gradient(135deg, #3355FF 0%, #5577FF 100%)",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1600"
    },
    {
      id: 2,
      title: "Special Discount",
      text: "Get up to 50% off on all products\nthis weekend only!",
      buttonText: "Shop Now",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1600"
    },
    {
      id: 3,
      title: "Free Delivery",
      text: "Order now and get free delivery\non orders above $50.",
      buttonText: "Order Now",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1600"
    }
  ];

  return (
    <div className="upstores-container">
      {/* Overlay */}
      {(isDrawerOpen || isNotificationOpen) && (
        <div className="overlay" onClick={closeAll}></div>
      )}



      {/* Drawer Component */}
      <Drawer isOpen={isDrawerOpen} onClose={toggleDrawer} />

      {/* Notification Panel Component */}
      <NotificationPanel isOpen={isNotificationOpen} onClose={toggleNotification} />

      {/* Search Bar */}
      <div className="search-container-home">
        <input 
          type="text" 
          placeholder="Search....." 
          className="search-input"
        />
        <button className="search-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Banner Carousel */}
      <div className="banner-section">
        <div className="banner-carousel">
          {banners.map((banner) => (
            <div key={banner.id} className="banner" style={{ background: banner.gradient }}>
              <div className="banner-content">
                <h1 className="banner-title">{banner.title}</h1>
                <p className="banner-text">{banner.text}</p>
                <button className="start-btn">{banner.buttonText}</button>
              </div>
              <div className="banner-image">
                <img src={banner.image || FALLBACK_IMAGE} alt={banner.title} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shops Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Shops</h2>
          <a href="#" className="view-all">
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        
        <div className="category-scroll">
          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M38 12H10C8.89543 12 8 12.8954 8 14V34C8 35.1046 8.89543 36 10 36H38C39.1046 36 40 35.1046 40 34V14C40 12.8954 39.1046 12 38 12Z" fill="#8B4513"/>
                <rect x="12" y="18" width="24" height="3" fill="#654321"/>
                <path d="M24 12C24 10.8954 23.1046 10 22 10H18C16.8954 10 16 10.8954 16 12V14H32V12C32 10.8954 31.1046 10 30 10H26C24.8954 10 24 10.8954 24 12Z" fill="#654321"/>
              </svg>
            </div>
            <span className="category-name">BAGS</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <ellipse cx="24" cy="32" rx="12" ry="4" fill="#F4A460"/>
                <path d="M24 16C19 16 16 20 14 24C13 26 12 28 12 32H36C36 28 35 26 34 24C32 20 29 16 24 16Z" fill="#FFB6C1"/>
                <circle cx="20" cy="24" r="1.5" fill="#FF69B4"/>
                <circle cx="28" cy="24" r="1.5" fill="#FF69B4"/>
                <circle cx="24" cy="20" r="1.5" fill="#FF69B4"/>
                <path d="M24 14L22 16H26L24 14Z" fill="#FF1493"/>
              </svg>
            </div>
            <span className="category-name">BAKERY</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 10C17.373 10 12 15.373 12 22C12 28.627 17.373 34 24 34C30.627 34 36 28.627 36 22C36 15.373 30.627 10 24 10Z" fill="#1E90FF"/>
                <path d="M20 20L23 23L28 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 28L38 34M38 28L32 34" stroke="#FF4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="category-name">CLINIC</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="12" fill="#FFD700"/>
                <circle cx="24" cy="24" r="6" fill="#FFA500"/>
                <path d="M24 10V14M24 34V38M10 24H14M34 24H38" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 15L18 18M30 30L33 33M33 15L30 18M18 30L15 33" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="category-name">ELECTRICAL</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="10" y="14" width="28" height="20" rx="2" fill="#FF6B6B"/>
                <rect x="14" y="18" width="20" height="12" fill="#FFE0E0"/>
                <path d="M20 24L24 20L28 24M24 20V30" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="category-name">FASHION</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="32" height="24" rx="2" fill="#9C27B0"/>
                <circle cx="24" cy="24" r="6" fill="#E1BEE7"/>
                <circle cx="24" cy="24" r="3" fill="#9C27B0"/>
              </svg>
            </div>
            <span className="category-name">ELECTRONICS</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Services</h2>
          <a href="#" className="view-all">
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        
        <div className="category-scroll">
          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M36 22L34 16H14L12 22V32C12 33.1046 12.8954 34 14 34H34C35.1046 34 36 33.1046 36 32V22Z" fill="#1E90FF"/>
                <rect x="16" y="18" width="16" height="8" rx="2" fill="#87CEEB"/>
                <circle cx="18" cy="30" r="2" fill="#333"/>
                <circle cx="30" cy="30" r="2" fill="#333"/>
                <path d="M20 22H28" stroke="#1E90FF" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="category-name">AUTO</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="14" fill="#FFD700"/>
                <circle cx="24" cy="24" r="10" fill="#FFA500"/>
                <circle cx="24" cy="24" r="6" fill="#FF8C00"/>
                <path d="M24 18V12M18 24H12M24 30V36M30 24H36" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="category-name">REPAIR</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="12" fill="#666"/>
                <circle cx="18" cy="22" r="3" fill="#999"/>
                <circle cx="30" cy="22" r="3" fill="#999"/>
                <circle cx="24" cy="28" r="5" fill="#444"/>
                <path d="M20 28L24 32L28 28" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="category-name">MECHANICS</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 10C19 10 15 14 15 19C15 24 19 28 24 28C29 28 33 24 33 19C33 14 29 10 24 10Z" fill="#87CEEB"/>
                <ellipse cx="24" cy="32" rx="10" ry="3" fill="#1E90FF"/>
                <path d="M18 20C18 18 20 16 24 16C28 16 30 18 30 20" stroke="#1E90FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="21" cy="21" r="1.5" fill="#0066CC"/>
                <circle cx="27" cy="21" r="1.5" fill="#0066CC"/>
              </svg>
            </div>
            <span className="category-name">CLEANING</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="12" y="16" width="24" height="16" rx="2" fill="#4CAF50"/>
                <circle cx="24" cy="24" r="6" fill="#81C784"/>
                <path d="M24 20V24L27 27" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="category-name">PLUMBING</span>
          </div>

          <div className="category-item">
            <div className="category-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 8L28 18H38L30 24L34 34L24 28L14 34L18 24L10 18H20L24 8Z" fill="#FFC107"/>
              </svg>
            </div>
            <span className="category-name">PAINTING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
