const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(exec);
class VideoEditor {
  async edit(inputPath, outputDir, log) {
    log(`[Editor] Edit ${inputPath}`);
    const output = path.join(outputDir, `edited_${Date.now()}.mp4`);
    try { await execPromise('ffmpeg -version'); } catch(e) { await fs.copy(inputPath, output); return output; }
    await execPromise(`ffmpeg -i "${inputPath}" -vf "crop=ih*9/16:ih,scale=1080:1920" -preset ultrafast -c:a copy "${output}" -y`);
    return output;
  }
}
module.exports = VideoEditor;
