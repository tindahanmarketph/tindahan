import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES, getSubcategoryById } from "../lib/categories";

export default function CategoryBar() {
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentSubcategory = searchParams.get("subcategory") || "";
  const currentChildCategory = searchParams.get("child_category") || "";
  const q = searchParams.get("q");
  const sort = searchParams.get("sort");

  function getUrl(categoryId, subcategoryId = null, childCategoryId = null) {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);

    if (categoryId !== "all") {
      params.set("category", categoryId);
    }

    if (subcategoryId) {
      params.set("subcategory", subcategoryId);
    }

    if (childCategoryId) {
      params.set("child_category", childCategoryId);
    }

    const queryString = params.toString();

    return queryString ? `/?${queryString}` : "/";
  }

  const activeCategory = CATEGORIES.find((category) => category.id === currentCategory);
  const activeSubcategory = currentSubcategory
    ? getSubcategoryById(currentSubcategory)
    : null;

  return (
    <div className="category-bar">
      <div className="container category-inner">
        <Link
          to={getUrl("all")}
          className={currentCategory === "all" ? "category active" : "category"}
        >
          <span>✨</span>
          All
        </Link>

        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to={getUrl(category.id)}
            className={currentCategory === category.id ? "category active" : "category"}
          >
            <span>{category.icon}</span>
            {category.label}
          </Link>
        ))}
      </div>

      {activeCategory && (
        <div className="subcategory-bar">
          <div className="container subcategory-inner">
            <Link
              to={getUrl(activeCategory.id)}
              className={!currentSubcategory ? "subcategory active" : "subcategory"}
            >
              All {activeCategory.label}
            </Link>

            {activeCategory.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                to={getUrl(activeCategory.id, subcategory.id)}
                className={
                  currentSubcategory === subcategory.id && !currentChildCategory
                    ? "subcategory active"
                    : "subcategory"
                }
              >
                {subcategory.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeSubcategory?.children?.length > 0 && (
        <div className="child-category-bar">
          <div className="container child-category-inner">
            <Link
              to={getUrl(currentCategory, activeSubcategory.id)}
              className={!currentChildCategory ? "child-category active" : "child-category"}
            >
              All {activeSubcategory.label}
            </Link>

            {activeSubcategory.children.map((child) => (
              <Link
                key={child.id}
                to={getUrl(currentCategory, activeSubcategory.id, child.id)}
                className={
                  currentChildCategory === child.id
                    ? "child-category active"
                    : "child-category"
                }
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}