import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getEnquiries } from "../../service/apiService";
import "./EnquiriesManagement.css";

const getEnquiryList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.enquiries)) return response.enquiries;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.enquiries)) return response.data.enquiries;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

const labelFor = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

function EnquiriesManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getEnquiries();
      const list = getEnquiryList(response);

      if (response?.status === "error" || response?.success === false) {
        throw new Error(response?.message || "Unable to fetch enquiries");
      }

      setEnquiries(list);
    } catch (requestError) {
      setEnquiries([]);
      setError(requestError.message || "Unable to fetch enquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const columns = useMemo(() => {
    const keys = new Set();
    enquiries.forEach((enquiry) => {
      if (enquiry && typeof enquiry === "object") {
        Object.keys(enquiry).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys);
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return enquiries;

    return enquiries.filter((enquiry) =>
      Object.values(enquiry || {}).some((value) =>
        displayValue(value).toLowerCase().includes(term)
      )
    );
  }, [enquiries, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="admin-enquiries">
      <div className="admin-enquiries__header">
        <div>
          <h2 className="admin-enquiries__title">Enquiries</h2>
          <p className="admin-enquiries__subtitle">
            View enquiries submitted through Upstores.
          </p>
        </div>
        <button
          type="button"
          className="admin-enquiries__refresh"
          onClick={loadEnquiries}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="admin-enquiries__panel">
        <div className="admin-enquiries__toolbar">
          <input
            type="search"
            className="admin-enquiries__search"
            placeholder="Search enquiries..."
            value={search}
            onChange={handleSearch}
            aria-label="Search enquiries"
          />
          <span className="admin-enquiries__count">
            {filteredEnquiries.length}{" "}
            {filteredEnquiries.length === 1 ? "enquiry" : "enquiries"}
          </span>
        </div>

        {error ? (
          <div className="admin-enquiries__state admin-enquiries__state--error">
            <p>{error}</p>
            <button type="button" onClick={loadEnquiries}>Try again</button>
          </div>
        ) : loading ? (
          <p className="admin-enquiries__state">Loading enquiries...</p>
        ) : !enquiries.length ? (
          <p className="admin-enquiries__state">No enquiries found.</p>
        ) : (
          <>
            <div className="admin-enquiries__table-scroll">
              <table className="admin-enquiries__table">
                <thead>
                  <tr>
                    {columns.map((column) => <th key={column}>{labelFor(column)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visibleEnquiries.length ? visibleEnquiries.map((enquiry, rowIndex) => (
                    <tr key={enquiry?.id || enquiry?.enquiry_id || rowIndex}>
                      {columns.map((column) => (
                        <td key={column} data-label={labelFor(column)}>{displayValue(enquiry?.[column])}</td>
                      ))}
                    </tr>
                  )) : (
                    <tr><td colSpan={columns.length}>No matching enquiries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-enquiries__pagination">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default EnquiriesManagement;
