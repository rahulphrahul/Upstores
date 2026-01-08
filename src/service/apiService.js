
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

