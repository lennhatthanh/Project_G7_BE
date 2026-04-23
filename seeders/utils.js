const { faker } = require('@faker-js/faker');

// ==================== DETERMINISTIC UNIQUENESS ====================

/**
 * Generate deterministic email from index
 * @param {number} index
 * @param {string} type - 'user', 'chusan', 'nhanvien', 'admin'
 * @returns {string}
 */
function generateEmail(index, type = 'user') {
  const prefix = type === 'user' ? `user${index}` : 
                 type === 'chusan' ? `chusan${index}` :
                 type === 'nhanvien' ? `nhanvien${index}` :
                 type === 'admin' ? `admin${index}` :
                 `user${index}`;
  return `${prefix}@sportsbook.vn`;
}

/**
 * Generate deterministic phone number from index
 * @param {number} index
 * @returns {string}
 */
function generatePhone(index) {
  const paddedIndex = String(index).padStart(8, '0');
  return `09${paddedIndex}`;
}

/**
 * Generate deterministic orderCode
 * @param {number} index
 * @param {Date} baseDate - date of booking
 * @returns {string}
 */
function generateOrderCode(index, baseDate = new Date()) {
  const timestamp = baseDate.getTime();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER-${timestamp}-${String(index).padStart(6, '0')}-${randomSuffix}`;
}

// ==================== DATE UTILITIES ====================

/**
 * Get date range from past 3 months to future 3 months
 * @returns {{pastStart: Date, pastEnd: Date, futureStart: Date, futureEnd: Date}}
 */
function getDateRange() {
  const now = new Date();
  const pastStart = new Date(now);
  pastStart.setMonth(pastStart.getMonth() - 3);
  
  const futureEnd = new Date(now);
  futureEnd.setMonth(futureEnd.getMonth() + 3);
  
  return {
    pastStart,
    pastEnd: now,
    futureStart: now,
    futureEnd
  };
}

/**
 * Generate random date within range
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Date}
 */
function randomDateBetween(startDate, endDate) {
  return new Date(
    startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  );
}

/**
 * Generate random booking time (opening hours: 6:00 - 23:00)
 * @returns {string} HH:MM format
 */
function randomBookingTime() {
  const hour = Math.floor(Math.random() * 18) + 6; // 6 to 23
  const minute = [0, 30][Math.floor(Math.random() * 2)]; // 0 or 30 minute slots
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

// ==================== VIETNAMESE NAMES & DESCRIPTIONS ====================

/**
 * Generate Vietnamese full name
 * @returns {string}
 */
function generateVietnameseName() {
  const firstNames = ['Nguyễn', 'Trần', 'Hoàng', 'Phạm', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Minh', 'Công', 'Huy', 'Khôi', 'Duy', 'Quốc', 'Hữu', 'Anh', 'Vy', 'Nam', 'Phương'];
  const lastNames = ['An', 'Anh', 'Bình', 'Chung', 'Dũng', 'Dương', 'Hạnh', 'Hiệp', 'Hoa', 'Hoàn', 'Hùng', 'Hương', 'Khánh', 'Khoa', 'Khôi', 'Linh', 'Long', 'Lợi', 'Lực', 'Luyến', 'Lý', 'Mạnh', 'Minh', 'Mộng', 'Mưa', 'Nam', 'Nhanh', 'Nghiên', 'Nghị', 'Nghĩa', 'Nhân', 'Nhật', 'Niên', 'Ninh', 'Nõn', 'Nữ', 'Oanh', 'Ơn', 'Phát', 'Phiên', 'Phó', 'Phong', 'Phúc', 'Phước', 'Phương', 'Quân', 'Quảng', 'Quế', 'Quyên', 'Quyết', 'Quý', 'Rin', 'Sâm', 'Sang', 'Sánh', 'Sinh', 'Song', 'Số', 'Sơn', 'Su', 'Suất', 'Sung', 'Suôn', 'Tài', 'Tâm', 'Tân', 'Tâng', 'Thái', 'Thanh', 'Thao', 'Thắng', 'Thắm', 'Thân', 'Thảo', 'Thế', 'Thiên', 'Thiên', 'Thiệm', 'Thiên', 'Thiên', 'Thịnh', 'Thạo', 'Thi', 'Thích', 'Thiệp', 'Thị', 'Thịnh', 'Thọ', 'Thống', 'Thơm', 'Thơn', 'Thớt', 'Thú', 'Thư', 'Thục', 'Thừa', 'Thương', 'Thương', 'Thụ', 'Thúy', 'Tích', 'Tiến', 'Tiêu', 'Tiếp', 'Tiết', 'Tín', 'Tính', 'Tính', 'Tình', 'Tinh', 'Tít', 'Toàn', 'Toan', 'Tóc', 'Tọn', 'Tông', 'Tong', 'Tóp', 'Toquý', 'Toàn', 'Tộc', 'Tối', 'Tọi', 'Tộn', 'Tông', 'Tớ', 'Tớm', 'Tư', 'Tư', 'Tương', 'Tuấn', 'Tuân', 'Tức', 'Tuduy', 'Tuế', 'Tuệ', 'Tuệ', 'Tưởng', 'Túi', 'Tuấn', 'Tụi', 'Tuấn', 'Tuấn', 'Tulệnh', 'Tulệnh', 'Tuần', 'Tuần', 'Tuấn', 'Tuấn', 'Tuấn', 'Tuấn'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${middleName} ${lastName}`;
}

/**
 * Get game types
 * @returns {Array}
 */
function getGameTypes() {
  return [
    { name: 'Bóng Đá', description: 'Môn thể thao vua' },
    { name: 'Cầu Lông', description: 'Môn thể thao các champions' },
    { name: 'Tennis', description: 'Quần vợt chuyên nghiệp' },
    { name: 'Bóng Chuyền', description: 'Bóng chuyền phong trào' },
    { name: 'Bóng Rổ', description: 'Basket bóng rổ' },
    { name: 'Badminton', description: 'Cầu lông quốc tế' },
    { name: 'Bóng Bàn', description: 'Bàn nước ngoài' }
  ];
}

/**
 * Get service types
 * @returns {Array}
 */
function getServiceTypes() {
  return [
    'Nước uống lạnh',
    'Khăn tắm cao cấp',
    'Đặc biệt huấn luyện',
    'Cho thuê trang bị',
    'Phục vụ ăn nhẹ',
    'Máy chấm công',
    'Phục vụ đỗ xe',
    'Wifi cao tốc',
    'Trang bị y tế',
    'Bảo vệ 24/7',
    'Vệ sinh toàn diện',
    'Sửa chữa trang bị',
    'Dạy kèm cá nhân',
    'Chụp ảnh sự kiện',
    'Quán đồ uống'
  ];
}

/**
 * Get court names/types
 * @returns {Array}
 */
function getCourtNames() {
  return [
    'Sân Vũ Việt',
    'Sân Thanh Niên',
    'Sân Hà Nội',
    'Sân Sài Gòn',
    'Sân Tân Phú',
    'Sân Quỳnh Mai',
    'Sân Thủ Đức',
    'Sân Bình Tân',
    'Sân Lý Thái Tổ',
    'Sân Cầu Giấy',
    'Sân Tây Hồ',
    'Sân Hoàn Kiếm',
    'Sân Long Biên',
    'Sân An Dương Vương',
    'Sân Lê Văn Lương'
  ];
}

/**
 * Get Da Nang district names
 * @returns {Array}
 */
function getDistricts() {
  return [
    'Hải Châu',
    'Thanh Khê',
    'Sơn Trà',
    'Ngũ Hành Sơn',
    'Liên Chiểu',
    'Cẩm Lệ',
    'Hòa Vang'
  ];
}

/**
 * Get provinces near Da Nang
 * @returns {Array}
 */
function getProvinces() {
  return [
    'Đà Nẵng',
    'Quảng Nam',
    'Quảng Ngãi',
    'Thừa Thiên Huế',
    'Bình Định'
  ];
}

/**
 * Generate random address
 * @returns {string}
 */
function generateRandomAddress() {
  const streetNumbers = Array.from({length: 200}, (_, i) => i + 1);
  const streetNames = ['Nguyễn Huệ', 'Tôn Đức Thắng', 'Lê Lợi', 'Trần Phú', 'Ngô Gia Tự', 'Hoàng Diệu', 'Phan Bội Châu', 'Độc Lập'];
  
  const number = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  
  return `${number} ${street}`;
}

/**
 * Generate random GPS coordinates (fake)
 * @returns {{latitude: string, longitude: string}}
 */
function generateRandomGPS() {
  // Da Nang approximate bounds: 15.9-16.2 N, 107.9-108.3 E
  const latitude = (15.9 + Math.random() * 0.3).toFixed(6);
  const longitude = (107.9 + Math.random() * 0.4).toFixed(6);
  return { latitude, longitude };
}

/**
 * Generate discount code
 * @returns {string}
 */
function generateDiscountCode() {
  const prefix = ['SUMMER', 'WINTER', 'SPRING', 'FALL', 'VIP', 'MEMBER', 'NEW'];
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix[Math.floor(Math.random() * prefix.length)]}-${suffix}`;
}

/**
 * Generate random description
 * @param {number} length - word count
 * @returns {string}
 */
function generateDescription(length = 5) {
  return faker.datatype.boolean() ? 
    faker.lorem.words(length) :
    'Chất lượng tốt, tiện ích đầy đủ, đội ngũ phục vụ chuyên nghiệp';
}

// ==================== RANDOM SELECTORS ====================

/**
 * Randomly select from array
 * @param {Array} arr
 * @returns {*}
 */
function randomSelect(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate weighted random (higher chance of true/higher numbers)
 * @param {number} trueWeight - 0-1, probability of returning true
 * @returns {boolean}
 */
function randomBool(trueWeight = 0.5) {
  return Math.random() < trueWeight;
}

/**
 * Random star rating weighted distribution (more 4-5 stars)
 * @returns {number} 1-5
 */
function randomStarRating() {
  const rand = Math.random();
  if (rand < 0.05) return 1;
  if (rand < 0.10) return 2;
  if (rand < 0.25) return 3;
  if (rand < 0.65) return 4;
  return 5;
}

/**
 * Generate random price (10k - 100k for court, 5k - 50k for service)
 * @param {string} type - 'court' or 'service'
 * @returns {number}
 */
function randomPrice(type = 'court') {
  if (type === 'court') {
    return Math.floor(Math.random() * 90000 + 10000);
  } else {
    return Math.floor(Math.random() * 45000 + 5000);
  }
}

// ==================== BATCH PROCESSING ====================

/**
 * Insert records in batches
 * @param {Model} model - Sequelize model
 * @param {Array} records - array of records to insert
 * @param {number} batchSize - records per batch
 * @returns {Promise}
 */
async function batchInsert(model, records, batchSize = 1000) {
  console.log(`Starting batch insert for ${model.name}...`);
  console.log(`Total records: ${records.length}, Batch size: ${batchSize}`);
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, Math.min(i + batchSize, records.length));
    try {
      await model.bulkCreate(batch, { validate: false });
      const percentComplete = ((i + batchSize) / records.length * 100).toFixed(1);
      console.log(`  ✓ Inserted ${i + batchSize}/${records.length} records (${percentComplete}%)`);
    } catch (error) {
      console.error(`  ✗ Error inserting batch ${i}-${i + batchSize}:`, error.message);
      throw error;
    }
  }
  console.log(`✓ Batch insert completed for ${model.name}\n`);
}

// ==================== CLEAN UP ====================

/**
 * Truncate all data from model (useful for re-seeding)
 * @param {Model} model
 * @returns {Promise}
 */
async function truncateTable(model) {
  try {
    await model.destroy({ where: {}, truncate: true, cascade: true });
    console.log(`✓ Truncated ${model.name}`);
  } catch (error) {
    console.error(`✗ Error truncating ${model.name}:`, error.message);
    throw error;
  }
}

/**
 * Truncate multiple tables in sequence
 * @param {Array} models - array of Sequelize models
 * @returns {Promise}
 */
async function truncateTables(models) {
  console.log('Truncating tables...');
  for (const model of models) {
    await truncateTable(model);
  }
  console.log('✓ All tables truncated\n');
}

// ==================== EXPORTS ====================

module.exports = {
  // Deterministic uniqueness
  generateEmail,
  generatePhone,
  generateOrderCode,
  
  // Date utilities
  getDateRange,
  randomDateBetween,
  randomBookingTime,
  
  // Vietnamese data
  generateVietnameseName,
  getGameTypes,
  getServiceTypes,
  getCourtNames,
  getDistricts,
  getProvinces,
  generateRandomAddress,
  generateRandomGPS,
  generateDiscountCode,
  generateDescription,
  
  // Random selectors
  randomSelect,
  randomBool,
  randomStarRating,
  randomPrice,
  
  // Batch processing
  batchInsert,
  truncateTable,
  truncateTables
};
