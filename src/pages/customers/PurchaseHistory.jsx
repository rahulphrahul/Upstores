import React, { useState } from "react";
import "./PurchaseHistory.css";

function PurchaseHistory() {
  const [purchases] = useState([
    {
      id: 1,
      shop: "Green Mart",
      amount: 1200,
      points: 48,
      status: "confirmed",
      date: "10 Jan 2025",
      bill: "https://via.placeholder.com/400x600?text=Bill",
    },
    {
      id: 2,
      shop: "Fresh Point",
      amount: 650,
      points: 26,
      status: "pending",
      date: "12 Jan 2025",
      bill: "https://via.placeholder.com/400x600?text=Bill",
    },
    {
      id: 3,
      shop: "Daily Needs",
      amount: 430,
      points: 0,
      status: "rejected",
      date: "15 Jan 2025",
      bill: "https://via.placeholder.com/400x600?text=Bill",
    },
  ]);

  const [selectedBill, setSelectedBill] = useState(null);

  return (
    <div className="purchase-page">
      <h2 className="page-title">Purchase History</h2>

      <div className="purchase-list">
        {purchases.map((p) => (
          <div key={p.id} className="purchase-card">
            <div className="purchase-top">
              <h4>{p.shop}</h4>
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
                onClick={() => setSelectedBill(p.bill)}
              >
                View Bill
              </button>
            </div>
          </div>
        ))}

        {purchases.length === 0 && (
          <p className="empty">No purchases found</p>
        )}
      </div>

      {/* BILL BOTTOM SHEET */}
      {selectedBill && (
        <div className="bill-overlay" onClick={() => setSelectedBill(null)}>
          <div
            className="bill-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <img src={selectedBill} alt="Bill" />
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
