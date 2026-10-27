import { useState } from "react";
import { Baby, ChevronDown, ChevronLeft, Check, Footprints, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePersonalisation } from "../lib/personalisation";

const SIZE_GROUPS = [
  { key: "Women", icon: <Shirt size={24} />, options: ["XS", "S", "M", "L", "XL", "XXL", "Free size"] },
  { key: "Men", icon: <Shirt size={24} />, options: ["S", "M", "L", "XL", "XXL", "Free size"] },
  { key: "Kids", icon: <Baby size={24} />, options: ["0–3 months", "3–6 months", "6–12 months", "1–2 years", "3–4 years", "5–6 years", "7–8 years", "9–10 years"] },
  { key: "Shoes", icon: <Footprints size={24} />, options: ["US 5", "US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"] }
];

export default function PreferredSizes() {
  const navigate = useNavigate();
  const [data, update] = usePersonalisation();
  const [open, setOpen] = useState("");

  function toggleGroup(key) {
    update((d) => ({ ...d, groups: { ...d.groups, [key]: !d.groups[key] } }));
  }

  function toggleSize(key, size) {
    update((d) => {
      const current = d.sizes[key] || [];
      const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];

      return {
        ...d,
        sizes: { ...d.sizes, [key]: next },
        groups: { ...d.groups, [key]: next.length > 0 ? true : d.groups[key] }
      };
    });
  }

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
        <p>Choose the sizes that interest you the most. Your choices are saved on this device.</p>
      </section>

      <section className="preferred-size-list">
        {SIZE_GROUPS.map((group) => {
          const selected = data.sizes[group.key] || [];
          const active = Boolean(data.groups[group.key]);
          const isOpen = open === group.key;

          return (
            <article className="preferred-size-card" key={group.key}>
              <div className="preferred-size-main-row">
                <div>
                  <span className="preferred-size-icon">{group.icon}</span>
                  <strong>{group.key}</strong>
                </div>

                <button
                  type="button"
                  className={active ? "pers-check active" : "pers-check"}
                  aria-label={`${active ? "Unselect" : "Select"} ${group.key}`}
                  aria-pressed={active}
                  onClick={() => toggleGroup(group.key)}
                >
                  {active ? <Check size={17} /> : <span />}
                </button>
              </div>

              <button
                type="button"
                className="preferred-size-size-row"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? "" : group.key)}
              >
                <span>{selected.length ? selected.join(", ") : "Sizes"}</span>
                <ChevronDown size={22} className={isOpen ? "pers-chevron open" : "pers-chevron"} />
              </button>

              {isOpen && (
                <div className="pers-chips">
                  {group.options.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={selected.includes(size) ? "pers-chip active" : "pers-chip"}
                      aria-pressed={selected.includes(size)}
                      onClick={() => toggleSize(group.key, size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
