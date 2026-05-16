import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUser, fetchUserOrders, updatePassword } from "../services/api";
import "../App.css";

const Account = () => {
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState("profile");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [userDetail, setUserDetail] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    newsletter: true,
    orderUpdates: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notice, setNotice] = useState("");

  const currentUser = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("liquidAlchemyCurrentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    let isMounted = true;

    async function loadAccountData() {
      try {
        setError("");
        setLoadingUser(true);
        setLoadingOrders(true);

        const [userData, orderData] = await Promise.all([
          fetchUser(userId),
          fetchUserOrders(userId),
        ]);

        if (!isMounted) return;

        setUserDetail(userData);
        setOrders(orderData);
      } catch (err) {
        if (isMounted) {
          setError("Failed to load account data.");
        }
      } finally {
        if (isMounted) {
          setLoadingUser(false);
          setLoadingOrders(false);
        }
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [userId, navigate]);

  const displayName =
    userDetail?.username || currentUser?.username || "Alchemy Guest";

  const email = userDetail?.email || currentUser?.email || "guest@alchemy.com";

  const roleLabel =
    userDetail?.is_admin || currentUser?.role === "admin"
      ? "System Admin"
      : "Member";

  const joinedDate = userDetail?.created_at
    ? new Date(userDetail.created_at).toLocaleDateString()
    : "Not available";

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      description: "Personal details",
      icon: "◎",
    },
    {
      id: "orders",
      label: "Order History",
      description: "Past purchases",
      icon: "▤",
    },
    {
      id: "settings",
      label: "Settings",
      description: "Security & preferences",
      icon: "⚙",
    },
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

    setNotice("");

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpdatePassword(event) {
    event.preventDefault();
    setNotice("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setNotice("Please complete all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setNotice("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice("New password and confirmation do not match.");
      return;
    }

    try {
      await updatePassword(
        userId,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setNotice("Password updated successfully.");
    } catch (err) {
      setNotice("Current password is incorrect or password update failed.");
    }
  }

  function handleSavePreferences() {
    setNotice("Preferences saved locally for this prototype.");
  }

  function handleConfirmSignOut() {
    localStorage.removeItem("liquidAlchemyCurrentUser");
    navigate("/login", { replace: true });
  }

  return (
    <main className="account-page">
      <header className="account-topbar">
        <Link to="/" className="account-logo">
          Liquid Alchemy
        </Link>

        <nav className="account-topnav">
          <Link to="/">New Releases</Link>
          <Link to="/">Cocktail Kits</Link>
          <Link to="/">Garnishes</Link>
          <Link to="/">Subscription</Link>
          <Link to="/account">Laboratory</Link>
        </nav>

        <Link to="/cart" className="account-cart-link" aria-label="Open cart">
          🛒
        </Link>
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
                className={`account-menu-button ${
                  activePanel === item.id ? "active" : ""
                }`}
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
            <div className="account-avatar">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
        </aside>

        <section className="account-content">
          {error && <div className="account-notice error">{error}</div>}

          {activePanel === "profile" && (
            <section className="account-panel">
              <div className="account-panel-header">
                <p>Personal Details</p>
                <h1>Your Profile</h1>
              </div>

              {loadingUser ? (
                <p className="status-text">Loading profile...</p>
              ) : (
                <div className="account-profile-grid">
                  <div className="account-profile-card">
                    <div className="account-profile-image">
                      <div className="account-profile-avatar">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div className="account-detail-grid">
                      <div className="account-detail-item">
                        <span>Account Name</span>
                        <strong>{displayName}</strong>
                      </div>

                      <div className="account-detail-item">
                        <span>Email Address</span>
                        <strong>{email}</strong>
                      </div>

                      <div className="account-detail-item">
                        <span>Account Role</span>
                        <strong>{roleLabel}</strong>
                      </div>

                      <div className="account-detail-item">
                        <span>Joined Date</span>
                        <strong>{joinedDate}</strong>
                      </div>
                    </div>
                  </div>

                  
                </div>
              )}
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
                <p className="status-text">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="account-notice">No order history yet.</div>
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
                          <strong>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString()
                              : "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Recipient</span>
                          <strong>{displayName}</strong>
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

                      <div className="account-order-detail">
                        <p>Database order record</p>
                        <button type="button">View Details</button>
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

              <form
                className="account-settings-section"
                onSubmit={handleUpdatePassword}
              >
                <div className="account-section-copy">
                  <p>Access Control</p>
                  <h2>Update Password</h2>
                  <span>
                    Confirm your current password before setting a new one.
                  </span>
                </div>

                <div className="account-password-grid">
                  <label>
                    Current Password
                    <input
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>

                  <label>
                    New Password
                    <input
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>

                  <label>
                    Confirm New Password
                    <input
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>

                  <button type="submit" className="account-dark-button">
                    Update Credentials
                  </button>
                </div>
              </form>

              {notice && (
                <div
                  className={`account-notice ${
                    notice.includes("successfully") ? "success" : "error"
                  }`}
                >
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
                  <button
                    type="button"
                    className={`account-check-row ${
                      settings.newsletter ? "checked" : ""
                    }`}
                    onClick={() => handleSettingToggle("newsletter")}
                  >
                    <span>
                      <strong>Formula Laboratory Releases</strong>
                      <small>
                        Direct notification of new cocktail kit availability.
                      </small>
                    </span>
                    <i />
                  </button>

                  <button
                    type="button"
                    className={`account-check-row ${
                      settings.orderUpdates ? "checked" : ""
                    }`}
                    onClick={() => handleSettingToggle("orderUpdates")}
                  >
                    <span>
                      <strong>Operational Updates</strong>
                      <small>
                        Critical account and shipping status notifications.
                      </small>
                    </span>
                    <i />
                  </button>

                  <button
                    type="button"
                    className="account-outline-button"
                    onClick={handleSavePreferences}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>

              <div className="account-danger-zone">
                <div>
                  <p>Destructive Action</p>
                  <h2>Account Deletion</h2>
                  <span>
                    Account deletion is not connected to the database yet.
                  </span>
                </div>

                <button type="button">Deactivate Laboratory Profile</button>
              </div>
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
            <span>
              You will need to sign in again to access your profile and order
              history.
            </span>

            <div className="account-modal-actions">
              <button
                type="button"
                className="account-outline-button"
                onClick={() => setShowSignOutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="account-dark-button danger"
                onClick={handleConfirmSignOut}
              >
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