const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;




// khi thêm sản phẩm phải là số dương và dạng number
// khi đặt hàng phải trừ đi số lượng tồn kho