import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  start_date: string;
  end_date: string;
};

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Event>({
    id: "",
    title: "",
    description: "",
    location: "",
    image: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadEvent();
  }, []);

  async function loadEvent() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setForm(data);
    setLoading(false);
  }

  async function saveEvent() {
    const { error } = await supabase
      .from("events")
      .update({
        title: form.title,
        description: form.description,
        location: form.location,
        image: form.image,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Event updated");

    navigate("/admin/events");
  }

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>

      <h1>Edit Event</h1>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <br /><br />

      <textarea
        rows={5}
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) =>
          setForm({ ...form, location: e.target.value })
        }
      />

      <br /><br />

      <input
        placeholder="Image URL"
        value={form.image}
        onChange={(e) =>
          setForm({ ...form, image: e.target.value })
        }
      />

      <br /><br />

      <input
        type="date"
        value={form.start_date}
        onChange={(e) =>
          setForm({ ...form, start_date: e.target.value })
        }
      />

      <br /><br />

      <input
        type="date"
        value={form.end_date}
        onChange={(e) =>
          setForm({ ...form, end_date: e.target.value })
        }
      />

      <br /><br />

      <button onClick={saveEvent}>
        Save Changes
      </button>

    </DashboardLayout>
  );
}

export default EditEvent;