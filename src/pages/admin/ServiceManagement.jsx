import React, { useEffect, useState } from "react";
import {
  getServices,
  updateServiceStatus,
  handleWalletRequest,
  getWalletRequests,
  deleteService,
  getServiceLoginDetails
} from "../../service/apiService";
import "./ServiceManagement.css";
import { BASE_IMAGE_URL,FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";
import { toast, ToastContainer } from "react-toastify";
/* PHOSPHOR ICONS */
import {
  Wallet,
  Users,
  Phone,
  MapPin,
  EnvelopeSimple,
  QrCode,
  ImageSquare
} from "phosphor-react";

function ServiceManagement() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [pending, setPending] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
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

    setServices(serviceRes?.data || []);
    setTotal(serviceRes?.total || 0);
    setPending(pendingRes?.data || pendingRes || []);
  } catch (err) {
    console.error("Load error", err);
    setServices([]);
    setPending([]);
  } finally {
    setLoading(false);
  }
};

  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(req.user_id, action, "service");
      loadServices();
    } catch (err) {
      console.error("Wallet action failed", err);
      toast.error("Failed to update wallet request");
    }
  };

useEffect(() => {
  loadServices();
}, [page, search]);

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

  if (loading) return <ShopManagementSkeleton />;

  return (
    <div className="service-page">
       <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="page-title">Service Management</h2>

      {/* Pending Approvals */}
      <div className="card shadow-sm p-4 bg-white rounded-lg">
        <h4 className="mb-4 font-semibold text-lg">
          Pending Fund Requests
        </h4>

        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600">
                  <th className="p-3">Shop</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {pending.map((p) => (
                  <tr key={p.user_id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{p.shop}</td>
                    <td className="p-3 text-gray-700 font-semibold">₹{p.amount}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-success btn-sm px-3"
                          onClick={() => onWalletAction(p, "approve")}
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-danger btn-sm px-3"
                          onClick={() => onWalletAction(p, "rejected")}
                        >
                          Reject
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
<div className="search-bar">
  <input
    type="text"
    placeholder="Search services..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
  />

  <button className="btn btn-primary"
    onClick={() => {
      setPage(1);
      setSearch(searchInput);
    }}
  >
    Search
  </button>

  <button className="btn btn-secondary"
    onClick={() => {
      setSearchInput("");
      setSearch("");
      setPage(1);
    }}
  >
    Clear
  </button>
</div>
    <table className="data-table">

          <thead>
            <tr>
              <th>Service</th>
              <th>Owner</th>
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
                <td>{s.name}</td>
                <td>{s.owner_name || "-"}</td>
                <td>{s.executive || "-"}</td>
                <td>₹{s.wallet_balance}</td>
                <td>
                  <span className={`status ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  <button
  className="btn btn-danger"
  onClick={(e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure to delete?")) {
      deleteService(s.id).then(() => loadServices());
    }
  }}
>
  Delete
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
     <div className="pagination">
  {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
    <button
      key={i}
      className={`page-btn ${page === i + 1 ? "active" : ""}`}
      onClick={() => setPage(i + 1)}
    >
      {i + 1}
    </button>
  ))}
</div>
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
