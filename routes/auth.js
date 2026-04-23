const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.post("/dang-ky", authController.dangky);
router.post("/dang-nhap", authController.dangNhap.bind(authController));
router.post("/dang-nhap-chu-san",authController.dangNhapChuSan.bind(authController));
router.post("/dang-nhap-nhan-vien",authController.dangNhapNhanVien.bind(authController));
router.post("/dang-nhap-admin",authController.dangNhapAdmin.bind(authController));

router.post("/refresh", authController.reqRefreshToken.bind(authController));

router.get("/dang-xuat", authMiddleware.verifyToken, authController.dangXuat);
router.get("/verify", authController.xacThucEmail);

module.exports = router;
