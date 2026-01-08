import React, { useEffect, useState } from "react";
import {
  getExecutiveShops,
  createExecutiveShop,
  toggleExecutiveShopStatus,
} from "../../service/apiService";

import "./ExecutiveShopManagement.css";

function ExecutiveShopManagement({ user }) {
  /* =========================
     STATE
  ========================= */
  const executiveId = user.id;

  const [shops, setShops] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    wallet_balance: "",
    latitude: "",
    longitude: "",
  });

  /* =========================
     LOAD SHOPS
  ========================= */
  const loadShops = async () => {
    const res = await getExecutiveShops(executiveId);
    setShops(res || []);
  };

  useEffect(() => {
    loadShops();
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* =========================
     GET CURRENT LOCATION
  ========================= */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported on this device");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
        }));
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location unavailable");
            break;
          case error.TIMEOUT:
            alert("Location request timed out");
            break;
          default:
            alert("Unable to fetch location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  /* =========================
     CREATE SHOP
  ========================= */
  const handleCreate = async () => {
    if (!form.name || !form.owner_name) {
      alert("Shop name and owner name are required");
      return;
    }

    await createExecutiveShop({
      ...form,
      executive_id: executiveId,
    });

    setForm({
      name: "",
      owner_name: "",
      wallet_balance: "",
      latitude: "",
      longitude: "",
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
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">My Shops</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? "Close" : "+ Add Shop"}
        </button>
      </div>

      {/* ADD SHOP */}
      {showAdd && (
        <div className="card">
          <h4>Add New Shop</h4>

          <div className="form-grid">
            <input
              name="name"
              placeholder="Shop Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="owner_name"
              placeholder="Owner Name"
              value={form.owner_name}
              onChange={handleChange}
            />

            <input
              name="wallet_balance"
              placeholder="Initial Wallet Amount"
              value={form.wallet_balance}
              onChange={handleChange}
            />

            <input
              name="latitude"
              placeholder="Latitude"
              value={form.latitude}
              readOnly
            />

            <input
              name="longitude"
              placeholder="Longitude"
              value={form.longitude}
              readOnly
            />
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={getCurrentLocation}
            disabled={locating}
            style={{ marginTop: "12px" }}
          >
            {locating ? "Fetching location..." : "📍 Use Current Location"}
          </button>

          <div className="form-actions">
            <button
              className="btn btn-outline"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create Shop
            </button>
          </div>
        </div>
      )}

      {/* SHOP LIST */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Owner</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.owner_name}</td>
                <td>₹ {s.wallet_balance}</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  {s.latitude && s.longitude
                    ? `${s.latitude}, ${s.longitude}`
                    : "—"}
                </td>
                <td>
                  <button
                    className={`btn ${
                      s.status === "active"
                        ? "btn-suspend"
                        : "btn-activate"
                    }`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {shops.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No shops added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveShopManagement;
