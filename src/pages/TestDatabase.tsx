import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function TestDatabase() {
  const [result, setResult] = useState("");

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("business")
        .select("*");

      if (error) {
        console.error(error);
        setResult(error.message);
      } else {
        console.log(data);
        setResult(JSON.stringify(data, null, 2));
      }
    }

    test();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Testing Supabase</h1>
      <pre>{result}</pre>
    </div>
  );
}

export default TestDatabase;