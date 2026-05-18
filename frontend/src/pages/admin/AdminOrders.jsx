import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAllOrders, fetchOrder } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const STATUS_COLORS = {
  confirmed: { background: "#e8f3ea", color: "#3a7042" },
  pending:   { background: "#fef6e4", color: "#9a6d1a" },
  cancelled: { background: "#fde8e4", color: "#9c3d2b" },
};

const AdminOrders = () => {
  const adminUser = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchAllOrders(adminUser?.id);
        if (isMounted) setOrders(data);
      } catch {
        if (isMounted) setError("Failed to load orders.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => { isMounted = false; };
  }, [adminUser?.id]);

  async function handleViewOrder(orderId) {
    setLoadingDetail(true);
    setSelectedOrder(null);
    try {
      const data = await fetchOrder(orderId);
      setSelectedOrder(data);
    } catch {
      setError("Failed to load order detail.");
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeDetail() {
    setSelectedOrder(null);
  }

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
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusStyle = STATUS_COLORS[order.status] || {};
                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.username}</td>
                    <td>
                      <span className="admin-pill" style={statusStyle}>
                        {order.status}
                      </span>
                    </td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Order Detail Modal */}
      {(loadingDetail || selectedOrder) && (
        <div className="admin-modal-overlay" onClick={closeDetail}>
          <div
            className="admin-modal-card"
            style={{ width: "min(620px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetail ? (
              <p className="admin-muted">Loading order detail...</p>
            ) : selectedOrder && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                      Order Detail
                    </div>
                    <h3 style={{ margin: 0 }}>#{selectedOrder.id}</h3>
                  </div>
                  <span
                    className="admin-pill"
                    style={STATUS_COLORS[selectedOrder.status] || {}}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: "24px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Customer</span>
                    <p style={{ margin: "4px 0 0", fontWeight: 500 }}>{selectedOrder.username}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Email</span>
                    <p style={{ margin: "4px 0 0" }}>{selectedOrder.email}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Date</span>
                    <p style={{ margin: "4px 0 0" }}>{new Date(selectedOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Order Total</span>
                    <p style={{ margin: "4px 0 0", fontWeight: 600 }}>${Number(selectedOrder.total_price).toFixed(2)}</p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "14px" }}>
                    Items
                  </div>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: 500 }}>{item.name}</p>
                            <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "12px" }}>
                              ${Number(item.price_at_purchase).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          ${(item.price_at_purchase * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--line)", marginTop: "20px", paddingTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>Total</span>
                  <span style={{ fontFamily: "Newsreader, serif", fontSize: "24px" }}>
                    ${Number(selectedOrder.total_price).toFixed(2)}
                  </span>
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="admin-button primary" onClick={closeDetail}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
