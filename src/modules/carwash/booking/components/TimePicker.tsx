interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function TimePicker({
  value,
  onChange,
}: Props) {
  return (
    <div>

      <h3>Preferred Time</h3>

      <input
        type="time"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}