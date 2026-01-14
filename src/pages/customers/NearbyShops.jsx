import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getExecutiveNearbyShops } from "../../service/apiService";
import "./NearbyShops.css";

function NearbyShops({ user }) {
  const [view, setView] = useState("list");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  // ================= GET CURRENT LOCATION =================
  const fetchLocationAndShops = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(8));
        const lng = parseFloat(pos.coords.longitude.toFixed(8));
        setCoords({ lat, lng });

        // Fetch nearby shops from API
        getExecutiveNearbyShops(user.id, lat, lng)
          .then((res) => {
            if (res.status === "success") {
              setShops(res.data);
            } else {
              alert(res.message || "Error fetching shops");
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      },
      (err) => {
        setLoading(false);
        alert("Unable to get location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchLocationAndShops();
  }, []);

  // ================= UI =================
  return (
    <div className="customer-page">
      <h2 className="page-title">Nearby Shops</h2>

      <div className="view-toggle">
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
          List View
        </button>
        <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
          Map View
        </button>
      </div>

      {loading && <div className="loading">Fetching nearby shops...</div>}

      {view === "list" && !loading && (
        <div className="shop-list">
          {shops.map((shop) => (
            <div key={shop.id} className="shop-card">
              <div>
                <h4>{shop.name}</h4>
                <p>{shop.owner_name}</p>
                <span>{parseFloat(shop.distance).toFixed(2)} km away</span>
                <p>Wallet: ₹{shop.wallet_balance}</p>
              </div>
              <button className="btn btn-primary">View Shop</button>
            </div>
          ))}

          {shops.length === 0 && <p className="empty">No nearby shops found</p>}
        </div>
      )}

      {view === "map" && !loading && coords.lat && coords.lng && (
        <MapContainer center={[coords.lat, coords.lng]} zoom={13} className="map-box">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shops.map((shop) => (
            <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
              <Popup>
                <strong>{shop.name}</strong>
                <br />
                {shop.owner_name}
                <br />
                {parseFloat(shop.distance).toFixed(2)} km away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

export default NearbyShops;
