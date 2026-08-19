const API_URL = '/api/products';

const form = document.getElementById('product-form');
const tableBody = document.getElementById('product-table-body');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-edit');
const logoutBtn = document.getElementById('logout-btn');

function isOnlyLetters(str) {
  return !/\d/.test(str);
}

function isOnlyDigits(val) {
  return /^[0-9]+$/.test(String(val).trim());
}

async function fetchProducts() {
  const res = await fetch(API_URL);
  const data = await res.json();
  if (res.status === 401) {
    window.location.href = '/admin/login';
    return;
  }
  renderTable(data.data || []);
}

function renderTable(products) {
  tableBody.innerHTML = products.map((p) => `
    <tr>
      <td class="px-3 py-2">${p.name}</td>
      <td class="px-3 py-2">Rp${Number(p.price).toLocaleString('id-ID')}</td>
      <td class="px-3 py-2">${p.stock}</td>
      <td class="px-3 py-2 flex gap-2">
        <button data-id="${p.id}" class="edit-btn text-blue-600 hover:underline">Edit</button>
        <button data-id="${p.id}" class="delete-btn text-red-600 hover:underline">Hapus</button>
      </td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const priceRaw = document.getElementById('price').value.trim();
  const stockRaw = document.getElementById('stock').value.trim();

  if (name.length > 100) {
    alert('Nama maksimal 100 karakter');
    return;
  }
  if (description.length > 500) {
    alert('Deskripsi maksimal 500 karakter');
    return;
  }
  if (description && !isOnlyLetters(description)) {
    alert('Input hanya boleh berupa huruf');
    return;
  }
  if (!isOnlyDigits(priceRaw)) {
    alert('Input hanya boleh berupa angka');
    return;
  }
  if (stockRaw && !isOnlyDigits(stockRaw)) {
    alert('Input hanya boleh berupa angka');
    return;
  }

  const payload = {
    name,
    description,
    price: Number(priceRaw),
    stock: stockRaw ? Number(stockRaw) : 0,
  };

  const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Gagal menyimpan produk');
    return;
  }

  resetForm();
  fetchProducts();
});

tableBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Yakin hapus produk ini?')) return;
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.message || 'Gagal menghapus produk');
      return;
    }
    fetchProducts();
  }

  if (e.target.classList.contains('edit-btn')) {
    const res = await fetch(API_URL);
    const data = await res.json();
    const product = (data.data || []).find((p) => String(p.id) === id);
    if (!product) return;

    document.getElementById('product-id').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description || '';
    document.getElementById('price').value = product.price;
    document.getElementById('stock').value = product.stock;
    formTitle.textContent = 'Edit Produk';
    cancelBtn.classList.remove('hidden');
  }
});

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  document.getElementById('product-id').value = '';
  formTitle.textContent = 'Tambah Produk';
  cancelBtn.classList.add('hidden');
}

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin/login';
});

fetchProducts();