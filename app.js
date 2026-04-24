require('dotenv').config(); 
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');


var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var nguoidungRouter = require('./routes/nguoidung');
var chusanRouter = require('./routes/chusan');
var adminRouter = require('./routes/admin');
var nhanvienRouter = require('./routes/nhanvien');
var dichvuRouter=require('./routes/dichvu');
var monchoiRouter=require('./routes/monchoi');
var vitrisanRouter=require('./routes/vitrisan');
var sanchoiRouter=require('./routes/san');
var thongbaoRouter=require('./routes/thongbao');
var danhgiaRouter = require('./routes/danhgia')
var magiamgiaRouter = require('./routes/magiamgia')
var datsanRouter = require('./routes/datsan')
var sukienRouter = require('./routes/sukien')
var thongkeRouter = require('./routes/thongke')
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride());
app.use(cors({
  origin: "https://lnnhatthanh.id.vn",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log("DB_HOST =", process.env.DB_HOST);
app.use('/', indexRouter);
app.use('/auth',authRouter);
app.use('/nguoi-dung',nguoidungRouter);
app.use('/chu-san',chusanRouter);
app.use('/nhan-vien',nhanvienRouter)
app.use('/admin',adminRouter);
app.use('/dich-vu',dichvuRouter);
app.use('/mon-choi',monchoiRouter);
app.use('/vi-tri-san',vitrisanRouter);
app.use('/san',sanchoiRouter);
app.use('/thong-bao',thongbaoRouter);
app.use('/danh-gia',danhgiaRouter);
app.use('/ma-giam-gia',magiamgiaRouter);
app.use('/dat-san',datsanRouter);
app.use('/su-kien',sukienRouter);
app.use('/thong-ke',thongkeRouter);
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date()
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
