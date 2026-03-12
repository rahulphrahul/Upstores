import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetPassword } from "../service/apiService";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirm) {
    return setError("Passwords do not match");
  }

  try {
    const data = await resetPassword(token, password);

    if (data.status === "success") {
      setMsg("Password updated successfully");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setError(data.message || "Invalid or expired link");
    }

  } catch (err) {
    setError("Server error");
  }
};

  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow" style={{ maxWidth: 440, width: "100%" }}>
        <div className="d-flex justify-content-center mb-3">
          <img
            src="/company-logo.png"
            alt="Company logo"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
          />
        </div>
        <h4 className="text-center mb-3">Reset Password</h4>

        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button className="w-100" type="submit">
            Update
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default ResetPassword;
