const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')

class CartManager {
  constructor(p){ this.path = p }
  async getCarts(){
    try{ return JSON.parse(await fs.readFile(this.path,'utf8')) || [] }
    catch{ await fs.writeFile(this.path, JSON.stringify([],null,2)); return [] }
  }
  async createCart(){
    const all = await this.getCarts()
    const nc = { id: uuidv4(), products: [] }
    all.push(nc)
    await fs.writeFile(this.path, JSON.stringify(all,null,2))
    return nc
  }
  async getCartById(id){
    const all = await this.getCarts()
    return all.find(c => String(c.id)===String(id))
  }
  async addProductToCart(cid, pid){
    const all = await this.getCarts()
    const c = all.find(x => String(x.id)===String(cid))
    if (!c) return null
    const e = c.products.find(p => String(p.product)===String(pid))
    if (e) e.quantity += 1
    else c.products.push({ product: pid, quantity: 1 })
    await fs.writeFile(this.path, JSON.stringify(all,null,2))
    return c
  }
}
module.exports = CartManager
