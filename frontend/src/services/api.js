const API_BASE_URL = "http://127.0.0.1:8000";

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

// ==================== Cart ====================

export async function fetchCart() {
  const response = await fetch(`${API_BASE_URL}/cart/`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
}

export async function addToCart(productId, quantity = 1) {
  const response = await fetch(
    `${API_BASE_URL}/cart/?product_id=${productId}&quantity=${quantity}`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to add to cart");
  return response.json();
}

export async function updateCartItem(cartItemId, quantity) {
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartItemId}?quantity=${quantity}`,
    { method: "PUT" }
  );
  if (!response.ok) throw new Error("Failed to update cart item");
  return response.json();
}

export async function deleteCartItem(cartItemId) {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete cart item");
  return response.json();
}

export async function clearCart() {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to clear cart");
  return response.json();
}

// ==================== Users ====================
// TODO: 成员A负责实现

export async function register(username, email, password) {
  // TODO
}

export async function login(email, password) {
  // TODO
}

export async function fetchUser(userId) {
  // TODO
}

// ==================== Wishlist ====================
// TODO: 成员C负责实现

export async function fetchWishlist(userId) {
  // TODO
}

export async function addToWishlist(userId, productId) {
  // TODO
}

export async function removeFromWishlist(wishlistItemId) {
  // TODO
}

// ==================== Orders ====================
// TODO: 成员B负责实现

export async function createOrder(userId, cartItems) {
  // TODO
}

export async function fetchOrder(orderId) {
  // TODO
}

export async function fetchUserOrders(userId) {
  // TODO
}