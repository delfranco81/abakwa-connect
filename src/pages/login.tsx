import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      navigate("/business-dashboard");
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "";

      if (
        message
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        setError(
          "Your email has not been confirmed yet. Please check your email and click the confirmation link before logging in."
        );
      } else if (
        message
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
        setError(
          "Invalid email or password. If you just created your account, make sure you have confirmed your email first."
        );
      } else {
        setError(
          message ||
            "Unable to log in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "#111217",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: 30,
          }}
        >
          Log in to your Fast Car Wash account.
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: 8,
            }}
          >
            Password
          </label>

          <div
            style={{
              position: "relative",
              marginBottom: 20,
            }}
          >
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                paddingRight: 70,
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              disabled={loading}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform:
                  "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#333",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                borderRadius: 8,
                background: "#3a1717",
                color: "#ff8d8d",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 15,
              border: "none",
              borderRadius: 8,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              background: "#2d7ff9",
              color: "#fff",
              fontSize: 16,
            }}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 25,
            color: "#aaa",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#2d7ff9",
            }}
          >
            Create an account
          </Link>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: 15,
          }}
        >
          <Link
            to="/"
            style={{
              color: "#aaa",
            }}
          >
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
