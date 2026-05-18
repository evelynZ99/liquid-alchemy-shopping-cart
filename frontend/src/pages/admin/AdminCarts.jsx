import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAllCarts } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const AdminCarts = () => {
  const adminUser = getCurrentUser();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleExpand(userId) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

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
          {carts.map((cart) => {
            const isOpen = expandedIds.has(cart.user_id);
            return (
              <div className="admin-cart" key={cart.user_id}>
                <button
                  className="admin-cart-toggle"
                  onClick={() => toggleExpand(cart.user_id)}
                >
                  <div className="admin-cart-toggle-left">
                    <span className="admin-cart-username">{cart.username}</span>
                    <span className="admin-muted">{cart.email}</span>
                  </div>
                  <div className="admin-cart-toggle-right">
                    <span className="admin-muted">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</span>
                    <span className="admin-cart-total">${cart.total.toFixed(2)}</span>
                    <span className="admin-cart-chevron">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="admin-cart-items">
                    {cart.items.map((item) => (
                      <div className="admin-cart-item" key={item.cart_item_id}>
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCarts;
