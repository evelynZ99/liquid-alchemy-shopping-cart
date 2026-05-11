import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../services/api";
import { getCurrentUser } from "../../utils/auth";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category: "",
  stock: "0",
  alcohol_type: "",
  flavor_profile: "",
  difficulty: "",
  occasion: "",
};

const AdminProducts = () => {
  const adminUser = getCurrentUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function normalizePayload() {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      image_url: formData.image_url.trim(),
      category: formData.category.trim(),
      stock: Number(formData.stock),
      alcohol_type: formData.alcohol_type.trim() || null,
      flavor_profile: formData.flavor_profile.trim() || null,
      difficulty: formData.difficulty.trim() || null,
      occasion: formData.occasion.trim() || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = normalizePayload();
      if (editingId) {
        await updateProduct(adminUser?.id, editingId, payload);
      } else {
        await createProduct(adminUser?.id, payload);
      }
      setFormData(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError("Failed to save product.");
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      image_url: product.image_url || "",
      category: product.category || "",
      stock: String(product.stock ?? 0),
      alcohol_type: product.alcohol_type || "",
      flavor_profile: product.flavor_profile || "",
      difficulty: product.difficulty || "",
      occasion: product.occasion || "",
    });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete \"${product.name}\"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteProduct(adminUser?.id, product.id);
      await loadProducts();
    } catch (err) {
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
          <button
            className="admin-button primary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(emptyForm);
            }}
          >
            Add new product
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel admin-stack">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <input
              name="name"
              placeholder="Product name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <input
              name="price"
              placeholder="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <input
              name="stock"
              placeholder="Stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
          <input
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <div className="admin-form-row">
            <input
              name="alcohol_type"
              placeholder="Alcohol type (optional)"
              value={formData.alcohol_type}
              onChange={handleChange}
            />
            <input
              name="flavor_profile"
              placeholder="Flavor profile (optional)"
              value={formData.flavor_profile}
              onChange={handleChange}
            />
            <input
              name="difficulty"
              placeholder="Difficulty (optional)"
              value={formData.difficulty}
              onChange={handleChange}
            />
            <input
              name="occasion"
              placeholder="Occasion (optional)"
              value={formData.occasion}
              onChange={handleChange}
            />
          </div>
          <div className="admin-actions">
            <button className="admin-button primary" type="submit">
              {editingId ? "Update product" : "Create product"}
            </button>
            {editingId && (
              <button
                className="admin-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel" style={{ marginTop: "24px" }}>
        {loading ? (
          <p className="admin-muted">Loading products...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
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
                    <strong>{product.name}</strong>
                    <div className="admin-muted">{product.description}</div>
                  </td>
                  <td>{product.category}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => handleDelete(product)}
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

export default AdminProducts;
