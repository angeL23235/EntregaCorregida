require("dotenv").config();

const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const { connectDB } = require("./src/config/db");
const { productsDAO, cartsDAO } = require("./src/dao");
const productsRouter = require("./src/routes/productsRouter");
const cartsRouter = require("./src/routes/cartsRouter");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.engine(
  "handlebars",
  exphbs.engine({
    layoutsDir: path.join(__dirname, "src", "views", "layout"),
    defaultLayout: "main",
    helpers: {
      eq: (a, b) => String(a) === String(b),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, _res, next) => {
  req.app.set("io", io);
  next();
});

app.get("/", async (_req, res) => {
  try {
    const result = await productsDAO.paginate({ limit: 100, page: 1 }); 
    res.render("home", { title: "Productos", products: result.docs || [] });
  } catch (err) {
    res.status(500).send("Error cargando productos");
  }
});

app.get("/realtimeproducts", async (_req, res) => {
  try {
    const result = await productsDAO.paginate({ limit: 100, page: 1 });
    res.render("realTimeProducts", {
      title: "Productos en tiempo real",
      products: result.docs || [],
    });
  } catch (err) {
    res.status(500).send("Error cargando productos");
  }
});

app.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 4, sort, query, cid } = req.query;

    const result = await productsDAO.paginate({
      limit: parseInt(limit) || 4,
      page: parseInt(page) || 1,
      sort,
      query,
    });

    const base = "/products";
    const qs = (p) => {
      const sp = new URLSearchParams({
        page: p,
        limit: result.limit || limit || 4,
      });
      if (sort) sp.set("sort", sort);
      if (query) sp.set("query", query);
      if (cid) sp.set("cid", cid);
      return `${base}?${sp.toString()}`;
    };

    res.render("products", {
      title: "Productos (paginado)",
      products: result.docs,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? qs(result.prevPage) : null,
      nextLink: result.hasNextPage ? qs(result.nextPage) : null,
      cartId: cid || "",
      query: query || "",
      sort: sort || "",
      limit: parseInt(limit) || 4,
    });
  } catch (err) {
    res.status(500).send("Error paginando productos");
  }
});

app.get("/products/:pid", async (req, res) => {
  try {
    const product = await productsDAO.getById(req.params.pid);
    if (!product) return res.status(404).send("Producto no encontrado");
    const { cid } = req.query;
    res.render("productDetail", {
      title: product.title,
      product,
      cartId: cid || "",
    });
  } catch (err) {
    res.status(500).send("Error cargando detalle");
  }
});

app.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartsDAO.getByIdPopulated(req.params.cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cartView", { title: `Carrito ${req.params.cid}`, cart });
  } catch (err) {
    res.status(500).send("Error cargando carrito");
  }
});

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado en WebSocket");

  async function emitProducts() {
    const result = await productsDAO.paginate({ limit: 100, page: 1 });
    io.emit("products:update", result.docs || []);
  }

  await emitProducts();

  // Crear producto
  socket.on("product:create", async (body) => {
    try {
      await productsDAO.create(body || {});
      await emitProducts();
    } catch (err) {
      socket.emit("products:error", { message: err.message });
      console.error("Error creando producto:", err.message);
    }
  });

  // Eliminar producto
  socket.on("product:delete", async (id) => {
    try {
      if (!id) return;
      await productsDAO.delete(id);
      await emitProducts();
    } catch (err) {
      console.error("Error eliminando producto:", err.message);
    }
  });
});

const PORT = process.env.PORT || 8080;
const PERSISTENCE = (process.env.PERSISTENCE || "MONGO").toUpperCase();

(async () => {
  try {
    if (PERSISTENCE === "MONGO") {
      await connectDB();
    } else {
      console.log("[DB] Saltando conexión a Mongo (PERSISTENCE=FILE)");
    }

    httpServer.listen(PORT, () => {
      console.log(`✅ Server listo → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar:", err.message);
    process.exit(1);
  }
})();
