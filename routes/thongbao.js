const express=require('express');
const router=express.Router();
const thongbao=require('../controllers/thongbaoController');
const authMiddleware = require('../middleware/authMiddleware')
router.post('/them-thong-bao',authMiddleware.verifyToken,thongbao.themThongBao)
router.put('/cap-nhat-thong-bao',authMiddleware.verifyToken,thongbao.capNhatThongBao)
router.delete('/delete-thong-bao/:id',authMiddleware.verifyToken,thongbao.xoaThongBao)
router.get('/lay-thong-bao',authMiddleware.verifyToken,thongbao.layThongBao)
router.get('/lay-thong-bao-open',authMiddleware.verifyToken,thongbao.layThongBaoOpen)
router.post('/gui-thong-bao',authMiddleware.verifyToken,thongbao.guiThongBao)
module.exports=router;