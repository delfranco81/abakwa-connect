import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthCard title="Create Account">
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}