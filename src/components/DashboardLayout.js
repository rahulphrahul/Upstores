import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FiMenu, FiX } from "react-icons/fi";
import "./DashboardLayout.css";
import logo from "../assets/logo.png";
import Header from "./Header";

function DashboardLayout({ user, setUser }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const menus = {
    admin: [
      { name: "Dashboard", path: "/dashboard/super-admin/home" },
      { name: "Executives", path: "/dashboard/super-admin/executives" },
      { name: "Shops", path: "/dashboard/super-admin/shops" },
      { name: "Sellers", path: "/dashboard/super-admin/sellers" },
      { name: "Services", path: "/dashboard/super-admin/services" },
      { name: "Customers", path: "/dashboard/super-admin/customers" },
      { name: "Settings", path: "/dashboard/super-admin/settings" }
    ],
    executive: [
      { name: "Dashboard", path: "/dashboard/executive/home" },
      { name: "Shops", path: "/dashboard/executive/shops" },
      { name: "Sellers", path: "/dashboard/executive/sellers" },
      { name: "Services", path: "/dashboard/executive/services" },
      { name: "NearBy Shops", path: "/dashboard/executive/nearby" },
      // { name: "Purchase History", path: "/dashboard/executive/history" },
      // { name: "Wallet & Redemption", path: "/dashboard/executive/redeem" },
      // { name: "Add Purchase", path: "/dashboard/executive/addpurchase" },

    ],
    shop: [
      { name: "Dashboard", path: "/dashboard/shop/home" },
          { name: "Customer QR", path: "/dashboard/shop/customer_qr" },
            { name: "Purchase", path: "/dashboard/shop/purchase_history" },
                { name: "Wallet Management", path: "/dashboard/shop/wallet_management" },
                  // { name: "Security", path: "/dashboard/shop/security" },
    ],
    seller: [
      { name: "Dashboard", path: "/dashboard/seller/home" },
        { name: "Customer QR", path: "/dashboard/seller/customer_qr" },
            { name: "Purchase", path: "/dashboard/seller/purchase_history" },
                { name: "Wallet Management", path: "/dashboard/seller/wallet_management" },
    ],
    service: [
      { name: "Dashboard", path: "/dashboard/service/home" },
        { name: "Customer QR", path: "/dashboard/service/customer_qr" },
            { name: "Purchase", path: "/dashboard/service/purchase_history" },
                { name: "Wallet Management", path: "/dashboard/service/wallet_management" },
    ],
  };

  const menuItems = menus[user?.role] || [];

  return (
    <div className="layout-wrapper">
      {/* TOP BAR (MOBILE) */}
      <Header toggleSidebar ={toggleSidebar} isSidebarOpen = {isSidebarOpen}user={user} logo={logo} />
      
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="text-center mb-4">
          <img src={logo} alt="Company Logo" className="sidebar-logo" />
          <h6 className="mt-2 text-white">
            {user?.name?.toUpperCase()}
          </h6>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
              onClick={closeSidebarOnMobile}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="logout-section">
          <Button
            variant="outline-light"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
