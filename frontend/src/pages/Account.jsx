import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUser, fetchUserOrders } from "../services/api";

const Account = () => {
  const navigate = useNavigate();

  // 当前打开的面板
  const [activePanel, setActivePanel] = useState("profile");

  // 是否显示登出弹窗
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [settings, setSettings] = useState({
    twoFactor: true,
    newsletter: true,
    orderUpdates: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [accountError, setAccountError] = useState("");

  // 从 localStorage 读取当前登录用户
  const currentUser = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("liquidAlchemyCurrentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      if (!currentUser?.id) return;

      try {
        const freshProfile = await fetchUser(currentUser.id);
        if (isMounted) setProfile(freshProfile);
      } catch {
        if (isMounted) setProfile(currentUser);
      }

      try {
        setLoadingOrders(true);
        const orderData = await fetchUserOrders(currentUser.id);
        if (isMounted) setOrders(orderData);
      } catch {
        if (isMounted) setAccountError("Failed to load order history.");
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const displayUser = profile || currentUser;
  const displayName = displayUser?.username || "Alchemy Guest";
  const email = displayUser?.email || "guest@alchemy.com";
  const userRole = displayUser?.is_admin ? "System Admin" : "Member";
  const createdAt = displayUser?.created_at
    ? new Date(displayUser.created_at).toLocaleDateString()
    : "Not available";

  const menuItems = [
    { id: "profile", label: "Profile", description: "Personal details", icon: "◎" },
    { id: "orders", label: "Order History", description: "Past purchases", icon: "▤" },
    { id: "settings", label: "Settings", description: "Security & preferences", icon: "⚙" },
  ];

  function handlePanelChange(panelId) {
    setActivePanel(panelId);
    setNotice("");
  }

  function handleSettingToggle(settingName) {
    setSettings((prev) => ({
      ...prev,
      [settingName]: !prev[settingName],
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleUpdatePassword(event) {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setNotice("Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice("New password and confirmation do not match.");
      return;
    }

    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setNotice("Password update is not connected in this prototype yet.");
  }

  function handleSavePreferences() {
    setNotice("Preferences saved locally for this prototype.");
  }

  function handleConfirmSignOut() {
    // 清除登录状态
    localStorage.removeItem("liquidAlchemyCurrentUser");

    // 清除年龄验证状态：退出后重新回到 Age Verification
    localStorage.removeItem("liquidAlchemyAgeVerified");

    navigate("/login", { replace: true });
  }

  return (
    <main className="account-page">
      <header className="account-topbar">
        <Link to="/" className="account-logo">Liquid Alchemy</Link>

        <nav className="account-topnav">
          <Link to="/">New Releases</Link>
          <Link to="/">Cocktail Kits</Link>
          <Link to="/">Garnishes</Link>
          <Link to="/">Subscription</Link>
          <Link to="/account">Laboratory</Link>
        </nav>

        <Link to="/cart" className="account-cart-link" aria-label="Open cart">🛒</Link>
      </header>

      <div className={`account-shell ${showSignOutModal ? "account-blurred" : ""}`}>
        <aside className="account-sidebar">
          <div className="account-sidebar-title">
            <p>Account</p>
            <span>User Profile</span>
          </div>

          <div className="account-menu">
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

            <button
              type="button"
              className="account-menu-button signout"
              onClick={() => setShowSignOutModal(true)}
            >
              <span className="account-menu-icon">↳</span>
              <span>
                <strong>Sign Out</strong>
                <small>Exit account</small>
              </span>
            </button>
          </div>

          <div className="account-user-pill">
            <div className="account-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{userRole}</span>
            </div>
          </div>
        </aside>

        <section className="account-content">
          {accountError && <div className="account-notice">{accountError}</div>}

          {activePanel === "profile" && (
            <section className="account-panel">
              <div className="account-panel-header">
                <p>Personal Details</p>
                <h1>Your Profile</h1>
              </div>

              <div className="account-profile-grid">
                <div className="account-profile-card">
                  <div className="account-profile-image">
                    <div className="account-profile-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
                  </div>

                  <div className="account-detail-grid">
                    <div className="account-detail-item">
                      <span>Account Name</span>
                      <strong>{displayName}</strong>
                      <button type="button">Edit</button>
                    </div>

                    <div className="account-detail-item">
                      <span>Email Address</span>
                      <strong>{email}</strong>
                      <button type="button">Edit</button>
                    </div>

                    <div className="account-detail-item">
                      <span>Account Role</span>
                      <strong>{userRole}</strong>
                      <button type="button">View</button>
                    </div>

                    <div className="account-detail-item">
                      <span>Joined Date</span>
                      <strong>{createdAt}</strong>
                      <button type="button">View</button>
                    </div>
                  </div>
                </div>

                <aside className="account-highlight-card">
                  <p>The Laboratory Box</p>
                  <h2>Your curated kit details will appear here once subscriptions are connected.</h2>
                  <span>Status: Prototype placeholder</span>
                  <button type="button">Manage Subscription</button>
                </aside>
              </div>

              <div className="account-preference-row">
                <div>
                  <strong>Two-Factor Authentication</strong>
                  <span>Secure your account with an extra layer of security.</span>
                </div>
                <button
                  type="button"
                  className={`account-switch ${settings.twoFactor ? "on" : ""}`}
                  onClick={() => handleSettingToggle("twoFactor")}
                  aria-label="Toggle two-factor authentication"
                >
                  <span />
                </button>
              </div>

              <div className="account-preference-row">
                <div>
                  <strong>Newsletter Subscription</strong>
                  <span>Receive updates on experimental releases and laboratory notes.</span>
                </div>
                <button
                  type="button"
                  className={`account-switch ${settings.newsletter ? "on" : ""}`}
                  onClick={() => handleSettingToggle("newsletter")}
                  aria-label="Toggle newsletter subscription"
                >
                  <span />
                </button>
              </div>
            </section>
          )}

          {activePanel === "orders" && (
            <section className="account-panel">
              <div className="account-panel-header account-panel-header-row">
                <div>
                  <p>Archive</p>
                  <h1>Past Orders</h1>
                </div>
              </div>

              {loadingOrders ? (
                <p className="status-text">Loading order history...</p>
              ) : orders.length === 0 ? (
                <div className="account-empty-state">
                  <h2>No order history yet.</h2>
                  <p>Your completed orders will appear here after checkout is connected.</p>
                </div>
              ) : (
                <div className="account-orders">
                  {orders.map((order) => (
                    <article className="account-order-card" key={order.id}>
                      <div className="account-order-summary">
                        <div>
                          <span>Order ID</span>
                          <strong>#{order.id}</strong>
                        </div>
                        <div>
                          <span>Placed On</span>
                          <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                        </div>
                        <div>
                          <span>User ID</span>
                          <strong>{order.user_id}</strong>
                        </div>
                        <div>
                          <span>Status</span>
                          <strong>{order.status}</strong>
                        </div>
                        <div>
                          <span>Total</span>
                          <strong>${Number(order.total_price).toFixed(2)}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

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
                  <span>Keep your account secure with a stronger alphanumeric password.</span>
                </div>

                <div className="account-password-grid">
                  <label>
                    Current Password
                    <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
                  </label>
                  <label>
                    New Password
                    <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} />
                  </label>
                  <label>
                    Confirm New Password
                    <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
                  </label>
                  <button type="submit" className="account-dark-button">Update Credentials</button>
                </div>
              </form>

              <div className="account-settings-section">
                <div className="account-section-copy">
                  <p>Correspondence</p>
                  <h2>Notifications</h2>
                  <span>Choose which updates you want to receive.</span>
                </div>

                <div className="account-check-list">
                  <button
                    type="button"
                    className={`account-check-row ${settings.newsletter ? "checked" : ""}`}
                    onClick={() => handleSettingToggle("newsletter")}
                  >
                    <span>
                      <strong>Formula Laboratory Releases</strong>
                      <small>Direct notification of new cocktail kit availability.</small>
                    </span>
                    <i />
                  </button>

                  <button
                    type="button"
                    className={`account-check-row ${settings.orderUpdates ? "checked" : ""}`}
                    onClick={() => handleSettingToggle("orderUpdates")}
                  >
                    <span>
                      <strong>Operational Updates</strong>
                      <small>Critical account and shipping status notifications.</small>
                    </span>
                    <i />
                  </button>

                  <button type="button" className="account-outline-button" onClick={handleSavePreferences}>
                    Save Preferences
                  </button>
                </div>
              </div>

              <div className="account-danger-zone">
                <div>
                  <p>Destructive Action</p>
                  <h2>Account Deletion</h2>
                  <span>Permanently purge your laboratory profile and historical records.</span>
                </div>
                <button type="button">Deactivate Laboratory Profile</button>
              </div>

              {notice && <div className="account-notice">{notice}</div>}
            </section>
          )}
        </section>
      </div>

      <footer className="account-footer">
        <h2>Liquid Alchemy</h2>
        <div>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Shipping & Returns</span>
          <span>Contact</span>
        </div>
        <p>© 2026 LIQUID ALCHEMY. CRAFTED FOR THE DISCERNING PALATE.</p>
      </footer>

      {showSignOutModal && (
        <div className="account-modal-overlay" role="dialog" aria-modal="true">
          <section className="account-modal-card">
            <p>Account Exit</p>
            <h2>Are you sure you want to sign out?</h2>
            <span>You will return to the age verification screen before accessing the laboratory again.</span>

            <div className="account-modal-actions">
              <button type="button" className="account-outline-button" onClick={() => setShowSignOutModal(false)}>
                Cancel
              </button>
              <button type="button" className="account-dark-button danger" onClick={handleConfirmSignOut}>
                Sign Out
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Account;
