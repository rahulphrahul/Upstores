import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Badge,
  Pagination,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import {
  getLeads,
  updateLead,
  getFolders
} from "../../service/apiService";

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 250;

function Leads({ user }) {
  // UI state
  const [view, setView] = useState("folders"); // "folders" or "leads"
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  // selected folder
  const [selectedFolder, setSelectedFolder] = useState(null);

  // leads & pagination
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [page, setPage] = useState(PAGE_DEFAULT);
  const [limit, setLimit] = useState(LIMIT_DEFAULT);
  const [totalLeads, setTotalLeads] = useState(0);

  // modal state
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  // load folders (admin created lists)
  const loadFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const res = await getFolders();
      if (res.status === "success") setFolders(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingFolders(false);
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  // load leads for selected folder (server-side pagination)
  const loadLeads = useCallback(async (folderId, p=1, l=LIMIT_DEFAULT) => {
    setLoadingLeads(true);
    try {
      const res = await getLeads(user.id, folderId, p, l); // updated service expects staffId, folderId, page, limit
      if (res.status === "success") {
        setLeads(res.data);
        setTotalLeads(res.total || 0);
        setPage(p);
        setLimit(l);
      } else {
        setLeads([]);
        setTotalLeads(0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingLeads(false);
  }, [user.id]);

  // open folder -> show leads
  const openFolder = (folder) => {
    setSelectedFolder(folder);
    setView("leads");
    // initial load page 1
    loadLeads(folder.id, 1, limit);
  };

  // back to folders list
  const goBack = () => {
    setSelectedFolder(null);
    setView("folders");
    setLeads([]);
    setTotalLeads(0);
    setPage(PAGE_DEFAULT);
  };

  // pagination handlers
  const totalPages = Math.ceil(totalLeads / limit) || 1;
  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    loadLeads(selectedFolder.id, p, limit);
  };

  // open lead modal
  const openLead = (lead) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setRemarks(lead.remarks || "");
    setFollowupDate(lead.followup_date || "");
    setShowModal(true);
  };

  // update lead
  const handleUpdate = async () => {
    try {
      await updateLead({
        lead_id: selectedLead.id,
        staff_id: user.id,
        status,
        remarks,
        followup_date: followupDate,
      });
      setShowModal(false);
      // refresh current page
      loadLeads(selectedFolder.id, page, limit);
    } catch (err) {
      console.error(err);
    }
  };

  // UI helpers
  const statusBadge = (s) => {
    const colors = {
      new: "secondary",
      called_no_response: "warning",
      not_interested: "danger",
      interested: "info",
      followup: "primary",
      converted: "success",
    };
    return <Badge bg={colors[s] || "secondary"}>{s.replaceAll("_", " ")}</Badge>;
  };

  return (
    <div className="p-3">
      {view === "folders" && (
        <Card className="shadow-sm p-4">
          <Row className="mb-3">
            <Col><h4 className="mb-0">Leads Lists</h4></Col>
            <Col className="text-end text-muted">Click a list to open its leads</Col>
          </Row>

          {loadingFolders ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : folders.length === 0 ? (
            <p className="text-muted">No lead lists created yet.</p>
          ) : (
            <ListGroup>
              {folders.map((f) => (
                <ListGroup.Item key={f.id} action onClick={() => openFolder(f)}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{f.name}</strong>
                      <div className="text-muted small">{f.description || '—'}</div>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">{f.lead_count} leads</div>
                      <div className="text-muted small">Created by: {f.created_by_name || '—'}</div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card>
      )}

      {view === "leads" && selectedFolder && (
        <Card className="shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button variant="link" onClick={goBack} className="p-0 me-2">&larr; Back</Button>
              <strong>{selectedFolder.name}</strong>
              <div className="text-muted small">{selectedFolder.description}</div>
            </div>
            <div className="text-end">
              <div className="small text-muted">{totalLeads} leads</div>
            </div>
          </div>

          {loadingLeads ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : leads.length === 0 ? (
            <p className="text-muted">No leads in this list.</p>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Follow-up</th><th>Last Call</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr key={lead.id}>
                      <td>{(page-1)*limit + idx + 1}</td>
                      <td>{lead.name}</td>
                      <td><a href={`tel:${lead.phone}`}>{lead.phone}</a></td>
                      <td>{lead.email || '-'}</td>
                      <td>{statusBadge(lead.status)}</td>
                      <td>{lead.followup_date ? new Date(lead.followup_date).toLocaleString() : '-'}</td>
                      <td>{lead.last_call_date ? new Date(lead.last_call_date).toLocaleString() : '-'}</td>
                      <td><Button size="sm" variant="outline-primary" onClick={() => openLead(lead)}>View / Update</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  Showing {(page-1)*limit + 1} - {Math.min(page*limit, totalLeads)} of {totalLeads}
                </div>

                <Pagination className="mb-0">
                  <Pagination.Prev onClick={() => handlePageChange(page-1)} disabled={page === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item key={i+1} active={i+1 === page} onClick={() => handlePageChange(i+1)}>{i+1}</Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => handlePageChange(page+1)} disabled={page === totalPages} />
                </Pagination>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Update Lead Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Lead: {selectedLead?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="new">New</option>
              <option value="called_no_response">Called - No Response</option>
              <option value="not_interested">Not Interested</option>
              <option value="interested">Interested</option>
              <option value="followup">Follow-up Scheduled</option>
              <option value="converted">Converted</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Follow-up Date</Form.Label>
            <Form.Control type="datetime-local" value={followupDate || ""} onChange={(e)=>setFollowupDate(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Remarks</Form.Label>
            <Form.Control as="textarea" rows={3} value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Leads;
