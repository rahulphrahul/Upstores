
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
export const getExecutives = async ({
  page = 1,
  limit = 10,
  search = ""
}) => {
  const params = new URLSearchParams({
    page,
    limit,
    search,
  }).toString();

  const res = await fetch(
    `${BASE_URL}/executives/list.php?${params}`
  );

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

export const getShops = async (page = 1, search = "") =>
  fetch(`${BASE_URL}/shops/list.php?page=${page}&limit=10&search=${search}`)
    .then(res => res.json());

export const deleteShop = async (id) =>
  fetch(`${BASE_URL}/shops/delete.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  }).then(res => res.json());

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
export const getExecutiveSellers = async (executiveId) => {
  const res = await fetch(
    `${BASE_URL}/sellers/get_executive_seller.php?executive_id=${executiveId}`
  );

  if (!res.ok) {
    throw new Error("API failed");
  }

  return res.json();
};

/* ============================
   GET Categories
============================ */
export const getCategories = async (main_type) => {
  const res = await fetch(
    `${BASE_URL}/categories/getCategories.php?main_type=${main_type}`
  );

  if (!res.ok) {
    throw new Error("API failed");
  }

  return res.json();
};
/* ============================
   DELETE CATEGORY
============================ */
export const deleteCategory = async (id) =>
  fetch(`${BASE_URL}/categories/deleteCategory.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then(res => res.json());

// export const addPurchase = async (formData) => {
//   const res = await fetch(
//     `${BASE_URL}/customer/add_purchase.php`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   return res.json();
// };

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

export const addExecutiveService = async (formData) => {
const res = await fetch(
    `${BASE_URL}/services/add_executive_services.php`,
    {
      method: "POST",
      body: formData, // ✅ FormData
    }
  );

  return res.json();
};
export const checkEmailExists = async (email) => {
  return fetch(`${BASE_URL}/auth/check-email.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then(res => res.json());
};

export const updateExecutiveService = async (data) => {
  const fd = new FormData();

  Object.keys(data).forEach(key => {
    fd.append(key, data[key]);
  });

  const res = await fetch(
    `${BASE_URL}/services/update_executive_service.php`,
    {
      method: "POST",
      body: fd, // ✅ no headers needed
    }
  );

  return await res.json();
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
export const getSellers = async (page = 1, search = "") =>
  fetch(`${BASE_URL}/sellers/get_sellers.php?page=${page}&limit=10&search=${search}`)
    .then(res => res.json());

export const deleteSeller = async (id) =>
  fetch(`${BASE_URL}/sellers/delete_seller.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  }).then(res => res.json());


export const updateSellerStatus = async (sellerId, status) => {
  const res = await fetch(`${BASE_URL}/sellers/update_seller_status.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerId, status }),
  });
  return res.json();
};
/* ================= SERVICES ================= */

export const getServices = async (page = 1, search = "") => {
  const res = await fetch(
    `${BASE_URL}/services/get_services.php?page=${page}&search=${search}`
  );
  return res.json();
};

export const deleteService = async (id) => {
  const formData = new FormData();
  formData.append("id", id);

  const res = await fetch(`${BASE_URL}/services/delete_service.php`, {
    method: "POST",
    body: formData,
  });

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
export const getExecutiveNearbyServices = async (executiveId, latitude, longitude) => {
  const res = await fetch(`${BASE_URL}/services/get_executive_nearby_services.php?executive_id=${executiveId}&latitude=${latitude}&longitude=${longitude}`);
  return res.json();
};
export const getExecutiveNearbySellers = async (executiveId, latitude, longitude) => {
  const res = await fetch(`${BASE_URL}/sellers/get_executive_nearby_sellers.php?executive_id=${executiveId}&latitude=${latitude}&longitude=${longitude}`);
  return res.json();
};

export const getNearbyItemDetails = async (id, type) => {
  let endpoint = "";
   let type_id = "";

  if (type === "sellers") {
    endpoint = "sellers/get_login_seller.php";
    type_id="seller_id";
  } else if (type === "shops") {
    endpoint = "shops/shop_login_details.php";
    type_id="shop_id";
  } else if (type === "services") {
    endpoint = "services/get_login_services.php";
    type_id="service_id";
  }

  const res = await fetch(`${BASE_URL}/${endpoint}?${type_id}=${id}`);
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
export const resetPassword = async (token, password) => {
  const res = await fetch(`${BASE_URL}/auth/reset_password.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  return res.json();
};
// apiService.js
export const sendPasswordResetEmail = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot_password.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};
export const getCustomers = async (page = 1, search = "") => {
  const res = await fetch(
    `${BASE_URL}/customers/list.php?page=${page}&search=${search}`
  );
  return res.json();
};

export const deleteCustomer = async (id) => {
  const formData = new FormData();
  formData.append("id", id);

  const res = await fetch(`${BASE_URL}/customers/delete.php`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const updateWallet = async (userId, amount) => {
  const res = await fetch(`${BASE_URL}/customers/update-wallet.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      amount
    }),
  });
  return res.json();
};
// shop purchase transaction

export const getPurchasePendingCount = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/customers/get_purchase_pending_count.php?shop_id=${shopId}`
  );
  return res.json();
};
export const getShopPurchases = async (shopId) => {
  const res = await fetch(
    `${BASE_URL}/shops/get_shop_purchases.php?shop_id=${shopId}`
  );
  return res.json();
};



export const updatePurchaseStatus = async ({ shop_id, status, reason,shop_type }) => {
  const res = await fetch(
    `${BASE_URL}/shops/update_purchase_status.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_id,
        status,
        reason,
        shop_type
      })
    }
  );

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

export const deleteBanner = async (id) => {
  const res = await fetch(`${BASE_URL}/banners/delete.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json();
};
export const getBanners = async () => {
  const res = await fetch(`${BASE_URL}/banners/list.php`);
  return res.json();
};

/* =========================
   ADMIN: UPDATE NOTICE
========================= */

export const getUpdateNotice = async () => {
  const res = await fetch(`${BASE_URL}/update_notice.php`);
  return res.json();
};

export const saveUpdateNotice = async (data) => {
  const res = await fetch(`${BASE_URL}/update_notice.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
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
    `${BASE_URL}/auth/change_password.php`,
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
   ADMIN: CUSTOMER WITHDRAWALS
========================= */

/* =========================
   ADMIN: CUSTOMER WITHDRAWALS
========================= */

export const getCustomerWithdrawals = async (
  from = "",
  to = "",
  name = ""
) => {
  const params = new URLSearchParams({ from, to, name }).toString();

  const res = await fetch(
    `${BASE_URL}/admin/get_customer_withdrawals.php?${params}`
  );

  return res.json();
};
export const exportCustomerWithdrawals = (from = "", to = "") => {
  const params = new URLSearchParams({ from, to }).toString();

  window.open(
    `${BASE_URL}/admin/export_customer_withdrawals.php?${params}`,
    "_blank"
  );
};
/* =========================
   ADMIN: APPROVE WALLET REQUEST
========================= */
export const handleWalletRequest = async (requestId, action, shop_type) => {
  const fd = new FormData();
  fd.append("request_id", requestId);
  fd.append("action", action);
   fd.append("shop_type", shop_type);

  const res = await fetch(`${BASE_URL}/admin/handle_wallet_request.php`, {
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
// reser wallet
/* RESET */
export const resetWallets = async (type, reason) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch(`${BASE_URL}/admin/reset_wallets.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      adminId: user?.id,
      adminName: user?.name,
      type,
      reason
    })
  });

  return res.json();
};

/* HISTORY */
export const getResetHistory = async (from="",to="",role="") => {
  const params = new URLSearchParams({from,to,role});
  const res = await fetch(`${BASE_URL}/admin/get_reset_history.php?${params}`);
  return res.json();
};

/* EXPORT */
export const exportHistory = () => {
  window.open(`${BASE_URL}/admin/export_reset_history.php`,"_blank");
};
/* =========================
   GET WALLET REQUESTS (ADMIN)
========================= */

export const getWalletRequests = async (shop_type) => {
  const res = await fetch(
    `${BASE_URL}/admin/get_pending_requests.php?shop_type=${shop_type}`
  );
  return res.json();
};

export const getFundRequestReports = async ({
  page = 1,
  limit = 10,
  from = "",
  to = "",
  search = "",
} = {}) => {

  const res = await fetch(
    `${BASE_URL}/admin/get_fund_request_reports.php?page=${page}&limit=${limit}&from=${from}&to=${to}&search=${search}`
  );

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


export const getCustomerDashboard = () =>
  fetch(`${BASE_URL}/customers/dashboard.php`);
export const getNearbyShops = (lat, lng, distance = 5) =>
  fetch(
    `${BASE_URL}/customers/shops.php?lat=${lat}&lng=${lng}&distance=${distance}`
  );
export const addPurchase = (formData) =>
  fetch(`${BASE_URL}/customers/add_purchase.php`, formData);
export const getCustomerPurchaseHistory = () =>
  fetch(`${BASE_URL}/customers/purchases.php`);

export const getCustomerWallet = () =>
  fetch(`${BASE_URL}/customers/wallet.php`);

export const redeemWallet = (data) =>
  fetch(`${BASE_URL}/customers/redeem.php`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const getCustomerProfile = () =>
  fetch(`${BASE_URL}/customers/profile.php`);

export const updateCustomerProfile = (data) =>
  fetch(`${BASE_URL}/customers/update_profile.php`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const getCustomerQR = () =>
  fetch(`${BASE_URL}/customers/customer_qr.php`);
