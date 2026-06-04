import React, { useState } from 'react';
import Drawer from '../../components/Drawer';
import NotificationPanel from '../../components/NotificationPanel';
import './CustomerHome.css';
import { FALLBACK_IMAGE } from '../../config/config';

/* ===== TEMP DATA (Replace with API later) ===== */

const topBanners = [
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600",
  "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1600",
];

const bottomBanners = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600",
];

const shops = [
  {
    name: "Bakery",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=400",
  },
  {
    name: "Super Mart",
    image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=400",
  },
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400",
  },
  {
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=400",
  },
  {
    name: "Pharmacy",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400",
  },
];

const sellers = [
  {
    name: "Local Seller",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=400",
  },
  {
    name: "Wholesale Hub",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=400",
  },
  {
    name: "Verified Seller",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=400",
  },
];

const services = [
  {
    name: "Plumber",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400",
  },
  {
    name: "Electrician",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=400",
  },
  {
    name: "Cleaning",
    image: "https://images.unsplash.com/photo-1581578731571-fd7b8f5f5b38?q=80&w=400",
  },
  {
    name: "Delivery",
    image: "https://images.unsplash.com/photo-1586528116493-da8b47c89e98?q=80&w=400",
  },
];

function HomeView() {
  return (
    <div className="home-full-bleed">
      <div className="home">

        <Carousel images={topBanners} />

        <HorizontalSection title="Shops" items={shops} />
        <HorizontalSection title="Sellers" items={sellers} />
        <HorizontalSection title="Services" items={services} />

        <Carousel images={bottomBanners} />

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Carousel({ images }) {
  return (
    <div className="carousel">
      <div className="carousel-track">
        {images.map((img, i) => (
          <div className="carousel-slide" key={i}>
            <img src={img} alt="banner" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalSection({ title, items }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>{title}</h2>
        <button className="view-all">View all</button>
      </div>

      <div className="horizontal-list">
        {items.map((item, i) => (
          <div className="item-card" key={i}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeView;
