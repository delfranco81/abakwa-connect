import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/core/auth";

export default function Register() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register(
        email.trim(),
        password,
        fullName.trim()
      );

      setSuccess(
        "Account created successfully. Please check your email and confirm your email address before logging in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to create your account. Please try again."
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
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: 30,
          }}
        >
          Create your Fast Car Wash account to book
          and manage your car washes.
        </p>

        <form onSubmit={handleRegister}>
          {/* FULL NAME */}

          <label
            style={{
              display: "block",
              marginBottom: 8,
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            placeholder="Enter your full name"
            autoComplete="name"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          />

          {/* EMAIL */}

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

          {/* PASSWORD */}

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
              autoComplete="new-password"
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                paddingRight: 60,
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
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform:
                  "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                padding: 8,
              }}
            >
              {showPassword ? "ðŸ™ˆ" : "ðŸ‘ï¸"}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}

          <label
            style={{
              display: "block",
              marginBottom: 8,
            }}
          >
            Confirm Password
          </label>

          <div
            style={{
              position: "relative",
              marginBottom: 20,
            }}
          >
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                paddingRight: 60,
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              disabled={loading}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              title={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform:
                  "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 20,
                padding: 8,
              }}
            >
              {showConfirmPassword
                ? "ðŸ™ˆ"
                : "ðŸ‘ï¸"}
            </button>
          </div>

          {/* ERROR */}

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

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                borderRadius: 8,
                background: "#173a20",
                color: "#8dffab",
              }}
            >
              {success}
            </div>
          )}

          {/* SUBMIT */}

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
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 25,
            color: "#aaa",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#2d7ff9",
            }}
          >
            Log in
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