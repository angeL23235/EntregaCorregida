const express = require("express");
const Product = require("../models/product"); // <- ruta corregida
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const filter = {};
    if (query) {
      if (query === "available") filter.status = true;
      else filter.category = query;
    }

    // Ordenamiento por precio
    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const options = { limit, page, sort: sortOption, lean: true };

    const result = await Product.paginate(filter, options);

    
    const makeLink = (p) => {
      const params = new URLSearchParams({ limit, page: p });
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      return `${req.baseUrl}?${params.toString()}`;
    };

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? makeLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? makeLink(result.nextPage) : null
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// GET un producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const p = await Product.findById(req.params.pid).lean();
    if (!p) return res.status(404).json({ error: "not_found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: "error" });
  }
});

// POST crear producto
router.post("/", async (req, res) => {
  try {
    const b = req.body || {};
    const created = await Product.create({
      title: b.title,
      description: b.description,
      code: b.code,
      price: b.price,
      status: typeof b.status === "boolean" ? b.status : true,
      stock: b.stock,
      category: b.category,
      thumbnails: Array.isArray(b.thumbnails) ? b.thumbnails : []
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar producto
router.put("/:pid", async (req, res) => {
  try {
    const patch = req.body || {};
    const up = await Product.findByIdAndUpdate(req.params.pid, patch, {
      new: true
    }).lean();
    if (!up) return res.status(404).json({ error: "not_found" });
    res.json(up);
  } catch {
    res.status(500).json({ error: "error" });
  }
});

// DELETE eliminar producto
router.delete("/:pid", async (req, res) => {
  try {
    const ok = await Product.findByIdAndDelete(req.params.pid);
    if (!ok) return res.status(404).json({ error: "not_found" });
    res.sendStatus(204);
  } catch {
    res.status(500).json({ error: "error" });
  }
});

module.exports = router;
