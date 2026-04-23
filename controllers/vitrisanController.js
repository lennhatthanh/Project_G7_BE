const {Vitrisan} = require("../models");

class ViTriSanController {
  async themViTriSan(req, res) {
    try {
      const {
        id_san,
        id_mon_choi,
        so_san,
        gia_san,
        mo_ta,
        tinh_trang = true,
      } = req.body;

      const data = await Vitrisan.add(
        id_san,
        id_mon_choi,
        so_san,
        gia_san,
        mo_ta,
        tinh_trang
      );

      return res.status(200).json({
        message: "Thêm dữ liệu thành công",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async capnhatViTriSan(req, res) {
    try {
      const { id, id_san, id_mon_choi, so_san, gia_san, mo_ta, tinh_trang } =
        req.body;

      const data = await Vitrisan.update(
        id,
        id_san,
        id_mon_choi,
        so_san,
        gia_san,
        mo_ta,
        tinh_trang
      );

      return res.status(200).json({
        message: "Cập nhật thành công",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Cập nhật thất bại" });
    }
  }

  async xoaViTriSan(req, res) {
    try {
      const id  = req.params.id
      const data = await Vitrisan.delete(id);
      return res.status(200).json({
        message: "Xóa thành công",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Xóa thất bại" });
    }
  }

  async layTatCaViTriSan(req, res) {
    try {
      const data = await vitrisan.getAll();
      return res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
    }
  }
  async laySanTheoChuSan(req, res) {
    try {
      const id_chu_san = req.user.id;
      const data = await Vitrisan.getByChuSanId(id_chu_san);
      return res.status(200).json({ data: data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
  async laySanTheoNhanVien(req, res) {
    try {
      const id_nhan_vien = req.user.id;
      const data = await Vitrisan.getByNhanVienId(id_nhan_vien);
      return res.status(200).json({ data: data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}

module.exports = new ViTriSanController();
