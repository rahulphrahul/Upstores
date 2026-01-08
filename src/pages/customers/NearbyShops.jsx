import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./NearbyShops.css";

/* Mock shops */
const mockShops = [
  {
    id: 1,
    name: "Green Mart",
    category: "Grocery",
    distance: "0.8 km",
    lat: 12.971598,
    lng: 77.594566,
  },
  {
    id: 2,
    name: "Fresh Point",
    category: "Supermarket",
    distance: "1.4 km",
    lat: 12.975,
    lng: 77.6,
  },
  {
    id: 3,
    name: "Daily Needs",
    category: "Convenience",
    distance: "2.1 km",
    lat: 12.98,
    lng: 77.605,
  },
];

function NearbyShops() {
  const [view, setView] = useState("list");

  return (
    <div className="customer-page">
      <h2 className="page-title">Nearby Shops</h2>

      {/* VIEW TOGGLE */}
      <div className="view-toggle">
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => setView("list")}
        >
          List View
        </button>
        <button
          className={view === "map" ? "active" : ""}
          onClick={() => setView("map")}
        >
          Map View
        </button>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="shop-list">
          {mockShops.map((shop) => (
            <div key={shop.id} className="shop-card">
              <div>
                <h4>{shop.name}</h4>
                <p>{shop.category}</p>
                <span>{shop.distance} away</span>
              </div>
              <button className="btn btn-primary">
                View Shop
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MAP VIEW */}
      {view === "map" && (
        <MapContainer
          center={[12.971598, 77.594566]}
          zoom={13}
          className="map-box"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mockShops.map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
            >
              <Popup>
                <strong>{shop.name}</strong>
                <br />
                {shop.category}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

export default NearbyShops;
