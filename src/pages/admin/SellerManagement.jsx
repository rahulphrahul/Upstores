import React, { useEffect, useState } from "react";
import { getSellers,getWalletRequests, updateSellerStatus, handleWalletRequest } from "../../service/apiService";
import "./SellerManagement.css";

function SellerManagement() {
const [loading, setLoading] = useState(true);
const [sellers, setSellers] = useState([]);
const [pending, setPending] = useState([]);

const shop_type = "seller";

const loadSellers = async () => {
  setLoading(true);
  try {
    const [sellersRes, pendingRes] = await Promise.all([
      getSellers(),
      getWalletRequests(shop_type),
    ]);

    setSellers(sellersRes?.data || sellersRes || []);
    setPending(pendingRes?.data || pendingRes || []);
  } catch (err) {
    console.error("Load error", err);
    setSellers([]);
    setPending([]);
  } finally {
    setLoading(false);
  }
};
// console.log("pending",pending);
const onWalletAction = async (req, action) => {
  try {
    await handleWalletRequest(
      req.user_id,        // request_id
      action,        // approve | rejected
      "seller"       // shop_type
    );

    loadSellers(); // refresh list
  } catch (err) {
    console.error("Wallet action failed", err);
    alert("Failed to update wallet request");
  }
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
      
            {/* Pending Approvals */}
          <div className="card shadow-sm p-4 bg-white rounded-lg">
  <h4 className="mb-4 font-semibold text-lg">
    Pending Fund Requests
  </h4>

  {pending.length === 0 ? (
    <p className="text-gray-500 text-sm">No pending requests</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-600">
            <th className="p-3">Shop</th>
            <th className="p-3">Amount</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {pending.map((p) => (
            <tr
              key={p.user_id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3 font-medium text-gray-800">
                {p.shop}
              </td>

              <td className="p-3 text-gray-700 font-semibold">
                ₹{p.amount}
              </td>

              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button
                    className="btn btn-success btn-sm px-3"
                    onClick={() => onWalletAction(p, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm px-3"
                    onClick={() => onWalletAction(p, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Owner</th>
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
                <td>{s.owner_name}</td>
                <td>{s.executive || "-"}</td>
                <td>₹{s.wallet_balance}</td>
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
