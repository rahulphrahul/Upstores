import React, { useState } from "react";
import { createBanner } from "../../service/apiService";
import "./SellerManagement.css"; // reuse same CSS

function BannerManagement() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    text: "",
    button_text: "",
    gradient_start: "#FF512F",
    gradient_end: "#DD2476",
    position: "top",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      alert("Please upload banner image");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      fd.append(key, form[key]);
    });

    setLoading(true);
    try {
      const res = await createBanner(fd);
      if (res.status === "success") {
        alert("Banner created successfully");
        setForm({
          title: "",
          text: "",
          button_text: "",
          gradient_start: "#FF512F",
          gradient_end: "#DD2476",
          position: "top",
          image: null,
        });
      } else {
        alert(res.message || "Failed to create banner");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-page">
      {/* Page Header */}
      <h2 className="page-title">Banner Management</h2>

      {/* Card – same as Seller page */}
      <div className="card shadow-sm p-4 bg-white rounded-lg">
        <h4 className="mb-4 font-semibold text-lg">
          Create New Banner
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Text
            </label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Button Text
            </label>
            <input
              type="text"
              name="button_text"
              value={form.button_text}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Gradients */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Gradient Start
              </label>
              <input
                type="color"
                name="gradient_start"
                value={form.gradient_start}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gradient End
              </label>
              <input
                type="color"
                name="gradient_end"
                value={form.gradient_end}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Position
            </label>
            <select
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
              required
            />
          </div>

          {/* Preview */}
          <div
            className="h-32 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{
              background: `linear-gradient(90deg, ${form.gradient_start}, ${form.gradient_end})`,
            }}
          >
            Banner Preview
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6"
          >
            {loading ? "Creating..." : "Create Banner"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BannerManagement;
