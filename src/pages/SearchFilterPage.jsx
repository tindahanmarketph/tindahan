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
  CATEGORIES,
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

import "./SearchFilterPage.css";


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


function createCategoryFilterTree() {
  return CATEGORIES.map((category) => {
    const detailedCategory =
      SEARCH_CATEGORY_TREE?.find(
        (item) => item.id === category.id
      );

    if (
      detailedCategory?.children?.length
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
            icon:
              subcategory.icon || null,
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


function findCategoryNodeById(nodes, targetId) {
  if (!targetId) {
    return null;
  }

  for (const node of nodes || []) {
    if (node.id === targetId) {
      return node;
    }

    if (node.children?.length) {
      const found =
        findCategoryNodeById(
          node.children,
          targetId
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
}


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
      const found =
        findCategoryNodePath(
          node.children,
          targetId,
          nextPath
        );

      if (found.length) {
        return found;
      }
    }
  }

  return [];
}


function getSelectableLeafIds(node) {
  if (!node) {
    return [];
  }

  if (!node.children?.length) {
    return [node.id];
  }

  return node.children.flatMap(
    (child) =>
      getSelectableLeafIds(child)
  );
}


function getInitialCategoryState(searchParams) {
  const selectedChildren =
    readMultiParam(
      searchParams,
      "child_category"
    );

  const subcategory =
    searchParams.get(
      "subcategory"
    ) || "";

  const category =
    searchParams.get(
      "category"
    ) || "";

  const scopeId =
    subcategory || category;

  if (selectedChildren.length) {
    return {
      selectedIds:
        selectedChildren,
      scopeId
    };
  }

  if (scopeId) {
    const scopeNode =
      findCategoryNodeById(
        CATEGORY_FILTER_TREE,
        scopeId
      );

    if (scopeNode) {
      return {
        selectedIds:
          getSelectableLeafIds(
            scopeNode
          ),
        scopeId
      };
    }
  }

  return {
    selectedIds: [],
    scopeId: ""
  };
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


  /*
   * Standard multi-choice filters:
   * size / brand / condition / color / material
   */
  const [
    selectedValues,
    setSelectedValues
  ] = useState([]);


  /*
   * CATEGORY
   *
   * selectedCategoryNodeIds:
   * actual checked final options.
   *
   * categoryNavigation:
   * menu currently displayed.
   *
   * categorySelectionScopeId:
   * parent category under which the checked
   * items belong.
   *
   * Navigation and selection are completely
   * separated.
   */
  const [
    selectedCategoryNodeIds,
    setSelectedCategoryNodeIds
  ] = useState([]);

  const [
    categoryNavigation,
    setCategoryNavigation
  ] = useState([]);

  const [
    categorySelectionScopeId,
    setCategorySelectionScopeId
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
      const initial =
        getInitialCategoryState(
          searchParams
        );

      setSelectedCategoryNodeIds(
        initial.selectedIds
      );

      setCategorySelectionScopeId(
        initial.scopeId
      );

      /*
       * Always reopen the category
       * browser at root.
       */
      setCategoryNavigation([]);

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


  const currentCategoryNode =
    useMemo(() => {
      if (
        categoryNavigation.length === 0
      ) {
        return null;
      }

      const nodeId =
        categoryNavigation[
          categoryNavigation.length - 1
        ];

      return findCategoryNodeById(
        CATEGORY_FILTER_TREE,
        nodeId
      );
    }, [
      categoryNavigation
    ]);


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


  function openCategoryNode(nodeId) {
    setCategoryNavigation(
      (current) => [
        ...current,
        nodeId
      ]
    );
  }


  function toggleCategoryLeaf(
    nodeId,
    scopeNodeId
  ) {
    /*
     * Entering another category branch and
     * selecting something there starts a
     * new category selection.
     */
    if (
      categorySelectionScopeId !==
      scopeNodeId
    ) {
      setCategorySelectionScopeId(
        scopeNodeId
      );

      setSelectedCategoryNodeIds([
        nodeId
      ]);

      return;
    }

    setSelectedCategoryNodeIds(
      (current) =>
        toggleArrayValue(
          current,
          nodeId
        )
    );
  }


  function toggleAllCategoryLeaves(
    scopeNode
  ) {
    if (!scopeNode) {
      return;
    }

    const allIds =
      getSelectableLeafIds(
        scopeNode
      );

    if (!allIds.length) {
      return;
    }

    const everythingSelected =
      categorySelectionScopeId ===
        scopeNode.id &&
      allIds.every(
        (id) =>
          selectedCategoryNodeIds.includes(
            id
          )
      );

    setCategorySelectionScopeId(
      scopeNode.id
    );

    if (everythingSelected) {
      setSelectedCategoryNodeIds(
        []
      );

      return;
    }

    /*
     * ALL = literally check everything.
     */
    setSelectedCategoryNodeIds(
      allIds
    );
  }


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


  function clearCurrentFilter() {
    if (
      filterType === "category"
    ) {
      setSelectedCategoryNodeIds(
        []
      );

      setCategorySelectionScopeId(
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


  function applyCategoryFilter(
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
      !categorySelectionScopeId ||
      selectedCategoryNodeIds.length === 0
    ) {
      return;
    }

    const scopePath =
      findCategoryNodePath(
        CATEGORY_FILTER_TREE,
        categorySelectionScopeId
      );

    if (!scopePath.length) {
      return;
    }

    /*
     * Example:
     *
     * Men
     *   -> Clothing
     *      -> Jeans
     *      -> Shorts
     *
     * category = men
     * subcategory = men_clothing
     * child_category = jeans
     * child_category = shorts
     */

    if (scopePath[0]) {
      nextParams.set(
        "category",
        scopePath[0].id
      );
    }

    if (scopePath[1]) {
      nextParams.set(
        "subcategory",
        scopePath[1].id
      );
    }

    writeMultiParam(
      nextParams,
      "child_category",
      selectedCategoryNodeIds
    );
  }


  function applyFilter() {
    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (
      filterType === "category"
    ) {
      applyCategoryFilter(
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
      ].includes(filterType)
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
        selectedSort !== "newest"
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
            aria-label="Back"
            onClick={() =>
              navigate(
                `/search/filters?${searchParams.toString()}`
              )
            }
          >
            <ArrowLeft size={25} />
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
    <main
      className={
        filterType === "category"
          ? "search-filter-screen category-multiselect-screen"
          : "search-filter-screen"
      }
    >
      <header className="search-filter-header">
        <button
          type="button"
          className="search-filter-header-button"
          aria-label="Back"
          onClick={handleBack}
        >
          <ArrowLeft size={25} />
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
            selectedNodeIds={
              selectedCategoryNodeIds
            }
            selectionScopeId={
              categorySelectionScopeId
            }
            onOpenNode={
              openCategoryNode
            }
            onToggleLeaf={
              toggleCategoryLeaf
            }
            onToggleAll={
              toggleAllCategoryLeaves
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
   CATEGORY
========================================================= */

function CategoryFilter({
  currentNode,
  rootNodes,
  selectedNodeIds,
  selectionScopeId,
  onOpenNode,
  onToggleLeaf,
  onToggleAll
}) {
  /*
   * ROOT CATEGORY PAGE
   */
  if (!currentNode) {
    return (
      <section className="search-filter-section">
        <h2>
          Categories
        </h2>

        <div className="search-filter-category-list search-category-root-list">
          {rootNodes.map(
            (category) => {
              const hasChildren =
                Boolean(
                  category
                    .children
                    ?.length
                );

              return (
                <button
                  key={
                    category.id
                  }
                  type="button"
                  className="search-filter-category-option search-category-navigation-row search-category-with-icon"
                  onClick={() => {
                    if (
                      hasChildren
                    ) {
                      onOpenNode(
                        category.id
                      );
                    }
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

                  <ChevronRight
                    size={22}
                  />
                </button>
              );
            }
          )}
        </div>
      </section>
    );
  }


  const allLeafIds =
    getSelectableLeafIds(
      currentNode
    );

  const selectedInsideCurrentScope =
    selectionScopeId ===
    currentNode.id;

  const selectedCount =
    selectedInsideCurrentScope
      ? allLeafIds.filter(
          (id) =>
            selectedNodeIds.includes(
              id
            )
        ).length
      : 0;

  const allSelected =
    allLeafIds.length > 0 &&
    selectedCount ===
      allLeafIds.length;

  const partiallySelected =
    selectedCount > 0 &&
    !allSelected;


  return (
    <section className="search-filter-section">
      <div className="search-filter-category-list search-category-nested-list">

        <button
          type="button"
          className={
            allSelected
              ? "search-filter-category-option search-category-selectable-row search-category-all-row active"
              : "search-filter-category-option search-category-selectable-row search-category-all-row"
          }
          onClick={() =>
            onToggleAll(
              currentNode
            )
          }
        >
          <strong>
            All
          </strong>

          <CategoryCheckbox
            active={
              allSelected
            }
            partial={
              partiallySelected
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

            if (hasChildren) {
              return (
                <button
                  key={
                    child.id
                  }
                  type="button"
                  className={
                    child.icon
                      ? "search-filter-category-option search-category-navigation-row search-category-with-icon"
                      : "search-filter-category-option search-category-navigation-row"
                  }
                  onClick={() =>
                    onOpenNode(
                      child.id
                    )
                  }
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

                  <ChevronRight
                    size={22}
                  />
                </button>
              );
            }


            const active =
              selectedInsideCurrentScope &&
              selectedNodeIds.includes(
                child.id
              );

            return (
              <button
                key={
                  child.id
                }
                type="button"
                className={
                  active
                    ? "search-filter-category-option search-category-selectable-row active"
                    : "search-filter-category-option search-category-selectable-row"
                }
                onClick={() =>
                  onToggleLeaf(
                    child.id,
                    currentNode.id
                  )
                }
              >
                <strong>
                  {
                    child.label
                  }
                </strong>

                <CategoryCheckbox
                  active={
                    active
                  }
                />
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}


function CategoryCheckbox({
  active,
  partial = false
}) {
  return (
    <span
      className={[
        "search-category-checkbox",
        active
          ? "active"
          : "",
        partial
          ? "partial"
          : ""
      ]
        .filter(Boolean)
        .join(" ")
      }
      aria-hidden="true"
    >
      {active && (
        <Check
          size={18}
          strokeWidth={3}
        />
      )}

      {!active &&
        partial && (
          <span className="search-category-checkbox-dash" />
        )}
    </span>
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