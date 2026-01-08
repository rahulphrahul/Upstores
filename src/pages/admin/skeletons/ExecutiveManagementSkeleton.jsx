import React from "react";
import "../ExecutiveManagement.css";

function ExecutiveManagementSkeleton() {
  return (
    <div className="exec-skeleton">
      <div className="card skeleton" style={{ height: 120 }} />
      <div className="card skeleton" style={{ height: 300 }} />
      <div className="card skeleton" style={{ height: 260 }} />
    </div>
  );
}

export default ExecutiveManagementSkeleton;
