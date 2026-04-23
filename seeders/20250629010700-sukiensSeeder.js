"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            "sukiens",
            [
                {
                    id_san: 1,
                    ten_su_kien: "Giải bóng đá thiếu niên 2025",
                    noi_dung:
                        "Giải đấu dành cho các đội bóng thiếu niên toàn quốc, tổ chức tại sân A.",
                    thoi_gian_bat_dau: new Date("2025-08-05T08:00:00"),
                    thoi_gian_ket_thuc: new Date("2025-08-10T17:00:00"),
                    so_luong: 16,
                    phi_tham_gia: 50000,
                    tinh_trang: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id_san: 2,
                    ten_su_kien: "Giải cầu lông đồng đội",
                    noi_dung:
                        "Giải cầu lông được tổ chức vào cuối tuần, có các đội tuyển chuyên nghiệp tham gia.",
                    thoi_gian_bat_dau: new Date("2025-09-01T09:00:00"),
                    thoi_gian_ket_thuc: new Date("2025-09-03T18:00:00"),
                    so_luong: 8,
                    phi_tham_gia: 50000,
                    tinh_trang: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id_san: 1,
                    ten_su_kien: "Ngày hội thể thao 2025",
                    noi_dung:
                        "Sự kiện tổng hợp nhiều môn thể thao, diễn ra tại nhiều địa điểm khác nhau.",
                    thoi_gian_bat_dau: new Date("2025-10-15T07:00:00"),
                    thoi_gian_ket_thuc: new Date("2025-10-20T17:00:00"),
                    so_luong: 100,
                    phi_tham_gia: 50000,
                    tinh_trang: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("sukiens", null, {});
    },
};
