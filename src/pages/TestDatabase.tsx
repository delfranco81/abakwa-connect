import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function TestDatabase() {
  const [result, setResult] = useState("Checking business table...");

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("business")
        .select("*")
        .limit(1);

      if (error) {
        console.error(error);
        setResult(
          `ERROR:\n${error.message}\n\nDETAILS:\n${JSON.stringify(
            error,
            null,
            2
          )}`
        );
        return;
      }

      if (!data || data.length === 0) {
        setResult(
          "The business table exists, but it currently contains no records."
        );
        return;
      }

      const row = data[0];

      const columns = Object.keys(row);

      setResult(
        [
          "BUSINESS TABLE COLUMNS",
          "======================",
          "",
          ...columns.map((column) => {
            const value = row[column];

            return `${column}: ${
              value === null
                ? "null"
                : `${typeof value} (${String(value)})`
            }`;
          }),
          "",
          `TOTAL COLUMNS: ${columns.length}`,
        ].join("\n")
      );
    }

    void test();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7f7",
        padding: 30,
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 16,
          padding: 30,
          boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            color: "#003b36",
          }}
        >
          Business Database Test
        </h1>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#111827",
            color: "#e5e7eb",
            padding: 20,
            borderRadius: 12,
            overflowX: "auto",
            lineHeight: 1.6,
          }}
        >
          {result}
        </pre>
      </div>
    </div>
  );
}

export default TestDatabase;
