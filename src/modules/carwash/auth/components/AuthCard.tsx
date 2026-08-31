import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function AuthCard({
  title,
  children,
}: Props) {
  return (
    <div
      style={{
        width: 420,
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 10px 35px rgba(0,0,0,.08)",
      }}
    >
      <h2
        style={{
          marginBottom: 25,
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}