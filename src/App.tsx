import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/core/auth";

import Navbar from "./components/Navbar/Navbar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
