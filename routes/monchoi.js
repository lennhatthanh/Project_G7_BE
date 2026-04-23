const express =require('express');
const router=express.Router();
const monchoi=require('../controllers/monchoiController');
router.post('/them-mon-choi',monchoi.themMonChoi);
router.put('/cap-nhat-mon-choi',monchoi.capnhatMonChoi);
router.delete('/xoa-mon-choi/:id',monchoi.xoaMonChoi);
router.get('/lay-mon-choi',monchoi.layTatCaMonChoi);
router.get('/lay-mon-choi-open',monchoi.layTatCaMonChoiOpen);
module.exports=router;