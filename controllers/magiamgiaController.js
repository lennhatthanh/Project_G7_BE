const magiamgia = require("../models/magiamgias");

class magiamgiaController {
    async themMaGiamGia(req, res) {
        try {
            const {
                id_san,
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                loai_giam_gia,
                ngay_bat_dau,
                ngay_ket_thuc,
            } = req.body;

            const data = await magiamgia.add(
                id_san,
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                loai_giam_gia,
                ngay_bat_dau,
                ngay_ket_thuc
            );

            return res
                .status(200)
                .json({ message: "Thêm mã giảm giá thành công", data: data });
        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Thêm mã giảm giá thất bại" });
        }
    }

    async capnhatMaGiamGia(req, res) {
        try {
            const {
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                loai_giam_gia,
                ngay_bat_dau,
                ngay_ket_thuc,
                tinh_trang,
                id,
            } = req.body;

            const data = await magiamgia.update(
                ma_giam_gia,
                gia_tri_giam,
                mo_ta,
                loai_giam_gia,
                ngay_bat_dau,
                ngay_ket_thuc,
                tinh_trang,
                id
            );

            return res
                .status(200)
                .json({ message: "Cập nhật mã giảm giá thành công", data: data });
        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Cập nhật mã giảm giá thất bại" });
        }
    }

    async xoaMaGiamGia(req, res) {
        try {
            const id = req.params.id;
            await magiamgia.delete(id);
            return res
                .status(200)
                .json({ message: "Xóa mã giảm giá thành công" });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Xóa mã giảm giá thất bại" });
        }
    }

    async layTatCa(req, res) {
        try {
            const id = req.user.id;
            const data = await magiamgia.getAll(id);
            return res.status(200).json({ data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lấy dữ liệu thất bại" });
        }
    }

    async layTatCaDangMo(req, res) {
        try {
            const data = await magiamgia.getAllOpen();
            return res.status(200).json(data);
        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Lấy dữ liệu mã giảm giá đang mở thất bại" });
        }
    }
    async kiemTraMa(req, res) {
        try {
            const data = await magiamgia.kiemTraMa(req.body.magiamgia, req.body.id_san);
            return res.status(200).json({data: data});
        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Đã có lỗi xảy ra" });
        }
    }
}

module.exports = new magiamgiaController();
