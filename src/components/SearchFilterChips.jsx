import {
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";
import {
  countActiveSearchFilters,
  getFilterSummary,
  readMultiParam
} from "../lib/searchFilters";

const CHIP_FILTERS = [
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
  },
  {
    id: "sort",
    label: "Sort"
  }
];

function isFilterActive(
  filterType,
  searchParams
) {
  if (filterType === "size") {
    return (
      readMultiParam(
        searchParams,
        "size"
      ).length > 0
    );
  }

  if (filterType === "brand") {
    return (
      readMultiParam(
        searchParams,
        "brand"
      ).length > 0
    );
  }

  if (filterType === "condition") {
    return (
      readMultiParam(
        searchParams,
        "condition"
      ).length > 0
    );
  }

  if (filterType === "color") {
    return (
      readMultiParam(
        searchParams,
        "color"
      ).length > 0
    );
  }

  if (filterType === "material") {
    return (
      readMultiParam(
        searchParams,
        "material"
      ).length > 0
    );
  }

  if (filterType === "price") {
    return Boolean(
      searchParams.get("min_price") ||
        searchParams.get("max_price")
    );
  }

  if (filterType === "sort") {
    const sort =
      searchParams.get("sort");

    return Boolean(
      sort &&
        sort !== "newest"
    );
  }

  return false;
}

export default function SearchFilterChips() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const activeCount =
    countActiveSearchFilters(
      searchParams
    );

  function openAllFilters() {
    navigate(
      `/search/filters?${searchParams.toString()}`
    );
  }

  function openFilter(filterType) {
    navigate(
      `/search/filter/${filterType}?${searchParams.toString()}`
    );
  }

  return (
    <section
      className="search-filter-chips-shell"
      aria-label="Search filters"
    >
      <div className="search-filter-chips">
        <button
          type="button"
          className={
            activeCount > 0
              ? "search-filter-chip filter-main active"
              : "search-filter-chip filter-main"
          }
          onClick={
            openAllFilters
          }
        >
          <SlidersHorizontal
            size={17}
          />

          <span>
            Filter
          </span>

          {activeCount > 0 && (
            <span className="search-filter-count">
              {activeCount}
            </span>
          )}
        </button>

        {CHIP_FILTERS.map(
          (filter) => {
            const active =
              isFilterActive(
                filter.id,
                searchParams
              );

            const summary =
              active
                ? getFilterSummary(
                    filter.id,
                    searchParams
                  )
                : "";

            return (
              <button
                key={filter.id}
                type="button"
                className={
                  active
                    ? "search-filter-chip active"
                    : "search-filter-chip"
                }
                onClick={() =>
                  openFilter(
                    filter.id
                  )
                }
              >
                <span>
                  {active
                    ? `${filter.label}: ${summary}`
                    : filter.label}
                </span>

                <ChevronDown
                  size={15}
                />
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}