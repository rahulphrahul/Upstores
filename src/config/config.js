const env = process.env;

export const UPSTORES_BASE_URL =
  env.REACT_APP_UPSTORES_BASE_URL || "https://semicoloninnovations.in/upstores";
export const API_ROOT_URL =
  env.REACT_APP_API_ROOT_URL || `${UPSTORES_BASE_URL}/api`;
export const API_BASE_URL =
  env.REACT_APP_API_BASE_URL || `${UPSTORES_BASE_URL}/api/customers`;
export const API_COMPANY_URL =
  env.REACT_APP_API_COMPANY_URL || `${UPSTORES_BASE_URL}/api/company`;

export const APP_LOGO_URL =
  env.REACT_APP_APP_LOGO_URL || `${process.env.PUBLIC_URL}/company-logo.png`;

export const BASE_IMAGE_URL =
  env.REACT_APP_BASE_IMAGE_URL || `${UPSTORES_BASE_URL}/api/images`;
export const BASE_BANNER_URL =
  env.REACT_APP_BASE_BANNER_URL || `${UPSTORES_BASE_URL}/api/images/banners`;
export const BASE_CATEGORY_URL =
  env.REACT_APP_BASE_CATEGORY_URL || `${UPSTORES_BASE_URL}/api/categories/category-icons/`;
export const BASE_CUSTM_IMG_URL =
  env.REACT_APP_BASE_CUSTM_IMG_URL || `${UPSTORES_BASE_URL}/api/`;
export const Bill_IMG_URL =
  env.REACT_APP_BILL_IMG_URL || `${UPSTORES_BASE_URL}/bills`;
export const Bill_WALLET_IMG_URL =
  env.REACT_APP_BILL_WALLET_IMG_URL || `${UPSTORES_BASE_URL}/uploads/wallet`;

export const BASE_URL = API_ROOT_URL;

export const FALLBACK_IMAGE =
  env.REACT_APP_FALLBACK_IMAGE || `${UPSTORES_BASE_URL}/api/images/no-img.png`;
export const BASEPATH = UPSTORES_BASE_URL;
