const express = require('express');
const router = express.Router();
const { renderHome, renderAdminLogin, renderAdminProducts } = require('../controllers/page.controller');
const { requireAdminPage } = require('../middlewares/auth.middleware');

router.get('/', renderHome);
router.get('/admin/login', renderAdminLogin);
router.get('/admin/products', requireAdminPage, renderAdminProducts);

module.exports = router;