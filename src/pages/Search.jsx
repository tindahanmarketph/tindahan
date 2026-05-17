import { Camera, Search as SearchIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CATEGORIES } from "../lib/categories";

const categoryVisuals = {
  women: "👗",
  men: "🧥",
  designer: "👜",
  kids: "🧸",
  home: "🛋️",
  electronics: "📱",
  entertainment: "📚",
  hobbies: "🎨",
  sports: "🏓",
  pets: "🐾",
  beauty: "💄",
  school_office: "🎒",
  local_cultural: "🇵🇭",
  travel_motorbike: "🛵"
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    navigate(`/?q=${encodeURIComponent(cleanQuery)}`);
  }

  return (
    <main className="mobile-search-page">
      <form className="mobile-search-topbar" onSubmit={handleSubmit}>
        <SearchIcon size={25} />

        <input
          type="text"
          value={query}
          placeholder="Search for an item or member"
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="button" aria-label="Search by image">
          <Camera size={25} />
        </button>
      </form>

      <div className="mobile-search-chips">
        <Link to="/" className="mobile-search-chip active">
          See all
        </Link>

        {CATEGORIES.slice(0, 8).map((category) => (
          <Link
            key={category.id}
            to={`/?category=${category.id}`}
            className="mobile-search-chip"
          >
            {category.label}
          </Link>
        ))}
      </div>

      <section className="mobile-category-grid">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to={`/?category=${category.id}`}
            className="mobile-category-card"
          >
            <strong>{category.label}</strong>

            <span className="mobile-category-emoji">
              {categoryVisuals[category.id] || category.icon || "✨"}
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}