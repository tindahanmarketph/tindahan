import {
  ArrowLeft,
  Check,
  ChevronRight,
  Search
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState
} from "react";
import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { CATEGORIES } from "../lib/categories";
import { BRAND_OPTIONS } from "../lib/brands";
import {
  COLOR_FILTER_OPTIONS,
  CONDITION_FILTER_OPTIONS,
  MATERIAL_FILTER_OPTIONS,
  SIZE_FILTER_GROUPS,
  SORT_FILTER_OPTIONS,
  readMultiParam,
  writeMultiParam
} from "../lib/searchFilters";

const FILTER_TITLES = {
  category: "Category",
  size: "Size",
  brand: "Brand",
  condition: "Condition",
  color: "Color",
  price: "Price",
  material: "Material",
  sort: "Sort by"
};

function toggleArrayValue(
  currentValues,
  value
) {
  if (
    currentValues.includes(
      value
    )
  ) {
    return currentValues.filter(
      (item) =>
        item !== value
    );
  }

  return [
    ...currentValues,
    value
  ];
}

export default function SearchFilterPage() {
  const navigate =
    useNavigate();

  const { filterType } =
    useParams();

  const [searchParams] =
    useSearchParams();

  const searchKey =
    searchParams.toString();

  const [
    selectedValues,
    setSelectedValues
  ] = useState([]);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("");

  const [
    minimumPrice,
    setMinimumPrice
  ] = useState("");

  const [
    maximumPrice,
    setMaximumPrice
  ] = useState("");

  const [
    selectedSort,
    setSelectedSort
  ] = useState("newest");

  const [
    brandSearch,
    setBrandSearch
  ] = useState("");

  const [
    sizeAudience,
    setSizeAudience
  ] = useState("");

  useEffect(() => {
    setBrandSearch("");
    setSizeAudience("");

    if (
      filterType === "category"
    ) {
      setSelectedCategory(
        searchParams.get(
          "category"
        ) || ""
      );

      return;
    }

    if (
      filterType === "price"
    ) {
      setMinimumPrice(
        searchParams.get(
          "min_price"
        ) || ""
      );

      setMaximumPrice(
        searchParams.get(
          "max_price"
        ) || ""
      );

      return;
    }

    if (
      filterType === "sort"
    ) {
      setSelectedSort(
        searchParams.get(
          "sort"
        ) || "newest"
      );

      return;
    }

    if (
      [
        "size",
        "brand",
        "condition",
        "color",
        "material"
      ].includes(
        filterType
      )
    ) {
      setSelectedValues(
        readMultiParam(
          searchParams,
          filterType
        )
      );
    }
  }, [
    filterType,
    searchKey
  ]);

  const filteredBrands =
    useMemo(() => {
      const query =
        brandSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return BRAND_OPTIONS.slice(
          0,
          100
        );
      }

      return BRAND_OPTIONS.filter(
        (brand) =>
          brand
            .toLowerCase()
            .includes(query)
      ).slice(
        0,
        100
      );
    }, [
      brandSearch
    ]);

  const activeSizeGroup =
    useMemo(
      () =>
        SIZE_FILTER_GROUPS.find(
          (group) =>
            group.id ===
            sizeAudience
        ) || null,
      [
        sizeAudience
      ]
    );

  const validFilter =
    Boolean(
      FILTER_TITLES[
        filterType
      ]
    );

  function handleBack() {
    if (
      filterType === "size" &&
      sizeAudience
    ) {
      setSizeAudience("");
      return;
    }

    navigate(
      `/search/filters?${searchParams.toString()}`
    );
  }

  function clearCurrentFilter() {
    if (
      filterType === "category"
    ) {
      setSelectedCategory(
        ""
      );

      return;
    }

    if (
      filterType === "price"
    ) {
      setMinimumPrice("");
      setMaximumPrice("");
      return;
    }

    if (
      filterType === "sort"
    ) {
      setSelectedSort(
        "newest"
      );

      return;
    }

    setSelectedValues([]);
  }

  function applyFilter() {
    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (
      filterType === "category"
    ) {
      if (
        selectedCategory
      ) {
        nextParams.set(
          "category",
          selectedCategory
        );
      } else {
        nextParams.delete(
          "category"
        );
      }

      nextParams.delete(
        "subcategory"
      );

      nextParams.delete(
        "child_category"
      );
    }

    if (
      [
        "size",
        "brand",
        "condition",
        "color",
        "material"
      ].includes(
        filterType
      )
    ) {
      writeMultiParam(
        nextParams,
        filterType,
        selectedValues
      );
    }

    if (
      filterType === "price"
    ) {
      const cleanMinimum =
        String(
          minimumPrice || ""
        ).trim();

      const cleanMaximum =
        String(
          maximumPrice || ""
        ).trim();

      if (cleanMinimum) {
        nextParams.set(
          "min_price",
          cleanMinimum
        );
      } else {
        nextParams.delete(
          "min_price"
        );
      }

      if (cleanMaximum) {
        nextParams.set(
          "max_price",
          cleanMaximum
        );
      } else {
        nextParams.delete(
          "max_price"
        );
      }
    }

    if (
      filterType === "sort"
    ) {
      if (
        selectedSort &&
        selectedSort !==
          "newest"
      ) {
        nextParams.set(
          "sort",
          selectedSort
        );
      } else {
        nextParams.delete(
          "sort"
        );
      }
    }

    navigate(
      `/?${nextParams.toString()}`
    );
  }

  if (!validFilter) {
    return (
      <main className="search-filter-screen">
        <header className="search-filter-header">
          <button
            type="button"
            className="search-filter-header-button"
            onClick={() =>
              navigate(
                `/search/filters?${searchParams.toString()}`
              )
            }
          >
            <ArrowLeft
              size={25}
            />
          </button>

          <h1>
            Filter
          </h1>

          <span />
        </header>

        <div className="search-filter-body">
          <div className="search-filter-empty">
            This filter does not exist.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="search-filter-screen">
      <header className="search-filter-header">
        <button
          type="button"
          className="search-filter-header-button"
          aria-label="Back"
          onClick={
            handleBack
          }
        >
          <ArrowLeft
            size={25}
          />
        </button>

        <h1>
          {
            FILTER_TITLES[
              filterType
            ]
          }
        </h1>

        <button
          type="button"
          className="search-filter-clear-button"
          onClick={
            clearCurrentFilter
          }
        >
          Clear
        </button>
      </header>

      <div className="search-filter-body">
        {filterType ===
          "category" && (
          <CategoryFilter
            selectedCategory={
              selectedCategory
            }
            setSelectedCategory={
              setSelectedCategory
            }
          />
        )}

        {filterType ===
          "size" && (
          <SizeFilter
            activeSizeGroup={
              activeSizeGroup
            }
            sizeAudience={
              sizeAudience
            }
            setSizeAudience={
              setSizeAudience
            }
            selectedValues={
              selectedValues
            }
            setSelectedValues={
              setSelectedValues
            }
          />
        )}

        {filterType ===
          "brand" && (
          <BrandFilter
            search={
              brandSearch
            }
            setSearch={
              setBrandSearch
            }
            brands={
              filteredBrands
            }
            selectedValues={
              selectedValues
            }
            setSelectedValues={
              setSelectedValues
            }
          />
        )}

        {filterType ===
          "condition" && (
          <ConditionFilter
            selectedValues={
              selectedValues
            }
            setSelectedValues={
              setSelectedValues
            }
          />
        )}

        {filterType ===
          "color" && (
          <ColorFilter
            selectedValues={
              selectedValues
            }
            setSelectedValues={
              setSelectedValues
            }
          />
        )}

        {filterType ===
          "price" && (
          <PriceFilter
            minimumPrice={
              minimumPrice
            }
            maximumPrice={
              maximumPrice
            }
            setMinimumPrice={
              setMinimumPrice
            }
            setMaximumPrice={
              setMaximumPrice
            }
          />
        )}

        {filterType ===
          "material" && (
          <MaterialFilter
            selectedValues={
              selectedValues
            }
            setSelectedValues={
              setSelectedValues
            }
          />
        )}

        {filterType ===
          "sort" && (
          <SortFilter
            selectedSort={
              selectedSort
            }
            setSelectedSort={
              setSelectedSort
            }
          />
        )}
      </div>

      <footer className="search-filter-footer">
        <button
          type="button"
          className="search-filter-show-results"
          onClick={
            applyFilter
          }
        >
          Show results
        </button>
      </footer>
    </main>
  );
}

function CategoryFilter({
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <section className="search-filter-section">
      <h2>
        Categories
      </h2>

      <div className="search-filter-category-list">
        {CATEGORIES.map(
          (category) => {
            const selected =
              selectedCategory ===
              category.id;

            return (
              <button
                key={
                  category.id
                }
                type="button"
                className={
                  selected
                    ? "search-filter-category-option active"
                    : "search-filter-category-option"
                }
                onClick={() =>
                  setSelectedCategory(
                    selected
                      ? ""
                      : category.id
                  )
                }
              >
                <span className="search-filter-category-icon">
                  {
                    category.icon
                  }
                </span>

                <strong>
                  {
                    category.label
                  }
                </strong>

                {selected ? (
                  <Check
                    size={21}
                  />
                ) : (
                  <ChevronRight
                    size={21}
                  />
                )}
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function SizeFilter({
  activeSizeGroup,
  sizeAudience,
  setSizeAudience,
  selectedValues,
  setSelectedValues
}) {
  if (!sizeAudience) {
    return (
      <section className="search-filter-section">
        <h2>
          Choose a size category
        </h2>

        <div className="search-size-audience-list">
          {SIZE_FILTER_GROUPS.map(
            (group) => (
              <button
                key={
                  group.id
                }
                type="button"
                className="search-size-audience-option"
                onClick={() =>
                  setSizeAudience(
                    group.id
                  )
                }
              >
                <strong>
                  {group.label}
                </strong>

                <ChevronRight
                  size={23}
                />
              </button>
            )
          )}
        </div>
      </section>
    );
  }

  if (!activeSizeGroup) {
    return null;
  }

  return (
    <section className="search-filter-section">
      {activeSizeGroup.sections.map(
        (section) => (
          <div
            className="search-size-section"
            key={
              section.title
            }
          >
            <h2>
              {section.title}
            </h2>

            <div className="search-size-grid">
              {section.options.map(
                (option) => {
                  const active =
                    selectedValues.includes(
                      option.value
                    );

                  return (
                    <button
                      key={`${section.title}-${option.value}`}
                      type="button"
                      className={
                        active
                          ? "search-size-option active"
                          : "search-size-option"
                      }
                      onClick={() =>
                        setSelectedValues(
                          (
                            current
                          ) =>
                            toggleArrayValue(
                              current,
                              option.value
                            )
                        )
                      }
                    >
                      {
                        option.label
                      }
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )
      )}
    </section>
  );
}

function BrandFilter({
  search,
  setSearch,
  brands,
  selectedValues,
  setSelectedValues
}) {
  return (
    <section className="search-filter-section">
      <div className="search-brand-search">
        <Search
          size={20}
        />

        <input
          type="text"
          value={search}
          placeholder="Search brands"
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      <div className="search-filter-checkbox-list">
        {brands.map(
          (brand) => {
            const active =
              selectedValues.includes(
                brand
              );

            return (
              <button
                key={brand}
                type="button"
                className="search-checkbox-row"
                onClick={() =>
                  setSelectedValues(
                    (current) =>
                      toggleArrayValue(
                        current,
                        brand
                      )
                  )
                }
              >
                <strong>
                  {brand}
                </strong>

                <span
                  className={
                    active
                      ? "search-checkbox active"
                      : "search-checkbox"
                  }
                >
                  {active && (
                    <Check
                      size={16}
                    />
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function ConditionFilter({
  selectedValues,
  setSelectedValues
}) {
  return (
    <section className="search-filter-section condition-filter-section">
      {CONDITION_FILTER_OPTIONS.map(
        (condition) => {
          const active =
            selectedValues.includes(
              condition.value
            );

          return (
            <button
              type="button"
              className="search-condition-row"
              key={
                condition.value
              }
              onClick={() =>
                setSelectedValues(
                  (current) =>
                    toggleArrayValue(
                      current,
                      condition.value
                    )
                )
              }
            >
              <div>
                <strong>
                  {
                    condition.label
                  }
                </strong>

                <p>
                  {
                    condition.description
                  }
                </p>
              </div>

              <span
                className={
                  active
                    ? "search-checkbox active"
                    : "search-checkbox"
                }
              >
                {active && (
                  <Check
                    size={16}
                  />
                )}
              </span>
            </button>
          );
        }
      )}
    </section>
  );
}

function ColorFilter({
  selectedValues,
  setSelectedValues
}) {
  return (
    <section className="search-filter-section">
      <div className="search-color-grid">
        {COLOR_FILTER_OPTIONS.map(
          (color) => {
            const active =
              selectedValues.includes(
                color.value
              );

            return (
              <button
                type="button"
                key={
                  color.value
                }
                className={
                  active
                    ? "search-color-option active"
                    : "search-color-option"
                }
                onClick={() =>
                  setSelectedValues(
                    (current) =>
                      toggleArrayValue(
                        current,
                        color.value
                      )
                  )
                }
              >
                <span
                  className="search-color-circle"
                  style={{
                    background:
                      color.color
                  }}
                >
                  {active && (
                    <Check
                      size={21}
                    />
                  )}
                </span>

                <span>
                  {color.label}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function PriceFilter({
  minimumPrice,
  maximumPrice,
  setMinimumPrice,
  setMaximumPrice
}) {
  return (
    <section className="search-filter-section">
      <div className="search-price-grid">
        <label>
          <span>
            Minimum
          </span>

          <div className="search-price-input">
            <span>
              ₱
            </span>

            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={
                minimumPrice
              }
              onChange={(event) =>
                setMinimumPrice(
                  event.target.value
                )
              }
            />
          </div>
        </label>

        <label>
          <span>
            Maximum
          </span>

          <div className="search-price-input">
            <span>
              ₱
            </span>

            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={
                maximumPrice
              }
              onChange={(event) =>
                setMaximumPrice(
                  event.target.value
                )
              }
            />
          </div>
        </label>
      </div>
    </section>
  );
}

function MaterialFilter({
  selectedValues,
  setSelectedValues
}) {
  return (
    <section className="search-filter-section">
      <div className="search-filter-checkbox-list">
        {MATERIAL_FILTER_OPTIONS.map(
          (material) => {
            const active =
              selectedValues.includes(
                material
              );

            return (
              <button
                key={
                  material
                }
                type="button"
                className="search-checkbox-row"
                onClick={() =>
                  setSelectedValues(
                    (current) =>
                      toggleArrayValue(
                        current,
                        material
                      )
                  )
                }
              >
                <strong>
                  {material}
                </strong>

                <span
                  className={
                    active
                      ? "search-checkbox active"
                      : "search-checkbox"
                  }
                >
                  {active && (
                    <Check
                      size={16}
                    />
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function SortFilter({
  selectedSort,
  setSelectedSort
}) {
  return (
    <section className="search-filter-section">
      <div className="search-filter-checkbox-list">
        {SORT_FILTER_OPTIONS.map(
          (option) => {
            const active =
              selectedSort ===
              option.value;

            return (
              <button
                key={
                  option.value
                }
                type="button"
                className="search-checkbox-row"
                onClick={() =>
                  setSelectedSort(
                    option.value
                  )
                }
              >
                <strong>
                  {
                    option.label
                  }
                </strong>

                <span
                  className={
                    active
                      ? "search-radio active"
                      : "search-radio"
                  }
                >
                  {active && (
                    <span />
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}