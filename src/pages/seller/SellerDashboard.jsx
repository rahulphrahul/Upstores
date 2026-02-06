import React, { useEffect, useState } from "react";
import "./SellerDashboard.css";
import { getSellerLoginDetails } from "../../service/apiService";
import { QRCodeCanvas } from "qrcode.react";
import { BASE_IMAGE_URL } from "../../config/config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";

const SellerDashboard = () => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Get logged-in user (SAME AS SERVICE)
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerId = user?.seller_id || user?.id;
  
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const data = await getSellerLoginDetails(sellerId);
        console.log("seller api data:", data);

        if (data.status === "success") {
          setSeller(data.data);
        } else {
          console.error("Failed to fetch seller:", data.message);
        }
      } catch (err) {
        console.error("Error fetching seller:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSeller();
    } else {
      console.error("Seller ID missing");
      setLoading(false);
    }
  }, [sellerId]);
if (loading) return <p>Loading seller details...</p>;
if (!seller) return <p>No seller data available.</p>;

const logo =
  seller?.media?.find(m => m.logo && m.logo !== "")?.logo || null;

const images =
  seller?.media?.filter(m => m.images)?.map(m => m.images) || [];



console.log("tetet",seller);
  return (
    <div className="seller-page">
      {/* HEADER */}
      <div className="seller-header">
        <div className="seller-header-content">
          <img
            src={
                   logo
                     ? `${BASE_IMAGE_URL}/${logo}`
                     : "/shop-placeholder.png"
                 }
            alt={seller.seller?.name}
            className="seller-avatar"
          />

          <div className="seller-info">
            <h1 className="seller-name">{seller.seller?.name}</h1>
            <p className="seller-bio">{seller.seller?.description}</p>

            <div className="seller-meta">
              {/* <span className="seller-rating">
                ⭐ {seller.rating || 0} ({seller.review_count || 0} reviews)
              </span> */}
              <span className="seller-joined">
                🗓️ Joined{" "}
                {seller.seller?.created_at
                  ? new Date(seller.seller.created_at).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="seller-content">
        <div className="seller-main">
          {/* WALLET */}
          <section className="seller-wallet-section">
            <h2 className="section-title">💳 Seller Wallet</h2>

            <div className="seller-wallet-card">
              <div className="seller-wallet-balance">
                <span className="balance-label">Available Balance</span>
                <div className="balance-amount">
                  <span className="balance-currency">₹</span>
                  <span className="balance-value">
                    {seller.seller?.wallet_balance || "0.00"}
                  </span>
                </div>
              </div>

              <div className="seller-wallet-stats">
                <div className="wallet-stat-item">
                  <span>Total Customers</span>
                  <span>{seller?.transactions?.[0]?.customers_count || 0}</span>
                </div>

                {/* <div className="wallet-stat-item">
                  <span>Total Products</span>
                  <span>{seller.total_products || 0}</span>
                </div>

                <div className="wallet-stat-item">
                  <span>Total Earnings</span>
                  <span>₹ {seller.total_earnings || 0}</span>
                </div> */}
              </div>
            </div>
          </section>
          {/* TRANSACTIONS */}
          <section className="transactions-section">
            <h2 className="section-title">📊 Transactions</h2>
            <div className="transactions-list">
              {seller.transactions.length === 0 && (
                <p>No transactions</p>
              )}

              {seller.transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div>
                    <span>{tx.created_at}</span>
                  </div>
                  <div>
                    <span className={tx.type}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRODUCTS */}
          {/* <section className="products-section">
            <h2 className="section-title">📦 Products</h2>

            <div className="products-grid">
              {seller.products?.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />

                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>₹ {product.price}</p>

                    <div className="product-stats">
                      <span>Stock: {product.stock}</span>
                      <span>Sold: {product.sold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section> */}

          {/* STORE IMAGES */}
<section className="gallery-section">
  <h2 className="section-title">🖼️ Seller Gallery</h2>

  {images.length === 0 ? (
    <p className="text-muted">No Seller images uploaded</p>
  ) : (
    <div className="shop-gallery">
      {images.map((img, index) => (
        <div key={index} className="gallery-item">
          <img
            src={`${BASE_IMAGE_URL}/${img}`}
            alt={`seller image ${index + 1}`}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )}
</section>        </div>

        {/* SIDEBAR */}
        <div className="seller-sidebar">
          {/* QR */}
          <section className="seller-qr-section">
            <h2 className="section-title">📱 Seller QR Code</h2>

            <div className="seller-qr-card">
              <QRCodeCanvas
                id="seller-qr"
                value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                 seller?.scanner_code?.[0]?.scanner_code
                )}&type=seller`}
                size={200}
                level="H"
                includeMargin
              />

              <button
                className="download-qr-btn"
                onClick={() => {
                  const canvas = document.getElementById("seller-qr");
                  const pngUrl = canvas
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");

                  const link = document.createElement("a");
                  link.href = pngUrl;
                  link.download = `${seller.seller?.name}-qr.png`;
                  link.click();
                }}
              >
                Download QR
              </button>
            </div>
          </section>

          {/* CONTACT */}
          <section className="seller-contact-section">
            <h2 className="section-title">👤 Seller Information</h2>

            <div className="seller-contact-card">
              <div className="contact-item">
                📍 {seller.user?.[0]?.address || "-"}
              </div>
              <div className="contact-item">
                📞 {seller.user?.[0]?.phone || "-"}
              </div>
              <div className="contact-item">
                ✉️ {seller.user?.[0]?.email || "-"}
              </div>
            </div>
          </section>
            {/* location map */}
                    <section className="map-section">
            <h2 className="section-title">📍 Seller Location</h2>
          
            {seller.seller.latitude && seller.seller.longitude ? (
              <MapContainer
                center={[seller.seller.latitude, seller.seller.longitude]}
                zoom={16}
                style={{ height: "250px", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
          
                <Marker
                  position={[seller.seller.latitude, seller.seller.longitude]}
                  icon={shopIcon}
                >
                  <Popup>
                    <strong>{seller.seller.name}</strong>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>Location not available</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
