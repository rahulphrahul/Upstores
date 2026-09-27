import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Categorymanagement.css";

import {
  addCategory,
  getCategories,
  deleteCategory,
} from "../../service/apiService";
import { BASE_CATEGORY_URL } from "../../config/config";
import { X } from "lucide-react";

const CATEGORY_GROUPS = [
  { type: "shop", title: "Shops" },
  { type: "seller", title: "Sellers" },
  { type: "service", title: "Services" },
];

const Categorymanagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [mainType, setMainType] = useState("");
  const [icon, setIcon] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories("");
      if (res.status === "success") {
        const list = res.data || [];
        setCategories(list);
        return list;
      }
    } catch {
      toast.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!showEditModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setEditId(null);
        setName("");
        setMainType("");
        setIcon(null);
        setShowDeleteConfirm(false);
        setShowEditModal(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEditModal]);

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

    setSaving(true);
    try {
      const res = await addCategory(formData);

      if (res.status === "success") {
        toast.success(res.message);
        if (editId) {
          closeEditor();
        } else {
          resetForm();
          setShowForm(false);
        }
        await fetchCategories();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await deleteCategory(id);

      if (res.status === "success") {
        toast.success("Deleted successfully");
        closeEditor();
        await fetchCategories();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setName(category.name);
    setMainType(category.main_type);
    setIcon(null);
    setShowForm(false);
    setShowDeleteConfirm(false);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setMainType("");
    setIcon(null);
  };

  const closeEditor = () => {
    resetForm();
    setShowEditModal(false);
    setShowDeleteConfirm(false);
  };

  const categoryIconBaseUrl = BASE_CATEGORY_URL?.replace(/\/$/, "");
  const groupedCategories = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: categories.filter(
      (category) => String(category.main_type || "").toLowerCase() === group.type
    ),
  }));
  const selectedCategory = categories.find(
    (category) => String(category.id) === String(editId)
  );

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
                disabled={saving}
              >
                {saving ? "Saving…" : "Add Category"}
              </button>
            </div>
          </div>
        </form>
      </div>
      )}

      <section className="admin-category-management__panel admin-category-management__list-panel">
        <div className="admin-category-management__list-header">
          <div>
            <h4 className="admin-category-management__section-title">
              Category List
            </h4>
            <p className="admin-category-management__list-caption">
              Browse by type and select an image to edit its category details.
            </p>
          </div>
          <span className="admin-category-management__count">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        <div className="admin-category-management__groups">
          {groupedCategories.map((group) => (
            <section
              className="admin-category-management__group"
              key={group.type}
              aria-labelledby={`category-group-${group.type}`}
            >
              <div className="admin-category-management__group-heading">
                <h5 id={`category-group-${group.type}`}>{group.title}</h5>
                <span>{group.items.length}</span>
              </div>

              {group.items.length > 0 ? (
                <div
                  className="admin-category-management__strip"
                  role="region"
                  aria-label={`${group.title} categories, horizontally scrollable`}
                  tabIndex={0}
                >
                  {group.items.map((category) => (
                    <button
                      type="button"
                      className="admin-category-management__tile"
                      key={category.id}
                      onClick={() => handleEdit(category)}
                      aria-label={`Edit ${category.name} category`}
                    >
                      <span className="admin-category-management__image-frame">
                        <img
                          src={`${categoryIconBaseUrl}/${category.icon}`}
                          alt=""
                          className="admin-category-management__icon"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      </span>
                      <span className="admin-category-management__tile-name">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="admin-category-management__group-empty">
                  No {group.title.toLowerCase()} categories yet.
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      {showEditModal && (
        <div
          className="admin-category-management__modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section
            className="admin-category-management__edit-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-edit-title"
          >
            <header className="admin-category-management__edit-header">
              <div>
                <span className="admin-category-management__edit-eyebrow">CATEGORY DETAILS</span>
                <h3 id="category-edit-title">Edit category</h3>
              </div>
              <button
                type="button"
                className="admin-category-management__close"
                aria-label="Close category editor"
                onClick={closeEditor}
              >
                <X size={19} />
              </button>
            </header>

            <form className="admin-category-management__edit-form" onSubmit={handleSubmit}>
              <div className="admin-category-management__edit-preview">
                <img
                  src={`${categoryIconBaseUrl}/${selectedCategory?.icon}`}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span>{selectedCategory?.main_type} category</span>
              </div>

              <div className="admin-category-management__edit-fields">
                <div className="admin-category-management__field">
                  <label className="admin-category-management__label" htmlFor="edit-category-name">
                    Category name
                  </label>
                  <input
                    id="edit-category-name"
                    className="admin-category-management__input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="admin-category-management__field">
                  <label className="admin-category-management__label" htmlFor="edit-category-type">
                    Category type
                  </label>
                  <select
                    id="edit-category-type"
                    className="admin-category-management__select"
                    value={mainType}
                    onChange={(event) => setMainType(event.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="shop">Shop</option>
                    <option value="seller">Seller</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div className="admin-category-management__field admin-category-management__field--full">
                  <label className="admin-category-management__label" htmlFor="edit-category-icon">
                    Replace image <span className="admin-category-management__optional">Optional</span>
                  </label>
                  <input
                    id="edit-category-icon"
                    className="admin-category-management__file"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                  />
                </div>
              </div>

              {showDeleteConfirm ? (
                <div className="admin-category-management__delete-confirm" role="alert">
                  <span>Delete “{name}”? This action cannot be undone.</span>
                  <button
                    type="button"
                    className="admin-category-management__button admin-category-management__button--danger"
                    onClick={() => handleDelete(editId)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete permanently"}
                  </button>
                  <button
                    type="button"
                    className="admin-category-management__button admin-category-management__button--secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Keep category
                  </button>
                </div>
              ) : (
                <footer className="admin-category-management__edit-actions">
                  <button
                    type="button"
                    className="admin-category-management__button admin-category-management__button--danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving || deleting}
                  >
                    Delete
                  </button>
                  <div>
                    <button
                      type="button"
                      className="admin-category-management__button admin-category-management__button--secondary"
                      onClick={closeEditor}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-category-management__button admin-category-management__button--primary"
                      disabled={saving || deleting}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </footer>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Categorymanagement;
