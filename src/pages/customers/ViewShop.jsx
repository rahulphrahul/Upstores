import React, { useState, useEffect } from "react";
import { getShopDetails } from "../../service/apiService";
import "./ViewShop.css";

function ViewShop({ shopId, onClose }) {
  console.log("shopId",onClose);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= GET SHOP DETAILS =================
  const fetchShopDetails = async () => {
    setLoading(true);
    try {
      const res = await getShopDetails(shopId);
      if (res.status === "success") {
        setShop(res.data);
      } else {
        alert(res.message || "Shop details not found");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching shop details");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  if (loading) return <div className="loading">Loading shop details...</div>;

  if (!shop) return null;

  return (
    <div className="viewshop-overlay" onClick={onClose}>
      <div className="viewshop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="viewshop-header">
          <h3>{shop.name}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="viewshop-body">
          {/* SHOP DETAILS */}
          <div className="shop-info">
            <p><strong>Owner:</strong> {shop.owner_name}</p>
            <p><strong>Status:</strong> <span className={`status ${shop.status}`}>{shop.status}</span></p>
            <p><strong>Wallet Balance:</strong> ₹{shop.wallet_balance}</p>
            <p><strong>Fund Request:</strong> ₹{shop.fund_request}</p>
            <p><strong>Executive Assigned:</strong> {shop.executive_name || "Not Assigned"}</p>
            <p><strong>Latitude:</strong> {shop.latitude || "-"}</p>
            <p><strong>Longitude:</strong> {shop.longitude || "-"}</p>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="transactions-section">
            <h4>Recent Transactions</h4>
            {shop.transactions && shop.transactions.length > 0 ? (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User Type</th>
                    <th>User Name/ID</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.user_type}</td>
                      <td>{tx.user_name || tx.user_id}</td>
                      <td>₹{tx.amount}</td>
                      <td className={tx.type}>{tx.type}</td>
                      <td>{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewShop;
