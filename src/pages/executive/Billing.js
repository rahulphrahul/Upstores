import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { getBills, addBill } from '../../service/apiService';
import './Billing.css';
import { toast, ToastContainer } from 'react-toastify';

function Billing({ user }) {
    const [formData, setFormData] = useState({
        studentName: '',
        rollNumber: '',
        course: '',
        description: '',
        amount: '',
    });
    const [showBill, setShowBill] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [bills, setBills] = useState([]);
    const [isNewBill, setIsNewBill] = useState(false); // ✅ added flag

    // Load bills from API
    useEffect(() => {
        if (user) {
            loadBills();
        }
    }, [user]);

    const loadBills = async () => {
        try {
            const data = await getBills(user.id);
            setBills(data);
        } catch (err) {
            console.error('Error loading bills:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const newInvoice = {
            staff_id: user.id,
            invoice_no: Math.floor(1000 + Math.random() * 9000),
            bill_date: new Date().toLocaleDateString(),
            student_name: formData.studentName,
            roll_number: formData.rollNumber,
            course: formData.course,
            description: formData.description,
            amount: formData.amount,
        };
        setInvoiceData(newInvoice);
        setIsNewBill(true); // ✅ mark this as a new unsaved bill
        setShowBill(true);
    };

    const handleSaveBill = async () => {
        try {
            const res = await addBill(invoiceData);
            if (res.status === 'success') {
                await loadBills();
                handlePrint();
                setIsNewBill(false); // ✅ mark as saved after printing
            } else {
                toast.error('Error saving bill.');
            }
        } catch (err) {
            console.error('Save bill error:', err);
        }
    };

    const handleViewBill = (bill) => {
        setInvoiceData(bill);
        setIsNewBill(false); // ✅ mark as existing bill
        setShowBill(true);
    };

    const numberToWords = (num) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
            'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
            'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if ((num = num.toString()).length > 9) return 'Overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{3})(\d{2})$/);
        if (!n) return;
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
        return str.trim();
    };

    const handlePrint = () => {
        const printContent = document.getElementById('bill');
        const WinPrint = window.open('', '', 'width=900,height=650');
       WinPrint.document.write(`
  <html>
    <head>
      <title>Invoice</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #000; }
        .bill-container { width: 700px; margin: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        hr { border: 0; border-top: 1px solid #999; margin: 10px 0; }
        .no-print {
          display: none !important;
          visibility: hidden !important;
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
  </html>
`);

        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    return (
        <div className="billing-page">
            {!showBill ? (
                <>
                    <Card className="shadow-sm p-4 mb-4">
                        <h4 className="mb-4">Student Billing</h4>
                        <Form onSubmit={handleGenerate}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Student Name</Form.Label>
                                        <Form.Control
                                            name="studentName"
                                            value={formData.studentName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Roll Number</Form.Label>
                                        <Form.Control
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Course / Batch</Form.Label>
                                        <Form.Control
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Payment Description</Form.Label>
                                        <Form.Control
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="e.g. 1st Installment, Registration Fee"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Amount (₹)</Form.Label>
                                        <Form.Control
                                            name="amount"
                                            type="number"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button variant="primary" type="submit">Generate Bill</Button>
                        </Form>
                    </Card>

                    <Card className="shadow-sm p-4">
                        <h5 className="mb-3">Previous Bills</h5>
                        {bills.length === 0 ? (
                            <p className="text-muted">No previous bills found.</p>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Invoice No</th>
                                        <th>Date</th>
                                        <th>Student Name</th>
                                        <th>Course</th>
                                        <th>Amount (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((bill, index) => (
                                        <tr key={bill.id || index}>
                                            <td>{index + 1}</td>
                                            <td>{bill.invoice_no}</td>
                                            <td>{bill.bill_date}</td>
                                            <td>{bill.student_name}</td>
                                            <td>{bill.course}</td>
                                            <td>{bill.amount}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleViewBill(bill)}
                                                >
                                                    View & Print
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card>
                </>
            ) : (
                <div className="bill-container shadow-lg p-4 mt-4" id="bill">
                    <div className="text-center mb-3">
                        <h3 className="fw-bold">Semicolon Innovations</h3>
                        <p className="text-muted">Official Student Fee Invoice</p>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                        <p><strong>Invoice No:</strong> #{invoiceData.invoice_no}</p>
                        <p><strong>Date:</strong> {invoiceData.bill_date}</p>
                    </div>

                    <table className="table table-bordered">
                        <tbody>
                            <tr><th>Student Name</th><td>{invoiceData.student_name}</td></tr>
                            <tr><th>Roll Number</th><td>{invoiceData.roll_number}</td></tr>
                            <tr><th>Course / Batch</th><td>{invoiceData.course}</td></tr>
                            <tr><th>Payment Description</th><td>{invoiceData.description}</td></tr>
                            <tr><th>Amount Paid</th><td>₹ {invoiceData.amount}</td></tr>
                            <tr><th>Amount in Words</th><td>{numberToWords(invoiceData.amount)} Rupees Only</td></tr>
                        </tbody>
                    </table>

                    <div className="text-end mt-5">
                        <p>Authorized Signatory</p>
                        <h6 className="mt-4">___________________</h6>
                    </div>

                    <div className="text-center mt-5">
                        <p><em>This is a computer-generated bill. No signature required.</em></p>
                    </div>

                    <div className="text-center mt-4 no-print">
                        {isNewBill ? (
                            <Button variant="success" onClick={handleSaveBill}>
                                Print & Save
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={handlePrint}>
                                Print Only
                            </Button>
                        )}{' '}
                        <Button variant="secondary" onClick={() => setShowBill(false)}>
                            Back
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;
