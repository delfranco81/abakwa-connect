import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import PageHeader from "../../components/Admin/PageHeader";
import SearchBar from "../../components/Admin/SearchBar";
import StatCard from "../../components/Admin/StatCard";
import { supabase } from "../../lib/supabase";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("title");

    if (!error && data) {
      setNews(data);
    }

    setLoading(false);
  }

  async function deleteNews(id: string) {
    const confirmed = window.confirm(
      "Delete this news article?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (!error) {
      loadNews();
    }
  }

  const filteredNews = news.filter((item) =>
    item.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalNews = news.length;

  const publishedNews = news.filter(
    (item) => item.published
  ).length;

  const categories = new Set(
    news.map((item) => item.category)
  ).size;

  return (
    <DashboardLayout>
      <PageHeader
        title="News"
        buttonText="+ Add News"
        buttonLink="/admin/news/new"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Articles"
          value={totalNews}
          color="#2563eb"
        />

        <StatCard
          title="Published"
          value={publishedNews}
          color="#16a34a"
        />

        <StatCard
          title="Categories"
          value={categories}
          color="#9333ea"
        />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <p style={{ marginBottom: 20 }}>
        Showing {filteredNews.length} of {news.length} articles
      </p>

      {loading ? (
        <p>Loading news...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f5f5f5",
                textAlign: "left",
              }}
            >
              <th style={{ padding: 14 }}>Image</th>
              <th style={{ padding: 14 }}>Title</th>
              <th style={{ padding: 14 }}>Category</th>
              <th style={{ padding: 14 }}>Author</th>
              <th style={{ padding: 14 }}>Status</th>
              <th style={{ padding: 14 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredNews.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  No news articles found.
                </td>
              </tr>
            ) : (
              filteredNews.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: 14 }}>
                    <img
                      src={
                        item.image ||
                        "https://placehold.co/100x70?text=News"
                      }
                      alt={item.title}
                      style={{
                        width: 80,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </td>

                  <td
                    style={{
                      padding: 14,
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </td>

                  <td style={{ padding: 14 }}>
                    {item.category}
                  </td>

                  <td style={{ padding: 14 }}>
                    {item.author}
                  </td>

                  <td style={{ padding: 14 }}>
                    {item.published
                      ? "✅ Published"
                      : "📝 Draft"}
                  </td>

                  <td style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <Link
                        to={`/admin/news/${item.id}`}
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        onClick={() =>
                          deleteNews(item.id)
                        }
                        style={{
                          border: "none",
                          background: "none",
                          color: "red",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export default News;