import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { sendPasswordResetEmail } from "../service/apiService";
import { APP_LOGO_URL, FALLBACK_IMAGE } from "../config/config";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

   try {
  const data = await sendPasswordResetEmail(email);

  if (data.status === "success") {
    setMsg("Password reset link sent to your email.");
    setError("");
  } else {
    setError(data.message || "Email not found");
  }
} catch (err) {
  setError("Server error. Try again later.");
} finally {
  setLoading(false);
}
  };

  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center">
      <Card className="p-4 shadow" style={{ maxWidth: 420, width: "100%" }}>
         <div className="d-flex justify-content-center mb-3">
          <img
             src={APP_LOGO_URL || FALLBACK_IMAGE}
            alt="Company logo"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
          />
        </div>
        <h4 className="text-center mb-2">Forgot Password</h4>
        <p className="text-muted text-center">
          Enter your registered email
        </p>

        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </Form.Group>

          <Button className="w-full w-100" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default ForgotPassword;
