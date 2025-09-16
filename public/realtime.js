const socket = io();

const $list = document.querySelector('#list');
const $create = document.querySelector('#createForm');
const $delete = document.querySelector('#deleteForm');

function render(products) {
  if (!$list) return;
  $list.innerHTML = products.map(p =>
    `<li data-id="${p._id}">${p.title} — $${p.price} — ${p.category}</li>`
  ).join('');
}

socket.on('products:update', (products) => render(products));

$create?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData($create);
  const body = {
    title: fd.get('title'),
    description: fd.get('description'),
    code: fd.get('code'),
    price: Number(fd.get('price')),
    stock: Number(fd.get('stock')),
    category: fd.get('category'),
    thumbnails: (fd.get('thumbnails') || '').split(',').map(s => s.trim()).filter(Boolean),
    status: true
  };
  socket.emit('product:create', body);
  $create.reset();
});

$delete?.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = new FormData($delete).get('id');
  if (!id) return;
  socket.emit('product:delete', id);
  $delete.reset();
});

$list?.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const id = li.getAttribute('data-id');
  const input = $delete.querySelector('input[name="id"]');
  if (input) input.value = id;
});
