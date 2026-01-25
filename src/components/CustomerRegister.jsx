import React, { useState } from "react";
import logo from "../assets/logo.png";
import "./CustomerRegister.css";
import { registerCustomer } from "../service/apiService";

function CustomerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Frontend validations
    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await registerCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (res.success) {
        setSuccess("Account created successfully. Please login.");
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT BRAND SECTION */}
      <div className="login-left">
        <h1>Create Account</h1>
        <p>
          Join our platform to discover nearby shops, earn rewards, and track
          your purchases easily.
        </p>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="login-right">
        <div className="login-box">
          {/* LOGO */}
          <div className="logo-container">
            <img src={logo} alt="Company Logo" />
          </div>

          <h2>Customer Registration</h2>
          <p className="sub-text">Fill in the details to get started</p>

          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* FULL NAME */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PHONE */}
            <div className="input-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your mobile number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="bottom-text">
            Already have an account?{" "}
            <span className="link-text">Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister;
