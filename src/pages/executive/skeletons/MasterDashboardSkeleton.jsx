import React from "react";
import "./MasterDashboardSkeleton.css";

function MasterDashboardSkeleton() {
  return (
    <div className="md-skeleton">
      {/* STAT CARDS */}
      <div className="stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card skeleton" />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid-2">
        <div className="card skeleton chart-skeleton" />
        <div className="card skeleton chart-skeleton" />
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="table-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="table-row skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MasterDashboardSkeleton;
