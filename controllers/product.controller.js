const { Product } = require('../models');
const sendResponse = require('../utils/response');

// cuma boleh huruf & spasi, gak boleh ada digit sama sekali
function isOnlyLetters(str) {
  return !/\d/.test(str);
}

// cuma boleh digit 0-9, gak boleh huruf apapun (termasuk 'e'), minus, titik, koma, atau spasi
function isOnlyDigits(val) {
  return /^[0-9]+$/.test(String(val).trim());
}

async function getProducts(req, res) {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    return sendResponse(res, { message: 'Berhasil ambil produk', data: products });
  } catch (err) {
    return sendResponse(res, { code: 500, success: false, message: err.message });
  }
}

async function addProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || price === undefined) {
      return sendResponse(res, { code: 400, success: false, message: 'name dan price wajib diisi' });
    }

    if (name.length > 100) {
      return sendResponse(res, { code: 400, success: false, message: 'Nama maksimal 100 karakter' });
    }

    if (description && description.length > 500) {
      return sendResponse(res, { code: 400, success: false, message: 'Deskripsi maksimal 500 karakter' });
    }

    if (description && !isOnlyLetters(description)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa huruf' });
    }

    if (!isOnlyDigits(price)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa angka' });
    }

    if (stock !== undefined && !isOnlyDigits(stock)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa angka' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
    });
    return sendResponse(res, { code: 201, message: 'Produk berhasil ditambahkan', data: product });
  } catch (err) {
    return sendResponse(res, { code: 500, success: false, message: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return sendResponse(res, { code: 404, success: false, message: 'Produk tidak ditemukan' });
    }

    if (name !== undefined && name.length > 100) {
      return sendResponse(res, { code: 400, success: false, message: 'Nama maksimal 100 karakter' });
    }

    if (description !== undefined && description.length > 500) {
      return sendResponse(res, { code: 400, success: false, message: 'Deskripsi maksimal 500 karakter' });
    }

    if (description !== undefined && !isOnlyLetters(description)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa huruf' });
    }

    if (price !== undefined && !isOnlyDigits(price)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa angka' });
    }

    if (stock !== undefined && !isOnlyDigits(stock)) {
      return sendResponse(res, { code: 400, success: false, message: 'Input hanya boleh berupa angka' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    await product.save();

    return sendResponse(res, { message: 'Produk berhasil diupdate', data: product });
  } catch (err) {
    return sendResponse(res, { code: 500, success: false, message: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return sendResponse(res, { code: 404, success: false, message: 'Produk tidak ditemukan' });
    }

    await product.destroy();
    return sendResponse(res, { message: 'Produk berhasil dihapus' });
  } catch (err) {
    return sendResponse(res, { code: 500, success: false, message: err.message });
  }
}

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };