import React, { useEffect, useState } from "react";
import {
  getExecutiveServices,
  addExecutiveService,
  updateExecutiveService,
  updateExecutiveServiceStatus,
  getServiceLoginDetails,
  getCategories,
} from "../../service/apiService";
import { BASE_IMAGE_URL } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import "./ExecutiveServicesManagement.css";

function ExecutiveServiceManagement({ user }) {
  const executiveId = user.id;

  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    phone: "",
    wallet_balance: "",
    category_id: "",
    commission: "",
    address: "",
    email: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [logo, setLogo] = useState(null);
  const [images, setImages] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
const [selectedService, setSelectedService] = useState(null);
const [serviceLoading, setServiceLoading] = useState(false);

 const shop_type ="service";
  /* =========================
     LOAD SERVICES
  ========================= */
  const loadServices = async () => {
    const res = await getExecutiveServices(executiveId);
    if (res?.status === "success") setServices(res.data || []);
  };

  useEffect(() => {
    loadServices();
    getCategories(shop_type).then((res) => {
      if (res.status === "success") setCategories(res.data || []);
    });
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }
    setLogo(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    for (let f of files) {
      if (f.size > 2 * 1024 * 1024) {
        alert("Each image must be under 2MB");
        return;
      }
    }
    setImages(files);
  };

  const resetForm = () => {
    setForm({
      name: "",
      owner_name: "",
      phone: "",
      wallet_balance: "",
      category_id: "",
      commission: "",
      address: "",
      email: "",
      description: "",
      latitude: "",
      longitude: "",
    });
    setLogo(null);
    setImages([]);
    setEditingService(null);
    setShowForm(false);
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

  /* =========================
     GEO LOCATION
  ========================= */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(8),
          longitude: pos.coords.longitude.toFixed(8),
        }));
      },
      () => {
        setLocating(false);
        alert("Unable to fetch location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async () => {
    if (!form.name || !form.commission || !form.owner_name) {
      alert("Owner name, Service name, and commission are required");
      return;
    }

    const fd = new FormData();
    fd.append("executive_id", executiveId);

    Object.keys(form).forEach((key) => {
      if (form[key] !== "") fd.append(key, form[key]);
    });

    if (logo) fd.append("logo", logo);
    images.forEach((img) => fd.append("images[]", img));

    if (editingService) {
      fd.append("service_id", editingService.id);
      await updateExecutiveService(fd);
    } else {
      await addExecutiveService(fd);
    }

    resetForm();
    loadServices();
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || "",
      owner_name: service.owner_name || "",
      phone: service.phone || "",
      wallet_balance: service.wallet_balance || "",
      category_id: service.category_id || "",
      commission: service.commission || "",
      address: service.address || "",
      email: service.email || "",
      description: service.description || "",
      latitude: service.latitude || "",
      longitude: service.longitude || "",
    });
    setLogo(null);
    setImages([]);
    setShowForm(true);
  };

  /* =========================
     STATUS
  ========================= */
  const toggleStatus = async (service) => {
    const newStatus =
      service.status === "active" ? "inactive" : "active";

    await updateExecutiveServiceStatus(service.id, executiveId, newStatus);
    loadServices();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-service-page">
      <div className="page-header">
        <h2 className="page-title">My Services</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Service"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h4>{editingService ? "Edit Service" : "Add New Service"}</h4>

          <div className="form-grid">
            <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
            <input name="name" placeholder="Service Name" value={form.name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="wallet_balance" placeholder="Initial Wallet" value={form.wallet_balance} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <select name="category_id" className="form-control" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input name="commission" placeholder="Commission (%)" value={form.commission} onChange={handleChange} />

            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />

            <button type="button" className="btn btn-outline" onClick={getCurrentLocation} disabled={locating}>
              {locating ? "Fetching location..." : "📍 Use Current Location"}
            </button>

            <div>
              <label>🖼️ Service Logo (max 2MB)</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            <div>
              <label>📸 Service Images (multiple, max 2MB each)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingService ? "Update Service" : "Create Service"}
            </button>
          </div>
        </div>
      )}

    <div className="card">

  {/* ===== DESKTOP TABLE ===== */}
  <table className="data-table">
    <thead>
      <tr>
        <th>Service</th>
        <th>Owner</th>
        <th>Phone</th>
        <th>Email</th>
        <th>Wallet</th>
        <th>Status</th>
        <th>Location</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {services.map((s) => (
        <tr
          key={s.user_id}
          className="clickable-row"
          onClick={() => openServiceModal(s.user_id)}
        >
          <td data-label="Service">{s.name}</td>
          <td data-label="Owner">{s.owner_name}</td>
          <td data-label="Phone">{s.phone || "—"}</td>
          <td data-label="Email">{s.email || "—"}</td>
          <td data-label="Wallet">₹ {s.wallet_balance || 0}</td>
          <td data-label="Status">
            <span className={`status ${s.status}`}>{s.status}</span>
          </td>
          <td data-label="Location">
            {s.latitude ? (
              <a
                href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                View on Map
              </a>
            ) : "—"}
          </td>
          <td data-label="Action" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn"
              onClick={() => toggleStatus(s)}
            >
              {s.status === "active" ? "Suspend" : "Activate"}
            </button>
          </td>
        </tr>
      ))}

      {services.length === 0 && (
        <tr>
          <td colSpan="8" className="empty">
            No services found
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* ===== MOBILE CARD VIEW ===== */}
  <div className="mobile-service-list">
    {services.map((s) => (
      <div
        key={s.user_id}
        className="service-mobile-card"
        onClick={() => openServiceModal(s.user_id)}
      >
        {/* Header */}
        <div className="service-mobile-header">
          <div className="service-mobile-title">{s.name}</div>
          <span className={`status ${s.status}`}>{s.status}</span>
        </div>

        {/* Details */}
        <div className="service-mobile-sub">Owner: {s.owner_name}</div>
        <div className="service-mobile-sub">📞 {s.phone || "—"}</div>
        <div className="service-mobile-sub">✉️ {s.email || "—"}</div>
        <div className="service-mobile-sub">💰 Wallet: ₹ {s.wallet_balance || 0}</div>

        {/* Location */}
        {s.latitude && (
          <div className="service-mobile-meta">
            <a
              href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              📍 View Location
            </a>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: "10px" }}>
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleStatus(s);
            }}
          >
            {s.status === "active" ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* SERVICE DETAILS MODAL */}
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

        const logo =
          selectedService.media?.find(m => m.logo && m.logo !== "")?.logo;

        const images =
          selectedService.media?.filter(m => m.images).map(m => m.images) || [];

        return (
          <div className="shop-modal-content">

            {/* ================= HEADER ================= */}
            <div className="modal-header">
              <img
                src={
                  logo
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : "/shop-placeholder.png"
                }
                className="modal-shop-logo"
                alt="service Logo"
              />

              <div>
                <h2>{selectedService.service.name}</h2>
                <p>Owner: {selectedService.service.owner_name}</p>
              </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="modal-stats">
              <div className="stat-card">
                <span>💰 Wallet</span>
                <strong>₹ {selectedService.service.wallet_balance}</strong>
              </div>
              <div className="stat-card">
                <span>📦 Orders</span>
                <strong>{selectedService.service.total_orders}</strong>
              </div>
            </div>

            {/* ================= CONTACT ================= */}
            <div className="modal-section">
              <h4>📞 Contact Details</h4>
              <div>📍 {selectedService.service.address || "Not set"}</div>
              <div>📞 {selectedService.user?.[0]?.phone || "Not set"}</div>
              <div>✉️ {selectedService.user?.[0]?.email || "Not set"}</div>
            </div>

            {/* ================= QR ================= */}
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

            {/* ================= GALLERY ================= */}
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

            {/* ================= MAP ================= */}
            <div className="modal-section">
              <h4>📍 service Location</h4>

              {selectedService.service.latitude && selectedService.service.longitude ? (
                <MapContainer
                  center={[
                    selectedService.service.latitude,
                    selectedService.service.longitude
                  ]}
                  zoom={16}
                  style={{
                    height: "220px",
                    borderRadius: "12px"
                  }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      selectedService.service.latitude,
                      selectedService.service.longitude
                    ]}
                    icon={shopIcon}
                  >
                    <Popup>
                      <strong>{selectedService.service.name}</strong>
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

    </div>
  );
}

export default ExecutiveServiceManagement;
