interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function DatePicker({
  value,
  onChange,
}: Props) {
  return (
    <div>

      <h3>Booking Date</h3>

      <input
        type="date"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}