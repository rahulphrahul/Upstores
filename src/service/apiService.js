
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

export const createExecutiveShop = async (data) =>
  fetch(`${BASE_URL}/executives/shops/create.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());

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
export const addExecutiveSeller = async (data) => {
  return fetch(`${BASE_URL}/sellers/add_executive_seller.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
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

// ================== OPTIONAL: GET SHOP SERVICES ==================
export const getShopServices = async (shopId) => {
  const res = await fetch(`${BASE_URL}/services/get_services.php?shop_id=${shopId}`);
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

