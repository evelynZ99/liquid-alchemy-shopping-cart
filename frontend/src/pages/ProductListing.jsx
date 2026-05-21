import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  toggleGuestWishlist,
  getGuestWishlist,
} from "../utils/guestCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  const [isFilterOpen, setIsFilterOpen]     = useState(false);
  const [search, setSearch]                 = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice]   = useState("all");
  const [selectedAlcohol, setSelectedAlcohol]     = useState([]);
  const [selectedFlavour, setSelectedFlavour]     = useState([]);
  const [selectedOccasion, setSelectedOccasion]   = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [savedToWishlist, setSavedToWishlist] = useState(new Map());

  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const currentUser       = getCurrentUser();
  const userId            = currentUser?.id;

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  async function loadCart(productsOverride) {
    if (!userId) {
      const guestItems = getGuestCart();
      const allProducts = productsOverride || products;
      setCart(guestItems.map((gi) => {
        const p = allProducts.find((p) => p.id === gi.product_id);
        if (!p) return null;
        return { cart_item_id: `guest-${p.id}`, product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: gi.quantity, subtotal: p.price * gi.quantity };
      }).filter(Boolean));
      setLoadingCart(false);
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

  useEffect(() => {
    async function init() {
      try {
        setLoadingProducts(true);
        const prods = await fetchProducts();
        setProducts(prods);
        if (!userId) {
          const guestWishlist = getGuestWishlist();
          setSavedToWishlist(new Map(guestWishlist.map((id) => [id, `guest-${id}`])));
          const guestItems = getGuestCart();
          setCart(guestItems.map((gi) => {
            const p = prods.find((p) => p.id === gi.product_id);
            if (!p) return null;
            return { cart_item_id: `guest-${p.id}`, product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: gi.quantity, subtotal: p.price * gi.quantity };
          }).filter(Boolean));
          setLoadingCart(false);
        } else {
          fetchCart(userId).then(setCart).catch(() => {}).finally(() => setLoadingCart(false));
          fetchWishlist(userId)
            .then((data) => setSavedToWishlist(new Map(data.map((item) => [item.product_id, item.id]))))
            .catch(() => {});
        }
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    }
    init();
  }, [userId]);

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
    } catch {
      setError("Failed to add item to cart.");
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

  return (
    <div className="alchemy-page">
      <Navbar cartCount={totalItems} onCartOpen={() => setIsCartOpen(true)} />

      <div className="listing-layout">
        {/* ── Filter Sidebar ── */}
        <aside className={`filter-sidebar${isFilterOpen ? " filter-sidebar-open" : ""}`}>
          <div className="filter-drawer-header">
            <span className="filter-drawer-title">Filter by</span>
            <button className="filter-drawer-close" onClick={() => setIsFilterOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
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

        {isFilterOpen && (
          <div className="filter-overlay" onClick={() => setIsFilterOpen(false)} />
        )}

        {/* ── Product Grid ── */}
        <section className="listing-content">
          <input
            className="search-input search-input-mobile"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-mobile-bar">
            <button className="filter-mobile-btn" onClick={() => setIsFilterOpen(true)}>
              <span className="material-symbols-outlined">tune</span>
              Filter
            </button>
            <span className="listing-count mobile-count">{filteredProducts.length} products</span>
          </div>

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
                      <p className="product-price" style={{ marginTop: "auto" }}>${product.price.toFixed(2)}</p>
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
