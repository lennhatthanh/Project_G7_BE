const express = require('express')
const router = express.Router('router')
const adminController = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

router.get("/kiem-tra-admin",authMiddleware.verifyToken,adminController.kiemTraAdmin)

module.exports = router;