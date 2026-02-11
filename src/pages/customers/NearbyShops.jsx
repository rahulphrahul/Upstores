import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { BASE_IMAGE_URL } from "../../config/config";
import {
  getExecutiveNearbyShops,
  getExecutiveNearbySellers,
  getExecutiveNearbyServices,
  getNearbyItemDetails
} from "../../service/apiService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ViewShop from "./ViewShop";
import "./NearbyShops.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

function NearbyShops({ user }) {
  const [view, setView] = useState("list");
  const [category, setCategory] = useState("shops"); // shops | sellers | services
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
 const [coords, setCoords] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [modalLoading, setModalLoading] = useState(false);

  const fetchData = (lat, lng, type) => {
    setLoading(true);

    let apiCall;
    if (type === "shops") {
      apiCall = getExecutiveNearbyShops(user.id, lat, lng);
    } else if (type === "sellers") {
      apiCall = getExecutiveNearbySellers(user.id, lat, lng);
    } else {
      apiCall = getExecutiveNearbyServices(user.id, lat, lng);
    }

    apiCall
      .then((res) => {
        if (res.status === "success") {
          setItems(res.data);
        } else {
          alert(res.message || "Error fetching data");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(8));
        const lng = parseFloat(pos.coords.longitude.toFixed(8));
        setCoords({ lat, lng });
        fetchData(lat, lng, category);
      },
      (err) => {
        alert("Unable to get location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (coords && coords.lat && coords.lng ) {
      fetchData(coords.lat, coords.lng, category);
    }
  }, [category]);
  const openItemModal = async (id) => {
  setShowModal(true);
  setModalLoading(true);
  setSelectedItem(null);

  try {
    const res = await getNearbyItemDetails(id, category);
    if (res.status === "success") {
      setSelectedItem(res.data);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setModalLoading(false);
  }
};
console.log("selectedItem",selectedItem);

  return (
    <div className="nearby-container">
      <h2 className="page-title">Nearby</h2>

      {/* Category Tabs */}
      <div className="category-tabs">
        {["shops", "sellers", "services"].map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={view === "map" ? "active" : ""}
          onClick={() => setView("map")}
        >
          Map
        </button>
      </div>

      {loading && <div className="loading">Loading nearby {category}...</div>}

      {/* ================= LIST VIEW ================= */}
      {view === "list" && !loading && (
        <div className="card-list">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="card-info">
                <h4>{item.name}</h4>
                <p>{item.owner_name || item.category_name}</p>
                <span>
                  {parseFloat(item.distance).toFixed(2)} km away
                </span>
                {item.wallet_balance && (
                  <p>Wallet: ₹{item.wallet_balance}</p>
                )}
              </div>

              <button
                className="btn-primary"
           onClick={() => {
  const id = item.shop_id || item.seller_id || item.service_id;
  openItemModal(id);
}}
              >
                View
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="empty">No nearby {category} found</p>
          )}
        </div>
      )}

      {/* ================= MAP VIEW ================= */}
      {view === "map" &&
  !loading &&
  coords &&
  coords.lat !== null &&
  coords.lng !== null &&
  coords.lat !== 0 &&
  coords.lng !== 0 && (

        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={13}
          className="map-box"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

         {items
  .filter(item => item.latitude && item.longitude)
  .map((item) => (
    <Marker
      key={item.id}
      position={[
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      ]}
    >
              <Popup>
                <strong>{item.name}</strong>
                <br />
                {parseFloat(item.distance).toFixed(2)} km away
                <br />
                <button
                  className="btn-primary small"
                  onClick={() => setSelectedId(item.id)}
                >
                  View
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* ================= MODAL ================= */}
   {showModal && (
  <div className="shop-modal-overlay">
    <div className="shop-modal-container">

      <button
        className="shop-modal-close"
        onClick={() => setShowModal(false)}
      >
        ✕
      </button>

      {modalLoading && (
        <p className="modal-loading">
          Loading {category} details...
        </p>
      )}

      {!modalLoading && selectedItem && (() => {

        const logo =
          selectedItem.media?.find(m => m.logo)?.logo;

        const images =
          selectedItem.media
            ?.filter(m => m.images)
            .map(m => m.images) || [];

        return (
          <div className="shop-modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <img
                src={
                  logo
                    ? `${BASE_IMAGE_URL}/${logo}`
                    : "/shop-placeholder.png"
                }
                className="modal-shop-logo"
                alt="logo"
              />

              <div>
                <h2>{selectedItem.shop?.name ||
   selectedItem.seller?.name ||
   selectedItem.service?.name}</h2>
                <p>
                  Owner: {selectedItem.shop?.owner_name ||
   selectedItem.seller?.owner_name ||
   selectedItem.service?.owner_name}
                </p>
              </div>
            </div>

            {/* STATS */}
            <div className="modal-stats">
              <div className="stat-card">
                <span>💰 Wallet</span>
                <strong>
                  ₹ {selectedItem.shop?.wallet_balance ||
   selectedItem.seller?.wallet_balance ||
   selectedItem.service?.wallet_balance}
                </strong>
              </div>
              <div className="stat-card">
                <span>📦 Orders</span>
                <strong>
                  {selectedItem.shop?.total_orders ||
   selectedItem.seller?.total_orders ||
   selectedItem.service?.total_orders}
                </strong>
              </div>
            </div>

            {/* CONTACT */}
            <div className="modal-section">
              <h4>📞 Contact</h4>
              <div>
                📍                   {selectedItem.shop?.address ||
   selectedItem.seller?.address ||
   selectedItem.service?.address || "Not set"}
              </div>
              <div>
                📞 {selectedItem.user?.[0]?.phone || "Not set"}
              </div>
              <div>
                ✉️ {selectedItem.user?.[0]?.email || "Not set"}
              </div>
            </div>

            {/* GALLERY */}
            <div className="modal-section">
              <h4>🖼️ Gallery</h4>

              {images.length === 0 ? (
                <p>No images uploaded</p>
              ) : (
                <div className="modal-gallery">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={`${BASE_IMAGE_URL}/${img}`}
                      alt="item"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* MAP */}
            <div className="modal-section">
              <h4>📍 Location</h4>

              {selectedItem.shop?.latitude ||
   selectedItem.seller?.latitude ||
   selectedItem.service?.latitude &&
              selectedItem.shop?.longitude ||
   selectedItem.seller?.longitude ||
   selectedItem.service?.longitude ? (
                <MapContainer
                  center={[
                    selectedItem.shop?.latitude ||
   selectedItem.seller?.latitude ||
   selectedItem.service?.latitude,
                    selectedItem.shop?.longitude ||
   selectedItem.seller?.longitude ||
   selectedItem.service?.longitude
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
                     selectedItem.shop?.latitude ||
   selectedItem.seller?.latitude ||
   selectedItem.service?.latitude,
                    selectedItem.shop?.longitude ||
   selectedItem.seller?.longitude ||
   selectedItem.service?.longitude
                    ]}
                  >
                    <Popup>
                      <strong>
                       {selectedItem.shop?.name ||
   selectedItem.seller?.name ||
   selectedItem.service?.name}
                      </strong>
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

export default NearbyShops;
