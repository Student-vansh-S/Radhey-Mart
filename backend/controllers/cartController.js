const pool = require('../db/pool');
const { sendSuccess, sendError } = require('../utils/response');

const addToCart = async (req, res, next) => {
  try {
    const { user_id, product_id, quantity = 1 } = req.body;
    if (!user_id || !product_id) return sendError(res, 'user_id and product_id are required', 400);
    if (quantity < 1) return sendError(res, 'quantity must be at least 1', 400);

    const productCheck = await pool.query('SELECT id FROM products WHERE id=$1', [product_id]);
    if (productCheck.rows.length === 0) return sendError(res, 'Product not found', 404);

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [user_id, product_id, quantity]
    );
    sendSuccess(res, result.rows[0], 'Added to cart', 201);
  } catch (err) { next(err); }
};

const getCart = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.created_at,
              p.id as product_id, p.name, p.price, p.category, p.image_url,
              (ci.quantity * p.price) as item_total
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.params.userId]
    );

    const items = result.rows;
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.item_total), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    sendSuccess(res, { items, totalItems, totalAmount: totalAmount.toFixed(2) });
  } catch (err) { next(err); }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return sendError(res, 'quantity must be at least 1', 400);

    const result = await pool.query(
      'UPDATE cart_items SET quantity=$1 WHERE id=$2 RETURNING *',
      [quantity, req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 'Cart item not found', 404);
    sendSuccess(res, result.rows[0], 'Cart item updated');
  } catch (err) { next(err); }
};

const removeCartItem = async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM cart_items WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 'Cart item not found', 404);
    sendSuccess(res, null, 'Item removed from cart');
  } catch (err) { next(err); }
};

const clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id=$1', [req.params.userId]);
    sendSuccess(res, null, 'Cart cleared');
  } catch (err) { next(err); }
};

module.exports = { addToCart, getCart, updateCartItem, removeCartItem, clearCart };
