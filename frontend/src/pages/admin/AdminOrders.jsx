import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAllOrders } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const AdminOrders = () => {
  const adminUser = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchAllOrders(adminUser?.id);
        if (isMounted) setOrders(data);
      } catch (err) {
        if (isMounted) setError("Failed to load orders.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [adminUser?.id]);

  return (
    <AdminLayout>
      <header className="admin-header">
        <div>
          <div className="admin-eyebrow">Inventory & Logistics</div>
          <h2>Order Management</h2>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel">
        {loading ? (
          <p className="admin-muted">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="admin-muted">No orders yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user_id}</td>
                  <td>{order.status}</td>
                  <td>${Number(order.total_price).toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminOrders;
