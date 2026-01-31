import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Wallet, Users, Storefront } from "@phosphor-icons/react";
import DashboardCard from "../../components/customer/DashboardCard";
import { getCustomerDashboard } from "../../service/apiServices";

const CustomerDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getCustomerDashboard().then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="g-3">
        <Col md={4}>
          <DashboardCard
            icon={<Wallet size={28} />}
            title="Wallet Balance"
            value={`₹ ${data.wallet}`}
          />
        </Col>
        <Col md={4}>
          <DashboardCard
            icon={<Users size={28} />}
            title="Referral Points"
            value={data.referral_points}
          />
        </Col>
        <Col md={4}>
          <DashboardCard
            icon={<Storefront size={28} />}
            title="Nearby Shops"
            value={data.nearby_shops}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerDashboard;
