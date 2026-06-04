import React, { useState, useEffect } from "react";
import {
  resetWallets,
  getResetHistory,
  exportHistory,
  getCustomerWithdrawals,
  exportCustomerWithdrawals
} from "../../service/apiService";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Pagination
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

const AdminWalletManagement = () => {

  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchName, setSearchName] = useState("");

  const [loading, setLoading] = useState(false);

  // PAGINATION
  const [historyPage, setHistoryPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);

  const recordsPerPage = 5;

  // ================= LOAD HISTORY =================
  const loadHistory = async () => {
    const res = await getResetHistory(from, to);
    if (res.status) setHistory(res.data);
  };

  // ================= LOAD WITHDRAWALS =================
  const loadWithdrawals = async () => {
    const res = await getCustomerWithdrawals(from, to, searchName);
    if (res.status) setWithdrawals(res.data);
  };

  useEffect(() => {
    loadHistory();
    loadWithdrawals(); // ✅ NOW CALLS ON PAGE LOAD
  }, []);

  // ================= RESET =================
  const handleReset = async () => {
    if (!reason) return toast.error("Enter reason");

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

  // ================= PAGINATION LOGIC =================
  const paginate = (data, page) => {
    const indexOfLast = page * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    return data.slice(indexOfFirst, indexOfLast);
  };

  const renderPagination = (data, page, setPage) => {
    const totalPages = Math.ceil(data.length / recordsPerPage);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="justify-content-center">
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === page}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  return (
    <Container className="mt-4">
      <ToastContainer />

      <h3>Admin Points Management</h3>

      {/* RESET */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Control
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Button
                variant="danger"
                onClick={handleReset}
                disabled={loading}
              >
                Reset Admin Points
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* HISTORY */}
      <Card className="mb-4">
        <Card.Header>Reset History</Card.Header>
        <Card.Body>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Control type="date" value={from}
                onChange={(e) => setFrom(e.target.value)} />
            </Col>
            <Col md={3}>
              <Form.Control type="date" value={to}
                onChange={(e) => setTo(e.target.value)} />
            </Col>
            <Col md={3}>
              <Button onClick={loadHistory}>Search</Button>
            </Col>
            <Col md={3}>
              <Button variant="success" onClick={exportHistory}>
                Export CSV
              </Button>
            </Col>
          </Row>

          <Table bordered>
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
              {paginate(history, historyPage).map((h) => (
                <tr key={h.id}>
                  <td>{h.id}</td>
                  <td>{h.old_wallet_amount}</td>
                  <td>{h.old_pv_balance}</td>
                  <td>{h.reset_reason}</td>
                  <td>{h.reset_by_name}</td>
                  <td>{h.reset_at}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {renderPagination(history, historyPage, setHistoryPage)}

        </Card.Body>
      </Card>

      {/* WITHDRAWALS */}
      <Card>
        <Card.Header>Customer Withdrawals</Card.Header>
        <Card.Body>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Control
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Button onClick={loadWithdrawals}>Search</Button>
            </Col>
            <Col md={3}>
              <Button
                variant="success"
                onClick={() =>
                  exportCustomerWithdrawals(from, to)
                }
              >
                Export CSV
              </Button>
            </Col>
          </Row>

          <Table bordered>
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
              {paginate(withdrawals, withdrawalPage).map((w) => (
                <tr key={w.id}>
                  <td>{w.id}</td>
                  <td>{w.name}</td>
                  <td>{w.email}</td>
                  <td>₹ {w.amount}</td>
              <Badge
  bg={
    w.status === "active"
      ? "success"
      : w.status === "rejected"
      ? "danger"
      : "warning"
  }
>
  {w.status === "active"
    ? "Success"
    : w.status || "Pending"}
</Badge>
                  <td>{w.created_at}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {renderPagination(withdrawals, withdrawalPage, setWithdrawalPage)}

        </Card.Body>
      </Card>

    </Container>
  );
};

export default AdminWalletManagement;