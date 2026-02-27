import { useState, useEffect } from "react";
import { fetchMyProducts, createProduct, updateProduct, deleteProduct } from "../api/products";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = { name: "", price: "", category: "", image_url: "", description: "" };

export default function AdminPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchMyProducts(); // ✅ only mine
      setProducts(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price) e.price = "Price is required";
    else if (isNaN(form.price) || parseFloat(form.price) < 0) e.price = "Invalid price";
    if (!form.category.trim()) e.category = "Category is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await updateProduct(editId, form);
        toast.success("Product updated!");
      } else {
        await createProduct(form);
        toast.success("Product added!");
      }

      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      setErrors({});
      await loadProducts();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("You can only edit your own products");
      } else {
        toast.error(err.response?.data?.message || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    const isOwner = Number(user?.id) === Number(p.created_by);
    if (!isOwner) return toast.error("You can only edit your own products");

    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      image_url: p.image_url || "",
      description: p.description || "",
    });
    setEditId(p.id);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (p) => {
    const isOwner = Number(user?.id) === Number(p.created_by);
    if (!isOwner) return toast.error("You can only delete your own products");

    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(p.id);
      toast.success("Product deleted");
      await loadProducts();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("You can only delete your own products");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-sm">
            + Add Product
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">{editId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name</label>
              <input value={form.name} onChange={set("name")} className="input" placeholder="Product name" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input value={form.price} onChange={set("price")} className="input" placeholder="999.00" type="number" step="0.01" min="0" />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <input value={form.category} onChange={set("category")} className="input" placeholder="Electronics, Clothing..." />
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="label">
                Image URL <span className="text-brand-muted font-normal">(optional)</span>
              </label>
              <input value={form.image_url} onChange={set("image_url")} className="input" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">
                Description <span className="text-brand-muted font-normal">(optional)</span>
              </label>
              <textarea value={form.description} onChange={set("description")} className="input min-h-[80px] resize-none" placeholder="Product description..." />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5">
                {submitting ? "Saving..." : editId ? "Update Product" : "Add Product"}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary px-6 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="font-semibold text-white">My Products ({products.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-brand-muted">No products yet. Add one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-brand-border hover:bg-brand-dark/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-dark flex-shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white leading-tight">{p.name}</p>
                          <p className="text-brand-muted text-xs line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{p.category}</td>
                    <td className="px-5 py-3 font-semibold text-white">₹{parseFloat(p.price).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(p)} className="text-xs px-3 py-1.5 border border-brand-border text-brand-light hover:text-white hover:border-gray-500 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p)} className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}