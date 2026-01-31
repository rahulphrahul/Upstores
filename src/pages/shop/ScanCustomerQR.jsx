import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanCustomerQR } from "../../service/apiService";

export default function ScanCustomerQR() {
  const scannerRef = useRef(null);
  const [qr, setQr] = useState("");
  const [amount, setAmount] = useState("");
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (qr) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    let isMounted = true; // track if component is still mounted

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          decodedText => {
            if (!isMounted) return;
            setQr(decodedText);

            // Stop scanner after successful scan
            stopScanner();
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current && scannerRef.current.getState) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) { // SCANNING
            await scannerRef.current.stop();
          }
        } catch (e) {
          console.warn("Scanner stop failed (ignore):", e);
        }
        try {
          await scannerRef.current.clear();
        } catch (e) {
          console.warn("Scanner clear failed (ignore):", e);
        }
        scannerRef.current = null;
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner(); // safe cleanup
    };
  }, [qr]);

  const submit = async () => {
    if (!qr || !amount || !bill) {
      alert("QR, bill and amount are required");
      return;
    }

    const formData = new FormData();
    formData.append("qr", qr);
    formData.append("amount", amount);
    formData.append("bill", bill);

    setLoading(true);
    try {
      const res = await scanCustomerQR(formData);
      if (res.status === "success") {
        alert("Purchase confirmed & points issued");
        setQr("");
        setAmount("");
        setBill(null);
      } else {
        alert(res.message || "Failed");
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
         <div className="d-flex justify-content-between align-items-center mb-4">
         <h4 className="mb-0">📷 Scan QR</h4>
          </div>
      {!qr && <div id="qr-reader" />}
      {qr && <p>✅ QR scanned</p>}

      <input
        type="file"
        accept="image/*"
        className="form-control"
        onChange={e => setBill(e.target.files[0])}
      />
      <input
        type="number"
        placeholder="Bill amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button className="btn btn-primary mt-2" disabled={loading} onClick={submit}>
        {loading ? "Processing..." : "Confirm Purchase"}
      </button>
    </div>
  );
}
