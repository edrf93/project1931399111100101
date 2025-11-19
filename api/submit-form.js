// api/submit-form.js

const nodemailer = require('nodemailer');

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // CORS izni (Opsiyonel: Eğer form başka bir domainden gönderiliyorsa)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // HTML Formundan Gelen Veriler
    const { 
        'first-name': firstName, 
        'last-name': lastName, 
        phone, 
        email, 
        website, 
        pageviews, 
        message 
    } = req.body;
    
    // Zorunlu alan kontrolü
    if (!firstName || !lastName || !email || !website || !pageviews || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Nodemailer Taşıyıcısını (Transporter) Oluştur
    // Bilgiler Vercel Ortam Değişkenlerinden (Environment Variables) alınır
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Mail İçeriği
    const mailContent = {
        from: `"${firstName} ${lastName}" <${process.env.SMTP_USER}>`, // Gönderen mail adresiniz
        to: process.env.RECIPIENT_EMAIL || 'edi.derofe@gmail.com', // Alıcı (Başvuruların geleceği adres)
        subject: `[AdRyx.io] Yeni Yayıncı Başvurusu: ${firstName} ${lastName}`,
        html: `
            <h3>Yayıncı Başvuru Detayları</h3>
            <hr style="border: 1px solid #3b82f6;">
            <p><strong>Ad Soyad:</strong> ${firstName} ${lastName}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
            <p><strong>Web Sitesi:</strong> <a href="${website}">${website}</a></p>
            <p><strong>Aylık Gösterim:</strong> ${pageviews}</p>
            <hr>
            <h4>Yayıncı Mesajı:</h4>
            <p style="white-space: pre-wrap;">${message}</p>
        `
    };

    try {
        // Maili Gönder
        await transporter.sendMail(mailContent);
        
        // Başarılı cevabı HTML'e gönder
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Nodemailer Error:', error);
        // Hata cevabı HTML'e gönder
        return res.status(500).json({ success: false, message: 'Failed to send email. Check server logs.' });
    }
};