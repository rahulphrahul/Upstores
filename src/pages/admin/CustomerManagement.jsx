import React, { useState } from "react";
import "./CustomerManagement.css";

function CustomerManagement() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Arjun Kumar",
      phone: "9876543210",
      wallet: 2400,
      referrals: ["Ravi", "Suresh"],
    },
    {
      id: 2,
      name: "Meera Nair",
      phone: "9123456789",
      wallet: 1200,
      referrals: [],
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [amount, setAmount] = useState("");

  const toggleReferrals = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openWalletModal = (customer) => {
    setSelectedCustomer(customer);
    setAmount("");
    setShowWalletModal(true);
  };

  const saveWalletAdjustment = () => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, wallet: c.wallet + Number(amount) }
          : c
      )
    );
    setShowWalletModal(false);
  };

  return (
    <div className="customer-page">
      <h2 className="page-title">Customer Management</h2>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Wallet (₹)</th>
              <th>Referrals</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.wallet}</td>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => toggleReferrals(customer.id)}
                    >
                      {customer.referrals.length} View
                    </button>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => openWalletModal(customer)}
                    >
                      Wallet
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowQrModal(true);
                      }}
                    >
                      QR
                    </button>
                  </td>
                </tr>

                {expandedRow === customer.id && (
                  <tr className="referral-row">
                    <td colSpan="5">
                      <strong>Referrals:</strong>{" "}
                      {customer.referrals.length > 0
                        ? customer.referrals.join(", ")
                        : "No referrals"}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-text">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* WALLET MODAL */}
      {showWalletModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Wallet Adjustment</h3>
            <p>
              Customer: <strong>{selectedCustomer.name}</strong>
            </p>

            <input
              type="number"
              placeholder="Enter amount (+ / -)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowWalletModal(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={saveWalletAdjustment}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQrModal && (
        <div className="modal-overlay">
          <div className="modal-box center">
            <h3>Customer QR Code</h3>

            <div className="qr-placeholder">
              QR CODE
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowQrModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManagement;
