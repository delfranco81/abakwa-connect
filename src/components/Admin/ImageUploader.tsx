import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "../../lib/supabase";

type Props = {
  bucket: string;
  folder?: string;
  value?: string;
  onUpload: (url: string) => void;
};

export default function ImageUploader({
  bucket,
  folder = "",
  value,
  onUpload,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function upload(file: File) {
    try {
      setUploading(true);

      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
      });

      const filename =
        Date.now() + "-" + compressed.name.replace(/\s/g, "-");

      const path =
        folder === ""
          ? filename
          : `${folder}/${filename}`;
const { data: uploadData, error } = await supabase.storage
  .from(bucket)
  .upload(path, compressed);

console.log("UPLOAD DATA:", uploadData);
console.log("UPLOAD ERROR:", error);

if (error) {
  console.log(error);
  console.log(JSON.stringify(error, null, 2));
  alert(error.message);
  return;
}

setProgress(100);

const { data } = supabase.storage
  .from(bucket)
  .getPublicUrl(path);
      onUpload(data.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    upload(file);
  }

  return (
    <div
      style={{
        border: "2px dashed #ccc",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
      />

      {uploading && (
        <p>Uploading... {progress}%</p>
      )}

      {value && (
        <img
          src={value}
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 350,
            borderRadius: 10,
          }}
        />
      )}
    </div>
  );
}