import React, { useEffect, useState } from "react";
import {
    getShops,
    getPendingShopFunds,
    handleWalletRequest,
    shopFundAction,
    deleteShop,
    getShopLoginDetails,
    toggleShopStatus,
} from "../../service/apiService";
import { BASE_IMAGE_URL,FALLBACK_IMAGE } from "../../config/config";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { shopIcon } from "../../utils/leafletIcon";
import ShopManagementSkeleton from "./skeletons/ShopManagementSkeleton";
import "./ShopManagement.css";

/* PHOSPHOR ICONS */
import {
  Wallet,
  Package,
  Phone,
  MapPin,
  EnvelopeSimple,
  QrCode,
  ImageSquare
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
    const limit = 10;
const [searchInput, setSearchInput] = useState("");

const loadAll = async () => {
    setLoading(true);

    const shopsRes = await getShops(page, search);

    setShops(shopsRes?.data || []);
    setTotal(shopsRes?.total || 0);

    const pendingRes = await getPendingShopFunds();
    setPending(pendingRes || []);

    setLoading(false);
};

useEffect(() => {
   loadAll();
}, [page, search]);

const handleSearch = () => {
   setPage(1);       // reset to page 1
   setSearch(searchInput);  // set actual search
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
        <div className="shop-page">
             <ToastContainer position="top-right" autoClose={2000} />
            <h2 className="page-title">Shop Management</h2>

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
                                    <tr
                                        key={p.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="p-3 font-medium text-gray-800">
                                            {p.shop}
                                        </td>

                                        <td className="p-3 text-gray-700 font-semibold">
                                            ₹{p.amount}
                                        </td>

                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    className="btn btn-success btn-sm px-3"
                                                    onClick={() =>
                                                        onWalletAction(p, "approve")
                                                    }
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm px-3"
                                                    onClick={() =>
                                                        onWalletAction(p, "rejected")
                                                    }
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

            {/* Shops Table */}
           <div className="card">
  <div className="table-scroll">
      <div className="table-header">
    <input
        type="text"
        placeholder="Search shop..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="search-input"
    />

    <button
        className="btn btn-primary"
        onClick={handleSearch}
    >
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
                            <th>Shop</th>
                            <th>Owner</th>
                            <th>Executive</th>
                            <th>Wallet</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shops.map((s) => (
                            <tr
                                key={s.shop_id}
                                className="clickable-row"
                                onClick={() => openShopModal(s.shop_id)}
                            >
                                <td>{s.name}</td>
                                <td>{s.owner_name}</td>
                                <td>{s.executive || "-"}</td>
                                <td>₹{s.wallet_balance}</td>
                                <td> 
                                    <span className={`status ${s.status}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td>
    <div className="flex gap-2">
        <button
            className={`btn ${
                s.status === "active"
                    ? "btn-suspend"
                    : "btn-activate"
            }`}
            onClick={(e) => {
                e.stopPropagation();
                toggleShopStatus(s.id, s.status).then(loadAll);
            }}
        >
            {s.status === "active"
                ? "Suspend"
                : "Activate"}
        </button>

        <button
            className="btn btn-danger"
            onClick={async (e) => {
                e.stopPropagation();

                if (window.confirm("Are you sure to delete this shop?")) {
                    await deleteShop(s.id);
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
                                <td colSpan="6">No shops found</td>
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
            {/* SHOP DETAILS MODAL */}
            {showShopModal && (
                <div className="shop-modal-overlay">
                    <div className="shop-modal-container">

                        <button
                            className="shop-modal-close"
                            onClick={() => setShowShopModal(false)}
                        >
                            ✕
                        </button>

                        {shopLoading && (
                            <p className="modal-loading">Loading shop details...</p>
                        )}

                        {!shopLoading && selectedShop && (() => {

                            const logo =
                                selectedShop.media.length>0 ? selectedShop.media?.find(m => m.logo && m.logo !== "")?.logo:null;

                            const images =
                                selectedShop.media?.filter(m => m.images).map(m => m.images) || [];
                                const imageArray = images && images.length >0
  ? images[0].split(",").filter((img) => img.trim() !== "")
  : [];

                            return (
                                <div className="shop-modal-content">

                                    {/* HEADER */}
                                    <div className="modal-header">
                                        <img
                                            src={
                                                logo!=null
                                                    ? `${BASE_IMAGE_URL}/${logo}`
                                                    : FALLBACK_IMAGE
                                            }
                                            className="modal-shop-logo"
                                            alt="Shop Logo"
                                        />

                                        <div>
                                            <h2>{selectedShop.shop.name}</h2>
                                            <p>Owner: {selectedShop.shop.owner_name}</p>
                                        </div>
                                    </div>

                                    {/* STATS */}
                                    <div className="modal-stats">
                                        <div className="stat-card">
                                            <span className="stat-title">
                                                <Wallet size={18} weight="duotone" />
                                                Wallet
                                            </span>
                                            <strong>₹ {selectedShop.shop.wallet_balance || 0}</strong>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-title">
                                                <Package size={18} weight="duotone" />
                                                Orders
                                            </span>
                                            <strong>{selectedShop.shop.total_orders || 0}</strong>
                                        </div>
                                    </div>

                                    {/* CONTACT */}
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

                                    {/* QR */}
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

                                    {/* GALLERY */}
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
                                            Shop Location
                                        </h4>

                                        {selectedShop.shop.latitude && selectedShop.shop.longitude ? (
                                            <MapContainer
                                                center={[
                                                    selectedShop.shop.latitude,
                                                    selectedShop.shop.longitude
                                                ]}
                                                zoom={16}
                                                style={{
                                                    height: "220px",
                                                    borderRadius: "12px"
                                                }}
                                            >
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <Marker
                                                    position={[
                                                        selectedShop.shop.latitude,
                                                        selectedShop.shop.longitude
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
