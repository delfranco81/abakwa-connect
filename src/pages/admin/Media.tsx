import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import ImageUploader from "../../components/Admin/ImageUploader";

function Media() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("places")
      .list("images", {
        limit: 100,
      });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const urls =
      data?.map((file) => {
        return supabase.storage
          .from("places")
          .getPublicUrl(`images/${file.name}`).data.publicUrl;
      }) || [];

    setImages(urls);
    setLoading(false);
  }

  const filteredImages = images.filter((url) =>
    url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <h1>Media Library</h1>
      <ImageUploader
        bucket="places"
        folder="images"
        value=""
        onUpload={() => {
          toast.success("Image uploaded!");
          loadImages();
        }}
      />

      <br />
      <br />

      <input
        placeholder="Search images..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredImages.map((url) => (
            <div
              key={url}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 10,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <img
                  src={url}
                  alt=""
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </div>

              <div>
                <button
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: 8,
                    cursor: "pointer",
                    borderRadius: 6,
                    border: "1px solid #ccc"
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    toast.success("Copied!");
                  }}
                >
                  Copy URL
                </button>

                <button
                  style={{
                    marginTop: 10,
                    width: "100%",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: 10,
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                  onClick={async () => {
                    const confirmDelete = window.confirm(
                      "Are you sure you want to permanently delete this image from storage?"
                    );
                    
                    if (!confirmDelete) return; 

                    const fileName = url.split("/images/");

                    const { error } = await supabase.storage
                      .from("places")
                      .remove([`images/${fileName}`]);

                    if (error) {
                      toast.error(error.message);
                    } else {
                      toast.success("Image deleted");
                      loadImages();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredImages.length === 0 && (
        <p style={{ color: "#666" }}>No images found matching your search.</p>
      )}
    </DashboardLayout>
  );
}

export default Media;