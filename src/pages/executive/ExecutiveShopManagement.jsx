import React, { useEffect, useState } from "react";
import {
  getExecutiveShops,
  createExecutiveShop,
  toggleExecutiveShopStatus,
  getCategories
} from "../../service/apiService";

import "./ExecutiveShopManagement.css";

const MAX_IMAGE_MB = 2;
const MAX_IMAGE_SIZE = MAX_IMAGE_MB * 1024 * 1024;

function ExecutiveShopManagement({ user }) {
  const executiveId = user.id;

  const [shops, setShops] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [locating, setLocating] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    category_id: "",
    commission: "",
    wallet_balance: "",
    latitude: "",
    longitude: "",
    logo: null,
    images: [],
  });

  /* =========================
     LOAD SHOPS
  ========================= */
  const loadShops = async () => {
    const res = await getExecutiveShops(executiveId);
    setShops(res.data || []);
  };

  useEffect(() => {
    loadShops();
    getCategories().then((res) => {
      if (res.status === "success") setCategories(res.data);
    });
  }, []);

  /* =========================
     INPUT HANDLERS
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

    setForm((prev) => ({ ...prev, images: files }));
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
     CREATE SHOP
  ========================= */
  const handleCreate = async () => {
    if (!form.name || !form.owner_name || !form.phone) {
      alert("Shop name, owner name & phone are required");
      return;
    }

    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "logo" || key === "images") return;
      if (value !== "") fd.append(key, value);
    });

    fd.append("executive_id", executiveId);

    if (form.logo) fd.append("logo", form.logo);
    form.images.forEach((img) => fd.append("images[]", img));

    await createExecutiveShop(fd);

    setForm({
      name: "",
      owner_name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      category_id: "",
      commission: "",
      wallet_balance: "",
      latitude: "",
      longitude: "",
      logo: null,
      images: [],
    });

    setShowAdd(false);
    loadShops();
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

            <select name="category_id" className="form-control" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input name="commission" placeholder="Commission (%)" value={form.commission} onChange={handleChange} />
            <input name="wallet_balance" placeholder="Initial Wallet Amount" value={form.wallet_balance} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />

            {/* LOGO */}
            <div className="upload-group">
              <label className="upload-label">
                🖼️ Shop Logo
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
            {shops.map((s) => (
              <tr key={s.id}>
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
                  <button className="btn" onClick={() => toggleStatus(s)}>
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan="7">No shops found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveShopManagement;
