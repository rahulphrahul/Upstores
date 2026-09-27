import React, { useEffect, useRef } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import "./AdminSearch.css";

const DEBOUNCE_MS = 450;

function AdminSearch({
  value,
  appliedValue,
  onChange,
  onSearch,
  placeholder,
  label,
  loading = false,
}) {
  const searchHandler = useRef(onSearch);
  const debounceRef = useRef(null);
  const query = String(value || "").trim();
  const appliedQuery = String(appliedValue || "").trim();
  const hasPendingQuery = query !== appliedQuery;

  useEffect(() => {
    searchHandler.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (query === appliedQuery) return undefined;

    debounceRef.current = window.setTimeout(() => {
      searchHandler.current(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(debounceRef.current);
  }, [query, appliedQuery]);

  const clearSearch = () => {
    window.clearTimeout(debounceRef.current);
    onChange("");
    searchHandler.current("");
  };

  const searchImmediately = () => {
    window.clearTimeout(debounceRef.current);
    searchHandler.current(query);
  };

  return (
    <div className="admin-search">
      <div className="admin-search__control">
        <Search className="admin-search__icon" size={19} aria-hidden="true" />
        <input
          type="search"
          className="admin-search__input"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              searchImmediately();
            }
          }}
        />
        {loading && (
          <LoaderCircle
            className="admin-search__loading"
            size={18}
            aria-label="Searching"
          />
        )}
        {value && (
          <button
            type="button"
            className="admin-search__clear"
            aria-label="Clear search text"
            onClick={clearSearch}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="admin-search__meta" aria-live="polite">
        {hasPendingQuery && query ? (
          <span className="admin-search__hint">
            Search will update when you pause typing
          </span>
        ) : appliedQuery ? (
          <>
            <span>
              Showing results for <strong>“{appliedQuery}”</strong>
            </span>
            <button
              type="button"
              className="admin-search__clear-filter"
              onClick={clearSearch}
              aria-label={`Clear search for ${appliedQuery}`}
            >
              <X size={15} aria-hidden="true" />
              <span>Clear search</span>
            </button>
          </>
        ) : (
          <span className="admin-search__hint">
            Search as you type <span aria-hidden="true">·</span> Press Enter to
            search now
          </span>
        )}
      </div>
    </div>
  );
}

export default AdminSearch;
