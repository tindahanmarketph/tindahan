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

import {
  SEARCH_CATEGORY_TREE
} from "../lib/categories";

import {
  BRAND_OPTIONS
} from "../lib/brands";

import {
  COLOR_FILTER_OPTIONS,
  CONDITION_FILTER_OPTIONS,
  MATERIAL_FILTER_OPTIONS,
  SIZE_FILTER_GROUPS,
  SORT_FILTER_OPTIONS,
  readMultiParam,
  writeMultiParam
} from "../lib/searchFilters";


/* =========================================================
   FILTER TITLES
========================================================= */

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


/* =========================================================
   HELPERS
========================================================= */

function toggleArrayValue(
  currentValues,
  value
) {
  if (
    currentValues.includes(value)
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

function normalizeCategorySelection(
  value = {}
) {
  return {
    category:
      value.category || "",

    subcategory:
      value.subcategory || "",

    child_category:
      value.child_category || ""
  };
}

function categorySelectionsMatch(
  first,
  second
) {
  const a =
    normalizeCategorySelection(first);

  const b =
    normalizeCategorySelection(second);

  return (
    a.category === b.category &&
    a.subcategory === b.subcategory &&
    a.child_category === b.child_category
  );
}

function getCategoryNodeByPath(
  path = []
) {
  let nodes =
    SEARCH_CATEGORY_TREE;

  let currentNode =
    null;

  for (
    const id of path
  ) {
    const nextNode =
      nodes.find(
        (item) =>
          item.id === id
      );

    if (!nextNode) {
      return null;
    }

    currentNode =
      nextNode;

    nodes =
      nextNode.children || [];
  }

  return currentNode;
}

function getCategoryDepth(
  path = []
) {
  return path.length;
}


/* =========================================================
   PAGE
========================================================= */

export default function SearchFilterPage() {
  const navigate =
    useNavigate();

  const { filterType } =
    useParams();

  const [searchParams] =
    useSearchParams();

  const searchKey =
    searchParams.toString();


  /* =======================================================
     GENERIC FILTER STATE
  ======================================================= */

  const [
    selectedValues,
    setSelectedValues
  ] = useState([]);


  /* =======================================================
     CATEGORY STATE
  ======================================================= */

  const [
    categorySelection,
    setCategorySelection
  ] = useState({
    category: "",
    subcategory: "",
    child_category: ""
  });

  const [
    categoryPath,
    setCategoryPath
  ] = useState([]);


  /* =======================================================
     PRICE
  ======================================================= */

  const [
    minimumPrice,
    setMinimumPrice
  ] = useState("");

  const [
    maximumPrice,
    setMaximumPrice
  ] = useState("");


  /* =======================================================
     SORT
  ======================================================= */

  const [
    selectedSort,
    setSelectedSort
  ] = useState(
    "newest"
  );


  /* =======================================================
     BRAND
  ======================================================= */

  const [
    brandSearch,
    setBrandSearch
  ] = useState("");


  /* =======================================================
     SIZE
  ======================================================= */

  const [
    sizeAudience,
    setSizeAudience
  ] = useState("");


  /* =======================================================
     LOAD CURRENT URL FILTERS
  ======================================================= */

  useEffect(() => {
    setBrandSearch("");
    setSizeAudience("");
    setCategoryPath([]);

    if (
      filterType ===
      "category"
    ) {
      setCategorySelection({
        category:
          searchParams.get(
            "category"
          ) || "",

        subcategory:
          searchParams.get(
            "subcategory"
          ) || "",

        child_category:
          searchParams.get(
            "child_category"
          ) || ""
      });

      return;
    }

    if (
      filterType ===
      "price"
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
      filterType ===
      "sort"
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
      ].includes(filterType)
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


  /* =======================================================
     BRAND RESULTS
  ======================================================= */

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


  /* =======================================================
     SIZE GROUP
  ======================================================= */

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


  /* =======================================================
     CURRENT CATEGORY NODE
  ======================================================= */

  const currentCategoryNode =
    useMemo(
      () =>
        getCategoryNodeByPath(
          categoryPath
        ),
      [
        categoryPath
      ]
    );


  /* =======================================================
     HEADER TITLE
  ======================================================= */

  const pageTitle =
    filterType ===
      "category" &&
    currentCategoryNode
      ? currentCategoryNode.label
      : FILTER_TITLES[
          filterType
        ];


  /* =======================================================
     FILTER VALIDATION
  ======================================================= */

  const validFilter =
    Boolean(
      FILTER_TITLES[
        filterType
      ]
    );


  /* =======================================================
     BACK
  ======================================================= */

  function handleBack() {
    if (
      filterType ===
        "category" &&
      categoryPath.length > 0
    ) {
      setCategoryPath(
        (current) =>
          current.slice(
            0,
            -1
          )
      );

      return;
    }

    if (
      filterType ===
        "size" &&
      sizeAudience
    ) {
      setSizeAudience("");

      return;
    }

    navigate(
      `/search/filters?${searchParams.toString()}`
    );
  }


  /* =======================================================
     CLEAR
  ======================================================= */

  function clearCurrentFilter() {
    if (
      filterType ===
      "category"
    ) {
      setCategorySelection({
        category: "",
        subcategory: "",
        child_category: ""
      });

      setCategoryPath([]);

      return;
    }

    if (
      filterType ===
      "price"
    ) {
      setMinimumPrice("");
      setMaximumPrice("");

      return;
    }

    if (
      filterType ===
      "sort"
    ) {
      setSelectedSort(
        "newest"
      );

      return;
    }

    setSelectedValues([]);
  }


  /* =======================================================
     APPLY
  ======================================================= */

  function applyFilter() {
    const nextParams =
      new URLSearchParams(
        searchParams
      );


    /* CATEGORY */

    if (
      filterType ===
      "category"
    ) {
      let effectiveSelection =
        normalizeCategorySelection(
          categorySelection
        );

      /*
       * If the user navigated inside a category but did not
       * explicitly tap "All", pressing Show results selects
       * the currently displayed category.
       */
      if (
        !effectiveSelection.category &&
        currentCategoryNode?.query
      ) {
        effectiveSelection =
          normalizeCategorySelection(
            currentCategoryNode.query
          );
      }

      if (
        effectiveSelection.category
      ) {
        nextParams.set(
          "category",
          effectiveSelection.category
        );
      } else {
        nextParams.delete(
          "category"
        );
      }

      if (
        effectiveSelection.subcategory
      ) {
        nextParams.set(
          "subcategory",
          effectiveSelection.subcategory
        );
      } else {
        nextParams.delete(
          "subcategory"
        );
      }

      if (
        effectiveSelection.child_category
      ) {
        nextParams.set(
          "child_category",
          effectiveSelection.child_category
        );
      } else {
        nextParams.delete(
          "child_category"
        );
      }
    }


    /* MULTI SELECT */

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


    /* PRICE */

    if (
      filterType ===
      "price"
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


    /* SORT */

    if (
      filterType ===
      "sort"
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


  /* =======================================================
     INVALID FILTER
  ======================================================= */

  if (!validFilter) {
    return (
      <main className="search-filter-screen">
        <header className="search-filter-header">
          <button
            type="button"
            className="search-filter-header-button"
            aria-label="Back"
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


  /* =======================================================
     PAGE
  ======================================================= */

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
          {pageTitle}
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
            categoryPath={
              categoryPath
            }
            setCategoryPath={
              setCategoryPath
            }
            currentNode={
              currentCategoryNode
            }
            categorySelection={
              categorySelection
            }
            setCategorySelection={
              setCategorySelection
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


/* =========================================================
   CATEGORY FILTER
========================================================= */

function CategoryFilter({
  categoryPath,
  setCategoryPath,
  currentNode,
  categorySelection,
  setCategorySelection
}) {
  const depth =
    getCategoryDepth(
      categoryPath
    );

  const options =
    currentNode
      ? currentNode.children || []
      : SEARCH_CATEGORY_TREE;

  const currentNodeSelected =
    currentNode?.query
      ? categorySelectionsMatch(
          categorySelection,
          currentNode.query
        )
      : false;

  function openNode(item) {
    if (
      item.children?.length
    ) {
      setCategoryPath(
        (current) => [
          ...current,
          item.id
        ]
      );

      return;
    }

    setCategorySelection(
      normalizeCategorySelection(
        item.query
      )
    );
  }

  return (
    <section className="search-filter-section search-category-section">
      {!currentNode && (
        <h2>
          Categories
        </h2>
      )}

      <div className="search-filter-category-list">
        {currentNode && (
          <button
            type="button"
            className={
              currentNodeSelected
                ? "search-category-all-option active"
                : "search-category-all-option"
            }
            onClick={() =>
              setCategorySelection(
                normalizeCategorySelection(
                  currentNode.query
                )
              )
            }
          >
            <span className="search-category-all-icon">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>

            <strong>
              All
            </strong>

            <span
              className={
                currentNodeSelected
                  ? "search-category-radio active"
                  : "search-category-radio"
              }
            >
              {currentNodeSelected && (
                <span />
              )}
            </span>
          </button>
        )}


        {options.map(
          (item) => {
            const hasChildren =
              Boolean(
                item.children?.length
              );

            const selected =
              categorySelectionsMatch(
                categorySelection,
                item.query
              );

            const isRoot =
              depth === 0;

            return (
              <button
                key={
                  item.id
                }
                type="button"
                className={[
                  "search-filter-category-option",
                  isRoot
                    ? "root"
                    : "nested",
                  selected
                    ? "active"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  openNode(item)
                }
              >
                {isRoot ? (
                  <span className="search-filter-category-icon">
                    {item.icon || "•"}
                  </span>
                ) : item.icon ? (
                  <span className="search-filter-category-icon">
                    {item.icon}
                  </span>
                ) : null}


                <strong>
                  {item.label}
                </strong>


                {hasChildren ? (
                  <ChevronRight
                    size={22}
                  />
                ) : (
                  <span
                    className={
                      selected
                        ? "search-category-radio active"
                        : "search-category-radio"
                    }
                  >
                    {selected && (
                      <span />
                    )}
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}


/* =========================================================
   SIZE
========================================================= */

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
                          (current) =>
                            toggleArrayValue(
                              current,
                              option.value
                            )
                        )
                      }
                    >
                      {option.label}
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


/* =========================================================
   BRAND
========================================================= */

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


/* =========================================================
   CONDITION
========================================================= */

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
                  {condition.label}
                </strong>

                <p>
                  {condition.description}
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


/* =========================================================
   COLOR
========================================================= */

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


/* =========================================================
   PRICE
========================================================= */

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


/* =========================================================
   MATERIAL
========================================================= */

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


/* =========================================================
   SORT
========================================================= */

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
                  {option.label}
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