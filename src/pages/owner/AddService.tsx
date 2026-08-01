import { useState } from "react";

export default function AddService() {
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const saveService = () => {
    alert("Service saving will be connected to Supabase next.");
  };

  return (
    <div>
      <h1>Add New Service</h1>

      <div
        style={{
          display: "grid",
          gap: 20,
          maxWidth: 600,
          marginTop: 30,
        }}
      >
        <input
          placeholder="Service name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <button onClick={saveService}>
          Save Service
        </button>
      </div>
    </div>
  );
}