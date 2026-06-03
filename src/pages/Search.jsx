import { Link } from "react-router-dom";
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
  return (
    <main className="mobile-search-page clean-mobile-search-page">
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