import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

import {
  fetchProducts,
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../services/api";

import { getCurrentUser } from "../utils/auth";
import {
  flavourMeta,
  hasFlavour,
  getProductSizeLabel,
} from "../utils/flavourData";

const Home = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  function handleAccountEntry() {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.is_admin || currentUser.role === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/account");
  }
  
  function handleHomeSignOut() {
  localStorage.removeItem("liquidAlchemyCurrentUser");
  navigate("/login", { replace: true });
}

  const [filters, setFilters] = useState({
    sour: 50,
    sweet: 50,
    level: 50,
  });

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCart() {
    if (!userId) {
      setCart([]);
      setLoadingCart(false);
      return;
    }

    try {
      setLoadingCart(true);
      const data = await fetchCart(userId);
      setCart(data);
    } catch (err) {
      setError("Failed to load cart.");
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCart();
  }, [userId]);

  async function handleAddToCart(productId) {
    try {
      setError("");

      if (!userId) {
        setError("Please sign in to add items to your cart.");
        return;
      }

      await addToCart(userId, productId, 1);
      await loadCart();
      setIsCartOpen(true);
    } catch (err) {
      setError("Failed to add item to cart.");
    }
  }

  async function handleIncrease(item) {
    try {
      setError("");

      if (!userId) {
        setError("Please sign in to update your cart.");
        return;
      }

      await updateCartItem(userId, item.cart_item_id, item.quantity + 1);
      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleDecrease(item) {
    try {
      setError("");

      if (!userId) {
        setError("Please sign in to update your cart.");
        return;
      }

      if (item.quantity <= 1) {
        await deleteCartItem(userId, item.cart_item_id);
      } else {
        await updateCartItem(userId, item.cart_item_id, item.quantity - 1);
      }

      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleRemove(cartItemId) {
    try {
      setError("");

      if (!userId) {
        setError("Please sign in to update your cart.");
        return;
      }

      await deleteCartItem(userId, cartItemId);
      await loadCart();
    } catch (err) {
      setError("Failed to remove item.");
    }
  }

  async function handleClearCart() {
    try {
      setError("");

      if (!userId) {
        setError("Please sign in to update your cart.");
        return;
      }

      await clearCart(userId);
      await loadCart();
    } catch (err) {
      setError("Failed to clear cart.");
    }
  }

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = products.filter((product) => {
    if (!hasFlavour(product.category)) return true;

    const meta = flavourMeta[product.name] || {
      sour: 50,
      sweet: 50,
      level: 50,
    };

    return (
      Math.abs(meta.sour - filters.sour) <= 45 &&
      Math.abs(meta.sweet - filters.sweet) <= 45 &&
      Math.abs(meta.level - filters.level) <= 45
    );
  });

  const upsellProducts = products.filter(
    (product) => !cart.some((item) => item.product_id === product.id)
  );

  return (
    <div className="alchemy-page">
      <div className="top-bar">
        Receive a personalized ice mold with orders over $150 at checkout.
      </div>

      <header className="site-header">
        <Link to="/" className="brand listing-brand">
          <span>LIQUID</span>
          <span>ALCHEMY</span>
        </Link>

        <nav className="main-nav">
          <Link to="/products?category=Cocktails" className="nav-link">
            Cocktails
          </Link>
          <Link to="/products?category=Kits" className="nav-link">
            Kits
          </Link>
          <Link to="/products?category=Glassware" className="nav-link">
            Glassware
          </Link>
          <Link to="/products?category=Bar Tools" className="nav-link">
            Bar Tools
          </Link>
          <Link to="/laboratory" className="nav-link">
            Laboratory
          </Link>
          <Link to="/wishlist" className="nav-link">
            Wishlist
          </Link>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="account-icon-link"
            aria-label="Open account page"
            onClick={handleAccountEntry}
          >
            <span className="account-icon">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <path
                  d="M12 12c2.35 0 4.25-1.9 4.25-4.25S14.35 3.5 12 3.5 7.75 5.4 7.75 7.75 9.65 12 12 12Z"
                  fill="currentColor"
                />
                <path
                  d="M4.75 20.25c.65-3.45 3.52-5.75 7.25-5.75s6.6 2.3 7.25 5.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {currentUser ? (
  <div className="home-user-area">
    <span className="home-user-label">
      User: {currentUser.username || currentUser.email}
    </span>

    <button
      type="button"
      className="home-logout-button"
      onClick={handleHomeSignOut}
    >
      Log out
    </button>
  </div>
) : (
  <button
    type="button"
    className="home-logout-button"
    onClick={() => navigate("/login")}
  >
    Sign in
  </button>
)}

          <button
            className="cart-icon-button"
            onClick={() => setIsCartOpen(true)}
          >
            <span className="cart-icon">👜</span>
            <span className="cart-count">{totalItems}</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Signature 2026</p>
            <h1>Precision-blended liquid artistry.</h1>
            <p>
              A laboratory of flavour, texture, and atmosphere. Each formulation
              balances acidity, sweetness, and spirit with sculptural clarity.
            </p>

            <button
              className="hero-cta"
              onClick={() =>
                document
                  .querySelector(".collection-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore seasonal flavours <span>→</span>
            </button>
          </div>

          <div className="hero-visual">
            <img src="/images/landing.png" alt="Pineappu Beach Single" />
          </div>
        </section>

        <section className="matrix-section">
          <div className="section-head">
            <h2>The Flavor Matrix</h2>
            <p>Adjust the coordinates to discover your next formulation.</p>
          </div>

          <div className="matrix-grid">
            <div className="matrix-control">
              <label>Sour</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.sour}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sour: Number(e.target.value),
                  }))
                }
              />
              <span>{filters.sour}</span>
            </div>

            <div className="matrix-control">
              <label>Sweet</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.sweet}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sweet: Number(e.target.value),
                  }))
                }
              />
              <span>{filters.sweet}</span>
            </div>

            <div className="matrix-control">
              <label>Level</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.level}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    level: Number(e.target.value),
                  }))
                }
              />
              <span>{filters.level}</span>
            </div>
          </div>
        </section>

        <section className="collection-section">
          <div className="section-head collection-head">
            <div>
              <h2>Collection</h2>
              <p>Experimental blends, glassware, and ritual objects.</p>
            </div>

            <Link to="/products" className="view-all-link">
              View all products →
            </Link>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loadingProducts ? (
            <p className="status-text">Loading products...</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const meta = flavourMeta[product.name] || {
                  level: 50,
                  sweet: 50,
                  sour: 50,
                  note: "Balanced profile",
                };

                return (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-image-wrap product-image-wrap--link"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>

                    <div className="product-card-body">
                      <h3
                        className="product-name-link"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      <p className="product-size">
                        {getProductSizeLabel(product.category)}
                      </p>

                      <p className="product-description">
                        {product.description}
                      </p>

                      {hasFlavour(product.category) && (
                        <>
                          <div className="flavour-scale">
                            <div>
                              <span>Level</span>
                              <div className="scale-line">
                                <i style={{ left: `${meta.level}%` }} />
                              </div>
                            </div>

                            <div>
                              <span>Sweet</span>
                              <div className="scale-line">
                                <i style={{ left: `${meta.sweet}%` }} />
                              </div>
                            </div>

                            <div>
                              <span>Sour</span>
                              <div className="scale-line">
                                <i style={{ left: `${meta.sour}%` }} />
                              </div>
                            </div>
                          </div>

                          <p className="product-note">{meta.note}</p>
                        </>
                      )}

                      <p className="product-price">
                        ${product.price.toFixed(2)}
                      </p>

                      <button
                        className="ghost-button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="story-section">
          <div className="story-copy">
            <p className="eyebrow">Sensory storytelling</p>
            <h2>
              Not merely a drink, but a laboratory of scent, taste, and image.
            </h2>
            <p>
              Crystal ice, saline brightness, citrus vapor, and herbal oils.
              Each composition is designed as a quiet experiment in balance.
            </p>
          </div>

          <div className="story-images">
            <img src="/images/ingredient1.png" alt="Ingredient story" />
            <img src="/images/ingredient2.png" alt="Ingredient story" />
          </div>
        </section>
      </main>

      <div
        className={`drawer-overlay ${isCartOpen ? "show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Added to Cart</h2>
          <button
            className="close-button"
            onClick={() => setIsCartOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="cart-body">
          {loadingCart ? (
            <p className="status-text drawer-status">Loading cart...</p>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <p>
                {userId
                  ? "Your cart is empty"
                  : "Sign in to save products to your cart."}
              </p>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.cart_item_id}>
                    <div className="cart-item-image-wrap">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </div>

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p className="cart-item-price">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="cart-item-subtotal">
                        Subtotal: ${item.subtotal.toFixed(2)}
                      </p>

                      <div className="quantity-row">
                        <span>Quantity</span>
                        <button onClick={() => handleDecrease(item)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleIncrease(item)}>+</button>
                      </div>

                      <button
                        className="text-button"
                        onClick={() => handleRemove(item.cart_item_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="upsell-section">
                <h3>Others also considered</h3>

                <div className="upsell-grid">
                  {upsellProducts.slice(0, 2).map((product) => (
                    <div className="upsell-card" key={product.id}>
                      <img src={product.image_url} alt={product.name} />
                      <p>{product.name}</p>
                      <span>${product.price.toFixed(2)}</span>

                      <button
                        className="ghost-button small"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>

                <button
                  className="checkout-button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/cart");
                  }}
                >
                  Go to cart
                </button>

                <button
                  className="secondary-button clear-cart-button"
                  onClick={handleClearCart}
                >
                  Clear cart
                </button>

                <button
                  className="secondary-button"
                  onClick={() => setIsCartOpen(false)}
                >
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

export default Home;