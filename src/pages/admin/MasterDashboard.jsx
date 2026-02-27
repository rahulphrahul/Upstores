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
  FaClock 
} from "react-icons/fa";

import {
  getDashboardStats,
  getDailyTransactions,
  getMonthlyTransactions,
  getWalletRequests,
  handleWalletRequest,
  fundAction,
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
const shop_type="all";
  /* =========================
     LOAD DATA
  ========================= */
  const loadAll = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        dailyRes,
        monthlyRes,
        pendingRes,
      ] = await Promise.all([
        getDashboardStats(),
        getDailyTransactions(),
        getMonthlyTransactions(),
        getWalletRequests(shop_type),
      ]);

      setStats(statsRes);
      setDailyData(dailyRes);
      setMonthlyData(monthlyRes);
     setPending(pendingRes?.data || []);

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
    const parsedDailyData = dailyData.map(d => ({
      day: d.day,
      total: Number(d.total),
    }));

    const parsedMonthlyData = monthlyData.map(m => ({
      month: m.month,
      total: Number(m.total),
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

// rotate labels on mobile
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
const onWalletAction = async (req, action) => {
  try {
    await handleWalletRequest(
      req.user_id,
      action,
      "service"
    );

    toast.success(
      action === "approve"
        ? "Wallet request approved successfully "
        : "Wallet request rejected successfully "
    );

    loadAll(); // refresh list
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
console.log("stauttsus",stats.data);
  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="master-dashboard">
      <h2 className="page-title">Master Dashboard</h2>

      {/* COUNTS */}
    <div className="stats-grid">

  {/* SHOPS */}
  <div className="stat-card shops">
    <div className="stat-top">
      <div className="stat-icon-box shops">
        <FaStore />
      </div>
      <div>
        <p className="stat-title">Shops</p>
        <h3>{stats?.data.shops?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span>Wallet</span>
        <strong>₹ {stats?.data.shops?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span>Transactions</span>
        <strong>₹ {stats?.data.shops?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span>Pending</span>
        <strong>{stats?.data.shops?.pending || 0}</strong>
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
        <h3>{stats?.data.sellers?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span>Wallet</span>
        <strong>₹ {stats?.data.sellers?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span>Transactions</span>
        <strong>₹ {stats?.data.sellers?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span>Pending</span>
        <strong>{stats?.data.sellers?.pending || 0}</strong>
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
        <h3>{stats?.data.services?.total || 0}</h3>
      </div>
    </div>

    <div className="stat-metrics">
      <div className="metric">
        <FaWallet />
        <span className="card-span-text">Wallet</span>
        <strong>₹ {stats?.data.services?.wallet || 0}</strong>
      </div>
      <div className="metric">
        <FaExchangeAlt />
        <span className="card-span-text">Transactions</span>
        <strong>₹ {stats?.data.services?.transactions || 0}</strong>
      </div>
      <div className="metric">
        <FaClock />
        <span className="card-span-text">Pending</span>
        <strong>{stats?.data.services?.pending || 0}</strong>
      </div>
    </div>
  </div>
{/* ADMIN EARNINGS */}
<div className="stat-card earnings">
  <div className="stat-top">
    <div className="stat-icon-box earnings">
      <FaCrown />
    </div>

    <div>
      <p className="stat-title">Admin Points</p>
      <h3>
        {Number(stats?.data?.admin_points?.points || 0).toLocaleString()}
      </h3>
    </div>
  </div>

  <div className="stat-divider"></div>

  <div className="stat-metrics">
    <div className="metric">
      <FaLayerGroup />
      <span className="card-span-text">Total PV</span>
      <strong>
        {Number(stats?.data?.admin_points?.pv || 0).toLocaleString()}
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


      {/* CHARTS */}
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

      {/* PENDING APPROVALS */}
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
              <tr key={p.user_id}>
                <td>{p.shop}</td>
                <td>₹ {p.amount}</td>
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => onWalletAction(p, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onWalletAction(p, "reject")}
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
