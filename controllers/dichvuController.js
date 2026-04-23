const dichvu = require("../models/dichvus");
class dichvuController {
    async getData(req, res) {
        try {
            const id = req.user.id;
            const data = await dichvu.getAll(id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async getDataById(req, res) {
        try {
            const id = req.params.id
            const data = await dichvu.getAllOpenById(id);
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async getDataOpen(req, res) {
        try {
            const data = await dichvu.getAllOpen();
            return res.status(200).json({ data: data });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async themDichVu(req, res) {
        try {
            const { id_san, ten_dich_vu, mo_ta, don_gia } = req.body;
            const data = await dichvu.add(id_san, ten_dich_vu, mo_ta, don_gia);

            return res
                .status(200)
                .json({ message: "Thêm thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async capnhatDichVu(req, res) {
        try {
            const { id, id_san, ten_dich_vu, mo_ta, don_gia, tinh_trang } =
                req.body;
            const data = await dichvu.update(
                id,
                id_san,
                ten_dich_vu,
                mo_ta,
                don_gia,
                tinh_trang
            );
            return res
                .status(200)
                .json({ message: "Cập Nhật thành công", data: data });
        } catch (error) {
            return res.status(500).json({ message: "Cập Nhật thất bại" });
        }
    }
    async xoaDichVu(req, res) {
        try {
            await dichvu.delete(req.params.id);
            return res.status(200).json({ message: "Xóa Thành Công" });
        } catch (error) {
            return res.status(500).json({ message: "Xóa thất bại" });
        }
    }
}
module.exports = new dichvuController();
