/**
 * DEV ONLY — temporary login helper while Login/Signup UI is pending.
 * Remove this component once the auth pages are implemented by the team.
 */
import { useState } from "react";
import { register, login } from "../services/api";
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "../utils/auth";

const DEV_EMAIL    = "dev-admin@liquidalchemy.test";
const DEV_PASSWORD = "devpass123";
const DEV_USERNAME = "dev_admin";
const ADMIN_KEY    = "ADMIN_SECRET_KEY";

const DevLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const currentUser = getCurrentUser();

  async function handleDevLogin() {
    setLoading(true);
    try {
      let user;
      try {
        user = await register(DEV_USERNAME, DEV_EMAIL, DEV_PASSWORD, {
          isAdmin: true,
          adminKey: ADMIN_KEY,
        });
      } catch {
        user = await login(DEV_EMAIL, DEV_PASSWORD);
      }
      setCurrentUser(user);
      window.location.reload();
    } catch (err) {
      alert("Dev login failed — make sure the backend is running.\n" + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearCurrentUser();
    window.location.reload();
  }

  if (currentUser) {
    return (
      <div className="dev-auth-bar">
        <span className="dev-auth-user">
          {currentUser.is_admin ? "Admin" : "User"}: {currentUser.username}
        </span>
        <button className="dev-auth-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      className="dev-auth-btn"
      onClick={handleDevLogin}
      disabled={loading}
    >
      {loading ? "Logging in…" : "Dev Login"}
    </button>
  );
};

export default DevLoginButton;
