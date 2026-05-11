import { NavLink, useNavigate } from "react-router-dom";
import { clearCurrentUser, getCurrentUser } from "../../utils/auth";
import "./admin.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleSignOut() {
    clearCurrentUser();
    navigate("/");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <div className="admin-brand">
          <h1>Admin Panel</h1>
          <span>Liquid Alchemy</span>
        </div>

        <nav className="admin-nav-links">
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} to="/admin">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} to="/admin/products">
            Product Management
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} to="/admin/orders">
            Order Management
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} to="/admin/users">
            User Management
          </NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`} to="/admin/carts">
            User Carts
          </NavLink>
        </nav>

        <div className="admin-user">
          <strong>{user ? user.username : "Admin"}</strong>
          <span>{user && user.is_admin ? "System Admin" : "User"}</span>
          <button className="admin-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
};

export default AdminLayout;
