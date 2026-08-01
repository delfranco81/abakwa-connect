import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

function DeleteEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    deleteEvent();
  }, []);

  async function deleteEvent() {
    const confirmed = window.confirm(
      "Delete this event permanently?"
    );

    if (!confirmed) {
      navigate("/admin/events");
      return;
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      navigate("/admin/events");
      return;
    }

    toast.success("Event deleted");

    navigate("/admin/events");
  }

  return (
    <DashboardLayout>
      <h2>Deleting event...</h2>
    </DashboardLayout>
  );
}

export default DeleteEvent;