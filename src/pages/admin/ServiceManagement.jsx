import React, { useEffect, useState } from "react";
import { getServices, updateServiceStatus,handleWalletRequest,getWalletRequests,getServiceLoginDetails } from "../../service/apiService";
import "./ServiceManagement.css";
import { BASE_IMAGE_URL } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";

function ServiceManagement() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [pending, setPending] = useState([]);
   const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);

  const shop_type = "service";
  
  const loadServices = async () => {
    setLoading(true);
    try {
      const [serviceRes, pendingRes] = await Promise.all([
        getServices(),
        getWalletRequests(shop_type),
      ]);
  
      setServices(serviceRes?.data || serviceRes || []);
      setPending(pendingRes?.data || pendingRes || []);
    } catch (err) {
      console.error("Load error", err);
      setServices([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };
  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(
        req.user_id,        // request_id
        action,        // approve | rejected
        "service"       // shop_type
      );
  
      loadServices(); // refresh list
    } catch (err) {
      console.error("Wallet action failed", err);
      alert("Failed to update wallet request");
    }
  };

  // const loadServices = async () => {
  //   setLoading(true);
  //   const res = await getServices();
  //   setServices(res.data || []);
  //   setLoading(false);
  // };

  useEffect(() => {
    loadServices();
  }, []);

  const toggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";
    await updateServiceStatus(service.id, newStatus);
    loadServices();
  };
  const openServiceModal = async (serviceId) => {
    setShowServiceModal(true);
    setServiceLoading(true);
    setSelectedService(null);
  
    try {
      const res = await getServiceLoginDetails(serviceId);
      if (res.status === "success") {
        setSelectedService(res.data);
      }
    } catch (e) {
      console.error("Failed to load service details", e);
    } finally {
      setServiceLoading(false);
    }
  };
  if (loading) return <p>Loading services...</p>;

  return (
    <div className="service-page">
      <h2 className="page-title">Service Management</h2>
  {/* Pending Approvals */}
          <div className="card shadow-sm p-4 bg-white rounded-lg">
  <h4 className="mb-4 font-semibold text-lg">
    Pending Fund Requests
  </h4>

  {pending.length === 0 ? (
    <p className="text-gray-500 text-sm">No pending requests</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-600">
            <th className="p-3">Shop</th>
            <th className="p-3">Amount</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {pending.map((p) => (
            <tr
              key={p.user_id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3 font-medium text-gray-800">
                {p.shop}
              </td>

              <td className="p-3 text-gray-700 font-semibold">
                ₹{p.amount}
              </td>

              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button
                    className="btn btn-success btn-sm px-3"
                    onClick={() => onWalletAction(p, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm px-3"
                    onClick={() => onWalletAction(p, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Owner</th>
              <th>Executive</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
                     <tr
  key={s.service_id}
  className="clickable-row"
  onClick={() => openServiceModal(s.service_id)}>
                <td>{s.name}</td>
                <td>{s.owner_name || "-"}</td>
                <td>{s.executive || "-"}</td>
                <td>{s.wallet_balance}%</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspended" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan="7">No services found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* SHOP DETAILS MODAL */}
      {showServiceModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-container">
      
            {/* CLOSE */}
            <button
              className="shop-modal-close"
              onClick={() => setShowServiceModal(false)}
            >
              ✕
            </button>
      
            {serviceLoading && (
              <p className="modal-loading">Loading service details...</p>
            )}
      
            {!serviceLoading && selectedService && (() => {
      
              const service = selectedService.service;
              const user = selectedService.user?.[0];
              const media = selectedService.media || [];
      
              const logo = media.find(m => m.logo)?.logo;
              const images = media.filter(m => m.images).map(m => m.images);
      
              return (
                <div className="shop-modal-content">
      
                  {/* ===== HEADER ===== */}
                  <div className="modal-header">
                    <img
                      src={logo ? `${BASE_IMAGE_URL}/${logo}` : "/shop-placeholder.png"}
                      className="modal-shop-logo"
                      alt="service Logo"
                    />
      
                    <div>
                      <h2>{service.name}</h2>
                      <p>Owner: {service.owner_name}</p>
                    </div>
                  </div>
      
                  {/* ===== STATS ===== */}
                  <div className="modal-stats">
                    <div className="stat-card">
                      <span>💰 Wallet</span>
                      <strong>₹ {service.wallet_balance}</strong>
                    </div>
      
                    <div className="stat-card">
                      <span>👥 Customers</span>
                      <strong>
                        {selectedService.transactions?.[0]?.customers_count || 0}
                      </strong>
                    </div>
                  </div>
      
                  {/* ===== CONTACT ===== */}
                  <div className="modal-section">
                    <h4>📞 Contact Details</h4>
                    <div>📍 {service.address || "Not set"}</div>
                    <div>📞 {user?.phone || "Not set"}</div>
                    <div>✉️ {user?.email || "Not set"}</div>
                  </div>
      
                  {/* ===== QR CODE ===== */}
                  {selectedService.scanner_code?.[0]?.scanner_code && (
                    <div className="modal-section center">
                      <h4>📱 service QR</h4>
      
                      <QRCodeCanvas
                        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                          selectedService.scanner_code[0].scanner_code
                        )}&type=service`}
                        size={160}
                        level="H"
                      />
                    </div>
                  )}
      
                  {/* ===== GALLERY ===== */}
                  <div className="modal-section">
                    <h4>🖼️ service Gallery</h4>
      
                    {images.length === 0 ? (
                      <p>No images uploaded</p>
                    ) : (
                      <div className="modal-gallery">
                        {images.map((img, i) => (
                          <img
                            key={i}
                            src={`${BASE_IMAGE_URL}/${img}`}
                            alt="service"
                          />
                        ))}
                      </div>
                    )}
                  </div>
      
                  {/* ===== MAP ===== */}
                  <div className="modal-section">
                    <h4>📍 service Location</h4>
      
                    {service.latitude && service.longitude ? (
                      <MapContainer
                        center={[
                          Number(service.latitude),
                          Number(service.longitude)
                        ]}
                        zoom={16}
                        style={{ height: "220px", borderRadius: "12px" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[
                            Number(service.latitude),
                            Number(service.longitude)
                          ]}
                          icon={shopIcon}
                        >
                          <Popup>
                            <strong>{service.name}</strong>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <p>Location not available</p>
                    )}
                  </div>
      
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* service modal end */}
    </div>
  );
}

export default ServiceManagement;
