import React, { useState } from "react";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { Receipt, UploadSimple } from "@phosphor-icons/react";
import { addPurchase } from "../../service/apiServices";
import { useLocation, useNavigate } from "react-router-dom";

const AddPurchase = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const shopId = state?.shopId;

  const [bill, setBill] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bill) {
      setMessage("Please upload bill image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("shop_id", shopId);
    formData.append("bill_image", bill);
    formData.append("amount", amount);

    const res = await addPurchase(formData);
    setLoading(false);

    if (res.success) {
      navigate("/customer/purchases");
    } else {
      setMessage(res.message || "Failed to submit purchase");
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="mb-3">
            <Receipt size={22} className="me-2" />
            Add Purchase
          </h5>

          {message && <Alert variant="danger">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Upload Bill</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setBill(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bill Amount (Auto / Manual)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount if OCR fails"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <UploadSimple size={18} className="me-2" />
                  Submit Purchase
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddPurchase;
