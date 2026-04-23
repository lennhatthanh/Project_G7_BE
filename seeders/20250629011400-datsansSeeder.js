"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const data = [];

    const ngayBatDau = new Date("2025-07-06");
    const khungGio = ["07:00:00", "09:00:00", "11:00:00", "14:00:00", "16:00:00", "18:00:00"];

    let id_nguoi_dung = 1;

    for (let id_vi_tri_dat_san = 1; id_vi_tri_dat_san <= 5; id_vi_tri_dat_san++) {
      const gioDaDat = new Set(); // để tránh trùng giờ trong cùng ngày
      for (let i = 0; i < 5; i++) {
        const ngay_dat = new Date(ngayBatDau);
        ngay_dat.setDate(ngay_dat.getDate() + (id_vi_tri_dat_san + i) % 5); // trải ngày từ 6–10

        let gio_dat;
        do {
          gio_dat = khungGio[Math.floor(Math.random() * khungGio.length)];
        } while (gioDaDat.has(`${ngay_dat.toISOString().slice(0, 10)}-${gio_dat}`));

        gioDaDat.add(`${ngay_dat.toISOString().slice(0, 10)}-${gio_dat}`);

        const orderCode = Math.floor(100000000000 + Math.random() * 900000000000); // 12 chữ số

        data.push({
          id_vi_tri_dat_san,
          id_nguoi_dung: id_nguoi_dung,
          ngay_dat: ngay_dat.toISOString().slice(0, 10),
          gio_dat,
          thanh_tien: 2000,
          orderCode,
          createdAt: now,
          updatedAt: now
        });

        id_nguoi_dung = id_nguoi_dung >= 5 ? 1 : id_nguoi_dung + 1;
      }
    }

    await queryInterface.bulkInsert("datsans", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("datsans", null, {});
  }
};
