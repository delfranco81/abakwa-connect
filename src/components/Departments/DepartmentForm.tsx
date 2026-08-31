import { useState } from "react";

interface Props {
  onSubmit: (department: {
    name: string;
    description: string;
    color: string;
  }) => void;
}

export default function DepartmentForm({
  onSubmit,
}: Props) {
  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [color, setColor] =
    useState("#2563eb");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit({
          name,
          description,
          color,
        });
      }}
    >
      <input
        placeholder="Department Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="color"
        value={color}
        onChange={(e) =>
          setColor(e.target.value)
        }
      />

      <button>Create</button>
    </form>
  );
}