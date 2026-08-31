import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/core/auth";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const {
    user,
    logout,
  } = useAuth();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
   * CLOSE MENUS WHEN PAGE CHANGES
   */
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  /*
   * SET PAGE LANGUAGE
   */
  useEffect(() => {
    document.documentElement.lang =
      language;
  }, [language]);

  /*
   * CLOSE PROFILE MENU WHEN
   * CLICKING OUTSIDE
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [profileMenuOpen]);

  /*
   * NAVIGATION LINKS
   */
  const links = [
    {
      path: "/",
      label: t.home,
    },
    {
      path: "/cleaning-services",
      label: t.cleaning,
    },
    {
      path: "/explore",
      label: t.explore,
    },
    {
      path: "/taxi",
      label: t.taxi,
    },
    {
      path: "/bike",
      label: t.bike,
    },
    {
      path: "/food",
      label: t.food,
    },
    {
      path: "/hotels",
      label: t.hotels,
    },
    {
      path: "/news",
      label: t.news,
    },
    {
      path: "/contact",
      label: t.contact,
    },
  ];

  /*
   * ACTIVE LINK
   */
  function isActive(path: string) {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  }

  /*
   * LANGUAGE
   */
  function handleLanguageChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    setLanguage(
      event.target.value === "fr"
        ? "fr"
        : "en"
    );
  }

  /*
   * LOGOUT
   */
  async function handleLogout() {
    try {
      await logout();

      setProfileMenuOpen(false);
      setMobileMenuOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  /*
   * USER INFORMATION
   *
   * USERNAME IS THE PUBLIC DISPLAY NAME.
   * Full name is only used as a fallback.
   */
  const metadata =
    user?.user_metadata || {};

  const fullName =
    typeof metadata.full_name ===
    "string"
      ? metadata.full_name.trim()
      : "";

  const username =
    typeof metadata.username ===
    "string"
      ? metadata.username.trim()
      : "";

  const email =
    user?.email || "";

  const displayName =
    username ||
    fullName ||
    email.split("@")[0] ||
    "User";

  const avatarUrl =
    typeof metadata.avatar_url ===
    "string"
      ? metadata.avatar_url.trim()
      : "";

  /*
   * PROFILE AVATAR
   *
   * Blank white circle when there
   * is no profile picture.
   */
  function ProfileAvatar({
    size = 48,
  }: {
    size?: number;
  }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#ffffff",
          border:
            "2px solid rgba(255,255,255,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        background: "#003b36",
        color: "white",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      <div
        className="ecos-navbar-inner"
        style={{
          width: "100%",
          maxWidth: "1400px",
          minHeight: "82px",
          margin: "0 auto",
          padding: "8px 20px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* LEFT — EVERYDAY CONNECT LOGO */}

        <Link
          to="/"
          aria-label={`${t.appName} home`}
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <img
            src="/branding/everyday-connect-logo.png"
            alt={t.appName}
            style={{
              height: "58px",
              width: "auto",
              maxWidth: "210px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Link>

        {/* CENTER — DESKTOP NAVIGATION */}

        <nav
          className="ecos-desktop-nav"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            minWidth: 0,
          }}
        >
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: "white",
                textDecoration:
                  isActive(link.path)
                    ? "underline"
                    : "none",
                textUnderlineOffset: "5px",
                fontWeight:
                  isActive(link.path)
                    ? 700
                    : 500,
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          ))}</nav>



        {/* STANDALONE LANGUAGE SELECTOR */}

        <div
          className="ecos-language-selector"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: 17,
              lineHeight: 1,
            }}
          >
            🌐
          </span>

          <select
            value={language}
            onChange={handleLanguageChange}
            aria-label={t.language}
            style={{
              padding: "7px 9px",
              borderRadius: 7,
              border:
                "1px solid rgba(255,255,255,0.35)",
              background: "#ffffff",
              color: "#172033",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <option value="en">
              {t.english}
            </option>

            <option value="fr">
              {t.french}
            </option>
          </select>
        </div>

        {/* RIGHT — STAND-ALONE USER PROFILE */}

        {user && (
          <div
            ref={profileRef}
            className="ecos-profile"
            style={{
              position: "relative",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setProfileMenuOpen(
                  (open) => !open
                )
              }
              aria-expanded={
                profileMenuOpen
              }
              aria-label="Open profile menu"
              style={{
                border: "none",
                background:
                  "transparent",
                color: "white",
                cursor: "pointer",
                padding: "2px 4px",
                display: "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: 4,
                minWidth: 70,
              }}
            >
              <ProfileAvatar size={46} />

              <span
                style={{
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {displayName}
              </span>
            </button>

            {/* PROFILE DROPDOWN */}

            {profileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top:
                    "calc(100% + 10px)",
                  right: 0,
                  width: 280,
                  background: "white",
                  borderRadius: 14,
                  boxShadow:
                    "0 15px 40px rgba(0,0,0,0.22)",
                  border:
                    "1px solid #e5e7eb",
                  padding: 10,
                  color: "#172033",
                }}
              >
                {/* PROFILE SUMMARY */}

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 12,
                    padding: 12,
                    borderBottom:
                      "1px solid #edf0f2",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      background:
                        "#f3f5f5",
                      borderRadius:
                        "50%",
                      padding: 2,
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius:
                            "50%",
                          background:
                            "white",
                          border:
                            "1px solid #d9dfe1",
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#172033",
                        fontSize: 15,
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {displayName}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop: 3,
                        color:
                          "#667085",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {email}
                    </small>
                  </div>
                </div>

                {/* MY PROFILE */}

                <Link
                  to="/profile"
                  onClick={() =>
                    setProfileMenuOpen(
                      false
                    )
                  }
                  style={
                    accountMenuLinkStyle
                  }
                >
                  <span
                    style={{
                      fontSize: 19,
                    }}
                  >
                    👤
                  </span>

                  <span>
                    <strong>
                      My Profile
                    </strong>

                    <small>
                      View and edit your
                      personal information
                    </small>
                  </span>
                </Link>

                {/* MY BUSINESSES */}

                <Link
                  to="/business-dashboard"
                  onClick={() =>
                    setProfileMenuOpen(
                      false
                    )
                  }
                  style={
                    accountMenuLinkStyle
                  }
                >
                  <span
                    style={{
                      fontSize: 19,
                    }}
                  >
                    🏢
                  </span>

                  <span>
                    <strong>
                      My Businesses
                    </strong>

                    <small>
                      Manage your registered
                      businesses
                    </small>
                  </span>
                </Link>

                {/* ACCOUNT SETTINGS */}

                <Link
                  to="/business-dashboard/settings"
                  onClick={() =>
                    setProfileMenuOpen(
                      false
                    )
                  }
                  style={
                    accountMenuLinkStyle
                  }
                >
                  <span
                    style={{
                      fontSize: 19,
                    }}
                  >
                    ⚙️
                  </span>

                  <span>
                    <strong>
                      Account Settings
                    </strong>

                    <small>
                      Manage your account
                      settings
                    </small>
                  </span>
                </Link>

                {/* SIGN OUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  style={{
                    ...accountMenuLinkStyle,
                    width: "100%",
                    border: "none",
                    background:
                      "transparent",
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                    fontFamily:
                      "inherit",
                  }}
                >
                  <span
                    style={{
                      fontSize: 19,
                    }}
                  >
                    🚪
                  </span>

                  <span>
                    <strong>
                      Sign Out
                    </strong>

                    <small>
                      Sign out of Everyday
                      Connect
                    </small>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="ecos-mobile-menu-button"
          onClick={() =>
            setMobileMenuOpen(
              (open) => !open
            )
          }
          aria-expanded={
            mobileMenuOpen
          }
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          style={{
            display: "none",
            border: "none",
            background:
              "transparent",
            color: "white",
            fontSize: 28,
            cursor: "pointer",
            padding: 4,
            flexShrink: 0,
          }}
        >
          {mobileMenuOpen
            ? "×"
            : "☰"}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}

      {mobileMenuOpen && (
        <nav
          className="ecos-mobile-nav"
          style={{
            background: "#003b36",
            borderTop:
              "1px solid rgba(255,255,255,0.12)",
            padding:
              "14px 20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 14,
            }}
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                style={{
                  color: "white",
                  textDecoration:
                    isActive(
                      link.path
                    )
                      ? "underline"
                      : "none",
                  fontWeight:
                    isActive(
                      link.path
                    )
                      ? 700
                      : 500,
                  fontSize: 15,
                }}
              >
                {link.label}
              </Link>
            ))}</div>
        </nav>
      )}

      <style>
        {`
          @media (max-width: 1150px) {
            .ecos-desktop-nav {
              display: none !important;
            }

            .ecos-navbar-inner {
              justify-content: space-between !important;
            }

            .ecos-mobile-menu-button {
              display: block !important;
            }

            .ecos-profile {
              margin-left: auto !important;
            }

            .ecos-language-selector {
              display: flex !important;
            }
          }

          @media (max-width: 600px) {
            .ecos-language-selector select {
              padding: 6px 7px !important;
              font-size: 12px !important;
            }

            .ecos-language-selector span {
              font-size: 15px !important;
            }
            .ecos-navbar-inner {
              padding: 7px 14px !important;
              min-height: 76px !important;
              gap: 8px !important;
            }

            .ecos-navbar-inner > a img {
              height: 52px !important;
              max-width: 150px !important;
            }

            .ecos-profile button {
              min-width: 62px !important;
            }

            .ecos-profile button > span {
              max-width: 90px !important;
              font-size: 11px !important;
            }

            .ecos-mobile-menu-button {
              font-size: 25px !important;
            }
          }
        `}
      </style>
    </header>
  );
}

const accountMenuLinkStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  width: "100%",
  padding: "11px 10px",
  borderRadius: 9,
  color: "#172033",
  textDecoration: "none",
  boxSizing:
    "border-box" as const,
};

export default Navbar;



