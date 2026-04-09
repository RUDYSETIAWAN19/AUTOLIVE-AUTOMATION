const axios = require('axios');
class ViralFinder {
  constructor(apiKey) { this.apiKey = apiKey; this.cache = new Map(); }
  async find(keyword, source, maxDuration, log) {
    log(`[ViralFinder] Mencari ${keyword}`);
    const cacheKey = keyword;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    if (source === 'youtube') {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(keyword)}&type=video&videoDuration=short&videoLicense=creativeCommon&key=${this.apiKey}`;
      const response = await axios.get(searchUrl);
      const videoIds = response.data.items.map(i=>i.id.videoId).filter(id=>id);
      if (!videoIds.length) return [];
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${this.apiKey}`;
      const statsRes = await axios.get(statsUrl);
      const statsMap = new Map(statsRes.data.items.map(i=>[i.id, i.statistics]));
      const results = response.data.items.filter(item => parseInt(statsMap.get(item.id.videoId)?.viewCount||0) > 5000).map(item => ({ url: `https://youtu.be/${item.id.videoId}`, title: item.snippet.title, views: parseInt(statsMap.get(item.id.videoId)?.viewCount||0) }));
      this.cache.set(cacheKey, results);
      return results;
    }
    return [];
  }
}
module.exports = ViralFinder;
