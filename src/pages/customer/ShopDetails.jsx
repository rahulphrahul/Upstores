import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Storefront, Receipt } from "@phosphor-icons/react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopDetails } from "../../service/apiService";

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShopDetails(id).then((res) => {
      if (res.success) {
        setShop(res.data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!shop) {
    return <Alert variant="danger">Shop not found</Alert>;
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <Storefront size={32} className="me-2 text-primary" />
            <h4 className="mb-0">{shop.name}</h4>
          </div>

          <p className="text-muted mb-1">{shop.category}</p>
          <p className="text-muted">{shop.address}</p>

          <Button
            className="w-100 mt-3"
            onClick={() =>
              navigate("/customer/add-purchase", {
                state: { shopId: shop.id },
              })
            }
          >
            <Receipt size={18} className="me-2" />
            Add Purchase
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShopDetails;
