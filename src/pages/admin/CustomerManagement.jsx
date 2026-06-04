import React, { useEffect, useState } from "react";
import "./CustomerManagement.css";
import { getCustomers,updateWallet,deleteCustomer } from "../../service/apiService";
import { toast } from "react-toastify";
import { BASE_CUSTM_IMG_URL,FALLBACK_IMAGE } from "../../config/config";

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [amount, setAmount] = useState("");
  const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
const limit = 10;
useEffect(() => {
  loadCustomers();
}, [page, search]);

const loadCustomers = async () => {
  const res = await getCustomers(page, search);

  if (res.status) {
    setCustomers(res.data);
    setTotal(res.total);
  }
};

  const toggleReferrals = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openWalletModal = (customer) => {
    setSelectedCustomer(customer);
    setAmount("");
    setShowWalletModal(true);
  };

const saveWalletAdjustment = async () => {
  try {
    await updateWallet(selectedCustomer.user_id, Number(amount));

    toast.success("Wallet updated successfully ");

    setShowWalletModal(false);
    loadCustomers(); // refresh from DB
  } catch (error) {
    toast.error("Failed to update wallet ❌");
    console.error(error);
  }
};

  return (
    <div className="customer-page">
      <h2 className="page-title">Customer Management</h2>

      <div className="card">
  <div className="table-scroll">
    <div className="search-bar">
  <input
    type="text"
    placeholder="Search customers..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
  />

  <button className="btn btn-primary"
    onClick={() => {
      setPage(1);
      setSearch(searchInput);
    }}
  >
    Search
  </button>

  <button className="btn btn-secondary"
    onClick={() => {
      setSearchInput("");
      setSearch("");
      setPage(1);
    }}
  >
    Clear
  </button>
</div>
    <table className="data-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Wallet (₹)</th>
              <th>Referrals</th>
              <th className="customer-page__actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <React.Fragment key={c.id}>
                <tr>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.wallet ?? 0}</td>

                  <td>
                    <button
                      className="link-btn"
                      onClick={() => toggleReferrals(c.id)}
                    >
                      {c.referrals.length} View
                    </button>
                  </td>

                  <td className="customer-page__actions-cell">
                    <div className="customer-page__action-group">
                      <button
                        className="action-btn action-btn--wallet"
                        onClick={() => openWalletModal(c)}
                      >
                        Wallet
                      </button>
                      <button
                        className="action-btn action-btn--qr"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowQrModal(true);
                        }}
                      >
                        QR
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => {
                          if (window.confirm("Delete this customer?")) {
                            deleteCustomer(c.customer_id).then(() =>
                              loadCustomers()
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedRow === c.id && (
                  <tr className="referral-row">
                    <td colSpan="5">
                      <strong>Referrals:</strong>{" "}
                      {c.referrals.length
                        ? c.referrals.join(", ")
                        : "No referrals"}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {!customers.length && (
              <tr>
                <td colSpan="5" className="empty-text">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      {Math.ceil(total / limit) > 1 && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${page === i + 1 ? "active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      </div>
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
      {showQrModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-box center">
            <h3>{selectedCustomer.name} QR Code</h3>

            {selectedCustomer.qr_image ? (
              <img
                src={BASE_CUSTM_IMG_URL + selectedCustomer.qr_image || FALLBACK_IMAGE}
                alt="QR"
                className="qr-img"
              />
            ) : (
              <p>No QR available</p>
            )}

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
