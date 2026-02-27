import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="card flex flex-col hover:border-gray-600 transition-colors duration-200 group">
      <Link to={`/product/${product.id}`}>
        <div className="w-full h-48 bg-brand-dark rounded-lg overflow-hidden mb-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-muted text-4xl">📦</div>
          )}
        </div>
      </Link>

      <div className="flex-1 flex flex-col">
        <span className="text-xs text-brand-muted uppercase tracking-wide mb-1">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-white leading-tight mb-2 hover:text-gray-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-brand-muted line-clamp-2 mb-3 flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-border">
          <span className="text-lg font-bold text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
          <button
            onClick={() => addItem(product.id)}
            className="btn-primary text-sm px-3 py-1.5"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
