type Props = {
  title: string;
  value: string | number;
  color: string;
};

function StatCard({
  title,
  value,
  color,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        borderTop: `5px solid ${color}`,
        boxShadow: "0 5px 20px rgba(0,0,0,.08)",
      }}
    >
      <p
        style={{
          color: "#777",
          marginBottom: 8,
        }}
      >
        {title}
      </p>

      <h2>{value}</h2>
    </div>
  );
}

export default StatCard;