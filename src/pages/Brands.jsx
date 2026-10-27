import { useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePersonalisation } from "../lib/personalisation";

const BRANDS = [
  { name: "Bench", type: "Clothing, Philippines" },
  { name: "Penshoppe", type: "Clothing, Philippines" },
  { name: "Folded & Hung", type: "Clothing, Philippines" },
  { name: "Sunnies Studios", type: "Eyewear, Philippines" },
  { name: "Uniqlo", type: "Clothing" },
  { name: "H&M", type: "Clothing" },
  { name: "Zara", type: "Clothing" },
  { name: "Mango", type: "Clothing" },
  { name: "Cotton On", type: "Clothing" },
  { name: "Levi's", type: "Denim" },
  { name: "Nike", type: "Sportswear" },
  { name: "adidas", type: "Sportswear" },
  { name: "Lacoste", type: "Clothing" },
  { name: "Calvin Klein", type: "Clothing" },
  { name: "GUESS", type: "Clothing and bags" },
  { name: "Ralph Lauren", type: "Clothing" },
  { name: "Coach", type: "Bags" },
  { name: "Michael Kors", type: "Bags" },
  { name: "Apple", type: "Electronics" },
  { name: "Samsung", type: "Electronics" },
  { name: "Xiaomi", type: "Electronics" },
  { name: "Brother", type: "Home appliances" }
];

export default function Brands() {
  const navigate = useNavigate();
  const [data, update] = usePersonalisation();
  const [query, setQuery] = useState("");

  const followed = data.brands || [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANDS.filter((brand) => !q || brand.name.toLowerCase().includes(q));
  }, [query]);

  function toggle(name) {
    update((d) => {
      const list = d.brands || [];
      return { ...d, brands: list.includes(name) ? list.filter((b) => b !== name) : [...list, name] };
    });
  }

  return (
    <main className="mobile-subpage">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Brands</h1>

        <span />
      </header>

      <form className="mobile-brand-search" onSubmit={(e) => e.preventDefault()}>
        <Search size={21} />
        <input
          type="search"
          placeholder="Search brands"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search brands"
        />
      </form>

      <section className="mobile-brand-section">
        <p className="mobile-brand-label">
          {query ? `${visible.length} result${visible.length === 1 ? "" : "s"}` : `Popular brands · ${followed.length} followed`}
        </p>

        <div className="mobile-brand-list">
          {visible.map((brand) => {
            const isFollowed = followed.includes(brand.name);

            return (
              <article className="mobile-brand-row" key={brand.name}>
                <div>
                  <strong>{brand.name}</strong>
                  <span>{brand.type}</span>
                </div>

                <button
                  type="button"
                  className={isFollowed ? "pers-following" : ""}
                  aria-pressed={isFollowed}
                  onClick={() => toggle(brand.name)}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </article>
            );
          })}

          {visible.length === 0 && <p className="mobile-brand-label">No brand found.</p>}
        </div>
      </section>
    </main>
  );
}
