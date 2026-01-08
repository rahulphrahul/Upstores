import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { addStudent } from '../../service/apiService';
import './Admission.css';

function Admission({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    admission_date: '',
    address: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...formData,
      created_by: user.id,
    };
    const res = await addStudent(data);
    setLoading(false);
    if (res.status === 'success') {
      alert('Student added successfully!');
      setFormData({
        name: '',
        phone: '',
        email: '',
        course: '',
        admission_date: '',
        address: '',
        remarks: '',
      });
    } else {
      alert('Error: ' + res.message);
    }
  };

  return (
    <div className="admission-page">
      <h3 className="mb-4">New Student Admission</h3>

      <Card className="shadow-sm p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Student Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Course / Program</Form.Label>
                <Form.Control
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Admission Date</Form.Label>
                <Form.Control
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Any remarks (optional)"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Admission'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Admission;
