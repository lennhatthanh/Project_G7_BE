const { Santhethao } = require("../models");
const icons = {
    "Bóng đá": "icon/bong_da.png", // icon hình quả bóng đá
    "Bóng chuyền": "volleyball.png", // icon hình bóng chuyền
    "Cầu lông": "icon/cau_long.png", // icon hình vợt cầu lông
    Tennis: "tennis-icon.png", // icon hình vợt tennis
    "Bóng rổ": "icon/bong_ro.png", // icon hình bóng rổ
    // Thêm các loại sân khác nếu cần
};
class SansController {
    async themSan(req, res) {
        
        try {
            const {
                ten_san,
                loai_san,
                huyen,
                thanh_pho,
                dia_chi_cu_the,
                mo_ta,
                gio_mo_cua,
                gio_dong_cua,
                kinh_do,
                vi_do,
            } = req.body;
            const id_chu_san = req.user.id;

            // Lấy icon dựa vào loại sân
            const icon = icons[loai_san] || "default-icon.png"; // Nếu không tìm thấy, sử dụng icon mặc định

            const hinh_anh = req.file?.key || req.file?.location || null;

            const data = await Santhethao.add(
                id_chu_san,
                ten_san,
                loai_san,
                icon, // Gửi icon đã được xác định ở trên
                huyen,
                thanh_pho,
                dia_chi_cu_the,
                mo_ta,
                hinh_anh,
                gio_mo_cua,
                gio_dong_cua,
                kinh_do,
                vi_do,
            );
            
        console.log("DEBUG: req.file =", req.file);
        console.log("DEBUG: req.body =", req.body);
            return res.status(200).json({
                message: "Thêm sân thành công",
                data: data,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async capnhatSan(req, res) {
        try {
            const {
                id,
                id_chu_san,
                ten_san,
                loai_san,
                icon,
                huyen,
                thanh_pho,
                dia_chi_cu_the,
                mo_ta,
                gio_mo_cua,
                gio_dong_cua,
                kinh_do,
                vi_do,
                tinh_trang,
            } = req.body;

            const hinh_anh = req.file?.key || req.file?.location;

            const data = await Santhethao.update(
                id,
                id_chu_san,
                ten_san,
                loai_san,
                icon,
                huyen,
                thanh_pho,
                dia_chi_cu_the,
                mo_ta,
                hinh_anh,
                gio_mo_cua,
                gio_dong_cua,
                kinh_do,
                vi_do,
                tinh_trang,
            );

            return res.status(200).json({
                message: "Cập nhật sân thành công",
                data: data,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Cập nhật sân thất bại" });
        }
    }

    async xoaSan(req, res) {
        try {
            const id = req.params.id;
            const san = await Santhethao.findByPk(id);

            if (!san) {
                return res.status(404).json({
                    message: "Không tìm thấy sân",
                });
            }

            await san.destroy();

            return res.json({
                message: "Xóa sân thành công",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Xóa sân thất bại" });
        }
    }

    async layTatCaSan(req, res) {
        try {
            const data = await Santhethao.getAll();
            return res.status(200).json({
                message: "Lấy danh sách sân thành công",
                data: data,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách sân" });
        }
    }
    async laySanTheoChuSan(req, res) {
        try {
            const data = await Santhethao.getAllByChuSan(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
    async laySanTheoChuSanOpen(req, res) {
        try {
            const data = await Santhethao.getAllByChuSanOpen(req.user.id);
            return res.status(200).json({ data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
    async laySanTheoId(req, res) {
        try {
            const id = req.params.id;
            // Gợi ý: Tối ưu bằng cách gộp 2 truy vấn thành 1 sử dụng 'include' của Sequelize
            // Giả sử model 'santhethaos' có quan hệ với 'vitrisans'
            const data = await Santhethao.getByIdWithDetails(id); // Đây là một hàm mới cần được tạo trong model

            // Ví dụ về hàm getByIdWithDetails trong model:
            // static async getByIdWithDetails(id) {
            //   return await db.santhethaos.findByPk(id, {
            //     include: [{ model: db.vitrisans, as: 'vitrisan_details' }]
            //   });
            // }

            return res.status(200).json({ data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    async laySanOpen(req, res) {
        try {
            const data = await Santhethao.getAllOpen();
            return res.status(200).json({ data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
}

module.exports = new SansController();
