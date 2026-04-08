import React, { useCallback, useEffect, useState } from "react";
import {
  getSellers,
  getWalletRequests,
  updateSellerStatus,
  handleWalletRequest,
  deleteSeller,
  getSellerLoginDetails,
} from "../../service/apiService";
import "./SellerManagement.css";
import { BASE_IMAGE_URL, FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import SellerManagementSkeleton from "./skeletons/SellerManagementSkeleton";
import { toast, ToastContainer } from "react-toastify";

import {
  Wallet,
  Users,
  Phone,
  MapPin,
  EnvelopeSimple,
  QrCode,
  ImageSquare,
} from "phosphor-react";

function SellerManagement() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [pending, setPending] = useState([]);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;
  const shopType = "seller";

  const loadSellers = useCallback(async () => {
    setLoading(true);

    try {
      const sellersRes = await getSellers(page, search);
      const pendingRes = await getWalletRequests(shopType);

      setSellers(sellersRes?.data || []);
      setTotal(sellersRes?.total || 0);
      setPending(pendingRes?.data || pendingRes || []);
    } catch (err) {
      console.error("Load error", err);
      setSellers([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(req.id, action, "seller");
      loadSellers();
    } catch (err) {
      console.error("Wallet action failed", err);
      toast.error("Failed to update wallet request");
    }
  };

  const toggleStatus = async (seller) => {
    const newStatus = seller.status === "active" ? "suspended" : "active";
    await updateSellerStatus(seller.id, newStatus);
    loadSellers();
  };

  const openSellerModal = async (sellerId) => {
    setShowSellerModal(true);
    setSellerLoading(true);
    setSelectedSeller(null);

    try {
      const res = await getSellerLoginDetails(sellerId);
      if (res.status === "success") {
        setSelectedSeller(res.data);
      }
    } catch (e) {
      console.error("Failed to load seller details", e);
    } finally {
      setSellerLoading(false);
    }
  };

  if (loading) return <SellerManagementSkeleton />;

  return (
    <div className="admin-seller-management">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="admin-seller-management__title">Seller Management</h2>

      <div className="admin-seller-management__panel">
        <h4 className="admin-seller-management__section-title">
          Pending Fund Requests
        </h4>

        {pending.length === 0 ? (
          <p className="admin-seller-management__empty-text">
            No pending requests
          </p>
        ) : (
          <div className="admin-seller-management__table-scroll">
            <table className="admin-seller-management__pending-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th className="admin-seller-management__column--pending-action">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {pending.map((item) => (
                  <tr key={item.id}>
                    <td>{item.shop}</td>
                    <td>&#8377;{item.amount}</td>
                    <td className="admin-seller-management__cell--pending-action">
                      <div className="admin-seller-management__action-group admin-seller-management__action-group--center">
                        <button
                          type="button"
                          className="admin-seller-management__button admin-seller-management__button--approve"
                          onClick={() => onWalletAction(item, "approve")}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="admin-seller-management__button admin-seller-management__button--reject"
                          onClick={() => onWalletAction(item, "rejected")}
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

      <div className="admin-seller-management__panel">
        <div className="admin-seller-management__toolbar">
          <input
            type="text"
            placeholder="Search seller..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-seller-management__search-input"
          />

          <button
            type="button"
            className="admin-seller-management__button admin-seller-management__button--search"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            type="button"
            className="admin-seller-management__button admin-seller-management__button--clear"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>

        <div className="admin-seller-management__table-scroll">
          <table className="admin-seller-management__data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Owner</th>
                <th>Executive</th>
                <th>Wallet</th>
                <th className="admin-seller-management__column--status">
                  Status
                </th>
                <th className="admin-seller-management__column--action">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {sellers.map((seller) => (
                <tr
                  key={seller.seller_id}
                  className="admin-seller-management__row--clickable"
                  onClick={() => openSellerModal(seller.seller_id)}
                >
                  <td>{seller.name}</td>
                  <td>{seller.owner_name}</td>
                  <td>{seller.executive || "-"}</td>
                  <td>&#8377;{seller.wallet_balance}</td>
                  <td className="admin-seller-management__cell--status">
                    <span
                      className={`admin-seller-management__status admin-seller-management__status--${String(
                        seller.status
                      ).toLowerCase()}`}
                    >
                      {seller.status}
                    </span>
                  </td>
                  <td className="admin-seller-management__cell--action">
                    <div className="admin-seller-management__action-group">
                      <button
                        type="button"
                        className={`admin-seller-management__button ${
                          seller.status === "active"
                            ? "admin-seller-management__button--suspend"
                            : "admin-seller-management__button--activate"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(seller);
                        }}
                      >
                        {seller.status === "active" ? "Suspend" : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="admin-seller-management__button admin-seller-management__button--danger"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this seller?")) {
                            await deleteSeller(seller.id);
                            loadSellers();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sellers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-seller-management__empty-cell"
                  >
                    No sellers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {Math.ceil(total / limit) > 1 && (
          <div className="admin-seller-management__pagination">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`admin-seller-management__page-btn ${
                  page === i + 1 ? "active" : ""
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {showSellerModal && (
        <div className="admin-seller-modal__overlay">
          <div className="admin-seller-modal__container">
            <button
              type="button"
              className="admin-seller-modal__close"
              onClick={() => setShowSellerModal(false)}
            >
              &times;
            </button>

            {sellerLoading && (
              <p className="admin-seller-modal__loading">
                Loading seller details...
              </p>
            )}

            {!sellerLoading &&
              selectedSeller &&
              (() => {
                const seller = selectedSeller.seller;
                const user = selectedSeller.user?.[0];
                const media = selectedSeller.media || [];

                const logo =
                  selectedSeller.media?.length > 0
                    ? media.find((item) => item.logo)?.logo
                    : null;
                const images = media
                  .filter((item) => item.images)
                  .map((item) => item.images);
                const imageArray =
                  images.length > 0
                    ? images[0].split(",").filter((img) => img.trim() !== "")
                    : [];

                return (
                  <div className="admin-seller-modal__content">
                    <div className="admin-seller-modal__header">
                      <img
                        src={logo ? `${BASE_IMAGE_URL}/${logo}` : FALLBACK_IMAGE}
                        className="admin-seller-modal__logo"
                        alt="Seller Logo"
                      />
                      <div>
                        <h2>{seller.name}</h2>
                        <p>Owner: {seller.owner_name}</p>
                      </div>
                    </div>

                    <div className="admin-seller-modal__stats">
                      <div className="admin-seller-modal__stat-card">
                        <span className="admin-seller-modal__stat-title">
                          <Wallet size={18} weight="duotone" />
                          Wallet
                        </span>
                        <strong>&#8377; {seller.wallet_balance}</strong>
                      </div>

                      <div className="admin-seller-modal__stat-card">
                        <span className="admin-seller-modal__stat-title">
                          <Users size={18} weight="duotone" />
                          Customers
                        </span>
                        <strong>
                          {selectedSeller.transactions?.[0]?.customers_count || 0}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-seller-modal__section">
                      <h4>Contact Details</h4>

                      <div className="admin-seller-modal__info-row">
                        <MapPin size={18} />
                        {seller.address || "Not set"}
                      </div>

                      <div className="admin-seller-modal__info-row">
                        <Phone size={18} />
                        {user?.phone || "Not set"}
                      </div>

                      <div className="admin-seller-modal__info-row">
                        <EnvelopeSimple size={18} />
                        {user?.email || "Not set"}
                      </div>
                    </div>

                    {selectedSeller.scanner_code?.[0]?.scanner_code && (
                      <div className="admin-seller-modal__section admin-seller-modal__section--center">
                        <h4 className="admin-seller-modal__section-title">
                          <QrCode size={18} />
                          Seller QR
                        </h4>

                        <QRCodeCanvas
                          value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                            selectedSeller.scanner_code[0].scanner_code
                          )}&type=seller`}
                          size={160}
                          level="H"
                        />
                      </div>
                    )}

                    <div className="admin-seller-modal__section">
                      <h4 className="admin-seller-modal__section-title">
                        <ImageSquare size={18} />
                        Seller Gallery
                      </h4>

                      {images.length === 0 ? (
                        <p>No images uploaded</p>
                      ) : (
                        <div className="admin-seller-modal__gallery">
                          {imageArray.length > 0 ? (
                            imageArray.map((img, index) => (
                              <div
                                key={index}
                                className="admin-seller-modal__gallery-item"
                              >
                                <img
                                  src={
                                    img.trim()
                                      ? `${BASE_IMAGE_URL}/${img.trim()}`
                                      : FALLBACK_IMAGE
                                  }
                                  alt={`Seller gallery ${index + 1}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="admin-seller-modal__gallery-item">
                              <img
                                src={FALLBACK_IMAGE}
                                alt="No gallery upload"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="admin-seller-modal__section">
                      <h4 className="admin-seller-modal__section-title">
                        <MapPin size={18} />
                        Seller Location
                      </h4>

                      {seller.latitude && seller.longitude ? (
                        <MapContainer
                          center={[
                            Number(seller.latitude),
                            Number(seller.longitude),
                          ]}
                          zoom={16}
                          style={{ height: "220px", borderRadius: "12px" }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[
                              Number(seller.latitude),
                              Number(seller.longitude),
                            ]}
                            icon={shopIcon}
                          >
                            <Popup>
                              <strong>{seller.name}</strong>
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

export default SellerManagement;
