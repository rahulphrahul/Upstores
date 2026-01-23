import React, { useEffect, useState } from "react";
import { getSellers, updateSellerStatus } from "../../service/apiService";
import "./SellerManagement.css";

function SellerManagement() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);

  const loadSellers = async () => {
    setLoading(true);
    const res = await getSellers();
    setSellers(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const toggleStatus = async (seller) => {
    const newStatus = seller.status === "active" ? "suspended" : "active";
    await updateSellerStatus(seller.id, newStatus);
    loadSellers();
  };

  if (loading) return <p>Loading sellers...</p>;

  return (
    <div className="seller-page">
      <h2 className="page-title">Seller Management</h2>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Shop</th>
              <th>Executive</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email || "-"}</td>
                <td>{s.shop_name || "-"}</td>
                <td>{s.executive_name || "-"}</td>
                <td>₹{s.wallet}</td>
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
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr>
                <td colSpan="8">No sellers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerManagement;
