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
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "../services/api";

import { getCurrentUser } from "../utils/auth";
import {
  getGuestCart, addToGuestCart, updateGuestCartItem,
  removeFromGuestCart, clearGuestCart, getGuestCartCount,
  getGuestWishlist, toggleGuestWishlist,
} from "../utils/guestCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AgeVerificationModal from "../components/AgeVerificationModal";
import {
  flavourMeta,
  hasFlavour,
  getProductSizeLabel,
} from "../utils/flavourData";

const Home = () => {
  const navigate = useNavigate();

  const [ageStatus, setAgeStatus] = useState(() =>
    localStorage.getItem("liquidAlchemyAgeVerified") === "true" ? "verified" : "pending"
  );

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  function handleApproveAge() {
    localStorage.setItem("liquidAlchemyAgeVerified", "true");
    setAgeStatus("verified");
  }

  function handleRejectAge() {
    localStorage.removeItem("liquidAlchemyAgeVerified");
    setAgeStatus("rejected");
  }

  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  const [savedToWishlist, setSavedToWishlist] = useState(new Map());

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
      // resolve guest cart against loaded products
      const guestItems = getGuestCart();
      setCart(guestItems.map((gi) => {
        const p = products.find((p) => p.id === gi.product_id);
        if (!p) return null;
        return { cart_item_id: `guest-${p.id}`, product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: gi.quantity, subtotal: p.price * gi.quantity };
      }).filter(Boolean));
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
    if (userId) {
      fetchWishlist(userId)
        .then((data) => setSavedToWishlist(new Map(data.map((item) => [item.product_id, item.id]))))
        .catch(() => {});
    } else {
      const guestList = getGuestWishlist();
      setSavedToWishlist(new Map(guestList.map((id) => [id, `guest-${id}`])));
    }
  }, [userId]);

  useEffect(() => {
    if (products.length > 0) loadCart();
  }, [products, userId]);

  async function handleToggleWishlist(productId) {
    if (!userId) {
      const added = toggleGuestWishlist(productId);
      setSavedToWishlist((prev) => {
        const m = new Map(prev);
        if (added) m.set(productId, `guest-${productId}`);
        else m.delete(productId);
        return m;
      });
      return;
    }
    const wishlistItemId = savedToWishlist.get(productId);
    try {
      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
        setSavedToWishlist((prev) => { const m = new Map(prev); m.delete(productId); return m; });
      } else {
        const result = await addToWishlist(userId, productId);
        setSavedToWishlist((prev) => new Map(prev).set(productId, result.id));
      }
    } catch {
      setError("Failed to update wishlist.");
    }
  }

  async function handleAddToCart(productId) {
    setError("");
    if (!userId) {
      addToGuestCart(productId, 1);
      await loadCart();
      setIsCartOpen(true);
      return;
    }
    try {
      await addToCart(userId, productId, 1);
      await loadCart();
      setIsCartOpen(true);
    } catch (err) {
      setError("Failed to add item to cart.");
    }
  }

  async function handleIncrease(item) {
    setError("");
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity + 1);
      await loadCart();
      return;
    }
    try {
      await updateCartItem(userId, item.cart_item_id, item.quantity + 1);
      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleDecrease(item) {
    setError("");
    if (!userId) {
      updateGuestCartItem(item.product_id, item.quantity - 1);
      await loadCart();
      return;
    }
    try {
      if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id);
      else await updateCartItem(userId, item.cart_item_id, item.quantity - 1);
      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleRemove(cartItemId, productId) {
    setError("");
    if (!userId) {
      removeFromGuestCart(productId);
      await loadCart();
      return;
    }
    try {
      await deleteCartItem(userId, cartItemId);
      await loadCart();
    } catch (err) {
      setError("Failed to remove item.");
    }
  }

  async function handleClearCart() {
    setError("");
    if (!userId) {
      clearGuestCart();
      await loadCart();
      return;
    }
    try {
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
    if (product.category !== "Cocktails") return false;
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
      <Navbar cartCount={totalItems} onCartOpen={() => setIsCartOpen(true)} />

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

                      <p className="product-price" style={{ marginTop: "auto" }}>
                        ${product.price.toFixed(2)}
                      </p>

                      <button
                        className="ghost-button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => handleToggleWishlist(product.id)}
                        style={savedToWishlist.has(product.id)
                          ? { color: "#b07a47", borderColor: "transparent" }
                          : {}}
                      >
                        {savedToWishlist.has(product.id) ? "♡ Saved to wishlist" : "♡ Save to wishlist"}
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

      <Footer />

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

      {ageStatus !== "verified" && (
        <AgeVerificationModal
          onApprove={handleApproveAge}
          onReject={handleRejectAge}
          rejected={ageStatus === "rejected"}
        />
      )}
    </div>
  );
};

export default Home;