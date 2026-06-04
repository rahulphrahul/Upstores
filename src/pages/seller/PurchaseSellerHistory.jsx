import { useEffect, useState } from "react";
import { getShopPurchaseHistory } from "../../service/apiService";

export default function PurchaseSellerHistory() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
 const user = JSON.parse(localStorage.getItem("user"));
  const shopId = user?.shop_id || user?.id;
  const fetchData = async () => {
    setLoading(true);
    const res = await getShopPurchaseHistory({
      search,
      status,
      from_date: fromDate,
      to_date: toDate,
      shopId
    });

    if (res.status === "success") {
      setData(res.data);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportCSV = () => {
    const rows = [
      ["Customer", "Amount", "Customer Points", "Admin Points", "Status", "Date"],
      ...data.map(d => [
        d.customer_name,
        d.amount,
        d.customer_points,
        d.admin_points,
        d.status,
        d.created_at,
      ]),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_history.csv";
    a.click();
  };

  return (
    <div className="container-fluid min-vh-100 py-4">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">🧾 Purchase History</h4>
            <button className="btn btn-success btn-sm" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          {/* FILTERS */}
          <div className="row g-2 mb-4">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Search customer / QR"
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>

            <div className="col-md-2">
              <input type="date" className="form-control" onChange={e => setFromDate(e.target.value)} />
            </div>

            <div className="col-md-2">
              <input type="date" className="form-control" onChange={e => setToDate(e.target.value)} />
            </div>

            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary w-full" onClick={fetchData}>
                Apply
              </button>
            </div>
          </div>

          {/* TABLE / EMPTY STATE */}
          <div className="flex-grow-1 d-flex flex-column">

            {loading ? (
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <div className="spinner-border text-primary" />
              </div>
            ) : data.length === 0 ? (
              <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 text-muted">
                <div style={{ fontSize: "64px" }}>📭</div>
                <h5 className="mt-3">No Purchase Data Found</h5>
                <p className="text-secondary">Try adjusting filters or date range</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Customer Points</th>
                      <th>Admin Points</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(row => (
                      <tr key={row.id}>
                        <td>{row.customer_name}</td>
                        <td>₹{row.amount}</td>
                        <td>{row.customer_points}</td>
                        <td>{row.admin_points}</td>
                        <td>
                          <span className="badge bg-success">
                            {row.status}
                          </span>
                        </td>
                        <td>{new Date(row.created_at).toLocaleString()}</td>
                        <td>
                          <a
                            href={`/uploads/bills/${row.bill_image}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
