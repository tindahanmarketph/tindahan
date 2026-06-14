import { Baby, ChevronLeft, ChevronRight, Shirt, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sizeGroups = [
  {
    title: "Women",
    icon: <Shirt size={24} />,
    sizes: "Sizes"
  },
  {
    title: "Men",
    icon: <Shirt size={24} />,
    sizes: "Sizes"
  },
  {
    title: "Kids",
    icon: <Baby size={24} />,
    sizes: "Sizes"
  }
];

export default function PreferredSizes() {
  const navigate = useNavigate();

  return (
    <main className="mobile-subpage">
      <header className="mobile-subpage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={27} />
        </button>

        <h1>Categories and sizes</h1>

        <span />
      </header>

      <section className="mobile-subpage-intro">
        <h2>Preferred sizes</h2>
        <p>Choose the sizes that interest you the most.</p>
      </section>

      <section className="preferred-size-list">
        {sizeGroups.map((group) => (
          <article className="preferred-size-card" key={group.title}>
            <div className="preferred-size-main-row">
              <div>
                <span className="preferred-size-icon">{group.icon || <UserRound />}</span>
                <strong>{group.title}</strong>
              </div>

              <button type="button" aria-label={`Select ${group.title}`}>
                <span />
              </button>
            </div>

            <button type="button" className="preferred-size-size-row">
              <span>{group.sizes}</span>
              <ChevronRight size={22} />
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}