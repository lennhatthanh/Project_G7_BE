const express=require('express');
const router=express.Router();
const thongbao=require('../controllers/thongkeController');
const authMiddleware = require('../middleware/authMiddleware')

router.get('/dat-san',authMiddleware.verifyToken,thongbao.datsan)
router.get('/doanh-thu',authMiddleware.verifyToken,thongbao.doanhthu)
router.get('/su-kien',authMiddleware.verifyToken,thongbao.sukien)
module.exports=router;