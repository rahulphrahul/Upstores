import React, { useEffect, useState } from "react";

import {
  getExecutives,
  toggleExecutiveStatus,
  deleteExecutive,
  createExecutive,
} from "../../service/apiService";
import { Modal, Button } from "react-bootstrap";
import ExecutiveManagementSkeleton from "./skeletons/ExecutiveManagementSkeleton";
import AdminSearch from "./AdminSearch";
import "./ExecutiveManagement.css";
import { PauseCircle, PlayCircle, Trash } from "phosphor-react";

const normalizeExecutiveRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.executives)) return payload.executives;
  if (Array.isArray(payload?.data?.executives)) {
    return payload.data.executives;
  }
  return [];
};

function ExecutiveManagement() {
  /* =========================
     STATE
  ========================= */
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [executives, setExecutives] = useState([]);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 10;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
  });
  const [creating, setCreating] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */
const loadAll = async (currentPage = page, currentSearch = search) => {
  try {
    setLoading(true);

    const execRes = await getExecutives({
      page: currentPage,
      limit,
      search: currentSearch,
    });

    setExecutives(normalizeExecutiveRows(execRes));
    setTotalPages(
      Number(
        execRes?.totalPages ??
          execRes?.pagination?.totalPages ??
          execRes?.data?.totalPages ??
          1
      ) || 1
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
    setHasLoaded(true);
  }
};

useEffect(() => {
  loadAll(page, search);
}, [page, search]);

  const applySearch = (term) => {
    setPage(1);
    setSearch(term);
  };

  /* =========================
     ADD EXECUTIVE
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setCreating(true);
    const res = await createExecutive(form);
    setCreating(false);

    if (res.status === "success") {
      setCredentials(res);
      setForm({ name: "", phone: "", email: "", username: "" });
      loadAll();
    }
  };

  /* =========================
     ACTIONS
  ========================= */
  const handleToggleStatus = async (id, status) => {
    await toggleExecutiveStatus(id, status);
    loadAll();
  };

const handleDelete = (id) => {
  setSelectedId(id);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    await deleteExecutive(selectedId);
    setShowDeleteModal(false);
    loadAll();
  } catch (error) {
    console.error(error);
  }
};

  if (loading && !hasLoaded) return <ExecutiveManagementSkeleton />;

  /* =========================
     UI
  ========================= */
  return (
    <div className="exec-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Executive Management</h2>
        <button
          className="btn btn-primary exec-add-btn"
          onClick={() => {
            setShowAdd(!showAdd);
            setCredentials(null);
          }}
        >
          {showAdd ? "Close" : "+ Add Executive"}
        </button>
      </div>

      {/* ADD EXECUTIVE SECTION */}
      {showAdd && (
        <div className="card">
          <h4 className="exec-card-title">Add New Executive</h4>

          {!credentials ? (
            <div className="form-grid">
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary exec-search-btn"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  Create Executive
                </button>
              </div>
            </div>
          ) : (
            <div className="credentials-box">
              <p><strong>Username:</strong> {credentials.username}</p>
              <p><strong>Password:</strong> {credentials.password}</p>
              <small>
                ⚠ Share securely. Password will not be shown again.
              </small>
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
     <div className="card">

        {/* SEARCH BAR */}
        <div className="exec-toolbar">
          <AdminSearch
            value={searchInput}
            appliedValue={search}
            onChange={setSearchInput}
            onSearch={applySearch}
            placeholder="Search executives by name or phone"
            label="Search executives"
            loading={loading}
          />
        </div>

  <div className="table-wrapper">
    <table className="data-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Shops</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {executives.map(e => (
              <tr key={e.id}>
                <td data-label="Name">{e.name}</td>
                <td data-label="Phone">{e.phone}</td>
                <td data-label="Email">{e.email || "-"}</td>
                <td data-label="Shops">{e.shops_count}</td>
                <td data-label="Status">
                  <span className={`status exec-status ${e.status}`}>
                    {e.status}
                  </span>
                </td>
                <td data-label="Action">
                  <div className="exec-table-actions">
                    <button
                      type="button"
                      className={`btn exec-action-btn ${
                        e.status === "active"
                          ? "btn-suspend exec-suspend-btn"
                          : "btn-activate exec-activate-btn"
                      }`}
                      title={e.status === "active" ? "Suspend" : "Activate"}
                      aria-label={e.status === "active" ? "Suspend" : "Activate"}
                      onClick={() =>
                        handleToggleStatus(e.id, e.status)
                      }
                    >
                      {e.status === "active" ? (
                        <PauseCircle className="admin-action-icon" size={18} weight="bold" />
                      ) : (
                        <PlayCircle className="admin-action-icon" size={18} weight="bold" />
                      )}
                      <span className="admin-action-label">
                        {e.status === "active" ? "Suspend" : "Activate"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger exec-delete-btn"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash className="admin-action-icon" size={18} weight="bold" />
                      <span className="admin-action-label">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {executives.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No executives found
                </td>
              </tr>
            )}
          </tbody>
           </table>
  </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="exec-pagination">
            <button
              type="button"
              className="btn btn-outline exec-pagination-arrow"
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>

            <span className="exec-pagination-info">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-outline exec-pagination-arrow"
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
          </div>
        )}

      </div>

      {/* DELETE MODAL */}
<Modal className="exec-delete-modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Delete</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    Are you sure you want to delete this executive?
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" className="exec-modal-cancel" onClick={() => setShowDeleteModal(false)}>
      Cancel
    </Button>
    <Button variant="danger" className="exec-modal-delete" onClick={confirmDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>
</div>
  );
}

export default ExecutiveManagement;
