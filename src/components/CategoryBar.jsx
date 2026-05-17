import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../lib/categories";

export default function CategoryBar() {
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentSubcategory = searchParams.get("subcategory") || "";
  const currentChildCategory = searchParams.get("child_category") || "";

  const currentQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "";

  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState(null);

  const openCategory = useMemo(() => {
    return CATEGORIES.find((category) => category.id === openCategoryId);
  }, [openCategoryId]);

  const selectedSubcategory = useMemo(() => {
    if (!openCategory) return null;

    if (hoveredSubcategoryId) {
      return openCategory.subcategories.find(
        (subcategory) => subcategory.id === hoveredSubcategoryId
      );
    }

    return openCategory.subcategories[0] || null;
  }, [openCategory, hoveredSubcategoryId]);

  function getUrl(categoryId = "all", subcategoryId = null, childCategoryId = null) {
    const params = new URLSearchParams();

    if (categoryId && categoryId !== "all") {
      params.set("category", categoryId);
    }

    if (subcategoryId) {
      params.set("subcategory", subcategoryId);
    }

    if (childCategoryId) {
      params.set("child_category", childCategoryId);
    }

    if (currentQuery) {
      params.set("q", currentQuery);
    }

    if (currentSort && currentSort !== "newest") {
      params.set("sort", currentSort);
    }

    const queryString = params.toString();

    return queryString ? `/?${queryString}` : "/";
  }

  function openMenu(categoryId) {
    setOpenCategoryId(categoryId);
    setHoveredSubcategoryId(null);
  }

  function closeMenu() {
    setOpenCategoryId(null);
    setHoveredSubcategoryId(null);
  }

  function handleCategoryClick() {
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="vinted-category-wrapper" onMouseLeave={closeMenu}>
      <nav className="vinted-category-nav">
        <div className="container vinted-category-inner">
          <Link
            to={getUrl("all")}
            className={
              currentCategory === "all"
                ? "vinted-category-link active"
                : "vinted-category-link"
            }
            onMouseEnter={closeMenu}
            onClick={handleCategoryClick}
          >
            All
          </Link>

          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={getUrl(category.id)}
              className={
                currentCategory === category.id
                  ? "vinted-category-link active"
                  : "vinted-category-link"
              }
              onMouseEnter={() => openMenu(category.id)}
              onClick={handleCategoryClick}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </nav>

      {openCategory && (
        <div className="vinted-mega-menu">
          <div className="container vinted-mega-inner">
            <aside className="vinted-mega-sidebar">
              <Link
                to={getUrl(openCategory.id)}
                className="vinted-mega-sidebar-item see-all"
                onClick={handleCategoryClick}
              >
                <span className="sidebar-icon">⋮⋮</span>
                Voir tout
              </Link>

              {openCategory.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  to={getUrl(openCategory.id, subcategory.id)}
                  onMouseEnter={() => setHoveredSubcategoryId(subcategory.id)}
                  onClick={handleCategoryClick}
                  className={
                    currentSubcategory === subcategory.id ||
                    selectedSubcategory?.id === subcategory.id
                      ? "vinted-mega-sidebar-item active"
                      : "vinted-mega-sidebar-item"
                  }
                >
                  <span className="sidebar-icon">
                    {subcategory.children?.length ? "▸" : "•"}
                  </span>

                  <span>{subcategory.label}</span>

                  {subcategory.children?.length > 0 && (
                    <span className="sidebar-arrow">›</span>
                  )}
                </Link>
              ))}
            </aside>

            <section className="vinted-mega-content">
              <div className="vinted-mega-title-row">
                <Link
                  to={getUrl(openCategory.id)}
                  className="vinted-mega-main-link"
                  onClick={handleCategoryClick}
                >
                  Voir tout {openCategory.label}
                </Link>

                {selectedSubcategory && (
                  <Link
                    to={getUrl(openCategory.id, selectedSubcategory.id)}
                    className="vinted-mega-main-link"
                    onClick={handleCategoryClick}
                  >
                    Voir tout {selectedSubcategory.label}
                  </Link>
                )}
              </div>

              {selectedSubcategory?.children?.length > 0 ? (
                <div className="vinted-mega-grid">
                  {selectedSubcategory.children.map((child) => (
                    <Link
                      key={child.id}
                      to={getUrl(openCategory.id, selectedSubcategory.id, child.id)}
                      onClick={handleCategoryClick}
                      className={
                        currentChildCategory === child.id
                          ? "vinted-mega-link active"
                          : "vinted-mega-link"
                      }
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="vinted-mega-grid">
                  {openCategory.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={getUrl(openCategory.id, subcategory.id)}
                      onMouseEnter={() => setHoveredSubcategoryId(subcategory.id)}
                      onClick={handleCategoryClick}
                      className={
                        currentSubcategory === subcategory.id
                          ? "vinted-mega-link active"
                          : "vinted-mega-link"
                      }
                    >
                      {subcategory.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}