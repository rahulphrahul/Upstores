import React, { useEffect, useState } from "react";
import "./DashboardService.css";
import { getServiceLoginDetails,getServicePurchases,updateServicePurchaseStatus } from "../../service/apiService"; // your API service
import { QRCodeCanvas } from "qrcode.react";
import { BASE_IMAGE_URL } from "../../config/config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";

const DashboardService = () => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
    const [purchaseLoading, setPurchaseLoading] = useState(true);
  // 🔐 Get logged-in user
  const user =  JSON.parse(localStorage.getItem("user"));
  const serviceId = user?.service_id || user?.id; 

  useEffect(() => {
        getServicePurchases(serviceId).then(res => {
            if (res.status === "success") {
              setPurchases(res.data);
            }
            setPurchaseLoading(false);
          });
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
   const handleStatus = async (service_id, status) => {
    let reason = null;
  
    if (status === "REJECTED") {
      reason = prompt("Enter rejection reason");
      if (!reason) return;
    }
  
    const res = await updateServicePurchaseStatus({
      service_id,
      status,
      reason
    });
  
    if (res.status === "success") {
      setPurchases(prev =>
        prev.map(p =>
          p.id === service_id ? { ...p, status, rejection_reason: reason } : p
        )
      );
    } else {
      alert("Failed to update");
    }
  };
  if (loading) return <p>Loading service details...</p>;
if (!service) return <p>No service data available.</p>;
  const logo =
  service.media?.find(m => m.logo && m.logo !== "")?.logo;

const images =
  service.media?.filter(m => m.images).map(m => m.images) || [];
  // Download QR codelogo
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

  if (loading) return <p>Loading service details...</p>;
  if (!service) return <p>No service data available.</p>;

  return (
    <div className="shop-page">
      {/* HEADER */}
      <div className="shop-header">
        <div className="shop-header-content">
          <img  src={
                  logo
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : "/shop-placeholder.png"
                } alt={service.service.name} className="shop-logo" />
           <img
                src={
                  logo
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : "/shop-placeholder.png"
                }
                alt={service.service.name}
                className="shop-logo"
              />
          <div className="shop-info">
            <h1 className="shop-name">{service.service.name}</h1>
            <p className="shop-description">{service.service.description}</p>
            <div className="shop-meta">
              {/* <span className="shop-rating">⭐ {service.service.rating} Rating</span> */}
              <span className="shop-orders">🛠️ {service.customers_count || 0} customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="shop-content">
        <div className="shop-main">
          {/* WALLET */}
          <section className="wallet-section">
            <h2 className="section-title">💰 Wallet Balance</h2>
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
  {/* purchaeseb transaction */}
                    <section className="transactions-section">
            <h2 className="section-title">🧾 Purchase Transactions</h2>
          
            {purchaseLoading ? (
              <p>Loading purchases...</p>
            ) : purchases.length === 0 ? (
              <p>No purchase requests</p>
            ) : (
              <div className="table-wrapper">
                <table className="purchase-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Bill</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
          
                  <tbody>
                    {purchases.map(p => (
                      <tr key={p.id}>
                        <td>{p.created_at}</td>
                        <td>
                          <strong>{p.customer_name || "Guest"}</strong><br />
                          <small>{p.customer_phone}</small>
                        </td>
                        <td>₹{p.amount}</td>
                        <td>
                          {p.bill_image && (
                            <a
                              href={`${BASE_IMAGE_URL}/${p.bill_image}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          )}
                        </td>
                        <td>
                          <span className={`status ${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.status === "PENDING" ? (
                            <>
                              <button
                                className="btn-accept"
                                onClick={() => handleStatus(p.service_id, "CONFIRMED")}
                              >
                                Accept
                              </button>
          
                              <button
                                className="btn-reject"
                                onClick={() => handleStatus(p.service_id, "REJECTED")}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {/* end purchase transaction */}
          {/* TRANSACTIONS */}
          <section className="transactions-section">
            <h2 className="section-title">📊 Service Transactions</h2>
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
            <h2 className="section-title">🖼️ Shop Gallery</h2>
          
            {images.length === 0 ? (
              <p className="text-muted">No shop images uploaded</p>
            ) : (
              <div className="shop-gallery">
                {images.map((img, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={`${BASE_IMAGE_URL}/${img}`}
                      alt={`service image ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="shop-sidebar">
          {/* QR */}
          <section className="qr-section">
            <h2 className="section-title">📱 Service QR Code</h2>
            <div className="qr-card">
             {service && (
    <>
      <QRCodeCanvas
        id="shop-qr"
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
 service.scanner_code.scanner_code
)}&type=service`}

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
          link.download = `${service.service.name}-qr.png`;
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
            <h2 className="section-title">📞 Contact Information</h2>
            <div className="contact-card">
              <div className="contact-item">📍 {service.user[0]['address'] || "-"}</div>
              <div className="contact-item">📞 {service.user[0]['phone'] || "-"}</div>
              <div className="contact-item">✉️ {service.user[0]['email'] || "-"}</div>
            </div>
          </section>
           {/* location map */}
                              <section className="map-section">
                      <h2 className="section-title">📍 Service Location</h2>
                    
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
    </div>
  );
};

export default DashboardService;
