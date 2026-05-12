import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import DevLoginButton from "../components/DevLoginButton";
import { flavourMeta, hasFlavour, getProductSizeLabel } from "../utils/flavourData";

const PRICE_RANGES = [
  { label: "All prices",  value: "all" },
  { label: "Under $37",   value: "under37" },
  { label: "$37 – $39",   value: "37to39" },
  { label: "$39+",        value: "over39" },
];

const ProductListing = () => {
  const [products, setProducts]             = useState([]);
  const [cart, setCart]                     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart]       = useState(true);
  const [error, setError]                   = useState("");
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [search, setSearch]                 = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice]   = useState("all");
  const [selectedAlcohol, setSelectedAlcohol]     = useState([]);
  const [selectedFlavour, setSelectedFlavour]     = useState([]);
  const [selectedOccasion, setSelectedOccasion]   = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);

  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const currentUser       = getCurrentUser();
  const userId            = currentUser?.id;

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setProducts(await fetchProducts());
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCart() {
    if (!userId) { setCart([]); setLoadingCart(false); return; }
    try {
      setLoadingCart(true);
      setCart(await fetchCart(userId));
    } catch {
      setError("Failed to load cart.");
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => { loadProducts(); loadCart(); }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const alcoholOptions = useMemo(() => {
    const vals = new Set();
    products
      .filter((p) => p.category === "Cocktails" || p.category === "Kits")
      .forEach((p) => {
        if (p.alcohol_type)
          p.alcohol_type.split(",").map((v) => v.trim()).forEach((v) => vals.add(v));
      });
    return [...vals].sort();
  }, [products]);

  const flavourOptions = useMemo(() => {
    const vals = new Set();
    products.filter((p) => p.category === "Cocktails").forEach((p) => {
      if (p.flavor_profile) vals.add(p.flavor_profile);
    });
    return [...vals].sort();
  }, [products]);

  const occasionOptions = useMemo(() => {
    const vals = new Set();
    products
      .filter((p) => p.category === "Cocktails" || p.category === "Kits")
      .forEach((p) => { if (p.occasion) vals.add(p.occasion); });
    return [...vals].sort();
  }, [products]);

  const difficultyOptions = useMemo(() => {
    const vals = new Set();
    products.filter((p) => p.category === "Kits").forEach((p) => {
      if (p.difficulty) vals.add(p.difficulty);
    });
    return [...vals].sort();
  }, [products]);

  useEffect(() => {
    if (!selectedCategories.includes("Cocktails")) setSelectedFlavour([]);
    if (!selectedCategories.includes("Kits")) setSelectedDifficulty([]);
    if (!selectedCategories.includes("Cocktails") && !selectedCategories.includes("Kits")) {
      setSelectedAlcohol([]);
      setSelectedOccasion([]);
    }
  }, [selectedCategories]);

  function toggleCategory(cat) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchCat =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      let matchPrice = true;
      if (selectedPrice === "under37")  matchPrice = p.price < 37;
      if (selectedPrice === "37to39")   matchPrice = p.price >= 37 && p.price <= 39;
      if (selectedPrice === "over39")   matchPrice = p.price > 39;

      let matchAlcohol = true;
      let matchFlavour = true;
      let matchOccasion = true;
      let matchDifficulty = true;
      if (p.category === "Cocktails" || p.category === "Kits") {
        if (selectedAlcohol.length > 0) {
          const productAlcohols = p.alcohol_type
            ? p.alcohol_type.split(",").map((v) => v.trim())
            : [];
          matchAlcohol = selectedAlcohol.some((a) => productAlcohols.includes(a));
        }
        if (selectedFlavour.length > 0) {
          matchFlavour = selectedFlavour.includes(p.flavor_profile);
        }
        if (selectedOccasion.length > 0) {
          matchOccasion = selectedOccasion.includes(p.occasion);
        }
        if (selectedDifficulty.length > 0) {
          matchDifficulty = selectedDifficulty.includes(p.difficulty);
        }
      }

      return matchSearch && matchCat && matchPrice && matchAlcohol && matchFlavour && matchOccasion && matchDifficulty;
    });
  }, [products, search, selectedCategories, selectedPrice, selectedAlcohol, selectedFlavour, selectedOccasion, selectedDifficulty]);

  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.subtotal, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const upsellProducts = products.filter((p) => !cart.some((c) => c.product_id === p.id));

  async function handleAddToCart(productId) {
    setError("");
    if (!userId) { setError("Please log in to add items to cart."); return; }
    try {
      await addToCart(userId, productId, 1);
      await loadCart();
      setIsCartOpen(true);
    } catch {
      setError("Failed to add item to cart.");
    }
  }

  async function handleIncrease(item) {
    if (!userId) return;
    try { await updateCartItem(userId, item.cart_item_id, item.quantity + 1); await loadCart(); }
    catch { setError("Failed to update quantity."); }
  }

  async function handleDecrease(item) {
    if (!userId) return;
    try {
      if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id);
      else await updateCartItem(userId, item.cart_item_id, item.quantity - 1);
      await loadCart();
    } catch { setError("Failed to update quantity."); }
  }

  async function handleRemove(cartItemId) {
    if (!userId) return;
    try { await deleteCartItem(userId, cartItemId); await loadCart(); }
    catch { setError("Failed to remove item."); }
  }

  async function handleClearCart() {
    if (!userId) return;
    try { await clearCart(userId); await loadCart(); }
    catch { setError("Failed to clear cart."); }
  }

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
          <Link to="/products?category=Cocktails" className="nav-link">Cocktails</Link>
          <Link to="/products?category=Kits" className="nav-link">Kits</Link>
          <Link to="/products?category=Glassware" className="nav-link">Glassware</Link>
          <Link to="/products?category=Bar Tools" className="nav-link">Bar Tools</Link>
          <Link to="/laboratory" className="nav-link">Laboratory</Link>
        </nav>

        <div className="header-actions">
          <Link to="/wishlist" className="nav-link">Wishlist</Link>
          {currentUser ? (
            <Link to="/account" className="nav-link">{currentUser.username}</Link>
          ) : (
            <Link to="/login" className="nav-link">Login / Sign up</Link>
          )}
          <DevLoginButton />
          <button className="cart-icon-button" onClick={() => setIsCartOpen(true)}>
            <span className="cart-icon">👜</span>
            <span className="cart-count">{totalItems}</span>
          </button>
        </div>
      </header>

      <div className="listing-layout">
        {/* ── Filter Sidebar ── */}
        <aside className="filter-sidebar">
          <div className="filter-group">
            <input
              className="search-input"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="filter-label-row">
              <p className="filter-label">Category</p>
              {selectedCategories.length > 0 && (
                <button className="filter-clear-btn" onClick={() => setSelectedCategories([])}>
                  Clear
                </button>
              )}
            </div>
            {categories.map((cat) => (
              <label key={cat} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <p className="filter-label">Price Range</p>
            {PRICE_RANGES.map((r) => (
              <button
                key={r.value}
                className={`filter-option${selectedPrice === r.value ? " active" : ""}`}
                onClick={() => setSelectedPrice(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          {(selectedCategories.includes("Cocktails") || selectedCategories.includes("Kits")) && alcoholOptions.length > 0 && (
            <div className="filter-group">
              <div className="filter-label-row">
                <p className="filter-label">Spirit</p>
                {selectedAlcohol.length > 0 && (
                  <button className="filter-clear-btn" onClick={() => setSelectedAlcohol([])}>Clear</button>
                )}
              </div>
              {alcoholOptions.map((opt) => (
                <label key={opt} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedAlcohol.includes(opt)}
                    onChange={() =>
                      setSelectedAlcohol((prev) =>
                        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                      )
                    }
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {selectedCategories.includes("Cocktails") && flavourOptions.length > 0 && (
            <div className="filter-group">
              <div className="filter-label-row">
                <p className="filter-label">Flavour Profile</p>
                {selectedFlavour.length > 0 && (
                  <button className="filter-clear-btn" onClick={() => setSelectedFlavour([])}>Clear</button>
                )}
              </div>
              {flavourOptions.map((opt) => (
                <label key={opt} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedFlavour.includes(opt)}
                    onChange={() =>
                      setSelectedFlavour((prev) =>
                        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                      )
                    }
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {(selectedCategories.includes("Cocktails") || selectedCategories.includes("Kits")) && occasionOptions.length > 0 && (
            <div className="filter-group">
              <div className="filter-label-row">
                <p className="filter-label">Occasion</p>
                {selectedOccasion.length > 0 && (
                  <button className="filter-clear-btn" onClick={() => setSelectedOccasion([])}>Clear</button>
                )}
              </div>
              {occasionOptions.map((opt) => (
                <label key={opt} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedOccasion.includes(opt)}
                    onChange={() =>
                      setSelectedOccasion((prev) =>
                        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                      )
                    }
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {selectedCategories.includes("Kits") && difficultyOptions.length > 0 && (
            <div className="filter-group">
              <div className="filter-label-row">
                <p className="filter-label">Difficulty</p>
                {selectedDifficulty.length > 0 && (
                  <button className="filter-clear-btn" onClick={() => setSelectedDifficulty([])}>Clear</button>
                )}
              </div>
              {difficultyOptions.map((opt) => (
                <label key={opt} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedDifficulty.includes(opt)}
                    onChange={() =>
                      setSelectedDifficulty((prev) =>
                        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                      )
                    }
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* ── Product Grid ── */}
        <section className="listing-content">
          <div className="listing-head">
            <div>
              <h2 className="listing-title">Collection</h2>
              <p className="listing-subtitle">Experimental blends, glassware, and ritual objects.</p>
            </div>
            <span className="listing-count">{filteredProducts.length} products</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loadingProducts ? (
            <p className="status-text">Loading products…</p>
          ) : filteredProducts.length === 0 ? (
            <p className="status-text">No products match your filters.</p>
          ) : (
            <div className="product-grid listing-grid">
              {filteredProducts.map((product) => {
                const meta = flavourMeta[product.name] || {
                  level: 50, sweet: 50, sour: 50, note: "Balanced profile",
                };
                return (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-image-wrap product-image-wrap--link"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <img src={product.image_url} alt={product.name} className="product-image" />
                    </div>

                    <div className="product-card-body">
                      <h3
                        className="product-name-link"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="product-size">{getProductSizeLabel(product.category)}</p>
                      <p className="product-description">{product.description}</p>

                      {hasFlavour(product.category) && (
                        <>
                          <div className="flavour-scale">
                            {[["Level", meta.level], ["Sweet", meta.sweet], ["Sour", meta.sour]].map(([label, val]) => (
                              <div key={label}>
                                <span>{label}</span>
                                <div className="scale-line"><i style={{ left: `${val}%` }} /></div>
                              </div>
                            ))}
                          </div>
                          <p className="product-note">{meta.note}</p>
                        </>
                      )}
                      <p className="product-price">${product.price.toFixed(2)}</p>
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
      </div>

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
                  {upsellProducts.slice(0, 2).map((p) => (
                    <div className="upsell-card" key={p.id}>
                      <img src={p.image_url} alt={p.name} />
                      <p>{p.name}</p>
                      <span>${p.price.toFixed(2)}</span>
                      <button className="ghost-button small" onClick={() => handleAddToCart(p.id)}>
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

export default ProductListing;
