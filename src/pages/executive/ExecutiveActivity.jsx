import React from "react";

function ExecutiveActivity() {
  const activities = [
    "Added new shop: Green Mart",
    "Added seller: Amit Kumar",
    "Enabled service: Home Delivery",
    "Suspended shop: City Super Shop",
  ];

  return (
    <div className="exec-page">
      <h2 className="page-title">My Activity</h2>

      <div className="card">
        <ul>
          {activities.map((a, i) => (
            <li key={i} style={{ padding: "8px 0" }}>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExecutiveActivity;
