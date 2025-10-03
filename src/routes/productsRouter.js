const express = require("express");
const { productsDAO } = require("../dao");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    const result = await productsDAO.paginate({
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
      sort,
      query
    });

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

router.get("/:pid", async (req, res) => {
  try {
    const p = await productsDAO.getById(req.params.pid);
    if (!p) return res.status(404).json({ error: "not_found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await productsDAO.create(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const up = await productsDAO.update(req.params.pid, req.body || {});
    if (!up) return res.status(404).json({ error: "not_found" });
    res.json(up);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const ok = await productsDAO.delete(req.params.pid);
    if (!ok) return res.status(404).json({ error: "not_found" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
