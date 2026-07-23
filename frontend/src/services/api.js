const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper for fetching with a timeout (default 4 seconds) to prevent infinite pending state
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[API Timeout] ${url} took longer than ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

// ── Lightweight client-side request cache (TTL: 60 s) ──────────────────────
// Prevents redundant fetches when navigating between pages in the same session.
const _cache = new Map(); // url → { data, expires }
const CACHE_TTL = 0; // Disable frontend cache to prevent late updates

const cachedFetch = async (url, options) => {
  // Only cache plain GET requests with no auth header
  const isPublicGet = !options?.method || options.method === 'GET';
  if (isPublicGet && !options?.headers?.Authorization) {
    const hit = _cache.get(url);
    if (hit && hit.expires > Date.now()) return hit.data.clone();
    const res = await fetchWithTimeout(url, options);
    if (res.ok) {
      _cache.set(url, { data: res.clone(), expires: Date.now() + CACHE_TTL });
    }
    return res;
  }
  return fetchWithTimeout(url, options);
};

// Helper for auth headers — must be before any functions that use it
const getAuthHeaders = (contentType = 'application/json') => {
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch (e) { /* disregard */ }
  return headers;
};

// AUTH
export const loginUser = async (phone, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API login failed');
  return data;
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API register failed');
  return data;
};

export const fetchPendingB2B = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/pending-b2b`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const approveB2B = async (userId) => {
  const res = await fetch(`${API_URL}/auth/approve/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const updateUserProfile = async (userData) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return await res.json();
};

export const getUserProfile = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// COUPONS
export const fetchPublicCoupons = async () => {
  try {
    const res = await fetch(`${API_URL}/coupons/public`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const fetchAllCoupons = async () => {
  try {
    const res = await fetch(`${API_URL}/coupons`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const validateCoupon = async (code) => {
  try {
    const res = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

export const createCoupon = async (couponData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  return await res.json();
};

export const updateCoupon = async (id, couponData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  return await res.json();
};

export const deleteCoupon = async (id) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// PRODUCTS
export const fetchProducts = async (isAdmin = false) => {
  try {
    const res = await cachedFetch(`${API_URL}/products${isAdmin ? '?isAdmin=true' : ''}`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const fetchProductById = async (id) => {
  try {
    const res = await cachedFetch(`${API_URL}/products/${id}`);
    const data = await res.json();
    return data.data || null;
  } catch (e) { return null; }
};

export const fetchBulkProducts = async () => {
  try {
    const res = await cachedFetch(`${API_URL}/products/bulk`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const validateCartStock = async (items) => {
  try {
    const res = await fetch(`${API_URL}/products/validate-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, data: [] };
  }
};

// VALUE PACKS
export const fetchValuePacks = async () => {
  try {
    const res = await fetch(`${API_URL}/value-packs`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createValuePack = async (packData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/value-packs`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(packData),
  });
  return await res.json();
};

export const updateValuePack = async (id, packData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/value-packs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify(packData),
  });
  return await res.json();
};

export const deleteValuePack = async (id) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/value-packs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const createProduct = async (productData) => {
  _cache.clear();
  const isFormData = productData instanceof FormData;
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await res.json();
};

export const updateProduct = async (id, productData) => {
  _cache.clear();
  const isFormData = productData instanceof FormData;
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await res.json();
};

export const deleteProduct = async (id) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// STORES
export const fetchStores = async () => {
  try {
    const res = await cachedFetch(`${API_URL}/stores`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createStore = async (storeData) => {
  _cache.clear();
  const isFormData = storeData instanceof FormData;
  const res = await fetch(`${API_URL}/stores`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? storeData : JSON.stringify(storeData),
  });
  return await res.json();
};

export const updateStore = async (id, storeData) => {
  _cache.clear();
  const isFormData = storeData instanceof FormData;
  const res = await fetch(`${API_URL}/stores/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? storeData : JSON.stringify(storeData),
  });
  return await res.json();
};

export const deleteStore = async (id) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/stores/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// CATEGORIES
export const fetchCategories = async () => {
  try {
    const res = await cachedFetch(`${API_URL}/categories`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createCategory = async (categoryData) => {
  _cache.clear();
  const isFormData = categoryData instanceof FormData;
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? categoryData : JSON.stringify(categoryData),
  });
  return await res.json();
};

export const updateCategory = async (id, categoryData) => {
  _cache.clear();
  const isFormData = categoryData instanceof FormData;
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? categoryData : JSON.stringify(categoryData),
  });
  return await res.json();
};

export const createSubCategory = async (categoryId, subData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/categories/${categoryId}/subcategories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subData),
  });
  return await res.json();
};

export const deleteCategory = async (id) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// ADDRESSES
export const fetchAddresses = async () => {
  try {
    const res = await fetch(`${API_URL}/addresses`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createAddress = async (addressData) => {
  const res = await fetch(`${API_URL}/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData),
  });
  return await res.json();
};

export const updateAddress = async (id, addressData) => {
  const res = await fetch(`${API_URL}/addresses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData),
  });
  return await res.json();
};

export const deleteAddress = async (id) => {
  const res = await fetch(`${API_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// PINCODES
export const checkServiceability = async (pincode) => {
  try {
    const res = await fetch(`${API_URL}/pincodes/check/${pincode}`);
    return await res.json();
  } catch (e) { return { success: false, serviceable: false }; }
};

export const fetchAdminPincodes = async () => {
  try {
    const res = await fetch(`${API_URL}/pincodes/admin`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const addAdminPincode = async (pincodeData) => {
  const res = await fetch(`${API_URL}/pincodes/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pincodeData),
  });
  return await res.json();
};

export const deleteAdminPincode = async (id) => {
  const res = await fetch(`${API_URL}/pincodes/admin/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// ORDERS
export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  return await res.json();
};

export const createRazorpayOrder = async (amount) => {
  const res = await fetch(`${API_URL}/orders/razorpayCreate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return await res.json();
};

export const fetchUserOrders = async () => {
  try {
    const res = await fetch(`${API_URL}/orders/my`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const fetchOrderById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/orders/my/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || null;
  } catch (e) { return null; }
};

// Admin Orders
export const fetchAllOrders = async () => {
  try {
    const res = await fetch(`${API_URL}/orders/admin/all`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const updateOrderStatus = async (id, updateData) => {
  const res = await fetch(`${API_URL}/orders/admin/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return await res.json();
};

export const fetchAdminStats = async () => {
  try {
    const res = await fetch(`${API_URL}/orders/admin/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || null;
  } catch (e) { return null; }
};

// SETTINGS
export const fetchSettings = async () => {
  try {
    const res = await cachedFetch(`${API_URL}/settings`);
    const data = await res.json();
    return data.data || null;
  } catch (e) { return null; }
};

export const updateSettings = async (settingsData) => {
  _cache.clear();
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData),
  });
  return await res.json();
};

// Delivery fee calculation (tiered flat-fee, no distance needed)
export const calcDeliveryFee = async ({ subtotal, deliveryType = 'Smart' }) => {
  try {
    const params = new URLSearchParams({ subtotal, deliveryType });
    const res = await fetch(`${API_URL}/settings/delivery-fee?${params.toString()}`);
    return await res.json();
  } catch (e) {
    return { success: false, deliveryFee: 25, packagingFee: 10, smallCartFee: 0, isFree: false };
  }
};

// DELIVERY MANAGEMENT
export const fetchDeliveryAgents = async () => {
    try {
        const res = await fetch(`${API_URL}/delivery/agents`, { headers: getAuthHeaders() });
        const data = await res.json();
        return data.data || [];
    } catch (e) { return []; }
};

export const createDeliveryAgent = async (agentData) => {
    const res = await fetch(`${API_URL}/delivery/agents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(agentData),
    });
    return await res.json();
};

export const deleteDeliveryAgent = async (id) => {
    const res = await fetch(`${API_URL}/delivery/agents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return await res.json();
};

export const assignOrderToAgent = async (orderId, agentId, agentEarnings) => {
    const res = await fetch(`${API_URL}/delivery/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderId, agentId, agentEarnings }),
    });
    return await res.json();
};

export const fetchSettlementData = async () => {
    try {
        const res = await fetch(`${API_URL}/delivery/settlements`, { headers: getAuthHeaders() });
        const data = await res.json();
        return data.data || [];
    } catch (e) { return []; }
};

export const processSettlement = async (settlementData) => {
    const res = await fetch(`${API_URL}/delivery/settle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settlementData),
    });
    return await res.json();
};

// AGENT DELIVERY ACTIONS
export const fetchAgentOrders = async () => {
    try {
        const res = await fetch(`${API_URL}/delivery/my-orders`, { headers: getAuthHeaders() });
        const data = await res.json();
        return data.data || [];
    } catch (e) { return []; }
};

export const markAsDelivered = async (orderId) => {
    const res = await fetch(`${API_URL}/delivery/deliver/${orderId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return await res.json();
};

export const fetchAgentMetrics = async () => {
    try {
        const res = await fetch(`${API_URL}/delivery/metrics`, { headers: getAuthHeaders() });
        const data = await res.json();
        return data.data || null;
    } catch (e) { return null; }
};

// HOME SECTIONS
export const fetchHomeSections = async () => {
    try {
        const res = await cachedFetch(`${API_URL}/products/home-sections`);
        const data = await res.json();
        return data.data || { latest: [], trending: [], mostPurchased: [] };
    } catch (e) { return { latest: [], trending: [], mostPurchased: [] }; }
}

// RECOMMENDATIONS — pass cart IDs to exclude them from results
export const fetchRecommendations = async (cartItemIds = []) => {
    try {
        const params = new URLSearchParams();
        if (cartItemIds.length > 0) params.set('cartItemIds', cartItemIds.join(','));
        const res = await fetch(`${API_URL}/products/recommendations?${params.toString()}`);
        const data = await res.json();
        return data.data || [];
    } catch (e) { return []; }
};

// SAVE USER LOCATION
export const saveUserLocation = async ({ latitude, longitude, locationLabel }) => {
  try {
    const res = await fetch(`${API_URL}/auth/location`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ latitude, longitude, locationLabel }),
    });
    return await res.json();
  } catch (e) { return { success: false }; }
};

// ── Generic Image Upload (for Media Manager) ─────────────────────────────

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('images', file);
  let token = '';
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    token = u?.token || '';
  } catch {}
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
  return data.urls?.[0] || data.url;
};

// ── Web Push Notifications ─────────────────────────────

export const fetchVapidPublicKey = async () => {
  try {
    const res = await fetch(`${API_URL}/notifications/vapidPublicKey`);
    const data = await res.json();
    return data.publicKey;
  } catch (e) { return null; }
};

export const subscribeToPush = async (subscription) => {
  try {
    const res = await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(subscription)
    });
    return await res.json();
  } catch (e) { return { success: false }; }
};

export const sendPushNotification = async (payload) => {
  try {
    const res = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};
