import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { deleteUser, fetchUsers, updateUserRole } from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const AdminUsers = () => {
  const adminUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchUsers(adminUser?.id);
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleAdmin(user) {
    setError("");
    try {
      await updateUserRole(adminUser?.id, user.id, !user.is_admin);
      await loadUsers();
    } catch (err) {
      setError("Failed to update role.");
    }
  }

  async function handleDelete(userId) {
    setError("");
    try {
      await deleteUser(adminUser?.id, userId);
      await loadUsers();
    } catch (err) {
      setError("Failed to delete user.");
    }
  }

  return (
    <AdminLayout>
      <header className="admin-header">
        <div>
          <div className="admin-eyebrow">Access Control</div>
          <h2>User Management</h2>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel">
        {loading ? (
          <p className="admin-muted">Loading users...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Password Hash</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td><code style={{fontSize: '11px', wordBreak: 'break-all'}}>{user.password_hash}</code></td>
                  <td>
                    <span className="admin-pill">
                      {user.is_admin ? "Admin" : "Member"}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => handleToggleAdmin(user)}
                      >
                        {user.is_admin ? "Demote" : "Promote"}
                      </button>
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminUsers;
