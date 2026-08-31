import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  businessId: string;
};

type GalleryImage = {
  id: string | number;
  image_url: string;
  uploaded_by?: string | null;
  caption?: string | null;
  created_at?: string | null;
};

export default function BusinessGallery({
  businessId,
}: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    loadUser();
    loadGallery();
  }, [businessId]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function loadGallery() {
    const { data, error } = await supabase
      .from("business_gallery")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Unable to load business gallery:",
        error
      );

      setImages([]);
      return;
    }

    setImages((data || []) as GalleryImage[]);
  }

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.length || !user) {
      return;
    }

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image must be smaller than 10 MB.");
      return;
    }

    setUploading(true);

    try {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-");

      const filename =
        `${businessId}/${Date.now()}-${safeName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("business-gallery")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("business-gallery")
        .getPublicUrl(filename);

      const { error: databaseError } =
        await supabase
          .from("business_gallery")
          .insert({
            business_id: businessId,
            image_url: publicUrl,
            uploaded_by: user.id,
          });

      if (databaseError) {
        throw databaseError;
      }

      await loadGallery();

      e.target.value = "";
    } catch (error: any) {
      console.error(
        "Gallery upload failed:",
        error
      );

      alert(
        error?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(
    image: GalleryImage
  ) {
    if (!confirm("Delete this image?")) {
      return;
    }

    const { error } = await supabase
      .from("business_gallery")
      .delete()
      .eq("id", image.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadGallery();
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
            padding: 15,
            background: "#f8fafc",
            borderRadius: 10,
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
          />

          {uploading && (
            <p>
              Uploading image...
            </p>
          )}
        </div>
      )}

      {!images.length && (
        <div
          style={{
            background: "#fafafa",
            padding: 40,
            borderRadius: 10,
            textAlign: "center",
            color: "#64748b",
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
          marginTop: 20,
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
              alt={
                image.caption ||
                "Business gallery"
              }
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />

            {image.caption && (
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                {image.caption}
              </p>
            )}

            {user?.id === image.uploaded_by && (
              <button
                type="button"
                onClick={() =>
                  deleteImage(image)
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
