import type { Booking } from "../types/Booking";

interface Props {
  value: Booking["vehicleType"];
  onChange: (value: Booking["vehicleType"]) => void;
}
const vehicles: Booking["vehicleType"][] = [
  "",
  "sedan",
  "suv",
  "truck",
  "motorcycle",
];

export default function VehicleSelector({
  value,
  onChange,
}: Props) {
  return (
    <div>

      <h3>Vehicle Type</h3>

      <select
  value={value}
  onChange={(e) =>
    onChange(e.target.value as Booking["vehicleType"])
  }
>
  <option value="">Select Vehicle</option>

  {vehicles
    .filter(v => v !== "")
    .map(vehicle => (
      <option key={vehicle} value={vehicle}>
        {vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}
      </option>
    ))}
</select>
    </div>
  );
}