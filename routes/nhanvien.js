const express = require('express')
const router = express.Router('router')
const nhanvienController = require('../controllers/nhanvienController')
const authMiddleware = require('../middleware/authMiddleware')

router.post("/them-moi-nhan-vien",authMiddleware.verifyToken ,nhanvienController.themMoiNhanVien)
router.put("/cap-nhat-nhan-vien",authMiddleware.verifyToken,nhanvienController.capNhatNhanVien)
router.put("/cap-nhat-nhan-vien-open",authMiddleware.verifyToken,nhanvienController.capNhatNhanVienOpen)
router.put("/doi-mat-khau-nhan-vien",authMiddleware.verifyToken,nhanvienController.changePassword)
router.delete("/xoa-nhan-vien/:id",authMiddleware.verifyToken,nhanvienController.xoaNhanVien)
router.get("/get-all",authMiddleware.verifyToken,nhanvienController.getAllNhanVien)
router.get("/get-nhan-vien",authMiddleware.verifyToken,nhanvienController.getNhanVien)
router.get("/get-all-chu-san",authMiddleware.verifyToken,nhanvienController.getAllByChuSan)
router.get("/kiem-tra-nhan-vien",authMiddleware.verifyToken,nhanvienController.kiemTraNhanVien)

module.exports = router;