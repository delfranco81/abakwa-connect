type Props = {
  active: boolean;
};

function StatusBadge({
  active,
}: Props) {
  return (
    <span
      style={{
        background: active ? "#16a34a" : "#9ca3af",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {active ? "Featured" : "Normal"}
    </span>
  );
}

export default StatusBadge;