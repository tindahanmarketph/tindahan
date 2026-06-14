import { ChevronLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const brands = [
  { name: "adidas", count: "35.6M items" },
  { name: "Calvin Klein", count: "4.7M items" },
  { name: "GUESS", count: "6.6M items" },
  { name: "H&M", count: "91M items" },
  { name: "Lacoste", count: "4.9M items" },
  { name: "Levi's", count: "11.1M items" },
  { name: "Mango", count: "15M items" },
  { name: "Michael Kors", count: "2.1M items" },
  { name: "Nike", count: "42M items" },
  { name: "Ralph Lauren", count: "8.4M items" }
];

export default function Brands() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Brands</h1>

        <span />
      </header>

      <form className="mobile-brand-search">
        <Search size={21} />
        <input type="text" placeholder="Search brands" />
      </form>

      <section className="mobile-brand-section">
        <p className="mobile-brand-label">Popular brands</p>

        <div className="mobile-brand-list">
          {brands.map((brand) => (
            <article className="mobile-brand-row" key={brand.name}>
              <div>
                <strong>{brand.name}</strong>
                <span>{brand.count}</span>
              </div>

              <button type="button">Follow</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}