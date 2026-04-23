const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const vitrisan = require('../controllers/sanchoiController');
const authMiddleware = require('../middleware/authMiddleware');

// Cấu hình multer để lưu ảnh vào uploads/images/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/images'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
router.post('/them-san', authMiddleware.verifyToken, upload.single('hinh_anh'), vitrisan.themSan);
router.put('/cap-nhat-san', authMiddleware.verifyToken, upload.single('hinh_anh'), vitrisan.capnhatSan);
router.delete('/xoa-san/:id', vitrisan.xoaSan);
router.get('/lay-tat-ca', authMiddleware.verifyToken, vitrisan.laySanTheoChuSan);
router.get('/lay-tat-ca-chu-san-open', authMiddleware.verifyToken, vitrisan.laySanTheoChuSanOpen);
router.get('/lay-tat-ca-open' , vitrisan.laySanOpen);
router.get('/lay-san-theo-id/:id' , vitrisan.laySanTheoId);

module.exports = router;
