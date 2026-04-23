const nguoidungs = require("../models/nguoidungs");
const bcrypt = require('bcrypt')

class nguoidungController {
  async capNhatNguoiDung(req, res) {
      try {
        const {id, ho_ten,email,mat_khau,so_dien_thoai,gioi_tinh,tinh_trang} = req.body
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(mat_khau, salt);
        const data = await nguoidungs.update(id, ho_ten,email,hashed,so_dien_thoai,gioi_tinh,tinh_trang);
        return res.status(200).json({ message: "Cập nhật thành công", data: data });
      } catch (error) {
        return res.status(500).json({message: "Lỗi: " + error.message});
      }
    }
  
    async capNhatNguoiDungOpen(req, res) {
      try {
        const { ho_ten,so_dien_thoai,gioi_tinh} = req.body
        const data = await nguoidungs.updateOpen(req.user.id, ho_ten,so_dien_thoai,gioi_tinh);
        return res.status(200).json({ message: "Cập nhật thành công", data: data });
      } catch (error) {
        return res.status(500).json({message: "Lỗi: " + error.message});
      }
    }
  
    async xoaNguoiDung(req, res) {
      try {
        const id  = req.params.id
        const data = await nguoidungs.delete(id);
        return res.status(200).json({ message: "Xóa thành công", data: data });
      } catch (error) {
        return res.status(500).json({ message: "Lỗi: " + error.message });
      }
    }
  
    async changePassword(req, res){
      try {
        const {mat_khau_cu1, mat_khau_cu2,mat_khau_moi} = req.body
        if(mat_khau_cu1 !== mat_khau_cu2){
          return res.status(400).json({message: "Mật khẩu cũ không trùng khớp"})
        } 
        const nguoidung = await nguoidungs.getById(req.user.id)
        const validPassword = await bcrypt.compare(
                mat_khau_cu1,
                nguoidung.mat_khau
              );
        if (!validPassword) {
          return res.status(402).json({ message: "Sai mật khẩu" });
        }
        if(mat_khau_cu1 === mat_khau_moi){
          return res.status(403).json({message: "Mật khẩu cũ không được trùng khớp mật khẩu mới"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(mat_khau_moi, salt);
        await nguoidungs.changeMatKhau(req.user.id, hashed)
        return res.status(200).json({message: "Đổi mật khẩu thành công"})
      } catch (error){
        return res.status(500).json({message: "Lỗi: " + error.message})
      }
    }
  
    async getNguoiDung(req, res) {
      try {
        const data = await nguoidungs.getById(req.user.id);
        return res.status(200).json({ data: data });
      } catch (error) {
        return res.status(500).json({message: "Lỗi: " + error.message});
      }
    }
  
    async getAllNguoiDung(req, res) {
      try {
        const data = await nguoidungs.getAll();
        return res.status(200).json({ data: data });
      } catch (error) {
        return res.status(500).json(error.message);
      }
    }

    async kiemTraNguoiDung(req, res) {
        try {
            const data = await nguoidungs.getById(req.user.id);
            return res.status(200).json({ status: true, data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }
}

module.exports = new nguoidungController();
