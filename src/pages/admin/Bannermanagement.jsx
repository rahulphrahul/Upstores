import React, { useCallback, useEffect, useState } from "react";
import {
  createBanner,
  getBanners,
  deleteBanner,
  getBannerMerchants,
} from "../../service/apiService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASEPATH } from "../../config/config";
import "./Bannermanagement.css";
import { PencilSimple, Trash, X } from "phosphor-react";

const buildMerchantDetails = (source = {}) => {
  const nestedShop = source.shop || source.data?.shop || source.data || {};
  const merchantType = source.merchant_type ?? source.type ?? "";

  const shopId =
    source.shop_id ??
    source.shopid ??
    source.merchant_shop_id ??
    source.merchant_id ??
    nestedShop.shop_id ??
    nestedShop.id ??
    "";

  const sellerId = source.seller_id ?? source.merchant_id ?? "";
  const serviceId = source.service_id ?? source.merchant_id ?? "";
  const merchantId = shopId || sellerId || serviceId;

  const latitude =
    source.latitude ??
    source.lat ??
    source.shop_latitude ??
    source.shop_lat ??
    nestedShop.latitude ??
    nestedShop.lat ??
    "";

  const longitude =
    source.longitude ??
    source.long ??
    source.lng ??
    source.shop_longitude ??
    nestedShop.longitude ??
    nestedShop.long ??
    nestedShop.lng ??
    "";

  const location =
    source.location ??
    source.location_name ??
    source.shop_location ??
    source.address ??
    source.shop_address ??
    nestedShop.location ??
    nestedShop.location_name ??
    nestedShop.address ??
    "";

  const shopName =
    source.shop_name ??
    source.name ??
    source.merchant_name ??
    nestedShop.shop_name ??
    nestedShop.name ??
    "";

  const ownerName =
    source.owner_name ??
    source.shop_owner_name ??
    nestedShop.owner_name ??
    nestedShop.ownerName ??
    "";

  const phone =
    source.phone ??
    source.shop_phone ??
    nestedShop.phone ??
    nestedShop.mobile ??
    "";

  const email =
    source.email ??
    source.shop_email ??
    nestedShop.email ??
    "";

  return {
    id: merchantId,
    merchantType,
    selectionKey: `${merchantType || "merchant"}:${merchantId}`,
    shopName,
    ownerName,
    phone,
    email,
    latitude,
    longitude,
    location,
  };
};

const formatCoordinates = (latitude, longitude) => {
  const hasLatitude = latitude !== "" && latitude !== null && latitude !== undefined;
  const hasLongitude = longitude !== "" && longitude !== null && longitude !== undefined;

  if (!hasLatitude && !hasLongitude) return "-";
  if (!hasLatitude) return `- , ${longitude}`;
  if (!hasLongitude) return `${latitude} , -`;
  return `${latitude} , ${longitude}`;
};

function BannerManagement() {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantShops, setMerchantShops] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [resolvedLocationNames, setResolvedLocationNames] = useState({});
  const itemsPerPage = 5;

  const [form, setForm] = useState({
    title: "",
    text: "",
    button_text: "",
    gradient_start: "#FF512F",
    gradient_end: "#DD2476",
    position: "top",
    merchant_type: "",
    shop_id: "",
    latitude: "",
    longitude: "",
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

  const fetchMerchantShops = useCallback(async (search = "") => {
    setMerchantLoading(true);

    try {
      const res = await getBannerMerchants(1, search, 200);
      const shops = res?.data || [];
      setMerchantShops(Array.isArray(shops) ? shops : []);
    } catch {
      setMerchantShops([]);
      toast.error("Failed to load shops");
    } finally {
      setMerchantLoading(false);
    }
  }, []);

  const resolveLocationName = useCallback(async (latitude, longitude) => {
    const lat = String(latitude || "").trim();
    const lng = String(longitude || "").trim();

    if (!lat || !lng) return null;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data?.display_name || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!showMerchantModal) return;

    const timer = setTimeout(() => {
      fetchMerchantShops(merchantSearch.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchMerchantShops, merchantSearch, showMerchantModal]);

  useEffect(() => {
    let cancelled = false;

    const loadLocationNames = async () => {
      const entries = await Promise.all(
        merchantShops.map(async (shop) => {
          const merchant = buildMerchantDetails(shop);
          const locationName =
            merchant.location ||
            (await resolveLocationName(merchant.latitude, merchant.longitude)) ||
            "";

          return [merchant.selectionKey, locationName];
        })
      );

      if (!cancelled) {
        setResolvedLocationNames(Object.fromEntries(entries));
      }
    };

    if (merchantShops.length > 0) {
      loadLocationNames();
    } else {
      setResolvedLocationNames({});
    }

    return () => {
      cancelled = true;
    };
  }, [merchantShops, resolveLocationName]);

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
      merchant_type: "",
      shop_id: "",
      latitude: "",
      longitude: "",
      image: null,
    });

    setEditingId(null);
    setImagePreview(null);
    setSelectedMerchant(null);
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
        setShowForm(false);
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

    const merchant = buildMerchantDetails(banner);
    setSelectedMerchant(
      merchant.id || merchant.shopName || merchant.ownerName ? merchant : null
    );

    setForm({
      title: banner.title,
      text: banner.text || "",
      button_text: banner.button_text || "",
      gradient_start: banner.gradient_start,
      gradient_end: banner.gradient_end,
      position: banner.position,
      merchant_type: banner.merchant_type ?? banner.type ?? "",
      shop_id: banner.shop_id ?? banner.shopid ?? banner.merchant_shop_id ?? "",
      latitude: banner.latitude ?? banner.lat ?? "",
      longitude: banner.longitude ?? banner.long ?? "",
      image: null,
    });

    setImagePreview(`${BASEPATH}/${banner.image}`);
    setShowForm(true);
    toast.info("Editing banner...");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMerchantSelect = (shop) => {
    const merchant = buildMerchantDetails(shop);
    setSelectedMerchant(merchant);
    setForm((prev) => ({
      ...prev,
      merchant_type: merchant.merchantType || "",
      shop_id: merchant.id || "",
      latitude: merchant.latitude || "",
      longitude: merchant.longitude || "",
    }));
    setShowMerchantModal(false);
    toast.success("Merchant added to banner");
  };

  const clearMerchant = () => {
    setSelectedMerchant(null);
    setForm((prev) => ({
      ...prev,
      merchant_type: "",
      shop_id: "",
      latitude: "",
      longitude: "",
    }));
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

  const merchantCards = merchantShops.map((shop) => {
    const merchant = buildMerchantDetails(shop);
    const displayLocation =
      resolvedLocationNames[merchant.selectionKey] ||
      merchant.location ||
      formatCoordinates(merchant.latitude, merchant.longitude);
    const isSelected =
      String(form.merchant_type || "") === String(merchant.merchantType || "") &&
      String(form.shop_id) === String(merchant.id);

    return (
      <button
        key={merchant.selectionKey || merchant.id || merchant.shopName || `${merchant.phone}-${merchant.email}`}
        type="button"
        className={`admin-banner-management__merchant-card ${
          isSelected ? "is-selected" : ""
        }`}
        onClick={() => handleMerchantSelect(shop)}
      >
        <div className="admin-banner-management__merchant-card-header">
          <div className="admin-banner-management__merchant-identity">
            <h5 className="admin-banner-management__merchant-name">
              {merchant.shopName || `Shop #${merchant.id || "N/A"}`}
            </h5>
          </div>

          <span className="admin-banner-management__merchant-select">Select</span>
        </div>

        <div className="admin-banner-management__merchant-row">
          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Shop Name</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.shopName || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Owner Name</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.ownerName || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Phone</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.phone || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Email</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.email || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Latitude</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.latitude || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Longitude</span>
            <span className="admin-banner-management__merchant-value">
              {merchant.longitude || "-"}
            </span>
          </div>

          <div className="admin-banner-management__merchant-item">
            <span className="admin-banner-management__merchant-label">Location Name</span>
            <span className="admin-banner-management__merchant-value">
              {displayLocation || "-"}
            </span>
          </div>
        </div>
      </button>
    );
  });

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

      <div className="admin-banner-management__header">
        <h2 className="admin-banner-management__title">Banner Management</h2>
        <button
          type="button"
          className="admin-banner-management__button admin-banner-management__button--primary admin-banner-management__add-toggle"
          onClick={() => {
            if (showForm && !editingId) {
              resetForm();
              setShowForm(false);
              return;
            }

            setShowForm(true);
          }}
        >
          {showForm ? (editingId ? "Editing Banner" : "Close") : "Add Banner"}
        </button>
      </div>

      {showForm && (
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

            <div className="admin-banner-management__merchant-block">
              <div className="admin-banner-management__merchant-copy">
                <span className="admin-banner-management__merchant-copy-label">
                  Merchant
                </span>
                <p className="admin-banner-management__merchant-copy-text">
                  {selectedMerchant
                    ? `${selectedMerchant.shopName || "Selected merchant"}${
                        selectedMerchant.ownerName ? ` - ${selectedMerchant.ownerName}` : ""
                      }`
                    : "Optional. Add a merchant to link this banner with a shop."}
                </p>
              </div>

              <div className="admin-banner-management__button-row">
                <button
                  type="button"
                  className="admin-banner-management__button admin-banner-management__button--secondary"
                  onClick={() => {
                    setShowMerchantModal(true);
                    fetchMerchantShops(merchantSearch.trim());
                  }}
                >
                  Add Merchant
                </button>

                {selectedMerchant && (
                  <button
                    type="button"
                    className="admin-banner-management__button admin-banner-management__button--secondary"
                    onClick={clearMerchant}
                  >
                    Clear Merchant
                  </button>
                )}
              </div>

              <input type="hidden" name="shop_id" value={form.shop_id} />
              <input type="hidden" name="merchant_type" value={form.merchant_type} />
              <input type="hidden" name="latitude" value={form.latitude} />
              <input type="hidden" name="longitude" value={form.longitude} />
            </div>

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
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="admin-banner-management__panel">
        <h4 className="admin-banner-management__section-title">Banner List</h4>

        <div className="admin-banner-management__table-scroll">
          <table className="admin-banner-management__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Merchant</th>
                <th>Location</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                currentItems.map((banner) => (
                  <tr key={banner.id}>
                    <td data-label="Image">
                      <img
                        src={`${BASEPATH}/${banner.image}`}
                        alt={`${banner.title} banner`}
                        className="admin-banner-management__table-image"
                      />
                    </td>
                    <td data-label="Title">{banner.title}</td>
                    <td data-label="Merchant">
                      <div className="admin-banner-management__merchant-cell">
                        <strong>
                          {banner.shop_name ||
                            banner.merchant_name ||
                            (banner.shop_id ? `Shop #${banner.shop_id}` : "-")}
                        </strong>
                        <span>
                          {banner.owner_name || banner.shop_owner_name || "-"}
                        </span>
                      </div>
                    </td>
                    <td data-label="Location">
                      <div className="admin-banner-management__merchant-cell">
                        <strong>
                          {banner.location_name ||
                            banner.location ||
                            banner.shop_location ||
                            "-"}
                        </strong>
                        <span>
                          {formatCoordinates(
                            banner.latitude ?? banner.lat,
                            banner.longitude ?? banner.long
                          )}
                        </span>
                      </div>
                    </td>
                    <td data-label="Position">
                      <span className="admin-banner-management__position">
                        {banner.position}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="admin-banner-management__action-group">
                        <button
                          type="button"
                          className="admin-banner-management__button admin-banner-management__button--edit"
                          title="Edit"
                          aria-label="Edit"
                          onClick={() => handleEdit(banner)}
                        >
                          <PencilSimple className="admin-action-icon" size={18} weight="bold" />
                          <span className="admin-action-label">Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-banner-management__button admin-banner-management__button--danger"
                          title="Delete"
                          aria-label="Delete"
                          onClick={() => handleDelete(banner.id)}
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
                  <td colSpan="6" className="admin-banner-management__empty-cell">
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
              className="admin-banner-management__button admin-banner-management__button--page admin-banner-management__button--arrow"
              onClick={goToPrevious}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &lsaquo;
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
              className="admin-banner-management__button admin-banner-management__button--page admin-banner-management__button--arrow"
              onClick={goToNext}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
          </div>
        )}
      </div>

      {showMerchantModal && (
        <div
          className="admin-banner-management__modal-backdrop"
          role="presentation"
          onClick={() => setShowMerchantModal(false)}
        >
          <div
            className="admin-banner-management__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="merchant-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-banner-management__modal-header">
              <div>
                <h3
                  id="merchant-picker-title"
                  className="admin-banner-management__modal-title"
                >
                  Select Merchant
                </h3>
                <p className="admin-banner-management__modal-subtitle">
                  Search shops and attach one to the banner. This field is optional.
                </p>
              </div>

              <button
                type="button"
                className="admin-banner-management__modal-close"
                onClick={() => setShowMerchantModal(false)}
                aria-label="Close merchant picker"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <input
              type="search"
              className="admin-banner-management__merchant-search"
              placeholder="Search shop name, owner, phone, email, or location"
              value={merchantSearch}
              onChange={(event) => setMerchantSearch(event.target.value)}
            />

            <div className="admin-banner-management__merchant-results">
              {merchantLoading ? (
                <div className="admin-banner-management__merchant-empty">
                  Loading shops...
                </div>
              ) : merchantCards.length > 0 ? (
                merchantCards
              ) : (
                <div className="admin-banner-management__merchant-empty">
                  No shops found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerManagement;
