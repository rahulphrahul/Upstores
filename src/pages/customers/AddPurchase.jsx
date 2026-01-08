import React, { useState } from "react";
import "./AddPurchase.css";

function AddPurchase() {
  const [step, setStep] = useState(1);
  const [billImage, setBillImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  /* Simulate QR scan */
  const handleScan = () => {
    setStep(2);
  };

  const handleImageUpload = (e) => {
    setBillImage(URL.createObjectURL(e.target.files[0]));
    setStep(3);
  };

  const handleSubmit = () => {
    if (!amount) {
      setMessage("Please enter the purchase amount");
      return;
    }

    setMessage("Purchase submitted successfully. Awaiting shop confirmation.");
    setStep(4);
  };

  return (
    <div className="purchase-flow">
      <h2 className="page-title">Add Purchase</h2>

      {/* STEP 1: SCAN QR */}
      {step === 1 && (
        <div className="card center">
          <p className="info-text">
            Scan the shop QR code to add your purchase
          </p>
          <button className="primary-btn" onClick={handleScan}>
            📷 Scan Shop QR
          </button>
        </div>
      )}

      {/* STEP 2: UPLOAD BILL */}
      {step === 2 && (
        <div className="card">
          <h4>Upload Bill</h4>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {/* STEP 3: ENTER AMOUNT */}
      {step === 3 && (
        <div className="card">
          <h4>Confirm Amount</h4>

          {billImage && (
            <img
              src={billImage}
              alt="Bill Preview"
              className="bill-preview"
            />
          )}

          <input
            type="number"
            placeholder="Enter purchase amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <p className="hint">
            Amount auto-detection failed. Please enter manually.
          </p>

          <button className="primary-btn" onClick={handleSubmit}>
            Submit Purchase
          </button>

          {message && <p className="success-text">{message}</p>}
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="card center">
          <h3>✅ Purchase Submitted</h3>
          <p className="info-text">
            Your purchase has been sent to the shop for confirmation.
          </p>
        </div>
      )}
    </div>
  );
}

export default AddPurchase;
