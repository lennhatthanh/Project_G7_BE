const danhgias = require("../models/danhgias");

class danhgiaController {
 async themMoiDanhGia(req, res) {
    try {
      const { id_vi_tri_san, so_sao, danh_gia } = req.body;
      const id_nguoi_dung = req.user.id;
      const data = await danhgias.add(
        id_vi_tri_san,
        id_nguoi_dung,
        so_sao,
        danh_gia
      );
      return res
        .status(200)
        .json({ message: "Đánh giá thành công", data: data });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi: " + error.message });
    }
  }

  async capNhatDanhGia(req, res) {
    try {
      const { id, so_sao, danh_gia } = req.body;
      await danhgias.update(id, so_sao, danh_gia);
      return res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi: " + error.message });
    }
  }

  async xoaDanhGia(req, res) {
    try {
      const id  = req.params.id
      await danhgias.delete(id);
      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi: " + error.message });
    }
  }

  async getAll(req, res) {
    try {
      const data = await danhgias.getAll();
      return res
        .status(200)
        .json({ message: "Lấy dữ liệu thành công", data: data });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi: " + error.message });
    }
  }
}

module.exports = new danhgiaController();
