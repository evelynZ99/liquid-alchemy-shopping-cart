import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  deleteUser,
  fetchUsers,
  register,
  adminUpdateUserProfile,
  adminResetUserPassword,
} from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const EMPTY_ADD_FORM = {
  username: "",
  email: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

const EMPTY_EDIT_FORM = {
  username: "",
  dateOfBirth: "",
};

function formatDob(dob) {
  if (!dob) return "—";
  return new Date(dob + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FieldLabel = ({ children }) => (
  <label style={{
    fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
    color: "var(--muted)", display: "block", marginBottom: "6px",
  }}>
    {children}
  </label>
);

const AdminUsers = () => {
  const adminUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [editingUser, setEditingUser] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [resetResult, setResetResult] = useState(null); // { username, password, emailSent }
  const [deletingUser, setDeletingUser] = useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchUsers(adminUser?.id);
      setUsers(data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  function openAdd() {
    setAddForm(EMPTY_ADD_FORM);
    setFormError("");
    setEditingUser(null);
    setModalMode("add");
  }

  function openEdit(user) {
    setEditForm({
      username: user.username,
      dateOfBirth: user.date_of_birth || "",
    });
    setFormError("");
    setEditingUser(user);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingUser(null);
    setFormError("");
    setResetResult(null);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!addForm.username.trim() || !addForm.email.trim() || !addForm.dateOfBirth || !addForm.password) {
      setFormError("All fields are required.");
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (addForm.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    const dob = new Date(addForm.dateOfBirth + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      setFormError("User must be 18 or older to register.");
      return;
    }

    try {
      setSubmitting(true);
      await register(addForm.username.trim(), addForm.email.trim(), addForm.password, {
        dateOfBirth: addForm.dateOfBirth,
      });
      await loadUsers();
      closeModal();
    } catch (err) {
      setFormError(err.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!editForm.username.trim()) {
      setFormError("Username cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      await adminUpdateUserProfile(adminUser?.id, editingUser.id, {
        username: editForm.username.trim(),
        dateOfBirth: editForm.dateOfBirth || null,
      });
      await loadUsers();
      closeModal();
    } catch {
      setFormError("Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(user) {
    setError("");
    try {
      const result = await adminResetUserPassword(adminUser?.id, user.id);
      setResetResult({
        username: user.username,
        password: result.default_password,
        emailSent: result.email_sent,
      });
      setEditingUser(user);
      setModalMode("reset");
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setError("");
    try {
      await deleteUser(adminUser?.id, deletingUser.id);
      setDeletingUser(null);
      await loadUsers();
    } catch {
      setDeletingUser(null);
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
        <div className="admin-actions">
          <button className="admin-button primary" type="button" onClick={openAdd}>
            + Add User
          </button>
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
                <th>Username</th>
                <th>Email</th>
                <th>Date of Birth</th>
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
                  <td>{formatDob(user.date_of_birth)}</td>
                  <td>
                    <span className="admin-pill">
                      {user.is_admin ? "Admin" : "Member"}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-button" type="button" onClick={() => openEdit(user)}>
                        Edit
                      </button>
                      <button className="admin-button" type="button" onClick={() => handleResetPassword(user)}>
                        Reset Password
                      </button>
                      <button className="admin-button" type="button" onClick={() => setDeletingUser(user)}>
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

      {/* Add User Modal */}
      {modalMode === "add" && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add User</h3>
            <form className="admin-form" onSubmit={handleAddSubmit}>
              <div>
                <FieldLabel>Username</FieldLabel>
                <input name="username" value={addForm.username} autoFocus
                  onChange={(e) => setAddForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="username" />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input name="email" type="email" value={addForm.email}
                  onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@example.com" />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input name="dateOfBirth" type="date" value={addForm.dateOfBirth}
                  onChange={(e) => setAddForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <input name="password" type="password" value={addForm.password}
                    onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 characters" />
                </div>
                <div>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <input name="confirmPassword" type="password" value={addForm.confirmPassword}
                    onChange={(e) => setAddForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat password" />
                </div>
              </div>

              {formError && <div className="admin-error">{formError}</div>}

              <div className="admin-modal-actions">
                <button type="button" className="admin-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-button primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {modalMode === "edit" && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <form className="admin-form" onSubmit={handleEditSubmit}>
              <div>
                <FieldLabel>Username</FieldLabel>
                <input value={editForm.username} autoFocus
                  onChange={(e) => setEditForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="username" />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input type="date" value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <p className="admin-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                Email and password are managed separately.
              </p>

              {formError && <div className="admin-error">{formError}</div>}

              <div className="admin-modal-actions">
                <button type="button" className="admin-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="admin-modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p style={{ marginBottom: "12px", fontSize: "14px" }}>
              You are about to permanently delete <strong>{deletingUser.username}</strong> ({deletingUser.email}).
            </p>
            <p style={{ marginBottom: "24px", fontSize: "13px", color: "var(--muted)" }}>
              This will also remove all of their associated data, including:
            </p>
            <ul style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px", paddingLeft: "18px", lineHeight: "2" }}>
              <li>Cart items</li>
              <li>Wishlist items</li>
              <li>Order history</li>
            </ul>
            <p style={{ fontSize: "13px", color: "#9c3d2b", marginBottom: "24px" }}>
              This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-button" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button type="button" className="admin-button primary" onClick={handleDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {modalMode === "reset" && resetResult && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Password Reset</h3>
            <p style={{ marginBottom: "16px", color: "var(--muted)", fontSize: "14px" }}>
              Password for <strong>{resetResult.username}</strong> has been reset to their date of birth.
            </p>

            <div style={{ background: "#f1eee6", border: "1px solid var(--line)", padding: "14px 18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                Temporary Password
              </div>
              <code style={{ fontSize: "22px", fontFamily: "monospace", letterSpacing: "4px" }}>
                {resetResult.password}
              </code>
            </div>

            <p style={{ fontSize: "13px", color: resetResult.emailSent ? "#4a7c4e" : "#9c3d2b", marginBottom: "20px" }}>
              {resetResult.emailSent
                ? "✓ Notification email sent to user."
                : "Email not sent — SMTP is not configured. Please share the temporary password manually."}
            </p>

            <div className="admin-modal-actions">
              <button type="button" className="admin-button primary" onClick={closeModal}>Done</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
