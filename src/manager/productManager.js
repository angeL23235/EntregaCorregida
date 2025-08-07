const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class ProductManager {
constructor(path) {
    this.path = path;
}

async getProducts() {
    try {
    const data = await fs.readFile(this.path, 'utf-8');
    const products = JSON.parse(data);
    return Array.isArray(products) ? products : [];
    } catch (error) {
    await fs.writeFile(this.path, JSON.stringify([], null, 2));
    return [];
    }
}

async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
}

async addProduct(product) {
    const products = await this.getProducts();
    const newProduct = { id: uuidv4(), ...product };
    products.push(newProduct);
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
}

async updateProduct(id, data) {
    const products = await this.getProducts();
    const index = products.findIndex(p => String(p.id).trim() === String(id).trim());

    if (index === -1) return null;

    products[index] = { ...products[index], ...data, id: products[index].id };
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
}


async deleteProduct(id) {
    const products = await this.getProducts();
    const updated = products.filter(p => String(p.id).trim() !== String(id).trim());

    if (products.length === updated.length) return null;

    await fs.writeFile(this.path, JSON.stringify(updated, null, 2));
    return true;
}

}

module.exports = ProductManager;