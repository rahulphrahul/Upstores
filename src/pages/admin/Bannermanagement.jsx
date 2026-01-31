import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { createBanner } from "../../service/apiService";

const BannerManagement = () => {
  const [form, setForm] = useState({
    title: "",
    text: "",
    button_text: "",
    gradient_start: "#000000",
    gradient_end: "#ffffff",
    position: "",
  });

  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 2MB");
      return;
    }

    setImage(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.position || !image) {
      setError("Title, position and image are required");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") fd.append(key, value);
    });
    fd.append("image", image);

    const res = await createBanner(fd);

    if (res.status === "success") {
      setSuccess("Banner created successfully");
      setForm({
        title: "",
        text: "",
        button_text: "",
        gradient_start: "#000000",
        gradient_end: "#ffffff",
        position: "",
      });
      setImage(null);
    } else {
      setError(res.message || "Failed to create banner");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Add Banner</h5>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Button Text</Form.Label>
                  <Form.Control
                    name="button_text"
                    value={form.button_text}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Gradient Start</Form.Label>
                      <Form.Control
                        type="color"
                        name="gradient_start"
                        value={form.gradient_start}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Gradient End</Form.Label>
                      <Form.Control
                        type="color"
                        name="gradient_end"
                        value={form.gradient_end}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                  >
                    <option value="">Select Position</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Banner Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Form.Text muted>Max 2MB</Form.Text>
                </Form.Group>

                <Button type="submit" className="w-100">
                  Save Banner
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BannerManagement;
