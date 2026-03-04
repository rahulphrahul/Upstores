import React, { useEffect, useState } from "react";
import {
  getSellers,
  getWalletRequests,
  updateSellerStatus,
  handleWalletRequest,
  deleteSeller,
  getSellerLoginDetails
} from "../../service/apiService";
import "./SellerManagement.css";
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

  const shop_type = "seller";

const loadSellers = async () => {
  setLoading(true);
  try {
    const sellersRes = await getSellers(page, search);
    const pendingRes = await getWalletRequests(shop_type);

    setSellers(sellersRes?.data || []);
    setTotal(sellersRes?.total || 0);
    setPending(pendingRes?.data || pendingRes || []);
  } catch (err) {
    console.error("Load error", err);
    setSellers([]);
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
      toast.error("Failed to update wallet request");
    }
  };

 useEffect(() => {
  loadSellers();
}, [page, search]);

const handleSearch = () => {
  setPage(1);
  setSearch(searchInput);
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

  if (loading) return <ShopManagementSkeleton />;

  return (
    <div className="seller-page">
       <ToastContainer position="top-right" autoClose={2000} />
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
  <div className="table-scroll">
    <div className="table-header">
  <input
    type="text"
    placeholder="Search seller..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    className="search-input"
  />

  <button className="btn btn-primary" onClick={handleSearch}>
    Search
  </button>

  <button
    className="btn btn-secondary"
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
  <div className="flex gap-2">
    <button
      className={`btn ${s.status === "active" ? "btn-suspend" : "btn-activate"}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleStatus(s);
      }}
    >
      {s.status === "active" ? "Suspend" : "Activate"}
    </button>

    <button
      className="btn btn-danger"
      onClick={async (e) => {
        e.stopPropagation();
        if (window.confirm("Delete this seller?")) {
          await deleteSeller(s.id);
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
                <td colSpan="8">No sellers found</td>
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

              const logo =  selectedSeller?.media?.length > 0? media.find(m => m.logo)?.logo:null;
              const images = media.filter(m => m.images).map(m => m.images);
           console.log("imggs",images.length);   
const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];
              return (
                <div className="shop-modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <img
                      src={logo !=null ? `${BASE_IMAGE_URL}/${logo}` : FALLBACK_IMAGE}
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
