import React, { useCallback, useEffect, useState } from "react";
import {
  resetWallets,
  getResetHistory,
  exportHistory,
  getCustomerWithdrawals,
  exportCustomerWithdrawals,
} from "../../service/apiService";
import { Form, Button, Table, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "./AdminWalletManagement.css";

const AdminWalletManagement = () => {
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);

  const recordsPerPage = 5;

  const loadHistory = useCallback(async () => {
    const res = await getResetHistory(from, to);

    if (res.status) {
      setHistory(res.data || []);
      setHistoryPage(1);
      return;
    }

    setHistory([]);
  }, [from, to]);

  const loadWithdrawals = useCallback(async () => {
    const res = await getCustomerWithdrawals(from, to, searchName);

    if (res.status) {
      setWithdrawals(res.data || []);
      setWithdrawalPage(1);
      return;
    }

    setWithdrawals([]);
  }, [from, to, searchName]);

  const loadInitialData = useCallback(async () => {
    const [historyRes, withdrawalsRes] = await Promise.all([
      getResetHistory("", ""),
      getCustomerWithdrawals("", "", ""),
    ]);

    if (historyRes.status) {
      setHistory(historyRes.data || []);
    }

    if (withdrawalsRes.status) {
      setWithdrawals(withdrawalsRes.data || []);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleReset = async () => {
    if (!reason) {
      toast.error("Enter reason");
      return;
    }

    if (!window.confirm("Confirm reset?")) return;

    setLoading(true);

    const res = await resetWallets("admin", reason);

    if (res.status) {
      toast.success(res.message);
      setReason("");
      loadHistory();
    } else {
      toast.error(res.message);
    }

    setLoading(false);
  };

  const paginate = (data, page) => {
    const indexOfLast = page * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    return data.slice(indexOfFirst, indexOfLast);
  };

  const getStatusClassName = (status) => {
    if (status === "active") return "admin-wallet-management__status--success";
    if (status === "rejected") return "admin-wallet-management__status--danger";
    return "admin-wallet-management__status--warning";
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Success";
    return status || "Pending";
  };

  const renderPagination = (data, page, setPage) => {
    const totalPages = Math.ceil(data.length / recordsPerPage);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="admin-wallet-management__pagination-list">
        <Pagination.Prev
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          &lsaquo;
        </Pagination.Prev>
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === page}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
          disabled={page === totalPages}
          aria-label="Next page"
        >
          &rsaquo;
        </Pagination.Next>
      </Pagination>
    );
  };

  const paginatedHistory = paginate(history, historyPage);
  const paginatedWithdrawals = paginate(withdrawals, withdrawalPage);

  return (
    <div className="admin-wallet-management">
      <ToastContainer />

      <h2 className="admin-wallet-management__title">
        Admin Points Management
      </h2>

      <section className="admin-wallet-management__panel">
        <div className="admin-wallet-management__toolbar">
          <div className="admin-wallet-management__field">
            <label
              className="admin-wallet-management__label sr-only"
              htmlFor="admin-wallet-reason"
            >
              Reason
            </label>
            <Form.Control
              id="admin-wallet-reason"
              className="admin-wallet-management__control"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="admin-wallet-management__button-wrap">
            <Button
              className="admin-wallet-management__button admin-wallet-management__button--wide"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Admin Points
            </Button>
          </div>
        </div>
      </section>

      <section className="admin-wallet-management__panel">
        <h3 className="admin-wallet-management__section-title">
          Reset History
        </h3>

        <div className="admin-wallet-management__filters">
          <div className="admin-wallet-management__field">
            <label
              className="admin-wallet-management__label sr-only"
              htmlFor="admin-wallet-from"
            >
              From date
            </label>
            <Form.Control
              id="admin-wallet-from"
              className="admin-wallet-management__control"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="admin-wallet-management__field">
            <label
              className="admin-wallet-management__label sr-only"
              htmlFor="admin-wallet-to"
            >
              To date
            </label>
            <Form.Control
              id="admin-wallet-to"
              className="admin-wallet-management__control"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="admin-wallet-management__button-wrap">
            <Button
              className="admin-wallet-management__button"
              onClick={loadHistory}
            >
              Search
            </Button>
          </div>

          <div className="admin-wallet-management__button-wrap">
            <Button
              className="admin-wallet-management__button"
              onClick={exportHistory}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="admin-wallet-management__table-wrap">
          <Table bordered className="admin-wallet-management__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Old Points</th>
                <th>Old PV</th>
                <th>Reason</th>
                <th>Reset By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((item) => (
                  <tr key={item.id}>
                    <td data-label="ID">{item.id}</td>
                    <td data-label="Old Points">{item.old_wallet_amount}</td>
                    <td data-label="Old PV">{item.old_pv_balance}</td>
                    <td data-label="Reason">{item.reset_reason}</td>
                    <td data-label="Reset By">{item.reset_by_name}</td>
                    <td data-label="Date">{item.reset_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-wallet-management__empty-cell"
                  >
                    No reset history found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="admin-wallet-management__pagination">
          {renderPagination(history, historyPage, setHistoryPage)}
        </div>
      </section>

      <section className="admin-wallet-management__panel">
        <h3 className="admin-wallet-management__section-title">
          Customer Withdrawals
        </h3>

        <div className="admin-wallet-management__filters admin-wallet-management__filters--withdrawals">
          <div className="admin-wallet-management__field">
            <label
              className="admin-wallet-management__label sr-only"
              htmlFor="admin-wallet-search-name"
            >
              Search name
            </label>
            <Form.Control
              id="admin-wallet-search-name"
              className="admin-wallet-management__control"
              placeholder="Search Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="admin-wallet-management__button-wrap">
            <Button
              className="admin-wallet-management__button"
              onClick={loadWithdrawals}
            >
              Search
            </Button>
          </div>

          <div className="admin-wallet-management__button-wrap">
            <Button
              className="admin-wallet-management__button"
              onClick={() => exportCustomerWithdrawals(from, to)}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="admin-wallet-management__table-wrap">
          <Table bordered className="admin-wallet-management__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWithdrawals.length > 0 ? (
                paginatedWithdrawals.map((item) => (
                  <tr key={item.id}>
                    <td data-label="ID">{item.id}</td>
                    <td data-label="Name">{item.name}</td>
                    <td data-label="Email">{item.email}</td>
                    <td data-label="Amount">Rs. {item.amount}</td>
                    <td data-label="Status">
                      <span
                        className={`admin-wallet-management__status ${getStatusClassName(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td data-label="Date">{item.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-wallet-management__empty-cell"
                  >
                    No withdrawals found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="admin-wallet-management__pagination">
          {renderPagination(
            withdrawals,
            withdrawalPage,
            setWithdrawalPage
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminWalletManagement;
