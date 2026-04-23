const jwt = require("jsonwebtoken");
require("dotenv").config();

class authMiddleware {
    verifyToken(req, res, next) {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                message: "Không có token",
                status: false,
            });
        }

        const accessToken = authHeader.split(" ")[1];

        if (!accessToken || accessToken === "null" || accessToken === "undefined") {
            return res.status(401).json({
                message: "Token không hợp lệ",
                status: false,
            });
        }

        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({
                    message: "Token is not valid",
                    status: false,
                });
            }

            req.user = user;
            next();
        });
    }
    verifyTokenDatSan(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
        return next();
    }

    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
}
}

module.exports = new authMiddleware();
