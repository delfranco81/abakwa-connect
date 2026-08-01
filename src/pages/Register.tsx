import "../styles/Auth.css";
import { useState } from "react";

function Register() {
  const [role, setRole] = useState("customer");

  return (
    <section className="auth-page">

      <h1>Create Your Account</h1>

      <p>
        Join Abakwa Connect and access trusted local services.
      </p>

      <label>Register As</label>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="customer">
          Customer
        </option>

        <option value="business">
          Business Owner
        </option>
      </select>

      <label>Full Name</label>

      <input
        type="text"
        placeholder="John Doe"
      />

      <label>Phone Number</label>

      <input
        type="tel"
        placeholder="+237..."
      />

      <label>Email</label>

      <input
        type="email"
        placeholder="example@email.com"
      />

      <label>Password</label>

      <input
        type="password"
      />

      <label>Confirm Password</label>

      <input
        type="password"
      />

      <div
        style={{
          marginTop: 20
        }}
      >
        <input type="checkbox" />

        {" "}
        I agree to the Terms &
        Conditions and Privacy Policy.
      </div>

      <button>
        Create Account
      </button>

    </section>
  );
}

export default Register;