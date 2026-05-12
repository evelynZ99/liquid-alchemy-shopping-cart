const API_BASE_URL = "http://127.0.0.1:8000";
const JSON_HEADERS = { "Content-Type": "application/json" };

function adminHeaders(adminUserId) {
  if (!adminUserId) return {};
  return { "X-Admin-User-Id": adminUserId };
}

// ==================== Products ====================

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products/`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function fetchProductById(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export async function createProduct(adminUserId, productData) {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: "POST",
    headers: { ...JSON_HEADERS, ...adminHeaders(adminUserId) },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error("Failed to create product");
  return response.json();
}

export async function updateProduct(adminUserId, productId, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: { ...JSON_HEADERS, ...adminHeaders(adminUserId) },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
}

export async function deleteProduct(adminUserId, productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to delete product");
  return response.json();
}

// ==================== Cart ====================

export async function fetchCart(userId) {
  if (!userId) return [];
  const response = await fetch(`${API_BASE_URL}/cart/?user_id=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
}

export async function addToCart(userId, productId, quantity = 1) {
  if (!userId) throw new Error("Login required");
  const response = await fetch(
    `${API_BASE_URL}/cart/?user_id=${userId}&product_id=${productId}&quantity=${quantity}`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to add to cart");
  return response.json();
}

export async function updateCartItem(userId, cartItemId, quantity) {
  if (!userId) throw new Error("Login required");
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartItemId}?user_id=${userId}&quantity=${quantity}`,
    { method: "PUT" }
  );
  if (!response.ok) throw new Error("Failed to update cart item");
  return response.json();
}

export async function deleteCartItem(userId, cartItemId) {
  if (!userId) throw new Error("Login required");
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartItemId}?user_id=${userId}`,
    { method: "DELETE" }
  );
  if (!response.ok) throw new Error("Failed to delete cart item");
  return response.json();
}

export async function clearCart(userId) {
  if (!userId) throw new Error("Login required");
  const response = await fetch(`${API_BASE_URL}/cart/?user_id=${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to clear cart");
  return response.json();
}

export async function fetchAllCarts(adminUserId) {
  const response = await fetch(`${API_BASE_URL}/cart/all`, {
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to fetch carts");
  return response.json();
}

// ==================== Users ====================

export async function register(username, email, password, options = {}) {
  const payload = {
    username,
    email,
    password,
    is_admin: Boolean(options.isAdmin),
    admin_key: options.adminKey || null,
  };
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to register");
  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Failed to login");
  return response.json();
}

export async function fetchUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function fetchUsers(adminUserId) {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function deleteUser(adminUserId, userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
}

export async function updateUserRole(adminUserId, userId, isAdmin) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: "PATCH",
    headers: { ...JSON_HEADERS, ...adminHeaders(adminUserId) },
    body: JSON.stringify({ is_admin: isAdmin }),
  });
  if (!response.ok) throw new Error("Failed to update user role");
  return response.json();
}

// ==================== Wishlist ====================

export async function fetchWishlist(userId) {
  if (!userId) return [];
  const response = await fetch(`${API_BASE_URL}/wishlist/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch wishlist");
  return response.json();
}

export async function addToWishlist(userId, productId) {
  if (!userId) throw new Error("Login required");
  const response = await fetch(
    `${API_BASE_URL}/wishlist/?user_id=${userId}&product_id=${productId}`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to add to wishlist");
  return response.json();
}

export async function removeFromWishlist(wishlistItemId) {
  const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistItemId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove from wishlist");
  return response.json();
}

// ==================== Orders ====================
// ⚠️ CONFLICT: createOrder signature differs — jasmine has shippingInfo, selia doesn't
// Currently keeping jasmine's version — confirm with backend before finalising

export async function createOrder(userId, cartItems, shippingInfo) {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      user_id: userId,
      shipping_name: shippingInfo.name,
      shipping_address: shippingInfo.address,
      shipping_method: shippingInfo.method,
      subtotal: shippingInfo.subtotal,
      shipping_cost: shippingInfo.shippingCost,
      tax: shippingInfo.tax,
      total: shippingInfo.total,
      items: cartItems,
    }),
  });
  if (!response.ok) throw new Error("Failed to create order");
  return response.json();
}

export async function fetchOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!response.ok) throw new Error("Failed to fetch order");
  return response.json();
}

export async function fetchUserOrders(userId) {
  const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user orders");
  return response.json();
}

export async function fetchAllOrders(adminUserId) {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

// ==================== Admin ====================

export async function fetchAdminOverview(adminUserId) {
  const response = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: adminHeaders(adminUserId),
  });
  if (!response.ok) throw new Error("Failed to fetch admin overview");
  return response.json();
}