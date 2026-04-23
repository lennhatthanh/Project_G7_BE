const {Thongbao} = require("../models");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ngotranhoaibao@gmail.com",
    pass: "nuggemuyoqywbqfm ",
  },
});
class thongbaoController {
  async layThongBao(req, res) {
    try {
      const data = await Thongbao.getAll(req.user.id);
      res.json({ message: "Lấy danh sách thành công", data: data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách" });
    }
  }

  async layThongBaoOpen(req, res) {
    try {
      const data = await Thongbao.getAllOpen();
      res.json({ message: "Lấy danh sách thành công", data: data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách" });
    }
  }

  async themThongBao(req, res) {
    try {
      const { id_san, tieu_de, noi_dung } = req.body;
      const data = await Thongbao.add(id_san, tieu_de, noi_dung);
      return res.status(200).json({
        message: "Thêm mới thành công",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Thêm mới thất bại", data: req.body });
    }
  }

  async capNhatThongBao(req, res) {
    try {
      const { id, tieu_de, noi_dung, tinh_trang, id_san } = req.body;
      const data = await Thongbao.update(
        id,
        tieu_de,
        noi_dung,
        tinh_trang,
        id_san
      );
      return res.json({ message: "Cập nhật thành công", data: data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Cập nhật thất bại" });
    }
  }

  async xoaThongBao(req, res) {
    try {
      const id = req.params.id;
      const data = await Thongbao.delete(id);
      return res.json({ message: "Xóa thành công", data: data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Xóa thất bại" });
    }
  }
  async guiThongBao(req, res) {
    try {
      const { id_san, noi_dung, tieu_de } = req.body;
      const data = await Thongbao.layEmail(id_san);
      data.forEach((element) => {
        transporter.sendMail({
          from: '"SanGo" <your_email@gmail.com>',
          to: element.email,
          subject: tieu_de,
          html: `
          <p>${noi_dung}</p>
        `,
        });
      });
      return res.status(200).json({message: "Gửi thành công"})
      }catch (error) {
        return res.status(500).json({ message: error.message });

      }
  }
}
module.exports = new thongbaoController();
