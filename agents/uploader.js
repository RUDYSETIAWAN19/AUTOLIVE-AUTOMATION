const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');

class YouTubeUploader {
    async upload(videoPath, metadata, log, db, userId) {
        log(`[Uploader] Mengupload ke YouTube: ${metadata.judul}`);
        
        // Ambil user dari database untuk mendapatkan access token
        const user = db.data.users.find(u => u.id === userId);
        if (!user || !user.youtube_access_token) {
            throw new Error('YouTube tidak terhubung atau token tidak ditemukan');
        }
        
        // Cek apakah token masih valid, refresh jika perlu
        let accessToken = user.youtube_access_token;
        const tokenExpiry = new Date(user.youtube_token_expiry);
        if (Date.now() > tokenExpiry.getTime()) {
            log('[Uploader] Token expired, mencoba refresh...');
            const { refreshAccessToken } = require('../routes/youtube');
            const newToken = await refreshAccessToken(userId, db);
            if (!newToken) throw new Error('Gagal refresh token, silakan hubungkan ulang YouTube');
            accessToken = newToken;
            log('[Uploader] Token berhasil diperbarui');
        }
        
        // Upload video ke YouTube menggunakan resumable upload
        const videoSize = (await fs.stat(videoPath)).size;
        const uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable';
        
        // Metadata video
        const metadataBody = {
            snippet: {
                title: metadata.judul,
                description: metadata.deskripsi,
                tags: metadata.hashtag.split(' '),
                categoryId: '22' // Blog / Vlog
            },
            status: {
                privacyStatus: 'public',
                selfDeclaredMadeForKids: false
            }
        };
        
        // 1. Dapatkan upload URL
        const resumableRes = await axios({
            method: 'POST',
            url: uploadUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Length': videoSize,
                'X-Upload-Content-Type': 'video/mp4'
            },
            data: metadataBody
        });
        
        const uploadSessionUrl = resumableRes.headers.location;
        if (!uploadSessionUrl) throw new Error('Gagal mendapatkan upload session URL');
        
        // 2. Upload file video
        const videoStream = fs.createReadStream(videoPath);
        const uploadRes = await axios({
            method: 'PUT',
            url: uploadSessionUrl,
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': videoSize
            },
            data: videoStream,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        const videoId = uploadRes.data.id;
        const youtubeUrl = `https://youtu.be/${videoId}`;
        log(`[Uploader] Upload sukses: ${youtubeUrl}`);
        return youtubeUrl;
    }
}

module.exports = YouTubeUploader;
