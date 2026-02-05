import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/reset_password.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      }
    );

    const data = await res.json();
    if (data.status === "success") {
      setMsg("Password updated successfully");
      setTimeout(() => navigate("/"), 2000);
    } else {
      setError(data.message || "Invalid or expired link");
    }
  };

  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow" style={{ maxWidth: 440, width: "100%" }}>
        <h4 className="text-center mb-3">Reset Password</h4>

        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
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
