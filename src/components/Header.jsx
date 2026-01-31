import { FiMenu, FiX, FiSearch } from "react-icons/fi";
import { useLocation } from "react-router-dom";

function Header({ toggleSidebar, isSidebarOpen, user, logo }) {
  const location = useLocation();

  const isCustomerDashboard = location.pathname.includes(
    "dashboard/customer/home"
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const closeAll = () => {
    setIsDrawerOpen(false);
    setIsNotificationOpen(false);
  };
  return (
    <>
      <header className="topbar">
        <div className="topbar-row-1">
          {/* {!isCustomerDashboard && ( */}
            <button className="menu-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          {/* )} */}
          {/* {isCustomerDashboard && (
            <button className="menu-btn" onClick={toggleDrawer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )} */}
          <img
            src={logo}
            alt="Company Logo"
            className={`topbar-logo ${isCustomerDashboard ? "logo-large" : ""
              }`}
          />
          <button className="notification-btn" onClick={toggleNotification}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Notification Badge */}
            <span className="notification-badge">3</span>
          </button>
          {/* Notification Panel Component */}
          <NotificationPanel isOpen={isNotificationOpen} onClose={toggleNotification} />

        </div>
        {/* <Drawer isOpen={isDrawerOpen} onClose={toggleDrawer} /> */}
        {/* Search bar only for customer dashboard */}
        {isCustomerDashboard && (
          <div className="topbar-row-2">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search....."
                className="search-input"
              />
              <button className="search-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" />
                  <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )} */}
      </header>

     
    </>
  );
}

export default Header;
