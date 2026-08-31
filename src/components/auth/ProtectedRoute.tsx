import { Navigate } from "react-router-dom";
import ECOS from "../../sdk";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  if (!ECOS.identity.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}