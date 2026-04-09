const fs = require('fs-extra');
const path = require('path');
class FileCleaner {
  async clean(log) {
    await fs.emptyDir(path.join(__dirname, '../temp'));
    await fs.emptyDir(path.join(__dirname, '../output'));
    log('[FileCleaner] Semua file video dihapus (zero storage policy)');
  }
}
module.exports = FileCleaner;
