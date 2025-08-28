const express = require('express')
const path = require('path')
const ProductManager = require('../manager/productManager')

const router = express.Router()
const manager = new ProductManager(path.join(__dirname, '..', 'data', 'products.json'))

const isValid = b =>
  typeof b.title==='string' && typeof b.description==='string' &&
  typeof b.code==='string' && typeof b.price==='number' &&
  typeof b.stock==='number' && typeof b.category==='string'

router.get('/', async (_req, res) => {
  try { res.json(await manager.getProducts()) }
  catch { res.status(500).json({ error:'error' }) }
})

router.get('/:pid', async (req, res) => {
  try {
    const p = await manager.getProductById(req.params.pid)
    if (!p) return res.status(404).json({ error:'not_found' })
    res.json(p)
  } catch { res.status(500).json({ error:'error' }) }
})

router.post('/', async (req, res) => {
  try {
    const b = req.body || {}
    if (!isValid(b)) return res.status(400).json({ error:'invalid' })
    const created = await manager.addProduct({
      title:b.title, description:b.description, code:b.code,
      price:b.price, status: typeof b.status==='boolean'?b.status:true,
      stock:b.stock, category:b.category,
      thumbnails: Array.isArray(b.thumbnails)?b.thumbnails:[]
    })
    const io = req.app.get('io')
    if (io) io.emit('products:update', await manager.getProducts())
    res.status(201).json(created)
  } catch { res.status(500).json({ error:'error' }) }
})

router.put('/:pid', async (req, res) => {
  try {
    const b = req.body || {}
    const patch = {}
    if (typeof b.title==='string') patch.title=b.title
    if (typeof b.description==='string') patch.description=b.description
    if (typeof b.code==='string') patch.code=b.code
    if (typeof b.price==='number') patch.price=b.price
    if (typeof b.status==='boolean') patch.status=b.status
    if (typeof b.stock==='number') patch.stock=b.stock
    if (typeof b.category==='string') patch.category=b.category
    if (Array.isArray(b.thumbnails)) patch.thumbnails=b.thumbnails
    const up = await manager.updateProduct(req.params.pid, patch)
    if (!up) return res.status(404).json({ error:'not_found' })
    const io = req.app.get('io')
    if (io) io.emit('products:update', await manager.getProducts())
    res.json(up)
  } catch { res.status(500).json({ error:'error' }) }
})

router.delete('/:pid', async (req, res) => {
  try {
    const ok = await manager.deleteProduct(req.params.pid)
    if (!ok) return res.status(404).json({ error:'not_found' })
    const io = req.app.get('io')
    if (io) io.emit('products:update', await manager.getProducts())
    res.sendStatus(204)
  } catch { res.status(500).json({ error:'error' }) }
})

module.exports = router
