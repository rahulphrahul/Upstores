import React, { useState, useEffect } from "react";
import {
  resetWallets,
  getResetHistory,
  exportHistory,
} from "../../service/apiService";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge, Pagination
} from "react-bootstrap";


const AdminWalletManagement = () => {
  const [type, setType] = useState("all");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [role, setRole] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Pagination Logic
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = history.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(history.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const loadHistory = async () => {
    const res = await getResetHistory(from, to, role);
    if (res.status) setHistory(res.data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleReset = async () => {
    if (!reason) return alert("Enter reason");
    if (!window.confirm("Are you sure you want to reset wallets?")) return;

    const res = await resetWallets(type, reason);

    if (res.status) {
      alert(res.message);
      setReason("");
      loadHistory();
    } else {
      alert(res.message);
    }
  };

  return (
    <Container fluid className="mt-4">
      <h3 className="mb-4"> Wallet Management</h3>

      {/* Reset Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold">Reset Wallet</Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Reset Type</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="shop">Shop</option>
                  <option value="service">Service</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter reset reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Button
                variant="danger"
                className="w-100"
                onClick={handleReset}
              >
                Reset Wallet
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* History Section */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Reset History</Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Control
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Control
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All Role</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </Form.Select>
            </Col>

            <Col md={3} className="d-flex gap-2">
              <Button variant="primary" onClick={loadHistory}>
                Filter
              </Button>
              <Button variant="success" onClick={exportHistory}>
                Export CSV
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Source Table</th>
                <th>Wallet</th>
                <th>PV</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
             {currentRecords.length > 0 ? (
            currentRecords.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>
                      <Badge bg="info">{h.role}</Badge>
                    </td>
                    <td>{h.source_table}</td>
                    <td>₹ {h.old_wallet_amount}</td>
                    <td>{h.old_pv_balance}</td>
                    <td>{h.reset_reason}</td>
                    <td>{h.reset_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
           {/* Pagination UI */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          />

          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          />
        </Pagination>
      )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminWalletManagement;