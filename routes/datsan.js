const express = require('express')
const router = express.Router('router')
const datsanController = require('../controllers/datsanController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/thanh-toan/',authMiddleware.verifyTokenDatSan, datsanController.thanhToan.bind(datsanController))
router.get('/check-thanh-toan/:id_san', datsanController.checkThanhToan)
router.post('/check-thanh-toan/:id_san', datsanController.checkThanhToan)
router.get('/lich-su-dat-san', authMiddleware.verifyToken, datsanController.lichSuDatSan)
router.get('/lich-su-dat-san-nhan-vien', authMiddleware.verifyToken, datsanController.lichSuDatSanAll)
router.get('/lich-su-dat-san-chu-san', authMiddleware.verifyToken, datsanController.lichSuDatSanAllChuSan)

module.exports = router