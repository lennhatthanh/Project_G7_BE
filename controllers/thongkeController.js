const thongke = require("../models/thongkes");

class ViTriSanController {
  async datsan(req, res) {
    try {
      const data = await thongke.datsan(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async sukien(req, res) {
    try {
      const data = await thongke.sukien(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async doanhthu(req, res) {
    try {
      const data = await thongke.doanhthu(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ViTriSanController();
