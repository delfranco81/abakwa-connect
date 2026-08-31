import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  published: boolean;
};

function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);

    const { data, error } = await supabase
      .from("news")
      .select(
        "id,title,content,image,category,author,published"
      )
      .eq("published", true)
      .order("title", { ascending: true });

    if (error) {
      console.error("Unable to load news:", error);
      setNews([]);
      setLoading(false);
      return;
    }

    setNews((data || []) as NewsItem[]);
    setLoading(false);
  }

  const categories = useMemo(() => {
    return [
      ...new Set(
        news
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];
  }, [news]);

  const filteredNews = useMemo(() => {
    if (!category) {
      return news;
    }

    return news.filter(
      (item) => item.category === category
    );
  }, [news, category]);

  return (
    <>

      <main
        style={{
          minHeight: "100vh",
          background: "#f7faf9",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg,#003b36,#087568)",
            color: "white",
            padding: "55px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1150px",
              margin: "0 auto",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                color: "#9ff2e9",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Every Day Connect
            </p>

            <h1
              style={{
                fontSize: "clamp(36px,6vw,58px)",
                margin: 0,
              }}
            >
              Daily Bamenda News
            </h1>

            <p
              style={{
                maxWidth: "700px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#e5fffb",
              }}
            >
              Stay informed about what is happening around
              Bamenda and discover useful stories, community
              information, events and local developments.
            </p>
          </div>
        </section>

        <section
          style={{
            maxWidth: "1150px",
            margin: "0 auto",
            padding: "40px 24px 80px",
          }}
        >
          {categories.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "9px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <button
                type="button"
                onClick={() => setCategory("")}
                style={categoryButtonStyle(!category)}
              >
                All
              </button>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  style={categoryButtonStyle(
                    category === item
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <p style={{ color: "#61716e" }}>
              Loading today's news...
            </p>
          )}

          {!loading && filteredNews.length === 0 && (
            <div
              style={{
                background: "white",
                padding: "45px",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <h2 style={{ color: "#123c37" }}>
                No published news yet
              </h2>

              <p style={{ color: "#61716e" }}>
                Check back soon for updates from Every Day
                Connect.
              </p>
            </div>
          )}

          {!loading && filteredNews.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(280px,1fr))",
                gap: "22px",
              }}
            >
              {filteredNews.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #e4ece9",
                    boxShadow:
                      "0 5px 18px rgba(0,59,54,0.06)",
                  }}
                >
                  <img
                    src={
                      item.image ||
                      "https://placehold.co/800x450?text=Every+Day+Connect"
                    }
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "190px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div style={{ padding: "22px" }}>
                    <span
                      style={{
                        color: "#087568",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.category || "Community"}
                    </span>

                    <h2
                      style={{
                        color: "#123c37",
                        fontSize: "22px",
                        lineHeight: 1.25,
                        margin: "9px 0 12px",
                      }}
                    >
                      {item.title}
                    </h2>

                    <p
                      style={{
                        color: "#61716e",
                        lineHeight: 1.65,
                        marginBottom: "18px",
                      }}
                    >
                      {item.content}
                    </p>

                    <small style={{ color: "#899793" }}>
                      {item.author
                        ? `By ${item.author}`
                        : "Every Day Connect"}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function categoryButtonStyle(active: boolean) {
  return {
    border: active
      ? "1px solid #087568"
      : "1px solid #d5e1de",
    background: active ? "#087568" : "white",
    color: active ? "white" : "#35504b",
    borderRadius: "999px",
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: 600,
  };
}

export default News;