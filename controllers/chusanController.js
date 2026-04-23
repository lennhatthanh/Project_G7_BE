const {Chusan} = require("../models");
const bcrypt = require("bcrypt");

class chusanController {
    async themMoiChuSan(req, res) {
        try {
            const { ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh } =
                req.body;
            if (!/^\d{10,11}$/.test(so_dien_thoai)) {
                return res.status(400).json({
                    message: "Số điện thoại phải là số và có 10 hoặc 11 chữ số",
                });
            }
            if (!email.includes("@")) {
                return res.status(401).json({ message: "Email không hợp lệ" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(mat_khau, salt);
            const data = await Chusan.add(
                ho_ten,
                email,
                hashed,
                so_dien_thoai,
                gioi_tinh
            );
            return res
                .status(200)
                .json({ message: "Đăng ký thành công", data: data });
        } catch (error) {
            if (error.code == 23505) {
                if (error.constraint === "Chusan_email_key") {
                    return res
                        .status(402)
                        .json({ message: "Email đã tồn tại" });
                }
                if (error.constraint === "Chusan_so_dien_thoai_key") {
                    return res
                        .status(402)
                        .json({ message: "Số điện thoại đã tồn tại" });
                }
            }
            if (error.code == "22P02") {
                return res
                    .status(403)
                    .json({ message: "Bạn chưa chọn giới tính" });
            }
            return res.status(500).json(error.message);
        }
    }

    async capNhatChuSan(req, res) {
        try {
            const {
                id,
                ho_ten,
                email,
                mat_khau,
                so_dien_thoai,
                gioi_tinh,
                tinh_trang,
            } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(mat_khau, salt);
            const data = await Chusan.update(
                id,
                ho_ten,
                email,
                hashed,
                so_dien_thoai,
                gioi_tinh,
                tinh_trang
            );
            return res
                .status(200)
                .json({ message: "Cập nhật thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async capNhatChuSanOpen(req, res) {
        try {
            const { id, ho_ten, so_dien_thoai, gioi_tinh, tinh_trang } =
                req.body;
            const data = await Chusan.updateOpen(
                id,
                ho_ten,
                so_dien_thoai,
                gioi_tinh,
                tinh_trang
            );
            return res
                .status(200)
                .json({ message: "Cập nhật thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async xoaChuSan(req, res) {
        try {
            const id = req.params.id;
            const data = await Chusan.delete(id);
            return res
                .status(200)
                .json({ message: "Xóa thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { mat_khau_cu1, mat_khau_cu2, mat_khau_moi } = req.body;
            if (mat_khau_cu1 !== mat_khau_cu2) {
                return res
                    .status(400)
                    .json({ message: "Mật khẩu cũ không trùng khớp" });
            }
            const chusan = await Chusan.getById(req.user.id);
            const validPassword = await bcrypt.compare(
                mat_khau_cu1,
                chusan.mat_khau
            );
            if (!validPassword) {
                return res.status(402).json({ message: "Sai mật khẩu" });
            }
            if (mat_khau_cu1 === mat_khau_moi) {
                return res
                    .status(403)
                    .json({
                        message:
                            "Mật khẩu cũ không được trùng khớp mật khẩu mới",
                    });
            }
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(mat_khau_moi, salt);
            await Chusan.changeMatKhau(req.user.id, hashed);
            return res.status(200).json({ message: "Đổi mật khẩu thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async getChuSan(req, res) {
        try {
            const data = await Chusan.getById(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async getAllChuSan(req, res) {
        try {
            const data = await Chusan.getAll();
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

    async kiemTraChuSan(req, res) {
        try {
            return res.status(200).json({ status: true });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }
}

module.exports = new chusanController();
