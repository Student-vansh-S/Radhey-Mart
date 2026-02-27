const pool = require("../db/pool");
const { sendSuccess, sendError } = require("../utils/response");

// ✅ Admin creates product, product belongs to that admin (created_by)
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, image_url, description } = req.body;

    if (!req.user?.id) return sendError(res, "Unauthorized", 401);
    if (!name || price === undefined || !category)
      return sendError(res, "name, price, and category are required", 400);
    if (isNaN(price) || Number(price) < 0)
      return sendError(res, "price must be a positive number", 400);

    const result = await pool.query(
      `INSERT INTO products (name, price, category, image_url, description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        name.trim(),
        parseFloat(price),
        category.trim(),
        image_url || null,
        description || null,
        req.user.id, // ✅ owner
      ],
    );

    sendSuccess(res, result.rows[0], "Product created", 201);
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category && category.trim()) {
      conditions.push(`LOWER(category) = LOWER($${idx++})`);
      values.push(category.trim());
    }

    if (search && search.trim()) {
      conditions.push(
        `(LOWER(name) LIKE LOWER($${idx}) OR LOWER(description) LIKE LOWER($${idx}))`,
      );
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(limitNum, offset);

    const result = await pool.query(
      `SELECT * FROM products ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    const categoriesRes = await pool.query(
      "SELECT DISTINCT category FROM products ORDER BY category",
    );
    const categories = categoriesRes.rows.map((r) => r.category);

    sendSuccess(res, {
      products: result.rows,
      total,
      page: pageNum,
      limit: limitNum,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id=$1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return sendError(res, "Product not found", 404);
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ✅ Admin can update ONLY their own product
const updateProduct = async (req, res, next) => {
  try {
    if (!req.user?.id) return sendError(res, "Unauthorized", 401);

    const { name, price, category, image_url, description } = req.body;
    if (!name || price === undefined || !category)
      return sendError(res, "name, price, and category are required", 400);

    const result = await pool.query(
      `UPDATE products
       SET name=$1, price=$2, category=$3, image_url=$4, description=$5
       WHERE id=$6 AND created_by=$7
       RETURNING *`,
      [
        name.trim(),
        parseFloat(price),
        category.trim(),
        image_url || null,
        description || null,
        req.params.id,
        req.user.id, // ✅ owner check
      ],
    );

    if (result.rows.length === 0) {
      return sendError(
        res,
        "Not allowed: you can update only your own products (or product not found)",
        403,
      );
    }

    sendSuccess(res, result.rows[0], "Product updated");
  } catch (err) {
    next(err);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    if (!req.user?.id) return sendError(res, "Unauthorized", 401);

    const result = await pool.query(
      `SELECT * FROM products
       WHERE created_by=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ✅ Admin can delete ONLY their own product
const deleteProduct = async (req, res, next) => {
  try {
    if (!req.user?.id) return sendError(res, "Unauthorized", 401);

    const result = await pool.query(
      `DELETE FROM products
       WHERE id=$1 AND created_by=$2
       RETURNING id`,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return sendError(
        res,
        "Not allowed: you can delete only your own products (or product not found)",
        403,
      );
    }

    sendSuccess(res, null, "Product deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts
};