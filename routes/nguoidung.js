var express = require('express');
const nguoidungController = require('../controllers/nguoidungController');
const authMiddleware = require('../middleware/authMiddleware');
var router = express.Router();

router.put("/cap-nhat-nguoi-dung",authMiddleware.verifyToken,nguoidungController.capNhatNguoiDung)
router.put("/cap-nhat-nguoi-dung-open",authMiddleware.verifyToken,nguoidungController.capNhatNguoiDungOpen)
router.put("/doi-mat-khau-nguoi-dung",authMiddleware.verifyToken,nguoidungController.changePassword)
router.delete("/xoa-nguoi-dung/:id",authMiddleware.verifyToken,nguoidungController.xoaNguoiDung)
router.get("/get-all",authMiddleware.verifyToken,nguoidungController.getAllNguoiDung)
router.get("/get-nguoi-dung",authMiddleware.verifyToken,nguoidungController.getNguoiDung)
router.get("/kiem-tra-nguoi-dung",authMiddleware.verifyToken ,nguoidungController.kiemTraNguoiDung)


module.exports = router;
