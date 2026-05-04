import { useEffect, useMemo, useState } from "react";
import "../App.css";
import {
  fetchProducts,
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../services/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    try {
      setLoadingCart(true);
      const data = await fetchCart();
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
  }, []);

  async function handleAddToCart(productId) {
    try {
      setError("");
      await addToCart(productId, 1);
      await loadCart();
      setIsCartOpen(true);
    } catch (err) {
      setError("Failed to add item to cart.");
    }
  }

  async function handleIncrease(item) {
    try {
      setError("");
      await updateCartItem(item.cart_item_id, item.quantity + 1);
      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleDecrease(item) {
    try {
      setError("");
      if (item.quantity <= 1) {
        await deleteCartItem(item.cart_item_id);
      } else {
        await updateCartItem(item.cart_item_id, item.quantity - 1);
      }
      await loadCart();
    } catch (err) {
      setError("Failed to update item quantity.");
    }
  }

  async function handleRemove(cartItemId) {
    try {
      setError("");
      await deleteCartItem(cartItemId);
      await loadCart();
    } catch (err) {
      setError("Failed to remove item.");
    }
  }

  async function handleClearCart() {
    try {
      setError("");
      await clearCart();
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

  const flavourMeta = {
    "Cucumber Salad Single": { level: 40, sweet: 20, sour: 65, note: "Savory & bright" },
    "Pineappu Beach Single": { level: 55, sweet: 75, sour: 60, note: "Sweet & sour" },
    "Shima Fizzy Kit": { level: 45, sweet: 35, sour: 55, note: "Sparkling & saline" },
    "Aesthetic Glassware Set": { level: 50, sweet: 50, sour: 50, note: "Serving ritual" },
    "Smoky Chile & Honey": { level: 72, sweet: 60, sour: 52, note: "Smoky, spicy, honeyed" },
    "Carrot Cake": { level: 58, sweet: 72, sour: 48, note: "Creamy, spiced, dessert-like" },
    "Tomato Cobbler": { level: 38, sweet: 50, sour: 68, note: "Savory, fresh, bright" },
    "Kicu In The Sidecar": { level: 55, sweet: 56, sour: 58, note: "Floral, citrus, rounded" },
    "Shiozakura Collins": { level: 50, sweet: 46, sour: 64, note: "Refreshing, saline, sparkling" },
  };

  const filteredProducts = products.filter((product) => {
    if (product.category === "Glassware") return true;
    const meta = flavourMeta[product.name] || { sour: 50, sweet: 50, level: 50 };
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
        <div className="brand">
          <span>LIQUID</span>
          <span>ALCHEMY</span>
        </div>

        <nav className="main-nav">
          <span>New Releases</span>
          <span>Cocktail Kits</span>
          <span>Garnishes</span>
          <span>Subscription</span>
          <span>Laboratory</span>
        </nav>

        <button className="cart-icon-button" onClick={() => setIsCartOpen(true)}>
          <span className="cart-icon">👜</span>
          <span className="cart-count">{totalItems}</span>
        </button>
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
                document.querySelector(".collection-section")?.scrollIntoView({
                  behavior: "smooth",
                })
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
                type="range" min="0" max="100" value={filters.sour}
                onChange={(e) => setFilters((prev) => ({ ...prev, sour: Number(e.target.value) }))}
              />
              <span>{filters.sour}</span>
            </div>

            <div className="matrix-control">
              <label>Sweet</label>
              <input
                type="range" min="0" max="100" value={filters.sweet}
                onChange={(e) => setFilters((prev) => ({ ...prev, sweet: Number(e.target.value) }))}
              />
              <span>{filters.sweet}</span>
            </div>

            <div className="matrix-control">
              <label>Level</label>
              <input
                type="range" min="0" max="100" value={filters.level}
                onChange={(e) => setFilters((prev) => ({ ...prev, level: Number(e.target.value) }))}
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
            <span>{filteredProducts.length} products</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loadingProducts ? (
            <p className="status-text">Loading products...</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const meta = flavourMeta[product.name] || {
                  level: 50, sweet: 50, sour: 50, note: "Balanced profile",
                };
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <img src={product.image_url} alt={product.name} className="product-image" />
                    </div>
                    <div className="product-card-body">
                      <h3>{product.name}</h3>
                      <p className="product-size">
                        {product.category === "Glassware" ? "Signature set" : "100ml flask"}
                      </p>
                      <p className="product-description">{product.description}</p>
                      <div className="flavour-scale">
                        <div>
                          <span>Level</span>
                          <div className="scale-line"><i style={{ left: `${meta.level}%` }} /></div>
                        </div>
                        <div>
                          <span>Sweet</span>
                          <div className="scale-line"><i style={{ left: `${meta.sweet}%` }} /></div>
                        </div>
                        <div>
                          <span>Sour</span>
                          <div className="scale-line"><i style={{ left: `${meta.sour}%` }} /></div>
                        </div>
                      </div>
                      <p className="product-note">{meta.note}</p>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      <button className="ghost-button" onClick={() => handleAddToCart(product.id)}>
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
            <h2>Not merely a drink, but a laboratory of scent, taste, and image.</h2>
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
          <button className="close-button" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-body">
          {loadingCart ? (
            <p className="status-text drawer-status">Loading cart...</p>
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
                      <button className="text-button" onClick={() => handleRemove(item.cart_item_id)}>
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
                      <button className="ghost-button small" onClick={() => handleAddToCart(product.id)}>
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
                <button className="checkout-button">Go to cart</button>
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
}

export default Home;