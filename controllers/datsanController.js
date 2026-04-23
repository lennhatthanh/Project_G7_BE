require("dotenv").config();
const {Datsan} = require("../models");
const {Nguoidung} = require("../models");
const PayOS = require("@payos/node");
const payos = new PayOS(process.env.CLIENT_ID, process.env.API_KEY, process.env.CHECKSUM_KEY);

const { v4: uuidv4 } = require("uuid");

class datsanController {
    generateNumericOrderCode() {
        const uuid = uuidv4().replace(/-/g, "");
        const hex = uuid.slice(0, 4);
        const num = parseInt(hex, 16);
        return num;
    }
    async thanhToan(req, res) {
        try {
            const expiredAt = Math.floor(Date.now() / 1000) + 30;
            const orderCode = this.generateNumericOrderCode();
            const danhSach = req.body;
            const id_san = danhSach[0].id_san;
            let tong_tien = danhSach[0].gia_san;
            let id_nguoi_dung = null;
            if (req.user && Object.keys(req.user).length !== 0) {
                id_nguoi_dung = req.user.id;
            }
            let des = "";
            for (const ds of danhSach) {
                await Promise.all(
                    ds.gio_dat.map((gio) =>
                        Datsan.add(
                            ds.id_vi_tri_dat_san,
                            id_nguoi_dung,
                            ds.ngay_dat,
                            gio,
                            ds.gia_san_cu_the,
                            orderCode,
                        ),
                    ),
                );
                des = des + ds.gio_dat.join(" ");
            }
            const order = {
                amount: tong_tien,
                description: `${orderCode} gio`,
                orderCode: orderCode,
                expiredAt,
                returnUrl: `https://dijuzou621fi5.cloudfront.net/dat-san/check-thanh-toan/${id_san}`,
                cancelUrl: `https://dijuzou621fi5.cloudfront.net/dat-san/check-thanh-toan/${id_san}`,
            };
            const paymentLink = await payos.createPaymentLink(order);
            setTimeout(async () => {
                try {
                    await Datsan.delete(orderCode);
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
            const { id_san } = req.params;
            const { cancel, status, code, id, orderCode } = req.query;
            console.log(cancel, status, code, id, orderCode);
            if (cancel === "true" || status === "CANCELLED") {
                console.log("Thanh toán đã bị hủy");
                const data = await Datsan.delete(orderCode);
                return res.redirect(`https://d3tsalu92kyy06.cloudfront.net/dat-san/${id_san}`);
            }
            console.log("Thanh toán thành công");
            const data = await Datsan.update(orderCode);
            return res.redirect(`https://d3tsalu92kyy06.cloudfront.net/dat-san/${id_san}`);
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error.message);
            res.status(500).json({
                message: "Đã xảy ra lỗi khi xử lý thanh toán",
                error: error.message,
            });
        }
    }
    async lichSuDatSan(req, res) {
        try {
            const data = await Datsan.getLichSu(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }
    async lichSuDatSanAll(req, res) {
        try {
            const data = await Datsan.getLichSuNhanVien(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }
    async lichSuDatSanAllChuSan(req, res) {
        try {
            const data = await Datsan.getLichSuChuSan(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }
}

module.exports = new datsanController();
