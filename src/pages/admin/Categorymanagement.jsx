import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Categorymanagement.css";

import {
  addCategory,
  getCategories,
  deleteCategory,
} from "../../service/apiService";
import { PencilSimple, Trash } from "phosphor-react";

const Categorymanagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [mainType, setMainType] = useState("");
  const [icon, setIcon] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories("");
      if (res.status === "success") {
        setCategories(res.data || []);
      }
    } catch {
      toast.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Icon must be less than 2MB");
      return;
    }

    setIcon(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mainType) {
      toast.error("All fields required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("main_type", mainType);
    if (icon) formData.append("icon", icon);
    if (editId) formData.append("id", editId);

    try {
      const res = await addCategory(formData);

      if (res.status === "success") {
        toast.success(res.message);
        resetForm();
        setShowForm(false);
        fetchCategories();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await deleteCategory(id);

      if (res.status === "success") {
        toast.success("Deleted successfully");
        fetchCategories();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setName(category.name);
    setMainType(category.main_type);
    setIcon(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setMainType("");
    setIcon(null);
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / recordsPerPage);

  return (
    <div className="admin-category-management">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="admin-category-management__header">
        <h2 className="admin-category-management__title">Category Management</h2>
        <button
          type="button"
          className="admin-category-management__button admin-category-management__button--primary admin-category-management__add-toggle"
          onClick={() => {
            if (showForm && !editId) {
              resetForm();
              setShowForm(false);
              return;
            }

            setShowForm(true);
          }}
        >
          {showForm ? (editId ? "Editing Category" : "Close") : "Add Category"}
        </button>
      </div>

      {showForm && (
      <div className="admin-category-management__panel">
        <h4 className="admin-category-management__section-title">
          {editId ? "Edit Category" : "Add Category"}
        </h4>

        <form
          className="admin-category-management__form"
          onSubmit={handleSubmit}
        >
          <div className="admin-category-management__form-grid">
            <div className="admin-category-management__field">
              <label className="admin-category-management__label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="admin-category-management__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="admin-category-management__field">
              <label
                className="admin-category-management__label"
                htmlFor="mainType"
              >
                Main Type
              </label>
              <select
                id="mainType"
                className="admin-category-management__select"
                value={mainType}
                onChange={(e) => setMainType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="shop">Shop</option>
                <option value="seller">Seller</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div className="admin-category-management__field">
              <label className="admin-category-management__label" htmlFor="icon">
                Icon
              </label>
              <input
                id="icon"
                className="admin-category-management__file"
                type="file"
                accept="image/*"
                onChange={handleIconChange}
              />
            </div>

            <div className="admin-category-management__field admin-category-management__field--action">
              <button
                type="submit"
                className="admin-category-management__button admin-category-management__button--primary"
              >
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </div>

          {editId && (
            <div className="admin-category-management__button-row">
              <button
                type="button"
                className="admin-category-management__button admin-category-management__button--secondary"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel Edit
              </button>
            </div>
          )}
        </form>
      </div>
      )}

      <div className="admin-category-management__panel">
        <h4 className="admin-category-management__section-title">
          Category List
        </h4>

        <div className="admin-category-management__table-scroll">
          <table className="admin-category-management__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Icon</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((category) => (
                  <tr key={category.id}>
                    <td data-label="Name">{category.name}</td>
                    <td data-label="Type">
                      <span className="admin-category-management__type-badge">
                        {category.main_type}
                      </span>
                    </td>
                    <td data-label="Icon">
                      <img
                        src={`${process.env.REACT_APP_BASE_URL}/categories/category-icons/${category.icon}`}
                        alt={`${category.name} icon`}
                        className="admin-category-management__icon"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </td>
                    <td data-label="Action">
                      <div className="admin-category-management__action-group">
                        <button
                          type="button"
                          className="admin-category-management__button admin-category-management__button--edit"
                          title="Edit"
                          aria-label="Edit"
                          onClick={() => handleEdit(category)}
                        >
                          <PencilSimple className="admin-action-icon" size={18} weight="bold" />
                          <span className="admin-action-label">Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-category-management__button admin-category-management__button--danger"
                          title="Delete"
                          aria-label="Delete"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash className="admin-action-icon" size={18} weight="bold" />
                          <span className="admin-action-label">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="admin-category-management__empty-cell"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-category-management__pagination">
            <button
              type="button"
              className="admin-category-management__page-btn admin-category-management__page-btn--arrow"
              onClick={() =>
                setCurrentPage((current) => Math.max(1, current - 1))
              }
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`admin-category-management__page-btn ${
                  index + 1 === currentPage ? "active" : ""
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="admin-category-management__page-btn admin-category-management__page-btn--arrow"
              onClick={() =>
                setCurrentPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categorymanagement;
