"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const data = [];

    const moTaTheoMon = {
      1: [ // Bóng đá
        "Sân cỏ nhân tạo 7 người chuẩn thi đấu",
        "Sân bóng đá mini có mái che",
        "Sân bóng đá 5 người nền cao su",
        "Sân có hệ thống đèn LED cho thi đấu ban đêm",
        "Sân bóng đá có khán đài nhỏ và khu vực thay đồ"
      ],
      2: [ // Bóng chuyền
        "Sân bóng chuyền ngoài trời thoáng mát",
        "Sân có lưới chắn và cột tiêu chuẩn",
        "Sân bóng chuyền có mái che, thích hợp mọi thời tiết",
        "Sân xi măng chống trơn trượt, an toàn",
        "Khu vực khán giả rộng, phù hợp tổ chức sự kiện"
      ],
      3: [ // Cầu lông
        "Sân cầu lông đơn với sàn gỗ chất lượng cao",
        "Sân đôi có hệ thống chiếu sáng chống lóa",
        "Không gian kín, phù hợp luyện tập chuyên sâu",
        "Mặt sân cao su giảm chấn thương",
        "Trang bị lưới tiêu chuẩn và phòng thay đồ"
      ]
    };

    for (let id_san = 1; id_san <= 10; id_san++) {
      const id_mon_choi = ((id_san - 1) % 3) + 1;
      const moTaList = moTaTheoMon[id_mon_choi];

      for (let i = 0; i < 5; i++) {
        const mo_ta = moTaList[i % moTaList.length]; // lấy mô tả theo thứ tự
        const gia_san = 150000 + id_san * 10000 + i * 5000;

        data.push({
          id_san,
          id_mon_choi,
          so_san: i + 1,
          gia_san,
          mo_ta,
          tinh_trang: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert("vitrisans", data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("vitrisans", null, {});
  },
};
