import React, { useCallback, useEffect, useState } from "react";
import {
  getShops,
  getPendingShopFunds,
  handleWalletRequest,
  deleteShop,
  getShopLoginDetails,
  toggleShopStatus,
} from "../../service/apiService";
import { BASE_IMAGE_URL, FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";
import "./ShopManagement.css";

import {
  Wallet,
  Package,
  Phone,
  MapPin,
  EnvelopeSimple,
  QrCode,
  ImageSquare,
} from "phosphor-react";
import { toast, ToastContainer } from "react-toastify";

function ShopManagement() {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [pending, setPending] = useState([]);
  const [showShopModal, setShowShopModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const loadAll = useCallback(async () => {
    setLoading(true);

    const shopsRes = await getShops(page, search);
    setShops(shopsRes?.data || []);
    setTotal(shopsRes?.total || 0);

    const pendingRes = await getPendingShopFunds();
    setPending(pendingRes || []);

    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(req.id, action, "shop");
      loadAll();
    } catch (err) {
      console.error("Wallet action failed", err);
      toast.error("Failed to update wallet request");
    }
  };

  const openShopModal = async (shopId) => {
    setShowShopModal(true);
    setShopLoading(true);
    setSelectedShop(null);

    try {
      const res = await getShopLoginDetails(shopId);
      if (res.status === "success") {
        setSelectedShop(res.data);
      }
    } catch (e) {
      console.error("Failed to load shop details", e);
    } finally {
      setShopLoading(false);
    }
  };

  if (loading) return <ShopManagementSkeleton />;

  return (
    <div className="admin-shop-management">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="admin-shop-management__title">Shop Management</h2>

      <div className="admin-shop-management__panel">
        <h4 className="admin-shop-management__section-title">
          Pending Fund Requests
        </h4>

        {pending.length === 0 ? (
          <p className="admin-shop-management__empty-text">
            No pending requests
          </p>
        ) : (
          <div className="admin-shop-management__table-scroll">
            <table className="admin-shop-management__pending-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => (
                  <tr key={item.id}>
                    <td>{item.shop}</td>
                    <td>&#8377;{item.amount}</td>
                    <td>
                      <div className="admin-shop-management__action-group admin-shop-management__action-group--center">
                        <button
                          type="button"
                          className="admin-shop-management__button admin-shop-management__button--approve"
                          onClick={() => onWalletAction(item, "approve")}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="admin-shop-management__button admin-shop-management__button--reject"
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

      <div className="admin-shop-management__panel">
        <div className="admin-shop-management__toolbar">
          <input
            type="text"
            placeholder="Search shop..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-shop-management__search-input"
          />

          <button
            type="button"
            className="admin-shop-management__button admin-shop-management__button--search"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            type="button"
            className="admin-shop-management__button admin-shop-management__button--clear"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>

        <div className="admin-shop-management__table-scroll">
          <table className="admin-shop-management__data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Executive</th>
                <th>Wallet</th>
                <th className="admin-shop-management__column--status">
                  Status
                </th>
                <th className="admin-shop-management__column--action">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr
                  key={shop.shop_id}
                  className="admin-shop-management__row--clickable"
                  onClick={() => openShopModal(shop.shop_id)}
                >
                  <td>{shop.name}</td>
                  <td>{shop.owner_name}</td>
                  <td>{shop.executive || "-"}</td>
                  <td>&#8377;{shop.wallet_balance}</td>
                  <td className="admin-shop-management__cell--status">
                    <span
                      className={`admin-shop-management__status admin-shop-management__status--${String(
                        shop.status
                      ).toLowerCase()}`}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td className="admin-shop-management__cell--action">
                    <div className="admin-shop-management__action-group">
                      <button
                        type="button"
                        className={`admin-shop-management__button ${
                          shop.status === "active"
                            ? "admin-shop-management__button--suspend"
                            : "admin-shop-management__button--activate"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShopStatus(shop.id, shop.status).then(loadAll);
                        }}
                      >
                        {shop.status === "active" ? "Suspend" : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="admin-shop-management__button admin-shop-management__button--danger"
                        onClick={async (e) => {
                          e.stopPropagation();

                          if (
                            window.confirm("Are you sure to delete this shop?")
                          ) {
                            await deleteShop(shop.id);
                            loadAll();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {shops.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-shop-management__empty-cell">
                    No shops found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {Math.ceil(total / limit) > 1 && (
          <div className="admin-shop-management__pagination">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`admin-shop-management__page-btn ${
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

      {showShopModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-container">
            <button
              type="button"
              className="shop-modal-close"
              onClick={() => setShowShopModal(false)}
            >
              &times;
            </button>

            {shopLoading && (
              <p className="modal-loading">Loading shop details...</p>
            )}

            {!shopLoading &&
              selectedShop &&
              (() => {
                const logo =
                  selectedShop.media?.length > 0
                    ? selectedShop.media.find(
                        (mediaItem) => mediaItem.logo && mediaItem.logo !== ""
                      )?.logo
                    : null;

                const images =
                  selectedShop.media?.filter((mediaItem) => mediaItem.images).map(
                    (mediaItem) => mediaItem.images
                  ) || [];

                const imageArray =
                  images.length > 0
                    ? images[0].split(",").filter((img) => img.trim() !== "")
                    : [];

                return (
                  <div className="shop-modal-content">
                    <div className="modal-header">
                      <img
                        src={
                          logo ? `${BASE_IMAGE_URL}/${logo}` : FALLBACK_IMAGE
                        }
                        className="modal-shop-logo"
                        alt="Shop Logo"
                      />

                      <div>
                        <h2>{selectedShop.shop.name}</h2>
                        <p>Owner: {selectedShop.shop.owner_name}</p>
                      </div>
                    </div>

                    <div className="modal-stats">
                      <div className="stat-card">
                        <span className="stat-title">
                          <Wallet size={18} weight="duotone" />
                          Wallet
                        </span>
                        <strong>
                          &#8377; {selectedShop.shop.wallet_balance || 0}
                        </strong>
                      </div>

                      <div className="stat-card">
                        <span className="stat-title">
                          <Package size={18} weight="duotone" />
                          Orders
                        </span>
                        <strong>{selectedShop.shop.total_orders || 0}</strong>
                      </div>
                    </div>

                    <div className="modal-section">
                      <h4>Contact Details</h4>

                      <div className="info-row">
                        <MapPin size={18} />
                        {selectedShop.shop.address || "Not set"}
                      </div>

                      <div className="info-row">
                        <Phone size={18} />
                        {selectedShop.user?.[0]?.phone || "Not set"}
                      </div>

                      <div className="info-row">
                        <EnvelopeSimple size={18} />
                        {selectedShop.user?.[0]?.email || "Not set"}
                      </div>
                    </div>

                    {selectedShop.scanner_code?.[0]?.scanner_code && (
                      <div className="modal-section center">
                        <h4 className="section-title">
                          <QrCode size={18} />
                          Shop QR
                        </h4>

                        <QRCodeCanvas
                          value={`https://semicoloninnovations.in/upstores/api/scanner_qr.php?code=${encodeURIComponent(
                            selectedShop.scanner_code[0].scanner_code
                          )}&type=shop`}
                          size={160}
                          level="H"
                        />
                      </div>
                    )}

                    <div className="modal-section">
                      <h4 className="section-title">
                        <ImageSquare size={18} />
                        Shop Gallery
                      </h4>

                      {images.length === 0 ? (
                        <p>No images uploaded</p>
                      ) : (
                        <div className="modal-gallery">
                          {imageArray.length > 0 ? (
                            imageArray.map((img, index) => (
                              <div key={index} className="gallery-item">
                                <img
                                  src={
                                    img.trim()
                                      ? `${BASE_IMAGE_URL}/${img.trim()}`
                                      : FALLBACK_IMAGE
                                  }
                                  alt={`Shop gallery ${index + 1}`}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="gallery-item">
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

                    <div className="modal-section">
                      <h4 className="section-title">
                        <MapPin size={18} />
                        Shop Location
                      </h4>

                      {selectedShop.shop.latitude &&
                      selectedShop.shop.longitude ? (
                        <MapContainer
                          center={[
                            selectedShop.shop.latitude,
                            selectedShop.shop.longitude,
                          ]}
                          zoom={16}
                          style={{
                            height: "220px",
                            borderRadius: "12px",
                          }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[
                              selectedShop.shop.latitude,
                              selectedShop.shop.longitude,
                            ]}
                            icon={shopIcon}
                          >
                            <Popup>
                              <strong>{selectedShop.shop.name}</strong>
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

export default ShopManagement;
