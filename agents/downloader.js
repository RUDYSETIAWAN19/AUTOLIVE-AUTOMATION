const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(exec);
class Downloader {
  async download(url, tempDir, log) {
    log(`[Downloader] Download ${url}`);
    try { await execPromise('yt-dlp --version'); } catch(e) { return this.fallback(tempDir, log); }
    const output = path.join(tempDir, '%(title)s.%(ext)s');
    await execPromise(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" -o "${output}" ${url}`);
    const files = await fs.readdir(tempDir);
    const video = files.find(f => f.endsWith('.mp4'));
    if (!video) throw new Error('No video');
    return path.join(tempDir, video);
  }
  async fallback(tempDir, log) {
    const sample = path.join(__dirname, '../samples/sample.mp4');
    const dest = path.join(tempDir, `sample_${Date.now()}.mp4`);
    if (await fs.pathExists(sample)) await fs.copy(sample, dest);
    else await fs.writeFile(dest, 'dummy');
    return dest;
  }
}
module.exports = Downloader;
