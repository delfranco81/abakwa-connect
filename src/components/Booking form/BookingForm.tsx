import "./BookingForm.css";
import { useState } from "react";
import { cleaningCategories } from "../../data/services";
import { locations } from "../../data/locations";
import BookingSummary from "../Booking summary/BookingSummary";

function BookingForm() {
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const selectedCategory = cleaningCategories.find(
    (c) => c.title === category
  );

  const selectedArea = locations.find(
    (l) => l.area === area
  );

  return (
    <section className="booking">
      <h2>Book a Cleaning Service</h2>

      <label>Cleaning Category</label>
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setItem("");
        }}
      >
        <option value="">Select Category</option>

        {cleaningCategories.map((cat) => (
          <option key={cat.title} value={cat.title}>
            {cat.title}
          </option>
        ))}
      </select>

      <label>What needs cleaning?</label>
      <select
        value={item}
        onChange={(e) => setItem(e.target.value)}
      >
        <option value="">Select Item</option>

        {selectedCategory?.items.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}

        <option value="Other">Other</option>
      </select>

      <label>Area</label>
      <select
        value={area}
        onChange={(e) => {
          setArea(e.target.value);
          setLandmark("");
        }}
      >
        <option value="">Select Area</option>

        {locations.map((loc) => (
          <option key={loc.area} value={loc.area}>
            {loc.area}
          </option>
        ))}
      </select>

      <label>Nearest Landmark</label>
      <select
        value={landmark}
        onChange={(e) => setLandmark(e.target.value)}
      >
        <option value="">Select Landmark</option>

        {selectedArea?.places.map((place) => (
          <option key={place} value={place}>
            {place}
          </option>
        ))}
      </select>

      <label>Preferred Date</label>
      <input type="date" />

      <label>Preferred Time</label>
      <input type="time" />

      <label>Street (Optional)</label>
      <input
        type="text"
        placeholder="Example: Foncha Street"
      />

      <label>House / Building (Optional)</label>
      <input
        type="text"
        placeholder="Blue Gate opposite City Chemist"
      />

      <label>Describe Your Cleaning Request</label>
      <textarea
        rows={5}
        placeholder="Tell us exactly what needs cleaning..."
      />

      <label>Upload Photos (Optional)</label>
      <input type="file" multiple />

      <BookingSummary
        category={category}
        item={item}
        area={area}
        landmark={landmark}
      />

      <button type="submit">
        Submit Booking
      </button>
    </section>
  );
}

export default BookingForm;