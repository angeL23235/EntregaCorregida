const socket = io()
const list = document.getElementById('list')
const createForm = document.getElementById('createForm')
const deleteForm = document.getElementById('deleteForm')

const render = items => {
  list.innerHTML = ''
  items.forEach(p => {
    const li = document.createElement('li')
    li.dataset.id = p.id
    li.textContent = `${p.title} — $${p.price} — ${p.category}`
    list.appendChild(li)
  })
}

socket.on('products:update', render)

createForm.addEventListener('submit', e => {
  e.preventDefault()
  const d = new FormData(createForm)
  const payload = {
    title: d.get('title'),
    description: d.get('description'),
    code: d.get('code'),
    price: Number(d.get('price')),
    stock: Number(d.get('stock')),
    category: d.get('category'),
    thumbnails: (d.get('thumbnails')||'').split(',').map(s=>s.trim()).filter(Boolean)
  }
  socket.emit('product:create', payload)
  createForm.reset()
})

deleteForm.addEventListener('submit', e => {
  e.preventDefault()
  const id = new FormData(deleteForm).get('id')
  if (id) socket.emit('product:delete', id)
  deleteForm.reset()
})
