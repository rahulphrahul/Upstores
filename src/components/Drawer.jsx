import React from 'react';

const Drawer = ({ isOpen, onClose }) => {
  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-profile">
          <div className="profile-avatar">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#0033FF"/>
              <path d="M20 20C22.7614 20 25 17.7614 25 15C25 12.2386 22.7614 10 20 10C17.2386 10 15 12.2386 15 15C15 17.7614 17.2386 20 20 20Z" fill="white"/>
              <path d="M28 30C28 25.5817 24.4183 22 20 22C15.5817 22 12 25.5817 12 30" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="profile-info">
            <h3>Welcome User</h3>
            <p>user@upstores.com</p>
          </div>
        </div>
        <button className="close-drawer" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <nav className="drawer-nav">
        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#333" strokeWidth="2"/>
          </svg>
          <span>Home</span>
        </a>

        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" stroke="#333" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" stroke="#333" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" stroke="#333" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" stroke="#333" strokeWidth="2"/>
          </svg>
          <span>Categories</span>
        </a>

        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 2H5C3.89543 2 3 2.89543 3 4V8C3 9.10457 3.89543 10 5 10H9C10.1046 10 11 9.10457 11 8V4C11 2.89543 10.1046 2 9 2Z" stroke="#333" strokeWidth="2"/>
            <path d="M19 2H15C13.8954 2 13 2.89543 13 4V8C13 9.10457 13.8954 10 15 10H19C20.1046 10 21 9.10457 21 8V4C21 2.89543 20.1046 2 19 2Z" stroke="#333" strokeWidth="2"/>
            <path d="M9 14H5C3.89543 14 3 14.8954 3 16V20C3 21.1046 3.89543 22 5 22H9C10.1046 22 11 21.1046 11 20V16C11 14.8954 10.1046 14 9 14Z" stroke="#333" strokeWidth="2"/>
          </svg>
          <span>Orders</span>
        </a>

        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#333" strokeWidth="2"/>
          </svg>
          <span>Account</span>
        </a>

        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Help & Support</span>
        </a>

        <a href="#" className="drawer-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" stroke="#333" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2"/>
          </svg>
          <span>Settings</span>
        </a>
      </nav>

      <div className="drawer-footer">
        <a href="#" className="drawer-item logout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Drawer;
