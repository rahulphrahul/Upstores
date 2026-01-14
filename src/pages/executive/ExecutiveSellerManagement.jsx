import React, { useEffect, useState } from "react";
import {
  getExecutiveSellers,
  addExecutiveSeller,
  updateExecutiveSeller,
  updateExecutiveSellerStatus,
  getShops,
} from "../../service/apiService";

import "./ExecutiveSellerManagement.css";

function ExecutiveSellerManagement({ user }) {
  const executiveId = user.id;

  const [sellers, setSellers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
const [shops, setShops] = useState([]);

  const [form, setForm] = useState({
    shop_id: "",
    name: "",
    phone: "",
    email: "",
  });

  /* =========================
     LOAD SELLERS
  ========================= */
  const loadSellers = async () => {
    const res = await getExecutiveSellers(executiveId);
    if (res?.status === "success") {
      setSellers(res.data || []);
    }
  };
const loadShops = async () => {
  const res = await getShops();

  // If API returns { status, data }
  const data = res?.data || res || [];
console.log("dattastas",res);
  // OPTIONAL: filter by executive
  const filtered = data.filter(
    (shop) => shop.executive_id === executiveId
  );

  setShops(filtered);
};
  useEffect(() => {
    loadSellers();
      loadShops();
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      shop_id: "",
      name: "",
      phone: "",
      email: "",
    });
    setEditingSeller(null);
    setShowForm(false);
  };

  /* =========================
     CREATE / UPDATE SELLER
  ========================= */
  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone are required");
      return;
    }

    if (editingSeller) {
      await updateExecutiveSeller({
        seller_id: editingSeller.id,
        executive_id: executiveId,
        ...form,
      });
    } else {
      await addExecutiveSeller({
        executive_id: executiveId,
        ...form,
      });
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
      shop_id: seller.shop_id || "",
      name: seller.name || "",
      phone: seller.phone || "",
      email: seller.email || "",
    });
    setShowForm(true);
  };

  /* =========================
     TOGGLE STATUS
  ========================= */
  const toggleStatus = async (seller) => {
    const newStatus =
      seller.status === "active" ? "suspended" : "active";

    await updateExecutiveSellerStatus(
      seller.id,
      executiveId,
      newStatus
    );

    loadSellers();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-seller-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">My Sellers</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Seller"}
        </button>
      </div>

      {/* ADD / EDIT SELLER */}
      {showForm && (
        <div className="card">
          <h4>{editingSeller ? "Edit Seller" : "Add New Seller"}</h4>

          <div className="form-grid">
    <select
  name="shop_id"
  value={form.shop_id}
  onChange={handleChange}
  className="form-control"
>
  <option value="">Select Shop</option>
  {shops.map((shop) => (
    <option key={shop.id} value={shop.id}>
      {shop.name}
    </option>
  ))}
</select>



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

      {/* SELLER LIST */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Shop</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email || "—"}</td>
                <td>{s.shop_name || "—"}</td>
                <td>₹ {s.wallet}</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>

                  <button
                    className={`btn ${
                      s.status === "active"
                        ? "btn-warning m-1"
                        : "btn-success m-1"
                    }`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {sellers.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No sellers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveSellerManagement;
