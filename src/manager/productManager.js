const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')

class ProductManager {
  constructor(p){ this.path = p }
  async getProducts(){
    try{ return JSON.parse(await fs.readFile(this.path,'utf8')) || [] }
    catch{ await fs.writeFile(this.path, JSON.stringify([],null,2)); return [] }
  }
  async getProductById(id){
    const all = await this.getProducts()
    return all.find(p => String(p.id)===String(id))
  }
  async addProduct(product){
    const all = await this.getProducts()
    const np = { id: uuidv4(), ...product }
    all.push(np)
    await fs.writeFile(this.path, JSON.stringify(all,null,2))
    return np
  }
  async updateProduct(id, data){
    const all = await this.getProducts()
    const i = all.findIndex(p => String(p.id)===String(id))
    if (i===-1) return null
    all[i] = { ...all[i], ...data, id: all[i].id }
    await fs.writeFile(this.path, JSON.stringify(all,null,2))
    return all[i]
  }
  async deleteProduct(id){
    const all = await this.getProducts()
    const upd = all.filter(p => String(p.id)!==String(id))
    if (upd.length===all.length) return null
    await fs.writeFile(this.path, JSON.stringify(upd,null,2))
    return true
  }
}
module.exports = ProductManager
    