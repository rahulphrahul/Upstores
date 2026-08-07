import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../service/apiService";
import ChangePasswordModal from "./ChangePasswordModal";
import { checkEmailExists } from "../service/apiService";
import { APP_LOGO_URL, FALLBACK_IMAGE } from "../config/config";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
function LoginPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
const [firstLogin, setFirstLogin] = useState(false);

  const navigate = useNavigate();
const handleEmailBlur = async () => {
  if (!username) return;

  const res = await checkEmailExists(username);
  if (res.exists && res.force_password_change === 1) {
    setFirstLogin(true);
  } else {
    setFirstLogin(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(username, password);
      if (res.status === "success") {
        setLoggedUser(res.user);
      //   if (res.user.force_password_change === 1) {
      //   setShowChangePassword(true);
      //   return;
      // }
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
        console.log("userssss",res.user);
        
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
                    src={APP_LOGO_URL || FALLBACK_IMAGE}
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
                      onBlur={handleEmailBlur}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <div style={{ position: "relative" }}>
    <Form.Control
      type={showPassword ? "text" : "password"}
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <span
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer"
      }}
    >
      {showPassword ? "👁‍🗨" : "👁"}
    </span>
  </div>
</Form.Group>


                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="switch"  
                      id="rememberMe"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />

                   <Link
  to="/forgot-password"
  className="p-0 text-decoration-none"
>
  Forgot password?
</Link>
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
          {/* {showChangePassword && loggedUser && (
  <ChangePasswordModal
    show={showChangePassword}
    userId={loggedUser.id}
    onSuccess={() => {
      setShowChangePassword(false);

      // Update local user flag
      const updatedUser = {
        ...loggedUser,
        force_password_change: 0,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      //  navigate("/dashboard");
    }}
  />
)} */}
    </div>

  );
}

export default LoginPage;
