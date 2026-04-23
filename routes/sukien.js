const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const sukien=require('../controllers/sukienController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/lay-tat-ca', authMiddleware.verifyToken, sukien.getAll);
router.get('/lay-tat-ca-open', authMiddleware.verifyToken, sukien.getAllOpen);
router.post('/them-su-kien', authMiddleware.verifyToken,sukien.themMoiSuKien.bind(sukien));
router.post('/tham-gia-su-kien', authMiddleware.verifyToken,sukien.thamGiaSuKien.bind(sukien));
router.put('/cap-nhat-su-kien', authMiddleware.verifyToken,sukien.capNhatSuKien);
router.delete('/xoa-su-kien/:id', authMiddleware.verifyToken,sukien.xoaSuKien);
router.post('/check-thanh-toan/',sukien.checkThanhToan);
router.get('/check-thanh-toan/',sukien.checkThanhToan);
module.exports=router;