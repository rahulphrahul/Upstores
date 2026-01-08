import React, { useState } from "react";
import "./ExecutiveServicesManagement.css";

function ExecutiveServicesManagement() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Home Delivery",
      shop: "Green Mart",
      status: "active",
    },
    {
      id: 2,
      name: "Installation",
      shop: "Fresh Point",
      status: "inactive",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    shop: "",
  });

  const addService = () => {
    setServices([
      ...services,
      {
        id: services.length + 1,
        ...form,
        status: "active",
      },
    ]);
    setForm({ name: "", shop: "" });
  };

  return (
    <div className="exec-page">
      <h2 className="page-title">Services Management</h2>

      <div className="card">
        <h4>Add Service</h4>
        <div className="form-grid">
          <input
            placeholder="Service Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Shop Name"
            value={form.shop}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" onClick={addService}>
          Add Service
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Shop</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
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

export default ExecutiveServicesManagement;
