const {Sukien} = require("../models");
const {Nguoidungsukien} = require("../models");
const {Datsan} = require("../models");
const {Vitrisan} = require("../models");
const PayOS = require("@payos/node");
const payos = new PayOS(process.env.CLIENT_ID, process.env.API_KEY, process.env.CHECKSUM_KEY);
const { v4: uuidv4 } = require("uuid");
class sukienController {
    generateNumericOrderCode() {
        const uuid = uuidv4().replace(/-/g, "");
        const hex = uuid.slice(0, 4);
        const num = parseInt(hex, 16);
        return num;
    }
    async themMoiSuKien(req, res) {
        try {
            const { id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, phi_tham_gia } =
                req.body;
            const ngay_bat_dau = new Date(thoi_gian_bat_dau.split("T")[0]);
            const ngay_ket_thuc = new Date(thoi_gian_ket_thuc.split("T")[0]);
            const gio_bat_dau = parseInt(thoi_gian_bat_dau.split("T")[1].split(":")[0]);
            const gio_ket_thuc = parseInt(thoi_gian_ket_thuc.split("T")[1].split(":")[0]);
            let gio = [];
            let ngay = [];
            const orderCode = this.generateNumericOrderCode();
            for (let i = gio_bat_dau; i <= gio_ket_thuc; i++) {
                const gioString = `${i.toString().padStart(2, "0")}:00`;
                gio.push(gioString);
            }
            while (ngay_bat_dau <= ngay_ket_thuc) {
                const yyyy = ngay_bat_dau.getFullYear();
                const mm = String(ngay_bat_dau.getMonth() + 1).padStart(2, "0");
                const dd = String(ngay_bat_dau.getDate()).padStart(2, "0");
                ngay.push(`${yyyy}-${mm}-${dd}`);
                ngay_bat_dau.setDate(ngay_bat_dau.getDate() + 1);
            }
            const vitrisan = await Vitrisan.getAllOpenSanId(id_san);
            vitrisan.map((vts) => console.log(vts.id));
            let vts = [];

            console.log(gio);
            await Promise.all(
                ngay.map(async (n) => {
                    const giodat = await Datsan.layGioDat(n);
                    giodat.map((nd) => {
                        const date = new Date(nd.ngay_dat);
                        date.setDate(date.getDate() + 1);
                        const formattedDate = date.toISOString().split("T")[0];
                        if (n === formattedDate) {
                            giodat.some((gd) => {
                                const f = parseInt(gio[0].split(":")[0]);
                                const l = parseInt(gio[gio.length - 1].split(":")[0]);
                                const gHour = parseInt(gd.gio_dat.split(":")[0]);
                                if (gHour > f || gHour < l) {
                                    const key = `${gd.id_vi_tri_dat_san}T${n}`;
                                    if (!vts.includes(key)) {
                                        vts.push(key);
                                    }
                                }
                                return false;
                            });
                        }
                    });
                }),
            );
            console.log(vts);
            const gia_san = await Datsan.layGiaSan(1);
            for (const ngay_dat of ngay) {
                await Promise.all(
                    gio.map((gio_dat) =>
                        vts.some((v) => {
                            const id = parseInt(v.split("T")[0]);
                            const nd = v.split("T")[1];
                            if (ngay_dat === nd) {
                                Datsan.add(id + 1, null, nd, gio_dat, gia_san.gia_san, orderCode);
                            } else {
                                Datsan.add(1, null, ngay_dat, gio_dat, gia_san.gia_san, orderCode);
                            }
                        }),
                    ),
                );
            }
            const data = await Sukien.add(
                id_san,
                ten_su_kien,
                noi_dung,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                so_luong,
                phi_tham_gia,
            );
            return res.status(200).json({ message: "Thêm mới thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async capNhatSuKien(req, res) {
        try {
            const { id, id_san, ten_su_kien, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong, tinh_trang } =
                req.body;
            const data = await Sukien.update(
                id,
                id_san,
                ten_su_kien,
                noi_dung,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                so_luong,
                tinh_trang,
            );
            return res.status(200).json({ message: "Cập nhật thành công", data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }
    async thamGiaSuKien(req, res) {
        try {
            const { id_su_kien, can_cuoc_cong_dan, phi_tham_gia, so_luong } = req.body;
            const expiredAt = Math.floor(Date.now() / 1000) + 30;
            const orderCode = this.generateNumericOrderCode();
            const checkSoLuong = await Nguoidungsukien.checkSoLuong(id_su_kien);
            if (checkSoLuong >= so_luong) {
                return res.status(500).json({ checkSoLuong });
            }
            const data = await Nguoidungsukien.add(req.user.id, id_su_kien, can_cuoc_cong_dan, orderCode);
            const order = {
                amount: phi_tham_gia,
                description: `${orderCode}`,
                orderCode: orderCode,
                expiredAt,
                returnUrl: `https://dijuzou621fi5.cloudfront.net/su-kien/check-thanh-toan`,
                cancelUrl: `https://dijuzou621fi5.cloudfront.net/su-kien/check-thanh-toan`,
            };
            const paymentLink = await payos.createPaymentLink(order);
            setTimeout(async () => {
                try {
                    await Nguoidungsukien.delete(orderCode);
                    console.log("Đã tự động hủy đơn:", orderCode);
                } catch (err) {
                    console.error("Lỗi khi xóa đơn:", err.message);
                }
            }, 40000);
            return res.status(200).json({ checkoutUrl: paymentLink.checkoutUrl });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }
    async checkThanhToan(req, res) {
        try {
            const { cancel, status, code, id, orderCode } = req.query;
            console.log(cancel, status, code, id, orderCode);
            if (cancel === "true" || status === "CANCELLED") {
                console.log("Thanh toán đã bị hủy");
                const data = await Nguoidungsukien.delete(orderCode);
                return res.redirect(`https://d3tsalu92kyy06.cloudfront.net/su-kien`);
            }
            console.log("Thanh toán thành công");
            const data = await Nguoidungsukien.update(orderCode);
            return res.redirect(`https://d3tsalu92kyy06.cloudfront.net/su-kien`);
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error.message);
            res.status(500).json({
                message: "Đã xảy ra lỗi khi xử lý thanh toán",
                error: error.message,
            });
        }
    }

    async xoaSuKien(req, res) {
        try {
            const id = req.params.id;
            await Sukien.delete(id);
            return res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async getAll(req, res) {
        try {
            const data = await Sukien.getAll(req.user.id);
            return res.status(200).json({ message: "Lấy dữ liệu thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }

    async getAllOpen(req, res) {
        try {
            const data = await Sukien.getAllOpen();
            const sukien = await Sukien.checkThamGia(req.user.id);
            return res.status(200).json({ message: "Lấy dữ liệu thành công", data, sukien });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }
}

module.exports = new sukienController();
