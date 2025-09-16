require("dotenv").config();

const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const Cart = require("./src/models/cart");


// Modelos
const Product = require("./src/models/product");

// Routers
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
      eq: (a, b) => String(a) === String(b), // 👈 helper de igualdad
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
  const products = await Product.find().lean();
  res.render("home", { title: "Productos", products });
});

app.get("/realtimeproducts", async (_req, res) => {
  const products = await Product.find().lean();
  res.render("realTimeProducts", {
    title: "Productos en tiempo real",
    products,
  });
});

app.get("/products", async (req, res) => {
  const { page = 1, limit = 4, sort, query, cid } = req.query; // ⬅️ default 4

  const filter = {};
  if (query) {
    if (query === "available") filter.status = true;
    else filter.category = query;
  }

  const sortOpt = {};
  if (sort === "asc") sortOpt.price = 1;
  if (sort === "desc") sortOpt.price = -1;

  const lim = parseInt(limit) || 4;      // ⬅️ fallback 4
  const pg  = parseInt(page)  || 1;

  const result = await Product.paginate(filter, {
    page: pg,
    limit: lim,
    sort: sortOpt,
    lean: true,
  });

  const base = "/products";
  const qs = (p) => {
    const sp = new URLSearchParams({ page: p, limit: lim }); // ⬅️ mantiene 4
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
    limit: lim
  });
});


app.get("/products/:pid", async (req, res) => {
  const product = await Product.findById(req.params.pid).lean();
  if (!product) return res.status(404).send("Producto no encontrado");
  const { cid } = req.query;
  res.render("productDetail", { title: product.title, product, cartId: cid || "" });
});

app.get("/carts/:cid", async (req, res) => {
  const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
  if (!cart) return res.status(404).send("Carrito no encontrado");
  res.render("cartView", { title: `Carrito ${req.params.cid}`, cart });
});


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado en WebSocket");

  const products = await Product.find().lean();
  io.emit("products:update", products);

  socket.on("product:create", async (body) => {
    try {
      await Product.create({
        title: body.title,
        description: body.description,
        code: body.code, // ¡debe ser único!
        price: body.price,
        status: typeof body.status === "boolean" ? body.status : true,
        stock: body.stock,
        category: body.category,
        thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : [],
      });
      const list = await Product.find().lean();
      io.emit("products:update", list);
    } catch (err) {
      // Aviso útil en tiempo real si el code está duplicado
      if (err && err.code === 11000) {
        socket.emit("products:error", {
          message: `El código "${body.code}" ya existe.`,
        });
      }
      console.error("Error creando producto:", err.message);
    }
  });

  socket.on("product:delete", async (id) => {
    try {
      if (!id) return;
      await Product.findByIdAndDelete(id);
      const list = await Product.find().lean();
      io.emit("products:update", list);
    } catch (err) {
      console.error("Error eliminando producto:", err.message);
    }
  });
});

// ---------- Conexión a Mongo y arranque del server ----------
const PORT = process.env.PORT || 8080;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/prueba_DB";

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("DB conectada →", mongoose.connection.name);
    console.log("Host →", mongoose.connection.host);

    httpServer.listen(PORT, () => {
      console.log(`✅ Server listo → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error MongoDB:", err.message);
    process.exit(1);
  }
})();
