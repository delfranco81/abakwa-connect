import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";

import { useAuth } from "../core/auth";

import { supabase } from "../core/database/supabase";

interface Business {
  id: string;
  name: string;
  category: string | null;
  cover_image: string | null;
}

function Profile() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const navigate = useNavigate();

  const [fullName, setFullName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [
    businessLoading,
    setBusinessLoading,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * LOAD PROFILE DATA
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const metadata =
      user.user_metadata || {};

    setFullName(
      typeof metadata.full_name ===
        "string"
        ? metadata.full_name
        : ""
    );

    setUsername(
      typeof metadata.username ===
        "string"
        ? metadata.username
        : ""
    );

    setPhone(
      typeof metadata.phone ===
        "string"
        ? metadata.phone
        : ""
    );

    setAvatarUrl(
      typeof metadata.avatar_url ===
        "string"
        ? metadata.avatar_url
        : ""
    );

    loadBusinesses(user.id);
  }, [user]);

  /*
   * LOAD BUSINESSES OWNED BY USER
   */
  async function loadBusinesses(
    userId: string
  ) {
    try {
      setBusinessLoading(true);

      const {
        data,
        error: databaseError,
      } = await supabase
        .from("business")
        .select(
          "id,name,category,cover_image"
        )
        .eq("owner_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (databaseError) {
        console.error(
          "Profile business loading error:",
          databaseError
        );

        setBusinesses([]);
        return;
      }

      setBusinesses(
        (data ?? []) as Business[]
      );
    } catch (err) {
      console.error(
        "Business loading error:",
        err
      );

      setBusinesses([]);
    } finally {
      setBusinessLoading(false);
    }
  }

  /*
   * SAVE PROFILE
   */
  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setMessage("");
    setError("");

    if (!user) {
      setError(
        "You must be signed in to update your profile."
      );
      return;
    }

    if (!fullName.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        full_name:
          fullName.trim(),

        username:
          username.trim(),

        phone:
          phone.trim(),

        avatar_url:
          avatarUrl,
      });

      /*
       * Tell the user clearly that
       * Supabase has accepted the changes.
       */
      setMessage(
        "Changes saved successfully."
      );

      /*
       * Keep the success state visible
       * briefly before returning home.
       */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500
          )
      );

      /*
       * Return the user to the
       * Everyday Connect home page.
       */
      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );

      setSaving(false);
    }
  }

  /*
   * UPLOAD PROFILE PICTURE
   */
  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Profile pictures must be 5MB or smaller."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `profiles/${user.id}/avatar.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("business-images")
        .upload(
          filePath,
          file,
          {
            upsert: true,
            contentType:
              file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data,
      } = supabase.storage
        .from("business-images")
        .getPublicUrl(
          filePath
        );

      const publicUrl =
        `${data.publicUrl}?v=${Date.now()}`;

      await updateProfile({
        avatar_url:
          publicUrl,
      });

      setAvatarUrl(publicUrl);

      setMessage(
        "Your profile picture has been updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile picture upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload your profile picture."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  /*
   * USER DISPLAY INFORMATION
   */
  const displayName =
    fullName.trim() ||
    username.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("") || "U";

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight:
            "calc(100vh - 82px)",
          background:
            "#f5f7f7",
          padding:
            "40px 20px 80px",
          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            maxWidth:
              "1100px",
            margin:
              "0 auto",
          }}
        >
          {/* PAGE HEADER */}

          <section
            style={{
              background:
                "linear-gradient(135deg,#003b36,#00695c)",
              color:
                "white",
              borderRadius:
                "20px",
              padding:
                "32px",
              marginBottom:
                "24px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.10)",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 8px",
                color:
                  "#9de8df",
                fontSize:
                  "13px",
                fontWeight:
                  800,
                letterSpacing:
                  "1.5px",
                textTransform:
                  "uppercase",
              }}
            >
              Everyday Connect
            </p>

            <h1
              style={{
                margin:
                  "0 0 8px",
                fontSize:
                  "clamp(30px,5vw,44px)",
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                margin:
                  0,
                color:
                  "rgba(255,255,255,0.85)",
                lineHeight:
                  1.6,
              }}
            >
              Manage your personal
              information and account.
            </p>
          </section>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              style={{
                marginBottom:
                  "20px",
                padding:
                  "15px 18px",
                borderRadius:
                  "10px",
                background:
                  "#e8f7ef",
                color:
                  "#176b3a",
                border:
                  "1px solid #b9e4ca",
                fontWeight:
                  700,
              }}
            >
              ✓ {message}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div
              style={{
                marginBottom:
                  "20px",
                padding:
                  "15px 18px",
                borderRadius:
                  "10px",
                background:
                  "#fff0f0",
                color:
                  "#b42318",
                border:
                  "1px solid #f3c1c1",
                fontWeight:
                  600,
              }}
            >
              {error}
            </div>
          )}

          {/* PROFILE GRID */}

          <div
            className="profile-grid"
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "minmax(0,1fr) 340px",
              gap:
                "24px",
              alignItems:
                "start",
            }}
          >
            {/* PERSONAL INFORMATION */}

            <section
              style={{
                background:
                  "white",
                borderRadius:
                  "18px",
                padding:
                  "28px",
                border:
                  "1px solid #e5e7eb",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 6px",
                  color:
                    "#172033",
                }}
              >
                Personal Information
              </h2>

              <p
                style={{
                  margin:
                    "0 0 25px",
                  color:
                    "#667085",
                  fontSize:
                    "14px",
                }}
              >
                Update your information
                whenever you need to.
              </p>

              <form
                onSubmit={
                  handleSave
                }
              >
                <label
                  style={
                    labelStyle
                  }
                >
                  Full Name
                </label>

                <input
                  value={
                    fullName
                  }
                  onChange={(
                    event
                  ) =>
                    setFullName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your full name"
                  disabled={
                    saving
                  }
                  style={
                    inputStyle
                  }
                />

                <label
                  style={
                    labelStyle
                  }
                >
                  Username
                </label>

                <input
                  value={
                    username
                  }
                  onChange={(
                    event
                  ) =>
                    setUsername(
                      event.target
                        .value
                    )
                  }
                  placeholder="Choose a username"
                  disabled={
                    saving
                  }
                  style={
                    inputStyle
                  }
                />

                <label
                  style={
                    labelStyle
                  }
                >
                  Email Address
                </label>

                <input
                  value={
                    user.email ??
                    ""
                  }
                  disabled
                  style={{
                    ...inputStyle,
                    background:
                      "#f2f4f7",
                    color:
                      "#667085",
                  }}
                />

                <label
                  style={
                    labelStyle
                  }
                >
                  Phone Number
                </label>

                <input
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your phone number"
                  disabled={
                    saving
                  }
                  style={
                    inputStyle
                  }
                />

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    marginTop:
                      "5px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      saving
                        ? "#8aa8a3"
                        : "#003b36",
                    color:
                      "white",
                    fontSize:
                      "15px",
                    fontWeight:
                      800,
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                    transition:
                      "all 0.2s ease",
                  }}
                >
                  {saving
                    ? "✓ Changes Saved"
                    : "Save Changes"}
                </button>
              </form>
            </section>

            {/* PROFILE CARD */}

            <section
              style={{
                background:
                  "white",
                borderRadius:
                  "18px",
                padding:
                  "28px",
                border:
                  "1px solid #e5e7eb",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.05)",
                textAlign:
                  "center",
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 20px",
                  color:
                    "#172033",
                  fontSize:
                    "20px",
                }}
              >
                Your Profile
              </h2>

              {/* PROFILE PICTURE */}

              <div
                style={{
                  width:
                    "150px",
                  height:
                    "150px",
                  margin:
                    "0 auto",
                  borderRadius:
                    "50%",
                  overflow:
                    "hidden",
                  background:
                    "#ffffff",
                  border:
                    "6px solid #eef3f2",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={
                      avatarUrl
                    }
                    alt={
                      displayName
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "cover",
                      display:
                        "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      background:
                        "#ffffff",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      color:
                        "#98a2b3",
                      fontSize:
                        "42px",
                      fontWeight:
                        800,
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              {/* NAME DIRECTLY BELOW PHOTO */}

              <h3
                style={{
                  margin:
                    "18px 0 4px",
                  color:
                    "#172033",
                  fontSize:
                    "21px",
                  fontWeight:
                    800,
                }}
              >
                {displayName}
              </h3>

              {/* USERNAME */}

              {username && (
                <p
                  style={{
                    margin:
                      "0 0 5px",
                    color:
                      "#00695c",
                    fontSize:
                      "14px",
                    fontWeight:
                      700,
                  }}
                >
                  @{username}
                </p>
              )}

              {/* EMAIL */}

              <p
                style={{
                  margin:
                    "0 0 20px",
                  color:
                    "#667085",
                  fontSize:
                    "13px",
                  wordBreak:
                    "break-word",
                }}
              >
                {user.email}
              </p>

              {/* CHANGE PHOTO */}

              <label
                style={{
                  display:
                    "inline-block",
                  background:
                    uploading
                      ? "#8aa8a3"
                      : "#003b36",
                  color:
                    "white",
                  padding:
                    "11px 18px",
                  borderRadius:
                    "9px",
                  fontWeight:
                    700,
                  cursor:
                    uploading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {uploading
                  ? "Uploading..."
                  : "📷 Change Photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleAvatarChange
                  }
                  disabled={
                    uploading
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>

              <p
                style={{
                  marginTop:
                    "14px",
                  marginBottom:
                    0,
                  color:
                    "#98a2b3",
                  fontSize:
                    "12px",
                  lineHeight:
                    1.5,
                }}
              >
                JPG, PNG or other
                image formats.
                Maximum 5MB.
              </p>
            </section>
          </div>

          {/* MY BUSINESSES */}

          <section
            style={{
              background:
                "white",
              borderRadius:
                "18px",
              padding:
                "28px",
              marginTop:
                "24px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 5px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin:
                      "0 0 6px",
                    color:
                      "#172033",
                  }}
                >
                  My Businesses
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#667085",
                    fontSize:
                      "14px",
                  }}
                >
                  Businesses registered
                  under your account.
                </p>
              </div>

              <Link
                to="/register-business"
                style={{
                  background:
                    "#003b36",
                  color:
                    "white",
                  textDecoration:
                    "none",
                  padding:
                    "10px 16px",
                  borderRadius:
                    "9px",
                  fontWeight:
                    700,
                  fontSize:
                    "14px",
                }}
              >
                + Register Business
              </Link>
            </div>

            {businessLoading ? (
              <div
                style={{
                  marginTop:
                    "25px",
                  padding:
                    "25px",
                  textAlign:
                    "center",
                  color:
                    "#667085",
                }}
              >
                Loading your
                businesses...
              </div>
            ) : businesses.length ===
              0 ? (
              <div
                style={{
                  marginTop:
                    "25px",
                  padding:
                    "30px",
                  background:
                    "#f7f9f9",
                  borderRadius:
                    "12px",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "36px",
                    marginBottom:
                      "10px",
                  }}
                >
                  🏢
                </div>

                <h3
                  style={{
                    margin:
                      "0 0 8px",
                    color:
                      "#172033",
                  }}
                >
                  No businesses yet
                </h3>

                <p
                  style={{
                    margin:
                      "0 0 15px",
                    color:
                      "#667085",
                    fontSize:
                      "14px",
                  }}
                >
                  You haven't registered
                  a business yet.
                </p>

                <Link
                  to="/register-business"
                  style={{
                    color:
                      "#00695c",
                    fontWeight:
                      800,
                    textDecoration:
                      "none",
                  }}
                >
                  Register your first
                  business →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(240px,1fr))",
                  gap:
                    "16px",
                  marginTop:
                    "25px",
                }}
              >
                {businesses.map(
                  (business) => (
                    <Link
                      key={
                        business.id
                      }
                      to={`/business/${business.id}`}
                      style={{
                        textDecoration:
                          "none",
                        color:
                          "inherit",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "12px",
                        overflow:
                          "hidden",
                      }}
                    >
                      {business.cover_image ? (
                        <img
                          src={
                            business.cover_image
                          }
                          alt={
                            business.name
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "130px",
                            objectFit:
                              "cover",
                            display:
                              "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height:
                              "130px",
                            background:
                              "linear-gradient(135deg,#003b36,#00695c)",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color:
                              "white",
                            fontSize:
                              "40px",
                          }}
                        >
                          🏢
                        </div>
                      )}

                      <div
                        style={{
                          padding:
                            "15px",
                        }}
                      >
                        <strong
                          style={{
                            color:
                              "#172033",
                          }}
                        >
                          {
                            business.name
                          }
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            color:
                              "#667085",
                            fontSize:
                              "13px",
                          }}
                        >
                          {business.category ||
                            "Business"}
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <style>
        {`
          @media (max-width: 760px) {
            .profile-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  color: "#344054",
  fontSize: 14,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  marginBottom: 18,
  borderRadius: 9,
  border: "1px solid #d0d5dd",
  background: "white",
  color: "#172033",
  fontSize: 15,
  outline: "none",
};

export default Profile;
