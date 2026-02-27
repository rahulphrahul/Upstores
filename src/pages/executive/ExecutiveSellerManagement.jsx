import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getExecutiveSellers,
  addExecutiveSeller,
  updateExecutiveSeller,
  updateExecutiveSellerStatus,
  getSellerLoginDetails,
  getCategories,
} from "../../service/apiService";
import { BASE_IMAGE_URL , FALLBACK_IMAGE} from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import "./ExecutiveSellerManagement.css";

const MAX_IMAGE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_MB * 1024 * 1024;

function ExecutiveSellerManagement({ user }) {
  const executiveId = user.id;

  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
const [selectedSeller, setSelectedSeller] = useState(null);
const [sellerLoading, setSellerLoading] = useState(false);
const [showSellerQrPreview, setShowSellerQrPreview] = useState(false);

/* =========================
   PAGINATION LOGIC
========================= */

const totalPages = Math.ceil(sellers.length / itemsPerPage);

const paginatedSellers = sellers.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
const shop_type ="seller";
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


  /* =========================
     LOAD SELLERS
  ========================= */
  const loadSellers = async () => {
    try {
      const res = await getExecutiveSellers(executiveId);
     setSellers(res.data || []);
setCurrentPage(1);

    } catch (err) {
      console.error(err);
      setSellers([]);
    }
  };

  const loadCategories = async () => {
    const res = await getCategories(shop_type);
    if (res?.status === "success") setCategories(res.data || []);
  };

  useEffect(() => {
    loadSellers();
    loadCategories();
  }, []);

  const openSellerModal = async (sellerId) => {
    setShowSellerModal(true);
    setSellerLoading(true);
    setSelectedSeller(null);

    try {
      const res = await getSellerLoginDetails(sellerId);
      if (res.status === "success") {
        setSelectedSeller(res.data);
      }
    } catch (e) {
      console.error("Failed to load seller details", e);
    } finally {
      setSellerLoading(false);
    }
  };

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`Logo must be under ${MAX_IMAGE_MB}MB`);
      return;
    }
    setForm((prev) => ({ ...prev, logo: file }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    for (let f of files) {
      if (f.size > MAX_IMAGE_SIZE) {
        alert(`Each image must be under ${MAX_IMAGE_MB}MB`);
        return;
      }
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
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
        alert("Location access failed");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* =========================
     RESET FORM
  ========================= */
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
  // setLogo(null);
  // setImages([]);
 setEditingSeller(null);
  setShowForm(false);
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
     CREATE / UPDATE SELLER
  ========================= */
const handleSubmit = async () => {

  if (!form.name || !form.owner_name) {
    toast.error("Owner name and Seller name are required");
    return;
  }

  const fd = new FormData();

  Object.keys(form).forEach((key) => {
    if (
      key !== "logo" &&
      key !== "images" &&
      key !== "category_commissions" &&
      form[key] !== ""
    ) {
      fd.append(key, form[key]);
    }
  });

  // Send category commissions
  fd.append(
    "category_commissions",
    JSON.stringify(form.category_commissions)
  );

  fd.append("executive_id", executiveId);

  if (form.logo) fd.append("logo", form.logo);
  form.images.forEach((img) => fd.append("images[]", img));

  try {
    let res;

    if (editingSeller) {
      fd.append("seller_id", editingSeller.id);
      res = await updateExecutiveSeller(fd);
    } else {
      res = await addExecutiveSeller(fd);
    }

    if (res.status === "success") {
      toast.success(
        editingSeller
          ? "Seller updated successfully"
          : "Seller added successfully"
      );

      resetForm();
      loadSellers();
    } else {
      toast.error(res.message || "Something went wrong");
    }

  } catch (error) {
    toast.error("Server error. Please try again.");
  }
};

  /* =========================
     EDIT SELLER
  ========================= */
  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setForm({
   category_commissions:
  seller.category_commissions?.length
    ? seller.category_commissions
    : [{ category_id: "", commission: "" }],

      owner_name: seller.owner_name || "",
      name: seller.name || "",
      phone: seller.phone || "",
      email: seller.email || "",
      address: seller.address || "",
      description: seller.description || "",
      wallet_balance: seller.wallet_balance || "",
      latitude: seller.latitude || "",
      longitude: seller.longitude || "",
      logo: null,
      images: [],
    });
    setShowForm(true);
  };

  /* =========================
     TOGGLE STATUS
  ========================= */
  const toggleStatus = async (seller) => {
    const newStatus = seller.status === "active" ? "suspended" : "active";
    await updateExecutiveSellerStatus(seller.id, executiveId, newStatus);
    loadSellers();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-seller-page">
      <div className="page-header">
        <h2 className="page-title">My Sellers</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Seller"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h4>{editingSeller ? "Edit Seller" : "Add New Seller"}</h4>

          <div className="form-grid">
             <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
            <input name="name" placeholder="Seller Name" value={form.name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            {/* Category Dropdown */}
         

  
    <button
      type="button"
      className="btn btn-success"
      onClick={addCategoryRow}
    >
      + Add Catgory
    </button>
 <input name="wallet_balance" placeholder="Initial Wallet" value={form.wallet_balance} onChange={handleChange} />

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



           
            
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            {/* Latitude / Longitude */}
            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />
            <button
              className="btn btn-outline"
              onClick={getCurrentLocation}
              disabled={locating}
            >
              {locating ? "Fetching..." : "📍 Use Current Location"}
            </button>

            <div className="upload-group">
              <label className="upload-label">
                🖼️ Seller Logo <span className="upload-hint">(max 2MB)</span>
              </label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            <div className="upload-group">
              <label className="upload-label">
                📸 Seller Images <span className="upload-hint">(multiple • max 2MB each)</span>
              </label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingSeller ? "Update Seller" : "Create Seller"}
            </button>
          </div>
        </div>
      )}

      {/* =========================
           SELLER LIST (TABLE + MOBILE)
      ========================= */}
      <div className="card">
        {/* ===== DESKTOP TABLE ===== */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Seller</th>
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
          {paginatedSellers.map((s) => (

              <tr
                key={s.user_id}
                className="clickable-row"
                onClick={() => openSellerModal(s.user_id)}
              >
                <td data-label="Seller">{s.name}</td>
                <td data-label="Owner">{s.owner_name}</td>
                <td data-label="Phone">{s.phone}</td>
                <td data-label="Email">{s.email || "—"}</td>
                <td data-label="Wallet">₹ {s.wallet_balance}</td>
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
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">
                  No sellers found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ===== MOBILE CARD VIEW ===== */}
        <div className="mobile-shop-list">
         {paginatedSellers.map((s) => (

            <div
              key={s.user_id}
              className="shop-mobile-card"
              onClick={() => openSellerModal(s.user_id)}
            >
              <div className="shop-mobile-header">
                <div className="shop-mobile-title">{s.name}</div>
                <span className={`status ${s.status}`}>{s.status}</span>
              </div>

              <div className="shop-mobile-sub">Owner: {s.owner_name}</div>
              <div className="shop-mobile-sub">📞 {s.phone}</div>
              <div className="shop-mobile-sub">✉️ {s.email || "—"}</div>
              <div className="shop-mobile-sub">💰 Wallet: ₹ {s.wallet_balance}</div>

              {s.latitude && (
                <div className="shop-mobile-meta">
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

              <div style={{ marginTop: "10px" }}>
                <button
                  className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
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


      {/* =========================
           SELLER DETAILS MODAL
      ========================= */}
      {showSellerModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-container">
            <button
              className="shop-modal-close"
              onClick={() => setShowSellerModal(false)}
            >
              ✕
            </button>

            {sellerLoading && <p className="modal-loading">Loading seller details...</p>}

            {!sellerLoading && selectedSeller && (() => {
              const logo =
                selectedSeller.media?.find((m) => m.logo && m.logo !== "")?.logo;

              const images =
                selectedSeller.media?.filter((m) => m.images).map((m) => m.images) || [];

              return (
                <div className="shop-modal-content">
                  <div className="modal-header">
                    <img
                      src={logo ? `${BASE_IMAGE_URL}/${logo}` : {FALLBACK_IMAGE}}
                      className="modal-shop-logo"
                      alt="seller Logo"
                    />
                    <div>
                      <h2>{selectedSeller.seller.name}</h2>
                      <p>Owner: {selectedSeller.seller.owner_name}</p>
                    </div>
                  </div>

                  <div className="modal-stats">
                    <div className="stat-card">
                      <span>💰 Wallet</span>
                      <strong>₹ {selectedSeller.seller.wallet_balance}</strong>
                    </div>
                    <div className="stat-card">
                      <span>📦 Orders</span>
                      <strong>{selectedSeller.seller.total_orders}</strong>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>📞 Contact Details</h4>
                    <div>📍 {selectedSeller.seller.address || "Not set"}</div>
                    <div>📞 {selectedSeller.user?.[0]?.phone || "Not set"}</div>
                    <div>✉️ {selectedSeller.user?.[0]?.email || "Not set"}</div>
                  </div>

   {/* ================= SELLER QR CARD ================= */}
{selectedSeller.scanner_code?.[0]?.scanner_code && (
  <div className="modal-section">
    <div className="qr-master-card">

      <div className="qr-header">
        <h3 className="qr-shop-name">
          {selectedSeller.seller?.name}
        </h3>
        <span className="qr-owner">
          Owner: {selectedSeller.seller?.owner_name}
        </span>
      </div>

      <div
        className="qr-body zoomable"
        onClick={() => setShowSellerQrPreview(true)}
      >
        <QRCodeCanvas
          value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
            selectedSeller.scanner_code[0].scanner_code
          )}&type=seller`}
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
              <h4>🖼️ seller Gallery</h4>

              {images.length === 0 ? (
                <p>No images uploaded</p>
              ) : (
                <div className="modal-gallery">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={`${BASE_IMAGE_URL}/${img}` || FALLBACK_IMAGE}
                      alt="seller"
                    />
                  ))}
                </div>
              )}
            </div>
            {/* ================= SELLER CATEGORY COMMISSIONS ================= */}
<div className="modal-section commission-master-section">

  <div className="section-header">
    
    <span className="section-sub">
      Total Categories: {selectedSeller.category_commissions?.length || 0}
    </span>
  </div>

  {selectedSeller.category_commissions &&
  selectedSeller.category_commissions.length > 0 ? (

    <div className="commission-grid">
      {selectedSeller.category_commissions.map((item) => (
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
      <p>No commission configuration found for this seller.</p>
    </div>
  )}

</div>


            {/* ================= MAP ================= */}
            <div className="modal-section">
              <h4>📍 seller Location</h4>

              {selectedSeller.seller.latitude && selectedSeller.seller.longitude ? (
                <MapContainer
                  center={[
                    selectedSeller.seller.latitude,
                    selectedSeller.seller.longitude
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
                      selectedSeller.seller.latitude,
                      selectedSeller.seller.longitude
                    ]}
                    icon={shopIcon}
                  >
                    <Popup>
                      <strong>{selectedSeller.seller.name}</strong>
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
{showSellerQrPreview && (
  <div
    className="qr-preview-overlay"
    onClick={() => setShowSellerQrPreview(false)}
  >
    <div className="qr-preview-box">
      <QRCodeCanvas
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          selectedSeller.scanner_code[0].scanner_code
        )}&type=seller`}
        size={300}
        level="H"
      />
    </div>
  </div>
)}

    </div>
  );
}

export default ExecutiveSellerManagement;
