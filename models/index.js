'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Đường dẫn tới file config của bạn
// Đảm bảo file config/config.js có thông tin DB PostgreSQL của bạn
const allConfig = require(__dirname + '/../config/config.js');
const config = allConfig[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 1. Tự động đọc tất cả các file .js trong thư mục này (ngoại trừ chính file index.js)
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // 2. Khởi tạo từng Model bằng cách truyền instance sequelize và DataTypes vào function export của Model đó
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 3. Sau khi tất cả Model đã được nạp, thực hiện chạy hàm associate để nối khóa ngoại (Foreign Keys)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 4. Export instance kết nối và tất cả các Model dưới dạng một Object duy nhất
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;