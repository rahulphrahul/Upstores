import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import {
  getExecutives,
  toggleExecutiveStatus,
  deleteExecutive,
  getExecutivePerformance,
  createExecutive,
} from "../../service/apiService";

import { Modal, Button } from "react-bootstrap";
import ExecutiveManagementSkeleton from "./skeletons/ExecutiveManagementSkeleton";
import "./ExecutiveManagement.css";

function ExecutiveManagement() {

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(true);
  const [executives, setExecutives] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
  });

  const [creating, setCreating] = useState(false);

  /* =========================
     SEARCH + PAGINATION
  ========================= */

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  /* =========================
     CHART
  ========================= */

  const chartDiv = useRef(null);
  const rootRef = useRef(null);

  /* =========================
     LOAD DATA
  ========================= */

  const loadAll = async (currentPage = page, currentSearch = search) => {
    try {
      setLoading(true);

      const [execRes, perfRes] = await Promise.all([
        getExecutives({
          page: currentPage,
          limit: limit,
          search: currentSearch,
        }),
        getExecutivePerformance(),
      ]);

      setExecutives(execRes.data);
      setTotalPages(execRes.totalPages || 1);
      setPerformanceData(perfRes);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(page, search);
  }, [page]);

  /* =========================
     PERFORMANCE CHART
  ========================= */

  useLayoutEffect(() => {
    if (loading || performanceData.length === 0 || !chartDiv.current) return;

    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    const parsed = performanceData.map(p => ({
      name: p.name,
      transactions: Number(p.transactions),
    }));

    const root = am5.Root.new(chartDiv.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { panX: false, panY: false })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: "transactions",
        categoryXField: "name",
      })
    );

    series.columns.template.setAll({
      width: am5.percent(60),
      fill: am5.color(0x001ae3),
      strokeOpacity: 0,
    });

    xAxis.data.setAll(parsed);
    series.data.setAll(parsed);

    return () => root.dispose();
  }, [loading, performanceData]);

  /* =========================
     ACTIONS
  ========================= */

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setCreating(true);
    const res = await createExecutive(form);
    setCreating(false);

    if (res.status === "success") {
      setCredentials(res);
      setForm({ name: "", phone: "", email: "", username: "" });
      loadAll();
    }
  };

  const handleToggleStatus = async (id, status) => {
    await toggleExecutiveStatus(id, status);
    loadAll();
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await deleteExecutive(selectedId);
    setShowDeleteModal(false);
    loadAll();
  };

  if (loading) return <ExecutiveManagementSkeleton />;

  /* =========================
     UI
  ========================= */

  return (
    <div className="exec-page">

      <div className="page-header">
        <h2 className="page-title">Executive Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAdd(!showAdd);
            setCredentials(null);
          }}
        >
          {showAdd ? "Close" : "+ Add Executive"}
        </button>
      </div>

      {/* PERFORMANCE */}
      <div className="card">
        <h4>Executive Performance</h4>
        <div ref={chartDiv} className="chart-box" />
      </div>

      {/* TABLE */}
      <div className="card">

        {/* SEARCH BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15
        }}>

          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                loadAll(1, search);
              }
            }}
            style={{
              width: "250px",
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />

          <button
            className="btn btn-primary"
            onClick={() => {
              setPage(1);
              loadAll(1, search);
            }}
          >
            Search
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Shops</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {executives.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.phone}</td>
                  <td>{e.email || "-"}</td>
                  <td>{e.shops_count}</td>
                  <td>
                    <span className={`status ${e.status}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn ${
                        e.status === "active"
                          ? "btn-suspend"
                          : "btn-activate"
                      }`}
                      onClick={() =>
                        handleToggleStatus(e.id, e.status)
                      }
                    >
                      {e.status === "active"
                        ? "Suspend"
                        : "Activate"}
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {executives.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    No executives found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "20px"
        }}>
          <button
            className="btn btn-outline"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>

      </div>

      {/* DELETE MODAL */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this executive?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default ExecutiveManagement;