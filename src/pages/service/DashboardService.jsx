import React, { useEffect, useState } from "react";
import "./DashboardService.css";
import { getServiceLoginDetails } from "../../service/apiService"; // your API service
import { QRCodeCanvas } from "qrcode.react";
import { BASE_IMAGE_URL,FALLBACK_IMAGE } from "../../config/config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";

const DashboardService = () => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  // Get logged-in user
  const user =  JSON.parse(localStorage.getItem("user"));
  const serviceId = user?.service_id || user?.id; 
const [qrZoom, setQrZoom] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceLoginDetails(serviceId);
        console.log("datat",data.data);
        if (data.status === "success") {
          setService(data.data); // make sure API returns `service` object
        } else {
          console.error("Failed to fetch service:", data.message);
        }
      } catch (err) {
        console.error("Error fetching service:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);
  if (loading) return <p>Loading seller details...</p>;
if (!service) return <p>No seller data available.</p>;
  const logo =
  service.media?.length >0? service.media?.find(m => m.logo && m.logo !== "")?.logo:null;

const images =
  service.media?.filter(m => m.images).map(m => m.images) || [];
  // Download QR code
  const downloadQr = (url) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "service-qr-code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };
        

const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];
  console.log("imgara",imageArray);
  if (loading) return <p>Loading service details...</p>;
  if (!service) return <p>No service data available.</p>;
console.log("ssss",service)
  return (
    <div className="shop-page">
      {/* HEADER */}
      <div className="shop-header">
        <div className="shop-header-content">
          <img  src={
                  logo!=null
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : FALLBACK_IMAGE
                } alt={service.service.name} className="shop-logo" />
           <img
                src={
                  logo!=null
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : FALLBACK_IMAGE
                }
                alt={service.service.name}
                className="shop-logo"
              />
          <div className="shop-info">
            <h1 className="shop-name">{service.service.name}</h1>
            <p className="shop-description">{service.service.description}</p>
            <div className="shop-meta">
              {/* <span className="shop-rating"> {service.service.rating} Rating</span> */}
              <span className="shop-orders"> {service.customers_count || 0} customers</span>
            </div>
          </div>
        </div>
      </div>
            {/* STATS */}
<section className="stats-section">
  <div className="stats-grid">
    <div className="stat-card">
      <span className="stat-title">Total Purchases</span>
      <span className="stat-value">
        {service.stats?.total_purchases || 0}
      </span>
    </div>

    <div className="stat-card success">
      <span className="stat-title">Confirmed</span>
      <span className="stat-value">
        {service.stats?.confirmed_purchases || 0}
      </span>
    </div>

    <div className="stat-card warning">
      <span className="stat-title">Pending</span>
      <span className="stat-value">
        {service.stats?.pending_purchases || 0}
      </span>
    </div>

    <div className="stat-card revenue">
      <span className="stat-title">Total Revenue</span>
      <span className="stat-value">
        ₹{service.stats?.total_revenue || 0}
      </span>
    </div>
  </div>
</section>

      {/* CONTENT */}
      <div className="shop-content">
        <div className="shop-main">
          {/* WALLET */}
          <section className="wallet-section">
            <h2 className="section-title"> Wallet Balance</h2>
            <div className="wallet-card">
              <div className="wallet-balance">
                <span className="currency">₹</span>
                <span className="amount">{service.service.walletBalance?.toFixed(2)||0}</span>
              </div>
              <div className="wallet-stats">
                {/* <div className="stat-item">
                  <span className="stat-label">Total Earnings</span>
                  <span className="stat-value">{service.currency} {service.totalEarnings}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Services</span>
                  <span className="stat-value">{service.totalServices}</span>
                </div> */}
              </div>
            </div>
          </section>

          {/* TRANSACTIONS */}
          <section className="transactions-section">
            <h2 className="section-title"> Service Transactions</h2>
            <div className="transactions-list">
              {service.transactions?.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-id">{tx.id}</span>
                    <span className="transaction-description">{tx.description}</span>
                    <span className="transaction-date">{tx.date}</span>
                  </div>
                  <div className="transaction-details">
                    <span className={`transaction-amount ${tx.type}`}>
                      {tx.amount > 0 ? "+" : "-"}{service.currency} {Math.abs(tx.amount)}
                    </span>
                    <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* IMAGES */}
            {/* SHOP GALLERY */}
          <section className="gallery-section">
            <h2 className="section-title"> Service Gallery</h2>
          
            {images.length === 0 ? (
              <p className="text-muted">No service images uploaded</p>
            ) : (
   

<div className="shop-gallery">

  {imageArray.length > 0 ? (
    imageArray.map((img, index) => (
      <div key={index} className="gallery-item">
        <img
          src={`${BASE_IMAGE_URL}/${img.trim()}` || FALLBACK_IMAGE}
          alt={`service image ${index + 1}`}
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
      <h2 className="qr-title">Service QR</h2>
      <span className="qr-badge">Instant Access</span>
    </div>

    {/* Service Info */}
    <div className="qr-owner">
      <strong>{service.service.name}</strong>
      <span>Owner: {service.service.owner_name}</span>
    </div>

    {/* QR Display */}
    {service.scanner_code[0]?.scanner_code && (
      <>
        <div
          className="qr-wrapper"
          onClick={() => setQrZoom(true)}
        >
          
          <QRCodeCanvas
            id="service-qr"
            value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
              service.scanner_code[0].scanner_code
            )}&type=service`}
            size={190}
            level="H"
            includeMargin
          />
        </div>

        <p className="qr-caption">
          Scan to view details
        </p>

        <div className="qr-actions">
          <button
            className="qr-download-btn"
            onClick={() => {
              const qrCanvas = document.getElementById("service-qr");
              if (!qrCanvas) return;

              const size = 420;
              const canvas = document.createElement("canvas");
              canvas.width = size;
              canvas.height = size + 120;

              const ctx = canvas.getContext("2d");

              // Background
              ctx.fillStyle = "#f8fafc";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Card
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = "rgba(0,0,0,0.15)";
              ctx.shadowBlur = 25;
              ctx.fillRect(20, 20, size - 40, size + 80);
              ctx.shadowBlur = 0;

              // Service Name
              ctx.fillStyle = "#111827";
              ctx.font = "bold 24px Arial";
              ctx.textAlign = "center";
              ctx.fillText(
                service.service.name,
                size / 2,
                60
              );

              // // Owner
              // ctx.fillStyle = "#6b7280";
              // ctx.font = "16px Arial";
              // ctx.fillText(
              //   `Owner: ${service.service.owner_name}`,
              //   size / 2,
              //   90
              // );

              // QR
              const qrSize = 240;
              const qrX = (size - qrSize) / 2;
              const qrY = 120;
              ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

              // Footer
              ctx.fillStyle = "#9ca3af";
              ctx.font = "14px Arial";
              ctx.fillText(
                "Scan to view details",
                size / 2,
                qrY + qrSize + 40
              );

              const link = document.createElement("a");
              link.download = `${service.service.name}-qr-card.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
            }}
          >
            Download QR
          </button>
        </div>
      </>
    )}
  </div>
</section>
<section className="commission-section">
  <h2 className="section-title">💸 Categories</h2>

  <div className="commission-card">
    {service.categories?.length > 0 ? (
      service.categories.map((cat) => (
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
            <h2 className="section-title"> Contact Information</h2>
            <div className="contact-card">
              <div className="contact-item">📍 {service.user[0]['address'] || "-"}</div>
              <div className="contact-item">📞 {service.user[0]['phone'] || "-"}</div>
              <div className="contact-item">✉️ {service.user[0]['email'] || "-"}</div>
            </div>
          </section>
           {/* location map */}
                              <section className="map-section">
                      <h2 className="section-title"> Service Location</h2>
                    
                      {service.service.latitude && service.service.longitude ? (
                        <MapContainer
                          center={[service.service.latitude, service.service.longitude]}
                          zoom={16}
                          style={{ height: "250px", width: "100%", borderRadius: "12px" }}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                    
                          <Marker
                            position={[service.service.latitude, service.service.longitude]}
                            icon={shopIcon}
                          >
                            <Popup>
                              <strong>{service.service.name}</strong>
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
  <div
    className="qr-zoom-overlay"
    onClick={() => setQrZoom(false)}
  >
    <div className="qr-zoom-box">
      <QRCodeCanvas
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          service.scanner_code[0]?.scanner_code || ""
        )}&type=service`}
        size={320}
        level="H"
        includeMargin
      />
      <p className="qr-zoom-text">Tap anywhere to close</p>
    </div>
  </div>
)}

    </div>
  );
};

export default DashboardService;
