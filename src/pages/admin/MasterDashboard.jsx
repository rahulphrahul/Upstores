import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { FaCrown, FaLayerGroup, FaChartLine } from "react-icons/fa";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import {
  FaStore,
  FaUserTie,
  FaTools,
  FaWallet,
  FaExchangeAlt,
  FaClock,
    FaUsers,
  FaUserFriends,
} from "react-icons/fa";

import {
  getDashboardStats,
  getDailyTransactions,
  getMonthlyTransactions,
  getFundRequestReports,
  handleWalletRequest,
} from "../../service/apiService";
import { Bill_WALLET_IMG_URL } from "../../config/config";

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
  const [fundReports, setFundReports] = useState([]);
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [billImage, setBillImage] = useState(null);
  const [isBillImageLoading, setIsBillImageLoading] = useState(false);
  const [billImageError, setBillImageError] = useState(false);
  /* =========================
     CHART DOM REFS
  ========================= */
  const dailyChartDiv = useRef(null);
  const monthlyChartDiv = useRef(null);

  const dailyRootRef = useRef(null);
  const monthlyRootRef = useRef(null);
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

  const openBillImage = (src) => {
    setIsBillImageLoading(true);
    setBillImageError(false);
    setBillImage(src);
  };

  useEffect(() => {
    if (!billImage) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setBillImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [billImage]);

  /* =========================
     LOAD DATA
  ========================= */
  const loadAll = async () => {
    try {
      setLoading(true);

      const [statsRes, dailyRes, monthlyRes, fundReportRes] = await Promise.all([
        getDashboardStats(),
        getDailyTransactions(),
        getMonthlyTransactions(),
        getFundRequestReports({
    page: 1,
    limit: 50
  })
      ]);

      setStats(statsRes || {});
      setDailyData(normalizeList(dailyRes));
      setMonthlyData(normalizeList(monthlyRes));
      setFundReports(fundReportRes?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);
const loadFundReports = async () => {
  try {
    const res = await getFundRequestReports({
      page: 1,
      limit: 50,
      from: reportFrom,
      to: reportTo,
      search: reportSearch,
    });

    setFundReports(res?.data || []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load fund reports");
  }
};
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
      stroke: am5.color(0x5366c8),
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
      fill: am5.color(0x5366c8),
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
const getRequestStatus = (record) =>
  record.status || "Pending";

const getRecordDisplayDate = (record) => {
  if (!record.created_at) return "-";

  // API timestamps use `YYYY-MM-DD HH:mm:ss` without a timezone suffix.
  const parsedDate = new Date(String(record.created_at).replace(" ", "T"));
  if (Number.isNaN(parsedDate.getTime())) return record.created_at;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate).replace(",", " ·");
};

const resolveRequestImageUrl = (record) =>
  record.proof
    ? `${Bill_WALLET_IMG_URL.replace(/\/$/, "")}/${encodeURIComponent(record.proof)}`
    : null;
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
console.log("dashbiard data",dashboardData);
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
  const filteredFundReports = fundReports;
  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="master-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">UPSTORES ADMIN</span>
          <h2 className="page-title">Dashboard overview</h2>
          <p>Track your merchants, customers, team, and transactions.</p>
        </div>
      </div>

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
<div className="stat-card customers">
  <div className="stat-top">
    <div className="stat-icon-box customers">
      <FaUsers />
    </div>

    <div>
      <p className="stat-title">Customers</p>
      <h3>{dashboardData.customers?.total || 0}</h3>
    </div>
  </div>

  <div className="stat-divider"></div>

  <div className="stat-metrics">
    <div className="metric">
      <FaUsers />
      <span>Total Customers</span>
      <strong>{dashboardData.customers?.total || 0}</strong>
    </div>
  </div>
</div>
<div className="stat-card executives">
  <div className="stat-top">
    <div className="stat-icon-box executives">
      <FaUserFriends />
    </div>

    <div>
      <p className="stat-title">Executives</p>
      <h3>{dashboardData.executives?.total || 0}</h3>
    </div>
  </div>

  <div className="stat-divider"></div>

  <div className="stat-metrics">
    <div className="metric">
      <FaUserFriends />
      <span>Total Executives</span>
      <strong>{dashboardData.executives?.total || 0}</strong>
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
            <strong>
              {formatNumber(
                fundReports.filter(
                  (record) => String(getRequestStatus(record)).toLowerCase() === "pending"
                ).length
              )}
            </strong>
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

   <div className="card reports-card fund-report-card">
  <div className="reports-header">
    <div>
      <h4>Fund Requests</h4>
      <p>
        Pending, approved, and rejected fund requests
      </p>
    </div>

    <strong>
      {filteredFundReports.length}
    </strong>
  </div>

  {/* Filters */}
  <div className="report-filters">
    <div className="report-filter">
      <label htmlFor="fund-report-from">From Date</label>
      <input
        id="fund-report-from"
        type="date"
        value={reportFrom}
        onChange={(e) => setReportFrom(e.target.value)}
      />
    </div>

    <div className="report-filter">
      <label htmlFor="fund-report-to">To Date</label>
      <input
        id="fund-report-to"
        type="date"
        value={reportTo}
        onChange={(e) => setReportTo(e.target.value)}
      />
    </div>

    <div className="report-filter report-filter--search">
      <label htmlFor="fund-report-search">Search</label>
      <input
        id="fund-report-search"
        type="text"
        placeholder="Search shop, amount, status, notes, bill..."
        value={reportSearch}
        onChange={(e) => setReportSearch(e.target.value)}
      />
    </div>

    <div className="report-actions">
      <button
        type="button"
        className="btn approve-btn"
        onClick={loadFundReports}
      >
        Submit
      </button>

      <button
        type="button"
        className="btn report-clear-btn"
        onClick={async () => {
          setReportFrom("");
          setReportTo("");
          setReportSearch("");

          const res = await getFundRequestReports();
          setFundReports(res?.data || []);
        }}
      >
        Clear
      </button>
    </div>
  </div>

  {/* SINGLE FUND REQUEST TABLE */}
  <div className="table-responsive">
    <table className="data-table reports-table fund-report-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Merchant Name</th>
          <th>User Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Bill / Proof</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {/* Fund Request Reports */}
        {filteredFundReports.map((record, index) => {
          const imageUrl =
            resolveRequestImageUrl(record);

          const statusLabel =
            getRequestStatus(record);

          const statusClass =
            `report-status report-status--${String(
              statusLabel
            )
              .toLowerCase()
              .replace(/\s+/g, "-")}`;

          return (
            <tr
              key={
                `report-${record.id || record.request_id || index}`
              }
            >
              <td data-label="Date">
                {getRecordDisplayDate(record)}
              </td>

              <td data-label="Merchant Name">
                {record.merchant_name || "-"}
              </td>

              <td data-label="User Type">
                {record.user_type || "-"}
              </td>

              <td data-label="Amount">
                {rupeeSymbol}{" "}
                {formatNumber(record.amount)}
              </td>

              <td data-label="Status">
                <span className={statusClass}>
                  {statusLabel}
                </span>
              </td>

              <td data-label="Bill / Proof">
                {imageUrl ? (
                  <button
                    type="button"
                    className="bill-viewer-trigger"
                    onClick={() => openBillImage(imageUrl)}
                  >
                    View Bill
                  </button>
                ) : (
                  "-"
                )}
              </td>

              <td data-label="Action">
                {String(statusLabel).toLowerCase() === "pending" ? (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => onWalletAction(record, "approve", record.user_type)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => onWalletAction(record, "rejected", record.user_type)}
                    >
                      Reject
                    </button>
                  </>
                ) : "-"}
              </td>
            </tr>
          );
        })}

        {/* Empty */}
        {filteredFundReports.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="empty-text"
              >
                No fund requests found
              </td>
            </tr>
          )}
      </tbody>
    </table>
  </div>
</div>
      {billImage && createPortal(
        <div
          className="fund-image-viewer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBillImage(null);
          }}
        >
          <div className="fund-image-viewer" role="dialog" aria-modal="true" aria-label="Bill image viewer">
            <button
              type="button"
              className="fund-image-viewer-close"
              onClick={() => setBillImage(null)}
              aria-label="Close image viewer"
              autoFocus
            >
              <X size={21} aria-hidden="true" />
            </button>
            <div className={`fund-image-frame${isBillImageLoading ? " is-loading" : " is-loaded"}`}>
              {isBillImageLoading && (
                <div className="fund-image-loader" role="status">
                  <span className="fund-image-loader-spinner" />
                  <span>Loading bill…</span>
                </div>
              )}
              {!billImageError ? (
                <img
                  src={billImage}
                  alt="Fund request bill or proof"
                  className={`fund-image-preview${isBillImageLoading ? " is-blurred" : ""}`}
                  decoding="async"
                  onLoad={() => setIsBillImageLoading(false)}
                  onError={() => {
                    setIsBillImageLoading(false);
                    setBillImageError(true);
                  }}
                />
              ) : (
                <div className="fund-image-error" role="alert">
                  This image couldn’t be loaded. Close the viewer and try again.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default MasterDashboard;
