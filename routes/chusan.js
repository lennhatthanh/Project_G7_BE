const express = require('express')
const router = express.Router('router')
const chusanController = require('../controllers/chusanController')
const authMiddleware = require('../middleware/authMiddleware')

router.post("/them-moi-chu-san",authMiddleware.verifyToken ,chusanController.themMoiChuSan)
router.put("/cap-nhat-chu-san",authMiddleware.verifyToken,chusanController.capNhatChuSan)
router.put("/cap-nhat-chu-san-open",authMiddleware.verifyToken,chusanController.capNhatChuSanOpen)
router.put("/doi-mat-khau-chu-san",authMiddleware.verifyToken,chusanController.changePassword)
router.delete("/xoa-chu-san/:id",authMiddleware.verifyToken,chusanController.xoaChuSan)
router.get("/get-all",authMiddleware.verifyToken,chusanController.getAllChuSan)
router.get("/get-chu-san",authMiddleware.verifyToken,chusanController.getChuSan)
router.get("/kiem-tra-chu-san",authMiddleware.verifyToken,chusanController.kiemTraChuSan)

module.exports = router;