import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard title="Login">
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}