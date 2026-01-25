import { FiMenu, FiX, FiSearch } from "react-icons/fi";
import { useLocation } from "react-router-dom";

function Header({ toggleSidebar, isSidebarOpen, user, logo }) {
  const location = useLocation();

  const isCustomerDashboard = location.pathname.includes(
    "dashboard/customer"
  );

  return (
    <>
      <header className="topbar">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <img
          src={logo}
          alt="Company Logo"
          className={`topbar-logo ${
            isCustomerDashboard ? "logo-large" : ""
          }`}
        />

        <span className="topbar-user">L</span>
         {/* Search bar only for customer dashboard */}
      {/* {isCustomerDashboard && (
        <div className="customer-search-wrapper">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
        </div>
      )} */}
      </header>

     
    </>
  );
}

export default Header;
