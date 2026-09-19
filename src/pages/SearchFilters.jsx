import {
  ChevronRight,
  X
} from "lucide-react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";
import {
  clearAllSearchFilters,
  getFilterSummary
} from "../lib/searchFilters";

const FILTER_ROWS = [
  {
    id: "sort",
    label: "Sort by"
  },
  {
    id: "category",
    label: "Category"
  },
  {
    id: "size",
    label: "Size"
  },
  {
    id: "brand",
    label: "Brand"
  },
  {
    id: "condition",
    label: "Condition"
  },
  {
    id: "color",
    label: "Color"
  },
  {
    id: "price",
    label: "Price"
  },
  {
    id: "material",
    label: "Material"
  }
];

export default function SearchFilters() {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  function closeFilters() {
    navigate(
      `/?${searchParams.toString()}`
    );
  }

  function openFilter(filterType) {
    navigate(
      `/search/filter/${filterType}?${searchParams.toString()}`
    );
  }

  function clearEverything() {
    const nextParams =
      clearAllSearchFilters(
        searchParams
      );

    setSearchParams(
      nextParams,
      {
        replace: true
      }
    );
  }

  function showResults() {
    navigate(
      `/?${searchParams.toString()}`
    );
  }

  return (
    <main className="search-filter-screen">
      <header className="search-filter-header">
        <button
          type="button"
          className="search-filter-header-button"
          aria-label="Close filters"
          onClick={
            closeFilters
          }
        >
          <X size={25} />
        </button>

        <h1>
          Filter
        </h1>

        <button
          type="button"
          className="search-filter-clear-button"
          onClick={
            clearEverything
          }
        >
          Clear all
        </button>
      </header>

      <div className="search-filter-body search-filter-hub">
        {FILTER_ROWS.map(
          (filter, index) => (
            <div
              key={filter.id}
              className={
                index === 1 ||
                index === 3
                  ? "search-filter-row-wrap with-separator"
                  : "search-filter-row-wrap"
              }
            >
              <button
                type="button"
                className="search-filter-row"
                onClick={() =>
                  openFilter(
                    filter.id
                  )
                }
              >
                <strong>
                  {filter.label}
                </strong>

                <span className="search-filter-row-value">
                  {getFilterSummary(
                    filter.id,
                    searchParams
                  )}
                </span>

                <ChevronRight
                  size={22}
                />
              </button>
            </div>
          )
        )}
      </div>

      <footer className="search-filter-footer">
        <button
          type="button"
          className="search-filter-show-results"
          onClick={
            showResults
          }
        >
          Show results
        </button>
      </footer>
    </main>
  );
}