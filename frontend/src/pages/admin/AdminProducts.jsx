import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  uploadProductImage,
} from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category: "",
  categoryCustom: "",
  stock: "0",
  alcohol_type: "",
  alcohol_typeCustom: "",
  flavor_profile: "",
  flavor_profileCustom: "",
  difficulty: "",
  difficultyCustom: "",
  occasion: "",
  occasionCustom: "",
};

const FieldLabel = ({ children }) => (
  <label style={{
    fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
    color: "var(--muted)", display: "block", marginBottom: "6px",
  }}>
    {children}
  </label>
);

const SelectOrOther = ({ label, field, products, formData, onChange }) => {
  const options = [...new Set(products.map((p) => p[field]).filter(Boolean))].sort();
  const isOther = formData[field] === "__other__";
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select name={field} value={formData[field]} onChange={onChange}>
        <option value="">— None —</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        <option value="__other__">Other (enter manually)</option>
      </select>
      {isOther && (
        <input
          name={`${field}Custom`}
          value={formData[`${field}Custom`]}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          style={{ marginTop: "8px" }}
        />
      )}
    </div>
  );
};

const AdminProducts = () => {
  const adminUser = getCurrentUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [deletingProduct, setDeletingProduct] = useState(null);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function openAdd() {
    setFormData(EMPTY_FORM);
    setFormError("");
    setEditingProduct(null);
    setModalMode("add");
  }

  function openEdit(product) {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      image_url: product.image_url || "",
      category: product.category || "",
      categoryCustom: "",
      stock: String(product.stock ?? 0),
      alcohol_type: product.alcohol_type || "",
      alcohol_typeCustom: "",
      flavor_profile: product.flavor_profile || "",
      flavor_profileCustom: "",
      difficulty: product.difficulty || "",
      difficultyCustom: "",
      occasion: product.occasion || "",
      occasionCustom: "",
    });
    setFormError("");
    setEditingProduct(product);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
    setFormError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFormError("");
    try {
      const result = await uploadProductImage(adminUser?.id, file);
      setFormData((prev) => ({ ...prev, image_url: result.url }));
    } catch (err) {
      setFormError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  function resolveField(field) {
    const val = formData[field];
    return val === "__other__" ? (formData[`${field}Custom`] || "").trim() : (val || "").trim();
  }

  function normalizePayload() {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      image_url: formData.image_url.trim(),
      category: resolveField("category"),
      stock: Number(formData.stock),
      alcohol_type: resolveField("alcohol_type") || null,
      flavor_profile: resolveField("flavor_profile") || null,
      difficulty: resolveField("difficulty") || null,
      occasion: resolveField("occasion") || null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const resolvedCategory = formData.category === "__other__" ? formData.categoryCustom.trim() : formData.category.trim();
    if (!formData.name.trim() || !resolvedCategory || !formData.price || !formData.image_url.trim()) {
      setFormError("Name, category, price and image URL are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = normalizePayload();
      if (modalMode === "edit") {
        await updateProduct(adminUser?.id, editingProduct.id, payload);
      } else {
        await createProduct(adminUser?.id, payload);
      }
      await loadProducts();
      closeModal();
    } catch {
      setFormError("Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    setError("");
    try {
      await deleteProduct(adminUser?.id, deletingProduct.id);
      setDeletingProduct(null);
      await loadProducts();
    } catch {
      setDeletingProduct(null);
      setError("Failed to delete product.");
    }
  }

  return (
    <AdminLayout>
      <header className="admin-header">
        <div>
          <div className="admin-eyebrow">Inventory Control</div>
          <h2>Product Management</h2>
        </div>
        <div className="admin-actions">
          <button className="admin-button primary" type="button" onClick={openAdd}>
            + Add Product
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel">
        {loading ? (
          <p className="admin-muted">Loading products...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "48px" }}></th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ width: "40px", height: "40px", objectFit: "cover", display: "block" }}
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="admin-muted" style={{ fontSize: "12px", marginTop: "2px", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.description}
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-button" type="button" onClick={() => openEdit(product)}>
                        Edit
                      </button>
                      <button className="admin-button" type="button" onClick={() => setDeletingProduct(product)}>
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

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div
            className="admin-modal-card"
            style={{ width: "min(600px, 100%)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{modalMode === "add" ? "Add Product" : "Edit Product"}</h3>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div>
                  <FieldLabel>Product Name *</FieldLabel>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Pineappu Beach" autoFocus />
                </div>
                <div>
                  <FieldLabel>Category *</FieldLabel>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">— Select category —</option>
                    {[...new Set(products.map((p) => p.category).filter(Boolean))].sort().map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__other__">Other (enter manually)</option>
                  </select>
                  {formData.category === "__other__" && (
                    <input
                      name="categoryCustom"
                      value={formData.categoryCustom}
                      onChange={handleChange}
                      placeholder="Enter new category"
                      style={{ marginTop: "8px" }}
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div>
                  <FieldLabel>Price ($) *</FieldLabel>
                  <input name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div>
                  <FieldLabel>Stock</FieldLabel>
                  <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
                </div>
              </div>

              <div>
                <FieldLabel>Image</FieldLabel>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  {/* Preview box */}
                  <div style={{
                    width: "120px", height: "120px", flexShrink: 0,
                    border: "1px solid var(--line)", background: "#f1eee6",
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                  }}>
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <span style={{ fontSize: "11px", color: "#b0a99e", textAlign: "center", padding: "8px" }}>No image</span>
                    )}
                  </div>

                  {/* Upload + URL */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{
                      display: "inline-block", padding: "9px 16px", border: "1px solid var(--line)",
                      fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                      cursor: uploading ? "not-allowed" : "pointer", color: "var(--muted)",
                      textAlign: "center", background: uploading ? "#f5f3ef" : "transparent",
                    }}>
                      {uploading ? "Uploading..." : "Upload from computer"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    <div style={{ fontSize: "11px", color: "#b0a99e", textAlign: "center", letterSpacing: "1px" }}>OR</div>
                    <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Paste image URL" />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Description *</FieldLabel>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product description..." />
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "16px", display: "grid", gap: "20px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)" }}>
                  Optional Fields
                </div>
                <div className="admin-form-row">
                  <SelectOrOther label="Alcohol Type" field="alcohol_type" products={products} formData={formData} onChange={handleChange} />
                  <SelectOrOther label="Flavor Profile" field="flavor_profile" products={products} formData={formData} onChange={handleChange} />
                </div>
                <div className="admin-form-row">
                  <SelectOrOther label="Difficulty" field="difficulty" products={products} formData={formData} onChange={handleChange} />
                  <SelectOrOther label="Occasion" field="occasion" products={products} formData={formData} onChange={handleChange} />
                </div>
              </div>

              {formError && <div className="admin-error">{formError}</div>}

              <div className="admin-modal-actions">
                <button type="button" className="admin-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : modalMode === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product</h3>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <img
                src={deletingProduct.image_url}
                alt={deletingProduct.name}
                style={{ width: "56px", height: "56px", objectFit: "cover", border: "1px solid var(--line)", flexShrink: 0 }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{deletingProduct.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>{deletingProduct.category} · ${Number(deletingProduct.price).toFixed(2)}</p>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#9c3d2b", marginBottom: "24px" }}>
              This will permanently remove the product. This action cannot be undone.
            </p>

            <div className="admin-modal-actions">
              <button type="button" className="admin-button" onClick={() => setDeletingProduct(null)}>Cancel</button>
              <button type="button" className="admin-button primary" onClick={handleDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
