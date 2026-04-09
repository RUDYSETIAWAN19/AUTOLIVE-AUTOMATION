class ContentGenerator {
  async generate(tema, log) {
    log(`[ContentGen] Generate metadata untuk ${tema}`);
    return { judul: `🔥 VIRAL! ${tema.toUpperCase()} 🔥`, deskripsi: `Konten viral tentang ${tema}. Subscribe!`, hashtag: `#${tema.replace(/ /g,'')} #Shorts` };
  }
}
module.exports = ContentGenerator;
