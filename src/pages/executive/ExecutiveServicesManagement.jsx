import React, { useEffect, useState } from "react";
import {
  getExecutiveServices,
  addExecutiveService,
  updateExecutiveService,
  updateExecutiveServiceStatus,
  getCategories,
} from "../../service/apiService";

import "./ExecutiveServicesManagement.css";

function ExecutiveServiceManagement({ user }) {
  const executiveId = user.id;

  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    provider_type: "",
    provider_id: "",
    seller_id: "",
    shop_id: "",
    commission: "",
  });
const [categories, setCategories] = useState([]);
  /* =========================
     LOAD SERVICES
  ========================= */
  const loadServices = async () => {
    const res = await getExecutiveServices(executiveId);
    if (res?.status === "success") {
      setServices(res.data || []);
    }
  };

  useEffect(() => {
    loadServices();
     getCategories().then(res => {
    if (res.status === "success") {
      setCategories(res.data);
    }
  });
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      provider_type: "",
      provider_id: "",
      seller_id: "",
      shop_id: "",
      commission: "",
    });
    setEditingService(null);
    setShowForm(false);
  };

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async () => {
    if (!form.name || !form.commission) {
      alert("Service name and commission are required");
      return;
    }

    if (editingService) {
      await updateExecutiveService({
        service_id: editingService.id,
        executive_id: executiveId,
        ...form,
      });
    } else {
      await addExecutiveService({
        executive_id: executiveId,
        ...form,
      });
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
      category: service.category || "",
      provider_type: service.provider_type || "",
      provider_id: service.provider_id || "",
      seller_id: service.seller_id || "",
      shop_id: service.shop_id || "",
      commission: service.commission || "",
    });
    setShowForm(true);
  };

  /* =========================
     STATUS TOGGLE
  ========================= */
  const toggleStatus = async (service) => {
    const newStatus =
      service.status === "active" ? "inactive" : "active";

    await updateExecutiveServiceStatus(
      service.id,
      executiveId,
      newStatus
    );

    loadServices();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-service-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">My Services</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Service"}
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="card">
          <h4>{editingService ? "Edit Service" : "Add New Service"}</h4>

          <div className="form-grid">
            <input
              name="name"
              placeholder="Service Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="category"
              placeholder="Category ID"
              value={form.category}
              onChange={handleChange}
            />

            <select
              name="provider_type"
              value={form.provider_type}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Provider Type</option>
              <option value="seller">Seller</option>
              <option value="shop">Shop</option>
            </select>

            <input
              name="provider_id"
              placeholder="Provider ID"
              value={form.provider_id}
              onChange={handleChange}
            />

            <input
              name="seller_id"
              placeholder="Seller ID"
              value={form.seller_id}
              onChange={handleChange}
            />
<div className="form-group">
  <select
    name="category_id"
    value={form.id || ""}
    onChange={handleChange}
    className="form-control"
  >
    <option value="">
      Select Category
    </option>

    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

            <input
              name="shop_id"
              placeholder="Shop ID"
              value={form.shop_id}
              onChange={handleChange}
            />

            <input
              name="commission"
              placeholder="Commission (%)"
              value={form.commission}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingService ? "Update Service" : "Create Service"}
            </button>
          </div>
        </div>
      )}

      {/* SERVICE LIST */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category_name || "—"}</td>
                <td>{s.provider_type}</td>
                <td>{s.commission}%</td>
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
                    {s.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveServiceManagement;
