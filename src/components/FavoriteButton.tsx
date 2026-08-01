import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

interface FavoriteButtonProps {
  placeId: string;
}

export default function FavoriteButton({ placeId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [placeId]);

  async function checkFavoriteStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }

      // Query if a link row exists matching the specific user and place
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("place_id", placeId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (err) {
      console.error("Error reading favorite relationship:", err);
    } finally {
      setChecking(false);
    }
  }

  async function handleToggle() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Guard Clause: block anonymous public sessions
      if (!user) {
        toast.warning("Please sign in or register to bookmark favorite places!");
        return;
      }

      if (isFavorited) {
        // Remove bookmark record
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", placeId);

        if (error) throw error;
        setIsFavorited(false);
        toast.info("Removed from your saved items list.");
      } else {
        // Add new bookmark record
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, place_id: placeId }]);

        if (error) throw error;
        setIsFavorited(true);
        toast.success("Added to your favorites list! ❤️");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update favorite status.");
    }
  }

  if (checking) return <span style={{ fontSize: "14px", color: "#aaa" }}>...</span>;

  return (
    <button
      type="button"
      onClick={handleToggle}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        padding: "4px",
        lineHeight: 1,
        transition: "transform 0.1s ease",
      }}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isFavorited ? "❤️" : "🤍"}
    </button>
  );
}