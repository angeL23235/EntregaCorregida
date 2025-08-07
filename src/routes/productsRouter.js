const express = require('express');
const router = express.Router();
const path = require('path');
const ProductManager = require('../manager/productManager')

const manager = new ProductManager(path.join(__dirname, '../Data/products.json'));

router.get('/', async (req, res) => {
const products = await manager.getProducts();
res.json(products);
});

router.get('/:pid', async (req, res) => {
const product = await manager.getProductById(req.params.pid);
product ? res.json(product) : res.status(404).send('Producto no encontrado');
});

router.post('/', async (req, res) => {
const newProduct = await manager.addProduct(req.body);
res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
const updated = await manager.updateProduct(req.params.pid, req.body);
updated ? res.json(updated) : res.status(404).send('Producto no encontrado');
});

router.delete('/:pid', async (req, res) => {
const success = await manager.deleteProduct(req.params.pid);
success ? res.sendStatus(204) : res.status(404).send('Producto no encontrado');
});

module.exports = router;