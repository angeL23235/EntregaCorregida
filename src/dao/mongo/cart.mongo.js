const Cart = require("../../models/cart");
const Product = require("../../models/product");

class CartMongoManager {
  async getAll() {
    return Cart.find().lean();
  }

  async getByIdPopulated(cid) {
    return Cart.findById(cid).populate("products.product").lean();
  }

  async createEmpty() {
    return Cart.create({ products: [] });
  }

  async addProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return { error: "cart_not_found" };

    const prod = await Product.findById(pid);
    if (!prod) return { error: "product_not_found" };

    const item = cart.products.find(p => String(p.product) === String(pid));
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    return cart.populate("products.product");
  }

  async removeProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return { error: "cart_not_found" };

    cart.products = cart.products.filter(p => String(p.product) !== String(pid));
    await cart.save();
    return cart.populate("products.product");
  }

  async replaceProducts(cid, products) {
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) return { error: "cart_not_found" };
    return cart.populate("products.product");
  }

  async updateQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return { error: "cart_not_found" };

    const item = cart.products.find(p => String(p.product) === String(pid));
    if (!item) return { error: "product_not_in_cart" };

    item.quantity = Number(quantity);
    await cart.save();
    return cart.populate("products.product");
  }

  async empty(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) return { error: "cart_not_found" };
    cart.products = [];
    await cart.save();
    return cart.populate("products.product");
  }
}

module.exports = CartMongoManager;
