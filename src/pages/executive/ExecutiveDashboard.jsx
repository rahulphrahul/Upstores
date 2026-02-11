import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { FaStore, FaUserTie, FaTools, FaWallet, FaExchangeAlt, FaClock } from "react-icons/fa";

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
      setStats(s.data);
    setMonthlyData(m.map(x => ({
  month: x.month,
  shops: Number(x.shops),
  sellers: Number(x.sellers),
  services: Number(x.services),
})));

      setActivities(a);
    });
  }, []);
console.log("stats",stats);
  /* ================= CHART ================= */
  useLayoutEffect(() => {
  if (!chartDiv.current || monthlyData.length === 0) return;

  if (rootRef.current) rootRef.current.dispose();

  const root = am5.Root.new(chartDiv.current);
  rootRef.current = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      layout: root.verticalLayout,
    })
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "month",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  xAxis.data.setAll(monthlyData);

  /* function to create series */
  function createSeries(name, field, color) {
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: field,
        categoryXField: "month",
        clustered: true,
      })
    );

    series.columns.template.setAll({
      fill: am5.color(color),
      strokeOpacity: 0,
      width: am5.percent(70),
    });

    series.data.setAll(monthlyData);
    series.appear(1000);

    return series;
  }

  /* Create 3 bars per month */
  createSeries("Shops", "shops", 0x2563eb);     // blue
  createSeries("Sellers", "sellers", 0x16a34a); // green
  createSeries("Services", "services", 0xf59e0b); // orange

  /* Legend */
  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
    })
  );

  legend.data.setAll(chart.series.values);

  return () => root.dispose();
}, [monthlyData]);


  return (
    <div className="exec-dashboard">
      <h2 className="page-title">Executive Dashboard</h2>

  {/* STATS */}
<div className="stats-grid">

  {/* SHOPS */}
  <div className="stat-card shops">
    <div className="stat-top">
      <div className="stat-icon-box shops">
        <FaStore />
      </div>
      <div>
        <p className="stat-title">Shops</p>
        <h3>{stats?.shops?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span>Wallet</span>
        <strong>₹ {stats?.shops?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span>Transactions</span>
        <strong>₹ {stats?.shops?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span>Pending</span>
        <strong>{stats?.shops?.pending || 0}</strong>
      </div>
    </div>
  </div>

  {/* SELLERS */}
  <div className="stat-card sellers">
    <div className="stat-top">
      <div className="stat-icon-box sellers">
        <FaUserTie />
      </div>
      <div>
        <p className="stat-title">Sellers</p>
        <h3>{stats?.sellers?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span>Wallet</span>
        <strong>₹ {stats?.sellers?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span>Transactions</span>
        <strong>₹ {stats?.sellers?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span>Pending</span>
        <strong>{stats?.sellers?.pending || 0}</strong>
      </div>
    </div>
  </div>

  {/* SERVICES */}
  <div className="stat-card services">
    <div className="stat-top">
      <div className="stat-icon-box services">
        <FaTools />
      </div>
      <div>
        <p className="stat-title">Services</p>
        <h3>{stats?.services?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span>Wallet</span>
        <strong>₹ {stats?.services?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span>Transactions</span>
        <strong>₹ {stats?.services?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span>Pending</span>
        <strong>{stats?.services?.pending || 0}</strong>
      </div>
    </div>
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
