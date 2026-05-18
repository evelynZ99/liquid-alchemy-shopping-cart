import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import {
  fetchProductById,
  fetchProducts,
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  addToWishlist,
} from "../services/api";
import { getCurrentUser } from "../utils/auth";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  toggleGuestWishlist,
} from "../utils/guestCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { flavourMeta, hasFlavour } from "../utils/flavourData";

const ProductDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [product, setProduct]               = useState(null);
  const [cart, setCart]                     = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCart, setLoadingCart]       = useState(true);
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [qty, setQty]                       = useState(1);
  const [error, setError]                   = useState("");
  const [cartSuccess, setCartSuccess]       = useState("");
  const [wishlistMsg, setWishlistMsg]       = useState("");

  const currentUser = getCurrentUser();
  const userId      = currentUser?.id;

  async function loadProduct() {
    try {
      setLoadingProduct(true);
      setProduct(await fetchProductById(id));
    } catch {
      setError("Product not found.");
    } finally {
      setLoadingProduct(false);
    }
  }

  async function loadCart() {
    if (!userId) {
      const guestItems = getGuestCart();
      if (guestItems.length === 0) { setCart([]); setLoadingCart(false); return; }
      try {
        setLoadingCart(true);
        const allProducts = await fetchProducts();
        setCart(guestItems.map((gi) => {
          const p = allProducts.find((p) => p.id === gi.product_id);
          if (!p) return null;
          return { cart_item_id: `guest-${p.id}`, product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: gi.quantity, subtotal: p.price * gi.quantity };
        }).filter(Boolean));
      } catch {
        setCart([]);
      } finally {
        setLoadingCart(false);
      }
      return;
    }
    try {
      setLoadingCart(true);
      setCart(await fetchCart(userId));
    } catch {
      setError("Failed to load cart.");
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => { loadProduct(); loadCart(); }, [id]);

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.subtotal, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  async function handleAddToCart() {
    setError(""); setCartSuccess("");
    if (!userId) {
      addToGuestCart(product.id, qty);
      await loadCart();
      setCartSuccess(`${qty} × ${product.name} added to cart.`);
      setIsCartOpen(true);
      return;
    }
    try {
      await addToCart(userId, product.id, qty);
      await loadCart();
      setCartSuccess(`${qty} × ${product.name} added to cart.`);
      setIsCartOpen(true);
    } catch {
      setError("Failed to add item to cart.");
    }
  }

  async function handleAddToWishlist() {
    setWishlistMsg(""); setError("");
    if (!userId) {
      const added = toggleGuestWishlist(product.id);
      setWishlistMsg(added ? "Saved to wishlist." : "Removed from wishlist.");
      return;
    }
    try {
      await addToWishlist(userId, product.id);
      setWishlistMsg("Saved to wishlist.");
    } catch {
      setError("Could not add to wishlist.");
    }
  }

  async function handleIncrease(item) {
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity + 1);
      await loadCart();
      return;
    }
    try { await updateCartItem(userId, item.cart_item_id, item.quantity + 1); await loadCart(); }
    catch { setError("Failed to update quantity."); }
  }

  async function handleDecrease(item) {
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity - 1);
      await loadCart();
      return;
    }
    try {
      if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id);
      else await updateCartItem(userId, item.cart_item_id, item.quantity - 1);
      await loadCart();
    } catch { setError("Failed to update quantity."); }
  }

  async function handleRemove(cartItemId, productId) {
    if (!userId) {
      removeFromGuestCart(productId);
      await loadCart();
      return;
    }
    try { await deleteCartItem(userId, cartItemId); await loadCart(); }
    catch { setError("Failed to remove item."); }
  }

  async function handleClearCart() {
    if (!userId) {
      clearGuestCart();
      setCart([]);
      return;
    }
    try { await clearCart(userId); await loadCart(); }
    catch { setError("Failed to clear cart."); }
  }

  if (loadingProduct) {
    return (
      <div className="alchemy-page">
        <Navbar />
        <div className="detail-loading"><p className="status-text">Loading product…</p></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="alchemy-page">
        <Navbar />
        <div className="detail-loading">
          <p className="status-text">Product not found.</p>
          <Link to="/products" className="nav-link" style={{ marginTop: 16 }}>← Back to Collection</Link>
        </div>
      </div>
    );
  }

  const meta = flavourMeta[product.name] || { level: 50, sweet: 50, sour: 50, note: "Balanced profile" };

  const attributes = [
    product.alcohol_type  && { label: "Spirit",      value: product.alcohol_type },
    product.flavor_profile && { label: "Flavour",     value: product.flavor_profile },
    product.difficulty    && { label: "Difficulty",   value: product.difficulty },
    product.occasion      && { label: "Occasion",     value: product.occasion },
    { label: "Category", value: product.category },
    { label: "In stock",  value: product.stock > 0 ? `${product.stock} available` : "Out of stock" },
  ].filter(Boolean);

  return (
    <div className="alchemy-page">
      <Navbar cartCount={totalItems} onCartOpen={() => setIsCartOpen(true)} />

      {/* ── Breadcrumb ── */}
      <div className="detail-breadcrumb">
        <Link to="/products" className="breadcrumb-link">Collection</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* ── Main Detail Layout ── */}
      <div className="detail-layout">

        {/* Left — image */}
        <div className="detail-image-col">
          <div className="detail-image-wrap">
            <img src={product.image_url} alt={product.name} className="detail-image" />
          </div>
        </div>

        {/* Right — info */}
        <div className="detail-info-col">
          <p className="detail-category-tag">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">${product.price.toFixed(2)}</p>

          <div className="detail-divider" />

          <p className="detail-description">{product.description}</p>

          {/* Flavour scales (cocktails only) */}
          {hasFlavour(product.category) && (
            <div className="detail-flavour-section">
              <p className="filter-label">Flavour Profile</p>
              <div className="detail-flavour-scales">
                {[["Level", meta.level], ["Sweet", meta.sweet], ["Sour", meta.sour]].map(([label, val]) => (
                  <div key={label} className="detail-scale-row">
                    <span className="detail-scale-label">{label}</span>
                    <div className="scale-line detail-scale-line">
                      <i style={{ left: `${val}%` }} />
                    </div>
                    <span className="detail-scale-val">{val}</span>
                  </div>
                ))}
              </div>
              <p className="detail-flavour-note">{meta.note}</p>
            </div>
          )}

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="detail-attrs">
              {attributes.map(({ label, value }) => (
                <div className="detail-attr-item" key={label}>
                  <span className="detail-attr-label">{label}</span>
                  <span className="detail-attr-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="detail-divider" />

          {/* Quantity + Add to cart */}
          <div className="detail-actions">
            <div className="detail-qty-row">
              <span className="detail-qty-label">Quantity</span>
              <div className="detail-qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >−</button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={product.stock > 0 && qty >= product.stock}
                >+</button>
              </div>
            </div>

            {error && <div className="error-box" style={{ marginBottom: 14 }}>{error}</div>}
            {cartSuccess && <div className="success-box">{cartSuccess}</div>}

            <button
              className="checkout-button detail-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>

            {wishlistMsg ? (
              <p className="wishlist-confirm">{wishlistMsg}</p>
            ) : (
              <button className="secondary-button detail-wishlist-btn" onClick={handleAddToWishlist}>
                ♡ Save to wishlist
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Cart Drawer ── */}
      <div
        className={`drawer-overlay${isCartOpen ? " show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cart-drawer${isCartOpen ? " open" : ""}`}>
        <div className="cart-header">
          <h2>Added to Cart</h2>
          <button className="close-button" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-body">
          {loadingCart ? (
            <p className="status-text drawer-status">Loading cart…</p>
          ) : cart.length === 0 ? (
            <div className="empty-cart"><p>Your cart is empty</p></div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.cart_item_id}>
                    <div className="cart-item-image-wrap">
                      <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <p className="cart-item-subtotal">Subtotal: ${item.subtotal.toFixed(2)}</p>
                      <div className="quantity-row">
                        <span>Quantity</span>
                        <button onClick={() => handleDecrease(item)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleIncrease(item)}>+</button>
                      </div>
                      <button className="text-button" onClick={() => handleRemove(item.cart_item_id, item.product_id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>
                <button className="checkout-button" onClick={() => navigate("/cart")}>
                  Go to cart
                </button>
                <button className="secondary-button clear-cart-button" onClick={handleClearCart}>
                  Clear cart
                </button>
                <button className="secondary-button" onClick={() => setIsCartOpen(false)}>
                  Continue shopping
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ProductDetail;
