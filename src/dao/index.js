const path = require("path");

// Mongo managers
const ProductMongoManager = require("./mongo/product.mongo");
const CartMongoManager = require("./mongo/cart.mongo");

// FS managers (opcional para desarrollo local)
const ProductFSManager = require("../manager/productManager");
const CartFSManager = require("../manager/cartManager");

const persistence = (process.env.PERSISTENCE || "MONGO").toUpperCase();

let productsDAO;
let cartsDAO;

if (persistence === "FILE") {
  const dataDir = path.join(__dirname, "..", "data");
  productsDAO = new ProductFSManager(path.join(dataDir, "products.json"));
  cartsDAO = new CartFSManager(path.join(dataDir, "cart.json"));
  console.log("[DAO] Usando FILE system managers");
} else {
  productsDAO = new ProductMongoManager();
  cartsDAO = new CartMongoManager();
  console.log("[DAO] Usando Mongo managers");
}

module.exports = { productsDAO, cartsDAO };
