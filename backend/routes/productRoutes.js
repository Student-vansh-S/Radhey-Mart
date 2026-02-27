const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require("../controllers/productController");

const { protect, requireAdmin } = require("../middleware/auth");

// Public
router.get("/", getProducts);

// Admin specific (static route FIRST)
router.get("/mine", protect, requireAdmin, getMyProducts);

// Dynamic route LAST
router.get("/:id", getProductById);

// Admin actions
router.post("/", protect, requireAdmin, createProduct);
router.put("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

module.exports = router;