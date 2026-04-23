const express =require('express');
const router=express.Router();
const magiamgia=require('../controllers/magiamgiaController');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/them-ma-giam-gia',magiamgia.themMaGiamGia);
router.put('/cap-nhat-ma-giam-gia',magiamgia.capnhatMaGiamGia);
router.delete('/xoa-ma-giam-gia/:id',magiamgia.xoaMaGiamGia);
router.get('/lay-ma-giam-gia', authMiddleware.verifyToken ,magiamgia.layTatCa);
router.post('/kiem-tra-ma-giam-gia', magiamgia.kiemTraMa);
module.exports=router;