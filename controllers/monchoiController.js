const {Monchoi} = require("../models");

class MonChoiController {
  async themMonChoi(req, res) {
    try {
      const { ten_mon, mo_ta } = req.body;
      const data = await Monchoi.add(ten_mon, mo_ta); // chỉ gọi 1 lần
      return res.status(200).json({
        message: "Thêm dữ liệu thành công",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: "Thêm thất bại" });
    }
  }

  async capnhatMonChoi(req, res) {
    try {
      const { id, ten_mon, mo_ta, tinh_trang } = req.body;
      const data = await Monchoi.update(id, ten_mon, mo_ta, tinh_trang);
      return res.status(200).json({
        message: "Cập nhật thành công",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Cập nhật thất bại" });
    }
  }

  async xoaMonChoi(req, res) {
    try {
      const id  = req.params.id
      await Monchoi.delete(id);

      return res.status(200).json({
        message: "Xóa thành công",
      });
    } catch (error) {
      return res.status(500).json({ message: "Xóa thất bại" });
    }
  }

  async layTatCaMonChoi(req, res) {
    try {
      const data = await Monchoi.getAll();
      return res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

   async layTatCaMonChoiOpen(req, res) {
    try {
      const data = await Monchoi.getAllOpen();
      return res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
    }
  }
}

module.exports = new MonChoiController();
