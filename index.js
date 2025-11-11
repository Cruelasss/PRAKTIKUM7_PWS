 const express = require('express');
const crypto = require('crypto'); // Import modul crypto untuk keamanan
const app = express();
const port = 3000;

// Middleware untuk memparsing body JSON pada request POST
app.use(express.json());

// Simulasi database in-memory untuk menyimpan API Keys
// Di aplikasi nyata, ini harus disimpan di database seperti MongoDB atau PostgreSQL.
const apiKeysDatabase = {};

/**
 * Fungsi untuk menghasilkan API Key yang aman menggunakan crypto.
 * Key yang dihasilkan adalah string hex acak.
 * @param {number} length Panjang byte acak sebelum diubah menjadi hex string.
 * @returns {string} API Key yang unik dan aman.
 */
function generateApiKey(length = 32) {
    // 32 bytes menghasilkan string hex 64 karakter (32 * 2)
    return crypto.randomBytes(length).toString('hex');
}

// --- ENDPOINTS ---

// 1. Endpoint untuk halaman utama (original)
app.get('/', (req, res) => {
    res.send('Aplikasi berjalan. Gunakan /api/keys untuk generate key baru.');
});

// 2. Endpoint POST untuk membuat API Key baru
app.post('/api/keys', (req, res) => {
    // Dalam aplikasi nyata, Anda akan memverifikasi otentikasi pengguna di sini
    const userId = req.body.userId || 'guest_user';
    const keyName = req.body.name || 'Untitled Key';

    const newKey = generateApiKey();

    // Simpan key ke database (simulasi)
    apiKeysDatabase[newKey] = {
        userId: userId,
        name: keyName,
        createdAt: new Date().toISOString(),
        isActive: true
    };

    console.log(`Key baru dibuat untuk User ${userId}: ${keyName}`);
    console.log(`Total Keys dalam database: ${Object.keys(apiKeysDatabase).length}`);

    // Mengembalikan key yang baru dibuat kepada pengguna.
    // PENTING: Key hanya boleh ditampilkan sekali!
    res.status(201).json({
        message: 'API Key berhasil dibuat. Simpan key ini dengan aman.',
        apiKey: newKey, // Key yang baru dihasilkan
        details: apiKeysDatabase[newKey]
    });
});

// 3. Endpoint GET untuk simulasi validasi key (Cth: mencari pengguna berdasarkan key)
app.get('/api/keys/:apiKey', (req, res) => {
    const requestedKey = req.params.apiKey;

    if (apiKeysDatabase[requestedKey]) {
        // Hapus detail sensitif sebelum ditampilkan (Cth: userId)
        const keyInfo = { ...apiKeysDatabase[requestedKey] };
        delete keyInfo.userId; // JANGAN tampilkan ID pengguna publik

        res.json({
            message: 'Key ditemukan dan valid.',
            keyDetails: keyInfo
        });
    } else {
        res.status(404).json({
            message: 'API Key tidak valid atau tidak ditemukan.'
        });
    }
});


app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log('Endpoint untuk generate key: POST http://localhost:3000/api/keys');
});