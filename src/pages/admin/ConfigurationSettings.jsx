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

      {/* =====================
         REDEMPTION RULES
      ====================== */}
      <div className="card">
        <h3>Redemption Rules</h3>

        <div className="grid">
          <div>
            <label>Minimum Points</label>
            <input
              type="number"
              value={redemption.minPoints}
              onChange={(e) =>
                setRedemption({
                  ...redemption,
                  minPoints: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label>Max Redemption / Day</label>
            <input
              type="number"
              value={redemption.maxPerDay}
              onChange={(e) =>
                setRedemption({
                  ...redemption,
                  maxPerDay: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="toggle">
            <label>
              <input
                type="checkbox"
                checked={redemption.enabled}
                onChange={(e) =>
                  setRedemption({
                    ...redemption,
                    enabled: e.target.checked,
                  })
                }
              />
              Enable Redemption
            </label>
          </div>
        </div>

        <button className="primary-btn">
          Save Rules
        </button>
      </div>

      {/* =====================
         ANNOUNCEMENTS
      ====================== */}
      <div className="card">
        <h3>Announcement Banners</h3>

        <div className="banner-input">
          <input
            type="text"
            placeholder="Banner title"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
          />
          <button className="primary-btn" onClick={addBanner}>
            Add
          </button>
        </div>

        <ul className="banner-list">
          {banners.map((banner) => (
            <li key={banner.id}>
              <span>{banner.title}</span>
              <input
                type="checkbox"
                checked={banner.active}
                onChange={() =>
                  setBanners((prev) =>
                    prev.map((b) =>
                      b.id === banner.id
                        ? { ...b, active: !b.active }
                        : b
                    )
                  )
                }
              />
            </li>
          ))}
        </ul>
      </div>

      {/* =====================
         STATIC CONTENT
      ====================== */}
      <div className="card">
        <h3>Static Content Management</h3>

        <label>About App</label>
        <textarea
          rows="3"
          value={content.about}
          onChange={(e) =>
            setContent({ ...content, about: e.target.value })
          }
        />

        <label>Terms & Conditions</label>
        <textarea
          rows="3"
          value={content.terms}
          onChange={(e) =>
            setContent({ ...content, terms: e.target.value })
          }
        />

        <label>Privacy Policy</label>
        <textarea
          rows="3"
          value={content.privacy}
          onChange={(e) =>
            setContent({ ...content, privacy: e.target.value })
          }
        />

        <button className="primary-btn">
          Save Content
        </button>
      </div>
    </div>
  );
}

export default ConfigurationSettings;
