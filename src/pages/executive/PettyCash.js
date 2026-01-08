import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import {
    getPettyCash,
    addPettyCash,
    getUsers
} from '../../service/apiService';
import './PettyCash.css';

function PettyCash({ user }) {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [staffList, setStaffList] = useState([]);

    const [entry, setEntry] = useState({
        type: 'expense',
        spend_from: 'petty_cash',
        spent_by: '',
        category: '',
        description: '',
        amount: '',
        remarks: '',
    });

    useEffect(() => {
        if (user) {
            loadTransactions();
            loadStaff();
        }
    }, [user]);

    const loadTransactions = async () => {
        const data = await getPettyCash(user.id);
        setTransactions(data || []);

        if (data && data.length > 0) {
            setBalance(parseFloat(data[0].balance_after) || 0);
        } else {
            setBalance(0);
        }
    };

    const loadStaff = async () => {
        const res = await getUsers();
        setStaffList(res || []);
    };

    if (!user) return <div className="text-center mt-5">Loading user...</div>;

    const handleChange = (e) => {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();

        const amt = parseFloat(entry.amount);
        if (!amt || amt <= 0) return alert('Enter valid amount');
        if (entry.type === 'expense' && !entry.spent_by)
            return alert('Please select who spent');

        let newBalance = parseFloat(balance) || 0;

        if (entry.type === 'add') {
            newBalance += amt;
        } else {
            if (entry.spend_from === 'petty_cash') {
                if (amt > newBalance)
                    return alert('Insufficient petty cash balance');
                newBalance -= amt;
            }
            // If spend_from === 'other', balance remains unchanged
        }

        const newTxn = {
            user_id: user.id,
            txn_type: entry.type,
            spend_from: entry.spend_from,
            spent_by: entry.spent_by || null,
            category: entry.category || '-',
            description:
                entry.description ||
                (entry.type === 'add' ? 'Cash Added' : ''),
            amount: amt,
            balance_after: newBalance,
        };

        const res = await addPettyCash(newTxn);

        if (res.status === 'success') {
            alert('Transaction saved');
            loadTransactions();
            setEntry({
                type: 'expense',
                spend_from: 'petty_cash',
                spent_by: '',
                category: '',
                description: '',
                amount: '',
            });
        } else {
            alert('Error saving transaction');
        }
    };

    return (
        <div className="petty-cash-page">
            <Card className="shadow-sm p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Petty Cash Manager</h4>
                    <h5>
                        Current Balance:{' '}
                        <Badge bg={balance >= 0 ? 'success' : 'danger'}>
                            ₹ {Number(balance).toFixed(2)}
                        </Badge>
                    </h5>
                </div>

                <Form onSubmit={handleAddTransaction}>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Transaction Type</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={entry.type}
                                    onChange={handleChange}
                                >
                                    <option value="add">Add Money</option>
                                    <option value="expense">Expense</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {entry.type === 'expense' && (
                            <>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Spend From</Form.Label>
                                        <Form.Select
                                            name="spend_from"
                                            value={entry.spend_from}
                                            onChange={handleChange}
                                        >
                                            <option value="petty_cash">
                                                Petty Cash
                                            </option>
                                            <option value="other">
                                                Other
                                            </option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Who Spent</Form.Label>
                                        <Form.Select
                                            name="spent_by"
                                            value={entry.spent_by}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select User
                                            </option>
                                            {staffList.map((u) => (
                                                <option
                                                    key={u.id}
                                                    value={u.id}
                                                >
                                                    {u.name} ({u.role})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={entry.category}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option>Stationery</option>
                                            <option>Utilities</option>
                                            <option>Pantry</option>
                                            <option>Travel</option>
                                            <option>Maintenance</option>
                                            <option>Miscellaneous</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                    </Row>

                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Amount (₹)</Form.Label>
                                <Form.Control
                                    name="amount"
                                    type="number"
                                    value={entry.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        {entry.type === 'expense' && (
                            <Col md={9}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        name="description"
                                        value={entry.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        )}
                    </Row>

                    <Button type="submit">
                        {entry.type === 'add'
                            ? 'Add Money'
                            : 'Log Expense'}
                    </Button>
                </Form>
            </Card>

            <Card className="shadow-sm p-4">
                <h5>Transaction History</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Spent From</th>
                            <th>Spent By</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Balance After</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn, i) => (
                            <tr key={txn.id}>
                                <td>{i + 1}</td>
                                <td>{txn.txn_date}</td>
                                <td>
                                    <Badge
                                        bg={
                                            txn.txn_type === 'add'
                                                ? 'success'
                                                : 'danger'
                                        }
                                    >
                                        {txn.txn_type === 'add'
                                            ? 'Credit'
                                            : 'Debit'}
                                    </Badge>
                                </td>
                                <td>
                                    {txn.spend_from === 'petty_cash'
                                        ? 'Petty Cash'
                                        : 'Other'}
                                </td>
                                <td>{staffList.find(staff => staff.id === String(txn.spent_by))?.name || "—"}</td>
                                <td>{txn.category}</td>
                                <td>{txn.description}</td>
                                <td>₹ {txn.amount}</td>
                                <td>₹ {txn.balance_after}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

export default PettyCash;
