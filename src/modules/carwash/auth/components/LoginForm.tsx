import { useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth/AuthProvider";

import { useAuthForm } from "../hooks/useAuthForm";

export default function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    email,
    password,
    setEmail,
    setPassword,
  } = useAuthForm();

  async function handleLogin() {
    try {
      await login(email, password);

      navigate("/business-dashboard");
    } catch {
      alert("Invalid credentials");
    }
  }

  return (
    <>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: 14,
        }}
      >
        Login
      </button>
    </>
  );
}
