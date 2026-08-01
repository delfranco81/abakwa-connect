import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./CategorySection.css";

type Category = {
  id: number;
  name: string;
  icon: string;
};

function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, icon")
        .eq("status", "approved")
        .order("popularity", { ascending: false });

      if (error) {
        console.error(error);
      } else if (data) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className="categories">

      <h2>Popular Categories</h2>

      <p>Browse businesses by category.</p>

      <div className="category-grid">

        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/businesses?category=${encodeURIComponent(category.name)}`}
            className="category-card"
          >
            <span className="emoji"> {category.icon || "🏪"}
</span>

            <h3>{category.name}</h3>

          </Link>
        ))}

      </div>

    </section>
  );
}

export default CategorySection;