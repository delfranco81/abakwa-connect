import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/Admin/DashboardLayout";

function DeletePlace() {
  const { id } = useParams();
  const navigate = useNavigate();

  async function deletePlace() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this place?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("places")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Place deleted!");

    navigate("/admin/places");
  }

  return (
    <DashboardLayout>
      <h1>Delete Place</h1>

      <p>
        This action cannot be undone.
      </p>

      <button
        onClick={deletePlace}
        style={{
          background: "red",
          color: "white",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Delete Place
      </button>
    </DashboardLayout>
  );
}

export default DeletePlace;