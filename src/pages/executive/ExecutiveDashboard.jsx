import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import {
  getExecutiveDashboardStats,
  getExecutiveMonthlyTransactions,
  getExecutiveRecentActivities,
} from "../../service/apiService";

import "./ExecutiveDashboard.css";

function ExecutiveDashboard({ user }) {
  const execId = user.id;

  const [stats, setStats] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [activities, setActivities] = useState([]);

  const chartDiv = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getExecutiveDashboardStats({executive_id: execId}),
      getExecutiveMonthlyTransactions({executive_id: execId}),
      getExecutiveRecentActivities({executive_id: execId}),
    ]).then(([s, m, a]) => {
      setStats(s);
      setMonthlyData(m.map(x => ({
        month: x.month,
        total: Number(x.total),
      })));
      setActivities(a);
    });
  }, []);

  /* ================= CHART ================= */
  useLayoutEffect(() => {
    if (!chartDiv.current || monthlyData.length === 0) return;

    if (rootRef.current) rootRef.current.dispose();

    const root = am5.Root.new(chartDiv.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {})
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "month",
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: "total",
        categoryXField: "month",
      })
    );

    series.columns.template.setAll({
      fill: am5.color(0x001ae3),
      strokeOpacity: 0,
    });

    xAxis.data.setAll(monthlyData);
    series.data.setAll(monthlyData);

    return () => root.dispose();
  }, [monthlyData]);

  return (
    <div className="exec-dashboard">
      <h2 className="page-title">Executive Dashboard</h2>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>My Shops</p>
          <h3>{stats.shops}</h3>
        </div>
        <div className="stat-card">
          <p>Total Wallet</p>
          <h3>₹ {stats.wallet}</h3>
        </div>
        <div className="stat-card">
          <p>Monthly Transactions</p>
          <h3>₹ {stats.transactions}</h3>
        </div>
        <div className="stat-card">
          <p>Pending Requests</p>
          <h3>{stats.pending}</h3>
        </div>
      </div>

      {/* GRAPH */}
      <div className="card">
        <h4>Monthly Transaction Volume</h4>
        <div ref={chartDiv} className="chart-box" />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="card">
        <h4>Recent Activity</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a, i) => (
              <tr key={i}>
                <td>{a.shop}</td>
                <td>{a.type}</td>
                <td>₹ {a.amount}</td>
                <td>{a.status}</td>
                <td>{a.created_at}</td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExecutiveDashboard;
