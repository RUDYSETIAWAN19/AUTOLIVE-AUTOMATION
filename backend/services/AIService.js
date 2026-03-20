const OpenAI = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Generate video script
  async generateScript(topic, tone = 'engaging', language = 'en') {
    try {
      const prompt = `Write a ${tone} video script about "${topic}". 
      The script should be around 60 seconds when spoken.
      Include a hook in the first 5 seconds, main content, and a call to action.
      Format: Plain text without any markdown.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a professional video script writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating script:', error);
      throw error;
    }
  }

  // Generate title
  async generateTitle(script, keywords = []) {
    try {
      const prompt = `Generate 5 viral, clickbait titles for this video script.
      Script: "${script.substring(0, 200)}..."
      Keywords: ${keywords.join(', ')}
      
      Return only the titles, one per line, no numbers.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a YouTube title expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      return response.choices[0].message.content.split('\n').filter(t => t.trim());
    } catch (error) {
      console.error('Error generating title:', error);
      throw error;
    }
  }

  // Generate description
  async generateDescription(script, title) {
    try {
      const prompt = `Write a SEO-optimized YouTube description for this video.
      Title: "${title}"
      Script: "${script}"
      
      Include:
      - Engaging summary
      - Key points
      - Timestamps
      - Call to action
      - Relevant hashtags
      
      Make it around 200 words.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a YouTube SEO expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating description:', error);
      throw error;
    }
  }

  // Generate hashtags
  async generateHashtags(topic, title, count = 10) {
    try {
      const prompt = `Generate ${count} trending and relevant hashtags for this video.
      Topic: "${topic}"
      Title: "${title}"
      
      Return only hashtags, one per line.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a social media hashtag expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 200
      });

      return response.choices[0].message.content.split('\n').filter(t => t.trim());
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw error;
    }
  }

  // Generate voiceover
  async generateVoiceover(script, voice = 'en-US-Neural2-D') {
    try {
      // Using Google Cloud Text-to-Speech or similar service
      // This is a placeholder implementation
      const response = await axios.post(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          input: { text: script },
          voice: { languageCode: 'en-US', name: voice },
          audioConfig: { audioEncoding: 'MP3' }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_TTS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const audioContent = response.data.audioContent;
      const audioPath = path.join(__dirname, '../../uploads/audio', `${uuidv4()}.mp3`);
      
      // Save audio file
      await fs.writeFile(audioPath, Buffer.from(audioContent, 'base64'));
      
      return audioPath;
    } catch (error) {
      console.error('Error generating voiceover:', error);
      throw error;
    }
  }

  // Generate images for video
  async generateImages(prompt, count = 5) {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024'
      });

      const imageUrls = response.data.map(img => img.url);
      
      // Download images
      const imagePaths = [];
      for (const url of imageUrls) {
        const imagePath = path.join(__dirname, '../../uploads/images', `${uuidv4()}.png`);
        const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(imagePath, imageResponse.data);
        imagePaths.push(imagePath);
      }

      return imagePaths;
    } catch (error) {
      console.error('Error generating images:', error);
      throw error;
    }
  }

  // Generate viral hook
  async generateHook(topic, style = 'curiosity') {
    try {
      const prompt = `Create a powerful ${style} hook for a video about "${topic}".
      The hook should be under 10 seconds when spoken and grab attention immediately.
      Provide 3 options.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a viral content expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 150
      });

      return response.choices[0].message.content.split('\n').filter(h => h.trim());
    } catch (error) {
      console.error('Error generating hook:', error);
      throw error;
    }
  }

  // Analyze viral potential
  async analyzeViralPotential(script, title) {
    try {
      const prompt = `Analyze the viral potential of this video content.
      Title: "${title}"
      Script: "${script.substring(0, 500)}..."
      
      Rate from 1-10:
      - Hook strength
      - Emotional impact
      - Shareability
      - Trending potential
      
      Provide brief explanation for each rating.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a viral content analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing viral potential:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
