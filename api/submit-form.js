// api/submit-form.js

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // ... Sadece POST isteklerini kabul etme kontrolü ...

    // HTML Formundan Gelen Veriler (isimlerinizle eşleşmeli)
    const {
        'first-name': firstName,
        'last-name': lastName,
        phone,
        email,
        website,
        pageviews,
        message
    } = req.body;
    
    // Nodemailer Taşıyıcısını Oluştur
    const transporter = nodemailer.createTransport({
        // HOST, PORT, USER ve PASS buradan geliyor:
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT === '465', // Port 465 ise secure: true olur.
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Mail İçeriği
    const mailContent = {
        // Gönderen mail adresi olarak SMTP_USER kullanılıyor:
        from: `AdRyx.io Başvurusu <${process.env.SMTP_USER}>`,
        // Alıcı adresi RECIPIENT_EMAIL değişkeninden geliyor:
        to: process.env.RECIPIENT_EMAIL || 'team@adryx.io',
        subject: `[AdRyx.io] Yeni Yayıncı Başvurusu: ${firstName} ${lastName}`,
        // ... HTML içerik kısmı ...
    };

    // ... try/catch blogu ile mail gönderme kısmı ...
    try {
        await transporter.sendMail(mailContent);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Nodemailer Error:', error); // Hata buradan loglanır
        return res.status(500).json({ success: false, message: 'Failed to send email. Check server logs.' });
    }
};
