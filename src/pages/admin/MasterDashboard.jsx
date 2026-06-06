import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { toast } from "react-toastify";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { FaCrown, FaLayerGroup, FaChartLine } from "react-icons/fa";

import {
  FaStore,
  FaUserTie,
  FaTools,
  FaWallet,
  FaExchangeAlt,
  FaClock,
} from "react-icons/fa";

import {
  getDashboardStats,
  getDailyTransactions,
  getMonthlyTransactions,
  getWalletRequests,
  handleWalletRequest,
} from "../../service/apiService";

import MasterDashboardSkeleton from "./skeletons/MasterDashboardSkeleton";
import "./MasterDashboard.css";

function MasterDashboard() {
  /* =========================
     STATE
  ========================= */
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pending, setPending] = useState([]);

  /* =========================
     CHART DOM REFS
  ========================= */
  const dailyChartDiv = useRef(null);
  const monthlyChartDiv = useRef(null);

  const dailyRootRef = useRef(null);
  const monthlyRootRef = useRef(null);
  const shop_type = "all";
  const rupeeSymbol = "\u20B9";
  const dashboardData = stats?.data || {};

  const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatNumber = (value) => toNumber(value).toLocaleString();
  const formatCurrency = (value) => `${rupeeSymbol} ${formatNumber(value)}`;

  /* =========================
     LOAD DATA
  ========================= */
  const loadAll = async () => {
    try {
      setLoading(true);

      const [statsRes, dailyRes, monthlyRes, pendingRes] = await Promise.all([
        getDashboardStats(),
        getDailyTransactions(),
        getMonthlyTransactions(),
        getWalletRequests(shop_type),
      ]);

      setStats(statsRes || {});
      setDailyData(normalizeList(dailyRes));
      setMonthlyData(normalizeList(monthlyRes));
      setPending(normalizeList(pendingRes));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* =========================
     CREATE CHARTS (amCharts 5 SAFE)
  ========================= */
  useLayoutEffect(() => {
    if (
      loading ||
      dailyData.length === 0 ||
      monthlyData.length === 0 ||
      !dailyChartDiv.current ||
      !monthlyChartDiv.current
    ) {
      return;
    }

    /* ---------- CLEANUP OLD ROOTS ---------- */
    if (dailyRootRef.current) {
      dailyRootRef.current.dispose();
      dailyRootRef.current = null;
    }
    if (monthlyRootRef.current) {
      monthlyRootRef.current.dispose();
      monthlyRootRef.current = null;
    }

    /* =========================
       PARSE DATA (CRITICAL FIX)
    ========================= */
    const parsedDailyData = dailyData.map((d) => ({
      day: d.day,
      total: toNumber(d.total),
    }));

    const parsedMonthlyData = monthlyData.map((m) => ({
      month: m.month,
      total: toNumber(m.total),
    }));

    /* =========================
       DAILY LINE CHART
    ========================= */
    const dailyRoot = am5.Root.new(dailyChartDiv.current);
    dailyRootRef.current = dailyRoot;
    dailyRoot.setThemes([am5themes_Animated.new(dailyRoot)]);

    const dailyChart = dailyRoot.container.children.push(
      am5xy.XYChart.new(dailyRoot, {
        panX: false,
        panY: false,
      })
    );

    const dailyXAxis = dailyChart.xAxes.push(
      am5xy.CategoryAxis.new(dailyRoot, {
        categoryField: "day",
        renderer: am5xy.AxisRendererX.new(dailyRoot, {
          minGridDistance: 30,
        }),
      })
    );
    dailyChart.set("paddingRight", 10);
    dailyChart.set("paddingLeft", 10);
    dailyChart.set("paddingTop", 10);
    dailyChart.set("paddingBottom", 20);
    dailyChart.set("panX", true);
    dailyChart.set("wheelX", "panX");

    if (window.innerWidth < 768) {
      dailyXAxis.get("renderer").labels.template.setAll({
        rotation: -45,
        centerY: am5.p50,
        centerX: am5.p100,
      });
    }

    const dailyYAxis = dailyChart.yAxes.push(
      am5xy.ValueAxis.new(dailyRoot, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(dailyRoot, {}),
      })
    );

    const dailySeries = dailyChart.series.push(
      am5xy.LineSeries.new(dailyRoot, {
        xAxis: dailyXAxis,
        yAxis: dailyYAxis,
        valueYField: "total",
        categoryXField: "day",
      })
    );

    dailySeries.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0x001ae3),
    });

    dailyXAxis.data.setAll(parsedDailyData);
    dailySeries.data.setAll(parsedDailyData);

    dailySeries.appear(1000);
    dailyChart.appear(1000, 100);

    /* =========================
       MONTHLY BAR CHART
    ========================= */
    const monthlyRoot = am5.Root.new(monthlyChartDiv.current);
    monthlyRootRef.current = monthlyRoot;
    monthlyRoot.setThemes([am5themes_Animated.new(monthlyRoot)]);

    const monthlyChart = monthlyRoot.container.children.push(
      am5xy.XYChart.new(monthlyRoot, {
        panX: false,
        panY: false,
      })
    );

    const monthlyXAxis = monthlyChart.xAxes.push(
      am5xy.CategoryAxis.new(monthlyRoot, {
        categoryField: "month",
        renderer: am5xy.AxisRendererX.new(monthlyRoot, {
          minGridDistance: 30,
        }),
      })
    );

    if (window.innerWidth < 768) {
      monthlyXAxis.get("renderer").labels.template.setAll({
        rotation: -45,
        centerY: am5.p50,
        centerX: am5.p100,
      });
    }

    const monthlyYAxis = monthlyChart.yAxes.push(
      am5xy.ValueAxis.new(monthlyRoot, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(monthlyRoot, {}),
      })
    );

    const monthlySeries = monthlyChart.series.push(
      am5xy.ColumnSeries.new(monthlyRoot, {
        xAxis: monthlyXAxis,
        yAxis: monthlyYAxis,
        valueYField: "total",
        categoryXField: "month",
      })
    );
    monthlyChart.set("paddingRight", 10);
    monthlyChart.set("paddingLeft", 10);
    monthlyChart.set("paddingTop", 10);
    monthlyChart.set("paddingBottom", 20);
    monthlyChart.set("panX", true);
    monthlyChart.set("wheelX", "panX");

    monthlySeries.columns.template.setAll({
      width: am5.percent(60),
      fill: am5.color(0x001ae3),
      strokeOpacity: 0,
    });
    if (window.innerWidth < 768) {
      monthlySeries.columns.template.setAll({
        width: am5.percent(40),
      });
    }

    monthlyXAxis.data.setAll(parsedMonthlyData);
    monthlySeries.data.setAll(parsedMonthlyData);

    monthlySeries.appear(1000);
    monthlyChart.appear(1000, 100);

    /* ---------- CLEANUP ---------- */
    return () => {
      dailyRoot.dispose();
      monthlyRoot.dispose();
    };
  }, [loading, dailyData, monthlyData]);

  /* =========================
     FUND ACTION
  ========================= */
  const onWalletAction = async (req, action, type) => {
    try {
      await handleWalletRequest(req.id, action, type);

      toast.success(
        action === "approve"
          ? "Wallet request approved successfully "
          : "Wallet request rejected successfully "
      );

      loadAll();
    } catch (err) {
      console.error("Wallet action failed", err);
      toast.error("Failed to update wallet request ");
    }
  };

  /* =========================
     SKELETON
  ========================= */
  if (loading) {
    return <MasterDashboardSkeleton />;
  }

  const reportRows = [
    { name: "Shops", data: dashboardData.shops, className: "shops" },
    { name: "Sellers", data: dashboardData.sellers, className: "sellers" },
    { name: "Services", data: dashboardData.services, className: "services" },
  ];

  const reportTotals = reportRows.reduce(
    (total, report) => ({
      activeAccounts: total.activeAccounts + toNumber(report.data?.total),
      wallet: total.wallet + toNumber(report.data?.wallet),
      transactions: total.transactions + toNumber(report.data?.transactions),
      pending: total.pending + toNumber(report.data?.pending),
    }),
    { activeAccounts: 0, wallet: 0, transactions: 0, pending: 0 }
  );

  const latestDailyReport = dailyData[dailyData.length - 1];
  const latestMonthlyReport = monthlyData[monthlyData.length - 1];

  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="master-dashboard">
      <h2 className="page-title">Master Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card shops">
          <div className="stat-top">
            <div className="stat-icon-box shops">
              <FaStore />
            </div>
            <div>
              <p className="stat-title">Shops</p>
              <h3>{dashboardData.shops?.total || 0}</h3>
            </div>
          </div>

          <div className="stat-metrics">
            <div className="metric">
              <FaWallet />
              <span>Wallet</span>
              <strong>{formatCurrency(dashboardData.shops?.wallet)}</strong>
            </div>
            <div className="metric">
              <FaExchangeAlt />
              <span>Transactions</span>
              <strong>
                {formatCurrency(dashboardData.shops?.transactions)}
              </strong>
            </div>
            <div className="metric">
              <FaClock />
              <span>Pending</span>
              <strong>{dashboardData.shops?.pending || 0}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card sellers">
          <div className="stat-top">
            <div className="stat-icon-box sellers">
              <FaUserTie />
            </div>
            <div>
              <p className="stat-title">Sellers</p>
              <h3>{dashboardData.sellers?.total || 0}</h3>
            </div>
          </div>

          <div className="stat-metrics">
            <div className="metric">
              <FaWallet />
              <span>Wallet</span>
              <strong>{formatCurrency(dashboardData.sellers?.wallet)}</strong>
            </div>
            <div className="metric">
              <FaExchangeAlt />
              <span>Transactions</span>
              <strong>
                {formatCurrency(dashboardData.sellers?.transactions)}
              </strong>
            </div>
            <div className="metric">
              <FaClock />
              <span>Pending</span>
              <strong>{dashboardData.sellers?.pending || 0}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card services">
          <div className="stat-top">
            <div className="stat-icon-box services">
              <FaTools />
            </div>
            <div>
              <p className="stat-title">Services</p>
              <h3>{dashboardData.services?.total || 0}</h3>
            </div>
          </div>

          <div className="stat-metrics">
            <div className="metric">
              <FaWallet />
              <span className="card-span-text">Wallet</span>
              <strong>{formatCurrency(dashboardData.services?.wallet)}</strong>
            </div>
            <div className="metric">
              <FaExchangeAlt />
              <span className="card-span-text">Transactions</span>
              <strong>
                {formatCurrency(dashboardData.services?.transactions)}
              </strong>
            </div>
            <div className="metric">
              <FaClock />
              <span className="card-span-text">Pending</span>
              <strong>{dashboardData.services?.pending || 0}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card earnings">
          <div className="stat-top">
            <div className="stat-icon-box earnings">
              <FaCrown />
            </div>

            <div>
              <p className="stat-title">Admin Points</p>
              <h3>
                {formatNumber(dashboardData.admin_points?.points)}
              </h3>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-metrics">
            <div className="metric">
              <FaLayerGroup />
              <span className="card-span-text">Total PV</span>
              <strong>
                {formatNumber(dashboardData.admin_points?.pv)}
              </strong>
            </div>

            <div className="metric">
              <FaChartLine />
              <span className="card-span-text">Status</span>
              <strong className="positive">Active</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card reports-card">
        <div className="reports-header">
          <div>
            <h4>Reports</h4>
            <p>Live dashboard summary</p>
          </div>
          <strong>{formatCurrency(reportTotals.transactions)}</strong>
        </div>

        <div className="reports-grid">
          <div className="report-chip">
            <span>Accounts</span>
            <strong>{formatNumber(reportTotals.activeAccounts)}</strong>
          </div>
          <div className="report-chip">
            <span>Wallet Balance</span>
            <strong>{formatCurrency(reportTotals.wallet)}</strong>
          </div>
          <div className="report-chip">
            <span>Pending Funds</span>
            <strong>{formatNumber(reportTotals.pending)}</strong>
          </div>
          <div className="report-chip">
            <span>Open Approvals</span>
            <strong>{formatNumber(pending.length)}</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table reports-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Total</th>
                <th>Wallet</th>
                <th>Transactions</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((report) => (
                <tr key={report.name}>
                  <td>
                    <span className={`report-dot ${report.className}`} />
                    {report.name}
                  </td>
                  <td>{formatNumber(report.data?.total)}</td>
                  <td>{formatCurrency(report.data?.wallet)}</td>
                  <td>{formatCurrency(report.data?.transactions)}</td>
                  <td>{formatNumber(report.data?.pending)}</td>
                </tr>
              ))}
              <tr>
                <td>Latest Daily</td>
                <td colSpan="2">{latestDailyReport?.day || "-"}</td>
                <td>{formatCurrency(latestDailyReport?.total)}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Latest Monthly</td>
                <td colSpan="2">{latestMonthlyReport?.month || "-"}</td>
                <td>{formatCurrency(latestMonthlyReport?.total)}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h4>Daily Transactions</h4>
          <div className="chart-scroll">
            <div ref={dailyChartDiv} className="chart-box" />
          </div>
        </div>

        <div className="card">
          <h4>Monthly Transactions</h4>
          <div ref={monthlyChartDiv} className="chart-box" />
        </div>
      </div>

      <div className="card">
        <h4>Pending Fund Approvals</h4>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <tr key={p.id}>
                  <td>{p.shop}</td>
                  <td>{rupeeSymbol} {p.amount}</td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() => onWalletAction(p, "approve", p.user_type)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => onWalletAction(p, "rejected", p.user_type)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}

              {pending.length === 0 && (
                <tr>
                  <td colSpan="3">No pending approvals</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MasterDashboard;
