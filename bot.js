const servervless = 'mstkkee3.biz.id';
const servertrojan = 'mstkkee3.biz.id';

const userProcessingStatus = {};

// Daftar proxy yang tersedia
const proxies = [
  { id: 1, server: '(SG) Digital Ocean 🇸🇬', host: '139.59.104.29', path: '/SG59', port: 443 },
  { id: 2, server: '(SG) Akamai Connected Cloud 🇸🇬', host: '103.3.63.253', path: '/SG6', port: 46683 },
  { id: 3, server: '(SG) Oracle Cloud 🇸🇬', host: '129.150.35.29', path: '/SG31', port: 587 },
  { id: 4, server: '(SG) Amazon 🇸🇬', host: '13.228.142.218', path: '/SG32', port: 443 },
  { id: 6, server: '(SG) OVHcloud 🇸🇬', host: '51.79.158.58', path: '/SG182', port: 2053 },
  { id: 8, server: '(ID) Akamai Connected Cloud 🇮🇩', host: '172.235.251.223', path: '/ID9', port: 587 },
  { id: 10, server: '(ID) Amazoncom 🇮🇩', host: '43.218.77.16', path: '/ID4', port: 1443 },
  { id: 7, server: '(ID) PT Pusat Media Indonesia 🇮🇩', host: '103.6.207.108', path: '/ID15', port: 8080 },
  { id: 12, server: '(ID) PT Telkom Indonesia 🇮🇩', host: '36.95.152.58', path: '/ID12', port: 12137 },
  { id: 12, server: '(ID) Google Cloud 🇮🇩', host: '35.219.50.99', path: '/ID3', port: 443 },
];

// Daftar path VLESS yang tersedia
const paths = [
  '/SG59',
  '/SG6',
  '/SG31',
  '/SG32',
  '/SG182',
  '/ID9',
  '/ID4',
  '/ID15',
  '/ID12',
  '/ID3',
];
  
// Token bot Telegram
const TELEGRAM_BOT_TOKEN = '7633787407:AAEkElx5g7G_HlgrGssDgW3dNxLzaGi5_xE';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Webhook handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/webhook') {
    const update = await request.json();

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (text === '/start') return await sendStartMessage(chatId);
      if (text === '/trojan') return await sendProxyList(chatId, '/trojan');
if (text === '/vless') return await sendProxyList(chatId, '/vless');
      if (text === '/listwildcard') return await sendWildcardList(chatId);
      if (text === '/allstatus') return await sendAllProxyStatus(chatId);
    }

    if (update.callback_query) {
      const [action, proxyId] = update.callback_query.data.split(':');
      if (action === 'vless' && proxyId) {
        return await generateVlessConfig(update.callback_query.message.chat.id, proxyId, update.callback_query.message.message_id);
      }
      if (action === 'trojan' && proxyId) {
        return await generateTrojanConfig(update.callback_query.message.chat.id, proxyId, update.callback_query.message.message_id);
      }
    }

    return new Response('OK');
  }

  return new Response('Not Found', { status: 404 });
}

// Fungsi untuk mengirim pesan /start dengan foto
async function sendStartMessage(chatId) {
  const message = 'Selamat datang bro sis! Ketik /vless untuk membuat config VLESS dari daftar proxy yang tersedia\n\nKetik /trojan untuk membuat config TROJAN\n\nKetik /listwildcard untuk melihat daftar wildcard\n\nKetik /allstatus untuk melihat semua status proxy.';
  
  // Ganti dengan URL gambar atau file ID
  const photoUrl = 'https://pixabay.com/id/photos/wanita-anime-karakter-kecantikan-9054320/'; // Ganti dengan URL gambar Anda

  // Mengirim foto
  const payload = {
    chat_id: chatId,
    photo: photoUrl,  // URL gambar
    caption: message, // Teks yang akan menyertai gambar
  };

  const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  return response.ok ? new Response('OK') : new Response(`Error: ${responseBody.description}`, { status: 500 });
}

async function sendProxyList(chatId, command = '/vless') {
  const message = 'Pilih salah satu SERVER atau ISP untuk membuat config:';
  
  // Konfigurasi tombol berdasarkan perintah yang diterima
  let keyboard;
  if (command === '/trojan') {
    keyboard = {
      inline_keyboard: proxies.map(proxy => [{
        text: `${proxy.server}`, // Hanya tombol Trojan untuk perintah /trojan
        callback_data: `trojan:${proxy.id}`,
      }]),
    };
  } else {
    keyboard = {
      inline_keyboard: proxies.map(proxy => [{
        text: `${proxy.server}`,
        callback_data: `vless:${proxy.id}`,
      }]),
    };
  }

  return sendMessage(chatId, message, keyboard);
}

// Fungsi untuk mengirim daftar wildcard
async function sendWildcardList(chatId) {
  const wildcardList = `🔹 Daftar Wildcard:\n\`\`\`
ava.game.naver.com.mstkkee3.biz.id\n
support.zoom.us.mstkkee3.biz.id\n
cache.netflix.com.mstkkee3.biz.id\n
graph.instagram.com.mstkkee3.biz.id\n
zaintest.vuclip.com.mstkkee3.biz.id\n
edu.ruangguru.com.mstkkee3.biz.id\n
api.midtrans.com.mstkkee3.biz.id\n
quiz.int.vidio.com.mstkkee3.biz.id\n
bakrie.ac.id.mstkkee3.biz.id\n
dl.cvs.freefiremobile.com.mstkkee3.biz.id
\`\`\``;  // Menutup tanda backtick yang sesuai

  return sendMessage(chatId, wildcardList);
}

// Fungsi untuk mengecek apakah pengguna masih dalam proses
function isUserProcessing(chatId) {
    const currentTime = Date.now();
    const lastProcessingTime = userProcessingStatus[chatId];

    if (!lastProcessingTime || currentTime - lastProcessingTime > 10000) {
        userProcessingStatus[chatId] = currentTime; // Update waktu terakhir proses
        return false;
    }

    return true; // User masih dalam proses
}

// Fungsi untuk mengecek apakah pengguna masih dalam proses
async function checkProxy(proxy) {
    try {
        const response = await fetch(`https://api.bodong.workers.dev/?key=masbodong&ip=${proxy.host}:${proxy.port}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null; // Jika terjadi error, kembalikan null
    }
}

// Fungsi untuk mengecek semua status proxy
async function sendAllProxyStatus(chatId) {
    // Cek apakah user sudah memproses sebelumnya
    if (isUserProcessing(chatId)) {
        return sendMessage(chatId, "⚠️ Anda sudah memulai proses sebelumnya, harap tunggu beberapa saat.");
    }

    // Kirim pesan sementara "Processing..."
    const processingMessage = await sendTemporaryMessage(chatId, `
\`\`\`PROCESSING\nSedang memproses semua status proxy, harap tunggu sebentar...\`\`\``);

    // Daftar proxy yang akan diperiksa
    const proxies = [
  { id: 1, server: '(SG) Digital Ocean 🇸🇬', host: '139.59.104.29', path: '/SG59', port: 443 },
  { id: 2, server: '(SG) Akamai Connected Cloud 🇸🇬', host: '103.3.63.253', path: '/SG6', port: 46683 },
  { id: 3, server: '(SG) Oracle Cloud 🇸🇬', host: '129.150.35.29', path: '/SG31', port: 587 },
  { id: 4, server: '(SG) Amazon 🇸🇬', host: '13.228.142.218', path: '/SG32', port: 443 },
  { id: 6, server: '(SG) OVHcloud 🇸🇬', host: '51.79.158.58', path: '/SG182', port: 2053 },
  { id: 8, server: '(ID) Akamai Connected Cloud 🇮🇩', host: '172.235.251.223', path: '/ID9', port: 587 },
  { id: 10, server: '(ID) Amazoncom 🇮🇩', host: '43.218.77.16', path: '/ID4', port: 1443 },
  { id: 7, server: '(ID) PT Pusat Media Indonesia 🇮🇩', host: '103.6.207.108', path: '/ID15', port: 8080 },
  { id: 12, server: '(ID) PT Telkom Indonesia 🇮🇩', host: '36.95.152.58', path: '/ID12', port: 12137 },
  { id: 12, server: '(ID) Google Cloud 🇮🇩', host: '35.219.50.99', path: '/ID3', port: 443 },
];

    // Kirim semua request secara paralel
    const results = await Promise.all(proxies.map(proxy => checkProxy(proxy)));

    let statusText = `
    \`\`\`🔍Status:\n`;

    results.forEach((status, index) => {
        const proxy = proxies[index];
        if (status) {
            const isActive = status.proxyStatus === "ACTIVE ✅";
            const proxyStatus = isActive ? "✅ AKTIF" : "❌ NONAKTIF";

            statusText += `🌐 Proxy  : ${proxy.host}:${proxy.port}\n`;
            statusText += `📂 Path   : ${proxy.path}\n`;
            statusText += `📡 ISP    : ${status.isp || "-"}\n`;
            statusText += `🌍 Negara : ${status.country || "-"} ${status.country_code || ""}\n`;
            statusText += `🏙️ Lokasi : ${status.city || status.region || "-"}\n`;
            statusText += `🛡️ Status : ${proxyStatus}\n`;
            statusText += `⏱️ Latency: ${status.delay || "N/A"} \n\n`;
        } else {
            statusText += `❌ Tidak dapat memeriksa status proxy ${proxy.host}:${proxy.port}.\n\n`;
        }
    });

    statusText += `
    \`\`\``; // Menutup blok kode Markdown

    // Hapus pesan proses dan kirim hasil akhir
    await deleteMessage(chatId, processingMessage.message_id);
    return sendMessage(chatId, statusText);
}

// Fungsi untuk menghasilkan UUID random
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function generateVlessConfig(chatId, proxyId, messageId) {
  const selectedProxy = proxies.find(p => p.id == proxyId);
  if (!selectedProxy) return sendMessage(chatId, '❌ Proxy tidak ditemukan.');

  const uuid = generateUUID();
  const message = `
  
╭━━━━━━━━━━━━━━━━━━━━━╮  
┃  🚀 *VLESS & CLASH CONFIG*  
┃  ⚡ *High-Speed | Secure | Stable*  
╰━━━━━━━━━━━━━━━━━━━━━╯

  \`\`\`VLESS\nvless://${uuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&type=ws&host=${servervless}&path=${selectedProxy.path}#${selectedProxy.server}\`\`\`
  
\`\`\`CLASH
proxies:
- name: ${selectedProxy.server}
  server: ${servervless}
  port: 443
  type: vless
  uuid: ${uuid}
  cipher: auto
  tls: true
  skip-cert-verify: true
  network: ws
  servername: ${servervless}
  ws-opts:
    path: ${selectedProxy.path}
    headers:
      Host: ${servervless}
  udp: true\`\`\`
  
🛠️ *Cara Penggunaan:*  
🔹 *VLESS:* Salin config dan gunakan di V2RayNG, Napsternet, dll.  
🔹 *CLASH:* Gunakan config ini di Clash Meta, Stash, dll.  
🔹 *Optimasi:* Jika koneksi lemot, coba ganti SERVER/ISP.  

💡 *Tips & Tricks:*  
✅ Gunakan server terdekat untuk kecepatan maksimal  
✅ Pastikan *mode TLS aktif* agar lebih aman.

╭━━━━━━━━━━━━━━━━━━━━━╮  
┃  📞 *Need Help?* @Mstk3e !  
┃  🚀 *Nikmati internet lebih cepat & aman!*  
┃  🌐 *Join komunitas:* [@vless_bodong]  
╰━━━━━━━━━━━━━━━━━━━━━╯
  `;
  await removeInlineKeyboard(chatId, messageId);
  return sendMessage(chatId, message);
}

async function generateTrojanConfig(chatId, proxyId, messageId) {
  const selectedProxy = proxies.find(p => p.id == proxyId);
  if (!selectedProxy) return sendMessage(chatId, '❌ Proxy tidak ditemukan.');

  const uuid = generateUUID();
  const message = `
  
╭━━━━━━━━━━━━━━━━━━━━━╮  
┃  🚀 *TROJAN & CLASH CONFIG*  
┃  ⚡ *High-Speed | Secure | Stable*  
╰━━━━━━━━━━━━━━━━━━━━━╯

  \`\`\`TROJAN\ntrojan://${uuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&type=ws&host=${servertrojan}&path=${selectedProxy.path}#${selectedProxy.server}\`\`\`
  
\`\`\`CLASH
proxies:
- name: ${selectedProxy.server}
  server: ${servertrojan}
  port: 443
  type: trojan
  password: ${uuid}
  skip-cert-verify: true
  network: ws
  sni: ${servertrojan}
  ws-opts:
    path: ${selectedProxy.path}
    headers:
      Host: ${servertrojan}
  udp: true\`\`\`
  
🛠️ *Cara Penggunaan:*  
🔹 *TROJAN:* Salin config dan gunakan di V2RayNG, Napsternet, dll.  
🔹 *CLASH:* Gunakan config ini di Clash Meta, Stash, dll.  
🔹 *Optimasi:* Jika koneksi lemot, coba ganti SERVER/ISP.  

💡 *Tips & Tricks:*  
✅ Gunakan server terdekat untuk kecepatan maksimal  
✅ Pastikan *mode TLS aktif* agar lebih aman.

╭━━━━━━━━━━━━━━━━━━━━━╮  
┃  📞 *Need Help?* @Mstk3e !  
┃  🚀 *Nikmati internet lebih cepat & aman!*  
┃  🌐 *Join komunitas:* [@vless_bodong]  
╰━━━━━━━━━━━━━━━━━━━━━╯
  `;
  await removeInlineKeyboard(chatId, messageId);
  return sendMessage(chatId, message);
}

async function sendTemporaryMessage(chatId, text) {
  const payload = { chat_id: chatId, text, parse_mode: 'Markdown' };

  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  if (response.ok) {
    return responseBody.result; // Kembalikan pesan yang dikirim
  } else {
    console.error(`Error sending temporary message: ${responseBody.description}`);
    return null;
  }
}

async function deleteMessage(chatId, messageId) {
  const response = await fetch(`${TELEGRAM_API_URL}/deleteMessage`, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  if (!response.ok) {
    console.error(`Error deleting message: ${responseBody.description}`);
  }
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text, reply_markup = null) {
  const payload = { chat_id: chatId, text, parse_mode: 'Markdown' };
  if (reply_markup) payload.reply_markup = reply_markup;

  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  return response.ok ? new Response('OK') : new Response(`Error: ${responseBody.description}`, { status: 500 });
}

// Fungsi untuk menghapus tombol inline setelah pengguna memilih
async function removeInlineKeyboard(chatId, messageId) {
  const response = await fetch(`${TELEGRAM_API_URL}/editMessageReplyMarkup`, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } }),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  if (!response.ok) {
    console.error(`Error removing inline keyboard: ${responseBody.description}`);
    return new Response(`Error: ${responseBody.description}`, { status: 500 });
  }
  return new Response('OK');
}
