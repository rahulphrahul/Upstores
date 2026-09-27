import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { loginUser } from "../service/apiService";
import { APP_LOGO_URL, FALLBACK_IMAGE } from "../config/config";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./LoginPage.css";
function LoginPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <Container fluid className="admin-login-shell">
        <div className="admin-login-layout">
          <section className="admin-login-intro" aria-label="Upstores admin portal">
            <div className="intro-orb intro-orb-one" />
            <div className="intro-orb intro-orb-two" />
            <div className="intro-content">
              <div className="intro-brand">
                <img src={APP_LOGO_URL || FALLBACK_IMAGE} alt="Upstores" />
                <span>Upstores</span>
              </div>
              <div className="intro-copy">
                <span className="intro-eyebrow">UPSTORES ADMIN PORTAL</span>
                <h1>Everything your business needs, <em>in one place.</em></h1>
                <p>Manage merchants, support your executive team, and keep customer operations moving with confidence.</p>
              </div>
              <div className="intro-modules" aria-label="Platform capabilities">
                <span><i className="module-dot merchants" /> Merchant management</span>
                <span><i className="module-dot executives" /> Executive operations</span>
                <span><i className="module-dot customers" /> Customer insights</span>
              </div>
              <div className="intro-footer">A clearer view of your entire Upstores network.</div>
            </div>
          </section>

          <section className="admin-login-main">
            <div className="login-form-wrap">
              <div className="mobile-brand">
                <img src={APP_LOGO_URL || FALLBACK_IMAGE} alt="Upstores" />
                <span>Upstores</span>
              </div>
              <div className="form-heading">
                <span className="form-kicker">WELCOME BACK</span>
                <h2>Sign in to Upstores</h2>
                <p>Access your admin workspace to manage your network.</p>
              </div>

              {error && <Alert variant="danger" className="login-error" role="alert">{error}</Alert>}

              <Form onSubmit={handleSubmit} className="login-form">
                <Form.Group className="login-field">
                  <Form.Label>Username or email</Form.Label>
                  <Form.Control
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="login-field">
                  <Form.Label>Password</Form.Label>
                  <div className="password-control">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </Form.Group>

                <div className="login-options">
                  <Form.Check
                    id="rememberMe"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>

                <Button type="submit" className="login-submit" disabled={isSubmitting} aria-live="polite">
                  {isSubmitting ? (
                    <><span className="login-spinner" aria-hidden="true" /> Signing in…</>
                  ) : (
                    <>Sign in <span className="login-submit-arrow" aria-hidden="true">→</span></>
                  )}
                </Button>
              </Form>

              <div className="login-security"><span className="security-mark">✓</span> Secure access for authorized Upstores team members</div>
            </div>
            <footer className="login-copyright">© {new Date().getFullYear()} Upstores. All rights reserved.</footer>
          </section>
        </div>
      </Container>
    </div>

  );
}

export default LoginPage;
