import { useState } from "react";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import ImageUploader from "../../components/Admin/ImageUploader";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

function AddEvent() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    venue: "",
    address: "",
    city: "Bamenda",

    event_date: "",
    start_time: "",
    end_time: "",

    organizer: "",
    phone: "",
    email: "",
    website: "",

    ticket_price: "",

    latitude: "",
    longitude: "",

    featured: false,
    published: true,
  });

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();

    const eventData = {
      ...form,
      ticket_price:
        form.ticket_price === ""
          ? null
          : Number(form.ticket_price),

      latitude:
        form.latitude === ""
          ? null
          : Number(form.latitude),

      longitude:
        form.longitude === ""
          ? null
          : Number(form.longitude),
    };

    const { error } = await supabase
      .from("events")
      .insert(eventData);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Event added successfully!");

    setForm({
      title: "",
      category: "",
      description: "",
      image: "",
      venue: "",
      address: "",
      city: "Bamenda",

      event_date: "",
      start_time: "",
      end_time: "",

      organizer: "",
      phone: "",
      email: "",
      website: "",

      ticket_price: "",

      latitude: "",
      longitude: "",

      featured: false,
      published: true,
    });
  }

  return (
    <DashboardLayout>

      <h1>Add Event</h1>

      <form
        onSubmit={saveEvent}
        style={{
          display: "grid",
          gap: 15,
          maxWidth: 700,
        }}
      >
        <ImageUploader
          bucket="events"
          folder="images"
          value={form.image}
          onUpload={(url) =>
            setForm({
              ...form,
              image: url,
            })
          }
        />

        <input
          placeholder="Event Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Venue"
          value={form.venue}
          onChange={(e) =>
            setForm({
              ...form,
              venue: e.target.value,
            })
          }
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            setForm({
              ...form,
              city: e.target.value,
            })
          }
        />

        <label>Event Date</label>

        <input
          type="date"
          value={form.event_date}
          onChange={(e) =>
            setForm({
              ...form,
              event_date: e.target.value,
            })
          }
        />

        <label>Start Time</label>

        <input
          type="time"
          value={form.start_time}
          onChange={(e) =>
            setForm({
              ...form,
              start_time: e.target.value,
            })
          }
        />

        <label>End Time</label>

        <input
          type="time"
          value={form.end_time}
          onChange={(e) =>
            setForm({
              ...form,
              end_time: e.target.value,
            })
          }
        />

        <input
          placeholder="Organizer"
          value={form.organizer}
          onChange={(e) =>
            setForm({
              ...form,
              organizer: e.target.value,
            })
          }
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          placeholder="Website"
          value={form.website}
          onChange={(e) =>
            setForm({
              ...form,
              website: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Ticket Price"
          value={form.ticket_price}
          onChange={(e) =>
            setForm({
              ...form,
              ticket_price: e.target.value,
            })
          }
        />

        <input
          placeholder="Latitude"
          value={form.latitude}
          onChange={(e) =>
            setForm({
              ...form,
              latitude: e.target.value,
            })
          }
        />

        <input
          placeholder="Longitude"
          value={form.longitude}
          onChange={(e) =>
            setForm({
              ...form,
              longitude: e.target.value,
            })
          }
        />

        <label>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm({
                ...form,
                featured: e.target.checked,
              })
            }
          />

          Featured Event
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm({
                ...form,
                published: e.target.checked,
              })
            }
          />

          Published
        </label>

        <button type="submit">
          Save Event
        </button>

      </form>

    </DashboardLayout>
  );
}

export default AddEvent;