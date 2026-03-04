import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { applyLeave, getStaffLeavesSelf, getStaffSalaries } from '../../service/apiService';
import { toast, ToastContainer } from "react-toastify";
function LeaveAndSalary({ user }) {
  const [leaveForm, setLeaveForm] = useState({ leave_date: '', reason: '' });
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);

  // Load data
  useEffect(() => {
    if (user?.id) {
      loadLeaves();
      loadSalaries();
    }
  }, [user]);

  const loadLeaves = async () => {
    const data = await getStaffLeavesSelf(user.id);
    setLeaves(data);
  };

  const loadSalaries = async () => {
    const data = await getStaffSalaries(user.id);
    setSalaries(data);
  };

  const handleChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.leave_date || !leaveForm.reason) return toast.error('Fill all fields');
    const res = await applyLeave({ staff_id: user.id, ...leaveForm });
    if (res.status === 'success') {
      toast.success('Leave applied successfully!');
      setLeaveForm({ leave_date: '', reason: '' });
      loadLeaves();
    } else {
      toast.error('Failed to apply leave');
    }
  };

  return (
    <div className="leave-salary-page">
      <h3 className="mb-4">Leave & Salary Management</h3>

      {/* Leave Apply */}
      <Card className="shadow-sm p-4 mb-4">
        <h5 className="mb-3">Apply for Leave</h5>
        <Form onSubmit={handleApplyLeave}>
          <Form.Group className="mb-3">
            <Form.Label>Leave Date</Form.Label>
            <Form.Control
              type="date"
              name="leave_date"
              value={leaveForm.leave_date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="reason"
              value={leaveForm.reason}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Apply Leave
          </Button>
        </Form>
      </Card>

      {/* Leave History */}
      <Card className="shadow-sm p-4 mb-4">
        <h5 className="mb-3">My Leave History</h5>
        {leaves.length === 0 ? (
          <p className="text-muted">No leave records found.</p>
        ) : (
          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.leave_date}</td>
                  <td>{l.reason}</td>
                  <td>
                    <Badge
                      bg={
                        l.status === 'approved'
                          ? 'success'
                          : l.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {l.status}
                    </Badge>
                  </td>
                  <td>{new Date(l.requested_on).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Salary Slips */}
      <Card className="shadow-sm p-4">
        <h5 className="mb-3">My Salary Slips</h5>
        {salaries.length === 0 ? (
          <p className="text-muted">No salary slips found.</p>
        ) : (
          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross</th>
                <th>Net</th>
                <th>Status</th>
                <th>Paid On</th>
                <th>Slip</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s) => (
                <tr key={s.id}>
                  <td>{s.month_year}</td>
                  <td>₹ {Number(s.gross).toFixed(2)}</td>
                  <td>₹ {Number(s.net).toFixed(2)}</td>
                  <td>
                    <Badge bg={s.status === 'paid' ? 'success' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td>{s.paid_on || '-'}</td>
                  <td>
                    {s.slip_path ? (
                      <a
                        href={`https://crm.semicoloninnovations.in/api/${s.slip_path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default LeaveAndSalary;
