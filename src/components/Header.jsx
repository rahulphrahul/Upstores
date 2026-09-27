import React from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { FALLBACK_IMAGE } from "../config/config";

function Header({ toggleSidebar, isSidebarOpen, logo, onLogout }) {
  const location = useLocation();
  const isCustomerDashboard = location.pathname.includes("dashboard/customer/home");

  return (
    <header className={`topbar${isCustomerDashboard ? " topbar-customer" : ""}`}>
      <div className="topbar-row-1">
        <button
          type="button"
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {isSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
        <img
          src={logo || FALLBACK_IMAGE}
          alt="Upstores"
          className={`topbar-logo${isCustomerDashboard ? " logo-large" : ""}`}
        />
        <button type="button" className="header-logout-btn" onClick={onLogout}>
          <LogOut size={17} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>

      {isCustomerDashboard && (
        <div className="topbar-row-2">
          <div className="search-container">
            <input type="text" placeholder="Search…" className="search-input" />
            <button type="button" className="search-btn" aria-label="Search">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
