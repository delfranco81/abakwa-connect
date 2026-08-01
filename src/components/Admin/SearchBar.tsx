type Props = {
  value: string;
  onChange: (value: string) => void;
};

function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="🔍 Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: 14,
        borderRadius: 10,
        border: "1px solid #ddd",
        marginBottom: 20,
      }}
    />
  );
}

export default SearchBar;