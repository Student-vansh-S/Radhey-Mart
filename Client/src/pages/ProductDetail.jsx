import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { Spinner } from '../components/Skeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchProductById(id)
      .then((res) => setProduct(res.data.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12"><Spinner /></div>;

  if (error || !product) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Link to="/" className="btn-primary">← Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="text-brand-muted hover:text-white text-sm mb-6 inline-block transition-colors">
        ← Back to Products
      </Link>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-brand-dark rounded-xl overflow-hidden aspect-square">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-brand-muted uppercase tracking-wider mb-2">{product.category}</span>
          <h1 className="text-2xl font-bold text-white mb-4">{product.name}</h1>
          {product.description && <p className="text-brand-light leading-relaxed mb-6">{product.description}</p>}
          <div className="mt-auto">
            <p className="text-3xl font-bold text-white mb-6">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-brand-muted text-sm">Qty:</label>
              <div className="flex items-center border border-brand-border rounded-lg">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2 text-white hover:bg-brand-card rounded-l-lg transition-colors">−</button>
                <span className="px-4 py-2 text-white font-medium border-x border-brand-border">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="px-3 py-2 text-white hover:bg-brand-card rounded-r-lg transition-colors">+</button>
              </div>
            </div>
            <button onClick={() => addItem(product.id, qty)} className="btn-primary w-full py-3 text-base">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
