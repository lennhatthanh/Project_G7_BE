// Trỏ đường dẫn tới file Service mới mà bạn đã tạo
const ThongKeService = require("../services/ThongKeService");

class ThongKeController {
  async datsan(req, res) {
    try {
      // Gọi hàm từ Service thay vì Model
      const data = await ThongKeService.datsan(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async sukien(req, res) {
    try {
      const data = await ThongKeService.sukien(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async doanhthu(req, res) {
    try {
      const data = await ThongKeService.doanhthu(req.user.id);
      return res.status(200).json({
        data: data,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

// Export object để file Router có thể dùng ngay
module.exports = new ThongKeController();