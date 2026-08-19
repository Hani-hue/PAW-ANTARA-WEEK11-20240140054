const productStore = createStore({
  products: window.__INITIAL_PRODUCTS__ || [],
  filter: 'all', // 'all' | 'available' | 'out'
  searchQuery: '',
});

// komponen badge & card versi JS, paralel sama versi EJS di views/partials
function renderBadge({ label, color }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  };
  const classes = colorMap[color] || colorMap.gray;
  return `<span class="inline-block px-2 py-1 text-xs font-semibold rounded-full border ${classes}">${label}</span>`;
}

function renderProductCard(product) {
  const isAvailable = product.stock > 0;
  const badge = renderBadge({
    label: isAvailable ? 'Tersedia' : 'Habis',
    color: isAvailable ? 'green' : 'red',
  });

  return `
    <div class="product-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" data-stock="${product.stock}">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-800 dark:text-gray-100">${product.name}</h3>
        ${badge}
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${product.description || 'Tanpa deskripsi'}</p>
      <div class="flex items-center justify-between mb-3">
        <span class="text-blue-600 dark:text-blue-400 font-bold">Rp${Number(product.price).toLocaleString('id-ID')}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">Stok: ${product.stock}</span>
      </div>
      <button
        class="add-to-cart-btn w-full ${isAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'} text-sm font-semibold py-2 rounded-lg transition-colors"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        ${isAvailable ? '' : 'disabled'}
      >
        ${isAvailable ? '+ Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  `;
}

function getFilteredProducts(state) {
  let result = state.products;

  if (state.filter === 'available') result = result.filter((p) => p.stock > 0);
  if (state.filter === 'out') result = result.filter((p) => p.stock === 0);

  const query = state.searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }

  return result;
}
function renderResultBadge(state) {
  const container = document.getElementById('result-count-badge');
  if (!container) return;

  const total = getFilteredProducts(state).length;
  container.innerHTML = renderBadge({
    label: `Hasil: ${total} produk`,
    color: total > 0 ? 'green' : 'gray',
  });
}

productStore.subscribe(renderProductList);
productStore.subscribe(renderResultBadge);
renderResultBadge(productStore.getState());

function renderProductList(state) {
  const container = document.getElementById('product-list');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredProducts(state);

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = filtered.map(renderProductCard).join('');
}

productStore.subscribe(renderProductList);

// tombol filter
document.getElementById('filter-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  productStore.setState({ filter: btn.dataset.filter });

  document.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });
  btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  btn.classList.add('bg-blue-600', 'text-white');
});

document.getElementById('search-input').addEventListener('input', (e) => {
  productStore.setState({ searchQuery: e.target.value });
});

/**
 * event delegation buat tombol "Tambah ke Keranjang" - dipasang di container,
 * bukan per-tombol, soalnya tombolnya di-render ulang tiap kali filter berubah.
 * Ini yang nyambungin state produk ke state cart (addToCart ada di cart.js).
 */
document.getElementById('product-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn || btn.disabled) return;

  addToCart({
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: Number(btn.dataset.price),
  });

  // buka keranjang otomatis biar user liat item baru masuk
  cartStore.setState({ isOpen: true });
});
