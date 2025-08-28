const express = require('express')
const path = require('path')
const CartManager = require('../manager/cartManager')

const router = express.Router()
const manager = new CartManager(path.join(__dirname, '..', 'data', 'cart.json'))

router.get('/', async (_req, res) => {
  try { res.json(await manager.getCarts()) }
  catch { res.status(500).json({ error:'error' }) }
})

router.get('/:cid', async (req, res) => {
  try {
    const c = await manager.getCartById(req.params.cid)
    if (!c) return res.status(404).json({ error:'not_found' })
    res.json(c)
  } catch { res.status(500).json({ error:'error' }) }
})

router.post('/', async (_req, res) => {
  try { res.status(201).json(await manager.createCart()) }
  catch { res.status(500).json({ error:'error' }) }
})

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const c = await manager.addProductToCart(req.params.cid, req.params.pid)
    if (!c) return res.status(404).json({ error:'not_found' })
    res.json(c)
  } catch { res.status(500).json({ error:'error' }) }
})

module.exports = router
