import { useState } from "react";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import ImageUploader from "../../components/Admin/ImageUploader";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

function AddNews() {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    author: "",
    category: "",
    published: true,
  });

  async function saveNews(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("news")
      .insert(form);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("News article created!");

    setForm({
      title: "",
      summary: "",
      content: "",
      image: "",
      author: "",
      category: "",
      published: true,
    });
  }

  return (
    <DashboardLayout>

      <h1>Add News</h1>

      <form
        onSubmit={saveNews}
        style={{
          display: "grid",
          gap: 15,
          maxWidth: 800,
        }}
      >
        <ImageUploader
          bucket="news"
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
          placeholder="News Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) =>
            setForm({
              ...form,
              author: e.target.value,
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
          rows={4}
          placeholder="Summary"
          value={form.summary}
          onChange={(e) =>
            setForm({
              ...form,
              summary: e.target.value,
            })
          }
        />

        <textarea
          rows={10}
          placeholder="Full Article"
          value={form.content}
          onChange={(e) =>
            setForm({
              ...form,
              content: e.target.value,
            })
          }
        />

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
          Publish Article
        </button>

      </form>

    </DashboardLayout>
  );
}

export default AddNews;