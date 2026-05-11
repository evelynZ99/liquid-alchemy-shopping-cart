import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAllCarts } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const AdminCarts = () => {
  const adminUser = getCurrentUser();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCarts() {
      try {
        setLoading(true);
        const data = await fetchAllCarts(adminUser?.id);
        if (isMounted) setCarts(data);
      } catch (err) {
        if (isMounted) setError("Failed to load carts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCarts();
    return () => {
      isMounted = false;
    };
  }, [adminUser?.id]);

  return (
    <AdminLayout>
      <header className="admin-header">
        <div>
          <div className="admin-eyebrow">User Activity</div>
          <h2>All Shopping Carts</h2>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p className="admin-muted">Loading carts...</p>
      ) : carts.length === 0 ? (
        <p className="admin-muted">No active carts yet.</p>
      ) : (
        <div className="admin-carts">
          {carts.map((cart) => (
            <div className="admin-cart" key={cart.user_id}>
              <h4>{cart.username}</h4>
              <p className="admin-muted">{cart.email}</p>
              <div className="admin-cart-items">
                {cart.items.map((item) => (
                  <div className="admin-cart-item" key={item.cart_item_id}>
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="admin-muted" style={{ marginTop: "10px" }}>
                Total: ${cart.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCarts;
