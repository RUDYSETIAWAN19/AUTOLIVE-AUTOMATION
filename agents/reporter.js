const fs = require('fs-extra');
class WhatsAppReporter {
  async send(video, log) {
    const msg = `✅ Upload: ${video.title}\nURL: ${video.youtube_url}`;
    await fs.appendFile('logs/whatsapp.log', new Date().toISOString()+' '+msg+'\n');
    log('[Reporter] Laporan disimpan');
  }
}
module.exports = WhatsAppReporter;
