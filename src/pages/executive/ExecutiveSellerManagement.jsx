import React, { useEffect, useState } from "react";
import {
  getExecutiveSellers,
  addExecutiveSeller,
  updateExecutiveSeller,
  updateExecutiveSellerStatus,
  getCategories,
} from "../../service/apiService";

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
    const res = await getExecutiveSellers(executiveId);
    if (res?.status === "success") setSellers(res.data || []);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    if (res?.status === "success") setCategories(res.data || []);
  };

  useEffect(() => {
    loadSellers();
    loadCategories();
  }, []);

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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Seller"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h4>{editingSeller ? "Edit Seller" : "Add New Seller"}</h4>

          <div className="form-grid">
            {/* Category Dropdown */}
            <select name="category_id" value={form.category_id} onChange={handleChange} className="form-control">
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
            <input name="name" placeholder="Seller Name" value={form.name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="wallet_balance" placeholder="Initial Wallet" value={form.wallet_balance} onChange={handleChange} />
            <input name="commission" placeholder="Commission %" value={form.commission} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            {/* Latitude / Longitude */}
            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />
            <button className="btn btn-outline" onClick={getCurrentLocation} disabled={locating}>
              {locating ? "Fetching..." : "📍 Use Current Location"}
            </button>

            {/* Logo */}
            <div className="upload-group">
              <label className="upload-label">🖼️ Seller Logo <span className="upload-hint">(max 2MB)</span></label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            {/* Images */}
            <div className="upload-group">
              <label className="upload-label">📸 Seller Images <span className="upload-hint">(multiple • max 2MB each)</span></label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingSeller ? "Update Seller" : "Create Seller"}
            </button>
          </div>
        </div>
      )}

      {/* Seller List */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Category</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id}>
                <td>{s.owner_name}</td>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email || "—"}</td>
                <td>{s.category_name || "—"}</td>
                <td>₹ {s.wallet_balance}</td>
                <td><span className={`status ${s.status}`}>{s.status}</span></td>
                <td className="actions">
                  <button className="btn btn-danger" onClick={() => handleEdit(s)}>Edit</button>
                  <button className={`btn ${s.status === "active" ? "btn-warning" : "btn-success"}`} onClick={() => toggleStatus(s)}>
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">No sellers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveSellerManagement;
