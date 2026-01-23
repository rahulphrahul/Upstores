import React, { useEffect, useState } from "react";
import { getServices, updateServiceStatus } from "../../service/apiService";
import "./ServiceManagement.css";

function ServiceManagement() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  const loadServices = async () => {
    setLoading(true);
    const res = await getServices();
    setServices(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const toggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";
    await updateServiceStatus(service.id, newStatus);
    loadServices();
  };

  if (loading) return <p>Loading services...</p>;

  return (
    <div className="service-page">
      <h2 className="page-title">Service Management</h2>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Commission (%)</th>
              <th>Executive</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category_name || "-"}</td>
                <td>{s.provider_name || "-"}</td>
                <td>{s.commission}%</td>
                <td>{s.executive_name || "-"}</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan="7">No services found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServiceManagement;
