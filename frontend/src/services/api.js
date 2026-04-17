const API_URL = '/api';

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
  const res = await fetch(`${API_URL}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  return await res.json();
};

export const updateCoupon = async (id, couponData) => {
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });
  return await res.json();
};

export const deleteCoupon = async (id) => {
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// PRODUCTS
export const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createProduct = async (productData) => {
  const isFormData = productData instanceof FormData;
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await res.json();
};

export const updateProduct = async (id, productData) => {
  const isFormData = productData instanceof FormData;
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// STORES
export const fetchStores = async () => {
  try {
    const res = await fetch(`${API_URL}/stores`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createStore = async (storeData) => {
  const isFormData = storeData instanceof FormData;
  const res = await fetch(`${API_URL}/stores`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? storeData : JSON.stringify(storeData),
  });
  return await res.json();
};

export const updateStore = async (id, storeData) => {
  const isFormData = storeData instanceof FormData;
  const res = await fetch(`${API_URL}/stores/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? storeData : JSON.stringify(storeData),
  });
  return await res.json();
};

export const deleteStore = async (id) => {
  const res = await fetch(`${API_URL}/stores/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

// CATEGORIES
export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    return data.data || [];
  } catch (e) { return []; }
};

export const createCategory = async (categoryData) => {
  const isFormData = categoryData instanceof FormData;
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? categoryData : JSON.stringify(categoryData),
  });
  return await res.json();
};

export const updateCategory = async (id, categoryData) => {
  const isFormData = categoryData instanceof FormData;
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(isFormData ? null : 'application/json'),
    body: isFormData ? categoryData : JSON.stringify(categoryData),
  });
  return await res.json();
};

export const createSubCategory = async (categoryId, subData) => {
  const res = await fetch(`${API_URL}/categories/${categoryId}/subcategories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subData),
  });
  return await res.json();
};

export const deleteCategory = async (id) => {
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
    const res = await fetch(`${API_URL}/settings`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || null;
  } catch (e) { return null; }
};

export const updateSettings = async (settingsData) => {
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
        const res = await fetch(`${API_URL}/products/home-sections`);
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

// BANNERS
export const fetchBanners = async () => {
  try {
    const res = await fetch(`${API_URL}/banners`);
    return await res.json();
  } catch (e) { return []; }
};

export const fetchAllBannersAdmin = async () => {
  try {
    const res = await fetch(`${API_URL}/banners/all`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return []; }
};

export const createBanner = async (bannerData) => {
  const res = await fetch(`${API_URL}/banners`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bannerData),
  });
  return await res.json();
};

export const updateBanner = async (id, bannerData) => {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bannerData),
  });
  return await res.json();
};

export const deleteBanner = async (id) => {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
};

