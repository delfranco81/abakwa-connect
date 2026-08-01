import "../styles/Auth.css";
function Login() {
  return (
    <section className="auth-page">

      <h1>Welcome Back</h1>

      <p>
        Login to your Abakwa Connect account.
      </p>

      <label>Email or Phone</label>

      <input
        type="text"
      />

      <label>Password</label>

      <input
        type="password"
      />

      <button>
        Login
      </button>

    </section>
  );
}

export default Login;