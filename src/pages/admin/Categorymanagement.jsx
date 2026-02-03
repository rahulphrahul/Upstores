import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { addCategory } from "../../service/apiService";
const Categorymanagement = () => {
  const [name, setName] = useState("");
  const [mainType, setMainType] = useState("");
  const [icon, setIcon] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  /* =========================
     ICON CHANGE
  ========================= */
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Icon must be less than 2MB");
      return;
    }

    setIcon(file);
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !mainType || !icon) {
      setError("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("main_type", mainType);
    formData.append("icon", icon);

    try {
      const res = await addCategory(formData);

      if (res.status === "success") {
        setSuccess("Category created successfully");
        setName("");
        setMainType("");
        setIcon(null);
      } else {
        setError(res.message || "Failed to create category");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="fw-bold mb-3">Add Category</h5>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* CATEGORY NAME */}
                <Form.Group className="mb-3">
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                {/* MAIN TYPE */}
                <Form.Group className="mb-3">
                  <Form.Label>Main Type</Form.Label>
                  <Form.Select
                    value={mainType}
                    onChange={(e) => setMainType(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="shop">Shop</option>
                    <option value="seller">Seller</option>
                    <option value="service">Service</option>
                  </Form.Select>
                </Form.Group>

                {/* ICON */}
                <Form.Group className="mb-3">
                  <Form.Label>Category Icon</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                  />
                  <Form.Text className="text-muted">
                    PNG / JPG • Max 2MB
                  </Form.Text>
                </Form.Group>

                <Button type="submit" className="w-100">
                  Submit
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Categorymanagement;
