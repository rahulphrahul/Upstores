import React, { useState } from "react";
import "./WalletRedemption.css";

function WalletRedemption() {
  const [wallet] = useState({
    balance: 420,
    points: 1680,
    conversionRate: "100 Points = ₹10",
    minRedeem: 500,
  });

  const [redeemPoints, setRedeemPoints] = useState("");
  const [message, setMessage] = useState("");

  const redemptionHistory = [
    { id: 1, points: 500, amount: 50, date: "05 Jan 2025" },
    { id: 2, points: 800, amount: 80, date: "20 Dec 2024" },
  ];

  const handleRedeem = () => {
    setMessage("");

    if (redeemPoints < wallet.minRedeem) {
      setMessage(`Minimum ${wallet.minRedeem} points required`);
      return;
    }

    if (redeemPoints > wallet.points) {
      setMessage("Insufficient points");
      return;
    }

    setMessage("Redemption request submitted successfully");
    setRedeemPoints("");
  };

  return (
    <div className="wallet-page">
      <h2 className="page-title">Wallet & Rewards</h2>

      {/* WALLET SUMMARY */}
      <div className="wallet-card">
        <div className="wallet-balance">
          <label>Wallet Balance</label>
          <h3>₹ {wallet.balance}</h3>
        </div>

        <div className="points-info">
          <div>
            <label>Available Points</label>
            <p>{wallet.points}</p>
          </div>
          <div>
            <label>Conversion</label>
            <p>{wallet.conversionRate}</p>
          </div>
        </div>
      </div>

      {/* REDEEM SECTION */}
      <div className="card">
        <h4>Redeem Points</h4>

        <input
          type="number"
          placeholder="Enter points to redeem"
          value={redeemPoints}
          onChange={(e) => setRedeemPoints(e.target.value)}
        />

        <p className="hint">
          Minimum redeemable points: {wallet.minRedeem}
        </p>

        {message && <div className="message">{message}</div>}

        <button className="redeem-btn" onClick={handleRedeem}>
          Redeem Now
        </button>
      </div>

      {/* HISTORY */}
      <div className="card">
        <h4>Redemption History</h4>

        <div className="history-list">
          {redemptionHistory.map((r) => (
            <div key={r.id} className="history-item">
              <div>
                <strong>{r.points} Points</strong>
                <span>{r.date}</span>
              </div>
              <span className="amount">₹ {r.amount}</span>
            </div>
          ))}

          {redemptionHistory.length === 0 && (
            <p className="empty">No redemption history</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletRedemption;
