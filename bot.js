const servervless = 'mstke3.dpdns.org';
const userSession = {};
const userRateLimit = {};
const RATE_LIMIT_SECONDS = 10;

// Daftar proxy yang tersedia
const proxies = [
  { id: 1, server: '(SG) Digitalocean, LLC 🇸🇬', host: '178.128.80.43', path: '/SG15', port: 443 },
  { id: 2, server: '(SG) Akamai Technologies 🇸🇬', host: '139.162.33.248', path: '/SG5', port: 587 },
  { id: 3, server: '(SG) Oracle Corporation 🇸🇬', host: '213.35.108.135', path: '/SG4', port: 12596 },
  { id: 4, server: '(SG) Godaddy.com, LLC 🇸🇬', host: '97.74.82.87', port: 45837 },
  { id: 5, server: '(SG) OVH SAS 🇸🇬', host: '51.79.158.58', port: 8443 },
  { id: 6, server: '(ID) Pt Pusat Media 🇮🇩', host: '103.6.207.108', port: 8080 },
  { id: 7, server: '(ID) PT. Telekomunikasi 🇮🇩', host: '36.95.152.58', port: 12137 },
  { id: 8, server: '(ID) Amazon.com, Inc 🇮🇩', host: '43.218.77.16', port: 1443 },
  { id: 9, server: '(ID) Google LLC 🇮🇩', host: '35.219.50.99', port: 443 },
  { id: 10, server: '(ID) Akamai Technologies 🇮🇩', host: '172.232.237.112', port: 2053 },
];
  
// Token bot Telegram
const TELEGRAM_BOT_TOKEN = '7653509231:AAEEaEv9FK6oMMtaEftPzjXOIZYzqAmB8Yg';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Webhook handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});


async function checkProxy(proxy) {
  try {
    const response = await fetch(`https://api.bodong.workers.dev/?key=masbodong&ip=${proxy.host}:${proxy.port}`);
    const data = await response.json();

    return {
      proxyStatus: data.status,
      isp: data.isp,
      flag: data.flag,
      country: data.country,
      country_code: data.country_code,
      city: data.city,
      region: data.region,
      delay: data.delay,
      path: data.path || ""
    };
  } catch (error) {
    console.error("Error checking proxy status:", error);
    return null;
  }
}

// Fungsi untuk memeriksa status proxy berdasarkan input pengguna (ip:port)
async function checkProxyByUserInput(chatId, userInput, replyToMessageId = null) {
  const proxies = userInput.split(/\s+|\n+/).map(p => p.trim()).filter(Boolean);
  const MAX_PROXIES = 20;

  if (proxies.length > MAX_PROXIES) {
    return sendMessage(chatId, `❌ Terlalu banyak proxy. Maksimal ${MAX_PROXIES} proxy per permintaan.`, replyToMessageId);
  }

  if (proxies.length === 0 || proxies.some(proxy => !proxy.includes(':'))) {
    return sendMessage(chatId, "❌ Format salah. Harap kirim dalam format ip:port, contoh:\n`139.59.104.29:443`\n`192.168.1.1:8080`", replyToMessageId, { parse_mode: "Markdown" });
  }

  // Kirim pesan sementara dengan reply ke pesan user
  const processingMessage = await sendTemporaryMessage(chatId, `
\`\`\`PROCESSING\nSedang memeriksa status proxy, mohon tunggu...\`\`\``, replyToMessageId);

  let allStatusText = "```🔍Status:\n";

  const checkPromises = proxies.map(async (proxyInput) => {
    const [ip, port] = proxyInput.split(':');
    const proxy = { host: ip, port: parseInt(port, 10) };

    try {
      const status = await checkProxy(proxy);

      if (!status) {
        return `❌ Tidak dapat memeriksa status proxy ${proxy.host}:${proxy.port}.\n\n`;
      }

      const isActive = status.proxyStatus === "ACTIVE ✅";
      const proxyStatus = isActive ? "✅ AKTIF" : "❌ NONAKTIF";

      return `🌐 Proxy  : ${proxy.host}:${proxy.port}\n`
        + `📡 ISP    : ${status.isp || "-"} ${status.flag}\n`
        + `🌍 Negara : ${status.country || ""}\n`
        + `🏙️ Lokasi : ${status.city || status.region || "-"}\n`
        + `🛡️ Status : ${proxyStatus}\n`
        + `⏱️ Latency: ${status.delay || "N/A"} \n\n`;
    } catch (error) {
      return `❌ Error saat memeriksa ${proxy.host}:${proxy.port}.\n\n`;
    }
  });

  const results = await Promise.all(checkPromises);

  allStatusText += results.join("") + "```";

  // Gantikan pesan sementara dengan hasil menggunakan editMessageText
  return editMessageText(chatId, processingMessage.message_id, allStatusText, {
    parse_mode: "MarkdownV2"
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/webhook") {
    try {
      const update = await request.json();

      if (update.message) {
        const chatId = update.message.chat.id;
        const messageId = update.message.message_id;
        const text = update.message.text?.trim();

        if (userSession[chatId]?.method === "ws" && userSession[chatId]?.proxyId) {
          const proxyId = userSession[chatId].proxyId;
          delete userSession[chatId];
          await new Promise((resolve) => setTimeout(resolve, 100));
          await generateConfigWithBug(chatId, text, proxyId, messageId);
        } else {
          await handleMessage(text, chatId, messageId);
        }

      } else if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const dataParts = callbackQuery.data.split(":");
        const action = dataParts[0];
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        if (action === "vless" && dataParts[1]) {
          await generateVlessConfig(chatId, dataParts[1], messageId);

        } else if (action === "method" && dataParts.length === 3) {
          const method = dataParts[1];
          const proxyId = dataParts[2];
          await handleMethodSelection(chatId, method, proxyId, messageId);

        } else if (action === "wildcard" && dataParts.length === 3) {
          const wildcard = dataParts[1];
          const proxyId = dataParts[2];

          const now = Date.now();
          const lastUsed = userRateLimit[chatId] || 0;

          if (now - lastUsed < RATE_LIMIT_SECONDS * 1000) {
            await answerCallbackQuery(callbackQuery.id, {
              text: `⏳ Tunggu ${Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastUsed)) / 1000)} detik sebelum mencoba lagi.`,
              show_alert: true
            });
            return new Response("OK");
          }

          userRateLimit[chatId] = now;

          await editMessageText(chatId, messageId, "```RUNNING\nHarap menunggu, sedang memproses...\n```", {
            parse_mode: "MarkdownV2",
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));
          await deleteMessage(chatId, messageId);
          await generateConfigWithWildcard(chatId, wildcard, proxyId, messageId);
        }
      }

      // ✅ Ini WAJIB untuk menghentikan SPAM
      return new Response("OK");

    } catch (err) {
      console.error("Webhook Error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

// Fungsi menangani berbagai perintah
async function handleMessage(text, chatId, messageId) {
  if (text === "/start") return await sendStartMessage(chatId, messageId);
  if (text === "/proxy") return await sendProxyList(chatId, messageId);
  if (text === "/listwildcard") return await sendWildcardList(chatId, messageId);
  if (text === "/allstatus") return await sendAllProxyStatus(chatId, messageId);
  if (text === "/donasi") return await handleCommand("/donasi", chatId, messageId);

  if (text.includes(":")) {
    return await checkProxyByUserInput(chatId, text, messageId);
  }
}

// Fungsi menangani perintah tambahan
async function handleCommand(command, chatId, messageId) {
  if (command === "/donasi") {
    const messageText = "Silahkan berdonasi karena sedekah itu pahalanya luar biasa.";
    const inlineKeyboard = {
      inline_keyboard: [[{ text: "DONASI", url: "https://sociabuzz.com/mstkkee3/donate" }]],
    };

    return await sendMessage(chatId, messageText, messageId, {
      reply_markup: inlineKeyboard
    });
  }
}


// Fungsi untuk mengirim pesan /start dengan foto
async function sendStartMessage(chatId, replyToMessageId = null) {
  const message = 'Selamat datang di mstkkee3\n\nkirimkan proxy untuk di cek statusnya, format ip:port maksimal 20 proxy, dipisahkan dengan enter contoh 192.168.1.0:443\n192.168.1.1:8443\ndst\n\n/proxy membuat config VLESS dari daftar proxy\n\n/donasi silahkan jika ingin donasi\n\n/listwildcard melihat daftar wildcard\n\n/allstatus melihat semua status proxy.';

  const photoUrl = 'https://pixabay.com/id/photos/wanita-anime-karakter-kecantikan-9054320/';

  const payload = {
    chat_id: chatId,
    photo: photoUrl,
    caption: message,
  };

  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }

  const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  return response.ok ? new Response('OK') : new Response(`Error: ${responseBody.description}`, { status: 500 });
}

async function sendProxyList(chatId, replyToMessageId = null) {
  const message = 'Pilih SERVER/ISP untuk membuat config VLESS:';

  const keyboard = {
    inline_keyboard: proxies.map(proxy => [
      { text: proxy.server, callback_data: `vless:${proxy.id}` }
    ])
  };

  return sendMessage(chatId, message, replyToMessageId, {
    reply_markup: keyboard
  });
}


// Fungsi untuk mengirim daftar wildcard
async function sendWildcardList(chatId, replyToMessageId = null) {
  const wildcardList = `\`\`\`WILDCARD
ava.game.naver.com.mstkkee3.biz.id\n
support.zoom.us.mstkkee3.biz.id\n
cache.netflix.com.mstkkee3.biz.id\n
graph.instagram.com.mstkkee3.biz.id\n
zaintest.vuclip.com.mstkkee3.biz.id\n
edu.ruangguru.com.mstkkee3.biz.id\n
api.midtrans.com.mstkkee3.biz.id\n
quiz.int.vidio.com.mstkkee3.biz.id\n
bakrie.ac.id.mstkkee3.biz.id\n
blog.webex.com.mstkkee3.biz.id\n
investors.spotify.com.mstkkee3.biz.id\n
investor.fb.com.mstkkee3.biz.id\n
untar.ac.id.mstkkee3.biz.id
\`\`\``;

  return sendMessage(chatId, wildcardList, replyToMessageId, {
    parse_mode: 'Markdown'
  });
}

async function checkProxy(proxy) {
    try {
        const response = await fetch(`https://api.bodong.workers.dev/?key=masbodong&ip=${proxy.host}:${proxy.port}`);
        if (!response.ok) throw new Error("API tidak merespons dengan benar");

        const data = await response.json();
        return data && data.proxyStatus ? data : null;
    } catch (error) {
        console.error(`Gagal memeriksa proxy ${proxy.host}:${proxy.port} -`, error);
        return null;
    }
}

async function sendAllProxyStatus(chatId, replyToMessageId = null) {
  const processingMessage = await sendTemporaryMessage(chatId, `
\`\`\`PROCESSING\nSedang memeriksa semua status proxy, harap tunggu sebentar...\`\`\``, replyToMessageId);

  const proxies = [
    { id: 1, server: '(SG) Digitalocean, LLC 🇸🇬', host: '178.128.80.43', path: '/SG15', port: 443 },
    { id: 2, server: '(SG) Akamai Technologies 🇸🇬', host: '139.162.33.248', path: '/SG5', port: 587 },
    { id: 3, server: '(SG) Oracle Corporation 🇸🇬', host: '213.35.108.135', path: '/SG4', port: 12596 },
    { id: 4, server: '(SG) Godaddy.com, LLC 🇸🇬', host: '97.74.82.87', port: 45837 },
    { id: 5, server: '(SG) OVH SAS 🇸🇬', host: '51.79.158.58', port: 8443 },
    { id: 6, server: '(ID) Pt Pusat Media 🇮🇩', host: '103.6.207.108', port: 8080 },
    { id: 7, server: '(ID) PT. Telekomunikasi 🇮🇩', host: '36.95.152.58', port: 12137 },
    { id: 8, server: '(ID) Amazon.com, Inc 🇮🇩', host: '43.218.77.16', port: 1443 },
    { id: 9, server: '(ID) Google LLC 🇮🇩', host: '35.219.50.99', port: 443 },
    { id: 10, server: '(ID) Akamai Technologies 🇮🇩', host: '172.232.237.112', port: 2053 },
  ];

  const results = await Promise.allSettled(proxies.map(checkProxy));

  let statusText = `\`\`\`🔍Status:\n`;

  results.forEach((result, index) => {
    const proxy = proxies[index];
    if (result.status === "fulfilled" && result.value) {
      const data = result.value;
      const isActive = data.proxyStatus.includes("ACTIVE");
      const proxyStatus = isActive ? "✅ AKTIF" : "❌ NONAKTIF";

      statusText += `🌐 Proxy  : ${proxy.host}:${proxy.port}\n`;
      statusText += `📡 ISP    : ${data.isp || "-"} ${data.flag || ""}\n`;
      statusText += `🌍 Negara : ${data.country || ""}\n`;
      statusText += `🏙️ Lokasi : ${data.city || data.region || "-"}\n`;
      statusText += `🛡️ Status : ${proxyStatus}\n`;
      statusText += `⏱️ Latency: ${data.delay || "N/A"}\n\n`;
    } else {
      statusText += `❌ Tidak dapat memeriksa status proxy ${proxy.host}:${proxy.port}.\n\n`;
    }
  });

  statusText += `\`\`\``;

  try {
    await deleteMessage(chatId, processingMessage.message_id);
  } catch (error) {
    console.error("Gagal menghapus pesan proses:", error);
  }

  return sendMessage(chatId, statusText, replyToMessageId, {
    parse_mode: "Markdown"
  });
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

  const message = `
\`\`\`METODE\nSILAHKAN PILIH METODE INJECT:
\`\`\`
  
  `;
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'WebSocket', callback_data: `method:ws:${proxyId}` },
        { text: 'Wildcard', callback_data: `method:wc:${proxyId}` }
      ],
    ]
  };

  return await editMessageText(chatId, messageId, message, {
    reply_markup: keyboard,
    parse_mode: "Markdown"
  });
}

async function handleMethodSelection(chatId, method, proxyId, messageId) {
  const selectedProxy = proxies.find(p => p.id == proxyId);
  if (!selectedProxy) return await sendMessage(chatId, '❌ Proxy tidak ditemukan.');

  if (method === 'ws') {
    // Simpan status pengguna untuk menangani input bug WS
    userSession[chatId] = { method: 'ws', proxyId };

    const message = '⚡ *Silakan kirimkan Bug WS yang ingin dipakai:*';
    return await editMessageText(chatId, messageId, message, { parse_mode: "Markdown" });
  } else if (method === 'wc') {
    // Tampilkan daftar wildcard
    const wildcardList = '🔹 *Pilih Salah Satu Subdomain*';
    const keyboard = {
      inline_keyboard: [
        [{ text: 'ava.game.naver.com', callback_data: `wildcard:ava.game.naver.com:${proxyId}` }],
        [{ text: 'support.zoom.us', callback_data: `wildcard:support.zoom.us:${proxyId}` }],
        [{ text: 'cache.netflix.com', callback_data: `wildcard:cache.netflix.com:${proxyId}` }],
        [{ text: 'graph.instagram.com', callback_data: `wildcard:graph.instagram.com:${proxyId}` }],
        [{ text: 'zaintest.vuclip.com', callback_data: `wildcard:zaintest.vuclip.com:${proxyId}` }],
        [{ text: 'edu.ruangguru.com', callback_data: `wildcard:edu.ruangguru.com:${proxyId}` }],
        [{ text: 'api.midtrans.com', callback_data: `wildcard:api.midtrans.com:${proxyId}` }],
        [{ text: 'quiz.int.vidio.com', callback_data: `wildcard:quiz.int.vidio.com:${proxyId}` }],
        [{ text: 'bakrie.ac.id', callback_data: `wildcard:bakrie.ac.id:${proxyId}` }],
        [{ text: 'blog.webex.com', callback_data: `wildcard:blog.webex.com:${proxyId}` }],
        [{ text: 'investors.spotify.com', callback_data: `wildcard:investors.spotify.com:${proxyId}` }],
        [{ text: 'investor.fb.com', callback_data: `wildcard:investor.fb.com:${proxyId}` }],
        [{ text: 'untar.ac.id', callback_data: `wildcard:untar.ac.id:${proxyId}` }],
      ],
    };

    return await editMessageText(chatId, messageId, wildcardList, {
      parse_mode: "Markdown",
      reply_markup: keyboard
    });
  }
}


async function generateConfigWithBug(chatId, bug, proxyId, messageId) {
  const selectedProxy = proxies.find(p => p.id == proxyId);
  if (!selectedProxy) return sendMessage(chatId, '❌ Proxy tidak ditemukan.');
  
  const processingMessage = await sendTemporaryMessage(chatId, `
\`\`\`RUNNING\nHarap menunggu, sedang memproses...\`\`\``, messageId);


// Simulasi waktu tunggu (3 detik)
await new Promise(resolve => setTimeout(resolve, 3000));

await deleteMessage(chatId, processingMessage.message_id);

const uuid = generateUUID();

const config = `
𝗞𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘀𝗶 𝘃𝗹𝗲𝘀𝘀 𝗮𝗻𝗱𝗮 𝗯𝗲𝗿𝗵𝗮𝘀𝗶𝗹 𝗱𝗶𝗯𝘂𝗮𝘁  
𝗦𝗲𝗿𝘃𝗲𝗿 : \`${selectedProxy.server}\`  
𝗠𝗲𝘁𝗼𝗱𝗲 : 𝘄𝗲𝗯𝘀𝗼𝗰𝗸𝗲𝘁  
𝗕𝘂𝗴 𝗪𝗦 : \`${bug}\`  

\`\`\`VLESS\nvless://${uuid}@${bug}:443?encryption=none&security=tls&sni=${servervless}&type=ws&host=${servervless}&path=/${selectedProxy.host}-${selectedProxy.port}#${selectedProxy.server}\`\`\`

\`\`\`yaml
proxies:  
- name: ${selectedProxy.server}  
  server: ${bug}  
  port: 443  
  type: vless  
  uuid: ${uuid}  
  cipher: auto  
  tls: true  
  skip-cert-verify: true  
  network: ws  
  servername: ${servervless}  
  ws-opts:  
    path: /${selectedProxy.host}-${selectedProxy.port}  
    headers:  
      Host: ${servervless}  
  udp: true\`\`\`
  
🛠️ *Cara Penggunaan:*  
🔹 *VLESS:* Salin config dan gunakan di V2RayNG, Napsternet, dll.  
🔹 *CLASH:* Gunakan config ini di BFR, CFM, CMFA, Clash Meta, Stash, dll.  
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

return sendMessage(chatId, config, messageId, {
    parse_mode: "Markdown"
  });
}


async function generateConfigWithWildcard(chatId, wildcard, proxyId, messageId) {
  try {
    const selectedProxy = proxies.find((p) => p.id == proxyId);
    if (!selectedProxy) {
      return sendMessage(chatId, '❌ Proxy tidak ditemukan.');
    }

    const uuid = generateUUID();
    const bugServer = `${wildcard}.${servervless}`;
    const vlessUrl = `\`\`\`VLESS\nvless://${uuid}@${wildcard}:443?encryption=none&security=tls&sni=${bugServer}&type=ws&host=${bugServer}&path=/${selectedProxy.host}-${selectedProxy.port}#${selectedProxy.server}\`\`\``;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(vlessUrl)}`;

    // Hapus tombol salin kode, jadi keyboard kosong atau bisa dihapus juga reply_markup
    await sendPhoto(chatId, qrUrl);

    const config = `
𝗞𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗮𝘀𝗶 𝘃𝗹𝗲𝘀𝘀 𝗮𝗻𝗱𝗮 𝗯𝗲𝗿𝗵𝗮𝘀𝗶𝗹 𝗱𝗶𝗯𝘂𝗮𝘁  
𝗦𝗲𝗿𝘃𝗲𝗿 : \`${selectedProxy.server}\`  
𝗠𝗲𝘁𝗼𝗱𝗲 : 𝘄𝗶𝗹𝗱𝗰𝗮𝗿𝗱  
𝗕𝘂𝗴 𝗪𝗦 : \`${wildcard}\`

${vlessUrl}

\`\`\`yaml
proxies:  
- name: ${selectedProxy.server}  
  server: ${wildcard}  
  port: 443  
  type: vless  
  uuid: ${uuid}  
  cipher: auto  
  tls: true  
  skip-cert-verify: true  
  network: ws  
  servername: ${bugServer}  
  ws-opts:  
    path: /${selectedProxy.host}-${selectedProxy.port}  
    headers:  
      Host: ${bugServer}  
  udp: true\`\`\`
  
🛠️ *Cara Penggunaan:*  
🔹 *VLESS:* Salin config dan gunakan di V2RayNG, Napsternet, dll.  
🔹 *CLASH:* Gunakan config ini di BFR, CFM, CMFA, Clash Meta, Stash, dll.  
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

    return sendMessage(chatId, config, { parse_mode: "HTML" });

  } catch (error) {
    const errorMsg = `❌ Gagal membuat konfigurasi:\n<pre>${error.message}</pre>`;
    console.error("generateConfigWithWildcard ERROR:", error);
    return sendMessage(chatId, errorMsg, { parse_mode: "HTML" });
  }
}

async function sendTemporaryMessage(chatId, text, replyToMessageId = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  };

  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }

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
async function sendMessage(chatId, text, replyToMessageId = null, options = {}) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: options.parse_mode || 'Markdown',
    reply_to_message_id: replyToMessageId || undefined,
    reply_markup: options.reply_markup || undefined
  };

  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  if (!response.ok) {
    console.error("Gagal kirim pesan:", responseBody);
  }

  return response.ok ? responseBody.result : null;
}

async function editMessageText(chatId, messageId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    ...options,
  };

  return fetch(`${TELEGRAM_API_URL}/editMessageText`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendPhoto(chatId, photoUrl, options = {}) {
  const token = "7653509231:AAEEaEv9FK6oMMtaEftPzjXOIZYzqAmB8Yg"; // ganti sesuai nama variabel token kamu
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  const body = {
    chat_id: chatId,
    photo: photoUrl,
    ...options
  };

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
