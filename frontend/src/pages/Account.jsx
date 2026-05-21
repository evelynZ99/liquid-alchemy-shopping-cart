import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUser, fetchUserOrders, updatePassword, updateUsername,
  fetchWishlist, removeFromWishlist,
  fetchCart, addToCart, updateCartItem, deleteCartItem, clearCart,
} from "../services/api";
import { getCurrentUser } from "../utils/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../App.css";

const STATUS_STYLES = {
  pending:    { background: "#fef3cd", color: "#856404" },
  processing: { background: "#cfe2ff", color: "#084298" },
  shipped:    { background: "#e8d5f5", color: "#6f42c1" },
  completed:  { background: "#d1e7dd", color: "#0a5a36" },
  cancelled:  { background: "#f8d7da", color: "#842029" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || { background: "#e9ecef", color: "#495057" };
  return (
    <strong style={{
      ...s, padding: "2px 10px", borderRadius: "20px",
      fontSize: "12px", letterSpacing: "0.5px",
      textTransform: "capitalize", fontWeight: 600,
    }}>
      {status || "Unknown"}
    </strong>
  );
}

const Account = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState("profile");
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [userDetail, setUserDetail]       = useState(null);
  const [orders, setOrders]               = useState([]);
  const [wishlist, setWishlist]           = useState([]);
  const [cart, setCart]                   = useState([]);
  const [loadingUser, setLoadingUser]     = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [loadingCart, setLoadingCart]     = useState(true);
  const [error, setError]                 = useState("");
  const [notice, setNotice]               = useState("");

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState("");
  const [settings, setSettings] = useState({ newsletter: true, orderUpdates: true });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const currentUser = getCurrentUser();
  const userId      = currentUser?.id;

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    let alive = true;

    async function load() {
      try {
        setError("");
        const [userData, orderData, wishlistData, cartData] = await Promise.all([
          fetchUser(userId),
          fetchUserOrders(userId),
          fetchWishlist(userId),
          fetchCart(userId),
        ]);
        if (!alive) return;
        setUserDetail(userData);
        setOrders(orderData);
        setWishlist(wishlistData);
        setCart(cartData);
      } catch {
        if (alive) setError("Failed to load account data.");
      } finally {
        if (alive) {
          setLoadingUser(false); setLoadingOrders(false);
          setLoadingWishlist(false); setLoadingCart(false);
        }
      }
    }
    load();
    return () => { alive = false; };
  }, [userId, navigate]);

  const displayName = userDetail?.username || currentUser?.username || "Alchemy Guest";
  const email       = userDetail?.email    || currentUser?.email    || "";
  const roleLabel   = (userDetail?.is_admin || currentUser?.role === "admin") ? "System Admin" : "Member";
  const joinedDate  = userDetail?.created_at
    ? new Date(userDetail.created_at).toLocaleDateString() : "Not available";

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.subtotal, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Cart handlers ──
  async function handleCartIncrease(item) {
    await updateCartItem(userId, item.cart_item_id, item.quantity + 1);
    setCart(await fetchCart(userId));
  }
  async function handleCartDecrease(item) {
    if (item.quantity <= 1) await deleteCartItem(userId, item.cart_item_id);
    else await updateCartItem(userId, item.cart_item_id, item.quantity - 1);
    setCart(await fetchCart(userId));
  }
  async function handleCartRemove(cartItemId) {
    await deleteCartItem(userId, cartItemId);
    setCart(await fetchCart(userId));
  }
  async function handleClearCart() {
    await clearCart(userId);
    setCart([]);
  }

  // ── Wishlist handlers ──
  async function handleWishlistRemove(wishlistItemId) {
    await removeFromWishlist(wishlistItemId);
    setWishlist((prev) => prev.filter((i) => i.id !== wishlistItemId));
  }
  async function handleWishlistAddToCart(item) {
    await addToCart(userId, item.product_id, 1);
    setCart(await fetchCart(userId));
    setActivePanel("cart");
  }

  // ── Settings ──
  function handleSettingToggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setNotice("");
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }
  async function handleUpdatePassword(e) {
    e.preventDefault();
    setNotice("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setNotice("Please complete all password fields."); return;
    }
    if (passwordForm.newPassword.length < 6) {
      setNotice("New password must be at least 6 characters."); return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice("New password and confirmation do not match."); return;
    }
    try {
      await updatePassword(userId, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Password updated successfully.");
    } catch {
      setNotice("Current password is incorrect or password update failed.");
    }
  }

  async function handleSaveName() {
    if (!nameInput.trim()) return;
    try {
      const updated = await updateUsername(userId, nameInput.trim());
      setUserDetail(updated);
      localStorage.setItem("liquidAlchemyCurrentUser", JSON.stringify({
        ...getCurrentUser(), username: updated.username,
      }));
      setEditingName(false);
      setNotice("Account name updated.");
    } catch {
      setNotice("Failed to update account name.");
    }
  }

  function handlePanelChange(id) { setActivePanel(id); setNotice(""); setIsNavOpen(false); }

  const menuItems = [
    { id: "profile",  label: "Profile",       description: "Personal details",      icon: "◎" },
    { id: "wishlist", label: "Wishlist",       description: `${wishlist.length} saved items`, icon: "♡" },
    { id: "cart",     label: "Cart",           description: `${cartCount} items`,    icon: "◻" },
    { id: "orders",   label: "Order History",  description: "Past purchases",        icon: "▤" },
    { id: "settings", label: "Settings",       description: "Security & preferences",icon: "⚙" },
  ];

  return (
    <div className="alchemy-page">
      <Navbar />
      <main className="account-page">
        <div className="account-shell">

          {/* ── Sidebar ── */}
          <aside className="account-sidebar">
            <div className="account-sidebar-title">
              <p>Account</p>
              <span>User Profile</span>
            </div>

            {/* Mobile collapsible toggle */}
            <button className="account-nav-toggle" onClick={() => setIsNavOpen(prev => !prev)}>
              <span>{menuItems.find(m => m.id === activePanel)?.label}</span>
              <span className="material-symbols-outlined">
                {isNavOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            <div className={`account-menu${isNavOpen ? " nav-open" : ""}`}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`account-menu-button ${activePanel === item.id ? "active" : ""}`}
                  onClick={() => handlePanelChange(item.id)}
                >
                  <span className="account-menu-icon">{item.icon}</span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="account-user-pill">
              <div className="account-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{displayName}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <section className="account-content">
            {error && <div className="account-notice error">{error}</div>}

            {/* Profile */}
            {activePanel === "profile" && (
              <section className="account-panel">
                <div className="account-panel-header">
                  <p>Personal Details</p>
                  <h1>Your Profile</h1>
                </div>
                {loadingUser ? <p className="status-text">Loading profile...</p> : (
                  <div className="account-profile-card">
                    <div className="account-profile-image">
                      <div className="account-profile-avatar">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="account-detail-grid">
                      <div className="account-detail-item">
                        <span>Account Name</span>
                        {editingName ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              value={nameInput}
                              onChange={e => setNameInput(e.target.value)}
                              style={{
                                fontFamily: 'Inter', fontSize: '15px', fontWeight: 600,
                                border: 'none', borderBottom: '1px solid #2f2c29',
                                background: 'transparent', outline: 'none', flex: 1,
                              }}
                              autoFocus
                            />
                            <button onClick={handleSaveName} style={{ fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: '#191919', color: '#fff', border: 'none', padding: '4px 10px', cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setEditingName(false)} style={{ fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'none', border: 'none', color: '#6e6a63', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <strong>{displayName}</strong>
                            <button onClick={() => { setNameInput(displayName); setEditingName(true); }} style={{ fontFamily: 'Inter', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'none', border: 'none', color: '#b07a47', cursor: 'pointer', borderBottom: '1px solid #b07a47', padding: 0, paddingBottom: '1px' }}>Edit</button>
                          </div>
                        )}
                      </div>
                      <div className="account-detail-item">
                        <span>Email Address</span><strong>{email}</strong>
                      </div>
                      <div className="account-detail-item">
                        <span>Date of Birth</span>
                        <strong>
                          {userDetail?.date_of_birth
                            ? new Date(userDetail.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Not provided'}
                        </strong>
                      </div>
                      <div className="account-detail-item">
                        <span>Member Since</span><strong>{joinedDate}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Wishlist */}
            {activePanel === "wishlist" && (
              <section className="account-panel">
                <div className="account-panel-header">
                  <p>Curated Collection</p>
                  <h1>Your Wishlist</h1>
                </div>
                {loadingWishlist ? <p className="status-text">Loading wishlist...</p>
                  : wishlist.length === 0 ? (
                    <div className="account-notice" style={{ borderTop: "1px solid #d8d2c6", paddingTop: "32px" }}>
                      No saved items yet.{" "}
                      <span
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => navigate("/products")}
                      >
                        Browse the collection →
                      </span>
                    </div>
                  ) : (
                    <div className="account-wishlist-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", borderTop: "1px solid #d8d2c6", paddingTop: "32px" }}>
                      {wishlist.map((item) => (
                        <div key={item.id}>
                          <div style={{ backgroundColor: "#efe8dc", padding: "12px", marginBottom: "12px" }}>
                            <div style={{ height: "200px", overflow: "hidden" }}>
                              {item.image_url
                                ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6e6a63", fontSize: "13px" }}>No Image</div>
                              }
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                            <h3 style={{ fontFamily: "Newsreader, serif", fontSize: "18px", fontWeight: 500, color: "#2f2c29", margin: 0 }}>
                              {item.name}
                            </h3>
                            <span style={{ fontFamily: "Inter", fontSize: "14px", color: "#2f2c29", flexShrink: 0, marginLeft: "8px" }}>
                              ${item.price?.toFixed(2)}
                            </span>
                          </div>
                          {item.category && (
                            <span style={{ fontFamily: "Inter", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#6e6a63", display: "block", marginBottom: "12px" }}>
                              {item.category}
                            </span>
                          )}
                          <button
                            className="ghost-button"
                            style={{ marginBottom: "8px" }}
                            onClick={() => handleWishlistAddToCart(item)}
                          >
                            Add to Cart
                          </button>
                          <button
                            style={{ background: "none", border: "none", color: "#9c3d2b", cursor: "pointer", fontFamily: "Inter", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "1px solid #9c3d2b", paddingBottom: "2px", padding: 0 }}
                            onClick={() => handleWishlistRemove(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </section>
            )}

            {/* Cart */}
            {activePanel === "cart" && (
              <section className="account-panel">
                <div className="account-panel-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div>
                    <p>Review Your Order</p>
                    <h1>Your Cart</h1>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      style={{ background: "none", border: "none", color: "#9c3d2b", cursor: "pointer", fontFamily: "Inter", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "1px solid #9c3d2b", paddingBottom: "2px", marginBottom: "6px" }}
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
                {loadingCart ? <p className="status-text">Loading cart...</p>
                  : cart.length === 0 ? (
                    <div className="account-notice">
                      Your cart is empty.{" "}
                      <span
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => navigate("/products")}
                      >
                        Browse the collection →
                      </span>
                    </div>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.cart_item_id} className="account-cart-item" style={{ display: "flex", gap: "24px", padding: "24px 0", borderTop: "1px solid #d8d2c6" }}>
                          <div className="account-cart-item-image" style={{ width: "120px", height: "160px", backgroundColor: "#efe8dc", flexShrink: 0 }}>
                            {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                          <div className="account-cart-item-info" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <h3 style={{ fontFamily: "Newsreader, serif", fontSize: "20px", fontWeight: 500, color: "#2f2c29", margin: 0 }}>{item.name}</h3>
                                <span style={{ fontFamily: "Inter", fontSize: "16px", color: "#2f2c29" }}>${item.price.toFixed(2)}</span>
                              </div>
                              <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#6e6a63", margin: 0 }}>
                                Subtotal: ${item.subtotal.toFixed(2)}
                              </p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d8d2c6", height: "36px" }}>
                                <button onClick={() => handleCartDecrease(item)} style={{ width: "36px", height: "100%", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>−</button>
                                <span style={{ width: "40px", textAlign: "center", fontFamily: "Inter", fontSize: "14px" }}>{item.quantity}</span>
                                <button onClick={() => handleCartIncrease(item)} style={{ width: "36px", height: "100%", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>+</button>
                              </div>
                              <button onClick={() => handleCartRemove(item.cart_item_id)} style={{ background: "none", border: "none", color: "#9c3d2b", cursor: "pointer", fontFamily: "Inter", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "1px solid #9c3d2b", paddingBottom: "2px" }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="account-cart-checkout-row" style={{ borderTop: "1px solid #d8d2c6", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: "Inter", fontSize: "13px", color: "#6e6a63" }}>Subtotal ({cartCount} items)</span>
                          <p style={{ fontFamily: "Newsreader, serif", fontSize: "28px", fontStyle: "italic", color: "#2f2c29", margin: "4px 0 0" }}>
                            ${cartTotal.toFixed(2)}
                          </p>
                        </div>
                        <button className="checkout-button" style={{ width: "auto", padding: "16px 40px" }} onClick={() => navigate("/checkout")}>
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  )}
              </section>
            )}

            {/* Order History */}
            {activePanel === "orders" && (
              <section className="account-panel">
                <div className="account-panel-header account-panel-header-row">
                  <div><p>Archive</p><h1>Past Orders</h1></div>
                </div>
                {loadingOrders ? <p className="status-text">Loading orders...</p>
                  : orders.length === 0 ? (
                    <div className="account-notice">
                      No orders yet.{" "}
                      <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/products")}>
                        Browse the collection →
                      </span>
                    </div>
                  ) : (
                    <div className="account-orders">
                      {orders.map((order) => (
                        <article className="account-order-card" key={order.id}>
                          <div className="account-order-summary">
                            <div><span>Order ID</span><strong>#{order.id}</strong></div>
                            <div>
                              <span>Placed On</span>
                              <strong>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}</strong>
                            </div>
                            <div><span>Recipient</span><strong>{displayName}</strong></div>
                            <div><span>Status</span><StatusBadge status={order.status} /></div>
                            <div><span>Total</span><strong>${Number(order.total_price).toFixed(2)}</strong></div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
              </section>
            )}

            {/* Settings */}
            {activePanel === "settings" && (
              <section className="account-panel">
                <div className="account-panel-header">
                  <p>Security & Settings</p>
                  <h1>Laboratory Settings</h1>
                </div>

                <form className="account-settings-section" onSubmit={handleUpdatePassword}>
                  <div className="account-section-copy">
                    <p>Access Control</p>
                    <h2>Update Password</h2>
                    <span>Confirm your current password before setting a new one.</span>
                  </div>
                  <div className="account-password-grid">
                    <label>Current Password<input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} /></label>
                    <label>New Password<input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} /></label>
                    <label>Confirm New Password<input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} /></label>
                    <button type="submit" className="account-dark-button">Update Credentials</button>
                  </div>
                </form>

                {notice && (
                  <div className={`account-notice ${notice.includes("successfully") || notice === "Preferences saved." ? "success" : "error"}`}>
                    {notice}
                  </div>
                )}

                <div className="account-settings-section">
                  <div className="account-section-copy">
                    <p>Correspondence</p>
                    <h2>Notifications</h2>
                    <span>Choose which updates you want to receive.</span>
                  </div>
                  <div className="account-check-list">
                    <button type="button" className={`account-check-row ${settings.newsletter ? "checked" : ""}`} onClick={() => handleSettingToggle("newsletter")}>
                      <span><strong>Formula Laboratory Releases</strong><small>Direct notification of new cocktail kit availability.</small></span>
                      <i />
                    </button>
                    <button type="button" className={`account-check-row ${settings.orderUpdates ? "checked" : ""}`} onClick={() => handleSettingToggle("orderUpdates")}>
                      <span><strong>Operational Updates</strong><small>Critical account and shipping status notifications.</small></span>
                      <i />
                    </button>
                    <button type="button" className="account-outline-button" onClick={() => setNotice("Preferences saved.")}>Save Preferences</button>
                  </div>
                </div>

                <div className="account-danger-zone">
                  <div>
                    <p>Destructive Action</p>
                    <h2>Account Deletion</h2>
                    <span>To delete your account, please contact support.</span>
                  </div>
                  <button type="button" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>
                    Deactivate Laboratory Profile
                  </button>
                </div>
              </section>
            )}
          </section>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Account;
