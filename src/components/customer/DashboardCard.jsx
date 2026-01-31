import React from "react";
import { Card } from "react-bootstrap";

const DashboardCard = ({ icon, title, value }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className="bg-light p-3 rounded-circle">
          {icon}
        </div>
        <div>
          <h6 className="mb-1 text-muted">{title}</h6>
          <h4 className="fw-bold">{value}</h4>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DashboardCard;
