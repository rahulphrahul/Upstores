import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Button, Pagination, Modal, Col, Row } from 'react-bootstrap';
import { getStudents } from '../../service/apiService';
import './ManageStudents.css';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  // ✅ Fetch students
  useEffect(() => {
    const fetchData = async () => {
      const data = await getStudents();
      setStudents(data);
      setFiltered(data);
    };
    fetchData();
  }, []);

  // ✅ Unique courses for filter dropdown
  const courses = [...new Set(students.map((s) => s.course))];

  // ✅ Search & Filter
  useEffect(() => {
    let result = students;
    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (courseFilter) {
      result = result.filter((s) => s.course === courseFilter);
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, courseFilter, students]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  return (
    <div className="manage-students-page">
      <h3 className="mb-4">Manage Students</h3>

      <Card className="shadow-sm p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
          <Form.Select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ maxWidth: '250px' }}
          >
            <option value="">All Courses</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </Form.Select>
        </div>

        <Table striped bordered hover responsive className="student-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Course</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Admission Date</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length > 0 ? (
              displayed.map((s, i) => (
                <tr key={s.id} onClick={() => handleRowClick(s)} className="table-row-clickable">
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>{s.admission_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
            </Pagination>
          </div>
        )}
      </Card>

      {/* ✅ Student Profile Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div className="student-profile">
              <div className="profile-header d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{selectedStudent.name}</h5>
                <span className="badge bg-primary">{selectedStudent.course}</span>
              </div>
              <hr />
              <Row>
                <Col md={6}>
                  <p><strong>Phone:</strong> {selectedStudent.phone || '-'}</p>
                  <p><strong>Email:</strong> {selectedStudent.email || '-'}</p>
                  <p><strong>Admission Date:</strong> {selectedStudent.admission_date}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Address:</strong><br />{selectedStudent.address || '-'}</p>
                  <p><strong>Remarks:</strong><br />{selectedStudent.remarks || '-'}</p>
                </Col>
              </Row>
              <hr />
              <p className="text-muted small">
                <em>Created by Staff ID: {selectedStudent.created_by}</em>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageStudents;
