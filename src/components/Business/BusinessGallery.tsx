import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  placeId: string;
};

type GalleryImage = {
  id: string;
  image_url: string;
  uploaded_by: string;
};

export default function BusinessGallery({
  placeId,
}: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
    loadGallery();
  }, [placeId]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function loadGallery() {
    const { data } = await supabase
      .from("business_gallery")
      .select("*")
      .eq("place_id", placeId)
      .order("created_at", {
        ascending: false,
      });

    setImages(data || []);
  }

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.length || !user) return;

    const file = e.target.files[0];

    setUploading(true);

    const filename =
      `${Date.now()}-${file.name}`;

    const { error: uploadError } =
      await supabase.storage
        .from("business-gallery")
        .upload(filename, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("business-gallery")
      .getPublicUrl(filename);

    await supabase
      .from("business_gallery")
      .insert({
        place_id: placeId,
        image_url: publicUrl,
        uploaded_by: user.id,
      });

    await loadGallery();

    setUploading(false);
  }

  async function deleteImage(id: string) {
    if (!confirm("Delete this image?")) return;

    await supabase
      .from("business_gallery")
      .delete()
      .eq("id", id);

    loadGallery();
  }

  return (
    <section
      style={{
        marginTop: 40,
      }}
    >
      <h2>📷 Business Gallery</h2>

      {user && (
        <div
          style={{
            margin: "20px 0",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
          />

          {uploading && (
            <p>Uploading...</p>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div
          style={{
            background: "#fafafa",
            padding: 40,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          No photos uploaded yet.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: 15,
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            style={{
              position: "relative",
            }}
          >
            <img
              src={image.image_url}
              alt=""
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 10,
              }}
            />

            {user?.id === image.uploaded_by && (
              <button
                onClick={() =>
                  deleteImage(image.id)
                }
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}