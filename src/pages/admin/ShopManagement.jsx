import React, { useEffect, useState } from "react";
import {
    getShops,
    getPendingShopFunds,
    shopFundAction,
    toggleShopStatus,
} from "../../service/apiService";

import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";
import "./ShopManagement.css";

function ShopManagement() {
    const [loading, setLoading] = useState(true);
    const [shops, setShops] = useState([]);
    const [pending, setPending] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        const [shopsRes, pendingRes] = await Promise.all([
            getShops(),
            getPendingShopFunds(),
        ]);
        setShops(shopsRes);
        setPending(pendingRes);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleFund = async (req, action) => {
        await shopFundAction({
            request_id: req.id,
            shop_id: req.shop_id,
            amount: req.amount,
            action,
        });
        loadAll();
    };

    if (loading) return <ShopManagementSkeleton />;

    return (
        <div className="shop-page">
            <h2 className="page-title">Shop Management</h2>

            {/* Pending Approvals */}
            <div className="card">
                <h4>Pending Fund Requests</h4>
                {pending.map(p => (
                    <div key={p.id} className="fund-row mb-2">
                        <span>{p.shop}</span>
                        <span>₹{p.amount}</span>
                        <button className="btn btn-primary" onClick={() => handleFund(p, "approve")}>Approve</button>
                        <button className="btn btn-danger" onClick={() => handleFund(p, "rejected")}>Reject</button>
                    </div>
                ))}
                {pending.length === 0 && <p>No pending requests</p>}
            </div>

            {/* Shops Table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Shop</th>
                            <th>Owner</th>
                            <th>Executive</th>
                            <th>Wallet</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shops.map(s => (
                            <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.owner_name}</td>
                                <td>{s.executive || "-"}</td>
                                <td>₹{s.wallet_balance}</td>
                                <td><span className={`status ${s.status}`}>{s.status}</span></td>
                                <td>
                                    <button
                                        className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"
                                            }`}
                                        onClick={() => toggleShopStatus(s.id, s.status).then(loadAll)}
                                    >
                                        {s.status === "active" ? "Suspend" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {shops.length === 0 && (
                            <tr>
                                <td colSpan="6">No shops found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ShopManagement;
