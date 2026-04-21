const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const sharp = require('sharp');
const AIProvider = require('../AIProvider');
const logger = require('../../../utils/logger');

/**
 * Provider OpenAI — utilise GPT-4o Vision pour analyser l'image
 * et sharp pour les améliorations locales (netteté, contraste, luminosité).
 *
 * Note : OpenAI ne fait pas d'upscaling natif. Ce provider combine :
 * - Analyse IA (tags, description, suggestions de qualité via GPT-4o)
 * - Traitement image local (sharp) pour amélioration réelle
 *
 * Pour un upscaling vrai, brancher ReplicateProvider ou TopazProvider.
 */
class OpenAIProvider extends AIProvider {
  constructor() {
    super();
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  get name() { return 'openai'; }

  async enhance(inputPath, options = {}) {
    const {
      sharpen = true,
      brightness = 1.05,
      contrast = 1.1,
      saturation = 1.05,
      outputFormat = 'jpeg',
      outputQuality = 90,
    } = options;

    const outputDir = path.join('uploads', 'enhanced');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputFilename = `enhanced-${Date.now()}-${path.basename(inputPath)}`;
    const outputPath = path.join(outputDir, outputFilename);

    let pipeline = sharp(inputPath);

    if (sharpen) pipeline = pipeline.sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 });

    pipeline = pipeline.modulate({ brightness, saturation });

    pipeline = pipeline.linear(contrast, -(128 * (contrast - 1)));

    await pipeline
      .toFormat(outputFormat, { quality: outputQuality })
      .toFile(outputPath);

    // Analyse optionnelle GPT-4o (description du vêtement)
    let aiAnalysis = null;
    if (process.env.OPENAI_API_KEY && options.analyze) {
      try {
        aiAnalysis = await this._analyzeImage(inputPath);
      } catch (err) {
        logger.warn('Analyse GPT-4o échouée (non bloquant):', err.message);
      }
    }

    return {
      outputPath,
      outputUrl: `/uploads/enhanced/${outputFilename}`,
      metadata: { provider: this.name, aiAnalysis, appliedOperations: { sharpen, brightness, contrast, saturation } },
    };
  }

  async _analyzeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).replace('.', '') || 'jpeg';

    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/${ext};base64,${base64}`, detail: 'low' },
          },
          {
            type: 'text',
            text: 'Décris brièvement ce vêtement (type, couleur, style). Réponse en français, max 2 phrases.',
          },
        ],
      }],
    });

    return response.choices[0]?.message?.content || null;
  }
}

module.exports = OpenAIProvider;
