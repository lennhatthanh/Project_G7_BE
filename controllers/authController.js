const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("./mailerController");
require("dotenv").config();
const {Nguoidung} = require("../models");
const {Chusan} = require("../models");
const {Admin} = require("../models");
const {Nhanvien} = require("../models");
let refreshTokens = [];

class authController {
    async dangky(req, res) {
        try {
            const { ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh } = req.body;
            if (!/^\d{10,11}$/.test(so_dien_thoai)) {
                return res.status(400).json({
                    message: "Số điện thoại phải là số và có 10 hoặc 11 chữ số",
                });
            }
            if (mat_khau.length < 6) {
                return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
            }
            if (!email.includes("@")) {
                return res.status(401).json({ message: "Email không hợp lệ" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(mat_khau, salt);
            const token = jwt.sign({ email }, process.env.JWT_EMAIL_SECRET, {
                expiresIn: "1d",
            });
            await Nguoidung.add(ho_ten, email, hashed, so_dien_thoai, gioi_tinh);
            await sendVerificationEmail(email, token);
            return res.status(200).json({ message: "Vui lòng kiểm tra email để xác thực" });
        } catch (error) {
            if (error.code == 23505) {
                if (error.constraint === "nguoidungs_email_key") {
                    return res.status(402).json({ message: "Email đã tồn tại" });
                }
                if (error.constraint === "nguoidungs_so_dien_thoai_key") {
                    return res.status(402).json({ message: "Số điện thoại đã tồn tại" });
                }
            }
            if (error.code == "22P02") {
                return res.status(403).json({ message: "Bạn chưa chọn giới tính" });
            }
            return res.status(500).json(error.message);
        }
    }

    async xacThucEmail(req, res) {
        const { token } = req.query;
        try {
            const verify = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
            const email = verify.email;
            await Nguoidung.verify(email);
            res.status(200).json({ message: "Xác thực thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async dangNhap(req, res) {
        try {
            const { email, mat_khau } = req.body;
            const user = await Nguoidung.getByEmail(email);
            if (user.rows.length === 0) {
                return res.status(401).json({ message: "Không tìm thấy tài khoản" });
            }
            if (!user.rows[0].is_verified) {
                return res.status(402).json({
                    message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.",
                });
            }

            const validPassword = await bcrypt.compare(mat_khau, user.rows[0].mat_khau);
            if (!validPassword) {
                return res.status(403).json({ message: "Sai mật khẩu" });
            }

            if (user && validPassword) {
                const nguoidung = user.rows[0];
                const accessToken = this.generateAccessToken(nguoidung);
                const refreshToken = this.generateRefreshToken(nguoidung);
                const role = "nguoidung";
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { mat_khau, ...others } = user.rows[0];
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    users: others,
                    accessToken,
                    role,
                });
            }
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async dangNhapChuSan(req, res) {
        try {
            const { email, mat_khau } = req.body;
            const chusan = await Chusan.getByEmail(email);
            if (chusan.rows.length === 0) {
                return res.status(401).json({ message: "Không tìm thấy tài khoản" });
            }
            const validPassword = await bcrypt.compare(mat_khau, chusan.rows[0].mat_khau);
            if (!validPassword) {
                return res.status(403).json({ message: "Sai mật khẩu" });
            }

            if (chusan && validPassword) {
                const cs = chusan.rows[0];
                const accessToken = this.generateAccessToken(cs);
                const refreshToken = this.generateRefreshToken(cs);
                const role = "nhanvien";
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { mat_khau, ...others } = chusan.rows[0];
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    Chusan: others,
                    accessToken,
                    role,
                });
            }
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async dangNhapNhanVien(req, res) {
        try {
            const { email, mat_khau } = req.body;
            const nhanvien = await Nhanvien.getByEmail(email);
            if (nhanvien.rows.length === 0) {
                return res.status(401).json({ message: "Không tìm thấy tài khoản" });
            }
            const validPassword = await bcrypt.compare(mat_khau, nhanvien.rows[0].mat_khau);
            if (!validPassword) {
                return res.status(403).json({ message: "Sai mật khẩu" });
            }

            if (nhanvien && validPassword) {
                const nv = nhanvien.rows[0];
                const accessToken = this.generateAccessToken(nv);
                const refreshToken = this.generateRefreshToken(nv);
                const role = "chusan";
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { mat_khau, ...others } = nhanvien.rows[0];
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    nhanvien: others,
                    accessToken,
                    role,
                });
            }
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async dangNhapAdmin(req, res) {
        try {
            const { email, mat_khau } = req.body;
            const admin = await Admin.getByEmail(email);
            if (admin.rows.length === 0) {
                return res.status(401).json({ message: "Không tìm thấy tài khoản" });
            }
            const validPassword = await bcrypt.compare(mat_khau, admin.rows[0].mat_khau);
            if (!validPassword) {
                return res.status(403).json({ message: "Sai mật khẩu" });
            }

            if (admin && validPassword) {
                const adm = admin.rows[0];
                const accessToken = this.generateAccessToken(adm);
                const refreshToken = this.generateRefreshToken(adm);
                const role = "admin";
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { mat_khau, ...others } = admin.rows[0];
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    admin: others,
                    accessToken,
                    role,
                });
            }
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async reqRefreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "Chưa đăng nhập chưa có token" });
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(402).json({ message: "Refresh token không phải của bạn" });
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                console.log(err.message);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            //tạo mới accesstoken và refreshtoken
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.status(200).json(newAccessToken);
        });
    }

    async dangXuat(req, res) {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken);
        return res.status(200).json({ message: "Đăng xuất thành công" });
    }

    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_ACCESS_KEY,
            {
                expiresIn: "1d",
            }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: "365d",
            }
        );
    }
}

module.exports = new authController();
