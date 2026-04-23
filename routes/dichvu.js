const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const dichvu = require("../controllers/dichvuController");
const authMiddleware = require("../middleware/authMiddleware");

// Cấu hình multer để lưu ảnh vào uploads/images/
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/images"),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
router.get("/lay-tat-ca", authMiddleware.verifyToken, dichvu.getData);
router.get("/lay-tat-ca-by-id/:id", dichvu.getDataById);
router.get("/lay-tat-ca-open", dichvu.getDataOpen);
router.post("/them-dich-vu", dichvu.themDichVu);
router.put("/cap-nhat-dich-vu", dichvu.capnhatDichVu);
router.delete("/xoa-dich-vu/:id", dichvu.xoaDichVu);
module.exports = router;
