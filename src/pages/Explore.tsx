import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import FavoriteButton from "../components/FavoriteButton"; 
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

type Place = {
  id: string;
  title: string;
  content: string;
  image: string;
};

function Explore() {
  const [myFavorites, setMyFavorites] = useState<Place[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  useEffect(() => {
    loadUserPersonalFavorites();
  }, []);

  async function loadUserPersonalFavorites() {
    setLoadingFavorites(true);
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !userData?.user) {
        setUserIsLoggedIn(false);
        setLoadingFavorites(false);
        return;
      }
      
      setUserIsLoggedIn(true);

      // Fetch the places table dataset via a relational junction match query
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          places (
            id,
            title,
            content,
            image
          )
        `)
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Flatten out the relational inner arrays into a simple clean dataset block
      const extractedPlaces = data
        ?.map((row: any) => row.places)
        .filter((place) => place !== null) || [];

      setMyFavorites(extractedPlaces);
    } catch (err: any) {
      console.error("Could not fetch personal favorites list:", err.message);
      // Cleanly triggers your toast notifier using the read error data context
      toast.error(err.message || "Something went wrong loading your saved places.");
    } finally {
      setLoadingFavorites(false);
    }
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        
        {/* ========================================================
            ❤️ PERSONAL FAVORITES GRID
           ======================================================== */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "16px" }}>❤️ My Saved Places</h2>
          
          {!userIsLoggedIn ? (
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", textAlign: "center" }}>
              <p style={{ color: "#666", margin: 0 }}>Please sign in to view and curate your personal favorite places library configuration.</p>
            </div>
          ) : loadingFavorites ? (
            <p>Syncing your saved bookmarks container...</p>
          ) : myFavorites.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>You haven't bookmarked any locations yet! Click the heart icon on any place card to save it here.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
              {myFavorites.map((place) => (
                <div key={place.id} style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
                  
                  {/* Floating Heart Toggle control over image element corner layout wrapper */}
                  <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, background: "rgba(255,255,255,0.85)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <FavoriteButton placeId={place.id} />
                  </div>

                  <img src={place.image || "https://placeholder.com"} alt={place.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                  <div style={{ padding: "14px" }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{place.title}</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {place.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Explore;