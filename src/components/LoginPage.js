import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../service/apiService";
import logo from "../assets/logo.png";

function LoginPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(username, password);
      if (res.status === "success") {
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="admin-login-bg">
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col xs={11} sm={8} md={6} lg={4}>
            <Card className="shadow-lg border-0 admin-login-card">
              <Card.Body className="p-4 p-md-5">

                {/* Logo */}
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Company Logo"
                    height="55"
                    className="mb-3"
                  />
                  <h4 className="fw-bold">Admin Login</h4>
                  <p className="text-muted mb-0">
                    Sign in to access the admin dashboard
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="switch"  
                      id="rememberMe"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />

                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2"
                  >
                    Login
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">New here?</span>{" "}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Create Account
                  </Button>
                </div>

              </Card.Body>
            </Card>

            <p className="text-center text-muted mt-3 small">
              © {new Date().getFullYear()} Semicolon Innovations. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
