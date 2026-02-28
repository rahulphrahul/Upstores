import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Pagination,
  Row,
  Col
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  addCategory,
  getCategories,
  deleteCategory
} from "../../service/apiService";

const Categorymanagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [mainType, setMainType] = useState("");
  const [icon, setIcon] = useState(null);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await getCategories("");
      if (res.status === "success") {
        setCategories(res.data);
      }
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ICON ================= */
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Icon must be less than 2MB");
      return;
    }

    setIcon(file);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mainType) {
      toast.error("All fields required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("main_type", mainType);
    if (icon) formData.append("icon", icon);
    if (editId) formData.append("id", editId);

    try {
      const res = await addCategory(formData);

      if (res.status === "success") {
        toast.success(res.message);
        resetForm();
        fetchCategories();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    const res = await deleteCategory(id);

    if (res.status === "success") {
      toast.success("Deleted successfully");
      fetchCategories();
    } else {
      toast.error(res.message);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setMainType(cat.main_type);
    setIcon(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setMainType("");
    setIcon(null);
  };

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / recordsPerPage);

  return (
    <Container className="mt-4">
      <ToastContainer position="top-right" autoClose={2000} />

      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-4">
            {editId ? "Edit Category" : "Category Management"}
          </h4>

          {/* ================= FORM ================= */}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Main Type</Form.Label>
                  <Form.Select
                    value={mainType} style={{height:"45px"}}
                    onChange={(e) => setMainType(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="shop">Shop</option>
                    <option value="seller">Seller</option>
                    <option value="service">Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="d-flex align-items-end">
                <Button type="submit" className="w-100">
                  {editId ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>

            {editId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={resetForm}
                className="mb-3"
              >
                Cancel Edit
              </Button>
            )}
          </Form>

          <hr />

          {/* ================= TABLE ================= */}
          <h5 className="mb-3">Category List</h5>

          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Icon</th>
                <th width="150">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>
                      <Badge bg="info">{cat.main_type}</Badge>
                    </td>
                    <td>
                      <img
                        src={`${process.env.REACT_APP_BASE_URL}/categories/category-icons/${cat.icon}`}
                        alt=""
                        width="40"
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Categorymanagement;