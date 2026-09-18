const fs = require('fs');
const mineflayer = require('mineflayer');
const express = require('express');

// Render'ın uyku moduna geçmesini önleyen web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Minecraft 10 Bot Test Sistemi Aktif!');
});

app.listen(PORT, () => {
    console.log(`Web sunucusu ${PORT} portunda çalışıyor.`);
});

// settings.json dosyasından ana ayarları okuyoruz
let settings;
try {
    const rawData = fs.readFileSync('./settings.json', 'utf8');
    settings = JSON.parse(rawData);
} catch (err) {
    console.error("settings.json okunurken hata oluştu:", err);
    process.exit(1);
}

// 10 adet botu otomatik olarak döngüyle başlatıyoruz
const TOTAL_BOTS = 10;

for (let i = 1; i <= TOTAL_BOTS; i++) {
    setTimeout(() => {
        // Her bota TestBot_1, TestBot_2 şeklinde dinamik isim veriyoruz
        const botUsername = `TestBot_${i}`;
        console.log(`[+] ${botUsername} başlatılıyor...`);

        const bot = mineflayer.createBot({
            host: settings.server.ip,
            port: settings.server.port,
            username: botUsername
        });

        bot.on('spawn', () => {
            console.log(`[ok] ${botUsername} oyuna giriş yaptı.`);
            
            // Eğer settings.json içinde auto-auth aktifse şifre gönder
            if (settings.utils && settings.utils['auto-auth'] && settings.utils['auto-auth'].enabled) {
                setTimeout(() => {
                    bot.chat(`/register ${settings.utils['auto-auth'].password} ${settings.utils['auto-auth'].password}`);
                    bot.chat(`/login ${settings.utils['auto-auth'].password}`);
                }, 1500);
            }
        });

        bot.on('kicked', (reason) => {
            console.log(`[-] ${botUsername} atıldı:`, reason);
        });

        bot.on('error', (err) => {
            console.log(`[!] ${botUsername} hata oluştu:`, err);
        });

    }, i * 2000); // Sunucuya ani yük binmemesi için botlar 2'şer saniye arayla girer
}
