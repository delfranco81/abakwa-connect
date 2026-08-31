import { useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth/AuthProvider";

import { useAuthForm } from "../hooks/useAuthForm";

export default function RegisterForm() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const {
    email,
    password,
    fullName,
    setEmail,
    setPassword,
    setFullName,
  } = useAuthForm();

  async function handleRegister() {
    try {
      await register(
        email,
        password,
        fullName
      );

      alert("Account created.");

      navigate("/login");
    } catch {
      alert("Registration failed.");
    }
  }

  return (
    <>
      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) =>
          setFullName(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
        }}
      />

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
        onClick={handleRegister}
        style={{
          width: "100%",
          padding: 14,
        }}
      >
        Create Account
      </button>
    </>
  );
}