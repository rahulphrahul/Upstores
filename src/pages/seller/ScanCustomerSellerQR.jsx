import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanCustomerQR, addPurchase, getCategories } from "../../service/apiService";
import { toast, ToastContainer } from "react-toastify";
export default function ScanCustomerSellerQR() {
  const scannerRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
  const [qr, setQr] = useState("");
  const [amount, setAmount] = useState("");
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
   const [categories, setCategories] = useState([]);
  const [categoryAmounts, setCategoryAmounts] = useState({});

  
  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories(user?.role); // shop/seller/service
        //  console.log("data",res);
        if (res.status=="success") {
         
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Category load failed", err);
      }
    };

    if (user?.role) {
      loadCategories();
    }
  }, []);

  /* ================= QR SCANNER ================= */
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
 /* ================= HANDLE CATEGORY INPUT ================= */
  const handleAmountChange = (categoryId, value) => {
    setCategoryAmounts(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };
 /* ================= SUBMIT ================= */
const submit = async () => {

  if (!qr || !bill) {
    toast.error("QR and bill required");
    return;
  }

  const items = Object.keys(categoryAmounts)
    .filter(id => parseFloat(categoryAmounts[id]) > 0)
    .map(id => ({
      category_id: parseInt(id),
      amount: parseFloat(categoryAmounts[id])
    }));

  if (items.length === 0) {
    toast.error("Enter at least one category amount");
    return;
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  setLoading(true);

  try {

    /* ===== STEP 1: Validate QR (CHANGED HERE ONLY) ===== */
    const qrFormData = new FormData();
    qrFormData.append("qr", qr);
    qrFormData.append("amount", totalAmount);
    qrFormData.append("bill", bill);

    const qrRes = await scanCustomerQR(qrFormData);

    if (qrRes.status !== "success") {
      toast.error(qrRes.message || "Invalid QR");
      setLoading(false);
      return;
    }

    const customerUserId = qrRes.user_id;

    /* ===== STEP 2: Call add_purchase (UNCHANGED) ===== */
    const formData = new FormData();
    formData.append("amount", totalAmount);
    formData.append("merchant_id", user.id);
    formData.append("merchant_type", user.role);
    formData.append("user_id", customerUserId);
    formData.append("source_role", "customer");
    formData.append("items", JSON.stringify(items));
    formData.append("bill_image", bill);

    const purchaseRes = await addPurchase(formData);

    if (purchaseRes.success) {
      toast.success("Purchase confirmed & points issued");
      setQr("");
      setCategoryAmounts({});
      setBill(null);
    } else {
      toast.error(purchaseRes.message || "Purchase failed");
    }

  } catch (err) {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const total = Object.values(categoryAmounts)
    .map(val => parseFloat(val) || 0)
    .reduce((sum, val) => sum + val, 0);

  setAmount(total > 0 ? total : "");
}, [categoryAmounts]);

  return (
    <div className="card p-3">
         <div className="d-flex justify-content-between align-items-center mb-4">
         <h4>📷 Scan QR</h4>
          </div>
      {!qr && <div id="qr-reader" />}
      {qr && <p>✅ QR scanned</p>}
 {/* ================= CATEGORY SECTION ================= */}
      <h5 className="mt-3">Category Wise Amount</h5>

      {categories.map(cat => (
        <div key={cat.id} className="mb-2 d-flex gap-2 align-items-center">
          <label style={{ width: "150px" }}>{cat.name}</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter amount"
            value={categoryAmounts[cat.id] || ""}
            onChange={(e) => handleAmountChange(cat.id, e.target.value)}
          />
        </div>
      ))}

      {/* ================= BILL UPLOAD ================= */}
      <input
        type="file"
        accept="image/*"
        className="form-control mt-3"
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
