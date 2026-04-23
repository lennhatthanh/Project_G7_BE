const {Admin} = require("../models");
const {Chusan} = require("../models");
const bcrypt = require("bcrypt");

class adminController {
    async kiemTraAdmin(req, res) {
        try {
            return res.status(200).json({ status: true });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi: " + error.message });
        }
    }
}

module.exports = new adminController();
