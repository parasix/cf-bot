import { connect } from 'cloudflare:sockets';

let listProxy;
let proxyIP;
let proxyPort;
let randomProxy;
const VARIABLE = 'LISTPROXY';
const linkTarget = 'https://t.me/mistakkee_bot';
let domainvless;
const tags = `#Group Telegram : https://t.me/mistakkee_bot
#Author : https://t.me/trust_bodong

`;

// Contoh penggunaan dalam handler utama
export default async function handler(request) {
  try {
    const domainvless = request.headers.get("Host");
    
    if (request.url.endsWith('/favicon.ico')) {
      const imageUrl = 'https://raw.githubusercontent.com/parasix/juju/main/JP-Kikuchi-Hina.jpg';
      const imageResponse = await fetch(imageUrl);

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        return new Response(imageBlob, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' }
        });
      } else {
        return new Response(null, { status: 404 });
      }
    }
    
        listProxy = JSON.parse(env[VARIABLE]);               

    if (!Array.isArray(listProxy)) {
        throw new Error("PROXYLIST is not a valid array.");
    }    
    
          if (listProxy.length === 0) {
        throw new Error("PROXYLIST is empty.");
    }        
            const url = new URL(request.url);
            const upgradeHeader = request.headers.get('Upgrade');
            
            const type = url.searchParams.get('type');
            const domain = url.searchParams.get('bug');

            // Hilangkan tanda slash (/) di akhir url.pathname jika ada
                        
            
           const pathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

            // Validasi jika ada parameter selain 'type' dan 'bug'
          const allowedParams = ['type', 'bug'];
            const hasInvalidParams = Array.from(url.searchParams.keys()).some(param => !allowedParams.includes(param));

            if (hasInvalidParams) {
                return new Response('Error: Invalid parameters provided.', {
                    status: 400, // Bad Request
                    headers: { 'Content-Type': 'text/plain' },
                });
            }
          
              
                                          
              if (pathname === '/sub/clash') {
    // Periksa keberadaan parameter 'type' dan 'domain'
    if (!type || !domain) {
        return new Response('Error: Missing required parameters "type" or "bug".', {
            status: 400, // Bad Request
            headers: { 'Content-Type': 'text/plain' },
        });
    }
        // Assuming 'listProxy' is an array of entries with 'path' and 'proxy'
        let clashConfigs = "";

        for (const entry of listProxy) {
            // Generate the Clash config for each entry in listProxy
            const clashUrl = await generateClashURLWithISP(domain, type);
            clashConfigs = clashUrl;
        }

        // Kembalikan respons dengan URL CLASH
        return new Response(clashConfigs, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });

    
}

             if (pathname === '/sub/clash/proxies') {
    // Periksa keberadaan parameter 'type' dan 'domain'
    if (!type || !domain) {
        return new Response('Error: Missing required parameters "type" or "bug".', {
            status: 400, // Bad Request
            headers: { 'Content-Type': 'text/plain' },
        });
    }
        // Assuming 'listProxy' is an array of entries with 'path' and 'proxy'
        let clashConfigs = "";

        for (const entry of listProxy) {
            // Generate the Clash config for each entry in listProxy
            const clashUrl = await generateClashProxies(domain, type);
            clashConfigs = clashUrl;
        }

        // Kembalikan respons dengan URL CLASH
        return new Response(clashConfigs, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });

    
}

            // Jika permintaan adalah untuk '/sub/vless'
           if (pathname === '/sub/vless') {
                // Periksa keberadaan parameter 'type' dan 'bug'
                if (!type || !domain) {
                    return new Response('Error: Missing required parameters "type" or "bug".', {
                        status: 400, // Bad Request
                        headers: { 'Content-Type': 'text/plain' },
                    });
                }

                let vlessUrls = "";
                let ispCount = {};

                // Fetch dan buat URL VLESS untuk setiap entry secara berurutan
                for (const entry of listProxy) {
                    const vlessUrl = await generateVlessURLWithISP(entry.path, domain, type, entry.ispVless, ispCount);
                    vlessUrls += vlessUrl + '\n\n';  
                }                
                
                const vlessUrlss = tags + vlessUrls + vlessRandom;

                // Kembalikan respons dengan URL VLESS
                return new Response(vlessUrlss, {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' },
                });
            }

if (upgradeHeader === 'websocket' && url.pathname === '/random') {
                if (!randomProxy) {
                    randomProxy = await getActiveProxy();
                    setInterval(async () => {
                        randomProxy = await getActiveProxy();
                    }, 600000); // Update every 10 minutes
                }
                [proxyIP, proxyPort = '443' ] = randomProxy.split(':');        
                return await VlcfHandler(request);
            }

            let pathMatched = false;
            for (const entry of listProxy) {
                if (upgradeHeader === 'websocket' && upgradeHeader && url.pathname === entry.path) {
                    [proxyIP, proxyPort = '443'] = entry.proxy.split(':');  
                    pathMatched = true  
                   return await VlcfHandler(request);                    
                }
            }
            
            


if (!pathMatched) {
    const targetUrl = `${linkTarget}${new URL(request.url).pathname}`;
    const proxyResponse = await fetch(targetUrl, { headers: request.headers });

    return new Response(proxyResponse.body, {
        headers: {
            ...proxyResponse.headers,
        },
    });
}
               
        } catch (err) {
    console.log("ERROR", err);    
    return new Response(err, {
        headers: { 'Content-Type': 'text/plain' },
        status: 500
    });
}
    }
};


async function getActiveProxy() {
    const proxy = listProxy[Math.floor(Math.random() * listProxy.length)].proxy;
    const ip = proxy;  // Memisahkan IP dari port
    return ip;
}


function generateUUIDv4() {
    const randomValues = crypto.getRandomValues(new Uint8Array(16));
    randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
    return [
        randomValues[0].toString(16).padStart(2, '0'),
        randomValues[1].toString(16).padStart(2, '0'),
        randomValues[2].toString(16).padStart(2, '0'),
        randomValues[3].toString(16).padStart(2, '0'),
        randomValues[4].toString(16).padStart(2, '0'),
        randomValues[5].toString(16).padStart(2, '0'),
        randomValues[6].toString(16).padStart(2, '0'),
        randomValues[7].toString(16).padStart(2, '0'),
        randomValues[8].toString(16).padStart(2, '0'),
        randomValues[9].toString(16).padStart(2, '0'),
        randomValues[10].toString(16).padStart(2, '0'),
        randomValues[11].toString(16).padStart(2, '0'),
        randomValues[12].toString(16).padStart(2, '0'),
        randomValues[13].toString(16).padStart(2, '0'),
        randomValues[14].toString(16).padStart(2, '0'),
        randomValues[15].toString(16).padStart(2, '0'),
    ].join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}


async function generateClashURLWithISP(domain, type) {
    const uuid = generateUUIDv4();        

    let host, sni;

    // Set host dan sni sesuai dengan type
    if (type === 'ws') {
        host = domainvless;
        sni = domainvless;
    } else if (type === 'wildcard' || type === 'sni') {
        host = `${domain}.${domainvless}`;
        sni = `${domain}.${domainvless}`;
    } else {
        throw new Error("Invalid type parameter");
    }

    try {
    
        // Membuat URL CLASH dengan informasi ISP
        let clashConfig = `${tags}port: 7890
socks-port: 7891
redir-port: 7892
mixed-port: 7893
tproxy-port: 7895
ipv6: false
mode: rule
log-level: silent
allow-lan: true
external-controller: 0.0.0.0:9090
secret: ""
bind-address: "*"
unified-delay: true
profile:
  store-selected: true
  store-fake-ip: true
dns:
  enable: true
  ipv6: false
  use-host: true
  enhanced-mode: fake-ip
  listen: 0.0.0.0:7874
  nameserver:
    - 8.8.8.8
    - 1.0.0.1
    - https://dns.google/dns-query
  fallback:
    - 1.1.1.1
    - 8.8.4.4
    - https://cloudflare-dns.com/dns-query
    - 112.215.203.254
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
    - 112.215.203.254
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "*.lan"
    - "*.localdomain"
    - "*.example"
    - "*.invalid"
    - "*.localhost"
    - "*.test"
    - "*.local"
    - "*.home.arpa"
    - time.*.com
    - time.*.gov
    - time.*.edu.cn
    - time.*.apple.com
    - time1.*.com
    - time2.*.com
    - time3.*.com
    - time4.*.com
    - time5.*.com
    - time6.*.com
    - time7.*.com
    - ntp.*.com
    - ntp1.*.com
    - ntp2.*.com
    - ntp3.*.com
    - ntp4.*.com
    - ntp5.*.com
    - ntp6.*.com
    - ntp7.*.com
    - "*.time.edu.cn"
    - "*.ntp.org.cn"
    - +.pool.ntp.org
    - time1.cloud.tencent.com
    - music.163.com
    - "*.music.163.com"
    - "*.126.net"
    - musicapi.taihe.com
    - music.taihe.com
    - songsearch.kugou.com
    - trackercdn.kugou.com
    - "*.kuwo.cn"
    - api-jooxtt.sanook.com
    - api.joox.com
    - joox.com
    - y.qq.com
    - "*.y.qq.com"
    - streamoc.music.tc.qq.com
    - mobileoc.music.tc.qq.com
    - isure.stream.qqmusic.qq.com
    - dl.stream.qqmusic.qq.com
    - aqqmusic.tc.qq.com
    - amobile.music.tc.qq.com
    - "*.xiami.com"
    - "*.music.migu.cn"
    - music.migu.cn
    - "*.msftconnecttest.com"
    - "*.msftncsi.com"
    - msftconnecttest.com
    - msftncsi.com
    - localhost.ptlogin2.qq.com
    - localhost.sec.qq.com
    - +.srv.nintendo.net
    - +.stun.playstation.net
    - xbox.*.microsoft.com
    - xnotify.xboxlive.com
    - +.battlenet.com.cn
    - +.wotgame.cn
    - +.wggames.cn
    - +.wowsgame.cn
    - +.wargaming.net
    - proxy.golang.org
    - stun.*.*
    - stun.*.*.*
    - +.stun.*.*
    - +.stun.*.*.*
    - +.stun.*.*.*.*
    - heartbeat.belkin.com
    - "*.linksys.com"
    - "*.linksyssmartwifi.com"
    - "*.router.asus.com"
    - mesu.apple.com
    - swscan.apple.com
    - swquery.apple.com
    - swdownload.apple.com
    - swcdn.apple.com
    - swdist.apple.com
    - lens.l.google.com
    - stun.l.google.com
    - +.nflxvideo.net
    - "*.square-enix.com"
    - "*.finalfantasyxiv.com"
    - "*.ffxiv.com"
    - "*.mcdn.bilivideo.cn"
    - +.media.dssott.com
proxies:
`;

// Buat objek untuk melacak jumlah setiap ISP
let ispCounter = {};
let ispFinalList = []; // Array untuk menyimpan nama ISP yang sudah dimodifikasi

// Loop through the proxy list dan kumpulkan nama ISP yang unik
for (const proxyEntry of listProxy) {
    let baseName = proxyEntry.ispVless;
    if (!ispCounter[baseName]) {
        ispCounter[baseName] = 1;
    } else {
        ispCounter[baseName]++;
        baseName += ` ${ispCounter[baseName]}`; // Tambahkan angka jika ada duplikasi
    }
    
    ispFinalList.push({ name: baseName, path: proxyEntry.path }); // Simpan nama dan path yang sudah dimodifikasi
}

// Mulai membangun konfigurasi Clash menggunakan kumpulan ispFinalList
for (const proxyEntry of ispFinalList) {
    const name = `${proxyEntry.name}`;
    let names = name.toUpperCase();

    // Tambahkan proxy ke konfigurasi Clash
    const clashProxy = `- name: ${name}
  type: vless
  server: ${type === 'sni' ? domainvless : domain}
  port: 443
  uuid: ${generateUUIDv4()}
  cipher: none
  skip-cert-verify: true
  servername: ${sni}
  tls: true
  network: ws
  ws-opts:
    path: ${proxyEntry.path}
    headers:
      Host: ${host}
  udp: true\n`;

    clashConfig += clashProxy;
}

// Tambahkan random proxy
let namesRandom;
const nameRandom = `Random ISP`;
namesRandom = nameRandom.toUpperCase();

const clashRandom = `- name: ${nameRandom}
  type: vless
  server: ${type === 'sni' ? domainvless : domain}
  port: 443
  uuid: ${generateUUIDv4()}
  cipher: none
  skip-cert-verify: true
  servername: ${sni}
  tls: true
  network: ws
  ws-opts:
    path: /random
    headers:
      Host: ${host}
  udp: true`;
clashConfig += `${clashRandom}\nproxy-groups:
- name: MANUAL
  type: select  
  proxies:  
`;

// Gunakan ispFinalList untuk menambahkan proxy ke grup proxy
for (const proxyEntry of ispFinalList) {
    const name = `${proxyEntry.name}`;
    let names = name.toUpperCase();

    clashConfig += `  - ${name}\n`;
}

clashConfig += `  - ${nameRandom}\n  - OTOMATIS\n  - BEST PING\n`;

// Tambahkan bagian otomatis
clashConfig += `- name: OTOMATIS
  type: fallback
  url: https://speed.cloudflare.com/locations
  interval: 60
  proxies:
`;

for (const proxyEntry of ispFinalList) {
    const name = `${proxyEntry.name}`;
    let names = name.toUpperCase();

    clashConfig += `  - ${name}\n`;
}

clashConfig += `  - ${nameRandom}\n- name: BEST PING
  type: url-test
  url: https://speed.cloudflare.com/locations
  interval: 60
  proxies:
`;

for (const proxyEntry of ispFinalList) {
    const name = `${proxyEntry.name}`;
    let names = name.toUpperCase();

    clashConfig += `  - ${name}\n`;
}

clashConfig += `  - ${nameRandom}\nrules:
- IP-CIDR,198.18.0.1/16,REJECT,no-resolve
- MATCH,MANUAL
`;

return clashConfig;
    } catch (error) {
        console.error('Error generating CLASH URL:', error);
        return 'Error generating CLASH URL';
    }
}

//CLASH PROXIES
async function generateClashProxies(domain, type) {
    const uuid = generateUUIDv4();        

    let host, sni;

    // Set host dan sni sesuai dengan type
    if (type === 'ws') {
        host = domainvless;
        sni = domainvless;
    } else if (type === 'wildcard' || type === 'sni') {
        host = `${domain}.${domainvless}`;
        sni = `${domain}.${domainvless}`;
    } else {
        throw new Error("Invalid type parameter");
    }

    try {
    
        // Membuat URL CLASH dengan informasi ISP
        let clashConfig = `${tags}proxies:
`;

// Buat objek untuk melacak jumlah setiap ISP
let ispCounter = {};
let ispFinalList = []; // Array untuk menyimpan nama ISP yang sudah dimodifikasi

// Loop through the proxy list dan kumpulkan nama ISP yang unik
for (const proxyEntry of listProxy) {
    let baseName = proxyEntry.ispVless;
    if (!ispCounter[baseName]) {
        ispCounter[baseName] = 1;
    } else {
        ispCounter[baseName]++;
        baseName += ` ${ispCounter[baseName]}`; // Tambahkan angka jika ada duplikasi
    }
    
    ispFinalList.push({ name: baseName, path: proxyEntry.path }); // Simpan nama dan path yang sudah dimodifikasi
}

// Mulai membangun konfigurasi Clash menggunakan kumpulan ispFinalList
for (const proxyEntry of ispFinalList) {
    const name = `${proxyEntry.name}`;
    let names = name.toUpperCase();

    // Tambahkan proxy ke konfigurasi Clash
    const clashProxy = `- name: ${name}
  type: vless
  server: ${type === 'sni' ? domainvless : domain}
  port: 443
  uuid: ${generateUUIDv4()}
  cipher: none
  skip-cert-verify: true
  servername: ${sni}
  tls: true
  network: ws
  ws-opts:
    path: ${proxyEntry.path}
    headers:
      Host: ${host}
  udp: true\n`;

    clashConfig += clashProxy;
}

// Tambahkan random proxy
let namesRandom;
const nameRandom = `Random ISP`;
namesRandom = nameRandom.toUpperCase();

const clashRandom = `- name: ${nameRandom}
  type: vless
  server: ${type === 'sni' ? domainvless : domain}
  port: 443
  uuid: ${generateUUIDv4()}
  cipher: none
  skip-cert-verify: true
  servername: ${sni}
  tls: true
  network: ws
  ws-opts:
    path: /random
    headers:
      Host: ${host}
  udp: true`;  
clashConfig += `${clashRandom}`;
return clashConfig;
    } catch (error) {
        console.error('Error generating CLASH URL:', error);
        return 'Error generating CLASH URL';
    }
}


let vlessRandom;
// Fungsi untuk menggabungkan data dari kedua API dan menghasilkan URL VLESS
async function generateVlessURLWithISP(path, domain, type, ispVless, ispCount) {
    const uuid = generateUUIDv4();
    const port = 443;
    const security = "tls";
    const encryption = "none";
    const fingerprint = "random";    

    let host, sni;    

    // Set host dan sni sesuai dengan type
    if (type === 'ws') {
        host = domainvless;
        sni = domainvless;
    } else if (type === 'wildcard' || type === 'sni') {
        host = `${domain}.${domainvless}`;
        sni = `${domain}.${domainvless}`;
    } else {
        throw new Error("Invalid type parameter");
    }        
    
   if (!ispCount[ispVless]) {
        ispCount[ispVless] = 1;
    } else {
        ispCount[ispVless]++;
        ispVless += ` ${ispCount[ispVless]}`; // Tambahkan angka jika ada duplikasi
    }
    
    try {
        const names = `${ispVless}`;
        const namesVless = names.replace(/ /g, "+");
        const nameR = `Random ISP`;
        const nameRandom = nameR.replace(/ /g, "+");
        
        const vlessUrl = `vless://${uuid}@${type === 'sni' ? domainvless : domain}:${port}?path=${encodeURIComponent(path)}&security=${security}&encryption=${encryption}&host=${host}&fp=${fingerprint}&type=ws&sni=${sni}#${namesVless}`;
        
        vlessRandom = `vless://${generateUUIDv4()}@${type === 'sni' ? domainvless : domain}:${port}?path=${encodeURIComponent('/random')}&security=${security}&encryption=${encryption}&host=${host}&fp=${fingerprint}&type=ws&sni=${sni}#${nameRandom}`;

        // Membuat URL VLESS dengan informasi ISP
        return vlessUrl;
    } catch (error) {
        console.error('Error generating VLESS URL:', error);
        return 'Error generating VLESS URL';
    }
}


async function indexHtml(request) {
const index = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vless | Bodong</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #232526, #414345);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }

        .container {
            text-align: center;
            background: rgba(0, 0, 0, 0.7);
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            animation: fadeIn 1.5s ease-in-out;
            max-width: 95%; 
        }

        h1 {
            font-size: 2.8em;
            margin: 0 0 20px;
            letter-spacing: 2px;
            animation: slideDown 1.2s ease-out;
        }

        p {
            font-size: 1.2em;
            margin: 0 0 30px;
            animation: fadeIn 1.8s ease-in-out;
        }

        button {
            font-size: 1.3em;
            padding: 15px 40px;
            color: #fff;
            background: linear-gradient(45deg, #ff4b1f, #ff9068);
            border: none;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(255, 75, 31, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            transform: scale(0);
            transition: transform 0.4s ease;
        }

        button:hover::before {
            transform: scale(2);
        }

        button:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(255, 75, 31, 0.4);
        }

        /* Animations */
           @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideDown {
            from {
                transform: translateY(-30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Join Our Telegram Group</h1>
        <p>Stay updated and connected with our community!</p>
        <button id="join-btn">Join Now</button>
    </div>
    <script>
        document.getElementById("join-btn").addEventListener("click", function () {
            window.open("https://t.me/vless_bodong", "_blank");
        });
    </script>
</body>
</html>`

return new Response(index, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

}


async function VlcfHandler(request) {
	const webSocketPair = new WebSocketPair();
	const [client, webSocket] = Object.values(webSocketPair);

	webSocket.accept();

	let address = '';
	let portWithRandomLog = '';
	const log = (info, event) => {
		console.log(`[${address}:${portWithRandomLog}] ${info}`, event || '');
	};
	const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';

	const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

	let remoteSocketWapper = {
		value: null,
	};
	let udpStreamWrite = null;
	let isDns = false;

	readableWebSocketStream.pipeTo(new WritableStream({
		async write(chunk, controller) {
			if (isDns && udpStreamWrite) {
				return udpStreamWrite(chunk);
			}
			if (remoteSocketWapper.value) {
				const writer = remoteSocketWapper.value.writable.getWriter()
				await writer.write(chunk);
				writer.releaseLock();
				return;
			}

			const {
				hasError,
				message,
				portRemote = 443,
				addressRemote = '',
				rawDataIndex,
				vlessVersion = new Uint8Array([0, 0]),
				isUDP,
			} = processVlessHeader(chunk);
			address = addressRemote;
			portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? 'udp ' : 'tcp '
				} `;
			if (hasError) {
				throw new Error(message); 
				return;
			}
			if (isUDP) {
				if (portRemote === 53) {
					isDns = true;
				} else {
					throw new Error('UDP proxy only enable for DNS which is port 53');
					return;
				}
			}
			const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
			const rawClientData = chunk.slice(rawDataIndex);

			if (isDns) {
				const { write } = await handleUDPOutBound(webSocket, vlessResponseHeader, log);
				udpStreamWrite = write;
				udpStreamWrite(rawClientData);
				return;
			}
			handleTCPOutBound(remoteSocketWapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log);
		},
		close() {
			log(`readableWebSocketStream is close`);
		},
		abort(reason) {
			log(`readableWebSocketStream is abort`, JSON.stringify(reason));
		},
	})).catch((err) => {
		log('readableWebSocketStream pipeTo error', err);
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}

async function handleTCPOutBound(remoteSocket, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log,) {
	async function connectAndWrite(address, port) {
		const tcpSocket = connect({
			hostname: address,
			port: port,
		});
		remoteSocket.value = tcpSocket;
		log(`connected to ${address}:${port}`);
		const writer = tcpSocket.writable.getWriter();
		await writer.write(rawClientData);
		writer.releaseLock();
		return tcpSocket;
	}

	async function retry() {
		const tcpSocket = await connectAndWrite(proxyIP || addressRemote, proxyPort || portRemote);
		tcpSocket.closed.catch(error => {
			console.log('retry tcpSocket closed error', error);
		}).finally(() => {
			safeCloseWebSocket(webSocket);
		})
		remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
	}

	const tcpSocket = await connectAndWrite(addressRemote, portRemote);

	remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
	let readableStreamCancel = false;
	const stream = new ReadableStream({
		start(controller) {
			webSocketServer.addEventListener('message', (event) => {
				if (readableStreamCancel) {
					return;
				}
				const message = event.data;
				controller.enqueue(message);
			});
			webSocketServer.addEventListener('close', () => {
				safeCloseWebSocket(webSocketServer);
				if (readableStreamCancel) {
					return;
				}
				controller.close();
			}
			);
			webSocketServer.addEventListener('error', (err) => {
				log('webSocketServer has error');
				controller.error(err);
			}
			);
			const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
			if (error) {
				controller.error(error);
			} else if (earlyData) {
				controller.enqueue(earlyData);
			}
		},

		pull(controller) {
		},
		cancel(reason) {
			if (readableStreamCancel) {
				return;
			}
			log(`ReadableStream was canceled, due to ${reason}`)
			readableStreamCancel = true;
			safeCloseWebSocket(webSocketServer);
		}
	});

	return stream;

}
function processVlessHeader(
	vlessBuffer
) {
	if (vlessBuffer.byteLength < 24) {
		return {
			hasError: true,
			message: 'invalid data',
		};
	}
	const version = new Uint8Array(vlessBuffer.slice(0, 1));
	let isValidUser = true;
	let isUDP = false;
	if (!isValidUser) {
		return {
			hasError: true,
			message: 'invalid user',
		};
	}

	const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];

	const command = new Uint8Array(
		vlessBuffer.slice(18 + optLength, 18 + optLength + 1)
	)[0];
	if (command === 1) {
	} else if (command === 2) {
		isUDP = true;
	} else {
		return {
			hasError: true,
			message: `command ${command} is not support, command 01-tcp,02-udp,03-mux`,
		};
	}
	const portIndex = 18 + optLength + 1;
	const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
	const portRemote = new DataView(portBuffer).getUint16(0);

	let addressIndex = portIndex + 2;
	const addressBuffer = new Uint8Array(
		vlessBuffer.slice(addressIndex, addressIndex + 1)
	);

	const addressType = addressBuffer[0];
	let addressLength = 0;
	let addressValueIndex = addressIndex + 1;
	let addressValue = '';
	switch (addressType) {
		case 1:
			addressLength = 4;
			addressValue = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			).join('.');
			break;
		case 2:
			addressLength = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + 1)
			)[0];
			addressValueIndex += 1;
			addressValue = new TextDecoder().decode(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			break;
		case 3:
			addressLength = 16;
			const dataView = new DataView(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			const ipv6 = [];
			for (let i = 0; i < 8; i++) {
				ipv6.push(dataView.getUint16(i * 2).toString(16));
			}
			addressValue = ipv6.join(':');
			break;
		default:
			return {
				hasError: true,
				message: `invild  addressType is ${addressType}`,
			};
	}
	if (!addressValue) {
		return {
			hasError: true,
			message: `addressValue is empty, addressType is ${addressType}`,
		};
	}

	return {
		hasError: false,
		addressRemote: addressValue,
		addressType,
		portRemote,
		rawDataIndex: addressValueIndex + addressLength,
		vlessVersion: version,
		isUDP,
	};
}

async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log) {
	let remoteChunkCount = 0;
	let chunks = [];
	let vlessHeader = vlessResponseHeader;
	let hasIncomingData = false;
	await remoteSocket.readable
		.pipeTo(
			new WritableStream({
				start() {
				},
				async write(chunk, controller) {
					hasIncomingData = true;
					if (webSocket.readyState !== WS_READY_STATE_OPEN) {
						controller.error(
							'webSocket.readyState is not open, maybe close'
						);
					}
					if (vlessHeader) {
						webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
						vlessHeader = null;
					} else {
						webSocket.send(chunk);
					}
				},
				close() {
					log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
				},
				abort(reason) {
					console.error(`remoteConnection!.readable abort`, reason);
				},
			})
		)
		.catch((error) => {
			console.error(
				`remoteSocketToWS has exception `,
				error.stack || error
			);
			safeCloseWebSocket(webSocket);
		});
	if (hasIncomingData === false && retry) {
		log(`retry`)
		retry();
	}
}

function base64ToArrayBuffer(base64Str) {
	if (!base64Str) {
		return { error: null };
	}
	try {
		base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
		const decode = atob(base64Str);
		const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
		return { earlyData: arryBuffer.buffer, error: null };
	} catch (error) {
		return { error };
	}
}


const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
function safeCloseWebSocket(socket) {
	try {
		if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
			socket.close();
		}
	} catch (error) {
		console.error('safeCloseWebSocket error', error);
	}
}

async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {

	let isVlessHeaderSent = false;
	const transformStream = new TransformStream({
		start(controller) {

		},
		transform(chunk, controller) {
			for (let index = 0; index < chunk.byteLength;) {
				const lengthBuffer = chunk.slice(index, index + 2);
				const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
				const udpData = new Uint8Array(
					chunk.slice(index + 2, index + 2 + udpPakcetLength)
				);
				index = index + 2 + udpPakcetLength;
				controller.enqueue(udpData);
			}
		},
		flush(controller) {
		}
	});
	transformStream.readable.pipeTo(new WritableStream({
		async write(chunk) {
			const resp = await fetch('https://1.1.1.1/dns-query',
				{
					method: 'POST',
					headers: {
						'content-type': 'application/dns-message',
					},
					body: chunk,
				})
			const dnsQueryResult = await resp.arrayBuffer();
			const udpSize = dnsQueryResult.byteLength;
			const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
			if (webSocket.readyState === WS_READY_STATE_OPEN) {
				log(`doh success and dns message length is ${udpSize}`);
				if (isVlessHeaderSent) {
					webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
				} else {
					webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
					isVlessHeaderSent = true;
				}
			}
		}
	})).catch((error) => {
		log('dns udp has error' + error)
	});

	const writer = transformStream.writable.getWriter();

	return {
		write(chunk) {
			writer.write(chunk);
		}
	};
}
