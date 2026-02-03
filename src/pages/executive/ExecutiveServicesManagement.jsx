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
  const [categories, setCategories] = useState([]);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    phone: "",
    wallet_balance: "",
    category_id: "",
    commission: "",
    address: "",
    email: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [logo, setLogo] = useState(null);
  const [images, setImages] = useState([]);
 const shop_type ="service";
  /* =========================
     LOAD SERVICES
  ========================= */
  const loadServices = async () => {
    const res = await getExecutiveServices(executiveId);
    if (res?.status === "success") setServices(res.data || []);
  };

  useEffect(() => {
    loadServices();
    getCategories(shop_type).then((res) => {
      if (res.status === "success") setCategories(res.data || []);
    });
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }
    setLogo(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    for (let f of files) {
      if (f.size > 2 * 1024 * 1024) {
        alert("Each image must be under 2MB");
        return;
      }
    }
    setImages(files);
  };

  const resetForm = () => {
    setForm({
      name: "",
      owner_name: "",
      phone: "",
      wallet_balance: "",
      category_id: "",
      commission: "",
      address: "",
      email: "",
      description: "",
      latitude: "",
      longitude: "",
    });
    setLogo(null);
    setImages([]);
    setEditingService(null);
    setShowForm(false);
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
        alert("Unable to fetch location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async () => {
    if (!form.name || !form.commission || !form.owner_name) {
      alert("Owner name, Service name, and commission are required");
      return;
    }

    const fd = new FormData();
    fd.append("executive_id", executiveId);

    Object.keys(form).forEach((key) => {
      if (form[key] !== "") fd.append(key, form[key]);
    });

    if (logo) fd.append("logo", logo);
    images.forEach((img) => fd.append("images[]", img));

    if (editingService) {
      fd.append("service_id", editingService.id);
      await updateExecutiveService(fd);
    } else {
      await addExecutiveService(fd);
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
      owner_name: service.owner_name || "",
      phone: service.phone || "",
      wallet_balance: service.wallet_balance || "",
      category_id: service.category_id || "",
      commission: service.commission || "",
      address: service.address || "",
      email: service.email || "",
      description: service.description || "",
      latitude: service.latitude || "",
      longitude: service.longitude || "",
    });
    setLogo(null);
    setImages([]);
    setShowForm(true);
  };

  /* =========================
     STATUS
  ========================= */
  const toggleStatus = async (service) => {
    const newStatus =
      service.status === "active" ? "inactive" : "active";

    await updateExecutiveServiceStatus(service.id, executiveId, newStatus);
    loadServices();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-service-page">
      <div className="page-header">
        <h2 className="page-title">My Services</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Service"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h4>{editingService ? "Edit Service" : "Add New Service"}</h4>

          <div className="form-grid">
            <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
            <input name="name" placeholder="Service Name" value={form.name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="wallet_balance" placeholder="Initial Wallet" value={form.wallet_balance} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <select name="category_id" className="form-control" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input name="commission" placeholder="Commission (%)" value={form.commission} onChange={handleChange} />

            <input name="latitude" placeholder="Latitude" value={form.latitude} readOnly />
            <input name="longitude" placeholder="Longitude" value={form.longitude} readOnly />

            <button type="button" className="btn btn-outline" onClick={getCurrentLocation} disabled={locating}>
              {locating ? "Fetching location..." : "📍 Use Current Location"}
            </button>

            <div>
              <label>🖼️ Service Logo (max 2MB)</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            <div>
              <label>📸 Service Images (multiple, max 2MB each)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingService ? "Update Service" : "Create Service"}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
               <th>Service</th>
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
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.owner_name}</td>
                 <td>{s.phone || "—"}</td>
                <td>{s.email}</td>
                <td>{s.wallet_balance}</td>
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
                 {/*} <button className="btn btn-danger" onClick={() => handleEdit(s)}>Edit</button>*/}
                  <button className="btn btn-warning m-1" onClick={() => toggleStatus(s)}>
                    {s.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan="6" className="empty">No services found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveServiceManagement;
