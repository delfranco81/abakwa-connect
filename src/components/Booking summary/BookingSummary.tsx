type Props = {
  category: string;
  item: string;
  area: string;
 landmark: string;
};

function BookingSummary({
  category,
  item,
  area,
  landmark,
}: Props) {
  return (
    <div className="summary">

      <h3>Booking Summary</h3>

      <p><strong>Category:</strong> {category || "-"}</p>

      <p><strong>Item:</strong> {item || "-"}</p>

      <p><strong>Area:</strong> {area || "-"}</p>

      <p><strong>Landmark:</strong> {landmark || "-"}</p>

    </div>
  );
}

export default BookingSummary;