import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  getExecutiveShops,
  createExecutiveShop,
  toggleExecutiveShopStatus,
  getCategories,
  getShopLoginDetails
} from "../../service/apiService";
import { BASE_IMAGE_URL, FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import "./ExecutiveShopManagement.css";

const MAX_IMAGE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_MB * 1024 * 1024;

function ExecutiveShopManagement({ user }) {
  const executiveId = user.id;

  const [shops, setShops] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

  const [locating, setLocating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showShopModal, setShowShopModal] = useState(false);
const [selectedShop, setSelectedShop] = useState(null);
const [shopLoading, setShopLoading] = useState(false);
const [showQrPreview, setShowQrPreview] = useState(false);
/* =========================
   PAGINATION LOGIC
========================= */

const totalPages = Math.ceil(shops.length / itemsPerPage);

const paginatedShops = shops.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
const shop_type="shop";
const [form, setForm] = useState({
  name: "",
  owner_name: "",
  phone: "",
  email: "",
  address: "",
  description: "",
  wallet_balance: "",
  latitude: "",
  longitude: "",
  logo: null,
  images: [],
  category_commissions: [
    { category_id: "", commission: "" }
  ]
});


  /* =========================
     LOAD SHOPS
  ========================= */
 const loadShops = async () => {
  const res = await getExecutiveShops(executiveId);
  setShops(res.data || []);
  setCurrentPage(1); // reset to first page
};


  useEffect(() => {
    loadShops();
    getCategories(shop_type).then((res) => {
      if (res.status === "success") setCategories(res.data);
    });
  }, []);
const openShopModal = async (shopId) => {
  setShowShopModal(true);
  setShopLoading(true);
  setSelectedShop(null);

  try {
    const res = await getShopLoginDetails(shopId);
    if (res.status === "success") {
      setSelectedShop(res.data);
    }
  } catch (e) {
    console.error("Failed to load shop details", e);
  } finally {
    setShopLoading(false);
  }
};
const handleCategoryChange = (index, field, value) => {
  const updated = [...form.category_commissions];
  updated[index][field] = value;
  setForm({ ...form, category_commissions: updated });
};

const addCategoryRow = () => {
  setForm({
    ...form,
    category_commissions: [
      ...form.category_commissions,
      { category_id: "", commission: "" }
    ]
  });
};

const removeCategoryRow = (index) => {
  const updated = form.category_commissions.filter((_, i) => i !== index);
  setForm({ ...form, category_commissions: updated });
};

  /* =========================
     INPUT HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Logo must be under ${MAX_IMAGE_MB}MB`);
      return;
    }

    setForm((prev) => ({ ...prev, logo: file }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);

    for (let f of files) {
      if (f.size > MAX_IMAGE_SIZE) {
        toast.error(`Each image must be under ${MAX_IMAGE_MB}MB`);
        return;
      }
    }

    setForm((prev) => ({ ...prev, images: files }));
  };

  /* =========================
     GEO LOCATION
  ========================= */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
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
        toast.error("Location access failed");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* =========================
     CREATE SHOP
  ========================= */
 const handleCreate = async () => {
  if (!form.name || !form.owner_name || !form.phone) {
    toast.error("Shop name, owner name & phone are required");
    return;
  }

  if (!form.logo) {
    toast.error("Shop logo is required");
    return;
  }

  if (!form.images || form.images.length === 0) {
    toast.error("Please select at least 1 shop gallery image");
    return;
  }

  const rows = form.category_commissions || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.category_id) {
      toast.error(`Select a category for row ${i + 1}`);
      return;
    }
    if (row.commission === "" || row.commission === null || row.commission === undefined) {
      toast.error(`Enter commission (%) for row ${i + 1}`);
      return;
    }
    const commissionNum = Number(row.commission);
    if (!Number.isFinite(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      toast.error(`Commission must be between 0 and 100 (row ${i + 1})`);
      return;
    }
  }

  const fd = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (key === "logo" || key === "images" || key === "category_commissions") return;
    if (value !== "") fd.append(key, value);
  });

  fd.append("executive_id", executiveId);
  fd.append("category_commissions", JSON.stringify(form.category_commissions));

  if (form.logo) fd.append("logo", form.logo);
  form.images.forEach((img) => fd.append("images[]", img));

  try {
    const res = await createExecutiveShop(fd);

    if (res.status === "success") {
      toast.success("Shop created successfully");

      setForm({
        name: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
        description: "",
        wallet_balance: "",
        latitude: "",
        longitude: "",
        logo: null,
        images: [],
        category_commissions: [
          { category_id: "", commission: "" }
        ]
      });

      setShowAdd(false);
      loadShops();
    } else {
      toast.error(res.message || "Something went wrong");
    }

  } catch (error) {
    toast.error("Server error. Please try again.");
  }
};
  /* =========================
     TOGGLE STATUS
  ========================= */
  const toggleStatus = async (shop) => {
    await toggleExecutiveShopStatus({
      shop_id: shop.id,
      status: shop.status,
      executive_id: executiveId,
    });
    loadShops();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-shop-page">
      <div className="page-header">
        <h2 className="page-title">My Shops</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? "Close" : "+ Add Shop"}
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <h4>Add New Shop</h4>

          <div className="form-grid">
            <input name="name" placeholder="Shop Name" value={form.name} onChange={handleChange} />
            <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />

       
   <button
    type="button"
    className="btn btn-success" style={{height:40}}
    onClick={addCategoryRow}
  >
    + Add Category
  </button>
  <input name="wallet_balance" placeholder="Initial Wallet Amount" value={form.wallet_balance} onChange={handleChange} />
{(form.category_commissions || []).map((row, index) => (

    <div key={index}>

      <select
        value={row.category_id}
        className="form-control"
        onChange={(e) =>
          handleCategoryChange(index, "category_id", e.target.value)
        }
      >
        <option value="">Select Category</option>
        {(categories || []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Commission (%)"
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

            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />

            {/* LOGO */}
            <div className="upload-group">
              <label className="upload-label">
                 Shop Logo
                <span className="upload-hint">(1 image • max 2MB)</span>
              </label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            {/* IMAGES */}
            <div className="upload-group">
              <label className="upload-label">
                📸 Shop Gallery Images
                <span className="upload-hint">(multiple images • max 2MB each)</span>
              </label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </div>
          </div>

          <button className="btn btn-outline" onClick={getCurrentLocation} disabled={locating}>
            {locating ? "Fetching location..." : "📍 Use Current Location"}
          </button>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create Shop
            </button>
          </div>
        </div>
      )}

           <div className="card">

        {/* ===== DESKTOP TABLE ===== */}
        <table className="data-table">
          <thead>
          <tr>
              <th>Shop</th>
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
         {(shops || []).map((s) => (
              <tr  key={s.user_id}
  className="clickable-row"
  onClick={() => openShopModal(s.user_id)}>
                <td>{s.shop_name}</td>
                <td>{s.owner_name}</td>
                <td>{s.phone}</td>
                 <td>{s.email}</td>
                <td>₹ {s.wallet_balance}</td>
                 <td><span className={`status ${s.status}`}>{s.status}</span></td>
              <td>
  {s.latitude ? (
    <a
      href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
      target="_blank"
      rel="noreferrer"
    >
      View on Map
    </a>
  ) : "—"}
</td>

                <td>
                  <button className="btn" onClick={(e) => {
    e.stopPropagation();
    toggleStatus(s);
  }}>
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {shops.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">
                  No shops found
                </td>
              </tr>
            )}
          </tbody>
        </table>

       {/* ===== MOBILE CARD VIEW ===== */}
<div className="mobile-shop-list">
 {paginatedShops.map((s) => (

    <div
      key={s.user_id}
      className="shop-mobile-card"
      onClick={() => openShopModal(s.user_id)}
    >
      {/* Header Row */}
      <div className="shop-mobile-header">
        <div className="shop-mobile-title">
          {s.shop_name}
        </div>

        <span className={`status ${s.status}`}>
          {s.status}
        </span>
      </div>

      {/* Details */}
      <div className="shop-mobile-sub">
        Owner: {s.owner_name}
      </div>

      <div className="shop-mobile-sub">
        {s.phone}
      </div>

      <div className="shop-mobile-sub">
        {s.email}
      </div>

      <div className="shop-mobile-sub">
         Wallet: ₹ {s.wallet_balance}
      </div>

      {/* Location */}
      {s.latitude && (
        <div className="shop-mobile-meta">
          <a
            href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
             View Location
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


     {/* SHOP DETAILS MODAL */}
{showShopModal && (
  <div className="shop-modal-overlay">
    <div className="shop-modal-container">

      {/* CLOSE */}
      <button
        className="shop-modal-close"
        onClick={() => setShowShopModal(false)}
      >
        ✕
      </button>

      {shopLoading && (
        <p className="modal-loading">Loading shop details...</p>
      )}

      {!shopLoading && selectedShop && (() => {

        const logo =
          selectedShop.media?.length > 0 ? selectedShop.media?.find(m => m.logo && m.logo !== "")?.logo:null;

        const images =
          selectedShop.media?.filter(m => m.images).map(m => m.images) || [];
const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];
        return (
          <div className="shop-modal-content">

            {/* ================= HEADER ================= */}
            <div className="modal-header">
              <img
                src={
                  logo!=null
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : FALLBACK_IMAGE
                }
                className="modal-shop-logo"
                alt="Shop Logo"
              />

              <div>
                <h2>{selectedShop.shop.name}</h2>
                <p>Owner: {selectedShop.shop.owner_name}</p>
              </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="modal-stats">
              <div className="stat-card">
                <span> Wallet</span>
                <strong>₹ {selectedShop.shop.wallet_balance || 0}</strong>
              </div>
              <div className="stat-card">
                <span> Orders</span>
                <strong>{selectedShop.shop.total_orders || 0}</strong>
              </div>
            </div>

            {/* ================= CONTACT ================= */}
            <div className="modal-section">
              <h4> Contact Details</h4>
              <div>📍 {selectedShop.shop.address || "Not set"}</div>
              <div>📞 {selectedShop.user?.[0]?.phone || "Not set"}</div>
              <div>✉️ {selectedShop.user?.[0]?.email || "Not set"}</div>
            </div>

            {/* ================= QR ================= */}
         {/* ================= SHOP QR CARD ================= */}
{/* ================= SHOP QR CARD ================= */}
{selectedShop.scanner_code?.[0]?.scanner_code && (
  <div className="modal-section">
    <div className="qr-master-card">

      <div className="qr-header">
        <h3 className="qr-shop-name">
          {selectedShop.shop?.name}
        </h3>
        <span className="qr-owner">
          Owner: {selectedShop.shop?.owner_name}
        </span>
      </div>

      <div
        className="qr-body zoomable"
        onClick={() => setShowQrPreview(true)}
      >
        <QRCodeCanvas
          value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
            selectedShop.scanner_code[0].scanner_code
          )}&type=shop`}
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
              <h4> Shop Gallery</h4>

              {images.length === 0 ? (
                <p>No images uploaded</p>
              ) : (
                <div className="modal-gallery">
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
            </div>
            {/* ================= CATEGORY COMMISSIONS ================= */}
<div className="modal-section commission-master-section">
  <div className="section-header">
    <span className="section-sub">
      Total Categories: {selectedShop.category_commissions?.length || 0}
    </span>
  </div>

  {selectedShop.category_commissions &&
  selectedShop.category_commissions.length > 0 ? (
    <div className="commission-grid">
      {selectedShop.category_commissions.map((item) => (
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
      <p>No commission configuration found for this shop.</p>
    </div>
  )}
</div>


            {/* ================= MAP ================= */}
            <div className="modal-section">
              <h4> Shop Location</h4>

              {selectedShop.shop.latitude && selectedShop.shop.longitude ? (
                <MapContainer
                  center={[
                    selectedShop.shop.latitude,
                    selectedShop.shop.longitude
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
                      selectedShop.shop.latitude,
                      selectedShop.shop.longitude
                    ]}
                    icon={shopIcon}
                  >
                    <Popup>
                      <strong>{selectedShop.shop.name}</strong>
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

{/* end popup modal */}
{showQrPreview && (
  <div
    className="qr-preview-overlay"
    onClick={() => setShowQrPreview(false)}
  >
    <div className="qr-preview-box">
      <QRCodeCanvas
        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
          selectedShop.scanner_code[0].scanner_code
        )}&type=shop`}
        size={300}
        level="H"
      />
    </div>
  </div>
)}

    </div>
  );
}

export default ExecutiveShopManagement;
