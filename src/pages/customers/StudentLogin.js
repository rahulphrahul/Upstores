import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await axios.post("/api/student_login.php", {
      email,
      password
    });

    if (res.data.status === "success") {
      localStorage.setItem("student", JSON.stringify(res.data.student));
      window.location.href = "/student/dashboard";
    } else {
      toast.success(res.data.message);
    }
  };

  return (
    <div className="login-wrapper">
      <h2>Student Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
