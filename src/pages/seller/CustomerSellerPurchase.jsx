import React, { useEffect, useState } from "react";
import "./SellerDashboard.css";
import { Bill_IMG_URL, BASE_URL } from "../../config/config";
import {
  getShopPurchases,
  updatePurchaseStatus
} from "../../service/apiService";

const CustomerSellerPurchase = ({ user }) => {
    const sellerId=user.id;
    // console.log("idss",sellerId);
  const [purchases, setPurchases] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
const shop_type="shop";
  useEffect(() => {
    if (!sellerId) return;

    const fetchPurchases = async () => {
      try {
        const res = await getShopPurchases(sellerId);
        if (res.status === "success") {
          setPurchases(res.data);
        }
      } catch (err) {
        console.error("Failed to load purchases", err);
      } finally {
        setPurchaseLoading(false);
      }
    };

    fetchPurchases();
  }, [sellerId]);

  const handleStatus = async (shop_id, status) => {
    let reason = null;

    if (status === "REJECTED") {
      reason = prompt("Enter rejection reason");
      if (!reason) return;
    }

    const res = await updatePurchaseStatus({
      shop_id,
      status,
      reason,
      shop_type
    });

    if (res.status === "success") {
      setPurchases(prev =>
        prev.map(p =>
          p.shop_id === shop_id
            ? { ...p, status, rejection_reason: reason }
            : p
        )
      );
    } else {
      alert("Failed to update status");
    }
  };

  return (
    <section className="transactions-section">
      <h2 className="section-title">🧾 Purchase Transactions</h2>

      {purchaseLoading ? (
        <p>Loading purchases...</p>
      ) : purchases.length === 0 ? (
        <p>No purchase requests</p>
      ) : (
        <div className="table-wrapper">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Bill</th>
                <th>Qr Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td>
                    {new Date(p.created_at).toLocaleString()}
                  </td>

                  <td>
                    <strong>{p.customer_name || "Guest"}</strong>
                    <br />
                    <small>{p.customer_phone || "-"}</small>
                    <br/>
                    <small>{p.customer_email || "-"}</small>
                  </td>

                  <td>₹{p.amount}</td>

                  <td>
                    {p.bill_image ? (
                      <a
                        href={`${Bill_IMG_URL}/${p.bill_image}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {p.qr_image ? (
                      <a
                        href={`${BASE_URL}/${p.qr_image}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    <span className={`status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>

                  <td>
                    {p.status === "PENDING" ? (
                      <>
                        <button
                          className="btn-accept"
                          onClick={() =>
                            handleStatus(p.shop_id, "CONFIRMED")
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="btn-reject"
                          onClick={() =>
                            handleStatus(p.shop_id, "REJECTED")
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CustomerSellerPurchase;
