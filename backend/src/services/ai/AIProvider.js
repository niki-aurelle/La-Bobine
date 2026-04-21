/**
 * Interface abstraite pour les providers IA.
 * Tout nouveau provider doit implémenter cette classe.
 */
class AIProvider {
  get name() { throw new Error('name() non implémenté'); }

  /**
   * @param {string} inputPath  Chemin local de l'image originale
   * @param {object} options    Options spécifiques au provider
   * @returns {Promise<{outputPath: string, metadata: object}>}
   */
  async enhance(inputPath, options = {}) {
    throw new Error('enhance() non implémenté');
  }
}

module.exports = AIProvider;
