const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ngotranhoaibao@gmail.com",
        pass: "nuggemuyoqywbqfm ",
    },
});

const sendVerificationEmail = async (toEmail, token) => {
    const verificationLink = `https://dijuzou621fi5.cloudfront.net/auth/verify?token=${token}`;

    await transporter.sendMail({
        from: '"Bao Ngo" <your_email@gmail.com>',
        to: toEmail,
        subject: "Xác thực đăng ký tài khoản",
        html: `
        <h3>Chào mừng bạn đến với Bao Ngo!</h3>
        <p>Vui lòng xác thực tài khoản bằng cách nhấn vào link bên dưới:</p>
        <a href="${verificationLink}">Xác thực tài khoản</a>
      `,
    });
};

module.exports = sendVerificationEmail;
