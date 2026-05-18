const CART_KEY = "liquidAlchemyGuestCart";
const WISHLIST_KEY = "liquidAlchemyGuestWishlist";

// ── Guest Cart ──────────────────────────────────────────

export function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

export function addToGuestCart(productId, quantity = 1) {
  const cart = getGuestCart();
  const existing = cart.find((i) => i.product_id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ product_id: productId, quantity });
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateGuestCartItem(productId, quantity) {
  const cart = getGuestCart()
    .map((i) => i.product_id === productId ? { ...i, quantity } : i)
    .filter((i) => i.quantity > 0);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromGuestCart(productId) {
  const cart = getGuestCart().filter((i) => i.product_id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
  localStorage.removeItem(CART_KEY);
}

export function getGuestCartCount() {
  return getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
}

// ── Guest Wishlist ──────────────────────────────────────

export function getGuestWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); }
  catch { return []; }
}

export function toggleGuestWishlist(productId) {
  const list = getGuestWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return idx < 0;
}

export function clearGuestWishlist() {
  localStorage.removeItem(WISHLIST_KEY);
}
