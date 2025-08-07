const express = require('express');
const productsRouter = require('./routes/productsRouter'); 
const cartsRouter = require('./routes/cartsRouter');        
const app = express();
app.use(express.json());

app.use('/images', express.static('images'));

app.get('/', (req, res) => {
  res.send('Ya entraste crack');
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
