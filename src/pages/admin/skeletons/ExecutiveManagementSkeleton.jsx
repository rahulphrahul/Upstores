import React from "react";
import "../ExecutiveManagement.css";

function ExecutiveManagementSkeleton() {
  return (
    <div className="exec-page exec-skeleton">
      <div className="page-header">
        <div className="skeleton" style={{ width: 240, height: 32 }} />
        <div className="skeleton" style={{ width: 150, height: 42 }} />
      </div>
      <div className="card skeleton" style={{ height: 290 }} />
    </div>
  );
}

export default ExecutiveManagementSkeleton;
