import React, { useEffect, useState } from "react";
import {
  getExecutiveSellers,
  addExecutiveSeller,
  updateExecutiveSeller,
  updateExecutiveSellerStatus,
  getSellerLoginDetails,
  getCategories,
} from "../../service/apiService";
import { BASE_IMAGE_URL } from "../../config/config";
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
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const shop_type = "seller";

  const [form, setForm] = useState({
    category_id: "",
    owner_name: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    wallet_balance: "",
    commission: "",
    latitude: "",
    longitude: "",
    logo: null,
    images: [],
  });

  /* =========================
     LOAD SELLERS
  ========================= */
  const loadSellers = async () => {
    try {
      const res = await getExecutiveSellers(executiveId);
      setSellers(res.data || []);
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
      category_id: "",
      owner_name: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      wallet_balance: "",
      commission: "",
      latitude: "",
      longitude: "",
      logo: null,
      images: [],
    });
    setEditingSeller(null);
    setShowForm(false);
  };

  /* =========================
     CREATE / UPDATE SELLER
  ========================= */
  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.owner_name) {
      alert("Owner name, seller name, and phone are required");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== "logo" && key !== "images" && form[key] !== "")
        fd.append(key, form[key]);
    });

    fd.append("executive_id", executiveId);

    if (form.logo) fd.append("logo", form.logo);
    form.images.forEach((img) => fd.append("images[]", img));

    if (editingSeller) {
      fd.append("seller_id", editingSeller.id);
      await updateExecutiveSeller(fd);
    } else {
      await addExecutiveSeller(fd);
    }

    resetForm();
    loadSellers();
  };

  /* =========================
     EDIT SELLER
  ========================= */
  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setForm({
      category_id: seller.category_id || "",
      owner_name: seller.owner_name || "",
      name: seller.name || "",
      phone: seller.phone || "",
      email: seller.email || "",
      address: seller.address || "",
      description: seller.description || "",
      wallet_balance: seller.wallet_balance || "",
      commission: seller.commission || "",
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
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              name="owner_name"
              placeholder="Owner Name"
              value={form.owner_name}
              onChange={handleChange}
            />
            <input
              name="name"
              placeholder="Seller Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="wallet_balance"
              placeholder="Initial Wallet"
              value={form.wallet_balance}
              onChange={handleChange}
            />
            <input
              name="commission"
              placeholder="Commission %"
              value={form.commission}
              onChange={handleChange}
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

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
            {sellers.map((s) => (
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
          {sellers.map((s) => (
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
                      src={logo ? `${BASE_IMAGE_URL}/${logo}` : "/shop-placeholder.png"}
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

                  {selectedSeller.scanner_code?.[0]?.scanner_code && (
                    <div className="modal-section center">
                      <h4>📱 seller QR</h4>
                      <QRCodeCanvas
                        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                          selectedSeller.scanner_code[0].scanner_code
                        )}&type=seller`}
                        size={160}
                        level="H"
                      />
                    </div>
                  )}

                  <div className="modal-section">
                    <h4>🖼️ seller Gallery</h4>
                    {images.length === 0 ? (
                      <p>No images uploaded</p>
                    ) : (
                      <div className="modal-gallery">
                        {images.map((img, i) => (
                          <img key={i} src={`${BASE_IMAGE_URL}/${img}`} alt="seller" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="modal-section">
                    <h4>📍 seller Location</h4>
                    {selectedSeller.seller.latitude && selectedSeller.seller.longitude ? (
                      <MapContainer
                        center={[selectedSeller.seller.latitude, selectedSeller.seller.longitude]}
                        zoom={16}
                        style={{ height: "220px", borderRadius: "12px" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[selectedSeller.seller.latitude, selectedSeller.seller.longitude]}
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
    </div>
  );
}

export default ExecutiveSellerManagement;
