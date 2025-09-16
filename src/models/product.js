const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    code: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    status: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, index: true },
    thumbnails: { type: [String], default: [] }
  },
  { timestamps: true, collection: "productos" } // <<--- usa esta colección
);

productSchema.plugin(mongoosePaginate);

// tercer argumento explícito = nombre de la colección
module.exports = mongoose.model("Product", productSchema, "productos");
