import React, { useEffect, useState } from "react";
import {
  getServices,
  updateServiceStatus,
  handleWalletRequest,
  getWalletRequests,
  deleteService,
  getServiceLoginDetails,
  getCustomerBankDetailsByUserId
} from "../../service/apiService";
import "./ServiceManagement.css";
import { BASE_IMAGE_URL,FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";
import AdminSearch from "./AdminSearch";
import { toast, ToastContainer } from "react-toastify";
/* PHOSPHOR ICONS */
import {
  Wallet,
  Users,
  Phone,
  MapPin,
  EnvelopeSimple,
  QrCode,
  ImageSquare,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Trash
} from "phosphor-react";

function ServiceManagement() {
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [services, setServices] = useState([]);
  const [pending, setPending] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [panByServiceId, setPanByServiceId] = useState({});
  const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
const limit = 10;

  const shop_type = "service";

const loadServices = async () => {
  setLoading(true);
  try {
    const [serviceRes, pendingRes] = await Promise.all([
      getServices(page, search),
      getWalletRequests(shop_type),
    ]);
    const servicesList = serviceRes?.data || [];

    setServices(servicesList);
    setTotal(serviceRes?.total || 0);
    setPending(pendingRes?.data || pendingRes || []);

    const panEntries = await Promise.all(
      servicesList.map(async (service) => {
        try {
          const detailRes = await getServiceLoginDetails(service.service_id);
          const userId =
            detailRes?.data?.user?.[0]?.id ??
            detailRes?.data?.user_id ??
            detailRes?.data?.service?.user_id ??
            null;

          if (!userId) return [service.service_id, "-"];

          const bankRes = await getCustomerBankDetailsByUserId(userId);
          return [
            service.service_id,
            bankRes?.success && bankRes?.data?.pan_card_number
              ? bankRes.data.pan_card_number
              : "-",
          ];
        } catch {
          return [service.service_id, "-"];
        }
      })
    );

    setPanByServiceId(Object.fromEntries(panEntries));
  } catch (err) {
    console.error("Load error", err);
    setServices([]);
    setPending([]);
  } finally {
    setLoading(false);
    setHasLoaded(true);
  }
};

  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(req.id, action, "service");
      loadServices();
    } catch (err) {
      console.error("Wallet action failed", err);
      toast.error("Failed to update wallet request");
    }
  };

useEffect(() => {
  loadServices();
}, [page, search]);

const handleSearch = (term) => {
  setPage(1);
  setSearch(term);
};

  const toggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";
    await updateServiceStatus(service.id, newStatus);
    loadServices();
  };

  const openServiceModal = async (serviceId) => {
    setShowServiceModal(true);
    setServiceLoading(true);
    setSelectedService(null);

    try {
      const res = await getServiceLoginDetails(serviceId);
      if (res.status === "success") {
        setSelectedService(res.data);
      }
    } catch (e) {
      console.error("Failed to load service details", e);
    } finally {
      setServiceLoading(false);
    }
  };

  if (loading && !hasLoaded) return <ShopManagementSkeleton />;

  return (
    <div className="service-page">
       <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="page-title">Service Management</h2>

      {/* Pending Approvals */}
      <div className="card service-pending-panel">
        <h4 className="service-pending-title">
          Pending Fund Requests
        </h4>

        {pending.length === 0 ? (
          <p className="service-pending-empty">No pending requests</p>
        ) : (
          <div className="service-pending-table-wrap">
            <table className="service-pending-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Shop">{p.shop}</td>
                    <td data-label="Amount">₹{p.amount}</td>
                    <td className="service-pending-action-cell" data-label="Action">
                      <div className="service-pending-actions">
                        <button
                          type="button"
                          className="service-pending-action service-pending-action--approve"
                          title="Approve"
                          aria-label="Approve"
                          onClick={() => onWalletAction(p, "approve")}
                        >
                          <CheckCircle className="admin-action-icon" size={18} weight="bold" />
                          <span className="admin-action-label">Approve</span>
                        </button>

                        <button
                          type="button"
                          className="service-pending-action service-pending-action--reject"
                          title="Reject"
                          aria-label="Reject"
                          onClick={() => onWalletAction(p, "rejected")}
                        >
                          <XCircle className="admin-action-icon" size={18} weight="bold" />
                          <span className="admin-action-label">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Services Table */}
      <div className="card">
  <div className="table-scroll">
<div className="admin-search-area">
  <AdminSearch
    value={searchInput}
    appliedValue={search}
    onChange={setSearchInput}
    onSearch={handleSearch}
    placeholder="Search services by name or phone"
    label="Search services"
    loading={loading}
  />
</div>
    <table className="data-table">

          <thead>
            <tr>
              <th>Service</th>
              <th>Owner</th>
              <th>PAN Card</th>
              <th>Executive</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {services.map((s) => (
              <tr
                key={s.service_id}
                className="clickable-row"
                onClick={() => openServiceModal(s.service_id)}
              >
                <td data-label="Service">{s.name}</td>
                <td data-label="Owner">{s.owner_name || "-"}</td>
                <td data-label="PAN Card">{panByServiceId[s.service_id] || "-"}</td>
                <td data-label="Executive">{s.executive || "-"}</td>
                <td data-label="Wallet">₹{s.wallet_balance}</td>
                <td data-label="Status">
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td data-label="Action">
                  <button
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    title={s.status === "active" ? "Suspend" : "Activate"}
                    aria-label={s.status === "active" ? "Suspend" : "Activate"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(s);
                    }}
                  >
                    {s.status === "active" ? (
                      <PauseCircle className="admin-action-icon" size={18} weight="bold" />
                    ) : (
                      <PlayCircle className="admin-action-icon" size={18} weight="bold" />
                    )}
                    <span className="admin-action-label">
                      {s.status === "active" ? "Suspend" : "Activate"}
                    </span>
                  </button>
                  <button
  className="btn btn-danger"
  title="Delete"
  aria-label="Delete"
  onClick={(e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure to delete?")) {
      deleteService(s.id).then(() => loadServices());
    }
  }}
>
  <Trash className="admin-action-icon" size={18} weight="bold" />
  <span className="admin-action-label">Delete</span>
</button>
                </td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td colSpan="7">No services found</td>
              </tr>
            )}
          </tbody>
        </table>
     {Math.ceil(total / limit) > 1 && (
  <div className="pagination">
    <button
      type="button"
      className="page-btn page-btn--arrow"
      onClick={() => setPage((current) => Math.max(1, current - 1))}
      disabled={page === 1}
      aria-label="Previous page"
    >
      &lsaquo;
    </button>
  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
    <button
      key={i}
      className={`page-btn ${page === i + 1 ? "active" : ""}`}
      onClick={() => setPage(i + 1)}
    >
      {i + 1}
    </button>
  ))}
    <button
      type="button"
      className="page-btn page-btn--arrow"
      onClick={() =>
        setPage((current) => Math.min(Math.ceil(total / limit), current + 1))
      }
      disabled={page === Math.ceil(total / limit)}
      aria-label="Next page"
    >
      &rsaquo;
    </button>
</div>
     )}
      </div>
</div>
      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-container">

            <button
              className="shop-modal-close"
              onClick={() => setShowServiceModal(false)}
            >
              ✕
            </button>

            {serviceLoading && (
              <p className="modal-loading">Loading service details...</p>
            )}

            {!serviceLoading && selectedService && (() => {

              const service = selectedService.service;
              const user = selectedService.user?.[0];
              const media = selectedService.media || [];

              const logo = selectedService?.media?.length > 0? media.find(m => m.logo)?.logo:null;
              const images = media.filter(m => m.images).map(m => m.images);
              const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];

              return (
                <div className="shop-modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <img
                      src={logo!=null ? `${BASE_IMAGE_URL}/${logo}` : FALLBACK_IMAGE}
                      className="modal-shop-logo"
                      alt="Service Logo"
                    />

                    <div>
                      <h2>{service.name}</h2>
                      <p>Owner: {service.owner_name}</p>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="modal-stats">
                    <div className="stat-card">
                      <span className="stat-title">
                        <Wallet size={18} weight="duotone" />
                        Wallet
                      </span>
                      <strong>₹ {service.wallet_balance}</strong>
                    </div>

                    <div className="stat-card">
                      <span className="stat-title">
                        <Users size={18} weight="duotone" />
                        Customers
                      </span>
                      <strong>
                        {selectedService.transactions?.[0]?.customers_count || 0}
                      </strong>
                    </div>
                  </div>

                  {/* CONTACT */}
                  <div className="modal-section">
                    <h4>Contact Details</h4>

                    <div className="info-row">
                      <MapPin size={18} />
                      {service.address || "Not set"}
                    </div>

                    <div className="info-row">
                      <Phone size={18} />
                      {user?.phone || "Not set"}
                    </div>

                    <div className="info-row">
                      <EnvelopeSimple size={18} />
                      {user?.email || "Not set"}
                    </div>
                  </div>

                  {/* QR */}
                  {selectedService.scanner_code?.[0]?.scanner_code && (
                    <div className="modal-section center">
                      <h4 className="section-title">
                        <QrCode size={18} />
                        Service QR
                      </h4>

                      <QRCodeCanvas
                        value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                          selectedService.scanner_code[0].scanner_code
                        )}&type=service`}
                        size={160}
                        level="H"
                      />
                    </div>
                  )}

                  {/* GALLERY */}
                  <div className="modal-section">
                    <h4 className="section-title">
                      <ImageSquare size={18} />
                      Service Gallery
                    </h4>

                    {images.length === 0 ? (
                      <p>No images uploaded</p>
                    ) : (
                      <div className="modal-gallery">
                     {imageArray.length > 0 ? (
    imageArray.map((img, index) => (
      <div key={index} className="gallery-item">
        <img
          src={`${BASE_IMAGE_URL}/${img.trim()}` || FALLBACK_IMAGE}
          alt={`shop image ${index + 1}`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
    ))
  ) : (
    <div className="gallery-item">
      <img
        src={FALLBACK_IMAGE}
        alt="no image available"
        loading="lazy"
      />
    </div>
  )}

                      </div>
                    )}
                  </div>

                  {/* MAP */}
                  <div className="modal-section">
                    <h4 className="section-title">
                      <MapPin size={18} />
                      Service Location
                    </h4>

                    {service.latitude && service.longitude ? (
                      <MapContainer
                        center={[
                          Number(service.latitude),
                          Number(service.longitude)
                        ]}
                        zoom={16}
                        style={{ height: "220px", borderRadius: "12px" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[
                            Number(service.latitude),
                            Number(service.longitude)
                          ]}
                          icon={shopIcon}
                        >
                          <Popup>
                            <strong>{service.name}</strong>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <p>Location not available</p>
                    )}
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceManagement;
