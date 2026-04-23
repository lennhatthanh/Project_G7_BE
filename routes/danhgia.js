const express =require('express');
const router=express.Router();
const danhgiaController = require("../controllers/danhgiaController");
const authMiddleware = require('../middleware/authMiddleware');

router.post("/them-moi-danh-gia",authMiddleware.verifyToken,danhgiaController.themMoiDanhGia)
router.put("/cap-nhat-danh-gia",authMiddleware.verifyToken,danhgiaController.capNhatDanhGia)
router.delete("/xoa-danh-gia/:id",authMiddleware.verifyToken,danhgiaController.xoaDanhGia)
router.get("/lay-du-lieu",danhgiaController.getAll)

module.exports = router