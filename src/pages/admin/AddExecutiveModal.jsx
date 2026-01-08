import React, { useState } from "react";
import { createExecutive } from "../../service/apiService";

function AddExecutiveModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
  });

  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    const res = await createExecutive(form);
    setLoading(false);

    if (res.status === "success") {
      setCredentials(res);
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Executive</h3>

        {!credentials ? (
          <>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading}
              >
                Create
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="credentials-box">
              <p><strong>Username:</strong> {credentials.username}</p>
              <p><strong>Password:</strong> {credentials.password}</p>
              <small>
                ⚠ Share this securely. Password will not be shown again.
              </small>
            </div>

            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AddExecutiveModal;
