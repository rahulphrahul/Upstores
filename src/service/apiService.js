
const BASE_URL = 'https://semicoloninnovations.in/upstores/api';

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

/* ================= MASTER DASHBOARD ================= */

export const getDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats.php`);
  return res.json();
};

export const getDailyTransactions = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/daily-transactions.php`);
  return res.json();
};

export const getMonthlyTransactions = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/monthly-transactions.php`);
  return res.json();
};

export const getPendingFunds = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/pending-funds.php`);
  return res.json();
};

export const fundAction = async (id, action) => {
  const res = await fetch(`${BASE_URL}/dashboard/fund-action.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, action }),
  });
  return res.json();
};
/* ================= EXECUTIVES ================= */

export const getExecutives = async () => {
  const res = await fetch(`${BASE_URL}/executives/list.php`);
  return res.json();
};

export const createExecutive = async (data) => {
  const res = await fetch(`${BASE_URL}/executives/create.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateExecutive = async (data) => {
  const res = await fetch(`${BASE_URL}/executives/update.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const toggleExecutiveStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/executives/toggle-status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return res.json();
};

export const deleteExecutive = async (id) => {
  const res = await fetch(`${BASE_URL}/executives/delete.php?id=${id}`);
  return res.json();
};

export const getExecutivePerformance = async () => {
  const res = await fetch(`${BASE_URL}/executives/performance.php`);
  return res.json();
};
/* ================= SHOPS ================= */

export const getShops = async () =>
  fetch(`${BASE_URL}/shops/list.php`).then(res => res.json());

export const getPendingShopFunds = async () =>
  fetch(`${BASE_URL}/shops/pending-funds.php`).then(res => res.json());

export const shopFundAction = async (data) =>
  fetch(`${BASE_URL}/shops/fund-action.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());

export const toggleShopStatus = async (id, status) =>
  fetch(`${BASE_URL}/shops/toggle-status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  }).then(res => res.json());

export const adjustShopWallet = async (data) =>
  fetch(`${BASE_URL}/shops/wallet-adjust.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
/* ================= EXECUTIVE SHOPS ================= */

export const getExecutiveShops = async (executiveId) =>
  fetch(
    `${BASE_URL}/executives/shops/list.php?executive_id=${executiveId}`
  ).then(res => res.json());

export const createExecutiveShop = async (formData) => {
  const res = await fetch(
    `${BASE_URL}/executives/shops/create.php`,
    {
      method: "POST",
      body: formData, // ✅ send FormData directly
    }
  );

  return res.json();
};


export const toggleExecutiveShopStatus = async (data) =>
  fetch(`${BASE_URL}/executives/shops/toggle-status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());

  /* ================= Executive SELLERS ================= */

/* ============================
   GET EXECUTIVE SELLERS
============================ */
export const getExecutiveSellers = async (executive_id) => {
  return fetch(
    `${BASE_URL}/sellers/get_executive_seller.php?executive_id=${executive_id}`
  ).then((res) => res.json());
};
/* ============================
   GET Categories
============================ */
export const getCategories = async () =>
  fetch(`${BASE_URL}/categories/getCategories.php`).then(res => res.json());

/* ============================
   ADD EXECUTIVE SELLER
============================ */
export const addExecutiveSeller = async (formData) => {
  const res = await fetch(
    `${BASE_URL}/sellers/add_executive_seller.php`,
    {
      method: "POST",
      body: formData, // ✅ FormData
    }
  );

  return res.json();
};



/* ============================
   UPDATE EXECUTIVE SELLER
============================ */
export const updateExecutiveSeller = async (data) => {
  return fetch(`${BASE_URL}/sellers/update_executive_seller.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
};


/* ============================
   UPDATE SELLER STATUS
============================ */
export const updateExecutiveSellerStatus = async (
  seller_id,
  executive_id,
  status
) => {
  return fetch(`${BASE_URL}/sellers/update_executive_seller_status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seller_id,
      executive_id,
      status, // active | suspended
    }),
  }).then((res) => res.json());
};



/* ================= Executive SERVICES ================= */
export const getExecutiveServices = async (executiveId) => {
  const res = await fetch(
    `${BASE_URL}/services/get_executive_services.php?executive_id=${executiveId}`
  );
  return res.json();
};

export const addExecutiveService = async (data) => {
  const res = await fetch(
    `${BASE_URL}/services/add_executive_services.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return res.json();
};

export const updateExecutiveService = async (data) => {
  const res = await fetch(
    `${BASE_URL}/services/update_executive_services.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return res.json();
};

export const updateExecutiveServiceStatus = async (
  serviceId,
  executiveId,
  status
) => {
  const res = await fetch(
    `${BASE_URL}/services/update_executive_service_status.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        executive_id: executiveId,
        status,
      }),
    }
  );
  return res.json();
};
/* ================= Sellers ================= */  
export const getSellers = async () => 
  fetch(`${BASE_URL}/sellers/get_sellers.php`).then(res => res.json());


export const updateSellerStatus = async (sellerId, status) => {
  const res = await fetch(`${BASE_URL}/sellers/update_seller_status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerId, status }),
  });
  return res.json();
};
/* ================= SERVICES ================= */

export const getServices = async () => {
  const res = await fetch(`${BASE_URL}/services/get_services.php`);
  return res.json();
};

export const updateServiceStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/services/update_service_status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return res.json();
};
/* ================= EXECUTIVE DASHBOARD ================= */

export const getExecutiveDashboardStats = async (data) =>
  fetch(`${BASE_URL}/executives/dashboard/stats.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());

export const getExecutiveMonthlyTransactions = async (data) =>
  fetch(`${BASE_URL}/executives/dashboard/monthly-transactions.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());

export const getExecutiveRecentActivities = async (data) =>
  fetch(`${BASE_URL}/executives/dashboard/recent-activities.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
/* ================= Near by shop ================= */
export const getExecutiveNearbyShops = async (executiveId, latitude, longitude) => {
  const res = await fetch(`${BASE_URL}/shops/get_executive_nearby_shops.php?executive_id=${executiveId}&latitude=${latitude}&longitude=${longitude}`);
  return res.json();
};

/* ================= purchase history ================= */
export const getPurchaseHistory = async (executiveId) => {
  const res = await fetch(`${BASE_URL}/purchases/get_executive_purchases.php?executive_id=${executiveId}`);
  return res.json();
};

// ================== GET SHOP DETAILS ==================
export const getShopDetails = async (shopId) => {
  const res = await fetch(`${BASE_URL}/shops/shop_details.php?shop_id=${shopId}`);
  return res.json();
};

export const getShopLoginDetails = async (shopId) => {
  const res = await fetch(`${BASE_URL}/shops/shop_login_details.php?shop_id=${shopId}`);
  return res.json();
};
// ================== OPTIONAL: GET SHOP SERVICES ==================
export const getShopServices = async (shopId) => {
  const res = await fetch(`${BASE_URL}/services/get_services.php?shop_id=${shopId}`);
  return res.json();
};
export const getServiceLoginDetails = async (serviceId) => {
  const res = await fetch(`${BASE_URL}/services/get_login_services.php?service_id=${serviceId}`);
  return res.json();
};

export const getSellerLoginDetails = async (sellerId) => {
  const res = await fetch(`${BASE_URL}/sellers/get_login_seller.php?seller_id=${sellerId}`);
  return res.json();
};
// ================== OPTIONAL: UPDATE SHOP STATUS ==================
export const updateShopStatus = async (shopId, status) => {
  const res = await fetch(`${BASE_URL}/shops/update_shop_status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shop_id: shopId, status }),
  });
  return res.json();
};

export const registerCustomer = async (data) =>
  fetch(`${BASE_URL}/customers/register.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());

// ===== CAROUSELS =====
export const getTopCarouselImages = async () =>
  fetch(`${BASE_URL}/customers/carousel.php?type=top`)
    .then(res => res.json());

export const getBottomCarouselImages = async () =>
  fetch(`${BASE_URL}/customers/carousel.php?type=bottom`)
    .then(res => res.json());


// category add
export const addCategory = async (formData) => {
  return fetch(`${BASE_URL}/categories/create.php`, {
    method: "POST",
    body: formData, // FormData (DO NOT set headers)
  }).then((res) => res.json());
};

// banners create
export const createBanner = async (formData) => {
  return fetch(`${BASE_URL}/banners/create.php`, {
    method: "POST",
    body: formData,
  }).then((res) => res.json());
};
// shop

export const getShopDashboard = async (shopId) => {
  const res = await fetch(
    `/api/shops/dashboard.php?shop_id=${shopId}`
  );
  return res.json(); // NOT res.data
};


export const getShopProfile = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/profile.php?shop_id=${shopId}`
  );
  return res.json();
};

/* =========================
   SHOP QR
========================= */

export const getShopQR = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/shop_qr.php?shop_id=${shopId}`
  );
  return res.json();
};

/* =========================
   FAST BILLING (SCAN CUSTOMER QR)
========================= */

export const scanCustomerQR = async (formData) => {
  const res = await fetch(
    `${BASE_URL}/shops/scan_customer_qr.php`,
    {
      method: "POST",
      body: formData, // ✅ FormData only
    }
  );
  return res.json();
};


/* =========================
   PURCHASE REQUESTS
   (Customer → Shop Approval)
========================= */

export const getPurchaseRequests = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/purchase_requests.php?shop_id=${shopId}`
  );
  return res.json();
};

export const approvePurchase = async (purchaseId) => {
  const res = await fetch(
    `${BASE_URL}/shops/approve_purchase.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchase_id: purchaseId }),
    }
  );
  return res.json();
};

export const rejectPurchase = async (purchaseId, reason) => {
  const res = await fetch(
    `${BASE_URL}/shop/reject_purchase.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchase_id: purchaseId,
        reason,
      }),
    }
  );
  return res.json();
};

/* =========================
   PURCHASE HISTORY
========================= */

export const getPurchaseHistorys = async (shopId, filters = {}) => {
  const params = new URLSearchParams({
    shop_id: shopId,
    ...filters,
  }).toString();

  const res = await fetch(
    `${BASE_URL}/shops/purchase_history.php?${params}`
  );
  return res.json();
};

/* =========================
   WALLET
========================= */

export const getWalletDetails = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/wallet.php?shop_id=${shopId}`
  );
  return res.json();
};

export const requestFund = async (formData) => {
  return fetch(
    `${BASE_URL}/shops/fund_request.php`,
    {
      method: "POST",
      body: formData, // FormData (proof image + amount)
    }
  ).then((res) => res.json());
};

/* =========================
   CUSTOMERS (OPTIONAL)
========================= */

export const getShopCustomers = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/customers.php?shop_id=${shopId}`
  );
  return res.json();
};

/* =========================
   NOTIFICATIONS
========================= */

export const getShopNotifications = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/notifications.php?shop_id=${shopId}`
  );
  return res.json();
};

/* =========================
   SECURITY
========================= */

// First-time password change / forgot password
export const changePassword = async (userId, password) => {
  const fd = new FormData();
  fd.append("user_id", userId);
  fd.append("password", password);

  const res = await fetch(
    `${BASE_URL}/change_password.php`,
    {
      method: "POST",
      body: fd,
    }
  );
  return res.json();
};

export const getShopPurchaseHistory = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/shops/shop_purchase_history.php?${query}`);
  return res.json();
};

/* =========================
   WALLET MANAGEMENT SUMMARY
========================= */
export const getWalletSummary = async (shopId) => {
  const res = await fetch(`${BASE_URL}/shops/wallet.php?shop_id=${shopId}`);
  return res.json();
};

/* =========================
   WALLET HISTORY
========================= */
export const getWalletHistory = async (shopId, from = "", to = "") => {
  const params = new URLSearchParams({ shop_id: shopId, from, to }).toString();
  const res = await fetch(`${BASE_URL}/shops/wallet_history.php?${params}`);
  return res.json();
};

/* =========================
   WALLET FUND REQUEST
========================= */
export const requestWalletFund = async (formData) => {
  // formData: shop_id, amount, proof (optional file)
  const res = await fetch(`${BASE_URL}/shops/fund_request.php`, {
    method: "POST",
    body: formData, // FormData object
  });
  return res.json();
};

/* =========================
   ADMIN: APPROVE WALLET REQUEST
========================= */
export const approveWalletRequest = async (requestId, adminRemark = "") => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("admin_remark", adminRemark);

  const res = await fetch(`${BASE_URL}/admin/approve_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   ADMIN: REJECT WALLET REQUEST
========================= */
export const rejectWalletRequest = async (requestId, reason) => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("reason", reason);

  const res = await fetch(`${BASE_URL}/admin/reject_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   GET WALLET REQUESTS (ADMIN)
========================= */
export const getWalletRequests = async (filters = {}) => {
  // filters: user_type, status, from, to
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/admin/wallet_requests.php?${query}`);
  return res.json();
};

/*==================================
  service
===========================================*/

export const scanServiceCustomerQR = async (formData) => {
  const res = await fetch(
    `${BASE_URL}/services/scan_customer_qr.php`,
    {
      method: "POST",
      body: formData, // ✅ FormData only
    }
  );
  return res.json();
};

export const getServicePurchaseHistory = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/services/service_purchase_history.php?${query}`);
  return res.json();
};

/* =========================
   WALLET MANAGEMENT SUMMARY
========================= */
export const getServiceWalletSummary = async (shopId) => {
  const res = await fetch(`${BASE_URL}/services/wallet.php?shop_id=${shopId}`);
  return res.json();
};

/* =========================
   WALLET HISTORY
========================= */
export const getServiceWalletHistory = async (shopId, from = "", to = "") => {
  const params = new URLSearchParams({ shop_id: shopId, from, to }).toString();
  const res = await fetch(`${BASE_URL}/services/wallet_history.php?${params}`);
  return res.json();
};

/* =========================
   WALLET FUND REQUEST
========================= */
export const requestServiceWalletFund = async (formData) => {
  // formData: shop_id, amount, proof (optional file)
  const res = await fetch(`${BASE_URL}/services/fund_request.php`, {
    method: "POST",
    body: formData, // FormData object
  });
  return res.json();
};

/* =========================
   ADMIN: APPROVE WALLET REQUEST
========================= */
export const approveServiceWalletRequest = async (requestId, adminRemark = "") => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("admin_remark", adminRemark);

  const res = await fetch(`${BASE_URL}/admin/approve_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   ADMIN: REJECT WALLET REQUEST
========================= */
export const rejectServiceWalletRequest = async (requestId, reason) => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("reason", reason);

  const res = await fetch(`${BASE_URL}/admin/reject_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   GET WALLET REQUESTS (ADMIN)
========================= */
export const getServiceWalletRequests = async (filters = {}) => {
  // filters: user_type, status, from, to
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/admin/wallet_requests.php?${query}`);
  return res.json();
};

/* =========================
  seller
========================= */

export const scanSellerCustomerQR = async (formData) => {
  const res = await fetch(
    `${BASE_URL}/sellers/scan_customer_qr.php`,
    {
      method: "POST",
      body: formData, // FormData only
    }
  );
  return res.json();
};

export const getSellerPurchaseHistory = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/sellers/seller_purchase_history.php?${query}`);
  return res.json();
};

/* =========================
   WALLET MANAGEMENT SUMMARY
========================= */
export const getSellerWalletSummary = async (shopId) => {
  const res = await fetch(`${BASE_URL}/sellers/wallet.php?shop_id=${shopId}`);
  return res.json();
};

/* =========================
   WALLET HISTORY
========================= */
export const getSellerWalletHistory = async (shopId, from = "", to = "") => {
  const params = new URLSearchParams({ shop_id: shopId, from, to }).toString();
  const res = await fetch(`${BASE_URL}/sellers/wallet_history.php?${params}`);
  return res.json();
};

/* =========================
   WALLET FUND REQUEST
========================= */
export const requestSellerWalletFund = async (formData) => {
  // formData: shop_id, amount, proof (optional file)
  const res = await fetch(`${BASE_URL}/sellers/fund_request.php`, {
    method: "POST",
    body: formData, // FormData object
  });
  return res.json();
};

/* =========================
   ADMIN: APPROVE WALLET REQUEST
========================= */
export const approveSellerWalletRequest = async (requestId, adminRemark = "") => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("admin_remark", adminRemark);

  const res = await fetch(`${BASE_URL}/admin/approve_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   ADMIN: REJECT WALLET REQUEST
========================= */
export const rejectSellerWalletRequest = async (requestId, reason) => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("reason", reason);

  const res = await fetch(`${BASE_URL}/admin/reject_wallet_request.php`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

/* =========================
   GET WALLET REQUESTS (ADMIN)
========================= */
export const getSellerWalletRequests = async (filters = {}) => {
  // filters: user_type, status, from, to
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/admin/wallet_requests.php?${query}`);
  return res.json();
};
