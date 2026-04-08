import React, { useCallback, useEffect, useState } from "react";
import { createBanner, getBanners, deleteBanner } from "../../service/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASEPATH } from "../../config/config";
import "./Bannermanagement.css";

function BannerManagement() {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const itemsPerPage = 5;

  const [form, setForm] = useState({
    title: "",
    text: "",
    button_text: "",
    gradient_start: "#FF512F",
    gradient_end: "#DD2476",
    position: "top",
    image: null,
  });

  const fetchBanners = useCallback(async () => {
    try {
      const res = await getBanners();
      if (res.status === "success") {
        setBanners(res.data || []);
      } else {
        toast.error("Failed to fetch banners");
      }
    } catch {
      toast.error("Server error while fetching banners");
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setForm({
      title: "",
      text: "",
      button_text: "",
      gradient_start: "#FF512F",
      gradient_end: "#DD2476",
      position: "top",
      image: null,
    });

    setEditingId(null);
    setImagePreview(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = banners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(banners.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) {
        fd.append(key, form[key]);
      }
    });

    if (editingId) {
      fd.append("id", editingId);
    }

    setLoading(true);

    try {
      const res = await createBanner(fd);

      if (res.status === "success") {
        toast.success(res.message);
        resetForm();
        fetchBanners();
      } else {
        toast.error(res.message || "Failed to save banner");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);

    setForm({
      title: banner.title,
      text: banner.text || "",
      button_text: banner.button_text || "",
      gradient_start: banner.gradient_start,
      gradient_end: banner.gradient_end,
      position: banner.position,
      image: null,
    });

    setImagePreview(`${BASEPATH}/${banner.image}`);
    toast.info("Editing banner...");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      const res = await deleteBanner(id);

      if (res.status === "success") {
        toast.success(res.message);
        fetchBanners();
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch {
      toast.error("Server error while deleting");
    }
  };

  return (
    <div className="admin-banner-management">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <h2 className="admin-banner-management__title">Banner Management</h2>

      <div className="admin-banner-management__panel">
        <h4 className="admin-banner-management__section-title">
          {editingId ? "Edit Banner" : "Create New Banner"}
        </h4>

        <form onSubmit={handleSubmit} className="admin-banner-management__form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="admin-banner-management__input"
            required
          />

          <textarea
            name="text"
            placeholder="Text"
            value={form.text}
            onChange={handleChange}
            className="admin-banner-management__textarea"
          />

          <input
            type="text"
            name="button_text"
            placeholder="Button Text"
            value={form.button_text}
            onChange={handleChange}
            className="admin-banner-management__input"
          />

          <div className="admin-banner-management__color-row">
            <div className="admin-banner-management__color-field">
              <span className="admin-banner-management__color-label">Start</span>
              <input
                type="color"
                name="gradient_start"
                value={form.gradient_start}
                onChange={handleChange}
                className="admin-banner-management__color-input"
              />
            </div>

            <div className="admin-banner-management__color-field">
              <span className="admin-banner-management__color-label">End</span>
              <input
                type="color"
                name="gradient_end"
                value={form.gradient_end}
                onChange={handleChange}
                className="admin-banner-management__color-input"
              />
            </div>
          </div>

          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            className="admin-banner-management__select"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="admin-banner-management__file"
          />

          {imagePreview && (
            <div className="admin-banner-management__preview">
              <p className="admin-banner-management__preview-label">
                Image Preview
              </p>
              <img
                src={imagePreview}
                alt="Banner preview"
                className="admin-banner-management__preview-image"
              />
            </div>
          )}

          <div className="admin-banner-management__button-row">
            <button
              type="submit"
              className="admin-banner-management__button admin-banner-management__button--primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Banner"
                : "Create Banner"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-banner-management__button admin-banner-management__button--secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-banner-management__panel">
        <h4 className="admin-banner-management__section-title">Banner List</h4>

        <div className="admin-banner-management__table-scroll">
          <table className="admin-banner-management__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                currentItems.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <img
                        src={`${BASEPATH}/${banner.image}`}
                        alt={`${banner.title} banner`}
                        className="admin-banner-management__table-image"
                      />
                    </td>
                    <td>{banner.title}</td>
                    <td>
                      <span className="admin-banner-management__position">
                        {banner.position}
                      </span>
                    </td>
                    <td>
                      <div className="admin-banner-management__action-group">
                        <button
                          type="button"
                          className="admin-banner-management__button admin-banner-management__button--edit"
                          onClick={() => handleEdit(banner)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-banner-management__button admin-banner-management__button--danger"
                          onClick={() => handleDelete(banner.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="admin-banner-management__empty-cell">
                    No banners found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-banner-management__pagination">
            <button
              type="button"
              className="admin-banner-management__button admin-banner-management__button--secondary"
              onClick={goToPrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="admin-banner-management__page-list">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => paginate(index + 1)}
                  className={`admin-banner-management__button admin-banner-management__button--page ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="admin-banner-management__button admin-banner-management__button--secondary"
              onClick={goToNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BannerManagement;
