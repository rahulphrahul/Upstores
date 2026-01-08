import React, { useState } from "react";
import "./ExecutiveSellerManagement.css";

function ExecutiveSellerManagement() {
  const [showAdd, setShowAdd] = useState(false);

  const [sellers, setSellers] = useState([
    {
      id: 1,
      name: "Amit Kumar",
      phone: "9000011111",
      shop: "Green Mart",
      status: "active",
    },
    {
      id: 2,
      name: "Suresh",
      phone: "9000022222",
      shop: "Fresh Point",
      status: "inactive",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    shop: "",
  });

  const handleAdd = () => {
    setSellers([
      ...sellers,
      {
        id: sellers.length + 1,
        ...form,
        status: "active",
      },
    ]);
    setForm({ name: "", phone: "", shop: "" });
    setShowAdd(false);
  };

  return (
    <div className="exec-page">
      <div className="page-header">
        <h2 className="page-title">Seller Management</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Close" : "+ Add Seller"}
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <h4>Add Seller</h4>
          <div className="form-grid">
            <input
              placeholder="Seller Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Shop Name"
              value={form.shop}
              onChange={(e) => setForm({ ...form, shop: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            Save Seller
          </button>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Shop</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.shop}</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveSellerManagement;
