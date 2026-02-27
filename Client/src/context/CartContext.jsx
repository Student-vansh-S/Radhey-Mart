import { createContext, useContext, useState, useEffect } from 'react';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: '0.00' });
  const [cartLoading, setCartLoading] = useState(false);

  const loadCart = async () => {
    if (!user) { setCart({ items: [], totalItems: 0, totalAmount: '0.00' }); return; }
    setCartLoading(true);
    try {
      const res = await fetchCart(user.id);
      setCart(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, [user]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart({ user_id: user.id, product_id: productId, quantity });
      toast.success('Added to cart!');
      await loadCart();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
      await loadCart();
    } catch (e) {
      toast.error('Failed to update item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      toast.success('Item removed');
      await loadCart();
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };

  const emptyCart = async () => {
    if (!user) return;
    try {
      await clearCart(user.id);
      toast.success('Cart cleared');
      await loadCart();
    } catch (e) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartLoading, addItem, updateItem, removeItem, emptyCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
