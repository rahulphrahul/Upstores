import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import { toast, ToastContainer } from "react-toastify";
import {
  getWalletSummary,
  getWalletHistory,
  requestWalletFund
} from "../../service/apiService";

export default function WalletService() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

    // 🔐 Get logged-in user
  const user =  JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shop_id || user?.id; 

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await getWalletSummary(shopId);
      setBalance(summary.balance || 0);

      const h = await getWalletHistory(shopId, from, to);
      setHistory(h.data || []);
    } catch (err) {
      console.error("Error loading wallet data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [from, to]);

  const submitRequest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const formData = new FormData();
    formData.append("shop_id", shopId);
    formData.append("amount", amount);
    if (proof) formData.append("proof", proof);

    try {
      const res = await requestWalletFund(formData);
      if (res.success) {
        toast.success("Wallet fund request submitted successfully!");
        setAmount("");
        setProof(null);
        loadData();
      } else {
        toast.error(res.message || "Failed to submit wallet request");
      }
    } catch (err) {
      console.error("Error submitting wallet request:", err);
      toast.error("Something went wrong");
    }
  };

  const filtered = history.filter(
    (item) =>
      (item.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { name: "Date", selector: (row) => row.created_at, sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Credit",
      selector: (row) => (row.type === "credit" ? row.amount : "-"),
      sortable: true
    },
    {
      name: "Debit",
      selector: (row) => (row.type === "debit" ? row.amount : "-"),
      sortable: true
    },
    { name: "Status", selector: (row) => row.status || "-", sortable: true },
    { name: "Description", selector: (row) => row.description || "-" }
  ];

  return (
    <div className="card p-3">
      <h4 className="mb-3">💰 Wallet Management</h4>

      {/* Current Balance */}
      <div className="toast.error toast.error-success">
        Current Balance: <strong>₹ {balance}</strong>
      </div>

      {/* Request Wallet */}
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Request Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="file"
            className="form-control"
            onChange={(e) => setProof(e.target.files[0])}
          />
        </div>
        <div className="col-md-8">
          <button className="btn btn-primary" onClick={submitRequest}>
            Request Wallet
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-2">
          <label>From Date</label>
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label>To Date</label>
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label>Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search description or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <CSVLink
            data={filtered}
            filename="wallet-history.csv"
            className="btn btn-success"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Wallet History Table */}
      <DataTable
        columns={columns}
        data={filtered}
        pagination
        highlightOnHover
        progressPending={loading}
        noDataComponent={
          <div className="text-center p-4 text-muted">
            <span style={{ fontSize: "50px", display: "block" }}>💸</span>
            <strong>No wallet history found</strong>
          </div>
        }
      />
    </div>
  );
}
