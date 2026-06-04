import React, { useState, useEffect } from "react";
import "./PurchaseHistory.css";
import { getPurchaseHistorys } from "../../service/apiService"; // Your API service
import { FALLBACK_IMAGE } from "../../config/config";

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
 const user = JSON.parse(localStorage.getItem("user"));
 const executiveId =user?.id;
  // =========================
  // Load purchases from API
  // =========================
  const loadPurchases = async () => {
    if (!executiveId) return; // exit if no executive ID

    setLoading(true);
    try {
      const res = await getPurchaseHistorys(executiveId);
      if (res.status === "success") {
        setPurchases(res.data);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error("Failed to load purchases", err);
      setPurchases([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPurchases();
  }, [executiveId]);

  return (
    <div className="purchase-page">
      <h2 className="page-title">Purchase History</h2>

      {loading && <p>Loading purchases...</p>}

      <div className="purchase-list">
        {purchases.map((p) => (
          <div key={p.id} className="purchase-card">
            <div className="purchase-top">
              <h4>{p.shop_name || "Unknown Shop"}</h4>
              <span className={`status ${p.status}`}>{p.status}</span>
            </div>

            <div className="purchase-middle">
              <div>
                <label>Amount</label>
                <p>₹ {p.amount}</p>
              </div>
              <div>
                <label>Points</label>
                <p>{p.points}</p>
              </div>
            </div>

            <div className="purchase-bottom">
              <span className="date">{p.date}</span>
              <button
                className="view-btn"
                onClick={() =>
                  setSelectedBill(
                    p.bill || "https://via.placeholder.com/400x600?text=Bill"
                  )
                }
              >
                View Bill
              </button>
            </div>
          </div>
        ))}

        {!loading && purchases.length === 0 && (
          <p className="empty">No purchases found</p>
        )}
      </div>

      {/* BILL BOTTOM SHEET */}
      {selectedBill && (
        <div className="bill-overlay" onClick={() => setSelectedBill(null)}>
          <div className="bill-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <img src={selectedBill || FALLBACK_IMAGE} alt="Bill" />
            <button
              className="close-btn"
              onClick={() => setSelectedBill(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseHistory;
