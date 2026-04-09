const schedule = require('node-schedule');
const fs = require('fs-extra');
const path = require('path');
const ViralFinder = require('./viralFinder');
const Downloader = require('./downloader');
const VideoEditor = require('./editor');
const ContentGenerator = require('./contentGen');
const Uploader = require('./uploader');
const Reporter = require('./reporter');
const Cleaner = require('./fileCleaner');

let currentJob = null, running = false, queue = [], active = 0;
const MAX_CONCURRENT = 2;
const finder = new ViralFinder(process.env.YOUTUBE_API_KEY);
const downloader = new Downloader();
const editor = new VideoEditor();
const gen = new ContentGenerator();
const uploader = new Uploader();
const reporter = new Reporter();
const cleaner = new Cleaner();

function log(m) { const line = new Date().toISOString()+' [INFO] '+m+'\n'; fs.appendFileSync(process.env.LOG_FILE||'logs/app.log', line); console.log(line); }

async function processTask(task, db) {
  active++;
  try {
    const videoPath = await downloader.download(task.url, './temp', log);
    const editedPath = await editor.edit(videoPath, './output', log);
    const meta = await gen.generate(task.keyword, log);
    const ytUrl = await uploader.upload(editedPath, meta, log);
    db.data.videos.push({ id: Date.now()+''+Math.random(), user_id: task.user_id, title: meta.judul, youtube_url: ytUrl, status: 'completed', uploaded_at: new Date().toISOString() });
    await db.write();
    await reporter.send({ title: meta.judul, youtube_url: ytUrl, theme: task.keyword }, log);
  } catch(e) { log('Error: '+e.message); }
  finally { await cleaner.clean(log); active--; processQueue(db); }
}

async function processQueue(db) { if (queue.length && active < MAX_CONCURRENT) processTask(queue.shift(), db); }

async function startAutomation(db) {
  if (running) return;
  running = true;
  const settingsPath = './config/workflow_settings.json';
  let settings = { keyword: 'viral', mode: 'once' };
  if (fs.existsSync(settingsPath)) settings = fs.readJsonSync(settingsPath);
  const run = async () => {
    const videos = await finder.find(settings.keyword, 'youtube', 60, log);
    for (let v of videos) queue.push({ url: v.url, keyword: settings.keyword, user_id: '1' });
    processQueue(db);
  };
  if (settings.mode === 'once') await run();
  else if (settings.mode === 'hourly') currentJob = schedule.scheduleJob('0 * * * *', () => run());
}
function stopAutomation() { if (currentJob) currentJob.cancel(); running = false; queue = []; active = 0; }
function isRunning() { return running; }
module.exports = { startAutomation, stopAutomation, isRunning };
