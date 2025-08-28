const path = require('path')
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const exphbs = require('express-handlebars')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const productsRouter = require('./src/routes/productsRouter')
const cartsRouter = require('./src/routes/cartsRouter')

app.engine('handlebars', exphbs.engine({
  layoutsDir: path.join(__dirname, 'src', 'views', 'layout'),
  defaultLayout: 'main'
})) 
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'src', 'views'))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, _res, next) => { req.app.set('io', io); next() })

const ProductManager = require('./src/manager/productManager')
const pm = new ProductManager(path.join(__dirname, 'src', 'data', 'products.json'))

app.get('/', async (req, res) => {
  const products = await pm.getProducts()
  res.render('home', { products })
})

app.get('/realtimeproducts', async (req, res) => {
  const products = await pm.getProducts()
  res.render('realTimeProducts', { products })
})

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

io.on('connection', async socket => {
  const products = await pm.getProducts()
  io.emit('products:update', products)

  socket.on('product:create', async body => {
    const ok =
      body && typeof body.title==='string' && typeof body.description==='string' &&
      typeof body.code==='string' && typeof body.price==='number' &&
      typeof body.stock==='number' && typeof body.category==='string'
    if (!ok) return
    await pm.addProduct({
      title: body.title,
      description: body.description,
      code: body.code,
      price: body.price,
      status: typeof body.status==='boolean' ? body.status : true,
      stock: body.stock,
      category: body.category,
      thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : []
    })
    const list = await pm.getProducts()
    io.emit('products:update', list)
  })

  socket.on('product:delete', async id => {
    if (!id) return
    await pm.deleteProduct(id)
    const list = await pm.getProducts()
    io.emit('products:update', list)
  })
})


const PORT =  8080
httpServer.listen(PORT, () => {
  console.log(`Server ready → http://localhost:${PORT}`)
})

