const express = require("express");
const Cart = require("../models/cart");      
const Product = require("../models/product"); 
const router = express.Router();

// GET todos los carritos
router.get("/", async (_req, res) => {
  try {
    const carts = await Cart.find().lean();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).json({ error: "not_found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear carrito
router.post("/", async (_req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "cart_not_found" });

    const prod = await Product.findById(pid);
    if (!prod) return res.status(404).json({ error: "product_not_found" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    res.json(await cart.populate("products.product"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "cart_not_found" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json(await cart.populate("products.product"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // [{ product: id, quantity: N }]
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) return res.status(404).json({ error: "cart_not_found" });
    res.json(await cart.populate("products.product"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "cart_not_found" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ error: "product_not_in_cart" });

    item.quantity = Number(quantity);
    await cart.save();
    res.json(await cart.populate("products.product"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "cart_not_found" });

    cart.products = [];
    await cart.save();
    res.json(await cart.populate("products.product"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
