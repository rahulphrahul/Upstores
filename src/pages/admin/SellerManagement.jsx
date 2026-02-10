import React, { useEffect, useState } from "react";
import {
  getSellers,
  getWalletRequests,
  updateSellerStatus,
  handleWalletRequest,
  getSellerLoginDetails
} from "../../service/apiService";
import "./SellerManagement.css";
import { BASE_IMAGE_URL } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";

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

function SellerManagement() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [pending, setPending] = useState([]);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const shop_type = "seller";

  const loadSellers = async () => {
    setLoading(true);
    try {
      const [sellersRes, pendingRes] = await Promise.all([
        getSellers(),
        getWalletRequests(shop_type),
      ]);

      setSellers(sellersRes?.data || sellersRes || []);
      setPending(pendingRes?.data || pendingRes || []);
    } catch (err) {
      console.error("Load error", err);
      setSellers([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  const onWalletAction = async (req, action) => {
    try {
      await handleWalletRequest(req.user_id, action, "seller");
      loadSellers();
    } catch (err) {
      console.error("Wallet action failed", err);
      alert("Failed to update wallet request");
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

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

  if (loading) return <ShopManagementSkeleton />;

  return (
    <div className="seller-page">
      <h2 className="page-title">Seller Management</h2>

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

      {/* Sellers Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Owner</th>
              <th>Executive</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sellers.map((s) => (
              <tr
                key={s.seller_id}
                className="clickable-row"
                onClick={() => openSellerModal(s.seller_id)}
              >
                <td>{s.name}</td>
                <td>{s.owner_name}</td>
                <td>{s.executive || "-"}</td>
                <td>₹{s.wallet_balance}</td>
                <td>
                  <span className={`status ${s.status}`}>{s.status}</span>
                </td>
                <td>
                  <button
                    className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {sellers.length === 0 && (
              <tr>
                <td colSpan="8">No sellers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-container">

            <button
              className="shop-modal-close"
              onClick={() => setShowSellerModal(false)}
            >
              ✕
            </button>

            {sellerLoading && (
              <p className="modal-loading">Loading seller details...</p>
            )}

            {!sellerLoading && selectedSeller && (() => {
              const seller = selectedSeller.seller;
              const user = selectedSeller.user?.[0];
              const media = selectedSeller.media || [];

              const logo = media.find(m => m.logo)?.logo;
              const images = media.filter(m => m.images).map(m => m.images);

              return (
                <div className="shop-modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <img
                      src={logo ? `${BASE_IMAGE_URL}/${logo}` : "/shop-placeholder.png"}
                      className="modal-shop-logo"
                      alt="Seller Logo"
                    />
                    <div>
                      <h2>{seller.name}</h2>
                      <p>Owner: {seller.owner_name}</p>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="modal-stats">
                    <div className="stat-card">
                      <span className="stat-title">
                        <Wallet size={18} weight="duotone" />
                        Wallet
                      </span>
                      <strong>₹ {seller.wallet_balance}</strong>
                    </div>

                    <div className="stat-card">
                      <span className="stat-title">
                        <Users size={18} weight="duotone" />
                        Customers
                      </span>
                      <strong>
                        {selectedSeller.transactions?.[0]?.customers_count || 0}
                      </strong>
                    </div>
                  </div>

                  {/* CONTACT */}
                  <div className="modal-section">
                    <h4>Contact Details</h4>

                    <div className="info-row">
                      <MapPin size={18} />
                      {seller.address || "Not set"}
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
                  {selectedSeller.scanner_code?.[0]?.scanner_code && (
                    <div className="modal-section center">
                      <h4 className="section-title">
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

                  {/* GALLERY */}
                  <div className="modal-section">
                    <h4 className="section-title">
                      <ImageSquare size={18} />
                      Seller Gallery
                    </h4>

                    {images.length === 0 ? (
                      <p>No images uploaded</p>
                    ) : (
                      <div className="modal-gallery">
                        {images.map((img, i) => (
                          <img key={i} src={`${BASE_IMAGE_URL}/${img}`} alt="Seller" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MAP */}
                  <div className="modal-section">
                    <h4 className="section-title">
                      <MapPin size={18} />
                      Seller Location
                    </h4>

                    {seller.latitude && seller.longitude ? (
                      <MapContainer
                        center={[Number(seller.latitude), Number(seller.longitude)]}
                        zoom={16}
                        style={{ height: "220px", borderRadius: "12px" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[Number(seller.latitude), Number(seller.longitude)]}
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
