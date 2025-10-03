const Product = require("../../models/product");

class ProductMongoManager {
  async paginate({ limit = 10, page = 1, sort, query }) {
    const filter = {};
    if (query) {
      if (query === "available") filter.status = true;
      else filter.category = query;
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const options = { limit, page, sort: sortOption, lean: true };
    return Product.paginate(filter, options);
  }

  async getById(id) {
    return Product.findById(id).lean();
  }

  async create(data) {
    const payload = {
      title: data.title,
      description: data.description,
      code: data.code,
      price: data.price,
      status: typeof data.status === "boolean" ? data.status : true,
      stock: data.stock,
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : []
    };
    return Product.create(payload);
  }

  async update(id, patch) {
    return Product.findByIdAndUpdate(id, patch, { new: true }).lean();
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

module.exports = ProductMongoManager;
