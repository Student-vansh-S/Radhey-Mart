const pool = require("../db/pool");
const { sendSuccess, sendError } = require("../utils/response");
const { sendOrderEmailToAdmins } = require("../utils/mailer");

const checkout = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, "Unauthorized", 401);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cartRes = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [userId]
    );

    if (cartRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return sendError(res, "Cart is empty", 400);
    }

    const items = cartRes.rows;
    const total = items.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.quantity),
      0
    );

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, 'confirmed')
       RETURNING id, total, created_at`,
      [userId, total]
    );
    const order = orderRes.rows[0];

    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, it.product_id, it.name, it.price, it.quantity]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    // ✅ Send email to all admins
    const adminsRes = await pool.query(`SELECT email FROM users WHERE role='admin'`);
    const adminEmails = adminsRes.rows.map(r => r.email).filter(Boolean);

    const itemRows = items.map(it => `
      <tr>
        <td>${it.name}</td>
        <td>${it.quantity}</td>
        <td>₹${Number(it.price).toFixed(2)}</td>
        <td>₹${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
      </tr>
    `).join("");

    const html = `
      <h2>New Order Confirmed ✅</h2>
      <p><b>Order ID:</b> ${order.id}</p>
      <p><b>User ID:</b> ${userId}</p>
      <p><b>Total:</b> ₹${Number(order.total).toFixed(2)}</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    `;

    await sendOrderEmailToAdmins({
      to: adminEmails,
      subject: `Radhey Mart - New Order #${order.id}`,
      html,
    });

    return sendSuccess(res, { orderId: order.id, total: order.total }, "Order confirmed", 201);
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { checkout };