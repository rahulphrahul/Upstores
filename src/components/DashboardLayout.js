import React, { useState,useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getPurchasePendingCount } from "../service/apiService";
import { Button } from "react-bootstrap";
import "./DashboardLayout.css";
import Header from "./Header";
import { APP_LOGO_URL, FALLBACK_IMAGE } from "../config/config";
import {
  LayoutDashboard,
  Users,
  Store,
  UserCircle,
  Wrench,
  MapPin,
  Settings,
  Tags,
  Image,
  Megaphone,
  QrCode,
  ShoppingCart,
  Wallet,
  CreditCard
} from "lucide-react";


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

 const iconStyle = { color: "#9CA3AF", size: 18 }; // Tailwind gray-400
const [pendingCount, setPendingCount] = useState(0);

const menus = {
  admin: [
    { name: "Dashboard", path: "/dashboard/super-admin/home", icon: <LayoutDashboard {...iconStyle} /> },
    { name: "Executives", path: "/dashboard/super-admin/executives", icon: <Users {...iconStyle} /> },
    { name: "Shops", path: "/dashboard/super-admin/shops", icon: <Store {...iconStyle} /> },
    { name: "Sellers", path: "/dashboard/super-admin/sellers", icon: <UserCircle {...iconStyle} /> },
    { name: "Services", path: "/dashboard/super-admin/services", icon: <Wrench {...iconStyle} /> },
    { name: "Customers", path: "/dashboard/super-admin/customers", icon: <Users {...iconStyle} /> },
    { name: "Category", path: "/dashboard/super-admin/categories", icon: <Tags {...iconStyle} /> },
    { name: "Banners", path: "/dashboard/super-admin/banners", icon: <Image {...iconStyle} /> },
    { name: "Update Notice", path: "/dashboard/super-admin/update-notice", icon: <Megaphone {...iconStyle} /> },
    { name: "Bank Details", path: "/dashboard/super-admin/company-bank-details", icon: <CreditCard {...iconStyle} /> },
    { name: "Wallet Management", path: "/dashboard/super-admin/wallet-management", icon: <Wallet  {...iconStyle} /> },
    { name: "Settings", path: "/dashboard/super-admin/settings", icon: <Settings {...iconStyle} /> },
  ],

  executive: [
    { name: "Dashboard", path: "/dashboard/executive/home", icon: <LayoutDashboard {...iconStyle} /> },
    { name: "Shops", path: "/dashboard/executive/shops", icon: <Store {...iconStyle} /> },
    { name: "Sellers", path: "/dashboard/executive/sellers", icon: <UserCircle {...iconStyle} /> },
    { name: "Services", path: "/dashboard/executive/services", icon: <Wrench {...iconStyle} /> },
    { name: "NearBy Merchants", path: "/dashboard/executive/nearby", icon: <MapPin {...iconStyle} /> },
  ],

  shop: [
    { name: "Dashboard", path: "/dashboard/shop/home", icon: <LayoutDashboard {...iconStyle} /> },
    { name: "Customer QR", path: "/dashboard/shop/customer_qr", icon: <QrCode {...iconStyle} /> },
    { name: "Purchase", path: "/dashboard/shop/purchase_history", icon: <ShoppingCart {...iconStyle} /> },
    { name: "Wallet Management", path: "/dashboard/shop/wallet_management", icon: <Wallet {...iconStyle} /> },
    { name: "Customer Purchase", path: "/dashboard/shop/customer_purchase", icon: <Wallet {...iconStyle} /> },
  ],

  seller: [
    { name: "Dashboard", path: "/dashboard/sellers/home", icon: <LayoutDashboard {...iconStyle} /> },
    { name: "Customer QR", path: "/dashboard/sellers/customer_qr", icon: <QrCode {...iconStyle} /> },
    { name: "Purchase", path: "/dashboard/sellers/purchase_history", icon: <ShoppingCart {...iconStyle} /> },
    { name: "Wallet Management", path: "/dashboard/sellers/wallet_management", icon: <Wallet {...iconStyle} /> },
    { name: "Customer Purchase", path: "/dashboard/sellers/customer_purchase", icon: <Wallet {...iconStyle} /> },
  ],

  service: [
    { name: "Dashboard", path: "/dashboard/service/home", icon: <LayoutDashboard {...iconStyle} /> },
    { name: "Customer QR", path: "/dashboard/service/customer_qr", icon: <QrCode {...iconStyle} /> },
    { name: "Purchase", path: "/dashboard/service/purchase_history", icon: <ShoppingCart {...iconStyle} /> },
    { name: "Wallet Management", path: "/dashboard/service/wallet_management", icon: <Wallet {...iconStyle} /> },
    { name: "Customer Purchase", path: "/dashboard/service/customer_purchase", icon: <Wallet {...iconStyle} /> },
  ],
};
useEffect(() => {
  if (!user) return;
  getPurchasePendingCount(user.id)
    .then(res => {
      // console.log("ress",res.data[0]['total_count']);
      if (res.status === "success") {
        setPendingCount(res.data[0]['total_count']);
      }
    })
    .catch(() => {});
}, [user]);


  const menuItems = menus[user?.role] || [];

  return (
    <div className="layout-wrapper">
      {/* TOP BAR (MOBILE) */}
      <Header toggleSidebar ={toggleSidebar} isSidebarOpen = {isSidebarOpen} user={user} logo={APP_LOGO_URL} />
      
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="text-center mb-4">
          <img src={APP_LOGO_URL || FALLBACK_IMAGE} alt="Company Logo" className="sidebar-logo" />
          <h6 className="mt-2 text-black">
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
      <span className="menu-icon">{item.icon}</span>
      <span className="menu-text">{item.name}
         {item.name === "Customer Purchase" && pendingCount > 0 && (
          <span className="pending-badge">
            {pendingCount}
          </span>
        )}
      </span>
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
