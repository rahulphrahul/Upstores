import React, { useEffect, useState } from "react";
import { createBanner, getBanners, deleteBanner } from "../../service/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASEPATH } from "../../config/config";

function BannerManagement() {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(5);
  const [form, setForm] = useState({
    title: "",
    text: "",
    button_text: "",
    gradient_start: "#FF512F",
    gradient_end: "#DD2476",
    position: "top",
    image: null,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await getBanners();
      if (res.status === "success") {
        setBanners(res.data);
      } else {
        toast.error("Failed to fetch banners");
      }
    } catch {
      toast.error("Server error while fetching banners");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
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
  };
// Pagination calculations
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
    <div className="seller-page">
      
      {/* ✅ TOASTER CONTAINER */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <h2 className="page-title">Banner Management</h2>

      {/* FORM */}
      <div className="card shadow-sm p-4 bg-white rounded-lg mb-4">
        <h4>{editingId ? "Edit Banner" : "Create New Banner"}</h4>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="form-control"
            required
          />

          <textarea
            name="text"
            placeholder="Text"
            value={form.text}
            onChange={handleChange}
            className="form-control mb-2"
          />

          <input
            type="text"
            name="button_text"
            placeholder="Button Text"
            value={form.button_text}
            onChange={handleChange}
            className="form-control mb-2"
          />

          <div className="d-flex gap-3">
            <input
              type="color"
              name="gradient_start"
              value={form.gradient_start}
              onChange={handleChange}
            />
            <input
              type="color"
              name="gradient_end"
              value={form.gradient_end}
              onChange={handleChange}
            />
          </div>

          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            className="form-control"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control"
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="card shadow-sm p-4 bg-white rounded-lg">
        <h4>Banner List</h4>

        <table className="table table-bordered">
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
                      alt=""
                      width="80"
                    />
                  </td>
                  <td>{banner.title}</td>
                  <td>{banner.position}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(banner)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(banner.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No banners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
  <div className="d-flex justify-content-between align-items-center mt-3">

    <button
      className="btn btn-sm btn-secondary"
      onClick={goToPrevious}
      disabled={currentPage === 1}
    >
      Previous
    </button>

    <div>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => paginate(index + 1)}
          className={`btn btn-sm mx-1 ${
            currentPage === index + 1
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>

    <button
      className="btn btn-sm btn-secondary"
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