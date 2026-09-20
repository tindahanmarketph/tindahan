import {
  ArrowLeft,
  Check,
  ChevronRight,
  Grip,
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
  CATEGORIES,
  SEARCH_CATEGORY_TREE
} from "../lib/categories";

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
   GENERIC HELPERS
========================================================= */

function toggleArrayValue(currentValues, value) {
  if (currentValues.includes(value)) {
    return currentValues.filter(
      (item) => item !== value
    );
  }

  return [
    ...currentValues,
    value
  ];
}


/* =========================================================
   CATEGORY TREE
========================================================= */

function createCategoryFilterTree() {
  return CATEGORIES.map((category) => {
    const detailedCategory =
      SEARCH_CATEGORY_TREE.find(
        (item) =>
          item.id === category.id
      );

    /*
      Women / Men / Designer use the detailed tree.

      Other categories continue using the normal
      CATEGORIES structure until we develop them.
    */
    if (
      detailedCategory &&
      detailedCategory.children?.length
    ) {
      return detailedCategory;
    }

    return {
      id: category.id,
      label: category.label,
      icon: category.icon,

      children:
        category.subcategories?.map(
          (subcategory) => ({
            id: subcategory.id,
            label: subcategory.label,
            icon: subcategory.icon || null,

            children:
              subcategory.children?.map(
                (child) => ({
                  ...child,
                  children:
                    child.children || []
                })
              ) || []
          })
        ) || []
    };
  });
}


const CATEGORY_FILTER_TREE =
  createCategoryFilterTree();


function findCategoryNodePath(
  nodes,
  targetId,
  currentPath = []
) {
  if (!targetId) {
    return [];
  }

  for (const node of nodes || []) {
    const nextPath = [
      ...currentPath,
      node
    ];

    if (node.id === targetId) {
      return nextPath;
    }

    if (node.children?.length) {
      const result =
        findCategoryNodePath(
          node.children,
          targetId,
          nextPath
        );

      if (result.length) {
        return result;
      }
    }
  }

  return [];
}


function findCategoryNodeById(
  nodes,
  targetId
) {
  if (!targetId) {
    return null;
  }

  for (const node of nodes || []) {
    if (node.id === targetId) {
      return node;
    }

    if (node.children?.length) {
      const result =
        findCategoryNodeById(
          node.children,
          targetId
        );

      if (result) {
        return result;
      }
    }
  }

  return null;
}


function getInitialCategorySelection(
  searchParams
) {
  const childCategory =
    searchParams.get(
      "child_category"
    );

  const subcategory =
    searchParams.get(
      "subcategory"
    );

  const category =
    searchParams.get(
      "category"
    );

  /*
    Existing applied filter may be remembered.

    IMPORTANT:
    this does NOT control navigation.

    Therefore opening Men > Clothing does not
    automatically select Jeans, Shirts, etc.
  */

  if (
    childCategory &&
    findCategoryNodeById(
      CATEGORY_FILTER_TREE,
      childCategory
    )
  ) {
    return childCategory;
  }

  if (
    subcategory &&
    findCategoryNodeById(
      CATEGORY_FILTER_TREE,
      subcategory
    )
  ) {
    return subcategory;
  }

  if (
    category &&
    findCategoryNodeById(
      CATEGORY_FILTER_TREE,
      category
    )
  ) {
    return category;
  }

  return "";
}


/* =========================================================
   MAIN PAGE
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
     STANDARD MULTI FILTERS
  ======================================================= */

  const [
    selectedValues,
    setSelectedValues
  ] = useState([]);


  /* =======================================================
     CATEGORY
  ======================================================= */

  /*
    selectedCategoryNodeId =
    the category/subcategory actually selected
    for filtering.

    categoryNavigation =
    where the user currently is in the menu.

    These two states are intentionally separated.
  */

  const [
    selectedCategoryNodeId,
    setSelectedCategoryNodeId
  ] = useState("");

  const [
    categoryNavigation,
    setCategoryNavigation
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
  ] = useState("newest");


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
     READ CURRENT URL FILTERS
  ======================================================= */

  useEffect(() => {
    setBrandSearch("");
    setSizeAudience("");

    /*
      Always reopen the Category filter
      from the root.

      Navigation is NEVER inferred from
      the selected category.
    */
    setCategoryNavigation([]);

    if (filterType === "category") {
      setSelectedCategoryNodeId(
        getInitialCategorySelection(
          searchParams
        )
      );

      return;
    }

    if (filterType === "price") {
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

    if (filterType === "sort") {
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
     BRANDS
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
     CURRENT CATEGORY PAGE
  ======================================================= */

  const currentCategoryNode =
    useMemo(() => {
      if (
        categoryNavigation.length === 0
      ) {
        return null;
      }

      const currentNodeId =
        categoryNavigation[
          categoryNavigation.length - 1
        ];

      return findCategoryNodeById(
        CATEGORY_FILTER_TREE,
        currentNodeId
      );
    }, [
      categoryNavigation
    ]);


  /* =======================================================
     HEADER TITLE
  ======================================================= */

  const currentHeaderTitle =
    useMemo(() => {
      if (
        filterType === "category" &&
        currentCategoryNode
      ) {
        return currentCategoryNode.label;
      }

      return (
        FILTER_TITLES[
          filterType
        ] || "Filter"
      );
    }, [
      filterType,
      currentCategoryNode
    ]);


  const validFilter =
    Boolean(
      FILTER_TITLES[
        filterType
      ]
    );


  /* =======================================================
     CATEGORY NAVIGATION
  ======================================================= */

  function openCategoryNode(nodeId) {
    /*
      CRITICAL FIX:

      Opening a category only changes
      navigation.

      It DOES NOT select anything.
    */

    setCategoryNavigation(
      (current) => [
        ...current,
        nodeId
      ]
    );
  }


  function selectCategoryNode(nodeId) {
    /*
      Selection only happens after
      an explicit click on:
      - All
      - a final category
    */

    setSelectedCategoryNodeId(
      (current) =>
        current === nodeId
          ? ""
          : nodeId
    );
  }


  /* =======================================================
     BACK
  ======================================================= */

  function handleBack() {
    if (
      filterType === "category" &&
      categoryNavigation.length > 0
    ) {
      setCategoryNavigation(
        (current) =>
          current.slice(
            0,
            -1
          )
      );

      return;
    }

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


  /* =======================================================
     CLEAR CURRENT FILTER
  ======================================================= */

  function clearCurrentFilter() {
    if (
      filterType === "category"
    ) {
      /*
        Clear selection only.
        Keep current navigation screen.
      */

      setSelectedCategoryNodeId(
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


  /* =======================================================
     APPLY CATEGORY FILTER
  ======================================================= */

  function applyCategorySelection(
    nextParams
  ) {
    nextParams.delete(
      "category"
    );

    nextParams.delete(
      "subcategory"
    );

    nextParams.delete(
      "child_category"
    );

    if (
      !selectedCategoryNodeId
    ) {
      return;
    }

    const selectedPath =
      findCategoryNodePath(
        CATEGORY_FILTER_TREE,
        selectedCategoryNodeId
      );

    if (
      selectedPath.length === 0
    ) {
      return;
    }

    /*
      First level:
      Women / Men / Designer / etc.
    */

    if (selectedPath[0]) {
      nextParams.set(
        "category",
        selectedPath[0].id
      );
    }

    /*
      Second level:
      Clothing / Shoes / Bags / etc.
    */

    if (selectedPath[1]) {
      nextParams.set(
        "subcategory",
        selectedPath[1].id
      );
    }

    /*
      Third level or deeper.

      Supabase currently uses one
      child_category field, therefore
      we save the final selected node.
    */

    if (selectedPath.length >= 3) {
      nextParams.set(
        "child_category",
        selectedPath[
          selectedPath.length - 1
        ].id
      );
    }
  }


  /* =======================================================
     APPLY FILTER
  ======================================================= */

  function applyFilter() {
    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (
      filterType === "category"
    ) {
      applyCategorySelection(
        nextParams
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
          {currentHeaderTitle}
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
            currentNode={
              currentCategoryNode
            }
            rootNodes={
              CATEGORY_FILTER_TREE
            }
            selectedNodeId={
              selectedCategoryNodeId
            }
            onOpenNode={
              openCategoryNode
            }
            onSelectNode={
              selectCategoryNode
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
  currentNode,
  rootNodes,
  selectedNodeId,
  onOpenNode,
  onSelectNode
}) {
  /*
    ROOT:
    Women
    Men
    Kids
    Designer
    ...

    No selection occurs here when a
    category contains children.
  */

  if (!currentNode) {
    return (
      <section className="search-filter-section">
        <h2>
          Categories
        </h2>

        <div className="search-filter-category-list">
          {rootNodes.map(
            (category) => {
              const hasChildren =
                Boolean(
                  category
                    .children
                    ?.length
                );

              const selected =
                !hasChildren &&
                selectedNodeId ===
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
                  onClick={() => {
                    if (
                      hasChildren
                    ) {
                      onOpenNode(
                        category.id
                      );

                      return;
                    }

                    onSelectNode(
                      category.id
                    );
                  }}
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

                  {hasChildren ? (
                    <ChevronRight
                      size={22}
                    />
                  ) : (
                    <CategoryRadio
                      active={
                        selected
                      }
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


  /*
    INSIDE A CATEGORY:

    Example:
    Men
      All
      Clothing >
      Shoes >
      Bags >
      Accessories >
      Grooming >

    Clicking Clothing ONLY opens Clothing.
    It does not select it automatically.
  */

  return (
    <section className="search-filter-section">
      <div className="search-filter-category-list">
        <button
          type="button"
          className={
            selectedNodeId ===
            currentNode.id
              ? "search-filter-category-option active"
              : "search-filter-category-option"
          }
          onClick={() =>
            onSelectNode(
              currentNode.id
            )
          }
        >
          <span className="search-filter-category-icon">
            <Grip
              size={23}
            />
          </span>

          <strong>
            All
          </strong>

          <CategoryRadio
            active={
              selectedNodeId ===
              currentNode.id
            }
          />
        </button>


        {currentNode.children?.map(
          (child) => {
            const hasChildren =
              Boolean(
                child
                  .children
                  ?.length
              );

            /*
              IMPORTANT:
              A navigable row is NEVER
              automatically marked active.

              Only a terminal explicitly
              selected option becomes active.
            */

            const selected =
              !hasChildren &&
              selectedNodeId ===
                child.id;

            return (
              <button
                key={
                  child.id
                }
                type="button"
                className={
                  selected
                    ? "search-filter-category-option active"
                    : "search-filter-category-option"
                }
                onClick={() => {
                  if (
                    hasChildren
                  ) {
                    onOpenNode(
                      child.id
                    );

                    return;
                  }

                  onSelectNode(
                    child.id
                  );
                }}
              >
                {child.icon && (
                  <span className="search-filter-category-icon">
                    {
                      child.icon
                    }
                  </span>
                )}

                <strong>
                  {
                    child.label
                  }
                </strong>

                {hasChildren ? (
                  <ChevronRight
                    size={22}
                  />
                ) : (
                  <CategoryRadio
                    active={
                      selected
                    }
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


/* =========================================================
   CATEGORY RADIO
========================================================= */

function CategoryRadio({
  active
}) {
  return (
    <span
      className={
        active
          ? "search-radio active"
          : "search-radio"
      }
      aria-hidden="true"
    >
      {active && (
        <span />
      )}
    </span>
  );
}


/* =========================================================
   SIZE FILTER
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
                  {
                    group.label
                  }
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
              {
                section.title
              }
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


/* =========================================================
   BRAND FILTER
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
   CONDITION FILTER
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


/* =========================================================
   COLOR FILTER
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
                  {
                    color.label
                  }
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
   PRICE FILTER
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
   MATERIAL FILTER
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
   SORT FILTER
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