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
      { name: "My Home", path: "/dashboard/shop/home" },
    ],
    seller: [
      { name: "My Home", path: "/dashboard/seller/home" },
    ],
    service: [
      { name: "My Home", path: "/dashboard/service/home" },
    ],
    customer: [
      { name: "My Home", path: "/dashboard/customer/home" },
      { name: "Share", path: "/dashboard/customer/share" },
      { name: "Scan Qr", path: "/dashboard/customer/scan-qr" },
      { name: "Customer Tree", path: "/dashboard/customer/customer-tree" },
      { name: "Customer Purchase", path: "/dashboard/customer/customer-purchase" },
      { name: "My Purchase", path: "/dashboard/customer/my-purchase" },
      { name: "Wallet", path: "/dashboard/customer/wallet" },
      { name: "Shops", path: "/dashboard/customer/shops" },
    ],
  };

  const menuItems = menus[user?.role] || [];

  return (
    <div className="layout-wrapper">
      {/* TOP BAR (MOBILE) */}
      <Header toggleSidebar ={toggleSidebar} isSidebarOpen = {isSidebarOpen} user={user} logo={logo} />
      
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
