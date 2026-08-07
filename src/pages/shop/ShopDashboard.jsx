import React, { useEffect, useState } from "react";
import "./ShopDashboard.css";
import { getShopLoginDetails } from "../../service/apiService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import { QRCodeCanvas } from "qrcode.react";
import { BASE_IMAGE_URL, FALLBACK_IMAGE } from "../../config/config";
import { APP_LOGO_URL } from "../../config/config";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

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
const [qrZoom, setQrZoom] = useState(false);

  //  Get logged-in user
  const user =  JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shop_id || user?.id; 
  // depending on how you store login data
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
const logo =
  shop.media?.length>0 ? shop.media?.find(m => m.logo && m.logo !== "")?.logo:null;

const images =
  shop.media?.filter(m => m.images).map(m => m.images) || [];

// console.log("img",images);
const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];
  console.log("imgara",imageArray);

  // console.log("shop",shop.media);
// console.log("ffff",shop.scanner_code[0].scanner_code)
  return (
    <div className="shop-page">
      {/* HEADER */}
      <div className="shop-header">
        <div className="shop-header-content">
         {/* Logo */}
    <img
      src={
        logo!=null
          ? `${BASE_IMAGE_URL}/${logo}`
          : FALLBACK_IMAGE
      }
      alt={shop.shop.name}
      className="shop-logo"
    />
          <div className="shop-info">
            <h1 className="shop-name">{shop.shop.name}</h1>
            <p className="shop-description">
              Owner: {shop.shop.owner_name}
            </p>
            <div className="shop-meta">
              <span> Orders: {shop.shop.total_orders||0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-content">
        {/* MAIN */}
        <div className="shop-main">
          {/* STATS */}
<section className="stats-section">
  <div className="stats-grid">
    <div className="stat-card">
      <span className="stat-title">Total Purchases</span>
      <span className="stat-value">
        {shop.stats?.total_purchases || 0}
      </span>
    </div>

    <div className="stat-card success">
      <span className="stat-title">Confirmed</span>
      <span className="stat-value">
        {shop.stats?.confirmed_purchases || 0}
      </span>
    </div>

    <div className="stat-card warning">
      <span className="stat-title">Pending</span>
      <span className="stat-value">
        {shop.stats?.pending_purchases || 0}
      </span>
    </div>

    <div className="stat-card revenue">
      <span className="stat-title">Total Revenue</span>
      <span className="stat-value">
        ₹{shop.stats?.total_revenue || 0}
      </span>
    </div>
  </div>
</section>

          {/* WALLET */}
          <section className="wallet-section">
            <h2 className="section-title"> Wallet Balance</h2>
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
            <h2 className="section-title"> Transactions</h2>
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
          {/* SHOP GALLERY */}
<section className="gallery-section">
  <h2 className="section-title"> Shop Gallery</h2>

  {images.length === 0 ? (
    <p className="text-muted">No shop images uploaded</p>
  ) : (
<div className="shop-gallery">

  {imageArray.length > 0 ? (
    imageArray.map((img, index) => (
      <div key={index} className="gallery-item">
        <img
          src={`${BASE_IMAGE_URL}/${img.trim()}` || FALLBACK_IMAGE}
          alt={`shop image ${index + 1}`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
    ))
  ) : (
    <div className="gallery-item">
      <img
        src={FALLBACK_IMAGE}
        alt="no image available"
        loading="lazy"
      />
    </div>
  )}

</div>
  )}
</section>

        </div>

        {/* SIDEBAR */}
        <div className="shop-sidebar">
          {/* QR */}
     <section className="qr-section">
  <div className="qr-master-card">

    {/* Header */}
    <div className="qr-header">
      <h2 className="qr-title">Shop QR</h2>
      <span className="qr-badge">Scan & Pay</span>
    </div>

    {/* Owner info */}
    <div className="qr-owner">
      <strong>{shop.shop.name}</strong>
      <span>Owner: {shop.shop.owner_name}</span>
    </div>

    {/* QR Display */}
    <div
      className="qr-wrapper"
      onClick={() => setQrZoom(true)}
    >
      <QRCodeCanvas
        id="shop-qr"
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          shop.scanner_code?.[0]?.scanner_code || ""
        )}&type=shop`}
        size={190}
        level="H"
        includeMargin={true}
      />
    </div>

    <p className="qr-caption">
      Tap or hover to scan
    </p>

    {/* Actions */}
    <div className="qr-actions">
      <button
        className="qr-download-btn"
onClick={async () => {

  const pdfSize = 1500; // Perfect square size
  const canvas = document.createElement("canvas");
  canvas.width = pdfSize;
  canvas.height = pdfSize;

  const ctx = canvas.getContext("2d");

  // ===== Background =====
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pdfSize, pdfSize);

  const centerX = pdfSize / 2;

  // ===== QR VALUE =====
  const qrValue = `https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
    shop.scanner_code[0].scanner_code
  )}&type=shop`;

  // ===== Generate HD QR =====
  const qrDataUrl = await QRCode.toDataURL(qrValue, {
    width: 1000,  // High resolution
    margin: 1,
  });

  const qrImg = new Image();
  qrImg.src = qrDataUrl;

  qrImg.onload = () => {

    const qrSize = 650; // QR display size

    const logoImg = new Image();
    logoImg.src = APP_LOGO_URL;

    logoImg.onload = () => {

      // ===== Logo same width as QR =====
     const logoWidth = qrSize;
      const ratio = logoWidth / logoImg.width;
 const logoHeight = (qrSize * logoImg.height) / logoImg.width;

      // ===== Layout spacing =====
      const nameHeight = 100;
      const gap1 = 30;   // name → QR
      const gap2 = 0;   // QR → logo

      // ===== Calculate total height =====
      const totalHeight =
        nameHeight +
        gap1 +
        qrSize +
        gap2 +
        logoHeight;

      // ===== Start vertically centered =====
      let currentY = (pdfSize - 1080) / 2;

      // ===== Draw shop Name =====
      ctx.fillStyle = "#111827";
      ctx.font = "bold 70px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        shop.shop.name,
        centerX,
        currentY + nameHeight / 2
      );

      currentY += nameHeight + gap1;

      // ===== Draw QR (Sharp) =====
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        qrImg,
        centerX - qrSize / 2,
        currentY,
        qrSize,
        logoHeight
      );

      currentY += qrSize -150;

      // ===== Draw Logo =====
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        logoImg,
        centerX - logoWidth / 2,
        currentY,
        logoWidth,
        logoHeight
      );

      // ===== Export PDF =====
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pdfSize, pdfSize],
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, pdfSize, pdfSize);

      pdf.save(`${shop.shop.name}-QR.pdf`);
    };
  };
}}

      >
        Download QR
      </button>
    </div>
  </div>
</section>

<section className="commission-section">
  <h2 className="section-title"> Categories</h2>

  <div className="commission-card">
    {shop.categories?.length > 0 ? (
      shop.categories.map((cat) => (
        <div key={cat.id} className="commission-row">
          <span className="commission-category">
            {cat.name}
          </span>
          <span className="commission-value">
            {cat.commission}%
          </span>
        </div>
      ))
    ) : (
      <p className="text-muted">No Categories Found</p>
    )}
  </div>
</section>



          {/* CONTACT */}
          <section className="contact-section">
            <h2 className="section-title"> Contact</h2>
            <div className="contact-card">
              <div>📍 {shop.shop.address || "Not set"}</div>
              <div>📞 {shop.user[0].phone || "Not set"}</div>
              <div>✉️ {shop.user[0].email|| "Not set"}</div>
            </div>
          </section>
          {/* location map */}
          <section className="map-section">
  <h2 className="section-title"> Shop Location</h2>

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
      {qrZoom && (
  <div className="qr-zoom-overlay" onClick={() => setQrZoom(false)}>
    <div className="qr-zoom-box">
      <QRCodeCanvas
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          shop.scanner_code?.[0]?.scanner_code || ""
        )}&type=shop`}
        size={320}
        level="H"
        includeMargin={true}
      />
      <p className="qr-zoom-text">Tap anywhere to close</p>
    </div>
  </div>
)}

    </div>
  );
};

export default ShopDashboard;
