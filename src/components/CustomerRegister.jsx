import React, { useState } from "react";
import logo from "../assets/logo.png";
import "./CustomerRegister.css";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 🔹 API integration will go here later
    console.log("Register payload:", form);

    setSuccess("Account created successfully. Please login.");
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
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

            <button type="submit" className="login-btn">
              Create Account
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
