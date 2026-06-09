import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys'
import express from 'express'
import pino from 'pino'
import QRCode from 'qrcode'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logger    = pino({ level: 'silent' })
const app       = express()
app.use(express.json())

let sock          = null
let isConnected   = false
let currentQR     = null      // string QR mentah dari Baileys
let connectedPhone = null     // nomor WA yang terhubung
let connectedSince = null     // timestamp saat terhubung

// ─── WhatsApp Connection ───────────────────────────────────────────────────────

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(
        join(__dirname, 'auth_info')
    )
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: true,
        generateHighQualityLinkPreview: false,
        browser: ['SMKN1 WA Gateway', 'Chrome', '120.0.0'],
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            currentQR = qr
            console.log('\n[WA Gateway] QR baru tersedia — buka /admin/whatsapp untuk scan\n')
        }

        if (connection === 'open') {
            isConnected    = true
            currentQR      = null
            connectedSince = new Date().toISOString()
            connectedPhone = sock.user?.id?.split(':')[0] ?? null
            console.log(`[WA Gateway] ✅ Terhubung sebagai ${connectedPhone}`)
        }

        if (connection === 'close') {
            isConnected    = false
            connectedPhone = null
            connectedSince = null
            const code      = lastDisconnect?.error?.output?.statusCode
            const reconnect = code !== DisconnectReason.loggedOut

            console.log(`[WA Gateway] ⚠️  Terputus (kode: ${code}). Reconnect: ${reconnect}`)

            if (reconnect) {
                setTimeout(connectToWhatsApp, 3000)
            } else {
                console.log('[WA Gateway] ❌ Logout. Hapus auth_info/ dan restart.')
            }
        }
    })
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatPhone(phone) {
    const digits = String(phone).replace(/\D/g, '')
    if (digits.startsWith('0'))  return '62' + digits.slice(1)
    if (digits.startsWith('62')) return digits
    return '62' + digits
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

// Status koneksi — dipolling React tiap 3 detik
app.get('/health', (_req, res) => {
    res.json({
        connected      : isConnected,
        has_qr         : currentQR !== null,
        phone          : connectedPhone,
        connected_since: connectedSince,
    })
})

// QR code dalam bentuk base64 PNG — ditampilkan di halaman admin
app.get('/qr', async (_req, res) => {
    if (isConnected) {
        return res.status(200).json({ connected: true, qr: null })
    }

    if (!currentQR) {
        return res.status(202).json({ connected: false, qr: null, message: 'QR belum tersedia, tunggu sebentar...' })
    }

    try {
        const base64 = await QRCode.toDataURL(currentQR, {
            width          : 300,
            margin         : 2,
            color          : { dark: '#1e293b', light: '#ffffff' },
        })
        res.json({ connected: false, qr: base64 })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Kirim pesan — dipanggil Laravel setiap ada absensi
app.post('/send', async (req, res) => {
    const { phone, message } = req.body

    if (!phone || !message) {
        return res.status(422).json({ error: 'Field phone dan message wajib diisi.' })
    }

    if (!isConnected || !sock) {
        return res.status(503).json({ error: 'WhatsApp belum terhubung.' })
    }

    try {
        const jid = formatPhone(phone) + '@s.whatsapp.net'
        await sock.sendMessage(jid, { text: message })
        console.log(`[WA Gateway] 📤 Terkirim → ${jid}`)
        res.json({ success: true, to: jid })
    } catch (err) {
        console.error('[WA Gateway] ❌ Gagal:', err.message)
        res.status(500).json({ error: err.message })
    }
})

// Logout / reset sesi — dipanggil dari tombol "Putuskan Koneksi"
app.post('/logout', async (_req, res) => {
    try {
        if (sock) await sock.logout()
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.WA_GATEWAY_PORT || 3001
app.listen(PORT, () => {
    console.log(`[WA Gateway] 🚀 Berjalan di http://localhost:${PORT}`)
})

connectToWhatsApp()
