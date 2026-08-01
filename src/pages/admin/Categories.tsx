import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

type Category = {
  id: string;
  name: string;
  slug: string;
};

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  /*
   * Generate URL-friendly slug
   */
  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /*
   * Load categories
   */
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      console.error("Category loading error:", error);

      toast.error(
        error?.message || "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Name input
   */
  function handleNameChange(value: string) {
    setName(value);

    // Only automatically change slug while creating.
    // During editing, the administrator can control the slug.
    if (!editingId) {
      setSlug(createSlug(value));
    }
  }

  /*
   * Start editing
   */
  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * Cancel editing
   */
  function cancelEdit() {
    setEditingId(null);
    setName("");
    setSlug("");
  }

  /*
   * Submit add/update
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanSlug = createSlug(slug);

    if (!cleanName) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!cleanSlug) {
      toast.error("Please enter a valid category slug.");
      return;
    }

    /*
     * Check for duplicate name/slug
     */
    const duplicate = categories.find(
      (category) =>
        category.id !== editingId &&
        (
          category.name.toLowerCase() === cleanName.toLowerCase() ||
          category.slug.toLowerCase() === cleanSlug.toLowerCase()
        )
    );

    if (duplicate) {
      toast.error(
        "A category with this name or slug already exists."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        /*
         * UPDATE
         */
        const { error } = await supabase
          .from("categories")
          .update({
            name: cleanName,
            slug: cleanSlug,
          })
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        toast.success("Category updated successfully.");
      } else {
        /*
         * INSERT
         */
        const { error } = await supabase
          .from("categories")
          .insert([
            {
              name: cleanName,
              slug: cleanSlug,
            },
          ]);

        if (error) {
          throw error;
        }

        toast.success("Category created successfully.");
      }

      cancelEdit();

      await loadCategories();
    } catch (error: any) {
      console.error("Category save error:", error);

      toast.error(
        error?.message || "Unable to save category."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Delete category
   */
  async function handleDeleteCategory(
    id: string,
    categoryName: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Category deleted successfully.");

      if (editingId === id) {
        cancelEdit();
      }

      await loadCategories();
    } catch (error: any) {
      console.error("Category deletion error:", error);

      toast.error(
        error?.message || "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * Search
   */
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
    );
  }, [categories, search]);

  /*
   * Statistics
   */
  const totalCategories = categories.length;

  const visibleCategories = filteredCategories.length;

  const longestCategory =
    categories.length > 0
      ? categories.reduce((longest, current) =>
          current.name.length > longest.name.length
            ? current
            : longest
        )
      : null;

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "10px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          <Link
            to="/admin"
            style={{
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            Admin Dashboard
          </Link>

          <span
            style={{
              color: "#666",
              margin: "0 8px",
            }}
          >
            /
          </span>

          <span style={{ color: "#111" }}>
            Categories
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 25,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              Categories
            </h1>

            <p
              style={{
                marginTop: 8,
                color: "#666",
              }}
            >
              Manage categories used throughout your tourism platform.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(200px,1fr))",
            gap: 16,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Total Categories
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginTop: 5,
              }}
            >
              {totalCategories}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Search Results
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                marginTop: 5,
              }}
            >
              {visibleCategories}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Longest Category
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              {longestCategory?.name || "—"}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(280px, 350px) 1fr",
            gap: 25,
            alignItems: "start",
          }}
        >
          {/* Form */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <h2
              style={{
                margin: "0 0 18px",
                fontSize: 19,
              }}
            >
              {editingId
                ? "Edit Category"
                : "Create Category"}
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Category Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Restaurants"
                  value={name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  disabled={submitting}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 11,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  URL Slug
                </label>

                <input
                  type="text"
                  placeholder="restaurants"
                  value={slug}
                  onChange={(e) =>
                    setSlug(createSlug(e.target.value))
                  }
                  disabled={submitting}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 11,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: 6,
                    color: "#6b7280",
                  }}
                >
                  URL: /category/{slug || "example"}
                </small>
              </div>

              {/* Buttons */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: 11,
                  background: submitting
                    ? "#93c5fd"
                    : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "💾 Save Changes"
                  : "➕ Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={submitting}
                  style={{
                    padding: 11,
                    background: "#f3f4f6",
                    color: "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Category List */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 15,
                marginBottom: 15,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 19,
                }}
              >
                Active Categories
              </h2>

              <button
                onClick={loadCategories}
                disabled={loading}
                style={{
                  padding: "8px 12px",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search categories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                marginBottom: 15,
                borderRadius: 7,
                border: "1px solid #d1d5db",
                background: "#fff",
              }}
            />

            {loading ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 30,
                  textAlign: "center",
                }}
              >
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 40,
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                {search
                  ? "No categories match your search."
                  : "No categories have been created yet."}
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 600,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9fafb",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <th
                          style={{
                            padding: 14,
                            textAlign: "left",
                          }}
                        >
                          Name
                        </th>

                        <th
                          style={{
                            padding: 14,
                            textAlign: "left",
                          }}
                        >
                          Slug
                        </th>

                        <th
                          style={{
                            padding: 14,
                            textAlign: "right",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCategories.map(
                        (category) => (
                          <tr
                            key={category.id}
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <td
                              style={{
                                padding: 14,
                                fontWeight: 600,
                              }}
                            >
                              {category.name}
                            </td>

                            <td
                              style={{
                                padding: 14,
                                color: "#6b7280",
                                fontFamily:
                                  "monospace",
                              }}
                            >
                              /{category.slug}
                            </td>

                            <td
                              style={{
                                padding: 14,
                                textAlign: "right",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent:
                                    "flex-end",
                                  gap: 8,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEdit(
                                      category
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    category.id
                                  }
                                  style={{
                                    padding:
                                      "7px 10px",
                                    border:
                                      "1px solid #dbeafe",
                                    background:
                                      "#eff6ff",
                                    color: "#2563eb",
                                    borderRadius: 5,
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteCategory(
                                      category.id,
                                      category.name
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    category.id
                                  }
                                  style={{
                                    padding:
                                      "7px 10px",
                                    border:
                                      "1px solid #fecaca",
                                    background:
                                      "#fef2f2",
                                    color: "#dc2626",
                                    borderRadius: 5,
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  {deletingId ===
                                  category.id
                                    ? "Deleting..."
                                    : "🗑️ Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Categories;