const { Product } = require('../models');

async function renderHome(req, res) {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    const storeName = process.env.STORE_NAME || 'Toko Kita';

    res.render('index', {
      products: products.map((p) => p.toJSON()),
      storeName,
    });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman: ' + err.message);
  }
}

function renderAdminLogin(req, res) {
  res.render('admin-login', { storeName: 'Toko Kita' }); // sesuaikan storeName kalau beda
}

function renderAdminProducts(req, res) {
  res.render('admin-products', { storeName: 'Toko Kita' });
}

module.exports = { renderHome, renderAdminLogin, renderAdminProducts   };
