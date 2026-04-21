const AIProvider = require('../AIProvider');

/**
 * Provider Replicate — exemple pour brancher Real-ESRGAN ou autre modèle d'upscaling.
 * À implémenter quand un vrai upscaling est nécessaire.
 */
class ReplicateProvider extends AIProvider {
  get name() { return 'replicate'; }

  async enhance(inputPath, options = {}) {
    // TODO: appeler l'API Replicate avec le modèle nightmareai/real-esrgan
    throw new Error('ReplicateProvider non encore implémenté. Configurez REPLICATE_API_TOKEN.');
  }
}

module.exports = ReplicateProvider;
