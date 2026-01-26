import React from 'react';

const NotificationPanel = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#0033FF"/>
          <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "New Order Received",
      description: "You have a new order from Shop #1234",
      time: "5 minutes ago",
      unread: true
    },
    {
      id: 2,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Payment Successful",
      description: "Your payment of $50 has been processed",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF9800"/>
          <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "Special Offer",
      description: "Get 20% off on all electronics today!",
      time: "3 hours ago",
      unread: true
    },
    {
      id: 4,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#999"/>
          <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: "Order Delivered",
      description: "Your order #5678 has been delivered",
      time: "Yesterday",
      unread: false
    }
  ];

  return (
    <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-notification" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.unread ? 'unread' : ''}`}
          >
            <div className="notification-icon">
              {notification.icon}
            </div>
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.description}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
