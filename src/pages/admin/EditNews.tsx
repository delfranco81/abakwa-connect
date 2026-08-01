import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import ImageUploader from "../../components/Admin/ImageUploader";

function EditNews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (!id) {
      toast.error("Invalid news ID");
      navigate("/admin/news");
      return;
    }
    loadNews();
  }, [id]);

  async function loadNews() {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setImage(data.image ?? "");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load news article");
      navigate("/admin/news");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content fields are required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("news")
        .update({
          title: title.trim(),
          content: content.trim(),
          image,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("News updated successfully");
      navigate("/admin/news");
    } catch (error: any) {
      toast.error(error.message || "Failed to update news");
    } finally {
      setSaving(false);
    }
  }
  function renderMarkdown(text: string) {
    if (!text) return <p style={{ color: "#aaa", fontStyle: "italic" }}>No content typed yet...</p>;
    
    return text.split("\n").map((paragraph, index) => {
      if (paragraph.startsWith("### ")) {
        return <h3 key={index} style={{ margin: "10px 0" }}>{paragraph.replace("### ", "")}</h3>;
      }
      if (paragraph.startsWith("## ")) {
        return <h2 key={index} style={{ margin: "14px 0" }}>{paragraph.replace("## ", "")}</h2>;
      }
      if (paragraph.startsWith("# ")) {
        return <h1 key={index} style={{ margin: "18px 0" }}>{paragraph.replace("# ", "")}</h1>;
      }
      if (paragraph.includes("**")) {
        const parts = paragraph.split("**");
        return (
          <p key={index} style={{ lineHeight: "1.6", margin: "8px 0" }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
      return <p key={index} style={{ lineHeight: "1.6", margin: "8px 0", minHeight: "1em" }}>{paragraph}</p>;
    });
  }

  if (loading) {
    return <DashboardLayout><p style={{ padding: "20px" }}>Loading article data...</p></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "600px", padding: "20px" }}>
        <h1 style={{ marginBottom: "24px" }}>Edit News</h1>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontWeight: "600", fontSize: "14px" }}>Article Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "600", fontSize: "14px" }}>Content</label>
              
              <div style={{ display: "inline-flex", background: "#f3f4f6", padding: "4px", borderRadius: "6px" }}>
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  style={{
                    padding: "4px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: viewMode === "edit" ? "#fff" : "transparent",
                    boxShadow: viewMode === "edit" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  style={{
                    padding: "4px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: viewMode === "preview" ? "#fff" : "transparent",
                    boxShadow: viewMode === "preview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            {viewMode === "edit" ? (
              <textarea
                rows={10}
                placeholder="Enter article text body... (Supports # headers and **bold** text)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
                required
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  minHeight: "212px", 
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: "#fafafa",
                  boxSizing: "border-box",
                  overflowY: "auto"
                }}
              >
                {renderMarkdown(content)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontWeight: "600", fontSize: "14px" }}>Featured Image</label>
            <ImageUploader
              bucket="places"
              folder="images"
              value={image}
              onUpload={(url) => {
                setImage(url);
                toast.success("New image uploaded!");
              }}
            />
            {image && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Current Preview:</p>
                <img 
                  src={image} 
                  alt="Preview" 
                  style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ddd" }} 
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 24px",
                background: saving ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate("/admin/news")}
              style={{
                padding: "12px 24px",
                background: "#f3f4f6",
                color: "#1f2937",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}

export default EditNews;