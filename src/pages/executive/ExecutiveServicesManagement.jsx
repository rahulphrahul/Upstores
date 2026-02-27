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
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;   // change if needed

  const [editingService, setEditingService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locating, setLocating] = useState(false);
const [showServiceQrPreview, setShowServiceQrPreview] = useState(false);

 const [form, setForm] = useState({
  name: "",
  owner_name: "",
  phone: "",
  wallet_balance: "",
  address: "",
  email: "",
  description: "",
  latitude: "",
  longitude: "",
  category_commissions: [
    { category_id: "", commission: "" }
  ],
});


  const [logo, setLogo] = useState(null);
  const [images, setImages] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
const [selectedService, setSelectedService] = useState(null);
const [serviceLoading, setServiceLoading] = useState(false);

 const shop_type ="service";
 /* =========================
   PAGINATION LOGIC
========================= */

const totalPages = Math.ceil(services.length / itemsPerPage);

const paginatedServices = services.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
  /* =========================
     LOAD SERVICES
  ========================= */
  const loadServices = async () => {
  const res = await getExecutiveServices(executiveId);
  if (res?.status === "success") {
    setServices(res.data || []);
    setCurrentPage(1);
  }
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
    address: "",
    email: "",
    description: "",
    latitude: "",
    longitude: "",
    category_commissions: [
      { category_id: "", commission: "" }
    ],
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
// category handle
const addCategoryRow = () => {
  setForm((prev) => ({
    ...prev,
    category_commissions: [
      ...prev.category_commissions,
      { category_id: "", commission: "" }
    ],
  }));
};

const removeCategoryRow = (index) => {
  setForm((prev) => ({
    ...prev,
    category_commissions: prev.category_commissions.filter(
      (_, i) => i !== index
    ),
  }));
};

const handleCategoryChange = (index, field, value) => {
  const updated = [...form.category_commissions];
  updated[index][field] = value;

  setForm({
    ...form,
    category_commissions: updated,
  });
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
 if (!form.name || !form.owner_name) {
  alert("Owner name and Service name are required");
  return;
}


    const fd = new FormData();
    fd.append("executive_id", executiveId);

   Object.keys(form).forEach((key) => {
  if (key !== "category_commissions" && form[key] !== "") {
    fd.append(key, form[key]);
  }
});

// send category commissions as JSON
fd.append(
  "category_commissions",
  JSON.stringify(form.category_commissions)
);


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
     category_commissions:
  service.category_commissions?.length
    ? service.category_commissions
    : [{ category_id: "", commission: "" }],
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

           

      



    <button
      type="button"
      className="btn btn-success"
      onClick={addCategoryRow}
    >
      + Add Category
    </button>

 <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
  {(form.category_commissions || []).map((row, index) => (
    <div key={index} className="d-flex gap-2 mt-2">

      <select
        className="form-control"
        value={row.category_id}
        onChange={(e) =>
          handleCategoryChange(index, "category_id", e.target.value)
        }
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        className="form-control"
        placeholder="Commission %"
        value={row.commission}
        onChange={(e) =>
          handleCategoryChange(index, "commission", e.target.value)
        }
      />

      {index > 0 && (
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => removeCategoryRow(index)}
        >
          ✕
        </button>
      )}
    </div>
  ))}



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
      {paginatedServices.map((s) => (

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
    {paginatedServices.map((s) => (

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
<div className="pagination">
  <button
    className="page-btn"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
  >
    ←
  </button>

  <span className="page-info">
    Page {currentPage} of {totalPages || 1}
  </span>

  <button
    className="page-btn"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
  >
    →
  </button>
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
           {/* ================= SERVICE QR CARD ================= */}
{selectedService.scanner_code?.[0]?.scanner_code && (
  <div className="modal-section">
    <div className="qr-master-card">

      <div className="qr-header">
        <h3 className="qr-shop-name">
          {selectedService.service?.name}
        </h3>
        <span className="qr-owner">
          Owner: {selectedService.service?.owner_name}
        </span>
      </div>

      <div
        className="qr-body zoomable"
        onClick={() => setShowServiceQrPreview(true)}
      >
        <QRCodeCanvas
          value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
            selectedService.scanner_code[0].scanner_code
          )}&type=service`}
          size={160}
          level="H"
        />
      </div>

      <div className="qr-footer">
        <span>Click or hover to enlarge</span>
      </div>

    </div>
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
{/* ================= SERVICE CATEGORY COMMISSIONS ================= */}
<div className="modal-section commission-master-section">

  <div className="section-header">
    <span className="section-sub">
      Total Categories: {selectedService.category_commissions?.length || 0}
    </span>
  </div>

  {selectedService.category_commissions &&
  selectedService.category_commissions.length > 0 ? (

    <div className="commission-grid">
      {selectedService.category_commissions.map((item) => (
        <div key={item.id} className="commission-card">

          <div className="commission-top">
            <h5>{item.category_name}</h5>

            <span
              className={`status-dot ${
                item.status === "active"
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              {item.status}
            </span>
          </div>

          <div className="commission-value">
            {item.commission}%
          </div>

          <div className="commission-label">
            Platform Commission
          </div>

        </div>
      ))}
    </div>

  ) : (
    <div className="empty-commission">
      <p>No commission configuration found for this service.</p>
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
{/* qr zoom */}
{showServiceQrPreview && (
  <div
    className="qr-preview-overlay"
    onClick={() => setShowServiceQrPreview(false)}
  >
    <div className="qr-preview-box">
      <QRCodeCanvas
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          selectedService.scanner_code[0].scanner_code
        )}&type=service`}
        size={300}
        level="H"
      />
    </div>
  </div>
)}

    </div>
  );
}

export default ExecutiveServiceManagement;
