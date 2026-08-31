import { useState } from "react";

export function useAuthForm() {
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
  };
}