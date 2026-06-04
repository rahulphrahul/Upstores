import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  ProgressBar,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import {
  getAssignedTasks,
  getTask,
  updateTaskProgress,
  addTaskComment,
} from "../../service/apiService";

/**
 * MyTasks - staff view for assigned tasks
 * Props:
 *   user - current logged in user object (expects user.id)
 */
function MyTasks({ user }) {
  const [activeTab, setActiveTab] = useState("assigned"); // assigned, working, pending, stuck, completed
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // detail modal
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // load tasks assigned to this staff
  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getAssignedTasks(user.id); // service should support staffId filter
      if (res && res.status === "success") {
        // res.data is array of tasks
        setTasks(res.data);
      } else if (Array.isArray(res)) {
        // fallback if service returns raw array
        setTasks(res);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      setTasks([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // open detail modal and fetch full task + comments
  const openDetail = useCallback(
    async (taskId) => {
      setDetailTaskId(taskId);
      setDetail(null);
      try {
        const res = await getTask(taskId);
        if (res && res.status === "success") {
          setDetail(res);
        } else {
          console.error("getTask returned:", res);
        }
      } catch (err) {
        console.error("Error fetching task detail:", err);
      }
    },
    []
  );

  const closeDetail = () => {
    setDetailTaskId(null);
    setDetail(null);
    setCommentText("");
  };

  // helper: status to badge color
  const statusBadge = (s) => {
    const colors = {
      unassigned: "secondary",
      assigned: "secondary",
      in_progress: "primary",
      pending: "warning",
      stuck: "danger",
      completed: "success",
      confirmed: "dark",
    };
    return <Badge bg={colors[s] || "secondary"}>{s.replaceAll("_", " ")}</Badge>;
  };
  // grouped tasks by status for tabs
  const tasksByStatus = {
    assigned: tasks.filter((t) => t.status === "assigned" || t.status === "unassigned"),
    working: tasks.filter((t) => t.status === "in_progress"),
    pending: tasks.filter((t) => t.status === "pending"),
    stuck: tasks.filter((t) => t.status === "stuck"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  // update progress (and optionally status)
  const handleProgressUpdate = async (taskId, newProgress, newStatus = null) => {
    setUpdatingProgress(true);
    try {
      const payload = { task_id: taskId, progress: Number(newProgress) || 0 };
      if (newStatus) payload.status = newStatus;
      const res = await updateTaskProgress(payload);
      if (res.status === "success") {
        // refresh tasks and detail
        await loadTasks();
        if (detailTaskId) await openDetail(detailTaskId);
      } else {
        toaster.error(res.message || "Error updating progress");
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      toaster.error("Error updating progress");
    }
    setUpdatingProgress(false);
  };

  // update status only (simpler)
  const handleStatusChange = async (taskId, status) => {
    setUpdatingStatus(true);
    try {
      const res = await updateTaskProgress({ task_id: taskId, progress: 0, status });
      if (res.status === "success") {
        await loadTasks();
        if (detailTaskId) await openDetail(detailTaskId);
      } else {
        toast.error(res.message || "Error updating status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Error updating status");
    }
    setUpdatingStatus(false);
  };

  // add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await addTaskComment({
        task_id: detail.task.id,
        user_id: user.id,
        message: commentText.trim(),
      });
      if (res.status === "success") {
        // reload detail to fetch new comments
        const refreshed = await getTask(detail.task.id);
        if (refreshed.status === "success") setDetail(refreshed);
        setCommentText("");
      } else {
        toast.error(res.message || "Error posting comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Error posting comment");
    }
  };

  // quick action: mark completed
  const markCompleted = async (task) => {
    if (!window.confirm("Mark this task as completed?")) return;
    // set progress 100 and status completed
    await handleProgressUpdate(task.id, 100, "completed");
  };

  return (
    <div className="p-3">
      <Card className="p-3 mb-3">
        <div className="d-flex gap-2 align-items-center">
          <Button variant={activeTab === "assigned" ? "primary" : "light"} onClick={() => setActiveTab("assigned")}>Assigned</Button>
          <Button variant={activeTab === "working" ? "primary" : "light"} onClick={() => setActiveTab("working")}>Working</Button>
          <Button variant={activeTab === "pending" ? "primary" : "light"} onClick={() => setActiveTab("pending")}>Pending</Button>
          <Button variant={activeTab === "stuck" ? "primary" : "light"} onClick={() => setActiveTab("stuck")}>Stuck</Button>
          <Button variant={activeTab === "completed" ? "primary" : "light"} onClick={() => setActiveTab("completed")}>Completed</Button>
          <div className="ms-auto text-muted small">Logged in as: <strong>{user?.name}</strong></div>
        </div>
      </Card>

      <Card className="p-3">
        <h5 className="mb-3">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks
        </h5>

        {loading ? (
          <div className="text-center py-4"><Spinner /></div>
        ) : tasksByStatus[activeTab].length === 0 ? (
          <p className="text-muted">No tasks found under this category.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasksByStatus[activeTab].map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td><a href="#!" onClick={() => openDetail(t.id)}>{t.title}</a></td>
                  <td>{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</td>
                  <td style={{ minWidth: 200 }}>
                    <ProgressBar now={t.progress || 0} label={`${t.progress || 0}%`} />
                  </td>
                  <td>{statusBadge(t.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => openDetail(t.id)}>View</Button>
                      {t.status !== "completed" && (
                        <>
                          <Button size="sm" variant="success" onClick={() => markCompleted(t)}>Complete</Button>
                          <Form.Select
                            size="sm"
                            value=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              handleStatusChange(t.id, val);
                            }}
                            style={{ width: 140 }}
                          >
                            <option value="">Set status</option>
                            <option value="in_progress">Working</option>
                            <option value="pending">Pending</option>
                            <option value="stuck">Stuck</option>
                          </Form.Select>
                        </>
                      )}
                      {t.status === "completed" && <small className="text-muted align-self-center">Awaiting admin confirmation</small>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal show={!!detailTaskId} onHide={closeDetail} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Task Detail</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!detail ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : (
            <>
              <Row className="mb-2">
                <Col><h5>{detail.task.title}</h5></Col>
                <Col className="text-end text-muted">Deadline: {detail.task.deadline ? new Date(detail.task.deadline).toLocaleString() : "-"}</Col>
              </Row>

              <div className="mb-3 text-muted">Priority: <strong>{detail.task.priority}</strong></div>
              <p>{detail.task.description}</p>

              <hr />

              <div className="mb-3">
                <strong>Progress</strong>
                <div className="d-flex gap-2 align-items-center mt-2">
                  <ProgressBar now={detail.task.progress || 0} style={{ flex: 1 }} label={`${detail.task.progress || 0}%`} />
                  <InputGroup style={{ width: 160 }}>
                    <Form.Control
                      type="number"
                      min={0}
                      max={100}
                      value={detail.task.progress || 0}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(100, Number(e.target.value)));
                        setDetail((prev) => ({ ...prev, task: { ...prev.task, progress: v } }));
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleProgressUpdate(detail.task.id, detail.task.progress, null)}
                      disabled={updatingProgress}
                    >
                      {updatingProgress ? "Saving..." : "Update"}
                    </Button>
                  </InputGroup>
                </div>
              </div>

              <div className="mb-3">
                <strong>Status</strong>
                <div className="mt-2 d-flex gap-2">
                  <Button size="sm" variant={detail.task.status === "in_progress" ? "primary" : "light"} onClick={() => handleStatusChange(detail.task.id, "in_progress")} disabled={updatingStatus}>Working</Button>
                  <Button size="sm" variant={detail.task.status === "pending" ? "warning" : "light"} onClick={() => handleStatusChange(detail.task.id, "pending")} disabled={updatingStatus}>Pending</Button>
                  <Button size="sm" variant={detail.task.status === "stuck" ? "danger" : "light"} onClick={() => handleStatusChange(detail.task.id, "stuck")} disabled={updatingStatus}>Stuck</Button>
                  <Button size="sm" variant={detail.task.status === "completed" ? "success" : "light"} onClick={() => handleProgressUpdate(detail.task.id, 100, "completed")} disabled={updatingStatus}>Mark Completed</Button>
                </div>
              </div>

              <hr />

              <h6>Discussion</h6>
              <div style={{ maxHeight: 220, overflow: "auto" }} className="mb-2 p-2 border rounded bg-light">
                {detail.comments.length === 0 ? <div className="text-muted">No comments yet.</div> : detail.comments.map((c) => (
                  <div key={c.id} className="mb-2">
                    <strong>{c.name}</strong> <small className="text-muted"> — {new Date(c.created_at).toLocaleString()}</small>
                    <div>{c.message}</div>
                  </div>
                ))}
              </div>

              <InputGroup className="mb-2">
                <Form.Control placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <Button onClick={handleAddComment}>Send</Button>
              </InputGroup>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetail}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyTasks;
