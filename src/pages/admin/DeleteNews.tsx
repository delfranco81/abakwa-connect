import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

type News = {
  id: string;
  title: string;
};

function DeleteNews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const { data } = await supabase
      .from("news")
      .select("id,title")
      .eq("id", id)
      .single();

    if (data) {
      setNews(data);
    }
  }

  async function deleteNews() {
    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("News deleted");
    navigate("/admin/news");
  }

  if (!news)
    return (
      <DashboardLayout>
        Loading...
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <h1>Delete News</h1>

      <p>
        Are you sure you want to delete:
      </p>

      <h2>{news.title}</h2>

      <br />

      <button
        onClick={deleteNews}
        style={{
          background: "red",
          color: "white",
          padding: "10px 20px",
        }}
      >
        Delete
      </button>
    </DashboardLayout>
  );
}

export default DeleteNews;