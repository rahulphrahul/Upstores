import React, { useState } from "react";
import "./ConfigurationSettings.css";

function ConfigurationSettings() {
  /* =====================
     PERCENTAGE SETTINGS
  ====================== */
  const [distribution, setDistribution] = useState({
    admin: 20,
    executive: 40,
    customer: 40,
  });

  const totalPercentage =
    distribution.admin +
    distribution.executive +
    distribution.customer;

  /* =====================
     REDEMPTION RULES
  ====================== */
  const [redemption, setRedemption] = useState({
    minPoints: 100,
    maxPerDay: 1000,
    enabled: true,
  });

  /* =====================
     ANNOUNCEMENTS
  ====================== */
  const [banners, setBanners] = useState([
    { id: 1, title: "Maintenance", active: true },
  ]);

  const [bannerTitle, setBannerTitle] = useState("");

  /* =====================
     STATIC CONTENT
  ====================== */
  const [content, setContent] = useState({
    about: "",
    terms: "",
    privacy: "",
  });

  const addBanner = () => {
    if (!bannerTitle.trim()) return;
    setBanners((prev) => [
      ...prev,
      { id: Date.now(), title: bannerTitle, active: true },
    ]);
    setBannerTitle("");
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">Configuration Settings</h2>

      {/* =====================
         PERCENTAGE DISTRIBUTION
      ====================== */}
      <div className="card">
        <h3>Percentage Distribution</h3>

        <div className="grid">
          <div>
            <label>Admin (%)</label>
            <input
              type="number"
              value={distribution.admin}
              onChange={(e) =>
                setDistribution({
                  ...distribution,
                  admin: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>Executive (%)</label>
            <input
              type="number"
              value={distribution.executive}
              onChange={(e) =>
                setDistribution({
                  ...distribution,
                  executive: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>Customer (%)</label>
            <input
              type="number"
              value={distribution.customer}
              onChange={(e) =>
                setDistribution({
                  ...distribution,
                  customer: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <p className={`total ${totalPercentage !== 100 ? "error" : ""}`}>
          Total: {totalPercentage}%
        </p>

        <button
          className="primary-btn"
          disabled={totalPercentage !== 100}
        >
          Save Distribution
        </button>
      </div>

    </div>
  );
}

export default ConfigurationSettings;
