import { useCart } from '../context/CartContext';
import { Spinner } from '../components/Skeleton';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, cartLoading, updateItem, removeItem, emptyCart, loadCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      const res = await api.post('/orders/checkout'); // baseURL already has /api
      toast.success('Order confirmed!');
      await loadCart(); // refresh UI after backend clears cart
      navigate(`/order-success/${res.data.data.orderId}`);
    } catch (e) {
      const status = e.response?.status;
      if (status === 400) return toast.error(e.response?.data?.message || 'Cart is empty');
      if (status === 401) return toast.error('Please login again');
      toast.error(e.response?.data?.message || 'Checkout failed');
    }
  };

  if (cartLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
        {cart.items.length > 0 && (
          <button
            onClick={emptyCart}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-brand-muted text-lg mb-4">Your cart is empty</p>
          <Link to="/" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="card flex gap-4">
                <div className="w-20 h-20 bg-brand-dark rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-muted uppercase mb-0.5">
                    {item.category}
                  </p>
                  <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-white font-bold mt-1">
                    ₹{parseFloat(item.price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-brand-muted hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                  <div className="flex items-center border border-brand-border rounded-lg">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateItem(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                      className="px-2 py-1 text-white hover:bg-brand-dark rounded-l-lg text-sm transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-white text-sm border-x border-brand-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-white hover:bg-brand-dark rounded-r-lg text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    ₹{parseFloat(item.item_total).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card h-fit sticky top-20">
            <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Items ({cart.totalItems})</span>
                <span className="text-white">
                  ₹{parseFloat(cart.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
            </div>
            <div className="border-t border-brand-border my-4" />
            <div className="flex justify-between font-bold text-white mb-5">
              <span>Total</span>
              <span>₹{parseFloat(cart.totalAmount).toLocaleString('en-IN')}</span>
            </div>

            <button className="btn-primary w-full py-3" onClick={handleCheckout}>
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="block text-center text-brand-muted hover:text-white text-sm mt-3 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
