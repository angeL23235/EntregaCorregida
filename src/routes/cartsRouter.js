const express = require("express");
const { cartsDAO } = require("../dao");
const router = express.Router();

// GET todos los carritos
router.get("/", async (_req, res) => {
  try {
    const carts = await cartsDAO.getAll();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartsDAO.getByIdPopulated(req.params.cid);
    if (!cart) return res.status(404).json({ error: "not_found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear carrito
router.post("/", async (_req, res) => {
  try {
    const newCart = await cartsDAO.createEmpty();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const out = await cartsDAO.addProduct(req.params.cid, req.params.pid);
    if (out?.error === "cart_not_found") return res.status(404).json({ error: "cart_not_found" });
    if (out?.error === "product_not_found") return res.status(404).json({ error: "product_not_found" });
    res.json(await out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const out = await cartsDAO.removeProduct(req.params.cid, req.params.pid);
    if (out?.error === "cart_not_found") return res.status(404).json({ error: "cart_not_found" });
    res.json(await out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const out = await cartsDAO.replaceProducts(req.params.cid, req.body?.products || []);
    if (out?.error === "cart_not_found") return res.status(404).json({ error: "cart_not_found" });
    res.json(await out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const out = await cartsDAO.updateQuantity(req.params.cid, req.params.pid, req.body?.quantity);
    if (out?.error === "cart_not_found") return res.status(404).json({ error: "cart_not_found" });
    if (out?.error === "product_not_in_cart") return res.status(404).json({ error: "product_not_in_cart" });
    res.json(await out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const out = await cartsDAO.empty(req.params.cid);
    if (out?.error === "cart_not_found") return res.status(404).json({ error: "cart_not_found" });
    res.json(await out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
