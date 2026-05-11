import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminOverview } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const adminUser = getCurrentUser();

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const data = await fetchAdminOverview(adminUser?.id);
        if (isMounted) setOverview(data);
      } catch (err) {
        if (isMounted) setError("Failed to load admin overview.");
      }
    }

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, [adminUser?.id]);

  return (
    <AdminLayout>
      <header className="admin-header">
        <div>
          <div className="admin-eyebrow">Overview</div>
          <h2>Executive Dashboard</h2>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {!overview ? (
        <p className="admin-muted">Loading metrics...</p>
      ) : (
        <div className="admin-card-grid">
          <div className="admin-card">
            <div className="label">Total Users</div>
            <div className="value">{overview.total_users}</div>
          </div>
          <div className="admin-card">
            <div className="label">Total Products</div>
            <div className="value">{overview.total_products}</div>
          </div>
          <div className="admin-card">
            <div className="label">Total Orders</div>
            <div className="value">{overview.total_orders}</div>
          </div>
          <div className="admin-card">
            <div className="label">Revenue</div>
            <div className="value">${overview.total_revenue.toFixed(2)}</div>
          </div>
        </div>
      )}

      <section className="admin-panel">
        <div className="admin-stack">
          <div>
            <div className="admin-eyebrow">System</div>
            <h3 className="admin-muted">Admin access is live and connected to the database.</h3>
          </div>
          <div className="admin-card-grid">
            <div className="admin-card">
              <div className="label">Cart Items</div>
              <div className="value">{overview ? overview.cart_items : "--"}</div>
            </div>
            <div className="admin-card">
              <div className="label">Sync Status</div>
              <div className="value">Stable</div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
