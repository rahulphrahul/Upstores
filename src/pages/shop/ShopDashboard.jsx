import React, { useEffect, useState } from "react";
import "./ShopDashboard.css";
import { getShopLoginDetails } from "../../service/apiService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import { QRCodeCanvas } from "qrcode.react";


// Download QR helper
const downloadQr = (url) => {
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "shop-qr-code.png";
      link.click();
    });
};

const ShopDashboard = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Get logged-in user
  const user =  JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shop_id || user?.id; 
  // 👆 depending on how you store login data
// alert(shopId);
  useEffect(() => {
    if (!shopId) {
      setError("Shop not linked to this account");
      setLoading(false);
      return;
    }

    const loadShop = async () => {
      try {
        const res = await getShopLoginDetails(shopId);
        if (res.status === "success") {
          setShop(res.data);
        } else {
          setError(res.message || "Failed to load shop");
        }
      } catch (err) {
        setError("API error");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  if (loading) return <div className="loader">Loading shop...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!shop) return null;
// console.log("ffff",shop.scanner_code[0].scanner_code)
  return (
    <div className="shop-page">
      {/* HEADER */}
      <div className="shop-header">
        <div className="shop-header-content">
          <img
            src={shop.shop.logo || "/shop-placeholder.png"}
            alt={shop.shop.name}
            className="shop-logo"
          />
          <div className="shop-info">
            <h1 className="shop-name">{shop.shop.name}</h1>
            <p className="shop-description">
              Owner: {shop.shop.owner_name}
            </p>
            <div className="shop-meta">
              <span>📦 Orders: {shop.shop.total_orders}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-content">
        {/* MAIN */}
        <div className="shop-main">
          {/* WALLET */}
          <section className="wallet-section">
            <h2 className="section-title">💰 Wallet Balance</h2>
            <div className="wallet-card">
              <div className="wallet-balance">
                <span className="currency">₹</span>
                <span className="amount-shop">
                  {shop.shop.wallet_balance}
                </span>
              </div>
            </div>
          </section>

          {/* TRANSACTIONS */}
          <section className="transactions-section">
            <h2 className="section-title">📊 Transactions</h2>
            <div className="transactions-list">
              {shop.transactions.length === 0 && (
                <p>No transactions</p>
              )}

              {shop.transactions.map((tx) => (
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
        </div>

        {/* SIDEBAR */}
        <div className="shop-sidebar">
          {/* QR */}
          <section className="qr-section">
            <h2 className="section-title">📱 Shop QR</h2>
          <div className="qr-card">
  {shop.shop?.shop_id && (
    <>
      <QRCodeCanvas
        id="shop-qr"
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
 shop.scanner_code[0].scanner_code
)}&type=shop`}

        size={200}
        level="H"
        includeMargin={true}
      />

      <p className="qr-text">
        Scan to view shop details
      </p>

      <button
        className="download-qr-btn"
        onClick={() => {
          const canvas = document.getElementById("shop-qr");
          const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${shop.shop.name}-qr.png`;
          link.click();
        }}
      >
        Download QR
      </button>
    </>
  )}
</div>


          </section>

          {/* CONTACT */}
          <section className="contact-section">
            <h2 className="section-title">📞 Contact</h2>
            <div className="contact-card">
              <div>📍 {shop.shop.address || "Not set"}</div>
              <div>📞 {shop.user[0].phone || "Not set"}</div>
              <div>✉️ {shop.user[0].email|| "Not set"}</div>
            </div>
          </section>
          {/* location map */}
          <section className="map-section">
  <h2 className="section-title">📍 Shop Location</h2>

  {shop.shop.latitude && shop.shop.longitude ? (
    <MapContainer
      center={[shop.shop.latitude, shop.shop.longitude]}
      zoom={16}
      style={{ height: "250px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[shop.shop.latitude, shop.shop.longitude]}
        icon={shopIcon}
      >
        <Popup>
          <strong>{shop.shop.name}</strong>
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

export default ShopDashboard;
