const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const vitrisan = require('../controllers/sanchoiController');
const authMiddleware = require('../middleware/authMiddleware');

<<<<<<< Updated upstream
// Cấu hình multer để lưu ảnh vào uploads/images/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/images'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
=======
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-west-2',
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3 = new S3Client(s3ClientConfig);

// Cấu hình multer để lưu ảnh vào uploads/images/
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'venues/sanchoi/' + Date.now() + path.extname(file.originalname));
    }
  })
>>>>>>> Stashed changes
});
const upload = multer({ storage });
router.post('/them-san', authMiddleware.verifyToken, upload.single('hinh_anh'), vitrisan.themSan);
router.put('/cap-nhat-san', authMiddleware.verifyToken, upload.single('hinh_anh'), vitrisan.capnhatSan);
router.delete('/xoa-san/:id', vitrisan.xoaSan);
router.get('/lay-tat-ca', authMiddleware.verifyToken, vitrisan.laySanTheoChuSan);
router.get('/lay-tat-ca-chu-san-open', authMiddleware.verifyToken, vitrisan.laySanTheoChuSanOpen);
router.get('/lay-tat-ca-open' , vitrisan.laySanOpen);
router.get('/lay-san-theo-id/:id' , vitrisan.laySanTheoId);

module.exports = router;
